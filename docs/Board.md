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
- [x] Closed slices moved to `docs/Board-archive-2026-10-13.md`; the board holds the Workflow and the open slice
- [x] Lab: every A/B experiment (terminal look now, reply view next) in one panel, all choices in one localStorage key `cc-web.lab`. The terminal look dropdown is gone. Manual test: pick each look, reload, the choice stays
- [x] No reply bar: one gear floats over the top right of the reply text and opens the only panel (status, Lab, reading settings). Default split 65% for the terminal. Manual test: gear opens, text starts at the top, settings still work
- [x] Mockup `docs/mockups/outline.html` deleted: a markdown breadcrumb is not wanted
- [x] Socket protocol written once, in the header of `web/socket.js`
- [x] Page split by change rate: `index.html` markup only, `base.css`, `reader.css`, `main.js` wiring, stable modules (`terminal.js`, `divider.js`, `socket.js`, `markdown.js`, `reader.js`, `lab.js`), `views/last.js`. Lab rows are built by `lab.js`, so an experiment adds no markup. Manual test: terminal, divider, gear panel, looks, reading settings, reply all work
- [x] Release 0.1.1 packed to `published-versions/` with `pnpm release`
- [x] Terminal keys: shift-enter sends LF (Ctrl+J) to claude; both browser events swallowed, or xterm adds a CR and submits. Manual test
- [x] Default split 50/50, terminal floor 480px so the reply pane can take 60%. The reply pane was too small at 65/35. Double-click the divider to take the new default. Manual test
- [x] Terminal keys: ctrl-w cannot be taken from Chrome (the page never sees it, a leave guard never fires). Ctrl-backspace deletes the word; a closed tab reopens with the typed text. Manual test
- [x] CLAUDE.md rule: before any edit, read the Board Workflow and write the task first

# Slice 15
- [x] Reply pane shows only the last reply: `views/last.js` back   without a scroll reset, `views/all.js` and its CSS deleted, `docs/mockups/reply.html` deleted. Manual test
- [x] Ctrl+V pastes text, as in Windows Terminal: xterm sent it as `\x16` and blocked the browser paste; now the browser pastes. Manual test
- [x] Focus key: Alt+` toggles the panes (chosen over Ctrl+` and Alt+\ as the easier key). Manual test
- [x] Release 0.1.2 packed to `published-versions/` with `pnpm release`
- [x] Terminal look: Slice 5 only; the prototype and Slice 7 looks deleted, and the Lab (`lab.js`, its panel rows) with them
- [x] Release 0.1.3 packed to `published-versions/` with `pnpm release`
- [x] Settings in `<project>/.ccw-cache/config.json` instead of localStorage: localStorage is per origin, and the port changes each run. The folder ignores itself with its own `.gitignore`. Server pushes them on connect (`settings`, like `items`); the page saves with `s`. Writes are atomic (write-file-atomic). Not browser-tested
- [x] Fail loudly: an uncaught server error sends its stack to the tab, prints it, exits. An uncaught page error shows its stack in a red banner. Not browser-tested
- [ ] Focus cue: a clear sign of the focused pane. Outline, ring, top bar and dimming were tried and dropped
- [ ] Richer reply pane (right).
    - [ ] Thinking blocks from the transcript, toggleable (server keeps them as items; page shows them on demand)
    - [ ] A reply as a working document: ask for clarification on the same page, the answer lands next to the question (comments, Goal 2 and 3)
    - [ ] File paths in a reply open in the editor on click
    - [ ] A file in the panel: bring it in, read it, edit it, ask about it
- [ ] Terminal scrolling while the cursor is in claude's input box

## Waiting For
- [ ] Bug: the page is blank for seconds at start
- [ ] Bug: Enter does not submit (perhaps when there are blanks )
    - [x] Ruled out: claude submits "say hi\r" whether it arrives in one pty write or two
    - [x] Diagnostic: the console logs every input chunk with CR or LF; on the bug, see whether the page sent `\r` or `\n`
    - [ ] Suspect: the `\x16` from a failed Ctrl+V made the next Enter literal. Watch whether the bug returns now that Ctrl+V pastes
