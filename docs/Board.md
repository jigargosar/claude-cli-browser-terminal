# Workflow

The board exists so that all known work is written in one list, and the next task is never a guess.

- The last slice is the open slice. All other slices are closed.
- The open slice is one list of tasks: all known work, ticked or not. A task may have a sub-list of its steps, one level, each step ticked on its own.
- Any task may be written at any time. Work on a task only after it is written.
- Reorder tasks when it helps.
- When a task is done and tested: tick it, move it below the last ticked task, commit.
- Work done without a task: add it to the open slice, ticked.
- A task that is no longer wanted is deleted.
- Start a new slice when the context changes, or when the open slice is too long. Move every unticked task into it. The old slice is then closed.
- When a part of a long slice is done and tested, suggest a new slice.
- Closed slices need not follow the Workflow. Do not read a closed slice as an example of the rules.

--- 

# Slice 16
- [x] Slices 14 and 15 moved to `docs/Board-archive-2026-10-13.md`
- [x] Bring in all known tasks.
- [x] Process them.
- [x] Bring quick fix issues on top, and if they take too much time, then deprioritize them.
- [x] ccw refuses to start unless the build watch runs, and copies `pnpm watch` to the clipboard. The watch holds port 7689 as a lock. All in `scripts/build-watch/`, explained in its README.
- [x] Scroll to top when a new reply arrives. Without creating a jerking effect, if any. (Make it easy on the eyes, i.e. simple easing or some such thing.) while at it, also fix the gap between scrollbar and viewport edge.
- [x] A/B test marked against markdown-it: marked stays. markdown-it's gains (link plugin, escaped raw HTML) are small fixes on marked. Patch updates for marked, dompurify, puppeteer-core.
- [x] Web links in a reply open in a new tab, so a click never leaves the session (DOMPurify hook in `web/markdown.js`).
- [x] !! Markdown or any code fence needs word wrap and copy. A Wrap and Copy bar on each code block (`web/views/last.js`).
- [x] Bugs live in CLAUDE.md under Known issues, not on the board. `Promise<T>` and Rewind moved there.
- [x] CLAUDE.md: Terminal basics dissolved. Keys, the headless mirror and the protocol were duplicates of code comments, so they are gone. ConPTY and transcript-only went under Files, Ink duplicates under Known issues. File-change facts stay, titled as facts for concurrent editing.
- [ ] !!! Why our first line interpretation doesn't work compared to Claude Desktop.
- [ ] Need ability to reply with multiple sections of previous reply, i.e. select text, type something, repeat multiple times, then send at once. (This is a solution, XY. Discuss the problem, because the answer can be much simpler.)
- [ ] Thinking block needed (add to the previous response block).
- [ ] (recurring) QN is the quintessential client where we work using this project. So we need to bring in all the tasks, regularly.
