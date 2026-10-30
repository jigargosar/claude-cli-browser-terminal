# FVP friction

Problems with `docs/fvp-rules.md`, parked instead of fixed on the spot. Claude adds a `+` each time one happens again. A new problem gets a new line with one `+`. When a line reaches `+++`, the user unfreezes the rules and fixes that line's rule only.

- Step 1 blocks fixing list lines the current task broke (lines 6 and 65). +
- No step covers a task finished as a side effect of another (line 73 by line 74). +
- Step 14 does not say whose list edits it means, so when the user's dots get committed is unclear. +
- No step says to read the list from disk at the start. A session reported zero dots twice. ++
- No step says when Claude may ask the user something (the OK task, the delete set). ++
- Claude planned to mark `[x]` before doing the work, which breaks step 5. +
- Step 6 compares against the last dotted task, which can sit far up the screen. +
