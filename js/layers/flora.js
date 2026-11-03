/* ==========================================================================================================
   MINI FORT ZOMBIE - FLORA LAYER (Modern "Modern" vegetation)
   Uses Modern's herbier atlas (js/modern/herbier.js) to replace every primitive tree / bush / tuft with textured leaf-card
   plants built the way Modern's PF.tree / PF.clump do: radial leaf cards on a swept trunk (oak, linden, maple, ginkgo,
   cherry, cedar), upright shrub fans (hydrangea, rose, azalea, lilac, peony...), crossed grass / meadow / lavender clumps,
   wall ivy and wisteria. Also adds Modern garden props (fountain, benches, flower beds, lamps, gazebo) to the parks.
   Gameplay is untouched: the original tree()/bush() still create their colliders and treeList entries; only the visuals in
   the group are swapped, so removing a tree group removes its new look too. Leaf cards are not raycastable.
   API for other layers: RGFLORA.batch(g) / .leaf(batch,kind,x,y,z,size) / .flush(), RGFLORA.clumpGeo(kind), RGFLORA.leafMat().
   Setting: Options > Graphics > Vegetation (RGFX.s.flora 0 classic / 1 Modern).
   ========================================================================================================== */
(function(){
'use strict';
const W=window.RGW,FX=window.RGFX,H=window.RGHERB;if(!W||!FX||!H){console.warn('[flora] needs world, graphics and herbier');return}
const T=THREE,PI=Math.PI,TAU=PI*2;
const FL=window.RGFLORA={stats:{},on:()=>FX.s.flora!==0};
const rng=s=>{let a=s|0;return Object.assign(()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},{})};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const RR=()=>Math.random();const R=(a,b)=>a+RR()*(b-a),PK=a=>a[Math.floor(RR()*a.length)];

/* ---------------------------------- materials ---------------------------------- */
let MAT=null,DEPTH=null,WMAT=null;const TIME={value:0},DESAT={value:0},DARK={value:1};
/* v076: weather tint for leaves, bushes, flowers and grass cards: snow desaturates, a sandstorm half-desaturates, Doom desaturates and darkens */
const WXT={snow:[.8,1],dust:[.5,1],doom:[.85,.55]};FL.wx={desat:DESAT,dark:DARK,tbl:WXT};
/* wind: per-vertex sway weight aW (0 at the stem/trunk, 1 at leaf tips) like Modern's foliage; phase from the instance position */
function windPatch(amp){return sh=>{sh.uniforms.uTime=TIME;sh.uniforms.uDesat=DESAT;sh.uniforms.uDark=DARK;
 sh.vertexShader='uniform float uTime;attribute float aW;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  {float ph=0.;
  #ifdef USE_INSTANCING
   ph=instanceMatrix[3].x*.37+instanceMatrix[3].z*.29;
  #endif
  float a=aW*${amp.toFixed(2)};
  float g=sin(uTime*1.25+ph)*.5+sin(uTime*2.3+ph*1.7+position.y*1.3)*.35+sin(uTime*4.1+position.x*2.1+position.z*1.7)*.15;
  transformed.x+=g*a*.17;transformed.z+=(cos(uTime*1.05+ph*1.2)*.5+g*.4)*a*.13;transformed.y-=abs(g)*a*.035;}`);
 sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
  #ifdef DOUBLE_SIDED
   normal = normal * faceDirection;
  #endif`);
 sh.fragmentShader='uniform float uDesat;uniform float uDark;\n'+sh.fragmentShader.replace('#include <tonemapping_fragment>',`gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(dot(gl_FragColor.rgb,vec3(.299,.587,.114))),uDesat)*uDark;
  #include <tonemapping_fragment>`)}}   // v065: leaf / grass cards keep their authored normal on back faces (no dark flip)
FL.leafMat=function(){
 if(MAT)return MAT;const a=H.atlas('B').map;
 MAT=new T.MeshLambertMaterial({map:a,alphaTest:.45,side:T.DoubleSide,vertexColors:true});MAT.onBeforeCompile=windPatch(1);MAT.customProgramCacheKey=()=>'flora-wind1-nf';
 DEPTH=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:a,alphaTest:.45});
 return MAT;
};
FL.depthMat=()=>{FL.leafMat();return DEPTH};
FL.windMat=function(){
 if(WMAT)return WMAT;FL.leafMat();WMAT=MAT.clone();WMAT.map=MAT.map;WMAT.onBeforeCompile=windPatch(1.7);WMAT.customProgramCacheKey=()=>'flora-wind2-nf';return WMAT;
};
const BARK=new T.MeshLambertMaterial({vertexColors:true});

