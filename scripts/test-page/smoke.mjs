// Smoke check of the test page: the reply shows, a file reference opens the file over the terminal, Esc closes it.
// Usage: node scripts/test-page/smoke.mjs [screenshot.png]. Also the example to copy for a new check.
import assert from "node:assert/strict";
import { openTestPage } from "./test-page.mjs";

const screenshotPath = process.argv[2];
const { page, close } = await openTestPage();

const peekShown = () => {
  const peek = document.querySelector(".ref-peek");
  if (!peek) return false;
  const { width, height } = peek.getBoundingClientRect();
  return width > 0 && height > 0 && getComputedStyle(peek).visibility !== "hidden";
};

// close() runs on a failed check too, so no browser or server is left running.
try {
  // The reference is a link once the server has found its file.
  await page.waitForSelector("#reply .file-ref.ok", { timeout: 10000 });
  const replyText = await page.$eval("#reply", (el) => el.textContent);
  assert.match(replyText, /The app starts in/);
  console.log("ok: the reply shows");

  await page.click('#reply .file-ref.ok[data-ref^="src/app.js"]');
  await page.waitForFunction(peekShown, { timeout: 5000 });
  const peekText = await page.$eval(".ref-peek", (el) => el.textContent);
  assert.match(peekText, /const start = /);
  console.log("ok: a click on the reference shows the file");
  if (screenshotPath) await page.screenshot({ path: screenshotPath });

  await page.keyboard.press("Escape");
  await page.waitForFunction(`!(${peekShown})()`, { timeout: 5000 });
  console.log("ok: Esc closes the file");
} finally {
  await close();
}
console.log("PASS");
