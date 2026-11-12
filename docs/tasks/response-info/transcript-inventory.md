# What a transcript holds about a turn

Made with jq on 2026-11-12, from two transcripts:

- A: this project, claude 2.1.322, 2.9 MB.
- B: quick-notes-v2, claude 2.1.300, 9.8 MB, the largest on the machine.

Two files are a sample, not a spec.

## Seen in both

| Insight | Where |
|---|---|
| The prompt | `user` line with a `text` block, plus `promptId` |
| Claude's text and thinking | `assistant` line, `text` and `thinking` blocks, plus `thinkingDurationMs` |
| Tool call and its input | `assistant` → `tool_use` (`name`, `input`) |
| Tool result | `user` → `tool_result`, plus `toolUseResult` |
| Why a tool was allowed | `permissionDecision` |
| Tokens per API call | `assistant.message.usage`, `model`, `stop_reason` |
| Turn duration | `system` with subtype `turn_duration` → `durationMs`, `messageCount` |
| Session cost and totals | `cost-state` |
| Hooks | `attachment` with type `hook_success` → `hookEvent`, `durationMs` |
| Mode | `permission-mode`, `mode` |
| Raw API requests | `api-request`, `api-request-blob` |
| Titles and summaries | `ai-title`, `system` with subtype `away_summary` |

Every line has `timestamp` and `parentUuid`.

## Field details

- `toolUseResult` varies by tool. Bash: `stdout`, `stderr`, `interrupted`. Edit: `filePath`, `oldString`, `newString`, `structuredPatch`. Read: `file`. Grep: `filenames`, `numFiles`, `content`. WebFetch: `url`, `code`, `durationMs`, `bytes`. AskUserQuestion: `questions`, `answers`.
- `permissionDecision` has `decision`, `source` and a reason. Sources seen: `config` with `reasonType` classifier, mode, rule or other, and `user_temporary` with `grantScope` once or session.
- `usage` has `input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens` and `output_tokens_details.thinking_tokens`.
- `cost-state` has `totalCostUSD`, `totalAPIDuration`, `totalToolDuration`, `totalLinesAdded`, `totalLinesRemoved`, `totalDuration` and `modelUsage` per model.

## Seen in one only

- B only: `file-history-snapshot` and `file-history-delta`, which are file backups per message and show which files a turn changed. The `total_tokens_reminder` attachment. `tool_addition` blocks in `api-request-blob`.
- A only: `tools-used`, `agent-name`, `custom-title`, `session-owner`, `system` with subtype `local_command`, and `toolInputStreamMs`.

Line types differ by version and session. The page should show what it finds, not depend on a fixed set.
