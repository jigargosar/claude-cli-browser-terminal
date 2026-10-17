// Wiring only. Each module owns one part of the page; this file connects them and grows one line per new module.
import { showError } from "./errors.js";
import * as terminal from "./terminal.js";
import { initDivider } from "./divider.js";
import { connect } from "./socket.js";
import "./reader.js";
import * as settings from "./settings.js";
import * as last from "./views/last.js";
import * as comments from "./views/comments.js";

const status = document.getElementById("reply-status");

initDivider({ onDragEnd: terminal.refit });

// The conversation as the server read it from claude's transcript. Views are functions of this list.
let items = [];
const server = connect({
  size: terminal.size,
  // Applied and refit before the socket sends its first size, so claude starts at the saved split.
  onSettings: (saved) => {
    settings.load(saved);
    terminal.refit();
  },
  onOutput: terminal.write,
  onError: showError,
  onItems: (list) => {
    items = list;
    last.show(items);
  },
  onItem: (item) => {
    items.push(item);
    if (item.kind === "reply") last.show(items);
  },
  onClosed: ({ line, status: text }) => {
    terminal.write(`\r\n[${line}]\r\n`);
    status.textContent = text;
  },
});
// Diagnostic for the Enter bug (Board): which bytes the page sent for each Enter.
terminal.onInput((d) => {
  if (/[\r\n]/.test(d)) console.debug("input", JSON.stringify(d));
  server.input(d);
});
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
document.addEventListener("focusout", (e) => {
  if (e.relatedTarget === null) terminal.focus();
});
