/* ==========================================================================================================
   MINI FORT ZOMBIE - MODULAR MODERN ZOMBIES (v059)
   Zombie bodies built from the Modern soldier body (MIT, (c) 2026 BenDBSS): its smooth skinned mesh, posed arms-down and
   cut into rigid parts by bone (tools/zombie/build_rz.py), keeping Modern's UVs on its texture atlas (assets/zombie/zombie_albedo.png).
     body (torso + pelvis)   head (with neck)   armL / armR (upper arm, pivot at the shoulder)
     elL / elR (forearm + hand, pivot at the elbow, child of the upper arm)   legL / legR (whole leg + shoe, pivot at the hip)
   Every cut carries a flesh cap, so a part can come off anywhere. Same pivots and joint positions on EVERY zombie: any head / arm / leg fits
   any body like lego (fzGraft in skills.js swaps the pivot; an arm or leg grafted on the other side is mirrored, see RZ.mirror).
   The returned part table has the same keys as MFZ's makeHuman, so animation, ragdolls, dismemberment, medics and hit zones work unchanged.
   Per-zombie look = vertex colours by region (skin, shirt, sleeves, pants, shoes, gore) x the shared atlas (fabric weave, face, blood, grime).
   Repaint: edit assets/zombie/zombie_albedo.png (zombie_uv_template.png shows where each part lands), then python3 tools/zombie/pack_zombie_tex.py
   Options > Graphics > Zombie models: Modern (this) or Classic (MFZ blocks).
   ========================================================================================================== */
(function(){
'use strict';
if(!window.RZB||!window.THREE||typeof makeHuman!=='function'){console.warn('[rzombie] data or core missing, classic zombies only');return}
const T=THREE,D=RZB,R=D.reg;
const raw=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer};
/* ---------------- decode the parts once ---------------- */
const GEO={};
for(const k in D.parts){const p=D.parts[k],Pq=new Int16Array(raw(p.p)),Nq=new Int8Array(raw(p.nm)),Uq=new Uint16Array(raw(p.uv)),pos=new Float32Array(Pq.length),nor=new Float32Array(Nq.length),uv=new Float32Array(Uq.length);
 for(let i=0;i<Pq.length;i++)pos[i]=Pq[i]/D.qp;for(let i=0;i<Nq.length;i++)nor[i]=Nq[i]/127;for(let i=0;i<Uq.length;i++)uv[i]=Uq[i]/65535;
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setIndex(new T.BufferAttribute(new Uint16Array(raw(p.i)),1));g.computeBoundingSphere();
 GEO[k]={pos:g.attributes.position,nor:g.attributes.normal,uv:new T.BufferAttribute(uv,2),idx:g.index,reg:new Uint8Array(raw(p.r)),piv:p.piv,bs:g.boundingSphere,n:p.n}}
/* model-space rest position of every vertex (outfit colour rules work in model space: +z forward, feet at y 0) */
const PAR={body:null,head:'body',armL:'body',armR:'body',foreL:'armL',foreR:'armR',legL:null,legR:null},OFF={};
const off=k=>OFF[k]||(OFF[k]=PAR[k]?off(PAR[k]).map((v,i)=>v+GEO[k].piv[i]):GEO[k].piv.slice());
for(const k in GEO){const G=GEO[k],o=off(k),a=G.pos.array,m=new Float32Array(a.length);for(let i=0;i<a.length;i+=3){m[i]=a[i]+o[0];m[i+1]=a[i+1]+o[1];m[i+2]=a[i+2]+o[2]}G.mp=m;
 const b=new T.Box3();b.setFromBufferAttribute(G.pos);G.box=b}
/* Modern accessories (helmet, plate carrier), already split onto the parts, with Modern's own vertex colours */
const ACC={};
for(const an in(D.acc||{})){ACC[an]={};for(const k in D.acc[an]){const p=D.acc[an][k],Pq=new Int16Array(raw(p.p)),Nq=new Int8Array(raw(p.nm)),Uq=new Uint16Array(raw(p.uv)),Cq=new Uint8Array(raw(p.c));
 const pos=new Float32Array(Pq.length),nor=new Float32Array(Nq.length),uv=new Float32Array(Uq.length),col=new Float32Array(Cq.length);
 for(let i=0;i<Pq.length;i++)pos[i]=Pq[i]/D.qp;for(let i=0;i<Nq.length;i++)nor[i]=Nq[i]/127;for(let i=0;i<Uq.length;i++)uv[i]=Uq[i]/65535;for(let i=0;i<Cq.length;i++)col[i]=Cq[i]/255;
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(col,3));
 g.setIndex(new T.BufferAttribute(new Uint16Array(raw(p.i)),1));g.computeBoundingSphere();ACC[an][k]=g}}
