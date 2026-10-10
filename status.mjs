// Lists running servers from their session records; deletes records whose server is gone. See CLAUDE.md.
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";

const SESSIONS = `${import.meta.dirname}/.cc-web/sessions`;

// The session ID the server on this port reports, or null when no server of ours answers there.
const sessionOnPort = async (port) => {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/status`, { signal: AbortSignal.timeout(1000) });
    const isOurs = res.ok && res.headers.get("content-type") === "application/json";
    return isOurs ? (await res.json()).session_id : null;
  } catch (err) {
    // Nothing listening, or no answer in time: that server is gone.
    if (err.cause?.code === "ECONNREFUSED" || err.name === "TimeoutError") return null;
    throw err;
  }
};

const files = existsSync(SESSIONS) ? readdirSync(SESSIONS) : [];
let running = 0;
for (const file of files) {
  const id = file.replace(/\.json$/, "");
  const { port, cwd } = JSON.parse(readFileSync(`${SESSIONS}/${file}`, "utf8"));
  if ((await sessionOnPort(port)) === id) {
    running++;
    console.log(`http://localhost:${port}  ${id}  ${cwd}`);
  } else {
    rmSync(`${SESSIONS}/${file}`);
    console.log(`removed stale ${id} (port ${port})`);
  }
}
if (running === 0) console.log("no running servers");
