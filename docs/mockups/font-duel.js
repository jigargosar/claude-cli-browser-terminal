// Font duel: two real terminals, the user picks the one that reads better, and the next pair is chosen to learn the most.
// Each candidate is a font + text weight. Size is set by the user for both sides. Bold renders at the text weight, so it shows no bold. openskill rates each setting as a player; a candidate is a
// team of its three settings, so one pick teaches about every candidate that shares a setting. Run: pnpm exec vite docs/mockups
import "@xterm/xterm/css/xterm.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebglAddon } from "@xterm/addon-webgl";
import { rating, rate, predictWin, predictDraw } from "openskill";
import { SAMPLES } from "./terminal-samples.js";

import "@fontsource/atkinson-hyperlegible-mono/200.css";
import "@fontsource/atkinson-hyperlegible-mono/300.css";
import "@fontsource/atkinson-hyperlegible-mono/400.css";
import "@fontsource/atkinson-hyperlegible-mono/500.css";
import "@fontsource/atkinson-hyperlegible-mono/600.css";
import "@fontsource/atkinson-hyperlegible-mono/700.css";
import "@fontsource/jetbrains-mono/200.css";
import "@fontsource/jetbrains-mono/300.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/geist-mono/200.css";
import "@fontsource/geist-mono/300.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/500.css";
import "@fontsource/geist-mono/600.css";
import "@fontsource/geist-mono/700.css";
import "@fontsource/ibm-plex-mono/200.css";
import "@fontsource/ibm-plex-mono/300.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "@fontsource/source-code-pro/200.css";
import "@fontsource/source-code-pro/300.css";
import "@fontsource/source-code-pro/400.css";
import "@fontsource/source-code-pro/500.css";
import "@fontsource/source-code-pro/600.css";
import "@fontsource/source-code-pro/700.css";

const DIMS = {
  font: { label: "Font", values: ["Consolas", "Atkinson Hyperlegible Mono", "JetBrains Mono", "Geist Mono", "IBM Plex Mono", "Source Code Pro"] },
  weight: { label: "Text weight", values: ["200", "300", "400"] },
};
const DIM_KEYS = Object.keys(DIMS);
const MAX_PICKS = 40;
const SURE_ENOUGH = 0.9;
const STORE = "font-duel-v2";
// Today the page asks for Cascadia Mono, but it is not installed, so the terminal shows Consolas. Consolas has only
// regular and bold, so other weights would look the same as 400 and make identical pairs.
const ONLY = { Consolas: ["400"] };


// ---- State, kept in localStorage so a refresh keeps the picks ----

const key = (dim, value) => `${dim}:${value}`;

function freshState() {
  const ratings = {};
  for (const dim of DIM_KEYS) for (const v of DIMS[dim].values) ratings[key(dim, v)] = rating();
  return { ratings, picks: 0, dropped: [], lastPair: "" };
}

let state = JSON.parse(localStorage.getItem(STORE) ?? "null") ?? freshState();
const save = () => localStorage.setItem(STORE, JSON.stringify(state));

const allCandidates = [];
for (const font of DIMS.font.values)
  for (const weight of DIMS.weight.values) {
    if (ONLY[font] && !ONLY[font].includes(weight)) continue;
    allCandidates.push({ font, weight });
  }

const live = () => allCandidates.filter((c) => !state.dropped.includes(c.font));
const keysOf = (c) => DIM_KEYS.map((d) => key(d, c[d]));
const mu = (c) => keysOf(c).reduce((s, k) => s + state.ratings[k].mu, 0);
const sigma = (c) => Math.sqrt(keysOf(c).reduce((s, k) => s + state.ratings[k].sigma ** 2, 0));
const conservative = (c) => mu(c) - 3 * sigma(c);
const optimistic = (c) => mu(c) + sigma(c);
const diffDims = (a, b) => DIM_KEYS.filter((d) => a[d] !== b[d]);
const team = (c, dims) => dims.map((d) => state.ratings[key(d, c[d])]);
const looksDifferent = (a, b) => DIM_KEYS.some((d) => a[d] !== b[d]);
const pairId = (a, b) => [keysOf(a).join("|"), keysOf(b).join("|")].sort().join(" vs ");

