/* =====================================================================================================
   REVISION 034 - DEVELOPER TOOLKIT
   Separate script block. It reuses the game's real systems (ITEMS/CATS/LOOT_TABLES, CATALOGUE/bld/checkPlacement, town(),
   zombie()/ZT, spawnContainer, initCampaign/go/startSiege/openHQ ...) and only hooks the few functions listed in WRAP below.
   Nothing here runs unless Dev Mode is enabled from Main Menu -> Options -> Developer Toolkit. (v070: UI rebuilt into rail + pages; sandbox now starts from a real New Game state.)
   Isolation: enabling Dev Mode snapshots G / HQINV / PINV; leaving Dev Mode restores them. Dev settings are never written to
   'gf_set' (normal settings) - only saved test scenarios use their own localStorage key 'gf_dev_scenarios'.
   ===================================================================================================== */
(function(){
const REV=VERSION;
const DF={hpAll:false,hpSel:false,hitP:false,hitZ:false,coll:false,walk:false,bBounds:false,spawns:false,doorR:false,lootR:false,labels:false,diag:false,
 noclip:false,pInv:false,infSt:false,zFreeze:false,zInv:false,zBeh:'normal',unlimited:false,pause:false,timeRun:false,fly:12,hpM:1,dmgM:1,spM:1};
const D=window.DEV={on:false,snap:null,open:false,opening:false,s:Object.assign({},DF),w:{kind:null,seed:0,fort:'police',mode:null,spawn:null,gen:null,bld:null,info:null},
 sel:null,zid:0,base:null,force:false,genHist:[],overflow:[],tab:'world',lastDebug:''};
const TAU2=Math.PI*2;
/* ---------- small utilities ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LOGS=[];
function log(l,t){LOGS.push(new Date().toISOString().slice(11,23)+' ['+l+'] '+String(t).slice(0,400));if(LOGS.length>300)LOGS.shift();const b=$('dvLogB');if(b){const n=LOGS.filter(x=>/\[(ERROR|FAIL|EXCEPTION)\]/.test(x)).length;b.textContent='Log ('+LOGS.length+(n?', '+n+' errors':'')+')'}
 const w=$('dvLogW'),e=$('dvLog');if(e&&w&&!w.classList.contains('hide')){e.textContent=LOGS.join('\n');e.scrollTop=e.scrollHeight}}
addEventListener('error',e=>log('EXCEPTION',(e.message||'')+' @'+String(e.filename||'').split('/').pop()+':'+e.lineno+':'+e.colno));
addEventListener('unhandledrejection',e=>log('EXCEPTION','promise: '+(e.reason&&e.reason.message||e.reason)));
['error','warn'].forEach(k=>{const o=console[k];console[k]=function(){try{log(k==='error'?'ERROR':'WARN',[].map.call(arguments,x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' | '):typeof x==='object'?JSON.stringify(x):String(x)).join(' '))}catch(e){}return o.apply(console,arguments)}});
log('info','Dev toolkit module loaded (Revision '+REV+')');
function msg(t,ok){ok=ok!==false;log(ok?'info':'FAIL',t);const e=$('dvMsg');if(e){e.textContent=(ok?'OK: ':'FAILED: ')+t;e.style.color=ok?'#22c55e':'#ef4444'}try{toast((ok?'[DEV] ':'[DEV FAILED] ')+t)}catch(e2){}if(!ok)console.warn('[DEV]',t)}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash32(s){let h=2166136261;s=String(s);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function parseSeed(v){v=String(v==null?'':v).trim();if(!v)return(Math.random()*4294967296)>>>0;if(/^\d{1,10}$/.test(v)&&Number(v)<4294967296)return Number(v)>>>0;return hash32(v)}
function withSeed(seed,fn){const o=Math.random;Math.random=mulberry32(seed>>>0);try{return fn()}finally{Math.random=o}}
const countScene=()=>{let n=0;scene.traverse(()=>n++);return n};
const lootConts=()=>scene.children.filter(o=>o.userData&&o.userData.kind==='loot'&&o.userData.cont&&!o.userData.cont.drop).map(o=>o.userData.cont);
const dist2=(x,z)=>Math.hypot(x-pl.position.x,z-pl.position.z);
function inScene(o){while(o){if(o===scene)return true;o=o.parent}return false}
function groundPlane(c){const g=mesh(new THREE.PlaneGeometry(500,500),c,0,0,0);g.rotation.x=-Math.PI/2;return g}
function clampN(v,a,b,d){v=Number(v);if(!isFinite(v))return d;return Math.max(a,Math.min(b,v))}

/* ---------- state isolation ----------
   v070: entering Dev Mode before a campaign exists used to run every test world on the game's raw on-load state (Day 0, no starting
   kit, 100 HP on every fort, no skills / town map, "Siege in 14 days"), which is not what the real game ever builds. Now Dev Mode
   creates the same fresh Day-1 campaign New Game creates (initCampaign) inside the sandbox. Restoring also removes any G keys the
   sandbox added and keeps the equipped weapon pointing at the restored inventory. */
function deep(v){try{return structuredClone(v)}catch(e){return v}}
function snapshot(){const g={};for(const k of Object.keys(G)){const d=Object.getOwnPropertyDescriptor(G,k);if(d&&!d.get)g[k]=G[k]}
 let s=null;try{s=structuredClone({g,hq:Object.assign({},HQINV),p:Object.assign({},PINV)})}
 catch(e){s={g:{},hq:{},p:{}};for(const k in g)s.g[k]=deep(g[k]);for(const k in HQINV)s.hq[k]=deep(HQINV[k]);for(const k in PINV)s.p[k]=deep(PINV[k])}
 s.keys=Object.keys(g);s.eqI=PINV.items.indexOf(G.eq);s.fn=$('fn')?$('fn').textContent:'';D.snap=s}
function restoreSnapshot(){if(!D.snap)return;const s=D.snap,keep=new Set(s.keys);
 for(const k of Object.keys(G)){const d=Object.getOwnPropertyDescriptor(G,k);if(d&&!d.get&&d.configurable&&!keep.has(k))delete G[k]}
 Object.assign(G,s.g);Object.assign(HQINV,s.hq);Object.assign(PINV,s.p);
 if(G.eq&&!PINV.items.includes(G.eq))G.eq=s.eqI>=0?PINV.items[s.eqI]||null:null;
 if($('fn'))$('fn').textContent=s.fn;D.snap=null}
function freshCampaign(fort){initCampaign(fort);D.fresh=true;D.w.fort=G.fort;D.base={hp:G.hp,maxHp:G.maxHp,st:G.st}}
function enable(){if(D.on)return;snapshot();D.on=true;D.fresh=false;
 if(!(G.day>=1)){try{freshCampaign(D.w.fort||G.fort||'police')}catch(e){log('ERROR','fresh campaign failed: '+e.message)}}
 D.w.fort=G.fort;D.base={hp:G.hp,maxHp:G.maxHp,st:G.st};
 msg(D.fresh?'Dev Mode on: fresh Day-1 '+FORTS[G.fort].n+' campaign, identical to New Game. Your real state comes back when you leave.':'Dev Mode on: working on a copy of your campaign (Day '+G.day+'). The original comes back when you leave.')}
function disable(){if(!D.on)return;D.s=Object.assign({},DF);D.sel=null;D.overflow=[];D.open=false;D.opening=false;
 G.mode='TITLE';try{clearWorld()}catch(e){console.error(e)}restoreSnapshot();G.mode='TITLE';D.on=false;D.fresh=false;D.w={kind:null,seed:0,fort:G.fort||'police',mode:null,spawn:null,gen:null,bld:null,info:null};
 if(invOpen){invOpen=false;const s=$('invScr');if(s)s.style.display='none'}
 try{document.exitPointerLock()}catch(e){}$('hud').classList.add('hide');ui('menu');syncBadge()}

/* ---------- world cleanup hook (called from clearWorld) ---------- */
window.devOnClear=function(removed){O.reset();D.sel=null;D.overflow=[];if(!D.on)return;const seen=new Set();
 removed.forEach(r=>r.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose()}
  const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{if(!seen.has(m)){seen.add(m);m.dispose()}})}));
 TTC.forEach(t=>t.dispose());TTC.clear()};

/* ---------- text sprites ---------- */
const TTC=new Map();
function textTex(t,c){const k=t+'|'+c;let r=TTC.get(k);if(r)return r;const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,0,256,64);x.fillStyle=c||'#facc15';x.font='bold 24px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(String(t).slice(0,20),128,32);r=new THREE.CanvasTexture(cv);TTC.set(k,r);return r}
function label(t,c,x,y,z,sc,parent){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:textTex(t,c),transparent:true,depthTest:false}));s.position.set(x,y,z);s.scale.set(sc*4,sc,1);s.raycast=()=>{};s.renderOrder=9;(parent||scene).add(s);return s}

/* ---------- teleport / safety ---------- */
function settle(){const p=pl.position;G.vy=0;G.crouch=false;G.eyeH=G.eyeUsed=1.6;let x=p.x,z=p.z,feet=Math.max(0,p.y-1.6);let gy=groundAt(x,z,feet+.35);
 if(blocked(x,z,.4,gy+.02,1.8)){const f=freeSpot(x,z);x=f[0];z=f[1];gy=groundAt(x,z,feet+.35)}p.set(x,1.6+gy,z);G.feetY=gy}
function tp(x,z,fy,why){x=Number(x);z=Number(z);if(!isFinite(x)||!isFinite(z)){msg('Teleport target is invalid ('+(why||'?')+')',false);return false}
 x=Math.max(BND[0]+.8,Math.min(BND[1]-.8,x));z=Math.max(BND[2]+.8,Math.min(BND[3]-.8,z));
 const f=freeSpot(x,z),ok=!blocked(f[0],f[1],.55,0,1.8),gy=groundAt(f[0],f[1],(fy||0)+.35);
 pl.position.set(f[0],1.6+gy,f[1]);G.vy=0;G.crouch=false;G.eyeH=G.eyeUsed=1.6;G.feetY=gy;
 msg('Teleported to '+(why||'target')+' ('+f[0].toFixed(1)+', '+f[1].toFixed(1)+')'+(ok?'':' - destination was blocked, nearest free spot not found'),ok);return ok}
function worldOK(){if(!playing()){msg('Load a test world first (World & Maps / Building Inspector / Items).',false);return false}return true}

/* ---------- world builders ---------- */
function begin(){G.hqPause=false;if(!D.on)enable();if(invOpen){invOpen=false;const s=$('invScr');if(s)s.style.display='none'}D.open=false;G.siegeDue=false;G.mode='DEV';D.w.dummy=false}
function arrive(sp){const f=freeSpot(sp[0],sp[1]);D.w.spawn=f;pl.position.set(f[0],1.6+groundAt(f[0],f[1],.35),f[1]);G.vy=0;G.crouch=false;G.eyeH=G.eyeUsed=1.6;yaw=pitch=0;pl.rotation.y=0;camera.rotation.x=0;
 if(D.base){G.hp=D.base.hp;G.maxHp=D.base.maxHp;G.st=D.base.st}
 $('hud').classList.remove('hide');$('tip').classList.add('hide');ui('pz');lock();syncBadge();refreshAll()}
function captureWarn(fn){const w=[],ce=console.error;console.error=(...a)=>{w.push(a.map(x=>x&&x.message?x.message:typeof x==='object'?JSON.stringify(x).slice(0,160):String(x)).join(' ').slice(0,220));ce.apply(console,a)};let err=null;try{fn()}catch(e){err=e}finally{console.error=ce}return{w,err}}
function buildMapCore(seed){G.fort=D.w.fort;const t0=performance.now();
 const msn=G.mission;G.mission=null;const r=captureWarn(()=>{G.mode='EXPEDITION';try{withSeed(seed,()=>{buildWorld()})}finally{G.mode='DEV';G.mission=msn}});
 const R=window.__fortZombieTown||{},ms=+(performance.now()-t0).toFixed(1);
 D.w.kind='map';D.w.seed=seed>>>0;D.w.mode=null;D.w.bld=null;D.w.info=null;
 D.w.gen={kind:'map',seed:seed>>>0,fort:G.fort,ms,buildings:buildings.length,plots:(R.plan||[]).length,zombies:zombies.length,containers:lootConts().length,doors:doors.length,solids:solids.length,windows:winList.length,sceneObjs:countScene(),warnings:(R.placementErrors||[]).concat(r.w),err:r.err?r.err.message:null};
 D.genHist.push({seed:D.w.seed,fort:G.fort,objs:D.w.gen.sceneObjs,solids:solids.length,zombies:zombies.length,doors:doors.length,buildings:buildings.length});if(D.genHist.length>30)D.genHist.shift();return D.w.gen}
function loadMap(seed){begin();const g=buildMapCore(seed);$('dvSeed').value=String(D.w.seed);arrive([TRUCK.x,TRUCK.z+6]);
 g.err?msg('Map generation threw: '+g.err,false):msg('Map seed '+D.w.seed+' generated in '+g.ms+' ms ('+g.buildings+' buildings, '+g.zombies+' zombies'+(g.warnings.length?', '+g.warnings.length+' warning(s)':'')+')')}
