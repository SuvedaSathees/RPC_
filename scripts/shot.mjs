// Usage: node scripts/shot.mjs <url> <out.jpg> [w] [h] [waitMs]
import { chromium } from "playwright";
const [url, out, w = "1600", h = "900", wait = "2500"] = process.argv.slice(2);
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"],
});
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[console]", m.type(), m.text().slice(0, 300)); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "load", timeout: 120000 });
await page.waitForFunction(() => window.__RPC_READY === true, null, { timeout: 120000 }).catch(() => console.log("ready timeout"));
await page.waitForTimeout(+wait);
await page.screenshot({ path: out, type: out.endsWith(".png") ? "png" : "jpeg", quality: out.endsWith(".png") ? undefined : 90 });
await browser.close();
console.log("saved", out);
