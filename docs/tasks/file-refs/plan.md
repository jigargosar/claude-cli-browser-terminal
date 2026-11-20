# File references in replies

Task in `docs/fvp-list.md`: "Pain: impossible to view/review line number content when referenced in your reply."

Primary goal: when a reply mentions a file, I see the exact lines it means, in one click.

- [x] References in reply text and markdown links become links.
- [x] Click peeks, in CodeMirror, wrapped, lines marked.
- [x] Double click opens the running editor.
- [x] Outside the project: red, inert.
- [x] Errors go to the banner. The server never stops.
- [ ] Each state gets its color and tooltip. See States.
- [ ] Test whether a file with uncommitted changes needs its own link color. If so, build it in the modified files task.
- [ ] Is the diff in the peek readable, and does it need a legend for its colors?
- [ ] Binary files open in the system's app.
- [ ] No git, or no commit yet: no diff, tooltip says so.
- [ ] Scroll to the referenced line, else the first change.
- [ ] Unchanged lines collapse, and expand on click.
- [ ] Next and previous change, by button and keyboard shortcut.
- [ ] Head counts the changes, e.g. "2 changes, +12 −3".
- [ ] A click on a line number opens the editor there.
- [ ] If a click on a reference clashes with picking a sentence, a keyboard shortcut opens the peek instead.
- [ ] Nice to have: the peek appears and disappears smoothly.
- [ ] Bring back the diff in the peek, once it is readable. It is commented out in `web/refs.js`.
- [.] Pain: "Where is the reference? Right now you are talking about a file, and I can't even figure out what you are talking about."
    - Solution: ccw starts claude with `--append-system-prompt` and this prompt, drafted with the user on 2026-11-20:
      ```
      In your responses:
      - every file reference is written as `path:line` or `path:start-end`
      - every line number matches the file as it is now
      - every reference to removed text is shown as a verbatim quote of that text
      ```
    - Next: the user confirms, then it goes into `server.mjs:53`, the `claudeArgs` line.

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
