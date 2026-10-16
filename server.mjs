#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import http from "node:http";
import { spawn } from "@lydell/node-pty";
import { SerializeAddon } from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import chokidar from "chokidar";
import getPort from "get-port";
import open from "open";
import sirv from "sirv";
import { Tail } from "tail";
import writeFileAtomic from "write-file-atomic";
import { WebSocketServer } from "ws";

// The page and its browser libraries, built by Vite from web/ into dist/.
const DIST_DIR = `${import.meta.dirname}/dist`;
const HTML_PATH = `${DIST_DIR}/index.html`;
// Hook of our claude only, passed with --settings so it runs in any directory. See CLAUDE.md.
// SessionStart (startup, /clear, resume, compact) POSTs the transcript path; the server reads the conversation from that file.
// One line, single quotes only, and no $ ` ! so it runs the same in bash and cmd.
const hookScript = [
  "import { readFileSync } from 'node:fs';",
  "const input = JSON.parse(readFileSync(0, 'utf8'));",
  "const body = JSON.stringify({ transcriptPath: input.transcript_path, source: input.source });",
  "const res = await fetch(process.env.CC_WEB_SESSION_URL, { method: 'POST', body, signal: AbortSignal.timeout(2000) });",
  "if (res.status >= 300) throw new Error(process.env.CC_WEB_SESSION_URL + ' responded ' + res.status);",
].join(" ");
const hookCommand = `node --input-type=module -e "${hookScript}"`;
const HOOK_SETTINGS = JSON.stringify({ hooks: { SessionStart: [{ hooks: [{ type: "command", command: hookCommand }] }] } });

// Usage: node server.mjs [claude args]. All args pass through to claude as is.
// Port: CC_WEB_PORT if set (pnpm test uses 7682), else a free one.
const claudeArgs = ["--settings", HOOK_SETTINGS, ...process.argv.slice(2)];
const fixedPort = process.env.CC_WEB_PORT ? Number(process.env.CC_WEB_PORT) : null;

if (!existsSync(HTML_PATH)) throw new Error(`${HTML_PATH} is missing: run pnpm watch`);
// Dev loop: read files on each request, so a rebuild shows on reload. See scripts/build-watch/README.md.
const serveDist = sirv(DIST_DIR, { dev: true });

// Page settings, per project: the folder where claude runs. Not localStorage, which is per origin, and the port changes.
// The folder ignores itself, so the project's .gitignore is left alone. Writes are atomic (temp file, then rename),
// so a crash mid-write never leaves a broken config.
const CACHE_DIR = `${process.cwd()}/.ccw-cache`;
const CONFIG_PATH = `${CACHE_DIR}/config.json`;
const readConfig = () => (existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, "utf8")) : {});
const writeConfig = (settings) => {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileAtomic.sync(`${CACHE_DIR}/.gitignore`, "*\n");
  writeFileAtomic.sync(CONFIG_PATH, `${JSON.stringify(settings, null, 2)}\n`);
};

const clients = new Set();
const broadcast = (msg) => {
  for (const ws of clients) ws.send(msg);
};

// Our claude's hook POSTs its transcript path here; the path is unique to this server's claude.
const sessionPath = `/session/${randomUUID()}`;

// The conversation: items made from the transcript (one JSON line per event), in file order.
// Kinds: prompt (text), reply (text), tool_use (name, input), tool_result (results), turn_end.
// The page gets the whole list on connect and each new item after that.
const TOOL_RESULT_MAX = 2000;
let items = [];
let transcriptPath = null;
let transcriptWait = null;
let tail = null;

const clip = (content) =>
  typeof content === "string"
    ? content.slice(0, TOOL_RESULT_MAX)
    : Array.isArray(content)
      ? content.map((b) => (b.type === "text" ? { ...b, text: b.text.slice(0, TOOL_RESULT_MAX) } : { type: b.type }))
      : content;

const itemsOf = (line) => {
  const o = JSON.parse(line);
  const base = { id: o.uuid, parentId: o.parentUuid, at: o.timestamp };
  if (o.type === "system" && o.subtype === "turn_duration") return [{ ...base, kind: "turn_end" }];
  if (o.type === "user" && !o.isMeta) {
    const c = o.message?.content;
    const blocks = typeof c === "string" ? [{ type: "text", text: c }] : Array.isArray(c) ? c : [];
    const results = blocks.filter((b) => b.type === "tool_result");
    if (results.length) {
      return [{ ...base, kind: "tool_result", results: results.map((r) => ({ toolUseId: r.tool_use_id, content: clip(r.content) })) }];
    }
    const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    // Slash commands and their output are logged as user lines wrapped in <command-...> and <local-command-...> tags.
    return text && !text.startsWith("<") ? [{ ...base, kind: "prompt", text }] : [];
  }
  if (o.type === "assistant") {
    const blocks = Array.isArray(o.message?.content) ? o.message.content : [];
    return blocks.flatMap((b, i) => {
      const id = i === 0 ? base.id : `${base.id}:${i}`;
      if (b.type === "text") return [{ ...base, id, kind: "reply", text: b.text, stopReason: o.message.stop_reason }];
      if (b.type === "tool_use") return [{ ...base, id, kind: "tool_use", toolUseId: b.id, name: b.name, input: b.input }];
      return [];
    });
  }
  return [];
};

