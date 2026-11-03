/* ==========================================================================================================
   MINI FORT ZOMBIE - MORNING WOOD HARDWARE (v072): a full-block hardware & lumber store (40 x 36 m plot, front = +Z), our own design.
   Exterior: a 38 x 19 m red-brick store with a teal coping, a full-length corrugated metal canopy (ribbed fascia, soffit, teal steel
   columns) over the shopfront walk, the MORNING WOOD sign (sunrise over a log) with a giant 3D claw hammer, long lit windows with
   20% OFF posters, glass double doors, benches, bins, a mailbox, a cart corral with carts, a parking meter and street lights; behind,
   a loading yard with two roller-shutter bays (one up), a back door, a propane tank, a dumpster, a stripped wreck and stall lines.
   Interior: red / cream checkerboard, grey walls with a mustard band, drop ceiling with long fluorescent boxes and ducting; four
   checkout lanes (wood-panelled, belts, registers, rope stanchions); gondola aisles with pegboard end caps of tools; an appliance
   wall (washers, stoves, boxed appliances, a TV on a stand); a lumber yard rack of planks and plywood; paint (can pyramid, tint
   machine, swatch wall); garden (rope coils, shovels, rakes, wheelbarrow, soil sacks); camping & sports (tents, kayaks, sleeping
   bags, coolers, balls, fishing rods); tyre stacks; SALE signs; a stock room with racking, the docks and tyres; an office; a break
   area with a table and tipped stools; restrooms.
   Structure from core WL (doors / windows work); detail is our own geometry and painted artwork, outside the static merge.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[hardware] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const X0=-19,X1=19,Z0=-6,Z1=13,H=5.0,CEIL=4.0;
const YEL='#f2c418',DK='#1a1a1a',RED='#c41a1a',TEAL=0x1e5a5a;

/* ===================== artwork ===================== */
function drawLogo(c,W,H){c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);c.fillStyle=YEL;c.fillRect(6,6,W-12,H-12);c.fillStyle='#1a1a1a';c.fillRect(14,14,W-28,H-28);c.fillStyle=YEL;c.fillRect(18,18,W-36,H-36);
 // sunrise over a log, left
 const cx=H*.62,cy=H*.66;c.fillStyle='#e8701a';c.beginPath();c.arc(cx,cy,H*.3,PI,0);c.fill();c.strokeStyle='#e8701a';c.lineWidth=H*.04;for(let i=0;i<7;i++){const a=PI+i*PI/6;c.beginPath();c.moveTo(cx+Math.cos(a)*H*.36,cy+Math.sin(a)*H*.36);c.lineTo(cx+Math.cos(a)*H*.46,cy+Math.sin(a)*H*.46);c.stroke()}
 c.fillStyle='#7a4a24';c.fillRect(cx-H*.42,cy-H*.04,H*.84,H*.16);c.fillStyle='#c89a5a';c.beginPath();c.ellipse(cx+H*.42,cy+H*.04,H*.06,H*.08,0,0,PI*2);c.fill();c.strokeStyle='#7a4a24';c.lineWidth=2;c.beginPath();c.arc(cx+H*.42,cy+H*.04,H*.03,0,PI*2);c.stroke();
 c.save();c.textBaseline='middle';c.font=`bold ${H*.46}px 'MFZ Head'`;c.fillStyle='#1a1a1a';const t='MORNING WOOD';const tw=c.measureText(t).width,sc=Math.min(1,(W-H*1.3-30)/tw);c.translate(H*1.18,H*.42);c.scale(sc,1);c.fillText(t,0,0);c.restore();
 c.font=`bold ${H*.16}px 'MFZ Head'`;c.fillStyle='#7a4a24';c.textBaseline='middle';c.fillText('HARDWARE  -  LUMBER  -  GARDEN',H*1.2,H*.8)}
const offTex=()=>K.paint('mw_off',256,256,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle='#111';c.fillRect(8,8,W-16,H-16);P.text(c,'20%',W/2,90,{size:96,col:'#fff'});P.text(c,'OFF',W/2,180,{size:80,col:RED})},{r:.5,glow:.2});
const saleTex=()=>K.paint('mw_sale',200,240,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(10,10,W-20,H-20);c.fillStyle=RED;c.fillRect(16,16,W-32,H-32);P.text(c,'SALE',W/2,90,{size:72,col:'#fff'});P.text(c,'EVERYTHING',W/2,160,{size:26,col:'#fff'});P.text(c,'MUST GO',W/2,196,{size:26,col:'#fff'})},{r:.5});
const boxTex=(key,brand,item,draw)=>K.paint(key,256,256,(c,W,H,r)=>{c.fillStyle='#c8a46a';c.fillRect(0,0,W,H);P.noise(c,W,H,r,3000,.15,'#7a5a2a',1.5);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(0,H*.45,W,8);
 P.text(c,brand,W/2,30,{size:34,col:'#c83a1a'});P.text(c,item,W/2,64,{size:22,col:'#1a1a1a'});c.save();c.translate(W/2,H*.62);draw(c);c.restore();P.barcode(c,W-90,H-44,80,36,r);c.strokeStyle='#1a1a1a';c.lineWidth=3;for(let i=0;i<2;i++){c.beginPath();c.moveTo(20+i*26,H-20);c.lineTo(20+i*26,H-50);c.lineTo(12+i*26,H-40);c.moveTo(20+i*26,H-50);c.lineTo(28+i*26,H-40);c.stroke()}},{r:.85});
const BOXES=[['ZAPMASTER','MICROWAVE OVEN',c=>{c.fillStyle='#e8e8e4';c.fillRect(-60,-34,120,68);c.fillStyle='#1a1a1a';c.fillRect(-52,-26,76,52);c.fillStyle='#5a5a5a';c.fillRect(32,-26,20,52)}],
 ['AQUAWHIRL','TOP LOAD WASHER',c=>{c.fillStyle='#f4f4f0';c.fillRect(-40,-50,80,100);c.fillStyle='#8a8c8e';c.fillRect(-40,-50,80,16);c.strokeStyle='#5a5a5a';c.lineWidth=4;c.beginPath();c.arc(0,10,26,0,PI*2);c.stroke()}],
 ['FROSTLINE','REFRIGERATOR',c=>{c.fillStyle='#f4f4f0';c.fillRect(-30,-56,60,112);c.strokeStyle='#5a5a5a';c.lineWidth=3;c.beginPath();c.moveTo(-30,-14);c.lineTo(30,-14);c.stroke();c.fillRect(18,-46,4,24)}],
 ['HEATWAVE','ELECTRIC RANGE',c=>{c.fillStyle='#f4f4f0';c.fillRect(-46,-50,92,100);c.fillStyle='#1a1a1a';c.fillRect(-36,-10,72,46);for(const x of[-22,22])for(const y of[-36,-24]){c.beginPath();c.arc(x,y,6,0,PI*2);c.fill()}}]];

