/* ==========================================================================================================
   MINI FORT ZOMBIE - TOWN MAP MISSIONS (v057)
   Replaces the "Board truck: scavenge" button with a Town Map window on the Fort HQ screen.
   - the map is a procedurally painted survey map (paper on cork), seeded per run; the Fort HQ icon sits at a random spot chosen
     when a NEW GAME starts (initCampaign) and stays there for the whole run (G.tmap)
   - every day 2-5 pinboard pins are rolled (G.pins, re-rolled in newDay): green = Weapons, purple = Supplies, blue = Survivors
     (weights from MissionMapDB: 30 / 40 / 30). Click a pin, then "Drive out". Trip time = Scout skill x distance from the fort.
   - the expedition still builds the usual random town; the pin decides the emphasis (G.mission):
       weapons   -> a weapons cache (2-3 gunshop crates) in one random building, guarded
       supplies  -> a supplies cache (3 food / meds / material containers) in one random building, guarded
       survivors -> 1-3 survivors in one random building (1: 65 %, 2: 27 %, 3: 8 %), guarded
     Random town survivors no longer spawn on mission maps (weapons / supplies maps have none; survivor maps only the 1-3 above).
   The objective shows as the MISSION row in the rumor panel and as a coloured ring on the radar (rumor system in skills.js).
   ========================================================================================================== */
