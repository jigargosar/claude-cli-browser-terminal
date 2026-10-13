# Handoff, 2026-10-13

Edits made while wrapping up the session, with the intention behind each. Read this to interpret the uncommitted diff, then delete the file.

1. Project `CLAUDE.md`, the `server.mjs` line rewritten. It said the server sends the latest reply. The reply now comes from claude's transcript file, tailed by the server; the line says so and points to `web/socket.js` as the one place the socket protocol is written.
2. Project `CLAUDE.md`, new section "Terminal basics". The session spent many turns re-deriving node-pty, ConPTY, the headless mirror and the Ink duplicate lines. Five lines keep that knowledge so the next session does not redo the research or chase the duplicate lines again (out of scope by decision).
3. Global `~/.claude/CLAUDE.md`, three lines under Tools. Each comes from a session failure: Bash commands carried whole files and their output was dumped into the conversation (now: scratchpad log plus bounded tail, one call); file content went through heredocs (now: Edit and Write only); a task was retried without an end (now: stop after three failed attempts).
4. `docs/Brain-dump-2026-10-13.md`: the user's brain dump saved verbatim, one retyped word corrected after a check. The nine unordered tasks at the end of Slice 14 in `docs/Board.md` were derived from it; the user prioritizes them next.
5. `docs/Board-archive-2026-10-13.md`: closed slices moved out of the board, date suffix for sorting; references in `CLAUDE.md` and the board updated.

Open at handover: the page split (Slice 14, unticked) waits for a manual browser check; the nine tasks wait for the user's order.
