Pain: Referencing to some point in prev or other response, causes friction, lack of context.

- Solution: the system prompt at `server.mjs:54-57` becomes:
- every file reference is written as `path:line` or `path:start-end`, and a whole file as `path:1`
- every line number matches the file as it is now
- every reference resolves on its own: a file reference, or the referenced content carried forward inline
    - this covers removed content, content of a previous reply, a numbered item, and the subject of every sentence