/* ---------------- shared atlas textures ---------------- */
const TX={};
function tex(src,cs){const t=new T.Texture(),im=new Image();im.onload=()=>{t.image=im;t.needsUpdate=true};im.src=src;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.anisotropy=4;return t}
if(window.RZTEX){TX.map=tex(RZTEX.map);TX.normal=tex(RZTEX.normal);TX.rm=tex(RZTEX.rm);if(RZTEX.camo)TX.camo=tex(RZTEX.camo)}
/* ---------------- palettes ---------------- */
const PK=a=>a[Math.floor(Math.random()*a.length)];
const SKIN=[0x8f9c7a,0x9aa386,0x7f8b6a,0xa3a892,0x8d8a78,0x9c9078,0x7a8470,0xb0ab95];
const SHIRT=[0x6a6a64,0x3a4a5e,0x7a3030,0x4a5a3a,0x8a7a5a,0x2a2a30,0xc8c4b8,0x5a3a5a,0x9a6a2a,0x3a5a6a];
const PANTS=[0x2a3448,0x38382c,0x4a3a2a,0x24242a,0x39455a,0x5a4a38];
const SHOES=[0x2a2018,0x1a1a1a,0x4a3828,0x3a3a3a];
const C=h=>new T.Color(h);
function palette(o){const sk=C(PK(SKIN)),f=window.FZS;
 const shirt=C(o.shirt!=null?o.shirt:(f&&f.shirt!=null)?f.shirt:PK(SHIRT)),pants=C((f&&f.pants!=null)?f.pants:PK(PANTS));
 return{[R.face]:sk.clone().multiplyScalar(1.05),[R.skin]:sk,[R.shirt]:shirt,[R.sleeve]:Math.random()<.55?sk:shirt,[R.pants]:pants,[R.shoes]:C(PK(SHOES)),[R.gore]:C(0x5c0a08),[R.hair]:C(0x2a2018)}}
function colours(G,pal,fn,k){const n=G.n,a=new Float32Array(n*3),r=G.reg,m=G.mp,nm=G.nor.array,q={k,reg:0,x:0,y:0,z:0,nx:0,ny:0,nz:0,pal};
 for(let i=0;i<n;i++){let c=null;if(fn){q.reg=r[i];q.x=m[i*3];q.y=m[i*3+1];q.z=m[i*3+2];q.nx=nm[i*3];q.ny=nm[i*3+1];q.nz=nm[i*3+2];c=fn(q)}if(!c)c=pal[r[i]]||pal[R.shirt];a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b}return new T.BufferAttribute(a,3)}
function material(camo){return new T.MeshStandardMaterial({vertexColors:true,map:(camo&&TX.camo)||TX.map||null,normalMap:TX.normal||null,normalScale:new T.Vector2(.45,.45),roughnessMap:TX.rm||null,roughness:1,metalness:0,envMapIntensity:.35})}
/* ---------------- builder: same part table as makeHuman ---------------- */
const SLOT={head:'head',armL:'armL',armR:'armR',foreL:'armL',foreR:'armR',legL:'legL',legR:'legR',body:undefined};
function shaped(G,k,sh){const a=G.pos.array.slice(),m=G.mp;for(let i=0;i<a.length;i+=3){const d=sh(k,m[i],m[i+1],m[i+2]);if(d){a[i]+=d[0];a[i+1]+=d[1];a[i+2]+=d[2]}}return new T.BufferAttribute(a,3)}
function partMesh(k,mat,pal,fn,sh){const G=GEO[k],g=new T.BufferGeometry();g.setAttribute('position',sh?shaped(G,k,sh):G.pos);g.setAttribute('normal',G.nor);g.setAttribute('uv',G.uv);g.setAttribute('color',colours(G,pal,fn,k));g.setIndex(G.idx);if(sh)g.computeBoundingSphere();else g.boundingSphere=G.bs;
 const m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;const s=SLOT[k];if(s!==undefined)m.userData.part=s;if(k==='head')m.userData.head=1;return m}
