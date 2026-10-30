# FVP friction

Problems with `docs/fvp-rules.md`, parked instead of fixed on the spot. Claude adds a `+` each time one happens again. A new problem gets a new line with one `+`. When a line reaches `+++`, the user unfreezes the rules and fixes that line's rule only.

- Step 1 blocks fixing list lines the current task broke (lines 6 and 65). +
- No step covers a task finished as a side effect of another (line 73 by line 74). +
- Step 14 does not say whose list edits it means, so when the user's dots get committed is unclear. ++
- No step says to read the list from disk at the start. A session reported zero dots twice. ++
- No step says when Claude may ask the user something (the OK task, the delete set, the Alt+Enter key). +++
- Claude planned to mark `[x]` before doing the work, which breaks step 5. +
- Step 6 compares against the last dotted task, which can sit far up the screen. +
- No step lets the user redo the dotted chain when it no longer fits (`fv-faq.md:162`). +
- Claude names the next task by its line number. The user wants the task's text. +
- Step 6 waits for the user to dot after each task. The user's default: Claude goes on through the dots unless the user asks about something. +
- Step 1 is too strong: "never rewords or groups other lines". Rewording or merging tasks is fine when pragmatic, with the user's explicit permission and the change shown first. "Group" is the wrong word: the case is merging two tasks into one, or marking both done. +
- No step says what "go on through the dots" looks like: show the next task and the plan, then wait for the user's answer. Claude once changed a file without showing the plan first. +
