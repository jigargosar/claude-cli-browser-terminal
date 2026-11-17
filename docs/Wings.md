Only the user adds to this file. Claude never writes here.

# If wishes had wings horses would fly

Once upon a time in a far far future some of them were surprisingly alive.

- Select lines in a reply, and Claude answers about those lines in a format that shows the change as a diff. No concurrent editing.
- Concurrent editing of one shared doc. The server holds it in Yjs and is the only writer of the file. The user edits in the page. Claude edits through `doc_read` and `doc_edit` on an `/mcp` endpoint of the server.
- [ ] UX keys: The reader pane is fully keyboard driven: every mouse action in it also has a key.
- Rewind from the reply page itself: go back to an earlier turn from the markdown page, without the terminal.
- Replace the xterm terminal with our own interface, one piece at a time. More and more time is then spent in the markdown page. Each problem met in the terminal decides the next piece to migrate. A lot of migration in total, but no big switch.
