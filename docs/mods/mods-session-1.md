# Mods

A mod turns Claude Code events into state that the server keeps per session and the page shows. This doc sets out the options with their trade-offs, a recommended design, and the decisions the user must confirm.

Each claim is tagged: [fact] checked in the code or docs of this repo, [assumption] from memory or not yet checked, [proposal] a choice made for this design.

## 1. Facts and assumptions

1. [fact] `server.mjs` passes a hook to claude with `--settings`. The SessionStart hook POSTs the transcript path to the server. This is the working precedent for a mod's producer side.
2. [fact] `server.mjs` tails the transcript with chokidar.
3. [assumption] Claude Code hooks, as named from memory: SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, Notification, Stop, SubagentStop, PreCompact, SessionEnd. Verify the names and payload fields against the installed version before building.
4. [assumption] A hook exit code 2 blocks the action it guards.
5. [assumption] The transcript does not give permission prompts, tool activity, or working and idle state. Check against a real transcript before relying on it.

## 2. Terms

- Producer: the hook command that writes an event.
- Transport: how an event moves from the hook to the server.
- Store: where events persist.
- Mod: a server-side module that folds events into state and describes a view for the page.

## 3. Requirements

Must:
1. Claude never waits on, or fails because of, a mod. [proposal]
2. Events survive a server restart and a server that is down while the event happens. [proposal]
3. A session's state can be rebuilt from its events alone. [proposal]
4. A bad event is skipped and counted, never silently dropped. [proposal]
5. The page shows the session state without a reload. [proposal]

Should:
1. A mod can be added without touching the core. [proposal]
2. Tool calls pair with their results. [proposal]
3. Old events are pruned. [proposal]

Not in v1:
1. Several concurrent sessions per server. Conflicts with Decision 1 in CLAUDE.md. [fact]
2. Anything written back into claude. [proposal]
3. Telemetry export (OpenTelemetry). [proposal]

## 4. Options

### 4.1 Event source

1. Hooks through `--settings`. Live, per event. Depends on hook names and payloads, which may change between Claude Code versions. [assumption] Recommended.
2. Transcript only. Already built. Lacks permission prompts and working state. [assumption, see 1.5]
3. OpenTelemetry from claude. Built for metrics. Needs a collector. [assumption]

### 4.2 Transport

1. The hook appends one JSON line to a file under `.ccw-cache/`. The server tails the file, as it already does for the transcript. Works when the server is down, and the hook never waits on a network call. [proposal] Recommended.
2. The hook POSTs to the server over localhost. Simple. Events are lost while the server is down. A slow server stalls the hook. [proposal]
3. A named pipe or Unix socket. Fast. Platform-specific code, and a Windows path to test on top of the POSIX one. [proposal]

### 4.3 Store

1. The same JSONL file serves as transport and store. One source, no sync. [proposal] Recommended.
2. An in-memory map, rebuilt from the file on start. Same durability as option 1, more code. [proposal]
3. SQLite. Queries are easy. A native dependency and a second source of truth to keep in step with the file. [proposal]

### 4.4 Mod packaging

1. Built-in mods, listed in one file in `mods/`, loaded at server start. No dynamic loading. [proposal] Recommended for v1.
2. A user mods folder, loaded at start. Needs a loader contract, versioning, and error isolation. [proposal] Phase 3.
3. A Claude Code plugin. Covers every claude session, including ones the server does not own, so the server cannot rely on it. [assumption]

### 4.5 Hook installation

1. ccw passes the hook settings with `--settings`, as today. Works only for sessions ccw starts. Global config untouched. [fact for the mechanism, see 1.1] Recommended.
2. A plugin installed once. Covers claude sessions outside ccw, which ccw cannot match to a page. [assumption]

### 4.6 Failure policy for the hook

1. The hook catches its own errors, appends them to `.ccw-cache/hook-errors.log`, and exits 0. Claude continues. The error is recorded, not swallowed. [proposal] Recommended. This is an explicit exception to the global rule "never swallow an error", and the user must confirm it.
2. The hook lets errors crash. A crashing PreToolUse hook blocks the tool call, which is worse than a missing event. [assumption, see 1.4]

