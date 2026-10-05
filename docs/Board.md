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
- [x] Stop hook opens the reply file in VS Code (`code <file>`) only on the session's first reply
- [ ] Verify: first reply in a new session opens its file, later replies don't reopen it
