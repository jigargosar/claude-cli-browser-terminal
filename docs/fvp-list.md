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
11. Experiment: parallel work in work tree is under consideration. This might conflict with other rules. So we need to resolve the conflicts as we move along. But rules will be updated by me alone. I want to make sure we dont be overly specific, or cause ambugities with existing process.

# List

- [ ] Global CLAUDE.md changes, outside the project: tasks in `docs/global-claude-plan.md`.
- [ ] Explore the conversation patterns in `docs/conversation-exploration/transcript.txt`, and how this project can use them.
- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: a line goes in the same commit as the change, which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. Also the compare links at the bottom of `CHANGELOG.md`. `[Unreleased]: …/compare/<last tag>...HEAD` makes the Unreleased heading open GitHub's compare of the last tag to `HEAD`, so it lists every unreleased commit. Use it to check Unreleased before a release. `kacl release` writes these links: the 0.1.8 release set `[Unreleased]` to `v0.1.8...HEAD` and added `[0.1.8]` as `v0.1.7...v0.1.8`. CLAUDE.md then points to the doc.
    - Failure, 2026-11-07, the 0.1.9 release: Claude ran `pnpm release` after the overlay stacking tick, as rule 9 said. Rule 9 came in commit `1b140bf` on 2026-11-04. The auto mode classifier denied it, with reason "[Create Public Surface]". Nothing ran. After the user approved through AskUserQuestion, the second run published 0.1.9. Rule 9 now asks for permission with AskUserQuestion before every release.
    - use google z tool to create a markdown file with code and comments so we know exactly what we are upto. without things being spread out.
- [ ] Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else.
- [ ] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay. Since comments are page based, they clear as page changes.
    - [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
    - [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [ ] Rename the project from `claude-cli-browser-terminal` to `dx-claude-cli`. Do impact analysis.
- [ ] Rewind in the terminal puts the reply pane out of sync.
- [.] markdown pane UX sucks. need better UX.
- [.] When scrolling at bottom, there is no space, same when expanding elements there. Suspect append only response.
- [x] response is now cluttered with more content which is not required all the time. Thinking block is something I tent to look at most.
- [ ] format response and show images. 
- [ ] move divider with keyboard
- [ ] worktree: Problem: we can't see what reaches a session's transcript and when. During a run the page showed a Bash group of 4 while the content had 5 tool calls, then jumped to 11 in an instant.
    - Goal: know, with timestamps, what was added and when.
    - Maybe: a standalone tool that watches the transcript in several ways side by side and logs each line's arrival.
    - Maybe: hooks that record each tool event with a timestamp, compared against the transcript afterwards.
    - Maybe: replay a recorded transcript through the server's parsing and compare counts. This only tests parsing, not timing.
    - Measured once: a 20 ms probe saw up to six lines land in the file at once, one of them 7.5 s after its own timestamp. JSON parsing took under 0.2 ms per line.
    - Unknown: whether our parsing misses anything, and what triggers a write.
- [ ] What: Get more information in comments pane. thinking, tool calls.
