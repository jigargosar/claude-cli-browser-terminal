// One turn as a page: what Claude did, not only what it said. Approved mockup: docs/mockups/turn-insight.html.
// The prompt and Claude's text show as is. Everything between two texts is one group, closed:
//   level 1, the group line: tool count, time, failures, tool chips; or the tool running now.
//   level 2, the open group: one row per tool and per thought, then one housekeeping row (hooks, API calls, mode,
//            cost, and any line the server does not know).
//   level 3, an open row: a tool's Request (its input as a table), Response and Allowed by; or a housekeeping detail.
// Rendering is generic: any object becomes a key/value table. Only an input with old_string and new_string gets a diff.
// A page only appends or updates in place, so open folds stay open and comments on Claude's text survive.

const h = (tag, props = {}, ...kids) => {
  const el = Object.assign(document.createElement(tag), props);
  el.append(...kids.filter((k) => k != null && k !== false));
  return el;
};

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
  if (i.kind === "raw") return i.type;
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
  let context = { mode: null, cost: null };
  const running = () => latest && !ended;

  // --- Groups ---
  const newGroup = () => {
    const summary = h("summary", { className: "line" });
    const rows = h("div", { className: "rows" });
    const g = { el: h("details", { className: "group" }, summary, rows), summary, rows,
      tools: [], thoughts: 0, chores: [], choreRow: null, first: null, last: null };
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
    const what = g.tools.length ? `Used ${g.tools.length} tool${g.tools.length > 1 ? "s" : ""}`
      : g.thoughts ? "Thought" : `${g.chores.length} housekeeping`;
    g.summary.replaceChildren(
      ...(live
        ? [title(`Running ${toolTitle(live.item)}`, true)]
        : [title(what), g.first && g.last !== g.first ? meta(duration(since(g.first, g.last))) : null,
          failed ? meta(`${failed} failed`, true) : null, g.tools.length ? chips : null]),
    );
  };
  // A row goes in before the housekeeping row, which stays last.
  const addRow = (row) => {
    group ??= newGroup();
    group.rows.insertBefore(row, group.choreRow);
    return group;
  };

  // --- Tools ---
  const drawTool = (t) => {
    const live = running() && !t.done;
    t.summary.replaceChildren(
      title(toolTitle(t.item), live),
      t.done ? meta(t.isError ? "Failed" : duration(since(t.item.at, t.doneAt)), t.isError) : null,
    );
  };
  const addTool = (item) => {
    const summary = h("summary", { className: "line" });
    const response = h("pre", {}, "(running)");
    const input = item.input;
    const fold = h("details", {}, summary,
      block("Request", table(input)),
      typeof input.old_string === "string" && typeof input.new_string === "string" ? block("Diff", diff(input)) : null,
      block("Response", response));
    const t = { item, summary, response, fold, done: false, isError: false, doneAt: null, group: null };
    t.group = addRow(h("div", { className: "row" }, fold));
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
      Object.assign(t, { done: true, isError: r.isError, doneAt: item.at });
      t.response.textContent = resultText(r.content);
      if (item.allowed) t.fold.append(block("Allowed by", h("pre", {}, allowedText(item.allowed))));
      drawTool(t);
      touch(t.group, item.at);
      drawGroup(t.group);
    }
  };

  // --- Thinking ---
  const addThinking = (item) => {
    const first = item.text.trim().split("\n")[0];
    const row = first === item.text.trim()
      ? h("div", { className: "row thinking" }, first)
      : h("div", { className: "row thinking" },
        h("details", {}, h("summary", { className: "line" }, title(first)), h("div", { className: "thinking-text" }, item.text)));
    addRow(row).thoughts++;
  };

  // --- Housekeeping ---
  const drawChores = (g) => {
    const counts = Object.entries(Object.groupBy(g.chores, (c) => c.item.kind)).map(([k, cs]) => (cs.length > 1 ? `${k} ×${cs.length}` : k));
    g.choreSummary.replaceChildren(title(`${g.chores.length} housekeeping`), meta(counts.join(", ")));
  };
  const drawChore = (c) => {
    c.summary.replaceChildren(title(choreTitle(c.item)), choreMeta(c.item));
    c.detail.replaceChildren(choreDetail(c.item));
  };
  const addChore = (item) => {
    group ??= newGroup();
    const g = group;
    if (!g.choreRow) {
      g.choreSummary = h("summary", { className: "line" });
      g.choreRows = h("div", { className: "rows" });
      g.choreRow = h("div", { className: "row" }, h("details", {}, g.choreSummary, g.choreRows));
      g.rows.append(g.choreRow);
    }
    const c = { item, summary: h("summary", { className: "line" }), detail: h("div", { className: "block" }) };
    g.choreRows.append(h("div", { className: "row" }, h("details", {}, c.summary, c.detail)));
    g.chores.push(c);
    drawChore(c);
    drawChores(g);
    return c;
  };
  // An API call writes one line per content block. The first makes its row; later ones update it.
  const addApi = (item) => {
    const known = apis.get(item.requestId);
    if (known) {
      known.item = item;
      drawChore(known);
      return;
    }
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
    const state = running() ? "Running" : ended ? "Done" : "Stopped";
    const model = calls.at(-1)?.model;
    status.replaceChildren(
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
    if (item.kind === "prompt") {
      group = null;
      promptAt = item.at;
      root.append(h("div", { className: "prompt" }, item.text), h("p", { className: "prompt-meta" }, timeFormat.format(new Date(item.at))));
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
    if (group && item.kind !== "tool_result") {
      touch(group, item.at);
      drawGroup(group);
    }
  };

  // Called after new items, and each second for the elapsed time. latest: no newer turn exists.
  const update = (next) => {
    const wasRunning = running();
    latest = next.latest;
    context = { mode: next.mode, cost: next.cost };
    if (wasRunning !== running()) drawAll();
    else drawStatus();
  };

  return { add, update };
};