/* ---------------------------------- geometry builder ---------------------------------- */
class GB{
 constructor(uv=true){this.p=[];this.n=[];this.u=[];this.c=[];this.i=[];this.w=[];this.uv=uv}
 quad(P,reg,col,nrm,ao,wt,rot){wt=wt||[0,1];
  const o=this.p.length/3,e=.004,u0=reg[0]+e,v0=reg[1]+e,u1=reg[0]+reg[2]-e,v1=reg[1]+reg[3]-e,U=rot?[[u0,v1],[u0,v0],[u1,v0],[u1,v1]]:[[u0,v1],[u1,v1],[u1,v0],[u0,v0]];   // rot: texture runs along the card (trunk -> tip)
  for(let k=0;k<4;k++){const q=P[k],nn=Array.isArray(nrm[0])?nrm[k]:nrm,a=k<2?ao[0]:ao[1];
   this.p.push(q[0],q[1],q[2]);this.n.push(nn[0],nn[1],nn[2]);this.u.push(U[k][0],U[k][1]);this.c.push(col[0]*a,col[1]*a,col[2]*a);this.w.push(k<2?wt[0]:wt[1])}
  this.i.push(o,o+1,o+2,o,o+2,o+3);
 }
 /* tapered tube along a polyline */
 tube(path,rad,col,seg=7){
  const n=path.length,rings=[];let prev=null;
  for(let i=0;i<n;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(n-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1],tz=b[2]-a[2];const tl=Math.hypot(tx,ty,tz)||1;tx/=tl;ty/=tl;tz/=tl;
   let sx=Math.abs(ty)>.9?1:0,sy=Math.abs(ty)>.9?0:1,sz=0;// helper axis
   let ux=ty*sz-tz*sy,uy=tz*sx-tx*sz,uz=tx*sy-ty*sx;const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;
   const vx=ty*uz-tz*uy,vy=tz*ux-tx*uz,vz=tx*uy-ty*ux;
   const r=rad(i/(n-1)),ring=[];
   for(let k=0;k<seg;k++){const t=k/seg*TAU,c=Math.cos(t),s=Math.sin(t),nx=ux*c+vx*s,ny=uy*c+vy*s,nz=uz*c+vz*s;ring.push([path[i][0]+nx*r,path[i][1]+ny*r,path[i][2]+nz*r,nx,ny,nz])}
   rings.push(ring)}
  for(let i=0;i<n;i++){const jt=.86+RR()*.14;for(const q of rings[i]){const o=this.p.length/3;this.p.push(q[0],q[1],q[2]);this.n.push(q[3],q[4],q[5]);this.c.push(col[0]*jt,col[1]*jt,col[2]*jt)}}
  for(let i=0;i<n-1;i++)for(let k=0;k<seg;k++){const base=this.p.length/3-n*seg+i*seg,a=base+k,b=base+(k+1)%seg,c=base+seg+k,d=base+seg+(k+1)%seg;this.i.push(a,b,c,b,d,c)}/* v074: counter-clockwise seen from outside (was inside-out) */
 }
 build(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));if(this.uv)g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));if(this.w.length===this.p.length/3)g.setAttribute('aW',new T.Float32BufferAttribute(this.w,1));g.setIndex(this.i);g.computeBoundingSphere();g.computeBoundingBox();return g}
}
const reg=n=>H.HERB[n];
FL.GB=GB;

/* ---------------------------------- trees (port of PF.tree) ---------------------------------- */
const TREE_KINDS={
 oak:[[.92,1,.86],[1,1,.92],[.82,.96,.78]],linden:[[1,1,.9],[.92,1,.8],[1,.98,.86]],maple:[[1,.92,.86],[1,.78,.7],[.95,.85,.8]],
 ginkgo:[[1,1,.9],[1,.94,.8]],cherry:[[1,1,1],[1,.95,.96]],cherryW:[[1,1,1]]
};
function leafBasis(n){let ax=n[0],ay=n[1],az=n[2];const hx=Math.abs(ay)<.9?0:1,hy=Math.abs(ay)<.9?1:0;let ux=ay*0-az*hy,uy=az*hx-ax*0,uz=ax*hy-ay*hx;const ul=Math.hypot(ux,uy,uz)||1;ux/=ul;uy/=ul;uz/=ul;
 let vx=ay*uz-az*uy,vy=az*ux-ax*uz,vz=ax*uy-ay*ux;const vl=Math.hypot(vx,vy,vz)||1;return[[ux,uy,uz],[vx/vl,vy/vl,vz/vl]]}
