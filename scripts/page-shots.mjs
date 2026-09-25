// Usage: node scripts/page-shots.mjs <url> <outPrefix> <w> <h> <y1,y2,...>  (y in px, or "h0.5" = 50% of hero)
import { chromium } from "playwright";
const [url, prefix, w = "1440", h = "900", ys = "0"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("[err]", m.text().slice(0, 300)); });
await page.goto(url, { waitUntil: "load", timeout: 180000 });
await page.waitForTimeout(6000);
for (const y of ys.split(",")) {
  let target = y;
  if (y.startsWith("h")) target = await page.evaluate((f) => { const s = document.querySelector("main section"); return Math.round((s.offsetHeight - innerHeight) * f); }, parseFloat(y.slice(1)));
  if (y.startsWith("#")) {
    const [sel, off = "0"] = y.split("+");
    target = await page.evaluate(([sel, off]) => { const el = document.querySelector(sel); const pin = el.closest(".pin-spacer") || el; return pin.getBoundingClientRect().top + scrollY + off * innerHeight; }, [sel, parseFloat(off)]);
  }
  await page.evaluate((t) => window.scrollTo(0, +t), target);
  await page.waitForTimeout(+(process.env.WAIT || 3500));
  await page.screenshot({ path: `${prefix}_${y.replace(/[#.+]/g, "")}.jpg`, type: "jpeg", quality: 80, timeout: 180000 });
  console.log("shot", y, target);
}
await browser.close();
