# File references in replies

Task in `docs/fvp-list.md`: "Pain: impossible to view/review line number content when referenced in your reply."

## Done

- The page finds references in the reply's text: `path`, `path:83`, `path:83-90`, `path#L83-L90`, and markdown links.
- A click opens the peek, a read-only CodeMirror view of the file, wrapped, with the referenced lines marked.
- A double click opens the file in the running editor, with `launch-editor`.
- Paths outside the project folder show red, and neither peek nor open.
- A failed request shows in the page's error banner, and never stops the server.

## Every reference has a state

Each state has its own color and a tooltip that names it.

| State                               | Color                | Peek                                 |
|:------------------------------------|:---------------------|:-------------------------------------|
| In the project, unchanged           | link blue            | the file                             |
| In the project, uncommitted changes | amber                | the file, with the diff              |
| In the project, untracked           | green                | the file, marked as new              |
| Binary, e.g. an image               | link blue            | "binary file", its size, no contents |
| Deleted since the reply             | grey, struck through | "deleted"                            |
| Outside the project                 | red                  | none                                 |
| Not found                           | plain text           | none                                 |

- The server returns the state with each resolved path, from one `git status` per request.
- No git, or no commit yet: the peek works without a diff, and the tooltip says so.

## Diff in the peek

- Unchanged lines collapse, with 3 lines of margin, and expand on click (`collapseUnchanged` in `@codemirror/merge`).
- The peek scrolls to the referenced line, else to the first change.
- Next and previous change: buttons in the head and keys (`goToNextChunk`, `goToPreviousChunk`).
- The head shows the counts, e.g. "2 changes, +12 −3".

## Later

- A click on a line number opens the editor at that line.

## Manual checks

Each check names the reference to click, as it appears in Claude's reply.

1. A range: `web/refs.js:95-110`. The peek marks lines 95 to 110 and scrolls to them.
2. No line: `docs/fvp-list.md`. The peek opens at the top.
3. Uncommitted: `server.mjs:300`, while `server.mjs` has uncommitted changes. Amber link, and the peek shows the diff.
4. Binary: `docs/media/ccw-showcase.gif`. The peek says "binary file".
5. Outside: `~/.claude/CLAUDE.md`. Red, and a click does nothing.
6. Near the window's bottom edge: any reference in the last lines of a long reply. The peek flips above, stays inside the window, and adds no page scrollbar.
7. Esc, or a click outside the peek, closes it.
8. A plain sentence with no reference still gets picked for a comment.
