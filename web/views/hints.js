// Find mode: F labels every sentence in view, and typing a label picks that sentence. F or Esc ends it. Approved
// mockup: docs/mockups/label-hints.html. Scrolling, or opening or closing a fold, also ends it: the sentences move.
// views/comments.js decides when a key belongs here.
import { sentencesIn } from "../sentence.js";

const pane = document.getElementById("reply-pane");
const reply = document.getElementById("reply");

// Home row first, without f, which starts and ends the mode.
const LETTERS = "asdjklghqwertyuiopzxcvbnm";
// One letter each when they suffice; otherwise two letters each, so no label is the start of another.
const labelsFor = (n) => {
  if (n <= LETTERS.length) return [...LETTERS.slice(0, n)];
  const out = [];
  for (const a of LETTERS) for (const b of LETTERS) out.push(a + b);
  return out.slice(0, n);
};

let hints = null;
let typed = "";
let onPick = null;

export const active = () => hints !== null;

export const hide = () => {
  for (const h of hints ?? []) h.el.remove();
  hints = null;
  typed = "";
};

// Labels the sentences whose first line is in view. pick gets the Range a label names.
export const show = (pick) => {
  onPick = pick;
  const view = reply.getBoundingClientRect();
  const inView = sentencesIn(reply).filter((range) => {
    const first = range.getClientRects()[0];
    return first && first.width > 0 && first.bottom > view.top && first.top < view.bottom;
  });
  const labels = labelsFor(inView.length);
  hints = inView.map((range, i) => {
    const first = range.getClientRects()[0];
    const el = document.createElement("span");
    el.className = "hint";
    el.textContent = labels[i].toUpperCase();
    Object.assign(el.style, { left: `${first.left}px`, top: `${first.top}px` });
    pane.append(el);
    return { range, label: labels[i], el };
  });
};

// A key while the labels show. Every key belongs to the mode, so none leaks to the reply.
export const key = (event) => {
  event.preventDefault();
  const k = event.key.toLowerCase();
  if (k === "escape" || k === "f") return hide();
  if (!LETTERS.includes(k)) return;
  typed += k;
  const left = hints.filter((h) => h.label.startsWith(typed));
  if (left.length === 0) return hide();
  if (left.length === 1 && left[0].label === typed) {
    const { range } = left[0];
    hide();
    return onPick(range);
  }
  for (const h of hints) {
    const on = h.label.startsWith(typed);
    h.el.hidden = !on;
    if (on) h.el.innerHTML = `<b>${typed.toUpperCase()}</b>${h.label.slice(typed.length).toUpperCase()}`;
  }
};

reply.addEventListener("scroll", hide);
reply.addEventListener("toggle", hide, true);
