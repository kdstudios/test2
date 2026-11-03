/* =====================================================================================================
   MINI FORT ZOMBIE v071 - OCCUPATION SCREEN (New Game -> Occupation -> Choose your fort)
   Occupations come from the Fort Zombie data (FZ.cfg.occ). Each one sets your five attributes and ten skills. You may then move
   points: every attribute / skill can go at most 10 below or 10 above the occupation's value, and points you take away go into a
   pool (one pool for attributes, one for skills) that is the only source for raising others.
   The result is applied straight after initCampaign, into G.sk (which the save file already stores) together with the occupation
   name (G.sk.occ / G.sk.occN), so it survives save / load.
   ===================================================================================================== */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const LIM=10;
const ICON={
 Paramedic:'<path d="M19 6h10v13h13v10H29v13H19V29H6V19h13z"/><path d="M24 14v20M20.5 18.5c3-2.5 6 0 3.5 2.5s-4 3.5-1 5.5 5 0 3 3"/>',
 Soldier:'<path d="M9 13l15 9 15-9M9 22l15 9 15-9M9 31l15 9 15-9"/>',
 PoliceOfficer:'<path d="M24 4l15 6v12c0 11-7 18-15 22C16 40 9 33 9 22V10z"/><path d="M24 14l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L24 28.9l-5.8 3 1.1-6.5-4.7-4.6 6.5-.9z"/>',
 ConstructionWorker:'<path d="M10 32c0-9 6-16 14-16s14 7 14 16"/><path d="M20 16.6V12h8v4.6M24 12v14"/><path d="M5 32h38v5H5z"/>',
 ExConvict:'<circle cx="14" cy="31" r="8"/><circle cx="34" cy="31" r="8"/><path d="M14 23v-5M34 23v-5M14 18c3-6 17-6 20 0"/>',
 Trucker:'<path d="M4 31V13h23v18M27 18h9l7 8v5H27"/><circle cx="12" cy="34" r="4"/><circle cx="35" cy="34" r="4"/><path d="M4 31h4M16 31h15M39 31h4M30 21h5"/>',
 Doctor:'<path d="M12 6v10a8 8 0 0016 0V6"/><path d="M20 24v7a8 8 0 0016 0v-5"/><circle cx="36" cy="22" r="4"/><path d="M9 6h6M25 6h6"/>',
 Reporter:'<rect x="17" y="4" width="14" height="23" rx="7"/><path d="M11 21a13 13 0 0026 0M24 34v8M16 42h16M17 12h5M17 18h5"/>',
 CollegeStudent:'<path d="M3 18l21-9 21 9-21 9z"/><path d="M11 22v9c0 3 6 6.5 13 6.5s13-3.5 13-6.5v-9M41 20v12"/><circle cx="41" cy="34" r="2"/>'};
const FLAV={
 Paramedic:'Kept people breathing on the worst nights. Patches the fort up better than anyone.',
 Soldier:'Trained for this. Steady with a rifle and very hard to put down.',
 PoliceOfficer:'Knows a sidearm and a nightstick, and stays calm when the street falls apart.',
 ConstructionWorker:'Built things for a living. Barricades go up fast and stay up.',
 ExConvict:'Notices everything, opens anything and moves without a sound.',
 Trucker:'Knows every back road. Shorter drives, thicker hide.',
 Doctor:'Sharp mind, steady hands. Medicine is worth more than bullets now.',
 Reporter:'Reads people and places fast, and can talk a stranger into joining the fort.',
 CollegeStudent:'Strong, adaptable and surprisingly handy with tools.'};
const OC={key:null,base:null,da:{},dp:{}};
const occs=()=>{try{return(FZ.cfg&&FZ.cfg.occ)||{}}catch(e){return{}}};
function baseOf(key){const o=occs()[key];if(!o)return null;const a=Object.assign({smarts:25,finesse:25,power:25,speed:25,toughness:25},o.a),p=fzMapSk(o.sk);return{a,p}}
const pool=d=>Object.values(d).reduce((s,v)=>s-v,0);   // points taken out minus points put in

