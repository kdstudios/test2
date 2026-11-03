/* ==========================================================================================================
   MINI FORT ZOMBIE - MELEE RANGE CROSSHAIR + DEV LINE-UPS (v068)
   - The crosshair ring fills red while a zombie is inside the reach of your current melee attack (the same test melee() uses:
     within reach and in front of you), whatever the field of view.
   - Dev Mode > Zombies & Combat > Zombie models: line up every zombie outfit model, each with its name above it.
   - Dev Mode > State > Survivor models: the survivor line-ups now carry name tags, and a drop-down spawns any survivor next to you,
     already recruited (at the fort they join the fort; on a mission they follow you and join when you get back).
   ========================================================================================================== */
(function(){
'use strict';
const T=THREE;
/* ---------------- melee range crosshair ---------------- */
const xh=document.getElementById('xh');
function inReach(){
 if(typeof G==='undefined'||typeof zombies==='undefined'||!zombies.length||typeof pl==='undefined')return false;
 if(!/^(EXPEDITION|FORT_BUILD|SIEGE|CLEAR)$/.test(G.mode))return false;
 const w=G.eq,d0=w?WDEF[w.id]:FIST,d=d0&&d0.type==='gun'?BASH:(d0||FIST),reach=d.reach||2.2;
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw),px=pl.position.x,pz=pl.position.z,py=pl.position.y;
 if(typeof meleeTarget==='function')return !!meleeTarget(reach);   // v072: exactly the test melee() uses (3D reach + walls)
 for(const z of zombies){const u=z.userData;if(!u||u.hp<=0)continue;const dx=z.position.x-px,dz=z.position.z-pz,l=Math.hypot(dx,dz);
  if(l<reach&&l>1e-4&&(dx*fx+dz*fz)/l>.5&&Math.abs(z.position.y-(py-(G.eyeUsed||1.6)))<2)return true}
 return false}
let red=-1;
// v069: the stealth eye sits over the crosshair, so its pupil and iris turn red too
function eye(r){const e=document.getElementById('stEye');if(!e)return;for(const c of e.querySelectorAll('#stOpen circle'))c.getAttribute('fill')==='none'?c.setAttribute('stroke',r?'#ef4444':'#fff'):c.setAttribute('fill',r?'#ef4444':'#fff');
 const sh=e.querySelector('#stShut');if(sh)for(const q of sh.querySelectorAll('path'))q.setAttribute('stroke',r?'#ef4444':'#fff')}
function tick(){try{if(xh){const r=inReach()?1:0;if(r!==red){red=r;xh.style.borderColor=r?'#ef4444':'#fff';xh.style.background=r?'#ef4444':'transparent';xh.style.boxShadow=r?'0 0 6px #ef4444':'none';eye(r)}}}catch(e){}requestAnimationFrame(tick)}
requestAnimationFrame(tick);
/* ---------------- name tags ---------------- */
function tag(text,col){const cv=document.createElement('canvas'),c=cv.getContext('2d');c.font='bold 26px Arial,sans-serif';const w=Math.ceil(c.measureText(text).width)+20;cv.width=w;cv.height=38;
 c.font='bold 26px Arial,sans-serif';c.fillStyle='rgba(0,0,0,.55)';c.fillRect(0,0,w,38);c.fillStyle=col||'#fff';c.textBaseline='middle';c.fillText(text,10,20);
 const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),transparent:true,depthTest:false}));sp.scale.set(w/38*.16,.16,1);sp.renderOrder=6;sp.raycast=()=>{};return sp}
