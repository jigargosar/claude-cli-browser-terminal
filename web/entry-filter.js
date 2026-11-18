// Which entry types show on the page: the default from entry-types.js, unless the user changed it in "All".
// Changes are saved with the page settings (settings.js), only where they differ from the default.
import { ENTRY_TYPES, entryType } from "./entry-types.js";
import * as settings from "./settings.js";

const KEY = "entryFilter";
const defaults = new Map(ENTRY_TYPES.map((t) => [t.type, t.active]));
// A type missing from the table shows, so new kinds of entries are noticed.
const byDefault = (type) => defaults.get(type) ?? true;
const overrides = () => settings.get(KEY) ?? {};
const listeners = new Set();
const notify = () => {
  for (const fn of listeners) fn();
};

export const isTypeShown = (type) => overrides()[type] ?? byDefault(type);
export const isShown = (item) => isTypeShown(entryType(item));
export const setShown = (type, shown) => {
  const next = { ...overrides() };
  if (shown === byDefault(type)) delete next[type];
  else next[type] = shown;
  settings.set(KEY, next);
  notify();
};
// Returns the unsubscribe.
export const onChange = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
// Saved changes arrive on connect, after a page may have drawn with the defaults.
settings.onLoad(notify);