/* ---------------- markup ---------------- */
const scr=document.createElement('div');scr.id='occ';scr.className='scr hide';
scr.innerHTML='<div class="occWrap"><header class="selHead"><button class="winBack" onclick="ui(\'menu\')"><kbd>Esc</kbd> Back</button><div><div class="kicker">New campaign &middot; Step 1 of 2</div><h2>Choose your occupation</h2><p>Who were you before? Pick a trade, then fine-tune it: take up to 10 points from any attribute or skill, then spend the pool wherever you like. A skill&rsquo;s total is its attribute plus its skill points.</p></div></header>'+
 '<div class="occBody"><div id="occList" class="occList"></div><section class="win occDetail"><div class="occTop"><svg id="occBig" viewBox="0 0 48 48"></svg><div><div class="kicker" id="occKick"></div><h3 id="occName"></h3><p id="occFlav"></p></div></div>'+
 '<div class="occCols"><div class="occCard"><div class="occH"><span>Attributes</span><b id="occPA"></b></div><div id="occA"></div></div><div class="occCard"><div class="occH"><span>Skills</span><b id="occPS"></b></div><div id="occS"></div></div></div>'+
 '<div class="occFoot"><button class="warnBtn" id="occReset">Reset points</button><span class="m" id="occHint">Take up to 10 from any value, spend the pool anywhere.</span><button class="priBtn" id="occGo">Proceed &rarr;</button></div></section></div></div>';
document.body.appendChild(scr);

function renderList(){const L=$('occList'),O=occs();L.innerHTML='';
 Object.keys(O).forEach(k=>{const b=baseOf(k),top=Object.entries(b.p).sort((x,y)=>y[1]-x[1]).slice(0,2).map(e=>SKL.find(s=>s.id===e[0]).n);
  const t=document.createElement('button');t.className='occTile'+(k===OC.key?' on':'');t.dataset.k=k;
  t.innerHTML='<svg viewBox="0 0 48 48">'+(ICON[k]||ICON.CollegeStudent)+'</svg><b>'+O[k].n+'</b><small>'+top.join(' &middot; ')+'</small>';
  t.onclick=()=>{try{S.ui()}catch(e){}select(k)};L.appendChild(t)})}
function select(k){OC.key=k;OC.base=baseOf(k);OC.da={};OC.dp={};ATTRS.forEach(a=>OC.da[a[0]]=0);SKL.forEach(s=>OC.dp[s.id]=0);renderList();renderDetail()}
function row(kind,id,label,sub,base,d,free,at,at0){const v=base+d,cap=kind==='p'?100-at:100,canDn=d>-LIM&&v>0,canUp=v<cap&&free>0;
 // skills: the total you play with is attribute + skill points (max 100), the same sum the in-game Skills screen shows
 const tot=kind==='p'?Math.min(100,at+v):v,mark=kind==='p'?Math.min(100,at0+base):base;
 const bar=kind==='p'?'<i class="oa" style="width:'+Math.min(100,at)+'%"></i><i class="os" style="left:'+Math.min(100,at)+'%;width:'+Math.max(0,tot-Math.min(100,at))+'%"></i>':'<i style="width:'+v+'%"></i>';
 return '<div class="occRow'+(d>0?' up':d<0?' dn':'')+'"><span class="ol">'+label+(sub?'<i>'+sub+'</i>':'')+'</span><button data-k="'+kind+'" data-id="'+id+'" data-d="-1"'+(canDn?'':' disabled')+'>&minus;</button>'+
  '<span class="ob">'+bar+'<em style="left:'+mark+'%"></em></span><b title="'+(kind==='p'?at+' attribute + '+v+' skill':'')+'">'+tot+(kind==='p'?'<small>'+at+'+'+v+'</small>':'')+'</b><button data-k="'+kind+'" data-id="'+id+'" data-d="1"'+(canUp?'':' disabled')+'>+</button><span class="od">'+(d?(d>0?'+':'')+d:'')+'</span></div>'}
