/* ==========================================================================================================
   MINI FORT ZOMBIE - GRAPHICS SETTINGS + OPTIONS > GRAPHICS TAB
   Ported in spirit from Modern's options menu. Owns one settings object (RGFX.s) that the atmosphere,
   post-processing and detail layers read. Saved in localStorage ("mfz_gfx"). Nothing in here touches gameplay.
   Load order: this file first, then atmosphere.js and detail.js (they register with RGFX.onChange).
   ========================================================================================================== */
(function(){
'use strict';
const KEY='mfz_gfx';
const DEF={
 weather:'auto',     // auto | clear | overcast | fog | rain | snow | dust | doom
 siegeWx:'doom',   // weather forced for the Day-14 siege: doom | same | off
 sky:1,              // procedural sky dome
 post:1,             // grade + vignette pass
 bloom:1,            // 0 off, 1 soft, 2 strong
 vignette:35,        // 0..100
 exposure:100,       // 60..140 %
 saturation:100,     // 50..150 %
 particles:2,        // 0 off, 1 low, 2 medium, 3 high
 fog:100,            // % of weather fog density
 nmStrength:100,     // % normal-map strength on world surfaces
 detail:2,           // ground-cover density: 0 off, 1 light, 2 full, 3 lush (applies on the next world build)
 lightning:1,
 flora:1,           // 1 = Modern Modern vegetation (leaf-card trees, shrubs, grass, flowers, garden props), 0 = classic MFZ primitives
 melee:1,           // 1 = detailed melee weapon models (js/modern/melee.js), 0 = classic icon-extruded blocks
 smodel:1,          // 1 = unique Modern survivor models (js/modern/survivors.js), 0 = classic MFZ block people
 zmodel:1,          // 1 = modular Modern zombie bodies (js/modern/zbody.js), 0 = classic MFZ block zombies
 props:1,           // 1 = Modern props (cars, trucks, street furniture, barriers, debris, roof kit), 0 = classic MFZ primitives
 arch:2,            // architecture + prop detail: 0 off, 1 facade only, 2 full (facade, gardens, interiors)
 archStyle:'mixed'  // mixed | greek | european | modern
};
const RGFX=window.RGFX={s:Object.assign({},DEF),def:DEF,hooks:[],presetNames:[]};
try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');for(const k in DEF)if(k in o&&typeof o[k]===typeof DEF[k])RGFX.s[k]=o[k]}catch(e){}
{const MIG={meltem:'greek',french:'european',hortus:'modern',tephra:'doom'};for(const k in RGFX.s){const v=RGFX.s[k];if(typeof v==='string'&&MIG[v])RGFX.s[k]=MIG[v]}}   // v065: settings saved under the old style / weather names
RGFX.save=()=>{try{localStorage.setItem(KEY,JSON.stringify(RGFX.s))}catch(e){}};
RGFX.onChange=fn=>RGFX.hooks.push(fn);
RGFX.set=function(k,v){RGFX.s[k]=v;RGFX.save();for(const h of RGFX.hooks){try{h(k,v)}catch(e){console.warn('[gfx] hook',e)}}refreshUI()};
RGFX.reset=()=>{for(const k in DEF)RGFX.s[k]=DEF[k];RGFX.save();for(const h of RGFX.hooks){try{h('*')}catch(e){}}refreshUI()};

/* ------------------------------------ UI ------------------------------------ */
const WX=[['auto','Auto (by day)'],['clear','Clear'],['overcast','Overcast'],['fog','Fog'],['rain','Storm'],['snow','Snow'],['dust','Sandstorm'],['doom','Doom']];
const ROWS=[
 ['h','Atmosphere'],
 ['seg','weather','Weather','Auto picks a different sky for each day. The other options force one weather everywhere.',WX],
 ['seg','siegeWx','Siege weather','Day 14. Doom is the volcanic ash storm: ember sky, falling ash, lightning in the plume.',[['doom','Doom'],['same','Same as other days'],['off','Plain']]],
 ['seg','sky','Sky',null,[[1,'Procedural'],[0,'Classic']]],
 ['seg','particles','Weather particles',null,[[0,'Off'],[1,'Low'],[2,'Medium'],[3,'High']]],
 ['seg','lightning','Lightning',null,[[1,'On'],[0,'Off']]],
 ['rng','fog','Fog density',50,200,5,'%'],
 ['h','Image'],
 ['seg','post','Colour grading',null,[[1,'On'],[0,'Off']]],
 ['seg','bloom','Bloom',null,[[0,'Off'],[1,'Soft'],[2,'Strong']]],
 ['rng','exposure','Exposure',60,140,5,'%'],
 ['rng','saturation','Saturation',50,150,5,'%'],
 ['rng','vignette','Vignette',0,100,5,'%'],
 ['h','Surfaces & detail'],
 ['rng','nmStrength','Normal-map strength',0,200,10,'%'],
 ['seg','flora','Vegetation','Modern = textured leaf-card trees, shrubs, meadow, flowers and park gardens. Applies when the next world is built.',[[1,'Modern'],[0,'Classic']]],
 ['seg','melee','Melee weapons','Detailed true-scale melee models (bat, crowbar, machete, katana, broadsword, fire axe, shovel, pitchfork, sickle). Applies to weapons drawn from now on.',[[1,'Detailed'],[0,'Classic']]],
 ['seg','smodel','Survivor models','Unique Modern-body designs for every named survivor. Applies to survivors drawn from now on.',[[1,'Modern'],[0,'Classic']]],
 ['seg','zmodel','Zombie models','Modular Modern bodies: every head, arm and leg can come off and fit any other zombie. Applies to zombies spawned from now on.',[[1,'Modern'],[0,'Classic']]],
 ['seg','props','Props & vehicles','Modern cars, army truck, benches, bins, jersey barriers, debris, roof equipment, poles. Applies when the next world is built.',[[1,'Modern'],[0,'Classic']]],
 ['seg','arch','Architecture detail','Shutters, awnings, balconies, ivy, window boxes, gardens, pergolas and furnished interiors (curtains, rugs, pictures, lamps). Applies when the next world is built.',[[0,'Off'],[1,'Facade'],[2,'Full']]],
 ['seg','archStyle','Architecture style','Greek = blue Cycladic, European = painted volets + stone, Modern = ivy + glass + gardens.',[['mixed','Mixed by district'],['greek','Greek'],['european','European'],['modern','Modern']]],
 ['seg','detail','Ground detail',"Grass, flowers, pebbles and ash drifts. Applies the next time a world is built (new run, new day).",[[0,'Off'],[1,'Light'],[2,'Full'],[3,'Lush']]]
];
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
let built=false;
function build(){
 const box=document.getElementById('optG');if(!box||built)return;built=true;
 box.appendChild(el('div','h r','Graphics')).style.fontSize='22px';
 const note=el('div','m','All video and graphics settings. Changes apply immediately unless noted.');note.style.cssText='font-size:11px;opacity:.7;margin:2px 0 6px';box.appendChild(note);
 // v058: the old Video tab (FOV, mouse sensitivity, render quality, antialiasing) lives here now; its controls keep their own handlers
 const vv=document.getElementById('optV');if(vv){const h=el('div','h y','Display');h.style.cssText='font-size:15px;margin:10px 0 2px;border-bottom:1px solid #444';box.appendChild(h);
  const wrap=el('div','');wrap.id='optVmoved';for(const c of Array.from(vv.children))if(!c.classList.contains('h'))wrap.appendChild(c);box.appendChild(wrap)}
 for(const r of ROWS){
  if(r[0]==='h'){const h=el('div','h y',r[1]);h.style.cssText='font-size:15px;margin:14px 0 2px;border-bottom:1px solid #444';box.appendChild(h);continue}
  const row=el('div','optRow');row.dataset.k=r[1];
  if(r[0]==='seg'){
   row.appendChild(el('span','',r[2]+'<br>'));
   for(const [v,l] of r[4]){const b=el('button','gfb',l);b.dataset.v=v;b.onclick=()=>RGFX.set(r[1],typeof RGFX.def[r[1]]==='number'?+v:v);row.appendChild(b);row.appendChild(document.createTextNode(' '))}
   if(r[3]){const s=el('div','',r[3]);s.style.cssText='font-size:11px;opacity:.7;margin-top:3px';row.appendChild(s)}
  }else{
   const lab=el('span','',r[2]+': <b class="y gv"></b>');row.appendChild(lab);row.appendChild(el('br'));
   const inp=document.createElement('input');inp.type='range';inp.min=r[3];inp.max=r[4];inp.step=r[5];inp.oninput=()=>RGFX.set(r[1],+inp.value);row.appendChild(inp);
  }
  box.appendChild(row);
 }
 const rs=el('button','mbtn','Reset graphics to defaults');rs.style.marginTop='14px';rs.onclick=()=>RGFX.reset();box.appendChild(rs);
 const st=document.createElement('style');st.textContent='.gfb.on{background:#7f1d1d;border-color:#ef4444}#optG{max-height:64vh;overflow-y:auto;padding-right:8px}';document.head.appendChild(st);
 refreshUI();
}
function refreshUI(){
 const box=document.getElementById('optG');if(!box||!built)return;
 box.querySelectorAll('.optRow[data-k]').forEach(row=>{
  const k=row.dataset.k,v=RGFX.s[k];
  row.querySelectorAll('.gfb').forEach(b=>b.classList.toggle('on',String(b.dataset.v)===String(v)));
  const i=row.querySelector('input');if(i){i.value=v;const g=row.querySelector('.gv');if(g)g.textContent=v+'%'}
 });
}
/* add the tab: button in the options root + wrapped optTab so the new panel hides/shows with the others */
function install(){
 const main=document.getElementById('optMain'),opt=document.getElementById('opt');if(!main||!opt)return;
 if(!document.getElementById('optG')){
  const g=el('div','hide');g.id='optG';const v=document.getElementById('optV');v.parentNode.insertBefore(g,v.nextSibling);
  const b=el('button','mbtn','Graphics');b.onclick=()=>window.optTab('G');main.insertBefore(b,main.children[1]||null);
 }
 for(const b of main.querySelectorAll('button'))if(/optTab\('V'\)/.test(b.getAttribute('onclick')||''))b.style.display='none';   // v058: Video merged into Graphics
 const o=window.optTab;
 window.optTab=function(t){o.apply(this,arguments);const g=document.getElementById('optG');if(g)g.classList.toggle('hide',t!=='G');if(t==='G'){build();refreshUI()}};
}
install();
console.log('[gfx] graphics settings ready');
})();