// ---- Choosing the next pair ----

// Left: one of the three most promising candidates (mean plus uncertainty), so good ones get tested and unknowns get a chance.
// Right: among candidates that differ in one or two settings, the one most likely to be a close call and still uncertain.
function nextPair() {
  const pool = live();
  const byPromise = [...pool].sort((x, y) => optimistic(y) - optimistic(x));
  const a = byPromise[Math.floor(Math.random() * Math.min(3, byPromise.length))];
  const rivals = byPromise.slice(0, 60).filter((c) => {
    const n = diffDims(a, c).length;
    return n <= 2 && looksDifferent(a, c) && pairId(a, c) !== state.lastPair;
  });
  const options = rivals.length ? rivals : pool.filter((c) => looksDifferent(a, c));
  let best = options[0];
  let bestInfo = -Infinity;
  for (const c of options) {
    const dims = diffDims(a, c);
    const close = predictDraw([team(a, dims), team(c, dims)]);
    const unsure = Math.sqrt(dims.reduce((s, d) => s + state.ratings[key(d, c[d])].sigma ** 2 + state.ratings[key(d, a[d])].sigma ** 2, 0));
    const info = close * unsure * (0.9 + Math.random() * 0.2);
    if (info > bestInfo) [best, bestInfo] = [c, info];
  }
  return Math.random() < 0.5 ? [a, best] : [best, a];
}

// tie: the user could not tell them apart, so both sides get rank 1.
function record(winner, loser, tie = false) {
  const dims = diffDims(winner, loser);
  const [w, l] = rate([team(winner, dims), team(loser, dims)], tie ? { rank: [1, 1] } : undefined);
  dims.forEach((d, i) => {
    state.ratings[key(d, winner[d])] = w[i];
    state.ratings[key(d, loser[d])] = l[i];
  });
  state.picks += 1;
  state.lastPair = pairId(winner, loser);
  save();
}

// How sure: for each setting, the chance the leading value beats the runner-up. The weakest setting sets the total.
function sureness() {
  const leader = [...live()].sort((x, y) => conservative(y) - conservative(x))[0];
  return Math.min(
    ...DIM_KEYS.map((d) => {
      const values = d === "font" ? DIMS.font.values.filter((f) => !state.dropped.includes(f)) : DIMS[d].values;
      const others = values.filter((v) => v !== leader[d]);
      if (!others.length) return 1;
      const lead = state.ratings[key(d, leader[d])];
      return Math.min(...others.map((v) => predictWin([[lead], [state.ratings[key(d, v)]]])[0]));
    }),
  );
}

// ---- Terminals ----

function makeTerm(box) {
  // xterm lives in an absolutely placed host, so its own size can never grow the box and refit in a loop.
  const el = document.createElement("div");
  el.className = "host";
  box.append(el);
  const term = new Terminal({ lineHeight: 1, fontWeightBold: "700", theme: { background: "#16181d" } });
  const fit = new FitAddon();
  term.loadAddon(fit);
  term.open(el);
  term.loadAddon(new WebglAddon());
  new ResizeObserver(() => fit.fit()).observe(el);
  return (c, sample) => {
    term.reset();
    term.write(sample.text);
    term.options.fontFamily = `"${c.font}", monospace`;
    term.options.fontWeight = c.weight;
    // Bold renders at the text weight, so no bold shows while picking. Bold gets its own round later.
    term.options.fontWeightBold = c.weight;
    // Size is not tested. The user sets it for both sides with the size buttons.
    term.options.fontSize = viewSize;
    fit.fit();
  };
}

const describe = (c) => `${c.font}, weight ${c.weight}, ${viewSize}px`;
const $ = (id) => document.getElementById(id);

