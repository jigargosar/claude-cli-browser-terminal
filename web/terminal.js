// The terminal pane: xterm.js with fit, WebGL and Unicode 11. Nothing here knows about the server.
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Unicode11Addon } from "@xterm/addon-unicode11";

// Looks kept for A/B, oldest first. The Lab row that picks one is in main.js.
export const TERMINAL_LOOKS = {
  // First prototype (62618d0): xterm defaults with Cascadia Mono, on a #1e1e1e page.
  prototype: { fontFamily: "Cascadia Mono, Consolas, monospace", fontSize: 15, fontWeight: "normal", lineHeight: 1, theme: {} },
  // Slice 5 (448568e): xterm defaults on #16181d.
  original: { fontFamily: "Cascadia Mono, Consolas, monospace", fontSize: 14, fontWeight: "normal", lineHeight: 1, theme: { background: "#16181d" } },
  // Slice 7: prototype size and black background, Slice 5 padding.
  slice7: { fontFamily: "Cascadia Mono, Consolas, monospace", fontSize: 15, fontWeight: "normal", lineHeight: 1, theme: {} },
};
export const TERMINAL_LOOK_DEFAULT = "slice7";

const term = new Terminal({ allowProposedApi: true, cursorBlink: true, ...TERMINAL_LOOKS[TERMINAL_LOOK_DEFAULT] });
const fit = new FitAddon();
term.loadAddon(fit);
term.loadAddon(new Unicode11Addon());
term.unicode.activeVersion = "11";
term.open(document.getElementById("term"));
term.loadAddon(new WebglAddon());
fit.fit();
// Refit whenever the pane changes size (window resize, divider, narrow layout), except during a divider drag:
// claude re-wraps the whole conversation on every resize, so the divider refits once when the drag ends.
new ResizeObserver(() => document.body.classList.contains("dragging") || fit.fit()).observe(document.getElementById("term"));

export const refit = () => fit.fit();
export const setLook = (look) => {
  Object.assign(term.options, TERMINAL_LOOKS[look]);
  document.body.dataset.terminal = look;
  fit.fit();
};
export const size = () => ({ cols: term.cols, rows: term.rows });
export const write = (d) => term.write(d);
export const focus = () => term.focus();
export const onResize = (cb) => term.onResize(cb);
// Every byte the user types. Shift+Enter becomes LF, the same bytes as Ctrl+J, Claude Code's newline key.
// The browser fires keydown and keypress for Enter; both must be swallowed, or xterm sends its own CR after the LF.
export const onInput = (cb) => {
  term.attachCustomKeyEventHandler((e) => {
    if (e.key === "Enter" && e.shiftKey) {
      if (e.type === "keydown") cb("\n");
      return false;
    }
    return true;
  });
  term.onData(cb);
};
