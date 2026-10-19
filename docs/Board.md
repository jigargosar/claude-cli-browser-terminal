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
- Closed slices need not follow the Workflow. Do not read a closed slice as an example of the rules.

--- 

# Slice 18
- [x] The experimental reminder system was lifted up to its own project at `~/projects/subconscious-reminder`.
- [ ] Reply button and click-to-select.
  - [x] Big bug: a click picks the sentence and shows Reply, and the focus goes to the terminal.
  - [x] Bug: a click on Reply, and a save in the comment box, send the focus to the terminal. Fix: focus that lands nowhere goes back to the pane that last had it, and the comment box takes the focus after it is placed. Test manually: a sentence click, Reply, save, Escape, Ctrl+Enter.
  - [ ] Colors flipped, so it stands out from the sepia background. Scroll issues too (details from the user).
  - [ ] The popup offers Reply and Done. Done marks the picked text as handled, with no comment box.
- [ ] Comments are never lost, and can be removed.
  - [x] For now: comments clear when a new reply arrives.
  - [ ] Saved to `localStorage` on each keystroke, the open comment box's draft included, with the id of the reply they belong to. They come back only while that reply is on view. A refresh, a closed tab or a rebuild reload restores them.
  - [ ] A Remove button on each comment, and Remove all next to Submit all. Not sure it's needed; try it and see.
- [ ] Earlier replies, so a short follow-up never hides a long reply.
  - [ ] Design: a working page. The reply you work on stays on view. Comments attach to it, and Claude's answer to them shows on top of it instead of replacing it.
  - [ ] Step back: a bar at the top of the reply pane, "‹", "3 of 7", "›". "‹" shows the previous reply, "›" the next.
  - [ ] Keys to step through them.
  - [ ] What a new reply does while an earlier one is on view.
  - [ ] Comments on an earlier reply.
  - [ ] Bug: a one-line note Claude writes mid-turn, such as "Fixing all three now", replaces the long reply on view. The pane shows only that line.
  - [ ] Carry by default: each reply repeats what is still open or unanswered from the reply before, so the pane never loses it. Until the page does this, Claude adds what the user asks for before replying, then lists it under "Added". Open questions live in their board item. While the user is adding items, Claude only adds; no task work.
- [ ] Keys.
  - [ ] Hint keys, as in Vimium: while Alt is held down, every button and link shows a one-letter label, and pressing that letter presses it. One fixed letter goes to the terminal input. No guessing what Tab or Ctrl+Enter does where. Likely the next priority.
  - [ ] One key shows the thinking of the reply on view, in place, and the same key hides it. Nothing folded, no click.
  - [ ] A send or a stray keystroke can answer a dialog claude shows (a comment's Enter approved a git permission prompt). Guard against it.
  - [ ] Free Tab and Shift+Tab for focus. Answer, no mod needed: the page owns Tab and Shift+Tab, and two spare keys send Claude the Tab and Shift+Tab bytes. Mode keys (such as Alt+1 to Alt+5) send counted Shift+Tabs, starting from `permissionMode`, which transcript rows carry (as of the last prompt).
- [ ] The error banner becomes an overlay that shows the error's full context, and its text can be selected and copied.
- [ ] Bug: dragging the divider turns the focus triangle into a tilted square (also in CLAUDE.md Known issues).
- [ ] File paths in a reply are links. A click opens the file in a dialog in the page, editable with CodeMirror and vim bindings (the board, for one).
- [ ] The app shows its version.
- [ ] (Waiting for regression) The page reloaded twice for one rebuild, seen once at 17:42 on 2026-10-17. A reload log (`.ccw-cache/reload.log`) now records rebuilds, tab connects and closes, and the page's reload decisions; it works after the next ccw start. Read it when it happens again.
- [ ] A rebuild between two dependent edits can leave the page on a broken in-between build. If its reload handler is what broke, no later rebuild can recover it ("a is not a function" on every reload message). Only a manual refresh gets out.
- [ ] Merge the board's Workflow with the `/board-setup` skill's. Write the result to both.
  - [ ] Take the skill's version: Terms, archive on close, first open task is next, bare lines reformatted, `[x]` never means dropped, Commits with "WIP:".
  - [ ] Keep the board's "Any task may be written at any time" and the `---` separator.
  - [ ] Archive name `docs/Board-archive-<date>.md`, one file per closed slice.
  - [ ] Fold the global rule "commit before a multi-cycle task" into Commits.
- [ ] browser-test skill: launch headless by default, a visible window only on request. If visible, add `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-background-timer-throttling` and minimize via CDP after each check, so a minimized window still renders.
- [ ] Merge the board's Workflow with the `board-setup` skill's first (task above), then check the open slice against the merged rules. Add a rule: a task may be reworded in place, and keeps its status, steps, position and go.
- [ ] `CLAUDE.md` facts: the "port 7681 is the user's live session" rule (the server picks a free port unless `CC_WEB_PORT` is set), and the Files list (missing `web/settings.js`, `docs/mods/`, `docs/focus-indicator.md`, `docs/mode-keys-research.md`, `docs/Wings.md`, the brain dump). Goals 2 and 3: on hold.
- [ ] `pnpm test` removes every `CLAUDE*` variable itself, so a test Claude starts gets a transcript.
- [ ] (On hold) Mods gap analysis: can transcript, hooks or mods capture each dialog claude shows and answer it from the browser? Research in `docs/mods/mods-research.md`, raw docs in `docs/mods/raw/` (gitignored).
  - [x] Download the mod-related doc pages as `.md`, build a TOC.
  - [x] Baseline: what transcript and hooks give today.
  - [x] Dialog list, each checked for capture and answer by hooks and by mods. Plan approval and MCP elicitation still unchecked.
  - [x] Mod to server channel.
  - [x] Verdict per dialog, from docs only.
  - [x] Plan in `docs/mods/mods-plan.md`.
  - [ ] Verify at runtime: a test mod dumps `tool.check`, `tool.call` and `session.append` events to files.
