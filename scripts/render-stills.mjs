// Renders all placeholder imagery from the site's own 3D scene.
// 1) NEXT_PUBLIC_STUDIO=1 npx next dev -p 3100   2) node scripts/render-stills.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
const base = process.env.STUDIO_URL || "http://localhost:3100/studio/render";
const out = "public/images";
const J = (name, q, w = 1600, h = 1000) => ({ url: `${base}?${q}`, out: `${out}/${name}.jpg`, w, h, wait: 2500, q: 86 });
const jobs = [
  J("hero-final", "p=1", 1920, 1080),
  J("og", "p=1", 1200, 630),
  J("bp-1", "p=0.268&cam=front-left", 1920, 1080),
  J("bp-2", "p=0.56&cam=front-left", 1920, 1080),
  J("bp-3", "p=0.75&tod=0&cam=front-left", 1920, 1080),
  J("bp-4", "p=1&cam=front-left", 1920, 1080),
  J("project-01", "variant=residential&p=1&tod=0.92&cam=front-right"),
  J("project-02", "variant=commercial&p=1&tod=0.05&cam=front-left"),
  J("project-03", "variant=villa&p=1&tod=0.6&cam=aerial"),
  J("project-04", "variant=industrial&p=1&tod=0.2&cam=aerial"),
  J("project-05", "variant=mixed&p=1&tod=0.8&cam=front-left"),
  J("process-01", "p=0.2&cam=overhead", 1600, 1100),
  J("process-02", "p=0.268&cam=aerial", 1600, 1100),
  J("process-03", "p=0.4&cam=low", 1600, 1100),
  J("process-04", "p=0.53&cam=front-right", 1600, 1100),
  J("process-05", "p=0.73&tod=0.05&cam=detail", 1600, 1100),
  J("process-06", "p=1&tod=0.95&cam=aerial", 1600, 1100),
  J("detail-01", "p=1&tod=1&cam=detail", 1200, 1500),
  J("detail-02", "p=1&tod=0.35&cam=detail-low", 1200, 1500),
  J("exploded", "mode=exploded&ex=0.5&labels=1", 1600, 1000),
];
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const list = only ? jobs.filter((j) => only.test(j.out)) : jobs;
const tmp = path.join(os.tmpdir(), "rpc-jobs.json");
fs.writeFileSync(tmp, JSON.stringify(list));
execFileSync("node", ["scripts/batch.mjs", tmp], { stdio: "inherit" });