const fakePlot=(cat,front)=>({id:-1,col:1,row:front==='north'?0:1,block:0,front,x0:-GRID.PW/2,x1:GRID.PW/2,z0:-GRID.PD/2,z1:GRID.PD/2,cx:0,cz:0});
function findDoor(B){const v=new THREE.Vector3();let best=null,bd=1e9;doors.forEach(d=>{d.sol.getCenter(v);const dz=Math.abs(v.z-B.cs*B.d/2);if(dz<bd){bd=dz;best={x:v.x,z:v.z}}});return bd<2.2?best:null}
function buildLabCore(idx,lv,front,seed){const t=LABCAT[idx];if(!t)throw new Error('no building at index '+idx);const p=fakePlot(t.category,front);if(t.scope==='half'){p.x1=0;p.cx=-GRID.PW/4}
 const r=captureWarn(()=>{clearWorld();G.mode='DEV';groundPlane(0x2a2c2a);BND=[-45,45,-40,40];treeList=[];buildings=[];streetLights=[];
  withSeed(seed,()=>{drawPlot(p,t.category);const res=bld(p.cx,p.cz,t,lv,p);D.w.info={t,lv,front,res,errors:checkPlacement(p,t,res.n0,res.B)}});
  try{if(window.RGFLORA&&RGFLORA.on()){RGFLORA.collect();RGFLORA.spawn()}}catch(e){console.warn('[dev] flora',e)} /* v074: lot trees are instanced by flora, which only runs after a full world build */
  border(...BND);zFix();buildNav()});
 if(r.err)throw r.err;const B=D.w.info.res.B,dr=B&&findDoor(B),cs=B?B.cs:(front==='south'?1:-1);
 const ex=dr?[dr.x,dr.z+cs*2.5]:[B?B.x+cs*(B.dx||0):0,cs*10],inn=dr?[dr.x,dr.z-cs*2.5]:[0,cs*3];
 Object.assign(D.w.info,{entrance:ex,inside:inn,door:dr,warn:r.w,cs});D.w.kind='building';D.w.bld={idx,lv,front,seed:seed>>>0};D.w.mode=null;
 D.w.gen={kind:'building',seed:seed>>>0,id:t.id,cond:COND_NAMES[lv],ms:0,buildings:buildings.length,zombies:zombies.length,containers:lootConts().length,doors:doors.length,solids:solids.length,windows:winList.length,sceneObjs:countScene(),warnings:D.w.info.errors.concat(r.w)}}
function loadBld(idx,lv,front,seed,keepPos){begin();idx=((idx%LABCAT.length)+LABCAT.length)%LABCAT.length;
 try{buildLabCore(idx,lv,front,seed)}catch(e){msg('Building failed to load: '+e.message,false);return}
 const I=D.w.info;if(keepPos){$('hud').classList.remove('hide');ui('pz');lock();const f=freeSpot(pl.position.x,pl.position.z);pl.position.set(f[0],1.6+groundAt(f[0],f[1],.35),f[1])}else arrive(I.entrance);
 $('dvBld').value=String(idx);$('dvCond').value=String(lv);$('dvFront').value=front;
 msg(I.t.name+' ['+I.t.id+'] '+COND_NAMES[lv]+' loaded'+(I.errors.length?' - '+I.errors.length+' placement problem(s) reported':''));refreshAll()}
const WH_TABLE={melee:'hardware',rifle:'gunshop',pistol:'gunshop',assault:'gunshop',smg:'gunshop',ammo:'gunshop',food:'diner',meds:'clinic',mat:'hardware'};
function whPlan(){const cats=Object.keys(CATS);ITEM_ORDER.forEach(id=>{if(!cats.includes(ITEMS[id].cat))cats.push(ITEMS[id].cat)});const plan=[];
 cats.forEach(cat=>{const ids=ITEM_ORDER.filter(i=>ITEMS[i].cat===cat);if(!ids.length)return;let probe=newInv(16,16),cur=[];
  ids.forEach(id=>{if(!invAdd(probe,newInst(id))){plan.push({cat,ids:cur});probe=newInv(16,16);cur=[];invAdd(probe,newInst(id))}cur.push(id)});if(cur.length)plan.push({cat,ids:cur})});
 const per={};plan.forEach(p=>{per[p.cat]=(per[p.cat]||0)+1;p.part=per[p.cat]});plan.forEach(p=>p.of=per[p.cat]);return plan}
function clearInv(inv){inv.items.length=0;inv.g=makeGrid(inv.w,inv.h)}
function fillIds(c,ids){clearInv(c.inv);const bad=[];ids.forEach(id=>{const q=newInst(id);if(!q||!invAdd(c.inv,q))bad.push(id)});refreshContainerVisual(c);recolor(c);return bad}
function recolor(c){if(c.dev&&c.dev.cols&&c.inv.items.length)c.pieces.forEach((p,i)=>{if(c.dev.cols[i]!==undefined)p.material.color.setHex(c.dev.cols[i])})}
function buildWhCore(){clearWorld();G.mode='DEV';groundPlane(0x303236);BND=[-40,40,-30,30];treeList=[];buildings=[];streetLights=[];
 const plan=whPlan(),cols=5;plan.forEach((p,i)=>{const x=-16+(i%cols)*8,z=-14+Math.floor(i/cols)*9,c=spawnContainer(x,z,WH_TABLE[p.cat]||'house',0);
  c.dev={cols:c.pieces.map(m=>m.material.color.getHex()),cat:p.cat,part:p.part,of:p.of,ids:p.ids.slice(),name:(CATS[p.cat]||p.cat)+(p.of>1?' '+p.part+'/'+p.of:''),wh:true};
  c.dev.init=p.ids.slice();fillIds(c,p.ids);label(c.dev.name,'#facc15',x,2.9,z,.7)});
 D.w.kind='warehouse';D.w.mode=null;D.w.bld=null;D.w.info=null;D.w.gen={kind:'warehouse',seed:0,ms:0,buildings:0,zombies:0,containers:plan.length,doors:doors.length,solids:solids.length,windows:0,sceneObjs:countScene(),warnings:[]};buildNav()}
function loadWh(){begin();buildWhCore();arrive([0,10]);msg('Item warehouse loaded: '+D.w.gen.containers+' containers for '+Object.keys(CATS).length+' categories, '+ITEM_ORDER.length+' items')}
/* ---------------- v076: Building > Test worlds (props, models, survivors, zombies, AI test areas) ---------------- */
/* Test dummies: zombies flagged u.dummy stand still and never attack while D.w.dummy is on (they can still be shot, hit, dismembered and killed). */
function testBase(kind,bnd,col){clearWorld();G.mode='DEV';groundPlane(col||0x2e3230);BND=bnd||[-45,45,-45,45];treeList=[];buildings=[];streetLights=[];
 D.w.kind='test '+kind;D.w.mode=null;D.w.bld=null;D.w.info=null;D.w.dummy=true;try{CUR.cs=1;CUR.lv=0}catch(e){}}
function testEnd(kind,spawn,extra){border(...BND);try{zFix()}catch(e){}buildNav();
 D.w.gen=Object.assign({kind:'test '+kind,seed:0,ms:0,buildings:buildings.length,zombies:zombies.length,containers:lootConts().length,doors:doors.length,solids:solids.length,windows:winList.length,sceneObjs:countScene(),warnings:[]},extra||{});
 arrive(spawn);refreshAll()}
function dummyZ(x,z,style,base){const F=typeof FZ!=='undefined'?FZ:null,f0=F&&F.force,on0=F&&F.T&&F.T.on,n0=zombies.length;
 try{if(F){if(base){if(F.T)F.T.on=false}else F.force=style||null}zombie(x,z,base||undefined,false)}finally{if(F){F.force=f0;if(F.T)F.T.on=on0}}
 const g=zombies.length>n0?zombies[zombies.length-1]:null;if(!g)return null;const u=g.userData;u.dummy=1;u.sleep=false;u.hx=x;u.hz=z;u.lx=x;u.lz=z;g.rotation.y=0;return g}
function tagAt(t,c,x,y,z,s){try{label(t,c||'#facc15',x,y,z,s||.6)}catch(e){}}
function twProps(){begin();testBase('props',[-45,45,-55,45]);pl.position.set(0,1.6,38);yaw=pitch=0;
 const n=window.MFZPROP?MFZPROP.lineup(true):0;tagAt('ALL PROPS (lootable)','#facc15',0,3.4,33,1);
 testEnd('props',[0,38]);msg('Props test world: '+n+' lootable prop models')}
const TW_PF=['gbench','dumpster','fdBin','fdMailbox','fdSkip','bollard','lampPost','fdLamp','gardenLamp','pole','acUnit','antenna','dish','solarHeater','waterTank','generator',
 'woodpile','bicycle','moped','cafeTable','chair','crate','pallet','barrel','tire','jerrycan','gasBottle','trashBag','cardboard','brickPile','hayBale','sandbag','sandbagFat','jersey','forklift','fountain'];
function twModels(){begin();testBase('models',[-45,45,-55,40]);let nv=0,np=0,nt=0;
 /* vehicles: every MFZV kind, then the civilian car in each body */
 if(window.MFZV){const list=MFZV.kinds.filter(k=>k!=='civilian').map(k=>[k,k,{}]).concat(['sedan','hatch','suv','mpv','cross','offroad'].map(m=>['car: '+m,'civilian',{model:m,ci:1}]));
  list.forEach((v,i)=>{const x=-21+(i%8)*6,z=18-Math.floor(i/8)*11;try{MFZV.make(v[1],x,z,0,v[2]);tagAt(v[0],'#93c5fd',x,4.4,z,.6);nv++}catch(e){console.warn('[test] vehicle',v[0],e)}})}
 /* street furniture and clutter (the Modern prefabs the town uses) */
 const RP=window.RGPROPS,PF=window.RGPK&&RGPK.PF;
 if(RP&&PF){TW_PF.forEach((n,i)=>{if(typeof PF[n]!=='function')return;const x=-24.5+(i%12)*4.45,z=-6-Math.floor(i/12)*6;
   try{const s=RP.session(),pf=n==='jersey'?PF.jersey(3):PF[n]();if(!pf)return;s.M.save().move(x,0,z);s.M.put(pf,{nocol:true});s.M.restore();const g=s.build({cull:true});g.userData.kind='rgprop';scene.add(g);
    const b=new THREE.Box3().setFromObject(g);if(!b.isEmpty()&&b.max.y>.35)solids.push(b);tagAt(n,'#fde68a',x,Math.max(1.6,b.max.y+.6),z,.5);np++}catch(e){console.warn('[test] prefab',n,e)}})}
 /* trees and bushes (flora models), one of each kind, plus a dead tree and a street light */
 const TK=['oak','linden','maple','ginkgo','cherry','cherryW','cedar'];
 TK.concat(['dead']).forEach((k,i)=>{const x=-28+i*8,z=-30;tree(x,z);const t=treeList[treeList.length-1];if(!t)return;t.keep=1;const sp=t.g.userData&&t.g.userData.spec;
  if(sp){if(k==='dead'){sp.kind='oak';sp.dead=1}else sp.kind=k}tagAt(k==='dead'?'dead tree':k,'#86efac',x,8.5,z,.7);nt++});
 for(let i=0;i<4;i++){const x=-22+i*4,z=-40;bush(x,z);const t=treeList[treeList.length-1];if(t)t.keep=1}tagAt('bushes','#86efac',-16,3,-40,.7);
 try{streetLight(14,-40);tagAt('street light','#fde68a',14,7,-40,.6)}catch(e){}
 try{if(window.RGFLORA&&RGFLORA.on()){RGFLORA.collect();RGFLORA.spawn()}}catch(e){console.warn('[test] flora',e)}
 testEnd('models',[0,32]);msg('Models test world: '+nv+' vehicles, '+np+' street props, '+nt+' trees')}
function twSurvivors(){begin();testBase('survivors',[-40,40,-40,35]);let n=0;
 const SV=window.RGSURV;if(SV&&window.RSURV){n+=SV.gallery(undefined,0,4).length;tagAt('NAMED SURVIVORS','#facc15',0,3.4,6.5,1);
  const ar=Object.keys(RSURV.ARCH||{});if(ar.length){const z0=4-Math.ceil(Object.keys(RSURV.D).length/13)*1.6-5;n+=SV.gallery(ar,0,z0).length;tagAt('BASE PERSONAS','#facc15',0,3.4,z0+2.5,1)}}
 testEnd('survivors',[0,14]);msg('Survivor test world: '+n+' survivor models')}
function twZombies(){begin();testBase('zombies',[-40,40,-50,35]);let n=0;
 const S=typeof FZ!=='undefined'&&FZ.cfg&&FZ.cfg.zst?Object.keys(FZ.cfg.zst).sort():[];const list=S.map(s=>[s,s,null]).concat([['walker',null,'walker'],['runner',null,'runner'],['brute',null,'brute']]);
 list.forEach((e,i)=>{const x=-13.5+(i%10)*3,z=6-Math.floor(i/10)*4;const g=dummyZ(x,z,e[1],e[2]);if(g){n++;try{if(window.MFZTAG)MFZTAG(g,e[0],e[2]?'#fde68a':'#fca5a5',2.3)}catch(_){}}});
 testEnd('zombies',[0,18]);msg('Zombie test world: '+n+' zombies, AI off (Building > Test worlds > AI on / off). Weapons: Items > Item browser, or the button here')}
/* AI test areas: a wall to walk round, a room with only a window, a room with only a door, and stairs to an upper floor */
function twRoom(x,z,w,d,ops,col){const B=mk(x,z,w,d,3,col||0x8f8a7e,0x5b5650,0x5a3a22);B.g.userData.bwall=1;shell(B,ops);buildings.push({x:B.x,z:B.z,w:B.w,d:B.d,t:'test'});return B}
function twAI(){begin();testBase('ai areas',[-45,45,-35,30],0x34383a);
 /* 1. wall */
 {const B=mk(-30,-10,14,1,3,0x8f8a7e,0x5b5650,0x5a3a22);B.g.userData.bwall=1;WL(B,1,0,-7,7,[],3);dummyZ(-30,-15);tagAt('WALL: walks round it','#facc15',-30,4.2,-10,.8)}
 /* 2. window only (front, facing the spawn) */
 {twRoom(-10,-14,8,7,{f:[{k:'w',c:0}]});dummyZ(-10,-15);tagAt('WINDOW: climbs out','#facc15',-10,4.6,-10.5,.8)}
 /* 3. door only */
 {twRoom(10,-14,8,7,{f:[{k:'d',c:0,s:1}]});dummyZ(10,-15);tagAt('DOOR: opens / breaks it','#facc15',10,4.6,-10.5,.8)}
 /* 4. upper floor with stairs */
 {const B=mk(30,-16,10,8,3,0x8f8a7e,0x5b5650,0x5a3a22);slab(B,-5,5,-4,4,2.8,3.1,0x6b655c,true);stairs(B,3.6,8.2,-1,10,.31,.42,1.6,0x77716a);   /* climbs north onto the floor's front edge */
  slab(B,-5,5,-4.05,-3.95,3.1,4.1,0x4a4038,false);slab(B,-5,2.7,3.95,4.05,3.1,4.1,0x4a4038,false);slab(B,-5.05,-4.95,-4,4,3.1,4.1,0x4a4038,false);slab(B,4.95,5.05,-4,4,3.1,4.1,0x4a4038,false);
  buildings.push({x:B.x,z:B.z,w:B.w,d:B.d,t:'test'});const g=dummyZ(20,-24);if(g){g.position.set(29,3.1,-17);g.userData.hx=29;g.userData.hz=-17}dummyZ(24,-6);
  tagAt('UPSTAIRS: one up, one below','#facc15',30,6,-16,.8)}
 tagAt('AI is OFF: Dev Mode > Building > Test worlds > AI on / off','#fca5a5',0,3.2,8,.7);
 testEnd('ai areas',[0,18]);msg('AI test areas loaded: wall, window, door, upstairs. Turn the AI on to watch them path')}
