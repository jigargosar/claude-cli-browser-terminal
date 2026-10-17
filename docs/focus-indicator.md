# Focus indicator

## Problem

Show which pane gets the keys: the terminal, the reply pane, or nothing.

## Constraints

- Works on both backgrounds: the dark terminal and the sepia reply pane. They are opposite colors.
- Persistent.
- Covers the state where nothing has focus.
- Size is not a constraint. Focus on the problem, not on a solution shape.

## Ideas and verdicts

1. Darkening, a rect, a top band. Tried before the 2026-10-17 session. Did not help. Darkening fails because the panes are opposite colors.
2. Hide xterm's cursor when the terminal is unfocused. Verdict: poor; at most an additional indicator.
3. Accent ring around the active pane. Verdict: fails on color, since there are two backgrounds.
4. Accent divider with an arrow pointing at the active pane. Verdict: a fixed spot is not always an advantage; small is worse; the divider gives no information and makes it worse. A bigger arrow without the divider could work, but the color issue remains.
5. Ring and divider arrow together. Mockup `docs/mockups/focus.html` (all themes). Verdict: mockups are useless here.
6. Dim the text of the inactive pane. Verdict: same color problem.
7. Accent flash on switch, ~200 ms. Verdict: not persistent, useless.
8. Terminal cursor hidden when unfocused plus a caret in the reply pane when focused. Verdict: too small.
9. Two-tone big arrow at the seam, no divider: dark fill, light outline, so it reads on both backgrounds. Terminal ◀, reply ▶, nothing a hollow ◆ or "?". No verdict yet.
10. Labelled badge in the active pane: solid dark pill, light border, text "Keys → Terminal", "Keys → Reply", "Keys → nothing · press Tab". No verdict yet.
11. Two-tone ring: dark and light strokes, so it reads on both backgrounds. Nothing focused: no ring, a small badge says "press Tab". No verdict yet.
