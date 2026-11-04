# How we work

1. The user owns this list. Claude edits it only when asked, or to tick a done task.
2. New tasks go at the end. Work happens on the last dotted task.
3. A task is done when the user has tested or reviewed it, and Claude has committed it. The tick goes in the same commit.
4. When changed files pile up mid-task, Claude suggests a commit.
5. After a task is done, Claude moves to the new last dotted task on its own. It names the task by its text and shows a high-level plan in plain words, without file or line numbers. Then it waits for the user's go.
6. The list always holds the weed task. If it goes missing, add it back at the end with this text: "Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else."
7. Before work starts on a task, understand its gist. The task text, and any solution it names, may be an XY problem. Find the real need first. Even when the need is clear, double-check the solution. A solution stated as fact is still not taken for granted.
8. Changelog trigger: a commit with a change a user would notice adds its line under Unreleased in `CHANGELOG.md`, in that same commit.
9. Release trigger: after a task is ticked, if Unreleased in `CHANGELOG.md` has lines, Claude runs `pnpm release`. A release stamps the changelog, tags the version, and publishes the tarball in `published-versions/`, which the README install command points at.

# List

- [.] Reply length investigation, outside the project and exempt from Workflow: measurements, causes and proposed CLAUDE.md changes are in `docs/reply-length-investigation.md`. Next: agree the changes, apply them, re-measure. Measured: TLDR lines are 17 percent and table rows 39 percent of all reply words. Root cause, discussed with another AI instance: `docs/reply-length-rca.md`.
- [ ] Explore the conversation patterns in `docs/conversation-exploration/transcript.txt`, and how this project can use them.
- [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
- [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [.] UX bug: Overlay stacking: the focus arrow can show above the comment popup. Overlays and their z-index (`web/base.css`): comment popup 5, focus arrow 6, error banner 10, settings button and Send button 1. Inference: the focus arrow can draw over the comment popup.
- [ ] Claude's thinking shows in the reply pane, toggleable.
- [x] Dead doc links: review every link to a deleted doc. Found: this list's "Reply history" line (`plans/data-loss.md`), `web/markdown.js:23` (`docs/plans/data-loss.md`), `web/markdown.js:31` (`docs/Board-pending.md`). Also `web/views/comments.js` comments link `docs/plans/data-loss.md`. Point them at tag `board-before-fvp` or drop the links. Also this list's FVP Workflow line gives `dev-workflow-ideation/…` without the `docs/` prefix.
- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: a line goes in the same commit as the change, which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. Also the compare links at the bottom of `CHANGELOG.md`. `[Unreleased]: …/compare/<last tag>...HEAD` makes the Unreleased heading open GitHub's compare of the last tag to `HEAD`, so it lists every unreleased commit. Use it to check Unreleased before a release. `kacl release` writes these links: the 0.1.8 release set `[Unreleased]` to `v0.1.8...HEAD` and added `[0.1.8]` as `v0.1.7...v0.1.8`. CLAUDE.md then points to the doc.
- [ ] Global CLAUDE.md: "In your reply Use headings and numbered lists" pushes Claude to answer in steps. Rule wanted: give steps only when the user asks for them. And see how headings and numberd lists can be formatted well.
- [ ] Weed the list. This weed task is a reminder, so it is never ticked. Merge or delete duplicates. Delete done tasks, and tasks that a decision settled or that point at things that are gone. Before deleting a done task, keep any fact it holds that is recorded nowhere else.
- [.] full history of all popups changes like a journal, and ability to undo redo, across open/close, comments stay. Since comments are page based, they clear as page changes.
- [ ] simple prev next response navigation.
- [x] create skill, global for this fvp style workflow
- [x] Recurring Release, how to ensure? trigger?
- [x] CLAUDE.md: unwrap the Testing bullets to one line each, like every other bullet in the file.
- [x] CLAUDE.md: move all testing guidance under Testing. Today the `CLAUDE*` variable rule, the test trip wires and the cleanup rule sit under Rules.
- [x] CLAUDE.md: make every `##` heading a `#` heading.
- [ ] Global CLAUDE.md: questions, lookups and stops. Trigger: asked "how many KB is the file", twice, Claude answered with an inference instead of running `wc`. 1) Stop: when the user rejects a tool call or presses Escape, the harness tells Claude to stop and wait. That stop ends with the user's next message. If that message asks for a lookup, Claude runs it. Today Claude carried the stop forward and avoided every tool call. Find out why Escape stops Claude this way, then add a hard rule. 2) The rule "When the user asks a question, respond with an answer. Don't ... take any action" treats every question the same. A question is one of two kinds. One Claude can answer from what it knows, as fact or labeled inference. The other asks Claude to go find out, and needs a read-only lookup. A lookup is not an action the rule forbids. Rewrite the rule so it tells the two apart. 3) Keep the fact rule as it is: state as fact only what a file, command output or doc shows, and label the rest inference. Inference is for what no lookup can settle. It never replaces a lookup Claude can run.
  - Context, verbatim from the discussion:
    - Trigger: you asked the file size twice and got an inference instead of a `wc` run.
    - Stop: a rejected tool call or Escape stops Claude until your next message, not longer. If that message asks for a lookup, Claude runs it. It includes finding out why Escape stops Claude this way, then adding a hard rule.
    - Two kinds of question: one Claude answers from what it knows, and one that asks Claude to go find out. A read-only lookup is not a forbidden action. The "no action on a question" rule gets rewritten to tell the two apart.
    - The fact rule stays as it is. Inference is only for what no lookup can settle.
  - Why Claude gave an inference, verbatim from Claude's reply:
    - Your question was clear. Two things kept me from measuring:
    - Your global rule says: "When the user asks a question, respond with an answer. Don't panic, overcompensate or take any action." I counted a read-only measurement as an "action".
    - You had just rejected two of my tool calls with "STOP". So I avoided every tool call.
    - Another rule says to state as fact only what a command output shows, and to label the rest inference. With no measurement, I fell back to an inference label.
    - The gap: the "no action on a question" rule does not say whether a read-only lookup needed to answer counts as an action. I read it as yes, and that produced the inference.
  - The harness text Claude gets after a rejected tool call: "STOP what you are doing and wait for the user to tell you how to proceed."
- [ ] Visibility of thinking is really important because I keep switching back and forth between terminal and response. So, some way of looking at the thinking part is not essential, but at least it's very curious because not only curious, but it also might help you know how you think about things 
- [ ] small gestures, like trackpad touch is causing focus to swtch either we stick to shortcut only switch, or we put some threshold for pointer event.
- [.] Global skill `install-ccw` in `~/.claude/skills/`: Claude in any project can install ccw. Also one project description, tagline plus description, in every place that holds one: the skill, `package.json`, the README and the GitHub About field.
