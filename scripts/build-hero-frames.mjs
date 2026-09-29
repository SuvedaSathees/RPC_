// Turns the Google Flow clips into the "Sealed inside out" waterproofing hero
// (components/hero/Hero.tsx): the desktop scroll-scrub frame sequence and the
// 10 s mobile video.
//
// Usage (needs ffmpeg + ffprobe on PATH):
//   node scripts/build-hero-frames.mjs [clipsDir]      (default ./flow-clips-v4)
//   clipsDir holds clip-1.mp4 … clip-6.mp4 (minimal studio X-ray style):
//     1 exterior (plain → X-ray) · 2 terrace · 3 bathroom · 4 underground sump · 5 basement · 6 pool
//
// Steps (7):  0 intro = clip 1 · 1–5 = clips 2–6 · 6 finale = clip 1's last frame, slow pull-out.
// Each step fades in from the previous step's last frame so scenes dissolve rather than cut.
// Flow adds a visible AI watermark (bottom-right sparkle) in some regions — it is kept as-is.
//
// Output:
//   public/film/wp/0001.webp …   1600 px wide (desktop), 36 frames per step
//   public/film/wp-m/0001.webp … 960 px wide, 36 frames per step
//   public/film/hero-wp-mobile.mp4 (7 × 34 frames @ 24 fps ≈ 9.9 s) + poster
//   public/film/wp-final.jpg (sealed X-ray building)

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const clipsDir = process.argv[2] ?? "flow-clips-v4";
const tmp = path.join("public", "film", "_wp_tmp");
const film = path.join("public", "film");

const clips = Array.from({ length: 6 }, (_, i) => path.join(clipsDir, `clip-${i + 1}.mp4`));
for (const c of clips) if (!existsSync(c)) throw new Error(`Missing ${c}`);

const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
const dur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
const pad = (n) => String(n).padStart(4, "0");
const LOOK = "scale=1920:1080:flags=lanczos,unsharp=5:5:0.5";

/** Renders all 7 steps as PNGs into dir, `per` frames each, with a `fade`-frame dissolve between steps. */
function render(dir, per, fade) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  let n = 0;
  const clipStep = (c) => {
    const fps = (per / (dur(c) - 0.02)).toFixed(5);
    ff(["-i", c, "-vf", `fps=${fps},${LOOK}`, "-frames:v", String(per), "-start_number", String(n + 1), path.join(dir, "%04d.png")]);
    n += per;
  };
  const starts = [];
  for (const c of [clips[0], ...clips.slice(1)]) {
    starts.push(n);
    clipStep(c);
  }
  // finale — last frame of the exterior clip, easing out from 8 % zoom to the full building
  starts.push(n);
  const last = path.join(dir, "k-last.png");
  ff(["-sseof", "-0.1", "-i", clips[0], "-frames:v", "1", "-vf", LOOK, last]);
  ff([
    "-loop", "1", "-i", last,
    "-vf", `scale=3840:2160:flags=lanczos,zoompan=z='1.08-0.08*(1-pow(1-on/${per - 1},2))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${per}:s=1920x1080:fps=24`,
    "-frames:v", String(per), "-start_number", String(n + 1), path.join(dir, "%04d.png"),
  ]);
  n += per;
  rmSync(last);

  // dissolves: frame k of each new step blends in over the previous step's last frame
  for (const s of starts.slice(1)) {
    const prev = path.join(dir, `${pad(s)}.png`);
    const hold = path.join(dir, "k-prev.png");
    ff(["-i", prev, "-frames:v", "1", hold]);
    for (let k = 0; k < fade; k++) {
      const f = path.join(dir, `${pad(s + 1 + k)}.png`);
      const o = (1 - (k + 1) / (fade + 1)) ** 1.6; // opacity of the outgoing scene
      const t = path.join(dir, "k-tmp.png");
      ff(["-i", hold, "-i", f, "-filter_complex", `[0][1]blend=all_mode=normal:all_opacity=${o.toFixed(4)}`, "-frames:v", "1", t]);
      execFileSync("mv", [t, f]);
    }
    rmSync(hold);
  }
  return n;
}

// desktop / scroll frames
const n = render(tmp, 36, 9);
for (const [dir, w, q] of [["wp", 1600, 68], ["wp-m", 960, 64]]) {
  const dest = path.join(film, dir);
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  ff(["-start_number", "1", "-i", path.join(tmp, "%04d.png"), "-vf", `scale=${w}:-2:flags=lanczos`, "-c:v", "libwebp", "-quality", String(q), "-compression_level", "6", path.join(dest, "%04d.webp")]);
  console.log(`${dir}: ${readdirSync(dest).length} frames`);
}
ff(["-i", path.join(tmp, pad(n) + ".png"), "-vf", "scale=1600:-2", "-q:v", "3", path.join(film, "wp-final.jpg")]);
writeFileSync(
  path.join(film, "manifest.json"),
  JSON.stringify({ desktop: { count: n, width: 1600, height: 900, path: "/film/wp/" }, mobile: { count: n, width: 960, height: 540, path: "/film/wp-m/" }, mode: "single" }),
);

// mobile video — 34 frames per step so the 7 steps land on Hero.tsx's STEP_START (i * 34 / 24)
const vtmp = path.join(film, "_wpv_tmp");
render(vtmp, 34, 8);
ff([
  "-framerate", "24", "-i", path.join(vtmp, "%04d.png"),
  "-vf", "scale=960:540:flags=lanczos", "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "21",
  "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", path.join(film, "hero-wp-mobile.mp4"),
]);
ff(["-i", path.join(vtmp, "0001.png"), "-vf", "scale=960:-2", "-q:v", "3", path.join(film, "hero-wp-mobile-poster.jpg")]);
rmSync(vtmp, { recursive: true, force: true });
rmSync(tmp, { recursive: true, force: true });
console.log(`Done — ${n} scroll frames, mobile video ${(7 * 34) / 24}s`);
