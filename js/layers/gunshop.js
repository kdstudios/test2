/* ==========================================================================================================
   MINI FORT ZOMBIE - TRIGGERED FIREARMS & SUPPLIES (v072): a full-block gun shop (40 x 36 m plot, front = +Z), our own design.
   Exterior: grey brick store with a stepped parapet and coping, a metal awning over two runs of barred, orange-blinded windows, glass
   entrance, steel bollards, parapet sign + banners, a tall double-post pole sign with the crosshair logo, a side parking lot (yellow
   stalls, wheel stops, planter strips, a parked sedan), an outdoor range behind (hedge-faced walls, chain-link fence and gate,
   floodlight mast, firing benches with lane dividers, target stands, sandbag backstop, range rules), bus shelter, street light,
   timber power pole with wires.
   Interior: green / white marble checkerboard, beige walls with a mustard band and wood chair rail, drop ceiling with fluorescent
   strips, open-cubby wooden display counters in rows and an L, glass-topped showcase, register counter, a "display only" rifle wall,
   helmet + ammo shelving, silhouette target stands, office behind a half wall (desk, chair, monitor, files, papers, cork board),
   stock room with crates, safes and a gun cabinet, back door to the range, milk crates and litter.
   Structure from core WL (doors / windows work), detail is our own geometry and painted artwork, outside the static merge.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[gunshop] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const XS0=-18,XS1=6,ZS0=-6,ZS1=8,H=4.2,CEIL=3.4;
const ORG='#e8661a',ORG2='#ff8a2a',RED='#c41a1a',DK='#2a1a12';

/* ===================== artwork ===================== */
function crosshair(c,x,y,r,col){c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=r*.16;c.beginPath();c.arc(x,y,r,0,PI*2);c.stroke();c.beginPath();c.arc(x,y,r*.55,0,PI*2);c.stroke();c.beginPath();c.arc(x,y,r*.2,0,PI*2);c.fill();
 c.lineWidth=r*.12;for(const [dx,dy] of[[1,0],[-1,0],[0,1],[0,-1]]){c.beginPath();c.moveTo(x+dx*r*.3,y+dy*r*.3);c.lineTo(x+dx*r*1.45,y+dy*r*1.45);c.stroke()}c.restore()}
// TRIGGERED / FIREARMS (+) SUPPLIES on a white panel with a red rule
function drawLogo(c,W,H,o){o=o||{};if(!o.clear){c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H)}const f=H*.5;
 c.save();c.font=`bold ${f}px 'MFZ Head'`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.save();const mw=c.measureText('TRIGGERED').width+f*.2;if(mw>W*.94){c.translate(W/2,0);c.scale(W*.94/mw,1);c.translate(-W/2,0)}
 const g=c.createLinearGradient(0,H*.12,0,H*.6);g.addColorStop(0,ORG2);g.addColorStop(1,'#b8400a');
 c.lineWidth=f*.16;c.strokeStyle=DK;c.strokeText('TRIGGERED',W/2,H*.36);c.fillStyle=g;c.fillText('TRIGGERED',W/2,H*.36);
 c.lineWidth=f*.04;c.strokeStyle='rgba(255,230,190,.8)';c.strokeText('TRIGGERED',W/2,H*.35);c.restore();
 c.fillStyle=RED;c.fillRect(W*.05,H*.86,W*.9,H*.04);
 const f2=H*.17;c.font=`bold ${f2}px 'MFZ Head'`;c.lineWidth=f2*.18;c.strokeStyle=DK;c.textAlign='right';c.strokeText('FIREARMS',W/2-H*.13,H*.74);c.fillStyle=ORG;c.fillText('FIREARMS',W/2-H*.13,H*.74);
 c.textAlign='left';c.strokeText('SUPPLIES',W/2+H*.13,H*.74);c.fillText('SUPPLIES',W/2+H*.13,H*.74);
 crosshair(c,W/2,H*.74,H*.085,RED);c.restore()}
const logo=(key,w,h,o)=>K.paint(key,w,h,(c,W,H)=>drawLogo(c,W,H,o),Object.assign({r:.4},o&&o.mat||{}));
const bannerTex=K.paint?()=>K.paint('tg_banner',512,128,(c,W,H,r)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.save();c.translate(70,62);c.rotate(-.12);c.fillStyle=YEL();c.fillRect(-58,-30,116,56);P.text(c,'FREE',0,0,{size:46,col:RED,font:"'MFZ Head'"});c.restore();
 P.text(c,'CLEANING KIT',300,48,{size:44,col:'#1a1a1a',font:"'MFZ Head'"});P.text(c,'WITH PURCHASE OF SELECT RIFLES',300,92,{size:18,col:'#333'});
 c.fillStyle='#3a3a3a';c.beginPath();c.moveTo(150,112);c.lineTo(480,104);c.lineTo(485,112);c.lineTo(150,118);c.fill();P.grime(c,W,H,r,.4);for(const x of[6,W-14])c.fillRect(x,6,8,8)},{r:.6}):null;
function YEL(){return '#ffd23a'}