function twToggleAI(){D.w.dummy=!D.w.dummy;if(!D.w.dummy)zombies.forEach(z=>{const u=z.userData;if(u.dummy){u.see=false;u.hunt=0}});msg('Test zombies: AI '+(D.w.dummy?'OFF (dummies)':'ON'));refreshAll()}
function scenario(m){G.hqPause=false;if(!D.on)enable();D.open=false;if(invOpen){invOpen=false;($('invScr')||{style:{}}).style.display='none'}if(!G.day||G.day<1||!HQINV.items.length)initCampaign(D.w.fort);G.fort=D.w.fort;
 const seed=m==='EXPEDITION'?parseSeed($('dvSeed').value):0;D.w.kind='scenario';D.w.mode=m;D.w.seed=seed;D.w.bld=null;D.w.info=null;
 const run=()=>{m==='SIEGE'?startSiege():go(m)};m==='EXPEDITION'?withSeed(seed,run):run();
 D.w.gen={kind:'scenario '+m,seed,ms:0,buildings:buildings.length,zombies:zombies.length,containers:lootConts().length,doors:doors.length,solids:solids.length,windows:winList.length,sceneObjs:countScene(),warnings:((window.__fortZombieTown&&m==='EXPEDITION')?window.__fortZombieTown.placementErrors:[])||[]};
 D.sel=null;syncBadge();refreshAll();msg('Scenario '+m+' started inside the dev sandbox (campaign state restored on exit)')}
function resetEnv(){if(!D.w.kind){msg('Nothing to reset: no test world is loaded yet',false);return}if(!confirm('Reset the test environment? The current test world and everything spawned in it will be rebuilt.'))return;
 const k=D.w.kind;if(k==='map')loadMap(D.w.seed);else if(k==='building'){const b=D.w.bld;loadBld(b.idx,b.lv,b.front,b.seed)}else if(k==='warehouse')loadWh();else if(k==='scenario')scenario(D.w.mode)}

/* ---------- zombies / combat ---------- */
const baseOf=z=>{const u=z.userData;if(!u.dev)u.dev={hp0:u.hp,sp0:u.sp,dmg0:u.dmg,hpMax:u.hp};return u.dev};
function applyStats(z){const b=baseOf(z),u=z.userData;u.sp=b.sp0*D.s.spM;u.dmg=b.dmg0*D.s.dmgM;u.hp=b.hp0*D.s.hpM;b.hpMax=u.hp}
const zid=z=>z.userData.devId||(z.userData.devId=++D.zid);
function spawnZ(kind,n){if(!worldOK())return;if(!ZT[kind]){msg('Unknown zombie type '+kind,false);return}let made=0;const base=Math.atan2(-Math.cos(yaw),-Math.sin(yaw));
 for(let t=0;t<n*40&&made<n;t++){const a=base+(Math.random()-.5)*1.5,r=5+Math.random()*(6+n*.6),x=pl.position.x+Math.cos(a)*r,z=pl.position.z+Math.sin(a)*r;
  if(x<BND[0]+2||x>BND[1]-2||z<BND[2]+2||z>BND[3]-2)continue;const c0=zombies.length;zombie(x,z,kind,false);
  if(zombies.length>c0){const q=zombies[zombies.length-1],u=q.userData;u.devTest=true;u.devKind=kind;if(u.sleep)wakeZ(q);zid(q);applyStats(q);made++}}
 made<n?msg('Spawned '+made+' of '+n+' '+kind+' (not enough free space)',made>0):msg('Spawned '+made+' '+kind);refreshAll()}
function removeZ(list,why){const set=new Set(list);zombies=zombies.filter(z=>!set.has(z));list.forEach(z=>{scene.remove(z);z.traverse(o=>{if(o.isSprite&&o.material)o.material.dispose()})});if(set.has(D.sel))D.sel=null;msg('Removed '+list.length+' '+why);refreshAll()}
function killZs(list){let n=0;D.force=true;try{list.slice().forEach(z=>{if(zombies.includes(z)){z.userData.hp=0;killZ(z);n++}})}finally{D.force=false}msg('Killed '+n+' zombie(s)');refreshAll()}
function zombieList(){return zombies.slice().sort((a,b)=>dist2(a.position.x,a.position.z)-dist2(b.position.x,b.position.z)).slice(0,60)}
function applyAllStats(){D.s.hpM=clampN($('dvHpM').value,.01,1000,1);D.s.dmgM=clampN($('dvDmgM').value,0,1000,1);D.s.spM=clampN($('dvSpM').value,0,10,1);zombies.forEach(applyStats);msg('Applied HP x'+D.s.hpM+', damage x'+D.s.dmgM+', speed x'+D.s.spM+' to '+zombies.length+' zombie(s)')}
function resetStats(){D.s.hpM=D.s.dmgM=D.s.spM=1;$('dvHpM').value=$('dvDmgM').value=$('dvSpM').value=1;zombies.forEach(z=>{const b=baseOf(z),u=z.userData;u.hp=b.hp0;u.sp=b.sp0;u.dmg=b.dmg0;b.hpMax=b.hp0});D.s.zBeh='normal';D.s.zFreeze=false;D.s.zInv=false;msg('Zombie stats, AI mode and invulnerability reset to normal');refreshAll()}

/* ---------- loot / containers ---------- */
const contIds=c=>c.inv.items.map(q=>q.id);
function nearestCont(maxD){let b=null,bd=maxD||8;lootConts().forEach(c=>{const d=dist2(c.x,c.z);if(d<bd){bd=d;b=c}});if(!b)msg('No loot container within '+(maxD||8)+' m of you',false);return b}
function initOf(c){if(!c.dev)c.dev={};if(!c.dev.init)c.dev.init=contIds(c);return c.dev}
function spawnContainerNear(table,n){if(!worldOK())return null;if(!LOOT_TABLES[table]){msg('Unknown loot table '+table,false);return null}const x=pl.position.x-Math.sin(yaw)*3,z=pl.position.z-Math.cos(yaw)*3,f=freeSpot(x,z);
 const c=spawnContainer(f[0],f[1],table,groundAt(f[0],f[1],pl.position.y-1.6+.35));c.dev={cols:c.pieces.map(m=>m.material.color.getHex()),name:'dev '+table,spawned:true};clearInv(c.inv);const bad=fillIds(c,rollLoot(table,n));c.dev.init=contIds(c);
 msg('Spawned '+table+' container with '+c.inv.items.length+' item(s)'+(bad.length?' ('+bad.length+' did not fit)':''));return c}
function describeCont(c){const m={};c.inv.items.forEach(q=>{m[q.id]=(m[q.id]||0)+1});return 'container table='+c.table+' at ('+c.x.toFixed(1)+','+c.z.toFixed(1)+') items='+c.inv.items.length+'\n'+Object.keys(m).map(id=>'  '+id+' x'+m[id]+'  ('+(ITEMS[id]?ITEMS[id].name:'MISSING DEFINITION')+')').join('\n')}
function out(t){const e=$('dvOut');if(e)e.textContent=t}
function lootSample(table,n){const t=LOOT_TABLES[table];if(!t)return'unknown table';const ids=Object.keys(t),tot=ids.reduce((a,k)=>a+t[k],0),cnt={};rollLoot(table,n).forEach(id=>{cnt[id]=(cnt[id]||0)+1});
 return 'Loot table "'+table+'": '+n+' rolls (rollLoot, unmodified game probabilities)\nid  count  actual%  expected%\n'+ids.sort((a,b)=>(cnt[b]||0)-(cnt[a]||0)).map(id=>id+'  '+(cnt[id]||0)+'  '+((cnt[id]||0)/n*100).toFixed(1)+'  '+(t[id]/tot*100).toFixed(1)+(ITEMS[id]?'':'  <-- MISSING ITEM')).join('\n')}
function lootCheck(){const r=[];for(const tn in LOOT_TABLES){const t=LOOT_TABLES[tn];if(!Object.keys(t).length)r.push('table '+tn+' is empty');for(const id in t){if(!ITEMS[id])r.push('table '+tn+': unknown item '+id);if(!(t[id]>0)||!isFinite(t[id]))r.push('table '+tn+': bad weight for '+id+' ('+t[id]+')')}}
 LABCAT.forEach(d=>{if(!LOOT_TABLES[d.loot])r.push('building '+d.id+' uses missing loot table '+d.loot)});ITEM_ORDER.forEach(id=>{const it=ITEMS[id];if(!it||!it.name||!it.size||!(it.size[0]>0)||!(it.size[1]>0))r.push('item '+id+' has an invalid definition');else if(!CATS[it.cat])r.push('item '+id+' has category '+it.cat+' that is not in CATS')});
 for(const tn in LOOT_TABLES)if(!LOOT_PROP[tn])r.push('loot table '+tn+' has no container prop in LOOT_PROP (falls back to a crate)');return r}
function giveItem(id,qty){if(!ITEMS[id]){msg('Unknown item id '+id,false);return}qty=Math.max(1,Math.min(500,qty|0||1));let added=0,over=0;
 for(let i=0;i<qty;i++){const q=newInst(id);if(invAdd(PINV,q)){added++;continue}
  if(D.s.unlimited&&playing()){let c=D.overflow.find(k=>inScene(k.group)&&invAdd(k.inv,q));if(!c){c=spawnContainerNear('house',0);if(c){D.overflow.push(c);if(invAdd(c.inv,q))c=c;else c=null}}if(c){over++;added++;continue}}break}
 added<qty?msg('Added '+added+' of '+qty+' x '+ITEMS[id].name+' - player inventory is full'+(D.s.unlimited?'':' (enable Unlimited capacity to overflow into a crate)'),added>0):
  msg('Added '+added+' x '+ITEMS[id].name+' ['+id+']'+(over?' ('+over+' placed in an overflow crate next to you)':''))}
function renderItems(){const L=$('dvItems');if(!L)return;const q=($('dvQ').value||'').toLowerCase().trim(),cat=$('dvCat').value;
 const ids=ITEM_ORDER.filter(id=>{const it=ITEMS[id];return(!cat||it.cat===cat)&&(!q||id.includes(q)||it.name.toLowerCase().includes(q))});
 const H=L.clientHeight,W=L.clientWidth,cols=W>560?2:1,rows=H>0?Math.max(1,Math.floor((H+6)/(50+6))):6,per=rows*cols,pages=Math.max(1,Math.ceil(ids.length/per));D.itemPage=Math.max(0,Math.min(D.itemPage,pages-1));
 L.style.setProperty('--dc',cols);L.innerHTML='';
 ids.slice(D.itemPage*per,D.itemPage*per+per).forEach(id=>{const it=ITEMS[id];const r=document.createElement('div');r.className='dvItem';const th=document.createElement('div');th.className='th';th.appendChild(drawIcon(id,36));
  const t=document.createElement('div');t.className='tx';t.innerHTML='<b>'+esc(it.name)+'</b><small>'+id+' &middot; '+esc(CATS[it.cat]||it.cat)+' &middot; '+it.vh[0]+'x'+it.vh[1]+(it.value?' &middot; '+Object.entries(it.value).map(e=>e[0]+' '+e[1]).join(', '):'')+'</small>';
  const b=document.createElement('button');b.textContent='Add';b.dataset.a='give';b.dataset.id=id;r.append(th,t,b);L.appendChild(r)});
 if(!ids.length)L.innerHTML='<div class="m" style="padding:10px">No items match.</div>';
 $('dvIc').textContent=ids.length+' of '+ITEM_ORDER.length+' items';
 const P=$('dvItemsPg');if(P)P.innerHTML=pages>1?'<button data-a="iPg" data-d="-1"'+(D.itemPage<=0?' disabled':'')+'>&larr; Prev</button><span>Page '+(D.itemPage+1)+' / '+pages+'</span><button data-a="iPg" data-d="1"'+(D.itemPage>=pages-1?' disabled':'')+'>Next &rarr;</button>':''}
/* ---------- time / state ---------- */
function setTime(h){G.time=((h%24)+24)%24;msg('Time set to '+clockStr());syncFields()}
function setDay(d){d=clampN(d,1,14,G.day||1)|0;G.day=d;msg('Day set to '+d+(d>=14?' (siege flag NOT set - use Trigger Siege)':''));syncFields()}
function showScreen(n){if(!D.on){msg('Enable Dev Mode first',false);return}D.open=false;
 if(n==='menu'){G.mode='TITLE';document.exitPointerLock();$('hud').classList.add('hide');ui('menu')}
 else if(n==='options'){G.mode='TITLE';document.exitPointerLock();$('hud').classList.add('hide');openOptions('menu')}
 else if(n==='sel'){G.mode='TITLE';document.exitPointerLock();$('hud').classList.add('hide');ui('sel')}
 else if(n==='hq'){if(!G.day||G.day<1||!HQINV.items.length)initCampaign(D.w.fort);openHQ(false)}
 else if(n==='inv'){if(!playing())loadWh();else ui(null);setTimeout(()=>{if(!invOpen)openInv()},60)}
 else if(n==='cont'){if(!playing()){msg('Load a world that has containers first',false);openPanel();return}const c=nearestCont(8);if(!c){openPanel();return}ui(null);openContainer(c)}
 else if(n==='pause'){ui('pz')}}

