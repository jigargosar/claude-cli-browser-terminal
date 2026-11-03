# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- While the comment popup shows, the keys R, Y and N press Reply, Yes and No.
- Esc closes the comment popup.
- Each popup button underlines its key letter.
- A second click on a highlight whose buttons or comment box are open closes them, as a click elsewhere does, and opens nothing again.

### Changed
- The comment popup shows Reply, Yes and No. Yes and No send their word as the comment. Done is gone.
- Picked text is highlighted light blue, so it stands apart from the yellow of commented text.

## 0.1.7 - 2026-10-31
### Added
- Alt+Enter sends the comments, beside Ctrl+Enter.
- Esc in the comment box asks before it discards changed text.
- Every reload or tab close asks first, because comments live only in the page.

### Changed
- The terminal font is Atkinson Hyperlegible Mono at weight 300, with bold at 500. The font ships inside the package.
- Links in a reply show as plain text, so a click can no longer leave the page and lose the comments.

[Unreleased]: https://github.com/jigargosar/claude-cli-browser-terminal/compare/v0.1.7...HEAD