await Promise.all(
  DIMS.font.values.slice(1).flatMap((f) => ["200", "300", "400", "500", "600", "700"].map((w) => document.fonts.load(`${w} 14px "${f}"`))),
);

const showLeft = makeTerm($("term-left"));
const showRight = makeTerm($("term-right"));
const showWinner = makeTerm($("term-winner"));
let pair;
let autoFinish = true;

const SIZE_KEY = "font-duel-size";
let viewSize = Number(localStorage.getItem(SIZE_KEY) ?? 14);

// Changes the size of both sides and redraws the same pair, so the pick is not lost.
function setSize(delta) {
  viewSize = Math.min(20, Math.max(10, viewSize + delta));
  localStorage.setItem(SIZE_KEY, String(viewSize));
  $("size").textContent = `${viewSize}px`;
  const sample = SAMPLES[state.picks % SAMPLES.length];
  if (document.body.classList.contains("done")) return renderResults();
  showLeft(pair[0], sample);
  showRight(pair[1], sample);
}
$("size").textContent = `${viewSize}px`;
$("size-down").onclick = () => setSize(-1);
$("size-up").onclick = () => setSize(1);

function render() {
  const sure = sureness();
  const sample = SAMPLES[state.picks % SAMPLES.length];
  $("status").textContent = `Pick ${state.picks + 1} · ${sample.name}`;
  $("meter").style.width = `${Math.round(sure * 100)}%`;
  $("sure").textContent = `${Math.round(sure * 100)}% sure`;
  $("restore").hidden = state.dropped.length === 0;
  if (autoFinish && (state.picks >= MAX_PICKS || sure >= SURE_ENOUGH)) return renderResults();
  document.body.classList.remove("done");
  pair = nextPair();
  showLeft(pair[0], sample);
  showRight(pair[1], sample);
}

function renderResults() {
  document.body.classList.add("done");
  const ranked = [...live()].sort((x, y) => conservative(y) - conservative(x));
  $("top").innerHTML = ranked.slice(0, 5).map((c) => `<li><code>${describe(c)}</code></li>`).join("");
  $("dims").innerHTML = DIM_KEYS.map((d) => {
    const values = d === "font" ? DIMS.font.values.filter((f) => !state.dropped.includes(f)) : DIMS[d].values;
    const order = [...values].sort((x, y) => state.ratings[key(d, y)].mu - state.ratings[key(d, x)].mu);
    return `<p><b>${DIMS[d].label}:</b> ${order.join(" › ")}</p>`;
  }).join("");
  $("winner-label").textContent = `Winner after ${state.picks} picks: ${describe(ranked[0])}`;
  showWinner(ranked[0], SAMPLES[0]);
}

function pick(side) {
  if (document.body.classList.contains("done")) return;
  const [winner, loser] = side === "right" ? [pair[1], pair[0]] : pair;
  record(winner, loser, side === "tie");
  render();
}

function drop(side) {
  const font = (side === "left" ? pair[0] : pair[1]).font;
  state.dropped.push(font);
  if (live().length === 0) state.dropped = [];
  save();
  render();
}

$("pick-left").onclick = () => pick("left");
$("pick-right").onclick = () => pick("right");
$("term-left").onclick = () => pick("left");
$("term-right").onclick = () => pick("right");
$("tie").onclick = () => pick("tie");
$("drop-left").onclick = () => drop("left");
$("drop-right").onclick = () => drop("right");
$("show-results").onclick = renderResults;
$("keep-picking").onclick = () => {
  autoFinish = false;
  render();
};
$("restore").onclick = () => {
  state.dropped = [];
  save();
  render();
};
$("restart").onclick = () => {
  autoFinish = true;
  state = freshState();
  save();
  render();
};
addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") pick("left");
  else if (e.key === "ArrowRight") pick("right");
  else if (e.key === "ArrowDown") pick("tie");
});

render();
