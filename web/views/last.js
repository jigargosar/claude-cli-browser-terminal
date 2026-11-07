// View "last": the response page of the last turn: thinking, tool calls, hooks and text, rendered as markdown.
import { render } from "../markdown.js";

const reply = document.getElementById("reply");
const status = document.getElementById("reply-status");
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

// Two pages inside #reply, which stays the scroller. live follows the latest turn and holds the comments. old shows
// an older turn, read-only. Stepping back only hides live, so its text nodes, and the comments on them, survive.
const live = document.createElement("div");
const old = document.createElement("div");
old.hidden = true;
live.innerHTML = reply.innerHTML;
reply.replaceChildren(live, old);

// Each code block gets a bar with Wrap and Copy. Blocks start wrapped. marked has no extension for this
// (marked.js.org, Known Extensions).
const addCodeBars = (root) => {
  for (const pre of root.querySelectorAll("pre")) {
    // A page grows by appending, so a block may already have its bar.
    if (pre.parentElement.classList.contains("code-block")) continue;
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
// A one-line hint for a tool call: what Claude said it does, or its main argument.
const toolHint = ({ input = {} }) => input.description ?? input.command ?? input.file_path ?? input.pattern ?? input.skill ?? "";
const nodeOf = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild;
};
// One collapsed block per thinking, tool call or hook.
const fold = (cls, summary, body) => nodeOf(`<details class="${cls}"><summary>${escape(summary)}</summary>${body}</details>`);

// One node per item. Text renders block by block, so an unclosed code fence in one cannot swallow the next.
const itemNode = (item) => {
  if (item.kind === "reply") {
    const node = document.createElement("div");
    node.className = "turn-text";
    node.innerHTML = render(item.text);
    return node;
  }
  if (item.kind === "thinking") return fold("turn-thinking", "Thinking", render(item.text));
  if (item.kind === "tool_use") {
    const hint = toolHint(item);
    return fold("turn-tool", hint ? `${item.name}: ${hint}` : item.name, pre(JSON.stringify(item.input, null, 2)));
  }
  if (item.kind === "hook") {
    const failed = item.exitCode ? ` (exit ${item.exitCode})` : "";
    return fold("turn-hook", `Hook ${item.event}: ${item.name ?? item.command}${failed}`, pre(item.command) + pre(item.output) + pre(item.stderr));
  }
  return null;
};

// A page grows only by appending: a new item adds its node at the end, and a tool result goes into its tool call's
// block. No node already on the page is replaced or moved, so the comments on its text survive. Only the one rule moves.
const newPage = (root) => {
  root.replaceChildren();
  return { root, rule: document.createElement("hr"), seen: new Set(), tools: new Map(), lastTool: null };
};
const append = (page, item) => {
  if (page.seen.has(item.id)) return;
  page.seen.add(item.id);
  if (item.kind === "tool_result") {
    for (const r of item.results) {
      const block = page.tools.get(r.toolUseId);
      if (!block) continue;
      block.insertAdjacentHTML("beforeend", pre(resultText(r.content)));
      addCodeBars(block);
    }
    return;
  }
  const node = itemNode(item);
  if (!node) return;
  page.root.append(node);
  addCodeBars(node);
  if (item.kind === "tool_use") {
    page.tools.set(item.toolUseId, node);
    page.lastTool = node;
  }
};
// The rule splits the work from the answer: it sits right after the last tool call, once text follows it.
const placeRule = (page) => {
  let next = page.lastTool?.nextElementSibling;
  while (next && (next === page.rule || !next.classList.contains("turn-text"))) next = next.nextElementSibling;
  if (next) page.lastTool.after(page.rule);
  else page.rule.remove();
};
const fill = (page, turn) => {
  for (const item of turn) append(page, item);
  placeRule(page);
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
// live's scroll while an older page is open, restored on the way back.
let liveScroll = 0;
// Tells the comments whether the open page is read-only (main.js).
let setReadOnly = () => {};
// The turn's first item names it on the page, so new output can tell growth from a new turn.
let shownTurn = null;

const latestId = () => turns.at(-1)?.findLast((i) => OUTPUT.has(i.kind)).id ?? null;
// The open page's turn, e.g. "Turn 5 of 12".
const turnLabel = () => (turns.length ? `Turn ${(viewing ?? turns.length - 1) + 1} of ${turns.length}` : "");
const updateNav = () => {
  const at = viewing ?? turns.length - 1;
  label.textContent = turnLabel();
  prevButton.disabled = at <= 0;
  nextButton.disabled = at >= turns.length - 1;
  newBadge.hidden = viewing === null || latestId() === leftAt;
};

// The live page. Null until a turn is drawn, and while a new turn's crossfade waits to swap.
let livePage = null;

// live follows the latest turn, on view or hidden. Returns true only for a new turn, so main.js clears the comments
// then and never while the turn grows.
const drawLive = (turn) => {
  const last = turn.findLast((i) => OUTPUT.has(i.kind));
  status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
  // The same turn grew: append, so the text on the page, its comments and its scroll stay as they are. During a
  // pending crossfade there is no page yet; the swap draws the turn as it is by then.
  if (turn[0].id === shownTurn) {
    if (livePage) fill(livePage, turn);
    return false;
  }
  shownTurn = turn[0].id;
  livePage = null;
  // Hidden behind an older page: no crossfade, and the older page keeps its scroll. live starts at its top on return.
  if (viewing !== null) {
    livePage = newPage(live);
    fill(livePage, turn);
    liveScroll = 0;
    return true;
  }
  // A new turn starts at its top. The swap runs in a view transition, so the old page crossfades into the new one
  // (base.css) and the text never slides past the eye. It draws the latest turn, which may have grown meanwhile.
  const swap = () => {
    livePage = newPage(live);
    fill(livePage, turns.at(-1));
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

// Back to live: old empties, live shows at the scroll it had, and comments work again.
const followLatest = () => {
  viewing = null;
  old.hidden = true;
  old.replaceChildren();
  live.hidden = false;
  reply.scrollTop = liveScroll;
  setReadOnly(false);
};

// Called on every new item. Returns true when live shows a new turn, so main.js clears the comments only then.
export const show = (items) => {
  turns = turnsOf(items);
  if (viewing !== null && viewing >= turns.length - 1) followLatest();
  let changed;
  if (!turns.length) {
    shownTurn = null;
    livePage = null;
    live.innerHTML = '<p class="empty">Replies from this session show up here.</p>';
    status.textContent = "Waiting for the first reply";
    changed = true;
  } else {
    changed = drawLive(turns.at(-1));
  }
  updateNav();
  return changed;
};

// A new session, e.g. /clear: its turns are not the old ones, so the page follows the latest again.
export const reset = () => {
  if (viewing !== null) followLatest();
};

const go = (to) => {
  const at = viewing ?? turns.length - 1;
  if (to < 0 || to >= turns.length || to === at) return;
  if (to === turns.length - 1) {
    followLatest();
  } else {
    if (viewing === null) {
      leftAt = latestId();
      liveScroll = reply.scrollTop;
      setReadOnly(true);
    }
    viewing = to;
    fill(newPage(old), turns[to]);
    live.hidden = true;
    old.hidden = false;
    reply.scrollTop = 0;
  }
  updateNav();
};

export const init = ({ readOnly }) => {
  setReadOnly = readOnly;
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
