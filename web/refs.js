// File references in Claude's replies, e.g. `web/main.js:83`, become links. Hover shows the lines, a click opens the
// file at that line in the editor. The server resolves, reads and opens them (server.mjs, /refs/*). The page never
// navigates. A span wraps each reference before its node is on the page, so no text node on the page is replaced
// later and the comments' ranges survive (views/last.js). Resolving only adds attributes.
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import { highlight } from "./markdown.js";

// A path with an extension, with an optional drive, ./ or ~/ start, then an optional line or range: `:83`, `:83-90`,
// `#L83`, `#L83-L90`. Not inside a longer word or a URL.
const REF =
  /(?<![\w@/\\.:-])((?:[A-Za-z]:[\\/]|\.{1,2}[\\/]|~[\\/])?(?:[\w@.-]+[\\/])*[\w@-][\w@.-]*\.[A-Za-z]\w{0,7})(?:(?::|#L)(\d+)(?:-L?(\d+))?)?(?![\w/\\])/g;
// Lines shown around a referenced line, and from the top of a file referenced without one.
const CONTEXT = 4;
const TOP = 20;

const reply = document.getElementById("reply");

const setRef = (span, [, path, line, end]) => {
  span.dataset.ref = path;
  if (line) span.dataset.line = line;
  if (end) span.dataset.end = end;
};

// Wraps every reference in root's prose and inline code. Code blocks and web links stay as they are.
export const linkify = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest("pre, a, .file-ref") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const text of texts) {
    const matches = [...text.data.matchAll(REF)];
    if (!matches.length) continue;
    const parts = [];
    let at = 0;
    for (const m of matches) {
      parts.push(text.data.slice(at, m.index));
      const span = document.createElement("span");
      span.className = "file-ref";
      span.textContent = m[0];
      setRef(span, m);
      parts.push(span);
      at = m.index + m[0].length;
    }
    parts.push(text.data.slice(at));
    text.replaceWith(...parts);
  }
  // Markdown links to files (markdown.js) carry the whole href: split it into path and line.
  for (const span of root.querySelectorAll(".file-ref:not([data-line])")) {
    const m = [...span.dataset.ref.matchAll(REF)][0];
    if (m) setRef(span, m);
  }
  return resolve(root);
};

// Only references the server finds in the project folder turn into links. A path outside the folder shows red, so a
// change outside the project stands out. It neither peeks nor opens.
const resolve = async (root) => {
  const spans = [...root.querySelectorAll(".file-ref:not(.ok):not(.outside)")];
  if (!spans.length) return;
  const refs = [...new Set(spans.map((s) => s.dataset.ref))];
  const res = await fetch("/refs/resolve", { method: "POST", body: JSON.stringify({ refs }) });
  if (!res.ok) throw new Error(`/refs/resolve: ${res.status} ${await res.text()}`);
  const { resolved } = await res.json();
  const byRef = new Map(refs.map((r, i) => [r, resolved[i]]));
  for (const span of spans) {
    const found = byRef.get(span.dataset.ref);
    if (found?.outside) span.classList.add("outside");
    else if (found) {
      span.dataset.path = found.path;
      span.classList.add("ok");
    }
  }
};

const label = (span) => {
  const { path, line, end } = span.dataset;
  return line ? `${path}:${line}${end ? `-${end}` : ""}` : path;
};

// The peek: the referenced lines, a few around them, with the referenced ones marked.
const peek = document.createElement("div");
peek.className = "ref-peek";
peek.hidden = true;
document.body.append(peek);
let shownFor = null;
let hideTimer = null;

const showPeek = async (span) => {
  shownFor = span;
  const res = await fetch(`/refs/file?path=${encodeURIComponent(span.dataset.path)}`);
  if (!res.ok) throw new Error(`${span.dataset.path}: ${res.status} ${await res.text()}`);
  const lines = (await res.text()).split("\n");
  // The mouse may have moved on while the file loaded.
  if (shownFor !== span) return;
  const line = Math.min(Number(span.dataset.line) || 0, lines.length);
  const end = Math.min(Math.max(Number(span.dataset.end) || line, line), lines.length);
  const from = line ? Math.max(1, line - CONTEXT) : 1;
  const to = line ? Math.min(lines.length, end + CONTEXT) : Math.min(lines.length, TOP);
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i).join("\n");
  const code = highlight(lines.slice(from - 1, to).join("\n"), span.dataset.path.split(".").pop());
  peek.innerHTML =
    `<div class="ref-peek-head"></div><div class="ref-peek-body"><pre class="gutter"></pre>` +
    `<pre class="code"><code class="hljs">${code}</code></pre></div>`;
  peek.querySelector(".ref-peek-head").textContent = `${label(span)} · click opens it in the editor`;
  peek.querySelector(".gutter").textContent = numbers;
  if (line) {
    const mark = document.createElement("div");
    mark.className = "mark";
    mark.style.top = `calc(var(--peek-pad) + ${line - from} * 1lh)`;
    mark.style.height = `calc(${end - line + 1} * 1lh)`;
    peek.querySelector(".code").append(mark);
  }
  peek.style.visibility = "hidden";
  peek.hidden = false;
  const { x, y } = await computePosition(span, peek, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });
  Object.assign(peek.style, { left: `${x}px`, top: `${y}px`, visibility: "" });
};

const hidePeek = () => {
  hideTimer = setTimeout(() => {
    peek.hidden = true;
    shownFor = null;
  }, 200);
};

reply.addEventListener("mouseover", (event) => {
  const span = event.target.closest(".file-ref.ok");
  if (!span) return;
  clearTimeout(hideTimer);
  if (span !== shownFor) return showPeek(span);
});
reply.addEventListener("mouseout", (event) => {
  if (event.target.closest(".file-ref.ok") && !event.relatedTarget?.closest?.(".file-ref.ok")) hidePeek();
});
peek.addEventListener("mouseenter", () => clearTimeout(hideTimer));
peek.addEventListener("mouseleave", hidePeek);

reply.addEventListener("click", async (event) => {
  const span = event.target.closest(".file-ref.ok");
  // A drag that ends on a reference selects text. Only a plain click opens.
  if (!span || !getSelection().isCollapsed) return;
  const res = await fetch("/refs/open", {
    method: "POST",
    body: JSON.stringify({ path: span.dataset.path, line: span.dataset.line }),
  });
  if (!res.ok) throw new Error(await res.text());
});