### 4.7 Privacy

1. Store a summary: tool name, a truncated input (200 characters), and no file contents. [proposal] Recommended.
2. Store full tool input. Useful for debugging. Tool inputs can hold secrets, file contents, and env values. [proposal]

### 4.8 Retention

1. Keep the last 30 days of session files, capped at 200 MB. [proposal] Recommended.
2. Keep forever. Simple. Grows without limit. [proposal]

## 5. Recommended design

1. Producer: a small hook script written by ccw into the `--settings` JSON. It appends one line per event to `.ccw-cache/events/<server-id>.jsonl`. [proposal]
2. Each line is `{ v, ts, session, type, data }`, where `data` is normalized and the raw payload is kept only when a field is unknown. [proposal]
3. The server tails the file. A line that fails to parse is counted and logged. Unknown types are kept as raw. [proposal]
4. Mods: `mods/<name>.mjs`, each exporting `{ events, reduce(state, event), view(state) }`. `reduce` is a pure function. The core applies it in order, so the state equals the fold of the file. [proposal]
5. The page gets the folded state over the existing socket and renders the mod's view in the right pane, under a Reply | Activity switch. [proposal]
6. Concurrency: appends are one line each, well under 4 KB, and opened in append mode. [assumption: a small append is not interleaved on Windows. Not tested.] The hook retries once on a write error, then logs. [proposal]
7. No token. The file transport has no network entry point, so there is nothing to authenticate. [proposal] [assumption: the hook runs as the same user as the server.]

## 6. Robustness checklist

1. Claude keeps running when the server is down, slow, or absent. [proposal]
2. A missing `.ccw-cache/` directory is created by the hook. [proposal]
3. Windows: the hook command path is quoted, and the file path has no spaces in its generated name. [proposal]
4. A server restart replays the file and reaches the same state. [proposal]
5. A truncated last line (a crash mid-write) is skipped and counted. [proposal]
6. A mod that throws in `reduce` is reported on the page as a mod error, and the other mods keep working. [proposal]
7. Pruning never touches the file of a running session. [proposal]
8. A reload of the server does not duplicate events. Each line carries `seq`, and the tail starts from the last applied `seq`. [proposal]

## 7. Testing

1. Unit: each mod's `reduce` on fixture files, including a truncated line and an unknown type. [proposal]
2. Integration: `pnpm test` (port 7682, Haiku). Start claude with a prompt that runs one tool. Assert the file holds the expected events, with the CLAUDE variables removed from the server's environment. [fact for the port and the CLAUDE rule, see CLAUDE.md]
3. Failure: stop the server during a turn, then check the events arrive after restart. Break the hook path and check claude keeps working and the error log grows. [proposal]
4. Browser: `browser-test` skill checks the Activity view against the approved mockup. [fact for the skill, proposal for the use]

## 8. Phasing

1. Phase 0: user confirms section 9. Activity mockup approved. [proposal]
2. Phase 1: hook producer, JSONL, server tail, one built-in mod for status and tool feed, Activity view. [proposal]
3. Phase 2: files touched, subagents, pairing of tool calls. [proposal]
4. Phase 3: user mods folder with a loader contract. [proposal]

## 9. Decisions for the user

1. Hook errors: caught, logged, exit 0 (recommended), which overrides the global "never swallow" rule for this one place. Or let them crash.
2. Packaging: built-in mods in v1 (recommended), user mods later. Or user mods in v1.
3. Transport: file tail (recommended), or localhost POST.
4. Privacy: truncated summary (recommended), or full input.
5. Retention: 30 days and 200 MB (recommended), or forever.
6. Sessions: past runs of this server's claude (recommended), or concurrent sessions, which breaks Decision 1 of CLAUDE.md.
7. OpenTelemetry: out of scope (recommended), or in v1.
