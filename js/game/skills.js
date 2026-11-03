/* =====================================================================================================
   v042 - SKILLS, ACTIONS (container search / lockpicking), UNIVERSAL COMPANION CONTROLS
   Total skill = Base Attribute value (attribute x3) + Umbrella value (umbrella level x2) + Standard points, capped at 100.
   ===================================================================================================== */
const ATTRS=[['smarts','Smarts','Workman, First Aid, Scout, Spot'],['finesse','Finesse','Hand to Hand, Melee, Guns, Lockpick, Sneak'],['power','Power','Social (interaction). Rot resistance: not yet implemented'],['speed','Speed','Movement speed and stamina use'],['toughness','Toughness','Damage resistance']];
const SKL=[
 {id:'h2h',n:'Hand to Hand',a:'finesse',d:'Accuracy and damage with fists (player and survivors).'},
 {id:'spot',n:'Spot',a:'smarts',u:'explore',d:'Shortens the 6 s first-time container search.'},
 {id:'first_aid',n:'First Aid',a:'smarts',u:'craft',d:'Medical items heal more reliably; Medics heal overnight from this.'},
 {id:'social',n:'Social',a:'power',u:'social',d:'Chance a survivor agrees to join you (2 attempts each).'},
 {id:'guns',n:'Guns',a:'finesse',u:'combat',d:'Accuracy, better at close range; 50+ is experienced.'},
 {id:'melee',n:'Melee',a:'finesse',u:'combat',d:'Accuracy and damage with melee weapons and gun butts.'},
 {id:'workman',n:'Workman',a:'smarts',u:'craft',d:'Barricade repairs by you and overnight Builder progress.'},
 {id:'sneak',n:'Sneak',a:'finesse',u:'stealth',d:'Zombies notice you less and forget you sooner. Crouching adds +25.'},
 {id:'lockpick',n:'Lockpick',a:'finesse',u:'stealth',d:'Success chance when picking [LOCKED] doors and containers (10 s).'},
 {id:'scout',n:'Scout',a:'smarts',u:'explore',d:'Drive time to town and back (4 h down to 45 min).'}];
const SKM={};SKL.forEach(s=>SKM[s.id]=s);
function genSk(role){const a={};ATTRS.forEach(x=>a[x[0]]=ri(15,40));
 ({Guard:['finesse','toughness'],Medic:['smarts'],Builder:['smarts','toughness'],Scavenger:['speed','finesse'],Generalist:[]}[role]||[]).forEach(k=>a[k]=Math.min(80,a[k]+15));
 const p={};SKL.forEach(s=>p[s.id]=ri(0,10));
 ({Guard:['guns','melee'],Medic:['first_aid'],Builder:['workman'],Scavenger:['scout','spot','lockpick'],Generalist:[]}[role]||[]).forEach(k=>p[k]+=ri(8,16));
 return{a,p,dly:{}}}
