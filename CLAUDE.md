# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown.

Scope: developer experience (DX) when working with AI tools. That covers the tooling around the conversation, how Claude's replies read, and how the user's input reaches Claude. Why: the features built so far are small, and many are details you notice only after trying other tools. Each one serves this scope.

## Primary Goal

- [x] Goal 1: when you use this daily instead of the plain terminal.
- [x] Goal 2: select text in a reply, comment on it, repeat, then send all to Claude with context included.
- [x] Goal 3: many comments, sent to Claude as one message.

# Next Blaze

- Hold your horses

## Decisions

1. Start works like the terminal.
   1. The server runs the same `claude` command, with the flags given to the server.
   2. Claude starts after the first tab sends its columns and rows. Why: output keeps the width it was written at, so the first size must be the real one.
   3. After that, the session works the same as in a terminal.
2. One tab per session.
   1. Each server starts on a random free port.
   2. A refresh continues the session. The right panel may be blank after a refresh.
   3. A new tab on the same URL is refused, with a clear message.
   4. This is the same as not opening one session in two terminals.
   5. Some cases may slip through. New tabs must be refused.
3. The tab is only a view, like a page of a Vite dev server.
   1. Closing the tab is the same as a refresh: it only disconnects.
   2. Claude and the server keep running. Open the URL again to get back.
   3. The session ends only when claude exits (it stops the server), or the server is stopped (it stops claude).
   4. Why: a tab closes by accident easily; a lost tab must not lose the session.

## Concurrent editing facts (for a later feature)
- Fact: a file change the user saves between Claude's turns reaches Claude with the user's next message, as the changed lines with line numbers. Verified 2026-10-15.
- Fact: after that notice, Claude's Edit on the file passes without a re-read. Verified 2026-10-15.

## Files

- `server.mjs`: starts `claude` in a pty, relays its terminal bytes to the one browser tab, and tails claude's transcript (path from a SessionStart hook) into items that the page shows. The socket protocol is written once, in the header of `web/socket.js`. On Windows the bytes are ConPTY's rendering of its own screen buffer, not claude's output.
- `web/`: the page. `index.html` is markup only; `main.js` wires the modules; one module per part (`terminal.js`, `divider.js`, `socket.js`, `markdown.js`, `reader.js`, `errors.js`, `sentence.js`, `settings.js`) and one file per reply view in `views/`. `settings.js` holds the page settings, which the server saves in `<project>/.ccw-cache/config.json`.
- `docs/fvp-list.md`: the task list.
- `docs/fvp-rules.md`: how to work the list.
- `docs/mockups/`: standalone HTML mockups that link the real stylesheets and open without a build. A mockup is approved before the page implements it.
- `docs/mods/`: the plan and research for capturing each dialog claude shows and answering it in the browser.
- `docs/focus-indicator.md`: how the page shows which pane gets the keys.
- `docs/Wings.md`: the user's wishes. Only the user writes here. Claude never does.

## Rules

- Before any edit, read `docs/fvp-rules.md` and follow it.
- No task may start before it is on `docs/fvp-list.md`.
- Dev: `pnpm watch` in one terminal, then `pnpm ccw`; ccw refuses without the watch. Read `scripts/build-watch/README.md` when page changes don't show, or before touching the watch or ccw scripts.
- Release only with `pnpm release`, after a manual test. It builds, bumps the patch version (commit and tag), packs into `published-versions/`, and pushes. Never pack by hand.
- Testing in a browser: use `pnpm test` (port 7682, Haiku model). The user's live session runs on any other port, because the server picks a free one unless `CC_WEB_PORT` is set. Typing there types into their real Claude.
- Claude tests the page itself with the `browser-test` skill (puppeteer-core over CDP, its own browser profile). Never attach to the user's browser. After the tab closes, a new socket gets the serialized screen, so a script can read the result from the server.
- Any test that starts `claude` uses `--model haiku`. Never another model.
- A `claude` started from inside a Claude Code session writes no transcript. A test started by Claude must remove every `CLAUDE*` variable from the environment it gives the server, or the transcript feed stays empty.
- Browser libraries come from `node_modules`, not a CDN.
- Test trip wires:
  - The terminal draws with WebGL. Its text is not in the DOM, so read the screen from the server.
  - A tab left open, such as one from a crashed script, makes the server refuse every new socket (4000). Close the page in a `finally`.
  - The test `claude` gives no ready signal. A script waits a fixed time before typing.
  - Stopping the shell that ran `pnpm test` leaves node and its `claude` running on 7682.
  - A puppeteer drag in the reply pane selects nothing. A drag needs a manual test.
- Cleanup after a test: close every tab the script opened, then kill the process tree on 7682 (`taskkill //T //F //PID <pid>`). Kill only what this session started.

## Known issues

- Rewind leaves the reply pane hanging. Low priority.
- Dragging the divider turns the focus triangle into a tilted square.
- A one-line note Claude writes mid-turn replaces the long reply on view.
- The tab sometimes shows "disconnected" while the server still runs; a refresh brings it back. Rare, seen when idle, not while working. The page has no auto-reconnect. Postponed. Next step when it gets frequent: log the close code and time on both sides, then add auto-reconnect and a server heartbeat.
- Duplicate lines in terminal scrollback. Claude Code (Ink) redraws its live region in place and can only erase inside the viewport, so this happens in any terminal, Windows Terminal included. Not fixable here.

## Concerns

- Adding a feature often breaks another. Tally of issues hit: ++
