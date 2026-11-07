// View "last": the response page of the last turn, rendered as markdown.
import { render } from "../markdown.js";

const reply = document.getElementById("reply");
const status = document.getElementById("reply-status");
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

// Each code block gets a bar with Wrap and Copy. Blocks start wrapped. marked has no extension for this
// (marked.js.org, Known Extensions).
const addCodeBars = () => {
  for (const pre of reply.querySelectorAll("pre")) {
    pre.classList.add("wrap");
    const block = document.createElement("div");
    block.className = "code-block";
    block.innerHTML =
      '<div class="code-bar"><button type="button" data-code="wrap" aria-pressed="true">Wrap</button>' +
      '<button type="button" data-code="copy">Copy</button></div>';
    pre.replaceWith(block);
    block.prepend(pre);
  }
};

// One listener serves every block. #reply itself is never replaced, so it outlives each reply.
reply.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-code]");
  if (!button) return;
  const pre = button.closest(".code-block").querySelector("pre");
  if (button.dataset.code === "wrap") {
    button.setAttribute("aria-pressed", pre.classList.toggle("wrap"));
  } else {
    await navigator.clipboard.writeText(pre.textContent);
    button.textContent = "Copied";
    setTimeout(() => (button.textContent = "Copy"), 1200);
  }
});

// The response page: every reply text block of the turn that holds the last one. Each text block is its own item
// (server.mjs), so a turn with tool calls between its texts has several. A turn runs from its prompt to the next.
// Two sections: the text written around tool calls, then the answer, the text after the last tool call.
const lastTurn = (items) => {
  const end = items.findLastIndex((i) => i.kind === "reply");
  if (end < 0) return { steps: [], answer: [] };
  const start = items.findLastIndex((i, at) => at < end && i.kind === "prompt");
  const next = items.findIndex((i, at) => at > end && i.kind === "prompt");
  const turn = items.slice(start + 1, next < 0 ? items.length : next);
  const lastTool = turn.findLastIndex((i) => i.kind === "tool_use");
  const replies = (part) => part.filter((i) => i.kind === "reply");
  return { steps: replies(turn.slice(0, lastTool + 1)), answer: replies(turn.slice(lastTool + 1)) };
};

// The first reply's id names the turn on the page, so a new text block can tell growth from a new turn.
let shownTurn = null;

export const show = (items) => {
  const { steps, answer } = lastTurn(items);
  const replies = [...steps, ...answer];
  const last = replies.at(-1);
  if (last) {
    const turn = replies[0].id;
    // Each block renders on its own, so an unclosed code fence in one cannot swallow the next. One rule splits the
    // tool call section from the answer, so each reads as what it is.
    const section = (part) => part.map((r) => render(r.text)).join("");
    const html = [steps, answer].filter((part) => part.length).map(section).join("<hr>");
    // The same turn grew: the page updates in place and keeps its scroll, so reading goes on undisturbed.
    if (turn === shownTurn) {
      reply.innerHTML = html;
      addCodeBars();
      status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
      return;
    }
    shownTurn = turn;
    // A new turn starts at its top. The swap runs in a view transition, so the old page crossfades into the new one
    // (base.css) and the text never slides past the eye.
    const swap = () => {
      reply.innerHTML = html;
      addCodeBars();
      reply.scrollTop = 0;
    };
    if (document.hidden) {
      swap();
    } else {
      // The browser aborts the transition when the tab hides before it starts. The swap still runs, so only the crossfade
      // is lost. Any other failure goes on to the error banner.
      document.startViewTransition(swap).ready.catch((error) => {
        if (error.name !== "InvalidStateError") throw error;
      });
    }
    status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
  } else {
    shownTurn = null;
    reply.innerHTML = '<p class="empty">Replies from this session show up here.</p>';
    status.textContent = "Waiting for the first reply";
  }
};
