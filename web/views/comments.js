// View "comments": select reply text, comment on it, repeat, then send all comments to claude as one message.
// Approved mockup: docs/mockups/comments.html. Highlights use the CSS Custom Highlight API, so the reply's DOM is never
// changed. A growing turn only appends to the page (views/last.js). A new turn replaces it and clears the comments,
// sent or not.
import { computePosition, offset, flip, shift, inline } from "@floating-ui/dom";
import { createElement } from "lucide";
import { sentenceAt } from "../sentence.js";
import { PHRASES } from "../phrases.js";
import * as hints from "./hints.js";

const pane = document.getElementById("reply-pane");
const reply = document.getElementById("reply");
const pick = document.getElementById("comment-pick");
const box = document.getElementById("comment-box");
const input = box.querySelector("textarea");
const submit = document.getElementById("comment-submit");

/** @type {{range: Range, text: string, comment: string}[]} */
const comments = [];
const highlight = new Highlight();
CSS.highlights.set("comment", highlight);
// Shows the pick (see `current`). The browser selection can't: the comment box takes it when it gets the focus.
const picked = new Highlight();
CSS.highlights.set("picked", picked);

// Floating UI anchor: the box of the range under the mouse, at the mouse's x, read once. A line has one box per piece
// of inline markup (a link, code, bold), so the box must hold the mouse's x too. A mouse off the range, e.g. at the
// end of a drag, takes its last box.
const near = (range, x, y) => {
  const rects = [...range.getClientRects()];
  const found = rects.findIndex((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  const r = rects[found === -1 ? rects.length - 1 : found];
  const rect = new DOMRect(Math.min(Math.max(x, r.left), r.right), r.top, 0, r.height);
  return { getBoundingClientRect: () => rect, getClientRects: () => [rect] };
};

const hits = (range, { clientX: x, clientY: y }) =>
  [...range.getClientRects()].some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
const same = (a, b) =>
  a.compareBoundaryPoints(Range.START_TO_START, b) === 0 && a.compareBoundaryPoints(Range.END_TO_END, b) === 0;
// The one pick: a clicked sentence, or a selection in the reply. The highlight and the popup read only this. The
// browser selection is an input to it, and stays until a popup button is pressed, so Ctrl+C still copies it.
let current = null;
// True while an older page is open (setReadOnly).
let readOnly = false;

// Floating UI places the element at the anchor once. It stays there while #reply scrolls. Resolves once it is placed.
// Only then can it take focus.
const show = async (el, anchor) => {
  // Invisible until placed, so it never shows at its last position and then jumps.
  el.style.visibility = "hidden";
  el.hidden = false;
  const { x, y } = await computePosition(anchor, el, {
    placement: "top",
    strategy: "fixed",
    middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
  });
  Object.assign(el.style, { left: `${x}px`, top: `${y}px`, visibility: "" });
};
const hideAll = () => {
  picked.clear();
  pick.hidden = true;
  box.hidden = true;
  hints.hide();
};

// The comment being written: a new one (no index) or an existing one.
let editing = null;
const openBox = async (range, anchor, index) => {
  input.value = index === undefined ? "" : comments[index].comment;
  editing = { range, index, before: input.value };
  pick.hidden = true;
  await show(box, anchor);
  input.focus();
};

const render = () => {
  highlight.clear();
  for (const c of comments) highlight.add(c.range);
  submit.hidden = readOnly || comments.length === 0;
  submit.textContent = `Send ${comments.length} comment${comments.length === 1 ? "" : "s"} · Alt+Enter`;
};

// An empty comment deletes it. That is the only way to delete one.
const save = () => {
  const text = input.value.trim();
  const { range, index } = editing;
  if (index === undefined) {
    if (text) comments.push({ range, text: range.toString(), comment: text });
  } else if (text) {
    comments[index].comment = text;
  } else {
    comments.splice(index, 1);
  }
  editing = null;
  hideAll();
  render();
};

// Numbered list: each quote as a blockquote, its comment under it.
const message = () =>
  comments
    .map((c, i) => `${i + 1}. ${c.text.trim().split("\n").map((line) => `> ${line}`).join("\n   ")}\n   ${c.comment}`)
    .join("\n\n");

// The grid's buttons, built once. Each one acts on the current pick: its text becomes the comment, with no box to write
// in; an entry with no text (Reply) opens the box. The key, tiny in the corner, does the same (see the keydown below).
const run = (phrase) => {
  getSelection().removeAllRanges();
  if (!phrase.text) return openBox(current, pickAnchor);
  comments.push({ range: current, text: current.toString(), comment: phrase.text });
  hideAll();
  render();
};
const byKey = new Map(PHRASES.map((p) => [p.key, p]));
for (const phrase of PHRASES) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = phrase.text ? `${phrase.label}: ${phrase.text}` : phrase.label;
  button.setAttribute("aria-label", phrase.label);
  const key = document.createElement("span");
  key.className = "key";
  key.textContent = phrase.key.toUpperCase();
  button.append(createElement(phrase.icon), key);
  button.onclick = () => run(phrase);
  pick.append(button);
}

// The grid sits right above the picked sentence (or right below it), at the mouse's x: its anchor spans the
// sentence's full height, so the grid never covers any of its lines.
const span = (range, x) => {
  const bounds = range.getBoundingClientRect();
  const rect = new DOMRect(x, bounds.top, 0, bounds.height);
  return { getBoundingClientRect: () => rect, getClientRects: () => [rect] };
};
let pickAnchor = null;

// The pick changes only here. A pick that is already on view keeps its popup where it is.
const pickRange = (range, anchor) => {
  if (!pick.hidden && same(range, current)) return;
  if (!box.hidden) save();
  current = range;
  pickAnchor = anchor;
  picked.clear();
  picked.add(range);
  return show(pick, span(range, anchor.getBoundingClientRect().x));
};

// The browser selection, when it is text in the reply.
const selected = () => {
  const selection = getSelection();
  if (selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0).cloneRange();
  if (!reply.contains(range.commonAncestorContainer) || range.getClientRects().length === 0) return null;
  return range;
};

// A drag changes the selection on every move, so its end is read on mouseup. A selection made any other way, by
// keyboard or by script, is read on selectionchange, with the popup at its end. This handler never changes the
// selection, so it can't trigger itself.
let pressed = false;
document.addEventListener("mousedown", () => (pressed = true), true);
window.addEventListener("mouseup", () => (pressed = false), true);
document.addEventListener("selectionchange", () => {
  if (pressed || readOnly) return;
  const range = selected();
  if (range) return pickRange(range, near(range, Infinity, 0));
});

reply.addEventListener("mouseup", (event) => {
  if (readOnly) return;
  const range = selected();
  if (range) return pickRange(range, near(range, event.clientX, event.clientY));
  const index = comments.findIndex((c) => hits(c.range, event));
  if (index !== -1) {
    const { range: commented } = comments[index];
    return openBox(commented, near(commented, event.clientX, event.clientY), index);
  }
  // A single click picks the sentence under it. Links and buttons keep their click.
  if (event.detail !== 1 || event.target.closest("a, button")) return;
  const sentence = sentenceAt(event.clientX, event.clientY);
  if (sentence) return pickRange(sentence, near(sentence, event.clientX, event.clientY));
});

// A press outside the floating elements closes them. An open comment box saves first, so a stray click never loses
// what was typed.
document.addEventListener("mousedown", (event) => {
  if (pick.contains(event.target) || box.contains(event.target)) return;
  if (!box.hidden) save();
  else hideAll();
});

// A label names a sentence: pick it as a click near its start would.
const pickLabeled = (range) => {
  getSelection().removeAllRanges();
  const first = range.getClientRects()[0];
  return pickRange(range, near(range, first.left + 8, first.top + first.height / 2));
};

// Every key checks the mode first, and each mode owns its keys. Only keys that reach the pane, so a focused terminal
// keeps its keys. Box: the textarea owns every key (below). Find: the labels show (views/hints.js). Grid: a sentence
// is picked; each entry's key presses it, and Esc closes the grid and drops the pick. Reading: F starts find mode.
pane.addEventListener("keydown", (event) => {
  if (readOnly || !box.hidden || event.ctrlKey || event.altKey || event.metaKey) return;
  if (hints.active()) return hints.key(event);
  const key = event.key.toLowerCase();
  if (!pick.hidden) {
    if (key === "escape") {
      event.preventDefault();
      getSelection().removeAllRanges();
      return hideAll();
    }
    const phrase = byKey.get(key);
    if (!phrase) return;
    event.preventDefault();
    return run(phrase);
  }
  if (key !== "f") return;
  event.preventDefault();
  return hints.show(pickLabeled);
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
    event.preventDefault();
    save();
  } else if (event.key === "Escape") {
    // Esc cancels. Changed text asks first, so it is never lost by accident.
    if (input.value.trim() !== editing.before.trim() && !confirm("Discard this comment's changes?")) return;
    editing = null;
    hideAll();
  }
});

// Every reload or close asks first. Comments live only in page memory.
window.addEventListener("beforeunload", (event) => event.preventDefault());

// An older page is read-only (views/last.js): no picks, no Send. The comments stay on the latest page, which is only
// hidden, so nothing is lost.
export const setReadOnly = (flag) => {
  readOnly = flag;
  if (!box.hidden) save();
  hideAll();
  render();
};

export const clear = () => {
  comments.length = 0;
  editing = null;
  hideAll();
  render();
};

export const init = ({ send }) => {
  const sendAll = () => {
    if (readOnly || comments.length === 0) return;
    send(message());
    comments.length = 0;
    render();
  };
  submit.addEventListener("click", sendAll);
  // Alt+Enter or Ctrl+Enter anywhere in the reply pane sends. In the comment box it saves that comment first.
  // Alt+Enter, because right Ctrl is the speech-to-text key.
  // The terminal is outside the pane, so its Ctrl+Enter still goes to claude.
  pane.addEventListener("keydown", (event) => {
    if (!(event.key === "Enter" && (event.altKey || event.ctrlKey))) return;
    event.preventDefault();
    if (!box.hidden) save();
    sendAll();
  });
};
