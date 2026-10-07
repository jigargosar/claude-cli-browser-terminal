# claude-cli-browser-terminal

Claude Code in the browser: terminal left, last reply right. Work tracked in `docs/Board.md`; follow its Flow.

- `server.mjs`: spawns `claude`, streams the terminal over websocket, watches the session's reply file.
- `web/index.html`: the page (xterm.js terminal, markdown reply pane); edits reload open tabs.
- `.claude/hooks/`: `session-start.mjs` (SessionStart), `last-reply.mjs` (Stop), `open-in-vscode.mjs` (background VS Code open).
- `docs/Terminal.md`: terminal sizing, wrapping and looks.
- For now single `claude` session per server. Closing or reloading the tab only detaches; `claude` exit stops the server.
- Browser libraries are pinned in `package.json` and served from `node_modules` at `/vendor/*`; no CDN.
- Stop hook writes every session's replies to `.cc-web/replies/<session_id>.md`; the server shows only its own.
- `CC_WEB_SESSION_URL`: set only on the server's `claude`; its SessionStart hook POSTs `session_id` there.
- `CC_WEB_OPEN_REPLIES_IN_VSCODE` (`"true"`/`"false"`, required, `.claude/settings.json`): terminal sessions open replies in VS Code for readability.
- Dev: `pnpm new`/`pnpm resume` on port 7681. Test: `pnpm test` on port 7682 (Haiku); never connect tests to 7681.