function treeGeo(kind,h,r,seed,shape){
 const Rn=rng(seed*977+13),RA=(a,b)=>a+Rn()*(b-a);
 const th=h*(shape==='spread'?.3:.38),ry=(h-th)*(shape==='spread'?.42:.5),rr=shape==='tall'?r*.72:shape==='spread'?r*1.2:r;
 const lean=RA(.1,.5),ld=Rn()*TAU,lx=Math.cos(ld)*lean,lz=Math.sin(ld)*lean,tr=.14+h*.017,cx=lx,cy=th+ry,cz=lz;
 const bark=new GB(false),leaf=new GB(true),bc=[.36,.27,.2];
 const path=[];for(let i=0;i<=8;i++){const t=i/8;path.push([lx*t*t+Math.sin(t*5+seed)*.06,t*th,lz*t*t+Math.cos(t*4+seed)*.06])}
 bark.tube(path,t=>tr*(1+1.1*Math.pow(1-t,7))*(1-.4*t),bc,8);
 const nb=4+Math.floor(Rn()*3);
 for(let i=0;i<nb;i++){const a=i/nb*TAU+Rn()*.7,d=rr*RA(.45,.8),y1=th+ry*RA(.55,1.15),y0=th*RA(.78,.98);
  bark.tube([[lx*.9,y0,lz*.9],[lx+Math.cos(a)*d*.5,(y0+y1)/2+.3,lz+Math.sin(a)*d*.5],[lx+Math.cos(a)*d,y1,lz+Math.sin(a)*d]],t=>tr*.42*(1-t*.75),bc,5)}
 const K=TREE_KINDS[kind]||TREE_KINDS.oak,rg=reg(kind),n=Math.round((70+rr*rr*8)*1.75);
 for(let i=0;i<n;i++){
  let dx,dy,dz,d;do{dx=RA(-1,1);dy=RA(-1,1);dz=RA(-1,1);d=Math.hypot(dx,dy,dz)}while(d>1||d<.2);
  dx/=d;dy/=d;dz/=d;if(shape==='spread')dy*=.6;if(dy<-.35)dy=-.35+(dy+.35)*.3;
  const f0=RA(.25,.65),sz=RA(1,1.4)*clamp(.3*rr+.7,1.2,2.2)*1.12*(kind==='cherry'||kind==='cherryW'?1.15:1);
  const bx=cx+dx*rr*f0,by=cy+dy*ry*f0,bz=cz+dz*rr*f0,ax=[dx*rr,dy*ry-.25*ry*Rn(),dz*rr],al=Math.hypot(...ax)||1,L=[ax[0]/al,ax[1]/al,ax[2]/al];
  const[u,v]=leafBasis(L),rot=Rn()*TAU,cs=Math.cos(rot),sn=Math.sin(rot),Wd=[u[0]*cs+v[0]*sn,u[1]*cs+v[1]*sn,u[2]*cs+v[2]*sn],hw=sz*.5;
  const P=(w,l)=>[bx+Wd[0]*w*hw+L[0]*l*sz,by+Wd[1]*w*hw+L[1]*l*sz,bz+Wd[2]*w*hw+L[2]*l*sz];
  const tipD=clamp(d*.4+f0+.3,.3,1),aoB=lerp(.28,.55,f0),aoT=lerp(.62,1,tipD),col=K[Math.floor(Rn()*K.length)];
  const nrm=q=>{let nx=(q[0]-cx)/rr,ny=(q[1]-cy)/ry+.35,nz=(q[2]-cz)/rr;const l=Math.hypot(nx,ny,nz)||1;return[nx/l,ny/l,nz/l]};
  const q=[P(-1,0),P(1,0),P(1,1),P(-1,1)];leaf.quad(q,rg,col,q.map(nrm),[aoB,aoT],[.12+.25*f0,.55+.45*tipD]);
 }
 return{leaf:leaf.build(),bark:bark.build()};
}
function cedarGeo(h,r,seed){
 const Rn=rng(seed*313+7),RA=(a,b)=>a+Rn()*(b-a),bark=new GB(false),leaf=new GB(true),rg=reg('cedar');
 bark.tube([[0,0,0],[0,h*.5,0],[0,h*.95,0]],t=>(.16+h*.012)*(1-t*.8),[.3,.22,.17],7);
 const tiers=9;   // v071: fuller crown now the boughs point outward
 for(let t=0;t<tiers;t++){const f=t/(tiers-1),y=h*(.18+.74*f),rad=r*(1.05-.8*f),cards=8;
  for(let k=0;k<cards;k++){const a=(k/cards+t*.13)*TAU+RA(-.2,.2),dx=Math.cos(a),dz=Math.sin(a),sx=-dz,sz=dx,wd=rad*1.25,len=rad,drop=rad*.5;
   const q=[[dx*.1-sx*wd/2,y+.1,dz*.1-sz*wd/2],[dx*.1+sx*wd/2,y+.1,dz*.1+sz*wd/2],[dx*len+sx*wd*.35,y-drop,dz*len+sz*wd*.35],[dx*len-sx*wd*.35,y-drop,dz*len-sz*wd*.35]];
   const nrm=[dx*.6,.8,dz*.6];leaf.quad(q,rg,[.78+RA(0,.2),.9+RA(0,.1),.78+RA(0,.15)],nrm,[.45+.4*f,1],[0,.28+.25*f],1)}}   // v071: the cedar painting has its boughs running across the image; map it along each card so boughs point out from the trunk instead of wrapping round it
 return{leaf:leaf.build(),bark:bark.build()};
}
/* ---------------------------------- shrubs / clumps ---------------------------------- */
const SHRUB_KINDS=['azalea','hosta','hydB','hydP','hydW','hydV','roseR','roseP','roseW','roseY','lilac','peony','dahlia','lavender','agapanthus','clover'];
function fanGeo(kinds,size,n,seed,spread,w2h){
 const Rn=rng(seed*131+5),RA=(a,b)=>a+Rn()*(b-a),leaf=new GB(true);
 for(let i=0;i<n;i++){const kind=kinds[Math.floor(Rn()*kinds.length)],rg=reg(kind),asp=rg[2]/rg[3],hh=size*RA(.8,1.2),ww=hh*asp*(w2h||1.1);
  const a=i/n*PI+RA(-.3,.3),cs=Math.cos(a),sn=Math.sin(a),ox=RA(-1,1)*spread,oz=RA(-1,1)*spread,tilt=RA(-.12,.12);
  const q=[[ox-cs*ww/2,0,oz-sn*ww/2],[ox+cs*ww/2,0,oz+sn*ww/2],[ox+cs*ww/2+tilt,hh,oz+sn*ww/2+tilt],[ox-cs*ww/2+tilt,hh,oz-sn*ww/2+tilt]];
  const t=RA(.88,1.08);leaf.quad(q,rg,[t,t,t],[0,1,0],[.5,1])}
 return leaf.build();
}
const GEO={};
FL.treeVariant=function(kind,i){const k=kind+'|'+i;if(GEO[k])return GEO[k];
 const s=1+i*7+(kind.length*13);
 if(kind==='cedar')return GEO[k]=cedarGeo(R(6.5,9.5),R(1.8,2.4),s);
 const shape=['round','spread','tall'][i%3],h=R(6.5,9),r=R(2.4,3.3);return GEO[k]=treeGeo(kind,h,r,s,shape)};
