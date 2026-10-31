# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown. Select text in a reply, comment on it, and send all comments to Claude as one message.

The command is `ccw`. It runs the same `claude` command you would run in a terminal, with the flags you give it.

## Use it in another project

This package is not on npm. Each project keeps its own copy of the tarball, so any clone installs it without this repo.

1. Copy the newest `claude-cli-browser-terminal-<version>.tgz` from this repo's `published-versions/` into the project's `vendor/` folder.
2. Install it: `pnpm add -D ./vendor/claude-cli-browser-terminal-<version>.tgz`
3. Add a script to the project's `package.json`: `"ccw": "ccw"`
4. Commit the tarball, `package.json` and the lockfile.
5. Start a session: `pnpm ccw`. Flags pass through to `claude`, for example `pnpm ccw --model sonnet`.

`ccw` opens the session in the browser. Claude starts when that tab opens. Closing the tab only disconnects: open the URL again to get back. The session ends when claude exits.

Optional: add one line to the project's `CLAUDE.md`, so its Claude knows what the tarball is:

```
- `vendor/claude-cli-browser-terminal-*.tgz` is `ccw`, the browser view for Claude Code (`pnpm ccw`). To update it, follow `node_modules/claude-cli-browser-terminal/README.md`, section "Update".
```

## Update

1. Copy the newest tarball from this repo's `published-versions/` into `vendor/`.
2. Install it: `pnpm add -D ./vendor/claude-cli-browser-terminal-<version>.tgz`
3. Delete the old tarball from `vendor/`.
4. What changed: `node_modules/claude-cli-browser-terminal/CHANGELOG.md`.

## Settings and files

- Page settings are saved in `<project>/.ccw-cache/config.json`. Add `.ccw-cache` to the project's `.gitignore`.
- `CC_WEB_PORT` fixes the port. Without it, `ccw` picks a free one.
- `CC_WEB_NO_OPEN=1` stops `ccw` from opening the browser.

## Develop and release (this repo)

- `pnpm watch` in one terminal, then `pnpm ccw` in another. See `scripts/build-watch/README.md`.
- Each change a user would notice adds one line under "Unreleased" in `CHANGELOG.md`, in the same commit.
- `pnpm release` builds, bumps the patch version, moves "Unreleased" under the new version, commits and tags, packs into `published-versions/`, and pushes. It stops if "Unreleased" is empty.
