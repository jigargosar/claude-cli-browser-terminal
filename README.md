# claude-cli-browser-terminal

Claude CLI finally has a reply button.

Read replies like a book, with your terminal beside them in one browser page. Click any sentence to reply, then send everything with one shortcut.

## Install

pnpm:

```
pnpm add -D https://github.com/jigargosar/claude-cli-browser-terminal/raw/main/published-versions/claude-cli-browser-terminal-0.1.12.tgz
```

npm:

```
npm install -D --allow-remote=all https://github.com/jigargosar/claude-cli-browser-terminal/raw/main/published-versions/claude-cli-browser-terminal-0.1.12.tgz
```

## Use

pnpm:

```
pnpm exec ccw
```

npm:

```
npx --no ccw
```

A browser tab opens with the session. Flags pass through to `claude`, for example `pnpm exec ccw --model sonnet`.
