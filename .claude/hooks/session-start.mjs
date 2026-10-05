// SessionStart hook: reports the session ID to server.mjs. See CLAUDE.md.
import { readFileSync } from "node:fs";

// Set only on the claude spawned by server.mjs.
const sessionReportUrl = process.env.CC_WEB_SESSION_URL;

if (sessionReportUrl) {
  const { session_id } = JSON.parse(readFileSync(0, "utf8"));
  const res = await fetch(sessionReportUrl, {
    method: "POST",
    body: JSON.stringify({ session_id }),
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error(`${sessionReportUrl} responded ${res.status}`);
}
