# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown.

Scope: developer experience (DX) when working with AI tools. That covers the tooling around the conversation, how Claude's replies read, and how the user's input reaches Claude. Why: the features built so far are small, and many are details you notice only after trying other tools. Each one serves this scope.

# Primary Goal

- [x] Goal 1: when you use this daily instead of the plain terminal.
- [x] Goal 2: select text in a reply, comment on it, repeat, then send all to Claude with context included.
- [x] Goal 3: many comments, sent to Claude as one message.

# Files

- `server.mjs`: runs claude in a pseudo-terminal and sends what claude prints to the one browser tab.
- `web/`: the page.
- `docs/fvp-list.md`: workflow, tasks, releasing.
- `docs/mockups/`: HTML mockups, approved before the page implements them.
- `docs/spikes/`: spikes, inactive, kept for reuse.
- `CHANGELOG.md`: the only release notes, no GitHub Release.

# Rules

- No task may start before it is on `docs/fvp-list.md`.
- Browser libraries come from `node_modules`, not a CDN.
- The server does not hot reload. Only the page rebuilds on change. Restart the server before testing a change to `server.mjs`.