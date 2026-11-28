# 007 Unasked connections

Pain: Claude adds unasked connections to other items, and when naming a mistake it adds reasons and conclusions.

- Seen 2026-11-26: a reply tied the code block rendering to an Inbox item, and explained why a line was noise. The explanation was itself wrong and added more noise.
- Draft for `~/.claude/CLAUDE.md`:
    - No unasked connections to other items.
    - When naming a mistake, name it only. No reason, no conclusion, and no citing of the instruction broken.
- "No unasked connections to other items" is the load-bearing part. It names a mistake seen over and over across conversations.
- Rejected: "no judgment on the user's content". Too general, it would block a review the user asks for.
- Open: merged or separate lines. Separate lines may conflict.
- Open: "no citing of the instruction broken" conflicts with the global rule "When a request or action breaks a rule here, name the exact violation in a few words and carry on."
