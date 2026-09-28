// Turns the Google Flow clips into the scroll-scrub frame sequence for the
// "Land to Roof" waterproofing hero (components/hero/Hero.tsx).
//
// Usage (needs ffmpeg + ffprobe on PATH):
//   node scripts/build-hero-frames.mjs [clipsDir]
//   clipsDir defaults to ./flow-clips and holds clip-1.mp4 … clip-7.mp4:
//     1 excavation · 2 foundation · 3 plinth · 4 structure · 5 wet areas · 6 roof & façade · 7 monsoon finale
//   Step 0 (intro) is made from the first frame of clip-1 with a slow push-in.
//
// Output (then point public/film/manifest.json at it):
//   public/film/wp/0001.webp …   1600 px wide (desktop)
//   public/film/wp-m/0001.webp … 960 px wide (mobile)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, renameSync } from "node:fs";
import path from "node:path";

const CLIPS = 7;
const PER_STEP = 36; // frames per scroll step → 8 × 36 = 288
// Flow adds a visible AI watermark (bottom-right sparkle) in some regions — it is kept as-is.
const clipsDir = process.argv[2] ?? "flow-clips";
const tmp = path.join("public", "film", "_wp_tmp");

const clips = Array.from({ length: CLIPS }, (_, i) => path.join(clipsDir, `clip-${i + 1}.mp4`));
for (const c of clips) if (!existsSync(c)) throw new Error(`Missing ${c}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

let n = 0;
const out = () => path.join(tmp, "%04d.png");

// step 0 — intro: first frame of clip 1, slow 4 % push-in
ff(["-i", clips[0], "-frames:v", "1", path.join(tmp, "k0.png")]);
ff([
  "-loop", "1", "-i", path.join(tmp, "k0.png"),
  "-vf", `scale=1920:1080:flags=lanczos,zoompan=z='1+0.04*on/${PER_STEP - 1}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${PER_STEP}:s=1920x1080:fps=24`,
  "-frames:v", String(PER_STEP), "-start_number", String(n + 1), out(),
]);
n += PER_STEP;

// steps 1–7 — one clip each, PER_STEP frames spread evenly over the clip
for (const c of clips) {
  const fps = (PER_STEP / dur(c)).toFixed(5);
  ff([
    "-i", c,
    "-vf", `fps=${fps},scale=1920:1080:flags=lanczos,unsharp=5:5:0.6`,
    "-frames:v", String(PER_STEP), "-start_number", String(n + 1), out(),
  ]);
  n += PER_STEP;
}

// encode both sets
for (const [dir, w, q] of [["wp", 1600, 66], ["wp-m", 960, 62]]) {
  const dest = path.join("public", "film", dir);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  ff(["-start_number", "1", "-i", out(), "-vf", `scale=${w}:-2:flags=lanczos`, "-c:v", "libwebp", "-quality", String(q), "-compression_level", "6", path.join(dest, "%04d.webp")]);
  console.log(`${dir}: ${readdirSync(dest).length} frames`);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`Done — ${n} frames. manifest.json: desktop {count:${n},width:1600,height:900,path:"/film/wp/"}, mobile {count:${n},width:960,height:540,path:"/film/wp-m/"}`);
