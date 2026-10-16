// Binds the build-watch port, then runs Vite's watch. The port is the lock: the OS frees it when this process ends.
import net from "node:net";
import { build } from "vite";
import { BUILD_WATCH_PORT } from "./build-watch-port.mjs";

// A second watch fails here with EADDRINUSE, before it builds anything.
await new Promise((resolve, reject) => {
  net.createServer().once("error", reject).listen(BUILD_WATCH_PORT, "127.0.0.1", resolve);
});
await build({ build: { watch: {} } });