function tagAbove(g,text,col,h){const s=tag(text,col);const sc=g.scale.x||1;s.position.set(0,(h||2.05)/sc,0);s.scale.multiplyScalar(1/sc);g.add(s);return s}
window.MFZTAG=tagAbove;
/* ---------------- survivor line-up: name tags + spawn any survivor ---------------- */
const SV=window.RGSURV;
if(SV&&window.RSURV){
 const _gal=SV.gallery;
 SV.gallery=function(list){const out=_gal.apply(this,arguments);const ids=list||Object.keys(RSURV.D);
  out.forEach((g,i)=>{const id=ids[i],c=(typeof FZ!=='undefined'&&FZ.cfg&&FZ.cfg.chars&&FZ.cfg.chars[id])||null,d=RSURV.D[id]||RSURV.ARCH[id];
   const name=c?c.n:d&&(d.n||d.l)||id;tagAbove(g,name,RSURV.ARCH[id]?'#facc15':'#fff')});return out};
 const charName=id=>{const c=typeof FZ!=='undefined'&&FZ.cfg&&FZ.cfg.chars&&FZ.cfg.chars[id];return c?c.n:(RSURV.D[id]&&RSURV.D[id].n)||id};
 SV.recruit=function(id){
  if(typeof G==='undefined'||!/^(EXPEDITION|FORT_BUILD|HQ_MENU|CLEAR)$/.test(G.mode)){toast('Start a game first');return null}
  if(G.surv.some(s=>s.fz===id)||(typeof comps!=='undefined'&&comps.some(c=>c.s&&c.s.fz===id))){toast(charName(id)+' is already with you');return null}
  if(G.mode!=='EXPEDITION'&&G.surv.length>=16){toast('The fort is full (16 survivors)');return null}
  // force this id even if they were met before in this run
  const used=G.fzUsed||[],i=used.indexOf(id);if(i>=0)used.splice(i,1);window.__fzNext=id;
  const sv=typeof fzSurvivor==='function'?fzSurvivor():null;if(!sv||sv.fz!==id){toast('Could not create '+charName(id));return null}
  const a=yaw,x=pl.position.x-Math.sin(a)*2.5,z=pl.position.z-Math.cos(a)*2.5;
  if(G.mode==='EXPEDITION'){spawnComp(sv,x,z);toast(sv.name+' will follow you (joins at the truck)');return sv}
  delete sv.pending;G.surv.push(sv);if(typeof fzJoined==='function')fzJoined(sv);
  // build just this survivor's model at the fort
  const keep=G.surv;G.surv=[sv];try{survMeshes()}finally{G.surv=keep}
  const m=smesh.find(q=>q.userData.s===sv);if(m){m.position.set(x,m.position.y,z);sv.px=x;sv.pz=z;if(m.userData.nf)m.userData.nf.home={x,z}}
  toast(sv.name+' joined the fort');return sv};
 const dv=document.querySelector('#dev [data-p="state"]'),btnRow=document.getElementById('svGal');
 if(dv){const w=document.createElement('div');w.className='row';w.style.marginTop='4px';
  const ids=Object.keys(RSURV.D).filter(k=>typeof FZ==='undefined'||!FZ.cfg||!FZ.cfg.chars||FZ.cfg.chars[k]||/^npc_(Miller|Aris)$/.test(k));
  const sorted=ids.slice().sort((a,b)=>charName(a).localeCompare(charName(b)));
  w.innerHTML='<select id="svPick">'+sorted.map(k=>`<option value="${k}">${charName(k)}</option>`).join('')+'</select><button id="svSpawn" style="background:#14532d">Spawn + recruit</button>';
  const host=btnRow&&btnRow.closest('div')?btnRow.closest('div').parentNode:dv;host.appendChild(w);
  // names fill in once the Fort Zombie data is there
  setTimeout(()=>{const s=document.getElementById('svPick');if(s)for(const o of s.options)o.textContent=charName(o.value)},1500);
  document.getElementById('svSpawn').onclick=()=>SV.recruit(document.getElementById('svPick').value)}}
/* ---------------- zombie model line-up ---------------- */
const ZL={shown:[]};
ZL.styles=function(){const O=window.RZO||{};return['(plain)'].concat(Object.keys(O))};
ZL.show=function(){ZL.clear();if(!window.RZ||typeof scene==='undefined'||typeof pl==='undefined')return;
 const list=ZL.styles(),per=10,a=yaw,fx=-Math.sin(a),fz=-Math.cos(a),rx=Math.cos(a),rz=-Math.sin(a),cx=pl.position.x+fx*5,cz=pl.position.z+fz*5;
 list.forEach((st,i)=>{const g=new T.Group(),col=i%per,row=Math.floor(i/per),off=(col-(per-1)/2)*1.05;
  g.position.set(cx+rx*off+fx*row*1.8,0,cz+rz*off+fz*row*1.8);g.rotation.y=a;
  try{const fo=window.FZS;window.FZS=null;RZ.makeRZ({zombie:1,style:st==='(plain)'?'':st},g);window.FZS=fo}catch(e){console.warn('[lineup] zombie',st,e);return}
  g.userData.gallery=1;scene.add(g);tagAbove(g,st,'#fca5a5',2.1);ZL.shown.push(g)});
 toast(ZL.shown.length+' zombie models lined up in front of you')};
ZL.clear=function(){for(const g of ZL.shown)if(g.parent)g.parent.remove(g);ZL.shown=[]};
window.MFZZL=ZL;
(function(){const dv=document.querySelector('#dev [data-p="zomb"]');if(!dv)return;const w=document.createElement('div');
 w.innerHTML='<h4>Zombie models (v068)</h4><div class="row"><button id="zlShow" style="background:#7f1d1d">Line up every zombie model</button><button id="zlClr">Clear line-up</button></div><div class="m">Static models (no AI), one per outfit, name above each.</div>';dv.appendChild(w);
 document.getElementById('zlShow').onclick=()=>ZL.show();document.getElementById('zlClr').onclick=()=>ZL.clear()})();
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){ZL.shown=[];return _cw.apply(this,arguments)}}
console.log('[devlineup] melee-range crosshair, zombie line-up, survivor spawner');
})();
