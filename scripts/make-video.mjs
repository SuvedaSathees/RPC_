import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const imgDir = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\6d52ca1e-b4f6-40c2-8c74-ab0a0e96eecc";
const imgStructure = path.join(imgDir, "building_structure_clean_1790270545282.jpg");
const imgAssembled = path.join(imgDir, "building_assembled_clean_1790270513612.jpg");
const imgExploded = path.join(imgDir, "building_exploded_clean_1790270375103.jpg");

const outDir = path.resolve("public/videos");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
const outMp4 = path.join(outDir, "anatomy.mp4");
const outWebm = path.join(outDir, "anatomy.webm");

console.log("Generating cinematic architectural video...");

// Fast, beautiful crossfade loop:
// Image 1: Structure (3s) -> crossfade (1s) -> Image 2: Assembled (3s) -> crossfade (1s) -> Image 3: Exploded (4s) -> crossfade (1s) -> loop
const filterComplex = `
[0:v]scale=1920:1080,fps=30,setpts=PTS-STARTPTS[v0];
[1:v]scale=1920:1080,fps=30,setpts=PTS-STARTPTS[v1];
[2:v]scale=1920:1080,fps=30,setpts=PTS-STARTPTS[v2];
[0:v]scale=1920:1080,fps=30,setpts=PTS-STARTPTS[v3];
[v0][v1]xfade=transition=fade:duration=1.0:offset=2.5[x1];
[x1][v2]xfade=transition=fade:duration=1.0:offset=5.5[x2];
[x2][v3]xfade=transition=fade:duration=1.0:offset=9.5[outv]
`.replace(/\n/g, "").trim();

const cmdMp4 = `ffmpeg -y -loop 1 -t 3.5 -i "${imgStructure}" -loop 1 -t 4.0 -i "${imgAssembled}" -loop 1 -t 5.0 -i "${imgExploded}" -filter_complex "${filterComplex}" -map "[outv]" -c:v libx264 -preset fast -pix_fmt yuv420p -crf 20 -movflags +faststart "${outMp4}"`;

console.log("Running fast ffmpeg MP4 render...");
execSync(cmdMp4, { stdio: "inherit" });
console.log("MP4 generated successfully at", outMp4);

const cmdWebm = `ffmpeg -y -i "${outMp4}" -c:v libvpx-vp9 -crf 30 -b:v 0 -an "${outWebm}"`;
console.log("Running ffmpeg WebM conversion...");
try {
  execSync(cmdWebm, { stdio: "inherit" });
  console.log("WebM generated successfully at", outWebm);
} catch (e) {
  console.warn("WebM encoding warning:", e.message);
}
