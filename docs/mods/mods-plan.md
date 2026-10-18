# Mods plan

Goal: capture each dialog claude shows, show it inline in the browser, answer it from there. Findings and sources: `docs/mods/mods-research.md`.

## Steps

1. Verify at runtime. A test mod writes each `tool.check`, `tool.call` and `session.append` event to a JSON file. Run it with `pnpm test` and Haiku. Mark each finding in the research doc as verified or wrong.
2. Check the open dialogs. Find what plan approval and MCP elicitation fire, in hooks and in mods.
3. Channel. The server passes its port to claude by environment variable. The mod reaches the server with `$.http.fetch`. The server answers by long-poll.
4. Permission prompts. A settings `PermissionRequest` `http` hook posts the request to the server. The page shows it inline. The answer goes back as the hook's response.
5. AskUserQuestion. A mod's `tool.call` hook on `AskUserQuestion` sends the question to the server. The browser's answer comes back as `{ result }`.
6. Send comments with `$.prompt.submit`, not through the pty. This closes the board task "a stray Enter answers a dialog".
7. Live feed. Decide whether `session.append` replaces the transcript tail.

Each step becomes a board task when it starts.
