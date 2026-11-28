# 006 Self-sufficient replies

Pain: when a reply isn't self-sufficient, I have to assemble the picture myself before I can respond.

- Found 2026-11-26, while asking why replies wrote bare "line 19" instead of `path:line`.
- Not decided: replace the pain line of the task at `docs/fvp-list.md:34` with this one, and drop its stale Solution lines. Or keep both.
- Not split on purpose. A partial solution leaves the task partly done.
- Levels found so far:
    - The reply is self-sufficient.
    - The information inside the reply flows well.
    - Pieces needed together sit together. Failure: distance, across files, replies, or parts of one reply.
    - Pieces are the right size. Failure: too coarse, the change drowns. Too fine, it can't be placed.
- Two kinds of context:
    - Needed: what must be seen together to answer, such as a before next to its after.
    - Surrounding: what places the change. Needed only when the focus isn't clear.
- Poor rendering is a third problem: a code block in the pane wraps, and its buttons cover the text.
- Done: `server.mjs:54-61` now says "every mention of a file or a line", with a Bad and Good example.
- Not verified that it works. Pending: restart the server, then watch replies for bare line numbers.
- Open: the third rule of that prompt, "every reference resolves on its own: a file reference, or the referenced content carried forward inline". Its "or" lets quoted content replace the link. Drafts were rejected as confusing.
