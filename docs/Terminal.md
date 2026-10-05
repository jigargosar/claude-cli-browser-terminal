# Terminal sizing

- `claude` starts at 80x24 when the server starts; a resumed conversation is drawn at 80 columns until a tab sends its size.
- Every tab's resize sets the pty size; the last one wins.
- On resize or reload, Claude Code re-wraps the whole conversation at the new width.
- Claude Code indents wrapped lines itself. A continuation at column 0 means the pty was wider than the browser terminal; Ctrl+L redraws.
- Diffs are drawn narrower than the terminal (own box and line-number gutter).
- The server keeps a headless copy of the screen (1000 lines of scrollback) and sends it to each new tab.
- The page never scrolls; the terminal and the reply pane each scroll on their own.
- Terminal look: dropdown in the reply bar, saved in `localStorage` `cc-web.terminal`. Reading settings: Aa panel, saved in `cc-web.reader`.
