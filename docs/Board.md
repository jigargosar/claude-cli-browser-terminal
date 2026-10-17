# Workflow

The board exists so that all known work is written in one list, and the next task is never a guess.

- The last slice is the open slice. All other slices are closed.
- The open slice is one list of tasks: all known work, ticked or not. A task may have a sub-list of its steps, one level, each step ticked on its own.
- Any task may be written at any time. Work on a task only after it is written.
- Reorder tasks when it helps.
- When a task is done and tested: tick it, move it below the last ticked task, commit.
- Work done without a task: add it to the open slice, ticked.
- A task that is no longer wanted is deleted.
- Start a new slice when the context changes, or when the open slice is too long. Move every unticked task into it. The old slice is then closed.
- When a part of a long slice is done and tested, suggest a new slice.
- Closed slices need not follow the Workflow. Do not read a closed slice as an example of the rules.

--- 

# Slice 16
- [x] Slices 14 and 15 moved to `docs/Board-archive-2026-10-13.md`
- [x] Bring in all known tasks.
- [x] Process them.
- [x] Bring quick fix issues on top, and if they take too much time, then deprioritize them.
- [x] ccw refuses to start unless the build watch runs, and copies `pnpm watch` to the clipboard. The watch holds port 7689 as a lock. All in `scripts/build-watch/`, explained in its README.
- [x] Scroll to top when a new reply arrives. Without creating a jerking effect, if any. (Make it easy on the eyes, i.e. simple easing or some such thing.) while at it, also fix the gap between scrollbar and viewport edge.
- [x] A/B test marked against markdown-it: marked stays. markdown-it's gains (link plugin, escaped raw HTML) are small fixes on marked. Patch updates for marked, dompurify, puppeteer-core.
- [x] Web links in a reply open in a new tab, so a click never leaves the session (DOMPurify hook in `web/markdown.js`).
- [x] !! Markdown or any code fence needs word wrap and copy. A Wrap and Copy bar on each code block (`web/views/last.js`).
- [x] Bugs live in CLAUDE.md under Known issues, not on the board. `Promise<T>` and Rewind moved there.
- [x] CLAUDE.md: Terminal basics dissolved. Keys, the headless mirror and the protocol were duplicates of code comments, so they are gone. ConPTY and transcript-only went under Files, Ink duplicates under Known issues. File-change facts stay, titled as facts for concurrent editing.
- [x] Terminal knowledge cut to the supercritical: four lines in CLAUDE.md. `docs/Terminal.md` deleted; its one critical fact (output keeps its width) is the why of Decision 1.2.
- [x] !!! Raw HTML in reply prose vanished: `<placeholder>` text in Claude's replies was dropped. Now escaped in marked's `renderer.html`, except `details`, `summary` and `small`, which fold or shrink carried-forward points.
- [x] A list item that is only `<small>` text shrinks whole, number included, and turns muted (`web/reader.css`).
- [x] select text, type something, repeat multiple times, then send at once. This maintains my sanity, when I want to respond to multiple parts of ai response.
  - [x] Mockup `docs/mockups/comments.html`: Reply button at the selection (Floating UI), popup saves on Enter, highlight stays, a click on it reopens the popup, Submit sends all.
  - [x] Build it into the page (`web/views/comments.js`). Submit pastes the quotes and comments into claude's prompt and presses Enter.
  - [x] Mockup: `docs/mockups/replies.html`.
- [x] Ctrl+Enter sends all comments: from the comment box (saves it first) or anywhere in the reply pane.
- [x] Idle disconnect while the server runs: recorded under Known issues in CLAUDE.md, postponed.
- [x] CLAUDE.md: removed the misread rules "works exactly like claude in a terminal" and "nothing is parsed from the terminal stream".
- [x] A bare Alt tap focused the browser's menu. The page swallows it.
- [x] !!! Why our first line interpretation doesn't work compared to Claude Desktop.
- [x] A rebuild reloaded the page mid-turn and lost comments. The reload now waits for the turn's end.
- [x] Focus trap: Tab and Shift+Tab cycle the reply pane's stops (`tabbable`). Past either end, focus goes to the terminal. With nothing focused, Tab picks the pane's first stop.
- [x] Quick Keybord based traversal across panes. Focus trapped. Current state: Tab in the terminal stays Claude's. Alt+Backquote switches panes. Tab and Shift+Tab cycle the reply pane's stops (`tabbable`); past either end, focus goes to the terminal; with nothing focused, Tab picks the pane's first stop. Built, untested.
  - Research on Tab and mode keys: `docs/mode-keys-research.md`.
- [x] Removed the leftover Enter debug log in `web/main.js`.
- [x] Favicon for quick identification: dark terminal half with a prompt, sepia half with text lines (`web/favicon.svg`).
- [x] Sepia is the only reading theme, sans the only font. The Theme and Font sections are gone from the settings.
- [ ] Permanent focus feedback: which pane gets the keys, or none. Ideas and verdicts: `docs/focus-indicator.md`.
- [ ] The error banner covers dialogs and other elements. Show it as an overlay that can be dismissed.
- [ ] Thinking block. travel to previous replies. 
- [ ] The reply pane swaps one reply for the next too harshly. Add a transition.
- app should show version.
- [ ] A send or a stray keystroke can answer a dialog claude shows (a comment's Enter approved a git permission prompt). Guard against it.
- [ ] preserving comments and send button carrying historic comments I am not sure I ned that feature, and at the same time no way to clear it. and its content are also not visible. 
  - [x] For now: comments clear when a new reply arrives.
  - [ ] Comments survive a refresh. They belong to the reply on view.
  - [ ] A button discards all comments by hand.
- [ ] (Wating for regression) The page reloaded twice for one rebuild, seen once at 17:42 on 2026-10-17. A reload log (`.ccw-cache/reload.log`) now records rebuilds, tab connects and closes, and the page's reload decisions; it works after the next ccw start. Read it when it happens again.
- [ ] A rebuild between two dependent edits can leave the page on a broken in-between build. If its reload handler is what broke, no later rebuild can recover it ("a is not a function" on every reload message). Only a manual refresh gets out.
- [ ] A small message sent mid-turn gets a small reply, which replaces the long reply in the pane. The user is left staring at a wall.
- [ ] Edit project files (Board.md, CLAUDE.md) in the page, by comments or direct markdown editing. Edits concurrent with Claude's are edge cases; a library such as Yjs may handle them. See "Concurrent editing facts" in CLAUDE.md.
- [] (recurring) QN means quickie notes, is the quintessential client where we work using this project. So we need to bring in all the tasks, regularly.
- [ ] Merge the board's Workflow with the `/board-setup` skill's. Write the result to both.
  - [ ] Take the skill's version: Terms, archive on close, first open task is next, bare lines reformatted, `[x]` never means dropped, Commits with "WIP:".
  - [ ] Keep the board's "Any task may be written at any time" and the `---` separator.
  - [ ] Archive name `docs/Board-archive-<date>.md`, one file per closed slice.
  - [ ] Fold the global rule "commit before a multi-cycle task" into Commits.
- [ ] browser-test skill: launch headless by default, a visible window only on request. If visible, add `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-background-timer-throttling` and minimize via CDP after each check, so a minimized window still renders.
