#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import { homedir } from "node:os";
import path from "node:path";
import { spawn } from "@lydell/node-pty";
import { SerializeAddon } from "@xterm/addon-serialize";
import headless from "@xterm/headless";
import chokidar from "chokidar";
import getPort from "get-port";
import { globby } from "globby";
import launchEditor from "launch-editor";
import open from "open";
import { simpleGit } from "simple-git";
import sirv from "sirv";
import writeFileAtomic from "write-file-atomic";
import { WebSocketServer } from "ws";
import { followJsonl } from "./follow-jsonl.mjs";

// The page and its browser libraries, built by Vite from web/ into dist/.
const DIST_DIR = `${import.meta.dirname}/dist`;
const HTML_PATH = `${DIST_DIR}/index.html`;
// Hooks of our claude only, passed with --settings so they run in any directory. See CLAUDE.md.
// Each POSTs the session ID and transcript path; the server reads the conversation from that file.
// Three hooks cover every switch of file. See docs/tasks/transcript-following/research.md.
// - SessionStart: startup, /clear, /resume, fork, compact.
// - UserPromptSubmit: /cd moves the file and fires no hook; the next prompt carries the new path.
// - PostToolUse on EnterWorktree and ExitWorktree: they move the file mid-turn.
// One line, single quotes only, and no $ ` ! so it runs the same in bash and cmd.
const hookScript = [
  "import { readFileSync } from 'node:fs';",
  "const input = JSON.parse(readFileSync(0, 'utf8'));",
  "const body = JSON.stringify({ sessionId: input.session_id, transcriptPath: input.transcript_path, event: input.hook_event_name, source: input.source });",
  "const res = await fetch(process.env.CC_WEB_SESSION_URL, { method: 'POST', body, signal: AbortSignal.timeout(2000) });",
  "if (res.status >= 300) throw new Error(process.env.CC_WEB_SESSION_URL + ' responded ' + res.status);",
].join(" ");
const hook = { type: "command", command: `node --input-type=module -e "${hookScript}"` };
const HOOK_SETTINGS = JSON.stringify({
  hooks: {
    SessionStart: [{ hooks: [hook] }],
    UserPromptSubmit: [{ hooks: [hook] }],
    PostToolUse: [{ matcher: "EnterWorktree|ExitWorktree", hooks: [hook] }],
    // Claude waits on the user: a permission dialog or a question. The page then says Waiting, not Running.
    PermissionRequest: [{ hooks: [hook] }],
    Notification: [{ matcher: "permission_prompt|elicitation_dialog", hooks: [hook] }],
  },
});

// Usage: node server.mjs [claude args]. All args pass through to claude as is.
// Port: CC_WEB_PORT if set (pnpm test uses 7682), else a free one.
// Tells claude how to write file references, so the page can link every one to its lines (web/refs.js).
const REFS_PROMPT = `In your responses:
- every file reference is written as \`path:line\` or \`path:start-end\`
- every line number matches the file as it is now
- every reference to removed text is shown as a verbatim quote of that text`;
const claudeArgs = ["--settings", HOOK_SETTINGS, "--append-system-prompt", REFS_PROMPT, ...process.argv.slice(2)];
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
const makeCacheDir = () => {
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileAtomic.sync(`${CACHE_DIR}/.gitignore`, "*\n");
};
const writeConfig = (settings) => {
  makeCacheDir();
  writeFileAtomic.sync(CONFIG_PATH, `${JSON.stringify(settings, null, 2)}\n`);
};

// Dev loop diagnostics: each rebuild, tab connect and close, and each reload decision of the page, one timed line each.
// A double reload then shows which rebuild or which decision caused it.
const RELOAD_LOG_PATH = `${CACHE_DIR}/reload.log`;
const reloadLog = (line) => {
  makeCacheDir();
  appendFileSync(RELOAD_LOG_PATH, `${new Date().toISOString()} ${line}\n`);
};
const builtScript = () => readFileSync(HTML_PATH, "utf8").match(/index-[\w-]+\.js/)[0];

const clients = new Set();
const broadcast = (msg) => {
  for (const ws of clients) ws.send(msg);
};

// Our claude's hook POSTs its transcript path here; the path is unique to this server's claude.
const sessionPath = `/session/${randomUUID()}`;

