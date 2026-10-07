# claude-cli-browser-terminal

Claude Code in the browser: terminal left, last reply right. Work tracked in `docs/Board.md`.

- For now single `claude` session per server.
- Stop hook writes every session's replies to `.cc-web/replies/<session_id>.md`; the server shows only its own.
- `CC_WEB_SESSION_URL`: set only on the server's `claude`; its SessionStart hook POSTs `session_id` there.
- `CC_WEB_OPEN_REPLIES_IN_VSCODE` (`"true"`/`"false"`, required, `.claude/settings.local.json`): terminal sessions open replies in VS Code for readability.
- Dev: `pnpm new`/`pnpm resume` on port 7681. Test: `pnpm test` on port 7682 (Haiku); never connect tests to 7681.
