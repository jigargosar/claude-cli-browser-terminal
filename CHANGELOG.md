# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.12] - 2026-11-08
### Changed
- Picking a sentence opens a grid of 11 reply icons right above it, at the mouse, instead of Reply, Yes, No and Done. One key sends each: F fix it, E explain, C double check, T too noisy, X remove, S research, R reply, Y yes/ok, N no/wrong, G go ahead, D done. Hover an icon for the text it sends.

## [0.1.11] - 2026-11-08
### Added
- npm install and run commands in the README, next to the pnpm ones.

## [0.1.10] - 2026-11-07
### Added
- Step back and forward through the turns with ‹ › beside the gear, or ← → in the reply. An older page stays put while Claude works, and "new" marks newer output. Older pages are read-only, and the latest page keeps its comments while you look back.

### Changed
- The reply pane shows the whole last turn as one page. Thinking, tool calls with their results, and hooks are collapsed blocks. The answer follows below a rule. The page grows as Claude works without redrawing, so comments and opened blocks stay until a new turn.

## [0.1.9] - 2026-11-07
### Fixed
- The focus arrow no longer covers the comment popup or the comment box.

## [0.1.8] - 2026-11-04
### Added
- While the comment popup shows, the keys R, Y, N and D press Reply, Yes, No and Done.
- Esc closes the comment popup.
- Each popup button underlines its key letter.

### Changed
- The comment popup shows Reply, Yes, No and Done. Yes, No and Done send their word as the comment.
- Picked text is highlighted in the selection color, so it stands apart from the yellow of commented text.

## 0.1.7 - 2026-10-31
### Added
- Alt+Enter sends the comments, beside Ctrl+Enter.
- Esc in the comment box asks before it discards changed text.
- Every reload or tab close asks first, because comments live only in the page.

### Changed
- The terminal font is Atkinson Hyperlegible Mono at weight 300, with bold at 500. The font ships inside the package.
- Links in a reply show as plain text, so a click can no longer leave the page and lose the comments.

[Unreleased]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.12...HEAD
[0.1.12]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.7...v0.1.8
