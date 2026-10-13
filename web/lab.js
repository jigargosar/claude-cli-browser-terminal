// Lab: A/B experiments. experiment() adds a row of buttons to the settings panel, applies the saved choice now,
// and applies a click right away. All choices live in one localStorage key.
const LAB_KEY = "cc-web.lab";
const lab = JSON.parse(localStorage.getItem(LAB_KEY) ?? "{}");
const rows = document.getElementById("lab-rows");

// options: [[value, label], ...], oldest first. A saved value that is no longer an option falls back.
export const experiment = (name, label, options, fallback, apply) => {
  const row = document.createElement("div");
  row.className = "row";
  const caption = document.createElement("span");
  caption.className = "label";
  caption.textContent = label;
  const seg = document.createElement("div");
  seg.className = "seg";
  seg.setAttribute("role", "group");
  seg.setAttribute("aria-label", label);
  const buttons = options.map(([value, text]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.value = value;
    b.textContent = text;
    seg.append(b);
    return b;
  });
  row.append(caption, seg);
  rows.append(row);

  const current = () => (options.some(([v]) => v === lab[name]) ? lab[name] : fallback);
  const choose = () => {
    const value = current();
    apply(value);
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.value === value));
  };
  for (const b of buttons) {
    b.addEventListener("click", () => {
      lab[name] = b.dataset.value;
      localStorage.setItem(LAB_KEY, JSON.stringify(lab));
      choose();
    });
  }
  choose();
};
