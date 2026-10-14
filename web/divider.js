// Pane divider: drag, arrow keys, double-click resets. Saved per project (settings.js) when a change ends.
// body.dragging is set during a drag; the terminal pauses its refit while it is set.
import * as saved from "./settings.js";

const SPLIT_KEY = "split";
const SPLIT_DEFAULT = 50;

export const initDivider = ({ onDragEnd }) => {
  const divider = document.getElementById("divider");
  let dragging = false;
  let split = SPLIT_DEFAULT;
  const showSplit = (percent) => {
    split = percent;
    document.body.style.setProperty("--split", `${percent}%`);
  };
  const setSplit = (percent) => {
    showSplit(percent);
    saved.set(SPLIT_KEY, percent);
  };
  showSplit(split);
  saved.onLoad(() => showSplit(saved.get(SPLIT_KEY) ?? SPLIT_DEFAULT));
  divider.addEventListener("pointerdown", (e) => {
    dragging = true;
    divider.setPointerCapture(e.pointerId);
    document.body.classList.add("dragging");
  });
  divider.addEventListener("pointermove", (e) => {
    if (dragging) showSplit(Math.round((e.clientX / document.body.clientWidth) * 1000) / 10);
  });
  divider.addEventListener("lostpointercapture", () => {
    dragging = false;
    document.body.classList.remove("dragging");
    saved.set(SPLIT_KEY, split);
    onDragEnd();
  });
  divider.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -2, ArrowRight: 2 }[e.key];
    if (step) setSplit(Math.min(90, Math.max(10, split + step)));
  });
  divider.addEventListener("dblclick", () => setSplit(SPLIT_DEFAULT));
};
