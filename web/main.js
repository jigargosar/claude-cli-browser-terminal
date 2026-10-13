// Wiring only. Each module owns one part of the page; this file connects them and grows one line per new module.
import * as terminal from "./terminal.js";
import { initDivider } from "./divider.js";
import { connect } from "./socket.js";
import { experiment } from "./lab.js";
import "./reader.js";
import * as last from "./views/last.js";

const status = document.getElementById("reply-status");

experiment(
  "terminal",
  "Terminal look",
  [["prototype", "Prototype"], ["original", "Slice 5"], ["slice7", "Slice 7"]],
  terminal.TERMINAL_LOOK_DEFAULT,
  terminal.setLook,
);
initDivider({ onDragEnd: terminal.refit });

// The conversation as the server read it from claude's transcript. Views are functions of this list.
let items = [];
const server = connect({
  size: terminal.size,
  onOutput: terminal.write,
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
terminal.onInput(server.input);
terminal.onResize(server.resize);
terminal.focus();
