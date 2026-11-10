# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown.

Scope: developer experience (DX) when working with AI tools. That covers the tooling around the conversation, how Claude's replies read, and how the user's input reaches Claude. Why: the features built so far are small, and many are details you notice only after trying other tools. Each one serves this scope.

# Primary Goal

- [x] Goal 1: when you use this daily instead of the plain terminal.
- [x] Goal 2: select text in a reply, comment on it, repeat, then send all to Claude with context included.
- [x] Goal 3: many comments, sent to Claude as one message.

# Files

- `server.mjs`: starts `claude` in a pty, relays its terminal bytes to the one browser tab, and tails claude's transcript (path from claude's hooks, see `docs/tasks/transcript-following/research.md`) into items that the page shows. The socket protocol is written once, in the header of `web/socket.js`. On Windows the bytes are ConPTY's rendering of its own screen buffer, not claude's output.
- `web/`: the page. `index.html` is markup only; `main.js` wires the modules; one module per part (`terminal.js`, `divider.js`, `socket.js`, `markdown.js`, `reader.js`, `errors.js`, `sentence.js`, `settings.js`) and one file per reply view in `views/`. `settings.js` holds the page settings, which the server saves in `<project>/.ccw-cache/config.json`.
- `docs/fvp-list.md`: the task list.
- `docs/mockups/`: standalone HTML mockups that link the real stylesheets and open without a build. A mockup is approved before the page implements it.
- `docs/mods/`: the plan and research for capturing each dialog claude shows and answering it in the browser.
- `docs/focus-indicator.md`: how the page shows which pane gets the keys.

# Rules

- No task may start before it is on `docs/fvp-list.md`.
- Browser libraries come from `node_modules`, not a CDN.
- The server does not hot reload. Only the page rebuilds on change. Restart the server before testing a change to `server.mjs`.

# Release

No single doc holds the release process yet. The task to write one is on `docs/fvp-list.md`. Until then, the pieces are:

- Release with `pnpm release`. It stops if "Unreleased" in `CHANGELOG.md` is empty.
- Steps: the `release` and `version` scripts in `package.json`, summed up in `release:about`.
- When to add a changelog line: rule 8 of How we work in `docs/fvp-list.md`.
- When to release: rule 9 of How we work. Claude asks for permission with AskUserQuestion first.
- The release writes notes only to `CHANGELOG.md`. No step creates a GitHub Release.
