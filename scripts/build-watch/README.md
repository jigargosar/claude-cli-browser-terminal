# Build watch

The server serves the page from `dist/`, which Vite builds from `web/`. If nothing rebuilds `dist/`, the page silently runs old code. This folder makes that impossible to miss at start.

## Routine

1. `pnpm watch` in its own terminal. Leave it running. Build errors show there.
2. `pnpm ccw` in another terminal, as many times as you like.

`ccw` refuses to start when the watch is not running. It copies `pnpm watch` to the clipboard and says so.

## Design

1. The watch holds a fixed TCP port (`build-watch-port.mjs`) for as long as it runs. The port is the lock.
2. The OS frees the port the moment the watch process ends, even on a crash or kill. Nothing stale is left, so there is no cleanup.
3. `ccw` first runs `refuse-start-without-build-watch.mjs`. If the port is silent, it refuses.
4. A second watch cannot bind the port and crashes with EADDRINUSE before building. So only one watch writes `dist/`.
5. One watch serves every `ccw` in this folder. All servers serve the same `dist/`.

## Files

1. `build-watch-port.mjs`: the port number, in one place.
2. `start-build-watch-holding-port.mjs`: binds the port, then runs Vite's watch through its API. `vite.config.mjs` knows nothing about this.
3. `refuse-start-without-build-watch.mjs`: the check `ccw` runs before the server.
4. `package.json`: the `watch` and `ccw` scripts, each with an `:about` entry.

## The server's part of the dev loop

`server.mjs` has two dev pieces. Both are ungated on purpose. In the published package `dist/` never changes, so they do nothing.

1. `sirv` in dev mode reads files on every request, so a rebuild shows on reload.
2. A watcher on `dist/index.html` reloads open tabs after each rebuild.

## Known limits

1. The check runs only at start. If the watch dies later, nothing warns. The watch terminal shows it.
2. A failed build keeps the watch running and leaves `dist/` old. The error shows only in the watch terminal.
3. The check only sees that something answers on the port. Another program on it fools the check, and makes the watch crash with EADDRINUSE.
4. `pnpm test` and `pnpm release` build `dist/` once on their own. That reloads open tabs, with the same source, so it does no harm.

## When page changes don't show

1. Check that `dist/index.html` is newer than the newest file in `web/`. If it isn't, the build failed or never ran. Read the watch terminal.
2. Check who owns the port: `netstat -ano | grep :7689`, then `tasklist //FI "PID eq <pid>"`. If it isn't node, change the port in `build-watch-port.mjs`.

## Rejected

1. Lock file: survives a crash, so it needs stale detection and cleanup.
2. A watch inside each `ccw`: several watches race on `dist/`.
3. pm2 or an orchestrator process with a WebSocket: robust, but much more code for a rare failure.
4. A greeting handshake on the port: fixes limit 3, but limit 3 is rare and the steps above find it by hand.
5. A Vite plugin holding the port: works, but spreads the design into `vite.config.mjs`.
