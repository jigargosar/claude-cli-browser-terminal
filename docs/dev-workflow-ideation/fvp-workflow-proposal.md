# Proposal: Forster's FVP as the board workflow

Status: proposal, saved 2026-10-30. Rules 1-4 of FVP are from Claude's memory, not a source. Verify them before use.

## Revised root

1. The workflow was home-grown. It had no answer for urgent work, continuation, or pruning.
2. Each gap got patched in the moment with a new file or rule: Board-pending, plans/, resume notes, a pruning event. Those patches are the docs game.
3. Forster's systems have tested answers for all three. This is the rule "prefer a library over our own code", applied to process.

## AF1 or FVP

Recommendation: FVP, the single-list system.

| | AF1 (pages) | FVP (one list) |
|---|---|---|
| Pruning | Dismissal of whole pages | "Weed list" as a task on the list (FAQ) |
| Urgent | Not covered on the rules page | Explicit answer (FAQ) |
| Fits a markdown file | A file has no pages. We would invent a page size, a tweak. | As written |

## FVP rules

Rules 5-9 are verified from Forster's AF rules page and FV FAQ. Rules 1-4 are from memory, because the 2015 FVP post is offline.

1. Dot the first open task.
2. Read down. Ask "What do I want to do more than <last dotted task>?" Dot each winner. That is the chain.
3. Do the last dotted task.
4. Scan again from that task down, against the now-last dotted task. Do the last dot. No dots left: back to step 1.
5. Finished: cross it off. Not finished: cross it off and re-enter it at the end.
6. New tasks go at the end, without evaluation.
7. Urgent: "Just add it to the end of the list like any other task. If the task is so urgent that it can't wait…, put a dot in front of it and do it as soon as you have finished the task you are currently working on."
8. Interruption: "deal with it and then return to where you were on the list."
9. Weeding: "Tasks which are outdated, irrelevant or causing lack of focus should be deleted. It's a good idea to keep 'Weed list' as a task on your list."

## Mapping to our file

The only adaptation. It exists because a file is not a notebook, and because two actors work the list.

| Notebook | Our file |
|---|---|
| Dot | `[.]` |
| Cross off | `[x]` |
| Cross off and re-enter | Move the line to the end, reworded to what remains |
| Turned page | When the top of the file is all `[x]`, delete those lines. Git keeps them. This is the delete experiment. Recent done tasks stay visible until then. |
| Who | The user dots. Claude does the last dot, marks, appends, moves. |

## Claude's part

1. Append every task that comes up in conversation at the end, one line. Never group or reword other lines.
2. Write its own steps for a task, in its own words, in the conversation before starting. The task stays one line, with one level of nested detail at most.
3. A task that needs a doc (research, measurements) links to it from its line. The doc holds no status.
4. When the chain is empty, say so and ask for a scan. Never dot for the user.
5. Board edits ride in the work commit.

## Walkthrough

```
- [x] Data loss quick fix: reload asks first
- [ ] Atkinson Hyperlegible fonts
- [.] No replies in a folder's first session
- [ ] Weed list
- [.] Links in replies open outside the tab
- [ ] Reply length: apply rule changes
```

| Scenario | What happens |
|---|---|
| Session start | Claude does "Links in replies", the last dot. |
| Idea mid-task | `- [ ] Popup: more options` goes at the end. The current task continues. |
| Urgent bug | Goes at the end as `[.]`, done right after the current task. Nothing above moves, so the current state stays pristine. That was Board-pending's goal, without a second file. |
| Built, manual test pending | The line moves to the end as `- [ ] Test: links open outside the tab`. Replaces `[t]`. |
| Session ends mid-task | The line moves to the end: `- [ ] First-session replies: fix written, live test left`. That line is the resume note. |
| Chain empty | Claude asks for a scan. The user sees the list each time, which cures the overwhelm from not looking. |
| List grows | "Weed list" stands out on some scan. Weeding is deleting lines. Then it is re-entered at the end, so it recurs. |
| Rule change idea | A task at the end, like any other. Forster's own AF instructions put "Read the rest of the instructions" on the list. |
| B depends on A | Dot A before B (FAQ: "it is easy to re-arrange them"). |

Edge cases found in review:

1. FVP has no "built, test pending". Re-entry covers it.
2. Only the user can feel what stands out, so only the user dots. Cost: a scan each time the chain empties.
3. Two Claude sessions editing the board at once: conflict. Inference: rare. Git shows it.

## Migration

1. Board-pending's tasks replace the open UX tasks, as its header says. Both lists merge into one, without rewording.
2. Delete `../Board-pending.md` and the Pending rule.
3. The Workflow becomes the FVP rules, the mapping and Claude's part above.
4. Update the board lines in CLAUDE.md.
5. One commit. Archives untouched.

## Sources

- [Autofocus rules](http://markforster.squarespace.com/autofocus-system/)
- [Final Version FAQs](http://markforster.squarespace.com/final-version-faqs/)
