# Workflow

The board exists so that all known work is written in one list, and the next task is never a guess.

- The last slice is the open slice. All other slices are closed.
- The open slice is one list of tasks: all known work, ticked or not. A task may have a sub-list of its steps, one level, each step ticked on its own.
- Any task may be written at any time. Work on a task only after it is written.
- Reorder tasks when it helps.
- When a task is done and tested: tick it, move it below the last ticked task, commit.
- Work done without a task: add it to the open slice, ticked.
- A task that is no longer wanted is deleted.
- Start a new slice when the context changes, or when the open slice is too long. Move every unticked task into it. The old slice is then closed.
- When a part of a long slice is done and tested, suggest a new slice.
- Closed slices need not follow the Workflow. Do not read a closed slice as an example of the rules.

# Slice 1: Side-by-side reply preview POC
- [x] Create `.claude/hooks/last-reply.mjs`: Stop hook writes `last_assistant_message` to `.claude/replies/<session_id>.md`
- [x] Register Stop hook in `.claude/settings.local.json` using `$CLAUDE_PROJECT_DIR`
- [x] Start new `claude` session in `xterm-eval` from own terminal (not from inside a Claude session)
- [x] Send a prompt, confirm reply file is created
- [x] Open reply file in VS Code, Ctrl+K V for side preview
- [x] Send another prompt, confirm preview updates

# Slice 2: Auto-open reply file
- [x] Stop hook opens the reply file in VS Code (`code <file>`) after every reply
- [x] Verify: each reply opens or focuses its session's file

# Slice 3: Reply preview in browser
- [x] Move replies out of `.claude/` into top-level `.cc-web/`.
- [x] Update references to new `.cc-web`
- [x] Extend `server.mjs`: left terminal (xterm.js), right last reply rendered as markdown, updates after each reply
- [x] One claude per server: started at server start with explicit `new` or `resume`, never per browser connection
- [x] Reload/close tab only detaches; reconnect restores the screen; claude exit stops the server
- [x] Verify: start server from own terminal, chat, last reply shows on the right, reload keeps the session

