/* ==========================================================================================================
   MODERN PROP KIT - ported from Modern (src/02a-kit.js Maker/GeoBuf/Prefab + the PF.* prop libraries of
   02d-archi.js, 02f-props.js, 02k-dynprops.js, 02h-nature.js, 02i-hiver.js, 02j-rail.js, 02l-port.js, 02ye-cyclades-deco.js, 02ym-pavillons-kit.js, 02yg-doom-kit.js, 02yk-simoun-kit.js, 02yi-stratus-kit.js, 02q-jardin.js, 02w-jardins.js, 02r-serre.js, 02g-vehicles.js, 02y-paris.js).
   Builds Modern's own procedural geometry (chamfered boxes, lathes, extrusions, sweeps) into per-material buffers.
   MFZ side: js/layers/props.js turns them into meshes. Exposes window.RGPK.
   ========================================================================================================== */
(function(){
var THREE=window.THREE;
var TAU=Math.PI*2,PI=Math.PI;
var clamp=(v,a,b)=>(v<a?a:v>b?b:v);
function hyp(x,y){return Math.sqrt(x*x+y*y)}function hyp3(x,y,z){return Math.sqrt(x*x+y*y+z*z)}
var lerp=(a,b,t)=>a+(b-a)*t;var smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
var rand=(a,b)=>a+Math.random()*(b-a),randi=(a,b)=>Math.floor(a+Math.random()*(b-a+1)),pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
var damp=(a,b,l,dt)=>lerp(a,b,1-Math.exp(-l*dt));
function mulberry32(a){return function(){a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
var V3=THREE.Vector3;var _v1=new V3(),_v2=new V3(),_v3=new V3(),_v4=new V3();var _q1=new THREE.Quaternion(),_m1=new THREE.Matrix4();var UP=new V3(0,1,0);
var sl=(c)=>Math.pow(c,2.2);
var hasKey=(o,k)=>typeof k==='string'&&Object.prototype.hasOwnProperty.call(o,k);var numOr=(v,d=0)=>{v=+v;return Number.isFinite(v)?v:d};
var HOOKS={missing:{}};
var TEXLAB={},WINTER_TEX=new Set(),OPT_TEX=new Set(),CURMAP={def:{},id:'mfz'},COARSE=false,DECK=false,CYF={};
var PROPT={};function propType(id,def){PROPT[id]=def;return def}
var SPH=(cx,cy,cz,r)=>['s',cx,cy,cz,r],BOX=(cx,cy,cz,hx,hy,hz)=>['b',cx,cy,cz,hx,hy,hz],CYL=(cx,cy,cz,r,hh)=>['y',cx,cy,cz,r,hh];
var swHeight=(y0,y1,k=1.5,m=1)=>(x,y)=>m*Math.pow(clamp((y-y0)/(y1-y0),0,1),k);
function rngOf(seed){const r=mulberry32(seed);r.pick=(a)=>a[Math.floor(r()*a.length)];r.range=(a,b)=>a+r()*(b-a);r.jit=(v,k)=>v+(r()-0.5)*2*k;r.chance=(p)=>r()<p;return r}
function aoGround(y0=0,k=0.55,h=0.6){return(x,y)=>lerp(k,1,smoothstep(y0,y0+h,y))}


const _mk = new THREE.Matrix4(), _kv = new V3();
function _growF(a, n) { const b = new Float32Array(n); if (a) b.set(a); return b; }

/* Matières vivantes (feuillages qui bougent au vent et au passage des soldats, voir 02n-flore.js) : leurs sommets portent
   en plus un poids de souplesse (0 : fixe, 1 : libre), lu par le shader dans l'attribut aSw. Les autres matières n'ont pas ce canal. */
const LIVING = new Set();
class GeoBuf {
  constructor(v = 256, i = 512, sw = false) { this.nv = 0; this.ni = 0; this.vc = 0; this.ic = 0; this.sw = sw; this.S = null; this.reserve(v, i); }
  reserve(v, i) {
    if (this.nv + v > this.vc) {
      const c = Math.max(this.vc * 2, this.nv + v, 64);
      this.P = _growF(this.P, c * 3); this.N = _growF(this.N, c * 3); this.U = _growF(this.U, c * 2); this.C = _growF(this.C, c * 3); this.A = _growF(this.A, c);
      if (this.sw) this.S = _growF(this.S, c);
      this.vc = c;
    }
    if (this.ni + i > this.ic) {
      const c = Math.max(this.ic * 2, this.ni + i, 128), b = new Uint32Array(c);
      if (this.I) b.set(this.I); this.I = b; this.ic = c;
    }
  }
  vert(x, y, z, nx, ny, nz, u, v, r, g, b, a, s) {
    if (this.nv >= this.vc) this.reserve(1, 0);
    const i = this.nv, i3 = i * 3, i2 = i * 2;
    this.P[i3] = x; this.P[i3 + 1] = y; this.P[i3 + 2] = z;
    this.N[i3] = nx; this.N[i3 + 1] = ny; this.N[i3 + 2] = nz;
    this.U[i2] = u; this.U[i2 + 1] = v;
    this.C[i3] = r; this.C[i3 + 1] = g; this.C[i3 + 2] = b; this.A[i] = a;
    if (this.S) this.S[i] = s || 0;
    return this.nv++;
  }
  tri(a, b, c) {
    if (this.ni + 3 > this.ic) this.reserve(0, 3);
    this.I[this.ni++] = a; this.I[this.ni++] = b; this.I[this.ni++] = c;
  }
  /* Ajoute un autre GeoBuf tel quel (fusion de tronçons) */
  append(g) {
    this.reserve(g.nv, g.ni); const o = this.nv;
    this.P.set(g.P.subarray(0, g.nv * 3), o * 3); this.N.set(g.N.subarray(0, g.nv * 3), o * 3); this.U.set(g.U.subarray(0, g.nv * 2), o * 2);
    this.C.set(g.C.subarray(0, g.nv * 3), o * 3); this.A.set(g.A.subarray(0, g.nv), o);
    if (this.S && g.S) this.S.set(g.S.subarray(0, g.nv), o);
    for (let i = 0; i < g.ni; i++) this.I[this.ni + i] = g.I[i] + o;
    this.nv += g.nv; this.ni += g.ni;
  }
  geometry() {
    const g = new THREE.BufferGeometry(), n = this.nv;
    g.setAttribute('position', new THREE.BufferAttribute(this.P.slice(0, n * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.N.slice(0, n * 3), 3));
    g.setAttribute('uv', new THREE.BufferAttribute(this.U.slice(0, n * 2), 2));
    g.setAttribute('color', new THREE.BufferAttribute(this.C.slice(0, n * 3), 3));
    g.setAttribute('aoc', new THREE.BufferAttribute(this.A.slice(0, n), 1));
    if (this.S) g.setAttribute('aSw', new THREE.BufferAttribute(this.S.slice(0, n), 1));
    g.setIndex(new THREE.BufferAttribute(n > 65535 ? this.I.slice(0, this.ni) : Uint16Array.from(this.I.subarray(0, this.ni)), 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
}

/* ---------- Maker : transformations et primitives ---------- */
class Maker {
  constructor(target) {
    this.T = target; this.m = new THREE.Matrix4(); this.n3 = new THREE.Matrix3(); this.stack = [];
    this.tint = [1, 1, 1]; this.uvMode = 0; this.uvS = 1; this.uvO = [0, 0]; this.cls = 0; this.ao = 1; this.aoFn = null; this.swFn = null;
    this.nd = true; this.flip = false;
  }
  save() { this.stack.push([this.m.clone(), this.tint, this.uvMode, this.uvS, this.cls, this.ao, this.aoFn, this.uvO, this.swFn]); return this; }
  restore() {
    const s = this.stack.pop(); this.m.copy(s[0]);
    [, this.tint, this.uvMode, this.uvS, this.cls, this.ao, this.aoFn, this.uvO, this.swFn] = s; this.nd = true; return this;
  }
  move(x, y, z) { this.m.multiply(_mk.makeTranslation(x, y, z)); this.nd = true; return this; }
  rotY(a) { if (a) { this.m.multiply(_mk.makeRotationY(a)); this.nd = true; } return this; }
  rotX(a) { if (a) { this.m.multiply(_mk.makeRotationX(a)); this.nd = true; } return this; }
  rotZ(a) { if (a) { this.m.multiply(_mk.makeRotationZ(a)); this.nd = true; } return this; }
  scl(x, y = x, z = x) { this.m.multiply(_mk.makeScale(x, y, z)); this.nd = true; return this; }
  mul(m) { this.m.multiply(m); this.nd = true; return this; }
  /* teinte en sRGB (0 à 1), convertie en linéaire */
  color(c) { this.tint = c ? [sl(c[0]), sl(c[1]), sl(c[2])] : [1, 1, 1]; return this; }
  world(s) { this.uvMode = 1; if (s) this.uvS = s; return this; } // coordonnées de texture prises dans le monde (raccord entre pièces)
  local(s) { this.uvMode = 0; if (s) this.uvS = s; return this; }
  _n() { if (this.nd) { this.n3.getNormalMatrix(this.m); this.flip = this.m.determinant() < 0; this.nd = false; } }
  /* Tampon de la matière mat pour une pièce dont le centre local est (x, y, z) */
  buf(mat, x = 0, y = 0, z = 0) {
    const e = this.m.elements;
    return this.T.buf(mat, this.cls, e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]);
  }
  /* Sommet en coordonnées locales */
  v(B, x, y, z, nx, ny, nz, u, v, ao = 1, sw = 0) {
    this._n();
    const e = this.m.elements, n = this.n3.elements;
    const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
    let mx = n[0] * nx + n[3] * ny + n[6] * nz, my = n[1] * nx + n[4] * ny + n[7] * nz, mz = n[2] * nx + n[5] * ny + n[8] * nz;
    const l = hyp3(mx, my, mz) || 1; mx /= l; my /= l; mz /= l;
    if (this.uvMode === 1) {
      const ax = Math.abs(mx), ay = Math.abs(my), az = Math.abs(mz);
      if (ay >= ax && ay >= az) { u = wx; v = my > 0 ? -wz : wz; }
      else if (ax >= az) { u = mx > 0 ? -wz : wz; v = wy; }
      else { u = mz > 0 ? wx : -wx; v = wy; }
    }
    ao *= this.ao; if (this.aoFn) ao *= this.aoFn(wx, wy, wz, mx, my, mz);
    if (this.swFn && !sw) sw = this.swFn(wx, wy, wz);
    const t = this.tint;
    return B.vert(wx, wy, wz, mx, my, mz, u / this.uvS + this.uvO[0], v / this.uvS + this.uvO[1], t[0], t[1], t[2], ao, sw);
  }
  tri(B, a, b, c) { if (this.flip) B.tri(a, c, b); else B.tri(a, b, c); }
  quadI(B, a, b, c, d) { this.tri(B, a, b, c); this.tri(B, a, c, d); }
  /* Quadrilatère plan (points locaux [x,y,z]) orienté selon n ; coordonnées de texture projetées sur le plan */
  quad(mat, p0, p1, p2, p3, n, o = {}) {
    const B = this.buf(mat, (p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, (p0[2] + p2[2]) / 2);
    let P = [p0, p1, p2, p3], W = o.sw || null; // o.sw : poids de souplesse (vent) de p0 à p3
    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2], bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    if (cx * n[0] + cy * n[1] + cz * n[2] < 0) { P = [p0, p3, p2, p1]; if (W) W = [W[0], W[3], W[2], W[1]]; }
    const uvs = o.uv || projUV(P, n);
    const ao = o.ao || [1, 1, 1, 1];
    const i = P.map((p, k) => this.v(B, p[0], p[1], p[2], n[0], n[1], n[2], uvs[k][0], uvs[k][1], ao[k], W ? W[k] : 0));
    this.quadI(B, i[0], i[1], i[2], i[3]);
  }
  tri3(mat, p0, p1, p2, n) {
    const B = this.buf(mat, p0[0], p0[1], p0[2]);
    let P = [p0, p1, p2];
    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2], bx = p2[0] - p0[0], by = p2[1] - p0[1], bz = p2[2] - p0[2];
    if ((ay * bz - az * by) * n[0] + (az * bx - ax * bz) * n[1] + (ax * by - ay * bx) * n[2] < 0) P = [p0, p2, p1];
    const uvs = projUV(P, n), i = P.map((p, k) => this.v(B, p[0], p[1], p[2], n[0], n[1], n[2], uvs[k][0], uvs[k][1]));
    this.tri(B, i[0], i[1], i[2]);
  }
  /* Boîte : centrée en x et z, de y = 0 à h. o.skip : faces omises parmi 'XxYyZz' (X : +x, x : -x...) ;
     o.bevel : chanfrein des arêtes (m), qui accroche la lumière comme un vrai objet */
  /* Bois mince (poteau, poutre, lisse, planche seule, bois rond) : bois massif sans joints de planches (MAT.timber) ; les grandes faces
     (bardage, plancher, plateau) gardent les planches */
  _timber(mat, thin) { return mat === 'wood' && thin ? 'timber' : mat; }
  box(mat, w, h, d, o = {}) {
    { const q = [Math.abs(w), Math.abs(h), Math.abs(d)].sort((a, b) => a - b); mat = this._timber(mat, q[1] < 0.3); }
    const hx = w / 2, hy = h / 2, hz = d / 2, b = Math.min(o.bevel || 0, hx * 0.49, hy * 0.49, hz * 0.49), skip = o.skip || '';
    const B = this.buf(mat, 0, hy, 0);
    const corner = (sx, sy, sz, ax) => [
      ax === 0 ? sx * hx : sx * (hx - b), (ax === 1 ? sy * hy : sy * (hy - b)) + hy, ax === 2 ? sz * hz : sz * (hz - b)];
    const face = (p, n, ao) => {
      let P = p;
      const ax = p[1][0] - p[0][0], ay = p[1][1] - p[0][1], az = p[1][2] - p[0][2], bx = p[2][0] - p[0][0], by = p[2][1] - p[0][1], bz = p[2][2] - p[0][2];
      if ((ay * bz - az * by) * n[0] + (az * bx - ax * bz) * n[1] + (ax * by - ay * bx) * n[2] < 0) P = p.slice().reverse();
      const uv = projUV(P, n), ids = P.map((q, k) => this.v(B, q[0], q[1], q[2], n[0], n[1], n[2], uv[k][0], uv[k][1], ao ? ao(q) : 1));
      for (let k = 1; k < ids.length - 1; k++) this.tri(B, ids[0], ids[k], ids[k + 1]);
    };
    const aoY = o.aoBottom ? (q) => lerp(o.aoBottom, 1, smoothstep(0, Math.min(0.5, h), q[1])) : null;
    const F = 'XxYyZz';
    for (let a = 0; a < 3; a++) for (const s of [1, -1]) {
      if (skip.indexOf(F[a * 2 + (s > 0 ? 0 : 1)]) >= 0) continue;
      const n = [0, 0, 0]; n[a] = s;
      const pts = [];
      for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const sg = [0, 0, 0]; sg[a] = s; sg[(a + 1) % 3] = u; sg[(a + 2) % 3] = v;
        pts.push(corner(sg[0], sg[1], sg[2], a));
      }
      face(pts, n, a === 1 ? null : aoY);
    }
    if (b <= 0) return;
    // arêtes chanfreinées
    for (let a = 0; a < 3; a++) {
      const a1 = (a + 1) % 3, a2 = (a + 2) % 3; // arête parallèle à l'axe a2, entre les faces a et a1
      for (const sa of [1, -1]) for (const sb of [1, -1]) {
        if (!o.bevelAll && skip && (skip.indexOf(F[a * 2 + (sa > 0 ? 0 : 1)]) >= 0 || skip.indexOf(F[a1 * 2 + (sb > 0 ? 0 : 1)]) >= 0)) continue;
        const n = [0, 0, 0]; n[a] = sa * Math.SQRT1_2; n[a1] = sb * Math.SQRT1_2;
        const pts = [];
        for (const [sc, ax] of [[-1, a], [1, a], [1, a1], [-1, a1]]) { const sg = [0, 0, 0]; sg[a] = sa; sg[a1] = sb; sg[a2] = sc; pts.push(corner(sg[0], sg[1], sg[2], ax)); }
        face(pts, n, aoY);
      }
    }
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
      const k = 1 / Math.sqrt(3);
      face([corner(sx, sy, sz, 0), corner(sx, sy, sz, 1), corner(sx, sy, sz, 2)], [sx * k, sy * k, sz * k], aoY);
    }
  }
  /* Boîte par bornes (dans le repère courant) */
  boxB(mat, x0, x1, y0, y1, z0, z1, o) {
    this.save().move((x0 + x1) / 2, y0, (z0 + z1) / 2); this.box(mat, Math.abs(x1 - x0), y1 - y0, Math.abs(z1 - z0), o); return this.restore();
  }
  /* Cylindre (ou tronc de cône) vertical de y = 0 à h. o.r1 : rayon du haut ; o.caps : 'bt' ; o.a0, o.a1 : secteur */
  cyl(mat, r0, h, seg, o = {}) {
    mat = this._timber(mat, Math.max(r0, o.r1 !== undefined ? o.r1 : r0) < 0.4);
    const r1 = o.r1 !== undefined ? o.r1 : r0, a0 = o.a0 || 0, a1 = o.a1 !== undefined ? o.a1 : TAU, caps = o.caps !== undefined ? o.caps : 'bt';
    const B = this.buf(mat, 0, h / 2, 0), sl0 = (r0 - r1) / h, nl = hyp(1, sl0), rm = (r0 + r1) / 2;
    // side: false : disques seuls (bout de bûche plaqué sur une autre forme)
    if (o.side !== false) {
      const ring = [];
      for (let i = 0; i <= seg; i++) {
        const a = lerp(a0, a1, i / seg), c = Math.cos(a), s = Math.sin(a), u = a * rm;
        ring.push([this.v(B, c * r0, 0, s * r0, c / nl, sl0 / nl, s / nl, u, 0, o.aoB || 1), this.v(B, c * r1, h, s * r1, c / nl, sl0 / nl, s / nl, u, h)]);
      }
      for (let i = 0; i < seg; i++) this.quadI(B, ring[i][0], ring[i][1], ring[i + 1][1], ring[i + 1][0]);
    }
    for (const [y, r, ny] of [[0, r0, -1], [h, r1, 1]]) {
      if (caps.indexOf(ny < 0 ? 'b' : 't') < 0 || r <= 0) continue;
      const c0 = this.v(B, 0, y, 0, 0, ny, 0, 0, 0), ids = [];
      for (let i = 0; i <= seg; i++) { const a = lerp(a0, a1, i / seg); ids.push(this.v(B, Math.cos(a) * r, y, Math.sin(a) * r, 0, ny, 0, Math.cos(a) * r, Math.sin(a) * r)); }
      for (let i = 0; i < seg; i++) { if (ny > 0) this.tri(B, c0, ids[i + 1], ids[i]); else this.tri(B, c0, ids[i], ids[i + 1]); }
    }
  }
  /* Surface de révolution autour de Y. prof : [[r, y], ...] de bas en haut ; arêtes vives au-delà de 35° */
  lathe(mat, prof, seg, o = {}) {
    mat = this._timber(mat, true);
    const B = this.buf(mat, 0, (prof[0][1] + prof[prof.length - 1][1]) / 2, 0), a0 = o.a0 || 0, a1 = o.a1 !== undefined ? o.a1 : TAU;
    const rows = profileRows(prof, o.sharp !== undefined ? o.sharp : 0.6);
    const R = [];
    for (let i = 0; i <= seg; i++) {
      const a = lerp(a0, a1, i / seg), c = Math.cos(a), s = Math.sin(a);
      R.push(rows.map((p) => this.v(B, c * p.x, p.y, s * p.x, c * p.nx, p.ny, s * p.nx, a * (o.uR || 0.5), p.d, p.ao)));
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rows.length - 1; j++) {
      if (rows[j].brk) continue;
      this.quadI(B, R[i][j], R[i][j + 1], R[i + 1][j + 1], R[i + 1][j]);
    }
  }
  /* Profil 2D (x, y) extrudé le long de z (de 0 à len). o.closed ; o.caps ; o.sharp : seuil d'arête vive (rad) */
  extrude(mat, shape, len, o = {}) {
    const closed = o.closed !== false, B = this.buf(mat, 0, 0, len / 2);
    let S = shape;
    if (closed && signedArea(S) < 0) S = S.slice().reverse(); // sens trigonométrique : normales vers l'extérieur
    const rows = profileRows(closed ? [...S, S[0]] : S, o.sharp !== undefined ? o.sharp : 0.5, true);
    const i0 = [], i1 = [];
    for (const p of rows) {
      i0.push(this.v(B, p.x, p.y, 0, p.nx, p.ny, 0, p.d, 0, p.ao));
      i1.push(this.v(B, p.x, p.y, len, p.nx, p.ny, 0, p.d, len, p.ao));
    }
    for (let j = 0; j < rows.length - 1; j++) { if (rows[j].brk) continue; this.quadI(B, i0[j], i0[j + 1], i1[j + 1], i1[j]); }
    if (closed && o.caps !== false) {
      const tris = THREE.ShapeUtils.triangulateShape(S.map((p) => new THREE.Vector2(p[0], p[1])), []);
      for (const [z, nz] of [[0, -1], [len, 1]]) {
        const ids = S.map((p) => this.v(B, p[0], p[1], z, 0, 0, nz, p[0], p[1]));
        for (const t of tris) { if (nz > 0) this.tri(B, ids[t[0]], ids[t[1]], ids[t[2]]); else this.tri(B, ids[t[0]], ids[t[2]], ids[t[1]]); }
      }
    }
  }
  /* Balayage d'un profil fermé et lisse (cercle...) le long d'un chemin de points locaux [x,y,z] */
  sweep(mat, shape, path, o = {}) {
    mat = this._timber(mat, true);
    const n = path.length, P = path.map((p) => new V3(p[0], p[1], p[2])), mid = P[n >> 1];
    const B = this.buf(mat, mid.x, mid.y, mid.z);
    const T = P.map((p, i) => new V3().subVectors(P[Math.min(n - 1, i + 1)], P[Math.max(0, i - 1)]).normalize());
    const up = Math.abs(T[0].y) < 0.9 ? new V3(0, 1, 0) : new V3(1, 0, 0);
    const Nn = up.clone().addScaledVector(T[0], -up.dot(T[0])).normalize();
    const ns = shape.map((p, k) => { // normales du profil (moyenne des deux arêtes voisines)
      const a = shape[(k + shape.length - 1) % shape.length], b = shape[(k + 1) % shape.length];
      const tx = b[0] - a[0], ty = b[1] - a[1], l = hyp(tx, ty) || 1; return [ty / l, -tx / l];
    });
    const flipS = signedArea(shape) < 0 ? -1 : 1;
    let dist = 0; const rings = [];
    for (let i = 0; i < n; i++) {
      if (i > 0) { // transport parallèle du repère
        const ax = new V3().crossVectors(T[i - 1], T[i]), s = ax.length();
        if (s > 1e-6) Nn.applyAxisAngle(ax.normalize(), Math.atan2(s, T[i - 1].dot(T[i])));
        dist += P[i].distanceTo(P[i - 1]);
      }
      const Bn = new V3().crossVectors(T[i], Nn).normalize(), sc = o.scale ? o.scale(i / (n - 1)) : 1;
      const ids = [];
      for (let k = 0; k <= shape.length; k++) {
        const kk = k % shape.length, sp = shape[kk], nn = ns[kk];
        const px = P[i].x + (Nn.x * sp[0] + Bn.x * sp[1]) * sc, py = P[i].y + (Nn.y * sp[0] + Bn.y * sp[1]) * sc, pz = P[i].z + (Nn.z * sp[0] + Bn.z * sp[1]) * sc;
        const nx = (Nn.x * nn[0] + Bn.x * nn[1]) * flipS, ny = (Nn.y * nn[0] + Bn.y * nn[1]) * flipS, nz = (Nn.z * nn[0] + Bn.z * nn[1]) * flipS;
        ids.push(this.v(B, px, py, pz, nx, ny, nz, k / shape.length * (o.uAround || 1), dist));
      }
      rings.push(ids);
    }
    for (let i = 0; i < n - 1; i++) for (let k = 0; k < shape.length; k++) {
      if (flipS > 0) this.quadI(B, rings[i][k], rings[i][k + 1], rings[i + 1][k + 1], rings[i + 1][k]);
      else this.quadI(B, rings[i][k], rings[i + 1][k], rings[i + 1][k + 1], rings[i][k + 1]);
    }
  }
  tube(mat, r, path, seg = 6, o) { this.sweep(mat, circleShape(r, seg), path, o); }
  /* Mur plan percé : x de 0 à w, y de 0 à h, en z = 0, face vers +z ; holes : [{ x0, x1, y0, y1 }] */
  wall(mat, w, h, holes, o = {}) {
    const B = this.buf(mat, w / 2, h / 2, 0), tr = o.trim || 0; // o.trim : mur raccourci d'autant à chaque bout (angle arrondi, wallRound)
    const xs = [tr, w - tr], ys = [0, h];
    for (const q of holes) { xs.push(clamp(q.x0, tr, w - tr), clamp(q.x1, tr, w - tr)); ys.push(clamp(q.y0, 0, h), clamp(q.y1, 0, h)); }
    const ux = [...new Set(xs.map((v) => Math.round(v * 1e4) / 1e4))].sort((a, b) => a - b), uy = [...new Set(ys.map((v) => Math.round(v * 1e4) / 1e4))].sort((a, b) => a - b);
    const inHole = (x, y) => holes.some((q) => x > q.x0 && x < q.x1 && y > q.y0 && y < q.y1);
    const ao = o.aoBottom ? (y) => lerp(o.aoBottom, 1, smoothstep(0, 0.8, y)) : () => 1;
    for (let j = 0; j < uy.length - 1; j++) {
      const y0 = uy[j], y1 = uy[j + 1]; if (y1 - y0 < 1e-4) continue;
      let i = 0;
      while (i < ux.length - 1) {
        if (inHole((ux[i] + ux[i + 1]) / 2, (y0 + y1) / 2) || ux[i + 1] - ux[i] < 1e-4) { i++; continue; }
        let k = i + 1;
        while (k < ux.length - 1 && !inHole((ux[k] + ux[k + 1]) / 2, (y0 + y1) / 2)) k++;
        const x0 = ux[i], x1 = ux[k];
        const a = this.v(B, x0, y0, 0, 0, 0, 1, x0, y0, ao(y0)), b = this.v(B, x1, y0, 0, 0, 0, 1, x1, y0, ao(y0));
        const c = this.v(B, x1, y1, 0, 0, 0, 1, x1, y1, ao(y1)), d = this.v(B, x0, y1, 0, 0, 0, 1, x0, y1, ao(y1));
        this.quadI(B, a, b, c, d); i = k;
      }
    }
  }
  /* Surface paramétrique : f(u, v) renvoie [x, y, z] pour u, v de 0 à 1 (u fait le tour si o.closeU).
     Normales par différences finies ; aux pôles dégénérés, o.pole(v) fournit la normale. uv : o.uL, o.vL mètres */
  surf(mat, nu, nv, f, o = {}) {
    const c = f(0.5, 0.5), B = this.buf(mat, c[0], c[1], c[2]), ids = [], e = 1e-3, nf = o.flipN ? -1 : 1;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const u = i / nu, v = j / nv, p = f(u, v);
      const ua = o.closeU ? u - e : Math.max(0, u - e), ub = o.closeU ? u + e : Math.min(1, u + e), va = Math.max(0, v - e), vb = Math.min(1, v + e);
      const pu0 = f(ua, v), pu1 = f(ub, v), pv0 = f(u, va), pv1 = f(u, vb);
      const ax = pu1[0] - pu0[0], ay = pu1[1] - pu0[1], az = pu1[2] - pu0[2], bx = pv1[0] - pv0[0], by = pv1[1] - pv0[1], bz = pv1[2] - pv0[2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = hyp3(nx, ny, nz);
      // pôle dégénéré : normale fournie telle quelle (non retournée par flipN)
      if (l < 1e-9) { const q = o.pole ? o.pole(v) : [0, v < 0.5 ? -1 : 1, 0]; nx = q[0] * nf; ny = q[1] * nf; nz = q[2] * nf; } else { nx /= l; ny /= l; nz /= l; }
      ids.push(this.v(B, p[0], p[1], p[2], nx * nf, ny * nf, nz * nf, u * (o.uL || 1), v * (o.vL || 1), o.ao ? o.ao(u, v, p) : 1));
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = ids[j * (nu + 1) + i], b = ids[j * (nu + 1) + i + 1], cc = ids[(j + 1) * (nu + 1) + i + 1], d = ids[(j + 1) * (nu + 1) + i];
      if (o.flipN) this.quadI(B, a, d, cc, b); else this.quadI(B, a, b, cc, d);
    }
  }
  /* Lissage par sections le long de z : chaque section { z, w (demi-largeur), yb (bas), yt (haut), ym (milieu,
     facultatif), n (exposant de superellipse, 2 = ellipse, grand = carré), x (décalage) }. o.caps : fermer les bouts */
  loft(mat, S, k = 16, o = {}) {
    const ring = (s, a) => {
      const c = Math.cos(a), sn = Math.sin(a), ex = 2 / (s.n || 4), ym = s.ym !== undefined ? s.ym : (s.yb + s.yt) / 2;
      const px = Math.sign(c) * Math.pow(Math.abs(c), ex) * s.w + (s.x || 0), py = sn >= 0 ? ym + Math.pow(sn, ex) * (s.yt - ym) : ym - Math.pow(-sn, ex) * (ym - s.yb);
      return [px, py, s.z];
    };
    const lerpS = (t) => {
      const f = t * (S.length - 1), i = Math.min(S.length - 2, Math.floor(f)), r = f - i, a = S[i], b = S[i + 1], m = o.smooth ? r * r * (3 - 2 * r) : r;
      const out = {}; for (const key of ['z', 'w', 'yb', 'yt', 'n', 'x']) out[key] = lerp(a[key] || 0, b[key] || 0, key === 'z' ? r : m);
      if (a.ym !== undefined && b.ym !== undefined) out.ym = lerp(a.ym, b.ym, m);
      return out;
    };
    const nv = (S.length - 1) * (o.sub || 1);
    // u part du bas (a = -pi/2) : la couture est sous l'objet
    this.surf(mat, k, nv, (u, v) => ring(lerpS(v), -Math.PI / 2 - u * TAU), { closeU: true, uL: o.uL || 2, vL: o.vL || (S[S.length - 1].z - S[0].z), flipN: !o.flip });
    if (o.caps !== false) for (const [s, dir] of [[S[0], -1], [S[S.length - 1], 1]]) {
      const B = this.buf(mat, s.x || 0, (s.yb + s.yt) / 2, s.z), ym = s.ym !== undefined ? s.ym : (s.yb + s.yt) / 2;
      const c0 = this.v(B, s.x || 0, ym, s.z, 0, 0, dir, 0, 0), ids = [];
      for (let i = 0; i <= k; i++) { const p = ring(s, -Math.PI / 2 - (i / k) * TAU); ids.push(this.v(B, p[0], p[1], p[2], 0, 0, dir, p[0], p[1])); }
      for (let i = 0; i < k; i++) { if (dir > 0) this.tri(B, c0, ids[i + 1], ids[i]); else this.tri(B, c0, ids[i], ids[i + 1]); }
    }
  }
  /* Plan horizontal (face +y) centré, subdivisé en nx × nz */
  plane(mat, w, d, nx = 1, nz = 1, fy) {
    const B = this.buf(mat, 0, 0, 0), ids = [], e = 0.05;
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const x = -w / 2 + (w * i) / nx, z = -d / 2 + (d * j) / nz, y = fy ? fy(x, z) : 0;
      let gx = 0, gz = 0; if (fy) { gx = (fy(x + e, z) - fy(x - e, z)) / (2 * e); gz = (fy(x, z + e) - fy(x, z - e)) / (2 * e); }
      const l = hyp3(gx, 1, gz);
      ids.push(this.v(B, x, y, z, -gx / l, 1 / l, -gz / l, x, -z));
    }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const a = ids[j * (nx + 1) + i], b = ids[j * (nx + 1) + i + 1], c = ids[(j + 1) * (nx + 1) + i + 1], d = ids[(j + 1) * (nx + 1) + i];
      this.quadI(B, a, d, c, b);
    }
  }
  /* Géométrie three.js quelconque (normales et uv reprises ; uvs : échelle des uv) */
  geo(mat, g, o = {}) {
    const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, us = o.uvs || 1;
    const bs = g.boundingSphere || (g.computeBoundingSphere(), g.boundingSphere);
    const B = this.buf(mat, bs.center.x, bs.center.y, bs.center.z), ids = new Array(P.count);
    for (let i = 0; i < P.count; i++) ids[i] = this.v(B, P.getX(i), P.getY(i), P.getZ(i), N.getX(i), N.getY(i), N.getZ(i), U ? U.getX(i) * us : 0, U ? U.getY(i) * us : 0, o.ao ? o.ao(P.getX(i), P.getY(i), P.getZ(i)) : 1);
    if (g.index) for (let i = 0; i < g.index.count; i += 3) this.tri(B, ids[g.index.getX(i)], ids[g.index.getX(i + 1)], ids[g.index.getX(i + 2)]);
    else for (let i = 0; i < P.count; i += 3) this.tri(B, ids[i], ids[i + 1], ids[i + 2]);
  }
  /* Collision (boîte locale, convertie en boîte alignée du monde) : m = matière d'impact ; ray : ne bloque que les tirs */
  /* Collision d'une boîte locale. Tournée hors angle droit, elle est découpée en cellules (0,5 m au plus le long de son grand côté, 24 au plus ;
     1 à 4 bandes sur le petit), chacune dans sa boîte englobante exacte : elles débordent de l'objet de 25 cm au plus. Jusqu'en 2.32, une seule
     boîte englobante resserrée de 12 % : un mètre de vide aux angles d'une voiture garée de biais, et des bords visibles que les tirs traversaient
     au milieu des faces (retour du propriétaire : « ajuster les hitbox des assets ») */
  col(x0, x1, y0, y1, z0, z1, m = 'concrete', ray = false, occ = true) {
    const e = this.m.elements;
    if (Math.min(Math.abs(e[0]), Math.abs(e[8])) <= 0.02) { this.T.col(this._aabb(x0, x1, y0, y1, z0, z1, true), m, ray, occ); return this; }
    const lx = Math.abs(x1 - x0), lz = Math.abs(z1 - z0), alongX = lx >= lz, L = alongX ? lx : lz, S = alongX ? lz : lx;
    const n = Math.min(24, Math.max(1, Math.ceil(L / 0.5))), k = Math.min(4, Math.max(1, Math.ceil(S / 0.75)));
    for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) {
      const a0 = i / n, a1 = (i + 1) / n, b0 = j / k, b1 = (j + 1) / k;
      const b = alongX ? this._aabb(lerp(x0, x1, a0), lerp(x0, x1, a1), y0, y1, lerp(z0, z1, b0), lerp(z0, z1, b1), true)
        : this._aabb(lerp(x0, x1, b0), lerp(x0, x1, b1), y0, y1, lerp(z0, z1, a0), lerp(z0, z1, a1), true);
      this.T.col(b, m, ray, occ);
    }
    return this;
  }
  /* Collision réservée aux props physiques (parois d'un cageot qui retiennent les fruits ; tag 'crate' : elle disparaît avec le cageot) : ni les soldats ni les tirs ne la voient */
  pcol(x0, x1, y0, y1, z0, z1, tag) { this.T.pcol(this._aabb(x0, x1, y0, y1, z0, z1, true), tag); return this; }
  /* Prop physique (voir 02k-dynprops.js) posé au point local (x, y, z), tourné de ry : dans le décor il est créé tout de suite,
     dans un prefab il est mémorisé et créé à chaque estampille. o : tint, s (échelle), a (arguments de l'usine du type), rx et rz
     (inclinaison de départ), nocol (sans la collision du prefab) */
  dyn(type, x, y, z, ry = 0, o = {}) {
    // obstacle massif (def.fixed, 02k-dynprops.js) : posé comme un décor ordinaire, collision pleine, sans physique ; en préparant un prefab (this.T.dyn), on le note et il est tranché à l'estampille
    const F = !this.T.dyn && PROPT[type], def = F && (typeof F === 'function' ? F(o.a || []) : F);
    if (def && def.fixed) { this.place(def.pf(), x, y, z, ry, { tint: o.tint, s: o.s }); this.lastDyn = null; return this; }
    this._n();
    const e = this.m.elements;
    this.lastDyn = this.T.dynAdd({ t: type, x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14],
      ry: ry + Math.atan2(e[8], e[0]), o: { ...o, s: (o.s || 1) * hyp(e[0], e[8]) } });
    return this;
  }
  /* Volume qui n'arrête rien mais assombrit l'éclairage cuit (toits, auvents, feuillages denses) */
  occ(x0, x1, y0, y1, z0, z1, k = 1) { this.T.occ(this._aabb(x0, x1, y0, y1, z0, z1, true), k); return this; }
  /* Lampe au point local (x, y, z) : sa lumière est cuite dans le volume d'éclairage (02e-light.js), arrêtée par les murs.
     c : couleur [r, g, b] (linéaire), p : éclairement à 1 m (1 vaut à peu près le ciel à l'ombre), r : portée (m), down : part de la lumière
     rabattue vers le bas par un abat-jour (0 : lanterne qui éclaire tout autour, 1 : rien au-dessus de l'ampoule) */
  lamp(x, y, z, c, p = 1, r = 6, down = 0) {
    if (!this.T.lamp) return this;
    const e = this.m.elements;
    this.T.lamp({ x: e[0] * x + e[4] * y + e[8] * z + e[12], y: e[1] * x + e[5] * y + e[9] * z + e[13], z: e[2] * x + e[6] * y + e[10] * z + e[14], c, p, r, down });
    return this;
  }
  /* Tissu simulé (02me-toiles.js) : une nappe de f.cu x f.rv particules, rangée par rangée, en coordonnées locales (f.P : [x, y, z] par
     particule ; f.side : direction du dessus) ; ramenée dans le monde ici, avec la teinte courante, puis réunie aux nappes voisines du même
     groupe (f.grp) à la fin de la construction (tissusBuild). Sans cible qui la prenne : rien n'est posé. */
  fabric(f) {
    if (!this.T.fabric) return this;
    this._n();
    const e = this.m.elements, n = this.n3.elements, s = f.side || [0, 1, 0];
    const P = f.P.map(([x, y, z]) => [e[0] * x + e[4] * y + e[8] * z + e[12], e[1] * x + e[5] * y + e[9] * z + e[13], e[2] * x + e[6] * y + e[10] * z + e[14]]);
    const side = [n[0] * s[0] + n[3] * s[1] + n[6] * s[2], n[1] * s[0] + n[4] * s[1] + n[7] * s[2], n[2] * s[0] + n[5] * s[1] + n[8] * s[2]];
    this.T.fabric({ ...f, P, side, lin: f.lin || this.tint });
    return this;
  }
  /* Toile tendue simulée (02me-toiles.js) à la place d'une surface f(u, v) -> [x, y, z] (même convention que surf : normale du produit des
     dérivées en u et en v, retournée par o.flipN) : une particule tous les 35 cm environ (50 sur téléphone), épinglée selon o.pin(u, v)
     (par défaut tout le bord : la toile est lacée sur son cadre), un jeu qui croît avec la distance à l'épingle la plus proche jusqu'à o.play
     (8 cm par défaut). o.uL, o.vL : coordonnées de texture (m) ; o.glow : lumière qui traverse ; o.genre, o.grp, o.mat ('canvas'). Sans
     cible qui prenne les tissus : la surface rigide d'avant. */
  toile(nu, nv, f, o = {}) {
    if (!this.T.fabric) return this.surf(o.mat || 'canvas', nu, nv, f, o);
    const sp = (COARSE ? 0.5 : 0.35) * (o.coarse || 1), len = (a) => { let l = 0, q = a(0); for (let k = 1; k <= 8; k++) { const r = a(k / 8); l += hyp3(r[0] - q[0], r[1] - q[1], r[2] - q[2]); q = r; } return l; };
    const Lu = Math.max(len((t) => f(t, 0)), len((t) => f(t, 0.5)), len((t) => f(t, 1))), Lv = Math.max(len((t) => f(0, t)), len((t) => f(0.5, t)), len((t) => f(1, t)));
    const cu = clamp(Math.round(Lu / sp) + 1, 3, 40), rv = clamp(Math.round(Lv / sp) + 1, 3, 40), n = cu * rv;
    const P = [], pin = [], uv = [], pf = o.pin || ((u, v) => u <= 0 || u >= 1 || v <= 0 || v >= 1);
    for (let j = 0; j < rv; j++) for (let i = 0; i < cu; i++) { const u = i / (cu - 1), v = j / (rv - 1); P.push(f(u, v)); pin.push(pf(u, v) ? 1 : 0); uv.push([u * (o.uL || 1), v * (o.vL || 1)]); }
    // jeu : distance (le long de la grille) à l'épingle la plus proche, propagée par passes
    const dist = new Float32Array(n).fill(1e9), play = o.play !== undefined ? o.play : 0.08;
    for (let k = 0; k < n; k++) if (pin[k]) dist[k] = 0;
    for (let pass = 0; pass < cu + rv; pass++) {
      let ch = false;
      for (let k = 0; k < n; k++) {
        const i = k % cu, j = (k / cu) | 0;
        for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= cu || b >= rv) continue;
          const q = b * cu + a, d = dist[q] + hyp3(P[k][0] - P[q][0], P[k][1] - P[q][1], P[k][2] - P[q][2]);
          if (d < dist[k] - 1e-6) { dist[k] = d; ch = true; }
        }
      }
      if (!ch) break;
    }
    const maxD = []; for (let k = 0; k < n; k++) maxD.push(Math.min(play, 0.012 + dist[k] * 0.09));
    // dessus : du côté de la normale de la surface (au centre)
    const e = 1e-3, a0 = f(0.5 - e, 0.5), a1 = f(0.5 + e, 0.5), b0 = f(0.5, 0.5 - e), b1 = f(0.5, 0.5 + e), nf = o.flipN ? -1 : 1;
    const ax = a1[0] - a0[0], ay = a1[1] - a0[1], az = a1[2] - a0[2], bx = b1[0] - b0[0], by = b1[1] - b0[1], bz = b1[2] - b0[2];
    const side = o.side || [(ay * bz - az * by) * nf, (az * bx - ax * bz) * nf, (ax * by - ay * bx) * nf];
    return this.fabric({ cu, rv, P, pin, maxD, uv, glow: o.glow !== undefined ? o.glow : 0.2, side, genre: o.genre || 'tendu', grp: o.grp, mat: o.mat || 'canvas' });
  }
  _aabb(x0, x1, y0, y1, z0, z1, exact) {
    const e = this.m.elements, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2, hx = Math.abs(x1 - x0) / 2, hy = (y1 - y0) / 2, hz = Math.abs(z1 - z0) / 2;
    const wx = e[0] * cx + e[4] * cy + e[8] * cz + e[12], wy = e[1] * cx + e[5] * cy + e[9] * cz + e[13], wz = e[2] * cx + e[6] * cy + e[10] * cz + e[14];
    const ex = Math.abs(e[0]) * hx + Math.abs(e[4]) * hy + Math.abs(e[8]) * hz, ey = Math.abs(e[1]) * hx + Math.abs(e[5]) * hy + Math.abs(e[9]) * hz, ez = Math.abs(e[2]) * hx + Math.abs(e[6]) * hy + Math.abs(e[10]) * hz;
    // boîte tournée hors angle droit, hors collisions (exact faux : la tache d'ombre au sol d'un prefab, par exemple) : boîte englobante resserrée
    const skew = Math.min(Math.abs(e[0]), Math.abs(e[8])) > 0.02 ? 0.88 : 1, k = exact ? 1 : skew;
    return { x0: wx - ex * k, x1: wx + ex * k, y0: wy - ey, y1: wy + ey, z0: wz - ez * k, z1: wz + ez * k };
  }
  /* Estampille un prefab à la transformation courante. o.tint : [r,g,b] sRGB pour tout le prefab, ou
     { matière: [r,g,b] } ; o.cls : force la classe de détail ; o.nocol : sans collisions */
  put(pf, o = {}) {
    this._n();
    const e = this.m.elements, n = this.n3.elements, flip = this.flip;
    for (const part of pf.parts.values()) {
      const g = part.g; if (!g.nv) continue;
      let tn = null;
      if (o.tint) { const t = Array.isArray(o.tint) ? (pf.tintable ? (pf.tintable.includes(part.mat) ? o.tint : null) : o.tint) : o.tint[part.mat]; if (t) tn = [sl(t[0]), sl(t[1]), sl(t[2])]; }
      const B = this.T.buf(part.mat, o.cls !== undefined ? Math.max(o.cls, part.cls) : part.cls, e[12], e[13], e[14]);
      B.reserve(g.nv, g.ni); const base = B.nv, gP = g.P, gN = g.N, gU = g.U, gC = g.C, gA = g.A, gS = g.S;
      for (let i = 0; i < g.nv; i++) {
        const i3 = i * 3, x = gP[i3], y = gP[i3 + 1], z = gP[i3 + 2], nx = gN[i3], ny = gN[i3 + 1], nz = gN[i3 + 2];
        const wx = e[0] * x + e[4] * y + e[8] * z + e[12], wy = e[1] * x + e[5] * y + e[9] * z + e[13], wz = e[2] * x + e[6] * y + e[10] * z + e[14];
        let mx = n[0] * nx + n[3] * ny + n[6] * nz, my = n[1] * nx + n[4] * ny + n[7] * nz, mz = n[2] * nx + n[5] * ny + n[8] * nz;
        const l = hyp3(mx, my, mz) || 1;
        let a = gA[i]; if (this.aoFn) a *= this.aoFn(wx, wy, wz, mx / l, my / l, mz / l);
        B.vert(wx, wy, wz, mx / l, my / l, mz / l, gU[i * 2], gU[i * 2 + 1],
          tn ? gC[i3] * tn[0] : gC[i3], tn ? gC[i3 + 1] * tn[1] : gC[i3 + 1], tn ? gC[i3 + 2] * tn[2] : gC[i3 + 2], a, gS ? gS[i] : 0);
      }
      for (let i = 0; i < g.ni; i += 3) { if (flip) B.tri(base + g.I[i], base + g.I[i + 2], base + g.I[i + 1]); else B.tri(base + g.I[i], base + g.I[i + 1], base + g.I[i + 2]); }
    }
    if (!o.nocol) for (const c of pf.cols) this.col(c.x0, c.x1, c.y0, c.y1, c.z0, c.z1, c.m, c.ray, c.occ);
    for (const c of pf.occs) this.T.occ(this._aabb(c.x0, c.x1, c.y0, c.y1, c.z0, c.z1, true), c.k);
    for (const c of pf.pcols) this.pcol(c.x0, c.x1, c.y0, c.y1, c.z0, c.z1, c.tag);
    for (const l of pf.lamps) this.lamp(l.x, l.y, l.z, l.c, l.p, l.r, l.down);
    for (const f of pf.fabrics) { // la teinte de l'estampille vaut pour les tissus comme pour la matière de leur nappe (bâche d'un camion teinté)
      const k = f.mat || 'canvas', t = o.tint ? (Array.isArray(o.tint) ? (pf.tintable ? (pf.tintable.includes(k) ? o.tint : null) : o.tint) : o.tint[k]) : null;
      this.fabric(t ? { ...f, lin: f.lin.map((c, i) => c * sl(t[i])) } : f);
    }
    for (const d of pf.dyn) {
      // les props d'un prefab prennent la teinte de l'estampille quand ils n'ont pas la leur (fruits d'un cageot)
      const oo = { ...d.o }; if (d.tintFrom && !oo.tint && Array.isArray(o.tint)) oo.tint = o.tint;
      this.dyn(d.t, d.x, d.y, d.z, d.ry, oo);
    }
    return this;
  }
  /* Raccourci : prefab posé en (x, y, z), tourné de ry autour de la verticale */
  place(pf, x, y, z, ry = 0, o) { this.save().move(x, y, z).rotY(ry); if (o && o.s) this.scl(o.s); this.put(pf, o); return this.restore(); }
}

/* Coordonnées de texture d'un polygone plan, projeté sur ses deux axes (mètres) */
function projUV(P, n) {
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  if (ay >= ax && ay >= az) return P.map((p) => [p[0], n[1] > 0 ? -p[2] : p[2]]);
  if (ax >= az) return P.map((p) => [n[0] > 0 ? -p[2] : p[2], p[1]]);
  return P.map((p) => [n[2] > 0 ? p[0] : -p[0], p[1]]);
}
function signedArea(S) { let a = 0; for (let i = 0; i < S.length; i++) { const p = S[i], q = S[(i + 1) % S.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
/* Rangées d'un profil : normales lissées, sauf aux angles vifs où le point est dédoublé.
   ext : profil d'extrusion (normale (dy, -dx)) ; sinon profil de tour (r, y), normale (dy, -dr) vers l'extérieur */
function profileRows(prof, sharp, ext) {
  const segN = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const dx = prof[i + 1][0] - prof[i][0], dy = prof[i + 1][1] - prof[i][1], l = hyp(dx, dy) || 1;
    segN.push(ext ? [dy / l, -dx / l] : [dy / l, -dx / l]);
  }
  const rows = []; let d = 0;
  for (let i = 0; i < prof.length; i++) {
    if (i > 0) d += hyp(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]);
    const a = segN[i - 1], b = segN[i], ao = prof[i][2] !== undefined ? prof[i][2] : 1;
    if (a && b && a[0] * b[0] + a[1] * b[1] < Math.cos(sharp)) {
      rows.push({ x: prof[i][0], y: prof[i][1], nx: a[0], ny: a[1], d, ao, brk: true });
      rows.push({ x: prof[i][0], y: prof[i][1], nx: b[0], ny: b[1], d, ao });
    } else {
      let nx = (a ? a[0] : 0) + (b ? b[0] : 0), ny = (a ? a[1] : 0) + (b ? b[1] : 0); const l = hyp(nx, ny) || 1;
      rows.push({ x: prof[i][0], y: prof[i][1], nx: nx / l, ny: ny / l, d, ao });
    }
  }
  return rows;
}
function circleShape(r, n) { const s = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; s.push([Math.cos(a) * r, Math.sin(a) * r]); } return s; }
function rectShape(w, h, cx = 0, cy = 0) { return [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]]; }
/* Rectangle aux coins arrondis */
function roundRectShape(w, h, r, n = 3, cx = 0, cy = 0) {
  const s = [], hw = w / 2, hh = h / 2; r = Math.min(r, hw, hh);
  for (const [qx, qy, a0] of [[1, -1, -Math.PI / 2], [1, 1, 0], [-1, 1, Math.PI / 2], [-1, -1, Math.PI]]) {
    for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); s.push([cx + qx * (hw - r) + Math.cos(a) * r, cy + qy * (hh - r) + Math.sin(a) * r]); }
  }
  return s;
}
/* Arc de points [x, y, z] (courbe de chaînette pour les câbles) */
function sagPath(a, b, sag, n = 12) {
  const p = [];
  for (let i = 0; i <= n; i++) { const t = i / n; p.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t) - Math.sin(t * Math.PI) * sag, lerp(a[2], b[2], t)]); }
  return p;
}

/* ---------- Prefabs ---------- */
class Prefab {
  constructor(name) { this.name = name; this.parts = new Map(); this.cols = []; this.occs = []; this.pcols = []; this.dyn = []; this.lamps = []; this.fabrics = []; this.tintable = null; }
  buf(mat, cls) { const k = mat + '|' + cls; let p = this.parts.get(k); if (!p) this.parts.set(k, p = { mat, cls, g: new GeoBuf(256, 512, LIVING.has(mat)) }); return p.g; }
  col(b, m, ray, occ) { this.cols.push({ ...b, m, ray, occ }); }
  occ(b, k) { this.occs.push({ ...b, k }); }
  pcol(b, tag) { this.pcols.push({ ...b, tag }); }
  dynAdd(d) { this.dyn.push({ t: d.t, x: d.x, y: d.y, z: d.z, ry: d.ry, o: d.o, tintFrom: !!d.o.tintFrom }); return null; }
  lamp(l) { this.lamps.push(l); }
  fabric(f) { this.fabrics.push(f); } // tissu en coordonnées du prefab : repris à chaque estampille (Maker.put)
  tris() { let t = 0; for (const p of this.parts.values()) t += p.g.ni / 3; return t; }
}
const PREFABS = new Map();
/* Prefab mis en cache par nom : build(M) le construit une seule fois en coordonnées locales */
function prefab(name, build) {
  let p = PREFABS.get(name); if (p) return p;
  p = new Prefab(name); const M = new Maker(p); build(M, p); PREFABS.set(name, p); return p;
}

const TEXSCALE = {
  plaster: 3.0, plaster2: 3.2, stone: 2.2, brick: 2.6, cobble: 2.2, pavers: 2.6, asphalt: 4.5, rooftiles: 2.2, wood: 1.5, shutter: 1.3,
  sand: 4.0, dirt: 3.0, concrete: 2.5, corrugated: 2.0, paint: 1.5, steel: 1.0, charred: 2.0, cement_tiles: 1.6, canvas: 1.2, burlap: 0.6,
  rubber: 0.5, timber: 1.2, crate: 1.2, plastic: 1.0, glass: 1.5, gravel: 2.0, farfacade: 1.0, rug: 1.2, linge: 0.45, laine: 0.7, paintwood: 1.2, ashlar: 2.4, rollshutter: 1.5, cardboard: 0.8, carpaint: 1.6, lattice: 0.8,
};

var PF={};var _pm=new THREE.Matrix4();
function basis(ex,ey,ez){return _pm.clone().makeBasis(new V3(...ex),new V3(...ey),new V3(...ez))}

/* ===== 02d-archi.js ===== */
try{
/* ==========================================================================
   KIT D'ARCHITECTURE : bâtiments méditerranéens et maghrébins, réutilisables sur toutes les cartes.
   Une façade est construite dans son propre repère (facadeFrame) : origine au pied du mur, à gauche vu de
   l'extérieur ; x le long du mur, y vers le haut, z vers l'extérieur. Les ouvertures sont de vrais trous dans
   le mur, avec leurs embrasures (profondeur), puis la menuiserie au fond : vitrage et châssis, volets
   persiennés, grilles, portes à panneaux ou cintrées, rideaux métalliques de boutique. Les collisions des
   bâtiments restent des boîtes pleines : le gameplay ne dépend pas du décor.
   ========================================================================== */
var PAL = {
  plaster: [[0.95, 0.88, 0.74], [0.9, 0.76, 0.58], [0.97, 0.93, 0.85], [0.84, 0.7, 0.55], [0.86, 0.66, 0.54], [0.78, 0.82, 0.76], [0.76, 0.8, 0.86], [0.92, 0.82, 0.66], [0.93, 0.8, 0.7]],
  shutter: [[0.3, 0.45, 0.38], [0.28, 0.38, 0.52], [0.55, 0.36, 0.22], [0.42, 0.42, 0.38], [0.2, 0.42, 0.55], [0.62, 0.55, 0.4]],
  frame: [[0.92, 0.9, 0.84], [0.35, 0.26, 0.18], [0.28, 0.4, 0.34], [0.86, 0.84, 0.78], [0.45, 0.4, 0.34]],
  door: [[0.12, 0.3, 0.55], [0.18, 0.4, 0.3], [0.42, 0.26, 0.16], [0.55, 0.18, 0.12], [0.16, 0.42, 0.46], [0.75, 0.6, 0.3]],
  awning: [[0.72, 0.24, 0.18], [0.2, 0.42, 0.34], [0.82, 0.7, 0.4], [0.3, 0.36, 0.55], [0.85, 0.85, 0.8], [0.62, 0.3, 0.12]],
  shop: [[0.62, 0.62, 0.6], [0.5, 0.55, 0.5], [0.62, 0.5, 0.42], [0.35, 0.45, 0.55], [0.7, 0.66, 0.55]],
  stone: [0.95, 0.9, 0.82],
};
/* Repère d'une façade tournée vers face ('n', 's', 'e', 'w') d'un bloc [x0, x1] x [z0, z1] */
function facadeFrame(face, x0, x1, z0, z1) {
  if (face === 's') return { ox: x0, oz: z1, rot: 0, len: x1 - x0 };
  if (face === 'n') return { ox: x1, oz: z0, rot: Math.PI, len: x1 - x0 };
  if (face === 'e') return { ox: x1, oz: z1, rot: Math.PI / 2, len: z1 - z0 };
  return { ox: x0, oz: z0, rot: -Math.PI / 2, len: z1 - z0 };
}
function inFrame(F, fn) { const M = DECOR; M.save().move(F.ox, 0, F.oz).rotY(F.rot); try { fn(M); } finally { M.restore(); } }
/* Petite boîte locale par bornes, sans collision */
function lbox(M, mat, x0, x1, y0, y1, z0, z1, o) { M.boxB(mat, x0, x1, y0, y1, z0, z1, o); }

/* ---------- Mur percé et embrasures ---------- */
/* Découpage des arcs, commun aux écoinçons, à l'intrados et au vantail cintré : des segments différents laissaient
   entre eux de minces jours, par lesquels on voyait le vide derrière la façade. Doit être pair (clé au milieu). */
var ARCH_SEG = 20;
/* Arc d'une ouverture cintrée : cercle passant par les naissances (y1 - rise) et la clé (y1) */
function archGeom(op) {
  const w = op.x1 - op.x0, rise = Math.min(op.rise, w / 2), ys = op.y1 - rise, xc = (op.x0 + op.x1) / 2;
  const R = (w * w / 4 + rise * rise) / (2 * rise), cy = op.y1 - R, a0 = Math.asin(clamp((ys - cy) / R, -1, 1));
  return { R, xc, cy, ys, a0, a1: Math.PI - a0 };
}
/* Mur plan (z = 0, face +z) de x = 0 à len, y de y0 à y0 + h, percé des ouvertures ops (repère de façade).
   o.depth : profondeur des embrasures (épaisseur pour un mur traversant) ; o.back : embrasure fermée au fond ;
   o.round : rayon des angles du bloc aux deux bouts (wallRound) */
function wallPierced(M, mat, len, y0, h, ops, o = {}) {
  M.save().move(0, y0, 0);
  const holes = ops.map((p) => ({ x0: p.x0, x1: p.x1, y0: p.y0 - y0, y1: p.y1 - y0 }));
  if (o.aoFn !== undefined) M.aoFn = o.aoFn;
  M.wall(mat, len, h, holes, { aoBottom: o.aoBottom, trim: o.round });
  if (o.round) wallRound(M, mat, len, h, holes, o.round, o.aoBottom);
  M.restore();
  for (const op of ops) {
    const d = op.depth !== undefined ? op.depth : (o.depth || 0.2);
    if (op.rise) archFill(M, mat, op, d);
    // une porte au pied du mur n'a pas d'appui : il se confondait avec le sol ou le plancher (scintillement)
    reveal(M, mat, op, d, o.floorY !== undefined ? o : { ...o, floorY: y0 });
  }
}
/* Angles arrondis d'un bloc : le mur d'une façade (repère de wallPierced, longueur len, hauteur h) s'arrête à r de chaque bout
   (M.wall, trim) et la façade pose à ses deux bouts un huitième de cylindre de rayon r, tangent au mur ; avec celui de la façade
   voisine, l'angle devient un quart de rond. Ses normales tournent d'une façade à l'autre : l'angle accroche la lumière sur
   quelques centimètres au lieu d'une arête vive, la teinte s'y éclaircit un peu (enduit usé, moins de crasse sur l'arête).
   Mêmes rangées que le mur (bords des ouvertures) : l'occlusion des sommets se raccorde. */
function wallRound(M, mat, len, h, holes, r, aoBottom, seg = 3) {
  const B = M.buf(mat, len / 2, h / 2, 0), t0 = M.tint;
  const ys = [...new Set([0, h, ...holes.flatMap((q) => [clamp(q.y0, 0, h), clamp(q.y1, 0, h)])].map((v) => Math.round(v * 1e4) / 1e4))].sort((a, b) => a - b);
  const ao = aoBottom ? (y) => lerp(aoBottom, 1, smoothstep(0, 0.8, y)) : () => 1;
  // du point tangent au mur (90°) vers la diagonale de l'angle (135° au début, 45° à la fin) ; centre à r dans le bloc
  for (const [cx, a0, a1] of [[r, Math.PI / 2, Math.PI * 0.75], [len - r, Math.PI / 2, Math.PI * 0.25]]) {
    const col = [];
    for (let i = 0; i <= seg; i++) {
      const a = lerp(a0, a1, i / seg), c = Math.cos(a), s = Math.sin(a), k = 1 + 0.06 * (i / seg);
      M.tint = [t0[0] * k, t0[1] * k, t0[2] * k];
      col.push({ a, ids: ys.map((y) => M.v(B, cx + c * r, y, -r + s * r, c, 0, s, 0, y, ao(y))) });
    }
    M.tint = t0;
    // faces vers l'extérieur : de l'angle le plus grand au plus petit (de gauche à droite vu de dehors)
    for (let i = 0; i < seg; i++) {
      const [L, R] = col[i].a > col[i + 1].a ? [col[i], col[i + 1]] : [col[i + 1], col[i]];
      for (let j = 0; j < ys.length - 1; j++) if (ys[j + 1] - ys[j] > 1e-4) M.quadI(B, L.ids[j], R.ids[j], R.ids[j + 1], L.ids[j + 1]);
    }
  }
}
/* Écoinçons d'une ouverture cintrée (entre l'arc et le rectangle) et intrados de l'arc */
function archFill(M, mat, op, d) {
  const A = archGeom(op), n = ARCH_SEG / 2, B = M.buf(mat, A.xc, op.y1, 0);
  for (const [side, cx] of [[-1, op.x0], [1, op.x1]]) {
    const c = M.v(B, cx, op.y1, 0, 0, 0, 1, cx, op.y1);
    let prev = -1;
    for (let i = 0; i <= n; i++) {
      const a = side < 0 ? lerp(A.a1, Math.PI / 2, i / n) : lerp(A.a0, Math.PI / 2, i / n);
      const x = A.xc + Math.cos(a) * A.R, y = A.cy + Math.sin(a) * A.R, id = M.v(B, x, y, 0, 0, 0, 1, x, y);
      if (prev >= 0) { if (side < 0) M.tri(B, c, prev, id); else M.tri(B, c, id, prev); }
      prev = id;
    }
  }
  // intrados : bande le long de l'arc, de la façade au fond de l'embrasure
  const B2 = M.buf(mat, A.xc, op.y1, -d / 2), m = ARCH_SEG; // mêmes angles que les écoinçons : arête commune, sans jour
  let p0 = -1, p1 = -1;
  for (let i = 0; i <= m; i++) {
    const a = lerp(A.a0, A.a1, i / m), c = Math.cos(a), s = Math.sin(a), x = A.xc + c * A.R, y = A.cy + s * A.R;
    const q0 = M.v(B2, x, y, 0, -c, -s, 0, a * A.R, 0, 1), q1 = M.v(B2, x, y, -d, -c, -s, 0, a * A.R, d, 0.7);
    // face visible vers le centre de l'arc (vers le bas à la clé) : dans l'autre sens, l'intrados était éliminé vu d'en
    // dessous et l'on voyait le ciel par-dessus la porte
    if (p0 >= 0) M.quadI(B2, p0, q0, q1, p1);
    p0 = q0; p1 = q1;
  }
}
/* Embrasure : joues, linteau (sauf ouverture cintrée) et appui intérieur, de z = 0 à z = -d */
function reveal(M, mat, op, d, o = {}) {
  const top = op.rise ? archGeom(op).ys : op.y1, ao = [1, 1, 0.72, 0.72];
  M.quad(mat, [op.x0, op.y0, 0], [op.x0, top, 0], [op.x0, top, -d], [op.x0, op.y0, -d], [1, 0, 0], { ao });
  M.quad(mat, [op.x1, op.y0, 0], [op.x1, top, 0], [op.x1, top, -d], [op.x1, op.y0, -d], [-1, 0, 0], { ao });
  if (!op.rise) M.quad(mat, [op.x0, op.y1, 0], [op.x1, op.y1, 0], [op.x1, op.y1, -d], [op.x0, op.y1, -d], [0, -1, 0], { ao: [0.9, 0.9, 0.65, 0.65] });
  if (op.y0 > (o.floorY !== undefined ? o.floorY : -1) + 0.01) M.quad(mat, [op.x0, op.y0, 0], [op.x1, op.y0, 0], [op.x1, op.y0, -d], [op.x0, op.y0, -d], [0, 1, 0], { ao });
  // fond sombre : les bâtiments sont creux (en bordure de carte, seule la façade côté jeu existe) ; sans lui, une fenêtre
  // sans vitrage (cintrée aux volets clos, grillagée) laissait voir à travers le bâtiment jusqu'au vide hors de la carte
  if (o.back || op.back) M.quad('dark', [op.x0, op.y0, -d], [op.x1, op.y0, -d], [op.x1, op.y1, -d], [op.x0, op.y1, -d], [0, 0, 1]);
}

/* ---------- Menuiseries ---------- */
/* Fenêtre au fond d'une embrasure de profondeur d : châssis, meneau, traverse, vitrage (o.glass : matière du vitrage,
   glassLit pour une pièce éclairée) */
function windowJoinery(M, op, d, tint, o = {}) {
  const w = op.x1 - op.x0, h = op.y1 - op.y0, t = 0.065, z0 = -d + 0.02, z1 = z0 + 0.07;
  M.save().color(tint).local(1); M.cls = 1; // au fond de l'embrasure, l'ombre du tableau suffit
  lbox(M, 'paintwood', op.x0, op.x0 + t, op.y0, op.y1, z0, z1); lbox(M, 'paintwood', op.x1 - t, op.x1, op.y0, op.y1, z0, z1);
  lbox(M, 'paintwood', op.x0 + t, op.x1 - t, op.y1 - t, op.y1, z0, z1); lbox(M, 'paintwood', op.x0 + t, op.x1 - t, op.y0, op.y0 + t, z0, z1);
  if (w > 0.75) lbox(M, 'paintwood', (op.x0 + op.x1) / 2 - 0.03, (op.x0 + op.x1) / 2 + 0.03, op.y0 + t, op.y1 - t, z0 + 0.005, z1 - 0.005);
  if (h > 1.3 && !o.door) lbox(M, 'paintwood', op.x0 + t, op.x1 - t, op.y1 - h * 0.28 - 0.025, op.y1 - h * 0.28 + 0.025, z0 + 0.005, z1 - 0.005);
  M.restore();
  M.save().color(o.glassTint || [1, 1, 1]); M.cls = 1;
  const gp = [[op.x0 + t, op.y0 + t, z0 + 0.035], [op.x1 - t, op.y0 + t, z0 + 0.035], [op.x1 - t, op.y1 - t, z0 + 0.035], [op.x0 + t, op.y1 - t, z0 + 0.035]];
  if (!o.glass || o.glass === 'glass' || o.glass === 'glassLit') {
    // vitre d'une pièce (matière window, 02c-materials.js) : la pièce se dessine derrière. Les sommets portent ses données au lieu d'une
    // teinte : graine (tirée de la position de la fenêtre dans le monde), lampe allumée, rapport hauteur sur largeur et porte-fenêtre
    const e = M.m.elements, cx = (op.x0 + op.x1) / 2, cy = (op.y0 + op.y1) / 2, gw = op.x1 - op.x0 - 2 * t, gh = op.y1 - op.y0 - 2 * t;
    const wx = e[0] * cx + e[4] * cy + e[12], wy = e[1] * cx + e[5] * cy + e[13], wz = e[2] * cx + e[6] * cy + e[14];
    const fr = (v) => v - Math.floor(v), seed = fr(Math.sin(wx * 12.9898 + wz * 78.233 + wy * 3.17) * 43758.5453);
    const lit = o.glass === 'glassLit' || (o.glass !== 'glass' && fr(seed * 7.13) < ((CURMAP.def && CURMAP.def.atmo.winLit) || 0)) ? 1 : 0;
    M.tint = [seed, lit, Math.min(gh / Math.max(gw, 0.1), 3.9) / 8 + (o.door ? 0.5 : 0)];
    M.quad('window', ...gp, [0, 0, 1], { uv: [[0, 0], [1, 0], [1, 1], [0, 1]] });
  } else M.quad(o.glass, ...gp, [0, 0, 1]);
  // rideau intérieur, parfois
  if (o.curtain) { M.color(o.curtain); M.quad('canvas', [op.x0 + t, op.y0 + h * 0.35, z0 - 0.05], [op.x1 - t, op.y0 + h * 0.35, z0 - 0.05], [op.x1 - t, op.y1 - t, z0 - 0.05], [op.x0 + t, op.y1 - t, z0 - 0.05], [0, 0, 1]); }
  M.restore();
}
/* Moucharabieh : oriel en bois ajouré posé devant une fenêtre d'étage (treillis sur trois côtés, auvent, console) */
function mashrabiya(M, op, tint) {
  const w = op.x1 - op.x0 + 0.5, x0 = (op.x0 + op.x1) / 2 - w / 2, x1 = x0 + w, y0 = op.y0 - 0.25, y1 = op.y1 + 0.2, dp = 0.55;
  M.save().color([0.05, 0.05, 0.05]); M.quad('dark', [op.x0, op.y0, -0.2], [op.x1, op.y0, -0.2], [op.x1, op.y1, -0.2], [op.x0, op.y1, -0.2], [0, 0, 1]); M.restore();
  M.save().color([0.45, 0.3, 0.2]).local(1);
  M.boxB('wood', x0 - 0.05, x1 + 0.05, y0 - 0.1, y0, 0, dp + 0.05, { bevel: 0.015 });
  M.boxB('wood', x0 - 0.08, x1 + 0.08, y1, y1 + 0.08, 0, dp + 0.12, { bevel: 0.015 });
  for (const x of [x0, x1]) for (const z of [dp]) M.boxB('wood', x - 0.03, x + 0.03, y0, y1, z - 0.03, z + 0.03);
  for (const x of [x0, x1]) M.boxB('wood', x - 0.03, x + 0.03, y0, y1, 0, 0.05);
  M.boxB('wood', x0, x1, y0 + (y1 - y0) * 0.35, y0 + (y1 - y0) * 0.35 + 0.05, dp - 0.03, dp + 0.03);
  M.color([1, 1, 1]); M.cls = 1; M.uvS = 1;
  const B = M.buf('lattice', (x0 + x1) / 2, (y0 + y1) / 2, dp);
  const face = (p0, p1, p2, p3, n, uw, uh) => { const ids = [[p0, 0, 0], [p1, uw, 0], [p2, uw, uh], [p3, 0, uh]].map(([p, u, v]) => M.v(B, p[0], p[1], p[2], n[0], n[1], n[2], u, v)); M.quadI(B, ids[0], ids[1], ids[2], ids[3]); M.quadI(B, ids[0], ids[3], ids[2], ids[1]); };
  face([x0, y0, dp], [x1, y0, dp], [x1, y1, dp], [x0, y1, dp], [0, 0, 1], w, y1 - y0);
  face([x0, y0, 0.03], [x0, y0, dp], [x0, y1, dp], [x0, y1, 0.03], [-1, 0, 0], dp, y1 - y0);
  face([x1, y0, dp], [x1, y0, 0.03], [x1, y1, 0.03], [x1, y1, dp], [1, 0, 0], dp, y1 - y0);
  M.cls = 0; M.color([0.4, 0.28, 0.18]);
  const cons = [[0, 0], [0.4, 0], [0.4, -0.08], [0.1, -0.4], [0, -0.45]];
  for (const x of [x0 + 0.1, x1 - 0.1]) { M.save().move(x + 0.05, y0 - 0.1, 0).rotY(-Math.PI / 2); M.extrude('wood', cons, 0.1); M.restore(); }
  M.restore();
  M.occ(x0, x1, y0, y1, 0, dp, 0.5);
}
/* Fenêtre condamnée : planches clouées en travers, pièce sombre derrière */
function boardedWindow(M, op, d, R) {
  const w = op.x1 - op.x0, h = op.y1 - op.y0;
  M.save().color([0.05, 0.05, 0.05]); M.quad('dark', [op.x0, op.y0, -d + 0.02], [op.x1, op.y0, -d + 0.02], [op.x1, op.y1, -d + 0.02], [op.x0, op.y1, -d + 0.02], [0, 0, 1]); M.restore();
  M.save().local(1);
  const n = 3 + Math.floor(R() * 2);
  for (let i = 0; i < n; i++) {
    const y = op.y0 + ((i + 0.5) / n) * h + (R() - 0.5) * 0.08, ang = (R() - 0.5) * 0.35;
    M.color([0.75 + R() * 0.2, 0.62 + R() * 0.15, 0.48]);
    M.save().move((op.x0 + op.x1) / 2, y, 0.025).rotZ(ang); M.box('crate', w + 0.3, 0.16, 0.025, { bevel: 0.004 }); M.restore();
  }
  M.restore();
}
/* Fenêtre brisée : châssis, éclats de verre dans les angles, pièce sombre */
function brokenWindow(M, op, d, tint, R) {
  const z = -d + 0.055, t = 0.065;
  M.save().color([0.05, 0.05, 0.05]); M.quad('dark', [op.x0, op.y0, -d + 0.005], [op.x1, op.y0, -d + 0.005], [op.x1, op.y1, -d + 0.005], [op.x0, op.y1, -d + 0.005], [0, 0, 1]); M.restore();
  M.save().color(tint).local(1); M.cls = 1;
  lbox(M, 'paintwood', op.x0, op.x0 + t, op.y0, op.y1, -d + 0.02, -d + 0.09); lbox(M, 'paintwood', op.x1 - t, op.x1, op.y0, op.y1, -d + 0.02, -d + 0.09);
  lbox(M, 'paintwood', op.x0 + t, op.x1 - t, op.y1 - t, op.y1, -d + 0.02, -d + 0.09); lbox(M, 'paintwood', op.x0 + t, op.x1 - t, op.y0, op.y0 + t, -d + 0.02, -d + 0.09);
  M.color([1, 1, 1]);
  for (const [cx, cy, sx, sy] of [[op.x0 + t, op.y0 + t, 1, 1], [op.x1 - t, op.y1 - t, -1, -1], [op.x1 - t, op.y0 + t, -1, 1]]) {
    const a = 0.15 + R() * 0.25, b = 0.2 + R() * 0.35;
    M.tri3('glass', [cx, cy, z], [cx + sx * a, cy, z], [cx, cy + sy * b, z], [0, 0, 1]);
  }
  M.restore();
}
/* Appui de fenêtre saillant (pierre ou béton), légèrement plus large que l'ouverture */
function sill(M, op, mat = 'concrete', tint = PAL.stone) {
  M.save().color(tint).local(1);
  M.boxB(mat, op.x0 - 0.09, op.x1 + 0.09, op.y0 - 0.06, op.y0 + 0.005, -0.04, 0.09, { bevel: 0.012 });
  M.restore();
}
function lintel(M, op, mat = 'ashlar', tint = PAL.stone) {
  M.save().color(tint).world(1);
  M.boxB(mat, op.x0 - 0.12, op.x1 + 0.12, op.y1, op.y1 + 0.2, -0.01, 0.025, { bevel: 0.01 });
  M.restore();
}
/* Volets persiennés. state : 'open' (rabattus contre le mur), 'ajar' (entrouverts), 'closed' */
function shutters(M, op, tint, state, rngF) {
  const w = op.x1 - op.x0, lw = w / 2 + 0.015, h = op.y1 - op.y0, t = 0.035;
  M.save().color(tint).local(1);
  M.uvS = 1.3 / TEXSCALE.shutter;
  if (state === 'closed') {
    for (const [x, s] of [[op.x0, 1], [op.x1, -1]]) { M.save().move(x + (s * lw) / 2, op.y0, s < 0 ? -0.055 : -0.06); M.box('shutter', lw - 0.01, h, t); M.restore(); } // le vantail droit recouvre le gauche de 2 cm, 5 mm devant (pas dans son plan)
  } else {
    for (const [x, s] of [[op.x0, -1], [op.x1, 1]]) {
      const ang = state === 'open' ? rngF() * 0.12 : 0.6 + rngF() * 0.9;
      M.save().move(x + s * 0.01, op.y0, 0.02).rotY(s < 0 ? ang : -ang).move((s * lw) / 2, 0, t / 2); M.box('shutter', lw, h, t); M.restore();
      // gonds
      M.save().color([0.2, 0.2, 0.2]); M.cls = 2;
      for (const yy of [0.2, h - 0.25]) lbox(M, 'steel', x + s * 0.01 - 0.02, x + s * 0.01 + 0.02, op.y0 + yy, op.y0 + yy + 0.05, 0, 0.04);
      M.restore();
    }
  }
  M.restore();
}
/* Grille de défense en fer (fenêtres du rez-de-chaussée) */
function grille(M, op) {
  const w = op.x1 - op.x0, n = Math.max(3, Math.round(w / 0.12)), z = 0.03;
  M.save().color([0.16, 0.15, 0.14]); M.cls = 1;
  for (let i = 1; i < n; i++) { const x = op.x0 + (w * i) / n; M.save().move(x, op.y0 - 0.02, z); M.cyl('steel', 0.009, op.y1 - op.y0 + 0.04, 5, { caps: '' }); M.restore(); }
  for (const y of [op.y0 + 0.12, op.y1 - 0.12, (op.y0 + op.y1) / 2]) lbox(M, 'steel', op.x0 - 0.03, op.x1 + 0.03, y - 0.015, y + 0.015, z - 0.01, z + 0.01);
  M.restore();
}
/* Porte à panneaux (bois peint) au fond de l'embrasure, avec chambranle, poignée et seuil */
function panelDoor(M, op, d, tint, o = {}) {
  const w = op.x1 - op.x0, h = op.y1 - op.y0, z0 = -d + 0.02, cols = w > 1.3 ? 2 : 1, dbl = w > 1.3;
  M.save().color(tint).local(1);
  if (op.rise) {
    // porte cintrée : vantail découpé selon l'arc
    // (contour élargi de 3 cm : il passe derrière l'intrados et les tableaux, aucun jour entre la porte et l'arc)
    const A = archGeom(op), sh = [[op.x0 - 0.03, op.y0], [op.x1 + 0.03, op.y0]], r = A.R + 0.03;
    for (let i = 0; i <= ARCH_SEG; i++) { const a = lerp(A.a0, A.a1, i / ARCH_SEG); sh.push([A.xc + Math.cos(a) * r, A.cy + Math.sin(a) * r]); }
    M.save().move(0, 0, z0); M.extrude('paintwood', sh, 0.05); M.restore();
    // clous décoratifs
    M.save().color([0.15, 0.14, 0.13]); M.cls = 2;
    for (let yy = op.y0 + 0.3; yy < A.ys - 0.1; yy += 0.36) for (let xx = op.x0 + 0.15; xx < op.x1 - 0.1; xx += 0.2) lbox(M, 'steel', xx - 0.012, xx + 0.012, yy - 0.012, yy + 0.012, z0 + 0.05, z0 + 0.065);
    M.restore();
  } else {
    if (o.open) {
      // entrée : pièce sombre derrière, vantail tourné vers l'intérieur autour de ses gonds
      const D = 1.4;
      M.save().color([0.62, 0.56, 0.48]).world(1); M.ao = 0.45;
      M.quad('plaster', [op.x0 - 0.4, op.y0, z0 - D], [op.x1 + 0.4, op.y0, z0 - D], [op.x1 + 0.4, op.y1 + 0.3, z0 - D], [op.x0 - 0.4, op.y1 + 0.3, z0 - D], [0, 0, 1]);
      M.quad('plaster', [op.x0, op.y0, z0], [op.x0, op.y1, z0], [op.x0 - 0.4, op.y1 + 0.3, z0 - D], [op.x0 - 0.4, op.y0, z0 - D], [1, 0, 0]);
      M.quad('plaster', [op.x1, op.y0, z0], [op.x1 + 0.4, op.y0, z0 - D], [op.x1 + 0.4, op.y1 + 0.3, z0 - D], [op.x1, op.y1, z0], [-1, 0, 0]);
      M.quad('plaster', [op.x0, op.y1, z0], [op.x1, op.y1, z0], [op.x1 + 0.4, op.y1 + 0.3, z0 - D], [op.x0 - 0.4, op.y1 + 0.3, z0 - D], [0, -1, 0]);
      M.color([0.7, 0.66, 0.6]); M.quad('tiles', [op.x0, op.y0 + 0.005, z0], [op.x1, op.y0 + 0.005, z0], [op.x1 + 0.4, op.y0 + 0.005, z0 - D], [op.x0 - 0.4, op.y0 + 0.005, z0 - D], [0, 1, 0]);
      M.restore();
      M.save().color(tint).local(1).move(op.x0 + 0.02, 0, z0).rotY(1.0); // ouvert vers l'intérieur
      lbox(M, 'paintwood', 0, w * (dbl ? 0.5 : 1) - 0.02, op.y0, op.y1, -0.05, 0);
      M.restore();
      M.restore();
      return;
    }
    lbox(M, 'paintwood', op.x0, op.x1, op.y0, op.y1, z0, z0 + 0.05);
    const rows = h > 2 ? 3 : 2, pw = (w - 0.12 * (cols + 1)) / cols, ph = (h - 0.14 * (rows + 1)) / rows;
    for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
      const x = op.x0 + 0.12 + c * (pw + 0.12), y = op.y0 + 0.14 + r * (ph + 0.14);
      if (o.glazed && r === rows - 1) { M.save(); M.cls = 1; M.quad('glass', [x, y, z0 + 0.052], [x + pw, y, z0 + 0.052], [x + pw, y + ph, z0 + 0.052], [x, y + ph, z0 + 0.052], [0, 0, 1]); M.restore(); continue; }
      M.boxB('paintwood', x, x + pw, y, y + ph, z0 + 0.05, z0 + 0.068, { bevel: 0.012 });
    }
    if (dbl) lbox(M, 'paintwood', (op.x0 + op.x1) / 2 - 0.012, (op.x0 + op.x1) / 2 + 0.012, op.y0, op.y1, z0 + 0.05, z0 + 0.06);
  }
  M.restore();
  // poignée, heurtoir
  M.save().color([0.55, 0.45, 0.25]); M.cls = 2;
  const hx = dbl ? (op.x0 + op.x1) / 2 + 0.1 : op.x1 - 0.12;
  lbox(M, 'steel', hx - 0.015, hx + 0.015, op.y0 + 1.0, op.y0 + 1.12, z0 + 0.05, z0 + 0.1);
  M.restore();
  // seuil en pierre
  M.save().color(PAL.stone).local(1);
  M.boxB('ashlar', op.x0 - 0.06, op.x1 + 0.06, op.y0 - 0.02, op.y0 + 0.05, z0, 0.14, { bevel: 0.015 });
  M.restore();
}
/* Chambranle saillant autour d'une ouverture rectangulaire (ou bandeau de pierre autour d'un arc) */
function casing(M, op, tint, mat = 'ashlar', wd = 0.14) {
  M.save().color(tint).world(1);
  if (op.rise) {
    const A = archGeom(op), n = 14, B = M.buf(mat, A.xc, op.y1, 0.03);
    let p = null;
    for (let i = 0; i <= n; i++) {
      const a = lerp(A.a0, A.a1, i / n), c = Math.cos(a), s = Math.sin(a);
      const ids = [M.v(B, A.xc + c * A.R, A.cy + s * A.R, 0.03, 0, 0, 1, 0, 0), M.v(B, A.xc + c * (A.R + wd), A.cy + s * (A.R + wd), 0.03, 0, 0, 1, 0, 0),
        M.v(B, A.xc + c * (A.R + wd), A.cy + s * (A.R + wd), 0.03, c, s, 0, 0, 0), M.v(B, A.xc + c * (A.R + wd), A.cy + s * (A.R + wd), 0, c, s, 0, 0, 0)];
      if (p) { M.quadI(B, p[0], p[1], ids[1], ids[0]); M.quadI(B, p[3], p[2], ids[2], ids[3]); }
      p = ids;
    }
    lbox(M, mat, op.x0 - wd, op.x0, op.y0, A.ys, 0, 0.03); lbox(M, mat, op.x1, op.x1 + wd, op.y0, A.ys, 0, 0.03);
  } else {
    lbox(M, mat, op.x0 - wd, op.x0, op.y0, op.y1 + wd, 0, 0.03); lbox(M, mat, op.x1, op.x1 + wd, op.y0, op.y1 + wd, 0, 0.03);
    lbox(M, mat, op.x0, op.x1, op.y1, op.y1 + wd, 0, 0.03);
  }
  M.restore();
}
/* Rideau métallique de boutique : lames, coffre, coulisses ; open = part relevée (0 à 1), boutique sombre derrière */
function rollShutter(M, op, d, tint, open) {
  const w = op.x1 - op.x0, h = op.y1 - op.y0, bottom = op.y0 + h * open;
  M.save().color(tint).local(1); M.uvS = 1.5 / TEXSCALE.rollshutter;
  if (bottom < op.y1 - 0.05) M.boxB('rollshutter', op.x0 + 0.02, op.x1 - 0.02, bottom, op.y1, -0.1, -0.07);
  M.restore();
  // coffre et coulisses
  M.save().color([0.55, 0.55, 0.52]).local(1);
  M.boxB('steel', op.x0 - 0.06, op.x1 + 0.06, op.y1, op.y1 + 0.32, -0.02, 0.26, { bevel: 0.02 });
  lbox(M, 'steel', op.x0, op.x0 + 0.05, op.y0, op.y1, -0.12, -0.04); lbox(M, 'steel', op.x1 - 0.05, op.x1, op.y0, op.y1, -0.12, -0.04);
  M.restore();
  if (open > 0.05) {
    // boutique : pièce sombre peu profonde, étagères devinées
    const D = 1.6;
    M.save().color([0.72, 0.66, 0.58]).world(1); M.ao = 0.55;
    M.quad('plaster', [op.x0, op.y0, -D], [op.x1, op.y0, -D], [op.x1, op.y1, -D], [op.x0, op.y1, -D], [0, 0, 1]);
    M.quad('plaster', [op.x0, op.y0, -0.1], [op.x0, op.y1, -0.1], [op.x0, op.y1, -D], [op.x0, op.y0, -D], [1, 0, 0]);
    M.quad('plaster', [op.x1, op.y0, -0.1], [op.x1, op.y1, -0.1], [op.x1, op.y1, -D], [op.x1, op.y0, -D], [-1, 0, 0]);
    M.quad('plaster', [op.x0, op.y1, -0.1], [op.x1, op.y1, -0.1], [op.x1, op.y1, -D], [op.x0, op.y1, -D], [0, -1, 0]);
    M.color([0.6, 0.55, 0.5]); M.quad('tiles', [op.x0, op.y0 + 0.01, -0.1], [op.x1, op.y0 + 0.01, -0.1], [op.x1, op.y0 + 0.01, -D], [op.x0, op.y0 + 0.01, -D], [0, 1, 0]);
    M.color([0.5, 0.4, 0.3]); M.local(1);
    const R = rngOf(Math.round(op.x0 * 100 + op.y1 * 7));
    for (const y of [0.9, 1.5, 2.1]) if (op.y0 + y < op.y1 - 0.1) {
      M.color([0.5, 0.4, 0.3]); lbox(M, 'crate', op.x0 + 0.1, op.x1 - 0.1, op.y0 + y, op.y0 + y + 0.04, -D + 0.02, -D + 0.4);
      // marchandises sur l'étagère : boîtes, bocaux, paquets de couleurs
      M.cls = 2;
      for (let x = op.x0 + 0.18; x < op.x1 - 0.25; x += 0.14 + R() * 0.18) {
        const h = 0.12 + R() * 0.22, w = 0.08 + R() * 0.1;
        M.color(R.pick([[0.8, 0.2, 0.15], [0.9, 0.8, 0.3], [0.2, 0.4, 0.7], [0.9, 0.9, 0.85], [0.3, 0.6, 0.3], [0.6, 0.4, 0.2]]));
        lbox(M, R() < 0.6 ? 'cardboard' : 'plastic', x, x + w, op.y0 + y + 0.04, op.y0 + y + 0.04 + h, -D + 0.08, -D + 0.3);
      }
      M.cls = 0;
    }
    M.restore();
  }
}
/* Store banne rayé, incliné, avec lambrequin et bras en acier (repère de façade). Chaque bande est une toile simulée (Maker.toile) tenue au
   mur, à la barre de charge et à ses voisines : son milieu respire ; le lambrequin festonné pend de la barre et bat au vent */
function awningStriped(M, xc, y, w, depth, colors) {
  const n = Math.max(4, Math.round(w / 0.3)), drop = depth * 0.42, sag = 0.05;
  M.save();
  for (let i = 0; i < n; i++) {
    const xa = xc - w / 2 + (w * i) / n, xb = xa + w / n;
    M.color(colors[i % colors.length]);
    M.toile(1, 4, (u, t) => [lerp(xa, xb, u), y - t * drop - Math.sin(t * Math.PI) * sag, t * depth], { uL: xb - xa, vL: depth, play: 0.05, glow: 0.3, side: [0, 0.92, 0.38] });
    // lambrequin festonné : tenu à la barre, la pointe libre
    const yv = y - drop;
    M.toile(1, 2, (u, t) => [lerp(xa, xb, u), yv - t * (0.16 + 0.06 * Math.sin(u * Math.PI)), depth + 0.004], { uL: xb - xa, vL: 0.22, play: 0.16, glow: 0.3, side: [0, 0, 1], pin: (u, t) => t <= 0 });
  }
  M.color([0.25, 0.25, 0.24]); M.cls = 1;
  M.save().move(xc - w / 2, y + 0.02, 0.02); M.cyl('steel', 0.02, 0.02, 6); M.restore();
  lbox(M, 'steel', xc - w / 2, xc + w / 2, y - 0.03, y + 0.03, 0, 0.05);
  for (const x of [xc - w / 2 + 0.1, xc + w / 2 - 0.1]) M.tube('steel', 0.014, [[x, y - 0.6, 0.01], [x, y - drop * 0.6, depth * 0.6]], 5);
  M.restore();
  M.occ(xc - w / 2, xc + w / 2, y - drop, y, 0, depth, 0.6);
}
/* Enseigne peinte (atlas des enseignes), posée à plat sur la façade */
function signBoard(M, xc, y, w, h, idx) {
  const [u0, v0, du, dv] = signUV(idx), B = M.buf('signs', xc, y, 0.05), z = 0.06;
  M.save().color([1, 1, 1]);
  const a = M.v(B, xc - w / 2, y, z, 0, 0, 1, u0, v0 + dv), b = M.v(B, xc + w / 2, y, z, 0, 0, 1, u0 + du, v0 + dv);
  const c = M.v(B, xc + w / 2, y + h, z, 0, 0, 1, u0 + du, v0), d = M.v(B, xc - w / 2, y + h, z, 0, 0, 1, u0, v0);
  M.quadI(B, a, b, c, d);
  M.color([0.35, 0.3, 0.25]).local(1); lbox(M, 'paintwood', xc - w / 2 - 0.03, xc + w / 2 + 0.03, y - 0.03, y + h + 0.03, 0, z - 0.002);
  M.restore();
}
/* Balcon : dalle sur consoles, garde-corps en fer (repère de façade) */
function balcony(M, xc, y, w, dp, rngF) {
  M.save().color([0.9, 0.88, 0.84]).local(1);
  M.boxB('concrete', xc - w / 2, xc + w / 2, y - 0.16, y, 0, dp, { bevel: 0.02 });
  M.pcol(xc - w / 2, xc + w / 2, y - 0.16, y, 0, dp); // la dalle porte le pot de fleurs (un corps physique) : sans elle, il tombait au premier choc
  // consoles
  const cons = [[0, 0], [0.16, 0], [0.16, -0.08], [0.06, -0.34], [0, -0.38]];
  for (const x of [xc - w / 2 + 0.2, xc + w / 2 - 0.2]) { M.save().move(x + 0.06, y - 0.16, 0).rotY(-Math.PI / 2); M.extrude('concrete', cons, 0.12); M.restore(); }
  M.restore();
  // garde-corps
  M.save().color([0.14, 0.14, 0.13]); M.cls = 1;
  const x0 = xc - w / 2 + 0.04, x1 = xc + w / 2 - 0.04, z1 = dp - 0.04, top = y + 1.0;
  lbox(M, 'steel', x0, x1, top - 0.04, top, z1 - 0.025, z1 + 0.025);
  lbox(M, 'steel', x0, x1, y + 0.1, y + 0.13, z1 - 0.012, z1 + 0.012);
  for (const x of [x0, x1]) { lbox(M, 'steel', x - 0.025, x + 0.025, top - 0.04, top, 0, z1); lbox(M, 'steel', x - 0.012, x + 0.012, y + 0.1, y + 0.13, 0, z1); lbox(M, 'steel', x - 0.02, x + 0.02, y, top, z1 - 0.02, z1 + 0.02); }
  M.cls = 2;
  const nb = Math.round((x1 - x0) / 0.11);
  for (let i = 1; i < nb; i++) { const x = x0 + ((x1 - x0) * i) / nb; lbox(M, 'steel', x - 0.008, x + 0.008, y, top - 0.04, z1 - 0.008, z1 + 0.008, { skip: 'yY' }); }
  for (const x of [x0, x1]) for (let z = 0.12; z < z1 - 0.05; z += 0.11) lbox(M, 'steel', x - 0.008, x + 0.008, y, top - 0.04, z - 0.008, z + 0.008, { skip: 'yY' });
  M.restore();
  // pots de fleurs, linge
  if (rngF() < 0.5) M.dyn('pot', xc + (rngF() - 0.5) * (w - 0.6), y, dp * 0.55, rngF() * TAU);
  if (rngF() < 0.35) laundry(M, x0 + 0.1, x1 - 0.1, top - 0.02, z1, rngF);
}
/* Linge pendu sur une barre (repère local) */
function laundry(M, x0, x1, y, z, rngF) {
  M.save(); M.cls = 2;
  let x = x0;
  while (x < x1 - 0.3) {
    const w = 0.3 + rngF() * 0.35, h = 0.35 + rngF() * 0.4;
    M.color(PAL.awning[Math.floor(rngF() * PAL.awning.length)]);
    clothPiece(M, [x, y - h, z + 0.04], [x + w, y - h, z + 0.04], [x + w, y, z + 0.04], [x, y, z + 0.04], [0, 0, 1]); // tissu simulé (02mc-tissus.js), écarté de la barre
    x += w + 0.05 + rngF() * 0.2;
  }
  M.restore();
}
/* Descente d'eau pluviale (repère de façade) */
function drainPipe(M, x, y1, y0 = 0) {
  M.save().color([0.62, 0.6, 0.56]); M.cls = 1;
  M.save().move(x, y0 + 0.25, 0.1); M.cyl('steel', 0.05, y1 - y0 - 0.25, 8, { caps: '' }); M.restore();
  M.tube('steel', 0.05, [[x, y0 + 0.28, 0.1], [x, y0 + 0.14, 0.14], [x, y0 + 0.08, 0.26]], 8);
  M.cls = 2;
  for (let y = y0 + 1.2; y < y1 - 0.2; y += 1.8) lbox(M, 'steel', x - 0.06, x + 0.06, y, y + 0.03, 0, 0.16);
  M.restore();
}
/* Câble électrique courant sur la façade, boîtiers de raccordement */
function wallCable(M, x0, x1, y, rngF) {
  M.save().color([0.08, 0.08, 0.08]); M.cls = 2;
  const pts = []; for (let x = x0; x <= x1 + 1e-6; x += (x1 - x0) / 12) pts.push([x, y - Math.abs(Math.sin(((x - x0) / (x1 - x0)) * Math.PI * 3)) * 0.05, 0.04]);
  M.tube('rubber', 0.012, pts, 4);
  M.color([0.7, 0.68, 0.62]);
  for (let x = x0 + 1 + rngF() * 2; x < x1 - 0.5; x += 3 + rngF() * 4) lbox(M, 'plastic', x - 0.08, x + 0.08, y - 0.12, y + 0.08, 0, 0.07);
  M.restore();
}
/* Applique de façade ; lit : allumée (ampoule et lumière chaude cuite dans le volume d'éclairage) ; toutes allumées quand l'éclairage public l'est */
function wallLamp(M, x, y, lit) {
  lit = lit || litOn();
  M.save().color([0.2, 0.2, 0.2]); M.cls = 1;
  M.tube('steel', 0.018, [[x, y, 0], [x, y + 0.12, 0.25], [x, y + 0.1, 0.5]], 5);
  M.save().move(x, y - 0.12, 0.5); M.cyl('steel', 0.14, 0.12, 10, { r1: 0.05 }); M.restore();
  M.cls = 1; M.save().move(x, y - 0.14, 0.5); M.cyl(lit ? 'lamp' : 'lampOff', 0.09, 0.03, 8); M.restore();
  if (lit) M.lamp(x, y - 0.3, 0.5, [1.0, 0.68, 0.38], 1.2, 6, 0.6);
  M.restore();
}
/* Moulure profilée le long de la façade (profil [sortie, hauteur], fermé contre le mur) */
function molding(M, mat, x0, x1, y, prof, tint) {
  M.save().color(tint).world(1).move(x1, y, 0).rotY(-Math.PI / 2);
  M.extrude(mat, prof, x1 - x0);
  M.restore();
}
var PROF = {
  cornice: [[0, 0], [0.06, 0], [0.06, 0.05], [0.1, 0.08], [0.15, 0.14], [0.24, 0.18], [0.24, 0.27], [0, 0.27]],
  band: [[0, 0], [0.05, 0], [0.07, 0.025], [0.07, 0.11], [0.045, 0.14], [0, 0.14]],
  plinth: [[0, 0], [0.06, 0], [0.06, 0.0], [0.06, 0.8], [0.03, 0.85], [0, 0.85]],
  coping: [[-0.04, 0], [0.04, 0], [0.04, 0.04], [0.0, 0.08], [-0.04, 0.04]],
};

/* ---------- Façade complète ---------- */
/* Zones sans porte ni boutique au rez-de-chaussée ([x0, x1, z0, z1], repère du monde), remplies par la carte en cours le temps de sa
   construction : là où un bâtiment voisin, un conteneur, une tente ou un mur de sacs se tient devant la façade, la travée reste un mur plein
   (decor.js relevait ces portes gênées). Les tirages au sort sont les mêmes : le reste de la façade et de la carte ne change pas. */
var NO_DOOR = [];
/* Façade d'un bloc : étages de 3,2 m, travées d'environ 3,1 m ; rez-de-chaussée commerçant ou habité.
   o : { mat, tint, style, skipGround, noGround, shutters, rng } */
function facadeKit(face, x0, x1, z0, z1, h, o) {
  const F = facadeFrame(face, x0, x1, z0, z1), len = F.len, R = o.rng, floorH = 3.2;
  const shade = Math.sin(F.rot) * SUN_DIR.x + Math.cos(F.rot) * SUN_DIR.z < 0; // façade à l'ombre : les appliques des portes y sont allumées
  const noDoor = (a) => { const x = F.ox + a * Math.cos(F.rot), z = F.oz - a * Math.sin(F.rot); return NO_DOOR.some((q) => x > q[0] && x < q[1] && z > q[2] && z < q[3]); };
  const ghost = []; // portes et boutiques retirées par NO_DOOR : les affiches les évitent comme avant (mêmes tirages)
  const bays = Math.max(1, Math.floor(len / (o.bay || 3.1))), bw = len / bays;
  const shut = o.shutters, frameT = o.frame, maghreb = o.style === 'maghreb';
  const ops = [], after = [];
  for (let f = o.skipGround ? 1 : 0; ; f++) {
    const fy = f * floorH; if (fy + 2.4 > h - 0.4) break;
    for (let i = 0; i < bays; i++) {
      const a = bw * (i + 0.5);
      if (f === 0) {
        if (o.noGround) continue;
        const r = R();
        if (r < 0.35) { // boutique
          const sw = Math.min(bw - 0.6, 2.6), op = { x0: a - sw / 2, x1: a + sw / 2, y0: 0, y1: 2.5, depth: 0.12, kind: 'shop' };
          const tint = R.pick(PAL.shop), open = R() < 0.3 ? 0.55 + R() * 0.3 : R() < 0.2 ? 0.2 : 0;
          if (noDoor(a)) { ghost.push(op); after.push(() => { if (R() < 0.6) R.pick(PAL.awning); else if (R() < 0.7) R(); }); continue; } // mur plein, mêmes tirages
          ops.push(op);
          after.push((M) => {
            rollShutter(M, op, 0.12, tint, open);
            if (R() < 0.6) awningStriped(M, a, 2.95, sw + 0.4, 1.25, [R.pick(PAL.awning), [0.9, 0.88, 0.82]]);
            else if (R() < 0.7) signBoard(M, a, 2.9, Math.min(sw + 0.2, 2.4), 0.55, Math.floor(R() * 8));
          });
        } else if (r < 0.55) { // porte
          const arch = maghreb || R() < 0.25, dw = arch ? 1.2 : 1.1;
          const op = { x0: a - dw / 2, x1: a + dw / 2, y0: 0, y1: arch ? 2.5 : 2.2, depth: 0.25, kind: 'door', rise: arch ? 0.6 : 0, back: arch };
          const tint = R.pick(PAL.door), glazed = R() < 0.3, open = !arch && R() < 0.18;
          if (noDoor(a)) { ghost.push(op); after.push(() => { R(); }); continue; } // mur plein, mêmes tirages
          ops.push(op);
          after.push((M) => { panelDoor(M, op, 0.25, tint, { glazed, open }); casing(M, op, arch ? PAL.stone : [0.86, 0.82, 0.74], 'ashlar', arch ? 0.16 : 0.12); if (R() < 0.3) wallLamp(M, a + dw / 2 + 0.35, 2.3, shade); });
        } else { // fenêtre basse
          const ww = Math.min(bw * 0.45, 1.2), op = { x0: a - ww / 2, x1: a + ww / 2, y0: 1.0, y1: 2.4, depth: 0.22, kind: 'win', rise: maghreb && R() < 0.5 ? 0.25 : 0, back: true };
          ops.push(op);
          const st = shut && R() < 0.8 ? (R() < 0.25 ? 'closed' : R() < 0.4 ? 'ajar' : 'open') : null, gr = R() < 0.6, board = !gr && R() < 0.2;
          after.push((M) => {
            if (board) boardedWindow(M, op, 0.22, R);
            else if (st !== 'closed') windowJoinery(M, op, 0.22, frameT, { curtain: R() < 0.3 ? R.pick(PAL.awning) : null });
            sill(M, op); if (st && !op.rise) shutters(M, op, shut, st, R);
            if (gr) grille(M, op);
          });
        }
      } else {
        const r = R(), bal = r < 0.14 && !maghreb, ac = r > 0.86;
        const ww = Math.min(bw * 0.42, 1.15);
        const op = bal ? { x0: a - ww / 2, x1: a + ww / 2, y0: fy + 0.05, y1: fy + 2.45, depth: 0.22, kind: 'european', back: true }
          : { x0: a - ww / 2, x1: a + ww / 2, y0: fy + 0.9, y1: fy + 2.45, depth: 0.22, kind: 'win', rise: maghreb && R() < 0.35 ? 0.22 : 0, back: true };
        ops.push(op);
        const st = shut && R() < 0.75 ? (R() < 0.3 ? 'closed' : R() < 0.35 ? 'ajar' : 'open') : null, dmg = bal ? 1 : R();
        after.push((M) => {
          if (maghreb && !bal && !op.rise && dmg > 0.8) { mashrabiya(M, op, frameT); return; }
          if (dmg < 0.06) boardedWindow(M, op, 0.22, R);
          else if (dmg < 0.11) brokenWindow(M, op, 0.22, frameT, R);
          else if (st !== 'closed') windowJoinery(M, op, 0.22, frameT, { door: bal, curtain: R() < 0.35 ? R.pick(PAL.awning) : null });
          if (!bal && R() < 0.3) wallDecal(M, 8, (op.x0 + op.x1) / 2, op.y0 - 1.3, op.x1 - op.x0 + 0.3, 1.25); // coulure sous l'appui
          if (!bal) sill(M, op);
          if (st && !op.rise) shutters(M, op, shut, st, R);
          if (!op.rise && o.lintels) lintel(M, op);
          if (bal) balcony(M, a, fy + 0.05, ww + 1.0, 0.85, R);
          if (ac) M.place(PF.acUnit(), a + ww / 2 + 0.55, fy + 0.35, 0, 0, { cls: 1 });
          if (!bal && R() < 0.12) M.dyn('pot', a + (R() - 0.5) * 0.4, op.y0 + 0.005, 0.03, R() * TAU);
        });
      }
    }
  }
  inFrame(F, (M) => {
    M.save().color(o.tint).world(1);
    M.aoFn = (x, y) => lerp(0.75, 1, smoothstep(0, 1.2, y));
    wallPierced(M, o.mat, len, 0, h, ops, { depth: 0.22, round: o.round });
    M.restore();
    // soubassement, bandeaux, corniche
    const pl = o.plinth;
    if (pl && !o.skipGround) {
      let cur = 0;
      const segs = ops.filter((p) => p.y0 < 0.5).map((p) => [p.x0, p.x1]).sort((p, q) => p[0] - q[0]);
      for (const [s0, s1] of segs) { if (s0 - cur > 0.05) plinthSeg(M, cur, s0, pl); cur = s1; }
      if (len - cur > 0.05) plinthSeg(M, cur, len, pl);
    }
    if (o.bands) for (let f = 1; f * floorH < h - 1.2; f++) molding(M, o.trimMat || 'plaster', 0, len, f * floorH - 0.14, PROF.band, o.trimTint || o.tint);
    if (o.cornice !== false) molding(M, o.trimMat || 'plaster', 0, len, h - 0.27, PROF.cornice, o.trimTint || o.tint);
    if (o.quoins) for (const x of [0, len]) for (let y = 0.9, k = 0; y < h - 0.6; y += 0.42, k++) {
      const w = k % 2 ? 0.28 : 0.45;
      M.save().color(PAL.stone).world(1); lbox(M, 'ashlar', x === 0 ? 0 : len - w, x === 0 ? w : len, y, y + 0.38, 0, 0.035); M.restore();
    }
    for (const fn of after) fn(M);
    // descente d'eau, câbles, compteur
    if (o.pipes !== false && len > 5) drainPipe(M, bw * Math.max(1, Math.floor(R() * bays)), h - 0.3);
    if (R() < 0.7 && !o.skipGround) wallCable(M, 0.2, len - 0.2, floorH - 0.22 + R() * 0.1, R);
    if (!o.skipGround && R() < 0.5) { M.save().color([0.8, 0.78, 0.72]); M.cls = 2; const x = 0.4 + R() * (len - 0.8); if (!ops.some((p) => x > p.x0 - 0.4 && x < p.x1 + 0.4)) lbox(M, 'plastic', x - 0.2, x + 0.2, 1.1, 1.6, 0, 0.16); M.restore(); }
    // affiches, pochoirs, graffitis entre les ouvertures du rez-de-chaussée
    if (!o.skipGround && !o.noGround) for (let k = 0; k < 3; k++) {
      if (R() > 0.55) continue;
      const kind = R(), w = kind < 0.5 ? 0.7 : kind < 0.75 ? 1.1 : 1.3, x = 0.3 + w / 2 + R() * (len - w - 0.6);
      if (ops.concat(ghost).some((p) => p.y0 < 2.6 && x + w / 2 > p.x0 - 0.15 && x - w / 2 < p.x1 + 0.15)) continue;
      const idx = kind < 0.5 ? Math.floor(R() * 4) : kind < 0.75 ? 4 + Math.floor(R() * 2) : 6 + Math.floor(R() * 2);
      wallDecal(M, idx, x, kind < 0.5 ? 1.25 + R() * 0.3 : 0.7 + R() * 0.6, w, kind < 0.5 ? w * 1.1 : w * 0.8);
    }
  });
}
function plinthSeg(M, a, b, pl) {
  M.save().color(pl.tint).world(1);
  M.boxB(pl.mat, a, b, 0, pl.h, -0.02, 0.05, { skip: 'z' });
  M.boxB(pl.mat, a, b, pl.h, pl.h + 0.05, -0.02, 0.07, { bevel: 0.015, skip: 'z' });
  M.restore();
}

/* ---------- Toits ---------- */
/* Toit terrasse : acrotère avec couvertine, étanchéité et gravier, gargouilles, équipements */
function flatRoof(x0, x1, z0, z1, y, tint, R) {
  const M = DECOR, t = 0.25, ph = 0.7;
  M.save().color([0.74, 0.72, 0.68]).world(1);
  M.boxB(R() < 0.5 ? 'gravel' : 'concrete', x0 + t, x1 - t, y, y + 0.06, z0 + t, z1 - t, { skip: 'y' });
  M.color(tint).world(1);
  M.boxB('plaster', x0, x1, y, y + ph, z0, z0 + t, { skip: 'y' }); M.boxB('plaster', x0, x1, y, y + ph, z1 - t, z1, { skip: 'y' });
  M.boxB('plaster', x0, x0 + t, y, y + ph, z0 + t, z1 - t, { skip: 'yzZ' }); M.boxB('plaster', x1 - t, x1, y, y + ph, z0 + t, z1 - t, { skip: 'yzZ' });
  // couvertine en béton, légèrement débordante
  M.color([0.86, 0.84, 0.8]).local(1);
  M.boxB('concrete', x0 - 0.03, x1 + 0.03, y + ph, y + ph + 0.06, z0 - 0.03, z0 + t + 0.03, { bevel: 0.012 });
  M.boxB('concrete', x0 - 0.03, x1 + 0.03, y + ph, y + ph + 0.06, z1 - t - 0.03, z1 + 0.03, { bevel: 0.012 });
  M.boxB('concrete', x0 - 0.03, x0 + t + 0.03, y + ph, y + ph + 0.06, z0 + t + 0.03, z1 - t - 0.03, { bevel: 0.012 });
  M.boxB('concrete', x1 - t - 0.03, x1 + 0.03, y + ph, y + ph + 0.06, z0 + t + 0.03, z1 - t - 0.03, { bevel: 0.012 });
  // gargouilles
  M.color([0.6, 0.58, 0.54]); M.cls = 1;
  for (const [x, z, dx, dz] of [[x0 + (x1 - x0) * 0.25, z0, 0, -1], [x1 - (x1 - x0) * 0.25, z1, 0, 1]]) {
    M.save().move(x, y + 0.1, z).rotY(dz > 0 ? 0 : Math.PI); M.boxB('steel', -0.06, 0.06, 0, 0.08, -0.05, 0.35); M.restore(); void dx;
  }
  M.restore();
  // équipements
  const w = x1 - x0, d = z1 - z0, n = Math.floor((w * d) / 55) + 1;
  for (let i = 0; i < n; i++) {
    const px = x0 + 1.2 + R() * (w - 2.4), pz = z0 + 1.2 + R() * (d - 2.4), r = R(), ry = Math.round(R() * 4) * (Math.PI / 2);
    if (r < 0.32) M.place(PF.waterTank(), px, y + 0.06, pz, R() * TAU, { tint: { plastic: R.pick([[0.9, 0.9, 0.86], [0.2, 0.2, 0.22], [0.25, 0.4, 0.6]]) }, nocol: true });
    else if (r < 0.5) M.place(PF.acUnit(), px, y + 0.06, pz, ry, { nocol: true });
    else if (r < 0.68) M.place(PF.dish(), px, y + 0.06, pz, R() * TAU, { nocol: true, cls: 1 });
    else if (r < 0.8) M.place(PF.solarHeater(), px, y + 0.06, pz, ry, { nocol: true });
    else if (r < 0.9) M.place(PF.antenna(), px, y + 0.06, pz, R() * TAU, { nocol: true, cls: 1 });
    else if (w * d > 60) M.place(PF.roofHut(), px, y + 0.06, pz, ry, { nocol: true });
  }
}
/* Toit à deux pans en tuiles : débords, rives, faîtage en tuiles rondes, gouttières, pignons enduits */
function pitchedRoof(x0, x1, z0, z1, y, tint, R) {
  const M = DECOR, alongX = x1 - x0 >= z1 - z0, span = alongX ? z1 - z0 : x1 - x0, len = alongX ? x1 - x0 : z1 - z0;
  const rise = Math.min(3.2, span * 0.24), ov = 0.4, drop = ov * (rise / (span / 2)), T = [0.92 + R() * 0.08, 0.85 + R() * 0.1, 0.82 + R() * 0.1];
  // repère local : x le long du faîtage (0..len), z en travers (-span/2..span/2)
  M.save();
  if (alongX) M.move(x0, y, (z0 + z1) / 2); else M.move((x0 + x1) / 2, y, z1).rotY(Math.PI / 2);
  const hs = span / 2 + ov, yr = rise;
  M.color(T).world(1);
  for (const s of [1, -1]) {
    const nl = hyp(hs, yr + drop);
    M.quad('rooftiles', [-ov, -drop, s * hs], [len + ov, -drop, s * hs], [len + ov, yr, 0], [-ov, yr, 0], [0, hs / nl, (s * (yr + drop)) / nl]);
    // sous-face et bandeau d'égout
    M.color([0.5, 0.44, 0.38]).local(1);
    M.quad('paintwood', [-ov, -drop - 0.06, s * hs], [len + ov, -drop - 0.06, s * hs], [len + ov, yr - 0.1, 0], [-ov, yr - 0.1, 0], [0, -1, 0]);
    M.color([0.4, 0.3, 0.22]);
    M.save().move(len / 2, -drop - 0.2, s * (hs + 0.01)); M.box('paintwood', len + ov * 2, 0.16, 0.03); M.restore();
    // gouttière demi-ronde
    M.color([0.55, 0.52, 0.48]); M.cls = 1;
    M.save().move(-ov, -drop - 0.12, s * (hs + 0.08)).rotZ(-Math.PI / 2); M.cyl('steel', 0.065, len + ov * 2, 8, { a0: -Math.PI / 2, a1: Math.PI / 2, caps: '' }); M.restore();
    M.cls = 0; M.color(T).world(1);
  }
  // pignons
  M.color(tint).world(1);
  for (const [xx, dir] of [[0, -1], [len, 1]]) {
    M.quad('plaster', [xx, 0, -span / 2], [xx, 0, span / 2], [xx, yr - 0.05, 0.001], [xx, yr - 0.05, -0.001], [dir, 0, 0]);
  }
  // rives (planches de bord)
  M.color([0.42, 0.32, 0.24]).local(1);
  for (const xx of [-ov, len + ov]) for (const s of [1, -1]) {
    const dy = yr + drop + 0.07, dz = -s * hs, L = hyp(dy, dz);
    M.save().move(xx, (yr - drop) / 2 - 0.12, (s * hs) / 2).rotX(Math.atan2(-dy, dz)); M.box('paintwood', 0.05, 0.18, L); M.restore();
  }
  // faîtage en tuiles rondes et rang de tuiles d'égout
  M.color([0.82, 0.55, 0.42]).local(1);
  M.save().move(-ov, yr - 0.05, 0).rotZ(-Math.PI / 2); M.cyl('rooftiles', 0.13, len + ov * 2, 8, { a0: Math.PI / 2, a1: Math.PI * 1.5 }); M.restore();
  // tuiles d'égout : demi-tuiles rondes posées sur le pan, en bas de pente
  const al = Math.atan2(yr + drop, hs);
  M.cls = 1;
  for (const s of [1, -1]) for (let x = -ov + 0.11; x < len + ov - 0.05; x += 0.22) {
    M.save().move(x, -drop, s * hs).rotX(s * al).move(0, 0.02, s > 0 ? -0.34 : 0).rotX(Math.PI / 2); M.cyl('rooftiles', 0.085, 0.34, 6, { a0: Math.PI, a1: TAU, caps: '' }); M.restore();
  }
  M.cls = 0;
  // cheminée
  if (R() < 0.35) {
    const cx = len * (0.2 + R() * 0.6), cz = (R() - 0.5) * span * 0.3;
    M.color(tint).world(1); M.boxB('plaster', cx - 0.3, cx + 0.3, rise * 0.5, yr + 0.9, cz - 0.3, cz + 0.3);
    M.color([0.7, 0.66, 0.6]).local(1); M.boxB('concrete', cx - 0.36, cx + 0.36, yr + 0.9, yr + 0.98, cz - 0.36, cz + 0.36, { bevel: 0.01 });
  }
  M.restore();
  DECOR.occ(x0 - ov, x1 + ov, y, y + rise * 0.6, z0 - ov, z1 + ov, 1);
}

/* ---------- Bâtiment ---------- */
/* Bloc plein [x0,x1] x [z0,z1] de hauteur h. o : faces (côtés à façade détaillée), tint, key, style,
   skipGround, noGround, pitched */
function building(x0, x1, z0, z1, h, o = {}) {
  const R = rngOf(Math.round(x0 * 73 + z0 * 131 + h * 17) + 9001);
  const tint = o.tint || R.pick(PAL.plaster);
  let mat = o.key || 'plaster';
  if (mat === 'plaster' && R() < 0.3) mat = 'plaster2';
  const style = o.style || (R() < 0.45 ? 'maghreb' : 'colonial');
  DECOR.col(x0, x1, 0, h, z0, z1, 'concrete');
  const faces = o.faces || 'nsew';
  const kit = {
    mat, tint, style, rng: R, skipGround: o.skipGround, noGround: o.noGround,
    shutters: R() < 0.65 ? R.pick(PAL.shutter) : null, frame: R.pick(PAL.frame),
    plinth: { mat: R() < 0.6 ? 'ashlar' : 'stone', h: style === 'maghreb' ? 0.55 : 0.85, tint: PAL.stone },
    bands: style === 'colonial' && h > 5, cornice: true, quoins: style === 'colonial' && R() < 0.35, lintels: style === 'colonial' && R() < 0.5,
    round: /^plaster/.test(mat) ? 0.06 : 0, // angles arrondis de l'enduit (wallRound), la brique garde ses arêtes
  };
  for (const f of 'nsew') {
    if (faces.indexOf(f) >= 0) facadeKit(f, x0, x1, z0, z1, h, kit);
    else plainWall(f, x0, x1, z0, z1, h, mat, tint, kit.round);
  }
  const pitched = o.pitched !== undefined ? o.pitched : style === 'colonial' && R() < 0.6;
  if (pitched) pitchedRoof(x0, x1, z0, z1, h, tint, R); else flatRoof(x0, x1, z0, z1, h, tint, R);
}
function plainWall(face, x0, x1, z0, z1, h, mat, tint, round) {
  const F = facadeFrame(face, x0, x1, z0, z1);
  inFrame(F, (M) => { M.save().color(tint).world(1); M.aoFn = (x, y) => lerp(0.75, 1, smoothstep(0, 1.2, y)); wallPierced(M, mat, F.len, 0, h, [], { round }); M.restore(); });
}

/* ---------- Murs traversants (intérieurs praticables) ---------- */
/* Mur d'épaisseur t. axis 'x' : mur le long de X à z = fixed ; 'z' : le long de Z à x = fixed.
   ops : ouvertures [{ a0, a1, b0, b1 }] relatives au pied du mur (b0, b1 : hauteurs). Collisions identiques à
   l'ancienne version (segments pleins), décor : deux parements percés, tableaux, chambranles, arase (o.top === false : sans arase,
   quand une dalle ou un dallage posé au même niveau la recouvre ; les deux faces dans le même plan scintillaient). Chambranles des
   portes : o.frameTint, o.frameMat (bois peint par défaut, 'ashlar' : encadrement de pierre), o.frameW (largeur). */
function wallOpen(key, axis, fixed, t, a0, a1, y0, h, ops, o = {}) {
  ops = ops.slice().sort((p, q) => p.a0 - q.a0);
  const k = LEGACY_KEY[key] || key, kind = matKind(key);
  const col = (s0, s1, yb, yt) => {
    if (s1 - s0 < 0.01 || yt - yb < 0.01) return;
    if (axis === 'x') DECOR.col(s0, s1, yb, yt, fixed - t / 2, fixed + t / 2, o.m || kind);
    else DECOR.col(fixed - t / 2, fixed + t / 2, yb, yt, s0, s1, o.m || kind);
  };
  let cur = a0;
  for (const op of ops) {
    col(cur, op.a0, y0, y0 + h);
    if (op.b0 > 0) col(op.a0, op.a1, y0, y0 + op.b0);
    if (op.b1 < h) col(op.a0, op.a1, y0 + op.b1, y0 + h);
    cur = op.a1;
  }
  col(cur, a1, y0, y0 + h);
  // décor : deux parements dans leurs repères (x le long du mur vu de chaque côté)
  const tint = o.tint || [1, 1, 1];
  for (const side of [1, -1]) {
    const M = DECOR; M.save();
    // repère : origine au début du mur (vu de ce côté), z vers l'extérieur de ce parement
    if (axis === 'x') { if (side > 0) M.move(a0, 0, fixed + t / 2); else M.move(a1, 0, fixed - t / 2).rotY(Math.PI); }
    else { if (side > 0) M.move(fixed + t / 2, 0, a1).rotY(Math.PI / 2); else M.move(fixed - t / 2, 0, a0).rotY(-Math.PI / 2); }
    const L = a1 - a0, map = (a) => (axis === 'x' ? (side > 0 ? a - a0 : a1 - a) : (side > 0 ? a1 - a : a - a0));
    const lops = ops.map((p) => { const u0 = map(p.a0), u1 = map(p.a1); return { x0: Math.min(u0, u1), x1: Math.max(u0, u1), y0: y0 + p.b0, y1: y0 + Math.min(p.b1, h), rise: p.arch ? Math.min(p.arch, (p.a1 - p.a0) / 2) : 0 }; });
    M.color(tint).world(1);
    M.aoFn = (x, y) => lerp(0.72, 1, smoothstep(y0, y0 + 1.2, y));
    // embrasures sur la moitié de l'épaisseur de chaque côté (les deux moitiés se rejoignent au milieu)
    wallPierced(M, k, L, y0, h, lops.map((p) => ({ ...p, depth: t / 2 })), { floorY: o.floorY !== undefined ? o.floorY : y0, aoFn: M.aoFn });
    M.aoFn = null;
    if (o.frames !== false) for (const p of lops) if (p.y1 - p.y0 > 1.6 && p.y0 <= y0 + 0.05) casing(M, p, o.frameTint || [0.5, 0.42, 0.34], o.frameMat || 'paintwood', o.frameW || 0.09);
    // o.dress(M, L, lops, side) : habillage de chaque parement dans son repère (soubassement, corniche, appliques...), après les embrasures
    if (o.dress) { M.save(); o.dress(M, L, lops, side); M.restore(); }
    if (side > 0) { // arase du mur et extrémités
      M.color(tint).world(1);
      if (o.top !== false) M.quad(k, [0, y0 + h, 0], [L, y0 + h, 0], [L, y0 + h, -t], [0, y0 + h, -t], [0, 1, 0]);
      M.quad(k, [0, y0, 0], [0, y0 + h, 0], [0, y0 + h, -t], [0, y0, -t], [-1, 0, 0]);
      M.quad(k, [L, y0, 0], [L, y0 + h, 0], [L, y0 + h, -t], [L, y0, -t], [1, 0, 0]);
    }
    M.restore();
  }
}

/* ---------- Arrière-plan ---------- */
/* Immeuble lointain : volume enduit, façades à fenêtres en texture (farfacade, une travée par tuile), toit terrasse
   simplifié ; aucune collision. */
function farBuilding(cx, cz, w, d, h, tint, R) {
  const M = DECOR, bw = 3.1, fh = 3.2;
  M.save().move(cx, 0, cz).color(tint);
  for (const [face, x0, x1, z0, z1] of [['s', -w / 2, w / 2, -d / 2, d / 2], ['n', -w / 2, w / 2, -d / 2, d / 2], ['e', -w / 2, w / 2, -d / 2, d / 2], ['w', -w / 2, w / 2, -d / 2, d / 2]]) {
    const F = facadeFrame(face, x0, x1, z0, z1), nb = Math.max(1, Math.round(F.len / bw)), sx = F.len / nb, nf = Math.max(1, Math.floor(h / fh));
    M.save().move(F.ox, 0, F.oz).rotY(F.rot);
    const B = M.buf('farfacade', F.len / 2, h / 2, 0);
    const q = [M.v(B, 0, 0, 0, 0, 0, 1, 0, 0), M.v(B, F.len, 0, 0, 0, 0, 1, nb, 0), M.v(B, F.len, nf * fh, 0, 0, 0, 1, nb, nf), M.v(B, 0, nf * fh, 0, 0, 0, 1, 0, nf)];
    M.quadI(B, q[0], q[1], q[2], q[3]);
    if (h > nf * fh + 0.05) M.quad('plaster', [0, nf * fh, 0], [F.len, nf * fh, 0], [F.len, h, 0], [0, h, 0], [0, 0, 1]);
    M.restore(); void sx;
  }
  M.world(1); M.boxB('concrete', -w / 2, w / 2, h, h + 0.05, -d / 2, d / 2, { skip: 'y' });
  M.local(1); M.boxB('plaster', -w / 2, w / 2, h, h + 0.6, -d / 2, -d / 2 + 0.2); M.boxB('plaster', -w / 2, w / 2, h, h + 0.6, d / 2 - 0.2, d / 2);
  if (R() < 0.5) M.place(PF.waterTank(), (R() - 0.5) * w * 0.5, h + 0.05, (R() - 0.5) * d * 0.5, 0, { tint: { plastic: [0.9, 0.9, 0.86] }, nocol: true });
  M.restore();
}
/* Minaret : fût carré, balcon sur encorbellement, lanterne, dôme et croissant */
function minaret(x, z, h = 30, o = {}) {
  const M = DECOR;
  if (o.rond) { minaretRond(x, z, h); return; }
  if (o.col) { WORLD.col({ x0: x - 2.2, x1: x + 2.2, y0: 0, y1: h * 0.72 + 0.6, z0: z - 2.2, z1: z + 2.2 }, 'concrete'); WORLD.col({ x0: x - 1.6, x1: x + 1.6, y0: h * 0.72 + 0.6, y1: h * 0.88, z0: z - 1.6, z1: z + 1.6 }, 'concrete'); }
  M.save().move(x, 0, z).color([0.95, 0.9, 0.8]).world(1);
  M.boxB('plaster', -2.2, 2.2, 0, h * 0.72, -2.2, 2.2);
  M.local(1); M.color([0.85, 0.78, 0.66]);
  for (let y = 6; y < h * 0.7; y += 6) M.boxB('ashlar', -2.28, 2.28, y, y + 0.3, -2.28, 2.28);
  M.boxB('ashlar', -2.9, 2.9, h * 0.72, h * 0.72 + 0.6, -2.9, 2.9, { bevel: 0.1 });
  M.color([0.95, 0.9, 0.8]).world(1); M.boxB('plaster', -1.6, 1.6, h * 0.72 + 0.6, h * 0.88, -1.6, 1.6);
  M.local(1); M.color([0.3, 0.55, 0.5]);
  M.save().move(0, h * 0.88, 0); M.lathe('paint', [[0, 0], [1.7, 0], [1.75, 0.2], [1.6, 1.2], [1.1, 2.3], [0.4, 2.9], [0, 3.0]], 16); M.restore();
  M.color([0.85, 0.7, 0.3]); M.save().move(0, h * 0.88 + 3, 0); M.cyl('steel', 0.06, 1.4, 6); M.restore();
  M.restore();
}
/* Minaret rond « en crayon » : fût cylindrique à bagues, balcon sur consoles, lanterne, flèche conique de plomb (silhouette bien distincte
   du minaret carré à coupole verte). Collision du fût et de la lanterne : il arrête les tirs. */
function minaretRond(x, z, h) {
  const M = DECOR, r = 1.9, b = h * 0.68, l = h * 0.8;
  M.save().move(x, 0, z).color([0.96, 0.93, 0.86]).local(1);
  M.lathe('plaster', [[0, 0], [r + 0.3, 0], [r + 0.3, 2.4], [r, 2.6], [r * 0.92, b], [0, b]], 16, { sharp: 0.5 });
  M.color([0.85, 0.78, 0.66]);
  for (let y = 6; y < b - 1; y += 5) { M.save().move(0, y, 0); M.lathe('ashlar', [[r * 0.98 - 0.02, 0], [r * 0.98 + 0.08, 0], [r * 0.98 + 0.08, 0.3], [r * 0.98 - 0.02, 0.3]], 16); M.restore(); }
  M.save().move(0, b, 0); M.lathe('ashlar', [[0, -0.9], [r * 0.95, -0.9], [r + 0.7, 0], [r + 0.75, 0.2], [0, 0.2]], 16, { sharp: 0.5 }); M.restore();
  M.color([0.2, 0.2, 0.2]); M.save().move(0, b + 0.2, 0); M.lathe('steel', [[r + 0.66, 0], [r + 0.72, 0], [r + 0.72, 1.0], [r + 0.66, 1.0]], 24); M.restore();
  M.color([0.96, 0.93, 0.86]); M.save().move(0, b + 0.2, 0); M.lathe('plaster', [[0, 0], [r * 0.7, 0], [r * 0.7, l - b - 0.2], [0, l - b - 0.2]], 12); M.restore();
  M.color([0.05, 0.05, 0.05]); for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU; M.save().move(Math.cos(a) * r * 0.7, b + 1.2, Math.sin(a) * r * 0.7).rotY(-a + Math.PI / 2); M.boxB('dark', -0.25, 0.25, 0, 1.4, -0.01, 0.01); M.restore(); }
  M.color([0.42, 0.44, 0.48]); M.save().move(0, l, 0); M.lathe('paint', [[0, 0], [r * 0.8, 0], [r * 0.75, 0.2], [0.05, h - l - 1.2], [0, h - l - 1.1]], 16, { sharp: 0.8 }); M.restore();
  M.color([0.85, 0.7, 0.3]); M.save().move(0, h - 1.15, 0); M.cyl('steel', 0.05, 1.3, 6); M.save().move(0, 0.6, 0); M.lathe('steel', [[0, -0.12], [0.12, 0], [0, 0.12]], 8); M.restore(); M.restore();
  M.restore();
  WORLD.col({ x0: x - r, x1: x + r, y0: 0, y1: b, z0: z - r, z1: z + r }, 'concrete');
  WORLD.col({ x0: x - r * 0.7, x1: x + r * 0.7, y0: b, y1: l, z0: z - r * 0.7, z1: z + r * 0.7 }, 'concrete');
}
/* Maison à coupole blanche */
function domeHouse(x, z, s = 1) {
  const M = DECOR;
  M.save().move(x, 0, z).color([0.96, 0.94, 0.9]).world(1);
  M.boxB('plaster', -7 * s, 7 * s, 0, 7 * s, -7 * s, 7 * s);
  M.local(1); M.save().move(0, 7 * s, 0); M.lathe('plaster', [[0, 0], [5.5 * s, 0], [5.5 * s, 0.8 * s], [5.2 * s, 2.5 * s], [4.2 * s, 4.4 * s], [2.4 * s, 5.8 * s], [0, 6.4 * s]], 20); M.restore();
  M.restore();
}
/* Dunes et collines au-delà de la ville (anneau de relief bruité, sable) */
function dunes(r0 = 150, r1 = 250) {
  const M = DECOR, N = makeNoise(99), nu = 72, nv = 10;
  WORLD.force = 'far';
  M.save().color([0.95, 0.85, 0.75]).local(1); M.cls = 1;
  M.surf('sand', nu, nv, (u, v) => {
    const a = u * TAU, r = lerp(r0, r1, v), x = Math.cos(a) * r, z = Math.sin(a) * r;
    const n = N.fbm(u, v, 12, 4, 4), ridge = 1 - Math.abs(N.fbm(u + 0.37, v, 6, 4, 3) * 2 - 1);
    return [x, -1 + smoothstep(0, 0.35, v) * (n * 22 + ridge * 18) * (0.4 + v * 0.8), z];
  }, { closeU: true, uL: 300, vL: 30 });
  M.restore(); WORLD.force = null;
}

}catch(e){HOOKS.missing['02d-archi.js']=String(e&&e.message||e)}
/* ===== 02f-props.js ===== */
try{
/* ==========================================================================
   ACCESSOIRES : prefabs réutilisables (construits une fois, estampillés partout). Chacun est modélisé en
   coordonnées locales, posé sur y = 0, face principale vers +z ; ses collisions éventuelles sont décrites
   dans le prefab. Les prefabs « teintables » reçoivent la couleur de l'instance (option tint de M.put).
   Mobilier urbain, objets de chantier et d'entrepôt, équipements de toit.
   ========================================================================== */

var _pm = new THREE.Matrix4();
/* Repère de base : colonnes (ex, ey, ez), utile pour extruder un profil dans un autre plan */
function basis(ex, ey, ez) { return _pm.clone().makeBasis(new V3(...ex), new V3(...ey), new V3(...ez)); }

/* ---------- Caisses, palettes, fûts ---------- */
/* Caisse en planches : panneaux, tasseaux sur les arêtes, écharpes en diagonale */
PF.crate = (s = 1.1) => prefab('crate' + s.toFixed(2), (M, P) => {
  P.tintable = ['crate'];
  const h = s / 2, b = Math.min(0.08, s * 0.08), t = 0.022;
  M.local(1); M.uvS = s / TEXSCALE.crate;
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0, 0.35, y));
  M.save().move(0, t, 0); M.box('crate', s - t * 2, s - t * 2, s - t * 2); M.restore();
  M.uvS = 1;
  // montants d'angle chanfreinés (ils portent l'ombre) ; traverses et écharpes sans ombre portée
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.boxB('crate', sx > 0 ? h - b : -h, sx > 0 ? h : -h + b, 0, s, sz > 0 ? h - b : -h, sz > 0 ? h : -h + b, { bevel: 0.01 });
  M.cls = 1;
  for (const y of [0, s - b]) for (const sz of [-1, 1]) { M.boxB('crate', -h + b, h - b, y, y + b, sz > 0 ? h - b : -h, sz > 0 ? h : -h + b, { skip: 'yY' }); M.boxB('crate', sz > 0 ? h - b : -h, sz > 0 ? h : -h + b, y, y + b, -h + b, h - b, { skip: 'yY' }); }
  // écharpes sur les quatre côtés
  const L = hyp(s - 2 * b, s - 2 * b), ang = Math.atan2(s - 2 * b, s - 2 * b);
  for (const [ry, off] of [[0, h], [Math.PI, h], [Math.PI / 2, h], [-Math.PI / 2, h]]) {
    M.save().rotY(ry).move(0, h, off - t / 2).rotZ(ang).move(0, -b * 0.4, 0); M.box('crate', L - 0.05, b * 0.8, t * 1.4, { skip: 'z' }); M.restore();
  }
  M.cls = 0;
  M.col(-h, h, 0, s, -h, h, 'wood');
});
/* Palette en bois (1,2 x 0,8) */
PF.pallet = () => prefab('pallet', (M) => {
  M.color([0.85, 0.75, 0.6]).local(1);
  for (const x of [-0.55, 0, 0.55]) M.boxB('crate', x - 0.05, x + 0.05, 0, 0.1, -0.4, 0.4);
  for (let i = 0; i < 7; i++) { const z = -0.4 + 0.06 + (i * (0.8 - 0.12)) / 6; M.boxB('crate', -0.6, 0.6, 0.1, 0.122, z - 0.05, z + 0.05); }
  for (const z of [-0.36, 0, 0.36]) M.boxB('crate', -0.6, 0.6, 0.0, 0.022, z - 0.05, z + 0.05); // planches du dessous posées sur le sol, pas dedans (leur dessus scintillait avec lui)
});
/* Fût métallique de 200 L : cerclages de roulement, bondes */
PF.barrel = () => prefab('barrel', (M, P) => {
  P.tintable = ['paint'];
  M.local(1);
  const pr = [[0, 0.005], [0.27, 0.005], [0.287, 0.012], [0.287, 0.035], [0.279, 0.045], [0.279, 0.285], [0.29, 0.295], [0.29, 0.315], [0.279, 0.325], [0.279, 0.555], [0.29, 0.565], [0.29, 0.585], [0.279, 0.595], [0.279, 0.835], [0.287, 0.845], [0.287, 0.875], [0.272, 0.882], [0.262, 0.866], [0, 0.866]];
  M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(0, 0.3, y));
  M.lathe('paint', pr, 18, { sharp: 0.9, uR: 0.29 });
  M.aoFn = null; M.color([0.5, 0.5, 0.48]);
  for (const [x, r] of [[0.16, 0.035], [-0.14, 0.025]]) { M.save().move(x, 0.866, 0.05); M.cyl('steel', r, 0.018, 8); M.restore(); }
  M.col(-0.3, 0.3, 0, 0.9, -0.3, 0.3, 'metal');
});
/* Jerrican (20 L, modèle militaire d'après photos) : caisse à bords arrondis, X emboutis sur les flancs, cordon de soudure tout autour,
   trois poignées en travers du dessus, bec et bouchon à levier sur l'avant */
PF.jerrycan = () => prefab('jerrycan', (M, P) => {
  P.tintable = ['paint'];
  M.local(1);
  M.boxB('paint', -0.08, 0.08, 0, 0.44, -0.17, 0.17, { bevel: 0.025 });
  M.boxB('paint', -0.007, 0.007, -0.002, 0.446, -0.176, 0.176, { bevel: 0.004 }); // cordon de soudure
  const a = Math.atan2(0.13, 0.17); // diagonales du flanc, à 4 cm des bords
  for (const sd of [-1, 1]) for (const r of [a, -a]) { M.save().move(sd * 0.08, 0.22, 0).rotX(r); M.boxB('paint', -0.005, 0.005, -0.19, 0.19, -0.016, 0.016, { bevel: 0.004 }); M.restore(); }
  M.color([0.82, 0.82, 0.8]);
  for (const z of [-0.075, 0, 0.075]) M.tube('paint', 0.009, [[-0.055, 0.438, z], [-0.05, 0.488, z], [0.05, 0.488, z], [0.055, 0.438, z]], 5);
  M.save().move(0, 0.43, 0.135).rotX(0.35); M.cyl('paint', 0.024, 0.045, 10); M.color([0.3, 0.3, 0.28]); M.save().move(0, 0.045, 0); M.cyl('steel', 0.028, 0.02, 10); M.restore(); M.boxB('steel', -0.008, 0.008, 0.02, 0.07, -0.06, -0.02); M.restore();
});
/* Bouteille de gaz butane (bleue ou orange) */
PF.gasBottle = () => prefab('gasBottle', (M, P) => {
  P.tintable = ['paint'];
  M.local(1);
  M.lathe('paint', [[0, 0], [0.12, 0], [0.145, 0.03], [0.15, 0.08], [0.15, 0.42], [0.13, 0.5], [0.07, 0.55], [0, 0.56]], 14, { uR: 0.15 });
  M.color([0.55, 0.55, 0.52]);
  M.lathe('steel', [[0.035, 0.55], [0.035, 0.62], [0.09, 0.64], [0.09, 0.66], [0.03, 0.66], [0.03, 0.64]], 10, { sharp: 0.3 });
});
/* Carton de déménagement */
PF.cardboard = (w = 0.5, h = 0.4, d = 0.4) => prefab(`card${w}${h}${d}`, (M) => {
  M.color([1, 1, 1]).local(1);
  M.boxB('cardboard', -w / 2, w / 2, 0, h, -d / 2, d / 2, { bevel: 0.008 });
  M.color([0.85, 0.75, 0.55]); M.boxB('plastic', -0.035, 0.035, h, h + 0.002, -d / 2 - 0.002, d / 2 + 0.002);
});
/* Sac-poubelle */
PF.trashBag = () => prefab('trashBag', (M) => {
  M.color([0.05, 0.05, 0.055]);
  M.surf('plastic', 10, 7, (u, v) => {
    const a = u * TAU, ph = (v - 0.5) * Math.PI, r = Math.cos(ph) * (0.24 + 0.03 * Math.sin(a * 3 + v * 5)), y = (Math.sin(ph) * 0.5 + 0.5) * 0.5;
    const pinch = v > 0.85 ? 1 - (v - 0.85) * 4 : 1;
    return [Math.cos(a) * r * pinch, y + (v > 0.9 ? (v - 0.9) * 0.8 : 0), Math.sin(a) * r * pinch * 0.85];
  }, { closeU: true, flipN: true });
});
/* Parpaings empilés */
PF.blocks = () => prefab('blocks', (M) => {
  M.color([0.82, 0.8, 0.76]).local(1);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - (r === 2 ? 1 : 0); i++) {
    const x = -0.42 + i * 0.42 + (r % 2) * 0.21 * 0; M.boxB('concrete', x - 0.2, x + 0.2, r * 0.2, r * 0.2 + 0.195, -0.1, 0.1, { bevel: 0.006 });
  }
  M.col(-0.62, 0.62, 0, 0.6, -0.1, 0.1, 'concrete');
});
/* Touret de câble : deux flasques de planches serrées par des tiges filetées, moyeu percé, câble enroulé en spires, bout libre */
PF.reel = () => prefab('reel', (M) => {
  M.color([0.8, 0.66, 0.46]).local(1);
  for (const x of [-0.35, 0.35]) {
    M.save().move(x, 0.55, 0).rotZ(Math.PI / 2).move(0, -0.035, 0); M.cyl('crate', 0.55, 0.07, 28, { uR: 0.5 }); M.restore();
    M.color([0.25, 0.22, 0.2]); M.save().move(x + Math.sign(x) * 0.036, 0.55, 0).rotZ(Math.PI / 2).move(0, -0.004, 0); M.cyl('steel', 0.09, 0.008, 16); M.restore();
    M.color([0.05, 0.05, 0.05]); M.save().move(x + Math.sign(x) * 0.041, 0.55, 0).rotZ(Math.PI / 2).move(0, -0.002, 0); M.cyl('dark', 0.04, 0.004, 12); M.restore();
    M.color([0.8, 0.66, 0.46]);
  }
  M.color([0.3, 0.28, 0.25]); M.cls = 2;
  for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU, y = 0.55 + Math.sin(a) * 0.2, z = Math.cos(a) * 0.2; M.tube('steel', 0.012, [[-0.4, y, z], [0.4, y, z]], 5); }
  M.cls = 0; M.color([0.12, 0.12, 0.12]);
  // spires : profil ondulé tourné autour de l'axe
  const prof = []; for (let i = 0; i <= 20; i++) { const y = lerp(-0.31, 0.31, i / 20); prof.push([0.36 + 0.012 * Math.abs(Math.sin((i / 20) * Math.PI * 10)), y]); }
  M.save().move(0, 0.55, 0).rotZ(-Math.PI / 2); M.lathe('rubber', prof, 24, { uR: 0.36 }); M.restore();
  M.tube('rubber', 0.022, [[0.2, 0.55 + 0.37, 0.05], [0.25, 0.72, 0.42], [0.3, 0.12, 0.62], [0.4, 0.02, 0.9]], 6);
  M.col(-0.4, 0.4, 0, 1.1, -0.55, 0.55, 'wood');
});

/* ---------- Défenses : sacs de sable, murets jersey ---------- */
/* Sac de sable : coussin de jute rempli, dessous aplati par le poids, dessus bombé, flancs gonflés ; le bout ouvert (+x) est replié et
   noué (la toile se resserre, deux oreilles, le lien), l'autre bout cousu se pince à peine. Il tient dans sa boîte de collision
   (2L x 2H x 2W) : le corps s'arrête 2,5 cm avant le bout, que le nœud occupe. nu x nv : finesse de la toile (un mur en compte des
   centaines, et chacun est dessiné aussi dans les ombres) */
function sandbagShape(M, L, Wd, H, nu = 10, nv = 6) {
  const Lb = L - 0.025;
  M.surf('burlap', nu, nv, (u, v) => {
    const th = u * TAU, ph = (v - 0.5) * Math.PI, c = Math.cos(ph), sp = Math.sin(ph), cx = Math.cos(th) * c, cz = Math.sin(th) * c;
    const x = Math.sign(cx) * Math.pow(Math.abs(cx), 0.3) * Lb, ex = Math.abs(x) / Lb, tied = x > 0;
    const pinch = 1 - (tied ? 0.5 : 0.22) * Math.pow(ex, 4);
    const y = H + (sp >= 0 ? Math.pow(sp, 0.55) * H * pinch : -Math.pow(-sp, 0.22) * H * (1 - 0.1 * Math.pow(ex, 4)));
    const z = Math.sign(cz) * Math.pow(Math.abs(cz), 0.38) * Wd * (0.9 + 0.1 * pinch) * (tied ? 1 - 0.3 * Math.pow(ex, 6) : 1) * (1 - 0.06 * (1 - Math.abs(sp)) * ex);
    return [x, y, z];
  }, { closeU: true, flipN: true, uL: 2.8, vL: 1.5, pole: (v) => [0, v < 0.5 ? -1 : 1, 0], ao: (u, v) => (v < 0.28 ? 0.62 : 1) });
  // bout replié et noué : le col de toile, deux oreilles, le lien
  M.save().move(Lb - 0.02, H * 1.05, 0).rotZ(-Math.PI / 2); M.cyl('burlap', H * 0.38, 0.045, 5, { r1: H * 0.22, caps: 't' }); M.restore();
  for (const sd of [-1, 1]) { M.save().move(Lb - 0.03, H * 1.02, sd * Wd * 0.55).rotY(sd * 0.5).rotZ(-1.2); M.cyl('burlap', 0.022, 0.06, 3, { r1: 0.006, caps: '' }); M.restore(); }
  M.color([0.42, 0.34, 0.24]); M.save().move(Lb + 0.008, H * 1.05, 0).rotZ(Math.PI / 2); M.cyl('burlap', H * 0.27, 0.014, 5, { caps: '' }); M.restore();
}
/* Sac de sable bas du décor (58 x 15 x 33 cm) */
PF.sandbag = () => prefab('sandbag', (M, P) => { P.tintable = ['burlap']; M.local(1); sandbagShape(M, 0.29, 0.165, 0.075); });
/* Sac de sable des murs (physique) : plus épais que celui du décor (22 x 60 x 40 cm), pour que les rangs se touchent ; sa collision
   est la boîte qu'il occupe et suit le sac quand il tombe */
PF.sandbagFat = () => prefab('sandbagFat', (M, P) => {
  P.tintable = ['burlap']; M.local(1); sandbagShape(M, 0.3, 0.2, 0.11);
  M.col(-0.29, 0.29, 0, 0.22, -0.19, 0.19, 'dirt');
});
/* Demi-sac (30 x 22 x 40 cm) : sac à moitié rempli, replié, qui ferme le bout d'un rang décalé */
PF.sandbagHalf = () => prefab('sandbagHalf', (M, P) => {
  P.tintable = ['burlap']; M.local(1); sandbagShape(M, 0.15, 0.2, 0.11, 8, 5);
  M.col(-0.14, 0.14, 0, 0.22, -0.19, 0.19, 'dirt');
});
/* ---------- Murs de sacs de sable : un prop physique par sac (voir « Props physiques » du README) ----------
   Appareil à joints décalés : chaque sac repose à cheval sur deux sacs du rang du dessous. Un rang sur deux est décalé d'un demi-sac ; ses deux
   bouts sont fermés par un demi-sac (sandbagHalves), sinon le sac au bout du rang du dessus dépasserait d'un demi-sac dans le vide et ne
   tiendrait pas. Variante en pyramide (taper) : chaque rang est en retrait d'un demi-sac à chaque bout sur celui du dessous. */
/* Teintes de base (sRGB) : jute naturelle, jute claire du désert, toile kaki et olive, polypropylène blanc ; chaque sac s'en écarte un peu */
var SANDBAG_TINT = { jute: [0.88, 0.82, 0.72], sable: [0.9, 0.82, 0.68], kaki: [0.58, 0.58, 0.44], olive: [0.45, 0.48, 0.35], blanc: [0.92, 0.92, 0.9] };
function sandbagTint(c, R) { const k = 0.92 + R() * 0.1; return [c[0] * k * (0.97 + R() * 0.05), c[1] * k, c[2] * k * (0.96 + R() * 0.06)]; }
/* Les deux demi-sacs qui ferment un rang décalé d'un mur droit : centre (cx, cz), longueur len, sens (dx, dz) (le bout 0 est du côté -, comme
   le premier sac plein), sol y(x, z), échelle k, bout noué vers l'extérieur. skip : [bout 0, bout 1] à ne pas poser (usure), gone(x, z, type)
   est appelé pour chacun. Teinte tirée de R, un tirage propre au mur, pour ne pas décaler la suite du décor */
function sandbagHalves(cx, cz, len, dx, dz, y, k, c, R, skip, gone) {
  for (const e of [0, 1]) {
    const sd = e ? 1 : -1, a = sd * (len / 2 - 0.15 * k), x = cx + dx * a, z = cz + dz * a, tint = sandbagTint(c, R);
    if (skip && skip[e]) { if (gone) gone(x, z, 'sandbagHalf'); continue; }
    DECOR.dyn('sandbagHalf', x, y(x, z), z, Math.atan2(-sd * dz, sd * dx), { s: k, tint });
  }
}
/* Usure d'un mur : le rang du haut n'est jamais complet. Ce sont surtout ses bouts qui partent (un coin, ou les deux) ; parfois aussi un sac du
   milieu d'un long mur, jamais à côté d'un sac déjà parti. Sous un bout parti, le demi-sac du rang décalé du dessous part parfois (coin écorné en
   escalier). Rien ne reposait sur ce qui manque : le reste du mur tient. cnt : sacs pleins du rang du haut ; topOdd : rang du haut décalé
   (ses bouts sont des demi-sacs) ; lowOdd : rang du dessous décalé ; W : tirage propre au mur. Rend { gone : sacs pleins du haut partis
   (Set), half : demi-sacs du haut partis [bout 0, bout 1], low : demi-sacs du rang du dessous partis } */
function sandbagWear(cnt, topOdd, lowOdd, W) {
  const gone = new Set(), half = [false, false], low = [false, false], ends = [W() < 0.65, W() < 0.65];
  if (!ends[0] && !ends[1]) ends[W() < 0.5 ? 0 : 1] = true;
  for (const e of [0, 1]) {
    if (!ends[e]) continue;
    if (topOdd) { half[e] = true; if (cnt > 2 && W() < 0.45) gone.add(e ? cnt - 1 : 0); }
    else { gone.add(e ? cnt - 1 : 0); if (lowOdd && W() < 0.4) low[e] = true; }
  }
  if (cnt >= 6 && W() < 0.3) { const i = 1 + Math.floor(W() * (cnt - 2)); if (![i - 1, i, i + 1].some((q) => gone.has(q))) gone.add(i); }
  return { gone, half, low };
}
/* Sac tombé du haut d'un mur : couché à plat au pied du mur, devant ou derrière (dx, dz : sens du mur, e : demi-épaisseur), un peu de travers,
   là où le sol est libre (aucune boîte à hauteur de sac, aucun autre sac tombé) ; une fois sur quatre, ou sans place libre, il n'est pas posé
   (il a roulé plus loin). type : 'sandbag' ou 'sandbagHalf' */
function sandbagFallen(x, z, dx, dz, e, rot, ground, k, c, W, list, type = 'sandbag') {
  const s0 = W() < 0.5 ? -1 : 1, nx = -dz, nz = dx;
  if (W() < 0.25) return;
  for (const sd of [s0, -s0]) {
    const d = e + 0.42 + W() * 0.2, t = (W() - 0.5) * 0.4, px = x + nx * sd * d + dx * t, pz = z + nz * sd * d + dz * t, y = ground(px, pz);
    if (list.some(([qx, qz]) => hyp(qx - px, qz - pz) < 0.8)) continue;
    if (COL.some((b) => !b.ray && b.y1 > y + 0.03 && b.y0 < y + 0.25 && px + 0.34 > b.x0 && px - 0.34 < b.x1 && pz + 0.34 > b.z0 && pz - 0.34 < b.z1)) continue;
    list.push([px, pz]);
    DECOR.dyn(type, px, y, pz, rot + (W() - 0.5) * 1.4, { s: k, tint: sandbagTint(c, W) });
    return;
  }
}
/* Mur droit centré en (cx, cz), long de len, orienté selon rot (comme DECOR.place : à rot = 0 le mur suit x). o : rows (rangs, 4), deep (1 ou
   2 sacs d'épaisseur ; à 2, le rang du haut n'en a qu'un, au milieu, posé sur les deux), taper (pyramide), color (clé de SANDBAG_TINT ou
   [r, g, b]), y (sol, ou ground(x, z) pour un relief), R (tirage ; par défaut SR.rng), wear (faux : rang du haut complet, sans sac tombé) */
function sandbagWall(cx, cz, len, rot = 0, o = {}) {
  const R = o.R || SR.rng, c = Array.isArray(o.color) ? o.color : SANDBAG_TINT[o.color || 'jute'], rows = o.rows || 4, deep = o.deep || 1;
  const n = Math.max(1, Math.round(len / 0.6)), step = len / n, k = step / 0.6, dx = Math.cos(rot), dz = -Math.sin(rot), ground = o.ground || (() => o.y || 0);
  const W = rngOf(Math.round(cx * 131 + cz * 17 + len * 7 + 77)), fallen = [], top = rows - 1, wear = o.wear !== false && !o.taper && rows > 1;
  // une usure par ligne (deux lignes côte à côte quand le mur est double) : celle du rang du haut et, sous lui, du rang décalé
  const wears = new Map(), wearOf = (t) => { if (!wears.has(t)) wears.set(t, sandbagWear(n - (top % 2), top % 2 === 1, (top - 1) % 2 === 1, W)); return wears.get(t); };
  const fall = (x, z, type) => sandbagFallen(x, z, dx, dz, deep > 1 ? 0.4 * k : 0.2 * k, rot, ground, k, c, W, fallen, type);
  for (let r = 0; r < rows; r++) {
    const odd = r % 2, inset = o.taper ? r * 0.5 : odd * 0.5, cnt = n - (o.taper ? r : odd), lines = deep > 1 && !(r === top && rows > 2) ? [-0.2 * k, 0.2 * k] : [0];
    if (cnt < 1) break;
    for (const t of lines) {
      const wr = wear && (r === top || r === top - 1) ? wearOf(r === top ? t : deep > 1 && rows > 2 ? 0 : t) : null;
      for (let i = 0; i < cnt; i++) {
        const a = -len / 2 + step * (i + 0.5 + inset), x = cx + dx * a - dz * t, z = cz + dz * a + dx * t, ry = rot + (R() - 0.5) * 0.06, tint = sandbagTint(c, R);
        if (wr && r === top && wr.gone.has(i)) { fall(x, z); continue; }
        DECOR.dyn('sandbag', x, ground(x, z) + r * 0.22 * k, z, ry, { s: k, tint });
      }
      if (odd && !o.taper) sandbagHalves(cx - dz * t, cz + dx * t, len, dx, dz, (x, z) => ground(x, z) + r * 0.22 * k, k, c, R, wr ? (r === top ? wr.half : wr.low) : null, fall);
    }
  }
}
/* Mur en arc de cercle : centre (cx, cz), rayon r (ligne médiane du mur), de l'angle a0 à a1 (point (cx + r cos a, cz + r sin a)) ; les sacs
   suivent la courbe, un rang sur deux décalé d'un demi-sac et fermé par deux demi-sacs. Leur longueur est réglée sur le bord intérieur de la
   courbe, où ils se touchent sans s'entrer (au bord extérieur, les joints s'ouvrent un peu). o : rows, color, ground, R, wear */
function sandbagArc(cx, cz, r, a0, a1, o = {}) {
  const R = o.R || SR.rng, c = Array.isArray(o.color) ? o.color : SANDBAG_TINT[o.color || 'jute'], rows = o.rows || 4, ground = o.ground || (() => o.y || 0);
  const n = Math.max(1, Math.round(Math.abs(a1 - a0) * r / 0.6)), da = (a1 - a0) / n, k = Math.abs(da) * (r - 0.2) / 0.6;
  const put = (t, a, y, half) => {
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, ry = Math.atan2(-Math.cos(a), -Math.sin(a));
    DECOR.dyn(half ? 'sandbagHalf' : 'sandbag', x, ground(x, z) + y, z, ry + (half ? ((t < 0) === (da > 0) ? Math.PI : 0) : (R() - 0.5) * 0.04), { s: k, tint: sandbagTint(c, R) }); // demi-sac : bout noué vers l'extérieur
  };
  const W = rngOf(Math.round(cx * 131 + cz * 17 + r * 7 + 91)), fallen = [], top = rows - 1;
  const wr = o.wear !== false && rows > 1 ? sandbagWear(n - (top % 2), top % 2 === 1, (top - 1) % 2 === 1, W) : null;
  const fall = (a, type) => sandbagFallen(cx + Math.cos(a) * r, cz + Math.sin(a) * r, -Math.sin(a), Math.cos(a), 0.2 * k, Math.atan2(-Math.cos(a), -Math.sin(a)), ground, k, c, W, fallen, type);
  for (let row = 0; row < rows; row++) {
    const odd = row % 2, y = row * 0.22 * k, skip = wr && row === top ? wr.half : wr && row === top - 1 ? wr.low : null;
    for (let i = 0; i < n - odd; i++) {
      const a = a0 + da * (i + 0.5 + odd * 0.5);
      if (wr && row === top && wr.gone.has(i)) { R(); sandbagTint(c, R); fall(a); continue; }
      put(0, a, y, false);
    }
    if (odd) for (const [e, a] of [[0, a0 + da * 0.25], [1, a1 - da * 0.25]]) { if (skip && skip[e]) fall(a, 'sandbagHalf'); else put(e ? 1 : -1, a, y, true); }
  }
}
/* Nid en fer à cheval : un mur de face (largeur w) et deux retours vers l'arrière (profondeur d), le tout tourné de rot autour de (cx, cz) ;
   l'abri est du côté +z local. o : rows (les retours ont un rang de moins), color, ground, R */
function sandbagU(cx, cz, w, d, rot = 0, o = {}) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
  const [fx, fz] = P(0, 0); sandbagWall(fx, fz, w, rot, o);
  for (const sd of [-1, 1]) { const [x, z] = P(sd * (w / 2 - 0.2), 0.2 + d / 2 + 0.02); sandbagWall(x, z, d - 0.04, rot + Math.PI / 2, Object.assign({}, o, { rows: Math.max(1, (o.rows || 4) - 1) })); }
}
/* Tas de sacs déchargés : trois rangs en pyramide sur len, et quelques sacs jetés autour, à plat sur le sol, chacun à l'écart des autres
   (deux sacs ne s'entrent pas). o : color, ground, R, seed */
function sandbagPile(cx, cz, len, rot = 0, o = {}) {
  const R = o.R || (o.seed ? rngOf(o.seed) : SR.rng), c = Array.isArray(o.color) ? o.color : SANDBAG_TINT[o.color || 'jute'], ground = o.ground || (() => o.y || 0);
  sandbagWall(cx, cz, len, rot, Object.assign({}, o, { R, rows: 3, taper: true, wear: false }));
  const cs = Math.cos(rot), sn = Math.sin(rot), put = [];
  for (let tries = 0; tries < 24 && put.length < 3; tries++) {
    const lx = (R() - 0.5) * len * 1.1, lz = (R() < 0.5 ? -1 : 1) * (0.62 + R() * 0.4), ry = R() * TAU;
    if (put.some(([px, pz]) => hyp(px - lx, pz - lz) < 0.75)) continue;
    put.push([lx, lz]);
    const x = cx + lx * cs + lz * sn, z = cz - lx * sn + lz * cs;
    DECOR.dyn('sandbag', x, ground(x, z), z, ry, { tint: sandbagTint(c, R) });
  }
}
/* Muret jersey en béton (profil en F), longueur len le long de z */
PF.jersey = (len) => prefab('jersey' + len.toFixed(2), (M) => {
  M.color([0.86, 0.84, 0.8]).local(1);
  const pr = [[-0.31, 0], [0.31, 0], [0.31, 0.075], [0.2, 0.3], [0.085, 0.8], [0.06, 0.87], [-0.06, 0.87], [-0.085, 0.8], [-0.2, 0.3], [-0.31, 0.075]];
  M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(0, 0.25, y));
  M.save().move(0, 0, -len / 2 + 0.03); M.extrude('concrete', pr, len - 0.06, { sharp: 0.3 }); M.restore();
  // chanfreins d'extrémité et encoches de levage
  M.color([0.2, 0.2, 0.2]); M.aoFn = null;
  for (const z of [-len / 2 + 0.5, len / 2 - 0.5]) M.boxB('dark', -0.315, 0.315, 0, 0.1, z - 0.12, z + 0.12, { skip: 'y' });
});

/* ---------- Conteneurs maritimes ---------- */
/* Tôle nervurée trapézoïdale : profil ouvert le long de x (de 0 à L), creux vers -y */
function corrugProfile(L, pitch = 0.21, depth = 0.035) {
  const pts = [], n = Math.max(1, Math.round(L / pitch)), p = L / n;
  for (let i = 0; i < n; i++) { const x = i * p; pts.push([x, 0], [x + p * 0.3, 0], [x + p * 0.45, -depth], [x + p * 0.85, -depth]); }
  pts.push([L, 0]);
  return pts.reverse(); // parcours de droite à gauche : normales vers +y
}
/* Conteneur 20 pieds (6,06 x 2,44 x 2,6), longueur le long de z, portes en +z. open : sans portes ni fond */
PF.container = (open = false) => prefab(open ? 'containerOpen' : 'container', (M, P) => {
  P.tintable = ['paint'];
  const L = 6.06, W = 2.44, H = 2.6, hl = L / 2, hw = W / 2, post = 0.16;
  M.local(1);
  M.aoFn = (x, y) => lerp(0.65, 1, smoothstep(0, 0.4, y));
  const prof = corrugProfile(L - post * 2);
  for (const s of [1, -1]) {
    // bardage nervuré : profil (le long de z, vers l'extérieur) extrudé vers le haut
    M.save().move(s * (hw - 0.02), 0.16, -s * (hl - post)).mul(basis([0, 0, s], [s, 0, 0], [0, 1, 0]));
    M.extrude('paint', prof, H - 0.32, { closed: false, sharp: 0.3 });
    if (open) { M.color([0.8, 0.8, 0.8]); M.move(0, -0.004, 0); M.extrude('paint', prof.slice().reverse(), H - 0.32, { closed: false, sharp: 0.3 }); }
    M.restore();
  }
  // toit, plancher
  M.boxB('paint', -hw + 0.02, hw - 0.02, H - 0.06, H - 0.02, -hl + post, hl - post);
  if (open) { M.color([0.7, 0.6, 0.45]); M.uvS = 1; M.boxB('crate', -hw + 0.05, hw - 0.05, 0.1, 0.16, -hl + 0.01, hl - 0.01); /* plancher rentré de 1 cm : ses bouts tombaient dans le plan des abouts */ M.color([1, 1, 1]); M.boxB('paint', -hw + 0.02, hw - 0.02, H - 0.1, H - 0.06, -hl + post, hl - post, { skip: 'Y' }); }
  // cadre : montants d'angle, longerons, traverses, pièces de coin
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    M.boxB('paint', sx * hw - (sx > 0 ? post : 0), sx * hw + (sx < 0 ? post : 0), 0.12, H - 0.12, sz * hl - (sz > 0 ? post : 0), sz * hl + (sz < 0 ? post : 0), { bevel: 0.01 }); // entre les pièces de coin
    M.save().color([0.25, 0.24, 0.22]);
    for (const y of [0, H - 0.12]) M.boxB('steel', sx * hw - (sx > 0 ? 0.18 : 0.006), sx * hw + (sx < 0 ? 0.18 : 0.006), y, y + 0.12, sz * hl - (sz > 0 ? 0.18 : 0.006), sz * hl + (sz < 0 ? 0.18 : 0.006), { bevel: 0.01 }); // pièces de coin en saillie de 6 mm (dans le plan des montants, elles scintillaient)
    M.restore();
  }
  for (const sx of [-1, 1]) for (const y of [0, H - 0.16]) M.boxB('paint', sx * hw - (sx > 0 ? 0.12 : 0), sx * hw + (sx < 0 ? 0.12 : 0), y, y + 0.16, -hl + post, hl - post);
  for (const sz of [-1, 1]) for (const y of [0, H - 0.2]) M.boxB('paint', -hw + post, hw - post, y, y + 0.2, sz * hl - (sz > 0 ? 0.12 : 0), sz * hl + (sz < 0 ? 0.12 : 0));
  if (!open) {
    // fond nervuré
    M.save().move(hw - post, 0.2, -hl + 0.04).mul(basis([-1, 0, 0], [0, 0, -1], [0, 1, 0])); M.extrude('paint', corrugProfile(W - post * 2, 0.24, 0.03), H - 0.4, { closed: false }); M.restore();
    // portes : deux vantaux, nervures embouties, barres de fermeture, charnières, joint
    const zf = hl - 0.06;
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -hw + post : 0.006, x1 = s < 0 ? -0.006 : hw - post;
      M.boxB('paint', x0, x1, 0.2, H - 0.2, zf - 0.04, zf);
      for (let k = 0; k < 4; k++) { const y = 0.45 + k * 0.52; M.boxB('paint', x0 + 0.06, x1 - 0.06, y, y + 0.28, zf, zf + 0.015, { bevel: 0.006 }); }
      M.save().color([0.35, 0.34, 0.32]);
      for (const bx of [x0 + (x1 - x0) * 0.28, x0 + (x1 - x0) * 0.72]) {
        M.save().move(bx, 0.1, zf + 0.05); M.cyl('steel', 0.017, H - 0.2, 6); M.restore();
        for (const y of [0.35, H - 0.4]) M.boxB('steel', bx - 0.04, bx + 0.04, y, y + 0.08, zf, zf + 0.06);
        M.boxB('steel', bx - 0.012, bx + 0.012, 1.0, 1.35, zf + 0.05, zf + 0.09);
      }
      for (const y of [0.4, 1.3, 2.2]) M.boxB('steel', s < 0 ? -hw + 0.1 : hw - 0.2, s < 0 ? -hw + 0.2 : hw - 0.1, y, y + 0.14, zf, zf + 0.05);
      M.restore();
    }
    M.color([0.05, 0.05, 0.05]); M.boxB('dark', -0.008, 0.008, 0.2, H - 0.2, zf - 0.03, zf + 0.004);
  }
});

/* ---------- Mobilier urbain ---------- */
/* Éclairage public allumé (crépuscule, nuit) : atmo.lit de la carte en construction (lampadaires, lanternes de parc, réverbères, appliques) */
var litOn = () => !!(CURMAP.def && CURMAP.def.atmo && CURMAP.def.atmo.lit);
/* Lampadaire : socle, fût conique, crosse, lanterne ; allumé (lit, par défaut selon l'ambiance) : verre lumineux et lumière cuite sous la
   lanterne, rabattue vers le sol */
PF.lampPost = (lit = litOn()) => prefab('lampPost' + (lit ? 'L' : ''), (M) => {
  M.color([0.3, 0.31, 0.3]).local(1);
  M.lathe('steel', [[0, 0], [0.16, 0], [0.16, 0.08], [0.12, 0.12], [0.1, 0.5], [0.075, 0.56], [0.07, 5.6], [0.06, 5.85], [0, 5.9]], 10, { uR: 0.1 });
  M.tube('steel', 0.04, [[0, 5.7, 0], [0.1, 5.95, 0], [0.45, 6.05, 0], [0.95, 5.98, 0], [1.2, 5.85, 0]], 6);
  M.save().move(1.2, 5.62, 0);
  M.lathe('steel', [[0, 0.02], [0.2, 0.05], [0.26, 0.14], [0.18, 0.22], [0.05, 0.28], [0, 0.29]], 10);
  M.cls = 1; M.cyl(lit ? 'lamp' : 'lampOff', 0.16, 0.03, 10); M.restore();
  if (lit) M.lamp(1.2, 5.45, 0, [1.0, 0.74, 0.46], 3.2, 12, 0.7);
  M.col(-0.1, 0.1, 0, 6, -0.1, 0.1, 'metal');
});
/* Bouche d'égout (plaque en fonte) et grille d'avaloir, affleurantes */
PF.manhole = () => prefab('manhole', (M) => {
  M.color([0.22, 0.2, 0.18]).local(1); M.cls = 1;
  M.cyl('steel', 0.34, 0.012, 16);
  M.color([0.14, 0.13, 0.12]); M.cls = 2;
  for (let i = -3; i <= 3; i++) M.boxB('steel', i * 0.08 - 0.012, i * 0.08 + 0.012, 0.012, 0.018, -Math.sqrt(0.09 - i * i * 0.0064), Math.sqrt(0.09 - i * i * 0.0064));
});
PF.drain = () => prefab('drain', (M) => {
  M.color([0.05, 0.05, 0.05]).local(1); M.cls = 1;
  M.boxB('dark', -0.3, 0.3, 0, 0.004, -0.2, 0.2);
  M.color([0.2, 0.19, 0.17]); M.cls = 2;
  for (let i = -5; i <= 5; i++) M.boxB('steel', i * 0.05 - 0.01, i * 0.05 + 0.01, 0.004, 0.014, -0.2, 0.2);
  M.boxB('steel', -0.32, 0.32, 0, 0.014, -0.22, -0.2); M.boxB('steel', -0.32, 0.32, 0, 0.014, 0.2, 0.22);
});
/* Gravillons et petits débris épars (menus détails) */
PF.pebbles = (seed = 1) => prefab('pebbles' + seed, (M) => {
  const R = rngOf(seed * 17 + 1); M.cls = 2; M.local(1);
  for (let i = 0; i < 14; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 0.9, s = R.range(0.03, 0.09);
    M.color(R.pick([[0.8, 0.74, 0.66], [0.6, 0.55, 0.5], [0.72, 0.45, 0.32]]));
    M.save().move(Math.cos(a) * d, -s * 0.3, Math.sin(a) * d).rotY(R() * TAU).rotX(R() - 0.5); M.box('concrete', s * 1.3, s * 0.8, s, { bevel: s * 0.2 }); M.restore();
  }
});
/* Borne anti-stationnement */
PF.bollard = () => prefab('bollard', (M) => {
  M.color([0.25, 0.25, 0.24]).local(1);
  M.lathe('steel', [[0, 0], [0.08, 0], [0.08, 0.7], [0.1, 0.72], [0.1, 0.78], [0.06, 0.84], [0, 0.85]], 10);
  M.col(-0.08, 0.08, 0, 0.85, -0.08, 0.08, 'metal');
});
/* Benne à ordures à chargement frontal (d'après photos) : cuve à face avant inclinée et dos droit, rebord, nervures verticales, fourreaux de
   levage sur les bouts, deux couvercles de plastique noir articulés au dos (un entrouvert), roulettes pivotantes */
PF.dumpster = () => prefab('dumpster', (M, P) => {
  P.tintable = ['paint'];
  M.local(1);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0.1, 0.5, y));
  // cuve : profil (z, y) extrudé sur la longueur ; dos droit en -z, face avant inclinée vers +z
  const pr = [[-0.62, 0.2], [0.42, 0.2], [0.6, 1.3], [-0.62, 1.3]];
  M.save().move(1.0, 0, 0).rotY(-Math.PI / 2); M.extrude('paint', pr, 2.0, { sharp: 0.2 }); M.restore();
  M.aoFn = null;
  M.boxB('paint', -1.04, 1.04, 1.28, 1.36, -0.66, 0.64, { bevel: 0.015 }); // rebord
  M.cls = 1;
  for (const x of [-0.6, 0, 0.6]) { M.boxB('paint', x - 0.04, x + 0.04, 0.22, 1.28, -0.66, -0.62); M.save().move(x, 0.2, 0.42).rotX(-Math.atan2(0.18, 1.1)); M.boxB('paint', -0.04, 0.04, 0.02, 1.1, -0.01, 0.035); M.restore(); }
  M.cls = 0;
  for (const sd of [-1, 1]) { M.boxB('paint', sd * 1.0 - (sd > 0 ? 0 : 0.1), sd * 1.0 + (sd > 0 ? 0.1 : 0), 0.85, 1.05, -0.32, 0.32, { bevel: 0.01 }); M.color([0.06, 0.06, 0.06]); M.boxB('dark', sd * 1.101 - 0.002, sd * 1.101 + 0.002, 0.88, 1.02, -0.28, 0.28); M.color([1, 1, 1]); }
  M.color([0.08, 0.08, 0.09]);
  for (const [sd, ang] of [[-1, 0.03], [1, -0.55]]) { M.save().move(sd * 0.51, 1.36, -0.66).rotX(ang); M.boxB('plastic', -0.5, 0.5, 0, 0.06, 0, 1.34, { bevel: 0.02 }); M.cls = 1; for (const z of [0.3, 0.7, 1.05]) M.boxB('plastic', -0.48, 0.48, 0.06, 0.08, z - 0.03, z + 0.03); M.cls = 0; M.restore(); }
  M.color([0.25, 0.25, 0.25]);
  for (const x of [-0.82, 0.82]) for (const z of [-0.45, 0.3]) { M.boxB('steel', x - 0.06, x + 0.06, 0.16, 0.2, z - 0.06, z + 0.06); M.save().move(x, 0, z + 0.03); M.boxB('steel', -0.04, 0.04, 0.08, 0.16, -0.03, 0.03); M.save().move(-0.025, 0, 0).rotY(Math.PI / 2); wheel(M, 0.075, 0.04, { side: 1, rim: [0.6, 0.6, 0.6] }); M.restore(); M.restore(); }
});
/* Pile de pneus */
PF.tire = () => prefab('tire', (M) => {
  M.color([1, 1, 1]).local(1);
  M.lathe('rubber', [[0.22, 0.0], [0.33, 0.0], [0.38, 0.03], [0.4, 0.1], [0.38, 0.17], [0.33, 0.2], [0.22, 0.2], [0.2, 0.17], [0.2, 0.03], [0.22, 0.0]], 16, { sharp: 0.9, uR: 0.35 });
  M.col(-0.4, 0.4, 0, 0.2, -0.4, 0.4, 'dirt');
});
/* Poteau électrique en bois avec traverse et isolateurs */
PF.pole = () => prefab('pole', (M) => {
  M.color([0.5, 0.4, 0.3]).local(1);
  M.cyl('wood', 0.13, 8.5, 8, { r1: 0.1 });
  M.boxB('wood', -0.9, 0.9, 7.6, 7.72, -0.06, 0.06);
  M.color([0.85, 0.85, 0.8]);
  for (const x of [-0.75, -0.25, 0.25, 0.75]) { M.save().move(x, 7.72, 0); M.cyl('plastic', 0.04, 0.14, 6, { r1: 0.025 }); M.restore(); }
  M.col(-0.13, 0.13, 0, 8.5, -0.13, 0.13, 'wood');
});

/* ---------- Façades et toits ---------- */
/* Climatiseur (unité extérieure) avec ventilateur, grille et équerres ; dos contre le mur (z = 0) */
PF.acUnit = () => prefab('acUnit', (M) => {
  M.color([0.86, 0.85, 0.8]).local(1);
  M.boxB('plastic', -0.4, 0.4, 0, 0.56, 0.04, 0.34, { bevel: 0.02 });
  M.color([0.12, 0.12, 0.12]);
  M.save().move(-0.1, 0.28, 0.341).rotX(Math.PI / 2); M.cyl('dark', 0.2, 0.004, 16); M.restore();
  M.color([0.35, 0.35, 0.34]); M.cls = 2;
  for (let i = -3; i <= 3; i++) M.boxB('steel', -0.1 - 0.2, -0.1 + 0.2, 0.28 + i * 0.05 - 0.004, 0.28 + i * 0.05 + 0.004, 0.34, 0.352);
  for (let i = 0; i < 6; i++) M.boxB('steel', 0.2, 0.36, 0.1 + i * 0.07, 0.1 + i * 0.07 + 0.012, 0.34, 0.345);
  M.color([0.4, 0.4, 0.38]); M.cls = 1;
  for (const x of [-0.3, 0.3]) M.boxB('steel', x - 0.02, x + 0.02, -0.03, 0.0, 0, 0.4);
  M.color([0.9, 0.9, 0.9]); M.tube('plastic', 0.008, [[0.35, 0.05, 0.08], [0.35, -0.3, 0.06], [0.33, -0.5, 0.04]], 4);
});
/* Réservoir d'eau en polyéthylène sur son support (typique des toits du Maghreb) */
PF.waterTank = () => prefab('waterTank', (M, P) => {
  P.tintable = ['plastic'];
  M.color([0.45, 0.45, 0.43]).local(1);
  for (const x of [-0.45, 0.45]) for (const z of [-0.45, 0.45]) M.boxB('steel', x - 0.025, x + 0.025, 0, 0.5, z - 0.025, z + 0.025);
  M.boxB('steel', -0.55, 0.55, 0.47, 0.52, -0.55, 0.55);
  M.color([1, 1, 1]);
  const pr = [[0, 0.52], [0.52, 0.52], [0.55, 0.56], [0.55, 0.7], [0.53, 0.72], [0.55, 0.74], [0.55, 0.95], [0.53, 0.97], [0.55, 0.99], [0.55, 1.2], [0.5, 1.3], [0.2, 1.36], [0.2, 1.42], [0, 1.42]];
  M.lathe('plastic', pr, 18, { sharp: 0.7, uR: 0.55 });
  M.color([0.5, 0.5, 0.5]); M.tube('steel', 0.02, [[0.5, 0.65, 0], [0.7, 0.62, 0], [0.75, 0.2, 0], [0.75, 0.06, 0]], 5);
});
/* Antenne parabolique sur pied */
PF.dish = () => prefab('dish', (M) => {
  M.color([0.9, 0.9, 0.88]).local(1);
  M.boxB('steel', -0.25, 0.25, 0, 0.05, -0.25, 0.25);
  M.save().move(0, 0.05, 0); M.cyl('steel', 0.03, 0.75, 6); M.restore();
  M.save().move(0, 0.85, 0).rotX(-0.95);
  M.lathe('steel', [[0, -0.02], [0.2, 0.0], [0.34, 0.06], [0.42, 0.13], [0.43, 0.14]], 14, { sharp: 1.2 });
  M.lathe('steel', [[0.43, 0.14], [0.42, 0.125], [0.33, 0.045], [0.2, -0.015], [0, -0.035]], 14, { sharp: 1.2 });
  M.tube('steel', 0.012, [[0, -0.02, -0.35], [0, 0.25, -0.15], [0, 0.45, 0.0]], 4);
  M.save().move(0, 0.45, 0); M.cyl('plastic', 0.035, 0.1, 6); M.restore();
  M.restore();
});
/* Chauffe-eau solaire : capteur incliné, ballon horizontal, piétement */
PF.solarHeater = () => prefab('solarHeater', (M) => {
  M.color([0.55, 0.55, 0.52]).local(1);
  for (const x of [-0.9, 0.9]) { M.tube('steel', 0.02, [[x, 0, -0.6], [x, 0.3, -0.6], [x, 1.25, 0.1]], 4); M.tube('steel', 0.02, [[x, 0, 0.3], [x, 1.25, 0.3]], 4); }
  M.save().move(0, 0.2, -0.65).rotX(-0.95);
  M.boxB('steel', -1.0, 1.0, 0, 0.06, 0, 1.7, { bevel: 0.01 });
  M.cls = 1; M.color([0.8, 0.85, 0.95]); M.boxB('glass', -0.96, 0.96, 0.06, 0.065, 0.04, 1.66); M.restore();
  M.color([0.85, 0.85, 0.82]);
  M.save().move(-1.05, 1.35, 0.25).rotZ(-Math.PI / 2); M.lathe('steel', [[0, 0], [0.24, 0.0], [0.25, 0.03], [0.25, 2.07], [0.24, 2.1], [0, 2.1]], 12); M.restore();
});
/* Antenne râteau */
PF.antenna = () => prefab('antenna', (M) => {
  M.color([0.55, 0.55, 0.52]).local(1);
  M.cyl('steel', 0.02, 3.2, 5);
  M.boxB('steel', -0.02, 0.02, 2.9, 2.93, -0.7, 0.7);
  for (let i = 0; i < 7; i++) { const z = -0.6 + i * 0.2, w = 0.5 - i * 0.04; M.boxB('steel', -w, w, 2.9, 2.915, z - 0.008, z + 0.008); }
  for (const [x, z] of [[0.8, 0.8], [-0.8, 0.5], [0.3, -0.9]]) M.tube('steel', 0.004, [[0, 2.6, 0], [x, 0, z]], 3);
});
/* Édicule d'accès au toit : cage d'escalier avec porte */
PF.roofHut = () => prefab('roofHut', (M) => {
  M.color([0.92, 0.88, 0.8]).world(1);
  M.boxB('plaster', -1.1, 1.1, 0, 2.5, -0.9, 0.9);
  M.local(1); M.color([0.85, 0.83, 0.78]); M.boxB('concrete', -1.18, 1.18, 2.5, 2.6, -0.98, 0.98, { bevel: 0.015 });
  M.color(PAL.door[0]); M.boxB('paintwood', -0.4, 0.4, 0.02, 2.0, 0.9, 0.93);
  M.color([0.5, 0.45, 0.3]); M.boxB('steel', 0.25, 0.3, 1.0, 1.08, 0.93, 0.97);
});
/* Pot de fleurs en terre cuite (garni d'une touffe) */
PF.pot = () => prefab('pot', (M) => {
  M.color([0.72, 0.4, 0.26]).local(1);
  M.lathe('concrete', [[0, 0], [0.1, 0], [0.13, 0.2], [0.15, 0.22], [0.15, 0.25], [0.125, 0.25], [0.11, 0.05], [0, 0.05]], 10, { sharp: 0.6 });
  M.color([0.9, 0.95, 0.85]); M.swFn = swHeight(0.34, 0.76, 1.2, 0.5);
  foliageCard(M, FOL.bush, 0.24, 0.42, 0.34, 2, 0.18);
});

/* ---------- Entrepôt ---------- */
/* Rayonnage à palettes : échelles bleues, lisses orange, charges */
PF.rack = (L) => prefab('rack' + L.toFixed(2), (M) => {
  const R = rngOf(Math.round(L * 100)), levels = [0.1, 1.16, 2.26], D = 1.0;
  M.local(1);
  const nb = Math.max(1, Math.round(L / 2.7)), bay = L / nb;
  for (let i = 0; i <= nb; i++) {
    const z = -L / 2 + i * bay;
    M.color([0.2, 0.3, 0.55]);
    for (const x of [-D / 2, D / 2]) M.boxB('paint', x - 0.04, x + 0.04, 0, 3.2, z - 0.04, z + 0.04);
    for (let y = 0.3; y < 3.1; y += 0.6) M.boxB('paint', -D / 2, D / 2, y, y + 0.03, z - 0.012, z + 0.012);
  }
  M.color([0.9, 0.5, 0.12]);
  for (const y of levels.slice(1)) for (const x of [-D / 2, D / 2]) M.boxB('paint', x - 0.03, x + 0.03, y - 0.12, y, -L / 2, L / 2);
  // charges : caisses, cartons, sacs sur palettes (des corps physiques, qui reposent sur les lisses)
  for (const y of levels) M.pcol(-D / 2, D / 2, y - 0.03, y, -L / 2, L / 2);
  for (const y of levels) for (let z = -L / 2 + 0.15; z < L / 2 - 0.7; z += 0.75 + R() * 0.25) {
    const r = R(); if (r < 0.18) continue;
    if (r < 0.55) { const s = 0.5 + R() * 0.25; M.save().move(0, y, z + s / 2).rotY((R() - 0.5) * 0.2); M.dyn('crate', 0, 0, 0, 0, { a: [Math.round(s * 20) / 20], tint: [0.9, 0.85, 0.72], nocol: true }); M.restore(); }
    else if (r < 0.85) { M.save().move((R() - 0.5) * 0.2, y, z + 0.3); M.dyn('cardboard', 0, 0, 0, 0, { a: [0.55, Math.round((0.4 + R() * 0.2) * 20) / 20, 0.5] }); M.restore(); }
    else { M.save().move(0, y, z + 0.35).rotY(R() * 0.3); for (let k = 0; k < 3; k++) { M.save().move((k - 1) * 0.3, 0, 0).rotY(Math.PI / 2); M.dyn('sandbagLow', 0, 0, 0, 0, { tint: [0.95, 0.9, 0.78] }); M.restore(); } M.restore(); }
  }
});
/* Groupe électrogène insonorisé (d'après photos de groupes de chantier) : châssis en U sur patins, capot à toit arrondi, grille de radiateur
   à persiennes en +x, sortie d'air chaud en -x, portes de visite sur les flancs (cadres, charnières, poignées), tableau de commande vitré,
   échappement à clapet, anneau de levage, bouchon de réservoir */
PF.generator = () => prefab('generator', (M, P) => {
  P.tintable = ['paint'];
  M.local(1);
  M.color([0.2, 0.2, 0.2]);
  for (const sd of [-1, 1]) M.boxB('steel', -0.95, 0.95, 0, 0.15, sd * 0.55 - (sd > 0 ? 0.08 : 0), sd * 0.55 + (sd > 0 ? 0 : 0.08));
  for (const x of [-0.8, 0.8]) M.boxB('steel', x - 0.06, x + 0.06, 0.1, 0.15, -0.5, 0.5);
  M.color([1, 1, 1]);
  M.boxB('paint', -0.9, 0.9, 0.15, 1.24, -0.5, 0.5, { bevel: 0.03 });
  M.save().move(0.9, 1.24, 0).rotY(-Math.PI / 2); M.extrude('paint', [[-0.5, 0], [0.5, 0], [0.5, 0.04], [0.42, 0.12], [-0.42, 0.12], [-0.5, 0.04]], 1.8, { sharp: 0.6 }); M.restore();
  // persiennes : radiateur (+x) et sortie d'air (-x)
  M.color([0.12, 0.12, 0.12]); M.boxB('dark', 0.9, 0.905, 0.3, 1.1, -0.38, 0.38); M.boxB('dark', -0.905, -0.9, 0.5, 1.0, -0.3, 0.3);
  M.color([1, 1, 1]); M.cls = 1;
  for (let k = 0; k < 9; k++) { const y = 0.34 + k * 0.088; M.save().move(0.91, y, 0).rotZ(-0.6); M.boxB('paint', -0.004, 0.004, 0, 0.07, -0.38, 0.38); M.restore(); }
  for (let k = 0; k < 6; k++) { const y = 0.53 + k * 0.08; M.save().move(-0.91, y, 0).rotZ(0.6); M.boxB('paint', -0.004, 0.004, 0, 0.065, -0.3, 0.3); M.restore(); }
  // portes de visite : deux par flanc, cadre en saillie, charnières, poignée
  for (const sd of [-1, 1]) for (const [x0, x1] of [[-0.78, -0.06], [0.06, 0.78]]) {
    const z = sd * 0.5;
    M.boxB('paint', x0, x1, 0.26, 0.29, z - 0.008, z + 0.008); M.boxB('paint', x0, x1, 1.1, 1.13, z - 0.008, z + 0.008);
    M.boxB('paint', x0, x0 + 0.03, 0.26, 1.13, z - 0.008, z + 0.008); M.boxB('paint', x1 - 0.03, x1, 0.26, 1.13, z - 0.008, z + 0.008);
    M.color([0.15, 0.15, 0.15]); for (const y of [0.4, 0.98]) M.boxB('steel', x0 - 0.01, x0 + 0.03, y - 0.04, y + 0.04, z - 0.014, z + 0.014);
    M.boxB('steel', x1 - 0.09, x1 - 0.05, 0.62, 0.76, z - (sd > 0 ? 0 : 0.03), z + (sd > 0 ? 0.03 : 0)); M.color([1, 1, 1]);
  }
  M.cls = 0;
  // tableau de commande (fenêtre sur le flanc +z, porte de droite), échappement, anneau de levage, bouchon de réservoir
  M.color([0.18, 0.22, 0.26]); M.boxB('glass', 0.18, 0.5, 0.82, 1.02, 0.508, 0.514);
  M.color([0.25, 0.25, 0.25]); M.save().move(-0.55, 1.34, 0.18); M.cyl('steel', 0.055, 0.3, 10); M.save().move(0, 0.3, 0).rotZ(0.4); M.cyl('steel', 0.06, 0.01, 10); M.restore(); M.restore();
  M.save().move(0, 1.36, 0).rotX(Math.PI / 2); M.tube('steel', 0.014, Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (i / 8); return [Math.cos(a) * 0.06, 0, -Math.sin(a) * 0.06 - 0.02]; }), 5); M.restore();
  M.color([0.1, 0.1, 0.1]); M.save().move(0.62, 1.15, -0.5).rotX(-Math.PI / 2); M.cyl('steel', 0.04, 0.03, 10); M.restore();
  M.col(-0.95, 0.95, 0, 1.4, -0.55, 0.55, 'metal');
});

/* ---------- Café, marché ---------- */
/* Chaise de terrasse en plastique moulé d'une pièce (d'après photos) : assise à bord roulé, dossier galbé et incliné, accoudoirs qui se
   prolongent en pieds avant, pieds arrière écartés ; teinte de l'estampille */
PF.chair = () => prefab('chair', (M, P) => {
  P.tintable = ['plastic'];
  M.local(1);
  M.boxB('plastic', -0.22, 0.22, 0.42, 0.45, -0.19, 0.21, { bevel: 0.02 });
  M.tube('plastic', 0.016, [[-0.21, 0.43, 0.215], [0.21, 0.43, 0.215]], 5); // bord roulé
  // dossier : coque galbée (creux de 4 cm), inclinée de 12°, des deux faces
  for (const f of [false, true]) M.surf('plastic', 6, 3, (u, v) => { const x = lerp(-0.22, 0.22, u), y = 0.45 + v * 0.42; return [x * (1 + v * 0.06), y, -0.19 - v * 0.09 + 0.04 * Math.cos(u * Math.PI - Math.PI / 2) ** 2 - 0.04]; }, { uL: 0.45, vL: 0.42, flipN: f });
  M.tube('plastic', 0.014, Array.from({ length: 7 }, (_, i) => { const u = i / 6; return [lerp(-0.22, 0.22, u) * 1.06, 0.87, -0.28 + 0.04 * Math.cos(u * Math.PI - Math.PI / 2) ** 2 - 0.04]; }), 4);
  M.color([0.55, 0.55, 0.55]); M.cls = 2; for (const x of [-0.08, 0, 0.08]) M.boxB('plastic', x - 0.012, x + 0.012, 0.58, 0.78, -0.255, -0.24); M.cls = 0; M.color([1, 1, 1]); // fentes du dossier (ombre)
  // accoudoirs et pieds avant d'un seul tenant, pieds arrière
  for (const sd of [-1, 1]) {
    M.tube('plastic', 0.019, [[sd * 0.23, 0.66, -0.24], [sd * 0.245, 0.64, -0.05], [sd * 0.25, 0.6, 0.14], [sd * 0.25, 0.42, 0.2], [sd * 0.27, 0, 0.25]], 6);
    M.tube('plastic', 0.019, [[sd * 0.2, 0.43, -0.17], [sd * 0.24, 0.2, -0.22], [sd * 0.26, 0, -0.27]], 6);
  }
});
PF.cafeTable = () => prefab('cafeTable', (M) => {
  M.color([0.35, 0.35, 0.33]).local(1);
  M.save().move(0, 0.7, 0); M.cyl('steel', 0.35, 0.03, 16); M.restore();
  M.cyl('steel', 0.03, 0.7, 6); M.cyl('steel', 0.22, 0.03, 10);
  M.col(-0.35, 0.35, 0, 0.73, -0.35, 0.35, 'metal');
});
/* Jarre en terre cuite (d'après photos de jarres à eau) : pied tourné, panse ronde, épaule, col étroit et lèvre roulée ; l'intérieur du col
   descend dans l'ombre */
PF.jar = (s = 1) => prefab('jar' + s, (M) => {
  M.color([0.74, 0.44, 0.3]).local(1);
  // panse : rayon lissé entre le pied (0,11 à 3 cm) et le col (0,105 à 59 cm), le plus large (0,26) à 31 cm ; 14 rangs pour une silhouette ronde
  const p = [[0, 0], [0.1, 0], [0.11, 0.02]];
  for (let i = 0; i <= 14; i++) { const y = lerp(0.03, 0.59, i / 14), t = y < 0.31 ? (y - 0.03) / 0.28 : (0.59 - y) / 0.28; p.push([y < 0.31 ? lerp(0.11, 0.26, Math.sin(t * Math.PI / 2)) : lerp(0.105, 0.26, Math.sin(t * Math.PI / 2) ** 0.8), y]); }
  p.push([0.115, 0.615], [0.135, 0.63], [0.14, 0.65], [0.125, 0.665], [0.1, 0.66], [0.09, 0.62], [0.08, 0.5]);
  M.lathe('concrete', p.map(([r, y]) => [r * s, y * s]), 24, { sharp: 0.6, uR: 0.3 });
  M.color([0.12, 0.08, 0.06]); M.save().move(0, 0.5 * s, 0); M.cyl('dark', 0.08 * s, 0.002, 12); M.restore();
});
/* Le cageot de fruits (corps physique, fruits, parois) est dans 02k-dynprops.js */
/* Sac d'épices ouvert, rebord roulé et monticule coloré */
PF.spiceSack = () => prefab('spiceSack', (M, P) => {
  P.tintable = ['sand'];
  M.color([0.85, 0.78, 0.62]).local(1);
  M.lathe('burlap', [[0.16, 0], [0.2, 0.05], [0.21, 0.3], [0.23, 0.33], [0.24, 0.36], [0.2, 0.35], [0.19, 0.3]], 10, { uR: 0.2 });
  M.color([1, 1, 1]);
  M.lathe('sand', [[0.2, 0.3], [0.12, 0.36], [0.03, 0.4], [0, 0.405]], 10);
});

/* ---------- Pièces uniques des cartes (réutilisables) ---------- */
/* Table en bois (2 x 1 m, d'après photos de tables de ferme) : plateau de quatre planches à joints, ceinture sous le plateau, pieds fuselés,
   entretoise ; ses chaises sont des props physiques posées face à elle (voir tableSet, 02k-dynprops.js) */
PF.table = () => prefab('table', (M) => {
  M.color([0.62, 0.46, 0.32]).local(1);
  M.boxB('wood', -1.0, 1.0, 0.75, 0.8, -0.5, 0.5, { bevel: 0.012 });
  M.color([0.3, 0.22, 0.15]); M.cls = 1; for (const z of [-0.25, 0, 0.25]) M.boxB('wood', -0.99, 0.99, 0.799, 0.802, z - 0.004, z + 0.004); M.cls = 0;
  M.color([0.58, 0.43, 0.3]);
  for (const sd of [-1, 1]) { M.boxB('wood', -0.86, 0.86, 0.63, 0.75, sd * 0.38 - 0.012, sd * 0.38 + 0.012); M.boxB('wood', sd * 0.88 - 0.012, sd * 0.88 + 0.012, 0.63, 0.75, -0.36, 0.36); }
  for (const x of [-0.88, 0.88]) for (const z of [-0.38, 0.38]) { M.save().move(x, 0, z); M.lathe('wood', [[0, 0], [0.028, 0], [0.032, 0.05], [0.042, 0.55], [0.045, 0.62], [0.045, 0.75], [0, 0.75]], 8, { sharp: 0.5, uR: 0.04 }); M.restore(); }
  M.boxB('wood', -0.86, 0.86, 0.14, 0.19, -0.02, 0.02); for (const x of [-0.88, 0.88]) M.boxB('wood', x - 0.02, x + 0.02, 0.14, 0.19, -0.36, 0.36);
  M.col(-1.0, 1.0, 0, 0.8, -0.5, 0.5, 'wood');
});
/* Tapis posé au sol (2,4 x 1,6 m) */
PF.rugFloor = () => prefab('rugFloor', (M) => {
  M.color([1, 1, 1]).local(1); M.uvS = 2.4 / TEXSCALE.rug; M.uvO = [0.5, 0.5]; M.cls = 1;
  M.boxB('rug', -1.2, 1.2, 0, 0.012, -0.8, 0.8);
});
/* Fontaine octogonale : bassin, margelle moulurée, eau, colonne et vasque */
PF.fountain = () => prefab('fountain', (M) => {
  M.color([0.95, 0.9, 0.82]).local(1);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0, 0.4, y));
  M.lathe('ashlar', [[1.18, 0], [1.3, 0], [1.3, 0.62], [1.36, 0.66], [1.36, 0.8], [1.12, 0.8], [1.12, 0.3], [0, 0.3]], 8, { sharp: 0.3, uR: 1.3 }); // fond du bassin : on le voit à travers l'eau
  M.aoFn = null; // l'eau du bassin et de la vasque est posée par fountainWater (pondAdd), pas dessinée ici
  M.color([0.92, 0.88, 0.8]);
  M.lathe('ashlar', [[0, 0.3], [0.2, 0.3], [0.16, 0.5], [0.12, 1.3], [0.16, 1.36], [0.5, 1.42], [0.56, 1.5], [0.5, 1.52], [0.14, 1.5], [0.1, 1.7], [0.06, 1.72], [0, 1.72]], 12, { uR: 0.3 });
});
/* Eau d'une fontaine posée en (x, z) : bassin octogonal et vasque (jet au centre : anneaux), avec le rendu de l'eau de la mer */
function fountainWater(x, z) {
  pondAdd({ shape: 'disc', x, y: 0.62, z, r: 1.13, seg: 8, rings: 5, rot: Math.PI / 8, jet: 0.6, bed: 0.32, vis: 0.55, calm: 0.8, foam: 0.6 });
  pondAdd({ shape: 'disc', x, y: 1.505, z, r: 0.47, seg: 16, rings: 4, jet: 1, bed: 0.04, vis: 1, foam: 0.5 });
}
/* Chariot élévateur jaune (frontal à contrepoids, classe 1,5 t, d'après des photos de chariots thermiques) : caisse au profil découpé
   sur les roues, contrepoids arrondi, capot et siège, colonne de direction, toit de protection sur quatre montants, mât à deux étages
   (montants en U, cylindre de levée, chaînes), tablier, dosseret grillagé, fourches en L sous une palette. Fourches vers -z, mêmes
   encombrements que l'ancien modèle (x ±0,62, z -2,2 à 1,07, 2,2 m de haut) : les collisions posées par les cartes restent justes. */
PF.forklift = () => prefab('forklift', (M) => {
  const Y = [0.88, 0.66, 0.12], D = [0.14, 0.14, 0.15], St = [0.3, 0.3, 0.31];
  M.local(1); M.color(Y);
  M.aoFn = (x, y) => lerp(0.55, 1, smoothstep(0.1, 0.9, y));
  // caisse : profil latéral (z, y) extrudé sur 0,88 m, entre les roues
  const pts = [[-0.98, 0.22], [0.46, 0.22], [0.46, 0.95], [-0.42, 0.95], [-0.58, 1.12], [-0.86, 1.14], [-0.98, 0.98]];
  M.save().move(0.44, 0, 0).rotY(-Math.PI / 2); M.extrude('paint', pts, 0.88, { sharp: 0.4 }); M.restore();
  // ailes au-dessus des roues (elles débordent de la caisse jusqu'au flanc des pneus)
  for (const sd of [-1, 1]) {
    M.save().move(sd * 0.55, 0, -0.7); for (const f of [false, true]) M.surf('paint', 8, 1, (u, v) => { const a = Math.PI * (0.12 + 0.76 * u); return [lerp(-0.11, 0.11, v), 0.3 + 0.36 * Math.sin(a), -0.36 * Math.cos(a)]; }, { uL: 0.9, vL: 0.22, flipN: f }); M.restore();
  }
  // contrepoids : bloc de fonte arrondi à l'arrière, plus large que la caisse, passage de la roue arrière creusé dessous
  const cw = [[0.42, 0.5], [0.42, 1.28], [0.86, 1.28], [0.98, 1.22], [1.05, 1.08], [1.07, 0.6], [1.04, 0.36], [0.98, 0.3], [0.96, 0.5]];
  M.save().move(0.62, 0, 0).rotY(-Math.PI / 2); M.extrude('paint', cw, 1.24, { sharp: 0.35 }); M.restore();
  M.color(D); M.boxB('paint', -0.62, 0.62, 0.3, 0.5, 0.94, 1.06, { bevel: 0.03 }); // pare-chocs arrière
  // capot moteur (bombé) et siège
  M.color(Y); M.save().move(0, 0.95, 0); M.surf('paint', 6, 1, (u, v) => [lerp(-0.42, 0.42, u), 0.06 * Math.sin(u * Math.PI), lerp(-0.1, 0.44, v)], { uL: 0.9, vL: 0.5, flipN: true }); M.restore();
  M.color(D);
  M.boxB('plastic', -0.24, 0.24, 1.0, 1.1, 0.0, 0.42, { bevel: 0.04 });
  M.save().move(0, 1.08, 0.4).rotX(-0.18); M.boxB('plastic', -0.23, 0.23, 0, 0.46, -0.04, 0.05, { bevel: 0.04 }); M.restore();
  // tableau de bord et colonne de direction, volant incliné
  M.boxB('plastic', -0.3, 0.3, 1.12, 1.18, -0.86, -0.58, { bevel: 0.02 });
  M.tube('steel', 0.025, [[0, 1.14, -0.66], [0, 1.36, -0.5]], 6);
  M.save().move(0, 1.38, -0.48).rotX(0.9); M.tube('plastic', 0.016, Array.from({ length: 13 }, (_, i) => [Math.cos((i / 12) * TAU) * 0.16, 0, Math.sin((i / 12) * TAU) * 0.16]), 5); M.restore();
  for (const sd of [-1, 1]) M.tube('steel', 0.012, [[sd * 0.14, 1.33, -0.6], [sd * 0.14, 1.22, -0.72]], 4); // leviers de levée et d'inclinaison
  // roues : motrices à l'avant (pleines, larges), directrices à l'arrière
  for (const [z, r, w] of [[-0.7, 0.3, 0.22], [0.7, 0.24, 0.18]]) for (const sd of [-1, 1]) { M.save().move(sd * 0.55, 0, z); wheel(M, r, w, { side: sd, rim: [0.8, 0.6, 0.1], hub: 'steel' }); M.restore(); }
  // toit de protection : montants avant inclinés depuis le tablier de la caisse, arrière droits sur le contrepoids, cadre et lattes
  M.color(D);
  for (const sd of [-1, 1]) {
    M.tube('steel', 0.035, [[sd * 0.47, 0.98, -0.9], [sd * 0.47, 2.12, -0.72]], 6);
    M.tube('steel', 0.035, [[sd * 0.47, 1.28, 0.78], [sd * 0.47, 2.12, 0.66]], 6);
  }
  M.boxB('steel', -0.5, 0.5, 2.1, 2.16, -0.78, -0.7); M.boxB('steel', -0.5, 0.5, 2.1, 2.16, 0.62, 0.7);
  for (const sd of [-1, 1]) M.boxB('steel', sd * 0.5 - 0.035, sd * 0.5 + 0.035, 2.1, 2.16, -0.78, 0.7);
  M.cls = 1; for (let k = 0; k < 6; k++) { const z = lerp(-0.6, 0.52, k / 5); M.boxB('steel', -0.46, 0.46, 2.12, 2.15, z - 0.03, z + 0.03); } M.cls = 0;
  // gyrophare, phares sur les montants avant, échappement contre le montant arrière
  M.color([1.0, 0.55, 0.1]); M.save().move(0.32, 2.16, 0.58); M.cyl('plastic', 0.06, 0.1, 10); M.restore();
  M.color([0.85, 0.85, 0.8]); for (const sd of [-1, 1]) { M.save().move(sd * 0.47, 1.62, -0.88).rotX(Math.PI / 2); M.cyl('steel', 0.055, 0.08, 10); M.restore(); }
  M.color([0.2, 0.2, 0.2]); M.tube('steel', 0.03, [[-0.42, 1.25, 0.86], [-0.42, 1.9, 0.86], [-0.42, 1.98, 0.8]], 6);
  // mât à deux étages : montants extérieurs et intérieurs en U, traverses, cylindre de levée, chaînes
  M.color(D);
  for (const sd of [-1, 1]) {
    M.boxB('steel', sd * 0.4 - 0.05, sd * 0.4 + 0.05, 0.12, 2.02, -1.16, -1.04, { bevel: 0.01 });
    M.boxB('steel', sd * 0.3 - 0.04, sd * 0.3 + 0.04, 0.2, 2.08, -1.22, -1.12, { bevel: 0.01 });
    M.save().move(sd * 0.3, 2.04, -1.17).rotZ(Math.PI / 2); M.cyl('steel', 0.05, 0.06, 10); M.restore(); // poulie de chaîne
  }
  for (const y of [0.18, 1.0, 1.96]) M.boxB('steel', -0.4, 0.4, y, y + 0.08, -1.15, -1.06);
  M.boxB('steel', -0.3, 0.3, 2.0, 2.08, -1.21, -1.13);
  M.color(St); M.save().move(0, 0.26, -1.1); M.cyl('steel', 0.055, 1.2, 10); M.restore();
  M.color([0.78, 0.8, 0.82]); M.save().move(0, 1.46, -1.1); M.cyl('steel', 0.03, 0.55, 8); M.restore();
  M.color([0.12, 0.12, 0.12]); M.cls = 1; for (const sd of [-1, 1]) M.tube('steel', 0.012, [[sd * 0.3, 2.08, -1.2], [sd * 0.3, 0.62, -1.26]], 3); M.cls = 0;
  // tablier et dosseret grillagé, fourches en L (levées de 20 cm, sous la palette)
  M.color(D);
  M.boxB('steel', -0.46, 0.46, 0.22, 0.32, -1.3, -1.22); M.boxB('steel', -0.46, 0.46, 0.58, 0.68, -1.3, -1.22);
  M.boxB('steel', -0.46, 0.46, 1.36, 1.42, -1.29, -1.24);
  for (const sd of [-1, 1]) M.boxB('steel', sd * 0.44 - 0.025, sd * 0.44 + 0.025, 0.68, 1.42, -1.29, -1.24);
  M.cls = 1; for (let k = 1; k < 7; k++) { const x = lerp(-0.44, 0.44, k / 7); M.boxB('steel', x - 0.012, x + 0.012, 0.68, 1.36, -1.28, -1.25); } M.cls = 0;
  for (const sd of [-1, 1]) {
    M.boxB('steel', sd * 0.25 - 0.05, sd * 0.25 + 0.05, 0.22, 0.7, -1.36, -1.3);
    M.boxB('steel', sd * 0.25 - 0.05, sd * 0.25 + 0.05, 0.22, 0.27, -2.2, -1.3, { bevel: 0.01 });
  }
  // palette (longerons entre les fourches, planches dessus et dessous) et caisse dessus
  M.color([0.62, 0.5, 0.36]); M.cls = 1;
  for (const x of [-0.5, 0, 0.5]) M.boxB('crate', x - 0.05, x + 0.05, 0.27, 0.37, -2.15, -1.38);
  for (let k = 0; k < 5; k++) { const z = lerp(-2.1, -1.43, k / 4); M.boxB('crate', -0.58, 0.58, 0.37, 0.4, z - 0.05, z + 0.05); }
  for (const z of [-2.1, -1.43]) M.boxB('crate', -0.58, 0.58, 0.18, 0.21, z - 0.05, z + 0.05);
  M.cls = 0; M.color([0.72, 0.58, 0.4]); M.boxB('crate', -0.5, 0.5, 0.4, 1.02, -2.08, -1.45, { bevel: 0.02 });
  M.aoFn = null;
});
/* Tente militaire (7 x 4,4 m) : parois de toile, toit à deux pans, mâts, haubans, porte roulée. Parois et toit sont des toiles tendues
   simulées (Maker.toile) : lacées sur le cadre (mâts, sol, faîtage, avant-toit), elles respirent au vent et se creusent sous un souffle ;
   la toile autour de la porte reste tenue (le rabat roulé et l'ouverture sombre n'en bougent pas) */
PF.tent = () => prefab('tent', (M) => {
  M.color([0.5, 0.52, 0.38]);
  const hx = 3.5, hz = 2.2, wh = 2.1, ridge = 3.3, edge = (u, v) => u <= 0 || u >= 1 || v <= 0 || v >= 1;
  // parois légèrement creusées entre les mâts
  for (const s of [1, -1]) M.toile(8, 2, (u, v) => [lerp(-hx, hx, u), v * wh, s * (hz - 0.06 * Math.sin(u * Math.PI * 3) * Math.sin(v * Math.PI))], { uL: 7, vL: 2.1, flipN: s < 0, play: 0.1, pin: (u, v) => edge(u, v) || Math.abs(u - 0.5) < 0.03 || (s > 0 && Math.abs(lerp(-hx, hx, u)) < 0.95) });
  for (const s of [1, -1]) M.toile(4, 2, (u, v) => [s * (hx - 0.04 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI)), v * wh, lerp(-hz, hz, u)], { uL: 4.4, vL: 2.1, flipN: s > 0, play: 0.1 });
  // toit
  M.color([0.46, 0.48, 0.34]);
  for (const s of [1, -1]) M.toile(8, 3, (u, v) => [lerp(-hx - 0.2, hx + 0.2, u), lerp(wh - 0.12, ridge, v) - Math.sin(v * Math.PI) * 0.05 * (1 - Math.abs(Math.sin(u * Math.PI * 3))), s * lerp(hz + 0.3, 0, v)], { uL: 7.4, vL: 2.8, flipN: s < 0, play: 0.14, pin: (u, v) => v <= 0 || v >= 1 || Math.abs(lerp(-hx - 0.2, hx + 0.2, u)) > hx - 0.05 || Math.abs(u - 0.5) < 0.02 });
  for (const s of [1, -1]) M.quad('canvas', [s * hx, wh, -hz], [s * hx, wh, hz], [s * hx, ridge, 0.01], [s * hx, ridge, -0.01], [s, 0, 0]);
  // porte roulée (côté +z), mâts et haubans
  M.color([0.12, 0.1, 0.08]); M.quad('dark', [-0.7, 0, hz + 0.01], [0.7, 0, hz + 0.01], [0.7, 1.9, hz + 0.01], [-0.7, 1.9, hz + 0.01], [0, 0, 1]);
  M.color([0.45, 0.46, 0.33]); M.save().move(-0.8, 1.95, hz + 0.08).rotZ(-Math.PI / 2); M.cyl('canvas', 0.09, 1.6, 8); M.restore();
  M.color([0.3, 0.26, 0.2]);
  for (const x of [-hx, 0, hx]) { M.save().move(x, 0, 0); M.cyl('wood', 0.04, ridge + 0.1, 6); M.restore(); }
  M.color([0.7, 0.66, 0.55]); M.cls = 2;
  for (const x of [-hx + 0.3, -1.2, 1.2, hx - 0.3]) for (const s of [1, -1]) { M.tube('plastic', 0.008, [[x, wh - 0.1, s * (hz + 0.3)], [x, 0, s * (hz + 1.3)]], 3); M.save().move(x, 0, s * (hz + 1.3)); M.cyl('steel', 0.015, 0.2, 4); M.restore(); }
});
/* Vantail de portail : planches cloutées, pentures en fer (ouvert, plaqué contre le mur ; épaisseur en x) */
PF.gateLeaf = () => prefab('gateLeaf', (M) => {
  M.color([0.5, 0.36, 0.24]).local(1);
  for (let i = 0; i < 9; i++) { const z = -1.0 + i * 0.222; M.boxB('wood', -0.1, 0.1, 0, 3.5 - (i % 2) * 0.03, z + 0.004, z + 0.218, { bevel: 0.01 }); }
  // âme pleine entre les planches : leurs jours de 8 mm laissaient voir au travers d'un vantail qui arrête les balles (fentes.js)
  M.color([0.3, 0.21, 0.14]); M.boxB('wood', -0.03, 0.03, 0.02, 3.44, -0.99, 0.99);
  M.color([0.14, 0.13, 0.12]);
  for (const y of [0.45, 1.75, 3.05]) for (const s of [-1, 1]) M.boxB('steel', s * 0.1, s * 0.115, y, y + 0.1, -1.0, 0.9);
  M.cls = 2;
  for (const y of [0.5, 1.8, 3.1]) for (let z = -0.9; z < 0.9; z += 0.3) for (const s of [-1, 1]) M.boxB('steel', s * 0.114, s * 0.13, y + 0.02, y + 0.06, z, z + 0.04);
});
/* Poutre en I (poteau), hauteur h */
PF.iBeam = (h) => prefab('ibeam' + h, (M) => {
  M.color([0.3, 0.31, 0.3]).local(1);
  const I = [[-0.1, -0.1], [0.1, -0.1], [0.1, -0.085], [0.012, -0.085], [0.012, 0.085], [0.1, 0.085], [0.1, 0.1], [-0.1, 0.1], [-0.1, 0.085], [-0.012, 0.085], [-0.012, -0.085], [-0.1, -0.085]];
  M.save().mul(basis([1, 0, 0], [0, 0, -1], [0, 1, 0])); M.extrude('steel', I, h, { sharp: 0.3 }); M.restore();
  M.boxB('steel', -0.16, 0.16, 0, 0.02, -0.16, 0.16);
});
/* Ferme de toiture en treillis (le long de z, longueur L), en acier */
PF.truss = (L) => prefab('truss' + L.toFixed(1), (M) => {
  M.color([0.3, 0.31, 0.3]).local(1);
  const n = Math.max(2, Math.round(L / 1.4)), hl = L / 2;
  M.boxB('steel', -0.05, 0.05, 0.25, 0.3, -hl, hl); M.boxB('steel', -0.05, 0.05, -0.02, 0.03, -hl, hl);
  for (let i = 0; i <= n; i++) {
    const z = -hl + (L * i) / n; M.boxB('steel', -0.03, 0.03, 0, 0.28, z - 0.03, z + 0.03);
    if (i < n) { const z1 = -hl + (L * (i + 1)) / n, ang = Math.atan2(0.28, z1 - z) * (i % 2 ? 1 : -1); M.save().move(0, 0.14, (z + z1) / 2).rotX(ang).move(0, -0.02, 0); M.box('steel', 0.04, 0.04, hyp(0.28, z1 - z)); M.restore(); }
  }
});
/* Colonne du souk : base moulurée, fût, chapiteau, sur hauteur h (teintable) */
PF.column = (h) => prefab('column' + h, (M, P) => {
  P.tintable = ['plaster'];
  M.world(1);
  M.boxB('plaster', -0.3, 0.3, 0, h, -0.3, 0.3, { skip: 'yY' });
  M.local(1); M.color([0.95, 0.9, 0.82]);
  M.boxB('ashlar', -0.38, 0.38, 0, 0.3, -0.38, 0.38, { bevel: 0.03 });
  M.boxB('ashlar', -0.34, 0.34, 0.3, 0.38, -0.34, 0.34, { bevel: 0.02 });
  M.boxB('ashlar', -0.36, 0.36, h - 0.42, h - 0.3, -0.36, 0.36, { bevel: 0.02 });
  M.boxB('ashlar', -0.42, 0.42, h - 0.3, h, -0.42, 0.42, { bevel: 0.03 });
});
/* Comptoir de marchand (1,6 x 2,4 m) : caisson en planches verticales dans un cadre (montants d'angle, traverse haute), socle en retrait,
   plateau débordant, marchandises */
PF.counter = () => prefab('counter', (M) => {
  M.color([0.62, 0.46, 0.32]).local(1);
  M.uvS = 1;
  M.boxB('wood', -0.78, 0.78, 0.08, 0.94, -1.18, 1.18);
  M.color([0.32, 0.22, 0.14]); M.boxB('wood', -0.74, 0.74, 0, 0.08, -1.14, 1.14); // socle en retrait
  M.color([0.5, 0.36, 0.25]); M.cls = 1;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.boxB('wood', sx * 0.78 - 0.05, sx * 0.78 + 0.05, 0.08, 0.94, sz * 1.18 - 0.05, sz * 1.18 + 0.05); // montants d'angle
  for (const sx of [-1, 1]) M.boxB('wood', sx * 0.78 - 0.03, sx * 0.78 + 0.03, 0.8, 0.94, -1.18, 1.18); for (const sz of [-1, 1]) M.boxB('wood', -0.78, 0.78, 0.8, 0.94, sz * 1.18 - 0.03, sz * 1.18 + 0.03);
  M.color([0.42, 0.3, 0.2]);
  for (let z = -0.9; z < 0.95; z += 0.3) for (const sx of [-1, 1]) M.boxB('wood', sx * 0.781 - 0.003, sx * 0.781 + 0.003, 0.1, 0.8, z - 0.005, z + 0.005);
  for (let x = -0.45; x < 0.5; x += 0.3) for (const sz of [-1, 1]) M.boxB('wood', x - 0.005, x + 0.005, 0.1, 0.8, sz * 1.181 - 0.003, sz * 1.181 + 0.003);
  M.cls = 0;
  M.color([0.5, 0.36, 0.25]); M.boxB('wood', -0.82, 0.82, 0.94, 1.0, -1.22, 1.22, { bevel: 0.015 });
  M.save().move(0, 1.0, -0.6); M.put(PF.fruitCrate(), { tint: [0.95, 0.5, 0.1] }); M.restore();
  M.pcol(-0.82, 0.82, 0.94, 1.0, -1.22, 1.22); // le plateau porte les marchandises, qui sont des corps physiques
  M.save().move(0.1, 1.0, 0.35).rotY(0.4); M.dyn('spiceSack', 0, 0, 0, 0, { tint: [0.85, 0.3, 0.12] }); M.restore();
  M.save().move(-0.3, 1.0, 0.8); M.dyn('spiceSack', 0, 0, 0, 0, { tint: [0.9, 0.72, 0.2] }); M.restore();
  M.save().move(0.45, 1.0, 0.9); M.dyn('jar', 0, 0, 0, 0, { s: 0.5 }); M.restore();
});
/* Lanterne marocaine en laiton suspendue par une chaîne (d'après photos) : maillons, dôme en bulbe et sa flèche, corps à six pans vitrés
   entre des montants, coupelle et goutte en bas ; flamme cuite dans le volume d'éclairage */
PF.lantern = () => prefab('lantern', (M) => {
  M.color([0.55, 0.42, 0.2]); M.cls = 1;
  for (let k = 0; k < 12; k++) { const y = -0.04 - k * 0.07; M.save().move(0, y, 0).rotY(k % 2 ? Math.PI / 2 : 0); M.tube('steel', 0.005, Array.from({ length: 7 }, (_, i) => { const a = (i / 6) * TAU; return [Math.cos(a) * 0.012, Math.sin(a) * 0.036, 0]; }), 3); M.restore(); }
  M.lathe('steel', [[0, -0.84], [0.012, -0.86], [0.03, -0.9], [0.09, -0.95], [0.135, -1.0], [0.14, -1.03], [0.12, -1.04]], 6, { sharp: 0.6 }); // dôme en bulbe
  M.save().move(0, -0.84, 0); M.cyl('steel', 0.008, 0.06, 4); M.restore();
  for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU + Math.PI / 6; M.tube('steel', 0.007, [[Math.cos(a) * 0.12, -1.04, Math.sin(a) * 0.12], [Math.cos(a) * 0.105, -1.24, Math.sin(a) * 0.105]], 3); }
  M.color([1.0, 0.72, 0.38]); M.lathe('plastic', [[0.118, -1.04], [0.103, -1.24]], 6, { sharp: 0.2 }); // verre ambré (opaque : la flamme est dans le volume d'éclairage)
  M.color([0.55, 0.42, 0.2]); M.lathe('steel', [[0.11, -1.24], [0.115, -1.255], [0.08, -1.29], [0.03, -1.31], [0.012, -1.35], [0, -1.37]], 6, { sharp: 0.6 });
  M.lamp(0, -1.16, 0, [1.0, 0.6, 0.28], 2.6, 7); // flamme chaude, cuite dans le volume d'éclairage
});
/* Suspension sous un plafond (posée au plafond, pend de len m) : câble, abat-jour émaillé, ampoule ; sa lumière est cuite dans le volume
   d'éclairage. cool : néon d'atelier (abat-jour vert, lumière blanche froide, portée plus longue), sinon ampoule chaude de maison */
PF.hangLamp = (cool, len = 0.8) => prefab('hangLamp' + (cool ? 'C' : 'W') + len, (M) => {
  M.color([0.18, 0.18, 0.18]); M.cls = 1;
  M.save().move(0, -len, 0); M.cyl('steel', 0.006, len, 3, { caps: '' }); M.restore();
  const sh = [[0.27, -len - 0.24], [0.25, -len - 0.22], [0.1, -len - 0.07], [0.03, -len - 0.02], [0.03, -len]];
  M.color(cool ? [0.24, 0.36, 0.3] : [0.86, 0.82, 0.72]); M.lathe('paint', sh, 12, { sharp: 1.2 });
  M.color([0.92, 0.9, 0.84]); M.lathe('paint', sh.slice().reverse().map(([r, y]) => [r * 0.97, y - 0.004]), 12, { sharp: 1.2 }); // dedans de l'abat-jour
  M.save().move(0, -len - 0.2, 0); M.cyl(cool ? 'lampCool' : 'lamp', 0.05, 0.08, 8); M.restore();
  M.lamp(0, -len - 0.3, 0, cool ? [0.78, 0.9, 1.0] : [1.0, 0.66, 0.36], cool ? 7 : 1.6, cool ? 12 : 7, 0.8);
});
/* Étal de marché (2,4 x 1,2 m) : table, montants, toile tendue (simulée : Maker.toile, tenue aux bords avant et arrière et sur les montants,
   son lambrequin bat au vent), marchandises. couleur : toile */
PF.stall = (color) => prefab('stall' + color.join(','), (M) => {
  const w = 2.4, d = 1.2, R = rngOf(Math.round(color[0] * 100 + color[1] * 10));
  M.color([0.66, 0.52, 0.38]).local(1);
  M.boxB('wood', -w / 2, w / 2, 0.88, 0.95, -d / 2, d / 2, { bevel: 0.01 });
  M.boxB('wood', -w / 2 + 0.05, w / 2 - 0.05, 0, 0.88, -d / 2 + 0.05, d / 2 - 0.05, { skip: 'Y' });
  M.color([0.45, 0.35, 0.26]);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M.boxB('wood', a * (w / 2 - 0.05) - 0.035, a * (w / 2 - 0.05) + 0.035, 0.95, 2.35 + (b > 0 ? 0 : 0.25), b * (d / 2 - 0.05) - 0.035, b * (d / 2 - 0.05) + 0.035);
  M.color(color);
  M.toile(6, 3, (u, v) => [lerp(-w / 2 - 0.2, w / 2 + 0.2, u), lerp(2.62, 2.33, v) - Math.sin(u * Math.PI) * 0.04, lerp(-d / 2 - 0.25, d / 2 + 0.3, v)], { uL: 2.8, vL: 1.7, flipN: true, play: 0.12, glow: 0.3, pin: (u, v) => v <= 0 || v >= 1 || Math.abs(Math.abs(lerp(-w / 2 - 0.2, w / 2 + 0.2, u)) - (w / 2 - 0.05)) < 0.12 });
  M.toile(6, 1, (u, v) => [lerp(-w / 2 - 0.2, w / 2 + 0.2, u), lerp(2.33, 2.1, v), d / 2 + 0.3], { uL: 2.8, vL: 0.25, play: 0.14, glow: 0.3, pin: (u, v) => v <= 0 });
  M.occ(-w / 2, w / 2, 2.2, 2.6, -d / 2, d / 2, 0.6);
  M.pcol(-w / 2, w / 2, 0.88, 0.95, -d / 2, d / 2); // le plateau porte les marchandises, qui sont des corps physiques
  for (let i = 0; i < 4; i++) {
    const x = -0.85 + i * 0.57 + (R() - 0.5) * 0.1, r = R();
    M.save().move(x, 0.95, (R() - 0.5) * 0.3).rotY((R() - 0.5) * 0.4);
    if (r < 0.5) M.put(PF.fruitCrate(), { tint: R.pick([[0.95, 0.5, 0.1], [0.8, 0.12, 0.08], [0.55, 0.75, 0.2], [0.95, 0.85, 0.3]]) });
    else if (r < 0.8) M.dyn('spiceSack', 0, 0, 0, 0, { tint: R.pick([[0.85, 0.3, 0.12], [0.9, 0.72, 0.2], [0.45, 0.3, 0.2], [0.6, 0.55, 0.2]]) });
    else M.dyn('jar', 0, 0, 0, 0, { s: 0.6 });
    M.restore();
  }
  M.save().move(0, 0.02, d / 2 + 0.25).rotY(0.1); M.dyn('jar', 0, 0, 0, 0, { s: 0.9 }); M.restore();
});

}catch(e){HOOKS.missing['02f-props.js']=String(e&&e.message||e)}
/* ===== 02k-dynprops.js ===== */
try{
/* ==========================================================================
   PROPS PHYSIQUES : kit. Des objets légers du décor (fruits, pots, chaises, bonhomme de neige, barque...) qui ne sont
   pas fusionnés avec la carte : ce sont des corps rigides (voir 04b-physprops.js pour la simulation), dessinés en
   instances. Ils réagissent aux balles, aux explosions et aux soldats qui les bousculent, sans changer le jeu : un prop
   qui avait une collision la garde tant qu'on n'y a pas touché (mêmes boîtes qu'avant), et ne la rend qu'une fois délogé.
   - Un TYPE (propType) décrit un objet : son prefab, ses formes de contact (sphère, boîte, cylindre), sa masse et sa
     réaction (tir, souffle), ce qu'il devient s'il casse. Une usine à paramètres permet des variantes (carton : w, h, d).
   - Une VARIANTE est un type : une géométrie partagée et un InstancedMesh par matière (un appel de rendu par matière, quel
     que soit le nombre d'objets). La teinte de chaque objet passe par la couleur d'instance (les fruits orange, rouges et
     verts sont dans le même maillage). Les maillages de débris restent invisibles tant que rien n'a éclaté.
   - Un CORPS (PBody) est un objet posé sur la carte, avec sa position, son orientation et ses vitesses.
   Poser un prop : M.dyn('type', x, y, z, ry, { tint, s, a, rx, rz }) dans l'atelier (ou depuis un prefab, qui le recrée
   à chaque estampille). Tout se construit pendant la construction de la carte (propsFinalize en fin de décor) : rien de
   lourd en pleine partie, les débris sont des corps dormants réservés d'avance.
   ========================================================================== */
var PHYS = {
  bodies: [], defs: new Map(), variants: new Map(), pcols: [], phash: new Map(), balls: [], awake: [], slept: [], stackers: [], moving: new Set(),
  live: false, ready: false, g: 15, maxAwake: 150, nextId: 0, pv: 0, acc: 0, // pv : numéro des listes awake et slept (paires candidates, 04b-physprops.js) ; acc : temps pas encore simulé (PH.hMin)
};
var PROPT = {}; // types : id -> définition, ou usine (a) => définition
function propType(id, def) { PROPT[id] = def; return def; }
/* Formes de contact, dans le repère du prefab (posé sur y = 0) : sphère, boîte (demi-dimensions), cylindre vertical (demi-hauteur) */
var SPH = (cx, cy, cz, r) => ['s', cx, cy, cz, r];
var BOX = (cx, cy, cz, hx, hy, hz) => ['b', cx, cy, cz, hx, hy, hz];
var CYL = (cx, cy, cz, r, hh) => ['y', cx, cy, cz, r, hh];

/* Définition complète d'un type : formes recentrées sur le centre de masse, masse volumique et inertie, points de contact */
function propDef(type, a) {
  const key = type + (a && a.length ? '|' + a.join(',') : '');
  let d = PHYS.defs.get(key); if (d) return d;
  const F = PROPT[type]; if (!F) throw new Error('prop inconnu : ' + type);
  d = Object.assign({ mass: 1, mu: 0.6, e: 0.3, drag: 0.05, rr: 2.5, resp: 3, blast: 8, lift: 0.5, hp: Infinity, mat: 'concrete', snd: 'hard', ray: true, hold: 0, stack: false, spill: false, topple: 0, through: false, ball: false, debris: null }, typeof F === 'function' ? F(a || []) : F);
  d.type = type; d.key = key;
  // centre de masse : celui du type, sinon le centre de la boîte englobante des formes
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z0 = 1e9, z1 = -1e9;
  const ext = (cx, cy, cz, hx, hy, hz) => { x0 = Math.min(x0, cx - hx); x1 = Math.max(x1, cx + hx); y0 = Math.min(y0, cy - hy); y1 = Math.max(y1, cy + hy); z0 = Math.min(z0, cz - hz); z1 = Math.max(z1, cz + hz); };
  for (const s of d.shapes) {
    if (s[0] === 's') ext(s[1], s[2], s[3], s[4], s[4], s[4]); else if (s[0] === 'b') ext(s[1], s[2], s[3], s[4], s[5], s[6]); else ext(s[1], s[2], s[3], s[4], s[5], s[4]);
  }
  d.com = d.com || [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  const [mx, my, mz] = d.com;
  d.sh = d.shapes.map((s) => { const o = s.slice(); o[1] -= mx; o[2] -= my; o[3] -= mz; return o; });
  // inertie principale (pour s = 1) : sphère, cylindre ou boîte englobante
  const m = d.mass, lx = x1 - x0, ly = y1 - y0, lz = z1 - z0;
  let I;
  if (d.sh.length === 1 && d.sh[0][0] === 's') { const q = 0.4 * m * d.sh[0][4] ** 2; I = [q, q, q]; }
  else if (d.sh.length === 1 && d.sh[0][0] === 'y') { const r = d.sh[0][4], h = 2 * d.sh[0][5], t = m * (3 * r * r + h * h) / 12; I = [t, m * r * r / 2, t]; }
  else I = [m * (ly * ly + lz * lz) / 12, m * (lx * lx + lz * lz) / 12, m * (lx * lx + ly * ly) / 12];
  d.ii = I.map((v) => 1 / Math.max(v, 1e-5));
  // rayon englobant et points de contact (x, y, z, rayon), dans le repère du centre de masse
  let rad = 0; const pts = [];
  for (const s of d.sh) {
    if (s[0] === 's') { rad = Math.max(rad, hyp3(s[1], s[2], s[3]) + s[4]); pts.push([s[1], s[2], s[3], s[4]]); }
    else if (s[0] === 'b') {
      rad = Math.max(rad, hyp3(s[1], s[2], s[3]) + hyp3(s[4], s[5], s[6]));
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) pts.push([s[1] + sx * s[4], s[2] + sy * s[5], s[3] + sz * s[6], 0]);
    } else {
      rad = Math.max(rad, hyp3(s[1], s[2], s[3]) + hyp(s[4], s[5]));
      for (const sy of [-1, 1]) for (let k = 0; k < 12; k++) { const t = (k / 12) * TAU; pts.push([s[1] + Math.cos(t) * s[4], s[2] + sy * s[5], s[3] + Math.sin(t) * s[4], 0]); }
    }
  }
  d.pts = d.contact ? d.contact.map((p) => [p[0] - mx, p[1] - my, p[2] - mz, p[3] || 0]) : pts;
  // points de sonde pour les collisions entre corps (propDeepest) : coins, centres des faces et des bases. Les coins seuls ne voient pas
  // deux boîtes de même empreinte qui se traversent à la verticale (leurs coins restent sur les parois de l'autre).
  d.qp = [];
  for (const s of d.sh) {
    if (s[0] === 's') d.qp.push([s[1], s[2], s[3]]);
    else if (s[0] === 'b') {
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) d.qp.push([s[1] + sx * s[4], s[2] + sy * s[5], s[3] + sz * s[6]]);
      for (const k of [-1, 1]) d.qp.push([s[1] + k * s[4], s[2], s[3]], [s[1], s[2] + k * s[5], s[3]], [s[1], s[2], s[3] + k * s[6]]);
    } else {
      for (const sy of [-1, 1]) { d.qp.push([s[1], s[2] + sy * s[5], s[3]]); for (let k = 0; k < 12; k++) { const t = (k / 12) * TAU; d.qp.push([s[1] + Math.cos(t) * s[4], s[2] + sy * s[5], s[3] + Math.sin(t) * s[4]]); } }
    }
  }
  d.rad = rad;
  // volume des formes (s = 1) et masse volumique : un corps plus léger que l'eau y flotte (propStep), sauf d.sink (sable, métal, gaz, poterie
  // pleine de terre) ; d.hy : demi-hauteur des formes, sur laquelle se mesure la part immergée
  let vol = 0; for (const s of d.sh) vol += s[0] === 's' ? 4.19 * s[4] ** 3 : s[0] === 'b' ? 8 * s[4] * s[5] * s[6] : 6.283 * s[4] * s[4] * s[5];
  d.rho = d.sink ? 2500 : d.mass / Math.max(vol, 1e-6); d.hy = (y1 - y0) / 2;
  PHYS.defs.set(key, d);
  return d;
}

/* Variante : un type. Ses corps sont rangés dans un groupe par case de la carte (PCELL m de côté) ; le groupe est un InstancedMesh
   par matière, avec la sphère englobante de ses corps. Une seule case pour l'instant (PCELL énorme) : scinder la carte en
   cases faisait écarter des groupes hors champ mais multipliait les appels de rendu bien plus qu'elle n'en évitait (160 de
   plus en vue ouverte, ombres comprises). */
var PCELL = Infinity;
function propCell(x, z) { return Math.floor(x / PCELL) + ',' + Math.floor(z / PCELL); }
function propVariant(d) {
  let V = PHYS.variants.get(d.key); if (V) return V;
  V = { key: d.key, d, pf: d.pf(), groups: new Map() };
  PHYS.variants.set(d.key, V);
  return V;
}
function propGroup(V, cell) {
  let G = V.groups.get(cell);
  if (!G) V.groups.set(cell, G = { V, cell, bodies: [], pool: [], reserve: 0, attr: null, colors: null, sphere: new THREE.Sphere(), meshes: [], lazy: false, on: false });
  return G;
}
/* Réserve de débris : chaque corps cassable emporte avec lui, dans sa case, les corps dormants dont il aura besoin en cassant */
function propReserve(d, cell) {
  if (!d.debris) return;
  for (const [type, n, a] of d.debris) propGroup(propVariant(propDef(type, a)), cell).reserve += n;
}

var _phM = new Maker(null);
/* Pose un prop : (x, y, z) est l'origine du prefab (au sol). o : tint (sRGB), s (échelle), a (arguments de l'usine),
   rx et rz (inclinaison de départ, en radians), nocol (sans la collision du prefab), id (identifiant d'un corps de réserve) */
function propSpawn(type, x, y, z, ry = 0, o = {}) {
  const d = propDef(type, o.a), V = propVariant(d), s = o.s || 1;
  const b = new PBody(d, V, s);
  if (o.tint) { b.tintRaw = o.tint; b.tint = [sl(o.tint[0]), sl(o.tint[1]), sl(o.tint[2])]; }
  const q = b.q; q.setFromEuler(_peul.set(o.rx || 0, ry, o.rz || 0, 'YXZ'));
  propRot(b);
  b.p.set(x + (b.R[0] * d.com[0] + b.R[1] * d.com[1] + b.R[2] * d.com[2]) * s, y + (b.R[3] * d.com[0] + b.R[4] * d.com[1] + b.R[5] * d.com[2]) * s, z + (b.R[6] * d.com[0] + b.R[7] * d.com[1] + b.R[8] * d.com[2]) * s);
  b.origin = { x, y, z, ry, rx: o.rx || 0, rz: o.rz || 0 };
  // collision du prefab : les mêmes boîtes qu'avant, que les tirs ignorent (la forme du prop s'en charge) ; rendue au premier choc
  if (!o.nocol && V.pf.cols.length) {
    _phM.m.makeTranslation(x, y, z); _phM.m.multiply(_pdm.makeRotationFromQuaternion(q)); _phM.m.multiply(_pdm.makeScale(s, s, s));
    for (const c of V.pf.cols) {
      const bb = _phM._aabb(c.x0, c.x1, c.y0, c.y1, c.z0, c.z1), e = { x0: bb.x0, x1: bb.x1, y0: bb.y0, y1: bb.y1, z0: bb.z0, z1: bb.z1, m: c.m, ray: !!c.ray, noRay: true, prop: b };
      e.o = [e.x0, e.x1, e.y0, e.y1, e.z0, e.z1];
      COL.push(e); b.cols.push(e);
      if (c.occ !== false && !c.ray) OCC.push({ x0: bb.x0, x1: bb.x1, y0: bb.y0, y1: bb.y1, z0: bb.z0, z1: bb.z1, k: 1 });
    }
  }
  const cell = propCell(x, z), G = propGroup(V, cell);
  propReserve(d, cell);
  b.id = PHYS.nextId++; b.G = G; b.cell = cell; b.vi = G.bodies.length; G.bodies.push(b); PHYS.bodies.push(b);
  if (d.ball) PHYS.balls.push(b);
  PHYS.live = true;
  return b;
}
var _peul = new THREE.Euler(), _pdm = new THREE.Matrix4();
/* Boîte de collision de la carte que les corps listés se partagent (deux jarres contre un mur) : les tirs l'ignorent, les
   soldats la rencontrent, et elle disparaît dès que l'un des corps est délogé */
function propLink(bodies, bb, m) {
  const e = { x0: bb.x0, x1: bb.x1, y0: bb.y0, y1: bb.y1, z0: bb.z0, z1: bb.z1, m, ray: false, noRay: true, prop: bodies[0] };
  e.o = [e.x0, e.x1, e.y0, e.y1, e.z0, e.z1];
  COL.push(e); OCC.push({ ...bb, k: 1 });
  for (const b of bodies) b.cols.push(e);
}
/* Collision réservée aux props (parois du cageot de fruits) */
function propBlock(bb, tag) { PHYS.pcols.push({ x0: bb.x0, x1: bb.x1, y0: bb.y0, y1: bb.y1, z0: bb.z0, z1: bb.z1, m: 'wood', ray: false, crate: tag === 'crate', o: [bb.x0, bb.x1, bb.y0, bb.y1, bb.z0, bb.z1] }); }

/* Fin de la construction du décor : corps de réserve, géométries partagées, instances. Appelé juste après finalizeWorld. */
function propsFinalize() {
  // débris : une réserve de corps dormants par groupe (les types de débris n'ont pas de prefab posé sur la carte)
  for (const V of [...PHYS.variants.values()]) for (const G of V.groups.values()) {
    for (let i = 0; i < G.reserve; i++) {
      const b = new PBody(V.d, V, 1); b.state = 0; b.pooled = true; b.G = G; b.cell = G.cell; b.id = PHYS.nextId++; b.vi = G.bodies.length;
      G.bodies.push(b); G.pool.push(b); PHYS.bodies.push(b); if (V.d.ball) PHYS.balls.push(b);
    }
  }
  for (const V of PHYS.variants.values()) {
    const pf = V.pf, parts = [];
    for (const part of pf.parts.values()) { const mat = propMat(part.mat); if (part.g.nv && mat) parts.push({ part, mat, geo: propGeometry(V, part) }); }
    for (const G of V.groups.values()) {
      const n = Math.max(1, G.bodies.length), tinted = G.bodies.some((b) => b.tint);
      G.attr = new THREE.InstancedBufferAttribute(new Float32Array(n * 16), 16).setUsage(THREE.DynamicDrawUsage);
      if (tinted) {
        G.colors = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3);
        for (const b of G.bodies) if (b.tint) G.colors.array.set(b.tint, b.vi * 3);
      }
      G.lazy = G.bodies.every((b) => b.pooled); // débris : le maillage n'existe à l'écran qu'à partir du premier éclatement
      for (const { part, mat, geo } of parts) {
        // une géométrie par groupe (sphère englobante propre), les tampons de sommets restent partagés
        const g2 = new THREE.BufferGeometry(); for (const k in geo.attributes) g2.setAttribute(k, geo.attributes[k]); g2.setIndex(geo.index); g2.boundingSphere = G.sphere;
        const mesh = new THREE.InstancedMesh(g2, mat, n), cls = part.cls >= 2 ? 1 : part.cls;
        mesh.instanceMatrix = G.attr; mesh.count = n; mesh.matrixAutoUpdate = false;
        // la teinte de l'objet (couleur d'instance) ne touche que les pièces teintables du prefab. Tous les maillages de props ont
        // une couleur d'instance, blanche à défaut : three.js choisit le programme d'une matière au premier maillage instancié qui
        // l'utilise, et un maillage sans couleur d'instance sur un programme qui en lit une serait noir (ou, dans l'autre sens, les
        // teintes seraient ignorées selon l'ordre de construction des variantes)
        if (tinted && (pf.tintable ? pf.tintable.includes(part.mat) : true)) mesh.instanceColor = G.colors;
        else mesh.instanceColor = G.white || (G.white = new THREE.InstancedBufferAttribute(new Float32Array(n * 3).fill(1), 3));
        mesh.name = 'prop:' + V.key + ':' + G.cell + ':' + part.mat;
        mesh.castShadow = cls === 0 && !mat.userData.noShadow; mesh.receiveShadow = !mat.userData.noReceive;
        if (mat.userData.noAO) mesh.userData.noAO = true;
        if (cls === 0 && NEAR_SHADOW.has(part.mat)) mesh.layers.set(LAYER_NEAR);
        mesh.userData.noPrepass = true; mesh.visible = !G.lazy;
        mapAdd(mesh); G.meshes.push(mesh);
      }
      for (const b of G.bodies) propWrite(b);
      G.attr.needsUpdate = true; propGroupBounds(G);
    }
    V.pf = null; // ses tampons ne servent plus : la géométrie est partagée
  }
  propsIndex();
  // volumes des collisions réservées aux props : table de hachage de 2 m
  PHYS.phash.clear();
  PHYS.pcols.forEach((c, i) => {
    for (let x = Math.floor(c.x0 / 2); x <= Math.floor(c.x1 / 2); x++) for (let z = Math.floor(c.z0 / 2); z <= Math.floor(c.z1 / 2); z++) {
      const k = x * 1000 + z; let a = PHYS.phash.get(k); if (!a) PHYS.phash.set(k, a = []); a.push(i);
    }
  });
  PHYS.ready = true;
}
/* Matière d'un prop : une copie de celle du décor. three.js ne garde qu'un programme par matière, et le programme d'un maillage instancié
   n'est pas celui d'un maillage simple : partagée entre le décor et les props, une matière changeait de programme deux fois par image et
   three.js recalculait chaque fois sa clé (getParameters, getProgramCacheKey : 13 matières sur Khamsin, 26 recalculs et 19 Ko alloués par
   image, saccades.js). Une copie par matière, gardée pour la carte (libérée avec ses maillages par mapUnload). Elle reste inscrite aux ombres
   en cascade par la matière d'origine (même onBeforeCompile : elles partagent le tableau des cascades).
   Les defines sont ceux de la matière, partagés : la copie de three.js (MeshStandardMaterial.copy) les remet à { STANDARD }, et le prop
   perdait l'éclairage cuit du décor (WM : il sortait plus clair et délavé) et les ombres en cascade. Les ombres s'installent après la copie
   (shadeMaterials) : propMatsSync y reprend la chaîne de la matière d'origine. */
var PROP_MATS = new Map();
function propMat(k) {
  const m = MAT[k]; if (!m) return m;
  let c = PROP_MATS.get(m); if (c) return c;
  c = m.clone(); c.defines = m.defines; c.onBeforeCompile = m.onBeforeCompile; c.userData = m.userData; c.customProgramCacheKey = m.customProgramCacheKey;
  c.uuid = 'decor-' + k + '-prop'; // identifiant fixe, comme celui de la matière (shadeMaterials, appelée plus tard) : le cache des matières d'ombre de three.js ne grossit pas d'une partie à l'autre
  PROP_MATS.set(m, c); return c;
}
/* Après l'installation des ombres sur les matières du décor (shadeMaterials) : les copies des props reprennent leur chaîne de compilation */
function propMatsSync() {
  for (const [m, c] of PROP_MATS) { c.defines = m.defines; c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; }
}
/* Géométrie partagée d'une pièce du prefab, recentrée sur le centre de masse */
function propGeometry(V, part) {
  const g = part.g, n = g.nv, com = V.d.com;
  const P = new Float32Array(n * 3), C = g.C.slice(0, n * 3);
  for (let i = 0; i < n; i++) { P[i * 3] = g.P[i * 3] - com[0]; P[i * 3 + 1] = g.P[i * 3 + 1] - com[1]; P[i * 3 + 2] = g.P[i * 3 + 2] - com[2]; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(g.N.slice(0, n * 3), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(g.U.slice(0, n * 2), 2));
  geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
  geo.setAttribute('aoc', new THREE.BufferAttribute(g.A.slice(0, n), 1));
  geo.setIndex(new THREE.BufferAttribute(n > 65535 ? g.I.slice(0, g.ni) : Uint16Array.from(g.I.subarray(0, g.ni)), 1));
  geo.computeBoundingSphere(); geo.computeBoundingBox();
  return geo;
}

/* ---------- Prefabs des props ---------- */
var G_FRUIT = new THREE.SphereGeometry(1, 9, 6);
/* Fruit : sphère de 6 cm de rayon (la teinte donne l'orange, la pomme, le citron) */
PF.fruitBall = () => prefab('fruitBall', (M) => {
  M.color([1, 1, 1]).local(1);
  M.cls = 1; // pas d'ombre portée : un fruit de 12 cm n'en projette pas de visible
  M.save().move(0, 0.06, 0).scl(0.06); M.geo('plastic', G_FRUIT, { uvs: 0.12 }); M.restore();
});
/* Lattes et plancher d'un cageot de fruits (60 x 40 x 19 cm) : un corps physique, qui emporte ses fruits quand il part */
PF.fruitBox = () => prefab('fruitBox', (M) => {
  M.save().color([0.8, 0.7, 0.55]).local(1);
  for (const y of [0.02, 0.12]) for (const s of [-1, 1]) { M.boxB('crate', -0.3, 0.3, y, y + 0.07, s * 0.2 - 0.01, s * 0.2 + 0.01); M.boxB('crate', s * 0.3 - 0.01, s * 0.3 + 0.01, y, y + 0.07, -0.2, 0.2); }
  M.boxB('crate', -0.3, 0.3, 0, 0.02, -0.2, 0.2);
  M.restore();
});
/* Cageot de fruits : le cageot lui-même (corps `fruitBox`), les parois qui retiennent les fruits (collision réservée aux props,
   étiquette 'crate') et 15 fruits dynamiques à la teinte de l'estampille. Un tir sur le cageot ou un souffle le déplace : ses
   parois disparaissent avec lui et les fruits se répandent. Les fruits seuls roulent et se poussent entre eux. */
PF.fruitCrate = () => prefab('fruitCrate', (M, P) => {
  P.tintable = []; // la teinte de l'estampille est celle des fruits, pas des lattes
  M.dyn('fruitBox', 0, 0, 0, 0);
  M.pcol(-0.3, 0.3, 0, 0.03, -0.2, 0.2, 'crate');
  for (const s of [-1, 1]) { M.pcol(s * 0.3 - 0.01, s * 0.3 + 0.01, 0, 0.2, -0.2, 0.2, 'crate'); M.pcol(-0.3, 0.3, 0, 0.2, s * 0.2 - 0.01, s * 0.2 + 0.01, 'crate'); }
  const R = rngOf(5);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 4; i++) M.dyn('fruit', -0.21 + i * 0.14, 0.03, (j - 1) * 0.12, R() * TAU, { tintFrom: true });
  for (let i = 0; i < 3; i++) M.dyn('fruit', -0.14 + i * 0.14, 0.1275, 0, R() * TAU, { tintFrom: true });
});
propType('fruitBox', { pf: () => PF.fruitBox(), shapes: [BOX(0, 0.095, 0, 0.3, 0.095, 0.2)], mass: 1.4, mu: 0.55, e: 0.2, rr: 3, resp: 4, blast: 10, spill: 'fruit', mat: 'wood', snd: 'wood' });
/* Ce que les fruits ont de commun : de petites sphères qui roulent et se poussent entre elles */
propType('fruit', { pf: () => PF.fruitBall(), shapes: [SPH(0, 0.06, 0, 0.06)], mass: 0.2, mu: 0.5, e: 0.4, rr: 1.2, resp: 6, blast: 11, lift: 1.2, through: true, ball: true, mat: 'dirt', snd: 'fruit' });

/* Tesson de terre cuite : éclat d'un pot ou d'une jarre qui se brise (propKid, 04b-physprops.js). Il s'appelait PF.shard, comme le tesson
   de tuile de la poussière du sol (02h-nature.js), qu'il remplaçait partout (fichiers concaténés : la dernière définition gagne) */
PF.potShard = () => prefab('potShard', (M) => {
  M.color([0.72, 0.42, 0.28]).local(1);
  M.cls = 1;
  M.boxB('concrete', -0.05, 0.05, 0, 0.014, -0.035, 0.035, { bevel: 0.004 });
});
propType('shard', { sink: true, pf: () => PF.potShard(), shapes: [BOX(0, 0.007, 0, 0.05, 0.007, 0.035)], mass: 0.05, mu: 0.7, e: 0.2, rr: 3, ray: false, through: true, mat: 'dirt', snd: 'clay' });
/* Pot et jarre en terre cuite : un tir les brise en tessons */
propType('pot', { sink: true, pf: () => PF.pot(), shapes: [CYL(0, 0.125, 0, 0.14, 0.125)], mass: 6, mu: 0.7, e: 0.2, resp: 2.6, blast: 7, hp: 20, mat: 'dirt', snd: 'clay', brk: 'clay', debris: [['shard', 6]] });
propType('jar', { pf: () => PF.jar(1), shapes: [CYL(0, 0.32, 0, 0.22, 0.32)], mass: 7, mu: 0.7, e: 0.2, resp: 3, blast: 8, hp: 28, mat: 'dirt', snd: 'clay', brk: 'clay', debris: [['shard', 7]] });

/* Caisse en planches (PF.crate, côté s en argument : 0,55 à 1,2 m) : elle résiste à quelques balles, puis bouge et tombe de sa pile. Les grosses (0,9 m et plus)
   bloquent des passages : elles sont des obstacles fixes (fixed), posées comme un décor ordinaire que ni balle ni explosion ne déplace ; les petites restent des props */
propType('crate', (a) => { const s = a[0] || 1.1; return { pf: () => PF.crate(s), shapes: [BOX(0, s / 2, 0, s / 2, s / 2, s / 2)], mass: 22 * s * s * s, mu: 0.6, e: 0.15, rr: 3, resp: 2.4, blast: 6, hold: 12 + 28 * s, stack: true, mat: 'wood', snd: 'wood', fixed: s >= 0.9 }; });
/* Sac d'épices ouvert (48 x 41 cm), sac de sable bas (PF.sandbag), bouteille de bar (hauteur en argument, éclate dès la première balle).
   noNav : la navigation des bots ne pose aucun nœud sur le dessus (un mur de sacs écorné faisait une marche de 0,44 m, plus haute sur une
   dune, où les bots montaient sans pouvoir la franchir ; ils contournent les murs et enjambent un sac tombé) */
propType('spiceSack', { sink: true, pf: () => PF.spiceSack(), shapes: [BOX(0, 0.205, 0, 0.24, 0.205, 0.23)], mass: 9, mu: 0.9, e: 0.05, rr: 6, resp: 2.6, blast: 7, hold: 6, stack: true, mat: 'dirt', snd: 'soft' });
propType('sandbagLow', { sink: true, noNav: true, pf: () => PF.sandbag(), shapes: [BOX(0, 0.075, 0, 0.29, 0.075, 0.165)], mass: 12, mu: 0.9, e: 0.05, rr: 6, resp: 2, blast: 5, hold: 40, stack: true, mat: 'dirt', snd: 'soft' });
propType('bottle', (a) => { const h = a[0] || 0.26; return { pf: () => PF.bottle(h), shapes: [CYL(0, h / 2, 0, 0.035, h / 2)], mass: 0.7, mu: 0.4, e: 0.2, rr: 2, resp: 5, blast: 12, hp: 1, mat: 'glass', snd: 'plastic', brk: 'glass' }; });
/* Glène de cordage lovée (PF.ropeCoil) */
propType('ropeCoil', { pf: () => PF.ropeCoil(), shapes: [CYL(0, 0.09, 0, 0.34, 0.09)], mass: 6, mu: 0.8, e: 0.1, rr: 5, resp: 3, blast: 8, stack: true, mat: 'dirt', snd: 'soft' });
/* Bouteille de verre (corps et goulot), teinte de l'estampille */
PF.bottle = (h = 0.26) => prefab('bottle' + h.toFixed(2), (M) => {
  M.color([1, 1, 1]).local(1); M.cls = 1;
  M.cyl('glass', 0.035, h * 0.62, 6); M.save().move(0, h * 0.62, 0); M.cyl('glass', 0.014, h * 0.38, 6); M.restore();
});

/* Mobilier et objets du quotidien */
propType('chair', { sink: true, pf: () => PF.chair(), shapes: [BOX(0, 0.45, 0, 0.23, 0.45, 0.23)], mass: 2.5, mu: 0.5, e: 0.25, resp: 3.2, blast: 9, mat: 'metal', snd: 'plastic' });
propType('cafeTable', { sink: true, pf: () => PF.cafeTable(), shapes: [CYL(0, 0.35, 0, 0.35, 0.35)], mass: 6, mu: 0.5, e: 0.25, resp: 2.2, blast: 7, mat: 'metal', snd: 'metal' });
propType('jerrycan', { pf: () => PF.jerrycan(), shapes: [BOX(0, 0.24, 0, 0.09, 0.24, 0.17)], mass: 1.6, mu: 0.55, e: 0.25, resp: 4.5, blast: 10, mat: 'metal', snd: 'metal' });
propType('gasBottle', { sink: true, pf: () => PF.gasBottle(), shapes: [CYL(0, 0.33, 0, 0.15, 0.33)], mass: 14, mu: 0.5, e: 0.2, rr: 1.2, resp: 1.8, blast: 6, mat: 'metal', snd: 'metal' });
propType('trashBag', { pf: () => PF.trashBag(), shapes: [SPH(0, 0.24, 0, 0.23)], mass: 3, mu: 1, e: 0.05, rr: 6, resp: 3, blast: 8, mat: 'dirt', snd: 'soft' });
propType('cardboard', (a) => {
  const w = a[0] || 0.5, h = a[1] || 0.4, d = a[2] || 0.4;
  return { pf: () => PF.cardboard(w, h, d), shapes: [BOX(0, h / 2, 0, w / 2, h / 2, d / 2)], mass: 12 * w * h * d, mu: 0.7, e: 0.15, resp: 4, blast: 10, mat: 'dirt', snd: 'soft' };
});
propType('sled', { pf: () => PF.sled(), shapes: [BOX(0, 0.12, -0.03, 0.23, 0.12, 0.5)], mass: 6, mu: 0.35, e: 0.2, resp: 3, blast: 8, mat: 'wood', snd: 'wood' });
/* Skis et bâtons : chacun est un corps, appuyé contre la planche du râtelier (skiRackAt) ; un tir en fait tomber un, pas les autres */
propType('ski', { pf: () => PF.skiOne(), shapes: [BOX(0, 0.875, 0, 0.04, 0.875, 0.012)], mass: 2.2, mu: 0.4, e: 0.2, rr: 3, resp: 3.5, blast: 9, mat: 'wood', snd: 'wood' });
propType('skiPole', { pf: () => PF.skiPole(), shapes: [BOX(0, 0.625, 0, 0.02, 0.625, 0.02)], mass: 0.4, mu: 0.5, e: 0.2, rr: 3, resp: 5, blast: 11, mat: 'wood', snd: 'wood' });

/* Mobilier et caisses : ce qui se tient en équilibre (pile de sacs, de pneus, de caisses) tombe quand son appui part (stack),
   ce qui est lourd résiste aux premiers coups (hold : points de dégâts encaissés avant de bouger) */
propType('table', { pf: () => PF.table(), shapes: [BOX(0, 0.4, 0, 1.0, 0.4, 0.5)], mass: 26, mu: 0.5, e: 0.2, rr: 3, resp: 1.5, blast: 5, hold: 20, mat: 'wood', snd: 'wood' });
propType('barrel', { pf: () => PF.barrel(), shapes: [CYL(0, 0.45, 0, 0.29, 0.45)], mass: 24, mu: 0.45, e: 0.2, rr: 0.9, resp: 1.7, blast: 5, hold: 25, mat: 'metal', snd: 'metal' });
propType('sandbag', { sink: true, noNav: true, pf: () => PF.sandbagFat(), shapes: [BOX(0, 0.11, 0, 0.3, 0.11, 0.2)], mass: 16, mu: 0.9, e: 0.05, rr: 6, resp: 1.8, blast: 5, hold: 70, stack: true, mat: 'dirt', snd: 'soft' });
propType('sandbagHalf', { sink: true, noNav: true, pf: () => PF.sandbagHalf(), shapes: [BOX(0, 0.11, 0, 0.15, 0.11, 0.2)], mass: 8, mu: 0.9, e: 0.05, rr: 6, resp: 2.2, blast: 6, hold: 45, stack: true, mat: 'dirt', snd: 'soft' }); // ferme le bout d'un rang décalé
propType('tire', { pf: () => PF.tire(), shapes: [CYL(0, 0.1, 0, 0.4, 0.1)], mass: 9, mu: 0.8, e: 0.45, rr: 1.2, resp: 2.2, blast: 6, hold: 25, stack: true, mat: 'dirt', snd: 'soft' });
propType('hayBale', { pf: () => PF.hayBale(), shapes: [BOX(0, 0.225, 0, 0.45, 0.225, 0.25)], mass: 22, mu: 0.85, e: 0.05, rr: 6, resp: 1.3, blast: 5, hold: 45, stack: true, mat: 'dirt', snd: 'soft' });
propType('lobsterPot', { sink: true, pf: () => PF.lobsterPot(), shapes: [BOX(0, 0.15, 0, 0.3, 0.15, 0.3)], mass: 8, mu: 0.6, e: 0.2, rr: 3, resp: 2.2, blast: 6, hold: 20, stack: true, mat: 'metal', snd: 'metal' });
/* Bacs à poisson (80 x 50 x 30 cm) : le bac du haut d'une pile porte son lit de glace (`fishBinIce`) et ses poissons, qui se répandent
   quand il part ; les bacs du dessous tombent quand leur appui part */
propType('fishBin', { pf: () => PF.fishBinSolid(), shapes: [BOX(0, 0.15, 0, 0.42, 0.15, 0.25)], mass: 1.3, mu: 0.5, e: 0.2, rr: 3, resp: 3.2, blast: 9, stack: true, mat: 'metal', snd: 'plastic' });
propType('fishBinIce', { pf: () => PF.fishBinIce(), shapes: [BOX(0, 0.15, 0, 0.42, 0.15, 0.25)], mass: 4, mu: 0.5, e: 0.2, rr: 3, resp: 2.4, blast: 7, stack: true, spill: 'fish', mat: 'metal', snd: 'plastic' });
/* Poisson de 30 cm (échelle selon sa longueur, teinte selon l'espèce) : les balles le traversent et le poussent comme un fruit */
propType('fish', { pf: () => PF.fishOne(), shapes: [BOX(0, 0, 0, 0.025, 0.035, 0.17)], mass: 0.45, mu: 0.7, e: 0.1, rr: 4, resp: 6, blast: 11, lift: 1.0, through: true, mat: 'dirt', snd: 'fruit' });
propType('buoy', (a) => {
  const r = a[0] || 0.3;
  return { pf: () => PF.buoy([a[1], a[2], a[3]], r), shapes: [SPH(0, r, 0, r)], mass: 14 * r * r * r * 10, mu: 0.5, e: 0.4, rr: 0.7, resp: 4, blast: 8, mat: 'dirt', snd: 'soft' };
});
/* Vélo : debout sur ses deux roues, il tombe sur le côté dès qu'un tir le touche (topple), guidon et selle en appui */
propType('bicycle', (a) => {
  const rim = [];
  for (const z of [-0.52, 0.52]) for (let i = 0; i < 10; i++) { const t = (i / 10) * TAU; rim.push([0, 0.34 + 0.34 * Math.cos(t), z + 0.34 * Math.sin(t)]); }
  return {
    pf: () => PF.bicycle(), shapes: [BOX(0, 0.5, 0, 0.14, 0.5, 0.55)], com: [0, 0.5, 0],
    contact: [...rim, [0, 0.9, -0.12], [0, 0.86, -0.28], [-0.25, 0.98, 0.34], [0.25, 0.98, 0.34], [0, 0.98, 0.4]],
    mass: 13, mu: 0.5, e: 0.2, rr: 2, resp: 1.6, blast: 6, topple: 3, mat: 'metal', snd: 'metal',
  };
});

/* ---------- Mise en place : chaises face à leur table, râtelier à skis ---------- */
/* Chaise posée en (cx, cz) et tournée vers (tx, tz) : une chaise regarde toujours la table qu'elle sert (le devant du prefab est +z) */
function chairFacing(M, cx, cz, tx, tz, tint, jit = 0, y = 0) { return M.dyn('chair', cx, y, cz, Math.atan2(tx - cx, tz - cz) + jit, { tint }); }
/* Table de café ronde en (x, z) et ses chaises (angle autour de la table en radians, 0 = vers +x) à 0,6 m de l'axe. M : repère du monde. */
function cafeSet(M, x, z, angles, tint) {
  M.dyn('cafeTable', x, 0, z, 0);
  angles.forEach((a, i) => chairFacing(M, x + Math.cos(a) * 0.6, z + Math.sin(a) * 0.6, x, z, tint, (i % 2 ? 0.1 : -0.08)));
}
/* Table en bois de 2 x 1 m (angle ry) et ses chaises : seats = [[lx, lz]...] dans le repère de la table (lz = ±0.72 le long des grands côtés) */
function tableSet(M, x, z, ry, seats, tint) {
  M.dyn('table', x, 0, z, ry);
  const c = Math.cos(ry), s = Math.sin(ry);
  seats.forEach(([lx, lz], i) => chairFacing(M, x + lx * c + lz * s, z - lx * s + lz * c, x, z, tint, (i % 2 ? 0.12 : -0.1)));
}
/* Râtelier à skis posé en (x, z), le dos vers -z tourné de ry : 4 paires de skis et leurs bâtons, chacun un corps indépendant.
   cols : teintes des paires. Rien ne tient les skis que la planche du fond : un tir en fait tomber un, les autres restent. */
function skiRackAt(M, x, z, ry, cols) {
  M.save().move(x, 0, z).rotY(ry); M.put(PF.skiRack());
  cols.forEach((c, k) => {
    const x0 = -0.85 + k * 0.45;
    M.dyn('ski', x0, 0, 0, 0, { rx: -0.2, tint: c }); M.dyn('ski', x0 + 0.14, 0, 0, 0, { rx: -0.2, tint: c });
    M.dyn('skiPole', x0 + 0.28, 0, 0, 0, { rx: -0.2757 }); M.dyn('skiPole', x0 + 0.34, 0, 0.01, 0, { rx: -0.2757 });
  });
  M.restore();
}

/* Bonhomme de neige : au premier tir il éclate en trois boules, bonnet, carotte, écharpe et branches */
propType('snowman', {
  pf: () => PF.snowman(), shapes: [SPH(0, 0.32, 0, 0.4), SPH(0, 0.9, 0, 0.3), SPH(0, 1.33, 0, 0.2)], mass: 120, mu: 0.4, e: 0.1, resp: 0.8, blast: 7, hp: 18, mat: 'snow', snd: 'snow', brk: 'snowman',
  debris: [['snowball', 3], ['snowHat', 1], ['carrot', 1], ['scarf', 1], ['twig', 2]],
});
/* Boule de neige : sphère de rayon 1 mise à l'échelle (le bas du bonhomme : 0,4 ; son milieu : 0,3 ; sa tête : 0,2) */
PF.snowball = () => prefab('snowball', (M) => { M.color([1, 1, 1]).local(1); M.geo('snowmat', new THREE.SphereGeometry(1, 14, 10), { uvs: 2 }); });
propType('snowball', { pf: () => PF.snowball(), shapes: [SPH(0, 0, 0, 1)], mass: 900, mu: 0.4, e: 0.1, rr: 0.9, resp: 1, blast: 8, ball: true, ray: false, mat: 'snow', snd: 'snow' });
PF.snowHat = () => prefab('snowHat', (M) => {
  M.color([0.2, 0.32, 0.55]).local(1);
  M.lathe('canvas', [[0, 0.23], [0.12, 0.2], [0.19, 0.09], [0.205, 0.03], [0.205, 0], [0, 0]], 12);
  M.save().move(0, 0.26, 0).scl(0.05); M.geo('canvas', G_SPH); M.restore();
});
propType('snowHat', { pf: () => PF.snowHat(), shapes: [SPH(0, 0.12, 0, 0.17)], mass: 0.3, mu: 0.6, e: 0.3, rr: 1.5, resp: 6, blast: 12, through: true, ray: false, ball: true, mat: 'snow', snd: 'soft' });
PF.carrot = () => prefab('carrot', (M) => {
  M.color([0.95, 0.45, 0.12]).local(1);
  M.save().move(0, 0.03, 0).rotX(Math.PI / 2); M.cyl('plastic', 0.03, 0.17, 6, { r1: 0.002 }); M.restore();
});
propType('carrot', { pf: () => PF.carrot(), shapes: [BOX(0, 0.03, 0.085, 0.03, 0.03, 0.085)], mass: 0.1, mu: 0.6, e: 0.3, rr: 3, through: true, ray: false, mat: 'snow', snd: 'soft' });
PF.scarf = () => prefab('scarf', (M) => {
  M.color([0.72, 0.12, 0.1]).local(1);
  M.cyl('canvas', 0.21, 0.08, 12);
});
propType('scarf', { pf: () => PF.scarf(), shapes: [CYL(0, 0.04, 0, 0.21, 0.04)], mass: 0.3, mu: 0.8, e: 0.1, rr: 4, through: true, ray: false, mat: 'snow', snd: 'soft' });
PF.twig = () => prefab('twig', (M) => {
  M.color([0.35, 0.25, 0.17]).local(1);
  M.tube('wood', 0.015, [[-0.3, 0.015, 0], [0, 0.015, 0.03], [0.3, 0.015, 0]], 4);
});
propType('twig', { pf: () => PF.twig(), shapes: [BOX(0, 0.015, 0.01, 0.3, 0.015, 0.025)], mass: 0.1, mu: 0.7, e: 0.2, rr: 3, through: true, ray: false, mat: 'snow', snd: 'wood' });

/* ---------- Barque de pêcheur ---------- */
/* Coque de 3,4 m sur 1,3 m, fond plat, étrave relevée, tableau arrière ; plat-bord blanc, deux bancs, deux avirons.
   Repère : étrave vers +z, quille sur y = 0. */
PF.barque = () => prefab('barque', (M, P) => {
  const L = 3.4, W = 1.3, D = 0.56, T = 0.035;
  // demi-largeur au plat-bord, hauteur du plat-bord et de la quille, de l'arrière (t = 0) à l'étrave (t = 1)
  const hw = (t) => (W / 2) * (t < 0.45 ? lerp(0.6, 1, Math.sin((t / 0.45) * Math.PI / 2)) : Math.pow(Math.max(0, 1 - Math.pow((t - 0.45) / 0.55, 2.2)), 0.6));
  const gy = (t) => D + 0.2 * Math.pow(Math.max(0, (t - 0.6) / 0.4), 2) + 0.05 * Math.pow(1 - t, 3);
  const ky = (t) => 0.22 * Math.pow(Math.max(0, (t - 0.68) / 0.32), 2.2);
  const zt = (t) => lerp(-L / 2, L / 2, t);
  const sec = (t, s, inner) => { const w = Math.max(0, hw(t) - (inner ? T : 0)), y0 = ky(t) + (inner ? T : 0), y1 = gy(t); return [s * w, y0 + (y1 - y0) * Math.pow(Math.abs(s), 2.6), zt(t)]; };
  M.local(1);
  M.save().color([0.2, 0.44, 0.52]);
  M.aoFn = (x, y) => lerp(0.55, 1, smoothstep(0, 0.4, y));
  M.surf('paintwood', 16, 20, (u, v) => sec(v, u * 2 - 1, false), { uL: 2.6, vL: 3.4 });
  M.restore();
  M.save().color([0.62, 0.5, 0.36]);
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0, 0.45, y));
  M.surf('wood', 16, 20, (u, v) => sec(v, u * 2 - 1, true), { uL: 2.6, vL: 3.4, flipN: true });
  M.restore();
  M.aoFn = null;
  // tableau arrière : disque plein fermant la coque (de plat-bord en plat-bord en passant par le fond)
  M.save().color([0.2, 0.44, 0.52]);
  { const ring = []; for (let i = 0; i <= 16; i++) ring.push(sec(0, (i / 16) * 2 - 1, false));
    const c = [0, 0.3, zt(0)]; for (let i = 0; i < 16; i++) M.tri3('paintwood', c, ring[i], ring[i + 1], [0, 0, -1]); }
  M.restore();
  // plat-bord : lisse balayée d'un plat-bord à l'autre autour de l'étrave, tableau arrière en travers
  const rim = [];
  for (let i = 0; i <= 18; i++) { const t = i / 18; rim.push([-hw(t) + 0.01, gy(t) + 0.012, zt(t)]); }
  for (let i = 17; i >= 0; i--) { const t = i / 18; rim.push([hw(t) - 0.01, gy(t) + 0.012, zt(t)]); }
  M.save().color([0.9, 0.88, 0.82]); M.sweep('paintwood', rectShape(0.07, 0.03), rim, { uAround: 1 }); M.restore();
  M.save().color([0.9, 0.88, 0.82]).move(0, gy(0) + 0.012, zt(0) + 0.03); M.boxB('paintwood', -hw(0), hw(0), 0, 0.03, -0.035, 0.035); M.restore();
  // bancs, patins de quille et deux avirons posés en travers
  M.save().color([0.66, 0.52, 0.36]);
  for (const t of [0.27, 0.6]) { const w = hw(t) - T; M.boxB('wood', -w, w, 0.27 + ky(t), 0.31 + ky(t), zt(t) - 0.12, zt(t) + 0.12, { bevel: 0.006 }); }
  for (const x of [-0.26, 0.26]) M.boxB('wood', x - 0.03, x + 0.03, -0.03, 0.02, -1.3, 0.5, { bevel: 0.006 });
  M.restore();
  M.save().color([0.55, 0.4, 0.26]);
  for (const [x, a] of [[-0.12, 0.05], [0.12, -0.05]]) { M.save().move(x, 0.32, -0.3).rotY(a); M.boxB('wood', -0.02, 0.02, 0, 0.04, -1.0, 1.1, { bevel: 0.006 }); M.boxB('wood', -0.07, 0.07, 0, 0.012, 1.1, 1.65, { bevel: 0.004 }); M.restore(); }
  M.restore();
  // la coque repose sur sa quille : les mêmes boîtes que la collision d'une caisse longue (retirées au premier choc)
  M.col(-0.6, 0.6, 0, 0.5, -1.65, 1.0, 'wood');
});
propType('barque', {
  pf: () => PF.barque(), shapes: [BOX(0, 0.3, -0.6, 0.62, 0.3, 1.1), BOX(0, 0.33, 0.85, 0.42, 0.33, 0.35), BOX(0, 0.42, 1.5, 0.15, 0.42, 0.2)], com: [0, 0.2, -0.1],
  contact: [[-0.3, 0, -1.5], [0.3, 0, -1.5], [-0.3, 0, -0.4], [0.3, 0, -0.4], [-0.3, 0, 0.7], [0.3, 0, 0.7], [0, 0.12, 1.4], [0, 0.4, 1.68],
    [-0.62, 0.55, -0.4], [0.62, 0.55, -0.4], [-0.39, 0.6, -1.7], [0.39, 0.6, -1.7], [-0.5, 0.15, -0.4], [0.5, 0.15, -0.4], [-0.35, 0.58, 0.7], [0.35, 0.58, 0.7]],
  mass: 70, mu: 0.6, e: 0.15, rr: 2, resp: 1.0, blast: 8.5, lift: 0.5, mat: 'wood', snd: 'wood',
});

}catch(e){HOOKS.missing['02k-dynprops.js']=String(e&&e.message||e)}
/* ===== 02h-nature.js ===== */
try{
/* ==========================================================================
   VÉGÉTATION ET DÉBRIS : palmiers, buissons, herbes sèches, bougainvilliers, gravats ; menus débris dispersés au
   sol (cailloux, briques, morceaux de béton, tessons de tuiles, déchets, herbes) et congères de sable.
   Feuillages en cartes découpées (atlas FOL, découpe alpha) : chaque carte est émise dans les deux sens avec
   des normales inclinées vers le ciel, pour un éclairage doux et sans face arrière noire. Les palmes
   projettent des ombres découpées (la carte d'ombre lit l'alpha de l'atlas).
   ========================================================================== */
/* Écorce de palmier : bases de palmes coupées, en losanges serrés sur un réseau oblique (comme sur un tronc de dattier), creux sombres entre
   elles, fibres verticales dans chaque base. Tuile de 1 m : 9 losanges sur le tour d'un tronc, 12 rangées. À demander dans `surfaces` d'une
   carte qui a des palmiers. */
Object.assign(TEXLAB, {
  palmbark: [512, 79, 2.6, `
    vec2 w = vec2(gfbm(uv, vec2(4.0), 3, 2.0), gfbm(uv + 0.43, vec2(4.0), 3, 7.0)) - 0.5;
    vec2 p = vec2(uv.x * 9.0 + uv.y * 6.0, uv.x * 9.0 - uv.y * 6.0) + w * 0.45;
    vec2 ci = floor(p), cf = fract(p);
    float e = min(min(cf.x, 1.0 - cf.x), min(cf.y, 1.0 - cf.y));
    vec2 cid = vec2(mod(ci.x + ci.y, 18.0), mod(ci.x - ci.y, 12.0));
    float n = hs(cid, 3.0), n2 = hs(cid, 8.0);
    float base = smoothstep(0.02, 0.15 + n2 * 0.1, e), core = smoothstep(0.08, 0.5, e);
    float fib = vn(vec2(uv.x * 180.0, uv.y * 12.0), vec2(180.0, 12.0), 5.0), big = gfbm(uv, vec2(3.0), 4, 1.0), gr = vn(uv * 256.0, vec2(256.0), 6.0);
    h = base * (0.5 + core * 0.25 + n * 0.1 + fib * 0.1) + big * 0.08 + gr * 0.04;
    vec3 sc = srgb(vec3(0.21, 0.15, 0.105)), lo = srgb(vec3(0.5, 0.39, 0.27)), hi = srgb(vec3(0.78, 0.66, 0.48));
    a = mix(sc, mix(lo, hi, core * (0.3 + n * 0.7)), base) * (0.78 + n * 0.3 + fib * 0.2 + big * 0.14 + gr * 0.06);
    r = 0.95; x = h;`],
});
TEXSCALE.palmbark = 1;
OPT_TEX.add('palmbark');
/* Quadrilatère de feuillage double face : 4 points [x,y,z], région d'atlas reg [u0, v0 (haut), du, dv] ; mat : matière
   découpée (atlas des feuillages par défaut, conifer pour les sapins) ; w : poids de souplesse des quatre coins (vent, voir
   02md-vent.js), sinon celui de M.swFn */
function foliageQuad(M, p0, p1, p2, p3, reg, up = 0.6, mat = 'foliage', w = null) {
  const [u0, v0, du, dv] = reg, B = M.buf(mat, (p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, (p0[2] + p2[2]) / 2);
  const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2], bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2];
  let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = hyp3(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
  const uvs = [[u0, v0 + dv], [u0 + du, v0 + dv], [u0 + du, v0], [u0, v0]], P = [p0, p1, p2, p3];
  for (const s of [1, -1]) {
    let mx = nx * s * (1 - up), my = ny * s * (1 - up) + up, mz = nz * s * (1 - up); const ml = hyp3(mx, my, mz); mx /= ml; my /= ml; mz /= ml;
    const ids = P.map((p, k) => M.v(B, p[0], p[1], p[2], mx, my, mz, uvs[k][0], uvs[k][1], 0.6 + 0.4 * (k > 1 ? 1 : 0), w ? w[k] : 0));
    if (s > 0) M.quadI(B, ids[0], ids[1], ids[2], ids[3]); else M.quadI(B, ids[0], ids[3], ids[2], ids[1]);
  }
}
/* Touffe en cartes croisées : n plans verticaux autour de l'axe, largeur w, hauteur h, base y0 */
function foliageCard(M, reg, w, h, y0 = 0, n = 2, flare = 0) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI + 0.3, c = Math.cos(a) * w / 2, s = Math.sin(a) * w / 2, fc = Math.cos(a) * flare, fs = Math.sin(a) * flare;
    foliageQuad(M, [-c, y0, -s], [c, y0, s], [c + fc, y0 + h, s + fs], [-c - fc, y0 + h, -s - fs], reg);
  }
}
/* ---------- Palmiers dattiers ---------- */
/* Palme : bande de folioles pliée en V le long d'un rachis courbe, dans le plan vertical d'azimut az. tp : point d'attache [x, y, z] ; e0, e1 : élévation
   (rad) du rachis au départ et au bout (la courbure se concentre vers le bout : la palme monte, puis retombe en arc) ; len : longueur (m).
   o : w (demi-largeur maximale, m), fold (relèvement des bords, rad), segs, dry (palme sèche : moitié droite du sprite), fw (souplesse au vent, 0 à 1,
   voir 02md-vent.js : le poids croît du pied au bout, le pied ne bouge pas), floor (hauteur minimale du bout : la palme se redresse tant qu'elle
   descendrait plus bas, pour qu'un jeune palmier ne pende pas jusque dans les yeux). Teinte : celle de M.color. La largeur suit la palme : pied nu
   (le pétiole), folioles les plus longues vers le tiers, bout effilé. */
var PALM_VFLIP = false; // sens du sprite dans l'atlas (base de la palme en bas du sprite : faux)
function palmFrond(M, tp, az, e0, e1, len, o = {}) {
  const segs = o.segs || 8, ca = Math.cos(az), sa = Math.sin(az), wm = o.w || 0.5, fold = o.fold !== undefined ? o.fold : 0.5, fw = o.fw !== undefined ? o.fw : 1;
  const cf = Math.cos(fold), sf = Math.sin(fold), K = 1.3, ang = (t) => e0 + (e1 - e0) * Math.pow(t, K);
  let xy;
  for (let tries = 0; ; tries++) {
    xy = [[0, 0]]; let x = 0, y = 0;
    for (let i = 1; i <= segs; i++) { const a = ang((i - 0.5) / segs), dl = len / segs; x += Math.cos(a) * dl; y += Math.sin(a) * dl; xy.push([x, y]); }
    if (!o.floor || tries > 4 || tp[1] + Math.min(xy[segs][1], xy[segs - 1][1]) >= o.floor) break;
    e0 += 0.06; e1 += 0.26; // se redresse
  }
  const rows = xy.map(([x, y], i) => {
    const t = i / segs, th = ang(t), c = [tp[0] + ca * x, tp[1] + y, tp[2] + sa * x];
    const hw = wm * smoothstep(0.03, 0.2, t) * (1 - 0.92 * Math.pow(smoothstep(0.3, 1, t), 1.1)) + 0.012;
    const bx = -ca * Math.sin(th), by = Math.cos(th), bz = -sa * Math.sin(th); // dessus de la palme (normale au rachis, dans son plan)
    const sx = -sa * hw * cf, sz = ca * hw * cf, ux = bx * hw * sf, uy = by * hw * sf, uz = bz * hw * sf;
    return { c, l: [c[0] - sx + ux, c[1] + uy, c[2] - sz + uz], r: [c[0] + sx + ux, c[1] + uy, c[2] + sz + uz], t, w: fw * Math.pow(t, 1.25) };
  });
  const [u0, , du] = FOL.palm, uc = u0 + du / 2, hu = (o.dry ? 1 : -1) * du / 2, vb = (t) => (PALM_VFLIP ? t : 1 - t);
  for (let i = 0; i < segs; i++) {
    const a = rows[i], b = rows[i + 1], v0 = vb(b.t), dv = vb(a.t) - v0, wa = a.w, wb = b.w, ea = Math.min(1, wa * 1.12), eb = Math.min(1, wb * 1.12);
    foliageQuad(M, a.c, a.l, b.l, b.c, [uc, v0, hu, dv], 0.55, 'foliage', [wa, ea, eb, wb]);
    foliageQuad(M, a.r, a.c, b.c, b.r, [uc + hu, v0, -hu, dv], 0.55, 'foliage', [ea, wa, wb, eb]);
  }
}
/* Allures de palmier (PF.palm, o.v) : g grosseur du tronc (1 : un tronc de dattier de 48 cm au pied) ; c taille de la couronne ; n palmes vertes ;
   dry palmes sèches pendantes (au-delà de 6, la jupe d'un vieux palmier, plus bas sur le tronc) ; lean courbure du tronc (m au sommet) ;
   dates régimes ; kids rejets au pied (petits palmiers sans tronc, sans collision) ; trunks troncs de plus qui partent du même pied, penchés vers
   le dehors (touffe de deux ou trois palmiers) ; open de 0 (couronne dressée, d'un jeune palmier) à 1 (couronne ouverte qui retombe, d'un vieux) ;
   tint teinte des palmes vertes. Sans o.v : un dattier adulte. */
var PALM_KINDS = {
  dattier: { g: 1, c: 1, n: 34, dry: 8, lean: 0.5, dates: 3, kids: 0, trunks: 0, open: 0.45, tint: [1, 1, 1] },
  jeune: { g: 1.2, c: 0.85, n: 26, dry: 1, lean: 0.2, dates: 0, kids: 0, trunks: 0, open: 0.12, tint: [1, 1.02, 0.94] },
  vieux: { g: 0.85, c: 1.05, n: 24, dry: 14, lean: 1.1, dates: 4, kids: 0, trunks: 0, open: 0.8, tint: [1.04, 1, 0.86] },
  rejets: { g: 1, c: 1, n: 30, dry: 6, lean: 0.4, dates: 2, kids: 2, trunks: 0, open: 0.4, tint: [0.96, 1, 0.92] },
  touffe: { g: 0.9, c: 0.95, n: 22, dry: 5, lean: 0.4, dates: 1, kids: 1, trunks: 2, open: 0.55, tint: [1, 1, 0.9] },
};
/* Tronc : balayage d'un cercle le long d'une courbe qui s'incline vers (lx, lz) au sommet (en t² : droit au pied), écorce losangée, pied évasé,
   légère renflement sous la couronne ; renvoie le point de la courbe à la hauteur relative t (0 à 1) */
function palmTrunk(M, R, bx, bz, h, lx, lz, g, lite) {
  const at = (t) => [bx + lx * t * t, t * h, bz + lz * t * t], N = lite ? 11 : 17, ts = [0, 0.012, 0.03, 0.06, 0.1];
  for (let i = 1; i <= N; i++) ts.push(0.1 + 0.9 * i / N);
  const rad = (t) => g * (0.245 - 0.085 * t + 0.11 * Math.pow(1 - clamp(t * h / 0.9, 0, 1), 2.2) + 0.03 * smoothstep(0.88, 1, t));
  const k = R.range(0.74, 0.96);
  M.color([k, k * 0.92, k * 0.82]).local(1);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0, 1.5, y));
  M.sweep('palmbark', circleShape(1, lite ? 8 : 10), ts.map(at), { scale: (f) => rad(ts[Math.round(f * (ts.length - 1))]), uAround: 1 });
  M.aoFn = null;
  return at;
}
/* Couronne : palmes vertes sur une spirale d'angle d'or, du cœur (jeunes palmes presque droites) au bord (les plus anciennes, qui retombent), puis
   palmes sèches pendantes. top : sommet du tronc ; hb : hauteur du tronc au pied de la couronne ; sc : échelle de la couronne (rejets : petite) */
function palmCrown(M, R, top, hb, S, lite, sc = 1, at = null) {
  const n = Math.max(6, Math.round(S.n * (lite ? 0.72 : 1) * Math.min(1, 0.5 + sc * 0.5))), segs = lite ? 5 : 8, cr = S.c * sc, open = S.open;
  const tn = () => [R.range(0.88, 1) * S.tint[0], R.range(0.92, 1) * S.tint[1], R.range(0.8, 0.95) * S.tint[2]];
  // bulbe de bases de palmes sous la couronne
  M.color([0.6, 0.5, 0.36]);
  M.save().move(top[0], 0, top[2]);
  M.lathe('palmbark', [[0.2 * S.g * sc, top[1] - 0.95 * sc], [0.26 * S.g * sc, top[1] - 0.55 * sc], [0.33 * S.g * sc, top[1] - 0.12 * sc], [0.27 * S.g * sc, top[1] + 0.14 * sc], [0.1 * S.g * sc, top[1] + 0.3 * sc], [0, top[1] + 0.32 * sc]], lite ? 7 : 9, { sharp: 0.9 });
  M.restore();
  for (let i = 0; i < n; i++) {
    const u = i / Math.max(1, n - 1), az = i * 2.39996 + R() * 0.3, uu = Math.pow(u, 0.9);
    const e0 = lerp(1.38, 0.2, uu) - 0.3 * open * u + R.range(-0.12, 0.12), e1 = Math.max(-1.45, lerp(1.26, -1.1, Math.pow(u, 0.8)) - 0.6 * open * u + R.range(-0.15, 0.15));
    const len = 3.4 * cr * lerp(0.55, 1, smoothstep(0, 0.35, u)) * (1 - 0.1 * u * u) * R.range(0.9, 1.1);
    M.color(tn());
    palmFrond(M, top, az, e0, e1, len, { w: 0.5 * Math.sqrt(cr) * R.range(0.92, 1.1), segs, fw: lerp(0.5, 1, Math.min(1, u * 1.6)) * R.range(0.85, 1), floor: top[1] > 3.2 ? 2.3 : 0 });
  }
  // palmes sèches : les premières pendent sous la couronne, la jupe plus bas contre le tronc
  for (let i = 0; i < S.dry; i++) {
    const skirt = i >= 6, q = at ? at(clamp((hb - 0.3 - 0.12 * (i - 6)) / hb, 0, 1)) : top;
    M.color(skirt && i % 2 ? [0.86, 0.75, 0.62] : [0.95, 0.84, 0.7]);
    palmFrond(M, skirt ? [q[0], top[1] - 0.3 * sc - 0.12 * (i - 6) * sc, q[2]] : top, R() * TAU, R.range(-0.5, 0.1) - (skirt ? 0.15 : 0), -1.3 + R.range(-0.1, 0.1), R.range(1.7, 2.5) * cr, { w: 0.42 * Math.sqrt(cr), segs: Math.max(4, segs - 2), dry: true, fw: 0.8, fold: 0.3 });
  }
}
/* Palmier dattier : tronc losangé à pied évasé, couronne dense de palmes arquées en V, palmes sèches pendantes, régimes de dattes ; variantes par o.v
   (PALM_KINDS) ; o.lite : version allégée pour une palmeraie nombreuse (tronc de 8 pans, palmes de 5 segments, moins de palmes). Ses collisions sont
   quatre tronçons qui suivent la courbe de chaque tronc. Les palmes bougent au vent (poids de souplesse, 02md-vent.js), pas le tronc. */
PF.palm = (h = 7, seed = 1, o = {}) => prefab('palm' + h + '_' + seed + (o.lite ? 'l' : '') + (o.v ? 'v' + Object.values(o.v).join('_') : ''), (M) => {
  const R = rngOf(seed * 7 + 3), lean0 = R.range(0.2, 0.9), ld = R() * TAU, lite = !!o.lite;
  const S = { ...PALM_KINDS.dattier, lean: lean0, ...(o.v || {}) };
  const g = S.g, lx = Math.cos(ld) * S.lean, lz = Math.sin(ld) * S.lean;
  const at = palmTrunk(M, R, 0, 0, h, lx, lz, g, lite), top = at(1);
  const cols = (f, hh, gg) => { for (let k = 0; k < 4; k++) { const p = f(k / 4), q = f((k + 1) / 4), r = 0.21 * gg * (1 - 0.07 * k); M.col(Math.min(p[0], q[0]) - r, Math.max(p[0], q[0]) + r, p[1], q[1], Math.min(p[2], q[2]) - r, Math.max(p[2], q[2]) + r, 'wood'); } };
  cols(at, h, g);
  palmCrown(M, R, top, h, S, lite, 1, at);
  M.occ(top[0] - 2.5 * S.c, top[0] + 2.5 * S.c, h - 0.8 * S.c, h + 0.6 * S.c, top[2] - 2.5 * S.c, top[2] + 2.5 * S.c, 0.35);
  // troncs de plus : partent du même pied, penchés vers le dehors, un peu plus bas
  for (let j = 0; j < S.trunks; j++) {
    const a = ld + (j + 1) * (TAU / (S.trunks + 1)) + R.range(-0.4, 0.4), d = R.range(0.3, 0.5) * g, h2 = h * R.range(0.68, 0.92), L2 = R.range(1.0, 2.1), bx = Math.cos(a) * d, bz = Math.sin(a) * d;
    const at2 = palmTrunk(M, R, bx, bz, h2, Math.cos(a) * L2, Math.sin(a) * L2, g * 0.82, lite), top2 = at2(1);
    cols((t) => at2(t), h2, g * 0.82);
    palmCrown(M, R, top2, h2, { ...S, n: Math.round(S.n * 0.75), dry: Math.min(S.dry, 6) }, lite, 0.9, at2);
    M.occ(top2[0] - 2.2 * S.c, top2[0] + 2.2 * S.c, h2 - 0.8 * S.c, h2 + 0.6 * S.c, top2[2] - 2.2 * S.c, top2[2] + 2.2 * S.c, 0.3);
  }
  // rejets au pied : de petits palmiers sans tronc qui poussent en touffe contre le pied, penchés vers le dehors
  for (let k = 0; k < S.kids; k++) {
    const a = R() * TAU, d = R.range(0.45, 0.7) * g, b = [Math.cos(a) * d, -0.05, Math.sin(a) * d], kt = [b[0] + Math.cos(a) * 0.15, R.range(0.25, 0.6), b[2] + Math.sin(a) * 0.15];
    M.color([0.62, 0.55, 0.46]); M.sweep('palmbark', circleShape(1, 6), [b, kt], { scale: (t) => 0.16 - 0.05 * t, uAround: 0.5 });
    for (let i = 0; i < 9; i++) {
      M.color([R.range(0.85, 1) * S.tint[0], R.range(0.9, 1) * S.tint[1], R.range(0.75, 0.9) * S.tint[2]]);
      palmFrond(M, kt, a + R.range(-1.8, 1.8), i % 2 ? R.range(0.4, 0.75) : R.range(0.95, 1.3), i % 2 ? -0.5 : 0.1, R.range(1.1, 1.8), { w: 0.3, segs: lite ? 4 : 6, fw: 0.8 });
    }
  }
  // régimes de dattes
  M.color([0.62, 0.3, 0.1]); M.cls = 1;
  for (let i = 0; i < S.dates; i++) { const a = R() * TAU; for (let k = 0; k < (lite ? 3 : 5); k++) { M.save().move(top[0] + Math.cos(a) * 0.4 + (R() - 0.5) * 0.12, h - 0.55 - k * 0.07, top[2] + Math.sin(a) * 0.4 + (R() - 0.5) * 0.12).scl(0.09, 0.07, 0.09); M.geo('plastic', G_SPH); M.restore(); } }
  M.cls = 0;
});
/* Buisson (cartes croisées) */
PF.bush = (s = 1) => prefab('bush' + s, (M) => {
  M.swFn = swHeight(0, 1.1 * s, 1.3, 0.5); // le haut des rameaux plie au vent (02md-vent.js)
  M.color([0.95, 1, 0.9]);
  foliageCard(M, FOL.bush, 1.3 * s, 1.1 * s, -0.05, 3, 0.15 * s);
  M.color([0.85, 0.9, 0.8]);
  foliageQuad(M, [-0.55 * s, 0.55 * s, -0.55 * s], [0.55 * s, 0.55 * s, -0.55 * s], [0.55 * s, 0.62 * s, 0.55 * s], [-0.55 * s, 0.62 * s, 0.55 * s], FOL.bush, 0.8);
});
/* Touffe d'herbes sèches */
PF.grass = (s = 1) => prefab('grass' + s, (M) => {
  M.swFn = swHeight(0, 0.55 * s, 1.4, 0.7);
  M.color([1, 0.95, 0.85]);
  foliageCard(M, FOL.grass, 0.7 * s, 0.55 * s, 0, 3, 0.12 * s);
});
/* Bougainvillier grimpant sur une façade (repère de façade : plan du mur en z = 0) */
PF.bougainvillea = (w = 2.2, h = 2.6) => prefab(`bougain${w}${h}`, (M) => {
  const R = rngOf(Math.round(w * 10 + h));
  M.swFn = () => -0.6; // plaqué au mur : les feuilles frémissent, la plante ne s'incline pas
  M.color([1, 1, 1]);
  for (let i = 0; i < 5; i++) {
    const cw = w * R.range(0.45, 0.75), ch = h * R.range(0.4, 0.7), x = R.range(-w / 2 + cw / 2, w / 2 - cw / 2), y = R.range(0, h - ch), z = 0.05 + i * 0.03;
    foliageQuad(M, [x - cw / 2, y, z], [x + cw / 2, y, z + 0.05], [x + cw / 2, y + ch, z], [x - cw / 2, y + ch, z + 0.05], FOL.flower, 0.35);
  }
  // tige principale
  M.color([0.35, 0.26, 0.18]); M.cls = 2;
  M.tube('wood', 0.03, [[-w * 0.3, 0, 0.06], [-w * 0.25, h * 0.4, 0.08], [0, h * 0.8, 0.07], [w * 0.3, h * 0.95, 0.06]], 5);
});
/* Gravats : blocs de béton et de brique chanfreinés, poussière */
PF.rubble = (seed = 1, r = 1.2) => prefab('rubble' + seed + '_' + r, (M) => {
  const R = rngOf(seed * 31 + 5);
  M.local(1);
  for (let i = 0; i < 16; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * r, s = R.range(0.08, 0.3), brick = R() < 0.35;
    M.save().move(Math.cos(a) * d, -s * 0.2, Math.sin(a) * d).rotY(R() * TAU).rotX(R.range(-0.4, 0.4)).rotZ(R.range(-0.4, 0.4));
    M.color(brick ? [0.72, 0.42, 0.3] : [0.85, 0.82, 0.76]);
    M.box(brick ? 'brick' : 'concrete', s * (brick ? 1.6 : 1.2), s * 0.6, s * (brick ? 0.8 : 1), { bevel: s * 0.12 });
    M.restore();
  }
  // tas de poussière et de sable
  M.color([0.95, 0.9, 0.82]);
  M.surf('sand', 10, 4, (u, v) => { const a = u * TAU, rr = r * 0.9 * v, y = (1 - v * v) * 0.18; return [Math.cos(a) * rr, y, Math.sin(a) * rr * 0.8]; }, { closeU: true, uL: 3, vL: 1, pole: () => [0, 1, 0] });
});

/* ---------- Dispersion au sol ----------
   Pièces de quelques centimètres dans la matière « rubble » (teinte par sommet), classe 3 : un maillage par tronçon,
   masqué au-delà de QUALITY.scatter, ombre dans les cascades proches seulement. Aucune collision. */
/* Pierre : sphère bosselée de demi-axes (rx, ry, rz) ; k plans de coupe tirés au hasard la rendent anguleuse
   (pierre éclatée, morceau de béton), sans eux c'est un galet. Posée sur y = 0, enfoncée d'un quart. */
function rockMesh(M, R, rx, ry, rz, k = 0, nu = 6, nv = 4, mat = 'rubble', contact = true) { // contact : assombri près du sol (y = 0) ; faux pour un rocher qui flotte
  const P = [], ph = [R() * TAU, R() * TAU, R() * TAU];
  for (let i = 0; i < k; i++) { const a = R() * TAU, b = Math.acos(R.range(-0.5, 1)); P.push([Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a), R.range(0.6, 0.88)]); }
  M.save().move(0, ry * 0.75, 0);
  M.aoFn = contact ? (x, y) => lerp(0.5, 1, smoothstep(0, ry * 1.2, y)) : null;
  M.surf(mat, nu, nv, (u, v) => {
    const a = u * TAU, b = v * Math.PI, sb = Math.sin(b), dx = sb * Math.cos(a), dy = -Math.cos(b), dz = sb * Math.sin(a);
    let r = 1 + sb * (0.09 * Math.sin(3 * a + ph[0]) * Math.sin(2 * b + ph[1]) + 0.05 * Math.sin(5 * a + ph[2]));
    for (const p of P) { const d = dx * p[0] + dy * p[1] + dz * p[2]; if (d > 0.05) r = Math.min(r, p[3] / d); }
    return [dx * r * rx, dy * r * ry, dz * r * rz];
  }, { closeU: true, flipN: true, pole: (v) => [0, v < 0.5 ? -1 : 1, 0], uL: TAU * Math.max(rx, rz), vL: Math.PI * ry });
  M.aoFn = null; M.restore();
}
/* Gravillons : quelques galets serrés */
PF.gravel = (seed = 1) => prefab('gravel' + seed, (M) => {
  const R = rngOf(seed * 13 + 7); M.cls = 3; M.local(1);
  const n = 3 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) {
    const a = R() * TAU, d = Math.sqrt(R()) * 0.2, s = R.range(0.018, 0.045), g = R.range(0.85, 1.1);
    M.color(R.pick([[0.72 * g, 0.62 * g, 0.5 * g], [0.58 * g, 0.53 * g, 0.47 * g], [0.66 * g, 0.47 * g, 0.34 * g], [0.78 * g, 0.72 * g, 0.62 * g]]));
    M.save().move(Math.cos(a) * d, -s * 0.2, Math.sin(a) * d).rotY(R() * TAU); rockMesh(M, R, s * R.range(1, 1.4), s * R.range(0.55, 0.8), s, 0, 4, 3); M.restore();
  }
});
/* Pierre isolée, lisse ou éclatée */
PF.stone = (seed = 1) => prefab('stone' + seed, (M) => {
  const R = rngOf(seed * 29 + 3); M.cls = 3; M.local(1);
  const s = R.range(0.05, 0.13), g = R.range(0.85, 1.1);
  M.color(R.pick([[0.72 * g, 0.61 * g, 0.48 * g], [0.6 * g, 0.55 * g, 0.48 * g], [0.68 * g, 0.5 * g, 0.36 * g]]));
  rockMesh(M, R, s * R.range(1, 1.5), s * R.range(0.45, 0.7), s, R() < 0.25 ? 0 : 2 + Math.floor(R() * 4));
});
/* Morceau de béton ou de parpaing : très anguleux, parfois un bout de fer à béton qui dépasse */
PF.chunk = (seed = 1) => prefab('chunk' + seed, (M) => {
  const R = rngOf(seed * 41 + 11); M.cls = 3; M.local(1);
  const s = R.range(0.07, 0.16), g = R.range(0.9, 1.08);
  M.color([0.7 * g, 0.68 * g, 0.64 * g]);
  rockMesh(M, R, s * R.range(1.1, 1.6), s * R.range(0.55, 0.85), s, 5 + Math.floor(R() * 3), 7, 4);
  if (R() < 0.3) { M.color([0.3, 0.2, 0.15]); M.save().move(0, s * 0.5, 0).rotZ(R.range(1.1, 1.4)).rotX(R.range(-0.3, 0.3)); M.cyl('rubble', 0.005, s * 2.2, 4, { caps: '' }); M.restore(); }
});
/* Brique pleine (22 x 10,5 x 6,5 cm) ou demi-brique, arêtes chanfreinées */
PF.brick = (seed = 1, half = false) => prefab('brick' + seed + (half ? 'h' : ''), (M) => {
  const R = rngOf(seed * 23 + (half ? 5 : 1)); M.cls = 3; M.local(1);
  const g = R.range(0.85, 1.08);
  M.color(R.pick([[0.74 * g, 0.42 * g, 0.3 * g], [0.66 * g, 0.36 * g, 0.26 * g], [0.8 * g, 0.52 * g, 0.38 * g]]));
  M.aoFn = (x, y) => lerp(0.55, 1, smoothstep(0, 0.07, y));
  M.save().move(0, -0.006, 0); M.box('rubble', half ? R.range(0.09, 0.13) : 0.22, 0.065, 0.105, { bevel: 0.007 }); M.restore();
  M.aoFn = null;
});
/* Petit tas de briques tombées d'un mur : quelques-unes à plat, une ou deux de chant ou en appui */
PF.brickPile = (seed = 1) => prefab('brickPile' + seed, (M) => {
  const R = rngOf(seed * 71 + 13); M.cls = 3; M.local(1);
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0, 0.12, y));
  const n = 3 + Math.floor(R() * 4);
  for (let i = 0; i < n; i++) {
    const g = R.range(0.85, 1.08), top = i >= n - 2 && R() < 0.6;
    M.color(R.pick([[0.74 * g, 0.42 * g, 0.3 * g], [0.66 * g, 0.36 * g, 0.26 * g], [0.8 * g, 0.52 * g, 0.38 * g]]));
    M.save().move(R.range(-0.2, 0.2), top ? 0.05 : -0.006, R.range(-0.16, 0.16)).rotY(R() * TAU);
    if (top) M.rotZ(R.range(-0.35, 0.35)).rotX(R.range(-0.2, 0.2));
    M.box('rubble', R() < 0.3 ? R.range(0.1, 0.14) : 0.22, 0.065, 0.105, { bevel: 0.007 }); M.restore();
  }
  M.aoFn = null;
});
/* Tesson de tuile canal : portion d'anneau extrudée, posée bombée ou en gouttière */
PF.shard = (seed = 1) => prefab('shard' + seed, (M) => {
  const R = rngOf(seed * 37 + 9); M.cls = 3; M.local(1);
  const r = R.range(0.06, 0.08), t = 0.012, half = R.range(0.5, 0.85), len = R.range(0.06, 0.14), n = 5, trough = R() < 0.5, S = [];
  // arc centré sur la verticale ; en gouttière le bas de l'arc touche le sol, bombé ce sont ses deux bords
  const pt = (a, rho) => [Math.cos(a) * rho, trough ? r - Math.sin(a) * rho : Math.sin(a) * rho - (r - t) * Math.cos(half)];
  for (let i = 0; i <= n; i++) S.push(pt(Math.PI / 2 - half + (2 * half * i) / n, r));
  for (let i = n; i >= 0; i--) S.push(pt(Math.PI / 2 - half + (2 * half * i) / n, r - t));
  const g = R.range(0.85, 1.05);
  M.color([0.74 * g, 0.4 * g, 0.26 * g]);
  M.save().move(0, 0, -len / 2); M.extrude('rubble', S, len, { sharp: 0.4 }); M.restore();
});
/* Déchets : canette écrasée, bouteille en plastique, papier froissé */
PF.litter = (seed = 1) => prefab('litter' + seed, (M) => {
  const R = rngOf(seed * 53 + 17), k = seed % 3; M.cls = 3; M.local(1);
  if (k === 0) {
    M.color(R.pick([[0.7, 0.12, 0.1], [0.15, 0.3, 0.62], [0.78, 0.78, 0.74], [0.2, 0.5, 0.25]]));
    M.save().move(0, 0.028, -0.06).rotX(Math.PI / 2).scl(1, 1, R.range(0.6, 0.9)); M.cyl('rubble', 0.033, 0.12, 8, { r1: 0.031 }); M.restore();
  } else if (k === 1) {
    M.color(R.pick([[0.72, 0.84, 0.76], [0.86, 0.88, 0.9], [0.5, 0.66, 0.5]]));
    M.save().move(0, 0.034, -0.12).rotX(Math.PI / 2);
    M.lathe('rubble', [[0, 0], [0.034, 0.005], [0.034, 0.16], [0.014, 0.21], [0.013, 0.24], [0, 0.24]], 7); M.restore();
  } else {
    M.color(R.pick([[0.92, 0.9, 0.84], [0.84, 0.78, 0.66], [0.9, 0.86, 0.7]]));
    // feuille pliée : quatre facettes relevées, visibles des deux côtés
    const w = R.range(0.08, 0.14), d = R.range(0.07, 0.12), hy = R.range(0.01, 0.03), P = [[-w, 0.004, -d], [0, hy, -d * 0.8], [w, 0.004, -d], [-w * 0.8, hy * 0.7, 0], [0, hy * 1.4, 0], [w, 0.01, 0], [-w, 0.004, d], [0, hy, d * 0.9], [w, 0.006, d]];
    const B = M.buf('rubble'), ids = [[], []];
    for (const s of [1, -1]) for (const p of P) ids[s > 0 ? 0 : 1].push(M.v(B, p[0], p[1] + (s < 0 ? -0.001 : 0), p[2], 0, s, 0, p[0], p[2], s > 0 ? 1 : 0.6));
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const a = j * 3 + i, q = [a, a + 1, a + 4, a + 3];
      M.quadI(B, ids[0][q[0]], ids[0][q[3]], ids[0][q[2]], ids[0][q[1]]); M.quadI(B, ids[1][q[0]], ids[1][q[1]], ids[1][q[2]], ids[1][q[3]]);
    }
  }
});
/* Petite touffe d'herbe sèche poussée entre deux pierres */
PF.weed = (seed = 1) => prefab('weed' + seed, (M) => {
  const R = rngOf(seed * 61 + 5); M.cls = 2; // peu nombreuses : fusionnées avec les autres feuillages fins
  M.swFn = swHeight(0, 0.26, 1.4, 0.5);
  M.color([R.range(0.9, 1.05), R.range(0.9, 1), R.range(0.75, 0.9)]);
  foliageCard(M, FOL.grass, R.range(0.2, 0.34), R.range(0.14, 0.26), 0, 2, 0.04);
});
/* Variantes de chaque sorte (prefabs construits une fois) */
var SCATTER_KINDS = {
  gravel: (i) => PF.gravel(i), stone: (i) => PF.stone(i), chunk: (i) => PF.chunk(i), brick: (i) => PF.brick(i, i % 3 === 2), pile: (i) => PF.brickPile(i),
  shard: (i) => PF.shard(i), litter: (i) => PF.litter(i), weed: (i) => PF.weed(i),
};
/* Dispersion déterministe sur [x0, x1] x [z0, z1] (grille de cellules de cell m, assez fines pour suivre le pied des
   murs ; position tirée dans chaque cellule).
   at(x, z) : null (rien ici) ou { n : pièces par m², w : { sorte: poids } }. Renvoie le nombre de pièces posées. */
function scatterGround(x0, x1, z0, z1, seed, at, cell = 0.3) {
  const R = rngOf(seed), M = DECOR, kinds = Object.keys(SCATTER_KINDS), variants = 8;
  let count = 0;
  for (let z = z0; z < z1; z += cell) for (let x = x0; x < x1; x += cell) {
    const lam = (() => { const q = at(x + cell / 2, z + cell / 2); return q ? q.n * cell * cell : 0; })();
    let n = Math.floor(lam) + (R() < lam % 1 ? 1 : 0);
    while (n-- > 0) {
      const px = x + R() * cell, pz = z + R() * cell, q = at(px, pz);
      const r1 = R(), r2 = R(), r3 = R(), r4 = R(); // tirages toujours consommés : la suite ne dépend pas des refus
      if (!q) continue;
      let tot = 0; for (const k of kinds) tot += q.w[k] || 0;
      let t = r1 * tot, kind = kinds[0];
      for (const k of kinds) { t -= q.w[k] || 0; if (t <= 0) { kind = k; break; } }
      M.place(SCATTER_KINDS[kind](1 + Math.floor(r2 * variants)), px, 0, pz, r3 * TAU, { s: 0.8 + r4 * 0.45 });
      count++;
    }
  }
  return count;
}
/* Congères de sable contre les murs : bandes en pente douce le long des faces libres des boîtes de collision.
   walls : boîtes (murs au sol) ; at(x, z) : hauteur voulue (m) au pied du mur en ce point, 0 pour rien. Rendues dans la
   matière du sol (même carte de répartition, même teinte) : elles s'y fondent sans couture. */
function sandDrifts(walls, at, free) {
  const M = DECOR, st = 0.25, K = [0, 0.12, 0.3, 0.55, 0.8, 1];
  let strips = 0;
  M.save().color([1, 1, 1]).local(1); M.cls = 1; M.aoFn = null;
  for (const c of walls) {
    for (const side of [0, 1, 2, 3]) {
      // bord de la face : origine, direction le long, normale sortante
      const alongX = side < 2, len = alongX ? c.x1 - c.x0 : c.z1 - c.z0;
      if (len < 0.8) continue;
      const nx = alongX ? 0 : side === 2 ? -1 : 1, nz = alongX ? (side === 0 ? -1 : 1) : 0;
      const ox = alongX ? c.x0 : side === 2 ? c.x0 : c.x1, oz = alongX ? (side === 0 ? c.z0 : c.z1) : c.z0;
      const ux = alongX ? 1 : 0, uz = alongX ? 0 : 1, n = Math.floor(len / st);
      // hauteurs le long de la face, puis découpage en tronçons continus
      const H = [];
      for (let i = 0; i <= n; i++) {
        const s = (i / n) * len, x = ox + ux * s + nx * 0.3, z = oz + uz * s + nz * 0.3;
        H.push(free(x, z) && free(x + nx * 0.5, z + nz * 0.5) ? at(x, z) : 0);
      }
      let i = 0;
      while (i <= n) {
        if (H[i] < 0.03) { i++; continue; }
        let j = i; while (j < n && H[j + 1] >= 0.03) j++;
        if (j - i >= 2) { emitDrift(M, ox, oz, ux, uz, nx, nz, (i / n) * len, (j / n) * len, H.slice(i, j + 1), K); strips++; }
        i = j + 1;
      }
    }
  }
  M.restore();
  return strips;
}
/* Une bande de congère : profil concave (plus haut contre le mur), bouts effilés, largeur liée à la hauteur */
function emitDrift(M, ox, oz, ux, uz, nx, nz, s0, s1, H, K) {
  const cnt = H.length, pos = [];
  for (let i = 0; i < cnt; i++) {
    const s = lerp(s0, s1, i / (cnt - 1)), e = Math.min(1, Math.min(i, cnt - 1 - i) / 2.5), taper = e * e * (3 - 2 * e);
    const h = H[i] * taper, w = 0.25 + H[i] * 3.2;
    pos.push(K.map((k) => {
      const x = ox + ux * s + nx * (0.004 + k * w), z = oz + uz * s + nz * (0.004 + k * w);
      return [x, h * Math.pow(1 - k, 1.7), z];
    }));
  }
  const cx = (pos[0][0][0] + pos[cnt - 1][0][0]) / 2, cz = (pos[0][0][2] + pos[cnt - 1][0][2]) / 2;
  const B = M.buf('ground', cx, 0, cz), ids = [];
  for (let i = 0; i < cnt; i++) {
    ids.push(pos[i].map((p, k) => {
      // normale : produit vectoriel des tangentes le long du mur et à travers la bande
      const a = pos[Math.min(cnt - 1, i + 1)][k], b = pos[Math.max(0, i - 1)][k], c = pos[i][Math.min(K.length - 1, k + 1)], d = pos[i][Math.max(0, k - 1)];
      const tx = a[0] - b[0], ty = a[1] - b[1], tz = a[2] - b[2], sx = c[0] - d[0], sy = c[1] - d[1], sz = c[2] - d[2];
      let mx = ty * sz - tz * sy, my = tz * sx - tx * sz, mz = tx * sy - ty * sx;
      if (my < 0) { mx = -mx; my = -my; mz = -mz; }
      const l = hyp3(mx, my, mz) || 1;
      return M.v(B, p[0], p[1], p[2], mx / l, my / l, mz / l, p[0], -p[2], lerp(0.72, 1, K[k]));
    }));
  }
  // sens des triangles : face vers le haut
  const flip = (ux * nz - uz * nx) > 0;
  for (let i = 0; i < cnt - 1; i++) for (let k = 0; k < K.length - 1; k++) {
    const a = ids[i][k], b = ids[i + 1][k], c = ids[i + 1][k + 1], d = ids[i][k + 1];
    if (flip) M.quadI(B, a, d, c, b); else M.quadI(B, a, b, c, d);
  }
}

}catch(e){HOOKS.missing['02h-nature.js']=String(e&&e.message||e)}
/* ===== 02i-hiver.js ===== */
try{
/* ==========================================================================
   KIT HIVERNAL : tout ce qu'il faut pour une carte de montagne enneigée, réutilisable d'une carte à l'autre.
   - Surfaces procédurales : neige fraîche (rides de vent, scintillements), neige tassée (empreintes, ornières,
     plaques de glace), roche (strates, fissures, lichen), bardage de mélèze grisé, écorce, ardoise, fer rouillé,
     bois de bout (cernes des grumes).
   - Atlas dessinés : branches d'épicéa chargées de neige et silhouettes de sapins (cartes découpées), enseignes
     émaillées, décalques (inscriptions des wagons, affiches, horaires, givre, traces au sol).
   - Matières : neige, roche, bardage, écorce, ardoise, rouille, glace (stalactites), fenêtres éclairées, ampoules.
   - Prefabs et architecture : sapins, tas et bourrelets de neige, bûchers, barrières, luge, bonhomme de neige,
     chalets (toits débordants à couche de neige épaisse et stalactites, balcons ajourés, volets), falaise, montagnes
     et forêts lointaines, chute de neige autour de la caméra.
   La neige posée sur le décor (dessus des objets, toits, appuis) est ajoutée par le shader (uSnow, 02c-materials.js) :
   les objets n'ont pas besoin d'une version enneigée.
   ========================================================================== */
Object.assign(TEXLAB, {
  /* neige fraîche : rides de vent (sastrugi), creux bleutés, grain et scintillements (rugosité plus faible) */
  snow: [1024, 61, 1.7, `
    float big = gfbm(uv, vec2(3.0), 5, 1.0), mid = gfbm(uv, vec2(12.0), 4, 2.0), w = gfbm(uv, vec2(2.0), 3, 3.0);
    float rp = sin((uv.y * 9.0 + uv.x * 2.0 + w * 2.6) * 6.2831853) * 0.5 + 0.5; rp = rp * rp * smoothstep(0.35, 0.75, w);
    float gr = vn(uv * 512.0, vec2(512.0), 4.0);
    vec4 v = vor(uv, vec2(160.0), 5.0, 1.0); float sp = step(0.97, v.z) * (1.0 - smoothstep(0.05, 0.18, v.x));
    h = big * 0.42 + mid * 0.24 + rp * 0.22 + gr * 0.05;
    a = srgb(vec3(0.86, 0.885, 0.92)) * (0.93 + big * 0.05 + mid * 0.03 + gr * 0.02);
    a = mix(a * vec3(0.9, 0.94, 1.0), a, smoothstep(0.25, 0.7, h));
    r = 0.8 - sp * 0.55 + gr * 0.04; x = h;`],
  /* neige tassée : empreintes de pas, ornières, plaques de glace lisses, gadoue grise par endroits */
  snowpack: [1024, 63, 1.6, `
    float big = gfbm(uv, vec2(3.0), 5, 1.0), mid = gfbm(uv, vec2(16.0), 4, 2.0), gr = vn(uv * 384.0, vec2(384.0), 3.0);
    vec2 p = uv * 11.0, ic = floor(p), f = fract(p) - 0.5; vec2 cm = mod(ic, 11.0);
    float rn = hs(cm, 3.0), an = rn * 6.2831853; vec2 o = (hs2(cm, 5.0) - 0.5) * 0.45;
    vec2 q = mat2(cos(an), -sin(an), sin(an), cos(an)) * (f - o);
    float heel = 1.0 - smoothstep(0.7, 1.0, length((q - vec2(0.0, -0.1)) / vec2(0.06, 0.07)));
    float sole = 1.0 - smoothstep(0.7, 1.0, length((q - vec2(0.0, 0.07)) / vec2(0.075, 0.11)));
    float fp = max(heel, sole) * step(0.3, rn);
    float rut = smoothstep(0.38, 0.47, abs(fract(uv.x * 2.0 + gfbm(uv, vec2(1.0, 4.0), 3, 7.0) * 0.15) - 0.5)) * smoothstep(0.55, 0.7, gfbm(uv, vec2(2.0, 1.0), 3, 8.0));
    float ice = smoothstep(0.62, 0.7, gfbm(uv, vec2(4.0), 4, 5.0)), slush = smoothstep(0.66, 0.86, big) * (1.0 - ice);
    h = big * 0.25 + mid * 0.3 + gr * 0.08 - fp * 0.32 - rut * 0.2 - ice * 0.12;
    a = srgb(vec3(0.78, 0.8, 0.84)) * (0.86 + mid * 0.12 + gr * 0.06) * (1.0 - fp * 0.14);
    a = mix(a, srgb(vec3(0.64, 0.69, 0.76)), ice * 0.65); a = mix(a, srgb(vec3(0.56, 0.55, 0.53)), slush * 0.45 + rut * 0.15);
    r = mix(0.8 - fp * 0.08, 0.22, ice); x = h;`],
  /* roche de falaise (granite) : strates, fissures, lichen */
  rock: [1024, 65, 2.6, `
    float big = gfbm(uv, vec2(2.0), 5, 1.0), mid = gfbm(uv, vec2(8.0), 5, 2.0), fine = gfbm(uv, vec2(32.0), 3, 3.0);
    float strata = sin((uv.y * 6.0 + big * 1.6) * 6.2831853) * 0.5 + 0.5;
    vec4 cr = vor(uv, vec2(5.0), 4.0, 1.0); float crack = (1.0 - smoothstep(0.0, 0.025, cr.w)) * smoothstep(0.35, 0.6, gfbm(uv, vec2(4.0), 3, 9.0));
    float lich = smoothstep(0.62, 0.76, gfbm(uv, vec2(10.0), 4, 6.0));
    h = big * 0.3 + mid * 0.35 + fine * 0.15 + strata * 0.15 + cr.z * 0.15 - crack * 0.45;
    vec3 c = mix(srgb(vec3(0.36, 0.34, 0.32)), srgb(vec3(0.58, 0.55, 0.51)), smoothstep(0.25, 0.75, mid + cr.z * 0.3 - 0.15)) * (0.84 + fine * 0.26);
    c = mix(c, c * vec3(1.08, 0.96, 0.84), strata * smoothstep(0.4, 0.7, big) * 0.35);
    c = mix(c, srgb(vec3(0.5, 0.55, 0.4)), lich * 0.35);
    a = c * (1.0 - crack * 0.6); r = 0.9 - fine * 0.08; x = h;`],
  /* bardage de mélèze (planches horizontales à rainures) : brun doré, grisé par les intempéries, nœuds */
  boards: [512, 67, 2.0, `
    float n = 8.0, pv = uv.y * n, pi = floor(pv), fv = fract(pv);
    float gap = 1.0 - smoothstep(0.02, 0.07, min(fv, 1.0 - fv)), id = hs(vec2(pi, 2.0), 3.0);
    float grain = gfbm(vec2(uv.x + id * 3.0, uv.y), vec2(3.0, 64.0), 5, 2.0 + id);
    float kx = fract(uv.x * 2.0 + id * 7.0), kid = hs(vec2(pi, floor(uv.x * 2.0 + id * 7.0)), 9.0);
    float knot = (1.0 - smoothstep(0.4, 1.0, length((vec2(kx, fv) - vec2(0.3 + kid * 0.4, 0.5)) / vec2(0.035, 0.22)))) * step(0.82, kid);
    float weather = smoothstep(0.25, 0.85, gfbm(uv, vec2(3.0), 4, 6.0) + (1.0 - fv) * 0.15);
    vec3 wood = mix(srgb(vec3(0.36, 0.25, 0.16)), srgb(vec3(0.5, 0.36, 0.24)), id * 0.5 + grain * 0.5);
    wood = mix(wood, srgb(vec3(0.42, 0.4, 0.37)) * (0.8 + grain * 0.3), weather * 0.55);
    wood = mix(wood, srgb(vec3(0.2, 0.13, 0.08)), knot * 0.6);
    a = mix(wood, srgb(vec3(0.07, 0.05, 0.04)), gap);
    h = (1.0 - gap) * (0.6 + grain * 0.2 - knot * 0.1); r = 0.84 + gap * 0.1; x = h;`],
  /* écorce d'épicéa : plaques allongées, fissures sombres (barkw et non bark : la carte florale, 02n-flore.js, a sa propre écorce sous ce nom, facultative ;
     le même nom écrasait celle-ci et la laissait absente des cartes d'hiver : grumes et troncs sortaient blancs) */
  barkw: [512, 69, 2.4, `
    float warp = gfbm(uv, vec2(4.0, 1.0), 3, 5.0) * 0.6;
    float fur = ridge(vec2(uv.x + warp * 0.25, uv.y * 0.15), vec2(18.0, 2.0), 4, 2.0);
    vec4 v = vor(vec2(uv.x + warp * 0.1, uv.y), vec2(16.0, 3.0), 4.0, 0.9);
    float fis = clamp(smoothstep(0.55, 0.9, fur) + (1.0 - smoothstep(0.0, 0.035, v.w)) * 0.6, 0.0, 1.0);
    float mid = gfbm(uv, vec2(6.0, 2.0), 4, 2.0), fine = gfbm(uv, vec2(32.0, 16.0), 3, 3.0);
    h = (1.0 - fis) * (0.55 + v.z * 0.2) + mid * 0.15 + fine * 0.1;
    a = mix(srgb(vec3(0.34, 0.25, 0.19)), srgb(vec3(0.5, 0.38, 0.28)), v.z * 0.5 + fine * 0.5) * (0.8 + mid * 0.3);
    a = mix(a, srgb(vec3(0.08, 0.06, 0.05)), fis * 0.9);
    r = 0.93; x = h;`],
  /* ardoises (toit de la gare) : rangs décalés, bords irréguliers, nuances bleu-gris */
  slate: [512, 71, 2.0, `
    vec4 t = tiles(uv, vec2(5.0, 12.0), 0.5);
    float jag = gfbm(uv, vec2(40.0, 8.0), 3, 2.0) * 0.08, edge = 1.0 - smoothstep(0.0, 0.05, t.w - jag * (1.0 - t.y));
    float fine = gfbm(uv, vec2(24.0), 3, 2.0), big = gfbm(uv, vec2(3.0), 4, 1.0);
    h = (1.0 - edge) * (0.35 + (1.0 - t.y) * 0.45) + fine * 0.1;
    a = srgb(mix(vec3(0.2, 0.22, 0.26), vec3(0.32, 0.34, 0.38), t.z)) * (0.8 + fine * 0.25 + big * 0.1) * (1.0 - edge * 0.5);
    r = 0.5 + fine * 0.2 + edge * 0.2; x = h;`],
  /* fer rouillé (rails, bogies, ferrures) : écailles, piqûres ; alpha = masque de métal sain */
  rust: [512, 73, 1.8, `
    float big = gfbm(uv, vec2(3.0), 5, 1.0), mid = gfbm(uv, vec2(16.0), 4, 2.0), fine = vn(uv * 256.0, vec2(256.0), 3.0);
    float sc = smoothstep(0.55, 0.75, gfbm(uv, vec2(8.0), 5, 4.0));
    vec4 pit = vor(uv, vec2(64.0), 5.0, 1.0); float pt = (1.0 - smoothstep(0.05, 0.15, pit.x)) * step(0.8, pit.z);
    h = mid * 0.3 + sc * 0.25 + fine * 0.1 - pt * 0.3;
    vec3 c = mix(srgb(vec3(0.32, 0.17, 0.09)), srgb(vec3(0.55, 0.3, 0.14)), mid) * (0.8 + fine * 0.3);
    a = mix(c, srgb(vec3(0.2, 0.18, 0.17)) * (0.8 + fine * 0.3), sc * 0.7) * (1.0 - pt * 0.4);
    r = mix(0.9, 0.6, sc); x = sc * 0.5;`],
  /* bois de bout des grumes : cernes concentriques autour du coin de la tuile (centre des faces de coupe), fentes */
  logend: [512, 75, 1.4, `
    vec2 d = uv - floor(uv + 0.5); float rr = length(d), an = atan(d.y, d.x);
    float wob = gfbm(vec2(an / 6.2831853 + 0.5, rr), vec2(8.0, 2.0), 3, 2.0) * 0.012;
    float ring = sin((rr + wob * 2.5) * 130.0 + gfbm(d + 0.5, vec2(6.0), 2, 4.0) * 3.0) * 0.5 + 0.5, crack = (1.0 - smoothstep(0.0, 0.02, abs(sin(an * 3.0 + 0.7)) * rr * 10.0)) * smoothstep(0.03, 0.12, rr);
    h = 0.5 + ring * 0.15 - crack * 0.4;
    a = mix(srgb(vec3(0.6, 0.45, 0.3)), srgb(vec3(0.72, 0.58, 0.42)), ring * 0.7) * (1.0 - crack * 0.5);
    a = mix(a, srgb(vec3(0.5, 0.36, 0.22)), smoothstep(0.38, 0.5, rr));
    r = 0.85; x = h;`],
});
Object.assign(TEXSCALE, { snow: 4.0, snowpack: 3.2, rock: 6.0, boards: 1.6, barkw: 1.4, slate: 2.0, rust: 1.2, logend: 1.0 });
/* Surfaces générées seulement pour une carte enneigée (MAP_DEFS.id.winter) */
var WINTER_TEX = new Set(['snow', 'snowpack', 'rock', 'boards', 'barkw', 'slate', 'rust', 'logend']);

/* ---------- Matières ---------- */
function makeWinterMaterials(M) {
  M('snowmat', { tex: 'snow', macro: 0.12, env: 0.35, snow: 0 });           // tas, bourrelets et couches de neige modelés
  M('rock', { tex: 'rock', grime: 0.4, macro: 0.5, dust: 0.1, pom: 0.03 });
  M('boards', { tex: 'boards', grime: 0.9, streak: 0.5, macro: 0.25 });
  M('bark', { tex: 'barkw', macro: 0.2, grime: 0.6, snow: 0.6 });
  M('slate', { tex: 'slate', env: 0.7, macro: 0.3, grime: 0.3 });
  M('rust', { tex: 'rust', metal: 0.75, ma: true, env: 0.55, macro: 0.25, grime: 0.6, streak: 0.4 });
  M('logend', { tex: 'logend', macro: 0.15, snow: 0.6 });
  M('ice', { color: [0.8, 0.88, 0.96], rough: 0.08, env: 1.6, macro: 0.05, snow: 0 });
  M('conifer', { tex: 'conifer', cut: 0.45, rough: 0.85, env: 0.3, macro: 0.25, scale: 1, noNormal: true, snow: 0.35 }); makeWind(MAT.conifer, WIND_AMP.conifer, { cards: true }); // les branches balancent au vent (02md-vent.js)
  M('signs2', { tex: 'signs2', rough: 0.4, env: 0.7, macro: 0.05, scale: 1, noNormal: true, snow: 0.4 });
  M('decals2', { tex: 'decals2', rough: 0.8, env: 0.3, macro: 0.15, scale: 1, noNormal: true, polyOff: -4, snow: 0 });
  Object.assign(MAT.decals2, { transparent: true, depthWrite: false }); MAT.decals2.defines.WM_CUT = ''; MAT.decals2.side = THREE.FrontSide;
  MAT.decals2.userData.noShadow = true;
  // fenêtre éclairée de l'intérieur : vitre sale qui laisse passer une lumière chaude
  M('glassLit', { tex: 'glass', metal: 0.4, ma: true, env: 0.9, macro: 0.1, emissive: [0.95, 0.58, 0.28], snow: 0, polyOff: -2 });
  // ampoules des guirlandes (couleur des sommets, lumineuse : au-delà de 1)
  MAT.bulb = new THREE.MeshBasicMaterial({ vertexColors: true }); MAT.bulb.userData.noShadow = true;
}

/* ---------- Atlas dessinés ---------- */
/* Conifères (1024², alpha) : [0, 0, 0.5, 0.5] et [0.5, 0, 0.5, 0.5] branches d'épicéa enneigées (base en bas, pointe en
   haut) ; [0, 0.5, 0.5, 0.5] silhouette de sapin enneigé (forêts lointaines) ; [0.5, 0.5, 0.5, 0.5] buisson enneigé */
var CONIF = { branch: [0, 0, 0.5, 0.5], branch2: [0.5, 0, 0.5, 0.5], tree: [0, 0.5, 0.5, 0.5], bush: [0.5, 0.5, 0.5, 0.5] };
function coniferAtlas() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = rngOf(4711);
  const needle = () => `hsl(${148 + R() * 22},${26 + R() * 18}%,${11 + R() * 13}%)`;
  const snowC = (k) => `hsl(212,${30 + R() * 20}%,${86 + k * 10 + R() * 4}%)`;
  g.lineCap = 'round';
  /* branche : tige centrale de bas en haut, rameaux latéraux vers la pointe couverts d'aiguilles, neige posée dessus */
  const branch = (x0, y0, W, H, snowK) => {
    const cx = x0 + W / 2, base = y0 + H - 8, tip = y0 + 10, twigs = [];
    g.strokeStyle = 'hsl(25,30%,18%)'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(cx, base); g.quadraticCurveTo(cx + 10, (base + tip) / 2, cx, tip); g.stroke();
    for (let i = 0; i < 26; i++) {
      const t = (i + 0.5) / 26, y = lerp(base, tip, t), len = W * 0.45 * Math.sin(Math.min(1, t * 1.15 + 0.08) * Math.PI) * (0.75 + R() * 0.3);
      for (const s of [-1, 1]) {
        const ang = -Math.PI / 2 + s * (0.85 + R() * 0.25), ex = cx + Math.cos(ang) * len, ey = y + Math.sin(ang) * len * 0.55;
        twigs.push([cx, y, ex, ey]);
        g.strokeStyle = 'hsl(25,25%,20%)'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(cx, y); g.lineTo(ex, ey); g.stroke();
      }
    }
    // aiguilles : petits traits serrés le long des rameaux, plus clairs au bout
    for (const [ax, ay, bx, by] of twigs) {
      const n = 26;
      for (let k = 0; k < n; k++) {
        const t = k / n, px = lerp(ax, bx, t), py = lerp(ay, by, t), dx = bx - ax, dy = by - ay, l = hyp(dx, dy) || 1;
        for (const s of [-1, 1]) {
          const nx = -dy / l * s, ny = dx / l * s, L = 9 + R() * 7 - t * 3;
          g.strokeStyle = needle(); g.lineWidth = 2 + R() * 1.2;
          g.beginPath(); g.moveTo(px, py); g.lineTo(px + (nx * 0.8 + dx / l * 0.6) * L, py + (ny * 0.8 + dy / l * 0.6) * L); g.stroke();
        }
      }
    }
    // neige : paquets arrondis sur la tige et les rameaux, ombrés en bleu sur le bord inférieur
    for (let i = 0; i < 140 * snowK; i++) {
      const tw = twigs[Math.floor(R() * twigs.length)], t = R() * 0.8, px = lerp(tw[0], tw[2], t), py = lerp(tw[1], tw[3], t);
      const r = (7 + R() * 12) * (1 - t * 0.5);
      g.fillStyle = snowC(-0.35); g.beginPath(); g.ellipse(px, py + r * 0.25, r * 1.15, r * 0.75, 0, 0, TAU); g.fill();
      g.fillStyle = snowC(0.2); g.beginPath(); g.ellipse(px - r * 0.1, py - r * 0.05, r, r * 0.62, 0, 0, TAU); g.fill();
    }
  };
  branch(0, 0, 512, 512, 1); branch(512, 0, 512, 512, 1.5);
  /* sapin entier : étages de branches tombantes, neige sur chaque étage */
  {
    const cx = 256, top = 530, bot = 1010;
    g.fillStyle = 'hsl(25,30%,16%)'; g.fillRect(cx - 9, bot - 70, 18, 70);
    for (let i = 0; i < 11; i++) {
      const t = i / 10, y = lerp(bot - 50, top + 20, t), w = lerp(210, 22, Math.pow(t, 0.9)), hgt = lerp(70, 34, t);
      g.fillStyle = `hsl(${150 + R() * 12},${24 + R() * 10}%,${12 + R() * 6}%)`;
      g.beginPath(); g.moveTo(cx, y - hgt * 1.6); g.quadraticCurveTo(cx + w * 0.6, y - hgt * 0.4, cx + w, y + hgt * 0.15);
      for (let k = 0; k <= 8; k++) g.lineTo(cx + w - (k / 8) * w * 2, y + hgt * 0.15 + Math.sin(k * 1.7) * 8 + R() * 6);
      g.quadraticCurveTo(cx - w * 0.6, y - hgt * 0.4, cx, y - hgt * 1.6); g.fill();
      // neige sur le dessus de l'étage
      g.fillStyle = snowC(0.1);
      g.beginPath(); g.moveTo(cx, y - hgt * 1.5); g.quadraticCurveTo(cx + w * 0.55, y - hgt * 0.5, cx + w * 0.92, y - hgt * 0.02);
      for (let k = 0; k <= 10; k++) g.lineTo(cx + w * 0.92 - (k / 10) * w * 1.84, y - hgt * (0.12 + 0.18 * Math.abs(Math.sin(k * 1.3 + i))) - R() * 5);
      g.quadraticCurveTo(cx - w * 0.55, y - hgt * 0.5, cx, y - hgt * 1.5); g.fill();
    }
    g.fillStyle = snowC(0.2); g.beginPath(); g.ellipse(cx, top + 6, 10, 16, 0, 0, TAU); g.fill();
  }
  /* buisson enneigé : touffe sombre, coussin de neige */
  {
    const cx = 768, cy = 820;
    for (let i = 0; i < 900; i++) {
      const a = R() * TAU, d = Math.sqrt(R()) * 200, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7;
      g.strokeStyle = needle(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 20, y - 6 - R() * 14); g.stroke();
    }
    for (let i = 0; i < 70; i++) {
      const a = -Math.PI * R(), d = Math.sqrt(R()) * 190, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.6 - 20, r = 18 + R() * 30;
      g.fillStyle = snowC(-0.3); g.beginPath(); g.ellipse(x, y + 5, r * 1.1, r * 0.6, 0, 0, TAU); g.fill();
      g.fillStyle = snowC(0.2); g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0, 0, TAU); g.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Enseignes émaillées et peintes (1024², 8 panneaux de 512 x 256) */
var SIGNS2 = { gare: 0, hotel: 1, boulangerie: 2, scierie: 3, buffet: 4, douane: 5, altitude: 6, voies: 7 };
function winterSignAtlas() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), R = rngOf(93);
  const P = [
    ['#1d3557', '#f1f1ea', 'GIVRE', 'Georgia, serif', 150, '#f1f1ea'],
    ['#4a2c1a', '#e9c46a', 'HÔTEL DU COL', 'Georgia, serif', 76, '#e9c46a'],
    ['#efe6d2', '#8a2a1e', 'BOULANGERIE', 'Georgia, serif', 70, '#8a2a1e'],
    ['#2f4a33', '#efe6d2', 'SCIERIE DU GIVRE', 'Georgia, serif', 58, '#efe6d2'],
    ['#7a1f1a', '#f3e9d2', 'BUFFET DE LA GARE', 'Georgia, serif', 54, '#f3e9d2'],
    ['#26415f', '#f1f1ea', 'DOUANE', 'Arial, sans-serif', 118, '#f1f1ea'],
    ['#e8c547', '#1a1a1a', 'ALTITUDE 1847 m', 'Arial, sans-serif', 66, '#1a1a1a'],
    ['#f4f2ec', '#b3261e', 'DÉFENSE DE TRAVERSER\nLES VOIES', 'Arial, sans-serif', 46, '#b3261e'],
  ];
  P.forEach(([bg, fg, txt, font, size, border], i) => {
    const x = (i % 2) * 512, y = Math.floor(i / 2) * 256;
    g.fillStyle = bg; g.fillRect(x, y, 512, 256);
    g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(x + 16, y + 16, 480, 224);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = txt.split('\n');
    lines.forEach((l, k) => { g.font = `bold ${size}px ${font}`; g.fillText(l, x + 256, y + 132 + (k - (lines.length - 1) / 2) * size * 1.15); });
    // émail écaillé, coins rouillés, salissures
    for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(${R() < 0.5 ? '40,30,22' : '120,70,40'},${0.3 + R() * 0.5})`; const ex = x + (R() < 0.5 ? 6 + R() * 30 : 476 + R() * 30), ey = y + (R() < 0.5 ? 6 + R() * 30 : 220 + R() * 30); g.beginPath(); g.arc(ex, ey, 2 + R() * 7, 0, TAU); g.fill(); }
    for (let k = 0; k < 700; k++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,250,240' : '30,25,20'},${R() * 0.08})`; g.fillRect(x + R() * 512, y + R() * 256, 1 + R() * 4, 1 + R() * 3); }
    const gr = g.createLinearGradient(0, y, 0, y + 256); gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(40,35,30,0.25)'); g.fillStyle = gr; g.fillRect(x, y, 512, 256);
  });
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Coordonnées (u0, v0, du, dv) d'une enseigne de l'atlas d'hiver */
function sign2UV(i) { return [(i % 2) * 0.5, Math.floor(i / 2) * 0.25, 0.5, 0.25]; }
/* Décalques d'hiver (1024², grille 4 x 4, alpha) : 0 et 1 inscriptions de wagon, 2 plaque orange de matière dangereuse,
   3 tableau de destination, 4 et 5 affiches, 6 tableau des départs, 7 givre de vitre, 8 coulure de rouille,
   9 flaque gelée, 10 ornières de gadoue, 11 traces de pas, 12 panneau « avalanches », 13 suie, 14 graffiti, 15 cadran d'horloge */
var DEC2 = { wagon: 0, wagon2: 1, hazard: 2, dest: 3, poster: 4, poster2: 5, departs: 6, frost: 7, rust: 8, ice: 9, ruts: 10, steps: 11, avalanche: 12, soot: 13, tag: 14, clock: 15 };
function winterDecalAtlas() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = rngOf(8642), T = S / 4;
  const cell = (i, fn) => { g.save(); g.translate((i % 4) * T, Math.floor(i / 4) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); fn(); g.restore(); };
  const stencil = (lines, size, col) => {
    g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    lines.forEach(([txt, k], j) => { g.font = `bold ${Math.round(size * k)}px Arial, sans-serif`; g.fillText(txt, 14, 60 + j * size * 1.25); });
    g.globalCompositeOperation = 'destination-out';
    for (let j = 0; j < 260; j++) { g.fillStyle = `rgba(0,0,0,${R() * 0.7})`; g.fillRect(R() * T, R() * T, 2 + R() * 4, 1 + R() * 3); }
    g.globalCompositeOperation = 'source-over';
  };
  cell(0, () => stencil([['CFG', 1.6], ['21 85 150 3', 0.8], ['012-7', 0.8], ['Gbs 254', 0.7]], 30, 'rgba(238,236,228,0.92)'));
  cell(1, () => stencil([['ANCIEN DÉPÔT', 0.7], ['DU COL', 0.9], ['Tare 13 400 kg', 0.6], ['Charge 27 t', 0.6]], 34, 'rgba(238,236,228,0.9)'));
  cell(2, () => {
    g.fillStyle = '#e46a12'; g.fillRect(28, 64, 200, 128); g.strokeStyle = '#111'; g.lineWidth = 6; g.strokeRect(31, 67, 194, 122);
    g.beginPath(); g.moveTo(31, 128); g.lineTo(225, 128); g.stroke();
    g.fillStyle = '#111'; g.font = 'bold 44px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('33', 128, 116); g.fillText('1203', 128, 176);
  });
  cell(3, () => {
    g.fillStyle = '#f2efe6'; g.fillRect(16, 80, 224, 96); g.strokeStyle = '#1d3557'; g.lineWidth = 5; g.strokeRect(19, 83, 218, 90);
    g.fillStyle = '#1d3557'; g.font = 'bold 30px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('GIVRE', 128, 122); g.font = 'bold 22px Arial, sans-serif'; g.fillText('↔ VAL-BLANC', 128, 156);
  });
  [['#1d4e89', '#f6f1e3', 'SKI-CLUB\nDU COL', 'Concours de saut'], ['#b8322a', '#f7ecd0', 'BAL DU\nNOUVEL AN', 'Hôtel du Col']].forEach(([bg, fg, title, sub], k) => cell(4 + k, () => {
    const x = 40 + R() * 8, y = 18, w = T - 80, h = T - 36;
    g.fillStyle = bg; g.fillRect(x, y, w, h);
    g.fillStyle = fg; g.font = 'bold 30px Georgia, serif'; g.textAlign = 'center';
    title.split('\n').forEach((l, j) => g.fillText(l, x + w / 2, y + 56 + j * 34));
    g.font = 'italic 18px Georgia, serif'; g.fillText(sub, x + w / 2, y + h - 26);
    // montagnes stylisées
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.moveTo(x + 10, y + h - 50); g.lineTo(x + w * 0.35, y + 120); g.lineTo(x + w * 0.55, y + h - 70); g.lineTo(x + w * 0.72, y + 140); g.lineTo(x + w - 10, y + h - 50); g.closePath(); g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (let j = 0; j < 7; j++) { g.beginPath(); const ex = x + (R() < 0.5 ? 0 : w), ey = y + R() * h; g.moveTo(ex, ey); for (let q = 0; q < 5; q++) g.lineTo(ex + (R() - 0.5) * 50, ey + (R() - 0.5) * 50); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  }));
  cell(6, () => {
    g.fillStyle = '#141619'; g.fillRect(12, 12, T - 24, T - 24); g.strokeStyle = '#6d6d6d'; g.lineWidth = 4; g.strokeRect(14, 14, T - 28, T - 28);
    g.fillStyle = '#f2d35b'; g.font = 'bold 22px Arial, sans-serif'; g.textAlign = 'left'; g.fillText('DÉPARTS', 26, 44);
    const rows = [['07:42', 'VAL-BLANC'], ['09:15', 'LA COMBE'], ['11:03', 'VAL-BLANC'], ['14:28', 'SAINT-ROC'], ['17:50', 'VAL-BLANC']];
    g.font = '18px Arial, sans-serif';
    rows.forEach(([h, d], j) => { g.fillStyle = '#e8e8e8'; g.fillText(h, 26, 82 + j * 32); g.fillText(d, 96, 82 + j * 32); });
    g.fillStyle = '#d9483b'; g.font = 'bold 18px Arial, sans-serif'; g.fillText('TRAFIC INTERROMPU', 26, 236);
  });
  cell(7, () => {
    for (let j = 0; j < 80; j++) { const x = R() < 0.5 ? R() * 70 : T - R() * 70, y = R() < 0.5 ? R() * 70 : T - R() * 70, rr = 10 + R() * 40, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(240,246,252,0.7)'); gr.addColorStop(1, 'rgba(240,246,252,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); }
    g.strokeStyle = 'rgba(250,252,255,0.55)'; g.lineWidth = 1.2;
    const fern = (x, y, a, l, d) => { if (d > 4 || l < 4) return; const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); fern(x2, y2, a + 0.5, l * 0.6, d + 1); fern(x2, y2, a - 0.5, l * 0.6, d + 1); fern(x2, y2, a, l * 0.75, d + 1); };
    for (const [x, y, a] of [[0, 0, 0.8], [T, 0, 2.3], [0, T, -0.8], [T, T, -2.3], [10, T * 0.5, 0], [T - 10, T * 0.4, Math.PI]]) fern(x, y, a, 26, 0);
  });
  cell(8, () => { const gr = g.createLinearGradient(0, 0, 0, T); gr.addColorStop(0, 'rgba(110,52,22,0.6)'); gr.addColorStop(1, 'rgba(110,52,22,0)'); g.fillStyle = gr; for (let j = 0; j < 12; j++) { const x = T * 0.2 + R() * T * 0.6, w = 4 + R() * 14; g.fillRect(x, 0, w, T * (0.3 + R() * 0.7)); } });
  cell(9, () => { for (let j = 0; j < 14; j++) { const x = T / 2 + (R() - 0.5) * 90, y = T / 2 + (R() - 0.5) * 70, rr = 30 + R() * 50, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(150,175,200,0.55)'); gr.addColorStop(0.7, 'rgba(170,195,215,0.35)'); gr.addColorStop(1, 'rgba(170,195,215,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); } });
  cell(10, () => { for (const x of [T * 0.3, T * 0.7]) for (let y = 0; y < T; y += 5) { g.fillStyle = `rgba(80,74,66,${0.18 + R() * 0.2})`; g.fillRect(x - 16 + (R() - 0.5) * 4, y, 32, 4); } });
  cell(11, () => { for (let j = 0; j < 8; j++) { const s = j % 2 ? 1 : -1, x = T / 2 + s * 18, y = T - 20 - j * 30; g.fillStyle = 'rgba(90,100,115,0.35)'; g.beginPath(); g.ellipse(x, y, 9, 15, 0.05 * s, 0, TAU); g.fill(); g.beginPath(); g.ellipse(x, y + 17, 7, 7, 0, 0, TAU); g.fill(); } });
  cell(12, () => {
    g.fillStyle = '#f2f2ee'; g.beginPath(); g.moveTo(T / 2, 30); g.lineTo(T - 30, T - 50); g.lineTo(30, T - 50); g.closePath(); g.fill();
    g.strokeStyle = '#c0261e'; g.lineWidth = 16; g.lineJoin = 'round'; g.stroke();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.moveTo(80, T - 76); g.lineTo(T / 2 - 10, 110); g.lineTo(T / 2 + 20, 150); g.lineTo(T - 78, T - 76); g.closePath(); g.fill();
    g.fillStyle = '#f2f2ee'; for (let j = 0; j < 6; j++) { g.beginPath(); g.arc(T / 2 + 10 + j * 9, 150 + j * 12, 7, 0, TAU); g.fill(); }
  });
  cell(13, () => { for (let j = 0; j < 40; j++) { const x = T / 2 + (R() - 0.5) * T * 0.6, y = T * 0.3 + R() * T * 0.5, rr = 10 + R() * 40, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(18,16,15,0.22)'); gr.addColorStop(1, 'rgba(18,16,15,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); } });
  cell(14, () => {
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1f2a44'; g.lineWidth = 9;
    g.font = 'bold 64px Arial, sans-serif'; g.fillStyle = '#d23a2c'; g.save(); g.translate(T / 2, T / 2 + 10); g.rotate(-0.12); g.textAlign = 'center'; g.strokeText('GEL', 0, 0); g.fillText('GEL', 0, 0); g.restore();
  });
  cell(15, () => {
    // cadran d'horloge de gare : disque blanc, index, aiguilles arrêtées (le froid a eu raison du mécanisme)
    g.fillStyle = '#f4f2ea'; g.beginPath(); g.arc(T / 2, T / 2, T / 2 - 6, 0, TAU); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 6; g.stroke();
    for (let j = 0; j < 60; j++) { const a = (j / 60) * TAU, r0 = j % 5 ? T / 2 - 20 : T / 2 - 38; g.lineWidth = j % 5 ? 3 : 9; g.beginPath(); g.moveTo(T / 2 + Math.cos(a) * r0, T / 2 + Math.sin(a) * r0); g.lineTo(T / 2 + Math.cos(a) * (T / 2 - 12), T / 2 + Math.sin(a) * (T / 2 - 12)); g.stroke(); }
    const hand = (a, l, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(T / 2 - Math.cos(a) * 14, T / 2 - Math.sin(a) * 14); g.lineTo(T / 2 + Math.cos(a) * l, T / 2 + Math.sin(a) * l); g.stroke(); };
    hand(-Math.PI / 2 + (10.7 / 12) * TAU, 62, 12, '#1a1a1a'); hand(-Math.PI / 2 + (42 / 60) * TAU, 96, 8, '#1a1a1a'); hand(-Math.PI / 2 + (17 / 60) * TAU, 96, 3, '#c0261e');
  });
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Décalque d'hiver i : quadrilatère (points du repère courant) légèrement décollé de la surface */
function decal2Quad(M, i, p0, p1, p2, p3, n) {
  const u0 = (i % 4) * 0.25, v0 = Math.floor(i / 4) * 0.25, B = M.buf('decals2', (p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, (p0[2] + p2[2]) / 2);
  M.save(); M.cls = 1;
  const ids = [[p0, u0, v0 + 0.25], [p1, u0 + 0.25, v0 + 0.25], [p2, u0 + 0.25, v0], [p3, u0, v0]].map(([p, u, v]) => M.v(B, p[0], p[1], p[2], n[0], n[1], n[2], u, v));
  M.quadI(B, ids[0], ids[1], ids[2], ids[3]);
  M.restore();
}
/* Emplacement d'une affiche de largeur w sur une façade percée d'ouvertures ops : le milieu du panneau de mur libre (au moins w + 5 cm de large) le plus
   proche de u, à la hauteur [y0, y1]. Chaque ouverture de cette hauteur compte avec 45 cm de volets de chaque côté, les bouts du mur avec 30 cm
   (madriers d'angle, descente d'eau). Rend null s'il n'y a pas de place : une affiche posée au hasard tombait sur une fenêtre ou à cheval sur un volet. */
function posterSpot(len, ops, y0, y1, w, u) {
  const blocks = ops.filter((q) => q.y1 > y0 - 0.1 && q.y0 < y1 + 0.1).map((q) => [q.x0 - 0.45, q.x1 + 0.45]).sort((a, b) => a[0] - b[0]);
  let best = null, bd = Infinity, a = 0.3;
  for (const [b0, b1] of blocks.concat([[len - 0.3, len + 1]])) {
    if (b0 - a >= w + 0.05) { const c = (a + b0) / 2, d = Math.abs(c - u); if (d < bd) { bd = d; best = c; } }
    a = Math.max(a, b1);
  }
  return best;
}
/* Décalque d'hiver sur une façade (repère de façade) ou au sol (monde) */
function wallDecal2(M, i, xc, y, w, h, z = 0.008) { decal2Quad(M, i, [xc - w / 2, y, z], [xc + w / 2, y, z], [xc + w / 2, y + h, z], [xc - w / 2, y + h, z], [0, 0, 1]); }
function groundDecal2(i, x, z, w, d, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, b) => [x + a * c - b * s, 0.014, z + a * s + b * c];
  decal2Quad(DECOR, i, P(-w / 2, d / 2), P(w / 2, d / 2), P(w / 2, -d / 2), P(-w / 2, -d / 2), [0, 1, 0]);
}
/* Enseigne de l'atlas d'hiver posée à plat (repère de façade), avec son cadre */
function sign2Board(M, xc, y, w, h, idx, frame = [0.3, 0.25, 0.2]) {
  const [u0, v0, du, dv] = sign2UV(idx), B = M.buf('signs2', xc, y, 0.05), z = 0.06;
  M.save().color([1, 1, 1]);
  const a = M.v(B, xc - w / 2, y, z, 0, 0, 1, u0, v0 + dv), b = M.v(B, xc + w / 2, y, z, 0, 0, 1, u0 + du, v0 + dv);
  const c = M.v(B, xc + w / 2, y + h, z, 0, 0, 1, u0 + du, v0), d = M.v(B, xc - w / 2, y + h, z, 0, 0, 1, u0, v0);
  M.quadI(B, a, b, c, d);
  if (frame) { M.color(frame).local(1); lbox(M, 'paintwood', xc - w / 2 - 0.03, xc + w / 2 + 0.03, y - 0.03, y + h + 0.03, 0, z - 0.002); }
  M.restore();
}

/* ---------- Végétation ---------- */
/* Épicéa enneigé : tronc conique, verticilles de branches tombantes (deux cartes croisées par branche, de plus en plus
   courtes vers la cime), flèche ; collision du tronc seulement (les tirs et le regard passent entre les branches). */
/* base : hauteur de la première couronne de branches (un sapin de place, taillé, laisse passer dessous) ; sinon 0,9 à 1,5 m */
PF.spruce = (h = 9, seed = 1, base = 0) => prefab(`spruce${h}_${seed}${base ? '_' + base : ''}`, (M) => {
  const R = rngOf(seed * 31 + 7), r0 = 0.1 + h * 0.017;
  M.swFn = swCrown(0, 0, 0, h, h * 0.28, 0.75); // les bouts de branches et la cime balancent (02md-vent.js)
  M.color([0.62, 0.55, 0.48]).local(1);
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0, 1.4, y));
  M.cyl('bark', r0, h, 8, { r1: 0.025, caps: '', uR: 0.6 });
  M.aoFn = null;
  const y0r = 0.9 + R() * 0.6, y0 = base || y0r, n = Math.max(6, Math.round((h - y0) / 0.48));
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), y = lerp(y0, h - 0.5, t), L = 0.3 + h * 0.3 * Math.pow(1 - t, 1.05) * (0.85 + R() * 0.3);
    const k = t > 0.75 ? 4 : t > 0.4 ? 5 : 6, off = R() * TAU, rt = r0 * (1 - t);
    M.color([R.range(0.88, 1), R.range(0.92, 1.02), R.range(0.9, 1)]);
    for (let j = 0; j < k; j++) {
      const a = off + (j / k) * TAU + (R() - 0.5) * 0.45, ca = Math.cos(a), sa = Math.sin(a), droop = L * R.range(0.25, 0.42);
      const c0 = [ca * rt, y, sa * rt], c1 = [c0[0] + ca * L, y + 0.12 * L - droop, c0[2] + sa * L], hw = L * 0.34 + 0.08;
      for (const roll of [0.5, -0.5]) {
        const px = -sa * Math.cos(roll) * hw, py = Math.sin(roll) * hw, pz = ca * Math.cos(roll) * hw;
        foliageQuad(M, [c0[0] - px, c0[1] - py, c0[2] - pz], [c0[0] + px, c0[1] + py, c0[2] + pz], [c1[0] + px, c1[1] + py, c1[2] + pz], [c1[0] - px, c1[1] - py, c1[2] - pz],
          R() < 0.5 ? CONIF.branch : CONIF.branch2, 0.5, 'conifer');
      }
    }
  }
  // flèche : deux petites cartes dressées
  for (const a of [0, Math.PI / 2]) {
    const ca = Math.cos(a) * 0.32, sa = Math.sin(a) * 0.32;
    foliageQuad(M, [-ca, h - 0.9, -sa], [ca, h - 0.9, sa], [ca, h + 0.35, sa], [-ca, h + 0.35, -sa], CONIF.branch2, 0.3, 'conifer');
  }
  M.occ(-h * 0.25, h * 0.25, 1.2, h * 0.8, -h * 0.25, h * 0.25, 0.3);
  M.col(-r0, r0, 0, h * 0.8, -r0, r0, 'wood');
});
/* Sapin lointain (forêts, versants) : trois cartes verticales de la silhouette entière, sans ombre ni collision */
function farTree(M, x, y, z, h, rot) {
  for (let i = 0; i < 3; i++) {
    const a = rot + (i / 3) * Math.PI, c = Math.cos(a) * h * 0.3, s = Math.sin(a) * h * 0.3;
    foliageQuad(M, [x - c, y - 0.3, z - s], [x + c, y - 0.3, z + s], [x + c, y + h, z + s], [x - c, y + h, z - s], CONIF.tree, 0.25, 'conifer');
  }
}
/* Buisson enneigé (cartes croisées) */
PF.snowBush = (s = 1) => prefab('snowBush' + s, (M) => {
  M.swFn = swHeight(0, s, 1.3, 0.5);
  M.color([0.95, 1, 0.97]);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI + 0.4, c = Math.cos(a) * 0.75 * s, sn = Math.sin(a) * 0.75 * s;
    foliageQuad(M, [-c, -0.05, -sn], [c, -0.05, sn], [c, 1.0 * s, sn], [-c, 1.0 * s, -sn], CONIF.bush, 0.6, 'conifer');
  }
});

/* ---------- Neige modelée ---------- */
/* Tas de neige arrondi et bosselé (ellipse w x d, hauteur h), posé sur y = 0. mat 'ground' : posé au sol d'une carte d'hiver, il prend la
   matière du sol (même neige, mêmes traces, lue à la position dans le monde) et son pied se raccorde au sol en pente douce, sans arête
   (retour du propriétaire, octobre 2026 : les mottes étaient trop marquées par rapport au sol) ; le sol est peint en neige fraîche
   dessous (snowHeap) */
PF.snowMound = (w = 2, d = 1.4, h = 0.7, seed = 1, mat = 'snowmat') => prefab(`snowMound${w}_${d}_${h}_${seed}_${mat}`, (M) => {
  const R = rngOf(seed * 97 + 3), ph = [R() * TAU, R() * TAU, R() * TAU, R() * TAU], soft = mat === 'ground', k = soft ? 1.45 : 1;
  M.save().color([1, 1, 1]).local(1);
  M.surf(mat, 18, soft ? 10 : 7, (u, v) => {
    const a = u * TAU, wob = 1 + 0.1 * Math.sin(a * 3 + ph[0]) + 0.06 * Math.sin(a * 5 + ph[1]), r = (1 - v) * wob;
    const bump = 1 + 0.12 * Math.sin(a * 2 + ph[2] + v * 3) * Math.sin(v * Math.PI) + 0.08 * Math.sin(a * 7 + ph[3]) * (1 - v);
    const q = r * r / (wob * wob), prof = soft ? (1 - q) * (1 - q) : Math.pow(1 - q, 0.65);
    return [Math.cos(a) * r * k * w / 2, Math.max(soft ? -0.04 : 0, h * prof * bump - (soft ? 0.04 : 0)) - (soft ? 0 : 0.03 * (1 - v)), Math.sin(a) * r * k * d / 2];
  }, { closeU: true, flipN: true, uL: (w + d) * 1.6, vL: Math.max(w, d) * 0.6, pole: () => [0, 1, 0], ao: (u, v) => lerp(soft ? 0.94 : 0.82, 1, v) });
  M.restore();
});
/* Empreintes des tas de neige posés au sol (x, z, demi-axes, angle) : le sol y est peint en neige fraîche (givreGround), vidées après */
var SNOW_HEAPS = [];
function snowHeap(x, z, rx, rz, rot = 0) { SNOW_HEAPS.push({ x, z, rx, rz, rot }); }
/* Bourrelet de neige déblayée le long d'une rue (x0..x1 ou z0..z1 selon le plus long), hauteur h, avec collision basse :
   un couvert qu'on peut enjamber d'un saut. Dans la matière du sol (même neige, mêmes traces), profil en cloche qui se raccorde au sol
   sans arête, neige fraîche peinte dessous et autour (snowHeap) : il sort du sol au lieu d'y être posé */
function snowBank(x0, x1, z0, z1, h, seed = 1, col = true) {
  const M = DECOR, alongX = x1 - x0 >= z1 - z0, L = alongX ? x1 - x0 : z1 - z0, W = alongX ? z1 - z0 : x1 - x0, R = rngOf(seed * 53 + 11);
  const ph = [R() * TAU, R() * TAU, R() * TAU], nu = Math.max(6, Math.round(L / 0.5));
  M.save().color([1, 1, 1]).local(1).move((x0 + x1) / 2, 0, (z0 + z1) / 2);
  if (!alongX) M.rotY(Math.PI / 2);
  // profil en travers arrondi, crête irrégulière, bouts arrondis
  M.surf('ground', nu, 10, (u, v) => {
    // bouts effilés en pente douce (sur au moins 1,2 m ou une largeur et demie), crête irrégulière, largeur qui varie
    const s = (u - 0.5) * L, e = Math.min(1, Math.min(u, 1 - u) * L / Math.max(1.2, W * 1.5)), end = Math.sin(e * Math.PI / 2);
    const hh = h * end * (1 + 0.16 * Math.sin(s * 1.3 + ph[0]) + 0.1 * Math.sin(s * 3.1 + ph[1]) + 0.05 * Math.sin(s * 7.3 + ph[2])), ww = W * 0.75 * (0.45 + 0.55 * end) * (1 + 0.08 * Math.sin(s * 1.9 + ph[1]));
    const a = v * Math.PI, c = -Math.cos(a), prof = (1 - c * c) * (1 - c * c);
    return [s * (1 + 0.12 * (1 - end)), Math.max(-0.04, hh * prof - 0.04), c * ww * (1 + 0.06 * Math.sin(s * 2.3 + ph[2]))];
  }, { uL: L, vL: W * 1.5, flipN: true, ao: (u, v) => lerp(0.94, 1, Math.sin(v * Math.PI)) });
  M.restore();
  snowHeap((x0 + x1) / 2, (z0 + z1) / 2, (alongX ? L * 0.56 : W * 0.75), (alongX ? W * 0.75 : L * 0.56));
  if (col) WORLD.col({ x0: alongX ? x0 + 0.2 : x0 + W * 0.15, x1: alongX ? x1 - 0.2 : x1 - W * 0.15, y0: 0, y1: h * 0.85, z0: alongX ? z0 + W * 0.15 : z0 + 0.2, z1: alongX ? z1 - W * 0.15 : z1 - 0.2 }, 'snow');
}

/* ---------- Accessoires ---------- */
/* Bûcher : rondins fendus empilés (bois de bout en façade), petit toit de planches ; longueur L, hauteur H, profondeur D */
PF.woodpile = (L = 2.4, H = 1.2, D = 0.5) => prefab(`woodpile${L}_${H}_${D}`, (M) => {
  const R = rngOf(Math.round(L * 100 + H * 10)), r = 0.068, rows = Math.floor(H / (r * 1.85));
  M.local(1);
  for (let j = 0; j < rows; j++) {
    const y = r + j * r * 1.8, off = (j % 2) * r;
    for (let x = -L / 2 + r + off; x < L / 2 - r; x += r * 2.05) {
      const rr = r * R.range(0.85, 1.1), dz = R.range(-0.04, 0.04);
      M.color([R.range(0.85, 1), R.range(0.85, 1), R.range(0.85, 1)]);
      M.save().move(x + R.range(-0.01, 0.01), y, -D / 2 + dz).rotX(Math.PI / 2).rotY(R() * TAU); M.cyl('bark', rr, D, 8, { caps: '' }); M.restore();
      M.save().move(x, y, D / 2 + dz + 0.001).rotX(Math.PI / 2); M.cyl('logend', rr, 0.0005, 8, { caps: 't', side: false }); M.restore();
    }
  }
  // auvent de planches
  M.color([0.55, 0.45, 0.36]);
  M.save().move(0, rows * r * 1.8 + 0.12, 0).rotX(-0.12); M.boxB('wood', -L / 2 - 0.12, L / 2 + 0.12, 0, 0.04, -D / 2 - 0.1, D / 2 + 0.25); M.restore();
  for (const x of [-L / 2 - 0.05, L / 2 + 0.05]) M.boxB('wood', x - 0.04, x + 0.04, 0, rows * r * 1.8 + 0.12, D / 2 + 0.05, D / 2 + 0.13);
  M.col(-L / 2, L / 2, 0, rows * r * 1.8 + 0.1, -D / 2, D / 2, 'wood');
});
/* Barrière de bois (poteaux et deux lisses), longueur L le long de x ; sans collision (posée hors des passages) */
PF.fence = (L = 4) => prefab('fence' + L, (M) => {
  const R = rngOf(Math.round(L * 10)), n = Math.max(1, Math.round(L / 1.8));
  M.color([0.55, 0.46, 0.38]).local(1);
  for (let i = 0; i <= n; i++) { const x = -L / 2 + (L * i) / n; M.save().move(x, 0, 0).rotY(R() * 0.5); M.boxB('wood', -0.06, 0.06, 0, 1.15 + R() * 0.08, -0.06, 0.06, { bevel: 0.01 }); M.restore(); }
  for (const y of [0.45, 0.95]) { M.save().move(0, y, 0).rotZ((R() - 0.5) * 0.03); M.boxB('wood', -L / 2, L / 2, -0.04, 0.05, 0.06, 0.12, { bevel: 0.01 }); M.restore(); }
});
/* Luge de bois */
PF.sled = () => prefab('sled', (M) => {
  M.color([0.62, 0.42, 0.26]).local(1); M.cls = 2;
  for (const x of [-0.17, 0.17]) { M.tube('wood', 0.018, [[x, 0.02, 0.45], [x, 0.0, 0.3], [x, 0.0, -0.4], [x, 0.06, -0.52], [x, 0.16, -0.5]], 5); for (const z of [-0.3, 0, 0.3]) M.boxB('wood', x - 0.015, x + 0.015, 0.02, 0.2, z - 0.015, z + 0.015); }
  for (let i = 0; i < 5; i++) { const z = -0.32 + i * 0.16; M.boxB('wood', -0.22, 0.22, 0.2, 0.225, z - 0.06, z + 0.06, { bevel: 0.005 }); }
});
/* Bonhomme de neige : trois boules, yeux de charbon, nez en carotte, bras en branches, écharpe et bonnet */
PF.snowman = () => prefab('snowman', (M) => {
  M.color([1, 1, 1]).local(1);
  for (const [y, r] of [[0.32, 0.4], [0.9, 0.3], [1.33, 0.2]]) { M.save().move(0, y, 0).scl(r, r * 0.95, r); M.geo('snowmat', new THREE.SphereGeometry(1, 14, 10), { uvs: r * 2 }); M.restore(); }
  M.color([0.05, 0.05, 0.05]); M.cls = 1;
  for (const [x, y, z] of [[-0.07, 1.4, 0.17], [0.07, 1.4, 0.17], [0, 1.07, 0.27], [0, 0.94, 0.3], [0, 0.8, 0.29]]) { M.save().move(x, y, z).scl(0.025); M.geo('dark', G_SPH); M.restore(); }
  M.color([0.95, 0.45, 0.12]); M.save().move(0, 1.33, 0.18).rotX(Math.PI / 2); M.cyl('plastic', 0.03, 0.17, 6, { r1: 0.002 }); M.restore();
  M.color([0.35, 0.25, 0.17]);
  for (const s of [-1, 1]) M.tube('wood', 0.015, [[s * 0.26, 0.98, 0], [s * 0.5, 1.15, 0.05], [s * 0.62, 1.28, 0.02]], 4);
  M.color([0.72, 0.12, 0.1]); M.save().move(0, 1.12, 0); M.cyl('canvas', 0.21, 0.08, 12); M.restore();
  M.tube('canvas', 0.035, [[0.15, 1.15, 0.12], [0.2, 1.0, 0.2], [0.22, 0.85, 0.2]], 5);
  M.color([0.2, 0.32, 0.55]); M.save().move(0, 1.46, 0); M.lathe('canvas', [[0, 0.2], [0.12, 0.17], [0.19, 0.06], [0.205, 0], [0.205, -0.03], [0, -0.03]], 12); M.restore();
  M.save().move(0, 1.67, 0).scl(0.05); M.geo('canvas', G_SPH); M.restore();
  M.col(-0.4, 0.4, 0, 1.6, -0.4, 0.4, 'snow');
});
/* Un ski (175 x 8 cm) debout, spatule en +y : teinte de l'estampille. Prop physique : on l'incline au placement (rx = -0.2) pour l'appuyer */
PF.skiOne = () => prefab('skiOne', (M, P) => {
  P.tintable = ['plastic'];
  M.local(1); M.color([1, 1, 1]);
  M.boxB('plastic', -0.04, 0.04, 0, 1.75, -0.012, 0.012, { bevel: 0.005 });
  M.color([0.12, 0.12, 0.12]); M.boxB('dark', -0.03, 0.03, 0.62, 0.7, -0.03, 0.03, { bevel: 0.005 });
});
/* Un bâton de ski (1,25 m), debout */
PF.skiPole = () => prefab('skiPole', (M) => {
  M.local(1); M.color([0.3, 0.3, 0.3]);
  M.tube('steel', 0.009, [[0, 0, 0], [0, 1.2, 0]], 4);
  M.color([0.12, 0.12, 0.12]); M.tube('plastic', 0.016, [[0, 1.0, 0], [0, 1.25, 0]], 5);
  M.save().move(0, 0.12, 0); M.cyl('plastic', 0.045, 0.012, 8); M.restore();
});
/* Râtelier à skis (repère : le dos du râtelier vers -z, les skis posés devant, appuyés contre la planche du fond) : socle, deux
   montants, planche du fond. Les skis et les bâtons sont des props physiques, un par un (voir skiRackAt). */
PF.skiRack = () => prefab('skiRack', (M) => {
  M.color([0.5, 0.36, 0.24]).local(1);
  for (const x of [-1.1, 1.1]) M.boxB('wood', x - 0.05, x + 0.05, 0, 1.95, -0.52, -0.42);
  M.boxB('wood', -1.15, 1.15, 1.0, 1.9, -0.40, -0.36, { bevel: 0.008 });
  M.col(-1.15, 1.15, 0, 1.95, -0.54, -0.36, 'wood');
});

/* ---------- Architecture alpine ---------- */
var PAL_ALP = {
  plaster: [[0.95, 0.93, 0.88], [0.93, 0.89, 0.82], [0.9, 0.9, 0.87], [0.96, 0.91, 0.84], [0.88, 0.84, 0.78]],
  wood: [[0.86, 0.8, 0.72], [0.74, 0.66, 0.58], [0.95, 0.86, 0.76], [0.66, 0.6, 0.55]],
  shutter: [[0.22, 0.42, 0.28], [0.62, 0.17, 0.13], [0.2, 0.32, 0.5], [0.4, 0.28, 0.18], [0.85, 0.82, 0.74]],
  roof: [[0.78, 0.8, 0.85], [0.62, 0.52, 0.45], [0.58, 0.6, 0.64]],
  door: [[0.42, 0.26, 0.14], [0.2, 0.36, 0.26], [0.55, 0.16, 0.12], [0.3, 0.22, 0.16]],
};
/* Toit alpin à deux pans sur le bloc [x0, x1] x [z0, z1], égout à la hauteur y : couverture (ardoise ou bardeaux),
   sous-face lambrissée et chevrons apparents, pignons en planches, épaisse couche de neige qui déborde de l'égout,
   stalactites, cheminée. o : alongX (faîtage le long de x), pitch (rad), ovE / ovG (débords d'égout et de pignon),
   mat, tint, snowT (épaisseur de neige), chimney, wood (teinte des pignons), gable (matière des pignons), R */
function alpineRoof(x0, x1, z0, z1, y, o = {}) {
  const M = DECOR, alongX = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0, span = alongX ? z1 - z0 : x1 - x0, len = alongX ? x1 - x0 : z1 - z0;
  const R = o.R || rngOf(Math.round(x0 * 7 + z0 * 13 + y)), pitch = o.pitch || 0.46, ovE = o.ovE !== undefined ? o.ovE : 1.1, ovG = o.ovG !== undefined ? o.ovG : 0.8, tR = 0.16;
  const tn = Math.tan(pitch), rise = (span / 2) * tn, hs = span / 2 + ovE, drop = ovE * tn, T = o.snowT !== undefined ? o.snowT : 0.34;
  const L0 = -ovG, L1 = len + ovG, top = (z) => rise + tR - Math.abs(z) * tn, nl = hyp(hs, rise + drop), roofTint = o.tint || R.pick(PAL_ALP.roof);
  M.save();
  if (alongX) M.move(x0, y, (z0 + z1) / 2); else M.move((x0 + x1) / 2, y, z1).rotY(Math.PI / 2);
  for (const s of [1, -1]) {
    // couverture, sous-face, bandeau d'égout
    M.color(roofTint).world(1);
    M.quad(o.mat || 'slate', [L0, -drop + tR, s * hs], [L1, -drop + tR, s * hs], [L1, rise + tR, 0], [L0, rise + tR, 0], [0, hs / nl, s * (rise + drop) / nl]);
    M.color([0.58, 0.48, 0.38]).local(1);
    M.quad('boards', [L0, -drop, s * hs], [L1, -drop, s * hs], [L1, rise, 0], [L0, rise, 0], [0, -hs / nl, -s * (rise + drop) / nl]);
    M.color([0.45, 0.34, 0.25]);
    M.save().move(len / 2, -drop - 0.06, s * (hs + 0.02)); M.box('wood', L1 - L0 + 0.04, tR + 0.1, 0.05); M.restore();
    // chevrons apparents sous le débord d'égout
    M.cls = 1;
    const zc = (span / 2 + hs) / 2, Lr = (hs - span / 2) / Math.cos(pitch) + 0.05;
    for (let x = L0 + 0.35; x < L1 - 0.2; x += 0.72) { M.save().move(x, rise - zc * tn - 0.15, s * zc).rotX(s * pitch); M.box('wood', 0.1, 0.15, Lr); M.restore(); }
    M.cls = 0;
  }
  // pignons en planches, oculus sombre ; rives
  M.color(o.wood || [0.82, 0.74, 0.64]).world(1);
  for (const [xx, dir] of [[0, -1], [len, 1]]) {
    M.tri3(o.gable || 'boards', [xx, 0, -span / 2], [xx, 0, span / 2], [xx, rise, 0], [dir, 0, 0]);
    M.save().color([0.06, 0.06, 0.06]); M.quad('dark', [xx + dir * 0.01, rise * 0.45, -0.22], [xx + dir * 0.01, rise * 0.45, 0.22], [xx + dir * 0.01, rise * 0.45 + 0.5, 0.22], [xx + dir * 0.01, rise * 0.45 + 0.5, -0.22], [dir, 0, 0]); M.restore();
  }
  M.color([0.42, 0.32, 0.24]).local(1);
  for (const xx of [L0, L1]) for (const s of [1, -1]) {
    const dy = rise + drop, dz = -s * hs, L = hyp(dy, dz);
    // 2 cm sous la sous-face : M.box part de sa base, sa face basse était dans le plan des planches (z-fighting le long de chaque rive)
    M.save().move(xx, (rise - drop) / 2 + tR / 2 - 0.1, (s * hs) / 2).rotX(Math.atan2(-dy, dz)); M.box('wood', 0.06, 0.24, L); M.restore();
  }
  // cheminée de pierre, chapeau de béton, coussin de neige
  if (o.chimney) {
    const cx = len * R.range(0.25, 0.75), cz = (R() < 0.5 ? -1 : 1) * span * 0.14, cy = top(cz);
    M.color([0.85, 0.82, 0.78]).world(1); M.boxB('stone', cx - 0.32, cx + 0.32, cy - 0.6, cy + 1.1, cz - 0.32, cz + 0.32);
    M.color([0.75, 0.73, 0.7]).local(1); M.boxB('concrete', cx - 0.4, cx + 0.4, cy + 1.1, cy + 1.18, cz - 0.4, cz + 0.4, { bevel: 0.015 });
    M.color([1, 1, 1]); M.boxB('snowmat', cx - 0.38, cx + 0.38, cy + 1.18, cy + 1.32, cz - 0.38, cz + 0.38, { bevel: 0.06 });
    M.color([0.12, 0.11, 0.1]); M.boxB('dark', cx - 0.18, cx + 0.18, cy + 0.9, cy + 1.101, cz - 0.18, cz + 0.18);
  }
  // couche de neige : profil bombé, bourrelet qui déborde de l'égout, extrudé le long du faîtage
  if (T > 0) {
    const P = [[0, top(0) + T * 1.02]], side = (s) => {
      const pts = [[hs * 0.35, top(hs * 0.35) + T * 1.06], [hs * 0.75, top(hs * 0.75) + T], [hs - 0.04, top(hs) + T * 0.9], [hs + 0.11, top(hs) + T * 0.62], [hs + 0.17, top(hs) + T * 0.28],
        [hs + 0.13, top(hs) + 0.02], [hs + 0.02, top(hs) - 0.02], [hs - 0.1, top(hs - 0.1) - 0.01]];
      return pts.map(([z, yy]) => [s * z, yy]);
    };
    P.push(...side(1), [0, top(0) - 0.01], ...side(-1).reverse());
    M.save().color([1, 1, 1]).local(1).move(L0 - 0.06, 0, 0).mul(basis([0, 0, 1], [0, 1, 0], [1, 0, 0]).clone());
    M.extrude('snowmat', P, L1 - L0 + 0.12, { sharp: 1.0 });
    M.restore();
    // amas de neige bosselés sur les pans
    for (const s of [1, -1]) for (let k = 0; k < Math.max(1, Math.round(len / 4)); k++) {
      const zz = hs * R.range(0.25, 0.8), x = R.range(L0 + 0.8, L1 - 0.8);
      M.save().move(x, top(zz) + T * 0.75, s * zz).rotX(s * pitch); M.put(PF.snowMound(R.range(1.2, 2.2), R.range(0.8, 1.3), R.range(0.12, 0.22), 1 + Math.floor(R() * 6)), { cls: 1 }); M.restore();
    }
    // stalactites sous le bourrelet
    M.save().color([1, 1, 1]); M.cls = 2;
    for (const s of [1, -1]) for (let x = L0 + 0.15; x < L1 - 0.1; x += 0.1 + R() * 0.13) {
      if (R() < 0.3) continue;
      const L = 0.05 + Math.pow(R(), 2.3) * 0.65, r = 0.01 + L * 0.035;
      M.save().move(x, top(hs) + 0.03, s * (hs + 0.08)).rotX(Math.PI); M.cyl('ice', r, L, 5, { r1: 0.002, caps: '' }); M.restore();
    }
    M.restore();
  }
  M.occ(L0, L1, -drop, rise * 0.6, -hs, hs, 1);
  M.col(0, len, 0, rise * 0.5, -span / 2 + 0.3, span / 2 - 0.3, 'concrete');
  M.restore();
  return { rise, span, len, alongX };
}
/* Balcon de chalet (repère de façade) : plancher sur consoles, garde-corps de planches ajourées, main courante */
function chaletBalcony(M, x0, x1, y, dp, tint) {
  M.save().color(tint).local(1);
  M.boxB('boards', x0, x1, y - 0.12, y, 0, dp, { bevel: 0.015 });
  M.color([0.5, 0.38, 0.28]);
  for (const x of [x0 + 0.2, (x0 + x1) / 2, x1 - 0.2]) lbox(M, 'wood', x - 0.07, x + 0.07, y - 0.34, y - 0.12, 0, dp + 0.06);
  const top = y + 1.0;
  lbox(M, 'wood', x0, x1, top - 0.08, top, dp - 0.08, dp + 0.02);
  lbox(M, 'wood', x0, x1, y + 0.05, y + 0.12, dp - 0.06, dp);
  for (const x of [x0, x1]) { lbox(M, 'wood', x - 0.04, x + 0.04, top - 0.08, top, 0, dp); lbox(M, 'wood', x - 0.05, x + 0.05, y, top, dp - 0.07, dp + 0.01); }
  M.color(tint); M.cls = 1;
  for (let x = x0 + 0.12; x < x1 - 0.06; x += 0.15) lbox(M, 'boards', x - 0.055, x + 0.055, y + 0.12, top - 0.08, dp - 0.05, dp - 0.025);
  for (const x of [x0, x1]) for (let z = 0.12; z < dp - 0.1; z += 0.15) lbox(M, 'boards', x - 0.012, x + 0.012, y + 0.12, top - 0.08, z - 0.055, z + 0.055);
  M.restore();
  M.occ(x0, x1, y - 0.3, y, 0, dp, 0.8);
}
/* Petit auvent au-dessus d'une porte (repère de façade) : consoles, pan d'ardoise, neige */
function doorCanopy(M, xc, y, w) {
  M.save().color([0.45, 0.34, 0.25]).local(1);
  for (const x of [xc - w / 2 + 0.08, xc + w / 2 - 0.08]) M.tube('wood', 0.04, [[x, y - 0.45, 0], [x, y - 0.05, 0.75]], 4);
  M.save().move(xc, y, 0).rotX(0.32); M.color([0.62, 0.62, 0.66]); M.boxB('slate', -w / 2, w / 2, -0.04, 0.03, -0.05, 0.95); M.color([1, 1, 1]); M.boxB('snowmat', -w / 2 + 0.03, w / 2 - 0.03, 0.03, 0.17, 0.0, 0.92, { bevel: 0.06 }); M.restore();
  M.restore();
  M.occ(xc - w / 2, xc + w / 2, y - 0.2, y + 0.2, 0, 0.9, 0.8);
}
/* Façade de chalet : rez-de-chaussée de pierre ou enduit (fenêtres à volets, porte), étages en bardage de mélèze,
   angles en madriers croisés, balcon sur le pignon, jardinières, fenêtres parfois éclairées. o : voir chalet */
function chaletFace(face, x0, x1, z0, z1, o) {
  const F = facadeFrame(face, x0, x1, z0, z1), len = F.len, R = o.R, h = o.h, g0 = o.g0;
  const ops0 = [], ops1 = [], after = [], lit = () => R() < o.lit;
  const bays = Math.max(1, Math.round(len / (o.detailed ? 2.7 : 4.6))), bw = len / bays, mid = Math.floor(bays / 2);
  for (let i = 0; i < bays && !o.noGround; i++) {
    const a = bw * (i + 0.5);
    if (o.door && i === mid) {
      const op = { x0: a - 0.55, x1: a + 0.55, y0: 0, y1: 2.25, depth: 0.25 }; ops0.push(op);
      const tint = o.doorTint || R.pick(PAL_ALP.door);
      after.push((M) => { panelDoor(M, op, 0.25, tint, {}); casing(M, op, [0.42, 0.32, 0.24], 'wood', 0.1); doorCanopy(M, a, 2.75, 1.7); if (R() < 0.6) wallLamp(M, a + 0.85, 2.3); });
    } else if (o.detailed || R() < 0.45) {
      const op = { x0: a - 0.45, x1: a + 0.45, y0: 1.0, y1: 2.15, depth: 0.24 }; ops0.push(op);
      const L = lit(), st = R() < 0.2 ? 'closed' : 'open', gr = !o.stone && R() < 0.35;
      after.push((M) => { if (st !== 'closed') windowJoinery(M, op, 0.24, [0.92, 0.9, 0.86], { glass: L ? 'glassLit' : 'glass', curtain: R() < 0.4 ? R.pick(PAL.awning) : null }); sill(M, op, 'stone', [0.82, 0.8, 0.76]); shutters(M, op, o.shutter, st, R); if (gr) grille(M, op); });
    }
  }
  let first = true;
  for (let fy = g0 + 0.15; fy + 2.25 <= h - 0.05; fy += 2.8, first = false) {
    for (let i = 0; i < bays; i++) {
      if (!o.detailed && R() < 0.5) continue;
      const a = bw * (i + 0.5), european = o.balcony && first && i === mid;
      const op = european ? { x0: a - 0.5, x1: a + 0.5, y0: fy + 0.02, y1: fy + 2.1, depth: 0.2 } : { x0: a - 0.42, x1: a + 0.42, y0: fy + 0.8, y1: fy + 1.95, depth: 0.2 };
      ops1.push(op);
      const L = lit(), st = R() < 0.15 ? 'closed' : 'open', box = !european && !o.balcony && R() < 0.6;
      after.push((M) => {
        if (st !== 'closed' || european) windowJoinery(M, op, 0.2, [0.92, 0.9, 0.86], { glass: L ? 'glassLit' : 'glass', door: european });
        if (!european) shutters(M, op, o.shutter, st, R);
        if (box) { M.save().color([0.5, 0.36, 0.24]).local(1); lbox(M, 'boards', op.x0 - 0.06, op.x1 + 0.06, op.y0 - 0.26, op.y0 - 0.03, 0, 0.24); M.restore(); }
      });
    }
  }
  inFrame(F, (M) => {
    if (!o.noGround) {
      M.save().color(o.stone ? [0.9, 0.88, 0.85] : o.tint).world(1); M.aoFn = (x, y) => lerp(0.72, 1, smoothstep(0, 1.2, y));
      wallPierced(M, o.stone ? 'stone' : 'plaster', len, 0, g0, ops0, { depth: 0.24 });
      M.restore();
    }
    M.save().color(o.wood).world(1);
    wallPierced(M, 'boards', len, g0, h - g0, ops1, { depth: 0.2 });
    M.restore();
    // soubassement de pierre sous l'enduit
    if (!o.stone && !o.noGround) {
      let cur = 0; const pl = { mat: 'stone', h: 0.7, tint: [0.86, 0.84, 0.8] };
      for (const p of ops0.filter((q) => q.y0 < 0.5)) { if (p.x0 - cur > 0.05) plinthSeg(M, cur, p.x0, pl); cur = p.x1; }
      if (len - cur > 0.05) plinthSeg(M, cur, len, pl);
    }
    // sablière entre la maçonnerie et le bois, angles en madriers croisés
    M.save().color([0.5, 0.38, 0.28]).local(1); lbox(M, 'wood', -0.02, len + 0.02, g0 - 0.08, g0 + 0.14, 0.005, 0.1); M.restore(); // dos à 5 mm du mur : dans son plan, il scintillait sur la façade d'un chalet accolé
    M.save().color(o.wood).local(1); M.cls = 1;
    for (let y = g0 + 0.2; y < h - 0.15; y += 0.26) { lbox(M, 'boards', -0.22, 0.02, y, y + 0.2, -0.18, 0.05); lbox(M, 'boards', len - 0.02, len + 0.22, y, y + 0.2, -0.18, 0.05); }
    M.restore();
    for (const fn of after) fn(M);
    if (o.balcony) chaletBalcony(M, Math.max(0.5, len / 2 - 3.2), Math.min(len - 0.5, len / 2 + 3.2), g0 + 0.15, 1.15, o.wood);
    if (o.detailed && len > 5 && R() < 0.6 && !o.noGround) drainPipe(M, R() < 0.5 ? 0.35 : len - 0.35, h - 0.2);
    if (o.pile) { const L = Math.min(len - 1.2, 3.2); M.place(PF.woodpile(Math.round(L * 2) / 2, 1.3, 0.55), len / 2, 0, 0.3, 0, { nocol: !o.pileCol }); }
    if (o.detailed && !o.door && !o.noGround && R() < 0.35) { // affiche : entre deux fenêtres, au milieu du mur libre (les tirages restent ceux d'avant)
      const k = R() < 0.5 ? DEC2.poster : DEC2.poster2, u = posterSpot(len, ops0, 1.0, 1.8, 0.7, len * R.range(0.3, 0.7));
      if (u !== null && !o.noPoster) { M.save().color([1, 1, 1]); wallDecal2(M, k, u, 1.0, 0.7, 0.8); M.restore(); } // teinte neutre : celle du dernier élément posé (bois sombre) noircissait l'affiche ; noPoster : face cachée par un autre bâtiment (le fond de la scierie)
    }
  });
}
/* Chalet : bloc plein [x0, x1] x [z0, z1] (collision), façades détaillées sur les côtés de o.faces, toit alpin.
   o : h (hauteur à l'égout), g0 (hauteur du rez), ridge ('x' ou 'z'), faces, door (côté de la porte), balcony, stone,
   lit (part des fenêtres éclairées), tint, wood, shutter, roofMat, roofTint, pitch, chimney, pile (côté du bûcher),
   hollow (rez-de-chaussée praticable construit à part : collision et façades à partir de g0), noPoster (pas d'affiche : la façade est cachée par un autre bâtiment) */
function chalet(x0, x1, z0, z1, o = {}) {
  const R = rngOf(Math.round(x0 * 71 + z0 * 137 + (o.h || 6.6) * 13) + 4242);
  const h = o.h || 6.6, g0 = o.g0 || 3.0, alongX = o.ridge ? o.ridge === 'x' : x1 - x0 >= z1 - z0, faces = o.faces || 'nsew';
  const C = { R, h, g0, lit: o.lit !== undefined ? o.lit : 0.3, stone: o.stone !== undefined ? o.stone : R() < 0.4, tint: o.tint || R.pick(PAL_ALP.plaster), wood: o.wood || R.pick(PAL_ALP.wood), shutter: o.shutter || R.pick(PAL_ALP.shutter), doorTint: o.doorTint };
  DECOR.col(x0, x1, o.hollow ? g0 : 0, h, z0, z1, 'concrete');
  for (const f of 'nsew') {
    const gable = alongX ? f === 'e' || f === 'w' : f === 'n' || f === 's', det = faces.indexOf(f) >= 0;
    chaletFace(f, x0, x1, z0, z1, Object.assign({}, C, { detailed: det, door: o.door === f, balcony: det && gable && o.balcony !== false && h - g0 > 2.4, pile: o.pile === f, pileCol: o.pileCol, noGround: !!o.hollow, noPoster: !!o.noPoster }));
  }
  alpineRoof(x0, x1, z0, z1, h, { alongX, R, pitch: o.pitch, mat: o.roofMat, tint: o.roofTint, chimney: o.chimney !== undefined ? o.chimney : R() < 0.7, wood: C.wood, ovE: o.ovE, ovG: o.ovG });
}

/* ---------- Roche, falaise, montagnes ---------- */
/* Bloc de roche facetté (demi-axes rx, ry, rz) : sphère bosselée tranchée par des plans tirés au hasard ; posé sur y = 0 */
PF.boulder = (seed = 1, rx = 3, ry = 2.5, rz = 2.5) => prefab(`boulder${seed}_${rx}_${ry}_${rz}`, (M) => {
  const R = rngOf(seed * 113 + 9), P = [], ph = [R() * TAU, R() * TAU, R() * TAU];
  for (let i = 0; i < 9; i++) { const a = R() * TAU, b = Math.acos(R.range(-0.6, 1)); P.push([Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a), R.range(0.62, 0.9)]); }
  const k = R.range(0.88, 1.04);
  M.save().color([k, k * 0.99, k * 0.97]).world(1).move(0, ry * 0.7, 0);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(-ry * 0.5, ry * 0.4, y));
  M.surf('rock', 16, 10, (u, v) => {
    const a = u * TAU, b = v * Math.PI, sb = Math.sin(b), dx = sb * Math.cos(a), dy = -Math.cos(b), dz = sb * Math.sin(a);
    let r = 1 + sb * (0.08 * Math.sin(3 * a + ph[0]) * Math.sin(2 * b + ph[1]) + 0.05 * Math.sin(5 * a + ph[2]));
    for (const p of P) { const d = dx * p[0] + dy * p[1] + dz * p[2]; if (d > 0.05) r = Math.min(r, p[3] / d); }
    return [dx * r * rx, dy * r * ry, dz * r * rz];
  }, { closeU: true, flipN: true, pole: (v) => [0, v < 0.5 ? -1 : 1, 0], uL: TAU * Math.max(rx, rz), vL: Math.PI * ry });
  M.restore();
});
/* Paroi rocheuse le long de z (de za à zb), pied en x = xf, tournée vers +x (dir = 1) ou -x (dir = -1), hauteur H :
   fond continu bosselé, gros blocs facettés empilés devant (corniches et replats où la neige se pose), sapins en haut.
   Collision : la boîte pleine derrière xf (la paroi ne déborde jamais dans la zone de jeu). */
function rockWall(xf, za, zb, H, dir, seed, o = {}) { // o : skip(z, y) pour un bloc, clear(x, z) pour un sapin du replat, top
  const M = DECOR, R = rngOf(seed), N = makeNoise(seed + 7), L = zb - za;
  M.save().color([0.92, 0.92, 0.94]).world(1);
  M.surf('rock', Math.round(L / 1.5), 12, (u, v) => {
    const z = za + u * L, y = v * (H + 1), n = N.fbm(u * L * 0.05, v * 0.6, 64, 8, 4), st = Math.floor(y / 2.6) * 2.6;
    const back = 0.3 + y * 0.18 + n * 2.2 + smoothstep(st + 1.4, st + 2.4, y) * 0.5;
    return [xf - dir * back, y - 0.4, z];
  }, { uL: L, vL: H, flipN: dir > 0 });
  M.restore();
  // blocs : rangées du pied au sommet, de plus en plus en retrait
  for (let y = 0; y < H - 1; y += R.range(2.2, 3.4)) {
    for (let z = za + R.range(0, 3); z < zb - 1; z += R.range(3.5, 7)) {
      const rx = R.range(1.4, 2.8), ry = R.range(1.4, 2.6), rz = R.range(2, 4.2), back = 0.3 + y * 0.18 + rx * 0.55;
      if (o.skip && o.skip(z, y)) continue;
      M.place(PF.boulder(1 + Math.floor(R() * 12), Math.round(rx * 4) / 4, Math.round(ry * 4) / 4, Math.round(rz * 4) / 4), xf - dir * back, y - ry * 0.35, z, R() * TAU, { nocol: true });
    }
  }
  // replat sommital enneigé et sapins
  if (o.top !== false) {
    M.save().color([1, 1, 1]).world(1);
    M.surf('snowmat', 8, Math.round(L / 6), (u, v) => [xf - dir * (0.4 + H * 0.18 + 1.5 + u * 34), H + 0.3 + N.fbm(u * 3, v * 6, 64, 64, 3) * 1.2 - 0.6, za + v * L], { uL: 34, vL: L, flipN: dir < 0 });
    M.restore();
    for (let z = za + 2; z < zb - 2; z += R.range(3, 6)) {
      const x = xf - dir * (H * 0.18 + 3.5 + R() * 14), n = R.range(8, 13) | 0, k = 1 + Math.floor(R() * 6), r = R() * TAU; // tirages dans l'ordre d'avant
      if (!(o.clear && o.clear(x, z))) M.place(PF.spruce(n, k), x, H + 0.1, z, r, { nocol: true }); // o.clear : pas de sapin là (le pied d'une tour)
    }
  }
  if (dir > 0) WORLD.col({ x0: xf - 12, x1: xf, y0: 0, y1: H, z0: za, z1: zb }, 'concrete');
  else WORLD.col({ x0: xf, x1: xf + 12, y0: 0, y1: H, z0: za, z1: zb }, 'concrete');
}
/* Anneau de montagnes autour de la vallée (rayons r0 à r1, z étiré de k), roche que le shader enneige sur les pentes
   douces ; forêt de sapins lointains sur les bas versants. west : surélévation du côté -x (la vallée y est plus haute) */
function mountainRing(r0, r1, hmax, seed, o = {}) {
  const M = DECOR, N = makeNoise(seed), R = rngOf(seed + 1), k = o.k || 1.2, west = o.west || 0;
  const H = (u, v) => {
    const a = u * TAU, ridge = 1 - Math.abs(N.fbm(u, v * 0.6, 24, 4, 4) * 2 - 1), big = N.fbm(u, 0.5, 7, 1, 3);
    return hmax * Math.pow(smoothstep(0, 1, v), 1.3) * (0.3 + big * 0.95) * (0.5 + ridge * 0.65) + west * Math.pow(Math.max(0, -Math.cos(a)), 2) * smoothstep(0, 0.15, v);
  };
  const P = (u, v) => { const a = u * TAU, r = lerp(r0, r1, v); return [Math.cos(a) * r, H(u, v) - 1.5, Math.sin(a) * r * k]; };
  WORLD.force = 'far';
  M.save().color([0.95, 0.96, 1]).world(4); M.cls = 1;
  M.surf('rock', 150, 18, P, { closeU: true, uL: 1, vL: 1 });
  M.world(1); M.restore();
  for (let i = 0; i < (o.trees || 420); i++) {
    const u = R(), v = R.range(0.03, 0.42), p = P(u, v);
    if (p[1] > hmax * 0.5) continue;
    farTree(M, p[0], p[1], p[2], R.range(7, 13), R() * TAU);
  }
  WORLD.force = null;
}
/* Chalet lointain simplifié (vallée, versants) : volume enduit et boisé, toit enneigé sans détails */
function farChalet(cx, cz, w, d, h, rot, R) {
  const M = DECOR;
  M.save().move(cx, 0, cz).rotY(rot).color(R.pick(PAL_ALP.plaster)).world(1);
  M.boxB('plaster', -w / 2, w / 2, 0, h * 0.45, -d / 2, d / 2, { skip: 'y' });
  M.color(R.pick(PAL_ALP.wood)); M.boxB('boards', -w / 2, w / 2, h * 0.45, h, -d / 2, d / 2, { skip: 'y' });
  M.color([0.06, 0.06, 0.06]);
  for (let x = -w / 2 + 1.2; x < w / 2 - 0.8; x += 2.2) for (const y of [1.2, h * 0.45 + 1.0]) M.quad(R() < 0.3 ? 'glassLit' : 'dark', [x - 0.4, y, d / 2 + 0.02], [x + 0.4, y, d / 2 + 0.02], [x + 0.4, y + 1.0, d / 2 + 0.02], [x - 0.4, y + 1.0, d / 2 + 0.02], [0, 0, 1]);
  M.restore();
  M.save().move(cx, 0, cz).rotY(rot).move(-w / 2, 0, -d / 2);
  alpineRoofLocal(M, w, d, h, R);
  M.restore();
}
/* Toit enneigé simplifié dans le repère courant (bloc de 0 à w en x, 0 à d en z, égout à h), faîtage le long de x */
function alpineRoofLocal(M, w, d, h, R) {
  const pitch = 0.46, tn = Math.tan(pitch), ov = 0.9, hs = d / 2 + ov, rise = (d / 2) * tn, drop = ov * tn;
  M.save().move(0, h, d / 2);
  M.color(R.pick(PAL_ALP.wood)).world(1);
  for (const xx of [0, w]) M.tri3('boards', [xx, 0, -d / 2], [xx, 0, d / 2], [xx, rise, 0], [xx ? 1 : -1, 0, 0]);
  M.color([0.55, 0.45, 0.36]).local(1);
  for (const s of [1, -1]) M.quad('boards', [-ov, -drop, s * hs], [w + ov, -drop, s * hs], [w + ov, rise, 0], [-ov, rise, 0], [0, -1, 0]);
  const T = 0.4, P = [[0, rise + 0.16 + T], [hs + 0.12, -drop + 0.16 + T * 0.55], [hs + 0.12, -drop + 0.05], [0, rise + 0.12], [-hs - 0.12, -drop + 0.05], [-hs - 0.12, -drop + 0.16 + T * 0.55]];
  M.color([1, 1, 1]).move(-ov - 0.05, 0, 0).mul(basis([0, 0, 1], [0, 1, 0], [1, 0, 0]).clone());
  M.extrude('snowmat', P, w + ov * 2 + 0.1, { sharp: 0.9 });
  M.restore();
}

/* ---------- Chute de neige ---------- */
/* Flocons autour de la caméra (boîte de 36 x 16 x 36 m qui la suit), poussés par un vent qui tourne lentement ; cachés
   sous les toits et dans les pièces (part de ciel visible de l'éclairage cuit, lue dans le shader). */
var SNOWFALL = { obj: null, mat: null };
function makeSnowfall(k) {
  const n = Math.round(2400 * k), g = new THREE.BufferGeometry(), p = new Float32Array(n * 3), s = new Float32Array(n);
  for (let i = 0; i < n; i++) { p[i * 3] = rand(-18, 18); p[i * 3 + 1] = rand(-4, 12); p[i * 3 + 2] = rand(-18, 18); s[i] = rand(0.6, 1.5); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('aS', new THREE.BufferAttribute(s, 1));
  const m = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 540 }, tVol: WMU.tVol, uVolMin: WMU.uVolMin, uVolInv: WMU.uVolInv, uVolL: WMU.uVolL },
    vertexShader: `uniform float uScale; uniform highp sampler3D tVol; uniform vec3 uVolMin, uVolInv; uniform vec4 uVolL;
      ${VOL_Q}
      attribute float aS; varying float vA;
      void main() {
        vec3 q = clamp((position - uVolMin) * uVolInv, 0.0, 1.0);
        float sky = texture(tVol, VOL_Q(q)).b; // ciel à la verticale : pas de flocons sous un toit
        vec4 mv = modelViewMatrix * vec4(position, 1.0); float d = -mv.z;
        vA = smoothstep(0.32, 0.6, sky) * smoothstep(0.7, 2.2, d) * (1.0 - smoothstep(13.0, 19.0, d));
        gl_PointSize = clamp(0.024 * aS * uScale / max(d, 0.1), 1.0, 7.0); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; void main() { float r = length(gl_PointCoord - 0.5) * 2.0; float a = (1.0 - smoothstep(0.25, 1.0, r)) * vA * 0.8;
      if (a < 0.01) discard; gl_FragColor = vec4(0.94, 0.96, 1.0, a); }`,
    transparent: true, depthWrite: false,
  });
  const o = new THREE.Points(g, m); o.frustumCulled = false; o.renderOrder = 4; o.userData.weather = true; o.userData.noAO = true;
  SNOWFALL.obj = mapAdd(o); SNOWFALL.mat = m;
  if (FX) onResizeFx();
}
function updateSnowfall(dt, t) {
  const o = SNOWFALL.obj; if (!o) return;
  const p = o.geometry.attributes.position.array, c = camera.position, wx = 0.7 + Math.sin(t * 0.07) * 0.6, wz = 0.25 + Math.cos(t * 0.05) * 0.45;
  for (let i = 0, j = 0; i < p.length; i += 3, j++) {
    const k = j * 0.618;
    p[i] += (wx + Math.sin(t * 1.3 + k * 5.1) * 0.4) * dt;
    p[i + 1] -= (0.85 + (j % 9) * 0.07) * dt;
    p[i + 2] += (wz + Math.cos(t * 1.1 + k * 7.3) * 0.4) * dt;
    if (p[i] - c.x > 18) p[i] -= 36; else if (p[i] - c.x < -18) p[i] += 36;
    if (p[i + 2] - c.z > 18) p[i + 2] -= 36; else if (p[i + 2] - c.z < -18) p[i + 2] += 36;
    if (p[i + 1] - c.y < -4) p[i + 1] += 16; else if (p[i + 1] - c.y > 12) p[i + 1] -= 16;
  }
  o.geometry.attributes.position.needsUpdate = true;
}

/* ---------- Neige posée, lumières, bois ---------- */
/* Couche de neige bombée sur une surface plate (toit terrasse, dalle) : coussin bosselé aux bords arrondis, d'épaisseur T */
function snowCap(x0, x1, z0, z1, y, T = 0.3, seed = 1) {
  const M = DECOR, R = rngOf(seed * 41 + 3), ph = [R() * TAU, R() * TAU, R() * TAU], w = x1 - x0, d = z1 - z0;
  M.save().color([1, 1, 1]).local(1);
  M.surf('snowmat', Math.max(4, Math.round(w / 0.8)), Math.max(4, Math.round(d / 0.8)), (u, v) => {
    const ex = Math.min(u * w, (1 - u) * w), ez = Math.min(v * d, (1 - v) * d), e = smoothstep(0, 0.45, Math.min(ex, ez));
    const n = 1 + 0.15 * Math.sin(u * w * 0.9 + ph[0]) * Math.sin(v * d * 0.7 + ph[1]) + 0.08 * Math.sin((u * w + v * d) * 2.1 + ph[2]);
    return [x0 + u * w, y + T * Math.sqrt(e) * n - 0.02, z0 + v * d];
  }, { uL: w, vL: d, flipN: true });
  M.restore();
}
/* Petites pattes d'attache en métal aux deux bouts d'une ligne tendue (linge, guirlande) : le fil tient visiblement à quelque chose */
function lineHooks(a, b) {
  const M = DECOR; M.save().color([0.25, 0.25, 0.24]).local(1); M.cls = 2;
  for (const p of [a, b]) M.boxB('steel', p[0] - 0.035, p[0] + 0.035, p[1] - 0.04, p[1] + 0.04, p[2] - 0.035, p[2] + 0.035);
  M.restore();
}
/* Guirlande d'ampoules colorées entre deux points (fil qui pend de sag), menus détails */
function stringLights(a, b, sag, seed = 1) {
  LINES.push({ k: 'guirlande', a, b }); lineHooks(a, b);
  const M = DECOR, R = rngOf(seed), L = hyp3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(3, Math.round(L / 0.45));
  const C = [[2.6, 0.55, 0.3], [0.45, 2.0, 0.6], [2.6, 1.9, 0.5], [0.6, 1.0, 2.6]];
  M.save().color([0.08, 0.08, 0.08]); M.cls = 2;
  M.tube('rubber', 0.008, sagPath(a, b, sag, 14), 3);
  for (let i = 1; i < n; i++) {
    const t = i / n, x = lerp(a[0], b[0], t), y = lerp(a[1], b[1], t) - Math.sin(t * Math.PI) * sag - 0.05, z = lerp(a[2], b[2], t);
    M.color(C[(i + seed) % 4]); M.save().move(x, y, z).scl(0.035, 0.05, 0.035); M.geo('bulb', G_SPH); M.restore();
  }
  M.restore();
}
/* Sapin de Noël décoré : épicéa, guirlande en spirale, boules et étoile */
PF.xmasTree = (h = 6, base = 0) => prefab('xmasTree' + h + (base ? '_' + base : ''), (M) => {
  M.put(PF.spruce(h, 3, base));
  const yb = base ? base - 0.2 : 0; // guirlande et boules depuis la première couronne
  const R = rngOf(h * 7), C = [[2.6, 0.55, 0.3], [2.6, 1.9, 0.5], [0.6, 1.0, 2.6], [2.4, 2.2, 1.6]];
  M.cls = 2;
  for (let i = 0; i < 70; i++) {
    const t = i / 70, y = Math.max(1.2, yb) + t * (h - 0.4 - Math.max(1.2, yb)), r = (h * 0.3) * Math.pow(1 - (y - 1) / h, 1.05) * 0.85 + 0.15, a = t * TAU * 5.5;
    M.color(C[i % 4]); M.save().move(Math.cos(a) * r, y - 0.25, Math.sin(a) * r).scl(0.045); M.geo('bulb', G_SPH); M.restore();
  }
  for (let i = 0; i < 26; i++) {
    const y = Math.max(1.3, yb) + R() * (h - 0.7 - Math.max(1.3, yb)), r = (h * 0.3) * Math.pow(1 - (y - 1) / h, 1.05) * 0.8, a = R() * TAU;
    M.color(R.pick([[0.75, 0.1, 0.08], [0.85, 0.65, 0.15], [0.15, 0.25, 0.6]])); M.save().move(Math.cos(a) * r, y - 0.35, Math.sin(a) * r).scl(0.09); M.geo('carpaint', G_SPH); M.restore();
  }
  M.color([2.8, 2.3, 0.9]); M.save().move(0, h + 0.4, 0).scl(0.14, 0.2, 0.05); M.geo('bulb', new THREE.OctahedronGeometry(1, 0)); M.restore();
});
/* Pile de grumes en pyramide (rangs de n, n-1... rondins de rayon r, longueur L le long de z), avec sa collision */
function logPile(x, z, L, n, r, seed = 1) {
  const M = DECOR, R = rngOf(seed * 19 + 5);
  M.save().local(1);
  let y = r, cnt = n;
  while (cnt > 0) {
    for (let i = 0; i < cnt; i++) {
      const xx = x + (i - (cnt - 1) / 2) * r * 2.02, rr = r * R.range(0.88, 1.06), len = L * R.range(0.92, 1), dz = R.range(-0.25, 0.25);
      const k = R.range(0.8, 1); M.color([k, k * R.range(0.94, 1), k * R.range(0.88, 0.98)]); // même teinte chaude pour toutes, seule la clarté varie (des canaux tirés au hasard donnaient des rondins rosés ou bleutés)
      M.save().move(xx, y, z - len / 2 + dz).rotX(Math.PI / 2).rotY(R() * TAU); M.cyl('bark', rr, len, 10, { caps: '' }); M.restore();
      for (const s of [-1, 1]) { M.save().move(xx, y, z + dz + s * len / 2).rotX(s * Math.PI / 2); M.cyl('logend', rr, 0.0005, 10, { caps: 't', side: false }); M.restore(); }
    }
    y += r * 1.72; cnt--;
  }
  M.color([0.3, 0.26, 0.22]);
  for (const s of [-1, 1]) for (const dz of [-L * 0.3, L * 0.3]) M.boxB('wood', x + s * (n * r + 0.05) - 0.06, x + s * (n * r + 0.05) + 0.06, 0, r * 2.4, z + dz - 0.06, z + dz + 0.06);
  M.restore();
  WORLD.col({ x0: x - n * r, x1: x + n * r, y0: 0, y1: r * 1.6, z0: z - L / 2, z1: z + L / 2 }, 'wood');
  if (n > 1) WORLD.col({ x0: x - (n - 1) * r, x1: x + (n - 1) * r, y0: r * 1.6, y1: r * (1 + 1.72 * (n - 1)) + r * 0.6, z0: z - L / 2, z1: z + L / 2 }, 'wood');
}
/* Pile de planches sciées, lits séparés par des liteaux, longueur L le long de z */
PF.plankStack = (L = 4, W = 1.2, H = 1.2) => prefab(`plankStack${L}_${W}_${H}`, (M) => {
  const R = rngOf(Math.round(L * 10 + H * 7)), n = Math.round(H / 0.09);
  M.local(1);
  for (let j = 0; j < n; j++) {
    const y = j * 0.09;
    if (j % 3 === 0) { M.color([0.4, 0.32, 0.24]); for (const dz of [-L * 0.4, 0, L * 0.4]) M.boxB('wood', -W / 2, W / 2, y, y + 0.03, dz - 0.03, dz + 0.03); continue; }
    M.color([R.range(0.85, 1), R.range(0.8, 0.95), R.range(0.75, 0.88)]);
    for (let x = -W / 2; x < W / 2 - 0.05; x += 0.2) M.boxB('crate', x + 0.005, x + 0.195, y, y + 0.06, -L / 2 + R.range(0, 0.15), L / 2 - R.range(0, 0.15));
  }
  M.col(-W / 2, W / 2, 0, n * 0.09, -L / 2, L / 2, 'wood');
});
/* Botte de foin rectangulaire (petite botte, d'après photos) : tranches pressées qui se décalent un peu, deux ficelles qui en font le tour,
   brins qui dépassent des bouts. Mêmes dimensions et même collision qu'avant (0,9 x 0,45 x 0,5 m) */
PF.hayBale = () => prefab('hayBale', (M) => {
  M.color([0.86, 0.74, 0.46]).local(1);
  const R = rngOf(917), n = 8;
  for (let k = 0; k < n; k++) { const x0 = lerp(-0.45, 0.45, k / n), x1 = lerp(-0.45, 0.45, (k + 1) / n), e = R.range(-0.006, 0.006); M.color([0.86 + e * 6, 0.74 + e * 6, 0.46]); M.boxB('burlap', x0, x1, 0, 0.45 + e, -0.25 - e, 0.25 + e, { bevel: 0.012 }); }
  M.color([0.55, 0.45, 0.3]); M.cls = 1;
  for (const x of [-0.2, 0.2]) M.boxB('plastic', x - 0.01, x + 0.01, -0.002, 0.468, -0.268, 0.268); // 8 mm au-dessus de la botte (à 2 mm, la ficelle scintillait de loin)
  M.color([0.82, 0.7, 0.42]); M.cls = 2;
  for (const sd of [-1, 1]) for (let k = 0; k < 7; k++) { const y = R.range(0.05, 0.4), z = R.range(-0.2, 0.2), a = R.range(-0.6, 0.6); M.save().move(sd * 0.452, y, z).rotX(a); M.quad('burlap', [0, -0.004, 0], [0, 0.004, 0], [sd * 0.07, 0.004, 0.01], [sd * 0.07, -0.004, 0.01], [0, 1, 0]); M.restore(); }
  M.cls = 0;
  M.col(-0.45, 0.45, 0, 0.45, -0.25, 0.25, 'dirt');
});

}catch(e){HOOKS.missing['02i-hiver.js']=String(e&&e.message||e)}
/* ===== 02j-rail.js ===== */
try{
/* ==========================================================================
   CHEMIN DE FER : voie (ballast, traverses de bois, rails), matériel roulant et équipements de gare, réutilisables.
   Repère des véhicules : longueur le long de z, posés sur les rails (champignon du rail à y = RAIL.top), largeur
   de voie normale. Comme pour les véhicules routiers, les collisions sont décrites par la carte (boîtes simples).
   ========================================================================== */
var RAIL = { gauge: 1.435, top: 0.37, bed: 0.16 };

/* ---------- Voie ---------- */
/* Lit de ballast enneigé (boîte praticable, hauteur RAIL.bed) sur [x0, x1] x [z0, z1] : on marche dessus, les rails
   dépassent à peine des chevilles */
function trackBed(x0, x1, z0, z1) {
  const M = DECOR;
  M.save().color([0.62, 0.6, 0.58]).world(1);
  M.boxB('gravel', x0, x1, 0, RAIL.bed, z0, z1, { skip: 'zZ' });
  M.restore();
  WORLD.col({ x0, x1, y0: 0, y1: RAIL.bed, z0, z1 }, 'snow');
}
/* Voie le long de z, centrée en x : traverses de bois créosoté tous les 0,6 m, rails à patin (profil Vignole) */
function railTrack(x, z0, z1) {
  const M = DECOR, R = rngOf(Math.round(x * 31 + z0));
  M.save().local(1); M.cls = 1;
  for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.6) {
    M.color([R.range(0.32, 0.42), R.range(0.26, 0.32), R.range(0.2, 0.25)]);
    M.save().move(x + R.range(-0.03, 0.03), RAIL.bed - 0.06, z).rotY(R.range(-0.02, 0.02)); M.box('wood', 2.6, 0.17, 0.25, { bevel: 0.01 }); M.restore();
  }
  M.restore();
  // rail : patin, âme, champignon ; table de roulement polie
  const Pr = [[-0.075, 0], [0.075, 0], [0.075, 0.012], [0.012, 0.03], [0.009, 0.13], [0.034, 0.138], [0.034, 0.172], [-0.034, 0.172], [-0.034, 0.138], [-0.009, 0.13], [-0.012, 0.03], [-0.075, 0.012]];
  for (const s of [-1, 1]) {
    const rx = x + s * (RAIL.gauge / 2 + 0.036), y = RAIL.top - 0.172;
    M.save().color([0.7, 0.62, 0.55]).local(1).move(rx, y, z0).mul(basis([1, 0, 0], [0, 1, 0], [0, 0, 1]).clone());
    M.extrude('rust', Pr, z1 - z0, { sharp: 0.4 });
    M.color([0.85, 0.85, 0.86]); M.boxB('steel', -0.03, 0.03, 0.172, 0.18, 0, z1 - z0, { skip: 'y' }); // 8 mm au-dessus du champignon (3 mm scintillaient de loin)
    M.restore();
  }
}

/* ---------- Matériel roulant ---------- */
/* Roue de wagon (boudin, voile, moyeu), axe le long de x, posée sur le rail */
function railWheel(M, x, z, r = 0.46) {
  M.save().move(x, RAIL.top - 0.005 + r, z).rotZ(Math.PI / 2);
  M.lathe('rust', [[0.08, -0.07], [r * 0.82, -0.07], [r, -0.065], [r, 0.04], [r + 0.03, 0.045], [r + 0.03, 0.07], [r * 0.82, 0.07], [0.14, 0.05], [0.14, 0.11], [0.06, 0.11]], 16, { sharp: 0.5 });
  M.restore();
}
/* Bogie à deux essieux centré en z : longerons, ressorts, boîtes d'essieu, traverse danseuse */
function railBogie(M, z, r = 0.46) {
  M.save().color([0.2, 0.19, 0.18]).local(1);
  const yc = RAIL.top + r;
  for (const dz of [-0.95, 0.95]) {
    for (const s of [-1, 1]) railWheel(M, s * RAIL.gauge / 2 * 1.04, z + dz, r);
    M.save().move(-0.78, yc, z + dz).rotZ(-Math.PI / 2); M.cyl('rust', 0.065, 1.56, 8); M.restore();
  }
  for (const s of [-1, 1]) {
    const x = s * 0.98;
    M.boxB('rust', x - 0.07, x + 0.07, yc - 0.1, yc + 0.16, z - 1.35, z + 1.35, { bevel: 0.02 });
    for (const dz of [-0.95, 0.95]) M.boxB('rust', x - 0.11, x + 0.11, yc - 0.18, yc + 0.12, z + dz - 0.14, z + dz + 0.14, { bevel: 0.02 });
    for (const dz of [-0.35, 0.35]) { M.save().move(x, yc + 0.16, z + dz); M.cyl('steel', 0.08, 0.25, 8); M.restore(); }
  }
  M.boxB('rust', -1.05, 1.05, yc + 0.16, yc + 0.34, z - 0.3, z + 0.3, { bevel: 0.02 });
  M.restore();
}
/* Châssis : longerons, traverses de tête, tampons et crochets d'attelage aux deux bouts (longueur entre têtes L) */
function railFrame(M, L, W, y0, y1) {
  const hl = L / 2;
  M.save().color([0.2, 0.19, 0.18]).local(1);
  for (const s of [-1, 1]) M.boxB('rust', s * (W / 2 - 0.12) - 0.1, s * (W / 2 - 0.12) + 0.1, y0, y1, -hl, hl, { bevel: 0.015 });
  for (let z = -hl + 1.4; z < hl - 1; z += 2.2) M.boxB('rust', -W / 2 + 0.2, W / 2 - 0.2, y0 + 0.06, y1 - 0.04, z - 0.08, z + 0.08);
  for (const s of [-1, 1]) {
    M.boxB('rust', -W / 2 + 0.05, W / 2 - 0.05, y0 - 0.06, y1 + 0.02, s * hl - 0.12, s * hl + 0.12, { bevel: 0.02 });
    for (const x of [-0.88, 0.88]) {
      M.save().move(x, (y0 + y1) / 2 - 0.02, s * hl).rotX(s * Math.PI / 2); M.cyl('steel', 0.085, 0.42, 8); M.move(0, 0.42, 0); M.cyl('steel', 0.21, 0.05, 14); M.restore();
    }
    M.boxB('rust', -0.06, 0.06, y0 + 0.02, y1 - 0.06, s * (hl + 0.1), s * (hl + 0.38));
    M.save().move(0, y0 - 0.02, s * (hl + 0.38)); M.tube('rust', 0.025, [[0, 0, 0], [0, -0.12, s * 0.12], [0, -0.32, s * 0.16]], 5); M.restore();
  }
  M.restore();
}
/* Wagon couvert (12,2 m entre têtes) : caisse en planches teintées et ossature en acier, toit cintré, portes coulissantes
   (côté +x fermée, côté -x entrouverte sur un intérieur sombre), échelle, volant de frein, inscriptions */
PF.boxcar = () => prefab('boxcar', (M, P) => {
  P.tintable = ['paintwood'];
  const L = 12.2, W = 2.85, hl = L / 2, hw = W / 2, y0 = 1.2, y1 = 3.72, rise = 0.32;
  M.local(1);
  railFrame(M, L, W, 0.95, y0);
  for (const z of [-4.5, 4.5]) railBogie(M, z);
  // parois latérales en planches (une ouverture de porte au milieu), ossature
  M.color([1, 1, 1]); M.uvS = 1;
  M.aoFn = (x, y) => lerp(0.7, 1, smoothstep(y0, y0 + 0.8, y));
  for (const s of [-1, 1]) {
    const x = s * hw;
    M.boxB('paintwood', x, x - s * 0.04, y0, y1, -hl, -1.3); M.boxB('paintwood', x, x - s * 0.04, y0, y1, 1.3, hl);
    if (s < 0) M.boxB('paintwood', x, x - s * 0.04, y0 + 2.3, y1, -1.3, 1.3);
  }
  for (const s of [-1, 1]) M.boxB('paintwood', -hw, hw, y0, y1, s * hl - 0.04, s * hl + 0.04);
  M.aoFn = null;
  // ossature : montants, diagonales, ceintures
  M.color([0.24, 0.17, 0.12]);
  for (const s of [-1, 1]) {
    const x = s * (hw + 0.02);
    // à 1 cm des plans du bas et du haut des parois (z-fighting sur toute la longueur du wagon)
    for (const z of [-hl + 0.05, -3.9, -1.35, 1.35, 3.9, hl - 0.05]) M.boxB('paint', x - 0.04, x + 0.04, y0 + 0.01, y1 - 0.01, z - 0.07, z + 0.07);
    M.boxB('paint', x - 0.045, x + 0.045, y0 + 0.01, y0 + 0.14, -hl, hl); M.boxB('paint', x - 0.045, x + 0.045, y1 - 0.12, y1 - 0.01, -hl, hl);
    for (const [za, zb] of [[-hl + 0.1, -3.95], [3.95, hl - 0.1]]) {
      const zc = (za + zb) / 2, len = hyp(zb - za, y1 - y0 - 0.3), a = Math.atan2(y1 - y0 - 0.3, zb - za);
      M.save().move(x, (y0 + y1) / 2, zc).rotX(za < 0 ? -a : a).move(0, -0.05, 0); M.box('paint', 0.06, 0.1, len); M.restore();
    }
  }
  // portes coulissantes : rail haut, vantail (fermé à +x, ouvert à -x)
  for (const s of [-1, 1]) {
    const x = s * (hw + 0.07), dz = s > 0 ? 0 : 2.45;
    M.color([0.2, 0.19, 0.18]); M.boxB('rust', x - 0.03, x + 0.03, y1 - 0.08, y1 + 0.02, -1.5, 3.9);
    M.color([1, 1, 1]); M.boxB('paintwood', x - 0.035, x + 0.035, y0 + 0.05, y1 - 0.1, -1.3 + dz, 1.3 + dz);
    M.color([0.24, 0.17, 0.12]);
    // tasseaux en retrait de 1 cm des bords du vantail (leurs faces tombaient dans celles du vantail)
    for (const z of [-1.2, 0, 1.2]) M.boxB('paint', x - 0.05, x + 0.05, y0 + 0.06, y1 - 0.11, z + dz - 0.05, z + dz + 0.05);
    M.boxB('paint', x - 0.05, x + 0.05, (y0 + y1) / 2 - 0.06, (y0 + y1) / 2 + 0.06, -1.29 + dz, 1.29 + dz);
  }
  // intérieur sombre derrière la porte ouverte, seuil de planches
  M.color([0.05, 0.05, 0.05]); M.boxB('dark', -hw + 0.06, hw - 0.06, y0 + 0.02, y1 - 0.02, -1.28, 1.28);
  M.color([0.4, 0.3, 0.22]); M.boxB('crate', -hw - 0.02, -hw + 0.3, y0 - 0.02, y0 + 0.02, -1.3, 1.3);
  // toit cintré (tôle), passerelle de toit
  const arc = []; for (let i = 0; i <= 10; i++) { const t = i / 10, x = lerp(-hw - 0.06, hw + 0.06, t); arc.push([x, y1 + Math.sin(t * Math.PI) * rise]); }
  arc.push([hw + 0.06, y1 - 0.05], [-hw - 0.06, y1 - 0.05]);
  M.color([0.5, 0.5, 0.5]); M.save().move(0, 0, -hl - 0.06); M.extrude('paint', arc, L + 0.12, { sharp: 0.6 }); M.restore();
  // échelle et volant de frein à une extrémité
  M.color([0.2, 0.19, 0.18]);
  for (const x of [-hw + 0.25, -hw + 0.6]) M.boxB('steel', x - 0.02, x + 0.02, y0 - 0.2, y1 + 0.1, hl + 0.06, hl + 0.1);
  for (let y = y0; y < y1; y += 0.35) M.boxB('steel', -hw + 0.25, -hw + 0.6, y, y + 0.03, hl + 0.07, hl + 0.09);
  M.save().move(hw - 0.5, y1 - 0.4, hl + 0.12).rotX(Math.PI / 2); M.lathe('steel', [[0.2, -0.02], [0.24, -0.02], [0.24, 0.02], [0.2, 0.02]], 14, { sharp: 0.3 }); M.cyl('steel', 0.025, 0.25, 6); M.restore();
  // inscriptions
  for (const s of [-1, 1]) {
    M.save().move(s * (hw + 0.012), 0, 0).rotY(s * Math.PI / 2);
    decal2Quad(M, DEC2.wagon, [s * 5.4, y0 + 0.4, 0], [s * 3.4, y0 + 0.4, 0], [s * 3.4, y0 + 2.4, 0], [s * 5.4, y0 + 2.4, 0], [0, 0, 1]);
    decal2Quad(M, DEC2.wagon2, [s * -3.3, y0 + 0.3, 0], [s * -5.1, y0 + 0.3, 0], [s * -5.1, y0 + 2.1, 0], [s * -3.3, y0 + 2.1, 0], [0, 0, 1]);
    M.restore();
  }
});
/* Wagon-citerne (10,2 m entre têtes) : citerne à fonds bombés sur berceaux, ceintures, dôme, passerelle et échelles,
   plaque orange de matière dangereuse ; teinte de la citerne */
PF.tankcar = () => prefab('tankcar', (M, P) => {
  P.tintable = ['paint'];
  const L = 10.2, W = 2.7, yc = 2.55, r = 1.32, hl = 4.65;
  M.local(1);
  railFrame(M, L, W, 0.95, 1.2);
  for (const z of [-3.6, 3.6]) railBogie(M, z);
  M.save().color([0.2, 0.19, 0.18]);
  for (const z of [-2.6, 2.6]) M.boxB('rust', -1.1, 1.1, 1.2, yc - r * 0.55, z - 0.25, z + 0.25, { bevel: 0.03 });
  M.restore();
  M.save().move(0, yc, 0).rotX(Math.PI / 2);
  M.lathe('paint', [[0, -hl - 0.42], [0.55, -hl - 0.36], [1.0, -hl - 0.2], [r, -hl], [r, hl], [1.0, hl + 0.2], [0.55, hl + 0.36], [0, hl + 0.42]], 22, { sharp: 0.9, uR: 0.8 });
  M.restore();
  M.save().color([0.16, 0.15, 0.14]);
  for (const z of [-2.6, 2.6]) { M.save().move(0, yc, z - 0.05).rotX(Math.PI / 2); M.cyl('rust', r + 0.025, 0.1, 22, { caps: '' }); M.restore(); }
  M.restore();
  M.save().move(0, yc + r - 0.05, 0); M.cyl('paint', 0.42, 0.42, 14); M.move(0, 0.42, 0); M.cyl('paint', 0.48, 0.06, 14); M.restore();
  // passerelle et garde-corps, échelles
  M.save().color([0.22, 0.21, 0.2]);
  for (const s of [-1, 1]) {
    M.boxB('steel', s * 0.9 - 0.25, s * 0.9 + 0.25, yc + r - 0.42, yc + r - 0.38, -1.4, 1.4);
    for (const z of [-1.3, 0, 1.3]) M.boxB('steel', s * 1.12 - 0.02, s * 1.12 + 0.02, yc + r - 0.4, yc + r + 0.55, z - 0.02, z + 0.02);
    M.boxB('steel', s * 1.12 - 0.025, s * 1.12 + 0.025, yc + r + 0.5, yc + r + 0.55, -1.4, 1.4);
    for (const x of [-0.25, 0.25]) M.boxB('steel', s * (W / 2 + 0.02) - 0.02, s * (W / 2 + 0.02) + 0.02, 0.9, yc + r - 0.4, x - 0.02, x + 0.02);
    for (let y = 1.0; y < yc + r - 0.4; y += 0.32) M.boxB('steel', s * (W / 2 + 0.02) - 0.02, s * (W / 2 + 0.02) + 0.02, y, y + 0.03, -0.25, 0.25);
  }
  M.restore();
  for (const s of [-1, 1]) {
    M.save().move(s * (r + 0.01), 0, 0).rotY(s * Math.PI / 2);
    decal2Quad(M, DEC2.hazard, [s * 1.6, yc - 0.55, 0], [s * 0.6, yc - 0.55, 0], [s * 0.6, yc + 0.45, 0], [s * 1.6, yc + 0.45, 0], [0, 0, 1]);
    decal2Quad(M, DEC2.wagon, [s * -0.6, yc - 0.85, 0], [s * -2.6, yc - 0.85, 0], [s * -2.6, yc + 0.75, 0], [s * -0.6, yc + 0.75, 0], [0, 0, 1]);
    M.restore();
  }
});
/* Wagon plat à ranchers chargé de grumes (12 m entre têtes) */
PF.flatcar = () => prefab('flatcar', (M) => {
  const L = 12, W = 2.7, hl = L / 2, y0 = 1.25, R = rngOf(77);
  M.local(1);
  railFrame(M, L, W, 0.95, 1.2);
  for (const z of [-4.3, 4.3]) railBogie(M, z);
  M.color([0.55, 0.42, 0.3]); M.boxB('crate', -W / 2, W / 2, 1.2, y0, -hl, hl);
  M.color([0.2, 0.19, 0.18]);
  for (const s of [-1, 1]) for (let z = -hl + 0.8; z < hl - 0.5; z += 2.1) M.boxB('rust', s * (W / 2 - 0.06) - 0.05, s * (W / 2 - 0.06) + 0.05, y0, y0 + 1.75, z - 0.05, z + 0.05);
  // grumes : trois rangs, écorce et bois de bout
  const rows = [[4, 0.32], [3, 0.3], [2, 0.28]];
  let y = y0;
  rows.forEach(([n, rr]) => {
    const yy = y + rr;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * rr * 2.05, r = rr * R.range(0.9, 1.06), len = L - 0.8 - R() * 0.6, dz = R.range(-0.2, 0.2);
      M.color([R.range(0.85, 1), R.range(0.85, 1), R.range(0.85, 1)]);
      M.save().move(x, yy, -len / 2 + dz).rotX(Math.PI / 2).rotY(R() * TAU); M.cyl('bark', r, len, 10, { caps: '' }); M.restore();
      for (const s of [-1, 1]) { M.save().move(x, yy, dz + s * len / 2).rotX(s * Math.PI / 2); M.cyl('logend', r, 0.0005, 10, { caps: 't', side: false }); M.restore(); }
    }
    y = yy + rr * 0.72;
  });
  // chaînes d'arrimage
  M.color([0.25, 0.24, 0.22]); M.cls = 2;
  for (const z of [-3, 0, 3]) M.tube('steel', 0.012, [[-W / 2 + 0.05, y0 + 0.1, z], [-0.9, y0 + 1.3, z], [0, y0 + 1.6, z], [0.9, y0 + 1.3, z], [W / 2 - 0.05, y0 + 0.1, z]], 4);
});
/* Chasse-neige rotatif (13 m) : caisse rouge à toit arrondi, cabines aux deux bouts, turbine frontale (tambour, pales,
   moyeu), goulotte d'éjection orientable, bandes jaunes et noires, neige tassée dans la turbine */
PF.snowplow = () => prefab('snowplow', (M) => {
  const red = [0.66, 0.13, 0.1], hl = 6.3;
  M.local(1);
  railFrame(M, 11.6, 2.8, 0.95, 1.25);
  for (const z of [-2.6, 3.8]) railBogie(M, z, 0.5);
  // caisse : sections lissées (superellipse), plus haute à l'arrière (cabine)
  M.color(red);
  M.aoFn = (x, y) => lerp(0.65, 1, smoothstep(1.2, 2.2, y));
  M.loft('paint', [
    { z: -3.7, w: 1.45, yb: 1.25, yt: 3.75, n: 7 }, { z: 3.4, w: 1.45, yb: 1.25, yt: 3.75, n: 7 }, { z: 3.45, w: 1.45, yb: 1.25, yt: 4.05, n: 7 },
    { z: 5.6, w: 1.45, yb: 1.25, yt: 4.05, n: 7 }, { z: 5.8, w: 1.38, yb: 1.25, yt: 3.95, n: 7 },
  ], 22, { uL: 9, vL: 9.5 });
  M.aoFn = null;
  // bandes de signalisation, persiennes, vitres de cabine
  M.color([0.9, 0.72, 0.1]); M.boxB('paint', -1.47, 1.47, 1.3, 1.5, -3.7, 5.8);
  M.color([0.05, 0.05, 0.05]);
  for (const s of [-1, 1]) {
    for (let z = -2.6; z < 2.4; z += 0.14) M.boxB('dark', s * 1.45 - 0.01, s * 1.45 + 0.012, 2.3, 3.1, z, z + 0.06);
    M.quad('glass', [s * 1.452, 2.55, 4.0], [s * 1.452, 2.55, 5.3], [s * 1.452, 3.55, 5.3], [s * 1.452, 3.55, 4.0], [s, 0, 0]);
  }
  M.quad('glass', [-1.2, 2.55, 5.81], [1.2, 2.55, 5.81], [1.2, 3.6, 5.81], [-1.2, 3.6, 5.81], [0, 0, 1]);
  // turbine : tambour, rebord, pales, moyeu, fond sombre
  const yc = 2.05, rd = 1.55;
  M.color(red);
  M.save().move(0, yc, -hl).rotX(Math.PI / 2); M.cyl('paint', rd, 2.7, 24, { caps: '' }); M.restore();
  M.save().move(0, yc, -hl - 0.1).rotX(Math.PI / 2); M.lathe('paint', [[rd - 0.02, 0], [rd + 0.12, 0], [rd + 0.12, 0.16], [rd - 0.02, 0.16]], 24, { sharp: 0.3 }); M.restore();
  M.color([0.04, 0.04, 0.04]); M.save().move(0, yc, -hl + 1.1).rotX(Math.PI / 2); M.cyl('dark', rd - 0.02, 0.02, 24); M.restore();
  M.color([0.62, 0.62, 0.6]);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    M.save().move(0, yc, -hl + 0.6).rotZ(a).rotY(0.45); M.boxB('steel', -0.03, 0.03, 0.18, rd - 0.08, -0.35, 0.35); M.restore();
  }
  M.color([0.3, 0.3, 0.3]); M.save().move(0, yc, -hl + 0.2).rotX(-Math.PI / 2); M.cyl('steel', 0.32, 0.5, 14, { r1: 0.05 }); M.restore();
  // capot et joues autour du tambour, soc au ras des rails
  M.color(red);
  for (const s of [-1, 1]) M.boxB('paint', s * (rd + 0.02) - 0.06, s * (rd + 0.02) + 0.06, 0.5, yc + 0.3, -hl, -hl + 2.6);
  M.color([0.18, 0.18, 0.18]); M.save().move(0, 0.42, -hl - 0.15).rotX(0.5); M.boxB('rust', -1.6, 1.6, 0, 0.08, 0, 0.9); M.restore();
  // goulotte d'éjection et cheminée d'échappement
  M.color(red); M.tube('paint', 0.4, [[0, yc + rd - 0.3, -hl + 1.2], [0, yc + rd + 0.6, -hl + 1.2], [0.25, yc + rd + 1.15, -hl + 1.05], [0.85, yc + rd + 1.45, -hl + 0.9]], 12);
  M.color([0.15, 0.15, 0.15]); M.save().move(0.5, 3.7, 1.4); M.cyl('rust', 0.12, 0.7, 8); M.restore();
  // bandes jaunes et noires sur le capot avant
  for (let i = 0; i < 7; i++) {
    M.color(i % 2 ? [0.06, 0.06, 0.06] : [0.92, 0.74, 0.1]);
    M.save().move(-1.6 + i * 0.47, 0.62, -hl - 0.02).rotZ(0.6); M.boxB('paint', -0.12, 0.12, -0.3, 0.3, -0.03, 0.0); M.restore();
  }
  // phares
  M.color([1, 1, 1]); M.cls = 1;
  for (const x of [-0.9, 0.9]) { M.save().move(x, 3.55, -3.72).rotX(Math.PI / 2); M.cyl('lampOff', 0.13, 0.05, 10); M.restore(); }
  M.cls = 0;
  // finitions de la face avant : anneaux et nervures dans la turbine, phares sur le rebord du tambour, main courante et marchepieds
  // sur les joues, plaque de numéro, flexibles de frein sous le tambour
  M.color([0.2, 0.2, 0.2]);
  for (const r of [0.55, 0.95, 1.3]) { M.save().move(0, yc, -hl + 1.06).rotX(Math.PI / 2); M.lathe('steel', [[r - 0.03, 0], [r + 0.03, 0], [r + 0.03, 0.05], [r - 0.03, 0.05]], 24, { sharp: 0.4 }); M.restore(); }
  for (let i = 0; i < 5; i++) { M.save().move(0, yc, -hl + 1.05).rotZ((i / 5) * Math.PI); M.boxB('steel', -rd + 0.06, rd - 0.06, -0.025, 0.025, -0.02, 0.03); M.restore(); }
  for (const s of [-1, 1]) {
    M.color([0.95, 0.9, 0.7]); M.cls = 1;
    M.save().move(s * 1.0, yc + 1.18, -hl - 0.14).rotX(Math.PI / 2); M.cyl('lamp', 0.15, 0.07, 12); M.restore();
    M.cls = 0; M.color([0.14, 0.14, 0.14]);
    M.save().move(s * 1.0, yc + 1.18, -hl - 0.1).rotX(Math.PI / 2); M.lathe('steel', [[0.15, 0], [0.19, 0], [0.19, 0.1], [0.15, 0.1]], 12, { sharp: 0.5 }); M.restore();
    M.color([0.9, 0.9, 0.88]); M.tube('steel', 0.022, [[s * (rd + 0.2), 0.75, -hl + 0.12], [s * (rd + 0.2), yc + 0.55, -hl + 0.12]], 5);
    M.tube('steel', 0.016, [[s * (rd + 0.1), 0.75, -hl + 0.12], [s * (rd + 0.2), 0.75, -hl + 0.12]], 4); M.tube('steel', 0.016, [[s * (rd + 0.1), yc + 0.55, -hl + 0.12], [s * (rd + 0.2), yc + 0.55, -hl + 0.12]], 4);
    M.color([0.25, 0.25, 0.24]);
    for (const y of [0.62, 1.05]) M.boxB('steel', s * (rd + 0.14) - 0.2, s * (rd + 0.14) + 0.2, y, y + 0.04, -hl - 0.12, -hl + 0.3);
  }
  M.color([0.92, 0.92, 0.9]); M.boxB('paint', -0.34, 0.34, yc - rd + 0.55, yc - rd + 0.8, -hl - 0.15, -hl - 0.12);
  M.color([0.1, 0.1, 0.1]); for (let i = 0; i < 4; i++) M.boxB('dark', -0.26 + i * 0.14, -0.26 + i * 0.14 + 0.08, yc - rd + 0.6, yc - rd + 0.75, -hl - 0.16, -hl - 0.15);
  M.color([0.12, 0.12, 0.12]); M.tube('rubber', 0.03, [[-0.5, 0.95, -hl + 0.1], [-0.55, 0.7, -hl - 0.2], [-0.4, 0.55, -hl - 0.45]], 5); M.tube('rubber', 0.03, [[0.5, 0.95, -hl + 0.1], [0.55, 0.7, -hl - 0.2], [0.4, 0.55, -hl - 0.45]], 5);
  // neige tassée dans la turbine et sur le soc
  M.save().move(0, 0.35, -hl - 0.3); M.put(PF.snowMound(3.4, 1.6, 0.85, 4), { cls: 1 }); M.restore();
  M.save().move(0.4, yc - 1.25, -hl + 0.3); M.put(PF.snowMound(2.0, 1.0, 0.5, 5), { cls: 1 }); M.restore();
});

/* ---------- Équipements de gare ---------- */
/* Banc de quai : pieds en fonte, lattes de bois, dossier */
PF.platformBench = () => prefab('platformBench', (M) => {
  M.local(1);
  M.color([0.12, 0.16, 0.13]);
  const leg = [[-0.22, 0], [-0.16, 0], [-0.1, 0.42], [0.2, 0.42], [0.2, 0.46], [-0.12, 0.47], [-0.2, 0.92], [-0.25, 0.9], [-0.17, 0.45]];
  for (const x of [-0.8, 0.8]) { M.save().move(x - 0.03, 0, 0).mul(basis([0, 0, 1], [0, 1, 0], [1, 0, 0]).clone()); M.extrude('steel', leg, 0.06, { sharp: 0.3 }); M.restore(); }
  M.color([0.62, 0.45, 0.3]);
  for (let i = 0; i < 4; i++) M.boxB('wood', -1.0, 1.0, 0.44, 0.48, -0.15 + i * 0.1 - 0.04, -0.15 + i * 0.1 + 0.04, { bevel: 0.008 });
  for (let i = 0; i < 3; i++) { M.save().move(0, 0.58 + i * 0.12, -0.18 - i * 0.025).rotX(0.2); M.boxB('wood', -1.0, 1.0, 0, 0.08, -0.02, 0.02, { bevel: 0.008 }); M.restore(); }
});
/* Horloge de quai à deux cadrans, sur potence (accrochée à un mur ou une colonne, repère de façade : mur en z = 0) */
PF.stationClock = () => prefab('stationClock', (M) => {
  M.local(1); M.color([0.12, 0.16, 0.13]);
  M.boxB('steel', -0.05, 0.05, -0.05, 0.05, 0, 0.7);
  M.tube('steel', 0.02, [[0, -0.35, 0], [0, -0.1, 0.35], [0, 0, 0.65]], 5);
  M.save().move(0.08, -0.45, 0.85).rotZ(Math.PI / 2); M.cyl('paint', 0.42, 0.16, 24); M.restore();
  M.save().move(0.09, -0.45, 0.85).rotZ(Math.PI / 2); M.lathe('steel', [[0.42, 0], [0.45, 0], [0.45, 0.18], [0.42, 0.18]], 24, { sharp: 0.3 }); M.restore();
  M.save().move(0, -0.45, 0.85);
  for (const s of [-1, 1]) decal2Quad(M, DEC2.clock, [s * 0.085, -0.38, s * 0.38], [s * 0.085, -0.38, -s * 0.38], [s * 0.085, 0.38, -s * 0.38], [s * 0.085, 0.38, s * 0.38], [s, 0, 0]);
  M.restore();
});
/* Chariot à bagages : plateau sur quatre roues, timon, malles, valises et sacs postaux */
PF.luggageCart = () => prefab('luggageCart', (M) => {
  const R = rngOf(31);
  M.local(1); M.color([0.5, 0.36, 0.24]);
  M.boxB('crate', -0.55, 0.55, 0.42, 0.5, -1.1, 1.1, { bevel: 0.01 });
  M.color([0.2, 0.2, 0.2]);
  for (const s of [-1, 1]) M.boxB('steel', -0.6, 0.6, 0.38, 0.42, s * 1.05 - 0.03, s * 1.05 + 0.03);
  for (const [x, z] of [[-0.48, -0.75], [0.48, -0.75], [-0.48, 0.75], [0.48, 0.75]]) { M.save().move(x, 0.2, z).rotZ(Math.PI / 2).move(0, -0.04, 0); M.cyl('rubber', 0.2, 0.08, 12); M.restore(); }
  M.tube('steel', 0.02, [[0, 0.45, -1.1], [0, 0.6, -1.55], [-0.25, 0.62, -1.6], [0.25, 0.62, -1.6]], 4);
  // malles et valises
  const L = [[-0.25, -0.6, 0.5, 0.45, 0.8], [0.27, -0.55, 0.45, 0.35, 0.65], [-0.2, 0.25, 0.55, 0.32, 0.6], [0.25, 0.4, 0.45, 0.28, 0.5], [0, -0.55, 0.42, 0.25, 0.55]];
  L.forEach(([x, z, w, h, d], i) => {
    const y = i === 4 ? 0.96 : 0.505; // 5 mm au-dessus du plateau (la toile, vue des deux faces, scintillait au ras du bois), le sac du dessus sur la malle
    M.color(R.pick([[0.42, 0.24, 0.14], [0.2, 0.3, 0.42], [0.55, 0.45, 0.3], [0.3, 0.3, 0.28]]));
    M.save().move(x, y, z).rotY(R.range(-0.15, 0.15)); M.boxB(i < 2 ? 'paintwood' : 'canvas', -w / 2, w / 2, 0, h, -d / 2, d / 2, { bevel: 0.025 }); M.restore();
  });
  M.pcol(-0.55, 0.55, 0.42, 0.5, -1.1, 1.1); // le plateau du chariot porte les sacs, qui sont des corps physiques
  for (const [x, z] of [[0.1, 0.9], [-0.25, 0.85]]) { M.save().move(x, 0.5, z).rotY(R() * 2); M.dyn('sandbagLow', 0, 0, 0, 0, { tint: [0.75, 0.72, 0.62] }); M.restore(); }
});
/* Signal ferroviaire : mât, cible ronde, feux (le rouge allumé), échelle */
PF.railSignal = () => prefab('railSignal', (M) => {
  M.local(1); M.color([0.75, 0.76, 0.74]);
  M.boxB('concrete', -0.35, 0.35, 0, 0.3, -0.35, 0.35, { bevel: 0.02 });
  M.color([0.82, 0.82, 0.8]); M.cyl('steel', 0.08, 4.6, 10);
  M.color([0.1, 0.1, 0.1]); M.boxB('paint', -0.32, 0.32, 3.6, 4.7, 0.05, 0.25, { bevel: 0.04 });
  M.color([0.9, 0.9, 0.88]); M.save().move(0, 4.15, 0.26).rotX(Math.PI / 2); M.cyl('paint', 0.5, 0.03, 20); M.restore();
  M.save().color([0.06, 0.06, 0.06]); M.save().move(0, 4.15, 0.29).rotX(Math.PI / 2); M.cyl('dark', 0.36, 0.01, 18); M.restore(); M.restore();
  M.cls = 1;
  M.color([2.2, 0.2, 0.1]); M.save().move(0, 4.35, 0.3).rotX(Math.PI / 2); M.cyl('bulb', 0.1, 0.02, 12); M.restore();
  M.color([0.05, 0.25, 0.08]); M.save().move(0, 3.95, 0.3).rotX(Math.PI / 2); M.cyl('paint', 0.1, 0.02, 12); M.restore();
  M.color([0.2, 0.2, 0.2]);
  for (const x of [-0.18, 0.18]) M.boxB('steel', x - 0.015, x + 0.015, 0.3, 3.6, -0.15, -0.12);
  for (let y = 0.5; y < 3.6; y += 0.3) M.boxB('steel', -0.18, 0.18, y, y + 0.02, -0.15, -0.12);
  M.cls = 0;
  M.col(-0.35, 0.35, 0, 0.3, -0.35, 0.35, 'concrete'); M.col(-0.09, 0.09, 0, 4.6, -0.09, 0.09, 'metal');
});
/* Armoire de signalisation (relais) sur pieds, avec petit toit */
PF.relayCabinet = () => prefab('relayCabinet', (M) => {
  M.local(1); M.color([0.62, 0.65, 0.62]);
  M.boxB('paint', -0.6, 0.6, 0.15, 1.75, -0.32, 0.32, { bevel: 0.015 });
  M.boxB('paint', -0.68, 0.68, 1.75, 1.82, -0.4, 0.4, { bevel: 0.01 });
  M.color([0.25, 0.25, 0.25]);
  for (const x of [-0.5, 0.5]) M.boxB('steel', x - 0.04, x + 0.04, 0, 0.15, -0.25, 0.25);
  M.boxB('dark', -0.005, 0.005, 0.25, 1.65, 0.32, 0.325); M.boxB('steel', 0.08, 0.12, 0.85, 1.05, 0.32, 0.345);
  M.col(-0.6, 0.6, 0, 1.82, -0.32, 0.32, 'metal');
});
/* Pile de traverses neuves : nw traverses par lit, nh lits, cales entre les lits */
PF.sleeperStack = (nw = 6, nh = 10) => prefab(`sleepers${nw}_${nh}`, (M) => {
  const R = rngOf(nw * 17 + nh);
  M.local(1);
  for (let j = 0; j < nh; j++) for (let i = 0; i < nw; i++) {
    const x = (i - (nw - 1) / 2) * 0.27;
    M.color([R.range(0.26, 0.34), R.range(0.21, 0.26), R.range(0.17, 0.2)]);
    M.save().move(x + R.range(-0.02, 0.02), j * 0.165, R.range(-0.05, 0.05)); M.box('wood', 0.25, 0.15, 2.6, { bevel: 0.01 }); M.restore();
  }
  M.col(-nw * 0.135, nw * 0.135, 0, nh * 0.165, -1.3, 1.3, 'wood');
});
/* Colonne de marquise en fonte : base, fût cannelé, chapiteau, consoles ajourées vers +z et -z */
PF.castColumn = (h = 3.6) => prefab('castColumn' + h, (M) => {
  M.local(1); M.color([0.14, 0.2, 0.17]);
  M.lathe('steel', [[0, 0], [0.18, 0], [0.18, 0.08], [0.13, 0.14], [0.1, 0.3], [0.075, 0.36], [0.075, h - 0.4], [0.1, h - 0.3], [0.16, h - 0.2], [0.16, h - 0.12], [0.2, h - 0.08], [0.2, h], [0, h]], 12, { sharp: 0.6 });
  for (const s of [-1, 1]) M.tube('steel', 0.025, [[0, h - 0.9, 0], [0, h - 0.5, s * 0.35], [0, h - 0.12, s * 0.9]], 6);
  for (const s of [-1, 1]) { M.save().move(0, h - 0.45, s * 0.42).rotX(Math.PI / 2); M.lathe('steel', [[0.1, -0.012], [0.13, -0.012], [0.13, 0.012], [0.1, 0.012]], 10, { sharp: 0.3 }); M.restore(); }
  M.col(-0.1, 0.1, 0, h, -0.1, 0.1, 'metal');
});

}catch(e){HOOKS.missing['02j-rail.js']=String(e&&e.message||e)}
/* ===== 02l-port.js ===== */
try{
/* ==========================================================================
   KIT PORTUAIRE : tout ce qu'il faut pour un port de pêche, réutilisable d'une carte à l'autre (Kervénec).
   - Surfaces procédurales : coque peinte (traînées de rouille, ligne de flottaison, salissures), filet de pêche
     (mailles découpées), glace pilée, caillebotis d'acier ; reprises du kit d'hiver : roche, bardage, rouille, ardoise.
   - Atlas dessinés : enseignes peintes et émaillées (Criée, Café de la Marine, Fabrique de glace...), décalques
     (noms et immatriculations des bateaux, cadran des ventes, ardoises de prix, affiches, flaques, taches).
   - Prefabs : chalutiers et caseyeur, canots, voiliers au mouillage, bittes d'amarrage, défenses, bouées, filets,
     casiers, bacs à poisson, étals de criée, palettes de glace, grue de quai, portique, camion frigorifique, phare...
   Tout se construit au chargement de la carte et se libère avec elle.
   ========================================================================== */
Object.assign(TEXLAB, {
  /* coque d'acier peinte (teintée par les sommets) : tôles soudées, traînées de rouille sous les dalots, rayures des
     défenses, crasse vers la flottaison ; alpha = masque de métal (peinture écaillée) */
  hull: [512, 85, 1.4, `
    float big = gfbm(uv, vec2(3.0), 5, 1.0), mid = gfbm(uv, vec2(12.0), 4, 2.0), fine = vn(uv * 256.0, vec2(256.0), 3.0);
    float plate = 1.0 - smoothstep(0.0, 0.004, min(abs(fract(uv.x * 3.0) - 0.5) - 0.496, 1.0)) ;
    float seam = max(1.0 - smoothstep(0.0, 0.006, abs(fract(uv.x * 3.0)) ), 1.0 - smoothstep(0.0, 0.006, abs(fract(uv.y * 2.0))));
    float st = gfbm(vec2(uv.x, uv.y * 0.15), vec2(28.0, 1.0), 4, 9.0);
    float rust = smoothstep(0.66, 0.82, st + uv.y * 0.12 + (big - 0.5) * 0.2) * 0.8 + smoothstep(0.8, 0.92, gfbm(uv, vec2(9.0), 5, 4.0)) * 0.6;
    float scuff = smoothstep(0.93, 0.99, ridge(vec2(uv.x * 0.3, uv.y), vec2(2.0, 18.0), 3, 7.0)) * step(0.5, big);
    float chip = smoothstep(0.78, 0.8, gfbm(uv, vec2(22.0), 4, 3.0) + (big - 0.5) * 0.1);
    h = mid * 0.05 - chip * 0.25 - seam * 0.2 + rust * 0.08;
    a = vec3(0.86) * (0.92 + big * 0.1 + fine * 0.04);
    a = mix(a, srgb(vec3(0.5, 0.26, 0.12)), clamp(rust, 0.0, 1.0) * 0.75);
    a = mix(a, srgb(vec3(0.42, 0.38, 0.34)), chip * 0.7); a = mix(a, vec3(0.55), scuff * 0.5);
    r = mix(0.45 + big * 0.1, 0.85, max(chip, rust)); x = (1.0 - chip) * 0.3;`],
  /* filet de pêche : mailles en losange (alpha = opacité), fil de nylon vert ou bleu teinté par les sommets */
  net: [256, 87, 1.2, `
    vec2 q = vec2(uv.x + uv.y, uv.x - uv.y) * 12.0; vec2 f = abs(fract(q) - 0.5);
    float th = 0.43 + gfbm(uv, vec2(8.0), 3, 2.0) * 0.04, knot = 1.0 - smoothstep(0.08, 0.14, length(fract(q) - 0.5) - 0.32);
    float m = max(smoothstep(th, th + 0.03, max(f.x, f.y)), knot * 0.0);
    h = m; a = vec3(0.9) * (0.85 + gfbm(uv, vec2(16.0), 3, 3.0) * 0.25); r = 0.7; x = m;`],
  /* glace pilée des étals : éclats translucides, brillances */
  crushedice: [512, 89, 2.2, `
    vec4 v = vor(uv, vec2(48.0), 4.0, 1.0), v2 = vor(uv + 0.3, vec2(96.0), 5.0, 1.0);
    float big = gfbm(uv, vec2(4.0), 4, 1.0);
    h = (1.0 - v.x) * 0.6 + (1.0 - v2.x) * 0.3 + big * 0.1;
    a = srgb(vec3(0.82, 0.88, 0.92)) * (0.8 + v.z * 0.2 + (1.0 - smoothstep(0.0, 0.06, v.w)) * 0.15);
    r = 0.12 + v2.z * 0.15; x = h;`],
  /* caillebotis d'acier (passerelles) : grille de plats soudés, alpha = opacité */
  grating: [256, 91, 1.4, `
    vec2 f = fract(uv * vec2(16.0, 5.0)); float bar = max(1.0 - smoothstep(0.08, 0.16, min(f.x, 1.0 - f.x)), 1.0 - smoothstep(0.04, 0.09, min(f.y, 1.0 - f.y)));
    h = bar; a = srgb(vec3(0.45, 0.46, 0.46)) * (0.8 + gfbm(uv, vec2(8.0), 3, 2.0) * 0.3); r = 0.55; x = bar;`],
});
Object.assign(TEXSCALE, { hull: 4.0, net: 1.2, crushedice: 0.9, grating: 1.0 });
for (const k of ['hull', 'net', 'crushedice', 'grating']) OPT_TEX.add(k);
/* Surfaces procédurales qu'une carte portuaire demande (à mettre dans surfaces de sa définition) */
var PORT_SURFACES = ['hull', 'net', 'crushedice', 'grating', 'ripple', 'rock', 'boards', 'rust', 'slate'];

/* ---------- Matières ---------- */
function makePortMaterials(M) {
  M('rock', { tex: 'rock', grime: 0.4, macro: 0.5, dust: 0.1, pom: 0.03 });
  M('boards', { tex: 'boards', grime: 0.9, streak: 0.5, macro: 0.25 });
  M('rust', { tex: 'rust', metal: 0.75, ma: true, env: 0.55, macro: 0.25, grime: 0.6, streak: 0.4 });
  M('slate', { tex: 'slate', env: 0.7, macro: 0.3, grime: 0.3 });
  M('hull', { tex: 'hull', metal: 0.25, ma: true, env: 0.8, macro: 0.2, grime: 0.6, streak: 0.5 });
  M('net', { tex: 'net', cut: 0.5, rough: 0.8, env: 0.3, macro: 0.2 });
  M('crushedice', { tex: 'crushedice', env: 1.4, macro: 0.05 });
  M('grating', { tex: 'grating', cut: 0.5, metal: 0.7, env: 0.8, macro: 0.15 });
  // pierre mouillée et algues au pied des quais : sombre, presque lisse
  M('wetstone', { tex: 'ashlar', rough: 0.45, env: 0.9, macro: 0.4, grime: 0, dust: 0 });
  // écailles et chair des poissons (teintées par les sommets), brillantes
  M('fish', { tex: 'plastic', rough: 0.3, metal: 0.35, env: 1.3, macro: 0.05 });
  // sol de la criée : résine lavée à grande eau, encore humide
  M('resin', { tex: 'concrete', rough: 0.32, env: 1.0, macro: 0.45, grime: 0, dust: 0 });
  M('glassLit', { tex: 'glass', metal: 0.4, ma: true, env: 0.9, macro: 0.1, emissive: [0.95, 0.58, 0.28], polyOff: -2 });
  MAT.bulb = new THREE.MeshBasicMaterial({ vertexColors: true }); MAT.bulb.userData.noShadow = true;
  M('signs3', { tex: 'signs3', rough: 0.45, env: 0.6, macro: 0.05, scale: 1, noNormal: true });
  M('decals3', { tex: 'decals3', rough: 0.75, env: 0.35, macro: 0.15, scale: 1, noNormal: true, polyOff: -4 });
  Object.assign(MAT.decals3, { transparent: true, depthWrite: false }); MAT.decals3.defines.WM_CUT = ''; MAT.decals3.side = THREE.FrontSide;
  MAT.decals3.userData.noShadow = true;
  // écran à diodes du cadran des ventes : lumineux, sans éclairage
  MAT.screen = new THREE.MeshBasicMaterial({ map: TEX.decals3.map, color: new THREE.Color(1.8, 1.8, 1.8) }); MAT.screen.userData.noShadow = true;
}

/* ---------- Atlas dessinés ---------- */
/* Enseignes du port (1024², 8 panneaux de 512 x 256) */
var SIGNS3 = { criee: 0, marine: 1, glace: 2, mareyage: 3, coop: 4, capitainerie: 5, poissonnerie: 6, ventes: 7 };
function portSignAtlas() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), R = rngOf(97);
  const P = [
    ['#f2efe6', '#1d3a63', 'CRIÉE\nDE KERVÉNEC', 'Arial, sans-serif', 78, '#1d3a63'],
    ['#1d3a63', '#f3e9d2', 'CAFÉ DE LA MARINE', 'Georgia, serif', 56, '#e9c46a'],
    ['#2e6f8e', '#f4f4ee', 'FABRIQUE\nDE GLACE', 'Arial, sans-serif', 76, '#f4f4ee'],
    ['#efe9da', '#8c2f22', 'MAREYAGE\nEXPÉDITIONS', 'Arial, sans-serif', 62, '#8c2f22'],
    ['#2f5b3f', '#f1ead6', 'COOPÉRATIVE\nMARITIME', 'Georgia, serif', 64, '#f1ead6'],
    ['#f4f2ec', '#1d3a63', 'CAPITAINERIE', 'Arial, sans-serif', 74, '#b3261e'],
    ['#9a2b20', '#f6efdf', 'POISSONNERIE', 'Georgia, serif', 70, '#f6efdf'],
    ['#f6d64a', '#1a1a1a', 'SALLE DES VENTES\nACHETEURS AGRÉÉS', 'Arial, sans-serif', 46, '#1a1a1a'],
  ];
  P.forEach(([bg, fg, txt, font, size, border], i) => {
    const x = (i % 2) * 512, y = Math.floor(i / 2) * 256;
    g.fillStyle = bg; g.fillRect(x, y, 512, 256);
    g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(x + 14, y + 14, 484, 228);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    // corps réduit si la police de la machine est plus large : le texte tient toujours dans le cadre
    const lines = txt.split('\n'); g.font = `bold ${size}px ${font}`;
    const fs = Math.min(size, (size * 440) / Math.max(...lines.map((l) => g.measureText(l).width)));
    g.font = `bold ${fs}px ${font}`;
    lines.forEach((l, k) => g.fillText(l, x + 256, y + 132 + (k - (lines.length - 1) / 2) * fs * 1.12));
    // embruns : rouille aux fixations, sel et salissures
    for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(${R() < 0.6 ? '110,58,30' : '40,30,22'},${0.25 + R() * 0.5})`; const ex = x + (R() < 0.5 ? 8 + R() * 28 : 476 + R() * 28), ey = y + (R() < 0.5 ? 8 + R() * 28 : 220 + R() * 28); g.beginPath(); g.arc(ex, ey, 2 + R() * 6, 0, TAU); g.fill(); }
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(${R() < 0.6 ? '255,255,250' : '40,35,30'},${R() * 0.08})`; g.fillRect(x + R() * 512, y + R() * 256, 1 + R() * 4, 1 + R() * 3); }
    const gr = g.createLinearGradient(0, y, 0, y + 256); gr.addColorStop(0, 'rgba(255,255,255,0.06)'); gr.addColorStop(1, 'rgba(40,45,50,0.22)'); g.fillStyle = gr; g.fillRect(x, y, 512, 256);
  });
  const t = canvasOnce(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
function sign3UV(i) { return [(i % 2) * 0.5, Math.floor(i / 2) * 0.25, 0.5, 0.25]; }
/* Enseigne du port posée à plat (repère de façade), avec son cadre */
function sign3Board(M, xc, y, w, h, idx, frame = [0.3, 0.3, 0.3]) {
  const [u0, v0, du, dv] = sign3UV(idx), B = M.buf('signs3', xc, y, 0.05), z = 0.06;
  M.save().color([1, 1, 1]);
  const a = M.v(B, xc - w / 2, y, z, 0, 0, 1, u0, v0 + dv), b = M.v(B, xc + w / 2, y, z, 0, 0, 1, u0 + du, v0 + dv);
  const c = M.v(B, xc + w / 2, y + h, z, 0, 0, 1, u0 + du, v0), d = M.v(B, xc - w / 2, y + h, z, 0, 0, 1, u0, v0);
  M.quadI(B, a, b, c, d);
  if (frame) { M.color(frame).local(1); lbox(M, 'paint', xc - w / 2 - 0.03, xc + w / 2 + 0.03, y - 0.03, y + h + 0.03, 0, z - 0.002); }
  M.restore();
}
/* Décalques du port (1024², grille 4 x 4, alpha) : 0 à 3 noms et immatriculations des bateaux, 4 cadran des ventes,
   5 ardoise des prix, 6 et 7 affiches, 8 coulure de rouille, 9 flaque, 10 tache d'huile, 11 écailles et sang de poisson,
   12 « accès interdit », 13 numéros de lots, 14 horaires des marées, 15 graffiti */
var DEC3 = { boat0: 0, boat1: 1, boat2: 2, boat3: 3, cadran: 4, prix: 5, poster: 6, poster2: 7, rust: 8, puddle: 9, oil: 10, scales: 11, interdit: 12, lots: 13, marees: 14, tag: 15 };
var BOATS = [['AR MOR', 'GV 913425'], ['STEREDENN', 'CC 832107'], ['BUGALE MOR', 'GV 905118'], ['GWENOLA', 'AD 771304']];
function portDecalAtlas() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = rngOf(7531), T = S / 4;
  const cell = (i, fn) => { g.save(); g.translate((i % 4) * T, Math.floor(i / 4) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); fn(); g.restore(); };
  const wear = (n, a) => { g.globalCompositeOperation = 'destination-out'; for (let j = 0; j < n; j++) { g.fillStyle = `rgba(0,0,0,${R() * a})`; g.fillRect(R() * T, R() * T, 2 + R() * 4, 1 + R() * 3); } g.globalCompositeOperation = 'source-over'; };
  BOATS.forEach(([name, reg], k) => cell(k, () => {
    // nom en capitales sur la moitié haute, immatriculation dessous (proportions d'un panneau 4 x 1)
    g.fillStyle = 'rgba(246,244,236,0.95)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `bold ${name.length > 8 ? 30 : 38}px Arial, sans-serif`; g.fillText(name, T / 2, 30, T - 16);
    g.font = 'bold 26px Arial, sans-serif'; g.fillText(reg, T / 2, 62, T - 16);
    wear(140, 0.6);
  }));
  cell(4, () => {
    g.fillStyle = '#0c0d10'; g.fillRect(8, 8, T - 16, T - 16); g.strokeStyle = '#555'; g.lineWidth = 4; g.strokeRect(10, 10, T - 20, T - 20);
    g.fillStyle = '#ff3a22'; g.font = 'bold 58px "Courier New", monospace'; g.textAlign = 'center'; g.fillText('12,40', T / 2, 92);
    g.fillStyle = '#ffb21e'; g.font = 'bold 22px "Courier New", monospace'; g.fillText('LOT 0347  BAR', T / 2, 140); g.fillText('48 KG  EXTRA', T / 2, 170);
    g.fillStyle = '#4ad14a'; g.fillText('ACHETEUR 112', T / 2, 210);
    for (let j = 0; j < 40; j++) { const a = (j / 40) * TAU; g.fillStyle = j < 26 ? '#ff3a22' : '#3a1410'; g.fillRect(T / 2 + Math.cos(a) * 110 - 2, 128 + Math.sin(a) * 110 - 2, 4, 4); }
  });
  cell(5, () => {
    g.fillStyle = '#1b1d1c'; g.fillRect(20, 14, T - 40, T - 28); g.strokeStyle = '#6b4a2c'; g.lineWidth = 10; g.strokeRect(20, 14, T - 40, T - 28);
    g.fillStyle = 'rgba(240,240,232,0.9)'; g.font = 'italic bold 24px Georgia, serif'; g.textAlign = 'left';
    [['Bar de ligne', '24,50'], ['Lieu jaune', '9,80'], ['Sole', '19,00'], ['Langoustines', '22,00'], ['Maquereau', '4,20'], ['Saint-Pierre', '16,90']].forEach(([n, p], j) => { g.fillText(n, 36, 52 + j * 32); g.textAlign = 'right'; g.fillText(p, T - 36, 52 + j * 32); g.textAlign = 'left'; });
    wear(200, 0.4);
  });
  [['#1d4e89', '#f6f1e3', 'FÊTE\nDE LA MER', 'Kervénec · 14 août'], ['#c0392b', '#f7ecd0', 'PARDON\nDES MARINS', 'Bénédiction des bateaux']].forEach(([bg, fg, title, sub], k) => cell(6 + k, () => {
    const x = 40 + R() * 8, y = 18, w = T - 80, h = T - 36;
    g.fillStyle = bg; g.fillRect(x, y, w, h);
    g.fillStyle = fg; g.font = 'bold 30px Georgia, serif'; g.textAlign = 'center';
    title.split('\n').forEach((l, j) => g.fillText(l, x + w / 2, y + 52 + j * 34));
    g.font = 'italic 16px Georgia, serif'; g.fillText(sub, x + w / 2, y + h - 22);
    // voilier stylisé
    g.fillStyle = 'rgba(255,255,255,0.88)'; g.beginPath(); g.moveTo(x + w / 2, y + 112); g.lineTo(x + w / 2, y + h - 62); g.lineTo(x + w / 2 + 50, y + h - 62); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + w / 2 - 4, y + 124); g.lineTo(x + w / 2 - 4, y + h - 62); g.lineTo(x + w / 2 - 40, y + h - 62); g.closePath(); g.fill();
    g.fillRect(x + w / 2 - 55, y + h - 56, 110, 10);
    wear(120, 0.7);
  }));
  cell(8, () => { const gr = g.createLinearGradient(0, 0, 0, T); gr.addColorStop(0, 'rgba(112,50,20,0.65)'); gr.addColorStop(1, 'rgba(112,50,20,0)'); g.fillStyle = gr; for (let j = 0; j < 14; j++) { const x = T * 0.15 + R() * T * 0.7, w = 3 + R() * 12; g.fillRect(x, 0, w, T * (0.25 + R() * 0.75)); } });
  cell(9, () => { for (let j = 0; j < 16; j++) { const x = T / 2 + (R() - 0.5) * 100, y = T / 2 + (R() - 0.5) * 80, rr = 30 + R() * 60, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(28,30,32,0.5)'); gr.addColorStop(0.75, 'rgba(28,30,32,0.3)'); gr.addColorStop(1, 'rgba(28,30,32,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); } });
  cell(10, () => { for (let j = 0; j < 30; j++) { const x = T / 2 + (R() - 0.5) * 120, y = T / 2 + (R() - 0.5) * 90, rr = 20 + R() * 50, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(12,10,9,0.32)'); gr.addColorStop(1, 'rgba(12,10,9,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); } });
  cell(11, () => {
    for (let j = 0; j < 18; j++) { const x = T / 2 + (R() - 0.5) * 140, y = T / 2 + (R() - 0.5) * 120, rr = 12 + R() * 34, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(120,30,28,0.35)'); gr.addColorStop(1, 'rgba(120,30,28,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); }
    for (let j = 0; j < 160; j++) { g.fillStyle = `rgba(${200 + R() * 55},${200 + R() * 55},${210 + R() * 45},${0.5 + R() * 0.4})`; g.beginPath(); g.ellipse(30 + R() * (T - 60), 30 + R() * (T - 60), 2 + R() * 2, 1.5 + R(), R() * 3, 0, TAU); g.fill(); }
  });
  cell(12, () => {
    g.fillStyle = '#f4f2ec'; g.fillRect(18, 50, T - 36, T - 100); g.strokeStyle = '#b3261e'; g.lineWidth = 8; g.strokeRect(22, 54, T - 44, T - 108);
    g.fillStyle = '#b3261e'; g.font = 'bold 30px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('ACCÈS', T / 2, 110); g.fillText('INTERDIT', T / 2, 146);
    g.fillStyle = '#1a1a1a'; g.font = 'bold 16px Arial, sans-serif'; g.fillText('AU PUBLIC', T / 2, 178); g.fillText('ZONE PORTUAIRE', T / 2, 198);
  });
  cell(13, () => { g.fillStyle = 'rgba(245,245,240,0.92)'; g.font = 'bold 54px Arial, sans-serif'; g.textAlign = 'center'; for (let j = 0; j < 4; j++) g.fillText(String(11 + j * 7), (j % 2) * T / 2 + T / 4, Math.floor(j / 2) * T / 2 + T / 4 + 20); wear(120, 0.6); });
  cell(14, () => {
    g.fillStyle = '#f2efe6'; g.fillRect(16, 16, T - 32, T - 32); g.strokeStyle = '#1d3a63'; g.lineWidth = 5; g.strokeRect(18, 18, T - 36, T - 36);
    g.fillStyle = '#1d3a63'; g.font = 'bold 20px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('HORAIRES DES MARÉES', T / 2, 46);
    g.font = '16px Arial, sans-serif'; g.textAlign = 'left';
    [['PM', '06 h 42', '5,80 m'], ['BM', '12 h 58', '0,95 m'], ['PM', '19 h 07', '5,95 m'], ['BM', '01 h 20', '1,10 m']].forEach(([k, h, m], j) => { g.fillText(k, 34, 86 + j * 36); g.fillText(h, 84, 86 + j * 36); g.fillText(m, 170, 86 + j * 36); });
    g.fillStyle = '#b3261e'; g.font = 'bold 15px Arial, sans-serif'; g.fillText('COEF. 98 · GRANDE MARÉE', 34, 232);
  });
  cell(15, () => { g.lineCap = 'round'; g.strokeStyle = '#13233d'; g.lineWidth = 9; g.font = 'bold 66px Arial, sans-serif'; g.fillStyle = '#f2c230'; g.save(); g.translate(T / 2, T / 2 + 12); g.rotate(-0.1); g.textAlign = 'center'; g.strokeText('BZH', 0, 0); g.fillText('BZH', 0, 0); g.restore(); });
  const t = canvasOnce(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Décalque du port i (quart de case : u0, v0, du, dv dans la case) sur un quadrilatère du repère courant */
function decal3Quad(M, i, p0, p1, p2, p3, n, sub = [0, 0, 1, 1], mat = 'decals3') {
  const u0 = (i % 4) * 0.25 + sub[0] * 0.25, v0 = Math.floor(i / 4) * 0.25 + sub[1] * 0.25, du = sub[2] * 0.25, dv = sub[3] * 0.25;
  const B = M.buf(mat, (p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2, (p0[2] + p2[2]) / 2);
  M.save(); M.cls = 1;
  const ids = [[p0, u0, v0 + dv], [p1, u0 + du, v0 + dv], [p2, u0 + du, v0], [p3, u0, v0]].map(([p, u, v]) => M.v(B, p[0], p[1], p[2], n[0], n[1], n[2], u, v));
  M.quadI(B, ids[0], ids[1], ids[2], ids[3]);
  M.restore();
}
function wallDecal3(M, i, xc, y, w, h, z = 0.008, sub) { decal3Quad(M, i, [xc - w / 2, y, z], [xc + w / 2, y, z], [xc + w / 2, y + h, z], [xc - w / 2, y + h, z], [0, 0, 1], sub); }
function groundDecal3(i, x, z, w, d, rot = 0, y = 0.014) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, b) => [x + a * c - b * s, y, z + a * s + b * c];
  decal3Quad(DECOR, i, P(-w / 2, d / 2), P(w / 2, d / 2), P(w / 2, -d / 2), P(-w / 2, -d / 2), [0, 1, 0]);
}
/* Flaque : nappe d'eau mince au sol, bord fondu, avec le rendu de l'eau de la mer (pondAdd, 02m-water.js) ; l'ancienne flaque dessinée
   (DEC3.puddle) n'est plus posée */
function puddleAdd(x, z, w, d, rot = 0, seed = 1, y = 0.022) {
  return pondAdd({ shape: 'blob', x, y, z, w, d, rot, seed, seg: 20, rings: 4, alpha: 0.88, depth: 0.3, foam: 0, deep: [0.016, 0.026, 0.03], shallow: [0.03, 0.05, 0.055], scatter: [0.01, 0.03, 0.03], tone: 1 });
}
/* Atlas de la carte portuaire (appelé par buildTextures) */
function portKit() { TEX.signs3 = portSignAtlas(); TEX.decals3 = portDecalAtlas(); }

/* ---------- Bateaux ---------- */
/* Gabarit d'une coque : stations [t (0 arrière, 1 étrave), demi-largeur au livet (part de la largeur), livet, fin du
   bordé droit, quille, rondeur du bouchain (exposant de superellipse)] ; hauteurs en mètres au-dessus de la flottaison */
var HULL_TRAWLER = [
  [0.0, 0.88, 3.05, 0.55, -0.55, 5], [0.05, 0.95, 2.95, 0.42, -1.45, 4.2], [0.18, 1.0, 2.86, 0.32, -2.05, 3.4], [0.5, 1.0, 2.84, 0.3, -2.25, 3.0],
  [0.68, 0.97, 2.92, 0.35, -2.2, 2.7], [0.8, 0.86, 3.12, 0.5, -2.0, 2.3], [0.89, 0.64, 3.38, 0.78, -1.62, 1.9], [0.955, 0.36, 3.62, 1.15, -1.0, 1.6], [1.0, 0.04, 3.82, 1.75, 0.15, 1.4],
];
var HULL_CANOT = [
  [0.0, 0.82, 0.62, 0.25, -0.22, 5], [0.1, 0.92, 0.6, 0.2, -0.38, 3.6], [0.45, 1.0, 0.62, 0.18, -0.45, 3.0], [0.7, 0.9, 0.7, 0.24, -0.42, 2.4],
  [0.86, 0.62, 0.82, 0.35, -0.3, 1.9], [0.95, 0.3, 0.92, 0.5, -0.12, 1.6], [1.0, 0.04, 0.98, 0.75, 0.15, 1.4],
];
/* Section de la coque à t (interpolée entre les stations) */
function hullAt(T, t, hw0) {
  let i = 0; while (i < T.length - 2 && t > T[i + 1][0]) i++;
  const a = T[i], b = T[i + 1], k = clamp((t - a[0]) / (b[0] - a[0]), 0, 1), m = k * k * (3 - 2 * k);
  return { hw: lerp(a[1], b[1], m) * hw0, yd: lerp(a[2], b[2], m), yw: lerp(a[3], b[3], m), yk: lerp(a[4], b[4], m), n: lerp(a[5], b[5], m) };
}
/* Point du contour de la section : u de 0 (livet bâbord) à 1 (livet tribord) en passant par la quille */
function hullPoint(s, u) {
  const uS = 0.16;
  if (u < uS) return [-s.hw, lerp(s.yd, s.yw, u / uS)];
  if (u > 1 - uS) return [s.hw, lerp(s.yw, s.yd, (u - 1 + uS) / uS)];
  const a = Math.PI + ((u - uS) / (1 - 2 * uS)) * Math.PI, c = Math.cos(a), sn = Math.sin(a), ex = 2 / s.n;
  return [Math.sign(c) * Math.pow(Math.abs(c), ex) * s.hw, s.yw + Math.pow(Math.abs(sn), ex) * (s.yk - s.yw)];
}
/* Coque, pavois, pont et lisses. o : L, B, deck (hauteur du pont), hull (teinte), inner (teinte du pavois), deckTint,
   stripe (liston), boot (bande de flottaison), gaps (coupées, ouvertes dans le pavois et sans collision :
   [côté -1 ou 1, t0, t1] ; [0, x0, x1] dans le tableau arrière), noCol. Une coupée de chaque côté jusqu'à t = 1 ouvre
   l'étrave. Renvoie les fonctions utiles au reste du bateau (z(t), sections, demi-largeur au pont). */
function hullBody(M, T, o) {
  const L = o.L, hw0 = o.B / 2, Dk = o.deck, z = (t) => (t - 0.5) * L, th = o.thick || 0.1, nv = o.nv || 26, gaps = o.gaps || [];
  const S = (t) => hullAt(T, t, hw0), inner = (t) => Math.max(0.02, S(t).hw - th);
  // intervalles de pavois (t) d'un côté, coupées retirées
  const runs = (sd) => {
    let r = [[0, 1]];
    for (const g of gaps) if (g[0] === sd) r = r.flatMap(([a, b]) => (g[2] <= a || g[1] >= b ? [[a, b]] : [[a, g[1]], [g[2], b]].filter(([p, q]) => q - p > 1e-3)));
    return r;
  };
  const bowOpen = gaps.some((g) => g[0] === 1 && g[2] >= 0.99) && gaps.some((g) => g[0] === -1 && g[2] >= 0.99);
  const stern = gaps.find((g) => g[0] === 0);
  M.save().local(1);
  // bordé extérieur sous le pont (le pavois est à part, pour les coupées)
  M.color(o.hull); M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(-0.2, 1.4, y));
  const low = (t) => { const s = S(t); return { ...s, yd: Math.min(s.yd, Dk) }; };
  M.surf('hull', 18, nv, (u, v) => { const p = hullPoint(low(v), u); return [p[0], p[1], z(v)]; }, { uL: o.B * 1.6, vL: L });
  M.aoFn = null;
  // tableau arrière : le contour de la section arrière jusqu'au pont, fermé en éventail
  { const s0 = low(0), ring = []; for (let i = 0; i <= 18; i++) { const p = hullPoint(s0, i / 18); ring.push([p[0], p[1], z(0)]); }
    const c = [0, (Dk + s0.yk) / 2, z(0)]; for (let i = 0; i <= 18; i++) M.tri3('hull', c, ring[(i + 1) % 19], ring[i], [0, 0, -1]); }
  // pavois : peau extérieure (couleur de la coque), peau intérieure, lisse, joues des coupées
  for (const sd of [-1, 1]) for (const [a, b] of runs(sd)) {
    const n = Math.max(1, Math.round((b - a) * nv)), t = (v) => lerp(a, b, v);
    M.color(o.hull); M.surf('hull', 1, n, (u, v) => { const s = S(t(v)); return [sd * s.hw, lerp(Dk, s.yd, sd > 0 ? u : 1 - u), z(t(v))]; }, { uL: 1, vL: (b - a) * L });
    M.color(o.inner || [0.9, 0.9, 0.88]); M.surf('paint', 1, n, (u, v) => { const s = S(t(v)); return [sd * inner(t(v)), lerp(Dk, s.yd, sd > 0 ? 1 - u : u), z(t(v))]; }, { uL: 1, vL: (b - a) * L });
    M.color(o.rail || [0.92, 0.92, 0.9]);
    const P = []; for (let i = 0; i <= n; i++) { const s = S(t(i / n)); P.push([sd * Math.max(0, s.hw - th / 2), s.yd + 0.03, z(t(i / n))]); }
    if (P.length > 1) M.sweep('paint', rectShape(th + 0.06, 0.07), P);
    for (const e of [a, b]) if (e > 1e-3 && e < 0.999) { const s = S(e); M.color(o.hull); M.quad('paint', [sd * inner(e), Dk, z(e)], [sd * s.hw, Dk, z(e)], [sd * s.hw, s.yd, z(e)], [sd * inner(e), s.yd, z(e)], [0, 0, e === a ? -1 : 1]); }
  }
  // pavois du tableau arrière (avec son ouverture)
  { const s0 = S(0), a = inner(0), segs = stern ? [[-a, stern[1]], [stern[2], a]] : [[-a, a]];
    for (const [x0, x1] of segs) {
      const ox0 = x0 === -a ? -s0.hw : x0, ox1 = x1 === a ? s0.hw : x1;
      M.color(o.hull); M.quad('hull', [ox0, Dk, z(0)], [ox1, Dk, z(0)], [ox1, s0.yd, z(0)], [ox0, s0.yd, z(0)], [0, 0, -1]);
      M.color(o.inner || [0.9, 0.9, 0.88]); M.quad('paint', [x0, Dk, z(0) + th], [x1, Dk, z(0) + th], [x1, s0.yd, z(0) + th], [x0, s0.yd, z(0) + th], [0, 0, 1]);
      M.color(o.rail || [0.92, 0.92, 0.9]); M.boxB('paint', x0, x1, s0.yd, s0.yd + 0.07, z(0) - 0.03, z(0) + th + 0.03);
    }
    if (stern) for (const x of [stern[1], stern[2]]) { M.color(o.hull); M.quad('paint', [x, Dk, z(0)], [x, Dk, z(0) + th], [x, s0.yd, z(0) + th], [x, s0.yd, z(0)], [x < 0 ? 1 : -1, 0, 0]); }
  }
  // bande de flottaison et liston le long des flancs (là où le bordé est droit)
  if (o.boot) for (const sd of [-1, 1]) {
    M.color(o.boot); M.surf('hull', 1, 16, (u, v) => { const t = lerp(0.02, 0.78, v), s = S(t); return [sd * (s.hw + 0.006), lerp(s.yw + 0.02, s.yw + 0.3, sd > 0 ? u : 1 - u), z(t)]; }, { uL: 0.3, vL: L * 0.76 });
  }
  M.color(o.stripe || [0.92, 0.92, 0.9]);
  for (const sd of [-1, 1]) { const P = []; for (let i = 0; i <= 20; i++) { const t = 0.01 + (i / 20) * 0.94, s = S(t); P.push([sd * (s.hw + 0.035), Dk - 0.08, z(t)]); } M.tube('paint', 0.07, P, 6); }
  // pont (plat)
  M.color(o.deckTint || [0.4, 0.45, 0.42]); M.world(1);
  for (let i = 0; i < nv; i++) {
    const t0 = i / nv, t1 = (i + 1) / nv, a = inner(t0), b = inner(t1);
    M.quad('paint', [-a, Dk, z(t0)], [a, Dk, z(t0)], [b, Dk, z(t1)], [-b, Dk, z(t1)], [0, 1, 0]);
  }
  // étrave : les deux flancs (bordé et pavois) s'arrêtent à quelques centimètres l'un de l'autre à t = 1 et laissaient, de face, une fente
  // de la quille au plat-bord. Une pièce d'étrave la ferme : elle suit la quille depuis le brion puis monte jusqu'au-dessus de la lisse
  // (sous le pont seulement quand des coupées ouvrent l'étrave)
  { const s1 = S(1), r = Math.max(0.05, s1.hw + 0.02), P = [];
    for (let i = 0; i <= 5; i++) { const t = lerp(0.9, 1, i / 5); P.push([0, S(t).yk + r * 0.3, z(t)]); }
    const top = bowOpen ? Dk - 0.03 : s1.yd + 0.07;
    for (let i = 1; i <= 4; i++) P.push([0, lerp(P[5][1], top, i / 4), z(1)]);
    M.color(o.hull); M.tube('hull', r, P, 8);
    M.save().move(0, top, z(1)); M.cyl('hull', r, 0.001, 8, { side: false, caps: 't' }); M.restore(); // le bout du tube, fermé
  }
  M.restore();
  // collisions : coque en tranches (l'étrave s'affine), pavois en segments, coupées laissées ouvertes
  if (!o.noCol) {
    for (const [t0, t1] of [[0, 0.8], [0.8, 0.9], [0.9, 0.98]]) { const w = S((t0 + t1) / 2).hw * 0.98; M.col(-w, w, Math.min(S(0.5).yk, -1), Dk, z(t0), z(t1), 'metal'); }
    for (const sd of [-1, 1]) for (const [a, b] of runs(sd)) {
      const n = Math.max(1, Math.round((b - a) * 22));
      for (let i = 0; i < n; i++) {
        const t0 = lerp(a, b, i / n), t1 = lerp(a, b, (i + 1) / n), s = S((t0 + t1) / 2), w = s.hw;
        M.col(sd > 0 ? w - th - 0.06 : -w, sd > 0 ? w : -w + th + 0.06, Dk, s.yd + 0.05, z(t0), z(Math.min(t1, 0.985)), 'metal');
      }
    }
    const s0 = S(0);
    for (const [x0, x1] of stern ? [[-s0.hw, stern[1]], [stern[2], s0.hw]] : [[-s0.hw, s0.hw]]) M.col(x0, x1, Dk, s0.yd + 0.05, z(0), z(0) + th + 0.05, 'metal');
    if (!bowOpen) M.col(-0.6, 0.6, Dk, S(0.985).yd, z(0.97), z(1.0), 'metal');
  }
  // étrave ouverte : garde-corps de chandeliers autour de la plage avant, ouvert au milieu pour la coupée
  if (bowOpen) {
    const t0 = Math.max(...gaps.filter((g) => g[0] !== 0 && g[2] >= 0.99).map((g) => g[1]));
    M.save().local(1).color(o.rail || [0.92, 0.92, 0.9]); M.cls = 1;
    for (const sd of [-1, 1]) {
      const P = []; for (let i = 0; i <= 6; i++) { const t = lerp(t0, 0.985, i / 6); P.push([sd * Math.max(0.62, inner(t) - 0.05), Dk + 1.0, z(t)]); }
      M.tube('steel', 0.03, P, 5); M.tube('steel', 0.018, P.map((p) => [p[0], Dk + 0.5, p[2]]), 4);
      for (const p of P) { M.save().move(p[0], Dk, p[2]); M.cyl('steel', 0.025, 1.0, 5); M.restore(); }
    }
    M.restore();
  }
  return { z, S, inner, Dk, L, hw0 };
}
/* Point du plat-bord d'une coque posée en (x, y, z), tournée de ry (table T, longueur L, largeur B) : côté sd (1 : +x de la coque), à t
   (0 : tableau arrière, 1 : étrave), juste au-dessus de la lisse. Une amarre qui y aboutit reste dehors : attachées au jugé, sur l'axe du
   bateau ou dans le pavois, elles traversaient le pont et ce qu'il porte. */
function hullRail(T, L, B, x, y, z, ry, sd, t) {
  const s = hullAt(T, t, B / 2), lx = sd * (s.hw + 0.03), lz = (t - 0.5) * L, c = Math.cos(ry), sn = Math.sin(ry);
  return [x + lx * c + lz * sn, y + s.yd + 0.1, z - lx * sn + lz * c];
}
/* Contour de la coque à la flottaison, dans le repère du monde (bateau posé en (x, z), tourné de ry) : pour l'eau */
function hullOutline(T, L, B, x, z, ry, k = 0.97) {
  const P = [], c = Math.cos(ry), s = Math.sin(ry), n = 16;
  for (let sd of [1, -1]) for (let i = 0; i <= n; i++) {
    const t = sd > 0 ? i / n : 1 - i / n, h = hullAt(T, t, B / 2).hw * k * sd, zz = (t - 0.5) * L;
    P.push([x + h * c + zz * s, z - h * s + zz * c]);
  }
  return P;
}
/* Nom et immatriculation peints de chaque côté de l'étrave (case de l'atlas BOATS) et sur le tableau */
/* Nom peint sur le flanc sd de la coque, de t0 à t1, haut de h à partir de y : six bandes qui suivent la courbure du bordé. D'un seul
   quadrilatère, tendu entre les deux bouts, le milieu rentrait dans le pavois de l'avant et le nom se lisait depuis le pont. Le texte se lit
   de gauche à droite vu de l'extérieur : de l'étrave vers l'arrière à tribord, l'inverse à bâbord. */
function hullSideName(M, H, idx, sd, t0, t1, y, h, mat = 'decals3') {
  const n = 6, off = 0.03;
  for (let k = 0; k < n; k++) {
    const ta = lerp(t0, t1, k / n), tb = lerp(t0, t1, (k + 1) / n), a = H.S(ta), b = H.S(tb), za = H.z(ta), zb = H.z(tb);
    const pa = [sd * (a.hw + off), za], pb = [sd * (b.hw + off), zb], nx = sd * (zb - za), nz = -(b.hw - a.hw), l = hyp(nx, nz) || 1;
    const [p, q, u] = sd > 0 ? [pb, pa, (n - 1 - k) / n] : [pa, pb, k / n];
    decal3Quad(M, idx, [p[0], y, p[1]], [q[0], y, q[1]], [q[0], y + h, q[1]], [p[0], y + h, p[1]], [nx / l, 0, nz / l], [u, 0, 1 / n, 0.33], mat);
  }
}
function hullName(M, H, idx, y) {
  for (const sd of [-1, 1]) hullSideName(M, H, idx, sd, 0.8, 0.9, y, 0.62);
  const s0 = H.S(0), w = Math.min(2.4, s0.hw * 1.4);
  decal3Quad(M, idx, [w / 2, y + 0.2, H.z(0) - 0.02], [-w / 2, y + 0.2, H.z(0) - 0.02], [-w / 2, y + 0.2 + w / 4, H.z(0) - 0.02], [w / 2, y + 0.2 + w / 4, H.z(0) - 0.02], [0, 0, -1], [0, 0, 1, 0.33]);
}
/* Défense (pneu ou boudin) pendue au pavois, côté sd, à t */
function hullFender(M, H, sd, t, kind) {
  const s = H.S(t), x = sd * (s.hw + 0.16), z = H.z(t);
  M.save().color([0.12, 0.12, 0.12]).local(1);
  M.tube('rubber', 0.01, [[sd * (s.hw - 0.05), s.yd + 0.05, z], [x, s.yd - 0.2, z], [x, H.Dk - 0.2, z]], 3);
  if (kind) { M.save().move(x, H.Dk - 0.75, z).rotZ(Math.PI / 2).move(0, -0.13, 0); M.lathe('rubber', [[0.18, 0], [0.28, 0], [0.31, 0.04], [0.31, 0.22], [0.28, 0.26], [0.18, 0.26], [0.16, 0.13], [0.18, 0]], 12, { sharp: 0.9 }); M.restore(); }
  else { M.color([0.85, 0.22, 0.12]); M.save().move(x, H.Dk - 1.05, z); M.lathe('rubber', [[0, 0], [0.1, 0.03], [0.15, 0.15], [0.15, 0.6], [0.1, 0.72], [0, 0.75]], 10); M.restore(); }
  M.restore();
}
/* Chalutier (pêche arrière) : coque, timonerie à deux niveaux (fenêtres inclinées, portes, hublots), mât et radar,
   portique arrière avec enrouleur de filet, panneaux de chalut, treuil, panneau de cale, défenses. Repère : flottaison
   en y = 0, étrave vers +z. o : L, B, name (case de l'atlas), hull, house ([t0, t1] de la timonerie), gaps, seed */
PF.trawler = (o) => prefab('trawler' + JSON.stringify(o), (M) => {
  const R = rngOf(o.seed || 5), H = hullBody(M, HULL_TRAWLER, { L: o.L, B: o.B, deck: 1.9, hull: o.hull, boot: o.boot || [0.75, 0.16, 0.1], stripe: o.stripe, inner: o.inner, deckTint: o.deckTint, gaps: o.gaps });
  const Dk = H.Dk, z = H.z, [h0, h1] = o.house || [0.55, 0.78], hx = o.houseW || 1.45, zh0 = z(h0), zh1 = z(h1), white = [0.93, 0.93, 0.9];
  hullName(M, H, o.name || 0, Dk + 0.45);
  M.save().local(1);
  // roof
  // timonerie : rouf (niveau du pont) et passerelle vitrée au-dessus, plus courte, front incliné
  M.color(white); M.aoFn = (x, y) => lerp(0.7, 1, smoothstep(Dk, Dk + 0.8, y));
  M.boxB('paint', -hx, hx, Dk, Dk + 2.15, zh0, zh1, { bevel: 0.04 });
  M.aoFn = null;
  const zb0 = zh0 + 0.6, zb1 = zh1 - 0.25, yb0 = Dk + 2.15, yb1 = Dk + 4.2;
  M.save().move(0, yb0, 0).mul(basis([0, 0, 1], [0, 1, 0], [-1, 0, 0]).clone()).move(0, 0, -hx + 0.1);
  M.extrude('paint', [[zb0, 0], [zb1 + 0.3, 0], [zb1, yb1 - yb0], [zb0, yb1 - yb0]], (hx - 0.1) * 2, { sharp: 0.3 });
  M.restore();
  // vitres : bandeau sombre tout autour de la passerelle, montants blancs
  M.color([0.32, 0.36, 0.4]); M.cls = 1;
  const wy0 = yb0 + 0.95, wy1 = yb1 - 0.3, fr = (wy1 - wy0) / (yb1 - yb0) * 0.3;
  for (const sd of [-1, 1]) M.quad('glass', [sd * (hx - 0.09), wy0, zb0 + 0.3], [sd * (hx - 0.09), wy0, zb1], [sd * (hx - 0.09), wy1, zb1 - 0.05], [sd * (hx - 0.09), wy1, zb0 + 0.3], [sd, 0, 0]);
  { const k = 0.3 / (yb1 - yb0); M.quad('glass', [-hx + 0.25, wy0, zb1 + 0.3 - (wy0 - yb0) * k + 0.01], [hx - 0.25, wy0, zb1 + 0.3 - (wy0 - yb0) * k + 0.01], [hx - 0.25, wy1, zb1 + 0.3 - (wy1 - yb0) * k + 0.01], [-hx + 0.25, wy1, zb1 + 0.3 - (wy1 - yb0) * k + 0.01], [0, 0.3, 1]); }
  M.quad('glass', [hx - 0.3, wy0, zb0 - 0.01], [-hx + 0.3, wy0, zb0 - 0.01], [-hx + 0.3, wy1, zb0 - 0.01], [hx - 0.3, wy1, zb0 - 0.01], [0, 0, -1]);
  void fr;
  M.cls = 0; M.color(white);
  for (const sd of [-1, 1]) for (let k = 1; k < 4; k++) { const zz = lerp(zb0 + 0.3, zb1, k / 4); M.boxB('paint', sd * (hx - 0.1) - 0.03, sd * (hx - 0.1) + 0.03, wy0, wy1, zz - 0.05, zz + 0.05); }
  for (const x of [-0.5, 0.5]) { const k = 0.3 / (yb1 - yb0); M.boxB('paint', x - 0.05, x + 0.05, wy0, wy1, zb1 + 0.2 - (wy1 - yb0) * k, zb1 + 0.34 - (wy0 - yb0) * k); }
  // toit en débord, visière, main courante
  M.boxB('paint', -hx - 0.15, hx + 0.15, yb1, yb1 + 0.12, zb0 - 0.2, zb1 + 0.55, { bevel: 0.03 });
  M.color([0.2, 0.2, 0.2]); M.cls = 1;
  for (const sd of [-1, 1]) M.tube('steel', 0.025, [[sd * (hx + 0.05), yb1 + 0.12, zb0 - 0.1], [sd * (hx + 0.05), yb1 + 0.55, zb0 - 0.1], [sd * (hx + 0.05), yb1 + 0.55, zb1 + 0.4], [sd * (hx + 0.05), yb1 + 0.12, zb1 + 0.4]], 5);
  // portes du rouf, hublots
  M.color([0.18, 0.2, 0.22]); M.cls = 1;
  for (const sd of [-1, 1]) M.quad('dark', [sd * (hx + 0.005), Dk + 0.25, zh0 + 0.5], [sd * (hx + 0.005), Dk + 0.25, zh0 + 1.25], [sd * (hx + 0.005), Dk + 1.95, zh0 + 1.25], [sd * (hx + 0.005), Dk + 1.95, zh0 + 0.5], [sd, 0, 0]);
  M.quad('dark', [0.45, Dk + 0.2, zh0 - 0.005], [-0.45, Dk + 0.2, zh0 - 0.005], [-0.45, Dk + 1.95, zh0 - 0.005], [0.45, Dk + 1.95, zh0 - 0.005], [0, 0, -1]);
  M.color([0.55, 0.55, 0.52]);
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const zz = zh0 + 1.9 + k * ((zh1 - zh0 - 2.3) / 2); M.save().move(sd * (hx + 0.01), Dk + 1.35, zz).rotZ(sd * Math.PI / 2); M.cyl('steel', 0.17, 0.04, 10); M.restore(); M.save().color([0.06, 0.07, 0.08]).move(sd * (hx + 0.03), Dk + 1.35, zz).rotZ(sd * Math.PI / 2); M.cyl('glass', 0.12, 0.02, 10); M.restore(); }
  M.cls = 0;
  // mât tripode, vergue, radar, feux, antennes
  M.color([0.9, 0.9, 0.88]);
  const zm = (zb0 + zb1) / 2, ym = yb1 + 0.12;
  M.save().move(0, ym, zm); M.cyl('steel', 0.08, 4.6, 8, { r1: 0.05 }); M.restore();
  for (const sd of [-1, 1]) M.tube('steel', 0.04, [[sd * 0.9, ym, zm - 0.9], [0, ym + 3.0, zm]], 5);
  M.boxB('steel', -1.3, 1.3, ym + 2.6, ym + 2.7, zm - 0.05, zm + 0.05);
  M.color([0.12, 0.12, 0.12]); M.boxB('steel', -1.0, 1.0, ym + 3.2, ym + 3.32, zm - 0.12, zm + 0.12); M.save().move(0, ym + 3.0, zm); M.cyl('steel', 0.1, 0.2, 8); M.restore();
  M.cls = 1; M.color([0.88, 0.88, 0.86]); for (const x of [-0.8, 0.85]) { M.save().move(x, ym, zm + 0.6); M.cyl('plastic', 0.02, 2.4, 4, { r1: 0.01 }); M.restore(); }
  M.color([1.6, 0.15, 0.1]); M.boxB('bulb', -hx - 0.2, -hx - 0.12, yb1 - 0.3, yb1 - 0.15, zb1 - 0.3, zb1 - 0.1);
  M.color([0.15, 1.4, 0.3]); M.boxB('bulb', hx + 0.12, hx + 0.2, yb1 - 0.3, yb1 - 0.15, zb1 - 0.3, zb1 - 0.1);
  M.cls = 0;
  // bouées couronnes et radeaux de survie sur le toit
  for (const sd of [-1, 1]) { M.save().move(sd * (hx + 0.06), Dk + 1.3, zh1 - 0.6).rotY(sd * Math.PI / 2); M.put(PF.lifeRing()); M.restore(); }
  M.color([0.95, 0.95, 0.93]); for (const sd of [-1, 1]) { M.save().move(sd * 0.75, yb1 + 0.12, zb0 + 0.25).rotX(Math.PI / 2); M.cyl('plastic', 0.28, 1.1, 10); M.restore(); }
  // portique arrière (en U), enrouleur de filet, panneaux de chalut sur les potences
  const zs = z(0.05), gc = o.gantry || [0.92, 0.45, 0.12], gw = H.inner(0.05) - 0.25;
  M.color(gc);
  for (const sd of [-1, 1]) M.boxB('paint', sd * gw - 0.16, sd * gw + 0.16, Dk, Dk + 5.2, zs - 0.16, zs + 0.16, { bevel: 0.02 });
  M.boxB('paint', -gw - 0.2, gw + 0.2, Dk + 5.0, Dk + 5.45, zs - 0.2, zs + 0.2, { bevel: 0.03 });
  M.color([0.25, 0.25, 0.25]); M.save().move(0, Dk + 4.5, zs - 0.15); M.cyl('steel', 0.18, 0.3, 10); M.restore();
  // enrouleur : au pied du portique (pêche arrière) ou perché sur le portique (o.drum = 'haut', le pont reste libre)
  const zd = o.drum === 'haut' ? zs + 0.9 : z(0.2), yd0 = o.drum === 'haut' ? Dk + 3.6 : Dk;
  if (o.drum !== false) {
    M.color([0.3, 0.3, 0.3]);
    for (const sd of [-1, 1]) M.boxB('steel', sd * 1.9 - 0.08, sd * 1.9 + 0.08, yd0, yd0 + 1.6, zd - 0.6, zd + 0.6, { bevel: 0.02 });
    // rotZ(+90°) couche l'axe du cylindre vers -x : on part donc du flanc +x
    M.save().move(1.85, yd0 + 1.2, zd).rotZ(Math.PI / 2); M.color([0.42, 0.42, 0.4]); M.cyl('steel', 0.45, 3.7, 14); M.restore();
    M.save().move(1.65, yd0 + 1.2, zd).rotZ(Math.PI / 2); M.color(o.netColor || [0.25, 0.52, 0.4]); M.cyl('canvas', 0.8, 3.3, 16, { caps: '' }); M.restore();
    if (o.drum === 'haut') { M.color(gc); for (const sd of [-1, 1]) M.boxB('paint', sd * 2.05 - 0.12, sd * 2.05 + 0.12, Dk, yd0, zd - 0.12, zd + 0.12); }
  }
  // panneaux de chalut pendus aux potences, à l'extérieur du pavois
  for (const sd of [-1, 1]) { M.save().move(sd * (H.S(0.1).hw + 0.14), Dk + 0.35, z(0.1)).rotY(sd * 0.06); M.color(o.doors || [0.55, 0.18, 0.12]); M.boxB('rust', -0.07, 0.07, -0.55, 0.55, -0.85, 0.85, { bevel: 0.03 }); M.restore();
    M.color([0.25, 0.25, 0.25]); M.tube('steel', 0.03, [[sd * (H.S(0.1).hw - 0.05), H.S(0.1).yd + 0.05, z(0.1)], [sd * (H.S(0.1).hw + 0.4), H.S(0.1).yd + 0.9, z(0.1)], [sd * (H.S(0.1).hw + 0.4), H.S(0.1).yd + 0.9, z(0.1) - 0.3]], 4); }
  // treuil derrière la timonerie, panneau de cale, bacs et cordages
  const ww = o.winchW || 1.2;
  M.color([0.2, 0.36, 0.5]); M.boxB('paint', -ww, ww, Dk, Dk + 1.0, zh0 - 1.6, zh0 - 0.4, { bevel: 0.05 });
  // tambours du treuil (l'axe du cylindre part vers -x après rotZ)
  M.color([0.35, 0.35, 0.35]); for (const sd of [-1, 1]) { M.save().move(sd * ww * 0.62 + 0.25, Dk + 1.0, zh0 - 1.0).rotZ(Math.PI / 2); M.cyl('steel', 0.35, 0.5, 12); M.restore(); }
  M.color(o.deckTint ? o.deckTint.map((c) => c * 0.8) : [0.32, 0.36, 0.34]); M.boxB('paint', -0.9, 0.9, Dk, Dk + 0.35, z(0.32) - 0.9, z(0.32) + 0.9, { bevel: 0.03 });
  M.restore();
  for (const [x, t, k] of o.bins || [[0.9, 0.42, 0], [1.2, 0.36, 1], [-1.1, 0.4, 2]]) { M.save().move(x, Dk, z(t)).rotY(R() - 0.5); M.put(PF.fishBinStackDyn(1 + (k % 2), k)); M.restore(); }
  M.save().move(-1.0, Dk, z(0.88)); M.dyn('ropeCoil', 0, 0, 0, 0); M.restore();
  M.save().move(0.6, Dk, z(0.27)); M.dyn('ropeCoil', 0, 0, 0, 0); M.restore();
  for (const sd of [-1, 1]) for (const [t, k] of [[0.3, 1], [0.45, 0], [0.62, 1]]) if (!(o.gaps || []).some((g) => g[0] === sd && t > g[1] - 0.04 && t < g[2] + 0.04)) hullFender(M, H, sd, t, k);
  // collisions : timonerie, portique, enrouleur, treuil
  M.col(-hx, hx, Dk, yb1 + 0.1, zh0, zh1, 'metal');
  for (const sd of [-1, 1]) M.col(sd * gw - 0.17, sd * gw + 0.17, Dk, Dk + 5.2, zs - 0.17, zs + 0.17, 'metal');
  if (o.drum !== false) { if (o.drum === 'haut') { for (const sd of [-1, 1]) M.col(sd * 2.05 - 0.13, sd * 2.05 + 0.13, Dk, yd0, zd - 0.13, zd + 0.13, 'metal'); } else M.col(-2.0, 2.0, Dk, Dk + 2.0, zd - 0.8, zd + 0.8, 'metal'); }
  M.col(-ww, ww, Dk, Dk + 1.0, zh0 - 1.6, zh0 - 0.4, 'metal');
  M.occ(-hx, hx, Dk, yb1, zh0, zh1, 1);
});
/* Bouée couronne (orange, bandes blanches), dans le plan xy, centre en y = 0 */
PF.lifeRing = () => prefab('lifeRing', (M) => {
  M.local(1); M.cls = 1;
  for (let i = 0; i < 4; i++) { M.color(i % 2 ? [0.95, 0.95, 0.92] : [0.95, 0.42, 0.08]); M.save().rotZ((i * Math.PI) / 2); M.save().rotX(Math.PI / 2); M.lathe('plastic', [[0.28, -0.05], [0.33, -0.04], [0.35, 0], [0.33, 0.04], [0.28, 0.05], [0.26, 0], [0.28, -0.05]], 8, { a0: 0, a1: Math.PI / 2 }); M.restore(); M.restore(); }
});
/* Glène de cordage lovée sur le pont */
PF.ropeCoil = () => prefab('ropeCoil', (M) => {
  M.color([0.82, 0.7, 0.42]).local(1); M.cls = 1;
  for (let k = 0; k < 4; k++) { const r = 0.32 - k * 0.03, P = []; for (let i = 0; i <= 14; i++) { const a = (i / 14) * TAU; P.push([Math.cos(a) * r, 0.03 + k * 0.045, Math.sin(a) * r]); } M.tube('canvas', 0.022, P, 5); }
});
/* Bac à poisson en plastique (80 x 50 x 30 cm), teinte de l'estampille ; empilés de n ; k : poisson et glace dans celui du haut */
function fishBinShell(M) {
  M.local(1);
  M.aoFn = (x, y) => lerp(0.65, 1, smoothstep(0, 0.2, y));
  M.boxB('plastic', -0.4, 0.4, 0, 0.03, -0.25, 0.25);
  for (const s of [-1, 1]) { M.boxB('plastic', -0.42, 0.42, 0, 0.3, s * 0.25 - 0.02, s * 0.25 + 0.01 * s); M.boxB('plastic', s * 0.4 - 0.02, s * 0.4 + 0.02, 0, 0.3, -0.24, 0.24); }
  M.aoFn = null;
  for (const s of [-1, 1]) { M.color([0.06, 0.06, 0.06]); M.boxB('dark', s * 0.425, s * 0.426, 0.2, 0.26, -0.08, 0.08); }
}
PF.fishBin = () => prefab('fishBin', (M, P) => {
  P.tintable = ['plastic'];
  fishBinShell(M);
});
/* Bac à poisson physique, vide (avec sa collision), et bac du haut d'une pile : lit de glace compris, collision jusqu'à la glace */
PF.fishBinSolid = () => prefab('fishBinSolid', (M, P) => {
  P.tintable = ['plastic'];
  fishBinShell(M);
  M.col(-0.42, 0.42, 0, 0.3, -0.27, 0.27, 'dirt');
});
PF.fishBinIce = () => prefab('fishBinIce', (M, P) => {
  P.tintable = ['plastic'];
  fishBinShell(M);
  M.save().move(0, 0.03, 0); fishIce(M, 0.36, 0.22, 0.16, rngOf(3)); M.restore();
  M.col(-0.42, 0.42, 0, 0.14, -0.27, 0.27, 'dirt');
});
/* Pile de bacs physiques (au sol, hors des bateaux qui bougent) : mêmes bacs et mêmes teintes que fishBinStack, poissons dynamiques */
PF.fishBinStackDyn = (n = 2, k = 0) => prefab('fishBinStackDyn' + n + '_' + k, (M) => {
  const R = rngOf(31 + k * 7 + n), cols = [[0.15, 0.36, 0.72], [0.95, 0.5, 0.08], [0.85, 0.85, 0.82], [0.2, 0.5, 0.35]];
  for (let i = 0; i < n; i++) { const x = (R() - 0.5) * 0.04, z = (R() - 0.5) * 0.04; M.dyn(i === n - 1 ? 'fishBinIce' : 'fishBin', x, i * 0.285, z, (R() - 0.5) * 0.08, { tint: cols[(k + i) % cols.length] }); }
  M.save().move(0, (n - 1) * 0.285 + 0.03, 0); fishPile(M, 0.36, 0.22, 0.16, k, true); M.restore();
});
/* Un poisson de 30 cm, couché (repère : son centre), teinte de l'estampille */
PF.fishOne = () => prefab('fishOne', (M, P) => { P.tintable = ['fish']; M.color([1, 1, 1]).local(1); fishBody(M, 0.3); });
PF.fishBinStack = (n = 2, k = 0) => prefab('fishBinStack' + n + '_' + k, (M) => {
  const R = rngOf(31 + k * 7 + n), cols = [[0.15, 0.36, 0.72], [0.95, 0.5, 0.08], [0.85, 0.85, 0.82], [0.2, 0.5, 0.35]];
  for (let i = 0; i < n; i++) { M.save().move((R() - 0.5) * 0.04, i * 0.285, (R() - 0.5) * 0.04).rotY((R() - 0.5) * 0.08); M.put(PF.fishBin(), { tint: cols[(k + i) % cols.length] }); M.restore(); }
  M.save().move(0, (n - 1) * 0.285 + 0.03, 0); fishPile(M, 0.36, 0.22, 0.16, k); M.restore();
  M.col(-0.42, 0.42, 0, n * 0.285 + 0.06, -0.27, 0.27, 'dirt');
});
/* Lit de glace pilée et poissons couchés dessus (repère local : centre du lit, y = 0 au fond), demi-longueur a, demi-largeur b */
function fishIce(M, a, b, h, R) {
  M.save().color([0.95, 0.96, 0.98]); M.cls = 1;
  M.surf('crushedice', 6, 4, (u, v) => { const x = lerp(-a, a, u), z = lerp(-b, b, v); return [x, h * (0.55 + 0.25 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI)) + (R() - 0.5) * 0.01, z]; }, { uL: a * 2, vL: b * 2, flipN: true });
  M.restore();
}
/* dyn : les poissons sont des props physiques (teinte de l'espèce) et le lit de glace n'est pas dessiné (c'est celui du bac ou de l'étal) */
function fishPile(M, a, b, h, seed, dyn) {
  const R = rngOf(seed * 13 + 3);
  if (dyn) for (let i = 0; i < 35; i++) R(); else fishIce(M, a, b, h, R);
  M.save(); M.cls = 2;
  const kinds = [[0.72, 0.74, 0.78], [0.62, 0.66, 0.7], [0.8, 0.58, 0.5], [0.55, 0.6, 0.48], [0.88, 0.86, 0.8]];
  const n = Math.round(a * b * 40);
  for (let i = 0; i < n; i++) {
    const x = R.range(-a + 0.08, a - 0.08), zz = R.range(-b + 0.05, b - 0.05), L = R.range(0.22, 0.38);
    if (dyn) { const ry = R() * TAU, rz = (R() - 0.5) * 0.3; M.dyn('fish', x, h * 0.78 + 0.02, zz, ry, { rz, s: L / 0.3, tint: R.pick(kinds) }); continue; }
    M.save().move(x, h * 0.78 + 0.02, zz).rotY(R() * TAU).rotZ((R() - 0.5) * 0.3); M.color(R.pick(kinds)); fishBody(M, L); M.restore();
  }
  M.restore();
}
/* Poisson stylisé (fuseau aplati, nageoire caudale), longueur L le long de x */
function fishBody(M, L) {
  M.loft('fish', [{ z: -L / 2, w: 0.002, yb: -0.004, yt: 0.004, n: 2 }, { z: -L * 0.32, w: L * 0.05, yb: -L * 0.07, yt: L * 0.07, n: 2 }, { z: L * 0.05, w: L * 0.07, yb: -L * 0.11, yt: L * 0.12, n: 2 },
    { z: L * 0.35, w: L * 0.045, yb: -L * 0.06, yt: L * 0.08, n: 2 }, { z: L / 2, w: 0.002, yb: -0.004, yt: 0.006, n: 2 }].map((s) => ({ ...s })), 6, { caps: false, uL: L, vL: L });
  M.quad('fish', [0, -L * 0.1, -L / 2 - L * 0.12], [0, L * 0.1, -L / 2 - L * 0.12], [0, 0.004, -L / 2 + 0.01], [0, -0.004, -L / 2 + 0.01], [1, 0, 0]);
}
/* Canot à moteur (5,6 m) : coque ouverte, banc, console, moteur hors-bord ; pour flotter (floatAdd) ou reposer sur un ber */
PF.canot = (hull = [0.85, 0.85, 0.82], seed = 1) => prefab('canot' + hull.join(',') + seed, (M) => {
  const H = hullBody(M, HULL_CANOT, { L: 5.6, B: 2.1, deck: 0.18, thick: 0.06, nv: 16, hull, boot: [0.2, 0.32, 0.55], stripe: [0.2, 0.32, 0.55], inner: [0.92, 0.92, 0.9], deckTint: [0.62, 0.6, 0.55], noCol: true });
  const z = H.z;
  M.save().local(1);
  M.color([0.9, 0.9, 0.88]); M.boxB('paint', -0.35, 0.35, 0.18, 1.05, z(0.55) - 0.3, z(0.55) + 0.3, { bevel: 0.04 });
  M.color([0.1, 0.12, 0.14]); M.boxB('glass', -0.33, 0.33, 1.05, 1.35, z(0.55) + 0.15, z(0.55) + 0.2);
  M.color([0.6, 0.48, 0.34]); M.boxB('wood', -0.85, 0.85, 0.45, 0.5, z(0.25) - 0.18, z(0.25) + 0.18);
  M.color([0.15, 0.15, 0.16]); M.boxB('paint', -0.22, 0.22, 0.25, 1.05, z(0) - 0.45, z(0) - 0.05, { bevel: 0.05 });
  M.color([0.2, 0.2, 0.2]); M.boxB('steel', -0.06, 0.06, -0.55, 0.3, z(0) - 0.35, z(0) - 0.22);
  const R = rngOf(seed); if (R() < 0.7) { M.save().move(0.3, 0.18, z(0.75)); M.put(PF.fishBinStack(1, seed)); M.restore(); }
  M.save().move(-0.4, 0.18, z(0.35)); M.put(PF.ropeCoil()); M.restore();
  M.restore();
});
/* Voilier au mouillage (lointain) : coque blanche, rouf, mât et bôme, voile ferlée */
PF.sailboat = (seed = 1) => prefab('sailboat' + seed, (M) => {
  const R = rngOf(seed * 7 + 2);
  hullBody(M, HULL_CANOT, { L: 9, B: 3, deck: 0.75, thick: 0.05, nv: 12, hull: [0.94, 0.94, 0.92], boot: R.pick([[0.12, 0.2, 0.42], [0.6, 0.14, 0.1]]), stripe: [0.2, 0.25, 0.4], inner: [0.9, 0.9, 0.88], deckTint: [0.78, 0.74, 0.66], noCol: true });
  M.save().local(1).color([0.95, 0.95, 0.93]);
  M.boxB('paint', -0.9, 0.9, 0.75, 1.3, -1.4, 1.2, { bevel: 0.08 });
  M.color([0.85, 0.85, 0.85]); M.cyl('steel', 0.06, 12, 6, { r1: 0.04 });
  M.save().move(0, 1.9, 0).rotX(-Math.PI / 2); M.cyl('steel', 0.05, 3.8, 6); M.restore();
  M.color(R.pick([[0.18, 0.3, 0.55], [0.85, 0.82, 0.74], [0.55, 0.15, 0.12]])); M.save().move(0, 1.95, -0.2).rotX(-Math.PI / 2); M.cyl('canvas', 0.16, 3.4, 8, { r1: 0.1 }); M.restore();
  M.color([0.3, 0.3, 0.3]); M.cls = 2; M.tube('steel', 0.008, [[0, 11.8, 0], [0, 0.8, 4.2]], 3); M.tube('steel', 0.008, [[0, 11.8, 0], [0, 0.8, -4.3]], 3);
  M.restore();
});
/* Bitte d'amarrage en fonte (bollard à tête renflée) sur sa platine */
PF.bitt = () => prefab('bitt', (M) => {
  M.color([0.16, 0.17, 0.18]).local(1);
  M.boxB('steel', -0.3, 0.3, 0, 0.05, -0.3, 0.3, { bevel: 0.02 });
  M.lathe('steel', [[0, 0.05], [0.17, 0.05], [0.15, 0.14], [0.13, 0.42], [0.2, 0.5], [0.22, 0.56], [0.2, 0.62], [0, 0.63]], 14, { sharp: 0.7 });
  M.col(-0.2, 0.2, 0, 0.6, -0.2, 0.2, 'metal');
});
/* Amarre : cordage tendu en chaînette d'un point à l'autre (repère monde), sans collision */
function mooringLine(a, b, sag = 0.4, col = [0.85, 0.74, 0.45]) {
  LINES.push({ k: 'amarre', a, b });
  DECOR.save().color(col); DECOR.cls = 2; DECOR.tube('canvas', 0.022, sagPath(a, b, sag, 12), 4); DECOR.restore();
}
/* Coupée : planche à taquets et mains courantes de cordage, de (x0, z0) à (x1, z1) le long de axis, de h0 à h1.
   Rampe praticable (RAMPS, les bots la prennent), sans marches */
function gangway(x0, x1, z0, z1, axis, h0, h1) {
  RAMPS.push({ x0, x1, z0, z1, axis, h0, h1 });
  const M = DECOR, L = axis === 'x' ? x1 - x0 : z1 - z0, W = axis === 'x' ? z1 - z0 : x1 - x0, ang = Math.atan2(h1 - h0, L);
  M.save().move((x0 + x1) / 2, (h0 + h1) / 2, (z0 + z1) / 2).rotY(axis === 'x' ? Math.PI / 2 : 0).rotX(-ang).local(1);
  const len = hyp(L, h1 - h0);
  M.color([0.55, 0.45, 0.34]); M.boxB('wood', -W / 2, W / 2, -0.07, -0.01, -len / 2, len / 2, { bevel: 0.01 });
  M.color([0.45, 0.36, 0.26]); M.cls = 1;
  for (let k = -len / 2 + 0.2; k < len / 2; k += 0.32) M.boxB('wood', -W / 2 + 0.05, W / 2 - 0.05, -0.01, 0.02, k - 0.025, k + 0.025);
  for (const s of [-1, 1]) for (const k of [-len / 2 + 0.05, len / 2 - 0.05]) M.boxB('steel', s * W / 2 - 0.02, s * W / 2 + 0.02, -0.01, 0.95, k - 0.02, k + 0.02);
  M.color([0.85, 0.74, 0.45]);
  for (const s of [-1, 1]) M.tube('canvas', 0.015, sagPath([s * W / 2, 0.92, -len / 2 + 0.05], [s * W / 2, 0.92, len / 2 - 0.05], 0.08, 8), 4);
  M.restore();
  // les tirs s'arrêtent sur la planche, pas sur les cordages
  if (axis === 'x') M.col(x0, x1, Math.min(h0, h1) - 0.1, Math.min(h0, h1), z0, z1, 'wood', true); else M.col(x0, x1, Math.min(h0, h1) - 0.1, Math.min(h0, h1), z0, z1, 'wood', true);
}

/* ---------- Matériel de quai ---------- */
/* Tas de filet de pêche : amas bosselé (deux teintes de nappe), flotteurs orange, ralingue ; collision basse */
PF.netPile = (seed = 1, w = 2.2, d = 1.6, h = 0.9) => prefab(`netPile${seed}_${w}_${d}_${h}`, (M) => {
  const R = rngOf(seed * 37 + 5), N = makeNoise(seed * 11 + 3), col = [[0.24, 0.5, 0.38], [0.2, 0.36, 0.6], [0.75, 0.32, 0.14], [0.3, 0.55, 0.62]];
  M.local(1);
  for (let k = 0; k < 2; k++) {
    const c = R.pick(col), ox = (R() - 0.5) * w * 0.25, oz = (R() - 0.5) * d * 0.25, sc = k ? 0.7 : 1;
    M.save().color(c).move(ox, 0, oz); M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0, h * 0.6, y));
    M.surf('canvas', 14, 10, (u, v) => {
      const a = u * TAU, r = Math.sin(v * Math.PI / 2), n = N.fbm(u * 3 + k, v * 2, 64, 64, 3);
      const rr = r * (0.75 + n * 0.5);
      return [Math.cos(a) * rr * w / 2 * sc, Math.cos(v * Math.PI / 2) * h * sc * (0.8 + n * 0.4) + (k ? h * 0.25 : 0), Math.sin(a) * rr * d / 2 * sc];
    }, { closeU: true, uL: w * 2, vL: h * 2, pole: () => [0, 1, 0] });
    M.restore();
  }
  M.aoFn = null; M.cls = 1;
  for (let i = 0; i < 9; i++) { const a = R() * TAU, r = R.range(0.3, 0.9); M.save().color([0.95, 0.45, 0.1]).move(Math.cos(a) * r * w / 2, R.range(0.25, h * 0.95), Math.sin(a) * r * d / 2).scl(0.09, 0.07, 0.09); M.geo('plastic', G_SPH); M.restore(); }
  M.color([0.86, 0.76, 0.48]); M.tube('canvas', 0.02, [[-w / 2, 0.05, -d * 0.3], [-w * 0.2, h * 0.7, 0], [w * 0.25, h * 0.6, d * 0.2], [w / 2 + 0.3, 0.02, d * 0.4]], 4);
  M.col(-w * 0.42, w * 0.42, 0, h * 0.95, -d * 0.42, d * 0.42, 'dirt');
});
/* Casier à crustacés : armature cylindrique couchée, filet, goulotte ; empilés par rangées */
PF.lobsterPot = () => prefab('lobsterPot', (M) => {
  M.local(1); M.color([0.2, 0.22, 0.22]); M.cls = 1;
  for (const z of [-0.28, 0, 0.28]) { const P = []; for (let i = 0; i <= 10; i++) { const a = Math.PI * (i / 10); P.push([Math.cos(a) * 0.3, Math.sin(a) * 0.3, z]); } M.tube('steel', 0.012, P, 4); }
  M.boxB('steel', -0.3, 0.3, 0, 0.02, -0.3, 0.3);
  M.color([0.25, 0.42, 0.62]);
  M.surf('net', 6, 1, (u, v) => { const a = Math.PI * u; return [Math.cos(a) * 0.3, Math.sin(a) * 0.3, lerp(-0.3, 0.3, v)]; }, { uL: 0.95, vL: 0.6, flipN: true });
  for (const z of [-0.3, 0.3]) { const B = 8; for (let i = 0; i < B; i++) { const a0 = Math.PI * i / B, a1 = Math.PI * (i + 1) / B; M.tri3('net', [0, 0.1, z], [Math.cos(a0) * 0.3, Math.sin(a0) * 0.3, z], [Math.cos(a1) * 0.3, Math.sin(a1) * 0.3, z], [0, 0, Math.sign(z)]); } }
  M.color([0.85, 0.55, 0.15]); M.save().move(0, 0.3, 0); M.cyl('plastic', 0.08, 0.06, 8); M.restore();
  M.col(-0.3, 0.3, 0, 0.3, -0.3, 0.3, 'dirt');
});
PF.lobsterPots = (nx = 3, ny = 2, nz = 2, seed = 1) => prefab(`lobsterPots${nx}${ny}${nz}_${seed}`, (M) => {
  const R = rngOf(seed);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx - (j % 2); i++) for (let k = 0; k < nz; k++) {
    M.dyn('lobsterPot', (i - (nx - 1) / 2 + (j % 2) * 0.5) * 0.62, j * 0.3, (k - (nz - 1) / 2) * 0.62, Math.PI / 2 + (R() - 0.5) * 0.15);
  }
});
/* Bouée de corps-mort ou de casier (sphère orange ou blanche et son anneau) */
PF.buoy = (c = [0.95, 0.42, 0.1], r = 0.3) => prefab('buoy' + c.join(',') + r, (M) => {
  M.color(c).local(1); M.save().move(0, r, 0).scl(r, r * 0.92, r); M.geo('plastic', new THREE.SphereGeometry(1, 12, 8)); M.restore();
  M.color([0.2, 0.2, 0.2]); M.save().move(0, r * 1.85, 0).rotX(Math.PI / 2); M.lathe('steel', [[0.06, -0.012], [0.08, 0], [0.06, 0.012], [0.05, 0], [0.06, -0.012]], 8); M.restore();
});
/* Échelle de quai : montants et barreaux de fer scellés dans le parement (repère : face du quai en z = 0, l'eau vers +z) */
PF.quayLadder = (depth = 2.2) => prefab('quayLadder' + depth, (M) => {
  M.local(1); M.color([0.22, 0.2, 0.18]);
  for (const x of [-0.22, 0.22]) M.tube('rust', 0.025, [[x, -depth, 0.12], [x, -0.05, 0.12], [x, 0.25, 0.06], [x, 0.25, -0.25]], 5);
  M.cls = 1; for (let y = -depth + 0.15; y < 0; y += 0.3) M.boxB('rust', -0.22, 0.22, y - 0.015, y + 0.015, 0.1, 0.14);
});
/* Poteau de bouée couronne : potelet, boîte à bouée, la bouée accrochée */
PF.lifeRingStand = () => prefab('lifeRingStand', (M) => {
  M.local(1); M.color([0.85, 0.12, 0.1]); M.boxB('paint', -0.04, 0.04, 0, 1.5, -0.04, 0.04);
  M.color([0.92, 0.92, 0.9]); M.boxB('paint', -0.4, 0.4, 0.75, 1.55, 0.04, 0.12, { bevel: 0.01 });
  M.save().move(0, 1.15, 0.2); M.put(PF.lifeRing()); M.restore();
  M.col(-0.1, 0.1, 0, 1.5, -0.1, 0.1, 'metal', true);
});
/* Grue de déchargement (grue de quai sur fût, d'après des photos de grues portuaires à flèche treillis) : semelle boulonnée, fût conique,
   couronne d'orientation, plateforme tournante avec la salle des machines, la cabine du grutier en avant, chevalet en A, flèche en treillis
   à quatre membrures orientée vers -z (vers l'eau), câbles de relevage, câble de levage, moufle et crochet. Collisions : le fût et la semelle. */
PF.quayCrane = (reach = 9) => prefab('quayCrane' + reach, (M) => {
  const Yl = [0.82, 0.6, 0.14], D = [0.18, 0.18, 0.19];
  M.local(1); M.color(Yl);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0, 0.6, y));
  // semelle et boulons, fût conique, couronne d'orientation
  M.boxB('paint', -1.1, 1.1, 0, 0.42, -1.1, 1.1, { bevel: 0.06 });
  M.color(D); M.cls = 2; for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU + Math.PI / 8; M.save().move(Math.cos(a) * 0.88, 0.42, Math.sin(a) * 0.88); M.cyl('steel', 0.045, 0.07, 6); M.restore(); } M.cls = 0;
  M.color(Yl); M.save().move(0, 0.42, 0); M.lathe('paint', [[0, 0], [0.62, 0], [0.62, 0.12], [0.52, 0.3], [0.42, 4.6], [0.5, 4.66], [0.5, 4.8], [0, 4.8]], 16, { sharp: 0.35 }); M.restore();
  M.color(D); M.save().move(0, 5.22, 0); M.cyl('steel', 0.62, 0.14, 18); M.restore();
  // plateforme tournante, salle des machines (arrière, +z) et contrepoids, cabine du grutier (avant gauche)
  M.color(Yl); M.boxB('paint', -0.95, 0.95, 5.36, 5.5, -0.9, 1.9, { bevel: 0.03 });
  M.boxB('paint', -0.85, 0.85, 5.5, 6.9, 0.1, 1.8, { bevel: 0.05 });
  M.color([0.7, 0.5, 0.12]); M.save().move(0.86, 5.5, 0.1).rotY(-Math.PI / 2); M.extrude('paint', [[0, 1.4], [1.7, 1.4], [1.7, 1.55], [0, 1.55]], 1.72, { sharp: 0.2 }); M.restore(); // débord du toit
  M.color(D); M.boxB('paint', -0.9, 0.9, 5.5, 6.3, 1.8, 2.15, { bevel: 0.04 }); // contrepoids
  M.color([0.3, 0.3, 0.3]); M.boxB('paint', 0.851, 0.86, 5.6, 6.6, 0.6, 1.2); // porte de la salle des machines
  M.color([0.24, 0.28, 0.32]); for (const sd of [-1, 1]) M.boxB('glass', sd * 0.852 - 0.004, sd * 0.852 + 0.004, 6.2, 6.6, 1.3, 1.7);
  M.color(Yl); M.boxB('paint', -0.85, -0.05, 5.5, 7.0, -0.85, 0.1, { bevel: 0.04 });
  M.color([0.25, 0.3, 0.35]);
  M.boxB('glass', -0.8, -0.1, 6.0, 6.85, -0.87, -0.85); M.boxB('glass', -0.87, -0.85, 6.0, 6.85, -0.75, -0.05); M.boxB('glass', -0.05, -0.03, 6.0, 6.85, -0.75, -0.05);
  M.color(D); M.boxB('steel', -0.88, -0.02, 7.0, 7.06, -0.9, 0.15); // toit de cabine
  // garde-corps de la plateforme, côté flèche
  M.cls = 1; M.tube('steel', 0.02, [[0.95, 6.5, 0.1], [0.95, 6.5, -0.9], [-0.95, 6.5, -0.9]], 4); for (const p of [[0.95, -0.9], [0.95, -0.4], [0.95, 0.1]]) M.tube('steel', 0.02, [[p[0], 5.5, p[1]], [p[0], 6.5, p[1]]], 4); M.cls = 0;
  // chevalet en A au-dessus de la salle des machines
  M.color(Yl); const ap = [0, 8.6, 0.9];
  for (const sd of [-1, 1]) { M.tube('paint', 0.06, [[sd * 0.7, 6.9, 0.3], ap], 6); M.tube('paint', 0.06, [[sd * 0.7, 6.9, 1.7], ap], 6); }
  M.save().move(0, ap[1], ap[2]).rotZ(Math.PI / 2); M.cyl('steel', 0.12, 0.3, 10); M.restore();
  // flèche en treillis : quatre membrures du pied (pivot sur l'avant de la plateforme) à la tête, section qui se resserre, treillis en zigzag
  const top = 6.0, z0 = -0.9, tip = [0, 9.5, -reach], N = 9;
  const P = (t, sx, sy) => { const w = lerp(0.36, 0.14, t), h = lerp(0.42, 0.16, t); return [sx * w, lerp(top, tip[1], t) + sy * h, lerp(z0, tip[2], t)]; };
  const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [sx, sy] of C) M.tube('paint', 0.045, [P(0, sx, sy), P(1, sx, sy)], 6);
  M.cls = 1;
  for (let f = 0; f < 4; f++) { const a = C[f], b = C[(f + 1) % 4]; const path = []; for (let k = 0; k <= N; k++) { const t = k / N, c = k % 2 ? b : a; path.push(P(t, c[0], c[1])); } for (let k = 0; k < N; k++) M.tube('paint', 0.022, [path[k], path[k + 1]], 4); }
  M.cls = 0;
  M.color(D); M.save().move(0, tip[1], tip[2]).rotZ(Math.PI / 2); M.cyl('steel', 0.2, 0.34, 12); M.restore(); // poulie de tête
  M.save().move(0, top, z0).rotZ(Math.PI / 2); M.cyl('steel', 0.12, 0.8, 10); M.restore(); // axe du pied
  // câbles de relevage (chevalet vers la tête), câble de levage et moufle, crochet
  M.color([0.14, 0.14, 0.14]); M.cls = 1;
  for (const sd of [-0.06, 0.06]) M.tube('steel', 0.012, [[sd, ap[1], ap[2]], [sd, tip[1] + 0.15, tip[2] + 0.1]], 3);
  M.tube('steel', 0.012, [[0, ap[1] - 0.2, ap[2] + 0.2], [0, 6.9, 1.4]], 3);
  for (const sd of [-0.05, 0.05]) M.tube('steel', 0.01, [[sd, tip[1] - 0.2, tip[2]], [sd, 4.3, tip[2]]], 3);
  M.cls = 0; M.color(D);
  M.save().move(0, 3.9, tip[2]); M.boxB('steel', -0.16, 0.16, 0, 0.42, -0.1, 0.1, { bevel: 0.03 }); M.save().move(0, 0.21, 0).rotZ(Math.PI / 2); M.cyl('steel', 0.13, 0.22, 10); M.restore(); M.restore();
  M.color([0.85, 0.65, 0.12]); M.tube('steel', 0.03, [[0, 3.9, tip[2]], [0, 3.62, tip[2]], [0.02, 3.42, tip[2] - 0.1], [0, 3.36, tip[2] - 0.22], [-0.01, 3.46, tip[2] - 0.28]], 6);
  M.aoFn = null;
  M.col(-0.6, 0.6, 0, 5.4, -0.6, 0.6, 'metal');
  M.col(-1.1, 1.1, 0, 0.5, -1.1, 1.1, 'metal');
});
/* Portique de manutention (élévateur à bateaux) enjambant la darse : quatre jambes sur roues, deux poutres le long de z,
   palans et sangles. Repère : centre au sol, poutres en x = ±w/2, jambes en z = ±L/2 */
PF.portique = (w = 11, L = 25, H = 10) => prefab(`portique${w}_${L}_${H}`, (M) => {
  M.local(1); const blue = [0.2, 0.38, 0.62];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * w / 2, z = sz * L / 2;
    M.color(blue); M.boxB('paint', x - 0.35, x + 0.35, 1.0, H, z - 0.35, z + 0.35, { bevel: 0.04 });
    M.color([0.15, 0.15, 0.15]); M.boxB('paint', x - 0.6, x + 0.6, 0.45, 1.0, z - 1.1, z + 1.1, { bevel: 0.04 });
    for (const dz of [-0.65, 0.65]) { M.save().move(x - 0.35, 0, z + dz); wheel(M, 0.45, 0.4, { side: -1, rim: [0.85, 0.7, 0.15] }); M.restore(); }
  }
  M.color(blue);
  for (const sx of [-1, 1]) M.boxB('paint', sx * w / 2 - 0.45, sx * w / 2 + 0.45, H, H + 1.3, -L / 2 - 0.5, L / 2 + 0.5, { bevel: 0.05 });
  for (const sz of [-1, 1]) M.boxB('paint', -w / 2, w / 2, H + 0.2, H + 1.1, sz * L / 2 - 0.4, sz * L / 2 + 0.4, { bevel: 0.04 });
  M.color([0.92, 0.75, 0.12]); M.cls = 1;
  for (const sx of [-1, 1]) for (let k = -L / 2 + 1; k < L / 2; k += 2.2) M.boxB('paint', sx * w / 2 - 0.47, sx * w / 2 + 0.47, H + 0.5, H + 0.62, k - 0.5, k + 0.5);
  M.cls = 0; M.color([0.2, 0.2, 0.2]);
  for (const sx of [-1, 1]) for (const z of [-4.5, 4.5]) {
    M.save().move(sx * (w / 2 - 0.6), H - 0.4, z); M.boxB('steel', -0.25, 0.25, 0, 0.4, -0.3, 0.3); M.restore();
    M.cls = 1; M.tube('steel', 0.015, [[sx * (w / 2 - 0.6), H - 0.4, z - 0.15], [sx * (w / 2 - 0.6), 2.6, z - 0.15]], 3); M.tube('steel', 0.015, [[sx * (w / 2 - 0.6), H - 0.4, z + 0.15], [sx * (w / 2 - 0.6), 2.6, z + 0.15]], 3); M.cls = 0;
  }
  M.color([0.12, 0.12, 0.12]); M.cls = 1;
  for (const z of [-4.5, 4.5]) M.tube('canvas', 0.05, sagPath([-w / 2 + 0.6, 2.6, z], [w / 2 - 0.6, 2.6, z], 1.8, 12), 5);
  M.cls = 0;
  M.color([0.95, 0.95, 0.92]); M.boxB('paint', -w / 2 - 0.46, -w / 2 - 0.44, H + 0.15, H + 1.15, -3, 3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.col(sx * w / 2 - 0.6, sx * w / 2 + 0.6, 0, H, sz * L / 2 - 1.1, sz * L / 2 + 1.1, 'metal');
  M.occ(-w / 2 - 0.5, w / 2 + 0.5, H, H + 1.3, -L / 2, L / 2, 0.35);
});
/* Machine à glace en écailles (d'après photos de machines de criée) : pieds, bac à glace en inox à panneaux et trappe, tambour évaporateur
   et son motoréducteur, groupe de condensation à deux ventilateurs grillagés, armoire électrique et voyants, liaisons frigorifiques en cuivre,
   tuyaux qui montent au plafond. Collision : le bloc (2,4 x 1,6 x 2,5 m) */
PF.iceMachine = () => prefab('iceMachine', (M) => {
  M.local(1); const ss = [0.74, 0.77, 0.79];
  M.color([0.3, 0.3, 0.32]); for (const x of [-1.1, 1.1]) for (const z of [-0.7, 0.7]) { M.save().move(x, 0, z); M.cyl('steel', 0.05, 0.35, 8); M.cyl('steel', 0.08, 0.02, 8); M.restore(); }
  M.boxB('steel', -1.2, 1.2, 0.3, 0.38, -0.8, 0.8);
  // bac à glace : panneaux d'inox, couvre-joints, trappe à charnières et poignée
  M.color(ss); M.boxB('steel', -1.2, 1.2, 0.38, 1.6, -0.8, 0.8, { bevel: 0.03 });
  M.color([0.66, 0.69, 0.71]); M.cls = 1;
  for (const x of [-0.6, 0, 0.6]) for (const sd of [-1, 1]) M.boxB('steel', x - 0.015, x + 0.015, 0.4, 1.58, sd * 0.8 - 0.006, sd * 0.8 + 0.006);
  M.boxB('steel', -0.5, 0.5, 0.75, 1.45, 0.8, 0.82, { bevel: 0.01 }); M.color([0.2, 0.2, 0.2]); M.boxB('steel', -0.2, 0.2, 1.32, 1.37, 0.82, 0.86, { bevel: 0.01 });
  for (const x of [-0.42, 0.42]) M.boxB('steel', x - 0.05, x + 0.05, 1.42, 1.47, 0.81, 0.84);
  M.cls = 0;
  // tambour évaporateur (gauche) et motoréducteur
  M.color(ss); M.save().move(-0.6, 1.6, 0); M.cyl('steel', 0.46, 0.7, 20); M.restore();
  M.color([0.62, 0.65, 0.67]); for (const y of [1.62, 2.28]) { M.save().move(-0.6, y, 0); M.cyl('steel', 0.49, 0.03, 20); M.restore(); }
  M.color([0.2, 0.36, 0.62]); M.save().move(-0.6, 2.31, 0); M.boxB('paint', -0.18, 0.18, 0, 0.18, -0.15, 0.15, { bevel: 0.02 }); M.save().move(0, 0.09, 0.15).rotX(Math.PI / 2); M.cyl('paint', 0.08, 0.22, 12); M.restore(); M.restore();
  // groupe de condensation (droite) : caisson bleu, deux ventilateurs en façade (+z)
  M.color([0.35, 0.55, 0.7]); M.boxB('paint', 0.1, 1.15, 1.6, 2.45, -0.7, 0.7, { bevel: 0.04 });
  for (const zc of [-0.3, 0.3]) {
    M.color([0.08, 0.08, 0.09]); M.save().move(0.62, 2.02, 0.705).rotX(Math.PI / 2); M.cyl('dark', 0.28, 0.01, 18); M.restore();
    M.color([0.25, 0.25, 0.27]); M.cls = 1;
    M.save().move(0.62, 2.02, 0.715); for (const r of [0.1, 0.18, 0.27]) M.tube('steel', 0.008, Array.from({ length: 17 }, (_, i) => [Math.cos((i / 16) * TAU) * r, Math.sin((i / 16) * TAU) * r, 0]), 3);
    for (let k = 0; k < 4; k++) { const a = (k / 4) * TAU + 0.4; M.tube('steel', 0.008, [[0, 0, 0], [Math.cos(a) * 0.27, Math.sin(a) * 0.27, 0]], 3); } M.restore();
    M.cls = 0;
    if (zc > 0) break; // un seul ventilateur en façade, l'autre sur le flanc
  }
  M.color([0.08, 0.08, 0.09]); M.save().move(1.155, 2.02, 0).rotZ(Math.PI / 2); M.cyl('dark', 0.26, 0.01, 18); M.restore();
  // armoire électrique et voyants (flanc +x du bac)
  M.color([0.82, 0.82, 0.8]); M.boxB('paint', 1.2, 1.32, 0.7, 1.4, -0.35, 0.25, { bevel: 0.02 });
  M.color([0.1, 0.8, 0.2]); M.save().move(1.33, 1.2, 0.1).rotZ(-Math.PI / 2); M.cyl('plastic', 0.025, 0.02, 8); M.restore();
  M.color([0.85, 0.25, 0.1]); M.save().move(1.33, 1.2, -0.05).rotZ(-Math.PI / 2); M.cyl('plastic', 0.025, 0.02, 8); M.restore();
  // liaisons en cuivre, tuyaux vers le plafond
  M.color([0.72, 0.42, 0.25]); M.cls = 1;
  M.tube('steel', 0.022, [[0.1, 2.1, -0.4], [-0.14, 2.1, -0.4], [-0.14, 1.95, -0.4]], 5); M.tube('steel', 0.016, [[0.1, 1.9, -0.5], [-0.14, 1.9, -0.5], [-0.14, 1.8, -0.5]], 5);
  M.color([0.55, 0.55, 0.55]);
  for (const x of [-0.8, -0.3, 0.2, 0.7]) M.tube('steel', 0.05, [[x, 2.5, -0.55], [x, 3.2, -0.55], [x, 3.2, -1.2]], 6);
  M.cls = 0;
  M.col(-1.2, 1.2, 0, 2.5, -0.8, 0.8, 'metal');
});
/* Étal de criée (2,4 x 1,1 m) : table inox sur tréteaux, lit de glace et poissons, ardoise de prix ou balance */
PF.etal = (seed = 1) => prefab('etal' + seed, (M) => {
  const R = rngOf(seed * 19 + 1), w = 2.4, d = 1.1, y = 0.86;
  M.local(1); M.color([0.78, 0.8, 0.82]);
  M.boxB('steel', -w / 2, w / 2, y - 0.05, y, -d / 2, d / 2, { bevel: 0.01 });
  for (const s of [-1, 1]) { M.boxB('steel', -w / 2, w / 2, y, y + 0.1, s * d / 2 - 0.02 * s - 0.01, s * d / 2 + 0.01 - 0.02 * s); M.boxB('steel', s * w / 2 - 0.02, s * w / 2 + 0.01 * s, y, y + 0.1, -d / 2, d / 2); }
  M.color([0.55, 0.57, 0.6]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.boxB('steel', sx * (w / 2 - 0.12) - 0.03, sx * (w / 2 - 0.12) + 0.03, 0, y - 0.05, sz * (d / 2 - 0.1) - 0.03, sz * (d / 2 - 0.1) + 0.03);
  M.boxB('steel', -w / 2 + 0.1, w / 2 - 0.1, 0.18, 0.22, -d / 2 + 0.1, d / 2 - 0.1);
  M.save().move(0, y - 0.04, 0); fishIce(M, w / 2 - 0.06, d / 2 - 0.05, 0.16, rngOf(seed * 13 + 3)); fishPile(M, w / 2 - 0.06, d / 2 - 0.05, 0.16, seed, true); M.restore();
  // cagettes sous la table, ardoise ou balance
  if (R() < 0.7) { M.save().move((R() - 0.5) * 1.2, 0.22, 0).rotY(R() * 0.3); M.dyn('fishBin', 0, 0, 0, 0, { tint: R.pick([[0.15, 0.36, 0.72], [0.95, 0.5, 0.08], [0.85, 0.85, 0.82]]) }); M.restore(); }
  if (R() < 0.6) {
    // ardoise des prix plantée dans la glace, face au client (-z)
    const x = R() < 0.5 ? -0.7 : 0.7;
    M.save().move(x, y + 0.1, -d / 2 + 0.12).rotX(0.2); M.color([0.4, 0.3, 0.2]); M.boxB('wood', -0.025, 0.025, -0.1, 0.05, 0.01, 0.04); M.restore();
    M.save().move(x, y + 0.12, -d / 2 + 0.1).rotX(0.2); decal3Quad(M, DEC3.prix, [0.25, 0, -0.005], [-0.25, 0, -0.005], [-0.25, 0.42, -0.005], [0.25, 0.42, -0.005], [0, 0, -1], [0.06, 0.03, 0.88, 0.94]); M.restore();
  } else {
    M.save().move(R.range(-0.7, 0.7), y + 0.1, -d / 2 + 0.25); M.color([0.85, 0.85, 0.82]); M.boxB('plastic', -0.18, 0.18, 0, 0.12, -0.15, 0.15, { bevel: 0.02 }); M.color([0.75, 0.77, 0.8]); M.boxB('steel', -0.16, 0.16, 0.12, 0.14, -0.14, 0.14); M.color([0.1, 0.3, 0.12]); M.boxB('glass', -0.08, 0.08, 0.04, 0.1, -0.151, -0.15); M.restore();
  }
  // collisions : plateau et rebords, pieds, tablette réservée aux objets (la cagette s'y pose et réagit aux tirs ; dans un bloc plein
  // jusqu'au plateau, elle était prise dans la table)
  M.col(-w / 2, w / 2, y - 0.05, y + 0.1, -d / 2, d / 2, 'metal');
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.col(sx * (w / 2 - 0.12) - 0.03, sx * (w / 2 - 0.12) + 0.03, 0, y - 0.05, sz * (d / 2 - 0.1) - 0.03, sz * (d / 2 - 0.1) + 0.03, 'metal');
  M.pcol(-w / 2 + 0.1, w / 2 - 0.1, 0.18, 0.22, -d / 2 + 0.1, d / 2 - 0.1);
});
/* Cadran des ventes : caisson lumineux suspendu, deux faces (repère : centre du caisson) */
PF.cadran = () => prefab('cadran', (M) => {
  M.local(1); M.color([0.12, 0.12, 0.13]);
  M.boxB('steel', -1.6, 1.6, -1.0, 1.0, -0.25, 0.25, { bevel: 0.03 });
  for (const sd of [-1, 1]) { M.save().rotY(sd > 0 ? 0 : Math.PI); decal3Quad(M, DEC3.cadran, [-1.45, -0.9, 0.26], [1.45, -0.9, 0.26], [1.45, 0.9, 0.26], [-1.45, 0.9, 0.26], [0, 0, 1], [0.03, 0.03, 0.94, 0.94], 'screen'); M.restore(); }
  M.color([0.2, 0.2, 0.2]); M.cls = 1;
  for (const x of [-1.3, 1.3]) M.tube('steel', 0.01, [[x, 1.0, 0], [x, 4.0, 0]], 3);
});
/* Tapis de vente (convoyeur à bande de criée, d'après photos) de longueur L le long de x, hauteur 0,9 m : longerons en U, tambours aux deux
   bouts, bande dessus et brin de retour dessous, pieds réglables entretoisés, garde-corps bas le long de la bande, motoréducteur au bout +x ;
   bacs de poisson posés dessus */
PF.conveyor = (L = 10) => prefab('conveyor' + L, (M) => {
  M.local(1); M.color([0.7, 0.72, 0.74]);
  for (const s of [-1, 1]) { M.boxB('steel', -L / 2, L / 2, 0.7, 0.9, s * 0.42 - 0.04, s * 0.42 + 0.04); M.boxB('steel', -L / 2, L / 2, 0.88, 0.9, s * 0.42 - (s > 0 ? 0.06 : -0.02), s * 0.42 + (s > 0 ? -0.02 : 0.06)); }
  const legs = []; for (let x = -L / 2 + 0.3; x < L / 2; x += 1.4) legs.push(x);
  for (const x of legs) { for (const s of [-1, 1]) { M.boxB('steel', x - 0.035, x + 0.035, 0.03, 0.7, s * 0.38 - 0.03, s * 0.38 + 0.03); M.boxB('steel', x - 0.06, x + 0.06, 0, 0.03, s * 0.38 - 0.06, s * 0.38 + 0.06); } M.boxB('steel', x - 0.025, x + 0.025, 0.22, 0.27, -0.38, 0.38); }
  M.cls = 1; for (const s of [-1, 1]) { M.tube('steel', 0.015, [[-L / 2 + 0.1, 1.0, s * 0.43], [L / 2 - 0.1, 1.0, s * 0.43]], 5); for (const x of legs) M.tube('steel', 0.012, [[x, 0.9, s * 0.43], [x, 1.0, s * 0.43]], 4); } M.cls = 0;
  M.color([0.6, 0.62, 0.64]); for (const x of [-L / 2 + 0.06, L / 2 - 0.06]) { M.save().move(x, 0.8, -0.4).rotX(Math.PI / 2); M.cyl('steel', 0.065, 0.8, 14); M.restore(); }
  M.color([0.16, 0.17, 0.18]); M.boxB('rubber', -L / 2 + 0.06, L / 2 - 0.06, 0.84, 0.866, -0.38, 0.38); M.boxB('rubber', -L / 2 + 0.06, L / 2 - 0.06, 0.73, 0.746, -0.38, 0.38);
  M.color([0.2, 0.36, 0.62]); M.save().move(L / 2 - 0.25, 0.55, 0.42); M.boxB('paint', -0.16, 0.16, -0.14, 0.14, 0, 0.22, { bevel: 0.02 }); M.save().move(0, 0, 0.22).rotX(Math.PI / 2); M.cyl('paint', 0.1, 0.26, 12); M.restore(); M.restore();
  const R = rngOf(L * 7);
  for (let x = -L / 2 + 0.7; x < L / 2 - 0.5; x += 1.1 + R() * 0.8) { M.save().move(x, 0.866, 0).rotY(Math.PI / 2 + (R() - 0.5) * 0.2); M.put(PF.fishBinStackDyn(1, Math.floor(R() * 4))); M.restore(); }
  M.col(-L / 2, L / 2, 0, 0.9, -0.46, 0.46, 'metal');
});
/* Chambre froide en panneaux isolants (d'après photos) : panneaux blancs à joints verticaux sur les quatre faces, cornières d'aluminium
   aux arêtes, porte coulissante à joint et poignée, rail, plinthe d'inox, afficheur de température, groupe de condensation sur le toit avec
   son ventilateur grillagé et ses liaisons ; w (x), d (z), h ; porte face +z */
PF.coldRoom = (w = 4, d = 3, h = 3) => prefab(`coldRoom${w}_${d}_${h}`, (M) => {
  M.local(1); M.color([0.9, 0.91, 0.9]); M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(0, 0.8, y));
  M.boxB('paint', -w / 2, w / 2, 0, h, -d / 2, d / 2, { bevel: 0.03 }); M.aoFn = null;
  M.color([0.74, 0.76, 0.77]); M.cls = 1;
  for (let x = -w / 2 + 1.0; x < w / 2 - 0.05; x += 1.0) for (const sd of [-1, 1]) M.boxB('paint', x - 0.008, x + 0.008, 0.02, h - 0.02, sd * d / 2 - 0.004, sd * d / 2 + 0.006);
  for (let z = -d / 2 + 1.0; z < d / 2 - 0.05; z += 1.0) for (const sd of [-1, 1]) M.boxB('paint', sd * w / 2 - 0.004, sd * w / 2 + 0.006, 0.02, h - 0.02, z - 0.008, z + 0.008);
  M.color([0.78, 0.8, 0.82]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.boxB('steel', sx * w / 2 - 0.04, sx * w / 2 + 0.04, 0, h + 0.01, sz * d / 2 - 0.04, sz * d / 2 + 0.04);
  for (const sz of [-1, 1]) M.boxB('steel', -w / 2 - 0.04, w / 2 + 0.04, h - 0.03, h + 0.02, sz * d / 2 - 0.04, sz * d / 2 + 0.04);
  for (const sx of [-1, 1]) M.boxB('steel', sx * w / 2 - 0.04, sx * w / 2 + 0.04, h - 0.03, h + 0.02, -d / 2, d / 2);
  M.boxB('steel', -w / 2 - 0.01, w / 2 + 0.01, 0, 0.15, d / 2, d / 2 + 0.008); // plinthe d'inox
  M.cls = 0;
  // porte coulissante (entrouverte vers -x), joint, poignée, rail
  M.color([0.82, 0.84, 0.85]); M.boxB('paint', -0.95, 0.45, 0.02, 2.3, d / 2 + 0.02, d / 2 + 0.11, { bevel: 0.02 });
  M.color([0.2, 0.2, 0.2]); M.boxB('rubber', -0.97, 0.47, 0.02, 2.32, d / 2 + 0.01, d / 2 + 0.03);
  M.color([0.7, 0.72, 0.74]); M.boxB('steel', 0.3, 0.36, 0.9, 1.45, d / 2 + 0.11, d / 2 + 0.16, { bevel: 0.01 });
  M.color([0.18, 0.18, 0.2]); M.boxB('steel', -1.7, 1.2, 2.35, 2.45, d / 2 + 0.02, d / 2 + 0.12);
  M.color([0.04, 0.05, 0.05]); M.boxB('dark', 0.75, 0.95, 1.6, 1.72, d / 2 + 0.008, d / 2 + 0.03); M.color([0.95, 0.2, 0.1]); M.boxB('paint', 0.78, 0.92, 1.63, 1.69, d / 2 + 0.031, d / 2 + 0.034); // afficheur
  // groupe de condensation sur le toit
  const ux0 = -w / 2 + 0.3, ux1 = -w / 2 + 1.5;
  M.color([0.55, 0.58, 0.6]); M.boxB('steel', ux0, ux1, h, h + 0.6, -0.5, 0.5, { bevel: 0.03 });
  M.color([0.08, 0.08, 0.09]); M.save().move((ux0 + ux1) / 2, h + 0.601, 0); M.cyl('dark', 0.3, 0.005, 18); M.restore();
  M.color([0.3, 0.3, 0.32]); M.cls = 1; M.save().move((ux0 + ux1) / 2, h + 0.61, 0); for (const r of [0.12, 0.21, 0.3]) M.tube('steel', 0.008, Array.from({ length: 17 }, (_, i) => [Math.cos((i / 16) * TAU) * r, 0, Math.sin((i / 16) * TAU) * r]), 3); M.restore();
  M.color([0.72, 0.42, 0.25]); M.tube('steel', 0.02, [[ux1, h + 0.2, 0.3], [ux1 + 0.4, h + 0.2, 0.3], [ux1 + 0.4, h + 0.02, 0.3]], 5); M.cls = 0;
  M.col(-w / 2, w / 2, 0, h, -d / 2, d / 2, 'metal');
});
/* Palette de sacs de glace (filmée) */
PF.icePallet = () => prefab('icePallet', (M) => {
  M.place(PF.pallet(), 0, 0, 0, 0);
  M.local(1); M.color([0.88, 0.93, 0.96]);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) for (let k = 0; k < 2; k++) M.boxB('plastic', -0.58 + i * 0.6, -0.02 + i * 0.6, 0.13 + j * 0.25, 0.36 + j * 0.25, -0.38 + k * 0.39, -0.01 + k * 0.39, { bevel: 0.06 });
  M.col(-0.6, 0.6, 0, 0.9, -0.4, 0.4, 'dirt');
});

/* ---------- Architecture bretonne ---------- */
var PAL_BZH = {
  wash: [[0.95, 0.94, 0.9], [0.93, 0.9, 0.84], [0.9, 0.9, 0.88], [0.96, 0.93, 0.86]],
  // la photo de pierre est un grès chaud : le granite breton demande une teinte plus froide et plus sombre
  granite: [[0.6, 0.63, 0.66], [0.56, 0.58, 0.6], [0.64, 0.64, 0.64]],
  shutter: [[0.18, 0.36, 0.55], [0.2, 0.45, 0.42], [0.62, 0.16, 0.12], [0.3, 0.5, 0.65], [0.86, 0.84, 0.78]],
  door: [[0.16, 0.3, 0.5], [0.55, 0.15, 0.12], [0.2, 0.42, 0.36], [0.32, 0.24, 0.18]],
};
/* Toit d'ardoise à deux pans sur le bloc [x0, x1] x [z0, z1], égout à y : faîtage en lignolet, rives, pignons de granit
   montés en cheminées, lucarnes côté face (o.dormers : façade 'n','s','e','w'). o : alongX, pitch, R, gable (teinte des
   pignons), dormers, chimneys (0, 1 ou 2) */
function slateRoof(x0, x1, z0, z1, y, o = {}) {
  const M = DECOR, alongX = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0, span = alongX ? z1 - z0 : x1 - x0, len = alongX ? x1 - x0 : z1 - z0;
  const R = o.R || rngOf(Math.round(x0 * 7 + z0 * 13 + y)), pitch = o.pitch || 0.82, tn = Math.tan(pitch), rise = (span / 2) * tn, ov = 0.25, drop = ov * tn;
  const hs = span / 2 + ov, nl = hyp(hs, rise + drop), tint = o.tint || [0.62, 0.64, 0.7], gt = o.gable || R.pick(PAL_BZH.granite), mat = o.mat || 'slate';
  M.save();
  if (alongX) M.move(x0, y, (z0 + z1) / 2); else M.move((x0 + x1) / 2, y, z1).rotY(Math.PI / 2);
  for (const s of [1, -1]) {
    M.color(tint).world(1);
    M.quad(mat, [-0.06, -drop, s * hs], [len + 0.06, -drop, s * hs], [len + 0.06, rise, 0], [-0.06, rise, 0], [0, hs / nl, (s * (rise + drop)) / nl]);
    M.color([0.3, 0.3, 0.32]).local(1); M.quad(mat, [-0.06, -drop - 0.04, s * hs], [len + 0.06, -drop - 0.04, s * hs], [len + 0.06, rise - 0.04, 0], [-0.06, rise - 0.04, 0], [0, -1, 0]);
    // gouttière de zinc
    M.color([0.6, 0.62, 0.64]); M.cls = 1;
    M.save().move(-0.06, -drop - 0.06, s * (hs + 0.06)).rotZ(-Math.PI / 2); M.cyl('steel', 0.06, len + 0.12, 8, { a0: -Math.PI / 2, a1: Math.PI / 2, caps: '' }); M.restore();
    M.cls = 0;
  }
  // faîtage (lignolet d'ardoise)
  M.color(tint.map((c) => c * 0.8)).local(1); M.save().move(-0.06, rise + 0.02, 0).rotZ(-Math.PI / 2); M.cyl(mat, 0.07, len + 0.12, 6, { a0: Math.PI / 2, a1: Math.PI * 1.5 }); M.restore();
  // pignons de granit qui dépassent légèrement (rampants), cheminées massives
  M.color(gt).world(1);
  for (const [xx, dir] of [[0, -1], [len, 1]]) {
    M.tri3(o.gableMat || 'stone', [xx, 0, -span / 2], [xx, 0, span / 2], [xx, rise, 0], [dir, 0, 0]);
    if (o.rampants !== false) for (const s of [1, -1]) { const dy = rise + drop, dz = -s * hs, L = hyp(dy, dz); M.save().move(xx - dir * 0.12, (rise - drop) / 2 + 0.07, (s * hs) / 2).rotX(Math.atan2(-dy, dz)); M.box('stone', 0.4, 0.16, L); M.restore(); }
  }
  const nc = o.chimneys !== undefined ? o.chimneys : 2;
  for (const [k, xx] of [[0, 0.3], [1, len - 0.3]]) if (k < nc) {
    M.color(gt).world(1); M.boxB('stone', xx - 0.45, xx + 0.45, rise - 0.6, rise + 1.15, -0.5, 0.5);
    M.color([0.66, 0.64, 0.6]).local(1); M.boxB('stone', xx - 0.5, xx + 0.5, rise + 1.15, rise + 1.25, -0.55, 0.55, { bevel: 0.02 });
    M.color([0.62, 0.36, 0.26]); for (const zz of [-0.22, 0.22]) { M.save().move(xx, rise + 1.25, zz); M.cyl('rooftiles', 0.1, 0.35, 8, { r1: 0.08 }); M.restore(); }
  }
  // lucarnes sur le pan avant (s = 1 : vers +z du repère du toit)
  for (const [s, n] of o.dormers || []) for (let i = 0; i < n; i++) {
    const xc = len * (i + 0.5) / n, zf = s * span * 0.5 * 0.7, yb = (span / 2 - Math.abs(zf)) * tn, w = 1.1, hh = 1.35;
    M.save().move(xc, 0, zf).rotY(s > 0 ? 0 : Math.PI);
    M.color(R.pick(PAL_BZH.wash)).world(1); M.boxB('plaster', -w / 2, w / 2, yb - 0.3, yb + hh, -1.6, 0, { skip: 'z' });
    // châssis en saillie de 1,5 cm et vitre devant lui : au ras de la façade, le châssis scintillait avec l'enduit et la vitre, derrière, ne se voyait pas
    M.local(1); M.color([0.92, 0.92, 0.9]); M.boxB('paintwood', -w / 2 + 0.12, w / 2 - 0.12, yb + 0.1, yb + hh - 0.15, -0.06, 0.015);
    M.color([0.3, 0.36, 0.42]); M.boxB('glass', -w / 2 + 0.18, w / 2 - 0.18, yb + 0.16, yb + hh - 0.21, 0.015, 0.025, { skip: 'z' });
    M.color(tint); const pr = 0.62;
    for (const sd of [-1, 1]) M.quad('slate', [sd * (w / 2 + 0.12), yb + hh, 0.12], [0, yb + hh + pr, 0.12], [0, yb + hh + pr, -1.8], [sd * (w / 2 + 0.12), yb + hh, -1.8], [sd * pr, w / 2 + 0.12, 0]);
    M.color(R.pick(PAL_BZH.wash)); M.tri3('plaster', [-w / 2, yb + hh, 0.0], [w / 2, yb + hh, 0.0], [0, yb + hh + pr - 0.05, 0.0], [0, 0, 1]);
    M.restore();
  }
  M.occ(-ov, len + ov, -drop, rise * 0.6, -hs, hs, 1);
  M.col(0, len, 0, rise * 0.55, -span / 2 + 0.3, span / 2 - 0.3, 'concrete');
  M.restore();
  return { rise, span, len };
}
/* Maison de pêcheur : bloc plein (collision), façades détaillées sur o.faces (rez de granit ou enduit, porte, fenêtres
   à petits bois et volets, linteaux et appuis de granit), toit d'ardoise à lucarnes. o : h (égout), floors, faces,
   door (côté de la porte), shop (vitrine au rez : index d'enseigne SIGNS3), tint, stone (rez de granit), R */
function portHouse(x0, x1, z0, z1, o = {}) {
  const R = o.R || rngOf(Math.round(x0 * 71 + z0 * 137) + 515), h = o.h || 6.2, faces = o.faces || 'nsew';
  const tint = o.tint || R.pick(PAL_BZH.wash), granite = R.pick(PAL_BZH.granite), shut = o.shutter || R.pick(PAL_BZH.shutter);
  const alongX = o.alongX !== undefined ? o.alongX : x1 - x0 >= z1 - z0, stone = o.stone !== undefined ? o.stone : R() < 0.5, g0 = o.g0 || 0;
  // g0 : rez-de-chaussée praticable construit à part (le bloc et ses façades ne commencent qu'à l'étage)
  DECOR.col(x0, x1, g0, h, z0, z1, 'concrete');
  for (const f of 'nsew') {
    const F = facadeFrame(f, x0, x1, z0, z1), len = F.len, det = faces.indexOf(f) >= 0;
    const gableSide = alongX ? f === 'e' || f === 'w' : f === 'n' || f === 's';
    inFrame(F, (M) => {
      if (!det) { M.save().color(stone && !g0 ? granite : tint).world(1).move(0, g0, 0); M.wall(stone && !g0 ? 'stone' : 'plaster', len, h - g0, []); M.restore(); return; }
      const bays = Math.max(1, Math.round(len / 2.6)), bw = len / bays, mid = Math.floor(bays / 2), ops0 = [], ops1 = [], after = [];
      for (let i = 0; i < bays && !g0; i++) {
        const a = bw * (i + 0.5);
        if (o.shop !== undefined && o.door === f && i !== mid) { const op = { x0: a - bw * 0.4, x1: a + bw * 0.4, y0: 0.45, y1: 2.5, depth: 0.25 }; ops0.push(op); after.push((MM) => { windowJoinery(MM, op, 0.25, [0.2, 0.3, 0.42], { glass: 'glassLit' }); }); continue; }
        // une porte dans une zone NO_DOOR (un camion, un conteneur, une maison devant) : mur plein, mêmes tirages
        if (o.door === f && i === mid && NO_DOOR.some((q) => { const wx = F.ox + a * Math.cos(F.rot), wz = F.oz - a * Math.sin(F.rot); return wx > q[0] && wx < q[1] && wz > q[2] && wz < q[3]; })) { R.pick(PAL_BZH.door); after.push(() => { R(); }); continue; }
        if (o.door === f && i === mid) { const op = { x0: a - 0.55, x1: a + 0.55, y0: 0, y1: 2.3, depth: 0.28 }; ops0.push(op); const dt = R.pick(PAL_BZH.door); after.push((MM) => { panelDoor(MM, op, 0.28, dt, {}); lintel(MM, op, 'stone', granite); if (R() < 0.7) wallLamp(MM, a + 0.95, 2.4); }); continue; }
        if (gableSide && R() < 0.5) continue;
        const op = { x0: a - 0.45, x1: a + 0.45, y0: 0.95, y1: 2.25, depth: 0.28 }; ops0.push(op);
        const st = R() < 0.25 ? 'closed' : 'open', lit = R() < 0.3;
        after.push((MM) => { if (st !== 'closed') windowJoinery(MM, op, 0.28, [0.94, 0.94, 0.92], { glass: lit ? 'glassLit' : 'glass', curtain: R() < 0.5 ? R.pick([[0.9, 0.88, 0.82], [0.75, 0.2, 0.15]]) : null }); sill(MM, op, 'stone', granite); lintel(MM, op, 'stone', granite); shutters(MM, op, shut, st, R); });
      }
      for (let fy = 3.1; fy + 1.5 <= h - 0.2; fy += 2.8) for (let i = 0; i < bays; i++) {
        if (gableSide && R() < 0.45) continue;
        const a = bw * (i + 0.5), op = { x0: a - 0.42, x1: a + 0.42, y0: fy + 0.65, y1: fy + 1.95, depth: 0.25 }; ops1.push(op);
        const st = R() < 0.2 ? 'closed' : 'open', lit = R() < 0.3;
        after.push((MM) => { if (st !== 'closed') windowJoinery(MM, op, 0.25, [0.94, 0.94, 0.92], { glass: lit ? 'glassLit' : 'glass' }); sill(MM, op, 'stone', granite); shutters(MM, op, shut, st, R); });
      }
      const gf = 3.0;
      if (!g0) { M.save().color(stone ? granite : tint).world(1); M.aoFn = (x, y) => lerp(0.7, 1, smoothstep(0, 1.2, y)); wallPierced(M, stone ? 'stone' : 'plaster', len, 0, gf, ops0, { depth: 0.25, back: true }); M.restore(); }
      M.save().color(tint).world(1);
      wallPierced(M, 'plaster', len, Math.max(gf, g0), h - Math.max(gf, g0), ops1, { depth: 0.25, back: true });
      M.restore();
      // chaînes d'angle en granit, bandeau, soubassement
      M.save().color(granite).world(1);
      for (const x of [0, len]) for (let y = g0, k = 0; y < h - 0.2; y += 0.5, k++) { const w = k % 2 ? 0.32 : 0.55; lbox(M, 'stone', x === 0 ? -0.02 : len - w, x === 0 ? w : len + 0.02, y, y + 0.46, 0, 0.05); }
      if (!stone && !g0) { let cur = 0; for (const p of ops0.filter((q) => q.y0 < 0.6)) { if (p.x0 - cur > 0.05) plinthSeg(M, cur, p.x0, { mat: 'stone', h: 0.6, tint: granite }); cur = p.x1; } if (len - cur > 0.05) plinthSeg(M, cur, len, { mat: 'stone', h: 0.6, tint: granite }); }
      M.restore();
      for (const fn of after) fn(M);
      if (o.shop !== undefined && o.door === f && !g0) sign3Board(M, len / 2, 2.65, Math.min(len - 0.6, 4.2), 0.75, o.shop, [0.2, 0.2, 0.22]);
      if (len > 5 && R() < 0.6) drainPipe(M, R() < 0.5 ? 0.3 : len - 0.3, h - 0.1);
    });
  }
  // lucarnes sur les pans tournés vers une façade détaillée (repère du toit : +z local vers le sud, ou vers l'est si le faîtage suit z)
  const dorm = o.dormers !== false ? [...faces].filter((f) => (alongX ? f === 'n' || f === 's' : f === 'e' || f === 'w')).map((f) => [alongX ? (f === 's' ? 1 : -1) : (f === 'e' ? 1 : -1), Math.max(1, Math.round((alongX ? x1 - x0 : z1 - z0) / 4.5))]) : [];
  slateRoof(x0, x1, z0, z1, h, { alongX, R, gable: granite, dormers: dorm, chimneys: o.chimneys });
}
/* Phare à l'extrémité d'une digue : tour tronconique blanche à bande rouge (ou verte), galerie, lanterne */
function lighthouse(x, z, h = 16, band = [0.78, 0.12, 0.1], y0 = 0) {
  const M = DECOR;
  M.save().move(x, y0, z).local(1);
  M.color([0.95, 0.95, 0.92]); M.cyl('plaster', 2.0, h, 18, { r1: 1.4, caps: '' });
  M.color(band); M.save().move(0, h * 0.62, 0); M.cyl('paint', 1.62, h * 0.22, 18, { r1: 1.5, caps: '' }); M.restore();
  M.color([0.2, 0.2, 0.22]); M.save().move(0, h, 0); M.cyl('steel', 2.0, 0.25, 18); M.restore();
  M.color([0.25, 0.25, 0.27]); M.save().move(0, h + 0.25, 0); M.cyl('steel', 1.0, 1.6, 12, { caps: '' }); M.restore();
  M.color([3.0, 2.4, 1.4]); M.save().move(0, h + 0.5, 0); M.cyl('lamp', 0.7, 1.0, 10); M.restore();
  M.color(band); M.save().move(0, h + 1.85, 0); M.lathe('paint', [[0, 0], [1.15, 0], [0.9, 0.5], [0.15, 1.1], [0, 1.2]], 12); M.restore();
  M.color([0.2, 0.2, 0.2]); M.cls = 1; M.save().move(0, h + 0.25, 0); for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; M.save().move(Math.cos(a) * 1.9, 0, Math.sin(a) * 1.9); M.cyl('steel', 0.02, 0.9, 4); M.restore(); } M.restore();
  M.restore();
}

}catch(e){HOOKS.missing['02l-port.js']=String(e&&e.message||e)}
/* ===== 02ye-cyclades-deco.js ===== */
try{
/* ==========================================================================
   KIT CYCLADIQUE (4/4) : le décor. Arbres méditerranéens (olivier, cyprès, tamaris, figuier, platane), plantes en cartes
   découpées (agave, figuier de Barbarie, géraniums, lavande, vigne, jasmin, bougainvillée), pots, tonnelles à toit de
   roseaux, caïques (à flot ou à terre sur leur ber), étendage de poulpes, kiosque, puits, drapeau, chats.
   Les feuillages sont des cartes de l'atlas de la carte (matière cyfol, voir 02yb).
   ========================================================================== */
var _cyA = [0, 0, 0], _cyB = [0, 0, 0];
/* Carte de feuillage orientée au hasard autour du point c : côté s, région reg de l'atlas, inclinaison de 0 (à plat) à tau (debout) */
function cyPatch(M, c, s, reg, R, tint, o = {}) {
  const psi0 = R() * TAU, psi = o.psi !== undefined ? o.psi : psi0, tau = o.tilt !== undefined ? o.tilt : R() * 1.1, h = s / 2, sp = Math.sin(psi), cp = Math.cos(psi), st = Math.sin(tau), ct = Math.cos(tau);
  const a = _cyA, b = _cyB; a[0] = cp; a[1] = 0; a[2] = sp; b[0] = -sp * st; b[1] = ct; b[2] = cp * st;
  const P = (u, v) => [c[0] + (a[0] * u + b[0] * v) * h, c[1] + (a[1] * u + b[1] * v) * h, c[2] + (a[2] * u + b[2] * v) * h];
  M.color(tint || [1, 1, 1]);
  foliageQuad(M, P(-1, -1), P(1, -1), P(1, 1), P(-1, 1), reg, o.up !== undefined ? o.up : 0.7, 'cyfol');
}
/* Touffe de cartes croisées (n plans verticaux autour de l'axe) : largeur w, hauteur h, base y0 */
function cyCard(M, reg, w, h, y0 = 0, n = 3, flare = 0.1) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI + 0.3, c = Math.cos(a) * w / 2, s = Math.sin(a) * w / 2, fc = Math.cos(a) * flare, fs = Math.sin(a) * flare;
    foliageQuad(M, [-c, y0, -s], [c, y0, s], [c + fc, y0 + h, s + fs], [-c - fc, y0 + h, -s - fs], reg, 0.6, 'cyfol');
  }
}
/* Nuage de cartes dans un ellipsoïde (cx, cy, cz, rx, ry, rz) : n cartes de côté s */
function cyCanopy(M, cx, cy, cz, rx, ry, rz, n, s, reg, R, tints, o = {}) {
  for (let i = 0; i < n; i++) {
    let x, y, z; do { x = R.range(-1, 1); y = R.range(-1, 1); z = R.range(-1, 1); } while (x * x + y * y + z * z > 1);
    cyPatch(M, [cx + x * rx, cy + y * ry, cz + z * rz], s * R.range(0.85, 1.2), reg, R, R.pick(tints), o);
  }
}
var CY_GREENS = { olive: [[0.92, 0.98, 0.9], [0.86, 0.95, 0.84], [1, 1, 0.96]], dark: [[0.8, 0.92, 0.8], [0.7, 0.85, 0.72], [0.88, 0.98, 0.86]], fig: [[0.95, 1, 0.85], [0.85, 0.98, 0.78], [1, 1, 0.9]] };

/* ---------- Arbres ---------- */
/* Olivier : tronc noueux qui se divise en trois charpentières, couronne argentée en trois masses */
PF.cyOlive = (h = 4.4, seed = 1) => prefab(`cyOlive${h}_${seed}`, (M) => {
  const R = rngOf(seed * 13 + 5), n = 3;
  M.color([0.5, 0.45, 0.4]).local(1); M.aoFn = (x, y) => lerp(0.65, 1, smoothstep(0, 1.2, y));
  const tips = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + R() * 0.8, lean = R.range(0.5, 1.1), path = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8; path.push([Math.cos(a) * lean * t * t * 1.4 + Math.sin(t * 6 + i) * 0.12, t * h * 0.82, Math.sin(a) * lean * t * t * 1.4 + Math.cos(t * 5 + i) * 0.12]); }
    M.sweep('wood', circleShape(1, 7), path, { scale: (t) => lerp(0.3, 0.09, t) * (1 + 0.1 * Math.sin(t * 11 + i)), uAround: 0.6 });
    tips.push(path[8]);
  }
  M.aoFn = null; M.swFn = swCrown(0, 0, h * 0.5, h + 0.8, 2.8, 0.75);
  M.save().move(0, -0.05, 0); M.cyl('wood', 0.36, 0.5, 9, { r1: 0.3 }); M.restore();
  for (const t of tips) cyCanopy(M, t[0], t[1] + 0.3, t[2], 1.5, 0.95, 1.5, 34, 1.15, CYF.olive, R, CY_GREENS.olive);
  cyCanopy(M, 0, h * 0.78, 0, 1.4, 0.8, 1.4, 20, 1.1, CYF.olive, R, CY_GREENS.olive);
  M.col(-0.3, 0.3, 0, h * 0.6, -0.3, 0.3, 'wood');
  M.occ(-2.4, 2.4, h * 0.6, h + 0.8, -2.4, 2.4, 0.35);
});
/* Cyprès : flamme sombre et serrée */
PF.cyCypress = (h = 8, seed = 1) => prefab(`cyCypress${h}_${seed}`, (M) => {
  const R = rngOf(seed * 7 + 3), rmax = h * 0.1;
  M.swFn = swHeight(0.5, h, 1.8, 0.9); // la flamme plie par la cime
  M.color([0.34, 0.3, 0.26]).local(1); M.save().move(0, 0, 0); M.cyl('wood', 0.22, 1.2, 7, { r1: 0.12 }); M.restore();
  for (let i = 0; i < Math.round(h * 15); i++) {
    const y = R.range(0.5, h * 0.98), t = y / h, r = rmax * Math.sin(Math.PI * Math.pow(t, 0.8)) * Math.sqrt(R()), a = R() * TAU;
    cyPatch(M, [Math.cos(a) * r, y, Math.sin(a) * r], R.range(0.85, 1.3), CYF.cypress, R, R.pick(CY_GREENS.dark), { tilt: R.range(0.5, 1.4) });
  }
  M.col(-0.28, 0.28, 0, h * 0.5, -0.28, 0.28, 'wood');
  M.occ(-rmax, rmax, 0.5, h, -rmax, rmax, 0.4);
});
/* Tamaris : tronc clair et tordu, longs plumeaux bleu-vert retombants */
PF.cyTamarisk = (h = 3.8, seed = 1) => prefab(`cyTamarisk${h}_${seed}`, (M) => {
  const R = rngOf(seed * 11 + 1), path = [];
  for (let k = 0; k <= 7; k++) { const t = k / 7; path.push([Math.sin(t * 4 + seed) * 0.28 * t, t * h * 0.7, Math.cos(t * 3 + seed) * 0.22 * t]); }
  M.color([0.66, 0.58, 0.5]).local(1); M.sweep('wood', circleShape(1, 7), path, { scale: (t) => lerp(0.2, 0.07, t), uAround: 0.6 });
  // trois branches maîtresses qui portent des touffes de plumeaux
  const top = path[path.length - 1], tufts = [];
  M.swFn = swCrown(top[0], top[2], h * 0.45, h, h * 0.45, 1); // plumeaux légers : ils battent plus que les autres feuillages
  for (let b = 0; b < 3; b++) {
    const a = b * 2.1 + seed, P2 = [], reach = h * 0.34;
    for (let k = 0; k <= 4; k++) { const t = k / 4; P2.push([top[0] * (1 - t * 0.2) + Math.cos(a) * reach * t, top[1] - h * 0.12 + t * h * 0.16, top[2] * (1 - t * 0.2) + Math.sin(a) * reach * t]); }
    M.sweep('wood', circleShape(1, 6), P2, { scale: (t) => lerp(0.07, 0.025, t), uAround: 0.6 });
    tufts.push(P2[4], P2[3]);
  }
  for (let i = 0; i < Math.round(h * 11); i++) {
    const c = tufts[Math.floor(R() * tufts.length)], a = R() * TAU, r = R() * h * 0.2;
    cyPatch(M, [c[0] + Math.cos(a) * r, c[1] + R.range(-0.1, 0.3), c[2] + Math.sin(a) * r], R.range(0.8, 1.2), CYF.tamarisk, R, R.pick([[0.9, 1, 0.95], [1, 1, 1], [0.85, 0.96, 0.95]]), { tilt: R.range(0.8, 1.2), up: 0.3 });
  }
  M.col(-0.2, 0.2, 0, h * 0.5, -0.2, 0.2, 'wood');
  M.occ(-h * 0.4, h * 0.4, h * 0.5, h, -h * 0.4, h * 0.4, 0.3);
});
/* Figuier : tronc court, large dôme de grandes feuilles lobées */
PF.cyFig = (h = 4.4, seed = 1) => prefab(`cyFig${h}_${seed}`, (M) => {
  const R = rngOf(seed * 17 + 9);
  M.color([0.62, 0.56, 0.5]).local(1); M.swFn = swCrown(0, 0, h * 0.45, h, h * 0.7, 0.65);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU, path = []; for (let k = 0; k <= 5; k++) { const t = k / 5; path.push([Math.cos(a) * t * 1.1, t * h * 0.55, Math.sin(a) * t * 1.1]); } M.sweep('wood', circleShape(1, 7), path, { scale: (t) => lerp(0.22, 0.08, t), uAround: 0.6 }); }
  cyCanopy(M, 0, h * 0.7, 0, h * 0.62, h * 0.32, h * 0.62, Math.round(h * 24), 1.05, CYF.fig, R, CY_GREENS.fig);
  M.col(-0.3, 0.3, 0, h * 0.5, -0.3, 0.3, 'wood');
  M.occ(-h * 0.6, h * 0.6, h * 0.45, h, -h * 0.6, h * 0.6, 0.45);
});
/* Platane de la place : tronc clair et massif, vaste couronne ; son ombre est cuite dans l'éclairage */
PF.cyPlane = (h = 10.5, seed = 1) => prefab(`cyPlane${h}_${seed}`, (M) => {
  const R = rngOf(seed * 19 + 4);
  M.color([0.74, 0.7, 0.62]).local(1); M.aoFn = (x, y) => lerp(0.7, 1, smoothstep(0, 1.5, y));
  M.save().move(0, -0.1, 0); M.cyl('wood', 0.62, h * 0.55, 12, { r1: 0.42, caps: '' }); M.restore();
  M.aoFn = null;
  const crown = [];
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU + 0.4, path = []; for (let k = 0; k <= 6; k++) { const t = k / 6; path.push([Math.cos(a) * t * 3.2, h * 0.5 + t * h * 0.32, Math.sin(a) * t * 3.2]); } M.sweep('wood', circleShape(1, 7), path, { scale: (t) => lerp(0.3, 0.1, t), uAround: 0.6 }); crown.push(path[6]); }
  M.swFn = swCrown(0, 0, h * 0.5, h + 1, 4.6, 0.6);
  for (const c of crown) cyCanopy(M, c[0], c[1] + 0.6, c[2], 2.6, 1.7, 2.6, 52, 1.7, CYF.fig, R, CY_GREENS.fig);
  cyCanopy(M, 0, h * 0.9, 0, 3.2, 1.5, 3.2, 40, 1.8, CYF.fig, R, CY_GREENS.fig);
  M.col(-0.62, 0.62, 0, h * 0.5, -0.62, 0.62, 'wood');
  M.occ(-6.2, 6.2, h * 0.62, h + 0.8, -6.2, 6.2, 0.5);
});

/* ---------- Plantes ---------- */
PF.cyAgave = (s = 1) => prefab('cyAgave' + s, (M) => { M.swFn = swHeight(0, 1.35 * s, 1.5, 0.18); cyCard(M, CYF.agave, 1.7 * s, 1.35 * s, -0.04, 3, 0.1); }); // feuilles raides : à peine
PF.cyOpuntia = (s = 1) => prefab('cyOpuntia' + s, (M) => { M.swFn = swHeight(0, 1.5 * s, 1.5, 0.1); cyCard(M, CYF.opuntia, 1.5 * s, 1.5 * s, -0.04, 3, 0.1); });
/* Touffe : variété choisie par la graine (géranium, romarin, laurier-rose, lavande) */
PF.cyBush = (s = 1, seed = 1) => prefab(`cyBush${s}_${seed}`, (M) => {
  const kinds = [CYF.geranium, CYF.rosemary, CYF.oleander, CYF.jasmine], reg = kinds[((seed % 4) + 4) % 4];
  M.swFn = swHeight(0, 0.9 * s, 1.2, 0.55);
  cyCard(M, reg, 1.1 * s, 0.9 * s, 0, 3, 0.12);
});
PF.cyGrass = (s = 1) => prefab('cyGrass' + s, (M) => { M.swFn = swHeight(0, 0.6 * s, 1.3, 0.75); cyCard(M, CYF.grass, 0.8 * s, 0.6 * s, 0, 3, 0.1); });
/* Plante grimpante sur un mur (repère de façade) : bougainvillée, jasmin, vigne ou lierre */
PF.cyClimber = (kind, w = 2.2, h = 2.6) => prefab(`cyClimber${kind}${w}${h}`, (M) => {
  const R = rngOf(Math.round(w * 10 + h) + kind.length * 7), reg = CYF[kind] || CYF.bougain;
  const n = Math.round(w * h * 3.2);
  M.swFn = () => -0.6; // plaquée au mur : les feuilles frémissent, la plante ne s'incline pas
  for (let i = 0; i < n; i++) {
    const x = R.range(-w / 2, w / 2), y = R.range(0.1, h) * (0.55 + 0.45 * (1 - Math.abs(x) / (w / 2))), s = R.range(0.55, 0.9);
    cyPatch(M, [x, y, 0.06 + R() * 0.16], s, reg, R, kind === 'bougain' ? [1, 1, 1] : R.pick([[0.95, 1, 0.9], [1, 1, 1]]), { psi: 0, tilt: R.range(0.05, 0.35), up: 0.3 });
  }
  M.color([0.35, 0.26, 0.18]).local(1); M.cls = 2;
  M.tube('wood', 0.025, [[-w * 0.3, 0, 0.05], [-w * 0.2, h * 0.4, 0.07], [0.05 * w, h * 0.75, 0.06], [w * 0.3, h * 0.95, 0.05]], 5);
});
PF.cyJasmine = (w = 1.8, h = 2.4) => PF.cyClimber('jasmine', w, h);

/* ---------- Pots, mobilier de taverne ---------- */
/* Pot en terre cuite fleuri : kind 0 géranium, 1 romarin, 2 agave nain, 3 jasmin */
PF.cyPot = (kind = 0) => prefab('cyPot' + kind, (M) => {
  M.color([0.74, 0.4, 0.26]).local(1);
  M.lathe('concrete', [[0, 0], [0.1, 0], [0.13, 0.2], [0.15, 0.22], [0.15, 0.25], [0.125, 0.25], [0.11, 0.05], [0, 0.05]], 10, { sharp: 0.6 });
  M.color([1, 1, 1]); M.swFn = swHeight(0.24, 0.66, 1.2, 0.5);
  cyCard(M, [CYF.geranium, CYF.rosemary, CYF.agave, CYF.jasmine][kind % 4], 0.46, kind === 2 ? 0.4 : 0.42, 0.24, 2, 0.14);
});
propType('cyPot', (a) => ({ pf: () => PF.cyPot(a[0] || 0), shapes: [CYL(0, 0.125, 0, 0.14, 0.125)], mass: 6, mu: 0.7, e: 0.2, resp: 2.6, blast: 7, hp: 20, mat: 'dirt', snd: 'clay', brk: 'clay', debris: [['shard', 6]] }));

/* Tonnelle de taverne à toit de roseaux (le long de x ou de z) : poteaux peints, chevrons, nappe de roseaux, vigne grimpante.
   Les poteaux arrêtent les soldats, le toit n'arrête que les tirs. o : tint (poteaux), vine (vigne sur le toit) */
function cyPergola(x0, x1, z0, z1, h, seed, o = {}) {
  const M = DECOR, R = rngOf(seed), tint = o.tint || [0.95, 0.94, 0.9], nx = Math.max(1, Math.round((x1 - x0) / 2.4)), nz = Math.max(1, Math.round((z1 - z0) / 2.4));
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) {
    if ((i > 0 && i < nx) && (k > 0 && k < nz)) continue;
    const x = lerp(x0, x1, i / nx), z = lerp(z0, z1, k / nz);
    M.save().color(tint).local(1); M.boxB('paintwood', x - 0.07, x + 0.07, 0, h, z - 0.07, z + 0.07, { bevel: 0.01 }); M.restore();
    DECOR.col(x - 0.08, x + 0.08, 0, h, z - 0.08, z + 0.08, 'wood');
  }
  M.save().color(tint).local(1);
  for (let k = 0; k <= nz; k++) { const z = lerp(z0, z1, k / nz); M.boxB('paintwood', x0 - 0.25, x1 + 0.25, h, h + 0.12, z - 0.06, z + 0.06, { bevel: 0.01 }); }
  for (let x = x0 - 0.2; x <= x1 + 0.2; x += 0.45) M.boxB('wood', x - 0.025, x + 0.025, h + 0.12, h + 0.17, z0 - 0.25, z1 + 0.25);
  M.restore();
  // nappe de roseaux, à plat, qui laisse passer le soleil par plaques
  for (let x = x0 - 0.2; x < x1 + 0.2; x += 0.9) for (let z = z0 - 0.2; z < z1 + 0.2; z += 0.9) cyPatch(M, [x + 0.45, h + 0.22, z + 0.45], 1.05, CYF.reed, R, [0.92 + R() * 0.08, 0.92 + R() * 0.06, 0.8], { tilt: Math.PI / 2, up: 1 });
  if (o.vine) for (let q = 0; q < Math.round((x1 - x0) * (z1 - z0) * 0.5); q++) cyPatch(M, [R.range(x0, x1), h + 0.3, R.range(z0, z1)], 0.9, CYF.vine, R, [1, 1, 1], { tilt: Math.PI / 2 - 0.12, up: 1 });
  DECOR.col(x0 - 0.25, x1 + 0.25, h + 0.1, h + 0.25, z0 - 0.25, z1 + 0.25, 'wood', true);
  M.occ(x0 - 0.3, x1 + 0.3, h, h + 0.5, z0 - 0.3, z1 + 0.3, 0.55);
}
/* Parasol de taverne : mât, toile blanche et bleue ; sans collision (la toile est au-dessus des têtes). Chaque pan est une toile simulée
   (Maker.toile) tendue entre deux baleines : il se creuse un peu entre elles, son bord bat au vent et se soulève sous un souffle */
PF.cyUmbrella = (c = [0.95, 0.95, 0.92]) => prefab('cyUmbrella' + c.join(','), (M) => {
  M.color([0.3, 0.27, 0.24]).local(1); M.cyl('wood', 0.025, 2.3, 6);
  for (let i = 0; i < 8; i++) {
    const a0 = (i / 8) * TAU, a1 = ((i + 1) / 8) * TAU;
    M.color(i % 2 ? [0.1, 0.32, 0.62] : c);
    M.toile(3, 4, (u, v) => { const a = lerp(a0, a1, u), r = v * 1.35; return [Math.cos(a) * r, 2.62 - v * 0.42 - 0.04 * Math.sin(u * Math.PI) * v, Math.sin(a) * r]; }, { uL: 1.05, vL: 1.4, side: [0, 1, 0], play: 0.1, glow: 0.35, pin: (u, v) => u <= 0 || u >= 1 || v <= 0 });
  }
});

/* ---------- Barques et bord de mer ---------- */
var HULL_KAIKI = [
  [0.0, 0.72, 1.0, 0.25, -0.35, 4.5], [0.08, 0.86, 0.9, 0.2, -0.55, 3.6], [0.35, 1.0, 0.8, 0.18, -0.62, 3.0], [0.62, 0.94, 0.86, 0.22, -0.6, 2.6],
  [0.82, 0.7, 1.15, 0.35, -0.5, 2.1], [0.93, 0.4, 1.6, 0.7, -0.3, 1.8], [1.0, 0.04, 2.15, 1.3, 0.1, 1.5],
];
/* Nom peint de chaque côté de l'étrave (case i de l'atlas de la carte) : comme hullName du port, avec l'atlas grec */
function cyHullName(M, H, idx, y) { for (const sd of [-1, 1]) hullSideName(M, H, idx, sd, 0.78, 0.9, y, 0.3, 'decals4'); } // (en bandes qui suivent le bordé, voir hullSideName)
/* Caïque : coque de bois peinte à l'étrave haute, bande de flottaison, pont de planches, petite timonerie, mât de feu, filets. o : hull, boot, stripe, name (case des noms), seed */
PF.cyKaiki = (o = {}) => prefab('cyKaiki' + JSON.stringify(o), (M) => {
  const R = rngOf(o.seed || 3), hull = o.hull || [0.94, 0.94, 0.9], accent = o.accent || [0.1, 0.3, 0.62];
  const H = hullBody(M, HULL_KAIKI, { L: o.L || 7.6, B: o.B || 2.7, deck: 0.5, thick: 0.06, nv: 20, hull, boot: accent, stripe: o.stripe || accent, inner: o.inner || [0.9, 0.9, 0.86], deckTint: [0.6, 0.5, 0.38], noCol: true });
  const z = H.z;
  cyHullName(M, H, o.name !== undefined ? o.name : 0, 0.55);
  M.save().local(1);
  M.color(o.house || [0.94, 0.94, 0.9]); M.boxB('paint', -0.55, 0.55, 0.5, 1.7, z(0.18) - 0.6, z(0.18) + 0.5, { bevel: 0.05 });
  M.color(accent); M.boxB('paint', -0.58, 0.58, 1.7, 1.78, z(0.18) - 0.65, z(0.18) + 0.55, { bevel: 0.02 });
  M.color([0.1, 0.12, 0.14]); M.boxB('glass', -0.5, 0.5, 1.0, 1.5, z(0.18) + 0.5, z(0.18) + 0.52);
  M.color([0.45, 0.34, 0.24]); M.save().move(0, 0.5, z(0.52)); M.cyl('wood', 0.05, 2.9, 6); M.restore();
  M.color([0.9, 0.9, 0.86]); M.cls = 2; M.save().move(0, 3.2, z(0.52)); M.cyl('lamp', 0.07, 0.1, 8); M.restore(); M.cls = 0;
  M.color([0.35, 0.28, 0.2]); M.boxB('wood', -0.3, 0.3, 0.5, 0.6, z(0.7) - 0.3, z(0.7) + 0.3);
  if (R() < 0.8) { M.save().move(0.35, 0.5, z(0.38)); M.put(PF.netPile(1 + (o.seed || 3) % 5, 1.0, 0.8, 0.4)); M.restore(); }
  M.save().move(-0.3, 0.5, z(0.8)); M.put(PF.ropeCoil()); M.restore();
  M.restore();
});
/* Caïque tiré à terre sur son ber : la coque repose sur des cales et des chandelles ; collision pleine (un vrai couvert de 1,8 m) */
function cyHauledBoat(x, z, ry, o = {}) {
  const M = DECOR, L = o.L || 7.6, B = o.B || 2.7, alongX = Math.abs(Math.sin(ry)) > 0.5, hx = alongX ? L / 2 : B / 2, hz = alongX ? B / 2 : L / 2;
  M.place(PF.cyKaiki(o), x, 0.98, z, ry, { nocol: true });
  // ber : deux traverses de bois sur des cales, trois chandelles de chaque côté
  M.save().move(x, 0, z).rotY(ry).color([0.5, 0.4, 0.3]).local(1);
  for (const q of [-0.28, 0.1, 0.38]) M.boxB('wood', -0.95, 0.95, 0, 0.35, q * L - 0.16, q * L + 0.16);
  for (const q of [-0.3, 0.05, 0.35]) for (const sd of [-1, 1]) { M.save().move(sd * 1.1, 0.2, q * L).rotZ(sd * 0.35); M.boxB('wood', -0.05, 0.05, 0, 1.2, -0.05, 0.05); M.restore(); }
  M.restore();
  DECOR.col(x - hx * 0.95, x + hx * 0.95, 0, 1.8, z - hz * 0.9, z + hz * 0.9, 'wood');
}
/* Poulpes à sécher : une corde tendue entre deux poteaux, six poulpes pendus */
function cyOctopusLine(x, z, ry, len = 3.2) {
  const M = DECOR, R = rngOf(Math.round(x * 7 + z * 3) + 9);
  M.save().move(x, 0, z).rotY(ry).local(1);
  for (const sx of [-1, 1]) { M.save().move(sx * len / 2, 0, 0).color([0.5, 0.4, 0.3]); M.cyl('wood', 0.05, 2.2, 6); M.restore(); }
  M.color([0.8, 0.74, 0.6]); M.tube('canvas', 0.012, sagPath([-len / 2, 2.05, 0], [len / 2, 2.05, 0], 0.08, 10), 3);
  for (let i = 0; i < 6; i++) {
    const px = -len / 2 + (len * (i + 0.7)) / 6.4, tn = R.pick([[0.8, 0.52, 0.48], [0.7, 0.45, 0.42], [0.85, 0.6, 0.52]]);
    M.save().move(px, 1.5, 0).color(tn);
    M.save().scl(0.1, 0.13, 0.1).move(0, 0.9, 0); M.geo('plastic', G_SPH); M.restore();
    for (let q = 0; q < 8; q++) { const a = (q / 8) * TAU; M.tube('plastic', 0.012, [[Math.cos(a) * 0.04, 0.05, Math.sin(a) * 0.04], [Math.cos(a) * 0.07 + (R() - 0.5) * 0.03, -0.18, Math.sin(a) * 0.07], [Math.cos(a) * 0.05 + (R() - 0.5) * 0.06, -0.42 - R() * 0.1, Math.sin(a) * 0.05]], 3); }
    M.restore();
  }
  for (const sx of [-1, 1]) M.col(sx * len / 2 - 0.06, sx * len / 2 + 0.06, 0, 2.2, -0.06, 0.06, 'wood');
  M.restore();
}
/* Kiosque de rue (periptero) : cabine turquoise, comptoir coulissant, revues, glacier, store ; 2,2 x 1,6 m */
function cyKiosk(x, z, ry) {
  const M = DECOR;
  M.save().move(x, 0, z).rotY(ry).local(1);
  M.color([0.12, 0.52, 0.58]); M.boxB('paint', -1.1, 1.1, 0.1, 2.5, -0.8, 0.8, { bevel: 0.05 });
  M.color([0.95, 0.94, 0.9]); M.boxB('paint', -1.2, 1.2, 2.5, 2.62, -0.9, 0.9, { bevel: 0.03 }); M.boxB('paint', -1.15, 1.15, 0, 0.1, -0.85, 0.85);
  M.color([0.1, 0.12, 0.14]); M.boxB('glass', -0.8, 0.8, 1.05, 2.1, 0.8, 0.82);
  M.color([0.55, 0.35, 0.2]); M.boxB('wood', -0.85, 0.85, 0.95, 1.05, 0.8, 1.15);
  for (const [i, px] of [[0, -0.9], [1, 0.9]]) { M.save().move(px, 1.3, 0.815).color([1, 1, 1]); cyWallDecal(M, i === 0 ? CYD.glace : CYD.fete, 0, 0, 0.4, 0.4, 0, undefined); M.restore(); }
  M.save().move(0, 0, 0.9); cySignBoard(M, 0, 2.62 + 0.0, 1.6, 0.4, CYS.periptero, [0.95, 0.94, 0.9]); M.restore();
  M.col(-1.15, 1.15, 0, 2.6, -0.85, 0.85, 'metal');
  M.restore();
}
/* Puits de pierre à potence de bois et poulie. Il est creux : margelle de pierre sèche, conduit qui descend à 2,5 m sous la place, de plus en
   plus sombre, jusqu'à l'eau (pondAdd) ; le sol de la carte est percé au droit du conduit (CYC.holes, voir greekGround). Le seau pend à sa
   corde sous la poulie et se balance (hangAdd, 04b-physprops.js) ; l'autre brin de la corde descend vers un taquet du montant nord.
   Collisions : la margelle en quatre boîtes (une balle ou une grenade entre par l'ouverture), et au-dessus de l'ouverture une colonne que
   seuls les soldats sentent (noRay : on ne marche pas sur le vide).
   o : y (hauteur du sol, 0 : le sol plat de Greek ; sur le sable de Simoun, celle du sol aplani sous le puits), rw (rayon du conduit, 0,6 m ;
   0,5 m à Simoun, où la grille du relief est de 1 m : le trou du maillage est la case du puits, que le conduit remplit), relief (sol en relief :
   le trou se fait dans le maillage du relief, qui saute la case de chaque HOLES, voir reliefMesh, et non dans le mur percé de Greek, CYC.holes). */
function cyWell(x, z, o = {}) {
  const M = DECOR, Rw = o.rw || 0.6, deep = 2.5, n = 5, y = o.y || 0;
  M.save().move(x, y, z).local(1).color([0.82, 0.78, 0.7]);
  M.lathe('drystone', [[0.9, -0.05], [0.9, 0.85], [0.95, 0.9], [0.95, 0.98], [0.62, 0.98], [Rw, 0.7], [Rw, -0.02]], 14, { sharp: 0.5, uR: 1.1 });
  // conduit : anneaux de pierre de plus en plus sombres (la lumière du jour n'y descend pas)
  for (let i = 0; i < n; i++) {
    const y0 = -0.02 - (i * (deep - 0.02)) / n, y1 = -0.02 - ((i + 1) * (deep - 0.02)) / n, k = 0.04 + 0.78 * Math.pow(1 - (i + 0.5) / n, 2);
    M.color([k, k * 0.95, k * 0.86]); M.lathe('drystone', [[Rw, y0], [Rw, y1]], 14, { uR: 1.1 });
  }
  // potence : deux montants, la traverse et son chapeau
  M.color([0.42, 0.3, 0.2]);
  for (const sd of [-1, 1]) M.boxB('wood', -0.08, 0.08, 0.9, 2.7, sd * 0.85 - 0.06, sd * 0.85 + 0.06, { bevel: 0.01 });
  M.boxB('wood', -0.07, 0.07, 2.6, 2.74, -0.95, 0.95); M.boxB('wood', -0.08, 0.08, 2.75, 2.82, -1.0, 1.0);
  // poulie sous la traverse : chape de fer, réa (axe le long de x, la corde passe dans le plan y-z)
  M.color([0.3, 0.3, 0.3]);
  for (const sx of [-0.04, 0.04]) M.boxB('steel', sx - 0.008, sx + 0.008, 2.36, 2.6, -0.035, 0.035);
  M.save().move(-0.03, 2.42, 0).rotZ(-Math.PI / 2); M.cyl('steel', 0.09, 0.06, 12); M.restore();
  // brin libre : du haut du réa au taquet du montant nord, puis quelques tours
  M.color([0.55, 0.38, 0.22]); M.tube('canvas', 0.012, [[0, 2.5, -0.06], [0, 2.1, -0.4], [0, 1.45, -0.77]], 4);
  M.color([0.35, 0.33, 0.3]); M.boxB('steel', -0.03, 0.03, 1.4, 1.48, -0.8, -0.77);
  M.color([0.55, 0.38, 0.22]); M.save().move(0, 1.36, -0.79); M.cyl('canvas', 0.085, 0.08, 10, { caps: '' }); M.restore();
  M.restore();
  // l'eau au fond, et le trou du sol
  // (le ciel qu'elle reflète est vu par un trou de 1,2 m au bout de 2,5 m de conduit : reflet bien plus faible qu'en plein air)
  pondAdd({ shape: 'disc', r: Rw, seg: 14, rings: 2, x, y: y - deep + 0.1, z, tone: 0.4, depth: 0.3, murk: 1, caus: 0, deep: [0.004, 0.008, 0.008], shallow: [0.012, 0.022, 0.02], scatter: [0.002, 0.006, 0.006] }).material.envMapIntensity = 0.12;
  if (!o.relief) (CYC.holes || (CYC.holes = [])).push([x - 0.62, x + 0.62, z - 0.62, z + 0.62]);
  HOLES.push({ x, z, r: Rw, y: y - deep + 0.1, m: 'water', wall: 'concrete' });
  // collisions : margelle en quatre boîtes, colonne invisible pour les soldats au-dessus du trou
  for (const [a0, a1, b0, b1] of [[-0.9, -Rw, -0.9, 0.9], [Rw, 0.9, -0.9, 0.9], [-Rw, Rw, -0.9, -Rw], [-Rw, Rw, Rw, 0.9]]) DECOR.col(x + a0, x + a1, y, y + 1.0, z + b0, z + b1, 'concrete');
  COL.push({ x0: x - Rw, x1: x + Rw, y0: y, y1: y + 2.6, z0: z - Rw, z1: z + Rw, m: 'concrete', ray: false, noRay: true, inv: true });
  // le seau : corde, anse et seau cerclé, dans un groupe qui pend du bas du réa (côté +z)
  const L = 0.87, pf = prefab('cyWellBucket', (S) => {
    S.local(1);
    S.color([0.55, 0.38, 0.22]); S.tube('canvas', 0.012, [[0, 0, 0], [0, -L, 0]], 4);
    const arc = []; for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI; arc.push([Math.cos(a) * 0.125, -L - 0.12 + Math.sin(a) * 0.12, 0]); }
    S.color([0.32, 0.31, 0.3]); S.tube('steel', 0.007, arc, 4);
    S.save().move(0, -L - 0.42, 0).color([0.5, 0.36, 0.22]);
    S.lathe('wood', [[0, 0], [0.105, 0], [0.13, 0.3], [0.118, 0.3], [0.095, 0.03], [0, 0.03]], 12, { sharp: 0.5, uR: 0.6 });
    S.color([0.3, 0.3, 0.3]); for (const y of [0.05, 0.24]) { S.save().move(0, y, 0); S.cyl('steel', 0.109 + y * 0.083, 0.025, 12, { r1: 0.109 + (y + 0.025) * 0.083, caps: '' }); S.restore(); }
    S.restore();
  });
  const g = new THREE.Group(), body = cyPrefabGroup(pf, MAT);
  g.name = 'pendule:seau'; g.position.set(x, y + 2.42, z + 0.09); g.add(body); mapAdd(g);
  // butées : les montants (z = ±0,85) arrêtent le seau vers le nord et le sud
  hangAdd(g, body, L + 0.27, { r: 0.16, top: L, mat: 'wood', lim: [-0.72, 0.55, -1.0, 1.0] });
}
/* Drapeau grec (neuf bandes, canton bleu à croix blanche) sur sa hampe de hp mètres, déployé dans le vent vers ry */
function cyFlag(x, y, z, ry = 0, hp = 2.0) {
  const M = DECOR, w = 1.5, h = 1.0;
  M.save().move(x, y, z).rotY(ry).local(1);
  M.color([0.8, 0.8, 0.78]); M.cyl('steel', 0.03, hp, 6); M.save().move(0, hp + 0.04, 0).scl(0.045); M.geo('steel', G_SPH); M.restore();
  M.save().move(0.02, hp - h, 0);
  cyFlagCloth(M, w, h);
  M.restore();
  M.restore();
}
/* L'étoffe : six bandes verticales qui ondulent un peu (forme au repos ; le vent la fait flotter, 02mc-tissus.js), texture cyFlagTex de la hampe (u = 0) au bout flottant (u = 1) */
function cyFlagCloth(M, w, h) {
  const B = M.buf('cyflag', w / 2, h / 2, 0), n = 6, zAt = (u) => Math.sin(u * 5.2) * 0.07 * u + u * 0.08, P = [];
  M.save().color([1, 1, 1]);
  for (let k = 0; k <= n; k++) {
    const u = k / n, x = u * w, z = zAt(u), dz = (zAt(u + 0.01) - z) / (0.01 * w), l = hyp(1, dz);
    P.push([M.v(B, x, 0, z, -dz / l, 0, 1 / l, u, 1, 1, u), M.v(B, x, h, z, -dz / l, 0, 1 / l, u, 0, 1, u)]); // souplesse u : la vague court de la hampe au bout (02mc-tissus.js)
  }
  for (let k = 0; k < n; k++) M.quadI(B, P[k][0], P[k + 1][0], P[k + 1][1], P[k][1]);
  M.restore();
}
/* Chat assis (de dos, tourné vers ry) : pelage de la graine */
PF.cyCat = (seed = 1) => prefab('cyCat' + seed, (M) => {
  const fur = [[0.85, 0.5, 0.2], [0.35, 0.34, 0.33], [0.08, 0.08, 0.09], [0.9, 0.88, 0.82], [0.6, 0.45, 0.3]][seed % 5];
  M.color(fur).local(1);
  const sph = (x, y, z, a, b, c) => { M.save().move(x, y, z).scl(a, b, c); M.geo('burlap', G_SPH); M.restore(); };
  sph(0, 0.17, -0.02, 0.1, 0.17, 0.12); sph(0, 0.36, 0.05, 0.075, 0.07, 0.07);
  for (const s of [-1, 1]) { M.save().move(s * 0.045, 0.43, 0.05).rotZ(-s * 0.3); M.cyl('burlap', 0.025, 0.05, 4, { r1: 0.0 }); M.restore(); }
  M.tube('burlap', 0.018, [[0, 0.04, -0.12], [0.1, 0.03, -0.18], [0.16, 0.05, -0.1], [0.14, 0.14, 0.0]], 4);
  M.color([0.1, 0.1, 0.1]); M.cls = 2; sph(-0.03, 0.37, 0.115, 0.01, 0.01, 0.004); sph(0.03, 0.37, 0.115, 0.01, 0.01, 0.004);
});

}catch(e){HOOKS.missing['02ye-cyclades-deco.js']=String(e&&e.message||e)}
/* ===== 02ym-pavillons-kit.js ===== */
try{
/* ==========================================================================
   KIT PAVILLONNAIRE : le lotissement de province de European (02yn-european-dream.js), réutilisable sur une autre carte.
   - Pavillon type (fdHouse) : bloc enduit d'un étage, façades percées (porte de PVC, baies, volets roulants le plus souvent baissés, coffres,
     appuis, soubassement gris, descentes d'eau), toit à deux pans d'ardoise ou de tuiles mécaniques (fdRoof : débords fermés, bandeaux de PVC,
     gouttières, faîtage, fenêtres de toit, cheminée enduite), garage accolé à sa porte sectionnelle. Une collision pleine : on n'y entre pas.
   - Matériel de jardin et de rue (prefabs PF.fd*) : poubelles à roulettes, boîte aux lettres sur pied, lampadaire de lotissement, piscine
     hors-sol, trampoline à filet, abri de jardin, balançoire, séchoir parapluie, salon de jardin, barbecue, conteneurs de tri, transformateur,
     toboggan, canapé ; chantier : bétonnière, palette de parpaings, benne, barrière de chantier.
   - Surface procédurale du parpaing (TEXLAB.parpaing) et atlas des panneaux (fdSignAtlas : lot à vendre, maison témoin, plaque de rue...).
   Tout est construit par le code ; les tirages sont reproductibles (graines fixes).
   ========================================================================== */
/* Parpaing creux de 50 x 20 cm, joints de mortier gris clair, pores et taches de laitance */
Object.assign(TEXLAB, {
  parpaing: [512, 71, 1.8, `
    vec4 t = tiles(uv, vec2(4.0, 10.0), 0.5);
    float joint = smoothstep(0.0, 0.04, t.w);
    float big = gfbm(uv, vec2(3.0), 4, 1.0), gr = vn(uv * 384.0, vec2(384.0), 3.0), mid = gfbm(uv, vec2(16.0), 3, 2.0);
    vec4 po = vor(uv, vec2(150.0), 4.0, 1.0); float pore = (1.0 - smoothstep(0.05, 0.14, po.x)) * step(0.62, po.z);
    h = joint * (0.7 + gr * 0.15 + mid * 0.1) - pore * 0.25;
    vec3 blk = srgb(vec3(0.6, 0.6, 0.58)) * (0.84 + t.z * 0.16 + big * 0.12 + gr * 0.12);
    vec3 mort = srgb(vec3(0.7, 0.69, 0.65)) * (0.9 + gr * 0.1);
    a = mix(mort, blk, joint) * (1.0 - pore * 0.22);
    r = 0.94; x = h;`],
});
Object.assign(TEXSCALE, { parpaing: 2.0, crepi: 3.0, peinture: 3.0 });
OPT_TEX.add('parpaing');

/* Couleurs du lotissement : crépis (crème, ivoire, beige, saumon pâle), menuiseries de PVC, volets roulants, tôle des voitures */
var FDP = {
  // (l'enduit photographié tire sur le jaune : des teintes presque neutres le gardent crème)
  crepi: [[0.95, 0.95, 0.9], [0.97, 0.97, 0.94], [0.93, 0.92, 0.86], [0.96, 0.94, 0.9]],
  crepiS: [[1.0, 0.9, 0.84], [1.0, 0.93, 0.88], [0.97, 0.88, 0.82], [1.0, 0.92, 0.88]],
  pvc: [0.95, 0.95, 0.93], volet: [[0.93, 0.93, 0.91], [0.84, 0.84, 0.82], [0.62, 0.6, 0.56]],
  slate: [0.56, 0.58, 0.64], tiles: [0.95, 0.82, 0.76], socle: [0.56, 0.56, 0.55],
  // voitures : gris clair, anthracite, gris, rouge, bleu, blanc cassé ; puis orange (le petit SUV), champagne, noir, titane, blanc, bleu nuit
  cars: [[0.78, 0.78, 0.76], [0.2, 0.22, 0.25], [0.62, 0.62, 0.6], [0.55, 0.12, 0.1], [0.24, 0.32, 0.46], [0.86, 0.86, 0.84], [0.86, 0.42, 0.12], [0.72, 0.64, 0.52], [0.11, 0.11, 0.12], [0.46, 0.48, 0.5], [0.93, 0.93, 0.91], [0.18, 0.28, 0.48]],
};

/* ---------- Panneaux (atlas de 1024 x 1536 : huit panneaux en largeur de 512 x 256, deux en hauteur de 320 x 512 pour la sucette
   publicitaire) ; chaque panneau a sa mise en page, des marges larges et un corps qui tient dans sa ligne ---------- */
var FDS = { lot: 0, temoin: 1, residence: 2, rue: 3, vendre: 4, danger: 5, verre: 6, papiers: 7, mupi: 8, mupiVente: 9 };
var FDS_CELL = (i) => (i < 8 ? [(i % 2) * 512, Math.floor(i / 2) * 256, 512, 256] : [(i - 8) * 320, 1024, 320, 512]);
function fdSignAtlas() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1536; const g = c.getContext('2d'), R = rngOf(4407);
  const SANS = 'Arial, Helvetica, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
  // une ligne de texte centrée en (cx, cy), réduite si elle dépasse maxW
  const text = (str, cx, cy, size, color, maxW, font = SANS, weight = 'bold', style = '') => {
    g.font = `${style} ${weight} ${size}px ${font}`; const w = g.measureText(str).width, fs = w > maxW ? (size * maxW) / w : size;
    g.font = `${style} ${weight} ${fs}px ${font}`; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, cx, cy);
  };
  const rrect = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
  const cell = (i, bg, draw) => { const [x, y, w, h] = FDS_CELL(i); g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = bg; g.fillRect(x, y, w, h); draw(x, y, w, h); g.restore(); };
  // lot à vendre : bandeau rouge, numéro du lot, terrain viabilisé
  cell(FDS.lot, '#f5f3ee', (x, y, w) => {
    g.fillStyle = '#b3261e'; g.fillRect(x, y + 28, w, 62); text('À VENDRE', x + w / 2, y + 60, 40, '#ffffff', w - 120);
    text('LOT N° 12', x + w / 2, y + 134, 52, '#b3261e', w - 120);
    text('Terrain viabilisé, 452 m²', x + w / 2, y + 192, 32, '#262626', w - 110);
  });
  // maison témoin : bandeau jaune, horaires des visites
  cell(FDS.temoin, '#1f4e79', (x, y, w) => {
    g.fillStyle = '#f2c14e'; g.fillRect(x, y + 30, w, 72); text('MAISON TÉMOIN', x + w / 2, y + 67, 44, '#1f3550', w - 110);
    text('Visite libre', x + w / 2, y + 146, 34, '#ffffff', w - 110);
    text('Samedi et dimanche, de 10 h à 18 h', x + w / 2, y + 196, 22, '#d8e4f0', w - 110, SANS, 'normal');
  });
  // panneau de la résidence (entrée de la rue) : cadre crème, nom en capitales à empattements
  cell(FDS.residence, '#2f5b3f', (x, y, w, h) => {
    g.strokeStyle = '#e9e0c8'; g.lineWidth = 4; rrect(x + 24, y + 22, w - 48, h - 44, 10); g.stroke();
    text('Résidence', x + w / 2, y + 72, 28, '#e9e0c8', w - 140, SERIF, 'normal', 'italic');
    text('Les Mésanges', x + w / 2, y + 128, 58, '#f6f0de', w - 120, SERIF);
    text('24 pavillons de 3 à 5 pièces', x + w / 2, y + 186, 23, '#e9e0c8', w - 140, SANS, 'normal');
  });
  // plaque de rue émaillée : bleu, liseré blanc, coins arrondis
  cell(FDS.rue, '#c9ccd0', (x, y, w, h) => {
    g.fillStyle = '#1d4f9c'; rrect(x + 10, y + 10, w - 20, h - 20, 26); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 7; rrect(x + 26, y + 26, w - 52, h - 52, 18); g.stroke();
    text('RUE DES', x + w / 2, y + 96, 44, '#ffffff', w - 130); text('MÉSANGES', x + w / 2, y + 160, 58, '#ffffff', w - 120);
  });
  cell(FDS.vendre, '#ffffff', (x, y, w) => { text('À VENDRE', x + w / 2, y + 110, 72, '#c62828', w - 120); text('Renseignements au bureau de vente', x + w / 2, y + 180, 22, '#444444', w - 120, SANS, 'normal'); });
  // danger de mort : triangle et éclair à gauche, texte à droite
  cell(FDS.danger, '#f6d64a', (x, y, w, h) => {
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.moveTo(x + 40, y + 200); g.lineTo(x + 115, y + 56); g.lineTo(x + 190, y + 200); g.closePath(); g.fill();
    g.fillStyle = '#f6d64a'; g.beginPath(); g.moveTo(x + 122, y + 92); g.lineTo(x + 98, y + 146); g.lineTo(x + 118, y + 146); g.lineTo(x + 104, y + 186); g.lineTo(x + 138, y + 132); g.lineTo(x + 118, y + 132); g.closePath(); g.fill();
    text('DANGER', x + 345, y + 100, 52, '#1a1a1a', 260); text('DE MORT', x + 345, y + 160, 52, '#1a1a1a', 260);
  });
  // conteneurs d'apport volontaire
  cell(FDS.verre, '#2e7d32', (x, y, w) => { text('VERRE', x + w / 2, y + 104, 74, '#ffffff', w - 140); text('Bouteilles, pots et bocaux', x + w / 2, y + 176, 26, '#e3f1e3', w - 140, SANS, 'normal'); });
  cell(FDS.papiers, '#f2c230', (x, y, w) => { text('PAPIERS', x + w / 2, y + 100, 64, '#1a1a1a', w - 140); text('Emballages, cartons et journaux', x + w / 2, y + 172, 24, '#3a3220', w - 140, SANS, 'normal'); });
  // sucette publicitaire, face rue : le pavillon dessiné sous un ciel bleu, le nom de la résidence, le prix d'appel
  cell(FDS.mupi, '#2f5b3f', (x, y, w, h) => {
    const sky = g.createLinearGradient(0, y, 0, y + 250); sky.addColorStop(0, '#6fa3d8'); sky.addColorStop(1, '#cfe3f2'); g.fillStyle = sky; g.fillRect(x, y, w, 250);
    g.fillStyle = '#7fae5a'; g.fillRect(x, y + 205, w, 45);
    g.fillStyle = '#f1ede2'; g.fillRect(x + 70, y + 130, 180, 90); // le pavillon : façade, toit, porte, fenêtres
    g.fillStyle = '#b5523b'; g.beginPath(); g.moveTo(x + 58, y + 132); g.lineTo(x + 160, y + 70); g.lineTo(x + 262, y + 132); g.closePath(); g.fill();
    g.fillStyle = '#6d7782'; g.fillRect(x + 145, y + 168, 30, 52); g.fillRect(x + 90, y + 150, 34, 30); g.fillRect(x + 196, y + 150, 34, 30);
    text('Les Mésanges', x + w / 2, y + 296, 42, '#f6f0de', w - 60, SERIF);
    text('Votre maison avec jardin', x + w / 2, y + 344, 22, '#e9e0c8', w - 60, SANS, 'normal');
    text('à partir de 189 000 €', x + w / 2, y + 388, 30, '#f2c14e', w - 60);
    g.fillStyle = '#e6e1d3'; g.fillRect(x, y + 440, w, 72); text('Bureau de vente sur place', x + w / 2, y + 476, 23, '#16301f', w - 50);
  });
  // sucette publicitaire, face d'en face : dernières maisons à vendre
  cell(FDS.mupiVente, '#ffffff', (x, y, w, h) => {
    g.fillStyle = '#c62828'; g.fillRect(x, y + 40, w, 110); text('À VENDRE', x + w / 2, y + 95, 50, '#ffffff', w - 60);
    text('Dernières maisons', x + w / 2, y + 205, 28, '#1a1a1a', w - 60); text('disponibles', x + w / 2, y + 240, 28, '#1a1a1a', w - 60);
    text('De 90 à 120 m²', x + w / 2, y + 300, 24, '#444444', w - 60, SANS, 'normal'); text('Garage et jardin clos', x + w / 2, y + 334, 24, '#444444', w - 60, SANS, 'normal');
    g.fillStyle = '#2f5b3f'; g.fillRect(x, y + 420, w, 92); text('Les Mésanges', x + w / 2, y + 466, 34, '#f6f0de', w - 60, SERIF);
  });
  // salissures légères (poussière, coulures), dégradé de patine vers le bas
  for (let i = 0; i < 10; i++) {
    const [x, y, w, h] = FDS_CELL(i);
    for (let k = 0; k < 500; k++) { g.fillStyle = `rgba(${R() < 0.6 ? '255,255,250' : '50,50,45'},${R() * 0.06})`; g.fillRect(x + R() * w, y + R() * h, 1 + R() * 4, 1 + R() * 3); }
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(255,255,255,0.04)'); gr.addColorStop(1, 'rgba(40,45,50,0.14)'); g.fillStyle = gr; g.fillRect(x, y, w, h);
  }
  const t = canvasOnce(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Panneau de l'atlas posé à plat, face +z du repère courant (centre xc, bas y), avec son cadre ; o.both : imprimé des deux côtés */
function fdSign(M, xc, y, w, h, idx, frame = [0.3, 0.3, 0.3], o = {}) {
  const [cx, cy, cw, ch] = FDS_CELL(idx), u0 = cx / 1024, v0 = cy / 1536, du = cw / 1024, dv = ch / 1536, z = 0.03;
  M.save().color([1, 1, 1]);
  for (const sd of o.both ? [1, -1] : [1]) {
    const B = M.buf('signs5', xc, y, sd * z), zz = sd * z, xa = xc - sd * w / 2, xb = xc + sd * w / 2;
    const a = M.v(B, xa, y, zz, 0, 0, sd, u0, v0 + dv), b = M.v(B, xb, y, zz, 0, 0, sd, u0 + du, v0 + dv);
    const c = M.v(B, xb, y + h, zz, 0, 0, sd, u0 + du, v0), d = M.v(B, xa, y + h, zz, 0, 0, sd, u0, v0);
    M.quadI(B, a, b, c, d);
  }
  if (frame) { M.color(frame).local(1); lbox(M, 'paint', xc - w / 2 - 0.025, xc + w / 2 + 0.025, y - 0.025, y + h + 0.025, -z + 0.002, z - 0.002); }
  M.restore();
}

/* ---------- Toit à deux pans ---------- */
/* Toit sur le bloc [x0, x1] x [z0, z1], faîtage le long de x, égout à y. o : mat ('slate' ou 'rooftiles'), tint, gable (teinte des pignons
   enduits), wallMat (matière des pignons et de la cheminée, crépi par défaut), pitch (rad), ov (débord à l'égout), ovx (débord en pignon), gables ([côté x0, côté x1] : pignon enduit et rive ; sans pignon, le pan
   finit contre le mur voisin), chimney (x de la cheminée dans le monde, ou null), velux ([[pan +1 ou -1, x dans le monde], ...]), col (collision du comble, true par défaut).
   Dessous des débords fermé (lambris de PVC), bandeaux d'égout, gouttières demi-rondes. Rend { rise }. */
function fdRoof(x0, x1, z0, z1, y, o = {}) {
  const M = DECOR, span = z1 - z0, len = x1 - x0, tn = Math.tan(o.pitch || 0.65), rise = (span / 2) * tn, ov = o.ov !== undefined ? o.ov : 0.4, drop = ov * tn;
  const hs = span / 2 + ov, nl = hyp(hs, rise + drop), ovx = o.ovx !== undefined ? o.ovx : 0.3, G = o.gables || [true, true];
  const xa = G[0] ? -ovx : -0.05, xb = len + (G[1] ? ovx : 0.05), mat = o.mat || 'rooftiles', tint = o.tint || (mat === 'slate' ? FDP.slate : FDP.tiles);
  const slate = mat === 'slate';
  M.save().move(x0, y, (z0 + z1) / 2);
  for (const s of [1, -1]) {
    M.color(tint).world(1); M.cls = 0;
    M.quad(mat, [xa, -drop, s * hs], [xb, -drop, s * hs], [xb, rise, 0], [xa, rise, 0], [0, hs / nl, (s * (rise + drop)) / nl]);
    // lambris de PVC sous le débord, parallèle au pan (fermé jusqu'au mur), bandeau d'égout
    M.color(FDP.pvc).local(1);
    M.quad('paintwood', [xa, -drop - 0.07, s * hs], [xb, -drop - 0.07, s * hs], [xb, rise - 0.07, 0], [xa, rise - 0.07, 0], [0, -1, 0]);
    M.save().move((xa + xb) / 2, -drop - 0.22, s * (hs + 0.01)); M.box('paintwood', xb - xa, 0.2, 0.03); M.restore();
    // gouttière demi-ronde de PVC gris
    M.color([0.62, 0.62, 0.6]); M.cls = 1;
    M.save().move(xa, -drop - 0.12, s * (hs + 0.08)).rotZ(-Math.PI / 2); M.cyl('plastic', 0.065, xb - xa, 8, { a0: -Math.PI / 2, a1: Math.PI / 2, caps: '' }); M.restore();
    M.cls = 0;
  }
  // faîtage : tuiles faîtières demi-rondes ou lignolet d'ardoise
  M.color(slate ? tint.map((c) => c * 0.82) : [0.86, 0.52, 0.4]).local(1);
  M.save().move(xa, rise - 0.02, 0).rotZ(-Math.PI / 2); M.cyl(mat, slate ? 0.07 : 0.13, xb - xa, 8, { a0: Math.PI / 2, a1: Math.PI * 1.5 }); M.restore();
  // pignons enduits et rives de PVC le long des rampants (le pignon monte jusque sous les pans)
  for (const [k, xx, dir] of [[0, 0, -1], [1, len, 1]]) {
    if (!G[k]) continue;
    M.color(o.gable || FDP.crepi[0]).world(1);
    M.tri3(o.wallMat || 'crepi', [xx, 0, -span / 2], [xx, 0, span / 2], [xx, rise - 0.03, 0], [dir, 0, 0]);
    // dessous du débord de pignon (entre le pignon et la rive) : fermé
    const xe = k ? xb : xa;
    M.color(FDP.pvc).local(1);
    for (const s of [1, -1]) M.quad('paintwood', [xx, -drop - 0.07, s * hs], [xe, -drop - 0.07, s * hs], [xe, rise - 0.07, 0], [xx, rise - 0.07, 0], [0, -1, 0]);
    for (const s of [1, -1]) { const dy = rise + drop, dz = -s * hs, L = hyp(dy, dz); M.save().move(xe - dir * 0.015, (rise - drop) / 2 - 0.08, (s * hs) / 2).rotX(Math.atan2(-dy, dz)); M.box('paintwood', 0.03, 0.24, L + 0.06); M.restore(); }
  }
  // fenêtres de toit (cadre d'aluminium gris, vitrage sombre), posées sur le pan
  for (const [s, xc] of o.velux || []) {
    const tc = 0.42, zS = s * tc * hs, yS = rise - tc * (rise + drop), a = Math.atan2(rise + drop, hs);
    M.save().move(xc - x0, yS, zS).rotX(s * a).local(1);
    M.color([0.32, 0.33, 0.34]); M.boxB('steel', -0.4, 0.4, -0.01, 0.08, -0.55, 0.55, { bevel: 0.015 });
    M.color([0.12, 0.14, 0.17]); M.cls = 1; M.quad('glass', [-0.33, 0.082, -0.48], [0.33, 0.082, -0.48], [0.33, 0.082, 0.48], [-0.33, 0.082, 0.48], [0, 1, 0]); M.cls = 0;
    M.restore();
  }
  // cheminée enduite et son chapeau, au faîtage
  if (o.chimney !== undefined && o.chimney !== null) {
    const cx = o.chimney - x0;
    M.color(o.gable || FDP.crepi[0]).world(1); M.boxB(o.wallMat || 'crepi', cx - 0.32, cx + 0.32, rise * 0.55, rise + 0.85, -0.32, 0.32);
    M.color([0.62, 0.62, 0.6]).local(1); M.boxB('concrete', cx - 0.38, cx + 0.38, rise + 0.85, rise + 0.93, -0.38, 0.38, { bevel: 0.01 });
    M.color([0.4, 0.4, 0.4]); M.save().move(cx, rise + 0.93, 0); M.cyl('steel', 0.08, 0.3, 8); M.restore();
  }
  // occultation et collision du comble en gradins, sous les pans : une boîte unique dépassait des pans près de l'égout (saillie invisible,
  // éclairage cuit assombri en bande au milieu du toit) ; l'occultation reste à 0,35 m sous la couverture (cellules de 0,5 m)
  for (let k = 0; k < 6; k++) { const w = hs * (1 - k / 6), yt = rise - w * tn - 0.35; if (yt > -drop + 0.1) M.occ(0, len, -drop, yt, -w, w, 1); }
  if (o.col !== false) for (let k = 0, yb = 0; k < 4; k++) { const w = (span / 2 - 0.3) * (1 - k / 4), yt = rise - w * tn - 0.12; if (yt > yb) M.col(0, len, yb, yt, -w, w, 'concrete'); yb = Math.max(yb, yt); }
  M.restore();
  return { rise };
}

/* ---------- Façades ---------- */
/* Volet roulant au fond d'une embrasure (repère de façade) : lames de PVC baissées jusqu'à la part open (0 : fermé, 1 : relevé), coffre dans le
   haut du tableau ; derrière la part ouverte, la fenêtre et sa pièce (windowJoinery) */
function fdShutter(M, op, d, tint, open) {
  const h = op.y1 - op.y0, bottom = op.y0 + h * open;
  if (open > 0.04) windowJoinery(M, { ...op, y1: op.y1 - 0.16 }, d, FDP.pvc, { glass: open > 0.5 ? undefined : 'glass' });
  M.save().color(tint).local(1); M.uvS = 1.5 / TEXSCALE.rollshutter;
  if (bottom < op.y1 - 0.18) M.boxB('rollshutter', op.x0 + 0.01, op.x1 - 0.01, bottom, op.y1 - 0.16, -0.07, -0.05);
  M.color(FDP.pvc); M.boxB('paintwood', op.x0, op.x1, op.y1 - 0.18, op.y1, -0.09, -0.005); // coffre
  M.color([0.7, 0.7, 0.7]); lbox(M, 'steel', op.x0 + 0.005, op.x0 + 0.035, op.y0, op.y1 - 0.18, -0.08, -0.045); lbox(M, 'steel', op.x1 - 0.035, op.x1 - 0.005, op.y0, op.y1 - 0.18, -0.08, -0.045);
  M.restore();
}
/* Porte de garage sectionnelle (repère de façade) : panneaux de PVC à rainures ; open : relevée (on voit le dessous des panneaux en haut) */
function fdGarageDoor(M, op, d, tint, open) {
  M.save().color(tint).local(1);
  if (!open) {
    const n = 4, ph = (op.y1 - op.y0) / n;
    for (let i = 0; i < n; i++) M.boxB('paintwood', op.x0 + 0.02, op.x1 - 0.02, op.y0 + i * ph + 0.012, op.y0 + (i + 1) * ph - 0.012, -d + 0.04, -d + 0.08, { bevel: 0.01 });
    M.color([0.5, 0.5, 0.5]); M.boxB('steel', (op.x0 + op.x1) / 2 - 0.12, (op.x0 + op.x1) / 2 + 0.12, op.y0 + 0.5, op.y0 + 0.56, -d + 0.08, -d + 0.1);
  } else {
    M.boxB('paintwood', op.x0 + 0.02, op.x1 - 0.02, op.y1 - 0.08, op.y1 - 0.02, -d - 2.4, -d + 0.06); // la porte relevée, sous le plafond
  }
  M.restore();
}
/* Pavillon type sur le bloc [x0, x1] x [z0, z1] (un étage, égout à h), garage accolé (g : { x0, x1, z0, z1 }), façade sur la rue côté front ('n' : z0,
   's' : z1). o : tint, roof ('slate' ou 'rooftiles'), R (tirages), doorX (x de la porte dans le monde), shut (part relevée des volets, tirée par fenêtre si absente), open (garage ouvert : rien que la porte relevée, voir la maison
   témoin), garage.flat (toit-terrasse : la carte pose la dalle), solid (false : ni collision ni murs, la maison est construite à part ; on ne pose que le toit et l'habillage) */
function fdHouse(x0, x1, z0, z1, h, front, o = {}) {
  const R = o.R || rngOf(Math.round(x0 * 31 + z0 * 17) + 77), tint = o.tint || R.pick(FDP.crepi), voletT = R.pick(FDP.volet), back = front === 'n' ? 's' : 'n';
  const shut = () => (o.shut !== undefined ? o.shut : R() < 0.7 ? 0 : R.pick([0.15, 0.35, 1]));
  if (o.solid !== false) DECOR.col(x0, x1, 0, h, z0, z1, 'concrete');
  for (const f of 'nsew') {
    if (o.solid === false) break;
    const F = facadeFrame(f, x0, x1, z0, z1), len = F.len, ops = [], after = [];
    if (f === front) {
      const dx = o.doorX !== undefined ? (front === 'n' ? x1 - o.doorX : o.doorX - x0) : len * 0.42; // abscisse de la porte dans le repère de la façade
      const door = { x0: dx - 0.5, x1: dx + 0.5, y0: 0, y1: 2.15, depth: 0.2 }; ops.push(door);
      after.push((M) => { panelDoor(M, door, 0.2, FDP.pvc, { glazed: true }); wallLamp(M, dx + 0.85, 2.2, false); M.save().color(FDP.socle).local(1); M.boxB('concrete', dx - 0.75, dx + 0.75, 0, 0.15, 0, 0.55, { bevel: 0.02 }); M.col(dx - 0.75, dx + 0.75, 0, 0.15, 0, 0.55, 'concrete'); M.restore(); }); // seuil de béton
      // baie du séjour, fenêtres de l'étage
      const wx = dx < len / 2 ? len * 0.74 : len * 0.24, big = { x0: wx - 1.0, x1: wx + 1.0, y0: 0.9, y1: 2.25, depth: 0.2 }; ops.push(big);
      for (const ux of [len * 0.25, len * 0.72]) ops.push({ x0: ux - 0.6, x1: ux + 0.6, y0: 3.55, y1: 4.8, depth: 0.2 });
    } else if (f === back) {
      ops.push({ x0: len * 0.3 - 1.2, x1: len * 0.3 + 1.2, y0: 0, y1: 2.15, depth: 0.2, baie: true }, { x0: len * 0.75 - 0.5, x1: len * 0.75 + 0.5, y0: 1.1, y1: 2.2, depth: 0.2 });
      for (const ux of [len * 0.28, len * 0.7]) ops.push({ x0: ux - 0.55, x1: ux + 0.55, y0: 3.55, y1: 4.7, depth: 0.2 });
    } else if (R() < 0.5) ops.push({ x0: len / 2 - 0.4, x1: len / 2 + 0.4, y0: 3.7, y1: 4.6, depth: 0.2 }); // pignon : un petit jour à l'étage, une fois sur deux
    for (const op of ops) if (!op.y0 || op.y0 > 0.5) { const st = op.y0 === 0 && !op.baie ? null : shut(); if (st !== null) after.push((M) => { fdShutter(M, op, 0.2, voletT, st); if (op.y0 > 0.5) sill(M, op, 'concrete', [0.78, 0.77, 0.74]); }); }
    inFrame(F, (M) => {
      M.save().color(tint).world(1); M.aoFn = (x, y) => lerp(0.75, 1, smoothstep(0, 1.2, y));
      wallPierced(M, 'crepi', len, 0, h, ops, { depth: 0.2, back: true });
      M.restore();
      // soubassement gris (enduit taloché) entre les portes
      let cur = 0; for (const p of ops.filter((q) => q.y0 < 0.3)) { if (p.x0 - cur > 0.05) plinthSeg(M, cur, p.x0, { mat: 'concrete', h: 0.32, tint: FDP.socle }); cur = p.x1; }
      if (len - cur > 0.05) plinthSeg(M, cur, len, { mat: 'concrete', h: 0.32, tint: FDP.socle });
      for (const fn of after) fn(M);
      if (f === front || f === back) drainPipe(M, f === front ? 0.2 : len - 0.2, h - 0.1);
    });
  }
  fdRoof(x0, x1, z0, z1, h, { mat: o.roof, gable: tint, pitch: o.roof === 'slate' ? 0.72 : 0.6, chimney: o.chimney !== undefined ? o.chimney : x0 + (x1 - x0) * 0.25, velux: [[front === 'n' ? 1 : -1, x0 + (x1 - x0) * 0.3], [front === 'n' ? 1 : -1, x0 + (x1 - x0) * 0.72]] });
  // garage accolé : porte sectionnelle côté rue, toit plus bas qui finit contre le pignon de la maison
  const g = o.garage;
  if (g) {
    const gh = 2.7, gside = (g.x0 + g.x1) / 2 < (x0 + x1) / 2 ? 0 : 1; // le garage est à gauche (côté x0) ou à droite de la maison
    if (!o.open) {
      DECOR.col(g.x0, g.x1, 0, gh, g.z0, g.z1, 'concrete');
      for (const f of 'nsew') {
        if ((f === 'e' && gside === 0) || (f === 'w' && gside === 1)) continue; // le mur contre la maison
        const F = facadeFrame(f, g.x0, g.x1, g.z0, g.z1), len = F.len, ops = [];
        const gd = f === front ? { x0: 0.4, x1: len - 0.4, y0: 0, y1: 2.05, depth: 0.2, ferme: true } : null; if (gd) ops.push(gd); // fermée : ce n'est pas un passage
        inFrame(F, (M) => {
          M.save().color(tint).world(1); wallPierced(M, 'crepi', len, 0, gh, ops, { depth: 0.2, back: true }); M.restore();
          if (gd) fdGarageDoor(M, gd, 0.2, FDP.pvc, false); else plinthSeg(M, 0, len, { mat: 'concrete', h: 0.32, tint: FDP.socle });
        });
      }
    }
    if (!g.flat) fdRoof(g.x0, g.x1, g.z0, g.z1, gh, { mat: o.roof, gable: tint, pitch: 0.5, gables: gside === 0 ? [true, false] : [false, true], col: !o.open }); // flat : toit-terrasse posé par la carte
  }
}

/* ---------- Rue et jardins ---------- */
/* Poubelle à roulettes (cuve gris anthracite, couvercle de la couleur de la collecte) */
PF.fdBin = (lid = [0.98, 0.78, 0.12]) => prefab('fdBin' + lid.join(','), (M) => {
  M.local(1); M.color([0.24, 0.25, 0.26]);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0.1, 0.5, y));
  M.save().move(0.29, 0, 0).rotY(-Math.PI / 2); M.extrude('rubber', [[-0.33, 0.06], [0.33, 0.06], [0.37, 0.98], [-0.36, 0.98]], 0.58, { sharp: 0.2 }); M.restore(); // cuve évasée vers le haut
  M.aoFn = null;
  M.color(lid); M.boxB('plastic', -0.31, 0.31, 0.98, 1.04, -0.39, 0.38, { bevel: 0.02 });
  M.color([0.12, 0.12, 0.12]); M.boxB('plastic', -0.26, 0.26, 0.93, 0.99, -0.42, -0.36, { bevel: 0.01 }); // poignée
  for (const sd of [-1, 1]) { M.save().move(sd * 0.24, 0, -0.33).rotY(Math.PI / 2); wheel(M, 0.1, 0.05, { side: sd, rim: [0.25, 0.25, 0.25] }); M.restore(); }
  M.col(-0.3, 0.3, 0, 1.04, -0.38, 0.38, 'wood');
});
propType('fdBin', (a) => ({ pf: () => PF.fdBin(a.length ? a : undefined), shapes: [BOX(0, 0.52, 0, 0.32, 0.52, 0.4)], com: [0, 0.45, 0],
  mass: 14, mu: 0.6, e: 0.15, rr: 3, resp: 2, blast: 6, hold: 8, mat: 'metal', snd: 'plastic' }));
/* Boîte aux lettres sur pied (plastique beige, comme sur les photos) */
PF.fdMailbox = () => prefab('fdMailbox', (M) => {
  M.local(1); M.color([0.62, 0.62, 0.6]); M.boxB('steel', -0.03, 0.03, 0, 1.0, -0.03, 0.03);
  M.color([0.9, 0.86, 0.72]); M.boxB('plastic', -0.21, 0.21, 1.0, 1.32, -0.17, 0.17, { bevel: 0.025 });
  M.color([0.2, 0.2, 0.2]); M.boxB('plastic', -0.12, 0.12, 1.25, 1.27, 0.165, 0.18);
  M.col(-0.21, 0.21, 0, 1.32, -0.17, 0.17, 'wood');
});
/* Lampadaire de lotissement : mât gris effilé, lanterne plate */
PF.fdLamp = () => prefab('fdLamp', (M) => {
  M.color([0.42, 0.43, 0.44]).local(1);
  M.cyl('steel', 0.07, 4.6, 8, { r1: 0.045 });
  M.save().move(0, 4.6, 0); M.boxB('steel', -0.03, 0.03, -0.03, 0.03, 0, 0.5); M.restore();
  M.color([0.3, 0.31, 0.32]); M.boxB('steel', -0.16, 0.16, 4.5, 4.62, 0.4, 0.9, { bevel: 0.02 });
  M.cls = 1; M.color([0.9, 0.9, 0.86]); M.boxB('lampOff', -0.13, 0.13, 4.48, 4.5, 0.44, 0.86);
  M.col(-0.08, 0.08, 0, 4.6, -0.08, 0.08, 'metal');
});
/* Piscine hors-sol à structure tubulaire (diamètre 2 r, haute de 1,22 m) : liner bleu clair, margelle de PVC, poteaux, échelle ; l'eau est
   posée à part (pondAdd, bassin où l'on entre), ses collisions aussi (fdRingCols : la paroi seule) */
PF.fdPool = (r = 2.2) => prefab('fdPool' + r, (M) => {
  M.local(1); const n = 12, h = 1.22;
  M.color([0.55, 0.68, 0.78]); M.cyl('plastic', r, h - 0.05, 32, { caps: '' });
  M.color([0.42, 0.66, 0.8]); M.lathe('plastic', [[r - 0.03, h - 0.06], [r - 0.03, 0.02]], 32); // intérieur du liner, tourné vers l'eau (profil de haut en bas)
  M.save().move(0, 0.02, 0); M.color([0.36, 0.6, 0.76]); M.cyl('plastic', r - 0.02, 0.01, 32, { caps: 't' }); M.restore(); // fond du liner (sous l'eau, on ne voit pas la pelouse)
  M.color([0.86, 0.87, 0.88]); M.save().move(0, h - 0.06, 0); M.lathe('plastic', [[r - 0.06, 0], [r + 0.07, 0], [r + 0.07, 0.06], [r - 0.06, 0.06], [r - 0.06, 0]], 32, { sharp: 0.3 }); // margelle fermée tout autour M.restore();
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; M.save().move(Math.cos(a) * (r + 0.04), 0, Math.sin(a) * (r + 0.04)); M.cyl('steel', 0.03, h - 0.05, 6); M.restore(); }
  M.color([0.82, 0.83, 0.84]); M.cls = 1;
  for (const sd of [-1, 1]) M.tube('steel', 0.022, [[sd * 0.25, 0, r + 0.55], [sd * 0.25, h + 0.25, r + 0.05], [sd * 0.25, h + 0.3, r - 0.3], [sd * 0.25, 0.4, r - 0.55]], 6);
  for (const y of [0.35, 0.7, 1.0]) M.boxB('plastic', -0.25, 0.25, y, y + 0.04, r + 0.55 - (y / (h + 0.25)) * 0.5 - 0.08, r + 0.55 - (y / (h + 0.25)) * 0.5 + 0.08);
  M.cls = 0;
});
/* Paroi circulaire de rayon r (x, z), épaisseur e, hauteur h : n boîtes posées sur le cercle (l'intérieur reste libre) */
function fdRingCols(x, z, r, e, h, n) {
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * TAU, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r, hl = Math.PI * r / n + 0.03;
    const hx = Math.abs(Math.cos(a)) * e / 2 + Math.abs(Math.sin(a)) * hl, hz = Math.abs(Math.sin(a)) * e / 2 + Math.abs(Math.cos(a)) * hl;
    DECOR.col(cx - Math.min(hx, 0.42), cx + Math.min(hx, 0.42), 0, h, cz - Math.min(hz, 0.42), cz + Math.min(hz, 0.42), 'wood');
  }
}
/* Contour d'un cercle (n côtés) pour un bassin praticable */
function fdCirclePoly(x, z, r, n) { const P = []; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; P.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); } return P; }
/* Collisions d'un disque de rayon r (x, z) : quatre boîtes qui restent dans le cercle */
function fdDiscCols(x, z, r, h, m = 'wood') {
  for (const [a, b] of [[0.95, 0.31], [0.31, 0.95], [0.8, 0.6], [0.6, 0.8]]) DECOR.col(x - a * r, x + a * r, 0, h, z - b * r, z + b * r, m);
}
/* Trampoline à filet de protection : cadre et tapis à 0,8 m, poteaux mousse, filet tendu ; collisions à part (fdNetCols : le filet arrête les
   soldats, ni les tirs ni la vue) */
PF.fdTrampoline = (r = 1.8) => prefab('fdTramp' + r, (M) => {
  M.local(1); const n = 8, y = 0.8, H = 2.55;
  M.color([0.25, 0.27, 0.3]); M.save().move(0, y - 0.04, 0); M.cyl('plastic', r - 0.15, 0.02, 24); M.restore(); // tapis
  M.color([0.2, 0.45, 0.75]); M.save().move(0, y - 0.06, 0); M.lathe('plastic', [[r - 0.2, 0], [r + 0.05, 0], [r + 0.05, 0.08], [r - 0.2, 0.08]], 24); M.restore(); // protection des ressorts
  M.color([0.35, 0.36, 0.38]);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.4; M.tube('steel', 0.025, [[Math.cos(a - 0.3) * r, y - 0.06, Math.sin(a - 0.3) * r], [Math.cos(a) * (r + 0.05), 0, Math.sin(a) * (r + 0.05)], [Math.cos(a + 0.3) * r, y - 0.06, Math.sin(a + 0.3) * r]], 6); }
  for (let i = 0; i < n; i++) { const a = (i / n) * TAU; M.color([0.2, 0.45, 0.75]); M.save().move(Math.cos(a) * r, y - 0.06, Math.sin(a) * r); M.cyl('plastic', 0.04, H - y, 6); M.restore(); }
  M.color([0.12, 0.12, 0.13]); M.cls = 1;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU, a1 = ((i + 1) / n) * TAU, p = (a, yy) => [Math.cos(a) * r, yy, Math.sin(a) * r];
    M.quad('lattice', p(a0, y), p(a1, y), p(a1, H - 0.05), p(a0, H - 0.05), [Math.cos((a0 + a1) / 2), 0, Math.sin((a0 + a1) / 2)]);
  }
  M.cls = 0;
});
function fdNetCols(x, z, r, h) {
  for (const [a, b] of [[0.95, 0.31], [0.31, 0.95], [0.8, 0.6], [0.6, 0.8]]) COL.push({ x0: x - a * r, x1: x + a * r, y0: 0, y1: h, z0: z - b * r, z1: z + b * r, m: 'glass', ray: false, noRay: true });
}
/* Abri de jardin en PVC imitation bois (w x d, porte double sur la face +z), toit à deux pans de bac acier */
PF.fdShed = (w = 2.2, d = 2.0, tint = [0.62, 0.52, 0.4]) => prefab(`fdShed${w}_${d}_${tint.join(',')}`, (M) => {
  M.local(1); const h = 1.95, rise = 0.4;
  M.color(tint); M.boxB('paintwood', -w / 2, w / 2, 0, h, -d / 2, d / 2);
  for (const sd of [-1, 1]) M.tri3('paintwood', [sd * w / 2, h, -d / 2], [sd * w / 2, h, d / 2], [sd * w / 2, h + rise, 0], [sd, 0, 0]);
  M.color([0.3, 0.32, 0.3]);
  for (const s of [1, -1]) { const nl = hyp(d / 2 + 0.12, rise + 0.08); M.quad('corrugated', [-w / 2 - 0.08, h - 0.08, s * (d / 2 + 0.12)], [w / 2 + 0.08, h - 0.08, s * (d / 2 + 0.12)], [w / 2 + 0.08, h + rise, 0], [-w / 2 - 0.08, h + rise, 0], [0, (d / 2 + 0.12) / nl, (s * (rise + 0.08)) / nl]); M.quad('corrugated', [-w / 2 - 0.08, h - 0.1, s * (d / 2 + 0.12)], [w / 2 + 0.08, h - 0.1, s * (d / 2 + 0.12)], [w / 2 + 0.08, h + rise - 0.02, 0], [-w / 2 - 0.08, h + rise - 0.02, 0], [0, -1, 0]); }
  M.color(tint.map((c) => c * 0.8)); M.boxB('paintwood', -0.6, 0.6, 0.02, 1.8, d / 2, d / 2 + 0.025); M.color([0.15, 0.15, 0.15]); M.boxB('paintwood', -0.01, 0.01, 0.02, 1.8, d / 2 + 0.025, d / 2 + 0.03);
  M.col(-w / 2, w / 2, 0, h + rise * 0.5, -d / 2, d / 2, 'wood');
});
/* Balançoire de jardin : portique en tubes d'acier vert (3 m), deux sièges ; seuls les pieds arrêtent */
PF.fdSwing = () => prefab('fdSwing', (M) => {
  M.local(1); const L = 1.5, H = 2.1;
  M.color([0.2, 0.42, 0.28]);
  M.save().move(-L, H, 0).rotZ(-Math.PI / 2); M.cyl('steel', 0.04, 2 * L, 8); M.restore();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.tube('steel', 0.035, [[sx * L, H, 0], [sx * (L + 0.15), 0, sz * 0.75]], 6);
  for (const x of [-0.55, 0.55]) { M.color([0.5, 0.5, 0.5]); M.cls = 1; for (const dx of [-0.2, 0.2]) M.tube('steel', 0.006, [[x + dx, H, 0], [x + dx, 0.45, 0]], 3); M.cls = 0; M.color([0.85, 0.2, 0.15]); M.boxB('plastic', x - 0.24, x + 0.24, 0.42, 0.46, -0.1, 0.1, { bevel: 0.015 }); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.col(sx * (L + 0.15) - 0.08, sx * (L + 0.15) + 0.08, 0, 1.0, sz * 0.75 - 0.08, sz * 0.75 + 0.08, 'metal');
});
/* Séchoir parapluie : mât, quatre bras, fils (le linge, tissu simulé, se pend à la pose : fdDryerLinge) */
PF.fdDryer = () => prefab('fdDryer', (M) => {
  M.local(1); M.color([0.75, 0.76, 0.77]); M.cyl('steel', 0.025, 1.75, 6);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + 0.3; M.tube('steel', 0.012, [[0, 1.75, 0], [Math.cos(a) * 1.3, 1.62, Math.sin(a) * 1.3]], 4); M.tube('steel', 0.01, [[0, 1.2, 0], [Math.cos(a) * 0.7, 1.68, Math.sin(a) * 0.7]], 4); }
  M.cls = 2; M.color([0.85, 0.85, 0.8]);
  for (const k of [0.5, 0.8, 1.1]) for (let i = 0; i < 4; i++) { const a0 = (i / 4) * TAU + 0.3, a1 = ((i + 1) / 4) * TAU + 0.3, yk = 1.75 - (k / 1.3) * 0.13; M.tube('plastic', 0.004, [[Math.cos(a0) * k, yk, Math.sin(a0) * k], [Math.cos(a1) * k, yk, Math.sin(a1) * k]], 3); }
  M.cls = 0;
  M.col(-0.04, 0.04, 0, 1.75, -0.04, 0.04, 'metal');
});
/* Linge du séchoir posé en (x, z), tourné de ry : serviettes et t-shirts pendus aux fils (tissus simulés : ils flottent au vent et s'écartent
   au passage d'un soldat). pieces : [[bras 0 à 3, fil 0 à 2, position le long du fil -0,5 à 0,5, largeur, hauteur, teinte], ...] */
function fdDryerLinge(x, z, ry, pieces, grp) {
  const M = DECOR; M.save().move(x, 0, z).rotY(ry);
  for (const [i, f, u, w, h, c] of pieces) {
    const k = [0.5, 0.8, 1.1][f], a0 = (i / 4) * TAU + 0.3, a1 = ((i + 1) / 4) * TAU + 0.3, yk = 1.75 - (k / 1.3) * 0.13 - 0.01;
    const A = [Math.cos(a0) * k, Math.sin(a0) * k], B = [Math.cos(a1) * k, Math.sin(a1) * k], L = hyp(B[0] - A[0], B[1] - A[1]), tx = (B[0] - A[0]) / L, tz = (B[1] - A[1]) / L;
    const cx = (A[0] + B[0]) / 2 + tx * u * L, cz = (A[1] + B[1]) / 2 + tz * u * L;
    M.color(c); clothPiece(M, [cx - tx * w / 2, yk - h, cz - tz * w / 2], [cx + tx * w / 2, yk - h, cz + tz * w / 2], [cx + tx * w / 2, yk, cz + tz * w / 2], [cx - tx * w / 2, yk, cz - tz * w / 2], [tz, 0, -tx], { grp });
  }
  M.restore();
}
/* Table de jardin ronde en résine blanche et son parasol replié (prop physique, fdTableJardin) */
PF.fdTableJardin = () => prefab('fdTableJardin', (M) => {
  M.local(1); M.color([0.92, 0.92, 0.9]);
  M.save().move(0, 0.7, 0); M.cyl('plastic', 0.5, 0.04, 16); M.restore();
  M.cyl('plastic', 0.05, 0.7, 8);
  M.cyl('plastic', 0.28, 0.05, 12);
  M.color([0.8, 0.78, 0.7]); M.cyl('steel', 0.02, 2.1, 6);
  M.color([0.2, 0.32, 0.5]); M.save().move(0, 1.2, 0); M.cyl('canvas', 0.1, 0.85, 8, { r1: 0.06 }); M.restore();
  M.col(-0.5, 0.5, 0, 0.74, -0.5, 0.5, 'wood');
});
propType('fdTableJardin', { pf: () => PF.fdTableJardin(), shapes: [CYL(0, 0.37, 0, 0.5, 0.37), BOX(0, 1.42, 0, 0.1, 0.68, 0.1)], com: [0, 0.5, 0],
  contact: [[0.28, 0, 0], [-0.28, 0, 0], [0, 0, 0.28], [0, 0, -0.28], [0.5, 0.72, 0], [-0.5, 0.72, 0], [0, 0.72, 0.5], [0, 0.72, -0.5], [0, 2.1, 0]],
  mass: 9, mu: 0.5, e: 0.2, rr: 2, resp: 2.4, blast: 7, mat: 'metal', snd: 'plastic' });
/* Fauteuil monobloc en résine blanche (prop physique, fdChaise) : assise, dossier incliné, quatre pieds, accoudoirs ; devant vers +z */
PF.fdChaise = () => prefab('fdChaise', (M) => {
  M.local(1); M.color([0.92, 0.92, 0.9]);
  M.boxB('plastic', -0.25, 0.25, 0.4, 0.44, -0.22, 0.22, { bevel: 0.015 });
  M.save().move(0, 0.43, -0.21).rotX(-0.18); M.boxB('plastic', -0.24, 0.24, 0, 0.44, -0.02, 0.02, { bevel: 0.015 }); M.restore();
  for (const sx of [-1, 1]) {
    for (const z of [-0.19, 0.19]) M.boxB('plastic', sx * 0.22 - 0.025, sx * 0.22 + 0.025, 0, 0.41, z - 0.025, z + 0.025);
    M.boxB('plastic', sx * 0.25 - 0.03, sx * 0.25 + 0.03, 0.6, 0.63, -0.22, 0.2, { bevel: 0.01 }); M.boxB('plastic', sx * 0.25 - 0.02, sx * 0.25 + 0.02, 0.43, 0.6, 0.15, 0.19);
  }
  M.col(-0.28, 0.28, 0, 0.63, -0.24, 0.24, 'wood');
});
propType('fdChaise', { pf: () => PF.fdChaise(), shapes: [BOX(0, 0.43, -0.01, 0.27, 0.43, 0.24)], com: [0, 0.38, 0],
  contact: [[-0.22, 0, -0.19], [0.22, 0, -0.19], [-0.22, 0, 0.19], [0.22, 0, 0.19], [-0.25, 0.63, 0.2], [0.25, 0.63, 0.2], [-0.24, 0.86, -0.29], [0.24, 0.86, -0.29]],
  mass: 2.5, mu: 0.5, e: 0.25, resp: 3.2, blast: 9, mat: 'metal', snd: 'plastic' });
/* Salon de jardin posé en (x, z) : la table et quatre fauteuils tournés vers elle (props physiques) */
function fdGardenSetAt(x, z, ry) {
  const M = DECOR; M.dyn('fdTableJardin', x, 0, z, ry);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + ry, cx = x + Math.cos(a) * 0.86, cz = z + Math.sin(a) * 0.86; M.dyn('fdChaise', cx, 0, cz, Math.atan2(x - cx, z - cz)); }
}
/* Barbecue boule sur trépied */
PF.fdBbq = () => prefab('fdBbq', (M) => {
  M.local(1); M.color([0.08, 0.08, 0.09]);
  M.save().move(0, 0.62, 0); M.lathe('steel', [[0, 0], [0.22, 0.02], [0.28, 0.15], [0.28, 0.2], [0.27, 0.38], [0.18, 0.5], [0, 0.53]], 14); M.restore();
  M.color([0.6, 0.6, 0.6]); for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; M.tube('steel', 0.012, [[Math.cos(a) * 0.12, 0.66, Math.sin(a) * 0.12], [Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3]], 4); }
  M.col(-0.26, 0.26, 0, 1.12, -0.26, 0.26, 'metal');
});
propType('fdBbq', { pf: () => PF.fdBbq(), shapes: [CYL(0, 0.58, 0, 0.29, 0.58)], com: [0, 0.75, 0],
  contact: [[0.3, 0, 0], [-0.15, 0, 0.26], [-0.15, 0, -0.26], [0.28, 0.82, 0], [-0.28, 0.82, 0], [0, 0.82, 0.28], [0, 0.82, -0.28], [0, 1.15, 0]],
  mass: 9, mu: 0.55, e: 0.2, rr: 2, resp: 2.2, blast: 7, mat: 'metal', snd: 'metal' });
/* Conteneur d'apport volontaire (verre, papiers) : cuve métallique 1,5 x 1,5 x 1,7, toit bombé, ouvertures, pictogramme */
PF.fdTri = (tint, sign) => prefab('fdTri' + tint.join(',') + sign, (M) => {
  M.local(1); M.color(tint);
  M.boxB('paint', -0.75, 0.75, 0.05, 1.45, -0.75, 0.75, { bevel: 0.05 });
  M.boxB('paint', -0.74, 0.74, 1.42, 1.62, -0.74, 0.74, { bevel: 0.14 }); // dessus bombé
  M.color([0.12, 0.12, 0.12]); for (const sz of [-1, 1]) { M.save().move(0, 1.25, sz * 0.751); M.cyl('dark', 0.11, 0.002, 12); M.restore(); }
  M.color([0.35, 0.35, 0.35]); M.boxB('steel', -0.12, 0.12, 1.62, 1.78, -0.12, 0.12); // crochet de levage
  M.save().move(0, 0, 0.756); fdSign(M, 0, 0.55, 1.1, 0.55, sign, null); M.restore();
  M.col(-0.75, 0.75, 0, 1.62, -0.75, 0.75, 'metal');
});
/* Poste de transformation : cabine de béton beige, portes métalliques, ventilations, panneau « danger de mort » */
PF.fdTransfo = () => prefab('fdTransfo', (M) => {
  M.local(1); const w = 2.6, d = 2.0, h = 2.4;
  M.color([0.84, 0.8, 0.7]); M.boxB('concrete', -w / 2, w / 2, 0, h, -d / 2, d / 2);
  M.color([0.7, 0.68, 0.62]); M.boxB('concrete', -w / 2 - 0.06, w / 2 + 0.06, h, h + 0.12, -d / 2 - 0.06, d / 2 + 0.06, { bevel: 0.02 });
  M.color([0.36, 0.42, 0.38]);
  for (const x of [-0.65, 0.55]) { M.boxB('paint', x - 0.45, x + 0.45, 0.1, 2.05, d / 2, d / 2 + 0.03); for (let y = 1.6; y < 1.95; y += 0.07) { M.color([0.15, 0.15, 0.15]); M.boxB('dark', x - 0.3, x + 0.3, y, y + 0.03, d / 2 + 0.03, d / 2 + 0.035); M.color([0.36, 0.42, 0.38]); } }
  M.save().move(-0.65, 0, d / 2 + 0.032); fdSign(M, 0, 1.1, 0.42, 0.22, FDS.danger, null); M.restore();
  M.col(-w / 2, w / 2, 0, h + 0.12, -d / 2, d / 2, 'concrete');
});
/* Toboggan de jardin en bois : petite tour (plancher à 1 m) fermée de planches, échelle sur le côté -x, bac à sable bâché au pied,
   glissière vert anis ondulée de 2 m vers +z ; sous la glissière, des collisions en gradins */
PF.fdSlide = () => prefab('fdSlide', (M) => {
  M.local(1); const W = 0.55, Y = 1.0, za = -1.1, zb = 0;
  M.color([0.7, 0.5, 0.3]);
  for (const x of [-W, W]) for (const z of [za, zb]) M.boxB('wood', x - 0.045, x + 0.045, 0, 1.7, z - 0.045, z + 0.045, { bevel: 0.01 }); // poteaux
  M.boxB('wood', -W, W, Y - 0.06, Y, za, zb); // plancher
  M.color([0.76, 0.56, 0.34]);
  // garde-corps de planches verticales : fond, côté +x, côté -x (ouvert sur l'échelle), devant (ouvert sur la glissière)
  const planks = (axis, fixed, a0, a1) => { for (let u = a0 + 0.06; u < a1 - 0.04; u += 0.13) { if (axis === 'x') M.boxB('wood', u - 0.05, u + 0.05, Y + 0.05, Y + 0.62, fixed - 0.015, fixed + 0.015); else M.boxB('wood', fixed - 0.015, fixed + 0.015, Y + 0.05, Y + 0.62, u - 0.05, u + 0.05); } };
  planks('x', za, -W, W); planks('z', W, za, zb); planks('z', -W, za, -0.75); planks('x', zb, -W, -0.26); planks('x', zb, 0.26, W);
  for (const [axis, fixed, a0, a1] of [['x', za, -W, W], ['z', W, za, zb]]) { if (axis === 'x') M.boxB('wood', a0, a1, Y + 0.62, Y + 0.68, fixed - 0.035, fixed + 0.035); else M.boxB('wood', fixed - 0.035, fixed + 0.035, Y + 0.62, Y + 0.68, a0, a1); } // lisses
  // échelle : deux montants inclinés et quatre barreaux
  for (const z of [-0.7, -0.3]) M.tube('wood', 0.03, [[-W - 0.02, Y + 0.6, z], [-W - 0.5, 0, z]], 5);
  for (let i = 1; i <= 4; i++) { const t = i / 5; M.save().move(-W - 0.02 - 0.48 * (1 - t), (Y + 0.6) * t * 0.95, -0.7).rotX(Math.PI / 2); M.cyl('wood', 0.022, 0.4, 6); M.restore(); }
  // bac à sable au pied de la tour : bordure de planches, bâche noire, sable
  M.color([0.62, 0.45, 0.28]);
  for (const sd of [-1, 1]) { M.boxB('wood', -0.75, 0.75, 0, 0.16, sd > 0 ? 0.12 : -1.32, sd > 0 ? 0.2 : -1.24); M.boxB('wood', sd * 0.75 - 0.04, sd * 0.75 + 0.04, 0, 0.16, -1.24, 0.12); }
  M.color([0.1, 0.1, 0.11]); M.quad('canvas', [-0.71, 0.1, -1.24], [0.71, 0.1, -1.24], [0.71, 0.1, 0.12], [-0.71, 0.1, 0.12], [0, 1, 0]);
  // glissière ondulée : fond et rebords le long d'un profil (du bord du plancher au sol, deux creux)
  const N = 18, L = 2.0, prof = (t) => { const z = zb + t * L, d = Math.min(1, t / 0.86); return [z, 0.2 + (Y - 0.2) * Math.pow(1 - d, 1.15) + 0.06 * Math.sin(d * Math.PI * 2) * (1 - d) + (t > 0.86 ? (t - 0.86) * 0.25 : 0)]; };
  M.color([0.62, 0.84, 0.18]);
  const P = []; for (let i = 0; i <= N; i++) P.push(prof(i / N));
  for (let i = 0; i < N; i++) {
    const [z0, y0] = P[i], [z1, y1] = P[i + 1], dz = z1 - z0, dy = y1 - y0, l = hyp(dz, dy), n = [0, dz / l, -dy / l];
    M.quad('plastic', [-0.22, y0, z0], [0.22, y0, z0], [0.22, y1, z1], [-0.22, y1, z1], n); // fond
    M.quad('plastic', [-0.26, y0 - 0.04, z0], [0.26, y0 - 0.04, z0], [0.26, y1 - 0.04, z1], [-0.26, y1 - 0.04, z1], n.map((c) => -c)); // dessous
    for (const sd of [-1, 1]) {
      M.quad('plastic', [sd * 0.22, y0, z0], [sd * 0.22, y1, z1], [sd * 0.22, y1 + 0.14, z1], [sd * 0.22, y0 + 0.14, z0], [-sd, 0, 0]); // rebord, dedans
      M.quad('plastic', [sd * 0.26, y0 - 0.04, z0], [sd * 0.26, y1 - 0.04, z1], [sd * 0.26, y1 + 0.14, z1], [sd * 0.26, y0 + 0.14, z0], [sd, 0, 0]); // dehors
      M.quad('plastic', [sd * 0.22, y0 + 0.14, z0], [sd * 0.26, y0 + 0.14, z0], [sd * 0.26, y1 + 0.14, z1], [sd * 0.22, y1 + 0.14, z1], [0, 1, 0]); // dessus du rebord
    }
  }
  { const [z, y] = P[N]; M.quad('plastic', [-0.26, y - 0.04, z], [0.26, y - 0.04, z], [0.26, y + 0.14, z], [-0.26, y + 0.14, z], [0, 0, 1]); } // bout
  M.color([0.62, 0.45, 0.28]); for (const sd of [-1, 1]) M.boxB('wood', sd * 0.2 - 0.03, sd * 0.2 + 0.03, 0, 0.2, 1.62, 1.68); // pieds du bas
  for (const x of [-W, W]) for (const z of [za, zb]) M.col(x - 0.05, x + 0.05, 0, 1.7, z - 0.05, z + 0.05, 'wood');
  M.col(-W, W, Y - 0.06, Y, za, zb, 'wood'); M.col(-W, W, Y, Y + 0.68, za - 0.03, za + 0.03, 'wood'); M.col(W - 0.03, W + 0.03, Y, Y + 0.68, za, zb, 'wood');
  M.col(-W - 0.03, -W + 0.03, Y, Y + 0.68, za, -0.75, 'wood'); M.col(-W, -0.26, Y, Y + 0.68, zb - 0.03, zb + 0.03, 'wood'); M.col(0.26, W, Y, Y + 0.68, zb - 0.03, zb + 0.03, 'wood');
  M.col(-0.75, 0.75, 0, 0.1, -1.32, 0.2, 'wood'); // bac à sable (on marche sur la bâche)
  for (const [z0, z1, y] of [[0, 0.5, 0.7], [0.5, 1.0, 0.42], [1.0, 1.5, 0.22]]) M.col(-0.26, 0.26, 0, y, z0, z1, 'plastic'); // sous la glissière
});
/* Canapé (déménagement) : tissu gris, accoudoirs */
PF.fdSofa = (tint = [0.52, 0.5, 0.48]) => prefab('fdSofa' + tint.join(','), (M) => {
  M.local(1); M.color(tint);
  M.boxB('canvas', -1.0, 1.0, 0.1, 0.45, -0.45, 0.45, { bevel: 0.05 }); M.boxB('canvas', -1.0, 1.0, 0.45, 0.85, -0.45, -0.22, { bevel: 0.06 });
  for (const sx of [-1, 1]) M.boxB('canvas', sx * 1.0 - (sx > 0 ? 0.2 : 0), sx * 1.0 + (sx > 0 ? 0 : 0.2), 0.1, 0.62, -0.45, 0.45, { bevel: 0.05 });
  M.color([0.82, 0.8, 0.76]); for (const x of [-0.45, 0.45]) M.boxB('canvas', x - 0.42, x + 0.42, 0.45, 0.55, -0.2, 0.4, { bevel: 0.04 });
  M.color([0.15, 0.12, 0.1]); for (const sx of [-0.9, 0.9]) for (const sz of [-0.38, 0.38]) M.boxB('wood', sx - 0.03, sx + 0.03, 0, 0.1, sz - 0.03, sz + 0.03);
  M.col(-1.0, 1.0, 0, 0.85, -0.45, 0.45, 'wood');
});
/* Sucette publicitaire (mobilier urbain) : panneau rétroéclairé de 1,3 x 2 m sur pied, l'affiche des derniers lots des deux côtés */
PF.fdMupi = () => prefab('fdMupi', (M) => {
  M.local(1); M.color([0.3, 0.31, 0.32]);
  M.boxB('paint', -0.7, 0.7, 0.35, 2.55, -0.12, 0.12, { bevel: 0.03 });
  M.boxB('paint', -0.12, 0.12, 0, 0.35, -0.08, 0.08);
  M.save().move(0, 0, 0.121); fdSign(M, 0, 0.5, 1.2, 1.9, FDS.mupi, null); M.restore();
  M.save().move(0, 0, -0.121).rotY(Math.PI); fdSign(M, 0, 0.5, 1.2, 1.9, FDS.mupiVente, null); M.restore();
  M.col(-0.7, 0.7, 0, 2.55, -0.12, 0.12, 'metal');
});
/* Caravane remisée (5,6 m, caisse blanche à bande, baies, porte, timon, roues) ; front : timon vers -z */
PF.fdCaravan = () => prefab('fdCaravan', (M) => {
  M.local(1); const L = 5.6, W = 2.2, H = 2.55, y0 = 0.4, hl = L / 2, hw = W / 2;
  M.color([0.94, 0.94, 0.92]);
  M.save().move(hw, y0, 0).rotY(-Math.PI / 2); M.extrude('paint', [[-hl, 0], [hl, 0], [hl, H - y0 - 0.25], [hl - 0.3, H - y0], [-hl + 0.4, H - y0], [-hl, H - y0 - 0.4]], W, { sharp: 0.3 }); M.restore();
  M.color([0.55, 0.62, 0.7]); for (const sd of [-1, 1]) M.boxB('paint', sd * (hw + 0.004) - 0.004, sd * (hw + 0.004) + 0.004, y0 + 0.55, y0 + 0.75, -hl + 0.05, hl - 0.05);
  M.color([0.1, 0.12, 0.14]); M.cls = 1;
  for (const sd of [-1, 1]) for (const [z0, z1] of [[-1.9, -0.9], [0.6, 1.8]]) M.quad('glass', [sd * (hw + 0.01), y0 + 1.0, z0], [sd * (hw + 0.01), y0 + 1.0, z1], [sd * (hw + 0.01), y0 + 1.7, z1], [sd * (hw + 0.01), y0 + 1.7, z0], [sd, 0, 0]);
  M.quad('glass', [-0.7, y0 + 1.1, -hl - 0.01], [0.7, y0 + 1.1, -hl - 0.01], [0.7, y0 + 1.7, -hl - 0.01], [-0.7, y0 + 1.7, -hl - 0.01], [0, 0, -1]);
  M.color([0.82, 0.82, 0.8]); M.boxB('paint', hw, hw + 0.03, y0 + 0.1, y0 + 1.95, -0.2, 0.5); M.cls = 0;
  M.color([0.2, 0.2, 0.2]); M.tube('steel', 0.04, [[-0.6, 0.45, -hl], [0, 0.4, -hl - 1.1], [0.6, 0.45, -hl]], 6); M.boxB('steel', -0.05, 0.05, 0, 0.42, -hl - 1.15, -hl - 1.05);
  for (const sd of [-1, 1]) { M.save().move(sd * (hw - 0.15), 0, 0.2); wheel(M, 0.32, 0.18, { side: sd, rim: [0.6, 0.6, 0.6] }); M.restore(); }
  M.col(-hw, hw, 0, H, -hl, hl, 'metal');
});
/* Ballon d'enfant en plastique (prop physique, fdBallon, a : sa couleur ; il roule, les balles le poussent). La couleur est dans le prefab :
   la teinte d'instance ne prend pas sur les corps ronds (les fruits sortent blancs eux aussi) */
PF.fdBallon = (c = [0.9, 0.2, 0.15]) => prefab('fdBallon' + c.join(','), (M) => {
  M.local(1); M.color(c); M.save().move(0, 0.11, 0); M.geo('plastic', new THREE.SphereGeometry(0.11, 12, 8)); M.restore();
});
propType('fdBallon', (a) => ({ pf: () => PF.fdBallon(a.length ? a : undefined), shapes: [SPH(0, 0.11, 0, 0.11)], mass: 0.35, mu: 0.5, e: 0.6, rr: 0.8, resp: 6, blast: 12, lift: 1.0, through: true, ball: true, mat: 'dirt', snd: 'soft' }));
/* Nain de jardin en céramique (prop physique, fdNain : il tombe, et se brise en éclats sous les balles) : bonnet rouge pointu, barbe
   blanche, veste bleue, socle vert */
PF.fdNain = () => prefab('fdNain', (M) => {
  M.local(1);
  M.color([0.3, 0.5, 0.25]); M.cyl('paint', 0.13, 0.04, 10);
  M.color([0.25, 0.4, 0.7]); M.save().move(0, 0.04, 0); M.lathe('paint', [[0.11, 0], [0.12, 0.08], [0.1, 0.2], [0.07, 0.26], [0, 0.27]], 10); M.restore();
  M.color([0.95, 0.94, 0.9]); M.save().move(0, 0.2, 0.035); M.lathe('paint', [[0, -0.06], [0.06, 0.0], [0.065, 0.06], [0.03, 0.1], [0, 0.1]], 8); M.restore(); // barbe
  M.color([0.95, 0.75, 0.62]); M.save().move(0, 0.33, 0); M.geo('paint', new THREE.SphereGeometry(0.055, 10, 8)); M.restore();
  M.color([0.85, 0.15, 0.12]); M.save().move(0, 0.35, -0.01); M.lathe('paint', [[0.065, 0], [0.06, 0.04], [0.035, 0.1], [0.01, 0.15], [0, 0.16]], 10); M.restore(); // bonnet
  M.col(-0.12, 0.12, 0, 0.5, -0.12, 0.12, 'wood');
});
propType('fdNain', { pf: () => PF.fdNain(), shapes: [CYL(0, 0.25, 0, 0.12, 0.25)], com: [0, 0.18, 0], mass: 4, mu: 0.7, e: 0.2, resp: 3, blast: 8, hp: 15, mat: 'dirt', snd: 'clay', brk: 'clay', debris: [['shard', 5]] });

/* ---------- Chantier ---------- */
/* Bétonnière de chantier (prop physique, fdMixer) : châssis de tubes rouges en A sur deux roues et deux pieds, cuve orange inclinée sur sa
   fourche, moteur, volant de basculement ; roues vers +z */
PF.fdMixer = () => prefab('fdMixer', (M) => {
  M.local(1); M.color([0.75, 0.18, 0.12]);
  for (const sd of [-1, 1]) {
    M.tube('steel', 0.028, [[sd * 0.4, 0.22, 0.38], [sd * 0.26, 0.86, 0], [sd * 0.34, 0.02, -0.44]], 6); // flanc en A : de l'essieu au pied
    M.tube('steel', 0.022, [[sd * 0.4, 0.22, 0.38], [sd * 0.34, 0.12, -0.44]], 6); // traverse basse
    M.boxB('steel', sd * 0.34 - 0.05, sd * 0.34 + 0.05, 0, 0.03, -0.49, -0.39); // semelle du pied
    M.save().move(sd * 0.47, 0, 0.38); wheel(M, 0.22, 0.07, { side: sd, rim: [0.7, 0.2, 0.15] }); M.restore();
  }
  M.save().move(-0.42, 0.22, 0.38).rotZ(-Math.PI / 2); M.cyl('steel', 0.02, 0.84, 6); M.restore(); // essieu
  M.save().move(-0.27, 0.86, 0).rotZ(-Math.PI / 2); M.cyl('steel', 0.03, 0.54, 6); M.restore(); // axe de basculement
  M.color([0.3, 0.32, 0.34]); M.boxB('paint', 0.3, 0.46, 0.5, 0.74, -0.16, 0.12, { bevel: 0.02 }); // moteur
  M.color([0.2, 0.2, 0.2]); { const pts = []; for (let i = 0; i <= 16; i++) { const t = (i / 16) * TAU; pts.push([-0.36, 0.86 + Math.cos(t) * 0.16, Math.sin(t) * 0.16]); } M.tube('steel', 0.015, pts, 4); } // volant
  M.color([0.92, 0.5, 0.12]); M.save().move(0, 0.92, 0.04).rotX(-0.55); M.lathe('paint', [[0, -0.32], [0.3, -0.28], [0.4, 0.0], [0.36, 0.3], [0.2, 0.56], [0.16, 0.6]], 16);
  M.color([0.35, 0.33, 0.3]); M.lathe('paint', [[0.145, 0.6], [0.18, 0.55], [0.34, 0.3], [0.38, 0.0], [0.28, -0.27], [0, -0.3]], 16); M.restore(); // intérieur de la cuve (profil inverse) : on ne voit pas au travers par la bouche
  M.color([0.55, 0.55, 0.55]); M.save().move(0, 0.92, 0.04).rotX(-0.55).move(0, -0.02, 0); M.cyl('steel', 0.41, 0.05, 16); M.restore(); // couronne
  M.col(-0.5, 0.5, 0, 1.4, -0.5, 0.6, 'metal');
});
propType('fdMixer', { pf: () => PF.fdMixer(), shapes: [BOX(0, 0.7, 0.05, 0.48, 0.7, 0.55)], com: [0, 0.6, 0.05],
  contact: [[-0.5, 0, 0.38], [0.5, 0, 0.38], [-0.34, 0, -0.44], [0.34, 0, -0.44], [0, 1.45, 0.3], [0.4, 1.2, 0.4], [-0.4, 1.2, 0.4], [0.45, 0.6, -0.2], [-0.45, 0.6, -0.2]],
  mass: 80, mu: 0.75, e: 0.1, rr: 3, resp: 1.2, blast: 4, hold: 60, mat: 'metal', snd: 'metal' });
/* Brouette de chantier (prop physique, fdBrouette) : bac de tôle galvanisée évasé et ouvert, un peu de sable dedans, brancards de tube posés
   sur la roue (devant, +z) et sur deux pieds à l'arrière, poignées noires */
PF.fdBrouette = () => prefab('fdBrouette', (M) => {
  M.local(1);
  // bac : fond et quatre parois évasées, tôle vue des deux côtés
  const B = [[-0.2, 0.38, -0.18], [0.2, 0.38, -0.18], [0.2, 0.38, 0.3], [-0.2, 0.38, 0.3]], T = [[-0.34, 0.66, -0.34], [0.34, 0.66, -0.34], [0.34, 0.66, 0.52], [-0.34, 0.66, 0.52]];
  const face = (a, b, c, d) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]], n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(...n);
    for (const k of [1, -1]) M.quad('steel', a, b, c, d, n.map((x) => (k * x) / l));
  };
  M.color([0.62, 0.64, 0.66]);
  face(B[0], B[1], B[2], B[3]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; face(B[i], B[j], T[j], T[i]); }
  M.color([0.5, 0.52, 0.54]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; M.tube('steel', 0.015, [T[i], T[j]], 4); } // bord roulé
  M.color([0.72, 0.62, 0.46]); M.save().move(0, 0.44, 0.07).scl(1, 1, 1.5); M.lathe('dirt', [[0, 0.14], [0.12, 0.12], [0.22, 0.05], [0.26, 0]], 10); M.restore(); // sable
  // brancards et pieds (tube vert), roue
  M.color([0.2, 0.4, 0.28]);
  for (const sd of [-1, 1]) {
    M.tube('steel', 0.022, [[sd * 0.3, 0.58, -1.05], [sd * 0.22, 0.37, -0.3], [sd * 0.08, 0.22, 0.62]], 6);
    M.tube('steel', 0.02, [[sd * 0.22, 0.37, -0.28], [sd * 0.26, 0.02, -0.36]], 5);
    M.boxB('steel', sd * 0.26 - 0.03, sd * 0.26 + 0.03, 0, 0.03, -0.42, -0.3);
  }
  M.color([0.08, 0.08, 0.08]); for (const sd of [-1, 1]) { M.save().move(sd * 0.3, 0.58, -1.05).rotX(-0.27).move(0, 0, 0); M.save().rotX(Math.PI / 2); M.cyl('rubber', 0.03, 0.16, 6); M.restore(); M.restore(); } // poignées
  M.color([0.12, 0.12, 0.12]); M.save().move(0.045, 0.2, 0.62).rotZ(Math.PI / 2); M.cyl('rubber', 0.2, 0.09, 12); M.restore();
  M.color([0.7, 0.7, 0.7]); M.save().move(0.06, 0.2, 0.62).rotZ(Math.PI / 2); M.cyl('steel', 0.07, 0.12, 8); M.restore(); // moyeu
  M.col(-0.36, 0.36, 0, 0.7, -1.05, 0.82, 'metal');
});
propType('fdBrouette', { pf: () => PF.fdBrouette(), shapes: [BOX(0, 0.35, -0.12, 0.35, 0.35, 0.93)], com: [0, 0.42, 0.05],
  contact: [[0, 0, 0.62], [-0.26, 0, -0.36], [0.26, 0, -0.36], [-0.34, 0.66, -0.34], [0.34, 0.66, -0.34], [-0.34, 0.66, 0.52], [0.34, 0.66, 0.52], [-0.3, 0.58, -1.05], [0.3, 0.58, -1.05], [0, 0.4, 0.82]],
  mass: 30, mu: 0.6, e: 0.15, rr: 3, resp: 1.6, blast: 5, hold: 25, mat: 'metal', snd: 'metal' });
/* Palette de parpaings filmée (1,2 x 1,0, 1 m) */
PF.fdBlockPallet = () => prefab('fdBlockPallet', (M) => {
  M.local(1); M.color([0.62, 0.5, 0.36]); M.boxB('wood', -0.6, 0.6, 0, 0.13, -0.5, 0.5);
  M.color([0.85, 0.84, 0.8]); M.world(1); M.boxB('parpaing', -0.58, 0.58, 0.13, 0.98, -0.48, 0.48);
  M.col(-0.6, 0.6, 0, 0.98, -0.5, 0.5, 'concrete');
});
/* Benne de chantier (3,6 x 1,8) : tôle jaune, côtés évasés, gravats */
PF.fdSkip = () => prefab('fdSkip', (M) => {
  M.local(1); M.color([0.88, 0.66, 0.12]);
  // parois évasées, tôle vue des deux côtés (faces extérieures, puis intérieures)
  for (const k of [1, -1]) {
    for (const sz of [-1, 1]) M.quad('paint', [-1.8, 0.05, sz * 0.75], [1.8, 0.05, sz * 0.75], [2.0, 1.4, sz * 0.9], [-2.0, 1.4, sz * 0.9], [0, 0.1 * k, sz * k]);
    for (const sx of [-1, 1]) M.quad('paint', [sx * 1.8, 0.05, -0.75], [sx * 1.8, 0.05, 0.75], [sx * 2.0, 1.4, 0.9], [sx * 2.0, 1.4, -0.9], [sx * k, 0.15 * k, 0]);
  }
  for (const sz of [-1, 1]) M.boxB('paint', -2.02, 2.02, 1.36, 1.44, sz * 0.9 - 0.04, sz * 0.9 + 0.04); // rebord
  M.boxB('paint', -1.8, 1.8, 0, 0.08, -0.75, 0.75);
  M.color([0.5, 0.48, 0.44]); M.boxB('rubble', -1.85, 1.85, 0.9, 1.0, -0.8, 0.8, { bevel: 0.2 });
  M.color([0.62, 0.6, 0.55]); const R = rngOf(611); M.cls = 1;
  for (let i = 0; i < 26; i++) { const s = R.range(0.12, 0.32); M.save().move(R.range(-1.6, 1.6), 0.95 + R() * 0.2, R.range(-0.6, 0.6)).rotY(R() * TAU).rotX(R() - 0.5); M.box(R() < 0.5 ? 'parpaing' : 'concrete', s * 1.6, s, s); M.restore(); }
  M.cls = 0;
  M.col(-1.95, 1.95, 0, 1.4, -0.85, 0.85, 'metal');
});
/* Barrière de chantier (grillage galvanisé de 3,5 m sur plots de béton) de (xa, za) à (xb, zb) : arrête les soldats, ni les tirs ni la vue */
function fdHeras(xa, za, xb, zb) {
  const M = DECOR, L = hyp(xb - xa, zb - za), n = Math.max(1, Math.round(L / 3.5)), ux = (xb - xa) / L, uz = (zb - za) / L;
  M.save().color([0.45, 0.46, 0.47]); M.cls = 1;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * L, b = ((i + 1) / n) * L, p = (t, y) => [xa + ux * t, y, za + uz * t];
    M.quad('lattice', p(a, 0.15), p(b, 0.15), p(b, 2.0), p(a, 2.0), [uz, 0, -ux]); // panneaux jointifs : pas de jour entre deux
    M.tube('steel', 0.02, [p(a + 0.02, 0.12), p(a + 0.02, 2.02), p(b - 0.02, 2.02), p(b - 0.02, 0.12), p(a + 0.02, 0.12)], 5);
  }
  M.cls = 0; M.color([0.6, 0.6, 0.58]).local(1);
  for (let i = 0; i <= n; i++) { const t = (i / n) * L; M.save().move(xa + ux * t, 0, za + uz * t).rotY(Math.atan2(ux, uz)); M.boxB('concrete', -0.1, 0.1, 0, 0.14, -0.35, 0.35, { bevel: 0.02 }); M.restore(); }
  M.restore();
  const x0 = Math.min(xa, xb) - (Math.abs(uz) > 0.5 ? 0.06 : 0), x1 = Math.max(xa, xb) + (Math.abs(uz) > 0.5 ? 0.06 : 0), z0 = Math.min(za, zb) - (Math.abs(ux) > 0.5 ? 0.06 : 0), z1 = Math.max(za, zb) + (Math.abs(ux) > 0.5 ? 0.06 : 0);
  COL.push({ x0, x1, y0: 0, y1: 2.0, z0, z1, m: 'metal', ray: false, noRay: true });
}
/* Matières propres au lotissement (en plus de celles de la flore : haies, verre clair) */
function makeFdMaterials(M) {
  makeFloraMaterials(M);
  M('slate', { tex: 'slate', env: 0.7, macro: 0.3, grime: 0.3 });
  // crépi des pavillons (l'enduit photographié, peu sali : des maisons de quelques années) ; peinture lisse de la maison témoin, neuve
  M('crepi', { tex: 'plaster', grime: 0.45, streak: 0.35, dust: 0.35, macro: 0.3, relief: 0.25 });
  M('peinture', { tex: 'plaster', grime: 0.05, streak: 0, dust: 0.05, macro: 0.12, relief: 0.08 });
  M('parpaing', { tex: 'parpaing', grime: 0.6, streak: 0.5, dust: 0.6, macro: 0.3 });
  M('signs5', { tex: 'signs5', rough: 0.5, env: 0.5, macro: 0.05, scale: 1, noNormal: true });
}
function fdKit() { floraKit(); TEX.signs5 = fdSignAtlas(); }

}catch(e){HOOKS.missing['02ym-pavillons-kit.js']=String(e&&e.message||e)}
/* ===== 02yg-doom-kit.js ===== */
try{
/* ==========================================================================
   KIT VOLCANIQUE : surfaces, matières, atlas et objets de Doom, la station de recherche au pied du volcan.
   - Surfaces procédurales (facultatives, générées seulement pour une carte qui les demande, voir OPT_TEX) : cendre et
     scories (le sol), basalte (blocs de lave, coulées, enrochements), mousse laineuse des champs de lave, panneaux
     composites des façades de la station (teintés par les sommets), gaine d'aluminium des conduites de vapeur ;
   - Atlas dessinés : enseignes de la station, panneaux de danger, décalques (marquages, numéros de puits, héliport) ;
   - Objets : conduites et leurs supports, têtes de puits et silencieux, séparateurs, turbines, aéroréfrigérants,
     instruments (sismomètre, station GPS, mât météo), radôme, hélicoptère de la station, derrick, mât de télécommunication.
   Le plan de la carte est dans 02yh-doom.js. Tout se construit au chargement et se libère avec la carte.
   ========================================================================== */
Object.assign(TEXLAB, {
  /* cendre et scories : grains noirs, lapilli rougeâtres, quelques pierres ponces claires, rides laissées par le vent */
  ash: [1024, 401, 1.6, `
    float big = gfbm(uv, vec2(3.0), 5, 1.0), mid = gfbm(uv, vec2(18.0), 4, 2.0), gr = vn(uv * 320.0, vec2(320.0), 3.0);
    float rp = sin((uv.y * 14.0 + uv.x * 3.0 + big * 2.5) * 6.2831853) * 0.5 + 0.5; rp *= smoothstep(0.5, 0.8, gfbm(uv + 0.37, vec2(2.0), 3, 4.0));
    vec4 v = vor(uv, vec2(44.0), 5.0, 1.0); float peb = (1.0 - smoothstep(0.1, 0.26, v.x)) * step(0.62, v.z);
    vec4 w = vor(uv, vec2(130.0), 7.0, 1.0); float grit = (1.0 - smoothstep(0.12, 0.34, w.x)) * step(0.35, w.z);
    h = big * 0.22 + mid * 0.14 + gr * 0.1 + rp * 0.12 + peb * 0.42 + grit * 0.12;
    vec3 c0 = srgb(vec3(0.14, 0.135, 0.13)), c1 = srgb(vec3(0.25, 0.235, 0.22));
    a = mix(c0, c1, smoothstep(0.3, 0.75, big)) * (0.84 + mid * 0.24 + gr * 0.16 + rp * 0.06);
    vec3 pc = v.z > 0.9 ? srgb(vec3(0.56, 0.53, 0.5)) : mix(srgb(vec3(0.3, 0.15, 0.1)), srgb(vec3(0.2, 0.18, 0.17)), step(0.78, v.z));
    a = mix(a, pc * (0.75 + v.y * 0.4), peb * 0.75);
    a = mix(a, a * 1.25, grit * 0.3);
    r = 0.95 - peb * 0.08; x = h;`],
  /* basalte : lave refroidie, vacuoles, fissures, voile d'oxydation rouille, éclats vitreux */
  basalt: [1024, 403, 2.4, `
    float big = gfbm(uv, vec2(3.0), 5, 1.0), mid = gfbm(uv, vec2(10.0), 5, 2.0), fine = gfbm(uv, vec2(40.0), 3, 3.0);
    vec4 c = vor(uv, vec2(6.0), 4.0, 1.0); float crack = (1.0 - smoothstep(0.0, 0.03, c.w)) * smoothstep(0.3, 0.6, gfbm(uv, vec2(4.0), 3, 9.0));
    vec4 vs = vor(uv, vec2(90.0), 6.0, 1.0); float hole = (1.0 - smoothstep(0.05, 0.17, vs.x)) * step(0.45, vs.z);
    float ox = smoothstep(0.6, 0.8, gfbm(uv, vec2(5.0), 4, 7.0));
    h = big * 0.3 + mid * 0.32 + fine * 0.16 + c.z * 0.12 - crack * 0.4 - hole * 0.28;
    vec3 base = mix(srgb(vec3(0.12, 0.115, 0.115)), srgb(vec3(0.3, 0.28, 0.27)), smoothstep(0.2, 0.85, mid + c.z * 0.25 - 0.1));
    a = base * (0.84 + fine * 0.32);
    a = mix(a, srgb(vec3(0.38, 0.2, 0.12)), ox * 0.42);
    a *= 1.0 - crack * 0.55 - hole * 0.45;
    r = 0.9 - hole * 0.06 - fine * 0.05; x = h;`],
  /* mousse laineuse des champs de lave : coussins gris-vert, cœurs plus sombres, interstices noirs */
  moss: [512, 405, 2.2, `
    vec4 c = vor(uv, vec2(10.0), 8.0, 1.0); float dome = 1.0 - smoothstep(0.08, 0.55, c.x);
    vec4 c2 = vor(uv, vec2(26.0), 9.0, 1.0); float tuft = 1.0 - smoothstep(0.05, 0.5, c2.x);
    float fib = vn(uv * 420.0, vec2(420.0), 2.0), big = gfbm(uv, vec2(3.0), 4, 1.0);
    h = dome * 0.5 + tuft * 0.25 + fib * 0.12 + big * 0.15;
    vec3 g0 = srgb(vec3(0.27, 0.31, 0.23)), g1 = srgb(vec3(0.47, 0.5, 0.4)), g2 = srgb(vec3(0.4, 0.38, 0.27));
    a = mix(g0, g1, smoothstep(0.25, 0.8, big + c.z * 0.35 - 0.1));
    a = mix(a, g2, smoothstep(0.6, 0.9, c2.z) * 0.4);
    a *= 0.78 + fib * 0.36 + tuft * 0.12;
    a = mix(srgb(vec3(0.09, 0.09, 0.08)), a, smoothstep(0.02, 0.32, dome + tuft * 0.4));
    r = 0.97; x = h;`],
  /* panneaux composites de façade (teintés par les sommets) : calepinage de 1,2 x 0,6 m, joints creux, voile de poussière en pied */
  panel: [512, 407, 1.2, `
    vec4 t = tiles(uv, vec2(2.0, 4.0), 0.0);
    float joint = 1.0 - smoothstep(0.006, 0.02, t.w), big = gfbm(uv, vec2(3.0), 4, 1.0), mid = gfbm(uv, vec2(12.0), 3, 2.0);
    float streak = smoothstep(0.55, 0.9, gfbm(vec2(uv.x, uv.y * 0.2), vec2(32.0, 1.0), 4, 5.0)) * (1.0 - t.y) * 0.5;
    h = (1.0 - joint) * 0.5 + mid * 0.04;
    a = vec3(0.86) * (0.95 + (t.z - 0.5) * 0.06 + big * 0.05) * (1.0 - streak * 0.18);
    a *= 1.0 - joint * 0.6;
    r = 0.5 + mid * 0.1 + streak * 0.3 + joint * 0.4; x = (1.0 - joint) * 0.35;`],
  /* gaine d'aluminium des conduites : tôle lisse, joints de recouvrement tous les 0,9 m, bosses, coulures */
  jacket: [512, 409, 1.0, `
    float seam = 1.0 - smoothstep(0.0, 0.012, abs(fract(uv.y * 2.0) - 0.04));
    float lap = smoothstep(0.0, 0.03, fract(uv.y * 2.0)) * (1.0 - smoothstep(0.03, 0.06, fract(uv.y * 2.0)));
    float big = gfbm(uv, vec2(3.0), 4, 1.0), dent = gfbm(uv, vec2(9.0), 3, 2.0), br = vn(vec2(uv.x * 320.0, uv.y * 4.0), vec2(320.0, 4.0), 3.0);
    float st = smoothstep(0.62, 0.86, gfbm(vec2(uv.x, uv.y * 0.3), vec2(24.0, 1.0), 4, 6.0));
    h = dent * 0.25 + lap * 0.35 - seam * 0.3 + br * 0.05;
    a = srgb(vec3(0.74, 0.75, 0.75)) * (0.88 + big * 0.12 + br * 0.08) * (1.0 - st * 0.2);
    a = mix(a, srgb(vec3(0.5, 0.42, 0.33)), st * 0.25);
    r = 0.32 + big * 0.12 + st * 0.3 + seam * 0.2; x = 0.95 - st * 0.4;`],
  /* sol des laboratoires et des salles : dalles de vinyle de 60 cm, mouchetures, joints fins, traces de passage */
  vinyl: [512, 411, 0.6, `
    vec4 t = tiles(uv, vec2(4.0), 0.0);
    float joint = 1.0 - smoothstep(0.004, 0.012, t.w), big = gfbm(uv, vec2(3.0), 4, 1.0);
    float sp1 = smoothstep(0.8, 0.88, vn(uv * 420.0, vec2(420.0), 2.0)), sp2 = smoothstep(0.82, 0.9, vn(uv * 300.0 + 3.7, vec2(300.0), 5.0));
    float scuff = smoothstep(0.62, 0.85, gfbm(vec2(uv.x * 2.0, uv.y * 0.6), vec2(8.0, 2.0), 4, 6.0)) * 0.5;
    h = (1.0 - joint) * 0.4 + big * 0.05;
    a = srgb(vec3(0.74, 0.75, 0.74)) * (0.96 + (t.z - 0.5) * 0.06 + big * 0.05) * (1.0 - sp1 * 0.35) + sp2 * 0.05;
    a *= 1.0 - joint * 0.3 - scuff * 0.12;
    r = 0.42 + scuff * 0.25 + big * 0.08 + joint * 0.3; x = h;`],
  /* lave en mouvement : plaques de croûte sombre, fentes et chenaux incandescents (la matière l'éclaire d'elle-même, voir lavaTp) */
  lava: [512, 415, 1.4, `
    vec2 wu = uv + vec2(gfbm(uv, vec2(4.0), 3, 7.0), gfbm(uv + 0.5, vec2(4.0), 3, 8.0)) * 0.12;
    vec4 c = vor(wu, vec2(5.0), 3.0, 1.0), c2 = vor(wu + 0.31, vec2(11.0), 5.0, 1.0);
    float crack = 1.0 - smoothstep(0.0, 0.11, c.w), crack2 = (1.0 - smoothstep(0.0, 0.05, c2.w)) * 0.45 * step(0.4, c.z);
    float big = gfbm(uv, vec2(3.0), 4, 1.0), fine = gfbm(uv, vec2(24.0), 3, 2.0);
    float hot = clamp(max(crack, crack2) * (0.5 + 0.7 * big) + smoothstep(0.55, 0.85, big) * 0.85, 0.0, 1.0);
    h = (1.0 - crack) * 0.6 + fine * 0.2;
    a = mix(srgb(vec3(0.07, 0.055, 0.05)) * (0.6 + fine * 0.8), mix(srgb(vec3(0.85, 0.16, 0.02)), srgb(vec3(1.0, 0.72, 0.24)), hot * hot), hot);
    r = 0.8; x = h;`],
  /* faux plafond : dalles minérales de 60 cm (piqûres, fissures fines), ossature en T laquée blanche */
  ceiltile: [512, 413, 0.8, `
    vec4 t = tiles(uv, vec2(4.0), 0.0);
    float bar = 1.0 - smoothstep(0.012, 0.02, t.w), big = gfbm(uv, vec2(2.0), 3, 1.0);
    float pits = smoothstep(0.72, 0.86, vn(uv * 520.0, vec2(520.0), 4.0)), fis = smoothstep(0.93, 0.99, ridge(uv, vec2(40.0), 3, 6.0)) * 0.6;
    h = (1.0 - bar) * 0.5 - pits * 0.15 - fis * 0.1;
    a = srgb(vec3(0.86, 0.86, 0.84)) * (0.95 + (t.z - 0.5) * 0.05 + big * 0.04) * (1.0 - pits * 0.25 - fis * 0.2);
    a = mix(a, srgb(vec3(0.93, 0.93, 0.91)), bar);
    r = mix(0.95, 0.4, bar); x = h;`],
});
Object.assign(TEXSCALE, { ash: 2.6, basalt: 3.0, moss: 2.4, panel: 2.4, jacket: 1.8, vinyl: 2.4, ceiltile: 2.4, lava: 4.0 });
for (const k of ['ash', 'basalt', 'moss', 'panel', 'jacket', 'vinyl', 'ceiltile', 'lava']) OPT_TEX.add(k);
/* Surfaces que Doom demande (surfaces de sa définition) : les nôtres, caillebotis (passerelles), rouille, rides de l'eau (bassin de rejet) */
var DOOM_SURFACES = ['ash', 'basalt', 'moss', 'panel', 'jacket', 'vinyl', 'ceiltile', 'lava', 'grating', 'rust', 'ripple'];

/* Couleurs de la station. Les deux moitiés se distinguent (on sait de quel côté on est) : orange au sud (Alpha), bleu canard au nord (Bravo) */
var TP = {
  white: [0.9, 0.9, 0.87], grey: [0.62, 0.63, 0.62], dark: [0.24, 0.25, 0.26], concrete: [0.72, 0.71, 0.68],
  accent: [[0.93, 0.42, 0.1], [0.08, 0.46, 0.5]], // orange (Alpha, sud), bleu canard (Bravo, nord)
  steel: [0.42, 0.44, 0.45], yellow: [0.92, 0.72, 0.12], red: [0.72, 0.12, 0.08],
};
var tpAccent = (z) => TP.accent[z >= 0 ? 0 : 1];

/* ---------- Matières ---------- */
function makeDoomMaterials(M) {
  M('ash', { tex: 'ash', macro: 0.4, dust: 0.1 });
  M('basalt', { tex: 'basalt', grime: 0.2, macro: 0.45, dust: 0.15, pom: 0.03 });
  M('moss', { tex: 'moss', macro: 0.4 });
  M('panel', { tex: 'panel', metal: 0.25, ma: true, env: 0.7, grime: 0.5, streak: 0.5, dust: 0.3, macro: 0.2 });
  M('jacket', { tex: 'jacket', metal: 0.85, ma: true, env: 1.0, grime: 0.4, streak: 0.4, dust: 0.25, macro: 0.2 });
  M('grating', { tex: 'grating', cut: 0.5, metal: 0.7, ma: true, env: 0.6, macro: 0.1, dust: 0.3 });
  M('rust', { tex: 'rust', metal: 0.75, ma: true, env: 0.55, macro: 0.25, grime: 0.6, streak: 0.4 });
  // croûte de soufre autour des fumerolles : jaune pâle, poudreuse
  M('sulfur', { tex: 'ash', color: [1.0, 0.86, 0.36], macro: 0.3 });
  // vitres éclairées de l'intérieur (salle de contrôle, observatoire) et voyants
  M('glassLit', { tex: 'glass', metal: 0.4, ma: true, env: 0.9, macro: 0.1, emissive: [0.55, 0.62, 0.66], polyOff: -2 });
  M('lampTp', { color: [1, 1, 1], rough: 0.6, emissive: [1.6, 1.5, 1.3], macro: 0, noShadow: true });
  // sols et plafonds des salles : vinyle ; faux plafond et plafond de béton des locaux techniques, éclairés par leurs luminaires (sans eux,
  // une face tournée vers le bas, loin des fenêtres, ne reçoit presque rien et reste noire)
  M('vinyl', { tex: 'vinyl', env: 0.7, macro: 0.12, dust: 0.2 });
  M('ceil', { tex: 'ceiltile', macro: 0.08, emissive: [0.075, 0.075, 0.072], noShadow: true });
  M('ceilc', { tex: 'concrete', color: [0.82, 0.82, 0.8], macro: 0.15, emissive: [0.05, 0.05, 0.048], noShadow: true });
  // enseignes et décalques de la station (doomKit) ; écrans allumés : le contenu de l'atlas des enseignes, sans éclairage (lumineux par
  // eux-mêmes), voilés par le brouillard comme le reste
  M('signs5', { tex: 'signs5', rough: 0.45, env: 0.6, macro: 0.05, scale: 1, noNormal: true });
  M('decals5', { tex: 'decals5', rough: 0.75, env: 0.35, macro: 0.15, scale: 1, noNormal: true, polyOff: -4 });
  Object.assign(MAT.decals5, { transparent: true, depthWrite: false }); MAT.decals5.defines.WM_CUT = ''; MAT.decals5.side = THREE.FrontSide;
  MAT.decals5.userData.noShadow = true;
  MAT.screenTp = new THREE.MeshBasicMaterial({ map: TEX.signs5.map, vertexColors: true }); MAT.screenTp.userData.noShadow = true;
  // coulées de lave : lumineuses par elles-mêmes (au-delà de 1 : le halo les fait rayonner), la texture glisse dans le sens de la pente
  MAT.lavaTp = new THREE.MeshBasicMaterial({ map: TEX.lava.map, color: new THREE.Color(3.4, 3.4, 3.4), vertexColors: true }); MAT.lavaTp.userData.noShadow = true;
}

/* ---------- Objets ---------- */
/* Hélicoptère de la station (monoturbine léger), posé, nez vers -z : fuselage blanc, poutre de queue et dérive à la couleur du camp (paint),
   verrière, patins, rotor arrêté. Sans collision propre (tpHeli, 02yh, pose celle du fuselage et de la poutre). */
PF.tpHeli = () => prefab('tpHeli', (M, P) => {
  P.tintable = ['paint'];
  const body = (prof, mat) => { M.save().move(0, 1.5, -2.4).scl(1, 1.1, 1).rotX(Math.PI / 2); M.lathe(mat, prof, 20); M.restore(); };
  M.local(1);
  M.color([0.94, 0.94, 0.92]); body([[1.02, 1.3], [1.05, 2.0], [1.0, 3.0], [0.82, 3.9], [0.48, 4.6], [0, 4.64]], 'carpaint');
  M.color([0.55, 0.62, 0.68]); body([[0, -0.02], [0.55, 0.14], [0.86, 0.5], [1.0, 1.0], [1.02, 1.3]], 'glass');
  // capot moteur, mât, moyeu
  M.color([0.9, 0.9, 0.88]); M.boxB('carpaint', -0.55, 0.55, 2.45, 2.9, -0.6, 1.6, { bevel: 0.12 });
  M.color([0.25, 0.26, 0.27]); M.save().move(0, 2.9, 0.1); M.cyl('steel', 0.09, 0.32, 8); M.restore();
  M.save().move(0, 3.22, 0.1); M.cyl('steel', 0.2, 0.12, 10); M.restore();
  // pales arrêtées (trois), légèrement fléchies
  for (let i = 0; i < 3; i++) { M.save().move(0, 3.27, 0.1).rotY(0.4 + i * TAU / 3).rotZ(-0.02); M.boxB('steel', 0.15, 5.3, -0.02, 0.02, -0.16, 0.16); M.restore(); }
  // poutre de queue, stabilisateur, dérive et rotor de queue
  M.color([1, 1, 1]); M.save().move(0, 1.75, 1.9).rotX(Math.PI / 2); M.cyl('paint', 0.3, 4.6, 12, { r1: 0.16 }); M.restore();
  M.boxB('paint', -0.95, 0.95, 1.7, 1.78, 5.2, 5.65, { bevel: 0.02 });
  M.save().move(0, 1.6, 6.15).rotX(-0.35); M.boxB('paint', -0.05, 0.05, 0, 1.45, -0.32, 0.32, { bevel: 0.02 }); M.restore();
  M.color([0.25, 0.26, 0.27]); for (const a of [0.3, 0.3 + Math.PI / 2]) { M.save().move(0.17, 2.35, 6.35).rotX(a); M.boxB('steel', -0.02, 0.02, -0.65, 0.65, -0.06, 0.06); M.restore(); }
  // patins et jambes de train
  M.color([0.3, 0.31, 0.32]);
  for (const sx of [-1, 1]) {
    M.tube('steel', 0.045, [[sx * 0.98, 0.07, -2.0], [sx * 0.98, 0.07, 1.8], [sx * 0.98, 0.14, 2.05]], 6);
    M.tube('steel', 0.045, [[sx * 0.98, 0.07, -2.0], [sx * 0.98, 0.2, -2.25]], 6);
    for (const z of [-1.1, 0.9]) M.tube('steel', 0.05, [[sx * 0.98, 0.07, z], [sx * 0.7, 0.5, z], [sx * 0.5, 0.75, z]], 6);
  }
  // marchepieds, feu anticollision
  M.color([0.25, 0.26, 0.27]); for (const sx of [-1, 1]) M.boxB('steel', sx * 1.0 - 0.12, sx * 1.0 + 0.12, 0.5, 0.54, -0.6, 0.2);
  M.color([0.9, 0.1, 0.05]); M.save().move(0, 2.92, 1.7); M.cyl('plastic', 0.06, 0.08, 8); M.restore();
});

/* ---------- Atlas de Doom (appelé par buildTextures) ---------- */
function doomKit() { TEX.signs5 = tpSignAtlas(); TEX.decals5 = tpDecalAtlas(); }
/* Enseignes (1024², 8 panneaux de 512 x 256), en islandais et en anglais comme sur les sites de là-bas : 0 nom de la station, 1 laboratoire,
   2 salle de contrôle, 3 carothèque, 4 station de pompage, 5 danger vapeur ; 6 et 7, contenus des écrans : sismogrammes, carte de surveillance */
var TPS = { station: 0, lab: 1, control: 2, cores: 3, pump: 4, steam: 5, seismo: 6, map: 7 };
function tpSignUV(i, sub = [0, 0, 1, 1]) { return [(i % 2) * 0.5 + sub[0] * 0.5, Math.floor(i / 2) * 0.25 + sub[1] * 0.25, sub[2] * 0.5, sub[3] * 0.25]; }
function tpSignAtlas() {
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'), R = rngOf(419);
  const sans = '"Liberation Sans", Arial, "DejaVu Sans", sans-serif';
  const fit = (txt, size, w, bold = 'bold ') => { g.font = `${bold}${size}px ${sans}`; return Math.min(size, (size * w) / g.measureText(txt).width); };
  const grime = (x, y) => {
    for (let k = 0; k < 600; k++) { g.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '40,38,36'},${R() * 0.06})`; g.fillRect(x + R() * 512, y + R() * 256, 1 + R() * 3, 1 + R() * 3); }
    const gr = g.createLinearGradient(0, y, 0, y + 256); gr.addColorStop(0, 'rgba(255,255,255,0.04)'); gr.addColorStop(1, 'rgba(40,38,36,0.2)'); g.fillStyle = gr; g.fillRect(x, y, 512, 256);
  };
  const board = (i, bg, fg, l1, l2, band) => {
    const x = (i % 2) * 512, y = Math.floor(i / 2) * 256;
    g.fillStyle = bg; g.fillRect(x, y, 512, 256);
    if (band) { g.fillStyle = band; g.fillRect(x, y + 214, 512, 42); }
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    let fs = fit(l1, 76, 440); g.font = `bold ${fs}px ${sans}`; g.fillText(l1, x + 256, y + 92);
    fs = fit(l2, 34, 440, ''); g.font = `${fs}px ${sans}`; g.fillText(l2, x + 256, y + 160);
    grime(x, y);
  };
  // 0 : nom de la station et son logo (un cône qui fume)
  g.fillStyle = '#1f2a33'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#e8622a'; g.beginPath(); g.moveTo(34, 196); g.lineTo(92, 92); g.lineTo(110, 92); g.lineTo(168, 196); g.closePath(); g.fill();
  g.strokeStyle = '#d9dde0'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(101, 82); g.bezierCurveTo(95, 60, 124, 50, 118, 26); g.stroke();
  g.fillStyle = '#f2f2ee'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = `bold ${fit('DOOM', 88, 300)}px ${sans}`; g.fillText('DOOM', 188, 100);
  g.fillStyle = '#c9ced2'; g.font = `${fit('VOLCANO OBSERVATORY', 28, 300, '')}px ${sans}`; g.fillText('ELDFJALLASTÖÐ', 192, 162); g.fillText('VOLCANO OBSERVATORY', 192, 198);
  grime(0, 0);
  board(1, '#f2f2ee', '#1f2a33', 'RANNSÓKNARSTOFA', 'LABORATORY  ·  GEOCHEMISTRY', '#e8622a');
  board(2, '#f2f2ee', '#1f2a33', 'STJÓRNSTÖÐ', 'CONTROL ROOM  ·  GEOTHERMAL PLANT', '#16767c');
  board(3, '#f2f2ee', '#1f2a33', 'BORKJARNASAFN', 'CORE STORE', '#8a8f93');
  board(4, '#2f3a42', '#f2f2ee', 'DÆLUSTÖÐ 2', 'PUMP STATION 2  ·  REINJECTION', null);
  // 5 : danger, vapeur sous pression (jaune et noir)
  { const x = 512, y = 512; g.fillStyle = '#151515'; g.fillRect(x, y, 512, 256); g.fillStyle = '#f2c31b'; g.fillRect(x + 12, y + 12, 488, 232);
    g.fillStyle = '#151515'; g.beginPath(); g.moveTo(x + 90, y + 48); g.lineTo(x + 152, y + 160); g.lineTo(x + 28, y + 160); g.closePath(); g.fill();
    g.fillStyle = '#f2c31b'; g.font = `bold 70px ${sans}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', x + 90, y + 122);
    g.fillStyle = '#151515'; g.textAlign = 'left'; g.font = `bold ${fit('HÆTTA · DANGER', 54, 310)}px ${sans}`; g.fillText('HÆTTA · DANGER', x + 174, y + 80);
    g.font = `bold ${fit('HÁÞRÝSTIGUFA', 40, 310)}px ${sans}`; g.fillText('HÁÞRÝSTIGUFA', x + 174, y + 136);
    g.font = `${fit('HIGH PRESSURE STEAM', 28, 310, '')}px ${sans}`; g.fillText('HIGH PRESSURE STEAM', x + 174, y + 176);
    g.textAlign = 'center'; g.font = `bold 22px ${sans}`; g.fillText('EKKI SNERTA  ·  DO NOT TOUCH', x + 256, y + 220); grime(x, y); }
  // 6 : écran de sismogrammes (enregistreur numérique, 24 heures) : traces horizontales, quelques séismes
  { const x = 0, y = 768; g.fillStyle = '#0c1216'; g.fillRect(x, y, 512, 256);
    g.fillStyle = '#7fe0c0'; g.font = `bold 13px ${sans}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('TPH.HHZ  ·  SKJÁLFTAVIRKNI  ·  24 KLST', x + 10, y + 7);
    g.strokeStyle = 'rgba(127,224,192,0.16)'; g.lineWidth = 1; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(x + 12 + k * 61, y + 28); g.lineTo(x + 12 + k * 61, y + 250); g.stroke(); }
    for (let r = 0; r < 14; r++) {
      const yy = y + 36 + r * 15.4, q = R() < 0.4 ? 40 + R() * 400 : -1; g.strokeStyle = r % 4 === 3 ? '#e8622a' : r % 2 ? '#8fd3ff' : '#c8f0de'; g.lineWidth = 1.3; g.beginPath();
      for (let k = 0; k <= 488; k += 2) { let a = (R() - 0.5) * 2.4; if (q > 0 && k > q && k < q + 60) a *= 1 + 10 * Math.exp(-(k - q) / 13); g.lineTo(x + 12 + k, yy + a); }
      g.stroke();
    } }
  // 7 : carte de surveillance : courbes de niveau du volcan, stations (triangles), séismes récents, panache
  { const x = 512, y = 768, cx = x + 210, cy = y + 134; g.fillStyle = '#10181d'; g.fillRect(x, y, 512, 256);
    for (let k = 1; k <= 9; k++) { g.strokeStyle = `rgba(160,200,190,${0.16 + k * 0.045})`; g.lineWidth = 1.3; g.beginPath(); for (let a = 0; a <= 64; a++) { const t = (a / 64) * TAU, rr = k * 11 * (1 + 0.12 * Math.sin(t * 3 + k) + 0.06 * Math.sin(t * 7)); g.lineTo(cx + Math.cos(t) * rr * 1.3, cy + Math.sin(t) * rr); } g.closePath(); g.stroke(); }
    g.fillStyle = 'rgba(232,98,42,0.25)'; g.beginPath(); g.ellipse(cx + 74, cy - 34, 84, 26, -0.4, 0, TAU); g.fill();
    for (let k = 0; k < 26; k++) { const a = R() * TAU, rr = R() * 58; g.fillStyle = k < 6 ? '#e8622a' : '#f2c31b'; g.beginPath(); g.arc(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr, 2 + R() * 4, 0, TAU); g.fill(); }
    for (let k = 0; k < 7; k++) { const a = (k / 7) * TAU + 0.3, rr = 92 + R() * 18, px = cx + Math.cos(a) * rr * 1.3, py = cy + Math.sin(a) * rr; g.fillStyle = '#8fd3ff'; g.beginPath(); g.moveTo(px, py - 7); g.lineTo(px + 6, py + 5); g.lineTo(px - 6, py + 5); g.closePath(); g.fill(); }
    g.fillStyle = '#c8f0de'; g.font = `bold 14px ${sans}`; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillText('DOOM  ·  VÖKTUN / MONITORING', x + 10, y + 8);
    g.font = `13px ${sans}`; ['GPS  +4.2 mm/d', 'SO2  2140 t/d', 'H2S  38 ppm', 'ÓRÓI / TREMOR  ▲'].forEach((l, k) => g.fillText(l, x + 382, y + 62 + k * 26)); }
  const t = canvasOnce(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Décalques (1024², grille 4 x 4, alpha) : 0 bandes de danger, 1 H de l'héliport, 2 et 3 numéros de puits au pochoir, 4 surface chaude, 5 gaz H2S,
   6 sismogramme imprimé, 7 carte géologique, 8 coulures grises, 9 coulures de rouille, 10 croûte de soufre (sol), 11 flèche du cheminement (sol),
   12 accès interdit, 13 extincteur, 14 sortie de secours, 15 cendre soufflée au pied d'un mur */
var TPD = { stripes: 0, heli: 1, well7: 2, well12: 3, hot: 4, h2s: 5, seismo: 6, geomap: 7, drip: 8, rust: 9, sulfur: 10, arrow: 11, noentry: 12, extinct: 13, exit: 14, ash: 15 };
function tpDecalAtlas() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = rngOf(421), T = S / 4;
  const sans = '"Liberation Sans", Arial, "DejaVu Sans", sans-serif';
  const cell = (i, fn) => { g.save(); g.translate((i % 4) * T, Math.floor(i / 4) * T); g.beginPath(); g.rect(0, 0, T, T); g.clip(); fn(); g.restore(); };
  const wear = (n, a) => { g.globalCompositeOperation = 'destination-out'; for (let j = 0; j < n; j++) { g.fillStyle = `rgba(0,0,0,${R() * a})`; g.fillRect(R() * T, R() * T, 2 + R() * 4, 1 + R() * 3); } g.globalCompositeOperation = 'source-over'; };
  const txt = (s, x, y, size, w, bold = 'bold ') => { g.font = `${bold}${size}px ${sans}`; const fs = Math.min(size, (size * w) / g.measureText(s).width); g.font = `${bold}${fs}px ${sans}`; g.fillText(s, x, y); };
  cell(0, () => { g.fillStyle = '#f2c31b'; g.fillRect(0, 0, T, T); g.fillStyle = '#161616'; for (let k = -5; k < 9; k++) { g.beginPath(); g.moveTo(k * 64, 0); g.lineTo(k * 64 + 32, 0); g.lineTo(k * 64 + 32 + T, T); g.lineTo(k * 64 + T, T); g.closePath(); g.fill(); } wear(500, 0.7); });
  cell(1, () => { g.strokeStyle = 'rgba(242,242,236,0.95)'; g.lineWidth = 14; g.beginPath(); g.arc(T / 2, T / 2, T / 2 - 14, 0, TAU); g.stroke(); g.fillStyle = 'rgba(242,242,236,0.95)'; g.fillRect(T / 2 - 58, T / 2 - 70, 26, 140); g.fillRect(T / 2 + 32, T / 2 - 70, 26, 140); g.fillRect(T / 2 - 32, T / 2 - 13, 64, 26); wear(700, 0.8); });
  for (const [i, n] of [[2, 'TP-07'], [3, 'TP-12']]) cell(i, () => { g.fillStyle = 'rgba(25,25,25,0.92)'; g.textAlign = 'center'; g.textBaseline = 'middle'; txt(n, T / 2, T / 2 - 8, 70, T - 24); txt('BORHOLA · WELL', T / 2, T / 2 + 50, 20, T - 40); wear(300, 0.8); });
  cell(4, () => { // surface chaude : triangle jaune, ondes de chaleur
    g.fillStyle = '#f2c31b'; g.strokeStyle = '#151515'; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath(); g.moveTo(T / 2, 26); g.lineTo(T - 26, T - 46); g.lineTo(26, T - 46); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 7; for (let k = -1; k <= 1; k++) { g.beginPath(); for (let j = 0; j <= 20; j++) g.lineTo(T / 2 + k * 26 + Math.sin(j * 0.7) * 7, 108 + j * 4.5); g.stroke(); }
    g.fillStyle = '#151515'; g.fillRect(70, 198, T - 140, 9); });
  cell(5, () => { // H2S : panneau jaune
    g.fillStyle = '#f2c31b'; g.fillRect(20, 30, T - 40, T - 60); g.strokeStyle = '#151515'; g.lineWidth = 8; g.strokeRect(28, 38, T - 56, T - 76);
    g.fillStyle = '#151515'; g.textAlign = 'center'; g.textBaseline = 'middle'; txt('H2S', T / 2, 96, 66, T - 80); txt('BRENNISTEINSVETNI', T / 2, 150, 20, T - 76); txt('TOXIC GAS  ·  GASGRÍMA', T / 2, 182, 16, T - 76, ''); wear(120, 0.5); });
  cell(6, () => { // sismogramme imprimé, punaisé au mur
    g.fillStyle = '#f4f3ee'; g.fillRect(18, 22, T - 36, T - 44); g.strokeStyle = '#1b2a3a'; g.lineWidth = 1.4;
    for (let r = 0; r < 9; r++) { const yy = 50 + r * 21, q = R() < 0.4 ? 30 + R() * 150 : -1; g.beginPath(); for (let k = 0; k <= 196; k += 2) { let a = (R() - 0.5) * 2.4; if (q > 0 && k > q && k < q + 40) a *= 1 + 8 * Math.exp(-(k - q) / 10); g.lineTo(30 + k, yy + a); } g.stroke(); }
    g.fillStyle = '#c0392b'; for (const px of [30, T - 30]) { g.beginPath(); g.arc(px, 32, 5, 0, TAU); g.fill(); } wear(60, 0.3); });
  cell(7, () => { // carte géologique : coulées colorées, courbes de niveau
    g.fillStyle = '#efeae0'; g.fillRect(18, 18, T - 36, T - 36); const cols = ['#c86b4a', '#9c5a7a', '#d9a441', '#6f8f5f', '#7a7a86'];
    for (let k = 0; k < 9; k++) { g.fillStyle = cols[k % 5]; g.globalAlpha = 0.75; g.beginPath(); const cx = 44 + R() * (T - 88), cy = 44 + R() * (T - 100); for (let a = 0; a <= 12; a++) { const t = (a / 12) * TAU, rr = 16 + R() * 26; g.lineTo(cx + Math.cos(t) * rr * 1.5, cy + Math.sin(t) * rr); } g.closePath(); g.fill(); }
    g.globalAlpha = 1; g.strokeStyle = 'rgba(60,50,40,0.5)'; g.lineWidth = 1; for (let k = 1; k < 7; k++) { g.beginPath(); g.ellipse(T / 2, T / 2 - 10, k * 15, k * 11, 0.3, 0, TAU); g.stroke(); }
    g.fillStyle = '#1b2a3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; txt('JARÐFRÆÐIKORT  ·  GEOLOGY', T / 2, T - 32, 15, T - 56); });
  cell(8, () => { for (let j = 0; j < 14; j++) { const x = T * 0.12 + R() * T * 0.76, w = 4 + R() * 12, gr = g.createLinearGradient(0, 0, 0, T * (0.3 + R() * 0.7)); gr.addColorStop(0, 'rgba(90,88,84,0.5)'); gr.addColorStop(1, 'rgba(90,88,84,0)'); g.fillStyle = gr; g.fillRect(x, 0, w, T); } });
  cell(9, () => { const gr = g.createLinearGradient(0, 0, 0, T); gr.addColorStop(0, 'rgba(120,56,28,0.6)'); gr.addColorStop(1, 'rgba(120,56,28,0)'); g.fillStyle = gr; for (let j = 0; j < 10; j++) { const x = T * 0.15 + R() * T * 0.7, w = 3 + R() * 9; g.fillRect(x, 0, w, T * (0.25 + R() * 0.75)); } });
  cell(10, () => { // croûte de soufre autour d'un évent : jaune vif au centre, blanchâtre au bord, irrégulière ; la bouche sombre
    for (let j = 0; j < 280; j++) { const a = R() * TAU, rr = Math.pow(R(), 0.7) * T * 0.46, k = 1 - rr / (T * 0.46);
      g.fillStyle = `rgba(${Math.round(lerp(232, 250, k))},${Math.round(lerp(226, 212, k))},${Math.round(lerp(196, 64, k))},${0.1 + k * 0.32})`; g.beginPath(); g.arc(T / 2 + Math.cos(a) * rr, T / 2 + Math.sin(a) * rr, 4 + R() * 14 * (1 - k * 0.5), 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(40,36,30,0.8)'; g.beginPath(); g.ellipse(T / 2, T / 2, 16, 11, 0.4, 0, TAU); g.fill(); });
  cell(11, () => { g.fillStyle = 'rgba(242,242,236,0.92)'; g.beginPath(); g.moveTo(T / 2, 30); g.lineTo(T - 50, 120); g.lineTo(T / 2 + 30, 120); g.lineTo(T / 2 + 30, T - 30); g.lineTo(T / 2 - 30, T - 30); g.lineTo(T / 2 - 30, 120); g.lineTo(50, 120); g.closePath(); g.fill(); wear(500, 0.8); });
  cell(12, () => { g.fillStyle = '#c62828'; g.beginPath(); g.arc(T / 2, 108, 84, 0, TAU); g.fill(); g.fillStyle = '#f4f4f0'; g.fillRect(T / 2 - 62, 96, 124, 24); g.fillRect(36, 204, T - 72, 40); g.fillStyle = '#151515'; g.textAlign = 'center'; g.textBaseline = 'middle'; txt('BANNAÐ  ·  NO ENTRY', T / 2, 224, 20, T - 90); });
  cell(13, () => { g.fillStyle = '#c62828'; g.fillRect(48, 36, T - 96, T - 72); g.fillStyle = '#f4f4f0'; g.beginPath(); g.ellipse(T / 2 - 8, 132, 26, 58, 0, 0, TAU); g.fill(); g.fillRect(T / 2 - 20, 60, 24, 18); g.fillRect(T / 2 + 4, 64, 30, 8); g.textAlign = 'center'; g.textBaseline = 'middle'; txt('SLÖKKVITÆKI', T / 2, T - 56, 18, T - 110); });
  cell(14, () => { g.fillStyle = '#1e8a4c'; g.fillRect(16, 72, T - 32, T - 144); g.fillStyle = '#f4f4f0'; g.fillRect(T - 92, 88, 56, 80); g.fillStyle = '#1e8a4c'; g.fillRect(T - 84, 96, 40, 64);
    g.fillStyle = '#f4f4f0'; g.beginPath(); g.arc(70, 98, 11, 0, TAU); g.fill(); g.lineWidth = 10; g.strokeStyle = '#f4f4f0'; g.lineCap = 'round'; g.beginPath(); g.moveTo(66, 112); g.lineTo(58, 146); g.lineTo(78, 168); g.moveTo(58, 146); g.lineTo(42, 166); g.moveTo(62, 120); g.lineTo(84, 130); g.moveTo(62, 120); g.lineTo(44, 130); g.stroke();
    g.textAlign = 'left'; g.textBaseline = 'middle'; txt('NEYÐARÚTGANGUR', 100, 116, 17, T - 206); txt('EXIT', 100, 146, 22, 80); });
  cell(15, () => { const gr = g.createLinearGradient(0, T, 0, 0); gr.addColorStop(0, 'rgba(46,44,42,0.7)'); gr.addColorStop(0.45, 'rgba(46,44,42,0.35)'); gr.addColorStop(1, 'rgba(46,44,42,0)'); g.fillStyle = gr; g.fillRect(0, 0, T, T); wear(400, 0.6); });
  const t = canvasOnce(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.flipY = false;
  return { map: t, normal: null };
}
/* Quadrilatère d'atlas (enseigne, écran) dans le plan z du repère courant, tourné vers +z ; uv : [u0, v0, du, dv], v vers le bas de l'image */
function tpAtlasQuad(M, mat, x0, x1, y0, y1, z, uv) {
  const [u0, v0, du, dv] = uv, B = M.buf(mat, (x0 + x1) / 2, (y0 + y1) / 2, z);
  const a = M.v(B, x0, y0, z, 0, 0, 1, u0, v0 + dv), b = M.v(B, x1, y0, z, 0, 0, 1, u0 + du, v0 + dv), c = M.v(B, x1, y1, z, 0, 0, 1, u0 + du, v0), d = M.v(B, x0, y1, z, 0, 0, 1, u0, v0);
  M.quadI(B, a, b, c, d);
}
/* Enseigne de la station posée sur une façade (repère de façade : z = 0, le mur), cadre d'acier */
function tpSignBoard(M, xc, y, w, h, idx) {
  M.save().color([1, 1, 1]); tpAtlasQuad(M, 'signs5', xc - w / 2, xc + w / 2, y, y + h, 0.05, tpSignUV(idx));
  M.color([0.3, 0.32, 0.33]).local(1); M.boxB('steel', xc - w / 2 - 0.03, xc + w / 2 + 0.03, y - 0.03, y + h + 0.03, 0, 0.048); M.restore();
}
/* Décalque de Doom sur un mur (repère de façade) ou au sol */
function tpWallDecal(M, i, xc, y, w, h, z = 0.008, sub) { decal3Quad(M, i, [xc - w / 2, y, z], [xc + w / 2, y, z], [xc + w / 2, y + h, z], [xc - w / 2, y + h, z], [0, 0, 1], sub, 'decals5'); }
function tpGroundDecal(i, x, z, w, d, rot = 0, y = 0.014) {
  const c = Math.cos(rot), s = Math.sin(rot), P = (a, b) => [x + a * c - b * s, y, z + a * s + b * c];
  decal3Quad(DECOR, i, P(-w / 2, d / 2), P(w / 2, d / 2), P(w / 2, -d / 2), P(-w / 2, -d / 2), [0, 1, 0], [0, 0, 1, 1], 'decals5');
}

/* ---------- Mobilier et instruments du centre de recherche (repère local : y vers le haut, la face avant vers +z) ---------- */
/* Paillasse centrale de laboratoire (îlot de 2,9 x 1,4 m, double face) : meubles bas des deux côtés, plan de résine noire, étagère à réactifs
   au milieu et ses flacons, un microscope d'un côté, une balance de l'autre */
PF.tpBench = () => prefab('tpBench', (M) => {
  M.local(1);
  M.color([0.25, 0.26, 0.27]); M.boxB('steel', -1.4, 1.4, 0, 0.08, -0.62, 0.62);
  M.color([0.9, 0.9, 0.88]); M.boxB('paint', -1.4, 1.4, 0.08, 0.88, -0.66, 0.66, { bevel: 0.01 });
  M.color([0.62, 0.64, 0.65]); for (let k = -2; k <= 2; k++) for (const z of [-0.665, 0.665]) M.boxB('steel', k * 0.56 - 0.006, k * 0.56 + 0.006, 0.14, 0.84, z - 0.004, z + 0.004);
  M.color([0.11, 0.11, 0.12]); M.boxB('plastic', -1.45, 1.45, 0.88, 0.93, -0.7, 0.7, { bevel: 0.01 });
  M.color([0.62, 0.64, 0.65]); for (const x of [-1.3, 1.3]) M.boxB('steel', x - 0.02, x + 0.02, 0.93, 1.78, -0.05, 0.05);
  for (const y of [1.3, 1.74]) M.boxB('steel', -1.32, 1.32, y, y + 0.025, -0.14, 0.14);
  const R = rngOf(431), cols = [[0.86, 0.55, 0.2], [0.55, 0.72, 0.86], [0.92, 0.92, 0.9], [0.42, 0.3, 0.2], [0.32, 0.56, 0.42]];
  for (const y of [1.325, 1.765]) for (let x = -1.2; x < 1.2; x += 0.13 + R() * 0.1) { if (R() < 0.25) continue; M.color(R.pick(cols)); M.save().move(x, y, R.range(-0.06, 0.06)); M.cyl('glass', 0.03 + R() * 0.025, 0.12 + R() * 0.12, 8); M.restore(); }
  // microscope (socle, potence, tube) côté +z ; balance (boîtier, cage de verre) côté -z ; béchers
  M.color([0.9, 0.9, 0.88]); M.boxB('plastic', -0.95, -0.7, 0.93, 0.97, 0.3, 0.55); M.boxB('plastic', -0.86, -0.79, 0.97, 1.3, 0.3, 0.37);
  M.color([0.15, 0.15, 0.16]); M.save().move(-0.82, 1.22, 0.45).rotX(-0.5); M.cyl('steel', 0.025, 0.2, 8); M.restore();
  M.color([0.88, 0.88, 0.86]); M.boxB('plastic', 0.6, 0.92, 0.93, 1.0, -0.6, -0.28); M.color([0.7, 0.78, 0.82]); M.boxB('glass', 0.62, 0.9, 1.0, 1.2, -0.58, -0.3);
  M.color([0.8, 0.86, 0.9]); for (const [x, z] of [[0.3, 0.45], [0.42, 0.38], [-0.3, -0.45]]) { M.save().move(x, 0.93, z); M.cyl('glass', 0.04, 0.1, 10); M.restore(); }
});
/* Hotte d'aspiration (1,6 m de large) : meuble bas, joues, vitre relevée, éclairage intérieur, gaine d'extraction */
PF.tpHood = () => prefab('tpHood', (M) => {
  M.local(1); M.color([0.88, 0.88, 0.86]);
  M.boxB('paint', -0.8, 0.8, 0, 0.88, -0.45, 0.45); M.boxB('paint', -0.8, -0.72, 0.88, 2.35, -0.45, 0.45); M.boxB('paint', 0.72, 0.8, 0.88, 2.35, -0.45, 0.45);
  M.boxB('paint', -0.8, 0.8, 1.95, 2.35, -0.45, 0.45); M.boxB('paint', -0.72, 0.72, 0.88, 1.95, -0.45, -0.4);
  M.color([0.11, 0.11, 0.12]); M.boxB('plastic', -0.72, 0.72, 0.88, 0.92, -0.4, 0.42);
  M.color([0.7, 0.78, 0.82]); M.boxB('glass', -0.72, 0.72, 1.25, 1.95, 0.38, 0.4);
  M.color([1, 1, 1]); M.boxB('lampTp', -0.6, 0.6, 1.9, 1.93, -0.3, 0.2);
  M.color([0.6, 0.62, 0.63]); M.save().move(0, 2.35, -0.1); M.cyl('steel', 0.16, 0.6, 10); M.restore();
});
/* Pupitre de conduite (len le long de x, 1 m de profondeur) : caisson, plan, rangée d'écrans allumés tournés vers +z */
PF.tpConsole = (len) => prefab('tpConsole' + len, (M) => {
  M.local(1); const n = Math.max(2, Math.round(len / 0.75));
  M.color([0.24, 0.25, 0.27]); M.boxB('paint', -len / 2, len / 2, 0, 0.72, -0.45, 0.35, { bevel: 0.01 });
  M.color([0.62, 0.63, 0.64]); M.boxB('plastic', -len / 2 - 0.03, len / 2 + 0.03, 0.72, 0.76, -0.5, 0.5, { bevel: 0.01 });
  for (let i = 0; i < n; i++) {
    const cx = -len / 2 + (len * (i + 0.5)) / n, w = Math.min(0.66, len / n - 0.06);
    M.color([0.12, 0.12, 0.13]); M.boxB('plastic', cx - 0.04, cx + 0.04, 0.76, 0.98, -0.3, -0.26); M.boxB('plastic', cx - w / 2, cx + w / 2, 0.92, 1.34, -0.34, -0.3);
    M.color([1, 1, 1]); tpAtlasQuad(M, 'screenTp', cx - w / 2 + 0.02, cx + w / 2 - 0.02, 0.94, 1.32, -0.295, tpSignUV(i % 3 === 1 ? TPS.map : TPS.seismo, [(i * 0.37) % 0.5, 0, 0.5, 1]));
    M.color([0.2, 0.2, 0.21]); M.boxB('plastic', cx - 0.22, cx + 0.22, 0.76, 0.78, 0.0, 0.16);
  }
});
/* Baie de serveurs (0,6 x 0,7 m, 2,1 m de haut) : porte perforée sombre, voyants (bandeaux d'écran) */
PF.tpRack = () => prefab('tpRack', (M) => {
  M.local(1); M.color([0.13, 0.14, 0.15]); M.boxB('steel', -0.3, 0.3, 0, 2.1, -0.35, 0.35, { bevel: 0.01 });
  M.color([0.5, 0.52, 0.53]); M.boxB('steel', -0.27, 0.27, 0.06, 2.04, 0.35, 0.355);
  M.color([1, 1, 1]); for (let k = 0; k < 7; k++) tpAtlasQuad(M, 'screenTp', -0.2, 0.2, 0.3 + k * 0.24, 0.34 + k * 0.24, 0.358, tpSignUV(TPS.seismo, [0.1 + k * 0.1, 0.3 + (k % 3) * 0.2, 0.15, 0.03]));
});
/* Enregistreurs à tambour (sismographes) sur leur table : socle, tambour de papier, couvercle de verre ; 1,8 m le long de x */
PF.tpDrums = () => prefab('tpDrums', (M) => {
  M.local(1); M.color([0.42, 0.34, 0.26]); M.boxB('paint', -0.9, 0.9, 0.74, 0.78, -0.35, 0.35); M.color([0.3, 0.31, 0.32]); for (const x of [-0.84, 0.84]) for (const z of [-0.3, 0.3]) M.boxB('steel', x - 0.02, x + 0.02, 0, 0.74, z - 0.02, z + 0.02);
  for (const x of [-0.5, 0.0, 0.5]) {
    M.color([0.85, 0.86, 0.86]); M.boxB('plastic', x - 0.22, x + 0.22, 0.78, 0.86, -0.18, 0.18);
    M.color([0.95, 0.94, 0.9]); M.save().move(x, 0.98, 0).rotZ(Math.PI / 2); M.cyl('plastic', 0.09, 0.38, 14); M.restore();
    M.color([0.7, 0.78, 0.82]); M.boxB('glass', x - 0.22, x + 0.22, 0.86, 1.12, -0.16, 0.16);
  }
});
/* Lits superposés (2 x 0,9 m) : cadre d'acier, matelas, échelle */
PF.tpBunk = () => prefab('tpBunk', (M) => {
  M.local(1); M.color([0.36, 0.42, 0.48]);
  for (const x of [-1.0, 1.0]) for (const z of [-0.45, 0.45]) M.boxB('steel', x - 0.025, x + 0.025, 0, 1.75, z - 0.025, z + 0.025);
  for (const y of [0.35, 1.3]) { M.boxB('steel', -1.0, 1.0, y, y + 0.05, -0.47, 0.47); M.color([0.52, 0.58, 0.66]); M.boxB('canvas', -0.97, 0.97, y + 0.05, y + 0.2, -0.43, 0.43, { bevel: 0.04 }); M.color([0.36, 0.42, 0.48]); }
  for (let y = 0.5; y < 1.3; y += 0.28) M.boxB('steel', 0.9, 1.0, y, y + 0.025, 0.44, 0.48);
});
/* Antenne GPS de surveillance des déformations : pilier de béton, antenne en disque sous son radôme, coffret et panneau solaire */
PF.tpGps = () => prefab('tpGps', (M) => {
  M.local(1); M.color([0.72, 0.71, 0.68]); M.boxB('concrete', -0.15, 0.15, 0, 1.1, -0.15, 0.15);
  M.color([0.92, 0.92, 0.9]); M.save().move(0, 1.1, 0); M.cyl('plastic', 0.19, 0.06, 16); M.restore(); M.save().move(0, 1.16, 0); M.lathe('plastic', [[0.17, 0], [0.15, 0.05], [0.08, 0.1], [0, 0.11]], 12); M.restore();
  M.color([0.85, 0.85, 0.83]); M.boxB('paint', 0.35, 0.75, 0, 0.45, -0.2, 0.2);
  M.color([0.4, 0.42, 0.43]); M.boxB('steel', 0.53, 0.57, 0.45, 1.0, -0.02, 0.02);
  M.color([0.14, 0.18, 0.3]); M.save().move(0.55, 1.0, 0).rotX(-0.6); M.boxB('glass', -0.3, 0.3, -0.02, 0.02, -0.22, 0.22); M.restore();
});
/* Mât météorologique (6 m) : anémomètre à coupelles, girouette, abri à persiennes, panneau solaire, haubans */
PF.tpWeather = () => prefab('tpWeather', (M) => {
  M.local(1); M.color([0.66, 0.68, 0.69]); M.cyl('steel', 0.04, 6.0, 8);
  M.save().move(0, 6.0, 0); M.cyl('steel', 0.012, 0.22, 6); for (let k = 0; k < 3; k++) { M.boxB('steel', -0.005, 0.005, 0.2, 0.21, 0, 0.14); M.rotY(TAU / 3); } M.restore();
  M.color([0.9, 0.9, 0.88]); for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU; M.save().move(Math.cos(a) * 0.15, 6.2, Math.sin(a) * 0.15); M.lathe('plastic', [[0, 0], [0.04, 0.0], [0.045, 0.03], [0, 0.04]], 8); M.restore(); }
  M.color([0.66, 0.68, 0.69]); M.boxB('steel', -0.6, 0.6, 5.4, 5.43, -0.015, 0.015); M.boxB('steel', 0.45, 0.65, 5.43, 5.6, -0.004, 0.004);
  M.color([0.94, 0.94, 0.92]); for (let k = 0; k < 6; k++) { M.save().move(0.22, 3.2 + k * 0.05, 0); M.cyl('plastic', 0.09, 0.03, 12); M.restore(); }
  M.color([0.14, 0.18, 0.3]); M.save().move(-0.3, 2.4, 0).rotZ(0.7); M.boxB('glass', -0.25, 0.25, -0.02, 0.02, -0.2, 0.2); M.restore();
  M.color([0.85, 0.85, 0.83]); M.boxB('paint', -0.18, 0.18, 1.2, 1.6, 0.05, 0.25);
  M.color([0.5, 0.51, 0.52]); for (let k = 0; k < 3; k++) { const a = (k / 3) * TAU + 0.5; M.tube('steel', 0.008, [[0, 4.5, 0], [Math.cos(a) * 1.5, 0.02, Math.sin(a) * 1.5]], 3); }
});
/* Station de mesure des gaz (près des fumerolles) : poteau, coffret d'analyseur, prise d'air, panneau solaire */
PF.tpGas = () => prefab('tpGas', (M) => {
  M.local(1); M.color([0.5, 0.52, 0.53]); M.boxB('steel', -0.04, 0.04, 0, 2.2, -0.04, 0.04);
  M.color([0.92, 0.72, 0.12]); M.boxB('paint', -0.25, 0.25, 0.9, 1.5, 0.04, 0.32, { bevel: 0.02 });
  M.color([0.3, 0.31, 0.32]); M.tube('rubber', 0.015, [[0.18, 0.95, 0.2], [0.3, 0.6, 0.3], [0.32, 0.12, 0.35]], 5);
  M.color([0.14, 0.18, 0.3]); M.save().move(0, 2.2, 0).rotX(-0.6); M.boxB('glass', -0.3, 0.3, -0.02, 0.02, -0.25, 0.25); M.restore();
});

}catch(e){HOOKS.missing['02yg-doom-kit.js']=String(e&&e.message||e)}
/* ===== 02yk-simoun-kit.js ===== */
try{
/* ==========================================================================
   KIT DU DÉSERT : surfaces, matières et objets de Simoun, l'arène ronde au milieu des dunes.
   - Le sable des dunes (surface procédurale dune) : rides de vent courbes, au dos long et au front raide, des plages lissées, un grain ; le
     relief lui-même est dans 02-relief.js et la fonction des dunes dans 02yl-simoun.js ;
   - Surfaces photo (Poly Haven, CC0 ; chargées seulement pour une carte qui les demande, `textures` de sa définition) : le pisé des ruines
     (terre damée), les briques de terre crue, les galets et la vase craquelée des berges de l'oasis. À défaut (réseau coupé), une surface
     procédurale proche les remplace (simounKit) ;
   - Massifs de grès (smMassif) : des rectangles de collision, une paroi d'une seule boucle de sommets qui monte du pied au sommet, ses
     corniches calées sur les mêmes couches d'un massif à l'autre, une patine du désert en coulées sombres et un dessus de roche ou de sable ;
   - Pisé : murs ruinés de l'oasis (smRuin, arase cassée) ;
   - Camps de fortune : tente bédouine en bandes de laine (PF.smBedouin), cabane de tôle et de planches (smShack), mirador de bois et son
     escalier (smWatchtower), murets de sacs de sable (smSandbags), bâche tendue sur des perches (smTarp), foyer (PF.smFire) ;
   - L'épave d'un avion de ligne à aile basse (smPlane) : fuselage cassé en deux où l'on entre, cabine aux sièges 3 + 3 (PF.smSeats3),
     coffres et plafond, toit et ailes praticables (on monte sur le toit par les congères), dérive bleue, réacteurs arrachés (PF.smJetEngine) ;
   - Végétation et objets : palmiers (PF.palm de 02h-nature.js, nervures et version allégée), roseaux, acacia, puits, jarres, charrette ;
   - La vie du désert : tourbillons de poussière qui errent sur le sable, vautours.
   Tout se pose sur le relief (gy0) et se libère avec la carte.
   ========================================================================== */
Object.assign(TEXSCALE, { pise: 2.4, adobe: 1.8, galets: 1.7, vase: 4.4, gres: 9.0, dune: 3.2, reg: 2.8 });
Object.assign(TEXLAB, {
  /* grès rouge des falaises : bancs d'épaisseur inégale, ondulés, stratification oblique dans chaque banc, diaclases verticales propres à
     chaque banc, lits creusés entre deux bancs, coulées sombres de patine du désert, grain */
  gres: [1024, 83, 2.6, `
    float big = gfbm(uv, vec2(2.0), 5, 1.0), mid = gfbm(uv, vec2(8.0), 4, 2.0), fine = gfbm(uv, vec2(32.0), 3, 3.0), grain = gfbm(uv, vec2(96.0), 2, 4.0);
    float ly = uv.y * 5.0 + (big - 0.5) * 0.8 + (mid - 0.5) * 0.18;
    float band = fract(ly), bid = mod(floor(ly), 5.0), hb = hs(vec2(bid, 0.0), 7.0);
    float cr = fract(uv.x * 14.0 + band * (1.5 + hb * 2.5) + hs(vec2(bid, 2.0), 3.0) * 4.0);
    float xb = smoothstep(0.0, 0.07, cr) * (1.0 - smoothstep(0.07, 0.15, cr));
    float jx = uv.x * 7.0 + hs(vec2(bid, 3.0), 5.0) * 7.0 + (gfbm(uv, vec2(2.0, 8.0), 3, 6.0) - 0.5) * 0.5, jf = fract(jx);
    float joint = (1.0 - smoothstep(0.0, 0.035, min(jf, 1.0 - jf))) * step(0.45, hs(vec2(mod(floor(jx), 7.0), bid), 8.0)) * smoothstep(0.03, 0.12, band) * (1.0 - smoothstep(0.88, 0.97, band));
    float bed = 1.0 - smoothstep(0.0, 0.07, band) * (1.0 - smoothstep(0.92, 1.0, band));
    float streak = smoothstep(0.58, 0.8, gfbm(uv, vec2(24.0, 1.0), 3, 9.0)) * smoothstep(0.2, 0.9, band);
    h = 0.55 + (1.0 - bed) * 0.1 + (hb - 0.5) * 0.12 + mid * 0.2 + fine * 0.12 - joint * 0.3 - xb * 0.04;
    vec3 c0 = srgb(vec3(0.8, 0.5, 0.33)), c1 = srgb(vec3(0.9, 0.7, 0.52)), c2 = srgb(vec3(0.72, 0.42, 0.27)), c3 = srgb(vec3(0.86, 0.6, 0.42));
    a = hb < 0.3 ? c0 : hb < 0.55 ? c1 : hb < 0.8 ? c3 : c2;
    a *= (0.84 + mid * 0.22 + grain * 0.1) * (1.0 - joint * 0.4) * (1.0 - bed * 0.18) * (1.0 - xb * 0.1) * (1.0 - streak * 0.38);
    r = 0.88 + fine * 0.08; x = h;`],
  /* sable des dunes : rides de vent courbes (dos long, front raide), effacées par plages, grain fin, nuances de l'ocre au doré */
  dune: [1024, 61, 1.5, `
    float w = gfbm(uv, vec2(2.0), 4, 1.0), w2 = gfbm(uv, vec2(6.0), 3, 2.0);
    float ph = uv.y * 16.0 + uv.x * 3.0 + (w - 0.5) * 3.2 + (w2 - 0.5) * 0.9, f = fract(ph);
    float rip = smoothstep(0.0, 0.72, f) * (1.0 - smoothstep(0.72, 1.0, f));
    float fade = smoothstep(0.38, 0.8, gfbm(uv + 0.17, vec2(3.0), 3, 3.0));
    float big = gfbm(uv, vec2(3.0), 4, 4.0), gr = vn(uv * 512.0, vec2(512.0), 5.0);
    h = rip * (0.2 + 0.8 * fade) * 0.3 + big * 0.25 + gr * 0.07;
    vec3 c0 = srgb(vec3(0.9, 0.66, 0.43)), c1 = srgb(vec3(0.94, 0.74, 0.52)), c2 = srgb(vec3(0.82, 0.57, 0.36));
    a = mix(c2, c1, smoothstep(0.2, 0.8, big)); a = mix(a, c0, 0.3);
    a *= 0.93 + rip * fade * 0.09 + (gr - 0.5) * 0.12;
    r = 0.9 + gr * 0.05; x = h;`],
});
OPT_TEX.add('gres'); OPT_TEX.add('dune');
/* Surfaces procédurales que Simoun demande (`surfaces` de sa définition) : l'eau de l'oasis, le grès des rochers, le sable des dunes */
var SIMOUN_SURFACES = ['ripple', 'gres', 'dune', 'palmbark', 'drystone'];

/* Couleurs. Les deux moitiés se distinguent : bâches vertes et drapeaux verts au nord (Alpha, +z), bâches bleues au sud (Bravo, -z) */
var SM = {
  accent: [[0.16, 0.42, 0.26], [0.12, 0.3, 0.62]],
  wood: [0.62, 0.48, 0.36], palm: [0.58, 0.46, 0.34], rock: [1.0, 0.94, 0.9], rockP: [1.16, 0.88, 0.7], // rockP : sur la photo de falaise
  rust: [[0.62, 0.4, 0.28], [0.72, 0.52, 0.38], [0.55, 0.5, 0.46], [0.66, 0.6, 0.52], [0.5, 0.34, 0.26]],
  wool: [[0.2, 0.15, 0.11], [0.28, 0.2, 0.14], [0.16, 0.12, 0.09], [0.34, 0.26, 0.18]],
};
var smAccent = (z) => SM.accent[z >= 0 ? 0 : 1];
/* Bruit de taille f (m), périodique tous les 32 f mètres */
function smN(N, x, z, f, oct = 3, o = 0) { return N.fbm(x / (f * 32) + o, z / (f * 32), 32, 32, oct); }
/* Hauteur où poser un objet de rayon r : la plus basse du relief sous lui (il s'enfonce un peu dans le sable, jamais en l'air) */
function smY(x, z, r = 0) {
  if (!r) return gy0(x, z);
  let h = gy0(x, z);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; h = Math.min(h, gy0(x + Math.cos(a) * r, z + Math.sin(a) * r)); }
  return h - 0.04;
}
/* Emprise d'un prefab au sol (sommets sous 2 m, repère local) : centre et demi-côtés, gardés avec lui */
function smFoot(pf) {
  if (pf.foot) return pf.foot;
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const part of pf.parts.values()) { const P = part.g.P; for (let i = 0; i < part.g.nv; i++) { if (P[i * 3 + 1] > 2) continue; const x = P[i * 3], z = P[i * 3 + 2]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } }
  if (x0 > x1) x0 = x1 = z0 = z1 = 0;
  return (pf.foot = { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, hw: (x1 - x0) / 2, hd: (z1 - z0) / 2 });
}
/* Collisions des prefabs qui n'en portent pas (02f-props.js, 02g-vehicles.js : la carte les décrit), dans le repère du prefab :
   [matière, [x0, x1, y0, y1, z0, z1], ...] ; les véhicules portent les leurs (pf.vcols, 02g-vehicles.js). Tente : les parois jusqu'à 2,1 m, le toit à
   deux pans en deux gradins ; conteneur ouvert : les deux parois et le toit (on le traverse) ; citerne ; mât de l'antenne. Jusqu'en 4.6.0, aucune :
   on traversait les voitures, les camions et les tentes de Simoun */
var SM_COLS = {
  tent: ['dirt', [-3.5, 3.5, 0, 2.1, -2.2, 2.2], [-3.5, 3.5, 2.1, 2.7, -1.2, 1.2], [-3.5, 3.5, 2.7, 3.25, -0.5, 0.5]],
  containerOpen: ['metal', [-1.22, -1.1, 0, 2.6, -3.03, 3.03], [1.1, 1.22, 0, 2.6, -3.03, 3.03], [-1.22, 1.22, 2.5, 2.62, -3.03, 3.03]],
  waterTank: ['metal', [-0.55, 0.55, 0, 1.42, -0.55, 0.55]],
  antenna: ['metal', [-0.06, 0.06, 0, 3.2, -0.06, 0.06]],
};
/* Pose un prefab sur le sable aplani sous son emprise (reliefFlat) : il n'entre pas dans une dune et ne flotte pas ; o.margin (0,4 m).
   Les collisions de SM_COLS s'ajoutent à celles du prefab */
function smPlace(pf, x, z, rot = 0, o = {}) {
  const f = smFoot(pf), c = Math.cos(rot), s = Math.sin(rot);
  const y = reliefFlat(x + f.cx * c + f.cz * s, z - f.cx * s + f.cz * c, f.hw, f.hd, rot, { margin: o.margin !== undefined ? o.margin : 0.4 });
  DECOR.place(pf, x, y - 0.02, z, rot, o);
  const k = pf.vcols ? ['metal', ...pf.vcols] : SM_COLS[pf.name]; // véhicule : ses collisions (vehCols)
  if (k && !o.nocol) colShape(x, y - 0.02, z, rot, k.slice(1), k[0]);
  return y;
}
/* Sol aplani sous une construction posée à la main (cabane, mirador, bâche, mur) : comme smPlace, rend la hauteur où la poser */
var smFlat = (x, z, hw, hd, rot = 0, margin = 0.4) => reliefFlat(x, z, hw, hd, rot, { margin }) - 0.02;

/* ---------- Matières et atlas ---------- */
function makeSimounMaterials(M) {
  M('pise', { tex: 'pise', grime: 1.3, streak: 0.9, dust: 0.35, macro: 0.5 });
  M('adobe', { tex: 'adobe', grime: 0.9, streak: 0.6, dust: 0.35, macro: 0.35, pom: 0.02, relief: 0.35 });
  // grès des massifs : photo d'une falaise stratifiée (Poly Haven, cliff_side) teintée par les sommets ; sans elle (réseau coupé), la surface procédurale
  if (TEX.strata) M('gres', { tex: 'strata', scale: 5.5, macro: 0.5, grime: 0.35, streak: 0.45, dust: 0.1, pom: 0.06 });
  else M('gres', { tex: 'gres', macro: 0.55, grime: 0.3, streak: 0.35, dust: 0.08, pom: 0.05 });
  M('galets', { tex: 'galets', macro: 0.35, dust: 0.2, pom: 0.03 });
  M('drystone', { tex: 'drystone', grime: 0.4, dust: 0.4, macro: 0.3, pom: 0.04 }); // la pierre sèche du puits de Greek (cyWell)
  // carlingue de l'avion : peinture mate, passée et poussiéreuse (moins de reflets que la peinture des voitures)
  M('hull', { tex: 'paint', metal: 0.2, ma: true, env: 0.3, grime: 1.2, dust: 1.0, macro: 0.45, streak: 0.7 });
  // cabine de l'avion : panneaux et coffres lisses, cuir des sièges, sans motif (la couleur vient des sommets)
  M('cabin', { color: [1, 1, 1], rough: 0.5, env: 0.45, macro: 0.04 });
  // vitres de l'avion : verre transparent, poussiéreux et rayé, une moitié de l'atlas fêlée ; ni ombre ni occlusion (comme la verrière de Modern)
  const gt = smGlassTex(), gm = new THREE.MeshStandardMaterial({ map: gt, vertexColors: true, transparent: true, depthWrite: false, roughness: 0.08, metalness: 0, envMapIntensity: 1, side: THREE.DoubleSide });
  gm.userData.noShadow = true; gm.userData.noAO = true; gm.userData.noReceive = true; gm.userData.own = [gt]; MAT.glassAir = gm;
  // feuillages en cartes découpées (atlas de la flore méditerranéenne de Greek : tamaris, olivier, roseaux, herbes)
  M('cyfol', { tex: 'cyfol', cut: 0.42, rough: 0.8, env: 0.35, macro: 0.25, scale: 1, noNormal: true }); makeWind(MAT.cyfol, WIND_AMP.cyfol, { leaf: true, cards: true }); // feuillage au vent (02md-vent.js)
}
/* Atlas de la carte (appelé par buildTextures) ; une photo absente est remplacée par une surface procédurale proche */
function simounKit() {
  TEX.cyfol = cyFloraAtlas();
  if (!TEX.pise) TEX.pise = TEX.plaster2 || TEX.concrete;
  if (!TEX.adobe) TEX.adobe = TEX.ashlar || TEX.concrete;
  if (!TEX.galets) TEX.galets = TEX.gravel;
  if (!TEX.vase) TEX.vase = TEX.dirt || TEX.sand;
  if (!TEX.reg) TEX.reg = TEX.dirt || TEX.sand;
}

/* ---------- Massifs de grès ---------- */
/* Couches dures du grès (hauteurs absolues, m) : la paroi y avance en corniche, à la même hauteur d'un massif à l'autre */
var SM_BANDS = [2.6, 5.9, 9.4, 13.8, 18.5, 24.0, 30.5, 37.0];
/* Teinte de la roche (linéaire) : pied plus sombre et plus rouge, patine du désert en coulées (vn : bruit de la coulée, de 0 à 1), dessus
   pâli par le soleil ; k : variation du grain */
function smRockTint(y, y0, top, vn, k) {
  const foot = 1 - smoothstep(y0, y0 + 2.2, y), head = smoothstep(top - 2.5, top, y), streak = smoothstep(0.55, 0.85, vn) * smoothstep(top, top - 6, y) * 0.42;
  const C = TEX.strata ? SM.rockP : SM.rock; // la photo de falaise est beige : teinte plus chaude pour un grès du désert
  const r = lerp(C[0], 0.86, foot) * (1 - streak) * k + head * 0.05, g = lerp(C[1], 0.6, foot) * (1 - streak * 1.1) * k + head * 0.06, b = lerp(C[2], 0.5, foot) * (1 - streak * 1.2) * k + head * 0.06;
  return [sl(clamp(r, 0, 1.2)), sl(clamp(g, 0, 1.2)), sl(clamp(b, 0, 1.2))];
}
/* Massif. I : { rects [x0, x1, z0, z1] (multiples de 0,5 m, voir stOutline), top (hauteur du dessus), seed, y0 (pied, 0), walk (dessus
   praticable : plat, matière du sol, bord exact), col (faux : sans collision, décor lointain), cls (classe de détail, 0), bulge (avancée
   maximale de la paroi, m), cap (faux : sans dessus, caché sous un autre massif) }.
   Collisions : une boîte par rectangle, du pied au dessus. La paroi ne rentre jamais derrière le bord des collisions (on voit où l'on bute) ;
   au pied elle n'avance que de quelques centimètres (les jambes n'y entrent pas), plus haut elle se bossèle et avance en corniche sur les
   couches dures. Rend le contour (stOutline). */
function smMassif(I) {
  const M = DECOR, O = stOutline(I.rects), N = makeNoise(I.seed), R = rngOf(I.seed * 7 + 3), y0 = I.y0 || 0, top = I.top, bulge = I.bulge !== undefined ? I.bulge : 0.9;
  if (I.col !== false) for (const q of I.rects) DECOR.col(q[0], q[1], y0, top, q[2], q[3], 'concrete');
  // boucle du bord, tous les 0,6 m au plus ; normale horizontale sortante (moyenne aux angles rentrants). Aux angles saillants, un éventail
  // de normales au même point : avec l'avancée minimale de la paroi (dmin, plus bas), l'angle droit des collisions devient un arc, toujours
  // dehors (retour du propriétaire, octobre 2026 : rochers très anguleux, géométrie ratée)
  const P = O.pts, loop = [], NF = 7;
  for (let k = 0; k < P.length; k++) {
    const a = P[k], b = P[(k + 1) % P.length], L = hyp(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 0.6));
    const nx = (b[1] - a[1]) / L, nz = -(b[0] - a[0]) / L, pa = P[(k + P.length - 1) % P.length], Lp = hyp(a[0] - pa[0], a[1] - pa[1]);
    const px = (a[1] - pa[1]) / Lp, pz = -(a[0] - pa[0]) / Lp, convex = (b[0] - a[0]) * px + (b[1] - a[1]) * pz < 0;
    if (convex) { const t0 = Math.atan2(pz, px); let dt = Math.atan2(nz, nx) - t0; if (dt > Math.PI) dt -= TAU; if (dt < -Math.PI) dt += TAU; for (let f = 1; f < NF; f++) loop.push({ x: a[0], z: a[1], nx: Math.cos(t0 + dt * f / NF), nz: Math.sin(t0 + dt * f / NF), fan: true }); }
    for (let i = 0; i < n; i++) loop.push({ x: lerp(a[0], b[0], i / n), z: lerp(a[1], b[1], i / n), nx, nz, corner: i === 0, convex: i === 0 && convex, arms: i === 0 ? Math.min(L, Lp) : 0 });
  }
  for (let k = 0; k < loop.length; k++) if (loop[k].corner && !loop[k].convex) { const p = loop[(k + loop.length - 1) % loop.length], q = loop[k], l = hyp(p.nx + q.nx, p.nz + q.nz) || 1; q.nx = (p.nx + q.nx) / l; q.nz = (p.nz + q.nz) / l; }
  // normales lissées sur quelques points de part et d'autre : aux petits ressauts des massifs en bandes, deux normales voisines presque
  // opposées repliaient la paroi sur elle-même (de minces lames verticales) ; amortissement près des angles rentrants
  { const n = loop.length, nx = loop.map((p) => p.nx), nz = loop.map((p) => p.nz);
    for (let it = 0; it < 4; it++) for (let k = 0; k < n; k++) { const a = (k + n - 1) % n, b = (k + 1) % n; nx[k] = nx[a] + 2 * loop[k].nx + nx[b]; nz[k] = nz[a] + 2 * loop[k].nz + nz[b]; }
    for (let k = 0; k < n; k++) { const l = hyp(nx[k], nz[k]); loop[k].damp = clamp(l / (4 * 4), 0.15, 1); if (l > 1e-6) { loop[k].nx = nx[k] / l; loop[k].nz = nz[k] / l; } } }
  let s = 0; for (let k = 0; k < loop.length; k++) { loop[k].s = s; const q = loop[(k + 1) % loop.length]; s += hyp(q.x - loop[k].x, q.z - loop[k].z); }
  // distance (le long du contour) à l'angle le plus proche : les faces bombent plus que les angles, qui paraissent usés et arrondis
  { const cs = loop.filter((p) => p.corner).map((p) => p.s); for (const p of loop) { let m = 1e9; for (const c of cs) { const d = Math.abs(p.s - c); m = Math.min(m, d, s - d); } p.face = smoothstep(0, 3, m); } }
  const per = s, K = Math.max(4, Math.round(per / 7)), K2 = Math.max(6, Math.round(per / 3)), K3 = Math.max(4, Math.round(per / 6.5));
  // rangs : sous le sol, au pied, puis tous les 1,2 à 2 m, deux de part et d'autre de chaque couche dure, le haut de la paroi et le dessus
  let Ys = I.under ? [y0, y0 + 0.3] : [y0 - 0.5, y0 + 0.3];
  for (let y = y0 + R.range(0.9, 1.2); y < top - 0.8; y += R.range(0.8, 1.2)) Ys.push(y);
  const bands = SM_BANDS.filter((b) => b > y0 + 1.2 && b < top - 0.6);
  for (const b of bands) Ys.push(b - 0.3, b + 0.08);
  Ys = Ys.filter((y) => !bands.some((b) => y > b - 0.75 && y < b + 0.55 && Math.abs(y - (b - 0.3)) > 1e-6 && Math.abs(y - (b + 0.08)) > 1e-6));
  Ys.push(top - (I.walk ? 0.12 : 0.4), top); if (I.walk) Ys.push(top - 0.35, top - 0.7); Ys.sort((a, b) => a - b);
  Ys = Ys.filter((y, i) => i === 0 || y - Ys[i - 1] > 0.05);
  const nR = Ys.length, nL = loop.length;
  const ring = Ys.map((y, j) => loop.map((p) => {
    const foot = smoothstep(y0 + 0.2, y0 + 2.4, y), t = p.s / per;
    const lump = smN(N, p.s, y, 6, 3) - 0.38, crag = 0.5 - Math.abs(2 * N.fbm(t + 0.37, y / 9, K2, 6, 2) - 1);
    // côtes verticales (diaclases : la paroi se débite en colonnes), bosses, arêtes, corniches sur les couches dures
    const rib = smoothstep(0.4, 0.75, N.fbm(t + 0.13, y / 70, K3, 1, 2)) * 0.7;
    let d = Math.max(0, lump) * lerp(0.2, bulge, foot) + Math.max(0, crag) * 0.4 * foot * bulge + rib * bulge * lerp(0.15, 1, foot);
    // contreforts : grandes masses arrondies de 6 à 12 m, au-dessus de la hauteur d'homme seulement (au pied, la paroi suit la collision) ; elles
    // s'enflent sur 4 m de haut : plus vite, leur dessous faisait un surplomb tourné vers le sol, sans soleil ni ciel (de grandes taches sombres)
    const high = smoothstep(y0 + 2.4, y0 + 6.6, y), mass = smoothstep(0.36, 0.74, N.fbm(t + 0.71, y / 26, Math.max(3, Math.round(per / 9)), 2, 2));
    d += mass * high * bulge * 0.9 * lerp(0.35, 1, p.face);
    // corniches des couches dures : à peine saillantes, par endroits (la photo porte déjà les bancs ; un bandeau continu faisait un gâteau à étages,
    // et une corniche franche, interrompue, laissait dessous une tache d'ombre)
    for (const b of bands) d += 0.32 * bulge * Math.exp(-(((y - b + 0.12) / 0.45) ** 2)) * foot * smoothstep(0.3, 0.62, N.fbm(t, b / 40, K, 2, 2)) * (TEX.strata ? 0.35 : 1.3);
    d *= p.damp;
    d = Math.max(d, lerp(0.22, 0.75, foot) * lerp(0.75, 1, p.face)); // avancée minimale : les angles saillants s'arrondissent (éventail de normales), dehors
    if (I.walk) d *= smoothstep(top + 0.01, top - 1.2, y); // le bord du dessus suit exactement la collision
    else if (y >= top - 1e-6) d = 0; // le dessus se referme sur le contour (sans repli)
    if (y < y0) d = Math.max(d, 0.2);
    const jy = j > 1 && j < nR - 2 ? (N.fbm(t, j / 7, K, 2, 2) - 0.5) * 0.35 : 0;
    return [p.x + p.nx * d, y + jy, p.z + p.nz * d];
  }));
  // normales : différences le long de la boucle et d'un rang à l'autre ; vers l'extérieur
  const norm = [];
  for (let j = 0; j < nR; j++) for (let k = 0; k < nL; k++) {
    const a = ring[j][(k + 1) % nL], b = ring[j][(k + nL - 1) % nL], c = ring[Math.min(nR - 1, j + 1)][k], d = ring[Math.max(0, j - 1)][k];
    const tx = a[0] - b[0], ty = a[1] - b[1], tz = a[2] - b[2], vx = c[0] - d[0], vy = c[1] - d[1], vz = c[2] - d[2];
    let nx = ty * vz - tz * vy, ny = tz * vx - tx * vz, nz = tx * vy - ty * vx;
    const p = loop[k]; if (nx * p.nx + nz * p.nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    const l = hyp3(nx, ny, nz) || 1; norm.push([nx / l, ny / l, nz / l]);
  }
  M.save().local(1); M.cls = I.cls || 0; M.aoFn = null;
  let cx = 0, cz = 0; for (const p of loop) { cx += p.x; cz += p.z; } cx /= nL; cz /= nL;
  const B = M.buf('gres', cx, (y0 + top) / 2, cz), ids = [];
  for (let j = 0; j < nR; j++) for (let k = 0; k < nL; k++) {
    const q = ring[j][k], n = norm[j * nL + k], vn = N.fbm(loop[k].s / per + 0.61, 0.5, Math.max(8, Math.round(per / 2.2)), 1, 2);
    M.tint = smRockTint(q[1], y0, top, vn, 0.92 + (N.fbm(loop[k].s / per, j / 9, 8, 2, 2) - 0.5) * 0.3);
    ids.push(M.v(B, q[0], q[1], q[2], n[0], n[1], n[2], loop[k].s, q[1], lerp(0.55, 1, smoothstep(y0, y0 + 1.6, Ys[j]))));
  }
  // faces tournées vers l'extérieur (la boucle du contour tourne dans le sens où sa normale (dz, -dx) sort)
  for (let j = 0; j < nR - 1; j++) for (let k = 0; k < nL; k++) M.quadI(B, ids[j * nL + k], ids[(j + 1) * nL + k], ids[(j + 1) * nL + (k + 1) % nL], ids[j * nL + (k + 1) % nL]);
  M.restore();
  // éboulis au pied : petits blocs tombés de la paroi, en traînées irrégulières hors des boîtes de collision ; sans collision (moins de 35 cm de
  // haut, comme les débris du sol), ils cassent la ligne droite entre le sable et la roche
  if (I.col !== false && I.scree !== false) {
    const inRect = (x, z) => I.rects.some((q) => x > q[0] - 0.25 && x < q[1] + 0.25 && z > q[2] - 0.25 && z < q[3] + 0.25);
    for (let k = 0; k < nL; k++) {
      const p = loop[k]; if (N.fbm(p.s / per + 0.29, 0.3, Math.max(4, Math.round(per / 5)), 1, 2) < 0.47) continue;
      for (let i = 0, n = 1 + Math.floor(R() * 2); i < n; i++) {
        const o = R.range(0.35, 1.7), w = R.range(-0.45, 0.45), x = p.x + p.nx * o - p.nz * w, z = p.z + p.nz * o + p.nx * w;
        if (inRect(x, z)) continue;
        DECOR.place(PF.smScree(1 + Math.floor(R() * 6)), x, smY(x, z) - 0.04, z, R() * TAU, { nocol: true, s: R.range(0.6, 1.25) });
      }
    }
  }
  if (I.under) { // dessous d'un pont de roche (voûte d'une grotte) : la roche vue d'en bas, sombre
    M.save().local(1); M.cls = I.cls || 0; M.aoFn = null; M.color([0.6, 0.46, 0.38]);
    const U = M.buf('gres', cx, y0, cz);
    for (const q of I.rects) { const a = M.v(U, q[0], y0, q[2], 0, -1, 0, q[0], q[2], 0.5), b = M.v(U, q[1], y0, q[2], 0, -1, 0, q[1], q[2], 0.5), c = M.v(U, q[1], y0, q[3], 0, -1, 0, q[1], q[3], 0.5), d = M.v(U, q[0], y0, q[3], 0, -1, 0, q[0], q[3], 0.5); M.quadI(U, a, b, c, d); }
    M.restore();
  }
  if (I.cap === false) return O;
  // blocs détachés le long de l'arête du dessus praticable, un plus gros sur chaque angle saillant : ils cassent la ligne droite et l'angle
  // droit du plateau ; à demi sur le bord, sans collision (moins de 45 cm au-dessus du dessus : on marche à travers comme sur des cailloux)
  if (I.walk && I.rim !== false) {
    let last = -9;
    for (let k = 0; k < nL; k++) {
      const p = loop[k]; if (p.fan) continue;
      const big = p.convex && p.arms >= 2.5, nz = N.fbm(p.s / per + 0.83, 0.7, Math.max(6, Math.round(per / 3)), 1, 2); // gros bloc : angle franc, pas un petit ressaut
      if (!big && (nz < 0.62 || p.s - last < 4.5 || p.corner)) continue;
      last = p.s;
      const sc = big ? R.range(0.95, 1.25) : R.range(0.7, 1.0), o = big ? -0.45 : R.range(-0.4, -0.1);
      DECOR.place(PF.smRock(sc, 1 + Math.floor(R() * 6), 0.42), p.x + p.nx * o, top - sc * 0.16, p.z + p.nz * o, R() * TAU, { nocol: true });
    }
  }
  if (I.walk) {
    // dessus praticable : les cases de 0,5 m couvertes, réunies par rangées, dans la matière du sol (répartition comprise)
    M.save().local(1).color([0.92, 0.9, 0.86]); M.cls = 0; M.aoFn = null;
    const T = M.buf('ground', O.bx0 + O.W * O.r / 2, top, O.bz0 + O.H * O.r / 2);
    for (let j = 0; j < O.H; j++) for (let i = 0; i < O.W; i++) {
      if (!O.on[j * O.W + i] || (i > 0 && O.on[j * O.W + i - 1])) continue;
      let k = i; while (k + 1 < O.W && O.on[j * O.W + k + 1]) k++;
      const x0 = O.bx0 + i * O.r, x1 = O.bx0 + (k + 1) * O.r, z0 = O.bz0 + j * O.r, z1 = z0 + O.r;
      const a = M.v(T, x0, top, z0, 0, 1, 0, x0, -z0), b = M.v(T, x1, top, z0, 0, 1, 0, x1, -z0), c = M.v(T, x1, top, z1, 0, 1, 0, x1, -z1), d = M.v(T, x0, top, z1, 0, 1, 0, x0, -z1);
      M.quadI(T, a, d, c, b);
    }
    M.restore();
  } else {
    // dessus de roche : le haut de la paroi (dernier rang) triangulé, dans la matière du sol (sable et cailloux du plateau)
    const top2 = ring[nR - 1].map((q) => q.slice()), contour = top2.map((q) => new THREE.Vector2(q[0], q[2]));
    const tri = THREE.ShapeUtils.triangulateShape(contour, []);
    M.save().local(1); M.cls = I.cls || 0; M.aoFn = null;
    M.color([0.98, 0.86, 0.74]);
    const T = M.buf('ground', cx, top, cz), vids = top2.map((q) => M.v(T, q[0], q[1], q[2], 0, 1, 0, q[0], -q[2]));
    for (const t of tri) { const a = top2[t[0]], b = top2[t[1]], c = top2[t[2]], cr = (b[0] - a[0]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[0] - a[0]); if (cr > 0) M.tri(T, vids[t[0]], vids[t[2]], vids[t[1]]); else M.tri(T, vids[t[0]], vids[t[1]], vids[t[2]]); }
    M.restore();
  }
  return O;
}

/* Éboulis : deux à quatre petits blocs anguleux de grès tombés de la paroi (au plus 30 cm), sans collision */
PF.smScree = (seed = 1) => prefab('smScree' + seed, (M) => {
  const R = rngOf(seed * 37 + 11); M.cls = 2; M.local(1);
  for (let i = 0, n = 2 + Math.floor(R() * 3); i < n; i++) {
    const a = R() * TAU, d = i ? R.range(0.15, 0.5) : 0, s = i ? R.range(0.06, 0.16) : R.range(0.14, 0.26), g = R.range(0.86, 1.06);
    M.color([1.06 * g, 0.8 * g, 0.62 * g]);
    M.save().move(Math.cos(a) * d, -s * 0.15, Math.sin(a) * d).rotY(R() * TAU).rotZ(R.range(-0.3, 0.3));
    rockMesh(M, R, s * R.range(1, 1.5), s * R.range(0.55, 0.9), s * R.range(0.8, 1.2), 3 + Math.floor(R() * 4), 7, 5, 'gres');
    M.restore();
  }
});
/* Rocher de grès isolé (couvert) : bloc taillé de facettes, collision de sa boîte resserrée ; s : taille (m), squash : aplatissement */
PF.smRock = (s = 1.6, seed = 1, squash = 0.75) => prefab(`smRock${s}_${seed}_${squash}`, (M) => {
  const R = rngOf(seed * 13 + 7);
  M.color([R.range(0.92, 1.02), R.range(0.74, 0.84), R.range(0.6, 0.7)]).local(1);
  rockMesh(M, R, s * 0.62, s * 0.62 * squash, s * 0.55, 8, 11, 8, 'gres');
  M.col(-s * 0.5, s * 0.5, 0, s * 0.62 * squash * 1.7, -s * 0.44, s * 0.44, 'concrete');
});

/* ---------- Pisé : ruines ---------- */
/* Mur ruiné : de a0 à a1, troué des passages gaps [[a0, a1], ...] (sans linteau), en pans de 0,8 à 2 m de hauteurs tirées entre h0 et h1 (arase
   cassée en gradins), pied enfoncé sous le sable (y0) ; quelques briques tombées au pied */
function smRuin(axis, fixed, t, a0, a1, y0, h0, h1, gaps, R, tint) {
  const segs = []; let cur = a0;
  for (const g of gaps.slice().sort((p, q) => p[0] - q[0])) { if (g[0] - cur > 0.3) segs.push([cur, g[0]]); cur = g[1]; }
  if (a1 - cur > 0.3) segs.push([cur, a1]);
  for (const [s0, s1] of segs) {
    let a = s0;
    let h = R.range(h0, h1);
    while (a < s1 - 1e-3) {
      const b = Math.min(s1, a + R.range(0.5, 1.1));
      h = clamp(h + R.range(-0.35, 0.35), h0, h1);
      wallOpen('pise', axis, fixed, t, a, s1 - b < 0.3 ? s1 : b, y0, h, [], { tint, frames: false });
      a = s1 - b < 0.3 ? s1 : b;
    }
  }
  const M = DECOR; M.save().color(tint); M.cls = 2;
  for (let i = 0; i < Math.round((a1 - a0) / 2.5); i++) {
    const a = R.range(a0, a1), off = (R() < 0.5 ? -1 : 1) * R.range(t / 2 + 0.15, t / 2 + 0.7), x = axis === 'x' ? a : fixed + off, z = axis === 'x' ? fixed + off : a, s = R.range(0.18, 0.3);
    M.save().move(x, smY(x, z) + s * 0.25, z).rotY(R() * TAU).rotX(R.range(-0.4, 0.4)); M.boxB('adobe', -s, s, -s * 0.4, s * 0.4, -s * 0.6, s * 0.6, { bevel: 0.03 }); M.restore();
  }
  M.restore();
}

/* ---------- Objets du désert ---------- */
function smJar(x, z, s = 1, R) { DECOR.dyn('jar', x, smY(x, z, 0.25), z, R ? R() * TAU : 0, { s }); }
/* Muret de sacs de sable : un prop physique par sac, en rangs décalés, posés sur le relief ; les tirs les ébranlent et finissent par les faire
   tomber, avec ceux qu'ils portaient */
function smSandbags(cx, cz, len, axis, rows, R) {
  const bl = 0.6, n = Math.max(1, Math.round(len / bl)), step = len / n, k = step / bl, dx = axis === 'x' ? 1 : 0, dz = axis === 'x' ? 0 : 1, rot = axis === 'x' ? 0 : Math.PI / 2;
  const W = rngOf(Math.round(cx * 131 + cz * 17 + len * 7 + 99)), fallen = [], top = rows - 1, base = [0.95, 0.85, 0.71];
  // usure (sandbagWear) : rang du haut jamais complet, bouts partis surtout, sacs partis souvent couchés au pied du mur
  const wr = rows > 1 ? sandbagWear(n - (top % 2), top % 2 === 1, (top - 1) % 2 === 1, W) : null, fall = (x, z, type) => sandbagFallen(x, z, dx, dz, 0.2 * k, rot, (px, pz) => smY(px, pz), k, base, W, fallen, type);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * step * 0.5;
    for (let i = 0; i < n - (r % 2); i++) {
      const a = -len / 2 + step * (i + 0.5) + off, j = (R() - 0.5) * 0.03, x = axis === 'x' ? cx + a : cx + j, z = axis === 'x' ? cz + j : cz + a;
      const tint = [0.9 + R() * 0.1, 0.8 + R() * 0.1, 0.66 + R() * 0.1];
      if (wr && r === top && wr.gone.has(i)) { fall(x, z); continue; }
      DECOR.dyn('sandbag', x, smY(x, z) + r * 0.22 * k, z, rot + j * 2, { s: k, tint }); // désaxé de 3° au plus
    }
    // un rang décalé se ferme par deux demi-sacs (tirage propre au mur : la suite du décor ne change pas)
    if (r % 2) sandbagHalves(cx, cz, len, dx, dz, (x, z) => smY(x, z) + r * 0.22 * k, k, base, rngOf(Math.round(cx * 131 + cz * 17 + r * 7 + 9000)), wr ? (r === top ? wr.half : r === top - 1 ? wr.low : null) : null, fall);
  }
}
/* Bâche tendue sur quatre perches : de (x, z), w le long de rot, d en travers, bord haut h0 et bord bas h1 au-dessus du sol y ; la toile sans
   collision (une ombre et un abri pour les yeux), simulée (Maker.toile : tenue aux quatre coins et le long des deux bords hauts et bas, ses
   côtés libres battent), les perches ont une collision, haubans */
function smTarp(x, y, z, rot, w, d, h0, h1, col) {
  const M = DECOR; M.save().move(x, y, z).rotY(rot);
  M.color(col); M.cls = 1;
  M.toile(4, 3, (u, v) => { const xx = (u - 0.5) * w, zz = (v - 0.5) * d; return [xx, lerp(h0, h1, v) - Math.sin(u * Math.PI) * Math.sin(v * Math.PI) * 0.12, zz]; }, { uL: w, vL: d, flipN: true, play: 0.22, pin: (u, v) => v <= 0 || v >= 1 });
  M.color(SM.palm); M.cls = 1;
  for (const sx of [-1, 1]) for (const [sz, h] of [[-1, h0], [1, h1]]) { M.save().move(sx * w / 2, 0, sz * d / 2); M.cyl('wood', 0.04, h + 0.05, 6); M.restore(); M.col(sx * w / 2 - 0.06, sx * w / 2 + 0.06, 0, h, sz * d / 2 - 0.06, sz * d / 2 + 0.06, 'wood'); }
  M.color([0.62, 0.56, 0.46]);
  for (const sx of [-1, 1]) for (const [sz, h] of [[-1, h0], [1, h1]]) M.tube('burlap', 0.008, [[sx * w / 2, h, sz * d / 2], [sx * (w / 2 + 0.9), 0, sz * (d / 2 + 0.9)]], 3);
  M.restore();
}
/* Foyer : cercle de pierres noircies, braises éteintes, marmite sur trois pierres */
PF.smFire = () => prefab('smFire', (M) => {
  const R = rngOf(9177); M.local(1);
  for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; M.save().move(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55).rotY(a); M.color([0.42, 0.36, 0.32]); rockMesh(M, R, 0.16, 0.1, 0.13, 5, 6, 5, 'stone'); M.restore(); }
  M.color([0.12, 0.1, 0.09]); M.boxB('charred', -0.4, 0.4, 0, 0.04, -0.4, 0.4, { bevel: 0.02 });
  for (let i = 0; i < 4; i++) { M.save().move(0, 0.06, 0).rotY(i * 0.8).rotZ(0.2); M.cyl('charred', 0.04, 0.6, 6); M.restore(); }
  M.color([0.2, 0.19, 0.18]); M.save().move(0.15, 0.08, 0.1); M.lathe('steel', [[0, 0], [0.18, 0.02], [0.22, 0.14], [0.2, 0.24], [0.17, 0.25]], 10); M.restore();
});
/* Tente bédouine : toit bas et large en lés de laine sombre (une bande claire de temps en temps), affaissé entre les poteaux, relevé devant (le
   côté ouvert, +z), fermé derrière et sur les côtés jusqu'au sol ; tapis et coussins dedans, haubans et piquets devant. Collisions des parois
   (on y entre par l'avant) ; le toit n'en a pas. Lés et parois sont des toiles simulées (Maker.toile) : chaque lé est cousu à ses voisins
   (ses bords tiennent) et repose sur la rangée de poteaux, le milieu des lés ondule et se creuse sous un souffle */
PF.smBedouin = (w = 7, d = 4.4, seed = 1) => prefab(`smBedouin${w}_${d}_${seed}`, (M) => {
  const R = rngOf(seed * 37 + 5), hw = w / 2, hd = d / 2, hR = 2.05, hF = 1.6, hB = 0.85, rz = -0.3, np = Math.max(2, Math.round(w / 2.4));
  const yz = (z) => (z < rz ? lerp(hB, hR, smoothstep(-hd, rz, z)) : lerp(hR, hF, smoothstep(rz, hd, z)));
  const sag = (x) => { const t = ((x + hw) / w) * np, f = t - Math.floor(t); return 0.2 * Math.sin(f * Math.PI); };
  const Y = (x, z) => yz(z) - sag(x) * (1 - 0.4 * Math.abs(z - rz) / hd);
  M.local(1); M.cls = 0;
  const nb = Math.round(w / 0.75), wool = (b) => (R() < 0.12 ? [0.6, 0.52, 0.4] : SM.wool[(b % 2) + (R() < 0.3 ? 2 : 0)]);
  for (let b = 0; b < nb; b++) {
    const x0 = -hw + (w * b) / nb, x1 = -hw + (w * (b + 1)) / nb;
    M.color(wool(b));
    M.toile(2, 10, (u, v) => { const x = lerp(x0, x1, u), z = lerp(-hd, hd, v); return [x, Y(x, z), z]; }, { mat: 'laine', uL: x1 - x0, vL: d, flipN: true, play: 0.07, pin: (u, v) => u <= 0 || u >= 1 || v <= 0 || v >= 1 || Math.abs(lerp(-hd, hd, v) - rz) < 0.12, glow: 0.05 });
    M.toile(2, 2, (u, v) => { const x = lerp(x0, x1, u); return [x, lerp(Y(x, -hd), 0, v), -hd - v * 0.2]; }, { mat: 'laine', uL: x1 - x0, vL: 1, play: 0.06, glow: 0.05 });
  }
  M.color(SM.wool[0]);
  for (const s of [-1, 1]) M.toile(6, 2, (u, v) => { const z = lerp(-hd, 0.4, u); return [s * hw, lerp(Y(s * hw, z), 0, v), z]; }, { mat: 'laine', uL: hd, vL: 1.6, flipN: s < 0, play: 0.08, glow: 0.05 });
  M.color(SM.palm);
  for (let i = 0; i <= np; i++) { const x = -hw + (w * i) / np; M.save().move(x, 0, rz); M.cyl('wood', 0.05, Y(x, rz) + 0.08, 6); M.restore(); M.save().move(x, 0, hd); M.cyl('wood', 0.045, Y(x, hd) + 0.06, 6); M.restore(); }
  M.color([0.6, 0.54, 0.44]);
  for (let i = 0; i <= np; i++) { const x = -hw + (w * i) / np; M.tube('burlap', 0.008, [[x, Y(x, hd), hd], [x * 1.08, 0, hd + 1.7]], 3); }
  M.save().color([1, 1, 1]); M.uvS = 2.4 / TEXSCALE.rug; M.uvO = [0.5, 0.5]; M.cls = 1;
  for (const x of [-hw * 0.5, hw * 0.45]) { M.save().move(x, 0.015, -0.4).rotY(R.range(-0.1, 0.1)); M.boxB('rug', -1.2, 1.2, 0, 0.012, -0.8, 0.8); M.restore(); }
  M.restore();
  for (let i = 0; i < 4; i++) { M.color(R.pick([[0.62, 0.14, 0.12], [0.75, 0.42, 0.15], [0.2, 0.25, 0.5], [0.55, 0.2, 0.3]])); const x = R.range(-hw + 0.6, hw - 0.6); M.save().move(x, 0, -hd + 0.45).rotY(R.range(-0.2, 0.2)); M.boxB('canvas', -0.35, 0.35, 0, 0.32, -0.25, 0.25, { bevel: 0.1 }); M.restore(); }
  M.col(-hw, hw, 0, 1.0, -hd - 0.2, -hd + 0.05, 'dirt');
  for (const s of [-1, 1]) M.col(s * hw - 0.08, s * hw + 0.08, 0, 1.3, -hd, 0.3, 'dirt');
});
/* Cabane de fortune (repère à son pied : (x, y, z), tournée de rot) : poteaux de bois, parois en tôles ondulées rouillées et en planches, de
   teintes mêlées ; une porte sans battant dans la face avant (+z, de o.door à o.door + 1,2 m depuis le milieu), une fenêtre sur un côté, toit
   de tôle en pente vers l'arrière (pneus et pierres dessus) ; o.back : la même porte dans la face arrière (on traverse). Collisions des parois
   et du toit : on entre par la porte */
function smShack(x, y, z, rot, w, d, h, R, o = {}) {
  const M = DECOR, hw = w / 2, hd = d / 2, dr = o.door !== undefined ? o.door : -0.6, t = 0.06, win = o.win !== undefined ? o.win : 1;
  M.save().move(x, y, z).rotY(rot); M.cls = 0;
  const panel = (x0, x1, y0, y1, z0, z1) => { const tin = R() < 0.72; M.color(tin ? R.pick(SM.rust) : [0.55, 0.44, 0.34]); M.boxB(tin ? 'corrugated' : 'wood', x0, x1, y0, y1, z0, z1); };
  const run = (a0, a1, y0, y1, fixed, axis, holes) => { // une face, en panneaux de 0,9 à 1,3 m, trouée de [a0, a1, b0, b1]
    let a = a0;
    while (a < a1 - 1e-3) {
      const b = Math.min(a1, a + R.range(0.9, 1.3)), c = a1 - b < 0.35 ? a1 : b;
      let segs = [[a, c, y0, y1]];
      for (const q of holes) segs = segs.flatMap((s) => { const u0 = Math.max(s[0], q[0]), u1 = Math.min(s[1], q[1]); return q[0] >= s[1] || q[1] <= s[0] ? [s] : [[s[0], u0, s[2], s[3]], [u0, u1, s[2], q[2]], [u0, u1, q[3], s[3]], [u1, s[1], s[2], s[3]]].filter((p) => p[1] - p[0] > 0.02 && p[3] - p[2] > 0.02); }); // le trou rogné au panneau : pas de recouvrement entre deux panneaux
      for (const s of segs) {
        if (axis === 'x') { panel(s[0], s[1], s[2], s[3], fixed - t / 2, fixed + t / 2); M.col(s[0], s[1], s[2], s[3], fixed - 0.07, fixed + 0.07, 'metal'); }
        else { panel(fixed - t / 2, fixed + t / 2, s[2], s[3], s[0], s[1]); M.col(fixed - 0.07, fixed + 0.07, s[2], s[3], s[0], s[1], 'metal'); }
      }
      a = c;
    }
  };
  const hb = h - 0.35;
  run(-hw, hw, 0, h, hd, 'x', [[dr, dr + 1.2, 0, 2.05]]);
  run(-hw, hw, 0, hb, -hd, 'x', o.back ? [[dr, dr + 1.2, 0, 2.05]] : []);
  run(-hd, hd, 0, hb, -hw, 'z', win < 0 ? [[-0.4, 0.4, 1.0, 1.55]] : []);
  run(-hd, hd, 0, hb, hw, 'z', win > 0 ? [[-0.4, 0.4, 1.0, 1.55]] : []);
  // poteaux, linteau, toit
  M.color([0.5, 0.4, 0.3]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) M.boxB('wood', sx * hw - 0.06, sx * hw + 0.06, 0, (sz > 0 ? h : hb) - 0.025, sz * hd - 0.06, sz * hd + 0.06); // sous la tôle (pas dans son plan)
  M.boxB('wood', dr - 0.05, dr + 1.25, 2.0, 2.13, hd - 0.05, hd + 0.05); // linteau : son dessous dépasse sous la tôle (pas dans son plan)
  if (o.back) M.boxB('wood', dr - 0.05, dr + 1.25, 2.0, 2.13, -hd - 0.05, -hd + 0.05);
  M.color(R.pick(SM.rust));
  const B = [[-hw - 0.25, h + 0.04, hd + 0.3], [hw + 0.25, h + 0.04, hd + 0.3], [hw + 0.25, hb - 0.04, -hd - 0.3], [-hw - 0.25, hb - 0.04, -hd - 0.3]];
  M.quad('corrugated', B[0], B[1], B[2], B[3], [0, 1, 0]); M.quad('corrugated', B[0], B[3], B[2], B[1], [0, -1, 0]);
  M.col(-hw, hw, hb - 0.05, h + 0.05, -hd, hd, 'metal');
  M.color([0.18, 0.17, 0.16]); M.cls = 1;
  M.save().move(R.range(-hw * 0.5, hw * 0.5), (h + hb) / 2 + 0.06, R.range(-hd * 0.3, hd * 0.3)); M.lathe('rubber', [[0.2, 0], [0.36, 0.02], [0.4, 0.11], [0.36, 0.2], [0.2, 0.22], [0.18, 0.11], [0.2, 0]], 12); M.restore();
  M.restore();
}
/* Mirador de bois (repère au pied, (x, y, z), x et z au centre d'une case de 1 m) : quatre poteaux, plate-forme de 3,2 m à 3 m, garde-corps
   de tôle sur trois côtés et demi, toit de tôle ; l'escalier (rampe de 6,2 m le long de z, 1,6 m de large, pente 0,48) part du côté dir
   (1 : +z, -1 : -z), sur la moitié x > x0 du devant, ouverte dans le garde-corps */
function smWatchtower(x, y, z, R, dir = 1) {
  const M = DECOR, P = 3.0, hw = 1.6;
  M.save().move(x, y, z); M.cls = 0; M.color([0.52, 0.4, 0.3]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { M.boxB('wood', sx * hw - 0.09, sx * hw + 0.09, 0, P + 2.3, sz * hw - 0.09, sz * hw + 0.09); M.col(sx * hw - 0.09, sx * hw + 0.09, 0, P + 2.3, sz * hw - 0.09, sz * hw + 0.09, 'wood'); }
  // contreventement : croix de Saint-André sur les deux côtés et le fond (deux étages de croix, lisses entre elles), devant ouvert sous
  // l'escalier ; chaque face contreventée arrête le passage (on la traversait : retour du propriétaire, octobre 2026), pas les balles
  const braced = [['x', -1], ['x', 1], ['z', -dir]], seg = (ax, f, y0b, y1b, u0, u1) => { // barre de (u0, y0b) à (u1, y1b) dans la face
    const L = hyp(u1 - u0, y1b - y0b), ang = Math.atan2(y1b - y0b, u1 - u0);
    M.save().move(ax === 'x' ? f * hw : (u0 + u1) / 2, (y0b + y1b) / 2, ax === 'x' ? (u0 + u1) / 2 : f * hw);
    if (ax === 'x') M.rotX(-ang); else M.rotZ(ang);
    if (ax === 'x') M.boxB('wood', -0.045, 0.045, -0.05, 0.05, -L / 2, L / 2); else M.boxB('wood', -L / 2, L / 2, -0.05, 0.05, -0.045, 0.045);
    M.restore();
  };
  for (const [ax, f] of braced) {
    for (const [a, b] of [[0.25, 1.6], [1.6, 2.86]]) { seg(ax, f, a, b, -hw + 0.09, hw - 0.09); seg(ax, f, a, b, hw - 0.09, -hw + 0.09); }
    for (const yy of [0.22, 1.6]) { if (ax === 'x') M.boxB('wood', f * hw - 0.05, f * hw + 0.05, yy - 0.06, yy + 0.06, -hw, hw); else M.boxB('wood', -hw, hw, yy - 0.06, yy + 0.06, f * hw - 0.05, f * hw + 0.05); }
    const c = ax === 'x' ? [f * hw - 0.06, f * hw + 0.06, -hw, hw] : [-hw, hw, f * hw - 0.06, f * hw + 0.06];
    COL.push({ x0: x + c[0], x1: x + c[1], y0: y, y1: y + P - 0.3, z0: z + c[2], z1: z + c[3], m: 'wood', ray: false, noRay: true });
  }
  M.boxB('wood', -hw - 0.1, hw + 0.1, P - 0.14, P, -hw - 0.1, hw + 0.1);
  M.col(-hw - 0.1, hw + 0.1, P - 0.3, P, -hw - 0.1, hw + 0.1, 'wood');
  const back = -dir * hw, front = dir * hw;
  for (const [x0, x1, z0, z1] of [[-hw, hw, back - 0.04, back + 0.04], [-hw - 0.04, -hw + 0.04, -hw, hw], [hw - 0.04, hw + 0.04, -hw, hw], [-hw, -0.1, front - 0.04, front + 0.04]]) {
    M.color(R.pick(SM.rust)); M.boxB('corrugated', x0, x1, P, P + 1.1, z0, z1); M.col(x0, x1, P, P + 1.1, z0, z1, 'metal');
  }
  M.color(R.pick(SM.rust)); M.boxB('corrugated', -hw - 0.3, hw + 0.3, P + 2.3, P + 2.36, -hw - 0.3, hw + 0.3);
  M.col(-hw - 0.3, hw + 0.3, P + 2.3, P + 2.36, -hw - 0.3, hw + 0.3, 'metal', true); // le toit arrête les balles ; on ne s'y hisse pas depuis le garde-corps
  M.restore();
  const za = z + dir * hw, zb = z + dir * (hw + 6.2);
  ramp(x, x + 1.6, Math.min(za, zb), Math.max(za, zb), 'z', dir > 0 ? y + P : y, dir > 0 ? y : y + P, 'pavers', [0.62, 0.5, 0.38], { mat: 'wood' });
}

/* Touffe de roseaux (atlas de Greek) */
PF.smReeds = (s = 1) => prefab('smReeds' + s, (M) => {
  // touffe de roseaux : une trentaine de tiges fines et effilées (deux triangles de toile, verts à jaunes), penchées, quelques épis bruns
  const R = rngOf(Math.round(s * 100) + 17); M.local(1); M.cls = 1;
  M.swFn = swHeight(0, 2 * s, 1.4, 1); // les tiges plient par le haut, au vent (02md-vent.js) ; matière souple 'stem'
  for (let i = 0; i < 30; i++) {
    const a = R() * TAU, r = R() * 0.32 * s, x = Math.cos(a) * r, z = Math.sin(a) * r, h = R.range(1.1, 2.0) * s, lean = R.range(0.05, 0.35), la = R() * TAU, w = R.range(0.02, 0.035);
    const tx = x + Math.cos(la) * lean * h, tz = z + Math.sin(la) * lean * h, mx = (x + tx) / 2 + Math.cos(la) * 0.05, mz = (z + tz) / 2 + Math.sin(la) * 0.05, px = -Math.sin(la) * w, pz = Math.cos(la) * w;
    M.color(R.pick([[0.46, 0.56, 0.26], [0.58, 0.62, 0.3], [0.7, 0.66, 0.38], [0.52, 0.5, 0.28]]));
    M.quad('stem', [x - px, 0, z - pz], [x + px, 0, z + pz], [mx + px * 0.7, h * 0.55, mz + pz * 0.7], [mx - px * 0.7, h * 0.55, mz - pz * 0.7], [Math.cos(la), 0.3, Math.sin(la)]);
    M.quad('stem', [mx - px * 0.7, h * 0.55, mz - pz * 0.7], [mx + px * 0.7, h * 0.55, mz + pz * 0.7], [tx + px * 0.1, h, tz + pz * 0.1], [tx - px * 0.1, h, tz - pz * 0.1], [Math.cos(la), 0.3, Math.sin(la)]);
    if (R() < 0.2) { M.color([0.4, 0.28, 0.18]); M.save().move(tx, h - 0.05, tz); M.cyl('stem', 0.025, 0.2, 5); M.restore(); }
  }
});
/* Acacia (arbre en parasol des oueds) : tronc tordu, couronne plate en nappe, sans feuilles en bas (on voit dessous) */
PF.smAcacia = (h = 4.6, seed = 1, dead = false) => prefab(`smAcacia${h}_${seed}_${dead ? 1 : 0}`, (M) => {
  const R = rngOf(seed * 23 + 11);
  M.color(dead ? [0.62, 0.56, 0.5] : [0.46, 0.38, 0.32]).local(1);
  const path = []; for (let k = 0; k <= 6; k++) { const t = k / 6; path.push([Math.sin(t * 3 + seed) * 0.35 * t, t * h * 0.62, Math.cos(t * 2 + seed) * 0.25 * t]); }
  M.sweep('wood', circleShape(1, 7), path, { scale: (t) => lerp(0.2, 0.09, t), uAround: 0.6 });
  const top = path[path.length - 1], tips = [];
  M.swFn = swCrown(top[0], top[2], h * 0.5, h, h * 0.5, 0.7); // la nappe de feuilles frémit et se balance (02md-vent.js)
  for (let b = 0; b < 4; b++) {
    const a = b * 1.6 + seed + R() * 0.5, reach = h * R.range(0.38, 0.55), P2 = [];
    for (let k = 0; k <= 4; k++) { const t = k / 4; P2.push([top[0] + Math.cos(a) * reach * t, top[1] + Math.sin(t * Math.PI * 0.6) * h * 0.22, top[2] + Math.sin(a) * reach * t]); }
    M.sweep('wood', circleShape(1, 5), P2, { scale: (t) => lerp(0.08, 0.025, t), uAround: 0.6 }); tips.push(P2[4], P2[2]);
  }
  if (!dead) for (let i = 0; i < Math.round(h * 9); i++) {
    const c = tips[Math.floor(R() * tips.length)], a = R() * TAU, r = R() * h * 0.22;
    cyPatch(M, [c[0] + Math.cos(a) * r, c[1] + R.range(-0.05, 0.25), c[2] + Math.sin(a) * r], R.range(0.9, 1.3), CYF.olive, R, R.pick([[0.72, 0.82, 0.55], [0.8, 0.86, 0.6], [0.66, 0.76, 0.5]]), { tilt: R.range(0, 0.35), up: 0.8 });
  }
  M.col(-0.2, 0.2, 0, h * 0.6, -0.2, 0.2, 'wood');
  M.occ(-h * 0.45, h * 0.45, h * 0.6, h, -h * 0.45, h * 0.45, 0.3);
});
/* Prefab de palmier lointain (peu de sommets, sans collision ni ombre propre) : mêmes palmes que PF.palm, en trois segments ; tronc plus ou moins
   gros et couronne plus ou moins grande selon la graine */
PF.smPalmFar = (h = 8, seed = 1) => prefab(`smPalmFar${h}_${seed}`, (M) => {
  const R = rngOf(seed * 7 + 5), lx = R.range(-0.6, 0.6), lz = R.range(-0.6, 0.6), g = 0.75 + ((seed * 5) % 7) * 0.09, cr = 0.85 + ((seed * 3) % 5) * 0.08;
  M.color([0.6, 0.52, 0.42]).local(1); M.cls = 1;
  M.sweep('palmbark', circleShape(1, 5), [[0, 0, 0], [lx * 0.3, h * 0.5, lz * 0.3], [lx, h, lz]], { scale: (t) => (0.22 - 0.08 * t) * g, uAround: 1 });
  for (let i = 0; i < 14; i++) {
    const u = i / 13;
    M.color([R.range(0.85, 1), R.range(0.9, 1), R.range(0.75, 0.9)]);
    palmFrond(M, [lx, h, lz], i * 2.39996 + R() * 0.3, lerp(1.3, 0.25, u), lerp(1.2, -1, u), R.range(3.1, 4) * cr * lerp(0.7, 1, u), { w: 0.5, segs: 3, fw: 0 });
  }
});
/* Puits : celui de Greek (cyWell, 02ye-cyclades-deco.js), sur le sable aplani : même puits creux (margelle de pierre sèche, conduit jusqu'à l'eau,
   potence, poulie), même seau qui pend et se balance quand on le touche (hangAdd), mêmes collisions, tirs et grenades qui descendent dans le
   conduit (HOLES). Conduit de 1 m (rw 0,5) : la grille du relief est de 1 m, le puits est au milieu d'une case (x et z sont ramenés au centre
   de leur case) que reliefMesh saute, la margelle la recouvre. À poser pendant la construction de la carte, avant reliefMesh. */
function smWell(x, z) {
  x = Math.floor(x) + 0.5; z = Math.floor(z) + 0.5;
  cyWell(x, z, { y: reliefFlat(x, z, 1.0, 1.0, 0, { margin: 0.5 }), rw: 0.5, relief: true });
}
/* Tapis qui sèchent sur une corde tendue entre deux perches plantées dans le sable (tissus simulés, lourds : 02mc-tissus.js) ; la corde à y. Jusqu'en
   4.6.0, la corde pendait entre deux crochets en l'air */
function smRugLine(xa, za, xb, zb, y, R) {
  LINES.push({ k: 'linge', a: [xa, y, za], b: [xb, y, zb] }); lineHooks([xa, y, za], [xb, y, zb]);
  const M = DECOR; M.save().color(SM.palm); M.cls = 1;
  for (const [px, pz] of [[xa, za], [xb, zb]]) { const g = smY(px, pz, 0.1); M.save().move(px, g - 0.1, pz); M.cyl('wood', 0.045, y - g + 0.22, 6); M.restore(); M.col(px - 0.06, px + 0.06, g, y + 0.1, pz - 0.06, pz + 0.06, 'wood'); }
  M.color([0.7, 0.62, 0.5]); M.cls = 2;
  M.tube('plastic', 0.008, sagPath([xa, y, za], [xb, y, zb], 0.18, 10), 3);
  const dx = xb - xa, dz = zb - za, l = hyp(dx, dz), ux = dx / l, uz = dz / l, rugs = [[0.62, 0.14, 0.12], [0.75, 0.42, 0.15], [0.2, 0.25, 0.5], [0.55, 0.2, 0.3], [0.85, 0.75, 0.55]];
  for (let t = 0.2; t < 0.85; t += 0.32) {
    const w = R.range(0.8, 1.1), h = R.range(1.0, 1.4), x = xa + dx * t, z = za + dz * t, yy = y - Math.sin(t * Math.PI) * 0.18;
    M.color(R.pick(rugs));
    clothPiece(M, [x - ux * w / 2, yy - h, z - uz * w / 2], [x + ux * w / 2, yy - h, z + uz * w / 2], [x + ux * w / 2, yy, z + uz * w / 2], [x - ux * w / 2, yy, z - uz * w / 2], [uz, 0, -ux], { genre: 'lourd', grp: 'tapis' + xa + ',' + za });
  }
  M.restore();
}

/* Charrette à bras (bois, deux roues pleines sur un essieu), posée sur ses brancards ; collisions de la caisse et des roues, et une
   boîte basse sous les brancards (on l'enjambe d'un pas, on n'y bute plus). Brancards fixés sous la caisse et posés au sol par leur bout,
   barre de poussée entre eux (ils partaient du sol sous la caisse et remontaient vers l'avant) ; roues symétriques, avec moyeu */
PF.smCart = () => prefab('smCart', (M) => {
  M.color(SM.wood).local(1);
  M.boxB('wood', -0.7, 0.7, 0.55, 0.62, -1.0, 1.0, { bevel: 0.01 });
  for (const sx of [-1, 1]) M.boxB('wood', sx * 0.7 - 0.04, sx * 0.7 + 0.04, 0.62, 0.95, -1.0, 1.0);
  M.boxB('wood', -0.7, 0.7, 0.62, 0.95, 0.96, 1.0); M.boxB('wood', -0.7, 0.7, 0.62, 0.95, -1.0, -0.96);
  for (const sx of [-1, 1]) M.boxB('wood', sx * 0.45 - 0.05, sx * 0.45 + 0.05, 0.47, 0.55, -0.95, 1.0); // longerons sous la caisse
  const tilt = Math.asin(0.46 / 1.75);
  for (const sx of [-1, 1]) { M.save().move(sx * 0.45, 0.51, 0.95).rotX(tilt); M.boxB('wood', -0.04, 0.04, -0.04, 0.04, 0, 1.75); M.restore(); }
  M.save().move(0.49, 0.51 - Math.sin(tilt) * 1.55, 0.95 + Math.cos(tilt) * 1.55).rotZ(Math.PI / 2); M.cyl('wood', 0.03, 0.98, 8); M.restore(); // barre de poussée
  M.color([0.36, 0.28, 0.2]);
  for (const sx of [-1, 1]) { M.save().move(sx > 0 ? 0.85 : -0.77, 0.45, 0).rotZ(Math.PI / 2); M.cyl('wood', 0.45, 0.08, 16); M.restore(); }
  M.color([0.25, 0.22, 0.2]);
  M.save().move(0.93, 0.45, 0).rotZ(Math.PI / 2); M.cyl('steel', 0.035, 1.86, 8); M.restore(); // essieu et moyeux
  for (const sx of [-1, 1]) { M.save().move(sx > 0 ? 0.92 : -0.85, 0.45, 0).rotZ(Math.PI / 2); M.cyl('steel', 0.09, 0.07, 10); M.restore(); }
  M.col(-0.75, 0.75, 0, 0.95, -1.0, 1.0, 'wood');
  for (const sx of [-1, 1]) M.col(sx > 0 ? 0.75 : -0.93, sx > 0 ? 0.93 : -0.75, 0, 0.9, -0.42, 0.42, 'wood');
  M.col(-0.5, 0.5, 0, 0.3, 1.0, 2.62, 'wood');
});

/* ---------- Surfaces trouées (vitres de l'avion) ---------- */
/* Vitres (256 x 128) : à gauche, une vitre claire, poussiéreuse vers le bas (v = 0) et rayée ; à droite, la même fêlée en étoile autour d'un trou */
function smGlassTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'), R = rngOf(4747);
  for (const x0 of [0, 128]) {
    g.save(); g.beginPath(); g.rect(x0, 0, 128, 128); g.clip();
    g.fillStyle = 'rgba(206,220,228,0.14)'; g.fillRect(x0, 0, 128, 128);
    const gr = g.createLinearGradient(0, 0, 0, 70); gr.addColorStop(0, 'rgba(200,172,128,0.5)'); gr.addColorStop(1, 'rgba(200,172,128,0)'); g.fillStyle = gr; g.fillRect(x0, 0, 128, 70);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(205,180,140,${(0.15 + R() * 0.25).toFixed(2)})`; g.fillRect(x0 + R() * 128, R() * 128 * R(), 1 + R() * 1.5, 1 + R() * 1.5); }
    g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 0.7;
    for (let i = 0; i < 6; i++) { const x = x0 + R() * 128, y = R() * 128, a = R() * Math.PI, l = 10 + R() * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    g.restore();
  }
  // la fêlure : une auréole d'éclats, des fêlures en étoile, des arcs entre elles, un trou déchiqueté au point d'impact
  const ix = 198, iy = 74, rays = [];
  g.save(); g.beginPath(); g.rect(128, 0, 128, 128); g.clip();
  g.fillStyle = 'rgba(232,238,238,0.42)'; g.beginPath(); for (let k = 0; k <= 16; k++) { const a = (k / 16) * TAU, r = 24 + R() * 10; g.lineTo(ix + Math.cos(a) * r, iy + Math.sin(a) * r); } g.fill();
  g.strokeStyle = 'rgba(244,248,248,0.8)'; g.lineWidth = 1.1;
  for (let k = 0; k < 11; k++) { const a = (k / 11) * TAU + R() * 0.4; rays.push(a); let x = ix, y = iy; g.beginPath(); g.moveTo(x, y); for (let i = 0; i < 8; i++) { const b = a + (R() - 0.5) * 0.5; x += Math.cos(b) * 16; y += Math.sin(b) * 16; g.lineTo(x, y); } g.stroke(); }
  g.lineWidth = 0.8;
  for (const r of [34, 52, 74]) for (let k = 0; k < 11; k++) if (R() < 0.75) { const a = rays[k], b = rays[(k + 1) % 11], r2 = r + (R() - 0.5) * 8; g.beginPath(); g.moveTo(ix + Math.cos(a) * r, iy + Math.sin(a) * r); g.lineTo(ix + Math.cos(b) * r2, iy + Math.sin(b) * r2); g.stroke(); }
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath();
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU, r = (k % 2 ? 9 : 17) + R() * 7; g.lineTo(ix + Math.cos(a) * r, iy + Math.sin(a) * r); }
  g.fill(); g.restore();
  const t = canvasOnce(new THREE.CanvasTexture(c)); t.encoding = THREE.sRGBEncoding; t.flipY = false; t.anisotropy = 4; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
/* Rectangle arrondi : contour convexe dans le sens trigonométrique en (u, v), centre (cu, cv), demi-tailles (hu, hv), coins de rayons (ru, rv) */
function smRound(cu, cv, hu, hv, ru, rv, n = 4) {
  const pts = [];
  for (let k = 0; k < 4; k++) {
    const su = k === 0 || k === 3 ? 1 : -1, sv = k < 2 ? 1 : -1;
    for (let i = 0; i < n; i++) { const a = ((k + i / (n - 1)) * Math.PI) / 2; pts.push([cu + su * (hu - ru) + ru * Math.cos(a), cv + sv * (hv - rv) + rv * Math.sin(a)]); }
  }
  return { c: [cu, cv], pts };
}
/* Point (x, y) dans le polygone convexe q, bord compris */
function smConvexIn(q, x, y) {
  let pos = 0, neg = 0;
  for (let k = 0; k < q.length; k++) { const a = q[k], b = q[(k + 1) % q.length], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); if (c > 1e-12) pos++; else if (c < -1e-12) neg++; }
  return !(pos && neg);
}
/* Surface en grille : sommets f(u, v) aux valeurs us x vs (croissantes), normales par différences finies (o.pole aux pôles dégénérés, comme
   M.surf), coordonnées de texture o.uv(u, v) en mètres ; o.flip : face visible du côté -(du x dv). Deux façons d'y ouvrir des vitres :
   - o.holes : contours convexes { c, pts } (smRound), chacun au milieu d'une seule case, triangulée entre ses quatre coins et le contour
     (aucun sommet de plus sur ses bords : les cases voisines restent jointives) ;
   - o.snap(u, v) -> [u, v] | null pose un sommet proche du bord d'une ouverture sur ce bord, o.drop(u, v) retire le triangle dont c'est le
     centre : une grille assez fine épouse ainsi des vitres de forme quelconque, sans fente entre les cases. */
function smGrid(M, mat, us, vs, f, o = {}) {
  const nu = us.length, nv = vs.length, eu = (us[nu - 1] - us[0]) * 1e-4, ev = (vs[nv - 1] - vs[0]) * 1e-4, sg = o.flip ? -1 : 1;
  const c = f((us[0] + us[nu - 1]) / 2, (vs[0] + vs[nv - 1]) / 2), B = M.buf(mat, c[0], c[1], c[2]);
  const vert = (u, v) => {
    const a = f(u - eu, v), b = f(u + eu, v), a2 = f(u, v - ev), b2 = f(u, v + ev);
    const ax = b[0] - a[0], ay = b[1] - a[1], az = b[2] - a[2], bx = b2[0] - a2[0], by = b2[1] - a2[1], bz = b2[2] - a2[2];
    let nx = (ay * bz - az * by) * sg, ny = (az * bx - ax * bz) * sg, nz = (ax * by - ay * bx) * sg; const l = hyp3(nx, ny, nz);
    if (l < 1e-12) [nx, ny, nz] = o.pole ? o.pole(u, v) : [0, 1, 0]; else { nx /= l; ny /= l; nz /= l; }
    const p = f(u, v), t = o.uv ? o.uv(u, v) : [u, v]; // f en dernier : la teinte qu'il pose (M.tint) est celle du sommet
    return { id: M.v(B, p[0], p[1], p[2], nx, ny, nz, t[0], t[1]), u, v };
  };
  // triangle rendu s'il tourne dans le sens trigonométrique en (u, v) (fix : remis dans ce sens) ; dégénéré ou dans une ouverture, retiré
  const tri = (a, b, d, fix) => {
    let ar = (b.u - a.u) * (d.v - a.v) - (b.v - a.v) * (d.u - a.u);
    if (fix && ar < 0) { [b, d] = [d, b]; ar = -ar; }
    if (ar <= 1e-12 || (o.drop && o.drop((a.u + b.u + d.u) / 3, (a.v + b.v + d.v) / 3))) return;
    if (o.flip) M.tri(B, a.id, d.id, b.id); else M.tri(B, a.id, b.id, d.id);
  };
  const G = [];
  for (const v of vs) for (const u of us) { const q = (o.snap && o.snap(u, v)) || [u, v]; G.push(vert(q[0], q[1])); }
  for (let j = 0; j < nv - 1; j++) for (let i = 0; i < nu - 1; i++) {
    const k = j * nu + i, O = [G[k], G[k + 1], G[k + nu + 1], G[k + nu]];
    const h = o.holes && o.holes.find((q) => q.c[0] > us[i] && q.c[0] < us[i + 1] && q.c[1] > vs[j] && q.c[1] < vs[j + 1]);
    if (!h) { tri(O[0], O[1], O[2]); tri(O[0], O[2], O[3]); continue; }
    // couronne entre la case et le trou : on tourne autour du centre en avançant sur celui des deux bords dont le sommet suivant vient d'abord
    const I = h.pts.map((p) => vert(p[0], p[1])), a0 = Math.atan2(O[0].v - h.c[1], O[0].u - h.c[0]);
    const at = (q) => { let a = Math.atan2(q.v - h.c[1], q.u - h.c[0]) - a0; while (a < 0) a += TAU; while (a >= TAU) a -= TAU; return a; };
    let s0 = 0; for (let m = 1; m < I.length; m++) if (at(I[m]) < at(I[s0])) s0 = m;
    const In = I.map((_, m) => I[(s0 + m) % I.length]), nI = In.length, aO = (m) => (m < 4 ? at(O[m]) : TAU), aI = (m) => (m < nI ? at(In[m]) : TAU + at(In[0]));
    let p = 0, q = 0;
    while (p < 4 || q < nI) {
      if (p < 4 && (q >= nI || aO(p + 1) <= aI(q + 1))) { tri(O[p], O[(p + 1) % 4], In[q % nI], true); p++; }
      else { tri(O[p % 4], In[q], In[(q + 1) % nI], true); q++; }
    }
  }
}
/* Éventail plan (centre c, contour pts) de normale n ; uv facultatif : [centre, puis chaque point du contour] */
function smFan(M, mat, c, pts, n, uv) {
  const B = M.buf(mat, c[0], c[1], c[2]), vt = (p, k) => M.v(B, p[0], p[1], p[2], n[0], n[1], n[2], uv ? uv[k][0] : 0, uv ? uv[k][1] : 0);
  const ic = vt(c, 0), ids = pts.map((p, k) => vt(p, k + 1)), a = pts[0], b = pts[1];
  const cr = [(a[1] - c[1]) * (b[2] - c[2]) - (a[2] - c[2]) * (b[1] - c[1]), (a[2] - c[2]) * (b[0] - c[0]) - (a[0] - c[0]) * (b[2] - c[2]), (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0])];
  const ok = cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] > 0;
  for (let k = 0; k < ids.length; k++) { const i = ids[k], j = ids[(k + 1) % ids.length]; if (ok) M.tri(B, ic, i, j); else M.tri(B, ic, j, i); }
}

/* ---------- L'épave de l'avion de ligne ---------- */
/* Biréacteur moyen-courrier à aile basse (fuselage de 4 m de diamètre), posé sur le ventre dans la sebkha et cassé en deux, le long de x (le nez
   vers +x). (cx, y0) : la cassure, le sable sous le fuselage ; axe du fuselage en z = zc (0,5 m à Simoun : l'allée de la cabine passe sur une
   rangée de centres de case, où marchent les bots). Fuselage de 2 m de rayon enfoncé d'un mètre, plancher à y0 + 0,25 (on y entre de
   plain-pied) ; les portes et les issues font 1,2 m, centrées sur un centre de case.
   - Tronçon avant (de cx + 2,2 à cx + 14,4) : la cabine, sièges 3 + 3 (PF.smSeats3) de part et d'autre d'une allée de 1,2 m, coffres à bagages
     et leur liseré bleu, plafond et rampes de lumière, hublots ouverts (vitre transparente, fêlée ou absente, volet), rideau ; portes avant
     ouvertes des deux côtés (on traverse), cloison et poste de pilotage, nez au profil d'avion de ligne et son pare-brise à six vitres
     transparentes (une absente, deux fêlées).
   - Tronçon arrière (de cx - 12 à cx) : de la cassure à une cloison (cx - 7), des sièges renversés, des bagages, les issues d'aile ouvertes ;
     au-delà, le fuselage est plein du sable d'une dune qui monte sur son flanc : par elle on gagne le toit (praticable, des marches de
     collision suivent la courbe). La queue relevée, la dérive bleue à bandes claires, les empennages.
   - Ailes basses en flèche, le dessus praticable, winglets bleus ; les deux réacteurs arrachés, couchés dans le sable devant les ailes.
   Livrée sans nom ni marque : fuselage blanc, ventre arrière et dérive bleus. Rend { top } */
function smPlane(cx, y0, R, zc = 0) {
  const M = DECOR, Rf = 2.0, Ri = Rf - 0.07, cy = y0 + 1.0, top = cy + Rf, yf = cy - 0.75, N = makeNoise(3131), Z = (dz) => zc + dz;
  const white = [0.83, 0.84, 0.85], blue = [0.12, 0.22, 0.56], dirt = [0.78, 0.7, 0.6], insul = [0.5, 0.54, 0.46];
  const XF0 = cx + 2.2, XF1 = cx + 14.4, XR0 = cx - 12, XR1 = cx, RB = cx - 7, P = (x, r, th) => [x, cy + r * Math.sin(th), Z(r * Math.cos(th))];
  const jag = (th, s) => (N.fbm(Math.sin(th) * 1.5 + 2.3 + s, Math.abs(Math.cos(th)) * 1.5 + 0.7, 8, 8, 2) - 0.5) * 1.4;
  // ouvertures : portes avant, issues d'aile ; de 1,2 m centrées sur un centre de case, seuil au plancher, 1,95 m de haut
  const thA = Math.asin((yf - 0.05 - cy) / Rf), thB = Math.asin((yf + 1.95 - cy) / Rf), OPEN = [cx + 13.5, cx - 5.5].map((x) => [x - 0.6, x + 0.6]);
  // livrée : blanc, sali de sable au ras du sol, ventre bleu sur l'arrière (une bande qui remonte vers la queue)
  // vieillie au désert : plaques ternies par le sable, coulées sombres sous les hublots et les joints, poussière qui monte du ventre
  const liv = (x, y) => {
    const b = x < cx - 2 ? smoothstep(0.1, -0.1, y - (cy - 0.45 + (cx - 2 - x) * 0.17)) : 0, d = 1 - smoothstep(y0 - 0.1, y0 + 1.2, y);
    const n = N.fbm(x * 0.21 + 3.1, y * 0.35 + 1.7, 64, 64, 3), st = smoothstep(0.56, 0.8, N.fbm(x * 0.45 + 9.3, y * 0.05 + 0.4, 64, 64, 2)) * smoothstep(cy + 1.7, cy - 0.5, y);
    const dd = Math.max(d * 0.7, (1 - smoothstep(y0 + 0.3, cy + 0.7, y)) * 0.32);
    return [0, 1, 2].map((k) => sl(lerp(lerp(white[k], blue[k], b), dirt[k], dd) * (0.84 + n * 0.24) * (1 - st * 0.36)));
  };
  // hublots, au droit des rangées de sièges, vitre (claire ou fêlée) et volet tirés au sort ; près des cassures, plus de casse. Jamais de hublot
  // sans vitre : on verrait au travers de la coque qui arrête les balles (fentes.js).
  // Derrière la cloison du tronçon arrière, le fuselage est plein de sable : la vitre y reste, opaque, couleur de sable
  const winTh = Math.asin((yf + 1.25 - cy) / Rf), inOpen = (x, m = 0.25) => OPEN.some((o) => x > o[0] - m && x < o[1] + m), WINS = [];
  for (const x0 of [XF0 + 1.2, XR0 + 1.0]) for (let x = x0; x <= (x0 > cx ? cx + 11.7 : XR1 - 0.6); x += 0.82) for (const s of [1, -1]) {
    if (inOpen(x)) continue;
    const open = (x > XF0 && x < XF1) || (x > RB + 0.25 && x < XR1), near = Math.min(Math.abs(x - XF0), Math.abs(x - XR1)) < 2.6, r = R();
    WINS.push({ x, s, th: s > 0 ? winTh : Math.PI - winTh, open, glass: !open ? 'sand' : r < (near ? 0.7 : 0.25) ? 'crack' : 'ok', shade: R() });
  }
  // ouverture d'un hublot [demi-largeur, demi-hauteur en angle, rayon des coins] : dans la peau et l'isolant (HO), plus grande dans le revêtement
  // de la cabine (HL : le tableau s'évase vers l'intérieur)
  const HO = [0.115, 0.165 / Rf, 0.085], HL = [0.155, 0.215 / 1.84, 0.1], hole = (w, r, H) => smRound(w.x, w.th, H[0], H[1], H[2], H[2] / r);
  // colonnes d'un morceau [a, b] : une case de 0,82 m par hublot ouvert (le hublot au milieu), ailleurs au plus tous les `step` m
  const cols = (a, b, ws, step) => {
    const xs = [a, b, ...ws.flatMap((w) => [w.x - 0.41, w.x + 0.41])].map((x) => clamp(x, a, b)).sort((p, q) => p - q), us = [a];
    for (const q of xs) { const p = us[us.length - 1]; if (q - p < 0.02) continue; const n = ws.some((w) => Math.abs((p + q) / 2 - w.x) < 0.3) ? 1 : Math.max(1, Math.round((q - p) / step)); for (let m = 1; m <= n; m++) us.push(p + ((q - p) * m) / n); }
    return us;
  };
  // rangées de la coque (tous les 0,12 rad au plus), communes à tous les morceaux ; la bande des hublots tient dans une seule rangée
  const ROWS = (() => {
    const k = [-Math.PI / 2, 1.5 * Math.PI, thA, thB, Math.PI - thB, Math.PI - thA, winTh - 0.12, winTh + 0.12, Math.PI - winTh - 0.12, Math.PI - winTh + 0.12].sort((p, q) => p - q), out = [k[0]];
    for (let i = 1; i < k.length; i++) { const p = k[i - 1], q = k[i], band = Math.abs((p + q) / 2 - winTh) < 1e-6 || Math.abs((p + q) / 2 - Math.PI + winTh) < 1e-6, n = band ? 1 : Math.max(1, Math.ceil((q - p) / 0.12)); for (let m = 1; m <= n; m++) out.push(p + ((q - p) * m) / n); }
    return out;
  })();
  // coque d'un morceau [a, b], des rangées t0 à t1 : peau (livrée) et doublure (isolant), trouées aux hublots ouverts ; aux cassures (ja, jb),
  // la case du bout se plie sur le bord déchiqueté
  const hull = (a, b, ja, jb, t0, t1) => {
    const ws = WINS.filter((w) => w.open && w.x > a && w.x < b), us = cols(a, b, ws, 0.6), vs = ROWS.filter((t) => t > t0 - 1e-9 && t < t1 + 1e-9), n = us.length;
    const X = (x, th) => x + (ja ? jag(th, 0) * Math.max(0, 1 - (x - us[0]) / (us[1] - us[0])) : 0) + (jb ? jag(th, 5) * Math.max(0, 1 - (us[n - 1] - x) / (us[n - 1] - us[n - 2])) : 0);
    const holes = ws.filter((w) => w.th > t0 && w.th < t1).map((w) => hole(w, Rf, HO));
    for (const [r, inner] of [[Rf, false], [Ri, true]]) {
      M.save().local(1); M.cls = 0; M.color(insul);
      smGrid(M, 'hull', us, vs, (x, th) => { const p = P(X(x, th), r, th); if (!inner) M.tint = liv(p[0], p[1]); return p; }, { flip: inner, uv: (x, th) => [x, th * r], holes });
      M.restore();
    }
  };
  // un tronçon : la coque découpée autour des ouvertures (les deux côtés à la fois)
  const tube = (x0, x1, j0, j1) => {
    const cuts = [x0, x1, ...OPEN.flat().filter((x) => x > x0 && x < x1)].sort((a, b) => a - b);
    for (let i = 0; i < cuts.length - 1; i++) {
      const a = cuts[i], b = cuts[i + 1], open = OPEN.some((o) => a >= o[0] - 1e-6 && b <= o[1] + 1e-6), ja = j0 && a === x0, jb = j1 && b === x1;
      if (!open) { hull(a, b, ja, jb, -Math.PI / 2, 1.5 * Math.PI); continue; }
      hull(a, b, ja, jb, -Math.PI / 2, thA); hull(a, b, ja, jb, thB, Math.PI - thB); hull(a, b, ja, jb, Math.PI - thA, 1.5 * Math.PI);
    }
  };
  tube(XR0, XR1, false, true); tube(XF0, XF1, true, false);
  // les hublots : tableau (de la peau à l'isolant, puis évasé jusqu'au revêtement de la cabine), vitre, volet à hauteur variable
  const ring = (w, H, rH, r) => hole(w, rH, H).pts.map(([x, t]) => P(x, r, t));
  M.save().local(1);
  for (const w of WINS) {
    const out = [0, Math.sin(w.th), Math.cos(w.th)], cen = (r) => P(w.x, r, w.th);
    if (!w.open) { M.cls = 1; M.color([0.58, 0.47, 0.34]); smFan(M, 'glass', cen(Rf + 0.004), ring(w, HO, Rf, Rf + 0.004), out); continue; }
    const A0 = ring(w, HO, Rf, Rf), A1 = ring(w, HO, Rf, Ri), A2 = ring(w, HL, 1.84, 1.84);
    for (const [S0, S1, col] of [[A0, A1, [0.66, 0.68, 0.7]], [A1, A2, [0.86, 0.86, 0.84]]]) {
      M.cls = 1; M.color(col);
      for (let k = 0; k < S0.length; k++) {
        const k1 = (k + 1) % S0.length, m = [0, 1, 2].map((i) => (S0[k][i] + S0[k1][i] + S1[k][i] + S1[k1][i]) / 4), c = cen(hyp(m[1] - cy, m[2] - Z(0)));
        M.quad('cabin', S0[k], S0[k1], S1[k1], S1[k], [c[0] - m[0], c[1] - m[1], c[2] - m[2]]);
      }
    }
    if (w.glass !== 'none') {
      const pts = hole(w, Rf, HO).pts, tile = w.glass === 'crack' ? 0.5 : 0, uv = (x, t) => [tile + (0.5 * (x - w.x + HO[0])) / (2 * HO[0]), 0.5 + (w.s * (t - w.th)) / (2 * HO[1])];
      M.cls = 1; M.color([0.82, 0.88, 0.9]);
      smFan(M, 'glassAir', cen(Rf - 0.03), pts.map(([x, t]) => P(x, Rf - 0.03, t)), out, [uv(w.x, w.th), ...pts.map(([x, t]) => uv(x, t))]);
    }
    const f = w.shade < 0.4 ? 0 : w.shade < 0.75 ? 0.5 : 0.96; // volet levé, à demi baissé, fermé
    if (f) {
      const t0 = w.th + w.s * 0.125, t1 = t0 - w.s * 0.25 * f, q = [P(w.x - 0.15, 1.87, t0), P(w.x + 0.15, 1.87, t0), P(w.x + 0.15, 1.87, t1), P(w.x - 0.15, 1.87, t1)];
      M.cls = 1; M.color([0.9, 0.9, 0.88]); M.quad('cabin', ...q, out.map((v) => -v)); M.quad('cabin', ...q, out);
    }
  }
  M.restore();
  // cabine : plancher, moquette de l'allée, doublure blanche des parois, coffres à bagages, plafond et ses rampes, cloisons
  const thLo = Math.asin((yf + 0.04 - cy) / 1.84), thHi = Math.asin((yf + 1.56 - cy) / 1.84);
  for (const [a, b] of [[RB, XR1], [XF0, XF1 - 0.12]]) {
    M.save().local(1); M.cls = 1; // l'intérieur ne porte pas d'ombre au soleil (la coque s'en charge)
    M.color([0.24, 0.25, 0.27]); M.boxB('cabin', a, b, yf - 0.12, yf, Z(-1.8), Z(1.8), { skip: 'y' });
    M.color([0.16, 0.19, 0.32]); M.boxB('canvas', a + 0.3, b - 0.1, yf, yf + 0.008, Z(-0.5), Z(0.5), { skip: 'y' });
    DECOR.col(a, b, yf - 0.5, yf, Z(-1.9), Z(1.9), 'metal');
    // doublure, coupée aux ouvertures
    const segs = [[a, b]]; for (const o of OPEN) for (let i = segs.length - 1; i >= 0; i--) { const sg = segs[i]; if (o[1] <= sg[0] || o[0] >= sg[1]) continue; segs.splice(i, 1, ...[[sg[0], o[0]], [o[1], sg[1]]].filter((p) => p[1] - p[0] > 0.05)); }
    M.color([0.9, 0.9, 0.88]);
    const seg = (p, q) => { const n = Math.max(1, Math.ceil((q - p) / 0.13)); return Array.from({ length: n }, (_, k) => lerp(p, q, (k + 1) / n)); };
    for (const [s0, s1] of segs) for (const s of [1, -1]) {
      const c = s > 0 ? winTh : Math.PI - winTh, t0 = s > 0 ? thLo : Math.PI - thHi, t1 = s > 0 ? thHi : Math.PI - thLo, ws = WINS.filter((w) => w.open && w.s === s && w.x > s0 && w.x < s1);
      smGrid(M, 'cabin', cols(s0, s1, ws, 0.8), [t0, ...seg(t0, c - 0.15), c + 0.15, ...seg(c + 0.15, t1)], (x, t) => P(x, 1.84, t), { flip: true, uv: (x, t) => [x, t * 1.84], holes: ws.map((w) => hole(w, 1.84, HL)) });
    }
    // coffres : dessous, face bombée, liseré bleu dessous le long du bord, poignées ; pas au-dessus des portes
    const bins = []; for (const [s0, s1] of segs) { const c0 = s0 + 0.15, c1 = s1 - 0.15; if (c1 - c0 > 0.6) bins.push([c0, c1]); }
    for (const [b0, b1] of bins) for (const s of [1, -1]) {
      const zz = (d) => Z(s * d), A = [1.08, yf + 1.55], Bm = [1.0, yf + 1.8], C = [1.04, yf + 2.05], D = [1.45, yf + 2.05], E = [1.72, yf + 1.55], pt = (x, p) => [x, p[1], zz(p[0])];
      M.color([0.93, 0.93, 0.92]);
      M.quad('cabin', pt(b0, A), pt(b1, A), pt(b1, E), pt(b0, E), [0, -1, 0]);
      M.quad('cabin', pt(b0, A), pt(b1, A), pt(b1, Bm), pt(b0, Bm), [0, -0.3, -s]);
      M.quad('cabin', pt(b0, Bm), pt(b1, Bm), pt(b1, C), pt(b0, C), [0, 0.15, -s]);
      M.quad('cabin', pt(b0, C), pt(b1, C), pt(b1, [1.04, yf + 2.2]), pt(b0, [1.04, yf + 2.2]), [0, 0, -s]);
      for (const xe of [b0, b1]) { const n = [xe === b0 ? -1 : 1, 0, 0]; M.quad('cabin', pt(xe, A), pt(xe, Bm), pt(xe, C), pt(xe, D), n); M.tri3('cabin', pt(xe, A), pt(xe, D), pt(xe, E), n); }
      M.color([0.35, 0.72, 1.0]); M.quad('lampOff', [b0, yf + 1.544, zz(1.09)], [b1, yf + 1.544, zz(1.09)], [b1, yf + 1.544, zz(1.16)], [b0, yf + 1.544, zz(1.16)], [0, -1, 0]);
      { const t0 = Math.asin((yf + 1.47 - cy) / 1.828), t1 = Math.asin((yf + 1.53 - cy) / 1.828), w = (x, t) => P(x, 1.828, s > 0 ? t : Math.PI - t); M.quad('lampOff', w(b0, t0), w(b1, t0), w(b1, t1), w(b0, t1), [0, 0, -s]); } // la lumière bleue sous les coffres
      M.color([0.62, 0.63, 0.64]); M.quad('cabin', [b0, yf + 1.546, zz(1.075)], [b1, yf + 1.546, zz(1.075)], [b1, yf + 1.546, zz(1.09)], [b0, yf + 1.546, zz(1.09)], [0, -1, 0]);
      M.color([0.55, 0.56, 0.57]);
      for (let x = b0 + 0.82; x < b1 - 0.1; x += 1.64) M.quad('cabin', [x - 0.008, yf + 1.555, zz(1.072)], [x + 0.008, yf + 1.555, zz(1.072)], [x + 0.008, yf + 1.79, zz(0.997)], [x - 0.008, yf + 1.79, zz(0.997)], [0, -0.3, -s]);
      M.color([0.42, 0.43, 0.45]);
      for (let x = b0 + 0.41; x < b1 - 0.1; x += 0.82) M.boxB('cabin', x - 0.08, x + 0.08, yf + 1.78, yf + 1.82, zz(0.985) - 0.02, zz(0.985) + 0.02);
      // panneaux de service sous les coffres, au-dessus de chaque rangée : liseuses et bouches d'air
      for (let x = b0 + 0.25; x < b1 - 0.4; x += 0.82) {
        M.color([0.78, 0.79, 0.8]); M.quad('cabin', [x, yf + 1.543, zz(1.2)], [x + 0.36, yf + 1.543, zz(1.2)], [x + 0.36, yf + 1.543, zz(1.5)], [x, yf + 1.543, zz(1.5)], [0, -1, 0]);
        M.color([1, 0.96, 0.85]); for (const d of [1.26, 1.36, 1.46]) M.quad('lampOff', [x + 0.08, yf + 1.539, zz(d - 0.025)], [x + 0.13, yf + 1.539, zz(d - 0.025)], [x + 0.13, yf + 1.539, zz(d + 0.025)], [x + 0.08, yf + 1.539, zz(d + 0.025)], [0, -1, 0]);
      }
    }
    // plafond et rampe de lumière au milieu
    M.color([0.95, 0.95, 0.94]); M.quad('cabin', [a, yf + 2.2, Z(-1.04)], [b, yf + 2.2, Z(-1.04)], [b, yf + 2.2, Z(1.04)], [a, yf + 2.2, Z(1.04)], [0, -1, 0]);
    M.color([1, 0.97, 0.9]);
    for (let x = a + 0.4; x < b - 0.9; x += 1.64) M.quad('lampOff', [x, yf + 2.192, Z(-0.14)], [x + 1.3, yf + 2.192, Z(-0.14)], [x + 1.3, yf + 2.192, Z(0.14)], [x, yf + 2.192, Z(0.14)], [0, -1, 0]);
    M.restore();
  }
  // cloisons : celle du poste de pilotage (porte fermée), celle du fond du tronçon arrière (derrière, la queue est pleine de sable) ; la
  // sortie de secours en vert au-dessus des portes
  const bulk = (x, nx, door) => {
    M.save().local(1); M.cls = 1; M.color([0.88, 0.88, 0.86]);
    M.surf('cabin', 1, 24, (u, v) => P(x, u * Ri, v * TAU), { uL: Ri, vL: TAU * Ri, flipN: nx > 0 });
    M.color([0.42, 0.44, 0.48]); M.quad('cabin', [x + nx * 0.01, yf, Z(-0.42)], [x + nx * 0.01, yf, Z(0.42)], [x + nx * 0.01, yf + 1.92, Z(0.42)], [x + nx * 0.01, yf + 1.92, Z(-0.42)], [nx, 0, 0]);
    if (door) { M.color([0.12, 0.13, 0.15]); M.quad('cabin', [x + nx * 0.016, yf + 1.4, Z(-0.08)], [x + nx * 0.016, yf + 1.4, Z(0.08)], [x + nx * 0.016, yf + 1.58, Z(0.08)], [x + nx * 0.016, yf + 1.58, Z(-0.08)], [nx, 0, 0]); }
    M.color([0.1, 0.72, 0.32]); M.boxB('lampOff', x + nx * 0.02 - 0.015, x + nx * 0.02 + 0.015, yf + 2.0, yf + 2.13, Z(-0.2), Z(0.2));
    M.restore();
    DECOR.col(Math.min(x, x - nx * 0.15), Math.max(x, x - nx * 0.15), yf, top - 0.75, Z(-1.9), Z(1.9), 'metal');
  };
  bulk(XF1 - 0.12, -1, true); bulk(RB, 1, false);
  for (const [a, b] of OPEN) { M.save().local(1); M.color([0.1, 0.72, 0.32]); M.boxB('lampOff', (a + b) / 2 - 0.18, (a + b) / 2 + 0.18, yf + 2.06, yf + 2.17, Z(0.98), Z(1.0)); M.boxB('lampOff', (a + b) / 2 - 0.18, (a + b) / 2 + 0.18, yf + 2.06, yf + 2.17, Z(-1.0), Z(-0.98)); M.restore(); }
  // sièges 3 + 3 de la cabine avant (11 rangées) ; à l'arrière, un bloc resté en place, deux renversés, des bagages vers la cassure
  // (détails fins : masqués au loin, on ne les voit que de près, par les portes et la cassure)
  for (let x = XF0 + 1.2; x <= cx + 11.7; x += 0.82) for (const s of [1, -1]) M.place(PF.smSeats3(), x, yf, Z(s * 1.19), 0, { cls: 2 });
  M.place(PF.smSeats3(), RB + 0.4, yf, Z(1.19), 0, { cls: 2 });
  for (const [x, dz, ry, rz] of [[cx - 3.4, 0.75, 0.25, Math.PI / 2], [cx - 1.6, -0.6, -0.2, -Math.PI / 2]]) { M.save().move(x, yf + 0.6, Z(dz)).rotY(ry).rotX(rz); M.put(PF.smSeats3(), { cls: 2 }); M.restore(); }
  M.save().move(cx + 1.0, smY(cx + 1.0, Z(3.6), 0.8) + 0.42, Z(3.6)).rotY(2.2).rotZ(Math.PI / 2); M.put(PF.smSeats3()); M.restore();
  const bags = [[cx - 4.6, -0.9, 0.3], [cx - 3.0, -0.2, 2.1], [cx - 1.0, 1.2, 0.9], [cx + 2.6, 1.0, 1.4], [cx + 0.8, -2.6, 0.2], [cx + 1.6, 2.2, 2.6], [cx - 1.0, -3.4, 1.1]];
  bags.forEach(([x, dz, ry], i) => {
    const inside = Math.abs(dz) < 1.8 && (x > RB && x < XR1 || x > XF0 && x < XF1), y = inside ? yf : smY(x, Z(dz), 0.4) + 0.02;
    M.save().local(1).move(x, y, Z(dz)).rotY(ry); M.color([[0.12, 0.16, 0.3], [0.5, 0.12, 0.1], [0.24, 0.25, 0.27], [0.36, 0.38, 0.28]][i % 4]);
    M.boxB('cabin', -0.34, 0.34, 0, 0.24, -0.23, 0.23, { bevel: 0.04 }); M.color([0.15, 0.15, 0.16]); M.boxB('rubber', -0.1, 0.1, 0.24, 0.27, -0.02, 0.02);
    M.col(-0.34, 0.34, 0, 0.24, -0.23, 0.23, 'wood'); M.restore();
  });
  // rideau tiré au bord de l'allée, sur sa tringle
  M.save().local(1); M.cls = 1; M.color([0.12, 0.15, 0.26]);
  for (let i = 0; i < 8; i++) { const x0 = cx + 6.98 + i * 0.025, z0 = Z(-0.56 - (i % 2) * 0.04), z1 = Z(-0.56 - ((i + 1) % 2) * 0.04); M.quad('canvas', [x0, yf + 0.06, z0], [x0 + 0.025, yf + 0.06, z1], [x0 + 0.025, yf + 2.16, z1], [x0, yf + 2.16, z0], [0, 0, -1]); }
  M.color([0.6, 0.6, 0.62]); M.boxB('steel', cx + 6.96, cx + 7.2, yf + 2.16, yf + 2.19, Z(-1.0), Z(-0.55));
  M.restore();
  // portes ouvertes, rabattues vers l'avant le long du fuselage ; câbles qui pendent à la cassure
  M.save().local(1); M.cls = 1;
  for (const [, b] of [OPEN[0]]) for (const s of [1, -1]) {
    M.color(white); M.boxB('hull', b + 0.15, b + 1.05, yf - 0.02, yf + 1.92, Z(s * 2.32) - 0.06, Z(s * 2.32) + 0.06, { bevel: 0.03 }); DECOR.col(b + 0.15, b + 1.05, yf - 0.02, yf + 1.92, Z(s * 2.32) - 0.06, Z(s * 2.32) + 0.06, 'metal');
    M.color([0.6, 0.62, 0.62]); M.boxB('steel', b + 0.05, b + 0.2, yf + 0.9, yf + 1.0, Z(s * 2.05), Z(s * 2.27));
  }
  M.color([0.16, 0.16, 0.17]);
  for (const [x, sx] of [[XR1, 1], [XF0, -1]]) for (const dz of [-0.7, 0.2, 0.9]) M.tube('rubber', 0.012, [[x - sx * 0.1, yf + 2.15, Z(dz)], [x + sx * 0.25, yf + 1.5, Z(dz + 0.1)], [x + sx * 0.35, yf + 0.9, Z(dz + 0.05)]], 4);
  M.restore();
  // collisions de la carlingue : parois (ouvertes aux portes), toit en marches qui suivent la courbe (praticable)
  for (const [a, b] of [[XR0, XR1], [XF0, XF1]]) {
    for (const s of [-1, 1]) {
      const z0 = Z(s > 0 ? 1.85 : -2.1), z1 = Z(s > 0 ? 2.1 : -1.85), cuts = [a, b, ...OPEN.flat().filter((x) => x > a && x < b)].sort((p, q) => p - q);
      for (let i = 0; i < cuts.length - 1; i++) { const p = cuts[i], q = cuts[i + 1], open = OPEN.some((o) => p >= o[0] - 1e-6 && q <= o[1] + 1e-6); DECOR.col(p, q, open ? yf + 1.95 : yf, cy + 1.25, z0, z1, 'metal'); }
    }
    for (const [d0, d1, h] of [[0, 0.75, top - 0.05], [0.75, 1.3, cy + Math.sqrt(Rf * Rf - 1)], [1.3, 1.75, cy + Math.sqrt(Rf * Rf - 2.25)]]) {
      if (d0 === 0) DECOR.col(a, b, cy + 1.25, h, Z(-d1), Z(d1), 'metal');
      else for (const s of [-1, 1]) DECOR.col(a, b, cy + 1.25, h, Math.min(Z(s * d0), Z(s * d1)), Math.max(Z(s * d0), Z(s * d1)), 'metal');
    }
  }
  // nez : profil d'avion de ligne. Le radôme pointe sous l'axe, le dessus descend par le pare-brise, le menton remonte ; sections en ellipse.
  // d : distance à la pointe ; table [d, dessus, dessous, demi-largeur] (par rapport à l'axe), lue en √d pour arrondir la pointe (keyM, 06d-reload.js)
  const NL = 5.2, NK = [[0, -0.5, -0.5, 0], [0.25, -0.12, -0.85, 0.42], [0.6, 0.2, -1.1, 0.72], [1, 0.45, -1.3, 0.98], [1.4, 0.72, -1.47, 1.2],
    [1.8, 1.05, -1.62, 1.42], [2.2, 1.38, -1.73, 1.6], [2.6, 1.62, -1.82, 1.74], [3, 1.78, -1.88, 1.85], [3.5, 1.9, -1.94, 1.93], [4.2, 1.97, -1.98, 1.98],
    [5.2, Rf, -Rf, Rf]].map((k) => [Math.sqrt(k[0]), k[1], k[2], k[3]]);
  const sec = (d) => { const k = keyM(NK, Math.sqrt(Math.max(0, d))); return { yc: cy + (k[0] + k[1]) / 2, ry: (k[0] - k[1]) / 2, rz: k[2] }; };
  const NP = (d, th, dr = 0) => { const s = sec(d); return [XF1 + NL - d, s.yc + (s.ry + dr) * Math.sin(th), Z((s.rz + dr) * Math.cos(th))]; };
  // vitres du poste : le pare-brise en deux, puis la vitre coulissante et la vitre arrière de chaque côté. Un coin est [d, angle depuis le
  // dessus] ; Wp le prend vu de côté (d, hauteur sur l'axe), les bords des vitres voisines suivent le même montant (de 13 cm) décalé de g
  const Wp = (d, y) => { const s = sec(d); return [d, Math.PI / 2 - Math.asin(clamp((cy + y - s.yc) / s.ry, -1, 1))]; }, g = 0.045;
  const A = Wp(1.7, 0.55), B = Wp(2.45, 1.2), C = Wp(2.95, 0.55), D = Wp(2.95, 1.28), sh = (p, dd, da) => [p[0] + dd, p[1] + da];
  const PANES = [[[1.45, g], sh(A, 0, -g), sh(B, 0, -g), [2.13, g]], [sh(A, 0, g), sh(C, -0.065, 0), sh(D, -0.065, 0), sh(B, 0, g)], [sh(C, 0.065, 0), Wp(3.55, 0.6), Wp(3.4, 1.16), sh(D, 0.065, 0)]];
  const onNose = (q, s, dr) => (u, v) => { const lo = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)], hi = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)]; return NP(lerp(lo[0], hi[0], v), Math.PI / 2 - s * lerp(lo[1], hi[1], v), dr); };
  const inward = (f) => { // vrai si la normale de f (du x dv) rentre dans la coque
    const p = f(0.5, 0.5), a = f(0.6, 0.5), b = f(0.5, 0.6), c = sec(XF1 + NL - p[0]), u = [a[0] - p[0], a[1] - p[1], a[2] - p[2]], v = [b[0] - p[0], b[1] - p[1], b[2] - p[2]];
    return (u[2] * v[0] - u[0] * v[2]) * (p[1] - c.yc) + (u[0] * v[1] - u[1] * v[0]) * (p[2] - Z(0)) < 0;
  };
  // coque du nez et doublure du poste : grille de 9 cm autour des vitres ; un sommet à moins de 6,6 cm du bord d'une vitre s'y pose, un
  // triangle dont le centre est dans une vitre tombe. PN : les six vitres en (d, angle signé depuis le dessus, + côté +z), distances avec
  // l'angle x 1,5 (le rayon moyen du poste)
  const PN = [1, -1].flatMap((s) => PANES.map((q) => q.map(([d, a]) => [d, s * a]))), KF = 1.5, thr = 0.066;
  const nSnap = (d, th) => {
    const a = Math.PI / 2 - th; if (d < 1.2 || d > 3.9 || Math.abs(a) > 1.4) return null;
    let best = thr, out = null;
    for (const q of PN) for (const c of q) { const e = hyp(d - c[0], (a - c[1]) * KF); if (e < best) { best = e; out = c; } }
    if (!out) for (const q of PN) for (let k = 0; k < 4; k++) {
      const p = q[k], r = q[(k + 1) % 4], ex = r[0] - p[0], ey = (r[1] - p[1]) * KF, t = clamp(((d - p[0]) * ex + (a - p[1]) * KF * ey) / (ex * ex + ey * ey), 0, 1);
      const x = p[0] + ex * t, y = p[1] + (r[1] - p[1]) * t, e = hyp(d - x, (a - y) * KF);
      if (e < best) { best = e; out = [x, y]; }
    }
    return out && [out[0], Math.PI / 2 - out[1]];
  };
  const nDrop = (d, th) => PN.some((q) => smConvexIn(q, d, Math.PI / 2 - th)), NU = [], NV = [], T0 = Math.PI / 2 - 1.35, T1 = Math.PI / 2 + 1.35;
  for (let k = 0; k <= 7; k++) NU.push(1.3 * (k / 7) ** 2);
  for (let k = 1; k <= 29; k++) NU.push(1.3 + (2.55 * k) / 29);
  for (let k = 1; k <= 5; k++) NU.push(3.85 + ((NL - 3.85) * k) / 5);
  for (let k = 0; k < 9; k++) NV.push(-Math.PI / 2 + ((T0 + Math.PI / 2) * k) / 9);
  for (let k = 0; k < 45; k++) NV.push(T0 + ((T1 - T0) * k) / 45);
  for (let k = 0; k <= 9; k++) NV.push(T1 + ((1.5 * Math.PI - T1) * k) / 9);
  M.save().local(1); M.cls = 0;
  smGrid(M, 'hull', NU, NV, (d, th) => { const p = NP(d, th); M.tint = liv(p[0], p[1]); return p; }, { flip: true, snap: nSnap, drop: nDrop, uv: (d, th) => [NL - d, (th + Math.PI / 2) * Rf], pole: () => [0.98, -0.2, 0] });
  M.cls = 1; M.color([0.42, 0.45, 0.48]);
  smGrid(M, 'cabin', NU.filter((d) => d > 0.9), NV.filter((th) => th > -0.8 && th < Math.PI + 0.8), (d, th) => NP(d, th, -0.05), { snap: nSnap, drop: nDrop });
  // tableaux des vitres (de la coque à la doublure) ; vitres transparentes : la coulissante de gauche a disparu, deux autres sont fêlées
  M.color([0.3, 0.31, 0.33]);
  for (const q of PN) {
    const mc = [0, 1].map((i) => (q[0][i] + q[1][i] + q[2][i] + q[3][i]) / 4), at = (e, dr) => NP(e[0], Math.PI / 2 - e[1], dr);
    for (let k = 0; k < 4; k++) {
      const p = q[k], r = q[(k + 1) % 4], n = Math.max(1, Math.ceil(hyp(r[0] - p[0], (r[1] - p[1]) * KF) / 0.08));
      for (let i = 0; i < n; i++) {
        const e0 = [lerp(p[0], r[0], i / n), lerp(p[1], r[1], i / n)], e1 = [lerp(p[0], r[0], (i + 1) / n), lerp(p[1], r[1], (i + 1) / n)], em = [(e0[0] + e1[0]) / 2, (e0[1] + e1[1]) / 2];
        const m = at(em, -0.025), c = at([lerp(em[0], mc[0], 0.2), lerp(em[1], mc[1], 0.2)], -0.025);
        M.quad('cabin', at(e0, 0), at(e1, 0), at(e1, -0.05), at(e0, -0.05), [c[0] - m[0], c[1] - m[1], c[2] - m[2]]);
      }
    }
  }
  const PST = ['ok', 'ok', 'crack', 'crack', 'none', 'ok']; // dans l'ordre de PN : côté +z (pare-brise, coulissante, arrière), puis côté -z
  M.color([0.8, 0.87, 0.88]);
  PN.forEach((q, i) => { if (PST[i] === 'none') return; const f = onNose(q, 1, -0.02); M.uvO = [PST[i] === 'crack' ? 0.5 : 0, 0]; M.surf('glassAir', 4, 4, f, { uL: 0.5, vL: 1, flipN: inward(f) }); });
  M.uvO = [0, 0];
  // essuie-glaces au repos, sondes sous les vitres latérales
  M.cls = 2;
  for (const s of [-1, 1]) {
    M.color([0.12, 0.12, 0.13]); M.tube('rubber', 0.014, [NP(1.6, Math.PI / 2 - s * 0.62, 0.035), NP(1.52, Math.PI / 2 - s * 0.36, 0.035), NP(1.5, Math.PI / 2 - s * 0.14, 0.035)], 4);
    M.color([0.55, 0.56, 0.58]);
    for (const [d, y] of [[2.3, -0.2], [2.65, -0.45]]) { const th = Math.PI / 2 - s * Wp(d, y)[1]; M.tube('steel', 0.016, [NP(d, th, -0.02), NP(d - 0.16, th, 0.07)], 4); }
  }
  M.restore();
  // le poste de pilotage, vu par les vitres : plancher, casquette noire au-dessus de la planche de bord et ses écrans éteints, pupitre central,
  // deux sièges, panneau du plafond, cloison et porte du fond
  const xd = (d) => XF1 + NL - d, wz = (d, y) => { const c = sec(d), t = (y - c.yc) / (c.ry - 0.06); return Math.abs(t) >= 1 ? 0 : (c.rz - 0.06) * Math.sqrt(1 - t * t); };
  const strip = (d0, d1, y, n) => { for (let i = 0; i < n; i++) { const a = lerp(d0, d1, i / n), b = lerp(d0, d1, (i + 1) / n), wa = wz(a, y), wb = wz(b, y); if (wa + wb > 0.02) M.quad('cabin', [xd(a), y, Z(-wa)], [xd(b), y, Z(-wb)], [xd(b), y, Z(wb)], [xd(a), y, Z(wa)], [0, 1, 0]); } };
  const yg = cy + 0.5, xp = xd(1.98);
  M.save().local(1); M.cls = 1;
  M.color([0.2, 0.21, 0.22]); strip(1.9, NL + 0.12, yf, 8);
  M.color([0.07, 0.075, 0.08]); strip(0.95, 2.05, yg, 6);
  { const w = wz(2.05, yg); M.quad('cabin', [xd(2.05), yg - 0.12, Z(-w)], [xd(2.05), yg - 0.12, Z(w)], [xd(2.05), yg, Z(w)], [xd(2.05), yg, Z(-w)], [-1, 0, 0]); }
  M.color([0.15, 0.16, 0.18]);
  for (let i = 0; i < 4; i++) { const y0 = lerp(yf, yg - 0.12, i / 4), y1 = lerp(yf, yg - 0.12, (i + 1) / 4), w0 = wz(1.98, y0), w1 = wz(1.98, y1); M.quad('cabin', [xp, y0, Z(-w0)], [xp, y0, Z(w0)], [xp, y1, Z(w1)], [xp, y1, Z(-w1)], [-1, 0, 0]); }
  M.cls = 2; M.color([0.035, 0.04, 0.045]);
  for (const [z, y] of [[-0.8, 0.15], [-0.52, 0.15], [0, 0.18], [0, -0.06], [0.52, 0.15], [0.8, 0.15]]) M.quad('glass', [xp - 0.006, cy + y - 0.09, Z(z - 0.1)], [xp - 0.006, cy + y - 0.09, Z(z + 0.1)], [xp - 0.006, cy + y + 0.09, Z(z + 0.1)], [xp - 0.006, cy + y + 0.09, Z(z - 0.1)], [-1, 0, 0]);
  M.color([0.2, 0.21, 0.23]); M.boxB('cabin', xd(2.95), xp, yf, cy - 0.22, Z(-0.2), Z(0.2));
  M.color([0.55, 0.56, 0.58]); for (const z of [-0.06, 0.06]) M.boxB('cabin', xd(2.2) - 0.03, xd(2.2) + 0.03, cy - 0.22, cy - 0.06, Z(z) - 0.015, Z(z) + 0.015);
  M.cls = 1; M.color([0.22, 0.24, 0.27]);
  const ov = (u, v, dr) => NP(lerp(2.45, 3.3, u), Math.PI / 2 + lerp(-0.32, 0.32, v), dr);
  { const f = (u, v) => ov(u, v, -0.075); M.surf('cabin', 3, 3, f, { uL: 1, vL: 1, flipN: !inward(f) }); }
  M.cls = 2; M.color([0.75, 0.76, 0.78]);
  for (let i = 0; i < 4; i++) for (let k = 0; k < 7; k++) { const f = (a, b) => ov(0.12 + i * 0.22 + a * 0.06, 0.08 + k * 0.135 + b * 0.05, -0.08); M.surf('cabin', 1, 1, f, { uL: 1, vL: 1, flipN: !inward(f) }); }
  M.cls = 1; M.color([0.36, 0.38, 0.41]);
  M.surf('cabin', 1, 24, (u, v) => P(XF1 - 0.1, u * Ri, v * TAU), { uL: Ri, vL: TAU * Ri, flipN: true, pole: () => [1, 0, 0] });
  M.color([0.28, 0.3, 0.33]); M.quad('cabin', [XF1 - 0.094, yf, Z(-0.42)], [XF1 - 0.094, yf, Z(0.42)], [XF1 - 0.094, yf + 1.92, Z(0.42)], [XF1 - 0.094, yf + 1.92, Z(-0.42)], [1, 0, 0]);
  M.restore();
  for (const s of [1, -1]) M.place(PF.smPilotSeat(), xd(2.8), yf, Z(s * 0.56), 0, { cls: 2 });
  // collisions du nez : par tranches, un noyau et des gradins qui suivent la section (depuis le toit, on descend sur le nez)
  const ncut = [0.3, 0.7, 1.1, 1.6, 2.2, 2.9, 3.7, 4.5, NL];
  for (let i = 0; i < ncut.length - 1; i++) {
    const d0 = ncut[i], d1 = ncut[i + 1], s = sec(d0 + (d1 - d0) * 0.35), x0 = XF1 + NL - d1, x1 = XF1 + NL - d0;
    for (const [f0, f1, fh] of [[0, 0.35, 0.2], [0.35, 0.6, 0.48], [0.6, 0.8, 0.7], [0.8, 0.97, 0.9]]) {
      const h = s.yc + s.ry * Math.sqrt(1 - fh * fh);
      if (!f0) DECOR.col(x0, x1, y0 - 0.5, h, Z(-f1 * s.rz), Z(f1 * s.rz), 'metal');
      else for (const sg of [-1, 1]) DECOR.col(x0, x1, y0 - 0.5, h, Math.min(Z(sg * f0 * s.rz), Z(sg * f1 * s.rz)), Math.max(Z(sg * f0 * s.rz), Z(sg * f1 * s.rz)), 'metal');
    }
  }
  // queue : le cône relevé, la dérive bleue à bandes, les empennages, l'échappement de l'APU
  const TL = 7.5, ts = (t) => { const r = lerp(Rf, 0.32, Math.pow(t, 1.15)); return { x: XR0 - TL * t, y: cy + (Rf - r) * 0.86, r }; };
  M.save().local(1); M.cls = 0; M.color([1, 1, 1]);
  M.surf('hull', 10, 24, (u, v) => { const s = ts(u), th = v * TAU - Math.PI / 2, p = [s.x, s.y + s.r * Math.sin(th), Z(s.r * Math.cos(th))]; M.tint = liv(p[0], p[1] - 0.35 * u); return p; }, { uL: TL, vL: TAU * 1.2, flipN: true });
  M.tint = null; M.color([0.1, 0.1, 0.11]); const te = ts(1); M.save().move(te.x + 0.05, te.y, Z(0)).rotZ(Math.PI / 2); M.cyl('dark', 0.2, 0.3, 10, { r1: 0.24 }); M.restore();
  const fa = ts(0.12), fb = ts(0.86), fy = (s) => s.y + s.r - 0.12, F = [[fa.x - 0.6, fy(fa)], [fb.x + 0.2, fy(fb)], [fb.x - 1.6, fy(fb) + 5.6], [fa.x - 4.2, fy(fa) + 5.6]];
  const fin = (k, d) => [F[k][0], F[k][1], Z(d)], fth = (k) => (k < 2 ? 0.16 : 0.07);
  M.color(blue);
  for (const s of [-1, 1]) M.quad('hull', fin(0, s * fth(0)), fin(1, s * fth(1)), fin(2, s * fth(2)), fin(3, s * fth(3)), [0, 0, s]);
  M.quad('hull', fin(0, -fth(0)), fin(0, fth(0)), fin(3, fth(3)), fin(3, -fth(3)), [0.94, 0.35, 0]); M.quad('hull', fin(3, -fth(3)), fin(3, fth(3)), fin(2, fth(2)), fin(2, -fth(2)), [0, 1, 0]);
  M.quad('hull', fin(2, -fth(2)), fin(2, fth(2)), fin(1, fth(1)), fin(1, -fth(1)), [-0.96, -0.27, 0]);
  // bandes claires en arcs sur les deux faces de la dérive
  const fpt = (u, w) => { const yA = lerp(F[0][1], F[3][1], w), xLE = lerp(F[0][0], F[3][0], w), xTE = lerp(F[1][0], F[2][0], w); return [lerp(xLE, xTE, u), yA]; };
  for (const [w0, w1, col] of [[0.28, 0.36, [0.36, 0.55, 0.86]], [0.42, 0.5, [0.64, 0.78, 0.95]], [0.56, 0.62, [0.92, 0.94, 0.97]], [0.68, 0.75, [0.36, 0.55, 0.86]]]) {
    M.color(col);
    for (let i = 0; i < 6; i++) {
      const u0 = i / 6, u1 = (i + 1) / 6, sag = (u) => -0.12 * Math.sin(u * Math.PI) - 0.1 * u, p00 = fpt(u0, w0 + sag(u0)), p10 = fpt(u1, w0 + sag(u1)), p11 = fpt(u1, w1 + sag(u1)), p01 = fpt(u0, w1 + sag(u0));
      for (const s of [-1, 1]) { const d = (p) => s * (lerp(fth(0), fth(3), (p[1] - F[0][1]) / 5.6) + 0.006); M.quad('hull', [p00[0], p00[1], Z(d(p00))], [p10[0], p10[1], Z(d(p10))], [p11[0], p11[1], Z(d(p11))], [p01[0], p01[1], Z(d(p01))], [0, 0, s]); }
    }
  }
  M.color(white);
  const hs = ts(0.62);
  for (const s of [-1, 1]) {
    const r0 = [hs.x + 1.4, hs.y + 0.1, Z(s * 0.45)], r1 = [hs.x - 1.1, hs.y + 0.1, Z(s * 0.45)], t1 = [hs.x - 2.6, hs.y + 0.5, Z(s * 6.0)], t0 = [hs.x - 1.5, hs.y + 0.5, Z(s * 6.0)];
    M.quad('hull', r0, r1, t1, t0, [0, 1, 0]); M.quad('hull', [r0[0], r0[1] - 0.14, r0[2]], [t0[0], t0[1] - 0.06, t0[2]], [t1[0], t1[1] - 0.06, t1[2]], [r1[0], r1[1] - 0.14, r1[2]], [0, -1, 0]);
    M.quad('hull', [r0[0], r0[1] - 0.14, r0[2]], r0, t0, [t0[0], t0[1] - 0.06, t0[2]], [0.9, 0, -0.4 * s]);
    for (let k = 0; k < 3; k++) { const f0 = k / 3, f1 = (k + 1) / 3, la = lerp(r0[0], t0[0], f1), tb = lerp(r1[0], t1[0], f0); DECOR.col(tb, la, r0[1] - 0.14, t0[1], Math.min(Z(s * lerp(0.45, 6, f0)), Z(s * lerp(0.45, 6, f1))), Math.max(Z(s * lerp(0.45, 6, f0)), Z(s * lerp(0.45, 6, f1))), 'metal'); }
  }
  M.restore();
  DECOR.col(F[2][0], F[0][0], fy(fb), fy(fa) + 5.6, Z(-0.18), Z(0.18), 'metal');
  for (let t = 0; t < 1; t += 0.25) { const a = ts(t), b = ts(t + 0.25), r = Math.min(a.r, b.r) * 0.8; DECOR.col(b.x, a.x, Math.min(a.y, b.y) - r, Math.max(a.y, b.y) + r, Z(-r), Z(r), 'metal'); }
  // ailes basses en flèche : extrados praticable, intrados, bords, volets soulignés, winglets bleus ; carénages de rails sous le bord de fuite.
  // Posées sur le ventre, elles s'enfoncent vers le bout dans le sable (de 37 à 13 cm au-dessus du sol) : on les franchit en marchant sur toute
  // leur longueur (avec le dièdre d'un avion au sol, le bout montait à 1,3 m et l'aile coupait la sebkha en deux : traversee.js)
  const W0 = 1.85, W1 = 15.3, LE = (d) => cx - 1.0 - (d - W0) * (7.3 / (W1 - W0)), TE = (d) => cx - 7.4 - (d - W0) * (2.5 / (W1 - W0)), WY = (d) => yf + 0.12 - (d - W0) * 0.018, WT = (d) => lerp(0.62, 0.16, (d - W0) / (W1 - W0));
  M.save().local(1); M.cls = 0;
  for (const s of [-1, 1]) {
    const pt = (x, y, d) => [x, y, Z(s * d)], n = (v) => [v[0], v[1], v[2] * s];
    M.color([0.86, 0.87, 0.88]);
    M.quad('hull', pt(LE(W0), WY(W0), W0), pt(TE(W0), WY(W0), W0), pt(TE(W1), WY(W1), W1), pt(LE(W1), WY(W1), W1), [0, 1, 0]);
    M.quad('hull', pt(LE(W0), WY(W0) - WT(W0), W0), pt(TE(W0), WY(W0) - WT(W0), W0), pt(TE(W1), WY(W1) - WT(W1), W1), pt(LE(W1), WY(W1) - WT(W1), W1), [0, -1, 0]);
    M.quad('hull', pt(LE(W0), WY(W0), W0), pt(LE(W0) + 0.18, WY(W0) - WT(W0) * 0.5, W0), pt(LE(W1) + 0.06, WY(W1) - WT(W1) * 0.5, W1), pt(LE(W1), WY(W1), W1), n([0.8, 0.5, 0.3]));
    M.quad('hull', pt(LE(W0) + 0.18, WY(W0) - WT(W0) * 0.5, W0), pt(LE(W0), WY(W0) - WT(W0), W0), pt(LE(W1), WY(W1) - WT(W1), W1), pt(LE(W1) + 0.06, WY(W1) - WT(W1) * 0.5, W1), n([0.8, -0.5, 0.3]));
    M.quad('hull', pt(TE(W0), WY(W0), W0), pt(TE(W0), WY(W0) - WT(W0), W0), pt(TE(W1), WY(W1) - WT(W1), W1), pt(TE(W1), WY(W1), W1), n([-0.95, 0, -0.3]));
    M.quad('hull', pt(LE(W1), WY(W1), W1), pt(TE(W1), WY(W1), W1), pt(TE(W1), WY(W1) - WT(W1), W1), pt(LE(W1), WY(W1) - WT(W1), W1), n([0, 0, 1]));
    M.color([0.62, 0.64, 0.66]);
    for (const f of [0.72, 0.9]) { const xa = (d) => lerp(LE(d), TE(d), f); M.quad('hull', pt(xa(W0 + 0.3) + 0.02, WY(W0 + 0.3) + 0.006, W0 + 0.3), pt(xa(W0 + 0.3) - 0.02, WY(W0 + 0.3) + 0.006, W0 + 0.3), pt(xa(W1 - 0.4) - 0.02, WY(W1 - 0.4) + 0.006, W1 - 0.4), pt(xa(W1 - 0.4) + 0.02, WY(W1 - 0.4) + 0.006, W1 - 0.4), [0, 1, 0]); }
    M.color([0.84, 0.85, 0.86]);
    for (const d of [5.0, 8.4, 11.6]) { const yb = WY(d) - WT(d); M.boxB('hull', TE(d) - 0.9, TE(d) + 1.4, yb - 0.32, yb + 0.02, Z(s * d) - 0.14, Z(s * d) + 0.14, { bevel: 0.08 }); }
    M.color([0.8, 0.81, 0.82]); M.boxB('hull', LE(5.7) - 2.4, LE(5.7) - 0.4, WY(5.7) - WT(5.7) - 0.45, WY(5.7) - WT(5.7) + 0.02, Z(s * 5.7) - 0.18, Z(s * 5.7) + 0.18); // mât du réacteur, arraché
    // winglet
    M.color(blue);
    const wa = [LE(W1), WY(W1), W1], wb = [TE(W1), WY(W1), W1], wc = [TE(W1) - 0.5, WY(W1) + 1.6, W1 + 0.3], wd = [TE(W1) + 0.2, WY(W1) + 1.6, W1 + 0.3];
    for (const k of [-1, 1]) M.quad('hull', pt(wa[0], wa[1], wa[2] + k * 0.04), pt(wb[0], wb[1], wb[2] + k * 0.04), pt(wc[0], wc[1], wc[2] + k * 0.02), pt(wd[0], wd[1], wd[2] + k * 0.02), n([0, 0, k]));
    for (let d = W0; d < W1 - 0.01; d += 1) { const d1 = Math.min(W1, d + 1), y = WY((d + d1) / 2); DECOR.col(Math.max(TE(d), TE(d1)), Math.min(LE(d), LE(d1)), y - WT(d), y, Math.min(Z(s * d), Z(s * d1)), Math.max(Z(s * d), Z(s * d1)), 'metal'); }
  }
  M.restore();
  // les réacteurs, arrachés, couchés dans le sable devant les ailes
  smPlace(PF.smJetEngine(), cx + 3.6, Z(7.6), 0.42); smPlace(PF.smJetEngine(), cx + 3.0, Z(-7.6), -0.42);
  return { top };
}
/* Bloc de trois sièges de cabine (repère : le plancher, le milieu du bloc ; on regarde vers +x) : assise et dossier bleu marine, têtière à housse
   rayée gris et blanc au dos, accoudoirs gris-vert, piètement d'acier ; une collision pour le bloc */
PF.smSeats3 = () => prefab('smSeats3', (M) => {
  const navy = [0.1, 0.13, 0.22], light = [0.88, 0.87, 0.84], stripe = [0.52, 0.5, 0.46];
  M.local(1);
  for (let k = 0; k < 3; k++) {
    const z = -0.4 + k * 0.4;
    M.color(navy); M.boxB('cabin', -0.22, 0.24, 0.36, 0.5, z - 0.18, z + 0.18, { bevel: 0.03 });
    M.save().move(-0.2, 0.46, z).rotZ(0.16);
    M.color(navy); M.boxB('cabin', -0.06, 0.05, 0, 0.74, -0.18, 0.18, { bevel: 0.025 });
    for (let i = 0; i < 5; i++) { M.color(i % 2 ? light : stripe); const za = -0.17 + (i / 5) * 0.34, zb = -0.17 + ((i + 1) / 5) * 0.34; M.quad('canvas', [-0.066, 0.5, za], [-0.066, 0.5, zb], [-0.066, 0.72, zb], [-0.066, 0.72, za], [-1, 0, 0]); }
    M.color(light); M.quad('canvas', [0.056, 0.5, -0.17], [0.056, 0.5, 0.17], [0.056, 0.72, 0.17], [0.056, 0.72, -0.17], [1, 0, 0]);
    M.restore();
  }
  M.color([0.3, 0.31, 0.27]);
  for (const z of [-0.6, -0.2, 0.2, 0.6]) M.boxB('cabin', -0.16, 0.2, 0.58, 0.64, z - 0.025, z + 0.025, { bevel: 0.01 });
  M.color([0.55, 0.56, 0.58]);
  for (const z of [-0.42, 0.42]) { M.boxB('steel', -0.14, -0.1, 0, 0.36, z - 0.02, z + 0.02); M.boxB('steel', 0.14, 0.18, 0, 0.36, z - 0.02, z + 0.02); }
  M.boxB('steel', -0.16, 0.2, 0.3, 0.34, -0.55, 0.55);
  M.col(-0.3, 0.28, 0, 1.0, -0.6, 0.6, 'wood');
});
/* Siège de pilote (vers +x) : socle, assise et dossier anthracite, housse en peau de mouton claire, appui-tête, accoudoirs */
PF.smPilotSeat = () => prefab('smPilotSeat', (M) => {
  const dark = [0.13, 0.13, 0.14];
  M.local(1);
  M.color([0.3, 0.31, 0.33]); M.boxB('steel', -0.2, 0.2, 0, 0.34, -0.16, 0.16);
  M.color(dark); M.boxB('cabin', -0.26, 0.26, 0.34, 0.47, -0.25, 0.25, { bevel: 0.03 });
  M.save().move(-0.24, 0.45, 0).rotZ(0.12);
  M.color(dark); M.boxB('cabin', -0.07, 0.04, 0, 0.82, -0.25, 0.25, { bevel: 0.03 }); M.boxB('cabin', -0.04, 0.06, 0.84, 1.0, -0.15, 0.15, { bevel: 0.03 });
  M.color([0.74, 0.68, 0.58]); M.boxB('canvas', 0.04, 0.07, 0.06, 0.66, -0.21, 0.21, { bevel: 0.02 });
  M.restore();
  M.color(dark); for (const z of [-0.29, 0.29]) M.boxB('cabin', -0.18, 0.16, 0.6, 0.66, z - 0.03, z + 0.03, { bevel: 0.01 });
});
/* Réacteur à double flux arraché de son mât (repère : le sable sous lui, l'entrée d'air vers +x) : nacelle grise, soufflante et cône, tuyère et
   cône d'éjection, le mât déchiré au-dessus ; enfoncé de 12 cm ; une collision */
PF.smJetEngine = () => prefab('smJetEngine', (M) => {
  M.local(1); const ay = 0.92;
  M.save().move(-1.8, ay, 0).rotZ(-Math.PI / 2);
  M.color([0.8, 0.81, 0.82]); M.lathe('hull', [[0.62, 0], [0.8, 0.45], [0.98, 1.4], [1.04, 2.6], [1.02, 3.3], [0.94, 3.6], [0.86, 3.52], [0.84, 3.3]], 20);
  M.color([0.08, 0.08, 0.09]); M.save().move(0, 3.24, 0); M.cyl('dark', 0.85, 0.02, 20); M.restore();
  M.color([0.62, 0.63, 0.65]); M.save().move(0, 3.26, 0); M.cyl('steel', 0.3, 0.32, 14, { r1: 0.02 }); M.restore();
  M.color([0.3, 0.31, 0.33]);
  for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; M.save().move(0, 3.27, 0).rotY(a); M.quad('steel', [0.3, 0, -0.06], [0.84, 0, -0.1], [0.84, 0.03, 0.1], [0.3, 0.03, 0.06], [0, 1, 0]); M.restore(); }
  M.color([0.5, 0.5, 0.52]); M.lathe('steel', [[0, -1.05], [0.22, -0.9], [0.44, -0.35], [0.5, 0]], 14);
  M.color([0.12, 0.12, 0.12]); M.lathe('dark', [[0.5, 0.02], [0.6, 0.02]], 16);
  M.restore();
  M.color([0.78, 0.79, 0.8]); M.boxB('hull', -1.2, 1.0, ay + 0.9, ay + 1.3, -0.17, 0.17);
  M.color([0.4, 0.4, 0.42]); M.boxB('steel', 0.6, 1.0, ay + 1.28, ay + 1.36, -0.12, 0.12);
  M.col(-2.6, 1.8, 0, ay + 1.0, -0.95, 0.95, 'metal');
});

/* ---------- La vie du désert : tourbillons de poussière, vautours ---------- */
/* Texture des tourbillons (128 x 256, alpha) : traînées de poussière qui montent en spirale, plus denses en bas, effilochées en haut */
function smDevilTex() {
  const t = canvasTex(256, (g, S) => {
    const R = rngOf(818); g.clearRect(0, 0, S, S);
    for (let i = 0; i < 900; i++) {
      const x = R() * S, y = R() * S, h = 8 + R() * 60, w = 2 + R() * 6, a = 0.04 + 0.1 * Math.pow(y / S, 1.5);
      const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, 'rgba(255,240,220,0)'); gr.addColorStop(0.5, `rgba(255,240,220,${a})`); gr.addColorStop(1, 'rgba(255,240,220,0)');
      g.fillStyle = gr; g.save(); g.translate(x, y); g.rotate(-0.35); g.fillRect(-w / 2, -h, w, h); g.restore();
      if (x < 12) { g.save(); g.translate(x + S, y); g.rotate(-0.35); g.fillStyle = gr; g.fillRect(-w / 2, -h, w, h); g.restore(); }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1);
  return t;
}
/* Tourbillon de poussière : deux cônes ouverts emboîtés qui tournent et errent lentement sur un circuit (cx, cz, rx, rz, période) ;
   sans collision, sans ombre, transparents (on voit au travers) ; animés par smLife */
function smDustDevil(o, tex) {
  const g = new THREE.Group(), mats = [];
  for (const [r0, r1, h, op] of [[0.9, 3.2, 14, 0.34], [0.5, 1.8, 9, 0.26]]) {
    const geo = new THREE.CylinderGeometry(r1, r0, h, 20, 6, true); geo.translate(0, h / 2, 0);
    const m = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color().setRGB(sl(0.92), sl(0.76), sl(0.58)), transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, fog: true });
    const mesh = new THREE.Mesh(geo, m); mesh.userData.noAO = true; mesh.userData.noPrepass = true; mesh.castShadow = false; mesh.renderOrder = 4;
    g.add(mesh); mats.push(m);
  }
  mapAdd(g);
  return { k: 'devil', g, mats, o, ph: o.ph || 0 };
}
/* Voiles de sable : le vent arrache du sable aux crêtes des dunes et le traîne au ras du sol. Minces nappes verticales de 0,7 m couchées dans le sens du
   vent, drapées sur le relief, transparentes, sans collision ni ombre ; une seule matière dont la texture de traînées défile (smLife). Sur les crêtes
   seulement (plus hautes que le sable à 4 m en amont), hors des camps et des bases */
function smVeilTex() {
  const t = canvasTex(256, (g, S) => {
    const R = rngOf(919); g.clearRect(0, 0, S, S);
    for (let i = 0; i < 700; i++) {
      const y = S * (1 - Math.pow(R(), 1.8)), x = R() * S, w = 20 + R() * 90, h = 1 + R() * 3, a = 0.05 + 0.16 * Math.pow(y / S, 2);
      const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, 'rgba(255,236,210,0)'); gr.addColorStop(0.5, `rgba(255,236,210,${a})`); gr.addColorStop(1, 'rgba(255,236,210,0)');
      g.fillStyle = gr; g.fillRect(x, y - h, w, h); if (x + w > S) g.fillRect(x - S, y - h, w, h);
    }
  });
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
function smSandVeils(R, tex) {
  const D = WIND_U.uWnD.value, dx = D.x, dz = D.y, tile = 6, pos = [], uv = [], idx = [];
  for (let i = 0, n = 0; i < 600 && n < 26; i++) {
    const a = R() * TAU, r = Math.sqrt(R()) * (SM_R + 24), cx = Math.cos(a) * r, cz = Math.sin(a) * r, h = smH(cx, cz);
    if (h < smH(cx - dx * 4, cz - dz * 4) + 0.35 || SM_PADS.some((p) => hyp((cx - p[0]) / (p[2] + 4), (Math.abs(cz) - p[1]) / (p[3] + 4)) < 1) || smPondQ(cx, cz) < 1.6) continue;
    const L = R.range(9, 18), off = R.range(-0.6, 0.6), base = pos.length / 3;
    for (let k = 0; k <= 12; k++) {
      const u = k / 12, x = cx + dx * (u * L - 1.5) - dz * off * u, z = cz + dz * (u * L - 1.5) + dx * off * u, y = smY(x, z) - 0.05;
      pos.push(x, y, z, x, y + 0.75, z); uv.push((u * L) / tile, 0, (u * L) / tile, 1);
      if (k) { const b = base + (k - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    }
    n++;
  }
  if (!pos.length) return null;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
  const m = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color().setRGB(sl(0.95), sl(0.82), sl(0.66)), transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide, fog: true });
  const mesh = new THREE.Mesh(g, m); mesh.userData.noAO = true; mesh.userData.noPrepass = true; mesh.castShadow = false; mesh.renderOrder = 4; mesh.frustumCulled = false;
  mapAdd(mesh);
  return { k: 'veil', g: mesh, mats: [m], o: {}, tile };
}
/* Vautour : silhouette sombre aux ailes en planche (doigts écartés au bout), qui tourne en spirale au-dessus des dunes */
function smVulture(o) {
  const shape = new THREE.Shape(); shape.moveTo(0, 0.5); shape.lineTo(1.1, 0.2); shape.lineTo(1.6, 0.25); shape.lineTo(1.75, 0.05); shape.lineTo(1.2, -0.1); shape.lineTo(0.25, -0.3); shape.lineTo(0, -0.7);
  shape.lineTo(-0.25, -0.3); shape.lineTo(-1.2, -0.1); shape.lineTo(-1.75, 0.05); shape.lineTo(-1.6, 0.25); shape.lineTo(-1.1, 0.2); shape.lineTo(0, 0.5);
  const geo = new THREE.ShapeGeometry(shape); geo.rotateX(-Math.PI / 2);
  const m = new THREE.MeshBasicMaterial({ color: 0x1c1612, side: THREE.DoubleSide, fog: true });
  const mesh = new THREE.Mesh(geo, m); mesh.castShadow = false; mesh.userData.noAO = true; mapAdd(mesh);
  return { k: 'bird', g: mesh, mats: [m], o };
}
/* Animation : le tourbillon tourne, erre sur son circuit, s'efface et renaît (il vit 70 % du temps) ; les vautours tournent */
function smLife(list, t) {
  for (const A of list) {
    const o = A.o;
    if (A.k === 'devil') {
      const u = (t / o.T + A.ph) % 1, life = smoothstep(0, 0.12, u) * (1 - smoothstep(0.58, 0.7, u)), w = (t / o.T + A.ph) * TAU;
      A.g.visible = life > 0.01;
      if (!A.g.visible) continue;
      const px = o.cx + Math.sin(w * 1.3) * o.rx, pz = o.cz + Math.sin(w * 0.7 + 1.1) * o.rz;
      A.g.position.set(px, gy0(px, pz) - 0.3, pz); // sur le sable
      A.g.children.forEach((c, i) => { c.rotation.y = t * (i ? 2.6 : 1.7); c.scale.set(0.6 + 0.4 * life, 0.5 + 0.5 * life, 0.6 + 0.4 * life); c.rotation.z = Math.sin(t * 0.7 + i) * 0.06; });
      A.mats[0].map.offset.y = -t * 0.25; A.mats.forEach((m, i) => { m.opacity = (i ? 0.26 : 0.34) * life; });
    } else if (A.k === 'veil') {
      // le sable file dans le sens du vent (3 m/s), par rafales
      A.mats[0].map.offset.x = -((t * 3) / A.tile) % 1; A.mats[0].opacity = Math.min(1, 0.42 * (0.55 + 0.45 * Math.sin(t * 0.37) * Math.sin(t * 0.23 + 1.3)) * (1 + 1.4 * Math.max(0, SMS.s))); // plus denses dans la tempête (smStorm)
    } else {
      const a = t * o.w + o.a0;
      A.g.position.set(o.cx + Math.cos(a) * o.r, o.y + Math.sin(t * 0.13 + o.a0) * 3, o.cz + Math.sin(a) * o.r);
      A.g.rotation.set(0, (o.w > 0 ? Math.PI : 0) - a, (o.w > 0 ? 1 : -1) * 0.32);
    }
  }
}

}catch(e){HOOKS.missing['02yk-simoun-kit.js']=String(e&&e.message||e)}
/* ===== 02yi-stratus-kit.js ===== */
try{
/* ==========================================================================
   KIT DES ÎLES FLOTTANTES : surfaces, matières et objets de Stratus, l'archipel suspendu au-dessus de la mer de nuages.
   - Surface procédurale (générée seulement pour une carte qui la demande, voir OPT_TEX) : la roche stratifiée des falaises et
     de la masse rocheuse qui pend sous chaque île ;
   - Îles (stIsland) : un dessus plat fait de rectangles (collision : boîtes dont le dessus est à y = 0, rien d'autre ne porte),
     la falaise puis la masse rocheuse qui s'effile vers le vide, d'une seule boucle de sommets : le haut de la falaise suit
     exactement le bord des collisions (on voit où l'on peut marcher), le reste s'enfonce et se resserre ;
   - Ponts suspendus (stBridge) : tablier de planches qui s'affaisse un peu au milieu (collision en tronçons d'un mètre), poutres,
     cordes, filets et poteaux ; de chaque côté, un mur invisible de 2,2 m qui retient les soldats (on ne saute pas par-dessus) et
     laisse passer balles et grenades. Toujours alignés sur x ou z (les collisions sont des boîtes alignées) ;
   - Objets : colonnes et blocs des ruines, cristaux, tour de guet, dirigeables.
   Le plan de la carte est dans 02yj-stratus.js. Tout se construit au chargement et se libère avec la carte.
   ========================================================================== */
Object.assign(TEXLAB, {
  /* roche stratifiée (grès et marnes) : bandes horizontales de teintes et d'épaisseurs inégales, ondulées, joints creusés, fissures, grain */
  strata: [1024, 71, 2.4, `
    float big = gfbm(uv, vec2(2.0), 5, 1.0), mid = gfbm(uv, vec2(8.0), 4, 2.0), fine = gfbm(uv, vec2(32.0), 3, 3.0);
    float ly = uv.y * 6.0 + (big - 0.5) * 1.1 + (mid - 0.5) * 0.3;
    float band = fract(ly), bid = mod(floor(ly), 6.0), hb = hs(vec2(bid, 0.0), 7.0), th = 0.05 + hs(vec2(bid, 1.0), 9.0) * 0.08;
    float joint = 1.0 - smoothstep(0.0, th, band) * (1.0 - smoothstep(1.0 - th * 0.6, 1.0, band));
    vec4 cr = vor(uv, vec2(7.0, 4.0), 4.0, 1.0);
    float crack = (1.0 - smoothstep(0.0, 0.03, cr.w)) * smoothstep(0.42, 0.62, gfbm(uv, vec2(4.0), 3, 9.0));
    float pit = (1.0 - smoothstep(0.05, 0.16, vor(uv, vec2(24.0), 5.0, 1.0).x)) * step(0.82, vor(uv, vec2(24.0), 5.0, 1.0).z);
    h = (1.0 - joint) * 0.45 + mid * 0.3 + fine * 0.14 - crack * 0.42 - pit * 0.2;
    vec3 c0 = srgb(vec3(0.62, 0.56, 0.48)), c1 = srgb(vec3(0.72, 0.66, 0.57)), c2 = srgb(vec3(0.55, 0.53, 0.51)), c3 = srgb(vec3(0.66, 0.53, 0.42));
    a = hb < 0.32 ? c0 : hb < 0.58 ? c1 : hb < 0.82 ? c2 : c3;
    a *= (0.84 + mid * 0.22 + fine * 0.1) * (1.0 - crack * 0.45) * (1.0 - joint * 0.28) * (1.0 - pit * 0.25);
    r = 0.86 + fine * 0.08; x = h;`],
});
Object.assign(TEXSCALE, { strata: 5.0 });
OPT_TEX.add('strata');
/* Surfaces que Stratus demande (surfaces de sa définition) : la roche, la flore de Modern (pelouse, allées, dalles, humus, écorce), les
   filets du port (côtés des ponts) */
var STRATUS_SURFACES = ['strata', 'lawn', 'flagstone', 'humus', 'bark', 'net'];

/* Couleurs. Les deux moitiés se distinguent (on sait de quel côté on est) : azur au nord (Alpha, +z), garance au sud (Bravo, -z) */
var ST = {
  accent: [[0.16, 0.42, 0.82], [0.84, 0.27, 0.14]],
  rope: [0.66, 0.56, 0.42], wood: [0.84, 0.74, 0.62], stone: [0.88, 0.84, 0.76], moss: [0.6, 0.7, 0.42],
};
var stAccent = (z) => ST.accent[z >= 0 ? 0 : 1];

/* ---------- Matières ---------- */
function makeStratusMaterials(M) {
  makeFloraMaterials(M);
  M('strata', { tex: 'strata', macro: 0.5, grime: 0.15, dust: 0.06 });
  M('rope', { tex: 'burlap', rough: 0.92, macro: 0.08, env: 0.2 });
  M('net', { tex: 'net', cut: 0.5, rough: 0.85, env: 0.25, macro: 0.15 });
  // cristaux : lumineux par eux-mêmes (au-delà de 1 : le halo les fait rayonner), voilés par le brouillard comme le reste, taillés et fêlés (stCrystalCut)
  MAT.crystalSt = stCrystalCut(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.42, 1.25, 1.85), vertexColors: true })); MAT.crystalSt.userData.noShadow = true;
}
/* Fractures des cristaux : réseau de fissures de « Marble Rock 01 » (Poly Haven, CC0), passé en niveaux de gris et en passe-haut (les fissures
   seules, claires sur fond noir : assets/fx/cristal.webp, 512², 58 Ko), chargé au lancement de la carte (paquet fx_cristal) ; en attendant,
   une texture noire d'un pixel (aucune fissure). Libéré avec la carte. */
var CRX = { U: { tCrx: { value: null } }, tex: null };
function stCrystalTexLoad() {
  if (!CRX.none) { CRX.none = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); CRX.none.needsUpdate = true; }
  CRX.U.tCrx.value = CRX.none;
  fetchTexPack('fx_cristal').then((d) => d && new THREE.TextureLoader().load(d.map, (t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    if (CURMAP.id === 'stratus' && !CRX.tex) { CRX.tex = t; CRX.U.tCrx.value = t; } else t.dispose();
  }));
}
function stCrystalTexFree() { if (CRX.tex) { CRX.tex.dispose(); CRX.tex = null; } if (CRX.none) CRX.U.tCrx.value = CRX.none; }
/* Cristal taillé, toujours sans lumière (une seule texture : les fractures) : chaque facette prend sa normale par les dérivées de la position
   et sa propre clarté ; vue de face, elle est profonde et plus bleue, vue de biais, elle s'éclaire (Fresnel) jusqu'à rayonner sur les arêtes ;
   un reflet blanc passe d'une facette à l'autre quand on bouge (lumière fixe dans le repère de la caméra). Les fractures sont prises deux fois
   dans le plan de la facette (projection sur l'axe dominant de sa normale) : à la surface, et plus loin en profondeur, décalées selon le
   regard (parallaxe) : elles bougent à l'intérieur quand on tourne autour. Avant les facettes, une teinte plate : des silhouettes sans relief. */
function stCrystalCut(m) {
  m.extensions = { derivatives: true };
  stCrystalTexLoad();
  m.onBeforeCompile = (s) => {
    s.uniforms.tCrx = CRX.U.tCrx;
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vCrV, vCrW;').replace('#include <project_vertex>', '#include <project_vertex>\nvCrV = -mvPosition.xyz; vCrW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vCrV, vCrW; uniform sampler2D tCrx;').replace('#include <color_fragment>', `#include <color_fragment>
  vec3 crV = normalize(vCrV), crN = normalize(cross(dFdx(vCrV), dFdy(vCrV)));
  if (dot(crN, crV) < 0.0) crN = -crN;
  float crF = 1.0 - clamp(dot(crN, crV), 0.0, 1.0);
  float crH = fract(sin(dot(floor(crN * 5.0 + 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float crS = pow(max(dot(reflect(-crV, crN), normalize(vec3(-0.35, 0.75, 0.55))), 0.0), 18.0);
  vec3 crWN = normalize(cross(dFdx(vCrW), dFdy(vCrW))), crA = abs(crWN), crVW = normalize(cameraPosition - vCrW);
  bool crX = crA.x > crA.y && crA.x > crA.z, crY = !crX && crA.y > crA.z;
  vec2 crUv = crX ? vCrW.zy : crY ? vCrW.xz : vCrW.xy, crVp = crX ? crVW.zy : crY ? crVW.xz : crVW.xy;
  float crD = max(abs(dot(crVW, crWN)), 0.3);
  float crF1 = texture2D(tCrx, crUv * 0.28).r, crF2 = texture2D(tCrx, crUv * 0.45 - crVp / crD * 0.12 + 0.37).r;
  diffuseColor.rgb = mix(diffuseColor.rgb * vec3(0.55, 0.85, 1.15), diffuseColor.rgb, crF) * (0.26 + 0.46 * crH + 1.3 * crF * crF) * (1.0 - 0.35 * crF1) + vec3(0.9, 1.0, 1.1) * crS
    + vec3(0.5, 0.95, 1.3) * (crF2 * 0.85 + crF1 * 0.3) * (1.0 - 0.5 * crF);`);
  };
  return m;
}
function stratusKit() { floraKit(); }

/* ---------- Îles ---------- */
/* Contour d'une union de rectangles [x0, x1, z0, z1] (multiples de 0,5 m) : boucle fermée, l'île à gauche du sens de parcours, points aux
   angles. Les rectangles d'une île se recouvrent ou se touchent par un côté, jamais par un seul coin (contour ambigu). */
function stOutline(rects) {
  const r = 0.5, bx0 = Math.min(...rects.map((q) => q[0])), bx1 = Math.max(...rects.map((q) => q[1])), bz0 = Math.min(...rects.map((q) => q[2])), bz1 = Math.max(...rects.map((q) => q[3]));
  const W = Math.round((bx1 - bx0) / r), H = Math.round((bz1 - bz0) / r), on = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const x = bx0 + (i + 0.5) * r, z = bz0 + (j + 0.5) * r; on[j * W + i] = rects.some((q) => x > q[0] && x < q[1] && z > q[2] && z < q[3]) ? 1 : 0; }
  const inside = (i, j) => i >= 0 && j >= 0 && i < W && j < H && on[j * W + i] === 1, next = new Map(), key = (x, z) => x.toFixed(2) + ',' + z.toFixed(2);
  const edge = (ax, az, bx, bz) => next.set(key(ax, az), [ax, az, bx, bz]);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (!inside(i, j)) continue;
    const x0 = bx0 + i * r, z0 = bz0 + j * r, x1 = x0 + r, z1 = z0 + r;
    if (!inside(i, j - 1)) edge(x0, z0, x1, z0);
    if (!inside(i, j + 1)) edge(x1, z1, x0, z1);
    if (!inside(i - 1, j)) edge(x0, z1, x0, z0);
    if (!inside(i + 1, j)) edge(x1, z0, x1, z1);
  }
  // chaînage, puis fusion des pas alignés : il ne reste que les angles
  const first = next.values().next().value, pts = [];
  let e = first, guard = 0;
  do { pts.push([e[0], e[1]]); e = next.get(key(e[2], e[3])); } while (e && e !== first && ++guard < 100000);
  const out = [];
  for (let k = 0; k < pts.length; k++) {
    const a = pts[(k + pts.length - 1) % pts.length], b = pts[k], c = pts[(k + 1) % pts.length];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) out.push(b);
  }
  return { pts: out, on, W, H, bx0, bz0, r };
}
/* Contour arrondi : les angles saillants de stOutline deviennent des arcs (rayon r, au plus 45 % des côtés voisins), les angles rentrants
   restent vifs (un arc y ajouterait un sol sans collision). L'arc rentre d'au plus 0,29 r dans la boîte de collision : le bord droit et l'angle
   droit des îles disparaissent (retour du propriétaire, octobre 2026 : bords de terrain droits et anguleux) */
var ST_CUTS = []; // angles arrondis des îles de la carte en construction : le gazon n'y pousse pas (stCut), vidés au début de stratusLevel
function stCut(x, z) { for (const c of ST_CUTS) if ((x - c.bx) * (x - c.cx) <= 0 && (z - c.bz) * (z - c.cz) <= 0 && hyp(x - c.cx, z - c.cz) > c.rr - 0.05) return true; return false; }
function stRoundLoop(O, r = 1.2) {
  const P = O.pts, n = P.length, out = [];
  const inside = (x, z) => { const i = Math.floor((x - O.bx0) / O.r), j = Math.floor((z - O.bz0) / O.r); return i >= 0 && j >= 0 && i < O.W && j < O.H && O.on[j * O.W + i] === 1; };
  for (let k = 0; k < n; k++) {
    const a = P[(k + n - 1) % n], b = P[k], c = P[(k + 1) % n];
    const la = hyp(a[0] - b[0], a[1] - b[1]), lc = hyp(c[0] - b[0], c[1] - b[1]);
    const u1 = [(a[0] - b[0]) / la, (a[1] - b[1]) / la], u2 = [(c[0] - b[0]) / lc, (c[1] - b[1]) / lc];
    const convex = inside(b[0] + (u1[0] + u2[0]) * 0.1, b[1] + (u1[1] + u2[1]) * 0.1), rr = Math.min(r, la * 0.45, lc * 0.45);
    if (!convex || rr < 0.2) { out.push([b[0], b[1]]); continue; }
    const cxr = b[0] + (u1[0] + u2[0]) * rr, czr = b[1] + (u1[1] + u2[1]) * rr, a0 = Math.atan2(b[1] + u1[1] * rr - czr, b[0] + u1[0] * rr - cxr);
    let da = Math.atan2(b[1] + u2[1] * rr - czr, b[0] + u2[0] * rr - cxr) - a0; if (da > Math.PI) da -= TAU; if (da < -Math.PI) da += TAU;
    for (let f = 0; f <= 6; f++) out.push([cxr + Math.cos(a0 + da * f / 6) * rr, czr + Math.sin(a0 + da * f / 6) * rr]);
    ST_CUTS.push({ bx: b[0], bz: b[1], cx: cxr, cz: czr, rr });
  }
  return out;
}
/* Allure du dessous d'une île, tirée au hasard pour chacune (aucune ne ressemble à une autre) : profil de la masse (part du rayon gardée à
   chaque profondeur, du pied de la falaise à la pointe : cône, ventre, gradins, poire, bloc trapu), corniches (la masse rentre d'un coup :
   un surplomb dans les strates), lobes et torsion (la coupe n'est pas une réduction du contour : la masse pend d'un côté, s'allonge, se
   tord), arêtes plus ou moins vives, profondeur, stalactites et éclats. firm : rocher flottant, dont les boîtes de collision doivent rester
   dans la roche (allures pleines, relief atténué, profondeur entière ; voir stIsland). walk : île praticable, sans ventre (sa masse reste dans
   le contour du dessus sur 21 m : stIsland) */
function stUnderShape(R, firm, walk) {
  const kinds = firm ? ['ventre', 'trapu', 'cone'] : walk ? ['cone', 'gradins', 'poire', 'trapu', 'cone', 'gradins', 'poire'] : ['cone', 'ventre', 'gradins', 'poire', 'trapu', 'cone', 'gradins'];
  const kind = R.pick(kinds), j = () => R.range(-0.05, 0.05);
  // profil en six points (profondeur relative 0, 0,2, 0,4, 0,6, 0,8, 1 : jusqu'à la pointe), lissé entre eux
  const F = { cone: [0.94, 0.74, 0.5, 0.24], ventre: [1.1, 1.04, 0.74, 0.36], gradins: [0.92, 0.72, 0.52, 0.27], poire: [0.82, 0.9, 0.66, 0.3], trapu: [1.0, 0.88, 0.66, 0.38] }[kind];
  const pts = [1, ...F.map((v) => v + j()), 0.03];
  const ledges = []; for (let i = 0, n = kind === 'gradins' ? 2 + Math.floor(R() * 2) : R() < 0.45 ? 1 : 0; i < n; i++) ledges.push({ t: R.range(0.14, 0.72), d: firm ? R.range(0.04, 0.08) : kind === 'gradins' ? R.range(0.12, 0.24) : R.range(0.06, 0.16) });
  const la = firm ? 0.5 : 1;
  // une île sur trois se partage vers le bas en deux ou trois pointes (lobes profonds qui se creusent à partir du milieu, une grande stalactite
  // sous chacun : stUnderParts)
  const split = !firm && R() < 0.35 ? { k: R() < 0.6 ? 2 : 3, a: R.range(0.22, 0.4), ph: R() * TAU } : null;
  return {
    kind, pts, ledges, split, depth: firm ? R.range(0.95, 1.2) : kind === 'trapu' ? R.range(0.62, 0.8) : R.range(0.88, 1.22), twist: R.range(-1.4, 1.4), crag: R.range(0.7, 1.8) * la, lumpy: R.range(0.6, 1.4) * la,
    // strates : pendage (pente des couches, en x et en z) et épaisseur propres à l'île
    dip: [R.range(-0.13, 0.13), R.range(-0.13, 0.13)], band: R.range(0.75, 1.3),
    lobes: [[1, R.range(0.03, 0.14)], [2, R.range(0.02, 0.12)], [3, R.range(0.0, 0.08)], [5, R.range(0.0, 0.04)]].map(([k, a]) => ({ k, a: a * la, ph: R() * TAU })),
    pend: kind === 'trapu' ? R.range(1.4, 2.0) : R.range(0.6, 1.3), firm,
  };
}
/* Part du rayon gardée à la profondeur relative t (0 au pied de la falaise, 1 à la pointe), dans la direction ang */
function stUnderScale(S, t, ang) {
  const u = clamp(t, 0, 1) * 5, i = Math.min(4, Math.floor(u)), f0 = S.pts[i], f1 = S.pts[i + 1], e = u - i;
  let f = lerp(f0, f1, e * e * (3 - 2 * e));
  for (const L of S.ledges) f *= 1 - L.d * smoothstep(L.t - 0.012, L.t + 0.012, t);
  let lob = 1; for (const L of S.lobes) lob += L.a * Math.pow(t, 0.8) * Math.cos(L.k * ang + L.ph + S.twist * t);
  if (S.split) lob += S.split.a * smoothstep(0.35, 0.8, t) * (Math.cos(S.split.k * ang + S.split.ph + S.twist * t * 0.5) - 0.35);
  f *= Math.max(0.2, lob);
  return Math.max(0.03, f);
}
/* Île flottante. I : { rects, depth (pointe, m sous le dessus), seed, tip [dx, dz] (décalage de la pointe), m (matière d'impact),
   y (hauteur du dessus, 0 par défaut), nocol (sans collision : rocher flottant, qui pose les siennes), firm (rocher flottant : sa masse
   contient ses collisions) }.
   Collisions : une boîte par rectangle, de y = -8 à 0 (dessus praticable) ; décor : dessus (matière du sol de la carte, répartition
   comprise), puis la falaise et la masse rocheuse en une seule boucle qui descend vers la pointe (allure propre à l'île : stUnderShape),
   des stalactites qui pendent de la masse et quelques éclats qui flottent autour (stUnderParts). Rend le contour. */
function stIsland(I) {
  const M = DECOR, O = stOutline(I.rects), N = makeNoise(I.seed), R = rngOf(I.seed * 7 + 3), y0 = I.y || 0;
  if (!I.nocol) for (const q of I.rects) DECOR.col(q[0], q[1], y0 - 8, y0, q[2], q[3], I.m || 'concrete');
  // dessus : le contour arrondi, triangulé (une seule nappe, pas de recouvrement)
  const P = stRoundLoop(O), loop = [];
  M.save().local(1).color([0.86, 0.88, 0.76]); M.cls = 0; M.aoFn = null;
  { const B = M.buf('ground', O.bx0 + O.W * O.r / 2, y0, O.bz0 + O.H * O.r / 2), vids = P.map((q) => M.v(B, q[0], y0, q[1], 0, 1, 0, q[0], -q[1]));
    for (const t of THREE.ShapeUtils.triangulateShape(P.map((q) => new THREE.Vector2(q[0], q[1])), [])) { const a = P[t[0]], b = P[t[1]], c = P[t[2]], cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); if (cr > 0) M.tri(B, vids[t[0]], vids[t[2]], vids[t[1]]); else M.tri(B, vids[t[0]], vids[t[1]], vids[t[2]]); } }
  M.restore();
  // boucle du bord, rééchantillonnée tous les 0,8 m au plus ; normale horizontale sortante (moyenne aux angles)
  for (let k = 0; k < P.length; k++) {
    const a = P[k], b = P[(k + 1) % P.length], L = hyp(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 0.8));
    const nx = (b[1] - a[1]) / L, nz = -(b[0] - a[0]) / L; // à droite du sens de parcours : l'extérieur
    if (L < 1e-6) continue;
    for (let i = 0; i < n; i++) loop.push({ x: lerp(a[0], b[0], i / n), z: lerp(a[1], b[1], i / n), nx, nz, corner: i === 0 });
  }
  for (let k = 0; k < loop.length; k++) if (loop[k].corner) { const p = loop[(k + loop.length - 1) % loop.length], q = loop[k], l = hyp(p.nx + q.nx, p.nz + q.nz) || 1; q.nx = (p.nx + q.nx) / l; q.nz = (p.nz + q.nz) / l; }
  let cx = 0, cz = 0; for (const p of loop) { cx += p.x; cz += p.z; } cx /= loop.length; cz /= loop.length;
  cx += (I.tip ? I.tip[0] : 0); cz += (I.tip ? I.tip[1] : 0);
  let s = 0; for (let k = 0; k < loop.length; k++) { loop[k].s = s; const q = loop[(k + 1) % loop.length]; s += hyp(q.x - loop[k].x, q.z - loop[k].z); }
  const per = s, S = stUnderShape(R, !!I.firm, !I.nocol), D = Math.max(6, (I.depth || 30) * S.depth);
  // rangs : la falaise (presque verticale, irrégulière) jusqu'à 3 m sous le dessus, puis la masse, un rang tous les 1,5 à 2,5 m (deux de part et
  // d'autre de chaque corniche, pour un surplomb net) jusqu'à la pointe
  let Yl = [];
  for (let y = -3.1 - R.range(1.2, 2.0); y > -D + 1.2; y -= R.range(1.5, 2.5)) Yl.push({ y });
  for (const L of S.ledges) { const y = -3.1 - L.t * (D - 3.1); Yl.push({ y: y + 0.3, ledge: true }, { y: y - 0.3, ledge: true }); }
  // un rang ordinaire trop près d'un rang de corniche s'efface (le surplomb reste net), puis deux rangs ordinaires trop proches
  Yl = Yl.filter((a) => a.ledge || !Yl.some((b) => b.ledge && Math.abs(b.y - a.y) < 0.4)).sort((a, b) => b.y - a.y);
  Yl = Yl.filter((a, i) => i === 0 || a.ledge || Yl[i - 1].y - a.y >= 0.35);
  const Y = [0, -0.3, -1.0, -2.0, -3.1, ...Yl.map((a) => a.y).filter((y) => y < -3.4), -D];
  const ring = Y.map((y, j) => loop.map((p) => {
    const t = clamp((-y - 3.1) / (D - 3.1), 0, 1), last = j === Y.length - 1, f0 = last ? 0.03 : stUnderScale(S, t, Math.atan2(p.z - cz, p.x - cx));
    // rocher flottant : la masse contient ses boîtes de collision (stFloatRock : 88 % du demi-côté jusqu'à 5,2 m sous le dessus, 60 % jusqu'à 8,5 m)
    const f = S.firm && !last ? Math.max(f0, y > -5.6 ? 0.96 : y > -8.9 ? 0.7 : 0) : f0;
    // relief : nul au bord du dessus (le bord des collisions), ressaut sous la lèvre, bosses et creux qui grandissent vers le bas, arêtes vives
    // (bruit en crêtes) dans la masse
    const nv = N.fbm(p.s / per, -y / 60, Math.max(4, Math.round(per / 6)), 4, 3) - 0.5, amp = (y === 0 ? 0 : y > -0.5 ? 0.12 : lerp(0.5, 1.6, t)) * (S.firm ? 0.4 : 1);
    const rg = y < -3 ? (0.45 - Math.abs(2 * N.fbm(p.s / per + 0.37, -y / 23, Math.max(6, Math.round(per / 3.5)), 6, 2) - 1)) * S.crag * lerp(0.5, 1.2, t) : 0;
    // grosses bosses et creux (une dizaine de mètres) : la masse n'est pas un cône régulier
    const Kl = Math.max(3, Math.round(per / 10)), lump = y < -3 ? (N.fbm(p.s / per + 0.31, -y / 13, Kl, 3, 2) - 0.5) * 2 * lerp(0.6, 2.6, t) * S.lumpy * smoothstep(-3, -6, y) : 0;
    let d = (y === 0 ? 0 : y > -0.5 ? -0.12 : 0.15) + nv * 2 * amp + rg + lump, fe = f;
    // île praticable : jusqu'à 21 m sous le dessus, la roche ne dépasse jamais le bord du dessus : on ne voit pas de corniche où se laisser tomber
    // (rien n'est solide hors des boîtes), et ni celui qui tombe ni sa caméra de mort (plan de mort à -14 m, puis 9 m de descente : 08-player.js)
    // ne traversent la roche ; les lobes ne sortent qu'en dessous. Plus haut, ce qui dépasserait rentre d'autant (une bosse devient un creux) :
    // la paroi reste irrégulière
    if (!I.nocol) { const k = smoothstep(-21, -27, y0 + y); if (f > 1) fe = lerp(1 - (f - 1) * 0.6, f, k); if (d > 0.15) d = lerp(0.15 - (d - 0.15) * 0.7, d, k); }
    if (S.firm && y > -8.9) d = Math.max(d, 0.15); // rocher flottant : rien ne rentre devant ses boîtes de collision
    const px = p.x + p.nx * d, pz = p.z + p.nz * d;
    return [cx + (px - cx) * fe, y0 + y + (j > 0 && !last ? (N.fbm(p.s / per, j / 7, Math.max(4, Math.round(per / 9)), 2, 2) - 0.5) * 0.5 : 0), cz + (pz - cz) * fe];
  }));
  const nL = loop.length, nR = Y.length, norm = [];
  for (let j = 0; j < nR; j++) for (let k = 0; k < nL; k++) {
    const a = ring[j][(k + 1) % nL], b = ring[j][(k + nL - 1) % nL], c = ring[Math.min(nR - 1, j + 1)][k], d = ring[Math.max(0, j - 1)][k];
    const tx = a[0] - b[0], ty = a[1] - b[1], tz = a[2] - b[2], vx = c[0] - d[0], vy = c[1] - d[1], vz = c[2] - d[2];
    let nx = ty * vz - tz * vy, ny = tz * vx - tx * vz, nz = tx * vy - ty * vx;
    const p = loop[k]; if (nx * p.nx + nz * p.nz < 0 && j < nR - 1) { nx = -nx; ny = -ny; nz = -nz; }
    const l = hyp3(nx, ny, nz) || 1; norm.push([nx / l, ny / l, nz / l]);
  }
  M.save().local(1); M.cls = 1; M.aoFn = null;
  const B = M.buf('strata', cx, y0 - D / 2, cz), ids = [];
  for (let j = 0; j < nR; j++) for (let k = 0; k < nL; k++) {
    const q = ring[j][k], y = Y[j], n = norm[j * nL + k], h = N.fbm(loop[k].s / per, j / 9, 8, 2, 2);
    M.tint = stRockTint(y, 0.9 + (h - 0.5) * 0.3); // mousse et herbe qui débordent sous la lèvre, roche plus claire au soleil, plus sombre en profondeur
    ids.push(M.v(B, q[0], q[1], q[2], n[0], n[1], n[2], loop[k].s * S.band, stBandV(S, q, y0, cx, cz)));
  }
  for (let j = 0; j < nR - 1; j++) for (let k = 0; k < nL; k++) {
    const a = ids[j * nL + k], b = ids[j * nL + (k + 1) % nL], c = ids[(j + 1) * nL + (k + 1) % nL], d = ids[(j + 1) * nL + k];
    M.quadI(B, a, b, c, d); // face vers l'extérieur (l'île est à gauche du sens de parcours)
  }
  M.restore();
  stUnderParts(ring, Y, per, S, R, y0, D, cx, cz, !!I.nocol);
  return O;
}
/* Coordonnée v des strates (m) au point q : couches inclinées (pendage de l'île) et d'épaisseur propre */
var stBandV = (S, q, y0, cx, cz) => (q[1] - y0 + S.dip[0] * (q[0] - cx) + S.dip[1] * (q[2] - cz)) * S.band;
/* Teinte de la roche à la hauteur y sous le dessus (et v : variation du grain) : mousse sous la lèvre, plus claire au soleil, plus sombre et
   froide en profondeur */
function stRockTint(y, v) {
  const top = smoothstep(-1.4, -0.1, y), deep = smoothstep(-6, -26, y);
  return [lerp(lerp(1, 0.84, deep), ST.moss[0], top) * v, lerp(lerp(0.97, 0.86, deep), ST.moss[1], top) * v, lerp(lerp(0.92, 0.9, deep), ST.moss[2], top) * v].map((c) => sl(c));
}
/* Stalactites qui pendent de la masse (de tailles très inégales, plus nombreuses sous une île trapue ; sous une île qui se partage, une grande
   pointe sous chaque lobe), blocs incrustés et éclats de roche qui flottent autour : le dessous d'une île n'est pas une seule pointe.
   ring, Y : les rangs de la masse (coordonnées du monde). Sans collision, donc jamais là où l'on joue : sous une île praticable, rien ne dépasse
   le bord du dessus jusqu'à 22 m plus bas (comme la masse : chute et caméra de mort, voir stIsland) ; autour d'un rocher flottant, rien dans la
   bande des tirs (au-dessus de y = -2). Rien sous les îlots du décor du ciel (des cailloux de quelques pixels, jamais écartés) */
function stUnderParts(ring, Y, per, S, R, y0, D, cx, cz, nocol) {
  if (nocol && !S.firm) return;
  const M = DECOR, nR = Y.length, nL = ring[0].length, tOf = (j) => (-Y[j] - 3.1) / (D - 3.1);
  const mid = (j) => { let x = 0, z = 0; for (const q of ring[j]) { x += q[0]; z += q[2]; } return [x / nL, z / nL]; };
  // dans le contour du dessus (pair-impair) ; une île praticable garde ses pièces dedans jusqu'à 22 m sous le dessus, même dans un angle rentrant
  const top = ring[0], inTop = (x, z) => { let c = false; for (let i = 0, k = nL - 1; i < nL; k = i++) { const a = top[i], b = top[k]; if ((a[2] > z) !== (b[2] > z) && x < ((b[0] - a[0]) * (z - a[2])) / (b[2] - a[2]) + a[0]) c = !c; } return c; };
  const safe = (x, y, z) => nocol || y < -22 || inTop(x, z);
  const js = []; for (let j = 0; j < nR - 1; j++) { const t = tOf(j); if (t > 0.18 && t < 0.9 && (!S.firm || y0 + Y[j] < -2.8)) js.push(j); }
  if (!js.length) return;
  M.save().local(1); M.cls = 1; M.aoFn = null;
  // stalactite au point k du rang j : racine enfoncée dans la masse (son anneau reste dedans), un peu sous le rang ; rayon r0, longueur L,
  // légère inclinaison vers l'extérieur
  const stal = (j, k, r0, L) => {
    const a = ring[j][k], [mx, mz] = mid(j), rl = hyp(a[0] - mx, a[2] - mz) || 1, ox = (a[0] - mx) / rl, oz = (a[2] - mz) / rl;
    const rx = a[0] - ox * r0 * 1.3, rz = a[2] - oz * r0 * 1.3, ry = a[1] - r0 * 0.1, lean = R.range(0, 0.28) * L, K = 6 + Math.floor(R() * 3), ph = R() * TAU;
    const V = [0, 0.12, 0.3, 0.5, 0.7, 0.86, 1], B = M.buf('strata', rx, ry - L / 2, rz), pts = [];
    for (const v of V) for (let q = 0; q <= K; q++) { // K + 1 colonnes : la dernière double la première (raccord de la texture)
      const ang = ph + (q / K) * TAU + v * R.range(-0.4, 0.4), w = v === 1 ? 0.02 : (1 - Math.pow(v, 1.2) * 0.96) * (1 + R.range(-0.16, 0.16));
      const cxv = rx + ox * lean * Math.pow(v, 1.6), czv = rz + oz * lean * Math.pow(v, 1.6);
      pts.push([cxv + Math.cos(ang) * r0 * w, ry - v * L, czv + Math.sin(ang) * r0 * w]);
    }
    for (let vi = 0; vi < V.length; vi++) pts[vi * (K + 1) + K] = pts[vi * (K + 1)];
    if (!pts.every((p) => safe(p[0], p[1], p[2]))) return;
    const ids = [], C = K + 1;
    for (let vi = 0; vi < V.length; vi++) for (let q = 0; q <= K; q++) {
      const qq = q % K, p = pts[vi * C + q], pa = pts[vi * C + (qq + 1) % K], pb = pts[vi * C + (qq + K - 1) % K], pc = pts[Math.min(V.length - 1, vi + 1) * C + qq], pd = pts[Math.max(0, vi - 1) * C + qq];
      const tx = pa[0] - pb[0], ty = pa[1] - pb[1], tz = pa[2] - pb[2], vx = pc[0] - pd[0], vy = pc[1] - pd[1], vz = pc[2] - pd[2]; // le long du tour, vers le bas : normale sortante
      let nx = ty * vz - tz * vy, ny = tz * vx - tx * vz, nz = tx * vy - ty * vx; const l = hyp3(nx, ny, nz) || 1;
      M.tint = stRockTint(p[1] - y0, R.range(0.84, 1.04));
      ids.push(M.v(B, p[0], p[1], p[2], nx / l, ny / l, nz / l, (q / K) * TAU * r0 * S.band, stBandV(S, p, y0, cx, cz)));
    }
    for (let vi = 0; vi < V.length - 1; vi++) for (let q = 0; q < K; q++) M.quadI(B, ids[vi * C + q], ids[vi * C + q + 1], ids[(vi + 1) * C + q + 1], ids[(vi + 1) * C + q]); // même sens que la masse
    // haut fermé (au cas où l'anneau de la racine affleure) : un éventail tourné vers le haut
    M.tint = stRockTint(ry - y0, 0.9); const cap = M.v(B, rx, ry + r0 * 0.2, rz, 0, 1, 0, 0, stBandV(S, [rx, ry, rz], y0, cx, cz));
    const rim = []; for (let q = 0; q <= K; q++) { const p = pts[q]; rim.push(M.v(B, p[0], p[1], p[2], 0, 1, 0, (q / K) * TAU * r0 * S.band, stBandV(S, p, y0, cx, cz))); }
    for (let q = 0; q < K; q++) M.tri(B, cap, rim[q + 1], rim[q]);
  };
  // trois familles : dents courtes et larges, pointes moyennes, longues aiguilles
  const n = Math.min(9, Math.max(1, Math.round((per / 22) * S.pend + R.range(-0.5, 1.5))));
  for (let i = 0; i < n; i++) {
    const j = R.pick(js), k = Math.floor(R() * nL), a = ring[j][k], [mx, mz] = mid(j), rl = hyp(a[0] - mx, a[2] - mz), fam = R();
    if (rl < 1.2) continue;
    const r0 = clamp(rl * (fam < 0.3 ? R.range(0.18, 0.3) : fam < 0.75 ? R.range(0.1, 0.22) : R.range(0.05, 0.12)), 0.4, 5);
    stal(j, k, r0, r0 * (fam < 0.3 ? R.range(1.3, 2.2) : fam < 0.75 ? R.range(2.4, 4.0) : R.range(4.5, 7.5)) + R.range(0, 2));
  }
  // île qui se partage : une grande pointe sous chaque lobe (vers les deux tiers de la masse, au sommet du lobe), qui descend presque aussi bas
  // que la pointe principale : la masse finit en deux ou trois pointes de plus
  if (S.split) for (let m = 0; m < S.split.k; m++) {
    const tt = R.range(0.56, 0.68), j = js.reduce((b, i) => (Math.abs(tOf(i) - tt) < Math.abs(tOf(b) - tt) ? i : b), js[0]);
    const th = (TAU * m - S.split.ph - S.twist * tOf(j) * 0.5) / S.split.k;
    let k = 0, best = 9;
    for (let i = 0; i < nL; i++) { const q = ring[0][i], e = Math.atan2(q[2] - cz, q[0] - cx) - th, d = Math.abs(Math.atan2(Math.sin(e), Math.cos(e))); if (d < best) { best = d; k = i; } }
    const a = ring[j][k], [mx, mz] = mid(j), rl = hyp(a[0] - mx, a[2] - mz), r0 = clamp(rl * R.range(0.24, 0.34), 0.8, 5);
    if (rl > 1.2) stal(j, k, r0, r0 * 1.2 + (D + Y[j]) * R.range(0.55, 0.95));
  }
  // blocs incrustés : des rochers à demi enfoncés dans la masse, qui la rendent bosselée. Sous une île praticable, jusqu'à 22 m sous le dessus,
  // un bloc ne dépasse pas le bord du dessus (on l'enfonce d'autant) ; autour d'un rocher flottant, aucun dans la bande des tirs
  const nb = Math.min(10, Math.round(per / 16 + R.range(0, 2)));
  for (let i = 0; i < nb; i++) {
    const j = R.pick(js), k = Math.floor(R() * nL), a = ring[j][k], [mx, mz] = mid(j), rl = hyp(a[0] - mx, a[2] - mz) || 1;
    const s = clamp(rl * R.range(0.1, 0.24), 0.8, 4.5), ox = (a[0] - mx) / rl, oz = (a[2] - mz) / rl, rx = s * R.range(0.9, 1.6), ry = s * R.range(0.55, 1.1), rz = s * R.range(0.7, 1.0);
    const e = 1.2 * Math.max(rx, ry, rz) + 0.3 * ry; // portée du bloc autour du point du rang (bosses, inclinaison et décalage de rockMesh compris)
    if (S.firm && a[1] + e > -2) continue;
    let cin = s * 0.55;
    if (!nocol && a[1] + e > -22) {
      const q = top[k]; cin = Math.max(cin, e - Math.max(0, (q[0] - a[0]) * ox + (q[2] - a[2]) * oz));
      let ok = true; for (let m = 0; m < 8 && ok; m++) ok = inTop(a[0] - ox * cin + Math.cos((m * TAU) / 8) * e, a[2] - oz * cin + Math.sin((m * TAU) / 8) * e);
      if (!ok) continue; // dans un angle rentrant du contour : il en sortirait
    }
    if (e - cin < 0.15 * e) continue; // presque tout dans la masse : on ne le verrait pas
    // retourné (rotZ), le rocher descend de 0,75 · ry sous son origine (rockMesh le pose sur le sol) : on le remonte d'autant
    M.save().move(a[0] - ox * cin, a[1] + ry * 0.75, a[2] - oz * cin).rotY(R() * TAU).rotZ(Math.PI + R.range(-0.4, 0.4)); M.tint = stRockTint(a[1] - y0, R.range(0.84, 1.02));
    rockMesh(M, R, rx, ry, rz, 5 + Math.floor(R() * 4), 8, 6, 'strata', false); // taillé de facettes : pas un galet
    M.restore();
  }
  // éclats : de la roche détachée qui flotte sous la pointe ou à côté de la masse, sur le côté seulement loin sous le dessus (plus bas que la
  // caméra de mort : on ne croit pas pouvoir y sauter) ; sous un rocher flottant, seulement sous sa pointe
  const deep = js.filter((j) => y0 + Y[j] < -26), ne = Math.min(5, Math.round(per / 40 + R.range(0, 1.6)));
  for (let i = 0; i < ne; i++) {
    const under = S.firm || !deep.length || R() < 0.35, j = R.pick(under ? js : deep), k = Math.floor(R() * nL), a = ring[j][k], [mx, mz] = mid(j), rl = hyp(a[0] - mx, a[2] - mz) || 1;
    const s = clamp(Math.sqrt(per) * R.range(0.08, 0.2), 0.4, 2.2), g = R.range(0.84, 1.02);
    const x = under ? mx + R.range(-2, 2) : a[0] + ((a[0] - mx) / rl) * R.range(1.5, 4.5), z = under ? mz + R.range(-2, 2) : a[2] + ((a[2] - mz) / rl) * R.range(1.5, 4.5);
    const y = under ? y0 - D - R.range(2, 7) : a[1] - R.range(-1, 3);
    if (y + s * 1.5 > (nocol ? -2 : -22)) continue; // pas de collision : jamais à hauteur d'homme, dans un couloir de tir, ni où l'on tombe
    M.save().move(x, y, z).rotY(R() * TAU).rotX(R.range(-0.5, 0.5)); M.tint = stRockTint(y - y0, g);
    rockMesh(M, R, s * R.range(0.8, 1.5), s * R.range(0.5, 1.0), s * R.range(0.6, 1.0), 5 + Math.floor(R() * 4), 7, 5, 'strata', false);
    M.restore();
  }
  M.restore();
}
/* Rocher flottant : une petite île sans prise (son dessus est au-dessus des têtes), posée dans le vide entre deux îles pour couper les vues
   d'un bout à l'autre de l'archipel. r : [x0, x1, z0, z1] (multiples de 0,5 m), top : hauteur du dessus. Coins abattus ; collisions
   (balles, lignes de vue) en deux boîtes qui restent dans la roche : la falaise, puis la masse qui se resserre */
function stFloatRock(r, top, depth, seed) {
  const [x0, x1, z0, z1] = r, w = x1 - x0, d = z1 - z0;
  stIsland({ rects: [[x0 + 0.5, x1 - 0.5, z0, z1], [x0, x1, z0 + 0.5, z1 - 0.5]], depth, seed, y: top, nocol: true, firm: true });
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  // deux boîtes par étage, aux coins abattus comme le dessus : rien ne dépasse de la roche visible (sa masse les contient : firm)
  DECOR.col(cx - w * 0.44, cx + w * 0.44, top - 5.2, top, cz - d * 0.44 + 0.55, cz + d * 0.44 - 0.55, 'concrete');
  DECOR.col(cx - w * 0.44 + 0.55, cx + w * 0.44 - 0.55, top - 5.2, top, cz - d * 0.44, cz + d * 0.44, 'concrete');
  DECOR.col(cx - w * 0.3, cx + w * 0.3, top - 8.5, top - 5.2, cz - d * 0.3 + 0.3, cz + d * 0.3 - 0.3, 'concrete');
  DECOR.col(cx - w * 0.3 + 0.3, cx + w * 0.3 - 0.3, top - 8.5, top - 5.2, cz - d * 0.3, cz + d * 0.3, 'concrete');
}

/* ---------- Ponts suspendus ---------- */
/* Pont le long de axis ('x' ou 'z'), centré sur c (l'autre coordonnée), du bord d'une île (a0) au bord de l'autre (a1), largeur w entre les
   murs invisibles (3 m : trois files de nœuds si c est un centre de case n + 0,5 ; 4 m si c est entier). Rend la hauteur du tablier. */
function stBridge(axis, c, a0, a1, w = 3) {
  const L = a1 - a0, sag = Math.min(0.5, 0.1 + L * 0.024), M = DECOR, R = rngOf(Math.round(c * 37 + a0 * 13 + 101));
  BRIDGES.push({ axis, c, a0, a1, w });
  const yAt = (a) => (a <= a0 || a >= a1 ? 0 : -sag * 4 * ((a - a0) / L) * (1 - (a - a0) / L));
  const at = (u, y, a) => (axis === 'z' ? [c + u, y, a] : [a, y, c + u]); // u : écart à l'axe, a : abscisse le long du pont
  const box3 = (u0, u1, y0, y1, b0, b1) => (axis === 'z' ? [c + u0, c + u1, y0, y1, b0, b1] : [b0, b1, y0, y1, c + u0, c + u1]);
  // collisions : le tablier en tronçons d'un mètre (des marches de quelques centimètres), qui dépasse de 0,6 m sur chaque île
  for (let b = a0 - 0.6; b < a1 + 0.6 - 1e-6; b += 1) {
    const e = Math.min(b + 1, a1 + 0.6), y = yAt((b + e) / 2), q = box3(-w / 2, w / 2, y - 0.25, y, b, e);
    DECOR.col(q[0], q[1], q[2], q[3], q[4], q[5], 'wood');
  }
  // murs invisibles au-dessus du vide (les cordes et les filets retiennent ; trop hauts pour un saut) : ni couverts, ni obstacles aux grenades
  for (const sd of [-1, 1]) { const q = box3(sd < 0 ? -w / 2 - 0.1 : w / 2, sd < 0 ? -w / 2 : w / 2 + 0.1, -sag - 0.6, 2.2, a0, a1); COL.push({ x0: q[0], x1: q[1], y0: q[2], y1: q[3], z0: q[4], z1: q[5], m: 'wood', ray: false, noRay: true, inv: true }); }
  // planches (teintes inégales, quelques-unes plus sombres ou de travers), sur deux longerons ; leur dessus est 2,5 cm au-dessus du tablier
  // de collision : à chaque bout, posées sur l'île, elles affleuraient exactement le sol (y = 0) et scintillaient avec lui
  M.save().local(1); M.cls = 0;
  for (let a = a0 - 0.45; a < a1 + 0.45; a += 0.26) {
    const y = yAt(a + 0.1), k = R.range(0.8, 1.08), dk = R.chance(0.08) ? 0.7 : 1;
    M.color([ST.wood[0] * k * dk, ST.wood[1] * k * dk, ST.wood[2] * k * dk]);
    M.save().move(...at(R.range(-0.04, 0.04), y - 0.035, a + 0.11)).rotY((axis === 'z' ? 0 : Math.PI / 2) + R.range(-0.02, 0.02));
    M.box('wood', w + 0.16, 0.06, 0.22, { bevel: 0.01 }); M.restore();
  }
  M.color([0.62, 0.52, 0.42]);
  for (const u of [-w / 2 + 0.25, w / 2 - 0.25]) {
    const pts = []; for (let i = 0; i <= 16; i++) { const a = lerp(a0 - 0.5, a1 + 0.5, i / 16); pts.push(at(u, yAt(a) - 0.16, a)); }
    M.sweep('wood', [[-0.08, -0.1], [0.08, -0.1], [0.08, 0.1], [-0.08, 0.1]], pts);
  }
  M.restore();
  // poteaux aux quatre coins (sur les îles, hors de la largeur du tablier : ils ne gênent pas le passage), cordes, suspentes et filets
  const posts = [];
  for (const end of [0, 1]) for (const sd of [-1, 1]) {
    const a = end ? a1 + 0.35 : a0 - 0.35, u = sd * (w / 2 + 0.16), p = at(u, 0, a);
    M.save().move(p[0], 0, p[2]).color([0.6, 0.48, 0.36]); M.cls = 0; M.boxB('wood', -0.11, 0.11, 0, 1.45, -0.11, 0.11, { bevel: 0.02 }); M.restore();
    DECOR.col(p[0] - 0.12, p[0] + 0.12, 0, 1.45, p[2] - 0.12, p[2] + 0.12, 'wood');
    posts.push({ end, sd, p });
  }
  M.save().local(1).color(ST.rope); M.cls = 1;
  for (const sd of [-1, 1]) {
    const u = sd * (w / 2 + 0.06), top = [], low = [];
    for (let i = 0; i <= 20; i++) {
      const a = lerp(a0 - 0.35, a1 + 0.35, i / 20), t = (a - a0) / L, droop = 4 * clamp(t, 0, 1) * (1 - clamp(t, 0, 1));
      top.push(at(u, yAt(a) + 1.32 - droop * 0.22, a)); low.push(at(u, yAt(a) + 0.62 - droop * 0.08, a));
    }
    M.tube('rope', 0.032, top, 6); M.tube('rope', 0.022, low, 5);
    // suspentes tous les 0,9 m environ, de la main courante au tablier
    const n = Math.max(2, Math.round(L / 0.9));
    for (let i = 1; i < n; i++) { const a = lerp(a0, a1, i / n), t = (a - a0) / L, droop = 4 * t * (1 - t); M.tube('rope', 0.012, [at(u, yAt(a) - 0.02, a), at(u, yAt(a) + 1.32 - droop * 0.22, a)], 4); }
    // filet entre le tablier et la corne basse : on voit que le bord retient
    const B = M.buf('net', ...at(u, 0.3, (a0 + a1) / 2)), ids = [];
    for (let i = 0; i <= 12; i++) {
      const a = lerp(a0, a1, i / 12), t = (a - a0) / L, droop = 4 * t * (1 - t), yb = yAt(a) - 0.02, yt = yAt(a) + 0.62 - droop * 0.08, nn = axis === 'z' ? [sd, 0, 0] : [0, 0, sd];
      const pb = at(u, yb, a), pt = at(u, yt, a);
      ids.push(M.v(B, pb[0], pb[1], pb[2], ...nn, a, yb), M.v(B, pt[0], pt[1], pt[2], ...nn, a, yt));
    }
    for (let i = 0; i < 12; i++) { const a = ids[i * 2], b = ids[i * 2 + 2], cc = ids[i * 2 + 3], d = ids[i * 2 + 1]; M.quadI(B, a, b, cc, d); M.quadI(B, a, d, cc, b); }
  }
  // haubans : du sommet de chaque poteau à un piquet planté 1,6 m en arrière sur l'île
  for (const P of posts) {
    const a = P.end ? a1 + 1.95 : a0 - 1.95, s = at(P.sd * (w / 2 + 0.5), 0.05, a);
    M.tube('rope', 0.028, [[P.p[0], 1.4, P.p[2]], [(P.p[0] + s[0]) / 2, 0.68, (P.p[2] + s[2]) / 2], s], 5);
    M.save().move(s[0], 0, s[2]).color([0.5, 0.4, 0.3]); M.cyl('wood', 0.06, 0.32, 6, { r1: 0.045 }); M.restore();
    LINES.push({ k: 'hauban', a: [P.p[0], 1.4, P.p[2]], b: s });
  }
  M.restore();
  return yAt;
}

/* ---------- Objets ---------- */
/* Colonne de ruine en pierre : socle, fût cannelé, chapiteau ; h : hauteur ; broken : fût cassé en biseau (sans chapiteau). Collision du fût. */
PF.stColumn = (h = 4, broken = false, seed = 1) => prefab(`stColumn${h}_${broken ? 1 : 0}_${seed}`, (M, P) => {
  const R = rngOf(seed * 31 + 5); void P;
  M.color(ST.stone).local(1);
  M.boxB('stone', -0.48, 0.48, 0, 0.32, -0.48, 0.48, { bevel: 0.03 });
  const hs = broken ? h * R.range(0.45, 0.8) : h - 0.62;
  M.save().move(0, 0.32, 0); M.cyl('ashlar', 0.34, hs, 16, { r1: 0.3, caps: broken ? 'b' : 'bt' }); M.restore();
  if (broken) { M.save().move(0, 0.32 + hs, 0).rotZ(R.range(0.25, 0.45)); M.cyl('ashlar', 0.3, 0.12, 16, { r1: 0.05, caps: 't' }); M.restore(); }
  else { M.boxB('stone', -0.44, 0.44, h - 0.3, h, -0.44, 0.44, { bevel: 0.03 }); M.save().move(0, h - 0.3, 0); M.cyl('stone', 0.3, -0.2, 16, { r1: 0.4, caps: '' }); M.restore(); }
  M.col(-0.42, 0.42, 0, broken ? 0.32 + hs : h, -0.42, 0.42, 'concrete');
});
/* Bloc de pierre taillée (tombé d'une ruine) : couvert bas */
PF.stBlock = (w = 1.4, h = 0.9, d = 0.8, seed = 1) => prefab(`stBlock${w}_${h}_${d}_${seed}`, (M) => {
  const R = rngOf(seed * 17 + 1);
  M.color([ST.stone[0] * R.range(0.9, 1.02), ST.stone[1] * R.range(0.9, 1.02), ST.stone[2] * R.range(0.9, 1.02)]).local(1);
  M.boxB('ashlar', -w / 2, w / 2, 0, h, -d / 2, d / 2, { bevel: 0.05 });
  M.col(-w / 2, w / 2, 0, h, -d / 2, d / 2, 'concrete');
});
/* Rocher : bloc de roche stratifiée irrégulier (rockMesh), collision de sa boîte resserrée ; s : taille (m), squash : aplatissement */
PF.stRock = (s = 1.6, seed = 1, squash = 0.75) => prefab(`stRock${s}_${seed}_${squash}`, (M) => {
  const R = rngOf(seed * 13 + 7);
  M.color([R.range(0.86, 1), R.range(0.82, 0.94), R.range(0.76, 0.88)]).local(1);
  rockMesh(M, R, s * 0.62, s * 0.62 * squash, s * 0.55, 2, 8, 5, 'strata');
  M.col(-s * 0.5, s * 0.5, 0, s * 0.62 * squash * 1.7, -s * 0.44, s * 0.44, 'concrete');
});
/* Grappe de cristaux plantée au sol (bleu pâle, lumineux par eux-mêmes) ; h : hauteur du plus grand */
PF.stCrystals = (h = 1.6, seed = 1) => prefab(`stCrystals${h}_${seed}`, (M) => {
  const R = rngOf(seed * 19 + 11), n = 3 + Math.floor(R() * 3);
  M.local(1); M.cls = 1;
  for (let i = 0; i < n; i++) {
    const hh = h * (i ? R.range(0.35, 0.75) : 1), r = hh * 0.16, a = R() * TAU, d = i ? R.range(0.15, 0.4) : 0;
    M.save().move(Math.cos(a) * d, -0.05, Math.sin(a) * d).rotY(R() * TAU).rotZ(i ? R.range(-0.5, 0.5) : R.range(-0.12, 0.12)).rotX(i ? R.range(-0.4, 0.4) : 0);
    M.color([R.range(0.85, 1), R.range(0.92, 1), 1]);
    M.cyl('crystalSt', r, hh * 0.78, 6, { r1: r * 0.9, caps: 'b' }); M.save().move(0, hh * 0.78, 0); M.cyl('crystalSt', r * 0.9, hh * 0.22, 6, { r1: 0.001, caps: '' }); M.restore();
    M.restore();
  }
  M.cls = 0; M.col(-h * 0.2, h * 0.2, 0, h * 0.85, -h * 0.2, h * 0.2, 'glass');
});
/* Aiguille rocheuse (h : hauteur, r : rayon à la base) : grand bloc de roche stratifiée qui coupe les vues d'une île à l'autre ; collision
   de son fût, resserrée */
PF.stSpire = (h = 5, r = 1.4, seed = 1) => prefab(`stSpire${h}_${r}_${seed}`, (M) => {
  const R = rngOf(seed * 29 + 3);
  M.color([R.range(0.88, 1), R.range(0.84, 0.95), R.range(0.78, 0.88)]).local(1);
  rockMesh(M, R, r, h / 1.75, r * R.range(0.8, 1.0), 3, 10, 7, 'strata');
  // un second bloc accolé, plus bas : la silhouette n'est pas un fuseau régulier
  M.save().move(r * 0.7, 0, r * 0.3).rotY(R() * TAU); rockMesh(M, R, r * 0.7, h * 0.32, r * 0.65, 2, 8, 5, 'strata'); M.restore();
  M.col(-r * 0.78, r * 0.78, 0, h * 0.92, -r * 0.7, r * 0.7, 'concrete');
});
/* Pierre levée (menhir) : bloc dressé, légèrement penché, de la pierre des ruines */
PF.stMenhir = (h = 3.6, w = 1.2, seed = 1) => prefab(`stMenhir${h}_${w}_${seed}`, (M) => {
  const R = rngOf(seed * 23 + 9), d = w * 0.62;
  M.color([ST.stone[0] * R.range(0.84, 0.96), ST.stone[1] * R.range(0.84, 0.95), ST.stone[2] * R.range(0.82, 0.92)]).local(1);
  M.save().rotZ(R.range(-0.04, 0.04)).rotX(R.range(-0.03, 0.03));
  M.boxB('stone', -w / 2, w / 2, 0, h * 0.86, -d / 2, d / 2, { bevel: 0.08 });
  M.save().move(0, h * 0.86, 0).scl(1, 1, d / w); M.cyl('stone', w * 0.5, h * 0.14, 8, { r1: w * 0.26, caps: 't' }); M.restore();
  M.restore();
  M.col(-w / 2, w / 2, 0, h, -d / 2, d / 2, 'concrete');
});
/* Stèle : grande dalle de pierre dressée à une tête de pont (elle arrête la vue d'un bout à l'autre de l'archipel, on la contourne), un
   cristal serti sur chaque face ; w : largeur, h : hauteur, d : épaisseur. Collision de la dalle */
PF.stStele = (w = 4.6, h = 3.6, d = 0.9, seed = 1) => prefab(`stStele${w}_${h}_${d}_${seed}`, (M) => {
  const R = rngOf(seed * 43 + 7), k = R.range(0.86, 0.96);
  M.local(1);
  M.color([ST.stone[0] * 0.8, ST.stone[1] * 0.78, ST.stone[2] * 0.74]);
  M.boxB('stone', -w / 2 - 0.18, w / 2 + 0.18, 0, 0.3, -d / 2 - 0.18, d / 2 + 0.18, { bevel: 0.05 });
  M.color([ST.stone[0] * k, ST.stone[1] * k, ST.stone[2] * k * 0.97]);
  M.boxB('ashlar', -w / 2, w / 2, 0.3, h - 0.5, -d / 2, d / 2, { bevel: 0.06 });
  M.boxB('ashlar', -w / 2 + 0.4, w / 2 - 0.4, h - 0.5, h, -d / 2 + 0.06, d / 2 - 0.06, { bevel: 0.06 });
  M.color([0.9, 1, 1]); M.cls = 1;
  for (const sz of [-1, 1]) { M.save().move(0, h * 0.6, sz * (d / 2 - 0.02)).rotX(sz * Math.PI / 2); M.cyl('crystalSt', 0.3, 0.08, 6, { r1: 0.22 }); M.restore(); }
  M.cls = 0;
  M.col(-w / 2, w / 2, 0, h, -d / 2, d / 2, 'concrete');
});
/* Trilithe : deux pierres levées et leur linteau (on passe dessous) */
PF.stTrilithon = (seed = 1) => prefab(`stTrilithon${seed}`, (M) => {
  const R = rngOf(seed * 41 + 5), H = 3.4, w = 1.0, d = 0.7, gap = 1.9;
  M.local(1);
  for (const sx of [-1, 1]) {
    const x = sx * (gap / 2 + w / 2);
    M.color([ST.stone[0] * R.range(0.86, 0.96), ST.stone[1] * R.range(0.85, 0.95), ST.stone[2] * R.range(0.82, 0.92)]);
    M.boxB('stone', x - w / 2, x + w / 2, 0, H, -d / 2, d / 2, { bevel: 0.07 });
    M.col(x - w / 2, x + w / 2, 0, H, -d / 2, d / 2, 'concrete');
  }
  M.color([ST.stone[0] * 0.92, ST.stone[1] * 0.9, ST.stone[2] * 0.86]);
  M.boxB('stone', -gap / 2 - w - 0.15, gap / 2 + w + 0.15, H, H + 0.62, -d / 2 - 0.04, d / 2 + 0.04, { bevel: 0.07 });
  M.col(-gap / 2 - w - 0.15, gap / 2 + w + 0.15, H, H + 0.62, -d / 2 - 0.04, d / 2 + 0.04, 'concrete');
});
/* Tente d'expédition : toile tendue sur un faîtage (deux pans jusqu'au sol, pignons fermés), à la couleur du camp ; arrête les balles et les
   soldats (w : largeur, L : longueur, h : faîtage). Les deux pans sont des toiles simulées (Maker.toile), tenues au faîtage, au sol et aux
   pignons */
PF.stTent = (col, w = 3.2, L = 4.2, h = 2.4) => prefab(`stTent${col.join(',')}_${w}_${L}_${h}`, (M) => {
  M.color(col).local(1); M.cls = 0;
  const x = w / 2, z = L / 2;
  for (const s of [-1, 1]) M.toile(4, 3, (u, v) => [s * x * (1 - v), v * h, lerp(-z, z, u)], { uL: L, vL: hyp(x, h), side: [s * h, x, 0], play: 0.1 });
  M.color([col[0] * 0.85, col[1] * 0.85, col[2] * 0.85]);
  for (const sz of [-1, 1]) M.tri3('canvas', [-x, 0, sz * z], [x, 0, sz * z], [0, h, sz * z], [0, 0, sz]);
  M.color([0.5, 0.4, 0.3]); for (const sz of [-1, 1]) { M.save().move(0, 0, sz * (z + 0.05)); M.cyl('wood', 0.04, h + 0.2, 6); M.restore(); }
  M.col(-x * 0.7, x * 0.7, 0, h * 0.75, -z, z, 'dirt');
});
/* Pile de caisses : deux en bas, une dessus (couvert haut) */
PF.stCrateStack = (seed = 1) => prefab(`stCrateStack${seed}`, (M) => {
  const R = rngOf(seed * 7 + 2), s = 1.1;
  M.place(PF.crate(s), -0.58, 0, R.range(-0.05, 0.05), R.range(-0.08, 0.08)); M.place(PF.crate(s), 0.58, 0, R.range(-0.05, 0.05), R.range(-0.08, 0.08));
  M.place(PF.crate(1.0), R.range(-0.3, 0.3), s, 0, R.range(-0.4, 0.4));
});

}catch(e){HOOKS.missing['02yi-stratus-kit.js']=String(e&&e.message||e)}
/* ===== 02q-jardin.js ===== */
try{
/* ==========================================================================
   JARDIN : outils de paysagiste pour Modern (et les cartes de plein air à venir).
   - Splat : peintre de la carte de répartition du sol (pelouse, gravier, dalles, humus) avec des formes (rectangle, disque,
     capsule, chemin, polygone) à bords irréguliers.
   - Sol : plan de la carte et trous des plans d'eau (triangulés avec leurs contours).
   ========================================================================== */
class Splat {
  constructor() {
    const S = SPLAT; this.S = S; this.W = S.w * S.ppm; this.H = S.d * S.ppm; this.px = new Float32Array(this.W * this.H * 4); this.N = makeNoise(2917);
  }
  /* d(x, z) : distance signée au bord (positive dedans) ; boîte englobante [x0, x1, z0, z1] ; soft : largeur du fondu ; k : force */
  paint(ch, box, d, soft = 0.6, k = 1, wob = 1.1) {
    const S = this.S, W = this.W, H = this.H, N = this.N, ppm = S.ppm;
    const i0 = Math.max(0, Math.floor((box[0] - soft - 1 - S.x0) * ppm)), i1 = Math.min(W - 1, Math.ceil((box[1] + soft + 1 - S.x0) * ppm));
    const j0 = Math.max(0, Math.floor((box[2] - soft - 1 - S.z0) * ppm)), j1 = Math.min(H - 1, Math.ceil((box[3] + soft + 1 - S.z0) * ppm));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = S.x0 + (i + 0.5) / ppm, z = S.z0 + (j + 0.5) / ppm;
      const dd = d(x, z) + (N.fbm(x * 0.09, z * 0.09, 32, 32, 3) - 0.5) * wob, w = smoothstep(-soft, soft, dd) * k, o = (j * W + i) * 4;
      if (w > this.px[o + ch]) this.px[o + ch] = w;
    }
  }
  rect(ch, x0, x1, z0, z1, soft, k, wob) { this.paint(ch, [x0, x1, z0, z1], (x, z) => Math.min(x - x0, x1 - x, z - z0, z1 - z), soft, k, wob); }
  disc(ch, cx, cz, r, soft, k, wob) { this.paint(ch, [cx - r, cx + r, cz - r, cz + r], (x, z) => r - hyp(x - cx, z - cz), soft, k, wob); }
  /* ellipse tournée de rot */
  ellipse(ch, cx, cz, rx, rz, rot, soft, k, wob) {
    const c = Math.cos(rot), s = Math.sin(rot), m = Math.max(rx, rz);
    this.paint(ch, [cx - m, cx + m, cz - m, cz + m], (x, z) => { const dx = x - cx, dz = z - cz, a = (dx * c + dz * s) / rx, b = (-dx * s + dz * c) / rz; return (1 - hyp(a, b)) * Math.min(rx, rz); }, soft, k, wob);
  }
  capsule(ch, ax, az, bx, bz, r, soft, k, wob) {
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1;
    this.paint(ch, [Math.min(ax, bx) - r, Math.max(ax, bx) + r, Math.min(az, bz) - r, Math.max(az, bz) + r], (x, z) => { const t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1); return r - hyp(x - ax - dx * t, z - az - dz * t); }, soft, k, wob);
  }
  /* chemin : suite de segments de demi-largeur r (pts [[x, z], ...]) */
  path(ch, pts, r, soft, k, wob) { for (let i = 0; i < pts.length - 1; i++) this.capsule(ch, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r, soft, k, wob); }
  /* polygone [[x, z], ...] : distance signée au contour */
  poly(ch, pts, soft, k, wob) {
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [x, z] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    this.paint(ch, [x0, x1, z0, z1], (x, z) => polyDist(pts, x, z), soft, k, wob);
  }
  /* Part de la couche ch (0 à 3) au point (x, z) */
  at(ch, x, z) { const S = this.S, i = Math.floor((x - S.x0) * S.ppm), j = Math.floor((z - S.z0) * S.ppm); return i < 0 || j < 0 || i >= this.W || j >= this.H ? 0 : this.px[(j * this.W + i) * 4 + ch]; }
  /* Texture de répartition : r, g, b = couches 1 à 3, a = salissure (terre battue sur la pelouse) */
  finish(dirt = 0.15) {
    const { W, H, px, N, S } = this, out = new Uint8Array(W * H * 4);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const o = (j * W + i) * 4, x = S.x0 + (i + 0.5) / S.ppm, z = S.z0 + (j + 0.5) / S.ppm, n2 = N.fbm(x * 0.21 + 3.1, z * 0.21, 32, 32, 2);
      let r = px[o], g = px[o + 1], b = px[o + 2]; const k = Math.max(r, g); b *= 1 - k; const tot = r + g + b; if (tot > 1) { r /= tot; g /= tot; b /= tot; }
      out[o] = Math.round(clamp(r, 0, 1) * 255); out[o + 1] = Math.round(clamp(g, 0, 1) * 255); out[o + 2] = Math.round(clamp(b, 0, 1) * 255);
      out[o + 3] = Math.round(clamp(dirt * (0.4 + n2 * 0.9) + px[o + 3] * (0.35 + n2 * 0.5), 0, 1) * 255);
    }
    const t = new THREE.DataTexture(out, W, H, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
  }
}
/* Distance signée d'un point à un polygone (positive à l'intérieur) */
function polyDist(P, x, z) {
  let inside = false, dm = 1e9;
  for (let a = 0, b = P.length - 1; a < P.length; b = a++) {
    const ax = P[a][0], az = P[a][1], bx = P[b][0], bz = P[b][1];
    if ((az > z) !== (bz > z) && x < ((bx - ax) * (z - az)) / (bz - az) + ax) inside = !inside;
    const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1), d = hyp(x - ax - dx * t, z - az - dz * t);
    if (d < dm) dm = d;
  }
  return inside ? dm : -dm;
}
/* Point du contour le plus proche de (x, z) */
function polyNearest(P, x, z) {
  let best = null, dm = 1e9;
  for (let a = 0, b = P.length - 1; a < P.length; b = a++) {
    const ax = P[a][0], az = P[a][1], bx = P[b][0], bz = P[b][1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1, t = clamp(((x - ax) * dx + (z - az) * dz) / L2, 0, 1);
    const qx = ax + dx * t, qz = az + dz * t, d = hyp(x - qx, z - qz); if (d < dm) { dm = d; best = [qx, qz]; }
  }
  return best;
}
/* Sol de la carte : un plan couvrant la zone, percé des contours de plans d'eau (holes : [[[x, z], ...], ...]) */
function floralGroundMesh(splat, holes = []) {
  MAT.ground = groundMat(splat, [SPLAT.x0, SPLAT.z0, SPLAT.w, SPLAT.d], GROUND_FLOREAL);
  const M = DECOR; WORLD.force = 'g'; M.save().color([0.52, 0.52, 0.52]).local(1); M.aoFn = null;
  const X = 330;
  if (!holes.length) { M.plane('ground', 2 * X, 2 * X, 1, 1); }
  else {
    const outer = [[-X, -X], [X, -X], [X, X], [-X, X]], pts = outer.concat(...holes);
    const tri = THREE.ShapeUtils.triangulateShape(outer.map((p) => new THREE.Vector2(p[0], p[1])), holes.map((h) => h.map((p) => new THREE.Vector2(p[0], p[1]))));
    const B = M.buf('ground', 0, 0, 0), ids = pts.map((p) => M.v(B, p[0], 0, p[1], 0, 1, 0, p[0], -p[1]));
    for (const t of tri) {
      const a = pts[t[0]], b = pts[t[1]], c = pts[t[2]], cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (cr > 0) M.tri(B, ids[t[0]], ids[t[2]], ids[t[1]]); else M.tri(B, ids[t[0]], ids[t[1]], ids[t[2]]); // face vers le haut : sens horaire dans le plan (x, z)
    }
  }
  M.restore(); WORLD.force = null;
}

/* ---------- Haies, topiaires, mobilier ---------- */
/* Haie taillée : bloc de feuillage opaque. h : hauteur ; en dessous de 0,8 m elle n'a pas de collision (bordure de massif). o : tint, collide, bevel */
function hedge(x0, x1, z0, z1, h = 1.8, o = {}) {
  const solid = o.collide !== undefined ? o.collide : h >= 0.8;
  box('hedge', x0, x1, 0, h, z0, z1, { tint: o.tint || [0.86, 0.96, 0.78], collide: solid, bevel: o.bevel !== undefined ? o.bevel : 0.14, m: 'leaf', ao: o.ao, uv: o.uv });
}
/* Topiaire en pot de pierre : cône, boule, spirale ou cube de buis, h hauteur du feuillage */
PF.topiary = (kind = 'cone', s = 1) => prefab(`topiary_${kind}_${s}`, (M) => {
  const prof = {
    cone: [[0.52, 0], [0.5, 0.2], [0.44, 0.7], [0.3, 1.4], [0.14, 1.95], [0, 2.2]],
    ball: [[0.2, 0], [0.5, 0.18], [0.66, 0.5], [0.7, 0.8], [0.6, 1.15], [0.34, 1.4], [0, 1.5]],
    spiral: [[0.45, 0], [0.55, 0.25], [0.36, 0.55], [0.5, 0.85], [0.3, 1.2], [0.4, 1.5], [0.18, 1.85], [0.2, 2.1], [0, 2.3]],
    cube: [[0.5, 0], [0.62, 0.05], [0.62, 1.0], [0.5, 1.12], [0, 1.15]],
  }[kind];
  M.save().local(1); M.color([0.9, 0.86, 0.78]); M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(0, 0.4, y));
  M.lathe('ashlar', [[0.42, 0], [0.46, 0.04], [0.4, 0.1], [0.36, 0.34], [0.46, 0.4], [0.46, 0.46], [0, 0.46]], 12, { sharp: 0.3 });
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0.4, 1.6, y)); M.color([0.84, 0.96, 0.76]);
  M.save().move(0, 0.44, 0); M.lathe('hedge', prof.map(([r, y]) => [r * s, y * s]), 14, { uR: 0.9, sharp: 0.7 }); M.restore();
  M.restore();
  M.col(-0.34 * s, 0.34 * s, 0, 0.44 + prof[prof.length - 1][1] * s * 0.85, -0.34 * s, 0.34 * s, 'leaf');
});
/* Banc de parc : lattes de bois sur flancs de fonte, dossier. Face vers +z */
PF.gbench = () => prefab('gbench', (M) => {
  M.save().local(1); M.cls = 1;
  M.color([0.18, 0.2, 0.18]); for (const x of [-0.75, 0.75]) { M.boxB('steel', x - 0.04, x + 0.04, 0, 0.46, -0.22, 0.2, { bevel: 0.01 }); M.boxB('steel', x - 0.04, x + 0.04, 0.46, 0.9, -0.24, -0.2, { bevel: 0.01 }); M.boxB('steel', x - 0.05, x + 0.05, 0.43, 0.468, -0.24, 0.24, { bevel: 0.01 }); } // traverse sous les lattes (pas à leur niveau)
  M.color([0.62, 0.42, 0.24]);
  for (let i = 0; i < 4; i++) M.boxB('wood', -0.85, 0.85, 0.47, 0.5, -0.2 + i * 0.1, -0.12 + i * 0.1, { bevel: 0.008 });
  for (let i = 0; i < 3; i++) M.boxB('wood', -0.85, 0.85, 0.58 + i * 0.12, 0.66 + i * 0.12, -0.25 - i * 0.015, -0.22 - i * 0.015, { bevel: 0.008 });
  M.restore(); M.col(-0.88, 0.88, 0, 0.5, -0.26, 0.22, 'wood');
});
/* Banc posé en (x, z), à la hauteur y, qui regarde le point (tx, tz) : la face avant du prefab est +z, donc rotation atan2(dx, dz). Tout banc se pose ainsi, jamais avec un angle écrit à la main (le miroir nord-sud de la carte les retournait) */
function benchAt(x, z, tx, tz, y = 0) { DECOR.place(PF.gbench(), x, y, z, Math.atan2(tx - x, tz - z)); }
/* Urne de pierre sur piédestal, avec sa plante (kind : sprite de PF.clump) */
PF.urn = (kind = 'roseP', atlas = 'leafB', s = 1) => prefab(`urn_${kind}_${s}`, (M) => {
  M.save().local(1).color([0.92, 0.88, 0.8]); M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(0, 0.5, y));
  M.lathe('ashlar', [[0.38, 0], [0.4, 0.06], [0.3, 0.12], [0.28, 0.5], [0.34, 0.56], [0.3, 0.64], [0.26, 0.74], [0.4, 0.9], [0.5, 1.02], [0.52, 1.1], [0.44, 1.12], [0.4, 1.0]], 14, { sharp: 0.4 });
  M.aoFn = null; M.color([0.3, 0.22, 0.14]); M.save().move(0, 1.0, 0); M.cyl('mulch', 0.43, 0.03, 12); M.restore(); M.restore();
  M.place(PF.clump(kind, atlas, 0.9 * s, 0.75 * s, 3, 3, { cls: 0 }), 0, 1.0, 0, 0);
  M.col(-0.4, 0.4, 0, 1.1, -0.4, 0.4, 'concrete');
});
/* Bassin circulaire de pierre à margelle, eau et jet central. o : tint, jet (0 à 1), pillar (vasque centrale) */
function basin(x, z, r = 2.4, o = {}) {
  const M = DECOR; M.save().move(x, 0, z).color(o.tint || [0.9, 0.86, 0.78]).local(1);
  M.aoFn = (px, py) => lerp(0.62, 1, smoothstep(0, 0.4, py));
  M.lathe('ashlar', [[r + 0.5, 0], [r + 0.5, 0.52], [r + 0.58, 0.55], [r + 0.58, 0.66], [r - 0.02, 0.66], [r - 0.02, 0.3], [0, 0.3]], 24, { sharp: 0.3, uR: 1.4 }); // fond du bassin, vu à travers l'eau
  M.aoFn = null;
  if (o.pillar !== false) {
    M.color([0.92, 0.88, 0.8]);
    M.lathe('ashlar', [[0, 0.3], [0.22, 0.3], [0.17, 0.5], [0.13, 1.3], [0.18, 1.38], [0.55, 1.45], [0.62, 1.55], [0.55, 1.58], [0.15, 1.56], [0.1, 1.8], [0.05, 1.85], [0, 1.86]], 14, { uR: 0.3 });
  }
  M.restore();
  pondAdd({ shape: 'disc', x, y: 0.5, z, r: r - 0.02, seg: 24, rings: 6, jet: o.jet !== undefined ? o.jet : 0.6, bed: 0.2, vis: 0.8, calm: 0.8, foam: 0.5, deep: [0.01, 0.045, 0.045], shallow: [0.04, 0.11, 0.1] });
  if (o.pillar !== false) pondAdd({ shape: 'disc', x, y: 1.56, z, r: 0.5, seg: 14, rings: 4, jet: 1, bed: 0.04, vis: 1, foam: 0.5 });
  const q = (r + 0.55) * 0.88; DECOR.col(x - q, x + q, 0, 0.66, z - q, z + q, 'concrete');
}
/* Mur de clôture de pierre claire, chaperon, pilastres tous les ~6 m et lierre. o : tint, ivy (densité), pil (écart des pilastres) */
function gardenWall(x0, x1, z0, z1, h = 3.2, o = {}) {
  const M = DECOR, along = x1 - x0 >= z1 - z0, tint = o.tint || [0.93, 0.88, 0.78];
  box('ashlar', x0, x1, 0, h, z0, z1, { tint, m: 'concrete', uv: 2.4 });
  box('ashlar', x0 - 0.12, x1 + 0.12, h, h + 0.16, z0 - 0.12, z1 + 0.12, { tint: [0.86, 0.82, 0.72], collide: false, bevel: 0.03 });
  const L = along ? x1 - x0 : z1 - z0, step = o.pil || 6, n = Math.max(1, Math.round(L / step));
  for (let i = 0; i <= n; i++) {
    const c = (along ? x0 : z0) + (L * i) / n, pa = 0.3;
    if (along) box('ashlar', c - pa, c + pa, 0, h + 0.5, z0 - 0.1, z1 + 0.1, { tint: [0.9, 0.85, 0.75], collide: false, bevel: 0.03 }); else box('ashlar', x0 - 0.1, x1 + 0.1, 0, h + 0.5, c - pa, c + pa, { tint: [0.9, 0.85, 0.75], collide: false, bevel: 0.03 });
    M.save().move(along ? c : (x0 + x1) / 2, h + 0.5, along ? (z0 + z1) / 2 : c).color([0.88, 0.84, 0.75]).local(1); M.lathe('ashlar', [[0.3, 0], [0.34, 0.04], [0.26, 0.1], [0.16, 0.12], [0.2, 0.22], [0.2, 0.34], [0.1, 0.46], [0, 0.48]], 10, { sharp: 0.3 }); M.restore();
  }
}

/* ---------- Plans d'eau à bord de pierre ---------- */
/* Trous du sol : contours des plans d'eau creusés (rempli par pondBasin, lu par la construction du sol) */
var FLO_HOLES = [];
/* Murs invisibles qui retiennent les soldats hors de l'eau : bandes de 0,5 m couvrant l'intérieur du contour (rétréci de inset) */
function waterWalls(poly, inset = 0.1, cell = 0.5, y0 = -2, y1 = 1.4, skip) {
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [x, z] of poly) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const runs = []; // par rangée : [début, fin] en x
  for (let z = Math.floor(z0 / cell) * cell; z < z1; z += cell) {
    let a = null; const row = [];
    for (let x = Math.floor(x0 / cell) * cell; x <= x1 + cell; x += cell) {
      const inside = polyDist(poly, x + cell / 2, z + cell / 2) > inset && !(skip && skip(x + cell / 2, z + cell / 2));
      if (inside && a === null) a = x; else if (!inside && a !== null) { row.push([a, x]); a = null; }
    }
    runs.push({ z, row });
  }
  // fusion verticale des rangées identiques
  const open = new Map();
  const flush = (key, o) => { COL.push({ x0: o.x0, x1: o.x1, y0, y1, z0: o.z0, z1: o.z1, m: 'concrete', ray: false, noRay: true, inv: true }); open.delete(key); };
  for (const { z, row } of runs) {
    const keys = new Set(row.map((r) => r[0] + ':' + r[1]));
    for (const [k, o] of [...open]) if (!keys.has(k)) flush(k, o);
    for (const [a, b] of row) { const k = a + ':' + b, o = open.get(k); if (o) o.z1 = z + cell; else open.set(k, { x0: a, x1: b, z0: z, z1: z + cell }); }
  }
  for (const [k, o] of [...open]) flush(k, o);
}
/* Bassin creusé de contour poly où l'on patauge : trou dans le sol, margelle de pierre qui descend jusqu'au fond (bed), fond de gravier visible à
   travers l'eau, eau (pondAdd, wade : le fond des pieds est à bed, voir POOLS dans 02m-water.js). Pas de mur invisible : on entre dans l'eau.
   o : wl (niveau de l'eau sous le sol, m), bed (fond), tint, shallow / deep (teintes de l'eau), alpha, jet, foam, flow, depth, mat (matière de la margelle), walls (murs invisibles autour, sinon aucun) */
function pondBasin(poly, o = {}) {
  const wl = o.wl !== undefined ? o.wl : -0.12, bed = o.bed !== undefined ? o.bed : wl - 0.38, M = DECOR, mat = o.mat || 'ashlar';
  FLO_HOLES.push(poly.map((p) => p.slice()));
  // margelle : face verticale qui descend du sol au fond, sombre et moussue (vue de l'intérieur comme de l'extérieur)
  M.save().color(o.tint || [0.55, 0.58, 0.5]).world(1); M.cls = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dz = b[1] - a[1], L = hyp(dx, dz) || 1;
    M.quad(mat, [a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], bed, b[1]], [a[0], bed, a[1]], [dz / L, 0, -dx / L]);
    M.quad(mat, [a[0], 0, a[1]], [b[0], 0, b[1]], [b[0], bed, b[1]], [a[0], bed, a[1]], [-dz / L, 0, dx / L]);
  }
  M.restore();
  // fond : gravier clair, triangulé comme le trou du sol
  const tri = THREE.ShapeUtils.triangulateShape(poly.map((p) => new THREE.Vector2(p[0], p[1])), []);
  M.save().color(o.bedTint || [0.36, 0.34, 0.3]).world(1); M.cls = 0; M.aoFn = null;
  const B = M.buf('gravelpath', 0, 0, 0), ids = poly.map((p) => M.v(B, p[0], bed, p[1], 0, 1, 0, p[0], -p[1]));
  for (const t of tri) {
    const a = poly[t[0]], b = poly[t[1]], c = poly[t[2]], cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (cr > 0) M.tri(B, ids[t[0]], ids[t[2]], ids[t[1]]); else M.tri(B, ids[t[0]], ids[t[1]], ids[t[2]]);
  }
  M.restore();
  if (o.walls) waterWalls(poly, o.inset !== undefined ? o.inset : 0.1, 0.5, -2, 1.4, o.skip);
  return pondAdd(Object.assign({ shape: 'poly', poly, y: wl, wade: bed, alpha: o.alpha !== undefined ? o.alpha : 0.9, depth: o.depth || 1.2, foam: o.foam !== undefined ? o.foam : 0.5, deep: o.deep || [0.012, 0.06, 0.056], shallow: o.shallow || [0.04, 0.13, 0.11], scatter: o.scatter || [0.014, 0.07, 0.06], cell: o.cell || 0.45 }, o.pond || {}, o.jet !== undefined ? { jet: o.jet, jc: o.jc } : {}, o.flow ? { flow: o.flow } : {}));
}

/* ---------- Semis de plantes ---------- */
/* Sème n plantes dans le rectangle rect [x0, x1, z0, z1] : les tirages que free(x, z) refuse sont ignorés (les tirages sont toujours
   consommés : la suite ne dépend pas des refus). pick(R) renvoie [prefab, échelle, hauteur] ; y : hauteur du sol */
function plantBed(R, rect, n, pick, free = () => true, y = 0) {
  for (let i = 0; i < n; i++) {
    const x = R.range(rect[0], rect[1]), z = R.range(rect[2], rect[3]), ry = R() * TAU, sc = pick(R);
    if (!free(x, z) || !plantFits(sc[0], x, z, y, sc[1] || 1)) continue;
    DECOR.place(sc[0], x, y + (sc[2] || 0), z, ry, sc[1] ? { s: sc[1] } : undefined);
  }
}

/* Une plante qui a une collision (tronc, touffe de bambou) ne se pose pas dans une collision déjà là (un autre tronc, un banc, un mur) : son
   cercle (le plus grand rayon de ses boîtes, à l'échelle s) ne touche aucune boîte pleine entre 0,1 et 1,8 m au-dessus de son pied
   (decor.js relevait les troncs qui s'entraient). Sans collision (herbes, fleurs), elle se pose où on veut. */
function plantFits(pf, x, z, y = 0, s = 1) {
  if (!pf || !pf.cols || !pf.cols.length) return true;
  let r = 0; for (const c of pf.cols) r = Math.max(r, hyp(Math.max(-c.x0, c.x1), Math.max(-c.z0, c.z1)));
  r *= s;
  return !COL.some((c) => !c.ray && !c.inv && !c.prop && c.y1 > y + 0.1 && c.y0 < y + 1.8 && c.x0 < x + r && c.x1 > x - r && c.z0 < z + r && c.z1 > z - r);
}

/* Ruban d'eau : contour d'un cours d'eau le long de la ligne pts [[x, z], ...] de largeurs w (nombre ou tableau) */
function ribbonPoly(pts, w) {
  const L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], l = hyp(dx, dz) || 1, hw = (Array.isArray(w) ? w[i] : w) / 2;
    L.push([pts[i][0] - dz / l * hw, pts[i][1] + dx / l * hw]); Rr.push([pts[i][0] + dz / l * hw, pts[i][1] - dx / l * hw]);
  }
  return L.concat(Rr.reverse());
}
/* Lanterne de pierre japonaise (tōrō) : socle, fût, chambre à feu, chapeau, boule */
PF.toro = (s = 1) => prefab(`toro_${s}`, (M) => {
  M.save().local(1).color([0.72, 0.72, 0.68]); M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(0, 0.5, y));
  M.boxB('ashlar', -0.3 * s, 0.3 * s, 0, 0.12 * s, -0.3 * s, 0.3 * s, { bevel: 0.02 }); M.save().move(0, 0.12 * s, 0); M.cyl('ashlar', 0.1 * s, 0.7 * s, 8); M.restore();
  M.boxB('ashlar', -0.24 * s, 0.24 * s, 0.82 * s, 0.9 * s, -0.24 * s, 0.24 * s, { bevel: 0.02 });
  M.color([0.78, 0.74, 0.62]); M.boxB('ashlar', -0.16 * s, 0.16 * s, 0.9 * s, 1.18 * s, -0.16 * s, 0.16 * s, { bevel: 0.01 });
  M.color([1, 0.8, 0.5]); M.boxB('lamp', -0.1 * s, 0.1 * s, 0.95 * s, 1.12 * s, -0.165 * s, 0.165 * s); M.boxB('lamp', -0.165 * s, 0.165 * s, 0.95 * s, 1.12 * s, -0.1 * s, 0.1 * s);
  M.color([0.7, 0.7, 0.66]); M.save().move(0, 1.18 * s, 0); M.lathe('ashlar', [[0.42 * s, 0], [0.4 * s, 0.05 * s], [0.12 * s, 0.22 * s], [0.06 * s, 0.28 * s], [0.1 * s, 0.32 * s], [0, 0.4 * s]], 4, { sharp: 0.3 }); M.restore();
  M.aoFn = null; M.restore(); M.col(-0.3 * s, 0.3 * s, 0, 1.55 * s, -0.3 * s, 0.3 * s, 'concrete');
});

/* Un point de pelouse est-il libre (ni allée, ni dalles, ni plan d'eau, ni boîte de collision) ? Sert au semis d'herbes et de fleurs */
function lawnFree(sp, x, z, holes) {
  if (sp.at(0, x, z) > 0.12 || sp.at(1, x, z) > 0.12) return false;
  for (const h of holes) if (polyDist(h, x, z) > -0.6) return false;
  for (const c of COL) if (!c.inv && !c.noRay && c.y1 > 0.2 && x > c.x0 - 0.3 && x < c.x1 + 0.3 && z > c.z0 - 0.3 && z < c.z1 + 0.3 && c.y0 < 1.2) return false;
  return true;
}
/* Touffes d'herbe, fleurs des prés et trèfles semés sur la pelouse libre de la zone rect [x0, x1, z0, z1] (n tirages) ; cls 3 : masquées au loin */
function lawnTufts(R, sp, rect, n, holes, skip = () => false) {
  const pick = (RR) => {
    const k = RR(), s = 1 + Math.floor(RR() * 4);
    if (k < 0.5) return [PF.clump('grass', 'leafB', 0.8, 0.7, 3, s, { cls: 3 }), RR.range(0.8, 1.5)];
    if (k < 0.72) return [PF.clump('meadow', 'leafB', 1.2, 0.6, 3, s, { cls: 3 }), RR.range(0.8, 1.4)];
    if (k < 0.86) return [PF.clump('clover', 'leafB', 0.8, 0.5, 3, s, { cls: 3 }), RR.range(0.8, 1.3)];
    return [PF.clump('grassT', 'leafB', 0.8, 1.0, 3, s, { cls: 3 }), RR.range(0.8, 1.3)];
  };
  plantBed(R, rect, n, pick, (x, z) => lawnFree(sp, x, z, holes) && !skip(x, z));
}

}catch(e){HOOKS.missing['02q-jardin.js']=String(e&&e.message||e)}
/* ===== 02w-jardins.js ===== */
try{
/* ==========================================================================
   LES JARDINS DE FLORÉAL, hors de la serre :
   - OUEST « Jardin japonais » : étang aux nénuphars, île au pavillon de thé, pont rouge arqué et passerelle en zigzag, lanternes de
     pierre, jardin sec, cerisiers, érables rouges, saule pleureur, bambous.
   - EST « Ravin des fougères » : ruisseau peu profond au pied de la serre, cascades de la falaise, fougères arborescentes ; le plateau des
     bambous (y = FL.high) auquel on monte par des escaliers de roche et par la passerelle de la canopée, avec son kiosque.
   - NORD ET SUD : labyrinthe de buis, roseraie et pergolas de glycines, pelouses et bosquets.
   ========================================================================== */
/* Toit à quatre pans (pavillons) : égout rectangulaire à y, faîte à y + h, débord ov */
function hipRoof(x0, x1, z0, z1, y, h, o = {}) {
  const M = DECOR, ov = o.ov !== undefined ? o.ov : 0.5, a0 = x0 - ov, a1 = x1 + ov, b0 = z0 - ov, b1 = z1 + ov, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, yt = y + h, mat = o.mat || 'slate';
  M.save().color(o.tint || [0.42, 0.46, 0.52]).world(1); M.cls = 0;
  const sx = h / ((a1 - a0) / 2 + 0.001), sz = h / ((b1 - b0) / 2 + 0.001);
  M.tri3(mat, [a0, y, b0], [a1, y, b0], [cx, yt, cz], [0, 1, -sz]); M.tri3(mat, [a1, y, b1], [a0, y, b1], [cx, yt, cz], [0, 1, sz]);
  M.tri3(mat, [a1, y, b0], [a1, y, b1], [cx, yt, cz], [sx, 1, 0]); M.tri3(mat, [a0, y, b1], [a0, y, b0], [cx, yt, cz], [-sx, 1, 0]);
  M.color(o.under || [0.3, 0.22, 0.15]).local(1);
  M.boxB('paintwood', a0, a1, y - 0.14, y, b0, b1, { bevel: 0.02 });
  M.restore();
  M.occ(a0, a1, y - 0.1, yt * 0.9 + y * 0.1, b0, b1, 0.9);
  DECOR.col(x0 - ov * 0.5, x1 + ov * 0.5, y - 0.14, y + 0.1, z0 - ov * 0.5, z1 + ov * 0.5, 'wood', true);
}
/* Poteau de bois : carré (s) de y0 à y1, avec collision étroite */
function post(x, z, y0, y1, s = 0.2, tint = [0.4, 0.28, 0.18], col = true) {
  box('paintwood', x - s / 2, x + s / 2, y0, y1, z - s / 2, z + s / 2, { tint, collide: col, bevel: 0.02, m: 'wood', ao: false });
}
/* Pin taillé en nuages (niwaki) : tronc tordu, étages de coussins d'aiguilles posés à plat */
PF.pine = (h = 4.5, seed = 1) => prefab(`pine_${h}_${seed}`, (M) => {
  const R = rngOf(seed * 211 + 19), path = [], N = 12, tw = R.range(0.5, 1.0);
  for (let i = 0; i <= N; i++) { const t = i / N; path.push([Math.sin(t * 3.2 + tw) * 0.45 * t, t * h * 0.8, Math.cos(t * 2.6 + tw) * 0.3 * t]); }
  M.save().color([0.5, 0.4, 0.34]).local(1); M.aoFn = (x, y) => lerp(0.62, 1, smoothstep(0, 1.2, y));
  M.sweep('bark', circleShape(1, 8), path, { scale: (t) => 0.2 * (1 + 0.8 * Math.pow(1 - t, 4)) * (1 - 0.6 * t), uAround: 0.6 }); M.aoFn = null; M.restore();
  M.save().cls = 0;
  const layers = [[0.34, 1.5], [0.5, 1.3], [0.66, 1.05], [0.82, 0.8], [0.97, 0.5]];
  for (const [t, rad] of layers) {
    const q = path[Math.min(N, Math.round(t * N))], ox = q[0] + R.range(-0.35, 0.35), oz = q[2] + R.range(-0.35, 0.35);
    for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + R(), d = rad * R.range(0.15, 0.7); M.color([R.range(0.8, 1), R.range(0.9, 1), R.range(0.8, 0.95)]); leafPatch(M, 'leafB', HERB.cedar, [ox + Math.cos(a) * d, q[1] + R.range(-0.08, 0.08), oz + Math.sin(a) * d], [R.range(-0.12, 0.12), 1, R.range(-0.12, 0.12)], rad * 1.7, R() * TAU, { up: 0.85, crown: [ox, q[1] - 0.5, oz, 1.0], w: [0.5, 0.5, 0.5, 0.5], ao: [0.75, 0.75, 0.75, 0.75] }); }
  }
  M.restore();
  M.occ(-1.4, 1.4, h * 0.3, h * 1.0, -1.4, 1.4, 0.45); M.col(-0.2, 0.2, 0, h * 0.5, -0.2, 0.2, 'wood');
});

/* ---------- Jardin japonais ---------- */
var JAPON_POND = [[-22.2, -1.5], [-22.6, -4.5], [-24.4, -7.2], [-27.5, -8.6], [-31.2, -8.2], [-34.0, -6.2], [-35.2, -3.0], [-35.0, 0.5], [-34.4, 4.0], [-32.2, 7.0], [-28.8, 8.6], [-25.4, 7.6], [-23.0, 4.8], [-22.2, 1.6]];
/* L'île est sur l'axe de la porte ouest de la serre (z = 0) : porte, sentier, pont rouge et pavillon sont alignés */
var JAPON_ISLE = { x: -29.1, z: 0, r: 3.2, y: 0.5 };
/* Rectangles praticables dans l'étang : pont rouge et ses appuis, pont droit de bois de la rive sud à l'île (x0, x1, z0, z1) */
var JAPON_WALK = [[-26.55, -21.55, -1.35, 1.35], [-30.1, -28.1, 3.0, 9.3]];
function florealJapon() {
  const M = DECOR, R = rngOf(6161), I = JAPON_ISLE, wl = -0.12;
  pondBasin(JAPON_POND, { wl, bed: -0.5, foam: 0.6, pond: { calm: 0.35, vis: 0.45, caus: 0.4 }, deep: [0.012, 0.05, 0.045], shallow: [0.04, 0.12, 0.1], scatter: [0.012, 0.06, 0.05] });
  // île : monticule de rocaille, dessus de mousse, enrochement
  M.save().move(I.x, 0, I.z).color([0.9, 0.9, 0.86]).world(1); M.lathe('rocaille', [[I.r + 0.18, -0.52], [I.r + 0.1, wl + 0.1], [I.r, 0.2], [I.r - 0.2, I.y - 0.02], [0, I.y - 0.02]], 14, { sharp: 0.5, uR: 1.2 });
  M.color([0.5, 0.58, 0.4]); M.save().move(0, I.y - 0.01, 0); M.lathe('mulch', [[0, 0], [I.r - 0.2, 0]], 14); M.restore(); M.restore();
  // île praticable : un octogone de trois boîtes (croix et carré), qui suit le disque sans que la rive d'eau soit marchable
  for (const [hx, hz] of [[0.92, 0.4], [0.4, 0.92], [0.72, 0.72]]) DECOR.col(I.x - I.r * hx, I.x + I.r * hx, 0, I.y, I.z - I.r * hz, I.z + I.r * hz, 'concrete');
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + R() * 0.2; M.place(PF.rockG(1 + (i % 9), R.range(0.5, 0.9), R.range(0.35, 0.6), R.range(0.5, 0.9)), I.x + Math.cos(a) * (I.r - 0.1), wl + 0.2, I.z + Math.sin(a) * (I.r - 0.1), R() * TAU, { nocol: true }); }
  // pavillon de thé : plateforme, quatre poteaux, toit à quatre pans
  const pa = [I.x - 1.95, I.x + 0.75, I.z - 1.55, I.z + 1.15]; // décalé vers le nord-ouest : le chemin de l'île (pont droit au sud, pont rouge à l'est) passe librement
  box('paintwood', pa[0] - 0.1, pa[1] + 0.1, I.y, I.y + 0.18, pa[2] - 0.1, pa[3] + 0.1, { tint: [0.45, 0.32, 0.22], bevel: 0.02, m: 'wood' });
  for (const x of [pa[0], pa[1]]) for (const z of [pa[2], pa[3]]) post(x, z, I.y + 0.18, I.y + 2.5, 0.2, [0.32, 0.2, 0.14]);
  hipRoof(pa[0], pa[1], pa[2], pa[3], I.y + 2.5, 1.5, { ov: 0.9 });
  M.save().color([0.9, 0.86, 0.78]).local(1); M.cls = 1; for (const [x0, x1, z0, z1] of [[pa[0], pa[1], pa[2], pa[2]], [pa[0], pa[0], pa[2], pa[3]]]) M.boxB('canvas', x0 - 0.02, x1 + 0.02, I.y + 0.5, I.y + 2.1, z0 - 0.02, z1 + 0.02); M.restore();
  M.place(PF.toro(0.8), I.x + 2.0, I.y, I.z - 1.9, 0.4); M.place(PF.pine(4.4, 3), I.x - 2.4, I.y, I.z + 1.3, 1.2); M.place(PF.tree('maple', 5.2, 2.2, 3, { th: 1.6, shape: 'spread' }), I.x - 0.6, I.y, I.z - 2.3, 0.4);
  // pont rouge : tablier arqué, garde-corps vermillon, posé à chaque bout sur un appui de pierre (sur l'île, un bloc au bord du monticule ;
  // sur la rive, un seuil qui avance sur l'eau). Le tablier s'arrêtait à 10 cm de la rive, au-dessus de l'eau : on tombait là au fond de
  // l'étang et l'on restait coincé sous le pont. Collision : les appuis, huit rampes qui suivent l'arc (deux droites passaient 12 cm sous
  // les lattes), et pour les tirs seulement, le tablier en seize tronçons
  const BW = 1.15, bx0 = I.x + I.r - 0.1, bx1 = -22.0, bz = I.z, ya = I.y + 0.06, ye = 0.08, yb = (t) => lerp(ya, ye, t) + 0.55 * Math.sin(Math.PI * t);
  box('ashlar', bx0 - 0.55, bx0, -0.3, ya, bz - BW - 0.2, bz + BW + 0.2, { tint: [0.74, 0.72, 0.66], bevel: 0.03 });
  box('ashlar', -22.5, -21.55, -0.3, ye, bz - BW - 0.2, bz + BW + 0.2, { tint: [0.74, 0.72, 0.66], bevel: 0.03 });
  for (let i = 0; i < 8; i++) { const t0 = i / 8, t1 = (i + 1) / 8; RAMPS.push({ x0: lerp(bx0, bx1, t0), x1: lerp(bx0, bx1, t1), z0: bz - BW, z1: bz + BW, axis: 'x', h0: yb(t0), h1: yb(t1) }); }
  for (let i = 0; i < 16; i++) { const t0 = i / 16, t1 = (i + 1) / 16; DECOR.col(lerp(bx0, bx1, t0), lerp(bx0, bx1, t1), Math.min(yb(t0), yb(t1)) - 0.18, Math.max(yb(t0), yb(t1)), bz - BW, bz + BW, 'wood', true); }
  M.save().color([0.78, 0.14, 0.1]).local(1); M.cls = 0;
  for (let i = 0; i < 14; i++) { const t0 = i / 14, t1 = (i + 1) / 14, xa = lerp(bx0, bx1, t0), xb = lerp(bx0, bx1, t1), ya = yb(t0), yy = yb(t1); M.quad('paintwood', [xa, ya, bz - BW], [xb, yy, bz - BW], [xb, yy, bz + BW], [xa, ya, bz + BW], [0, 1, 0]); M.quad('paintwood', [xa, ya - 0.18, bz - BW], [xa, ya, bz - BW], [xb, yy, bz - BW], [xb, yy - 0.18, bz - BW], [0, 0, -1]); M.quad('paintwood', [xa, ya - 0.18, bz + BW], [xb, yy - 0.18, bz + BW], [xb, yy, bz + BW], [xa, ya, bz + BW], [0, 0, 1]); }
  for (const sd of [-1, 1]) {
    const top = [], mid = []; for (let i = 0; i <= 8; i++) { const t = i / 8, x = lerp(bx0, bx1, t); top.push([x, yb(t) + 0.95, bz + sd * (BW - 0.02)]); mid.push([x, yb(t) + 0.45, bz + sd * (BW - 0.02)]); }
    M.tube('paintwood', 0.045, top, 6); M.tube('paintwood', 0.03, mid, 5);
    for (let i = 0; i <= 8; i++) { const t = i / 8, x = lerp(bx0, bx1, t); M.save().move(x, yb(t), bz + sd * (BW - 0.02)); M.cyl('paintwood', i % 4 === 0 ? 0.06 : 0.035, i % 4 === 0 ? 1.1 : 0.95, 6); if (i % 4 === 0) { M.save().move(0, 1.1, 0); M.cyl('paintwood', 0.08, 0.06, 8, { r1: 0.04 }); M.restore(); } M.restore(); }
  }
  M.restore();
  for (const sd of [-1, 1]) glassWall(bx0, bx1, -2, 3, bz + sd * (BW + 0.05) - 0.06, bz + sd * (BW + 0.05) + 0.06);
  // pont droit de bois, de la rive sud à l'île : tablier de planches en pente douce (une rampe), deux longerons, balustrade basse, piliers dans l'eau
  const wx = I.x, wz0 = I.z + I.r - 0.2, wz1 = 9.3, wy = (z) => lerp(I.y, 0.04, (z - wz0) / (wz1 - wz0));
  RAMPS.push({ x0: wx - 1.0, x1: wx + 1.0, z0: wz0, z1: wz1, axis: 'z', h0: I.y, h1: 0.04 });
  M.save().local(1).color([0.5, 0.38, 0.28]);
  for (let z = wz0; z < wz1 - 0.1; z += 0.6) { const y1 = wy(z), y2 = wy(Math.min(wz1, z + 0.55)); M.quad('wood', [wx - 1.0, y1, z], [wx + 1.0, y1, z], [wx + 1.0, y2, z + 0.55], [wx - 1.0, y2, z + 0.55], [0, 1, 0]); M.quad('wood', [wx - 1.0, y1 - 0.12, z], [wx + 1.0, y1 - 0.12, z], [wx + 1.0, y1, z], [wx - 1.0, y1, z], [0, 0, -1]); }
  M.color([0.36, 0.27, 0.2]);
  for (const sd of [-1, 1]) {
    M.tube('wood', 0.09, [[wx + sd * 0.95, wy(wz0) - 0.16, wz0], [wx + sd * 0.95, wy(wz1) - 0.16, wz1]], 6);
    const top = [], mid = []; for (let i = 0; i <= 8; i++) { const z = lerp(wz0, wz1, i / 8); top.push([wx + sd * 0.97, wy(z) + 0.85, z]); mid.push([wx + sd * 0.97, wy(z) + 0.45, z]); }
    M.tube('wood', 0.045, top, 6); M.tube('wood', 0.03, mid, 5);
    for (let i = 0; i <= 8; i++) { const z = lerp(wz0, wz1, i / 8); M.save().move(wx + sd * 0.97, wy(z) - 0.1, z); M.cyl('wood', 0.055, 1.0, 6); M.restore(); }
  }
  for (const z of [4.8, 6.9, 8.4]) for (const sd of [-1, 1]) { M.save().move(wx + sd * 0.8, -0.9, z); M.cyl('wood', 0.1, 1.1, 7); M.restore(); }
  M.restore();
  for (const sd of [-1, 1]) glassWall(wx + sd * 1.05 - 0.05, wx + sd * 1.05 + 0.05, -2, 3, wz0, wz1 + 0.4); // flancs du pont : on ne passe pas dessous
  // nénuphars et fleurs
  for (const [x, z, r, n, sd] of [[-31.5, -5.2, 2.6, 14, 4], [-26.4, 5.4, 1.5, 8, 5], [-33.2, 3.6, 1.7, 9, 6], [-25.5, -5.5, 1.8, 9, 7], [-32.2, 6.2, 1.5, 7, 8]]) M.place(PF.lilies(r, n, sd, 0.4), x, wl + 0.02, z, 0, { cls: 2 });
  // lanternes de pierre, rochers moussus, bambous, saule, cerisiers, érables
  for (const [x, z, s] of [[-21.4, -3.2, 1], [-21.4, 3.4, 1], [-26.6, -10.2, 1.1], [-34.2, -8.6, 0.9], [-30.5, 10.4, 1], [-35.4, 5.4, 0.9]]) M.place(PF.toro(s), x, 0, z, R() * TAU);
  rockPile(-22.4, -2.5, -23.5, -6.2, 0.05, 6, 91, 0.9); rockPile(-23.2, 4.2, -26.2, 7.4, 0.05, 6, 92, 0.9); rockPile(-34.2, -5.5, -32, -7.5, 0.05, 5, 93, 0.9);
  for (let z = -15; z <= 15; z += 3.7) M.place(PF.bamboo(7, 6.2 + (z % 3), Math.round(z * 5)), -36.1, 0, z, R() * TAU);
  M.place(PF.willow(8.5, 3.6, 2), -24.3, 0, 8.6, 0.6);
  for (const [x, z, k, h, sd] of [[-20.8, -10.4, 'cherry', 7, 1], [-27.2, -12.6, 'cherry', 7.5, 2], [-33.4, -11.2, 'cherryW', 7, 3], [-34.4, 7.5, 'cherry', 6.5, 4], [-23.8, 11, 'cherryW', 7, 5], [-31, 12, 'cherry', 7.2, 6], [-20.8, 7.2, 'cherry', 6.8, 7], [-35.5, -10.5, 'cherryW', 6.5, 8], [-33.8, 11.8, 'cherry', 6.8, 9]]) M.place(PF.tree(k, h, 3.4, sd, { shape: 'spread', th: 1.8 }), x, 0, z, R() * TAU);
  for (const [x, z, h, sd] of [[-22.2, -13.6, 6.5, 1], [-29, -14.4, 6.8, 2], [-35.9, -2.2, 6, 3], [-35.6, 2.6, 6.2, 4], [-22.4, 13, 6.4, 5], [-28.6, 13.6, 6.2, 6]]) M.place(PF.tree('maple', h, 2.8, sd, { shape: 'round', th: 1.6 }), x, 0, z, R() * TAU);
  M.place(PF.tree('ginkgo', 9, 2.4, 3, { shape: 'tall', th: 2.6 }), -19.6, 0, -14.5, 0.4); // à côté du banc de x = -22, pas dedans
  // sous-bois : azalées, fougères, hostas, iris et roseaux au bord de l'eau
  const edge = (x, z) => polyDist(JAPON_POND, x, z) < -0.6 && !JAPON_WALK.some((r) => x > r[0] - 0.8 && x < r[1] + 0.8 && z > r[2] - 0.8 && z < r[3] + 0.8) && !(x > -23.6 && Math.abs(z) < 1.6) && hyp(x - I.x, z - I.z) > I.r + 0.7;
  plantBed(R, [-37, -20.2, -16, 16], 260, (RR) => { const k = RR(); return k < 0.25 ? [PF.clump('azalea', 'leafB', 1.0, 0.9, 3, 1 + Math.floor(RR() * 5)), RR.range(0.9, 1.5)] : k < 0.5 ? [PF.fern('fernA', RR.range(0.9, 1.4), 1 + Math.floor(RR() * 6)), 1] : k < 0.7 ? [PF.rosette('hosta', 'leafB', 0.9, 7, 1 + Math.floor(RR() * 4)), RR.range(0.9, 1.3)] : k < 0.85 ? [PF.clump('iris', 'leafB', 0.9, 0.9, 3, 1 + Math.floor(RR() * 4)), RR.range(0.9, 1.2)] : [PF.clump('hydB', 'leafB', 0.9, 0.9, 3, 1 + Math.floor(RR() * 4)), RR.range(0.9, 1.3)]; }, (x, z) => polyDist(JAPON_POND, x, z) < -1.3 && !(x > -20.6 && Math.abs(z) < 2) && !(Math.abs(z) < 3 && x > -23));
  plantBed(R, [-36, -21.5, -9.6, 9.6], 150, (RR) => (RR() < 0.6 ? [PF.reeds(RR.range(1.5, 2.3), 1 + Math.floor(RR() * 6)), 1] : [PF.clump('iris', 'leafB', 0.9, 0.9, 3, 1 + Math.floor(RR() * 4)), 1.1]), (x, z) => { const d = polyDist(JAPON_POND, x, z); return d < -0.4 && d > -1.2 && edge(x, z) && !JAPON_WALK.some((r) => x > r[0] - 1 && x < r[1] + 1 && z > r[2] - 1 && z < r[3] + 1) && !(x > -23.6 && Math.abs(z) < 2.4) && hyp(x - I.x, z - I.z) > I.r + 0.8; });
  // jardin sec au nord : gravier ratissé, trois rochers
  box('ashlar', -36.6, -26.4, 0, 0.14, -15.6, -15.3, { tint: [0.8, 0.78, 0.72], collide: false }); box('ashlar', -36.6, -26.4, 0, 0.14, -11.3, -11.0, { tint: [0.8, 0.78, 0.72], collide: false });
  box('ashlar', -36.6, -36.3, 0, 0.14, -15.3, -11.3, { tint: [0.8, 0.78, 0.72], collide: false }); box('ashlar', -26.7, -26.4, 0, 0.14, -15.3, -11.3, { tint: [0.8, 0.78, 0.72], collide: false }); // entre les deux longs côtés
  for (const [x, z, a, b, c, sd] of [[-33.5, -13.5, 1.0, 0.8, 0.8, 21], [-30.8, -12.6, 0.7, 0.5, 0.6, 22], [-29.3, -14.3, 0.9, 0.7, 0.8, 23]]) M.place(PF.rockG(sd, a, b, c), x, 0.0, z, R() * TAU);
  M.place(PF.pine(3.6, 5), -35, 0, -14.4, 0.4);
}

/* ---------- Ravin des fougères et plateau des bambous ---------- */
/* Flancs d'une rampe isolée (x0..x1, z0..z1, axis, h0 -> h1) : murs invisibles qui suivent la pente, juste hors de la rampe, et main courante de fer.
   Les marches n'arrêtent que les tirs : sans cela, un soldat entre par le flanc au ras du sol et reste coincé sous la rampe. sides : 0 (x0 ou z0), 1 (x1 ou z1) ; col : teinte de la main courante */
function rampGuard(x0, x1, z0, z1, axis, h0, h1, sides = [0, 1], col) {
  const a0 = axis === 'x' ? x0 : z0, a1 = axis === 'x' ? x1 : z1, n = Math.max(2, Math.ceil((a1 - a0) / 0.6));
  for (const sd of sides) {
    const c = axis === 'x' ? (sd ? z1 : z0) : (sd ? x1 : x0), o = sd ? 0.1 : -0.1, e = sd ? 0.3 : -0.3; // le mur invisible est à 0,3 m du bord : un soldat qui longe la rampe ne s'y frotte pas, et l'interstice est trop étroit pour s'y glisser
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, top = Math.max(lerp(h0, h1, t0), lerp(h0, h1, t1)) + 1.0, u0 = lerp(a0, a1, t0), u1 = lerp(a0, a1, t1);
      if (axis === 'x') glassWall(u0, u1, 0, top, c + e, c + e + o); else glassWall(c + e, c + e + o, 0, top, u0, u1);
    }
    railing(c, c, 0, a0, a1, axis, [h0, h1], col);
  }
}
var RAVIN_STREAM = [[26.2, -6.0], [25.0, -5.0], [23.8, -3.0], [23.2, -0.5], [24.0, 2.0], [25.0, 4.0], [24.2, 6.5], [23.0, 9.0], [23.4, 12.0], [24.4, 14.8]];
var PLATEAU = { x0: 27.8, x1: 37, z0: -13.2, z1: 13.2 };
function florealRavin() {
  const M = DECOR, R = rngOf(7373), { x0, x1, z0, z1 } = PLATEAU, y = FL.high;
  box('rocaille', x0, x1, 0, y, z0, z1, { tint: [1, 0.97, 0.93], m: 'concrete', uv: 3.2, skip: 'Y' });
  M.save().color([0.8, 0.72, 0.6]).world(1); M.cls = 1; M.quad('mulch', [x0, y + 0.005, z0], [x1, y + 0.005, z0], [x1, y + 0.005, z1], [x0, y + 0.005, z1], [0, 1, 0]); M.restore();
  rockFace({ x: x0, out: -1, z0, z1, y0: 0, y1: y, seed: 31, bulge: 0.8 });
  for (const [a, b] of [[x0, 28.7], [32.3, x1]]) { rockFace({ axis: 'x', z: z0, out: -1, x0: a, x1: b, y0: 0, y1: y, seed: 32, bulge: 0.7 }); rockFace({ axis: 'x', z: z1, out: 1, x0: a, x1: b, y0: 0, y1: y, seed: 33, bulge: 0.7 }); }
  rockPile(x0 - 0.6, z0 + 0.5, x0 - 0.6, z1 - 0.5, 0.05, 22, 41, 1.1);
  // deux cascades de la falaise
  for (const [z, w] of [[-6, 1.7], [7, 1.3]]) {
    M.save().color([0.9, 0.86, 0.8]).world(1); M.boxB('rocaille', x0 - 0.7, x0 + 0.1, y - 0.7, y - 0.2, z - w / 2 - 0.3, z + w / 2 + 0.3, { bevel: 0.06 }); M.restore();
    waterfallAdd(x0 - 0.62, y - 0.2, 0.0, z - w / 2, z + w / 2, 1, [1.0, 1.06, 1.04]);
  }
  // ruisseau peu profond : lit de gravier visible à travers l'eau claire, qui coule vers le sud
  pondAdd({ shape: 'poly', poly: ribbonPoly(RAVIN_STREAM, [2.4, 2.8, 2.4, 2.2, 2.4, 2.8, 2.4, 2.2, 2.4, 3.2]), y: 0.04, wade: 0, probeAt: [23.6, 1.7, 3.0], alpha: 0.72, depth: 0.4, foam: 0.7, flow: [0, 0.32], deep: [0.03, 0.08, 0.06], shallow: [0.06, 0.15, 0.11], scatter: [0.02, 0.08, 0.06], cell: 0.4 });
  pondAdd({ shape: 'poly', poly: ribbonPoly([[26.4, 6.8], [25.4, 6.9], [24.6, 6.7]], [1.8, 1.6, 1.5]), y: 0.04, wade: 0, alpha: 0.72, depth: 0.4, foam: 0.7, flow: [-0.3, 0], deep: [0.03, 0.08, 0.06], shallow: [0.06, 0.15, 0.11], scatter: [0.02, 0.08, 0.06], cell: 0.4 });
  // escaliers de roche vers le plateau (nord et sud), garde-corps au bord de la falaise (sauf à la passerelle)
  ramp(29, 32, -22, z0, 'z', 0, y, 'flagstone', [0.8, 0.76, 0.68], { mat: 'rocaille' }); ramp(29, 32, z1, 22, 'z', y, 0, 'flagstone', [0.8, 0.76, 0.68], { mat: 'rocaille' });
  rampGuard(29, 32, -22, z0, 'z', 0, y); rampGuard(29, 32, z1, 22, 'z', y, 0);
  for (const [a, b] of [[z0 + 0.3, -1.4], [1.4, z1 - 0.3]]) { railing(x0 + 0.1, x0 + 0.1, y, a, b, 'z'); glassWall(x0 - 0.05, x0 + 0.25, y, y + 1.0, a, b); }
  // sol du sommet : allées de dalles, kiosque de thé
  M.save().color([0.9, 0.86, 0.78]).world(1); M.cls = 1;
  for (const [a, b, c, d] of [[x0, 29.7, -0.8, 0.8], [29.7, 31.3, z0, z1], [31.3, x1 - 0.8, -0.8, 0.8]]) M.quad('flagstone', [a, y + 0.012, c], [b, y + 0.012, c], [b, y + 0.012, d], [a, y + 0.012, d], [0, 1, 0]); // bout à bout, sans recouvrement
  M.restore();
  const kx = 34.2;
  box('flagstone', kx - 1.9, kx + 1.9, y, y + 0.2, -1.9, 1.9, { tint: [0.85, 0.82, 0.74], bevel: 0.02, m: 'concrete', uv: 2 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) post(kx + sx * 1.6, sz * 1.6, y + 0.2, y + 2.7, 0.22, [0.34, 0.22, 0.15]);
  hipRoof(kx - 1.6, kx + 1.6, -1.6, 1.6, y + 2.7, 1.6, { ov: 1.0, tint: [0.4, 0.44, 0.5] });
  benchAt(kx, -1.4, kx, 0, y + 0.2); benchAt(kx, 1.4, kx, 0, y + 0.2);
  // bambous du plateau, fougères et hostas dessous
  const pfree = (x, z) => x > x0 + 1.2 && x < x1 - 0.8 && Math.abs(z) < z1 - 0.8 && !(x > kx - 3.3 && x < kx + 3.3 && Math.abs(z) < 3.3) && !(Math.abs(z) < 1.4) && !(x > 29.2 && x < 31.8);
  plantBed(R, [x0 + 1, x1 - 0.5, -z1 + 0.5, z1 - 0.5], 26, (RR) => [PF.bamboo(7 + Math.floor(RR() * 4), RR.range(7, 9.5), 1 + Math.floor(RR() * 8)), 1], (x, z) => pfree(x, z), y);
  // écran de bambous haut le long du bord est (le plateau domine l'enceinte : on ne voit plus que leurs cimes), rochers moussus dans les massifs
  for (let z = -12; z <= 12; z += 3.1) if (Math.abs(z) > 2.4) M.place(PF.bamboo(9, R.range(9.5, 11.5), Math.round(z * 7)), 36.3 + R.range(-0.3, 0.2), y, z + R.range(-0.4, 0.4), R() * TAU, { nocol: true });
  for (let i = 0; i < 9; i++) { const rx = R.range(29.2, 36), rz = R.range(-12, 12); if (pfree(rx, rz)) M.place(PF.rockG(60 + i, R.range(0.6, 1.1), R.range(0.4, 0.7), R.range(0.6, 1.1)), rx, y - 0.1, rz, R() * TAU, { nocol: true }); }
  plantBed(R, [x0 + 1, x1 - 0.5, -z1 + 0.5, z1 - 0.5], 470, (RR) => { const k = RR(); return k < 0.5 ? [PF.fern(['fernA', 'fernC'][Math.floor(RR() * 2)], RR.range(0.9, 1.5), 1 + Math.floor(RR() * 6)), 1] : k < 0.8 ? [PF.rosette('hosta', 'leafB', 1.0, 7, 1 + Math.floor(RR() * 4)), RR.range(0.9, 1.4)] : [PF.clump('grassT', 'leafB', 0.9, 1.1, 3, 1 + Math.floor(RR() * 4)), 1]; }, pfree, y);
  // le ravin : fougères arborescentes, tapis de fougères, rochers moussus, bambous et palmiers rustiques sur les bords
  const rfree = (x, z) => x > 19.8 && x < x0 - 0.7 && z > -14.2 && z < 15.6 && polyDist(ribbonPoly(RAVIN_STREAM, 3.6), x, z) < 0 && !(Math.abs(z) < 1.6 && x > 21.7 && x < 26.2);
  // (les fougères arborescentes laissent la place des bambous posés ensuite, x = 20,6 + |z| x 0,05)
  plantBed(R, [19.8, x0 - 0.5, -14.2, 15.6], 36, (RR) => [PF.treeFern(RR.range(2.0, 3.8), 1 + Math.floor(RR() * 6)), 1], (x, z) => rfree(x, z) && ![-12.5, -9, 9, 12.5].some((bz) => hyp(x - 20.6 - Math.abs(bz) * 0.05, z - bz) < 1.3));
  plantBed(R, [19.8, x0 - 0.5, -14.2, 15.6], 520, (RR) => { const k = RR(); return k < 0.35 ? [PF.fern(['fernA', 'fernB', 'fernC'][Math.floor(RR() * 3)], RR.range(1.0, 1.7), 1 + Math.floor(RR() * 6)), 1] : k < 0.55 ? [PF.rosette('hosta', 'leafB', 1.0, 7, 1 + Math.floor(RR() * 4)), RR.range(0.9, 1.5)] : k < 0.7 ? [PF.rosette('alocasia', 'leafA', 0.85, 6, 1 + Math.floor(RR() * 6)), RR.range(0.9, 1.5)] : k < 0.82 ? [PF.clump('iris', 'leafB', 0.9, 0.9, 3, 1 + Math.floor(RR() * 4)), 1.1] : k < 0.92 ? [PF.clump('hydB', 'leafB', 0.9, 0.9, 3, 1 + Math.floor(RR() * 4)), 1.2] : [PF.clump('grassT', 'leafB', 0.9, 1.1, 3, 1 + Math.floor(RR() * 4)), 1.1]; }, (x, z) => rfree(x, z) || (polyDist(ribbonPoly(RAVIN_STREAM, 3.6), x, z) > -0.6 && polyDist(ribbonPoly(RAVIN_STREAM, 3.6), x, z) < 0));
  for (const z of [-12.5, -9, 9, 12.5]) M.place(PF.bamboo(8, 7.5, Math.round(z * 3)), 20.6 + Math.abs(z) * 0.05, 0, z, R() * TAU);
  rockPile(25.8, -5.2, 25.0, -3.0, 0.02, 6, 51, 0.8); rockPile(24.6, 6.3, 22.6, 9.4, 0.02, 7, 52, 0.8); rockPile(23.3, 11.4, 24.6, 14.6, 0.02, 6, 53, 0.9); rockPile(21.6, -1.2, 21.8, 2.6, 0.02, 5, 54, 0.9);
}

/* ---------- Labyrinthe de buis ---------- */
/* Grille de murs d'un labyrinthe parfait (parcours en profondeur, graine fixe) auquel on retire quelques murs pour faire des boucles ;
   les cases impaires sont des couloirs, les paires des murs et des poteaux (1 : mur) */
function mazeGrid(seed, cols, rows, loops) {
  const R = rngOf(seed), W = cols * 2 + 1, H = rows * 2 + 1, g = Array.from({ length: H }, () => new Array(W).fill(1)), seen = new Set(['0,0']), stack = [[0, 0]];
  g[1][1] = 0;
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < cols && y < rows && !seen.has(x + ',' + y));
    if (!nb.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nb[Math.floor(R() * nb.length)];
    g[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = 0; g[ny * 2 + 1][nx * 2 + 1] = 0; seen.add(nx + ',' + ny); stack.push([nx, ny]);
  }
  for (let i = 0; i < loops; i++) { const x = 1 + Math.floor(R() * (W - 2)), y = 1 + Math.floor(R() * (H - 2)); if ((x % 2) !== (y % 2)) g[y][x] = 0; }
  return g;
}
/* Labyrinthe : origine (ox, oz) du coin nord-ouest, côté s (+1 sud, -1 nord : miroir en z), entrées par ouest (ligne j), nord (colonne i) et sud */
function florealMaze(s, seed) {
  const cols = 5, rows = 4, g = mazeGrid(seed, cols, rows, 7), W = g[0].length, H = g.length, ox = 19.5, oz = 23.5, Wc = 2.0, Wp = 1.0, hh = 2.2;
  g[3][0] = 0; g[0][3 * 2 + 1] = 0; g[H - 1][1 * 2 + 1] = 0; g[5][W - 1] = 0; // entrées ouest, nord, sud et une sortie vers le ravin
  // labyrinthe tressé : chaque cul-de-sac s'ouvre sur la case voisine (en face d'abord), sans tirage ; on s'y perd un peu, on n'y est jamais coincé
  for (let y = 1; y < H - 1; y += 2) for (let x = 1; x < W - 1; x += 2) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]], open = dirs.filter(([dx, dy]) => g[y + dy][x + dx] === 0);
    if (open.length !== 1) continue;
    const [ox0, oy0] = open[0], order = [[-ox0, -oy0], ...dirs.filter(([dx, dy]) => (dx !== ox0 || dy !== oy0) && (dx !== -ox0 || dy !== -oy0))];
    for (const [dx, dy] of order) { const nx = x + 2 * dx, ny = y + 2 * dy; if (nx > 0 && ny > 0 && nx < W - 1 && ny < H - 1) { g[y + dy][x + dx] = 0; break; } }
  }
  const pos = [], wid = []; let acc = 0; for (let i = 0; i < Math.max(W, H); i++) { const w = i % 2 ? Wc : Wp; pos.push(acc); wid.push(w); acc += w; }
  const Z = (z) => z * s, open = new Map();
  const emit = (o) => { const a = Z(o.z0), b = Z(o.z1); hedge(o.x0, o.x1, Math.min(a, b), Math.max(a, b), hh, { tint: [0.84, 0.95, 0.76], bevel: 0.12 }); };
  for (let y = 0; y < H; y++) {
    const runs = []; let a = null;
    for (let x = 0; x <= W; x++) { const wall = x < W && g[y][x] === 1; if (wall && a === null) a = x; else if (!wall && a !== null) { runs.push([a, x]); a = null; } }
    const keys = new Set(runs.map((r) => r[0] + ':' + r[1]));
    for (const [k, o] of [...open]) if (!keys.has(k) || o.endY !== y - 1) { emit(o); open.delete(k); }
    for (const [xa, xb] of runs) { const k = xa + ':' + xb, o = open.get(k), z0 = oz + pos[y], z1 = z0 + wid[y]; if (o) { o.z1 = z1; o.endY = y; } else open.set(k, { x0: ox + pos[xa], x1: ox + pos[xb - 1] + wid[xb - 1], z0, z1, endY: y }); }
  }
  for (const o of open.values()) emit(o);
  return { ox, oz, w: acc, d: (() => { let t = 0; for (let i = 0; i < H; i++) t += wid[i]; return t; })() };
}

/* ---------- Roseraie, pergolas de glycines, kiosque ---------- */
/* Pergola le long de z : x0..x1 (largeur), z0..z1 (longueur), hauteur h ; glycines en rideaux, lierre et feuillage sur le toit */
function pergola(x0, x1, z0, z1, h, seed) {
  const M = DECOR, R = rngOf(seed), tint = [0.94, 0.92, 0.86], n = Math.max(2, Math.round((z1 - z0) / 2.4));
  for (let i = 0; i <= n; i++) {
    const z = z0 + ((z1 - z0) * i) / n;
    post(x0, z, 0, h, 0.17, tint); post(x1, z, 0, h, 0.17, tint);
    box('paintwood', x0 - 0.35, x1 + 0.35, h, h + 0.13, z - 0.08, z + 0.08, { tint, collide: false, bevel: 0.015 });
  }
  for (const x of [x0 - 0.15, (x0 + x1) / 2, x1 + 0.15]) box('paintwood', x - 0.05, x + 0.05, h + 0.13, h + 0.22, z0 - 0.1, z1 + 0.1, { tint, collide: false });
  DECOR.col(x0 - 0.3, x1 + 0.3, h, h + 0.22, z0 - 0.1, z1 + 0.1, 'wood', true);
  M.occ(x0 - 0.2, x1 + 0.2, h - 0.1, h + 0.5, z0, z1, 0.55);
  for (let z = z0 + 0.3; z < z1; z += 0.62) {
    for (const [x, ry] of [[x0 - 0.18, Math.PI / 2], [x1 + 0.18, -Math.PI / 2], [x0 + 0.22, -Math.PI / 2], [x1 - 0.22, Math.PI / 2]]) M.place(PF.hanging('wisteria', R.range(0.85, 1.1), R.range(1.7, 2.4), 1 + Math.floor(R() * 4)), x, h - 1.9 + 0.0, z + R.range(-0.15, 0.15), ry);
    M.place(PF.hanging('wisteria', 1.0, R.range(1.2, 1.8), 1 + Math.floor(R() * 4)), (x0 + x1) / 2 + R.range(-0.6, 0.6), h - 1.45, z, 0);
    M.place(PF.hanging('ivy', 1.0, R.range(0.9, 1.5), 1 + Math.floor(R() * 4)), (x0 + x1) / 2 + R.range(-0.8, 0.8), h - 1.1, z + 0.3, Math.PI / 2);
  }
  for (let z = z0; z < z1; z += 1.2) for (const x of [x0 + 0.4, (x0 + x1) / 2, x1 - 0.4]) { M.color([R.range(0.85, 1), R.range(0.92, 1), R.range(0.8, 0.95)]); leafPatch(M, 'leafB', HERB.linden, [x + R.range(-0.2, 0.2), h + 0.3, z + R.range(0, 1.2)], [R.range(-0.2, 0.2), 1, R.range(-0.2, 0.2)], R.range(1.3, 1.9), R() * TAU, { up: 1, w: [0.4, 0.4, 0.4, 0.4], ao: [0.85, 0.85, 0.85, 0.85] }); }
}
/* Kiosque : estrade ronde, six poteaux de fer blanc, toit conique vert-de-gris, bancs en cercle */
function gazebo(x, z, r = 2.2) {
  const M = DECOR, white = [0.94, 0.92, 0.86];
  M.save().move(x, 0, z).color([0.86, 0.84, 0.78]).local(1); M.lathe('flagstone', [[r + 0.25, 0], [r + 0.25, 0.22], [r + 0.1, 0.26], [0, 0.26]], 20, { sharp: 0.3, uR: 1.2 }); M.restore();
  DECOR.col(x - r * 0.86, x + r * 0.86, 0, 0.26, z - r * 0.86, z + r * 0.86, 'concrete');
  const P = []; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; P.push([x + Math.cos(a) * (r - 0.15), z + Math.sin(a) * (r - 0.15)]); }
  for (const [px, pz] of P) { M.save().move(px, 0.26, pz).color(white).local(1); M.cyl('paint', 0.07, 2.4, 8); M.save().move(0, 0, 0); M.cyl('paint', 0.11, 0.22, 8, { r1: 0.07 }); M.restore(); M.restore(); DECOR.col(px - 0.09, px + 0.09, 0.26, 2.7, pz - 0.09, pz + 0.09, 'metal'); }
  M.save().move(x, 2.66, z).color(white).local(1); M.tube('paint', 0.05, Array.from({ length: 25 }, (_, i) => [Math.cos(i / 24 * TAU) * (r - 0.15), 0, Math.sin(i / 24 * TAU) * (r - 0.15)]), 5); M.restore();
  M.save().move(x, 2.7, z).color([0.4, 0.66, 0.56]).local(1); M.lathe('paint', [[r + 0.55, 0], [r + 0.5, 0.06], [r * 0.6, 0.6], [0.2, 1.5], [0.06, 1.9], [0, 2.1]], 18, { sharp: 0.6 }); M.restore();
  M.occ(x - r - 0.4, x + r + 0.4, 2.6, 4.4, z - r - 0.4, z + r + 0.4, 0.85);
  // bancs contre les poteaux, une travée sur deux, face au centre : les trois autres travées restent ouvertes (à 1,3 m du centre, ils laissaient
  // entre eux des passages trop étroits, on n'entrait dans le kiosque qu'en enjambant un banc : traversee.js)
  // (au sud de la carte, z < 0, la disposition se reflète comme le reste du jardin)
  for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU + Math.PI / 6; benchAt(x + Math.cos(a) * (r - 0.75), z + Math.sign(z || 1) * Math.sin(a) * (r - 0.75), x, z, 0.26); }
}
function florealRoseraie(s, R) {
  const Z = (z) => z * s, M = DECOR, cx = -26.6, cz = 31.2;
  pergola(-34.9, -32.3, Math.min(Z(25), Z(37.5)), Math.max(Z(25), Z(37.5)), 2.7, s > 0 ? 601 : 602); pergola(-20.9, -18.3, Math.min(Z(25), Z(37.5)), Math.max(Z(25), Z(37.5)), 2.7, s > 0 ? 603 : 604);
  gazebo(cx, Z(cz), 2.2);
  // massifs de rosiers en couronne autour du kiosque, entre quatre allées
  const roses = ['roseR', 'roseP', 'roseW', 'roseY'];
  for (let k = 0; k < 4; k++) {
    const a0 = k * Math.PI / 2 + 0.22, a1 = (k + 1) * Math.PI / 2 - 0.22;
    for (const rr of [3.6, 6.4]) { M.save().move(cx, 0, Z(cz)).color([0.84, 0.96, 0.76]).local(1); M.lathe('hedge', [[rr - 0.18, 0], [rr - 0.2, 0.42], [rr + 0.2, 0.42], [rr + 0.18, 0]], 8, { a0, a1, sharp: 0.4, uR: 1 }); M.restore(); }
    for (let rr = 4.1; rr < 6.1; rr += 0.55) for (let a = a0 + 0.1; a < a1 - 0.05; a += 0.55 / rr) M.place(PF.clump(roses[(k + (rr > 5 ? 1 : 0)) % 4], 'leafB', 0.8, 0.8, 3, 1 + Math.floor(R() * 4), { cls: 2 }), cx + Math.cos(a) * rr, 0, Z(cz + Math.sin(a) * rr), R() * TAU, { s: R.range(0.9, 1.25) });
  }
  M.place(PF.urn('lavender', 'leafB', 1), cx + 7.2, 0, Z(cz), 0); M.place(PF.urn('lavender', 'leafB', 1), cx - 7.2, 0, Z(cz), 0);
  for (const [x, z] of [[-30.6, 26.8], [-22.6, 26.8], [-30.6, 35.8], [-22.6, 35.8]]) benchAt(x, Z(z), cx, Z(cz)); // face au kiosque
  for (const [x, z, k, h, sd] of [[-35.2, 38.8, 'linden', 9, 1], [-17.3, 38.6, 'oak', 9, 2], [-36, 23.4, 'maple', 7, 3], [-17.6, 23.6, 'ginkgo', 9, 4]]) M.place(PF.tree(k, h, 3.0, sd + (s > 0 ? 0 : 10)), x, 0, Z(z), R() * TAU);
}

/* ---------- Pelouses, promenade, allée, enceinte ---------- */
/* Lampadaire de parc en fonte vert sombre : base ouvragée, fût cannelé, lanterne à pans, flèche */
PF.gardenLamp = (lit = litOn()) => prefab('gardenLamp' + (lit ? 'L' : ''), (M) => {
  M.save().color([0.1, 0.24, 0.14]).local(1);
  M.lathe('paintwood', [[0.3, 0], [0.3, 0.1], [0.2, 0.2], [0.22, 0.5], [0.12, 0.62], [0.09, 0.7], [0.07, 3.0], [0.1, 3.06], [0.18, 3.16], [0.2, 3.24]], 10, { sharp: 0.5, uR: 0.1 });
  M.save().move(0, 3.24, 0); M.lathe('steel', [[0.22, 0], [0.2, 0.34], [0.14, 0.36], [0.02, 0.4], [0.2, 0.42], [0.04, 0.9], [0, 1.1]], 6, { sharp: 0.5 }); M.restore();
  M.color([1, 0.92, 0.7]); M.cls = 1; M.save().move(0, 3.28, 0); M.cyl(lit ? 'lamp' : 'lampOff', 0.17, 0.3, 6, { r1: 0.15 }); M.restore();
  if (lit) M.lamp(0, 3.43, 0, [1.0, 0.78, 0.5], 2.2, 10, 0.3);
  M.restore(); M.col(-0.12, 0.12, 0, 3.5, -0.12, 0.12, 'metal');
});
/* Bosquets et pelouses d'un côté de la carte : arbres isolés et massifs d'arbustes ; allée du canal, promenade, lampadaires, bancs */
function florealPelouses(s, R) {
  const Z = (z) => z * s, M = DECOR, T = (k, x, z, h, r, sd, o) => M.place(PF.tree(k, h, r, sd + (s > 0 ? 0 : 20), o), x, 0, Z(z), R() * TAU);
  // bosquets des pelouses entre l'allée, la promenade et les parterres
  for (const [k, x, z, h, r, sd] of [['oak', -14, 19.8, 12, 4.2, 1], ['linden', -8.6, 22.6, 11, 3.6, 2], ['maple', -12.4, 16.8, 8, 3.0, 3], ['ginkgo', -15.8, 23.4, 10, 2.8, 4], ['oak', 14, 19.8, 12, 4.2, 5], ['linden', 8.8, 22.8, 11, 3.6, 6], ['ginkgo', 12, 16.6, 10, 2.8, 7], ['maple', 15.4, 23.6, 8, 3.0, 8],
    ['cherry', -33, 19.5, 7.5, 3.6, 9], ['cherryW', -27.5, 22, 7.5, 3.6, 10], ['linden', -22.5, 19, 11, 3.6, 11], ['maple', -19, 21.8, 8, 3.0, 12], ['oak', 24, 18.5, 12, 4.0, 13], ['linden', 19.2, 21.5, 11, 3.4, 14], ['cherry', 35, 19.5, 7.5, 3.4, 15], ['maple', 25.6, 22.6, 8, 3.0, 16]]) T(k, x, z, h, r, sd, k === 'cherry' || k === 'cherryW' ? { shape: 'spread', th: 1.8 } : undefined);
  // charmille sur la pelouse de l'ouest : la vue des apparitions sur B (la place de la serre) filait par le passage entre les parterres
  hedge(-13.3, -10.1, Math.min(Z(18.4), Z(18.9)), Math.max(Z(18.4), Z(18.9)), 1.8, { bevel: 0.1 });
  // canal de l'allée : eau peu profonde bordée de dalles, vasques fleuries, lampadaires et bancs le long de l'allée
  const [ca, cb] = [Math.min(Z(14.6), Z(25)), Math.max(Z(14.6), Z(25))];
  pondAdd({ shape: 'rect', x: 0, y: 0.05, z: (ca + cb) / 2, w: 2.3, d: cb - ca, n: 10, wade: 0, calm: 0.6, vis: 0.6, caus: 0.7, alpha: 0.82, depth: 0.5, foam: 0.5, flow: [0, 0.1 * s], deep: [0.02, 0.07, 0.06], shallow: [0.05, 0.14, 0.11], scatter: [0.02, 0.08, 0.06] });
  // margelle de dalles tout autour : les deux longs côtés, et les deux bouts entre eux (l'eau arrivait au ras de l'allée)
  for (const sx of [-1, 1]) box('flagstone', sx > 0 ? 1.15 : -1.45, sx > 0 ? 1.45 : -1.15, 0, 0.1, ca - 0.3, cb + 0.3, { tint: [0.84, 0.8, 0.72], collide: false, bevel: 0.03 });
  for (const [z0, z1] of [[ca - 0.3, ca], [cb, cb + 0.3]]) box('flagstone', -1.15, 1.15, 0, 0.1, z0, z1, { tint: [0.84, 0.8, 0.72], collide: false, bevel: 0.03 });
  M.place(PF.lilies(0.8, 4, s > 0 ? 3 : 4, 0.5), 0, 0.06, (ca + cb) / 2, 0, { cls: 2 });
  for (const sx of [-1, 1]) { M.place(PF.urn('roseP', 'leafB', 1), sx * 2.4, 0, Z(14.2), 0); M.place(PF.urn('tulipR', 'leafB', 1), sx * 2.4, 0, Z(25.4), 0); }
  // le long des parterres, lampadaires et bancs sont adossés aux charmilles, au milieu de chaque tronçon : ni dans les trouées qui mènent
  // aux allées des parterres (z 30,7 à 31,7 et 35,7 à 36,7), ni à l'entrée de l'allée devant les apparitions (z 40,7 à 43)
  for (const z of [16, 22, 28.7, 33.7]) for (const sx of [-1, 1]) M.place(PF.gardenLamp(), sx * 4.9, 0, Z(z), 0);
  for (const z of [18.5, 38.7]) for (const sx of [-1, 1]) benchAt(sx * 4.2, Z(z), 0, Z(z)); // face à l'allée (et au canal)
  // promenade transversale : lampadaires, bancs et vasques
  for (const x of [-34, -26, -18, 18, 26, 34]) M.place(PF.gardenLamp(), x, 0, Z(16.8), 0);
  for (const x of [-22, -9, 9, 22]) benchAt(x, Z(14.3), x, Z(16)); // dos au mur de la serre, face à la promenade
  // arbustes et massifs en bordure de la promenade
  plantBed(R, [-37, 37, Math.min(Z(17.4), Z(25.5)), Math.max(Z(17.4), Z(25.5))], 90, (RR) => { const k = RR(); return k < 0.35 ? [PF.clump(['hydB', 'hydP', 'hydW', 'hydV'][Math.floor(RR() * 4)], 'leafB', 1.0, 1.0, 3, 1 + Math.floor(RR() * 4)), RR.range(1.0, 1.5)] : k < 0.6 ? [PF.clump('azalea', 'leafB', 1.0, 0.9, 3, 1 + Math.floor(RR() * 4)), RR.range(1.0, 1.5)] : k < 0.8 ? [PF.clump(['lilac', 'peony'][Math.floor(RR() * 2)], 'leafB', 1.0, 1.0, 3, 1), 1.2] : [PF.clump('dahlia', 'leafB', 0.9, 0.9, 3, 1), 1.1]; }, (x, z) => Math.abs(x) > 6 && !(x > -37 && x < -17.5 && Math.abs(z) > 24.2) && !(x > 19 && x < 38 && Math.abs(z) > 22) && polyDist(JAPON_POND, x, z) < -2 && !(Math.abs(x - 30.5) < 2.5));
}

}catch(e){HOOKS.missing['02w-jardins.js']=String(e&&e.message||e)}
/* ===== 02r-serre.js ===== */
try{
/* ==========================================================================
   LA GRANDE SERRE de Modern : charpente de fer peint vert sauge et verrière en berceau (nef de 38 x 26 m, faîte à 11,5 m),
   le Rocher (massif de rocaille de 3,6 m de haut au fond de la serre) avec sa grotte, sa fenêtre sur la cascade et ses
   rampes, la passerelle de la canopée qui prolonge sa terrasse au-dessus du ravin. Les vitrages sont transparents mais arrêtent
   les soldats et les tirs : la serre est un abri, ni les bots ni l'hélicoptère n'y voient ni n'y tirent de l'extérieur, sauf par les portes
   et par le passage de la passerelle (murs de verre `solid`, toit en boîtes `ray`).
   Repères : x vers l'est, z vers le sud ; la serre occupe FL.serre = [x0, x1, z0, z1].
   ========================================================================== */
/* Plan : la Grande Serre (x0, x1, z0, z1), la hauteur de ses murs de verre, de sa nef, et celle des terrasses hautes (Rocher, passerelle, plateau) */
var FL = { serre: [-19, 19, -13, 13], wallH: 3.8, apex: 11.5, high: 3.6 };
var SERRE_IRON = [0.5, 0.7, 0.52];
/* Mur de verre invisible : arrête les soldats, mais pas les tirs (garde-corps, flancs de rampe) ; solid : arrête aussi les tirs, les grenades et la vue des bots (vitrage de la serre) */
function glassWall(x0, x1, y0, y1, z0, z1, solid = false) { COL.push({ x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0, y1, z0: Math.min(z0, z1), z1: Math.max(z0, z1), m: 'glass', ray: false, noRay: !solid }); }
/* Contour en berceau de la nef : hauteur de la voûte à la position z */
function serreArchY(z) { const A = (FL.serre[3] - FL.serre[2]) / 2; return FL.wallH + (FL.apex - FL.wallH) * Math.sqrt(Math.max(0, 1 - (z / A) * (z / A))); }

/* Vitrage plan : quadrilatère de verre transparent (points dans le repère courant), à sa normale */
function glassQuad(M, p0, p1, p2, p3, n) { M.save().color([0.88, 1, 0.94]); M.cls = 1; M.quad('glassT', p0, p1, p2, p3, n); M.restore(); }

function serreShell() {
  const [x0, x1, z0, z1] = FL.serre, A = (z1 - z0) / 2, wH = FL.wallH, apex = FL.apex, B = apex - wH, M = DECOR, NR = 12, bay = (x1 - x0) / NR, NA = 24;
  // portes des murs longs (x0, x1), identiques au nord et au sud ; aucune jambe d'arc ni lisse ne les traverse
  const doors = [[-13.5, -10.5], [-2.1, 2.1]];
  // arcs : une nervure tous les 3 m (les deux plus forts sont les pignons)
  const arc = (x, j) => { const th = (j / NA) * Math.PI; return [x, wH + B * Math.sin(th), -A * Math.cos(th)]; };
  M.save().color(SERRE_IRON).local(1);
  for (let k = 0; k <= NR; k++) {
    const x = x0 + k * bay, pts = []; for (let j = 0; j <= NA; j++) pts.push(arc(x, j));
    M.tube('paint', k === 0 || k === NR ? 0.11 : 0.075, pts, 6, { uAround: 0.5 });
    // moulure intérieure et jambes de force : seconde courbe plus petite, reliée par des barreaux
    const inner = []; for (let j = 2; j <= NA - 2; j++) { const q = arc(x, j); inner.push([q[0], q[1] - 0.32, q[2] * 0.985]); }
    M.tube('paint', 0.03, inner, 5);
    for (let j = 3; j <= NA - 3; j += 2) { const a = arc(x, j); M.tube('paint', 0.02, [a, [a[0], a[1] - 0.32, a[2] * 0.985]], 4); }
    if (!doors.some(([da, db]) => x > da - 0.1 && x < db + 0.1)) for (const sd of [-1, 1]) M.tube('paint', 0.09, [[x, 0, sd * A], [x, wH, sd * A]], 6);
  }
  // pannes longitudinales et faîtière
  for (let j = 1; j < NA; j++) { const w = j === NA / 2 ? 0.07 : j % 2 ? 0.028 : 0.04; M.tube('paint', w, [arc(x0, j), arc(x1, j)], 5); }
  // chéneaux et poutres de rive ; les deux lisses basses s'interrompent aux portes (une barre en travers d'une porte gênerait le passage à l'œil)
  for (const sd of [-1, 1]) {
    // (à 3 cm en retrait des pignons : leur bout dans le plan du vitrage scintillait)
    M.boxB('paint', x0 + 0.03, x1 - 0.03, wH - 0.12, wH + 0.12, sd * A - 0.12, sd * A + 0.12);
    for (const [ya, yb, t] of [[0.9, 1.0, 0.06], [2.5, 2.58, 0.04]]) { let c = x0 + 0.03; for (const [da, db] of doors) { if (da > c) M.boxB('paint', c, da, ya, yb, sd * A - t, sd * A + t); c = db; } if (x1 - 0.03 > c) M.boxB('paint', c, x1 - 0.03, ya, yb, sd * A - t, sd * A + t); }
  }
  M.restore();
  // carreaux de la voûte (normale : sortante de l'ellipse)
  for (let k = 0; k < NR; k++) for (let j = 0; j < NA; j++) {
    const a = arc(x0 + k * bay, j), b = arc(x0 + (k + 1) * bay, j), c = arc(x0 + (k + 1) * bay, j + 1), d = arc(x0 + k * bay, j + 1), th = ((j + 0.5) / NA) * Math.PI;
    glassQuad(M, a, b, c, d, [0, A * Math.sin(th), -B * Math.cos(th)]);
  }
  // pignons : vitrage entre les montants, sous la courbe de la voûte (ouest : porte axiale ; est : passage de la passerelle de la canopée).
  // Le passage [za, zb, bas, haut] est vraiment ouvert : ni vitre, ni meneau, ni traverse entre ses jambages
  for (const [x, dir] of [[x0, -1], [x1, 1]]) {
    const [oa, ob, oy0, oy1] = dir < 0 ? [-2.3, 2.3, 0, 4.2] : [-1.4, 1.4, FL.high, FL.high + 2.8], inOpen = (z) => z > oa + 1e-6 && z < ob - 1e-6;
    // étendue des traverses à la hauteur y (sous la courbe), privée du passage s'il la coupe
    const rails = (y) => {
      const w = y <= wH ? A : A * Math.sqrt(Math.max(0, 1 - ((y - wH) / B) ** 2)), lo = Math.max(z0, -w + 0.1), hi = Math.min(z1, w - 0.1);
      if (hi - lo < 0.2) return [];
      if (y < oy0 - 0.02 || y > oy1 + 0.1 || lo >= ob || hi <= oa) return [[lo, hi]];
      return [[lo, Math.min(hi, oa)], [Math.max(lo, ob), hi]].filter((r) => r[1] - r[0] > 0.1);
    };
    M.save().color(SERRE_IRON).local(1);
    for (let z = z0 + 1; z < z1 - 0.5; z += 1.0) {
      const yt = serreArchY(z) - 0.05, parts = inOpen(z) ? [[0.9, oy0], [oy1 + 0.1, yt]] : [[0.9, yt]];
      for (const [lo, hi] of parts) if (hi - lo > 0.05) M.boxB('paint', x - 0.04, x + 0.04, lo, hi, z - 0.03, z + 0.03);
    }
    for (const y of [2.5, 4.6, 6.6, 8.3, 9.7]) for (const [ra, rb] of rails(y)) M.boxB('paint', x - 0.04, x + 0.04, y - 0.03, y + 0.03, ra, rb);
    M.restore();
    // vitrage : bandes d'un mètre, coupées aux jambages du passage
    const zs = [...new Set([...Array.from({ length: Math.round(z1 - z0) + 1 }, (_, k) => z0 + k), oa, ob])].sort((p, q) => p - q);
    for (let k = 0; k < zs.length - 1; k++) {
      const za = zs[k], zb = zs[k + 1], ya = serreArchY(za) - 0.08, yb = serreArchY(zb) - 0.08, mid = (za + zb) / 2;
      if (mid > oa && mid < ob) {
        if (oy0 > 0.9) glassQuad(M, [x, 0.9, za], [x, 0.9, zb], [x, oy0, zb], [x, oy0, za], [dir, 0, 0]);
        glassQuad(M, [x, oy1, za], [x, oy1, zb], [x, yb, zb], [x, ya, za], [dir, 0, 0]);
      } else glassQuad(M, [x, 0.9, za], [x, 0.9, zb], [x, yb, zb], [x, ya, za], [dir, 0, 0]);
    }
    // plinthe du pignon : interrompue par la porte de l'ouest (axe de la nef) ; sous la passerelle de l'est, elle reste entière
    for (const [za, zb] of dir < 0 ? [[z0, -2.3], [2.3, z1]] : [[z0, z1]]) box('ashlar', x - 0.25, x + 0.25, 0, 0.9, za, zb, { tint: [0.9, 0.86, 0.76], m: 'concrete', uv: 2.4 });
  }
  // murs longs : plinthe de pierre, vitrage et montants tous les 1,5 m, ouvertures des portes
  for (const sd of [-1, 1]) {
    const zc = sd * A, d = doors;
    let cur = x0;
    const seg = (a, b) => {
      if (b - a < 0.05) return;
      box('ashlar', a, b, 0, 0.9, zc - 0.25, zc + 0.25, { tint: [0.9, 0.86, 0.76], m: 'concrete', uv: 2.4 });
      glassWall(a, b, 0.9, wH, zc - 0.1, zc + 0.1, true);
      glassQuad(M, [a, 0.9, zc], [b, 0.9, zc], [b, wH, zc], [a, wH, zc], [0, 0, sd]);
      M.save().color(SERRE_IRON).local(1); for (let x = Math.ceil(a / 1.5) * 1.5; x < b - 0.05; x += 1.5) M.boxB('paint', x - 0.035, x + 0.035, 0.9, wH, zc - 0.035, zc + 0.035); M.restore();
    };
    for (const [da, db] of d) { seg(cur, da); cur = db; // porte : montants et linteau cintré
      M.save().color(SERRE_IRON).local(1); for (const x of [da, db]) M.boxB('paint', x - 0.07, x + 0.07, 0, 3.7, zc - 0.07, zc + 0.07, { bevel: 0.01 });
      M.boxB('paint', da, db, 3.4, 3.8, zc - 0.05, zc + 0.05); M.restore();
      glassQuad(M, [da, 3.4, zc], [db, 3.4, zc], [db, wH, zc], [da, wH, zc], [0, 0, sd]);
    }
    seg(cur, x1);
  }
  // porte de l'ouest (axe de la nef), grande porte de verre à deux vantaux
  M.save().color(SERRE_IRON).local(1);
  for (const z of [-2.3, 2.3]) M.boxB('paint', x0 - 0.12, x0 + 0.12, 0, 4.4, z - 0.08, z + 0.08, { bevel: 0.01 });
  M.boxB('paint', x0 - 0.1, x0 + 0.1, 4.2, 4.6, -2.3, 2.3); M.restore();
}

/* Les murs du pignon ouest autour de la porte (la plinthe du pignon laisse passer l'axe) : pas de collision sur la porte */
function serreWalls() {
  const [x0, x1, z0, z1] = FL.serre, wH = FL.wallH, A = (z1 - z0) / 2;
  // pignons : mur de verre infranchissable sauf la porte ouest ; la passerelle de la canopée ouvre le pignon est (voir serreCatwalk)
  glassWall(x0 - 0.05, x0 + 0.05, 0, 11.5, z0, -2.3, true); glassWall(x0 - 0.05, x0 + 0.05, 0, 11.5, 2.3, z1, true);
  glassWall(x1 - 0.05, x1 + 0.05, 0, 11.5, z0, -1.4, true); glassWall(x1 - 0.05, x1 + 0.05, 0, 11.5, 1.4, z1, true);
  // toit : une boîte par maille de la voûte (n'arrête que les tirs : on ne marche pas dessus), qui suit la courbe d'un arc à l'autre
  const B = FL.apex - wH, NA = 24;
  for (let j = 0; j < NA; j++) {
    const a = (j / NA) * Math.PI, b = ((j + 1) / NA) * Math.PI, za = -A * Math.cos(a), zb = -A * Math.cos(b), ya = wH + B * Math.sin(a), yb = wH + B * Math.sin(b);
    COL.push({ x0, x1, y0: Math.min(ya, yb) - 0.12, y1: Math.max(ya, yb) + 0.12, z0: Math.min(za, zb), z1: Math.max(za, zb), m: 'glass', ray: true });
  }
}

/* ---------- Rocaille : blocs, parois ---------- */
/* Bloc de roche facetté (comme PF.boulder) dans la matière rocaille : grès ocre rosé, teinte au choix */
PF.rockG = (seed = 1, rx = 1.2, ry = 1, rz = 1.2) => prefab(`rockG${seed}_${rx}_${ry}_${rz}`, (M) => {
  const R = rngOf(seed * 131 + 11), P = [], ph = [R() * TAU, R() * TAU, R() * TAU];
  for (let i = 0; i < 9; i++) { const a = R() * TAU, b = Math.acos(R.range(-0.6, 1)); P.push([Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a), R.range(0.62, 0.9)]); }
  const k = R.range(0.86, 1.04);
  M.save().color([k, k * 0.97, k * 0.94]).world(1).move(0, ry * 0.7, 0);
  M.aoFn = (x, y) => lerp(0.6, 1, smoothstep(-ry * 0.5, ry * 0.4, y));
  M.surf('rocaille', 14, 9, (u, v) => {
    const a = u * TAU, b = v * Math.PI, sb = Math.sin(b), dx = sb * Math.cos(a), dy = -Math.cos(b), dz = sb * Math.sin(a);
    let r = 1 + sb * (0.09 * Math.sin(3 * a + ph[0]) * Math.sin(2 * b + ph[1]) + 0.05 * Math.sin(5 * a + ph[2]));
    for (const p of P) { const d = dx * p[0] + dy * p[1] + dz * p[2]; if (d > 0.05) r = Math.min(r, p[3] / d); }
    return [dx * r * rx, dy * r * ry, dz * r * rz];
  }, { closeU: true, flipN: true, pole: (v) => [0, v < 0.5 ? -1 : 1, 0], uL: TAU * Math.max(rx, rz), vL: Math.PI * ry });
  M.restore();
});
/* Paroi de rocaille bosselée : plan x = o.x, de z0 à z1 et de y0 à y1, qui avance de o.bulge m vers o.out (+1 : vers +x, -1 : vers -x).
   Strates en gradins, surplomb en haut. o : seed, bulge, tint, top (surplomb, m) */
function rockFace(o) {
  const M = DECOR, N = makeNoise(o.seed || 3), alongX = o.axis === 'x', a0 = alongX ? o.x0 : o.z0, a1 = alongX ? o.x1 : o.z1, L = a1 - a0, H = o.y1 - o.y0, out = o.out || 1;
  const bl = o.bulge !== undefined ? o.bulge : 0.5, tp = o.top !== undefined ? o.top : 0.5, base = alongX ? o.z : o.x;
  M.save().color(o.tint || [1, 1, 1]).world(1); M.cls = 0;
  M.aoFn = (x, y) => lerp(0.55, 1, smoothstep(o.y0, o.y0 + 1.6, y));
  M.surf('rocaille', Math.max(3, Math.round(L / 0.7)), Math.max(3, Math.round(H / 0.5)), (u, v) => {
    const t = a0 + u * L, y = o.y0 + v * H, n = N.fbm(t * 0.05 + 3, y * 0.07, 32, 32, 4), n2 = N.fbm(t * 0.2, y * 0.25 + 9, 32, 32, 3), st = Math.floor(y / 0.9) * 0.9;
    const d = bl * (0.1 + n * 0.85) + smoothstep(st + 0.45, st + 0.9, y) * 0.1 * n2 + Math.max(0, v - 0.8) * 5 * tp * (0.5 + n2) * 0.25;
    return alongX ? [t, y, base + out * d] : [base + out * d, y, t];
  }, { uL: L, vL: H, flipN: alongX ? out < 0 : out > 0 });
  M.aoFn = null; M.restore();
}
/* Amas de blocs de roche le long d'un segment (pied de paroi, rives) : n blocs entre (xa, za) et (xb, zb) à la hauteur y */
function rockPile(xa, za, xb, zb, y, n, seed, sc = 1, tint) {
  const R = rngOf(seed), M = DECOR;
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0.5, rx = R.range(0.5, 1.1) * sc, ry = R.range(0.35, 0.8) * sc, rz = R.range(0.5, 1.1) * sc;
    M.place(PF.rockG(1 + Math.floor(R() * 9), Math.round(rx * 4) / 4, Math.round(ry * 4) / 4, Math.round(rz * 4) / 4), lerp(xa, xb, t) + R.range(-0.3, 0.3), y - ry * 0.3, lerp(za, zb, t) + R.range(-0.3, 0.3), R() * TAU, { nocol: true, tint });
  }
}

/* ---------- Cascades ---------- */
var WFALLS = [];
var WF_VERT = `varying vec2 vUv; uniform float uT;
void main() { vUv = uv; vec3 p = position;
  float k = 1.0 - uv.y; p.x *= 1.0 + 0.22 * k; p.z += sin(uv.y * 15.0 - uT * 6.5 + p.x * 3.0) * 0.035 + k * k * 0.1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
var WF_FRAG = `varying vec2 vUv; uniform float uT; uniform vec3 uTint;
float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
void main() {
  float y = vUv.y;
  vec2 q = vec2(vUv.x * 14.0, y * 3.0 + uT * 2.7);
  float a = n(q) * 0.5 + n(q * vec2(2.3, 2.1) + 7.0) * 0.3 + n(vec2(vUv.x * 44.0, y * 10.0 + uT * 5.2)) * 0.2;
  float streak = smoothstep(0.34, 0.78, a), edge = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x), foam = smoothstep(0.16, 0.0, y), top = smoothstep(0.97, 0.9, y);
  vec3 col = mix(vec3(0.5, 0.74, 0.8), vec3(1.0), streak * 0.85 + foam) * uTint;
  float alpha = (0.32 + 0.52 * streak + foam * 0.45) * edge * (0.55 + 0.45 * top);
  gl_FragColor = vec4(col, alpha);
}`;
/* Nappe d'eau qui tombe : plan vertical en x (face vers +x si dir = 1), de yTop à yBot, de z0 à z1. Renvoie le maillage */
function waterfallAdd(x, yTop, yBot, z0, z1, dir = -1, tint = [1.05, 1.08, 1.05]) {
  const m = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uTint: { value: new V3(...tint) } }, vertexShader: WF_VERT, fragmentShader: WF_FRAG, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  m.userData.noAO = true;
  const g = new THREE.PlaneGeometry(z1 - z0, yTop - yBot, 8, 18), mesh = new THREE.Mesh(g, m);
  mesh.position.set(x, (yTop + yBot) / 2, (z0 + z1) / 2); mesh.rotation.y = Math.PI / 2 * (dir > 0 ? 1 : -1);
  mesh.updateMatrix(); mesh.matrixAutoUpdate = false; mesh.userData.noPrepass = true; mesh.userData.noAO = true; mesh.renderOrder = 4;
  mapAdd(mesh); WFALLS.push({ mesh, m, x, y: yBot, z: (z0 + z1) / 2, w: z1 - z0 });
  return mesh;
}
/* Animation des cascades : horloge des nappes, brume et gouttes au pied */
function waterfallsUpdate(t, dt) {
  const cam = camera.position;
  for (const w of WFALLS) {
    w.m.uniforms.uT.value = t;
    if (Math.abs(w.x - cam.x) > 40 || Math.abs(w.z - cam.z) > 40) continue;
    const n = (w.w * 9 * dt); let k = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
    while (k-- > 0) {
      const z = w.z + (Math.random() - 0.5) * w.w, px = w.x + (Math.random() - 0.5) * 0.8;
      FX.smoke.spawn(px, w.y + 0.05, z, rand(-0.5, 0.5), rand(0.5, 1.4), rand(-0.5, 0.5), rand(0.9, 1.6), 0.15, rand(0.5, 0.9), 0.9, 0.95, 0.97, 0.15, 0, 0.8, 1.0, rand(-1, 1));
    }
  }
}

/* ---------- Le Rocher : massif de rocaille, grotte, rampes, terrasse ---------- */
/* Bord est de la serre et du Rocher, niveau de la terrasse */
var ROCHER = { x0: 9.5, x1: 18.8, y: FL.high, cave: [11.5, 14.5], roof: 2.8 };
function serreRock() {
  const M = DECOR, { x0, x1, y } = ROCHER, tint = [0.97, 0.96, 0.95], U = 3.2;
  const solid = (a, b, c, d, e, f, o = {}) => box('rocaille', a, b, c, d, e, f, Object.assign({ tint, m: 'concrete', uv: U, skip: 'Y' }, o));
  // (à 4 cm des murs de verre, z = ±13 : dans leur plan, la roche et le vitrage scintillaient)
  solid(x0, x1, 0, y, -12.96, -7.5); solid(x0, x1, 0, y, 7.5, 12.96); solid(14.5, x1, 0, y, -7.5, 7.5);
  for (const [a, b] of [[-7.5, -5.5], [-3.5, -1.5], [1.5, 3.5], [5.5, 7.5]]) solid(x0, 11.5, 0, ROCHER.roof, a, b); // jambages, sous la voûte (pas dedans)
  solid(11.5, 14.5, 0, ROCHER.roof, -7.5, -5.5); solid(11.5, 14.5, 0, ROCHER.roof, 5.5, 7.5); // le fond de la grotte derrière les jambages extrêmes : deux alcôves sans issue
  solid(x0, 14.5, ROCHER.roof, y, -7.5, 7.5);
  // terrasse : sol de terre et de feuilles au sommet (planté plus loin)
  M.save().color([0.8, 0.72, 0.6]).world(1); M.cls = 1; M.quad('mulch', [x0, y + 0.005, -13], [x1, y + 0.005, -13], [x1, y + 0.005, 13], [x0, y + 0.005, 13], [0, 1, 0]); M.restore();
  // parois extérieures : face ouest (percée des deux entrées de la grotte et de la fenêtre sur la cascade), face est, pieds
  for (const [a, b, s, yb] of [[-9.6, -5.5, 5, 0], [-3.5, -1.5, 6, -0.7], [1.5, 3.5, 7, -0.7], [5.5, 9.6, 8, 0]]) rockFace({ x: x0, out: -1, z0: a, z1: b, y0: yb, y1: y, seed: s, bulge: 0.55 });
  rockFace({ x: x1, out: 1, z0: -12.6, z1: 12.6, y0: 0, y1: y, seed: 11, bulge: 0.7 });
  // linteaux et jambages des entrées : gros blocs
  for (const z of [-4.5, 0, 4.5]) { const w = z === 0 ? 3.2 : 2.2; M.place(PF.rockG(2 + Math.abs(z), w * 0.6, 0.55, 1.0), x0 - 0.2, ROCHER.roof + 0.5, z, Math.PI / 2, { nocol: true }); }
  rockPile(x0 - 0.5, -9.4, x0 - 0.5, 9.4, 0.1, 18, 71, 1.0);
  // intérieur de la grotte : sol de pierre mouillée, quelques stalactites, bande de lumière de la fenêtre
  M.save().color([0.6, 0.62, 0.58]).local(1); M.cls = 1; M.quad('flagstone', [x0, 0.02, -7.5], [14.5, 0.02, -7.5], [14.5, 0.02, 7.5], [x0, 0.02, 7.5], [0, 1, 0]); M.restore();
  for (let i = 0; i < 14; i++) { const R = rngOf(300 + i), xx = R.range(10, 14.2), zz = R.range(-6.5, 6.5); M.save().move(xx, ROCHER.roof, zz).color([0.95, 0.9, 0.86]).world(1); M.cyl('rocaille', R.range(0.1, 0.2), -R.range(0.3, 0.7), 6, { r1: 0.01, caps: '' }); M.restore(); }
  // lanternes de la grotte (lueur chaude)
  for (const [x, z] of [[12.5, -4.8], [12.5, 4.8], [13.4, 0]]) { M.save().move(x, ROCHER.roof - 0.1, z); M.cls = 1; M.color([1, 0.8, 0.5]); M.cyl('lamp', 0.07, 0.12, 8); M.restore(); M.occ(x - 0.1, x + 0.1, 2.3, 2.7, z - 0.1, z + 0.1, 0); }
  // rampes d'accès à la terrasse, au nord et au sud, le long des murs de verre
  for (const s of [-1, 1]) {
    const [a, b] = [s * 9.6, s * 12.4].sort((p, q) => p - q);
    ramp(3.0, x0, a, b, 'x', 0, y, 'flagstone', [0.78, 0.74, 0.66], { mat: 'rocaille' });
    rampGuard(3.0, x0, a, b, 'x', 0, y, [s < 0 ? 1 : 0]); // le flanc côté nef (le mur de verre ferme l'autre)
  }
  // garde-corps au bord de la terrasse (côté étang), sauf devant les rampes
  railing(x0 + 0.05, x0 + 0.05, y, -9.6, 9.6, 'z'); glassWall(x0 - 0.1, x0 + 0.1, y, y + 1.0, -9.6, 9.6);
  // bout de la terrasse côté nord et sud : les rampes y débouchent (z de 9,6 à 12,4), aucun obstacle à leur sortie ; il ne reste que 0,6 m de bord entre elles et le mur de verre
  for (const sg of [-1, 1]) { const za = sg * 12.4, zb = sg * 13; railing(x0 + 0.05, x0 + 0.05, y, Math.min(za, zb), Math.max(za, zb), 'z'); glassWall(x0 - 0.1, x0 + 0.1, y, y + 1.0, za, zb); }
  // ressaut au-dessus de la cascade : lèvre de pierre d'où l'eau se déverse
  M.save().color([0.9, 0.86, 0.8]).world(1); M.boxB('rocaille', x0 - 0.9, x0 + 0.1, y - 0.5, y, -2.4, 2.4, { bevel: 0.08 }); M.restore();
}

/* ---------- Étang de la serre et cascade ---------- */
var SERRE_POND = [[9.5, -2.6], [8.2, -3.0], [7.4, -3.9], [7.0, -5.0], [6.0, -5.9], [4.6, -6.0], [3.5, -5.0], [3.0, -3.2], [2.9, -1.2], [3.2, 1.0], [3.0, 3.0], [3.6, 4.8], [5.0, 5.9], [6.5, 5.7], [7.3, 4.8], [7.6, 3.6], [8.4, 3.0], [9.5, 2.6]];
function serrePond() {
  pondBasin(SERRE_POND, { wl: -0.12, bed: -0.5, jet: 0.9, jc: [8.9, 0], foam: 0.7, deep: [0.004, 0.034, 0.03], shallow: [0.03, 0.12, 0.1], scatter: [0.01, 0.08, 0.06], tint: [0.5, 0.56, 0.46] });
  waterfallAdd(ROCHER.x0 - 0.95, FL.high - 0.5, -0.2, -2.2, 2.2, -1);
  for (const z of [-1.7, -0.85, 0, 0.85, 1.7]) rippleSource(ROCHER.x0 - 1.2, z, 0.42, -0.008, 0.18, 0.12); // la nappe martèle l'étang à son pied
  floatingLilies();
}
/* Passerelle de la canopée : tablier d'acier de la terrasse du Rocher jusqu'au plateau de l'est, à travers le pignon de la serre */
function serreCatwalk() {
  const M = DECOR, y = FL.high, xa = ROCHER.x1, xb = 27.8, hw = 1.1;
  box('steel', xa, xb, y - 0.16, y, -hw, hw, { tint: [0.5, 0.56, 0.54], m: 'metal', ao: false, uv: 1.2 });
  // poutres de rive en treillis et traverses
  M.save().color(SERRE_IRON).local(1);
  for (const sd of [-1, 1]) { M.boxB('paint', xa, xb, y - 0.55, y - 0.16, sd * hw - 0.06, sd * hw + 0.06); for (let x = xa + 0.6; x < xb - 0.3; x += 1.2) M.tube('paint', 0.025, [[x, y - 0.55, sd * hw], [x + 0.6, y - 0.16, sd * hw]], 4); }
  for (let x = xa + 1; x < xb; x += 1.6) M.boxB('paint', x - 0.04, x + 0.04, y - 0.35, y - 0.17, -hw, hw);
  // pylônes
  for (const x of [22.2, 25.2]) for (const sd of [-1, 1]) { M.save().move(x, 0, sd * 0.9); M.cyl('paint', 0.13, y - 0.4, 8); M.restore(); DECOR.col(x - 0.14, x + 0.14, 0, y - 0.4, sd * 0.9 - 0.14, sd * 0.9 + 0.14, 'metal'); }
  M.restore();
  for (const sd of [-1, 1]) railing(sd * hw, sd * hw, y, xa, xb, 'x');
  glassWall(xa, xb, y, y + 1.0, -hw - 0.1, -hw + 0.05); glassWall(xa, xb, y, y + 1.0, hw - 0.05, hw + 0.1);
  // encadrement du passage dans le pignon
  M.save().color(SERRE_IRON).local(1); for (const sd of [-1, 1]) M.boxB('paint', 18.88, 19.12, y, y + 2.9, sd * 1.4 - 0.07, sd * 1.4 + 0.07, { bevel: 0.01 }); M.boxB('paint', 18.88, 19.12, y + 2.8, y + 3.0, -1.4, 1.4); M.restore();
}

/* Nénuphars sur l'étang de la serre (les feuilles sont à plat au niveau de l'eau) */
function floatingLilies() {
  const M = DECOR;
  for (const [x, z, r, n, seed] of [[5.2, -3.6, 1.6, 8, 1], [4.4, 2.4, 1.8, 9, 2], [6.4, 0.4, 1.0, 5, 3]]) M.place(PF.lilies(r, n, seed, 0.4), x, -0.1, z, 0, { cls: 2 });
}

/* ---------- Plantation : la jungle de la serre ---------- */
/* Un point est-il plantable dans la nef (hors étang, allée, plaza, vestibule, rives, rampes et roche) ? */
function serreFree(x, z) {
  const [x0, x1, z0, z1] = FL.serre;
  if (x < x0 + 0.7 || x > x1 - 0.7 || z < z0 + 0.7 || z > z1 - 0.7) return false;
  if (polyDist(SERRE_POND, x, z) > -1.0) return false;
  if (Math.abs(x) < 2.4 || x >= 9.4) return false;
  if (x > -11.2 && x < 2.4 && Math.abs(z) < 7.0) return false;
  if (x < -10.6 && Math.abs(z) < 2.8) return false;
  if (x > -13.4 && x < -10.6 && Math.abs(z) > 6.6) return false;
  if (x > 2.3 && x < 9.6 && Math.abs(z) > 8.8) return false;
  if (x > 6.2 && Math.abs(z) < 7.6) return false;
  return true;
}
function serrePlanting() {
  const R = rngOf(9091), M = DECOR, [x0, x1, z0, z1] = FL.serre, nave = [x0 + 0.8, 9.4, z0 + 0.8, z1 - 0.8];
  const lush = (n, seedBase) => (RR) => {
    const k = RR();
    if (k < 0.2) return [PF.rosette('monstera', 'leafA', 1.0, 6, seedBase + Math.floor(RR() * 6)), RR.range(0.8, 1.4)];
    if (k < 0.34) return [PF.rosette('alocasia', 'leafA', 0.85, 6, seedBase + Math.floor(RR() * 6)), RR.range(0.8, 1.4)];
    if (k < 0.44) return [PF.rosette('philo', 'leafA', 0.75, 6, seedBase + Math.floor(RR() * 6)), RR.range(0.8, 1.3)];
    if (k < 0.54) return [PF.rosette('calathea', 'leafA', 0.85, 3, seedBase + Math.floor(RR() * 6)), RR.range(0.8, 1.2)];
    if (k < 0.7) return [PF.fern(['fernA', 'fernB', 'fernC'][Math.floor(RR() * 3)], RR.range(0.9, 1.4), seedBase + Math.floor(RR() * 6)), 1];
    if (k < 0.78) return [PF.clump(['orchidW', 'orchidP', 'orchidY'][Math.floor(RR() * 3)], 'leafA', 0.9, 0.9, 2, seedBase + Math.floor(RR() * 6)), RR.range(0.9, 1.3)];
    if (k < 0.84) return [PF.clump('bromel', 'leafA', 0.9, 0.9, 2, seedBase + Math.floor(RR() * 4)), 1];
    if (k < 0.9) return [PF.clump(['heliconia', 'bird', 'hibiscus'][Math.floor(RR() * 3)], 'leafA', 1.0, 1.0, 2, seedBase + Math.floor(RR() * 4)), RR.range(0.9, 1.5)];
    if (k < 0.95) return [PF.clump(['anthurium', 'arum'][Math.floor(RR() * 2)], 'leafA', 0.9, 0.9, 2, seedBase + Math.floor(RR() * 4)), 1];
    return [PF.rosette('strap', 'leafA', 1.0, 4, seedBase + Math.floor(RR() * 4), { aspect: 1.9 }), RR.range(0.8, 1.3)];
  };
  // sous-bois : tapis dense de grandes feuilles, de fougères et de fleurs exotiques
  plantBed(R, nave, 1000, lush(0, 100), serreFree);
  // étage moyen : palmiers, bananiers, fougères arborescentes, arbres à feuilles vernissées ; la hauteur est limitée par la voûte (le houppier déborde de 3 m)
  for (let i = 0; i < 190; i++) {
    const x = R.range(nave[0], nave[1]), z = R.range(nave[2], nave[3]), k = R(), s1 = 1 + Math.floor(R() * 6), r1 = R(), r2 = R();
    if (!serreFree(x, z) || polyDist(SERRE_POND, x, z) > -2.2) continue;
    const H = serreArchY(Math.min(12.6, Math.abs(z) + 3.4)) - 1.3; if (H < 2.4) continue;
    // un tronc ne se pose pas dans un autre (plantFits) ; l'orientation est tirée comme avant, pour que la suite ne change pas
    const pf = k < 0.3 && H > 5 ? PF.palmG(Math.min(H, 6.5 + r1 * 4), s1, r2 < 0.5 ? 'palm' : 'palm2') : k < 0.55 && H > 3.2 ? PF.banana(Math.min(H, 2.8 + r1 * 1.4), s1)
      : k < 0.82 ? PF.treeFern(Math.min(H - 0.4, 1.8 + r1 * 1.6), s1) : H > 6 ? PF.tree('ficus', Math.min(H, 7 + r1 * 2.5), 2.6 + r2, s1, { th: 3.2 }) : null;
    if (!pf) continue;
    const ry = R() * TAU;
    if (plantFits(pf, x, z)) M.place(pf, x, 0, z, ry);
  }
  // rive de l'étang : papyrus, iris, quelques roseaux
  const shore = (RR) => (RR() < 0.5 ? [PF.papyrus(RR.range(1.8, 2.8), 1 + Math.floor(RR() * 6)), 1] : [PF.clump('iris', 'leafB', 0.9, 0.9, 3, 1 + Math.floor(RR() * 6)), RR.range(0.9, 1.3)]);
  plantBed(R, [2.2, 9.5, -7.5, 7.5], 120, shore, (x, z) => { const d = polyDist(SERRE_POND, x, z); return d < -0.5 && d > -1.9 && x < 9.2; });
  // jungle du Rocher : sur la terrasse, au pied de la paroi et en lianes retombantes
  const top = [ROCHER.x0 + 0.5, ROCHER.x1 - 0.5, -12.4, 12.4], tfree = (x, z) => !(x < ROCHER.x0 + 1.4 && Math.abs(z) < 9.8) && !(Math.abs(z) > 9.6 && x < ROCHER.x0 + 1.2);
  plantBed(R, top, 200, lush(0, 200), tfree, FL.high);
  plantBed(R, top, 28, (RR) => { const k = RR(); return k < 0.35 ? [PF.palmG(RR.range(5.2, 6.8), 1 + Math.floor(RR() * 6), RR() < 0.5 ? 'palm' : 'palm2'), 1] : k < 0.65 ? [PF.banana(RR.range(2.8, 3.8), 1 + Math.floor(RR() * 6)), 1] : [PF.treeFern(RR.range(2, 3.2), 1 + Math.floor(RR() * 6)), 1]; }, tfree, FL.high);
  plantBed(R, [ROCHER.x0 - 1.4, ROCHER.x0 - 0.2, -9.4, 9.4], 36, (RR) => lush(0, 300)(RR), (x, z) => polyDist(SERRE_POND, x, z) < -0.7 && (Math.abs(z) > 3.0 || x < 8));
  for (let i = 0; i < 46; i++) { const z = R.range(-9.4, 9.4), h = R.range(1.6, 3.2); if (Math.abs(z) < 1.9) continue; M.place(PF.liana(R.range(1.1, 1.8), h, 1 + (i % 6)), ROCHER.x0 - 0.12, FL.high - h + 0.35, z, -Math.PI / 2); }
  // lianes de la voûte : elles pendent des arcs, à toutes hauteurs
  for (let i = 0; i < 90; i++) {
    const k = R.range(0.5, 12 - 0.5), x = x0 + k * 3 + R.range(-0.3, 0.3), th = R.range(0.22, 0.78) * Math.PI, z = -13 * Math.cos(th), ya = FL.wallH + (FL.apex - FL.wallH) * Math.sin(th), h = R.range(2.2, 4.0);
    if (x > 8.5 && ya - h < FL.high + 1.0 && Math.abs(z) < 11) continue;
    M.place(PF.liana(R.range(1.1, 1.9), h, 1 + (i % 6)), x, ya - h + 0.35, z, R() * TAU);
  }
  // autour de la plaza : bancs et vasque de pierre au centre
  basin(-4.5, 0, 1.4, { pillar: false, jet: 0.35, tint: [0.88, 0.86, 0.8] });
  for (const [x, z] of [[-10.3, -4.2], [-10.3, 4.2], [-8, -6.3], [-8, 6.3]]) benchAt(x, z, -4.5, 0); // autour de la vasque
  for (const z of [-5.6, 5.6]) benchAt(0.9, z, 6, 0); // au bord de la plaza, face à l'étang et à la cascade;
}

}catch(e){HOOKS.missing['02r-serre.js']=String(e&&e.message||e)}
/* ===== 02g-vehicles.js ===== */
try{
/* ==========================================================================
   VÉHICULES : voitures (berline, citadine, 4x4) et camions (militaire à capot, porteur à cabine avancée, fourgon et frigo), chacun en
   plusieurs versions (propre, poussiéreux, épave calcinée ; bâché, plateau, chargé) ; vélo, mobylette, bus incendié.
   Repère : longueur le long de z, avant en -z, roues posées sur y = 0. Les collisions d'un modèle sont décrites à côté de lui (vehCols,
   gardées sur le prefab : pf.vcols) et posées par la carte (vehicle) : des boîtes simples qui suivent la caisse, l'habitacle, la cabine et
   le plateau, sans dépasser de ce qu'on voit.
   ========================================================================== */
var G_SPH = new THREE.SphereGeometry(1, 6, 4);
/* Quadrilatère dont la normale est calculée sur ses sommets, tournée du côté de out ([x, y, z]) */
function vQuad(M, mat, a, b, c, d, out) {
  const ux = c[0] - a[0], uy = c[1] - a[1], uz = c[2] - a[2], vx = d[0] - b[0], vy = d[1] - b[1], vz = d[2] - b[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = hyp3(nx, ny, nz) || 1;
  nx /= l; ny /= l; nz /= l; if (nx * out[0] + ny * out[1] + nz * out[2] < 0) { nx = -nx; ny = -ny; nz = -nz; }
  M.quad(mat, a, b, c, d, [nx, ny, nz]);
}
/* Roue : pneu (profil de révolution) et jante ; axe le long de x, centre en (0, r, 0). o.side : +1 si la face extérieure regarde +x ;
   o.rim : teinte de la jante ; o.hub : 'disc' (enjoliveur plein percé), 'steel' (jante tôle, écrous), 'army' (jante creuse, gros moyeu,
   cercle de boulons) ; o.tread : nombre de pavés sur le tour (pneu tout-terrain, le relief se voit sur la silhouette) ; o.tire : teinte du
   pneu (poussière) ; o.noTire : jante seule (épave) */
function wheel(M, r, w, o = {}) {
  const hw = w / 2, s = -(o.side || 1), k = r / 0.33;
  M.save().move(0, r, 0).rotZ(Math.PI / 2);
  if (!o.noTire) {
    M.color(o.tire || [1, 1, 1]); M.uvS = 1;
    const prof = [[r * 0.62, -hw], [r * 0.93, -hw - 0.006], [r, -hw * 0.5], [r, hw * 0.5], [r * 0.93, hw + 0.006], [r * 0.62, hw]];
    if (o.tread) {
      // pavés : la bande de roulement se creuse en chevrons (deux sommets par pavé, déphasés vers les bords)
      const nb = o.tread, d = 0.03 * k, rows = prof.length - 1;
      M.surf('rubber', nb * 2, rows, (u, v) => {
        const f = v * rows, j = Math.min(rows - 1, Math.floor(f)), t = f - j, a = prof[j], b = prof[j + 1], ax = lerp(a[1], b[1], t);
        const band = 1 - smoothstep(0.55, 0.95, Math.abs(ax) / hw), rr = lerp(a[0], b[0], t) - d * band * (0.5 + 0.5 * Math.cos((u * nb + (Math.abs(ax) / hw) * 0.45) * TAU));
        return [Math.cos(u * TAU) * rr, ax, Math.sin(u * TAU) * rr];
      }, { closeU: true, flipN: true, uL: TAU * r * 1.4, vL: w });
    } else M.lathe('rubber', prof, 16, { sharp: 0.45, uR: r * 1.4 });
  }
  M.color(o.rim || [0.6, 0.6, 0.6]);
  // face extérieure de la jante du côté o.side ; après la rotation, +y local pointe vers -x
  M.lathe('steel', [[0, -s * (hw - 0.03)], [r * 0.62, -s * (hw - 0.03)], [r * 0.62, s * (hw - 0.03)], [r * 0.55, s * (hw - 0.05)], [r * 0.35, s * (hw - 0.02)], [0, s * (hw - 0.025)]], 12, { sharp: 0.5 });
  const face = (y) => { M.save().move(0, s * y, 0); if (s < 0) M.rotX(Math.PI); }; // repère posé sur la face, +y vers l'extérieur
  if (o.hub === 'disc') {
    face(hw - 0.035); M.cyl('steel', r * 0.5, 0.012, 12, { caps: 't' }); M.color([0.08, 0.08, 0.08]); M.cls = 2;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; M.save().move(Math.cos(a) * r * 0.42, 0.012, Math.sin(a) * r * 0.42).rotY(-a); M.boxB('dark', -0.012, 0.012, 0, 0.002, -0.035, 0.035); M.restore(); }
    M.cls = 0; M.restore();
  } else if (o.hub === 'steel' || o.hub === 'army') {
    const big = o.hub === 'army', n = big ? 6 : 4;
    face(hw - (big ? 0.06 : 0.03)); M.cyl('steel', r * (big ? 0.22 : 0.14), big ? 0.08 : 0.03, 8, { r1: r * (big ? 0.17 : 0.12), caps: 't' });
    M.color([0.2, 0.2, 0.18]); M.cls = 2;
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU; M.save().move(Math.cos(a) * r * (big ? 0.3 : 0.2), 0, Math.sin(a) * r * (big ? 0.3 : 0.2)); M.cyl('steel', big ? 0.022 : 0.012, big ? 0.04 : 0.02, 5, { caps: 't' }); M.restore(); }
    if (big) M.tube('steel', 0.014, Array.from({ length: 13 }, (_, i) => [Math.cos((i / 12) * TAU) * r * 0.57, 0.03, Math.sin((i / 12) * TAU) * r * 0.57]), 3);
    M.cls = 0; M.restore();
  }
  M.restore();
}

/* ---------- Voitures ---------- */
/* (5.1, retour du propriétaire, photos à l'appui : voitures trop anguleuses, vitres mal placées. La caisse est refaite en une surface continue
   aux bords et aux coins arrondis, le vitrage en une seconde surface posée sur l'épaule de caisse, découpée en vitres de portes, montants et
   pavillon ; peinture vernie, brillante) */
/* Fiches des voitures (carBuild, carGeo). Caisse : bouts zf et zr, demi-largeur w, roues (rayon r, largeur tw, voie tx, essieux ax), passages
   de roues (rayon ra), bas de caisse yb (yf sous le bouclier avant, yr sous l'arrière), ligne la plus large ym, ligne haute top ([z, y] :
   bouclier, capot, ceinture de caisse, hayon ou malle ; lissée), carré des sections n (2 : ellipse, plus grand : plus carré), arrondis des
   bouts [avant, arrière] : rc (coins vus de dessus), rt (lèvre haute), rb (lèvre basse).
   gh, vitrage : pare-brise de wz0 à wz1, pavillon jusqu'à rz1 (haut y1 devant, y1r derrière), lunette jusqu'à bz ; ins (retrait du pied des
   vitres sur l'épaule), b1 (demi-largeur du pavillon), rg (rayon des angles du pavillon), cr (bombé), win (vitres latérales [z0, z1] : la
   première part du pied du montant avant et suit le pare-brise, celle qui passe derrière rz1 suit la lunette), noir (montants et entourages
   noirs ; sinon montants couleur caisse et joints chromés), seat (dossiers des sièges avant et de la banquette, z).
   Habillage posé sur la surface de la caisse : head, tail (optiques : demi-largeurs x0 à x1, hauteurs y0 à y1, enroulées sur les coins),
   grille (calandre x, y0, y1, chrome), intake (prise d'air basse x, y0, y1), plate (bas des plaques [avant, arrière]), lip (lèvre noire au
   bas des boucliers, hauteur), clad (baguette [bas, haut, teinte]), seams (joints de portes, z), handles (poignées, z ; à handleY), mirror
   (z du rétroviseur), hub et rim (enjoliveur, teinte des jantes), chrome (joints de vitres et poignées chromés), flare (élargisseurs d'ailes
   noirs, épaisseur), rails (barres de toit, teinte), skid (sabots gris), bumper (pare-chocs rapportés [bas, haut, saillie]) */
var CAR_SPECS = {
  // berline des années 80 (4,4 m) : trois volumes, long capot plat, malle, montants couleur caisse, joints chromés, pare-chocs rapportés
  sedan: {
    zf: -2.2, zr: 2.2, w: 0.88, r: 0.37, tw: 0.22, tx: 0.765, ax: [-1.4, 1.42], ra: 0.4, yb: 0.3, yf: 0.3, yr: 0.32, ym: 0.62, n: 5,
    top: [[-2.2, 0.76], [-1.95, 0.81], [-1.3, 0.85], [-0.9, 0.88], [0.2, 0.9], [1.4, 0.91], [2.0, 0.9], [2.2, 0.87]],
    rc: [0.2, 0.2], rt: [0.07, 0.08], rb: [0.06, 0.06],
    gh: { wz0: -0.88, wz1: -0.22, rz1: 0.76, bz: 1.38, y1: 1.4, y1r: 1.39, ins: 0.06, b1: 0.71, rg: 0.05, cr: 0.025, win: [[-0.76, 0.14], [0.26, 1.1]], noir: false, seat: [0.26, 0.86] },
    bumper: [0.3, 0.5, 0.07], head: { x0: 0.34, x1: 0.78, y0: 0.58, y1: 0.73 }, grille: { x: 0.28, y0: 0.52, y1: 0.76, chrome: true },
    tail: { x0: 0.4, x1: 0.82, y0: 0.6, y1: 0.8 }, plate: [0.34, 0.62], clad: [0.36, 0.5, [0.3, 0.3, 0.3]], seams: [-0.86, 0.2, 1.16], handles: [-0.3, 0.86], mirror: -0.72, hub: 'disc', chrome: true,
  },
  // citadine (3,9 m, d'après la Clio) : capot court et plongeant, pare-brise très incliné, ligne de vitres qui remonte vers l'arrière, montants
  // noirs, gros montant arrière couleur caisse, optiques fines enroulées sur les coins, feux arrière hauts sur les ailes
  hatch: {
    zf: -1.95, zr: 1.95, w: 0.85, r: 0.34, tw: 0.21, tx: 0.74, ax: [-1.22, 1.3], ra: 0.375, yb: 0.28, yf: 0.22, yr: 0.3, ym: 0.62, n: 3.4,
    top: [[-1.95, 0.72], [-1.75, 0.82], [-1.35, 0.9], [-0.9, 0.95], [-0.5, 0.955], [0.6, 0.98], [1.05, 1.0], [1.3, 1.05], [1.72, 1.04], [1.95, 1.0]],
    rc: [0.36, 0.32], rt: [0.11, 0.2], rb: [0.1, 0.1],
    gh: { wz0: -0.9, wz1: -0.08, rz1: 1.2, bz: 1.74, y1: 1.42, y1r: 1.37, ins: 0.07, b1: 0.64, rg: 0.07, cr: 0.035, win: [[-0.76, 0.1], [0.2, 1.02]], noir: true, seat: [0.22, 1.0] },
    head: { x0: 0.42, x1: 0.8, y0: 0.72, y1: 0.8 }, grille: { x: 0.36, y0: 0.5, y1: 0.68 }, intake: { x: 0.58, y0: 0.3, y1: 0.4 },
    tail: { x0: 0.46, x1: 0.84, y0: 0.86, y1: 0.97 }, plate: [0.36, 0.64], lip: 0.06, clad: [0.3, 0.37, [0.07, 0.07, 0.07]], seams: [-0.86, 0.15, 1.08], handles: [-0.22, 0.9], handleY: 0.86, mirror: -0.74, hub: 'disc', rim: [0.22, 0.22, 0.24],
  },
  // petit SUV familial (4,3 m, d'après le Dacia Duster) : caisse haute, garde au sol, élargisseurs d'ailes et bas de caisse noirs, sabots gris,
  // barres de toit, custode derrière la porte arrière, montant arrière couleur caisse, hayon presque droit, jantes tôle grises
  suv: {
    zf: -2.16, zr: 2.16, w: 0.9, r: 0.39, tw: 0.24, tx: 0.77, ax: [-1.33, 1.34], ra: 0.43, yb: 0.44, yf: 0.4, yr: 0.44, ym: 0.78, n: 3.6,
    top: [[-2.16, 0.86], [-1.95, 0.97], [-1.55, 1.03], [-1.05, 1.07], [-0.6, 1.075], [1.0, 1.09], [1.95, 1.1], [2.16, 1.08]],
    rc: [0.34, 0.28], rt: [0.13, 0.12], rb: [0.12, 0.1],
    gh: { wz0: -1.05, wz1: -0.28, rz1: 1.84, bz: 2.06, y1: 1.64, y1r: 1.61, ins: 0.08, b1: 0.7, rg: 0.07, cr: 0.03, win: [[-0.92, 0.3], [0.42, 1.24], [1.34, 1.82]], noir: true, seat: [0.42, 1.5] },
    head: { x0: 0.42, x1: 0.84, y0: 0.88, y1: 0.98 }, grille: { x: 0.38, y0: 0.72, y1: 0.96 }, intake: { x: 0.5, y0: 0.52, y1: 0.62 },
    tail: { x0: 0.58, x1: 0.88, y0: 0.92, y1: 1.05 }, plate: [0.66, 0.8], clad: [0.44, 0.62, [0.07, 0.07, 0.07]], seams: [-0.98, 0.36, 1.3], handles: [0.14, 1.06], handleY: 0.98,
    mirror: -0.96, hub: 'steel', rim: [0.7, 0.71, 0.72], flare: 0.05, rails: [0.1, 0.1, 0.1], skid: true,
  },
  // monospace compact (4,4 m, d'après le Renault Scénic) : silhouette en un seul trait, capot court, pare-brise très incliné qui commence loin
  // devant, petite vitre de custode avant, pavillon haut, hayon presque droit
  mpv: {
    zf: -2.18, zr: 2.18, w: 0.88, r: 0.37, tw: 0.23, tx: 0.76, ax: [-1.38, 1.36], ra: 0.41, yb: 0.34, yf: 0.28, yr: 0.32, ym: 0.7, n: 3.4,
    top: [[-2.18, 0.76], [-1.95, 0.86], [-1.65, 0.93], [-1.42, 0.96], [-0.5, 0.97], [1.2, 1.0], [1.95, 1.03], [2.18, 1.0]],
    rc: [0.38, 0.3], rt: [0.14, 0.14], rb: [0.1, 0.1],
    gh: { wz0: -1.42, wz1: -0.42, rz1: 1.92, bz: 2.1, y1: 1.62, y1r: 1.58, ins: 0.07, b1: 0.68, rg: 0.08, cr: 0.04, win: [[-1.3, -1.0], [-0.92, 0.3], [0.42, 1.3], [1.42, 1.9]], noir: true, seat: [0.4, 1.6] },
    head: { x0: 0.4, x1: 0.84, y0: 0.76, y1: 0.86 }, grille: { x: 0.3, y0: 0.62, y1: 0.72, chrome: true }, intake: { x: 0.56, y0: 0.36, y1: 0.48 },
    tail: { x0: 0.6, x1: 0.86, y0: 0.84, y1: 0.97 }, plate: [0.5, 0.66], lip: 0.06, clad: [0.4, 0.48, [0.12, 0.12, 0.12]], seams: [-0.98, 0.3, 1.34], handles: [0.06, 1.08], handleY: 0.9,
    mirror: -1.12, hub: 'disc', chrome: true,
  },
  // crossover familial (4,4 m, d'après la Peugeot 3008) : caisse haute et galbée, capot plongeant, ligne de vitres qui remonte, pavillon qui
  // descend sur une lunette inclinée, petite custode, feux arrière hauts sur les ailes, bas de caisse noir, jantes alliage
  cross: {
    zf: -2.2, zr: 2.2, w: 0.9, r: 0.39, tw: 0.24, tx: 0.77, ax: [-1.32, 1.33], ra: 0.42, yb: 0.4, yf: 0.32, yr: 0.38, ym: 0.76, n: 3.5,
    top: [[-2.2, 0.84], [-1.95, 0.93], [-1.55, 0.99], [-1.15, 1.02], [-0.4, 1.04], [0.9, 1.09], [1.5, 1.13], [1.98, 1.12], [2.2, 1.06]],
    rc: [0.36, 0.32], rt: [0.12, 0.15], rb: [0.12, 0.1],
    gh: { wz0: -1.15, wz1: -0.3, rz1: 1.36, bz: 1.98, y1: 1.62, y1r: 1.54, ins: 0.09, b1: 0.66, rg: 0.07, cr: 0.035, win: [[-1.0, 0.26], [0.38, 1.18], [1.28, 1.58]], noir: true, seat: [0.36, 1.3] },
    head: { x0: 0.44, x1: 0.86, y0: 0.84, y1: 0.93 }, grille: { x: 0.42, y0: 0.6, y1: 0.86, chrome: true }, intake: { x: 0.6, y0: 0.4, y1: 0.5 },
    tail: { x0: 0.5, x1: 0.88, y0: 0.92, y1: 1.04 }, plate: [0.46, 0.76], lip: 0.07, clad: [0.4, 0.53, [0.08, 0.08, 0.08]], seams: [-1.0, 0.32, 1.26], handles: [0.08, 1.02], handleY: 0.95,
    mirror: -1.02, hub: 'disc', rim: [0.6, 0.61, 0.63], chrome: true,
  },
};
/* Ligne lissée (coins coupés, Chaikin), bouts gardés */
function carChaikin(P, it) {
  for (let k = 0; k < it; k++) {
    const Q = [P[0]];
    for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
    Q.push(P[P.length - 1]); P = Q;
  }
  return P;
}
/* Hauteur d'une ligne [z, y] (z croissants) en z */
function carPoly(P, z) {
  if (z <= P[0][0]) return P[0][1];
  for (let i = 1; i < P.length; i++) if (z <= P[i][0]) { const a = P[i - 1], b = P[i]; return lerp(a[1], b[1], (z - a[0]) / (b[0] - a[0] || 1)); }
  return P[P.length - 1][1];
}
/* Section de caisse s (superellipse de carré s.n) : demi-largeur à la hauteur y, hauteur du dessus à l'abscisse x */
function carXAt(s, y) { const t = y >= s.ym ? (y - s.ym) / (s.yt - s.ym) : (s.ym - y) / (s.ym - s.yb); return t >= 1 ? 0 : s.w * Math.pow(1 - Math.pow(t, s.n), 1 / s.n); }
function carYTop(s, x) { const t = Math.abs(x) / s.w; return t >= 1 ? s.ym : s.ym + (s.yt - s.ym) * Math.pow(1 - Math.pow(t, s.n), 1 / s.n); }
/* Formes d'une voiture d'après sa fiche (gardées sur la fiche) : sec(z) section de la caisse (bouts arrondis, bas qui suit les passages de
   roues), xAt et yTop, pied des vitres (b0, yBase), ligne de pavillon (yRoof), demi-profil du vitrage en z (gh : 6 points de côté, 3 d'angle,
   4 de pavillon) */
function carGeo(S) {
  if (S._geo) return S._geo;
  const g = S.gh, cy = S.r + 0.02, top = carChaikin(S.top, 3);
  const cut = (d, r) => (d >= r ? 0 : r - Math.sqrt(Math.max(0, r * r - (r - d) * (r - d)))); // retrait d'un quart de cercle de rayon r, à d du bout
  const sec = (z) => {
    const k = z - S.zf < S.zr - z ? 0 : 1, d = Math.max(0, k ? S.zr - z : z - S.zf);
    let yb = (z < S.ax[0] ? S.yf : z > S.ax[1] ? S.yr : S.yb) + cut(d, S.rb[k]);
    for (const az of S.ax) { const dz = Math.abs(z - az); if (dz < S.ra) yb = Math.max(yb, cy + Math.sqrt(S.ra * S.ra - dz * dz)); }
    const yt = carPoly(top, z) - cut(d, S.rt[k]);
    return { z, w: S.w - cut(d, S.rc[k]), yb, yt, ym: clamp(Math.max(S.ym, yb + 0.08), yb + 0.02, yt - 0.04), n: S.n };
  };
  const xAt = (y, z) => carXAt(sec(z), y), yTop = (x, z) => carYTop(sec(z), x), b0 = (z) => sec(z).w - g.ins, yBase = (z) => yTop(b0(z), z) - 0.004;
  const roof = carChaikin([[g.wz0, sec(g.wz0).yt - 0.01], [g.wz1, g.y1], [g.rz1, g.y1r], [g.bz, sec(g.bz).yt - 0.01]], 3), yRoof = (z) => carPoly(roof, z);
  const belt = yBase((g.wz1 + g.rz1) / 2), slope = (S.w - g.ins - g.b1) / (g.y1 - belt); // (rentrée des vitres par mètre de hauteur)
  const gh = (z) => {
    const yb = yBase(z), xb = b0(z), yT = Math.max(yb, yRoof(z) - g.cr), rc = Math.min(g.rg, yT - yb), L = yT - rc - yb, f = Math.min(1, L / 0.06), xT = xb - slope * L - rc;
    const P = [0, 0.02 * f, lerp(0.02 * f, L - 0.03 * f, 1 / 3), lerp(0.02 * f, L - 0.03 * f, 2 / 3), L - 0.03 * f, L].map((h) => [xb - slope * h, yb + h]);
    for (let i = 1; i <= 3; i++) { const a = (i / 3) * (Math.PI / 2); P.push([xT + rc * Math.cos(a), yT - rc + rc * Math.sin(a)]); }
    for (const x of [xT - 0.035, (xT - 0.035) * (2 / 3), (xT - 0.035) / 3, 0]) P.push([x, yT + g.cr * (1 - (x / xT) ** 2)]);
    return P;
  };
  return (S._geo = { sec, xAt, yTop, b0, yBase, yRoof, belt, gh, cy });
}
/* Boue projetée sur les flancs : une fine plaque de terre au bord haut déchiqueté, entre les passages de roues
   (segs : [[z0, z1], ...]) ; de y0 au bord haut (vers y1), des deux côtés d'une caisse de demi-largeur w (2,2 cm au-dessus de la tôle :
   les baguettes de protection en ont 1,4) */
function mudSkirt(M, w, segs, y0, y1, seed) {
  const R = rngOf(seed);
  M.save().color([0.5, 0.43, 0.35]); M.cls = 1;
  for (const sd of [-1, 1]) for (const [z0, z1] of segs) {
    const n = Math.max(2, Math.round((z1 - z0) / 0.07)), pts = [[z0, y0], [z1, y0]], low = y0 + (y1 - y0) * 0.3, ph = R() * TAU;
    for (let i = n; i >= 0; i--) { const z = lerp(z0, z1, i / n), k = 0.5 + 0.28 * Math.sin(z * 9 + ph) + 0.22 * (R() - 0.5); pts.push([z, i === 0 || i === n ? low : y0 + (y1 - y0) * clamp(k, 0.3, 1)]); }
    M.save().move(sd * (w + 0.022) + (sd > 0 ? 0.004 : 0), 0, 0).rotY(-Math.PI / 2); M.extrude('dirt', pts, 0.004, { sharp: 0.2 }); M.restore();
  }
  M.restore();
}
/* Habitacle vu derrière les vitres (repère de la voiture, avant vers -z) : garnitures sombres à hauteur de ceinture (la caisse est pleine
   en dessous), tableau de bord sous le pare-brise, volant à gauche (place du conducteur en France), sièges avant et banquette avec leurs
   appuie-tête, à la hauteur du vitrage. o : x (demi-largeur intérieure), za et zb (bas du pare-brise et de la lunette), Y0(z) et Y1(z)
   (ceinture et pavillon), zSeat (dossiers avant), zRear (dossier de la banquette), dash (profondeur du tableau de bord), noFloor (sans le
   plancher plat : la voiture pose le sien sur son haut de caisse bombé) */
function carInterior(M, o) {
  const { x, za, zb, Y0, Y1 } = o, fab = [0.075, 0.075, 0.08], trimI = [0.045, 0.045, 0.05]; // (sombres : l'habitacle est à l'ombre du pavillon)
  M.save(); M.cls = 1;
  // garnitures : un plancher sombre posé sur la caisse, de la planche de bord à la plage arrière (au-dessus du haut de caisse)
  if (!o.noFloor) { M.color(trimI); vQuad(M, 'dark', [-x, Y0(za) + 0.03, za], [x, Y0(za) + 0.03, za], [x, Y0(zb) + 0.03, zb], [-x, Y0(zb) + 0.03, zb], [0, 1, 0]); }
  // tableau de bord et volant
  const yd = Y0(za) + 0.03, hd = Math.min(0.16, (Y1(za + o.dash) - Y0(za)) * 0.3);
  M.color(trimI); M.boxB('plastic', -x + 0.02, x - 0.02, yd, yd + hd, za + 0.02, za + o.dash, { bevel: 0.03 });
  // volant : centré juste au-dessus de la ceinture (sa moitié basse est sous les garnitures), incliné vers le conducteur (o.wheelR : rayon)
  { const cx = -x * 0.5, cy = yd + 0.05, cz = za + o.dash + 0.08, r = o.wheelR || 0.17, pts = [];
    for (let i = 0; i <= 16; i++) { const a = (i / 16) * TAU; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9, cz + Math.sin(a) * r * 0.42]); }
    M.color([0.05, 0.05, 0.05]); M.tube('rubber', 0.018, pts, 5); M.tube('plastic', 0.02, [[cx, cy, cz], [cx, yd + hd * 0.5, za + o.dash - 0.04]], 5); M.save().move(cx, cy, cz).rotX(Math.PI / 2 - 0.4); M.cyl('plastic', 0.045, 0.03, 8); M.restore(); }
  // sièges : dossier et appuie-tête, à la hauteur que laisse le pavillon
  const seat = (sx, w, z) => {
    const y0 = Y0(z) + 0.03, room = Y1(z) - y0, hb = room * 0.48, hh = room * 0.72;
    M.color(fab); M.save().move(sx, y0 - 0.05, z).rotX(0.16); M.boxB('canvas', -w / 2, w / 2, 0, hb, -0.06, 0.06, { bevel: 0.04 }); M.restore();
    for (const hx of w > 0.9 ? [-0.42, 0, 0.42] : [0]) { M.save().move(sx + hx, y0, z + 0.02).rotX(0.16); M.boxB('canvas', -0.12, 0.12, hb + 0.03, hh, -0.05, 0.05, { bevel: 0.03 }); M.restore(); }
  };
  for (const sx of [-x * 0.5, x * 0.5]) seat(sx, Math.min(0.5, x * 0.62), o.zSeat);
  if (o.zRear > o.zSeat + 0.4) seat(0, x * 1.7, o.zRear);
  M.restore();
}
/* Habitacle évidé d'une cabine en bloc (4x4, camions ; repère du véhicule, avant vers -z) : parois minces de yb à yt sur le pourtour de
   [-X, X] x [z0, z1], percées là où sont les vitres, pour que l'habitacle se voie derrière elles. wins : [face, a0, a1, y0, y1], face 'g' et
   'd' (flancs en x = -X et +X, a le long de z), 'av' et 'ar' (faces en z0 et z1, a le long de x). Le dessous (ceinture) et le pavillon sont
   ceux du véhicule ; rc : angles arrière arrondis (les flancs et la face arrière s'arrêtent à rc du coin, le véhicule pose ses arrondis).
   Rend la demi-largeur intérieure */
function cabShell(M, mat, X, yb, yt, z0, z1, wins, th = 0.05, rc = 0) {
  const draw = (f, a0, a1, y0, y1) => {
    if (a1 - a0 < 0.005 || y1 - y0 < 0.005) return;
    if (f === 'g') M.boxB(mat, -X, -X + th, y0, y1, a0, a1); else if (f === 'd') M.boxB(mat, X - th, X, y0, y1, a0, a1);
    else if (f === 'av') M.boxB(mat, a0, a1, y0, y1, z0, z0 + th); else M.boxB(mat, a0, a1, y0, y1, z1 - th, z1);
  };
  const face = (f, A0, A1) => {
    const W = wins.filter((w) => w[0] === f), uniq = (v) => [...new Set(v.map((a) => +a.toFixed(4)))].sort((p, q) => p - q);
    const as = uniq([A0, A1, ...W.flatMap((w) => [clamp(w[1], A0, A1), clamp(w[2], A0, A1)])]), ys = uniq([yb, yt, ...W.flatMap((w) => [clamp(w[3], yb, yt), clamp(w[4], yb, yt)])]);
    for (let j = 0; j < ys.length - 1; j++) { // une rangée à la fois, les cases pleines voisines réunies en une seule paroi
      const ym = (ys[j] + ys[j + 1]) / 2; let run = null;
      for (let i = 0; i < as.length - 1; i++) {
        const am = (as[i] + as[i + 1]) / 2, hole = W.some((w) => am > w[1] && am < w[2] && ym > w[3] && ym < w[4]);
        if (hole) { if (run !== null) draw(f, run, as[i], ys[j], ys[j + 1]); run = null; } else if (run === null) run = as[i];
      }
      if (run !== null) draw(f, run, as[as.length - 1], ys[j], ys[j + 1]);
    }
  };
  face('g', z0, z1 - rc); face('d', z0, z1 - rc); face('av', -X + th, X - th); face('ar', -X + Math.max(th, rc), X - Math.max(th, rc));
  return X - th;
}
/* Caisse d'une voiture d'après sa fiche (carGeo). o.dust : peinture mate salie en bas (matière paint, boue au pied), vitres et pneus
   poussiéreux ; o.wreck : épave calcinée (tôle brûlée, rouille, sans vitres ni pneus, affaissée sur ses jantes, habitacle vide et sièges nus) */
function carBuild(M, P, S, o) {
  const wreck = !!o.wreck, body = wreck || o.dust ? 'paint' : 'carpaint', lo = wreck ? -S.r * 0.38 : 0, g = S.gh, G = carGeo(S), { sec, cy } = G;
  const trim = wreck ? [0.16, 0.15, 0.14] : [0.035, 0.035, 0.04], chrome = wreck ? [0.26, 0.23, 0.2] : S.chrome ? [0.85, 0.85, 0.85] : trim;
  const glassC = o.dust ? [0.6, 0.57, 0.52] : [0.2, 0.23, 0.26], rust = [0.3, 0.2, 0.14], burnt = [0.19, 0.18, 0.17], one = wreck ? burnt : [1, 1, 1], trimI = [0.05, 0.05, 0.055];
  P.tintable = wreck ? null : [body];
  M.local(1); M.save().move(0, lo, 0);
  // caisse : une surface continue, sections serrées aux bouts arrondis et autour des passages de roues
  const zs = [S.zr];
  for (let z = S.zf; z < S.zr; z += 0.25) zs.push(z);
  for (const [z0, d, k] of [[S.zf, 1, 0], [S.zr, -1, 1]]) { const R = Math.max(S.rc[k], S.rt[k], S.rb[k]); for (let i = 0; i <= 7; i++) zs.push(z0 + d * R * (1 - Math.cos((i / 7) * (Math.PI / 2)))); }
  for (const az of S.ax) { for (let i = 0; i <= 10; i++) zs.push(az + S.ra * Math.cos((i / 10) * Math.PI)); zs.push(az - S.ra - 0.004, az + S.ra + 0.004); }
  const Z = [...new Set(zs.map((z) => +clamp(z, S.zf, S.zr).toFixed(4)))].sort((a, b) => a - b).filter((z, i, A) => i === 0 || z - A[i - 1] > 0.006);
  M.aoFn = (x, y) => lerp(o.dust ? 0.45 : 0.55, 1, smoothstep(S.yb, S.ym + 0.25, y - lo));
  M.color(one); M.loft(body, Z.map(sec), 20);
  M.aoFn = null;
  // fond des passages de roues (derrière le pneu) et soubassement
  M.color([0.03, 0.03, 0.03]);
  for (const az of S.ax) M.boxB('dark', -S.w + 0.24, S.w - 0.24, S.yb - 0.06, cy + S.ra + 0.01, az - S.ra, az + S.ra);
  M.boxB('dark', -S.w + 0.15, S.w - 0.15, S.yb - 0.12, S.yb + 0.04, S.ax[0] + S.ra, S.ax[1] - S.ra);
  // habillage collé à la caisse : bande de flanc (côté sd, de z0 à z1, entre les hauteurs y0(s, z) et y1(s, z)) et pièce d'un bout (d = -1 avant,
  // +1 arrière ; de x0 à x1 et de y0 à y1), décollées de off le long de la normale
  const sideSkin = (mat, sd, z0, z1, y0, y1, off, nu, nv) => M.surf(mat, nu, nv, (u, v) => {
    const z = lerp(z0, z1, u), s = sec(z), y = lerp(y0(s, z), y1(s, z), v), e = 0.004, x = carXAt(s, y);
    const hy = (carXAt(s, y + e) - carXAt(s, y - e)) / (2 * e), hz = (G.xAt(y, z + e) - G.xAt(y, z - e)) / (2 * e), l = hyp3(1, hy, hz);
    return [sd * (x + off / l), y - (hy * off) / l, z - (hz * off) / l];
  }, { flipN: sd > 0, uL: z1 - z0, vL: 0.5 });
  const zEnd = (x, y, d) => {
    const inside = (z) => { if (z < S.zf || z > S.zr) return false; const s = sec(z); return y <= s.yt && y >= s.yb && Math.abs(x) <= carXAt(s, y); };
    let a = d < 0 ? S.zf - 0.01 : S.zr + 0.01, b = d < 0 ? S.ax[0] - S.ra : S.ax[1] + S.ra;
    if (!inside(b)) return b;
    for (let i = 0; i < 24; i++) { const m = (a + b) / 2; if (inside(m)) b = m; else a = m; }
    return b;
  };
  const endSkin = (mat, d, x0, x1, y0, y1, off, nu = 6, nv = 2) => M.surf(mat, nu, nv, (u, v) => {
    const x = lerp(x0, x1, u), y = lerp(y0, y1, v), e = 0.004, z = zEnd(x, y, d);
    const fx = (zEnd(x + e, y, d) - zEnd(x - e, y, d)) / (2 * e), fy = (zEnd(x, y + e, d) - zEnd(x, y - e, d)) / (2 * e), nx = -d * fx, ny = -d * fy, l = hyp3(nx, ny, 1);
    return [x + (nx * off) / l, y + (ny * off) / l, z + (d * off) / l];
  }, { flipN: d < 0, uL: x1 - x0, vL: y1 - y0 });
  const xEnd = (y, d) => carXAt(sec(d < 0 ? S.ax[0] - S.ra : S.ax[1] + S.ra), y) - 0.025; // (une pièce d'un bout s'arrête avant le flanc)
  const pair = (mat, d, x0, x1, y0, y1, off, nu) => { const a = Math.min(x1, xEnd(y0, d), xEnd(y1, d)); if (a > x0) { endSkin(mat, d, x0, a, y0, y1, off, nu); endSkin(mat, d, -a, -x0, y0, y1, off, nu); } };
  if (o.dust) { // boue au pied des flancs, bord haut déchiqueté
    M.color([0.5, 0.43, 0.35]); M.cls = 1;
    for (const sd of [-1, 1]) for (const [z0, z1] of [[S.ax[0] + S.ra + 0.02, S.ax[1] - S.ra - 0.02]]) sideSkin('dirt', sd, z0, z1, (s) => s.yb + 0.01, (s, z) => s.yb + 0.1 + 0.12 * clamp(0.5 + 0.3 * Math.sin(z * 9 + sd) + 0.2 * Math.sin(z * 23), 0, 1), 0.008, Math.round((z1 - z0) / 0.07), 1);
    M.cls = 0;
  }
  // vitrage : une surface posée sur l'épaule de caisse, du pied du pare-brise au pied de la lunette ; chaque case est vitre (transparente :
  // l'habitacle se voit, carInterior), montant, joint ou tôle ; les montants ont une doublure intérieure sombre. L'épave n'a plus de vitres
  const cuts = [g.wz0, g.wz0 + 0.035, g.wz1 - 0.05, g.wz1, g.rz1, g.rz1 + 0.05, g.bz - 0.03, g.bz, ...g.win.flat()].filter((z) => z >= g.wz0 && z <= g.bz).sort((a, b) => a - b).filter((z, i, A) => i === 0 || z - A[i - 1] > 0.005);
  const Zg = [];
  for (let i = 0; i < cuts.length - 1; i++) { const n = Math.max(1, Math.ceil((cuts[i + 1] - cuts[i]) / 0.2)); for (let k = 0; k < n; k++) Zg.push(lerp(cuts[i], cuts[i + 1], k / n)); }
  Zg.push(cuts[cuts.length - 1]);
  const cols = Zg.map((z) => { const R = G.gh(z); return [...R.map(([x, y]) => [-x, y, z]), ...R.slice(0, 12).reverse().map(([x, y]) => [x, y, z])]; }), NP = 25, NZ = cols.length;
  const arc = cols.map((F) => { let s = 0; return F.map((p, i) => (s += i ? hyp(p[0] - F[i - 1][0], p[1] - F[i - 1][1]) : 0)); });
  const nrm = cols.map((F, j) => F.map((p, i) => {
    const a = F[Math.max(0, i - 1)], b = F[Math.min(NP - 1, i + 1)], c = cols[Math.max(0, j - 1)][i], d = cols[Math.min(NZ - 1, j + 1)][i];
    const tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2], ux = d[0] - c[0], uy = d[1] - c[1], uz = d[2] - c[2];
    let nx = ty * uz - tz * uy, ny = tz * ux - tx * uz, nz = tx * uy - ty * ux; const l = hyp3(nx, ny, nz);
    if (l < 1e-9) { const q = hyp(p[0], 1); return [p[0] / q, 1 / q, 0]; }
    nx /= l; ny /= l; nz /= l;
    return nx * p[0] + ny * (p[1] - G.belt + 0.4) < 0 ? [-nx, -ny, -nz] : [nx, ny, nz];
  }));
  const wsZ = (z) => z > g.wz0 + 0.035 && z < g.wz1 - 0.05, rgZ = (z) => z > g.rz1 + 0.05 && z < g.bz - 0.03, lastW = g.win[g.win.length - 1][1];
  // s : rang sur le demi-profil (0 joint de ceinture, 1 à 3 vitre, 4 cadre haut, 5 à 7 angle du pavillon, 8 bord du pavillon, 9 à 11 pavillon)
  const kind = (s, z) => {
    const win = g.win.some(([a, b]) => z > a && z < b), pil = z < lastW && g.noir ? 'noir' : 'body';
    if (s === 0 || s === 4) return win ? 'joint' : pil;
    if (s <= 3) return win ? 'glass' : pil;
    if (s <= 7) return z < g.wz1 && g.noir ? 'noir' : 'body';
    if (z < g.wz1 || z > g.rz1) return s >= 9 && (wsZ(z) || rgZ(z)) ? 'glass' : 'noir';
    return 'body';
  };
  const gm = o.dust ? 'carglassD' : 'carglass', look = {
    glass: [gm, glassC, 1], body: [body, wreck ? rust : one, 0], noir: [wreck ? 'charred' : 'glass', trim, 0], joint: S.chrome && !wreck ? ['steel', chrome, 0] : [wreck ? 'charred' : 'glass', trim, 0],
  }; // (montants noir laqué : le verre lisse ; le plastique grenu y dessinait des motifs sous les reflets)
  const face = (mat, pts, ns, uvs, inner) => {
    const c = pts.map((p, k) => (inner ? [p[0] - ns[k][0] * 0.012, p[1] - ns[k][1] * 0.012, p[2] - ns[k][2] * 0.012] : p)), nn = inner ? ns.map((n) => [-n[0], -n[1], -n[2]]) : ns;
    const B = M.buf(mat, (c[0][0] + c[2][0]) / 2, (c[0][1] + c[2][1]) / 2, (c[0][2] + c[2][2]) / 2);
    const ids = c.map((p, k) => M.v(B, p[0], p[1], p[2], nn[k][0], nn[k][1], nn[k][2], uvs[k][0], uvs[k][1]));
    const ax = c[2][0] - c[0][0], ay = c[2][1] - c[0][1], az = c[2][2] - c[0][2], bx = c[3][0] - c[1][0], by = c[3][1] - c[1][1], bz = c[3][2] - c[1][2];
    const s = (ay * bz - az * by) * (nn[0][0] + nn[2][0]) + (az * bx - ax * bz) * (nn[0][1] + nn[2][1]) + (ax * by - ay * bx) * (nn[0][2] + nn[2][2]);
    if (s >= 0) M.quadI(B, ids[0], ids[1], ids[2], ids[3]); else M.quadI(B, ids[0], ids[3], ids[2], ids[1]);
  };
  for (let j = 0; j < NZ - 1; j++) for (let p = 0; p < NP - 1; p++) {
    const k = kind(p < 12 ? p : 23 - p, (Zg[j] + Zg[j + 1]) / 2);
    if (k === 'glass' && wreck) continue;
    const [mat, col, cls] = look[k], q = [[p, j], [p + 1, j], [p + 1, j + 1], [p, j + 1]];
    const pts = q.map(([i, jj]) => cols[jj][i]), ns = q.map(([i, jj]) => nrm[jj][i]), uvs = q.map(([i, jj]) => [Zg[jj], arc[jj][i]]);
    M.color(col); M.cls = cls; face(mat, pts, ns, uvs, false);
    if (k !== 'glass') { M.color(wreck ? burnt : trimI); M.cls = 1; face(wreck ? 'charred' : 'plastic', pts, ns, uvs, true); }
  }
  M.cls = 0;
  // habitacle : garnitures sombres sur le haut de caisse, tableau de bord, volant, sièges ; l'épave : bac noirci, sièges nus
  const b0 = G.b0((g.wz1 + g.rz1) / 2), dash = Math.min(0.42, (g.wz1 - g.wz0) * 0.5);
  M.color(trimI); M.cls = 1;
  M.surf('dark', 8, Math.ceil((g.bz - g.wz0) / 0.15), (u, v) => { const z = lerp(g.wz0 + 0.03, g.bz - 0.03, v), x = lerp(-1, 1, u) * (G.b0(z) - 0.015); return [x, G.yTop(x, z) + 0.006, z]; }, { flipN: true });
  M.cls = 0;
  if (!wreck) carInterior(M, { x: b0 - 0.07, za: g.wz0, zb: g.bz, Y0: (z) => sec(z).yt, Y1: G.yRoof, zSeat: g.seat[0], zRear: g.seat[1], dash, noFloor: true });
  else {
    const y0 = G.belt; M.color([0.3, 0.26, 0.22]);
    for (const z of [g.seat[0] - 0.42, g.seat[1] - 0.45]) for (const sd of [-1, 1]) { M.boxB('charred', sd * 0.12, sd * (b0 - 0.14), y0 - 0.25, y0 - 0.2, z, z + 0.48); M.boxB('charred', sd * 0.12, sd * (b0 - 0.14), y0 - 0.2, y0 + 0.3, z + 0.42, z + 0.48); }
    M.color([0.2, 0.19, 0.18]); M.boxB('charred', -b0 + 0.1, b0 - 0.1, sec(g.wz0).yt - 0.05, sec(g.wz0).yt + 0.08, g.wz0 + 0.04, g.wz0 + dash, { bevel: 0.02 });
    M.tube('steel', 0.016, Array.from({ length: 11 }, (_, i) => { const a = (i / 10) * TAU; return [-b0 * 0.5 + Math.cos(a) * 0.17, sec(g.wz0).yt + 0.12 + Math.sin(a) * 0.15, g.wz0 + dash + 0.08 + Math.sin(a) * 0.07]; }), 4);
  }
  // auvent d'essuie-glaces (collé au capot), essuie-glaces couchés sur le pare-brise
  M.color(trim); M.surf('plastic', 10, 2, (u, v) => { const z = lerp(g.wz0 - 0.1, g.wz0 + 0.03, v), x = lerp(-1, 1, u) * (G.b0(z) - 0.01); return [x, G.yTop(x, z) + 0.007, z]; }, { flipN: true });
  if (!wreck) {
    const wa = Math.atan2(g.y1 - G.yRoof(g.wz0), g.wz1 - g.wz0); M.cls = 2;
    for (const x of [-0.36, 0.16]) { M.save().move(x, G.yRoof(g.wz0 + 0.04) + 0.012, g.wz0 + 0.04).rotY(0.25).rotX(-wa); M.boxB('dark', -0.006, 0.006, 0, 0.012, 0, 0.5); M.restore(); }
    M.cls = 0;
  }
  // flancs : baguettes, joints de portes, poignées, rétroviseurs, élargisseurs d'ailes, barres de toit
  for (const sd of [-1, 1]) {
    if (S.clad) { const [c0, c1, cc] = S.clad; M.color(wreck ? trim : cc); sideSkin('plastic', sd, S.ax[0] + S.ra + 0.03, S.ax[1] - S.ra - 0.03, (s) => Math.max(c0, s.yb + 0.004), () => c1, 0.006, 10, 2); }
    M.color([0.04, 0.04, 0.04]); M.cls = 2;
    for (const z of S.seams) sideSkin('dark', sd, z - 0.004, z + 0.004, (s) => s.yb + 0.05, (s, zz) => G.yBase(zz) - 0.012, 0.0025, 1, 6);
    const hy = S.handleY || 0.76; M.color(wreck ? burnt : S.chrome ? chrome : one);
    for (const z of S.handles) { const x = G.xAt(hy + 0.015, z + 0.075); M.boxB(S.chrome ? 'steel' : body, sd * (x - 0.008), sd * (x + 0.012), hy, hy + 0.032, z, z + 0.15, { bevel: 0.01 }); }
    M.cls = 0;
    const mz = S.mirror, mx = G.b0(mz), my = G.yBase(mz) + 0.03; M.color(one);
    M.save().move(sd * mx, my, mz).rotY(sd * 0.12); M.boxB(body, sd > 0 ? 0 : -0.18, sd > 0 ? 0.18 : 0, 0, 0.12, -0.04, 0.08, { bevel: 0.04 });
    if (!wreck) { M.color([0.7, 0.72, 0.74]); M.cls = 1; M.boxB('glass', sd > 0 ? 0.02 : -0.16, sd > 0 ? 0.16 : -0.02, 0.02, 0.1, 0.08, 0.085); M.cls = 0; }
    M.restore();
    if (S.flare) {
      M.color(trim); const a0 = -Math.asin(clamp((cy - S.yb) / S.ra, -1, 1)), R = S.ra + S.flare * 0.6;
      for (const az of S.ax) M.tube('plastic', S.flare, Array.from({ length: 13 }, (_, i) => { const a = lerp(a0, Math.PI - a0, i / 12), z = az + R * Math.cos(a), y = cy + R * Math.sin(a), s = sec(z); return [sd * (carXAt(s, Math.max(y, s.yb + (s.ym - s.yb) * 0.4)) + S.flare * 0.2), y, z]; }), 5);
    }
    if (S.rails && !wreck) { const x = g.b1 - 0.1, dy = -g.cr * (x / g.b1) ** 2; M.color(S.rails); M.cls = 1; M.tube('steel', 0.022, [[sd * x, G.yRoof(g.wz1 + 0.12) + dy, g.wz1 + 0.12], [sd * x, G.yRoof(g.wz1 + 0.3) + dy + 0.06, g.wz1 + 0.3], [sd * x, G.yRoof(g.rz1 - 0.25) + dy + 0.06, g.rz1 - 0.25], [sd * x, G.yRoof(g.rz1 - 0.06) + dy, g.rz1 - 0.06]], 5); M.cls = 0; }
  }
  // pare-chocs rapportés (berline) : un boudin qui épouse le bout de la caisse et revient sur les ailes
  const [pb0, pb1, bs] = S.bumper || [0, 0, 0];
  if (S.bumper) {
    M.color(wreck ? burnt : trim);
    for (const [zt, d] of [[S.zf, -1], [S.zr, 1]]) {
      const ym = (pb0 + pb1) / 2, w = (z) => carXAt(sec(z), ym) + 0.025, secs = [{ z: zt + d * bs, w: w(zt) - 0.04, yb: pb0 + 0.01, yt: pb1 - 0.01, n: 6 }];
      for (let i = 0; i <= 6; i++) { const z = zt - d * 0.38 * (1 - Math.cos((i / 6) * (Math.PI / 2))); secs.push({ z: z + d * (i ? 0 : bs * 0.5), w: w(z), yb: pb0, yt: pb1, n: 8 }); }
      M.loft('plastic', d < 0 ? secs : secs.reverse(), 16);
    }
    if (S.chrome && !wreck) { M.color(chrome); M.cls = 1; for (const [zt, d] of [[S.zf, -1], [S.zr, 1]]) M.boxB('steel', -S.w + 0.2, S.w - 0.2, pb1 - 0.035, pb1 - 0.012, zt + d * bs - 0.004, zt + d * bs + 0.004); M.cls = 0; }
  }
  // bouts : lèvres noires, sabots, calandre, prise d'air, optiques enroulées sur les coins, plaques ; l'épave a ses optiques crevées
  if (S.lip) { M.color(wreck ? burnt : trim); endSkin('plastic', -1, -S.w + 0.15, S.w - 0.15, S.yf + 0.025, S.yf + S.lip, 0.004, 16, 1); endSkin('plastic', 1, -S.w + 0.15, S.w - 0.15, S.yr + 0.025, S.yr + S.lip, 0.004, 16, 1); }
  if (S.skid && !wreck) { M.color([0.62, 0.63, 0.64]); M.cls = 1; endSkin('plastic', -1, -0.44, 0.44, S.yf + 0.03, S.yf + 0.13, 0.007, 8, 1); endSkin('plastic', 1, -0.44, 0.44, S.yr + 0.03, S.yr + 0.12, 0.007, 8, 1); M.cls = 0; }
  const h = S.head, gr = S.grille, t = S.tail;
  M.color([0.03, 0.03, 0.03]); endSkin('dark', -1, -gr.x, gr.x, gr.y0, gr.y1, 0.004, 8, 2);
  if (S.intake) endSkin('dark', -1, -S.intake.x, S.intake.x, S.intake.y0, S.intake.y1, 0.004, 10, 1);
  if (!wreck) {
    M.color(gr.chrome ? chrome : [0.16, 0.16, 0.16]); M.cls = 2;
    for (let y = gr.y0 + 0.035; y < gr.y1 - 0.03; y += 0.045) endSkin('steel', -1, -gr.x + 0.02, gr.x - 0.02, y, y + 0.014, 0.009, 4, 1);
    if (gr.chrome) endSkin('steel', -1, -gr.x, gr.x, gr.y1 - 0.022, gr.y1, 0.011, 8, 1);
    M.cls = 1;
    M.color(trim); pair('plastic', -1, h.x0 - 0.012, h.x1 + 0.012, h.y0 - 0.012, h.y1 + 0.012, 0.005);
    M.color([1, 1, 1]); pair('lampOff', -1, h.x0, h.x1 - 0.07, h.y0, h.y1, 0.009); // (verre clair, une lueur : un verre réfléchissant restait noir face au sol)
    M.color([0.95, 0.55, 0.12]); pair('plastic', -1, h.x1 - 0.07, h.x1, h.y0, h.y1, 0.009, 4);
    M.color(trim); pair('plastic', 1, t.x0 - 0.012, t.x1 + 0.012, t.y0 - 0.012, t.y1 + 0.012, 0.005);
    M.color([0.7, 0.06, 0.04]); pair('plastic', 1, t.x0, t.x1, t.y0 + (t.y1 - t.y0) * 0.45, t.y1, 0.009);
    M.color([0.95, 0.5, 0.1]); pair('plastic', 1, t.x0, t.x1, t.y0 + (t.y1 - t.y0) * 0.2, t.y0 + (t.y1 - t.y0) * 0.45, 0.009);
    M.color([0.9, 0.9, 0.88]); pair('plastic', 1, t.x0, t.x1, t.y0, t.y0 + (t.y1 - t.y0) * 0.2, 0.009);
    M.color([0.95, 0.95, 0.9]); endSkin('plastic', -1, -0.26, 0.26, S.plate[0], S.plate[0] + 0.11, (S.bumper && S.plate[0] < pb1 ? bs : 0) + 0.012, 4, 1); endSkin('plastic', 1, -0.26, 0.26, S.plate[1], S.plate[1] + 0.11, 0.012, 4, 1);
    M.cls = 0;
  } else {
    M.color([0.03, 0.03, 0.03]); pair('dark', -1, h.x0, h.x1, h.y0, h.y1, 0.005); pair('dark', 1, t.x0, t.x1, t.y0, t.y1, 0.005);
  }
  { const y = S.yr + 0.03, ze = zEnd(S.w * 0.55, y + 0.03, 1); M.color([0.25, 0.25, 0.25]); M.cls = 2; M.tube('steel', 0.028, [[S.w * 0.55, y, ze - 0.4], [S.w * 0.55, y, ze + 0.03]], 6); M.cls = 0; } // échappement, juste sorti du bouclier
  M.restore();
  // roues ; l'épave repose sur ses jantes, une manque
  for (const az of S.ax) for (const sd of [-1, 1]) {
    if (wreck && az === S.ax[1] && sd > 0) continue;
    M.save().move(sd * S.tx, wreck ? lo : 0, az);
    wheel(M, S.r, S.tw, { noTire: wreck, side: sd, hub: wreck ? null : S.hub, rim: wreck ? [0.36, 0.3, 0.26] : S.rim || (S.hub === 'steel' ? [0.4, 0.4, 0.4] : [0.72, 0.72, 0.7]), tire: o.dust ? [0.78, 0.72, 0.64] : null });
    M.restore();
  }
  if (wreck) { M.save().move(S.tx + 0.05, 0, S.ax[1]).rotZ(-0.12); M.color([0.3, 0.26, 0.22]); M.boxB('charred', -0.05, 0.05, 0, S.r * 0.75, -0.18, 0.18); M.restore(); } // moyeu nu sur une cale
}
/* 4x4 tout-terrain (4,4 m roue de secours comprise, d'après le Jeep Wrangler à quatre portes ; 5.1, retour du propriétaire) : caisse en
   baignoire aux angles arrondis, capot plat entre deux ailes avant détachées, calandre à sept fentes entre deux phares ronds, élargisseurs
   d'ailes noirs trapézoïdaux, pare-brise droit, une vitre par porte et une custode, charnières de portes apparentes, marchepieds, roue de
   secours sur la porte arrière. o.rack : galerie chargée (jerricans, malle, pelle), tuba d'admission ; o.dust : boue et poussière ;
   o.wreck : épave calcinée */
function offroadBuild(M, P, o) {
  const wreck = !!o.wreck, body = wreck || o.dust ? 'paint' : 'carpaint', r = 0.44, lo = wreck ? -r * 0.38 : 0; // (roues de 0,38 m avant la 5.1 : trop petites dans leurs passages)
  const W = 0.82, zf = -2.0, zr = 2.0, ax = [-1.4, 1.4], tx = 0.74, sill = 0.5, belt = 1.12, roof = 1.9, zw = -0.66, rc = 0.14; // (pavillon à 1,98 m avant la 5.1 : vitres trop hautes)
  const trim = wreck ? [0.16, 0.15, 0.14] : [0.05, 0.05, 0.05], burnt = [0.19, 0.18, 0.17], rust = [0.3, 0.2, 0.14], one = wreck ? burnt : [1, 1, 1];
  P.tintable = wreck ? null : [body];
  M.local(1); M.save().move(0, lo, 0);
  M.aoFn = (x, y) => lerp(o.dust ? 0.42 : 0.55, 1, smoothstep(sill, belt + 0.1, y - lo));
  // passage de roue trapézoïdal (côté, [z, y]) autour de l'essieu az, agrandi de g
  const arch = (az, g) => [[az - 0.52 - g, 0.6], [az - 0.42 - g * 0.8, 0.88 + g * 0.5], [az - 0.28 - g * 0.4, 0.98 + g], [az + 0.28 + g * 0.4, 0.98 + g], [az + 0.42 + g * 0.8, 0.88 + g * 0.5], [az + 0.52 + g, 0.6]];
  const archTop = (z) => { const A = arch(ax[1], 0); if (z <= A[0][0] || z >= A[5][0]) return 0; return carPoly(A, z); };
  // baignoire (de l'auvent au hayon) : une surface continue presque carrée, coins arrière arrondis, passage de roue arrière découpé
  const cut = (d, k) => (d >= k ? 0 : k - Math.sqrt(Math.max(0, k * k - (k - d) * (k - d))));
  const tub = (z) => { const d = zr - z, yb = Math.max(sill, archTop(z)), yt = belt - cut(d, 0.06); return { z, w: W - cut(d, rc), yb, yt, ym: clamp(Math.max(0.8, yb + 0.08), yb + 0.02, yt - 0.04), n: 8 }; };
  const zs = [zw - 0.1, zr]; for (let z = zw - 0.1; z < zr; z += 0.2) zs.push(z);
  for (const [z] of arch(ax[1], 0)) zs.push(z - 0.004, z + 0.004);
  for (let i = 0; i <= 6; i++) zs.push(zr - rc * (1 - Math.cos((i / 6) * (Math.PI / 2))));
  M.color(one); M.loft(body, [...new Set(zs.map((z) => +z.toFixed(4)))].sort((a, b) => a - b).map(tub), 20);
  if (o.dust) mudSkirt(M, W, [[ax[0] + 0.55, ax[1] - 0.55], [ax[1] + 0.55, zr - 0.1]], sill, sill + 0.3, 11);
  // ailes avant détachées (dessus plat, découpe trapézoïdale), capot plat entre elles, face avant de la calandre
  const fender = [[zf + 0.02, 0.66], [zf + 0.02, 1.0], [zf + 0.14, 1.06], [zw - 0.04, 1.08], [zw - 0.04, 0.56], ...arch(ax[0], 0).reverse()];
  for (const sd of [-1, 1]) { M.save().move(sd > 0 ? 0.84 : -0.56, 0, 0).rotY(-Math.PI / 2); M.extrude(body, fender, 0.28, { sharp: 0.4 }); M.restore(); }
  M.boxB(body, -0.6, 0.6, 0.98, 1.13, zf + 0.04, zw - 0.02, { bevel: 0.045 });
  M.boxB(body, -0.62, 0.62, 0.6, 1.1, zf - 0.02, zf + 0.12, { bevel: 0.035 });
  M.boxB(body, -0.62, 0.62, 0.56, 1.0, zw - 0.14, zw - 0.04); // tablier, derrière le capot
  // élargisseurs d'ailes : un bandeau noir épais qui suit chaque découpe
  M.color(trim);
  for (const [az, x0, x1] of [[ax[0], 0.8, 0.95], [ax[1], 0.78, 0.93]]) for (const sd of [-1, 1]) {
    const ring = [...arch(az, -0.02), ...arch(az, 0.12).reverse()];
    M.save().move(sd > 0 ? x1 : -x0, 0, 0).rotY(-Math.PI / 2); M.extrude('plastic', ring, x1 - x0, { sharp: 0.4 }); M.restore();
  }
  // fond des passages de roues
  M.color([0.03, 0.03, 0.03]); for (const az of ax) M.boxB('dark', -W + 0.28, W - 0.28, sill - 0.04, 0.98, az - 0.5, az + 0.5);
  M.color(wreck ? rust : [1, 1, 1]);
  M.aoFn = null;
  // habitacle : évidé derrière ses vitres (l'épave garde son bloc, sans vitres ni intérieur) ; angles arrière arrondis, pavillon aux coins ronds
  const wins = [[zw + 0.2, 0.3], [0.46, 1.02], [1.18, 1.84]], wy0 = belt + 0.1, wy1 = roof - 0.14;
  if (wreck) M.boxB(body, -W, W, belt, roof - 0.06, zw + 0.06, zr - rc, { bevel: 0.03 });
  else cabShell(M, body, W, belt, roof - 0.06, zw + 0.06, zr, [['av', -0.72, 0.72, belt + 0.06, roof - 0.12], ['ar', -0.42, 0.42, 1.5, roof - 0.16],
    ...['g', 'd'].flatMap((f) => wins.map(([a, b]) => [f, a, b, wy0, wy1]))], 0.05, rc);
  for (const sd of [-1, 1]) { M.save().move(sd * (W - rc), belt, zr - rc); M.cyl(body, rc, roof - 0.06 - belt, 8, { a0: sd > 0 ? 0 : Math.PI / 2, a1: sd > 0 ? Math.PI / 2 : Math.PI, caps: '' }); M.restore(); }
  { const rr = [], n = 4; // pavillon : rectangle aux coins arrière arrondis, extrudé vers le bas
    rr.push([-W + 0.02, zw + 0.02], [W - 0.02, zw + 0.02]);
    for (let i = 0; i <= n; i++) { const a = (i / n) * (Math.PI / 2); rr.push([W - rc + (rc - 0.02) * Math.cos(a), zr - rc + (rc - 0.02) * Math.sin(a)]); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * (Math.PI / 2); rr.push([-W + rc + (rc - 0.02) * Math.cos(a), zr - rc + (rc - 0.02) * Math.sin(a)]); }
    M.save().move(0, roof, 0).rotX(Math.PI / 2); M.extrude(body, rr.map(([x, z]) => [x, z]), 0.08, { sharp: 0.6 }); M.restore(); }
  M.color(trim); M.boxB('plastic', -W - 0.012, W + 0.012, belt - 0.025, belt + 0.02, zw + 0.04, zr - rc); // joint du toit rigide sur la baignoire
  if (!wreck) carInterior(M, { x: W - 0.1, za: zw + 0.12, zb: zr - 0.1, Y0: () => belt - 0.02, Y1: () => roof - 0.06, zSeat: 0.4, zRear: 1.3, dash: 0.32 });
  // vitrage : pare-brise droit, une vitre par porte, custodes, vitre arrière (cadres de caoutchouc)
  const gl = wreck ? 'dark' : o.dust ? 'carglassD' : 'carglass'; M.color(wreck ? [0.04, 0.04, 0.04] : o.dust ? [0.6, 0.57, 0.52] : [0.2, 0.23, 0.26]); M.cls = 1;
  vQuad(M, gl, [-0.74, belt + 0.06, zw - 0.02], [0.74, belt + 0.06, zw - 0.02], [0.72, roof - 0.12, zw + 0.06], [-0.72, roof - 0.12, zw + 0.06], [0, 0.2, -1]);
  for (const sd of [-1, 1]) for (const [z0, z1] of wins) { const xx = sd * (W + 0.006); vQuad(M, gl, [xx, wy0, z0], [xx, wy0, z1], [xx, wy1, z1], [xx, wy1, z0], [sd, 0, 0]); }
  vQuad(M, gl, [-0.42, 1.5, zr + 0.006], [0.42, 1.5, zr + 0.006], [0.42, roof - 0.16, zr + 0.006], [-0.42, roof - 0.16, zr + 0.006], [0, 0, 1]);
  M.cls = 0; M.color(trim);
  // cadre du pare-brise (couleur caisse), joints noirs autour des vitres, joints de portes, charnières apparentes, poignées, rétroviseurs
  M.color(one); M.boxB(body, -0.8, 0.8, belt + 0.01, belt + 0.07, zw - 0.07, zw + 0.03, { bevel: 0.02 }); M.boxB(body, -0.78, 0.78, roof - 0.13, roof - 0.04, zw - 0.02, zw + 0.1, { bevel: 0.03 });
  for (const sd of [-1, 1]) M.tube(body, 0.04, [[sd * 0.77, belt + 0.05, zw - 0.02], [sd * 0.76, roof - 0.1, zw + 0.06]], 6);
  M.color(trim); M.cls = 2;
  for (const sd of [-1, 1]) {
    for (const [z0, z1] of wins) for (const [a, b, c, d] of [[z0 - 0.02, z1 + 0.02, wy0 - 0.02, wy0], [z0 - 0.02, z1 + 0.02, wy1, wy1 + 0.02], [z0 - 0.02, z0, wy0, wy1], [z1, z1 + 0.02, wy0, wy1]]) M.boxB('rubber', sd * (W - 0.002), sd * (W + 0.01), c, d, a, b);
    for (const z of [zw + 0.08, 0.4, 1.1]) M.boxB('dark', sd * W - 0.004, sd * W + 0.004, sill + 0.06, roof - 0.1, z - 0.004, z + 0.004);
    for (const z of [zw + 0.12, 0.44]) for (const y of [0.72, 1.0]) M.boxB('plastic', sd * (W - 0.004), sd * (W + 0.025), y, y + 0.07, z, z + 0.08, { bevel: 0.01 });
    for (const z of [0.12, 0.88]) M.boxB('plastic', sd * (W - 0.004), sd * (W + 0.022), belt - 0.1, belt - 0.07, z, z + 0.14, { bevel: 0.008 });
  }
  M.cls = 0;
  for (const sd of [-1, 1]) { M.save().move(sd * (W + 0.02), belt + 0.06, zw + 0.24).rotY(sd * 0.1); M.boxB('plastic', sd > 0 ? 0 : -0.2, sd > 0 ? 0.2 : 0, 0, 0.16, -0.04, 0.06, { bevel: 0.035 }); if (!wreck) { M.color([0.7, 0.72, 0.74]); M.cls = 1; M.boxB('glass', sd > 0 ? 0.02 : -0.18, sd > 0 ? 0.18 : -0.02, 0.02, 0.14, 0.06, 0.066); M.cls = 0; M.color(trim); } M.restore(); }
  // calandre à sept fentes, phares ronds cerclés à ses deux bouts, clignotants sur les ailes ; pare-chocs poutre, antibrouillards, crochets
  M.color([0.03, 0.03, 0.03]); for (let i = 0; i < 7; i++) { const x = (i - 3) * 0.105; M.boxB('dark', x - 0.034, x + 0.034, 0.68, 1.02, zf - 0.03, zf - 0.015, { bevel: 0.012 }); }
  for (const sd of [-1, 1]) {
    M.save().move(sd * 0.5, 0.88, zf - 0.02).rotX(-Math.PI / 2);
    M.color(wreck ? burnt : [0.6, 0.6, 0.6]); M.cyl('steel', 0.12, 0.03, 16, { caps: 't' });
    M.color(wreck ? [0.04, 0.04, 0.04] : [1, 1, 1]); M.cyl(wreck ? 'dark' : 'lampOff', 0.095, 0.036, 16, { r1: 0.09, caps: 't' });
    M.restore();
    if (!wreck) { M.color([0.95, 0.55, 0.12]); M.cls = 1; M.boxB('plastic', sd * 0.64, sd * 0.8, 0.98, 1.02, zf + 0.06, zf + 0.16); M.color([0.7, 0.06, 0.04]); M.boxB('plastic', sd * 0.66, sd * 0.8, 0.62, 0.92, zr - 0.06, zr + 0.012); M.cls = 0; }
  }
  M.color(wreck ? burnt : trim);
  M.boxB('steel', -0.92, 0.92, 0.46, 0.66, zf - 0.18, zf - 0.02, { bevel: 0.03 }); M.boxB('steel', -0.86, 0.86, 0.5, 0.64, zr - 0.03, zr + 0.1, { bevel: 0.03 });
  if (!wreck) { M.color([0.95, 0.95, 0.9]); M.cls = 1; for (const sd of [-1, 1]) { M.save().move(sd * 0.68, 0.56, zf - 0.185).rotX(-Math.PI / 2); M.cyl('lampOff', 0.045, 0.012, 10, { caps: 't' }); M.restore(); } M.boxB('plastic', -0.26, 0.26, 0.5, 0.61, zf - 0.19, zf - 0.182); M.cls = 0; }
  M.color(trim); M.cls = 2; for (const sd of [-1, 1]) M.tube('steel', 0.022, [[sd * 0.42, 0.5, zf - 0.18], [sd * 0.42, 0.46, zf - 0.26], [sd * 0.42, 0.56, zf - 0.26]], 5); M.cls = 0;
  for (const sd of [-1, 1]) { M.color(trim); M.boxB('steel', sd * 0.6, sd * 0.9, sill - 0.1, sill - 0.03, ax[0] + 0.56, ax[1] - 0.56, { bevel: 0.015 }); }
  // roue de secours sur la porte arrière, charnières
  M.save().move(0.1, 1.02 - r, zr + 0.17).rotY(Math.PI / 2); wheel(M, r, 0.26, { noTire: wreck, side: -1, hub: wreck ? null : 'steel', rim: wreck ? [0.36, 0.3, 0.26] : [0.85, 0.85, 0.82], tread: wreck ? 0 : 14, tire: o.dust ? [0.72, 0.66, 0.58] : null }); M.restore();
  M.color(trim); M.cls = 2; for (const y of [0.75, 1.55]) M.boxB('steel', -0.8, -0.72, y, y + 0.08, zr - 0.01, zr + 0.03); M.cls = 0;
  // galerie et tuba
  if (o.rack) {
    M.color([0.12, 0.12, 0.12]); M.cls = 1;
    for (const sd of [-1, 1]) M.tube('steel', 0.02, [[sd * 0.74, roof + 0.02, zw + 0.2], [sd * 0.74, roof + 0.14, zw + 0.3], [sd * 0.74, roof + 0.14, zr - 0.1], [sd * 0.74, roof + 0.02, zr - 0.05]], 5);
    for (let z = zw + 0.4; z < zr - 0.1; z += 0.45) M.tube('steel', 0.016, [[-0.74, roof + 0.13, z], [0.74, roof + 0.13, z]], 4);
    M.cls = 0;
    M.color(wreck ? burnt : [0.3, 0.36, 0.24]); for (const x of [-0.5, -0.2]) M.boxB('paint', x - 0.12, x + 0.12, roof + 0.14, roof + 0.6, 1.2, 1.55, { bevel: 0.02 });
    M.color(wreck ? burnt : [0.24, 0.26, 0.2]); M.boxB('paint', 0.05, 0.65, roof + 0.14, roof + 0.44, 0.2, 1.0, { bevel: 0.03 });
    M.color(wreck ? burnt : [0.42, 0.4, 0.34]); M.boxB('canvas', -0.65, -0.05, roof + 0.14, roof + 0.36, -0.2, 0.75, { bevel: 0.06 });
    M.color(trim); M.tube('steel', 0.05, [[0.9, 0.9, zf + 0.5], [0.92, belt + 0.05, zw - 0.05], [0.86, roof - 0.05, zw + 0.02], [0.86, roof + 0.08, zw + 0.06]], 6);
  }
  M.restore();
  // roues (pneus tout-terrain) ; l'épave repose sur ses jantes, une manque
  for (const az of ax) for (const sd of [-1, 1]) {
    if (wreck && az === ax[1] && sd > 0) continue;
    M.save().move(sd * tx, lo, az);
    wheel(M, r, 0.26, { noTire: wreck, side: sd, hub: wreck ? null : 'steel', rim: wreck ? [0.36, 0.3, 0.26] : [0.85, 0.85, 0.82], tread: 14, tire: o.dust ? [0.72, 0.66, 0.58] : null });
    M.restore();
  }
}
/* Voiture : model 'sedan' (berline), 'hatch' (citadine), 'suv', 'mpv', 'cross' (familiales hautes), 'offroad' (4x4) ; o : { dust, wreck, rack } (voir carBuild, offroadBuild).
   Ancienne écriture : PF.car(true) pour la berline calcinée. Les collisions du modèle sont dans pf.vcols */
PF.car = (model = 'sedan', o = {}) => {
  if (model === true || model === false) { o = { wreck: model }; model = 'sedan'; }
  const key = `car_${model}_${o.dust ? 1 : 0}${o.wreck ? 1 : 0}${o.rack ? 1 : 0}`;
  return prefab(key, (M, P) => {
    if (model === 'offroad') offroadBuild(M, P, o); else carBuild(M, P, CAR_SPECS[model], o);
    P.vcols = vehCols(model, o);
  });
};
/* Collisions d'un véhicule (repère du prefab) : [[x0, x1, y0, y1, z0, z1], ...]. Voitures : la caisse en trois tronçons (capot, ceinture,
   malle ou hayon), d'un pare-chocs à l'autre, puis l'habitacle en deux étages qui restent sous le vitrage incliné ; l'épave est plus basse (affaissée sur ses jantes) */
function vehCols(model, o = {}) {
  const S = CAR_SPECS[model];
  if (S) {
    const g = S.gh, G = carGeo(S), lo = o.wreck ? -S.r * 0.38 : 0, y0 = G.belt, b0 = S.w - g.ins, ym = (y0 + g.y1) / 2, bs = S.bumper ? S.bumper[2] : 0;
    const hood = G.sec((S.zf + g.wz0) / 2).yt, deck = G.sec((g.bz + S.zr) / 2).yt;
    return [[-S.w - 0.01, S.w + 0.01, 0, hood + lo, S.zf - bs, g.wz0], [-S.w - 0.01, S.w + 0.01, 0, y0 + lo, g.wz0, g.bz], [-S.w - 0.01, S.w + 0.01, 0, deck + lo, g.bz, S.zr + bs],
      [-(b0 + g.b1) / 2, (b0 + g.b1) / 2, y0 + lo, ym + lo, (g.wz0 + g.wz1) / 2, (g.rz1 + g.bz) / 2, 'vitre'],
      [-g.b1, g.b1, ym + lo, Math.min(g.y1, g.y1r) + 0.02 + lo, g.wz1, g.rz1, 'vitre']]; // (habitacle vitré : balles et vue passent)
  }
  if (model === 'offroad') {
    const lo = o.wreck ? -0.38 * 0.38 : 0;
    return [[-0.95, 0.95, 0, 1.12 + lo, -2.18, 2.1], [-0.82, 0.82, 1.12 + lo, 1.9 + lo, -0.6, 2.0, o.wreck ? undefined : 'vitre'], [-0.26, 0.46, 0.66 + lo, 1.38 + lo, 2.1, 2.28]];
  }
  return truckCols(model, o);
}
/* Pose un véhicule et ses collisions (pf.vcols) au point (x, y, z), tourné de rot ; o : options de DECOR.place (tint...) */
function vehicle(pf, x, y, z, rot, o) {
  DECOR.place(pf, x, y, z, rot, o);
  if (pf.vcols && !(o && o.nocol)) colShape(x, y, z, rot, pf.vcols, 'metal');
}
PF.bicycle = () => prefab('bicycle', (M, P) => {
  P.tintable = ['paint'];
  M.local(1);
  for (const z of [-0.52, 0.52]) { M.save().move(0, 0.34, z); M.color([0.1, 0.1, 0.1]); M.save().rotZ(Math.PI / 2); M.lathe('rubber', [[0.3, -0.018], [0.34, -0.012], [0.345, 0.0], [0.34, 0.012], [0.3, 0.018], [0.3, -0.018]], 16, { sharp: 1.2 }); M.restore(); M.color([0.7, 0.7, 0.7]); M.cls = 2; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; M.tube('steel', 0.003, [[0, Math.cos(a) * 0.3, Math.sin(a) * 0.3], [0, -Math.cos(a) * 0.3, -Math.sin(a) * 0.3]], 3); } M.cls = 0; M.restore(); }
  M.color([1, 1, 1]);
  const bb = [0, 0.3, 0.02], seat = [0, 0.8, -0.12], head = [0, 0.82, 0.38];
  M.tube('paint', 0.02, [bb, seat], 6); M.tube('paint', 0.02, [bb, head], 6); M.tube('paint', 0.018, [seat, [0, 0.8, 0.36]], 6);
  M.tube('paint', 0.014, [bb, [0, 0.34, -0.52]], 5); M.tube('paint', 0.014, [seat, [0, 0.34, -0.52]], 5);
  M.tube('paint', 0.016, [head, [0, 0.34, 0.52]], 5);
  M.color([0.12, 0.12, 0.12]); M.tube('steel', 0.012, [[-0.25, 0.98, 0.34], [0, 0.95, 0.38], [0.25, 0.98, 0.34]], 5); M.tube('steel', 0.014, [head, [0, 0.95, 0.38]], 5);
  M.save().move(0, 0.82, -0.14); M.boxB('rubber', -0.06, 0.06, 0, 0.05, -0.12, 0.1, { bevel: 0.02 }); M.restore();
});
/* Mobylette (cyclomoteur) sur sa béquille */
PF.moped = () => prefab('moped', (M, P) => {
  P.tintable = ['carpaint'];
  M.local(1);
  for (const z of [-0.58, 0.55]) { M.save().move(0, 0, z); wheel(M, 0.25, 0.07, { rim: [0.6, 0.6, 0.58] }); M.restore(); }
  M.color([1, 1, 1]);
  M.loft('carpaint', [{ z: -0.62, w: 0.12, yb: 0.45, yt: 0.62, n: 3 }, { z: -0.2, w: 0.15, yb: 0.38, yt: 0.66, n: 3 }, { z: 0.05, w: 0.1, yb: 0.36, yt: 0.5, n: 3 }], 10, { smooth: true });
  M.loft('carpaint', [{ z: 0.2, w: 0.14, yb: 0.45, yt: 0.8, n: 3 }, { z: 0.36, w: 0.16, yb: 0.4, yt: 0.95, n: 3 }], 10);
  M.color([0.12, 0.12, 0.12]); M.save().move(0, 0.66, -0.35); M.boxB('rubber', -0.12, 0.12, 0, 0.08, -0.3, 0.2, { bevel: 0.03 }); M.restore();
  M.color([0.55, 0.55, 0.55]);
  M.tube('steel', 0.02, [[0, 0.25, 0.55], [0, 0.95, 0.42]], 5); M.tube('steel', 0.015, [[-0.3, 1.0, 0.4], [0.3, 1.0, 0.4]], 5);
  M.save().move(0, 0.93, 0.47).rotX(Math.PI / 2); M.cyl('glass', 0.06, 0.05, 8); M.restore();
  M.tube('steel', 0.02, [[0.1, 0.3, -0.1], [0.14, 0.28, -0.5], [0.14, 0.34, -0.72]], 5);
  M.tube('steel', 0.012, [[0, 0.25, -0.1], [0.12, 0.02, -0.02]], 4);
});
/* ---------- Camions ---------- */
/* Couleurs communes : garnitures noires, tôle brûlée et rouille des épaves */
var TRK = { trim: [0.1, 0.1, 0.1], burnt: [0.19, 0.18, 0.17], rust: [0.3, 0.2, 0.14], tarp: [0.6, 0.6, 0.46] };
/* Rétroviseur de camion sur deux bras, côté sd, attaché à la cabine en (x, y, z) */
function truckMirror(M, sd, x, y, z, wreck) {
  M.color(wreck ? TRK.burnt : TRK.trim); M.cls = 1;
  M.tube('steel', 0.016, [[sd * x, y + 0.25, z], [sd * (x + 0.26), y + 0.25, z], [sd * (x + 0.28), y + 0.2, z]], 4);
  M.tube('steel', 0.016, [[sd * x, y - 0.2, z], [sd * (x + 0.26), y - 0.2, z], [sd * (x + 0.28), y - 0.15, z]], 4);
  M.boxB('plastic', sd * (x + 0.24), sd * (x + 0.33), y - 0.25, y + 0.3, z - 0.06, z + 0.04, { bevel: 0.015 });
  if (!wreck) { M.color([0.7, 0.72, 0.74]); M.boxB('glass', sd * (x + 0.25), sd * (x + 0.32), y - 0.23, y + 0.28, z + 0.04, z + 0.046); }
  M.cls = 0;
}
/* Vitre posée à plat sur une face de cabine, avec son joint de caoutchouc : rectangle (a0..a1, y0..y1) sur la face normale à l'axe ax
   ('x' : face latérale en x = c, côté sd ; 'z' : face avant ou arrière en z = c, côté sd) */
function truckPane(M, ax, sd, c, a0, a1, y0, y1, wreck, dust) {
  const t = 0.012, e = 0.025;
  M.color(TRK.trim); M.cls = 1;
  // joint : un cadre de quatre baguettes autour de la vitre (une plaque pleine cachait la cabine derrière la vitre transparente)
  const n0 = sd * c - (sd > 0 ? 0.003 : t + 0.004), n1 = sd * c + (sd > 0 ? t + 0.004 : 0.003);
  for (const [b0, b1, h0, h1] of [[a0 - e, a1 + e, y0 - e, y0], [a0 - e, a1 + e, y1, y1 + e], [a0 - e, a0, y0, y1], [a1, a1 + e, y0, y1]]) {
    if (ax === 'x') M.boxB('rubber', n0, n1, h0, h1, b0, b1); else M.boxB('rubber', b0, b1, h0, h1, n0, n1);
  }
  M.color(wreck ? [0.04, 0.04, 0.04] : dust ? [0.6, 0.57, 0.52] : [0.2, 0.23, 0.26]); const m = wreck ? 'dark' : dust ? 'carglassD' : 'carglass', o = t + 0.008; // (vitre transparente : cabine évidée derrière, cabShell)
  // une seule face de verre (une boîte en superposait deux, la cabine ne se voyait plus derrière) ; l'épave garde ses vitres noircies
  const p = sd * (c + o);
  if (wreck) { if (ax === 'x') M.boxB(m, sd * c - (sd > 0 ? 0 : o), sd * c + (sd > 0 ? o : 0), y0, y1, a0, a1); else M.boxB(m, a0, a1, y0, y1, sd * c - (sd > 0 ? 0 : o), sd * c + (sd > 0 ? o : 0)); }
  else if (ax === 'x') vQuad(M, m, [p, y0, a0], [p, y0, a1], [p, y1, a1], [p, y1, a0], [sd, 0, 0]);
  else vQuad(M, m, [a0, y0, p], [a1, y0, p], [a1, y1, p], [a0, y1, p], [0, 0, sd]);
  M.cls = 0;
}
/* Roues d'un camion : axles [[z, jumelées], ...], rayon r, largeur tw, voie tx ; o : { tread, hub, rim, wreck, lo } */
function truckWheels(M, axles, r, tw, tx, o) {
  for (const [z, dual] of axles) for (const sd of [-1, 1]) for (const k of dual ? [0, 1] : [0]) {
    if (o.wreck && z === axles[axles.length - 1][0] && sd > 0) continue; // l'épave a perdu une roue
    M.save().move(sd * (tx - k * (tw + 0.03)), o.wreck ? o.lo : 0, z);
    wheel(M, r, tw, { side: sd, noTire: !!o.wreck, tread: o.tread, hub: o.wreck ? null : o.hub, rim: o.wreck ? [0.34, 0.28, 0.24] : o.rim });
    M.restore();
  }
}
/* Plateau à ridelles : plancher (yf) de z0 à z1, ridelles jusqu'à ys, ranchers, lisse haute, hayon, ridelle avant jusqu'à yh ; demi-largeur W.
   Garde-boue derrière chaque roue arrière (zm) */
function truckBed(M, body, z0, z1, yf, ys, yh, W, zm, wreck) {
  M.color(wreck ? TRK.rust : [1, 1, 1]);
  M.boxB(body, -W, W, yf - 0.16, yf, z0, z1, { bevel: 0.02 });
  for (const sd of [-1, 1]) M.boxB(body, sd * (W - 0.05), sd * W, yf, ys, z0, z1, { bevel: 0.01 });
  M.boxB(body, -W, W, yf, ys, z1 - 0.06, z1, { bevel: 0.01 });
  M.boxB(body, -W, W, yf, yh, z0, z0 + 0.06, { bevel: 0.01 });
  // ranchers, lisses, charnières du hayon, longerons sous le plancher, barre anti-encastrement
  M.color(wreck ? TRK.burnt : [0.82, 0.82, 0.8]); M.cls = 1;
  const n = Math.max(2, Math.round((z1 - z0) / 1.1));
  for (const sd of [-1, 1]) {
    for (let i = 0; i <= n; i++) M.boxB(body, sd * W - (sd > 0 ? 0.004 : 0.03), sd * W + (sd > 0 ? 0.03 : 0.004), yf - 0.05, ys + 0.02, lerp(z0 + 0.05, z1 - 0.05, i / n) - 0.04, lerp(z0 + 0.05, z1 - 0.05, i / n) + 0.04);
    M.boxB(body, sd * W - (sd > 0 ? 0.004 : 0.024), sd * W + (sd > 0 ? 0.024 : 0.004), (yf + ys) / 2 - 0.025, (yf + ys) / 2 + 0.025, z0, z1);
  }
  M.color(TRK.trim);
  for (const x of [-0.75, 0.75]) M.boxB('steel', x - 0.04, x + 0.04, ys - 0.16, ys - 0.08, z1, z1 + 0.035);
  for (const sd of [-1, 1]) M.boxB('steel', sd * 0.45, sd * 0.6, yf - 0.36, yf - 0.16, z0, z1);
  M.boxB('steel', -W + 0.1, W - 0.1, 0.5, 0.62, z1 - 0.12, z1 - 0.04);
  M.cls = 0;
  for (const sd of [-1, 1]) { M.color(wreck ? TRK.burnt : [0.06, 0.06, 0.06]); M.boxB('rubber', sd * (W - 0.4), sd * (W - 0.02), 0.22, yf - 0.2, zm, zm + 0.025); }
}
/* Bâche sur arceaux : de z0 à z1, des ridelles (ys) jusqu'à yt, demi-largeur W ; arceaux en relief, sangles, rabat arrière roulé.
   La bâche est une toile simulée (Maker.toile) : sanglée sur les ridelles et tenue par les arceaux, elle se gonfle entre eux au vent et
   claque sous un souffle ; les deux pignons restent rigides. Épave : arceaux nus et un lambeau de toile qui pend et bat au vent */
function truckTarp(M, z0, z1, ys, yt, W, wreck) {
  if (wreck) {
    M.color(TRK.burnt); M.cls = 1;
    for (let i = 0; i <= 4; i++) { const z = lerp(z0 + 0.1, z1 - 0.1, i / 4), arc = []; for (let k = 0; k <= 8; k++) { const a = (k / 8) * Math.PI; arc.push([Math.cos(a) * (W - 0.04), ys + Math.pow(Math.sin(a), 0.35) * (yt - ys - 0.05), z]); } if (i !== 2) M.tube('steel', 0.025, arc, 4); }
    M.color([0.24, 0.22, 0.18]); M.toile(4, 2, (u, v) => [lerp(-W + 0.05, -W + 0.6, u), lerp(yt - 0.2, ys + 0.2, v * v), z1 - 0.6 + Math.sin(u * 3) * 0.06], { uL: 0.6, vL: 1, genre: 'pendu', play: 0.5, glow: 0, pin: (u, v) => v <= 0 && (u <= 0 || u >= 1) });
    M.cls = 0; return;
  }
  const ym = ys; // la toile tombe sur le haut des ridelles
  M.color(TRK.tarp);
  // profil : la jupe sanglée sur la ridelle (12 cm), puis l'arc des arceaux (superellipse) ; u de la ridelle gauche à la droite
  const sk = 0.06, Wt = W + 0.015, prof = (u) => {
    if (u < sk) return [-Wt, ys - 0.12 + (u / sk) * 0.12];
    if (u > 1 - sk) return [Wt, ys - 0.12 + ((1 - u) / sk) * 0.12];
    const a = Math.PI * (1 - (u - sk) / (1 - 2 * sk)), c = Math.cos(a), sn = Math.max(0, Math.sin(a));
    return [Math.sign(c) * Math.pow(Math.abs(c), 1 / 3) * Wt, ym + Math.pow(sn, 1 / 3) * (yt - ym)];
  };
  const arches = [1, 2, 3, 4].map((i) => lerp(z0, z1, i / 5)), dz = (z1 - z0) / 12;
  M.toile(22, 8, (u, v) => { const q = prof(u); return [q[0], q[1], lerp(z0, z1, v)]; }, { uL: 2 * Wt + 2 * (yt - ym), vL: z1 - z0, flipN: true, play: 0.1, glow: 0.15,
    pin: (u, v) => u <= sk || u >= 1 - sk || v <= 0 || v >= 1 || arches.some((z) => Math.abs(lerp(z0, z1, v) - z) < dz * 0.6) });
  // pignons (rigides)
  for (const [z, s] of [[z0, -1], [z1, 1]]) M.surf('canvas', 16, 1, (u, v) => { const q = prof(u); return [q[0] * (1 - v), lerp(q[1], ys - 0.12, v), z]; }, { uL: 2 * Wt, vL: yt - ys, flipN: s > 0 });
  M.color([0.52, 0.52, 0.4]); M.cls = 1;
  for (let i = 1; i < 5; i++) {
    const z = lerp(z0, z1, i / 5), arc = [];
    for (let k = 0; k <= 12; k++) { const a = (k / 12) * Math.PI, c = Math.cos(a), sn = Math.sin(a); arc.push([Math.sign(c) * Math.pow(Math.abs(c), 1 / 3) * (W + 0.02), ym + Math.pow(sn, 1 / 3) * (yt - ym + 0.008), z]); }
    M.tube('canvas', 0.03, arc.filter((p) => p[1] > ys - 0.02), 5);
  }
  // rabat arrière roulé, sangles sur les ridelles
  M.color([0.48, 0.48, 0.37]); M.save().move(-W + 0.08, yt - 0.28, z1 + 0.05).rotZ(-Math.PI / 2); M.cyl('canvas', 0.09, 2 * W - 0.16, 8); M.restore();
  M.color([0.18, 0.18, 0.15]); M.cls = 2;
  for (let i = 0; i <= 5; i++) for (const sd of [-1, 1]) { const z = lerp(z0 + 0.25, z1 - 0.25, i / 5); M.boxB('dark', sd * (W + 0.018) - 0.006, sd * (W + 0.018) + 0.006, ys - 0.25, ys + 0.12, z - 0.02, z + 0.02); }
  M.cls = 0;
}
/* Chargement arrimé d'un plateau ouvert (caisses de bois, pile bâchée, sangles) entre z0 et z1, sur le plancher yf ; renvoie ses boîtes */
function truckCargo(M, z0, z1, yf, W, wreck) {
  const boxes = [[-W + 0.15, -0.05, yf, yf + 0.75, z0 + 0.25, z0 + 1.35], [0.1, W - 0.15, yf, yf + 0.6, z0 + 0.25, z0 + 1.15], [-W + 0.15, W - 0.15, yf, yf + 0.9, z1 - 1.6, z1 - 0.3]];
  M.color(wreck ? TRK.burnt : [0.85, 0.8, 0.7]); for (const b of boxes.slice(0, 2)) M.boxB(wreck ? 'charred' : 'crate', b[0], b[1], b[2], b[3], b[4], b[5], { bevel: 0.02 });
  const c = boxes[2]; M.color(wreck ? TRK.burnt : [0.44, 0.46, 0.34]);
  M.loft('canvas', [{ z: c[4], w: (c[1] - c[0]) / 2, yb: yf, yt: c[3], ym: yf + 0.3, n: 5 }, { z: c[5], w: (c[1] - c[0]) / 2, yb: yf, yt: c[3], ym: yf + 0.3, n: 5 }], 14, { caps: true });
  M.color([0.16, 0.16, 0.13]); M.cls = 2;
  for (const b of boxes) for (const z of [b[4] + 0.25, b[5] - 0.25]) M.tube('dark', 0.012, [[b[0] - 0.01, yf + 0.01, z], [b[0] - 0.01, b[3] + 0.01, z], [b[1] + 0.01, b[3] + 0.01, z], [b[1] + 0.01, yf + 0.01, z]], 3);
  M.cls = 0;
  return boxes;
}
/* Camion militaire 6x6 (7,7 x 2,5 m, d'après le Renault GBC de l'armée française ; 5.1, retour du propriétaire : il avait un capot) :
   cabine avancée posée sur l'essieu avant, pare-brise plat en deux, calandre noire à lames entre deux blocs de phares ronds, grandes ailes
   arrondies sur les roues avant, pare-chocs noir à feux ronds et manilles, marchepieds sous la porte, roue de secours derrière la cabine,
   cheminée et prise d'air, réservoir, coffre, plateau à ridelles ; load : 'tarp' (bâché), 'open' (chargement arrimé) */
function armyTruckBuild(M, P, o) {
  const wreck = !!o.wreck, body = 'paint', r = 0.6, lo = wreck ? -r * 0.38 : 0, W = 1.25, one = wreck ? TRK.burnt : [1, 1, 1]; // (roues de 0,56 m avant la 5.1)
  const z0 = -3.62, z1 = -1.92, zA = -2.55, X = 1.2;
  P.tintable = wreck ? null : [body];
  M.local(1); M.save().move(0, lo, 0);
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0.7, 1.7, y - lo));
  // châssis, pare-chocs noir à feux ronds, manilles
  M.color([0.12, 0.12, 0.11]); for (const x of [-0.5, 0.5]) M.boxB('steel', x - 0.07, x + 0.07, 0.8, 1.05, -3.6, 3.5);
  M.color(wreck ? TRK.burnt : TRK.trim); M.boxB('steel', -1.25, 1.25, 0.62, 0.94, -3.86, -3.64, { bevel: 0.03 });
  for (const sd of [-1, 1]) {
    M.save().move(sd * 1.02, 0.78, -3.865).rotX(-Math.PI / 2); M.color(wreck ? TRK.burnt : [0.55, 0.55, 0.55]); M.cyl('steel', 0.08, 0.02, 12, { caps: 't' }); if (!wreck) { M.color([1, 1, 1]); M.cyl('lampOff', 0.064, 0.026, 12, { caps: 't' }); } M.restore();
    if (!wreck) { M.color([0.95, 0.55, 0.12]); M.cls = 1; M.boxB('plastic', sd * 0.72, sd * 0.86, 0.74, 0.82, -3.875, -3.855); M.cls = 0; }
  }
  M.cls = 2; for (const sd of [-1, 1]) { M.save().move(sd * 0.55, 0.66, -3.87).rotX(Math.PI / 2); M.color([0.65, 0.12, 0.08]); M.tube('steel', 0.025, Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [Math.cos(a) * 0.07, 0, Math.sin(a) * 0.1]; }), 4); M.restore(); } M.cls = 0;
  // face avant : calandre noire à lames au milieu, flancs couleur caisse, blocs de phares ronds en haut des flancs
  M.color(one); for (const sd of [-1, 1]) M.boxB(body, sd * 0.8, sd * X, 0.94, 1.36, z0, z0 + 0.34, { bevel: 0.04 });
  M.color([0.03, 0.03, 0.03]); M.boxB('dark', -0.82, 0.82, 0.94, 1.88, z0 - 0.02, z0 + 0.5);
  M.color(wreck ? TRK.burnt : [0.07, 0.07, 0.07]); M.cls = 1; for (let i = 0; i < 9; i++) { const y = 1.0 + i * 0.1; M.boxB('steel', -0.78, 0.78, y, y + 0.045, z0 - 0.04, z0 - 0.015); } M.cls = 0;
  for (const sd of [-1, 1]) {
    M.color(TRK.trim); M.boxB('plastic', sd * 0.86, sd * 1.15, 1.44, 1.74, z0 - 0.07, z0 + 0.01, { bevel: 0.02 });
    for (const dx of [0.94, 1.07]) { M.save().move(sd * dx, 1.6, z0 - 0.07).rotX(-Math.PI / 2); M.color(wreck ? TRK.burnt : [0.6, 0.6, 0.6]); M.cyl('steel', 0.06, 0.012, 12, { caps: 't' }); if (!wreck) { M.color([1, 1, 1]); M.cyl('lampOff', 0.048, 0.018, 12, { caps: 't' }); } M.restore(); }
  }
  // cabine : bas plein au-dessus des roues avant, haut évidé derrière ses vitres, pavillon bombé
  M.color(wreck ? TRK.rust : [1, 1, 1]);
  M.boxB(body, -X, X, 1.32, 1.9, z0, z1, { bevel: 0.07 });
  const win = [[-3.42, -2.66, 1.96, 2.56], [-2.5, -2.14, 2.1, 2.56]];
  if (wreck) M.boxB(body, -X, X, 1.9, 2.7, z0, z1, { bevel: 0.07 });
  else {
    cabShell(M, body, X, 1.9, 2.7, z0, z1, [['av', -1.06, -0.06, 1.98, 2.58], ['av', 0.06, 1.06, 1.98, 2.58], ['ar', -0.45, 0.45, 2.05, 2.45], ...['g', 'd'].flatMap((f) => win.map(([a, b, c, d]) => [f, a, b, c, d]))]);
    carInterior(M, { x: 1.08, za: z0 + 0.06, zb: z1 - 0.06, Y0: () => 1.88, Y1: () => 2.68, zSeat: -2.3, zRear: -9, dash: 0.32, wheelR: 0.22 });
  }
  for (const sd of [-1, 1]) M.boxB(body, sd * (X - 0.08), sd * X, 1.9, 2.7, z0, z0 + 0.08, { bevel: 0.03 }); // montants avant
  M.loft(body, [{ z: z0 + 0.02, w: X - 0.02, yb: 2.64, yt: 2.86, ym: 2.66, n: 4 }, { z: z1 - 0.02, w: X - 0.02, yb: 2.64, yt: 2.88, ym: 2.66, n: 4 }], 16, { caps: true });
  M.color(wreck ? TRK.burnt : [0.16, 0.16, 0.15]); M.cls = 1; M.save().move(0.4, 2.85, -2.55); M.cyl('steel', 0.32, 0.06, 14); M.restore(); M.cls = 0; // trappe de toit
  for (const x of [-0.56, 0.56]) truckPane(M, 'z', -1, -z0, x - 0.5, x + 0.5, 1.98, 2.58, wreck, o.dust);
  for (const sd of [-1, 1]) for (const [a, b, c, d] of win) truckPane(M, 'x', sd, X, a, b, c, d, wreck, o.dust);
  truckPane(M, 'z', 1, z1, -0.45, 0.45, 2.05, 2.45, wreck, o.dust);
  M.color(TRK.trim); M.cls = 2;
  for (const sd of [-1, 1]) {
    M.boxB('rubber', sd * X - 0.006, sd * X + 0.02, 1.96, 2.56, -3.2, -3.17); // déflecteur de la vitre de porte
    for (const z of [-3.48, -2.58]) M.boxB('dark', sd * X - 0.004, sd * X + 0.004, 1.34, 2.62, z - 0.004, z + 0.004);
    M.boxB('steel', sd * X, sd * (X + 0.02), 1.72, 1.76, -2.78, -2.64);
  }
  M.boxB('rubber', -0.06, 0.06, 1.97, 2.59, z0 - 0.025, z0 + 0.01); // montant central du pare-brise
  M.cls = 0;
  for (const sd of [-1, 1]) truckMirror(M, sd, X, 2.2, -3.5, wreck);
  // grandes ailes avant arrondies (couleur caisse) et bavettes ; marchepieds sous la porte
  for (const sd of [-1, 1]) {
    const ring = [], n = 12; for (let i = 0; i <= n; i++) { const a = lerp(0.45, Math.PI - 0.12, i / n); ring.push([zA + 0.72 * Math.cos(a), r + 0.72 * Math.sin(a)]); }
    for (let i = n; i >= 0; i--) { const a = lerp(0.45, Math.PI - 0.12, i / n); ring.push([zA + 0.9 * Math.cos(a), r + 0.84 * Math.sin(a)]); }
    M.color(one); M.save().move(sd > 0 ? 1.27 : -0.95, 0, 0).rotY(-Math.PI / 2); M.extrude(body, ring, 0.32, { sharp: 0.5 }); M.restore();
    M.color(wreck ? TRK.burnt : [0.06, 0.06, 0.06]); M.boxB('rubber', sd * 0.98, sd * 1.24, 0.32, 0.72, zA + 0.7, zA + 0.725);
    M.color(TRK.trim); for (const y of [0.6, 0.86]) M.boxB('steel', sd * 1.0, sd * 1.24, y, y + 0.04, -1.9, -1.74);
    M.boxB('steel', sd * 1.18, sd * 1.21, 0.58, 1.32, -1.9, -1.87); M.boxB('steel', sd * 1.18, sd * 1.21, 0.58, 0.92, -1.77, -1.74);
  }
  // roue de secours debout derrière la cabine, cheminée, prise d'air, réservoir, coffre à batteries
  M.save().move(0.35, 1.12, -1.72).rotY(Math.PI / 2); wheel(M, r, 0.36, { side: -1, noTire: wreck, tread: 16, hub: wreck ? null : 'army', rim: wreck ? [0.34, 0.28, 0.24] : [0.32, 0.33, 0.26] }); M.restore();
  M.color(wreck ? TRK.burnt : [0.16, 0.16, 0.15]); M.cls = 1; M.tube('steel', 0.07, [[-0.85, 1.1, -1.84], [-0.85, 3.0, -1.84]], 8); M.cls = 0;
  M.color(one); M.tube(body, 0.09, [[-1.12, 1.5, -1.86], [-1.18, 2.4, -1.86], [-1.18, 2.92, -1.86]], 8); M.boxB(body, -1.28, -1.08, 2.9, 3.0, -1.96, -1.76, { bevel: 0.02 });
  M.color(one); M.save().move(-1.0, 0.86, -1.5); M.rotX(Math.PI / 2); M.cyl(body, 0.24, 1.0, 12); M.restore();
  M.boxB(body, 0.72, 1.16, 0.62, 1.05, -1.4, -0.6, { bevel: 0.02 });
  // plateau, chargement
  M.aoFn = null;
  truckBed(M, body, -1.5, 3.62, 1.36, 1.9, 2.3, W, 3.25, wreck);
  P.cargo = null;
  if ((o.load || 'tarp') === 'tarp') truckTarp(M, -1.44, 3.58, 1.9, 3.05, W, wreck);
  else P.cargo = truckCargo(M, -1.44, 3.56, 1.36, W, wreck);
  M.restore();
  truckWheels(M, [[zA], [1.2], [2.6]], r, 0.4, 0.98, { tread: 16, hub: 'army', rim: wreck ? null : [0.32, 0.33, 0.26], wreck, lo });
}
/* Porteur 6x6 à cabine avancée (7,4 x 2,5 m), à la manière des camions russes : cabine haute sur l'essieu avant, pare-brise en deux,
   calandre à lames, phares ronds dans le pare-chocs, feux de gabarit sur le pavillon, roue de secours debout derrière la cabine, plateau à
   hautes ridelles ; load : 'open' (ridelles), 'tarp' (bâché), 'cargo' (ridelles et chargement) */
function cargoTruckBuild(M, P, o) {
  const wreck = !!o.wreck, body = 'paint', r = 0.59, lo = wreck ? -r * 0.38 : 0, W = 1.25, one = wreck ? TRK.burnt : [1, 1, 1]; // (roues de 0,55 m avant la 5.1)
  P.tintable = wreck ? null : [body];
  M.local(1); M.save().move(0, lo, 0);
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0.7, 1.8, y - lo));
  M.color([0.12, 0.12, 0.11]); for (const x of [-0.5, 0.5]) M.boxB('steel', x - 0.07, x + 0.07, 0.82, 1.1, -3.6, 3.5);
  // pare-chocs, phares ronds, marchepieds
  M.color(one); M.boxB(body, -1.22, 1.22, 0.78, 1.12, -3.82, -3.62, { bevel: 0.03 });
  for (const sd of [-1, 1]) {
    M.color(TRK.trim); M.save().move(sd * 0.86, 0.96, -3.83).rotX(-Math.PI / 2); M.cyl('steel', 0.13, 0.04, 12); M.restore();
    if (!wreck) { M.color([0.95, 0.95, 0.9]); M.cls = 1; M.save().move(sd * 0.86, 0.96, -3.86).rotX(-Math.PI / 2); M.cyl('glass', 0.105, 0.02, 12); M.restore(); M.color([0.95, 0.55, 0.12]); M.boxB('plastic', sd * 0.5, sd * 0.64, 0.9, 1.0, -3.85, -3.82); M.cls = 0; }
    M.color(TRK.trim); for (const y of [0.62, 0.94]) M.boxB('steel', sd * 1.0, sd * 1.22, y, y + 0.04, -3.68, -3.46);
  }
  // cabine : caisse haute, face avant légèrement inclinée, calandre à lames, pavillon bombé, feux de gabarit
  M.color(wreck ? TRK.rust : [1, 1, 1]);
  if (wreck) M.boxB(body, -1.2, 1.2, 1.25, 2.66, -3.72, -2.0, { bevel: 0.07 });
  else {
    M.boxB(body, -1.2, 1.2, 1.25, 1.9, -3.72, -2.0, { bevel: 0.07 });
    cabShell(M, body, 1.2, 1.9, 2.64, -3.72, -2.0, [['av', -1.08, -0.04, 1.98, 2.56], ['av', 0.04, 1.08, 1.98, 2.56], ...['g', 'd'].flatMap((f) => [[f, -3.5, -2.85, 1.94, 2.5], [f, -2.7, -2.25, 2.1, 2.5]])]);
    carInterior(M, { x: 1.08, za: -3.66, zb: -2.06, Y0: () => 1.88, Y1: () => 2.62, zSeat: -2.36, zRear: -9, dash: 0.32, wheelR: 0.22 });
  }
  for (const [z0, z1] of [[-3.72, -3.46], [-2.24, -2.0]]) M.boxB(body, -1.2, 1.2, 1.06, 1.3, z0, z1, { bevel: 0.03 });
  M.loft(body, [{ z: -3.68, w: 1.17, yb: 2.6, yt: 2.86, ym: 2.62, n: 4 }, { z: -2.04, w: 1.17, yb: 2.6, yt: 2.88, ym: 2.62, n: 4 }], 16, { caps: true });
  for (const x of [-0.56, 0.56]) truckPane(M, 'z', -1, 3.72, x - 0.52, x + 0.52, 1.98, 2.56, wreck, o.dust);
  M.color([0.03, 0.03, 0.03]); M.boxB('dark', -0.9, 0.9, 1.36, 1.84, -3.735, -3.715);
  M.color(wreck ? TRK.burnt : [0.84, 0.84, 0.82]); M.cls = 1; for (let i = 0; i < 6; i++) { const y = 1.4 + i * 0.08; M.boxB(body, -0.88, 0.88, y, y + 0.035, -3.75, -3.72); } M.cls = 0;
  for (const sd of [-1, 1]) { truckPane(M, 'x', sd, 1.2, -3.5, -2.85, 1.94, 2.5, wreck, o.dust); truckPane(M, 'x', sd, 1.2, -2.7, -2.25, 2.1, 2.5, wreck, o.dust); }
  M.color(TRK.trim); M.cls = 2;
  for (const sd of [-1, 1]) { for (const z of [-3.58, -2.78]) M.boxB('dark', sd * 1.2 - 0.004, sd * 1.2 + 0.004, 1.2, 2.58, z - 0.004, z + 0.004); M.boxB('steel', sd * 1.2, sd * 1.22, 1.74, 1.78, -2.98, -2.84); }
  M.cls = 0;
  if (!wreck) { M.color([0.95, 0.55, 0.12]); M.cls = 2; for (const x of [-0.4, 0, 0.4]) M.boxB('plastic', x - 0.06, x + 0.06, 2.86, 2.93, -3.62, -3.52); M.cls = 0; }
  for (const sd of [-1, 1]) truckMirror(M, sd, 1.2, 2.2, -3.55, wreck);
  // garde-boue des roues avant (sous la cabine)
  M.color(TRK.trim); for (const sd of [-1, 1]) M.tube('plastic', 0.045, Array.from({ length: 9 }, (_, i) => { const a = lerp(0.15, Math.PI - 0.15, i / 8); return [sd * 1.18, r + (r + 0.07) * Math.sin(a), -2.85 + (r + 0.07) * Math.cos(a)]; }), 5); // passage resserré sur la roue (0,12 de jour avant la 5.1)
  // roue de secours debout derrière la cabine, cheminée, réservoir, coffre
  M.save().move(0.35, 1.12, -1.78).rotY(Math.PI / 2); wheel(M, r, 0.36, { side: -1, noTire: wreck, tread: 16, hub: wreck ? null : 'army', rim: wreck ? [0.34, 0.28, 0.24] : [0.32, 0.33, 0.26] }); M.restore();
  M.color(wreck ? TRK.burnt : [0.16, 0.16, 0.15]); M.cls = 1; M.tube('steel', 0.07, [[-0.85, 1.1, -1.88], [-0.85, 3.0, -1.88]], 8); M.cls = 0;
  M.color(one); M.save().move(-1.0, 0.86, -1.5); M.rotX(Math.PI / 2); M.cyl(body, 0.24, 1.0, 12); M.restore();
  M.boxB(body, 0.72, 1.16, 0.62, 1.05, -1.45, -0.6, { bevel: 0.02 });
  M.aoFn = null;
  const load = o.load || 'open';
  truckBed(M, body, -1.55, 3.62, 1.45, 2.15, 2.4, W, 3.28, wreck);
  P.cargo = null;
  if (load === 'tarp') truckTarp(M, -1.49, 3.58, 2.15, 3.0, W, wreck);
  else if (load === 'cargo') P.cargo = truckCargo(M, -1.49, 3.56, 1.45, W, wreck);
  M.restore();
  truckWheels(M, [[-2.85], [1.35], [2.65]], r, 0.38, 0.98, { tread: 16, hub: 'army', rim: wreck ? null : [0.32, 0.33, 0.26], wreck, lo });
}
/* Porteur de livraison à cabine avancée (7,6 x 2,45 m) : cabine plate à grande calandre chromée et doubles phares ronds, caisse fourgon
   à nervures, portes arrière à crémones, bandeau de couleur (la teinte de la cabine) ; o.reefer : groupe froid sur la face avant de la caisse */
function boxTruckBuild(M, P, o) {
  const wreck = !!o.wreck, cab = wreck ? 'paint' : o.dust ? 'paint' : 'carpaint', r = 0.5, lo = wreck ? -r * 0.38 : 0, W = 1.22, one = wreck ? TRK.burnt : [1, 1, 1];
  const chrome = wreck ? TRK.burnt : [0.85, 0.85, 0.85];
  P.tintable = wreck ? null : [cab];
  M.local(1); M.save().move(0, lo, 0);
  M.aoFn = (x, y) => lerp(0.55, 1, smoothstep(0.6, 1.6, y - lo));
  M.color([0.12, 0.12, 0.11]); for (const x of [-0.45, 0.45]) M.boxB('steel', x - 0.07, x + 0.07, 0.62, 0.9, -3.6, 3.45);
  // cabine plate, calandre chromée, doubles phares, pare-chocs chromé
  M.color(wreck ? TRK.rust : [1, 1, 1]);
  if (wreck) M.boxB(cab, -1.2, 1.2, 1.05, 2.62, -3.72, -2.2, { bevel: 0.06 });
  else {
    M.boxB(cab, -1.2, 1.2, 1.05, 1.88, -3.72, -2.2, { bevel: 0.06 });
    cabShell(M, cab, 1.2, 1.88, 2.62, -3.72, -2.2, [['av', -1.07, -0.07, 1.96, 2.52], ['av', 0.07, 1.07, 1.96, 2.52], ...['g', 'd'].flatMap((f) => [[f, -3.5, -2.85, 1.92, 2.5], [f, -2.7, -2.4, 2.05, 2.5]])]);
    carInterior(M, { x: 1.08, za: -3.66, zb: -2.26, Y0: () => 1.86, Y1: () => 2.62, zSeat: -2.5, zRear: -9, dash: 0.32, wheelR: 0.22 });
  }
  for (const [z0, z1] of [[-3.72, -3.44], [-2.38, -2.2]]) M.boxB(cab, -1.2, 1.2, 0.86, 1.1, z0, z1, { bevel: 0.03 });
  M.color(TRK.trim); for (const sd of [-1, 1]) M.tube('plastic', 0.04, Array.from({ length: 9 }, (_, i) => { const a = lerp(0.2, Math.PI - 0.2, i / 8); return [sd * 1.17, r + (r + 0.07) * Math.sin(a), -2.9 + (r + 0.1) * Math.cos(a)]; }), 5);
  M.color(wreck ? TRK.rust : [1, 1, 1]);
  M.boxB(cab, -1.17, 1.17, 2.62, 2.76, -3.68, -2.24, { bevel: 0.05 });
  for (const x of [-0.57, 0.57]) truckPane(M, 'z', -1, 3.72, x - 0.5, x + 0.5, 1.96, 2.52, wreck, o.dust);
  for (const sd of [-1, 1]) { truckPane(M, 'x', sd, 1.2, -3.5, -2.85, 1.92, 2.5, wreck, o.dust); truckPane(M, 'x', sd, 1.2, -2.7, -2.4, 2.05, 2.5, wreck, o.dust); }
  M.color(chrome); M.boxB('steel', -0.66, 0.66, 1.0, 1.86, -3.75, -3.7, { bevel: 0.015 });
  M.color([0.03, 0.03, 0.03]); M.boxB('dark', -0.6, 0.6, 1.05, 1.81, -3.755, -3.74);
  if (!wreck) {
    M.color(chrome); M.cls = 1; for (let i = 0; i < 11; i++) { const x = -0.55 + i * 0.11; M.boxB('steel', x - 0.015, x + 0.015, 1.05, 1.81, -3.765, -3.75); }
    for (const sd of [-1, 1]) for (const dx of [0, 0.22]) { M.save().move(sd * (0.82 + dx), 1.5, -3.73).rotX(-Math.PI / 2); M.color(chrome); M.cyl('steel', 0.1, 0.03, 12); M.color([0.95, 0.95, 0.9]); M.cyl('glass', 0.08, 0.045, 12); M.restore(); }
    M.color([0.95, 0.55, 0.12]); for (const sd of [-1, 1]) M.boxB('plastic', sd * 0.8, sd * 1.05, 1.22, 1.3, -3.74, -3.72);
    M.cls = 2; for (const x of [-0.4, 0, 0.4]) M.boxB('plastic', x - 0.06, x + 0.06, 2.76, 2.82, -3.6, -3.5); M.cls = 0;
  }
  M.color(chrome); M.boxB('steel', -1.22, 1.22, 0.58, 0.88, -3.84, -3.68, { bevel: 0.03 });
  M.color(TRK.trim); M.cls = 2; for (const sd of [-1, 1]) for (const z of [-3.58, -2.78]) M.boxB('dark', sd * 1.2 - 0.004, sd * 1.2 + 0.004, 1.0, 2.55, z - 0.004, z + 0.004); M.cls = 0;
  for (const sd of [-1, 1]) { truckMirror(M, sd, 1.2, 2.15, -3.58, wreck); M.color(TRK.trim); for (const y of [0.5, 0.8]) M.boxB('steel', sd * 1.0, sd * 1.22, y, y + 0.04, -3.68, -3.44); }
  // caisse fourgon : panneaux, nervures, lisses, bandeau de couleur, portes arrière ; groupe froid du frigo
  M.color(wreck ? TRK.rust : [0.94, 0.94, 0.92]);
  M.boxB('paint', -W, W, 1.0, 3.55, -2.1, 3.6, { bevel: 0.04 });
  M.color(wreck ? TRK.burnt : [0.8, 0.8, 0.78]); M.cls = 1;
  for (let z = -1.85; z < 3.4; z += 0.58) for (const sd of [-1, 1]) M.boxB('steel', sd * W - (sd > 0 ? 0.004 : 0.022), sd * W + (sd > 0 ? 0.022 : 0.004), 1.02, 3.53, z - 0.035, z + 0.035);
  for (const y of [1.0, 3.5]) for (const sd of [-1, 1]) M.boxB('steel', sd * W - (sd > 0 ? 0.004 : 0.03), sd * W + (sd > 0 ? 0.03 : 0.004), y, y + 0.06, -2.1, 3.6);
  M.cls = 0;
  if (!wreck) { M.color([1, 1, 1]); M.cls = 1; for (const sd of [-1, 1]) M.boxB(cab, sd * W - (sd > 0 ? 0.004 : 0.03), sd * W + (sd > 0 ? 0.03 : 0.004), 1.45, 1.7, -1.9, 3.4); M.cls = 0; }
  M.color(wreck ? TRK.burnt : [0.85, 0.85, 0.83]); M.boxB('steel', -W + 0.04, W - 0.04, 1.06, 3.5, 3.6, 3.64);
  M.color(TRK.trim); M.cls = 1;
  M.boxB('dark', -0.006, 0.006, 1.1, 3.45, 3.64, 3.645);
  for (const x of [-0.85, -0.3, 0.3, 0.85]) M.tube('steel', 0.016, [[x, 1.12, 3.665], [x, 3.43, 3.665]], 4);
  for (const sd of [-1, 1]) for (const y of [1.4, 2.3, 3.2]) M.boxB('steel', sd * 1.08, sd * 1.2, y, y + 0.1, 3.64, 3.67);
  M.cls = 0;
  if (o.reefer) {
    M.color(wreck ? TRK.burnt : [0.86, 0.87, 0.88]); M.boxB('paint', -0.85, 0.85, 2.8, 3.45, -2.4, -2.1, { bevel: 0.04 });
    M.color([0.06, 0.06, 0.06]); M.cls = 1; for (const x of [-0.42, 0.42]) { M.save().move(x, 3.12, -2.41).rotX(-Math.PI / 2); M.cyl('dark', 0.24, 0.01, 14); M.restore(); }
    M.color(wreck ? TRK.burnt : [0.7, 0.71, 0.72]); M.cls = 2; for (const x of [-0.42, 0.42]) for (let k = 0; k < 4; k++) M.boxB('steel', x - 0.24, x + 0.24, 2.92 + k * 0.08, 2.935 + k * 0.08, -2.43, -2.415); M.cls = 0;
  }
  // jupes latérales, réservoir, barre arrière, garde-boue
  M.color(TRK.trim); for (const sd of [-1, 1]) M.boxB('steel', sd * (W - 0.08), sd * (W - 0.04), 0.5, 0.96, -1.6, 1.3);
  M.color(wreck ? TRK.burnt : [0.75, 0.76, 0.78]); M.save().move(1.0, 0.72, -2.38).rotX(Math.PI / 2); M.cyl('steel', 0.22, 0.7, 12); M.restore();
  M.color(TRK.trim); M.boxB('steel', -1.05, 1.05, 0.45, 0.58, 3.45, 3.56); for (const sd of [-1, 1]) M.boxB('rubber', sd * 0.6, sd * 1.15, 0.2, 0.95, 2.82, 2.845);
  M.aoFn = null;
  M.restore();
  truckWheels(M, [[-2.9], [2.25, true]], r, 0.28, 0.98, { hub: 'steel', rim: wreck ? null : [0.82, 0.82, 0.8], wreck, lo });
}
/* Camion : model 'army' (militaire à cabine avancée, façon GBC), 'cargo' (porteur à cabine avancée), 'box' (fourgon de livraison) ; o : { load, reefer, dust,
   wreck }. Ancienne écriture : PF.truck() pour le militaire bâché. Les collisions du modèle sont dans pf.vcols */
PF.truck = (model = 'army', o = {}) => {
  const key = `truck_${model}_${o.load || ''}_${o.reefer ? 1 : 0}${o.dust ? 1 : 0}${o.wreck ? 1 : 0}`;
  return prefab(key, (M, P) => {
    if (model === 'cargo') cargoTruckBuild(M, P, o); else if (model === 'box') boxTruckBuild(M, P, o); else armyTruckBuild(M, P, o);
    P.vcols = truckCols(model, o, P.cargo);
  });
};
/* Collisions d'un camion : pare-chocs, châssis et plancher, cabine, plateau (jusqu'au haut des ridelles, de la
   bâche ou du chargement) ; l'épave est plus basse */
function truckCols(model, o = {}, cargo) {
  const lo = o.wreck ? (model === 'box' ? -0.48 : -0.55) * 0.38 : 0, L = (b) => [b[0], b[1], b[2] + (b[2] > 0 ? lo : 0), b[3] + lo, b[4], b[5], o.wreck ? undefined : b[6]];
  // (b[6] 'vitre' : la cabine au-dessus de la ceinture, évidée derrière ses vitres, laisse passer les balles et la vue)
  let B;
  if (model === 'cargo') {
    const top = o.wreck ? 2.15 : o.load === 'tarp' ? 3.0 : 2.15;
    B = [[-1.22, 1.22, 0, 1.45, -3.82, 3.62], [-1.2, 1.2, 1.45, 1.9, -3.72, -2.0], [-1.2, 1.2, 1.9, 2.86, -3.72, -2.0, 'vitre'], [-1.25, 1.25, 1.45, top, -1.55, 3.62], [-1.25, 1.25, top, Math.max(top, 2.4), -1.55, -1.49]];
  } else if (model === 'box') {
    B = [[-1.22, 1.22, 0, 1.0, -3.84, 3.64], [-1.2, 1.2, 1.0, 1.88, -3.72, -2.2], [-1.2, 1.2, 1.88, 2.76, -3.72, -2.2, 'vitre'], [-1.22, 1.22, 1.0, 3.55, -2.1, 3.64]];
    if (o.reefer) B.push([-0.85, 0.85, 2.8, 3.45, -2.4, -2.1]);
  } else {
    const top = o.wreck ? 1.9 : (o.load || 'tarp') === 'tarp' ? 3.05 : 1.9;
    B = [[-1.25, 1.25, 0, 0.94, -3.86, -3.62], [-1.25, 1.25, 0, 1.36, -3.62, 3.62], [-1.2, 1.2, 1.36, 1.9, -3.62, -1.92], [-1.2, 1.2, 1.9, 2.86, -3.62, -1.92, 'vitre'],
      [-1.25, 1.25, 1.36, top, -1.5, 3.62], [-1.25, 1.25, top, Math.max(top, 2.3), -1.5, -1.44]];
  }
  if (cargo) for (const c of cargo) B.push(c);
  return B.filter((b) => b[3] > b[2] + 0.01).map(L);
}
/* Bus incendié (11 m) : carcasse percée de baies vides, intérieur calciné, sur les jantes */
PF.busWreck = () => prefab('busWreck', (M) => {
  M.local(1);
  const L = 11, W = 2.5, H = 2.75, hl = L / 2, hw = W / 2, y0 = 0.3;
  M.aoFn = (x, y) => lerp(0.5, 1, smoothstep(0.3, 1.2, y));
  for (const s of [1, -1]) {
    M.save().move(s * hw, y0, s * hl).rotY(s > 0 ? Math.PI / 2 : -Math.PI / 2);
    const ops = []; for (let i = 0; i < 7; i++) { const x = 1.3 + i * 1.3; ops.push({ x0: x, x1: x + 1.05, y0: 1.0, y1: 1.9, depth: 0.06 }); }
    M.color([1, 1, 1]); wallPierced(M, 'charred', L, 0, H, ops, { depth: 0.06 });
    M.restore();
  }
  for (const s of [1, -1]) { M.save().move(0, y0, s * hl); M.boxB('charred', -hw, hw, 0, 1.0, -0.04, 0.04); M.boxB('charred', -hw, hw, 2.2, H, -0.04, 0.04); M.restore(); }
  M.boxB('charred', -hw, hw, y0 + H, y0 + H + 0.06, -hl, hl);
  M.color([0.08, 0.08, 0.08]); M.boxB('dark', -hw + 0.05, hw - 0.05, y0, y0 + 0.2, -hl, hl);
  M.aoFn = null; M.ao = 0.5;
  // squelettes de sièges
  M.color([0.3, 0.26, 0.22]);
  for (let z = -hl + 1.2; z < hl - 1; z += 0.85) for (const s of [-1, 1]) { M.boxB('charred', s * 0.3, s * 1.1, y0 + 0.2, y0 + 0.65, z, z + 0.45); M.boxB('charred', s * 0.3, s * 1.1, y0 + 0.65, y0 + 1.2, z + 0.38, z + 0.45); }
  M.ao = 1;
  for (const z of [-3.8, 3.4]) for (const s of [-1, 1]) { M.save().move(s * 1.1, -0.2, z); wheel(M, 0.45, 0.28, { noTire: true, rim: [0.25, 0.22, 0.2], side: s }); M.restore(); }
});

}catch(e){HOOKS.missing['02g-vehicles.js']=String(e&&e.message||e)}
/* ===== 02y-paris.js ===== */
try{
/* ==========================================================================
   LE DEHORS de Modern : ce qu'on voit par-dessus l'enceinte depuis le plateau, la terrasse du Rocher et la passerelle.
   Autour du jardin, une ceinture de pelouse plantée de grands arbres, puis un boulevard (trottoirs de dalles, chaussée pavée,
   platanes, réverbères, colonnes Morris), puis une rangée continue d'immeubles de pierre à toit mansardé, avec des cheminées
   et des lucarnes ; derrière, les toits plus hauts d'un second rang, un dôme et une tour de fer, estompés par la brume.
   Tout est hors de la zone de jeu : aucune collision, aucune ombre (les immeubles, à 25 m, projetteraient leur ombre jusque
   dans le jardin). Tout est dans le tronçon lointain (`far`) : un seul maillage par matière.
   Plan (demi-dimensions, centre de la carte) : enceinte 38 x 50 ; pelouse jusqu'à 52 x 64 ; trottoir intérieur 52-55 x 64-67 ;
   chaussée 55-63 x 67-75 ; trottoir extérieur 63-66 x 75-78 ; façades à 66 x 78.
   ========================================================================== */
var PARIS = { rx: 66, rz: 78, road: [55, 63, 67, 75], walkIn: [52, 55, 64, 67], walkOut: [63, 66, 75, 78] };
var PARIS_TINTS = [[0.84, 0.78, 0.66], [0.8, 0.75, 0.66], [0.86, 0.8, 0.7], [0.83, 0.73, 0.65], [0.78, 0.76, 0.72], [0.85, 0.77, 0.62]];

/* Cadre rectangulaire (demi-dimensions extérieures ox, oz ; intérieures ix, iz) en quatre bandes : f(x0, x1, z0, z1) */
function parisFrame(ox, oz, ix, iz, f) { f(ix, ox, -oz, oz); f(-ox, -ix, -oz, oz); f(-ix, ix, iz, oz); f(-ix, ix, -oz, -iz); }
/* Parcourt les quatre côtés d'un rectangle de demi-dimensions (hx, hz), tous les pas mètres : fn(x, z, côté) */
function parisRing(hx, hz, step, fn) {
  for (const [side, pts] of [
    ['E', Array.from({ length: Math.floor((2 * hz) / step) + 1 }, (_, i) => [hx, -hz + i * step])],
    ['W', Array.from({ length: Math.floor((2 * hz) / step) + 1 }, (_, i) => [-hx, -hz + i * step])],
    ['S', Array.from({ length: Math.floor((2 * hx) / step) - 1 }, (_, i) => [-hx + (i + 1) * step, hz])],
    ['N', Array.from({ length: Math.floor((2 * hx) / step) - 1 }, (_, i) => [-hx + (i + 1) * step, -hz])],
  ]) for (const [x, z] of pts) fn(x, z, side);
}

/* Réverbère de boulevard : fût de fonte vert sombre, console courbe, lanterne ; sans collision */
PF.farLamp = (lit = litOn()) => prefab('farLamp' + (lit ? 'L' : ''), (M) => {
  M.save().color([0.12, 0.2, 0.15]).local(1); M.cls = 1;
  M.cyl('paintwood', 0.16, 0.5, 8, { r1: 0.12 }); M.save().move(0, 0.5, 0); M.cyl('paintwood', 0.07, 4.3, 6); M.restore();
  M.tube('paintwood', 0.04, [[0, 4.7, 0], [0.1, 5.1, 0], [0.5, 5.25, 0], [0.9, 5.1, 0]], 5);
  M.color([1, 0.92, 0.7]); M.save().move(0.9, 4.7, 0); M.cyl(lit ? 'lamp' : 'lampOff', 0.2, 0.4, 6, { r1: 0.12 }); M.restore(); // (hors de la zone de jeu : sa lumière n'est pas cuite)
  M.restore();
});
/* Colonne Morris : fût vert, bandeau d'affiches, toit en dôme */
PF.morris = () => prefab('morris', (M) => {
  M.save().local(1); M.cls = 1;
  M.color([0.14, 0.26, 0.2]); M.cyl('paintwood', 0.62, 0.3, 12); M.save().move(0, 0.3, 0); M.cyl('paintwood', 0.5, 2.0, 12); M.restore();
  M.color([0.9, 0.82, 0.62]); M.save().move(0, 0.9, 0); M.cyl('paintwood', 0.52, 1.1, 12); M.restore();
  M.color([0.14, 0.26, 0.2]); M.save().move(0, 2.3, 0); M.lathe('paintwood', [[0.6, 0], [0.62, 0.1], [0.5, 0.2], [0.3, 0.45], [0.1, 0.65], [0, 0.72]], 12); M.restore();
  M.restore();
});

/* Toit mansardé en zinc : brisis raide, terrasson, lucarnes sur les façades visibles (faces), cheminées. h : hauteur de l'égout */
function parisRoof(w, d, h, faces, R) {
  const M = DECOR, i1 = 1.7, h1 = 3.0, i2 = Math.min(i1 + 3.0, Math.min(w, d) / 2 - 0.6), h2 = 1.2, zinc = [0.5, 0.56, 0.64];
  const rect = (i, y) => [[-w / 2 + i, y, -d / 2 + i], [w / 2 - i, y, -d / 2 + i], [w / 2 - i, y, d / 2 - i], [-w / 2 + i, y, d / 2 - i]];
  const A = rect(0, h), B = rect(i1, h + h1), C = rect(i2, h + h1 + h2);
  M.save().color(zinc).local(1); M.cls = 1;
  for (const [P, Q] of [[A, B], [B, C]]) for (let k = 0; k < 4; k++) {
    const p0 = P[k], p1 = P[(k + 1) % 4], q0 = Q[k], q1 = Q[(k + 1) % 4], e = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], f = [q0[0] - p0[0], q0[1] - p0[1], q0[2] - p0[2]];
    let n = [e[1] * f[2] - e[2] * f[1], e[2] * f[0] - e[0] * f[2], e[0] * f[1] - e[1] * f[0]]; const mx = (p0[0] + p1[0]) / 2, mz = (p0[2] + p1[2]) / 2;
    if (n[0] * mx + n[2] * mz < 0) n = n.map((v) => -v);
    M.quad('slate', p0, p1, q1, q0, n);
  }
  M.quad('slate', C[0], C[1], C[2], C[3], [0, 1, 0]);
  // lucarnes : à l'aplomb de la façade, posées sur la corniche ; un volume de pierre, une vitre sombre, deux pans de zinc et un fronton
  for (const face of faces) {
    const alongX = face === 'n' || face === 's', len = alongX ? w : d, sg = face === 's' || face === 'e' ? 1 : -1, nb = Math.max(1, Math.round(len / 3.4)), sx = len / nb;
    for (let k = 0; k < nb; k++) {
      const t = -len / 2 + sx * (k + 0.5), off = (alongX ? d : w) / 2 - 0.2, ex = alongX ? t : sg * off, ez = alongX ? sg * off : t;
      M.save().move(ex, h, ez).rotY(alongX ? (sg > 0 ? 0 : Math.PI) : (sg > 0 ? Math.PI / 2 : -Math.PI / 2));
      M.color([0.94, 0.9, 0.8]); M.boxB('plaster', -0.6, 0.6, 0, 1.5, -1.3, 0.05);
      M.color([0.08, 0.1, 0.13]); M.quad('plaster', [-0.36, 0.25, 0.06], [0.36, 0.25, 0.06], [0.36, 1.25, 0.06], [-0.36, 1.25, 0.06], [0, 0, 1]);
      M.color(zinc);
      M.quad('slate', [-0.72, 1.45, 0.14], [-0.72, 1.45, -1.3], [0, 2.1, -1.3], [0, 2.1, 0.14], [-0.65, 0.76, 0]); M.quad('slate', [0.72, 1.45, 0.14], [0.72, 1.45, -1.3], [0, 2.1, -1.3], [0, 2.1, 0.14], [0.65, 0.76, 0]);
      M.tri3('slate', [-0.72, 1.45, 0.14], [0.72, 1.45, 0.14], [0, 2.1, 0.14], [0, 0.3, 1]);
      M.restore();
    }
  }
  // cheminées sur le terrasson
  const n = 2 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) { const x = R.range(-w / 2 + i2 + 0.8, w / 2 - i2 - 0.8), z = R.range(-d / 2 + i2 + 0.6, d / 2 - i2 - 0.6); M.color([0.88, 0.8, 0.7]); M.boxB('plaster', x - 0.45, x + 0.45, h + h1 + h2 - 0.2, h + h1 + h2 + 2.2, z - 0.35, z + 0.35); M.color([0.3, 0.28, 0.27]); M.boxB('plaster', x - 0.52, x + 0.52, h + h1 + h2 + 2.2, h + h1 + h2 + 2.4, z - 0.42, z + 0.42); }
  M.restore();
}

/* Immeuble parisien : rez-de-chaussée à bossage, nf étages de portes-fenêtres, corniche, toit mansardé. Façades détaillées sur les faces demandées (faces : 'nsew'), enduit uni ailleurs */
function parisBuilding(cx, cz, w, d, nf, tint, R, faces) {
  const M = DECOR, gh = 4.2, fh = 3.3, h = gh + nf * fh;
  M.save().move(cx, 0, cz); M.cls = 1;
  for (const face of 'swne') {
    const F = facadeFrame(face, -w / 2, w / 2, -d / 2, d / 2);
    M.save().move(F.ox, 0, F.oz).rotY(F.rot).color(tint);
    if (faces.includes(face)) {
      const nb = Math.max(1, Math.round(F.len / 3.4));
      M.quad('haussrdc', [0, 0, 0], [F.len, 0, 0], [F.len, gh, 0], [0, gh, 0], [0, 0, 1], { uv: [[0, 0], [nb, 0], [nb, 1], [0, 1]] });
      M.quad('haussmann', [0, gh, 0], [F.len, gh, 0], [F.len, h, 0], [0, h, 0], [0, 0, 1], { uv: [[0, 0], [nb, 0], [nb, nf], [0, nf]] });
      M.color([0.95, 0.91, 0.82]);
      M.boxB('plaster', -0.05, F.len + 0.05, gh - 0.2, gh + 0.12, 0, 0.3);             // bandeau au-dessus du rez-de-chaussée
      for (const k of [1, nf - 2]) if (k >= 0 && k < nf) M.boxB('plaster', -0.05, F.len + 0.05, gh + k * fh - 0.1, gh + k * fh + 0.06, 0, 0.55); // balcons filants
      M.boxB('plaster', -0.1, F.len + 0.1, h - 0.1, h + 0.38, 0, 0.55);               // corniche
    } else M.quad('plaster', [0, 0, 0], [F.len, 0, 0], [F.len, h, 0], [0, h, 0], [0, 0, 1]);
    M.restore();
  }
  M.restore();
  M.save().move(cx, 0, cz); parisRoof(w, d, h + 0.38, faces, R); M.restore();
}

/* Tour de fer : quatre pieds qui se rejoignent, croisillons, deux plates-formes, flèche (silhouette dans la brume) */
function parisTower(x, z, H = 110, B = 24) {
  const M = DECOR, hw = (y) => 1.4 + (B - 1.4) * Math.pow(1 - y / H, 2.2), lv = [0, 9, 20, 33, 48, 65, 84, 104, H], co = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  M.save().move(x, 0, z).color([0.36, 0.31, 0.27]).local(1); M.cls = 1;
  const P = (c, y) => [c[0] * hw(y), y, c[1] * hw(y)];
  for (let i = 0; i < lv.length - 1; i++) {
    const r = Math.max(0.18, 0.95 * (1 - lv[i] / H));
    for (const c of co) M.tube('paint', r, [P(c, lv[i]), P(c, lv[i + 1])], 5);
    for (let k = 0; k < 4; k++) {
      const a = co[k], b = co[(k + 1) % 4];
      M.tube('paint', r * 0.45, [P(a, lv[i]), P(b, lv[i + 1])], 4); M.tube('paint', r * 0.45, [P(b, lv[i]), P(a, lv[i + 1])], 4);
      if (i > 0) M.tube('paint', r * 0.6, [P(a, lv[i]), P(b, lv[i])], 4);
    }
  }
  for (const y of [lv[3], lv[5]]) M.boxB('paint', -hw(y) - 0.6, hw(y) + 0.6, y - 0.5, y + 0.5, -hw(y) - 0.6, hw(y) + 0.6);
  M.tube('paint', 0.1, [[0, H, 0], [0, H + 14, 0]], 4);
  M.restore();
}

function florealParis() {
  const R = rngOf(8383), M = DECOR, { rx, rz } = PARIS;
  WORLD.force = 'far'; // tout le dehors dans un seul tronçon : hors de la zone de jeu, il n'y a rien à écarter, et chaque tronçon coûterait un appel de rendu par matière
  // arbres de la ceinture de pelouse (grands, allégés) et platanes des deux trottoirs ; hauts troncs : on voit la pelouse dessous
  const tree = (x, z, h, r, kind) => M.place(PF.tree(kind || R.pick(['oak', 'linden', 'maple', 'ginkgo', 'oak']), h, r, 1 + Math.floor(R() * 12), { th: h * 0.38, lod: 1 }), x + R.range(-1, 1), 0, z + R.range(-1, 1), R() * TAU, { nocol: true, cls: 1 });
  parisRing(46, 57, 8, (x, z) => tree(x, z, R.range(15, 19), R.range(4.8, 6.2)));
  parisRing(53.5, 65.5, 10, (x, z) => tree(x, z, R.range(10, 12.5), R.range(3.2, 4), R.pick(['linden', 'maple', 'linden'])));
  parisRing(64.5, 76.5, 12, (x, z) => tree(x, z, R.range(10, 12.5), R.range(3.2, 4), R.pick(['linden', 'maple', 'linden'])));
  // réverbères et colonnes Morris sur les trottoirs
  parisRing(54.2, 66.2, 18, (x, z, side) => { const ry = side === 'E' ? -Math.PI / 2 : side === 'W' ? Math.PI / 2 : side === 'S' ? Math.PI : 0; M.place(PF.farLamp(), x, 0, z, ry, { nocol: true }); });
  parisRing(63.8, 75.8, 18, (x, z, side) => { const ry = side === 'E' ? Math.PI / 2 : side === 'W' ? -Math.PI / 2 : side === 'S' ? 0 : Math.PI; M.place(PF.farLamp(), x + (side === 'N' || side === 'S' ? 9 : 0), 0, z + (side === 'E' || side === 'W' ? 9 : 0), ry, { nocol: true }); });
  for (const [x, z] of [[52.8, -30], [-52.8, 22], [26, 64.8], [-34, -64.8], [64.7, 40]]) M.place(PF.morris(), x, 0, z, 0, { nocol: true });
  // haie basse au bord de la pelouse, côté trottoir
  for (const [a, b, c, d] of [[51.2, 51.8, -63, 63], [-51.8, -51.2, -63, 63], [-51, 51, 63.2, 63.8], [-51, 51, -63.8, -63.2]]) { M.save().color([0.8, 0.94, 0.72]).world(1); M.cls = 1; M.boxB('hedge', a, b, 0, 0.8, c, d, { bevel: 0.1 }); M.restore(); }
  // chaussée pavée
  M.save().color([1, 1, 1]).world(1); M.cls = 1;
  const [r0, r1, q0, q1] = PARIS.road;
  for (const [x0, x1, z0, z1] of [[r0, r1, -q1, q1], [-r1, -r0, -q1, q1], [-r0, r0, q0, q1], [-r0, r0, -q1, -q0]]) { M.quad('pave', [x0, 0.03, z0], [x1, 0.03, z0], [x1, 0.03, z1], [x0, 0.03, z1], [0, 1, 0]); }
  M.restore();
  // rangs d'immeubles : E et W de bout en bout, S et N entre les coins, quatre immeubles d'angle
  const row = (side, faces, a0, a1, off, depth, alongZ) => {
    for (let t = a0; t < a1 - 0.5;) {
      const w = a1 - t < 30 ? a1 - t : R.range(13, 24), d = R.range(depth - 2, depth + 3), nf = 5 + Math.floor(R() * 3), c = t + w / 2;
      const sg = side === 'E' || side === 'S' ? 1 : -1;
      if (alongZ) parisBuilding(sg * (off + d / 2), c, d, w, nf, R.pick(PARIS_TINTS), R, faces); else parisBuilding(c, sg * (off + d / 2), w, d, nf, R.pick(PARIS_TINTS), R, faces);
      t += w;
    }
  };
  row('E', 'w', -rz, rz, rx, 15, true); row('W', 'e', -rz, rz, rx, 15, true); row('S', 'n', -rx, rx, rz, 15, false); row('N', 's', -rx, rx, rz, 15, false);
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) parisBuilding(sx * (rx + 8), sz * (rz + 8), 16, 16, 6, R.pick(PARIS_TINTS), R, (sx > 0 ? 'w' : 'e') + (sz > 0 ? 'n' : 's'));
  // second rang, plus haut et plus loin : seuls les toits se voient au-dessus du premier (façades simples, tronçon lointain)
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * TAU + R() * 0.05, d = R.range(112, 165), x = Math.cos(a) * d * 1.1, z = Math.sin(a) * d * 1.25;
    if (Math.abs(x) < 100 && Math.abs(z) < 112) continue;
    if (hyp(x - PARIS_DOME[0], z - PARIS_DOME[1]) < 36 || hyp(x - PARIS_TOUR[0], z - PARIS_TOUR[1]) < 32) continue;
    farBuilding(x, z, R.range(18, 30), R.range(14, 22), R.range(30, 40), R.pick(PARIS_TINTS), R);
  }
  // les deux repères de la carte (MAP_DEFS.floreal.landmarks), un par moitié, au-dessus des grands arbres de la ceinture : au nord
  // (Bravo) le dôme d'un édifice sur son tambour, au sud (Alpha) la tour de fer
  const [dx, dz] = PARIS_DOME;
  M.save().move(dx, 0, dz).color([0.82, 0.8, 0.74]).world(1); M.boxB('stone', -14, 14, 0, 18, -14, 14);
  M.local(1); M.save().move(0, 18, 0); M.cyl('stone', 10.5, 10, 20); M.restore();
  M.color([0.5, 0.58, 0.55]); M.save().move(0, 28, 0); M.lathe('slate', [[10.8, 0], [10.8, 2.5], [9.8, 6.5], [7.4, 10.5], [3.8, 14], [1.4, 16], [0, 17]], 20); M.restore();
  M.color([0.82, 0.8, 0.74]); M.save().move(0, 44.6, 0); M.cyl('stone', 1.3, 3.2, 10); M.restore();
  M.color([0.5, 0.58, 0.55]); M.save().move(0, 47.8, 0); M.lathe('slate', [[1.5, 0], [0, 3.4]], 10); M.restore(); M.restore();
  parisTower(PARIS_TOUR[0], PARIS_TOUR[1], 110, 18);
  WORLD.force = null;
}

}catch(e){HOOKS.missing['02y-paris.js']=String(e&&e.message||e)}
window.RGPK={PF:PF,prefab:prefab,Maker:Maker,GeoBuf:GeoBuf,Prefab:Prefab,PREFABS:PREFABS,TEXSCALE:TEXSCALE,missing:HOOKS.missing,rngOf:typeof rngOf==='function'?rngOf:null};
})();