/* ---------- overlays ---------- */
const O={root:null,m:{},zb:new Map(),pb:null,lastR:0,reset(){this.root=null;this.m={};this.zb=new Map();this.pb=null;this.lastR=0}};
function oroot(){if(!O.root){O.root=new THREE.Group();O.root.userData={dev:1};scene.add(O.root)}return O.root}
function setLayer(name,obj){const r=oroot(),old=O.m[name];if(old){r.remove(old);old.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()})}
 if(obj){obj.traverse(o=>{o.raycast=()=>{}});r.add(obj);O.m[name]=obj}else delete O.m[name]}
function segs(a,c,op){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:c,transparent:true,opacity:op||.8,depthTest:false}));l.frustumCulled=false;l.renderOrder=8;return l}
const EDG=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
function boxEdges(b,a){const n=b.min,m=b.max,v=[[n.x,n.y,n.z],[m.x,n.y,n.z],[m.x,n.y,m.z],[n.x,n.y,m.z],[n.x,m.y,n.z],[m.x,m.y,n.z],[m.x,m.y,m.z],[n.x,m.y,m.z]];EDG.forEach(e=>a.push(...v[e[0]],...v[e[1]]))}
function ring(a,x,y,z,r){for(let i=0;i<24;i++){const t0=i/24*TAU2,t1=(i+1)/24*TAU2;a.push(x+Math.cos(t0)*r,y,z+Math.sin(t0)*r,x+Math.cos(t1)*r,y,z+Math.sin(t1)*r)}}
function rectEdges(a,x0,x1,z0,z1,y0,y1){boxEdges({min:{x:x0,y:y0,z:z0},max:{x:x1,y:y1,z:z1}},a)}
function layer(name,on,build){if(!on){if(O.m[name])setLayer(name,null);return}setLayer(name,build())}
function refreshLayers(){const s=D.s,p=pl.position,R=45,near=b=>b&&isFinite(b.min.x)&&isFinite(b.max.x)&&b.max.x>p.x-R&&b.min.x<p.x+R&&b.max.z>p.z-R&&b.min.z<p.z+R;
 layer('coll',s.coll,()=>{const a=[];let n=0;for(const b of solids){if(near(b)){boxEdges(b,a);if(++n>5000)break}}return segs(a,0x22d3ee,.55)});
 layer('walk',s.walk,()=>{const a=[];let n=0;for(const b of walkables){if(near(b)){boxEdges(b,a);if(++n>3000)break}}return segs(a,0x22c55e,.6)});
 layer('bb',s.bBounds,()=>{const a=[];buildings.forEach(b=>rectEdges(a,b.x-b.w/2,b.x+b.w/2,b.z-b.d/2,b.z+b.d/2,.05,6));const R2=window.__fortZombieTown;
  if(D.w.kind==='building'&&D.w.info){const P=fakePlot('',D.w.info.front);rectEdges(a,P.x0,P.x1,P.z0,P.z1,.1,.2)}else if(R2&&R2.layout&&D.w.kind==='map')R2.layout.plots.forEach(q=>rectEdges(a,q.x0,q.x1,q.z0,q.z1,.1,.2));return segs(a,0xfb923c,.8)});
 layer('spawns',s.spawns,()=>{const a=[],pt=(x,z,h)=>{a.push(x,0,z,x,h||6,z);ring(a,x,.1,z,.8)};if(D.w.spawn)pt(D.w.spawn[0],D.w.spawn[1]);if(D.w.kind==='map')pt(TRUCK.x,TRUCK.z+6);
  if(D.w.kind==='building'&&D.w.info){pt(D.w.info.entrance[0],D.w.info.entrance[1],4);pt(D.w.info.inside[0],D.w.info.inside[1],4)}
  if(G.mode==='SIEGE'){rectEdges(a,FORT.x-25,FORT.x+25,FORT.z+35,FORT.z+55,.1,.3);rectEdges(a,FORT.x-40,FORT.x-30,FORT.z-10,FORT.z+10,.1,.3);rectEdges(a,FORT.x+30,FORT.x+40,FORT.z-10,FORT.z+10,.1,.3)}return segs(a,0x4ade80,.9)});
 layer('doorR',s.doorR,()=>{const a=[],v=new THREE.Vector3();doors.forEach(d=>{d.sol.getCenter(v);if(Math.hypot(v.x-p.x,v.z-p.z)<R)ring(a,v.x,.1,v.z,3.5)});return segs(a,0xf472b6,.8)});
 layer('lootR',s.lootR,()=>{const a=[];lootConts().forEach(c=>{if(dist2(c.x,c.z)<R)ring(a,c.x,.12,c.z,3.5)});scene.children.forEach(o=>{const c=o.userData&&o.userData.cont;if(c&&c.drop&&dist2(o.position.x,o.position.z)<R)ring(a,o.position.x,.12,o.position.z,3.5)});return segs(a,0xfacc15,.8)});
 layer('labels',s.labels,()=>{const g=new THREE.Group(),v=new THREE.Vector3();let n=0;
  doors.forEach((d,i)=>{d.sol.getCenter(v);if(n<70&&Math.hypot(v.x-p.x,v.z-p.z)<22){label('door#'+i+(d.open?' open':''),'#f472b6',v.x,2.9,v.z,.45,g);n++}});
  lootConts().forEach(c=>{if(n<110&&dist2(c.x,c.z)<22){label((c.dev&&c.dev.name?c.dev.name:c.table)+' x'+c.inv.items.length,'#facc15',c.x,2.6,c.z,.45,g);n++}});
  buildings.forEach(b=>{if(n<140&&dist2(b.x,b.z)<70){label((b.id||b.t)+(b.cond?' ['+b.cond+']':'')+(b.plot!==undefined?' #'+b.plot:''),'#fb923c',b.x,8,b.z,.9,g);n++}});
  zombies.forEach(z=>{if(n<180&&dist2(z.position.x,z.position.z)<22){label((z.userData.devKind||'zombie')+' #'+zid(z),'#ef4444',z.position.x,2.9*z.scale.y,z.position.z,.4,g);n++}});return g})}
function frameLayers(){const s=D.s;
 if(s.hitP){if(!O.pb){O.pb=new THREE.Box3Helper(new THREE.Box3(),0x38bdf8);O.pb.material.depthTest=false;O.pb.raycast=()=>{};oroot().add(O.pb)}
  const p=pl.position,feet=p.y-(G.eyeUsed||1.6),r=G.crouch?.28:.4;O.pb.box.min.set(p.x-r,feet+.4,p.z-r);O.pb.box.max.set(p.x+r,feet+.35+(G.crouch?.85:1.45),p.z+r);O.pb.visible=true}else if(O.pb)O.pb.visible=false;
 if(s.hitZ){const live=new Set();zombies.forEach(z=>{if(dist2(z.position.x,z.position.z)>45)return;live.add(z);let h=O.zb.get(z);if(!h){h=new THREE.Box3Helper(new THREE.Box3(),0xef4444);h.material.depthTest=false;h.raycast=()=>{};oroot().add(h);O.zb.set(z,h)}
   const b=h.box;b.makeEmpty();z.traverse(o=>{if(o.isMesh&&o.visible)b.expandByObject(o)})});
  O.zb.forEach((h,z)=>{if(!live.has(z)){oroot().remove(h);h.geometry.dispose();h.material.dispose();O.zb.delete(z)}})}
 else if(O.zb.size){O.zb.forEach(h=>{oroot().remove(h);h.geometry.dispose();h.material.dispose()});O.zb.clear()}}

/* ---------- diagnostics ---------- */
let fpsAcc=[],lastT=0,diagT=0,layT=0,sceneN=0,sceneT=0;
function diagLines(){const p=pl.position,avg=fpsAcc.length?fpsAcc.reduce((a,b)=>a+b,0)/fpsAcc.length:0,g=D.w.gen;
 return['FPS '+(avg?(1000/avg).toFixed(0):'-')+'  frame '+avg.toFixed(1)+' ms','zombies '+zombies.length+'  buildings '+buildings.length+'  doors '+doors.length,'scene objects '+sceneN+'  solids '+solids.length+'  walkables '+walkables.length,
  'pos '+p.x.toFixed(1)+', '+(p.y-1.6).toFixed(1)+', '+p.z.toFixed(1),'seed '+(D.w.kind==='map'||D.w.kind==='scenario'?D.w.seed:D.w.kind==='building'&&D.w.bld?D.w.bld.seed:'-')+'  world '+(D.w.kind||'none')+(D.w.mode?':'+D.w.mode:''),
  'mode '+G.mode+'  screen '+scrNow,'map gen '+(g?g.ms+' ms':'-')+'  warnings '+(g?g.warnings.length:0)+(D.s.noclip?'  NOCLIP':'')]}
function audit(){const r=[],dup=zombies.length-new Set(zombies).size;if(dup)r.push('FAIL duplicate zombie entries: '+dup);else r.push('ok  no duplicate zombie entries');
 const orph=zombies.filter(z=>z.parent!==scene).length;orph?r.push('FAIL '+orph+' zombie(s) in the list are not in the scene'):r.push('ok  every listed zombie is in the scene');
 const od=doors.filter(d=>!inScene(d.p)).length;od?r.push('FAIL '+od+' door record(s) reference objects outside the scene (stale)'):r.push('ok  all '+doors.length+' doors are in the scene');
 const bs=solids.filter(b=>!b||!isFinite(b.min.x)||!isFinite(b.max.x)||b.isEmpty()).length;bs?r.push('WARN '+bs+' empty/invalid collision boxes'):r.push('ok  '+solids.length+' collision boxes all valid');
 const oc=scene.children.filter(o=>o.userData&&o.userData.kind==='loot').length;r.push('info '+oc+' loot containers in scene, '+lootConts().length+' non-drop');
 const wl=winList.filter(w=>w&&w.p&&!isFinite(w.p.x)).length;wl?r.push('FAIL '+wl+' window records have invalid positions'):r.push('ok  window records valid ('+winList.length+')');
 const grp={};D.genHist.forEach(h=>{const k=h.seed+'/'+h.fort;(grp[k]=grp[k]||[]).push(h)});let mism=0;for(const k in grp){const l=grp[k];if(l.length>1&&l.some(h=>h.objs!==l[0].objs||h.solids!==l[0].solids||h.zombies!==l[0].zombies||h.doors!==l[0].doors)){mism++;r.push('FAIL seed/fort '+k+': regenerations of the same seed differ in object counts (stale objects or non-determinism)')}}
 if(!mism)r.push('ok  regeneration history ('+D.genHist.length+' builds): same-seed builds have identical counts');
 const lc=lootCheck();r.push(lc.length?'WARN '+lc.length+' registry problem(s):\n    '+lc.join('\n    '):'ok  items, loot tables and catalogue loot references are consistent');
 const R=window.__fortZombieTown;if(R&&R.layoutErrors&&R.layoutErrors.length)r.push('FAIL layout errors: '+R.layoutErrors.join('; '));if(window.__catalogueErrors&&window.__catalogueErrors.length)r.push('FAIL catalogue errors: '+window.__catalogueErrors.join('; '));
 if(D.w.gen&&D.w.gen.warnings.length)r.push('WARN generation warnings ('+D.w.gen.warnings.length+'):\n    '+D.w.gen.warnings.slice(0,25).join('\n    '));return r.join('\n')}
function sig(){const R=window.__fortZombieTown||{};return hash32([(R.plan||[]).map(p=>p.id+p.cond+p.front).join(','),buildings.map(b=>b.id+':'+b.x.toFixed(2)+','+b.z.toFixed(2)).join('|'),zombies.map(z=>z.userData.devKind||''+z.position.x.toFixed(2)+','+z.position.z.toFixed(2)+(z.userData.run?'r':'')+(z.userData.big?'b':'')).join('|'),solids.length,doors.length,lootConts().map(c=>c.table+c.inv.items.map(q=>q.id).join('.')).join('|'),TRUCK.x.toFixed(3),scene.children.length].join('#'))}
function detTest(){if(!D.on)enable();const seed=D.w.kind==='map'?D.w.seed:parseSeed($('dvSeed').value),saved=D.w.kind;begin();let a,b,c,e=null;try{buildMapCore(seed);a=sig();buildMapCore(seed);b=sig();buildMapCore((seed+1)>>>0);c=sig()}catch(x){e=x}
 const res=e?'Determinism test errored: '+e.message:'Determinism test (seed '+seed+', fort '+D.w.fort+'): build A '+a+', build B '+b+', different seed '+c+'\n'+(a===b?'PASS - same seed produced an identical map signature (plan, building positions, zombies, loot, collision count).':'FAIL - same seed produced different maps.')+(c===a?'\nWARN different seed gave the same signature (seed may not be used).':'');
 buildMapCore(seed);arrive([TRUCK.x,TRUCK.z+6]);out(res);msg(e?res:a===b?'Determinism PASS':'Determinism FAIL',!e&&a===b);return res}
