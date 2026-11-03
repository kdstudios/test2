/* ==========================================================================================================
   MINI FORT ZOMBIE - CLIMAX CINEMA (v072): a full-block two-storey picture palace (40 x 36 m plot, front = +Z), our own design.
   Exterior: a 38 x 30 m brick box over a band of white tile panels on a granite plinth, an ornate concrete cornice with pilaster blocks,
   tall lit upper windows, a vertical CLIMAX blade sign ringed with bulbs, a V-shaped marquee (two letter boards of horror puns, some
   letters missing, a bulb-studded centre column and a lit soffit), poster cases either side of the glass doors, street lights,
   hydrant and no-parking sign on the sidewalk, and a service alley behind (dumpster, burning barrel, back and exit doors).
   Ground floor: lobby with purple film-reel carpet, red walls with a grid of square sconces and long light boxes, box office, concession
   stand (popcorn machine, soda fountain, nacho warmer, hot dogs, lit menu boards), a WIN THIS CAR display behind velvet ropes, benches,
   plants, posters and a cardboard standee; a full-height auditorium (red walls with gold pilasters, stage with steps, a giant screen,
   three banks of red seats on purple carpet with red aisles, EXIT doors, wall speakers, dusty projector beams), a restroom and the
   concrete stairwell.
   Upstairs: projection booth (two film projectors on pedestals through port windows, a three-deck platter, rewind bench, film cans,
   sound rack), prop vault (stacked spare seats, a coffin, a mummy case, a giant spider, crates of marquee letters, kernel sacks),
   manager's office (CCTV monitors, open safe, filing cabinets, a barricade, tally marks on the wall), staff room (lockers, sofa,
   kitchenette, notice board) and a hall with a vending machine.
   Structure from core WL / slab / stairs (doors and windows work, the floor and stairs are walkable); detail is our own geometry.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[cinema] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const X0=-19,X1=19,Z0=-15,Z1=15,ZP=5.5,HL=4.6,HU=4.8,H=9.4;            // ZP = lobby / auditorium partition; HL = ground storey; HU = upper storey
const SX0=10,SX1=16.6,SZ0=11.6;                                          // stairwell
const RED='#c41a1a',ORG='#d8661a',GOLD='#d8a83a',PURP='#5a1a8a';

/* ===================== artwork ===================== */
const POSTERS=[['DAWN OF','THE DEBT','#2a3a1a','#c8e85a'],['BRAAAINS','ON A PLANE','#0a1a3a','#ff5a5a'],['THE WALKING','DEADBEATS','#3a2a1a','#f4e8c8'],['GONE WITH','THE WINDPIPE','#4a0a0a','#ffd23a'],
 ['ATTACK OF THE','50FT INTERN','#1a1a1a','#5affe8'],['CHAINSAW','AT THE DMV','#3a0a2a','#ff8a2a'],['NIGHT OF THE','LIVING DEADLINE','#0a0a0a','#e8e8e8'],['I KNOW WHAT YOU','ATE LAST SUMMER','#1a2a2a','#ff3a3a']];
const posterMat=i=>K.paint('cc_post'+i,256,384,(c,W,H,r)=>{const p=POSTERS[i%POSTERS.length];const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,p[2]);g.addColorStop(1,'#000');c.fillStyle=g;c.fillRect(0,0,W,H);
 // a figure: shambling silhouette with outstretched arms, or a big eye, or a hand from the grave
 c.fillStyle='rgba(0,0,0,.85)';const k=i%3;if(k===0){c.beginPath();c.arc(W/2,150,28,0,PI*2);c.fill();c.fillRect(W/2-24,176,48,110);c.fillRect(W/2-90,190,70,16);c.fillRect(W/2+20,196,74,16);c.fillRect(W/2-22,280,16,70);c.fillRect(W/2+6,280,16,70);c.fillStyle=p[3];c.fillRect(W/2-12,144,6,6);c.fillRect(W/2+6,144,6,6)}
 else if(k===1){c.fillStyle='#f4f0e8';c.beginPath();c.ellipse(W/2,190,90,50,0,0,PI*2);c.fill();c.fillStyle=p[3];c.beginPath();c.arc(W/2,190,36,0,PI*2);c.fill();c.fillStyle='#000';c.beginPath();c.arc(W/2,190,16,0,PI*2);c.fill();c.strokeStyle='#a01010';c.lineWidth=2;for(let q=0;q<10;q++){c.beginPath();c.moveTo(W/2-90+r()*40,190+(r()-.5)*40);c.lineTo(W/2-40,190+(r()-.5)*30);c.stroke()}}
 else{c.fillStyle='#2a1a10';c.fillRect(0,300,W,84);c.fillStyle='#8a9a7a';c.beginPath();c.moveTo(W/2-20,300);c.lineTo(W/2-26,190);c.lineTo(W/2-46,150);c.lineTo(W/2-36,146);c.lineTo(W/2-20,176);c.lineTo(W/2-18,130);c.lineTo(W/2-8,130);c.lineTo(W/2-6,170);c.lineTo(W/2,124);c.lineTo(W/2+10,126);c.lineTo(W/2+8,172);c.lineTo(W/2+20,136);c.lineTo(W/2+30,140);c.lineTo(W/2+18,190);c.lineTo(W/2+22,300);c.fill()}
 P.text(c,p[0],W/2,40,{size:28,col:p[3],max:W-20});P.text(c,p[1],W/2,80,{size:38,col:'#fff',max:W-16,stroke:'#000',lw:4});P.text(c,'RATED R  -  FOR RUNNING',W/2,H-20,{size:14,col:'#aaa'});P.grime(c,W,H,r,.3)},{r:.45,glow:.15});
// a marquee letter board: black letters on lit white rows, with a few letters missing or slipped
function marqueeBoard(key,lines){return K.paint(key,1024,520,(c,W,H,r)=>{c.fillStyle='#f4f2ea';c.fillRect(0,0,W,H);const rh=H/lines.length;
 for(let i=0;i<lines.length;i++){c.fillStyle='#d8d4c8';c.fillRect(0,i*rh+rh-6,W,6);c.fillStyle='#1a1a1a';c.font=`bold ${rh*.66}px 'MFZ Head'`;c.textBaseline='middle';const s=lines[i];const tw=c.measureText(s).width,sc=Math.min(1,(W-60)/tw);let x=W/2-tw*sc/2;
  for(let k=0;k<s.length;k++){const ch=s[k],w=c.measureText(ch).width*sc;if(ch!==' '&&i>1&&r()<.025){x+=w;continue}c.save();c.translate(x+w/2,i*rh+rh/2+(r()<.06?8:0));c.rotate(r()<.06?(r()-.5)*.6:0);c.scale(sc,1);c.fillText(ch,-w/2/sc,0);c.restore();x+=w}}
 P.grime(c,W,H,r,.35)},{glow:.55,r:.4})}
