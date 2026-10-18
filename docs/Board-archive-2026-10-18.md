# Closed slices

Moved from Board.md. Closed slices need not follow the Workflow.

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
- [x] The error banner covered dialogs and other elements. Now one banner collects every error, with a Dismiss button (`web/errors.js`).
- [x] Permanent focus feedback: a triangle from the divider's center points into the pane that gets the keys, sepia over the terminal, dark over the reply; a diamond when nothing has focus. Ideas and verdicts: `docs/focus-indicator.md`.
- [x] Alt+Backquote focuses the reply pane's first element (today the gear), not the reply text. Tab and Shift+Tab then wrap inside the pane. Only Alt+Backquote goes back to the terminal.
- [x] The gear is mouse only. The reply text is no Tab stop: Tab cycles only buttons and links. Alt+Backquote lands on the first one, or on the reply text when there is none.
- [x] Coming back from a link's new tab, focus stays on the link instead of jumping to the terminal.
- [x] Code blocks start wrapped. The Wrap button unwraps.
- [x] The reply pane swapped one reply for the next too harshly. Now the old reply crossfades into the new one, 0.4s, even under reduced motion (Windows reports it when animation effects are off).

# Slice 17
- [x] Error banner text can't be selected or copied. Suspected: a click on the banner blurs the terminal and `main.js` refocuses it, which drops the selection. Fixed: the banner is focusable (`web/errors.js`), so the click stays on it. Checked with puppeteer: a drag selects the text, and without the fix the focus goes back to xterm and the selection is empty.
- [x] Banner "InvalidStateError: Transition was aborted because of invalid state. Document hidden": a reply that arrives in a hidden tab aborts the crossfade, and its rejected `ready` reaches the banner. Fix in `web/views/last.js`: no transition in a hidden tab, and an abort is recovered. Checked with puppeteer in a hidden tab: the old code raised the rejection and still showed the old reply after 300 ms. The fix raises none and shows the new reply.
- [x] CLAUDE.md: test trip wires and cleanup notes under Rules, the divider focus-triangle bug under Known issues.
- [x] Selection convenience: a single click in the reply picks the sentence under it (a line in a code block) and shows Reply (`web/sentence.js`). Links and buttons keep their click. Drag and double click select as before. Tested by the user.
  - [x] Bug: the Reply button flickered and jumped.
    - Attempt 1: Reply placed before it shows; a press in the reply clears the selection first. Fixed the jump, the stale Reply and double click. A drag inside a clicked sentence still selected the whole sentence.
    - Attempt 2: the clicked sentence is a CSS highlight, not the browser selection, so drags and double clicks never start inside a selection. Puppeteer: click, same click again, double and triple click right, no jump. The drag checked by the user.
