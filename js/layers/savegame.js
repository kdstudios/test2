/* ==========================================================================================================
   MINI FORT ZOMBIE - SAVE / LOAD (v067)
   Saves the run to a .sav file you choose (Chrome / Edge open a real "Save as" window; other browsers download it), and loads it back
   from Fort HQ > Paused or the main menu. Saving only works at the fort (not on a mission or in the siege).
   The file is small readable JSON with only basic data - ids and numbers, never models or code - so saves keep working across versions:
     header        format "mfz-save", fv (file layout version, bumped only if the layout changes, with a converter), game version, date
     run           day, time, fort, siege due, kills, rescued, recruited ids, trip hours, companion orders, player name / hp / stamina
     map           town map (seed, fort icon), today's pins, selected pin
     player        skills + occupation, inventory grid, equipped item
     hq            Fort HQ inventory grid (food, materials, meds, weapons and ammo all live here as items)
     survivors     every survivor at the fort: id, name, role, hp, morale, hunger, skills, relations ... + their inventory grid + equipped item
     fort          barricades (position, rotation, health)
   Loading is forgiving: ids renamed in a later version go through ALIAS, unknown items are skipped (and listed), an item that no longer
   fits its saved cell goes to the first free cell. An autosave slot in the browser is written every time you arrive at the fort.
   ========================================================================================================== */
