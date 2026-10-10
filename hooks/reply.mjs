// SessionStart and Stop hook of the claude that server.mjs starts: sends the last reply to the server.
// A new session (start, /clear, resume) has no reply yet, so it sends an empty one. See CLAUDE.md.
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const md = input.hook_event_name === "Stop" ? input.last_assistant_message : "";
const res = await fetch(process.env.CC_WEB_REPLY_URL, {
  method: "POST",
  body: JSON.stringify({ md }),
  signal: AbortSignal.timeout(2000),
});
if (!res.ok) throw new Error(`${process.env.CC_WEB_REPLY_URL} responded ${res.status}`);
