// The test page: the built page in a headless browser, fed by a transcript file, with no claude.
// Why and how: scripts/test-page/README.md.
//
//   const { page, addLines, close } = await openTestPage();
//   ...checks on page, a puppeteer Page...
//   await close();
//
// addLines(...objects): appends transcript lines, as if claude wrote them. close(): stops the browser and the server,
// then throws if the page threw an error during the check.
import { spawn } from "node:child_process";
import { appendFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import getPort from "get-port";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FIXTURES = `${ROOT}/test/page`;
const HOST = "127.0.0.1";

export const openTestPage = async ({
  transcript = `${FIXTURES}/transcript.jsonl`,
  // The folder the server runs in. File references resolve here, and the page settings are saved here.
  project = `${FIXTURES}/project`,
  viewport = { width: 1400, height: 900 },
} = {}) => {
  // A copy, so addLines never changes the fixture.
  const tempDir = mkdtempSync(path.join(tmpdir(), "ccw-test-page-"));
  const copy = path.join(tempDir, "transcript.jsonl");
  copyFileSync(transcript, copy);

  const port = await getPort({ host: HOST });
  const url = `http://localhost:${port}`;
  const server = spawn(process.execPath, [`${ROOT}/server.mjs`], {
    cwd: project,
    env: { ...process.env, CC_WEB_PORT: String(port), CC_WEB_NO_OPEN: "1", CC_WEB_TRANSCRIPT: copy },
    stdio: ["ignore", "pipe", "inherit"],
  });
  // The server prints its URL once it listens.
  await new Promise((resolve, reject) => {
    server.stdout.on("data", (d) => String(d).includes(url) && resolve());
    server.once("exit", (code) => reject(new Error(`server.mjs exited (${code}) before it listened`)));
  });

  const browser = await puppeteer.launch({ channel: "chrome", defaultViewport: viewport });
  const page = await browser.newPage();
  const pageErrors = [];
  page.on("pageerror", (err) => pageErrors.push(err));
  await page.goto(url);
  // The first click after the page loads lands on the page itself, not on what is under it. Seen in this browser on
  // 2026-11-22, cause not known. One click on the turn label takes it, so a check's own first click works.
  await page.waitForSelector("#turn-label");
  await page.click("#turn-label");
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    page,
    url,
    addLines: (...lines) => appendFileSync(copy, lines.map((line) => `${JSON.stringify(line)}\n`).join("")),
    close: async () => {
      await browser.close();
      server.kill();
      rmSync(tempDir, { recursive: true });
      if (pageErrors.length) throw new AggregateError(pageErrors, `the page threw ${pageErrors.length} error(s)`);
    },
  };
};
