// Usage: node scripts/batch.mjs jobs.json   ([{url,out,w,h,wait}])
import { chromium } from "playwright";
import fs from "node:fs";
const jobs = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
for (const j of jobs) {
  const page = await browser.newPage({ viewport: { width: j.w ?? 1280, height: j.h ?? 720 }, deviceScaleFactor: j.dsf ?? 1 });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.log("[err]", m.text().slice(0, 200)); });
  await page.goto(j.url, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => window.__RPC_READY === true, null, { timeout: 180000 }).catch(() => console.log("ready timeout", j.out));
  await page.waitForTimeout(j.wait ?? 2500);
  await page.screenshot({ path: j.out, type: "jpeg", quality: j.q ?? 88, timeout: 180000 });
  await page.close();
  console.log("saved", j.out);
}
await browser.close();
