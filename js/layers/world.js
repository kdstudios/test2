/* ==========================================================================================================
   MINI FORT ZOMBIE - WORLD LAYER (055)
   Modern-style textured world on top of MFZ's procedural town, without touching its generator.
   - 25 Modern CC0 PBR sets (albedo+cavity AO, normal+roughness) in two GPU texture arrays
   - ONE PBR material for the merged world: world-space triplanar sampling (the perf merge drops UVs),
     triplanar normal mapping, per-surface tile sizes, hue-keeping against MFZ's palette,
     macro colour variation, wall-base grime, rain streaks, image based reflections
   - every source mesh is classified (road, sidewalk, lawn, brick, plaster, siding, roof, metal, bark ...) when
     perfOptimize merges it; the class travels as a per-vertex attribute
   - trees / lamps (instanced) get bark and foliage; sun shadows follow the player
   ========================================================================================================== */
(function(){
'use strict';
if(!window.RGTEX||!window.PF){console.warn('[world055] prerequisites missing, layer disabled');return}
const T=THREE,V3=T.Vector3,D=window.RGTEX;
const W=window.RGW={on:!/[?&]notex/.test(location.search),shadows:!/[?&]noshadow/.test(location.search),ready:false,inWorld:false,stats:{},rdr:null,env:null};
const NAMES=D.names,CI={};NAMES.forEach((n,i)=>CI[n]=i+1);               // class id = layer + 1 (0 = untextured)
const U={tA:{value:null},tB:{value:null},uCls:{value:[]},uAvg:{value:[]},uTexOn:{value:0},uSun:{value:1}};
/* per surface: [normal strength, brightness multiplier] */
const EXTRA={asphalt:[1.0,1.15],pavers:[1.0,1.0],concrete:[.9,1],brick:[1.5,1],plaster:[.9,1],plaster2:[.7,1],paintwood:[1.1,1],wood:[1.1,1],boards:[1.1,1],rooftiles:[1.5,1],slate:[1.4,1],
 rollshutter:[1.3,1],steel:[.9,1],rust:[1,1],mecha:[1.1,1],lawn:[.8,1.15],humus:[1.0,1.12],dirt:[1.0,1.2],galets:[1.6,1],bark:[1.6,1.1],crate:[1,1],cobble:[1.7,1],timber:[1.3,1],ashlar:[1.4,1],flagstone:[1.5,1]};
W.U=U;for(let i=0;i<64;i++){const n=NAMES[i],ex=n?(EXTRA[n]||[1,1]):[1,1];U.uCls.value.push(new T.Vector4(n?D.scale[i]:1,n?D.hue[i]:0,ex[0],ex[1]));U.uAvg.value.push(n?new V3(...D.avg[i]):new V3(.5,.5,.5))}

/* ---------------- texture arrays ---------------- */
(async function load(){
 try{
  const S=D.size,N=D.n,dA=new Uint8Array(S*S*4*N),dB=new Uint8Array(S*S*4*N),cv=document.createElement('canvas');cv.width=cv.height=S;
  const cx=cv.getContext('2d',{willReadFrequently:true});
  const dec=b=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src='data:image/webp;base64,'+b});
  const t0=performance.now();
  for(let i=0;i<N;i++)for(const [s,d] of [[D.a[i],dA],[D.b[i],dB]]){const im=await dec(s);cx.clearRect(0,0,S,S);cx.drawImage(im,0,0,S,S);d.set(cx.getImageData(0,0,S,S).data,i*S*S*4)}
  const mk=d=>{const t=new T.DataArrayTexture(d,S,S,N);t.format=T.RGBAFormat;t.type=T.UnsignedByteType;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;return t};
  U.tA.value=mk(dA);U.tB.value=mk(dB);U.uTexOn.value=W.on?1:0;W.ready=true;W.stats.decodeMs=Math.round(performance.now()-t0);
  console.log('[world055] '+N+' PBR surface sets ready in '+W.stats.decodeMs+' ms');
 }catch(e){console.warn('[world055] texture load failed, world stays untextured',e)}
})();