# Slice 4: Right panel shows only the server's session
- [x] Stop hook opens VS Code only when `CC_WEB_SESSION_URL` is not set (skipped for the server's claude)
- [x] Server: spawns claude with env `CC_WEB_SESSION_URL` = URL unique to that claude (`/session/<claude-instance-id>`)
- [x] SessionStart hook: if `CC_WEB_SESSION_URL` is set, POST `{ session_id }` to it; server stores it as current session
- [x] Server: watch only `.cc-web/replies/<current session_id>.md`
- [x] Toggle VS Code opening: `CC_WEB_OPEN_REPLIES_IN_VSCODE` in `.claude/settings.local.json` `env`
- [x] Stop hook doesn't wait for VS Code: `open-in-vscode.mjs` runs in the background, failure shows a node-notifier toast
- [x] `CLAUDE.md`: overall picture of server, hooks and env vars
- [x] Fixed ports: dev 7681 (`pnpm new`/`resume`), test 7682 (`pnpm test`); port is a required first arg
- [x] Browser libraries pinned in `package.json`, served from `node_modules` at `/vendor/*` (no CDN)
- [x] Viewer socket error (tab closed/refreshed mid-send) drops only that viewer, server keeps running

# Slice 5: Page layout and markdown rendering
- [x] Padding around the terminal, not touching the window edge
- [x] Min widths for terminal and reply panel
- [x] Proper markdown rendering: readable type, tables, syntax-highlighted code
- [x] No double scrollbars; narrow windows stack the panels
- [x] Page moved out of `server.mjs` into `web/index.html`

# Slice 6: Reading pane and terminal looks
- [x] Reply pane is a light reading page; inline code in sans, no boxes
- [x] Aa panel: theme (light, sepia, dark), font, text size, line spacing, width
- [x] Terminal dropdown to compare looks: Prototype (`62618d0`, 15px, black, no padding) and Slice 5 (`448568e`, 14px on `#16181d`, padded)
- [x] Tried a Windows Terminal look (JetBrains Mono 16px, One Half Dark on `#000B0C`); removed, kept as tag `windows-terminal-look`
- [x] Tags `prototype-terminal-look`, `slice5-terminal-look`
- [x] `web/index.html` edits reload open tabs

# Slice 7: Terminal with prototype size and color, Slice 5 padding
- [x] New default terminal look: Cascadia Mono 15px on black (prototype), padding 14/6/14/18px (Slice 5)
- [x] Added to the terminal dropdown as Slice 7; Prototype and Slice 5 stay for comparison

# Slice 8: Project settings, CLAUDE.md and GitHub repo
- [x] `CLAUDE.md` heading matches repo name
- [x] Hooks move to committed `.claude/settings.json`; `settings.local.json` keeps only `permissions`
- [x] `CC_WEB_OPEN_REPLIES_IN_VSCODE` (`"true"`) moves as is to `settings.json`
- [x] `CLAUDE.md`: env var line points to `.claude/settings.json`
- [x] `CLAUDE.md`: file map (`server.mjs`, `web/index.html`, `.claude/hooks/`)
- [x] `CLAUDE.md`: tab close/reload only detaches; claude exit stops the server
- [x] `CLAUDE.md`: `docs/Terminal.md` for terminal sizing and looks
- [x] `CLAUDE.md`: follow Flow in `docs/Board.md`
- [x] `CLAUDE.md`: browser libraries served from `node_modules` at `/vendor/*`, no CDN
- [x] `package.json` name `xterm-eval` → `claude-cli-browser-terminal`
- [x] Create public GitHub repo with `gh`, add remote, push

# Slice 9: CLAUDE.md, terminal width, pane divider, chat widget
- [x] CLAUDE.md: Done when
- [x] CLAUDE.md: tree with descriptions
- [x] CLAUDE.md: config, hooks, session lifecycle
- [x] Terminal word-wrap width bug: `claude` starts at the first tab's size
- [x] Draggable pane divider
- [x] How does a chat start? Select reply text, type a comment, Add; repeat for as many as needed. Send submits all comments as one message.
- [x] How does the response come back to the chat? As Claude's next normal reply; the message asks it to repeat each quote and comment, then answer under it.
- [x] What happens to the existing reply? Replaced by the next reply, as today; comments clear on Send.
- [x] Build: select text, one comment, Send submits quote + comment to claude (bracketed paste + Enter in one write, verified on 7682)

# Slice 10: One server per session, free port
- [x] Server takes a free port with `get-port`; an explicit port stays possible (`pnpm test` keeps 7682)
- [x] Server writes `.cc-web/sessions/<session_id>.json` with `{ port, cwd }`; the port is the address, the session ID the identity
- [x] `resume <session_id>` asks for the stored port first, so old tabs reconnect
- [x] `GET /status` answers `{ session_id, cwd }`
- [x] `pnpm status`: lists records, checks each with `/status`, deletes stale ones (no PIDs, crash-safe)
- [x] Verify: two servers in this repo at once, both work; stop one, status removes it; resume gets the same port
- [x] Checked: a killed server takes its claude with it, no orphan claude
- [x] Simpler, like a terminal: remove session records, port reuse, `/status` and `pnpm status`; every start takes a free port
- [x] Server args: `[port] [claude args]`, claude args pass through as is
- [x] Stop hook POSTs the reply to the server, kept in memory; no reply-file watch
- [x] Verify on 7682 with haiku: reply shows, reload keeps it
- [x] Tried: server passes its hooks with `--settings` (works in any directory). Dropped: too cryptic; hooks stay in `.claude/settings.json`

# Slice 11: Goal 1, daily use without comments
- [x] Remove the single comment feature; kept as tag `single-comment`
- [x] `CLAUDE.md`: staggered goals (1 daily use, 2 one comment, 3 many comments)
- [x] Server builds the hook settings JSON at run time and passes it with `--settings`; the command has the full path to `hooks/reply.mjs`. Remove `hooks/settings.json` and `CC_WEB_DIR`
- [x] Check Windows quoting of the JSON argument through node-pty: works, the SessionStart hook reached the server (scripted tab on 7682, no message sent)
- [x] Server opens its URL in the default browser (`open`)
- [x] No port arg: all args go to claude; port from `CC_WEB_PORT` (`pnpm test` sets 7682 with `cross-env`), else a free one
- [x] Verify one session on a random port: reply shows, reload keeps it, a plain `claude` in another terminal sends nothing to the server
- [x] Verify two servers on random ports: each panel shows only its own reply; a plain `claude` in parallel works too

# Slice 12: Goal 1, daily use in other projects
- [x] Verify on 7682 with haiku: selecting reply text opens no box; terminal and reply still work
- [x] Verify one session on 7682 with haiku: reply shows, reload keeps it, a plain `claude` in another terminal sends nothing to the server
- [x] Server refuses a second tab while one is connected; the page shows why (Decision 2.3). Verified with a duplicated tab
- [x] current repo tarballs go in folder: published-versions. Other projects install via `pnpm add -E -D <path>`. Checked in a scratch project
- [x] `package.json`: version 0.1.0, `bin` `ccw`, `files`, `release` script (`pnpm pack` into `published-versions`). Shebang in `server.mjs`
- [x] Hook code inlined in the `--settings` command (`node -e`); `hooks/reply.mjs` removed. Checked in bash and cmd against a local server

# Slice 13: Goal 1, ccw package without extras
- [x] Tag `48e16c6` as `poor-mans-hook`; delete `.claude/hooks/`, its Stop hook and env var in `.claude/settings.json`, and `node-notifier`. Later in another project
- [x] `impeccable` moves to `devDependencies`
- [x] Browser libraries in an installed copy: bundle `web/` with Vite; the server serves the build (`dist/`, sirv). Browser libraries in devDependencies
- [x] Test in this project with `pnpm test` on the build
- [x] Release to `published-versions`
- [ ] Resize only when the size changed
    - [ ] Server skips `pty.resize` and `mirror.resize` when cols and rows are unchanged. Verify: a refresh causes no redraw
    - [ ] One fit at startup: no `r` after claude starts unless the pane changed. Verify with a server log of `r` messages
- [ ] Measure resize duplicates: set `windowsPty` on the browser terminal and the mirror, drag the divider, compare with a Windows Terminal resize, report what differs. The Ink duplicates seen in Windows Terminal are not ours
- [ ] Server survives any socket message order: an `i` before the pty exists does not crash it
- [ ] Clean exit: `pty.onExit` closes sockets with a code and reason before `process.exit`; the page shows "claude exited"
- [ ] Reading pane fed from the transcript instead of the Stop hook
    - [ ] SessionStart hook posts `transcript_path` and `source`; the Stop hook is removed
    - [ ] Server tails the transcript with a library; waits for a file that does not exist yet; switches file on a new SessionStart
    - [ ] Server parses each line by `type`; skips `attachment`, `file-history-snapshot`, `last-prompt`, `ai-title`, `mode`, `permission-mode`, `atis-latch`; never logs or sends a raw line
    - [ ] Socket sends items to the page: user prompt, assistant text, tool_use (name, input), tool_result, turn end (`end_turn` or `turn_duration`). Shape stays close to the file
    - [ ] Page keeps the full item list in memory, not surfaced, for later views
    - [ ] Reading pane shows the last assistant text from the item stream, same look as today. Blank after compact or resume is accepted
    - [ ] Verify with `pnpm test`: reply shows, reload keeps it, `/clear` blanks it
- [ ] Reply views for A/B: a picker next to the terminal look picker, persisted in localStorage
    - [ ] View "last": today's behavior
    - [ ] View "snap": one assistant text at a time, prev and next, the prompt that led to it as a one-line header
    - [ ] View "outline": a one-line bracket tree of the shown reply's headings, as position context
- [ ] More of the transcript in the reading pane
    - [ ] Tool calls and results as collapsed one-liners between texts, off by default, a toggle per view
    - [ ] AskUserQuestion rendered as a question, read only
    - [ ] A pending tool_use without tool_result shown as "waiting on terminal"
- [ ] Answer from the page
    - [ ] Send a prompt from the page: text plus Enter into the pty
    - [ ] Answer AskUserQuestion by sending the keystrokes the TUI dialog expects
    - [ ] PreToolUse hook as a channel: hook posts, page shows allow or deny, hook returns the decision. Test first whether it can answer AskUserQuestion with `updatedInput`
- [ ] Comments on a reply
    - [ ] Goal 2: select text in a reply, write a comment, send it with a quote of the text and the message id
    - [ ] Goal 3: many comments, sent as one message
    - [ ] Thread: a comment answered in the same session is shown next to the text it is about
- [ ] Split the page script into modules: terminal, divider, reader, socket, views
- [ ] Remove the museum terminal looks after A/B is done; tag first
- [ ] Socket protocol written once at the top of `server.mjs`
- [ ] Research: `useConptyDll: true` on `spawn`, does it change anything visible
- [ ] Research: Agent SDK as a full frontend, what it costs versus the PTY path
