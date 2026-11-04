# How we work

1. The user owns this list. Claude edits it only when asked, or to tick a done task.
2. New tasks go at the end. Work happens on the last dotted task.
3. A task is done when the user has tested or reviewed it, and Claude has committed it. The tick goes in the same commit.
4. When changed files pile up mid-task, Claude suggests a commit.
5. After a task is done, Claude moves to the new last dotted task on its own. It names the task by its text and shows a high-level plan in plain words, without file or line numbers. Then it waits for the user's go.
- Following task should be part of setting up this file [ ] Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else.

# List

- [.] Reply length investigation, outside the project and exempt from Workflow: measurements, causes and proposed CLAUDE.md changes are in `docs/reply-length-investigation.md`. Next: agree the changes, apply them, re-measure. Measured: TLDR lines are 17 percent and table rows 39 percent of all reply words. Root cause, discussed with another AI instance: `docs/reply-length-rca.md`.
- [ ] Explore the conversation patterns in `docs/conversation-exploration/transcript.txt`, and how this project can use them.
- [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
- [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [.] UX bug: Overlay stacking: the focus arrow can show above the comment popup. Overlays and their z-index (`web/base.css`): comment popup 5, focus arrow 6, error banner 10, settings button and Send button 1. Inference: the focus arrow can draw over the comment popup.
- [ ] Claude's thinking shows in the reply pane, toggleable.
- [.] Dead doc links: review every link to a deleted doc. Found: this list's "Reply history" line (`plans/data-loss.md`), `web/markdown.js:23` (`docs/plans/data-loss.md`), `web/markdown.js:31` (`docs/Board-pending.md`). Also `web/views/comments.js` comments link `docs/plans/data-loss.md`. Point them at tag `board-before-fvp` or drop the links. Also this list's FVP Workflow line gives `dev-workflow-ideation/…` without the `docs/` prefix.
- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: a line goes in the same commit as the change, which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. CLAUDE.md then points to the doc.
- [ ] Global CLAUDE.md: "In your reply Use headings and numbered lists" pushes Claude to answer in steps. Rule wanted: give steps only when the user asks for them. And see how headings and numberd lists can be formatted well.
- [ ] Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else. After each weeding, move this weed task to the bottom of the list.
- [.] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay. Since comments are page based, they clear as page changes.
- [ ] simple prev next response navigation.
- [.] create skill, global for this fvp style workflow
- [.] Recurring Release, how to ensure? trigger?