/* ---------------- shader ---------------- */
const VERT_PARS=`attribute float aTc;varying vec3 vWP;varying vec3 vWN;varying float vTc;
#ifdef RG_OBJ
varying vec3 vOP;varying vec3 vON;varying vec3 vM0;varying vec3 vM1;varying vec3 vM2;
#endif`;
const VERT_BODY=`
 vec4 rgp=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
  rgp=instanceMatrix*rgp;
 #endif
 vWP=(modelMatrix*rgp).xyz;
 vec3 rgn=objectNormal;
 #ifdef USE_INSTANCING
  rgn=mat3(instanceMatrix)*rgn;
 #endif
 vWN=normalize(mat3(modelMatrix)*rgn);
 vTc=aTc;
 #ifdef RG_OBJ
  vOP=transformed;vON=normalize(objectNormal);vM0=normalize(modelMatrix[0].xyz);vM1=normalize(modelMatrix[1].xyz);vM2=normalize(modelMatrix[2].xyz);
 #endif`;
const FRAG_PARS=`
precision highp sampler2DArray;
uniform sampler2DArray tA;uniform sampler2DArray tB;uniform vec4 uCls[64];uniform vec3 uAvg[64];uniform float uTexOn;
varying vec3 vWP;varying vec3 vWN;varying float vTc;
#ifdef RG_OBJ
varying vec3 vOP;varying vec3 vON;varying vec3 vM0;varying vec3 vM1;varying vec3 vM2;
#endif
float rgh(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float rgn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rgh(i),rgh(i+vec2(1.,0.)),f.x),mix(rgh(i+vec2(0.,1.)),rgh(i+vec2(1.,1.)),f.x),f.y);}
float rgl(vec3 c){return dot(c,vec3(.299,.587,.114));}`;
const FRAG_MAP=`
 vec3 rgV=diffuseColor.rgb;
 #ifdef USE_COLOR
  rgV*=vColor;
 #endif
 float rgR=0.9;vec3 rgNw=vec3(0.);bool rgT=false;
 #ifdef RG_TC
  float rgTc=float(RG_TC);
 #else
  float rgTc=vTc;
 #endif
 int rgC=int(rgTc+.5)-1;
 if(rgC>=0&&uTexOn>.5){
  vec4 P=uCls[rgC];float inv=1./P.x,L=float(rgC);
  vec3 sP=vWP,sN=vWN;
  #ifdef RG_OBJ
   sP=vOP;sN=vON;   // moving props (doors): texture locked to the object, not the world
  #endif
  vec3 wn=normalize(sN);vec3 an=abs(wn);vec3 w=pow(an,vec3(6.));w/=(w.x+w.y+w.z);
  vec3 Tc=vec3(0.),tX=vec3(0.),tY=vec3(0.),tZ=vec3(0.);float rr=0.;
  if(w.x>.02){vec2 uv=sP.zy*inv;vec3 a=texture(tA,vec3(uv,L)).rgb,b=texture(tB,vec3(uv,L)).rgb;Tc+=a*w.x;rr+=b.z*w.x;vec2 t=(b.xy*2.-1.)*P.z;tX=vec3(t+wn.zy,sqrt(max(0.,1.-dot(t,t)))*wn.x);}
  if(w.y>.02){vec2 uv=sP.xz*inv;vec3 a=texture(tA,vec3(uv,L)).rgb,b=texture(tB,vec3(uv,L)).rgb;Tc+=a*w.y;rr+=b.z*w.y;vec2 t=(b.xy*2.-1.)*P.z;tY=vec3(t+wn.xz,sqrt(max(0.,1.-dot(t,t)))*wn.y);}
  if(w.z>.02){vec2 uv=sP.xy*inv;vec3 a=texture(tA,vec3(uv,L)).rgb,b=texture(tB,vec3(uv,L)).rgb;Tc+=a*w.z;rr+=b.z*w.z;vec2 t=(b.xy*2.-1.)*P.z;tZ=vec3(t+wn.xy,sqrt(max(0.,1.-dot(t,t)))*wn.z);}
  rgNw=normalize(tX.zyx*w.x+tY.xzy*w.y+tZ.xyz*w.z);
  #ifdef RG_OBJ
   rgNw=normalize(mat3(vM0,vM1,vM2)*rgNw);
  #endif
  vec3 avg=uAvg[rgC];
  vec3 detail=Tc/max(avg,vec3(.06));
  vec3 keep=Tc*(rgl(rgV)/max(rgl(avg),.05));
  vec3 alb=mix(rgV*detail,keep,P.y)*P.w;
  float mc=rgn2(vWP.xz*.045)*.5+rgn2(vWP.xz*.19+7.3)*.3+rgn2(vec2(vWP.x+vWP.z,vWP.y)*.23+3.1)*.2;
  alb*=.82+.36*mc;
  float vert=1.-an.y;
  alb*=mix(1.,mix(.55,1.,smoothstep(.0,1.8,vWP.y)),vert);
  float st=rgn2(vec2((vWP.x+vWP.z)*2.3,vWP.y*.07));
  alb*=1.-.16*vert*st*(1.-smoothstep(0.,7.,vWP.y));
  diffuseColor.rgb=alb;rgR=clamp(rr,.28,1.);rgNw=rgNw;rgT=true;
 }else{diffuseColor.rgb=rgV;}`;
