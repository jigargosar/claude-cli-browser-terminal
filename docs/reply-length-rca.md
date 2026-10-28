# Root cause of long replies

Recorded 2026-10-28, to discuss with another AI instance. Claude's analysis first, then the user's comments verbatim.

## Claude's analysis

Inference: these instructions push toward length. Each one is quoted from the instructions Claude was given.

| # | Instruction | Source | Effect |
|---|---|---|---|
| 1 | "Use headings and numbered lists", "Prefer tables" | Global CLAUDE.md | Every reply gets scaffolding. This conflicts with Concise mode's "headers only when they carry real structure". |
| 2 | "Start by stating the question or task" | Global CLAUDE.md | Restates the request. This conflicts with Concise mode's "Don't restate the request". |
| 3 | A "TLDR" last line | Global CLAUDE.md | A recap. This conflicts with Concise mode's "no closing recap". |
| 4 | "Always include your recommendation" | Global CLAUDE.md | Claude invents options so it has something to recommend. |
| 5 | "Label everything else inference" | Global CLAUDE.md | Labels, citations and verification steps add length. |
| 6 | "These instructions OVERRIDE" versus Concise mode's "these rules win" | CLAUDE.md wrapper and the output style | Two clauses each claim priority. Neither one clearly wins. |
| 7 | A tickler that may fill "half the screen" | System prompt | Adds bulk at the top of a reply. |
| 8 | Earlier Claude's ideas written into plans, such as `@apache-annotator/dom` | `docs/plans/` | Claude repeats them as if they were agreed. That breaks the global rule "Existing work implies neither correctness". |

Not caused by instructions: adding sections nobody asked for, such as "Reasoning" and "A link to…". That is Claude's own scope creep.

## The user's comments

Context: Claude had just traced `@apache-annotator/dom` to a plan step an earlier session wrote, never discussed.

> wow, ignore this project. Its absoloutely ridiclous. wasnt even discussed. The problem is that there is so much bs in each of you extrememly long responses, that main thread is lost.
>
> After making assumptions, which shouldnt be done in first place, then creating problems from that universe, which shouldnt be done in first place, then coming up with solutions, which we never asked for, then finding problems with those solutions.
>
> I need to figure out what is the root cause of all these long replies and excess stuff. while we are running in concise mode.
>
> We need to find cause in instructions given to you, find any conflicts, etc. because this has been happening over and over acrocoss every session. I need root cause analysis right now, in parallel with this plan resolution.

Comments on the analysis, numbered by row:

- Row 2: and it hasent even been followed mostly. So dont restate the request, can be counterbalanced with the reall intent of start by stating task. the aim was of congruence, figuring out if we are on same page, you infered request correctly. So we can rephrase the claude inst with: Without restating the request, describe your inference which supports or is foundation, ... i find it hard to phrase ... of the response/content that followes. Discuss this, its imp, also how much impact this has? confusion? leads to longer responses, by how much?
- Row 3: I need this because the long responses are pain to go through :(
- Row 4: this is a good one, if there is only one option, it might cause invention, perhaps needs tighter wording. But recommendation is important. but we need to tighten the number of options. that are just created for some reason or other, recommendation might just be one trigger.
- Row 5: how much lenght? we should create fint ligatures to represent content. And explude verification steps, and expand only when required. also we should never build up on inference, i.e no inference generation on inference.
- Row 6: we might need another solution, than clogging the path with if buts override computations.
- Row 7: it is delebrate, and that has never been a problem. But it shouldnt affect rest of the response. might need some adjusting.
- Row 8: there are two issues, one phrasing should not be extreme, appear factual, this happens all the time, with all content. Then how much can a rule take the burden of existing work implies neither a or b. what else do you have to go on!!! besides markers for suggestion, tentative decision, proposed by claude, but not verified by user explictly. etc.
- Scope creep: some creep is unavoidable, but instructions should help reduce it not encourage it by overpressure of instructions.
- Row 1: this might be an issue if not restricted properly.

## Discussion: row 2

Claude's reply to the user's row 2 comment.

Proposed wording:

> Open with one line that gives your reading of what the user wants, in your own words. It is the premise the rest of the reply builds on. Never echo the user's words.

The impact, by inference:

| Aspect | Today | With the new wording |
|---|---|---|
| How it was followed | As headings that echo the user's question, such as "## Which "last two" tasks?" | One line, said once |
| Length | About 1 line per section, so maybe 10–15% of each reply | About 1 line per reply |
| Confusion | "State the question" reads as "repeat it". That clashes with Concise mode, so the rule leaks into headings. | The purpose is explicit, so there is no clash. |
| Payoff | Low | High. Example from this session: a one-line reading would have caught the "last two tasks" mix-up in one turn instead of three. |
