// ccw runs this before the server. A silent build-watch port means the page would be a stale build, so it refuses.
import clipboard from "clipboardy";
import isPortReachable from "is-port-reachable";
import { BUILD_WATCH_PORT } from "./build-watch-port.mjs";

if (!(await isPortReachable(BUILD_WATCH_PORT, { host: "127.0.0.1" }))) {
  await clipboard.write("pnpm watch");
  console.error("Build watch is not running. `pnpm watch` is copied to your clipboard. Paste it in another terminal, then run ccw again.");
  process.exit(1);
}
