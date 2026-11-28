Parallel? Pain: the page learns about each conversation row by tailing the transcript file. Is a mod's `session.append` hook faster?

- Solution: a spike. One process receives the mod's POST and tails the transcript, so both arrival times share one clock. Code and results: `docs/spikes/mods-vs-tail/`.
- Result, 2026-11-18: one hook, `session.append`. The mod leads by a median 165 ms, p95 462 ms, over 138 rows. Rows arrive one by one, not in bursts. No slowdown seen in 4 noisy runs. Measured with `claude -p` only, not in a pty, and without subagents. Same `uuid` as the transcript line. Assistant and tool result content match. Prompts and attachments differ in shape. The mod gives 4 fields per row against about 35 in the transcript, and misses the lines without a `uuid`.
- Next, not started: map each JSONL line and field the page uses to the mod event that gives it, then decide mod only, hybrid, or tail only.
