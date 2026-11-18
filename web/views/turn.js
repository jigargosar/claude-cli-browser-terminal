// One turn as a page: what Claude did, not only what it said. Approved mockup: docs/mockups/turn-insight.html.
// The prompt and Claude's text show as is. Everything between two texts is one group, closed:
//   level 1, the group line: tool count, time, failures, tool chips; or the tool running now.
//   level 2, the open group: one row per item, in arrival order: tools, thoughts, and housekeeping (hooks, API
//            calls, mode, cost, and any line the server does not know).
//   level 3, an open row: a tool call's Request (its input as a table); a result's Response and Allowed by; or a
//            housekeeping detail.
// A type the filter hides (entry-filter.js) has no row in the group. "All", the group's last row, holds every entry
// in arrival order, each with a checkbox that shows or hides its type. Approved mockup: docs/mockups/entry-filter.html.
// Rendering is generic: any object becomes a key/value table. Only an input with old_string and new_string gets a diff.
// A page only appends or updates in place, so open folds stay open and comments on Claude's text survive.

import { entryType, isKnown } from "../entry-types.js";
import { isTypeShown, onChange, setShown } from "../entry-filter.js";

// null and false kids are skipped. replaceChildren would turn them into the text "null".
const present = (kids) => kids.filter((k) => k != null && k !== false);
const h = (tag, props = {}, ...kids) => {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...present(kids));
  return el;
};
const fill = (el, ...kids) => el.replaceChildren(...present(kids));