const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 brick:()=>K.tri('mw_brick',(c,W,H,r)=>{c.fillStyle='#6a4a40';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2;c.fillStyle=`hsl(${6+r()*10},${36+r()*14}%,${34+r()*12}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4)}P.noise(c,W,H,r,6000,.18,'#2a1a14',1.6);P.grime(c,W,H,r,.5)},{tile:.38,r:.9}),
 corr:()=>K.tri('mw_corr',(c,W,H,r)=>{for(let x=0;x<W;x+=16){const g=c.createLinearGradient(x,0,x+16,0);g.addColorStop(0,'#5a5e62');g.addColorStop(.5,'#b8bcc0');g.addColorStop(1,'#5a5e62');c.fillStyle=g;c.fillRect(x,0,16,H)}P.grime(c,W,H,r,.5);P.rust(c,W,H,r,6)},{tile:.5,r:.5,m:.6}),
 ribs:()=>K.tri('mw_ribs',(c,W,H,r)=>{for(let y=0;y<H;y+=24){const g=c.createLinearGradient(0,y,0,y+24);g.addColorStop(0,'#3a3e42');g.addColorStop(.4,'#a8acb0');g.addColorStop(1,'#3a3e42');c.fillStyle=g;c.fillRect(0,y,W,24)}P.grime(c,W,H,r,.4)},{tile:.6,r:.5,m:.6}),
 floor:()=>K.tri('mw_floor',(c,W,H,r)=>{const n=2,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const g=(i+j)%2;c.fillStyle=g?'#c86a6a':'#ecdcc4';c.fillRect(i*s,j*s,s,s);for(let k=0;k<24;k++){c.strokeStyle=g?'rgba(140,40,40,.25)':'rgba(170,140,100,.2)';c.lineWidth=.6+r()*1.8;c.beginPath();let x=i*s+r()*s,y=j*s+r()*s;c.moveTo(x,y);for(let q=0;q<6;q++){x+=(r()-.4)*40;y+=(r()-.5)*36;c.lineTo(Math.min(i*s+s,Math.max(i*s,x)),Math.min(j*s+s,Math.max(j*s,y)))}c.stroke()}
   c.fillStyle='rgba(60,40,30,.35)';c.fillRect(i*s,j*s,s,2);c.fillRect(i*s,j*s,2,s)}P.grime(c,W,H,r,.35)},{tile:1.2,r:.3}),
 conc:()=>K.tri('mw_conc',(c,W,H,r)=>{c.fillStyle='#6a6866';c.fillRect(0,0,W,H);P.noise(c,W,H,r,20000,.3,'#3a3836',1.8);P.grime(c,W,H,r,.6)},{tile:.3,r:.85}),
 wall:()=>K.tri('mw_wall',(c,W,H,r)=>{c.fillStyle='#c8c4c0';c.fillRect(0,0,W,H);P.noise(c,W,H,r,8000,.12,'#8a8480',2);P.noise(c,W,H,r,4000,.1,'#f0ece8',2)},{tile:.5,r:.85}),
 ceil:()=>K.tri('mw_ceil',(c,W,H,r)=>{c.fillStyle='#d4d4d0';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.16,'#5a5c5e',1.3);c.fillStyle='#5a5c5e';c.fillRect(0,0,W,5);c.fillRect(0,0,5,H);c.fillRect(0,H/2,W,3);c.fillRect(W/2,0,3,H)},{tile:.84,r:.9}),
 counter:()=>K.tri('mw_cwood',(c,W,H,r)=>{const n=10,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#5a2a1e');g.addColorStop(.4,'#8a4a34');g.addColorStop(1,'#4a2016');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.3)},{tile:.45,r:.6}),
 slat:()=>K.tri('mw_slat',(c,W,H,r)=>{const n=10,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#8a7050');g.addColorStop(.4,'#c8a878');g.addColorStop(1,'#7a6040');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.3)},{tile:.5,r:.6}),
 plank:()=>K.tri('mw_plank',(c,W,H,r)=>{c.fillStyle='#d8b07a';c.fillRect(0,0,W,H);for(let i=0;i<60;i++){c.strokeStyle=`rgba(${140+r()*40},${90+r()*30},40,.4)`;c.lineWidth=1+r()*2;c.beginPath();const y=r()*H;c.moveTo(0,y);c.bezierCurveTo(W*.3,y+(r()-.5)*10,W*.6,y+(r()-.5)*10,W,y+(r()-.5)*6);c.stroke()}for(let i=0;i<3;i++){c.fillStyle='rgba(120,70,30,.5)';c.beginPath();c.ellipse(r()*W,r()*H,8,4,0,0,PI*2);c.fill()}},{tile:.6,r:.8}),
 ply:()=>K.tri('mw_ply',(c,W,H,r)=>{c.fillStyle='#d8bc8a';c.fillRect(0,0,W,H);for(let i=0;i<30;i++){c.fillStyle=`rgba(${150+r()*40},${110+r()*30},60,.25)`;c.beginPath();c.ellipse(r()*W,r()*H,30+r()*60,8+r()*20,r()*.4,0,PI*2);c.fill()}},{tile:.4,r:.8}),
 peg:()=>K.tri('mw_peg',(c,W,H,r)=>{c.fillStyle='#d8d8d4';c.fillRect(0,0,W,H);c.fillStyle='#7a7a76';for(let y=8;y<H;y+=16)for(let x=8;x<W;x+=16){c.beginPath();c.arc(x,y,2.2,0,PI*2);c.fill()}},{tile:.4,r:.7}),
 asphalt:()=>K.surf('asphalt',0x3a3c40),concrete:()=>K.surf('concrete',0xb0aea6),dirt:()=>K.surf('dirt',0x5a4632)
})[k]());

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
function build(){if(CACHE)return CACHE;const b=K.builder('morningwood'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),rnd=b.rnd,conc=surf('concrete'),dark=K.mat(0x1a1a1c,.5),teal=K.mat(TEAL,.4,.5),wht=K.mat(0xf2f2ee,.35,.2);
 const Wn=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 const WINS=[-17.4,-15.8,-14.2,-12.6,-10.4,-8.8,-3.6,-2.0,2.0,3.6,5.2,6.8,10.4,12.0,13.6,15.2];
 const FRONT=[...Wn(WINS),{k:'d',c:-6.85},{k:'d',c:-5.55}],BACK=[{k:'g',c:10.2},{k:'g',c:11.8},{k:'d',c:18.2,s:-1}];
 /* ---------- ground ---------- */
 b.box(40,.06,2.1,conc,[0,.03,16.95],null,0);for(let x=-19.5;x<20;x+=1.5)b.box(.02,.062,2.08,K.mat(0x8a8880,.8),[x,.031,16.95],null,0);b.box(40,.16,.2,conc,[0,.08,15.9],null,0);
 b.box(40,.05,2.9,K.surf('concrete',0x9a9890),[0,.025,14.45],null,0);for(const s of[-1,1])b.box(1,.03,19,conc,[s*19.5,.015,3.5],null,0);
 b.box(40,.025,11.95,surf('asphalt'),[0,.012,-12.0],null,0);b.box(40,.03,.4,surf('dirt'),[0,.015,-17.8],null,0);for(let i=0;i<8;i++)b.box(.1,.012,4.6,K.mat(0xeeeee4,.7),[-17+i*2.8,.03,-11.6],null,0);
 for(const [x,z,s] of[[-8,-10,2.4],[2,-14,2],[12,-12,1.6],[-14,-15,1.8]])b.label(s*1.5,s,K.paint('mw_patch',192,128,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(110,96,70,.55)';c.beginPath();for(let a=0;a<PI*2;a+=.4)c.lineTo(W/2+Math.cos(a)*(60+r()*30),H/2+Math.sin(a)*(36+r()*20));c.fill()},{alpha:true}),[x,.028,z],[-PI/2,0,rnd()*3]);
 /* ---------- exterior skin: brick + teal coping parapet ---------- */
 const brk=surf('brick');
 const skin=(ax,f,a0,a1,n,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*.165,u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,.03,brk,[u,y,o],null,0);else b.box(.03,y1-y0,u1-u0,brk,[o,y,u],null,0)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:p.k==='g'?.8:.65;pc(a,p.c-hw,0,H);if(p.k==='w'){pc(p.c-hw,p.c+hw,0,.9);pc(p.c-hw,p.c+hw,2.75,H)}else pc(p.c-hw,p.c+hw,p.k==='g'?2.5:2.4,H);a=p.c+hw}pc(a,a1,0,H);
  const L=a1-a0+.5,u=(a0+a1)/2;if(ax){b.box(L,.7,.36,brk,[u,H+.35,f],null,0);b.box(L+.1,.18,.56,teal,[u,H+.79,f],null,.02);b.box(L+.1,.22,.08,teal,[u,H+.62,f+n*.27],null,.01)}else{b.box(.36,.7,L,brk,[f,H+.35,u],null,0);b.box(.56,.18,L+.1,teal,[f,H+.79,u],null,.02);b.box(.08,.22,L+.1,teal,[f+n*.27,H+.62,u],null,.01)}};
 skin(1,Z1,X0,X1,1,FRONT);skin(1,Z0,X0,X1,-1,BACK);skin(0,X0,Z0,Z1,-1,[]);skin(0,X1,Z0,Z1,1,[]);
 for(const c of WINS)b.frame(1.56,1.92,.07,K.mat(0x2a5a5a,.4,.5),[c,1.825,Z1+.2],.035);for(const [a0,a1] of[[-18.2,-7.9],[-4.4,7.6],[9.6,16]])b.box(a1-a0,.1,.25,K.surf('concrete',0x9a9890),[(a0+a1)/2,.86,Z1+.28],null,.01);
 b.box(38.6,.12,19.6,K.surf('concrete',0x5a5a58),[0,H+.02,3.5],null,0);b.box(38.4,.02,19.4,K.mat(0x34363a,.9),[0,H+.09,3.5],null,0);for(const [x,z] of[[-8,2],[4,-2],[12,6]]){b.rbox(2.0,1.0,1.4,.03,K.mat(0xb0b4b8,.4,.7),[x,H+.6,z]);b.vents(6,1.8,.7,K.mat(0x6a6c6e,.5,.6),[x,H+.6,z+.71]);b.cyl(.55,.55,.1,K.mat(0x2a2a2a,.5,.4),[x,H+1.15,z],null,20)}
 b.rbox(2.6,.8,1.8,.03,K.mat(0x8a8e92,.4,.6),[0,H+.5,10]);
 /* ---------- canopy: corrugated slope, ribbed fascia, soffit, teal columns ---------- */
 const CZ=16.0,CY0=4.5,CY1=3.6,cl=Math.hypot(CZ-Z1,CY0-CY1),ca=Math.atan2(CY0-CY1,CZ-Z1);
 b.box(38.8,.06,cl+.2,surf('corr'),[0,(CY0+CY1)/2+.05,(Z1+CZ)/2],[ca,0,0],0);b.box(38.8,.02,cl+.1,K.mat(0x9a9c9e,.6,.3),[0,(CY0+CY1)/2-.04,(Z1+CZ)/2],[ca,0,0],0);
 b.box(39.0,.75,.1,surf('ribs'),[0,CY1-.15,CZ+.05],null,0);for(const s of[-1,1])b.add(K.extrudeGeo([[Z1,CY0+.1],[CZ+.1,CY1+.22],[CZ+.1,CY1-.52],[Z1,CY0-.6]],.1,0),surf('ribs'),{p:[s*19.45,0,0],r:[0,-PI/2,0]});
 for(const x of[-18.6,-11,-3.6,3.6,11,18.6]){b.box(.24,CY1-.2,.24,teal,[x,(CY1-.2)/2,CZ-.2],null,.02);b.box(.4,.1,.4,teal,[x,.05,CZ-.2],null,.01);S(x-.13,x+.13,CZ-.33,CZ-.07,0,3.4,true)}
 for(let x=-16;x<18;x+=4)b.box(.6,.04,.25,K.mat(0xffffff,.3,0,{emissive:0xfff2d0,emissiveIntensity:.6}),[x,CY1+.35,14.6],[ca,0,0],0);
 // sign on the canopy + the giant hammer
 b.rbox(7.4,1.5,.2,.03,K.mat(0x1a1a1a,.4),[-6.2,4.55,CZ+.25]);b.label(7.2,1.36,K.paint('mw_logo',1024,192,(c,W,H)=>drawLogo(c,W,H),{glow:.35,r:.4}),[-6.2,4.55,CZ+.36]);for(const x of[-9,-3.4])b.box(.08,.9,.08,K.mat(0x3a3a3a,.4,.6),[x,4.0,CZ+.15],null,0);
 b.push([-10.3,4.2,CZ+.3],[0,0,.35]);b.box(.22,2.6,.18,K.veneer(0xa8783a,{tile:.4}),[0,1.3,0],null,.03);b.rbox(.26,.4,.22,.03,K.mat(0x1a1a1a,.5),[0,.2,0]);
 b.rbox(1.0,.4,.36,.05,K.mat(0x4a4c50,.3,.85),[.15,2.7,0]);b.add(K.extrudeGeo([[0,-.15],[.9,-.05],[1.0,.25],[.95,.3],[.75,.05],[0,.15]],.32,.02),K.mat(0x4a4c50,.3,.85),{p:[-1.25,2.65,0],r:[0,0,0]});b.cyl(.2,.2,.38,K.mat(0x4a4c50,.3,.85),[.7,2.7,0],[PI/2,0,0],12);b.pop();
 /* ---------- shopfront walk: posters in the windows, benches, bins, mailbox, carts, meter ---------- */
 for(const x of[-14.2,3.6,12.0])b.label(.9,.9,offTex(),[x,2.0,Z1-.08],[0,PI,0]);for(const x of[-14.2,3.6,12.0])b.label(.9,.9,offTex(),[x,2.0,Z1+.16]);
 const bench=(x,z)=>{b.push([x,0,z]);const wd=K.mat(0x2a1a14,.7);for(let i=0;i<3;i++)b.box(1.8,.05,.12,wd,[0,.46,-.15+i*.15],null,.01);for(const s of[-1,1]){b.box(.08,.45,.5,K.mat(0x1a1a1a,.5,.5),[s*.8,.23,0],null,.01)}b.pop();S(x-.95,x+.95,z-.3,z+.3,0,.5,true)};
 bench(-15.4,14.3);bench(-11.0,14.3);bench(9.4,14.3);bench(16.6,14.3);
 const bin=(x,z)=>{b.cyl(.26,.24,.85,K.tri('mw_bin',(c,W,H)=>{c.fillStyle='#8a8e92';c.fillRect(0,0,W,H);for(let i=0;i<W;i+=10){c.fillStyle='rgba(0,0,0,.4)';c.fillRect(i,0,4,H)}},{tile:.25,r:.4,m:.6}),[x,.43,z],null,18,true);b.cyl(.26,.26,.02,K.mat(0x3a3a3a,.5,.6),[x,.02,z],null,18);S(x-.27,x+.27,z-.27,z+.27,0,.9,true)};bin(-4.0,14.0);bin(18.0,14.0);
 b.push([-18.2,0,14.4]);const mb=K.mat(0x1a3a8a,.45,.3);b.rbox(.55,.85,.55,.06,mb,[0,.85,0]);b.add(new T.CylinderGeometry(.275,.275,.55,18,1,false,0,PI),mb,{p:[0,1.27,0],r:[0,PI/2,PI/2]});for(const [x,z] of[[-.24,-.24],[.24,-.24],[-.24,.24],[.24,.24]])b.box(.05,.45,.05,mb,[x,.22,z],null,.01);b.label(.4,.3,K.paint('mw_mail',160,120,(c,W,H)=>{c.fillStyle='#1a3a8a';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(20,20,W-40,40);c.fillStyle=RED;c.fillRect(20,60,W-40,8);P.text(c,'MAIL',W/2,92,{size:30,col:'#fff'})}),[0,.95,.281]);b.pop();S(-18.5,-17.9,14.1,14.7,0,1.5,true);
 const wire=K.mat(0xc8ccd0,.3,.8),hdl=K.mat(0xc41a1a,.5);
 const cart=(x,z,ry,tip)=>{b.push([x,tip?.45:0,z],[tip?PI/2:0,ry,0]);b.push([0,.55,0]);const L=.9,W=.55,Hh=.45;for(let i=0;i<=6;i++){const t=-L/2+i*L/6;for(const s of[-1,1])b.box(.008,Hh,.008,wire,[s*W/2,Hh/2,t],null,0)}for(let i=0;i<=4;i++){const t=-W/2+i*W/4;b.box(.008,Hh,.008,wire,[t,Hh/2,L/2],null,0);b.box(.008,Hh,.008,wire,[t,Hh/2,-L/2],null,0)}
  for(let k=0;k<=2;k++){const y=k*Hh/2;for(const s of[-1,1])b.box(.008,.008,L,wire,[s*W/2,y,0],null,0);b.box(W,.008,.008,wire,[0,y,L/2],null,0);b.box(W,.008,.008,wire,[0,y,-L/2],null,0)}b.pop();b.box(.6,.035,.035,hdl,[0,1.05,-.58],null,0);for(const s of[-1,1])b.cyl(.012,.012,.55,wire,[s*.28,.78,-.52],[-.25,0,0],6);
  for(const [wx,wz] of[[-.22,.32],[.22,.32],[-.22,-.32],[.22,-.32]])b.cyl(.05,.05,.03,K.rubber(),[wx,.05,wz],[0,0,PI/2],12);b.pop()};
 b.push([2.2,0,14.6]);for(const s of[-1,1])b.box(3.2,.05,.05,K.mat(0x8a5a2a,.6),[0,.95,s*.45],null,0);for(const x of[-1.6,1.6])for(const s of[-1,1])b.box(.05,.95,.05,K.mat(0x8a5a2a,.6),[x,.48,s*.45],null,0);b.label(1.4,.3,K.paint('mw_carts',300,64,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'RETURN CARTS HERE',W/2,H/2,{size:26,col:'#fff'})}),[0,1.15,.48]);b.pop();for(let i=0;i<5;i++)cart(.9+i*.42,14.6,PI/2,false);S(.6,3.8,14.1,15.1,0,1.1,true);
 b.push([-1.0,0,15.5]);b.cyl(.035,.035,1.1,K.mat(0x3a3a3a,.4,.6),[0,.55,0],null,8);b.rbox(.16,.26,.12,.04,K.mat(0x4a4c50,.4,.5),[0,1.22,0]);b.add(K.sphGeo(.09,12,6,0,PI/2),K.glass(0xcfe6ee,.45),{p:[0,1.35,0]});b.pop();
 const lm=K.mat(0xb8bcc0,.35,.7);const lightPole=(x)=>{b.push([x,0,17.55]);b.rbox(.45,.6,.45,.04,lm,[0,.3,0]);b.cyl(.09,.14,8.6,lm,[0,4.3,0],null,12);b.tube([[0,8.3,0],[0,8.8,-.6],[0,8.8,-2.0]],.05,lm,12,6);b.rbox(.4,.14,.7,.05,lm,[0,8.75,-2.2]);b.box(.3,.02,.5,K.mat(0xffffff,.4,0,{emissive:0xfff2d0,emissiveIntensity:.8}),[0,8.67,-2.2],null,0);b.pop();S(x-.23,x+.23,17.32,17.78,0,8.6,true)};
 lightPole(-13);lightPole(1);lightPole(15);
 /* ---------- back: shutters, dock bumpers, propane tank, wreck ---------- */
 const shut=K.surf('rollshutter',0xb8bcc0,{m:.5});
 for(const x of[11,15.2]){b.rbox(3.6,.5,.5,.06,K.mat(0x8a8e92,.4,.6),[x,2.8,Z0-.35]);for(const s of[-1,1]){b.rbox(.3,.45,.18,.03,K.rubber(),[x+s*1.85,.75,Z0-.25]);b.box(.1,2.5,.14,K.mat(0x5a6062,.4,.6),[x+s*1.66,1.25,Z0-.2],null,0)}b.box(3.4,.1,.6,K.surf('concrete',0x8a8a86),[x,.05,Z0-.4],null,.01)}
 b.box(3.2,2.5,.06,shut,[15.2,1.25,Z0-.25],null,0);for(let i=0;i<4;i++)b.box(3.2,.1,.04,shut,[11,2.52+i*.07,Z0-.2],null,0);
 b.push([-12,0,-8.2]);b.add(K.cylGeo(.62,.62,2.6,28,true),K.surf('rust',0xd8d8d4,{m:.25}),{p:[0,1.0,0],r:[0,0,PI/2]});for(const s of[-1,1])b.add(K.sphGeo(.62,24,12),K.mat(0xd8d8d4,.4,.25),{p:[s*1.3,1.0,0],s:[.45,1,1]});b.add(K.sphGeo(.22,14,8,0,PI/2),K.mat(0xc8c8c4,.4,.3),{p:[0,1.6,0]});for(const s of[-.8,.8]){b.box(.14,.42,.9,K.mat(0xc8c8c4,.5,.3),[s,.3,0],null,.01)}b.box(3.0,.12,1.4,K.surf('concrete',0xa8a69e),[0,.06,0],null,.02);b.pop();S(-13.9,-10.1,-8.9,-7.5,0,1.7,true);
 const NB=window.NUTBOLT;if(NB&&NB.sedan)NB.sedan(b,S,4.5,-11.5,.15,0x8a1a24,{hood:true,broken:true,missing:['0.78,1.38','-0.78,1.38'],lift:-.06});
 b.cyl(.33,.33,.22,K.rubber(),[3.0,.11,-9.4],null,16);b.box(1.6,.04,1.1,K.mat(0x8a1a24,.32,.35),[3.4,.06,-10.0],[0,.6,.05],0);
 /* ---------- interior: floors, walls, ceiling, fixtures ---------- */
 b.box(37.7,.02,18.7,surf('floor'),[0,.035,3.5],null,0);b.box(10.7,.02,5.85,surf('conc'),[13.5,.036,-3.075],null,0);b.box(4.85,.02,5.85,surf('conc'),[5.5,.037,-3.075],null,0);
 const wl=surf('wall'),band=K.mat(0xd8a020,.5),base=K.mat(0x8a6a4a,.6);
 const lineWall=(ax,f,a0,a1,n,th,ops,plain)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(th/2+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,wl,.012,.006);if(y0<=0)pc(u0,u1,0,.12,base,.03,.015);if(!plain&&y0<=3.4&&y1>=3.6)pc(u0,u1,3.4,3.6,band,.02,.012)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:p.k==='g'?.8:.65;span(a,p.c-hw,0,CEIL);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,CEIL)}else span(p.c-hw,p.c+hw,p.k==='g'?2.5:2.4,CEIL);a=p.c+hw}span(a,a1,0,CEIL)};
 lineWall(1,Z1,X0,X1,-1,.3,FRONT);lineWall(1,Z0,X0,3,1,.3);lineWall(0,X0,Z0,Z1,1,.3);lineWall(0,X1,4,Z1,-1,.3);
 lineWall(1,0,3,X1,1,.16,Dr([5.5,9.0]));lineWall(0,3,Z0,0,1,.16);lineWall(0,8,Z0,0,1,.16,null,1);lineWall(0,8,Z0,0,-1,.16,null,1);lineWall(1,0,3,8,-1,.16,Dr([5.5]),1);lineWall(1,0,8,X1,-1,.16,Dr([9.0]),1);lineWall(1,Z0,3,8,1,.3,null,1);lineWall(1,Z0,8,X1,1,.3,BACK.map(p=>p),1);lineWall(0,X1,Z0,0,-1,.3,null,1);
 lineWall(1,4,15,X1,1,.16,Dr([16,18]));lineWall(0,15,0,4,-1,.16);lineWall(0,X1,0,4,-1,.3,null,1);
 b.box(37.7,.04,18.7,surf('ceil'),[0,CEIL+.02,3.5],null,0);
 const lit=K.mat(0xffffff,.4,0,{emissive:0xf4f8ff,emissiveIntensity:.95}),hous=K.mat(0xd8d8d4,.5,.2);
 for(let x=-15;x<18;x+=5)for(const z of[1.5,5.5,9.5]){b.box(3.6,.14,.36,hous,[x,CEIL-.07,z],null,.01);b.box(3.5,.012,.26,lit,[x,CEIL-.145,z],null,0)}
 b.box(30,.5,.6,K.mat(0xb8bcc0,.4,.6),[-2,CEIL-.3,3.4],null,.02);for(let x=-16;x<14;x+=4)b.box(.5,.08,.4,K.mat(0x6a6c6e,.5,.5),[x,CEIL-.56,3.4],null,0);
 for(const [x,z,ry] of[[-12.5,Z0+.18,0],[1.5,Z0+.18,0],[X1-.18,3.0,-PI/2]])b.label(.7,.85,saleTex(),[x,2.9,z],[0,ry,0]);
 /* ---------- checkout lanes ---------- */
 const cw=surf('counter'),belt=K.mat(0x141414,.6),stM=K.mat(0xb8bcc0,.35,.6),ropeM=K.mat(0xc8202a,.5),postM=K.mat(0xc8ccd0,.25,.9);
 const post=(x,z)=>{b.cyl(.025,.025,.95,postM,[x,.48,z],null,10);b.sph(.04,postM,[x,.98,z]);b.cyl(.13,.15,.04,postM,[x,.02,z],null,16)};const rope=(a,c)=>{b.tube([[a[0],.9,a[1]],[(a[0]+c[0])/2,.62,(a[1]+c[1])/2],[c[0],.9,c[1]]],.018,ropeM,16,6)};
 for(let i=0;i<4;i++){const x=-2.6+i*2.7,z0=8.6;b.push([x,0,z0]);b.box(.85,.92,3.2,cw,[0,.46,0],null,.01);b.box(.9,.06,3.25,stM,[0,.95,0],null,.01);b.box(.62,.02,1.8,belt,[0,.99,.5],null,0);b.box(.62,.08,.5,K.mat(0x2a2c2e,.4,.5),[0,.96,-.55],null,.01);b.box(.7,.12,.8,stM,[0,.9,-1.2],null,.01);
  b.push([.32,.98,-.2],[0,-PI/2,0]);b.rbox(.42,.12,.38,.02,K.mat(0xc8c8c4,.4,.4),[0,.06,0]);b.rbox(.36,.2,.22,.02,K.mat(0xd8d8d4,.4,.4),[0,.2,-.06],[-.3,0,0]);for(let k=0;k<16;k++)b.box(.04,.02,.035,K.mat(k%4===3?0xc41a1a:0x3a8a4a,.5),[-.1+(k%4)*.07,.29-Math.floor(k/4)*.025,-Math.floor(k/4)*.04],[-.3,0,0],0);b.cyl(.012,.012,.2,chrome,[.15,.3,-.15],null,6);b.rbox(.18,.06,.03,.005,blk,[.15,.42,-.15]);b.pop();
  b.pop();S(x-.45,x+.45,z0-1.6,z0+1.6,0,1.0);post(x+.9,z0+1.5);post(x+2.0,z0+1.5);rope([x+.9,z0+1.5],[x+2.0,z0+1.5])}
 for(let i=0;i<6;i++){const a=rnd()*6;b.cyl(.03,.03,.11,K.mat([0x1a4ea8,0xc41a1a,0x2a2a2a][i%3],.4,.3),[3+rnd()*6,.06,10.8+rnd()*1.6],[PI/2,a,0],10)}
 /* ---------- tyre stacks ---------- */
 const tyre=(x,y,z)=>{b.cyl(.34,.34,.24,K.rubber(),[x,y+.12,z],null,18);b.cyl(.2,.2,.25,K.mat(0x0a0a0a,.9),[x,y+.12,z],null,12)};for(let i=0;i<5;i++)tyre(-4.6,i*.24,10.6);for(let i=0;i<3;i++)tyre(-4.6,i*.24,11.4);tyre(-3.4,0,11.3);S(-5.0,-4.2,10.2,11.8,0,1.2,true);
 /* ---------- appliance wall: washers, stoves, boxed appliances, TV ---------- */
 const washer=(x,z)=>{b.push([x,0,z]);b.rbox(.68,.92,.66,.02,wht,[0,.46,0]);b.rbox(.68,.18,.12,.02,wht,[0,1.0,-.27]);b.box(.4,.06,.02,K.mat(0x2a2a2a,.4),[0,1.0,-.2],null,0);for(let k=0;k<3;k++)b.cyl(.025,.025,.03,K.mat(0x9a9c9e,.3,.7),[-.22+k*.22,1.02,-.2],[PI/2,0,0],10);b.box(.6,.02,.5,K.mat(0xe8e8e4,.3,.2),[0,.925,.05],null,0);b.label(.2,.08,K.paint('mw_aqua',96,40,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);P.text(c,'AQUAWHIRL',W/2,H/2,{size:14,col:'#1a4ea8'})}),[0,.8,.333]);b.label(.4,.3,K.paint('mw_price1',128,96,(c,W,H)=>{c.fillStyle=YEL;c.fillRect(0,0,W,H);P.text(c,'$399',W/2,H*.4,{size:40,col:RED});P.text(c,'NOW $319',W/2,H*.8,{size:22,col:DK})}),[0,.45,.333]);b.pop()};
 const stove=(x,z)=>{b.push([x,0,z]);b.rbox(.76,.92,.66,.02,wht,[0,.46,0]);b.box(.74,.02,.62,K.mat(0x1a1a1a,.3,.3),[0,.93,0],null,0);for(const [dx,dz] of[[-.18,-.15],[.18,-.15],[-.18,.15],[.18,.15]]){b.add(K.torGeo(.08,.012,6,20),K.mat(0x3a3a3a,.4,.5),{p:[dx,.945,dz],r:[PI/2,0,0]})}
  b.rbox(.76,.2,.1,.02,wht,[0,1.04,-.28]);for(let k=0;k<4;k++)b.cyl(.025,.025,.03,K.mat(0x2a2a2a,.4),[-.27+k*.18,1.04,-.22],[PI/2,0,0],10);b.box(.6,.4,.02,K.mat(0x0a0a0a,.1,.3),[0,.5,.335],null,0);b.cyl(.012,.012,.55,chrome,[0,.78,.36],[0,0,PI/2],8);b.pop()};
 for(let i=0;i<7;i++)washer(-18.2+i*.74,Z0+.5);for(let i=0;i<7;i++)stove(-12.2+i*.82,Z0+.5);S(-18.6,-6.2,Z0+.15,Z0+.85,0,1.1);
 const boxM=BOXES.map((d,i)=>boxTex('mw_box'+i,d[0],d[1],d[2]));const crate=(x,y,z,w,h,d,i,ry)=>b.add(K.rboxGeo(w,h,d,.02,1),boxM[i%4],{p:[x,y+h/2,z],r:[0,ry||0,0]});
 crate(-5.2,0,-5.2,.9,1.6,.8,2);crate(-4.1,0,-5.2,.9,1.6,.8,2);crate(-5.1,0,-4.2,.8,1.0,.8,1,.1);crate(-4.6,1.0,-4.25,.7,.5,.5,0,.3);crate(-1.9,0,-4.3,.7,.5,.5,0,.5);crate(-2.4,0,-3.3,1.0,.9,.8,3,-.3);crate(-14,0,-2.8,.9,1.0,.8,1,.4);crate(-13.2,0,-3.4,.8,1.0,.8,3,-.1);crate(-13.6,1.0,-3.0,.7,.5,.5,0,.2);
 S(-5.7,-3.6,-5.65,-3.75,0,1.6,true);S(-14.6,-12.7,-3.9,-2.3,0,1.5,true);
 b.push([-.8,0,-5.2]);b.box(2.2,.8,.6,surf('slat'),[0,.4,0],null,.01);b.box(2.3,.05,.65,K.veneer(0x9a7a4a,{tile:.6}),[0,.825,0],null,.01);b.rbox(1.6,.95,.06,.02,K.mat(0x121214,.3,.3),[0,1.4,0]);b.box(1.52,.87,.01,K.mat(0x3a3e44,.1,.4),[0,1.4,.035],null,0);b.box(.3,.05,.2,K.mat(0x121214,.3,.3),[0,.88,0],null,0);b.box(.12,.03,.01,K.mat(0xc41a1a,.4),[.6,.98,.035],null,0);b.pop();S(-1.95,.35,-5.55,-4.85,0,1.0);
 /* ---------- gondola aisles + pegboard end caps of tools ---------- */
 const peg=surf('peg');const tool=(x,y,z,k,ry)=>{b.push([x,y,z],[0,ry||0,0]);const mh=K.mat(0x4a4c50,.3,.85),wd=K.veneer(0xa8783a,{tile:.3}),rd=K.mat(0xc41a1a,.4);
  if(k===0){b.box(.03,.32,.03,wd,[0,-.1,.03],null,0);b.box(.14,.04,.04,mh,[0,.07,.03],null,0)}else if(k===1){b.box(.02,.3,.015,mh,[0,-.05,.03],null,0);b.box(.05,.1,.03,rd,[0,-.22,.03],null,.01)}else if(k===2){b.box(.025,.22,.01,mh,[0,0,.03],null,0);b.tor(.03,.008,mh,[0,.12,.03],null,null,10)}else{b.box(.14,.1,.06,K.mat(0xf2c418,.4),[0,0,.04],null,.01);b.box(.04,.12,.04,K.mat(0x1a1a1a,.5),[-.03,-.1,.04],null,0)}b.pop()};
 const endcap=(x,z,ry)=>{b.push([x,0,z],[0,ry,0]);b.box(1.0,1.8,.04,peg,[0,1.0,0],null,0);b.box(1.04,.08,.4,K.mat(0x8a8e92,.4,.6),[0,.05,.18],null,0);for(let i=0;i<12;i++){const px=-.38+(i%4)*.25,py=.6+Math.floor(i/4)*.45;b.cyl(.004,.004,.08,chrome,[px,py+.15,.04],[PI/2,0,0],4);tool(px,py,.0,i%4)}b.label(.9,.2,K.paint('mw_aisle'+Math.round(x),256,56,(c,W,H)=>{c.fillStyle='#1a5a2a';c.fillRect(0,0,W,H);P.text(c,['HAND TOOLS','POWER TOOLS','FASTENERS','PLUMBING','ELECTRICAL','HOUSEWARES'][Math.abs(Math.round(x*3))%6],W/2,H/2,{size:26,col:'#fff'})}),[0,2.05,.03]);b.pop()};
 for(const x of[-9,-5.6,-2.2]){endcap(x,3.95,0);endcap(x,-1.75,PI);S(x-.52,x+.52,3.75,4.2,0,1.9,true);S(x-.52,x+.52,-1.95,-1.5,0,1.9,true)}
 /* ---------- lumber rack ---------- */
 const pl=surf('plank'),ply=surf('ply'),rk=K.mat(0xd86a1a,.5,.4);b.push([14.5,0,10.6]);for(const x of[-2.6,0,2.6]){b.box(.14,3.0,.14,rk,[x,1.5,-.6],null,.01);b.box(.14,.14,1.4,rk,[x,.07,0],null,.01);for(let k=0;k<4;k++)b.box(.08,.08,1.1,rk,[x,.4+k*.7,-.05],[-.08,0,0],0)}
 for(let k=0;k<4;k++)for(let j=0;j<6;j++)for(let q=0;q<(k<3?3:2);q++)b.box(5.8,.05,.14,pl,[(rnd()-.5)*.2,.5+k*.7+q*.055,.3-j*.15],null,0);
 for(let i=0;i<5;i++)b.box(2.4,1.2,.02,ply,[-3.5,.6,-.4+i*.04],[-.12,PI/2,0],0);b.label(1.8,.4,K.paint('mw_lumber',384,86,(c,W,H)=>{c.fillStyle='#7a4a24';c.fillRect(0,0,W,H);P.text(c,'LUMBER YARD',W/2,H/2,{size:46,col:YEL})},{r:.6}),[0,3.3,-.55]);b.pop();S(11.6,17.4,9.8,11.4,0,3.0,true);S(10.5,11.4,9.6,11.8,0,1.3,true);
 /* ---------- paint section: can pyramid, tint machine, swatch wall ---------- */
 b.push([14,0,6.2]);b.box(1.8,.06,1.0,K.mat(0x8a8e92,.4,.6),[0,.03,0],null,0);for(let r=0;r<4;r++)for(let i=0;i<4-r;i++)for(let j=0;j<2;j++){const x=-.6+i*.32+r*.16,z=-.2+j*.36;b.cyl(.14,.14,.2,K.paint('mw_can'+((i+r+j)%4),128,64,(c,W,H)=>{c.fillStyle=['#c41a1a','#1a4ea8','#f2c418','#2a8a3a'][(i+r+j)%4];c.fillRect(0,0,W,H);c.fillStyle='#f4f4f0';c.fillRect(0,20,W,24);P.text(c,'PAINT',W/2,32,{size:16,col:'#1a1a1a'})}),[x,.17+r*.21,z],null,16);b.cyl(.14,.14,.01,K.mat(0x9a9c9e,.3,.8),[x,.27+r*.21,z],null,16)}
 b.pop();S(13.0,15.0,5.6,6.8,0,.9,true);
 b.push([X1-.45,0,1.6+4.5]);b.rbox(.7,1.4,.6,.03,K.mat(0xe8e8e4,.4,.2),[0,.7,0]);b.cyl(.04,.04,.12,chrome,[-.36,1.0,0],[0,0,PI/2],8);for(let i=0;i<6;i++)b.cyl(.04,.04,.25,K.mat([0xc41a1a,0x1a4ea8,0xf2c418,0x2a8a3a,0x1a1a1a,0xf4f4f0][i],.4),[-.15+(i%3)*.15,1.52,-.12+Math.floor(i/3)*.24],null,8);b.pop();
 b.box(.04,1.6,2.4,K.paint('mw_swatch',256,160,(c,W,H,r)=>{for(let i=0;i<16;i++)for(let j=0;j<8;j++){c.fillStyle=`hsl(${i*22},${30+j*8}%,${30+j*7}%)`;c.fillRect(i*16+1,j*20+1,14,18)}},{r:.6}),[X1-.18,2.0,8.4],null,0);
 /* ---------- garden: rope coils, shovels, rakes, wheelbarrow, soil sacks ---------- */
 for(let i=0;i<5;i++)b.add(K.torGeo(.28,.06,8,24),K.tri('mw_rope',(c,W,H)=>{c.fillStyle='#b89a6a';c.fillRect(0,0,W,H);c.strokeStyle='rgba(90,60,30,.6)';c.lineWidth=3;for(let x=-H;x<W;x+=10){c.beginPath();c.moveTo(x,0);c.lineTo(x+H,H);c.stroke()}},{tile:.15,r:.9}),{p:[9.0+(i%3)*.15,.07+i*.11,3.2+(i%2)*.1],r:[PI/2,0,i*.4]});
 for(let i=0;i<5;i++){const x=10.2+i*.22;b.cyl(.016,.016,1.4,K.veneer(0xa8783a,{tile:.3}),[x,.75,2.2],[.18,0,0],6);if(i%2)b.box(.22,.28,.02,K.mat(0x5a5c5e,.4,.7),[x,.12,2.08],[.18,0,0],0);else for(let k=0;k<8;k++)b.box(.006,.08,.006,K.mat(0x5a5c5e,.4,.7),[x-.12+k*.035,1.45,2.36],null,0)}
 b.push([11.6,0,3.8],[0,.4,0]);b.add(K.extrudeGeo([[-.4,0],[.4,0],[.55,.35],[-.5,.35]],.6,.02),K.mat(0x2a8a3a,.4,.4),{p:[0,.38,0],r:[0,PI/2,0]});b.cyl(.18,.18,.08,K.rubber(),[0,.18,.55],[0,0,PI/2],14);for(const s of[-1,1])b.cyl(.02,.02,1.4,K.veneer(0xa8783a,{tile:.3}),[s*.22,.5,-.3],[PI/2-.25,0,0],6);b.pop();S(11.1,12.1,3.1,4.5,0,.8,true);
 for(let i=0;i<8;i++)b.add(K.rboxGeo(.5,.14,.8,.05,2),K.paint('mw_soil',128,192,(c,W,H)=>{c.fillStyle='#3a6a2a';c.fillRect(0,0,W,H);c.fillStyle='#f4f0e0';c.fillRect(10,30,W-20,60);P.text(c,'TOP SOIL',W/2,60,{size:22,col:'#3a2a1a'});P.text(c,'40 LB',W/2,140,{size:22,col:'#fff'})},{r:.85}),{p:[9.4+(i%2)*.55,.18+Math.floor(i/2)*.14,1.2],r:[0,(i%2)*.1,0]});S(9.1,10.3,.75,1.65,0,.8,true);
 /* ---------- camping & sports (left front) ---------- */
 const tent=(x,z,ry)=>{b.push([x,0,z],[0,ry,0]);const tc=K.tri('mw_tent',(c,W,H,r)=>{c.fillStyle='#e8901a';c.fillRect(0,0,W,H);for(let i=0;i<20;i++){c.strokeStyle='rgba(120,60,10,.25)';c.lineWidth=2;c.beginPath();c.moveTo(r()*W,0);c.lineTo(r()*W,H);c.stroke()}},{tile:.6,r:.85});
  for(const s of[-1,1])b.box(1.6,.02,1.2,tc,[0,.5,s*.42],[s*-.95,0,0],0);b.cyl(.012,.012,1.0,K.mat(0x5a5a5a,.4,.6),[-.8,.5,0],null,6);b.cyl(.012,.012,1.0,K.mat(0x5a5a5a,.4,.6),[.8,.5,0],null,6);b.pop();S(x-.9,x+.9,z-.8,z+.8,0,1.0,true)};
 tent(-16.8,10.6,.2);tent(-14.2,11.4,-.3);
 const kayak=(x,z,ry,col)=>{b.add(K.sphGeo(.4,20,10),K.mat(col,.3,.2),{p:[x,.22,z],s:[1,.5,4.2],r:[0,ry,0]});b.add(K.sphGeo(.22,14,8),K.mat(0x1a1a1a,.5),{p:[x+Math.sin(ry)*.2,.36,z+Math.cos(ry)*.2],s:[1,.3,1.6],r:[0,ry,0]});S(x-.6,x+.6,z-1.0,z+1.0,0,.5,true)};
 kayak(-17.6,6.6,.15,0xc41a1a);kayak(-12.2,8.0,1.3,0x1a3aa8);
 for(let i=0;i<4;i++){b.cyl(.18,.18,.5,K.mat([0x2a6a3a,0x1a3a8a,0xc4521a,0x5a2a8a][i],.6),[-10.6+i*.42,.18,10.6],[0,0,PI/2],14);b.cyl(.12,.12,.52,K.mat(0x1a1a1a,.6),[-10.6+i*.42,.18,10.6],[0,0,PI/2],10)}
 const ball=(x,z,col,soc)=>b.add(K.sphGeo(soc?.11:.18,16,10),soc?K.paint('mw_soc',256,128,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle='#141414';for(let j=0;j<3;j++)for(let i=0;i<6;i++){const x=i*W/6+(j%2)*W/12,y=j*H/3+H/6;c.beginPath();for(let a=0;a<5;a++)c.lineTo(x+Math.cos(a*1.2566)*14,y+Math.sin(a*1.2566)*14);c.fill()}},{r:.4}):K.paint('mw_beach',256,128,(c,W,H)=>{const cs=['#c41a1a','#f4f4f0','#1a4ea8','#f4f4f0','#f2c418','#2a8a3a'];for(let i=0;i<6;i++){c.fillStyle=cs[i];c.fillRect(i*W/6,0,W/6,H)}},{r:.3}),{p:[x,soc?.11:.18,z],r:[rnd(),rnd(),rnd()]});
 for(const [x,z,s] of[[-13,8.2,0],[-12.4,8.7,1],[-11.6,9.4,0],[-9.6,7.0,1],[-9.0,7.5,1],[-7.8,10.2,0],[-6.9,11.6,0]])ball(x,z,0,s);
 for(let i=0;i<5;i++){b.cyl(.008,.004,2.2,K.mat(0x7a2a1a,.4,.3),[-18.6+i*.12,1.1,4.0],[.12+i*.02,0,0],5);b.tor(.03,.01,K.mat(0x9a9c9e,.3,.8),[-18.6+i*.12,.45,4.12],[0,PI/2,0],null,10)}b.box(.8,.06,.3,K.mat(0x5a3a22,.6),[-18.4,.05,4.0],null,0);
 for(let i=0;i<3;i++)b.rbox(.6,.4,.4,.05,K.mat([0xc41a1a,0x1a4ea8,0xe8e8e4][i],.4,.2),[-9.0+i*.7,.2,4.6]);b.label(1.6,.4,K.paint('mw_camp',384,86,(c,W,H)=>{c.fillStyle='#2a6a3a';c.fillRect(0,0,W,H);P.text(c,'CAMPING & SPORTS',W/2,H/2,{size:38,col:'#fff'})},{r:.6}),[X0+.18,3.0,8.0],[0,PI/2,0]);
 /* ---------- stock room: racking, tyres, boxes; office; break area; restrooms ---------- */
 const rack=(x,z,ry)=>{b.push([x,0,z],[0,ry,0]);for(const [px,pz] of[[-.95,-.3],[.95,-.3],[-.95,.3],[.95,.3]])b.box(.05,1.9,.05,K.mat(0x9a9ea2,.4,.6),[px,.95,pz],null,0);for(let k=0;k<3;k++)b.box(2.0,.04,.65,K.mat(0x9a9ea2,.4,.6),[0,.2+k*.75,0],null,.01);b.pop();S(x-1.0,x+1.0,z-.35,z+.35,0,1.9,true)};
 rack(14.6,-1.0,0);rack(11.4,-1.0,0);for(let i=0;i<3;i++)tyre(14.2,.24+i*.24,-1.0);tyre(15.1,.24,-1.0);crate(11.0,.95,-1.0,.6,.5,.5,0,.2);crate(11.7,.95,-1.0,.5,.4,.4,0);crate(14.8,1.72,-1.1,.7,.4,.5,3);
 b.box(1.4,1.2,1.0,K.surf('wood',0xa8844a),[17.6,.6,-1.2],null,.03);S(16.9,18.3,-1.7,-.7,0,1.2,true);
 b.push([5.5,0,-4.6],[0,PI,0]);b.box(1.8,.05,.8,K.veneer(0x9a7a4a,{tile:.6}),[0,.75,0],null,.01);b.box(1.7,.72,.04,surf('slat'),[0,.37,.38],null,0);for(const s of[-1,1])b.box(.05,.72,.75,surf('slat'),[s*.87,.37,0],null,0);
 b.rbox(.5,.32,.04,.01,blk,[-.3,1.05,-.2]);b.box(.04,.15,.04,blk,[-.3,.86,-.2],null,0);b.label(.46,.28,K.paint('mw_mon',192,120,(c,W,H)=>{c.fillStyle='#0a1a2a';c.fillRect(0,0,W,H);P.text(c,'INVENTORY',W/2,16,{size:16,col:'#7ad8ff'});c.fillStyle='#2a5a8a';for(let i=0;i<6;i++)c.fillRect(12,30+i*14,W-24,8)},{glow:.6}),[-.3,1.05,-.178]);b.rbox(.2,.42,.45,.02,K.mat(0xd8d8d4,.5),[.5,1.0,-.1]);b.rbox(.42,.02,.15,.005,K.mat(0xe8e8e2,.5),[-.3,.78,.1]);b.pop();S(4.6,6.4,-5.0,-4.2,0,.9);
 b.push([3.5,0,-2.0],[0,PI/2,0]);b.rbox(.5,1.3,.6,.02,K.mat(0xc8c4b8,.4,.4),[0,.65,0]);for(let k=0;k<3;k++){b.box(.44,.36,.02,K.mat(0xd8d4c8,.4,.4),[0,.25+k*.42,.31],null,0);b.box(.14,.02,.03,chrome,[0,.38+k*.42,.33],null,0)}b.pop();
 b.push([11.2,0,2.0]);b.cyl(.45,.45,.04,K.veneer(0xa8783a,{tile:.6}),[0,.74,0],null,20);b.cyl(.04,.04,.72,K.mat(0x5a5c5e,.4,.6),[0,.36,0],null,8);b.cyl(.28,.3,.03,K.mat(0x5a5c5e,.4,.6),[0,.015,0],null,16);b.pop();S(10.7,11.7,1.5,2.5,0,.8,true);
 const stool=(x,z,a)=>{b.push([x,.2,z],[PI/2,a,0]);b.cyl(.18,.18,.06,K.mat(0xd85a1a,.4),[0,.42,0],null,14);for(let k=0;k<3;k++){const q=k*PI*2/3;b.cyl(.012,.012,.45,K.mat(0x1e6a6a,.4,.6),[Math.cos(q)*.13,.2,Math.sin(q)*.13],[Math.sin(q)*.25,0,-Math.cos(q)*.25],6)}b.tor(.14,.01,K.mat(0x1e6a6a,.4,.6),[0,.15,0],[PI/2,0,0],null,14);b.pop()};stool(10.2,2.7,.5);stool(12.4,1.6,-1.0);
 const por=K.mat(0xf4f4f0,.2);for(const x of[16,18]){b.push([x,0,.5],[0,0,0]);b.lathe([[0,0],[.18,0],[.2,.1],[.22,.4],[0,.4]],por,[0,0,0],18);b.rbox(.4,.4,.2,.03,por,[0,.6,-.25]);b.pop();b.push([x+.6,0,2.6],[0,-PI/2,0]);b.rbox(.5,.18,.4,.03,por,[0,.85,.1]);b.plane(.5,.7,K.mat(0xd8e2e6,.03,1),[0,1.55,-.15]);b.pop()}
 b.box(.04,2.0,1.4,K.surf('mecha',0x8a8a84,{m:.3}),[17,1.0,2.0]);
 for(const [x,t] of[[16,'MEN'],[18,'WOMEN']])b.label(.3,.3,K.paint('mw_wc'+t,128,128,(c,W,H)=>{c.fillStyle='#1a1a1a';P.rrect(c,4,4,W-8,H-8,12);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(W/2,32,12,0,PI*2);c.fill();if(t==='MEN')c.fillRect(W/2-12,48,24,40);else{c.beginPath();c.moveTo(W/2,46);c.lineTo(W/2+20,90);c.lineTo(W/2-20,90);c.fill()}P.text(c,t,W/2,110,{size:16,col:'#fff'})}),[x+.95,1.6,4.1]);
 b.label(.9,.24,K.paint('mw_staff',300,80,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'STAFF ONLY',W/2,H/2,{size:34,col:'#fff'})}),[9.0,2.7,.1]);
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bMorningWood(x,z,t){
 const B=mk(x,z,40,36,H,0x7a4a3a,0xc86a6a,0x3a5a5a);B.dx=0;const PT={th:.16,c:0xc8c4c0};
 WL(B,1,Z1,X0,X1,[...wins([-17.4,-15.8,-14.2,-12.6,-10.4,-8.8,-3.6,-2.0,2.0,3.6,5.2,6.8,10.4,12.0,13.6,15.2]),{k:'d',c:-6.85},{k:'d',c:-5.55}],H);
 WL(B,1,Z0,X0,X1,[{k:'g',c:10.2},{k:'g',c:11.8},{k:'d',c:18.2,s:-1}],H);WL(B,0,X0,Z0,Z1,[],H);WL(B,0,X1,Z0,Z1,[],H);
 WL(B,1,0,3,X1,[{k:'d',c:5.5},{k:'d',c:9.0}],H,PT);WL(B,0,3,Z0,0,[],H,PT);WL(B,0,8,Z0,0,[],H,PT);
 WL(B,1,4,15,X1,[{k:'d',c:16},{k:'d',c:18}],H,PT);WL(B,0,15,0,4,[],H,PT);WL(B,0,17,0,4,[],H,PT);
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);
 const ry=a=>B.cs>0?a:a+PI,SP=(lx,lz,name,table,a,y0)=>{try{if(window.spawnPropContainer)spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,ry(a),y0||0);else cont(B,table||'hardware',lx,lz)}catch(e){}};
 // lootable: gondolas, end-cap shelf, tool chests, workbench, toolboxes, jerry cans, propane, the dumpster
 for(let r=0;r<3;r++)for(let k=0;k<2;k++)SP(-9.0+r*3.4,-.2+k*2.57,r===1?'shop_shelves_half':'shop_shelves_full','hardware',PI/2);
 SP(-15.6,-1.0,'shop_shelves_low','hardware',PI/2);SP(-15.6,1.7,'shop_shelves_low','hardware',PI/2);
 SP(6.8,-5.5,'tool_chest','hardware',0);SP(15.6,8.4,'tool_bench','hardware',PI);SP(2.0,4.6,'toolbox','hardware',0,0);SP(6.6,4.4,'jerry_can','hardware',0);SP(6.9,4.4,'jerry_can','hardware',0);SP(-10.6,5.4,'propane_cylinder','hardware',0);SP(-10.2,5.4,'propane_cylinder','hardware',0);
 SP(16.5,-16.6,'dumpster_blue','house',0);SP(16.0,-5.35,'pallet_racking','warehouse',0);
 rc(B,'hardware',[-8,6,0,6],1);
 buildings.push({x:WX(B,0),z:WZ(B,3.5),w:38,d:19,t:t.id});
 for(const [px,pz] of[[-6,3],[4,6],[-14,6],[12,-3],[-2,-3],[15,8],[0,-12]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));
 LASTB=B;return B}

// end caps placed against the gondola ends (built with the geometry)
if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='hammertime'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
const e=NEWCAT.find(d=>d.id==='hammertime');
if(e){e.name='Morning Wood Hardware';e.build=bMorningWood;e.note='full-block hardware & lumber store: checkouts, aisles, appliances, lumber, paint, garden, camping, stock room'}
if(typeof NOYARD!=='undefined')NOYARD.add('hammertime');window.bMorningWood=bMorningWood;window.MORNINGWOOD={build};
console.log('[hardware] Morning Wood ready');
})();
