# FVP rules

Rules for `docs/fvp-list.md`, from Mark Forster's Final Version Perfected.

Claude never edits this file unless the user asks.

Sources: tag `board-before-fvp`, folder `docs/dev-workflow-ideation/ref/`.

Marks:

- `[ ]` open
- `[.]` dotted
- `[x]` done

Steps:

1. New tasks go at the end, unsorted.
   - Claude appends each task that comes up in conversation, as one line.
   - Claude never rewords or groups other lines.
2. The user dots the first open task.
3. The user reads down and dots each task they want to do more than the last dotted one.
4. Claude writes its steps in the conversation.
5. Claude does the last dotted task.
   - Doing some work is enough.
   - Finished: mark it `[x]`.
   - Not finished: move the line to the end, reworded to what remains.
6. The user reads on from the task just done, against the dotted task now last, and dots again.
7. Claude does the last dot.
8. When no dots remain, Claude asks the user to dot, and the flow starts again at step 2.
9. Urgent task: add it at the end, dotted.
   - Claude does it after the current task.
10. Interruption: deal with it, then return to the list.
11. Weed: delete tasks that are outdated or irrelevant.
    - "Weed list" stays a task on the list.
12. When the top of the list is all `[x]`, delete those lines.
    - Git keeps them.
13. A task that needs a doc links to it.
    - The doc holds no status.
14. List edits go in the work commit.
