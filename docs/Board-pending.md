# Board pending

Status: to resolve. Once agreed, these tasks replace the open UX tasks on the board. Written 2026-10-27.

## Tasks

- [ ] Links in replies: a file or file:line link opens in the editor, not in the tab.
- [ ] Board archive: put the archive files in their own folder, so other docs are not hidden among them. Update the Workflow rule.
- [ ] Links in replies never affect this tab: every link opens outside it, whatever its href. Cause found: the new-tab hook in `web/markdown.js` (commented out) matched only http(s) hrefs, so a relative link such as `web/main.js#L83` opened in the same tab. Fix idea: `target="_blank"` on every `<a>`, or catch every link click and `window.open` it.
- [ ] Clear all: once comments survive a reload, a way to delete every comment on purpose. Why: a reload was the only way to delete all comments, so it was used as one. To decide: undo, or is a confirmation enough?
- [ ] Loss scenarios: decide how to guard against data loss, by confirmation, by undo or by another design. Another option is continuous save that also keeps the content's undo and redo, so even Esc can close freely. This needs deep thought and analysis.
- [ ] Clearing a comment's text and then saving deletes the comment with no guard, because an empty save is treated as an edit.
- [ ] Delete a comment explicitly. Today the only way is to empty its text. To decide: undo, or is a confirmation enough?
- [ ] Rewind: decide what the reader pane and the comments do on a rewind. Today the pane keeps the last reply (CLAUDE.md, Known issues).
- [ ] CLAUDE.md Decision 2.2 says the reader pane may be blank after a refresh. Inference: outdated, since the server sends every item on connect (`server.mjs:244`).
- [ ] Revisit the global CLAUDE.md rule "when the work stops moving forward". Its intent was different from how Claude applied it.
- [ ] Analyze the view implementation: does it need an upgrade, can it be simplified, what are the tradeoffs.
- [ ] UX bugs
  - [ ] The popup follows the selected text when the page scrolls.
  - [ ] Overlay stacking: the focus arrow can show above the comment popup.
- [ ] UX keys
  - [ ] Pane switch: Alt+` is easy to confuse with the Chrome Alt+Q shortcut. Find a clearer key or cue.
  - [ ] Submit: Ctrl+Enter clashes with right Ctrl, which is set to Handy (STT). Pick another key.
  - [ ] Keys spike (`docs/mockups/keys.html`). Low priority.
  - [ ] The reader pane is fully keyboard driven: every mouse action in it also has a key.
  - [ ] Global shortcuts: keys that work from either pane, such as sending the comments from the terminal pane.
  - [ ] Sentence select mode: a key marks each sentence in the reader pane with a letter. Typing a letter picks that sentence and starts the same flow as a click on it.
  - [ ] Esc on a picked sentence clears the pick and its popup. Nothing is lost, since no comment exists yet.
- [ ] UX polish
  - [ ] Atkinson Hyperlegible fonts
  - [ ] Tooltip on highlighted text
  - [ ] Click to unhighlight, with one color for commented text and another for not-yet-commented text
- [ ] UX features
  - [ ] More options in the popup, beside Reply and Done
  - [ ] Keep the highlights of what was sent to Claude
  - [ ] Reply history: browse earlier replies, not only the last one
  - [ ] Intermediate logs as collapsed blocks
  - [ ] Mods: explore which dialogs Claude shows (`docs/mods/`)
  - [ ] Comment on any document the way you comment on replies, starting with the board
  - [ ] Maximize the terminal pane or the reader pane
  - [ ] Bookmarks: bookmark a reply, perhaps also selected text in it

## Notes

- The user asked a reply to lead with a specific answer. The tickler reminder then came second, which worked well.

## Naming, to settle

- What the user types on a reply: the code says "comment" (`web/views/comments.js`, "Send 2 comments"). The popup button says "Reply". Pick one word.

Source: the user's answers on what each open UX task means.

## Facts from the code

- Overlays and their z-index (`web/base.css`): comment popup 5, focus arrow 6, error banner 10, settings button and Send button 1. Inference: the focus arrow can draw over the comment popup.
- Alt+` switches the pane (`web/main.js:83`).
- Inference: Claude's replies are already stored in Claude Code's transcript. The page shows only the last one.

Pane names: "terminal pane" (left) and "reader pane" (right).

# my notes
- observation, divider can gain focus and it shows funny focs arrows. 
