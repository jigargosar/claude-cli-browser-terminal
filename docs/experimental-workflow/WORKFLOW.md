# Workflow

1. Before any delete, check for info and consult the user.
2. When a rule needs to be broken, Claude lists it and waits for approval.
3. The task file is `docs/experimental-workflow/tasks.md`. It has three sections, in order: `# Inbox`, `# Task List`, `# Details`.

## Inbox

1. Anything new goes to the Inbox as a rough line, wherever we are in the workflow. No pain, no checkbox.
2. Processing: Claude drafts each item's `Pain:` line and shows its closest match in the Task List.
3. The user picks: merge into that task, move to the Task List, or delete.

## Task List

1. Every task starts with `Pain:`. The pain can be a paragraph.
2. Blank is waiting, dot is preselected, x is done.
3. Nothing is implemented from the Inbox.
4. Two standing tasks are always in the list: Inbox processing and Weeding. Each links to its section of this workflow file.

## Details

1. When a task grows too long to read, it gets an id after its pain paragraph: `[#id](#id)`.
2. The user judges the length. Claude may advise.
3. Everything after the pain paragraph moves to `## #id` under Details, at the end of the task file.
4. The id is a short name for the pain.
5. A plan file is the last resort, when a Details block outgrows the task file.

## Weeding

1. Weeding is the Impact and Cleanup of "Closing a task", done across tasks and across the project.
2. It merges duplicates.
3. It drops ticked and stale tasks, together with their Details block.
4. Ticked tasks stay in the list until weeding, for that reason.

## Working on a task

1. Tasks are dotted the FVP way, Mark Forster's Final Version Perfected.
    - A dot means preselected. Several tasks can carry dots at once, as a chain.
    - The chain starts at the first task not done. Going down the list, each task wanted more than the last dot gets a dot.
    - When the dots no longer fit, they are cleared and the chain starts again.
    - The last dotted task is the one worked on.
    - After a task, scan only the tasks after it, against the previous dot.
    - A task worked on but not finished is re-entered at the end of the list. That includes Inbox processing and Weeding.
    - An urgent item skips the Inbox. It goes to the end of the Task List with its `Pain:` line.
2. Claude may suggest a dot. The user dots.
3. Claude and the user get the pain clear. It may be an XY problem.
4. Claude proposes the solution. The user's solution ideas are input, not the spec.
    - The plan lives as sub-bullets under its task.
5. The user approves the solution. Then Claude implements.

## Implementing

1. While implementing, Claude makes WIP commits regularly.
2. Claude self-reviews until every issue is fixed.
3. Claude presents a list for manual checking. The user tests.

## Closing a task

1. Impact: Claude lists what the task changed, what it found that isn't written down yet, and its open issues.
2. Knowledge gained goes to a reference folder. The user and Claude pick which one.
3. Sub-tasks it spawned go to the Inbox.
4. Files only the task used are moved or deleted.
    - A plan file with open items goes to the Inbox. It is deleted only when nothing in it is still needed.
    - Mockups are never deleted. Each one in `docs/mockups/` gets a line in `docs/mockups/README.md`: what it shows, and where it went.
5. The user approves. Claude ticks the task, adds a line under Unreleased in `CHANGELOG.md`, and commits.

## Releasing

1. If Unreleased has lines, propose `pnpm release` with AskUserQuestion. Claude never runs it unasked.
2. Changelog format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), with Added, Changed, Fixed, Removed.
3. Before a release, open the Unreleased link at the bottom of `CHANGELOG.md`. It lists every commit since the last tag.
4. `pnpm release` builds, runs `kacl prerelease` (fails if Unreleased is empty), bumps the patch, stamps the changelog, updates the README install command, packs, commits, tags and pushes.

## Experiment

1. Parallel work in worktrees. Conflicts with this workflow get resolved as they come up.
2. Worktree tasks are marked as such. How a task links to its worktree is not worked out yet.
