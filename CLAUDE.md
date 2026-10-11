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

- `server.mjs`: starts `claude`, sends its terminal to the browser, sends the latest reply.
- `web/index.html`: the whole page. Saving it reloads open tabs.
- `.claude/hooks/`: scripts Claude Code runs on its own. One tells the server which session it is, one saves each reply to `.cc-web/replies/`.
- `docs/Board.md`: the work plan and its status. Follow its Flow.

## Rules

- Testing in a browser: use `pnpm test` (port 7682, Haiku model). Port 7681 is the user's live session; typing there types into their real Claude.
- Browser libraries come from `node_modules`, not a CDN.
