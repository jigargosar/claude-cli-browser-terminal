# Test page

- Pain: the user ran every check of the page by hand.
- The test page is the built page in a headless browser, fed by a transcript file. No claude starts.
- Claude uses it to check a page change by itself.

## Run

- `pnpm check:page` runs the smoke check, `scripts/test-page/smoke.mjs`.
- It needs `dist/`, which `pnpm watch` keeps built.
- A screenshot path as the first argument saves the page with the file view open.

## Write a check

- Copy `scripts/test-page/smoke.mjs`.
- Keep its `try` and `finally`, so a failed check leaves no browser or server running.
- `openTestPage()` gives `page`, a puppeteer page, plus `addLines` and `close`.
- `addLines` appends transcript lines, as if claude wrote them.
- `close` throws when the page threw an error during the check.
- A one-off check lives in the scratchpad, not in the repository.

## How it works

- `CC_WEB_TRANSCRIPT=<file>` makes `server.mjs` follow that file and start no claude.
- The server runs in `test/page/project/`. File references resolve there.
- Page settings are saved there too, apart from the user's session.
- The conversation is `test/page/transcript.jsonl`. Each line has the shape of a Claude Code transcript line.
- The browser is the installed Chrome, through `puppeteer-core`.

## Known

- The first click after the page loads lands on the page itself, not on what is under it.
- `openTestPage` takes that click. The cause is not known.