const duration = (ms) => {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(ms < 10000 ? 1 : 0)} s`;
  return `${Math.floor(ms / 60000)} m ${Math.floor((ms % 60000) / 1000)} s`;
};
const tokens = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));
const label = (key) =>
  key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().replace(/^./, (c) => c.toUpperCase());
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", second: "2-digit" });
const since = (from, to) => new Date(to) - new Date(from);

const valueNode = (v) => {
  if (typeof v === "string") return v.includes("\n") || v.length > 70 ? h("pre", {}, v) : v;
  if (typeof v === "number") return v.toLocaleString();
  if (v && typeof v === "object") return h("pre", {}, JSON.stringify(v, null, 2));
  return String(v);
};
const table = (obj) =>
  h("dl", {}, ...Object.entries(obj)
    .filter(([, v]) => v != null && v !== "")
    .flatMap(([k, v]) => [h("dt", {}, label(k)), h("dd", {}, valueNode(v))]));
const block = (title, ...kids) => h("div", { className: "block" }, h("h4", {}, title), ...kids);
const meta = (text, bad) => h("span", { className: bad ? "meta bad" : "meta" }, text);
const title = (text, live) => h("span", { className: live ? "title pulse" : "title" }, text);

const resultText = (content) =>
  typeof content === "string" ? content
    : Array.isArray(content) ? content.map((b) => (b.type === "text" ? b.text : `[${b.type}]`)).join("\n")
      : "";
// Claude Code wraps pasted text in tags with a random id. The page shows the text without them.
const promptText = (text) => text.replace(/<\/?pasted_content\b[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim();
const allowedText = (d) => [d.decision, d.source, d.reasonType ?? d.grantScope, d.reasonCode].filter(Boolean).join(" · ");
const toolTitle = (item) => {
  const what = item.input.description ?? Object.values(item.input).find((v) => typeof v === "string");
  return what ? `${item.name} · ${what.split("\n")[0]}` : item.name;
};
const diff = (input) =>
  h("pre", {},
    ...input.old_string.split("\n").map((l) => h("span", { className: "del" }, `- ${l}\n`)),
    ...input.new_string.split("\n").map((l) => h("span", { className: "add" }, `+ ${l}\n`)));

// Housekeeping rows: a title per kind, the rest of the item as a table.
const choreTitle = (i) => {
  if (i.kind === "hook") return `Hook · ${i.event ?? i.type}${i.name && i.name !== i.event ? ` · ${i.name}` : ""}`;
  if (i.kind === "api") return `API call · ${i.model} · ${i.stopReason ?? "streaming"}`;
  if (i.kind === "mode") return `Mode · ${i.mode}`;
  if (i.kind === "cost") return `Session cost · $${i.usd.toFixed(2)}`;
  // A type missing from entry-types.js says so, so it gets noticed and added.
  if (i.kind === "raw") return isKnown(i) ? i.type : `Unknown · ${i.type}`;
  return i.kind;
};
const choreMeta = (i) => {
  if (i.kind === "hook" && i.durationMs != null) return meta(duration(i.durationMs), i.exitCode != null && i.exitCode !== 0);
  if (i.kind === "api") return meta(`${tokens(i.usage.output)} out`);
  return null;
};
const choreDetail = (i) => {
  if (i.kind === "raw") return h("pre", {}, i.json);
  if (i.kind === "api") return table({ ...i.usage, requestId: i.requestId });
  const { id, parentId, kind, ...rest } = i;
  return table(rest);
};

export const newTurnPage = (root, { replyNode }) => {
  root.replaceChildren();
  const status = h("div", { className: "turn-status" });
  root.append(status);

  const seen = new Set();
  const groups = [];
  const tools = new Map();
  const apis = new Map();
  let group = null;
  let promptAt = null;
  let lastAt = null;
  let ended = false;
  let durationMs = null;
  // Set by update: false once a newer turn exists, so nothing here runs any more.
  let latest = true;
  let context = { mode: null, cost: null, waiting: false };
  const running = () => latest && !ended;

  // --- Groups ---
  const newGroup = () => {
    const summary = h("summary", { className: "line" });
    const allSummary = h("summary", { className: "line" });
    const allRows = h("div", { className: "rows" });
    const all = h("details", { className: "all" }, allSummary, allRows);
    const rows = h("div", { className: "rows" }, all);
    const g = { el: h("details", { className: "group" }, summary, rows), summary, rows, all, allSummary, allRows,
      entries: [], tools: [], thoughts: 0, chores: [], first: null, last: null };
    root.append(g.el);
    groups.push(g);
    return g;
  };
  const touch = (g, at) => {
    if (!at) return;
    g.first ??= at;
    g.last = at;
  };
  const drawGroup = (g) => {
    const live = running() && g.tools.find((t) => !t.done);
    const failed = g.tools.filter((t) => t.isError).length;
    const byName = Object.groupBy(g.tools, (t) => t.item.name);
    const chips = h("span", { className: "chips" }, ...Object.entries(byName).map(([name, ts]) =>
      h("span", { className: ts.some((t) => t.isError) ? "chip bad" : "chip" }, ts.length > 1 ? `${name} ×${ts.length}` : name)));
    const chores = g.chores.filter((c) => isTypeShown(entryType(c.item))).length;
    const hidden = g.entries.filter((e) => !isTypeShown(e.type)).length;
    const what = g.tools.length ? `Used ${g.tools.length} tool${g.tools.length > 1 ? "s" : ""}`
      : g.thoughts ? "Thought" : chores ? `${chores} housekeeping` : "Nothing shown";
    fill(g.summary,
      ...(live
        ? [title(`${context.waiting ? "Waiting on you ·" : "Running"} ${toolTitle(live.item)}`, true)]
        : [title(what), g.first && g.last !== g.first ? meta(duration(since(g.first, g.last))) : null,
          failed ? meta(`${failed} failed`, true) : null, hidden ? meta(`${hidden} hidden`) : null,
          g.tools.length ? chips : null]),
    );
    fill(g.allSummary, title(`All · ${g.entries.length}, in arrival order`));
  };

  // --- Entries ---
  // An entry is drawn twice: in the group, hidden when the filter hides its type, and in "All", always. render makes
  // one copy of its row. Rows keep arrival order.
  const typeCounts = () => Object.groupBy(groups.flatMap((g) => g.entries), (e) => e.type);
  const rowsOfType = (type) => root.querySelectorAll(`.row[data-type="${CSS.escape(type)}"]`);
  const drawEntry = (e, counts) => {
    const shown = isTypeShown(e.type);
    e.row.hidden = !shown;
    e.allRow.classList.toggle("off", !shown);
    e.box.checked = shown;
    e.count.textContent = `${e.type} · ${counts[e.type].length}`;
  };
  const allRow = (type, row) => {
    const box = h("input", { type: "checkbox" });
    box.addEventListener("change", () => setShown(type, box.checked));
    const count = h("span", {});
    const label = h("label", { className: "type", title: `Shows or hides every ${type} entry` }, box, count);
    label.addEventListener("mouseenter", () => rowsOfType(type).forEach((r) => r.classList.add("hl")));
    label.addEventListener("mouseleave", () => rowsOfType(type).forEach((r) => r.classList.remove("hl")));
    row.classList.add("all-row");
    row.prepend(label);
    return { allRow: row, box, count };
  };
  const addEntry = (item, render) => {
    group ??= newGroup();
    const type = entryType(item);
    const row = render();
    row.dataset.type = type;
    group.rows.insertBefore(row, group.all);
    const e = { type, row, ...allRow(type, render()) };
    e.allRow.dataset.type = type;
    group.allRows.append(e.allRow);
    group.entries.push(e);
    const counts = typeCounts();
    for (const other of counts[type]) drawEntry(other, counts);
    return group;
  };
  // A changed filter redraws every entry and group. A page replaced by a newer one unsubscribes.
  const stop = onChange(() => {
    if (!status.isConnected) return stop();
    const counts = typeCounts();
    for (const g of groups) {
      for (const e of g.entries) drawEntry(e, counts);
      drawGroup(g);
    }
  });

  // --- Tools ---
  // A tool call and its result are two rows, each where it arrived. The call's row only shows whether it still runs.
  const drawTool = (t) => {
    for (const s of t.summaries) fill(s, title(toolTitle(t.item), running() && !t.done));
  };
  const addTool = (item) => {
    const input = item.input;
    const t = { item, summaries: [], done: false, isError: false, group: null };
    t.group = addEntry(item, () => {
      const summary = h("summary", { className: "line" });
      t.summaries.push(summary);
      return h("div", { className: "row" }, h("details", {}, summary,
        block("Request", table(input)),
        typeof input.old_string === "string" && typeof input.new_string === "string" ? block("Diff", diff(input)) : null));
    });
    t.group.tools.push(t);
    tools.set(item.toolUseId, t);
    drawTool(t);
  };
  const addResult = (item) => {
    for (const r of item.results) {
      const t = tools.get(r.toolUseId);
      // Its call is on another page, e.g. after a rewind: shown as housekeeping.
      if (!t) {
        addChore({ id: `${item.id}:${r.toolUseId}`, kind: "raw", type: "tool_result", json: JSON.stringify(r), at: item.at });
        continue;
      }
      Object.assign(t, { done: true, isError: r.isError });
      drawTool(t);
      addEntry(item, () => h("div", { className: "row" }, h("details", {},
        h("summary", { className: "line" },
          title(`Result · ${toolTitle(t.item)}`),
          meta(r.isError ? "Failed" : duration(since(t.item.at, item.at)), r.isError)),
        block("Response", h("pre", {}, resultText(r.content))),
        item.allowed ? block("Allowed by", h("pre", {}, allowedText(item.allowed))) : null)));
      drawGroup(t.group);
    }
  };

  // --- Thinking ---
  const addThinking = (item) => {
    // Thinking with no text: why the transcript holds none is unknown, so it shows loud.
    if (!item.text.trim()) {
      addEntry(item, () => h("div", { className: "row thinking empty" }, "Thinking, no text in the transcript")).thoughts++;
      return;
    }
    const first = item.text.trim().split("\n")[0];
    const render = () => first === item.text.trim()
      ? h("div", { className: "row thinking" }, h("span", {}, first))
      : h("div", { className: "row thinking" },
        h("details", {}, h("summary", { className: "line" }, title(first)), h("div", { className: "thinking-text" }, item.text)));
    addEntry(item, render).thoughts++;
  };

  // --- Housekeeping ---
  const drawChore = (c) => {
    for (const s of c.summaries) fill(s, title(choreTitle(c.item)), choreMeta(c.item));
    for (const d of c.details) fill(d, choreDetail(c.item));
  };
  const addChore = (item) => {
    const c = { item, summaries: [], details: [] };
    addEntry(item, () => {
      const summary = h("summary", { className: "line" });
      const detail = h("div", { className: "block" });
      c.summaries.push(summary);
      c.details.push(detail);
      return h("div", { className: "row" }, h("details", {}, summary, detail));
    }).chores.push(c);
    drawChore(c);
    return c;
  };
  // An API call writes one line per content block. Each line is its own row; the status counts each call once.
  const addApi = (item) => {
    apis.set(item.requestId, addChore(item));
  };

  // --- Status ---
  const drawStatus = () => {
    const calls = [...apis.values()].map((c) => c.item);
    const out = calls.reduce((s, c) => s + (c.usage.output ?? 0), 0);
    const cacheRead = calls.reduce((s, c) => s + (c.usage.cacheRead ?? 0), 0);
    const elapsed = promptAt == null ? null
      : ended && durationMs != null ? durationMs
        : since(promptAt, running() ? new Date() : (lastAt ?? promptAt));
    const state = running() ? (context.waiting ? "Waiting on you" : "Running") : ended ? "Done" : "Stopped";
    const model = calls.at(-1)?.model;
    fill(status, 
      h("span", { className: running() ? "state pulse" : "state" }, state),
      elapsed != null ? h("span", {}, duration(elapsed)) : null,
      h("span", {}, `${tools.size} tool calls`),
      h("span", {}, `${calls.length} API calls · ${tokens(out)} out · ${tokens(cacheRead)} cache read`),
      model || context.mode ? h("span", {}, [model?.replace(/^claude-/, ""), context.mode && `${context.mode} mode`].filter(Boolean).join(" · ")) : null,
      context.cost != null ? h("span", {}, `session $${context.cost.toFixed(2)}`) : null,
    );
  };
  const drawAll = () => {
    for (const t of tools.values()) drawTool(t);
    for (const g of groups) drawGroup(g);
    drawStatus();
  };

  const add = (item) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    if (item.at) lastAt = item.at;
    // The prompt and Claude's text always show. Every other entry gets a row, hidden or not (addEntry).
    if (item.kind === "prompt") {
      group = null;
      promptAt = item.at;
      root.append(h("div", { className: "prompt" }, promptText(item.text)), h("p", { className: "prompt-meta" }, timeFormat.format(new Date(item.at))));
    } else if (item.kind === "reply") {
      group = null;
      root.append(replyNode(item));
    } else if (item.kind === "turn_end") {
      ended = true;
      durationMs = item.durationMs ?? null;
      drawAll();
    } else if (item.kind === "tool_use") addTool(item);
    else if (item.kind === "tool_result") addResult(item);
    else if (item.kind === "thinking") addThinking(item);
    else if (item.kind === "api") addApi(item);
    else addChore(item);
    if (group) {
      touch(group, item.at);
      drawGroup(group);
    }
  };

  // Called after new items, and each second for the elapsed time. latest: no newer turn exists.
  const update = (next) => {
    const wasRunning = running();
    const wasWaiting = context.waiting;
    latest = next.latest;
    context = { mode: next.mode, cost: next.cost, waiting: next.waiting };
    if (wasRunning !== running() || wasWaiting !== context.waiting) drawAll();
    else drawStatus();
  };

  return { add, update };
};
