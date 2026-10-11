#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import http from "node:http";
import { spawn } from "@lydell/node-pty";
import { SerializeAddon } from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import chokidar from "chokidar";
import getPort from "get-port";
import open from "open";
import sirv from "sirv";
import { WebSocketServer } from "ws";

// The page and its browser libraries, built by Vite from web/ (pnpm build).
const DIST_DIR = `${import.meta.dirname}/dist`;
const HTML_PATH = `${DIST_DIR}/index.html`;
// Hooks of our claude only, passed with --settings so they run in any directory. See CLAUDE.md.
// SessionStart and Stop POST the last reply to the server; a new session (start, /clear, resume) sends an empty one.
// One line, single quotes only, and no $ ` ! so it runs the same in bash and cmd.
const hookScript = [
  "import { readFileSync } from 'node:fs';",
  "const input = JSON.parse(readFileSync(0, 'utf8'));",
  "const md = input.hook_event_name === 'Stop' ? input.last_assistant_message : '';",
  "const res = await fetch(process.env.CC_WEB_REPLY_URL, { method: 'POST', body: JSON.stringify({ md }), signal: AbortSignal.timeout(2000) });",
  "if (res.status >= 300) throw new Error(process.env.CC_WEB_REPLY_URL + ' responded ' + res.status);",
].join(" ");
const hookCommand = `node --input-type=module -e "${hookScript}"`;
const hook = [{ hooks: [{ type: "command", command: hookCommand }] }];
const HOOK_SETTINGS = JSON.stringify({ hooks: { SessionStart: hook, Stop: hook } });

// Usage: node server.mjs [claude args]. All args pass through to claude as is.
// Port: CC_WEB_PORT if set (pnpm test uses 7682), else a free one.
const claudeArgs = ["--settings", HOOK_SETTINGS, ...process.argv.slice(2)];
const fixedPort = process.env.CC_WEB_PORT ? Number(process.env.CC_WEB_PORT) : null;

if (!existsSync(HTML_PATH)) throw new Error(`${HTML_PATH} is missing: run pnpm build`);
// dev: read files on each request, so a rebuild shows on reload.
const serveDist = sirv(DIST_DIR, { dev: true });

const clients = new Set();
const broadcast = (msg) => {
  for (const ws of clients) ws.send(msg);
};

// Our claude's hooks POST its last reply here; the path is unique to this server's claude.
const replyPath = `/reply/${randomUUID()}`;
let reply = "";
const replyMessage = () => JSON.stringify({ t: "reply", md: reply });

// A rebuild (pnpm build:watch) rewrites index.html: reload open tabs.
chokidar
  .watch(HTML_PATH, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } })
  .on("change", () => {
    console.log("Page rebuilt, reloading clients");
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
  serveDist(req, res, () => res.writeHead(404).end());
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

// One tab per session, like one terminal per session. A refresh closes the old socket first, so it reconnects.
const SECOND_TAB = 4000;
new WebSocketServer({ server }).on("connection", (ws) => {
  if (clients.size > 0) {
    ws.close(SECOND_TAB, "This session is open in another tab");
    return;
  }
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
