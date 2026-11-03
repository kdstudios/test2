#!/usr/bin/env python3
"""Mini Fort Zombie: build modular zombie parts from the Modern soldier body (raw_*.json exported by export.js).
Outputs js/data/rzombie.js (geometry) and js/data/rzombie-tex.js (atlas textures) + assets/zombie/*.png for painting."""
import json, base64, math, random, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RAW = sys.argv[1] if len(sys.argv) > 1 else 'raw_assault_lo.json'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/home/claude/mfz/MiniFortZombie'
d = json.load(open(RAW)); SB = d['SB']; inv = {v: k for k, v in SB.items()}
P = np.array(d['pos'], 'f4').reshape(-1, 3); N = np.array(d['nor'], 'f4').reshape(-1, 3)
UV = np.array(d['uv'], 'f4').reshape(-1, 2); bone = d['bone']; I = np.array(d['idx'], 'i4').reshape(-1, 3); J = d['joints']
nv = len(P)

# ---------------- part of each vertex (MFZ slots; L = -x side in MFZ space) ----------------
def side(i): return 'L' if P[i, 0] < 0 else 'R'
def tile(i):  # 8x8 atlas tile, image coordinates (flipY)
    return int(UV[i, 0] * 8), int((1 - UV[i, 1]) * 8)
FACE_T = lambda t: 4 <= t[0] <= 5 and t[1] >= 6
GLOVE_T = lambda t: t[0] <= 1 and t[1] >= 6
vpart = [None] * nv; vreg = [0] * nv
REG = dict(face=1, skin=2, shirt=3, sleeve=4, pants=5, shoes=6, gore=7, hair=8)
for i in range(nv):
    b = inv[bone[i]]; t = tile(i); s = side(i); y = P[i, 1]
    if b in ('HEA',) or (b == 'NEC' and FACE_T(t)):
        vpart[i] = 'head'; vreg[i] = REG['face']
    elif b in ('NEC', 'CHE', 'SPI'):
        vpart[i] = 'body'; vreg[i] = REG['shirt']
    elif b == 'PEL':
        vpart[i] = 'body'; vreg[i] = REG['pants'] if y < 1.03 else REG['shirt']
    elif b.startswith('UA') or b.startswith('SHH'):
        vpart[i] = 'arm' + s; vreg[i] = REG['shirt']
    elif b.startswith('EL'):
        el = J['el' + s]; vpart[i] = ('arm' + s) if y >= el[1] else ('fore' + s); vreg[i] = REG['shirt'] if y >= el[1] else REG['sleeve']
    elif b.startswith('FA') or b.startswith('TW'):
        vpart[i] = 'fore' + s; vreg[i] = REG['skin'] if GLOVE_T(t) else REG['sleeve']
    elif b in ('HAL', 'HAR', 'HLS'):
        vpart[i] = 'fore' + s; vreg[i] = REG['skin']
    elif b == 'HLG':
        vpart[i] = None  # second (unused) left-hand form
    elif b[:2] in ('TH', 'KN', 'HP'):
        vpart[i] = 'leg' + s; vreg[i] = REG['pants']
    elif b[:2] == 'SH':
        vpart[i] = 'leg' + s; vreg[i] = REG['shoes'] if (t[1] >= 7 or y < 0.17) else REG['pants']
    elif b[:2] in ('FT', 'TO'):
        vpart[i] = 'leg' + s; vreg[i] = REG['shoes']
    else:
        vpart[i] = 'body'; vreg[i] = REG['shirt']

PARTS = ['body', 'head', 'armL', 'armR', 'foreL', 'foreR', 'legL', 'legR']
PRIO = {p: k for k, p in enumerate(['body', 'legL', 'legR', 'armL', 'armR', 'foreL', 'foreR', 'head'])}
tpart = []
for a, b, c in I:
    ps = [vpart[a], vpart[b], vpart[c]]
    if None in ps: tpart.append(None); continue
    cnt = {}
    for p in ps: cnt[p] = cnt.get(p, 0) + 1
    best = max(cnt.items(), key=lambda kv: (kv[1], -PRIO[kv[0]]))[0]
    tpart.append(best)