function debugText(){const p=pl.position,I=D.w.info,L=[];L.push('Fort Zombie Revision '+REV+' debug information','Time: '+new Date().toISOString(),'Dev Mode: '+(D.on?'ON':'off'),'Game mode: '+G.mode+'  screen: '+scrNow+'  world: '+(D.w.kind||'none')+(D.w.mode?' ('+D.w.mode+')':''),
 'Player: '+p.x.toFixed(2)+', '+(p.y-(G.eyeUsed||1.6)).toFixed(2)+', '+p.z.toFixed(2)+'  yaw '+yaw.toFixed(2)+'  hp '+Math.round(G.hp)+'/'+G.maxHp+'  st '+Math.round(G.st),
 'Map seed: '+(D.w.seed||'-')+'  fort setting: '+(D.w.fort),'Building: '+(I&&I.t?I.t.id+' ['+COND_NAMES[I.lv]+'] front '+I.front+' seed '+(D.w.bld?D.w.bld.seed:'-'):'-'),
 'Selected zombie: '+(D.sel?(D.sel.userData.devKind||'zombie')+' #'+zid(D.sel)+' hp '+Math.ceil(D.sel.userData.hp):'-'),'Counts: zombies '+zombies.length+', buildings '+buildings.length+', doors '+doors.length+', solids '+solids.length+', scene objects '+countScene(),
 'Generation: '+(D.w.gen?JSON.stringify(Object.assign({},D.w.gen,{warnings:D.w.gen.warnings.length})):'-'),'Dev settings: '+JSON.stringify(D.s));
 if(D.w.gen&&D.w.gen.warnings.length)L.push('Warnings:',...D.w.gen.warnings.slice(0,30).map(x=>'  - '+x));L.push('Audit:',audit(),'Recent log:',...LOGS.slice(-40));return L.join('\n')}
function fbCopy(t){try{const ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;left:-999px;top:0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();return ok}catch(e){return false}}
function copyDebug(){const t=debugText();D.lastDebug=t;const ta=$('dvDebug');if(ta)ta.value=t;
 const done=ok=>msg(ok?'Debug information copied to the clipboard':'Clipboard unavailable - the text is shown below; select it and copy manually',ok);
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>done(true),()=>done(fbCopy(t)));else done(fbCopy(t))}

/* ---------- saved test scenarios ---------- */
const SKEY='gf_dev_scenarios';
function sLoad(){try{return JSON.parse(localStorage.getItem(SKEY)||'{}')||{}}catch(e){return{}}}
function sSave(o){try{localStorage.setItem(SKEY,JSON.stringify(o));return true}catch(e){return false}}
function capture(){const p=pl.position;return{v:1,rev:REV,w:{kind:D.w.kind,seed:D.w.seed,fort:D.w.fort,mode:D.w.mode,bld:D.w.bld},
 player:{x:p.x,y:p.y-1.6,z:p.z,yaw,pitch,hp:G.hp,maxHp:G.maxHp,st:G.st,eq:PINV.items.indexOf(G.eq)},time:{day:G.day,time:G.time},settings:Object.assign({},D.s),
 inv:PINV.items.map(q=>({id:q.id,x:q.x,y:q.y,rot:q.rot,rem:q.rem,clip:q.clip})),
 zombies:zombies.filter(z=>z.userData.devTest).map(z=>({kind:z.userData.devKind,x:z.position.x,z:z.position.z,hp:z.userData.hp})),
 containers:lootConts().filter(c=>c.dev&&(c.dev.wh||c.dev.spawned)).map(c=>({x:c.x,z:c.z,table:c.table,name:c.dev.name,wh:!!c.dev.wh,ids:contIds(c)})),
 recorded:'world kind/seed/fort, building selection, player position+stats+weapons, PINV items, dev-spawned zombies, warehouse + dev-spawned containers, time/day, dev settings. NOT recorded: map-generated zombies/containers individual state, doors, barricades, survivors.'}}
function sApply(s){if(!s||s.v!==1){msg('Not a valid scenario',false);return}if(!D.on)enable();D.w.fort=s.w.fort||'police';$('dvFort').value=D.w.fort;const w=s.w;
 if(w.kind==='map')loadMap(w.seed);else if(w.kind==='building'&&w.bld)loadBld(w.bld.idx,w.bld.lv,w.bld.front,w.bld.seed);else if(w.kind==='warehouse')loadWh();else if(w.kind==='scenario')scenario(w.mode);else{msg('Scenario has no world to recreate',false);return}
 if(!playing()){msg('World did not start',false);return}
 Object.assign(D.s,DF,s.settings||{});const p=s.player;pl.position.set(p.x,p.y+1.6,p.z);yaw=p.yaw;pitch=p.pitch;pl.rotation.y=yaw;camera.rotation.x=pitch;G.hp=p.hp;G.maxHp=p.maxHp;G.st=p.st;G.day=s.time.day;G.time=s.time.time;
 clearInv(PINV);s.inv.forEach(r=>{const q=newInst(r.id);if(q){q.rem=r.rem;if(r.clip!==undefined)q.clip=r.clip;if(invFits(PINV,q,r.x,r.y,r.rot))invPut(PINV,q,r.x,r.y,r.rot);else invAdd(PINV,q)}});G.eq=(p.eq>=0&&PINV.items[p.eq])||null;
 lootConts().forEach(c=>{const r=s.containers.find(k=>k.wh&&c.dev&&c.dev.wh&&k.name===c.dev.name);if(r)fillIds(c,r.ids)});
 s.containers.filter(k=>!k.wh).forEach(k=>{const c=spawnContainer(k.x,k.z,k.table,0);c.dev={cols:c.pieces.map(m=>m.material.color.getHex()),name:k.name,spawned:true};fillIds(c,k.ids);c.dev.init=k.ids.slice()});
 s.zombies.forEach(r=>{const c0=zombies.length;zombie(r.x,r.z,r.kind,false);if(zombies.length>c0){const q=zombies[zombies.length-1];q.userData.devTest=true;q.userData.devKind=r.kind;if(q.userData.sleep)wakeZ(q);zid(q);baseOf(q);q.userData.hp=r.hp}});
 syncBadge();refreshAll();msg('Scenario loaded ('+s.zombies.length+' zombies, '+s.inv.length+' inventory items, '+s.containers.length+' containers)')}
function renderScen(){const L=$('dvScen');if(!L)return;const all=sLoad(),n=Object.keys(all);L.innerHTML=n.length?n.map(k=>'<div class="icoRow"><b style="flex:1">'+esc(k)+'</b><span class="m">'+esc(all[k].w.kind)+' '+(all[k].w.seed||'')+'</span><button data-a="scLoad" data-n="'+esc(k)+'">Load</button><button data-a="scExp" data-n="'+esc(k)+'">Export</button><button data-a="scDel" data-n="'+esc(k)+'">Delete</button></div>').join(''):'<span class="m">No saved scenarios.</span>'}

/* ---------- wrappers around existing game functions ---------- */
const _uz=updateZombies;updateZombies=function(dt){if(!D.on)return _uz(dt);const s=D.s;
 if(s.pause||s.zFreeze){zombies.forEach(z=>zHpTag(z,false));return}
 /* v076: test-world dummies stand still (they still take hits; a knocked-down or rising one is left to the normal update) */
 let dum=null;if(D.w.dummy){dum=[];zombies=zombies.filter(z=>{const u=z.userData;if(u.dummy&&u.kind==='zombie'&&!(u.ragT>0||u.flop>0||u.rise>0||u.vs)){dum.push(z);return false}return true});
  dum.forEach(z=>{const u=z.userData;u.see=false;u.hunt=0;u.aimG=null;u.lt=0;try{animZ(z,dt,false)}catch(e){}zHpTag(z,false)})}
 if(s.zBeh==='aggressive'){zombies.forEach(z=>{const u=z.userData;if(u.sleep)wakeZ(z);u.see=true;u.hunt=8;u.lx=pl.position.x;u.lz=pl.position.z;u.was=1;u.lk=0;u.lt=1})}
 let held=null;if(s.zBeh==='passive'){held=zombies.slice();zombies=[];held.forEach(z=>{const u=z.userData;if(u.sleep||u.rise>0||u.ragT>0||u.flop>0||u.vs)return;u.see=false;idle(z,dt);animZ(z,dt,false);zHpTag(z,false)})}
 let sp=null;if(s.zBeh==='stationary'){sp=zombies.map(z=>[z,z.userData.sp]);sp.forEach(a=>a[0].userData.sp=0)}
 try{_uz(dt)}finally{if(sp)sp.forEach(a=>{if(a[0].userData)a[0].userData.sp=a[1]})}
 if(dum)zombies=dum.filter(z=>z.userData.kind==='zombie'&&!zombies.includes(z)).concat(zombies);
 if(held){const alive=new Set(held);zombies=zombies.concat(held.filter(z=>!zombies.includes(z)&&z.userData.kind==='zombie'))}
 if(s.zInv)zombies.forEach(z=>{const b=baseOf(z);if(z.userData.hp<b.hpMax)z.userData.hp=b.hpMax})};
const _kz=killZ;killZ=function(z){if(D.on&&D.s.zInv&&!D.force&&z&&z.userData.kind==='zombie'){z.userData.hp=baseOf(z).hpMax;return}return _kz(z)};
const _dis=dismember;dismember=function(z,part,fx,fz){if(D.on&&D.s.zInv&&!D.force)return false;return _dis(z,part,fx,fz)};
const _zh=zHpTag;zHpTag=function(z,h){if(D.on&&(D.s.hpAll||(D.s.hpSel&&D.sel===z))&&z.userData.kind==='zombie'&&!z.userData.sleep){const u=z.userData;let s=u.hpTag;
  if(!s){s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false}));s.renderOrder=6;s.raycast=()=>{};s.position.y=2.25;z.add(s);u.hpTag=s;u.hpV=-1}
  const v=Math.max(0,Math.ceil(u.hp));if(v!==u.hpV){u.hpV=v;s.material.map=numTex(String(v),D.sel===z?'#38bdf8':'#ffe066');s.material.needsUpdate=true}
  const k=Math.max(1,Math.min(2.4,dist2(z.position.x,z.position.z)/12))/z.scale.x;s.scale.set(k,.375*k,1);s.visible=true;return}return _zh(z,h)};
const _dm=damage;damage=function(a){if(!D.on)return _dm(a);if(D.s.pInv)return;if(G.mode==='DEV'){G.hp=Math.max(0,G.hp-a);try{S.hurt()}catch(e){}$('dv').style.opacity=1;setTimeout(()=>$('dv').style.opacity=0,300);
  if(G.hp<=0){G.hp=G.maxHp;G.st=100;if(D.w.spawn){const f=D.w.spawn;pl.position.set(f[0],1.6+groundAt(f[0],f[1],.35),f[1])}toast('[DEV] You died - respawned at the safe spawn')}return}return _dm(a)};
const _at=advanceTime;advanceTime=function(h){if(D.on&&h<.02&&(D.s.pause||(G.mode==='DEV'&&!D.s.timeRun)))return;return _at(h)};
const _uc=updComps;updComps=function(dt){if(D.on&&D.s.pause)return;return _uc(dt)};
const _jp=jump;jump=function(dt){if(D.on&&D.s.noclip)return;return _jp(dt)};
const _sp=showPause;showPause=function(){if(D.on&&(D.opening||G.mode==='DEV')){D.opening=false;openPanel();return}return _sp()};
const _an=animate;animate=function(){let keys=null;const now=performance.now(),dt=Math.min(.1,Math.max(0,(now-lastT)/1000));lastT=now;
 if(D.on&&dt>0){fpsAcc.push(dt*1000);if(fpsAcc.length>40)fpsAcc.shift();
  if(D.s.noclip&&playing()&&!invOpen&&locked&&!wheel){const sp=D.s.fly*(K.ShiftLeft?2.2:1)*dt,fx=-Math.sin(yaw),fz=-Math.cos(yaw),c=Math.cos(pitch),f=(K.KeyW?1:0)-(K.KeyS?1:0),r=(K.KeyD?1:0)-(K.KeyA?1:0),u=(K.Space?1:0)-(K.KeyQ?1:0);
   pl.position.x+=(fx*c*f+Math.cos(yaw)*r)*sp;pl.position.z+=(fz*c*f-Math.sin(yaw)*r)*sp;pl.position.y+=(Math.sin(pitch)*f+u)*sp;G.vy=0;G.crouch=false;G.eyeH=G.eyeUsed=1.6;
   keys={W:K.KeyW,A:K.KeyA,S:K.KeyS,D:K.KeyD,Sp:K.Space};K.KeyW=K.KeyA=K.KeyS=K.KeyD=K.Space=false}}
 _an();
 if(keys){K.KeyW=keys.W;K.KeyA=keys.A;K.KeyS=keys.S;K.KeyD=keys.D;K.Space=keys.Sp}
 if(D.on)post(dt);else diagOnly(dt)};
/* v076: F8 toggles the diagnostic HUD + coordinates in normal play too (no Dev Mode needed; F8 does nothing in the browser). Remembered. */
try{D.diagG=localStorage.getItem('mfz_diagF8')==='1'}catch(e){D.diagG=false}
addEventListener('keydown',e=>{if(e.code!=='F8'||e.repeat)return;e.preventDefault();D.diagG=!D.diagG;try{localStorage.setItem('mfz_diagF8',D.diagG?'1':'0')}catch(_){}if(!D.diagG&&!D.on){const el=$('devDiag');if(el)el.style.display='none'}},true);
let diagOT=0;function diagOnly(dt){if(!D.diagG)return;if(dt>0){fpsAcc.push(dt*1000);if(fpsAcc.length>40)fpsAcc.shift()}sceneT-=dt;if(sceneT<=0){sceneT=1;sceneN=countScene()}
 diagOT-=dt;if(diagOT<=0){diagOT=.25;const el=$('devDiag');if(el){el.style.display='block';el.textContent=diagLines().join('\n')}}}
function post(dt){const s=D.s;if(s.infSt)G.st=100;if(G.mode==='DEV'&&playing()){$('day').textContent='DEV: '+(D.w.kind||'lab').toUpperCase();$('obj').textContent=D.w.kind==='building'&&D.w.info?D.w.info.t.name+' ['+COND_NAMES[D.w.info.lv]+']  -  ` opens the toolkit':'` opens the Dev Toolkit'}
 if(playing()&&!invOpen){layT-=dt;if(layT<=0){layT=.4;refreshLayers()}frameLayers()}
 sceneT-=dt;if(sceneT<=0&&(s.diag||D.open)){sceneT=1;sceneN=countScene()}
 diagT-=dt;if(diagT<=0){diagT=.25;const e=$('devDiag');if(e){const on=(s.diag&&D.on)||D.diagG;e.style.display=on?'block':'none';if(on)e.textContent=diagLines().join('\n')}syncBadge();if(D.open){if(D.tab==='diag'&&D.sub.diag==='live')$('dvLive').textContent=diagLines().join('\n');syncFields()}}}

