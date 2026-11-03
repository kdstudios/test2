/* =====================================================================================================
   REVISION 039 - PERFORMANCE PASS (separate script block, loaded after the Dev Toolkit)
   Everything here either replaces a hot function (blocked / los / look / rayWorld / groundAt / lighting / streetLight /
   mesh / clearWorld / buildWorld) or adds a post-generation optimisation pass. Add ?noperf to the page URL to skip the
   post-generation pass (merge / instance / freeze / cull) for A/B comparison - the faster collision + ray code stays on.
   ===================================================================================================== */
(function(){
const PF=window.PF={recs:[],pool:null,glow:null,mm:new Map(),im:new Map(),t:0,lt:0,fa:0,fn:0,cool:0,stats:''};
const OFF=/[?&]noperf/.test(location.search);
const I4=new THREE.Matrix4();

/* ---------- spatial grid for solids (items 10, 11) ---------- */
function Grid(cs){this.cs=cs;this.m=new Map();this.big=[];this.count=0;this.stamp=0}
const gk=(ix,iz)=>(ix+2048)*4096+(iz+2048);
Grid.prototype.add=function(b){this.count++;if(!b||!isFinite(b.min.x)||!isFinite(b.max.x)||!isFinite(b.min.z)||!isFinite(b.max.z))return;
 const cs=this.cs,x0=Math.floor(b.min.x/cs),x1=Math.floor(b.max.x/cs),z0=Math.floor(b.min.z/cs),z1=Math.floor(b.max.z/cs);
 if((x1-x0+1)*(z1-z0+1)>64){this.big.push(b);return}
 for(let ix=x0;ix<=x1;ix++)for(let iz=z0;iz<=z1;iz++){const k=gk(ix,iz);let a=this.m.get(k);if(!a){a=[];this.m.set(k,a)}a.push(b)}};
Grid.prototype.del=function(b){this.count--;if(!b)return;const bi=this.big.indexOf(b);if(bi>=0){this.big.splice(bi,1);return}
 const cs=this.cs,x0=Math.floor(b.min.x/cs),x1=Math.floor(b.max.x/cs),z0=Math.floor(b.min.z/cs),z1=Math.floor(b.max.z/cs);
 for(let ix=x0;ix<=x1;ix++)for(let iz=z0;iz<=z1;iz++){const a=this.m.get(gk(ix,iz));if(a){const i=a.indexOf(b);if(i>=0)a.splice(i,1)}}};
function SG(){let g=solids.G;if(!g||g.count!==solids.length){g=solids.G=new Grid(4);for(const b of solids)g.add(b)}return g}
function WG(){let g=walkables.G;if(!g||g.count!==walkables.length){g=walkables.G=new Grid(4);for(const b of walkables)g.add(b)}return g}

blocked=function(x,z,r=.4,fy=0,hh=1.8){TB.min.set(x-r,fy+.05,z-r);TB.max.set(x+r,fy+hh,z+r);
 const g=SG(),cs=g.cs,x0=Math.floor((x-r)/cs),x1=Math.floor((x+r)/cs),z0=Math.floor((z-r)/cs),z1=Math.floor((z+r)/cs);
 for(let ix=x0;ix<=x1;ix++)for(let iz=z0;iz<=z1;iz++){const a=g.m.get(gk(ix,iz));if(!a)continue;for(let i=0;i<a.length;i++){const s=a[i];if(s&&s.intersectsBox(TB))return s}}
 for(const s of g.big)if(s&&s.intersectsBox(TB))return s;
 return null};

groundAt=function(x,z,fy){let gy=0;
 const test=q=>{if(q.max.y<=fy+.32&&q.max.y>gy&&x>q.min.x-.3&&x<q.max.x+.3&&z>q.min.z-.3&&z<q.max.z+.3)gy=q.max.y};
 for(const gr of [SG(),WG()]){const cs=gr.cs,x0=Math.floor((x-.3)/cs),x1=Math.floor((x+.3)/cs),z0=Math.floor((z-.3)/cs),z1=Math.floor((z+.3)/cs);
  for(let ix=x0;ix<=x1;ix++)for(let iz=z0;iz<=z1;iz++){const a=gr.m.get(gk(ix,iz));if(a)for(let i=0;i<a.length;i++){const q=a[i];if(q)test(q)}}
  for(const q of gr.big)if(q)test(q)}
 return gy};

los=function(a,b,strict){const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),z0=Math.min(a.z,b.z),z1=Math.max(a.z,b.z);
 const g=SG(),cs=g.cs,st=++g.stamp,cx0=Math.floor(x0/cs),cx1=Math.floor(x1/cs),cz0=Math.floor(z0/cs),cz1=Math.floor(z1/cs);
 const hit=q=>{if(!q||q.__s===st)return false;q.__s=st;if(q.bar||(q.win&&!strict)||q.max.y<=1.5||q.min.y>=1.5||q.max.x<x0||q.min.x>x1||q.max.z<z0||q.min.z>z1)return false;if(inBox2(q,a)||inBox2(q,b))return false;return segHit2(q,a.x,a.z,b.x,b.z)};
 for(let ix=cx0;ix<=cx1;ix++)for(let iz=cz0;iz<=cz1;iz++){const arr=g.m.get(gk(ix,iz));if(arr)for(let i=0;i<arr.length;i++)if(hit(arr[i]))return false}
 for(const q of g.big)if(hit(q))return false;
 if(sight.length){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),n=Math.ceil(d/.3);P3.y=1.5;
  const near=[];for(const q of sight)if(!(q.max.x<x0||q.min.x>x1||q.max.z<z0||q.min.z>z1))near.push(q);
  if(near.length)for(let i=1;i<n;i++){const t=i/n;if(t*d>.8&&(1-t)*d>.8){P3.x=a.x+dx*t;P3.z=a.z+dz*t;for(const q of near)if(q.containsPoint(P3))return false}}}
 return true};

