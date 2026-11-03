/* ==========================================================================================================
   MINI FORT ZOMBIE - MODERN PROP LAYER
   Turns Modern's procedural prop prefabs (js/modern/propkit.js, window.RGPK) into MFZ meshes.
     - stamp sessions: a Modern Maker writes into per-material GeoBufs which are merged into one BufferGeometry per material
     - materials: textured Modern surfaces (wood, steel, concrete ...) use the world triplanar material with the vertex tint kept,
       everything else (paint, plastic, rubber, glass ...) is a plain vertex-coloured PBR material
     - vehicles: MFZ's cars and the army truck keep their original colliders / userData but get Modern bodies
   ========================================================================================================== */
(function(){
'use strict';
const K=window.RGPK,W=window.RGW;if(!K||!W){console.warn('[props] kit missing');return}
const T=THREE,PF=K.PF,Maker=K.Maker,GeoBuf=K.GeoBuf;
const CI={};(window.RGTEX?RGTEX.names:[]).forEach((n,i)=>CI[n]=i+1);
/* Modern material -> [texture class or null, roughness, metalness, flags] */
const TEXMAP={wood:'wood',paintwood:'paintwood',boards:'boards',steel:'steel',rust:'rust',concrete:'concrete',plaster:'plaster',crate:'crate',burlap:'burlap',canvas:'canvas',
 cardboard:'cardboard',stone:'stone',ashlar:'ashlar',slate:'slate',rooftiles:'rooftiles',bark:'bark',palmbark:'palmbark',rock:'rock',sand:'sand',dirt:'dirt',drystone:'drystone',
 flagstone:'flagstone',cyflag:'flagstone',rollshutter:'rollshutter',shutter:'shutter',corrugated:'steel',rug:'laine',mulch:'humus',ground:'humus',charred:'mechadark',rubble:'concrete',
 gravel:'pathgravel',gravelpath:'pathgravel',tiles:'pavers',gres:'pavers',pave:'pavers',parpaing:'concrete',snowmat:'snow',adobe:'adobe',strata:'strata',haussmann:'plaster',
 haussrdc:'plaster',farfacade:'plaster',logend:'wood',lattice:'wood',table:'wood',chair:'wood'};
const PBR={paint:[.5,.1],carpaint:[.3,.35],plastic:[.5,0],rubber:[.95,0],dark:[.8,.1],cabin:[.6,.1],hull:[.5,.1],lamp:[.4,.2],jar:[.2,0],pot:[.8,0],rope:[1,0],net:[1,0],fruit:[.7,0],fish:[.5,0]};
const GLASS=new Set(['glass','window','jar','carglass','carglassD']),EMIS=new Set(['bulb','lamp','lampCool']);
/* base albedo for surfaces that have no texture here (Modern supplies it from its photo textures) */
const BASE={rubber:.075,dark:.06,plastic:.55,paint:.78,carpaint:.85,cabin:.8,hull:.8,lampOff:.9,steel:.46,rust:.4,wood:.52,paintwood:.62,canvas:.58,crate:.5,burlap:.55,concrete:.66,corrugated:.5,charred:.15,ground:.4,rope:.5,net:.5,pot:.55,fruit:1,fish:.8,lattice:.5,boards:.5,plaster:.75,ashlar:.7,stone:.65,slate:.4,rooftiles:.6,rubble:.65,sand:.8,dirt:.5};
const inv=1/2.2;
function toGeo(g,srgb,k){
 const n=g.nv,ge=new T.BufferGeometry();
 ge.setAttribute('position',new T.BufferAttribute(g.P.slice(0,n*3),3));ge.setAttribute('normal',new T.BufferAttribute(g.N.slice(0,n*3),3));ge.setAttribute('uv',new T.BufferAttribute(g.U.slice(0,n*2),2));
 const c=g.C.slice(0,n*3);if(k&&k!==1)for(let i=0;i<c.length;i++)c[i]*=k;if(srgb)for(let i=0;i<c.length;i++)c[i]=Math.pow(Math.min(1,Math.max(0,c[i])),inv);
 ge.setAttribute('color',new T.BufferAttribute(c,3));ge.setIndex(new T.BufferAttribute(g.I.slice(0,g.ni),1));ge.computeBoundingSphere();ge.computeBoundingBox();return ge;
}
const mcache=new Map();
function matFor(name,flat){
 const k=name+(flat?'|f':'');let m=mcache.get(k);if(m)return m;
 if(GLASS.has(name)){m=new T.MeshStandardMaterial({vertexColors:true,color:0x9fb8c4,roughness:.08,metalness:.3,transparent:true,opacity:.42,depthWrite:false,envMapIntensity:1})}
 else if(EMIS.has(name)){m=new T.MeshBasicMaterial({vertexColors:true})}
 else{
  const p=PBR[name]||[.6,0],tn=!flat&&TEXMAP[name],cls=tn&&CI[tn];
  m=cls?W.mat(0,cls,new T.Color(0xffffff),true,null,name==='steel'||name==='rust'?.45:0):W.mat(0,0,new T.Color(0xffffff),true,p[0],p[1]);
 }
 mcache.set(k,m);return m;
}
/* ---- stamp session ---- */
function session(){
 const bufs=new Map(),cols=[];
 const tgt={buf(mat){let b=bufs.get(mat);if(!b)bufs.set(mat,b=new GeoBuf(1024,2048,false));return b},col(b,m,ray,occ){cols.push({b:b,m:m,ray:!!ray})},occ(){},pcol(){},dynAdd(){return null},lamp(){},fabric(){}};
 const M=new Maker(tgt);
 return{M:M,cols:cols,bufs:bufs,
  build(o){o=o||{};const g=new T.Group();
   for(const [name,b] of bufs){if(!b.nv)continue;const tx=!o.flat&&TEXMAP[name]&&CI[TEXMAP[name]],bk=GLASS.has(name)||EMIS.has(name)||tx?1:(BASE[name]!=null?Math.pow(BASE[name],2.2):1);const mesh=new T.Mesh(toGeo(b,true,bk),matFor(name,o.flat));mesh.userData.rgProp=name;mesh.userData.kind='rgprop';
    if(GLASS.has(name)){mesh.renderOrder=2}else{mesh.castShadow=o.shadow!==false;mesh.receiveShadow=true}
    if(o.cull===false)mesh.frustumCulled=false;g.add(mesh)}
   return g}};
}
/* ---- vehicles ---- */
const CAR_COLS=[[.55,.1,.1],[.1,.2,.5],[.22,.22,.24],[.16,.36,.18],[.42,.35,.22],[.62,.62,.6],[.72,.7,.55],[.3,.3,.45]];
const tmpl=new Map();
function vehicleGroup(key,build){
 let t=tmpl.get(key);if(!t){const s=session();build(s);t=s.build({flat:true,cull:false});tmpl.set(key,t)}
 const g=new T.Group();for(const m of t.children){const c=new T.Mesh(m.geometry,m.material);c.userData.kind='rgprop';c.castShadow=m.castShadow;c.receiveShadow=m.receiveShadow;c.renderOrder=m.renderOrder;c.frustumCulled=false;g.add(c)}return g;
}
function riCar(){
 const models=['sedan','hatch','suv','mpv','cross','offroad'],mi=Math.floor(Math.random()*models.length),ci=Math.floor(Math.random()*CAR_COLS.length),model=models[mi];
 const dust=Math.random()<.5;
 return vehicleGroup('car|'+model+'|'+ci+'|'+(dust?1:0),s=>{const pf=PF.car(model,{dust:dust,wreck:Math.random()<.0});s.M.put(pf,{tint:CAR_COLS[ci],nocol:true})});
}
function riTruck(){
 return vehicleGroup('truck|army',s=>{const pf=PF.truck('army',{});s.M.save().move(0,0,.45).rotY(Math.PI).scl(1.12);s.M.put(pf,{tint:[.33,.38,.22],nocol:true});s.M.restore()});
}
function swap(g,repl){
 const old=g.children.slice();for(const c of old){g.remove(c);if(c.geometry)c.geometry.dispose&&0}
 for(const c of repl.children.slice())g.add(c);
}
const N={cars:0,trucks:0,props:0};
const oMC=window.makeCar,oMT=window.makeArmyTruck;
if(typeof oMC==='function')window.makeCar=makeCar=function(x,z,rot){const g=oMC(x,z,rot);try{if(window.RGFX&&RGFX.s.props===0)return g;swap(g,riCar());N.cars++}catch(e){console.warn('[props] car',e)}return g};
if(typeof oMT==='function')window.makeArmyTruck=makeArmyTruck=function(x,z){const g=oMT(x,z);try{if(window.RGFX&&RGFX.s.props===0)return g;swap(g,riTruck());N.trucks++}catch(e){console.warn('[props] truck',e)}return g};

/* ======================= ambient props (replace decor.js primitives) ======================= */
const PI=Math.PI,R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),PKA=a=>a[Math.floor(Math.random()*a.length)];
const on=()=>!window.RGFX||RGFX.s.props!==0;
/* small props Modern does not ship */
const mkHydrant=()=>K.prefab('mfzHydrant',(M)=>{M.local(1);M.color([.72,.14,.1]);M.lathe('paint',[[0,0],[.13,0],[.13,.05],[.09,.08],[.09,.5],[.12,.54],[.12,.58],[.08,.64],[0,.68]],12);
 for(const sd of[-1,1]){M.save().move(sd*.1,.38,0).rotZ(PI/2);M.cyl('paint',.045,.1,8);M.restore()}M.color([.5,.5,.5]);M.save().move(0,.7,0);M.cyl('steel',.03,.04,6);M.restore()});
const mkCone=()=>K.prefab('mfzCone',(M)=>{M.local(1);M.color([.12,.12,.12]);M.boxB('rubber',-.19,.19,0,.035,-.19,.19,{bevel:.01});M.color([.95,.38,.08]);M.lathe('plastic',[[.15,.03],[.1,.35],[.05,.62],[.025,.66],[0,.66]],12);M.color([.95,.95,.95]);M.lathe('plastic',[[.108,.3],[.082,.4],[.088,.4],[.113,.3]],12)});
const mkBin=()=>K.prefab('mfzBin',(M)=>{M.local(1);M.color([.17,.23,.2]);M.lathe('steel',[[0,0],[.22,0],[.25,.05],[.26,.8],[.28,.82],[.28,.86],[0,.86]],14);M.color([.1,.13,.11]);M.lathe('plastic',[[.29,.86],[.25,.93],[.06,.96],[0,.96]],14)});
/* ---- v076: find real surfaces on a building group (local coords; groups only turn about y) ---- */
const RC=new T.Raycaster(),RV=new T.Vector3(),RD=new T.Vector3(),RN=new T.Vector3();
function meshesOf(g){const a=[];g.traverse(m=>{if(m.isMesh&&m.visible&&m.geometry&&!(m.material&&(m.material.transparent||m.material.visible===false))&&!(m.userData&&(m.userData.kind==='door'||m.userData.kind==='glass')))a.push(m)});return a}
function castL(g,ms,o,d,far){RV.copy(o);g.localToWorld(RV);RD.copy(d).transformDirection(g.matrixWorld);RC.set(RV,RD);RC.far=far;const h=RC.intersectObjects(ms,false)[0];if(!h)return null;
 const n=h.face?RN.copy(h.face.normal).transformDirection(h.object.matrixWorld):null;return{p:g.worldToLocal(h.point.clone()),n,d:h.distance}}
const DOWN=new T.Vector3(0,-1,0);
/* a flat roof under all four corners of a ~1.2 m unit, within 1.5 m of the nominal roof height -> its local height, else null */
function roofAt(g,ms,x,z,bh){let y0=null;for(const [ox,oz] of[[0,0],[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]]){const h=castL(g,ms,RV.set(x+ox,bh+8,z+oz).clone(),DOWN,14);
  if(!h||!h.n||h.n.y<.9||h.p.y<bh-1.5)return null;if(y0===null)y0=h.p.y;else if(Math.abs(h.p.y-y0)>.12)return null}return y0}
/* an outward-facing wall on side sx covering the unit (y .. y+.7, z +-.45) -> its local x, else null */
function wallAt(g,ms,sx,y,z,bw){let x0=null;const dir=new T.Vector3(-sx,0,0);for(const [oy,oz] of[[.05,0],[.65,-.45],[.65,.45],[.05,-.45],[.05,.45]]){const h=castL(g,ms,new T.Vector3(sx*(bw/2+4),y+oy,z+oz),dir,bw/2+4);
  if(!h||!h.n||h.n.dot(RD)>-.85)return null;if(x0===null)x0=h.p.x;else if(Math.abs(h.p.x-x0)>.1)return null}return x0}
/* one batch = one session; meshes appended to the scene (not merged by perf: kind='rgprop') */
function batch(shadow){const s=session();s.n=0;s.put=function(pf,x,y,z,ry,o){o=o||{};s.M.save().move(x,y||0,z).rotY(ry||0);if(o.rx)s.M.rotX(o.rx);if(o.rz)s.M.rotZ(o.rz);if(o.s)s.M.scl(o.s);s.M.put(pf,{tint:o.tint,nocol:true});s.M.restore();s.n++;N.props++};
 s.flush=function(parent,sh){if(!s.n)return null;const g=s.build({shadow:sh!==false&&shadow!==false,cull:true});g.userData.kind='rgprop';(parent||scene).add(g);return g};return s}
const PFS=n=>PF[n]?PF[n]():null;
const solidBox=(x,y0,y1,z,hx,hz)=>{try{solids.push(new T.Box3(new T.Vector3(x-hx,y0,z-hz),new T.Vector3(x+hx,y1,z+hz)))}catch(e){}};
// v071: collision for a jersey barrier (prefab length along local z) at any angle: a row of small boxes following the barrier
const jerseySolid=(x,z,ry,len)=>{const dx=Math.sin(ry),dz=Math.cos(ry),n=Math.ceil(len/.5);for(let i=0;i<n;i++){const t=-len/2+(i+.5)*len/n;solidBox(x+dx*t,0,.85,z+dz*t,.34,.34)}};
const inB=(x,z,p)=>{try{return inBuilding(x,z,p)}catch(e){return false}};
const plotAt=(L,x,z)=>L.plots.find(p=>x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1);
const roadAt=(L,x,z,pad)=>L.roads.some(r=>x>r.x0-pad&&x<r.x1+pad&&z>r.z0-pad&&z<r.z1+pad)||L.alleys.some(r=>x>r.x0-pad&&x<r.x1+pad&&z>r.z0-pad&&z<r.z1+pad);
const DEBRIS=[['trashBag',.2],['cardboard',.14],['tire',.08],['barrel',.1],['pallet',.08],['brickPile',.07],['chunk',.07],['rubble',.04],['litter',.1],['jerrycan',.05],['crate',.04],['bottle',.06],['stone',.04],['sandbag',.03]];
const DEBTOT=DEBRIS.reduce((a,b)=>a+b[1],0);
function pickDebris(){let r=Math.random()*DEBTOT;for(const d of DEBRIS){if((r-=d[1])<=0)return d[0]}return'litter'}
function debrisOne(s,x,z){const n=pickDebris(),pf=PFS(n);if(!pf)return;const flat=n==='litter'||n==='rubble'||n==='chunk'||n==='stone'||n==='bottle';
 s.put(pf,x,0,z,R(0,PI*2),{rx:n==='barrel'&&Math.random()<.15?PI/2:0,s:flat?R(.8,1.5):1})}
const api={
 poles(p,h){const s=api._poleS||(api._poleS=batch(true));s.put(PF.pole(),p.x,0,p.z,h?PI/2:0,{s:1.05})},
 flushPoles(){if(api._poleS){api._poleS.flush();api._poleS=null}},
 furniture(L,out){
  const s=batch(true),face0=0;
  for(const b of buildings){if(b.t==='park'||/cemetery|water_tower/.test(b.t))continue;const p=plotAt(L,b.x,b.z);if(!p)continue;
   const north=p.front==='north',sz=north?p.z0+.8:p.z1-.8,face=north?0:PI,o=north?-1:1,com=!/house/.test(b.t);
   if(Math.random()<.55)s.put(mkHydrant(),R(p.x0+3,p.x1-3),0,sz+o*.45,0);
   if(com){
    if(Math.random()<.7)s.put(PF.gbench(),b.x+R(-b.w/3,b.w/3),0,sz,north?PI:0);
    if(Math.random()<.8)s.put(Math.random()<.5?mkBin():PF.fdBin(),b.x+R(-b.w/2,b.w/2),0,sz+o*.2,face);
    if(Math.random()<.5)s.put(PF.fdMailbox(),b.x+R(-b.w/2,b.w/2),0,sz+o*.3,face);
    if(Math.random()<.35)s.put(PF.bollard(),b.x+R(-b.w/2,b.w/2),0,sz+o*.9,0);
    if(Math.random()<.25)s.put(PF.cafeTable(),b.x+R(-b.w/3,b.w/3),0,sz-o*.5,0);
    if(Math.random()<.22)s.put(PF.chair(),b.x+R(-b.w/3,b.w/3),0,sz-o*.5,R(0,PI*2));
   }else{ // houses: yard clutter
    if(Math.random()<.3)s.put(PF.bicycle(),b.x+R(-b.w/2,b.w/2),0,b.z+(north?-1:1)*(b.d/2+1.2),R(0,PI));
    if(Math.random()<.2)s.put(PF.woodpile(),b.x+(Math.random()<.5?-1:1)*(b.w/2+1.4),0,b.z+R(-b.d/3,b.d/3),PI/2);
    if(Math.random()<.25)s.put(PF.hayBale?PF.hayBale():PF.crate(),b.x+R(-b.w/2,b.w/2),0,b.z-(north?-1:1)*(b.d/2+1.5),R(0,PI*2));
   }
   if(!com||Math.random()<.2)s.put(PF.trashBag(),b.x+R(-b.w/2,b.w/2),0,sz+o*.6,R(0,6));
   N.furn=(N.furn||0)+1}
  s.flush();
 },
 roadblocks(L){
  const vxs=L.roads.filter(r=>(r.x1-r.x0)<(r.z1-r.z0)),hzs=L.roads.filter(r=>(r.x1-r.x0)>=(r.z1-r.z0)),s=batch(true);
  for(let i=0;i<9;i++){const horiz=Math.random()<.5,r=PKA(horiz?hzs:vxs),n=RI(2,4);
   const x0=horiz?R(r.x0+14,r.x1-14):(r.x0+r.x1)/2+R(-1.5,1.5),z0=horiz?(r.z0+r.z1)/2+R(-1.5,1.5):R(r.z0+14,r.z1-14);
   if(vxs.some(v=>horiz&&x0>v.x0-6&&x0<v.x1+6)||hzs.some(h=>!horiz&&z0>h.z0-6&&z0<h.z1+6))continue;
   const ry=(horiz?0:PI/2)+R(-.12,.12),jp=PF.jersey(3.0);   // v071: prefab length is along z, so this lines them up across the road like the classic set
   for(let k=0;k<n;k++){const off=(k-(n-1)/2)*3.1,x=x0+(horiz?0:off),z=z0+(horiz?off:0);
    s.put(jp,x,0,z,ry);jerseySolid(x,z,ry,3.0)}
   if(Math.random()<.6)for(let k=0;k<3;k++)s.put(mkCone(),x0+R(-3,3),0,z0+R(-3,3),R(0,6));
   if(Math.random()<.35)s.put(PF.sandbagFat(),x0+R(-2,2),0,z0+R(-2,2),R(0,PI));
   N.rb=(N.rb||0)+1}
  s.flush();
 },
 debris(L,count){
  const spots=[];
  for(const p of L.plots){const north=p.front==='north',sz=north?p.z0+.8:p.z1-.8;for(let i=0;i<9;i++)spots.push([R(p.x0+1,p.x1-1),sz+R(-.7,.7),.7]);for(let i=0;i<7;i++)spots.push([R(p.x0+1,p.x1-1),R(p.z0+1,p.z1-1),.3])}
  for(const a of L.alleys)for(let i=0;i<22;i++)spots.push([R(a.x0+1,a.x1-1),R((a.z0+a.z1)/2-1.8,(a.z0+a.z1)/2+1.8),.8]);
  for(const r of L.roads)for(let i=0;i<14;i++)spots.push([R(r.x0+1,r.x1-1),R(r.z0+1,r.z1-1),.15]);
  const s=batch(true);let made=0;
  for(let tries=0;made<count&&tries<count*3;tries++){const [x,z,w]=PKA(spots);if(Math.random()>w+.15||inB(x,z,.6))continue;made++;debrisOne(s,x,z)}
  // larger set pieces: dumpsters in alleys, a few wrecks on roads
  for(const a of L.alleys)if(Math.random()<.5){const x=R(a.x0+4,a.x1-4),z=(a.z0+a.z1)/2+(Math.random()<.5?-1.5:1.5);if(!inB(x,z,1.5))s.put(PF.dumpster(),x,0,z,(a.x1-a.x0)>(a.z1-a.z0)?0:PI/2,{})}
  N.debris=made;s.flush();
 },
 buildings(L,groups){
  /* wall AC + roof equipment on the building groups, stamped in the group's local space */
  /* v076: the footprint (bw x bd x bh) is only the lot's nominal box. Overhauled buildings have recesses, porches, pitched or missing roofs and
     lower roofs, so units placed on that box floated. Every unit is now placed on real geometry found by a ray, or not placed at all. */
  for(const g of groups){const u=g.userData,bw=u.bw,bd=u.bd,bh=u.bh,s=batch(true);g.updateMatrixWorld(true);const ms=meshesOf(g);
   for(let i=0,n=RI(0,3);i<n;i++){const sx=Math.random()<.5?-1:1,y=R(1.8,2.8),z=R(-bd/2+1.5,bd/2-1.5),wx=wallAt(g,ms,sx,y,z,bw);
    if(wx!==null){s.put(PF.acUnit(),wx+sx*.25,y,z,sx>0?PI/2:-PI/2);N.wallAC=(N.wallAC||0)+1}else N.unitSkip=(N.unitSkip||0)+1}
   if(bw*bd>60&&bh>3.2){
    for(let i=0,n=RI(1,4);i<n;i++){const x=R(-bw/2+2,bw/2-2),z=R(-bd/2+2,bd/2-2),k=Math.random(),ry=R(0,PI*2),top=roofAt(g,ms,x,z,bh);
     if(top===null){N.unitSkip=(N.unitSkip||0)+1;continue}N.roofUnits=(N.roofUnits||0)+1;s.put(k<.28?PF.acUnit():k<.45?PF.waterTank():k<.62?PF.solarHeater():k<.8?PF.dish():PF.antenna(),x,top,z,ry)}
   }
   s.flush(g);N.bldg=(N.bldg||0)+1}
 },
 fort(fx,fz){
  const s=batch(true);let made=0;const ring=(a,b)=>{const an=R(0,PI*2),r=R(a,b);return[fx+Math.cos(an)*r,fz+Math.sin(an)*r]};const free=(x,z,r)=>!(Math.abs(x-fx)<r&&Math.abs(z-fz)<r);
  for(let i=0;i<120;i++){const [x,z]=ring(16.5,42);if(!free(x,z,16.5))continue;debrisOne(s,x,z);made++}
  for(let k=0;k<3;k++){const x=fx+(k-1)*3.2+R(-.3,.3),z=fz+R(21,24),ry=PI/2+R(-.15,.15);s.put(PF.jersey(3.0),x,0,z,ry);jerseySolid(x,z,ry,3.0)}   // v071: the prefab runs along z, so turn it across the front and give it matching collision
  for(let k=0;k<5;k++){const x=fx+R(-8,8),z=fz+R(19,23);for(let q=0;q<RI(2,4);q++)s.put(q%2?PF.sandbagFat():PF.sandbag(),x+R(-.5,.5),(q>1?.22:0),z+R(-.3,.3),R(-.4,.4))}
  for(let k=0;k<6;k++){const [x,z]=ring(18,46);if(free(x,z,17.5))s.put(PF.crate(),x,0,z,R(0,PI*2))}
  N.fort=made;s.flush();
 },
 on:on,stats:N
};
window.RGPROPS=Object.assign(api,{session:session,matFor:matFor,vehicleGroup:vehicleGroup,stats:N,CAR_COLS:CAR_COLS});
console.log('[props] Modern prop layer ready ('+Object.keys(PF).length+' prefabs)');
})();