(function(){
'use strict';
const TYPES={
 weapons:  {n:'Weapons',  full:'Weapons cache', col:'#22c55e',hi:'#a7f3c0',dk:'#0b5c27',tag:'mission_weapons',  w:30,
  desc:'Rumour of a weapons cache stashed in one of the town buildings. Expect guards.'},
 supplies: {n:'Supplies', full:'Supplies cache',col:'#a855f7',hi:'#e2c8ff',dk:'#4c1d95',tag:'mission_supplies', w:40,
  desc:'A supplies cache - food, meds and materials - is hidden in a town building.'},
 survivors:{n:'Survivors',full:'Survivors',     col:'#3b82f6',hi:'#c4dcff',dk:'#1e3a8a',tag:'mission_survivors',w:30,
  desc:'Someone has been signalling from a building in town. Find them and bring them home.'}
};
const ORDER=['weapons','supplies','survivors'];
const TOWNS=['Millbrook','Harlow Falls','Cedar Point','Ashford','Brookhaven','Pine Hollow','Greenville','Fairmont','Maple Ridge','Redwater','Oakdale','Stillwater','Kingsbury','Elm Grove'];
const ST=['Main St','Elm St','Oak Ave','Maple Ave','Church St','Mill Rd','Pine St','Park Ave','Market St','High St','Cedar Ln','Union St','Water St','Grove Rd','Station Rd','King St'];
const MW=800,MH=600,PAD=24;
const M=window.MZ={TYPES,sel:null,img:null,imgSeed:null,icons:{}};

/* ---------------- run state ---------------- */
function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function weights(){const R=window.FZ&&FZ.cfg&&FZ.cfg.rumors,w={};for(const k of ORDER){w[k]=TYPES[k].w;if(R)for(const q of Object.values(R))if(q.tag===TYPES[k].tag&&q.w>0)w[k]=q.w}return w}
function newRun(){
 const seed=(Math.random()*4294967296)>>>0,r=rng(seed^0x9e3779b9);
 G.tmap={seed,fx:.16+r()*.68,fy:.2+r()*.6,town:TOWNS[Math.floor(r()*TOWNS.length)]};
 M.sel=null;rollPins();
}
function ensureRun(){if(!G.tmap)newRun();if(!G.pins||G.pinsDay!==G.day)rollPins()}
function rollPins(){
 const t=G.tmap,w=weights(),tot=ORDER.reduce((a,k)=>a+w[k],0),n=2+Math.floor(Math.random()*4),out=[];
 for(let i=0,tries=0;i<n&&tries<400;tries++){
  const x=.08+Math.random()*.84,y=.1+Math.random()*.8;
  if(Math.hypot((x-t.fx),(y-t.fy)*.75)<.13)continue;            // keep clear of the fort icon
  if(out.some(p=>Math.hypot(p.x-x,(p.y-y)*.75)<.1))continue;     // and of each other
  let q=Math.random()*tot,k=ORDER[0];for(const o of ORDER){q-=w[o];if(q<=0){k=o;break}}
  out.push({id:G.day*10+i,t:k,x,y});i++}
 G.pins=out;G.pinsDay=G.day;M.sel=null;
}
function pinDist(p){const t=G.tmap;return Math.hypot(p.x-t.fx,(p.y-t.fy)*.75)}
function hoursFor(p){return Math.max(.5,Math.min(5,skScoutHours()*(.5+.9*pinDist(p))))}
M.hoursFor=hoursFor;

/* ---------------- textures: town map, fort icon, pins ---------------- */
/* v071: shrink text until it fits its box (any town name fits the cartouche) */
function fitText(c,t,x,y,maxW,size,style,fam){let f=size;do{c.font=style+' '+f+'px '+fam;if(c.measureText(t).width<=maxW)break;f-=.5}while(f>6);if(c.measureText(t).width>maxW){c.save();c.translate(x,y);c.scale(maxW/c.measureText(t).width,1);c.fillText(t,0,0);c.restore();return}c.fillText(t,x,y)}
function paintMap(seed,townName){
 const cv=document.createElement('canvas');cv.width=MW;cv.height=MH;const c=cv.getContext('2d'),r=rng(seed);
 const R=(a,b)=>a+r()*(b-a);
 // cork board
 c.fillStyle='#7a5a36';c.fillRect(0,0,MW,MH);
 for(let i=0;i<5000;i++){c.fillStyle=r()<.5?'rgba(40,24,10,.35)':'rgba(190,150,100,.3)';c.fillRect(r()*MW,r()*MH,R(1,3),R(1,3))}
 // paper
 const x0=PAD,y0=PAD,x1=MW-PAD,y1=MH-PAD;
 c.save();c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=14;c.shadowOffsetY=4;c.fillStyle='#e9dec3';c.fillRect(x0,y0,x1-x0,y1-y0);c.restore();
 c.save();c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.clip();
 for(let i=0;i<9000;i++){c.fillStyle=r()<.5?'rgba(120,95,60,.06)':'rgba(255,255,240,.08)';c.fillRect(R(x0,x1),R(y0,y1),R(1,2.5),R(1,2.5))}
 for(let i=0;i<3;i++){const sx=R(x0,x1),sy=R(y0,y1),sr=R(40,90),g=c.createRadialGradient(sx,sy,sr*.6,sx,sy,sr);g.addColorStop(0,'rgba(160,120,60,0)');g.addColorStop(.85,'rgba(150,105,50,.12)');g.addColorStop(1,'rgba(150,105,50,0)');c.fillStyle=g;c.fillRect(sx-sr,sy-sr,sr*2,sr*2)}
 // street grid
 const vx=[],hy=[];for(let x=x0+R(40,70);x<x1-30;x+=R(78,118))vx.push(x);for(let y=y0+R(42,64);y<y1-30;y+=R(66,96))hy.push(y);
 const mainV=vx[1+Math.floor(r()*Math.max(1,vx.length-2))],mainH=hy[1+Math.floor(r()*Math.max(1,hy.length-2))];M.roads={vx:vx.slice(),hy:hy.slice(),x0,y0,x1,y1};
 // river: a wandering band across the map, left or right third
 const left=r()<.5,rx=left?R(x0+70,x0+190):R(x1-190,x1-70),rp=[];for(let y=y0-10;y<=y1+10;y+=20)rp.push([rx+Math.sin(y*.012+seed%7)*R(18,26)+Math.sin(y*.031)*8,y]);
 const nearRiver=(x,y,pad)=>rp.some(p=>Math.abs(p[1]-y)<12&&Math.abs(p[0]-x)<pad);
 // blocks
 const xs=[x0,...vx,x1],ys=[y0,...hy,y1];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
  const bx0=xs[i]+9,bx1=xs[i+1]-9,by0=ys[j]+9,by1=ys[j+1]-9;if(bx1-bx0<14||by1-by0<14)continue;
  const cx=(bx0+bx1)/2,cy=(by0+by1)/2,u=r();
  if(nearRiver(cx,cy,(bx1-bx0)/2+22)){c.fillStyle='#c9d7a8';c.fillRect(bx0,by0,bx1-bx0,by1-by0);continue}
  if(u<.09){ // park
   c.fillStyle='#b9cf98';c.fillRect(bx0,by0,bx1-bx0,by1-by0);c.strokeStyle='#7f9a5e';c.lineWidth=1;c.strokeRect(bx0+.5,by0+.5,bx1-bx0-1,by1-by0-1);
   c.strokeStyle='#d8caa0';c.lineWidth=3;c.beginPath();c.moveTo(bx0,cy);c.quadraticCurveTo(cx,by0,bx1,cy);c.stroke();
   for(let k=0;k<14;k++){const tx=R(bx0+5,bx1-5),ty=R(by0+5,by1-5),tr=R(3,6);c.fillStyle='#6f8f4a';c.beginPath();c.arc(tx,ty,tr,0,7);c.fill();c.fillStyle='#8fae66';c.beginPath();c.arc(tx-1,ty-1,tr*.55,0,7);c.fill()}
   continue}
  if(u<.13){ // cemetery
   c.fillStyle='#c6cfa6';c.fillRect(bx0,by0,bx1-bx0,by1-by0);c.strokeStyle='#6a6a52';c.lineWidth=1;c.setLineDash([3,2]);c.strokeRect(bx0+.5,by0+.5,bx1-bx0-1,by1-by0-1);c.setLineDash([]);
   c.strokeStyle='#5a5a48';for(let gx=bx0+8;gx<bx1-4;gx+=9)for(let gy=by0+8;gy<by1-4;gy+=10){c.beginPath();c.moveTo(gx,gy-3);c.lineTo(gx,gy+3);c.moveTo(gx-2,gy-1);c.lineTo(gx+2,gy-1);c.stroke()}
   continue}
  // built-up block: lots with footprints
  c.fillStyle='#ddd0b0';c.fillRect(bx0,by0,bx1-bx0,by1-by0);
  const n=2+Math.floor(r()*4),lw=(bx1-bx0)/n;
  for(let k=0;k<n;k++)for(const top of[true,false]){
   if(r()<.18)continue;const lx0=bx0+k*lw+2,lx1=bx0+(k+1)*lw-2,dh=(by1-by0)/2-3,fh=R(.45,.85)*dh,fw=R(.55,.95)*(lx1-lx0);
   const fx=lx0+(lx1-lx0-fw)/2,fy=top?by0+2:by1-2-fh;
   c.fillStyle=r()<.25?'#b79f80':r()<.5?'#c4ae8c':'#bba78a';c.fillRect(fx,fy,fw,fh);c.strokeStyle='#6e5d44';c.lineWidth=1;c.strokeRect(fx+.5,fy+.5,fw-1,fh-1);
   c.save();c.beginPath();c.rect(fx,fy,fw,fh);c.clip();c.strokeStyle='rgba(90,70,45,.25)';for(let h=-fh;h<fw;h+=4){c.beginPath();c.moveTo(fx+h,fy);c.lineTo(fx+h+fh,fy+fh);c.stroke()}c.restore()}
 }
 // river on top of the blocks, roads cross it as bridges
 const riverPath=()=>{c.beginPath();c.moveTo(rp[0][0],rp[0][1]);for(let i=1;i<rp.length-1;i++){const m=[(rp[i][0]+rp[i+1][0])/2,(rp[i][1]+rp[i+1][1])/2];c.quadraticCurveTo(rp[i][0],rp[i][1],m[0],m[1])}};
 c.lineCap='round';riverPath();c.strokeStyle='#6f9fb8';c.lineWidth=34;c.stroke();riverPath();c.strokeStyle='#a9cbdc';c.lineWidth=28;c.stroke();
 riverPath();c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.setLineDash([6,9]);c.stroke();c.setLineDash([]);
 // roads
 const road=(ax,ay,bx,by,w,fill,edge)=>{c.lineCap='butt';c.strokeStyle=edge;c.lineWidth=w+3;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();c.strokeStyle=fill;c.lineWidth=w;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke()};
 for(const x of vx)if(x!==mainV)road(x,y0,x,y1,9,'#f8f2e2','#9a8a6a');for(const y of hy)if(y!==mainH)road(x0,y,x1,y,9,'#f8f2e2','#9a8a6a');
 road(mainV,y0,mainV,y1,15,'#f2d488','#8a6d3a');road(x0,mainH,x1,mainH,15,'#f2d488','#8a6d3a');
 c.strokeStyle='rgba(150,110,40,.55)';c.lineWidth=1;c.setLineDash([7,6]);c.beginPath();c.moveTo(mainV,y0);c.lineTo(mainV,y1);c.moveTo(x0,mainH);c.lineTo(x1,mainH);c.stroke();c.setLineDash([]);
 // bridge rails where a horizontal road crosses the river
 for(const y of hy){let px=null;for(const p of rp)if(Math.abs(p[1]-y)<12)px=p[0];if(px==null)continue;const hw=y===mainH?9.5:6.5;c.strokeStyle='#4a3a28';c.lineWidth=2;
  for(const s of[-1,1]){c.beginPath();c.moveTo(px-24,y+s*hw);c.lineTo(px+24,y+s*hw);c.stroke()}}
 // railway along one edge
 const ry2=r()<.5?y0+16:y1-16;c.strokeStyle='#5a4a38';c.lineWidth=2;c.beginPath();c.moveTo(x0,ry2-2);c.lineTo(x1,ry2-2);c.moveTo(x0,ry2+2);c.lineTo(x1,ry2+2);c.stroke();
 c.lineWidth=1;for(let x=x0;x<x1;x+=7){c.beginPath();c.moveTo(x,ry2-5);c.lineTo(x,ry2+5);c.stroke()}
 // street names
 const names=ST.slice().sort(()=>r()-.5);let ni=0;c.fillStyle='#4a3a26';
 c.font='italic bold 13px Georgia,serif';c.textAlign='center';c.textBaseline='middle';
 const lab=(t,x,y,a)=>{c.save();c.translate(x,y);c.rotate(a);c.fillStyle='rgba(233,222,195,.85)';const w=c.measureText(t).width+6;c.fillRect(-w/2,-7,w,14);c.fillStyle='#4a3a26';c.fillText(t,0,0);c.restore()};
 lab(names[ni++].toUpperCase(),x0+(x1-x0)*R(.55,.75),mainH,0);lab(names[ni++].toUpperCase(),mainV,y0+(y1-y0)*R(.25,.4),-Math.PI/2);
 c.font='italic 11px Georgia,serif';
 for(const y of hy)if(y!==mainH&&ni<names.length)lab(names[ni++],x0+(x1-x0)*R(.15,.4),y,0);
 for(const x of vx)if(x!==mainV&&ni<names.length&&r()<.7)lab(names[ni++],x,y0+(y1-y0)*R(.6,.85),-Math.PI/2);
 c.font='italic 12px Georgia,serif';c.fillStyle='#2f5a72';c.save();c.translate(rx+(left?16:-16),y0+(y1-y0)*.72);c.rotate(Math.PI/2);c.fillText('~ '+townName.split(' ')[0]+' River ~',0,0);c.restore();
 // title cartouche + compass + scale bar
 const tw=210,th=54,tx=left?x1-tw-14:x0+14,ty=y0+14;c.fillStyle='rgba(240,230,205,.95)';c.fillRect(tx,ty,tw,th);c.strokeStyle='#5a4630';c.lineWidth=2;c.strokeRect(tx+.5,ty+.5,tw-1,th-1);c.lineWidth=1;c.strokeRect(tx+4.5,ty+4.5,tw-9,th-9);
 c.fillStyle='#3a2a18';fitText(c,'TOWN OF '+townName.toUpperCase(),tx+tw/2,ty+22,tw-24,17,'bold','Georgia,serif');fitText(c,'County survey  ·  not to scale',tx+tw/2,ty+40,tw-24,10,'italic','Georgia,serif');
 const kx=left?x0+52:x1-52,ky=y1-56;c.strokeStyle='#4a3a26';c.lineWidth=1.5;c.beginPath();c.arc(kx,ky,26,0,7);c.stroke();c.beginPath();c.arc(kx,ky,21,0,7);c.stroke();
 for(let k=0;k<4;k++){const a=k*Math.PI/2;c.fillStyle=k===0?'#8a2a1a':'#4a3a26';c.beginPath();c.moveTo(kx+Math.sin(a)*24,ky-Math.cos(a)*24);c.lineTo(kx+Math.sin(a+.4)*6,ky-Math.cos(a+.4)*6);c.lineTo(kx,ky);c.lineTo(kx+Math.sin(a-.4)*6,ky-Math.cos(a-.4)*6);c.closePath();c.fill()}
 c.fillStyle='#4a3a26';c.font='bold 11px Georgia,serif';c.fillText('N',kx,ky-34);
 const sx=left?x1-150:x0+18,sy=y1-18;for(let k=0;k<4;k++){c.fillStyle=k%2?'#e9dec3':'#4a3a26';c.fillRect(sx+k*28,sy,28,6)}c.strokeStyle='#4a3a26';c.strokeRect(sx+.5,sy+.5,112,6);c.font='9px Georgia,serif';c.fillText('0',sx,sy-6);c.fillText('½ mile',sx+112,sy-6);
 // folds, vignette
 for(const [ax,ay,bx,by] of[[MW/2,y0,MW/2,y1],[x0,MH/2,x1,MH/2]]){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();c.moveTo(ax,ay);c.lineTo(bx,by);c.stroke();c.strokeStyle='rgba(90,70,40,.18)';c.lineWidth=1;c.beginPath();c.moveTo(ax+1.5,ay+1.5);c.lineTo(bx+1.5,by+1.5);c.stroke()}
 const vg=c.createRadialGradient(MW/2,MH/2,MH*.35,MW/2,MH/2,MW*.62);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(110,75,35,.35)');c.fillStyle=vg;c.fillRect(x0,y0,x1-x0,y1-y0);
 c.restore();
 // corner tacks holding the map on the cork
 for(const [px,py] of[[x0+8,y0+8],[x1-8,y0+8],[x0+8,y1-8],[x1-8,y1-8]]){const g=c.createRadialGradient(px-2,py-2,1,px,py,7);g.addColorStop(0,'#f4f4f4');g.addColorStop(1,'#7a7a7a');c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(px+2,py+3,6,0,7);c.fill();c.fillStyle=g;c.beginPath();c.arc(px,py,6,0,7);c.fill()}
 return cv;
}
function pinIcon(k){
 if(M.icons[k])return M.icons[k];const T=TYPES[k],cv=document.createElement('canvas');cv.width=64;cv.height=92;const c=cv.getContext('2d');
 c.strokeStyle='#8c8c8c';c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(32,44);c.lineTo(32,88);c.stroke();c.strokeStyle='#e0e0e0';c.lineWidth=1;c.beginPath();c.moveTo(31,46);c.lineTo(31,84);c.stroke();
 c.fillStyle=T.dk;c.beginPath();c.ellipse(32,42,13,6,0,0,7);c.fill();                                   // collar
 c.fillStyle=T.col;c.fillRect(24,30,16,12);
 const g=c.createRadialGradient(24,16,3,32,24,22);g.addColorStop(0,T.hi);g.addColorStop(.35,T.col);g.addColorStop(1,T.dk);
 c.fillStyle=g;c.beginPath();c.arc(32,24,21,0,7);c.fill();c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.5;c.stroke();
 c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(24,15,6,4,-.6,0,7);c.fill();
 return M.icons[k]=cv.toDataURL();
}
function fortIcon(){
 if(M.icons.fort)return M.icons.fort;const cv=document.createElement('canvas');cv.width=128;cv.height=128;const c=cv.getContext('2d');
 c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(64,108,52,12,0,0,7);c.fill();
 const stone=(x,y,w,h,base,dark)=>{c.fillStyle=base;c.fillRect(x,y,w,h);c.strokeStyle=dark;c.lineWidth=1;for(let yy=y+6;yy<y+h;yy+=7){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();for(let xx=x+((yy/7)%2?4:9);xx<x+w;xx+=11){c.beginPath();c.moveTo(xx,yy-7);c.lineTo(xx,yy);c.stroke()}}c.strokeStyle='#2a2218';c.lineWidth=2;c.strokeRect(x,y,w,h)};
 const cren=(x,y,w,base)=>{for(let xx=x;xx<x+w-2;xx+=9){c.fillStyle=base;c.fillRect(xx,y-7,6,7);c.strokeStyle='#2a2218';c.lineWidth=1.5;c.strokeRect(xx,y-7,6,7)}};
 stone(28,52,72,52,'#9a8f7c','#6e6554');cren(28,52,72,'#9a8f7c');                                          // curtain wall
 stone(10,38,26,68,'#8d826f','#625a4a');cren(10,38,26,'#8d826f');stone(92,38,26,68,'#8d826f','#625a4a');cren(92,38,26,'#8d826f'); // towers
 c.fillStyle='#2a1c10';c.beginPath();c.moveTo(52,104);c.lineTo(52,82);c.arc(64,82,12,Math.PI,0);c.lineTo(76,104);c.fill();               // gate
 c.strokeStyle='#5a4028';c.lineWidth=2;for(let x=55;x<75;x+=5){c.beginPath();c.moveTo(x,74);c.lineTo(x,104);c.stroke()}
 for(const x of[20,102]){c.fillStyle='#1c140c';c.fillRect(x,58,5,12)}
 c.strokeStyle='#3a2a18';c.lineWidth=3;c.beginPath();c.moveTo(64,52);c.lineTo(64,10);c.stroke();                                   // flag
 c.fillStyle='#c81e1e';c.beginPath();c.moveTo(65,11);c.quadraticCurveTo(80,6,94,14);c.quadraticCurveTo(80,20,65,28);c.fill();c.strokeStyle='#7a1010';c.lineWidth=1;c.stroke();
 return M.icons.fort=cv.toDataURL();
}

/* ---------------- HQ window ---------------- */
function render(){
 const cv=document.getElementById('tmCv');if(!cv||!G||!G.day)return;ensureRun();
 const t=G.tmap;if(M.imgSeed!==t.seed){M.img=paintMap(t.seed,t.town);M.imgSeed=t.seed}
 cv.getContext('2d').drawImage(M.img,0,0);
 const ov=document.getElementById('tmOver'),pct=(v,a)=>((a?PAD+v*(MH-2*PAD):PAD+v*(MW-2*PAD))/(a?MH:MW)*100).toFixed(2)+'%';
 const fn=(window.FORTS&&FORTS[G.fort]&&FORTS[G.fort].n)||(typeof FORTS!=='undefined'&&FORTS[G.fort]?FORTS[G.fort].n:'Fort HQ');
 let h=`<div class="tmFort" style="left:${pct(t.fx)};top:${pct(t.fy,1)}"><img src="${fortIcon()}" alt=""><span>FORT HQ</span></div>`;
 for(const p of G.pins){const T=TYPES[p.t];h+=`<div class="tmPin${M.sel===p.id?' sel':''}" data-pin="${p.id}" style="left:${pct(p.x)};top:${pct(p.y,1)}" title="${T.full} - ${fmtH(hoursFor(p))} drive"><img src="${pinIcon(p.t)}" alt="${T.n}"></div>`}
 ov.innerHTML=h;
 ov.querySelectorAll('.tmPin').forEach(el=>{el.onclick=e=>{e.stopPropagation();try{S.ui()}catch(_){}M.sel=+el.dataset.pin;render()};el.onmouseenter=()=>{try{S.ui()}catch(_){}}});
 ov.onclick=()=>{if(M.sel!=null){M.sel=null;render()}};
 document.getElementById('tmLegend').innerHTML=ORDER.map(k=>`<span><img src="${pinIcon(k)}" alt=""><b style="color:${TYPES[k].col}">${TYPES[k].n}</b></span>`).join('')+`<span><img src="${fortIcon()}" alt="" style="height:24px"><b class="y">Fort HQ</b></span><button id="tmGo" class="go" ${M.sel!=null&&!M.driving?'':'disabled'} title="Board the truck to the selected pin">GO!</button>`;
 {const b=document.getElementById('tmGo');if(b)b.onclick=()=>{if(M.sel!=null)launch(M.sel)}}
 document.getElementById('tmDay').textContent=`Day ${G.day} · ${G.pins.length} lead${G.pins.length===1?'':'s'}`;
 const info=document.getElementById('tmInfo'),p=G.pins.find(q=>q.id===M.sel);
 if(p){const T=TYPES[p.t],hh=hoursFor(p);
  info.innerHTML=`<div class="h" style="font-size:20px;color:${T.col}">${T.full}</div><div class="m">${T.desc}</div><div style="margin-top:4px">Drive: <b class="y">${fmtH(hh)}</b> each way · ${(pinDist(p)*3.4).toFixed(1)} miles from the fort (Scout skill shortens the drive).</div><div class="m" style="margin-top:4px">Press <b class="r">GO!</b> to board the truck.</div>`;
  void 0}
 else info.innerHTML=G.pins.length?`<span class="m">${fn}'s radio picked up ${G.pins.length} lead${G.pins.length>1?'s':''} today. Click a pin on the map to plan a run. Pins are re-rolled every morning.</span>`
  :`<span class="m">No leads left today. Rest until morning for new rumours.</span>`;
}
M.render=render;
/* v063: the drive is shown on the map: engine sound, a dashed route drawn along the streets from the fort to the pin, then the map zooms
   into the pin while the screen fades to black ("Loading map..."), and the mission town is built. */
function routeTo(p){const R=M.roads,t=G.tmap,px=v=>PAD+v*(MW-2*PAD),py=v=>PAD+v*(MH-2*PAD);if(!R)return[[px(t.fx),py(t.fy)],[px(p.x),py(p.y)]];
 const F=[px(t.fx),py(t.fy)],P=[px(p.x),py(p.y)],near=(a,v)=>a.reduce((b,c)=>Math.abs(c-v)<Math.abs(b-v)?c:b,a[0]);
 const vx0=near(R.vx,F[0]),hy1=near(R.hy,P[1]),vx1=near(R.vx,P[0]);
 const pts=[F,[vx0,F[1]],[vx0,hy1],[vx1,hy1],[vx1,P[1]],P];return pts.filter((q,i)=>!i||Math.hypot(q[0]-pts[i-1][0],q[1]-pts[i-1][1])>.5)}
function engine(dur){try{if(typeof initAudio==='function')initAudio();if(!AC||!SFX)return null;const t=AC.currentTime,out=AC.createGain(),lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=2.5;out.gain.setValueAtTime(.0001,t);out.gain.linearRampToValueAtTime(.32,t+.5);lp.connect(out);out.connect(SFX);
 const os=[];for(const [ty,m,v] of[['sawtooth',1,.5],['square',2,.18],['sawtooth',.5,.4]]){const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(34*m,t);o.frequency.linearRampToValueAtTime(46*m,t+.9);o.frequency.linearRampToValueAtTime(40*m,t+1.4);o.frequency.linearRampToValueAtTime(52*m,t+dur*.8);o.frequency.linearRampToValueAtTime(30*m,t+dur+1.2);g.gain.value=v;o.connect(g);g.connect(lp);o.start(t);os.push(o)}
 const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=11;lg.gain.value=3.5;l.connect(lg);for(const o of os)lg.connect(o.frequency);l.start(t);os.push(l);
 if(NB){const n=AC.createBufferSource(),bp=AC.createBiquadFilter(),ng=AC.createGain();n.buffer=NB;n.loop=true;bp.type='bandpass';bp.frequency.value=160;bp.Q.value=.8;ng.gain.value=.25;n.connect(bp);bp.connect(ng);ng.connect(out);n.start(t);os.push(n)}
 return{stop(f){const t2=AC.currentTime;out.gain.cancelScheduledValues(t2);out.gain.setValueAtTime(out.gain.value,t2);out.gain.linearRampToValueAtTime(.0001,t2+(f||1));for(const o of os)try{o.stop(t2+(f||1)+.05)}catch(e){}}}}catch(e){return null}}
function launch(id){
 const p=G.pins.find(q=>q.id===id);if(!p||M.driving)return;const h=hoursFor(p);
 G.mission={t:p.t,id:p.id,h};M.sel=p.id;M.driving=true;
 G.tripH=h;try{skScoutTrained()}catch(e){}
 const prevMode=G.mode;G.mode='TRAVEL';G.hqPause=false;try{document.exitPointerLock()}catch(e){}
 const hq=document.getElementById('hq'),wrap=document.getElementById('tmWrap'),go_=document.getElementById('tmGo');if(go_)go_.disabled=true;hq.style.pointerEvents='none';
 const pts=routeTo(p);let tot=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);tot+=l}
 let cv=document.getElementById('tmRoute');if(!cv){cv=document.createElement('canvas');cv.id='tmRoute';cv.width=MW;cv.height=MH;cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';wrap.appendChild(cv)}
 const cx=cv.getContext('2d'),DRAW=Math.min(4.6,2.4+tot/420),ZOOM=1.7,snd=engine(DRAW+ZOOM),t0=performance.now();
 const grid=document.getElementById('hqGrid')||wrap,gr=grid.getBoundingClientRect(),wr=wrap.getBoundingClientRect(),ox=wr.left-gr.left+(PAD+p.x*(MW-2*PAD))/MW*wr.width,oy=wr.top-gr.top+(PAD+p.y*(MH-2*PAD))/MH*wr.height;
 grid.style.transformOrigin=ox+'px '+oy+'px';grid.style.transition='none';
 let fade=document.getElementById('tmFade');if(!fade){fade=document.createElement('div');fade.id='tmFade';fade.style.cssText='position:fixed;inset:0;z-index:80;background:#000;opacity:0;pointer-events:none;display:flex;align-items:center;justify-content:center;color:#facc15;font:700 34px Impact,sans-serif;letter-spacing:3px';fade.textContent='Loading map...';document.body.appendChild(fade)}
 function path(L){cx.clearRect(0,0,MW,MH);let left=L,last=pts[0];cx.lineCap='round';cx.lineJoin='round';const doPath=()=>{cx.beginPath();cx.moveTo(pts[0][0],pts[0][1]);left=L;last=pts[0];
   for(let i=1;i<pts.length&&left>0;i++){const k=Math.min(1,left/seg[i-1]),x=pts[i-1][0]+(pts[i][0]-pts[i-1][0])*k,y=pts[i-1][1]+(pts[i][1]-pts[i-1][1])*k;cx.lineTo(x,y);last=[x,y];left-=seg[i-1]}};
  doPath();cx.setLineDash([]);cx.strokeStyle='rgba(40,20,10,.35)';cx.lineWidth=7;cx.stroke();
  doPath();cx.setLineDash([11,8]);cx.lineDashOffset=-L*.0;cx.strokeStyle='#b31212';cx.lineWidth=4.5;cx.stroke();
  cx.setLineDash([]);cx.fillStyle='#b31212';cx.strokeStyle='#fff';cx.lineWidth=2;cx.beginPath();cx.arc(last[0],last[1],7,0,7);cx.fill();cx.stroke()}
 function frame(){const t=(performance.now()-t0)/1000;
  if(t<DRAW){path(tot*ss(t/DRAW));requestAnimationFrame(frame);return}
  path(tot);const z=Math.min(1,(t-DRAW)/ZOOM),e=z*z*(3-2*z);grid.style.transform='scale('+(1+2.6*e)+')';fade.style.opacity=String(Math.min(1,e*1.25));
  if(z<1){requestAnimationFrame(frame);return}
  // fully black: build the mission town
  if(snd)snd.stop(.6);
  const after=()=>{grid.style.transform='';cx.clearRect(0,0,MW,MH);hq.style.pointerEvents='';M.driving=false;M.sel=null;
   fade.style.transition='opacity .9s';requestAnimationFrame(()=>{fade.style.opacity='0'});setTimeout(()=>{fade.style.transition=''},950)};
  /* v075: the loading screen builds the town step by step with the zombie bar, then waits for a key that locks the mouse */
  setTimeout(()=>{try{advanceTime(h);G.pins=G.pins.filter(q=>q!==p)}catch(err){console.error('[missions] launch',err)}
   if(window.MFZLOAD&&MFZLOAD.mission)MFZLOAD.mission('EXPEDITION',after);else{try{go('EXPEDITION')}catch(err){console.error('[missions] launch',err)}after()}},60)}
 requestAnimationFrame(frame);
}
const ss=t=>t*t*(3-2*t);
M.launch=launch;

