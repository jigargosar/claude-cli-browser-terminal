// The test page: the built page in a headless browser, fed by a transcript file, with no claude.
// Why and how: scripts/test-page/README.md.
//
//   const { page, addLines, step, close } = await openTestPage();
//   ...checks on page, a puppeteer Page...
//   await close();
//
// addLines(...objects): appends transcript lines, as if claude wrote them. step(): a pause between two actions, in a
// headed browser only. close(): stops the browser and the server, then throws if the page threw an error during the check.
import { spawn } from "node:child_process";
import { appendFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import getPort from "get-port";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(import.meta.dirname, "../..");
const FIXTURES = `${ROOT}/test/page`;
const HOST = "127.0.0.1";
// CCW_HEADED: the browser shows, each step pauses, and the window stays open this many seconds at the end. For the
// user, to watch a check and try the page by hand. Not set: headless, for Claude's own checks.
const headedSeconds = process.env.CCW_HEADED ? Number(process.env.CCW_HEADED) : null;
const headed = headedSeconds !== null;
const STEP_MS = 1500;

const stayOpen = (browser) =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, headedSeconds * 1000);
    browser.once("disconnected", () => {
      clearTimeout(timer);
      resolve();
    });
  });

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

  const browser = await puppeteer.launch(
    headed
      ? { channel: "chrome", headless: false, defaultViewport: null, args: [`--window-size=${viewport.width},${viewport.height}`] }
      : { channel: "chrome", defaultViewport: viewport },
  );
  // Headed: the tab the browser starts with, so the window has one tab only. Headless: a new tab. A click in the
  // starting tab of a headless browser did not open the file view, seen on 2026-11-22.
  const page = headed ? (await browser.pages())[0] : await browser.newPage();
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
    // A pause the user can follow in a headed browser. No pause in a headless one.
    step: async () => {
      if (headed) await new Promise((resolve) => setTimeout(resolve, STEP_MS));
    },
    close: async () => {
      if (headed && browser.connected) {
        console.log(`The browser stays open for ${headedSeconds} s. Close its window to finish sooner.`);
        await stayOpen(browser);
      }
      if (browser.connected) await browser.close();
      server.kill();
      rmSync(tempDir, { recursive: true });
      if (pageErrors.length) throw new AggregateError(pageErrors, `the page threw ${pageErrors.length} error(s)`);
    },
  };
};
