# How we work

1. The user owns this list. Claude edits it only when asked.
2. New tasks go at the end.
3. Weeding runs regularly. It merges duplicates and drops ticked or stale tasks. Before a task goes, Claude lists its unwritten findings and open issues, each with where it should go. The user approves.
4. Meta tasks, changes to how we work, never go in the list. They are applied as soon as they come up. Those not applied yet go under Meta, in progress.
    - Claude drafts the change. The user reviews the diff before it is committed.
5. A change that isn't concrete yet gets the prefix "Experiment:". It goes where it needs a decision or a task.
6. Rules are defaults, and older tasks may not follow them. To break one, Claude says so in one line and carries on.

## Task shape

## Working a task

1. Claude works the last dotted task:

2. Get the pain clear before work starts. It may be an XY problem.
    - The user's solution ideas are input, not the spec. Claude proposes the solution.
>    - [.] Pain: <the problem, in the user's words>
>       - Solution: <the plan, in a few lines>


3. While impleminting regularily perform WIP commits.
4. Self-review untill you fixed all issues.
5. Present a list, for manual checking.
6. To close, Claude lists what the task found that isn't written down yet, its open issues, and the files only it used, each with where it should go. The user approves, and Claude ticks the task and commits.
    - The plan lives as sub-bullets under its task.
    - A plan file is the last resort, when the plan outgrows the list.
    - Closing the task deletes the plan file, once its lasting content has moved out.


## Releasing

Once a task is closed:

1. If an end user would notice the change, add a line under Unreleased in `CHANGELOG.md`.
2. If Unreleased has lines, propose `pnpm release` with AskUserQuestion. Claude never runs it unasked.
3. Changelog format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), with Added, Changed, Fixed, Removed.
4. Before a release, open the Unreleased link at the bottom of `CHANGELOG.md`. It lists every commit since the last tag.
5. `pnpm release` builds, runs `kacl prerelease` (fails if Unreleased is empty), bumps the patch, stamps the changelog, updates the README install command, packs, commits, tags and pushes.

## Experiment

- Parallel work in worktrees. Conflicts with this workflow get resolved as they come up.
- Worktree tasks are marked as such. How a task links to its worktree is not worked out yet.

## Meta, in progress

- Reorganize tasks and docs, as agreed 2026-11-10.
    - Pain: things seem spread out. Plan, task, reference, spike and mockups. Thier notes, reference, plan etc. causing confusion.
    - Apply the collaboration plan, `docs/tasks/collaboration/plan.md`, the ideas of 2026-11-10 on how the user and Claude work together. Then delete its file.
    - Move research docs into `docs/research/`, flat, with an index of one-line summaries.
    - Then, separately: remove doc references from code comments, and add the comments rule to CLAUDE.md.
    - use google z tool to create a markdown file with code and comments so we know exactly what we are up to. without things being spread out.
- Extract a skill that handles our process in other projects.

# List