function renderDetail(){const k=OC.key,O=occs()[k];if(!O)return;$('occBig').innerHTML=ICON[k]||'';$('occName').textContent=O.n;$('occFlav').textContent=FLAV[k]||'';
 const ta=ATTRS.slice().sort((x,y)=>OC.base.a[y[0]]-OC.base.a[x[0]])[0];$('occKick').textContent='Strongest attribute: '+ta[1];
 const fa=pool(OC.da),fs=pool(OC.dp);$('occPA').textContent=fa+' point'+(fa===1?'':'s')+' to spend';$('occPS').textContent=fs+' point'+(fs===1?'':'s')+' to spend';
 $('occPA').classList.toggle('live',fa>0);$('occPS').classList.toggle('live',fs>0);
 $('occA').innerHTML=ATTRS.map(a=>row('a',a[0],a[1],'',OC.base.a[a[0]],OC.da[a[0]],fa)).join('');
 $('occS').innerHTML=SKL.map(s=>row('p',s.id,s.n,s.a.slice(0,3),OC.base.p[s.id],OC.dp[s.id],fs,OC.base.a[s.a]+OC.da[s.a],OC.base.a[s.a])).join('');
 $('occHint').textContent=fa||fs?'Unspent points are lost when you proceed.':'Take up to 10 from any value, spend the pool anywhere.'}
scr.addEventListener('click',e=>{const b=e.target.closest('button[data-d]');if(!b||b.disabled)return;const D=b.dataset.k==='a'?OC.da:OC.dp,id=b.dataset.id,st=+b.dataset.d*(e.shiftKey?5:1);
 for(let i=0;i<Math.abs(st);i++){const isA=b.dataset.k==='a',base=isA?OC.base.a[id]:OC.base.p[id],d=D[id],free=pool(D),sk=!isA&&SKL.find(q=>q.id===id),cap=isA?100:100-(OC.base.a[sk.a]+OC.da[sk.a]);if(st>0){if(base+d<cap&&free>0)D[id]++}else{if(d>-LIM&&base+d>0)D[id]--}}
 try{S.click&&S.click()}catch(_){}renderDetail()});
$('occReset').onclick=()=>select(OC.key);
$('occGo').onclick=()=>{const b=OC.base,a={},p={};ATTRS.forEach(x=>a[x[0]]=b.a[x[0]]+OC.da[x[0]]);SKL.forEach(s=>p[s.id]=b.p[s.id]+OC.dp[s.id]);
 window.MFZ_OCC={key:OC.key,name:occs()[OC.key].n,a,p};try{S.ui()}catch(e){}ui('sel')};

/* ---------------- flow: New Game opens this first; the fort screen's Back returns here ---------------- */
window.newGame=function(){try{S.ui()}catch(e){}if(!OC.key){const ks=Object.keys(occs());if(!ks.length){ui('sel');return}select(ks[0])}else{renderList();renderDetail()}ui('occ')};
const _ui=window.ui;
window.ui=function(id){$('occ').classList.toggle('hide',id!=='occ');return _ui.apply(this,arguments)};
{const bk=document.querySelector('#sel .selHead .winBack');if(bk)bk.setAttribute('onclick',"ui('occ')");const kk=document.querySelector('#sel .selHead .kicker');if(kk)kk.textContent='New campaign · Step 2 of 2'}
addEventListener('keydown',e=>{if(e.code!=='Escape'||e.repeat||$('occ').classList.contains('hide'))return;e.preventDefault();ui('menu')});

/* ---------------- apply after the campaign is created (all other initCampaign wrappers have run) ---------------- */
const _ic=initCampaign;
initCampaign=function(){const r=_ic.apply(this,arguments);const o=window.MFZ_OCC;
 if(o){try{const k=skOf(G);Object.assign(k.a,o.a);Object.assign(k.p,o.p);k.occ=o.key;k.occN=o.name}catch(e){console.warn('[occ] apply failed',e)}}return r};
/* show the occupation on the skills screen */
if(typeof skShow==='function'){const _ss=skShow;skShow=function(o){const r=_ss.apply(this,arguments);try{const k=skOf(o);if(k&&k.occN){const h=document.querySelector('#skScr .box .h.r');if(h&&!h.querySelector('.occTag'))h.insertAdjacentHTML('beforeend',' <span class="occTag">&middot; '+k.occN+'</span>')}}catch(e){}return r}}
window.MFZOCC={select,state:OC};
console.log('[occ] occupation screen ready ('+Object.keys(occs()).length+' occupations)');
})();
