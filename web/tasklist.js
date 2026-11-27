// The task list view: the tracking file in an editable CodeMirror view with vim keys, over the terminal pane, where the
// file peek opens. Alt+L opens and closes it. Every item with sub-bullets folds. Edits save on their own. Changes on
// disk come in as they happen. Plan: docs/tasks/task-list-view/plan.md. Server side: /tasklist in server.mjs.
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import {
  codeFolding,
  foldCode,
  foldEffect,
  foldGutter,
  foldService,
  foldable,
  foldedRanges,
  toggleFold,
  unfoldAll,
  unfoldCode,
  unfoldEffect,
} from "@codemirror/language";
import { Annotation, Transaction } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { Vim, vim } from "@replit/codemirror-vim";
import * as settings from "./settings.js";

// The path as the server resolves file references in replies (web/refs.js), so a link to it opens this view.
export const PATH = "docs/fvp-list.md";
const SAVE_DELAY_MS = 300;
// The open items, by key, in the page settings. Any other item starts folded, so the list reads as one line per item.
const OPEN_KEY = "taskListOpen";

const el = document.createElement("div");
el.className = "task-list";
el.innerHTML = `
  <div class="task-list-head">
    <span>${PATH}</span> · <span class="task-list-status">loading</span>
    · za fold · zM fold all · zR open all · Tab state · Alt+L closes
  </div>
  <div class="task-list-banner" hidden>
    <span class="task-list-banner-text"></span>
    <button type="button" data-act="mine">Keep mine</button>
    <button type="button" data-act="disk">Take the file's</button>
    <button type="button" data-act="restore" hidden>Restore the other</button>
    <button type="button" data-act="dismiss" hidden>Dismiss</button>
  </div>
  <div class="task-list-body"></div>`;
// Before the peek in the pane, at the same height, so a peek opened from a reply shows on top of the list.
document.getElementById("terminal-pane").prepend(el);
const statusEl = el.querySelector(".task-list-status");
const banner = el.querySelector(".task-list-banner");
const bannerText = el.querySelector(".task-list-banner-text");
const button = (act) => banner.querySelector(`[data-act="${act}"]`);

let view = null;
// The hash of the file as last read or written. A save names it, so the server can tell a change on disk.
let version = null;
let eol = "\n";
// Edits not yet saved, a save in flight, and a change on disk noticed meanwhile, checked after the save.
let dirty = false;
let saving = false;
let recheck = false;
let timer = null;
// Set while a change on disk and an unsaved edit wait for the user's pick. No save runs meanwhile.
let conflict = null;
// The version the user didn't pick, for one-click restore.
let other = null;
let open = new Set();

const setStatus = (text) => (statusEl.textContent = text);
export const isOpen = () => el.classList.contains("open");
export const focus = () => view?.focus();

// An item is a list line. Its fold runs from its line's end to the end of its last deeper line.
const ITEM = /^(\s*)- /;
const indentOf = (text) => text.match(/^\s*/)[0].length;
const itemFold = foldService.of((state, lineStart) => {
  const line = state.doc.lineAt(lineStart);
  const m = ITEM.exec(line.text);
  if (!m) return null;
  let end = null;
  for (let n = line.number + 1; n <= state.doc.lines; n++) {
    const next = state.doc.line(n);
    if (!next.text.trim()) continue;
    if (indentOf(next.text) <= m[1].length) break;
    end = next;
  }
  return end ? { from: line.to, to: end.to } : null;
});
// An item's key is its text without the indent and the checkbox, so a tick keeps its fold.
const keyOf = (text) => text.replace(/^\s*- (\[.\] )?/, "");

const forItems = (state, fn) => {
  const folded = [];
  foldedRanges(state).between(0, state.doc.length, (from, to) => void folded.push({ from, to }));
  for (let n = 1; n <= state.doc.lines; n++) {
    const line = state.doc.line(n);
    if (!ITEM.test(line.text)) continue;
    const range = foldable(state, line.from, line.to);
    if (!range) continue;
    const hidden = folded.some((f) => f.from < line.from && line.from <= f.to);
    const isFolded = folded.some((f) => f.from === range.from);
    fn({ line, range, hidden, isFolded });
  }
};
// The open set from what shows. An item inside a closed fold keeps the state it had.
const readOpen = (state) => {
  const next = new Set();
  forItems(state, ({ line, hidden, isFolded }) => {
    const key = keyOf(line.text);
    if (hidden ? open.has(key) : !isFolded) next.add(key);
  });
  return next;
};
// Folds every showing item that isn't open. Items inside a fold just made are left alone.
const foldClosed = () => {
  const effects = [];
  let coveredTo = -1;
  forItems(view.state, ({ line, range, hidden, isFolded }) => {
    if (hidden || isFolded || line.from <= coveredTo || open.has(keyOf(line.text))) return;
    effects.push(foldEffect.of(range));
    coveredTo = range.to;
  });
  if (effects.length) view.dispatch({ effects });
};
const saveOpen = (next) => {
  if ([...next].join("\n") === [...open].join("\n")) return;
  open = next;
  settings.set(OPEN_KEY, [...open]);
};