- [ ] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay.
    - [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
    - [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [ ] Rename the project from `claude-cli-browser-terminal` to `dx-claude-cli`. Do impact analysis. We have beeing calling our project as ccw. will have to think about it.
- [ ] markdown pane UX sucks. need better UX.
- [ ] format response and show images.
- [ ] move divider with keyboard
- [ ] switching between panes is still clumsy. Happens unintentionally by using trackpad.
    - The first click in the other pane should only move the focus. It should not also run what is under the mouse.
    - A click on the file peek's scrollbar moves the focus to the left pane.
- [ ] Mark dead turns after a rewind.
    - Decided: dead turns stay, since they are part of the transcript. The page makes it obvious which turns are dead.
    - Seen in one transcript: a new prompt hangs off the line before a whole answered turn, and no line marks the rewind. Inference: a rewind wrote this. The server reads the file flat.
- [ ] need recommendation button for quick comments.
- [.] Pain: nothing shows the project's strengths at a glance. Plain screenshots and GIFs are boring, and I close them.
    - Solution: a one-minute animated walkthrough, mocked, not a screen recording. Eight scenes from the README draft: the pain, the page, click to reply, one key, keyboard only, send all, the tagline.
    - Source and render steps: `docs/mockups/showcase-video/`. Output: `docs/media/ccw-showcase.gif` and `.mp4`, shown at the top of `README.md`.
    - Decided by Claude on "do whatever you like", for the user to accept or undo: one full-length GIF with a link to the video, and the draft `docs/README-004.md` replaces `README.md`.
    - Readme: issues. video link doesnt wrk because of huge file size.
- [.] Pain: sometimes I want to go back to a previous reply and send information from it. On older pages, click and F do nothing. They work on the latest page only.
    - Solution: not decided. Direction: commenting works on older pages the same as on the latest page. Claude's reading of the user's note, to confirm: comments are collected across pages.
    - Since comments are page based, they clear as page changes. Moved from the popup journal task.
- [.] Pain: the reading pane reshapes the transcript, so I can't tell what is really going on. Where is the thinking? It says Running when it is waiting.
    - Plan: `docs/tasks/response-info/plan.md`.
      - Solution: prompts and Claude's text are always open, never closed or hidden. Between them, one closed group with every event as its own collapsed row, in arrival order. `web/entry-types.js` lists every entry type with an active flag. Inactive types are skipped, and unknown types show, labelled. Research: `docs/tasks/response-info/transcript-inventory.md`
    - multiple housekeeping tasks are grouped together, that is good, but are they shown in proper chrono order? even some other stufff appears then goes. Pain: dont know what is going on, and our algo to collect stuff.
    - I figure out what is more important, currently thinking block is important rest can as Also, a quick navigation where we basically get back to reading my ask and your response. Also, a smooth way to compress all everything. Basically, compress all yeah. And the third thing is a lot of noise, but that doesn't get any, it just stays hidden unless I press it. So by noise, I mean the miscellaneous or some section that we have, I think it's called housekeeping. So we also need to figure out stuff about how to handle drinking, housekeeping, and bash and tool calls and stuff like that
    - How should we group info in reading pane.
    - remvoe noise from my response.
    - Open issue: thinking is the most important part, and the solution puts it inside the one closed group. Decide which.
- [ ] Pain: the page learns about each conversation row by tailing the transcript file. Is a mod's `session.append` hook faster?
    - Solution: a spike. One process receives the mod's POST and tails the transcript, so both arrival times share one clock. Code and results: `docs/spikes/mods-vs-tail/`.
    - Result, 2026-11-18: one hook, `session.append`. The mod leads by a median 165 ms, p95 462 ms, over 138 rows. Rows arrive one by one, not in bursts. No slowdown seen in 4 noisy runs. Measured with `claude -p` only, not in a pty, and without subagents. Same `uuid` as the transcript line. Assistant and tool result content match. Prompts and attachments differ in shape. The mod gives 4 fields per row against about 35 in the transcript, and misses the lines without a `uuid`.
    - Next, not started: map each JSONL line and field the page uses to the mod event that gives it, then decide mod only, hybrid, or tail only.
- [x] Pain: impossible to view/review line number content when referenced in your reply.
    - Plan: `docs/tasks/file-refs/plan.md`. Closed on 2026-11-22.
- [ ] File peek, left over from the task above: the list under "Left over" in `docs/tasks/file-refs/plan.md`. The diff, a transition, a click on a line to open the editor, and space after the last line.
- [ ] Pain: three or four files get modified, and I can't tell which ones or what changed. Unaccounted modifications slip by.
    - Solution: each reply ends with a list of the files modified, outside the project first, in red, then inside the project. Each one links like a file reference.
    - Not decided: how to find the modified files and their diff. Git inside the project. Outside it, perhaps chezmoi.
    - Idea: the server finds the writes in the transcript, since it reads every line. Writes outside the project matter most.
- [ ] Track how long each task takes, using git log.
- [ ] `docs/mods/raw/` holds all of the Claude Code docs, the CLI reference included, so a path to a general doc reads as a mods doc.
- [ ] Pain: in another project I can't tell whether its ccw copy is stale, or what it is missing.
    - Idea: the page shows its version number, and the changelog with Unreleased.
    - Idea: known issues go in the changelog too, so I don't hunt for a bug that is already known.
- [ ] Pain: I run every check of the page by hand, and I repeat "test it yourself with puppeteer-core" in every session.
    - Idea: a test page Claude can open by itself in the test browser, with no second claude session. Today the page needs the server, and the server starts claude.
- [ ] Pain: a sentence like "Fix 3 is live now" points back by a number, so I can't tell what it means, or reply to it alone.
    - Idea: one more line in the system prompt in `server.mjs`. Every sentence names the thing it talks about.