/* cached line of sight for zombie -> survivor checks (re-tested every ~0.2-0.3s, staggered by random jitter) */
window.losC=function(z,m){const u=z.userData,c=u.lcm||(u.lcm=new Map()),t=performance.now();let e=c.get(m);if(!e||t>e.t){e={v:los(z.position,m.position),t:t+200+Math.random()*100};c.set(m,e)}return e.v};

/* ---------- ray scanning: only near / visible things (item 9) ---------- */
const LIVEK=new Set(['zombie','corpse','surv','npc','comp','loot']),RB=new THREE.Vector3();
function scanRay(o,hits){for(const c of o.children){if(c===pl||c.visible===false)continue;const u=c.userData;
  if(c.parent===scene){if(u.bb){if(!u.bb.containsPoint(ray.ray.origin)){if(!ray.ray.intersectBox(u.bb,RB)||RB.distanceToSquared(ray.ray.origin)>ray.far*ray.far)continue}}
   else if(u.kind&&LIVEK.has(u.kind)&&c.position.distanceToSquared(ray.ray.origin)>(ray.far+8)*(ray.far+8))continue}
  if(c.isMesh||c.isLine||c.isPoints||c.isSprite)ray.intersectObject(c,false,hits);
  if(c.children.length)scanRay(c,hits)}}
look=function(thru,v){ray.setFromCamera(v||C0,camera);ray.far=40;const hits=[];scanRay(scene,hits);hits.sort((a,b)=>a.distance-b.distance);
 for(const i of hits){const o=own(i.object);if(thru&&o&&o.userData.kind==='glass'){breakWin(o.userData.w,true);continue}if(thru&&o&&o.userData.thru)continue;
  return{o,d:i.distance,m:i.object,p:i.point,n:i.face?i.face.normal.clone().transformDirection(i.object.matrixWorld):null}}return null};
rayWorld=function(o,dir,far,skip){ray.set(o,dir);ray.far=far;const hits=[];scanRay(scene,hits);hits.sort((a,b)=>a.distance-b.distance);
 for(const i of hits){if(i.object.isSprite||!i.object.visible||i.distance<.3)continue;const ow=own(i.object);if(ow&&(ow===skip||ow.userData.thru))continue;
  return{p:i.point,n:i.face?i.face.normal.clone().transformDirection(i.object.matrixWorld):null,o:ow}}return null};

/* ---------- bullet holes: only on static world surfaces (bug 2) + wounds on zombies (bug 3) ---------- */
window.holeOK=function(h){const m=h&&h.m;if(!m||m.isSprite||!h.n)return false;const o=h.o;
 if(o&&(LIVE.has(o.userData.kind)||o.userData.kind==='loot'||o.userData.kind==='door'))return false;
 for(let a=m;a&&a!==scene;a=a.parent){if(a.userData&&(a.userData.part||a.userData.wound))return false;for(const L of limbs)if(L.m===a)return false}
 if(PF.built)return m.matrixAutoUpdate===false||!!m.userData.surf;
 for(let a=m;a;a=a.parent)if(a.userData&&a.userData.kind)return false;
 return true};
let WND_MAT=null,WND_GEO=null;
window.addWound=function(h){if(!h||!h.m||!h.p||!h.n)return;const m=h.m;
 if(!WND_MAT){const cv=document.createElement('canvas');cv.width=cv.height=32;const c=cv.getContext('2d'),g=c.createRadialGradient(16,16,0,16,16,15);
  g.addColorStop(0,'rgba(70,0,0,1)');g.addColorStop(.4,'rgba(165,8,8,.97)');g.addColorStop(.75,'rgba(150,0,0,.6)');g.addColorStop(1,'rgba(150,0,0,0)');c.fillStyle=g;c.fillRect(0,0,32,32);
  WND_MAT=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});WND_GEO=new THREE.PlaneGeometry(.1,.1)}
 m.updateWorldMatrix(true,false);const w=new THREE.Mesh(WND_GEO,WND_MAT),lp=m.worldToLocal(h.p.clone()),ln=m.worldToLocal(h.p.clone().add(h.n)).sub(lp).normalize();
 m.add(w);w.position.copy(lp).addScaledVector(ln,.012);w.lookAt(h.p.clone().add(h.n));w.rotateZ(rnd(0,TAU));const s=rnd(.8,1.4);w.scale.set(s,s,1);
 w.raycast=()=>{};w.renderOrder=3;w.userData={wound:1};const L=m.userData.wl||(m.userData.wl=[]);L.push(w);if(L.length>6)m.remove(L.shift())};

