// View "last": the response page of the last turn: thinking, tool calls, hooks and text, rendered as markdown.
import { render } from "../markdown.js";

const reply = document.getElementById("reply");
const status = document.getElementById("reply-status");
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

// Each code block gets a bar with Wrap and Copy. Blocks start wrapped. marked has no extension for this
// (marked.js.org, Known Extensions).
const addCodeBars = () => {
  for (const pre of reply.querySelectorAll("pre")) {
    pre.classList.add("wrap");
    const block = document.createElement("div");
    block.className = "code-block";
    block.innerHTML =
      '<div class="code-bar"><button type="button" data-code="wrap" aria-pressed="true">Wrap</button>' +
      '<button type="button" data-code="copy">Copy</button></div>';
    pre.replaceWith(block);
    block.prepend(pre);
  }
};

// One listener serves every block. #reply itself is never replaced, so it outlives each reply.
reply.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-code]");
  if (!button) return;
  const pre = button.closest(".code-block").querySelector("pre");
  if (button.dataset.code === "wrap") {
    button.setAttribute("aria-pressed", pre.classList.toggle("wrap"));
  } else {
    await navigator.clipboard.writeText(pre.textContent);
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy"), 1200);
  }
});

// A response page is one turn, in transcript order. A turn runs from its prompt to the next. Claude's output is text
// (reply), thinking and tool calls; a turn without output has no page, so a fresh prompt keeps the previous page until
// Claude answers.
const OUTPUT = new Set(["reply", "thinking", "tool_use"]);
const turnsOf = (items) => {
  const turns = [[]];
  for (const i of items) {
    if (i.kind === "prompt") turns.push([]);
    else turns.at(-1).push(i);
  }
  return turns.filter((turn) => turn.some((i) => OUTPUT.has(i.kind)));
};

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pre = (s) => (s ? `<pre>${escape(s)}</pre>` : "");
const resultText = (content) =>
  typeof content === "string" ? content : Array.isArray(content) ? content.map((b) => b.text ?? `[${b.type}]`).join("\n") : "";
// One collapsed block per thinking, tool call or hook. data-id keeps it open across redraws.
const fold = (item, cls, summary, body) =>
  `<details class="${cls}" data-id="${escape(item.id)}"><summary>${escape(summary)}</summary>${body}</details>`;
// A one-line hint for a tool call: what Claude said it does, or its main argument.
const toolHint = ({ input = {} }) => input.description ?? input.command ?? input.file_path ?? input.pattern ?? input.skill ?? "";

// Two sections, split by one rule: the work (thinking, tool calls with their results, hooks, and the text written
// around tool calls), then the answer, the text after the last tool call. Each text block renders on its own, so an
// unclosed code fence in one cannot swallow the next.
const pageHtml = (turn) => {
  const lastTool = turn.findLastIndex((i) => i.kind === "tool_use");
  const isAnswer = (i, at) => i.kind === "reply" && at > lastTool;
  const results = new Map(turn.filter((i) => i.kind === "tool_result").flatMap((i) => i.results).map((r) => [r.toolUseId, r]));
  const work = turn.map((i, at) => {
    if (isAnswer(i, at)) return "";
    if (i.kind === "reply") return render(i.text);
    if (i.kind === "thinking") return fold(i, "turn-thinking", "Thinking", render(i.text));
    if (i.kind === "tool_use") {
      const hint = toolHint(i);
      const result = results.get(i.toolUseId);
      return fold(i, "turn-tool", hint ? `${i.name}: ${hint}` : i.name,
        pre(JSON.stringify(i.input, null, 2)) + (result ? pre(resultText(result.content)) : ""));
    }
    if (i.kind === "hook") {
      const failed = i.exitCode ? ` (exit ${i.exitCode})` : "";
      return fold(i, "turn-hook", `Hook ${i.event}: ${i.name ?? i.command}${failed}`, pre(i.command) + pre(i.output) + pre(i.stderr));
    }
    return "";
  });
  const answer = turn.filter(isAnswer).map((i) => render(i.text));
  return [work.join(""), answer.join("")].filter(Boolean).join("<hr>");
};

