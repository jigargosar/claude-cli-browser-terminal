# Task list view

Pain: details are everywhere, and the IDE can't fold, search or edit the tracking file without friction.

## Pain

- Long details sit under Inbox items and tasks, and the list becomes hard to read.
- Moving details out of the list means going back and forth, with no way to view them on demand.
- WebStorm forgets folds, its search opens them, and its vim mode is slow.
- Every external tool adds its own friction.

## Spike

The spike tests whether editing the list inside ccw removes that pain.

### What it adds to ccw

- Alt+L opens `docs/fvp-list.md` in an editor over the terminal pane. The reply stays visible beside it. Alt+L again closes it.
- A link to `docs/fvp-list.md` in Claude's reply opens the same editor at that line.
- The editor is CodeMirror with vim keys.
- Every item with sub-bullets folds to one line. That covers Inbox items and tasks alike.
- `za` opens or closes one item. `zM` closes all, and `zR` opens all.
- Folds are remembered after a reload.
- Tab cycles the checkbox `[ ]`, `[.]`, `[x]` in vim normal mode.
- The user's edits save on their own, without a save key.
- Claude's edits to the file show up in the editor right away. The cursor and folds stay where they were.
- If both edit at the same moment, a banner asks which version wins. The other one stays one click away.

### Where it is written down

- A two-line task at the end of `docs/fvp-list.md`, dotted, with its pain line and a link to the plan.
- This file is the plan, since it is too long for the list.

### How to test it, after a server restart

1. Press Alt+L. Every item shows as one line.
2. Open a task with `za`, then close and reopen the editor. The task is still open.
3. Press Tab on a task. The checkbox changes.
4. Press Alt+Tab to switch windows. No checkbox changes.
5. Edit a line in the editor. Close and reopen the editor, then reload the page. The edit should be there both times.
6. Ask Claude to add a task to the Inbox. Then check the editor. The line should be there.
7. Use vim keys for a minute of real weeding. Judge whether it is fast and free of friction.

## Outcome, 2026-11-28

- The spike was dropped. Its branch `worktree-task-list-view` stays on the remote at `1c51d0f`, for reference only.
- Spike findings:
    - The left pane stacks three views: terminal, task list editor, file peek. Focus between them and the reply pane has many small edge cases.
    - In the narrow left pane, items wrap to 2-4 rows, folded or not.
    - There are two CodeMirror setups: the read-only peek and the editable task list.
    - Editing in CodeMirror, with proper vim config, is a much bigger job than expected. There is no spec for it.
- Layout ideas, not decided:
    - The left pane shows one document, or none. The terminal opens as a popup over it. The user sets the width. No tabs.
    - Risk: Claude asks for permission inside the terminal, so a closed popup could hide the question.
