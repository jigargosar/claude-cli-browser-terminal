import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const dir = `${process.env.CLAUDE_PROJECT_DIR}/.claude/replies`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/${input.session_id}.md`, input.last_assistant_message);
