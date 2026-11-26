# Workflow

## Principles: Design of Workflow

- Workflow should be deleberatily simple, not carving out every single case.
- We assume that we are smart enough to figure things out as we work.

## Tracking File
3. The task file is `FVP-LIST.md`, in the same folder as this file. It has three sections, in order: `# Inbox`, `# Task List`, `# Details`.

## Inbox

1. New items get appended to `Inbox`

### Processing Inbox

1. Pick any item, likely first.
2. Challange why it is needed. 
   1. Is it a XY problem. 
   2. What `Pain` is it causing
   3. Delete otherwise.
3. Reword the item as a `Task`

> - [ ] Pain: <desc>

4. Determine if this task can be merged, deleted with existing task in `Task List`
5. Repeat for next `Inbox` item.


## Task

> - [ ] Pain: <desc>
> - [.] Pain: <desc>
> - [x] Pain: <desc>

## Weeding

1. Weeding is the Impact and Cleanup of "Closing a task", done across tasks and across the project.
2. It merges duplicates.
3. It drops ticked and stale tasks, together with their Details block.
4. Ticked tasks stay in the list until weeding, so weeding can review them.

## Working on a task

1. Tasks are dotted the FVP way, Mark Forster's Final Version Perfected.
    - A dot means preselected. Several tasks can carry dots at once, as a chain.
    - The chain starts at the first task not done. Going down the list, each task wanted more than the last dot gets a dot.
    - When the dots no longer fit, they are cleared and the chain starts again.
    - The last dotted task is the one worked on.
    - partially done tasks move at the end of task list.
    - After a task, the scan continues from that task's old place, against the previous dot.
    - An urgent item goes to the end of the Task List with its `Pain:` line.
2. Claude may suggest a dot. The user dots.
3. A task whose solution is already approved goes straight to Implementing. Otherwise, Claude and the user get the pain clear. It may be an XY problem.
4. Claude proposes the solution. The user's solution ideas are input, not the spec.
    - The plan lives as sub-bullets under its task.
5. The user approves the solution. Then Claude implements.

## Implementing

1. While implementing, Claude makes WIP commits regularly.
2. Claude self-reviews until every issue is fixed.
3. Claude presents a list for manual checking. The user tests.

## Closing a task

1. Impact: Claude lists what the task changed, what it found that isn't written down yet, and its open issues.
2. Cleanup: every item from the Impact list gets a place.
    - Knowledge gained goes to a reference folder. The user and Claude pick which one.
    - Sub-tasks it spawned go to the Inbox.
    - Files only the task used are moved or deleted.
    - A plan file's open items go to the Inbox. The plan file is deleted only when nothing in it is still needed.
    - Mockups are never deleted. Each one in `docs/mockups/` gets a line in `docs/mockups/README.md`: what it shows, and where it went.
3. The user approves. Claude ticks the task, adds a line under Unreleased in `CHANGELOG.md`, and commits.

## Releasing

1. If Unreleased has lines, propose `pnpm release` with AskUserQuestion. Claude never runs it unasked.
2. Changelog format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), with Added, Changed, Fixed, Removed.
3. Before a release, open the Unreleased link at the bottom of `CHANGELOG.md`. It lists every commit since the last tag.
4. `pnpm release` builds, runs `kacl prerelease` (fails if Unreleased is empty), bumps the patch, stamps the changelog, updates the README install command, packs, commits, tags and pushes.

## Experiment

1. Parallel work in worktrees. Conflicts with this workflow get resolved as they come up.
2. Worktree tasks are marked as such. How a task links to its worktree is not worked out yet.
