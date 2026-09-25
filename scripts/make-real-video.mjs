// Stitches generated real-footage clips 01.mp4 … 08.mp4 into public/videos/anatomy.mp4 + .webm
// Usage: node scripts/make-real-video.mjs   (needs ffmpeg on PATH)
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const clipDir = path.resolve("public/videos/real-clips");
const outDir = path.resolve("public/videos");
const SEG = 2.6;   // seconds of each clip used
const FADE = 0.6;  // crossfade length

const clips = fs.readdirSync(clipDir).filter(f => /^\d+\.(mp4|mov|webm)$/i.test(f)).sort();
if (clips.length < 2) throw new Error("Put at least 2 clips (01.mp4, 02.mp4 …) in " + clipDir);

const inputs = clips.map(c => `-i "${path.join(clipDir, c)}"`).join(" ");
let f = clips.map((_, i) =>
  `[${i}:v]trim=0:${SEG},setpts=PTS-STARTPTS,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p[v${i}];`
).join("");
let last = "v0";
clips.slice(1).forEach((_, k) => {
  const i = k + 1, out = i === clips.length - 1 ? "outv" : `x${i}`;
  f += `[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${(i * (SEG - FADE)).toFixed(2)}[${out}];`;
  last = out;
});
f = f.replace(/;$/, "");

const mp4 = path.join(outDir, "anatomy.mp4"), webm = path.join(outDir, "anatomy.webm");
execSync(`ffmpeg -y ${inputs} -filter_complex "${f}" -map "[outv]" -an -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -movflags +faststart "${mp4}"`, { stdio: "inherit" });
execSync(`ffmpeg -y -i "${mp4}" -c:v libvpx-vp9 -crf 32 -b:v 0 -an "${webm}"`, { stdio: "inherit" });
console.log("Done:", mp4, webm);
