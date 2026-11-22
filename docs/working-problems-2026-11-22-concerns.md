# Working problems, 2026-11-22: the user's concerns

- Written at 15:45, near the end of the second session of the day.
- The user and Claude go through the concerns one at a time.
- Each concern gets Claude's suggestion and what was decided.
- Related: `docs/working-problems-2026-11-22-first-turns.md`.

## 1. Claude runs wasteful commands unasked

- Example: a search of the whole projects folder for one file name. It timed out after 20 seconds.
- The user's question: why does Claude do that, and how can the user prevent it?
- Why: a file Claude had written was not where Claude put it. Claude went looking, and picked the widest search, without asking.
- One question to the user would have answered it. The user had renamed the file.
- Suggestion from Claude: a brake, not one more rule.
    - Now: Esc, then the word "stop".
    - Later: a hook that asks the user before a search or a read outside the project folder.
- The user's follow-up: if instructions don't control Claude, why keep them, and can auto mode rules help?
- Claude's answer: instructions hold for format and fixed bans. They don't hold for "when to stop" in the middle of a task.
- Found at 15:50: auto mode has `soft_deny` and `hard_deny` rules, in `docs/mods/raw/claude-code-docs-2026-10-18/pages/auto-mode-config.md:215-226`.
    - A `soft_deny` rule blocks a kind of action unless the user's message asked for that exact action.
    - A `hard_deny` rule blocks it always.
    - Claude read 14 matching lines of that page, not the whole page.
- Decided: open.

## 2. The handoff file

- `docs/handoff.md` exists, and the user does not know why, or how it differs from `CLAUDE.md`.
- It holds the status and 40 lines of working rules. No file points at it.
- Decided: open.

## 3. The test page is half done

- It took about 40 minutes, from 14:52 to 15:33.
- The check with a visible browser passes.
- The check without a window fails since the visible mode was added. The cause is not known.
- The user's question: do a slow run for watching and a fast run for Claude both work?
- Uncommitted: the visible mode.
- Committed: one WIP commit, made against `docs/handoff.md:40`.
- Decided: open. Keep or undo is not answered.

## 4. The mess left behind

- The user's worry: half-done work now, and the same in future implementations.
- Decided: open.

## 5. What carries over

- The user's worry: do today's changes reach the next session and the next project?
- Loaded in every session and project: `~/.claude/CLAUDE.md`, with today's lines 20 to 28.
- Decided: open.

## 6. What the user does when a session goes wrong

- It happened twice on 2026-11-22: the release at 12:30 and the test page at 15:20.
- The user's question: how to get through it, and how the tension gets resolved.
- Decided: open.

## 7. Cost

- The user's count for the test page: 5 to 10 percent of the context and 1 to 2 percent of the weekly quota.
- Decided: open.

## Cleanup, started at 16:10

- The user chose to weed out what the two sessions of the day added, one step at a time.
- Each step is its own commit.
- Step 1: the nine lines added today to `~/.claude/CLAUDE.md`, lines 20 to 28, are removed.
    - That file is not in git, so the lines are kept here.

```
- A question or a check gets its answer from the context, or from one lookup.
- When it needs more, Claude states the plan in one line and waits for a go.
- When a lookup shows something unexpected, Claude reports it in one line and stops.
- When something blows up, Claude stops and gives three lines: what happened, the state now, how to undo.
    - The user says keep or undo.
    - The lesson gets one parked line. Work resumes.
- After three rounds on one topic, Claude gives one recommendation and one question, and nothing else.
- Freeze: until 2026-11-29, no edits to this file or to a project's `CLAUDE.md`.
    - A complaint about Claude's behaviour gets one line at the end of the project's task list, with no discussion.
```

- Step 2: `docs/handoff.md` is deleted. Git keeps it.
