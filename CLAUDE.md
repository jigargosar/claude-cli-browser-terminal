# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown.

## Goal

Done when you can select text in a reply, comment on it, send all comments to Claude at once, and use this daily instead of the plain terminal.
Not planned: more than one Claude session per server, login, publishing.
Principle: it works exactly like `claude` in a terminal; the only addition is a relay server to one browser tab. Browser quirks are fixed in the page (buttons, key remaps), not by new lifecycle rules.

## Files

- `server.mjs`: starts `claude`, sends its terminal to the browser, sends the latest reply.
- `web/index.html`: the whole page. Saving it reloads open tabs.
- `.claude/hooks/`: scripts Claude Code runs on its own. One tells the server which session it is, one saves each reply to `.cc-web/replies/`.
- `docs/Board.md`: the work plan and its status. Follow its Flow.

## Rules

- Testing in a browser: use `pnpm test` (port 7682, Haiku model). Port 7681 is the user's live session; typing there types into their real Claude.
- Browser libraries come from `node_modules`, not a CDN.