/* ---------- materials / meshes (items 2, 4) ---------- */
function pfMat(c){return PERF.mat==='lambert'?new THREE.MeshLambertMaterial({color:c}):new THREE.MeshPhongMaterial({color:c,specular:0,shininess:0})}
mesh=function(g,c,x,y,z,p){const m=new THREE.Mesh(g,pfMat(c));m.position.set(x,y,z);m.userData.pfm=1;(p||scene).add(m);return m};

/* ---------- street lights: fake glow + a few real lights (item 3) ---------- */
streetLight=function(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 mesh(new THREE.CylinderGeometry(.1,.15,6,6),0x2a2a2a,0,3,0,g);
 const head=mesh(new THREE.BoxGeometry(.8,.3,.8),0x1a1a1a,0,6.15,0,g);
 solids.push(new THREE.Box3(new THREE.Vector3(x-.15,0,z-.15),new THREE.Vector3(x+.15,6,z+.15)));
 g.userData={kind:'light',inst:1};
 if(Math.random()<.55){head.material.emissive.setHex(0x664400);streetLights.push({x,y:5.9,z})}};
const CL=new THREE.Color(),LA=new THREE.Color(0x05070a),LB=new THREE.Color(0x7092be),LS=new THREE.Color();
lighting=function(){const d=THREE.MathUtils.clamp(Math.sin((G.time-6)/24*TAU)*2+.3,0,1);LS.copy(LA).lerp(LB,d);
 if(!scene.background||!scene.background.isColor)scene.background=new THREE.Color();scene.background.copy(LS);scene.fog.color.copy(LS);
 dirL.intensity=.2+.9*d;ambL.intensity=.18+.5*d;dirL.position.set(Math.cos((G.time-6)/24*TAU)*80,Math.abs(Math.sin((G.time-6)/24*TAU))*80+10,20);
 PF.night=G.time>=20||G.time<5;if(PF.glow)PF.glow.material.opacity=PF.night?.95:0};
function glowTex(){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,0,32,32,31);g.addColorStop(0,'rgba(255,235,170,1)');g.addColorStop(.25,'rgba(255,205,110,.55)');g.addColorStop(1,'rgba(255,190,90,0)');c.fillStyle=g;c.fillRect(0,0,64,64);return new THREE.CanvasTexture(cv)}
function perfLamps(){if(!PF.pool)return;const L=streetLights,pool=PF.pool;
 if(!PF.night||!L.length){for(const l of pool)l.intensity=0;return}
 const px=pl.position.x,pz=pl.position.z,best=[];
 for(const s of L){const d=(s.x-px)*(s.x-px)+(s.z-pz)*(s.z-pz);if(d>2500)continue;let i=best.length;while(i>0&&best[i-1].d>d)i--;if(i<pool.length){best.splice(i,0,{s,d});if(best.length>pool.length)best.pop()}}
 pool.forEach((l,i)=>{const b=best[i];if(b){l.position.set(b.s.x,b.s.y,b.s.z);l.intensity=1.4}else l.intensity=0})}


/* ---------- zombies / survivors: merge each rigid body part's meshes (28 meshes -> ~10) ---------- */
window.mergeHuman=function(g,P){if(OFF)return;try{for(const grp of [P.body,P.head,P.armL,P.elL,P.armR,P.elR,P.legL,P.legR]){if(!grp)continue;
  const by=new Map();for(const m of grp.children){if(!m.isMesh||!m.userData||m.userData.pfm!==1||!mergeable(m))continue;const k=sigNC(m.material)+'|'+(m.userData.part||'');let a=by.get(k);if(!a)by.set(k,a=[]);a.push(m)}
  for(const ms of by.values()){if(ms.length<2)continue;const geo=buildMerged(ms,null,true),e=ms[0].material.emissive?ms[0].material.emissive.getHex():0,
    mt=PERF.mat==='lambert'?new THREE.MeshLambertMaterial({vertexColors:true,emissive:e}):new THREE.MeshPhongMaterial({vertexColors:true,emissive:e,specular:0,shininess:0}),mm=new THREE.Mesh(geo,mt),ud={pfm:2};
   if(ms[0].userData.part!==undefined)ud.part=ms[0].userData.part;if(ms[0].userData.head)ud.head=1;mm.userData=ud;mm.matrixAutoUpdate=false;grp.add(mm);for(const m of ms)grp.remove(m)}}}catch(err){console.warn('[perf039] mergeHuman',err)}};

/* ---------- build pass: merge static meshes, instance trees/lamps, freeze matrices (items 1, 5, 7) ---------- */
const sigNC=m=>m.type+'|'+(m.emissive?m.emissive.getHex():0)+'|'+m.side;
const sigC=m=>sigNC(m)+'|'+m.color.getHex()+'|'+(m.flatShading?1:0);
function mergeable(m){const mt=m.material;if(!m.userData||m.userData.pfm!==1||!m.visible||!mt||Array.isArray(mt)||mt.map||mt.transparent||mt.opacity<1)return false;
 if(!(mt.isMeshPhongMaterial||mt.isMeshLambertMaterial||mt.isMeshBasicMaterial||mt.isMeshStandardMaterial))return false;
 const g=m.geometry;if(!g||!g.attributes||!g.attributes.position||!g.attributes.normal)return false;
 if(m.raycast!==THREE.Mesh.prototype.raycast)return false;const pr=g.parameters;if(pr&&(pr.width>=100||pr.height>=100))return false;return true}
