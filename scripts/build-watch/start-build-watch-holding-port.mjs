// Binds the build-watch port, then runs Vite's watch. The port is the lock: the OS frees it when this process ends.
import net from "node:net";
import { build } from "vite";
import { BUILD_WATCH_PORT } from "./build-watch-port.mjs";

// A second watch fails here with EADDRINUSE, before it builds anything. The raw error goes up; the conclusion goes last.
try {
  await new Promise((resolve, reject) => {
    net.createServer().once("error", reject).listen(BUILD_WATCH_PORT, "127.0.0.1", resolve);
  });
} catch (err) {
  console.error(err);
  if (err.code === "EADDRINUSE") {
    console.error(
      [
        "",
        `The build watch did not start: port ${BUILD_WATCH_PORT} is already in use.`,
        "Most likely another `pnpm watch` is running. Only one may run, since two would rebuild dist/ at once.",
        `If no watch is running, another program holds the port. Find it with: netstat -ano | grep :${BUILD_WATCH_PORT}`,
        "",
      ].join("\n"),
    );
  }
  process.exit(1);
}
await build({ build: { watch: {} } });
