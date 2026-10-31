// The terminal pane: xterm.js with fit, WebGL and Unicode 11. Nothing here knows about the server.
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import "@fontsource/atkinson-hyperlegible-mono/300.css";
import "@fontsource/atkinson-hyperlegible-mono/700.css";

// Atkinson Hyperlegible Mono at 300, picked in docs/mockups/font-grid.html. The page waits for both faces, because
// xterm measures the cell size once, and the first columns and rows must be the real ones (CLAUDE.md, Decision 1.2).
await Promise.all([document.fonts.load('300 14px "Atkinson Hyperlegible Mono"'), document.fonts.load('700 14px "Atkinson Hyperlegible Mono"')]);

// The Slice 5 look (448568e): xterm defaults on #16181d (--term-bg in base.css).
const term = new Terminal({
  allowProposedApi: true,
  cursorBlink: true,
  fontFamily: '"Atkinson Hyperlegible Mono", Consolas, monospace',
  fontSize: 14,
  fontWeight: "300",
  lineHeight: 1,
  theme: { background: "#16181d" },
});
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
export const size = () => ({ cols: term.cols, rows: term.rows });
export const write = (d) => term.write(d);
export const focus = () => term.focus();
// Sends text as a paste, the same bytes as Ctrl+V: bracketed when claude asked for bracketed paste.
export const paste = (text) => term.paste(text);
export const onResize = (cb) => term.onResize(cb);
// Every byte the user types. Shift+Enter becomes LF, the same bytes as Ctrl+J, Claude Code's newline key.
// The browser fires keydown and keypress for Enter; both must be swallowed, or xterm sends its own CR after the LF.
// Ctrl+W closes the tab in Chrome and Edge; the page never sees the key. Reopen the URL to get the session back.
// Ctrl+Backspace deletes the previous word in claude instead.
// Ctrl+V pastes text, as in Windows Terminal: xterm skips the key, so the browser fires paste and xterm sends the text.
export const onInput = (cb) => {
  term.attachCustomKeyEventHandler((e) => {
    if (e.key === "Enter" && e.shiftKey) {
      if (e.type === "keydown") cb("\n");
      return false;
    }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "v") return false;
    return true;
  });
  term.onData(cb);
};
