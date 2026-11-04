# claude-cli-browser-terminal

Claude Code in a browser tab. The terminal is on the left, and Claude's last reply is on the right as readable markdown. Select text in a reply, comment on it, and send all comments to Claude as one message.

## Install

```
pnpm add -D https://github.com/jigargosar/claude-cli-browser-terminal/raw/main/published-versions/claude-cli-browser-terminal-0.1.8.tgz
```

## Use

```
pnpm exec ccw
```

A browser tab opens with the session. Flags pass through to `claude`, for example `pnpm exec ccw --model sonnet`.
