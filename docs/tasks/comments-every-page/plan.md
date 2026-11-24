# Comments on every page

Task in `docs/fvp-list.md`: "Pain: unsent comments are lost whenever a new turn starts from the terminal".

Written in the quick notes session and approved by the user on 2026-11-24.

Pain: unsent comments are lost when a new turn starts from the terminal, and older pages can't take comments.

## Pages

- Each turn's page is drawn once and kept in the DOM, hidden when another page shows.
- Older pages are no longer redrawn on each visit. Today `web/views/last.js` redraws them into one shared container.
- Kept pages stay in the DOM, only hidden. A detached page stops listening to the entry filter, per the `status.isConnected` check in `web/views/turn.js`.
- Each page remembers its own scroll position.
- A new turn hides the latest page and shows the new one, with today's crossfade. An open comment box is saved first.
- The page that was latest gets `update({ latest: false })`, so it stops showing "Running".
- On every page, click, F, add, edit and delete work as on the latest page today. The read-only mode goes away.

## Comment states

- Unsent: written or edited, not sent yet. Today's highlight.
- On its way: sent, not yet seen in the transcript. Today's highlight plus a dashed underline.
    - A CSS highlight takes only colors and underlines, so no stripes.
- Sent: seen in the transcript. Faded highlight.
- Editing a comment's text makes it unsent again. An empty save deletes it, as today.

## Send

- One button, the same on every page, bottom right as today. Alt+Enter as today.
- It sends every unsent and every on-its-way comment, from all pages, as one message, in the order they were written.
- Message format is today's `message()` in `web/views/comments.js`.
- Label: "Send 3 comments · Alt+Enter". When some come from older turns, it adds "· 2 from older turns".
- Hidden when nothing is left to send.

## Confirmation

- On each new prompt item, every on-its-way comment is checked.
- A comment is sent when the prompt text holds both its quote and its comment.
    - Both sides are compared with `pasted_content` tags removed and whitespace collapsed.
- A comment that never shows up stays on its way, and the next Send includes it.
- Checked 2026-11-24: 17 pasted messages in a transcript each start with a newline and then the paste tag.
    - So the `startsWith("<")` check in `server.mjs` keeps them as prompts.

## Pill in the turn bar

- In `#turn-nav` in `web/index.html`, after the "new" pill: "2 unsent · turn 9".
- It counts unsent and on-its-way comments on other pages, and names the nearest such page.
- A click jumps there. Hidden when there are none.

## Unchanged

- `/clear` and a reconnect still clear all comments, in `onItems` in `web/main.js`.
- Send can still land in an open dialog. The comments then stay on their way.

## Files

- `web/views/last.js`: one kept page per turn, scroll per page, no read-only mode.
- `web/views/comments.js`: states, three highlights, Send across pages, confirmation.
- `web/main.js`: no clearing on a new turn, and each prompt item goes to the confirmation.
- `web/index.html` and `web/base.css`: the pill, and the two new highlight looks.
- `CHANGELOG.md`: lines under Unreleased, then propose a release.

## Code facts found while specifying

- Find labels need no change. `web/views/hints.js` labels only sentences with a visible first box, so hidden pages get none.
- A click on a comment needs no change. `hits()` in `web/views/comments.js` reads client rects, and hidden ranges have none.
- File reference links are made before a text node reaches the page, in `replyNode` in `web/views/last.js`. So they never break a highlight.
- The entry filter refills group summary lines only. The prompt and Claude's text are never redrawn.

## Done when

- [ ] Comment on a page, then answer "No" in a dialog. The comments are still there, the button says "from older turns", and the pill shows.
- [ ] On an older page, click, F, edit and delete work.
- [ ] After Send, the comments get the dashed underline, then fade when the prompt appears.
- [ ] With a dialog open, Send leaves the comments dashed.
- [ ] Editing a sent comment makes it unsent.

## Not verified

- How the transcript records a message sent while Claude is still running.

## Added by Claude, 2026-11-24

- Not part of the spec above.
- Primary goal: a comment is never lost to a new turn, and every page takes comments like the latest page.
- Known limit, found in older transcripts of this project.
    - A message sent while Claude is running can be recorded as an `attachment/queued_command` entry, with the reason `absorbed_mid_turn`.
    - `server.mjs` makes prompt items only from user lines, so the confirmation misses such a message.
    - Its comments stay on their way, and the next Send sends them again.
    - Accepted: the user is fine with double sending.
- Still not verified: how a queued message is recorded when it is delivered after the turn ends.