const external = Annotation.define();
const onUpdate = (update) => {
  const unfolded = update.transactions.flatMap((tr) => tr.effects.filter((e) => e.is(unfoldEffect)));
  const fromDisk = update.transactions.some((tr) => tr.annotation(external));
  if (update.docChanged && !fromDisk) scheduleSave();
  if (!update.docChanged && !unfolded.length && !update.transactions.some((tr) => tr.effects.some((e) => e.is(foldEffect)))) return;
  // An unfold opens its item, and shows the items inside it as they were. A change on disk may bring new items,
  // which start folded. Both need a fold, which can't be dispatched inside an update.
  if (unfolded.length || fromDisk) {
    for (const e of unfolded) open.add(keyOf(update.state.doc.lineAt(e.value.from).text));
    queueMicrotask(() => {
      foldClosed();
      saveOpen(readOpen(view.state));
    });
  } else saveOpen(readOpen(update.state));
};

const toEditor = (text) => text.replaceAll("\r\n", "\n");
const toDisk = (text) => (eol === "\n" ? text : text.replaceAll("\n", eol));
// Replaces only the part that differs, so the cursor and the folds elsewhere stay where they were.
const replaceDoc = (text, annotations) => {
  const cur = view.state.doc.toString();
  if (cur === text) return;
  let start = 0;
  while (start < cur.length && start < text.length && cur[start] === text[start]) start++;
  let endCur = cur.length;
  let endNew = text.length;
  while (endCur > start && endNew > start && cur[endCur - 1] === text[endNew - 1]) {
    endCur--;
    endNew--;
  }
  view.dispatch({ changes: { from: start, to: endCur, insert: text.slice(start, endNew) }, annotations });
};
// A change on disk is no edit of the user's. Undo skips it, so an undo never quietly reverts Claude's edit.
const takeDisk = (file) => {
  eol = file.text.includes("\r\n") ? "\r\n" : "\n";
  version = file.version;
  replaceDoc(toEditor(file.text), [external.of(true), Transaction.addToHistory.of(false)]);
};

const scheduleSave = () => {
  dirty = true;
  setStatus(conflict ? "not saved, pick a version" : "unsaved");
  clearTimeout(timer);
  if (!conflict) timer = setTimeout(save, SAVE_DELAY_MS);
};
const save = async () => {
  clearTimeout(timer);
  if (saving || conflict || !dirty) return;
  saving = true;
  dirty = false;
  setStatus("saving");
  const text = toDisk(view.state.doc.toString());
  const res = await fetch("/tasklist", { method: "PUT", body: JSON.stringify({ text, base: version }) });
  saving = false;
  if (res.status === 409) return showConflict(await res.json());
  if (!res.ok) throw new Error(`/tasklist save: ${res.status} ${await res.text()}`);
  version = (await res.json()).version;
  if (dirty) return save();
  setStatus("saved");
  if (recheck) refresh();
};

const showConflict = (file) => {
  conflict = file;
  dirty = true;
  setStatus("not saved, pick a version");
  bannerText.textContent = "The file changed on disk while you were typing. Which version wins?";
  button("mine").hidden = button("disk").hidden = false;
  button("restore").hidden = button("dismiss").hidden = true;
  banner.hidden = false;
};
const offerRestore = (text) => {
  other = text;
  bannerText.textContent = "The other version is kept until you dismiss this.";
  button("mine").hidden = button("disk").hidden = true;
  button("restore").hidden = button("dismiss").hidden = false;
};
banner.addEventListener("click", (event) => {
  const act = event.target.closest("button")?.dataset.act;
  if (act === "mine") {
    offerRestore(toEditor(conflict.text));
    version = conflict.version;
    conflict = null;
    save();
  } else if (act === "disk") {
    offerRestore(view.state.doc.toString());
    const file = conflict;
    conflict = null;
    dirty = false;
    takeDisk(file);
    setStatus("saved");
  } else if (act === "restore") {
    const text = other;
    banner.hidden = true;
    // An edit like any other: it saves, and undo takes it back.
    replaceDoc(text, []);
  } else if (act === "dismiss") {
    other = null;
    banner.hidden = true;
  }
  view.focus();
});

