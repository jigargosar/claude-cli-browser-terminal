// Pane divider: drag, arrow keys, double-click resets. Saved per browser.
// body.dragging is set during a drag; the terminal pauses its refit while it is set.
const SPLIT_KEY = "cc-web.split";
const SPLIT_DEFAULT = 65;

export const initDivider = ({ onDragEnd }) => {
  const divider = document.getElementById("divider");
  let dragging = false;
  const setSplit = (percent) => {
    document.body.style.setProperty("--split", `${percent}%`);
    localStorage.setItem(SPLIT_KEY, String(percent));
  };
  const currentSplit = () => Number(localStorage.getItem(SPLIT_KEY) ?? SPLIT_DEFAULT);
  document.body.style.setProperty("--split", `${currentSplit()}%`);
  divider.addEventListener("pointerdown", (e) => {
    dragging = true;
    divider.setPointerCapture(e.pointerId);
    document.body.classList.add("dragging");
  });
  divider.addEventListener("pointermove", (e) => {
    if (dragging) setSplit(Math.round((e.clientX / document.body.clientWidth) * 1000) / 10);
  });
  divider.addEventListener("lostpointercapture", () => {
    dragging = false;
    document.body.classList.remove("dragging");
    onDragEnd();
  });
  divider.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -2, ArrowRight: 2 }[e.key];
    if (step) setSplit(Math.min(90, Math.max(10, currentSplit() + step)));
  });
  divider.addEventListener("dblclick", () => setSplit(SPLIT_DEFAULT));
};
