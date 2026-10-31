// Shared by terminal-fonts-v2.html (grid) and terminal-fonts-flip-v2.html (one at a time).
// Real xterm with WebGL and the options of web/terminal.js. Keys change every terminal at once.

const FONTS = [
  { name: "Cascadia Mono", pkg: null },
  { name: "Atkinson Hyperlegible Mono", pkg: "atkinson-hyperlegible-mono" },
  { name: "JetBrains Mono", pkg: "jetbrains-mono" },
  { name: "Geist Mono", pkg: "geist-mono" },
  { name: "IBM Plex Mono", pkg: "ibm-plex-mono" },
  { name: "Source Code Pro", pkg: "source-code-pro" },
];
const WEIGHTS = ["200", "300", "400", "500"];
const BOLDS = ["500", "600", "700"];
const SIZES = [12, 13, 14, 15, 16];

const state = { weight: 2, bold: 1, size: 2 };

for (const { pkg } of FONTS) {
  if (!pkg) continue;
  for (const wt of [...WEIGHTS, ...BOLDS]) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `../../node_modules/@fontsource/${pkg}/${wt}.css`;
    document.head.append(link);
  }
}

const B = "\x1b[1m", N = "\x1b[22m", BLUE = "\x1b[38;2;110;168;254m", DIM = "\x1b[38;2;138;145;156m", R = "\x1b[0m";
const SAMPLE = [
  `${B}2. The two tasks we're working on together${N}`,
  "",
  "- Font task (the last task in the list):",
  "  - The goal is a thinner, better monospace font in the terminal.",
  `  - The next step is a mockup page, ${BLUE}docs/mockups/terminal-fonts.html${R}, that`,
  "    shows these five fonts in their light weights.",
  `  - You pick one by eye. I then set it in ${BLUE}web/terminal.js${R}.`,
  "- Release plan (the last dot):",
  `  - What I know: ${BLUE}pnpm release${R} already builds, tags and packs, and the`,
  "    last release is v0.1.6.",
  "",
  "0O 1lI| {}[]() => != === -> <= rn m",
  "",
  "TLDR: My font shortlist is Atkinson Hyperlegible Mono, JetBrains Mono, Geist",
  "Mono, IBM Plex Mono and Source Code Pro.",
  "",
  `${DIM}✻ Sautéed for 6s · done 6:00 PM${R}`,
  "",
  "> ",
].join("\r\n");

const terms = [];

function makeTerm(el, fontName) {
  const term = new Terminal({
    fontFamily: `"${fontName}", monospace`,
    fontSize: SIZES[state.size],
    fontWeight: WEIGHTS[state.weight],
    fontWeightBold: BOLDS[state.bold],
    lineHeight: 1,
    theme: { background: "#16181d" },
  });
  const fit = new FitAddon.FitAddon();
  term.loadAddon(fit);
  term.open(el);
  term.loadAddon(new WebglAddon.WebglAddon());
  fit.fit();
  term.write(SAMPLE);
  const entry = { term, fit, fontName };
  terms.push(entry);
  return entry;
}

function applyAll() {
  for (const { term, fit } of terms) {
    term.options.fontSize = SIZES[state.size];
    term.options.fontWeight = WEIGHTS[state.weight];
    term.options.fontWeightBold = BOLDS[state.bold];
    fit.fit();
  }
}

function settingsText() {
  return `weight ${WEIGHTS[state.weight]} · bold ${BOLDS[state.bold]} · size ${SIZES[state.size]}px`;
}

function isLoaded(fontName) {
  return document.fonts.check(`${WEIGHTS[state.weight]} 14px "${fontName}"`);
}

// Handles ↑ ↓ weight, B bold, + − size. Returns true when it used the key.
function handleSettingKey(e) {
  if (e.key === "ArrowUp") state.weight = Math.min(state.weight + 1, WEIGHTS.length - 1);
  else if (e.key === "ArrowDown") state.weight = Math.max(state.weight - 1, 0);
  else if (e.key === "b" || e.key === "B") state.bold = (state.bold + 1) % BOLDS.length;
  else if (e.key === "+" || e.key === "=") state.size = Math.min(state.size + 1, SIZES.length - 1);
  else if (e.key === "-") state.size = Math.max(state.size - 1, 0);
  else return false;
  return true;
}

// Load every face first, so xterm measures the real font, not the fallback.
function whenFontsLoaded() {
  return Promise.all(
    FONTS.filter((f) => f.pkg).flatMap(({ name }) => [...WEIGHTS, ...BOLDS].map((wt) => document.fonts.load(`${wt} 14px "${name}"`))),
  );
}