# full-mesh edge use, to tell cut edges (interior in the full mesh) from the garment's own openings
from collections import defaultdict
eu = defaultdict(int)
for k, (a, b, c) in enumerate(I):
    if tpart[k] is None: continue
    for e in ((a, b), (b, c), (c, a)): eu[tuple(sorted(e))] += 1

# pivots (MFZ model space, model faces +z): body at y .9; head at the neck; shoulder, elbow, hip joints
piv = {'body': [0, .9, 0], 'head': J['neck'], 'armL': J['shL'], 'armR': J['shR'], 'foreL': J['elL'], 'foreR': J['elR'], 'legL': J['hiL'], 'legR': J['hiR']}
parent = {'body': None, 'head': 'body', 'armL': 'body', 'armR': 'body', 'foreL': 'armL', 'foreR': 'armR', 'legL': None, 'legR': None}

def q16(a, s): return np.clip(np.round(a * s), -32767, 32767).astype('<i2')
def b64(a): return base64.b64encode(a.tobytes()).decode()
GORE_UV = (0.08, 1 - 0.83)  # a plain tile: the vertex colour gives the flesh

out = {}
stats = {}
for pn in PARTS:
    tris = [k for k, p in enumerate(tpart) if p == pn]
    remap = {}; pos = []; nor = []; uv = []; reg = []; idx = []
    def vid(i):
        if i not in remap:
            remap[i] = len(pos); pos.append(P[i]); nor.append(N[i]); uv.append(UV[i]); reg.append(vreg[i])
        return remap[i]
    for k in tris:
        a, b, c = I[k]; idx += [vid(a), vid(b), vid(c)]
    # cut edges -> flesh caps (fan to the loop centroid; winding from the owning triangle reversed)
    pe = defaultdict(list)
    for k in tris:
        a, b, c = I[k]
        for e in ((a, b), (b, c), (c, a)): pe[tuple(sorted(e))].append(e)
    cut = [v[0] for key, v in pe.items() if len(v) == 1 and eu[key] >= 2]
    caps = 0
    if cut:
        # group cut edges into connected loops
        adj = defaultdict(set)
        for a, b in cut: adj[a].add(b); adj[b].add(a)
        seen = set(); groups = []
        for a, b in cut:
            if a in seen: continue
            st = [a]; comp = set()
            while st:
                x = st.pop()
                if x in comp: continue
                comp.add(x); st += list(adj[x])
            seen |= comp; groups.append(comp)
        pc = np.mean([P[i] for i in remap], axis=0)
        for comp in groups:
            if len(comp) < 3: continue
            es = [(a, b) for a, b in cut if a in comp]
            cen = np.mean([P[i] for i in comp], axis=0)
            nrm = cen - pc; ln = np.linalg.norm(nrm); nrm = nrm / ln if ln > 1e-6 else np.array([0, 1, 0], 'f4')
            base = len(pos); pos.append(cen); nor.append(nrm); uv.append(GORE_UV); reg.append(REG['gore'])
            cid = {}
            for a, b in es:
                for v in (a, b):
                    if v not in cid:
                        cid[v] = len(pos); pos.append(P[v] + (cen - P[v]) * 0.04); nor.append(nrm); uv.append(GORE_UV); reg.append(REG['gore'])
                idx += [base, cid[b], cid[a]]; caps += 1
    pos = np.array(pos, 'f4') - np.array(piv[pn], 'f4'); nor = np.array(nor, 'f4'); uv = np.array(uv, 'f4')
    pv = np.array(piv[pn], 'f4'); pp = parent[pn]
    loc = (pv - np.array(piv[pp], 'f4')).tolist() if pp else pv.tolist()
    out[pn] = dict(n=len(pos), piv=[round(x, 4) for x in loc],
                   p=b64(q16(pos, 16000)), nm=b64(np.clip(np.round(nor * 127), -127, 127).astype('i1')),
                   uv=b64(np.clip(np.round(uv * 65535), 0, 65535).astype('<u2')), r=b64(np.array(reg, 'u1')),
                   i=b64(np.array(idx, '<u2')))
    stats[pn] = (len(pos), len(idx) // 3, caps)

# ---------------- accessories (Modern helmet + plate carrier): split onto the same parts, Modern vertex colours kept ----------------
def acc_part(b, x, y):
    s = 'L' if x < 0 else 'R'
    if b in ('HEA', 'NEC') and y > 1.5: return 'head'
    if b[:2] in ('TH', 'KN', 'HP', 'SH', 'FT', 'TO') and not b.startswith('SHH'): return 'leg' + s
    if b.startswith('UA') or b.startswith('SHH'): return 'arm' + s
    if b[:2] in ('FA', 'TW', 'HA', 'HL', 'EL'): return 'fore' + s
    return 'body'
acc = {}
for an, A in d.get('acc', {}).items():
    if not isinstance(A, dict): continue
    aP = np.array(A['pos'], 'f4').reshape(-1, 3); aN = np.array(A['nor'], 'f4').reshape(-1, 3); aU = np.array(A['uv'], 'f4').reshape(-1, 2)
    aC = np.array(A['col'], 'f4').reshape(-1, 3); aI = np.array(A['idx'], 'i4').reshape(-1, 3)
    ap = [acc_part(inv[b], aP[i, 0], aP[i, 1]) for i, b in enumerate(A['bone'])]
    acc[an] = {}
    for pn in PARTS:
        tris = [k for k, (a_, b_, c_) in enumerate(aI) if ap[a_] == pn]
        if not tris: continue
        remap = {}; ids = []
        for k in tris:
            for v in aI[k]:
                if v not in remap: remap[v] = len(remap)
                ids.append(remap[v])
        order = sorted(remap, key=remap.get)
        pos = aP[order] - np.array(piv[pn], 'f4')
        acc[an][pn] = dict(n=len(order), p=b64(q16(pos, 16000)), nm=b64(np.clip(np.round(aN[order] * 127), -127, 127).astype('i1')),
                           uv=b64(np.clip(np.round(aU[order] * 65535), 0, 65535).astype('<u2')), c=b64(np.clip(np.round(aC[order] * 255), 0, 255).astype('u1')),
                           i=b64(np.array(ids, '<u2')))
    print('acc', an, {k: v['n'] for k, v in acc[an].items()})
meta = dict(v=2, src='Modern soldier body (MIT), base + boots (+ helmet, plate carrier), arms-down pose; MFZ split', qp=16000, reg=REG, parts=out, acc=acc)
os.makedirs(OUT + '/js/data', exist_ok=True)
open(OUT + '/js/data/rzombie.js', 'w').write('/* Mini Fort Zombie modular zombie body parts, generated by tools/zombie/build_rz.py from the Modern soldier body. Do not edit by hand. */\nwindow.RZB=' + json.dumps(meta, separators=(',', ':')) + ';\n')
print('parts', stats)

# ---------------- zombie atlas ----------------
rnd = random.Random(7)
A = Image.open('atlas_map.png').convert('RGB'); W = A.width; a = np.asarray(A).astype('f4') / 255
lum = a @ np.array([.299, .587, .114], 'f4')
z = a.copy()
def box(u0, v0, u1, v1): return (slice(int(v0 * W), int(v1 * W)), slice(int(u0 * W), int(u1 * W)))
# cloth tile (was camo): plain worn fabric, mostly flat, weave kept
s = box(0, 0, .75, .75); L = lum[s]; f = .80 + (L - L.mean()) * .32
z[s] = np.repeat(f[..., None], 3, axis=2)
# face tile: neutral luminance, hair darker; the vertex colour tints it (zombie skin)
s = box(.5, .75, .75, 1); L = lum[s]; f = np.clip(.25 + (L - L.min()) / (L.max() - L.min() + 1e-6) * .85, 0, 1)
z[s] = np.repeat(f[..., None], 3, axis=2)
img = Image.fromarray((np.clip(z, 0, 1) * 255).astype('u1'))
# grime + blood on cloth, plain (hands / skin) and face tiles
ov = Image.new('RGBA', img.size, (0, 0, 0, 0)); dr = ImageDraw.Draw(ov)
def splat(cx, cy, r, col, n=9):
    for _ in range(n):
        ox, oy, rr = rnd.gauss(0, r * .6), rnd.gauss(0, r * .6), r * rnd.uniform(.25, .7)
        dr.ellipse([cx + ox - rr, cy + oy - rr, cx + ox + rr, cy + oy + rr], fill=col)
    for _ in range(rnd.randint(0, 3)):  # drips
        x = cx + rnd.uniform(-r, r); dr.line([x, cy, x + rnd.uniform(-3, 3), cy + r * rnd.uniform(1.5, 4)], fill=col, width=max(2, int(r * .18)))
for _ in range(70): splat(rnd.uniform(0, .75 * W), rnd.uniform(0, .75 * W), rnd.uniform(8, 34), (90, 6, 4, rnd.randint(140, 220)))
for _ in range(60): splat(rnd.uniform(0, .75 * W), rnd.uniform(0, .75 * W), rnd.uniform(14, 50), (60, 45, 25, rnd.randint(40, 90)), 6)
for _ in range(40): splat(rnd.uniform(0, .25 * W), rnd.uniform(.75 * W, W), rnd.uniform(6, 22), (110, 8, 6, rnd.randint(150, 230)))  # hands / skin plain tile
fx0, fy0 = .5 * W, .75 * W; T = .25 * W
for _ in range(10): splat(fx0 + T * rnd.uniform(.38, .62), fy0 + T * rnd.uniform(.62, .8), rnd.uniform(4, 9), (120, 10, 8, 210), 5)   # around the mouth
for _ in range(14): splat(fx0 + T * rnd.uniform(.05, .95), fy0 + T * rnd.uniform(.2, .95), rnd.uniform(3, 8), (100, 8, 6, 170), 4)
ov = ov.filter(ImageFilter.GaussianBlur(1.2))
img = Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')
os.makedirs(OUT + '/assets/zombie', exist_ok=True)
img.save(OUT + '/assets/zombie/zombie_albedo.png')
# soldier atlas: the original Modern camo atlas with the same blood + grime
cam = Image.open('atlas_map.png').convert('RGBA'); Image.alpha_composite(cam, ov).convert('RGB').save(OUT + '/assets/zombie/zombie_albedo_camo.png')
# UV template for painting: wireframe of every part's UVs over the atlas
tpl = img.copy().convert('RGB'); td = ImageDraw.Draw(tpl)
colmap = {'body': (255, 255, 0), 'head': (255, 80, 255), 'armL': (0, 255, 255), 'armR': (0, 255, 255), 'foreL': (80, 160, 255), 'foreR': (80, 160, 255), 'legL': (80, 255, 80), 'legR': (80, 255, 80)}
for k, (a_, b_, c_) in enumerate(I):
    p = tpart[k]
    if p is None: continue
    pts = [(UV[i, 0] * W, (1 - UV[i, 1]) * W) for i in (a_, b_, c_)]
    td.line(pts + [pts[0]], fill=colmap[p], width=1)
tpl.save(OUT + '/assets/zombie/zombie_uv_template.png')
Image.open('atlas_normal.png').convert('RGB').resize((512, 512), Image.LANCZOS).save(OUT + '/assets/zombie/zombie_normal.png')
Image.open('atlas_rm.png').convert('RGB').resize((512, 512), Image.LANCZOS).save(OUT + '/assets/zombie/zombie_rm.png')
print('atlas written')
