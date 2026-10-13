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
- [ ] release tarball
- [ ] Terminal keys: shift-enter sends a newline to claude
- [ ] Terminal keys: ctrl-w deletes the last word in claude instead of closing the tab
- [ ] Focus: a strong indicator shows which pane has focus; a click or key switches to the terminal; with no focus, the terminal gets it
- [ ] Terminal scrolling while the cursor is in claude's input box
- [ ] Richer reply pane (right).
    - [ ] Thinking blocks from the transcript, toggleable (server keeps them as items; page shows them on demand)
    - [ ] A reply as a working document: ask for clarification on the same page, the answer lands next to the question (comments, Goal 2 and 3)
    - [ ] File paths in a reply open in the editor on click
    - [ ] A file in the panel: bring it in, read it, edit it, ask about it
