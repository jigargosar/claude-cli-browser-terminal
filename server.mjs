import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import http from "node:http";
import { spawn } from "@lydell/node-pty";
import { SerializeAddon } from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import chokidar from "chokidar";
import getPort from "get-port";
import open from "open";
import { WebSocketServer } from "ws";

const WEB_DIR = `${import.meta.dirname}/web`;
const HTML_PATH = `${WEB_DIR}/index.html`;
// Hooks of our claude only, passed with --settings so they run in any directory. See CLAUDE.md.
const hookCommand = `node "${import.meta.dirname.replaceAll("\\", "/")}/hooks/reply.mjs"`;
const hook = [{ hooks: [{ type: "command", command: hookCommand }] }];
const HOOK_SETTINGS = JSON.stringify({ hooks: { SessionStart: hook, Stop: hook } });

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
  "/vendor/marked-highlight.mjs": ["marked-highlight/src/index.js", "text/javascript"],
  "/vendor/highlight.mjs": ["@highlightjs/cdn-assets/es/highlight.min.js", "text/javascript"],
  "/vendor/hljs-github-dark.css": ["@highlightjs/cdn-assets/styles/github-dark.min.css", "text/css"],
};

// Usage: node server.mjs [claude args]. All args pass through to claude as is.
// Port: CC_WEB_PORT if set (pnpm test uses 7682), else a free one.
const claudeArgs = ["--settings", HOOK_SETTINGS, ...process.argv.slice(2)];
const fixedPort = process.env.CC_WEB_PORT ? Number(process.env.CC_WEB_PORT) : null;

let html = readFileSync(HTML_PATH, "utf8");

const clients = new Set();
const broadcast = (msg) => {
  for (const ws of clients) ws.send(msg);
};

// Our claude's hooks POST its last reply here; the path is unique to this server's claude.
const replyPath = `/reply/${randomUUID()}`;
let reply = "";
const replyMessage = () => JSON.stringify({ t: "reply", md: reply });

// Watch index.html for HMR in dev mode
chokidar
  .watch(HTML_PATH, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } })
  .on("change", () => {
    html = readFileSync(HTML_PATH, "utf8");
    console.log("HTML changed, reloading clients");
    broadcast(JSON.stringify({ t: "reload" }));
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === replyPath) {
    let body = "";
    for await (const chunk of req) body += chunk;
    reply = JSON.parse(body).md;
    broadcast(replyMessage());
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

const HOST = "127.0.0.1";
const port = fixedPort ?? (await getPort({ host: HOST }));
await new Promise((resolve) => server.listen(port, HOST, resolve));
const url = `http://localhost:${port}`;
console.log(url);
await open(url);

// One claude for the server's lifetime; browser tabs only attach and detach.
// Started on the first tab's size, so its first output is formatted at the browser terminal's width.
let pty = null;
// Headless mirror of the screen, serialized to restore it on reconnect.
let mirror = null;
const serializer = new SerializeAddon();

const startClaude = (cols, rows) => {
  pty = spawn(process.platform === "win32" ? "claude.exe" : "claude", claudeArgs, {
    name: "xterm-256color",
    cols,
    rows,
    cwd: process.cwd(),
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      CC_WEB_REPLY_URL: `http://localhost:${port}${replyPath}`,
    },
  });
  mirror = new headless.Terminal({ cols, rows, scrollback: 1000, allowProposedApi: true });
  mirror.loadAddon(serializer);

  pty.onData((d) => {
    mirror.write(d);
    broadcast(JSON.stringify({ t: "o", d }));
  });
  pty.onExit(({ exitCode }) => {
    console.log(`claude exited (${exitCode}), stopping server`);
    for (const ws of clients) ws.close();
    process.exit(exitCode);
  });
};

console.log("claude starts when the first tab opens");

new WebSocketServer({ server }).on("connection", (ws) => {
  clients.add(ws);
  if (pty) ws.send(JSON.stringify({ t: "o", d: serializer.serialize() }));
  ws.send(replyMessage());

  ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.t === "i") pty.write(m.d);
    else if (m.t === "r" && !pty) startClaude(m.cols, m.rows);
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
