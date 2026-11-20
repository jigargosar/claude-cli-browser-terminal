# Release

## Changelog

- Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
- Sections: Added, Changed, Fixed, Removed.
- Before a release, open the Unreleased link at the bottom of `CHANGELOG.md`.
- It lists every commit since the last tag.

## What `pnpm release` does

1. Builds the page.
2. `kacl prerelease` fails if `CHANGELOG.md` doesn't parse or Unreleased is empty.
3. Bumps the patch version.
4. `kacl release` stamps Unreleased with the version and date, and updates the compare links.
5. `readme-version.mjs` puts the version into the README install command.
6. Packs a tarball into `published-versions/`, commits, tags, and pushes.
