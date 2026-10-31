# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased
### Added
- Alt+Enter sends the comments, beside Ctrl+Enter.
- Esc in the comment box asks before it discards changed text.
- Every reload or tab close asks first, because comments live only in the page.

### Changed
- The terminal font is Atkinson Hyperlegible Mono at weight 300, with bold at 500. The font ships inside the package.
- Links in a reply show as plain text, so a click can no longer leave the page and lose the comments.