/* v063: round glowing yellow eyes (unlit, so hit flashes leave them alone) + a soft additive halo; they ride on the head pivot */
const EYE_G=new T.SphereGeometry(.0118,12,8),EYE_M=new T.MeshBasicMaterial({color:0xffe03a});
let HALO=null;function halo(){if(HALO)return HALO;const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,32);
 g.addColorStop(0,'rgba(255,236,120,.95)');g.addColorStop(.35,'rgba(255,210,60,.45)');g.addColorStop(1,'rgba(255,190,40,0)');c.fillStyle=g;c.fillRect(0,0,64,64);
 return HALO=new T.SpriteMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false,blending:T.AdditiveBlending})}
function eyes(head){for(const sx of[-1,1]){const e=new T.Mesh(EYE_G,EYE_M);e.position.set(sx*.033,.182,.097);e.scale.set(1,.9,.6);e.userData.part='head';e.userData.head=1;head.add(e);
  const h=new T.Sprite(halo());h.position.set(sx*.033,.182,.104);h.scale.set(.05,.05,1);h.raycast=()=>{};h.userData.eye=1;head.add(h)}}
function grp(par,piv){const q=new T.Group();q.position.set(piv[0],piv[1],piv[2]);par.add(q);return q}
function makeRZ(o,g){
 const st=o.style||(window.FZS&&FZS.style)||'',O=window.RZO&&(RZO[st]||RZO[st.replace(/_stripe$/,'')]||(/hoodie/.test(st)&&RZO.hoodie)),P={},mat=material(O&&O.camo),pal=palette(o);
 const fn=O&&O.col?O.col(pal,st):null,sh=O&&O.shape?O.shape(st):null;
 P.body=grp(g,GEO.body.piv);P.body.add(partMesh('body',mat,pal,fn,sh));
 P.head=grp(P.body,GEO.head.piv);P.head.add(partMesh('head',mat,pal,fn,sh));
 eyes(P.head);
 for(const s of['L','R']){const a=grp(P.body,GEO['arm'+s].piv);a.add(partMesh('arm'+s,mat,pal,fn,sh));const e=grp(a,GEO['fore'+s].piv);e.add(partMesh('fore'+s,mat,pal,fn,sh));P['arm'+s]=a;P['el'+s]=e;
  const l=grp(g,GEO['leg'+s].piv);l.add(partMesh('leg'+s,mat,pal,fn,sh));P['leg'+s]=l}
 P.body.rotation.x=.3;P.rz=true;P.handY=-.27;P.mat=mat;P.style=st;
 if(O&&O.pivFix)O.pivFix(P);
 if(O&&O.acc)try{O.acc({P,g,mat,pal,st,GEO,ACC,OFF})}catch(e){console.warn('[rzombie] outfit',st,e)}
 return P}
const _mh=makeHuman;
makeHuman=function(o,g){if(o&&o.zombie&&(!window.RGFX||RGFX.s.zmodel!==0))try{return makeRZ(o,g)}catch(e){console.warn('[rzombie] build failed, classic model',e)}return _mh.apply(this,arguments)};
/* stumps: the flesh caps are part of the mesh, so Modern zombies only get a small blood clot instead of MFZ's red block */
const _st=_stumpFor;
_stumpFor=function(z,part){const P=z.userData.parts;if(!P||!P.rz)return _st.apply(this,arguments);
 const par=part==='head'?P.body:(part==='armL'||part==='armR')?P.body:z,src=P[part],m=new T.Mesh(CLOT,CLOTM);m.position.copy(src.position);if(part==='legL'||part==='legR')m.position.y-=.02;m.scale.setScalar(part==='head'?1.2:1);par.add(m);return m};
const CLOT=new T.IcosahedronGeometry(.045,0),CLOTM=new T.MeshStandardMaterial({color:0x4a0606,roughness:.4});
/* severed limbs remember whether they were mirrored (an arm grafted onto the other side) */
const _sl=spawnLimb;
spawnLimb=function(z,part){const P=z.userData.parts,src=P&&P[part],r=_sl.apply(this,arguments);if(r&&src&&limbs.length){const L=limbs[limbs.length-1];L.mir=!!(src.userData&&src.userData.mir)}return r};
window.RZ={GEO,ACC,OFF,TX,makeRZ,material,side:p=>p&&p.slice(-1),mirror:(L,slot)=>!!L.mir!==((L.part||slot).slice(-1)!==slot.slice(-1))};
console.log('[rzombie] modular Modern zombies ready ('+Object.keys(GEO).length+' parts, '+Object.values(GEO).reduce((a,g)=>a+g.idx.count/3,0)+' tris)');
})();
