# How we work

1. The user owns this list. Claude edits it only when asked, or to tick a done task.
2. New tasks go at the end. Work happens on the last dotted task.
3. A task is done when the user has tested or reviewed it, and Claude has committed it. The tick goes in the same commit.
4. When changed files pile up mid-task, Claude suggests a commit.
5. After a task is done, Claude moves to the new last dotted task on its own. It names the task by its text and shows a high-level plan in plain words, without file or line numbers. Then it waits for the user's go.
6. The list always holds the weed task. If it goes missing, add it back at the end with this text: "Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else."
7. Before work starts on a task, inorder to understand its gist always ask about pain points. Get absoloute clarity. The task text, and any solution it names, may be an XY problem. Find the real need first. Even when the need is clear, double-check the solution. A solution stated as fact is still not taken for granted.
8. Changelog trigger: ticking a task. When the task holds a change a user would notice, its line goes under Unreleased in `CHANGELOG.md`, in the same commit as the tick.
9. Release trigger: after a task is ticked, if Unreleased in `CHANGELOG.md` has lines, Claude runs `pnpm release`. A release stamps the changelog, tags the version, and publishes the tarball in `published-versions/`, which the README install command points at.
10. Finish the current task before starting the next. When its scope grows, write the new scope into the task first.
11. Experiment: parallel work in work tree is under consideration. This might conflict with other rules. So we need to resolve the conflicts as we move along. But rules will be updated by me alone. I want to make sure we dont be overly specific, or cause ambugities with existing process.
12. Before testing changes, Claude makes a WIP commit.
13. Keep tasks small. A task's plan stays in the task on this list, in a few lines. Every new task follows this shape, title included:

        - [ ] Pain: <the problem, in the user's words>
            - Solution: <a few lines>

    The title states the pain, never the fix. Older tasks that don't match predate this rule. Don't copy their shape. A folder `docs/tasks/<task>/` is made only when the user asks for one, and it holds research material only.

# List

- [x] Global CLAUDE.md changes, outside the project, and the conversation patterns to explore. The plan, the research and the transcript moved to the skills repo, in `global-claude-md/`.
- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: a line goes in the same commit as the change, which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. Also the compare links at the bottom of `CHANGELOG.md`. `[Unreleased]: …/compare/<last tag>...HEAD` makes the Unreleased heading open GitHub's compare of the last tag to `HEAD`, so it lists every unreleased commit. Use it to check Unreleased before a release. `kacl release` writes these links: the 0.1.8 release set `[Unreleased]` to `v0.1.8...HEAD` and added `[0.1.8]` as `v0.1.7...v0.1.8`. CLAUDE.md then points to the doc.
    - Failure, 2026-11-07, the 0.1.9 release: Claude ran `pnpm release` after the overlay stacking tick, as rule 9 said. Rule 9 came in commit `1b140bf` on 2026-11-04. The auto mode classifier denied it, with reason "[Create Public Surface]". Nothing ran. After the user approved through AskUserQuestion, the second run published 0.1.9. Rule 9 now asks for permission with AskUserQuestion before every release.
    - use google z tool to create a markdown file with code and comments so we know exactly what we are upto. without things being spread out.
- [ ] Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else.
- [ ] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay. Since comments are page based, they clear as page changes.
    - [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
    - [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [ ] Rename the project from `claude-cli-browser-terminal` to `dx-claude-cli`. Do impact analysis.
- [.] markdown pane UX sucks. need better UX.
- [x] When scrolling at bottom, there is no space, same when expanding elements there. Suspect append only response.
- [ ] format response and show images. 
- [ ] move divider with keyboard
- [x] Pain Point: Need response information in page, to track what is actually going on.
    - Pain: the page gives no insight while a turn runs. Which tools ran, with what request and response, is only in the terminal, which is ugly to read.
    - Need: live insight into the turn: prompt, tool calls with input and result, Claude's text, status, time, tokens.
    - Solution: a live timeline of the turn, built from the transcript. Each item sits in a collapser. Research: `docs/tasks/response-info/transcript-inventory.md`.
- [ ] Extract a skill that handles our process in other projects.
    - Pain: not recorded yet.
- [x] Bug: AbortError: Transition was skipped. New ViewTransition started
- [ ] switching between panes is still clumsy. Happens unintentally by using trackpad.
- [ ] Mark dead turns after a rewind.
    - Decided: dead turns stay, since they are part of the transcript. The page makes it obvious which turns are dead.
    - Seen in one transcript: a new prompt hangs off the line before a whole answered turn, and no line marks the rewind. Inference: a rewind wrote this. The server reads the file flat.
- [ ] Collaboration: put in place the ideas of 2026-11-10 on how the user and Claude work together. Plan: `docs/tasks/collaboration/plan.md`.
- need recommendation button for quick comments.
- [ ] Reorganize tasks and docs, as agreed 2026-11-10.
    - Split the collaboration plan into 8 top-level tasks, each with pain, solution and done-when. Then delete its file.
    - Move research docs into `docs/research/`, flat, with an index of one-line summaries. Update rule 13 to match.
    - Then, separately: remove doc references from code comments, and add the comments rule to CLAUDE.md.
- [x] Pain: installing ccw needs a Claude session, because install-ccw is a skill. Without it, I have to remember a long command in every new project.
    - Solution: an `install-ccw` function in the pwsh `$PROFILE`, outside this project. It checks for `pnpm-lock.yaml` and `package-lock.json` and prints each result. One keypress picks the manager: `p` for pnpm, `n` for npm. It fetches the README and runs that manager's Install line. Each step prints a line before it starts. No dry run.
    - Decided: only the user's pain. Other users would copy a shortcut from the README, which is the same effort as copying the install command.
- [ ] multiple housekeeping tasks are grouped together, that is good, but are they shown in proper chrono order? even some other stufff appears then goes. Pain: dont know what is going on, and our algo to collect stuff.
- [ ] safely open links, editor and url.
- [.] Pain: nothing shows the project's strengths at a glance. Plain screenshots and GIFs are boring, and I close them.
    - Solution: a one-minute animated walkthrough, mocked, not a screen recording. Eight scenes from the README draft: the pain, the page, click to reply, one key, keyboard only, send all, the tagline.
    - Source and render steps: `docs/mockups/showcase-video/`. Output: `docs/media/ccw-showcase.gif` and `.mp4`, shown at the top of `README.md`.
    - Decided by Claude on "do whatever you like", for the user to accept or undo: one full-length GIF with a link to the video, and the draft `docs/README-004.md` replaces `README.md`.
- [ ] Pain: sometimes I want to go back to a previous reply and send information from it. On older pages, click and F do nothing. They work on the latest page only.
    - Solution: not decided. Direction: commenting works on older pages the same as on the latest page. Claude's reading of the user's note, to confirm: comments are collected across pages.
- [ ] I figure out what is more important, currently thinking block is important rest can as Also, a quick navigation where we basically get back to reading my ask and your response. Also, a smooth way to compress all everything. Basically, compress all yeah. And the third thing is a lot of noise, but that doesn't get any, it just stays hidden unless I press it. So by noise, I mean the miscellaneous or some section that we have, I think it's called housekeeping. So we also need to figure out stuff about how to handle drinking, housekeeping, and bash and tool calls and stuff like that 
- [ ] Readme: issues. video link doesnt wrk because of huge file size. 
- [ ] How should we group info in reading pane.