const FRAG_ROUGH=`float roughnessFactor=rgT?rgR:roughness;
 #ifdef USE_ROUGHNESSMAP
  roughnessFactor*=texture2D(roughnessMap,vRoughnessMapUv).g;
 #endif`;
const FRAG_NORM=`#include <normal_fragment_maps>
 if(rgT){normal=normalize((viewMatrix*vec4(rgNw,0.)).xyz);
  #ifdef DOUBLE_SIDED
   normal*=faceDirection;
  #endif
 }`;
const cache=new Map();
function worldMat(side,cls,color,vc,rough,metal,obj){
 const key=side+'|'+cls+'|'+(cls?color.getHex():'v')+(vc?'|vc'+rough+'|'+metal:'')+(obj?'|o':'');let m=cache.get(key);if(m)return m;
 m=new T.MeshStandardMaterial({vertexColors:vc?true:!cls,side:side||0,roughness:vc&&rough!=null?rough:.9,metalness:vc&&metal?metal:0,envMapIntensity:.4});if(cls)m.color.copy(color);
 if(cls||obj){m.defines={};if(cls)m.defines.RG_TC=cls;if(obj)m.defines.RG_OBJ=1}
 m.onBeforeCompile=sh=>{
  Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+VERT_PARS).replace('#include <project_vertex>','#include <project_vertex>\n'+VERT_BODY);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+FRAG_PARS)
   .replace('#include <map_fragment>',FRAG_MAP).replace('#include <color_fragment>','').replace('#include <roughnessmap_fragment>',FRAG_ROUGH).replace('#include <normal_fragment_maps>',FRAG_NORM);
 };
 m.customProgramCacheKey=()=>'rgw'+(cls?'c':'v')+(obj?'o':'');
 if(W.env)m.envMap=W.env;
 cache.set(key,m);return m;
}
W.mat=worldMat;

