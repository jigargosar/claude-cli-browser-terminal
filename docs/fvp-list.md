# How we work

Core Principle: Before ANY delete check for info and consult with user
When I ask or you think that rules need to be broken, simply list them and wait for approval.

1. New tasks are appended at the end of the file. Unformatted is fine.
2. Never ever start implementing before its task has a `Pain:` line.
4. Weeding runs regularly. 
    - It is the Impact and Cleanup of "Closing a task", done across tasks and across the project.
    - It merges duplicates. Identifying duplactes might require, adding pain points of all tasks.
    - drops ticked or stale tasks.
    - Ticked tasks stay on the list until weeding, for that reason.

## Inbox

1. Anything new goes to the Inbox as a rough line, wherever we are in the workflow. No pain, no checkbox.
2. Processing: Claude drafts each item's `Pain:` line and shows its closest match in the Task List.
    - Then Claude finds duplicates by comparing the pains, against the other Inbox items and every Task List task, sub-bullets included.
3. The user picks: merge into that task, move to the Task List, or delete.

## Before implementing

1. Claude suggests the task to dot.
2. Claude and the user get its pain clear, and it is written as the task's `Pain:` line. It may be an XY problem.
3. Claude proposes the solution. The user's solution ideas are input, not the spec.
    - The plan lives as sub-bullets under its task.
    - A plan file is the last resort, when the plan outgrows the list.
4. The user approves the solution. Then Claude implements.
>    - [.] Pain: <the problem, in the user's words>
>       - Solution: <the plan, in a few lines>


## Implementing

1. While implementing, regularly perform WIP commits.
2. Self-review until you fixed all issues.
3. Present a list, for manual checking.

## Closing a task

1. Impact: Claude lists what the task changed, what it found that isn't written down yet, and its open issues.
2. Cleanup: every item gets a place. Open issues become new tasks. Files only the task used are moved or deleted.
    - A plan file with open items goes to a new task. It is deleted only when nothing in it is still needed.
    - Mockups are never deleted. Each one in `docs/mockups/` gets a line in `docs/mockups/README.md`: what it shows, and where it went.
3. The user approves. Claude ticks the task and commits.


## Changelog: Releasing

1. Add a line under Unreleased in `CHANGELOG.md`.
2. If Unreleased has lines, propose `pnpm release` with AskUserQuestion. Claude never runs it unasked.
3. Changelog format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), with Added, Changed, Fixed, Removed.
4. Before a release, open the Unreleased link at the bottom of `CHANGELOG.md`. It lists every commit since the last tag.
5. `pnpm release` builds, runs `kacl prerelease` (fails if Unreleased is empty), bumps the patch, stamps the changelog, updates the README install command, packs, commits, tags and pushes.

## Experiment

- Parallel work in worktrees. Conflicts with this workflow get resolved as they come up.
- Worktree tasks are marked as such. How a task links to its worktree is not worked out yet.




# Task List

- [.] Pain: comment window too small to read or right
- [ ] Pain: pane top navigate elements not visible mixes with stuff, the sticky header not sure if its needed, and it doesnt even do proper show hide. Too much clutter. 
    - Keep only imp stuff or toggle in advance settings
- [x] Pain: nothing shows the project's strengths at a glance. Plain screenshots and GIFs are boring, and I close them.
    - Solution: a one-minute animated walkthrough, mocked, not a screen recording. Eight scenes from the README draft: the pain, the page, click to reply, one key, keyboard only, send all, the tagline.
    - Source and render steps: `docs/mockups/showcase-video/`. Output: `docs/media/ccw-showcase.gif` and `.mp4`, shown at the top of `README.md`.
    - Decided by Claude on "do whatever you like", for the user to accept or undo: one full-length GIF with a link to the video, and the draft `docs/README-004.md` replaces `README.md`.
    - Readme: issues. video link doesnt wrk because of huge file size.
- [ ] Pain: sometimes I want to go back to a previous reply and send information from it. On older pages, click and F do nothing. They work on the latest page only. Same for my response.
    - Solution: not decided. Direction: commenting works on older pages the same as on the latest page. Claude's reading of the user's note, to confirm: comments are collected across pages.
    - Since comments are page based, they clear as page changes. Moved from the popup journal task.