FL.shrubVariant=function(i){const k='shrub|'+i;if(GEO[k])return GEO[k];
 const kinds=i%3===0?['azalea','hosta','clover']:[SHRUB_KINDS[(i*5)%SHRUB_KINDS.length],'azalea'];return GEO[k]=fanGeo(kinds,R(.9,1.25),7,i+3,.28)};
FL.clumpGeo=function(kind,i=0){const k='clump|'+kind+i;if(GEO[k])return GEO[k];return GEO[k]=fanGeo([kind],kind==='meadow'?.8:.65,4,i+11,.12)};

/* ---------------------------------- dress a tree / bush group ---------------------------------- */
function strip(g){while(g.children.length){const c=g.children[0];g.remove(c)}}
function mk(geo,mat,g,cast){const m=new T.Mesh(geo,mat);m.castShadow=!!cast;m.receiveShadow=true;m.raycast=function(){};if(mat===MAT)m.customDepthMaterial=DEPTH;g.add(m);return m}
function pickKind(x,z,park){
 if(park)return PK(['oak','linden','maple','ginkgo','cherry','oak','linden']);
 const r=RR();return r<.26?'linden':r<.5?'maple':r<.7?'oak':r<.84?'cherry':r<.9?'cherryW':'ginkgo';   // conifers only outside the map border (borderTrees)
}
FL.dressTree=function(g,x,z,park){
 const kind=pickKind(x,z,park);strip(g);g.userData.flora=1;g.userData.inst=0;g.userData.spec={k:'tree',kind,v:Math.floor(RR()*6),s:R(.88,1.12),r:RR()*TAU};
};
FL.dressBush=function(g){strip(g);g.userData.flora=1;g.userData.inst=0;g.userData.spec={k:'bush',kind:'shrub',v:Math.floor(RR()*10),s:R(1,1.35),r:RR()*TAU}};
/* MFZ's perf pass deletes every tree/bush group and re-creates primitives, so our plants are recorded here (before it)
   and spawned as instanced meshes after it (FL.spawn, called from RGW.post). */