function mergedMat(m){if(window.RGW){const r=RGW.mergedMat(m);if(r)return r}const k=sigNC(m.material);let x=PF.mm.get(k);if(!x){const mt=m.material,o={vertexColors:true,side:mt.side};
 if(mt.isMeshBasicMaterial)x=new THREE.MeshBasicMaterial(o);else{if(mt.emissive)o.emissive=mt.emissive.getHex();x=PERF.mat==='lambert'?new THREE.MeshLambertMaterial(o):new THREE.MeshPhongMaterial(Object.assign(o,{specular:0,shininess:0}))}PF.mm.set(k,x)}return x}
const V1=new THREE.Vector3(),V2=new THREE.Vector3(),V3=new THREE.Vector3(),NM=new THREE.Matrix3(),MM=new THREE.Matrix4();
function buildMerged(list,inv,local){const P=[],N=[],C=[],I=[],TC=[];let off=0;
 for(const m of list){const tcv=window.RGW?RGW.tag(m):0;const g=m.geometry,pa=g.attributes.position,na=g.attributes.normal,ix=g.index,col=m.material.color,flat=!!m.material.flatShading;
  if(local){m.updateMatrix();MM.copy(m.matrix)}else MM.multiplyMatrices(inv,m.matrixWorld);NM.getNormalMatrix(MM);const mir=MM.determinant()<0;
  if(flat){const n=ix?ix.count:pa.count;for(let i=0;i+2<n;i+=3){const a=ix?ix.getX(i):i,b=ix?ix.getX(i+1):i+1,c=ix?ix.getX(i+2):i+2;
    V1.fromBufferAttribute(pa,a).applyMatrix4(MM);V2.fromBufferAttribute(pa,b).applyMatrix4(MM);V3.fromBufferAttribute(pa,c).applyMatrix4(MM);
    const ux=V2.x-V1.x,uy=V2.y-V1.y,uz=V2.z-V1.z,vx=V3.x-V1.x,vy=V3.y-V1.y,vz=V3.z-V1.z;let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
    const pts=mir?[V1,V3,V2]:[V1,V2,V3];if(mir){nx=-nx;ny=-ny;nz=-nz}
    for(const p of pts){P.push(p.x,p.y,p.z);N.push(nx,ny,nz);C.push(col.r,col.g,col.b);TC.push(tcv)}I.push(off,off+1,off+2);off+=3}}
  else{for(let i=0;i<pa.count;i++){V1.fromBufferAttribute(pa,i).applyMatrix4(MM);P.push(V1.x,V1.y,V1.z);V2.fromBufferAttribute(na,i).applyMatrix3(NM).normalize();N.push(V2.x,V2.y,V2.z);C.push(col.r,col.g,col.b);TC.push(tcv)}
   const n=ix?ix.count:pa.count;for(let i=0;i+2<n;i+=3){const a=ix?ix.getX(i):i,b=ix?ix.getX(i+1):i+1,c=ix?ix.getX(i+2):i+2;if(mir)I.push(a+off,c+off,b+off);else I.push(a+off,b+off,c+off)}off+=pa.count}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(C,3));geo.setAttribute('aTc',new THREE.Float32BufferAttribute(TC,1));
 geo.setIndex(off>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));geo.computeBoundingSphere();geo.computeBoundingBox();return geo}
function instMat(m){if(window.RGW){const r=RGW.instMat(m);if(r)return r}const k=sigC(m.material);let x=PF.im.get(k);if(!x){const mt=m.material,o={color:mt.color.getHex(),side:mt.side};if(mt.emissive)o.emissive=mt.emissive.getHex();
 x=mt.isMeshBasicMaterial?new THREE.MeshBasicMaterial({color:o.color,side:o.side}):(PERF.mat==='lambert'?new THREE.MeshLambertMaterial(o):new THREE.MeshPhongMaterial(Object.assign(o,{specular:0,shininess:0})));PF.im.set(k,x)}return x}

