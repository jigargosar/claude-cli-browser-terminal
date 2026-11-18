// Report: pair mod and tail rows by uuid, per run in results/.
//   node report.mjs
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("./results/", import.meta.url);
const read = (name) => readFileSync(new URL(name, dir), "utf8");
const rowsOf = (name) => read(name).trim().split("\n").map((l) => JSON.parse(l));

const kind = (msg) => {
  const content = msg?.message?.content;
  const first = Array.isArray(content) ? content[0]?.type : typeof content;
  return `${msg.type ?? msg?.message?.type}/${first}`;
};
const quantile = (xs, q) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};
const ms = (x) => (x === undefined ? "-" : x.toFixed(1));

const leads = new Map();
const onlyMod = new Map();
const onlyTail = new Map();
const bursts = { mod: [], tail: [] };
const walls = { mod: [], nomod: [] };
const bump = (map, k) => map.set(k, (map.get(k) ?? 0) + 1);

for (const meta of readdirSync(dir).filter((f) => f.endsWith(".meta.json"))) {
  const { mode, wallMs } = JSON.parse(read(meta));
  walls[mode].push(wallMs);
  if (mode !== "mod") continue;
  const rows = rowsOf(meta.replace(".meta.json", ".jsonl"));
  const mod = new Map(rows.filter((r) => r.via === "mod").map((r) => [r.body.e.uuid, r]));
  const tail = new Map(rows.filter((r) => r.via === "tail" && r.line.uuid).map((r) => [r.line.uuid, r]));
  for (const [uuid, m] of mod) {
    const t = tail.get(uuid);
    if (!t) bump(onlyMod, `${m.body.e.door}:${kind(m.body.e)}`);
    else {
      const k = kind(t.line);
      if (!leads.has(k)) leads.set(k, []);
      leads.get(k).push(t.at - m.at);
    }
  }
  for (const [uuid, t] of tail) if (!mod.has(uuid)) bump(onlyTail, kind(t.line));
  // Arrival groups: rows that arrive within 5 ms of the previous row on the same channel.
  for (const via of ["mod", "tail"]) {
    const ats = rows.filter((r) => r.via === via).map((r) => r.at);
    let groups = ats.length ? 1 : 0;
    for (let i = 1; i < ats.length; i++) if (ats[i] - ats[i - 1] > 5) groups++;
    bursts[via].push(`${ats.length} rows in ${groups} groups`);
  }
}

console.log("## Lead of the mod over the tail, ms (tail arrival minus mod arrival)\n");
console.log("| Row kind | n | median | p95 | min | max |");
console.log("| :- | -: | -: | -: | -: | -: |");
const all = [];
for (const [k, xs] of [...leads].sort()) {
  all.push(...xs);
  console.log(`| ${k} | ${xs.length} | ${ms(quantile(xs, 0.5))} | ${ms(quantile(xs, 0.95))} | ${ms(Math.min(...xs))} | ${ms(Math.max(...xs))} |`);
}
console.log(`| all | ${all.length} | ${ms(quantile(all, 0.5))} | ${ms(quantile(all, 0.95))} | ${ms(Math.min(...all))} | ${ms(Math.max(...all))} |`);

console.log("\n## Rows seen by one channel only\n");
console.log("| Channel | Row kind | n |");
console.log("| :- | :- | -: |");
for (const [k, n] of onlyMod) console.log(`| mod only | ${k} | ${n} |`);
for (const [k, n] of onlyTail) console.log(`| tail only | ${k} | ${n} |`);

console.log("\n## Arrival grouping per run (gap over 5 ms starts a new group)\n");
console.log(`- mod: ${bursts.mod.join(", ")}`);
console.log(`- tail: ${bursts.tail.join(", ")}`);

console.log("\n## claude -p wall time per run, ms\n");
console.log(`- with mod: ${walls.mod.join(", ")} (median ${quantile(walls.mod, 0.5)})`);
console.log(`- without mod: ${walls.nomod.join(", ")} (median ${walls.nomod.length ? quantile(walls.nomod, 0.5) : "-"})`);
