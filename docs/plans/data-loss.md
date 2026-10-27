# Plan: no data loss in comments

Status: proposed, 2026-10-27. Board task: "Critical: Data loss during communication".

## Cases

| # | Case | Source |
|---|---|---|
| 1 | Esc in the comment box drops the text typed since the box opened. | Verified by the user. Code: `web/views/comments.js:183` hides the box without saving. |
| 2 | A page reload drops every comment. A click on a link in the reply is one way to reload. | Verified by the user. Code: `comments` lives only in page memory (`comments.js:17`). |
| 3 | A new reply drops the unsent comments. | Code comment, `comments.js:3`. Not yet seen live. |
| 4 | A reload was the only way to delete all comments. Fixing case 2 removes it. | The user's board note. |

## Steps, smallest first

1. Esc saves, the same as Enter and a click outside. An empty comment still deletes it.
2. A link in the reply opens in a new tab, so the page never leaves.
3. Before the page unloads with unsent comments, the browser asks to confirm (`beforeunload`).
4. A "Clear all" button beside Send, so a reload is never needed to delete.
5. Comments survive a reload. Each comment is stored as text plus a text-quote selector, not as a DOM Range. The server saves them in `<project>/.ccw-cache/`, like the settings, since the port changes each run. After a reload, they are re-anchored when the reply shows.
   - Library to check first: `@apache-annotator/dom` (W3C text-quote selectors). Inference: it does the anchoring, so we do not write our own.
6. Case 3: decide whether unsent comments stay with their reply, or carry over to the new one.

## Open questions

- Step 5: does the reply come back after a reload? CLAUDE.md says the reader pane may be blank after a refresh. If it stays blank, the comments have no text to anchor to.
- Step 6: which behavior is wanted?

## Testing

- Steps 1 to 4: a manual test by the user, or a console script the user pastes.
- Step 5: reload with comments, in both the live tab and after a server restart.