FL.placed=[];
FL.collect=function(){
 FL.placed=[];let n=0;
 for(const t of treeList){const g=t.g;if(!g||!g.userData||!g.userData.spec||g.parent!==scene)continue;FL.placed.push({x:g.position.x,z:g.position.z,sp:g.userData.spec,sc:g.scale.x||1});n++}
 FL.stats.treesBushes=n;
};
function barkMat(kind){const D=window.RGTEX;if(!W.mat||!D)return BARK;const i=D.names.indexOf(kind==='cherryW'||kind==='ginkgo'?(D.names.indexOf('barkw')>=0?'barkw':'bark'):'bark');if(i<0)return BARK;
 return W.mat(0,i+1,new T.Color(kind==='cherry'||kind==='cherryW'?0x7a6a62:kind==='cedar'?0x6a5444:0x8a7a68))}
FL.spawn=function(){
 if(!FL.placed.length)return;FL.leafMat();const by=new Map();
 for(const p of FL.placed){const k=p.sp.k+'|'+p.sp.kind+'|'+p.sp.v+(p.sp.dead?'|dead':'');let a=by.get(k);if(!a)by.set(k,a=[]);a.push(p)}
 const M=new T.Matrix4(),Q=new T.Quaternion(),S=new T.Vector3(),Pp=new T.Vector3(),UP=new T.Vector3(0,1,0);let n=0,draw=0;
 for(const[k,list]of by){const sp=list[0].sp,V=sp.k==='tree'?FL.treeVariant(sp.kind,sp.v):null;
  const mk2=(geo,mat,cast)=>{const im=new T.InstancedMesh(geo,mat,list.length);
   list.forEach((p,i)=>{Q.setFromAxisAngle(UP,p.sp.r);S.setScalar(p.sp.s*p.sc);Pp.set(p.x,0,p.z);M.compose(Pp,Q,S);im.setMatrixAt(i,M)});
   im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.castShadow=!!cast;im.receiveShadow=true;im.raycast=function(){};if(mat===MAT)im.customDepthMaterial=DEPTH;im.name='rg-flora-'+k;scene.add(im);draw++};
  if(V){mk2(V.bark,barkMat(sp.kind),true);if(!sp.dead)mk2(V.leaf,MAT,true)}/* v074: dead trees = bare trunk + branches */else mk2(FL.shrubVariant(sp.v),MAT,false);n+=list.length}
 FL.stats.spawned=n;FL.stats.drawCalls=draw;console.log('[flora] spawned '+n+' trees/bushes in '+draw+' instanced meshes');
};
/* wrap MFZ's own constructors (they keep colliders + treeList) */
(function(){
 const ot=window.tree,ob=window.bush;
 if(typeof ot==='function')window.tree=function(x,z){ot.apply(this,arguments);if(!FL.on())return;try{const t=treeList[treeList.length-1];if(t&&t.g)FL.dressTree(t.g,x,z,FL.inPark)}catch(e){if(!FL.err){FL.err=1;console.warn('[flora] tree',e)}}};
 if(typeof ob==='function')window.bush=function(x,z){ob.apply(this,arguments);if(!FL.on())return;try{const t=treeList[treeList.length-1];if(t&&t.g)FL.dressBush(t.g)}catch(e){if(!FL.err){FL.err=1;console.warn('[flora] bush',e)}}};
 const op=window.makePark;if(typeof op==='function')window.makePark=function(){FL.inPark=true;try{return op.apply(this,arguments)}finally{FL.inPark=false}};
})();

