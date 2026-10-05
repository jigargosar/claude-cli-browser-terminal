import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { spawn } from "@lydell/node-pty";
import { SerializeAddon } from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import chokidar from "chokidar";
import { WebSocketServer } from "ws";

const REPLIES = `${import.meta.dirname}/.cc-web/replies`;

// Browser libraries, served from node_modules so versions are pinned by package.json.
const NODE_MODULES = `${import.meta.dirname}/node_modules`;
const VENDOR = {
  "/vendor/xterm.css": ["@xterm/xterm/css/xterm.css", "text/css"],
  "/vendor/xterm.mjs": ["@xterm/xterm/lib/xterm.mjs", "text/javascript"],
  "/vendor/addon-fit.mjs": ["@xterm/addon-fit/lib/addon-fit.mjs", "text/javascript"],
  "/vendor/addon-webgl.mjs": ["@xterm/addon-webgl/lib/addon-webgl.mjs", "text/javascript"],
  "/vendor/addon-unicode11.mjs": ["@xterm/addon-unicode11/lib/addon-unicode11.mjs", "text/javascript"],
  "/vendor/marked.mjs": ["marked/lib/marked.esm.js", "text/javascript"],
  "/vendor/purify.mjs": ["dompurify/dist/purify.es.mjs", "text/javascript"],
};

// Usage: node server.mjs <port> new|resume [claude args]. Fixed ports: dev 7681, test 7682 (see package.json).
const [portArg, mode, ...claudeArgs] = process.argv.slice(2);
const MODES = { new: [], resume: ["--resume"] };
if (!/^\d+$/.test(portArg ?? "") || !MODES[mode]) throw new Error("Usage: node server.mjs <port> new|resume [claude args]");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Claude Code</title>
<link rel="stylesheet" href="/vendor/xterm.css">
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
import { Terminal } from "/vendor/xterm.mjs";
import { FitAddon } from "/vendor/addon-fit.mjs";
import { WebglAddon } from "/vendor/addon-webgl.mjs";
import { Unicode11Addon } from "/vendor/addon-unicode11.mjs";
import { marked } from "/vendor/marked.mjs";
import DOMPurify from "/vendor/purify.mjs";

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

const clients = new Set();
const broadcast = (msg) => {
  for (const ws of clients) ws.send(msg);
};

// Our claude's SessionStart hook reports its session ID here. See CLAUDE.md.
const claudeInstanceId = randomUUID();
const sessionReportPath = `/session/${claudeInstanceId}`;
let sessionId = null;
let replyWatcher = null;

// REPLIES holds every session's replies; only ours is shown.
const replyFile = () => `${REPLIES}/${sessionId}.md`;
const replyMessage = () =>
  JSON.stringify({ t: "reply", md: existsSync(replyFile()) ? readFileSync(replyFile(), "utf8") : "" });

const switchSession = async (id) => {
  await replyWatcher?.close();
  sessionId = id;
  console.log(`session ${sessionId}`);
  broadcast(replyMessage()); // new session may have no reply yet: clears the panel
  replyWatcher = chokidar
    .watch(replyFile(), { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } })
    .on("add", () => broadcast(replyMessage()))
    .on("change", () => broadcast(replyMessage()));
};

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === sessionReportPath) {
    let body = "";
    for await (const chunk of req) body += chunk;
    await switchSession(JSON.parse(body).session_id);
    res.writeHead(204).end();
    return;
  }
  if (VENDOR[req.url]) {
    const [file, type] = VENDOR[req.url];
    res.writeHead(200, { "content-type": type });
    res.end(readFileSync(`${NODE_MODULES}/${file}`));
    return;
  }
  res.writeHead(200, { "content-type": "text/html" });
  res.end(html);
});

await new Promise((resolve) => server.listen(Number(portArg), "127.0.0.1", resolve));
const port = server.address().port;
console.log(`http://localhost:${port}`);

// One claude for the server's lifetime; browser tabs only attach and detach.
const pty = spawn(process.platform === "win32" ? "claude.exe" : "claude", [...MODES[mode], ...claudeArgs], {
  name: "xterm-256color",
  cols: 80,
  rows: 24,
  cwd: process.cwd(),
  env: {
    ...process.env,
    TERM: "xterm-256color",
    COLORTERM: "truecolor",
    CC_WEB_SESSION_URL: `http://localhost:${port}${sessionReportPath}`,
  },
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
  if (sessionId) ws.send(replyMessage());

  ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.t === "i") pty.write(m.d);
    else if (m.t === "r") {
      pty.resize(m.cols, m.rows);
      mirror.resize(m.cols, m.rows);
    }
  });
  ws.on("close", () => clients.delete(ws));
  // A tab closed or refreshed mid-send (e.g. ECONNRESET): only that viewer is gone, the session stays.
  ws.on("error", (err) => {
    console.error(`viewer disconnected: ${err.message}`);
    clients.delete(ws);
  });
});