// The conversation: items made from the transcript (one JSON line per event), in file order. Every line makes at least
// one item. Kinds: prompt (text), reply (text), thinking (text), tool_use (name, input), tool_result (results, allowed),
// api (model, usage of one API call), hook, mode (permission mode), cost (session totals), turn_end (durationMs), and
// raw (any other line, its JSON clipped). Inventory of line types: docs/tasks/response-info/transcript-inventory.md.
// The page gets the whole list on connect and each new item after that.
const TOOL_RESULT_MAX = 2000;
let items = [];
// Item IDs already in items. A moved file holds the lines read before the move; they are skipped, not shown twice.
let seen = new Set();
// The file followed, and the one waited for until it exists, each with its follower.
let followed = { sessionId: null, path: null };
let waitingFor = null;
let follower = null;
let pending = null;

const clip = (content) =>
  typeof content === "string"
    ? content.slice(0, TOOL_RESULT_MAX)
    : Array.isArray(content)
      ? content.map((b) => (b.type === "text" ? { ...b, text: b.text.slice(0, TOOL_RESULT_MAX) } : { type: b.type }))
      : content;
// A tool's result goes out whole. Only non-text blocks, such as an image's data, are reduced to their type.
const textOnly = (content) => (Array.isArray(content) ? content.map((b) => (b.type === "text" ? b : { type: b.type })) : content);

// Some lines have no uuid, e.g. cost-state and permission-mode. Their ID is a hash of the line and how often the same
// line came before it in the file. A moved file repeats the old lines in the same order, so they get the same IDs.
let lineCounts = new Map();
const lineId = (line) => {
  const hash = createHash("sha1").update(line).digest("hex").slice(0, 16);
  const n = lineCounts.get(hash) ?? 0;
  lineCounts.set(hash, n + 1);
  return `${hash}:${n}`;
};

const itemsOf = (o) => {
  const line = JSON.stringify(o);
  const base = { id: o.uuid ?? lineId(line), parentId: o.parentUuid, at: o.timestamp };
  const known = knownItemsOf(o, base);
  if (known.length) return known;
  const type = [o.type, o.subtype ?? o.attachment?.type].filter(Boolean).join("/");
  return [{ ...base, kind: "raw", type, json: line.slice(0, TOOL_RESULT_MAX) }];
};

const knownItemsOf = (o, base) => {
  if (o.type === "system" && o.subtype === "turn_duration") return [{ ...base, kind: "turn_end", durationMs: o.durationMs }];
  if (o.type === "permission-mode") return [{ ...base, kind: "mode", mode: o.permissionMode }];
  if (o.type === "cost-state") {
    return [{ ...base, kind: "cost", usd: o.totalCostUSD, apiMs: o.totalAPIDuration, toolMs: o.totalToolDuration,
      linesAdded: o.totalLinesAdded, linesRemoved: o.totalLinesRemoved }];
  }
  // Hooks fired. Each hook run is an attachment line whose type starts with "hook_"; the Stop hooks come as one
  // summary line instead, with one entry per hook.
  if (o.type === "attachment" && o.attachment?.type?.startsWith("hook_")) {
    const a = o.attachment;
    const output = a.stdout ?? (Array.isArray(a.content) ? a.content.join("\n") : a.content);
    return [{ ...base, kind: "hook", type: a.type, event: a.hookEvent, name: a.hookName, command: a.command,
      output: output && clip(output), stderr: a.stderr && clip(a.stderr), exitCode: a.exitCode, durationMs: a.durationMs }];
  }
  if (o.type === "system" && o.subtype === "stop_hook_summary") {
    return (o.hookInfos ?? []).map((h, i) => ({ ...base, id: `${base.id}:${i}`, kind: "hook", type: o.subtype, event: "Stop",
      command: h.command, durationMs: h.durationMs, errors: o.hookErrors }));
  }
  if (o.type === "user" && !o.isMeta) {
    const c = o.message?.content;
    const blocks = typeof c === "string" ? [{ type: "text", text: c }] : Array.isArray(c) ? c : [];
    const results = blocks.filter((b) => b.type === "tool_result");
    if (results.length) {
      return [{ ...base, kind: "tool_result", allowed: o.permissionDecision,
        results: results.map((r) => ({ toolUseId: r.tool_use_id, content: textOnly(r.content), isError: r.is_error === true })) }];
    }
    const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("\n");
    // Slash commands and their output are logged as user lines wrapped in <command-...> and <local-command-...> tags.
    return text && !text.startsWith("<") ? [{ ...base, kind: "prompt", text }] : [];
  }
  if (o.type === "assistant") {
    const blocks = Array.isArray(o.message?.content) ? o.message.content : [];
    // One API call writes one line per content block, each with the call's usage. The page keeps one per requestId.
    const u = o.message?.usage;
    const api = u
      ? [{ ...base, id: `${base.id}:api`, kind: "api", requestId: o.requestId, model: o.message.model, stopReason: o.message.stop_reason,
          usage: { input: u.input_tokens, output: u.output_tokens, thinking: u.output_tokens_details?.thinking_tokens,
            cacheRead: u.cache_read_input_tokens, cacheWrite: u.cache_creation_input_tokens } }]
      : [];
    // The line's parts first, then its API call: the page shows them in this order.
    return [...blocks.flatMap((b, i) => {
      const id = i === 0 ? base.id : `${base.id}:${i}`;
      if (b.type === "text") return [{ ...base, id, kind: "reply", text: b.text, stopReason: o.message.stop_reason }];
      // Thinking without text is kept, so the page shows that it happened.
      if (b.type === "thinking") return [{ ...base, id, kind: "thinking", text: b.thinking ?? "" }];
      if (b.type === "tool_use") return [{ ...base, id, kind: "tool_use", toolUseId: b.id, name: b.name, input: b.input }];
      return [];
    }), ...api];
  }
  return [];
};