- [ ] Pain: cleanup this tasks, too much Pain. :P Pain: the reading pane reshapes the transcript, so I can't tell what is really going on. Where is the thinking? It says Running when it is waiting.
    - Plan: `docs/tasks/response-info/plan.md`.
      - Solution: prompts and Claude's text are always open, never closed or hidden. Between them, one closed group with every event as its own collapsed row, in arrival order. `web/entry-types.js` lists every entry type with an active flag. Inactive types are skipped, and unknown types show, labelled. Research: `docs/tasks/response-info/transcript-inventory.md`
    - multiple housekeeping tasks are grouped together, that is good, but are they shown in proper chrono order? even some other stufff appears then goes. Pain: dont know what is going on, and our algo to collect stuff.
    - I figure out what is more important, currently thinking block is important rest can as Also, a quick navigation where we basically get back to reading my ask and your response. Also, a smooth way to compress all everything. Basically, compress all yeah. And the third thing is a lot of noise, but that doesn't get any, it just stays hidden unless I press it. So by noise, I mean the miscellaneous or some section that we have, I think it's called housekeeping. So we also need to figure out stuff about how to handle drinking, housekeeping, and bash and tool calls and stuff like that
    - How should we group info in reading pane.
    - remvoe noise from my response.
    - Open issue: thinking is the most important part, and the solution puts it inside the one closed group. Decide which.
- [ ] Parallel? Pain: the page learns about each conversation row by tailing the transcript file. Is a mod's `session.append` hook faster?
    - Solution: a spike. One process receives the mod's POST and tails the transcript, so both arrival times share one clock. Code and results: `docs/spikes/mods-vs-tail/`.
    - Result, 2026-11-18: one hook, `session.append`. The mod leads by a median 165 ms, p95 462 ms, over 138 rows. Rows arrive one by one, not in bursts. No slowdown seen in 4 noisy runs. Measured with `claude -p` only, not in a pty, and without subagents. Same `uuid` as the transcript line. Assistant and tool result content match. Prompts and attachments differ in shape. The mod gives 4 fields per row against about 35 in the transcript, and misses the lines without a `uuid`.
    - Next, not started: map each JSONL line and field the page uses to the mod event that gives it, then decide mod only, hybrid, or tail only.
- [x] Pain: impossible to view/review line number content when referenced in your reply.
    - Plan: `docs/tasks/file-refs/plan.md`. Closed on 2026-11-22.
- [ ] Pain: three or four files get modified, and I can't tell which ones or what changed.
    - Solution: each reply ends with a list of the files modified, outside the project first, in red, then inside the project. Each one links like a file reference.
    - Not decided: how to find the modified files and their diff. Git inside the project. Outside it, perhaps chezmoi.
    - Idea: the server finds the writes in the transcript, since it reads every line. Writes outside the project matter most.
- [ ] Pain: `docs/mods/raw/` holds all of the Claude Code docs, the CLI reference included, so a path to a general doc reads as a mods doc.
    - Done: moved to `docs/vendor-library-documentation/`, committed, with a `README.md` and a line in `CLAUDE.md`.
    - Open: `docs/mods/mods-research.md:5` still names the old path.
- [ ] Pain: Referencing to some point in prev or other response, causes friction, lack of context.
    - Solution: the system prompt at `server.mjs:54-57` becomes:
    - every file reference is written as `path:line` or `path:start-end`, and a whole file as `path:1`
    - every line number matches the file as it is now
    - every reference resolves on its own: a file reference, or the referenced content carried forward inline
        - this covers removed content, content of a previous reply, a numbered item, and the subject of every sentence
- [ ] Pain: closing the expanded internal details is very cumbersome. 
- [ ] Pain: approving destructive actions, even when claude asks multiple times because fatigue, claude producing verbose output which hides signal into noise.
- [ ] Pain: Quick notes (QN): Why is progress blocked? and what is the state of backups, can it be trusted?, the `quick-notes-v2` project: the secondary aim in `CLAUDE.md`.
- [ ] Pain: do we need it? quick read and update. Apply the collaboration plan, `docs/tasks/collaboration/plan.md`, the ideas of 2026-11-10 on how the user and Claude work together. Then delete its file.
- [ ] Pain: unsent comments are lost whenever a new turn starts from the terminal: a dialog answer, or typed text and Enter. Seen 2026-11-24 after "No" on a permission prompt. Related: comments are page based, in the task "go back to a previous reply".
    - Plan: `docs/tasks/comments-every-page/plan.md`.
- [ ] Pain: when we want to end and send response, if we use quick response, then we have to press another button / click. unlike popup shortcut to save and send.
- [ ] Pain: we are not recording which popup pills we are using, and missing.
- [ ] Pain: edit at line seen in peek is cumbersome.
- [ ] Pain: No vim bindings in peek or pane, very inconvinent. (can code mirror help)
- [ ] Pain: question, are we writing too much custom stuff that codemirror already solves
- [ ] Pain: Response formatting is poor.
- [.] Inbox Prossing (exempt from pain poiny)
- [ ] Weeding (exempt from pain point)
- [.] Pain: urgent. The file peek hides the popup, so I can't see what is being typed.
    - Solution: the popup and the comment box sit above the peek. `.comment-float` goes from z-index 7 to 9, the peek is 8.
