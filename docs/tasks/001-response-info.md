# Plan: choose which entry types show in comment pane

Pain: cleanup this tasks, too much Pain. :P Pain: the reading pane reshapes the transcript, so I can't tell what is really going on. Where is the thinking? It says Running when it is waiting.

Task: the last dotted task in `docs/fvp-list.md`, "the reading pane reshapes the transcript". Research: `docs/reference/transcript-inventory.md`. Mockup: `docs/mockups/entry-filter.html`, reviewed 2026-11-18.

## Decided

- Prompts and Claude's text are always visible
- Defaults are hardcoded in `web/entry-types.js`
- An "All" group sits at the bottom of each Events group, just before Claude's text. It holds every entry in arrival order, hidden ones included, and starts closed.
- Each row in "All" has a checkbox for its type, labelled with the type and its count in the turn. One tick changes every row of that type, in every group.
- Hovering a checkbox highlights every row that tick changes.
- Unticked rows are dimmed.
- Ticks are saved. To promote them, the user asks Claude, who moves them into `web/entry-types.js` and clears the saved file.

## Code today

- Every entry has a row in its group, hidden when its type is filtered out, and a copy in "All" (`web/views/turn.js`, `web/entry-filter.js`).
- [ ] A tool call and its result are two rows, each where it arrived.
- Filter choices that differ from the defaults are saved under `entryFilter` in the page settings, `<project>/.ccw-cache/config.json`. They stay there until open item 1 is settled. No server change was needed.

## Open

1. Where ticks are saved: one file for all projects, e.g. `~/.ccw/entry-types.json`, or the per-project page settings.
2. A fold whose content repeats its title. Seen: "Mode · default" opens to "Mode default".
3. How Request and Response blocks show, in the rows and in "All". Tied to the merged tool row above.

## Investigate

1. Events arrive in bursts. A few show, a pause follows, then many land at once.
    - Found 2026-11-18: our reader sees each write within milliseconds. Claude Code batches writes, up to about 0.5 s late. The long pauses are the model generating, with no rows yet. A mod's `session.append` sees rows up to 0.5 s sooner. The real need is states the transcript never records, such as a permission wait, left for a mod-events spike in another session.
2. How the header shows, and how the user's reply is added to the page.
3. Which event ends a turn, so the page starts a new one.
4. How a tool call and its result pair up, and whether the transcript keeps them adjacent. Seen: several edits queue, then permission prompts. Approving one by one spaces them out. "Accept edits" lands them in one burst.
5. How a filter checkbox works once a call and its result are one row. Filtering Read hides every Read call, and filtering Read results hides half of what's left.

Now: weed out noise, while "All" still shows everything. Later: coalesce related items.

## Steps

1. Settle open item 1.
2. Done. Server: read the saved ticks, send them on connect, write them on change.
3. Done. Page: a type shows when its saved tick says so, else its default.
4. Done. `turn.js`: keep every entry. Draw hidden ones only in "All".
5. Done. Build "All" as in the mockup: rows, checkboxes, counts, dimming, hover highlight.
6. Done. A tick redraws every group and saves.
7. Settle open items 2 and 3, each with a mockup if the look changes.
8. Done. Strip the pasted-content tags from the prompt shown on the page.
9. Run the investigations.
10. Review, then a test checklist for the user, then the tick.

## From the task list

- Solution: prompts and Claude's text are always open, never closed or hidden. Between them, one closed group with every event as its own collapsed row, in arrival order. `web/entry-types.js` lists every entry type with an active flag. Inactive types are skipped, and unknown types show, labelled. Research: `docs/reference/transcript-inventory.md`
- multiple housekeeping tasks are grouped together, that is good, but are they shown in proper chrono order? even some other stufff appears then goes. Pain: dont know what is going on, and our algo to collect stuff.
- I figure out what is more important, currently thinking block is important rest can as Also, a quick navigation where we basically get back to reading my ask and your response. Also, a smooth way to compress all everything. Basically, compress all yeah. And the third thing is a lot of noise, but that doesn't get any, it just stays hidden unless I press it. So by noise, I mean the miscellaneous or some section that we have, I think it's called housekeeping. So we also need to figure out stuff about how to handle drinking, housekeeping, and bash and tool calls and stuff like that
- How should we group info in reading pane.
- remvoe noise from my response.
- Open issue: thinking is the most important part, and the solution puts it inside the one closed group. Decide which.
