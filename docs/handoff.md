# Session summary, 2026-11-04

## 1. The cleanup, and how to review it

You weeded the FVP list across many commits. A review means one net diff from the start state to the end state, never commit by commit. `:about` scripts in `package.json` are comments.

## 2. Two new workflow rules

1. Rule 6 keeps the weed task in the list, with its text stored in the rule.
2. Rule 7: understand a task's gist before working on it, and watch for an XY problem. Even a solution stated as fact gets double-checked.
3. Rule 7 paid off right away. The "Dead doc links" fix pointed at the wrong path in the tag. A closer look showed the mentions were not needed at all, so they were deleted.

## 3. Questions, lookups and stops

1. Asked a file's size twice, I gave an inference instead of running `wc`.
2. Causes: I carried the harness "STOP" past your next message, and I read "no action on a question" as banning read-only lookups.
3. Real questions come in two kinds: answer from what I know, or go find out. This is now an open task, with its context recorded verbatim.

## 4. Root cause of the testing problem

Inherited `CLAUDE_CODE_CHILD_SESSION` switches off transcript saving, and the server passes its whole environment to `claude`. This is recorded in CLAUDE.md as a fact only. What removing it does is unknown.

## 5. Release

1. There are now two triggers: a changelog line in the same commit as the change, and a release after a tick.
2. `0.1.8` shipped. Unreleased was checked against the code, and nothing that never worked gets a line.
3. kacl writes the compare links.

## 6. Positioning

The tagline is "Claude CLI finally has a reply button". The idea behind it: an ebook-style reader beside the terminal. Click a sentence for a short reply, or press Reply for a long one. The description now appears everywhere.

## 7. Working agreements

1. Never add or dot a task without your permission.
2. Finish the current task first. Any scope growth is written into the task.
3. Every reply stands on its own.
4. Facts and inferences stay labeled.
5. Corrections get fixed, not dramatized.
