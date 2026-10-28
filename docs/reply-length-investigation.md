# Reply length investigation

Written 2026-10-28 so any session can resume it. Independent of the project. Board rules do not apply to the investigation itself.

## Objective

Find why Claude's replies run long across sessions, with numbers, then change the instructions that cause it. The earlier qualitative analysis is in `docs/reply-length-rca.md`. This file adds the measurements.

## Method

1. Copy the transcript of a session, raw, into the session scratchpad. Never read the raw file in chat, since one line can be hundreds of KB.
2. Extract one capped line per user or assistant turn with `jq`, output to a file.
3. Pair each assistant text reply with the user prompt before it. Count words, headings, table rows, list items, TLDR per pair.
4. Bucket every line of every reply by kind: table row, body prose, TLDR, heading, inference label, tickler.
5. Read a few long replies to short prompts, capped at 1500 chars.

Rules that kept the chat clean: scripts in files, all output redirected to files, only counts or capped slices printed. No `rm` or `mv` in auto mode, they get blocked.

## Data

- Scratchpad of the investigating session: `C:/Windows/TEMP/claude/C--Users-jigar-projects-claude-cli-browser-terminal/96096f0a-e659-4638-b92a-3253d74b5cce/scratchpad/`. Temp, may be gone. Everything there is reproducible from the transcripts with the scripts below.
- Session 1: `~/.claude/projects/C--Users-jigar-projects-claude-cli-browser-terminal/1a1e0b98-b8b8-4860-9a78-0e6222d3f769.jsonl`, 2026-10-28, 18 pairs.
- Session 2: `~/.claude/projects/C--Users-jigar-projects-claude-cli-browser-terminal/fa173710-6202-4aa9-b8e9-b13425c7ab48.jsonl`, 2026-10-27, 82 pairs.
- Scratchpad files: `extract.jq`, `pairs.jq`, `buckets.jq`, `master.jsonl`, `master-2.jsonl`, `turns-*.jsonl`, `pairs-*.jsonl`, `sample-a.md`, `findings.md`.

## Findings

Sizes, 100 pairs:

- Prompts average 45 words. Replies average 170 to 200 words. About 4 to 1.
- Short prompts of 20 words or less, 42 of 100, still get 160-word replies on average. 34 have headings, 30 have tables, all 42 end with a TLDR.
- Only one reply exceeds 400 words. Longest is 478. The problem is the constant scaffold, not rare long replies.

Share of all words, both sessions pooled, about 17,500 words:

- Table rows: 39 percent.
- Body prose: 32 percent.
- TLDR lines: 17 percent. Average TLDR is 31 words, longest 57. It always repeats the reply above.
- Headings: 6 percent.
- Inference and verification labels: 3 percent.
- Tickler: 2 percent.

Four longest replies to short prompts:

- A 14-word "update the plan" got 376 words. The plan was the length, but each table cell repeated who verified what.
- A 12-word "reproduce previous response verbatim" got 363 words. Asked for.
- A 25-word "what order do you suggest" got 303 words. Two tables, a "What I found" section nobody asked for, a 50-word TLDR.
- A 13-word "commit then discuss placement" got 292 words. A table, a "Reasoning" section, an "Open question" section, a 40-word TLDR.

Most common unasked section titles across both sessions: Answers, Recommendation, Notes, Open question, Reasoning, What I found.

## Causes ranked by measured weight

1. TLDR rule in global CLAUDE.md. One in six words, on every reply, always a repeat.
2. Tables by default, from "Prefer tables" in global CLAUDE.md. Two in five words. A "Why" or "Source" column gets filled on every row even when nothing needs saying.
3. Unasked sections. Reasoning, Open question, What I found, Recommendation appear on 13-word prompts. Claude's habit, pushed by "use headings" and "always include your recommendation".
4. Same scaffold whatever the prompt size. A one-line question gets heading, table and TLDR.
5. Inference labels and tickler are small. Leave them.

Not measured: content creep, such as invented options or assumptions built on assumptions. That needs reading, not counting.

## Proposed changes to global CLAUDE.md

