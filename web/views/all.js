// View "all": every reply of the conversation, oldest first, each rendered as markdown with its time.
// A new reply scrolls into view, unless the reader has scrolled up to read an older one.
import { render } from "../markdown.js";

const reply = document.getElementById("reply");
const status = document.getElementById("reply-status");
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

const section = (item) => {
  const el = document.createElement("section");
  el.className = "reply-item";
  el.innerHTML = `<p class="reply-time">${timeFormat.format(new Date(item.at))}</p>${render(item.text)}`;
  return el;
};
const atBottom = () => reply.scrollHeight - reply.scrollTop - reply.clientHeight < 40;
const setStatus = (item) => {
  status.textContent = `Updated ${timeFormat.format(new Date(item.at))}`;
};

export const show = (items) => {
  const replies = items.filter((i) => i.kind === "reply");
  reply.replaceChildren(...replies.map(section));
  if (replies.length === 0) {
    reply.innerHTML = '<p class="empty">Replies from this session show up here.</p>';
    status.textContent = "Waiting for the first reply";
    return;
  }
  setStatus(replies.at(-1));
  reply.scrollTop = reply.scrollHeight;
};

export const add = (item) => {
  const follow = atBottom() || reply.querySelector(".reply-item") === null;
  if (reply.querySelector(".reply-item") === null) reply.replaceChildren();
  reply.append(section(item));
  setStatus(item);
  if (follow) reply.scrollTop = reply.scrollHeight;
};
