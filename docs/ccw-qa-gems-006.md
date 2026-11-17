# ccw — Q&A gems 006

Source: Q&A on 16 Nov 2026 while drafting the Alpha Kids interview answer (Q1).
Repo: https://github.com/jigargosar/claude-cli-browser-terminal

## 1. The pain (why ccw exists)

1. Claude's answers tend to be long (not always).
2. In a terminal you scroll up to find where a reply starts, and you have to decide where to stop. That's a pain anywhere a reply scrolls.
3. The input box is always at the bottom, so getting back down to type isn't the problem.
4. The bigger friction is replying: to show which part you mean, you copy and paste it into your message, again and again. It gets tiresome.
5. VS Code's UX is no better (the user calls it horrible).
5b. Ctrl+O in Claude CLI turns it into a read-only verbose mode for reading the transcript. More scrolling; on Windows Terminal (wt) with PowerShell the scrolling is intolerable. The user spent a lot of time on it; another motivation for ccw.
6. The user tried many ways to make Claude answer shorter and more to the point. None worked.
7. Nobody has made reading Claude's answers as pleasant as reading an ebook, with annotations.

## 2. The fix (what ccw does) — confirmed existing

Tagline (from the README, confirmed): "Claude CLI finally has a reply button."

1. One browser page: an xterm terminal connected to Claude on the left, replies on the right.
2. Replies read like an ebook (markdown), side by side with the terminal, so there's no scrolling the terminal.
3. Click any sentence to reply to it: options like yes, no, done, reply to that section.
4. Several threads in one response or comment.
5. Send everything with one shortcut.
6. See previous replies at the press of a key: ← → in the reply (or ‹ › by the gear) steps through turns; older pages are read-only; the latest page keeps its comments; "new" marks newer output. (0.1.10)
7. Live view of what Claude does during a turn: status, tools, thinking, housekeeping.
8. The reply pane follows the transcript across /cd, /clear, /resume and worktrees.
9. Click and reply: no need to select any text first.
10. Preconfigured prompt replies: picking a sentence opens a grid of 11 reply icons, one key each: F fix it, E explain, C double check, T too noisy, X remove, S research, R reply, Y yes/ok, N no/wrong, G go ahead, D done. Hover shows the text it sends. (0.1.12)
11. Press F in the reply: a short label appears on every sentence in view; type a label to pick that sentence and open the reply icons; F or Esc ends it. Keyboard only. (0.1.13)
12. Many small quality-of-life UX features, all driven by the user's own friction with the terminal and VS Code. Nobody else offers click-to-reply or "f to mark and jump."
13. Install from a published tarball; run `pnpm exec ccw` or `npx --no ccw`; flags pass through to claude.

## 3. How it's built (the user's role)

1. Claude writes almost all the code, but it's tightly controlled.
2. The user sets the agenda: they write the tasks and rules in docs/fvp-list.md. Claude works with them to gain clarity and approval, which happens in ccw and in fvp-list changes. (Corrected: "Claude is the author, I'm the reviewer" sends the wrong message; don't use it.)
3. The user owns the product, the design and the process.
4. Claude works inside rules in docs/fvp-list.md that only the user changes. They include:
   1. Every task starts with the pain, not the feature.
   2. Finish the current task before the next; when scope grows, write it into the task first.
   3. Make a WIP commit before testing changes.
   4. Release trigger: after a task is ticked, if the changelog's Unreleased section has lines, Claude runs `pnpm release` (stamps the changelog, tags the version, publishes the tarball).
5. Design decisions are the user's:
   1. Carry over only the essential Claude features.
   2. Framework-free JavaScript with direct DOM manipulation, for full control and easy unit testing.

## 4. Facts checked against git history

1. 17 releases: 0.1.1 (13 Oct 2026) through 0.1.17 (13 Nov 2026).
2. Release rule added to docs/fvp-list.md on 4 Nov 2026 (commit 1b140bf).
3. So: since 4 Nov, Claude has cut each release under the user's rule. Who ran 0.1.1 to 0.1.7 isn't recorded.
4. Status: still in progress.

## 5. Interview answer Q1 — current wording (not yet sent)

ccw: https://github.com/jigargosar/claude-cli-browser-terminal. Claude's answers tend to be long, so in a terminal you scroll up to find where a reply starts. The bigger friction is replying: to show which part you mean, you copy and paste it into your message, again and again. VS Code is no better. I tried many ways to make it answer shorter, and none worked. So I built a page where the terminal sits beside the replies, and I read them like an ebook. I can click any sentence to annotate it, run several threads in one comment, see previous replies with one key, and send everything with one shortcut. It also shows live what Claude is doing during a turn: status, tools and thinking.

Claude writes almost all the code. I set the agenda: I write the tasks and rules in docs/fvp-list.md, and only I change them. Before any work, Claude works with me to gain clarity and my approval, in ccw itself and in that list. The rules include: every task starts with the pain, not the feature; finish one task before the next; write new scope into the task first; make a WIP commit before testing. The design choices are mine too: carry over only the essential Claude features, and use framework-free JavaScript with direct DOM manipulation for full control and easy unit testing.

17 releases since Oct 13. Since Nov 4, Claude has cut each release under a rule I wrote: changelog, tag and published package. Still in progress.

## 6. Open

1. More Q&A after the README draft, to clarify.
2. "Captures and organizes session output": meaning unclear. Known: the server loads data on start, instantly, and the view is rendered. "Organized" may refer to display time. Still to clarify.
