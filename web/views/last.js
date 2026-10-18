// View "last": the last reply of the conversation, rendered as markdown.
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

export const show = (items) => {
  const last = items.findLast((i) => i.kind === "reply");
  if (last) {
    reply.innerHTML = render(last.text);
    addCodeBars();
    // A new reply starts at its top. The jump is hidden by a short fade-in (base.css), so the text never slides past
    // the eye. Reading offsetWidth restarts the animation when replies arrive back to back.
    reply.scrollTop = 0;
    reply.classList.remove("arrived");
    void reply.offsetWidth;
    reply.classList.add("arrived");
    status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
  } else {
    reply.innerHTML = '<p class="empty">Replies from this session show up here.</p>';
    status.textContent = "Waiting for the first reply";
  }
};