/* ---------------- classifier ---------------- */
const _b=new T.Box3(),_s=new V3(),_c=new V3(),_q=new T.Quaternion(),_e=new T.Euler(),_p=new V3(),_k=new V3(),_hsv=[0,0,0];
function hsv(c){const r=c.r,g=c.g,b=c.b,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d>1e-4){h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360}_hsv[0]=h;_hsv[1]=mx?d/mx:0;_hsv[2]=mx;return _hsv}
const inH=(h,a,b)=>h>=a&&h<=b;
function classify(m){
 const mt=m.material;if(!mt||!mt.color||!m.matrixWorld)return 0;
 if(mt.transparent||mt.opacity<1||mt.isMeshBasicMaterial||(mt.emissive&&mt.emissive.getHex()>0))return 0;
 const g=m.geometry;if(!g||!g.attributes||!g.attributes.position)return 0;if(!g.boundingBox)g.computeBoundingBox();
 _b.copy(g.boundingBox).applyMatrix4(m.matrixWorld);_b.getSize(_s);_b.getCenter(_c);
 m.matrixWorld.decompose(_p,_q,_k);_e.setFromQuaternion(_q,'YXZ');
 const ax=Math.abs(_e.x)%(Math.PI/2),az=Math.abs(_e.z)%(Math.PI/2),eps=.06;
 const tilt=(ax>eps&&ax<Math.PI/2-eps)||(az>eps&&az<Math.PI/2-eps);
 const [h,s,v]=hsv(mt.color),t=g.type,sx=_s.x,sy=_s.y,sz=_s.z,hz=Math.max(sx,sz),mn=Math.min(sx,sy,sz),mx=Math.max(sx,sy,sz),cy=_c.y;
 const green=inH(h,68,175)&&s>.1,brown=inH(h,12,52)&&s>.28,redish=(h<=28||h>=340)&&s>.28&&s<.85&&v>.22&&v<.78;
 const planeH=(t==='PlaneGeometry'||t==='CircleGeometry'||sy<.06)&&hz>.8&&!tilt;
 if(planeH){
  if(hz>=400)return CI.humus;   // (base ground itself is re-skinned per weather below)
  if(green)return CI.lawn;
  if(v<.32&&s<.3)return cy<.3?CI.asphalt:CI.concrete;
  if(s<.14&&v<.5&&cy>.005&&cy<.026)return CI.asphalt;   // dark yard / parking / lot surfaces sit at y=.02 (interior floors at .03 stay paving)
  if(s<.2)return v<.66?CI.pavers:(cy<.3?CI.concrete:CI.pavers);
  if(brown||inH(h,28,70))return hz>18&&cy<.3?CI.dirt:CI.wood;
  return CI.cobble;
 }
 if(t==='ConeGeometry'||t==='IcosahedronGeometry'||t==='SphereGeometry'||t==='DodecahedronGeometry'||t==='OctahedronGeometry'){
  if(green)return CI.lawn;if(brown)return CI.bark;return s<.15&&mx>1?CI.concrete:0}
 if(t==='CylinderGeometry'){
  if(mx<.2)return 0;if(brown||(inH(h,10,60)&&v<.35))return CI.bark;if(s<.15)return v>.4?CI.steel:CI.concrete;return v>.3?CI.steel:0}
 if(tilt&&mx>.8)return (h<=40||h>=340)&&s>.25?CI.rooftiles:CI.slate;
 const vertThin=mn<.45&&sy>1&&(mn===sx||mn===sz)&&sy>mn*2;
 if(vertThin){
  if(redish)return CI.brick;
  if(s<.14)return v<.16?0:CI.concrete;
  if(v>.72&&s<.35)return CI.plaster2;
  if(s<.4&&v>.5)return CI.plaster;
  if(s>=.25)return CI.paintwood;
  return CI.plaster;
 }
 if(mn<.7&&hz>1.5&&sy<.7){   // slabs: roofs, floors, ledges, thick trim
  if(cy>2.4&&hz>3)return v<.4?CI.slate:CI.concrete;
  if(s<.15)return v>.3?CI.steel:CI.concrete;
  if(brown)return CI.wood;
  return CI.concrete;
 }
 if(mx<.28)return 0;
 if(brown)return v>.36?CI.wood:CI.boards;
 if(inH(h,6,30)&&s>.5&&v>.25)return CI.rust;
 if(green&&sy>=2.2&&mn>=.5)return CI.lawn;   // tall green walls (corn maze, hedges) read as foliage, not machine panels
 if(green&&v<.5&&mx>.6)return CI.mecha;
 if(s<.12&&v>.28&&mx>.5)return v>.6?CI.rollshutter:CI.steel;
 if(s<.12&&v>.16)return CI.concrete;
 return 0;
}
W.classify=classify;

