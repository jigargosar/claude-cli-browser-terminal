Pain: Referencing to some point in prev or other response, causes friction, lack of context.

- Solution: the system prompt at `server.mjs:54-57` becomes:
- every file reference is written as `path:line` or `path:start-end`, and a whole file as `path:1`
- every line number matches the file as it is now
- every reference resolves on its own: a file reference, or the referenced content carried forward inline
    - this covers removed content, content of a previous reply, a numbered item, and the subject of every sentence

## Link rule issues, 2026-11-28

1. Claude used `:1` as an escape hatch when specific lines existed, such as for the two sections of the tracking file.
2. Draft rule: drop `:1`. Every mention of part of a file is a link to that part. A bare path only when no part can be referenced.
3. A file mentioned again on the next line was left without a link.
4. Short link text for several references to one file in a row. The file itself is still named and linked.
5. Long paths, such as the global `CLAUDE.md`: name the file once, then give line-number links.
6. Claude mentioned the global `CLAUDE.md` without a link.
7. Link text `CLAUDE.md:18` pointed to the global file but reads like the project file. Not verified: whether the pane opens markdown links with absolute Windows paths.
8. Claude referred to earlier replies without carrying their content forward, such as "which drafts" and "which new". The system prompt already has a rule for this.
9. Under the current rule, Claude mentioned `server.mjs` as a whole file without `:1`.
10. Moved or deleted files can't be linked. No clear way to reference their old paths.
11. Line references in docs drift when lines above them change. Example: `docs/fvp-list.md:98` in `docs/tasks/006-self-sufficient-replies.md:6`.
12. Paths in code comments, such as `server.mjs:27`. The rule covers replies. Open: whether comments use `path:line`.
