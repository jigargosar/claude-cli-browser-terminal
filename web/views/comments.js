// View "comments": select reply text, comment on it, repeat, then send all comments to claude as one message.
// Approved mockup: docs/mockups/comments.html. Highlights use the CSS Custom Highlight API, so the reply's DOM is never
// changed. A new reply replaces the DOM and clears the comments, sent or not.
//
// Popup state is one Stimulus value on the reply pane, open: none, buttons (Reply, Yes, No) or box (the comment box).
// CSS shows the part from it (base.css). The setter only writes the attribute. openValueChanged runs a microtask
// after the handler, from Stimulus's MutationObserver. The main.js focus fallback runs later still, on a setTimeout.
// Rules: each handler sets open once, last. A shown part stays invisible until placed. Focus moves only in
// openValueChanged, after placement.
import { Application, Controller } from "@hotwired/stimulus";
import { computePosition, autoUpdate, offset, flip, shift, inline } from "@floating-ui/dom";
import { sentenceAt } from "../sentence.js";

const pane = document.getElementById("reply-pane");
const reply = document.getElementById("reply");

/** @type {{range: Range, text: string, comment: string}[]} */
const comments = [];
const highlight = new Highlight();
CSS.highlights.set("comment", highlight);
// Shows the pick (see `current`). The browser selection can't: the comment box takes it when it gets the focus.
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

// Numbered list: each quote as a blockquote, its comment under it.
const message = () =>
  comments
    .map((c, i) => `${i + 1}. ${c.text.trim().split("\n").map((line) => `> ${line}`).join("\n   ")}\n   ${c.comment}`)
    .join("\n\n");

// The browser selection, when it is text in the reply.
const selected = () => {
  const selection = getSelection();
  if (selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0).cloneRange();
  if (!reply.contains(range.commonAncestorContainer) || range.getClientRects().length === 0) return null;
  return range;
};

let send;
let controller;

class Comments extends Controller {
  static targets = ["pick", "box", "input", "tip", "submit"];
  static values = { open: { type: String, default: "none" } };

  // The one pick: a clicked sentence, or a selection in the reply. The highlight and the popup read only this. The
  // browser selection is an input to it, and stays until a popup button is pressed, so Ctrl+C still copies it.
  current = null;
  // Where the open part goes: the pick's anchor, or the commented text's.
  anchor = null;
  // The comment being written: a new one (no index) or an existing one.
  editing = null;
  // The open part follows its anchor. Floating UI keeps it there while #reply scrolls.
  stopFollowing = () => {};
  // The tooltip follows its own anchor, so it never stops the popup or the box. It hides when either opens.
  stopTip = () => {};
  tipFor = undefined;
  // A drag changes the selection on every move, so its end is read on mouseup (see connect).
  pressed = false;
  // A press on the open highlight closes it (see press). Its mouseup must not pick again, nor open the comment there.
  // A drag from it still picks the new selection.
  undone = false;

  // initialize runs once per controller. connect can run more than once, so the listeners would stack there.
  initialize() {
    controller = this;
    // A selection made any other way than a drag, by keyboard or by script, is read on selectionchange, with the
    // popup at its end. This handler never changes the selection, so it can't trigger itself.
    document.addEventListener("mousedown", () => (this.pressed = true), true);
    window.addEventListener("mouseup", () => (this.pressed = false), true);
    document.addEventListener("selectionchange", () => {
      if (this.pressed) return;
      const range = selected();
      if (range) this.pickRange(range, near(range, Infinity, 0));
    });
    reply.addEventListener("mousemove", (event) => this.hover(event));
    reply.addEventListener("mouseleave", () => this.hideTip());
    // Alt+Enter or Ctrl+Enter anywhere in the reply pane sends. In the comment box it saves that comment first.
    // Alt+Enter, because right Ctrl is the speech-to-text key.
    // The terminal is outside the pane, so its Ctrl+Enter still goes to claude.
    pane.addEventListener("keydown", (event) => {
      if (!(event.key === "Enter" && (event.altKey || event.ctrlKey))) return;
      event.preventDefault();
      const writing = this.openValue === "box";
      if (writing) this.save();
      this.sendAll();
      if (writing) this.openValue = "none";
    });
  }

  // The projection of open: hide everything, then show and place the open part.
  openValueChanged(open) {
    this.hideTip();
    this.stopFollowing();
    this.stopFollowing = () => {};
    this.pickTarget.removeAttribute("data-placed");
    this.boxTarget.removeAttribute("data-placed");
    picked.clear();
    if (open === "buttons") {
      picked.add(this.current);
      this.place(this.pickTarget);
    } else if (open === "box") {
      if (this.editing.index === undefined) picked.add(this.editing.range);
      this.place(this.boxTarget, () => this.inputTarget.focus());
    }
  }

  // Places the element at this.anchor and keeps it there. It shows once placed, and only then runs `placed`.
  place(el, placed) {
    el.removeAttribute("data-placed");
    this.stopFollowing();
    const anchor = this.anchor;
    let live = true;
    let first = true;
    const stop = autoUpdate(anchor, el, async () => {
      const { x, y } = await computePosition(anchor, el, {
        placement: "top",
        strategy: "fixed",
        middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
      });
      // A placement that resolves after the part closed or moved on must not touch it.
      if (!live) return;
      Object.assign(el.style, { left: `${x}px`, top: `${y}px` });
      el.setAttribute("data-placed", "");
      if (first) {
        first = false;
        placed?.();
      }
    });
    this.stopFollowing = () => {
      live = false;
      stop();
    };
  }

  hideTip() {
    this.stopTip();
    this.stopTip = () => {};
    this.tipTarget.hidden = true;
    this.tipFor = undefined;
  }