function perfOptimize(){if(window.RGW)RGW.begin();const t0=performance.now();let nIn=0,nOut=0,nInst=0;
 scene.updateMatrixWorld(true);
 const dyn=new Set([pl]),add=o=>{if(o&&o.isObject3D)dyn.add(o)};
 zombies.forEach(add);smesh.forEach(add);npcList.forEach(add);dropBoxes.forEach(b=>add(b.group));comps.forEach(c=>add(c.m));doors.forEach(d=>add(d.p));winList.forEach(w=>add(w.m));limbs.forEach(l=>add(l.m));add(carry);
 const DYNK=new Set(['zombie','corpse','surv','npc','comp','door','bar','spike','loot','glass']);
 const buckets=new Map(),instG=[],invs=new Map();
 const getInv=r=>{let v=invs.get(r);if(!v){v=new THREE.Matrix4().copy(r.matrixWorld).invert();invs.set(r,v)}return v};
 const collect=(o,root,nm)=>{if(dyn.has(o))return;const k=o.userData&&o.userData.kind;if(k&&k!=='truck')nm=true;
  if(o.isMesh&&!o.isInstancedMesh&&!nm&&mergeable(o)){let key;if(root)key='r'+root.id;else{const e=o.matrixWorld.elements;key='c'+Math.floor(e[12]/64)+','+Math.floor(e[14]/64)}
   let a=buckets.get(key);if(!a)buckets.set(key,a={root,list:[]});a.list.push(o)}
  for(const c of o.children)collect(c,root,nm)};
 const hasStd=o=>{let f=false;o.traverse(c=>{if(c.isMesh&&c.material&&c.material.isMeshStandardMaterial)f=true});return f};
 /* v041: road markings / cracks (loose Standard-material quads) and vehicles were never merged: ~190 + ~140 draw calls. Mark them so the merge takes them. */
 PF.det=[];PF.gl=new Map();
 for(const c of scene.children){if(c===pl||c.isLight||dyn.has(c)||(c.userData&&c.userData.dev))continue;const k=c.userData&&c.userData.kind;
  if(c.isMesh&&!c.isInstancedMesh&&c.userData&&!c.userData.pfm&&!k&&c.material&&!Array.isArray(c.material)&&c.material.isMeshStandardMaterial&&!c.material.map&&!c.material.transparent&&c.position.y<.05&&c.geometry&&(c.geometry.type==='PlaneGeometry'||c.geometry.type==='CircleGeometry'))c.userData.pfm=1;
  else if(c.isGroup&&(!k||k==='truck')&&!(c.userData&&(c.userData.bw||c.userData.bb))&&hasStd(c))c.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&m.material&&!Array.isArray(m.material)&&!m.material.transparent&&!m.material.map&&(m.material.isMeshStandardMaterial||m.material.isMeshPhongMaterial)&&m.userData&&!m.userData.kind)m.userData.pfm=1})}
 for(const c of scene.children.slice()){if(c===pl||c.isLight||dyn.has(c)||(c.userData&&c.userData.dev))continue;const k=c.userData&&c.userData.kind;
  if(c.userData&&(c.userData.inst||k==='tree'||k==='light')){instG.push(c);continue}
  collect(c,c.isMesh?null:c,false)}
 PF.recs=[];
 /* merge by (layer, material signature) per building / map cell */
 for(const [key,bk] of buckets){const root=bk.root,inv=root?getInv(root):I4,ud=root?root.userData:null,groups=new Map();
  for(const m of bk.list){let layer='s';
   if(ud&&ud.bw){const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();V1.copy(g.boundingBox.getCenter(V2)).applyMatrix4(m.matrixWorld).applyMatrix4(inv);
    if(Math.abs(V1.x)<ud.bw/2-.6&&Math.abs(V1.z)<ud.bd/2-.6&&V1.y>.12&&V1.y<ud.bh-.3)layer='i'}
   const k=layer+'#'+sigNC(m.material);let a=groups.get(k);if(!a)groups.set(k,a=[]);a.push(m)}
  const rec={g:root,all:[],int:[],b:new THREE.Box3()};
  for(const [k,ms] of groups){const geo=buildMerged(ms,inv),mm=new THREE.Mesh(geo,mergedMat(ms[0]));mm.userData={surf:1,pfm:'merged'};mm.matrixAutoUpdate=false;
   if(root){root.add(mm);mm.matrixWorld.copy(root.matrixWorld)}else scene.add(mm);
   ms.forEach(m=>{if(m.parent)m.parent.remove(m)});nIn+=ms.length;nOut++;(k[0]==='i'?rec.int:rec.all).push(mm);
   if(!root)rec.b.union(new THREE.Box3().copy(geo.boundingBox))}
  if(root){rec.b.setFromObject(root);root.userData.bb=rec.b.clone().expandByScalar(.5)}
  PF.recs.push(rec)}
 /* v041: each door was 2 draw calls (panel + handle): merge into the panel; far doors are hidden (fog is ~95% by 80 m) */
 let nDoor=0;
 for(const d of doors){const pv=d.p,dr=pv&&pv.children&&pv.children.find(c=>c.isMesh&&c.userData&&c.userData.kind==='door');if(!dr||dr.userData.dmerged)continue;
  const hs=dr.children.filter(c=>c.isMesh&&c.userData&&c.userData.pfm===1&&mergeable(c));
  if(hs.length){const om=dr.material,pan={geometry:dr.geometry,material:om,matrix:new THREE.Matrix4(),updateMatrix(){}},geo=buildMerged([pan,...hs],null,true);
   dr.geometry=geo;dr.material=mergedMat({material:om});hs.forEach(h=>dr.remove(h));dr.userData.dmerged=1;nDoor++}
  pv.updateWorldMatrix(true,false);PF.det.push({o:pv,x:pv.matrixWorld.elements[12],z:pv.matrixWorld.elements[14],far:75})}
 /* v041: window panes were ~260 separate transparent draw calls. One merged glass mesh per building; the pane meshes stay in place (so shooting / breaking
    work unchanged) but use an invisible material so they cost nothing to draw. Breaking a window rebuilds that building's glass. */
 const HIDM=new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide});PF.hid=HIDM;
 PF.glassMat=new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.3,depthWrite:false,side:THREE.DoubleSide,specular:0,shininess:0});
 let nGlass=0;
 for(const w of winList){if(w.pseudo||!w.m||!w.m.isMesh||!w.g||w.m.material===HIDM)continue;const mt=w.m.material;if(!mt||mt.map||Array.isArray(mt))continue;
  w.m.updateWorldMatrix(true,false);w.gp={geometry:w.m.geometry,material:{color:mt.color.clone(),flatShading:false},matrixWorld:w.m.matrixWorld.clone()};
  let r=PF.gl.get(w.g);if(!r)PF.gl.set(w.g,r={ws:[],mesh:null});r.ws.push(w);if(w.alive&&w.m.parent)w.m.material=HIDM}
 for(const g of PF.gl.keys()){PF.rebuildGlass(g);nGlass++}
 /* instancing: trees, bushes, border trees, lamp posts (item 5) */
 const chunks=new Map(),ig=new Map();
 for(const g of instG){g.updateMatrixWorld(true);g.traverse(m=>{if(!m.isMesh||!m.userData||m.userData.pfm!==1||!mergeable(m))return;
   const e=m.matrixWorld.elements,cx=Math.floor(e[12]/50),cz=Math.floor(e[14]/50),gk0=m.geometry.type+JSON.stringify(m.geometry.parameters||{}),k=gk0+'|'+sigC(m.material)+'#'+cx+','+cz;
   let c=chunks.get(k);if(!c)chunks.set(k,c={m,gk0,cx,cz,mats:[]});c.mats.push(m.matrixWorld.clone())});scene.remove(g)}
 for(const [k,c] of chunks){const src=c.m;let geo=ig.get(c.gk0+(src.material.flatShading?'f':'s'));
  if(!geo){geo=src.material.flatShading?src.geometry.toNonIndexed():src.geometry.clone();if(src.material.flatShading)geo.computeVertexNormals();ig.set(c.gk0+(src.material.flatShading?'f':'s'),geo)}
  const im=new THREE.InstancedMesh(geo,instMat(src),c.mats.length),bb=new THREE.Box3();
  c.mats.forEach((mx,i)=>{im.setMatrixAt(i,mx);bb.expandByPoint(V1.setFromMatrixPosition(mx))});im.instanceMatrix.needsUpdate=true;
  im.frustumCulled=false;im.matrixAutoUpdate=false;im.raycast=()=>{};im.userData={surf:1,inst:1};scene.add(im);nInst+=c.mats.length;
  bb.expandByScalar(4);PF.recs.push({g:null,all:[im],int:[],b:bb})}
  /* vehicles: were never frustum-culled and drawn at any distance -> cull them again; loot containers only draw when close */
 for(const c of scene.children){if(c===pl||c.isLight||dyn.has(c)||!c.userData||c.userData.dev)continue;
  if(c.isGroup&&!c.userData.kind&&!c.userData.bb&&hasStd(c)){c.traverse(m=>{if(m.isMesh)m.frustumCulled=true});c.updateMatrixWorld(true);PF.recs.push({g:c,all:[],int:[],b:new THREE.Box3().setFromObject(c)})}
  else if(c.isGroup&&c.userData.kind==='loot'&&c.userData.cont&&!c.userData.cont.drop){c.updateMatrixWorld(true);PF.recs.push({g:c,all:[],int:[],b:new THREE.Box3().setFromObject(c),far:45})}}
 /* lamp glow (one draw call) */
 if(PF.glow){scene.remove(PF.glow);PF.glow.geometry.dispose();PF.glow=null}
 if(streetLights.length){const pos=new Float32Array(streetLights.length*3);streetLights.forEach((s,i)=>{pos[i*3]=s.x;pos[i*3+1]=s.y+.1;pos[i*3+2]=s.z});
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  if(!PF.gtex)PF.gtex=glowTex();const p=new THREE.Points(geo,new THREE.PointsMaterial({map:PF.gtex,size:6,sizeAttenuation:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0}));
  p.frustumCulled=false;p.raycast=()=>{};p.matrixAutoUpdate=false;p.userData={surf:1};scene.add(p);PF.glow=p}
 /* freeze matrices of everything static (item 7) */
 const fz=o=>{if(dyn.has(o)||o.isLight||o===pl||o.isCamera)return;const k=o.userData&&o.userData.kind;if(k&&DYNK.has(k))return;if(o.userData&&o.userData.anim)return;o.updateMatrix();o.matrixAutoUpdate=false;for(const c of o.children)fz(c)};
 for(const c of scene.children){if(c===pl||c.isLight||dyn.has(c)||c.matrixAutoUpdate===false||(c.userData&&c.userData.dev))continue;if(!c.isMesh&&hasStd(c))continue;fz(c)}
 PF.built=true;PERF.built=true;perfCull();
 PF.stats='merged '+nIn+' meshes into '+nOut+', instanced '+nInst+' props, '+nDoor+' doors, '+nGlass+' glass groups, '+(performance.now()-t0).toFixed(0)+' ms';
 console.log('[perf039] '+PF.stats);if(window.RGW)RGW.end()}