const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 brick:()=>K.tri('tg_brick',(c,W,H,r)=>{c.fillStyle='#8a8c90';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2,l=52+r()*20;c.fillStyle=`hsl(${210+r()*20},${3+r()*5}%,${l}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4);if(r()<.3){c.fillStyle='rgba(255,255,255,.08)';c.fillRect(x+4,j*bh+3,bw-10,3)}}
  P.noise(c,W,H,r,9000,.25,'#1a1a1c',1.6);P.grime(c,W,H,r,.7)},{tile:.38,r:.9}),
 coping:()=>K.surf('concrete',0x8a8a86),
 floor:()=>K.tri('tg_floor',(c,W,H,r)=>{const n=2,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const g=(i+j)%2;c.fillStyle=g?'#4a8a6a':'#e8ecea';c.fillRect(i*s,j*s,s,s);
   for(let k=0;k<30;k++){c.strokeStyle=g?'rgba(30,70,50,.35)':'rgba(140,150,150,.35)';c.lineWidth=.6+r()*2;c.beginPath();let x=i*s+r()*s,y=j*s+r()*s;c.moveTo(x,y);for(let q=0;q<6;q++){x+=(r()-.4)*40;y+=(r()-.5)*36;c.lineTo(Math.min(i*s+s,Math.max(i*s,x)),Math.min(j*s+s,Math.max(j*s,y)))}c.stroke()}
   P.noise(c,W,H,r,1200,.1,g?'#1a4a3a':'#8a9494',2);c.fillStyle='rgba(40,50,48,.4)';c.fillRect(i*s,j*s,s,2);c.fillRect(i*s,j*s,2,s)}P.grime(c,W,H,r,.35);P.scratches(c,W,H,r,40,'rgba(255,255,255,.3)')},{tile:.84,r:.3}),
 wall:()=>K.tri('tg_wall',(c,W,H,r)=>{c.fillStyle='#d8cfc0';c.fillRect(0,0,W,H);P.noise(c,W,H,r,6000,.1,'#7a6a5a',2);P.grime(c,W,H,r,.35)},{tile:.5,r:.85}),
 ceil:()=>K.tri('tg_ceil',(c,W,H,r)=>{c.fillStyle='#cfcfca';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.16,'#7a7a74',1.3);c.fillStyle='#9a9a94';c.fillRect(0,0,W,5);c.fillRect(0,0,5,H);c.fillRect(0,H/2,W,3);c.fillRect(W/2,0,3,H)},{tile:.84,r:.9}),
 counter:()=>K.veneer(0x7a5232,{tile:.7}),
 shelf:()=>K.mat(0xd8cfb8,.6),
 asphalt:()=>K.surf('asphalt',0x3a3c40),
 concrete:()=>K.surf('concrete',0xb0aea6),
 lawn:()=>K.surf('lawn',0x4a6a2a),
 hedge:()=>K.tri('tg_hedge',(c,W,H,r)=>{c.fillStyle='#2a3a1a';c.fillRect(0,0,W,H);for(let i=0;i<2600;i++){c.fillStyle=`hsl(${70+r()*30},${30+r()*25}%,${14+r()*24}%)`;c.beginPath();c.ellipse(r()*W,r()*H,3+r()*6,2+r()*3,r()*PI,0,PI*2);c.fill()}},{tile:.7,r:.9}),
 range:()=>K.surf('concrete',0x7a786e),
 sand:()=>K.tri('tg_sandbag',(c,W,H,r)=>{c.fillStyle='#5a5038';c.fillRect(0,0,W,H);const bw=W/3,bh=H/6;for(let j=0;j<6;j++)for(let i=-1;i<4;i++){const x=i*bw+(j%2)*bw/2;c.fillStyle=`hsl(40,${22+r()*10}%,${46+r()*10}%)`;P.rrect(c,x+3,j*bh+3,bw-6,bh-6,14);c.fill();c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;c.beginPath();c.moveTo(x+bw*.2,j*bh+bh/2);c.lineTo(x+bw*.8,j*bh+bh/2);c.stroke()}P.noise(c,W,H,r,4000,.3,'#2a2418',1.5)},{tile:.6,r:.95}),
 chain:()=>K.paint('tg_chain',256,256,(c,W,H)=>{c.clearRect(0,0,W,H);c.strokeStyle='rgba(190,196,200,.95)';c.lineWidth=2.4;for(let i=-H;i<W+H;i+=14){c.beginPath();c.moveTo(i,0);c.lineTo(i+H,H);c.stroke();c.beginPath();c.moveTo(i,H);c.lineTo(i+H,0);c.stroke()}},{alpha:true,r:.4,m:.7})
})[k]());

/* ===================== props built here ===================== */
// generic long guns, side profile in XY (x along the barrel), extruded thin
const GUNS={
 bolt:[[-.55,.0],[-.2,.07],[.05,.07],[.12,.1],[.5,.1],[.5,.115],[.62,.115],[.62,.1],[.9,.1],[.9,.115],[.95,.115],[.95,.09],[.1,.08],[.0,.02],[-.15,.02],[-.55,-.08]],
 carbine:[[-.45,.01],[-.15,.07],[.0,.07],[0,.12],[.3,.12],[.32,.1],[.6,.1],[.6,.085],[.3,.07],[.12,.07],[.1,-.08],[.05,-.08],[.05,.02],[-.15,.02],[-.45,-.08]],
 smg:[[-.3,.04],[-.05,.07],[0,.12],[.32,.12],[.32,.1],[.5,.1],[.5,.085],[.28,.06],[.2,.06],[.18,-.12],[.12,-.12],[.12,.04],[.02,.03],[.0,-.06],[-.05,-.06],[-.12,.02],[-.3,-.04]],
 shotgun:[[-.55,.0],[-.2,.07],[.05,.07],[.08,.11],[.95,.11],[.95,.09],[.6,.09],[.6,.07],[.3,.07],[.3,.06],[.05,.06],[.0,.02],[-.15,.02],[-.55,-.08]]};
function longGun(b,type,x,y,z,ry,s){const wood=K.veneer(0x6a3a1e,{tile:.4}),steel=K.mat(0x2a2c30,.35,.85);b.push([x,y,z],[0,ry,0],[s||1,s||1,s||1]);
 b.add(K.extrudeGeo(GUNS[type],.035,.004),wood);b.box(type==='smg'?.6:.75,.025,.03,steel,[type==='smg'?.25:.42,.105,0],null,0);b.box(.22,.06,.045,steel,[.12,.09,0],null,.008);if(type!=='shotgun'&&type!=='smg'){b.cyl(.018,.018,.18,steel,[.2,.16,0],[0,0,PI/2],10)}
 if(type==='smg'){b.box(.05,.18,.035,steel,[.16,-.03,0],[0,0,.1],0)}b.tor(.035,.006,steel,[.04,.03,0],null,PI,10);b.pop()}
function wireChair(){} // (not used)

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
function build(){if(CACHE)return CACHE;const b=K.builder('triggered'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),rnd=b.rnd,conc=surf('concrete'),yl=K.mat(0xf2c418,.6),dark=K.mat(0x1a1a1c,.5);
 const Wn=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 const FRONT=[...Wn([-14.2,-12.6,-11.0,-9.4]),{k:'d',c:-6.0},...Wn([-2.6,-1.0,.6,2.2])];
 /* ---------- ground ---------- */
 b.box(40,.025,33.9,surf('asphalt'),[0,.012,-1.05],null,0);
 b.box(40,.05,2.1,conc,[0,.03,16.95],null,0);for(let x=-19.5;x<20;x+=1.5)b.box(.02,.052,2.08,K.mat(0x8a8880,.8),[x,.031,16.95],null,0);b.box(40,.16,.18,conc,[0,.08,15.9],null,0);
 b.box(25.2,.1,2.4,conc,[-6,.05,9.3],null,0);b.box(25.2,.12,.12,conc,[-6,.06,10.5],null,0);                                   // front walk
 b.box(1.6,.1,5.4,conc,[-6,.05,13.2],null,0);                                                                                  // path to the sidewalk
 // side lot: yellow stalls + wheel stops; planter strips with grass along the street and the right edge
 for(let i=0;i<=7;i++)b.box(5.2,.012,.12,yl,[14.2,.03,-5.0+i*2.7],null,0);for(let i=0;i<7;i++)b.box(.22,.12,1.7,K.surf('concrete',0x9a9890),[16.5,.06,-3.65+i*2.7],null,.03);
 b.box(.12,.012,19,yl,[11.6,.03,4.5],null,0);
 const planter=(x0,x1,z0,z1)=>{b.box(x1-x0,.18,z1-z0,conc,[(x0+x1)/2,.09,(z0+z1)/2],null,.03);b.box(x1-x0-.3,.04,z1-z0-.3,surf('lawn'),[(x0+x1)/2,.19,(z0+z1)/2],null,0);for(let i=0;i<Math.max(2,(x1-x0+z1-z0)/1.2);i++)b.add(K.sphGeo(.22+rnd()*.15,8,6),surf('hedge'),{p:[x0+.3+rnd()*(x1-x0-.6),.24,z0+.3+rnd()*(z1-z0-.6)],s:[1,.6,1]})};
 planter(7.6,9.6,14.2,15.7);planter(17,20,14.2,15.7);planter(-20,-7.4,14.2,15.7);planter(-4.6,7.6,14.2,15.7);planter(19.2,20,-6,14.2);b.box(.7,.3,.7,conc,[8.2,.15,13.2],null,.04);b.cyl(.15,.15,.9,conc,[8.2,.6,13.2],null,10);
 /* ---------- store: grey brick skin, parapet, coping ---------- */
 const brk=surf('brick'),cop=surf('coping');
 const skin=(ax,f,a0,a1,n,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*.165,u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,.03,brk,[u,y,o],null,0);else b.box(.03,y1-y0,u1-u0,brk,[o,y,u],null,0)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;pc(a,p.c-hw,0,H);if(p.k==='w'){pc(p.c-hw,p.c+hw,0,.9);pc(p.c-hw,p.c+hw,2.75,H)}else pc(p.c-hw,p.c+hw,2.4,H);a=p.c+hw}pc(a,a1,0,H)};
 skin(1,ZS1,XS0,XS1,1,FRONT);skin(1,ZS0,XS0,XS1,-1,Dr([-14.6]));skin(0,XS0,ZS0,ZS1,-1);skin(0,XS1,ZS0,ZS1,1,Wn([2.0]));
 // stepped parapet with concrete coping
 const par=(ax,f,a0,a1,n)=>{const L=a1-a0,u=(a0+a1)/2,o=f+n*0;for(let s=0;s<L/4;s++){const u0=a0+s*4,u1=Math.min(a1,u0+4),hh=s%2?.55:.75,uu=(u0+u1)/2;
   if(ax){b.box(u1-u0,hh,.36,brk,[uu,H+hh/2,f],null,0);b.box(u1-u0+.02,.08,.46,cop,[uu,H+hh+.04,f],null,.01)}else{b.box(.36,hh,u1-u0,brk,[f,H+hh/2,uu],null,0);b.box(.46,.08,u1-u0+.02,cop,[f,H+hh+.04,uu],null,.01)}}};
 par(1,ZS1,XS0,XS1,1);par(1,ZS0,XS0,XS1,-1);par(0,XS0,ZS0,ZS1,-1);par(0,XS1,ZS0,ZS1,1);
 b.box(24.2,.12,14.2,K.surf('concrete',0x5a5a58),[-6,H+.02,1],null,0);b.box(24,.02,14,K.mat(0x34363a,.9),[-6,H+.09,1],null,0);
 b.rbox(2.0,1.0,1.4,.03,K.mat(0xb0b4b8,.4,.7),[-4,H+.6,-1]);b.vents(6,1.8,.7,K.mat(0x6a6c6e,.5,.6),[-4,H+.6,-.29]);b.cyl(.55,.55,.1,K.mat(0x2a2a2a,.5,.4),[-4,H+1.15,-1],null,20);b.rbox(1.2,.7,1.0,.03,K.mat(0xa0a4a8,.4,.7),[-12,H+.45,-3]);for(const [x,z] of[[0,3],[-15,-2]])b.cyl(.07,.07,.7,K.mat(0x7a7c7e,.4,.7),[x,H+.45,z],null,10);
 /* ---------- storefront: awning, bars, orange blinds, sign, banners, bollards ---------- */
 const aw=K.mat(0x8a8a84,.5,.5);b.box(17.6,.1,1.6,aw,[-6.4,3.0,ZS1+.92],[.28,0,0],.01);b.box(17.6,.42,.08,K.mat(0x9a9a94,.5,.5),[-6.4,2.72,ZS1+1.72],null,.01);b.box(17.6,.04,.1,K.mat(0x5a5a56,.5,.5),[-6.4,2.5,ZS1+1.72],null,.01);
 for(let i=0;i<36;i++)b.box(.03,.04,1.58,K.mat(0x6a6a64,.5,.5),[-15.1+i*.495,3.06,ZS1+.92],[.28,0,0],0);
 for(const x of[-15.1,-6.4,2.3]){b.cyl(.02,.02,1.7,K.mat(0x5a5a5a,.4,.7),[x,3.5,ZS1+.85],[-1.0,0,0],6)}
 const blind=K.paint('tg_blind',256,256,(c,W,H,r)=>{c.fillStyle='#e8701e';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=10){c.fillStyle='rgba(120,40,0,.35)';c.fillRect(0,y,W,2)}c.fillStyle='rgba(255,200,120,.25)';c.fillRect(0,0,W,40)},{glow:.55,r:.6});
 for(const w of FRONT.filter(p=>p.k==='w')){b.box(1.44,1.78,.01,blind,[w.c,1.83,ZS1-.05],null,0);for(let i=0;i<9;i++)b.cyl(.012,.012,1.84,K.mat(0x1a1a1a,.4,.6),[w.c-.64+i*.16,1.83,ZS1+.2],null,6);for(const y of[1.0,2.66])b.box(1.5,.03,.03,K.mat(0x1a1a1a,.4,.6),[w.c,y,ZS1+.2],null,0)}
 b.box(.01,1.78,1.44,blind,[XS1-.05,1.83,2.0],null,0);for(let i=0;i<9;i++)b.cyl(.012,.012,1.84,K.mat(0x1a1a1a,.4,.6),[XS1+.2,1.83,2.0-.64+i*.16],null,6);
 b.rbox(4.6,2.3,.2,.04,K.mat(0x2a2a2c,.4,.4),[-6.4,H+.95,ZS1+.28]);b.label(4.4,2.1,logo('tg_logo_wall',1024,490,{mat:{glow:.25}}),[-6.4,H+.95,ZS1+.385]);for(const x of[-8.2,-4.6])b.box(.06,.6,.06,K.mat(0x5a5a5a,.4,.7),[x,H+.0,ZS1+.24],null,0);
 b.label(2.6,.65,bannerTex(),[3.6,2.3,ZS1+.2]);b.label(3.0,.75,bannerTex(),[XS1+.2,2.6,4.6],[0,PI/2,0]);
 b.label(.5,.6,K.paint('tg_hours',200,240,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);P.text(c,'STORE HOURS',W/2,24,{size:22,col:'#1a1a1a'});['MON-FRI 9-8','SAT 9-6','SUN 11-5'].forEach((s,i)=>P.text(c,s,W/2,70+i*36,{size:22,col:'#333'}));c.fillStyle=RED;c.fillRect(0,H-46,W,46);P.text(c,'NO LOADED GUNS',W/2,H-23,{size:20,col:'#fff'})},{r:.5}),[-4.95,1.5,ZS1+.17]);
 for(let x=-16.6;x<5;x+=1.9){if(Math.abs(x+6)<1.2)continue;b.cyl(.13,.13,1.0,K.mat(0xc8c8c0,.4,.3),[x,.6,ZS1+1.9],null,14);b.add(K.sphGeo(.13,14,6,0,PI/2),K.mat(0xc8c8c0,.4,.3),{p:[x,1.1,ZS1+1.9]});b.box(.27,.05,.27,K.mat(0x8a8a86,.6),[x,.12,ZS1+1.9],null,.01);S(x-.14,x+.14,ZS1+1.76,ZS1+2.04,0,1.2,true)}
 /* ---------- pole sign ---------- */
 b.push([16.6,0,12.4],[0,-.3,0]);b.cyl(.9,1.0,1.1,K.surf('concrete',0x9a9890),[0,.55,0],null,18);b.cyl(.22,.26,8.6,K.mat(0x4a4c50,.4,.6),[0,5.2,0],null,14);
 b.rbox(1.8,1.5,.5,.04,K.mat(0xe8e8e4,.4),[0,7.0,0]);b.rbox(6.0,3.0,.6,.08,K.mat(0xe8e8e4,.4),[0,9.0,0]);b.box(6.1,.1,.62,K.mat(0x3a3a3c,.5,.5),[0,7.48,0],null,.01);
 for(const sd of[1,-1]){b.label(5.8,2.8,logo('tg_logo_pole',1024,490,{mat:{glow:.45}}),[0,9.0,sd*.31],[0,sd>0?0:PI,0]);b.label(1.6,1.3,K.paint('tg_xh',256,208,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);crosshair(c,W/2,H/2,62,RED)},{glow:.4,r:.4}),[0,7.0,sd*.26],[0,sd>0?0:PI,0])}
 b.pop();S(15.7,17.5,11.5,13.3,0,10.5,true);
 /* ---------- parked sedan ---------- */
 const sed=(x,z,ry,col)=>{b.push([x,0,z],[0,ry,0]);const pm=K.mat(col,.3,.4),gl=K.mat(0x1e2a34,.08,.6),ty=K.rubber();b.add(K.extrudeGeo([[2.25,.32],[2.28,.62],[2.15,.8],[1.05,.9],[-1.55,.92],[-2.15,.9],[-2.27,.64],[-2.25,.32]],1.74,.04),pm,{r:[0,PI/2,0]});
  b.add(K.extrudeGeo([[1.0,.9],[.32,1.32],[-.9,1.34],[-1.55,.93]],1.5,.02),gl,{r:[0,PI/2,0]});b.add(K.extrudeGeo([[.3,1.32],[-.88,1.35],[-.9,1.37],[.28,1.345]],1.46,.02),pm,{r:[0,PI/2,0]});
  for(const [wx,wz] of[[-.78,1.38],[.78,1.38],[-.78,-1.35],[.78,-1.35]]){b.cyl(.33,.33,.22,ty,[wx,.33,wz],[0,0,PI/2],18);b.cyl(.2,.2,.23,K.mat(0xb8bcc0,.3,.8),[wx,.33,wz],[0,0,PI/2],14)}
  b.box(1.76,.18,.14,dark,[0,.42,2.27],null,.04);b.box(1.76,.18,.14,dark,[0,.42,-2.27],null,.04);for(const s of[-1,1]){b.box(.42,.13,.04,K.mat(0xf4f0e0,.2,.3),[s*.6,.68,2.29],null,.01);b.box(.38,.14,.04,K.mat(0xb01818,.3),[s*.62,.72,-2.28],null,.01)}
  b.pop();const sw=Math.abs(Math.sin(ry))>.5;S(x-(sw?2.3:.95),x+(sw?2.3:.95),z-(sw?.95:2.3),z+(sw?.95:2.3),0,1.4,true)};
 sed(14.0,-.95,PI/2,0x2a3a7a);
 /* ---------- range behind the store ---------- */
 const hedge=surf('hedge'),RZ0=-17.65,RZ1=-6.4;
 const wall=(x0,z0,x1,z1,h)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);b.box(L,h,.5,hedge,[(x0+x1)/2,h/2,(z0+z1)/2],[0,-a,0],0);b.box(L+.05,.08,.55,K.surf('concrete',0x6a6a64),[(x0+x1)/2,h+.04,(z0+z1)/2],[0,-a,0],.01);S(Math.min(x0,x1)-.25,Math.max(x0,x1)+.25,Math.min(z0,z1)-.25,Math.max(z0,z1)+.25,0,h,true)};
 wall(-19.6,RZ0,8.6,RZ0,2.6);wall(-19.6,RZ0,-19.6,RZ1,2.6);wall(8.6,RZ0,8.6,-11.6,2.6);
 b.box(27.6,.06,11.2,surf('range'),[-5.5,.04,-12.1],null,0);
 // chain-link run with an open gate between the hedge and the store's back corner
 const post=K.mat(0x9a9ea2,.4,.7),ch=surf('chain');
 b.box(.02,2.3,4.8,ch,[8.6,1.15,-9.2],null,0);for(const z of[-11.6,-9.2,-6.8])b.cyl(.04,.04,2.4,post,[8.6,1.2,z],null,8);b.cyl(.025,.025,4.8,post,[8.6,2.3,-9.2],[PI/2,0,0],6);S(8.55,8.65,-11.6,-6.8,0,2.3,true);
 b.push([6.2,0,-6.8],[0,-.5,0]);b.box(2.2,2.0,.02,ch,[1.1,1.1,0],null,0);for(const [x0,y0,w,h] of[[1.1,.1,2.2,.04],[1.1,2.1,2.2,.04],[0,1.1,.04,2.0],[2.2,1.1,.04,2.0]])b.box(w,h,.04,post,[x0,y0,0],null,0);b.pop();
 b.cyl(.05,.05,2.4,post,[6.2,1.2,-6.8],null,8);
 for(const [x,z] of[[7.4,-6.2],[5.9,-6.45]]){b.cyl(.03,.03,1.6,post,[x+1,.8,z+.05],null,6);}
 b.label(.35,.45,K.paint('tg_rangesign',140,180,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle='#1a1a1a';c.fillRect(30,30,80,90);c.fillStyle='#f4f4f0';c.fillRect(56,46,28,40);c.fillRect(48,86,44,10);P.text(c,'RANGE',W/2,140,{size:22,col:'#1a1a1a'});P.text(c,'MEMBERS',W/2,164,{size:16,col:'#1a1a1a'})}),[8.66,1.6,-10.4],[0,PI/2,0]);
 // floodlight mast
 b.push([7.4,0,-8.0]);b.rbox(.6,.4,.6,.04,K.surf('concrete',0x8a8a86),[0,.2,0]);b.cyl(.14,.2,9,K.mat(0x8a8c8e,.5,.6),[0,4.7,0],null,12);b.box(1.6,.12,.12,K.mat(0x6a6c6e,.5,.6),[0,9.1,0],null,.01);
 for(const s of[-.6,0,.6]){b.rbox(.5,.4,.25,.03,K.mat(0x3a3c3e,.5,.5),[s,9.35,0],[-.4,s*.6,0]);b.box(.42,.3,.02,K.mat(0xffffff,.3,0,{emissive:0xfff6e0,emissiveIntensity:.5}),[s,9.3,.13],[-.4,s*.6,0],0)}b.pop();S(7.1,7.7,-8.3,-7.7,0,9.4,true);
 // firing line: benches with lane dividers and a roof beam; targets downrange; sandbag backstop
 for(let i=0;i<8;i++){const x=-16+i*3.0;b.rbox(1.6,.06,.7,.01,K.veneer(0x8a6a42,{tile:.6}),[x,.92,-8.4]);for(const s of[-.7,.7])b.box(.08,.9,.6,K.mat(0x4a4c50,.5,.4),[x+s,.45,-8.4],null,0);b.box(.06,1.8,1.2,K.mat(0x6a6c6e,.5,.4),[x+1.5,.9,-8.4],null,.01);
  b.rbox(.3,.08,.15,.01,K.mat(0x2a4a2a,.6),[x+.3,.99,-8.5]);for(let k=0;k<6;k++)b.cyl(.006,.006,.03,K.mat(0xc8a03a,.3,.9),[x-.4+rnd()*1.2,.07,-7.6+rnd()*.6],[PI/2,rnd()*3,0],6);S(x-.8,x+.8,-8.75,-8.05,0,1.0,true)}
 b.box(24,.25,.25,K.mat(0x5a5c60,.5,.5),[-5.5,2.4,-8.4],null,.01);for(const x of[-17.5,6.5])b.box(.2,2.4,.2,K.mat(0x5a5c60,.5,.5),[x,1.2,-8.4],null,.01);
 b.label(3.4,.6,K.paint('tg_rules',768,136,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'EYE & EAR PROTECTION REQUIRED',W/2,H*.38,{size:44,col:'#fff'});P.text(c,'COLD RANGE WHEN FLAG IS UP',W/2,H*.78,{size:30,col:YEL()})},{r:.5}),[-5.5,2.4,-8.27]);
 const tgt=K.paint('tg_target',256,384,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle='#1a1a1a';c.beginPath();c.arc(W/2,78,46,0,PI*2);c.fill();c.beginPath();c.moveTo(W/2-58,120);c.lineTo(W/2+58,120);c.lineTo(W/2+100,H-20);c.lineTo(W/2-100,H-20);c.fill();
  for(const [r,col] of[[70,'#f4f4f0'],[56,RED],[40,'#f4f4f0'],[26,RED],[10,'#f4f4f0']]){c.fillStyle=col;c.beginPath();c.moveTo(W/2,240-r);c.lineTo(W/2+r*.8,240);c.lineTo(W/2,240+r);c.lineTo(W/2-r*.8,240);c.fill()}
  c.fillStyle='#1a1a1a';for(let i=0;i<14;i++){c.beginPath();c.arc(W/2+(Math.sin(i*2.7)*50),230+Math.cos(i*1.9)*70,3,0,PI*2);c.fill()}},{r:.6});
 const targetStand=(x,z,ry,h)=>{b.push([x,0,z],[0,ry||0,0]);for(const s of[-.32,.32])b.box(.05,h||1.6,.05,K.mat(0x7a5a3a,.8),[s,(h||1.6)/2,0],null,0);b.box(.8,.05,.5,K.mat(0x5a4a3a,.8),[0,.03,0],null,0);b.box(.6,.9,.01,K.mat(0x9a7a4a,.8),[0,(h||1.6)-.5,-.01],null,0);
  b.label(.56,.84,tgt,[0,(h||1.6)-.5,.0]);b.pop()};
 for(let i=0;i<8;i++)targetStand(-16+i*3.0,-15.2,0);
 b.box(27,1.4,1.2,surf('sand'),[-5.5,.7,-16.9],null,.04);b.box(27,.7,.8,surf('sand'),[-5.5,1.75,-17.1],null,.04);S(-19,8,-17.5,-16.3,0,2.1,true);
 b.push([6.9,0,-15.6]);b.cyl(.03,.03,3.2,post,[0,1.6,0],null,6);b.add(new T.PlaneGeometry(.6,.4),K.mat(0xc41a1a,.6,0,{side:T.DoubleSide}),{p:[.32,3.0,0]});b.pop();
 /* ---------- store interior: floor, walls, ceiling, lights ---------- */
 b.box(23.7,.02,13.7,surf('floor'),[-6,.035,1],null,0);b.box(23.7,.04,13.7,surf('ceil'),[-6,CEIL+.02,1],null,0);
 const wl=surf('wall'),band=K.mat(0xc89a2a,.5),rail=K.veneer(0x8a5a36,{tile:.6}),base=K.mat(0x5a3a22,.6);
 const lineWall=(ax,f,a0,a1,n,th,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);
  const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(th/2+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,wl,.012,.006);if(y0<=0&&y1>.15)pc(u0,u1,0,.14,base,.03,.015);if(y0<=.98&&y1>=1.04)pc(u0,u1,.98,1.04,rail,.05,.025);if(y1>=CEIL)pc(u0,u1,CEIL-.42,CEIL-.3,band,.02,.012),pc(u0,u1,CEIL-.24,CEIL-.2,band,.02,.012)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,0,CEIL);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,CEIL)}else span(p.c-hw,p.c+hw,2.4,CEIL);a=p.c+hw}span(a,a1,0,CEIL)};
 lineWall(1,ZS1,XS0,XS1,-1,.3,FRONT);lineWall(1,ZS0,XS0,0,1,.3,Dr([-14.6]));lineWall(1,ZS0,0,XS1,1,.3);lineWall(0,XS0,ZS0,ZS1,1,.3);lineWall(0,XS1,ZS0,ZS1,-1,.3,Wn([2.0]));
 lineWall(1,-1.6,0,XS1,1,.16,Dr([1.4]));lineWall(1,-1.6,0,XS1,-1,.16,Dr([1.4]));lineWall(0,0,ZS0,-1.6,-1,.16);lineWall(0,0,ZS0,-1.6,1,.16);
 const lit=K.mat(0xffffff,.4,0,{emissive:0xf6f8ff,emissiveIntensity:.95}),hous=K.mat(0xd8d8d4,.5,.2);
 for(let x=-16;x<5;x+=3.4)for(const z of[-3.8,1,5.4]){if(x>-.5&&z<0)continue;b.box(2.4,.08,.26,hous,[x,CEIL-.04,z],null,.01);b.box(2.3,.012,.18,lit,[x,CEIL-.085,z],null,0)}
 b.box(1.3,.06,.26,hous,[3,CEIL-.04,-3.8],null,.01);b.box(1.2,.012,.18,lit,[3,CEIL-.075,-3.8],null,0);
 /* ---------- office behind a half wall (back-left) ---------- */
 const hw=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0),cx=(x0+x1)/2,cz=(z0+z1)/2;b.box(L,1.1,.16,K.mat(0xd8d2c4,.8),[cx,.55,cz],[0,-a,0],0);b.box(L+.04,.06,.26,rail,[cx,1.13,cz],[0,-a,0],.01);b.box(L,.14,.18,base,[cx,.07,cz],[0,-a,0],0);
  S(Math.min(x0,x1)-.08,Math.max(x0,x1)+.08,Math.min(z0,z1)-.08,Math.max(z0,z1)+.08,0,1.16,true)};
 hw(-12.2,ZS0,-12.2,-2.0);hw(-12.2,-.6,-12.2,0);hw(-17.85,0,-12.2,0);
 b.push([-16.4,0,-4.6]);b.rbox(1.7,.05,.85,.01,K.veneer(0x8a4a24,{tile:.5}),[0,.76,0]);for(const s of[-.78,.78])b.box(.05,.74,.8,K.veneer(0x6a3a1e,{tile:.5}),[s,.37,0],null,0);b.box(1.5,.5,.03,K.veneer(0x6a3a1e,{tile:.5}),[0,.48,-.38],null,0);
 b.rbox(.5,.35,.04,.01,blk,[-.35,1.05,-.25]);b.box(.04,.15,.04,blk,[-.35,.86,-.25],null,0);b.label(.46,.3,K.paint('tg_mon',192,128,(c,W,H)=>{c.fillStyle='#0a1a2a';c.fillRect(0,0,W,H);P.text(c,'INVENTORY',W/2,18,{size:16,col:'#7ad8ff'});c.fillStyle='#2a5a8a';for(let i=0;i<6;i++)c.fillRect(12,34+i*14,W-24,8)},{glow:.6}),[-.35,1.05,-.228]);
 b.rbox(.46,.025,.16,.005,K.mat(0xe8e8e2,.5),[-.3,.795,.12]);for(let i=0;i<3;i++)b.rbox(.32,.01,.24,.002,K.paint('tg_folder',128,96,(c,W,H)=>{c.fillStyle='#e8c860';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(20,16,60,14);c.fillRect(20,40,60,14)}),[.35+i*.02,.79+i*.01,.05],[0,.2-i*.1,0]);
 b.cyl(.04,.035,.1,K.mat(0xf4f4f0,.4),[.65,.83,-.2],null,12);b.pop();S(-17.3,-15.5,-5.05,-4.15,0,.8);
 b.push([-16.2,0,-3.4],[0,PI+.5,0]);const ch2=K.mat(0x8a8c90,.5,.2);b.rbox(.5,.1,.48,.04,ch2,[0,.48,0]);b.rbox(.48,.62,.08,.04,ch2,[0,.9,-.22],[.1,0,0]);b.cyl(.03,.03,.38,K.mat(0x3a3a3a,.4,.7),[0,.24,0],null,8);for(let k=0;k<5;k++){const a=k*PI*2/5;b.box(.3,.03,.04,K.mat(0x2a2a2a,.4,.6),[Math.cos(a)*.15,.06,Math.sin(a)*.15],[0,-a,0],0);b.sph(.03,blk,[Math.cos(a)*.3,.03,Math.sin(a)*.3])}for(const s of[-1,1])b.box(.05,.04,.3,ch2,[s*.27,.68,0],null,.01);b.pop();
 b.box(1.3,.9,.02,K.tri('tg_cork',(c,W,H,r)=>{c.fillStyle='#b8885a';c.fillRect(0,0,W,H);P.noise(c,W,H,r,8000,.4,'#6a4a2a',2)},{tile:.5,r:.9}),[-17.83,1.7,-3.6],[0,PI/2,0],0);
 for(let i=0;i<6;i++)b.box(.005,.22,.18,K.mat([0xf4f4f0,0xffe060,0xf4f4f0,0x9ad8ff][i%4],.6),[-17.82,1.5+(i%2)*.32,-4.1+i*.2],[rnd()*.2,0,0],0);
 // papers on the floor, a dropped pistol, milk crates
 for(let i=0;i<10;i++)b.box(.21,.003,.29,K.paint('tg_paper',96,128,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle='#888';for(let k=0;k<10;k++)c.fillRect(10,12+k*10,W-20-(k%3)*10,3)}),[-12.6+rnd()*3,.04,-1.2+rnd()*2.2],[0,rnd()*3,0],0);
 const crate=(x,z,colr)=>{const m=K.mat(colr,.6);b.push([x,0,z],[0,rnd(),0]);for(const [w,d,px,pz] of[[.4,.02,0,-.17],[.4,.02,0,.17],[.02,.36,-.2,0],[.02,.36,.2,0]]){b.box(w,.28,d,m,[px,.15,pz],null,0)}b.box(.4,.02,.36,m,[0,.01,0],null,0);b.pop()};
 crate(-9.6,-1.8,0x2a3a9a);crate(-9.0,-1.6,0xc41a1a);
 b.push([-11.5,.05,-2.2],[0,.7,0]);b.box(.2,.03,.03,K.mat(0x1a1a1a,.4,.7),[0,0,0],null,0);b.box(.04,.03,.1,K.mat(0x1a1a1a,.4,.7),[-.06,0,.05],null,0);b.pop();
 /* ---------- display counters: open wooden cubbies with shelves ---------- */
 const cw=surf('counter'),sh=surf('shelf');
 const counter=(x,z,ry,n,top)=>{const L=n*.9;b.push([x,0,z],[0,ry,0]);b.box(L,.05,.62,cw,[0,.97,0],null,.01);b.box(L,.06,.6,cw,[0,.03,0],null,0);b.box(L,.94,.03,cw,[0,.5,-.3],null,0);
  for(let i=0;i<=n;i++)b.box(.04,.94,.62,cw,[-L/2+i*.9,.5,0],null,0);for(let i=0;i<n;i++){b.box(.86,.025,.56,sh,[-L/2+.45+i*.9,.48,0],null,0);
   if(rnd()<.5)b.rbox(.18,.08,.12,.01,K.mat([0xc8a03a,0x2a5a2a,0xc41a1a,0x1a3a8a][i%4],.5),[-L/2+.3+i*.9+rnd()*.3,.54,rnd()*.2-.1],[0,rnd(),0])}
  if(top)b.box(L-.04,.008,.58,K.glass(0xdfeff4,.25),[0,1.0,0],null,0);b.pop();const sw=Math.abs(Math.sin(ry))>.5;S(x-(sw?.32:L/2),x+(sw?.32:L/2),z-(sw?L/2:.32),z+(sw?L/2:.32),0,1.0,true)};
 counter(-14.4,2.0,0,4);counter(-16.3,4.6,PI/2,4);counter(-8.4,1.6,0,5,1);counter(-8.4,4.4,PI,5,1);counter(-1.9,3.6,PI/2,4);counter(.9,1.4,0,6);counter(3.9,4.6,PI/2,3,1);
 // register counter end with the till, a drawer, receipt spike, pen cup
 b.push([3.0,1.0,1.4]);b.rbox(.42,.12,.38,.02,K.mat(0x9a9c9e,.4,.5),[0,.06,0]);b.rbox(.36,.18,.2,.02,K.mat(0xa8aaac,.4,.5),[0,.2,-.06],[-.3,0,0]);for(let i=0;i<20;i++)b.box(.04,.02,.035,K.mat(i%5===4?0xc41a1a:0x3a8a4a,.5),[-.14+(i%5)*.07,.27-Math.floor(i/5)*.025,-.0-Math.floor(i/5)*.04],[-.3,0,0],0);b.rbox(.12,.08,.03,.005,K.mat(0x1a1a1a,.4),[.12,.36,-.12]);b.label(.1,.05,K.mat(0x3aff6a,.4,0,{emissive:0x3aff6a,emissiveIntensity:.6}),[.12,.36,-.104]);b.pop();
 b.cyl(.04,.04,.1,K.mat(0x1a3a8a,.5),[2.4,1.05,1.3],null,10);for(let i=0;i<3;i++)b.cyl(.004,.004,.14,K.mat(0x1a1a1a,.5),[2.4+(i-1)*.015,1.12,1.3],[.1*(i-1),0,0],4);
 /* ---------- rifle wall + display-only signs, helmet / ammo shelving ---------- */
 b.box(7.2,1.3,.03,K.tri('tg_slat',(c,W,H,r)=>{c.fillStyle='#e8e0d0';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){c.fillStyle='#b8ae9a';c.fillRect(0,y,W,3)}},{tile:.5,r:.6}),[-6,2.15,ZS0+.2],null,0);
 ['smg','carbine','bolt','bolt','shotgun','carbine','bolt'].forEach((t,i)=>{longGun(b,t,-8.8+i*.95,2.3+(i%2)*.1,ZS0+.25,0,1);b.cyl(.012,.012,.08,chrome,[-8.8+i*.95-.1,2.3,ZS0+.25],[PI/2,0,0],6)});
 for(const x of[-9.8,-2.4])b.label(.5,.28,K.paint('tg_donly',192,108,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle='#1a1a1a';c.lineWidth=4;c.strokeRect(4,4,W-8,H-8);P.text(c,'DISPLAY',W/2,40,{size:30,col:'#1a1a1a'});P.text(c,'ONLY!',W/2,76,{size:30,col:RED})}),[x,2.45,ZS0+.22]);
 // helmet + ammo-box shelving units (our own) on the back wall
 const unit=(x,z,ry,kind)=>{b.push([x,0,z],[0,ry,0]);for(const s of[-.95,.95])b.box(.04,1.9,.5,K.mat(0x9a9ea2,.4,.6),[s,.95,0],null,0);b.box(1.9,1.6,.02,K.mat(0xb8bcc0,.4,.5),[0,1.0,-.24],null,0);
  for(let k=0;k<4;k++){const y=.18+k*.45;b.box(1.9,.03,.48,K.mat(0xb8bcc0,.4,.5),[0,y,0],null,0);b.box(1.9,.06,.01,K.mat(0x2a2a2a,.5),[0,y-.02,.245],null,0);
   for(let i=0;i<5;i++){if(rnd()<.25)continue;const px=-.76+i*.38;if(kind==='helm'&&k>1){b.add(K.sphGeo(.14,14,8,0,PI/2),K.mat(i%2?0x3a4a2a:0x2a3a6a,.6),{p:[px,y+.02,0],s:[1,.85,1.15]});b.box(.3,.02,.34,K.mat(0x2a2a2a,.6),[px,y+.025,0],null,0)}
    else{for(let q=0;q<2;q++)b.rbox(.12,.08,.2,.008,K.paint('tg_ammo'+(i%3),96,64,(c,W,H)=>{c.fillStyle=['#c8a03a','#2a5a2a','#1a3a8a'][i%3];c.fillRect(0,0,W,H);c.fillStyle='#fff';c.fillRect(6,18,W-12,24);P.text(c,['9MM','12GA','.45'][i%3],W/2,30,{size:18,col:'#1a1a1a'})}),[px-.06+q*.13,y+.055+(rnd()<.3?.08:0),0])}}}
  b.pop();S(x-1,x+1,z-.3,z+.3,0,1.9,true)};
 unit(-11.0,ZS0+.55,0,'helm');unit(-1.2,ZS0+.55,0,'ammo');
 /* ---------- target stands in the shop, posters, barred interior windows ---------- */
 for(let i=0;i<3;i++)targetStand(-16.8+i*.95,6.0,PI*.9+i*.05,1.5);
 b.push([-12.4,0,-1.0]);b.cyl(.025,.025,2.0,K.mat(0x5a5a5a,.4,.6),[0,1.0,0],null,8);b.box(.4,.03,.4,K.mat(0x5a5a5a,.4,.6),[0,.02,0],null,0);b.label(.44,.44,K.paint('tg_pdisp',192,192,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle='#1a1a1a';c.lineWidth=6;c.strokeRect(6,6,W-12,H-12);c.fillStyle='#1a1a1a';c.beginPath();c.arc(96,60,22,0,PI*2);c.fill();c.fillRect(70,84,52,60);c.fillRect(120,90,50,12)}),[0,2.0,.015]);b.pop();
 const poster=(key,draw,x,y,z,ry,w,h)=>{b.label(w,h,K.paint(key,256,Math.round(256*h/w),draw,{r:.5}),[x,y,z],[0,ry,0])};
 poster('tg_p_banner',(c,W,H)=>{c.drawImage(bannerTex().map.image,0,0,W,H)},-6.4,3.07,ZS0+.19,0,2.2,.55);
 poster('tg_p_camo',(c,W,H,r)=>{c.fillStyle='#4a5a2a';c.fillRect(0,0,W,H);for(let i=0;i<60;i++){c.fillStyle=['#2a3418','#6a6a3a','#3a2a18'][i%3];c.beginPath();c.ellipse(r()*W,r()*H,10+r()*30,6+r()*18,r()*3,0,PI*2);c.fill()}P.text(c,'HUNTING',W/2,H*.4,{size:40,col:'#f4f0e0'});P.text(c,'SEASON',W/2,H*.55,{size:40,col:ORG2});P.text(c,'LICENSES SOLD HERE',W/2,H-24,{size:18,col:'#fff'})},XS1-.17,2.2,-.6,-PI/2,.7,1.0);
 poster('tg_p_safety',(c,W,H)=>{c.fillStyle='#f4f0e0';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,60);P.text(c,'SAFETY FIRST',W/2,30,{size:32,col:'#fff'});['TREAT EVERY GUN','AS IF LOADED','','KEEP FINGER OFF','THE TRIGGER'].forEach((s,i)=>P.text(c,s,W/2,100+i*34,{size:24,col:'#1a1a1a'}))},XS1-.17,2.2,5.0,-PI/2,.7,1.0);
 poster('tg_p_banner2',(c,W,H)=>{c.drawImage(bannerTex().map.image,0,0,W,H)},XS0+.17,2.7,3.0,PI/2,2.4,.6);
 for(let i=0;i<3;i++)poster('tg_p_'+i,(c,W,H,r)=>{c.fillStyle=['#2a2a2a','#7a1a1a','#e8e0c8'][i];c.fillRect(0,0,W,H);crosshair(c,W/2,H*.42,44,['#ffd23a','#fff',RED][i]);P.text(c,['TACTICAL','CCW CLASS','GUN SHOW'][i],W/2,H*.78,{size:34,col:i===2?'#1a1a1a':'#fff'});P.text(c,['GEAR','SAT 10AM','THIS MONTH'][i],W/2,H*.9,{size:22,col:i===2?RED:'#ddd'})},-1.9+i*.7,2.5,ZS0+.17,0,.6,.85);
 /* ---------- stock room ---------- */
 b.label(.7,.18,K.paint('tg_staff',256,64,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'STAFF ONLY',W/2,H/2,{size:30,col:'#fff'})}),[1.4,2.6,-1.5]);
 /* ---------- sidewalk: bus shelter, street light, no parking sign, power pole ---------- */
 b.push([-15.8,0,16.6]);const fr=K.mat(0x3a3a3c,.4,.5);for(const [x,z] of[[-1.6,-.65],[1.6,-.65],[-1.6,.65],[1.6,.65]])b.box(.08,2.5,.08,fr,[x,1.25,z],null,.01);b.box(3.4,.08,1.5,fr,[0,2.52,0],null,.01);b.box(3.3,.03,1.4,K.glass(0xcfe6ee,.4),[0,2.57,0],null,0);b.box(3.3,1.8,.02,K.glass(0xcfe6ee,.25),[0,1.3,-.65],null,0);
 b.box(.04,1.9,1.3,fr,[-1.6,1.25,0],null,.01);b.label(1.2,1.7,K.paint('tg_busad',256,360,(c,W,H)=>{c.fillStyle='#1a7a3a';c.fillRect(0,0,W,H);c.fillStyle=RED;c.beginPath();c.arc(W/2,120,70,0,PI*2);c.fill();crosshair(c,W/2,120,40,'#fff');P.text(c,'RANGE DAY',W/2,250,{size:42,col:'#fff'});P.text(c,'EVERY SATURDAY',W/2,300,{size:26,col:YEL()})},{glow:.3}),[-1.57,1.25,0],[0,PI/2,0]);
 for(let i=0;i<3;i++)b.box(2.4,.04,.08,K.mat(0x1a3a8a,.4,.5),[.2,.5,-.4+i*.12],null,0);b.box(2.4,.3,.04,K.mat(0x1a3a8a,.4,.5),[.2,.75,-.58],[-.2,0,0],0);b.pop();S(-17.5,-14.1,15.9,16.1,0,2.6,true);
 b.push([-12.6,0,17.6]);b.cyl(.03,.03,2.3,K.mat(0x8a8c8e,.4,.6),[0,1.15,0],null,8);b.label(.35,.5,K.paint('tg_nopark',140,200,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle=RED;c.lineWidth=5;c.strokeRect(5,5,W-10,H-10);P.text(c,'NO',W/2,40,{size:36,col:RED});P.text(c,'PARKING',W/2,84,{size:26,col:RED});P.text(c,'BUS',W/2,126,{size:26,col:RED});P.text(c,'ZONE',W/2,160,{size:26,col:RED})}),[0,2.0,.035]);b.pop();
 b.push([-3.0,0,17.4]);const lm=K.mat(0xb8bcc0,.35,.7);b.rbox(.45,.6,.45,.04,lm,[0,.3,0]);b.cyl(.09,.14,8.6,lm,[0,4.3,0],null,12);b.tube([[0,8.4,0],[0,8.9,-.6],[0,8.9,-2.4]],.05,lm,12,6);b.rbox(.4,.14,.75,.05,lm,[0,8.85,-2.6]);b.box(.3,.02,.55,K.mat(0xffffff,.4,0,{emissive:0xfff2d0,emissiveIntensity:.8}),[0,8.77,-2.6],null,0);b.cyl(.02,.02,1.2,lm,[0,8.3,-.8],[1.1,0,0],6);b.pop();S(-3.25,-2.75,17.15,17.65,0,8.6,true);
 const pole=(x,z)=>{const tw=K.surf('bark',0x6a4a2a);b.cyl(.15,.2,10,tw,[x,5,z],null,10);b.box(.12,.12,2.2,tw,[x,9.4,z],null,0);for(const s of[-.9,0,.9])b.cyl(.04,.05,.14,K.mat(0x8a9a8a,.3,.2),[x,9.53,z+s],null,8);S(x-.2,x+.2,z-.2,z+.2,0,10,true)};
 pole(9.4,-16.4);pole(19.2,8.4);const wire=K.mat(0x1a1a1a,.6);for(const s of[-.9,0,.9])b.tube([[9.4,9.55,-16.4+s],[14.3,8.6,-4.5+s],[19.2,9.55,8.4+s]],.012,wire,24,4);
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bTriggered(x,z,t){
 const B=mk(x,z,40,36,H,0x6a6c70,0xc8d0cc,0x3a3a3c);B.dx=0;const PT={th:.16,c:0xd8d2c4};
 WL(B,1,ZS1,XS0,XS1,[...wins([-14.2,-12.6,-11.0,-9.4]),{k:'d',c:-6.0},...wins([-2.6,-1.0,.6,2.2])],H);
 WL(B,1,ZS0,XS0,XS1,[{k:'d',c:-14.6,s:-1},{k:'d',c:3.0,s:-1}],H);WL(B,0,XS0,ZS0,ZS1,[],H);WL(B,0,XS1,ZS0,ZS1,wins([2.0]),H);
 WL(B,1,-1.6,0,XS1,[{k:'d',c:1.4}],H,PT);WL(B,0,0,ZS0,-1.6,[],H,PT);
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);
 const ry=a=>B.cs>0?a:a+PI,SP=(lx,lz,name,table,a,y0)=>{try{if(window.spawnPropContainer)spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,ry(a),y0||0);else cont(B,table||'gunshop',lx,lz)}catch(e){}};
 // lootable: display cases out front, gun racks on the walls, ammo + weapon crates by the office, the stock room's cabinet and crates, the desk
 SP(-4.6,7.3,'display_case','gunshop',PI);SP(-16.6,ZS1-.5,'display_case','gunshop',PI);
 SP(-17.68,1.4,'gun_rack','gunshop',PI/2,0);SP(XS1-.18,6.4,'gun_rack','gunshop',-PI/2,0);SP(XS1-.18,3.9,'gun_rack','gunshop',-PI/2,0);
 SP(-13.0,-5.4,'ammo_crate','gunshop',0);SP(-14.5,-1.0,'weapon_crate','gunshop',0);SP(-11.3,1.0,'weapon_crate_long','gunshop',0);
 SP(.7,-5.5,'gun_cabinet','gunshop',0);SP(1.8,-5.5,'gun_cabinet','gunshop',0);SP(5.5,-4.2,'weapon_crate_stack','gunshop',-PI/2);SP(3.4,-2.3,'ammo_crate','gunshop',PI);SP(.5,-3.4,'cardboard_box_large','storage',PI/2);
 SP(-17.4,-1.2,'bookshelf','office',PI/2);
 rc(B,'gunshop',[-11,4.5,-1,6.6],1);
 buildings.push({x:WX(B,-6),z:WZ(B,1),w:24,d:14,t:t.id});
 for(const [px,pz] of[[-8,3],[-3,5.5],[-14,-3],[3,-3.5],[-5,-12],[12,4],[-12,6]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));
 LASTB=B;return B}

if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='trigger_guard'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
const e=NEWCAT.find(d=>d.id==='trigger_guard');
if(e){e.name='Triggered Firearms & Supplies';e.build=bTriggered;e.note='full-block gun shop with side lot, office, stock room and an outdoor range'}
if(typeof NOYARD!=='undefined')NOYARD.add('trigger_guard');window.bTriggered=bTriggered;window.TRIGGERED={build};
console.log('[gunshop] Triggered ready');
})();
