# Following the transcript file

Research for the task "Solve all cases of the page not following the correct transcript file". Tested 2026-11-10 on Claude Code 2.1.322, Windows 11, in an interactive session driven through a pty, with a hook on every event that logs `session_id`, `transcript_path` and `cwd`.

## Result

The server needs three hooks, each sending `session_id` and `transcript_path`. It follows the path that came last.

| Hook               | Matcher                       | Covers                             | Tested                       |
|:-------------------|:------------------------------|:-----------------------------------|:-----------------------------|
| `SessionStart`     | any                           | startup, `/resume`, `/clear`, fork | startup, `/clear`, `/resume` |
| `UserPromptSubmit` | any                           | `/cd`, at the next prompt          | yes                          |
| `PostToolUse`      | `EnterWorktree\|ExitWorktree` | worktree moves mid-turn            | yes                          |

On a switch, the server reads the new file from the start.

## Facts

- The session ID changes only on startup, `/clear`, `/resume` and fork. `SessionStart` fires for each one.
- `/cd` and the worktree tools keep the ID and move the file, `<session_id>.jsonl`, to the new folder's project directory. The file is moved, not copied, so the old path stops existing.
- No hook fires at `/cd`. That includes `CwdChanged`, `UserPromptExpansion`, `InstructionsLoaded`, and hooks in either folder's local settings. The next `UserPromptSubmit` carries the new path.
- `PostToolUse` for `EnterWorktree` and `ExitWorktree` carries the new path, before the rest of the turn is written.
- The transcript records `/cd` as two `system` lines with subtype `local_command`, in the moved file.
- A Bash `cd` or a `! cd` is reset ("Shell cwd was reset to …") and moves nothing. `git worktree add` through Bash doesn't move the session either.
- Compaction keeps the ID and the file.
- Subagents write to `<session>/subagents/agent-<id>.jsonl`. The main path doesn't change.

## Caveats

- Between a `/cd` and the next prompt, the server holds a path that no longer exists. It must not crash on that.
- One older session moved by `/cd` left a 1 KB stub with the same name in the old folder. In both probes the old copy was gone. To search by session ID across project folders, take the copy written most recently.
- Never register a `WorktreeCreate` hook. It replaces git's own worktree creation.
- Don't rely on `agent_id` to filter out subagent events. Issues #91910 and #102428 report subagent compaction events without it.
- A `claude` started from inside Claude Code inherits `CLAUDE_CODE_CHILD_SESSION`, which turns transcript saving off. Strip the `CLAUDE*` variables when probing.
- Not tested: fork, a session launched with `--worktree` (issue #44450 reports a wrong `transcript_path` there), and a `SessionStart` for a phantom session that never gets a file (issue #78455, open).
- Rewind fires no hook (issue #95722 requests one). It keeps the ID and the file, so following the file is unaffected. Showing which turns are dead is separate work.
