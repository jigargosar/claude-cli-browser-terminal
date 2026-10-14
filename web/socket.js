// The socket to server.mjs. One message type per line:
//   server -> page: settings (saved page settings, first on connect), o (terminal output), items (the whole conversation),
//                   item (one new item), reload (page rebuilt), error (the server crashed; its stack)
//   page -> server: i (typed input), r (cols and rows; the first one starts claude), s (all page settings, to save)
// The page sends its first r after settings, so claude starts at the saved split's size.
// Close codes: 4000 the server refused this tab, 4001 claude exited and the server stopped, 4002 the server crashed.
export const connect = ({ size, onSettings, onOutput, onItems, onItem, onError, onClosed }) => {
  const ws = new WebSocket("ws://" + location.host);
  const send = (m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.t === "settings") {
      onSettings(m.settings);
      send({ t: "r", ...size() });
    } else if (m.t === "o") onOutput(m.d);
    else if (m.t === "items") onItems(m.items);
    else if (m.t === "item") onItem(m.item);
    else if (m.t === "reload") location.reload();
    else if (m.t === "error") onError(m.stack);
  };
  ws.onclose = (e) => {
    if (e.code === 4000) {
      onClosed({ line: `${e.reason}. Close this tab, or close the other tab and reload this one.`, status: `${e.reason}.` });
    } else if (e.code === 4001 || e.code === 4002) {
      onClosed({ line: `${e.reason}. The server stopped. Close this tab.`, status: `${e.reason}. Close this tab.` });
    } else {
      onClosed({ line: "disconnected", status: "Disconnected from the server. Restart it and reload this page." });
    }
  };
  return {
    input: (d) => send({ t: "i", d }),
    resize: ({ cols, rows }) => send({ t: "r", cols, rows }),
    saveSettings: (settings) => send({ t: "s", settings }),
  };
};