/* ---------------- expedition: emphasis on the chosen pin ---------------- */
function surviveCount(){const r=Math.random();return r<.65?1:r<.92?2:3}
function missionSite(){
 const T=TYPES[G.mission.t],R=window.FZ&&FZ.cfg&&FZ.cfg.rumors;let pool=null;
 try{const r=R&&Object.values(R).find(q=>q.tag===T.tag);if(r)pool=fzCands(r)}catch(e){pool=null}
 if(!pool||!pool.length)pool=buildings.filter(b=>b.cat&&b.t!=='park'&&b.t!=='cemetery'&&Math.hypot(b.x-TRUCK.x,b.z-TRUCK.z)>25);
 if(!pool.length)pool=buildings.filter(b=>b.t!=='park'&&b.t!=='cemetery');
 return pool.length?PK(pool):null;
}
function buildMission(){
 FZR.length=0;const T=TYPES[G.mission.t],b=missionSite();if(!b){console.warn('[missions] no building for the mission');return}
 const spot=()=>{for(let i=0;i<60;i++){const x=b.x+rnd(-b.w/2+2,b.w/2-2),z=b.z+rnd(-b.d/2+2,b.d/2-2);if(!blocked(x,z,.9))return[x,z]}return null};
 const made={cont:0,surv:0,z:0};
 if(G.mission.t==='weapons')for(let i=ri(2,3);i>0;i--){const s=spot();if(s){spawnContainer(s[0],s[1],'gunshop');made.cont++}}
 if(G.mission.t==='supplies')for(const tb of['diner','clinic','hardware']){const s=spot();if(s){spawnContainer(s[0],s[1],tb);made.cont++}}
 if(G.mission.t==='survivors')for(let i=surviveCount();i>0;i--){const s=spot();if(s){const n=makePerson(0x0284c7,s[0],s[1]);n.rotation.y=rnd(0,TAU);n.userData={kind:'npc'};scene.add(n);npcList.push(n);made.surv++}}
 for(let i=ri(3,5);i>0;i--){const s=spot();if(s){zombie(s[0],s[1]);made.z++}}
 G.mission.b={x:b.x,z:b.z,t:b.t};G.mission.made=made;
 FZR.push({k:G.mission.t,name:T.full,col:T.col,b,px:b.x+rnd(-18,18),pz:b.z+rnd(-18,18),done:false});
 fzRumHud();
}
// random town survivors: none on mission maps (survivor pins bring their own 1-3)
const _place=placeNpcs;placeNpcs=function(n){if(G.mode==='EXPEDITION'&&G.mission)return;return _place.apply(this,arguments)};
// the rumor hook (called right after town()) builds the mission site instead of the 2 random rumors
const _rum=fzRumors;fzRumors=function(){if(G.mode==='EXPEDITION'&&G.mission){try{buildMission()}catch(e){console.error('[missions]',e)}return}return _rum.apply(this,arguments)};
// leaving the town ends the mission
const _go=go;go=function(m){if(m!=='EXPEDITION')G.mission=null;return _go.apply(this,arguments)};
// pins re-roll every morning; a new campaign picks a new fort spot on the map
const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{rollPins()}catch(e){console.error('[missions] pins',e)}return r};
const _ic=initCampaign;initCampaign=function(){const r=_ic.apply(this,arguments);G.mission=null;newRun();return r};
const _hq=hqUI;hqUI=function(){const r=_hq.apply(this,arguments);try{render()}catch(e){console.error('[missions] map',e)}return r};
// HUD texts
window.mzObjective=function(){const ms=G.mission;if(!ms)return'Scavenge, then return to the truck (E)';const T=TYPES[ms.t],d=FZR[0]&&FZR[0].done;
 return d?`${T.full} found - loot it, then return to the truck (E)`:ms.t==='survivors'?'Find the survivors (blue ring on the radar), then return to the truck (E)':`Find the ${T.full.toLowerCase()} (${ms.t==='weapons'?'green':'purple'} ring on the radar), then return to the truck (E)`};
window.mzArriveToast=function(){const ms=G.mission;if(!ms)return'Survivors are hiding in buildings - watch for blue dots on the radar!';
 return ms.t==='survivors'?'Survivors are signalling from a building inside the blue ring - bring them back to the truck!':`The ${TYPES[ms.t].full.toLowerCase()} is somewhere inside the ${ms.t==='weapons'?'green':'purple'} ring on your radar.`};
console.log('[missions] town map missions ready');
})();
