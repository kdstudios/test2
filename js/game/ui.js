/* =====================================================================================================
   MINI FORT ZOMBIE v070 - MENU LAYER CONTROLLER (loaded last)
   Glue for the rebuilt menus in ClickToPlayGame.html + css/ui.css. It only wraps existing game functions
   (ui, clkVis, optTab, icoList, hqUI) and never changes gameplay state.
   - backdrop (procedural skyline + ash) whenever no 3D world is behind the menus
   - Options: side navigation, Graphics split into sub-pages, custom range fills, Esc = back
   - Icons: paged tile grid instead of a scrolling list
   - Fort select: live key reference built from the current keybinds
   - Fort HQ: survivor roster and town map are sized to fit the screen (no scrollbars at any roster size)
   ===================================================================================================== */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const vis=id=>{const e=$(id);return !!e&&!e.classList.contains('hide')};
const MENUS=['title','menu','opt','occ','sel','hq','pz','end'];
const raf=f=>requestAnimationFrame(()=>requestAnimationFrame(f));

/* ---------------------------------------------------------------- screen state classes */
function syncBody(){const b=document.body,noW=typeof G!=='undefined'&&(G.mode==='TITLE');
 b.classList.toggle('noworld',!!noW);b.classList.toggle('menuup',MENUS.some(vis));b.dataset.scr=typeof scrNow!=='undefined'?scrNow:'';
 if(noW)Ash.start();else Ash.stop()}
const _ui=window.ui;
window.ui=function(id){const r=_ui.apply(this,arguments);try{syncBody();
  if(id==='sel')renderKeys();if(id==='hq')raf(fitHQ);if(id==='opt')raf(fillRanges)}catch(e){console.warn('[ui]',e)}return r};
// the clock/siege box only belongs over a live world
window.clkVis=function(){const b=$('clkBox');if(!b)return;const live=typeof playing==='function'&&playing();
 b.classList.toggle('hide',vis('hq')||vis('title')||vis('menu')||vis('sel')||vis('occ')||vis('end')||(vis('opt')&&(optFrom==='menu'||!live))||(vis('dev')&&!live))};

