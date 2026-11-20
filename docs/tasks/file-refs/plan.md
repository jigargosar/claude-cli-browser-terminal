# File references in replies

Task in `docs/fvp-list.md`: "Pain: impossible to view/review line number content when referenced in your reply."

- [x] References in reply text and markdown links become links.
- [x] Click peeks, in CodeMirror, wrapped, lines marked.
- [x] Double click opens the running editor.
- [x] Outside the project: red, inert.
- [x] Errors go to the banner. The server never stops.
- [ ] ccw gives every claude it starts the reply rules, with `--append-system-prompt`: name the file and line for every reference. For removed or changed lines, show the old text inline or as a diff.
- [ ] If a click on a reference clashes with picking a sentence, keys open the peek instead.
- [ ] Nice to have: the peek appears and disappears smoothly.
- [ ] A click on a line number opens the editor there.
- [ ] Head counts the changes, e.g. "2 changes, +12 −3".
- [ ] Next and previous change, by button and key.
- [ ] Unchanged lines collapse, and expand on click.
- [ ] Scroll to the referenced line, else the first change.
- [ ] No git, or no commit yet: no diff, tooltip says so.
- [ ] Binary files open in the system's app.
- [.] Each state gets its color and tooltip. See States.

## Reference

### States

| State                   | Color                | Click                         |
|:------------------------|:---------------------|:------------------------------|
| Unchanged               | link blue            | peek                          |
| Uncommitted changes     | amber                | peek, with the diff           |
| Untracked               | green                | peek, marked new              |
| Binary, e.g. an image   | link blue            | opens in the system's app     |
| Deleted since the reply | grey, struck through | peek says "deleted"           |
| Outside the project     | red                  | nothing                       |
| Not found               | plain text           | nothing                       |

### Libraries

- Diff: `@codemirror/merge`, with `collapseUnchanged`, `goToNextChunk`, `getChunks`.
- System app: `open`, already a server dependency.

### Manual checks

1. `web/refs.js:95-110`: lines marked, scrolled to.
2. `docs/fvp-list.md`: opens at the top.
3. `server.mjs:300`, with uncommitted changes: amber, diff.
4. `docs/media/ccw-showcase.gif`: opens in the system's app.
5. `~/.claude/CLAUDE.md`: red, click does nothing.
6. A reference near the window's bottom: the peek flips up, no page scrollbar.
7. Esc or a click outside closes it.
8. A sentence with no reference still gets picked for a comment.
