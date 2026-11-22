# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown.

Scope: developer experience (DX) when working with AI tools. That covers the tooling around the conversation, how Claude's replies read, and how the user's input reaches Claude. Why: the features built so far are small, and many are details you notice only after trying other tools. Each one serves this scope.

# Primary Goal

- [x] Goal 1: when you use this daily instead of the plain terminal.
- [x] Goal 2: select text in a reply, comment on it, repeat, then send all to Claude with context included.
- [x] Goal 3: many comments, sent to Claude as one message.
- [ ] Goal 4: ccw is out there and makes the user hirable. Someone who lands on it sees in one minute what it does and what is unique about it, can install it, and can read how the user thinks and solves problems.
    - Done when: every feature the README lists is released and works on first use.
    - Done when: the showcase plays from the README.
    - Done when: one write-up on the user's blog links to it.

# Focus

- Focus overrides `docs/fvp-list.md` where the two differ.
- Work serves Goal 4, or fixes something that stops daily use. Anything else is play.
- A session is work or play. Claude asks once if the user doesn't say. Play commits start with `play:`.
- Every task has a "Done when" line. Once it is met, the task closes and releases. Leftover sub-items become new undotted tasks.
- A change an end user would notice adds its line under Unreleased in `CHANGELOG.md`, in the same commit.
- Finish the task's pain point first, with the least polish that solves it, plus at most one more pain found while building it. Then release.
- In work, a new idea gets one line at the end of `docs/fvp-list.md`. Claude adds it and says "parked".
- When the user asks for something secondary to the task, or for play during work, Claude says so in one line and guides them back.

# Files

- `server.mjs`: runs claude in a pseudo-terminal and sends what claude prints to the one browser tab.
- `web/`: the page.
- `docs/fvp-list.md`: workflow, tasks, releasing.
- `docs/mockups/`: HTML mockups, approved before the page implements them.
- `docs/spikes/`: spikes, inactive, kept for reuse.
- `docs/mods/`: how to use mods in Claude Code. Research, plan and design notes, with the Claude Code docs downloaded on 2026-10-18 and 2026-11-10 in `raw/`, which is gitignored.
- `CHANGELOG.md`: the only release notes, no GitHub Release.

# Rules

- No task may start before it is on `docs/fvp-list.md`.
- Browser libraries come from `node_modules`, not a CDN.
- The server does not hot reload. Only the page rebuilds on change. Before testing a change to `server.mjs`, ask the user to restart the server.

# UX principles

- No data loss. Where a loss is possible, there is an easy way to revert.
- Nothing shifts under the user's eyes.
- Whatever changes the page's content or layout, or opens or hides something, does it with a transition, unless a transition makes no sense there.
