# Mods gap analysis

Goal: capture each dialog claude shows, show it inline in the browser, answer it from there.

Sources: docs downloaded 2026-10-18 into `docs/mods/raw/claude-code-docs-2026-10-18/` (gitignored). `toc-all.txt` and `toc-mods.txt` index every heading with its line. Nothing below is verified at runtime yet.

## Baseline today

| Source | What it gives | Limit |
| :- | :- | :- |
| Transcript JSONL | Every message, tool call and result | After the fact. No open dialogs. |
| Settings hooks | One process per event, stdin JSON, can return a decision | One blocking call per event. No live channel. |

## Dialogs

| Dialog | Settings hooks | Mods |
| :- | :- | :- |
| Permission prompt | `PermissionRequest`: full tool input, answers allow or deny. An `http` hook waits up to 600 s by default. (`hooks.md:2073`) | `tool.check` returns allow, ask or deny. Not a render site, so the terminal drawing can't change. (`mods__interface.md:294`) |
| AskUserQuestion | `PreToolUse` sees the question. It can't supply the answer. | `tool.call` on `AskUserQuestion` can return `{ result }`, so the browser answers it. The dialog is also a render site. |
| MCP elicitation | `Elicitation` hook (`hooks.md:3588`) | Not checked |
| Plan approval | Not checked. Likely `PermissionRequest` on `ExitPlanMode`. | Not checked |

## What only mods give

1. Answering AskUserQuestion in code (`tool.call` returns `{ result }`).
2. `$.prompt.submit({ text, asUser: true })` sends a prompt without typing into the pty. That removes the "stray Enter approves a dialog" risk for comments.
3. `session.append` fires for each row before it's stored. It's a live feed, not a file tail.
4. A live state: a mod knows when a dialog is open, so the page can block sends while one is.

## Channel to our server

1. Mod to server: `$.http.fetch`, 30 s per call, 4 MiB body.
2. Server to mod: long-poll with repeated fetches. Time inside a mods API call doesn't count against the hook's 10 s limit (`mods__reference.md:353`, `mods__events.md:180`).
3. Port: pass it by environment variable, read with `$.env.get`.
4. Load: `--plugin-dir` on the `claude` command the server starts.

## Verdict (to verify)

1. Permission prompts: a settings `http` hook is enough. It needs no mod.
2. AskUserQuestion: needs a mod.
3. Sending comments safely: needs a mod (`$.prompt.submit`).
4. Next: a test mod that dumps `tool.check`, `tool.call` and `session.append` events to files, run with `pnpm test` and Haiku.
