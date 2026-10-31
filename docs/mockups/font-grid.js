// All candidate fonts at once as real WebGL terminals. One size, weight and text kind for all; drop the ones you dislike.
// No bold: bold renders at the text weight. Run: pnpm exec vite docs/mockups
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { SAMPLES } from "./terminal-samples.js";

import "@fontsource/atkinson-hyperlegible-mono/200.css";
import "@fontsource/atkinson-hyperlegible-mono/300.css";
import "@fontsource/atkinson-hyperlegible-mono/400.css";
import "@fontsource/jetbrains-mono/200.css";
import "@fontsource/jetbrains-mono/300.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/geist-mono/200.css";
import "@fontsource/geist-mono/300.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/ibm-plex-mono/200.css";
import "@fontsource/ibm-plex-mono/300.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/source-code-pro/200.css";
import "@fontsource/source-code-pro/300.css";
import "@fontsource/source-code-pro/400.css";

// Consolas is today's terminal font: the page asks for Cascadia Mono, which is not installed. It has no light weights.
const FONTS = ["Consolas", "Atkinson Hyperlegible Mono", "JetBrains Mono", "Geist Mono", "IBM Plex Mono", "Source Code Pro"];
const WEIGHTS = ["200", "300", "400"];
const STORE = "font-grid-v1";

const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
const view = saved ?? { size: 14, weight: "400", sample: 0, dropped: [] };
const save = () => localStorage.setItem(STORE, JSON.stringify(view));
const $ = (id) => document.getElementById(id);

await Promise.all(FONTS.slice(1).flatMap((f) => WEIGHTS.map((w) => document.fonts.load(`${w} 14px "${f}"`))));

const cards = FONTS.map((font) => {
  const figure = document.createElement("figure");
  const caption = document.createElement("figcaption");
  const name = document.createElement("span");
  name.textContent = font === "Consolas" ? "Consolas (today)" : font;
  const drop = Object.assign(document.createElement("button"), { textContent: "Drop" });
  drop.onclick = () => {
    view.dropped.push(font);
    save();
    render();
  };
  caption.append(name, drop);
  const box = document.createElement("div");
  box.className = "term";
  const host = document.createElement("div");
  host.className = "host";
  box.append(host);
  figure.append(caption, box);
  $("grid").append(figure);

  const term = new Terminal({ lineHeight: 1, theme: { background: "#16181d" } });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.open(host);
  term.loadAddon(new WebglAddon());
  new ResizeObserver(() => fit.fit()).observe(host);
  return { font, figure, term, fit };
});

function chips(parentId, items, isOn, onPick) {
  const parent = $(parentId);
  parent.replaceChildren(
    ...items.map((item, i) => {
      const b = Object.assign(document.createElement("button"), { textContent: item });
      b.setAttribute("aria-pressed", String(isOn(item, i)));
      b.onclick = () => onPick(item, i);
      return b;
    }),
  );
}

function render() {
  save();
  $("size").textContent = `${view.size}px`;
  chips("weights", WEIGHTS, (w) => w === view.weight, (w) => ((view.weight = w), render()));
  chips("samples", SAMPLES.map((s) => s.name), (_, i) => i === view.sample, (_, i) => ((view.sample = i), render()));
  for (const { font, figure, term, fit } of cards) {
    figure.hidden = view.dropped.includes(font);
    if (figure.hidden) continue;
    term.options.fontFamily = `"${font}", monospace`;
    term.options.fontSize = view.size;
    term.options.fontWeight = view.weight;
    term.options.fontWeightBold = view.weight;
    term.reset();
    term.write(SAMPLES[view.sample].text);
    fit.fit();
  }
  const dropped = $("dropped");
  dropped.replaceChildren();
  if (view.dropped.length) {
    const label = Object.assign(document.createElement("span"), { className: "muted", textContent: `Dropped: ${view.dropped.join(", ")} ` });
    const restore = Object.assign(document.createElement("button"), { textContent: "Restore all" });
    restore.onclick = () => ((view.dropped = []), render());
    dropped.append(label, restore);
  }
}

$("size-down").onclick = () => ((view.size = Math.max(10, view.size - 1)), render());
$("size-up").onclick = () => ((view.size = Math.min(20, view.size + 1)), render());
render();
