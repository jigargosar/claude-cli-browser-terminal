import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import http from "node:http";
import { spawn } from "@lydell/node-pty";
import { SerializeAddon } from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";

const PORT = 7681;
const REPLIES = `${import.meta.dirname}/.cc-web/replies`;

// Usage: node server.mjs new|resume [claude args], e.g. `node server.mjs new --model haiku`
const [mode, ...claudeArgs] = process.argv.slice(2);
const MODES = { new: [], resume: ["--resume"] };
if (!MODES[mode]) throw new Error("Usage: node server.mjs new|resume [claude args]");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Claude Code</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xterm/xterm/css/xterm.css">
<style>
  html, body { margin: 0; height: 100%; background: #1e1e1e; color: #d4d4d4; }
  body { display: flex; }
  #t, #reply { flex: 1; min-width: 0; height: 100%; box-sizing: border-box; }
  #reply { overflow: auto; padding: 16px 24px; border-left: 1px solid #333;
    font: 16px/1.6 system-ui, sans-serif; }
  #reply pre { background: #111; padding: 12px; overflow: auto; }
  #reply code { font-family: Cascadia Mono, Consolas, monospace; font-size: 14px; }
  #reply a { color: #4fc1ff; }
</style>
</head>
<body>
<div id="t"></div>
<div id="reply"></div>
<script type="module">
import { Terminal } from "https://cdn.jsdelivr.net/npm/@xterm/xterm/+esm";
import { FitAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-fit/+esm";
import { WebglAddon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-webgl/+esm";
import { Unicode11Addon } from "https://cdn.jsdelivr.net/npm/@xterm/addon-unicode11/+esm";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/+esm";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify/+esm";

const term = new Terminal({ allowProposedApi: true, cursorBlink: true, fontFamily: "Cascadia Mono, Consolas, monospace" });
const fit = new FitAddon();
term.loadAddon(fit);
term.loadAddon(new Unicode11Addon());
term.unicode.activeVersion = "11";
term.open(document.getElementById("t"));
term.loadAddon(new WebglAddon());
fit.fit();

const reply = document.getElementById("reply");
const ws = new WebSocket("ws://" + location.host);
const send = (m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
ws.onopen = () => send({ t: "r", cols: term.cols, rows: term.rows });
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.t === "o") term.write(m.d);
  else if (m.t === "reply") {
    reply.innerHTML = DOMPurify.sanitize(marked.parse(m.md));
    reply.scrollTop = 0;
  }
};
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

mkdirSync(REPLIES, { recursive: true });
const clients = new Set();
const replyMessage = (path) => JSON.stringify({ t: "reply", md: readFileSync(path, "utf8") });

const latestReply = () =>
  readdirSync(REPLIES)
    .map((f) => `${REPLIES}/${f}`)
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];

chokidar
  .watch(REPLIES, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } })
  .on("all", (event, path) => {
    if (event !== "add" && event !== "change") return;
    const msg = replyMessage(path);
    for (const ws of clients) ws.send(msg);
  });

const server = http.createServer((_, res) => {
  res.writeHead(200, { "content-type": "text/html" });
  res.end(html);
});

// One claude for the server's lifetime; browser tabs only attach and detach.
const pty = spawn(process.platform === "win32" ? "claude.exe" : "claude", [...MODES[mode], ...claudeArgs], {
  name: "xterm-256color",
  cols: 80,
  rows: 24,
  cwd: process.cwd(),
  env: { ...process.env, TERM: "xterm-256color", COLORTERM: "truecolor" },
});

// Headless mirror of the screen, serialized to restore it on reconnect.
const mirror = new headless.Terminal({ cols: 80, rows: 24, scrollback: 1000, allowProposedApi: true });
const serializer = new SerializeAddon();
mirror.loadAddon(serializer);

pty.onData((d) => {
  mirror.write(d);
  const msg = JSON.stringify({ t: "o", d });
  for (const ws of clients) ws.send(msg);
});
pty.onExit(({ exitCode }) => {
  console.log(`claude exited (${exitCode}), stopping server`);
  for (const ws of clients) ws.close();
  process.exit(exitCode);
});

new WebSocketServer({ server }).on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ t: "o", d: serializer.serialize() }));
  const latest = latestReply();
  if (latest) ws.send(replyMessage(latest));

  ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.t === "i") pty.write(m.d);
    else if (m.t === "r") {
      pty.resize(m.cols, m.rows);
      mirror.resize(m.cols, m.rows);
    }
  });
  ws.on("close", () => clients.delete(ws));
});

server.listen(PORT, "127.0.0.1", () => console.log(`http://localhost:${PORT}`));
