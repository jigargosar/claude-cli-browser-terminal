// Page settings, saved by the server in <project>/.ccw-cache/config.json. Not localStorage: that is per origin,
// and the port changes each run. The server pushes them on connect; each change sends the whole object back.
let settings = {};
let send = null;
const loaded = [];

export const get = (key) => settings[key];
export const set = (key, value) => {
  settings[key] = value;
  send(settings);
};
// A module that reads settings re-applies them on each push.
export const onLoad = (fn) => loaded.push(fn);
// main.js wires these to the socket.
export const load = (pushed) => {
  settings = pushed;
  for (const fn of loaded) fn();
};
export const onSave = (fn) => {
  send = fn;
};
