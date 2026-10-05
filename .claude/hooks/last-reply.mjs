import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const dir = `${process.env.CLAUDE_PROJECT_DIR}/.claude/replies`;
const file = `${dir}/${input.session_id}.md`;
const isFirstReply = !existsSync(file);
mkdirSync(dir, { recursive: true });
writeFileSync(file, input.last_assistant_message);

// Open once per session; later replies update the already-open file.
if (isFirstReply) {
  const result = spawnSync(`code "${file}"`, { shell: true, stdio: ["ignore", "ignore", "inherit"] });
  if (result.status !== 0) throw new Error(`code exited with ${result.status}`);
}
