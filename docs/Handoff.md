# Handoff, 2026-10-13 evening

Read this, then delete the file.

## Where things stand

1. Released 0.1.1. Since then, committed: shift-enter newline, 50/50 default split with a 480px terminal floor, ctrl-w left to the browser (ctrl-backspace deletes a word), focus ring with Ctrl+` toggle, puppeteer-core as a dev dependency.
2. Uncommitted at handover: `web/views/all.js` (interim all-replies view), `web/main.js` wiring to it, `web/reader.css` reply separators, `web/views/last.js` removed, `docs/mockups/replies.html` (R1 mockup), board and CLAUDE.md updates. This handoff commits them.
3. The user judged the session unproductive. Read the next section before touching the reply pane.

## R1, the reply pane requirement, in the user's terms

1. The pane shows one reply at a time, not a scroll of all replies.
2. Up arrow shows the previous (older) reply. Down arrow shows the next (newer) one.
3. The change is animated in the key's direction, so up and down look different. A static replace is not acceptable.
4. Mocked replies must differ in content and size, so a change is visible at a glance.
5. The mockup is the right half of the page only and looks like the real pane: same stylesheets, gear, fonts. Exact markdown rendering is not required.
6. Nothing beyond R1 is implemented until the user approves the mockup. Explicit permission in this project is the user typing "go" twice.

## Lessons from this session

1. Shift-enter failed three times because the xterm key handler returned false on keydown only. The browser also fires keypress for Enter, so xterm sent a CR after the injected bytes. Check the event path before changing the payload.
2. Browser tests run through the `browser-test` skill. Read the result from the server: after the tab closes, a new socket gets the serialized screen.
3. Ctrl-w never reaches the page in Chrome. A leave guard armed by keydown never fires. Do not retry.
4. Keep tool output small. A web fetch of a whole docs page cost 298 KB and was called out.
5. The user's global rules were rewritten with their approval; backup at `~/.claude/CLAUDE.md.v14.bak`.
