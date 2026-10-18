// View "comments": select reply text, comment on it, repeat, then send all comments to claude as one message.
// Approved mockup: docs/mockups/comments.html. Highlights use the CSS Custom Highlight API, so the reply's DOM is never
// changed. A new reply replaces the DOM and clears the comments, sent or not.
import { computePosition, autoUpdate, offset, flip, shift, inline } from "@floating-ui/dom";
import { sentenceAt } from "../sentence.js";

const pane = document.getElementById("reply-pane");
const reply = document.getElementById("reply");
const replyButton = document.getElementById("comment-reply");
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

// One floating element at a time follows one range. Floating UI places it and keeps it there while #reply scrolls.
let stopFollowing = () => {};
const show = (el, range) => {
  stopFollowing();
  // Invisible until placed, so it never shows at its last position and then jumps.
  el.style.visibility = "hidden";
  el.hidden = false;
  const anchor = { getBoundingClientRect: () => range.getBoundingClientRect(), getClientRects: () => range.getClientRects() };
  stopFollowing = autoUpdate(anchor, el, async () => {
    const { x, y } = await computePosition(anchor, el, {
      placement: "top",
      strategy: "fixed",
      middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
    });
    Object.assign(el.style, { left: `${x}px`, top: `${y}px`, visibility: "" });
  });
};
const hideAll = () => {
  stopFollowing();
  picked.clear();
  replyButton.hidden = true;
  box.hidden = true;
};

// The comment being written: a new one (no index) or an existing one.
let editing = null;
const openBox = (range, index) => {
  editing = { range, index };
  input.value = index === undefined ? "" : comments[index].comment;
  replyButton.hidden = true;
  show(box, range);
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
    const index = comments.findIndex((c) =>
      [...c.range.getClientRects()].some(
        (r) => event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom,
      ),
    );
    if (index !== -1) return openBox(comments[index].range, index);
    // A single click picks the sentence under it. Links and buttons keep their click.
    if (event.detail !== 1 || event.target.closest("a, button")) return;
    range = sentenceAt(event.clientX, event.clientY);
    if (!range) return;
    picked.add(range);
  } else {
    range = selection.getRangeAt(0).cloneRange();
    if (!reply.contains(range.commonAncestorContainer)) return;
  }
  box.hidden = true;
  show(replyButton, range);
  replyButton.onclick = () => {
    selection.removeAllRanges();
    openBox(range);
  };
});

// A press anywhere outside the floating elements cancels them.
document.addEventListener("mousedown", (event) => {
  if (replyButton.contains(event.target) || box.contains(event.target)) return;
  hideAll();
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