/* ---------- UI (v070 rebuild) ----------
   Right-hand drawer: category rail + sub-pages, one tool group per page, nothing scrolls. Styling lives in css/ui.css (#dev).
   Panels added by other modules (skills.js, survivors.js, devlineup.js) append to the two hidden inboxes [data-p="state"] and
   [data-p="zomb"]; DEV.adopt() moves each into its own page (anything unknown lands on a "More" page, so nothing is lost). */
const NAV=[
 ['world','World',[['gen','Map'],['tp','Teleport'],['scen','Scenarios']]],
 ['bld','Building',[['insp','Inspector'],['test','Test worlds']]],
 ['items','Items',[['browse','Item browser'],['wh','Warehouse'],['loot','Loot & containers']]],
 ['zomb','Zombies',[['spawn','Spawn & AI'],['sel','Selected'],['styles','FZ styles'],['medic','Medics'],['models','Model line-up']]],
 ['player','Player',[['vit','Vitals & kit'],['skills','Skills'],['occ','Occupation'],['surv','Survivors']]],
 ['time','Time & Weather',[['clock','Clock & campaign'],['wx','Weather']]],
 ['vis','Overlays',[['ov','Debug overlays']]],
 ['diag','Diagnostics',[['live','Live & audit'],['debug','Debug report'],['saved','Saved tests'],['fz','FZ data'],['log','Log']]]];
D.sub={};NAV.forEach(n=>D.sub[n[0]]=n[2][0][0]);D.itemPage=0;
const bt=(a,t,x)=>'<button data-a="'+a+'"'+(x?' '+x:'')+'>'+t+'</button>',ck=(k,t)=>'<label class="dvl"><input type="checkbox" data-k="'+k+'"> '+t+'</label>';
const opt=(l,f)=>l.map(f).join(''),card=(t,h,x)=>'<div class="dvCard'+(x?' '+x:'')+'">'+(t?'<h5>'+t+'</h5>':'')+h+'</div>',row=h=>'<div class="dvRow">'+h+'</div>',
 fl=(l,c)=>'<label class="dvF"><span>'+l+'</span>'+c+'</label>',note=t=>'<div class="dvNote">'+t+'</div>';
const WXL=[['auto','Auto (by day)'],['clear','Clear'],['overcast','Overcast'],['fog','Fog'],['rain','Storm'],['snow','Snow'],['dust','Sandstorm'],['doom','Doom']];
function pageHTML(){const bOpts=opt(LABCAT.map((d,i)=>[d,i]),x=>'<option value="'+x[1]+'">'+esc(x[0].name)+' ('+x[0].id+') ['+x[0].category+']</option>'),
  tOpts=opt(Object.keys(LOOT_TABLES),k=>'<option>'+k+'</option>'),zOpts=opt(Object.keys(ZT),k=>'<option>'+k+'</option>'),fOpts=opt(Object.keys(FORTS),k=>'<option value="'+k+'">'+FORTS[k].n+'</option>'),
  cOpts='<option value="">All categories</option>'+opt(Object.keys(CATS),k=>'<option value="'+k+'">'+CATS[k]+'</option>'),seg=(k,l)=>'<div class="dvSeg" data-wk="'+k+'">'+l.map(x=>bt('wx',x[1],'data-k="'+k+'" data-v="'+x[0]+'"')).join('')+'</div>';
 const P={
 'world/gen':card('Generate a town',row(fl('Seed','<input type="text" id="dvSeed" placeholder="blank = random" style="width:150px">')+fl('Fort setting','<select id="dvFort">'+fOpts+'</select>'))+
   row(bt('mapRandom','Random map','class="priBtn"')+bt('mapSeed','Seed from field')+bt('mapRegen','New seed')+bt('mapSame','Same seed again'))+
   note('The fort setting is part of a seed (School zombies have x1.5 HP). Generation seeds Math.random only while the map is built, so the same seed + fort always gives the same town. Same layout as a normal expedition with no pinned mission.'))+
  card('Last build','<div id="dvGen" class="dvInfo"></div>','grow'),
 'world/tp':card('Quick teleport',row(bt('tpTruck','Truck')+bt('tpFort','Fort')+bt('tpCenter','Map centre')+bt('tpSpawn','Safe spawn')+bt('tpRefresh','Refresh lists')))+
  card('Go to',row('<select id="dvTpB"></select>'+bt('tpB','Building'))+row('<select id="dvTpZ"></select>'+bt('tpZ','Zombie'))+row('<select id="dvTpC"></select>'+bt('tpC','Container')))+
  card('Movement',row(ck('noclip','Noclip / fly')+fl('Fly speed','<input type="number" id="dvFly" value="12" style="width:70px">'))+note('Fly with WASD, Space up, Q down, Shift for speed. Turning noclip off settles you onto safe ground.')),
 'world/scen':card('Test worlds',row(bt('wMap','Random town map')+bt('wLab','Item warehouse')+bt('wBld','Building inspector')))+
  card('Campaign scenarios',row(['CLEAR:Day 1 fort clear','EXPEDITION:Expedition (skip drive)','FORT_BUILD:Fort building','SIEGE:Trigger siege now'].map(x=>bt('sc_'+x.split(':')[0],x.split(':')[1])).join(''))+note('These run the real game code on the sandbox campaign. Your actual campaign is restored when you leave Dev Mode.'))+
  card('Jump to a screen',row(['menu:Main menu','options:Options','sel:Fort selection','hq:Fort HQ','inv:Player inventory','cont:Nearest container','pause:Pause screen'].map(x=>bt('scr_'+x.split(':')[0],x.split(':')[1])).join(''))),
 'bld/test':card('Test worlds',row(bt('twProps','All props','class="priBtn"')+bt('twModels','All models')+bt('twSurv','All survivors')+bt('twZomb','All zombies'))+row(bt('twAI','AI test areas (wall / window / door / upstairs)'))+
   row(bt('twTog','AI on / off')+bt('wpns','Give all weapons + ammo'))+note('Each loads its own test world. Props are lootable. Vehicles, street props and trees are labelled. Survivors are static models with name tags. Zombies are live (shoot, hit, dismember, kill) but their AI is off until you press AI on / off.')),
 'bld/insp':card('Building',row('<select id="dvBld" style="flex:1;min-width:0">'+bOpts+'</select>')+row(fl('Condition','<select id="dvCond">'+opt(COND_NAMES,(c,i)=>'<option value="'+i+'">'+c+'</option>')+'</select>')+fl('Front','<select id="dvFront"><option>south</option><option>north</option></select>')+fl('Seed','<input type="text" id="dvBSeed" value="1" style="width:90px">'))+
   row(bt('bLoad','Load','class="priBtn"')+bt('bPrev','&larr; Previous')+bt('bNext','Next &rarr;')+bt('bReset','Reload'))+row(bt('bExt','Go to entrance')+bt('bInt','Go inside')+bt('bSpawn','Safe spawn'))+
   row(ck('bBounds','Plot bounds')+ck('doorR','Door ranges')+ck('coll','Collision')+ck('noclip','Noclip')))+card('Report','<div id="dvBInfo" class="dvInfo"></div>','grow'),
 'items/browse':card('',row('<input type="text" id="dvQ" placeholder="Search name or id" style="flex:1;min-width:120px"><select id="dvCat">'+cOpts+'</select>'+fl('Qty','<input type="number" id="dvQty" value="1" min="1" max="500" style="width:64px">'))+
   row(ck('unlimited','Overflow into a crate when full')+'<span id="dvIc" class="m" style="margin-left:auto"></span>'))+
  '<div id="dvItems"></div><div id="dvItemsPg" class="pager"></div>'+row(bt('invOpen','Open player inventory')+bt('invClear','Clear inventory')+bt('wpns','Give weapons + ammo')),
 'items/wh':card('Item warehouse',row(bt('whLoad','Load warehouse','class="priBtn"'))+note('One container per item category holding every item in it, labelled in the world. Walk up and press E to open.'))+
  card('Restock',row(bt('whRefill','Refill all')+bt('whReset','Reset all')+bt('whRefillN','Refill nearest')+bt('whResetN','Reset nearest'))+note('Refill only adds what is missing. Reset restores each container to its original contents.')),
 'items/loot':card('Containers',row(fl('Loot table','<select id="dvTbl">'+tOpts+'</select>')+fl('Rolls','<input type="number" id="dvRolls" value="3" style="width:64px">'))+
   row(bt('cSpawn','Spawn near me','class="priBtn"')+bt('cInspect','Inspect nearest')+bt('cRefill','Add loot to nearest')+bt('cReset','Reset nearest')+bt('cOpen','Open nearest')+bt('cSample','Sample table x1000'))+
   row('<input type="text" id="dvKnown" placeholder="Known contents: id, id, id" style="flex:1;min-width:0">'+bt('cKnown','Set nearest')))+card('Result','<pre id="dvOut" class="dvOut">Results appear here.</pre>','grow'),
 'zomb/spawn':card('Spawn',row(fl('Type','<select id="dvZk">'+zOpts+'</select>')+fl('Count','<input type="number" id="dvZn" value="5" min="1" max="100" style="width:64px">')+bt('zSpawn','Spawn','class="priBtn"'))+row(bt('zRemT','Remove test zombies')+bt('zRemA','Remove all')+bt('zKillA','Kill all')))+
  card('Behaviour',row(ck('zFreeze','Freeze AI')+ck('zInv','Invulnerable')+fl('AI mode','<select id="dvBeh" data-k="zBeh"><option>normal</option><option>passive</option><option>aggressive</option><option>stationary</option></select>')))+
  card('Stat multipliers',row(fl('HP x','<input type="number" id="dvHpM" value="1" step="0.1" style="width:70px">')+fl('Damage x','<input type="number" id="dvDmgM" value="1" step="0.1" style="width:70px">')+fl('Speed x','<input type="number" id="dvSpM" value="1" step="0.1" style="width:70px">'))+row(bt('zApply','Apply to all')+bt('zReset','Reset zombies to normal')))+
  card('Labels',row(ck('hpAll','HP over every zombie')+ck('hpSel','HP over the selected one'))),
 'zomb/sel':card('Selected zombie',row('<select id="dvZs" style="flex:1;min-width:0"></select>')+row(bt('zSel','Select')+bt('zTp','Teleport to')+bt('zKill','Kill')+bt('zRem','Remove'))+note('Tip: press ` while looking at a zombie to select it. The list shows the 60 nearest.')),
 'player/vit':card('Vitals',row(fl('Health','<input type="number" id="dvHp" value="100" style="width:70px">')+bt('pHp','Set')+fl('Stamina','<input type="number" id="dvSt" value="100" style="width:70px">')+bt('pSt','Set'))+row(bt('pRestore','Restore health + stamina')+bt('pSafe','Back to safe position'))+row(ck('pInv','Invulnerable')+ck('infSt','Infinite stamina')))+
  card('Kit',row(bt('wpns','Give weapons + ammo')+bt('invOpen','Open inventory')+bt('invClear','Clear inventory'))+note('Weapons are added smallest first until the 16x16 grid is full.')),
 'time/clock':card('Clock',row(fl('Day','<input type="number" id="dvDay" value="1" min="1" max="14" style="width:64px">')+bt('setDay','Set day')+fl('Time (h)','<input type="number" id="dvTime" value="8" step="0.5" style="width:70px">')+bt('setTime','Set time'))+row(bt('t6','Dawn')+bt('t12','Noon')+bt('t19','Dusk')+bt('t23','Night')+ck('timeRun','Clock runs in lab worlds')))+
  card('Sandbox campaign','<div id="dvCamp" class="dvInfo"></div>'+row(bt('freshCamp','Start a fresh Day-1 campaign')))+note('Lighting follows the clock. Setting Day 14 does not start the siege by itself; use Scenarios &rarr; Trigger siege.'),
 'time/wx':card('Weather',seg('weather',WXL))+card('Siege weather (Day 14)',seg('siegeWx',[['doom','Doom'],['same','Same as other days'],['off','Plain']]))+
  card('Weather particles',seg('particles',[[0,'Off'],[1,'Low'],[2,'Medium'],[3,'High']]))+card('Lightning',seg('lightning',[[1,'On'],[0,'Off']]))+note('These are the real game settings (Options &rarr; Graphics) and are saved. Auto picks a different sky for each day of the campaign.'),
 'vis/ov':card('Overlays','<div class="dvGrid2">'+[['hpAll','Zombie HP labels'],['hitP','Player hitbox'],['hitZ','Zombie hitboxes'],['coll','Collision geometry (45 m)'],['walk','Walkable surfaces'],['bBounds','Building / plot bounds'],['spawns','Spawn points'],['doorR','Door range (3.5 m)'],['lootR','Loot range (3.5 m)'],['labels','Labels + internal IDs'],['diag','Diagnostic HUD + coordinates (F8)']].map(x=>ck(x[0],x[1])).join('')+'</div>'+note('Overlays are separate debug objects. They never change real collision data and ignore raycasts.')),
 'diag/live':card('Live metrics','<pre id="dvLive" class="dvOut"></pre>')+card('Checks',row(bt('audit','Run audit')+bt('det','Determinism test')+bt('lootChk','Validate registries')+bt('dResetAll','Reset all dev settings','class="warnBtn"')))+card('Report','<pre id="dvAudit" class="dvOut">Run a check to see its report.</pre>','grow'),
 'diag/debug':card('Debug report',row(bt('copy','Copy debug information','class="priBtn"'))+note('Everything useful for a bug report: mode, world, seed, player, counts, warnings, audit and the recent log.'))+card('','<textarea id="dvDebug" readonly placeholder="The debug text appears here"></textarea>','grow'),
 'diag/saved':card('Save the current test',row('<input type="text" id="dvScName" placeholder="Scenario name" style="flex:1;min-width:0">'+bt('scSave','Save','class="priBtn"')+bt('scImp','Import JSON'))+'<textarea id="dvScJson" rows="2" placeholder="Export / import JSON"></textarea>'+note('Records world kind/seed/fort, building, player position/stats/inventory, dev-spawned zombies and containers, time and dev settings.'))+card('Saved','<div id="dvScen" class="dvOut"></div>','grow'),
 'diag/log':card('',row(bt('logCopy','Copy log')+bt('logClear','Clear log')+'<span class="m">Errors, warnings and every tool result are recorded here.</span>'))+'<pre id="dvLog" class="dvOut grow"></pre>'};
 return P}
