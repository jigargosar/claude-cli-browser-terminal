import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { afterEach, expect, test, vi } from "vitest";
import { followJsonl } from "../follow-jsonl.mjs";

let root = null;
let follower = null;
afterEach(() => {
  follower?.close();
  rmSync(root, { recursive: true, force: true });
});

// A project's first session: the transcript's folder doesn't exist when the server starts following it.
test("follows a file whose folder appears later", async () => {
  root = mkdtempSync(`${tmpdir()}/follow-jsonl-`);
  const dir = `${root}/project`;
  const path = `${dir}/session.jsonl`;
  const onStart = vi.fn();
  const values = [];
  follower = followJsonl(path, { onStart, onValue: (v) => values.push(v.n) });

  mkdirSync(dir);
  writeFileSync(path, '{"n":1}\n');
  await vi.waitFor(() => expect(values).toEqual([1]), { timeout: 3000 });
  appendFileSync(path, '{"n":2}\n');
  await vi.waitFor(() => expect(values).toEqual([1, 2]), { timeout: 3000 });
  expect(onStart).toHaveBeenCalledTimes(1);
});