1. Drop the TLDR rule, or cap it at 12 words.
2. Lists by default. A table only for a real comparison of three or more items with the same columns. The user chose this on 2026-10-28.
3. Reply size follows prompt size. A one-line question gets one to three sentences, no headings.
4. Answer only what was asked. One recommendation when there is a choice, in one line, no section for it.
5. Replace "Start by stating the question" with one line giving Claude's reading of the request, never an echo. Wording is in `docs/reply-length-rca.md`, row 2 discussion.

## Status

- Done: measurements, findings, this record.
- Next: agree the rule changes above, edit global CLAUDE.md, then re-measure a later session the same way to confirm the drop.

## Scripts

extract.jq, one capped line per user or assistant turn. Run as `jq -c -f extract.jq master.jsonl > turns.jsonl`.

```
def cap: if type == "string" then .[:2000] else . end;
select(.type == "user" or .type == "assistant")
| .message as $m
| ($m.content // []) as $c
| (if ($c|type) == "string" then [{type:"text", text:$c}] else $c end) as $blocks
| {
    ts: .timestamp,
    role: .type,
    uuid: .uuid,
    texts: [ $blocks[] | select(.type == "text") | .text | cap ],
    text_chars: ([ $blocks[] | select(.type == "text") | .text | length ] | add // 0),
    tools: [ $blocks[] | select(.type == "tool_use") | {name, input: (.input | tojson | .[:300])} ],
    results: [ $blocks[] | select(.type == "tool_result") | {chars: (.content | tojson | length), head: (.content | tojson | .[:300])} ],
    usage: ($m.usage // null | if . then {in: .input_tokens, out: .output_tokens, cr: .cache_read_input_tokens, cc: .cache_creation_input_tokens} else null end),
    model: $m.model
  }
```

pairs.jq, prompt and reply stats per pair. Run as `jq -n -c -f pairs.jq master.jsonl > pairs.jsonl`.

```
def texts: (.message.content // []) as $c | (if ($c|type)=="string" then [$c] else [$c[] | select(.type=="text") | .text] end) | join("\n");
def words: split(" ") | map(select(length>0)) | length;
def stats: split("\n") as $l | {
  chars: length, words: (gsub("\n";" ")|words),
  head: ($l|map(select(startswith("#")))|length),
  tbl: ($l|map(select(startswith("|")))|length),
  bul: ($l|map(select(test("^ *[-*] ")))|length),
  num: ($l|map(select(test("^ *[0-9]+[.] ")))|length),
  fence: ($l|map(select(startswith("```")))|length),
  tldr: ($l|map(select(startswith("TLDR")))|length) };
reduce inputs as $t ({p:null, out:[]};
  if $t.type=="user" and ($t|texts|length)>0 and (($t|texts)|startswith("<")|not) then .p = {ts:$t.timestamp, text:($t|texts)}
  elif $t.type=="assistant" and ($t|texts|length)>0 then
    .out += [{ts:$t.timestamp, pw:((.p.text // "")|words), phead:((.p.text // "")|.[:120]), out_tok:$t.message.usage.output_tokens} + (($t|texts)|stats)]
  else . end)
| .out[]
```

buckets.jq, words per line kind. Run as `jq -n -c -f buckets.jq master.jsonl`.

```
def texts: (.message.content // []) as $c | (if ($c|type)=="string" then [$c] else [$c[] | select(.type=="text") | .text] end) | join("\n");
def w: split(" ") | map(select(length>0)) | length;
def bucket($l): if ($l|startswith("TLDR")) then "tldr"
  elif ($l|startswith("#")) then "heading"
  elif ($l|startswith("|")) then (if ($l|test("^[| -]*$")) then "tbl_sep" else "tbl_row" end)
  elif ($l|test("💊|☕|🌅|⏰")) then "tickler"
  elif ($l|test("(?i)inference|unknown:|verified")) then "inference"
  elif ($l|test("(?i)^(recommend|my recommendation|option)")) then "recommend"
  elif ($l|test("^```")) then "fence"
  else "body" end;
[inputs | select(.type=="assistant") | texts | select(length>0) | split("\n")[]]
| map({b: bucket(.), w: (.|w)})
| group_by(.b) | map({(.[0].b): (map(.w)|add)}) | add
```
