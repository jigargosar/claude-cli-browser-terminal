# Workflow

## Principles: Design of Workflow

- Workflow should be deliberately simple, not carving out every single case.
- We assume that we are smart enough to figure things out as we work.
- Claude fixes typos in next commit without announcing it.
- This is collaborative workflow. And who does what is not always necessary.
- Before any delete, check for info and consult the user.

## Tracking File

- The file is `docs/fvp-list.md`.
- It has two sections, in order: `# Task List`, `# Inbox`.

## Inbox

- The Inbox is a dump. An item goes in as written, with no format, and waits for processing.

### Processing Inbox

- Pick any item, likely first.
- Find the real pain together.
    - Claude pushes back smartly, without being adversarial. It may be an XY problem, or a different problem than the one stated.
    - No pain, delete the item.
- Once the pain is agreed, Claude takes over.
    - It gives the task the next id and a short name.
    - It moves everything except the pain to the task's details file.
    - It writes the task in the Task List.

> - [ ] Pain: <desc> [#<id>](tasks/<id>-<name>.md)

- Check what this task changes in the existing `Task List`, and act on it.
- Repeat for next `Inbox` item.

## Task List

- `[ ]` open, `[.]` dotted, `[x]` done.
- Each task is one Pain line.

## Details

- Each task has a details file, `docs/tasks/<id>-<name>.md`, such as `012-task-list-view.md`.
- The id is the next unused three-digit number.
- The file starts with the task's Pain line. Both copies stay identical.
- Before a task is changed, merged, split or deleted, Claude presents any issues and the affected files. Once the user approves, Claude updates the list and the details together.
- Claude checks for drift between a task's line, its file name and its details, and reports it.

## Working on a task

- Dot tasks the FVP way, Mark Forster's Final Version Perfected.
    - Dot the first open task. Going down, dot each task wanted more than the last dot.
    - Work on the last dot. Then continue the scan below it, against the previous dot.
    - A partly done task moves to the end, as `[ ]`.
- Agree on the solution, then implement. The plan lives in its details file.

## Implementing

- Make WIP commits regularly.
- Claude tests as much as it can, then writes a manual test plan.
    - Claude does the prep and every step in between. The user does only the steps Claude can't.

## Closing a task

- Claude looks back at what changed, what we learned and what is still open.
- We discuss each remaining item and decide where it goes.
- What changed gets a line under Unreleased in `CHANGELOG.md`, following the changelog rules in Releasing.
- A partly done task can close for the part that is done. Each open part goes to the Inbox and gets processed like any new item.
- Once approved, tick the task and commit. The ticked task stays in the Task List, so weeding has its context.

## Weeding

- Weeding has no schedule. It runs whenever it seems needed.
- It reviews the whole Task List and project, the way Closing a task reviews one task.
- It merges duplicates, and drops ticked and stale tasks.

## Releasing

- If Unreleased has lines, propose `pnpm release`.
- Changelog format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), with Added, Changed, Fixed, Removed.
- Before a release, check Unreleased against the commits since the last tag.

## Experiment

- Independent tasks run in parallel worktrees, with a process still taking shape.
