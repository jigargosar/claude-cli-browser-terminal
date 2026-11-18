// Spike: POST each row the conversation keeps to the bench listener, then let claude store it.
// The fetch is not awaited, so the hook never holds claude back.
let seq = 0;

export function register(on) {
  on("session.append", async ($, e, next) => {
    const firedAt = Date.now();
    const port = await $.env.get("SPIKE_PORT");
    const body = JSON.stringify({ seq: seq++, firedAt, e });
    $.http
      .fetch("http://127.0.0.1:" + port + "/row", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      })
      // A lost row shows up in the report as seen by the tail only. The log line says why.
      .catch((err) => $.ui.log("spike fetch failed: " + err));
    return next(e);
  });
}
