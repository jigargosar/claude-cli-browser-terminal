# Workflow

## Principles: Design of Workflow

- Workflow should be deliberately simple, not carving out every single case.
- We assume that we are smart enough to figure things out as we work.
- Claude fixes typos in next commit without announcing it.
- This is collaborative workflow. And who does what is not always necessary.

## Tracking File

- The file is named `FVP-LIST.md` and usually stored in same folder as this file.
- It has three sections, in order: `# Inbox`, `# Task List`, `# Details`.

## Inbox

- New items get appended to `Inbox`

### Processing Inbox

- Pick any item, likely first.
- Challenge why it is needed.
    - Is it an XY problem?
    - What `Pain` is it causing?
    - Delete otherwise.
- Reword the item as a `Task`

> - [ ] Pain: <desc>

- Check what this task changes in the existing `Task List`, and act on it.
- Repeat for next `Inbox` item.


## Task List

> - [ ] Pain: <desc>
> - [.] Pain: <desc>
> - [x] Pain: <desc>

## Working on a task

- Tasks are dotted the FVP way, Mark Forster's Final Version Perfected.
    - A dot means preselected. Several tasks can carry dots at once, as a chain.
    - The chain starts at the first task not done. Going down the list, each task wanted more than the last dot gets a dot.
    - When the dots no longer fit, they are cleared and the chain starts again.
    - The last dotted task is the one worked on.
    - partially done tasks move at the end of task list.
    - After a task, the scan continues from that task's old place, against the previous dot.
    - An urgent item goes to the end of the Task List with its `Pain:` line.
- Claude may suggest a dot. The user dots.
- A task whose solution is already approved goes straight to Implementing. Otherwise, Claude and the user get the pain clear. It may be an XY problem.
- Claude proposes the solution. The user's solution ideas are input, not the spec.
    - The plan lives as sub-bullets under its task.
- The user approves the solution. Then Claude implements.

## Implementing

- While implementing, Claude makes WIP commits regularly.
- Claude self-reviews until every issue is fixed.
- Claude presents a list for manual checking. The user tests.

## Closing a task

- Impact: Claude lists what the task changed, what it found that isn't written down yet, and its open issues.
- Cleanup: every item from the Impact list gets a place.
    - Knowledge gained goes to a reference folder. The user and Claude pick which one.
    - Sub-tasks it spawned go to the Inbox.
    - Files only the task used are moved or deleted.
    - A plan file's open items go to the Inbox. The plan file is deleted only when nothing in it is still needed.
    - Mockups are never deleted. Each one in `docs/mockups/` gets a line in `docs/mockups/README.md`: what it shows, and where it went.
- The user approves. Claude ticks the task, adds a line under Unreleased in `CHANGELOG.md`, and commits.

## Weeding

- Weeding is the Impact and Cleanup of "Closing a task", done across tasks and across the project.
- It merges duplicates.
- It drops ticked and stale tasks, together with their Details block.
- Ticked tasks stay in the list until weeding, so weeding can review them.

## Releasing

- If Unreleased has lines, propose `pnpm release` with AskUserQuestion. Claude never runs it unasked.
- Changelog format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), with Added, Changed, Fixed, Removed.
- Before a release, open the Unreleased link at the bottom of `CHANGELOG.md`. It lists every commit since the last tag.
- `pnpm release` builds, runs `kacl prerelease` (fails if Unreleased is empty), bumps the patch, stamps the changelog, updates the README install command, packs, commits, tags and pushes.

## Experiment

- Parallel work in worktrees. Conflicts with this workflow get resolved as they come up.
- Worktree tasks are marked as such. How a task links to its worktree is not worked out yet.
