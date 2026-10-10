# FLow
- Write slices before any work.
- Never write another slice until a slice is complete
- Either delete the todo item, or move it to new slice.
- If a slice is long reorder it. And either finish it, or move to next slice once a part is done.
- Work done by mistake, without following these rules: add it to the current slice, marked done.

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
