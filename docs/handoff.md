# Handoff, 2026-11-22

For the next session. Read this, then `CLAUDE.md`, `docs/fvp-list.md` and `docs/tasks/file-refs/plan.md`.

## Where we are

- Last task: "Pain: impossible to view/review line number content when referenced in your reply." Its plan: `docs/tasks/file-refs/plan.md`.
- Primary goal: when a reply mentions a file, the user sees the exact lines it means, in one click.
- Built and committed: references in reply text become links, a click opens a CodeMirror peek, a double click opens the running editor, paths outside the project show red.
- The diff in the peek is commented out in `web/refs.js`, because a heavily changed file showed as one wall of green.
- Closed on 2026-11-22, after the user's checks: the system prompt in `server.mjs`, outside files that peek and open, and the peek covering the terminal pane. What is left over sits under "Left over" in the plan.
- Next: the 0.1.18 release, if it has not happened. `CHANGELOG.md` shows it.
- In progress since 2026-11-22: the task "I run every check of the page by hand" in `docs/fvp-list.md`. The test page is built, and Claude checks the page with `pnpm check:page`. How: `scripts/test-page/README.md`.
- After that, recommended by Claude: the modified files task, for the pain of reviewing a diff.
- New on 2026-11-22: Goal 4, Focus and UX principles in `CLAUDE.md`.

## How the user wants to work

### Speed and focus

- Finish the task's pain point first, plus at most one more pain found while building it.
- Find the minimum that solves the pain, without new issues. Anything that complicates the main objective is set aside.
- When the user asks for something secondary, say so and guide them back. Flag issues early, e.g. "red for outside files is worth it, the other six colors are not".
- Secondary work goes into the task list undotted. It never gets worked on first.
- Comment out a problematic part, with a task to bring it back, rather than rewriting or deleting.

### The list

- `docs/fvp-list.md` is worked bottom-up. The last dotted task is next.
- Something found mid-list that should come first moves to the bottom and gets a dot.
- New tasks go at the end, undotted.
- A task in the list holds only its pain and a link to its plan. The plan holds the sub-tasks, in the same dotted shape, with a Reference section below.
- Meta tasks, changes to how we work, never go in the list. They are applied at once, or go under "Meta, in progress".
- Nothing gets dropped silently. A problem becomes a task. Weeding happens once the primary objective is done.

### Drafts and commits

- Claude drafts changes to rules, workflow and docs. The user reviews the diff before it is committed.
- Show drafts inline, not only as a file path.
- WIP commits only when the user says so.
- Never work around a block. If a command is blocked, or a file says Claude never writes there (`docs/Wings.md`), ask the user, or let them run it.

### Replies

- Every file reference is `path:line` or `path:start-end`, from the file as it is now. Removed text is quoted verbatim.
- High signal. No long explanations, no essays, no lists of decisions when the user is lost.
- Use proper words, e.g. "keyboard shortcut", not "keys".
- Manual test steps name the literal reference to click.
- Never promise "from now on". Only a mechanism, such as a system prompt or code, makes a behavior hold.
- A change to a global file, such as `~/.claude/CLAUDE.md`, must stand out in the reply.

### Server and sessions

- This session runs inside ccw. Restarting the server ends it.
- Before testing a change to `server.mjs`, ask the user to restart the server.
- Never start another Claude session or test server. Ask the user.

## Open in the list

- `docs/fvp-list.md`, last lines: track how long each task takes, using git log. The `docs/mods/raw/` folder holds all Claude Code docs, so a general doc path reads as a mods doc.
- The modified files task: each reply ends with the files it modified, outside the project first, in red.
