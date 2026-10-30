```
    _____
   |~~~~~|      🌤️ Midday pills · 54 m
   |     |
   |  💊 |      perhaps now, with a glass of water,
   |_____|      before we get into the rules?
```

# The workflow: adopt Forster's system as written, with your corrections built in

## Revised root

1. The workflow was home-grown. It had no answer for urgent work, for picking up unfinished work, or for pruning.
2. Each gap got patched in the moment with something new: Board-pending, `../plans`, resume notes, a big pruning session. Those patches are the docs game.
3. Forster's systems answer all three, and they have been tested for years. This is your own rule "prefer a library over our own code", applied to process.

## AF1 or FVP

I recommend FVP (Final Version Perfected), the single-list system.

| | AF1 (pages) | FVP (one list) |
|---|---|---|
| Pruning | Dismissal of whole pages | "Weed list" is a task on the list (FAQ) |
| Urgent work | Not covered on the rules page | Explicit answer (FAQ) |
| Fit for a markdown file | A file has no pages, so we would have to invent a page size. That is a tweak. | Fits as it is |

## FVP rules

Rules 5–9 are verified from Forster's AF rules page and FV FAQ. Rules 1–4 are from memory, because the 2015 FVP post is offline.

1. Put a dot by the first open task.
2. Read down the list. For each task, ask "What do I want to do more than <the last dotted task>?" Dot each one that wins. The dotted tasks form a chain.
3. Do the last dotted task.
4. Scan again from that task down, comparing against the dotted task now last. Do the last dot. When no dots are left, go back to step 1.
5. If a task is finished, cross it off. If it isn't, cross it off and re-enter it at the end.
6. New tasks go at the end, without evaluating them.
7. Urgent: "Just add it to the end of the list like any other task. If the task is so urgent that it can't wait…, put a dot in front of it and do it as soon as you have finished the task you are currently working on."
8. Interruption: "deal with it and then return to where you were on the list."
9. Weeding: "Tasks which are outdated, irrelevant or causing lack of focus should be deleted. It's a good idea to keep 'Weed list' as a task on your list."

## Mapping to our file

This is the only adaptation. It is needed because a file is not a notebook, and because two people work the list.

| Notebook | Our file |
|---|---|
| Dot | `[.]` |
| Cross off | `[x]` |
| Cross off and re-enter | Move the line to the end, reworded to what is left |
| Turned page | When the top of the file is all `[x]`, delete those lines. Git keeps them. This is your delete experiment. Recent done tasks stay visible until then. |
| Who does what | You dot. Claude does the last dot, marks it, appends, and moves lines. |

## What Claude does

1. Appends every task that comes up in conversation to the end, one line each. Claude never groups or rewords other lines.
2. Writes its own steps for a task, in its own words, in the conversation before starting. This covers your point 4. The task stays one line, with at most one level of nested detail.
3. If a task needs a doc, such as research or measurements, its line links to the doc. The doc holds no status.
4. When the chain is empty, says so and asks you to scan. Claude never dots for you.
5. Commits board edits together with the work.

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
| A new idea comes up mid-task | `- [ ] Popup: more options` goes at the end. The current task continues. |
| Urgent bug | It goes at the end as `[.]`, and Claude does it right after the current task. Nothing above it moves, so the rest of the list stays untouched. That was the goal of Board-pending, without a second file. |
| Built, manual test still needed | The line moves to the end as `- [ ] Test: links open outside the tab`. This replaces `[t]`. |
| Session ends mid-task | The line moves to the end as `- [ ] First-session replies: fix written, live test left`. That line is the resume note, so no "where we are" section is needed. |
| Chain is empty | Claude asks for a scan. You see the list each time the chain empties. That prevents the overwhelm from not looking (your point 2). |
| The list grows | "Weed list" stands out on some scan. Doing it means deleting lines. Then it is re-entered at the end, so it comes back by itself. |
| An idea for a rule change | It is a task at the end, like any other. Forster's own AF instructions put "Read the rest of the instructions" on the list. |
| Task B needs task A first | Dot A before B (FAQ: "it is easy to re-arrange them"). |

Edge cases I found while reviewing the flow:

1. FVP has no "built, test pending" state. Re-entering the task at the end covers it.
2. Only you can feel which task stands out, so only you dot. The cost is one scan each time the chain empties.
3. Two Claude sessions editing the board at the same time would conflict. That is an inference, and probably rare. Git will show it.

## Typing loss

1. The comments you typed reached me. They are the pasted text in your message.
2. Only what you hadn't typed yet is missing.
3. Writing less wouldn't have helped. The accidental send is the problem, and it becomes a task at the end of the list.

## Migration

1. Board-pending's tasks replace the open UX tasks, as its own header says. Both lists merge into one, and nothing is reworded.
2. Delete `../Board-pending.md` and the Pending rule.
3. The Workflow becomes the FVP rules, the mapping and Claude's part above.
4. Update the board lines in CLAUDE.md.
5. Everything goes in one commit, and the archives stay untouched.

Sources: [Autofocus rules](http://markforster.squarespace.com/autofocus-system/), [Final Version FAQs](http://markforster.squarespace.com/final-version-faqs/)

TLDR: The docs game came from gaps in a home-grown workflow: no rules for urgent work, picking up unfinished work, or pruning. FVP covers all three as written, with only a small mapping onto a markdown file. Say go and I'll migrate the board in one commit.
