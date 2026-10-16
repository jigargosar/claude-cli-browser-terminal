// ccw runs this before the server. A silent build-watch port means the page would be a stale build, so it refuses.
import clipboard from "clipboardy";
import isPortReachable from "is-port-reachable";
import { BUILD_WATCH_PORT } from "./build-watch-port.mjs";

if (!(await isPortReachable(BUILD_WATCH_PORT, { host: "127.0.0.1" }))) {
  await clipboard.write("pnpm watch");
  console.error(
    [
      "",
      "ccw did not start: the build watch is not running.",
      "Without it, dist/ is not rebuilt, so the page would show old code.",
      "",
      "Fix: paste `pnpm watch` (copied to your clipboard) in another terminal, then run ccw again.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
