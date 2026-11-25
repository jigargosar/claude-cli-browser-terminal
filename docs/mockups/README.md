# Mockups

What each mockup shows, and where it went.
Kept for the information and the workflow they hold.
Read this list before removing any of them.

## Page

- `comments.html`: comments on a reply. Approved, built in `web/views/comments.js`.
- `entry-filter.html`: choose which entry types show. Reviewed 2026-11-18, built in `web/views/turn.js` and `web/turn.css`.
- `focus.html`: the focused pane indicator. Verdicts in `docs/focus-indicator.md`.
- `keys.html`: a spike, where the keys go. It switches between today's focus rules and fixed ones, and logs each key as kept or lost.
- `label-hints.html`: label hints to pick a sentence. Built in `web/views/hints.js`.
- `phrases.html`: the phrase popup, as a grid and as a ring. Built in `web/phrases.js`.
- `turn-insight.html`: live insight into a turn. Approved, built in `web/views/turn.js` and `web/turn.css`.

## Showcase

In the order they were made, as far as the files tell.

- `showcase-pitch.html`: the first pitch, three slides in the browser.
    - Its captions: "Stop reading scrollback.", "Point at the exact words.", "Many comments. One message."
    - Its motion rule, one mover at a time and a hold after each motion, carried over to the video.
- `showcase-hf/`: a HyperFrames trial, two scenes in 13 s at 1920x1080. Render: `trial-1.mp4`.
    - Built on three HyperFrames registry components, installed as editable source: `code-terminal-run`, `cursor-text-select` and `ui-focus-zoom`.
    - Loads GSAP from a CDN.
    - `CLAUDE.md` and `AGENTS.md` are the HyperFrames scaffold's guide: skills, CLI commands, composition rules.
    - Why it was replaced by a hand-built composition is not recorded.
- `showcase-storyboard.html`: the eight scenes as a page that plays in the browser without a render. Try changes here first.
- `showcase-video/`: the source of the README demo. Render steps in its `README.md`.
