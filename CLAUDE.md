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
- Secondary aim, for your information: quick notes (QN), the `quick-notes-v2` project.
    - ccw was made to make it easy to author other apps, and it is used to develop itself too. QN is such an app, and the work moves there sooner or later.
    - QN is where the user's general knowledge goes: UX principles, references, leisure activities, notes on other products and ideas, extension development, RAG, docs on how AI tools work, and pages from its web clipper extension.
    - Today no system records that knowledge. QN is needed, and it has a handful of major issues.

# Files

- `server.mjs`: runs claude in a pseudo-terminal and sends what claude prints to the one browser tab.
- `web/`: the page.
- `docs/WORKFLOW.md`: workflow, releasing.
- `docs/fvp-list.md`: tasks.
- `docs/mockups/`: HTML mockups, approved before the page implements them.
- `docs/spikes/`: spikes, inactive, kept for reuse.
- `docs/mods/`: how to use mods in Claude Code. Research, plan and design notes.
- `docs/vendor-library-documentation/`: docs written by others, downloaded for reference.
- `CHANGELOG.md`: the only release notes, no GitHub Release.

# Rules

- Never ever start implementing before its task in `docs/fvp-list.md` has a `Pain:` line.
- Finish the task's pain point first, plus at most one more pain found while building it. When the user asks for something secondary, say so and guide them back.
- Browser libraries come from `node_modules`, not a CDN.
- The server does not hot reload. Only the page rebuilds on change. Before testing a change to `server.mjs`, ask the user to restart the server.

# UX principles

- No data loss. Where a loss is possible, there is an easy way to revert.
- Nothing shifts under the user's eyes.
- Whatever changes the page's content or layout, or opens or hides something, does it with a transition, unless a transition makes no sense there.
