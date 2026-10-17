// Wiring only. Each module owns one part of the page; this file connects them and grows one line per new module.
import { showError } from "./errors.js";
import * as terminal from "./terminal.js";
import { initDivider } from "./divider.js";
import { connect } from "./socket.js";
import "./reader.js";
import * as settings from "./settings.js";
import * as last from "./views/last.js";
import * as comments from "./views/comments.js";
import { tabbable } from "tabbable";

const status = document.getElementById("reply-status");

initDivider({ onDragEnd: terminal.refit });

// The conversation as the server read it from claude's transcript. Views are functions of this list.
let items = [];
// A rebuild reloads the page, but never mid-turn: a reload loses the comments. It waits for the turn's end.
// A turn is open when the last prompt comes after the last turn end.
let reloadPending = false;
const midTurn = () => items.findLast((i) => i.kind === "prompt" || i.kind === "turn_end")?.kind === "prompt";
const server = connect({
  size: terminal.size,
  // Applied and refit before the socket sends its first size, so claude starts at the saved split.
  onSettings: (saved) => {
    settings.load(saved);
    terminal.refit();
    server.log(`loaded ${new URL(import.meta.url).pathname.split("/").pop()}`);
  },
  onOutput: terminal.write,
  onError: showError,
  onItems: (list) => {
    items = list;
    last.show(items);
  },
  onItem: (item) => {
    items.push(item);
    if (item.kind === "reply") {
      last.show(items);
      comments.clear();
    }
    if (item.kind === "turn_end" && reloadPending) {
      server.log("reload at turn end");
      location.reload();
    }
  },
  onReload: () => {
    if (midTurn()) {
      reloadPending = true;
      server.log("reload deferred, mid-turn");
    } else {
      server.log("reload now");
      location.reload();
    }
  },
  onClosed: ({ line, status: text }) => {
    terminal.write(`\r\n[${line}]\r\n`);
    status.textContent = text;
  },
});
terminal.onInput(server.input);
terminal.onResize(server.resize);
settings.onSave(server.saveSettings);
// Comments go to claude as one pasted message, then Enter, as if typed in the terminal.
comments.init({
  send: (text) => {
    terminal.paste(text);
    server.input("\r");
    terminal.focus();
  },
});
terminal.focus();

// Focus: Alt+` toggles between the panes (capture phase, so xterm never sees the key). Focus that lands nowhere,
// e.g. a click on empty pane space, goes to the terminal.
const terminalPane = document.getElementById("terminal-pane");
const reply = document.getElementById("reply");
document.addEventListener(
  "keydown",
  (e) => {
    if (!(e.altKey && !e.ctrlKey && !e.shiftKey && e.code === "Backquote")) return;
    e.preventDefault();
    e.stopPropagation();
    if (terminalPane.contains(document.activeElement)) reply.focus();
    else terminal.focus();
  },
  true,
);
// Tab and Shift+Tab cycle the reply pane's stops. Past either end, focus goes to the terminal, which keeps Tab for
// claude. With nothing focused, Tab picks the pane's first stop.
const replyPane = document.getElementById("reply-pane");
document.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Tab" || e.ctrlKey || e.altKey || e.metaKey) return;
    const active = document.activeElement;
    if (terminalPane.contains(active)) return;
    e.preventDefault();
    const stops = tabbable(replyPane);
    if (!replyPane.contains(active)) {
      stops[0].focus();
      return;
    }
    const next = stops.indexOf(active) + (e.shiftKey ? -1 : 1);
    if (next < 0 || next >= stops.length) terminal.focus();
    else stops[next].focus();
  },
  true,
);
// The focus mark on the divider (base.css) shows which pane gets the keys, or none. Focusout runs before focus
// lands, so it reads the result after the move.
const markFocus = () => {
  const active = document.activeElement;
  document.body.dataset.focus = terminalPane.contains(active) ? "terminal" : replyPane.contains(active) ? "reply" : "none";
};
document.addEventListener("focusin", markFocus);
document.addEventListener("focusout", () => setTimeout(markFocus));
markFocus();
// A bare Alt tap focuses the browser's menu (Chrome and Edge on Windows). Swallowed, so focus stays in the page.
for (const type of ["keydown", "keyup"]) {
  document.addEventListener(type, (e) => e.key === "Alt" && e.preventDefault(), true);
}
document.addEventListener("focusout", (e) => {
  if (e.relatedTarget === null) terminal.focus();
});