/* ---------- per-frame culling: far buildings, hidden interiors, far zombies (items 6, 12) ---------- */
function perfCull(){if(!pl)return;const px=pl.position.x,pz=pl.position.z,F=PERF.farB,F2=F*F,I=PERF.intR;
 for(const r of PF.recs){const b=r.b,dx=Math.max(b.min.x-px,0,px-b.max.x),dz=Math.max(b.min.z-pz,0,pz-b.max.z),d2=dx*dx+dz*dz,vis=d2<(r.far?r.far*r.far:F2);
  if(r.g){if(r.g.visible!==vis)r.g.visible=vis}else for(const m of r.all)if(m.visible!==vis)m.visible=vis;
  if(r.int.length){const iv=vis&&d2<I*I;for(const m of r.int)if(m.visible!==iv)m.visible=iv}}
 const far=o=>{const dx=o.position.x-px,dz=o.position.z-pz,v=dx*dx+dz*dz<F2;if(o.visible!==v)o.visible=v};
 for(const m of smesh)far(m);for(const m of npcList)far(m);
 for(const e of PF.det||[]){const dx=e.x-px,dz=e.z-pz,v=dx*dx+dz*dz<e.far*e.far;if(e.o.visible!==v)e.o.visible=v}}

/* ---------- v041: merged window glass ---------- */
PF.rebuildGlass=function(g){const r=PF.gl&&PF.gl.get(g);if(!r)return;if(r.mesh){g.remove(r.mesh);r.mesh.geometry.dispose();r.mesh=null}
 const list=r.ws.filter(w=>w.alive&&w.gp).map(w=>w.gp);if(!list.length)return;g.updateWorldMatrix(true,false);
 const geo=buildMerged(list,new THREE.Matrix4().copy(g.matrixWorld).invert()),m=new THREE.Mesh(geo,PF.glassMat);
 m.matrixAutoUpdate=false;m.userData={surf:1,pfm:'glass'};m.raycast=()=>{};m.matrixWorld.copy(g.matrixWorld);g.add(m);r.mesh=m};
{const _bk=breakWin;breakWin=function(w){const was=w&&w.alive,r=_bk.apply(this,arguments);if(was&&w.g&&PF.rebuildGlass)PF.rebuildGlass(w.g);return r};
 const _qb=quietBreak;quietBreak=function(w){const was=w&&w.alive,r=_qb.apply(this,arguments);if(was&&w.g&&PF.rebuildGlass)PF.rebuildGlass(w.g);return r}}

