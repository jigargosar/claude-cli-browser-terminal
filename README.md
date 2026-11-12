# claude-cli-browser-terminal

Claude CLI finally has a reply button.

Read replies like a book, with your terminal beside them in one browser page. Click any sentence to reply, then send everything with one shortcut.

## Install

<!-- The install-ccw skill fetches this README and runs its Install command as written, with no grep and no version of its own. Keep the command exact. -->

pnpm:

```
pnpm add -D https://github.com/jigargosar/claude-cli-browser-terminal/raw/main/published-versions/claude-cli-browser-terminal-0.1.16.tgz
```

<!-- npm 12 needs --allow-remote=all to install a tarball URL. -->
npm:

```
npm install -D --allow-remote=all https://github.com/jigargosar/claude-cli-browser-terminal/raw/main/published-versions/claude-cli-browser-terminal-0.1.16.tgz
```

## Use

pnpm:

```
pnpm exec ccw
```

<!-- --no: npx never downloads a registry package named ccw; it runs only the installed one. -->
npm:

```
npx --no ccw
```

A browser tab opens with the session. Flags pass through to `claude`, for example `pnpm exec ccw --model sonnet`.
