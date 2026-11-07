# Global CLAUDE.md plan

Tasks that change the global CLAUDE.md (`~/.claude/CLAUDE.md`). Moved here from `docs/fvp-list.md`, which keeps one line that points to this file.

# Tasks

- [.] Reply length investigation, outside the project and exempt from Workflow: measurements, causes and proposed CLAUDE.md changes are in `docs/reply-length-investigation.md`. Next: agree the changes, apply them, re-measure. Measured: TLDR lines are 17 percent and table rows 39 percent of all reply words. Root cause, discussed with another AI instance: `docs/reply-length-rca.md`.
- [ ] Global CLAUDE.md: "In your reply Use headings and numbered lists" pushes Claude to answer in steps. Rule wanted: give steps only when the user asks for them. And see how headings and numberd lists can be formatted well.
- [ ] Global CLAUDE.md: questions, lookups and stops. Trigger: asked "how many KB is the file", twice, Claude answered with an inference instead of running `wc`. 1) Stop: when the user rejects a tool call or presses Escape, the harness tells Claude to stop and wait. That stop ends with the user's next message. If that message asks for a lookup, Claude runs it. Today Claude carried the stop forward and avoided every tool call. Find out why Escape stops Claude this way, then add a hard rule. 2) The rule "When the user asks a question, respond with an answer. Don't ... take any action" treats every question the same. A question is one of two kinds. One Claude can answer from what it knows, as fact or labeled inference. The other asks Claude to go find out, and needs a read-only lookup. A lookup is not an action the rule forbids. Rewrite the rule so it tells the two apart. 3) Keep the fact rule as it is: state as fact only what a file, command output or doc shows, and label the rest inference. Inference is for what no lookup can settle. It never replaces a lookup Claude can run.
  - Context, verbatim from the discussion:
    - Trigger: you asked the file size twice and got an inference instead of a `wc` run.
    - Stop: a rejected tool call or Escape stops Claude until your next message, not longer. If that message asks for a lookup, Claude runs it. It includes finding out why Escape stops Claude this way, then adding a hard rule.
    - Two kinds of question: one Claude answers from what it knows, and one that asks Claude to go find out. A read-only lookup is not a forbidden action. The "no action on a question" rule gets rewritten to tell the two apart.
    - The fact rule stays as it is. Inference is only for what no lookup can settle.
  - Why Claude gave an inference, verbatim from Claude's reply:
    - Your question was clear. Two things kept me from measuring:
    - Your global rule says: "When the user asks a question, respond with an answer. Don't panic, overcompensate or take any action." I counted a read-only measurement as an "action".
    - You had just rejected two of my tool calls with "STOP". So I avoided every tool call.
    - Another rule says to state as fact only what a command output shows, and to label the rest inference. With no measurement, I fell back to an inference label.
    - The gap: the "no action on a question" rule does not say whether a read-only lookup needed to answer counts as an action. I read it as yes, and that produced the inference.
  - The harness text Claude gets after a rejected tool call: "STOP what you are doing and wait for the user to tell you how to proceed."
