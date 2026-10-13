// Reading settings, like an ebook reader: theme, font, size, line spacing, width. Saved per browser.
// The controls are the [data-set] buttons and the size buttons in #settings (index.html).
const READER_KEY = "cc-web.reader";
const READER_DEFAULTS = { theme: "light", font: "sans", size: 17, leading: "normal", width: "normal" };
const READER_FONTS = { sans: ["var(--sans)", "var(--display)"], serif: ["var(--serif)", "var(--serif-display)"] };
const READER_LEADING = { tight: 1.45, normal: 1.6, loose: 1.85 };
const READER_WIDTH = { narrow: "58ch", normal: "68ch", wide: "82ch" };
const READER_SIZES = [14, 24];

const replyPane = document.getElementById("reply-pane");
const sizeValue = document.getElementById("size-value");
const sizeDown = document.getElementById("size-down");
const sizeUp = document.getElementById("size-up");
const buttons = document.querySelectorAll("#settings [data-set]");
let settings = { ...READER_DEFAULTS, ...JSON.parse(localStorage.getItem(READER_KEY) ?? "{}") };

const apply = () => {
  const { theme, font, size, leading, width } = settings;
  replyPane.dataset.theme = theme;
  replyPane.style.setProperty("--reader-font", READER_FONTS[font][0]);
  replyPane.style.setProperty("--reader-heading-font", READER_FONTS[font][1]);
  replyPane.style.setProperty("--reader-size", `${size}px`);
  replyPane.style.setProperty("--reader-leading", READER_LEADING[leading]);
  replyPane.style.setProperty("--reader-measure", READER_WIDTH[width]);
  sizeValue.textContent = `${size}px`;
  sizeDown.disabled = size <= READER_SIZES[0];
  sizeUp.disabled = size >= READER_SIZES[1];
  for (const b of buttons) b.setAttribute("aria-pressed", String(settings[b.dataset.set] === b.dataset.value));
  localStorage.setItem(READER_KEY, JSON.stringify(settings));
};
const change = (patch) => {
  settings = { ...settings, ...patch };
  apply();
};

for (const b of buttons) b.addEventListener("click", () => change({ [b.dataset.set]: b.dataset.value }));
sizeDown.addEventListener("click", () => change({ size: settings.size - 1 }));
sizeUp.addEventListener("click", () => change({ size: settings.size + 1 }));
document.getElementById("reader-reset").addEventListener("click", () => change(READER_DEFAULTS));
apply();
