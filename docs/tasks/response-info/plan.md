# Plan: choose which entry types show in comment pane

Task: the last dotted task in `docs/fvp-list.md`, "the reading pane reshapes the transcript". Research: `transcript-inventory.md`, next to this file. Mockup: `docs/mockups/entry-filter.html`, reviewed 2026-11-18.

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
- A tool call and its result are two rows, each where it arrived.
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
8. Strip the pasted-content tags from the prompt shown on the page.
9. Run the investigations.
10. Review, then a test checklist for the user, then the tick.
