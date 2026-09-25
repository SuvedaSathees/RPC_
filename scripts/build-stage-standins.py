#!/usr/bin/env python3
"""
Builds STAND-IN plates for the 12-stage photographic hero (public/stages/).

These are temporary: the first three are real Indian site photographs, the rest
are calm frames from the construction time-lapse. Replace any plate by dropping
a photograph with the same file name into public/stages/ (see
docs/STAGE-PLATES.md for the matched brief) — no code changes needed.

    python3 scripts/build-stage-standins.py
Requires: ffmpeg, Pillow, NumPy.
"""
import os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "stages")
STILLS = os.path.join(ROOT, "assets-src", "stills")
VIDEO = os.path.join(ROOT, "assets-src", "construction-timelapse.mp4")
W, H = 1920, 1080
os.makedirs(OUT, exist_ok=True)

tmp = tempfile.mkdtemp()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VIDEO, os.path.join(tmp, "%03d.png")], check=True)
vf = lambda n: Image.open(os.path.join(tmp, "%03d.png" % n)).convert("RGB")

def cover(im, cx=0.5, cy=0.5, zoom=1.0):
    """crop to 16:9 around (cx, cy) with optional zoom, then resize to W×H"""
    iw, ih = im.size
    if iw / ih > W / H:
        ch = ih / zoom; cw = ch * W / H
    else:
        cw = iw / zoom; ch = cw * H / W
    x0 = min(max(cx * iw - cw / 2, 0), iw - cw)
    y0 = min(max(cy * ih - ch / 2, 0), ih - ch)
    im = im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch))).resize((W, H), Image.LANCZOS)
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2))

def clean_sky(im, ref, rows):
    """replace the top `rows` fraction with the clean sky of a reference frame (same locked-off camera)"""
    a = np.asarray(im).copy(); r = np.asarray(ref)
    h = int(a.shape[0] * rows); f = 12
    a[:h] = r[:h]
    blend = np.linspace(1, 0, f)[:, None, None]
    a[h:h + f] = (r[h:h + f] * blend + np.asarray(im)[h:h + f] * (1 - blend)).astype(np.uint8)
    return Image.fromarray(a)

sky = vf(46)
plates = {
    "01-empty-plot": cover(Image.open(os.path.join(STILLS, "site-before.jpg")).convert("RGB"), cx=0.46, cy=0.55),
    "02-site-preparation": cover(Image.open(os.path.join(STILLS, "site-after.jpg")).convert("RGB"), cx=0.46, cy=0.55),
    "03-foundation": cover(Image.open(os.path.join(STILLS, "foundation-aerial.jpg")).convert("RGB"), cx=0.5, cy=0.55),
    "04-rcc-columns": cover(clean_sky(vf(56), sky, 0.44), cy=0.62, zoom=1.12),
    "05-beams-and-slabs": cover(vf(110), cy=0.6, zoom=1.06),
    "06-structural-frame": cover(vf(118), cy=0.6, zoom=1.04),
    "07-masonry-walls": cover(vf(136), cy=0.6, zoom=1.04),
    "08-plastering": cover(vf(166), cy=0.72, zoom=1.2),
    "09-windows-and-glass": cover(vf(180), cy=0.6, zoom=1.04),
    "10-exterior-finishing": cover(vf(200), cy=0.6),
    "11-landscaping": cover(vf(220), cy=0.6),
    "12-completed": cover(vf(240), cy=0.6),
}
for name, im in plates.items():
    im.save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True, progressive=True)
    print(name)