function buildUI(){const el=document.createElement('div');el.id='dev';el.className='hide';const P=pageHTML();
 el.innerHTML='<header class="dvHead"><div><div class="kicker">Revision '+REV+'</div><div class="dvTitle">Developer Toolkit</div></div>'+
  '<label class="dvMaster"><input type="checkbox" id="dvMaster"> Dev Mode</label></header>'+
  '<div class="dvBar">'+bt('resume','Return to game','class="priBtn"')+bt('pauseSim','Pause simulation','id="dvPauseB"')+bt('reset','Reset test world')+bt('openOpt','Options')+bt('logGo','Log (0)','id="dvLogB"')+bt('menu','Leave Dev Mode','class="warnBtn"')+'</div>'+
  '<div id="dvMsg">Load a test world from World, Building or Items. Press ` in a test world to open this panel; click the world to resume.</div>'+
  '<div class="dvBody"><nav class="dvRail">'+NAV.map(n=>'<button data-a="tab" data-t="'+n[0]+'">'+n[1]+'</button>').join('')+'</nav>'+
  '<div class="dvMain"><div class="dvSubs"></div><fieldset id="dvFs" class="dvPages">'+NAV.map(n=>n[2].map(s=>{const k=n[0]+'/'+s[0];return '<section class="dvPage hide" data-pg="'+k+'"'+(k==='diag/log'?' id="dvLogW"':'')+'>'+(P[k]||'')+'</section>'}).join('')).join('')+'</fieldset></div></div>'+
  '<div class="dvInbox hide" data-p="state"></div><div class="dvInbox hide" data-p="zomb"></div>';
 document.body.appendChild(el);
 const b=document.createElement('div');b.id='devBadge';document.body.appendChild(b);const dg=document.createElement('div');dg.id='devDiag';document.body.appendChild(dg);
 ['keydown','keyup'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()));el.addEventListener('click',onClick);el.addEventListener('change',onChange);
 el.addEventListener('input',e=>{if(e.target.id==='dvQ'){D.itemPage=0;renderItems()}});
 el.addEventListener('wheel',e=>{const L=$('dvItems');if(L&&L.contains(e.target)){const p=$('dvItemsPg').querySelectorAll('button');if(p.length){e.preventDefault();(e.deltaY>0?p[1]:p[0]).click()}}},{passive:false})}
const ADOPT=[[e=>e.id==='devSk','player/skills'],[e=>/occupation/i.test(h4t(e)),'player/occ'],[e=>/survivor models/i.test(h4t(e)),'player/surv'],[e=>e.id==='devFz','diag/fz'],
 [e=>/fz zombies/i.test(h4t(e)),'zomb/styles'],[e=>e.id==='devMedic','zomb/medic'],[e=>/zombie models/i.test(h4t(e)),'zomb/models']];
function h4t(e){const h=e.querySelector('h4');return h?h.textContent:''}
D.adopt=function(){let n=0;document.querySelectorAll('#dev .dvInbox').forEach(ib=>{const cat=ib.dataset.p==='zomb'?'zomb':'player';
 [...ib.children].forEach(c=>{const hit=ADOPT.find(a=>a[0](c));let key=hit?hit[1]:cat+'/more';let pg=document.querySelector('#dev [data-pg="'+key+'"]');
  if(!pg){const N=NAV.find(x=>x[0]===cat);N[2].push(['more','More']);pg=document.createElement('section');pg.className='dvPage hide';pg.dataset.pg=key;$('dvFs').appendChild(pg)}
  c.classList.add('adopt');pg.appendChild(c);n++})});if(n){log('info','adopted '+n+' module panel(s) into Dev Toolkit pages');if(D.open)refreshAll()}};
D.fit=function(){if(D.open&&D.tab==='items'&&D.sub.items==='browse')renderItems()};
function syncBadge(){const b=$('devBadge');if(!b)return;b.style.display=D.on?'block':'none';if(D.on)b.textContent='DEV MODE'+(D.w.kind?' · '+D.w.kind.toUpperCase():'')+(D.s.noclip?' · NOCLIP':'')+(D.s.pInv?' · GOD':'')+(D.s.pause?' · SIM PAUSED':'')+(D.s.zFreeze?' · AI FROZEN':'')}
function fillSel(id,html){const e=$(id);if(!e)return;const v=e.value;e.innerHTML=html;if([...e.options].some(o=>o.value===v))e.value=v}
function setVal(id,v){const e=$(id);if(e&&document.activeElement!==e)e.value=v}
function syncFields(){setVal('dvDay',G.day||1);setVal('dvTime',(+G.time||0).toFixed(1));setVal('dvHp',Math.round(G.hp));setVal('dvSt',Math.round(G.st));
 setVal('dvHpM',D.s.hpM);setVal('dvDmgM',D.s.dmgM);setVal('dvSpM',D.s.spM);setVal('dvFort',D.w.fort);setVal('dvFly',D.s.fly);
 const c=$('dvCamp');if(c)c.innerHTML=!D.on?'<span class="m">Dev Mode is off.</span>':(D.fresh?'<b>Fresh campaign</b> created by Dev Mode':'<b>Copy of your campaign</b>')+' &middot; '+esc(FORTS[G.fort]?FORTS[G.fort].n:G.fort)+' &middot; Day '+(G.day||0)+' '+(typeof clockStr==='function'?clockStr():'')+' &middot; HP '+Math.round(G.hp)+'/'+G.maxHp+' &middot; '+PINV.items.length+' items carried &middot; '+(G.surv?G.surv.length:0)+' survivors';
 if(window.RGFX)document.querySelectorAll('#dev .dvSeg button').forEach(b=>b.classList.toggle('on',String(RGFX.s[b.dataset.k])===b.dataset.v))}
function showPages(){const N=NAV.find(n=>n[0]===D.tab)||NAV[0];D.tab=N[0];const sub=D.sub[N[0]]||N[2][0][0],key=N[0]+'/'+sub;
 document.querySelectorAll('#dev .dvRail button').forEach(b=>b.classList.toggle('on',b.dataset.t===D.tab));
 const S=document.querySelector('#dev .dvSubs');S.innerHTML=N[2].map(s=>'<button data-a="sub" data-s="'+s[0]+'"'+(s[0]===sub?' class="on"':'')+'>'+s[1]+'</button>').join('');
 document.querySelectorAll('#dev .dvPage').forEach(p=>p.classList.toggle('hide',p.dataset.pg!==key));
 if(key==='diag/log'){const e=$('dvLog');e.textContent=LOGS.join('\n');e.scrollTop=e.scrollHeight}}
function refreshAll(){const m=$('dvMaster');if(!m)return;m.checked=D.on;$('dvFs').disabled=false;
 document.querySelectorAll('#dev [data-k]').forEach(e=>{const k=e.dataset.k;if(!(k in D.s))return;if(e.type==='checkbox')e.checked=!!D.s[k];else e.value=D.s[k]});
 showPages();$('dvPauseB').textContent=D.s.pause?'Resume simulation':'Pause simulation';syncFields();
 const g=D.w.gen,W=g?g.warnings.length:0;$('dvGen').innerHTML=g?'<div class="kv"><span>World</span><b>'+esc(g.kind)+'</b><span>Seed</span><b>'+g.seed+'</b><span>Fort</span><b>'+(g.fort||'-')+'</b><span>Build time</span><b>'+(g.ms?g.ms+' ms':'-')+'</b>'+
  '<span>Buildings</span><b>'+g.buildings+(g.plots!==undefined?' / '+g.plots+' plots':'')+'</b><span>Zombies</span><b>'+g.zombies+'</b><span>Containers</span><b>'+g.containers+'</b><span>Doors</span><b>'+g.doors+'</b><span>Windows</span><b>'+g.windows+'</b><span>Collision boxes</span><b>'+g.solids+'</b><span>Scene objects</span><b>'+g.sceneObjs+'</b></div>'+
  (g.err?'<div class="r">ERROR: '+esc(g.err)+'</div>':'')+(W?'<div class="warn">'+W+' warning(s):</div><div class="m small">'+g.warnings.slice(0,5).map(esc).join('<br>')+(W>5?'<br>+'+(W-5)+' more (Diagnostics &rarr; Debug report)':'')+'</div>':'<div class="g">No placement failures or warnings.</div>'):'<span class="m">No world generated yet.</span>';
 const I=D.w.info;$('dvBInfo').innerHTML=I&&I.t?'<div class="kv"><span>Building</span><b>'+esc(I.t.name)+' ('+I.t.id+')</b><span>Category</span><b>'+I.t.category+'</b><span>Builder</span><b>'+I.t.builder+'</b><span>Loot table</span><b>'+I.t.loot+'</b><span>Condition</span><b>'+COND_NAMES[I.lv]+', front '+I.front+'</b>'+
  '<span>Doors / containers / zombies</span><b>'+doors.length+' / '+lootConts().length+' / '+zombies.length+'</b><span>Entrance</span><b>'+I.entrance.map(v=>v.toFixed(1)).join(', ')+'</b><span>Interior</span><b>'+I.inside.map(v=>v.toFixed(1)).join(', ')+'</b></div>'+
  (I.errors.length?'<div class="warn">Placement problems:</div><div class="m small">'+I.errors.slice(0,5).map(esc).join('<br>')+'</div>':'<div class="g">Placement check OK: geometry inside the plot, front faces the frontage.</div>'):'<span class="m">No building loaded.</span>';
 fillSel('dvTpB',buildings.map((b,i)=>'<option value="'+i+'">'+esc((b.id||b.t)+(b.cond?' ['+b.cond+']':''))+' ('+b.x.toFixed(0)+','+b.z.toFixed(0)+')</option>').join('')||'<option value="">(no buildings)</option>');
 const zl=zombieList();fillSel('dvTpZ',zl.map(z=>'<option value="'+zid(z)+'">'+(z.userData.devKind||z.userData.fzs||'zombie')+' #'+zid(z)+' · hp '+Math.ceil(z.userData.hp)+' · '+dist2(z.position.x,z.position.z).toFixed(0)+' m</option>').join('')||'<option value="">(no zombies)</option>');fillSel('dvZs',$('dvTpZ').innerHTML);
 const lc=lootConts();fillSel('dvTpC',lc.slice().sort((a,b)=>dist2(a.x,a.z)-dist2(b.x,b.z)).slice(0,60).map(c=>'<option value="'+lc.indexOf(c)+'">'+esc((c.dev&&c.dev.name)||c.table)+' x'+c.inv.items.length+' · '+dist2(c.x,c.z).toFixed(0)+' m</option>').join('')||'<option value="">(no containers)</option>');
 if(D.sel&&$('dvZs'))$('dvZs').value=String(zid(D.sel));renderItems();renderScen();syncBadge()}
function openPanel(){D.open=true;D.opening=false;try{D.adopt()}catch(e){}ui('dev');refreshAll()}
function closePanel(){D.open=false;if(playing()){lock();return}if(scrNow==='dev'&&G.mode==='TITLE')openOptions('menu');else ui(null)}
function zByVal(id){return zombies.find(z=>zid(z)===Number(id))}
function onChange(e){const t=e.target;if(t.id==='dvMaster'){if(t.checked){enable();refreshAll()}else if(confirm('Leave Dev Mode? The test world is discarded and the campaign snapshot is restored.'))disable();else t.checked=true;return}
 if(t.id==='dvFort'){D.w.fort=t.value;const nm=FORTS[t.value].n;if(D.on&&D.fresh){freshCampaign(t.value);msg('Fresh Day-1 campaign re-created at '+nm+' (health and starting kit reset)')}else msg('Fort setting '+nm+' is used by the next generated map'+(D.on?'. Your campaign copy keeps its own fort; use Time & Weather > Start a fresh Day-1 campaign to switch fully.':''));refreshAll();return}if(t.id==='dvFly'){D.s.fly=clampN(t.value,1,200,12);return}if(t.id==='dvCat'){D.itemPage=0;renderItems();return}
 const k=t.dataset&&t.dataset.k;if(!k)return;D.s[k]=t.type==='checkbox'?t.checked:t.value;
 if(k==='noclip'){if(!t.checked&&playing())settle();msg('Noclip '+(t.checked?'ON - collision ignored':'OFF - player settled onto safe ground'))}
 if(k==='zBeh'||k==='zFreeze'||k==='zInv'||k==='pInv'||k==='infSt'||k==='pause'||k==='timeRun')msg(k+' = '+D.s[k]);layT=0;refreshAll()}