const itemsMessage = () => JSON.stringify({ t: "items", items });

// Follow a transcript from its first line, once the file exists (follow-jsonl.mjs).
// The old file stays followed until then: a SessionStart can name a file that never comes (issue #78455).
// A new session clears the page. The same session at a new path is a move, so the page keeps its items.
const followTranscript = (sessionId, path) => {
  pending?.close();
  waitingFor = path;
  const next = followJsonl(path, {
    onStart: () => {
      pending = null;
      waitingFor = null;
      follower?.close();
      follower = next;
      if (sessionId !== followed.sessionId) {
        items = [];
        seen = new Set();
        broadcast(itemsMessage());
      }
      followed = { sessionId, path };
      lineCounts = new Map();
    },
    onValue: (o) => {
      for (const item of itemsOf(o)) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        items.push(item);
        broadcast(JSON.stringify({ t: "item", item }));
        // Any new line means claude moved on from the dialog.
        setWaiting(false);
      }
    },
  });
  pending = next;
};

// True while claude waits on a dialog: set by its PermissionRequest and Notification hooks, cleared by the next line.
let waiting = false;
const setWaiting = (next) => {
  if (next === waiting) return;
  waiting = next;
  broadcast(JSON.stringify({ t: "waiting", waiting }));
};

const onHook = ({ sessionId, transcriptPath: path, event, source }) => {
  if (event === "PermissionRequest" || event === "Notification") {
    setWaiting(true);
    return;
  }
  if (path === (waitingFor ?? followed.path)) return;
  console.log(`${event}${source ? ` ${source}` : ""}: ${path}`);
  followTranscript(sessionId, path);
};

// Dev loop: a rebuild rewrites index.html, so open tabs reload. See scripts/build-watch/README.md.
chokidar
  .watch(HTML_PATH, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 100 } })
  .on("change", () => {
    console.log("Page rebuilt, reloading clients");
    reloadLog(`rebuilt ${builtScript()}, ${clients.size} tab(s) told to reload`);
    broadcast(JSON.stringify({ t: "reload" }));
  });

