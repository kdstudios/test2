/* ==========================================================================================================
   MINI FORT ZOMBIE - PROP LOOT CONTAINERS (v072)
   75 original prop models (js/props/: built procedurally with the prop kit, painted textures made in code) as lootable containers.
   - spawnPropContainer(x,z,name,table,ry,y0) -> a lootable container using that model (collision boxes from the model)
   - spawnContainer(...) keeps working; for loot tables listed in a model's 'auto' it picks a fitting model instead of the old box prop,
     only at a facing where it hits no wall or furniture (open space in front preferred, back to a wall second), otherwise the box prop
   - MFZPROP.CATALOGUE = MFZK.defs: label, default loot table, item count, auto tables for every model
   - Dev Mode > State > Props: line up all models (static or as containers) with name tags
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K){console.warn('[mfzprops] prop kit missing');return}
const T=THREE,D=K.defs;
const MFZPROP=window.MFZPROP={on:true,CATALOGUE:D,stats:{spawned:0},autoChance:.85,maxAuto:2.6,
 names:()=>Object.keys(D),has:n=>!!D[n],build:n=>K.instance(n),size:n=>{const M=K.model(n);if(!M)return null;const s=M.bb.getSize(new T.Vector3());return[s.x,s.y,s.z]}};

/* collision boxes of a model placed at (x,y0,z) turned by ry (each box turned and re-boxed) */
function colBoxes(name,x,y0,z,ry){const M=K.model(name),c=Math.cos(ry),s=Math.sin(ry),out=[];
 for(const b of M.cols){if(b[4]-b[1]<.03)continue;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
  for(const px of[b[0],b[3]])for(const pz of[b[2],b[5]]){const wx=x+px*c+pz*s,wz=z-px*s+pz*c;x0=Math.min(x0,wx);x1=Math.max(x1,wx);z0=Math.min(z0,wz);z1=Math.max(z1,wz)}
  out.push(new T.Box3(new T.Vector3(x0,y0+Math.max(0,b[1]),z0),new T.Vector3(x1,y0+b[4],z1)))}
 return out}
MFZPROP.colBoxes=colBoxes;

/* ---------------- the container ---------------- */
window.spawnPropContainer=function(x,z,name,table,ry,y0){
 const d=D[name];if(!d)return spawnContainer(x,z,table||'house',y0||0);
 const tb=table||d.table;y0=y0||0;ry=ry===undefined?Math.floor(Math.random()*4)*Math.PI/2:ry;
 const g=K.instance(name);g.position.set(x,y0,z);g.rotation.y=ry;scene.add(g);const pieces=[];g.traverse(o=>{if(o.isMesh)pieces.push(o)});
 const cont={x,z,inv:newInv(16,16),pieces,group:g,table:tb,model:name,label:d.label,body:/^body/.test(name),locked:(G.mode==='EXPEDITION'&&/gun_|weapon|ammo|trunk|locker|display|tool_chest/.test(name)&&Math.random()<.06)};
 const n=ri(d.items[0],d.items[1])+(cont.locked?ri(2,3):0);rollLoot(LOOT_TABLES[tb]?tb:'house',n).forEach(id=>{const q=newInst(id);lootRoll(q);invAdd(cont.inv,q)});
 g.userData={kind:'loot',cont,rgcont:1,mfzModel:name};pieces.forEach(p=>{if(!p.userData||!p.userData.part)p.userData={kind:'loot',cont,mfzModel:name}});
 for(const b of colBoxes(name,x,y0,z,ry))solids.push(b);
 MFZPROP.stats.spawned++;return cont};

/* ---------------- buildings: fitting models for the old box props ---------------- */
const AUTO={};for(const [n,d] of Object.entries(D))for(const t of d.auto)(AUTO[t]=AUTO[t]||[]).push(n);MFZPROP.auto=AUTO;
const fits={};const fitsAuto=n=>{if(fits[n]!==undefined)return fits[n];const s=MFZPROP.size(n);return fits[n]=!!s&&Math.max(s[0],s[2])<=MFZPROP.maxAuto};
const _sc=spawnContainer;
spawnContainer=function(x,z,table,y0){
 if(MFZPROP.on&&AUTO[table]&&Math.random()<MFZPROP.autoChance&&!(G&&G.mode==='DEV'&&window.DEV&&DEV.w&&DEV.w.kind==='warehouse')){
  const opts=AUTO[table].filter(fitsAuto);
  const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  // facings ranked: open space in front first (you can get at it), back against a wall second, then the rest
  const rank=(n,ry)=>{const M=K.model(n),f=M.bb.max.z+.7,bk=M.bb.min.z-.35,sn=Math.sin(ry),cs=Math.cos(ry),Y=(y0||0)+.3;
   return (blocked(x+sn*f,z+cs*f,.3,Y,1.2)?0:2)+(blocked(x+sn*bk,z+cs*bk,.15,Y,1.2)?1:0)};
  for(const n of sh(opts.slice())){const rots=sh([0,1,2,3]).map(k=>k*Math.PI/2).map(ry=>[ry,rank(n,ry)]).sort((p,q)=>q[1]-p[1]);
   for(const [ry] of rots){const bx=colBoxes(n,x,y0||0,z,ry);
    if(bx.some(b=>{const q=b.clone().expandByScalar(-.03);for(const s of solids)if(s&&s.intersectsBox(q))return true;return false}))continue;
    const c=spawnPropContainer(x,z,n,table,ry,y0||0);if(c)return c}}}
 return _sc.apply(this,arguments)};

