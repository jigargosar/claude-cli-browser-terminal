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

# Slice 14
- [x] Clean exit: `pty.onExit` closes sockets with code 4001 and reason, waits for the close handshake, then exits; the page shows "claude exited". Checked with a socket client against `server.mjs --version`
- [x] Server listens after all handlers exist: a socket that connected while `open(url)` was pending was dropped with 1006
- [x] Reading pane fed from the transcript instead of the Stop hook: SessionStart posts `transcript_path`, the server tails the file (`tail`, chokidar waits for it) into items (prompt, reply, tool_use, tool_result, turn_end), the page shows the last reply item. Resume and compact no longer blank the pane. Scripted haiku run and manual test
- [x] Closed slices moved to `docs/Board-archive.md`; the board holds the Workflow and the open slice
- [ ] reduce sreen estate perhaps group all ab testing, and add persistance for all: Remove the museum terminal looks after A/B is done; tag first
- [ ] Reply views for A/B persisted in localstorage
    - [ ] View "last": today's behavior
    - [ ] View "snap": one assistant text at a time, prev and next, the prompt that led to it as a one-line header
    - [ ] View "outline": a one-line bracket tree of the shown reply's headings, as position context
- [ ] Comments threads on a reply workflow
- [ ] Socket protocol written once at the top of `server.mjs`