const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 brick:()=>K.tri('cc_brick',(c,W,H,r)=>{c.fillStyle='#c8b498';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2,dark=r()<.08;c.fillStyle=dark?`hsl(14,${48+r()*10}%,${30+r()*8}%)`:`hsl(${22+r()*8},${46+r()*12}%,${56+r()*10}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4)}P.noise(c,W,H,r,6000,.15,'#5a3a20',1.5);P.grime(c,W,H,r,.4)},{tile:.38,r:.9}),
 tile:()=>K.tri('cc_tile',(c,W,H,r)=>{c.fillStyle='#9a9c9e';c.fillRect(0,0,W,H);const n=2,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const g=c.createLinearGradient(i*s,j*s,i*s+s,j*s+s);g.addColorStop(0,'#eceeee');g.addColorStop(1,'#d4d6d8');c.fillStyle=g;c.fillRect(i*s+4,j*s+4,s-8,s-8)}P.grime(c,W,H,r,.45)},{tile:.42,r:.35}),
 granite:()=>K.tri('cc_gran',(c,W,H,r)=>{c.fillStyle='#6a6c70';c.fillRect(0,0,W,H);P.noise(c,W,H,r,14000,.5,'#2a2a2c',2);P.noise(c,W,H,r,8000,.4,'#b8b8bc',2)},{tile:.6,r:.4}),
 cornice:()=>K.tri('cc_corn',(c,W,H,r)=>{c.fillStyle='#c8c6c0';c.fillRect(0,0,W,H);P.noise(c,W,H,r,20000,.2,'#7a7874',1.5);for(let i=0;i<14;i++){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(50,60,50,.35)');g.addColorStop(1,'rgba(50,60,50,0)');c.fillStyle=g;c.fillRect(r()*W,0,4+r()*12,H*(.3+r()*.7))}P.grime(c,W,H,r,.5)},{tile:.4,r:.9}),
 carpet:()=>K.tri('cc_carpet',(c,W,H,r)=>{c.fillStyle='#4a1478';c.fillRect(0,0,W,H);P.noise(c,W,H,r,12000,.25,'#2a0a48',1.3);const n=3,s=W/n;
  for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=i*s+s/2+(j%2)*s/4,y=j*s+s/2;c.strokeStyle='#2a2a2a';c.lineWidth=5;c.beginPath();c.moveTo(x-20,y+10);c.bezierCurveTo(x-60,y+30,x-50,y-30,x-80,y-20);c.stroke();
   c.fillStyle='#9a9ca0';c.beginPath();c.arc(x,y,24,0,PI*2);c.fill();c.fillStyle='#4a4c50';for(let q=0;q<5;q++){const a=q*PI*2/5;c.beginPath();c.moveTo(x,y);c.arc(x,y,18,a,a+.6);c.fill()}c.fillStyle='#2a4ac8';c.fillRect(x-4,y+8,20,6);
   for(let q=0;q<4;q++){c.fillStyle=['#f4e8a8','#e85a3a','#d8b030'][q%3];c.fillRect(x-50+r()*90,y-50+r()*90,6,4)}}},{tile:.55,r:.95}),
 redwall:()=>K.tri('cc_red',(c,W,H,r)=>{c.fillStyle='#8a0e10';c.fillRect(0,0,W,H);P.noise(c,W,H,r,8000,.15,'#5a0608',2);P.grime(c,W,H,r,.25)},{tile:.5,r:.8}),
 aisle:()=>K.tri('cc_aisle',(c,W,H,r)=>{c.fillStyle='#a8141a';c.fillRect(0,0,W,H);P.noise(c,W,H,r,12000,.25,'#6a0a0e',1.3)},{tile:.6,r:.95}),
 seat:()=>K.mat(0x7a0e12,.85),
 stage:()=>K.veneer(0x9a5a2a,{tile:.6}),
 ceil:()=>K.tri('cc_ceil',(c,W,H,r)=>{c.fillStyle='#d4d4ce';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.16,'#7a7a74',1.3);c.fillStyle='#8a8a84';c.fillRect(0,0,W,5);c.fillRect(0,0,5,H);c.fillRect(0,H/2,W,3);c.fillRect(W/2,0,3,H)},{tile:.84,r:.9}),
 darkceil:()=>K.tri('cc_dceil',(c,W,H,r)=>{c.fillStyle='#3a1012';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.2,'#1a0606',1.3);c.fillStyle='#2a0a0a';c.fillRect(0,0,W,6);c.fillRect(0,0,6,H)},{tile:.5,r:.9}),
 plaster:()=>K.tri('cc_plas',(c,W,H,r)=>{c.fillStyle='#d4d2cc';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.14,'#8a8680',2);P.noise(c,W,H,r,5000,.1,'#f4f2ec',2)},{tile:.45,r:.9}),
 conc:()=>K.tri('cc_conc',(c,W,H,r)=>{c.fillStyle='#8a8884';c.fillRect(0,0,W,H);P.noise(c,W,H,r,20000,.3,'#4a4844',1.6);P.grime(c,W,H,r,.6)},{tile:.3,r:.85}),
 lino:()=>K.tri('cc_lino',(c,W,H,r)=>{const n=4,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){c.fillStyle=(i+j)%2?'#b8b4a8':'#d8d4c8';c.fillRect(i*s,j*s,s,s)}P.grime(c,W,H,r,.5)},{tile:.6,r:.6}),
 asphalt:()=>K.surf('asphalt',0x3a3c40),concrete:()=>K.surf('concrete',0xb0aea6)
})[k]());

/* ===================== props built here ===================== */
function projector(b,x,y,z){b.push([x,y,z]);const gm=K.mat(0x3a4a5a,.4,.5),dk=K.mat(0x1a1a1c,.4,.5);b.rbox(.7,1.0,.7,.03,gm,[0,.5,0]);b.cyl(.06,.06,.3,dk,[0,1.15,0],null,10);
 b.rbox(.55,.7,1.3,.04,gm,[0,1.6,.1]);b.rbox(.4,.55,.5,.04,dk,[0,1.65,.9]);b.cyl(.12,.12,.5,dk,[0,1.6,-.75],[PI/2,0,0],16);b.cyl(.1,.1,.02,K.glass(0xaaccff,.6),[0,1.6,-1.0],[PI/2,0,0],16);
 for(const [zz,yy] of[[.55,2.5],[-.25,2.5]]){b.cyl(.025,.025,.6,dk,[0,yy-.3,zz],null,6);b.cyl(.5,.5,.06,K.mat(0x8a8c8e,.3,.8),[0,yy,zz],[0,0,PI/2],32);b.cyl(.14,.14,.08,dk,[0,yy,zz],[0,0,PI/2],12);b.cyl(.45,.45,.04,K.mat(0x2a1a10,.6),[0,yy,zz],[0,0,PI/2],32)}
 b.cyl(.08,.08,.5,K.mat(0x5a5c5e,.4,.6),[0,2.15,.95],null,10);b.pop()}
function seatRow(b,x0,x1,z){const n=Math.floor((x1-x0)/.56),sm=surf('seat'),fr=K.mat(0x1a1a1c,.4,.5);for(let i=0;i<n;i++){const x=x0+.28+i*(x1-x0-.56)/(n-1);
 b.box(.46,.1,.42,sm,[x,.48,z+.05],[-.15,0,0],0);b.box(.46,.62,.08,sm,[x,.85,z-.2],[.12,0,0],0);b.box(.06,.45,.06,fr,[x,.22,z-.12],null,0)}
 for(let i=0;i<=n;i++){const x=x0+i*(x1-x0)/n;b.box(.06,.12,.4,fr,[x,.68,z],null,0);b.box(.04,.62,.04,fr,[x,.31,z-.1],null,0)}}
function sofa(b,x,z,a,len,col){b.push([x,0,z],[0,a,0]);const m=K.mat(col,.85);b.rbox(len,.4,.85,.06,m,[0,.25,0]);b.rbox(len,.55,.22,.08,m,[0,.65,-.32]);for(const s of[-1,1])b.rbox(.2,.55,.85,.08,m,[s*(len/2-.1),.45,0]);b.pop()}
function plant(b,x,y,z,s){b.lathe([[0,0],[.18*s,0],[.26*s,.1*s],[.28*s,.3*s],[.24*s,.4*s],[0,.4*s]],K.mat(0xd8783a,.6),[x,y,z],14);b.cyl(.24*s,.24*s,.02,K.surf('humus',0x3a2a1a),[x,y+.38*s,z],null,12);b.cyl(.02*s,.025*s,1.4*s,K.mat(0x5a7a2a,.7),[x,y+1.0*s,z],null,6);
 const lf=K.mat(0x3a7a2a,.7);for(let k=0;k<9;k++){const a=k*1.3,h=y+(.7+k*.09)*s;b.add(K.sphGeo(.16*s,8,6),lf,{p:[x+Math.cos(a)*.22*s,h,z+Math.sin(a)*.22*s],s:[1.6,.2,.9],r:[0,-a,.4]})}}

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
function build(){if(CACHE)return CACHE;const b=K.builder('climax'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),rnd=b.rnd,conc=surf('concrete'),dark=K.mat(0x1a1a1c,.5),gold=K.mat(0xc8962a,.35,.8);
 const bulb=K.mat(0xfff4d0,.3,0,{emissive:0xffe0a0,emissiveIntensity:1.0});
 const Wn=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 const FRONT_L=[...Wn([-12,-10.4,-2.4,2.4,10.4,12]),{k:'d',c:-.65},{k:'d',c:.65}],FRONT_U=Wn([-15,-12,-5.5,1.5,7.5]);
 /* ---------- ground: sidewalk, apron, side strips, rear alley ---------- */
 b.box(40,.06,2.1,conc,[0,.03,16.95],null,0);for(let x=-19.5;x<20;x+=1.5)b.box(.02,.062,2.08,K.mat(0x8a8880,.8),[x,.031,16.95],null,0);b.box(40,.16,.2,conc,[0,.08,15.9],null,0);
 b.box(40,.05,.9,conc,[0,.025,15.45],null,0);for(const s of[-1,1])b.box(1,.04,31,conc,[s*19.5,.02,0],null,0);b.box(40,.025,2.95,surf('asphalt'),[0,.012,-16.5],null,0);
 for(let i=0;i<14;i++)b.add(K.sphGeo(.035,6,4),K.mat(0xf4e8a8,.7),{p:[-1.2+rnd()*2.4,.07,15.6+rnd()*1.6],s:[1,.6,1]});                 // spilled popcorn
 /* ---------- facade skin: granite plinth, white tile band, brick, cornice ---------- */
 const brk=surf('brick'),tl=surf('tile'),gr=surf('granite'),corn=surf('cornice');
 const skin=(ax,f,a0,a1,n,opsL,opsU,full)=>{const pc=(u0,u1,y0,y1,m,dep)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(.15+dep/2),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,m,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,m,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{if(y0<.5)pc(u0,u1,y0,Math.min(.5,y1),gr,.08);if(y1>.5&&y0<3.6)pc(u0,u1,Math.max(.5,y0),Math.min(3.6,y1),tl,.05);if(y1>3.6)pc(u0,u1,Math.max(3.6,y0),y1,brk,.03);if(y0<=3.6&&y1>=3.7)pc(u0,u1,3.55,3.7,K.mat(0x9a9894,.6),.1)};
  const run=(ops,yb,hh)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,yb,yb+hh);if(p.k==='w'){span(p.c-hw,p.c+hw,yb,yb+.9);span(p.c-hw,p.c+hw,yb+2.75,yb+hh)}else span(p.c-hw,p.c+hw,yb+2.4,yb+hh);a=p.c+hw}span(a,a1,yb,yb+hh)};
  if(full)run(opsL,0,H);else{run(opsL,0,HL);run(opsU,HL,HU)}};
 skin(1,Z1,X0,X1,1,FRONT_L,FRONT_U);skin(1,Z0,X0,X1,-1,[{k:'d',c:17.6}],null,1);skin(0,X0,Z0,ZP,-1,[{k:'d',c:-9}],null,1);skin(0,X1,Z0,ZP,1,[{k:'d',c:-9}],null,1);skin(0,X0,ZP,Z1,-1,[],[]);skin(0,X1,ZP,Z1,1,[],[]);
 // cornice: stepped mouldings, pilaster blocks, cap; upper window frames
 const corniceRun=(ax,f,a0,a1,n)=>{const L=a1-a0+1.0,u=(a0+a1)/2;const bx=(w,h,d,y,o)=>ax?b.box(L+w,h,d,corn,[u,y,f+n*o],null,.02):b.box(d,h,L+w,corn,[f+n*o,y,u],null,.02);
  bx(0,.25,.5,H-.1,.25);bx(.2,.5,.3,H+.3,.3);bx(.4,.18,.55,H+.62,.38);bx(.2,1.1,.25,H+1.25,.2);bx(.6,.25,.7,H+1.9,.42);bx(.8,.12,.85,H+2.07,.48);
  for(let s=a0+2;s<a1-1;s+=7.6){const p=ax?[s,H+.9,f+n*.45]:[f+n*.45,H+.9,s];b.box(ax?1.2:.4,1.9,ax?.4:1.2,corn,p,null,.02)}};
 corniceRun(1,Z1,X0,X1,1);corniceRun(1,Z0,X0,X1,-1);corniceRun(0,X0,Z0,Z1,-1);corniceRun(0,X1,Z0,Z1,1);
 b.box(38.6,.12,30.6,K.surf('concrete',0x5a5a58),[0,H+2.0,0],null,0);b.box(38.4,.02,30.4,K.mat(0x34363a,.9),[0,H+2.08,0],null,0);for(const [x,z] of[[-10,-5],[0,-8],[10,-3]]){b.rbox(2.4,1.2,1.8,.03,K.mat(0xb0b4b8,.4,.7),[x,H+2.7,z]);b.cyl(.7,.7,.12,K.mat(0x2a2a2a,.5,.4),[x,H+3.35,z],null,20)}
 for(const c of FRONT_U){b.frame(1.62,1.95,.08,K.mat(0x8a8884,.5),[c,HL+1.825,Z1+.21],.04);b.box(1.8,.14,.3,corn,[c,HL+.83,Z1+.3],null,.01);b.box(1.8,.18,.25,corn,[c,HL+2.88,Z1+.27],null,.01)}
 for(const c of[-12,-10.4,-2.4,2.4,10.4,12])b.frame(1.6,1.92,.07,K.mat(0x9aa0a6,.35,.7),[c,1.825,Z1+.21],.035);
 // poster cases flanking the doors (lit)
 for(let i=0;i<8;i++){const x=(i<4?-8.6:3.8)+(i%4)*1.25;b.rbox(1.0,1.5,.12,.02,K.mat(0x2a2a2c,.4,.5),[x,1.55,Z1+.24]);b.label(.84,1.26,posterMat(i),[x,1.55,Z1+.305]);b.box(.84,1.26,.01,K.glass(0xffffff,.15),[x,1.55,Z1+.315],null,0)}
 /* ---------- blade sign + V marquee ---------- */
 b.push([0,0,Z1+.15]);const sf=K.mat(0x3a3c40,.4,.6);
 b.rbox(1.5,6.4,.5,.04,sf,[0,9.3,1.05]);b.label(1.24,6.0,K.paint('cc_blade',180,1024,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#8a3a10');g.addColorStop(.5,ORG);g.addColorStop(1,'#8a3a10');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#f4e8c8';c.lineWidth=6;c.strokeRect(10,10,W-20,H-20);
  P.text(c,'THE',W/2,60,{size:34,col:'#f4e8c8'});'CLIMAX'.split('').forEach((ch,i)=>P.text(c,ch,W/2,170+i*145,{size:150,col:'#f4ead0',stroke:'#5a2008',lw:6,font:"'MFZ Head'"}));P.grime(c,W,H,r,.35)},{glow:.55,r:.4}),[0,9.3,1.06+.25],[0,0,0]);
 b.label(1.24,6.0,K.paint('cc_blade',180,1024,()=>{},{glow:.55,r:.4}),[0,9.3,1.06-.25],[0,PI,0]);
 for(let k=0;k<17;k++)for(const s of[-1,1]){b.sph(.05,bulb,[s*.68,6.4+k*.36,1.31],null,8);b.sph(.05,bulb,[s*.68,6.4+k*.36,.79],null,8)}
 for(let k=0;k<3;k++)b.box(.12,.12,.9,sf,[0,6.6+k*2.6,.45],null,.01);
 // marquee: centre column + two angled boards on a canopy
 b.rbox(1.6,3.0,.9,.04,sf,[0,4.6,1.2]);b.label(1.0,2.6,K.paint('cc_col',160,416,(c,W,H)=>{c.fillStyle='#2a2a2c';c.fillRect(0,0,W,H);for(let i=0;i<9;i++){c.fillStyle='#c41a1a';c.beginPath();c.moveTo(W/2,20+i*44);c.lineTo(W/2+24,40+i*44);c.lineTo(W/2,60+i*44);c.lineTo(W/2-24,40+i*44);c.fill()}},{glow:.5}),[0,4.6,1.66]);
 for(let k=0;k<8;k++)for(const s of[-1,1])b.sph(.045,bulb,[s*.7,3.3+k*.38,1.67],null,8);
 const LINES_L=['NOW SHOWING','DAWN OF THE DEBT','BRAAAINS ON A PLANE','COMING SOON','THE WALKING DEADBEATS'],LINES_R=['MIDNIGHT SCREAMS','GONE WITH THE WINDPIPE','KIDS EAT FREE','(KIDS ALSO EATEN)','NO REFUNDS. EVER.'];
 for(const s of[-1,1]){b.push([s*2.95,4.5,1.15],[0,-s*.5,0]);b.rbox(4.4,2.7,.35,.04,sf,[0,0,0]);b.label(4.1,2.36,marqueeBoard('cc_mq'+s,s<0?LINES_L:LINES_R),[0,0,.18]);for(let k=0;k<14;k++){b.sph(.04,bulb,[-2.05+k*.315,1.28,.19],null,8);b.sph(.04,bulb,[-2.05+k*.315,-1.28,.19],null,8)}b.box(4.5,.12,.4,K.mat(0x9a9c9e,.4,.7),[0,1.4,0],null,.01);b.pop()}
 b.add(K.extrudeGeo([[-5.6,0],[5.6,0],[4.6,1.6],[0,2.2],[-4.6,1.6]],.3,.02),K.mat(0xe8e8e4,.5,.2),{p:[0,3.0,0],r:[PI/2,0,0]});for(let i=0;i<9;i++)b.cyl(.16,.16,.02,K.mat(0xffffff,.3,0,{emissive:0xfff2d0,emissiveIntensity:.9}),[-3.6+i*.9,2.83,.9+Math.cos((i-4)/4*1.2)*.5],null,12);
 for(const s of[-1,1])b.cyl(.025,.025,3.2,K.mat(0x5a5c5e,.4,.7),[s*3.2,4.6,.4],[.9,0,0],6);
 b.pop();S(-4.8,4.8,Z1+.2,Z1+2.4,2.8,6.0,true);
 // sidewalk: street lights (arms over the sidewalk), hydrant, no parking
 const lm=K.mat(0xb8bcc0,.35,.7);const lightPole=(x)=>{b.push([x,0,17.55]);b.rbox(.45,.6,.45,.04,lm,[0,.3,0]);b.cyl(.09,.14,8.6,lm,[0,4.3,0],null,12);b.tube([[0,8.3,0],[0,8.8,-.6],[0,8.8,-2.0]],.05,lm,12,6);b.rbox(.4,.14,.7,.05,lm,[0,8.75,-2.2]);b.box(.3,.02,.5,K.mat(0xffffff,.4,0,{emissive:0xfff2d0,emissiveIntensity:.8}),[0,8.67,-2.2],null,0);b.pop();S(x-.23,x+.23,17.32,17.78,0,8.6,true)};
 lightPole(-13);lightPole(13);
 b.push([-15.5,0,17.5]);const hy=K.mat(0xc8261c,.45,.3);b.cyl(.13,.15,.6,hy,[0,.32,0],null,16);b.add(K.sphGeo(.14,14,8,0,PI/2),hy,{p:[0,.62,0]});b.cyl(.07,.07,.1,K.mat(0x1a4ea8,.4),[0,.42,.17],[PI/2,0,0],10);for(const s of[-1,1])b.cyl(.05,.05,.12,hy,[s*.17,.42,0],[0,0,PI/2],10);b.cyl(.2,.2,.05,hy,[0,.04,0],null,16);b.pop();S(-15.7,-15.3,17.3,17.7,0,.8,true);
 b.push([-16.4,0,17.7]);b.cyl(.03,.03,2.3,K.mat(0x8a8c8e,.4,.6),[0,1.15,0],null,8);b.label(.35,.5,K.paint('cc_nopark',140,200,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle=RED;c.lineWidth=5;c.strokeRect(5,5,W-10,H-10);P.text(c,'NO',W/2,40,{size:36,col:RED});P.text(c,'PARKING',W/2,84,{size:26,col:RED});P.text(c,'TOW',W/2,126,{size:26,col:RED});P.text(c,'ZONE',W/2,160,{size:26,col:RED})}),[0,2.0,.035]);b.pop();
 // alley: burning barrel, exit stair landing at the back door, graffiti
 b.push([-12,0,-16.6]);b.cyl(.29,.29,.88,K.surf('rust',0xa82a1a,{m:.4}),[0,.44,0],null,18,true);b.pop();S(-12.3,-11.7,-16.9,-16.3,0,1.0,true);
 b.label(6,2.4,K.paint('cc_graf',512,205,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.save();c.translate(40,140);c.rotate(-.08);c.font="italic bold 96px 'MFZ Head'";c.strokeStyle='#1a1a1a';c.lineWidth=10;c.strokeText('THE END?',0,0);c.fillStyle='#c41a1a';c.fillText('THE END?',0,0);c.restore();c.fillStyle='rgba(180,10,10,.8)';for(let i=0;i<12;i++)c.fillRect(60+r()*360,130+r()*20,3,20+r()*50)},{alpha:true}),[0,1.8,Z0-.2],[0,PI,0]);
 /* ---------- lobby interior: floor, walls, ceiling, sconces, light boxes ---------- */
 const cp=surf('carpet'),rw=surf('redwall');
 b.box(37.7,.02,9.35,cp,[0,.035,(ZP+Z1)/2],null,0);
 const lineWall=(ax,f,a0,a1,n,th,ops,m,yb,hh,base)=>{yb=yb||0;ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(th/2+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,m,.012,.006);if(base&&y0<=yb)pc(u0,u1,yb,yb+.15,base,.03,.015)};let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,yb,yb+hh);if(p.k==='w'){span(p.c-hw,p.c+hw,yb,yb+.9);span(p.c-hw,p.c+hw,yb+2.75,yb+hh)}else span(p.c-hw,p.c+hw,yb+2.4,yb+hh);a=p.c+hw}span(a,a1,yb,yb+hh)};
 const gbase=K.mat(0xc8962a,.4,.6);
 lineWall(1,Z1,X0,SX0,-1,.3,FRONT_L.filter(p=>p.c<SX0),rw,0,4.4,gbase);lineWall(0,X0,ZP,Z1,1,.3,[],rw,0,4.4,gbase);lineWall(0,X1,ZP,SZ0,-1,.3,[],rw,0,4.4,gbase);lineWall(1,ZP,X0,X1,1,.3,Dr([-8.65,-7.35,7.35,8.65]),rw,0,4.4,gbase);
 lineWall(0,SX0,SZ0,Z1,-1,.3,Dr([14.15]),rw,0,4.4,gbase);lineWall(1,SZ0,SX0,X1,-1,.3,Dr([17.8]),rw,0,4.4,gbase);
 b.box(37.7,.04,9.35,surf('ceil'),[0,4.38,(ZP+Z1)/2],null,0);
 const lit=K.mat(0xffffff,.4,0,{emissive:0xf4f8ff,emissiveIntensity:.95}),hous=K.mat(0xd8d8d4,.5,.2);
 for(let x=-16;x<9;x+=4)for(const z of[7.5,10.5,13.5]){b.box(2.4,.12,.3,hous,[x,4.28,z],null,.01);b.box(2.3,.012,.2,lit,[x,4.215,z],null,0)}
 for(let i=0;i<14;i++)for(let j=0;j<2;j++){const x=-17.5+i*2.0;if(x>-1.5&&x<1.5)continue;b.box(.22,.22,.06,K.mat(0xf4f0e8,.3,0,{emissive:0xffe8c8,emissiveIntensity:.6}),[x,3.1+j*.7,ZP+.2],null,.01);b.box(.22,.22,.06,K.mat(0xf4f0e8,.3,0,{emissive:0xffe8c8,emissiveIntensity:.6}),[x,3.1+j*.7,Z1-.2],null,.01)}
 // posters on the lobby walls (framed, lit), auditorium door signs
 for(let i=0;i<6;i++){const z=7.4+i*1.25;b.rbox(.08,1.4,.95,.02,gold,[X0+.2,1.8,z]);b.label(.82,1.24,posterMat(i+2),[X0+.245,1.8,z],[0,PI/2,0])}
 for(const x of[-11.2,-4.8,4.8,11.4]){b.rbox(.95,1.4,.08,.02,gold,[x,1.8,ZP+.2]);b.label(.82,1.24,posterMat(Math.abs(Math.round(x))),[x,1.8,ZP+.245])}
 for(const [x,t] of[[-8,'SCREEN 1'],[8,'SCREEN 1  ->']])b.label(1.4,.32,K.paint('cc_door'+x,320,74,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'SCREEN 1',W/2,H/2,{size:40,col:GOLD})},{glow:.5}),[x,2.75,ZP+.2]);
 // box office: dark counter with two registers and a ticket printer, TICKETS sign hanging
 b.push([-3.6,0,12.2]);b.box(3.8,1.05,.75,K.mat(0x121214,.35,.3),[0,.525,0],null,.01);b.box(3.9,.05,.85,gr,[0,1.07,0],null,.01);for(const x of[-1,1]){b.push([x,1.1,0]);b.rbox(.42,.12,.38,.02,K.mat(0x9a9c9e,.4,.5),[0,.06,0]);b.rbox(.36,.2,.22,.02,K.mat(0xa8aaac,.4,.5),[0,.2,.06],[.3,0,0]);b.rbox(.24,.18,.04,.01,blk,[0,.42,.15]);b.pop()}
 b.rbox(.3,.2,.3,.02,K.mat(0x3a3c40,.4,.4),[0,1.2,0]);for(let i=0;i<5;i++)b.box(.08,.002,.2,K.mat(0xf4e8c8,.6),[(rnd()-.5)*.6,1.1,.2+rnd()*.2],[0,rnd()*3,0],0);
 b.label(1.6,.4,K.paint('cc_tix',384,96,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'TICKETS',W/2,H/2,{size:60,col:'#fff'})},{glow:.5}),[0,3.2,0]);for(const s of[-.6,.6])b.cyl(.006,.006,1.0,blk,[s,3.9,0],null,4);b.pop();S(-5.5,-1.7,11.8,12.6,0,1.1);
 // concession stand along the back wall: counter, popcorn machine, soda fountain, nachos, hot dogs, menu boards
 b.push([-13,0,8.4]);b.box(6.6,1.0,.8,K.tri('cc_slat',(c,W,H,r)=>{const n=10,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#8a7050');g.addColorStop(.4,'#c8a878');g.addColorStop(1,'#7a6040');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.3)},{tile:.5,r:.6}),[0,.5,0],null,.01);b.box(6.7,.05,.9,K.veneer(0xb8905a,{tile:.8}),[0,1.025,0],null,.01);b.box(6.4,.4,.04,K.glass(0xdfeff4,.3),[0,1.25,.3],null,0);
 for(let i=0;i<8;i++)b.rbox(.12,.18,.12,.01,K.mat([0xc41a1a,0xf2c418,0x2a6ad8][i%3],.4),[-2.8+i*.18,1.1,-.1]);b.pop();S(-16.35,-9.65,7.95,8.85,0,1.1);
 b.box(6.6,.9,.6,st,[-13,.45,6.15],null,.01);b.box(6.7,.05,.65,K.mat(0x2a2a2c,.3,.4),[-13,.925,6.15],null,0);
 b.push([-15.4,.95,6.15]);b.rbox(.9,1.1,.65,.02,K.mat(0xc41a1a,.4,.3),[0,.55,0]);b.add(new T.BoxGeometry(.8,.75,.55),K.glass(0xfff4d8,.3),{p:[0,.62,0]});for(let i=0;i<60;i++)b.add(K.sphGeo(.022,6,4),K.mat(0xfff4c8,.6),{p:[(rnd()-.5)*.7,.28+rnd()*.25,(rnd()-.5)*.45]});b.label(.8,.18,K.paint('cc_pop',256,58,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'HOT POPCORN',W/2,H/2,{size:36,col:'#ffd23a'})},{glow:.5}),[0,1.2,.33]);b.pop();
 b.push([-13.4,.95,6.15]);b.rbox(1.2,.75,.5,.02,K.mat(0xd8dadc,.35,.5),[0,.375,0]);b.label(1.16,.3,K.paint('cc_fount',512,128,(c,W,H)=>{const n=5;['BLITZ','POLAR','ZEST-O','ROCKET','ICED TEA'].forEach((s,i)=>{c.fillStyle=['#c8261c','#1e5aa8','#e89a0c','#1e8a3a','#c8902a'][i];c.fillRect(i*W/n+3,0,W/n-6,H);P.text(c,s,(i+.5)*W/n,H/2,{size:24,col:'#fff',max:W/n-10})})},{glow:.5}),[0,.55,.252]);for(let i=0;i<5;i++){b.cyl(.015,.012,.05,chrome,[-.48+i*.24,.22,.18],null,8)}b.pop();
 b.push([-11.4,.95,6.15]);b.rbox(.7,.35,.45,.02,K.mat(0x9a9c9e,.4,.6),[0,.175,0]);b.box(.6,.2,.02,K.glass(0xffd0a0,.35),[0,.2,.23],null,0);b.label(.6,.12,K.paint('cc_nacho',256,52,(c,W,H)=>{c.fillStyle='#e8a020';c.fillRect(0,0,W,H);P.text(c,'NACHOS',W/2,H/2,{size:34,col:'#5a1a08'})},{glow:.4}),[0,.45,.23]);b.pop();
 b.push([-10.3,.95,6.15]);b.rbox(.5,.12,.32,.01,st,[0,.06,0]);for(let i=0;i<6;i++){b.cyl(.016,.016,.42,K.mat(0xc8ccd0,.3,.9),[0,.13,-.12+i*.048],[0,0,PI/2],8);if(i%2)b.cyl(.014,.014,.16,K.mat(0xa8482a,.5),[(i-3)*.04,.15,-.12+i*.048],[0,0,PI/2],8)}b.pop();
 b.label(6.4,1.2,K.paint('cc_menu',1024,192,(c,W,H,r)=>{c.fillStyle='#1a1410';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,34);P.text(c,'CONCESSIONS  -  NO OUTSIDE BRAINS',W/2,17,{size:26,col:'#fff'});
  [['POPCORN S/M/L','3/4/5'],['SODA','2.50'],['NACHOS','4.00'],['HOT DOG','3.50'],['CANDY','2.00'],['ICEE','3.00'],['BRAIN FREEZE','4.50'],['CHILI FINGERS','5.00']].forEach(([n,p],i)=>{const x=24+Math.floor(i/3)*340,y=66+(i%3)*44;P.text(c,n,x,y,{size:28,col:'#f4e8c8',align:'left'});P.text(c,'$'+p,x+310,y,{size:28,col:'#ffd23a',align:'right',font:"'MFZ Mono'"})})},{glow:.6,r:.4}),[-13,3.4,ZP+.2]);
 // WIN THIS CAR display behind velvet ropes
 const NB=window.NUTBOLT;if(NB&&NB.sedan)NB.sedan(b,S,6.4,10.2,.6,0x1a2a6a,{});
 const ropeM=K.mat(0xc8202a,.5),postM=K.mat(0xc8ccd0,.25,.9);const post=(x,z)=>{b.cyl(.025,.025,.95,postM,[x,.48,z],null,10);b.sph(.04,postM,[x,.98,z]);b.cyl(.13,.15,.04,postM,[x,.02,z],null,16)};const rope=(a,c)=>{b.tube([[a[0],.9,a[1]],[(a[0]+c[0])/2,.62,(a[1]+c[1])/2],[c[0],.9,c[1]]],.018,ropeM,16,6)};
 const RP=[[3.4,7.4],[9.4,7.4],[9.4,13.0],[3.4,13.0]];RP.forEach((p,i)=>{post(p[0],p[1]);rope(p,RP[(i+1)%4])});for(const [a,c] of[[[3.4,7.4],[6.4,7.4]],[[6.4,13.0],[9.4,13.0]]]){post(...c)}
 b.push([6.4,0,13.6]);for(const s of[-1,1])b.cyl(.025,.025,2.4,postM,[s*1.4,1.2,0],null,8);b.label(2.8,.7,K.paint('cc_win',512,128,(c,W,H)=>{c.fillStyle='#ffd23a';c.fillRect(0,0,W,H);P.text(c,'WIN THIS CAR!',W/2,46,{size:56,col:RED});P.text(c,'ENTER AT THE BOX OFFICE',W/2,100,{size:24,col:'#1a1a1a'})},{r:.5}),[0,2.1,0]);b.pop();
 // benches, plants, a standee, bins
 for(const [x,z,a] of[[-18.2,10.5,PI/2],[-18.2,13.6,PI/2],[18.2,8.2,-PI/2]]){b.push([x,0,z],[0,a,0]);const wd=K.veneer(0x6a3a1e,{tile:.5});b.box(1.8,.06,.45,wd,[0,.45,0],null,.01);b.box(1.8,.45,.06,wd,[0,.75,-.2],null,.01);for(const s of[-1,1])b.box(.06,.75,.5,wd,[s*.87,.38,0],null,.01);b.pop();S(x-.3,x+.3,z-.95,z+.95,0,.9,true)}
 plant(b,-17.8,0,14.4,1.2);plant(b,-9.2,0,6.3,1.0);plant(b,9.4,0,6.3,1.0);plant(b,-2.0,0,14.4,1.0);plant(b,2.0,0,14.4,1.0);
 b.push([1.8,0,9.6],[0,-.4,0]);b.box(.04,.12,.5,K.mat(0x8a6a4a,.8),[0,.06,0],null,0);b.label(.8,1.8,K.paint('cc_standee',192,432,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='#4a6a3a';c.beginPath();c.arc(W/2,70,46,0,PI*2);c.fill();c.fillStyle='#2a1a3a';c.fillRect(W/2-50,110,100,190);c.fillRect(W/2-90,130,40,120);c.fillRect(W/2+50,120,50,40);c.fillStyle='#4a6a3a';c.fillRect(W/2+90,110,60,30);c.fillRect(W/2-46,300,36,120);c.fillRect(W/2+10,300,36,120);c.fillStyle='#ff3a3a';c.fillRect(W/2-24,62,10,8);c.fillRect(W/2+14,62,10,8);P.text(c,'BRAAAINS',W/2,H-20,{size:30,col:'#ffd23a',stroke:'#000',lw:4})},{alpha:true,r:.6}),[0,.9,.02]);b.pop();
 for(const x of[-6,6])b.cyl(.25,.22,.9,K.mat(0x2a2a2c,.4,.5),[x,.45,14.5],null,14);
 // restroom (ground, front right corner)
 const por=K.mat(0xf4f4f0,.2);b.box(2.2,.02,3.2,surf('lino'),[17.8,.036,13.3],null,0);b.push([18.4,0,14.4],[0,-PI/2,0]);b.lathe([[0,0],[.18,0],[.2,.1],[.22,.4],[0,.4]],por,[0,0,0],18);b.rbox(.4,.4,.2,.03,por,[0,.6,-.25]);b.pop();
 b.push([18.6,0,12.4],[0,-PI/2,0]);b.rbox(.5,.18,.4,.03,por,[0,.85,.1]);b.plane(.5,.7,K.mat(0xd8e2e6,.03,1),[0,1.55,-.15]);b.pop();for(const [ax,f,a0,a1,n] of[[1,Z1,SX1,X1,-1],[0,X1,SZ0,Z1,-1],[0,SX1,SZ0,Z1,1],[1,SZ0,SX1,X1,1]])lineWall(ax,f,a0,a1,n,.3,ax&&f===SZ0?Dr([17.8]):[],surf('plaster'),0,4.4);
 /* ---------- stairwell: concrete walls, railings, landing (the walkable stairs are core slabs) ---------- */
 const pls=surf('plaster'),rail=K.mat(0x9a9ea2,.35,.7);
 for(const [ax,f,a0,a1,n,ops,yb,hh] of[[0,SX0,SZ0,Z1,1,Dr([14.15]),0,HL],[0,SX0,SZ0,Z1,1,Dr([12.55]),HL,HU],[1,SZ0,SX0,SX1,1,[],0,H],[0,SX1,SZ0,Z1,-1,[],0,H],[1,Z1,SX0,SX1,-1,Wn([10.4,12]),0,HL],[1,Z1,SX0,SX1,-1,[],HL,HU]])lineWall(ax,f,a0,a1,n,.3,ops,pls,yb,hh,K.mat(0xc8c0a8,.6));
 b.box(SX1-SX0-.3,.02,Z1-SZ0-.3,surf('conc'),[(SX0+SX1)/2,.036,(SZ0+Z1)/2],null,0);
 const R1=[10.4,14.4],FZ1=[13.45,14.85],FZ2=[11.85,13.25];
 b.tube([[R1[0],.95,FZ1[0]-.02],[R1[1],2.3+.95,FZ1[0]-.02]],.025,rail,4,6);for(let i=0;i<=8;i++){const x=R1[0]+i*.5;b.cyl(.012,.012,.95,rail,[x,i*.2875+.48,FZ1[0]-.02],null,4)}
 b.tube([[16.1,2.3+.95,FZ2[0]-.02],[16.1,2.3+.95,FZ1[1]-.1]],.025,rail,4,6);b.tube([[R1[1],2.3+.95,FZ2[1]+.05],[R1[0],4.6+.95,FZ2[1]+.05]],.025,rail,4,6);for(let i=0;i<=8;i++){const x=R1[1]-i*.5;b.cyl(.012,.012,.95,rail,[x,2.3+i*.2875+.48,FZ2[1]+.05],null,4)}
 b.box(5.4,.012,.3,K.mat(0xc8c0a8,.6),[13.3,2.0,SZ0+.17],null,0);b.label(.6,.3,K.paint('cc_floor2',200,100,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'2  STAFF',W/2,H/2,{size:40,col:'#fff'})}),[SX0+.17,6.6,12.55],[0,PI/2,0]);
 /* ---------- auditorium ---------- */
 const AZ1=ZP,au=surf('aisle');
 b.box(37.7,.02,20.2,cp,[0,.035,(Z0+AZ1)/2+.1],null,0);for(const [x0,x1] of[[-18.85,-17.2],[-7.2,-5],[5,7.2],[17.2,18.85]])b.box(x1-x0,.025,16.6,au,[(x0+x1)/2,.04,-2.9],null,0);b.box(37.7,.025,1.6,au,[0,.04,4.5],null,0);b.box(37.7,.025,1.2,au,[0,.04,-11.0],null,0);
 lineWall(0,X0,Z0,AZ1,1,.3,Dr([-9]),rw,0,9.2,K.mat(0x3a0608,.6));lineWall(0,X1,Z0,AZ1,-1,.3,Dr([-9]),rw,0,9.2,K.mat(0x3a0608,.6));lineWall(1,Z0,X0,X1,1,.3,Dr([17.6]),rw,0,9.2,K.mat(0x3a0608,.6));lineWall(1,AZ1,X0,X1,-1,.3,Dr([-8.65,-7.35,7.35,8.65]),rw,0,9.2,K.mat(0x3a0608,.6));
 b.box(37.7,.06,20.2,surf('darkceil'),[0,9.25,(Z0+AZ1)/2+.1],null,0);for(let x=-15;x<16;x+=5)for(const z of[-10,-4,2]){b.cyl(.25,.25,.06,K.mat(0x2a2a2a,.4,.5),[x,9.18,z],null,14);b.cyl(.18,.18,.02,K.mat(0xffffff,.3,0,{emissive:0xffe8c0,emissiveIntensity:.6}),[x,9.14,z],null,14)}
 // gold pilasters on the side walls
 for(let z=-13.5;z<AZ1-.5;z+=2.0)for(const s of[-1,1]){const x=s*(X1-.25);b.cyl(.18,.18,8.6,gold,[x,4.6,z],null,12);b.box(.5,.3,.5,gold,[x,.15,z],null,.02);b.box(.5,.35,.5,gold,[x,9.0,z],null,.02);if(z>-10&&Math.round(z)%4===0){b.rbox(.3,.5,.4,.04,K.mat(0x1a1a1c,.5),[x-s*.25,6.5,z+1]);b.cyl(.1,.1,.02,K.mat(0x3a3a3a,.6),[x-s*.41,6.5,z+1],[0,0,PI/2],12)}}
 // stage, screen, masking, footlights, EXIT signs
 b.box(32.2,.04,3.4,surf('stage'),[0,1.02,-13.3],null,0);b.box(32.2,.98,.06,K.veneer(0x7a4a24,{tile:.5}),[0,.5,-11.6],null,0);for(let i=0;i<16;i++)b.box(.04,.9,.02,K.mat(0x5a3418,.6),[-15.5+i*2.07,.5,-11.56],null,0);
 b.rbox(17.0,7.6,.12,.03,K.mat(0x0a0a0c,.4),[0,5.7,-14.7]);b.box(16.2,6.9,.02,K.mat(0xd8dade,.6,0,{emissive:0x8a8c90,emissiveIntensity:.25}),[0,5.7,-14.62],null,0);
 for(let i=0;i<16;i++)b.cyl(.04,.04,.06,K.mat(0xffe8a0,.3,0,{emissive:0xffd060,emissiveIntensity:.8}),[-15+i*2,1.06,-11.75],null,8);
 for(const s of[-1,1]){b.label(.6,.22,K.paint('cc_exit',180,66,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'EXIT',W/2,H/2,{size:44,col:'#ff3a2a'})},{glow:1.0}),[s*(X1-.17),2.75,-9],[0,-s*PI/2,0]);}
 b.label(.6,.22,K.paint('cc_exit',180,66,()=>{},{glow:1.0}),[17.6,2.75,Z0+.17]);
 // seats: three banks, 12 rows
 for(let r=0;r<12;r++){const z=-9.6+r*1.1;seatRow(b,-17.0,-7.4,z);seatRow(b,-4.8,4.8,z);seatRow(b,7.4,17.0,z);for(const [x0,x1] of[[-17.0,-7.4],[-4.8,4.8],[7.4,17.0]])S(x0,x1,z-.3,z+.3,0,.9,true)}
 // projector beams from the booth ports to the screen
 for(const px of[0,6]){const a=[px,6.6,AZ1-.2],e=[0,5.7,-14.6];const L=Math.hypot(e[0]-a[0],e[1]-a[1],e[2]-a[2]),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(e[0]-a[0],e[1]-a[1],e[2]-a[2]).normalize()),eu=new T.Euler().setFromQuaternion(q);
  b.add(new T.CylinderGeometry(.15,4.0,L,20,1,true),K.mat(0xfff8e8,.9,0,{transparent:true,opacity:.045,depthWrite:false,emissive:0xfff0d0,emissiveIntensity:.5,side:T.DoubleSide}),{p:[(a[0]+e[0])/2,(a[1]+e[1])/2,(a[2]+e[2])/2],r:[eu.x,eu.y,eu.z]});
  b.box(.8,.5,.06,K.glass(0x6a8aa8,.5),[px,6.6,AZ1-.18],null,0);b.frame(.9,.6,.06,K.mat(0x1a1a1c,.5),[px,6.6,AZ1-.2],.05)}
 for(const s of[-1,1])b.box(.06,.06,.2,K.mat(0xc8a03a,.3,.8),[s*8,2.6,AZ1-.25],null,0);
 /* ---------- upstairs: floors, walls, ceilings ---------- */
 const UY=HL+.012;b.box(29,.02,4.6,surf('lino'),[-4.5,UY+.01,7.85],null,0);b.box(9,.02,1.3,surf('lino'),[14.5,UY+.01,10.85],null,0);b.box(11,.02,4.7,surf('carpet'),[-13.5,UY+.01,12.6],null,0);b.box(12,.02,4.7,surf('lino'),[-2,UY+.01,12.6],null,0);b.box(6,.02,4.7,cp,[7,UY+.01,12.6],null,0);
 const UH2=HU-.3;for(const [ax,f,a0,a1,n,ops,m] of[[1,Z1,X0,SX0,-1,FRONT_U,pls],[0,X0,ZP,Z1,1,[],pls],[0,X1,ZP,SZ0,-1,[],pls],[1,ZP,X0,X1,1,[],pls],[1,10.2,X0,SX0,-1,Dr([-6.5,7]),pls],[1,10.2,X0,SX0,1,Dr([-6.5,7]),pls],[0,-4,ZP,10.2,1,Dr([7.8]),pls],[0,-4,ZP,10.2,-1,Dr([7.8]),pls],[0,4,10.2,Z1,1,Dr([12.6]),pls],[0,4,10.2,Z1,-1,Dr([12.6]),pls],[0,-8,10.2,Z1,1,Dr([12.6]),pls],[0,-8,10.2,Z1,-1,Dr([12.6]),pls],[0,SX0,SZ0,Z1,-1,Dr([12.55]),pls],[1,SZ0,SX0,X1,-1,[],pls]])lineWall(ax,f,a0,a1,n,ax?(f===Z1||f===ZP?.3:.16):(f===X0||f===X1?.3:.16),ops,m,HL,UH2,K.mat(0x6a6a64,.6));
 b.box(37.7,.04,9.35,surf('ceil'),[0,HL+UH2+.02,(ZP+Z1)/2],null,0);for(let x=-16;x<18;x+=4)for(const z of[7.8,12.6]){if(x>SX0&&z>SZ0)continue;b.box(1.25,.06,.62,hous,[x,HL+UH2-.03,z],null,.01);b.box(1.15,.012,.52,lit,[x,HL+UH2-.065,z],null,0)}
 /* ---------- projection booth ---------- */
 const UYF=HL+.02;projector(b,0,UYF,6.8);projector(b,6,UYF,6.8);S(-.4,.4,6.4,7.6,UYF,UYF+2.6,true);S(5.6,6.4,6.4,7.6,UYF,UYF+2.6,true);
 b.push([12,UYF,8.0]);b.box(.12,2.2,.12,K.mat(0x3a4a5a,.4,.5),[0,1.1,0],null,0);for(let k=0;k<3;k++){b.cyl(.9,.9,.04,K.mat(0x8a8c8e,.35,.7),[0,.5+k*.7,0],null,40);b.cyl(.75,.75,.06,K.mat(0x2a1a10,.6),[0,.55+k*.7,0],null,36);b.cyl(.18,.18,.08,K.mat(0x3a3c40,.4,.6),[0,.55+k*.7,0],null,14)}b.rbox(.4,.6,.4,.03,K.mat(0x3a4a5a,.4,.5),[1.1,.3,0]);b.pop();S(11.1,12.9,7.1,8.9,UYF,UYF+2.2,true);
 b.push([16.4,UYF,9.6]);b.box(2.4,.05,.7,K.veneer(0x6a4a2a,{tile:.6}),[0,.9,0],null,.01);for(const s of[-1,1])b.box(.05,.88,.6,K.mat(0x3a3a3a,.4,.6),[s*1.1,.44,0],null,0);for(const s of[-.8,.8]){b.cyl(.3,.3,.03,K.mat(0x8a8c8e,.35,.7),[s,1.25,0],[0,0,PI/2],24);b.box(.06,.3,.06,K.mat(0x3a3a3a,.4,.6),[s,1.05,0],null,0)}
 for(let i=0;i<7;i++)b.cyl(.2,.2,.05,K.mat([0x5a5c5e,0x6a4a2a,0x3a5a3a][i%3],.4,.6),[-.3+(i%3)*.25,.95+Math.floor(i/3)*.05,.1],null,20);b.pop();S(15.15,17.65,9.2,10.0,UYF,UYF+1.0,true);
 b.push([17.9,UYF,7.0]);b.rbox(.7,2.0,.7,.02,K.mat(0x121214,.4,.4),[0,1.0,0]);for(let i=0;i<10;i++){b.box(.6,.12,.02,K.mat(0x2a2a2e,.4,.4),[0,.3+i*.16,-.36],null,0);for(let k=0;k<3;k++)b.box(.012,.012,.01,K.mat(0xffffff,.3,0,{emissive:[0x3aff6a,0xffa03a,0xff3a3a][(i+k)%3],emissiveIntensity:1.2}),[-.2+k*.04,.3+i*.16,-.375],null,0)}b.pop();
 for(let i=0;i<12;i++){const x=-2.6+(i%4)*.5,y=UYF+.06+Math.floor(i/4)*.08;b.cyl(.2,.2,.07,K.mat(0x7a7c7e,.35,.7),[x,y,9.6],null,20)}b.label(.9,.3,K.paint('cc_booth',300,100,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'PROJECTION',W/2,32,{size:30,col:'#fff'});P.text(c,'QUIET PLEASE',W/2,72,{size:24,col:'#fff'})}),[7,UYF+2.7,10.05],[0,PI,0]);
 /* ---------- prop vault: spare seats, coffin, mummy case, giant spider, marquee letters, sacks ---------- */
 for(let k=0;k<3;k++)for(let r=0;r<3;r++){b.push([-17.2+r*1.5,UYF+k*.55,6.4],[0,(rnd()-.5)*.3,0]);b.box(1.3,.1,.42,surf('seat'),[0,.15,0],null,0);b.box(1.3,.45,.08,surf('seat'),[0,.4,-.2],null,0);b.box(1.3,.06,.06,dark,[0,.05,0],null,0);b.pop()}S(-18,-13.4,6.0,6.9,UYF,UYF+1.7,true);
 b.push([-11,UYF,8.6],[0,.3,0]);b.add(K.extrudeGeo([[-.3,-1.0],[.3,-1.0],[.42,.4],[.28,1.0],[-.28,1.0],[-.42,.4]],.45,.02),K.veneer(0x3a2010,{tile:.5}),{p:[0,.23,0],r:[-PI/2,0,0]});b.add(K.extrudeGeo([[-.03,-.5],[.03,-.5],[.03,.5],[-.03,.5]],.02,0),gold,{p:[0,.46,-.1],r:[-PI/2,0,0]});b.add(K.extrudeGeo([[-.3,-.03],[.3,-.03],[.3,.03],[-.3,.03]],.02,0),gold,{p:[0,.46,-.3],r:[-PI/2,0,0]});b.pop();S(-11.6,-10.4,7.5,9.7,UYF,UYF+.5,true);
 b.push([-8.6,UYF,6.0]);b.add(K.rboxGeo(.8,2.0,.5,.25,3),K.paint('cc_mummy',256,512,(c,W,H,r)=>{c.fillStyle='#c8a050';c.fillRect(0,0,W,H);c.fillStyle='#1a4a8a';for(let i=0;i<10;i++)c.fillRect(0,120+i*36,W,14);c.fillStyle='#e8c070';c.beginPath();c.ellipse(W/2,80,70,70,0,0,PI*2);c.fill();c.fillStyle='#000';c.fillRect(W/2-36,70,24,8);c.fillRect(W/2+12,70,24,8);c.fillStyle='#1a4a8a';c.fillRect(W/2-90,10,30,120);c.fillRect(W/2+60,10,30,120);P.grime(c,W,H,r,.5)},{r:.5}),{p:[0,1.0,0],r:[-.15,0,0]});b.pop();S(-9.0,-8.2,5.7,6.3,UYF,UYF+2.0,true);
 b.push([-14.5,UYF,9.0]);const sp=K.mat(0x1a1210,.7);b.add(K.sphGeo(.45,16,10),sp,{p:[0,.5,0],s:[1,.7,1.3]});b.add(K.sphGeo(.3,14,8),sp,{p:[0,.45,.6]});for(const s of[-1,1])for(let k=0;k<4;k++){const a=(k-1.5)*.45;b.tube([[s*.3,.5,.4-k*.25],[s*(.9+Math.cos(a)*.2),1.0,.4-k*.3+Math.sin(a)*.3],[s*1.5,0,.4-k*.35+Math.sin(a)*.5]],.04,sp,10,5)}for(const s of[-1,1])b.sph(.05,K.mat(0xc41a1a,.2,0,{emissive:0xff2a1a,emissiveIntensity:.8}),[s*.1,.55,.85]);b.pop();S(-16,-13,8.0,10.0,UYF,UYF+1.0,true);
 b.push([-6.0,UYF,9.3]);b.rbox(1.0,.6,.7,.02,K.surf('wood',0x8a6a3a),[0,.3,0]);for(let i=0;i<14;i++){const ch='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(rnd()*26)];b.label(.26,.3,K.paint('cc_let'+ch,64,72,(c,W,H)=>{c.fillStyle='#f4f2ea';c.fillRect(0,0,W,H);P.text(c,ch,W/2,H/2+3,{size:60,col:'#1a1a1a'})}),[(rnd()-.5)*1.8,UYF+.02-UYF+.02,(rnd()-.5)*1.4+(i<6?0:-.9)],[-PI/2,0,rnd()*6])}b.pop();S(-6.5,-5.5,8.95,9.65,UYF,UYF+.6,true);
 for(let i=0;i<6;i++)b.add(K.rboxGeo(.5,.18,.8,.06,2),K.paint('cc_sack',128,192,(c,W,H)=>{c.fillStyle='#e8e2d0';c.fillRect(0,0,W,H);c.fillStyle='#d8a020';c.fillRect(0,H*.35,W,H*.25);P.text(c,'POPCORN',W/2,H*.47,{size:20,col:'#5a1a08'});P.text(c,'KERNELS 50LB',W/2,H*.75,{size:14,col:'#333'})},{r:.85}),{p:[-12.5+(i%3)*.55,UYF+.1+Math.floor(i/3)*.18,6.2],r:[0,(i%3-1)*.1,0]});
 /* ---------- manager's office: desk with CCTV, open safe, filing cabinets, barricade, tally marks ---------- */
 b.push([-15,UYF,13.6],[0,PI,0]);b.box(2.0,.05,.9,K.veneer(0x5a2a1a,{tile:.6}),[0,.76,0],null,.01);for(const s of[-1,1])b.box(.05,.74,.8,K.veneer(0x4a2010,{tile:.6}),[s*.95,.37,0],null,0);
 for(let i=0;i<4;i++){const x=-.75+i*.5;b.rbox(.46,.36,.3,.03,K.mat(0x2a2a2c,.4,.3),[x,1.0+(i%2)*.0,-.25]);b.label(.4,.3,K.paint('cc_cctv'+i,160,120,(c,W,H,r)=>{c.fillStyle='#0a0a0a';c.fillRect(0,0,W,H);c.fillStyle='rgba(120,160,120,.6)';for(let y=0;y<H;y+=3)c.fillRect(0,y,W,1);c.fillStyle='#8aaa8a';c.fillRect(20,H-30,W-40,10);c.fillRect(30+i*20,40,14,30);P.text(c,'CAM '+(i+1),30,12,{size:12,col:'#fff'});if(i===2){c.fillStyle='#fff';c.fillRect(W/2,30,6,40)}},{glow:.8}),[x,1.0,-.099])}
 for(let i=0;i<3;i++)b.box(.21,.003,.29,K.mat(0xf4f4f0,.6),[.4+i*.05,.79+i*.003,.2],[0,i*.3,0],0);b.cyl(.04,.035,.1,K.mat(0xf4f4f0,.4),[-.7,.83,.2],null,10);b.pop();S(-16.05,-13.95,13.15,14.05,UYF,UYF+1.2);
 b.push([-18.4,UYF,11.0],[0,PI/2,0]);b.rbox(.8,1.0,.7,.03,K.mat(0x3a3c40,.4,.6),[0,.5,0]);b.push([-.4,.5,.36],[0,-1.4,0]);b.rbox(.78,.92,.08,.02,K.mat(0x4a4c50,.4,.6),[.39,0,0]);b.cyl(.08,.08,.04,chrome,[.6,0,.06],[PI/2,0,0],14);b.pop();b.pop();S(-18.8,-18.0,10.6,11.4,UYF,UYF+1.0);
 for(let i=0;i<2;i++){b.push([-11.0+i*.6,UYF,14.5]);b.rbox(.5,1.3,.6,.02,K.mat(0x7a7e82,.4,.6),[0,.65,0]);for(let k=0;k<3;k++){b.box(.44,.36,.02,K.mat(0x8a8e92,.4,.6),[0,.25+k*.42,-.31],null,0);b.box(.14,.02,.03,chrome,[0,.38+k*.42,-.33],null,0)}b.pop()}S(-11.3,-9.8,14.2,14.8,UYF,UYF+1.3);
 b.push([-8.6,UYF,12.6]);for(let i=0;i<5;i++)b.box(.12,.8+i*.1,1.4,K.surf('wood',0x8a6a3a),[-.15-i*.1,.4+i*.05,0],[0,0,-.3+i*.12],0);b.box(.5,.5,.5,K.surf('cardboard',0xb08a58),[-.6,.25,-.5],null,.01);b.pop();
 b.label(1.6,1.0,K.paint('cc_tally',384,240,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.strokeStyle='rgba(30,20,20,.85)';c.lineWidth=4;for(let g=0;g<6;g++){const x0=20+g*58,y0=40;for(let k=0;k<4;k++){c.beginPath();c.moveTo(x0+k*9,y0);c.lineTo(x0+k*9+2,y0+60);c.stroke()}c.beginPath();c.moveTo(x0-4,y0+50);c.lineTo(x0+34,y0+8);c.stroke()}
  c.font="italic 34px 'MFZ Type'";c.fillStyle='rgba(150,10,10,.9)';c.fillText('DAY 32. STILL',20,160);c.fillText("SHOWING. DON'T STOP.",20,200)},{alpha:true}),[X0+.17,UYF+1.8,13.0],[0,PI/2,0]);
 b.label(.9,1.2,posterMat(6),[-13,UYF+1.9,Z1-.18],[0,PI,0]);
 /* ---------- staff room: lockers, sofa, table, kitchenette, notice board ---------- */
 sofa(b,-1.0,14.3,PI,2.4,0x3a4a6a);b.rbox(1.0,.04,.6,.01,K.veneer(0x8a5a36,{tile:.6}),[-1,UYF+.4,13.2]);
 b.push([2.5,UYF,11.0]);b.box(2.6,.9,.6,K.mat(0xe8e4dc,.5),[0,.45,0],null,.01);b.box(2.7,.04,.65,K.surf('concrete',0x8a8478),[0,.92,0],null,.01);b.rbox(.5,.3,.36,.02,K.mat(0x2a2a2c,.4,.3),[-.8,1.1,0]);b.rbox(.25,.35,.2,.02,K.mat(0x1a1a1c,.4,.2),[.2,1.12,0]);for(let i=0;i<4;i++)b.cyl(.04,.035,.1,K.mat([0xf4f4f0,0xc41a1a,0x1a4ea8,0xf2c418][i],.4),[.6+i*.12,.99,.1],null,10);b.pop();S(1.15,3.85,10.65,11.35,UYF,UYF+1.0);
 b.box(.04,.9,1.4,K.tri('cc_cork',(c,W,H,r)=>{c.fillStyle='#b8885a';c.fillRect(0,0,W,H);P.noise(c,W,H,r,8000,.4,'#6a4a2a',2)},{tile:.5,r:.9}),[3.79,UYF+1.7,13.2],null,0);
 b.label(.4,.5,K.paint('cc_eotm',160,200,(c,W,H)=>{c.fillStyle='#f4f0e4';c.fillRect(0,0,W,H);P.text(c,'EMPLOYEE',W/2,18,{size:18,col:'#1a1a1a'});P.text(c,'OF THE MONTH',W/2,38,{size:16,col:'#1a1a1a'});c.fillStyle='#d8b890';c.beginPath();c.arc(W/2,100,34,0,PI*2);c.fill();c.strokeStyle='#c41a1a';c.lineWidth=8;c.beginPath();c.moveTo(40,60);c.lineTo(120,150);c.moveTo(120,60);c.lineTo(40,150);c.stroke();P.text(c,'(BITTEN)',W/2,180,{size:18,col:'#c41a1a'})}),[3.76,UYF+1.8,12.8],[0,-PI/2,0]);
 /* ---------- hall: water cooler, extinguisher, posters ---------- */
 b.push([9.5,UYF,14.4]);b.cyl(.16,.16,1.0,K.mat(0xf4f4f0,.4),[0,.5,0],null,14);b.cyl(.15,.15,.45,K.glass(0x5ab0e8,.5),[0,1.2,0],null,14);b.pop();
 b.cyl(.08,.08,.45,K.mat(0xc41a1a,.4,.3),[4.3,UYF+1.0,14.5],null,12);b.label(.9,1.2,posterMat(7),[7,UYF+1.9,Z1-.18],[0,PI,0]);
 // blood trail from the booth to the office (the projectionist kept the show running)
 for(let i=0;i<10;i++)b.label(.4+rnd()*.3,.3+rnd()*.3,K.paint('cc_blood',96,96,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(110,6,6,.85)';c.beginPath();for(let a=0;a<PI*2;a+=.5)c.lineTo(W/2+Math.cos(a)*(26+r()*14),H/2+Math.sin(a)*(26+r()*14));c.fill()},{alpha:true}),[6-i*1.6+(rnd()-.5)*.4,UYF+.03,10.6+i*.2],[-PI/2,0,rnd()*6]);
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bClimax(x,z,t){
 const B=mk(x,z,40,36,H,0xc8b498,0x4a1478,0x5a5c60);B.dx=0;const PT={th:.16,c:0xd8d6d0};
 // ground storey (lobby front + partition), auditorium full height, stairwell, restroom
 WL(B,1,Z1,X0,X1,[...wins([-12,-10.4,-2.4,2.4,10.4,12]),{k:'d',c:-.65},{k:'d',c:.65}],HL);WL(B,0,X0,ZP,Z1,[],HL);WL(B,0,X1,ZP,Z1,[],HL);
 WL(B,1,ZP,X0,X1,[{k:'d',c:-8.65},{k:'d',c:-7.35},{k:'d',c:7.35},{k:'d',c:8.65}],HL);
 WL(B,0,X0,Z0,ZP,[{k:'d',c:-9}],H);WL(B,0,X1,Z0,ZP,[{k:'d',c:-9}],H);WL(B,1,Z0,X0,X1,[{k:'d',c:17.6,s:-1}],H);
 WL(B,0,SX0,SZ0,Z1,[{k:'d',c:14.15}],HL,PT);WL(B,1,SZ0,SX0,X1,[{k:'d',c:17.8}],HL,PT);WL(B,0,SX1,SZ0,Z1,[],HL,PT);
 // upper storey
 B.y=HL;const occK=B.occ;B.occ=[];
 WL(B,1,Z1,X0,X1,wins([-15,-12,-5.5,1.5,7.5]),HU);WL(B,0,X0,ZP,Z1,[],HU);WL(B,0,X1,ZP,Z1,[],HU);WL(B,1,ZP,X0,X1,[],HU);
 WL(B,0,SX0,SZ0,Z1,[{k:'d',c:12.55}],HU,PT);WL(B,1,SZ0,SX0,X1,[],HU,PT);WL(B,0,SX1,SZ0,Z1,[],HU,PT);
 WL(B,1,10.2,X0,SX0,[{k:'d',c:-6.5},{k:'d',c:7}],HU,PT);WL(B,0,-4,ZP,10.2,[{k:'d',c:7.8}],HU,PT);WL(B,0,4,10.2,Z1,[{k:'d',c:12.6}],HU,PT);WL(B,0,-8,10.2,Z1,[{k:'d',c:12.6}],HU,PT);
 B.y=0;B.occ=occK;
 // walkable upper floor (with the stair hole), the stage and the two flights + landing
 slab(B,X0+.15,SX0,ZP+.15,Z1-.15,HL-.2,HL,0x8a8478,true);slab(B,SX0,X1-.15,ZP+.15,SZ0,HL-.2,HL,0x8a8478,true);slab(B,SX1,X1-.15,SZ0,Z1-.15,HL-.2,HL,0x8a8478,true);
 slab(B,X0+.15,X1-.15,Z0+.15,ZP-.15,9.4,9.6,0x2a1012);slab(B,-16.1,16.1,Z0+.15,-11.6,0,1.0,0x7a4a24,true);
 for(const s of[-1,1])stairs(B,s*6.6,-10.4,-1,3,1.0/3,.4,1.2,0x8a8a84);
 for(let i=0;i<8;i++){const a=10.4+i*.5;slab(B,a,a+.5,13.45,14.85,0,(i+1)*.2875,0x8a8a82,true)}
 slab(B,14.4,16.4,11.85,14.85,0,2.3,0x8a8a82,true);
 for(let i=0;i<8;i++){const a=14.4-i*.5;slab(B,a-.5,a,11.85,13.25,0,2.3+(i+1)*.2875,0x8a8a82,true)}
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);try{if(window.MFZFIRE)MFZFIRE.addLocal(B,-12,.9,-16.6,.7)}catch(e){}   /* v076: burning barrel */
 const ry=a=>B.cs>0?a:a+PI,SP=(lx,lz,name,table,a,y0)=>{try{if(window.spawnPropContainer)spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,ry(a),y0||0);else cont(B,table||'cinema',lx,lz)}catch(e){}};
 // lootable: concession fridge + freezer, vending, staff lockers and fridge, office desk, boxes in the vault, the alley dumpster
 SP(-17.2,6.2,'drinks_cooler','cinema',0);SP(-9.2,8.6,'freezer_upright','cinema',PI/2);SP(-.3,6.0,'vending_snack','cinema',0);
 SP(-7.5,10.75,'fire_locker','cinema',PI/2,HL);SP(-7.5,11.45,'fire_locker','cinema',PI/2,HL);SP(3.5,14.5,'fridge_modern','cinema',PI,HL);SP(8.2,10.7,'vending_blitz','cinema',0,HL);
 SP(-17.8,8.8,'cardboard_box_large','cinema',PI/2,HL);SP(-16.6,8.9,'cardboard_box_medium','cinema',0,HL);SP(-4.6,9.6,'cardboard_box_medium','cinema',0,HL);SP(14.5,-16.7,'dumpster_blue','house',0);
 rc(B,'cinema',[-16,-10,9.5,14],1);
 buildings.push({x:WX(B,0),z:WZ(B,0),w:38,d:30,t:t.id});
 for(const [px,pz] of[[-6,-2],[8,-6],[-12,1],[0,9],[12,8],[-14,12],[4,-9]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));
 LASTB=B;return B}

if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='the_aztec'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
const e=NEWCAT.find(d=>d.id==='the_aztec');
if(e){e.name='Climax Cinema';e.build=bClimax;e.note='full-block two-storey cinema: lobby, concessions, auditorium, projection booth, offices, prop vault'}
if(typeof NOYARD!=='undefined')NOYARD.add('the_aztec');window.bClimax=bClimax;window.CLIMAX={build};
console.log('[cinema] Climax Cinema ready');
})();
