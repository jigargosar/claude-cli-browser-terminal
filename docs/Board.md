# FLow
- Write slices before any work.
- Never write another slice until a slice is complete
- Either delete the todo item, or move it to new slice.
- If a slice is long reorder it. And either finish it, or move to next slice once a part is done.

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

# Slice 5: Verify session tracking
- [ ] SessionStart hook POST times out after 2s, so a dead server fails loudly instead of hanging startup
- [ ] Verify: new, resume picker, `/clear` each report the right session ID
- [ ] Verify: chat in browser and in another terminal, right panel shows only browser replies
