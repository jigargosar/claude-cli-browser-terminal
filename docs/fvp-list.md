# How we work

1. The user owns this list. Claude edits it only when asked, or to tick a done task.
2. New tasks go at the end. Work happens on the last dotted task.
3. A task is done when the user has tested or reviewed it, and Claude has committed it. The tick goes in the same commit.
4. When changed files pile up mid-task, Claude suggests a commit.
5. After a task is done, Claude moves to the new last dotted task on its own. It names the task by its text and shows a high-level plan in plain words, without file or line numbers. Then it waits for the user's go.
6. The list always holds the weed task. If it goes missing, add it back at the end with this text: "Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else."
7. Before work starts on a task, understand its gist. The task text, and any solution it names, may be an XY problem. Find the real need first. Even when the need is clear, double-check the solution. A solution stated as fact is still not taken for granted.
8. Changelog trigger: a commit with a change a user would notice adds its line under Unreleased in `CHANGELOG.md`, in that same commit.
9. Release trigger: after a task is ticked, if Unreleased in `CHANGELOG.md` has lines, Claude runs `pnpm release`. A release stamps the changelog, tags the version, and publishes the tarball in `published-versions/`, which the README install command points at.
10. Finish the current task before starting the next. When its scope grows, write the new scope into the task first.

# List

- [.] Global CLAUDE.md changes, outside the project: tasks in `docs/global-claude-plan.md`.
- [ ] Explore the conversation patterns in `docs/conversation-exploration/transcript.txt`, and how this project can use them.
- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: a line goes in the same commit as the change, which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. Also the compare links at the bottom of `CHANGELOG.md`. `[Unreleased]: …/compare/<last tag>...HEAD` makes the Unreleased heading open GitHub's compare of the last tag to `HEAD`, so it lists every unreleased commit. Use it to check Unreleased before a release. `kacl release` writes these links: the 0.1.8 release set `[Unreleased]` to `v0.1.8...HEAD` and added `[0.1.8]` as `v0.1.7...v0.1.8`. CLAUDE.md then points to the doc.
    - Failure, 2026-11-07, the 0.1.9 release: Claude ran `pnpm release` after the overlay stacking tick, as rule 9 said. Rule 9 came in commit `1b140bf` on 2026-11-04. The auto mode classifier denied it, with reason "[Create Public Surface]". Nothing ran. After the user approved through AskUserQuestion, the second run published 0.1.9. Rule 9 now asks for permission with AskUserQuestion before every release.
    - use google z tool to create a markdown file with code and comments so we know exactly what we are upto. without things being spread out.
- [ ] Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else.
- [ ] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay. Since comments are page based, they clear as page changes.
    - [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
    - [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [.] simple prev next response navigation. (does it depend on following tasks?)
    - [x] One response page per turn: every reply text block of the turn shows together, as a single unit. Today the pane shows only the turn's last text block. Each text block is its own `reply` item (`server.mjs`).
        - Scope grown 2026-11-07: one rule splits the text written around tool calls from the answer. The page shows the whole turn in transcript order: thinking, text, tool calls with their results, hooks fired. Thinking, tool calls and hooks start collapsed; the answer stays open below the rule. The server emits two more item kinds, `thinking` and `hook`. The transcript holds all of these; the server drops thinking and hooks today.
    - [.] Append each chunk, never redraw. Today every new item replaces the whole page and clears the comments, so a growing turn wipes them. A tool result fills its tool call's block in place; the one rule moves; comments clear only on a new turn. Decision 2026-11-07: no hot reload of `server.mjs`. A server change needs a restart, and the session resumes with `--continue`.
    - [ ] Fix the UI before this task wraps up.
    - [ ] Format tool calls on the response page. Today a tool block shows its input as raw JSON and its result as raw text. Show every field of the input and the result, formatted: a Bash command unescaped in a highlighted code block, with its description as the block's title; any other field as a label and its value; a result whose lines all have the same number of tab-separated columns as a table. Per-tool views (Edit as old and new text, Read, and so on) come one at a time.
- [ ] Claude's thinking shows in the reply pane, toggleable.
- [ ] Rename the project from `claude-cli-browser-terminal` to `dx-claude-cli`. Do impact analysis.
