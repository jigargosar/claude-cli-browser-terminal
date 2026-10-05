// import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const dir = `${process.env.CLAUDE_PROJECT_DIR}/.cc-web/replies`;
const file = `${dir}/${input.session_id}.md`;
mkdirSync(dir, { recursive: true });
writeFileSync(file, input.last_assistant_message);

// VS Code workflow: open the reply file after every reply.
// const result = spawnSync(`code "${file}"`, { shell: true, stdio: ["ignore", "ignore", "inherit"] });
// if (result.status !== 0) throw new Error(`code exited with ${result.status}`);