/* emptied containers grey out: models get their own material copies first (the shared ones stay untouched); bodies stay as they are */
if(typeof refreshContainerVisual==='function'){const _rv=refreshContainerVisual;refreshContainerVisual=function(cont){
 if(cont&&cont.model){if(cont.body||!cont.inv||cont.inv.items.length||cont.group.userData.dim)return;cont.group.userData.dim=1;
  for(const m of cont.pieces){if(m.material&&!m.material.transparent){const y=m.material.clone();if(y.color)y.color.multiplyScalar(.55);if(m.material.defines)y.defines=Object.assign({},m.material.defines);if(m.material.onBeforeCompile)y.onBeforeCompile=m.material.onBeforeCompile,y.customProgramCacheKey=m.material.customProgramCacheKey;m.material=y}}return}
 return _rv.apply(this,arguments)}}
/* the world texturing pass leaves the models alone (they carry their own surfaces) */
if(window.RGW&&RGW.texContainer){const _tc=RGW.texContainer;RGW.texContainer=function(cont){if(cont&&cont.model)return;return _tc.apply(this,arguments)}}

/* ---------------- dev line-up ---------------- */
MFZPROP.shown=[];
MFZPROP.lineup=function(loot,list){if(typeof pl==='undefined')return 0;MFZPROP.clear();const names=list||Object.keys(D),fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
 let row=0,cur=0;
 for(const n of names){const s=MFZPROP.size(n)||[1,1,1],w=Math.max(s[0],s[2])+1.3;if(cur+w>36){row++;cur=0}const off=cur+w/2-18,dist=6+row*7;cur+=w;
  const x=pl.position.x+fx*dist+rx*off,z=pl.position.z+fz*dist+rz*off,y=typeof groundAt==='function'?groundAt(x,z,pl.position.y-1.2):0;
  let g;if(loot)g=spawnPropContainer(x,z,n,undefined,yaw,y).group;else{g=K.instance(n);g.position.set(x,y,z);g.rotation.y=yaw;scene.add(g)}
  try{if(window.MFZTAG)MFZTAG(g,D[n].label+'  ('+n+')','#fff',s[1]+.45)}catch(e){}MFZPROP.shown.push(g)}
 return MFZPROP.shown.length};
MFZPROP.clear=function(){for(const g of MFZPROP.shown){if(g.parent)g.parent.remove(g);const c=g.userData&&g.userData.cont;if(c&&c.model)for(const b of colBoxes(c.model,g.position.x,g.position.y,g.position.z,g.rotation.y)){const i=solids.findIndex(q=>q&&q.min.equals(b.min)&&q.max.equals(b.max));if(i>=0)solids.splice(i,1)}}MFZPROP.shown=[]};
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){MFZPROP.shown=[];return _cw.apply(this,arguments)}}
(function(){const dv=document.querySelector('#dev [data-p="state"]');if(!dv)return;const w=document.createElement('div');
 w.innerHTML='<h4>Props (v072)</h4><div class="row"><button id="mfzpShow" style="background:#7f1d1d">Line up all '+Object.keys(D).length+' props</button><button id="mfzpLoot">Line up as lootable containers</button><button id="mfzpClr">Clear</button></div><div class="m">Our own procedural prop models (js/props/). Each one is lootable; buildings use the ones that fit.</div>';dv.appendChild(w);
 document.getElementById('mfzpShow').onclick=()=>MFZPROP.lineup(false);document.getElementById('mfzpLoot').onclick=()=>MFZPROP.lineup(true);document.getElementById('mfzpClr').onclick=()=>MFZPROP.clear()})();
console.log('[mfzprops] '+Object.keys(D).length+' prop models');
})();
