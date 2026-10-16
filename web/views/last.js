// View "last": the last reply of the conversation, rendered as markdown.
import { render } from "../markdown.js";

const reply = document.getElementById("reply");
const status = document.getElementById("reply-status");
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export const show = (items) => {
  const last = items.findLast((i) => i.kind === "reply");
  if (last) {
    reply.innerHTML = render(last.text);
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