(function(){
'use strict';
const FORMAT='mfz-save',FV=1,AUTO='mfz_autosave';
const SV=window.MFZSAVE={FV};
/* renamed ids: old -> new. Add a line here whenever an item or character id changes, and old saves keep loading. */
const ALIAS={items:{},chars:{start_Miller:'npc_Miller',start_Aris:'npc_Aris'}};
/* file layout converters: CONV[n] turns a version-n save into version n+1 */
const CONV={};
const gameVer=()=>{const m=document.title.match(/v(\d{3})/);return m?m[1]:(typeof VERSION!=='undefined'?VERSION:'?')};
const pad=n=>String(n).padStart(2,'0');
/* ---------------- serialise ---------------- */
function prim(o,skip){const r={};for(const k in o){if(skip&&skip.includes(k))continue;const v=o[k];if(v===null||['number','string','boolean'].includes(typeof v))r[k]=v}return r}
function plain(v,depth=0){                                        // JSON-safe deep copy (drops 3D objects, functions, inventories, cycles)
 if(v===null||typeof v!=='object')return typeof v==='function'?undefined:v;if(depth>6||v.isObject3D||v instanceof Node)return undefined;
 if(Array.isArray(v))return v.map(x=>plain(x,depth+1)).filter(x=>x!==undefined);
 const r={};for(const k in v){if(k==='invc'||k==='eq'||k==='m'||k==='mesh'||k.startsWith('_'))continue;const x=plain(v[k],depth+1);if(x!==undefined)r[k]=x}return r}
function invDump(inv){return{w:inv.w,h:inv.h,items:inv.items.map(q=>prim(q))}}
function canSave(){return typeof G!=='undefined'&&(G.mode==='FORT_BUILD'||G.mode==='HQ_MENU')&&!(typeof comps!=='undefined'&&comps.length&&G.mode==='EXPEDITION')}
function build(){
 const s={format:FORMAT,fv:FV,game:gameVer(),saved:new Date().toISOString(),
  run:{day:G.day,time:G.time,fort:G.fort,siegeDue:!!G.siegeDue,kills:G.kills||0,rescued:G.rescued||0,fzUsed:(G.fzUsed||[]).slice(),tripH:G.tripH||0,uRange:G.uRange,uFollow:G.uFollow,
   name:G.name||'',hp:G.hp,maxHp:G.maxHp,st:G.st,skill:G.skill},
  map:{tmap:plain(G.tmap||null),pins:plain(G.pins||[]),pinsDay:G.pinsDay},
  player:{sk:plain(G.sk||null),skQ:plain(G.skQ||[]),inv:invDump(PINV),eq:G.eq?G.eq.uid:null},
  hq:invDump(HQINV),
  survivors:(G.surv||[]).filter(sv=>sv.hp>0).map(sv=>{const iv=typeof svInv==='function'?svInv(sv).inv:null;return{data:plain(sv),inv:iv?invDump(iv):null,eq:sv.eq?sv.eq.uid:null}}),
  fort:{bars:(G.bars||[]).map(b=>({x:b.x,z:b.z,hp:Math.round(b.hp),ry:b.ry||0}))},
  uid:typeof uidCounter!=='undefined'?uidCounter:1};
 return s}
function fileName(){return`MFZ_Day${pad(G.day)}_${pad(Math.floor(G.time))}${pad(Math.round((G.time%1)*60)%60)}.sav`}
SV.save=async function(){
 if(!canSave()){toast('You can only save at the fort.');return false}
 const txt=JSON.stringify(build(),null,1),blob=new Blob([txt],{type:'application/json'}),name=fileName();
 try{if(window.showSaveFilePicker){const h=await showSaveFilePicker({suggestedName:name,types:[{description:'Mini Fort Zombie save',accept:{'application/json':['.sav']}}]});const w=await h.createWritable();await w.write(blob);await w.close();toast('Game saved: '+(h.name||name));return true}}
 catch(e){if(e&&e.name==='AbortError')return false;console.warn('[save] picker failed, downloading instead',e)}
 if(typeof saveBlob==='function')saveBlob(blob,name);else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}
 toast('Game saved: '+name);return true};
SV.autosave=function(){try{if(!canSave())return;localStorage.setItem(AUTO,JSON.stringify(build()))}catch(e){}};
SV.hasAuto=function(){try{const t=localStorage.getItem(AUTO);if(!t)return null;const s=JSON.parse(t);return s&&s.format===FORMAT?s:null}catch(e){return null}};
/* ---------------- load ---------------- */
function upgrade(s){let v=s.fv|0;while(v<FV&&CONV[v]){s=CONV[v](s);v++;s.fv=v}return s}
function itemId(id){let k=0;while(ALIAS.items[id]&&k++<8)id=ALIAS.items[id];return id}
function charId(id){let k=0;while(id&&ALIAS.chars[id]&&k++<8)id=ALIAS.chars[id];return id}
function invLoad(inv,dump,lost){inv.items.length=0;inv.g=makeGrid(inv.w,inv.minH||inv.h);inv.h=inv.minH||inv.h;const byUid={};
 const list=(dump&&dump.items||[]).slice().sort((a,b)=>(a.y-b.y)||(a.x-b.x));
 for(const d of list){const id=itemId(d.id);if(!ITEMS[id]){lost.push(d.id);continue}
  const q=newInst(id);if(!q)continue;for(const k in d)if(k!=='id'&&k!=='uid'&&k!=='x'&&k!=='y'&&k!=='rot')q[k]=d[k];q.uid=d.uid!=null?d.uid:q.uid;
  if(invFits(inv,q,d.x|0,d.y|0,!!d.rot))invPut(inv,q,d.x|0,d.y|0,!!d.rot);else if(!invAdd(inv,q)){lost.push(id+' (no room)');continue}
  byUid[q.uid]=q}
 if(typeof invTrim==='function')invTrim(inv);return byUid}
function apply(s){
 const lost=[],R=s.run||{};
 // run
 G.fort=FORTS[R.fort]?R.fort:'police';G.day=R.day||1;G.time=R.time!=null?R.time:8;G.siegeDue=!!R.siegeDue;G.kills=R.kills||0;G.rescued=R.rescued||0;
 G.fzUsed=(R.fzUsed||[]).map(charId);G.tripH=R.tripH||0;if(R.uRange!=null)G.uRange=R.uRange;if(R.uFollow!=null)G.uFollow=R.uFollow;if(R.name)G.name=R.name;
 G.maxHp=R.maxHp||Math.round(100*FORTS[G.fort].hp);G.hp=Math.min(G.maxHp,R.hp!=null?R.hp:G.maxHp);G.st=R.st!=null?R.st:100;if(R.skill!=null)G.skill=R.skill;
 G.rl=0;G.draw=0;G.act=null;G.mission=null;G.hqPause=false;G.spikes=[];
 try{$('fn').textContent='HQ: '+FORTS[G.fort].n.toUpperCase()}catch(e){}
 // map
 const M=s.map||{};G.tmap=M.tmap||null;G.pins=Array.isArray(M.pins)?M.pins:null;G.pinsDay=M.pinsDay;
 // inventories
 const pl0=s.player||{};const pu=invLoad(PINV,pl0.inv,lost);G.eq=pl0.eq!=null&&pu[pl0.eq]?pu[pl0.eq]:null;
 invLoad(HQINV,s.hq,lost);
 G.sk=pl0.sk||null;G.skQ=pl0.skQ||[];try{skOf(G)}catch(e){}
 // survivors
 G.surv=[];
 for(const e of(s.survivors||[])){const d=e.data||{};if(!d.name)continue;const sv=Object.assign({},d);if(sv.fz)sv.fz=charId(sv.fz);delete sv.pending;
  try{const iv=svInv(sv).inv;const su=invLoad(iv,e.inv,lost);sv.eq=e.eq!=null&&su[e.eq]?su[e.eq]:null}catch(err){}
  try{skOf(sv)}catch(err){}G.surv.push(sv)}
 // fort
 G.bars=((s.fort&&s.fort.bars)||[]).filter(b=>isFinite(b.x)&&isFinite(b.z)).map(b=>({x:b.x,z:b.z,hp:Math.max(1,Math.min(100,b.hp||100)),ry:b.ry||0}));
 // ids: never reuse a saved uid
 let mx=s.uid||1;for(const inv of[PINV,HQINV].concat(G.surv.map(sv=>svInv(sv).inv)))for(const q of inv.items)mx=Math.max(mx,(q.uid|0)+1);uidCounter=mx;
 return lost}
function summary(s){const R=s.run||{},n=(s.survivors||[]).length,t=R.time||0;return`Day ${R.day} · ${pad(Math.floor(t))}:${pad(Math.round((t%1)*60)%60)} · ${n} survivor${n===1?'':'s'} · ${(FORTS[R.fort]||{n:R.fort}).n}`+(s.game?` · saved by v${s.game}`:'')}
SV.loadData=function(s){
 if(!s||s.format!==FORMAT)throw new Error('Not a Mini Fort Zombie save file');
 if((s.fv|0)>FV)throw new Error('This save comes from a newer version (save format '+s.fv+')');
 s=upgrade(s);const lost=apply(s);
 try{document.exitPointerLock()}catch(e){}
 go('FORT_BUILD');                                                 // rebuilds the fort; a save on siege day goes straight into the siege
 setTimeout(()=>{try{if(typeof syncAllNpc==='function')syncAllNpc()}catch(e){}toast('Loaded: '+summary(s));if(lost.length)toast(lost.length+' unknown item'+(lost.length===1?'':'s')+' skipped: '+[...new Set(lost)].slice(0,4).join(', '))},50);
 return lost};
/* ---------------- UI ---------------- */
const md=document.createElement('div');md.id='svModal';md.className='scr hide';md.style.cssText='z-index:60;background:rgba(0,0,0,.72)';
md.innerHTML='<div class="box" style="max-width:460px;text-align:center"><div class="h y" id="svT">Load game</div><p id="svM" class="m"></p><p id="svB"></p></div>';document.body.appendChild(md);
const fi=document.createElement('input');fi.type='file';fi.accept='.sav,.json,application/json';fi.style.display='none';document.body.appendChild(fi);
function modal(title,msg,buttons){$('svT').textContent=title;$('svM').innerHTML=msg;const b=$('svB');b.innerHTML='';
 for(const [lab,fn] of buttons){const e=document.createElement('button');e.textContent=lab;e.style.margin='4px';e.onclick=()=>{md.classList.add('hide');fn&&fn()};b.appendChild(e)}md.classList.remove('hide')}
SV.modal=modal;
function confirmLoad(s,src){let ok=true,why='';if(!s||s.format!==FORMAT){ok=false;why='This is not a Mini Fort Zombie save file.'}else if((s.fv|0)>FV){ok=false;why='This save was made by a newer version of the game.'}
 if(!ok)return modal('Load game',why,[['OK']]);
 const fromGame=typeof G!=='undefined'&&G.mode!=='TITLE';
 modal('Load game?',`<b>${summary(s)}</b><br>${src}`+(fromGame?'<br><span class="r">Your current progress since the last save will be lost.</span>':''),[['Load',()=>{try{SV.loadData(s)}catch(e){modal('Load failed',String(e.message||e),[['OK']])}}],['Cancel']])}
SV.pickFile=function(){fi.value='';fi.click()};
fi.onchange=()=>{const f=fi.files&&fi.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{let s=null;try{s=JSON.parse(r.result)}catch(e){}confirmLoad(s,'File: '+f.name)};r.readAsText(f)};
SV.loadAuto=function(){const s=SV.hasAuto();if(s)confirmLoad(s,'Autosave (made when you last arrived at the fort)')};
SV.loadMenu=function(){const a=SV.hasAuto();if(!a)return SV.pickFile();modal('Load game','Load a .sav file, or continue from the autosave:<br><b>'+summary(a)+'</b>',[['Open .sav file…',()=>SV.pickFile()],['Continue autosave',()=>confirmLoad(a,'Autosave')],['Cancel']])};
// main menu: enable the Load Game button
(function(){const b=[...document.querySelectorAll('#menu .mbtn')].find(x=>/load game/i.test(x.textContent));if(b){b.disabled=false;b.classList.remove('dis');b.onclick=()=>SV.loadMenu();b.onmouseenter=()=>{try{S.ui()}catch(e){}}}})();
// Fort HQ > Paused: Save / Load
(function(){const p=$('hqPause');if(!p)return;const row=document.createElement('p');row.id='svRow';
 row.innerHTML='<button id="svSave">Save game</button> <button id="svLoad">Load game</button>';p.insertBefore(row,p.querySelector('p:last-of-type'));
 $('svSave').onclick=()=>SV.save();$('svLoad').onclick=()=>SV.loadMenu()})();
// autosave whenever you arrive at the fort (not on the siege)
if(typeof go==='function'){const _go=go;go=function(m){const r=_go.apply(this,arguments);if(m==='FORT_BUILD'&&G.mode==='FORT_BUILD')setTimeout(SV.autosave,200);return r}}
console.log('[save] save / load ready (format '+FORMAT+' v'+FV+')');
})();
