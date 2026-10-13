// View "last": the last reply of the conversation, rendered as markdown.
import { render } from "../markdown.js";

const reply = document.getElementById("reply");
const status = document.getElementById("reply-status");
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export const show = (items) => {
  const last = items.findLast((i) => i.kind === "reply");
  if (last) {
    reply.innerHTML = render(last.text);
    status.textContent = `Updated ${timeFormat.format(new Date(last.at))}`;
  } else {
    reply.innerHTML = '<p class="empty">Replies from this session show up here.</p>';
    status.textContent = "Waiting for the first reply";
  }
  reply.scrollTop = 0;
};
