#!/usr/bin/env python3
"""Clean survivor atlas for the Modern bodies (same UV layout as the zombie atlas, no blood or gore).
   cloth tile: plain worn fabric (weave kept)   face tile: neutral skin luminance with the painted hair and beard flattened away
   (hair, beard and brows are drawn per survivor by the head shader in js/modern/survivors.js), eyes / nose / mouth detail kept.
Usage (from the MiniFortZombie folder):  python3 tools/survivor/build_surv_tex.py <path to Modern atlas_map.png>
Writes assets/survivor/survivor_albedo.png and js/data/rsurv-tex.js (base64 WebP; browsers refuse WebGL textures from file:// pages)."""
import base64, io, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
A = Image.open(sys.argv[1] if len(sys.argv) > 1 else 'atlas_map.png').convert('RGB'); W = A.width
a = np.asarray(A).astype('f4') / 255; lum = a @ np.array([.299, .587, .114], 'f4'); z = a.copy()
def box(u0, v0, u1, v1): return (slice(int(v0 * W), int(v1 * W)), slice(int(u0 * W), int(u1 * W)))
s = box(0, 0, .75, .75); L = lum[s]; f = .84 + (L - L.mean()) * .26          # cloth: light, fairly flat
z[s] = np.repeat(f[..., None], 3, axis=2)
s = box(0, .75, .25, 1); L = lum[s]; f = .86 + (L - L.mean()) * .2            # plain tile (hands / skin pieces)
z[s] = np.repeat(f[..., None], 3, axis=2)
s = box(.5, .75, .75, 1); L = lum[s].copy()
h, w = L.shape; yy, xx = np.mgrid[0:h, 0:w] / np.array([h, w], 'f4')[:, None, None]
keep = np.zeros_like(L)                                                                             # eyes, nose, mouth: keep the painted detail
for (cx, cy, rx, ry) in [(.5, .345, .13, .045), (.5, .66, .09, .04)]:
    keep = np.maximum(keep, np.clip(1.6 - np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2), 0, 1))
ref = np.median(L[(yy > .45) & (yy < .6) & (np.abs(xx - .5) < .12)])                               # cheek skin level
det = np.clip(L / ref, 0, 1.2)
rng = np.random.default_rng(3); noise = ndimage.gaussian_filter(rng.normal(0, 1, L.shape), 1.2) * .025
face = .9 * (1 - keep) + .9 * keep * (1 - (1 - det) * .75) + noise
z[s] = np.repeat(face[..., None], 3, axis=2)
img = Image.fromarray((np.clip(z, 0, 1) * 255).astype('u1')).filter(ImageFilter.GaussianBlur(.4))
os.makedirs(os.path.join(root, 'assets', 'survivor'), exist_ok=True)
img.save(os.path.join(root, 'assets', 'survivor', 'survivor_albedo.png'))
b = io.BytesIO(); img.save(b, 'WEBP', quality=82, method=6)
js = '/* Mini Fort Zombie survivor atlas, packed by tools/survivor/build_surv_tex.py. Do not edit by hand. */\nwindow.RSTEX={map:"data:image/webp;base64,%s"};\n' % base64.b64encode(b.getvalue()).decode()
open(os.path.join(root, 'js', 'data', 'rsurv-tex.js'), 'w').write(js)
print('wrote survivor atlas', len(js) // 1024, 'KB')