/* ---------- world build / clear hooks ---------- */
const _cw=clearWorld;clearWorld=function(){const old=scene?scene.children.filter(c=>c!==pl&&!c.isLight):[];
 PF.recs=[];PF.det=[];PF.gl=null;PF.glow=null;PF.built=false;PERF.built=false;_cw();solids.G=null;walkables.G=null;
 try{for(const o of old)o.traverse(d=>{if(d.isInstancedMesh&&d.dispose)d.dispose();if(d.geometry&&d.geometry.dispose)d.geometry.dispose();const mt=d.material;
   for(const x of(Array.isArray(mt)?mt:[mt])){if(x&&x.dispose){if(x.map&&x.map.dispose)x.map.dispose();x.dispose()}}})}catch(e){console.warn('dispose',e)}};
/* v075: hooks into the stepped world build (core WB) instead of wrapping buildWorld, so the loading screen runs them too */
WB.pre.push(()=>{if(!PF.pool&&scene){PF.pool=[0,1,2].map(()=>{const l=new THREE.PointLight(0xffdd88,0,16,2);scene.add(l);return l})}PF.err=null});
WB.post.push(()=>{if(!OFF&&scene){try{perfOptimize()}catch(e){PF.err=(e&&e.message)||String(e);console.error('[perf039] optimise failed - world left unoptimised',e)}}});
const _mk=mk;mk=function(x,z,w,d,h,c,fc,dc){const B=_mk(x,z,w,d,h,c,fc,dc);B.g.userData.bw=w;B.g.userData.bd=d;B.g.userData.bh=h;return B};


/* ---------- profiler overlay: F3 toggles, F4 hides zombies, F6 hides the world (isolates what is slow) ---------- */
const dg=document.createElement('div');dg.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:6px;z-index:2147483647;background:rgba(0,0,0,.75);color:#9f9;font:11px/1.35 monospace;padding:6px 8px;white-space:pre;pointer-events:none;display:none';document.body.appendChild(dg);
let dgOn=false,hideZ=false,hideW=false,rMs=0,lgMs=0,frMs=16,frMax=0,dgT=0,objN=0,objT=0,lastF=performance.now();
addEventListener('keydown',e=>{if(e.code==='F3'){e.preventDefault();dgOn=!dgOn;dg.style.display=dgOn?'block':'none'}else if(e.code==='F4'){e.preventDefault();hideZ=!hideZ}else if(e.code==='F6'){e.preventDefault();hideW=!hideW}});
function hookRender(){if(!renderer||renderer.__pf)return;const o=renderer.render;
 renderer.render=function(s,c){const t0=performance.now();let sv=null;
  if(hideZ||hideW){sv=[];for(const ch of s.children){if(ch===pl||ch.isLight)continue;const z=ch.userData&&ch.userData.kind==='zombie';if((z&&hideZ)||(!z&&hideW)){sv.push(ch,ch.visible);ch.visible=false}}}
  o.call(this,s,c);if(sv)for(let i=0;i<sv.length;i+=2)sv[i].visible=sv[i+1];rMs=performance.now()-t0};renderer.__pf=1}