  // Hovering over commented text shows its comment, while neither the popup nor the box is open.
  hover(event) {
    const hovered = this.openValue === "none" ? comments.find((c) => hits(c.range, event)) : undefined;
    if (hovered === this.tipFor) return;
    this.hideTip();
    if (!hovered) return;
    const tip = this.tipTarget;
    this.tipFor = hovered;
    tip.textContent = hovered.comment;
    tip.style.maxWidth = `${pane.clientWidth - 16}px`;
    const anchor = near(hovered.range, event.clientX, event.clientY);
    tip.hidden = false;
    this.stopTip = autoUpdate(anchor, tip, async () => {
      const { x, y } = await computePosition(anchor, tip, {
        placement: "top",
        strategy: "fixed",
        middleware: [inline(), offset(4), flip(), shift({ padding: 8 })],
      });
      Object.assign(tip.style, { left: `${x}px`, top: `${y}px` });
    });
  }

  render() {
    this.hideTip();
    highlight.clear();
    for (const c of comments) highlight.add(c.range);
    this.submitTarget.hidden = comments.length === 0;
    this.submitTarget.textContent = `Send ${comments.length} comment${comments.length === 1 ? "" : "s"} · Alt+Enter`;
  }

  // An empty comment deletes it. That is the only way to delete one. The caller closes the box.
  save() {
    const text = this.inputTarget.value.trim();
    const { range, index } = this.editing;
    if (index === undefined) {
      if (text) comments.push({ range, text: range.toString(), comment: text });
    } else if (text) {
      comments[index].comment = text;
    } else {
      comments.splice(index, 1);
    }
    this.editing = null;
    this.render();
  }

  sendAll() {
    if (comments.length === 0) return;
    send(message());
    comments.length = 0;
    this.render();
  }

  openBox(range, anchor, index) {
    this.inputTarget.value = index === undefined ? "" : comments[index].comment;
    this.editing = { range, index, before: this.inputTarget.value };
    this.anchor = anchor;
    this.openValue = "box";
  }

  // The pick changes only here. A pick that is already on view keeps its popup where it is.
  pickRange(range, anchor) {
    if (this.openValue === "buttons" && same(range, this.current)) return;
    if (this.openValue === "box") this.save();
    this.current = range;
    this.anchor = anchor;
    // Moving the anchor is no state change, and Stimulus skips the callback for an unchanged value.
    if (this.openValue === "buttons") {
      picked.clear();
      picked.add(range);
      return this.place(this.pickTarget);
    }
    this.openValue = "buttons";
  }

  // mouseup on #reply.
  pick(event) {
    const range = selected();
    if (range) return this.pickRange(range, near(range, event.clientX, event.clientY));
    if (this.undone) return;
    const index = comments.findIndex((c) => hits(c.range, event));
    if (index !== -1) {
      const { range: commented } = comments[index];
      return this.openBox(commented, near(commented, event.clientX, event.clientY), index);
    }
    // A single click picks the sentence under it. Links and buttons keep their click.
    if (event.detail !== 1 || event.target.closest("a, button")) return;
    const sentence = sentenceAt(event.clientX, event.clientY);
    if (sentence) return this.pickRange(sentence, near(sentence, event.clientX, event.clientY));
  }

  // A press outside the floating elements closes them. An open comment box saves first, so a stray click never loses
  // what was typed. A press on the open highlight, the one whose buttons or box show (blue pick or yellow comment),
  // closes them the same way, and its mouseup opens nothing.
  press(event) {
    if (this.pickTarget.contains(event.target) || this.boxTarget.contains(event.target)) return;
    this.hideTip();
    const open = this.openValue === "buttons" ? this.current : this.openValue === "box" ? this.editing.range : null;
    this.undone = open !== null && hits(open, event);
    if (this.undone) getSelection().removeAllRanges();
    if (this.openValue === "box") this.save();
    this.openValue = "none";
  }

  // Reply button.
  reply() {
    getSelection().removeAllRanges();
    this.openBox(this.current, this.anchor);
  }

  // Yes, No: the button's word is the comment, with no box to write in.
  word(event) {
    getSelection().removeAllRanges();
    comments.push({ range: this.current, text: this.current.toString(), comment: event.currentTarget.textContent });
    this.render();
    this.openValue = "none";
  }

  // While the popup shows, R, Y and N press Reply, Yes and No: the key is the button's first letter. Only keys that
  // reach the pane, so a focused terminal keeps its keys. Esc closes the popup and drops the pick.
  key(event) {
    if (this.openValue !== "buttons" || event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.key === "Escape") {
      event.preventDefault();
      getSelection().removeAllRanges();
      this.openValue = "none";
      return;
    }
    const key = event.key.toLowerCase();
    const button = [...this.pickTarget.querySelectorAll("button")].find((b) => b.textContent[0].toLowerCase() === key);
    if (!button) return;
    event.preventDefault();
    button.click();
  }

  // keydown in the comment box.
  type(event) {
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      this.save();
      this.openValue = "none";
    } else if (event.key === "Escape") {
      // Esc cancels. Changed text asks first, so it is never lost by accident (docs/plans/data-loss.md, case 1).
      if (this.inputTarget.value.trim() !== this.editing.before.trim() && !confirm("Discard this comment's changes?"))
        return;
      this.editing = null;
      this.openValue = "none";
    }
  }

  clear() {
    comments.length = 0;
    this.editing = null;
    this.render();
    this.openValue = "none";
  }
}

// Every reload or close asks first. Comments live only in page memory.
window.addEventListener("beforeunload", (event) => event.preventDefault());

// A new reply clears the comments. The controller connects a few microtasks after init, long before a reply arrives.
export const clear = () => controller.clear();

export const init = (deps) => {
  send = deps.send;
  Application.start().register("comments", Comments);
};
