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
- [x] Comment out VS Code open in the Stop hook
