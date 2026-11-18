# Mods vs tail: results

Claude Code 2.1.327, Haiku, `claude -p`, 2026-11-18. 4 runs with the mod and 4 without. Each run does a Read, two Bash calls and a Glob, then replies. Run with `bash run.sh <mod|nomod> <n>`. Report with `node report.mjs`.

## Lead of the mod over the tail, ms (tail arrival minus mod arrival)

| Row kind | n | median | p95 | min | max |
| :- | -: | -: | -: | -: | -: |
| assistant/text | 4 | 91.5 | 447.6 | 54.0 | 447.6 |
| assistant/thinking | 2 | 615.4 | 615.4 | 435.4 | 615.4 |
| assistant/tool_use | 16 | 257.3 | 627.6 | 151.2 | 627.6 |
| attachment | 96 | 159.9 | 431.7 | 51.6 | 1585.6 |
| user/string | 4 | 441.3 | 461.6 | 289.4 | 461.6 |
| user/tool_result | 16 | 147.6 | 283.4 | 47.6 | 283.4 |
| all | 138 | 164.9 | 461.6 | 47.6 | 1585.6 |

## Rows seen by one channel only

None among rows with a `uuid`. The transcript also has about 30 lines per run without a `uuid`, which the mod never sees.

## Arrival grouping per run (a gap over 5 ms starts a new group)

- mod: 37 rows in 22 groups, 35 in 35, 35 in 33, 31 in 30
- tail: 67 rows in 16 groups, 64 in 14, 64 in 15, 57 in 12

## claude -p wall time per run, ms

- with mod: 22418, 16711, 16246, 13302 (median 16711)
- without mod: 30791, 16364, 17006, 15578 (median 17006)

## Not covered

- Interactive claude in a pty, the way the app runs it. Every run here is `claude -p`.
- Subagents. No run starts one.
- Turn time: 4 runs each, and model latency dominates, so a small slowdown would not show.
- The raw logs in `results/` are not committed. `bash run.sh` makes new ones.