function bIdx(){return Number($('dvBld').value)||0}
function bLoad(i){const s=parseSeed($('dvBSeed').value);$('dvBSeed').value=String(s);loadBld(i,Number($('dvCond').value)||0,$('dvFront').value,s)}
const ACT={
 logGo:()=>{D.tab='diag';D.sub.diag='log';refreshAll()},sub:b=>{D.sub[D.tab]=b.dataset.s;showPages();syncFields();if(D.tab==='items')renderItems()},
 iPg:b=>{D.itemPage+=Number(b.dataset.d)||0;renderItems()},
 wx:b=>{if(!window.RGFX)return msg('Graphics settings module is not loaded',false);const k=b.dataset.k,v=typeof RGFX.def[k]==='number'?Number(b.dataset.v):b.dataset.v;RGFX.set(k,v);syncFields();msg(k+' set to '+b.textContent+' (saved, same as Options > Graphics)')},
 freshCamp:()=>{if(!confirm('Start a fresh Day-1 campaign at '+FORTS[D.w.fort].n+' inside the sandbox? Inventory, survivors and progress in the sandbox are reset. Your real campaign is untouched.'))return;freshCampaign(D.w.fort);refreshAll();msg('Fresh Day-1 campaign at '+FORTS[G.fort].n+' (same state as New Game)')},logClear:()=>{LOGS.length=0;log('info','log cleared')},
 logCopy:()=>{const t=LOGS.join('\n');$('dvLog').textContent=t;const ok=navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t).then(()=>msg('Log copied'),()=>msg('Clipboard blocked - select the log text and copy it manually',false)):(msg(fbCopy(t)?'Log copied':'Clipboard unavailable - select the log text manually',fbCopy(t)))},
 resume:()=>closePanel(),reset:resetEnv,menu:()=>{if(confirm('Leave Dev Mode and return to the main menu? The test world is discarded and campaign state restored.'))disable()},
 openOpt:()=>{if(typeof openOptions==='function')openOptions('dev')},
 pauseSim:()=>{D.s.pause=!D.s.pause;msg('Simulation '+(D.s.pause?'paused (zombies, survivors and clock)':'resumed'));refreshAll()},
 tab:b=>{D.tab=b.dataset.t;refreshAll()},
 mapRandom:()=>loadMap(parseSeed('')),mapSeed:()=>loadMap(parseSeed($('dvSeed').value)),mapRegen:()=>loadMap(parseSeed('')),mapSame:()=>{if(D.w.kind!=='map'&&!D.w.seed)return msg('No map generated yet',false);loadMap(D.w.seed)},
 tpTruck:()=>{if(!worldOK())return;if(D.w.kind==='map'||G.mode==='EXPEDITION')tp(TRUCK.x,TRUCK.z+6,0,'truck');else msg('This world has no truck',false)},
 tpFort:()=>{if(!worldOK())return;if(G.mode==='DEV'||G.mode==='EXPEDITION')return msg('The fort only exists in the fort scenarios (World > Scenarios)',false);tp(FORT.x,FORT.z+5,0,'fort')},
 tpCenter:()=>{if(!worldOK())return;const R=window.__fortZombieTown;tp(R&&R.layout&&D.w.kind==='map'?(R.layout.bounds.x0+R.layout.bounds.x1)/2:(BND[0]+BND[1])/2,R&&R.layout&&D.w.kind==='map'?(R.layout.bounds.z0+R.layout.bounds.z1)/2:(BND[2]+BND[3])/2,0,'map centre')},
 tpSpawn:()=>{if(!worldOK())return;if(!D.w.spawn)return msg('No safe spawn recorded',false);tp(D.w.spawn[0],D.w.spawn[1],0,'safe spawn')},
 tpRefresh:()=>{refreshAll();msg('Lists refreshed')},
 tpB:()=>{if(!worldOK())return;const b=buildings[Number($('dvTpB').value)];if(!b)return msg('No such building',false);tp(b.x,b.z+b.d/2+3,0,'building '+(b.id||b.t))},
 tpZ:()=>{if(!worldOK())return;const z=zByVal($('dvTpZ').value);if(!z)return msg('Zombie no longer exists',false);tp(z.position.x,z.position.z+2,z.position.y,'zombie')},
 tpC:()=>{if(!worldOK())return;const c=lootConts()[Number($('dvTpC').value)];if(!c)return msg('Container no longer exists',false);tp(c.x,c.z+2,0,'container')},
 twProps:twProps,twModels:twModels,twSurv:twSurvivors,twZomb:twZombies,twAI:twAI,twTog:twToggleAI,
 bLoad:()=>bLoad(bIdx()),bPrev:()=>{$('dvBld').value=String(((bIdx()-1)+LABCAT.length)%LABCAT.length);bLoad(bIdx())},bNext:()=>{$('dvBld').value=String((bIdx()+1)%LABCAT.length);bLoad(bIdx())},
 bReset:()=>{const b=D.w.bld;if(!b)return msg('No building loaded',false);loadBld(b.idx,b.lv,b.front,b.seed)},
 bExt:()=>{const I=D.w.info;if(!I||!worldOK())return;tp(I.entrance[0],I.entrance[1],0,'entrance (exterior)')},bInt:()=>{const I=D.w.info;if(!I||!worldOK())return;tp(I.inside[0],I.inside[1],0,'interior')},bSpawn:()=>ACT.tpSpawn(),
 whLoad:loadWh,whRefill:()=>{let n=0;lootConts().forEach(c=>{if(c.dev&&c.dev.wh){const have=new Set(contIds(c));c.dev.ids.forEach(id=>{if(!have.has(id)){const q=newInst(id);if(invAdd(c.inv,q))n++}});recolor(c)}});msg('Refill added '+n+' missing item(s) to warehouse containers')},
 whReset:()=>{let n=0;lootConts().forEach(c=>{if(c.dev&&c.dev.wh){fillIds(c,c.dev.ids);n++}});n?msg('Reset '+n+' warehouse containers to full contents'):msg('Load the warehouse first',false)},
 whRefillN:()=>{const c=nearestCont();if(!c)return;if(c.dev&&c.dev.ids){const have=new Set(contIds(c));c.dev.ids.forEach(id=>{if(!have.has(id))invAdd(c.inv,newInst(id))});recolor(c)}else{rollLoot(c.table,ri(1,3)).forEach(id=>invAdd(c.inv,newInst(id)));recolor(c)}msg('Refilled nearest container')},
 whResetN:()=>ACT.cReset(),
 give:b=>giveItem(b.dataset.id,Number($('dvQty').value)||1),invOpen:()=>{if(!worldOK())return;showScreen('inv')},invClear:()=>{if(confirm('Clear the player test inventory?')){clearInv(PINV);msg('Player inventory cleared')}},
 wpns:()=>{let n=0;const ids=ITEM_ORDER.filter(id=>ITEMS[id].cat==='ammo').concat(ITEM_ORDER.filter(id=>WDEF[id]).sort((a,b)=>ITEMS[a].size[0]*ITEMS[a].size[1]-ITEMS[b].size[0]*ITEMS[b].size[1]));ids.forEach(id=>{if(addItem(id))n++});msg('Gave '+n+' of '+ids.length+' weapon/ammo items (inventory is 16x16)')},
 cSpawn:()=>{spawnContainerNear($('dvTbl').value,Math.max(0,Number($('dvRolls').value)|0));refreshAll()},cInspect:()=>{const c=nearestCont();if(c)out(describeCont(c))},
 cRefill:()=>{const c=nearestCont();if(!c)return;initOf(c);const bad=[];rollLoot(c.table,Math.max(1,Number($('dvRolls').value)|0)).forEach(id=>{if(!invAdd(c.inv,newInst(id)))bad.push(id)});recolor(c);out(describeCont(c));msg('Added loot from table '+c.table+(bad.length?' ('+bad.length+' did not fit)':''))},
 cReset:()=>{const c=nearestCont();if(!c)return;if(!c.dev||!c.dev.init)return msg('This container has no recorded initial contents (dev tools have not modified it yet)',false);const bad=fillIds(c,c.dev.init);out(describeCont(c));msg('Container reset to its initial contents'+(bad.length?' ('+bad.length+' failed)':''))},
 cOpen:()=>showScreen('cont'),
 cKnown:()=>{const c=nearestCont();if(!c)return;const ids=$('dvKnown').value.split(/[\s,]+/).filter(Boolean),bad=ids.filter(id=>!ITEMS[id]);if(bad.length)return msg('Unknown item id(s): '+bad.join(', '),false);initOf(c);const f=fillIds(c,ids);out(describeCont(c));msg('Container set to '+ids.length+' known item(s)'+(f.length?' ('+f.length+' did not fit)':''))},
 cSample:()=>{out(lootSample($('dvTbl').value,1000));msg('Sampled loot table '+$('dvTbl').value)},
 zSpawn:()=>spawnZ($('dvZk').value,Math.max(1,Math.min(100,Number($('dvZn').value)|0||1))),zRemT:()=>removeZ(zombies.filter(z=>z.userData.devTest),'test zombie(s)'),
 zRemA:()=>{if(zombies.length&&confirm('Remove all '+zombies.length+' zombies from the world?'))removeZ(zombies.slice(),'zombie(s)')},zKillA:()=>killZs(zombies),
 zApply:applyAllStats,zReset:resetStats,zSel:()=>{const z=zByVal($('dvZs').value);if(!z)return msg('Zombie no longer exists',false);D.sel=z;msg('Selected '+(z.userData.devKind||'zombie')+' #'+zid(z))},
 zTp:()=>{if(!worldOK())return;const z=zByVal($('dvZs').value);if(!z)return msg('Zombie no longer exists',false);D.sel=z;tp(z.position.x,z.position.z+2,z.position.y,'zombie')},
 zKill:()=>{if(!D.sel||!zombies.includes(D.sel))return msg('No selected zombie',false);killZs([D.sel])},zRem:()=>{if(!D.sel||!zombies.includes(D.sel))return msg('No selected zombie',false);removeZ([D.sel],'selected zombie')},
 pHp:()=>{G.hp=clampN($('dvHp').value,1,G.maxHp,G.hp);msg('Health set to '+G.hp)},pSt:()=>{G.st=clampN($('dvSt').value,0,100,G.st);msg('Stamina set to '+G.st)},
 pRestore:()=>{G.hp=G.maxHp;G.st=100;msg('Health and stamina restored')},pSafe:()=>{if(!worldOK())return;if(D.w.spawn)tp(D.w.spawn[0],D.w.spawn[1],0,'safe spawn');else{settle();msg('Settled onto safe ground')}},
 wMap:()=>loadMap(parseSeed($('dvSeed').value)),wLab:loadWh,wBld:()=>bLoad(bIdx()),
 setDay:()=>setDay($('dvDay').value),setTime:()=>setTime(Number($('dvTime').value)||0),t6:()=>setTime(6),t12:()=>setTime(12),t19:()=>setTime(19),t23:()=>setTime(23),
 audit:()=>{const e=$('dvAudit');e.classList.remove('hide');e.textContent=audit();msg('Audit finished (see report)')},det:()=>{const e=$('dvAudit');e.classList.remove('hide');e.textContent=detTest()},
 lootChk:()=>{const r=lootCheck(),e=$('dvAudit');e.classList.remove('hide');e.textContent=r.length?r.join('\n'):'OK: all loot tables, catalogue loot references and item definitions are valid';msg(r.length?r.length+' registry problem(s)':'registries valid',!r.length)},
 copy:copyDebug,dResetAll:()=>{if(D.s.noclip&&playing())settle();D.s=Object.assign({},DF);zombies.forEach(z=>{const b=baseOf(z),u=z.userData;u.hp=b.hp0;u.sp=b.sp0;u.dmg=b.dmg0;b.hpMax=b.hp0});if(D.base){G.hp=D.base.hp;G.maxHp=D.base.maxHp;G.st=D.base.st}layT=0;refreshAll();msg('All developer settings and test modifications reset to defaults')},
 scSave:()=>{const n=($('dvScName').value||'').trim();if(!n)return msg('Enter a scenario name',false);if(!playing()||!D.w.kind)return msg('Load a test world first',false);const a=sLoad();a[n]=capture();sSave(a)?msg('Scenario "'+n+'" saved (separate storage key '+SKEY+')'):msg('Could not write localStorage',false);renderScen()},
 scLoad:b=>{const s=sLoad()[b.dataset.n];s?sApply(s):msg('Scenario not found',false)},scExp:b=>{const s=sLoad()[b.dataset.n];if(s){$('dvScJson').value=JSON.stringify(s);msg('Scenario JSON placed in the box')}},
 scDel:b=>{if(!confirm('Delete scenario "'+b.dataset.n+'"?'))return;const a=sLoad();delete a[b.dataset.n];sSave(a);renderScen();msg('Scenario deleted')},
 scImp:()=>{try{const s=JSON.parse($('dvScJson').value);const n=($('dvScName').value||'imported').trim();const a=sLoad();a[n]=s;sSave(a);renderScen();msg('Imported as "'+n+'"')}catch(e){msg('Invalid JSON: '+e.message,false)}}};
['menu','options','sel','hq','inv','cont','pause'].forEach(n=>ACT['scr_'+n]=()=>showScreen(n));['CLEAR','EXPEDITION','FORT_BUILD','SIEGE'].forEach(m=>ACT['sc_'+m]=()=>{if(m==='SIEGE'&&!confirm('Start the siege now? (runs in the dev sandbox)'))return;scenario(m)});
function onClick(e){const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const f=ACT[b.dataset.a];if(!f){log('ERROR','no handler for action '+b.dataset.a);return}log('click',b.dataset.a);try{if(!D.on&&!/^(tab|sub|wx|iPg|log.*)$/.test(b.dataset.a))enable();f(b)}catch(err){log('EXCEPTION',b.dataset.a+': '+(err.stack||err.message).split('\n').slice(0,4).join(' | '));msg(b.dataset.a+' failed: '+err.message+' (see Log)',false)}}

/* ---------- entry points ---------- */
window.devOpen=function(){try{S.ui()}catch(e){log('ERROR','S.ui '+e.message)}try{if(!D.on)enable();openPanel()}catch(e){log('EXCEPTION','devOpen: '+(e.stack||e.message))}};
addEventListener('keydown',e=>{if(e.code!=='Backquote'||!D.on)return;const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT')return;e.preventDefault();e.stopPropagation();
 if(D.open){closePanel();return}
 if(playing()&&!invOpen){try{const h=look(false);if(h&&h.o&&h.o.userData&&h.o.userData.kind==='zombie')D.sel=h.o}catch(x){}D.opening=true;document.exitPointerLock();setTimeout(()=>{if(D.opening){D.opening=false;if(!D.open)openPanel()}},150)}
 else if(scrNow==='menu'||scrNow==='opt')openPanel()},true);
buildUI();
})();