/* ---------------- hooks called from the (build-time patched) perf039 merge ---------------- */
W.tag=function(m){   // buildMerged: class of this source mesh, stored per vertex
 if(!W.inWorld||!W.on||!m||!m.material)return 0;
 if(isVeh(m))return 0;   // v056: cars keep their paint (a brown body used to classify as wood)
 const mt=m.material;if(mt.transparent||mt.isMeshBasicMaterial||(mt.emissive&&mt.emissive.getHex()>0)||!m.userData)return 0;
 m.userData.rgw=1;const c=(m.userData.rgc!==undefined)?(CI[m.userData.rgc]||0):classify(m);if(c){W.stats[NAMES[c-1]]=(W.stats[NAMES[c-1]]||0)+1}return c;
};
function isVeh(m){for(let o=m,i=0;o&&i<4;o=o.parent,i++)if(o.userData&&(o.userData.veh||o.userData.kind==='car'))return true;return false}
W.isVeh=isVeh;
W.mergedMat=function(m){return(W.on&&m&&m.userData&&m.userData.rgw)?worldMat(m.material.side,0):null};
W.instMat=function(m){if(!W.on||!W.inWorld||isVeh(m))return null;const c=classify(m);return c?worldMat(m.material.side,c,m.material.color):null};
W.begin=function(){W.stats={};W.inWorld=true;setTimeout(()=>{W.inWorld=false},0);try{if(W.decor)W.decor()}catch(e){console.warn('[world055] decor',e)}};
W.end=function(){W.inWorld=false;try{W.post()}catch(e){console.warn('[world055] post',e)}};
W.post=function(){
 let n=0;scene.traverse(o=>{if(o.isMesh&&o.userData&&(o.userData.pfm==='merged'||o.userData.inst)){o.castShadow=W.shadows;o.receiveShadow=W.shadows;n++}});
 W.stats.shadowMeshes=n;
 // the 500 m base ground is never merged: give it the humus surface with a lighter earthy base so the texture can read
 for(const o of scene.children){if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters&&o.geometry.parameters.width>=400&&o.material&&o.material.color){
  const wx=(window.RGATM&&RGATM.predict)?RGATM.predict():'clear',gn=wx==='doom'?'ash':wx==='snow'?'snow':wx==='dust'?'sand':'humus',gcol=wx==='doom'?0x4a4540:wx==='snow'?0xdfe6ee:wx==='dust'?0xb8a078:0x5a4842+0x001010;   // ground follows the weather: volcanic ash / snow / sand
  o.material=worldMat(0,CI[gn]||CI.humus,new T.Color(gn==='humus'?0x5a5842:gcol));o.receiveShadow=W.shadows;W.stats.ground=1}}// roads / ground planes that perf left unmerged (e.g. the perimeter + main roads) were skipped by the merge classifier: texture them here
 let nu=0;for(const o of scene.children){if(!o.isMesh||o.isInstancedMesh||o.userData.pfm!==1||o.userData.rgw||!o.material||!o.material.color||o.material.map||o.material.transparent||(o.material.defines&&o.material.defines.RG_TC))continue;
  if(o.geometry&&o.geometry.parameters&&o.geometry.parameters.width>=400)continue;   // the base ground plane is handled above
  const c=isVeh(o)?0:classify(o);if(c){o.material=worldMat(o.material.side,c,o.material.color);if(o.position.y>.005&&o.position.y<.05){o.material.polygonOffset=true;o.material.polygonOffsetFactor=-2;o.material.polygonOffsetUnits=-4}o.receiveShadow=W.shadows;nu++}}for(const o of scene.children){if(o.isMesh&&!o.isInstancedMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.position.y<.05&&o.material&&o.material.color&&[0xd9b82a,0x14161a].includes(o.material.color.getHex())&&!o.material.map){o.material.polygonOffset=true;o.material.polygonOffsetFactor=-6;o.material.polygonOffsetUnits=-12}}   // lane dashes + cracks stay on top of the textured road
 W.stats.unmergedTextured=nu;
 try{W.dynSurfaces()}catch(e){console.warn('[world055] doors/containers',e)}
 console.log('[world055] surface classes: '+JSON.stringify(W.stats));
};

/* ---------------- v056: doors + loot containers (dynamic, so never merged / classified) ---------------- */
// container type (core LOOT_PROP) -> surface per piece, picked by the piece's colour: [textured surface for the body, for dark/grey trim]
const CONT_SURF={crate:['crate','wood'],ammo_crate:['paintwood','steel'],cabinet:['mechadark','steel'],pump_shelf:['mechadark','rust'],counter:['wood','wood'],toolchest:['mechadark','steel'],
 fridge:['mechadark','steel'],cart:['steel','steel'],pew:['wood','wood'],grave:['stone','stone'],bench:['wood','steel']};
