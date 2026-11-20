// File references in Claude's replies, e.g. `web/main.js:83`, become links. A click peeks at the lines, a double click
// opens the file at that line in the editor. The server resolves, reads and opens them (server.mjs, /refs/*). The page never
// navigates. A span wraps each reference before its node is on the page, so no text node on the page is replaced
// later and the comments' ranges survive (views/last.js). Resolving only adds attributes.
import { autoUpdate, computePosition, flip, hide, offset, shift, size } from "@floating-ui/dom";
import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { unifiedMergeView } from "@codemirror/merge";
import { EditorState, RangeSetBuilder, Text } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { Decoration, EditorView, lineNumbers } from "@codemirror/view";

// A path with an extension, with an optional drive, ./ or ~/ start, then an optional line or range: `:83`, `:83-90`,
// `#L83`, `#L83-L90`. Not inside a longer word or a URL.
const REF =
  /(?<![\w@/\\.:-])((?:[A-Za-z]:[\\/]|\.{1,2}[\\/]|~[\\/])?(?:[\w@.-]+[\\/])*[\w@-][\w@.-]*\.[A-Za-z]\w{0,7})(?:(?::|#L)(\d+)(?:-L?(\d+))?)?(?![\w/\\])/g;

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

// The peek: the whole file in a read-only CodeMirror view, wrapped, scrolled to the referenced lines, which are marked.
// Uncommitted changes show as a diff against HEAD. A click on a reference opens it. A click outside, or Esc, closes it.
// A double click on a reference opens the file in the editor.
const peek = document.createElement("div");
peek.className = "ref-peek";
peek.hidden = true;
peek.innerHTML = '<div class="ref-peek-head"></div><div class="ref-peek-body"></div>';
document.body.append(peek);
const peekHead = peek.querySelector(".ref-peek-head");
const peekBody = peek.querySelector(".ref-peek-body");
let shownFor = null;
let view = null;
let stopFollowing = null;

const markedLine = Decoration.line({ class: "cm-ref-line" });
const markLines = (doc, line, end) => {
  const marks = new RangeSetBuilder();
  for (let n = line; n <= end; n++) marks.add(doc.line(n).from, doc.line(n).from, markedLine);
  return EditorView.decorations.of(marks.finish());
};

const closePeek = () => {
  peek.hidden = true;
  shownFor = null;
  view?.destroy();
  view = null;
  stopFollowing?.();
  stopFollowing = null;
};

// Below the reference, or above when there is more room. Never wider or taller than the room left in the viewport.
const place = async (span) => {
  const { x, y, middlewareData } = await computePosition(span, peek, {
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [
      offset(6),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply: ({ availableWidth, availableHeight }) => {
          peek.style.maxWidth = `${availableWidth}px`;
          peek.style.maxHeight = `${availableHeight}px`;
        },
      }),
      hide(),
    ],
  });
  // A reference scrolled out of the reply, or on a page no longer shown, hides the peek until it is back.
  const hidden = middlewareData.hide.referenceHidden;
  Object.assign(peek.style, { left: `${x}px`, top: `${y}px`, visibility: hidden ? "hidden" : "" });
};

const openPeek = async (span) => {
  closePeek();
  shownFor = span;
  const path = span.dataset.path;
  const res = await fetch(`/refs/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  const file = await res.json();
  const language = await LanguageDescription.matchFilename(languages, path.split("/").pop())?.load();
  // Another click may have come in while the file loaded.
  if (shownFor !== span) return;
  // Git can hand back LF where the disk has CRLF. Only real changes may show.
  const text = file.text.replaceAll("\r\n", "\n");
  const original = file.head?.replaceAll("\r\n", "\n");
  const changed = original != null && original !== text;
  const doc = Text.of(text.split("\n"));
  const line = Math.min(Number(span.dataset.line) || 0, doc.lines);
  const end = Math.min(Math.max(Number(span.dataset.end) || line, line), doc.lines);
  peekHead.textContent = `${label(span)}${changed ? " · uncommitted changes" : ""} · double click the link to open it in the editor`;
  view = new EditorView({
    parent: peekBody,
    state: EditorState.create({
      doc,
      extensions: [
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.lineWrapping,
        lineNumbers(),
        oneDark,
        language ?? [],
        line ? markLines(doc, line, end) : [],
        changed ? unifiedMergeView({ original, mergeControls: false }) : [],
      ],
    }),
  });
  peek.style.visibility = "hidden";
  peek.hidden = false;
  await place(span);
  // Closed while it was being placed.
  if (shownFor !== span) return;
  if (line) view.dispatch({ effects: EditorView.scrollIntoView(doc.line(line).from, { y: "center" }) });
  // Follows the reference while the reply scrolls or the window resizes.
  stopFollowing = autoUpdate(span, peek, () => place(span));
};

const openInEditor = async (span) => {
  const res = await fetch("/refs/open", {
    method: "POST",
    body: JSON.stringify({ path: span.dataset.path, line: span.dataset.line }),
  });
  if (!res.ok) throw new Error(await res.text());
};

// A click opens the peek once the double-click window has passed, so a double click only opens the editor.
const DOUBLE_CLICK_MS = 250;
let pendingPeek = null;
reply.addEventListener("click", (event) => {
  const span = event.target.closest(".file-ref.ok");
  // A drag that ends on a reference selects text. Only a plain click opens.
  if (!span || event.detail !== 1 || !getSelection().isCollapsed) return;
  clearTimeout(pendingPeek);
  if (span === shownFor) return closePeek();
  pendingPeek = setTimeout(() => openPeek(span), DOUBLE_CLICK_MS);
});
reply.addEventListener("dblclick", (event) => {
  const span = event.target.closest(".file-ref.ok");
  if (!span) return;
  clearTimeout(pendingPeek);
  // A double click selects the word under it.
  getSelection().removeAllRanges();
  closePeek();
  return openInEditor(span);
});
document.addEventListener("mousedown", (event) => {
  if (peek.hidden || peek.contains(event.target) || event.target.closest(".file-ref.ok")) return;
  closePeek();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !peek.hidden) closePeek();
});
