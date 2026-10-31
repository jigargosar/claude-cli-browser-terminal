// Run by the "version" script during pnpm release, after the bump: puts the new version into the README's install
// command, so it is always a copy-paste install of the latest release. Fails loudly if the command is not found.
import { readFileSync } from "node:fs";
import { replaceInFileSync } from "replace-in-file";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));
const [result] = replaceInFileSync({
  files: "README.md",
  from: /claude-cli-browser-terminal-\d+\.\d+\.\d+\.tgz/g,
  to: `claude-cli-browser-terminal-${version}.tgz`,
  countMatches: true,
});
if (result.numMatches === 0) throw new Error("README.md has no install command with a tarball version to update");