/* ---------------------------------------------------------------- backdrop: skyline + ash */
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildCity(){const svg=$('bdCity');if(!svg||svg.childNodes.length)return;const r=rng(1408),W=1600,H=420,o=[];
 o.push('<defs><linearGradient id="bdBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3c96a" stop-opacity=".2"/><stop offset="1" stop-color="#f3c96a" stop-opacity="0"/></linearGradient>'+
  '<pattern id="bdMesh" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 0l9 9M9 0L0 9" stroke="#000" stroke-width=".8" opacity=".9"/></pattern></defs>');
 // far skyline with a few lit windows
 let x=-20;while(x<W){const w=40+r()*80,h=90+r()*150,y=H-h-30;o.push(`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h+30}" fill="#17100f"/>`);
  if(r()<.35)o.push(`<rect x="${(x+w*.4).toFixed(0)}" y="${(y-14-r()*20).toFixed(0)}" width="2" height="34" fill="#17100f"/>`);
  for(let wy=y+10;wy<H-60;wy+=14)for(let wx=x+6;wx<x+w-8;wx+=11)if(r()<.035)o.push(`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="4" height="6" fill="#d98a33" opacity="${(.25+r()*.5).toFixed(2)}"/>`);
  x+=w+2+r()*10}
 // water tower
 o.push('<g fill="#140e0d"><rect x="1166" y="168" width="70" height="44" rx="6"/><path d="M1162 168h78l-10-14h-58z"/><path d="M1172 212l-8 120h5l8-120zM1230 212l8 120h-5l-8-120zM1199 212h4v120h-4z"/><path d="M1170 260h62v3h-62zM1167 300h68v3h-68z"/></g>');
 // mid ruined layer
 x=-30;while(x<W){const w=60+r()*120,h=50+r()*110,y=H-h-22,j=[];j.push([x,H]);j.push([x,y+r()*10]);const n=2+Math.floor(r()*4);for(let i=1;i<n;i++)j.push([x+w*i/n,y+(r()<.5?r()*26:-r()*8)]);j.push([x+w,y+r()*14]);j.push([x+w,H]);
  o.push(`<polygon points="${j.map(p=>p[0].toFixed(0)+','+p[1].toFixed(0)).join(' ')}" fill="#0d0a09"/>`);x+=w+r()*30}
 // watchtower with a sweeping lamp (the fort)
 o.push('<g class="bdBeamG"><polygon points="1402,214 560,120 560,330" fill="url(#bdBeam)"/></g>');
 o.push('<g fill="#060505" transform="translate(1600 0) scale(-1 1)"><path d="M150 395l18-170h8l-14 170zM246 395l-18-170h-8l14 170zM164 300h68v4h-68zM158 350h80v4h-80z"/><rect x="152" y="196" width="92" height="34"/><path d="M144 196h108l-14-22h-80z"/><rect x="190" y="206" width="16" height="12" fill="#f3c96a" opacity=".85"/>'+
  '<path d="M0 395V300l40-8 40 8 40-8 30 6v97z"/></g>');
 // fence + barbed wire
 const fy=328;o.push(`<rect x="0" y="${fy}" width="${W-250}" height="${395-fy}" fill="url(#bdMesh)" opacity=".75"/>`);
 for(let px=0;px<=W-250;px+=52){const lean=(r()<.12?(r()-.5)*14:0);o.push(`<path d="M${px} 397L${(px+lean).toFixed(1)} ${fy-6}" stroke="#050404" stroke-width="4"/>`)}
 o.push(`<path d="M0 ${fy}H${W-250}M0 ${fy+12}H${W-250}" stroke="#050404" stroke-width="1.6"/>`);
 let bw='';for(let px=0;px<W-250;px+=14)bw+=`M${px} ${fy-3}l6 6M${px+6} ${fy-3}l-6 6`;o.push(`<path d="${bw}" stroke="#050404" stroke-width="1.2"/>`);
 // the dead at the wire
 const zed=(zx,s,f)=>`<g transform="translate(${zx} 397) scale(${f?-s:s} ${s})" fill="#020202"><circle cx="3" cy="-58" r="6"/><path d="M-6 -52c-4 8-5 22-3 30l-6 22h6l6-19 4 19h6l-3-24c3-8 4-18 1-27 6 2 12 2 20 0l1-4c-8 0-14-1-20-4z"/><path d="M-4 -46c8 2 16 0 24-3l1 3c-8 4-17 6-25 4z"/></g>`;
 [[560,1,0],[690,.9,1],[820,1.1,0],[1005,.85,0],[1110,1,1],[1240,.95,0],[160,1.05,1]].forEach(z=>o.push(zed(...z)));
 o.push(`<path d="M0 ${H}V396q200-6 400 0t400-2 400 3 400-1V${H}z" fill="#030303"/>`);
 svg.innerHTML=o.join('')}
const Ash={cv:null,x:null,p:[],on:false,id:0,
 start(){if(this.on)return;buildCity();this.cv=$('bdAsh');if(!this.cv)return;this.x=this.cv.getContext('2d');this.on=true;this.size();if(!this.p.length)for(let i=0;i<110;i++)this.p.push(this.mk(true));const loop=()=>{if(!this.on)return;this.step();this.id=requestAnimationFrame(loop)};loop()},
 stop(){this.on=false;cancelAnimationFrame(this.id)},
 size(){if(!this.cv)return;const d=Math.min(1.5,devicePixelRatio||1);this.cv.width=innerWidth*d;this.cv.height=innerHeight*d;this.d=d},
 mk(any){const W=this.cv.width,H=this.cv.height,e=Math.random()<.18;return{x:Math.random()*W,y:any?Math.random()*H:-10,r:(e?1.2:.6+Math.random()*1.6)*this.d,vx:(.15+Math.random()*.5)*this.d,vy:(.25+Math.random()*.7)*this.d,ph:Math.random()*6.28,e,a:.25+Math.random()*.5}},
 step(){const c=this.x,W=this.cv.width,H=this.cv.height;c.clearRect(0,0,W,H);const t=performance.now()/1000;
  for(const q of this.p){q.x+=q.vx+Math.sin(t*.7+q.ph)*.25*this.d;q.y+=q.vy;if(q.y>H+10||q.x>W+10)Object.assign(q,this.mk(false),{x:Math.random()*W*.9-W*.1});
   c.globalAlpha=q.e?q.a*(.6+.4*Math.sin(t*3+q.ph)):q.a*.55;c.fillStyle=q.e?'#ff8a3a':'#b9b2a6';c.beginPath();c.arc(q.x,q.y,q.r,0,6.283);c.fill()}c.globalAlpha=1}};