/* ---------------------------------- batched cards for other layers ---------------------------------- */
const BATCH=new Map();
FL.batch=g=>{let b=BATCH.get(g);if(!b){b={g,gb:new GB(true)};BATCH.set(g,b)}return b};
/* a small upright crossed-card plant (leaf/flower/ivy) at local x,y,z. kind = atlas name, size in metres */
FL.leaf=function(b,kind,x,y,z,size,tint,flat){
 const rg=reg(kind);if(!rg)return;const asp=rg[2]/rg[3],hh=size,ww=size*asp*1.1,t=tint||[1,1,1],gb=b.gb;
 for(let k=0;k<(flat?1:2);k++){const a=k*PI/2+(flat?0:RR()*.5),cs=Math.cos(a),sn=Math.sin(a);
  gb.quad([[x-cs*ww/2,y,z-sn*ww/2],[x+cs*ww/2,y,z+sn*ww/2],[x+cs*ww/2,y+hh,z+sn*ww/2],[x-cs*ww/2,y+hh,z-sn*ww/2]],rg,t,[0,1,0],[.6,1])}
};
FL.flush=function(){
 let n=0;FL.leafMat();for(const b of BATCH.values()){if(b.gb.i.length){mk(b.gb.build(),MAT,b.g,false);n++}}BATCH.clear();return n;
};

