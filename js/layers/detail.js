/* ==========================================================================================================
   MINI FORT ZOMBIE - GROUND DETAIL LAYER
   The "lived-in map" density seen in Modern's Greek / Modern / European: wind-swayed grass tufts, wildflowers,
   pebble clusters, plus weather-aware ash drifts + glowing lava rocks (Doom) or snow drifts.
   Everything is GPU-instanced, visual only: no colliders, not raycastable (bullets and line-of-sight ignore it),
   and it is rebuilt on every world build (hooked after RGW.post). Density comes from Options > Graphics > Ground detail.
   ========================================================================================================== */
(function(){
'use strict';
const W=window.RGW,FX=window.RGFX;if(!W||!FX){return}
const T=THREE,PI=Math.PI,R=(a,b)=>a+Math.random()*(b-a),PK=a=>a[Math.floor(Math.random()*a.length)];
const DET=window.RGDET={stats:{},group:null};
const TIME={value:0};
const DENS=[0,.45,1,1.7];

/* ---------- shared geometry ---------- */
function tuftGeo(){
 const pos=[],col=[];const H=.5;
 for(let b=0;b<4;b++){
  const a=b*PI/4+R(-.2,.2),cx=Math.cos(a),sz=Math.sin(a),w=.085,lean=R(.05,.16),h=H*R(.65,1.15);
  const o=R(-.05,.05);
  const base=[[-w*cx+o,0,-w*sz],[w*cx+o,0,w*sz],[lean*sz+o,h,-lean*cx]];
  base.forEach((v,i)=>{pos.push(v[0],v[1],v[2]);const t=i===2?1:0;col.push(.45+.55*t,.5+.5*t,.4+.4*t)});
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.computeVertexNormals();
 // normals point up so blades light like ground cover
 const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,0,1,0);return g;
}
let GEO=null;
function upish(g,k){const n=g.attributes.normal;for(let i=0;i<n.count;i++){const x=n.getX(i),y=n.getY(i)+k,z=n.getZ(i),l=Math.hypot(x,y,z)||1;n.setXYZ(i,x/l,y/l,z/l)}return g}
function geos(){return GEO||(GEO={tuft:tuftGeo(),head:upish(new T.OctahedronGeometry(.055,0),2.5),peb:new T.IcosahedronGeometry(.1,0),drift:new T.SphereGeometry(1,10,6),rock:new T.IcosahedronGeometry(.45,0)})}

/* ---------- materials ---------- */
function windMat(){
 const m=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uTime=TIME;
  sh.vertexShader='uniform float uTime;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   #ifdef USE_INSTANCING
    float ph=instanceMatrix[3].x*.6+instanceMatrix[3].z*.45;
    transformed.x+=sin(uTime*1.9+ph)*.09*position.y*2.;transformed.z+=cos(uTime*1.5+ph*1.3)*.06*position.y*2.;
   #endif`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',NOFLIP)};   // v065: back faces keep the up normal
 m.customProgramCacheKey=()=>'det-wind-nf';
 return m;
}
/* v065: double-sided cards flip their normal on back faces (three's faceDirection), so half the blades went dark depending on the view.
   Undo the flip (faceDirection^2 = 1) so every blade lights like the ground it grows from. */
const NOFLIP=`#include <normal_fragment_begin>
 #ifdef DOUBLE_SIDED
  normal = normal * faceDirection;
 #endif`;

/* ---------- placement ---------- */
function layout(){try{return window.__fortZombieTown&&__fortZombieTown.layout||null}catch(e){return null}}
const rectHit=(arr,x,z,pad)=>arr&&arr.some(r=>x>r.x0-pad&&x<r.x1+pad&&z>r.z0-pad&&z<r.z1+pad);
let OCC=null;
function buildOcc(){   // 1 m occupancy grid of every solid that is below head height: one pass instead of a solids scan per candidate
 OCC=new Set();let n=0;
 try{for(const b of solids){if(!b||!b.min||b.min.y>1.6)continue;const x0=Math.floor(b.min.x-.3),x1=Math.floor(b.max.x+.3),z0=Math.floor(b.min.z-.3),z1=Math.floor(b.max.z+.3);
  if((x1-x0)*(z1-z0)>6000)continue;for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++)OCC.add(x*4096+z);n++}}catch(e){}
 DET.stats.solids=n;
}
function okSpot(L,x,z,pad){
 if(OCC.has(Math.floor(x)*4096+Math.floor(z)))return false;
 try{if(inBuilding(x,z,pad))return false}catch(e){}
 try{if(G.mode!=='EXPEDITION'&&Math.abs(x-FORT.x)<15.6+pad*.3&&Math.abs(z-FORT.z)<15.6+pad*.3)return false}catch(e){}   // v071: no grass growing through the fort floor
 if(L&&(rectHit(L.roads,x,z,2.2)||rectHit(L.alleys,x,z,1.8)))return false;
 return true;
}
function scatter(n,B,L,pad,cluster,clusterR){
 const out=[];let tries=0,cx=0,cz=0,left=0;
 while(out.length<n&&tries<n*5){tries++;
  let x,z;
  if(cluster){if(left<=0){cx=R(B[0],B[1]);cz=R(B[2],B[3]);left=Math.floor(R(cluster[0],cluster[1]))}left--;const a=R(0,PI*2),r=Math.sqrt(Math.random())*clusterR;x=cx+Math.cos(a)*r;z=cz+Math.sin(a)*r}
  else{x=R(B[0],B[1]);z=R(B[2],B[3])}
  if(x<B[0]+1||x>B[1]-1||z<B[2]+1||z>B[3]-1)continue;
  if(!okSpot(L,x,z,pad))continue;
  out.push([x,z]);
 }
 return out;
}
const M4=new T.Matrix4(),Q=new T.Quaternion(),S3=new T.Vector3(),P3=new T.Vector3(),E=new T.Euler(),CC=new T.Color();
function inst(geo,mat,pts,fn,name){
 if(!pts.length)return null;
 const im=new T.InstancedMesh(geo,mat,pts.length);im.name='rg-'+name;im.raycast=function(){};im.frustumCulled=false;im.userData.rgDetail=1;
 for(let i=0;i<pts.length;i++){const o=fn(pts[i],i);P3.set(pts[i][0],o.y||0,pts[i][1]);E.set(o.rx||0,o.ry||0,o.rz||0);Q.setFromEuler(E);
  if(o.sx!==undefined)S3.set(o.sx,o.sy,o.sz);else S3.setScalar(o.s||1);
  M4.compose(P3,Q,S3);im.setMatrixAt(i,M4);im.setColorAt(i,CC.set(o.c))}
 im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;return im;
}
const mix=(c,t,a)=>new T.Color(c).lerp(new T.Color(t),a).getHex();

/* ---------- build ---------- */
DET.build=function(){
 if(DET.group&&DET.group.parent)DET.group.parent.remove(DET.group);
 DET.group=null;DET.stats={};
 const lvl=FX.s.detail,k=DENS[lvl]||0;if(!k||typeof scene==='undefined'||!scene||typeof BND==='undefined')return;
 buildOcc();const t0=performance.now(),B=BND.slice(),mode=G.mode,L=mode==='EXPEDITION'?layout():null,fort=G.fort;
 const wx=(window.RGATM&&RGATM.predict)?RGATM.predict():'clear';
 const doom=wx==='doom',snow=wx==='snow',rain=wx==='rain';
 const area=(B[1]-B[0])*(B[3]-B[2]);
 const g=geos(),grp=new T.Group();grp.name='rg-detail';grp.raycast=function(){};
 /* palette: by fort type / town, then weather */
 let greens=mode==='EXPEDITION'?[0x4a7a32,0x5b8a3a,0x6f8f3e,0x86954a,0x7c8442]:fort==='school'?[0x3f7a2f,0x4f8a35,0x5d8f3a,0x73983f]:fort==='prison'?[0x7a7a3a,0x8a7f45,0x6d6a35,0x94854c]:[0x5f7a3a,0x6b7f40,0x58662f,0x7d8446];
 if(doom)greens=greens.map(c=>mix(c,0x5a5048,.62));else if(snow)greens=greens.map(c=>mix(c,0xdce6ee,.55));else if(rain)greens=greens.map(c=>mix(c,0x2f4a2a,.25));
 const dens=mode==='EXPEDITION'?.075:.30;
 const nG=Math.min(mode==='EXPEDITION'?13000:6000,Math.floor(area*dens*k*(doom?.55:1)));
 const pts=scatter(nG,B,L,1.1,[5,12],mode==='EXPEDITION'?3.2:2.4);
 const FLO=window.RGFLORA&&RGFLORA.on();
 if(FLO){   // Modern Modern clumps (meadow, grass, clover, lavender, iris, tulips...) instead of primitive blades + octahedron flowers
  const tint=doom?0x6e6660:snow?0xdfe8ee:rain?0xb4c8b4:(mode!=='EXPEDITION'&&fort==='prison')?0xe8d9a4:0xf4f6ee;
  const mixes=doom||snow?[['grass',.45],['grassT',.35],['meadow',.2]]:[['grass',.4],['grassT',.28],['clover',.1],['meadow',.12],['grass',.04],['lavender',.03],['iris',.02],['tulipP',.01]];
  const buckets={};for(const p of pts){let r=Math.random(),k=mixes[mixes.length-1][0];for(const [n,w] of mixes){if(r<w){k=n;break}r-=w}(buckets[k]=buckets[k]||[]).push(p)}
  for(const k in buckets){const im=inst(RGFLORA.clumpGeo(k,Math.floor(Math.random()*3)),RGFLORA.windMat(),buckets[k],()=>({s:R(.8,1.4),ry:R(0,PI*2),c:mix(tint,0xffffff,R(.15,.35))}),'modern-'+k);if(im){im.userData.rgDetail=1;grp.add(im)}}
  DET.stats.grass=pts.length;DET.stats.modern=true;
 }else{
 const gm=windMat();
 const grass=inst(g.tuft,gm,pts,()=>({s:R(.6,1.2),ry:R(0,PI*2),c:PK(greens)}),'grass');if(grass)grp.add(grass);
 DET.stats.grass=pts.length;
 if(!doom&&!snow){
  const fp=pts.filter((_,i)=>i%Math.max(2,Math.round(14/k))===0),cols=[0xf2eee0,0xe9c93a,0x9a6ad0,0xd44c3c,0xe58aa8,0xf0a04a];
  const fl=inst(g.head,new T.MeshLambertMaterial(),fp.map(p=>[p[0]+R(-.2,.2),p[1]+R(-.2,.2)]),()=>({y:R(.22,.4),s:R(.8,1.5),ry:R(0,PI),c:PK(cols)}),'flowers');
  if(fl){grp.add(fl);DET.stats.flowers=fp.length}
 }
 }
 /* pebbles / rubble clusters */
 const pp=scatter(Math.floor(area*(mode==='EXPEDITION'?.03:.11)*k),B,L,.8,[3,6],.9);
 const pg=[0x6e6a64,0x7d7770,0x5a5650,0x8a8478,0x66584a];
 const peb=inst(g.peb,new T.MeshLambertMaterial(),pp,()=>({y:.02,sx:R(.5,1.9),sy:R(.35,.9),sz:R(.5,1.7),ry:R(0,PI*2),rx:R(-.3,.3),c:doom?mix(PK(pg),0x2a2420,.5):PK(pg)}),'pebbles');
 if(peb){grp.add(peb);DET.stats.pebbles=pp.length}
 /* drifts: ash for Doom, snow for Snow */
 if(doom||snow){
  const dp=scatter(Math.floor(area*(doom?.045:.03)*k),B,L,1,[3,7],5);
  const dc=doom?[0x504a45,0x5a534c,0x3f3a36,0x625a52]:[0xcfd9e2,0xdde6ee,0xc2ced9];
  const dr=inst(g.drift,new T.MeshLambertMaterial(),dp,()=>{const r=R(.5,1.9);return{y:-.02,sx:r,sy:r*R(.08,.2),sz:r*R(.6,1.3),ry:R(0,PI*2),c:PK(dc)}},'drifts');
  if(dr){grp.add(dr);DET.stats.drifts=dp.length}
 }
 if(doom){   // smouldering volcanic bombs: dark rock, glowing seams (bloom picks these up)
  const rp=scatter(Math.floor(area*.0042*k),B,L,3,[2,4],7).filter(p=>{try{return Math.hypot(p[0]-FORT.x,p[1]-FORT.z)>(mode==='EXPEDITION'?0:19)}catch(e){return true}});
  const rm=new T.MeshStandardMaterial({color:0x201512,emissive:0xff4a12,emissiveIntensity:1.25,roughness:.9,flatShading:true});
  const rk=inst(g.rock,rm,rp,()=>{const s=R(.4,1.3);return{y:s*.12,sx:s,sy:s*R(.5,.8),sz:s*R(.8,1.1),ry:R(0,PI*2),rx:R(-.3,.3),rz:R(-.3,.3),c:0xffffff}},'lavarocks');
  if(rk){grp.add(rk);DET.stats.lavaRocks=rp.length}
 }
 scene.add(grp);DET.group=grp;DET.stats.ms=Math.round(performance.now()-t0);DET.stats.weather=wx;
 console.log('[detail] '+JSON.stringify(DET.stats));
};
/* after every world build (RGW.post runs at the end of perfOptimize) */
const op=W.post;W.post=function(){op.apply(this,arguments);try{DET.build()}catch(e){console.warn('[detail] build failed',e)}};
/* wind clock */
const wp=W.pre;W.pre=function(){wp.apply(this,arguments);TIME.value=performance.now()/1000%1000};
FX.onChange(k=>{if(k==='detail'||k==='*'){try{if(typeof G!=='undefined'&&G&&G.mode&&scene&&scene.children.length>20)DET.build()}catch(e){}}});
console.log('[detail] ground detail layer ready');
})();