function doorClass(c){const [h,s,v]=hsv(c);if(s<.14)return v>.55?CI.paintwood:CI.steel;if(inH(h,10,55)&&v<.6)return CI.wood;return CI.paintwood}
W.doorMat=function(c){return worldMat(0,doorClass(c),c,false,null,null,true)};
W.dynSurfaces=function(){
 if(!W.on)return;let nd=0,nc=0;
 if(typeof doors!=='undefined')for(const d of doors){const pv=d.p;if(!pv)continue;const dr=pv.children.find(c=>c.isMesh&&c.userData&&c.userData.kind==='door');if(!dr||dr.userData.rgdoor)continue;
  const g=dr.geometry,col=g.attributes.color,tc=g.attributes.aTc,mt=dr.material;
  if(col&&tc&&mt&&mt.vertexColors){   // perf merged the handle into the panel: panel vertices get the wood/paint class, the brass handle keeps its colour
   const c0=new T.Color(col.getX(0),col.getY(0),col.getZ(0)),cls=doorClass(c0);
   for(let i=0;i<tc.count;i++){const same=Math.abs(col.getX(i)-c0.r)+Math.abs(col.getY(i)-c0.g)+Math.abs(col.getZ(i)-c0.b)<.02;tc.setX(i,same?cls:0)}tc.needsUpdate=true;
   dr.material=worldMat(mt.side||0,0,null,true,.8,0,true)}
  else if(mt&&mt.color&&!mt.map&&!mt.transparent)dr.material=worldMat(mt.side||0,doorClass(mt.color),mt.color,false,null,null,true);
  else continue;
  dr.userData.rgdoor=1;dr.castShadow=W.shadows;dr.receiveShadow=W.shadows;nd++}
 scene.traverse(o=>{if(!o.isGroup||!o.userData||o.userData.kind!=='loot'||!o.userData.cont||o.userData.rgcont)return;o.userData.rgcont=1;W.texContainer(o.userData.cont);nc++});
 W.stats.doors=nd;W.stats.containers=nc;
};
W.texContainer=function(cont){
 if(!W.on||!cont||!cont.pieces)return;const kind=cont.drop?'crate':((window.LOOT_PROP||{})[cont.table]||(typeof LOOT_PROP!=='undefined'?LOOT_PROP[cont.table]:null)||'crate'),S=CONT_SURF[kind]||CONT_SURF.crate;
 for(const m of cont.pieces){const mt=m.material;if(!m.isMesh||!mt||!mt.color||mt.map||mt.transparent||mt.isMeshBasicMaterial)continue;
  const [h,s,v]=hsv(mt.color),trim=s<.12&&v<.45,mn=Math.min(...(m.geometry.parameters?[m.geometry.parameters.width||1,m.geometry.parameters.height||1,m.geometry.parameters.depth||1]:[1]));
  if(mn<.06&&s>.5)continue;   // small bright labels / stripes keep their flat paint
  const nm=trim?S[1]:S[0],c=nm==='crate'?new T.Color(0xb08a5a):mt.color;
  m.material=worldMat(mt.side||0,CI[nm]||CI.wood,c,false,null,null,false);m.castShadow=W.shadows;m.receiveShadow=W.shadows}
};

/* ---------------- per-frame: shadows, reflections, light ---------------- */
const SUN=new V3();
W.pre=function(){   // runs right before the main scene is drawn (after MFZ's own day/night update)
 if(!dirL||!pl)return;
 if(W.shadows){
  if(typeof G.time==='number'&&isFinite(G.time))SUN.set(Math.cos((G.time-6)/24*Math.PI*2)*80,Math.abs(Math.sin((G.time-6)/24*Math.PI*2))*80+10,20);else SUN.set(40,80,30);
  const tx=Math.round(pl.position.x/2)*2,tz=Math.round(pl.position.z/2)*2;     // snapped: no shimmering while walking
  dirL.target.position.set(tx,0,tz);dirL.position.set(tx,0,tz).add(SUN);dirL.target.updateMatrixWorld();
 }
 const d=Math.max(0,Math.min(1,(ambL.intensity-.18)/.5)),ei=.05+.2*d;
 cache.forEach(m=>{if(m.envMapIntensity!==ei)m.envMapIntensity=ei;if(W.env&&m.envMap!==W.env){m.envMap=W.env;m.needsUpdate=true}});
};
function frame(){
 if(typeof renderer==='undefined'||!renderer||!scene||!dirL)return;
 if(W.rdr===renderer)return;
 W.rdr=renderer;renderer.shadowMap.enabled=W.shadows;renderer.shadowMap.type=T.PCFSoftShadowMap;
 if(window.RGUN_makeEnv)W.env=window.RGUN_makeEnv(renderer);
 cache.forEach(m=>{m.envMap=W.env;m.needsUpdate=true});
 if(W.shadows){dirL.castShadow=true;const sh=dirL.shadow;sh.mapSize.set(2048,2048);const c=sh.camera;c.left=-46;c.right=46;c.top=46;c.bottom=-46;c.near=1;c.far=260;sh.bias=-.0004;sh.normalBias=.06;sh.radius=2.2;c.updateProjectionMatrix();if(!dirL.target.parent)scene.add(dirL.target)}
 if(!renderer.__rgw){renderer.__rgw=1;const o=renderer.render;renderer.render=function(s,c){if(s===scene&&c===camera){try{W.pre()}catch(e){if(!W.err){W.err=1;console.warn('[world055] pre',e)}}}return o.call(this,s,c)}}
}
(function loop(){try{frame()}catch(e){if(!W.err){W.err=1;console.warn('[world055] frame',e)}}requestAnimationFrame(loop)})();
console.log('[world055] world layer installed');
})();
