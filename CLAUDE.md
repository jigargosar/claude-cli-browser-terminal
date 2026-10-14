# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown.

## Goal

- Goal 1: done when you use this daily instead of the plain terminal.
- Goal 2 (later): select text in a reply, comment on it, send the comment to Claude. First try kept as tag `single-comment`.
- Goal 3 (later): many comments, sent to Claude as one message.
- Not planned: more than one Claude session per server, login, publishing.
- Principle: it works exactly like `claude` in a terminal; the only addition is a relay server to one browser tab. Browser quirks are fixed in the page (buttons, key remaps), not by new lifecycle rules.

## Decisions

1. Start works like the terminal.
   1. The server runs the same `claude` command, with the flags given to the server.
   2. Claude starts after the first tab sends its columns and rows.
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

## Files

- `server.mjs`: starts `claude` in a pty, relays its terminal bytes to the one browser tab, and tails claude's transcript (path from a SessionStart hook) into items that the page shows. The socket protocol is written once, in the header of `web/socket.js`.
- `web/`: the page. `index.html` is markup only; `main.js` wires the modules; one module per part (`terminal.js`, `divider.js`, `socket.js`, `markdown.js`, `reader.js`, `lab.js`) and one file per reply view in `views/`. A feature touches `main.js` and `views/`; the other modules change only for a bug in them. A rebuild reloads open tabs.
- `docs/Board.md`: the work plan and its status. Follow its Workflow. Closed slices are in `docs/Board-archive-2026-10-13.md`.
- `docs/mockups/`: standalone HTML mockups that link the real stylesheets and open without a build. A mockup is approved before the page implements it.

## Terminal basics

- node-pty gives a byte stream from `claude` and takes keystrokes. On Windows the stream comes from ConPTY, which keeps its own screen buffer and repaints it; the bytes are ConPTY's rendering, not claude's.
- The page runs xterm.js (`web/terminal.js`) with fit, WebGL and Unicode 11. Keystrokes go up as `i`, size as `r`; the first `r` starts claude at that size.
- The server keeps a headless xterm mirror of the screen. On reconnect it serializes the mirror into the new tab, so a refresh shows the screen without a redraw.
- Claude Code (Ink) redraws its live region in place and can only erase inside the viewport, so duplicate lines in scrollback appear in any terminal, Windows Terminal included. Not fixable here; not in scope.
- Keys: a remapped key in xterm must swallow both keydown and keypress, or xterm adds its own CR. Shift+Enter sends LF (Ctrl+J) for a newline. Ctrl+W never reaches the page in Chrome; Ctrl+Backspace deletes a word in claude. Ctrl+V is left to the browser, which pastes; xterm would send `\x16`. Alt+` toggles the panes.
- The transcript is the source for reply text. The terminal stream carries rendered cells, not markdown, so nothing is parsed from it.

## Rules

- Before any edit, read the Workflow in `docs/Board.md` and write the task there first.
- Release only with `pnpm release`, after a manual test. It builds, bumps the patch version (commit and tag), packs into `published-versions/`, and pushes. Never pack by hand.
- Testing in a browser: use `pnpm test` (port 7682, Haiku model). Port 7681 is the user's live session; typing there types into their real Claude.
- Claude tests the page itself with the `browser-test` skill (puppeteer-core over CDP, its own browser profile). Never attach to the user's browser. After the tab closes, a new socket gets the serialized screen, so a script can read the result from the server.
- Any test that starts `claude` uses `--model haiku`. Never another model.
- A `claude` started from inside a Claude Code session writes no transcript. A test started by Claude must remove every `CLAUDE*` variable from the environment it gives the server, or the transcript feed stays empty.
- Browser libraries come from `node_modules`, not a CDN.
