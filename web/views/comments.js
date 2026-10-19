// View "comments": select reply text, comment on it, repeat, then send all comments to claude as one message.
// Approved mockup: docs/mockups/comments.html. Highlights use the CSS Custom Highlight API, so the reply's DOM is never
// changed. A new reply replaces the DOM and clears the comments, sent or not.
import { computePosition, autoUpdate, offset, flip, shift, inline } from "@floating-ui/dom";
import { sentenceAt } from "../sentence.js";

const pane = document.getElementById("reply-pane");
const reply = document.getElementById("reply");
const pick = document.getElementById("comment-pick");
const replyButton = document.getElementById("comment-reply");
const doneButton = document.getElementById("comment-done");
const box = document.getElementById("comment-box");
const input = box.querySelector("textarea");
const submit = document.getElementById("comment-submit");

/** @type {{range: Range, text: string, comment: string}[]} */
const comments = [];
const highlight = new Highlight();
CSS.highlights.set("comment", highlight);
// The sentence a single click picked. A highlight, not the browser selection, so a later press inside it starts a new
// selection instead of dragging the text.
const picked = new Highlight();
CSS.highlights.set("picked", picked);

// Floating UI anchor: the box of the range under the mouse, at the mouse's x. Kept relative to that box, so it
// follows the text while #reply scrolls. A line has one box per piece of inline markup (a link, code, bold), so the
// box must hold the mouse's x too. A mouse off the range, e.g. at the end of a drag, takes its last box.
const near = (range, x, y) => {
  const rects = [...range.getClientRects()];
  const found = rects.findIndex((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  const line = found === -1 ? rects.length - 1 : found;
  const dx = Math.min(Math.max(x - rects[line].left, 0), rects[line].width);
  const rect = () => {
    // A reflow, e.g. a divider drag, can leave the range fewer lines.
    const now = range.getClientRects();
    const r = now[Math.min(line, now.length - 1)];
    return new DOMRect(r.left + dx, r.top, 0, r.height);
  };
  return { getBoundingClientRect: rect, getClientRects: () => [rect()] };
};

const hits = (range, { clientX: x, clientY: y }) =>
  [...range.getClientRects()].some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
const same = (a, b) =>
  a.compareBoundaryPoints(Range.START_TO_START, b) === 0 && a.compareBoundaryPoints(Range.END_TO_END, b) === 0;
// The range the open Reply and Done popup belongs to.
let shown = null;

// One floating element at a time follows one anchor. Floating UI places it and keeps it there while #reply scrolls.
// Resolves once it is first placed. Only then can it take focus.
let stopFollowing = () => {};
const show = (el, anchor) =>
  new Promise((placed) => {
    stopFollowing();
    // Invisible until placed, so it never shows at its last position and then jumps.
    el.style.visibility = "hidden";
    el.hidden = false;
    stopFollowing = autoUpdate(anchor, el, async () => {
      const { x, y } = await computePosition(anchor, el, {
        placement: "top",
        strategy: "fixed",
        middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
      });
      Object.assign(el.style, { left: `${x}px`, top: `${y}px`, visibility: "" });
      placed();
    });
  });
const hideAll = () => {
  stopFollowing();
  picked.clear();
  pick.hidden = true;
  box.hidden = true;
};

// The comment being written: a new one (no index) or an existing one.
let editing = null;
const openBox = async (range, anchor, index) => {
  editing = { range, index };
  input.value = index === undefined ? "" : comments[index].comment;
  pick.hidden = true;
  await show(box, anchor);
  input.focus();
};

const render = () => {
  highlight.clear();
  for (const c of comments) highlight.add(c.range);
  submit.hidden = comments.length === 0;
  submit.textContent = `Send ${comments.length} comment${comments.length === 1 ? "" : "s"} · Ctrl+Enter`;
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

reply.addEventListener("mouseup", (event) => {
  const selection = getSelection();
  let range;
  if (selection.isCollapsed) {
    const index = comments.findIndex((c) => hits(c.range, event));
    if (index !== -1) {
      const { range: commented } = comments[index];
      return openBox(commented, near(commented, event.clientX, event.clientY), index);
    }
    // A single click picks the sentence under it. Links and buttons keep their click.
    if (event.detail !== 1 || event.target.closest("a, button")) return;
    range = sentenceAt(event.clientX, event.clientY);
    if (!range) return;
    // A click on the sentence whose popup is open leaves it where it is.
    if (!pick.hidden && same(range, shown)) return;
    picked.add(range);
  } else {
    // A drag that starts on the picked sentence kept its highlight (see mousedown).
    picked.clear();
    range = selection.getRangeAt(0).cloneRange();
    if (!reply.contains(range.commonAncestorContainer)) return;
  }
  box.hidden = true;
  const anchor = near(range, event.clientX, event.clientY);
  replyButton.onclick = () => {
    selection.removeAllRanges();
    return openBox(range, anchor);
  };
  // Done: the picked text is handled. It is sent as a comment that says "Done", with no box to write in.
  doneButton.onclick = () => {
    selection.removeAllRanges();
    comments.push({ range, text: range.toString(), comment: "Done" });
    hideAll();
    render();
  };
  shown = range;
  return show(pick, anchor);
});

// A press outside the floating elements closes them. An open comment box saves first, so a stray click never loses
// what was typed. A press on the sentence whose popup is open keeps it open.
document.addEventListener("mousedown", (event) => {
  if (pick.contains(event.target) || box.contains(event.target)) return;
  if (!pick.hidden && hits(shown, event)) return;
  if (!box.hidden) save();
  else hideAll();
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
    event.preventDefault();
    save();
  } else if (event.key === "Escape") {
    hideAll();
  }
});

export const clear = () => {
  comments.length = 0;
  editing = null;
  hideAll();
  render();
};

export const init = ({ send }) => {
  const sendAll = () => {
    if (comments.length === 0) return;
    send(message());
    comments.length = 0;
    render();
  };
  submit.addEventListener("click", sendAll);
  // Ctrl+Enter anywhere in the reply pane sends. In the comment box it saves that comment first.
  // The terminal is outside the pane, so its Ctrl+Enter still goes to claude.
  pane.addEventListener("keydown", (event) => {
    if (!(event.key === "Enter" && event.ctrlKey)) return;
    event.preventDefault();
    if (!box.hidden) save();
    sendAll();
  });
};
