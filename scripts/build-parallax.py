#!/usr/bin/env python3
"""
Cuts the finished-building frame of the construction footage into depth
layers for the parallax hero:

    sky.webp        clean sky (building + skyline removed, extended upward)
    city.webp       distant skyline, trees, road   (alpha)
    building.webp   the building                   (alpha)
    ground.webp     road / near foreground         (alpha, feathered top)

    python3 scripts/build-parallax.py [video-or-image]

Requires: ffmpeg, OpenCV, NumPy, Pillow.
"""
import os, subprocess, sys, tempfile
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "assets-src", "construction-timelapse.mp4")
OUT = os.path.join(ROOT, "public", "parallax")
os.makedirs(OUT, exist_ok=True)

# finished frame (last frame of the time-lapse)
if SRC.endswith(".mp4"):
    tmp = os.path.join(tempfile.mkdtemp(), "f.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.1", "-i", SRC, "-frames:v", "1", tmp], check=True)
    SRC = tmp
img = cv2.cvtColor(cv2.imread(SRC), cv2.COLOR_BGR2RGB)
SCALE = 2  # upscale for full-screen use
img = cv2.resize(img, None, fx=SCALE, fy=SCALE, interpolation=cv2.INTER_LANCZOS4)
blur = cv2.GaussianBlur(img, (0, 0), 1.0)
img = cv2.addWeighted(img, 1.5, blur, -0.5, 0)  # unsharp after upscale
H, W = img.shape[:2]
f = img.astype(np.float32)
r, g, b = f[..., 0], f[..., 1], f[..., 2]

# ── sky key, pass 1: confidently blue pixels near the top → per-row sky colour
conf = ((b - r) > 30) & (b > 130) & (b >= g)
conf[int(H * 0.66):] = False
rows = []
for y in range(H):
    m = conf[y]
    rows.append(f[y][m].mean(0) if m.sum() > 40 else None)
last = None
for y in range(H):
    if rows[y] is None:
        rows[y] = last if last is not None else np.array([120, 160, 210], np.float32)
    last = rows[y]
rows = cv2.GaussianBlur(np.stack(rows)[:, None, :].astype(np.float32), (1, 0), sigmaX=0.1, sigmaY=H * 0.03)[:, 0, :]  # smooth → no banding
plate = np.repeat(rows[:, None, :], W, axis=1)
# pass 2: anything close to its row's sky colour is sky (catches the pale haze at the horizon)
dist = np.linalg.norm(f - plate, axis=2)
sky = (dist < 26).astype(np.uint8)
sky[int(H * 0.70):] = 0
sky = cv2.morphologyEx(sky, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
sky = cv2.morphologyEx(sky, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
n, lab = cv2.connectedComponents(sky)
top_labels = set(np.unique(lab[0])) - {0}
sky = np.isin(lab, list(top_labels)).astype(np.uint8)
# soft edge from the colour distance itself, for a clean skyline
soft = np.clip((34 - dist) / 16, 0, 1) * cv2.dilate(sky, np.ones((5, 5), np.uint8))
sky_soft = cv2.GaussianBlur(soft.astype(np.float32), (0, 0), 0.8)

ext = int(H * 0.25)
top = plate[0]
grad = np.stack([top * (0.92 + 0.08 * (i / ext)) for i in range(ext)])
sky_img = np.concatenate([grad, plate], 0)
noise = np.random.default_rng(1).normal(0, 1.6, sky_img.shape)  # fine grain, hides 8-bit steps
Image.fromarray(np.clip(sky_img + noise, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "sky.webp"), quality=86)

# ── building: centre block (measured on the 1280×720 frame), minus sky
bx0, bx1, by0, by1 = 322 * SCALE, 960 * SCALE, 150 * SCALE, 668 * SCALE
bmask = np.zeros((H, W), np.float32)
bmask[by0:by1, bx0:bx1] = 1
bmask *= 1 - sky_soft
bmask[by1 - 6 * SCALE:by1] *= np.linspace(1, 0, 6 * SCALE)[:, None]
building = np.dstack([img, (bmask * 255).astype(np.uint8)])
Image.fromarray(building).crop((bx0, by0, bx1, by1)).save(os.path.join(OUT, "building.webp"), quality=88)

# ── city/trees/road: everything that is not sky. Behind the building, the tree
# and road band is rebuilt from the real band either side of it (no smearing).
not_sky = 1 - sky_soft
city_rgb = img.copy()
band0 = 440 * SCALE
left = img[band0:by1 + 8, 0:bx0]
right = img[band0:by1 + 8, bx1:W]
src_band = np.concatenate([right, left], 1)
need = bx1 - bx0 + 16
tiles = np.concatenate([src_band] * (need // src_band.shape[1] + 1), 1)[:, :need]
city_rgb[band0:by1 + 8, bx0 - 8:bx1 + 8] = tiles
city_alpha = not_sky.copy()
yy = np.arange(H)[:, None]
xx = np.arange(W)[None, :]
inside = (xx >= bx0 - 8) & (xx < bx1 + 8) & (yy < by1 + 8)
city_alpha = np.where(inside & (yy < band0), 0, city_alpha)
city_alpha = np.where(inside & (yy >= band0), 1, city_alpha)
# feather the rebuilt band's top so it reads as distant trees
feather = np.clip((yy - band0) / (24 * SCALE), 0, 1)
city_alpha = np.where(inside, city_alpha * feather, city_alpha)
Image.fromarray(np.dstack([city_rgb, (np.clip(city_alpha, 0, 1) * 255).astype(np.uint8)])).save(os.path.join(OUT, "city.webp"), quality=84)

# ── near ground: road + kerb + corner trees, feathered top edge
g0, g1 = 640 * SCALE, 690 * SCALE
ga = np.clip((yy - g0) / (g1 - g0), 0, 1) * np.ones((1, W))
# big corner trees at the far left/right stay in the foreground layer
corners = np.zeros((H, W), np.float32)
corners[560 * SCALE:, : 120 * SCALE] = 1
corners[560 * SCALE:, 1180 * SCALE:] = 1
corners *= 1 - sky_soft
ground_alpha = np.maximum(ga, cv2.GaussianBlur(corners, (0, 0), 4))
Image.fromarray(np.dstack([img, (ground_alpha * 255).astype(np.uint8)])).crop((0, 560 * SCALE, W, H)).save(os.path.join(OUT, "ground.webp"), quality=86)

meta = {"w": W, "h": H, "skyExt": ext, "building": [bx0, by0, bx1, by1], "ground": [0, 560 * SCALE, W, H]}
# 3× wide copies (mirrored at the joins) so the planes never show an edge when the camera turns
from PIL import ImageOps
for n in ["city", "ground"]:
    im = Image.open(os.path.join(OUT, f"{n}.webp")).convert("RGBA")
    w, h = im.size
    m = ImageOps.mirror(im)
    wide = Image.new("RGBA", (w * 3, h))
    wide.paste(m, (0, 0)); wide.paste(im, (w, 0)); wide.paste(m, (2 * w, 0))
    wide.save(os.path.join(OUT, f"{n}-wide.webp"), quality=82)

import json
json.dump(meta, open(os.path.join(OUT, "layout.json"), "w"), indent=2)
print(meta)
