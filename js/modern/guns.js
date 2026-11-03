/* Modern gun geometry (MIT, (c) 2026 BenDBSS), trimmed and wrapped for Mini Fort Zombie. Hand rig, wear shader, camo shader removed. */
(function(){
'use strict';
const THREE=window.THREE;
const _t=s=>s, clamp=(v,a,b)=>(v<a?a:v>b?b:v), TAU0=Math.PI*2;
const GUNTEX={surf:{}}; let GM=null;
const CAMOS={}; const camoMaterials=()=>gunMaterials();
const WEAPONS={};
/* ---- from 01-core.js ---- */
const TAU = Math.PI * 2;
function hyp(x, y) { return Math.sqrt(x * x + y * y); }
function hyp3(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }
const hasKey = (o, k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k);
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, l, dt) => lerp(a, b, 1 - Math.exp(-l * dt));
const V3 = THREE.Vector3;
const _v1 = new V3(), _v2 = new V3(), _v3 = new V3(), _v4 = new V3();
const sl = (c) => Math.pow(c, 2.2);
/* ---- from 06-weapons.js ---- */
const RING_REAR = new THREE.TorusGeometry(0.0092, 0.0024, 8, 24);
const G_BOX = new THREE.BoxGeometry(1, 1, 1), G_CYL = new THREE.CylinderGeometry(1, 1, 1, 14), G_CYL_O = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
function part(parent, geo, mat, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz); parent.add(m); return m;
}
const bx = (p, mat, x, y, z, w, h, d, rx, ry, rz) => part(p, G_BOX, mat, x, y, z, w, h, d, rx, ry, rz);
const cz = (p, mat, x, y, z, r, len, geo = G_CYL) => part(p, geo, mat, x, y, z, r, len, r, Math.PI / 2, 0, 0);
const SHELL_RED = new THREE.MeshStandardMaterial({ color: 0x9c2a1c, roughness: 0.5 });
/* ---- from 06c-models.js ---- */
const RBG = new Map();
function rgeo(w, h, d, r) {
  const k = `${w}|${h}|${d}|${r}`;
  // dimensions gardées pour la version allégée des armes vues de loin (lowPolyGeometry : boîte simple)
  if (!RBG.has(k)) { const g = new THREE.RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4)); g.userData.box = [w, h, d]; RBG.set(k, g); }
  return RBG.get(k);
}
const rb = (p, mat, x, y, z, w, h, d, r = 0.004, rx = 0, ry = 0, rz = 0) => part(p, rgeo(w, h, d, r), mat, x, y, z, 1, 1, 1, rx, ry, rz);
const G_CYL12 = new THREE.CylinderGeometry(1, 1, 1, 20), G_CAP = new THREE.CapsuleGeometry(1, 1, 4, 10), G_TOR = new THREE.TorusGeometry(1, 0.18, 8, 20);
const cy = (p, mat, x, y, z, r, len, rx = Math.PI / 2, ry = 0, rz = 0, geo = G_CYL12) => part(p, geo, mat, x, y, z, r, len, r, rx, ry, rz);
function rail(p, M, x, y, z, len, vertical) {
  // rail Picatinny : semelle et dents
  rb(p, M.dark, x, y, z, vertical ? 0.008 : 0.022, vertical ? 0.022 : 0.008, len, 0.002);
  for (let i = 0; i < Math.floor(len / 0.012); i++) { const zz = z - len / 2 + 0.006 + i * 0.012; if (vertical) bx(p, M.dark, x + Math.sign(x) * 0.005, y, zz, 0.004, 0.024, 0.006); else bx(p, M.dark, x, y + 0.005, zz, 0.024, 0.004, 0.006); }
}
function curvedMag(parent, M, n, len, w, d, curve, mat) {
  // chargeur courbe : un seul profil le long d'un arc (l'arc penche vers l'avant), plaque de talon et nervures sur la face avant
  const N = Math.max(8, n * 2), pts = [], front = [], rear = [], ds = len / N;
  let y = 0, z = 0;
  for (let i = 0; i <= N; i++) {
    const a = curve * i / N, nz = Math.cos(a), ny = -Math.sin(a), h = d / 2;
    front.push([z - nz * h, y - ny * h]); rear.push([z + nz * h, y + ny * h]);
    if (i < N) { y -= Math.cos(a + curve / N / 2) * ds; z -= Math.sin(a + curve / N / 2) * ds; }
  }
  front[0][1] += 0.012; rear[0][1] += 0.012; // le haut dépasse dans le puits
  for (const q of front) pts.push([q[0], q[1], 0]); for (let i = N; i >= 0; i--) pts.push([rear[i][0], rear[i][1], 0]);
  prof(parent, mat || M.poly, pts, w, 0, 0.0035, 0.002);
  const a = curve;
  for (let i = 1; i < n; i += 2) {
    const t = i / n, aa = curve * t, k = Math.round(t * N), q = front[k];
    bx(parent, M.dark, 0, q[1], q[0] - 0.0005, w + 0.002, 0.004, 0.003, aa);
  }
  rb(parent, M.dark, 0, y - 0.006, z, w + 0.004, 0.014, d + 0.008, 0.003, a);
}
const AGRIP_RAKE = 0.5;
/* ---- 06jb-formes.js ---- */
const PROF_GEO = new Map();
function profTrace(s, pts, rc) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const P = pts[(i + n - 1) % n], V = pts[i], N = pts[(i + 1) % n], r0 = V.length > 2 ? V[2] : rc;
    const a = hyp(P[0] - V[0], P[1] - V[1]) || 1e-9, b = hyp(N[0] - V[0], N[1] - V[1]) || 1e-9, r = Math.min(r0, a * 0.5, b * 0.5);
    if (r < 1e-5) { if (i) s.lineTo(V[0], V[1]); else s.moveTo(V[0], V[1]); continue; }
    const sx = V[0] + (P[0] - V[0]) * r / a, sy = V[1] + (P[1] - V[1]) * r / a;
    if (i) s.lineTo(sx, sy); else s.moveTo(sx, sy);
    s.quadraticCurveTo(V[0], V[1], V[0] + (N[0] - V[0]) * r / b, V[1] + (N[1] - V[1]) * r / b);
  }
  s.closePath();
}
function profGeo(pts, w, r, rc, holes) {
  const k = JSON.stringify([pts, w, r, rc, holes]);
  let geo = PROF_GEO.get(k); if (geo) return geo;
  const sh = new THREE.Shape(); profTrace(sh, pts, rc);
  if (holes) for (const h of holes) { const hp = new THREE.Path(); profTrace(hp, h, rc); sh.holes.push(hp); }
  r = Math.min(r, w * 0.45);
  const depth = Math.max(w - 2 * r, 0.0006);
  geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: r > 0.0003, bevelThickness: r, bevelSize: r, bevelOffset: -r, bevelSegments: 2, curveSegments: 4, steps: 1 });
  geo.translate(0, 0, -depth / 2); geo.rotateY(-Math.PI / 2); // forme (x, y) du profil → (z, y) de l'arme, épaisseur selon x
  // coordonnées de texture : plaquage plan selon la face dominante, une répétition tous les ~11 cm (comme les boîtes arrondies)
  const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv;
  for (let i = 0; i < P.count; i++) {
    const nx = Math.abs(N.getX(i)), ny = Math.abs(N.getY(i)), nz = Math.abs(N.getZ(i));
    if (nx >= ny && nx >= nz) U.setXY(i, P.getZ(i) * 9, P.getY(i) * 9); else if (ny >= nz) U.setXY(i, P.getX(i) * 9, P.getZ(i) * 9); else U.setXY(i, P.getX(i) * 9, P.getY(i) * 9);
  }
  geo.userData.low = { pts, w, rc, holes };
  PROF_GEO.set(k, geo); return geo;
}
function profLow(geo) {
  const L = geo.userData.low, k = 'low' + JSON.stringify(L);
  let g = PROF_GEO.get(k); if (g) return g;
  const sh = new THREE.Shape(); profTrace(sh, L.pts, Math.min(L.rc, 0.004));
  if (L.holes) for (const h of L.holes) { const hp = new THREE.Path(); profTrace(hp, h, 0); sh.holes.push(hp); }
  g = new THREE.ExtrudeGeometry(sh, { depth: L.w, bevelEnabled: false, curveSegments: 1, steps: 1 });
  g.translate(0, 0, -L.w / 2); g.rotateY(-Math.PI / 2);
  PROF_GEO.set(k, g); return g;
}
function prof(p, mat, pts, w, x = 0, r = 0.003, rc = 0.004, holes = null) { return part(p, profGeo(pts, w, r, rc, holes), mat, x, 0, 0, 1, 1, 1); }
function profAbove(pts, rc, y) {
  const sh = new THREE.Shape(); profTrace(sh, pts, rc);
  const P = sh.getPoints(6).filter((q, i, a) => !i || q.distanceTo(a[i - 1]) > 1e-6), out = [];
  if (P.length > 1 && P[0].distanceTo(P[P.length - 1]) < 1e-6) P.pop();
  for (let i = 0; i < P.length; i++) {
    const A = P[i], B = P[(i + 1) % P.length];
    if (A.y >= y) out.push([A.x, A.y, 0]);
    if (A.y >= y !== B.y >= y) out.push([A.x + (B.x - A.x) * (y - A.y) / (B.y - A.y), y, 0]);
  }
  return out;
}
function guard(p, mat, zF, zR, yTop, yBot, th, hTop = 0.006, w = 0.006) {
  const rr = Math.min(0.014, Math.abs(yTop - yBot) * 0.45), ri = Math.max(0.001, rr - th);
  const outer = [[zF, yTop, 0], [zF, yBot, rr], [zR, yBot, rr], [zR, yTop, 0]];
  const hole = [[zF + th, yTop - hTop, 0.001], [zF + th, yBot + th, ri], [zR - th, yBot + th, ri], [zR - th, yTop - hTop, 0.001]];
  return prof(p, mat, outer, w, 0, Math.min(0.0015, w * 0.3), 0.002, [hole]);
}
const CONE_GEO = new Map();
function cone(p, mat, x, y, z, rFront, rRear, len, seg = 20, open = false) {
  const k = rRear + '|' + rFront + '|' + seg + '|' + open;
  let geo = CONE_GEO.get(k); if (!geo) { geo = new THREE.CylinderGeometry(rRear, rFront, 1, seg, 1, open); CONE_GEO.set(k, geo); }
  return part(p, geo, mat, x, y, z, 1, len, 1, Math.PI / 2, 0, 0); // le haut du cylindre (rRear) regarde vers +z
}
const SEC_GEO = new Map();
function zSection(p, mat, pts, z0, z1, r = 0.001, o = {}) {
  const holes = o.holes || null, rc = o.rc != null ? o.rc : 0.0015, seg = o.seg || 3, bev = o.bev || 1;
  const k = JSON.stringify([pts, z1 - z0, r, holes, rc, seg, bev]);
  let geo = SEC_GEO.get(k);
  if (!geo) {
    const sh = new THREE.Shape(); profTrace(sh, pts, rc);
    if (holes) for (const h of holes) { const hp = new THREE.Path(); profTrace(hp, h, rc); sh.holes.push(hp); }
    const depth = Math.max(z1 - z0 - 2 * r, 0.0005);
    geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelOffset: -r, bevelSegments: bev, curveSegments: seg, steps: 1 });
    geo.translate(0, 0, -depth / 2);
    const P = geo.attributes.position, N = geo.attributes.normal, U = geo.attributes.uv; // plaquage plan, comme profGeo
    for (let i = 0; i < P.count; i++) {
      const nx = Math.abs(N.getX(i)), ny = Math.abs(N.getY(i)), nz = Math.abs(N.getZ(i));
      if (nx >= ny && nx >= nz) U.setXY(i, P.getZ(i) * 9, P.getY(i) * 9); else if (ny >= nz) U.setXY(i, P.getX(i) * 9, P.getZ(i) * 9); else U.setXY(i, P.getX(i) * 9, P.getY(i) * 9);
    }
    geo.userData.sec = { pts, holes, rc, depth: z1 - z0 };
    SEC_GEO.set(k, geo);
  }
  return part(p, geo, mat, 0, 0, (z0 + z1) / 2, 1, 1, 1);
}
function secLow(geo) {
  const L = geo.userData.sec, k = 'low' + JSON.stringify(L);
  let g = SEC_GEO.get(k); if (g) return g;
  const sh = new THREE.Shape(); profTrace(sh, L.pts, Math.min(L.rc, 0.004));
  if (L.holes) for (const h of L.holes) { const hp = new THREE.Path(); profTrace(hp, h, Math.min(L.rc, 0.004)); sh.holes.push(hp); }
  g = new THREE.ExtrudeGeometry(sh, { depth: L.depth, bevelEnabled: false, curveSegments: 1, steps: 1 });
  g.translate(0, 0, -L.depth / 2);
  SEC_GEO.set(k, g); return g;
}
const RING_GEO = new Map();
function ringGeo(rOut, rIn, z0, z1, y, rr, seg, cut) {
  const k = JSON.stringify([rOut, rIn, z1 - z0, rr, seg, cut, cut ? [z0, y] : 0]);
  let geo = RING_GEO.get(k); if (geo) return geo;
  const h = (z1 - z0) / 2, pts = [];
  const arc = (cr, cz, a0) => { for (let i = 0; i <= (rr > 0 ? 3 : 0); i++) { const a = a0 + i / 3 * Math.PI / 2; pts.push(new THREE.Vector2(cr + Math.cos(a) * rr, cz + Math.sin(a) * rr)); } };
  arc(rIn + rr, -h + rr, Math.PI); arc(rOut - rr, -h + rr, Math.PI * 1.5); arc(rOut - rr, h - rr, 0); arc(rIn + rr, h - rr, Math.PI / 2); pts.push(pts[0].clone());
  geo = new THREE.LatheGeometry(pts, seg); geo.rotateX(Math.PI / 2); // axe du tour (y) : axe du canon, l'arrière vers +z
  if (cut) {
    const [ya, za, yb, zb] = cut, s = (za - zb) / (ya - yb), zc = (z0 + z1) / 2, L = hyp(1, s), P = geo.attributes.position, N = geo.attributes.normal;
    for (let i = 0; i < P.count; i++) {
      const z = P.getZ(i), w = (h - z) / (2 * h);
      P.setZ(i, z + w * (za + (P.getY(i) + y - ya) * s - zc + h));
      const nz = N.getZ(i);
      if (nz < 0) { const v = _v1.set(N.getX(i), N.getY(i) - nz * s / L, nz / L).normalize(); N.setXYZ(i, v.x, v.y, v.z); }
    }
    geo.computeBoundingBox(); geo.computeBoundingSphere();
  }
  geo.userData.ring = [rOut, rIn, z0, z1, y, 0, 12, cut];
  RING_GEO.set(k, geo); return geo;
}
function zRing(p, mat, rOut, rIn, z0, z1, y, o = {}) { return part(p, ringGeo(rOut, rIn, z0, z1, y, o.rr || 0, o.seg || 32, o.cut || null), mat, 0, y, (z0 + z1) / 2, 1, 1, 1); }
const IRON = { ring: 0.0075, foot: 0.035, wing: 0.009, post: 0.0045, ear: 0.0034, hole: { rifle: 0.095, smg: 0.13 } };
const IRON_K = 2 * Math.tan(THREE.MathUtils.degToRad(22));
function ironW(c, z, f) { return f * IRON_K * (c.info.adsZ - z); }
const IRON_GEO = new Map();
function ironRingGeo(r, t, dep) {
  const k = [r, t, dep].map((v) => v.toFixed(5)).join('|');
  let geo = IRON_GEO.get(k); if (geo) return geo;
  const h = dep / 2, R = r + t, f = r + Math.min(t * 0.8, dep * 0.3);
  const P = [[R, -h], [R, h], [R, h], [r, h], [r, h], [f, -h], [f, -h], [R, -h]].map((q) => new THREE.Vector2(q[0], q[1]));
  geo = new THREE.LatheGeometry(P, 40); geo.rotateX(Math.PI / 2); // axe du tour (y) : axe du canon, face arrière vers l'œil (+z)
  IRON_GEO.set(k, geo); return geo;
}
function ironRing(c, z, hole) {
  const t = ironW(c, z, IRON.ring), r = ironW(c, z, hole) / 2;
  part(c.g, ironRingGeo(r, t, 0.0025), c.M.sight, 0, c.info.sightY, z, 1, 1, 1);
  return c.info.sightY - r - t * 0.4;
}
function ironFoot(c, mat, z, y0, y1, dep) { return bx(c.g, mat, 0, (y0 + y1) / 2, z, ironW(c, z, IRON.foot), y1 - y0, dep); }
function gripProf(p, mat, zT, yT, zB, yB, d, w = 0.032, bulge = 0.003) {
  const dz = zB - zT, dy = yB - yT, L = hyp(dz, dy), ux = dz / L, uy = dy / L, nx = -uy, ny = ux, h = d / 2;
  const P = (t, off) => [zT + ux * t * L + nx * off, yT + uy * t * L + ny * off];
  return prof(p, mat, [P(0, -h), P(0, h), P(0.4, h + bulge), P(0.88, h + bulge * 0.4), P(1, h + 0.002, 0.004), P(1, -h - 0.001, 0.004), P(0.7, -h - bulge * 0.2), P(0.3, -h + bulge * 0.4)], w, 0, 0.003, 0.006);
}
/* ---- 06j-modeles.js ---- */
const GUN_MODELS = {};
function defineGun(id, fam, build) { GUN_MODELS[id] = { id, fam, build }; }
const _gunSpecs = {};
function gunKey(model, att, camo) {
  const a = (att || []).slice().sort((x, y) => ATT_SLOTS.indexOf(ATT[x].slot) - ATT_SLOTS.indexOf(ATT[y].slot));
  return model + (a.length || camo ? '~' + a.join('.') : '') + (camo ? '~' + camo : '');
}
function gunSpec(key) {
  let s = hasKey(_gunSpecs, key) ? _gunSpecs[key] : null; if (s) return s;
  const [model, a = '', camo = ''] = key.split('~');
  const att = a ? a.split('.').filter((id) => hasKey(ATT, id)) : [], A = {};
  for (const id of att) A[ATT[id].slot] = id;
  return (_gunSpecs[key] = { key, model, att, A, camo: camo && hasKey(CAMOS, camo) ? camo : null });
}
function gunFam(key) { return GUN_MODELS[gunSpec(key).model].fam; }
function buildGunModel(key) {
  const spec = gunSpec(key), B = GUN_MODELS[spec.model], M = camoMaterials(spec.camo), g = new THREE.Group();
  const info = {
    group: g, muzzle: new THREE.Object3D(), eject: new THREE.Object3D(), mag: new THREE.Group(), magHome: new V3(), gripR: new V3(), gripL: new V3(),
    sightY: 0.1, adsZ: 0.26, bolt: null, kind: B.fam, model: spec.model, key, spec, keep: [], mount: {}, gripDef: null, trigDef: null,
    butt: null, magP: null, tubeFed: false, pump: null, laser: null, magExt: 1, lFrame: null,
  };
  g.add(info.muzzle, info.eject, info.mag);
  const A = spec.A;
  const c = { g, M, info, A, spec, bl: A.barrel === 'long' ? 0.07 : A.barrel === 'short' ? -0.07 : 0, stock: A.stock || null, optic: !!A.optic };
  B.build(c);
  attachAll(c); // accessoires (06p-accessoires.js) : optique, bouche, sous-canon, laser, chargeur
  if (info.buildMag) {
    const raw = info.buildMag, ext = info.magExt;
    info.buildMag = (parent) => raw(parent, ext);
    info.buildMag(info.mag);
  }
  info.mag.position.copy(info.magHome);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return info;
}
/* ---- 06k-modeles-base.js ---- */
defineGun('m4', 'rifle', (c) => {
  const { g, M, info, bl } = c, K = M.rubber, sx2 = [-1, 1];
  const S = 0.0009, D = 0.0549, P = (x, y, r) => { const q = [-0.038 + (x - 483) * S, 0.037 - (y - 197) * S]; if (r !== undefined) q.push(r); return q; };
  const Q = (x, y, r) => { const q = P(x, y, r); q[0] += D; return q; }, Pz = (x) => P(x, 0)[0], Qz = (x) => Pz(x) + D, Py = (y) => P(0, y)[1];
  const by = 0.037, rH = 0.0328;

  // ----- boîtier supérieur : corps, rail (dents sur toute la longueur), levier d'armement ; à droite, fenêtre d'éjection, volet,
  // déflecteur, assistance à la fermeture -----
  prof(g, M.metal, [P(349, 168, 0.002), Q(565, 166, 0.003), Q(569, 172, 0.003), Q(569, 214, 0.002), P(352, 216, 0.002), P(349, 210, 0.002)], 0.032, 0, 0.003, 0.003);
  rail(g, M, 0, 0.066, (Pz(352) + Qz(548)) / 2, Qz(548) - Pz(352));
  rb(g, M.metal, 0, Py(163), Qz(556), 0.03, 0.007, 0.022, 0.002);
  rb(g, M.metal, -0.018, Py(163), Qz(560), 0.008, 0.006, 0.012, 0.002);
  rb(g, K, 0.0161, Py(184), (Pz(395) + Pz(465)) / 2, 0.0012, Py(172) - Py(196), Pz(465) - Pz(395), 0.0006);
  rb(g, M.dark, 0.0168, Py(196), (Pz(395) + Pz(465)) / 2, 0.0014, 0.0028, Pz(465) - Pz(395) + 0.004, 0.0006);
  rb(g, M.metal, 0.0172, Py(176), Pz(472) + 0.004, 0.006, 0.012, 0.012, 0.003);
  cy(g, M.metal, 0.0185, Py(185), Qz(538), 0.0072, 0.03);
  part(g, new THREE.SphereGeometry(1, 10, 8), M.dark, 0.0185, Py(185), Qz(538) + 0.015, 0.008, 0.008, 0.008);

  // ----- boîtier inférieur : puits de chargeur évasé, creux du pontet, arrière sous le tube ; pontet ; arrêtoir, sélecteur, goupilles,
  // bouton du chargeur (droite) -----
  prof(g, M.metal, [P(352, 216, 0.002), Q(578, 216, 0.002), Q(587, 220, 0.002), Q(587, 232, 0.002), Q(578, 236, 0.004), Q(559, 240, 0.006), Q(549, 250, 0.004), Q(500, 250, 0.002),
    P(449, 250, 0.002), P(447, 262, 0.002), P(445, 284, 0.003), P(441, 293, 0.003), P(368, 289, 0.003), P(358, 284, 0.003), P(366, 276, 0.002), P(366, 240, 0.004), P(356, 230, 0.002)], 0.03, 0, 0.0025, 0.002);
  prof(g, M.metal, [P(444, 283, 0.002), Q(507, 283, 0.003), Q(516, 291, 0.002), P(441, 292, 0.003)], 0.009, 0, 0.0016, 0.002);
  rb(g, M.dark, 0, Py(266), Pz(486), 0.006, Py(250) - Py(282) + 0.006, 0.005, 0.002, 0.25); // détente
  { const a = P(425, 206), b = P(429, 238); rb(g, M.dark, -0.0157, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2, 0.0028, a[1] - b[1], 0.009, 0.0015, 0.05); }
  { const q = Q(527, 231); cy(g, M.dark, -0.0155, q[1], q[0], 0.0045, 0.002, 0, 0, Math.PI / 2); rb(g, M.dark, -0.017, q[1] + 0.0045, q[0] - 0.001, 0.0022, 0.009, 0.004, 0.001, -0.5); }
  for (const z of [Pz(357), Qz(568)]) cy(g, M.dark, 0, Py(232), z, 0.003, 0.0312, 0, 0, Math.PI / 2);
  cy(g, M.dark, 0.016, Py(228), Pz(440), 0.0042, 0.003, 0, 0, Math.PI / 2);
  // poignée A2 (place et angle de la main du jeu : axe incliné de 0,33 rad, GA(d, b) : d le long de l'axe vers le bas depuis le dessous
  // du boîtier, b vers l'arrière) : devant presque droit sous l'index et le majeur, ergot entre le majeur et l'annulaire (aux deux tiers), bas évasé
  // et talon qui recule, dos bombé qui rejoint le boîtier ; plaquettes quadrillées en léger relief sur les flancs
  const ga = 0.33, GA = (d, b, r) => { const q = [0.0506 + Math.sin(ga) * d + Math.cos(ga) * b, -0.0107 - Math.cos(ga) * d + Math.sin(ga) * b]; if (r !== undefined) q.push(r); return q; };
  prof(g, M.poly, [GA(-0.006, -0.019, 0.002), GA(0.004, -0.0215, 0.006), GA(0.03, -0.0222, 0.012), GA(0.049, -0.0236, 0.006), GA(0.057, -0.0285, 0.004), GA(0.064, -0.0262, 0.004),
    GA(0.072, -0.0215, 0.008), GA(0.09, -0.0212, 0.01), GA(0.1, -0.0232, 0.004), GA(0.106, -0.022, 0.004), GA(0.108, 0.0, 0.006), GA(0.105, 0.0262, 0.004), GA(0.096, 0.0262, 0.006),
    GA(0.07, 0.0226, 0.012), GA(0.035, 0.0222, 0.012), GA(0.012, 0.023, 0.008), GA(0.001, 0.027, 0.004), GA(-0.006, 0.03, 0.002)], 0.031, 0, 0.0045, 0.003);
  for (const sx of sx2) {
    const pl = prof(g, M.grip, [GA(0.012, -0.0168, 0.004), GA(0.036, -0.0182, 0.006), GA(0.058, -0.0172, 0.006), GA(0.094, -0.0168, 0.004), GA(0.097, 0.0, 0.004), GA(0.093, 0.0185, 0.004),
      GA(0.012, 0.018, 0.004), GA(0.008, 0.0, 0.004)], 0.0012, sx * 0.0152, 0.0004, 0.004);
    pl.geometry = pl.geometry.clone(); const uv = pl.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2.5, uv.getY(i) * 2.5); // quadrillage fin
  }
  // ----- avant : bague et chapeau des garde-mains, garde-mains ronds à nervures, canon, guidon triangulaire, cache-flamme -----
  cz(g, M.dark, 0, by, (Pz(326) + Pz(349)) / 2, 0.0234, Pz(349) - Pz(326));
  cz(g, M.dark, 0, by, Pz(330), 0.0262, 0.004);
  cz(g, M.poly, 0, by, (Pz(149) + Pz(324)) / 2, rH, Pz(324) - Pz(149), new THREE.CylinderGeometry(1, 1, 1, 18));
  for (const z of [Pz(152), Pz(321)]) cz(g, M.poly, 0, by, z, rH + 0.0012, 0.006); // rebords des deux bouts
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) * TAU / 8; bx(g, M.poly, Math.sin(a) * rH, by + Math.cos(a) * rH, (Pz(158) + Pz(316)) / 2, 0.0035, 0.0035, Pz(316) - Pz(158), 0, 0, -a); }
  for (let k = 0; k < 9; k++) cz(g, K, 0, by, Pz(168 + k * 19), rH + 0.0003, 0.0028, G_CYL_O); // rainures entre les nervures
  cz(g, M.dark, 0, by, (Pz(138) + Pz(148)) / 2, 0.0216, Pz(148) - Pz(138));
  const bv = bl < 0 ? bl * 0.45 : bl, tip = Pz(16) - bv;
  cz(g, M.metal, 0, by, (tip + Pz(352)) / 2, 0.0075, Pz(352) - tip);
  if (!c.optic) {
    // bloc de gaz et guidon triangulaire : jambe avant, rampe arrière, fenêtre ; au-dessus, deux oreilles et, entre elles, la lame du
    // guidon, dont la pointe est sur la ligne de mire (vue de derrière : la lame fine dans un U, comme sur la vraie arme) ; tenon de
    // baïonnette
    prof(g, M.dark, [P(86, 214, 0.003), P(86, 184, 0.002), P(88, 146, 0.002), P(116, 146, 0.002), P(140, 180, 0.003), P(141, 214, 0.003)], 0.018, 0, 0.002, 0.002,
      [[P(99, 154, 0.002), P(125, 181, 0.002), P(95, 181, 0.002)]]);
    for (const sx of sx2) prof(g, M.dark, [P(88, 147), P(88, 118, 0.001), P(101, 118, 0.001), P(116, 147)], 0.0018, sx * 0.0065, 0.0005, 0.001);
    prof(g, M.dark, [P(91, 147), P(92, 123, 0.0005), P(97, 123, 0.0005), P(99, 147)], 0.0024, 0, 0.0004, 0.0006);
    prof(g, M.dark, [P(80, 207), P(98, 207), P(98, 222, 0.002), P(82, 222, 0.002)], 0.008, 0, 0.0014, 0.002);
    part(g, G_TOR, M.metal, 0, Py(232), Pz(134), 0.011, 0.011, 0.011, 0, Math.PI / 2, 0);
  } else cz(g, M.dark, 0, by + 0.002, Pz(114), 0.0135, Pz(140) - Pz(88)); // bloc de gaz bas : le guidon ne gêne pas l'optique
  if (!c.A.muzzle) {
    cz(g, M.dark, 0, by, tip + 0.0155, 0.0099, 0.031);
    for (let k = 0; k < 4; k++) { const a = Math.PI / 2 + (k - 1.5) * 0.75; bx(g, K, Math.sin(a) * 0.0097, by + Math.cos(a) * 0.0097, tip + 0.012, 0.0028, 0.0012, 0.017, 0, 0, -a); }
    cz(g, K, 0, by, tip - 0.0001, 0.0062, 0.0006);
  }

  // ----- tube de crosse, bague, crosse télescopique (variantes : sans crosse, embout ; renforcée, joue) -----
  cz(g, M.dark, 0, by, Qz(573), 0.0172, Qz(578) - Qz(568));
  let butt;
  if (c.stock === 'none') {
    cz(g, M.metal, 0, by, (Qz(578) + 0.235) / 2, 0.0149, 0.235 - Qz(578));
    rb(g, K, 0, by, 0.24, 0.034, 0.034, 0.012, 0.008);
    butt = 0.246;
  } else {
    cz(g, M.metal, 0, by, (Qz(578) + Qz(740)) / 2, 0.0149, Qz(740) - Qz(578));
    prof(g, M.poly, [Q(592, 173, 0.003), Q(760, 174, 0.004), Q(776, 170, 0.002), Q(772, 250, 0.004), Q(766, 280, 0.004), Q(762, 312, 0.004), Q(758, 320, 0.002), Q(742, 316, 0.003),
      Q(740, 292, 0.004), Q(732, 280, 0.004), Q(713, 274, 0.004), Q(696, 262, 0.004), Q(687, 256, 0.004), Q(635, 250, 0.004), Q(627, 244, 0.003), Q(627, 226, 0.003), Q(592, 226, 0.003)],
    0.04, 0, 0.004, 0.004, [[Q(717, 262, 0.002), Q(722, 262, 0.002), Q(730, 279, 0.002), Q(719, 279, 0.002)]]);
    for (let k = 0; k < 5; k++) for (const y of [201, 209, 217]) for (const sx of sx2) rb(g, K, sx * 0.0202, Py(y), Qz(622 + k * 33), 0.0012, 0.0036, 0.025, 0.0014);
    rb(g, M.dark, 0, Py(258), Qz(656), 0.012, 0.012, 0.012, 0.003);
    rb(g, K, 0, Py(245), Qz(773), 0.042, Py(172) - Py(318), 0.008, 0.003);
    part(g, G_TOR, M.metal, 0, Py(322), Qz(748), 0.01, 0.01, 0.01, 0, Math.PI / 2, 0);
    if (c.stock === 'heavy') rb(g, M.poly, 0, Py(166), Qz(690), 0.034, 0.016, 0.1, 0.006);
    butt = Qz(776) + 0.004;
  }
  info.butt = [0, 0.01, butt];

  // ----- organes de visée : hausse repliable relevée, sur l'arrière du rail : semelle, montant, œilleton fin et deux oreilles de
  // protection (fines : la visée reste dégagée ; traits en fraction de l'écran, 06jb-formes.js) ; rien si une optique les remplace -----
  const sy = Py(123), zr = Qz(528);
  info.sightY = sy; info.adsZ = zr + 0.19; // ligne de mire : centre de l'œilleton et pointe de la lame du guidon
  if (!c.optic) {
    rb(g, M.dark, 0, 0.0765, zr, 0.03, 0.008, 0.03, 0.002);
    ironFoot(c, M.dark, zr, 0.0795, ironRing(c, zr, IRON.hole.rifle), 0.02);
    for (const sx of sx2) bx(g, M.dark, sx * 0.0102, (0.0795 + sy - 0.001) / 2, zr, ironW(c, zr, IRON.wing), sy - 0.001 - 0.0795, 0.006);
  }

  // ----- chargeur : courbe, en aluminium gris -----
  info.magHome.set(0, -0.021, -0.11);
  info.buildMag = (parent, ext) => curvedMag(parent, M, 5, 0.112 * ext, 0.026, 0.062, 0.28, M.gray);
  info.magAxis = new V3(0, -0.99, -0.12); info.magGrip = new V3(0, -0.07, -0.012);

  // ----- mains, visée, montages -----
  info.gripR.set(0, -0.0282, 0.062); info.gripL.set(0, by, -0.235);
  info.mount.optic = { y: 0.071, z: (Pz(352) + Qz(548)) / 2 - 0.01, len: Qz(548) - Pz(352) - 0.02, D: 0.2675 };
  info.mount.muzzle = { x: 0, y: by, z: tip, r: 0.0075 };
  // rails d'accessoires : sous les garde-mains et sur leur flanc gauche, posés seulement si un accessoire les occupe
  if (c.A.under) rail(g, M, 0, by - rH + 0.0006, -0.27, 0.13);
  info.mount.under = { y: by - rH - 0.0034, z: -0.27, len: 0.13 };
  if (c.A.side) rail(g, M, -(rH + 0.0016), by, -0.3, 0.07, true);
  info.mount.side = { x: -(rH + 0.0056), y: by, z: -0.3 };
  info.muzzle.position.set(0, by, tip - 0.01); info.eject.position.set(0.02, Py(184), (Pz(395) + Pz(465)) / 2);
  info.gripDef = {
    R: [{ c: [0, -0.0382, 0.06], h: [0.0155, 0.0525, 0.022], r: 0.01, rx: -0.33 }, { c: [0, 0.006, -0.04], h: [0.015, 0.017, 0.12], r: 0.006 }],
    L: [{ c: [0, by, -0.26], h: [rH, rH, 0.088], r: rH - 0.002 }, { c: [0, by, (Pz(326) + Pz(349)) / 2], h: [0.0234, 0.0234, 0.012], r: 0.01 }],
  };
  info.trigDef = { at: [0.004, -0.0242, -0.046], xTip: -0.004, guard: [{ c: [0, Py(287), (Pz(444) + Qz(507)) / 2], h: [0.0045, 0.0045, (Qz(507) - Pz(444)) / 2], r: 0.002 },
    { c: [0, Py(268), Pz(446)], h: [0.004, 0.017, 0.003], r: 0.002 }, { c: [0, Py(268), Pz(405)], h: [0.015, 0.024, 0.036], r: 0.006 }, { c: [0, Py(266), Pz(486)], h: [0.003, 0.015, 0.003], r: 0.002, rx: 0.25 }] };
});
defineGun('mp5', 'smg', (c) => {
  const { g, M, info } = c, bl = Math.max(c.bl, -0.03);
  // boîtier embouti, tube d'armement, rainure des flancs, fenêtre d'éjection, levier d'armement et sa fente
  prof(g, M.dark, [[-0.216, 0.056, 0.003], [0.04, 0.056, 0.003], [0.04, 0.006, 0.003], [-0.216, 0.006, 0.003]], 0.042, 0, 0.003, 0.003);
  cy(g, M.dark, 0, 0.065, -0.139, 0.0095, 0.358);
  for (const sx of [-1, 1]) rb(g, M.rubber, sx * 0.0213, 0.034, -0.074, 0.0016, 0.012, 0.2, 0.004);
  rb(g, M.rubber, 0.0213, 0.046, -0.09, 0.0016, 0.016, 0.05, 0.002);
  rb(g, M.rubber, -0.0096, 0.064, -0.272, 0.0016, 0.004, 0.08, 0.0008);
  rb(g, M.metal, -0.014, 0.068, -0.3, 0.012, 0.004, 0.006, 0.0015);
  cy(g, M.dark, -0.025, 0.07, -0.3, 0.0068, 0.012, 0, 0, Math.PI / 2);
  // garde-main fin et ses trous ronds, patte avant sous le canon
  prof(g, M.poly, [[-0.33, 0.054, 0.008], [-0.214, 0.056, 0.004], [-0.214, 0.006, 0.004], [-0.33, 0.01, 0.008]], 0.05, 0, 0.006, 0.006);
  for (const sx of [-1, 1]) for (const [z, y] of [[-0.282, 0.044], [-0.242, 0.044], [-0.302, 0.026], [-0.262, 0.026]]) cy(g, M.rubber, sx * 0.0252, y, z, 0.0078, 0.002, 0, 0, Math.PI / 2);
  prof(g, M.dark, [[-0.347, 0.03, 0.002], [-0.329, 0.03, 0.002], [-0.329, -0.012, 0.003], [-0.335, -0.017, 0.003], [-0.347, -0.014, 0.003]], 0.012, 0, 0.002, 0.002);
  // embase du guidon (tient le tube et le canon), canon, cache-flamme à trois ergots (remplacé par le dispositif de bouche)
  prof(g, M.dark, [[-0.347, 0.074, 0.003], [-0.31, 0.074, 0.003], [-0.31, 0.04, 0.003], [-0.347, 0.024, 0.003]], 0.022, 0, 0.003, 0.003);
  const tip = -0.386 - bl;
  cy(g, M.metal, 0, 0.03, (-0.346 + tip) / 2, 0.0065, Math.abs(tip + 0.346));
  if (!c.A.muzzle) {
    cy(g, M.dark, 0, 0.03, tip + 0.012, 0.0098, 0.024);
    for (let i = 0; i < 3; i++) bx(g, M.metal, Math.cos(i * 2.1) * 0.0105, 0.03 + Math.sin(i * 2.1) * 0.0105, tip + 0.018, 0.004, 0.004, 0.01);
  }
  // guidon sous tunnel et dioptre à tambour ; rail à griffes posé sur le tube s'il y a une optique. L'œil est à 10,5 cm du dioptre :
  // son anneau, petit et fin, entoure le tunnel du guidon (deux cercles concentriques, la pointe au centre) ; ses ailes, minces et
  // peu profondes, ne montrent plus leur flanc
  info.sightY = 0.088; info.adsZ = 0.105;
  if (!c.optic) {
    bx(g, M.dark, 0, 0.078, -0.331, 0.006, 0.01, 0.012);
    cz(g, M.dark, 0, 0.088, -0.331, 0.013, 0.016, G_CYL_O).material = M.tube;
    bx(g, M.sight, 0, 0.081, -0.331, ironW(c, -0.331, IRON.post), 0.014, 0.004);
    bx(g, M.dark, 0, 0.0765, 0.0, 0.018, 0.006, 0.024);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0085, 0.087, 0.0, ironW(c, 0, IRON.wing), 0.022, 0.006); // ailes, sur l'embase
    ironFoot(c, M.dark, 0, 0.079, ironRing(c, 0, IRON.hole.smg), 0.008);
  } else {
    rb(g, M.dark, 0, 0.0775, -0.07, 0.026, 0.008, 0.18, 0.002);
    for (let i = 0; i < 14; i++) bx(g, M.dark, 0, 0.0825, -0.15 + i * 0.012, 0.026, 0.004, 0.006);
  }
  // embout arrière du boîtier (porte la crosse), anneau de bretelle
  prof(g, M.dark, [[0.036, 0.074, 0.003], [0.082, 0.074, 0.006], [0.086, 0.062, 0.004], [0.086, 0.004, 0.004], [0.036, 0.002, 0.003]], 0.04, 0, 0.003, 0.004);
  part(g, G_TOR, M.metal, -0.021, 0.004, 0.08, 0.008, 0.008, 0.008, 0, Math.PI / 2, 0);
  // carcasse en polymère : puits de chargeur, palette, pontet arrondi, détente, sélecteur, goupilles, poignée inclinée
  prof(g, M.dark, [[-0.182, 0.008, 0.002], [-0.124, 0.008, 0.002], [-0.124, -0.044, 0.004], [-0.182, -0.044, 0.004]], 0.034, 0, 0.003, 0.003);
  rb(g, M.metal, 0, -0.042, -0.122, 0.012, 0.032, 0.004, 0.0015, -0.2);
  prof(g, M.poly, [[-0.128, 0.008, 0.002], [0.044, 0.008, 0.004], [0.044, -0.03, 0.006], [0.02, -0.056, 0.004], [-0.104, -0.048, 0.006], [-0.128, -0.04, 0.004]], 0.036, 0, 0.003, 0.004);
  prof(g, M.poly, [[-0.112, -0.044, 0.004], [-0.09, -0.084, 0.012], [-0.016, -0.084, 0.01], [0.004, -0.06, 0.004], [0.006, -0.044, 0]], 0.012, 0, 0.002, 0.004,
    [[[-0.1, -0.046, 0.002], [-0.084, -0.076, 0.008], [-0.02, -0.076, 0.007], [-0.006, -0.058, 0.003], [-0.006, -0.046, 0]]]);
  rb(g, M.metal, 0, -0.06, -0.058, 0.006, 0.024, 0.006, 0.002, 0.18);
  cy(g, M.metal, -0.0185, -0.012, -0.034, 0.007, 0.004, 0, 0, Math.PI / 2);
  rb(g, M.metal, -0.0195, -0.026, -0.031, 0.003, 0.026, 0.006, 0.001, -0.2);
  for (const [z, y] of [[0.05, 0.005], [-0.12, -0.02]]) cy(g, M.metal, 0, y, z, 0.0048, 0.0392, 0, 0, Math.PI / 2);
  gripProf(g, M.poly, 0.025, -0.02, 0.066, -0.144, 0.048, 0.034, 0.004);
  // crosse rétractable : deux tiges et plaque de couche recourbée (variantes : sans crosse, embout ; renforcée, crosse fixe)
  let butt;
  if (c.stock === 'none') {
    rb(g, M.rubber, 0, 0.038, 0.089, 0.04, 0.06, 0.006, 0.003);
    butt = 0.092;
  } else if (c.stock === 'heavy') {
    prof(g, M.poly, [[0.084, 0.07, 0.004], [0.13, 0.072, 0.01], [0.262, 0.074, 0.006], [0.262, -0.05, 0.006], [0.19, -0.03, 0.012], [0.1, -0.006, 0.006], [0.084, 0.0, 0.004]], 0.044, 0, 0.004, 0.004);
    rb(g, M.rubber, 0, 0.012, 0.266, 0.046, 0.12, 0.008, 0.004);
    butt = 0.27;
  } else {
    for (const sx of [-1, 1]) cy(g, M.metal, sx * 0.0155, 0.031, 0.161, 0.0055, 0.154);
    prof(g, M.dark, [[0.226, 0.05, 0.004], [0.262, 0.052, 0.006], [0.264, 0.035, 0.004], [0.258, -0.07, 0.006], [0.252, -0.078, 0.004], [0.238, -0.075, 0.006], [0.238, 0.02, 0.006], [0.226, 0.03, 0.004]], 0.044, 0, 0.004, 0.005);
    rb(g, M.rubber, 0, -0.015, 0.2625, 0.042, 0.095, 0.006, 0.003, 0.05);
    butt = 0.266;
  }
  info.butt = [0, 0.0, butt];
  // chargeur courbe : haut dans le puits, l'arc penche vers l'avant
  info.magHome.set(0, -0.036, -0.153);
  info.buildMag = (parent, ext) => curvedMag(parent, M, 6, 0.165 * ext, 0.024, 0.036, 0.5, M.dark);
  info.magAxis = new V3(0, -0.99, -0.14); info.magGrip = new V3(0, -0.06, -0.011);
  info.gripR.set(0, -0.07, 0.047); info.gripL.set(0, 0.03, -0.262);
  info.mount.optic = { y: 0.083, z: -0.07, len: 0.18, D: 0.22 };
  info.mount.muzzle = { x: 0, y: 0.03, z: tip, r: 0.0075 };
  info.mount.under = { y: 0.0075, z: -0.272, len: 0.1 };
  info.mount.side = { x: -0.025, y: 0.03, z: -0.3 };
  info.muzzle.position.set(0, 0.03, tip - 0.01); info.eject.position.set(0.022, 0.046, -0.09);
  info.gripDef = {
    R: [{ c: [0, -0.075, 0.046], h: [0.017, 0.055, 0.024], r: 0.01, rx: -0.32 }, { c: [0, -0.02, -0.04], h: [0.018, 0.03, 0.085], r: 0.008 }],
    // garde-main (trous compris), tube d'armement, patte avant sous le canon (le pouce tendu vers la bouche s'y arrête)
    L: [{ c: [0, 0.031, -0.272], h: [0.0265, 0.025, 0.058], r: 0.006 }, { c: [0, 0.065, -0.27], h: [0.0095, 0.0095, 0.05], r: 0.009 }, { c: [0, 0.007, -0.338], h: [0.006, 0.024, 0.009], r: 0.002 }],
  };
  info.trigDef = { at: [0.004, -0.064, -0.07], xTip: -0.004, guard: [{ c: [0, -0.08, -0.05], h: [0.006, 0.004, 0.04], r: 0.002 }, { c: [0, -0.062, -0.1], h: [0.006, 0.018, 0.006], r: 0.002 },
    { c: [0, -0.06, -0.058], h: [0.003, 0.012, 0.003], r: 0.002, rx: 0.18 }, { c: [0, -0.02, -0.153], h: [0.017, 0.024, 0.029], r: 0.004 }] };
});
defineGun('l96', 'sniper', (c) => {
  const { g, M, info } = c, S = M.taupe, heavy = c.stock === 'heavy';
  // crosse : avant-bras au nez fuyant, berceau du boîtier (plus bas au-dessus de l'éjection), puits de chargeur, poignet au-dessus
  // du trou de pouce, rehausse de joue, talon ; la poignée, plus étroite, ferme le trou de pouce par l'avant
  prof(g, S, [[-0.437, 0.0425, 0.005], [-0.1, 0.0425, 0.002], [-0.096, 0.035, 0.002], [0.086, 0.035, 0.004], [0.094, 0.028, 0.004], [0.315, 0.03, 0.002],
    [0.318, 0.033, 0.002], [0.361, 0.033, 0.004], [0.361, -0.1, 0.004], [0.125, -0.101, 0.006], [0.125, -0.066, 0.004], [0.135, -0.062, 0.008], [0.15, -0.05, 0.006],
    [0.15, -0.0074, 0.008], [0.09, -0.0074, 0.004], [-0.058, -0.0074, 0.003], [-0.062, -0.0206, 0.003], [-0.148, -0.0206, 0.004], [-0.186, -0.0074, 0.008],
    [-0.403, -0.0074, 0.01]], 0.05, 0, 0.004, 0.004);
  prof(g, S, [[0.042, 0.0, 0.002], [0.05, -0.012, 0.004], [0.073, -0.104, 0.006], [0.128, -0.104, 0.004], [0.128, -0.07, 0.002], [0.118, -0.058, 0.006],
    [0.094, -0.0074, 0.004], [0.094, 0.0, 0.002]], 0.04, 0, 0.006, 0.004);
  cy(g, M.dark, 0, -0.07, 0.098, 0.003, 0.0412, 0, 0, Math.PI / 2);
  // rail latéral de l'avant-bras (dépasse de 2 mm), crans sous le rail, vis ; fente de grenadière ; embase de bretelle (ôtée sous
  // un accessoire)
  prof(g, S, [[-0.402, 0.0198, 0.012], [-0.15, 0.0198, 0.01], [-0.144, 0.012, 0.004], [-0.144, -0.0074, 0.002], [-0.402, -0.0074, 0.004]], 0.054, 0, 0.0015, 0.004);
  for (let i = 0; i < 6; i++) rb(g, M.dark, 0, -0.0035, -0.308 + i * 0.018, 0.0546, 0.009, 0.0055, 0.001);
  cy(g, M.dark, 0, 0.0095, -0.392, 0.003, 0.0556, 0, 0, Math.PI / 2);
  for (const z of [-0.047, -0.159]) cy(g, M.dark, 0, z < -0.1 ? 0.002 : 0.014, z, 0.003, 0.0506, 0, 0, Math.PI / 2);
  prof(g, M.rubber, [[-0.007, 0.0033], [0.007, 0.0033], [0.007, -0.0033], [-0.007, -0.0033]], 0.0506, 0, 0, 0.0033).position.set(0, 0.024, -0.415);
  if (!c.A.under) {
    cy(g, M.metal, 0, -0.012, -0.362, 0.008, 0.01, 0);
    bx(g, M.metal, 0, -0.021, -0.362, 0.003, 0.01, 0.004);
    part(g, G_TOR, M.metal, 0, -0.031, -0.362, 0.0075, 0.009, 0.0075, 0, Math.PI / 2, 0);
  }
  // rehausse de joue (plus haute avec la crosse renforcée) sur sa platine à vis, entretoises, plaque de couche, embase arrière
  rb(g, S, 0, heavy ? 0.04 : 0.0355, 0.25, 0.046, heavy ? 0.026 : 0.017, 0.13, 0.006);
  rb(g, S, 0, 0.006, 0.258, 0.052, 0.044, 0.12, 0.004);
  for (const [y, z, w] of [[0.0124, 0.2164, 0.0532], [0.0124, 0.2458, 0.0532], [-0.0338, 0.1995, 0.0512], [-0.0338, 0.3029, 0.0512]]) cy(g, M.dark, 0, y, z, 0.0028, w, 0, 0, Math.PI / 2);
  for (const z of [0.3155, 0.3495]) rb(g, M.dark, 0, -0.0335, z, 0.0505, 0.133, 0.0015, 0.001);
  rb(g, M.rubber, 0, -0.0335, 0.373, 0.052, 0.137, 0.024, 0.006);
  cy(g, M.metal, 0, -0.106, 0.3, 0.0085, 0.01, 0);
  part(g, G_TOR, M.metal, 0, -0.119, 0.3, 0.007, 0.0085, 0.007, 0, Math.PI / 2, 0);
  info.butt = [0, -0.02, 0.38];
  // boîtier rond, manchon de culasse et témoin d'armement, fenêtre d'éjection (droite), arrêtoir de culasse (gauche)
  cy(g, M.metal, 0, 0.044, -0.0625, 0.017, 0.295);
  cy(g, M.dark, 0, 0.044, 0.1, 0.0145, 0.03);
  cy(g, M.metal, 0, 0.044, 0.117, 0.006, 0.006);
  rb(g, M.dark, 0.0162, 0.05, -0.035, 0.002, 0.013, 0.065, 0.001);
  rb(g, M.dark, -0.0172, 0.04, -0.045, 0.003, 0.006, 0.03, 0.001);
  // culasse : levier coudé à boule (la main droite le saisit, l'animation le fait tourner et reculer)
  info.bolt = new THREE.Group(); info.bolt.position.set(0.02, 0.045, 0.07); g.add(info.bolt);
  part(info.bolt, G_CYL, M.metal, -0.004, 0.008, 0, 0.007, 0.018, 0.007, 0, 0, Math.PI / 2);
  part(info.bolt, G_CYL, M.metal, 0.03, 0, 0, 0.006, 0.06, 0.006, 0, 0, Math.PI / 2 - 0.4);
  part(info.bolt, new THREE.SphereGeometry(1, 12, 10), M.dark, 0.058, -0.012, 0, 0.012, 0.012, 0.012);
  // canon lourd et sa portée, bagues, guidon rabattable (embase, ailettes, guidon, capot replié), frein de bouche à deux évents sur
  // sa bague (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.767;
  cy(g, M.metal, 0, 0.044, -0.2275, 0.0128, 0.025);
  cy(g, M.metal, 0, 0.044, (tip - 0.215) / 2, 0.011, -0.215 - tip);
  for (const z of [-0.6505, -0.5968]) cy(g, M.dark, 0, 0.044, z, 0.0113, 0.0095);
  rb(g, M.dark, 0, 0.0445, -0.7337, 0.026, 0.028, 0.025, 0.004);
  for (const sx of [-1, 1]) rb(g, M.dark, sx * 0.0075, 0.069, -0.7357, 0.003, 0.022, 0.02, 0.001);
  bx(g, M.dark, 0, 0.0665, -0.7357, 0.002, 0.016, 0.003);
  rb(g, M.dark, 0, 0.067, -0.7115, 0.016, 0.01, 0.033, 0.004);
  if (!c.A.muzzle) {
    cy(g, M.metal, 0, 0.044, -0.7795, 0.0147, 0.0257);
    cy(g, M.dark, 0, 0.0285, -0.78, 0.003, 0.004, 0);
    cy(g, M.metal, 0, 0.044, -0.8147, 0.0128, 0.0446);
    cone(g, M.metal, 0, 0.044, -0.8386, 0.0106, 0.0128, 0.0031);
    cy(g, M.rubber, 0, 0.044, -0.8402, 0.004, 0.0004);
    for (const z of [-0.8218, -0.802]) bx(g, M.rubber, 0, 0.046, z, 0.0262, 0.016, 0.0147);
  }
  // lunette : objectif évasé (lentille au fond), tube, selle et tourelles (dessus, droite) et sa plaque gauche, oculaire à bague de
  // grossissement (lentille visible) ; deux colliers sur leur embase, molettes de serrage à gauche, niveau
  const sy = 0.0946;
  rb(g, M.dark, 0, 0.065, -0.102, 0.026, 0.012, 0.154, 0.002);
  rb(g, M.dark, -0.004, 0.0715, -0.0555, 0.018, 0.009, 0.027, 0.002);
  for (const z of [-0.1697, -0.0838]) {
    cy(g, M.dark, 0, sy, z, 0.0148, 0.017);
    rb(g, M.dark, 0, 0.0755, z, 0.024, 0.011, 0.017, 0.002);
    cy(g, M.metal, -0.016, 0.066, z, 0.0095, 0.008, 0, 0, Math.PI / 2);
    cy(g, M.dark, -0.0205, 0.066, z, 0.004, 0.002, 0, 0, Math.PI / 2);
  }
  scopeEnd(g, M, sy, -0.2798, 0.0262, 0.0262, -1, 0.0147, M.dark, M.metal);
  cone(g, M.dark, 0, sy, -0.23315, 0.025, 0.0125, 0.0639);
  cy(g, M.dark, 0, sy, -0.1223, 0.0125, 0.1578);
  rb(g, M.dark, 0, sy, -0.1285, 0.029, 0.029, 0.042, 0.009);
  rb(g, M.metal, -0.0148, sy, -0.1285, 0.002, 0.012, 0.04, 0.005);
  cy(g, M.dark, 0, sy + 0.0211, -0.1304, 0.0115, 0.014, 0);
  cy(g, M.metal, 0, sy + 0.0262, -0.1304, 0.0118, 0.005, 0);
  cy(g, M.dark, 0, sy + 0.0294, -0.1304, 0.009, 0.0022, 0);
  cy(g, M.dark, 0.0211, sy, -0.1304, 0.0105, 0.014, 0, 0, Math.PI / 2);
  cy(g, M.metal, 0.0262, sy, -0.1304, 0.0108, 0.005, 0, 0, Math.PI / 2);
  cone(g, M.dark, 0, sy, -0.0374, 0.0125, 0.0185, 0.012);
  cy(g, M.dark, 0, sy, -0.0274, 0.0188, 0.008);
  for (const z of [-0.0302, -0.0274, -0.0246]) cy(g, M.rubber, 0, sy, z, 0.0191, 0.0012);
  cy(g, M.dark, 0, sy, 0.0037, 0.0205, 0.0542);
  scopeEnd(g, M, sy, 0.0388, 0.022, 0.0205, 1, 0.008);
  // chargeur droit, plaque de fond inclinée
  info.magHome.set(0, -0.0206, -0.1047);
  info.buildMag = (parent, ext) => {
    const yb = -0.033 - (ext - 1) * 0.06;
    prof(parent, M.dark, [[-0.0404, 0.012, 0.001], [-0.0404, yb, 0.004], [0.0404, yb - 0.0035, 0.004], [0.0404, 0.012, 0.001]], 0.03, 0, 0.003, 0.003);
    rb(parent, M.metal, 0, yb - 0.0012, 0, 0.032, 0.005, 0.084, 0.002, 0.043);
  };
  info.magAxis = new V3(0, -1, 0); info.magGrip = new V3(0, -0.02, 0);
  // pontet et détente, entre le chargeur et la poignée
  guard(g, M.dark, -0.052, 0.024, -0.005, -0.062, 0.005, 0.004, 0.01);
  rb(g, M.metal, 0, -0.028, -0.021, 0.006, 0.046, 0.006, 0.002, 0.18);
  info.gripR.set(0, -0.055, 0.075); info.gripL.set(0, 0.018, -0.25);
  info.sightY = sy; info.adsZ = 0.13;
  info.mount.muzzle = { x: 0, y: 0.044, z: tip, r: 0.011 };
  info.mount.under = { y: -0.0074, z: -0.345, len: 0.12 };
  info.muzzle.position.set(0, 0.044, c.A.muzzle ? tip - 0.01 : -0.845); info.eject.position.set(0.02, 0.05, -0.035);
  info.gripDef = {
    R: [{ c: [0, -0.058, 0.088], h: [0.02, 0.046, 0.027], r: 0.01, rx: -0.23 }, { c: [0, 0.01, 0.12], h: [0.025, 0.018, 0.035], r: 0.006 }, { c: [0, 0.03, -0.06], h: [0.025, 0.035, 0.15], r: 0.01 }],
    L: [{ c: [0, 0.0175, -0.29], h: [0.027, 0.025, 0.11], r: 0.005 }],
  };
  info.trigDef = { at: [0.004, -0.044, -0.033], xTip: -0.004, guard: [{ c: [0, -0.0595, -0.014], h: [0.005, 0.0025, 0.038], r: 0.002 }, { c: [0, -0.033, -0.0495], h: [0.0045, 0.028, 0.0025], r: 0.002 },
    { c: [0, -0.028, -0.021], h: [0.003, 0.023, 0.003], r: 0.002, rx: 0.18 }, { c: [0, -0.038, -0.1047], h: [0.016, 0.018, 0.041], r: 0.004 }] };
});
defineGun('m1014', 'shotgun', (c) => {
  const { g, M, info } = c, B = M.polyM, D0 = M.dark, K = M.rubber, sx2 = [-1, 1], ext = c.A.mag === 'xmag' ? 0.04 : 0; // polymère à grain fin (la crosse est sous l'œil en visée) ; tube prolongé par le chargeur étendu
  const S = 0.001322, D = 0.0364, P = (x, y, r) => { const q = [-0.0285 - (x - 297) * S, 0.037 - (y - 268) * S]; if (r !== undefined) q.push(r); return q; };
  const Q = (x, y, r) => { const q = P(x, y, r); q[0] += D; return q; }, R = (x, y, r) => (x < 282 ? Q(x, y, r) : P(x, y, r));
  const Pz = (x) => P(x, 0)[0], Qz = (x) => Pz(x) + D, Py = (y) => P(0, y)[1];
  const by = Py(268), ty = Py(289.5), fine = (m, k = 2.5) => { m.geometry = m.geometry.clone(); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return m; };

  // ----- boîtier : dessus qui descend vers la crosse, rail, fenêtre d'éjection (culasse chromée, levier) à droite -----
  fine(prof(g, D0, [P(425, 257, 0.003), P(425, 300, 0.002), P(320, 300, 0.002), P(282, 302, 0.002), Q(281, 302, 0.002), Q(262, 296, 0.004), Q(262, 262, 0.004), Q(280, 254, 0.004), P(300, 253, 0.004),
    P(330, 253, 0.002)], 0.032, 0, 0.003, 0.003), 6); // grain fin : le dessus est sous l'œil en visée
  rb(g, D0, 0, Py(251), (Pz(330) + Pz(423)) / 2, 0.02, 0.005, Pz(330) - Pz(423), 0.001);
  for (let x = 333; x < 420; x += 7.4) bx(g, D0, 0, Py(248), Pz(x + 1.8), 0.022, 0.003, 0.0045);
  rb(g, K, 0.0161, Py(271), (Pz(333) + Pz(420)) / 2, 0.0012, Py(262) - Py(281), Pz(333) - Pz(420), 0.0006);
  rb(g, M.steel, 0.0158, Py(271), (Pz(340) + Pz(410)) / 2, 0.002, Py(264) - Py(279), Pz(340) - Pz(410), 0.0008);
  { const q = P(398, 272); cy(g, M.steel, 0.024, q[1], q[0], 0.0028, 0.014, 0, 0, Math.PI / 2); part(g, new THREE.SphereGeometry(1, 8, 6), M.steel, 0.031, q[1], q[0], 0.0042, 0.0042, 0.0042); }
  // boîte de culasse vue de dessous : port de chargement (devant le pontet), bouton d'arrêtoir
  rb(g, K, 0, Py(300) - 0.0003, (Pz(330) + Pz(415)) / 2, 0.016, 0.0012, Pz(330) - Pz(415), 0.0005);
  cy(g, M.metal, 0.0164, Py(291), Pz(334), 0.0028, 0.002, 0, 0, Math.PI / 2);

  // ----- canon, tube magasin, collier à grenadière, garde-mains à nervures -----
  const tip = Pz(778);
  cz(g, M.metal, 0, by, (tip + Pz(420)) / 2, 0.0106, Pz(420) - tip);
  cz(g, K, 0, by, tip - 0.0001, 0.0076, 0.0006);
  const tEnd = Pz(742) - ext;
  cz(g, M.metal, 0, ty, (tEnd + Pz(420)) / 2, 0.0126, Pz(420) - tEnd);
  cz(g, D0, 0, ty, tEnd - 0.012, 0.0142, 0.024); cone(g, D0, 0, ty, tEnd - 0.0285, 0.0105, 0.0142, 0.009);
  if (ext) part(g, G_TOR, D0, 0, ty, Pz(742) + 0.002, 0.0131, 0.0131, 0.025); // raccord de la rallonge
  prof(g, D0, [P(616, 262, 0.004), P(650, 262, 0.004), P(650, 303, 0.004), P(616, 303, 0.004)], 0.03, 0, 0.003, 0.003);
  part(g, G_TOR, M.metal, 0, Py(312), Pz(628), 0.0085, 0.0095, 0.0085, 0, Math.PI / 2, 0);
  fine(prof(g, B, [P(487, 271, 0.006), P(606, 271, 0.006), P(613, 282, 0.004), P(612, 306, 0.006), P(600, 310, 0.004), P(495, 310, 0.004), P(486, 300, 0.006)], 0.046, 0, 0.008, 0.004));
  for (let x = 498; x < 600; x += 5.2) for (const sx of sx2) bx(g, K, sx * 0.0232, Py(298), Pz(x), 0.0012, Py(287) - Py(308), 0.0016);

  // ----- organes de visée (rien si une optique les remplace) : guidon à oreilles sur son collier, ghost ring sur ses oreilles -----
  // ligne de mire au sommet de la lame du guidon (y 243 sur la photo, 4 mm au-dessus de la cote relevée : à 1,2 mm du rail du boîtier,
  // la lame n'en dépassait que de 3 mm en visée, et ses oreilles, plus hautes, se lisaient à sa place ; elles s'arrêtent maintenant
  // sous sa pointe). L'œil est à 10,5 cm de l'anneau : trait fin et large ouverture (12 % de l'écran), sur un montant ; ailes minces
  // et peu profondes (leur flanc ne se voit plus)
  const SY = Py(243);
  info.sightY = SY; info.adsZ = Pz(289) + 0.105; // ghost ring : l'œil tout près de l'anneau
  if (!c.optic) {
    rb(g, D0, 0, Py(258), Pz(748), 0.016, 0.008, 0.02, 0.002);
    prof(g, M.sight, [P(744, 256), [Pz(745), SY, 0.0005], [Pz(751), SY, 0.0005], P(753, 256)], 0.0026, 0, 0.0004, 0.0006);
    for (const sx of sx2) prof(g, D0, [P(738, 258), P(741, 244.5, 0.001), P(752, 244.5, 0.001), P(758, 258)], 0.002, sx * 0.0068, 0.0005, 0.001);
    rb(g, D0, 0, Py(251.5), Pz(289), 0.026, 0.004, 0.02, 0.0015);
    ironFoot(c, D0, Pz(289), Py(250.5), ironRing(c, Pz(289), 0.12), 0.008);
    for (const sx of sx2) bx(g, D0, sx * 0.0125, (Py(253) + SY + 0.003) / 2, Pz(289), ironW(c, Pz(289), IRON.wing), SY + 0.003 - Py(253), 0.006);
  }

  // ----- pontet (allongé jusqu'à la poignée), détente -----
  prof(g, D0, [P(322, 300, 0.001), P(322, 316, 0.004), P(316, 322, 0.004), Q(285, 323, 0.004), Q(279, 318, 0.003), Q(279, 300, 0.001)], 0.008, 0, 0.0015, 0.002,
    [[P(318, 301, 0.001), P(318, 315, 0.003), P(314, 319, 0.003), Q(286, 320, 0.003), Q(282, 316, 0.002), Q(282, 301, 0.001)]]);
  prof(g, M.metal, [P(304, 300), P(302, 306, 0.003), P(296, 312, 0.004), P(290, 318, 0.002), P(293, 319, 0.001), P(299, 314, 0.004), P(305, 307, 0.003), P(308, 300)], 0.006, 0, 0.0012, 0.0015);

  // ----- crosse fixe et poignée pistolet (Q) -----
  fine(prof(g, B, [Q(281, 254, 0.002), Q(262, 262, 0.004), Q(240, 271, 0.01), Q(210, 280, 0.01), Q(150, 288, 0.01), Q(90, 296, 0.008), Q(40, 302, 0.006), Q(30, 304, 0.003), Q(30, 394, 0.003),
    Q(40, 395, 0.006), Q(100, 368, 0.01), Q(160, 340, 0.01), Q(200, 321, 0.008), Q(212, 316, 0.006), Q(232, 318, 0.006), Q(272, 303, 0.004), Q(281, 302, 0.002)], 0.042, 0, 0.005, 0.004), 6);
  fine(prof(g, B, [Q(272, 302, 0.002), Q(271, 324, 0.004), Q(267, 334, 0.008), Q(263, 344, 0.01), Q(258, 356, 0.01), Q(254, 370, 0.006), Q(256, 378, 0.004), Q(262, 384, 0.004),
    Q(258, 390, 0.003), Q(238, 389, 0.006), Q(214, 380, 0.004), Q(212, 372, 0.006), Q(218, 360, 0.01), Q(223, 348, 0.01), Q(228, 336, 0.008), Q(231, 324, 0.004), Q(226, 316, 0.002)], 0.031, 0, 0.004, 0.003));
  for (let k = 0; k < 10; k++) { const y = 334 + k * 5, xm = 244 - (y - 334) * 0.33, a = Q(xm - 10, y), b = Q(xm + 10, y); for (const sx of sx2) bx(g, K, sx * 0.0158, a[1], (a[0] + b[0]) / 2, 0.0012, 0.0014, Math.abs(b[0] - a[0])); }
  prof(g, K, [Q(14, 312, 0.004), Q(30, 304, 0.002), Q(30, 394, 0.002), Q(26, 398, 0.003), Q(14, 360, 0.006)], 0.044, 0, 0.004, 0.003);
  for (const sx of sx2) rb(g, K, sx * 0.0212, Py(331), (Qz(75) + Qz(100)) / 2, 0.0012, Py(318) - Py(345), Qz(75) - Qz(100), 0.002);

  // ----- cartouche (celle que la main gauche apporte au port de chargement) -----
  info.magHome.set(0, Py(300), Pz(372));
  info.buildMag = (parent) => { part(parent, G_CYL, SHELL_RED, 0, -0.012, 0, 0.011, 0.05, 0.011); part(parent, G_CYL, M.brass, 0, -0.045, 0, 0.0115, 0.02, 0.0115); };
  info.magGrip = new V3(0, -0.03, 0);
  info.tubeFed = true; info.mag.visible = false;

  // ----- mains, visée, montages -----
  info.butt = [0, Py(350), Qz(16)];
  info.gripR.set(0, Py(316), Qz(250)); info.gripL.set(0, ty, Pz(491));
  info.mount.optic = { y: Py(250), z: (Pz(333) + Pz(420)) / 2, len: Pz(333) - Pz(420), D: 0.2 };
  info.mount.muzzle = { x: 0, y: by, z: tip, r: 0.0106 };
  info.mount.side = { x: -0.0146, y: ty, z: Pz(690) };
  info.muzzle.position.set(0, by, tip - 0.01); info.eject.position.set(0.02, Py(271), (Pz(333) + Pz(420)) / 2);
  info.gripDef = {
    R: [{ c: [0, Py(350), Qz(242)], h: [0.0155, 0.048, 0.024], r: 0.01, rx: -0.33 }, { c: [0, Py(285), Pz(360)], h: [0.016, 0.022, 0.06], r: 0.006 }],
    L: [{ c: [0, Py(290.5), Pz(550)], h: [0.023, (310 - 271) / 2 * S, (Pz(487) - Pz(612)) / 2], r: 0.012 }],
  };
  info.trigDef = { at: [0.004, Py(314), Pz(305) - 0.0085], xTip: -0.004, guard: [] };
});
defineGun('m9', 'pistol', (c) => {
  const { g, M, info } = c, D = M.blued, K = M.rubber, by = 0.0375, sx2 = [-1, 1], dotG = new THREE.SphereGeometry(1, 6, 4);
  // repère de la poignée (le même que celui des autres pistolets) : b vers l'arrière, d vers le bas, depuis son centre
  const G = (b, d, r) => { const q = [0.012 + b * 0.976 + d * 0.218, -0.05 + b * 0.218 - d * 0.976]; if (r !== undefined) q.push(r); return q; };

  // ----- glissière (recule au tir) : nez plein, flancs ouverts sur le dessus jusqu'à l'arrière plein -----
  const sl = new THREE.Group(); g.add(sl); info.slide = sl; info.slideTravel = 0.034;
  prof(sl, M.blued, [[-0.177, 0.0214, 0.002], [-0.177, 0.0445, 0.003], [-0.1589, 0.0445, 0.002], [-0.1565, 0.0355, 0.002], [-0.0604, 0.0355, 0.001], [-0.0604, 0.0445, 0.001],
    [0.025, 0.0445, 0.006], [0.028, 0.04, 0.003], [0.028, 0.0214, 0.002]], 0.03, 0, 0.003, 0.002);
  // cannelures arrière, leviers de sûreté-désarmeur (axe, point rouge dessous)
  for (let k = 0; k < 18; k++) for (const sx of sx2) bx(sl, K, sx * 0.0151, 0.0275, -0.0565 + k * 0.0029, 0.0012, 0.012, 0.0013);
  for (const sx of sx2) {
    prof(sl, D, [[0.001, 0.034, 0.004], [0.004, 0.0395, 0.003], [0.0135, 0.0445, 0.002], [0.016, 0.042, 0.002], [0.0105, 0.033, 0.004], [0.0055, 0.0295, 0.004]], 0.0022, sx * 0.0158, 0.0007, 0.003);
    cy(sl, D, sx * 0.0168, 0.0345, 0.0059, 0.0032, 0.0016, 0, 0, Math.PI / 2);
    part(sl, dotG, M.dot, sx * 0.0151, 0.0244, 0.0039, 0.0003, 0.0011, 0.0011);
  }
  // hausse à cran et deux points, guidon à point blanc (rien si une optique les remplace)
  if (!c.optic) {
    prof(sl, D, [[-0.0001, 0.0445, 0], [0.0025, 0.0468, 0.001], [0.0069, 0.0468, 0.0005], [0.0069, 0.0445, 0]], 0.019, 0, 0.0006, 0.001);
    for (const sx of sx2) {
      prof(sl, D, [[0.0012, 0.0465, 0], [0.0032, 0.0496, 0.0006], [0.0069, 0.0496, 0.0005], [0.0069, 0.0465, 0]], 0.0072, sx * 0.0058, 0.0005, 0.0006);
      part(sl, dotG, M.dotW, sx * 0.0058, 0.0483, 0.007, 0.001, 0.001, 0.0004);
    }
    prof(sl, D, [[-0.1755, 0.0442, 0], [-0.172, 0.0496, 0.001], [-0.1665, 0.0496, 0.0005], [-0.1665, 0.0442, 0]], 0.0035, 0, 0.0005, 0.0008);
    part(sl, dotG, M.dotW, 0, 0.0483, -0.1663, 0.0011, 0.0011, 0.0005);
  }

  // ----- canon fixe : visible dans l'ouverture de la glissière, couronne et âme devant le nez -----
  cz(g, M.metal, 0, by, -0.1225, 0.0066, 0.125);
  cz(g, K, 0, by, -0.1852, 0.0045, 0.0006);

  // ----- carcasse -----
  // cache-poussière lisse, dessous du pontet, queue de castor
  prof(g, D, [[-0.1764, 0.0214, 0.002], [0.029, 0.0214, 0.002], [0.037, 0.0165, 0.004], [0.0435, 0.0095, 0.002], [0.0405, 0.0065, 0.002], [0.034, 0.0033, 0.004],
    [0.026, -0.004, 0], [-0.03, -0.004, 0], [-0.096, 0.0074, 0.002], [-0.1609, 0.0074, 0.001], [-0.1609, 0.0094, 0.001], [-0.1764, 0.0094, 0.002]], 0.027, 0, 0.002, 0.002);
  // chien à ergot (percé), derrière la glissière
  prof(g, D, [[0.024, 0.02, 0], [0.024, 0.0385, 0.002], [0.0275, 0.0435, 0.002], [0.0335, 0.0425, 0.002], [0.034, 0.039, 0.002], [0.0305, 0.035, 0.003], [0.0305, 0.02, 0]], 0.009, 0, 0.0012, 0.002);
  cy(g, K, 0, 0.0395, 0.0295, 0.0018, 0.0094, 0, 0, Math.PI / 2);
  // levier de démontage et son bouton, arrêtoir de glissière (à gauche), axe de détente, bouton d'arrêtoir du chargeur
  prof(g, D, [[-0.0895, 0.018, 0.002], [-0.077, 0.018, 0.002], [-0.0755, 0.012, 0.003], [-0.08, 0.0065, 0.003], [-0.089, 0.0065, 0.002]], 0.002, -0.0142, 0.0006, 0.002);
  cy(g, D, -0.0148, 0.0068, -0.0855, 0.0025, 0.0024, 0, 0, Math.PI / 2);
  prof(g, D, [[-0.0634, 0.0194, 0.002], [-0.0142, 0.0194, 0.002], [-0.0142, 0.0165, 0.001], [-0.051, 0.0165, 0.002], [-0.053, 0.0094, 0.003], [-0.0634, 0.0094, 0.003]], 0.002, -0.0145, 0.0006, 0.002);
  cy(g, D, 0, 0.0053, -0.0594, 0.0022, 0.0282, 0, 0, Math.PI / 2);
  cy(g, D, -0.0152, -0.0214, -0.0172, 0.0045, 0.004, 0, 0, Math.PI / 2);
  // pontet rond et son crochet strié, détente incurvée
  guard(g, D, -0.096, -0.024, 0.0074, -0.0312, 0.0048, 0.004, 0.008);
  rb(g, D, 0, -0.0215, -0.0972, 0.007, 0.013, 0.004, 0.0015, -0.2);
  for (let k = 0; k < 4; k++) { const ly = 0.004 - k * 0.003; bx(g, K, 0, -0.022 + 0.98 * ly, -0.09955 - 0.1987 * ly, 0.0072, 0.0008, 0.0012, -0.2); } // stries sur la face avant inclinée du crochet
  prof(g, D, [[-0.0625, 0.003], [-0.0605, -0.006, 0.006], [-0.0645, -0.017, 0.008], [-0.0715, -0.0245, 0.001], [-0.0705, -0.0255, 0.001], [-0.0655, -0.0215, 0.006],
    [-0.0575, -0.01, 0.006], [-0.0565, 0.003]], 0.0055, 0, 0.0012, 0.0015);
  // poignée : carcasse (devant droit, dos bombé), plaquettes noires qui dépassent des flancs, vis et médaillon, dragonne
  prof(g, D, [G(-0.032, -0.062), G(-0.03, 0.038, 0.003), G(0.025, 0.038, 0.004), G(0.028, 0.02, 0.008), G(0.029, 0.0, 0.01), G(0.027, -0.03, 0.008), G(0.022, -0.05, 0.004), G(0.02, -0.062)], 0.028, 0, 0.003, 0.003);
  prof(g, M.grip, [G(-0.012, -0.06, 0.003), G(-0.026, -0.052, 0.004), G(-0.024, 0.032, 0.004), G(0.02, 0.032, 0.004), G(0.022, 0.0, 0.006), G(0.018, -0.045, 0.006), G(0.012, -0.058, 0.004)], 0.036, 0, 0.003, 0.003);
  for (const [b, d] of [[-0.004, -0.05], [0.0, 0.022]]) { const q = G(b, d); cy(g, M.metal, 0, q[1], q[0], 0.0028, 0.0372, 0, 0, Math.PI / 2); }
  { const q = G(-0.002, -0.022); cy(g, D, 0, q[1], q[0], 0.0068, 0.0366, 0, 0, Math.PI / 2); }
  { const q = G(0.024, 0.04); part(g, RING_REAR, M.metal, 0, q[1], q[0], 0.7, 0.7, 0.7, 0, Math.PI / 2, 0); }

  // ----- chargeur : corps d'acier dans la poignée (trous témoins au dos), talon noir dessous ; étendu : plus long -----
  const mw = 0.024, mh = 0.098, md = 0.04, c0 = G(0, -0.008);
  info.magHome.set(0, 0, 0);
  info.buildMag = (parent, ext) => {
    const ex = (ext - 1) * 0.1, t = new THREE.Group(); t.position.set(0, c0[1], c0[0]); t.rotation.x = -0.22; parent.add(t);
    rb(t, M.metal, 0, -ex / 2, 0.0, mw, mh + ex, md, 0.003);
    for (let k = 0; k < 4; k++) part(t, dotG, M.dotW, 0.0, -0.01 - k * 0.011 - ex / 2, md / 2 + 0.0008, 0.0012, 0.0012, 0.0004);
    rb(t, D, 0, -mh / 2 - 0.006 - ex, -0.002, mw + 0.009, 0.012, md + 0.006, 0.003);
  };
  info.magAxis = new V3(0, -0.976, 0.218); info.magGrip = new V3(0, -0.092, 0.018);
  info.gripR.set(0, -0.05, 0.015); info.gripL.set(-0.02, -0.06, 0.005);

  // ----- visée, montages, bouche, éjection -----
  info.sightY = 0.0496; info.adsZ = 0.41 + 0.0069; // ligne de mire au sommet du guidon et des oreilles de la hausse, l'œil à 41 cm d'elle
  info.mount.optic = { y: 0.0445, z: -0.018, len: 0.08, D: 0.4, slide: sl }; // sur le dessus plein, derrière l'ouverture
  info.mount.muzzle = { x: 0, y: by, z: -0.185, r: 0.0066 };
  info.mount.side = { x: 0, y: 0.0092, z: -0.13, under: true }; // pointeur laser sous le cache-poussière (son dessus 2 mm sous y)
  info.muzzle.position.set(0, by, -0.1855); info.eject.position.set(0.012, 0.045, -0.04);
  // formes de prise des mains : poignée (son angle), carcasse, glissière, pontet
  const gc = G(-0.0025, -0.012);
  info.gripDef = {
    R: [{ c: [0, gc[1], gc[0]], h: [0.018, 0.05, 0.0295], r: 0.008, rx: -0.22 }, { c: [0, 0.0144, -0.13], h: [0.0135, 0.007, 0.047], r: 0.003 }, { c: [0, 0.01, 0.012], h: [0.0135, 0.012, 0.025], r: 0.005 },
      { c: [0, 0.033, -0.074], h: [0.015, 0.0116, 0.1025], r: 0.003 }, { c: [0, -0.0288, -0.06], h: [0.004, 0.0025, 0.036], r: 0.002 }, { c: [0, -0.012, -0.0935], h: [0.004, 0.019, 0.0025], r: 0.002 }],
  };
  info.gripDef.L = info.gripDef.R;
  info.trigDef = { at: [0.004, -0.011, -0.073], xTip: -0.003, guard: [{ c: [0, -0.011, -0.064], h: [0.00275, 0.013, 0.0025], r: 0.0015, rx: 0.4 }] };
});
/* ---- 06l-modeles-fusils.js ---- */
defineGun('ak47', 'rifle', (c) => {
  const { g, M, info, bl } = c;
  // boîtier embouti, couvercle nervuré et son bouton, rail de lunette latéral (gauche), rivets, levier d'armement et sûreté (droite)
  prof(g, M.metal, [[-0.198, 0.064, 0.003], [0.056, 0.064, 0.004], [0.066, 0.05, 0.006], [0.066, 0.0, 0.004], [0.05, -0.005, 0.003], [-0.198, -0.005, 0.003]], 0.04, 0, 0.003, 0.003);
  prof(g, M.metal, [[-0.196, 0.069, 0.003], [-0.17, 0.0715, 0.006], [0.04, 0.068, 0.008], [0.058, 0.064, 0.003], [0.058, 0.06, 0.002], [-0.196, 0.06, 0.002]], 0.038, 0, 0.004, 0.004);
  rb(g, M.dark, 0, 0.0712, -0.07, 0.01, 0.003, 0.2, 0.0012, 0.017);
  cy(g, M.dark, 0, 0.066, 0.061, 0.004, 0.008);
  rb(g, M.dark, -0.0208, 0.02, -0.044, 0.003, 0.02, 0.11, 0.001);
  for (const [z, y] of [[-0.135, 0.006], [-0.115, 0.006], [-0.03, 0.006], [-0.008, 0.012], [0.03, 0.006]]) cy(g, M.dark, 0, y, z, 0.0026, 0.0424, 0, 0, Math.PI / 2);
  cy(g, M.metal, 0.028, 0.044, -0.03, 0.0045, 0.02, 0, 0, Math.PI / 2);
  part(g, new THREE.SphereGeometry(1, 8, 6), M.metal, 0.039, 0.044, -0.03, 0.007, 0.007, 0.007);
  rb(g, M.metal, 0.0212, 0.036, -0.02, 0.003, 0.012, 0.1, 0.001);
  // bloc de hausse devant le boîtier, planchette couchée et cran de mire (rien si une optique les remplace)
  prof(g, M.metal, [[-0.256, 0.06, 0.003], [-0.196, 0.066, 0.003], [-0.196, 0.038, 0.003], [-0.256, 0.04, 0.003]], 0.032, 0, 0.003, 0.003);
  // pontet, détente, poignée en bois et son embase
  guard(g, M.metal, -0.072, 0.03, -0.002, -0.054, 0.005, 0.004, 0.009);
  rb(g, M.dark, 0, -0.026, -0.034, 0.006, 0.042, 0.006, 0.002, 0.18);
  rb(g, M.dark, 0, -0.012, -0.086, 0.008, 0.016, 0.006, 0.002, -0.2);
  gripProf(g, M.woodR, 0.0351, -0.0019, 0.078, -0.1193, 0.046, 0.034);
  rb(g, M.dark, 0, -0.1215, 0.0795, 0.033, 0.006, 0.047, 0.002, -0.35);
  // garde-main bas (et sa bague), garde-main haut sur le tube à gaz, tube et bloc de gaz, guidon, baguette
  prof(g, M.woodR, [[-0.358, 0.042, 0.004], [-0.203, 0.044, 0.004], [-0.197, 0.035, 0.003], [-0.197, -0.002, 0.006], [-0.25, -0.004, 0.012], [-0.352, -0.001, 0.01], [-0.358, 0.008, 0.006]], 0.048, 0, 0.006, 0.006);
  rb(g, M.metal, 0, 0.021, -0.36, 0.05, 0.05, 0.008, 0.004);
  prof(g, M.woodR, [[-0.354, 0.06, 0.006], [-0.262, 0.071, 0.006], [-0.25, 0.07, 0.003], [-0.25, 0.04, 0.003], [-0.354, 0.04, 0.003]], 0.034, 0, 0.004, 0.005);
  cy(g, M.metal, 0, 0.05, -0.42, 0.0085, 0.136);
  prof(g, M.metal, [[-0.492, 0.06, 0.003], [-0.47, 0.06, 0.003], [-0.47, 0.024, 0.003], [-0.492, 0.024, 0.003]], 0.024, 0, 0.003, 0.003);
  prof(g, M.metal, [[-0.574, 0.058, 0.003], [-0.548, 0.058, 0.003], [-0.548, 0.02, 0.003], [-0.574, 0.02, 0.003]], 0.026, 0, 0.003, 0.003);
  cy(g, M.metal, 0, 0.019, -0.46, 0.0025, 0.22);
  // canon et frein de bouche biseauté (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.582 - bl;
  cy(g, M.metal, 0, 0.032, (-0.205 + tip) / 2, 0.0085, Math.abs(tip + 0.205));
  if (!c.A.muzzle) { cy(g, M.dark, 0, 0.032, tip + 0.012, 0.0098, 0.024); bx(g, M.metal, 0, 0.0415, tip + 0.012, 0.012, 0.004, 0.02, -0.3); }
  // organes de visée : cran de mire sur la planchette, guidon à oreilles (rien si une optique les remplace) ; rail surélevé sinon
  info.sightY = 0.088; info.adsZ = 0.012;
  if (!c.optic) {
    // planchette couchée, cran de mire en U large (lisible en visée au-dessus du couvercle), guidon haut entre ses oreilles. Le haut
    // des épaules du cran suit la ligne de mire (il la dépassait de 6,5 mm) : la pointe du guidon se pose au ras, au milieu du cran.
    // Guidon et oreilles fins (traits en fraction de l'écran, 06jb-formes.js), la pointe seule sur la ligne de mire
    const y = info.sightY, nw = ironW(c, -0.198, 0.05), sw = 0.011 - nw / 2; // cran : 5 % de l'écran
    rb(g, M.dark, 0, 0.068, -0.222, 0.018, 0.011, 0.05, 0.0015);
    rb(g, M.dark, 0, 0.0785, -0.198, 0.022, 0.009, 0.008, 0.0015);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * (nw / 2 + sw / 2), (0.0825 + y) / 2, -0.198, sw, y - 0.0825, 0.008);
    bx(g, M.sight, 0, (0.0585 + y) / 2, -0.561, ironW(c, -0.561, IRON.post), y - 0.0585, 0.004);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.007, (0.059 + y - 0.001) / 2, -0.561, ironW(c, -0.561, IRON.ear), y - 0.001 - 0.059, 0.012);
  } else {
    rb(g, M.dark, 0, 0.0745, -0.07, 0.026, 0.006, 0.17, 0.0015);
    for (let i = 0; i < 13; i++) bx(g, M.dark, 0, 0.0795, -0.142 + i * 0.012, 0.026, 0.004, 0.006);
  }
  // crosse en bois, tombante, à busc ; plaque de couche métallique, grenadière (variantes : sans crosse, embout ; renforcée, joue)
  let butt;
  if (c.stock === 'none') {
    rb(g, M.metal, 0, 0.026, 0.075, 0.022, 0.04, 0.02, 0.004);
    rb(g, M.rubber, 0, 0.026, 0.088, 0.034, 0.06, 0.008, 0.003);
    butt = 0.092;
  } else {
    prof(g, M.woodR, [[0.05, 0.034, 0.004], [0.12, 0.034, 0.01], [0.142, 0.039, 0.01], [0.168, 0.036, 0.01], [0.292, 0.013, 0.004], [0.292, -0.079, 0.004], [0.065, -0.014, 0.008], [0.05, -0.008, 0.004]], 0.036, 0, 0.005, 0.005);
    if (c.stock === 'heavy') rb(g, M.woodR, 0, 0.038, 0.225, 0.03, 0.02, 0.12, 0.008, -0.17);
    rb(g, M.metal, 0, -0.033, 0.294, 0.038, 0.096, 0.006, 0.003);
    part(g, G_TOR, M.metal, 0, -0.066, 0.23, 0.0065, 0.0065, 0.0065, 0, Math.PI / 2, 0);
    butt = 0.297;
  }
  info.butt = [0, -0.02, butt];
  info.magHome.set(0, -0.01, -0.139);
  info.buildMag = (parent, ext) => curvedMag(parent, M, 6, 0.185 * ext, 0.03, 0.068, 0.72, M.metal);
  info.magAxis = new V3(0, -0.98, -0.2); info.magGrip = new V3(0, -0.08, -0.03);
  info.gripR.set(0, -0.05, 0.062); info.gripL.set(0, 0.02, -0.305);
  info.mount.optic = { y: 0.078, z: -0.07, len: 0.17, D: 0.24 };
  info.mount.muzzle = { x: 0, y: 0.032, z: tip, r: 0.0085 };
  info.mount.under = { y: -0.002, z: -0.29, len: 0.13 };
  info.mount.side = { x: -0.024, y: 0.02, z: -0.31 };
  info.muzzle.position.set(0, 0.032, tip - 0.01); info.eject.position.set(0.021, 0.05, -0.03);
  info.gripDef = {
    R: [{ c: [0, -0.07, 0.06], h: [0.017, 0.0525, 0.023], r: 0.01, rx: -0.35 }, { c: [0, 0.03, -0.03], h: [0.02, 0.034, 0.12], r: 0.006 }],
    L: [{ c: [0, 0.02, -0.283], h: [0.024, 0.024, 0.076], r: 0.012 }, { c: [0, 0.055, -0.3], h: [0.017, 0.016, 0.053], r: 0.01 }, { c: [0, 0.021, -0.36], h: [0.025, 0.025, 0.004], r: 0.004 }],
  };
  info.trigDef = { at: [0.004, -0.04, -0.046], xTip: -0.004, guard: [{ c: [0, -0.0515, -0.02], h: [0.0045, 0.0025, 0.05], r: 0.002 }, { c: [0, -0.028, -0.0695], h: [0.0045, 0.025, 0.0025], r: 0.002 },
    { c: [0, -0.03, -0.139], h: [0.018, 0.025, 0.036], r: 0.006 }, { c: [0, -0.026, -0.034], h: [0.003, 0.021, 0.003], r: 0.002, rx: 0.18 }] };
});
defineGun('scarh', 'rifle', (c) => {
  const { g, M, info, bl } = c, MS = Object.assign({}, M, { dark: M.tan }); // rails du boîtier sable (anodisés comme lui)
  // boîtier supérieur : chanfrein avant, rail de dessus continu, rails latéraux à l'avant, rail cranté dessous (dents apparentes)
  prof(g, M.tan, [[-0.43, 0.06, 0.004], [-0.42, 0.068, 0.004], [0.112, 0.068, 0.004], [0.116, 0.062, 0.003], [0.116, 0.01, 0.004], [-0.43, 0.004, 0.004]], 0.05, 0, 0.004, 0.004);
  rail(g, MS, 0, 0.072, -0.16, 0.54);
  for (const sx of [-1, 1]) rail(g, M, sx * 0.027, 0.036, -0.355, 0.09, true);
  rb(g, M.tan, 0, 0.004, -0.31, 0.024, 0.008, 0.2, 0.002);
  for (let i = 0; i < 15; i++) bx(g, M.tan, 0, -0.002, -0.4 + i * 0.013, 0.024, 0.004, 0.006);
  // allègements du haut, rainure du levier d'armement (flanc gauche), levier, port de bretelle, fenêtre d'éjection
  for (const sx of [-1, 1]) for (const z of [-0.395, -0.36, -0.325]) rb(g, M.rubber, sx * 0.0253, 0.058, z, 0.0016, 0.006, 0.026, 0.003);
  rb(g, M.rubber, -0.0253, 0.046, -0.215, 0.0016, 0.006, 0.2, 0.003);
  cy(g, M.dark, -0.03, 0.046, -0.3, 0.0035, 0.012, 0, 0, Math.PI / 2);
  cy(g, M.dark, -0.037, 0.046, -0.3, 0.0068, 0.008, 0, 0, Math.PI / 2);
  rb(g, M.dark, -0.0258, 0.022, -0.235, 0.003, 0.012, 0.034, 0.005);
  for (let i = 0; i < 3; i++) cy(g, M.metal, -0.0275, 0.022, -0.247 + i * 0.012, 0.0022, 0.002, 0, 0, Math.PI / 2);
  rb(g, M.rubber, 0.0258, 0.04, -0.03, 0.0016, 0.02, 0.07, 0.003);
  // boîtier inférieur : puits de chargeur, carcasse au-dessus du pontet, arrière qui remonte vers la charnière
  prof(g, M.tan, [[-0.194, 0.012, 0.003], [0.116, 0.012, 0.003], [0.116, -0.006, 0.006], [0.078, -0.03, 0.006], [0.03, -0.036, 0.004], [-0.064, -0.036, 0.004],
    [-0.07, -0.076, 0.006], [-0.188, -0.08, 0.006], [-0.194, -0.07, 0.004]], 0.048, 0, 0.004, 0.004);
  guard(g, M.tan, -0.066, 0.034, -0.034, -0.08, 0.0065, 0.006, 0.01);
  rb(g, M.dark, 0, -0.05, -0.034, 0.006, 0.034, 0.006, 0.002, 0.18);
  // arrêtoir de culasse et palette de chargeur (gauche), sélecteur des deux côtés, goupilles
  rb(g, M.dark, -0.0255, -0.004, -0.085, 0.003, 0.022, 0.008, 0.001, -0.15);
  rb(g, M.dark, -0.0255, -0.03, -0.1, 0.003, 0.008, 0.026, 0.002);
  for (const sx of [-1, 1]) { cy(g, M.dark, sx * 0.0255, -0.012, 0.01, 0.006, 0.003, 0, 0, Math.PI / 2); rb(g, M.dark, sx * 0.0268, -0.012, 0.022, 0.003, 0.006, 0.024, 0.001, 0.2); }
  for (const [z, y] of [[-0.02, 0.0], [0.07, -0.004]]) cy(g, M.metal, 0, y, z, 0.0032, 0.0504, 0, 0, Math.PI / 2);
  // poignée noire et ses plaques grenues
  gripProf(g, M.poly, 0.0365, -0.0015, 0.077, -0.12, 0.044, 0.032);
  for (const sx of [-1, 1]) rb(g, M.grip, sx * 0.0162, -0.068, 0.062, 0.002, 0.06, 0.026, 0.004, -0.33);
  // canon, écrou et bloc de gaz devant le boîtier, cache-flamme à bague (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.66 - bl;
  cy(g, M.dark, 0, 0.035, -0.442, 0.015, 0.026);
  cy(g, M.metal, 0, 0.035, (-0.455 + tip) / 2, 0.0105, Math.abs(tip + 0.455));
  if (!c.A.muzzle) {
    cy(g, M.metal, 0, 0.035, tip + 0.036, 0.0135, 0.072);
    cy(g, M.dark, 0, 0.035, tip + 0.076, 0.0158, 0.01);
    for (let i = 0; i < 4; i++) bx(g, M.rubber, Math.cos(i * 1.57) * 0.0136, 0.035 + Math.sin(i * 1.57) * 0.0136, tip + 0.022, 0.004, 0.004, 0.034);
  }
  // guidon rabattable à oreilles à l'avant du rail, hausse relevable à œilleton à l'arrière (rien si une optique les remplace) ; traits
  // en fraction de l'écran (06jb-formes.js), l'œilleton tenu par un montant
  info.sightY = 0.1045; info.adsZ = 0.285;
  if (!c.optic) {
    rb(g, M.dark, 0, 0.0815, -0.412, 0.016, 0.012, 0.022, 0.002);
    bx(g, M.sight, 0, 0.0945, -0.412, ironW(c, -0.412, IRON.post), 0.02, 0.004);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0068, 0.093, -0.412, 0.0018, 0.022, 0.006);
    rb(g, M.dark, 0, 0.0815, 0.075, 0.022, 0.012, 0.026, 0.002);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0105, 0.0975, 0.075, ironW(c, 0.075, IRON.wing), 0.022, 0.006); // à côté de l'anneau
    ironFoot(c, M.dark, 0.075, 0.087, ironRing(c, 0.075, IRON.hole.rifle), 0.012);
  }
  // charnière, crosse repliable : partie fixe et busc noir, partie télescopique, talon plongeant percé d'un passant, plaque striée
  // (variantes : sans crosse, embout sur la charnière ; renforcée, busc haut et plaque épaisse)
  prof(g, M.tan, [[0.112, 0.07, 0.003], [0.152, 0.07, 0.004], [0.154, -0.01, 0.004], [0.112, -0.012, 0.003]], 0.052, 0, 0.004, 0.004);
  let butt;
  if (c.stock === 'none') {
    rb(g, M.rubber, 0, 0.03, 0.157, 0.046, 0.07, 0.008, 0.003);
    butt = 0.161;
  } else {
    const hv = c.stock === 'heavy';
    prof(g, M.tan, [[0.148, 0.062, 0.003], [0.272, 0.062, 0.003], [0.272, 0.0, 0.004], [0.148, -0.006, 0.003]], 0.046, 0, 0.004, 0.004);
    prof(g, M.poly, [[0.155, hv ? 0.088 : 0.078, 0.01], [0.262, hv ? 0.084 : 0.074, 0.008], [0.27, 0.06, 0.004], [0.27, 0.03, 0.004], [0.155, 0.03, 0.004]], 0.05, 0, 0.004, 0.005);
    rb(g, M.dark, -0.0258, 0.058, 0.172, 0.003, 0.016, 0.016, 0.003);
    prof(g, M.tan, [[0.266, 0.058, 0.003], [0.334, 0.058, 0.003], [0.334, 0.004, 0.003], [0.266, 0.004, 0.003]], 0.042, 0, 0.004, 0.004);
    for (let i = 0; i < 6; i++) bx(g, M.rubber, -0.0213, 0.012, 0.28 + i * 0.009, 0.0016, 0.006, 0.0025);
    prof(g, M.tan, [[0.29, 0.008, 0.003], [0.335, 0.008, 0.003], [0.335, -0.112, 0.006], [0.318, -0.118, 0.006], [0.304, -0.04, 0.01]], 0.04, 0, 0.004, 0.004);
    rb(g, M.dark, -0.0205, -0.022, 0.322, 0.003, 0.018, 0.02, 0.003);
    const pd = hv ? 0.02 : 0.014;
    rb(g, M.rubber, 0, -0.03, 0.335 + pd / 2, 0.046, 0.184, pd, 0.006);
    for (let i = 0; i < 12; i++) bx(g, M.rubber, 0, 0.05 - i * 0.014, 0.3355 + pd, 0.04, 0.005, 0.003);
    butt = 0.336 + pd;
  }
  info.butt = [0, 0.0, butt];
  // chargeur droit de 7,62 (à peine courbe), nervures sur la face avant
  info.magHome.set(0, -0.074, -0.131);
  info.buildMag = (parent, ext) => curvedMag(parent, M, 6, 0.155 * ext, 0.03, 0.08, 0.12, M.dark);
  info.magAxis = new V3(0, -0.99, -0.12); info.magGrip = new V3(0, -0.075, -0.012);
  info.gripR.set(0, -0.06, 0.062); info.gripL.set(0, 0.036, -0.27);
  info.mount.optic = { y: 0.077, z: -0.1, len: 0.5, D: 0.26 };
  info.mount.muzzle = { x: 0, y: 0.035, z: tip, r: 0.0105 };
  info.mount.under = { y: -0.004, z: -0.31, len: 0.18 };
  info.mount.side = { x: -0.031, y: 0.036, z: -0.355 };
  info.muzzle.position.set(0, 0.035, tip - 0.01); info.eject.position.set(0.026, 0.04, -0.03);
  info.gripDef = {
    R: [{ c: [0, -0.07, 0.06], h: [0.016, 0.0525, 0.022], r: 0.01, rx: -0.33 }, { c: [0, -0.012, -0.04], h: [0.024, 0.024, 0.12], r: 0.006 }],
    L: [{ c: [0, 0.036, -0.31], h: [0.025, 0.032, 0.12], r: 0.006 }, { c: [0, 0.074, -0.3], h: [0.011, 0.006, 0.12], r: 0.002 },
      { c: [0.029, 0.036, -0.355], h: [0.006, 0.012, 0.045], r: 0.002 }, { c: [-0.029, 0.036, -0.355], h: [0.006, 0.012, 0.045], r: 0.002 }, { c: [0, 0.001, -0.31], h: [0.012, 0.005, 0.1], r: 0.002 }],
  };
  info.trigDef = { at: [0.004, -0.056, -0.046], xTip: -0.004, guard: [{ c: [0, -0.077, -0.016], h: [0.005, 0.003, 0.05], r: 0.002 }, { c: [0, -0.057, -0.063], h: [0.004, 0.022, 0.003], r: 0.002 },
    { c: [0, -0.035, -0.131], h: [0.024, 0.045, 0.061], r: 0.006 }, { c: [0, -0.052, -0.034], h: [0.003, 0.015, 0.003], r: 0.002, rx: 0.18 }] };
});
defineGun('famas', 'rifle', (c) => {
  const { g, M, info, bl } = c, B = M.poly, D0 = M.dark, K = M.rubber, sx2 = [-1, 1];
  const S = 0.0004485, D = 0.0186, P = (x, y, r) => { const q = [-0.07 + (x - 875) * S, 0.0371 - (y - 431) * S]; if (r !== undefined) q.push(r); return q; };
  const Q = (x, y, r) => { const q = P(x, y, r); q[0] += D; return q; }, R = (x, y, r) => (x < 985 ? P(x, y, r) : Q(x, y, r));
  const Pz = (x) => P(x, 0)[0], Qz = (x) => Pz(x) + D, Rz = (x) => R(x, 0)[0], Py = (y) => P(0, y)[1];
  const by = Py(431), w = 0.046;
  // grain fin sur les grandes faces (coordonnées de texture resserrées, sur une copie de la géométrie partagée)
  const fine = (m, k = 2.5) => { m.geometry = m.geometry.clone(); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return m; };

  // ----- coque d'un seul tenant : garde-mains (lèvre avant), boîtier, crosse et sa joue ; bloc arrière (sous la hausse), plus étroit -----
  fine(prof(g, B, [P(418, 400, 0.004), P(440, 391, 0.004), P(478, 388, 0.002), P(568, 384, 0.002), R(1062, 380, 0.002), Q(1206, 377, 0.004), Q(1250, 375, 0.004), Q(1475, 375, 0.004), Q(1490, 390, 0.004), Q(1550, 390, 0.006), Q(1580, 351, 0.008), Q(1598, 342, 0.004),
    Q(1760, 342, 0.006), Q(1782, 352, 0.006), Q(1796, 390, 0.004), Q(1797, 505, 0.006), Q(1776, 578, 0.008), Q(1745, 621, 0.006), Q(1668, 623, 0.008), Q(1550, 582, 0.008),
    Q(1475, 561, 0.006), Q(1402, 552, 0.002), Q(1400, 562, 0.002), Q(1250, 562, 0.002), Q(1222, 550, 0.006), Q(1192, 518, 0.008), Q(1130, 501, 0.006), Q(1090, 504, 0.004),
    R(1000, 515, 0.002), P(850, 516, 0.002), P(845, 533, 0.003), P(828, 529, 0.003), P(815, 518, 0.002), P(470, 512, 0.006), P(452, 502, 0.006), P(436, 484, 0.006),
    P(420, 470, 0.004)], w, 0, 0.004, 0.003));
  fine(prof(g, B, [Q(1062, 384, 0.002), Q(1070, 330, 0.006), Q(1100, 317, 0.006), Q(1192, 314, 0.004), Q(1203, 328, 0.004), Q(1207, 384, 0.002)], 0.032, 0, 0.004, 0.003));
  // plaque de couche, échancrures du dessous du garde-mains, bouton du flanc gauche
  prof(g, K, [Q(1784, 352, 0.004), Q(1796, 390, 0.003), Q(1803, 430, 0.004), Q(1801, 500, 0.004), Q(1790, 540, 0.006), Q(1776, 578, 0.004), Q(1772, 560, 0.004), Q(1782, 470, 0.004)], w - 0.004, 0, 0.003, 0.002);
  for (let k = 0; k < 5; k++) { const x = 545 + k * 60; for (const sx of sx2) prof(g, K, [P(x - 16, 511), P(x, 480, 0.002), P(x + 16, 511)], 0.0012, sx * (w / 2 + 0.0003), 0, 0.002); }
  { const q = P(690, 468); cy(g, D0, -(w / 2 + 0.0008), q[1], q[0], 0.0055, 0.002, 0, 0, Math.PI / 2); }
  // petit rail sur l'avant du garde-mains
  rb(g, D0, 0, Py(385), (Pz(478) + Pz(560)) / 2, 0.018, 0.004, Pz(560) - Pz(478), 0.001);
  for (let k = 0; k < 4; k++) bx(g, D0, 0, Py(379), Pz(486 + k * 21), 0.02, 0.004, 0.0045);

  // ----- tour du guidon (dessus en pente vers la poignée de transport), poignée de transport à rail, hausse -----
  fine(prof(g, B, [P(568, 386, 0.002), P(568, 312, 0.004), P(576, 305, 0.003), P(712, 327, 0.004), P(726, 321, 0.002), P(726, 380, 0.002)], 0.03, 0, 0.003, 0.003));
  prof(g, B, [P(722, 326, 0.002), R(1074, 326, 0.002), Q(1074, 345, 0.003), P(735, 345, 0.006), P(722, 352, 0.002)], 0.024, 0, 0.003, 0.002);
  for (let x = 727; x < 1062; x += 22.4) { const a = R(x, 322), b = R(x + 12, 322); bx(g, D0, 0, a[1], (a[0] + b[0]) / 2, 0.024, 0.0036, b[0] - a[0]); }
  // levier d'armement (flanc gauche) : moyeu, bras vers la poignée de transport, tige cintrée jusqu'au-dessus du chargeur, crochet
  const lx = -(w / 2 + 0.003);
  { const q = P(616, 395); cy(g, D0, lx + 0.001, q[1], q[0], 0.0098, 0.006, 0, 0, Math.PI / 2); cy(g, M.metal, lx - 0.0025, q[1], q[0], 0.004, 0.003, 0, 0, Math.PI / 2); }
  prof(g, D0, [P(605, 384, 0.004), P(700, 352, 0.006), P(770, 357, 0.004), P(782, 372, 0.004), P(770, 392, 0.004), P(705, 380, 0.006), P(626, 410, 0.004)], 0.004, lx + 0.001, 0.001, 0.003);
  const rod = [P(770, 398), P(900, 398), R(1000, 399), Q(1060, 406), Q(1120, 424), Q(1180, 447), Q(1230, 464), Q(1262, 470)];
  for (let i = 0; i < rod.length - 1; i++) {
    const a = rod[i], b = rod[i + 1], L = hyp(b[0] - a[0], b[1] - a[1]);
    cy(g, M.metal, lx - 0.001, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2, 0.0026, L + 0.003, Math.PI / 2 + Math.atan2(b[1] - a[1], a[0] - b[0]));
  }
  prof(g, D0, [Q(1255, 455, 0.002), Q(1272, 452, 0.002), Q(1280, 470, 0.003), Q(1272, 498, 0.003), Q(1262, 496, 0.002), Q(1264, 476, 0.002)], 0.005, lx, 0.001, 0.002);

  // ----- canon : bague au nez du garde-mains, canon à bagues lance-grenades, cache-flamme ouvert (remplacé par le dispositif de bouche) -----
  const tip = Pz(116) - bl;
  cz(g, D0, 0, by, (Pz(395) + Pz(420)) / 2, 0.0108, Pz(420) - Pz(395));
  cz(g, M.metal, 0, by, (tip + Pz(400)) / 2, 0.0076, Pz(400) - tip);
  for (let k = 0; k < 9; k++) part(g, G_TOR, M.metal, 0, by, Pz(286 + k * 12), 0.0074, 0.0074, 0.012);
  if (!c.A.muzzle) {
    cz(g, D0, 0, by, tip + (Pz(240) - Pz(116)) / 2, 0.011, Pz(240) - Pz(116));
    for (const s of [-1, 1]) bx(g, K, 0, by + s * 0.0045, tip + 0.022, 0.0224, 0.002, 0.03);
    cz(g, K, 0, by, tip - 0.0001, 0.0078, 0.0006);
  }

  // ----- pontet en fil, détente, poignée à reprises de doigts -----
  prof(g, M.metal, [P(830, 516, 0.002), P(833, 562, 0.008), P(846, 592, 0.008), P(870, 603, 0.006), P(932, 601, 0.008), P(962, 589, 0.008), P(975, 562, 0.006), P(978, 516, 0.002)], 0.005, 0, 0.0012, 0.002,
    [[P(838, 516, 0.001), P(841, 560, 0.008), P(851, 585, 0.008), P(871, 595, 0.006), P(930, 593, 0.008), P(955, 584, 0.008), P(967, 560, 0.006), P(970, 516, 0.001)]]);
  prof(g, D0, [P(864, 516), P(866, 532, 0.002), P(874, 560, 0.008), P(880, 586, 0.003), P(888, 586, 0.002), P(886, 558, 0.008), P(880, 532, 0.002), P(882, 516)], 0.006, 0, 0.0012, 0.0015);
  fine(prof(g, B, [P(976, 512, 0.002), R(985, 590, 0.006), Q(993, 612, 0.008), Q(1000, 628, 0.004), Q(1012, 642, 0.006), Q(1018, 662, 0.008), Q(1022, 682, 0.004), Q(1034, 694, 0.006),
    Q(1039, 712, 0.008), Q(1046, 731, 0.008), Q(1066, 739, 0.01), Q(1092, 732, 0.01), Q(1114, 721, 0.01), Q(1128, 708, 0.008), Q(1134, 686, 0.008), Q(1133, 655, 0.01),
    Q(1126, 622, 0.01), Q(1112, 592, 0.01), Q(1096, 570, 0.008), Q(1080, 548, 0.006), Q(1074, 520, 0.004), Q(1090, 503, 0.002)], 0.03, 0, 0.004, 0.003));
  // arrêtoir du chargeur
  prof(g, D0, [Q(1232, 556, 0.002), Q(1250, 556, 0.002), Q(1250, 598, 0.003), Q(1240, 622, 0.003), Q(1230, 620, 0.003), Q(1236, 592, 0.003)], 0.012, 0, 0.0015, 0.002);

  // ----- organes de visée fins (rien si une optique les remplace) : lame du guidon et ses oreilles sur la tour, œilleton sur le bloc
  // arrière, avec son montant et ses oreilles ; traits en fraction de l'écran (06jb-formes.js), pointe de la lame sur la ligne de
  // mire (elle était 0,5 mm dessous) -----
  const SY = Py(286), zr = Qz(1160), zf = Pz(593);
  info.sightY = SY; info.adsZ = zr + 0.19;
  if (!c.optic) {
    for (const sx of sx2) prof(g, D0, [P(583, 308), P(584, 290, 0.0008), P(600, 290, 0.0008), P(604, 309)], ironW(c, zf, IRON.ear), sx * 0.0062, 0.0004, 0.001);
    prof(g, M.sight, [P(588, 307), P(589, 286, 0.0005), P(596, 286, 0.0005), P(598, 308)], ironW(c, zf, IRON.post), 0, 0.0004, 0.0006);
    rb(g, D0, 0, Py(311), zr, 0.026, 0.006, 0.026, 0.002);
    ironFoot(c, D0, zr, Py(312), ironRing(c, zr, IRON.hole.rifle), 0.016);
    for (const sx of sx2) bx(g, D0, sx * 0.0102, (Py(312) + SY - 0.001) / 2, zr, ironW(c, zr, IRON.wing), SY - 0.001 - Py(312), 0.006);
  }

  // ----- chargeur droit (profond), à nervures, plaque de fond inclinée -----
  info.magHome.set(0, Py(560), Qz(1328));
  info.buildMag = (parent, ext) => {
    const e = (ext - 1) * 0.1, zf = Qz(1256) - Qz(1328), zb = Qz(1400) - Qz(1328), yf = (560 - 760) * S - e, yb = (560 - 795) * S - e;
    prof(parent, B, [[zf, 0.008, 0.002], [zf, yf, 0.005], [zb, yb, 0.004], [zb, 0.008, 0.002]], 0.028, 0, 0.003, 0.003);
    for (const z of [zf + 0.02, (zf + zb) / 2, zb - 0.02]) rb(parent, B, 0, (yf + yb) / 2 * 0.5, z, 0.0292, Math.abs(yf) * 0.8, 0.004, 0.0015);
  };
  info.magAxis = new V3(0, -1, 0); info.magGrip = new V3(0, (560 - 760) * S + 0.012, 0);
  info.magP = [0, Py(700), Qz(1328)];

  // ----- mains, visée, montages -----
  info.butt = [0, Py(470), Qz(1803)];
  info.gripR.set(0, Py(594), Qz(1052)); info.gripL.set(0, Py(452), Pz(610));
  info.mount.optic = { y: Py(320), z: (Pz(735) + Qz(1050)) / 2, len: Qz(1050) - Pz(735), D: 0.27 };
  info.mount.muzzle = { x: 0, y: by, z: tip, r: 0.0076 };
  info.mount.under = { y: Py(511), z: Pz(650), len: 0.1 };
  info.mount.side = { x: -(w / 2 + 0.0025), y: Py(440), z: Pz(510) };
  info.muzzle.position.set(0, by, tip - 0.01); info.eject.position.set(w / 2 + 0.002, Py(420), Qz(1150));
  info.gripDef = {
    R: [{ c: [0, Py(640), Qz(1062)], h: [0.015, 0.05, 0.024], r: 0.01, rx: -0.4 }, { c: [0, Py(470), Qz(1040)], h: [0.023, 0.02, 0.05], r: 0.006 }],
    L: [{ c: [0, Py(450), Pz(640)], h: [w / 2, (512 - 388) / 2 * S, (Pz(830) - Pz(440)) / 2], r: 0.008 }],
  };
  // index sur le bas de la détente (sa face avant à x 866) ; le pontet en fil n'est pas une forme de prise : le doigt s'y accrochait
  info.trigDef = { at: [0.004, Py(585), Pz(866) - 0.0085], xTip: -0.004, guard: [] };
});
/* ---- 06m-modeles-pm.js ---- */
const MP7_MAG = { u: [0.0948, -0.9955], n: [0.9955, 0.0948] };
defineGun('mp7', 'smg', (c) => {
  const { g, M, info, bl } = c;
  // boîtier d'un bloc, rail de dessus ; avant : rails latéraux, rail cranté dessous (dents apparentes), fentes d'aération
  prof(g, M.poly, [[-0.22, 0.08, 0.004], [0.151, 0.08, 0.004], [0.155, 0.075, 0.004], [0.155, 0.006, 0.004], [-0.218, 0.01, 0.004]], 0.04, 0, 0.004, 0.004);
  rail(g, M, 0, 0.084, -0.03, 0.36);
  for (const sx of [-1, 1]) rail(g, M, sx * 0.021, 0.033, -0.153, 0.105, true);
  rb(g, M.dark, 0, 0.006, -0.153, 0.022, 0.008, 0.105, 0.002);
  for (let i = 0; i < 8; i++) bx(g, M.dark, 0, 0.001, -0.2 + i * 0.013, 0.022, 0.004, 0.006);
  for (const sx of [-1, 1]) {
    for (const [z0, z1] of [[-0.195, -0.14], [-0.133, -0.069]]) rb(g, M.rubber, sx * 0.0208, 0.069, (z0 + z1) / 2, 0.0016, 0.005, z1 - z0, 0.002);
    rb(g, M.rubber, sx * 0.0208, 0.064, 0.055, 0.0016, 0.002, 0.16, 0.0008); // joint du boîtier arrière
    rb(g, M.rubber, sx * 0.0208, 0.054, 0.107, 0.0016, 0.008, 0.058, 0.003); // fente du levier d'armement
  }
  // levier d'armement en T à l'arrière, sélecteur, fenêtre d'éjection, goupilles
  rb(g, M.metal, 0, 0.07, 0.158, 0.044, 0.012, 0.01, 0.003);
  rb(g, M.metal, -0.0215, 0.018, -0.005, 0.003, 0.007, 0.02, 0.001, 0.3);
  rb(g, M.rubber, 0.0208, 0.05, 0.03, 0.0016, 0.016, 0.045, 0.002);
  for (const [z, y] of [[0.002, 0.024], [0.043, 0.016], [0.142, 0.016]]) cy(g, M.dark, 0, y, z, 0.003, 0.0424, 0, 0, Math.PI / 2);
  // pontet anguleux (bloc plein au-dessus de l'ouverture), détente, poignée qui loge le chargeur, plaques grenues, bouton de chargeur
  prof(g, M.poly, [[-0.094, 0.008, 0], [-0.094, -0.04, 0.008], [-0.082, -0.048, 0.008], [0.004, -0.048, 0.006], [0.012, -0.036, 0.004], [0.012, 0.008, 0]], 0.014, 0, 0.003, 0.004,
    [[[-0.084, -0.004, 0.003], [-0.084, -0.04, 0.006], [0.004, -0.04, 0.006], [0.004, -0.004, 0.003]]]);
  rb(g, M.metal, 0, -0.012, -0.046, 0.006, 0.034, 0.006, 0.002, 0.18);
  gripProf(g, M.poly, 0.033, 0.022, 0.045, -0.104, 0.058, 0.034, 0.002);
  for (const sx of [-1, 1]) rb(g, M.grip, sx * 0.0175, -0.06, 0.042, 0.002, 0.07, 0.03, 0.004, -0.095);
  for (const sx of [-1, 1]) cy(g, M.dark, sx * 0.017, -0.014, 0.018, 0.0045, 0.004, 0, 0, Math.PI / 2);
  // canon court, écrou de la face avant, cache-flamme (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.265 - Math.max(bl, -0.02), mz = !!c.A.muzzle;
  cy(g, M.dark, 0, 0.034, -0.222, 0.01, 0.006);
  cy(g, M.metal, 0, 0.034, (-0.22 + (mz ? tip : tip + 0.03)) / 2, 0.0055, Math.abs((mz ? tip : tip + 0.03) + 0.22));
  if (!mz) { cy(g, M.dark, 0, 0.034, tip + 0.017, 0.0088, 0.034); for (const sx of [-1, 1]) rb(g, M.rubber, sx * 0.0084, 0.034, tip + 0.012, 0.0016, 0.004, 0.018, 0.0008); }
  // organes de visée relevables sur le rail (rien si une optique les remplace) ; traits en fraction de l'écran (06jb-formes.js)
  info.sightY = 0.108; info.adsZ = 0.216;
  if (!c.optic) {
    rb(g, M.dark, 0, 0.091, -0.174, 0.02, 0.01, 0.018, 0.002);
    bx(g, M.sight, 0, 0.099, -0.174, ironW(c, -0.174, IRON.post), 0.018, 0.004);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0085, 0.097, -0.174, ironW(c, -0.174, IRON.ear), 0.016, 0.012);
    rb(g, M.dark, 0, 0.092, 0.086, 0.022, 0.012, 0.022, 0.002);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0102, 0.1, 0.086, ironW(c, 0.086, IRON.wing), 0.016, 0.006);
    ironFoot(c, M.dark, 0.086, 0.0975, ironRing(c, 0.086, IRON.hole.smg), 0.01);
  }
  // charnière et verrou de crosse, puis crosse coulissante : bras, corps à talon plongeant percé d'une lumière, bouton, plaque
  // de couche (variantes : sans crosse, embout court ; renforcée, talon épais et busc)
  prof(g, M.poly, [[0.148, 0.07, 0.004], [0.19, 0.066, 0.004], [0.19, 0.01, 0.004], [0.148, 0.005, 0.004]], 0.036, 0, 0.004, 0.004);
  for (const sx of [-1, 1]) for (const y of [0.03, 0.055]) cy(g, M.metal, sx * 0.0185, y, 0.17, 0.0055, 0.004, 0, 0, Math.PI / 2);
  let butt;
  if (c.stock === 'none') {
    rb(g, M.rubber, 0, 0.038, 0.193, 0.038, 0.06, 0.008, 0.003);
    butt = 0.197;
  } else {
    const hv = c.stock === 'heavy', w = hv ? 0.044 : 0.04;
    rb(g, M.poly, 0, 0.0435, 0.2, 0.026, 0.03, 0.026, 0.004);
    prof(g, M.poly, [[0.21, 0.066, 0.004], [0.307, 0.066, 0.006], [0.31, 0.06, 0.004], [0.31, -0.044, 0.006], [0.27, -0.044, 0.006], [0.262, -0.03, 0.006], [0.262, 0.018, 0.006], [0.21, 0.018, 0.004]], w, 0, 0.004, 0.004,
      [[[0.272, 0.008, 0.003], [0.29, 0.008, 0.003], [0.29, -0.034, 0.003], [0.272, -0.034, 0.003]]]);
    rb(g, M.dark, -w / 2 - 0.0005, 0.05, 0.232, 0.002, 0.012, 0.018, 0.0008);
    if (hv) rb(g, M.poly, 0, 0.072, 0.255, 0.03, 0.014, 0.08, 0.004);
    const pd = hv ? 0.014 : 0.008;
    rb(g, M.rubber, 0, 0.011, 0.31 + pd / 2, w, 0.11, pd, 0.003);
    butt = 0.31 + pd;
  }
  info.butt = [0, 0.02, butt];
  // chargeur dans la poignée : le haut monte dans la poignée, le reste dépasse dessous, plaque de talon débordante
  info.magHome.set(0, -0.104, 0.045);
  info.buildMag = (parent, ext) => {
    const { u, n } = MP7_MAG, h = 0.022, s0 = -0.1, s1 = 0.088 + (ext - 1) * 0.1, P = (s, k) => [u[0] * s + n[0] * k, u[1] * s + n[1] * k];
    prof(parent, M.poly, [P(s0, -h), P(s0, h), P(s1, h), P(s1, -h)], 0.026, 0, 0.003, 0.003);
    const b = P(s1 + 0.005, 0);
    rb(parent, M.dark, 0, b[1], b[0], 0.032, 0.012, 0.052, 0.003, -0.095);
  };
  info.magAxis = new V3(0, MP7_MAG.u[1], MP7_MAG.u[0]); info.magGrip = new V3(0, -0.0299, 0.0028);
  info.gripR.set(0, -0.045, 0.04); info.gripL.set(0, 0.034, -0.16);
  info.mount.optic = { y: 0.089, z: 0.0, len: 0.36, D: 0.21 };
  info.mount.muzzle = { x: 0, y: 0.034, z: tip, r: 0.0055 };
  info.mount.under = { y: 0.002, z: -0.16, len: 0.1 };
  info.mount.side = { x: -0.025, y: 0.033, z: -0.16 };
  info.muzzle.position.set(0, 0.034, tip - 0.01); info.eject.position.set(0.021, 0.05, 0.03);
  info.gripDef = {
    R: [{ c: [0, -0.045, 0.04], h: [0.017, 0.055, 0.029], r: 0.01, rx: -0.095 }, { c: [0, 0.03, 0.0], h: [0.02, 0.025, 0.09], r: 0.008 }],
    L: [{ c: [0, 0.034, -0.16], h: [0.02, 0.032, 0.06], r: 0.008 }, { c: [0, 0.006, -0.153], h: [0.011, 0.004, 0.053], r: 0.002 },
      { c: [-0.021, 0.033, -0.153], h: [0.005, 0.012, 0.053], r: 0.002 }, { c: [0.021, 0.033, -0.153], h: [0.005, 0.012, 0.053], r: 0.002 }],
  };
  info.trigDef = { at: [0.004, -0.03, -0.058], xTip: -0.004, guard: [{ c: [0, -0.044, -0.04], h: [0.007, 0.004, 0.045], r: 0.002 }, { c: [0, -0.02, -0.089], h: [0.007, 0.028, 0.005], r: 0.002 },
    { c: [0, -0.012, -0.046], h: [0.003, 0.017, 0.003], r: 0.002, rx: 0.18 }] };
});
const UMP_MAG = { u: [-0.181, -0.983], n: [0.983, -0.181] };
defineGun('ump45', 'smg', (c) => {
  const { g, M, info, bl } = c;
  // boîtier : dessus droit, arrière chanfreiné ; rail de dessus sur toute la longueur
  prof(g, M.poly, [[-0.346, 0.073, 0.004], [0.026, 0.073, 0.004], [0.053, 0.06, 0.004], [0.058, 0.054, 0.004], [0.058, 0.004, 0.004], [-0.346, 0.002, 0.004]], 0.044, 0, 0.004, 0.004);
  rail(g, M, 0, 0.077, -0.17, 0.34);
  // garde-main : rails latéraux, rail cranté dessous (dents apparentes)
  for (const sx of [-1, 1]) rail(g, M, sx * 0.0225, 0.044, -0.283, 0.115, true);
  rb(g, M.dark, 0, 0.0, -0.284, 0.024, 0.008, 0.12, 0.002);
  for (let i = 0; i < 9; i++) bx(g, M.dark, 0, -0.005, -0.337 + i * 0.013, 0.024, 0.004, 0.006);
  // fentes d'allègement et joint du boîtier sur les deux flancs, levier d'armement à l'avant gauche, sélecteur, fenêtre d'éjection
  for (const sx of [-1, 1]) {
    for (const [zc, l] of [[-0.198, 0.04], [-0.125, 0.038], [-0.048, 0.04], [0.017, 0.036]]) rb(g, M.rubber, sx * 0.0228, 0.042, zc, 0.0016, 0.008, l, 0.003);
    rb(g, M.rubber, sx * 0.0228, 0.02, -0.028, 0.0016, 0.003, 0.11, 0.001);
  }
  rb(g, M.rubber, -0.0228, 0.064, -0.27, 0.0016, 0.005, 0.095, 0.002);
  rb(g, M.metal, -0.0255, 0.064, -0.31, 0.007, 0.009, 0.014, 0.002);
  rb(g, M.metal, -0.0232, 0.026, -0.01, 0.003, 0.007, 0.022, 0.001, 0.3);
  rb(g, M.rubber, 0.0228, 0.05, -0.06, 0.0016, 0.018, 0.05, 0.002);
  for (const [z, y] of [[-0.188, 0.013], [-0.094, 0.031], [-0.03, 0.009]]) cy(g, M.dark, 0, y, z, 0.003, 0.0464, 0, 0, Math.PI / 2);
  // puits de chargeur sous le boîtier, palette de déverrouillage derrière lui
  prof(g, M.poly, [[-0.2, 0.006, 0.002], [-0.181, -0.042, 0.004], [-0.116, -0.042, 0.004], [-0.104, -0.02, 0.004], [-0.094, 0.006, 0.002]], 0.046, 0, 0.003, 0.004);
  prof(g, M.poly, [[-0.114, -0.03, 0.002], [-0.098, -0.03, 0.002], [-0.096, -0.066, 0.004], [-0.108, -0.068, 0.004]], 0.03, 0, 0.003, 0.003);
  // pontet intégré (bloc de détente plein au-dessus de l'ouverture), détente, poignée inclinée et son talon, plaques grenues
  prof(g, M.poly, [[-0.095, 0.006, 0], [-0.095, -0.046, 0.008], [-0.082, -0.055, 0.008], [0.008, -0.055, 0.004], [0.016, -0.04, 0.004], [0.016, 0.006, 0]], 0.016, 0, 0.003, 0.004,
    [[[-0.083, -0.014, 0.004], [-0.083, -0.046, 0.007], [-0.006, -0.046, 0.006], [0.0, -0.014, 0.004]]]);
  rb(g, M.metal, 0, -0.028, -0.046, 0.006, 0.03, 0.006, 0.002, 0.18);
  gripProf(g, M.poly, 0.02, 0.0, 0.058, -0.132, 0.042, 0.032);
  prof(g, M.poly, [[0.03, 0.006, 0.002], [0.058, 0.006, 0.002], [0.06, -0.012, 0.004], [0.046, -0.03, 0.004]], 0.03, 0, 0.003, 0.003);
  for (const sx of [-1, 1]) rb(g, M.grip, sx * 0.0165, -0.078, 0.0425, 0.002, 0.05, 0.022, 0.003, -0.28);
  // canon court, écrou de la face avant, protège-filetage (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.378 - Math.max(bl, -0.02);
  cy(g, M.dark, 0, 0.037, -0.349, 0.012, 0.008);
  cy(g, M.metal, 0, 0.037, (-0.346 + tip) / 2, 0.0095, Math.abs(tip + 0.346));
  if (!c.A.muzzle) cy(g, M.dark, 0, 0.037, tip + 0.009, 0.011, 0.018);
  // organes de visée relevables sur le rail (rien si une optique les remplace) ; traits en fraction de l'écran (06jb-formes.js), pointe
  // du guidon sur la ligne de mire (elle la dépassait de 0,5 mm)
  info.sightY = 0.1015; info.adsZ = 0.136;
  if (!c.optic) {
    rb(g, M.dark, 0, 0.083, -0.327, 0.02, 0.012, 0.018, 0.002);
    bx(g, M.sight, 0, (0.084 + 0.1015) / 2, -0.327, ironW(c, -0.327, IRON.post), 0.1015 - 0.084, 0.004);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0085, 0.091, -0.327, ironW(c, -0.327, IRON.ear), 0.016, 0.012);
    rb(g, M.dark, 0, 0.084, 0.006, 0.022, 0.014, 0.022, 0.002);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0102, 0.094, 0.006, ironW(c, 0.006, IRON.wing), 0.016, 0.006);
    ironFoot(c, M.dark, 0.006, 0.0905, ironRing(c, 0.006, IRON.hole.smg), 0.01);
  }
  // charnière de crosse, puis crosse pliante : bras du dessus, bras en biais, talon et plaque de couche, grand évidement
  // (variantes : sans crosse, embout court ; renforcée, talon épais et busc)
  prof(g, M.poly, [[0.05, 0.062, 0.004], [0.082, 0.056, 0.004], [0.084, -0.006, 0.004], [0.05, -0.004, 0.004]], 0.036, 0, 0.004, 0.004);
  rb(g, M.rubber, -0.0185, 0.03, 0.068, 0.0016, 0.02, 0.008, 0.003);
  let butt;
  if (c.stock === 'none') {
    rb(g, M.poly, 0, 0.026, 0.09, 0.034, 0.06, 0.016, 0.006);
    rb(g, M.rubber, 0, 0.026, 0.101, 0.036, 0.064, 0.008, 0.003);
    butt = 0.105;
  } else {
    const hv = c.stock === 'heavy';
    prof(g, M.poly, [[0.078, 0.046, 0.004], [0.29, 0.046, 0.006], [0.29, -0.068, 0.006], [0.248, -0.068, 0.006], [0.084, -0.006, 0.004]], hv ? 0.036 : 0.03, 0, 0.004, 0.004,
      [[[0.108, 0.026, 0.006], [0.236, 0.026, 0.008], [0.236, -0.043, 0.006], [0.118, 0.004, 0.006]]]);
    rb(g, M.rubber, -0.0155, 0.035, 0.262, 0.0016, 0.006, 0.026, 0.002);
    if (hv) rb(g, M.poly, 0, 0.055, 0.19, 0.03, 0.014, 0.12, 0.004);
    const pd = hv ? 0.018 : 0.012;
    rb(g, M.rubber, 0, -0.011, 0.29 + pd / 2, hv ? 0.044 : 0.038, 0.116, pd, 0.005);
    butt = 0.29 + pd;
  }
  info.butt = [0, -0.01, butt];
  // long chargeur droit, incliné vers l'avant : le haut monte dans le puits, plaque de talon débordante
  info.magHome.set(0, -0.04, -0.15);
  info.buildMag = (parent, ext) => {
    const { u, n } = UMP_MAG, h = 0.022, s0 = -0.07, s1 = 0.19 + (ext - 1) * 0.15, P = (s, k) => [u[0] * s + n[0] * k, u[1] * s + n[1] * k];
    prof(parent, M.poly, [P(s0, -h), P(s0, h), P(s1, h), P(s1, -h)], 0.026, 0, 0.003, 0.003);
    for (const sx of [-1, 1]) { const a = P((s1 + 0.03) / 2, 0); rb(parent, M.rubber, sx * 0.0133, a[1], a[0], 0.0016, s1 - 0.09, 0.012, 0.004, 0.182); }
    const b = P(s1 + 0.005, 0);
    rb(parent, M.dark, 0, b[1], b[0], 0.032, 0.012, 0.05, 0.003, 0.182);
  };
  info.magAxis = new V3(0, UMP_MAG.u[1], UMP_MAG.u[0]); info.magGrip = new V3(0, -0.0344, -0.0063);
  info.gripR.set(0, -0.06, 0.043); info.gripL.set(0, 0.037, -0.285);
  info.mount.optic = { y: 0.082, z: -0.14, len: 0.34, D: 0.21 };
  info.mount.muzzle = { x: 0, y: 0.037, z: tip, r: 0.0095 };
  info.mount.under = { y: -0.007, z: -0.29, len: 0.12 };
  info.mount.side = { x: -0.0265, y: 0.044, z: -0.3 };
  info.muzzle.position.set(0, 0.037, tip - 0.01); info.eject.position.set(0.023, 0.05, -0.06);
  info.gripDef = {
    R: [{ c: [0, -0.068, 0.042], h: [0.016, 0.06, 0.021], r: 0.01, rx: -0.28 }, { c: [0, 0.03, -0.03], h: [0.022, 0.03, 0.1], r: 0.006 }],
    L: [{ c: [0, 0.037, -0.285], h: [0.022, 0.036, 0.06], r: 0.008 }, { c: [0, -0.003, -0.285], h: [0.012, 0.006, 0.06], r: 0.002 },
      { c: [-0.0225, 0.044, -0.283], h: [0.006, 0.012, 0.058], r: 0.002 }, { c: [0.0225, 0.044, -0.283], h: [0.006, 0.012, 0.058], r: 0.002 }],
  };
  info.trigDef = { at: [0.004, -0.036, -0.058], xTip: -0.004, guard: [{ c: [0, -0.0505, -0.04], h: [0.008, 0.0045, 0.045], r: 0.002 }, { c: [0, -0.025, -0.089], h: [0.008, 0.03, 0.006], r: 0.002 },
    { c: [0, -0.028, -0.046], h: [0.003, 0.015, 0.003], r: 0.002, rx: 0.18 }, { c: [0, -0.018, -0.148], h: [0.023, 0.024, 0.032], r: 0.004 }] };
});
const VEC_MAG = { u: [0.208, -0.978], n: [0.978, 0.208] };
defineGun('vector', 'smg', (c) => {
  const { g, M, info, bl } = c;
  // boîtier supérieur et rail, plaque avant
  prof(g, M.dark, [[-0.31, 0.058, 0.004], [0.086, 0.058, 0.006], [0.086, 0.016, 0.004], [-0.306, 0.016, 0.002], [-0.31, 0.022, 0.002]], 0.046, 0, 0.003, 0.004);
  rail(g, M, 0, 0.062, -0.135, 0.33);
  rb(g, M.poly, 0, 0.005, -0.3105, 0.046, 0.106, 0.008, 0.003);
  // partie avant sable : dessus droit, coupe en biais vers le pontet, puits de chargeur, bas qui remonte le long du montant
  prof(g, M.tan, [[-0.306, 0.02, 0.003], [-0.117, 0.02, 0.004], [-0.086, -0.012, 0.006], [-0.062, -0.055, 0.004], [-0.062, -0.112, 0.004],
    [-0.154, -0.118, 0.003], [-0.199, -0.022, 0.004], [-0.204, -0.014, 0.002], [-0.306, -0.014, 0.003]], 0.05, 0, 0.003, 0.004);
  // bloc avant sous le canon (rail court de la poignée), montant avant cranté, lèvre du puits
  prof(g, M.poly, [[-0.31, -0.008, 0.003], [-0.206, -0.008, 0.002], [-0.212, -0.048, 0.004], [-0.308, -0.048, 0.004]], 0.044, 0, 0.003, 0.004);
  rail(g, M, 0, -0.052, -0.27, 0.07);
  prof(g, M.poly, [[-0.219, -0.008, 0.002], [-0.204, -0.008, 0.002], [-0.151, -0.123, 0.003], [-0.167, -0.123, 0.003]], 0.052, 0, 0.002, 0.002);
  for (let i = 1; i <= 7; i++) { const t = i * 0.0155; bx(g, M.poly, 0, -0.008 - 0.911 * t - 0.0006, -0.219 + 0.412 * t - 0.0012, 0.05, 0.004, 0.003, -0.42); }
  rb(g, M.poly, 0, -0.118, -0.108, 0.052, 0.008, 0.094, 0.003);
  // goupilles, lumière en biais sur les flancs
  for (const [z, y] of [[-0.296, -0.002], [-0.228, -0.002], [-0.139, -0.038], [-0.12, -0.094], [-0.098, -0.05]]) cy(g, M.dark, 0, y, z, 0.0038, 0.0532, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) rb(g, M.rubber, sx * 0.0255, -0.062, -0.172, 0.0016, 0.064, 0.011, 0.005, -0.44);
  // arrière noir : carcasse au-dessus du pontet, pontet massif percé d'une ouverture (l'index y entre devant la détente), détente,
  // poignée et son talon
  prof(g, M.poly, [[-0.119, 0.019, 0.002], [0.086, 0.019, 0.004], [0.086, -0.006, 0.006], [0.03, -0.02, 0.004], [-0.052, -0.02, 0.003], [-0.058, -0.04, 0.003], [-0.064, -0.058, 0.002], [-0.088, -0.012, 0.002]], 0.042, 0, 0.003, 0.004);
  prof(g, M.poly, [[-0.066, -0.014, 0], [-0.066, -0.088, 0.006], [-0.056, -0.1, 0.008], [0.03, -0.1, 0.008], [0.046, -0.088, 0.006], [0.04, -0.014, 0]], 0.018, 0, 0.003, 0.004,
    [[[-0.056, -0.022, 0.002], [-0.056, -0.084, 0.005], [0.03, -0.084, 0.005], [0.02, -0.022, 0.002]]]);
  rb(g, M.metal, 0, -0.039, -0.04, 0.006, 0.034, 0.006, 0.002, 0.18);
  gripProf(g, M.poly, 0.036, -0.002, 0.078, -0.122, 0.044, 0.032);
  prof(g, M.poly, [[0.064, -0.004, 0.002], [0.092, -0.004, 0.004], [0.094, -0.02, 0.006], [0.074, -0.03, 0.004]], 0.03, 0, 0.003, 0.003);
  // levier d'armement à l'avant gauche et sa fente, sélecteur, fenêtre d'éjection à droite, plaque de bretelle
  rb(g, M.metal, -0.0245, 0.026, -0.262, 0.005, 0.008, 0.07, 0.002);
  rb(g, M.rubber, -0.0232, 0.026, -0.175, 0.0016, 0.004, 0.1, 0.0008);
  rb(g, M.metal, -0.0222, 0.002, -0.004, 0.003, 0.007, 0.022, 0.0012, 0.25);
  rb(g, M.rubber, 0.0237, 0.036, -0.035, 0.0016, 0.016, 0.056, 0.001);
  rb(g, M.metal, -0.0235, 0.036, 0.07, 0.004, 0.014, 0.02, 0.0015);
  // canon bas, écrou de la plaque avant, protège-filetage (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.37 - Math.max(bl, -0.04);
  cy(g, M.dark, 0, 0, -0.318, 0.011, 0.012);
  cy(g, M.metal, 0, 0, (-0.314 + tip) / 2, 0.0075, Math.abs(tip + 0.314));
  if (!c.A.muzzle) { cy(g, M.dark, 0, 0, tip + 0.011, 0.0092, 0.022); cy(g, M.metal, 0, 0, tip + 0.002, 0.0085, 0.004); }
  // organes de visée relevables sur le rail : guidon à oreilles, hausse à œilleton (rien si une optique les remplace) ; traits en
  // fraction de l'écran (06jb-formes.js)
  info.sightY = 0.0895; info.adsZ = 0.124;
  if (!c.optic) {
    rb(g, M.dark, 0, 0.0715, -0.285, 0.02, 0.009, 0.02, 0.002);
    bx(g, M.sight, 0, 0.0805, -0.285, ironW(c, -0.285, IRON.post), 0.018, 0.004);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0085, 0.079, -0.285, ironW(c, -0.285, IRON.ear), 0.016, 0.012);
    rb(g, M.dark, 0, 0.0725, -0.006, 0.022, 0.011, 0.024, 0.002);
    for (const sx of [-1, 1]) bx(g, M.dark, sx * 0.0102, 0.0855, -0.006, ironW(c, -0.006, IRON.wing), 0.016, 0.006);
    ironFoot(c, M.dark, -0.006, 0.0775, ironRing(c, -0.006, IRON.hole.smg), 0.01);
  }
  // crosse squelette : bras dans le prolongement du boîtier, jambe en biais, talon épais et plaque de couche
  // (variantes : rentrée, simple embout ; renforcée, talon plus large et busc)
  let butt;
  if (c.stock === 'none') {
    rb(g, M.poly, 0, 0.026, 0.096, 0.034, 0.05, 0.024, 0.006);
    rb(g, M.rubber, 0, 0.026, 0.111, 0.036, 0.054, 0.008, 0.003);
    butt = 0.115;
  } else {
    const hv = c.stock === 'heavy';
    prof(g, M.poly, [[0.08, 0.054, 0.004], [0.205, 0.05, 0.006], [0.218, 0.036, 0.006], [0.218, 0.004, 0.006], [0.18, 0.002, 0.004], [0.11, 0.006, 0.006], [0.08, -0.004, 0.004]], 0.032, 0, 0.004, 0.004);
    prof(g, M.poly, [[0.168, 0.008, 0.002], [0.192, 0.008, 0.002], [0.226, -0.098, 0.003], [0.206, -0.104, 0.003]], 0.024, 0, 0.003, 0.003);
    prof(g, M.poly, [[0.208, 0.044, 0.008], [0.25, 0.048, 0.006], [0.25, -0.112, 0.006], [0.2, -0.11, 0.008]], hv ? 0.048 : 0.04, 0, 0.005, 0.006);
    const pd = hv ? 0.02 : 0.014;
    rb(g, M.rubber, 0, -0.032, 0.249 + pd / 2, hv ? 0.052 : 0.044, 0.164, pd, 0.006);
    if (hv) rb(g, M.poly, 0, 0.061, 0.15, 0.03, 0.014, 0.1, 0.004);
    butt = 0.249 + pd;
  }
  info.butt = [0, 0.0, butt];
  // chargeur droit, incliné : le haut monte dans le puits, la plaque de talon dépasse de tous les côtés
  info.magHome.set(0, -0.114, -0.12);
  info.buildMag = (parent, ext) => {
    const { u, n } = VEC_MAG, h = 0.021, s0 = -0.062, s1 = 0.128 + (ext - 1) * 0.13, P = (s, k) => [u[0] * s + n[0] * k, u[1] * s + n[1] * k];
    prof(parent, M.poly, [P(s0, -h), P(s0, h), P(s1, h), P(s1, -h)], 0.026, 0, 0.003, 0.003);
    const b = P(s1 + 0.005, 0);
    rb(parent, M.dark, 0, b[1], b[0], 0.032, 0.012, 0.05, 0.003, -0.21);
  };
  info.magAxis = new V3(0, VEC_MAG.u[1], VEC_MAG.u[0]); info.magGrip = new V3(0, -0.034, 0.0073);
  info.gripR.set(0, -0.06, 0.064); info.gripL.set(0, -0.02, -0.27);
  info.mount.optic = { y: 0.0665, z: -0.11, len: 0.3, D: 0.21 };
  info.mount.muzzle = { x: 0, y: 0, z: tip, r: 0.0075 };
  info.mount.under = { y: -0.056, z: -0.272, len: 0.07 };
  info.mount.side = { x: -0.0255, y: -0.002, z: -0.262 };
  info.muzzle.position.set(0, 0, tip - 0.01); info.eject.position.set(0.024, 0.036, -0.035);
  info.gripDef = {
    R: [{ c: [0, -0.068, 0.062], h: [0.016, 0.054, 0.022], r: 0.01, rx: -0.33 }, { c: [0, 0.0, -0.01], h: [0.021, 0.02, 0.095], r: 0.006 }],
    L: [{ c: [0, -0.028, -0.262], h: [0.022, 0.02, 0.048], r: 0.006 }, { c: [0, 0.003, -0.262], h: [0.025, 0.018, 0.048], r: 0.006 }],
  };
  info.trigDef = { at: [0.004, -0.05, -0.05], xTip: -0.004, guard: [{ c: [0, -0.092, -0.013], h: [0.009, 0.008, 0.05], r: 0.003 }, { c: [0, -0.055, -0.061], h: [0.009, 0.041, 0.005], r: 0.002 }, { c: [0, -0.039, -0.04], h: [0.003, 0.017, 0.003], r: 0.002, rx: 0.18 }] };
  // poignée verticale sous l'avant, empoignée par la main gauche ; un accessoire sous le canon la remplace
  if (!c.A.under) {
    rb(g, M.dark, 0, -0.061, -0.264, 0.03, 0.01, 0.04, 0.003);
    rb(g, M.poly, 0, -0.1, -0.264, 0.026, 0.072, 0.032, 0.009);
    for (let i = 0; i < 4; i++) rb(g, M.rubber, 0, -0.078 - i * 0.015, -0.264, 0.0275, 0.004, 0.0335, 0.002);
    rb(g, M.poly, 0, -0.138, -0.264, 0.03, 0.006, 0.036, 0.003);
    underGrip(c, { c: [0, -0.1, -0.264], h: [0.013, 0.036, 0.016], r: 0.009 }, 'Lv');
  }
});
/* ---- 06n-modeles-precision.js ---- */
function scopeEnd(g, M, y, z, r, r0, dir, depth, wall = M.dark, rim = M.dark) {
  const zc = z - (dir * depth) / 2, zl = z - dir * depth, rf = dir < 0 ? r : r0, rr = dir < 0 ? r0 : r;
  cone(g, wall, 0, y, zc, rf, rr, depth, 20, true);
  cone(g, M.tube, 0, y, zc, rf * 0.93, rr * 0.93, depth, 20, true);
  part(g, G_TOR, rim, 0, y, z, r * 0.96, r * 0.96, r * 0.6);
  cy(g, M.glass, 0, y, zl + dir * 0.0008, r0 * 0.93, 0.0016);
  part(g, G_CYL12, M.glint, -r0 * 0.38, y + r0 * 0.38, zl + dir * 0.0019, r0 * 0.2, 0.0002, r0 * 0.11, Math.PI / 2, 0.8, 0);
  part(g, G_TOR, M.dark, 0, y, zl + dir * 0.0018, r0 * 0.86, r0 * 0.86, r0 * 0.35);
}
defineGun('svd', 'sniper', (c) => {
  const { g, M, info } = c, heavy = c.stock === 'heavy';
  // boîtier embouti (bas plus haut au-dessus du puits, arrière fuyant sous la crosse), couvercle et son bouton, rail latéral gauche
  prof(g, M.metal, [[-0.2533, 0.061, 0.002], [0.019, 0.061, 0.006], [0.056, 0.049, 0.008], [0.066, 0.038, 0.004], [0.066, 0.03, 0.002], [0.016, 0.004, 0.004],
    [0.012, -0.005, 0.002], [-0.137, -0.005, 0.003], [-0.139, 0.0084, 0.002], [-0.2533, 0.0084, 0.002]], 0.038, 0, 0.003, 0.003);
  prof(g, M.metal, [[-0.205, 0.0635, 0.002], [0.04, 0.0635, 0.006], [0.054, 0.058, 0.004], [0.054, 0.05, 0.002], [-0.205, 0.05, 0.002]], 0.0395, 0, 0.004, 0.003);
  cy(g, M.dark, 0, 0.0555, 0.057, 0.0035, 0.008);
  rb(g, M.dark, -0.0195, 0.037, -0.115, 0.003, 0.01, 0.15, 0.001);
  // à droite : poignée d'armement, fenêtre d'éjection, long levier de sûreté ; dessous : arrêtoir du chargeur
  cy(g, M.metal, 0.025, 0.04, -0.12, 0.0045, 0.016, 0, 0, Math.PI / 2);
  part(g, new THREE.SphereGeometry(1, 8, 6), M.metal, 0.035, 0.04, -0.12, 0.0065, 0.0065, 0.0065);
  rb(g, M.dark, 0.0192, 0.044, -0.088, 0.0012, 0.014, 0.05, 0.0005);
  rb(g, M.dark, 0.0205, 0.022, -0.06, 0.003, 0.02, 0.1, 0.001);
  rb(g, M.dark, 0, -0.012, -0.124, 0.008, 0.016, 0.007, 0.002, -0.2);
  // hausse : bloc et planchette sur la bague arrière du garde-main
  rb(g, M.dark, 0, 0.0665, -0.258, 0.02, 0.012, 0.024, 0.002);
  rb(g, M.dark, 0, 0.0738, -0.255, 0.014, 0.0035, 0.034, 0.001, 0.06);
  // pontet, détente, poignée (prise de l'AK-47)
  guard(g, M.metal, -0.074, 0.03, -0.002, -0.054, 0.005, 0.004, 0.009);
  rb(g, M.dark, 0, -0.026, -0.034, 0.006, 0.042, 0.006, 0.002, 0.18);
  gripProf(g, M.woodB, 0.0351, -0.0019, 0.0732, -0.106, 0.046, 0.034);
  // crosse squelette d'un seul tenant : poutre haute, poutre basse, trou de pouce derrière la poignée, ajour arrière ; joue rapportée
  // (plus haute avec la crosse renforcée), plaque de couche métallique
  prof(g, M.woodB, [[0.064, 0.0342, 0.002], [0.296, 0.0342, 0.004], [0.296, -0.086, 0.004], [0.112, -0.068, 0.012], [0.08, -0.082, 0.01], [0.032, -0.05, 0.004],
    [0.014, -0.004, 0.003], [0.016, 0.006, 0.002]], 0.036, 0, 0.005, 0.005,
  [[[0.06, 0.0143, 0.008], [0.1855, 0.0143, 0.012], [0.1855, -0.0396, 0.012], [0.1265, -0.0475, 0.01], [0.072, -0.052, 0.01]],
    [[0.218, 0.0143, 0.008], [0.271, 0.0143, 0.008], [0.271, -0.046, 0.008], [0.218, -0.046, 0.008]]]);
  rb(g, M.poly, 0, heavy ? 0.0505 : 0.046, 0.178, 0.03, heavy ? 0.034 : 0.025, 0.11, 0.008);
  rb(g, M.metal, 0, -0.026, 0.299, 0.037, 0.122, 0.006, 0.003);
  info.butt = [0, -0.02, 0.302];
  // garde-mains ronds entre leurs deux bagues, deux rangées de trois lumières
  rb(g, M.metal, 0, 0.0345, -0.259, 0.047, 0.06, 0.012, 0.006);
  prof(g, M.woodB, [[-0.536, 0.0625, 0.006], [-0.262, 0.0635, 0.004], [-0.262, 0.007, 0.004], [-0.536, 0.0172, 0.006]], 0.044, 0, 0.012, 0.006);
  rb(g, M.metal, 0, 0.04, -0.54, 0.047, 0.05, 0.009, 0.008);
  for (const [y, zs] of [[0.0453, [-0.512, -0.4572, -0.404]], [0.031, [-0.4853, -0.4307, -0.376]]]) for (const z of zs) {
    prof(g, M.rubber, [[-0.0118, 0.0033], [0.0118, 0.0033], [0.0118, -0.0033], [-0.0118, -0.0033]], 0.0446, 0, 0, 0.0033).position.set(0, y, z);
  }
  // bloc de gaz (chambre à l'avant fuselé, bague de réglage, collier sur le canon), canon mince, guidon à oreilles sur son embase à
  // tenon de baïonnette, cache-flamme à cinq fentes (remplacé par le dispositif de bouche s'il y en a un)
  cy(g, M.metal, 0, 0.0495, -0.585, 0.0105, 0.086);
  cone(g, M.metal, 0, 0.0495, -0.6345, 0.0045, 0.0105, 0.013);
  cy(g, M.dark, 0, 0.0495, -0.61, 0.0108, 0.003);
  rb(g, M.metal, 0, 0.038, -0.584, 0.016, 0.02, 0.072, 0.003);
  cy(g, M.metal, 0, 0.032, -0.564, 0.0128, 0.04);
  const tip = -0.866;
  cy(g, M.metal, 0, 0.032, -0.4465, 0.009, 0.387);
  cone(g, M.metal, 0, 0.032, (tip - 0.64) / 2, 0.0068, 0.0078, -0.64 - tip);
  const fz = -0.84;
  rb(g, M.dark, 0, 0.032, fz, 0.018, 0.022, 0.018, 0.004);
  rb(g, M.dark, 0, 0.0545, fz, 0.012, 0.026, 0.013, 0.002);
  for (const sx of [-1, 1]) rb(g, M.dark, sx * 0.0058, 0.0705, fz, 0.0024, 0.012, 0.012, 0.0008);
  bx(g, M.dark, 0, 0.0695, fz, 0.002, 0.01, 0.003);
  rb(g, M.dark, 0, 0.0175, fz + 0.004, 0.007, 0.012, 0.024, 0.002);
  if (!c.A.muzzle) {
    cy(g, M.dark, 0, 0.032, tip - 0.035, 0.0085, 0.07);
    cone(g, M.dark, 0, 0.032, tip - 0.075, 0.0062, 0.0085, 0.01);
    for (let i = 0; i < 5; i++) { const a = ((i + 0.5) * TAU) / 5; bx(g, M.rubber, Math.sin(a) * 0.0084, 0.032 + Math.cos(a) * 0.0084, tip - 0.038, 0.0028, 0.0014, 0.046, 0, 0, -a); }
  }
  // lunette PSO-1 : pare-soleil creux et sa lentille, bague, corps et son boîtier à tourelles (dessus et flanc gauche), oculaire renflé
  // à bagues, œilleton creux et lentille au fond ; deux colliers sur un pont relié au rail latéral par la plaque du support et son
  // levier de serrage
  const sy = 0.103;
  cy(g, M.dark, 0, sy, -0.1967, 0.0148, 0.084);
  scopeEnd(g, M, sy, -0.2507, 0.0148, 0.0148, -1, 0.012, M.dark, M.metal);
  cy(g, M.metal, 0, sy, -0.155, 0.0156, 0.006);
  cy(g, M.dark, 0, sy, -0.106, 0.0148, 0.098);
  rb(g, M.dark, 0, sy + 0.004, -0.1, 0.031, 0.034, 0.056, 0.005);
  cy(g, M.metal, 0, 0.1305, -0.099, 0.0095, 0.014, 0);
  cy(g, M.dark, 0, 0.1395, -0.099, 0.0075, 0.006, 0);
  cy(g, M.metal, -0.021, sy + 0.002, -0.118, 0.0085, 0.012, 0, 0, Math.PI / 2);
  cy(g, M.dark, -0.029, sy + 0.002, -0.118, 0.007, 0.005, 0, 0, Math.PI / 2);
  cy(g, M.metal, 0.019, sy + 0.006, -0.085, 0.006, 0.01, 0, 0, Math.PI / 2);
  cy(g, M.dark, 0, sy, -0.04, 0.0148, 0.034);
  cone(g, M.dark, 0, sy, -0.017, 0.0148, 0.0198, 0.012);
  cy(g, M.dark, 0, sy, 0.0095, 0.0198, 0.041);
  for (const z of [0, 0.008, 0.016]) cy(g, M.rubber, 0, sy, z, 0.0201, 0.002);
  cone(g, M.dark, 0, sy, 0.035, 0.0198, 0.016, 0.01);
  scopeEnd(g, M, sy, 0.07, 0.0205, 0.0185, 1, 0.014, M.rubber, M.rubber);
  cone(g, M.rubber, 0, sy, 0.048, 0.016, 0.0185, 0.016);
  for (const z of [-0.142, -0.039]) cy(g, M.metal, 0, sy, z, 0.0168, 0.012);
  rb(g, M.metal, -0.004, 0.0805, -0.09, 0.034, 0.012, 0.124, 0.003);
  rb(g, M.metal, -0.0215, 0.056, -0.09, 0.006, 0.046, 0.1, 0.003);
  cy(g, M.dark, -0.027, 0.046, -0.06, 0.0055, 0.006, 0, 0, Math.PI / 2);
  rb(g, M.dark, -0.0285, 0.052, -0.078, 0.003, 0.006, 0.04, 0.002, 0.35);
  // chargeur droit de dix, plus long derrière, à nervures embouties et plaque de fond inclinée
  info.magHome.set(0, 0.0084, -0.177);
  info.buildMag = (parent, ext) => {
    const yf = -0.093 * ext, yr = -0.11 * ext, zr = 0.0375 + 0.0089 * ext, a = Math.atan2(yf - yr, zr + 0.0378);
    prof(parent, M.metal, [[-0.0378, 0.012, 0.001], [-0.0378, yf, 0.005], [zr, yr, 0.005], [0.0375, 0.012, 0.001]], 0.028, 0, 0.003, 0.003);
    for (const z of [-0.022, -0.009, 0.009, 0.022]) rb(parent, M.metal, 0, -0.045, z, 0.0296, 0.05, 0.0035, 0.0012);
    rb(parent, M.metal, 0, (yf + yr) / 2 + 0.012, (zr - 0.0378) / 2, 0.0296, 0.0035, 0.07, 0.0012, a);
    rb(parent, M.dark, 0, (yf + yr) / 2 - 0.002, (zr - 0.0378) / 2, 0.031, 0.007, 0.088, 0.003, a);
  };
  info.magAxis = new V3(0, -0.993, -0.12); info.magGrip = new V3(0, -0.06, 0);
  info.gripR.set(0, -0.05, 0.062); info.gripL.set(0, 0.035, -0.29);
  info.sightY = sy; info.adsZ = 0.21;
  info.mount.muzzle = { x: 0, y: 0.032, z: tip, r: 0.0068 };
  info.mount.under = { y: 0.014, z: -0.42, len: 0.16 };
  info.muzzle.position.set(0, 0.032, c.A.muzzle ? tip - 0.01 : tip - 0.085); info.eject.position.set(0.021, 0.045, -0.088);
  info.gripDef = {
    R: [{ c: [0, -0.064, 0.058], h: [0.017, 0.047, 0.023], r: 0.01, rx: -0.35 }, { c: [0, 0.028, -0.03], h: [0.019, 0.033, 0.12], r: 0.006 }],
    L: [{ c: [0, 0.035, -0.4], h: [0.022, 0.028, 0.136], r: 0.012 }, { c: [0, 0.0345, -0.259], h: [0.0235, 0.03, 0.006], r: 0.004 }],
  };
  info.trigDef = { at: [0.004, -0.04, -0.046], xTip: -0.004, guard: [{ c: [0, -0.0515, -0.02], h: [0.0045, 0.0025, 0.05], r: 0.002 }, { c: [0, -0.028, -0.0715], h: [0.0045, 0.025, 0.0025], r: 0.002 },
    { c: [0, -0.045, -0.177], h: [0.015, 0.05, 0.042], r: 0.006 }, { c: [0, -0.026, -0.034], h: [0.003, 0.021, 0.003], r: 0.002, rx: 0.18 }] };
});
defineGun('m82', 'sniper', (c) => {
  const { g, M, info } = c, heavy = c.stock === 'heavy';
  // boîtier supérieur, nez arrondi ; lumières du manchon (rangée haute ovale, rangée basse allongée) ; blocs du dessus, hausse,
  // poignée d'armement à droite
  prof(g, M.gray, [[-0.5455, 0.053, 0.008], [0.407, 0.053, 0.003], [0.407, -0.0066, 0.003], [-0.5455, -0.0066, 0.008]], 0.056, 0, 0.004, 0.004);
  const slot = [[-0.0105, 0.0048], [0.0105, 0.0048], [0.0105, -0.0048], [-0.0105, -0.0048]], slotL = [[-0.0115, 0.0045], [0.0115, 0.0045], [0.0115, -0.0045], [-0.0115, -0.0045]];
  for (const z of [-0.5051, -0.4738, -0.445, -0.4137, -0.3849, -0.356, -0.3247, -0.2959]) {
    prof(g, M.rubber, slot, 0.0565, 0, 0, 0.0048).position.set(0, 0.0338, z);
    prof(g, M.rubber, slotL, 0.0565, 0, 0, 0.0045).position.set(0, 0.004, z);
  }
  rb(g, M.dark, 0, 0.056, -0.504, 0.03, 0.008, 0.06, 0.002);
  rb(g, M.dark, 0, 0.057, -0.2475, 0.034, 0.01, 0.053, 0.002);
  rb(g, M.dark, 0, 0.058, 0.108, 0.016, 0.01, 0.02, 0.002);
  rb(g, M.dark, 0, 0.067, 0.104, 0.012, 0.014, 0.004, 0.001, 0.5);
  cy(g, M.metal, 0.034, 0.03, -0.05, 0.006, 0.014, 0, 0, Math.PI / 2);
  part(g, new THREE.SphereGeometry(1, 8, 6), M.dark, 0.044, 0.03, -0.05, 0.009, 0.009, 0.009);
  // boîtier inférieur : avant fuyant, puits de chargeur incliné, logement de détente, arrière sous la poignée
  prof(g, M.dark, [[-0.2069, 0.0, 0.004], [0.152, 0.0, 0.002], [0.15, -0.012, 0.006], [0.14, -0.03, 0.004], [0.083, -0.038, 0.002], [-0.005, -0.038, 0.002],
    [-0.005, -0.0624, 0.003], [-0.0222, -0.0604, 0.003], [-0.1636, -0.0354, 0.004], [-0.2069, 0.005, 0.006]], 0.05, 0, 0.003, 0.003);
  guard(g, M.dark, -0.006, 0.08, -0.036, -0.077, 0.005, 0.004, 0.009);
  rb(g, M.metal, 0, -0.052, 0.024, 0.006, 0.03, 0.006, 0.002, 0.18);
  gripProf(g, M.poly, 0.099, -0.03, 0.139, -0.139, 0.044, 0.032);
  // cadre de monopode sous l'arrière, plaque de couche inclinée (joue sur le boîtier avec la crosse renforcée)
  prof(g, M.dark, [[0.258, -0.004, 0.002], [0.274, -0.004, 0.002], [0.276, -0.048, 0.006], [0.39, -0.06, 0.004], [0.41, -0.06, 0.002], [0.41, -0.079, 0.002],
    [0.276, -0.079, 0.006], [0.262, -0.07, 0.004]], 0.036, 0, 0.003, 0.004);
  prof(g, M.rubber, [[0.405, 0.05, 0.003], [0.4455, 0.05, 0.006], [0.427, -0.079, 0.006], [0.405, -0.079, 0.003]], 0.06, 0, 0.004, 0.004);
  if (heavy) rb(g, M.poly, 0, 0.065, 0.33, 0.04, 0.026, 0.12, 0.008);
  info.butt = [0, -0.015, 0.44];
  // canon cannelé, frein de bouche à deux chambres (remplacé par le dispositif de bouche s'il y en a un)
  const tip = -0.9284;
  cy(g, M.gray, 0, 0.03, (tip - 0.54) / 2, 0.015, -0.54 - tip);
  for (let i = 0; i < 6; i++) { const a = (i * TAU) / 6; bx(g, M.dark, Math.sin(a) * 0.0148, 0.03 + Math.cos(a) * 0.0148, -0.73, 0.004, 0.0012, 0.32, 0, 0, -a); }
  if (!c.A.muzzle) {
    prof(g, M.gray, [[-1.0323, 0.05, 0.012], [-0.9284, 0.055, 0.004], [-0.9284, 0.03, 0], [-0.91, 0.017, 0.004], [-0.93, 0.005, 0.006], [-1.0323, 0.006, 0.012]], 0.054, 0, 0.004, 0.006);
    for (const [z, d] of [[-0.9949, 0.027], [-0.9645, 0.024]]) bx(g, M.rubber, 0, 0.026, z, 0.055, 0.032, d);
    cy(g, M.rubber, 0, 0.03, -1.0325, 0.009, 0.0006);
  }
  // lunette : objectif évasé (cache relevé, lentille), tube, tourelle haute, molette de parallaxe à gauche, oculaire évasé (cache
  // relevé, lentille) ; deux colliers et leurs écrous sur une embase ajourée
  const sy = 0.118;
  prof(g, M.dark, [[-0.13, 0.082, 0.003], [0.017, 0.082, 0.003], [0.017, 0.053, 0.002], [-0.13, 0.053, 0.002]], 0.03, 0, 0.003, 0.003,
    [[[-0.125, 0.0665, 0.0045], [-0.0914, 0.0665, 0.0045], [-0.0914, 0.0575, 0.0045], [-0.125, 0.0575, 0.0045]], [[-0.0789, 0.0665, 0.0045], [-0.0453, 0.0665, 0.0045], [-0.0453, 0.0575, 0.0045], [-0.0789, 0.0575, 0.0045]],
      [[-0.0356, 0.0665, 0.0045], [-0.002, 0.0665, 0.0045], [-0.002, 0.0575, 0.0045], [-0.0356, 0.0575, 0.0045]]]);
  for (const z of [-0.1107, 0.0048]) {
    cy(g, M.dark, 0, sy, z, 0.0185, 0.016);
    rb(g, M.dark, 0, 0.091, z, 0.024, 0.018, 0.016, 0.002);
    cy(g, M.metal, -0.0155, 0.088, z, 0.007, 0.006, 0, 0, Math.PI / 2);
  }
  scopeEnd(g, M, sy, -0.2454, 0.0275, 0.0275, -1, 0.0192, M.dark, M.dark);
  cone(g, M.dark, 0, sy, -0.1733, 0.0272, 0.0168, 0.1050);
  cy(g, M.dark, 0, sy, -0.0457, 0.0168, 0.149);
  cy(g, M.dark, 0, sy + 0.025, -0.051, 0.0145, 0.018, 0);
  cy(g, M.metal, 0, sy + 0.04, -0.051, 0.0155, 0.012, 0);
  cy(g, M.dark, 0, sy + 0.0475, -0.051, 0.012, 0.003, 0);
  cy(g, M.dark, 0.022, sy, -0.051, 0.012, 0.012, 0, 0, Math.PI / 2);
  cy(g, M.dark, -0.024, sy - 0.009, -0.0491, 0.0145, 0.014, 0, 0, Math.PI / 2);
  cy(g, M.metal, -0.0315, sy - 0.009, -0.0491, 0.011, 0.002, 0, 0, Math.PI / 2);
  cone(g, M.dark, 0, sy, 0.0574, 0.0168, 0.0215, 0.0572);
  scopeEnd(g, M, sy, 0.101, 0.0226, 0.0215, 1, 0.0154);
  cy(g, M.dark, 0, 0.1537, -0.268, 0.027, 0.004, 0.347);
  cy(g, M.dark, 0, 0.1488, 0.0784, 0.024, 0.004, 0.347);
  // chargeur boîte de dix, haut incliné comme le puits, nervures, plaque de fond
  info.magHome.set(0, -0.0479, -0.0929);
  info.buildMag = (parent, ext) => {
    const e = (ext - 1) * 0.08, yf = -0.0933 - e, yr = -0.0962 - e;
    prof(parent, M.dark, [[-0.0707, 0.0245, 0.002], [-0.0707, yf, 0.004], [0.0707, yr, 0.004], [0.0707, -0.0005, 0.002]], 0.045, 0, 0.003, 0.003);
    for (const z of [-0.035, 0.035]) rb(parent, M.dark, 0, -0.045 - e / 2, z, 0.047, 0.07 + e, 0.006, 0.002);
    rb(parent, M.metal, 0, (yf + yr) / 2 - 0.002, 0, 0.048, 0.006, 0.146, 0.002, Math.atan2(yf - yr, 0.1414));
  };
  info.magAxis = new V3(0, -1, 0); info.magGrip = new V3(0, -0.05, 0);
  info.gripR.set(0, -0.06, 0.12); info.gripL.set(0, 0.023, -0.28); // main d'appui sous l'arrière du manchon avant
  info.gripLs = new V3(0, 0.0, -0.23); // soldat : sous l'avant du boîtier (son bras n'atteint pas le manchon)
  info.sightY = sy; info.adsZ = 0.19;
  info.mount.muzzle = { x: 0, y: 0.03, z: tip, r: 0.015 };
  info.mount.under = { y: -0.0066, z: -0.42, len: 0.2 };
  info.muzzle.position.set(0, 0.03, c.A.muzzle ? tip - 0.01 : -1.035); info.eject.position.set(0.03, 0.04, -0.06);
  info.gripDef = {
    R: [{ c: [0, -0.085, 0.119], h: [0.016, 0.055, 0.022], r: 0.01, rx: -0.35 }, { c: [0, 0.02, 0.05], h: [0.028, 0.035, 0.2], r: 0.01 }],
    L: [{ c: [0, 0.0232, -0.378], h: [0.028, 0.03, 0.168], r: 0.008 }],
  };
  info.trigDef = { at: [0.004, -0.05, 0.012], xTip: -0.004, guard: [{ c: [0, -0.0745, 0.037], h: [0.0045, 0.0025, 0.044], r: 0.002 }, { c: [0, -0.056, -0.0035], h: [0.0045, 0.02, 0.0025], r: 0.002 },
    { c: [0, -0.052, 0.024], h: [0.003, 0.015, 0.003], r: 0.002, rx: 0.18 }, { c: [0, -0.09, -0.093], h: [0.023, 0.05, 0.071], r: 0.006 }] };
});
/* ---- 06o-modeles-pompes.js ---- */
defineGun('rem870', 'shotgun', (c) => {
  const { g, M, info } = c, B = M.polyM, D0 = M.dark, K = M.rubber, sx2 = [-1, 1], ext = c.A.mag === 'xmag' ? 0.05 : 0; // tube prolongé par le chargeur étendu
  const S = 0.00115, P = (x, y, r) => { const q = [-0.0315 - (x - 393) * S, 0.04 - (y - 361) * S]; if (r !== undefined) q.push(r); return q; };
  const Pz = (x) => P(x, 0)[0], Py = (y) => P(0, y)[1], mid = (a, b) => (Pz(a) + Pz(b)) / 2, len = (a, b) => Math.abs(Pz(a) - Pz(b));
  const by = Py(361.5), ty = Py(389.5), RT = Py(348.5);
  const Df = 0.022, F = (x, y, r) => { const q = P(x, y, r); q[0] += Df; return q; }, Fz = (x) => Pz(x) + Df; // garde-main reculé (bras d'appui moins tendu)
  const fine = (m, k = 2.5) => { m.geometry = m.geometry.clone(); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return m; };
  // crosse plus étroite vers le poignet : largeur multipliée par k1 de z0 (talon) à z1 (boîtier)
  const taper = (m, z0, z1, k1) => {
    m.geometry = m.geometry.clone(); const p = m.geometry.attributes.position, n = m.geometry.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      const t = Math.min(1, Math.max(0, (p.getZ(i) - z0) / (z1 - z0))), s = 1 + (k1 - 1) * t;
      p.setX(i, p.getX(i) * s); const nx = n.getX(i) / s, ny = n.getY(i), nz = n.getZ(i), l = hyp3(nx, ny, nz); n.setXYZ(i, nx / l, ny / l, nz / l);
    }
    return m;
  };

  // ----- boîtier : dessus plat, arrière arrondi vers la crosse ; fenêtre d'éjection (culasse), goupilles, port de chargement dessous -----
  fine(prof(g, D0, [P(370, 401, 0.001), P(368, 362, 0.004), P(380, 353, 0.01), P(398, 348.5, 0.006), P(540, 348.5, 0.002), P(541, 401, 0.001)], 0.031, 0, 0.003, 0.003), 6); // grain fin : le dessus est sous l'œil en visée
  prof(g, K, [P(461, 352), P(528, 352), P(528, 374), P(461, 374)], 0.0012, 0.0157, 0.0004, 0.0126);
  prof(g, M.metal, [P(464, 355), P(525, 355), P(525, 371), P(464, 371)], 0.0012, 0.0162, 0.0004, 0.009);
  cy(g, M.steel, 0.0166, Py(363), Pz(521), 0.0012, 0.0012, 0, 0, Math.PI / 2);
  for (const x of [383, 430]) cy(g, M.metal, 0, Py(387.5), Pz(x), 0.0026, 0.0322, 0, 0, Math.PI / 2);
  rb(g, K, 0, Py(401) + 0.0003, mid(455, 536), 0.021, 0.0012, len(455, 536), 0.0005);

  // ----- canon (léger cône), bague de bouche et âme ; bille sur sa rampe (rehaussée avec le silencieux) -----
  const tip = Pz(936);
  cone(g, M.metal, 0, by, mid(540, 914), 0.0106, 0.0115, len(540, 914));
  cz(g, M.metal, 0, by, mid(914, 936), 0.0121, len(914, 936));
  cz(g, K, 0, by, tip - 0.0001, 0.0092, 0.0006);
  const riser = c.A.muzzle === 'sil', BY = riser ? by + 0.025 : RT + 0.0024; // centre de la bille : 2,4 mm au-dessus du boîtier, ou au-dessus du silencieux
  if (!c.optic) {
    const bt = by + 0.0115, bb = BY - 0.0022;
    prof(g, D0, [[Pz(916), bt - 0.001], [Pz(920), bb, 0.001], [Pz(928), bb, 0.001], [Pz(933), bt - 0.001]], 0.004, 0, 0.0006, 0.0008);
    part(g, new THREE.SphereGeometry(1, 10, 8), M.dotW, 0, BY, Pz(924), 0.003, 0.003, 0.003); // bille blanche de 6 mm
  } else rail(g, M, 0, RT + 0.003, mid(400, 535), len(400, 535));

  // ----- tube magasin jusqu'à la bouche : collier sous le canon, bouchon, anneau de grenadière -----
  const tz = Pz(873) - ext;
  cz(g, M.metal, 0, ty, (Pz(540) + tz) / 2, 0.0118, Pz(540) - tz);
  prof(g, D0, [[tz + 0.0005, Py(369)], [tz - len(872, 889), Py(369)], [tz - len(872, 889), Py(402)], [tz + 0.0005, Py(402)]], 0.026, 0, 0.004, 0.004);
  cz(g, D0, 0, ty, tz - len(872, 896) + len(889, 896) / 2, 0.0122, len(889, 896));
  cone(g, D0, 0, ty, tz - len(872, 898.5), 0.0075, 0.0122, len(896, 901));
  part(g, G_TOR, M.metal, 0, ty, tz - len(872, 906), 0.0053, 0.0053, 0.0053, 0, Math.PI / 2, 0);

  // ----- garde-main coulissant (info.pump : recule à chaque coup) : polymère à nervures, barres d'armement jusque dans le boîtier -----
  const pg = new THREE.Group(); g.add(pg); info.pump = pg;
  fine(prof(pg, B, [F(629, 369.5, 0.002), F(776, 369.5, 0.004), F(781.5, 378, 0.006), F(781.5, 402, 0.006), F(776, 408.5, 0.004), F(634, 408.5, 0.004), F(629, 402, 0.003)], 0.046, 0, 0.006, 0.004));
  for (let x = 651; x < 763; x += 4.6) for (const sx of sx2) bx(pg, K, sx * 0.0232, Py(396), Fz(x), 0.0012, Py(385) - Py(407), 0.0016);
  for (const sx of sx2) bx(pg, M.metal, sx * 0.0105, Py(376), mid(529, 640) + Df, 0.0025, 0.005, len(529, 640));

  // ----- pontet et plaque de détente, sûreté transversale, détente -----
  // pontet : arrière arrondi, ouverture ronde, avant plein qui remonte en biais jusqu'au port de chargement
  prof(g, D0, [P(367, 399.5), P(462, 399.5), P(462, 402), P(367, 402)], 0.024, 0, 0.002, 0.002);
  prof(g, D0, [P(367, 400, 0.001), P(372, 406, 0.003), P(374, 414, 0.004), P(379, 420.5, 0.004), P(387, 425.5, 0.005), P(410, 426, 0.005), P(421, 423, 0.004), P(443, 412, 0.004), P(452, 405, 0.004),
    P(461, 400, 0.001)], 0.009, 0, 0.002, 0.002, [[P(385, 401.5, 0.002), P(385, 417, 0.004), P(390, 421, 0.004), P(411, 421.5, 0.004), P(418, 419, 0.003), P(421.5, 413, 0.003), P(421.5, 401.5, 0.002)]]);
  cy(g, D0, 0, Py(405), Pz(378), 0.0028, 0.027, 0, 0, Math.PI / 2);
  prof(g, M.metal, [P(390.5, 401), P(394.5, 401), P(394, 406, 0.003), P(392, 412, 0.003), P(389.5, 417.5, 0.002), P(387.5, 419.5, 0.001), P(386.5, 418, 0.001), P(388, 412, 0.003), P(390, 406, 0.003)], 0.006, 0, 0.0012, 0.0015);

  // ----- crosse : busc, poignée à plaquette grenue, talon ; plaque de couche, grenadière -----
  const z0 = Pz(250), z1 = Pz(365), kw = 0.79;
  taper(fine(prof(g, B, [P(374, 401, 0.002), P(360, 402, 0.006), P(350, 404, 0.008), P(340, 409, 0.01), P(330, 415, 0.01), P(320, 425, 0.01), P(310, 440, 0.008), P(304, 452, 0.004), P(300, 455.5, 0.004),
    P(290, 454, 0.006), P(275, 450, 0.006), P(262, 443.5, 0.004), P(240, 448, 0.01), P(200, 464, 0.02), P(150, 486, 0.02), P(109, 502.5, 0.002), P(100, 389.5, 0.002), P(150, 387, 0.03),
    P(270, 377, 0.008), P(282, 378.5, 0.006), P(295, 383, 0.008), P(310, 382, 0.01), P(330, 373, 0.02), P(350, 364, 0.01), P(371, 357.5, 0.003)], 0.042, 0, 0.006, 0.004), 6), z0, z1, kw);
  taper(prof(g, M.grip, [P(247, 430), P(265, 401), P(300, 389), P(345, 384), P(352, 389), P(340, 402), P(312, 427), P(300, 445), P(290, 445), P(270, 440), P(255, 435)], 0.0432, 0, 0.0004, 0.006), z0, z1, kw);
  prof(g, K, [P(82, 391, 0.003), P(101, 389.5, 0), P(110, 502.5, 0), P(91, 507.5, 0.003)], 0.044, 0, 0.005, 0.003);
  cy(g, M.metal, 0, Py(488.5), Pz(152), 0.0026, 0.007, 0);

  // ----- cartouche (celle que la main gauche apporte au port de chargement) -----
  info.magHome.set(0, Py(400), Pz(500));
  info.buildMag = (parent) => { part(parent, G_CYL, SHELL_RED, 0, -0.012, 0, 0.011, 0.05, 0.011); part(parent, G_CYL, M.brass, 0, -0.045, 0, 0.0115, 0.02, 0.0115); };
  info.magGrip = new V3(0, -0.03, 0);
  info.tubeFed = true; info.mag.visible = false;

  // ----- mains, visée, montages -----
  const at = [0.004, Py(411), Pz(392.5) - 0.0085];
  info.butt = [0, Py(449), Pz(86)];
  info.gripR.set(0, at[1] - 0.0005, at[2] + 0.1155); info.gripL.set(0, Py(389), Fz(660));
  info.sightY = BY; info.adsZ = 0.125; // la joue sur le busc, l'œil au ras du boîtier vers la bille
  info.mount.optic = { y: RT + 0.007, z: mid(400, 535), len: len(400, 535), D: 0.2 };
  info.mount.muzzle = { x: 0, y: by, z: tip, r: 0.0106 };
  info.mount.side = { x: -0.0138, y: ty, z: Pz(830) };
  info.muzzle.position.set(0, by, tip - 0.01); info.eject.position.set(0.02, Py(363), mid(461, 528));
  info.gripDef = {
    R: [{ c: [0, Py(418), Pz(318)], h: [0.017, 0.036, 0.019], r: 0.012, rx: -0.9 }, { c: [0, Py(375), Pz(440)], h: [0.0155, 0.026, 0.07], r: 0.006 }],
    L: [{ c: [0, Py(389), mid(629, 781.5) + Df], h: [0.023, (408.5 - 369.5) / 2 * S, len(629, 781.5) / 2], r: 0.012 }],
  };
  info.trigDef = { at, xTip: -0.004, guard: [] };
});
defineGun('aa12', 'rifle', (c) => {
  const { g, M, info } = c, drum = c.A.mag === 'xmag', B = M.polyM, D0 = M.dark, K = M.rubber, ST = M.steel;
  const S = 0.001139, D = 0.058, P = (x, y, r) => { const q = [-0.0375 + (x - 598) * S, 0.02 - (y - 189) * S]; if (r !== undefined) q.push(r); return q; };
  const Q = (x, y, r) => { const q = P(x, y, r); q[0] += D; return q; };
  const Pz = (x) => P(x, 0)[0], Qz = (x) => Pz(x) + D, Py = (y) => P(0, y)[1], mid = (a, b) => (Pz(a) + Pz(b)) / 2, len = (a, b) => Math.abs(Pz(a) - Pz(b));
  const by = Py(189), W = 0.046;
  const fine = (m, k = 2.5) => { m.geometry = m.geometry.clone(); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return m; };

  // ----- corps d'une pièce : boîtier, dessous de la détente (allongé de D), crosse à plaque de couche à bec -----
  fine(prof(g, B, [P(222, 142.5, 0.003), P(330, 141.5, 0.03), P(430, 137.5, 0.03), P(610, 137.5, 0), Q(612, 137.5, 0), Q(880, 138.5, 0.006), Q(892, 138.5, 0.002), Q(895, 131, 0.003),
    Q(903, 130, 0.003), Q(908, 138, 0.003), Q(915, 148, 0.006), Q(918, 258, 0.006), Q(912, 265.5, 0.004), Q(900, 264, 0.01), Q(800, 240, 0.02), Q(700, 216.5, 0.01), Q(688, 215.5, 0.008),
    Q(672, 219, 0.008), Q(664, 228, 0.006), Q(661, 240, 0.002), Q(612, 240, 0), P(610, 240, 0), P(556, 240, 0.002), P(552, 236, 0.001), P(552, 219, 0.001), P(490, 219, 0.001), P(480, 219.5, 0.004),
    P(400, 215, 0.03), P(300, 209.5, 0.02), P(222, 206.5, 0.004)], W, 0, 0.005, 0.004), 3);
  prof(g, M.grip, [P(270, 155), P(438, 155), P(438, 199), P(270, 199)], W + 0.0012, 0, 0.0004, 0.006); // plaquette grenue de la main d'appui
  // fenêtre d'éjection à droite, au-dessus du puits de chargeur (culasse)
  prof(g, K, [P(488, 150), P(545, 150), P(545, 172), P(488, 172)], 0.0012, W / 2 - 0.0002, 0.0004, 0.003);
  prof(g, M.metal, [P(491, 153), P(542, 153), P(542, 169), P(491, 169)], 0.0012, W / 2 + 0.0003, 0.0004, 0.002);
  // levier d'armement en aileron sur le dessus ; avec une optique, rabattu vers l'arrière (1,2 cm au lieu de 3) : debout, devant le rail, il
  // entrait dans la fenêtre de toutes les optiques
  prof(g, ST, c.optic ? [P(436, 138.5), P(437, 131, 0.002), P(441, 127.5, 0.002), P(446, 128.5, 0.002), P(470, 137, 0.002), P(470, 138.5)]
    : [P(436, 138.5), P(436, 118, 0.002), P(439, 111, 0.002), P(444, 113, 0.002), P(466, 136, 0.002), P(466, 138.5)], 0.004, 0, 0.0008, 0.002);

  // ----- plaque de front, écrou, anneau de grenadière ; canon nu -----
  prof(g, M.metal, [P(219, 143.5), P(223.5, 143.5), P(223.5, 206), P(219, 206)], W - 0.002, 0, 0.002, 0.002);
  cy(g, ST, 0, Py(173), Pz(232), 0.0065, W + 0.004, 0, 0, Math.PI / 2);
  cone(g, ST, 0, Py(160.5), mid(207, 220), 0.0008, 0.005, len(207, 220));
  const tip = Pz(48);
  cz(g, M.metal, 0, by, mid(48, 220), 0.0114, len(48, 220));
  cz(g, K, 0, by, tip - 0.0001, 0.0092, 0.0006);

  // ----- organes de visée (rien si une optique les remplace) : guidon en lame sur la plaque de front, hausse à œilleton à l'arrière
  // sur son montant et sa jambe de force, très hauts ; œilleton fin, montant et jambe de force minces, arrêtés au trait de l'anneau
  // (traits en fraction de l'écran, 06jb-formes.js) -----
  const SY = Py(87.5), zr = Qz(648); // ligne de mire à la pointe du guidon
  info.sightY = SY; info.adsZ = zr + 0.19;
  if (!c.optic) {
    const V = M.blued; // acier bruni lisse : sombre sur le ciel et sans grain, vu de près en visée
    prof(g, M.sight, [P(222, 143.5, 0), P(222.5, 92, 0.001), P(226, 87.5, 0.002), P(229.5, 89, 0.001), P(241, 143.5, 0)], 0.0026, 0, 0.0004, 0.001,
      [[P(226.5, 94, 0.001), P(229, 94, 0.001), P(229, 112, 0.001), P(226.5, 112, 0.001)]]);
    cy(g, V, 0, Py(124), Pz(236.5), 0.003, 0.006, 0, 0, Math.PI / 2);
    rb(g, V, 0, Py(136.5), (Qz(637) + Qz(690)) / 2, 0.012, 0.0045, len(637, 690), 0.0012);
    const yb = ironRing(c, zr, IRON.hole.rifle), w = ironW(c, zr, IRON.wing);
    prof(g, V, [Q(640, 138), [Qz(640), yb - 0.0008], [Qz(644), yb - 0.0008], Q(644, 138)], w, 0, w * 0.3, 0.001); // plus loin que l'anneau : un peu plus bas pour ne pas paraître dans son ouverture
    prof(g, V, [[Qz(648), yb], [Qz(652), yb], Q(684, 136), Q(678, 137)], w, 0, w * 0.3, 0.001);
  } else rail(g, M, 0, Py(137.5) + 0.003, mid(480, 610), len(480, 610));

  // ----- détente et pontet plein, de l'arrière du puits de chargeur à l'avant de la poignée (allongé de D) -----
  prof(g, ST, [P(600, 239), P(608, 239), P(604.5, 248, 0.003), P(605, 255, 0.003), P(608, 261, 0.001), P(606.5, 264, 0.001), P(601, 259, 0.003), P(597.5, 250, 0.003)], 0.006, 0, 0.0012, 0.0015);
  guard(g, D0, Pz(575), Qz(624), Py(238), Py(273), 0.006, 2 * S, 0.01);

  // ----- poignée pistolet (Q) et sa plaquette grenue -----
  prof(g, B, [Q(611, 236, 0.002), Q(661, 236, 0.002), Q(664, 250, 0.006), Q(670, 268, 0.01), Q(680, 290, 0.01), Q(690, 312, 0.008), Q(695, 330, 0.006), Q(692, 338, 0.004), Q(672, 342, 0.006),
    Q(652, 343.5, 0.004), Q(650, 333, 0.006), Q(645, 315, 0.01), Q(636, 293, 0.01), Q(626, 276, 0.008), Q(616, 262, 0.004), Q(612, 252, 0.002)], 0.03, 0, 0.004, 0.003);
  prof(g, M.grip, [Q(628, 266), Q(652, 262), Q(668, 282), Q(684, 312), Q(688, 333), Q(662, 336), Q(652, 316), Q(640, 290)], 0.0312, 0, 0.0004, 0.004);

  // ----- chargeur droit, un peu incliné vers l'avant (tambour avec le chargeur étendu) -----
  const tilt = 0.053;
  info.magHome.set(0, Py(214), mid(486, 552));
  info.buildMag = (parent, ext) => {
    if (ext > 1) {
      rb(parent, M.dark, 0, -0.008, 0, 0.034, 0.02, 0.06, 0.003);
      // tambour en travers : sa face ronde regarde vers l'avant et vers le tireur, son épaisseur dans l'axe du canon
      cy(parent, M.dark, 0, -0.08, 0, 0.075, 0.055); cy(parent, M.metal, 0, -0.08, 0, 0.05, 0.058);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; rb(parent, M.dark, Math.cos(a) * 0.072, -0.08 + Math.sin(a) * 0.072, 0, 0.01, 0.012, 0.058, 0.002, 0, 0, a); }
      return;
    }
    const t = new THREE.Group(); t.rotation.x = tilt; parent.add(t);
    const hm = (399 - 214) * S, dm = (552 - 488) * S;
    rb(t, M.metal, 0, -hm / 2, 0, 0.036, hm, dm, 0.003);
    for (const sx of [-1, 1]) rb(t, M.dark, sx * 0.018, -hm / 2 - 0.01, 0, 0.0012, hm - 0.05, dm - 0.024, 0.0005); // nervures des flancs
    rb(t, M.dark, 0, -hm - 0.002, -0.002, 0.039, 0.005, dm + 0.004, 0.0015);
  };
  info.magAxis = new V3(0, -Math.cos(tilt), -Math.sin(tilt)); info.magGrip = new V3(0, drum ? -0.08 : -0.1, drum ? 0 : -0.005);

  // ----- mains, visée, montages -----
  const at = [0.004, Py(252), Pz(597.8) - 0.0085];
  info.butt = [0, Py(201), Qz(915)];
  info.gripR.set(0, at[1] - 0.0005, at[2] + 0.1155); info.gripL.set(0, Py(190), Pz(390));
  info.mount.optic = { y: Py(137.5) + 0.007, z: mid(480, 610), len: len(480, 610), D: 0.22 };
  info.mount.muzzle = { x: 0, y: by, z: tip, r: 0.0114 };
  if (c.A.under) rail(g, M, 0, Py(214) + 0.0006, mid(330, 440), len(330, 440)); // assez près pour que le soldat vu de loin tienne la poignée
  info.mount.under = { y: Py(214) - 0.0034, z: mid(330, 440), len: len(330, 440) };
  if (c.A.side) rail(g, M, -(W / 2 + 0.0016), Py(176), Pz(300), 0.07, true);
  info.mount.side = { x: -(W / 2 + 0.0056), y: Py(176), z: Pz(300) };
  info.muzzle.position.set(0, by, tip - 0.01); info.eject.position.set(0.03, Py(161), mid(488, 545));
  info.gripDef = {
    R: [{ c: [0, Py(292), Qz(660)], h: [0.0155, 0.048, 0.022], r: 0.01, rx: -0.44 }, { c: [0, Py(215), Pz(590)], h: [0.023, 0.025, 0.06], r: 0.006 }],
    L: [{ c: [0, Py(176), mid(280, 440)], h: [W / 2, (212 - 140) / 2 * S, len(280, 440) / 2], r: 0.006 }],
  };
  info.trigDef = { at, xTip: -0.004, guard: [] };
});
/* ---- 06oa-modeles-pistolets.js ---- */
defineGun('usp', 'pistol', (c) => {
  const { g, M, info } = c, B = M.blued, F = M.polyM, K = M.rubber, sx2 = [-1, 1], dotG = new THREE.SphereGeometry(1, 6, 4);
  const S = 0.000129, P = (x, y, r) => { const q = [0.012 + (x - 1406) * S, -0.008 - (y - 560) * S]; if (r !== undefined) q.push(r); return q; };
  const Pz = (x) => P(x, 0)[0], Py = (y) => P(0, y)[1];
  // grain fin (carcasse, plaquettes) : coordonnées de texture resserrées (la géométrie, partagée, est copiée)
  const fine = (m, k) => { m.geometry = m.geometry.clone(); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return m; };
  const by = Py(232), yT = Py(147), yB = Py(335), yS = Py(200), w = 0.031;

  // ----- glissière (recule au tir) -----
  const sl = new THREE.Group(); g.add(sl); info.slide = sl; info.slideTravel = 0.034;
  // flancs (de la base des pans coupés au bas), nez biseauté en bas, arrière fuyant ; méplat avant plus étroit en bas
  prof(sl, B, [P(188, 200, 0.001), P(1588, 200, 0.001), P(1615, 335, 0.0015), P(985, 335, 0.001), P(985, 300, 0.001), P(203, 300, 0.002), P(188, 285, 0.001)], w, 0, 0.0012, 0.001);
  prof(sl, B, [P(203, 300, 0.001), P(985, 300, 0.001), P(985, 335, 0.001), P(212, 335, 0.002), P(203, 326, 0.001)], w - 0.003, 0, 0.001, 0.001);
  prof(sl, B, [P(975, 205, 0.001), P(985, 225, 0.001), P(985, 278, 0.001), P(975, 296, 0.001)], w + 0.0004, 0, 0.0003, 0.001); // bout biseauté du méplat
  // dessus à pans coupés (section en trapèze), de l'avant à l'arrière
  zSection(sl, B, [[-w / 2, yS], [w / 2, yS], [w / 2 - 0.0068, yT], [-w / 2 + 0.0068, yT]], Pz(196), Pz(1578), 0.0008);
  // fenêtre d'éjection sur le dessus, à droite : creux sombre et canon (son dessus) dans l'ouverture
  bx(sl, K, 0.0045, yT - 0.0021, Pz(868), 0.015, 0.0045, Pz(965) - Pz(770));
  cz(sl, M.metal, 0, by, Pz(868), 0.0102, Pz(960) - Pz(776));
  // cannelures arrière inclinées (le haut vers l'avant), sur les deux flancs
  for (let k = 0; k < 8; k++) { const q = P(1290 + k * 40, 272); for (const sx of sx2) bx(sl, K, sx * (w / 2 + 0.0002), q[1], q[0], 0.0012, 0.0158, 0.0018, -0.38); }
  // hausse à cran (deux points blancs) et guidon (point blanc), rien si une optique les remplace
  if (!c.optic) {
    prof(sl, B, [P(1424, 149), P(1434, 120, 0.0008), P(1478, 120, 0.0008), P(1500, 149)], 0.02, 0, 0.0006, 0.001);
    bx(sl, K, 0, Py(127), Pz(1456), 0.0032, 0.0034, 0.0062); // cran
    for (const sx of sx2) part(sl, dotG, M.dotW, sx * 0.0058, Py(130), Pz(1478) + 0.0001, 0.0011, 0.0011, 0.0004);
    prof(sl, B, [P(262, 149), P(266, 118, 0.0008), P(299, 118, 0.0008), P(320, 149)], 0.0036, 0, 0.0005, 0.001);
    part(sl, dotG, M.dotW, 0, Py(126), Pz(299) + 0.0001, 0.0011, 0.0011, 0.0004);
  }

  // ----- canon fixe : couronne et âme au ras du nez -----
  cz(g, M.metal, 0, by, Pz(188) + 0.006, 0.0068, 0.012);
  cz(g, K, 0, by, Pz(188) - 0.0001, 0.0046, 0.0006);

  // ----- carcasse polymère -----
  // cache-poussière, corps, queue de castor, poignée inclinée (dos et devant), bas de la poignée ; le haut du pontet est un creux
  fine(prof(g, F, [P(205, 336, 0.002), P(1612, 345, 0.001), P(1645, 372, 0.004), P(1658, 430, 0.006), P(1652, 478, 0.004), P(1600, 500, 0.006), P(1530, 535, 0.008), P(1512, 585, 0.008),
    P(1532, 660, 0.006), P(1573, 750, 0.01), P(1617, 870, 0.01), P(1650, 990, 0.008), P(1666, 1100, 0.004), P(1662, 1146, 0.002), P(1595, 1150, 0.002), P(1590, 1102, 0.001),
    P(1242, 1102, 0.002), P(1219, 990, 0.006), P(1188, 870, 0.008), P(1153, 750, 0.008), P(1130, 690, 0.006), P(1100, 676, 0.004), P(1060, 667, 0.004), P(1000, 660, 0.002),
    P(1023, 650, 0.004), P(1046, 635, 0.006), P(1061, 620, 0.006), P(1070, 605, 0.006), P(1076, 580, 0.008), P(1076, 545, 0.008), P(1069, 515, 0.006), P(1057, 485, 0.006), P(1038, 470, 0.004),
    P(1018, 462, 0.002), P(702, 462, 0.002), P(600, 442, 0.002), P(212, 441, 0.004), P(204, 428, 0.002)], 0.03, 0, 0.0025, 0.002), 2.5);
  // rainures d'accessoires du cache-poussière, sur les deux flancs
  for (const sx of sx2) {
    bx(g, K, sx * 0.0151, Py(374), (Pz(250) + Pz(700)) / 2, 0.0012, 0.0006, Pz(700) - Pz(250));
    rb(g, K, sx * 0.0151, Py(394), (Pz(256) + Pz(700)) / 2, 0.0012, 0.0024, Pz(700) - Pz(256), 0.0005);
  }
  // pontet mince : devant incliné (strié), dessous, rejoint la carcasse derrière
  fine(prof(g, F, [P(598, 441, 0.001), P(611, 470, 0.003), P(631, 530, 0.004), P(642, 590, 0.004), P(662, 650, 0.006), P(676, 674, 0.006), P(705, 688, 0.004), P(840, 691, 0.004),
    P(980, 685, 0.004), P(1040, 676, 0.002), P(1040, 662, 0.001), P(980, 660, 0.003), P(732, 659, 0.004), P(714, 647, 0.004), P(698, 605, 0.004), P(684, 560, 0.004), P(674, 505, 0.004),
    P(682, 480, 0.004), P(702, 462, 0.002), P(705, 441, 0.001)], 0.0095, 0, 0.0018, 0.002), 2.5);
  for (let k = 0; k < 8; k++) { const q = P(634 + k * 2.2, 552 + k * 12.5); bx(g, K, 0, q[1], q[0] - 0.0004, 0.009, 0.0007, 0.0012, -0.2); }
  // détente incurvée, palette de déverrouillage du chargeur derrière le pontet
  prof(g, B, [P(916, 456), P(918, 470, 0.002), P(944, 500, 0.006), P(967, 530, 0.006), P(977, 560, 0.006), P(977, 590, 0.006), P(966, 620, 0.006), P(944, 650, 0.004), P(938, 659, 0.001),
    P(952, 659, 0.002), P(971, 650, 0.004), P(1000, 620, 0.006), P(1013, 590, 0.006), P(1016, 560, 0.006), P(1009, 530, 0.006), P(993, 500, 0.006), P(978, 470, 0.002), P(977, 456)], 0.0062, 0, 0.0012, 0.0015);
  prof(g, F, [P(1040, 640, 0.002), P(1088, 646, 0.003), P(1094, 676, 0.003), P(1046, 678, 0.002)], 0.016, 0, 0.002, 0.002);
  // arrêtoir de glissière (gauche) : axe et long levier jusqu'à sa palette
  prof(g, B, [P(822, 372, 0.008), P(860, 356, 0.006), P(985, 362, 0.004), P(1000, 356, 0.003), P(1090, 352, 0.006), P(1146, 362, 0.008), P(1150, 405, 0.008), P(1100, 418, 0.006),
    P(1000, 410, 0.004), P(880, 412, 0.006), P(828, 402, 0.008)], 0.0024, -0.0161, 0.0007, 0.002);
  cy(g, M.metal, -0.0175, Py(385), Pz(850), 0.0027, 0.0012, 0, 0, Math.PI / 2);
  // levier de sûreté-désarmeur (gauche), repère rouge derrière
  prof(g, B, [P(1300, 368, 0.008), P(1380, 357, 0.008), P(1462, 362, 0.006), P(1504, 374, 0.004), P(1508, 390, 0.004), P(1490, 404, 0.006), P(1420, 416, 0.008), P(1330, 424, 0.008), P(1302, 410, 0.008)],
    0.0034, -0.0167, 0.0012, 0.003);
  { const q = P(1497, 405); part(g, dotG, M.dot, -0.0152, q[1], q[0], 0.0003, 0.0011, 0.0011); }
  // chien à ergot, derrière la glissière
  prof(g, B, [P(1614, 346), P(1622, 328, 0.002), P(1640, 300, 0.004), P(1664, 290, 0.004), P(1692, 296, 0.004), P(1726, 318, 0.003), P(1746, 340, 0.002), P(1748, 352, 0.001),
    P(1734, 356, 0.002), P(1700, 346, 0.004), P(1664, 360, 0.004), P(1642, 378, 0.002), P(1618, 372)], 0.0085, 0, 0.0012, 0.002);
  // poignée : plaquette grenue sur chaque flanc (grain fin), cartouche lisse, crans du devant et du dos, trou de dragonne
  fine(prof(g, M.grip, [P(1138, 520, 0.006), P(1162, 492, 0.006), P(1390, 494, 0.008), P(1446, 522, 0.008), P(1498, 700, 0.01), P(1542, 900, 0.01), P(1575, 1030, 0.006),
    P(1540, 1052, 0.006), P(1300, 1046, 0.01), P(1256, 1012, 0.006), P(1238, 900, 0.008), P(1190, 700, 0.008)], 0.0316, 0, 0.0012, 0.003), 3);
  fine(prof(g, F, [P(1290, 905, 0.005), P(1520, 905, 0.005), P(1522, 990, 0.005), P(1292, 990, 0.005)], 0.0322, 0, 0.0008, 0.005), 2.5);
  for (let k = 0; k < 22; k++) {
    const t = k / 21, yf = 722 + t * 288, xf = 1142 + (yf - 720) * 0.27, q = P(xf - 2, yf);
    bx(g, K, 0, q[1], q[0], 0.0262, 0.0018, 0.0018, -0.3 + Math.PI / 4);
  }
  for (let k = 0; k < 26; k++) {
    const t = k / 25, yb = 688 + t * 362, xb = 1546 + (yb - 690) * 0.322, q = P(xb + 2, yb);
    bx(g, K, 0, q[1], q[0], 0.0262, 0.0018, 0.0018, -0.3 + Math.PI / 4);
  }
  { const q = P(1601, 1076); cy(g, K, 0, q[1], q[0], 0.0022, 0.0305, 0, 0, Math.PI / 2); }

  // ----- chargeur : corps dans la poignée (incliné comme elle), talon plat à lèvre avant ; étendu : plus long -----
  const ma = 0.291, mc = P(1392, 800);
  info.magHome.set(0, 0, 0);
  info.buildMag = (parent, ext) => {
    const ex = (ext - 1) * 0.1, t = new THREE.Group(); t.position.set(0, mc[1], mc[0]); t.rotation.x = -ma; parent.add(t);
    rb(t, M.metal, 0, -ex / 2, 0, 0.0245, 0.08 + ex, 0.039, 0.003);
    for (let k = 0; k < 4; k++) part(t, dotG, M.dotW, 0, -0.006 - k * 0.011 - ex / 2, 0.0198, 0.0012, 0.0012, 0.0004);
    const b = P(1407, 1126), lp = P(1232, 1112);
    rb(parent, F, 0, b[1] - ex * Math.cos(ma), b[0] + ex * Math.sin(ma), 0.0292, 0.0062, Pz(1590) - Pz(1226), 0.002);
    rb(parent, F, 0, lp[1] - ex * Math.cos(ma), lp[0] + ex * Math.sin(ma), 0.027, 0.004, 0.0035, 0.0012);
  };
  info.magAxis = new V3(0, -Math.cos(ma), Math.sin(ma)); info.magGrip = new V3(0, Py(1126), Pz(1407));
  info.gripR.set(0, -0.05, 0.015); info.gripL.set(-0.02, -0.06, 0.005);

  // ----- visée, montages, bouche, éjection -----
  info.sightY = Py(120); info.adsZ = 0.41 + Pz(1478); // ligne de mire au sommet du guidon et des oreilles de la hausse, l'œil à 41 cm d'elle
  info.mount.optic = { y: yT, z: Pz(1250), len: 0.07, D: 0.4, slide: sl }; // sur le dessus, derrière la fenêtre d'éjection
  info.mount.muzzle = { x: 0, y: by, z: Pz(188), r: 0.0068 };
  info.mount.side = { x: 0, y: Py(441) + 0.0018, z: Pz(460), under: true }; // pointeur laser sous le cache-poussière (son dessus 2 mm sous y)
  info.muzzle.position.set(0, by, Pz(188) - 0.001); info.eject.position.set(0.012, yT, Pz(868));
  // formes de prise des mains : poignée (son angle), carcasse, glissière, pontet ; détente pour l'index (replié, comme sur la vraie arme)
  const gc = P(1406, 900);
  info.gripDef = {
    R: [{ c: [0, gc[1], gc[0]], h: [0.0158, 0.052, 0.0265], r: 0.008, rx: -ma }, { c: [0, Py(400), (Pz(205) + Pz(600)) / 2], h: [0.015, 0.0055, (Pz(600) - Pz(205)) / 2], r: 0.003 },
      { c: [0, Py(400), Pz(1300)], h: [0.015, 0.0075, 0.03], r: 0.004 }, { c: [0, (yT + yB) / 2, (Pz(188) + Pz(1615)) / 2], h: [w / 2, (yT - yB) / 2, (Pz(1615) - Pz(188)) / 2], r: 0.003 },
      { c: [0, Py(686), Pz(850)], h: [0.0048, 0.0028, 0.017], r: 0.002 }, { c: [0, Py(560), Pz(650)], h: [0.0048, 0.0125, 0.0025], r: 0.002, rx: -0.24 }],
  };
  info.gripDef.L = info.gripDef.R;
  // face avant de la détente à x 977 : l'axe du doigt (rayon du gant 8 mm) juste devant. La lame elle-même n'est pas une forme de
  // prise : la phalange du milieu, qui la contourne par le flanc, s'y heurtait et le doigt restait 4 mm devant
  info.trigDef = { at: [0.004, -0.008, Pz(977) - 0.0085], xTip: -0.003, guard: [] };
});
defineGun('glock18', 'pistol', (c) => {
  const { g, M, info } = c, B = M.dark, N = M.poly, F = M.tan, K = M.rubber, sx2 = [-1, 1], dotG = new THREE.SphereGeometry(1, 6, 4);
  const S = 0.000196, P = (x, y, r) => { const q = [0.012 + (x - 869) * S, -0.008 - (y - 470) * S]; if (r !== undefined) q.push(r); return q; };
  const Pz = (x) => P(x, 0)[0], Py = (y) => P(0, y)[1];
  const fine = (m, k) => { m.geometry = m.geometry.clone(); const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * k, uv.getY(i) * k); return m; };
  const by = Py(267), yT = Py(205), yB = Py(313), w = 0.0255;

  // ----- glissière (recule au tir) -----
  const sl = new THREE.Group(); g.add(sl); info.slide = sl; info.slideTravel = 0.034;
  fine(prof(sl, B, [P(45, 222, 0.003), P(60, 205, 0.004), P(966, 205, 0.004), P(974, 214, 0.003), P(975, 300, 0.003), P(966, 313, 0.002), P(52, 313, 0.003), P(45, 300, 0.003)], w, 0, 0.0028, 0.002), 3);
  // lumières de compensateur sur le dessus (le canon et ses évents dessous), fenêtre d'éjection à droite
  bx(sl, K, 0, yT - 0.0018, Pz(150), 0.0085, 0.004, Pz(205) - Pz(95));
  for (const x of [120, 150, 180]) bx(sl, M.metal, 0, yT - 0.0035, Pz(x), 0.007, 0.001, 0.0035);
  rb(sl, K, w / 2 - 0.0035, yT - 0.0012, Pz(650), 0.0078, 0.003, Pz(740) - Pz(560), 0.001);
  bx(sl, M.metal, w / 2 - 0.004, yT - 0.0022, Pz(650), 0.0062, 0.002, Pz(735) - Pz(565));
  // cannelures arrière, sur les deux flancs
  for (let k = 0; k < 7; k++) for (const sx of sx2) bx(sl, K, sx * (w / 2 + 0.0002), Py(262), Pz(764 + k * 11), 0.0012, Py(222) - Py(302), 0.0011);
  // sélecteur de tir (flanc gauche, à l'arrière) : disque et levier
  cy(sl, K, -(w / 2 + 0.0008), Py(262), Pz(884), 0.0042, 0.0016, 0, 0, Math.PI / 2);
  { const a = P(856, 222), b = P(894, 280); rb(sl, B, -(w / 2 + 0.0016), (a[1] + b[1]) / 2, (a[0] + b[0]) / 2, 0.0014, hyp(a[0] - b[0], a[1] - b[1]) + 0.004, 0.0034, 0.0012, -Math.atan2(b[0] - a[0], a[1] - b[1])); }
  // hausse (deux points blancs) et guidon (point blanc) ; rien si une optique les remplace
  if (!c.optic) {
    prof(sl, B, [P(889, 205), P(893, 185, 0.0008), P(921, 185, 0.0008), P(925, 205)], 0.0185, 0, 0.0006, 0.001);
    bx(sl, K, 0, Py(190), Pz(907), 0.0032, 0.0022, 0.0072);
    for (const sx of sx2) part(sl, dotG, M.dotW, sx * 0.0058, Py(191), Pz(925) + 0.0001, 0.0011, 0.0011, 0.0004);
    prof(sl, B, [P(74, 205), P(80, 195, 0.0006), P(95, 195, 0.0006), P(99, 205)], 0.0032, 0, 0.0005, 0.0008);
    part(sl, dotG, M.dotW, 0, Py(198), Pz(97) + 0.0001, 0.001, 0.001, 0.0004);
  }

  // ----- canon fixe : il dépasse du nez -----
  cz(g, M.metal, 0, by, Pz(46), 0.0072, Pz(56) - Pz(34));
  cz(g, K, 0, by, Pz(34) - 0.0001, 0.0047, 0.0006);

  // ----- carcasse polymère sable -----
  // cache-poussière, corps, queue de castor, poignée inclinée à gorges de doigts, bas de la poignée ; le haut du pontet est un creux
  fine(prof(g, F, [P(41, 314, 0.003), P(974, 313, 0.001), P(981, 320, 0.003), P(984, 334, 0.003), P(980, 350, 0.004), P(950, 364, 0.006), P(921, 380, 0.006), P(908, 404, 0.004),
    P(906, 440, 0.004), P(922, 500, 0.006), P(942, 548, 0.006), P(963, 596, 0.008), P(985, 632, 0.008), P(1009, 668, 0.008), P(1031, 704, 0.008), P(1052, 752, 0.008), P(1062, 788, 0.008),
    P(1066, 812, 0.006), P(1046, 836, 0.006), P(1032, 850, 0.003), P(780, 850, 0.003), P(767, 836, 0.004), P(766, 806, 0.006), P(752, 764, 0.006), P(744, 740, 0.004), P(729, 728, 0.004),
    P(721, 716, 0.006), P(725, 700, 0.006), P(718, 680, 0.006), P(707, 656, 0.004), P(694, 644, 0.004), P(685, 632, 0.006), P(690, 614, 0.006), P(685, 596, 0.006), P(675, 572, 0.006),
    P(661, 548, 0.006), P(640, 538, 0.004), P(612, 528, 0.003), P(590, 521, 0.002), P(608, 512, 0.003), P(617, 495, 0.003), P(617, 458, 0.003), P(600, 424, 0.003), P(445, 422, 0.003),
    P(375, 414, 0.003), P(300, 409, 0.002), P(171, 406, 0.003), P(60, 400, 0.004), P(46, 380, 0.004)], 0.03, 0, 0.0025, 0.002), 2.5);
  // rainure du rail du cache-poussière, encoche sous le rail, sur les deux flancs
  for (const sx of sx2) rb(g, K, sx * 0.0151, Py(357), Pz(175), 0.0012, Py(352) - Py(362), Pz(300) - Pz(50), 0.0005);
  bx(g, K, 0, Py(404), Pz(160), 0.024, 0.0018, Pz(171) - Pz(150));
  // pontet carré : devant droit, dessous ; la carcasse le ferme derrière
  fine(prof(g, F, [P(372, 412, 0.001), P(392, 430, 0.004), P(392, 500, 0.004), P(381, 530, 0.004), P(394, 550, 0.004), P(590, 554, 0.004), P(640, 540, 0.003), P(640, 528, 0.001),
    P(590, 521, 0.002), P(442, 520, 0.004), P(429, 500, 0.003), P(422, 470, 0.003), P(422, 452, 0.003), P(432, 424, 0.003), P(445, 422, 0.001)], 0.0082, 0, 0.0016, 0.002), 2.5);
  // détente en polymère noir et sa sûreté (lame au milieu)
  prof(g, N, [P(565, 424), P(575, 440, 0.003), P(570, 464, 0.004), P(563, 488, 0.004), P(557, 512, 0.003), P(560, 520, 0.001), P(578, 520, 0.002), P(594, 500, 0.004), P(606, 476, 0.004),
    P(610, 452, 0.004), P(600, 424)], 0.0065, 0, 0.0012, 0.0015);
  prof(g, K, [P(576, 452), P(582, 452, 0.001), P(574, 500, 0.001), P(568, 500)], 0.0068, 0, 0.0003, 0.0005);
  // levier de démontage, arrêtoir de glissière, goupilles, bouton de chargeur strié (incliné comme la poignée)
  for (const sx of sx2) { const a = P(452, 334), b = P(463, 368); rb(g, K, sx * 0.0153, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2, 0.0012, Py(334) - Py(368), 0.0028, 0.0006, -0.3); }
  rb(g, B, -0.0157, Py(330), Pz(680), 0.0028, Py(313) - Py(348), Pz(715) - Pz(645), 0.0025);
  for (const [x, y] of [[555, 365], [875, 455], [500, 345]]) cy(g, B, 0, Py(y), Pz(x), 0.002, 0.0306, 0, 0, Math.PI / 2);
  { const q = P(705, 492); rb(g, F, -0.0155, q[1], q[0], 0.003, 0.0048, 0.0135, 0.0014, -0.39); for (let k = 0; k < 6; k++) { const t = (k - 2.5) * 0.002; bx(g, K, -0.0171, q[1] - t * 0.383, q[0] + t * 0.924, 0.0006, 0.0042, 0.0007, -0.39); } }
  // flancs de la poignée à grain plus marqué (pastilles du Gen4), en relief léger
  fine(prof(g, F, [P(728, 500, 0.008), P(925, 500, 0.008), P(1020, 760, 0.01), P(980, 800, 0.008), P(830, 800, 0.008), P(760, 600, 0.008)], 0.0306, 0, 0.0008, 0.004), 1.2);

  // ----- chargeur en polymère noir : corps dans la poignée (incliné comme elle), talon dessous ; étendu : plus long -----
  const ma = 0.394, mc = P(885, 690);
  info.magHome.set(0, 0, 0);
  info.buildMag = (parent, ext) => {
    const ex = (ext - 1) * 0.1, t = new THREE.Group(); t.position.set(0, mc[1], mc[0]); t.rotation.x = -ma; parent.add(t);
    rb(t, N, 0, -ex / 2, 0, 0.0225, 0.07 + ex, 0.037, 0.003);
    for (let k = 0; k < 4; k++) part(t, dotG, M.dotW, 0, -0.004 - k * 0.011 - ex / 2, 0.0187, 0.0011, 0.0011, 0.0004);
    const f = P(788, 856), r = P(1010, 856), dy = -ex * Math.cos(ma), dz = ex * Math.sin(ma);
    prof(parent, N, [[f[0] + dz, f[1] + dy], [r[0] + dz, r[1] + dy], [Pz(1012) + dz, Py(888) + dy], [Pz(801) + dz, Py(888) + dy]], 0.0275, 0, 0.002, 0.002);
  };
  info.magAxis = new V3(0, -Math.cos(ma), Math.sin(ma)); info.magGrip = new V3(0, Py(872), Pz(900));
  info.gripR.set(0, -0.05, 0.015); info.gripL.set(-0.02, -0.06, 0.005);

  // ----- visée, montages, bouche, éjection -----
  info.sightY = Py(195); info.adsZ = 0.41 + Pz(925); // ligne de mire au sommet du guidon et au fond du cran, l'œil à 41 cm de la hausse
  info.mount.optic = { y: yT, z: Pz(760), len: 0.07, D: 0.4, slide: sl }; // sur le dessus, derrière la fenêtre d'éjection
  info.mount.muzzle = { x: 0, y: by, z: Pz(34), r: 0.0072 };
  info.mount.side = { x: 0, y: Py(404) + 0.0018, z: Pz(175), under: true }; // pointeur laser sous le rail (son dessus 2 mm sous y)
  info.muzzle.position.set(0, by, Pz(34) - 0.001); info.eject.position.set(0.01, yT, Pz(650));
  // formes de prise des mains : poignée (son angle), carcasse, glissière, pontet ; index replié sur la détente
  const gc = P(877, 700);
  info.gripDef = {
    R: [{ c: [0, gc[1], gc[0]], h: [0.0153, 0.05, 0.0275], r: 0.008, rx: -ma }, { c: [0, Py(370), (Pz(45) + Pz(372)) / 2], h: [0.014, 0.0055, (Pz(372) - Pz(45)) / 2], r: 0.003 },
      { c: [0, Py(370), Pz(780)], h: [0.015, 0.0065, 0.025], r: 0.004 }, { c: [0, (yT + yB) / 2, (Pz(45) + Pz(975)) / 2], h: [w / 2, (yT - yB) / 2, (Pz(975) - Pz(45)) / 2], r: 0.003 },
      { c: [0, Py(552), Pz(495)], h: [0.004, 0.0022, 0.019], r: 0.002 }, { c: [0, Py(485), Pz(387)], h: [0.004, 0.0068, 0.002], r: 0.002 }],
  };
  info.gripDef.L = info.gripDef.R;
  info.trigDef = { at: [0.004, -0.008, Pz(568) - 0.0085], xTip: -0.003, guard: [] };
});
defineGun('deagle', 'pistol', (c) => {
  const { g, M, info } = c, S = M.steel, D = M.dark, K = M.rubber, by = 0.0418, zM = -0.2213, sx2 = [-1, 1]; // K : noir mat des creux et des commandes
  const dotG = new THREE.SphereGeometry(1, 6, 4);
  // repère de la poignée (le même que celui des autres pistolets) : b vers l'arrière, d vers le bas, depuis son centre
  const G = (b, d, r) => { const q = [0.012 + b * 0.976 + d * 0.218, -0.05 + b * 0.218 - d * 0.976]; if (r !== undefined) q.push(r); return q; };

  // ----- canon fixe -----
  // corps bas à flancs droits, de la bouche à la glissière (coin avant arrondi), posé sur la carcasse derrière le rail
  prof(g, S, [[zM, 0.0089, 0.005], [zM, 0.0358, 0.002], [-0.0628, 0.0358, 0], [-0.0628, 0.0139, 0], [-0.0945, 0.0139, 0], [-0.0945, 0.0089, 0]], 0.029, 0, 0.0016, 0.0015);
  // dessus en biseau : section en trapèze, plus étroit en haut sous le rail
  zSection(g, S, [[-0.0145, 0.0345], [0.0145, 0.0345], [0.0085, 0.0516], [-0.0085, 0.0516]], -0.1975, -0.0945);
  for (const sx of sx2) bx(g, K, sx * 0.0149, 0.0359, -0.146, 0.0012, 0.0013, 0.1); // trait le long du flanc, à la jonction du biseau
  // bloc de bouche et frein : quatre fentes sur chaque flanc, âme de 12,7 mm
  rb(g, S, 0, 0.0452, -0.2094, 0.029, 0.0196, 0.0238, 0.0022);
  for (let k = 0; k < 4; k++) for (const sx of sx2) bx(g, K, sx * 0.0149, 0.0468, -0.2185 + k * 0.0056, 0.0012, 0.0128, 0.0033);
  cz(g, K, 0, by, zM - 0.0002, 0.0064, 0.0012);
  // rail à dents sur le canon (les optiques s'y posent) ; petites pièces en boîtes simples (une boîte arrondie compte 900 sommets)
  bx(g, S, 0, 0.0523, -0.147, 0.0132, 0.0022, 0.1);
  for (let k = 0; k < 9; k++) bx(g, S, 0, 0.0536, -0.1925 + k * 0.0108, 0.0146, 0.0032, 0.0074);
  // tube du canon, visible devant la glissière (il continue dessous : la glissière le découvre en reculant)
  cz(g, S, 0, by, -0.058, 0.0077, 0.076);
  // rail d'accessoires sous le canon
  rb(g, K, 0, 0.0074, -0.1506, 0.019, 0.0034, 0.103, 0.0008);
  for (let k = 0; k < 9; k++) bx(g, K, 0, 0.0047, -0.1975 + k * 0.0115, 0.021, 0.0028, 0.0074);
  // guidon sur le bloc de bouche (point blanc côté tireur) ; rien si une optique remplace les organes de visée
  if (!c.optic) {
    prof(g, K, [[-0.2170, 0.0546, 0], [-0.2132, 0.0612, 0.001], [-0.2068, 0.0612, 0.0005], [-0.2068, 0.0546, 0]], 0.0034, 0, 0.0005, 0.0008);
    part(g, dotG, M.dotW, 0, 0.0598, -0.2067, 0.0011, 0.0011, 0.0005);
  }

  // ----- glissière (recule au tir) -----
  const sl = new THREE.Group(); g.add(sl); info.slide = sl; info.slideTravel = 0.034;
  prof(sl, S, [[-0.0628, 0.0131, 0.001], [-0.0628, 0.0505, 0.002], [-0.0582, 0.0551, 0.002], [0.0222, 0.0551, 0.004], [0.0272, 0.0228, 0.003], [0.0266, 0.0131, 0.001]], 0.029, 0, 0.0042, 0.002);
  // cannelures obliques (le bas plus en arrière), plus courtes sous la sûreté. Les creux sont des pièces noires qui dépassent d'environ 1 mm :
  // plus près de la surface, elles disparaissent sous un camouflage (précision de la profondeur)
  for (let k = 0; k < 13; k++) {
    const zt = -0.0568 + k * 0.0059, yt = zt > -0.024 ? 0.031 : 0.0414, yb = 0.0152, yc = (yt + yb) / 2, zc = zt + (yt - yc) * 0.276, len = (yt - yb) / 0.964;
    for (const sx of sx2) bx(sl, K, sx * 0.0149, yc, zc, 0.0012, len, 0.0024, -0.27);
  }
  // sûreté ambidextre : levier, axe, point rouge (arme prête à tirer)
  for (const sx of sx2) {
    prof(sl, K, [[-0.0200, 0.0458, 0.002], [0.0040, 0.0463, 0.004], [0.0103, 0.0412, 0.004], [0.0093, 0.0342, 0.004], [0.0036, 0.0318, 0.004], [-0.0030, 0.0346, 0.003], [-0.0190, 0.0420, 0.002]], 0.0022, sx * 0.0156, 0.0007, 0.003);
    cy(sl, K, sx * 0.0168, 0.0387, 0.0029, 0.0047, 0.0016, 0, 0, Math.PI / 2);
    part(sl, dotG, M.dot, sx * 0.0146, 0.0305, -0.0098, 0.0003, 0.0009, 0.0009);
  }
  bx(sl, K, 0.0072, 0.0555, -0.031, 0.009, 0.0012, 0.026); // fenêtre d'éjection, sur le dessus à droite
  // hausse à cran (deux points blancs) ; rien sous une optique
  if (!c.optic) {
    prof(sl, K, [[-0.0095, 0.0549, 0], [-0.0052, 0.0575, 0.001], [0.0046, 0.0575, 0.0005], [0.0046, 0.0549, 0]], 0.021, 0, 0.0008, 0.001);
    for (const sx of sx2) {
      prof(sl, K, [[-0.0040, 0.0572, 0], [-0.0006, 0.0612, 0.0006], [0.0046, 0.0612, 0.0005], [0.0046, 0.0572, 0]], 0.0078, sx * 0.0064, 0.0005, 0.0006);
      part(sl, dotG, M.dotW, sx * 0.0064, 0.0598, 0.0047, 0.001, 0.001, 0.0004);
    }
  }

  // ----- carcasse -----
  // dessous de la glissière, queue de castor et départ du dos de la poignée
  prof(g, S, [[-0.0945, 0.0139, 0.001], [0.0266, 0.0139, 0], [0.0302, 0.0160, 0.003], [0.0526, 0.0124, 0.002], [0.0448, 0.0068, 0.004], [0.0342, 0.0010, 0.004], [0.0297, -0.0050, 0], [-0.0330, -0.0062, 0], [-0.0945, 0.0036, 0.002]], 0.026, 0, 0.002, 0.003);
  // chien à ergot, derrière la glissière
  prof(g, K, [[0.0245, 0.0150, 0], [0.0245, 0.0380, 0.002], [0.0285, 0.0452, 0.002], [0.0345, 0.0451, 0.0015], [0.0351, 0.0419, 0.0015], [0.0318, 0.0386, 0.003], [0.0305, 0.0150, 0]], 0.0085, 0, 0.0012, 0.002);
  // pontet carré, détente inclinée vers l'arrière, arrêtoir de glissière à gauche, goupilles
  guard(g, S, -0.0895, -0.030, 0.005, -0.0245, 0.0047, 0.0016, 0.008);
  prof(g, K, [[-0.0592, 0.003], [-0.0568, -0.0085, 0.006], [-0.0500, -0.0205, 0.001], [-0.0480, -0.0190, 0.001], [-0.0520, -0.0090, 0.006], [-0.0545, 0.003]], 0.0055, 0, 0.0012, 0.0015);
  prof(g, K, [[-0.0560, 0.0098, 0.001], [-0.0215, 0.0098, 0.002], [-0.0185, 0.0125, 0.001], [-0.0135, 0.0125, 0.001], [-0.0135, 0.0045, 0.001], [-0.0560, 0.0058, 0.001]], 0.0022, -0.0141, 0.0006, 0.001);
  for (const [y, z] of [[0.0108, -0.0857], [0.0013, -0.0857], [-0.0205, -0.0437]]) cy(g, K, 0, y, z, 0.0032, 0.0278, 0, 0, Math.PI / 2);
  // poignée : âme inox (devant, dessous, dos), plaquettes de caoutchouc qui l'enveloppent par l'avant, vis
  prof(g, S, [G(-0.035, -0.054), G(-0.035, 0.044), G(-0.031, 0.049, 0.004), G(0.025, 0.049, 0.004), G(0.027, 0.044), G(0.027, -0.040), G(0.015, -0.054)], 0.028, 0, 0.003, 0.002);
  prof(g, M.grip, [G(-0.0362, -0.044), G(-0.0362, 0.041, 0.004), G(-0.031, 0.0455, 0.004), G(0.020, 0.0455, 0.004), G(0.0215, 0.036), G(0.0215, -0.036, 0.006), G(0.010, -0.047, 0.006)], 0.0355, 0, 0.004, 0.003);
  const sc = G(0.012, 0.027); cy(g, K, 0, sc[1], sc[0], 0.0024, 0.0362, 0, 0, Math.PI / 2);

  // ----- chargeur : corps dans la poignée, talon sombre dessous ; étendu : plus long -----
  const mw = 0.026, mh = 0.092, md = 0.044;
  info.magHome.set(0, 0, 0);
  info.buildMag = (parent, ext) => {
    const ex = (ext - 1) * 0.1, t = new THREE.Group(); t.position.set(0, -0.05, 0.012); t.rotation.x = -0.22; parent.add(t);
    rb(t, D, 0, -ex / 2, 0.0, mw, mh + ex, md, 0.004);
    rb(t, M.metal, 0, -ex / 2, -md / 2 - 0.0002, mw - 0.0045, mh - 0.016 + ex, 0.0025, 0.001);
    rb(t, D, 0, -mh / 2 - 0.0055 - ex, 0.0, mw + 0.008, 0.012, md + 0.012, 0.003);
    rb(t, M.metal, 0, -mh / 2 - 0.0115 - ex, 0.0, mw + 0.005, 0.0018, md + 0.01, 0.0008);
  };
  info.magAxis = new V3(0, -0.976, 0.218); info.magGrip = new V3(0, -mh + 0.006, 0.024);
  info.gripR.set(0, -0.05, 0.015); info.gripL.set(-0.02, -0.06, 0.005);

  // ----- visée, montages, bouche, éjection -----
  info.sightY = 0.0612; info.adsZ = 0.41 - 0.0024; // ligne de mire au sommet du guidon et des oreilles de la hausse, l'œil à 41 cm d'elle
  info.mount.optic = { y: 0.0552, z: -0.123, len: 0.07, D: 0.4, slide: g }; // point rouge compact, sur le rail du canon (fixe)
  info.mount.muzzle = { x: 0, y: by, z: zM, r: 0.0064 };
  info.mount.side = { x: 0, y: 0.0056, z: -0.142, under: true }; // pointeur laser sous le rail du canon
  info.muzzle.position.set(0, by, zM - 0.002); info.eject.position.set(0.016, 0.054, -0.03);
  // formes de prise des mains : poignée (son angle), carcasse, glissière, canon, pontet
  const gc = G(-0.004, -0.0025);
  info.gripDef = {
    R: [{ c: [0, gc[1], gc[0]], h: [0.0178, 0.0515, 0.031], r: 0.008, rx: -0.22 }, { c: [0, 0.0088, -0.06], h: [0.013, 0.0052, 0.035], r: 0.003 }, { c: [0, 0.006, 0.014], h: [0.013, 0.008, 0.022], r: 0.004 },
      { c: [0, 0.0341, -0.018], h: [0.0145, 0.021, 0.045], r: 0.003 }, { c: [0, 0.032, -0.142], h: [0.0145, 0.0235, 0.08], r: 0.003 },
      { c: [0, -0.0222, -0.06], h: [0.00375, 0.0021, 0.0298], r: 0.002 }, { c: [0, -0.0096, -0.0874], h: [0.00375, 0.0147, 0.0021], r: 0.002 }],
  };
  info.gripDef.L = info.gripDef.R;
  info.trigDef = { at: [0.004, -0.011, -0.064], xTip: -0.003, guard: [{ c: [0, -0.0085, -0.0538], h: [0.00275, 0.0115, 0.0025], r: 0.0015, rx: 0.32 }] };
});
/* ---- 06p-accessoires.js ---- */
const ATT_SLOTS = ['optic', 'muzzle', 'barrel', 'under', 'side', 'mag', 'stock', 'ammo'];
const ATT_SLOT_NAMES = { optic: _t('Optique'), muzzle: _t('Bouche'), barrel: _t('Canon'), under: _t('Sous-canon'), side: _t('Rail latéral'), mag: _t('Chargeur'), stock: _t('Crosse'), ammo: _t('Munitions') };
const ATT_GROUP_SLOTS = { optic: ['optic'], canon: ['muzzle', 'barrel'], under: ['under'], side: ['side'], mun: ['mag', 'ammo'], stock: ['stock'] };
const ATT_GROUPS = Object.keys(ATT_GROUP_SLOTS);
const ATT_GROUP_NAMES = { optic: _t('Optique'), canon: _t('Bouche et canon'), under: _t('Sous-canon'), side: _t('Rail latéral'), mun: _t('Chargeur et munitions'), stock: _t('Crosse') };
const ATT_GROUP = {};
for (const g of ATT_GROUPS) for (const s of ATT_GROUP_SLOTS[g]) ATT_GROUP[s] = g;
const ATT_MAX = { primary: 4, secondary: 4 };
const ATT = {
  // optiques : remplacent les organes de visée métalliques
  red: { slot: 'optic', name: _t('Point rouge'), lvl: 2, fam: ['rifle', 'smg', 'shotgun', 'pistol'], mods: { ads: 1.03, zoom: 1.1, adsAcc: 0.95 },
    desc: _t('Point lumineux sur verre. Visée rapide et dégagée.') },
  holo: { slot: 'optic', name: _t('Holographique'), lvl: 8, fam: ['rifle', 'smg', 'shotgun'], mods: { ads: 1.06, zoom: 1.2, adsAcc: 0.9 },
    desc: _t('Réticule en cercle sur grande fenêtre. On garde les deux yeux ouverts, mais la mise en joue est un peu plus lente.') },
  acog: { slot: 'optic', name: 'ACOG 4x', lvl: 12, fam: ['rifle', 'smg'], mods: { ads: 1.16, zoom: 1.55, adsAcc: 0.85, mob: 0.98 },
    desc: _t('Lunette de combat 4x. De la portée et de la précision, au prix d\u0027un champ réduit et d\u0027une mise en joue plus lente.') },
  // bouche
  sil: { slot: 'muzzle', name: _t('Silencieux'), lvl: 4, fam: ['rifle', 'smg', 'sniper', 'shotgun', 'pistol'], mods: { rng: 0.86, dmg: 0.97, vrec: 0.95, flash: 0.1, mob: 0.98, silent: true },
    desc: _t('Tir étouffé, sans flash ni traçante. Portée et dégâts un peu réduits.') },
  comp: { slot: 'muzzle', name: _t('Compensateur'), lvl: 6, fam: ['rifle', 'smg', 'sniper', 'pistol'], mods: { vrec: 0.8, hrec: 1.08, ads: 1.04, flash: 0.9 },
    desc: _t('Évents orientés vers le haut. Le canon monte beaucoup moins, mais dérive un peu plus sur les côtés.') },
  brake: { slot: 'muzzle', name: _t('Frein de bouche'), lvl: 14, fam: ['rifle', 'smg', 'sniper'], mods: { vrec: 0.9, hrec: 0.82, kick: 0.85, shake: 1.2, flash: 1.3 },
    desc: _t('Recul plus droit, mais flash plus large et vue secouée.') },
  choke: { slot: 'muzzle', name: _t('Choke serré'), lvl: 4, fam: ['shotgun'], mods: { hip: 0.75, adsAcc: 0.75, rng: 1.12 },
    desc: _t('Resserre la gerbe. Les chevrotines portent plus loin et se dispersent moins.') },
  // canon
  long: { slot: 'barrel', name: _t('Canon long'), lvl: 13, fam: ['rifle', 'smg'], mods: { rng: 1.2, adsAcc: 0.88, ads: 1.08, mob: 0.96 },
    desc: _t('Plus de portée et de précision en visée. L\u0027arme est plus lourde à épauler.') },
  short: { slot: 'barrel', name: _t('Canon court'), lvl: 7, fam: ['rifle', 'smg'], mods: { rng: 0.82, ads: 0.88, mob: 1.04, hip: 0.9, vrec: 1.08 },
    desc: _t('Arme plus vive et plus maniable. Moins de portée et un recul plus sec.') },
  // sous-canon
  vgrip: { slot: 'under', name: _t('Poignée verticale'), lvl: 3, fam: ['rifle', 'smg'], mods: { vrec: 0.84, hrec: 0.9, ads: 1.05 },
    desc: _t('Bonne prise de la main d\u0027appui. Le recul est domestiqué, mais l\u0027arme se met en joue plus lentement.') },
  agrip: { slot: 'under', name: _t('Poignée angulaire'), lvl: 9, fam: ['rifle', 'smg'], mods: { ads: 0.94, hip: 0.9, hrec: 0.9, vrec: 1.03 },
    desc: _t('Mise en joue plus rapide et tir à la hanche plus précis. Le recul vertical reste entier.') },
  bipod: { slot: 'under', name: _t('Bipied'), lvl: 3, fam: ['sniper', 'rifle'], mods: { ads: 1.05, mob: 0.97, bipod: true },
    desc: _t('Accroupi et immobile, recul et dispersion presque annulés. Debout, l\u0027arme est plus lourde.') },
  // rail latéral
  laser: { slot: 'side', name: _t('Pointeur laser'), lvl: 10, fam: ['rifle', 'smg', 'shotgun', 'pistol'], mods: { hip: 0.68, mob: 0.99, laser: true },
    desc: _t('Un point rouge marque l\u0027impact. Tir à la hanche bien plus précis.') },
  // chargeur
  fmag: { slot: 'mag', name: _t('Chargeur rapide'), lvl: 5, fam: ['rifle', 'smg', 'sniper', 'pistol'], mods: { reload: 0.72, mob: 0.99 },
    desc: _t('Chargeur à sangle d\u0027extraction. Le rechargement est un quart plus court.') },
  xmag: { slot: 'mag', name: _t('Chargeur étendu'), lvl: 11, fam: ['rifle', 'smg', 'sniper', 'shotgun', 'pistol'], mods: { magx: 1.5, tubeAdd: 2, reload: 1.12, mob: 0.97 },
    desc: _t('Une moitié de munitions en plus par chargeur. Plus lourd et un peu plus long à changer.') },
  // crosse
  hstock: { slot: 'stock', name: _t('Crosse renforcée'), lvl: 15, fam: ['rifle', 'smg', 'sniper'], mods: { vrec: 0.9, hrec: 0.88, adsAcc: 0.92, ads: 1.05, mob: 0.97 },
    desc: _t('Épaulée à fond, l\u0027arme tient mieux la ligne de mire. Elle est plus lourde à manier.') },
  nostock: { slot: 'stock', name: _t('Sans crosse'), lvl: 17, fam: ['rifle', 'smg'], mods: { mob: 1.05, ads: 0.9, hip: 0.9, vrec: 1.12, hrec: 1.15, adsAcc: 1.15 },
    desc: _t('Arme compacte et vive, mais bien plus difficile à maîtriser.') },
  // munitions
  hp: { slot: 'ammo', name: _t('Pointe creuse'), lvl: 16, fam: ['rifle', 'smg', 'pistol'], mods: { dmg: 1.12, rng: 0.82 },
    desc: _t('Balles à expansion. Plus de dégâts, mais la portée efficace fond.') },
  slug: { slot: 'ammo', name: _t('Balle unique'), lvl: 12, fam: ['shotgun'], mods: { slug: true },
    desc: _t('Une seule balle lourde à la place des chevrotines. Précise et efficace à moyenne distance.') },
};
for (const id in ATT) ATT[id].id = id;
function attName(id, def) { return id === 'xmag' && def && def.tube ? _t('Tube étendu') : ATT[id].name; }
function attFits(base, id) {
  const a = ATT[id]; if (!a || !base.slots.includes(a.slot) || !a.fam.includes(base.fam)) return false;
  return !(base.noAtt && base.noAtt.includes(id));
}
function attMax(base) { return base.cat === 'pistol' ? ATT_MAX.secondary : ATT_MAX.primary; }
const attGroup = (id) => ATT_GROUP[ATT[id].slot];
const attGroupsOf = (base) => ATT_GROUPS.filter((g) => ATT_GROUP_SLOTS[g].some((s) => base.slots.includes(s)));
function attNormalize(base, att) {
  const out = [], used = new Set();
  for (const id of att || []) {
    if (!attFits(base, id) || used.has(attGroup(id)) || out.length >= attMax(base)) continue;
    used.add(attGroup(id)); out.push(id);
  }
  return out.sort((x, y) => ATT_SLOTS.indexOf(ATT[x].slot) - ATT_SLOTS.indexOf(ATT[y].slot));
}
function attachAll(c) {
  const A = c.A;
  for (const slot of ['optic', 'muzzle', 'under', 'side', 'mag']) if (A[slot] && ATT_BUILD[A[slot]]) ATT_BUILD[A[slot]](c);
}
const ATT_BUILD = {};
function optLens(p, M, x, y, z, w, h) { const l = rb(p, M.lens, x, y, z, w, h, 0.002, 0.0005); l.renderOrder = 5; return l; }
const OPT_GLASS = new Map();
function optGlass(p, mat, pts, x, y, z, front = false) {
  const k = JSON.stringify(pts);
  let geo = OPT_GLASS.get(k);
  if (!geo) { const sh = new THREE.Shape(); profTrace(sh, pts, 0.0012); geo = new THREE.ShapeGeometry(sh, 6); OPT_GLASS.set(k, geo); }
  const l = part(p, geo, mat, x, y, z, 1, 1, 1, 0, front ? Math.PI : 0, 0); l.renderOrder = 5; return l;
}
function optReticle(c, mesh) { c.info.keep.push(mesh); return mesh; }
function optMarks(c, p, marks, y, z, mat = c.M.dot) {
  const geo = mergeGunParts(marks.map(([gm, x, yy]) => ({ geo: gm, m: new THREE.Matrix4().makeTranslation(x, yy, 0) })));
  for (const [gm] of marks) gm.dispose();
  return optReticle(c, part(p, geo, mat, 0, y, z, 1, 1, 1));
}
function optSight(c, centerY, zRear, k = 1) { c.info.sightY = centerY; c.info.adsZ = c.info.mount.optic.D * k + zRear; }
const G_TRI = new THREE.CylinderGeometry(1, 1, 1, 3);
ATT_BUILD.red = (c) => {
  const { g, M, info } = c, o = info.mount.optic, p = o.slide || g, small = !!o.slide, s = small ? 0.75 : 1.15, y0 = o.y, S = M.sight, K = M.rubber;
  const z0 = small ? o.z : o.z + 0.02; // au fusil, en arrière sur le rail : la fenêtre se rapproche de l'œil
  const hb = small ? 0.0015 : 0.0075, yB = y0 + hb - 0.0004; // embase (plaque ou collier de rail), bas du boîtier
  const L = 0.054 * s, zR = z0 + L / 2, zF = z0 - L / 2, wb = 0.027 * s, dH = 0.012 * s; // boîtier, profondeur du capot
  const a = 0.014 * s, h = 0.02 * s, t = 0.003 * s, ch = 0.0035 * s; // fenêtre (demi-largeur, hauteur, pan coupé), épaisseur du capot
  const yb = yB + 0.0094 * s, yc = yb + h * 0.47, ym = yb + h * 0.62, A = a + t; // bas de la fenêtre (dessus du boîtier), ligne de mire
  // capot : octogone arrondi, flancs rentrés vers le bas, larges pans coupés en haut ; plein sous la fenêtre jusqu'à l'embase
  const win = [[-a * 0.88 + ch, yb], [a * 0.88 - ch, yb], [a * 0.9, yb + ch], [a, ym], [a - ch * 1.8, yb + h], [-a + ch * 1.8, yb + h], [-a, ym], [-a * 0.9, yb + ch]];
  const hood = [[-A * 0.9, yB, 0.001 * s], [A * 0.9, yB, 0.001 * s], [A, ym + t * 0.45], [A - ch * 1.8 + t * 0.45, yb + h + t], [-A + ch * 1.8 - t * 0.45, yb + h + t], [-A, ym + t * 0.45]];
  zSection(p, S, hood, zF, zF + dH, 0.0008 * s, { holes: [win], rc: 0.0013 * s, seg: 5, bev: 2 });
  const yw = yb + h / 2, zL = zF + dH * 0.55, lens = win.map(([x, y]) => [x * (1 + 0.0007 / a), (y - yw) * (1 + 0.0014 / h)]);
  optGlass(p, M.lens, lens, 0, yw, zL); optGlass(p, M.lensR, lens, 0, yw, zL - 0.0004, true);
  // boîtier : du capot à l'arrière arrondi, son dessus au ras du bas de la fenêtre
  prof(p, S, [[zF + 0.003 * s, yB, 0], [zF + 0.003 * s, yb - 0.0003, 0], [zR, yb - 0.0003, 0.0045 * s], [zR, yB, 0.0012 * s]], wb, 0, 0.0014 * s, 0.001 * s);
  rb(p, S, 0, yb + 0.0008 * s, zR - 0.0065 * s, 0.0062 * s, 0.0024 * s, 0.005 * s, 0.0009 * s); // émetteur
  bx(p, K, 0, yb + 0.001 * s, zR - 0.009 * s, 0.0036 * s, 0.0012 * s, 0.001 * s); // sa fenêtre, tournée vers la lentille
  const xd = 0.0062 * s, zd = zR - 0.019 * s; // molette de luminosité : bague moletée, chapeau, vis
  cy(p, M.metal, xd, yb + 0.0006 * s, zd, 0.0058 * s, 0.0016 * s, 0); cy(p, S, xd, yb + 0.0016 * s, zd, 0.0049 * s, 0.0012 * s, 0); cy(p, K, xd, yb + 0.0023 * s, zd, 0.0014 * s, 0.0004 * s, 0);
  // boutons + (avant) et - sur le flanc gauche, dans une plaque ovale
  const yk = yB + 0.0047 * s, xk = -wb / 2;
  rb(p, S, xk, yk, zR - 0.025 * s, 0.0014 * s, 0.0058 * s, 0.017 * s, 0.0006 * s);
  for (const [dz, plus] of [[0.0295, true], [0.0205, false]]) {
    cy(p, K, xk - 0.0007 * s, yk, zR - dz * s, 0.0021 * s, 0.0012 * s, 0, 0, Math.PI / 2);
    bx(p, M.metal, xk - 0.0013 * s, yk, zR - dz * s, 0.0003, 0.0004 * s, 0.0022 * s);
    if (plus) bx(p, M.metal, xk - 0.0013 * s, yk, zR - dz * s, 0.0003, 0.0022 * s, 0.0004 * s);
  }
  if (small) rb(p, S, 0, y0 + hb / 2 - 0.0002, z0, wb, hb + 0.0004, L - 0.004, 0.0005); // plaque sur la glissière
  else {
    // embase à collier : mâchoires de part et d'autre du rail, levier de serrage à gauche et sa vis, bout de la vis à droite
    const bw = wb + 0.002;
    rb(p, S, 0, y0 + hb / 2 - 0.0002, z0 + 0.003, bw, hb, L * 0.82, 0.0012);
    for (const sx of [-1, 1]) rb(p, S, sx * 0.0137, y0 - 0.0012, z0 + 0.003, 0.0034, 0.0075, L * 0.5, 0.0008);
    rb(p, M.metal, -bw / 2 - 0.0007, y0 + 0.0002, z0 + 0.003, 0.0016, 0.0082, 0.026, 0.0007);
    cy(p, M.metal, -bw / 2 - 0.0018, y0 + 0.001, z0 + 0.012, 0.0023, 0.0012, 0, 0, Math.PI / 2);
    cy(p, M.metal, bw / 2 + 0.0005, y0 - 0.001, z0 + 0.003, 0.0022, 0.0012, 0, 0, Math.PI / 2);
  }
  optSight(c, yc, o.z + (small ? 0.016 : 0.0325));
  const zD = zL + 0.0005;
  info.dot = optMarks(c, p, [[new THREE.CircleGeometry(ironW(c, zD, 0.0055) / 2, 20), 0, 0]], yc, zD);
};
ATT_BUILD.holo = (c) => {
  const { g, M, info } = c, o = info.mount.optic, p = o.slide || g, y0 = o.y, z0 = o.z, S = M.sight, K = M.rubber;
  const W = 0.046, hw = W / 2, zR = z0 + 0.048, zF = zR - 0.1, zH = zR - 0.058, zc = (zR + zF) / 2; // largeur, arrière, avant, avant du capot
  const yc = y0 + 0.034, yT = y0 + 0.0525, yB = y0 + 0.0195, ww = 0.034, wh = 0.025; // ligne de mire, dessus du capot et du boîtier, fenêtre
  const win = (w, h, r) => [[-w / 2, yc - h / 2, r], [w / 2, yc - h / 2, r], [w / 2, yc + h / 2, r], [-w / 2, yc + h / 2, r]];
  // semelle et collier de rail : mâchoires de part et d'autre du rail, molette de serrage à gauche, bout de la vis à droite
  rb(p, S, 0, y0 + 0.003, zc, 0.032, 0.006, 0.094, 0.0015);
  for (const sx of [-1, 1]) rb(p, S, sx * 0.0137, y0 - 0.0012, zc + 0.006, 0.0034, 0.0075, 0.034, 0.0008);
  cy(p, M.metal, -0.0182, y0 - 0.0008, zc + 0.006, 0.0058, 0.0056, 0, 0, Math.PI / 2);
  cy(p, M.metal, 0.0158, y0 - 0.0008, zc + 0.006, 0.0026, 0.0014, 0, 0, Math.PI / 2);
  // boîtier bas, de la face arrière à l'avant arrondi (logement de la pile), son dessus sous la fenêtre ; vis sur les flancs
  prof(p, S, [[zF, y0 + 0.005, 0], [zF, yB, 0.007], [zR - 0.004, yB, 0.001], [zR - 0.004, y0 + 0.005, 0]], W - 0.001, 0, 0.0015, 0.002);
  rb(p, S, 0, y0 + 0.011, zF - 0.0005, W - 0.012, 0.008, 0.0016, 0.0012); // couvercle de la pile
  for (const sx of [-1, 1]) for (const z of [zR - 0.012, zF + 0.012]) cy(p, M.metal, sx * (hw - 0.0004), y0 + 0.0105, z, 0.0016, 0.001, 0, 0, Math.PI / 2);
  // capot : flancs pleins à front fuyant qui s'arrondit vers le haut (pans à petits arrondis : la version allégée, en biseaux, garde le même
  // contour) ; pont sur le dessus, du même contour que les flancs (leur haut, sur 4,5 mm)
  const side = [[zH - 0.012, yB - 0.001, 0.002], [zH - 0.002, yT - 0.012, 0.004], [zH + 0.006, yT - 0.0025, 0.004], [zH + 0.016, yT, 0.004], [zR - 0.004, yT, 0.002], [zR - 0.004, yB - 0.001, 0]];
  for (const sx of [-1, 1]) prof(p, S, side, 0.004, sx * (hw - 0.002), 0.0012, 0.002);
  prof(p, S, profAbove(side, 0.002, yT - 0.0045), W - 0.006, 0, 0.0012, 0);
  // face arrière : cadre percé de la fenêtre, coins du haut très arrondis ; verre en retrait dans son cadre
  zSection(p, S, [[-hw - 0.0008, y0 + 0.0045, 0.0015], [hw + 0.0008, y0 + 0.0045, 0.0015], [hw + 0.0008, yT + 0.0008, 0.009], [-hw - 0.0008, yT + 0.0008, 0.009]], zR - 0.0055, zR + 0.001, 0.0012, { holes: [win(ww, wh, 0.0035)], seg: 6, bev: 2 });
  const zG = zR - 0.009;
  zSection(p, S, win(ww + 0.003, wh + 0.003, 0.004), zG - 0.0016, zR - 0.005, 0.0006, { holes: [win(ww - 0.003, wh - 0.003, 0.0025)], seg: 6 });
  optLens(p, M, 0, yc, zG, ww - 0.001, wh - 0.001);
  // panneau de commande sous la fenêtre : boutons fléchés (bas à gauche, haut à droite), bouton rond, quatre vis
  const yp = y0 + 0.0135, zp = zR + 0.001;
  rb(p, S, 0, yp, zp + 0.0009, 0.036, 0.013, 0.0022, 0.001);
  for (const sx of [-1, 1]) {
    rb(p, K, sx * 0.0088, yp - 0.0016, zp + 0.0024, 0.0088, 0.0062, 0.0018, 0.0008);
    part(p, G_TRI, K, sx * 0.0088, yp - 0.0016, zp + 0.0034, 0.0019, 0.0008, 0.0019, Math.PI / 2, sx > 0 ? Math.PI : 0, 0);
    for (const dy of [-0.0045, 0.0045]) cy(p, M.metal, sx * 0.0155, yp + dy, zp + 0.0022, 0.0012, 0.0009);
  }
  cy(p, K, 0, yp + 0.0035, zp + 0.0024, 0.0026, 0.0018);
  // réglages en hauteur et en dérive : deux cuvettes du flanc droit, vis fendue au fond
  for (const [dz, ang] of [[0.017, 0.5], [0.034, -0.4]]) {
    const z = zR - dz, y = yc - 0.002;
    part(p, G_TOR, S, hw, y, z, 0.0052, 0.0052, 0.0052, 0, Math.PI / 2, 0);
    cy(p, K, hw - 0.0002, y, z, 0.0047, 0.001, 0, 0, Math.PI / 2);
    cy(p, M.metal, hw + 0.0002, y, z, 0.0028, 0.001, 0, 0, Math.PI / 2);
    bx(p, K, hw + 0.0007, y, z, 0.0004, 0.0048, 0.0007, ang, 0, 0);
  }
  optSight(c, yc, z0 + 0.025, 0.97);
  const zr = zG + 0.0013, f = (k) => ironW(c, zr, k), R = f(0.03) / 2, lw = f(0.003), tk = f(0.008), d = R - lw * 1.5 + tk / 2;
  const tick = (w, h, x, y) => [new THREE.PlaneGeometry(w, h), x, y];
  info.dot = optMarks(c, p, [[new THREE.RingGeometry(R - lw, R, 64), 0, 0], [new THREE.CircleGeometry(f(0.004) / 2, 16), 0, 0],
    tick(lw, tk, 0, d), tick(lw, tk, 0, -d), tick(tk, lw, d, 0), tick(tk, lw, -d, 0)], yc, zr);
};
ATT_BUILD.acog = (c) => {
  const { g, M, info } = c, o = info.mount.optic, p = o.slide || g, y0 = o.y, z0 = o.z, S = M.sight, K = M.rubber, k = 0.000607;
  const yA = y0 + 0.0367; // axe optique
  const P = (x, y, r) => { const q = [z0 + (x - 262.5) * k, yA - (y - 148) * k]; if (r !== undefined) q.push(r); return q; };
  const Pz = (x) => z0 + (x - 262.5) * k, Py = (y) => yA - (y - 148) * k, len = (a, b) => Math.abs(b - a) * k;
  // embase : semelle (mâchoires de part et d'autre du rail), riser en pente vers l'avant sous le corps, molettes fendues à gauche
  prof(p, S, [P(128.3, 193.3, 0.002), P(285, 193.3, 0.002), P(285, 211.7, 0.001), P(128.3, 211.7, 0.001)], 0.032, 0, 0.0015, 0.002);
  for (const sx of [-1, 1]) rb(p, S, sx * 0.0137, y0 - 0.0045, Pz(206), 0.0034, 0.006, len(140, 275), 0.0008);
  prof(p, S, [P(168.3, 193.6, 0), P(190, 186.5, 0.002), P(208.3, 179.5, 0.003), P(271.7, 173, 0.002), P(272, 172, 0.001), P(291.7, 172, 0.002), P(291.7, 193.6, 0)], 0.022, 0, 0.0015, 0.002);
  for (const x of [151.7, 261.7]) {
    cy(p, M.metal, -0.0185, Py(203.3), Pz(x), 0.006, 0.005, 0, 0, Math.PI / 2);
    bx(p, K, -0.0211, Py(203.3), Pz(x), 0.0006, 0.0085, 0.0013);
    cy(p, M.metal, 0.0165, Py(203.3), Pz(x), 0.0032, 0.0012, 0, 0, Math.PI / 2);
  }
  // capot d'objectif rond, face avant en biseau (le haut en avant) ; au fond, cloison, bague et lentille (vue de l'avant) ; guidon dessus
  const RB = 0.0205;
  zRing(p, S, RB, 0.0176, Pz(139.5), Pz(205), yA, { rr: 0.0012, seg: 48, cut: [yA + RB, Pz(139.5), yA - RB, Pz(168.3)] });
  cy(p, S, 0, yA, Pz(201), 0.0178, len(196, 206));
  zRing(p, S, 0.0178, 0.0158, Pz(193.5), Pz(196.5), yA);
  part(p, new THREE.CircleGeometry(0.0162, 32), M.glass, 0, yA, Pz(195.5), 1, 1, 1, 0, Math.PI, 0);
  prof(p, S, [P(147, 116), P(147, 96, 0.001), P(150, 93.3, 0.001), P(160, 93.3, 0.001), P(163.3, 96, 0.001), P(163.3, 116)], 0.004, 0, 0.0008, 0.001); // guidon
  // corps effilé, tube ; tourelle de hauteur (dessus), bouchon de dérive (droite), bouchon plat (gauche)
  cone(p, S, 0, yA, (Pz(203) + Pz(271.7)) / 2, 0.0198, 0.0154, len(203, 271.7), 32);
  cy(p, S, 0, yA, (Pz(271) + Pz(316)) / 2, 0.0154, len(271, 316));
  cy(p, S, 0, yA + 0.0165, Pz(284), 0.0095, 0.005, 0); cy(p, S, 0, Py(115), Pz(284), 0.0086, 0.01, 0); cy(p, K, 0, Py(112.5), Pz(284), 0.0088, 0.0012, 0);
  cy(p, S, 0.0165, yA, Pz(285), 0.0075, 0.005, 0, 0, Math.PI / 2); cy(p, S, 0.0215, yA, Pz(285), 0.0062, 0.008, 0, 0, Math.PI / 2);
  cy(p, S, -0.0158, yA - 0.0005, Pz(285), 0.006, 0.004, 0, 0, Math.PI / 2);
  // collier de l'oculaire : bague, jonc, deux vis dans leurs pattes (dessus, dessous), bossage à droite
  cy(p, S, 0, yA, (Pz(315) + Pz(345)) / 2, 0.0172, len(315, 345)); cy(p, M.metal, 0, yA, Pz(333), 0.0185, 0.003);
  for (const sy of [1, -1]) { rb(p, S, 0, yA + sy * 0.0176, Pz(326), 0.008, 0.0045, len(315, 337), 0.0012); cz(p, M.metal, 0, yA + sy * 0.0186, Pz(328.5), 0.0022, len(315, 342)); }
  cy(p, M.metal, 0.0188, yA, Pz(347), 0.003, 0.004, 0, 0, Math.PI / 2);
  // oculaire, bonnette en caoutchouc (la lentille en retrait de 9 mm), lame de hausse sur le dessus
  cy(p, S, 0, yA, (Pz(344) + Pz(369)) / 2, 0.017, len(344, 369));
  zRing(p, K, 0.0172, 0.0136, Pz(368), Pz(383.3), yA, { rr: 0.0018, seg: 48 });
  prof(p, S, [P(362, 121), P(362, 103, 0.001), P(366, 95, 0.001), P(369.5, 95, 0.001), P(373.3, 103, 0.001), P(373.3, 121)], 0.0022, 0, 0.0006, 0.001);
  optSight(c, yA, z0 + 0.073, 0.72);
  // champ de la vue de l'arme en visée : la bonnette (rayon 17,2 mm) remplit la hauteur de l'écran
  const tanH = 0.0175 / (info.adsZ - Pz(383.3));
  info.vmFov = Math.atan(tanH) * 360 / Math.PI;
  // oculaire : masque de profondeur (avant tout le reste de l'arme), teinte, bord assombri, réticule ; H : hauteur de l'écran à sa distance
  const zl = Pz(369) + 0.0005, rl = 0.0137, H = 2 * tanH * (info.adsZ - zl), f = (q) => q * H;
  const mask = optReticle(c, part(p, new THREE.CircleGeometry(rl, 32), M.ocMask, 0, yA, zl, 1, 1, 1)); mask.renderOrder = -10; mask.visible = false; info.ocular = mask;
  optReticle(c, part(p, new THREE.CircleGeometry(rl, 32), M.ocTint, 0, yA, zl + 0.0002, 1, 1, 1)).renderOrder = 5;
  optMarks(c, p, Array.from({ length: 12 }, (_, i) => [new THREE.RingGeometry(rl * (0.64 + i * 0.03), rl, 48), 0, 0]), yA, zl + 0.0003, M.ocShade).renderOrder = 6;
  // chevron rouge : pointe sur la ligne de mire, deux branches ; ligne de chute et traits du bord en noir
  const ch = f(0.05), cw = f(0.036), t = f(0.005), al = hyp(cw / 2, ch), ang = Math.atan2(cw / 2, ch);
  const arm = (s) => { const gm = new THREE.PlaneGeometry(t, al); gm.rotateZ(s * ang); return [gm, s * cw / 4, -ch / 2]; };
  info.dot = optMarks(c, p, [arm(1), arm(-1)], yA, zl + 0.0004);
  const lw = f(0.0035), bl = f(0.15), el = rl * 0.18;
  optMarks(c, p, [[new THREE.PlaneGeometry(lw, bl), 0, -ch * 1.08 - bl / 2], [new THREE.PlaneGeometry(el, lw), rl - el / 2, 0], [new THREE.PlaneGeometry(el, lw), -rl + el / 2, 0]], yA, zl + 0.0004, M.ink);
};
const SIL_LEN = { rifle: 0.17, smg: 0.16, sniper: 0.21, shotgun: 0.18, pistol: 0.115 };
ATT_BUILD.sil = (c) => {
  const { g, M, info } = c, mz = info.mount.muzzle, len = SIL_LEN[info.kind], r = Math.max(mz.r * 1.9, info.kind === 'pistol' ? 0.0125 : 0.0185);
  cy(g, M.dark, 0, mz.y, mz.z - len / 2 + 0.01, r, len);
  cy(g, M.metal, 0, mz.y, mz.z + 0.004, r * 0.92, 0.014);
  cy(g, M.metal, 0, mz.y, mz.z - len + 0.012, r * 0.96, 0.008);
  for (let i = 1; i < 4; i++) part(g, G_TOR, M.metal, 0, mz.y, mz.z - len * i / 4, r * 1.02, r * 1.02, r * 0.35);
  info.muzzle.position.z = mz.z - len - 0.008;
};
ATT_BUILD.comp = (c) => {
  const { g, M, info } = c, mz = info.mount.muzzle, r = Math.max(mz.r * 1.55, 0.0125), len = info.kind === 'pistol' ? 0.034 : 0.052;
  cy(g, M.metal, 0, mz.y, mz.z - len / 2 + 0.004, r, len);
  cy(g, M.dark, 0, mz.y, mz.z - len + 0.004, r * 0.7, 0.004);
  for (let i = 0; i < 3; i++) bx(g, M.dark, 0, mz.y + r * 0.96, mz.z - 0.01 - i * len / 4, r * 0.9, 0.003, len / 8);
  for (let i = 0; i < 2; i++) for (const sx of [-1, 1]) bx(g, M.dark, sx * r * 0.98, mz.y + r * 0.2, mz.z - 0.014 - i * len / 3, 0.003, r * 0.55, len / 9);
  info.muzzle.position.z = mz.z - len - 0.006;
};
ATT_BUILD.brake = (c) => {
  const { g, M, info } = c, mz = info.mount.muzzle, r = Math.max(mz.r * 1.9, 0.016), len = info.kind === 'sniper' ? 0.085 : 0.064;
  cy(g, M.dark, 0, mz.y, mz.z - len / 2 + 0.004, r, len);
  for (let i = 0; i < 3; i++) cy(g, M.metal, 0, mz.y, mz.z - 0.012 - i * (len - 0.02) / 3, r * 1.18, 0.004);
  for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) bx(g, M.poly, sx * r * 0.99, mz.y, mz.z - 0.022 - i * (len - 0.03) / 2, 0.003, r * 0.9, 0.012);
  info.muzzle.position.z = mz.z - len - 0.008;
};
ATT_BUILD.choke = (c) => {
  const { g, M, info } = c, mz = info.mount.muzzle, r = mz.r * 1.32, len = 0.05;
  cy(g, M.dark, 0, mz.y, mz.z - len / 2 + 0.005, r, len);
  for (let i = 0; i < 3; i++) part(g, G_TOR, M.metal, 0, mz.y, mz.z - 0.008 - i * 0.015, r * 1.02, r * 1.02, r * 0.3);
  cy(g, M.metal, 0, mz.y, mz.z - len + 0.007, r * 0.78, 0.004);
  info.muzzle.position.z = mz.z - len - 0.006;
};
function underGrip(c, shape, frame) {
  const { info } = c;
  info.gripDef.L = info.gripDef.L.concat([shape]);
  if (frame) { info.gripL.set(...shape.c); info.lFrame = frame; }
}
ATT_BUILD.vgrip = (c) => {
  const { g, M, info } = c, u = info.mount.under;
  rb(g, M.dark, 0, u.y - 0.006, u.z, 0.032, 0.012, 0.046, 0.003);
  rb(g, M.poly, 0, u.y - 0.047, u.z, 0.024, 0.075, 0.028, 0.009);
  for (let i = 0; i < 3; i++) rb(g, M.dark, 0, u.y - 0.034 - i * 0.016, u.z - 0.0138, 0.02, 0.006, 0.003, 0.001);
  rb(g, M.dark, 0, u.y - 0.088, u.z, 0.028, 0.006, 0.032, 0.003);
  underGrip(c, { c: [0, u.y - 0.047, u.z], h: [0.012, 0.0375, 0.014], r: 0.009 }, 'Lv');
};
ATT_BUILD.agrip = (c) => {
  // poignée angulaire : fût court incliné vers l'arrière (le bas vers le tireur, AGRIP_RAKE), effilé, reprises de doigts sur l'avant,
  // talon arrondi un peu évasé, sur un collier de rail ; la main l'empoigne (repère La)
  const { g, M, info } = c, u = info.mount.under, A = AGRIP_RAKE, L = 0.066, y0 = u.y - 0.011;
  const d = [Math.sin(A), -Math.cos(A)], p = [Math.cos(A), Math.sin(A)]; // le long du fût (vers le bas), en travers (vers l'arrière)
  const at = (t, k) => [u.z + d[0] * t + p[0] * k, y0 + d[1] * t + p[1] * k];
  const hw = (t) => 0.0155 - 0.003 * t / L;
  rb(g, M.dark, 0, u.y - 0.006, u.z, 0.032, 0.012, 0.056, 0.003);
  const front = [-0.004, 0.012, 0.02, 0.028, 0.036, 0.044, 0.052].map((t, i) => [...at(t, -hw(t) + (i > 1 && i % 2 === 0 ? 0.0022 : 0)), i > 1 ? 0.006 : 0.004]);
  const pts = [...front, [...at(L, -hw(L) - 0.002), 0.008], [...at(L + 0.004, 0), 0.01], [...at(L, hw(L) + 0.002), 0.008], [...at(-0.004, hw(0)), 0.004]];
  prof(g, M.poly, pts, 0.027, 0, 0.005, 0.004);
  rb(g, M.dark, 0, ...[at(L + 0.001, 0)[1], at(L + 0.001, 0)[0]], 0.028, 0.008, 0.03, 0.003, -A); // semelle du talon
  const ce = at(L * 0.5, 0);
  underGrip(c, { c: [0, ce[1], ce[0]], h: [0.0135, L / 2 + 0.004, 0.015], r: 0.009, rx: -A }, 'La');
};
ATT_BUILD.bipod = (c) => {
  const { g, M, info } = c, u = info.mount.under, y = u.y - 0.003;
  rb(g, M.metal, 0, y - 0.004, u.z, 0.04, 0.012, 0.034, 0.003);
  // pattes repliées vers l'avant, le long du dessous
  for (const sx of [-1, 1]) {
    rb(g, M.dark, sx * 0.014, y - 0.014, u.z - 0.05, 0.007, 0.01, 0.13, 0.002);
    cy(g, M.metal, sx * 0.014, y - 0.011, u.z + 0.012, 0.0055, 0.014, 0, 0, Math.PI / 2);
    rb(g, M.rubber, sx * 0.014, y - 0.014, u.z - 0.119, 0.008, 0.011, 0.012, 0.003);
  }
  // les doigts de la main d'appui s'arrêtent sur le socle et les pattes repliées
  if (info.gripDef) info.gripDef.L = info.gripDef.L.concat([{ c: [0, y - 0.01, u.z - 0.045], h: [0.02, 0.01, 0.083], r: 0.003 }]);
};
ATT_BUILD.laser = (c) => {
  const { g, M, info } = c, s = info.mount.side;
  if (s.under) {
    rb(g, M.dark, 0, s.y - 0.011, s.z, 0.016, 0.018, 0.038, 0.002);
    optReticle(c, cz(g, M.dot, 0, s.y - 0.011, s.z - 0.0205, 0.003, 0.003));
    info.laser = new V3(0, s.y - 0.011, s.z - 0.024);
    return;
  }
  const x = s.x - 0.0095;
  rb(g, M.metal, s.x - 0.002, s.y, s.z, 0.008, 0.008, 0.022, 0.0015); // collier sur le rail
  rb(g, M.dark, x, s.y, s.z - 0.004, 0.011, 0.022, 0.048, 0.0025); // boîtier
  rb(g, M.metal, x - 0.0062, s.y + 0.004, s.z - 0.004, 0.0016, 0.006, 0.01, 0.0006); // molette de réglage
  optReticle(c, cz(g, M.dot, x, s.y + 0.003, s.z - 0.0295, 0.003, 0.003));
  info.laser = new V3(x, s.y + 0.003, s.z - 0.032);
};
ATT_BUILD.xmag = (c) => { c.info.magExt = c.info.tubeFed ? 1 : 1.35; };
ATT_BUILD.fmag = (c) => {
  const { M, info } = c, raw = info.buildMag;
  if (!raw) return;
  info.buildMag = (parent, ext) => {
    raw(parent, ext);
    // la pièce la plus basse (plaque de talon) porte la languette d'extraction et la bande de couleur
    const b = new THREE.Box3().setFromObject(parent), w = b.max.x - b.min.x; let low = null;
    parent.traverse((o) => { if (o.isMesh) { const bb = new THREE.Box3().setFromObject(o); if (!low || bb.min.y < low.min.y) low = bb; } });
    rb(parent, M.dotW, 0, low.min.y + 0.002, low.max.z - 0.006, Math.min(0.02, w * 0.8), 0.014, 0.006, 0.001);
    rb(parent, M.dark, 0, low.min.y + 0.026, (low.min.z + low.max.z) / 2, w + 0.002, 0.006, (low.max.z - low.min.z) - 0.006, 0.001);
  };
};
const LASER = { dot: null, k: 0 };
function laserUpdate(on, dt) {
  if (!LASER.dot) {
    if (!on) return;
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    LASER.dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color().setRGB(5, 0.25, 0.15), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    LASER.dot.visible = false; LASER.dot.renderOrder = 8; LASER.dot.userData.noPrepass = true; scene.add(LASER.dot);
  }
  LASER.k = damp(LASER.k, on ? 1 : 0, 18, dt);
  if (!on) { LASER.dot.visible = LASER.k > 0.03; if (!LASER.dot.visible) return; }
  const f = camFwd(_v1), h = rayWorld(camera.position.x, camera.position.y, camera.position.z, f.x, f.y, f.z, 90);
  if (!h) { LASER.dot.visible = false; return; }
  LASER.dot.position.set(camera.position.x + f.x * (h.t - 0.02), camera.position.y + f.y * (h.t - 0.02), camera.position.z + f.z * (h.t - 0.02));
  const s = (0.012 + h.t * 0.0045) * LASER.k; LASER.dot.scale.set(s, s, s); LASER.dot.visible = true;
}


function gunMaterials() {
  if (GM) return GM;
  const S = GUNTEX.surf, T = S.canvas ? { canvas: S.canvas } : null;
  const mk = (color, r, m, o = {}, kind) => { const t = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: r, metalness: m, envMapIntensity: 1.0 }, o)); return t; };
  GM = {
    metal: mk(0x34373b, 0.38, 0.78, {}, 'metal'),
    dark: mk(0x202124, 0.5, 0.55, {}, 'steel'),
    poly: mk(0x27282a, 0.6, 0.06, {}, 'poly'),
    olive: mk(0x4d5236, 0.7, 0.05, {}, 'paint'),
    tan: mk(0x9a8664, 0.7, 0.05, {}, 'paint'),
    wood: mk(0x3a2a20, 0.58, 0.02, {}, 'wood'),
    woodR: mk(0x3a1c17, 0.46, 0.02, {}, 'wood'), // bois rouge verni de l'AK-47
    woodB: mk(0x393223, 0.56, 0.02, {}, 'wood'), // bois blond verni de la Dragounov
    fde: mk(0x4d4a3a, 0.68, 0.05, {}, 'paint'),
    taupe: mk(0x2e3138, 0.66, 0.05, {}, 'poly'), // polymère gris-brun du L96A1
    gray: mk(0x343c48, 0.55, 0.35, {}, 'steel'), // tôle phosphatée grise du Barrett M82
    blued: mk(0x2c2f34, 0.36, 0.7, {}, 'smooth'), // acier bruni lisse du M9 (vu de près en visée : à peine marqué)
    polyM: mk(0x19191b, 0.62, 0.05, {}, 'poly'), // polymère noir mat des carcasses de pistolet
    drab: mk(0x2e3426, 0.7, 0.05, {}, 'paint'),
    brass: mk(0xb58f3e, 0.3, 1.0, {}, 'smooth'),
    copper: mk(0x8f4c2c, 0.3, 1.0, {}, 'smooth'), // MFZ: gilding-metal bullet jackets (M1 Garand clip)
    steel: mk(0xaab0b6, 0.3, 0.86, {}, 'smooth'), // inox brossé (Desert Eagle) ; le camouflage le recouvre
    grip: mk(0x131313, 0.8, 0.02, {}, 'poly'), // caoutchouc d'une poignée ; le camouflage le laisse noir
    sight: mk(0x1c1e21, 0.55, 0.4), // anneau et guidon des organes de visée : sombres, mats, sans usure (programme le plus simple) ; le camouflage les laisse noirs
    glove: mk(0x2e2a25, 0.8, 0.05),
    sleeve: new THREE.MeshStandardMaterial({ color: 0xb3a07a, roughness: 0.95, map: T ? T.canvas.map : null, normalMap: T ? T.canvas.normal : null }),
    skin: mk(0xc49a78, 0.6, 0.0),
    lens: new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.35, envMapIntensity: 1.5 }),
    lensR: new THREE.MeshStandardMaterial({ color: 0xc4521e, roughness: 0.06, metalness: 0.85, transparent: true, opacity: 0.55, envMapIntensity: 1.6 }), // traitement orangé de la lentille d'un point rouge, vu de l'avant seulement
    glass: mk(0x3a5878, 0.04, 1.0, { envMapIntensity: 2.2 }), // lentille de lunette, opaque : verre traité qui reflète le décor
    glint: new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1.2, 1.15, 1.3), transparent: true, opacity: 0.4, depthWrite: false }), // reflet peint sur une lentille
    dot: new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(2.6, 0.12, 0.08) }),
    ink: new THREE.MeshBasicMaterial({ color: 0x050505 }), // traits noirs gravés d'un réticule (ACOG)
    // oculaire de l'ACOG : masque qui n'écrit que la profondeur (on voit le monde à travers), teinte cyan ajoutée, bord assombri
    ocMask: new THREE.MeshBasicMaterial({ colorWrite: false }),
    ocTint: new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(0.05, 0.11, 0.12), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    ocShade: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.055, depthWrite: false }), // douze anneaux superposés : de 0 à 50 % vers le bord
    blade: mk(0x9da2a6, 0.25, 1.0, {}, 'smooth'),
    knifeSteel: mk(0xd2d7da, 0.22, 0.6, { envMapIntensity: 1.3 }),
    tube: mk(0x18191a, 0.55, 0.6, { side: THREE.DoubleSide }, 'steel'),
    dotW: new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(2.2, 2.2, 1.8) }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.92 }),
  };
  return GM;
}
/* ======================================================================================================
   MINI FORT ZOMBIE: six period guns built with Modern's own gun builders (prof / rb / cy / cone / guard) and conventions
   (muzzle -z, y up, info.* anchors). Real-world references: Colt Python 6", Colt Detective Special 2", Colt New Service 5.5",
   Thompson M1928A1 with 50-round drum, Beretta AR70/90, Glock 22 (Gen3, built on Modern's Glock frame).
   ====================================================================================================== */
/* ---- revolver builder shared by the three Colts ---- */
function buildRevolver(c, S) {
  const { g, M, info } = c, sx2 = [-1, 1];
  const MET = S.nickel ? M.steel : M.blued, WOOD = S.wood || M.wood;
  const cz0 = S.cz, cl = S.cl, cr = S.cr, bz1 = S.bz1, fw = S.fw;           // cylinder centre z / length / radius, muzzle z, frame width
  const yTop = S.yTop;                                                        // top strap height
  // ----- frame: rear block, top strap over the cylinder, front yoke -----
  prof(g, MET, [[0.046, yTop + 0.0, 0.004], [cz0 + cl / 2 + 0.002, yTop + 0.001, 0.003], [cz0 + cl / 2 + 0.002, -0.004, 0.003], [cz0 + cl / 2 + 0.002, -0.026, 0.004], [S.zr, -0.026, 0.004], [S.zr + 0.004, -0.012, 0.004], [0.052, 0.012, 0.005]], fw, 0, 0.003, 0.003);
  prof(g, MET, [[cz0 - cl / 2 - 0.003, yTop, 0.003], [cz0 + cl / 2, yTop, 0.003], [cz0 + cl / 2, yTop - 0.007, 0.002], [cz0 - cl / 2 - 0.003, yTop - 0.007, 0.002]], fw * 0.86, 0, 0.002, 0.002); // top strap over the cylinder
  // sideplate (right), crane / yoke in front of the cylinder, ejector rod shroud
  rb(g, M.dark, fw / 2 + 0.0004, -0.001, cz0 + cl / 2 + 0.014, 0.0012, 0.03, 0.05, 0.002);
  prof(g, MET, [[cz0 - cl / 2 - 0.002, yTop - 0.004, 0.004], [cz0 - cl / 2 - 0.026, yTop - 0.002, 0.004], [cz0 - cl / 2 - 0.026, -S.lug - 0.002, 0.004], [cz0 - cl / 2 - 0.002, -0.022, 0.004]], fw * 0.9, 0, 0.003, 0.003);
  // ----- cylinder -----
  cy(g, MET, 0, 0, cz0, cr, cl, Math.PI / 2);
  cy(g, M.dark, 0, 0, cz0 + cl / 2 - 0.0008, cr * 0.97, 0.0016, Math.PI / 2);                    // rear face
  cy(g, MET, 0, 0, cz0 - cl / 2, cr * 0.96, 0.003, Math.PI / 2);
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2 + 0.52;
    if (S.flutes) rb(g, M.dark, Math.cos(a) * (cr - 0.0006), Math.sin(a) * (cr - 0.0006), cz0 - 0.002, 0.0074, 0.0046, cl * 0.64, 0.002, 0, 0, a - Math.PI / 2);
    const b = a + Math.PI / 6;
    cy(g, M.dark, Math.cos(b) * cr * 0.62, Math.sin(b) * cr * 0.62, cz0 - cl / 2 - 0.0012, cr * 0.2, 0.0014, Math.PI / 2);       // chambers (front)
    cy(g, M.brass, Math.cos(b) * cr * 0.62, Math.sin(b) * cr * 0.62, cz0 + cl / 2 + 0.0004, cr * 0.19, 0.0012, Math.PI / 2);    // cartridge rims (rear)
  }
  // ----- barrel with rib / lug -----
  const bl = cz0 - cl / 2 - 0.02 - bz1;
  cy(g, MET, 0, 0, (bz1 + cz0 - cl / 2 - 0.02) / 2, S.br, Math.abs(bz1 - (cz0 - cl / 2 - 0.02)), Math.PI / 2);
  cy(g, M.dark, 0, 0, bz1 + 0.0008, S.br * 0.62, 0.002, Math.PI / 2);                              // bore
  cy(g, MET, 0, 0, bz1 + 0.0015, S.br * 1.06, 0.004, Math.PI / 2);                                // crown
  if (S.lug) { // full underlug (Python / New Service shroud)
    const zl = S.lugZ; rb(g, MET, 0, -S.lug * 0.62, (zl[0] + zl[1]) / 2, 0.0172, S.lug * 1.0, Math.abs(zl[1] - zl[0]), 0.004);
    cy(g, MET, 0, -S.lug * 0.2, (zl[0] + zl[1]) / 2, S.br * 1.0, Math.abs(zl[1] - zl[0]), Math.PI / 2);
  }
  if (S.rib) { // ventilated rib
    const z0 = bz1 + 0.008, z1 = cz0 - cl / 2 - 0.012;
    rb(g, MET, 0, S.br + 0.0016, (z0 + z1) / 2, 0.0098, 0.0032, z1 - z0, 0.001);
    for (let z = z0 + 0.006; z < z1 - 0.004; z += 0.0085) bx(g, M.dark, 0, S.br + 0.0034, z, 0.0066, 0.0016, 0.0035);
  }
  // front ramp sight (red insert on the Python), rear sight
  const fy = S.sy, ry0 = yTop;
  prof(g, M.dark, [[bz1 + 0.026, S.br + (S.rib ? 0.0032 : 0), 0.001], [bz1 + 0.008, S.br + (S.rib ? 0.0032 : 0), 0.001], [bz1 + 0.006, fy - 0.003, 0.0008], [bz1 + 0.01, fy, 0.0008], [bz1 + 0.015, fy, 0.0008], [bz1 + 0.026, S.br + (S.rib ? 0.003 : 0.0015)]], 0.0034, 0, 0.0006, 0.0008);
  if (S.redInsert) bx(g, M.dot, 0, fy - 0.0035, bz1 + 0.0059, 0.0016, 0.0042, 0.0006);
  if (S.adj) { // Python adjustable rear sight: blade in a frame with windage screw and notch
    bx(g, M.dark, 0, ry0 + 0.002, S.zr2, 0.0125, 0.004, 0.012);
    for (const sx of sx2) rb(g, M.dark, sx * 0.0044, ry0 + 0.0065, S.zr2 + 0.001, 0.0044, 0.0085, 0.0048, 0.0006);
    bx(g, M.dark, 0, ry0 + 0.0075, S.zr2 + 0.0018, 0.0044, 0.0058, 0.0012);
    cy(g, M.metal, 0.0075, ry0 + 0.005, S.zr2 + 0.0018, 0.0016, 0.004, 0, 0, Math.PI / 2);
    cy(g, M.metal, 0, ry0 + 0.0145, S.zr2 + 0.0012, 0.0013, 0.0058, Math.PI / 2, 0, 0);
  } else { // fixed notch: groove along the top strap rear
    bx(g, M.dark, 0, yTop + 0.0004, S.zr2, 0.0042, 0.0012, 0.026);
    for (const sx of sx2) rb(g, MET, sx * 0.0043, yTop + 0.0025, S.zr2 - 0.002, 0.0039, 0.0048, 0.01, 0.0008);
  }
  // ----- hammer, trigger, guard, cylinder latch, ejector rod -----
  prof(g, MET, [[0.048, yTop - 0.008, 0.002], [0.056, yTop - 0.002, 0.002], [0.064, yTop + 0.006, 0.0015], [0.0605, yTop + 0.0105, 0.0006], [0.055, yTop + 0.0095, 0.0008], [0.049, yTop - 0.0015, 0.001], [0.0405, yTop - 0.0095, 0.002]], 0.0088, 0, 0.0012, 0.0015);
  for (let k = 0; k < 5; k++) bx(g, M.dark, 0, yTop + 0.0098, 0.0555 + k * 0.0011, 0.0092, 0.0005, 0.0005, 0.6);
  prof(g, MET, [[0.008, -0.01, 0.001], [0.0155, -0.012, 0.002], [0.0125, -0.033, 0.001], [0.0065, -0.035, 0.002], [0.004, -0.018, 0.001]], 0.0052, 0, 0.0008, 0.001);
  guard(g, MET, S.gf, S.gr, -0.016, -0.0475 - S.gd, 0.0045, 0.01, 0.0066);
  rb(g, M.metal, -(fw / 2 + 0.0016), 0.0035, cz0 + cl / 2 + 0.006, 0.0032, 0.006, 0.012, 0.0014);                                 // latch thumbpiece
  if (S.rod) { cy(g, M.metal, 0, -S.br * 1.2, (cz0 - cl / 2 - 0.02 + bz1) / 2 + 0.003, 0.0034, Math.abs(cz0 - cl / 2 - 0.02 - bz1) * 0.7, Math.PI / 2); cy(g, M.metal, 0, -S.br * 1.2, bz1 + 0.026, 0.0052, 0.007, Math.PI / 2) }
  // ----- grips -----
  const gp = S.grip; // [[z, y, r]...] profile
  prof(g, WOOD, gp, S.gw, 0, 0.004, 0.004);
  if (S.checker) for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) for (const sx of sx2) bx(g, M.dark, sx * (S.gw / 2 + 0.0002), S.gripC[1] + 0.03 - k * 0.0095, S.gripC[0] - 0.012 + j * 0.012, 0.0006, 0.0013, 0.008, 0.6);
  if (S.medallion) for (const sx of sx2) cy(g, M.brass, sx * (S.gw / 2 + 0.0004), gp[2][1] + 0.034, gp[2][0] - 0.016, 0.0055, 0.0012, 0, 0, Math.PI / 2);
  if (S.ring) { part(g, G_TOR, M.metal, 0, gp[3][1] + 0.006, gp[3][0] + 0.003, 0.0085, 0.0085, 0.0085, 0, Math.PI / 2, 0); }
  // ----- anchors -----
  info.sightY = S.sy; info.adsZ = S.zr2 + S.eye; info.tubeFed = true; info.magHome.set(0, 0, cz0 + cl / 2 + 0.01);
  info.gripR.set(0, S.gripY, S.gripZ); info.gripL.set(-0.018, S.gripY - 0.01, S.gripZ - 0.01);
  info.muzzle.position.set(0, 0, bz1 - 0.001); info.eject.position.set(0.01, 0, cz0);
  const gc = S.gripC;
  info.gripDef = {
    R: [{ c: [0, gc[1], gc[0]], h: [S.gw / 2 + 0.002, 0.045, 0.02], r: 0.008, rx: S.rake }, { c: [0, 0.006, cz0 + cl / 2 + 0.014], h: [fw / 2, 0.022, 0.032], r: 0.004 },
      { c: [0, -0.034, (S.gf + S.gr) / 2], h: [0.003, 0.0035, Math.abs(S.gf - S.gr) / 2], r: 0.002 }],
  };
  info.gripDef.L = info.gripDef.R;
  info.trigDef = { at: [0.004, -0.0235, 0.0045 - 0.0085], xTip: -0.003, guard: [] };
  // hammer returns the trigger finger: nothing moves on a revolver here (the viewmodel kicks only)
}
const _mkRevSpec = (o) => Object.assign({ cz: -0.032, cl: 0.043, cr: 0.0198, br: 0.0107, fw: 0.0245, yTop: 0.0262, zr: 0.046, gw: 0.0285, nickel: false, flutes: false, rib: false, lug: 0, lugZ: [0, 0], redInsert: false, adj: false, rod: false,
  gf: -0.022, gr: 0.0135, gd: 0.006, sy: 0.0285, eye: 0.34, zr2: 0.034, rake: -0.28, ring: false, checker: true, medallion: false, gripY: -0.058, gripZ: 0.044, gripC: [0.049, -0.062] }, o);
/* Colt Python .357 Magnum, 6-inch: ventilated rib, full underlug, red-ramp front sight, adjustable rear sight, checkered walnut */
defineGun('python', 'pistol', (c) => {
  const M = c.M;
  buildRevolver(c, _mkRevSpec({ cz: -0.03, bz1: -0.236, br: 0.0105, rib: true, lug: 0.0196, lugZ: [-0.236, -0.0765], redInsert: true, adj: true, flutes: true, medallion: true, nickel: false, sy: 0.0295, eye: 0.36, zr2: 0.036,
    grip: [[0.034, -0.0125, 0.003], [0.054, -0.006, 0.004], [0.068, -0.03, 0.006], [0.074, -0.07, 0.01], [0.074, -0.098, 0.01], [0.054, -0.112, 0.01], [0.04, -0.11, 0.006], [0.026, -0.06, 0.004], [0.024, -0.02, 0.004]], gw: 0.031, gripC: [0.049, -0.066], gripZ: 0.049, gripY: -0.064 }));
});
/* Colt Detective Special .38, 2-inch snub: short shrouded barrel, fixed sights, bobbed round-butt grips */
defineGun('dspecial', 'pistol', (c) => {
  buildRevolver(c, _mkRevSpec({ cz: -0.0235, cl: 0.0395, cr: 0.0178, bz1: -0.108, br: 0.0098, fw: 0.0225, yTop: 0.0243, zr2: 0.034, sy: 0.0275, eye: 0.34, rod: false, checker: false, flutes: false, medallion: false,
    grip: [[0.036, -0.012, 0.003], [0.05, -0.006, 0.004], [0.066, -0.02, 0.008], [0.071, -0.052, 0.012], [0.066, -0.082, 0.012], [0.045, -0.094, 0.01], [0.028, -0.09, 0.006], [0.017, -0.05, 0.004], [0.016, -0.02, 0.004]], gw: 0.0285, gripC: [0.045, -0.054], gripZ: 0.043, gripY: -0.054, gd: 0.0, gf: -0.018, gr: 0.0125 }));
});
/* Colt New Service .45 (US Army / 5.5-inch): big frame, square butt with lanyard ring, ejector rod under the barrel, fixed sights */
defineGun('newservice', 'pistol', (c) => {
  buildRevolver(c, _mkRevSpec({ cz: -0.036, cl: 0.054, cr: 0.0228, bz1: -0.205, br: 0.0128, fw: 0.0285, yTop: 0.0305, zr: 0.05, zr2: 0.038, sy: 0.0335, eye: 0.36, rod: true, checker: true, flutes: false, ring: true, gw: 0.0325,
    grip: [[0.04, -0.016, 0.003], [0.06, -0.01, 0.004], [0.081, -0.02, 0.005], [0.086, -0.066, 0.006], [0.088, -0.108, 0.006], [0.0415, -0.118, 0.006], [0.029, -0.1, 0.006], [0.02, -0.06, 0.004], [0.018, -0.024, 0.004]], gripC: [0.055, -0.07], gripZ: 0.054, gripY: -0.068, gd: 0.004, gf: -0.026, gr: 0.0145, rake: -0.16, lug: 0.0 }));
});
/* Glock 22 (.40 S&W, Gen3): Modern's full-size Glock frame without the Glock 18 selector and compensator ports, front + rear slide serrations */
defineGun('glock22', 'pistol', (c) => {
  GUN_MODELS.glock18.build(c);
  const { g, info, M } = c, sl = info.slide, yT = 0.0439, w = 0.0255, K = M.rubber;
  for (const o of sl.children.slice()) {
    const p = o.position;
    if (p.x < -(w / 2 + 0.0005) && p.z > -0.02) sl.remove(o);                          // selector disc + lever
    else if (p.y > 0.0385 && p.z < -0.1 && p.z > -0.14 && Math.abs(p.x) < 0.001) sl.remove(o);   // compensator slots on top
  }
  for (let k = 0; k < 4; k++) for (const sx of [-1, 1]) bx(sl, K, sx * (w / 2 + 0.0002), 0.0335, -0.108 + k * 0.0045, 0.0012, 0.0195, 0.0013); // front serrations
  bx(sl, M.dark, 0, yT - 0.0018, -0.1195, 0.0105, 0.004, 0.012);                                                                              // plain nose cap
});
const TOMMY_DRUM_YAW = Math.PI / 2;
/* Thompson M1928A1 "Tommy gun": finned barrel + Cutts compensator, walnut forend with vertical grip, 50-round drum, ladder rear sight */
defineGun('tommy', 'smg', (c) => {
  const { g, M, info } = c, sx2 = [-1, 1], W = M.wood, B = M.blued, D = M.dark;
  // receiver: blued lower receiver block, top cover with ejection window, ribbed rear
  prof(g, B, [[-0.158, 0.043, 0.004], [0.152, 0.043, 0.004], [0.166, 0.034, 0.004], [0.166, -0.02, 0.003], [-0.158, -0.02, 0.003]], 0.043, 0, 0.0035, 0.004);
  prof(g, B, [[-0.14, 0.049, 0.003], [0.14, 0.049, 0.003], [0.14, 0.043, 0.002], [-0.14, 0.043, 0.002]], 0.037, 0, 0.0025, 0.002);
  bx(g, D, 0.0221, 0.026, 0.012, 0.0016, 0.022, 0.078);                                                                                      // ejection port (right)
  for (const sx of sx2) rb(g, D, sx * 0.0222, 0.002, -0.05, 0.0012, 0.0046, 0.2, 0.001);                                                       // lower seam
  for (let k = 0; k < 12; k++) for (const sx of sx2) bx(g, D, sx * 0.0222, 0.022, 0.092 + k * 0.0046, 0.0012, 0.03, 0.0016);               // rear cooling-slot ribs
  // finned barrel (the M1928 Cutts barrel carries 13 fins) + compensator
  cy(g, M.metal, 0, 0.012, -0.34, 0.0105, 0.37, Math.PI / 2);
  for (let k = 0; k < 14; k++) cy(g, B, 0, 0.012, -0.172 - k * 0.0104, 0.0165, 0.0045, Math.PI / 2);
  cy(g, B, 0, 0.012, -0.445, 0.0155, 0.062, Math.PI / 2); cy(g, D, 0, 0.012, -0.476, 0.0098, 0.002, Math.PI / 2);
  for (let k = 0; k < 4; k++) for (const sx of sx2) bx(g, D, sx * 0.0148, 0.012, -0.44 - k * 0.0095, 0.0018, 0.0058, 0.0058);
  for (let k = 0; k < 4; k++) bx(g, D, 0, 0.0268, -0.44 - k * 0.0095, 0.0058, 0.0018, 0.0058);
  // front sight blade with ears on the compensator, ladder rear sight on the receiver
  prof(g, D, [[-0.4, 0.0265], [-0.399, 0.052, 0.001], [-0.396, 0.052, 0.001], [-0.395, 0.0265]], 0.0036, 0, 0.0006, 0.001);
  for (const sx of sx2) rb(g, D, sx * 0.0058, 0.0425, -0.3975, 0.0022, 0.0225, 0.0085, 0.001);
  rb(g, D, 0, 0.0525, 0.131, 0.0235, 0.0036, 0.017, 0.001); for (const sx of sx2) rb(g, D, sx * 0.0072, 0.0585, 0.131, 0.0046, 0.0095, 0.012, 0.001);
  bx(g, B, 0, 0.0595, 0.1325, 0.0105, 0.0016, 0.004); bx(g, M.dotW, 0, 0.0605, 0.1325, 0.0042, 0.0006, 0.0016);
  // walnut forend (long, below the barrel) and the M1928A1 vertical foregrip
  prof(g, W, [[-0.168, 0.0, 0.004], [-0.285, -0.001, 0.004], [-0.287, -0.026, 0.008], [-0.168, -0.026, 0.004]], 0.046, 0, 0.004, 0.004);
  prof(g, W, [[-0.172, -0.026, 0.004], [-0.135, -0.026, 0.004], [-0.13, -0.13, 0.012], [-0.17, -0.13, 0.012]], 0.0285, 0, 0.005, 0.005);
  for (let k = 0; k < 6; k++) for (const sx of sx2) bx(g, D, sx * 0.0146, -0.047 - k * 0.0135, -0.15, 0.0006, 0.0013, 0.03);                  // grip checkering
  rb(g, B, 0, -0.027, -0.152, 0.0475, 0.006, 0.05, 0.002);
  // pistol grip (walnut, raked), trigger group, blued guard
  prof(g, W, [[0.056, -0.018, 0.004], [0.108, -0.018, 0.004], [0.116, -0.12, 0.012], [0.066, -0.125, 0.012], [0.052, -0.07, 0.006]], 0.03, 0, 0.004, 0.004);
  for (let k = 0; k < 7; k++) for (const sx of sx2) bx(g, D, sx * 0.0152, -0.045 - k * 0.0095, 0.088 - k * 0.0006, 0.0006, 0.0014, 0.036, 0.0);
  guard(g, B, 0.0, 0.058, -0.02, -0.07, 0.0042, 0.01, 0.0072);
  rb(g, M.metal, 0, -0.037, 0.026, 0.006, 0.026, 0.006, 0.002, 0.2);
  rb(g, B, 0.0225, 0.04, 0.152, 0.002, 0.006, 0.012, 0.001);                                                                                  // safety / selector lever
  cy(g, B, 0.0225, 0.0095, 0.012, 0.0045, 0.003, 0, 0, Math.PI / 2); rb(g, B, 0.0243, 0.0095, 0.025, 0.0018, 0.004, 0.026, 0.001);            // fire selector
  // buttstock: walnut with comb, steel buttplate
  prof(g, W, [[0.166, 0.034, 0.004], [0.27, 0.025, 0.006], [0.38, 0.02, 0.008], [0.465, 0.014, 0.008], [0.472, -0.115, 0.008], [0.385, -0.09, 0.014], [0.3, -0.062, 0.014], [0.22, -0.034, 0.008], [0.166, -0.022, 0.004]], 0.036, 0, 0.005, 0.006);
  prof(g, M.metal, [[0.466, 0.016, 0.002], [0.4735, 0.014, 0.002], [0.4805, -0.1, 0.004], [0.4735, -0.1, 0.002]], 0.04, 0, 0.002, 0.002);
  cy(g, B, 0, 0.005, 0.172, 0.0035, 0.045, 0, 0, Math.PI / 2);
  // charging handle (top, moves with the bolt on each shot)
  const bolt = new THREE.Group(); g.add(bolt); info.bolt = bolt;
  cy(bolt, B, 0, 0.0545, -0.03, 0.0052, 0.011, 0, 0, 0); cy(bolt, D, 0, 0.0605, -0.03, 0.0072, 0.0075, 0, 0, 0);
  bx(bolt, B, 0, 0.0492, -0.03, 0.007, 0.002, 0.04);
  // 50-round Type L drum (magwell under the receiver, behind the foregrip)
  info.magHome.set(0, -0.02, -0.05);
  info.buildMag = (parent0, ext) => {
    const r = 0.078, yC = -0.108;
    prof(parent0, B, [[-0.02, 0.0, 0.002], [0.02, 0.0, 0.002], [0.02, -0.03, 0.003], [-0.02, -0.03, 0.003]], 0.0385, 0, 0.003, 0.003);
    // v056: drum turned 90 deg about the vertical axis (TOMMY_DRUM_YAW; set it to 0 for the original side-facing drum)
    const parent = new THREE.Group(); parent.position.set(0, yC, 0); parent.rotation.y = TOMMY_DRUM_YAW; parent0.add(parent);
    const pv = new THREE.Group(); pv.position.set(0, -yC, 0); parent.add(pv);
    cy(pv, B, 0, yC, 0, r, 0.0535, 0, 0, Math.PI / 2);
    cy(pv, M.metal, 0, yC, 0, r * 0.52, 0.0575, 0, 0, Math.PI / 2);
    for (const sx of sx2) { cy(pv, D, sx * 0.0272, yC, 0, r * 0.9, 0.0016, 0, 0, Math.PI / 2); for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; rb(pv, D, sx * 0.0275, yC + Math.sin(a) * r * 0.74, Math.cos(a) * r * 0.74, 0.0014, 0.0075, 0.0165, 0.002, a); } }
    cy(pv, M.brass, 0, yC, 0, r * 0.27, 0.0595, 0, 0, Math.PI / 2);
    for (const sx of sx2) cy(pv, D, sx * 0.0295, yC, 0, 0.011, 0.002, 0, 0, Math.PI / 2);
  };
  info.magAxis = new V3(0, -1, 0); info.magGrip = new V3(0, -0.098, 0.04);
  info.gripR.set(0, -0.06, 0.082); info.gripL.set(0, -0.06, -0.152);
  info.sightY = 0.0605; info.adsZ = 0.131 + 0.17;
  info.muzzle.position.set(0, 0.012, -0.477); info.eject.position.set(0.024, 0.032, 0.06);
  info.gripDef = {
    R: [{ c: [0, -0.07, 0.088], h: [0.016, 0.05, 0.026], r: 0.01, rx: -0.2 }, { c: [0, 0.01, 0.0], h: [0.022, 0.03, 0.17], r: 0.004 }],
    L: [{ c: [0, -0.076, -0.152], h: [0.016, 0.055, 0.021], r: 0.012 }],
  };
  info.trigDef = { at: [0.004, -0.034, 0.026 - 0.009], xTip: -0.003, guard: [{ c: [0, -0.07, 0.029], h: [0.003, 0.003, 0.03], r: 0.002 }] };
});
/* Beretta AR70/90 ("AR90"): 5.56 mm, integral carrying handle with peep rear sight, ventilated polymer handguard, slotted flash hider, folding-style polymer stock */
defineGun('ar90', 'rifle', (c) => {
  const { g, M, info } = c, sx2 = [-1, 1], P = M.poly, D = M.dark, Mt = M.metal;
  // receiver (stamped steel, matte black) with ejection port and magazine well
  prof(g, M.blued, [[-0.12, 0.06, 0.004], [0.2, 0.06, 0.004], [0.208, 0.05, 0.004], [0.208, -0.012, 0.003], [-0.12, -0.012, 0.003]], 0.04, 0, 0.003, 0.004);
  rb(g, D, 0.0202, 0.034, 0.03, 0.0012, 0.022, 0.07, 0.002);
  prof(g, P, [[-0.1, -0.012, 0.002], [-0.05, -0.012, 0.002], [-0.045, -0.044, 0.004], [-0.098, -0.044, 0.004]], 0.044, 0, 0.003, 0.003);
  // integral carrying handle with rear peep sight
  prof(g, M.blued, [[-0.082, 0.06, 0.004], [-0.07, 0.092, 0.01], [0.05, 0.092, 0.01], [0.062, 0.06, 0.004], [0.04, 0.06, 0.002], [0.034, 0.083, 0.004], [-0.052, 0.083, 0.004], [-0.058, 0.06, 0.002]], 0.022, 0, 0.003, 0.004);
  // v071: rear peep sits ON TOP of the carry handle (it used to sit inside the handle's top bar, so aiming looked into the handle)
  rb(g, D, 0, 0.0965, 0.052, 0.0132, 0.017, 0.0132, 0.002);
  part(g, G_TOR, D, 0, 0.1035, 0.0585, 0.0075, 0.0075, 0.0075, 0, 0, 0);
  for (const sx of sx2) rb(g, D, sx * 0.0088, 0.106, 0.0585, 0.002, 0.016, 0.007, 0.001);
  // ventilated handguard + gas block + barrel + slotted flash hider
  rb(g, P, 0, 0.03, -0.215, 0.044, 0.0485, 0.218, 0.006); rb(g, P, 0, 0.0, -0.2, 0.0415, 0.008, 0.19, 0.003);
  for (let k = 0; k < 9; k++) for (const sx of sx2) rb(g, D, sx * 0.0222, 0.036, -0.135 - k * 0.0215, 0.0012, 0.0188, 0.0155, 0.002);
  rb(g, P, 0, 0.0635, -0.215, 0.026, 0.0045, 0.205, 0.002);
  cy(g, Mt, 0, 0.034, -0.435, 0.0073, 0.43, Math.PI / 2);
  cy(g, D, 0, 0.036, -0.34, 0.0125, 0.034, Math.PI / 2); rb(g, D, 0, 0.0505, -0.34, 0.012, 0.017, 0.02, 0.002);
  // v071: front post tip on the same line as the rear peep centre, with taller protective ears
  prof(g, D, [[-0.351, 0.056], [-0.349, 0.1035, 0.001], [-0.344, 0.1035, 0.001], [-0.342, 0.056]], 0.0038, 0, 0.0006, 0.001);
  for (const sx of sx2) rb(g, D, sx * 0.0072, 0.082, -0.346, 0.0022, 0.046, 0.0125, 0.001);
  cy(g, D, 0, 0.034, -0.53, 0.0112, 0.075, Math.PI / 2); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; bx(g, M.rubber, Math.cos(a) * 0.0102, 0.034 + Math.sin(a) * 0.0102, -0.53, 0.0026, 0.0026, 0.04, 0, 0, a); }
  cy(g, M.metal, 0, 0.034, -0.567, 0.0072, 0.002, Math.PI / 2);
  // 30-round magazine
  info.magHome.set(0, -0.012, -0.075);
  info.buildMag = (parent, ext) => { curvedMag(parent, M, 12, 0.152 + (ext - 1) * 0.04, 0.0236, 0.044, 0.22, P); };
  info.magAxis = new V3(0, -1, 0.22); info.magGrip = new V3(0, -0.06, -0.012);
  // pistol grip, trigger guard, safety/selector, charging handle, stock
  prof(g, P, [[0.045, -0.008, 0.004], [0.095, -0.008, 0.004], [0.108, -0.1, 0.01], [0.072, -0.112, 0.008], [0.056, -0.076, 0.006]], 0.03, 0, 0.004, 0.004);
  guard(g, M.blued, 0.0, 0.062, -0.012, -0.06, 0.0045, 0.01, 0.007); rb(g, M.metal, 0, -0.026, 0.026, 0.006, 0.026, 0.006, 0.002, 0.2);
  rb(g, D, -0.0212, 0.026, 0.056, 0.0028, 0.012, 0.011, 0.001);
  const bolt = new THREE.Group(); g.add(bolt); info.bolt = bolt; rb(bolt, D, -0.0276, 0.034, -0.02, 0.012, 0.01, 0.034, 0.003); rb(bolt, M.metal, -0.0212, 0.034, -0.03, 0.004, 0.006, 0.06, 0.001);
  prof(g, P, [[0.208, 0.05, 0.004], [0.3, 0.046, 0.006], [0.395, 0.04, 0.008], [0.43, 0.036, 0.008], [0.436, -0.07, 0.008], [0.38, -0.062, 0.012], [0.3, -0.042, 0.012], [0.22, -0.016, 0.004]], 0.036, 0, 0.005, 0.005);
  rb(g, M.rubber, 0, -0.016, 0.436, 0.039, 0.115, 0.008, 0.002);
  info.gripR.set(0, -0.058, 0.082); info.gripL.set(0, 0.0, -0.2);
  info.sightY = 0.1035; info.adsZ = 0.0585 + 0.19; info.lFrame = null;
  info.muzzle.position.set(0, 0.034, -0.571); info.eject.position.set(0.022, 0.034, 0.03);
  info.gripDef = {
    R: [{ c: [0, -0.06, 0.082], h: [0.0155, 0.05, 0.025], r: 0.01, rx: -0.2 }, { c: [0, 0.02, 0.04], h: [0.021, 0.04, 0.17], r: 0.004 }],
    L: [{ c: [0, 0.028, -0.215], h: [0.023, 0.026, 0.108], r: 0.006 }],
  };
  info.trigDef = { at: [0.004, -0.028, 0.026 - 0.009], xTip: -0.003, guard: [{ c: [0, -0.06, 0.03], h: [0.003, 0.003, 0.03], r: 0.002 }] };
});

/* M1 Garand (U.S. Rifle, Caliber .30, M1), MFZ v056. True scale: 1.103 m overall, 24" (0.61 m) barrel, 13.25" length of pull.
   One-piece walnut stock with semi-pistol-grip wrist, rear + front upper handguards with the lower band between them, stock ferrule,
   Parkerized receiver with open top: bolt, operating rod + handle, 8-round en-bloc clip of .30-06 visible from above, clip latch,
   receiver-heel aperture rear sight (elevation knob left, windage right, protective ears), gas cylinder with lock + screw, winged
   front sight post, bayonet lug, front + rear sling swivels, checkered steel buttplate with trap door. Iron sights only. */
defineGun('garand', 'rifle', (c) => {
  const { g, M, info } = c, sx2 = [-1, 1], W = M.wood, P = M.gray, D = M.dark, Mt = M.metal, by = 0.03;
  const zRS = 0.02, zFS = -0.668;                      // rear aperture, front post
  info.sightY = 0.066; info.adsZ = zRS + 0.2;           // ironW() needs these first
  // ---------- stock: forend under the handguards, receiver inlet, tang, straight comb, butt, belly, semi-pistol grip ----------
  prof(g, W, [[-0.566, 0.031, 0.004], [-0.205, 0.031, 0.002], [-0.2, 0.017, 0.002], [0.036, 0.017, 0.002], [0.062, 0.031, 0.008], [0.15, 0.03, 0.03], [0.393, 0.002, 0.004],
    [0.393, -0.138, 0.004], [0.2, -0.086, 0.04], [0.128, -0.071, 0.014], [0.11, -0.041, 0.006], [-0.02, -0.04, 0.01], [-0.13, -0.031, 0.03], [-0.26, -0.019, 0.04], [-0.566, -0.006, 0.008]], 0.041, 0, 0.0075, 0.006);
  rb(g, W, 0, -0.047, 0.145, 0.036, 0.04, 0.05, 0.016, -0.55);                                                                                  // rounded grip swell
  // checkered steel buttplate with its trap door, rear sling swivel under the butt
  prof(g, P, [[0.3925, 0.004, 0.002], [0.4, 0.004, 0.002], [0.4, -0.1405, 0.003], [0.3925, -0.1405, 0.002]], 0.0425, 0, 0.002, 0.002);
  for (let k = 0; k < 10; k++) bx(g, D, 0, -0.006 - k * 0.0134, 0.4005, 0.035, 0.0011, 0.0012);
  rb(g, D, 0, -0.04, 0.4009, 0.019, 0.05, 0.0008, 0.002); cy(g, Mt, 0, -0.068, 0.4012, 0.003, 0.001);
  bx(g, P, 0, -0.113, 0.3, 0.012, 0.004, 0.032, -0.26); part(g, G_TOR, P, 0, -0.126, 0.3, 0.0115, 0.0115, 0.0115, 0, Math.PI / 2, 0);
  // ---------- receiver (Parkerized): front ring, bridge, open well between two rails, heel carrying the rear sight ----------
  cy(g, P, 0, by, -0.17, 0.0165, 0.04);
  prof(g, P, [[-0.152, 0.048, 0.003], [-0.134, 0.048, 0.002], [-0.134, 0.017, 0.001], [-0.018, 0.017, 0.001], [-0.018, 0.05, 0.003], [0.012, 0.0525, 0.004], [0.036, 0.047, 0.006],
    [0.042, 0.017, 0.003], [-0.152, 0.013, 0.003]], 0.03, 0, 0.003, 0.003);
  for (const sx of sx2) { rb(g, P, sx * 0.0128, 0.032, -0.076, 0.0045, 0.032, 0.118, 0.0015); rb(g, D, sx * 0.0151, 0.026, -0.076, 0.0008, 0.0035, 0.1, 0.0004); }  // rails + machining step
  bx(g, D, 0, 0.0172, -0.076, 0.021, 0.0016, 0.114);                                                                                             // dark well floor (clip shows above it)
  rb(g, D, -0.0158, 0.022, -0.012, 0.003, 0.011, 0.013, 0.0012);                                                                                 // clip latch (left)
  for (const [z, y] of [[-0.142, 0.022], [0.028, 0.03]]) for (const sx of sx2) cy(g, D, sx * 0.0152, y, z, 0.0022, 0.001, 0, 0, Math.PI / 2);  // pins
  rb(g, D, 0.0152, 0.042, 0.0, 0.0008, 0.006, 0.026, 0.0004);                                                                                   // serial / marking panel
  // ---------- rear sight on the heel: base, protective ears, aperture, elevation (left) + windage (right) knobs ----------
  rb(g, P, 0, 0.056, 0.024, 0.024, 0.008, 0.03, 0.002);
  for (const sx of sx2) { prof(g, P, [[0.008, 0.0535, 0.001], [0.012, 0.079, 0.003], [0.036, 0.071, 0.004], [0.04, 0.0535, 0.001]], 0.0034, sx * 0.0118, 0.0008, 0.002); }
  for (const sx of sx2) bx(g, D, sx * 0.0072, 0.0625, zRS + 0.003, 0.0034, 0.009, 0.006);                                                       // aperture slide cheeks (the peep itself stays clear)
  ironRing(c, zRS, IRON.hole.rifle * 0.8);
  cy(g, P, -0.0215, 0.058, 0.026, 0.0102, 0.007, 0, 0, Math.PI / 2); cy(g, D, -0.0252, 0.058, 0.026, 0.0062, 0.0012, 0, 0, Math.PI / 2);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; bx(g, D, -0.0215, 0.058 + Math.sin(a) * 0.0102, 0.026 + Math.cos(a) * 0.0102, 0.0072, 0.0012, 0.0012, a); }
  cy(g, P, 0.0195, 0.058, 0.026, 0.0078, 0.006, 0, 0, Math.PI / 2); cy(g, D, 0.0228, 0.058, 0.026, 0.0045, 0.0012, 0, 0, Math.PI / 2);
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; bx(g, D, 0.0195, 0.058 + Math.sin(a) * 0.0078, 0.026 + Math.cos(a) * 0.0078, 0.0062, 0.001, 0.001, a); }
  // ---------- trigger group: housing plate, big guard, trigger, safety tab at the front of the guard ----------
  rb(g, D, 0, -0.0415, 0.062, 0.024, 0.005, 0.1, 0.002);
  guard(g, P, 0.018, 0.108, -0.04, -0.088, 0.0055, 0.004, 0.0105);
  rb(g, Mt, 0, -0.057, 0.066, 0.0062, 0.03, 0.0065, 0.002, 0.24);
  rb(g, D, 0, -0.049, 0.0235, 0.0085, 0.015, 0.008, 0.002, -0.35);
  cy(g, D, 0, -0.045, 0.1, 0.0035, 0.026, 0, 0, Math.PI / 2);                                                                                     // trigger-group pin
  // ---------- barrel, handguards, lower band, stock ferrule ----------
  cone(g, Mt, 0, by, -0.441, 0.0082, 0.0128, 0.522);
  cy(g, D, 0, by, -0.7025, 0.0052, 0.002);
  rb(g, P, 0, by + 0.006, -0.199, 0.038, 0.036, 0.006, 0.006);                                                                                     // rear handguard clip
  rb(g, W, 0, by + 0.006, -0.288, 0.0355, 0.031, 0.172, 0.0125);                                                                                  // rear handguard
  for (const sx of sx2) bx(g, D, sx * 0.0176, by + 0.006, -0.288, 0.0008, 0.0016, 0.15);                                                          // handguard / stock seam
  rb(g, P, 0, by + 0.006, -0.377, 0.04, 0.035, 0.009, 0.007);                                                                                      // lower band
  cy(g, D, 0.0198, by + 0.006, -0.377, 0.0022, 0.002, 0, 0, Math.PI / 2);
  rb(g, W, 0, by + 0.006, -0.47, 0.0355, 0.031, 0.18, 0.0125);                                                                                    // front handguard
  rb(g, P, 0, 0.0185, -0.566, 0.045, 0.043, 0.012, 0.007);                                                                                         // stock ferrule
  // ---------- gas cylinder: rear band, cylinder, front sight base + winged post, bayonet lug, front swivel, lock + lock screw ----------
  cy(g, P, 0, by, -0.584, 0.0145, 0.012); cy(g, P, 0, by, -0.636, 0.0135, 0.1);
  rb(g, P, 0, by + 0.0155, -0.662, 0.014, 0.011, 0.034, 0.003);
  const fy0 = by + 0.0205, pw = ironW(c, zFS, IRON.post), ew = ironW(c, zFS, IRON.ear);
  bx(g, M.sight, 0, (fy0 + info.sightY) / 2, zFS, pw, info.sightY - fy0, 0.004);
  for (const sx of sx2) { bx(g, P, sx * 0.0068, (fy0 + info.sightY + 0.002) / 2, zFS + 0.002, ew, info.sightY + 0.002 - fy0, 0.016); bx(g, P, sx * 0.0068, fy0 + 0.002, zFS + 0.002, 0.004, 0.004, 0.02); }
  rb(g, P, 0, by - 0.018, -0.656, 0.0085, 0.009, 0.032, 0.002);                                                                                    // bayonet lug
  bx(g, P, 0, by - 0.0175, -0.6, 0.008, 0.008, 0.012); part(g, G_TOR, P, 0, by - 0.03, -0.6, 0.0105, 0.0105, 0.0105, 0, Math.PI / 2, 0);        // front swivel
  cy(g, P, 0, by, -0.6905, 0.0122, 0.009); for (const sx of sx2) bx(g, D, sx * 0.0122, by, -0.6905, 0.0012, 0.006, 0.009);                          // gas cylinder lock
  cy(g, Mt, 0, by, -0.6975, 0.0076, 0.006); bx(g, D, 0, by, -0.7005, 0.0128, 0.0018, 0.0012);                                                         // lock screw + slot
  // ---------- moving parts: bolt (in the well), operating rod + handle (right side); cycle back on each shot ----------
  const bolt = new THREE.Group(); g.add(bolt); info.bolt = bolt;
  cy(bolt, Mt, 0, 0.0415, -0.085, 0.0082, 0.094); cy(bolt, D, 0, 0.0415, -0.0375, 0.0045, 0.006);
  for (const sx of sx2) rb(bolt, Mt, sx * 0.0072, 0.0415, -0.124, 0.004, 0.006, 0.012, 0.001);                                                    // locking lugs
  cy(bolt, Mt, 0.0108, 0.0425, -0.095, 0.0032, 0.007, 0, 0, Math.PI / 2);                                                                         // bolt roller
  cy(bolt, Mt, 0.0178, 0.0245, -0.39, 0.0034, 0.42);                                                                                              // operating rod
  rb(bolt, Mt, 0.0172, 0.031, -0.135, 0.004, 0.017, 0.062, 0.0015);                                                                               // rod rear section + cam
  rb(bolt, Mt, 0.0235, 0.0355, -0.148, 0.011, 0.0105, 0.016, 0.003); part(bolt, new THREE.SphereGeometry(1, 10, 8), Mt, 0.0298, 0.0362, -0.148, 0.0068, 0.0062, 0.0074); // handle
  cy(bolt, Mt, 0, by, -0.594, 0.0072, 0.012);                                                                                                      // piston head (in the gas cylinder)
  // ---------- 8-round en-bloc clip (rises out of the top on reload, the Garand way) ----------
  info.magHome.set(0, 0.0315, -0.08);
  info.buildMag = (parent) => {
    const Cu = M.copper || M.brass;
    for (let k = 0; k < 8; k++) {
      const sx = k % 2 ? 0.0056 : -0.0056, y = -0.0042 - k * 0.0056;
      cy(parent, M.brass, sx, y, 0.012, 0.0059, 0.062); cy(parent, M.brass, sx, y, 0.0435, 0.006, 0.0014); cy(parent, D, sx, y, 0.0443, 0.0021, 0.0006); // case, rim, primer
      cone(parent, M.brass, sx, y, -0.0235, 0.0042, 0.0059, 0.009, 14);                                                                       // shoulder + neck
      cone(parent, Cu, sx, y, -0.0375, 0.0012, 0.0041, 0.02, 14);                                                                            // bullet
    }
    for (const sx of sx2) { rb(parent, P, sx * 0.0122, -0.022, 0.012, 0.0012, 0.042, 0.064, 0.0005); rb(parent, P, sx * 0.0108, -0.0005, 0.012, 0.0034, 0.002, 0.064, 0.0006); } // side plates + lips
    rb(parent, P, 0, -0.022, 0.0442, 0.0255, 0.042, 0.0012, 0.0005);                                                                            // spine
  };
  info.magAxis = new V3(-0.8, 0.6, 0); info.magGrip = new V3(-0.004, 0.03, 0.01);
  // ---------- anchors ----------
  info.butt = [0, -0.068, 0.4];
  info.gripR.set(0, -0.048, 0.122); info.gripL.set(0, 0.024, -0.33);
  info.muzzle.position.set(0, by, -0.704); info.eject.position.set(0.012, 0.042, -0.085);
  info.gripDef = {
    R: [{ c: [0, -0.052, 0.13], h: [0.0175, 0.042, 0.028], r: 0.012, rx: -0.6 }, { c: [0, 0.018, 0.0], h: [0.021, 0.03, 0.13], r: 0.006 }],
    L: [{ c: [0, 0.016, -0.33], h: [0.022, 0.024, 0.11], r: 0.012 }, { c: [0, 0.036, -0.377], h: [0.021, 0.018, 0.006], r: 0.004 }],
  };
  info.trigDef = { at: [0.004, -0.058, 0.058], xTip: -0.004, guard: [{ c: [0, -0.087, 0.063], h: [0.005, 0.003, 0.045], r: 0.002 }, { c: [0, -0.064, 0.02], h: [0.005, 0.024, 0.003], r: 0.002 }] };
});

window.RGUN={GUN_MODELS,buildGunModel,gunKey,gunSpec,gunFam,gunMaterials,ATT,THREE_V3:V3};
})();
