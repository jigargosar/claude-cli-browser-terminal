# claude-cli-browser-terminal

Run Claude Code in a browser tab: the terminal on the left, Claude's last reply on the right as readable markdown. Select text in a reply, comment on it, and send all comments to Claude as one message.

The command is `ccw`. It runs the same `claude` command you would run in a terminal, with the flags you give it.

## Use it in another project

This package is not on npm. Every release is a tarball in [published-versions/](https://github.com/jigargosar/claude-cli-browser-terminal/tree/main/published-versions). The command below always installs the latest one.

1. Install it:

   ```
   pnpm add -D https://github.com/jigargosar/claude-cli-browser-terminal/raw/main/published-versions/claude-cli-browser-terminal-0.1.7.tgz
   ```

2. Add a script to the project's `package.json`:

   ```json
   "scripts": { "ccw": "ccw" }
   ```

3. Start a session: `pnpm ccw`. Flags pass through to `claude`, for example `pnpm ccw --model sonnet`.

`ccw` opens the session in the browser. Claude starts when that tab opens. Closing the tab only disconnects: open the URL again to get back. The session ends when claude exits.

## Update

Run the install command again with the newer version. What changed: [CHANGELOG.md](https://github.com/jigargosar/claude-cli-browser-terminal/blob/main/CHANGELOG.md).

## Settings and files

- Page settings are saved in `<project>/.ccw-cache/config.json`. Add `.ccw-cache` to the project's `.gitignore`.
- `CC_WEB_PORT` fixes the port. Without it, `ccw` picks a free one.
- `CC_WEB_NO_OPEN=1` stops `ccw` from opening the browser.

## Develop and release (this repo)

- `pnpm watch` in one terminal, then `pnpm ccw` in another. See `scripts/build-watch/README.md`.
- Each change a user would notice adds one line under "Unreleased" in `CHANGELOG.md`, in the same commit.
- `pnpm release` builds, bumps the patch version, moves "Unreleased" under the new version, packs one tarball into `published-versions/`, commits it all with a tag, and pushes. It stops if "Unreleased" is empty.
