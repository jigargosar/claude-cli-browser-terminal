// Stop hook: saves each reply as markdown. See CLAUDE.md.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const dir = `${process.env.CLAUDE_PROJECT_DIR}/.cc-web/replies`;
const replyFile = `${dir}/${input.session_id}.md`;
mkdirSync(dir, { recursive: true });
writeFileSync(replyFile, input.last_assistant_message);

const openSetting = process.env.CC_WEB_OPEN_REPLIES_IN_VSCODE;
if (openSetting !== "true" && openSetting !== "false") {
  throw new Error(`CC_WEB_OPEN_REPLIES_IN_VSCODE must be "true" or "false", got ${openSetting}`);
}
// The server's claude shows replies in the browser instead.
const startedByWebServer = Boolean(process.env.CC_WEB_REPLY_URL);

if (openSetting === "true" && !startedByWebServer) {
  const opener = `${import.meta.dirname}/open-in-vscode.mjs`;
  // Not `detached`: on Windows that gives the child its own console window, and windowsHide can't hide it.
  spawn(process.execPath, [opener, replyFile], { stdio: "ignore", windowsHide: true }).unref();
}