addEventListener('resize',()=>{Ash.size();fitHQ();icoRender();fitDevPages()});
(function(){const st=document.createElement('style');st.textContent='.bdBeamG{transform-origin:1402px 212px;animation:bdSweep 14s ease-in-out infinite}@keyframes bdSweep{0%,100%{transform:rotate(7deg)}50%{transform:rotate(-9deg)}}';document.head.appendChild(st)})();

/* ---------------------------------------------------------------- range fills */
function fillRange(e){const mn=+e.min||0,mx=+e.max||100,v=+e.value;e.style.setProperty('--p',((v-mn)/(mx-mn)*100).toFixed(1)+'%')}
function fillRanges(){document.querySelectorAll('input[type=range]').forEach(fillRange)}
document.addEventListener('input',e=>{if(e.target&&e.target.type==='range')fillRange(e.target)},true);
if(window.RGFX&&RGFX.onChange)RGFX.onChange(()=>setTimeout(fillRanges,0));

/* ---------------------------------------------------------------- options: side nav + sub-pages */
const TABN={S:'Sound',G:'Graphics',K:'Controls',I:'Icons'};let optLast='S';
const gBtn=[...document.querySelectorAll('#optMain .mbtn')].find(b=>/graphics/i.test(b.textContent));if(gBtn)gBtn.dataset.t='G';
const _optTab=window.optTab;
window.optTab=function(t){if(!t)t=optLast;optLast=t;const r=_optTab.call(this,t);
 $('optMain').classList.remove('hide');document.querySelectorAll('#optMain .mbtn').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 const c=$('optCrumb');if(c)c.textContent=TABN[t]||'';if(t==='G')shapeGfx();if(t==='I')raf(icoRender);raf(fillRanges);return r};
// v070: optMain is always visible now, so Back always leaves Options
window.optBack=function(){ui(optFrom)};
const GP=[['disp','Display'],['atmo','Atmosphere'],['img','Image'],['mdl','Models'],['wld','World detail']];
const GK={weather:'atmo',siegeWx:'atmo',sky:'atmo',particles:'atmo',lightning:'atmo',fog:'atmo',post:'img',bloom:'img',exposure:'img',saturation:'img',vignette:'img',
 smodel:'mdl',zmodel:'mdl',melee:'mdl',flora:'mdl',props:'mdl',arch:'wld',archStyle:'wld',detail:'wld',nmStrength:'wld'};
const GWIDE=new Set(['weather','archStyle']);let gPage='disp';
function shapeGfx(){const box=$('optG');if(!box||box.dataset.shaped||!box.querySelector('.optRow'))return;box.dataset.shaped=1;
 const note=box.querySelector(':scope>.m');[...box.children].forEach(c=>c.classList.add('gHide'));
 const head=document.createElement('div');head.className='paneHead';head.innerHTML='<h2>Graphics</h2><p>'+(note?note.textContent:'')+'</p>';
 const chips=document.createElement('div');chips.className='chips';const pages=document.createElement('div');pages.className='gPages';const P={};
 GP.forEach(([k,n])=>{const b=document.createElement('button');b.textContent=n;b.dataset.g=k;b.onclick=()=>{gPage=k;gShow()};chips.appendChild(b);
  const pg=document.createElement('div');pg.className='gPage paneGrid';pg.dataset.g=k;pages.appendChild(pg);P[k]=pg});
 const moved=$('optVmoved');if(moved)[...moved.querySelectorAll(':scope>.optRow')].forEach(r=>P.disp.appendChild(r));
 box.querySelectorAll('.optRow[data-k]').forEach(row=>{const k=row.dataset.k;(P[GK[k]]||P.wld).appendChild(row);if(GWIDE.has(k))row.classList.add('wide');
  const bs=[...row.querySelectorAll(':scope>.gfb')];if(bs.length){const sg=document.createElement('div');sg.className='seg';row.insertBefore(sg,bs[0]);bs.forEach(b=>sg.appendChild(b));
   [...row.childNodes].forEach(n=>{if(n.nodeType===3&&!n.textContent.trim())n.remove()})}
  const lab=row.querySelector(':scope>span');if(lab)lab.innerHTML=lab.innerHTML.replace(/<br\s*\/?>/g,'').replace(/:\s*(<b)/,' $1')});
 const foot=document.createElement('div');foot.className='paneFoot';const rs=[...box.querySelectorAll('button.mbtn')].find(b=>/reset/i.test(b.textContent));
 if(rs){rs.className='warnBtn';rs.style.marginTop='';rs.classList.remove('gHide');foot.appendChild(rs)}
 const tip=document.createElement('span');tip.className='m';tip.style.fontSize='12px';tip.textContent='Settings marked "next world" apply the next time a map is built.';foot.appendChild(tip);
 box.append(head,chips,pages,foot);gShow()}
