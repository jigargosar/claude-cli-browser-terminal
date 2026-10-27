# Workflow

Every plan's first step is recording it on the board. No task is ever started before it is recorded on the board.

The board holds all known work in one list, so the next task is never a guess.

## Terms

- Slice: a `# Slice <n>` heading and its tasks.
- Task: one item of work, written `- [ ] text`.
- Nested task: a task under another task, one level deep. A task is done when all its nested tasks are.
- Marks: `[ ]` open, not built yet. `[t]` built, test pending. `[x]` done: built and tested.

## Slices

- The last slice is open. New tasks go into it.
- Start a new slice when the context changes, or when the open slice gets too long, since a long slice hides its open tasks. Suggest one once a part of the open slice is done.
- Starting a new slice moves every open task into it and closes the old slice.
- The last closed slice stays on the board, above the open slice, so it shows what was just done and what moved on. Older closed slices move to `docs/Board-archive-<date>.md`, one file per slice.
- Closed slices are frozen. They may predate these rules, so do not read one as an example.

## Tasks

- In the open slice, any task may be written, reworded, moved (also into or out of another task) or deleted at any time.
- Claude formats a line that is not yet a task.
- When a task is done: mark it `[x]`, move it below the last done task, and commit. Done tasks then sit above open ones, so progress reads top to bottom.
- Delete a task that is no longer wanted. `[x]` means done, never dropped.

## Commits

- Commit when a task is done, and whenever uncommitted work grows, even mid-task (message prefix "WIP:"). Small commits are cheap to review and undo.

---

# Slice 18
- [x] The experimental reminder system was lifted up to its own project at `~/projects/subconscious-reminder`.
- [x] Reply button and click-to-select.
  - [x] Big bug: a click picks the sentence and shows Reply, and the focus goes to the terminal.
  - [x] Bug: a click on Reply, and a save in the comment box, send the focus to the terminal. Fix: focus that lands nowhere goes back to the pane that last had it, and the comment box takes the focus after it is placed. Test manually: a sentence click, Reply, save, Escape, Ctrl+Enter.
  - [x] Bug: a click far from any text still picks the nearest sentence. Fix: only a click on the sentence's own text picks it.
  - [x] Bug: the popup sometimes opens away from the mouse. Cause: a line with a link, code or bold has one box per piece, and the popup took the first box on the line. Fix: it takes the box under the mouse.
  - [x] Reply button should sensible and distiunguishble color on sepia background.
  - [x] The popup should appear near to where mouse was clicked not center of selection!
  - [x] Bug: a click outside the comment box loses what was typed. Fix: a click outside saves it, as Enter does.
  - [x] Bug: a click on the sentence whose popup is open moves the popup. Fix: it stays; only another sentence gets a new popup.
  - [x] The popup offers Reply and Done. Done marks the picked text as handled, with no comment box. Done is sent as a comment that says "Done".
  - [x] Bug: a dragged word loses its highlight while the comment box is open. Fix: one source, a range the page holds. A sentence click and `selectionchange` (mouse up, inside `#reply`, not empty) both write it. The browser selection is only an input, and stays until Reply or Done, so Ctrl+C still copies it. The highlight, the popup, Reply and Done read only that range. Test: a console script that performs the actions and logs the results; the user pastes it and copies the console back.

# Slice 19
- [x] Merge the board's Workflow with the `/board-setup` skill's. Write the result to both, and the MUST line to `CLAUDE.md`. Check the open slice against the merged rules. Drafts are in `docs/archive/`.
- [ ] Aside: clean up what the session started in ~ left behind: transcripts, trust entry, permission rules, files.
- [ ] Conversation tracker: track the conversation "exploring-conversation-ideas", from the AHK fix on, in `docs/conversation-exploration/convo-tree.md`.
  - [ ] Simplify the file's structure (it was too complex).
  - [ ] Record the topics: AHK fix, its explanation, the aside on writing that assumes reader knowledge, the tracker, the move to this project.
- [ ] All UX: submit, switching, more options, yes/no style stuff. When the mouse hovers on highlighted content, show a tooltip, small font, ellipsized to the width. Clicking a highlighted line should unhighlight it. Careful: a highlighted line is overloaded, it can mean commented or not yet commented, so use different colors.
  - [ ] Spike: `docs/mockups/keys.html`, a working prototype of the page with a real xterm (local echo). It switches between Today and Fixed focus rules, and logs where each key lands. Fixed: the mouse never moves the keys, the comment box borrows them and gives them back, and stray keys go to the terminal.
  - [ ] its finiky when switching between with clusy command name 
