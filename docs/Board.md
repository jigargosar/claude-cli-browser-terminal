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

# Slice 16
- [x] Slices 14 and 15 moved to `docs/Board-archive-2026-10-13.md`
- [ ] panel when wide, inner scroll shown. And it is awway from browser edge. 
- scroll to top when new reply arrives
- make it easy on eyes, i.e. simple easeing or some such thing.
- [ ] Select lines in a reply, and Claude answers about those lines in a format that shows the change as a diff. No concurrent editing.
- [ ] Concurrent editing of one shared doc. The server holds it in Yjs and is the only writer of the file. The user edits in the page. Claude edits through `doc_read` and `doc_edit` on an `/mcp` endpoint of the server.
- Fact: a file change the user saves between Claude's turns reaches Claude with the user's next message, as the changed lines with line numbers. Verified 2026-10-15.
- Fact: after that notice, Claude's Edit on the file passes without a re-read. Verified 2026-10-15.