function skOf(o){if(!o.sk){if(o===G){const a={},p={};ATTRS.forEach(x=>a[x[0]]=25);SKL.forEach(s=>p[s.id]=10);o.sk={a,p,dly:{}}}else{o.sk=genSk(o.role);starsFrom(o)}}return o.sk}
function skParts(o,id){const k=skOf(o),s=SKM[id],b=k.a[s.a],pt=k.p[id];return[b,pt,Math.min(100,b+pt)]}
function skTot(o,id){return skParts(o,id)[2]}
function starsFrom(o){let t=0;SKL.forEach(s=>t+=skTot(o,s.id));o.skill=Math.max(1,Math.min(5,Math.round(t/SKL.length/12)))}
function trainSk(o,id){if(!o||!SKM[id])return;skOf(o).dly[id]=true}
/* ---------- skill effects ---------- */
function skGunBase(dist){const t=skTot(G,'guns');return .45+.45*t/100+Math.max(0,Math.min(1,1-dist/40))*.25-.1+(t>=50?.06:0)}
function skNpcAcc(o){const t=skTot(o,'guns');return .7+.4*t/100+(t>=50?.06:0)}
function skWid(d){return d===FIST?'h2h':'melee'}
function skMeleeHit(o,id){const t=skTot(o,id);return Math.min(.97,.6+.37*t/100+(t>=50?.07:0))}
function skHealMult(o){const t=skTot(o,'first_aid');return Math.random()*100<t?1+rnd(0,.15+t/250):1-rnd(0,.45)}
function skRepair(o){return 15+skTot(o,'workman')*.5}
function crouchBuff(o){return o===G?!!G.crouch:(!!G.crouch&&comps.some(c=>c.s===o&&c.follow))}
function sneakEff(o){return Math.min(100,skTot(o,'sneak')+(crouchBuff(o)?25:0))}
function skSneakMul(o){return Math.max(.5,Math.min(1.3,1.3-.8*sneakEff(o)/100))}
function skForget(o){return Math.max(.5,1.25-.6*sneakEff(o)/100)}
function skDmgMul(o){return Math.max(.6,Math.min(1.3,1-(skOf(o).a.toughness-25)*.005))}
function skSpeedMul(o){return 1+(skOf(o).a.speed-25)*.004}
function skStDrain(o){return Math.max(.6,Math.min(1.4,1-(skOf(o).a.speed-25)*.005))}
/* ---------- scout / travel time ---------- */
function scoutBest(){let t=skTot(G,'scout');G.surv.forEach(q=>{if(q.role==='Scavenger'&&q.hp>0)t=Math.max(t,skTot(q,'scout'))});return t}
function skScoutHours(){return 4-3.25*scoutBest()/100}
function fmtH(h){const m=Math.round(h*60);return Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'}
function skScoutTrained(){[G].concat(G.surv.filter(q=>q.role==='Scavenger'&&q.hp>0)).forEach(o=>{const k=skOf(o);k.dly.scout=Math.min(3,(typeof k.dly.scout==='number'?k.dly.scout:0)+1)})}
/* ---------- overnight medic ---------- */
function skMedic(m){const t=skTot(m,'first_aid');let pool=Math.round(15+t*.8),healed=0;
 const T=[{n:'you',g:()=>G.hp,mx:G.maxHp,s:v=>{G.hp=v}}].concat(G.surv.map(q=>({n:q.name,g:()=>q.hp,mx:100,s:v=>{q.hp=v}})));
 for(let pass=0;pass<6&&pool>0;pass++){T.sort((a,b)=>(b.mx-b.g())/b.mx-(a.mx-a.g())/a.mx);const x=T[0],miss=x.mx-x.g();if(miss<=.5)break;
  const amt=Math.min(miss,pool,12),cost=Math.max(1,Math.round(amt/8));if(G.meds<cost)break;G.meds-=cost;x.s(Math.min(x.mx,x.g()+amt));pool-=amt;healed+=amt}
 if(healed>0){trainSk(m,'first_aid');toast(m.name+' treated '+Math.round(healed)+' HP overnight')}}
/* ---------- end of day: apply training, queue the summary ---------- */
function skDayEnd(){const out=[];[G].concat(G.surv).forEach(o=>{const k=skOf(o),ch=[];
  SKL.forEach(s=>{let g=0;if(s.id==='scout')g=typeof k.dly.scout==='number'?k.dly.scout:0;else if(k.dly[s.id])g=ri(1,3);
   if(g>0){const from=skTot(o,s.id),add=Math.min(g,100-from);if(add>0)k.p[s.id]+=add;const to=skTot(o,s.id);if(to>from)ch.push({n:s.n,from,to})}});
  k.dly={};if(o!==G)starsFrom(o);if(ch.length)out.push({name:o===G?G.name:o.name,ch})});
 if(out.length){(G.skQ=G.skQ||[]).push({day:G.day,out})}return out}
/* ---------- timed actions with a progress bar ---------- */
function devFast(){return !!(window.DEV&&DEV.on&&G.mode==='DEV')}
function actShow(){let b=$('actBar');if(!b){b=document.createElement('div');b.id='actBar';b.innerHTML='<div class="t"></div><i></i>';document.body.appendChild(b)}b.style.display='block';b.firstChild.textContent=G.act.label;b.lastChild.style.width='0'}
function actStart(o){if(G.act)return;G.act=Object.assign({t:0,x:pl.position.x,z:pl.position.z,hp:G.hp},o);actShow()}
function actCancel(msg){if(!G.act)return;G.act=null;const b=$('actBar');if(b)b.style.display='none';if(msg)toast(msg)}
function actTick(dt){const a=G.act;if(!a)return;if(!playing()||!locked||invOpen||skOpen){actCancel();return}
 if(Math.hypot(pl.position.x-a.x,pl.position.z-a.z)>1.2){actCancel('Cancelled: you moved');return}
 if(G.hp<a.hp-.01){actCancel('Interrupted!');return}a.hp=Math.max(a.hp,G.hp);a.t+=dt;const b=$('actBar');if(b)b.lastChild.style.width=Math.min(100,a.t/a.dur*100)+'%';
 if(a.failAt!=null&&a.t>=a.failAt){G.act=null;if(b)b.style.display='none';a.onFail();return}
 if(a.t>=a.dur){G.act=null;if(b)b.style.display='none';a.onDone()}}
function spotTime(){return 6*(1-.75*skTot(G,'spot')/100)}
function skLootPrompt(c){if(c.corpse)return'[E] Search '+c.name+(c.inv&&c.inv.items.length?'':' (empty)');if(c.drop)return'[E] Open drop box';if(c.locked)return'[LOCKED]\nLockpick? (E)';return'[E] Search container'}
function skOpenCont(c){if(G.act)return;if(c.locked){skLockpick({cont:c});return}
 if(c.table&&!c.drop&&!c.hq&&!c.comp&&!c.opened&&!devFast()){actStart({label:'Searching...',dur:spotTime(),onDone:()=>{c.opened=true;trainSk(G,'spot');openContainer(c)}});return}
 c.opened=true;openContainer(c)}
function skLockpick(t){if(G.act)return;const ch=Math.min(.92,.2+.7*skTot(G,'lockpick')/100),ok=Math.random()<ch;
 actStart({label:'Picking the lock...',dur:10,failAt:ok?null:rnd(1.2,9.7),onFail:()=>{trainSk(G,'lockpick');toast('[FAILURE] The lock held. Try again (E).')},onDone:()=>{trainSk(G,'lockpick');(t.door||t.cont).locked=false;toast('[SUCCESSFUL] Lock picked');try{S.click()}catch(e){}}})}
/* ---------- recruiting (Social) ---------- */
function skRecruitCheck(o){const u=o.userData;u.tries=u.tries||0;if(u.refused){toast('They want nothing more to do with you.');return false}
 const ch=Math.min(1,.55+.45*skTot(G,'social')/100);u.tries++;trainSk(G,'social');if(Math.random()<ch)return true;
 if(u.tries>=2){u.refused=true;toast('The survivor refuses to join you and will not be persuaded.')}else toast('The survivor hesitates and refuses. You can try once more.');return false}
function skNpcPrompt(o){const u=o.userData,n=2-(u.tries||0);return u.refused?'Survivor (not interested)':'[E] Recruit survivor ('+n+' attempt'+(n===1?'':'s')+' left)'}
/* ---------- universal companion controls (keys 1-5) ---------- */
function setFollow(c,v){if(c.follow===v)return;c.follow=v;c.home=v?null:{x:c.m.position.x,z:c.m.position.z}}
function ccApply(k){if(!comps.length)return;
 if(k<=3){G.uRange=k;comps.forEach(c=>{c.range=k;c.s.range=k});toast('All companions: '+['','SHORT','MEDIUM','FAR'][k]+' range')}
 else if(k===4){G.uFollow=true;comps.forEach(c=>setFollow(c,true));toast('All companions: FOLLOW')}
 else{G.uFollow=false;comps.forEach(c=>setFollow(c,false));toast('All companions: STAY')}
 try{S.click()}catch(e){}}
function ccTick(){const el=$('cc');if(!el)return;const show=comps.length>0&&playing()&&!$('hud').classList.contains('hide');el.classList.toggle('hide',!show);if(!show)return;
 const all=f=>comps.every(f);for(let i=1;i<=5;i++)$('cc'+i).classList.toggle('on',i<=3?all(c=>c.range===i):i===4?all(c=>c.follow):all(c=>!c.follow))}
/* ---------- skills window / day summary ---------- */
let skOpen=false,skRelock=false;
function skList(){return[G].concat(G.surv,comps.map(c=>c.s).filter(s=>!G.surv.includes(s)))}
function skEl(){let e=$('skScr');if(!e){e=document.createElement('div');e.id='skScr';document.body.appendChild(e)}return e}
function openSkills(who){let o=G;if(typeof who==='number')o=skList().find(q=>q.id===who)||G;else if(who&&typeof who==='object')o=who;skShow(o)}
let skCur=null,skEditing=false;
function skClean(t){return String(t||'').replace(/[<>&"'`]/g,'').trim().slice(0,24)}
function skRename(){skEditing=true;skShow(skCur)}
function skSaveName(){const v=skClean($('skNameIn').value);if(v){if(skCur===G)G.name=v;else skCur.name=v;toast('Renamed to '+v)}skEditing=false;skShow(skCur);try{if(scrVis('hq'))hqUI()}catch(e){}}
function skShow(o){const k=skOf(o),L=skList(),el=skEl(),nm=x=>x===G?G.name:x.name;skCur=o;skOpen=true;if(document.pointerLockElement)document.exitPointerLock();
 const sel=`<select onchange="skEditing=false;skShow(skList()[this.value])">${L.map((x,i)=>`<option value="${i}" ${x===o?'selected':''}>${nm(x)}${x===G?' (you)':''}</option>`).join('')}</select>`;
 const attr=ATTRS.map(a=>`<tr><td><b>${a[1]}</b></td><td class="y">${k.a[a[0]]}</td><td class="m">${a[2]}</td></tr>`).join('');
 const rows=SKL.map(s=>{const p=skParts(o,s.id),tr=k.dly[s.id];return`<tr><td><b>${s.n}</b>${tr?' <span class="g">&#9650;</span>':''}<br><span class="m" style="font-size:10px">${s.d}</span></td><td class="m">${s.a} <b style="color:#eee">${p[0]}</b></td><td>${p[1]}</td><td><b class="y">${p[2]}</b><div class="skb"><i style="width:${p[2]}%"></i></div></td></tr>`}).join('');
 const nameBlock=skEditing?`<div><input id="skNameIn" type="text" maxlength="24" value="${nm(o)}" style="font:700 20px Impact,sans-serif;background:#151515;color:#facc15;border:1px solid #facc15;border-radius:4px;padding:2px 6px"> <button onclick="skSaveName()">Save</button> <button onclick="skEditing=false;skShow(skCur)">Cancel</button></div>`:`<div class="h y" style="font-size:30px">${nm(o)}</div>`;
 el.innerHTML=`<div class="box" style="max-width:860px"><div class="row" style="justify-content:space-between;align-items:flex-start"><div>${nameBlock}<div class="row" style="margin-top:2px"><div class="h r" style="font-size:20px">Skills</div></div></div><div>${skEditing?'':'<button onclick="skRename()">Rename</button> '}${sel} <button onclick="skClose()">Close</button></div></div>
 <div class="h r" style="font-size:16px;margin-top:8px">Attributes</div><table>${attr}</table>
 <div class="h r" style="font-size:16px;margin-top:8px">Skills <span class="m" style="font-size:11px">Attribute value + Skill value = Total (max 100). <span class="g">&#9650;</span> = trained today</span></div>
 <table><tr><th>Skill</th><th>Attribute</th><th>+ Skill</th><th>= Total</th></tr>${rows}</table></div>`;el.style.display='flex';if(skEditing){const i=$('skNameIn');if(i){i.focus();i.select()}}}
function skClose(){skOpen=false;skEditing=false;$('skScr').style.display='none';
 if(skRelock){skRelock=false;if(playing()&&!invOpen&&!inHQ()){ui(null);G.escTry=performance.now();lock();setTimeout(()=>{if(playing()&&!locked&&!invOpen&&!skOpen&&!inHQ()&&!['pz','hq','opt','dev','end','title','menu','sel'].some(scrVis))showPause()},700)}}}
function skSummary(e){const el=skEl();skRelock=playing()&&!!document.pointerLockElement&&!invOpen;skOpen=true;if(document.pointerLockElement)document.exitPointerLock();
 el.innerHTML=`<div class="box" style="max-width:560px"><div class="h y" style="font-size:30px;text-align:center">Day ${e.day-1} complete: skill gains</div>`+
  e.out.map(r=>`<div class="sv" style="display:block"><b>${r.name}</b>${r.ch.map(c=>`<div><span class="g">&#9650;</span> ${c.n}: ${c.from} &rarr; <b class="y">${c.to}</b> <span class="g">(+${c.to-c.from})</span></div>`).join('')}</div>`).join('')+
  `<div style="text-align:center;margin-top:12px"><button onclick="skClose()" style="font-size:18px;padding:10px 26px">Continue</button></div></div>`;el.style.display='flex'}
setInterval(()=>{if(skOpen||!G.skQ||!G.skQ.length)return;if(['TITLE','TRAVEL','END'].includes(G.mode)||invOpen||scrVis('opt')||scrVis('dev')||scrVis('title')||scrVis('menu')||scrVis('sel'))return;skSummary(G.skQ.shift())},600);
addEventListener('keydown',e=>{if(!skOpen)return;const t=e.target&&e.target.tagName,typing=t==='INPUT'||t==='TEXTAREA'||t==='SELECT';if(e.code==='Escape'||(e.code==='KeyE'&&!typing&&!e.repeat)){e.preventDefault();skClose()}e.stopPropagation()},true);
/* crouch training: 10 s of crouch-walking trains Sneak for you and your following companions */
setInterval(()=>{if(!playing()||!locked||!G.crouch||!(K.KeyW||K.KeyA||K.KeyS||K.KeyD))return;G._cr=(G._cr||0)+1;if(G._cr>=10){G._cr=0;trainSk(G,'sneak');comps.forEach(c=>{if(c.follow)trainSk(c.s,'sneak')})}},1000);
/* ---------- inventory "Skills" buttons ---------- */
function skBtn(fn){const b=document.createElement('button');b.className='skBtn';b.textContent='Skills';b.style.cssText='padding:2px 10px;background:#4c1d95;font-size:12px';b.onclick=fn;return b}
function sortBtn(inv){const b=skBtn(()=>{if(invSort(inv)){try{S.click()}catch(e){}renderInv();toast('Inventory sorted')}else toast('Already packed as tightly as possible')});b.textContent='Sort';b.className='skBtn sortBtn';b.style.background='#14532d';return b}
function skInject(){const ib=document.querySelector('#invBox .invTitle');if(ib&&!ib.querySelector('.sortBtn')){ib.appendChild(sortBtn(PINV))}if(ib&&!ib.querySelector('.skBtn:not(.sortBtn)'))ib.appendChild(skBtn(()=>openSkills(G)));
 const cb=document.querySelector('#contBox .invTitle');if(cb&&currentContainer&&currentContainer.comp&&!cb.querySelector('.skBtn')){const sv=currentContainer.sv,inv=currentContainer.inv;cb.appendChild(sortBtn(inv));cb.appendChild(skBtn(()=>openSkills(sv)))}}
const _skRI=renderInv;renderInv=function(){_skRI.apply(this,arguments);try{skInject()}catch(e){console.error(e)}};
/* ---------- wrappers ---------- */
const _skIC=initCampaign;initCampaign=function(k){_skIC.apply(this,arguments);G.sk=null;G.skQ=[];G.act=null;G.tripH=0;G.uRange=2;G.uFollow=true;skOf(G);G.surv.forEach(s=>{s.sk=null;skOf(s)})};
const _skGo=go;go=function(m){if(m==='EXPEDITION'){G.uRange=2;G.uFollow=true}actCancel();return _skGo.apply(this,arguments)};
let _skT=performance.now();const _skAn=animate;animate=function(){const n=performance.now(),dt=Math.min(.1,(n-_skT)/1000);_skT=n;try{actTick(dt);ccTick();wspTick()}catch(e){console.error(e)}return _skAn.apply(this,arguments)};
G.uRange=2;G.uFollow=true;
/* ---------- v043 helpers ---------- */
G.name=G.name||'Ren Biley';
function dragRot(){const d=invDragging;if(!d)return;const cx=gridCtx(d.kind),inst=cx.inv.items.find(i=>i.uid===d.uid);d.previewRot=!d.previewRot;if(inst){const f=fp(inst,d.previewRot);d.grabCellX=Math.floor(f[0]/2);d.grabCellY=Math.floor(f[1]/2)}drawGhost()}
S.hm=function(c){const o=out();T(o,'square',c?2100:1600,c?1500:1100,.05,.16);T(o,'sine',1000,520,.07,.14,.015)};
function hitMark(c){const h=$('hm');if(!h)return;h.querySelectorAll('i').forEach(i=>i.style.background=c?'#facc15':'#fff');h.classList.remove('on');void h.offsetWidth;h.classList.add('on');try{S.hm(c)}catch(e){}}
(function(){const h=document.createElement('div');h.id='hm';h.innerHTML='<i></i><i></i><i></i><i></i>';document.body.appendChild(h)})();
let _wspK='';
function wspTick(){const cv=$('wsp');if(!cv)return;const w=G.eq,id=w&&ITEMS[w.id]?w.id:null,key=(id||'')+'|'+icoVer;if(key===_wspK)return;_wspK=key;
 if(!id){cv.style.display='none';return}const it=ITEMS[id],sw=it.size[0],sh=it.size[1],rot=sh>sw,k=56/Math.max(sw,sh),pw=Math.round((rot?sh:sw)*k),ph=Math.round((rot?sw:sh)*k),ic=iconCanvas(id,pw,ph,rot);
 cv.width=pw;cv.height=ph;cv.style.display='block';cv.style.imageRendering=hasCustom(id)?'auto':'pixelated';const x=cv.getContext('2d');x.clearRect(0,0,pw,ph);x.drawImage(ic,0,0)}

/* ====================== v044 ====================== */
/* zombie misses */
function zMiss(o){return .25+skOf(o).a.finesse/500}
function zMissFx(p,player){try{floatText(p.x,p.y+2.1,p.z,'Miss','#9ca3af')}catch(e){}if(player)actCancel('Interrupted!')}
/* attacking interrupts a search / lockpick */
const _skShoot=shoot;shoot=function(){if(G.act)actCancel('Interrupted!');return _skShoot.apply(this,arguments)};
const _skMelee=melee;melee=function(){if(G.act)actCancel('Interrupted!');return _skMelee.apply(this,arguments)};
/* inventory sort: repack with several orderings, keep the tightest layout */
function invSort(inv){if(inv.grow)return false;const items=inv.items.slice();if(items.length<2)return false;
 const dm=q=>ITEMS[q.id].size,ar=q=>dm(q)[0]*dm(q)[1],mx=q=>Math.max(...dm(q)),
  orders=[(a,b)=>ar(b)-ar(a)||mx(b)-mx(a),(a,b)=>mx(b)-mx(a)||ar(b)-ar(a),(a,b)=>dm(b)[1]-dm(a)[1]||dm(b)[0]-dm(a)[0],(a,b)=>dm(b)[0]-dm(a)[0]||dm(b)[1]-dm(a)[1]];
 const plan=ord=>{const occ=Array.from({length:inv.h},()=>new Uint8Array(inv.w)),res=[];let ext=0,cols=0;
  for(const q of items.slice().sort(ord)){const [w,h]=dm(q);let best=null;
   for(const rot of(w===h?[false]:[false,true])){const tw=rot?h:w,th=rot?w:h;if(tw>inv.w||th>inv.h)continue;
    f:for(let y=0;y+th<=inv.h;y++)for(let x=0;x+tw<=inv.w;x++){let ok=true;for(let dy=0;dy<th&&ok;dy++)for(let dx=0;dx<tw;dx++)if(occ[y+dy][x+dx]){ok=false;break}
     if(ok){const sc=(y+th)*100+x;if(!best||sc<best.sc)best={x,y,rot,tw,th,sc};break f}}}
   if(!best)return null;for(let dy=0;dy<best.th;dy++)for(let dx=0;dx<best.tw;dx++)occ[best.y+dy][best.x+dx]=1;res.push([q,best]);ext=Math.max(ext,best.y+best.th)}
  return{res,ext}};
 let bp=null;orders.forEach(o=>{const p=plan(o);if(p&&(!bp||p.ext<bp.ext))bp=p});if(!bp)return false;
 const same=bp.res.every(([q,b])=>q.x===b.x&&q.y===b.y&&!!q.rot===b.rot);if(same)return false;
 items.forEach(q=>invLift(inv,q));bp.res.forEach(([q,b])=>invPut(inv,q,b.x,b.y,b.rot));return true}
/* ---------- keybinds ---------- */
const KB_DEF={fwd:'KeyW',left:'KeyA',back:'KeyS',right:'KeyD',sprint:'ShiftLeft',jump:'Space',crouch:'KeyC',interact:'KeyE',reload:'KeyR',inv:'KeyI',torch:'KeyF',bar:'KeyZ',cycle:'Tab',c1:'Digit1',c2:'Digit2',c3:'Digit3',c4:'Digit4',c5:'Digit5'};
const KB_LBL={fwd:'Move forward',left:'Move left',back:'Move back',right:'Move right',sprint:'Sprint',jump:'Jump',crouch:'Crouch',interact:'Interact / open / pick up / hold for orders',reload:'Reload (also rotates a dragged item / Take All Quick)',inv:'Inventory',torch:'Torch (night)',bar:'Build barricade (Z shows ghost, Z places)',cycle:'Cycle weapons',c1:'Companions: Short range',c2:'Companions: Medium range',c3:'Companions: Far range',c4:'Companions: Follow',c5:'Companions: Stay'};
let KB=Object.assign({},KB_DEF),kbCap=null;
try{const j=JSON.parse(localStorage.getItem('gf_keys')||'null');if(j)for(const a in KB_DEF)if(typeof j[a]==='string')KB[a]=j[a]}catch(e){}
function kbSave(){try{localStorage.setItem('gf_keys',JSON.stringify(KB))}catch(e){}}
function kbName(c){return c.replace(/^Key/,'').replace(/^Digit/,'').replace('ShiftLeft','Left Shift').replace('ShiftRight','Right Shift').replace('ControlLeft','Left Ctrl').replace('ControlRight','Right Ctrl').replace('AltLeft','Left Alt').replace('AltRight','Right Alt').replace('ArrowUp','Up').replace('ArrowDown','Down').replace('ArrowLeft','Left').replace('ArrowRight','Right').replace('Numpad','Num ')}
function kbRender(){const L=$('kbList');if(!L)return;L.innerHTML=Object.keys(KB_DEF).map(a=>`<div class="icoRow"><div style="flex:1">${KB_LBL[a]}</div><button data-kb="${a}" style="min-width:120px;${kbCap===a?'background:#7f1d1d;border-color:#facc15':''}">${kbCap===a?'Press a key...':kbName(KB[a])}</button></div>`).join('');
 L.querySelectorAll('button').forEach(b=>b.onclick=()=>{kbCap=b.dataset.kb;kbRender()})}
function kbDefaults(){KB=Object.assign({},KB_DEF);kbCap=null;kbSave();kbRender();const m=$('kbMsg');if(m)m.textContent='Defaults restored.'}
const KB_BLOCK=new Set(['Escape','Backquote','F3','F4','F5','F6','F11','F12']);
function kbEvent(e){if(e._kb)return;
 if(kbCap){if(e.type==='keydown'){e.preventDefault();e.stopImmediatePropagation();const m=$('kbMsg');if(e.code==='Escape'){kbCap=null;kbRender();return}
   if(KB_BLOCK.has(e.code)){if(m)m.textContent=kbName(e.code)+' is reserved.';return}
   const a=kbCap,old=KB[a],other=Object.keys(KB).find(k=>k!==a&&KB[k]===e.code);if(other)KB[other]=old;KB[a]=e.code;kbCap=null;kbSave();kbRender();if(m)m.textContent=other?'Swapped with "'+KB_LBL[other]+'".':'Saved.'}else{e.stopImmediatePropagation()}return}
 const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA'||t==='SELECT'||KB_BLOCK.has(e.code))return;
 const c=e.code;let to=null;for(const a in KB_DEF)if(KB[a]===c){to=KB_DEF[a];break}
 if(to===null){for(const a in KB_DEF)if(KB_DEF[a]===c&&KB[a]!==c){e.stopImmediatePropagation();e.preventDefault();return}return}
 if(to===c)return;e.stopImmediatePropagation();e.preventDefault();
 const ne=new KeyboardEvent(e.type,{code:to,key:to,repeat:e.repeat,bubbles:true,cancelable:true,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey});ne._kb=true;document.body.dispatchEvent(ne)}
addEventListener('keydown',kbEvent,true);addEventListener('keyup',kbEvent,true);
/* ---------- dev toolkit: skill editor ---------- */
let devSkWho=0;
function devSkRender(){const w=$('devSk');if(!w)return;const L=skList(),o=L[devSkWho]||G,k=skOf(o);devSkWho=Math.max(0,L.indexOf(o));
 w.innerHTML=`<h4>Skills (test numbers)</h4><div class="row">Character <select onchange="devSkWho=+this.value;devSkRender()">${L.map((x,i)=>`<option value="${i}" ${x===o?'selected':''}>${x===G?G.name+' (you)':x.name}</option>`).join('')}</select><button onclick="devSkApply()">Apply</button><button onclick="devSkRender()">Reload</button><button onclick="devSkMax()">All 100</button><button onclick="devSkNight()">Flag all trained + run day end</button></div>
 <div class="row">${ATTRS.map(a=>`<label class="dvl">${a[1]} <input type="number" id="dvA_${a[0]}" min="0" max="100" value="${k.a[a[0]]}" style="width:55px"></label>`).join('')}</div>
 <table style="width:100%">${SKL.map(s=>`<tr><td>${s.n}</td><td class="m">${s.a} ${k.a[s.a]}</td><td><input type="number" id="dvP_${s.id}" min="0" max="100" value="${k.p[s.id]}" style="width:55px"></td><td class="y">= ${skTot(o,s.id)}</td></tr>`).join('')}</table>`}
function devSkWhoObj(){return skList()[devSkWho]||G}
function devSkApply(){const o=devSkWhoObj(),k=skOf(o),cl=v=>Math.max(0,Math.min(100,Math.round(+v)||0));ATTRS.forEach(a=>{k.a[a[0]]=cl($('dvA_'+a[0]).value)});SKL.forEach(s=>{k.p[s.id]=cl($('dvP_'+s.id).value)});if(o!==G)starsFrom(o);devSkRender();toast('[DEV] Skills updated')}
function devSkMax(){const k=skOf(devSkWhoObj());ATTRS.forEach(a=>k.a[a[0]]=100);SKL.forEach(s=>k.p[s.id]=100);devSkRender()}
function devSkNight(){const o=devSkWhoObj(),k=skOf(o);SKL.forEach(s=>k.dly[s.id]=true);k.dly.scout=3;const out=skDayEnd();devSkRender();toast('[DEV] Day-end training applied'+(out.length?'':' (nothing to gain)'))}
(function(){const d=document.querySelector('#dev [data-p="state"]');if(!d)return;const w=document.createElement('div');w.id='devSk';d.appendChild(w);devSkRender();
 const dv=$('dev');if(dv)dv.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#devSk'))return;setTimeout(devSkRender,60)});
 setInterval(()=>{const x=$('devSk');if(x&&x.offsetParent&&!x.contains(document.activeElement))devSkRender()},1500)})();

/* ====================== v047: z-fight resolver ======================
   Runs at the end of every world build (before the merge pass). It finds axis-aligned box/plane faces that face the same way, lie
   within 12 mm of each other and overlap, and moves the smaller one a hair along its normal so the depth buffer can separate them. */
function zFix(){try{const t0=performance.now();scene.updateMatrixWorld(true);const E=.012,faces=[],skip=new Set(['zombie','surv','comp','npc','door','glass']);
 const addMesh=m=>{const g=m.geometry,mt=m.material;if(!g||!m.visible||!mt||Array.isArray(mt)||mt.transparent||(m.userData&&m.userData.noZ))return;const isB=g.type==='BoxGeometry',isP=g.type==='PlaneGeometry';if(!isB&&!isP)return;
  const e=m.matrixWorld.elements,cols=[[e[0],e[1],e[2]],[e[4],e[5],e[6]],[e[8],e[9],e[10]]],len=[],wa=[],ws=[];
  for(const c of cols){const l=Math.hypot(c[0],c[1],c[2]);len.push(l);const ab=c.map(Math.abs),a=ab[0]>=ab[1]&&ab[0]>=ab[2]?0:ab[1]>=ab[2]?1:2;if(!(ab[a]/(l||1)>.9995))return;wa.push(a);ws.push(c[a]>0?1:-1)}
  if(new Set(wa).size!==3)return;const p=g.parameters,half=[p.width/2*len[0],p.height/2*len[1],isB?p.depth/2*len[2]:0],ctr=[e[12],e[13],e[14]];
  const loc=isB?[[2,1],[2,-1],[0,1],[0,-1],[1,1],[1,-1]]:(mt.side===THREE.DoubleSide?[[2,1],[2,-1]]:[[2,1]]);
  for(const [i,sg] of loc){const a=wa[i],dir=sg*ws[i],coord=ctr[a]+dir*half[i],oth=[0,1,2].filter(x=>x!==i).map(j=>[wa[j],ctr[wa[j]]-half[j],ctr[wa[j]]+half[j]]).sort((x,y)=>x[0]-y[0]);
   if(a===1&&dir<0&&coord<.02)continue;const area=(oth[0][2]-oth[0][1])*(oth[1][2]-oth[1][1]);if(area<.005)continue;faces.push({m,a,dir,coord,u0:oth[0][1],u1:oth[0][2],v0:oth[1][1],v1:oth[1][2],area,id:faces.length})}};
 const walk=o=>{if(o===pl||o.isLight||o.isSprite||(o.userData&&(skip.has(o.userData.kind)||o.userData.dev)))return;if(o.isMesh)addMesh(o);for(const c of o.children)walk(c)};
 scene.children.forEach(walk);
 const groups=new Map();faces.forEach(f=>{const k=f.a*2+(f.dir>0?1:0);let g=groups.get(k);if(!g)groups.set(k,g=new Map());
  for(let cx=Math.floor(f.u0/6);cx<=Math.floor(f.u1/6);cx++)for(let cz=Math.floor(f.v0/6);cz<=Math.floor(f.v1/6);cz++){const ck=cx*100003+cz;let l=g.get(ck);if(!l)g.set(ck,l=[]);l.push(f)}});
 const pairs=[],seen=new Set();
 groups.forEach(g=>g.forEach(l=>{if(l.length<2)return;l.sort((x,y)=>x.coord-y.coord);for(let i=0;i<l.length;i++){const f=l[i];for(let j=i+1;j<l.length&&l[j].coord-f.coord<E;j++){const h=l[j];if(f.m===h.m)continue;
  if(Math.min(f.u1,h.u1)-Math.max(f.u0,h.u0)<.01||Math.min(f.v1,h.v1)-Math.max(f.v0,h.v0)<.01)continue;const k=f.id<h.id?f.id*1e6+h.id:h.id*1e6+f.id;if(seen.has(k))continue;seen.add(k);pairs.push(f.area>h.area||(f.area===h.area&&f.id<h.id)?[f,h]:[h,f])}}}));
 pairs.sort((x,y)=>y[0].area-x[0].area);const off=new Map(),get=m=>{let o=off.get(m);if(!o)off.set(m,o=[0,0,0]);return o};
 for(let pass=0;pass<2;pass++)for(const [B,S] of pairs){const eb=B.coord+get(B.m)[B.a],es=S.coord+get(S.m)[S.a],d=(es-eb)*S.dir;if(d>=E||d<=-E)continue;get(S.m)[S.a]+=(d>=0?E-d:-E-d)*S.dir}
 let n=0;const w=new THREE.Vector3();off.forEach((o,m)=>{if(!o[0]&&!o[1]&&!o[2])return;m.getWorldPosition(w);w.x+=o[0];w.y+=o[1];w.z+=o[2];if(m.parent){m.parent.worldToLocal(w);m.position.copy(w)}else m.position.copy(w);n++});
 scene.updateMatrixWorld(true);console.log('zFix: '+faces.length+' faces, '+pairs.length+' conflicts, '+n+' meshes nudged ('+(performance.now()-t0).toFixed(0)+' ms)')}catch(e){console.error('zFix failed',e)}}

/* ====================== v048: Fort Zombie config layer ======================
   Reads the original XNB/XML config files (Weapons.txt, InventoryItemClassDB.txt). A built-in copy is embedded (#fzcfg); you can load your own
   files from Dev > State > "FZ config". Applies: dice damage (+ range-band modifier), MaxRounds, ShotTime, reload times, ammo type, range bands,
   noise radius (BangRadius), item food/med/ammo units and weights. Switch off ("Use FZ values") to get the exact v047 numbers back.
   Not applied (stored for later versions): IsAutomatic (inconsistent in the data), swing stamina cost, penetration, deviation, speed multiplier. */
const FZ=(function(){
 const T={on:true,rangeScale:2.5,bangScale:.4,dmgScale:1,reloadScale:1};try{Object.assign(T,JSON.parse(localStorage.getItem('fz_tune')||'{}'))}catch(e){}
 const F={T,cfg:null,map:null,orig:null,pending:[],n:{w:0,m:0,i:0},src:'built-in'};
 F.dice=s=>{const m=/^\s*(\d+)\s*[dD]\s*(\d+)\s*(?:([+-])\s*(\d+))?\s*$/.exec(s||'');if(!m)return null;const n=+m[1],f=+m[2],b=m[3]?(m[3]==='-'?-1:1)*+m[4]:0;return{n,f,b,avg:n*(f+1)/2+b}};
 F.roll=x=>{let t=x.b;for(let i=0;i<x.n;i++)t+=1+Math.floor(Math.random()*x.f);return t};
 F.dstr=x=>x.n+'D'+x.f+(x.b?(x.b>0?'+':'')+x.b:'');
 F.band=(d,dist)=>{if(!d.bands)return 0;for(const b of d.bands)if(dist<=b[0])return b[1];return 0};
 F.bang=d=>d.bang?d.bang*T.bangScale:30;
 F.txt=d=>d.dice?F.dstr(d.dice)+' (avg '+(d.dice.avg*T.dmgScale).toFixed(1)+')':d.dmg;
 /* ---- XNB / XML parsing ---- */
 const ch=(e,p)=>{for(const k of p.split('/')){if(!e)return null;e=Array.from(e.children).find(c=>c.tagName===k)||null}return e};
 const tx=(e,p)=>{const x=ch(e,p);return x?x.textContent.trim():''},nm=(e,p,d=0)=>{const v=parseFloat(tx(e,p));return isNaN(v)?d:v};
 F.h={ch,tx,nm};const rb=(e,k)=>{const r=ch(e,'RangeTable/'+k);return [nm(r,'Range'),nm(r,'DamageModifier'),nm(r,'PenetrationModifier'),nm(r,'DeviationDegrees')]};
 F.parse=function(buf){const u=new Uint8Array(buf);let i=0;for(;i<u.length-5;i++)if(u[i]===60&&u[i+1]===63&&u[i+2]===120&&u[i+3]===109&&u[i+4]===108)break;
  let s=new TextDecoder('utf-8').decode(u.subarray(i));const j=s.lastIndexOf('</ArrayOfAnyType>');if(j>0)s=s.slice(0,j+17);
  const doc=new DOMParser().parseFromString(s,'application/xml');if(doc.querySelector('parsererror'))throw new Error('not valid XML');
  const o={ammo:{},guns:{},melee:{},items:{},occ:{},chars:{},skills:{},zst:{},ai:{},lots:{},rumors:{}};
  for(const e of doc.documentElement.children){const ty=e.getAttribute('xsi:type'),cn=tx(e,'ClassName');
   if(/^PropertyLot$|^RumorMissionDescriptor$/.test(ty))fzParseM(e,ty,cn,o);else if(/^ZombieStyle$|AIParameters$/.test(ty))fzParseZ(e,ty,cn,o);else if(/^(Umbrella)?SkillClass$|^Occupation$|^CharacterTemplate$/.test(ty))fzParseChar(e,ty,cn,o);else if(ty==='AmmoClass')o.ammo[cn]={dmg:tx(e,'Damage'),pen:nm(e,'Penetration')};
   else if(ty==='GunItemClass')o.guns[cn]={skill:tx(e,'SkillName'),shot:nm(e,'ShotTime'),max:nm(e,'MaxRounds'),auto:tx(e,'IsAutomatic')==='true',ammo:Array.from(e.querySelectorAll('CompatibleAmmoClass')).map(x=>x.textContent.trim()),rl:nm(e,'ReloadTime'),rlr:nm(e,'ReloadRounds'),bang:nm(e,'BangRadius'),spd:nm(e,'PlayerSpeedMultiplier',1),w:nm(e,'Weight'),light:tx(e,'HasTacLight')==='true',pb:rb(e,'PointBlankRange'),st:rb(e,'StandardRange'),lg:rb(e,'LongRange'),sw:nm(e,'SwingEnduranceCost')};
   else if(ty==='MeleeItemClass')o.melee[cn]={skill:tx(e,'SkillName'),dmg:tx(e,'Damage'),range:nm(e,'StandardRange/Range'),force:nm(e,'ImpactForce'),sw:nm(e,'SwingEnduranceCost'),w:nm(e,'Weight')};
   else if(ty&&/ItemClass$/.test(ty)){const it={ty,name:tx(e,'DisplayName'),w:nm(e,'Weight'),iw:nm(e,'IconWidth'),ih:nm(e,'IconHeight'),food:nm(e,'FoodUnits'),med:nm(e,'MedicineUnits'),fuel:nm(e,'FuelUnits')};
    if(ch(e,'SkillBonus'))it.sb=[tx(e,'SkillBonus/SkillClassName'),nm(e,'SkillBonus/Bonus')];if(ch(e,'AttributeBonus'))it.ab=[tx(e,'AttributeBonus/Attribute'),nm(e,'AttributeBonus/Bonus')];
    if(ty==='AmmoBoxItemClass'){it.ammo=tx(e,'AmmoClassName');it.rounds=nm(e,'MaxRounds')}if(ty==='PowerToolItemClass')it.pt=[nm(e,'SkillMultiplier'),nm(e,'SkillAdditive'),nm(e,'UnitsOfPower')];
    o.items[cn]=it}}
  return o};
 /* ---- apply to the live game tables ---- */
 const snap=()=>{if(F.orig)return;F.orig={w:{},v:{}};for(const id in WDEF)F.orig.w[id]=Object.assign({},WDEF[id]);for(const id in ITEMS)F.orig.v[id]=ITEMS[id].value?Object.assign({},ITEMS[id].value):null};
 const defDmg=d=>Object.defineProperty(d,'dmg',{get(){return Math.max(1,F.roll(d.dice))*T.dmgScale},set(v){},configurable:true,enumerable:true});
 F.apply=function(){snap();F.pending=[];F.n={w:0,m:0,i:0};
  for(const id in F.orig.w){const d=WDEF[id],o=F.orig.w[id];Object.defineProperty(d,'dmg',{value:o.dmg,writable:true,configurable:true,enumerable:true});for(const k in o)if(k!=='dmg')d[k]=o[k];for(const k of['dice','bands','bang','pen','force','fbN','fbPause'])delete d[k]}
  for(const id in F.orig.v)ITEMS[id].value=F.orig.v[id]?Object.assign({},F.orig.v[id]):null;
  const c=F.cfg,M=F.map;if(!T.on||!c)return;
  for(const fid in c.guns){if(/_light$/.test(fid))continue;const id=M.w[fid],g=c.guns[fid];if(!id){F.pending.push('weapon '+fid);continue}const d=WDEF[id];if(!d||d.type!=='gun'){F.pending.push('weapon '+fid+' (no game item)');continue}
   const an=g.ammo&&g.ammo[0],am=M.a[an],a=c.ammo[an];if(am&&ITEMS[am])d.ammo=am;else F.pending.push('ammo '+an);
   d.cap=g.max;d.cd=g.shot;if(g.auto===false&&d.auto&&g.shot<=.12){d.fbN=3;d.fbPause=.45}else{delete d.fbN;delete d.fbPause}   // original data: shot<=.1 rifles/SMGs fire short bursts per trigger pull (not held full-auto)
   if(g.rlr===1){d.rlN=1;d.rlT=g.rl/g.max*T.reloadScale}else{d.rlN=g.max;d.rlT=g.rl*T.reloadScale}
   const sc=T.rangeScale;d.rng=g.lg[0]*sc;d.bands=[[g.pb[0]*sc,g.pb[1],g.pb[2]],[g.st[0]*sc,g.st[1],g.st[2]],[1e9,g.lg[1],g.lg[2]]];d.bang=g.bang;d.pen=a?a.pen:0;
   const dd=a&&F.dice(a.dmg);if(dd){d.dice=dd;defDmg(d)}F.n.w++}
  for(const fid in c.melee){const id=M.w[fid];if(!id)continue;const d=WDEF[id];if(!d||d.type!=='melee')continue;const m=c.melee[fid],dd=F.dice(m.dmg);if(dd){d.dice=dd;defDmg(d)}d.force=m.force;F.n.m++}
  for(const fid in c.items){const id=M.i[fid];if(!id){F.pending.push(fid);continue}const it=ITEMS[id];if(!it){F.pending.push(fid+' -> '+id+'?');continue}const o=c.items[fid];it.weight=o.w;
   const k=resOf(id);if(k&&it.value){const v=k==='food'?o.food:k==='meds'?o.med:k==='ammo'?o.rounds:0;if(v>0&&v!==it.value[k])it.value[k]=v}if(o.sb)it.skillBonus=o.sb;if(o.ab)it.attrBonus=o.ab;F.n.i++}
 };
 F.load=async function(files){F.cfg=F.cfg||{ammo:{},guns:{},melee:{},items:{},map:F.map};let got=0;
  for(const f of files){try{const o=F.parse(await f.arrayBuffer());for(const k of['ammo','guns','melee','items','occ','chars','skills','zst','ai','lots','rumors'])Object.assign(F.cfg[k]=F.cfg[k]||{},o[k]);got+=Object.keys(o.ammo).length+Object.keys(o.guns).length+Object.keys(o.melee).length+Object.keys(o.items).length}catch(e){toast('[FZ] '+f.name+': '+e.message)}}
  if(got){F.src='your files';F.apply()}return got};
 try{F.cfg=JSON.parse(document.getElementById('fzcfg').textContent);F.map=F.cfg.map;F.apply()}catch(e){console.error('FZ config failed',e)}
 return F})();
function fzBand(d,x){return FZ.band(d,x)}function fzBang(d){return FZ.bang(d)}function fzTxt(d){return FZ.txt(d)}
(function(){const dv=document.querySelector('#dev [data-p="zomb"]');if(!dv)return;const w=document.createElement('div');w.id='devFz';dv.appendChild(w);const T=FZ.T;
 const num=(k,l,s)=>`<label class="dvl">${l} <input type="number" step="${s}" id="fz_${k}" value="${T[k]}" style="width:60px"></label>`;
 window.fzRender=()=>{w.innerHTML=`<h4>FZ config (v048)</h4><div class="row"><label class="dvl"><input type="checkbox" id="fz_on" ${T.on?'checked':''}> Use FZ values</label>${num('rangeScale','Range x',.1)}${num('bangScale','Noise x',.05)}${num('dmgScale','Damage x',.1)}${num('reloadScale','Reload x',.1)}<button onclick="fzApplyUI()">Apply</button></div>
  <div class="row">Load config files: <input type="file" id="fz_files" multiple accept=".txt,.xnb,.xml" onchange="FZ.load(this.files).then(n=>{toast('[FZ] '+n+' entries read');fzRender()})"></div>
  <div class="m">Source: ${FZ.src} &middot; guns ${FZ.n.w}, melee ${FZ.n.m}, items ${FZ.n.i} applied &middot; ${FZ.pending.length} config entries have no game item yet</div><div class="m" style="max-height:70px;overflow:auto;font-size:10px">${FZ.pending.join(', ')}</div>`};
 window.fzApplyUI=()=>{T.on=$('fz_on').checked;for(const k of['rangeScale','bangScale','dmgScale','reloadScale'])T[k]=Math.max(.01,+$('fz_'+k).value||1);try{localStorage.setItem('fz_tune',JSON.stringify(T))}catch(e){}FZ.apply();fzRender();toast('[FZ] applied (new guns/clips pick up reload & capacity)')};
 fzRender()})();


/* ====================== v049: Fort Zombie skills, occupations and named survivors ======================
   Survivors you recruit are now drawn from the 78 named characters (families + 11 Tarot archetypes) in CharacterStatBaseClassDB.txt:
   their attributes, skills, age, former job, relatives and starting items come from the file. FZ skills are folded into 047's 10 skills
   (guns = best of Pistol/Rifle/Assault/SMG, melee = Blades/Clubs, workman = Carpentry/Electrical/Mechanical/MetalWorking, first aid = FirstAid + 60% Medicine).
   Role (Guard/Medic/Builder/Scavenger) comes from their best skill group; under-16s are Generalists. Relatives in the fort give each other +10 morale. */
function fzParseChar(e,ty,cn,o){const{ch,tx,nm}=FZ.h;o.occ=o.occ||{};o.chars=o.chars||{};o.skills=o.skills||{};
 const kids=(p,t)=>{const x=ch(e,p);return x?Array.from(x.children).filter(c=>c.tagName===t):[]};
 if(/SkillClass$/.test(ty)){o.skills[cn]={a:tx(e,'BaseAttribute'),u:tx(e,'UmbrellaSkillName'),n:tx(e,'DisplayName')};return}
 const sk={};kids('Skills','Skill').forEach(s=>sk[s.getAttribute('Name')]=+s.getAttribute('Level'));
 const A=ch(e,ty==='Occupation'?'Stats':'Attributes'),a={};if(A)for(const c of A.children)a[c.tagName.toLowerCase()]=+c.textContent;
 if(ty==='Occupation'){o.occ[cn]={n:tx(e,'DisplayName'),a,sk};return}
 if(!/^(npc_|Tarot_)/.test(cn))return;
 o.chars[cn]={n:tx(e,'DisplayName'),sex:tx(e,'Sex'),age:nm(e,'Age'),fam:tx(e,'Family'),a,sk,occ:tx(e,'FormerOccupationLabel').replace('Occupation_',''),tarot:tx(e,'IsTarot')==='true',
  rel:kids('Relationships','Relationship').map(r=>[r.getAttribute('Type'),r.getAttribute('With')]),
  it:kids('PotentialItems','PotentialInventoryItem').map(i=>[tx(i,'ItemName'),nm(i,'MinNumber'),nm(i,'MaxNumber'),nm(i,'Odds')]),
  pr:kids('PotentialProjects','PotentialProject').map(p=>[tx(p,'Project'),nm(p,'Odds')])}}
function fzMapSk(sk){const g=k=>sk[k]||0,m=(...k)=>Math.max(...k.map(g));
 return{h2h:g('HandToHand'),spot:g('Spot'),first_aid:Math.min(100,g('FirstAid')+Math.round(g('Medicine')*.6)),social:g('Interaction'),guns:m('Pistol','Rifle','AssaultWeapons','SubMachine Guns'),melee:m('Blades','Clubs'),workman:m('Carpentry','Electrical','Mechanical','MetalWorking'),sneak:g('Sneak'),lockpick:g('LockPick'),scout:g('Scout')}}
function fzRole(c,p){if(c.age<16)return'Generalist';const s={Guard:Math.max(p.guns,p.melee),Medic:p.first_aid,Builder:p.workman,Scavenger:Math.max(p.scout,p.spot,p.lockpick,p.sneak)};let b='Generalist',m=30;for(const k in s)if(s[k]>m){m=s[k];b=k}return b}
function fzSurvivor(){const C=FZ.cfg&&FZ.cfg.chars;if(!C||!FZ.T.on)return null;G.fzUsed=G.fzUsed||[];
 const ids=Object.keys(C).filter(k=>!G.fzUsed.includes(k)&&!G.surv.some(s=>s.fz===k));if(!ids.length)return null;
 let pool=ids.filter(k=>!C[k].tarot);if(!pool.length||Math.random()<.08)pool=ids;
 const kin=pool.filter(k=>C[k].rel.some(r=>G.fzUsed.includes(r[1])||G.surv.some(q=>q.fz===r[1])));if(kin.length&&Math.random()<.35)pool=kin;
 const pre=window.__fzNext;window.__fzNext=null;const id=pre&&ids.includes(pre)?pre:pool[ri(0,pool.length-1)],c=C[id],a=Object.assign({smarts:15,power:15,speed:15,finesse:15,toughness:15},c.a),p=fzMapSk(c.sk);G.fzUsed.push(id);G.rescued++;
 const sv={id:Date.now()+ri(0,999),name:c.n,role:fzRole(c,p),hp:100,morale:60,hunger:0,skill:3,pending:1,fz:id,age:c.age,fam:c.fam,occ:c.occ,rel:c.rel,proj:c.pr,tarot:c.tarot,sk:{a,p,dly:{}}};starsFrom(sv);
 const inv=npcInv(sv),M=FZ.map,idm=x=>M.i[x]||M.w[x];
 c.it.forEach(([n,lo,hi,od])=>{const iid=idm(n);if(!iid||!ITEMS[iid]||Math.random()*100>=od)return;let x=lo,y=hi;if(y<x)[x,y]=[y,x];for(let i=ri(x,y);i>0;i--){const q=newInst(iid);if(q)invAdd(inv,q)}});
 return sv}
function fzTag(s){return s.fz?' <span class="m">('+(s.occ||'').replace(/([a-z])([A-Z])/g,'$1 $2')+(s.age?', '+s.age:'')+')</span>':''}
function fzJoined(s){if(!s.fz||!s.rel)return;const kin=G.surv.filter(q=>q!==s&&s.rel.some(r=>r[1]===q.fz));if(!kin.length)return;s.morale=Math.min(100,(s.morale||60)+10);kin.forEach(q=>q.morale=Math.min(100,(q.morale||60)+10));toast(s.name+' is reunited with '+kin.map(q=>q.name).join(', ')+' (+10 morale)')}
(function(){const dv=document.querySelector('#dev [data-p="state"]');if(!dv)return;const w=document.createElement('div');dv.appendChild(w);
 window.fzOccUI=()=>{const O=(FZ.cfg&&FZ.cfg.occ)||{};w.innerHTML='<h4>FZ occupation for the player (v049)</h4><div class="row"><select id="fz_occ">'+Object.keys(O).map(k=>`<option value="${k}">${O[k].n}</option>`).join('')+'</select><button onclick="fzSetOcc()">Apply to player</button></div><div class="m">'+Object.keys((FZ.cfg&&FZ.cfg.chars)||{}).length+' named survivors loaded</div>'};
 window.fzSetOcc=()=>{const o=FZ.cfg.occ[$('fz_occ').value],k=skOf(G),p=fzMapSk(o.sk);Object.assign(k.a,o.a);SKL.forEach(s=>k.p[s.id]=p[s.id]);try{devSkRender()}catch(e){}toast('[FZ] player is now: '+o.n)};fzOccUI()})();


/* ====================== v050: Fort Zombie zombie styles + AI ======================
   Every new zombie is now one of the 26 styles in ZombieDB.txt (generic is most common). Style gives: size (MinScale/MaxScale), health (TorsoReservoir x hpScale x size^2),
   bite damage dice (x biteScale), barricade/door damage dice (x barScale), clothing colours, jogger speed, and a weapon by weighted odds (cops: .38, soldiers: M16,
   baseball: bat, firemen: axe). Abilities done: Tackle (football; params from AI.txt), Jog (jogger). Armed melee zombies hit with the weapon's dice; armed gun zombies
   shoot at you. Stored but not active yet: ThrowZombie, CollectBodyParts, ReattachLimb/Head, climb odds, no-arms bite, AI view/lost-target/survivor-follow parameters. */
var FZS=null;
for(const[k,v]of Object.entries({hpScale:2,biteScale:4,barScale:1.7}))if(FZ.T[k]==null)FZ.T[k]=v;
function fzParseZ(e,ty,cn,o){const{ch,tx,nm}=FZ.h;o.zst=o.zst||{};o.ai=o.ai||{};
 if(ty==='ZombieStyle'){const ls=p=>{const x=ch(e,p);return x?Array.from(x.children).map(c=>c.textContent.trim()):[]},wx=ch(e,'Weapons');
  o.zst[cn]={climb:nm(e,'ClimbBarricadeOdds'),cm:nm(e,'ClimbBarricadeModifier',1),smin:nm(e,'MinScale',1),smax:nm(e,'MaxScale',1),res:nm(e,'TorsoReservoir',25),bar:tx(e,'AttackBarricadeDamage'),bite:tx(e,'BiteAttackDamage'),bnoarm:tx(e,'BiteAttackDamageNoArms'),mv:tx(e,'Movement'),ab:ls('AbilityNames'),st:ls('StyleTags'),
   w:wx?Array.from(wx.children).map(w=>[tx(w,'Key'),nm(w,'Weight')]):[],wo:nm(e,'WeaponOdds',100)};return}
 const a={};for(const c of e.children){if(/^(ClassName|ClassID|ParentClassName|ParentClassID)$/.test(c.tagName))continue;const v=parseFloat(c.textContent);a[c.tagName]=isNaN(v)?c.textContent:v}o.ai[cn]=a}
const FZP={schoolgirl:[0x3a4a7a,0x4a2a3a],bowler:[0x2a6a9a],WTF:[0x7a2a8a],doctor:[0xdfe8ee,0x2a6a7a],nurse:[0x9ad0d8,0x9ad0d8],paramedic:[0x2a4a8a,0x2a3a5a],plaid_jacket:[0x7a3a2a],white_shirt:[0xe8e8e8],army_soldier:[0x4a5a30,0x3a4a28],baker:[0xf0f0f0],cop:[0x1a2a4a,0x1a1a2a],baseball:[0x8a2020,0xdddddd],football:[0x2a4a8a,0xcccccc],hockey:[0x2a2a6a],fl_employee:[0x8a6a20],jogger:[0x20a0a0,0x303030],postal:[0x2a4a7a,0x2a2a3a],fire:[0x7a6a20,0x2a2a2a],butcher:[0xa8a0a0,0x5a4a3a],trucker:[0x3a5a8a],business:[0x2a2a3a,0x2a2a3a],femaletanktop:[0x6a8ab0],femalesundress:[0xd8b040,0xd8b040],femaleblackdress:[0x151515,0x151515],femalereddress:[0xa01818,0xa01818]};
function fzPal(cn){if(FZP[cn])return FZP[cn];const m=/(black|green|purple|red|white)hoodie/.exec(cn);return m?[{black:0x1a1a1a,green:0x2f6a3a,purple:0x5a3a7a,red:0x8a2a2a,white:0xd8d8d8}[m[1]]]:[]}
/* v072: armed styles are rare. Every other style weighs 1 (generic 6); cops and soldiers were 1 each (~1 zombie in 20 carried a gun), now ~1 in 110. */
var FZ_RARE=window.FZ_RARE={cop:.2,army_soldier:.15};
function fzPickStyle(sg){const S=FZ.cfg&&FZ.cfg.zst,ks=S?Object.keys(S):[];if(!ks.length)return null;if(FZ.force&&S[FZ.force])return[FZ.force,S[FZ.force]];
 const R=FZ_RARE,wt=k=>k==='generic'?6:R[k]!=null?R[k]:(sg&&/football|trucker/.test(k))?2:1;let r=Math.random()*ks.reduce((a,k)=>a+wt(k),0);for(const k of ks){r-=wt(k);if(r<=0)return[k,S[k]]}return[ks[0],S[ks[0]]]}
const fzBite=u=>Math.max(1,FZ.roll(u.bite))*FZ.T.biteScale,fzBar=u=>u.bar?Math.max(1,FZ.roll(u.bar))*FZ.T.barScale:u.dmg;
function fzApplyStyle(g,cn,fs){const u=g.userData,T=FZ.T,sc=rnd(Math.min(fs.smin,fs.smax),Math.max(fs.smin,fs.smax));g.scale.setScalar(sc);
 u.hp=fs.res*T.hpScale*sc*sc*FORTS[G.fort].z;u.sp=(fs.mv==='ZombieJogger'?4.6:2.2)*rnd(.9,1.1)*ZSPD;u.run=fs.mv==='ZombieJogger';u.big=sc>1.15;
 u.fzs=cn;u.hp0=u.hp;u.ab=fs.ab||[];u.bite=FZ.dice(fs.bite)||FZ.dice('1D4');u.bar=FZ.dice(fs.bar);u.climb=fs.climb;
 if(fs.w&&fs.w.length&&Math.random()*100<fs.wo){let r=Math.random()*fs.w.reduce((a,w)=>a+w[1],0),k=fs.w[0][0];for(const w of fs.w){r-=w[1];if(r<=0){k=w[0];break}}
  const id=FZ.map.w[k],d=id&&WDEF[id];if(d&&d.dice&&!u.no_armL){u.wpn=id;   /* v076: a zombie that spawned without its weapon arm gets no weapon */
  u.bite0=u.bite;if(d.type==='melee'){u.bite=d.dice;fzHold(g,id)}else if(d.type==='gun'){u.gun={d,ammo:d.cap,cd:rnd(1,2.5),rl:0};fzHold(g,id)}}}
 Object.defineProperty(u,'dmg',{get(){return fzBite(u)},set(v){},configurable:true,enumerable:true})}
const _zomb0=zombie;
zombie=function(x,z,kind,isFort){const P=FZ.T.on&&fzPickStyle(G.mode==='SIEGE');if(!P)return _zomb0(x,z,kind,isFort);
 const n0=zombies.length,pal=fzPal(P[0]);FZS={shirt:pal[0],pants:pal[1],style:P[0]};try{_zomb0(x,z,P[1].mv==='ZombieJogger'?'runner':'walker',isFort)}finally{FZS=null}
 if(zombies.length>n0)fzApplyStyle(zombies[zombies.length-1],P[0],P[1])};
function fzZAct(z,dt,horde){const u=z.userData;if(!u.fzs||u.sleep||u.rise>0||u.ragT>0||u.flop>0||u.vs)return;const p=z.position,p0=pl.position,d=Math.hypot(p.x-p0.x,p.z-p0.z),seen=u.see||(horde&&d<30)||(u.hunt>0&&d<14);
 if(fzIsMedic(u))fzMedicPlan(z,dt);if(u.gun){const g=u.gun;g.cd-=dt;if(g.rl>0){g.rl-=dt;if(g.rl<=0)g.ammo=g.d.cap}
  else if(g.cd<=0&&!u.aimG&&!u.tk&&!u.crawl){const T=fzGunTarget(z,seen);if(T)fzAimBegin(z,T)}}   /* v075: no instant shots: they stop, aim (laser sight) and only fire if you are still in view */
 if(u.ab&&u.ab.includes('Tackle')&&!u.tk&&!u.crawl){const A=(FZ.cfg.ai&&FZ.cfg.ai.ai_Zombie)||{};u.tkc=(u.tkc||0)-dt;
  // v072: the charge starts with a kneel (fzTackleStep): the direction is locked the moment he goes down, so you can sidestep it
  if(seen&&u.tkc<=0&&d>(A.Tackle_MinDistance||4)&&d<(A.Tackle_MaxDistance||10)&&Math.abs(p.y-(p0.y-(G.eyeUsed||1.6)))<1&&los(p,p0,1))fzTackleBegin(z,(p0.x-p.x)/d,(p0.z-p.z)/d)}}
/* v075 armed zombies (cops / soldiers): AIM, then FIRE. When a gun zombie has you (or a survivor) in sight and in range it stops dead,
   turns to face the target, raises the gun and paints it with a red laser sight for ~2.5 s (pose + laser: js/layers/zaim.js).
   If the target is still in view at the end it fires; if the target got out of sight (behind a wall, round a corner) for a moment
   the shot is cancelled and the zombie goes back to hunting. Hitting it hard enough to stagger it, knocking it down or killing it also cancels.
   Range is shorter than before (14 m, was 24 m). Tunables: FZ_AIM. */
var FZ_AIM=window.FZ_AIM={range:14,minRange:2.5,aim:2.5,aimVar:.4,lostGrace:.25,acc:.55,recover:[1.4,2.4]};
const fzTgtPos=(T,v)=>{v=v||new THREE.Vector3();if(T.m)return v.set(T.m.position.x,T.m.position.y+1.2,T.m.position.z);return v.set(pl.position.x,camera.getWorldPosition(v).y-.35,pl.position.z)};
function fzGunTarget(z,seen){const u=z.userData;if(u.no_armL||!u.hold){u.gun=null;return null}   /* v076: no gun arm, no shooting */
 const g=u.gun,p=z.position,R=Math.min(FZ_AIM.range,g.d.rng?g.d.rng*.6:FZ_AIM.range);let best=null,bd=R;
 const p0=pl.position,dp=Math.hypot(p.x-p0.x,p.z-p0.z);
 if(seen&&dp>FZ_AIM.minRange&&dp<bd&&Math.abs(p.y-(p0.y-(G.eyeUsed||1.6)))<3&&los(p,p0,1)){best={pl:1};bd=dp}
 if(typeof smesh!=='undefined')for(const m of smesh){const s=m.userData&&m.userData.s;if(!s||s.hp<=0)continue;const dm=Math.hypot(p.x-m.position.x,p.z-m.position.z);
  if(dm>FZ_AIM.minRange&&dm<bd&&los(p,m.position,1)){best={m};bd=dm}}
 return best}
function fzAimBegin(z,T){const u=z.userData;u.aimG={T,t:0,dur:FZ_AIM.aim+rnd(-FZ_AIM.aimVar,FZ_AIM.aimVar),lost:0,x0:z.position.x,z0:z.position.z,hp0:u.hp};u.atk=null;
 try{S.snarl(z.position)}catch(e){}}
function fzAimEnd(z,cd){const u=z.userData;if(!u.aimG)return;u.aimG=null;if(u.gun)u.gun.cd=cd!==undefined?cd:rnd(FZ_AIM.recover[0],FZ_AIM.recover[1]);if(window.ZAIM)ZAIM.clear(z)}
function fzAimStep(z,dt){const u=z.userData,a=u.aimG,g=u.gun,p=z.position,T=a.T;
 if(!g||u.no_armL||!u.hold||u.stag>0||u.kd||u.ragT>0||u.flop>0||u.vs||u.sleep||u.hp<a.hp0-12){if(u.no_armL||!u.hold)u.gun=null;fzAimEnd(z);return}   // staggered / knocked down / hurt: the aim is spoiled
 if(T.m&&(!smesh.includes(T.m)||!(T.m.userData.s&&T.m.userData.s.hp>0))){fzAimEnd(z,.6);return}
 a.t+=dt;p.x=a.x0;p.z=a.z0;
 const tp=fzTgtPos(T),dx=tp.x-p.x,dz=tp.z-p.z,d=Math.hypot(dx,dz),yaw=Math.atan2(dx,dz);z.rotation.set(0,yaw,0);u.yV=u.yT=yaw;a.d=d;
 const vis=d<FZ_AIM.range*1.3&&los(p,T.m?T.m.position:pl.position,1);
 if(!vis){a.lost+=dt;if(a.lost>FZ_AIM.lostGrace){   /* v076: sight broken: go after the target hand-to-hand (to where it was last seen) and aim again the moment it is back in view */
   u.hunt=Math.max(u.hunt||0,10);u.lx=tp.x;u.lz=tp.z;u.see=false;u.chaseMelee=1;fzAimEnd(z,.35);return}}else a.lost=0;
 if(d<1.8){fzAimEnd(z,.8);return}   /* right on top of it: no time to aim, claw instead */
 if(a.t<a.dur)return;
 // fire
 g.ammo--;if(g.ammo<=0)g.rl=4;try{S.shot(p)}catch(e){}
 const dmg=Math.max(1,g.d.dmg+FZ.band(g.d,d)),acc=FZ_AIM.acc*(d<8?1.2:d>11?.8:1);
 if(T.m){const sv=T.m.userData.s,hit=Math.random()<acc&&!(Math.random()<zMiss(sv));try{fzZTraceTo(z,fzTgtPos(T),hit)}catch(e){}
  if(hit){sv.hp-=dmg*skDmgMul(sv);flashObj(T.m,.3);try{bloodSpray(T.m.position.x,T.m.position.y+1.1,T.m.position.z,dx,dz,ri(6,10),1)}catch(e){}
   if(sv.hp<=0){toast(sv.name+' has fallen!');try{S.scream(T.m.position)}catch(e){}smesh=smesh.filter(q=>q!==T.m);if(window.survDown)survDown(T.m,p);else scene.remove(T.m)}}}
 else{const hit=Math.random()<acc&&!(Math.random()<zMiss(G));try{fzZTrace(z,hit)}catch(e){}if(hit)damage(dmg)}
 fzAimEnd(z,g.d.cd+rnd(FZ_AIM.recover[0],FZ_AIM.recover[1]))}
function fzZTraceTo(z,tp,hit){const o=npcMuzzle(z),c=0xffd27a;if(hit){addTracer(o,tp,.12,.02,c);addSpark(tp);return}
 const dir=tp.clone().sub(o).normalize();dir.x+=rnd(-.08,.08);dir.y+=rnd(-.05,.05);dir.z+=rnd(-.08,.08);dir.normalize();const r=rayWorld(o,dir,45,z),e=r?r.p:o.clone().addScaledVector(dir,45);addTracer(o,e,.12,.02,c);if(r)addSpark(e)}
window.fzAimStep=fzAimStep;window.fzAimEnd=fzAimEnd;
/* v072 football tackle: KNEEL (direction + facing locked, ~2.5 s, the pose is in js/layers/ztackle.js) -> CHARGE in a straight line along the locked
   direction -> recharge. While u.tk is set the normal AI is paused for this zombie (updateZombies calls fzTackleStep instead). */
var FZ_TACKLE=window.FZ_TACKLE={kneel:2.5,kneelVar:.35,reach:1.5,bowl:1.25};
function fzTackleBegin(z,dx,dz){const u=z.userData,l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;u.tk={ph:'kneel',t:0,dur:FZ_TACKLE.kneel+rnd(-FZ_TACKLE.kneelVar,FZ_TACKLE.kneelVar),dx,dz,yaw:Math.atan2(dx,dz),x0:z.position.x,z0:z.position.z};
 u.atk=null;u.zs=null;z.rotation.set(0,u.tk.yaw,0);u.yV=u.yT=u.tk.yaw;   // v072: set the WHOLE rotation: lookAt can leave x=z=PI, which mirrors a lone rotation.y
try{S.snarl(z.position)}catch(e){}}
function fzTackleEnd(z,stag){const u=z.userData,A=(FZ.cfg.ai&&FZ.cfg.ai.ai_Zombie)||{};u.tk=null;u.tkc=(A.Tackle_RechargeTime||3)+rnd(0,1.5);if(stag)u.stag=stag;u.px=z.position.x;u.pz=z.position.z}
function fzTackleStep(z,dt){const u=z.userData,k=u.tk,p=z.position,p0=pl.position,A=(FZ.cfg.ai&&FZ.cfg.ai.ai_Zombie)||{};k.t+=dt;
 z.rotation.set(0,k.yaw,0);u.yV=u.yT=k.yaw;
 if(k.ph==='kneel'){p.x=k.x0;p.z=k.z0;p.y=groundAt(p.x,p.z,p.y+.5);if(k.t>=k.dur){k.ph='charge';k.t=0;k.left=(A.Tackle_MaxDistance||10)+5;try{S.snarl(p)}catch(e){}}return}
 const v=(A.Tackle_ChargeSpeed||12)*ZSPD,step=Math.min(v*dt,k.left),nx=p.x+k.dx*step,nz=p.z+k.dz*step;k.left-=step;
 if(blocked(nx,nz,.45,p.y,1.8)){fzTackleEnd(z,.7);try{S.hit&&S.hit('blunt')}catch(e){}return}   // slams into whatever he was aimed at
 p.x=nx;p.z=nz;p.y=groundAt(p.x,p.z,p.y+.5);
 // v072 friendly fire: other zombies he runs through or past are bowled over (ragdolled), thrown forward and out to the side of his line
 if(typeof zKnock==='function'){k.bowled=k.bowled||new Set();for(const o of zombies){if(o===z||k.bowled.has(o))continue;const ou=o.userData;if(!ou||ou.kd||ou.sleep)continue;
   const ox=o.position.x-p.x,oz=o.position.z-p.z;if(ox*ox+oz*oz>FZ_TACKLE.bowl*FZ_TACKLE.bowl||Math.abs(o.position.y-p.y)>1.2)continue;
   const side=ox*k.dz-oz*k.dx,sx=k.dz*Math.sign(side||1),sz=-k.dx*Math.sign(side||1);
   if(zKnock(o,{x:k.dx*.8+sx*.6,z:k.dz*.8+sz*.6},5.5+Math.random()*2,1.6,'body')){k.bowled.add(o);if(window.ZKNOCK)ZKNOCK.stats.tackled++;try{S.hit&&S.hit('blunt')}catch(e){}}}}
 const feet=p0.y-(G.eyeUsed||1.6);
 if(Math.hypot(p.x-p0.x,p.z-p0.z)<FZ_TACKLE.reach&&Math.abs(p.y-feet)<1.2){damage(Math.max(1,FZ.roll(FZ.dice(A.Tackle_Damage||'2D6')))*FZ.T.biteScale*.5);S.snarl(p);
  for(let s=1;s<=6;s++){const qx=p0.x+k.dx*.5*s,qz=p0.z+k.dz*.5*s;if(blocked(qx,qz,.35,feet,1.6))break;p0.x=qx;p0.z=qz}fzTackleEnd(z,0);return}
 if(k.left<=0||k.t>3)fzTackleEnd(z,0)}
(function(){const dv=document.querySelector('#dev [data-p="zomb"]');if(!dv)return;const w=document.createElement('div');dv.appendChild(w);const T=FZ.T;
 window.fzZRender=()=>{const ks=Object.keys((FZ.cfg&&FZ.cfg.zst)||{}),n=k=>`<label class="dvl">${k} <input type="number" step=".1" id="fzz_${k}" value="${T[k]}" style="width:55px"></label>`;
  w.innerHTML='<h4>FZ zombies (v050)</h4><div class="row">'+n('hpScale')+n('biteScale')+n('barScale')+'<button onclick="fzZApply()">Apply</button></div><div class="row"><select id="fz_zs">'+ks.map(k=>`<option>${k}</option>`).join('')+'</select><button onclick="fzSpawn()">Spawn 5 near me</button></div><div class="m">'+ks.length+' styles loaded; hpScale 1 = file torso value; 2 = tougher, like 047</div>'};
 window.fzZApply=()=>{for(const k of['hpScale','biteScale','barScale'])T[k]=Math.max(.05,+$('fzz_'+k).value||1);try{localStorage.setItem('fz_tune',JSON.stringify(T))}catch(e){}toast('[FZ] zombie tuning set (affects new zombies)')};
 window.fzSpawn=()=>{FZ.force=$('fz_zs').value;for(let i=0;i<5;i++){const a=rnd(0,6.28),r=rnd(8,12);zombie(pl.position.x+Math.cos(a)*r,pl.position.z+Math.sin(a)*r,undefined,false)}FZ.force=null};fzZRender()})();


/* ====================== v051: free-placement barricades with a ghost ======================
   Z (in the fort) shows a ghost barricade a few metres in front of you: scroll wheel rotates it in 15 degree steps, Z again places it, X cancels.
   Anywhere inside the fort grounds works (green = valid, red = blocked / too close to you / not enough materials). Barricades can face any angle: each one is
   a chain of small collision blocks along its length. Spike traps were removed. */
var fzGh=null,fzOff=0;
function fzBarNear(b,px,pz){const c=Math.cos(b.ry||0),s=Math.sin(b.ry||0),t=Math.max(-2,Math.min(2,(px-b.x)*c-(pz-b.z)*s));return[b.x+c*t,b.z-s*t]}
function fzGhostPose(){const p=pl.position,d=3.6;return{x:Math.round((p.x-Math.sin(yaw)*d)*4)/4,z:Math.round((p.z-Math.cos(yaw)*d)*4)/4,ry:yaw+fzOff}}
function fzGhostOk(q){if(G.mat<15)return'Need 15 materials';if(pl.position.y-(G.eyeUsed||1.6)>.6)return'Build on the ground floor';
 if(q.x<BND[0]+3||q.x>BND[1]-3||q.z<BND[2]+3||q.z>BND[3]-3)return'That is outside the fort';
 const c=Math.cos(q.ry),s=Math.sin(q.ry);for(let t=-1.8;t<=1.81;t+=.45){const x=q.x+c*t,z=q.z-s*t;if(blocked(x,z,.45))return'Something is in the way';if(Math.hypot(x-pl.position.x,z-pl.position.z)<1.1)return'Too close to you'}return''}
function fzGhostOff(msg){if(!fzGh)return;scene.remove(fzGh);fzGh.geometry.dispose();fzGh.material.dispose();fzGh=null;if(msg)toast('Barricade cancelled')}
function fzBarKey(){if(G.mode!=='FORT_BUILD')return;
 if(!fzGh){if(G.mat<15)return toast('Not enough materials (15)');const g=fzGh=new THREE.Mesh(new THREE.BoxGeometry(4,2,.8),new THREE.MeshBasicMaterial({color:0x22c55e,transparent:true,opacity:.45,depthWrite:false}));
  const ln=new THREE.LineSegments(new THREE.EdgesGeometry(g.geometry),new THREE.LineBasicMaterial({color:0xffffff}));ln.raycast=()=>{};g.add(ln);g.raycast=()=>{};g.renderOrder=5;scene.add(g);fzOff=0;
  return toast('Barricade ghost: scroll = rotate, Z = place, X = cancel')}
 const q=fzGhostPose(),why=fzGhostOk(q);if(why)return toast(why);
 G.mat-=15;trainSk(G,'workman');const b={x:q.x,z:q.z,hp:100,ry:q.ry};G.bars.push(b);mkBar(b);fzGhostOff();toast('Barricade built')}
(function loop(){requestAnimationFrame(loop);if(!fzGh)return;if(G.mode!=='FORT_BUILD'||G.hqPause){fzGhostOff();return}
 const q=fzGhostPose();fzGh.position.set(q.x,1,q.z);fzGh.rotation.y=q.ry;fzGh.material.color.setHex(fzGhostOk(q)?0xef4444:0x22c55e)})();
addEventListener('wheel',e=>{if(!fzGh)return;e.preventDefault();fzOff+=(e.deltaY>0?1:-1)*Math.PI/12},{passive:false});


/* ====================== v052: rumor missions (MissionMapDB.txt) ======================
   Each expedition starts with 2 rumors, picked by the file's weights (Weapons 30, Supplies 40, Survivors 30). A rumor marks a coloured ring on the radar (an area ~ 2 blocks wide, not the exact
   building) and a row in the rumor list. The target building is chosen from the lot types that carry that mission tag in the file (Survivors: 70% a house), in the nearer half of the map
   (Placement 0-0.5 measured from your truck). The site holds a stash (weapons / supplies) or 2-3 survivors, guarded by 3-5 zombies. Walk into the building to confirm the rumor. */
var FZR=[];const FZCOL={mission_weapons:'#22c55e',mission_supplies:'#a855f7',mission_survivors:'#3b82f6'};   // v057: same colours as the Town Map pins
function fzParseM(e,ty,cn,o){const{ch,tx,nm}=FZ.h;o.lots=o.lots||{};o.rumors=o.rumors||{};
 if(ty==='PropertyLot'){const t=ch(e,'Tags');o.lots[cn]={a:tx(e,'asset'),max:nm(e,'MaxCount'),tags:t?Array.from(t.children).map(c=>c.textContent.trim()):[]};return}
 o.rumors[cn]={n:tx(e,'DisplayName'),tag:tx(e,'MissionPropertyTag'),w:nm(e,'MissionWeight'),pin:tx(e,'PushPinSpriteName'),res:nm(e,'ResidentialOdds'),nx:nm(e,'NumBlocksEW'),ny:nm(e,'NumBlocksNS'),p:[nm(e,'Placement/MinX'),nm(e,'Placement/MaxX'),nm(e,'Placement/MinY'),nm(e,'Placement/MaxY')]}}
function fzLotId(cn){for(const[rx,id]of FZ.map.l)if(new RegExp(rx,'i').test(cn))return id;return null}
/* v073: zMissionMapDB lot class names -> the town generator's building ids (NEWCAT). The old FZ.map.l table pointed at the quarantined
   legacy catalogue, so no rumour ever matched its lot type. A lot can name two buildings (Bank_DocOffice, Firehall_Boutique, Pawnshop_WhiteTrash). */
const FZLOT2NEW=[['gunstore','trigger_guard'],['sportsstore','dead_weight_sporting'],['pawn','golden_fences_pawn'],['gasstation','eco_pump'],['burgerjoint','willy_burgerorium'],
 ['drugstore','morgans_drug'],['vet','vet_clinic'],['church','church'],['theatre','the_aztec'],['supermarket|foodlib','food_library'],['diner','diner'],['autobody','auto_body_shop'],
 ['firehall','fire_hall'],['firehall_boutique|boutique','fancypantz_wearables'],['hammertime','hammertime'],['luckyducky','lucky_ducky'],['bowling','gutter_lanes'],['butcher','geins_butcheria'],
 ['bakery','bakery'],['_foo($|_)','mr_foos_takeout'],['coffee','cuppa_joe'],['storage','rays_storage_units'],['sunshinemotel','sunshine_motel'],['army_surplus','army_surplus'],
 ['bank_docoffice','piety_mutual_bank'],['bank_docoffice','piety_medical_clinic'],['watertower','water_tower_kerberos'],['corn_maze','corn_maze'],['carlot','krasche_burns_autos'],
 ['cemetary|cemetery','cemetery'],['forest01|_forest$','forest_a'],['forest02','forest_b'],['aid_station','aid_station'],['field_hospital','field_hospital'],
 ['playground_corner_(basic|picnic|deadworld)','playground_memorial_park'],['dead_park','dead_park'],['(^|_)park($|_)','town_park'],['yellow_cab','cab_depot'],
 ['plantnursery','plant_nursery'],['skatepark','skatepark'],['furniture','furniture_store'],['whitetrash','white_trash_house'],['res_|_res\\d','RES']];
function fzLotIds(cn){const out=[];for(const[rx,id]of FZLOT2NEW)if(new RegExp(rx,'i').test(cn))out.push(id);return out}
function fzCands(r){const lots=FZ.cfg.lots||{},ids=new Set();let res=false;
 for(const cn in lots){if(!lots[cn].tags.includes(r.tag))continue;for(const id of fzLotIds(cn)){if(id==='RES')res=true;else ids.add(id)}}
 const isRes=b=>{const c=NEWCAT.find(c=>c.id===b.cat);return c&&c.category==='residential'},B=window.__fortZombieTown.layout.bounds;
 const all=buildings.filter(b=>b.cat&&b.t!=='park'&&b.t!=='cemetery'&&Math.hypot(b.x-TRUCK.x,b.z-TRUCK.z)>25);
 const ok=b=>{const fx=(b.x-B.x0)/(B.x1-B.x0),fy=1-(b.z-B.z0)/(B.z1-B.z0);return fx>=r.p[0]&&fx<=r.p[1]&&fy>=r.p[2]&&fy<=r.p[3]};
 let pool=(res&&Math.random()<r.res?all.filter(isRes):all.filter(b=>ids.has(b.cat))).filter(ok);
 if(!pool.length)pool=all.filter(b=>ids.has(b.cat)||(res&&isRes(b)));return pool.length?pool:all}
function fzRumors(){FZR=[];const R=FZ.cfg&&FZ.cfg.rumors;if(!FZ.T.on||!R||G.mode!=='EXPEDITION')return;
 let pool=Object.keys(R);const pick=[];for(let n=0;n<2&&pool.length;n++){let x=Math.random()*pool.reduce((a,k)=>a+R[k].w,0),k=pool[0];for(const q of pool){x-=R[q].w;if(x<=0){k=q;break}}pick.push(k);pool=pool.filter(q=>q!==k)}
 pick.forEach(k=>{const r=R[k],c=fzCands(r);if(!c.length)return;const b=PK(c),m={k,name:r.n,col:FZCOL[r.tag]||'#fff',b,px:b.x+rnd(-18,18),pz:b.z+rnd(-18,18),done:false};
  const spot=()=>{for(let i=0;i<40;i++){const x=b.x+rnd(-b.w/2+2,b.w/2-2),z=b.z+rnd(-b.d/2+2,b.d/2-2);if(!blocked(x,z,.9))return[x,z]}return null};
  (r.tag==='mission_weapons'?['gunshop','gunshop']:r.tag==='mission_supplies'?['diner','clinic','hardware']:[]).forEach(t=>{const s=spot();if(s)spawnContainer(s[0],s[1],t)});
  if(r.tag==='mission_survivors')for(let i=ri(2,3);i>0;i--){const s=spot();if(s){const n=makePerson(0x0284c7,s[0],s[1]);n.rotation.y=rnd(0,TAU);n.userData={kind:'npc'};scene.add(n);npcList.push(n)}}
  for(let i=ri(3,5);i>0;i--){const s=spot();if(s)zombie(s[0],s[1])}
  FZR.push(m)});fzRumHud()}
WB.townPost.push(()=>{try{fzRumors()}catch(e){console.error('rumors',e)}});   /* v075: runs after town() and after the stepped town build */
function fzDrawRumors(c,X,Z){if(G.mode!=='EXPEDITION')return;for(const m of FZR){if(m.done)continue;let x=X(m.px),y=Z(m.pz);const dx=x-64,dy=y-64,d=Math.hypot(dx,dy);c.strokeStyle=m.col;c.fillStyle=m.col;c.lineWidth=2;
 if(d>54){const k=54/d;c.beginPath();c.arc(64+dx*k,64+dy*k,4,0,TAU);c.fill()}else{c.beginPath();c.arc(x,y,21,0,TAU);c.stroke();c.beginPath();c.arc(x,y,3,0,TAU);c.fill()}}}
// v056: rumors sit in their own HUD panel directly under the OPERATION panel (they used to print over it)
function fzRumHud(){let el=document.getElementById('fzRum');const hud=document.getElementById('hud');
 if(!el){el=document.createElement('div');el.id='fzRum';el.className='p';el.style.cssText='left:10px;top:200px;max-width:300px;font:12px sans-serif;line-height:1.5;color:#fff;pointer-events:none';(hud||document.body).appendChild(el)}
 const on=G.mode==='EXPEDITION'&&FZR.length;
 el.innerHTML=on?'<div class="r">'+(G.mission?'MISSION':'RUMORS')+'</div>'+FZR.map(m=>`<span style="color:${m.col}">&#9679;</span> ${m.done?'<s>':''}${m.name}${m.done?'</s> - confirmed':' - about '+Math.round(Math.hypot(m.px-pl.position.x,m.pz-pl.position.z))+' m away'}`).join('<br>'):'';
 el.style.display=on?'':'none';
 const op=hud&&hud.querySelector('#obj');const box=op&&op.closest('.p');if(on&&box)el.style.top=(box.offsetTop+box.offsetHeight+8)+'px'}
setInterval(()=>{if(G.mode!=='EXPEDITION'||!FZR.length){if(document.getElementById('fzRum'))fzRumHud();return}
 for(const m of FZR)if(!m.done){const b=m.b;if(Math.abs(pl.position.x-b.x)<b.w/2&&Math.abs(pl.position.z-b.z)<b.d/2){m.done=true;toast('Rumor confirmed: '+m.name+'!')}}fzRumHud()},500);


/* ====================== v053: Fort Zombie damage model, medic zombies, armed-zombie models, body HUD ======================
   - Zombie health is now the file's torso reservoir x hpScale (1 by default; 047 used 2). A gun shot to the HEAD always takes the head off and neutralises the zombie.
   - Neutralised zombies are not gone: Doctor, Paramedic and Nurse zombies (all three alike, v058) carry loose heads / limbs to a body and graft them on one at a time,
     then stand it up again at half health. Bodies shot to pieces (killed with at least double their health in damage, or by a heavy hit) cannot be revived.
   - Cops carry a visible .38 Colt Detective, baseball zombies the bat, soldiers an M4 (one shot at a time); gun zombies draw bullet trails and sparks.
   - Body HUD from UI.txt: head, torso, arms and legs show green / yellow (below half) / red (below a quarter) and flash white when hit. Wounds heal as your health recovers. */
if(FZ.T.v!==53){FZ.T.hpScale=1;FZ.T.v=53;try{localStorage.setItem('fz_tune',JSON.stringify(FZ.T))}catch(e){}}
function fzHold(g,id){const u=g.userData,P=u.parts,d=WDEF[id];if(!P||!P.elL||!d)return;const h=new THREE.Group();h.add(cloneModel(id,true));if(d.type==='gun')h.rotation.set(-Math.PI/2,0,Math.PI);else h.rotation.set(Math.PI/2+.45,Math.PI/2,0);h.position.set(0,P.handY||-.5,.02);P.elL.add(h);u.hold=h;u.hid=id}   // v069: melee edge faces forward
function fzZTrace(z,hit){const o=npcMuzzle(z),tp=new THREE.Vector3(pl.position.x,camera.position.y-.4,pl.position.z),c=0xffd27a;
 if(hit){addTracer(o,tp,.12,.02,c);addSpark(tp);return}
 const dir=tp.clone().sub(o).normalize();dir.x+=rnd(-.08,.08);dir.y+=rnd(-.05,.05);dir.z+=rnd(-.08,.08);dir.normalize();const r=rayWorld(o,dir,45,z),e=r?r.p:o.clone().addScaledVector(dir,45);addTracer(o,e,.12,.02,c);if(r)addSpark(e)}
const _kill0=killZ;
killZ=function(z){const u=z.userData;_kill0(z);if(FZ.T.on&&u.fzs){u.revive=!(-u.hp>=(u.hp0||50))&&!(u.ld>=60);u.hold&&(u.hold.visible=true)}};
/* ---- medic zombies (Doctor / Paramedic / Nurse): physically fetch loose heads and limbs and reattach them one at a time.
   Any head / arm / leg fits any body (side does not matter). Their primary goal is reviving A body: while a task is running they ignore the player
   entirely (the main AI is skipped, see updateZombies), with a 0-2 s pause between tasks. No other abilities. ---- */
const FZ_CAT=p=>p==='head'?'head':p[0]==='a'?'arm':'leg';
const fzIsMedic=u=>!!(u.ab&&(u.ab.includes('ReattachLimb')||u.ab.includes('ReattachHead')||u.ab.includes('CollectBodyParts')));
function fzMissing(c){const cu=c.userData,m=[];for(const p of['head','armL','armR','legL','legR'])if(cu['no_'+p])m.push(p);return m}
function fzLoose(cat,from,skip){let best=null,bd=1e9;for(const L of limbs){if(!L.part||L.carried||(L.res&&L.res!==skip&&zombies.includes(L.res)))continue;if(FZ_CAT(L.part)!==cat)continue;const d=Math.hypot(L.m.position.x-from.x,L.m.position.z-from.z);if(d<bd){bd=d;best=L}}return best?{L:best,d:bd}:null}
function fzFeasible(c,medic){const miss=fzMissing(c),need={head:0,arm:0,leg:0};for(const p of miss)need[FZ_CAT(p)]++;
 const pool={head:0,arm:0,leg:0};for(const L of limbs){if(!L.part||L.carried||(L.res&&L.res!==medic&&zombies.includes(L.res)))continue;pool[FZ_CAT(L.part)]++}
 return pool.head>=need.head&&pool.arm>=need.arm&&pool.leg>=need.leg}
function fzDropCarried(z){const u=z.userData,md=u.md;if(!md)return;md.fly=null;const L=md.limb;if(L&&L.carried){L.carried=false;L.res=null;if(L.m.parent)L.m.parent.remove(L.m);scene.add(L.m);L.m.position.set(z.position.x+rnd(-.4,.4),z.position.y+.6,z.position.z+rnd(-.4,.4));L.m.scale.set(1,1,1);L.rest=false;L.vx=L.vz=0;L.vy=0;if(!limbs.includes(L))limbs.push(L)}else if(L)L.res=null;md.limb=null;md.busy=false;md.st='idle';md.pose=null}
/* v058: grafts are physical. The carried part (a clone of another zombie's limb pivot) replaces the body's pivot, so a revived zombie wears
   whatever head / arms / legs it was given, from any body; side does not matter (arm into any arm socket, leg into any leg socket). */
function fzGraft(owner,slot,piv,mir){const u=owner.userData,P=u.parts;if(!P||!P[slot])return;const old=P[slot],par=old.parent||owner;
 piv.position.copy(old.position);piv.rotation.copy(old.rotation);piv.scale.set(mir?-1:1,1,1);piv.userData.mir=!!mir;piv.visible=true;   // v059: mirrored when it came from the other side
 piv.traverse(n=>{n.visible=true;if(Object.prototype.hasOwnProperty.call(n,'raycast'))delete n.raycast;if(n.isMesh){n.userData={part:slot};if(slot==='head')n.userData.head=1;n.frustumCulled=true}});
 if(old!==piv){par.remove(old);par.add(piv)}P[slot]=piv;
 if(slot==='armL'||slot==='armR'){const el=piv.children.find(c=>c.isGroup);if(el)P[slot==='armL'?'elL':'elR']=el}
 u['no_'+slot]=false;const sp=u.stumps&&u.stumps[slot];if(sp&&sp.parent)sp.parent.remove(sp);if(u.stumps)delete u.stumps[slot]}
function fzSocketWorld(c,slot,out){const P=c.userData.parts,pv=P&&P[slot];c.updateWorldMatrix(true,true);if(pv){pv.getWorldPosition(out);if(slot==='legL'||slot==='legR'){const q=pv.getWorldQuaternion(new THREE.Quaternion());out.add(new THREE.Vector3(0,-.4*c.scale.x,0).applyQuaternion(q))}}else out.copy(c.position).setY(c.position.y+.3);return out}
function fzRevive(doc,c){const cu=c.userData,pos=c.position.clone(),n0=zombies.length;FZ.force=cu.fzs;zombie(pos.x,pos.z,undefined,false);FZ.force=null;
 if(zombies.length===n0){cu.revive=false;return false}
 scene.remove(c);const di=dead.indexOf(c);if(di>=0)dead.splice(di,1);
 const g=zombies[zombies.length-1],u=g.userData;
 try{const CP=cu.parts,NP=u.parts;if(CP&&NP){for(const slot of['head','armL','armR','legL','legR'])if(CP[slot]&&!cu['no_'+slot]){const pv=CP[slot];if(pv.parent)pv.parent.remove(pv);fzGraft(g,slot,pv,!!(pv.userData&&pv.userData.mir))}
   const keep=new Set([NP.head,NP.armL,NP.armR]);for(const m of NP.body.children.slice())if(m.isMesh&&!keep.has(m))NP.body.remove(m);
   for(const m of CP.body.children.slice())if(m.isMesh&&!(m.geometry&&m.material&&m.material.color&&m.material.color.getHex()===0x7a0f0f)){CP.body.remove(m);NP.body.add(m);m.userData=Object.assign(m.userData||{},{})}}}catch(e){console.warn('[fz] revive graft',e)}
 u.sleep=true;u.pose='lie';sleepPose(g);u.hp=Math.max(10,(cu.hp0||50)*.5);u.hp0=cu.hp0||u.hp;wakeZ(g);floatText(pos.x,pos.y+2.2,pos.z,'Back up!','#fca5a5');return true}
function fzMedicPlan(z,dt){const u=z.userData;if(!u.fzs||u.sleep||u.rise>0||u.ragT>0||u.flop>0||u.vs)return;let md=u.md;if(!md)md=u.md={busy:false,st:'idle',wait:rnd(0,2),t:0};
 if(md.busy)return;if((md.wait-=dt)>0)return;md.wait=.4;
 let best=null,bd=40;for(const c of dead){const cu=c.userData;if(!cu.revive)continue;const d=Math.hypot(c.position.x-z.position.x,c.position.z-z.position.z);if(d>=bd)continue;if(!fzFeasible(c,z))continue;best=c;bd=d}
 if(!best)return;
 md.body=best;md.busy=true;fzMedicNext(z)}
function fzMedicNext(z){const u=z.userData,md=u.md,c=md.body;
 if(!c||!dead.includes(c)||!c.userData.revive){fzDropCarried(z);return}
 const miss=fzMissing(c);
 if(!miss.length){md.st='toBody';md.slot=null;md.limb=null;md.t=0;return}
 const slot=miss.includes('head')?'head':miss[0],f=fzLoose(FZ_CAT(slot),z.position,z);
 if(!f){fzDropCarried(z);return}
 md.slot=slot;md.limb=f.L;f.L.res=z;md.st='toPart';md.t=0}
function fzWalk(z,tx,tz,dt,stop){const u=z.userData,p=z.position,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);z.rotation.y=Math.atan2(dx,dz);if(d<=stop)return true;
 const sp=Math.min(u.sp||1.6,2.3*ZSPD)*(u.crawl?.6:1)*dt,nx=p.x+dx/d*sp,nz=p.z+dz/d*sp;if(!blocked(nx,nz,.5)){p.x=nx;p.z=nz}else if(!blocked(nx,p.z,.5))p.x=nx;else if(!blocked(p.x,nz,.5))p.z=nz;
 p.y=groundAt(p.x,p.z,p.y+1);return false}
function fzMedicTick(z,dt){const u=z.userData,md=u.md,p=z.position;md.t+=dt;
 const c=md.body;if(!c||!dead.includes(c)||!c.userData.revive){fzDropCarried(z);md.wait=rnd(0,2);return}
 if(md.limb&&!md.limb.carried&&!limbs.includes(md.limb)){md.limb=null;fzMedicNext(z);return}
 if(md.st==='toPart'){const L=md.limb;if(!L||!limbs.includes(L)){fzMedicNext(z);return}md.pose=null;if(fzWalk(z,L.m.position.x,L.m.position.z,dt,.85)){md.st='pick';md.t=0}else if(md.t>25){fzDropCarried(z);md.wait=1}}
 else if(md.st==='pick'){const L=md.limb;md.pose='pick';md.k=Math.min(1,md.t/.8);
  if(!L||(!L.carried&&!limbs.includes(L))){fzMedicNext(z);return}
  if(md.t>.4&&!L.carried){L.carried=true;L.rest=true;const P=u.parts,h=(P&&(P.elR||P.armR))||z;scene.remove(L.m);h.add(L.m);L.m.position.set(0,(P&&P.handY)||-.5,.14);L.m.rotation.set(Math.PI/2,0,0);L.m.scale.set(1/z.scale.x,1/z.scale.x,1/z.scale.x)}
  if(md.t>.8){md.st='toBody';md.t=0;md.pose='carry'}}
 else if(md.st==='toBody'){md.pose=md.limb?'carry':null;if(fzWalk(z,c.position.x,c.position.z,dt,1.15)){md.st=md.slot?'attach':'treat';md.t=0}else if(md.t>30){fzDropCarried(z);md.wait=1}}
 else if(md.st==='attach'){md.pose='work';md.k=Math.min(1,md.t/1.2);z.rotation.y=Math.atan2(c.position.x-p.x,c.position.z-p.z);
  const L=md.limb;
  if(L&&L.carried&&md.t>.25){if(!md.fly){scene.attach(L.m);md.fly={p0:L.m.position.clone(),q0:L.m.quaternion.clone(),s0:L.m.scale.clone()}}     // hand -> socket
   const k=Math.min(1,(md.t-.25)/.6),e=k*k*(3-2*k),tp=fzSocketWorld(c,md.slot,new THREE.Vector3()),c0=c.userData.parts&&c.userData.parts[md.slot],tq=c0?c0.getWorldQuaternion(new THREE.Quaternion()):md.fly.q0;
   L.m.position.lerpVectors(md.fly.p0,tp,e);L.m.position.y+=Math.sin(Math.PI*e)*.18;L.m.quaternion.copy(md.fly.q0).slerp(tq,e);L.m.scale.lerpVectors(md.fly.s0,new THREE.Vector3(c.scale.x,c.scale.x,c.scale.x),e);
   if(k>=1){const slot=md.slot;if(L.m.parent)L.m.parent.remove(L.m);fzGraft(c,slot,L.m,window.RZ?RZ.mirror(L,slot):false);const i=limbs.indexOf(L);if(i>=0)limbs.splice(i,1);L.carried=false;L.res=null;md.limb=null;md.fly=null;
    try{bloodSpray(tp.x,tp.y,tp.z,0,0,6,.4)}catch(e){}floatText(c.position.x,c.position.y+1.6,c.position.z,slot==='head'?'Head grafted on':'Limb grafted on','#a7f3d0')}}
  if(md.t>1.5&&!md.limb){md.pose=null;md.busy=false;md.st='idle';md.wait=rnd(0,2)}}
 else if(md.st==='treat'){md.pose='work';md.k=Math.min(1,md.t/1.4);z.rotation.y=Math.atan2(c.position.x-p.x,c.position.z-p.z);
  if(md.t>1.4){md.pose=null;md.busy=false;md.st='idle';md.wait=rnd(0,2);fzRevive(z,c)}}
}
window.fzMedicTick=fzMedicTick;
const _animZ0=animZ;
animZ=function(z,dt,horde){_animZ0(z,dt,horde);const md=z.userData.md;if(!md||!md.pose||!z.userData.parts)return;const P=z.userData.parts,t=performance.now()/1000;
 if(md.pose==='pick'){const k=Math.sin(Math.PI*Math.min(1,md.k))*1;if(P.body)P.body.rotation.x=.9*k;P.armL.rotation.x=P.armR.rotation.x=-.5-1.0*k}
 else if(md.pose==='carry'){if(P.body)P.body.rotation.x=.12;P.armR.rotation.x=-1.25;P.armL.rotation.x=-.5}
 else if(md.pose==='work'){const k=Math.min(1,md.k*3);if(P.body)P.body.rotation.x=.55*Math.min(1,k);P.armL.rotation.x=-1.35+Math.sin(t*13)*.18;P.armR.rotation.x=-1.35+Math.sin(t*13+1.7)*.18}};
const _kill1=killZ;
killZ=function(z){try{if(z.userData.md)fzDropCarried(z)}catch(e){}_kill1(z)};
/* ---- v058 Dev Mode > Zombies & Combat > Medic Zombies ---- */
(function(){const dv=document.querySelector('#dev [data-p="zomb"]');if(!dv)return;const w=document.createElement('div');w.id='devMedic';dv.appendChild(w);
 const MED={Doctor:'doctor',Paramedic:'paramedic',Nurse:'nurse'};
 w.innerHTML='<h4>Medic Zombies</h4><div class="row"><select id="fzMedK">'+Object.keys(MED).map(k=>`<option value="${MED[k]}">${k}</option>`).join('')+'</select><button id="fzMedSp" style="background:#7f1d1d">Spawn Medic + wrecked body</button><button id="fzMedClr">Clear all corpses and loose parts</button></div><div id="fzMedCnt" class="m" style="margin-top:4px"></div>';
 const withStyle=(st,f)=>{const on=FZ.T.on,fo=FZ.force;FZ.T.on=true;FZ.force=st;try{return f()}finally{FZ.T.on=on;FZ.force=fo}};
 const one=(x,z,st)=>{const n0=zombies.length;withStyle(st,()=>zombie(x,z,undefined,false));return zombies.length>n0?zombies[zombies.length-1]:null};
 window.fzMedicSpawn=function(style){if(typeof pl==='undefined'||!zombies)return;style=style||($('fzMedK')||{}).value||'doctor';
  const a0=Math.atan2(-Math.cos(yaw),-Math.sin(yaw)),cx=pl.position.x+Math.cos(a0)*9,cz=pl.position.z+Math.sin(a0)*9;   // ~9 m in front of you
  const S=FZ.cfg&&FZ.cfg.zst||{},gen=S.generic?'generic':Object.keys(S).find(k=>!/doctor|nurse|paramedic/.test(k))||null;let parts=0,bodies=0;
  for(let i=0;i<3;i++){const an=a0+(i-1)*.9,x=cx+Math.cos(an)*rnd(2.5,4),zz=cz+Math.sin(an)*rnd(2.5,4);if(blocked(x,zz,.6))continue;const z=one(x,zz,gen);if(!z)continue;const u=z.userData;u.ld=0;
   const lim=['armL','armR','legL','legR'].sort(()=>Math.random()-.5).slice(0,ri(1,3));if(Math.random()<.45)lim.push('head');
   for(const pt of lim){const fx=z.position.x+rnd(-1,1),fz=z.position.z+rnd(-1,1);if(zombies.includes(z)&&dismember(z,pt,fx,fz))parts++}
   if(zombies.includes(z)){u.hp=0;killZ(z)}if(dead.includes(z)){z.userData.revive=true;bodies++}}
  const m=one(cx+rnd(-1,1),cz+rnd(-1,1),style);if(m){m.userData.md={busy:false,st:'idle',wait:rnd(0,2),t:0};m.userData.devMedic=1}
  toast('Spawned a '+style+' zombie + '+bodies+' wrecked bod'+(bodies===1?'y':'ies')+' ('+parts+' loose parts)');fzMedCount()};
 window.fzMedicClear=function(){for(const z of zombies){const md=z.userData.md;if(md&&md.busy){fzDropCarried(z);md.wait=rnd(0,2)}}
  for(const c of dead)if(c.parent)c.parent.remove(c);dead.length=0;for(const L of limbs)if(L.m&&L.m.parent)L.m.parent.remove(L.m);limbs.length=0;toast('All corpses and loose parts cleared');fzMedCount()};
 window.fzMedCount=function(){const el=$('fzMedCnt');if(!el)return;const loose=limbs.filter(L=>L.part&&!L.carried).length,carried=limbs.filter(L=>L.part&&L.carried).length,
   rev=dead.filter(c=>c.userData.revive).length,meds=zombies.filter(z=>fzIsMedic(z.userData)),busy=meds.filter(z=>z.userData.md&&z.userData.md.busy).length;
  el.innerHTML=`Loose parts: <b class="y">${loose}</b>${carried?` (+${carried} carried)`:''} · Revivable corpses: <b class="y">${rev}</b> · Working medics: <b class="g">${busy}</b> / ${meds.length}`};
 $('fzMedSp').onclick=()=>fzMedicSpawn();$('fzMedClr').onclick=()=>fzMedicClear();
 setInterval(()=>{if(w.offsetParent)try{fzMedCount()}catch(e){}},400)})();
/* body HUD */
const FZL={head:{w:.08,m:30},torso:{w:.34,m:60},armL:{w:.15,m:35},armR:{w:.15,m:35},legL:{w:.14,m:40},legR:{w:.14,m:40}};var fzW={head:0,torso:0,armL:0,armR:0,legL:0,legR:0},fzWt={},fzLast=100;
const _dmg0=damage;damage=function(a){_dmg0(a);if(!FZ.T.on)return;let r=Math.random(),k='torso';for(const p in FZL){r-=FZL[p].w;if(r<=0){k=p;break}}fzW[k]=Math.min(1,fzW[k]+a/FZL[k].m);fzWt[k]=performance.now()};
(function(){const cv=document.createElement('canvas');cv.width=64;cv.height=96;cv.id='fzBody';cv.style.cssText='position:fixed;left:12px;bottom:92px;opacity:.9;pointer-events:none;z-index:5';document.body.appendChild(cv);const c=cv.getContext('2d');
 const part=(k,fn)=>{const f=1-fzW[k],fl=performance.now()-(fzWt[k]||-1e9)<700;c.fillStyle=fl?'#fff':f<.25?'rgb(196,0,0)':f<.5?'rgb(255,255,0)':'rgb(0,255,0)';fn()};
 setInterval(()=>{const hud=document.getElementById('hud');if(!FZ.T.on||!hud||hud.classList.contains('hide')){cv.style.display='none';return}cv.style.display='block';
  if(G.hp>fzLast){const r=(G.hp-fzLast)/Math.max(1,100-fzLast);for(const p in fzW)fzW[p]*=Math.max(0,1-r)}fzLast=G.hp;
  c.clearRect(0,0,64,96);part('head',()=>{c.beginPath();c.arc(32,10,8,0,6.29);c.fill()});part('torso',()=>c.fillRect(19,20,26,38));part('armL',()=>c.fillRect(6,22,11,32));part('armR',()=>c.fillRect(47,22,11,32));part('legL',()=>c.fillRect(19,60,12,34));part('legR',()=>c.fillRect(33,60,12,34))},100)})();