/* ---------------------------------- Modern garden props ---------------------------------- */
const cls=(m,c)=>{if(c)m.userData.rgc=c;return m};
const BXG={},bxg=(w,h,d)=>{const k=w+','+h+','+d;return BXG[k]||(BXG[k]=new T.BoxGeometry(w,h,d))};
const CYG={},cyg=(a,b,h,n=14)=>{const k=a+','+b+','+h+','+n;return CYG[k]||(CYG[k]=new T.CylinderGeometry(a,b,h,n))};
function P(g,geo,col,x,y,z,c,ry){const m=cls(mesh(geo,col,x,y,z,g),c);if(ry)m.rotation.y=ry;return m}
const PR=FL.props={
 bench(g,x,z,ry){const sx=1.0,wd=.5;for(let i=-1;i<=1;i++)P(g,bxg(2*sx,.05,.14),0x7a5a38,x,.46,z+i*.17,'wood',0);
  P(g,bxg(2*sx,.34,.05),0x7a5a38,x,.74,z-.28,'wood');for(const s of[-1,1]){P(g,bxg(.07,.46,.5),0x23302a,x+s*.9,.23,z,'steel');P(g,bxg(.07,.46,.05),0x23302a,x+s*.9,.7,z-.27,'steel')}
  if(ry!==undefined){/* rotate whole bench about its centre is skipped: callers place along axes */}},
 lamp(g,x,z){P(g,cyg(.05,.07,3.3,8),0x23302a,x,1.65,z,'steel');P(g,cyg(.14,.18,.25,8),0x23302a,x,.12,z,'steel');P(g,bxg(.3,.34,.3),0xfff0c8,x,3.45,z,0).material.emissive.setHex(0xffd890);P(g,cyg(.02,.24,.18,4),0x23302a,x,3.7,z,'steel')},
 fountain(g,x,z){P(g,cyg(1.9,2.0,.55,24),0xb8b4a8,x,.28,z,'stone');P(g,cyg(1.65,1.65,.04,24),0x5d93b8,x,.5,z,0);P(g,cyg(.3,.4,1.1,12),0xc2beb2,x,.8,z,'stone');
  P(g,cyg(.8,.3,.22,16),0xb8b4a8,x,1.4,z,'ashlar');P(g,cyg(.62,.62,.03,16),0x6aa4c8,x,1.52,z,0);P(g,cyg(.1,.14,.7,8),0xc2beb2,x,1.75,z,'ashlar');P(g,cyg(.3,.1,.14,12),0xb8b4a8,x,2.1,z,'ashlar')},
 birdbath(g,x,z){P(g,cyg(.14,.2,.8,10),0xc2beb2,x,.4,z,'stone');P(g,cyg(.42,.2,.14,14),0xb8b4a8,x,.86,z,'stone');P(g,cyg(.34,.34,.02,12),0x6aa4c8,x,.94,z,0)},
 bed(g,x,z,w,d,kinds){const e=.14,sc=0xa89c88;
  P(g,bxg(w,.28,e),sc,x,.14,z-d/2,'drystone');P(g,bxg(w,.28,e),sc,x,.14,z+d/2,'drystone');P(g,bxg(e,.28,d),sc,x-w/2,.14,z,'drystone');P(g,bxg(e,.28,d),sc,x+w/2,.14,z,'drystone');
  P(g,bxg(w-.1,.1,d-.1),0x4a3a2a,x,.1,z,'humus');
  const b=FL.batch(g),n=Math.round(w*d*1.6);for(let i=0;i<n;i++)FL.leaf(b,PK(kinds),x+R(-w/2+.2,w/2-.2),.18,z+R(-d/2+.2,d/2-.2),R(.45,.8))},
 gazebo(g,x,z){for(const sx of[-1,1])for(const sz of[-1,1])P(g,bxg(.14,2.6,.14),0xe9e5da,x+sx*1.7,1.3,z+sz*1.7,'plaster');
  P(g,bxg(3.9,.12,3.9),0xe9e5da,x,2.62,z,'plaster');const r=P(g,new T.ConeGeometry(3.0,1.4,4),0x6b3a2a,x,3.4,z,'rooftiles');r.rotation.y=PI/4;
  P(g,bxg(3.6,.1,3.6),0x8a7a5a,x,.05,z,'wood');for(const s of[-1,1])P(g,bxg(2.6,.05,.5),0x7a5a38,x,.45,z+s*1.3,'wood');
  const b=FL.batch(g);for(const sx of[-1,1])for(const sz of[-1,1])for(let i=0;i<3;i++)FL.leaf(b,'wisteria',x+sx*1.75+R(-.1,.1),R(.9,1.3),z+sz*1.75+R(-.1,.1),R(1.2,1.6))},
 planter(g,x,z){P(g,bxg(1.1,.5,.5),0xb4ac9c,x,.25,z,'stone');const b=FL.batch(g);for(let i=0;i<3;i++)FL.leaf(b,PK(['lavender','roseP','tulipR','dahlia']),x+R(-.4,.4),.45,z+R(-.12,.12),R(.5,.7))}
};

/* ---------------------------------- parks ---------------------------------- */
function boxesOf(g){const out=[];for(const c of g.children){if(!c.geometry)continue;if(!c.geometry.boundingBox)c.geometry.computeBoundingBox();const bb=c.geometry.boundingBox,s=c.scale;
  const hx=Math.max(Math.abs(bb.min.x),Math.abs(bb.max.x))*s.x,hz=Math.max(Math.abs(bb.min.z),Math.abs(bb.max.z))*s.z,hy=bb.max.y*s.y+c.position.y;if(hy<.2)continue;out.push([c.position.x-hx,c.position.x+hx,c.position.z-hz,c.position.z+hz])}return out}
