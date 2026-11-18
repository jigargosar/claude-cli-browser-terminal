# First session: empty reading pane

## Bug

- In a project's first session, the transcript's folder doesn't exist when the server starts following it.
- chokidar 5.0.0 never reports a file whose folder was missing when the watch started. Tested by hand 2026-11-18: no `add` with the folder missing, `add` with the folder present.

## Changes, in the working tree, not tested

- `follow-jsonl.mjs`: checks every 200 ms until the file exists, then starts the watch.
- `server.mjs`: `GET /status` returns the followed session ID and path, `waitingFor`, the item count and `waiting`.

## Unit test setup

- Add `vitest` as a dev dependency.
- Add a script, `"test:unit": "vitest run"`. `pnpm test` stays as is, since it starts claude.
- Test files go in `test/`.
- Assumption, not checked: Vitest's defaults work with `vite.config.mjs`. If not, add a separate `vitest.config.mjs`.

## Unit test

- `test/follow-jsonl.test.mjs`: follow a file in a missing folder under a temp dir. Create the folder and the file, then append a line.
- Expect `onStart` once and both values in order.

## Done when

- `pnpm test:unit` passes, and the test fails with the fix reverted.
- `/status` shows the right session after a server restart.
- The task stays open until the unit test exists.