const itemsMessage = () => JSON.stringify({ t: "items", items });

// Follow the transcript from its first line. The file may not exist yet on startup; chokidar waits for it.
const followTranscript = (path) => {
  tail?.unwatch();
  transcriptWait?.close();
  tail = null;
  transcriptWait = chokidar.watch(path, { usePolling: true, interval: 200 }).on("add", () => {
    transcriptWait.close();
    tail = new Tail(path, { fromBeginning: true, useWatchFile: true, fsWatchOptions: { interval: 200 } });
    tail.on("line", (line) => {
      for (const item of itemsOf(line)) {
        items.push(item);
        broadcast(JSON.stringify({ t: "item", item }));
      }
    });
    tail.on("error", (err) => {
      throw err;
    });
  });
};

const startSession = ({ transcriptPath: path, source }) => {
  console.log(`session ${source}: ${path}`);
  if (path === transcriptPath) return;
  transcriptPath = path;
  items = [];
  broadcast(itemsMessage());
  followTranscript(path);
};

// Dev loop: a rebuild rewrites index.html, so open tabs reload. See scripts/build-watch/README.md.
chokidar
  .watch(HTML_PATH, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } })
  .on("change", () => {
    console.log("Page rebuilt, reloading clients");
    broadcast(JSON.stringify({ t: "reload" }));
  });

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === sessionPath) {
    let body = "";
    for await (const chunk of req) body += chunk;
    startSession(JSON.parse(body));
    res.writeHead(204).end();
    return;
  }
  serveDist(req, res, () => res.writeHead(404).end());
});

const HOST = "127.0.0.1";
const port = fixedPort ?? (await getPort({ host: HOST }));

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
      CC_WEB_SESSION_URL: `http://localhost:${port}${sessionPath}`,
    },
  });
  mirror = new headless.Terminal({ cols, rows, scrollback: 1000, allowProposedApi: true });
  mirror.loadAddon(serializer);

  pty.onData((d) => {
    mirror.write(d);
    broadcast(JSON.stringify({ t: "o", d }));
  });
  pty.onExit(async ({ exitCode }) => {
    console.log(`claude exited (${exitCode}), stopping server`);
    await closeClients(CLAUDE_EXITED, `claude exited (${exitCode})`);
    process.exit(exitCode);
  });
};

// Close codes sent to the tab. 4000-4999 are free for applications.
const SECOND_TAB = 4000;
const CLAUDE_EXITED = 4001;
const SERVER_CRASHED = 4002;

// Tell the tab why, and wait for the close handshake so the reason gets through before the process ends.
// A socket that never answers is given up after a second.
const closeClients = (code, reason) =>
  Promise.all(
    [...clients].map(
      (ws) =>
        new Promise((resolve) => {
          ws.once("close", resolve);
          setTimeout(resolve, 1000);
          ws.close(code, reason);
        }),
    ),
  );

// Fail loudly: any uncaught error prints, shows its stack in the tab, and stops the server (and claude with it).
const crash = async (err) => {
  console.error(err);
  broadcast(JSON.stringify({ t: "error", stack: err?.stack ?? String(err) }));
  await closeClients(SERVER_CRASHED, "The server crashed");
  process.exit(1);
};
process.on("uncaughtException", crash);
process.on("unhandledRejection", crash);

// One tab per session, like one terminal per session. A refresh closes the old socket first, so it reconnects.
new WebSocketServer({ server }).on("connection", (ws) => {
  if (clients.size > 0) {
    ws.close(SECOND_TAB, "This session is open in another tab");
    return;
  }
  clients.add(ws);
  ws.send(JSON.stringify({ t: "settings", settings: readConfig() }));
  if (pty) ws.send(JSON.stringify({ t: "o", d: serializer.serialize() }));
  ws.send(itemsMessage());

  ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.t === "i") pty.write(m.d);
    else if (m.t === "s") writeConfig(m.settings);
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

// Listen last, so every handler exists before the first request.
await new Promise((resolve) => server.listen(port, HOST, resolve));
const url = `http://localhost:${port}`;
console.log(url);
console.log("claude starts when the first tab opens");
await open(url);
