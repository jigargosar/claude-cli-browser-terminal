# Collaboration: plan

Ideas from the session of 2026-11-10 on how the user and Claude work together. Each item says where it lives, what it does, and when it is done.

## 1. Permission rule

- Where: global CLAUDE.md.
- Text: "Before any action that can't be undone or that destroys data, ask for permission with AskUserQuestion. Examples: deleting files, branches or worktrees, rewriting git history, force-pushing, releasing, publishing, sending data to outside services. Commits and plain pushes need no permission."
- Done when: no such action runs without an AskUserQuestion answer just before it.

## 2. Announcement

- Where: global CLAUDE.md.
- What: before the first tool call of a turn, a few short sentences give the mode, Claude's reading of the request, and the objective. Then the steps, as one numbered list with no options inside. If the steps change mid-run, one line announces the change.
- Done when: every turn with tool calls opens with an announcement.

## 3. Step numbers on tool calls

- Where: global CLAUDE.md.
- What: every tool call's description starts with "Step N:", N from the announcement. A call outside the steps first gets a one-line change of plan, as in item 2.
- Done when: the user can match every call to a step.

## 4. Modes glossary

- Where: global CLAUDE.md.
- Modes:
    - research: reading docs, the web and files.
    - probe: experiments in a scratch folder.
    - build: editing project files.
    - test: running what was built.
    - ship: committing and releasing.
- Behavior: Claude switches modes on its own and names each switch in one line. The user presses Esc to stop.
- Done when: every announcement and switch names a mode from the list.

## 5. Narration exception

- Where: global CLAUDE.md, next to the no-narration rule.
- Text: "Announcements, mode switches, step lines and progress lines are not narration."
- Done when: the two rules no longer conflict.

## 6. Tool-call hook

- Where: one script, registered in the global settings for three events.
- `UserPromptSubmit`: resets the count and the start time for the session, kept in a small state file named by `session_id`.
- `PostToolUse`: adds 1 and shows the user "call N · M min" as a `systemMessage`. Every 5 calls it adds context that asks Claude for one progress line against the steps.
- `PreToolUse`: past 15 calls or 10 minutes, it denies the call with the reason "Time box reached. Report what you found and wait."
- The limits are settings.
- Done when: the count shows on each call, and a run stops at the limit with a report.

## 7. Page banner for blocked messages

- Where: this project's server and page.
- What: when the transcript gains a `system` line of subtype `model_refusal_no_fallback`, the page shows "Claude didn't see your last message", with that message's text, so it can be resent.
- Done when: a blocked message shows the banner in the page.

## 8. Probe script

- Where: this project, a script with a README.
- What: starts `claude` in a scratch folder with the `CLAUDE*` variables stripped, and a hook that logs every event except `WorktreeCreate`, which would replace git's own worktree creation. A driver types the steps from a file and dumps the screen. One command runs a scenario such as `/cd` or a worktree move.
- Done when: the `/cd` and worktree probes of 2026-11-10 rerun with one command each. See `docs/tasks/transcript-following/research.md`.