function gShow(){document.querySelectorAll('#optG .gPage').forEach(p=>p.classList.toggle('on',p.dataset.g===gPage));document.querySelectorAll('#optG .chips button').forEach(b=>b.classList.toggle('on',b.dataset.g===gPage));fillRanges()}

/* ---------------------------------------------------------------- icons: paged tiles */
let icoCat='',icoPage=0;
window.icoList=function(){icoRender()};
function icoRender(){const L=$('icoList');if(!L||typeof ITEM_ORDER==='undefined')return;
 const n=Object.keys(ICU).length,cnt=$('icoCount');if(cnt)cnt.textContent=n+' / '+ITEM_ORDER.length+' custom';
 const cats=[...new Set(ITEM_ORDER.map(id=>ITEMS[id].cat))],C=$('icoCats');
 if(C){C.innerHTML='';[['','All']].concat(cats.map(k=>[k,CATS[k]||k])).forEach(([k,lab])=>{const b=document.createElement('button');b.textContent=lab;b.classList.toggle('on',k===icoCat);b.onclick=()=>{icoCat=k;icoPage=0;icoRender()};C.appendChild(b)})}
 if(!L.offsetParent)return;const ids=ITEM_ORDER.filter(id=>!icoCat||ITEMS[id].cat===icoCat);
 L.innerHTML='';const W=L.clientWidth,H=L.clientHeight,cols=Math.max(1,Math.floor((W+8)/(232+8))),rh=64,rows=Math.max(1,Math.floor((H+8)/(rh+8))),per=cols*rows,pages=Math.max(1,Math.ceil(ids.length/per));
 icoPage=Math.min(icoPage,pages-1);L.style.setProperty('--ic',cols);L.style.setProperty('--ir',rh+'px');
 ids.slice(icoPage*per,icoPage*per+per).forEach(id=>{const it=ITEMS[id],cu=hasCustom(id),t=document.createElement('div');t.className='icoTile'+(cu?' cu':'');
  const s=Math.min(60/it.size[0],48/it.size[1]),th=document.createElement('div');th.className='ith';th.appendChild(iconCanvas(id,Math.max(8,Math.round(it.size[0]*s)),Math.max(8,Math.round(it.size[1]*s)),false));
  const tx=document.createElement('div');tx.style.minWidth='0';tx.innerHTML='<b title="'+it.name.replace(/"/g,'&quot;')+'">'+it.name.replace(/</g,'&lt;')+'</b><small>'+id+'.png · '+it.vh[0]+'×'+it.vh[1]+'</small>';
  const st=document.createElement('div');st.className='ist';st.textContent=cu?'Custom':'Default';if(cu){const b=document.createElement('button');b.textContent='Remove';b.onclick=()=>removeCustomIcon(id);st.appendChild(b)}tx.appendChild(st);
  t.append(th,tx);L.appendChild(t)});
 pager($('icoPager'),icoPage,pages,p=>{icoPage=p;icoRender()})}
function pager(el,p,n,go){if(!el)return;el.innerHTML='';if(n<=1)return;const b=(t,to,dis)=>{const x=document.createElement('button');x.innerHTML=t;x.disabled=dis;x.onclick=()=>go(to);return x};
 const lab=document.createElement('span');lab.textContent='Page '+(p+1)+' / '+n;el.append(b('&larr; Prev',p-1,p<=0),lab,b('Next &rarr;',p+1,p>=n-1))}
window.MFZUI={pager};
document.addEventListener('wheel',e=>{const L=$('icoList');if(L&&L.offsetParent&&L.contains(e.target)){const pg=$('icoPager').querySelectorAll('button');if(!pg.length)return;e.preventDefault();(e.deltaY>0?pg[1]:pg[0]).click()}},{passive:false});

/* ---------------------------------------------------------------- fort select: live key reference */
function renderKeys(){const el=$('selKeys');if(!el)return;const k=a=>'<kbd>'+((typeof KB!=='undefined'&&typeof kbName==='function'&&KB[a])?kbName(KB[a]):'?')+'</kbd>',f=t=>'<kbd>'+t+'</kbd>';
 const L=[[k('fwd')+k('left')+k('back')+k('right'),'Move'],[k('sprint'),'Sprint'],[k('jump'),'Jump'],[k('crouch'),'Crouch'],[f('LMB'),'Attack'],[f('RMB'),'Aim / zoom'],[f('Q'),'Melee / gun butt'],
  [k('reload'),'Reload'],[k('interact'),'Interact, doors'],[k('cycle'),'Cycle weapons'],[k('inv'),'Inventory'],[k('torch'),'Torch (night)'],[k('bar')+f('X'),'Build / cancel'],[k('c1')+'–'+k('c5'),'Companion orders'],[f('Esc'),'Pause / Fort HQ']];
 el.innerHTML=L.map(x=>'<div>'+x[0]+'<span>'+x[1]+'</span></div>').join('')}

/* ---------------------------------------------------------------- fort HQ fit */
function fitHQ(){if(!vis('hq'))return;try{const f=$('fnHQ');if(f&&typeof FORTS!=='undefined'&&FORTS[G.fort])f.textContent=FORTS[G.fort].n}catch(e){}
 const sl=$('sl');if(sl){[...sl.children].forEach(c=>{const i=c.firstElementChild;if(i)c.title=i.innerText.replace(/\s*\n\s*/g,' · ')});
  const tries=[['d0',2],['d0',3],['d1',2],['d1',3],['d2',2],['d2',3]];
  for(const [d,c] of tries){if(c>2&&sl.clientWidth/c<330)continue;sl.classList.remove('d0','d1','d2');sl.classList.add(d);sl.style.setProperty('--cols',c);if(sl.scrollHeight<=sl.clientHeight+1)break}}
 const box=$('tmBox'),w=$('tmWrap');if(box&&w&&!w.style.transform){const W=box.clientWidth,H=box.clientHeight;if(W&&H)w.style.width=Math.floor(Math.min(W,H*4/3))+'px'}}
const _hq=window.hqUI;if(_hq)window.hqUI=function(){const r=_hq.apply(this,arguments);try{fitHQ();fitInfo()}catch(e){}return r};

/* v071: mission text always fits its box (font shrinks until it does) */
function fitInfo(){const el=$('tmInfo');if(!el||!el.offsetParent)return;let f=13;el.style.setProperty('--fs',f+'px');while(el.scrollHeight>el.clientHeight+1&&f>8.5){f-=.5;el.style.setProperty('--fs',f+'px')}}
{const el=$('tmInfo');if(el)new MutationObserver(()=>fitInfo()).observe(el,{childList:true,subtree:true,characterData:true})}
/* ---------------------------------------------------------------- dev toolkit page fitting hook */
function fitDevPages(){try{if(window.DEV&&DEV.fit)DEV.fit()}catch(e){}}

/* ---------------------------------------------------------------- hover sounds + Esc = back */
let hov=null;document.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('#menu .mbtn,.sideNav .mbtn,#sel .card,#occ .occTile,.pzWin button,#hqTop button,.hqActs button');if(b===hov)return;hov=b;if(b&&!b.disabled)try{S.ui()}catch(_){}});
addEventListener('keydown',e=>{if(e.code!=='Escape'||e.repeat)return;if(typeof kbCap!=='undefined'&&kbCap)return;
 if(vis('opt')){e.preventDefault();optBack()}else if(vis('sel')){e.preventDefault();ui('occ')}});

/* ---------------------------------------------------------------- start */
try{if(window.DEV&&DEV.adopt)DEV.adopt()}catch(e){console.warn('[ui] dev adopt',e)}
syncBody();fillRanges();
console.log('[ui] v070 menu layer ready');
})();
