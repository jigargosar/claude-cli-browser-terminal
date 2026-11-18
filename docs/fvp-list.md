# How we work

1. The user owns this list. Claude edits it only when asked.
2. New tasks go at the end.
3. Weeding merges duplicates and drops done or stale tasks. Before a task goes, Claude seeks out its unrecorded facts and open issues.

## Task shape

## Working a task

1. Claude works the last dotted task:

2. Get the pain clear before work starts. It may be an XY problem.
>    - [.] Pain: <the problem, in the user's words>
>       - Solution: <the plan, in a few lines>


2. While impleminting regularily perform WIP commits.
3. Self-review untill you fixed all issues.
4. Present a list, for manual checking.


## Releasing

Once a task is closed:

1. If an end user would notice the change, add a line under Unreleased in `CHANGELOG.md`.
2. If Unreleased has lines, propose `pnpm release`.

## Experiment

- Parallel work in worktrees. Conflicts with this workflow get resolved as they come up.
# List

- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: when a line goes in (Releasing, step 1), which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. Also the compare links at the bottom of `CHANGELOG.md`. `[Unreleased]: …/compare/<last tag>...HEAD` makes the Unreleased heading open GitHub's compare of the last tag to `HEAD`, so it lists every unreleased commit. Use it to check Unreleased before a release. `kacl release` writes these links: the 0.1.8 release set `[Unreleased]` to `v0.1.8...HEAD` and added `[0.1.8]` as `v0.1.7...v0.1.8`. CLAUDE.md then points to the doc.
    - Failure, 2026-11-07, the 0.1.9 release: Claude ran `pnpm release` after the overlay stacking tick, as rule 9 said. Rule 9 came in commit `1b140bf` on 2026-11-04. The auto mode classifier denied it, with reason "[Create Public Surface]". Nothing ran. After the user approved through AskUserQuestion, the second run published 0.1.9. Releasing, step 2, now proposes every release, with AskUserQuestion.
    - use google z tool to create a markdown file with code and comments so we know exactly what we are up to. without things being spread out.
- [ ] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay. Since comments are page based, they clear as page changes.
    - [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
    - [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [ ] Rename the project from `claude-cli-browser-terminal` to `dx-claude-cli`. Do impact analysis.
- [.] markdown pane UX sucks. need better UX.
- [ ] format response and show images.
- [ ] move divider with keyboard
- [ ] Extract a skill that handles our process in other projects.
- [ ] switching between panes is still clumsy. Happens unintentionally by using trackpad.
- [ ] Mark dead turns after a rewind.
    - Decided: dead turns stay, since they are part of the transcript. The page makes it obvious which turns are dead.
    - Seen in one transcript: a new prompt hangs off the line before a whole answered turn, and no line marks the rewind. Inference: a rewind wrote this. The server reads the file flat.
- [ ] need recommendation button for quick comments.
- [ ] Reorganize tasks and docs, as agreed 2026-11-10.
    - Split the collaboration plan, `docs/tasks/collaboration/plan.md`, the ideas of 2026-11-10 on how the user and Claude work together, into 8 top-level tasks, each with pain, solution and done-when. Then delete its file.
    - Move research docs into `docs/research/`, flat, with an index of one-line summaries.
    - Then, separately: remove doc references from code comments, and add the comments rule to CLAUDE.md.
- [.] multiple housekeeping tasks are grouped together, that is good, but are they shown in proper chrono order? even some other stufff appears then goes. Pain: dont know what is going on, and our algo to collect stuff.
- [ ] safely open links, editor and url.
- [.] Pain: nothing shows the project's strengths at a glance. Plain screenshots and GIFs are boring, and I close them.
    - Solution: a one-minute animated walkthrough, mocked, not a screen recording. Eight scenes from the README draft: the pain, the page, click to reply, one key, keyboard only, send all, the tagline.
    - Source and render steps: `docs/mockups/showcase-video/`. Output: `docs/media/ccw-showcase.gif` and `.mp4`, shown at the top of `README.md`.
    - Decided by Claude on "do whatever you like", for the user to accept or undo: one full-length GIF with a link to the video, and the draft `docs/README-004.md` replaces `README.md`.
- [.] Pain: sometimes I want to go back to a previous reply and send information from it. On older pages, click and F do nothing. They work on the latest page only.
    - Solution: not decided. Direction: commenting works on older pages the same as on the latest page. Claude's reading of the user's note, to confirm: comments are collected across pages.
- [.] I figure out what is more important, currently thinking block is important rest can as Also, a quick navigation where we basically get back to reading my ask and your response. Also, a smooth way to compress all everything. Basically, compress all yeah. And the third thing is a lot of noise, but that doesn't get any, it just stays hidden unless I press it. So by noise, I mean the miscellaneous or some section that we have, I think it's called housekeeping. So we also need to figure out stuff about how to handle drinking, housekeeping, and bash and tool calls and stuff like that 
- [.] Readme: issues. video link doesnt wrk because of huge file size. 
- [.] How should we group info in reading pane.
- [.] remvoe noise from my response.  
- [ ] transcript: replace running to waiting on prompt the blibnking green part.
      e.g. Running Bash · Show changes beyond the workflow section
- [.] what is housekeeping?
- [.] Pain: the reading pane reshapes the transcript, so I can't tell what is really going on. Where is the thinking? It says Running when it is waiting.
    - Plan: `docs/tasks/response-info/plan.md`.
      - Solution: prompts and Claude's text are always open, never closed or hidden. Between them, one closed group with every event as its own collapsed row, in arrival order. `web/entry-types.js` lists every entry type with an active flag. Inactive types are skipped, and unknown types show, labelled. Research: `docs/tasks/response-info/transcript-inventory.md`
- [ ] hide maximize panels.   
- [.] Pain: the page learns about each conversation row by tailing the transcript file. Is a mod's `session.append` hook faster?
    - Solution: a spike. One process receives the mod's POST and tails the transcript, so both arrival times share one clock. Code and results: `docs/spikes/mods-vs-tail/`.
    - Result, 2026-11-18: one hook, `session.append`. The mod leads by a median 165 ms, p95 462 ms, over 138 rows. Rows arrive one by one, not in bursts. No slowdown seen in 4 noisy runs. Measured with `claude -p` only, not in a pty, and without subagents. Same `uuid` as the transcript line. Assistant and tool result content match. Prompts and attachments differ in shape. The mod gives 4 fields per row against about 35 in the transcript, and misses the lines without a `uuid`.
    - Next, not started: map each JSONL line and field the page uses to the mod event that gives it, then decide mod only, hybrid, or tail only.