const fetchFile = async () => {
  const res = await fetch("/tasklist");
  if (!res.ok) throw new Error(`/tasklist: ${res.status} ${await res.text()}`);
  return res.json();
};
// A change on disk. While an edit is unsaved, the save finds out and asks. A save in flight checks after.
export const refresh = async () => {
  if (!view) return;
  if (saving || dirty) return void (recheck = true);
  recheck = false;
  const file = await fetchFile();
  if (saving || dirty) return void (recheck = true);
  if (file.version !== version) takeDisk(file);
  setStatus("saved");
};

// Vim has no fold keys of its own here. These follow vim's.
const STATES = { " ": ".", ".": "x", x: " " };
Vim.defineAction("taskState", (cm) => {
  const v = cm.cm6;
  const line = v.state.doc.lineAt(v.state.selection.main.head);
  const m = /^(\s*- \[)([ .x])\]/.exec(line.text);
  if (!m) return;
  const at = line.from + m[1].length;
  v.dispatch({ changes: { from: at, to: at + 1, insert: STATES[m[2]] } });
});
Vim.defineAction("foldToggle", (cm) => toggleFold(cm.cm6));
Vim.defineAction("foldClose", (cm) => foldCode(cm.cm6));
Vim.defineAction("foldOpen", (cm) => unfoldCode(cm.cm6));
Vim.defineAction("foldCloseAll", () => {
  open = new Set();
  foldClosed();
  saveOpen(readOpen(view.state));
});
Vim.defineAction("foldOpenAll", (cm) => {
  forItems(cm.cm6.state, ({ line }) => open.add(keyOf(line.text)));
  unfoldAll(cm.cm6);
  saveOpen(readOpen(cm.cm6.state));
});
for (const [keys, action] of [
  ["<Tab>", "taskState"],
  ["za", "foldToggle"],
  ["zc", "foldClose"],
  ["zo", "foldOpen"],
  ["zM", "foldCloseAll"],
  ["zR", "foldOpenAll"],
]) {
  Vim.mapCommand(keys, "action", action, {}, { context: "normal" });
}
Vim.defineEx("write", "w", () => save());

const create = async () => {
  const file = await fetchFile();
  eol = file.text.includes("\r\n") ? "\r\n" : "\n";
  version = file.version;
  open = new Set(settings.get(OPEN_KEY) ?? []);
  view = new EditorView({
    parent: el.querySelector(".task-list-body"),
    doc: toEditor(file.text),
    extensions: [
      vim(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      lineNumbers(),
      codeFolding(),
      foldGutter(),
      itemFold,
      markdown(),
      EditorView.lineWrapping,
      oneDark,
      EditorView.updateListener.of(onUpdate),
    ],
  });
  foldClosed();
  setStatus("saved");
};

// Opens the line's item and its parents, and puts the cursor on the line, in the middle of the view.
const reveal = (n) => {
  const pos = view.state.doc.line(Math.min(Math.max(n, 1), view.state.doc.lines)).from;
  const effects = [];
  foldedRanges(view.state).between(pos, pos, (from, to) => {
    if (from < pos && pos <= to) effects.push(unfoldEffect.of({ from, to }));
  });
  effects.push(EditorView.scrollIntoView(pos, { y: "center" }));
  view.dispatch({ effects, selection: { anchor: pos } });
};

let creating = null;
export const show = async (line) => {
  el.classList.add("open");
  if (!view) await (creating ??= create());
  else await refresh();
  if (line) reveal(line);
  view.focus();
};
export const hide = (focusTerminal) => {
  el.classList.remove("open");
  focusTerminal();
};

export const init = ({ focusTerminal }) => {
  // Capture phase, so neither vim nor xterm sees the key.
  document.addEventListener(
    "keydown",
    (e) => {
      if (!(e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey && e.code === "KeyL")) return;
      e.preventDefault();
      e.stopPropagation();
      if (isOpen()) hide(focusTerminal);
      else show();
    },
    true,
  );
};