function garden(g,w,d){
 const occ=boxesOf(g),b=FL.batch(g),free=(x,z,r)=>x>-w/2+1&&x<w/2-1&&z>-d/2+1&&z<d/2-1&&!occ.some(o=>x+r>o[0]&&x-r<o[1]&&z+r>o[2]&&z-r<o[3]);
 const put=(x,z,r,fn)=>{if(free(x,z,r)){fn();occ.push([x-r,x+r,z-r,z+r]);return true}return false};
 let np=0;
 put(0,10.5,2.1,()=>PR.fountain(g,0,10.5));np++;
 for(const[x,z]of[[-8.5,5],[8.5,5],[-9,-9],[9,-9],[-9,10],[9,10]])put(x,z,2.4,()=>PR.bed(g,x,z,3.4,2.4,PK([['tulipR','tulipP','iris'],['roseR','roseP','roseW','roseY'],['lavender','agapanthus','iris'],['dahlia','peony','hydP']])));
 for(const[x,z]of[[-2.8,9],[2.8,9],[-2.8,-9],[2.8,-9]])put(x,z,.9,()=>{PR.bench(g,x,z);});
 for(const[x,z]of[[-2.6,12.5],[2.6,12.5],[-2.6,-12.5],[2.6,-12.5],[-2.6,0],[2.6,0]])put(x,z,.3,()=>PR.lamp(g,x,z));
 put(-10.5,0.5,2.3,()=>PR.gazebo(g,-10.5,.5));
 for(const[x,z]of[[-6,13],[6,13],[11.5,-3],[-11.5,-3],[0,-13]])put(x,z,.8,()=>PR.planter(g,x,z));
 put(6.5,-5,.6,()=>PR.birdbath(g,6.5,-5));
 // shrubs + meadow + flowers wherever there is room
 let nc=0;for(let i=0;i<340;i++){const x=R(-w/2+1,w/2-1),z=R(-d/2+1,d/2-1);if(Math.abs(x)<2.2)continue;if(!free(x,z,.5))continue;
  const k=RR();FL.leaf(b,k<.5?PK(['grass','grass','grassT','grass']):k<.78?PK(['grassT','grass','clover','meadow']):k<.9?PK(['lavender','tulipR','iris','clover']):PK(['hydB','hydW','roseW','lilac','azalea']),x,.0,z,k<.78?R(.7,1.1):R(.5,.9));nc++}
 FL.stats.parkProps=(FL.stats.parkProps||0)+np;FL.stats.parkPlants=(FL.stats.parkPlants||0)+nc;
}
function parks(){
 if(typeof buildings==='undefined')return;
 for(const b of buildings){if(!(b.cat?b.cat==='playground_memorial_park':b.t==='park'))continue;   // the memorial park lot and makePark() only (not the corn maze)
  const g=scene.children.find(c=>c.isGroup&&!(c.userData&&c.userData.flora)&&Math.abs(c.position.x-b.x)<.05&&Math.abs(c.position.z-b.z)<.05&&c.children.length>8);if(!g||g.userData.gardened)continue;g.userData.gardened=1;
  garden(g,b.w||28,b.d||28)}
}
/* fort-mode / town border conifers: swap the cone stacks for Modern cedars */
function borderTrees(){
 let n=0;for(const g of scene.children.slice()){if(!g.isGroup||!g.userData||g.userData.flora||!g.userData.inst||g.children.length!==3)continue;
  const ts=g.children.map(c=>c.geometry&&c.geometry.type);if(ts[0]!=='CylinderGeometry'||ts[1]!=='ConeGeometry'||ts[2]!=='ConeGeometry')continue;
  FL.placed.push({x:g.position.x,z:g.position.z,sp:{k:'tree',kind:'cedar',v:Math.floor(RR()*6),s:R(.95,1.35),r:RR()*TAU},sc:g.scale.x||1});scene.remove(g);n++}
 FL.stats.borderCedars=n;
}
const od=W.decor;
W.decor=function(){od.apply(this,arguments);if(!FL.on())return;FL.stats={};try{FL.collect()}catch(e){console.warn('[flora] collect',e)}try{borderTrees()}catch(e){console.warn('[flora] border',e)}try{parks()}catch(e){console.warn('[flora] parks',e)}
 try{const n=FL.flush();FL.stats.batches=n}catch(e){console.warn('[flora] flush',e)}console.log('[flora] '+JSON.stringify(FL.stats))};
const opost=W.post;W.post=function(){opost.apply(this,arguments);if(FL.on()){try{FL.spawn()}catch(e){console.warn('[flora] spawn',e)}}};
const wp=W.pre;let wxT=performance.now();W.pre=function(){wp.apply(this,arguments);TIME.value=performance.now()/1000%1000;
 try{const now=performance.now(),dt=Math.min(1,(now-wxT)/1000);wxT=now;const n=window.RGATM&&(RGATM._force||RGATM.name),t=WXT[n]||[0,1],k=1-Math.exp(-dt/1.2);   /* eases with the weather change */
  DESAT.value+=(t[0]-DESAT.value)*k;DARK.value+=(t[1]-DARK.value)*k}catch(e){}};
FX.onChange(()=>{});
console.log('[flora] Modern vegetation layer ready');
})();
