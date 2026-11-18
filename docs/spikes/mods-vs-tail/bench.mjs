// Spike bench: one process, one clock, two channels.
//   node bench.mjs <transcript.jsonl> <out.jsonl> <port>
// "mod": a POST from the mod's session.append hook. "tail": a line read from the transcript with followJsonl,
// the same follower server.mjs uses.
import http from "node:http";
import { appendFileSync } from "node:fs";
import { followJsonl } from "../../../follow-jsonl.mjs";

const [transcriptPath, outPath, port] = process.argv.slice(2);
const log = (record) => appendFileSync(outPath, JSON.stringify({ at: performance.now(), wall: Date.now(), ...record }) + "\n");

http
  .createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      log({ via: "mod", body: JSON.parse(body) });
      res.end("ok");
    });
  })
  .listen(Number(port), "127.0.0.1", () => log({ via: "listening" }));

followJsonl(transcriptPath, {
  onStart: () => log({ via: "tail-start" }),
  onValue: (line) => log({ via: "tail", line }),
});

setTimeout(() => process.exit(0), 10 * 60 * 1000);
