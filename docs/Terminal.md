# Terminal sizing

- A program formats its output at the terminal width it has at the time of writing. Output already written keeps that width, so the first size a program gets should be the real one.
- Every tab's resize sets the pty size; the last one wins.
- On resize or reload, Claude Code re-wraps the whole conversation at the new width.
- Claude Code indents wrapped lines itself. A continuation at column 0 means the pty was wider than the browser terminal; Ctrl+L redraws.
- Diffs are drawn narrower than the terminal (own box and line-number gutter).
- The server keeps a headless copy of the screen (1000 lines of scrollback) and sends it to each new tab.
- The page never scrolls; the terminal and the reply pane each scroll on their own.
- Terminal look: dropdown in the reply bar, saved in `localStorage` `cc-web.terminal`. Reading settings: Aa panel, saved in `cc-web.reader`.