- [ ] Bug: once text is selected, the Reply popup stays on top while the page scrolls. It does not follow the selected text.
- maximizing either pane maybe not?
- [ ] Tests of the reply pane: the user pastes a console script Claude writes, and pastes the log back; Claude never starts `claude` itself.
- [ ] (On hold) Fixture page: a fake reply pane with a canned reply and the real `comments.js`, so Claude can test it headless without `claude` or the user's tab.
- [ ] Evaluate the browser-test skill change: launch headless by default, a visible window only on request. If visible, add `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-background-timer-throttling` and minimize via CDP after each check, so a minimized window still renders.
- [ ] `CLAUDE.md` facts: the "port 7681 is the user's live session" rule (the server picks a free port unless `CC_WEB_PORT` is set), and the Files list (missing `web/settings.js`, `docs/mods/`, `docs/focus-indicator.md`, `docs/mode-keys-research.md`, `docs/Wings.md`, the brain dump). Goals 2 and 3: on hold.
- [ ] `pnpm test` removes every `CLAUDE*` variable itself, so a test Claude starts gets a transcript.
- [ ] ccw reliability: review the project, verify each issue below, then fix the pragmatic ones. Found 2026-10-24.
  - [x] Review: read `server.mjs` fully: hook, `startSession`, `followTranscript`, socket handling.
  - [x] Review: read `web/main.js`, `web/socket.js`, `web/views/last.js`: the replay path.
  - [ ] Review: live test of the missing folder: `pnpm test` in a new temp folder, haiku. Blocked: the first task of this slice says Claude never starts `claude` itself.
  - [x] Review: hook docs (code.claude.com/docs/en/hooks): SessionStart sources are `startup`, `resume`, `clear`, `compact`, `fork`. Every hook gets `transcript_path`. A `CwdChanged` hook exists, documented for Claude running `cd`.
  - [x] Review: build config: `vite.config.mjs` sets no `build.sourcemap`, so Vite's default applies: no source maps. sirv serves `dist/` uncompressed.
  - [x] Review: write each finding into its issue below, labeled verified or inference.
  - [ ] No replies in a folder's first session. The transcript folder `~/.claude/projects/<folder>/` does not exist yet when `followTranscript` starts, and chokidar 5.0.0 never fires `add` for a file in a missing folder. Verified in isolation and by the folder's creation time; the code (`server.mjs:123`) watches only the file. Not yet reproduced live. Fix idea: create the parent folder before the watch.
  - [ ] `/cd` moves the transcript to the new folder's `~/.claude/projects/` folder. No new path reaches the server, so it tails the old, deleted file and replies stop. Seen live. Verified: the server hooks only SessionStart, whose sources do not include a folder change. Unknown: whether `/cd` fires `CwdChanged`. Fix idea: also post the path from `CwdChanged` or UserPromptSubmit; `startSession` already ignores a repeated path.
  - [ ] Resume replays every line as its own item. Each reply starts a View Transition, each skips the one before, and `web/views/last.js:53` rethrows the `AbortError`. Verified in code: `followTranscript` tails `fromBeginning` and sends one `item` per line; `main.js:36` calls `last.show` for each reply. Error spam; the swap still runs. Fix idea: tolerate `AbortError`, maybe send the replay as one batch.
  - [ ] Too few logs to trace a failure. Verified: `.ccw-cache/reload.log` already has tab connected, refused and closed. Missing: the session path received (console only), tail started, lines read, items sent.
  - [ ] A transcript line that fails `JSON.parse` in `itemsOf` throws and crashes the server. Verified in code. Inference: rare, a line could be read half written.
  - [ ] Startup print of install path, cwd and version, so it is clear which copy runs. Deferred.
  - [ ] Source maps: none (see review). Inference: a page error's stack points into the minified bundle. Fix idea: `build.sourcemap: true`.
  - [ ] Compression: none (see review). Inference: not worth it on localhost.
- [ ] Drawing tilde on arrow.
- [ ] z-index for the dialog.
- [ ] Capture all intermediate logs. Show them perhaps as collapsed blocks, as other tools do, so they are easy to browse. Unlike Claude desktop and web.
- [ ] Keep sent answers. Easy once response histories are stored.
- [ ] Board visibility.
- [ ] Change the fonts to Atkinson Hyperlegible (Mono for the terminal and code).
  - [x] Research: tools comparable to this project. Found 2026-10-25: [claude-review](https://github.com/Ch00k/claude-review) (browser, comment on a markdown file, threads back to Claude Code), [markdown-claude-review](https://github.com/MagicMicky/markdown-claude-review) (VS Code, comment threads over MCP), [herdr-web-ui #511](https://github.com/devswha/herdr-web-ui/issues/511) (proposal: comment on a selection of an agent's reply, sent with the next message), [AI DIAL Chat #9093](https://github.com/epam/ai-dial-chat/pull/9093) (Reply on selected text). None found pairs a live Claude Code terminal with its last reply as a reader page.
