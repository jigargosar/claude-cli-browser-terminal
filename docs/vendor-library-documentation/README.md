# Vendor library documentation

Partial downloads of the Claude Code docs, picked by topic.
Each `llms.txt` lists all of the about 264 pages.

| Folder                         | Pages | Topics                                                                                          |
|:-------------------------------|:------|:------------------------------------------------------------------------------------------------|
| `claude-code-docs-2026-10-18/` | 81    | Hooks, plugins and mods, Agent SDK, settings, permissions, modes. Plus download and grep files. |
| `claude-code-docs-2026-11-10/` | 17    | Agents, sessions, worktrees, checkpointing. Plus newer copies of 8 hooks and mods pages.        |

## Two kinds of hooks

| Kind          | Pages                                                                              | What                                      | Events                                      | ccw                                           |
|:--------------|:-----------------------------------------------------------------------------------|:------------------------------------------|:--------------------------------------------|:----------------------------------------------|
| Settings hook | `hooks.md`, `hooks-guide.md`                                                       | A command or http call in a settings file | `PreToolUse`, `SessionStart`                | `server.mjs`, with `--settings`               |
| Mod hook      | `plugins__mods__events.md`, `plugins__mods__api.md`, `plugins__mods__reference.md` | A handler in a plugin's code              | `tool.check`, `tool.call`, `session.append` | Only the spike in `docs/spikes/mods-vs-tail/` |