function dgUpdate(dt){frMax=Math.max(frMax,dt*1000);dgT-=dt;if(dgT>0||!dgOn)return;dgT=.5;const inf=renderer.info,lights=scene.children.filter(c=>c.isLight).length;
 objT-=.5;if(objT<=0){objT=2;objN=0;scene.traverse(o=>{if(o.visible)objN++})}
 dg.textContent='FPS '+(1000/frMs).toFixed(0)+'   frame '+frMs.toFixed(1)+' ms (worst '+frMax.toFixed(0)+')\ngame logic '+lgMs.toFixed(1)+' ms   render submit '+rMs.toFixed(1)+' ms\n'
  +'draw calls '+inf.render.calls+'   triangles '+inf.render.triangles+'   geometries '+inf.memory.geometries+'   textures '+inf.memory.textures+'\n'
  +'visible objects '+objN+'   zombies '+zombies.length+' (drawn '+zombies.filter(z=>z.visible).length+')   scene lights '+lights+'\n'
  +'perf pass: '+(PF.err?'FAILED - '+PF.err:PF.built?PF.stats:OFF?'disabled (?noperf)':'not run yet')+'\n'
  +'AA '+PERF.aa+'   quality '+G.q+'   pixel ratio '+renderer.getPixelRatio().toFixed(2)+'   material '+PERF.mat+'\n'
  +'F3 hide this   F4 hide zombies ['+(hideZ?'ON':'off')+']   F6 hide world ['+(hideW?'ON':'off')+']';frMax=0}

/* ---------- per-frame tick ---------- */
let last=performance.now();
const _an=animate;animate=function(){const t0=performance.now();hookRender();_an();const now=performance.now(),dt=Math.min(.25,(now-last)/1000);last=now;if(!scene||!pl||!renderer)return;PERF.n++;
 frMs+=((dt*1000)-frMs)*.1;lgMs+=((now-t0-rMs)-lgMs)*.1;dgUpdate(dt);
 PF.t-=dt;if(PF.t<=0){PF.t=.25;if(PF.recs.length||smesh.length||npcList.length)perfCull()}
 PF.lt-=dt;if(PF.lt<=0){PF.lt=.4;perfLamps()}
 if(G.q===3&&renderer&&playing()){PF.fa+=dt;PF.fn++;PF.cool-=dt;
  if(PF.fa>=1.5){const ms=PF.fa/PF.fn*1000;PF.fa=PF.fn=0;const mx=Math.min(devicePixelRatio,2);let pr=PERF.pr||1;
   if(ms>21&&pr>.55){pr=Math.max(.55,pr-.15);PF.cool=8}else if(ms<18&&pr<mx&&PF.cool<=0){pr=Math.min(mx,pr+.1);PF.cool=8}
   if(Math.abs(pr-(PERF.pr||1))>.01){PERF.pr=pr;renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight)}}}};

/* ---------- options: antialiasing toggle (item 8) ---------- */
window.setAA=function(on){on=!!on;PERF.aa=on;try{localStorage.setItem('gf_perf',JSON.stringify({aa:on}))}catch(e){}
 document.querySelectorAll('.ab').forEach(b=>b.classList.toggle('on',(+b.dataset.a===1)===on));
 if(!renderer)return;let cur=null;try{cur=renderer.getContext().getContextAttributes()}catch(e){}if(cur&&cur.antialias===on)return;
 const old=renderer,od=old.domElement,r=new THREE.WebGLRenderer({antialias:on});r.setPixelRatio(old.getPixelRatio());r.setSize(innerWidth,innerHeight);
 od.parentNode.replaceChild(r.domElement,od);r.domElement.addEventListener('click',()=>{if(playing()&&!locked&&!invOpen)lock()});renderer=r;
 try{old.dispose();old.forceContextLoss()}catch(e){}};
document.querySelectorAll('.ab').forEach(b=>b.classList.toggle('on',(+b.dataset.a===1)===PERF.aa));

/* ---------- HUD text: only write when the value changed (item 13) ---------- */
(function(){const d=Object.getOwnPropertyDescriptor(Node.prototype,'textContent');
 document.querySelectorAll('[id]').forEach(el=>{if(el.children.length||/^(INPUT|CANVAS|TEXTAREA|SELECT|SCRIPT|STYLE|BUTTON)$/.test(el.tagName))return;
  Object.defineProperty(el,'textContent',{configurable:true,get(){return d.get.call(this)},set(v){v=String(v);if(d.get.call(this)!==v)d.set.call(this,v)}})})})();
})();

