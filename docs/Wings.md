Only the user adds to this file. Claude never writes here.

# If wishes had wings horses would fly

Once upon a time in a far far future some of them were surprisingly alive.

- Select lines in a reply, and Claude answers about those lines in a format that shows the change as a diff. No concurrent editing.
- Concurrent editing of one shared doc. The server holds it in Yjs and is the only writer of the file. The user edits in the page. Claude edits through `doc_read` and `doc_edit` on an `/mcp` endpoint of the server.
- [ ] UX keys: The reader pane is fully keyboard driven: every mouse action in it also has a key.
- Rewind from the reply page itself: go back to an earlier turn from the markdown page, without the terminal.
- Replace the xterm terminal with our own interface, one piece at a time. More and more time is then spent in the markdown page. Each problem met in the terminal decides the next piece to migrate. A lot of migration in total, but no big switch.
- One place to read everything: the reply as markdown, earlier replies, the terminal shown or hidden, and a document brought up. Comment on a file's lines the same way as on a reply, so we talk inside the file as we do in the response.

pin as chapter in conversation, our best bet is to have a conversational flow, because all the artifacts are being edited side by side in other chat apps. we need something more powerful, no we dont we just need to ensure that we have what we need. other interfaces are still crappy regardless.

the bookmarks appear in interface on side, and are nicely ticked based on which part of page/conversation we are looking at.

attachments, i just got a pdf chat history, sitting in downloads/drive

- External diff: review Claude's edits in a real diff tool.
    - Tools:
        - WinMerge compares any two files or folders: `winmergeu <left> <right>`.
        - `gitk` shows commits and their diffs, for example `gitk HEAD~1..HEAD`.
        - `git gui` shows uncommitted changes, and stages a hunk or a line.
        - diffai is a terminal diff viewer that saves line comments for Claude. Windows support is not confirmed. https://www.joshfinnie.com/blog/introducing-diffai/
    - Options, separate, can be combined:
        1. Workflow line: after its edits, Claude launches `git gui`.
        2. `Stop` hook: `git gui` opens on its own when a turn ends with uncommitted changes.
        3. ccw page: the modified files show as links, and a click opens the diff. Related task: "three or four files get modified" in `docs/fvp-list.md`.
    - Known:
        - Claude Code's own `diffTool` setting opens only VS Code or JetBrains.
        - `git difftool --dir-diff` fails here with symlinks, because `core.symlinks` is true in the system gitconfig. `--no-symlinks` avoids it.
