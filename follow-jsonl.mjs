// Follow a JSONL file as it grows: each JSON value once, from the first line, as soon as it is written.
//
//   const follower = followJsonl(path, { onStart, onValue });
//   follower.close();
//
// onStart: once, when the file exists (at once, or when it appears). onValue(value): each value, in file order.
// A moved or deleted file stops quietly: its reader waits for a change that never comes. Any other error, such as a
// line that is not JSON, propagates and crashes.
//
// chokidar reports the file's add, change and unlink. Each change reads the bytes added since the last read.
// @discoveryjs/json-ext parses the bytes as one JSONL stream, so a line or a character split between two reads is whole
// by the time it is a value.
import { existsSync, createReadStream } from "node:fs";
import { parseChunked } from "@discoveryjs/json-ext";
import chokidar from "chokidar";

const never = new Promise(() => {});

export const followJsonl = (path, { onStart, onValue }) => {
  let offset = 0;
  let dirty = true;
  let wake = null;
  let stopped = false;

  // The bytes, read to the end on each change. Stopped, it waits forever instead of ending: an end would make the
  // parser fail on a half line left by a move.
  async function* chunks() {
    while (true) {
      if (!dirty) await new Promise((resolve) => (wake = resolve));
      if (stopped || !existsSync(path)) await never;
      dirty = false;
      for await (const chunk of createReadStream(path, { start: offset })) {
        offset += chunk.length;
        yield chunk;
      }
    }
  }
  const changed = () => {
    dirty = true;
    wake?.();
  };
  const stop = () => {
    stopped = true;
    watcher.close();
  };

  const watcher = chokidar.watch(path);
  let started = false;
  watcher.on("add", () => {
    if (started) return changed();
    started = true;
    onStart();
    // Unhandled on purpose: a parse error rejects, and the process crashes with it.
    parseChunked(chunks, { mode: "jsonl", onRootValue: (value) => onValue(value) });
  });
  watcher.on("change", changed);
  watcher.on("unlink", stop);
  watcher.on("error", (err) => {
    throw err;
  });

  return { close: stop };
};
