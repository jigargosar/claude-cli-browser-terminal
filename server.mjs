import http from "node:http";
import { spawn } from "@lydell/node-pty";
import { WebSocketServer } from "ws";

const PORT = 7681;

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Claude Code</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm/css/xterm.css">
<style>html,body,#t{margin:0;height:100%;background:#1e1e1e}</style>
</head>
<body>
<div id="t"></div>
<script type="module">
import { Terminal } from "https://cdn.jsdelivr.net/npm/@xterm/xterm/+esm";
import { FitAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-fit/+esm";
import { WebglAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-webgl/+esm";
import { Unicode11Addon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-unicode11/+esm";

const term = new Terminal({ allowProposedApi: true, cursorBlink: true, fontFamily: "Cascadia Mono, Consolas, monospace" });
const fit = new FitAddon();
term.loadAddon(fit);
term.loadAddon(new Unicode11Addon());
term.unicode.activeVersion = "11";
term.open(document.getElementById("t"));
term.loadAddon(new WebglAddon());
fit.fit();

const ws = new WebSocket("ws://" + location.host);
const send = (m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
ws.onopen = () => send({ t: "r", cols: term.cols, rows: term.rows });
ws.onmessage = (e) => term.write(e.data);
ws.onclose = () => term.write("\\r\\n[disconnected]\\r\\n");

// Shift+Enter -> newline in Claude Code (same as Alt+Enter)
term.attachCustomKeyEventHandler((e) => {
  if (e.type === "keydown" && e.key === "Enter" && e.shiftKey) {
    send({ t: "i", d: "\\x1b\\r" });
    return false;
  }
  return true;
});
term.onData((d) => send({ t: "i", d }));
term.onResize(({ cols, rows }) => send({ t: "r", cols, rows }));
addEventListener("resize", () => fit.fit());
term.focus();
</script>
</body>
</html>`;

const server = http.createServer((_, res) => {
  res.writeHead(200, { "content-type": "text/html" });
  res.end(html);
});

new WebSocketServer({ server }).on("connection", (ws) => {
  const pty = spawn(process.platform === "win32" ? "claude.exe" : "claude", [], {
    name: "xterm-256color",
    cols: 80,
    rows: 24,
    cwd: process.cwd(),
    env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
  });
  pty.onData((d) => ws.send(d));
  pty.onExit(() => ws.close());
  ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.t === "i") pty.write(m.d);
    else if (m.t === "r") pty.resize(m.cols, m.rows);
  });
  ws.on("close", () => pty.kill());
});

server.listen(PORT, "127.0.0.1", () => console.log(`http://localhost:${PORT}`));
