# Workflow

The board exists so that all known work is written in one list, and the next task is never a guess.

- The last slice is the open slice. All other slices are closed.
- The open slice is one list of tasks: all known work, ticked or not. A task may have a sub-list of its steps, one level, each step ticked on its own.
- Any task may be written at any time. Work on a task only after it is written.
- Claude writes a task, then stops. Claude builds only after the user's "go" on that task.
- Status: `[ ]` open, `[t]` built, test pending, `[x]` done and tested.
- Reorder tasks when it helps.
- When a task is done and tested: tick it, move it below the last ticked task, commit.
- Work done without a task: add it to the open slice, ticked.
- A task that is no longer wanted is deleted.
- Research stops at the first answer good enough to act on. Then build it, or mark the task "(On hold)" with the answer written in it. No research for a feature that isn't next.
- Start a new slice when the context changes, or when the open slice is too long. Move every unticked task into it. The old slice is then closed.
- When a part of a long slice is done and tested, suggest a new slice.
- Keep the last closed slice on the board, above the open slice, so it shows what was done or moved out. Archive only older closed slices.
- Closed slices need not follow the Workflow. Do not read a closed slice as an example of the rules.

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
- [ ] Next session starts here: the Workflow merge below. Decided: merge first, then check the slice against the merged rules. Tests of the reply pane: the user pastes a console script Claude writes, and pastes the log back; Claude never starts `claude` itself.
- all UX, submit, switching, more options yes no style stuff. 
- [ ] (On hold) Fixture page: a fake reply pane with a canned reply and the real `comments.js`, so Claude can test it headless without `claude` or the user's tab.
- [ ] Merge the board's Workflow with the `/board-setup` skill's. Write the result to both. Then check the open slice against the merged rules.
  - [ ] Take the skill's version: Terms, archive on close, first open task is next, bare lines reformatted, `[x]` never means dropped, Commits with "WIP:".
  - [ ] Keep the board's "Any task may be written at any time" and the `---` separator.
  - [ ] Archive name `docs/Board-archive-<date>.md`, one file per closed slice.
  - [ ] Fold the global rule "commit before a multi-cycle task" into Commits.
  - [ ] Add a rule: a task may be reworded in place, and keeps its status, steps, position and go.
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
