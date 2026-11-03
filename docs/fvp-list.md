# How we work

1. The user owns this list. Claude edits it only when asked, or to tick a done task.
2. New tasks go at the end. Work happens on the last dotted task.
3. A task is done when the user has tested or reviewed it, and Claude has committed it. The tick goes in the same commit.
4. When changed files pile up mid-task, Claude suggests a commit.
5. After a task is done, Claude moves to the new last dotted task on its own. It names the task by its text and shows a high-level plan in plain words, without file or line numbers. Then it waits for the user's go.

# List

- [.] Reply length investigation, outside the project and exempt from Workflow: measurements, causes and proposed CLAUDE.md changes are in `docs/reply-length-investigation.md`. Next: agree the changes, apply them, re-measure. Measured: TLDR lines are 17 percent and table rows 39 percent of all reply words. Root cause, discussed with another AI instance: `docs/reply-length-rca.md`.
- [.] All UX: Spike: `docs/mockups/keys.html`, a working prototype of the page with a real xterm (local echo). It switches between Today and Fixed focus rules, and logs where each key lands. Fixed: the mouse never moves the keys, the comment box borrows them and gives them back, and stray keys go to the terminal.
- [ ] Drawing tilde on arrow.
- [.] Capture all intermediate logs. Show them perhaps as collapsed blocks, as other tools do, so they are easy to browse. Unlike Claude desktop and web.
- [ ] Board visibility.
- [.] Atkinson Hyperlegible Mono for code in the reader pane.
- [x] ccw reliability: review the project, verify each ccw reliability issue, then fix the pragmatic ones. Found 2026-10-24.
- [.] ccw reliability: Resume replays every line as its own item. Each reply starts a View Transition, each skips the one before, and `web/views/last.js:53` rethrows the `AbortError`. Verified in code: `followTranscript` tails `fromBeginning` and sends one `item` per line; `main.js:36` calls `last.show` for each reply. Error spam; the swap still runs. Fix idea: tolerate `AbortError`, maybe send the replay as one batch.
- [ ] Adhoc testing: Evaluate the browser-test skill change: launch headless by default, a visible window only on request. If visible, add `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-background-timer-throttling` and minimize via CDP after each check, so a minimized window still renders.
- [ ] Adhoc testing: `pnpm test` removes every `CLAUDE*` variable itself, so a test Claude starts gets a transcript.
- [ ] Explore the conversation patterns in `docs/conversation-exploration/transcript.txt`, and how this project can use them.
- [x] Workflow: try Forster's FVP on the board. Proposal saved in `dev-workflow-ideation/fvp-workflow-proposal.md`.
- [ ] Typed text lost: while reading in Ctrl+O mode, the focus was not on the text box, and everything typed was lost.
- [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [x] CLAUDE.md Decision 2.2 says the reader pane may be blank after a refresh. Inference: outdated, since the server sends every item on connect (`server.mjs:244`).
- [x] Revisit the global CLAUDE.md rule "when the work stops moving forward". Its intent was different from how Claude applied it.
- [.] Analyze the view implementation: does it need an upgrade, can it be simplified, what are the tradeoffs.
- [.] UX bug: Overlay stacking: the focus arrow can show above the comment popup. Overlays and their z-index (`web/base.css`): comment popup 5, focus arrow 6, error banner 10, settings button and Send button 1. Inference: the focus arrow can draw over the comment popup.
- [ ] UX keys: Pane switch: Alt+` is easy to confuse with the Chrome Alt+Q shortcut. Find a clearer key or cue.
- [ ] UX keys: Sentence select mode: a key marks each sentence in the reader pane with a letter. Typing a letter picks that sentence and starts the same flow as a click on it.
- [x] UX polish: Commented text and text picked but not yet commented get different highlight colors.
- [x] UX feature: The comment popup shows Reply, Yes and No. Yes and No send their word as the comment. While the popup shows, the keys R, Y and N press its buttons, and Esc closes it. Each button underlines its key letter.
- [ ] UX feature: Reply history: browse earlier replies, not only the last one. Also fixes data-loss case 3: a new reply clears unsent comments ([plans/data-loss.md](plans/data-loss.md)).
- [ ] UX feature: Mods: explore which dialogs Claude shows (`docs/mods/`)
- [ ] UX feature: Bring any file into the page and collaborate on it the way we do on Claude's replies. Start with `docs/fvp-list.md`.
- [ ] UX feature: Bookmarks: bookmark a reply, perhaps also selected text in it
- [ ] The user's prompt stays sticky at the top of the reply.
- [ ] Inference is easy to tell apart from fact in a reply.
- [ ] Claude's thinking shows in the reply pane, toggleable.
- [x] Friction file: rename `docs/fvp-friction.md` properly, write down its purpose and how to use it, and link it from the places that need it (none link it today: not `CLAUDE.md`, the list or the rules).
- [ ] Links in replies: decide the fate of the commented-out new-tab hook in `web/markdown.js:31-40`. Today every link renders as its text only (`web/markdown.js:24-26`), so no link can leave the tab, and the hook is dead code. Options: delete it, or bring links back with every link opening outside the tab.
- [ ] Dead doc links: review every link to a deleted doc. Found: this list's "Reply history" line (`plans/data-loss.md`), `web/markdown.js:23` (`docs/plans/data-loss.md`), `web/markdown.js:31` (`docs/Board-pending.md`). Also `web/views/comments.js` comments link `docs/plans/data-loss.md`. Point them at tag `board-before-fvp` or drop the links. Also this list's FVP Workflow line gives `dev-workflow-ideation/…` without the `docs/` prefix.
- [x] Since everything is working condition, we should first figure out a release plan. README should show how to install this project and use it.
- [x] can we quickly change the font from bold to thinner monospace in xterm if yes we do it, else leave it for later.
- [ ] try hyper on markdown pane.
- [ ] clean up claude file, it is ridiclous. 
- [x] ensure that readme points to the latest version, during release process.
- [ ] Write the release steps in their own doc, next to the scripts, the way `scripts/build-watch/README.md` does for the watch. The README stays user-facing: how to install and use. Include the changelog process: a line goes in the same commit as the change, which section to use (Added, Changed, Removed), the Keep a Changelog format, and what `kacl` checks and stamps. CLAUDE.md then points to the doc.
- [ ] make popup wider.
- [ ] Comments: look for simpler ways to bring back two deleted features. Implement one only if a simpler way turns up. 1) The tooltip on commented text: it cost about 74 lines (two timers, a second Floating UI follower, a stale-placement guard, three listeners on `#reply`, a CSS fade with a `[hidden]` override). 2) A second click on an open highlight closes it: it cost one `undone` flag that couples mousedown to mouseup. Without it, the click closes the highlight, then its mouseup opens it again (flicker).
- [x] check if there is any code, partial or otherwise that is supposed to handle scroll with buttons group or popup box. We need to clean this up.
- [x] need done button back
- [x] Remove the blue feature and if multiple tan yellow colors, are complex, one more concept to juggle, so remove them too. Done: blue is now the selection tan. The two ways of painting a pick stay. See "Selection" in CLAUDE.md Known issues.
- [ ] Global CLAUDE.md: "In your reply Use headings and numbered lists" pushes Claude to answer in steps. Rule wanted: give steps only when the user asks for them. And see how headings and numberd lists can be formatted well.
- [ ] Weed the list, recurring. Merge or delete duplicates. Delete tasks that a decision settled, that are already done, or that point at things that are gone. Check done tasks for facts recorded nowhere else, and keep those facts. When done, move this task to the end instead of ticking it.