// File references in Claude's replies (web/refs.js). The page sends what a reply names, e.g. `web/main.js` or a bare
// `main.js`. A file outside the project folder is read and opened too, by its full path. The server listens on
// 127.0.0.1 only.
const ROOT = process.cwd();
const insideRoot = (abs) => {
  const rel = path.relative(ROOT, abs);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
};
const isFile = async (abs) => (await stat(abs).catch((err) => {
  // A missing path is an answer, not a failure. Anything else propagates.
  if (err.code === "ENOENT" || err.code === "ENOTDIR") return null;
  throw err;
}))?.isFile() ?? false;
// The project's files, minus gitignored ones, listed at most every 5 s, for names that match no path from the root.
let fileList = { at: 0, files: [] };
const projectFiles = async () => {
  if (Date.now() - fileList.at > 5000) {
    fileList = { at: Date.now(), files: await globby("**", { cwd: ROOT, gitignore: true, dot: true, ignore: [".git/**"] }) };
  }
  return fileList.files;
};
// A reference as written to { path } of a project file with forward slashes, or null. A path outside the project
// folder gives { outside: true }, with its full path when the file exists. A path from the root wins. Else a name
// that ends exactly one project path, e.g. `main.js` for `web/main.js`.
const resolveRef = async (ref) => {
  const abs = path.resolve(ROOT, ref.replace(/^~(?=[\\/])/, homedir()));
  if (!insideRoot(abs) && abs !== ROOT) {
    return (await isFile(abs)) ? { outside: true, path: abs.replaceAll("\\", "/") } : { outside: true };
  }
  if (await isFile(abs)) return { path: path.relative(ROOT, abs).replaceAll("\\", "/") };
  const tail = ref.replaceAll("\\", "/").replace(/^\.\//, "");
  const hits = (await projectFiles()).filter((f) => f === tail || f.endsWith(`/${tail}`));
  return hits.length === 1 ? { path: hits[0] } : null;
};
// A path from resolveRef, relative to the project or full, to its full path.
const refPath = (p) => path.resolve(ROOT, p);
// The file as of the last commit, for the peek's diff. Null when the file is outside the project, the project is no
// git repo, or the file is not in HEAD, e.g. untracked or only staged.
const git = simpleGit(ROOT);
const headText = async (rel) => {
  if (!insideRoot(refPath(rel))) return null;
  if (!(await git.checkIsRepo())) return null;
  if (!(await git.raw(["ls-tree", "--name-only", "HEAD", "--", rel])).trim()) return null;
  return git.show([`HEAD:${rel}`]);
};
// A failed /refs/* request answers the page with its error, which shows in the page's error banner. It must not reach
// crash(): a peek at a file deleted since the reply would stop the server, and the claude session with it.
const refsRequest = async (res, handle) => {
  try {
    await handle();
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "content-type": "text/plain" }).end(err.stack ?? String(err));
  }
};
const readBody = async (req) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  return JSON.parse(body);
};

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === sessionPath) {
    let body = "";
    for await (const chunk of req) body += chunk;
    onHook(JSON.parse(body));
    res.writeHead(204).end();
    return;
  }
  if (req.method === "POST" && req.url === "/refs/resolve") {
    return refsRequest(res, async () => {
      const { refs } = await readBody(req);
      const resolved = await Promise.all(refs.map(resolveRef));
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ resolved }));
    });
  }
  if (req.method === "GET" && req.url.startsWith("/refs/file?")) {
    return refsRequest(res, async () => {
      const rel = new URL(req.url, "http://x").searchParams.get("path");
      const text = await readFile(refPath(rel), "utf8");
      const head = await headText(rel);
      res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ text, head }));
    });
  }
  // Opens the file at the line in the editor that launch-editor finds running, or $LAUNCH_EDITOR. A missing editor is
  // reported to the page. A failure after the start shows in this terminal (launch-editor prints it).
  if (req.method === "POST" && req.url === "/refs/open") {
    return refsRequest(res, async () => {
      const { path: rel, line } = await readBody(req);
      let failed = null;
      // The column is always given. Without one, launch-editor 2.14.2 defaults it to the number 1, and its Windows command
      // builder calls .includes on every argument, so editors that take the column as its own argument fail.
      launchEditor(line ? `${refPath(rel)}:${line}:1` : refPath(rel), (_file, message) => (failed = message ?? "no editor found"));
      if (failed) res.writeHead(500, { "content-type": "text/plain" }).end(`Could not open ${rel}: ${failed}`);
      else res.writeHead(204).end();
    });
  }
  // Which transcript the server follows, for debugging an empty or stale page.
  if (req.method === "GET" && req.url === "/status") {
    const status = { followed, waitingFor, items: items.length, waiting };
    res.writeHead(200, { "content-type": "application/json" }).end(`${JSON.stringify(status, null, 2)}\n`);
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
    reloadLog("tab refused");
    ws.close(SECOND_TAB, "This session is open in another tab");
    return;
  }
  reloadLog("tab connected");
  clients.add(ws);
  ws.send(JSON.stringify({ t: "settings", settings: readConfig() }));
  if (pty) ws.send(JSON.stringify({ t: "o", d: serializer.serialize() }));
  ws.send(itemsMessage());
  ws.send(JSON.stringify({ t: "waiting", waiting }));

  ws.on("message", (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.t === "i") pty.write(m.d);
    else if (m.t === "s") writeConfig(m.settings);
    else if (m.t === "l") reloadLog(`page: ${m.line}`);
    else if (m.t === "r" && !pty) startClaude(m.cols, m.rows);
    else if (m.t === "r") {
      pty.resize(m.cols, m.rows);
      mirror.resize(m.cols, m.rows);
    }
  });
  ws.on("close", (code) => {
    clients.delete(ws);
    reloadLog(`tab closed ${code}`);
  });
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
// CC_WEB_NO_OPEN: a test by Claude drives its own browser, so the user's browser must not take the one tab.
if (!process.env.CC_WEB_NO_OPEN) await open(url);