- [ ] Pain: F is both jump (find mode) and "Fix it". With the grid open, an F meant to jump presses "Fix it".



# Inbox
- cleanup toplevel docs files
- Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
- Rename the project from `claude-cli-browser-terminal` to `dx-claude-cli`. Do impact analysis. We have beeing calling our project as ccw. will have to think about it.
- format response and show images.
- move divider with keyboard
- switching between panes is still clumsy. Happens unintentionally by using trackpad.
    - The first click in the other pane also runs what is under the mouse.
    - A click on the file peek's scrollbar moves the focus to the left pane.
- Mark dead turns after a rewind.
    - Decided: dead turns stay, since they are part of the transcript. The page makes it obvious which turns are dead.
    - Seen in one transcript: a new prompt hangs off the line before a whole answered turn, and no line marks the rewind. Inference: a rewind wrote this. The server reads the file flat.
- need recommendation button for quick comments.
- File peek, left over from the file references task: the list under "Left over" in `docs/tasks/file-refs/plan.md`. The diff, a transition, a click on a line to open the editor, and space after the last line.
- Dynamic info about the running session: where it runs, the project, and the session details the statusline shows.
    - need to be able distinguish which session/project I am working on. the project name and color in terminal doesnt help, we need something in UI.
- when running commands intermediate actions are not visible in the page.
- The markdown code blocks are horrible.
- in code blocks file reference are not navigatable. including the selection color.
- users responces should behave same as your response, i.e. f for hilighting a sentense, and ability to response
- why file links are so slow and show terminal in between.
- add why in workflow steps
- move workflow to seperate file. 
- The intermideate claude processing might take some time to complete. Meanwhile I want to see, thinking blocks clearly. UX Friendly
- we need to come up with a glossary, `docs/glossary.md`. Example: "other pane" is not a name. There is only one pane/page, markdown by default.
- Static app info, written into the code at release: version, changelog with Unreleased, known issues, and help such as the keyboard shortcuts.
    - Pain: in another project I can't tell whether its ccw copy is stale, or what it is missing.
- In replies, Claude wrote "You approve it, then Claude implements." The workflow says "the user approves". No "you" for me.
- add tldr popup pills.
- Pain: when a reply isn't self-sufficient, I have to assemble the picture myself before I can respond.
    - Found 2026-11-26, while asking why replies wrote bare "line 19" instead of `path:line`.
    - Not decided: replace the pain line of the task at `docs/fvp-list.md:98` with this one, and drop its stale Solution lines. Or keep both.
    - Not split on purpose. A partial solution leaves the task partly done.
    - Levels found so far:
        - The reply is self-sufficient.
        - The information inside the reply flows well.
        - Pieces needed together sit together. Failure: distance, across files, replies, or parts of one reply.
        - Pieces are the right size. Failure: too coarse, the change drowns. Too fine, it can't be placed.
    - Two kinds of context:
        - Needed: what must be seen together to answer, such as a before next to its after.
        - Surrounding: what places the change. Needed only when the focus isn't clear.
    - Poor rendering is a third problem: a code block in the pane wraps, and its buttons cover the text.
    - Done: `server.mjs:54-61` now says "every mention of a file or a line", with a Bad and Good example.
    - Not verified that it works. Pending: restart the server, then watch replies for bare line numbers.
    - Open: the third rule of that prompt, "every reference resolves on its own: a file reference, or the referenced content carried forward inline". Its "or" lets quoted content replace the link. Drafts were rejected as confusing.
- Pain: Claude adds unasked connections to other items, and when naming a mistake it adds reasons and conclusions.
    - Seen 2026-11-26: a reply tied the code block rendering to an Inbox item, and explained why a line was noise. The explanation was itself wrong and added more noise.
    - Draft for `~/.claude/CLAUDE.md`:
        - No unasked connections to other items.
        - When naming a mistake, name it only. No reason, no conclusion, and no citing of the instruction broken.
    - "No unasked connections to other items" is the load-bearing part. It names a mistake seen over and over across conversations.
    - Rejected: "no judgment on the user's content". Too general, it would block a review the user asks for.
    - Open: merged or separate lines. Separate lines may conflict.
    - Open: "no citing of the instruction broken" conflicts with the global rule "When a request or action breaks a rule here, name the exact violation in a few words and carry on."
