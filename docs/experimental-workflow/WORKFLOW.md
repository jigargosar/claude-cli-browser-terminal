# Workflow

## Inbox

1. Anything new goes to the Inbox as a rough line. No pain, no checkbox.
2. Processing: Claude drafts the item's `Pain:` line and shows its closest match in the Task List.
3. The user picks: merge into that task, move to the Task List, or delete.
4. Ticked tasks are deleted during processing, together with their Details block.

## Task List

1. Every task starts with `Pain:`. The pain can be a paragraph.
2. Blank is waiting, dot is chosen, x is done.
3. Nothing is implemented from the Inbox.

## Details

1. A task that is too hard to read gets an id after its pain paragraph: `[#id](#id)`.
2. Everything after the pain paragraph moves to `## #id` under Details, at the end of the file.
3. The id is a short name for the pain.

## Working on a task

1. Pain, solution, the user's approval, then the code.
2. The user tests. Claude ticks the task and adds the changelog line.
3. What the task found or left open goes to the Inbox.