// Blocks the reader opened. A redraw replaces the HTML, so it reopens them. toggle does not bubble, hence capture.
const opened = new Set();
reply.addEventListener(
  "toggle",
  (event) => {
    const id = event.target.dataset?.id;
    if (id) event.target.open ? opened.add(id) : opened.delete(id);
  },
  true,
);
const draw = (html) => {
  reply.innerHTML = html;
  for (const el of reply.querySelectorAll("details[data-id]")) el.open = opened.has(el.dataset.id);
  addCodeBars();
};

// Back and forward: ‹ › beside the gear, or ← → while the reply has focus. viewing is the open page's index, or null
// while the page follows the latest turn. An older page stays put while new output arrives; "new" then shows, and
// clicking it, or stepping past the last page, follows the latest again.
const prevButton = document.getElementById("turn-prev");
const nextButton = document.getElementById("turn-next");
const label = document.getElementById("turn-label");
const newBadge = document.getElementById("turn-new");
let turns = [];
let viewing = null;
// The latest output's id when the reader left the latest page. Newer output turns on "new".
let leftAt = null;
// Asked before a step. False keeps the page, e.g. when the reader keeps its comments (main.js).
let mayLeave = () => true;
// The turn's first item names it on the page, so new output can tell growth from a new turn.
let shownTurn = null;

const latestId = () => turns.at(-1)?.findLast((i) => OUTPUT.has(i.kind)).id ?? null;
const updateNav = () => {
  const at = viewing ?? turns.length - 1;
  label.textContent = turns.length ? `Turn ${at + 1} of ${turns.length}` : "";
  prevButton.disabled = at <= 0;
  nextButton.disabled = at >= turns.length - 1;
  newBadge.hidden = viewing === null || latestId() === leftAt;
};

// Draws a turn's page. Returns true when the visible page changed.
const showTurn = (turn, { follow }) => {
  const last = turn.findLast((i) => OUTPUT.has(i.kind));
  const html = pageHtml(turn);
  status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
  // The same turn grew: the page updates in place and keeps its scroll, so reading goes on undisturbed.
  if (follow && turn[0].id === shownTurn) {
    draw(html);
    return true;
  }
  opened.clear();
  shownTurn = turn[0].id;
  // Another turn starts at its top. The swap runs in a view transition, so the old page crossfades into the new one
  // (base.css) and the text never slides past the eye.
  const swap = () => {
    draw(html);
    reply.scrollTop = 0;
  };
  if (document.hidden) {
    swap();
  } else {
    // The browser aborts the transition when the tab hides before it starts. The swap still runs, so only the crossfade
    // is lost. Any other failure goes on to the error banner.
    document.startViewTransition(swap).ready.catch((error) => {
      if (error.name !== "InvalidStateError") throw error;
    });
  }
  return true;
};

// Called on every new item. Returns true when the visible page changed, so main.js clears the comments only then.
export const show = (items) => {
  turns = turnsOf(items);
  if (viewing !== null && viewing >= turns.length) viewing = null;
  let changed = false;
  if (!turns.length) {
    shownTurn = null;
    reply.innerHTML = '<p class="empty">Replies from this session show up here.</p>';
    status.textContent = "Waiting for the first reply";
    changed = true;
  } else if (viewing === null) {
    changed = showTurn(turns.at(-1), { follow: true });
  }
  updateNav();
  return changed;
};

// A new session, e.g. /clear: its turns are not the old ones, so the page follows the latest again.
export const reset = () => {
  viewing = null;
};

const go = (to) => {
  const at = viewing ?? turns.length - 1;
  if (to < 0 || to >= turns.length || to === at || !mayLeave()) return;
  if (viewing === null) leftAt = latestId();
  viewing = to === turns.length - 1 ? null : to;
  showTurn(turns[to], { follow: false });
  updateNav();
};

export const init = ({ leave }) => {
  mayLeave = leave;
};

prevButton.addEventListener("click", () => go((viewing ?? turns.length - 1) - 1));
nextButton.addEventListener("click", () => go((viewing ?? turns.length - 1) + 1));
newBadge.addEventListener("click", () => go(turns.length - 1));
reply.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
  const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
  if (!step) return;
  e.preventDefault();
  go((viewing ?? turns.length - 1) + step);
});
