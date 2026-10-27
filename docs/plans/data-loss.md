# Plan: no data loss in comments

Status: in progress, 2026-10-27. Board task: "Critical: Data loss during communication".

## Cases

| # | Case | Source |
|---|---|---|
| 1 | Esc in the comment box drops the text typed since the box opened. | Verified by the user. Verified in code: Esc hides the box without saving (`web/views/comments.js:183`). |
| 2 | A page reload drops every comment. The recent cause was a click on a link in a reply. | Verified by the user. Verified in code: comments live only in page memory (`comments.js:17`). |
| 3 | Claude writes a new reply while the user comments on the previous one. The reader pane switches to the new reply and drops every unsent comment on the previous one. Example: a one-line note Claude writes mid-turn. | Verified in code: each new reply calls `comments.clear()` (`web/main.js:38-41`). Not yet seen live. |
| 4 | A reload was the only way to delete all comments. | The user's board note. |
| 5 | A page rebuild reloads the page at the turn's end. Development only. | Verified in code (`main.js:42-44`). The reload dialog now guards it. |

## Facts that shape the steps

- The reply comes back after a reload: the server sends every item on connect (`server.mjs:244`), and the page shows the last reply.
- Sent comments go to Claude as Markdown text: a numbered list, each item a quoted passage with the comment under it, in the order they were added (`comments.js:109-112`). It carries no reply id and no position.

## Steps

| # | Step | Cases | Status |
|---|---|---|---|
| 0 | Quick fix: replies render no links, and every reload asks first. | 2, 5 | Done, `9739849` |
| 1 | Esc saves, the same as Enter and a click outside. An empty comment still deletes it. | 1 | Open |
| 2 | Comments survive a reload. The server stores them in `<project>/.ccw-cache/`, like the settings. Each is stored as text plus a text-quote selector, not as a DOM Range, and is re-anchored when the reply shows. Library to check first: `@apache-annotator/dom`. | 2, 5 | Open |

## Later, in `docs/Board-pending.md`

- Clear all: a way to delete every comment on purpose. Case 4.
- Reply history: the reader pane keeps every reply, so nothing is replaced. Case 3 goes away with it.
- Rewind: what the reader pane and the comments do on a rewind.

## Testing

- Step 1: a manual test by the user.
- Step 2: reload with comments, in the live tab and after a server restart.
