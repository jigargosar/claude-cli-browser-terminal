// Every kind of transcript entry the page knows, one row each. active: false skips the entry on the page. A type not
// in this table shows, so new kinds of entries are noticed. The row's position is its number.
// type: the item's kind, or for a raw line its transcript type (server.mjs, itemsOf).
export const ENTRY_TYPES = [
  { type: "prompt", example: "some items are marked done, are they really done, check.", description: "Your prompt.", active: true },
  { type: "reply", example: "I read the whole list…", description: "Claude's text.", active: true },
  { type: "thinking", example: "I'm working through turn.js now…", description: "Claude's thinking. Empty when the transcript holds no text.", active: true },
  { type: "tool_use", example: "Grep · choreRow|choreSummary…", description: "A tool call, with its input.", active: true },
  { type: "tool_result", example: "Result · Grep · 309 ms", description: "A tool's result, and what allowed the call.", active: true },
  { type: "api", example: "API call · claude-opus-5-5 · tool_use · 681 out", description: "One API response line: model, stop reason, token usage.", active: true },
  { type: "hook", example: "Hook · UserPromptSubmit · 116 ms", description: "A hook run: event, command, output, exit code.", active: true },
  { type: "permission-mode", example: "Mode · auto", description: "The permission mode.", active: true },
  { type: "cost-state", example: "Session cost · $12.40", description: "Session totals: cost, API and tool time, lines changed.", active: true },
  { type: "user", example: "<command-name>/rename</command-name>…", description: "A user line that is not a prompt, e.g. a slash command or its output.", active: true },
  { type: "mode", example: "normal", description: "A session mode, written at each turn end. Not the permission mode (inferred).", active: true },
  { type: "session-owner", example: "account and organization IDs", description: "Who owns the session, written at each turn end.", active: true },
  { type: "atis-latch", example: "atis: \"\"", description: "Unknown. Written at each turn end.", active: true },
  { type: "last-prompt", example: "some items are marked done…", description: "The last prompt's text, written at each turn end.", active: true },
  { type: "ai-title", example: "Done items verification", description: "The session's automatic title, written at each turn end.", active: true },
  { type: "custom-title", example: "collapse-group-event-rows", description: "The session name set with /rename.", active: true },
  { type: "agent-name", example: "collapse-group-event-rows", description: "The agent name set with /rename.", active: true },
  { type: "tools-used", example: "[\"Read\"]", description: "Tools used.", active: true },
  { type: "api-request-shape", example: "shapeHash, system prompt skeleton", description: "The request skeleton, once per session.", active: true },
  { type: "api-request-blob", example: "hash, one message sent to the API", description: "One message sent to the API, stored by hash.", active: true },
  { type: "api-request", example: "model, betas, cache settings, blob hashes", description: "One API request: its parameters and the blobs it sent.", active: true },
  { type: "queue-operation", example: "enqueue · cnp", description: "A message typed while Claude worked, queued.", active: true },
  { type: "system/informational", example: "probe: hooks.json changed…", description: "A notice, e.g. from a plugin.", active: true },
  { type: "system/local_command", example: "/rename", description: "A slash command and its output.", active: true },
  { type: "attachment/output_style", example: "Concise · Be concise: lead with the result…", description: "The output style reminder added to each prompt.", active: true },
  { type: "attachment/queued_command", example: "cnp", description: "A queued message, delivered to Claude.", active: true },
  { type: "attachment/edited_text_file", example: "docs/fvp-list.md", description: "A file changed on disk outside Claude.", active: true },
  { type: "attachment/silent_turn_reminder", example: "The user hasn't heard from you in a while…", description: "A nudge to Claude to report progress.", active: true },
  { type: "attachment/plan_mode_exit", example: "planFilePath, planExists", description: "Plan mode ended.", active: true },
  { type: "attachment/auto_mode", example: "bashFirst, steerOnly, bypass", description: "Auto mode started, with its settings.", active: true },
  { type: "attachment/auto_mode_exit", example: "bashFirst, steerOnly", description: "Auto mode ended.", active: true },
  { type: "attachment/deferred_tools_record", example: "toolInputCopies", description: "Bookkeeping for deferred tools (inferred).", active: true },
  { type: "attachment/environment", example: "workingDirectory, …", description: "The environment, once per session.", active: true },
  { type: "attachment/model", example: "Opus 5.5 · claude-opus-5-5", description: "The model, once per session.", active: true },
  { type: "attachment/output_style_instructions", example: "Concise · You are an interactive CLI tool…", description: "The output style's prompt, once per session.", active: true },
  { type: "attachment/deferred_tools_delta", example: "CronCreate, CronDelete, …", description: "Deferred tools added or removed.", active: true },
  { type: "attachment/agent_listing_delta", example: "claude, Explore, Plan, …", description: "Agent types listed to Claude.", active: true },
  { type: "attachment/mcp_instructions_delta", example: "context7, tickler, …", description: "MCP servers' instructions.", active: true },
  { type: "attachment/skill_listing", example: "16 skills", description: "Skills listed to Claude.", active: true },
  { type: "attachment/instructions", example: "~/.claude/CLAUDE.md, …", description: "The CLAUDE.md files loaded, with their content.", active: true },
  { type: "attachment/session_context", example: "user context", description: "Context about the user, once per session.", active: true },
  { type: "attachment/date", example: "2026-11-17", description: "Today's date, once per session.", active: true },
  { type: "attachment/credential_org", example: "organization ID", description: "The organization, once per session.", active: true },
  { type: "attachment/prompt_snapshot", example: "the system prompt", description: "The full system prompt.", active: true },
];

// The table's key for an item. mode and cost are renamed, so they do not clash with the raw "mode" line.
export const entryType = (item) =>
  item.kind === "raw" ? item.type : ({ mode: "permission-mode", cost: "cost-state" })[item.kind] ?? item.kind;

const inactive = new Set(ENTRY_TYPES.filter((t) => !t.active).map((t) => t.type));
export const isShown = (item) => !inactive.has(entryType(item));
