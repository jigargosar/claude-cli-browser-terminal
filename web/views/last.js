// View "last": the response page of the last turn: thinking, tool calls, hooks and text, rendered as markdown.
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

// The response page: the whole turn that holds Claude's latest output, in transcript order. A turn runs from its prompt
// to the next. Claude's output is text (reply), thinking and tool calls; a new turn's page starts with the first of
// these, so a fresh prompt keeps the previous page until Claude answers.
const OUTPUT = new Set(["reply", "thinking", "tool_use"]);
const lastTurn = (items) => {
  const end = items.findLastIndex((i) => OUTPUT.has(i.kind));
  if (end < 0) return [];
  const start = items.findLastIndex((i, at) => at < end && i.kind === "prompt");
  const next = items.findIndex((i, at) => at > end && i.kind === "prompt");
  return items.slice(start + 1, next < 0 ? items.length : next);
};

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const pre = (s) => (s ? `<pre>${escape(s)}</pre>` : "");
const resultText = (content) =>
  typeof content === "string" ? content : Array.isArray(content) ? content.map((b) => b.text ?? `[${b.type}]`).join("\n") : "";
// One collapsed block per thinking, tool call or hook. data-id keeps it open across redraws.
const fold = (item, cls, summary, body) =>
  `<details class="${cls}" data-id="${escape(item.id)}"><summary>${escape(summary)}</summary>${body}</details>`;
// A one-line hint for a tool call: what Claude said it does, or its main argument.
const toolHint = ({ input = {} }) => input.description ?? input.command ?? input.file_path ?? input.pattern ?? input.skill ?? "";

// Two sections, split by one rule: the work (thinking, tool calls with their results, hooks, and the text written
// around tool calls), then the answer, the text after the last tool call. Each text block renders on its own, so an
// unclosed code fence in one cannot swallow the next.
const pageHtml = (turn) => {
  const lastTool = turn.findLastIndex((i) => i.kind === "tool_use");
  const isAnswer = (i, at) => i.kind === "reply" && at > lastTool;
  const results = new Map(turn.filter((i) => i.kind === "tool_result").flatMap((i) => i.results).map((r) => [r.toolUseId, r]));
  const work = turn.map((i, at) => {
    if (isAnswer(i, at)) return "";
    if (i.kind === "reply") return render(i.text);
    if (i.kind === "thinking") return fold(i, "turn-thinking", "Thinking", render(i.text));
    if (i.kind === "tool_use") {
      const hint = toolHint(i);
      const result = results.get(i.toolUseId);
      return fold(i, "turn-tool", hint ? `${i.name}: ${hint}` : i.name,
        pre(JSON.stringify(i.input, null, 2)) + (result ? pre(resultText(result.content)) : ""));
    }
    if (i.kind === "hook") {
      const failed = i.exitCode ? ` (exit ${i.exitCode})` : "";
      return fold(i, "turn-hook", `Hook ${i.event}: ${i.name ?? i.command}${failed}`, pre(i.command) + pre(i.output) + pre(i.stderr));
    }
    return "";
  });
  const answer = turn.filter(isAnswer).map((i) => render(i.text));
  return [work.join(""), answer.join("")].filter(Boolean).join("<hr>");
};

// Blocks the reader opened. A redraw replaces the HTML, so it reopens them. toggle does not bubble, hence capture.
const opened = new Set();
reply.addEventListener(
  "toggle",
  (event) => {
    const id = event.target.dataset?.id;
    if (id) event.target.open ? opened.add(id) : opened.delete(id);
  },
  true,
);
const draw = (html) => {
  reply.innerHTML = html;
  for (const el of reply.querySelectorAll("details[data-id]")) el.open = opened.has(el.dataset.id);
  addCodeBars();
};

// The turn's first item names it on the page, so new output can tell growth from a new turn.
let shownTurn = null;

export const show = (items) => {
  const turnItems = lastTurn(items);
  const last = turnItems.findLast((i) => OUTPUT.has(i.kind));
  if (last) {
    const turn = turnItems[0].id;
    const html = pageHtml(turnItems);
    // The same turn grew: the page updates in place and keeps its scroll, so reading goes on undisturbed.
    if (turn === shownTurn) {
      draw(html);
      status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
      return;
    }
    opened.clear();
    shownTurn = turn;
    // A new turn starts at its top. The swap runs in a view transition, so the old page crossfades into the new one
    // (base.css) and the text never slides past the eye.
    const swap = () => {
      draw(html);
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
