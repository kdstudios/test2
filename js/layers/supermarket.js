/* ==========================================================================================================
   MINI FORT ZOMBIE - MEAT & 2 VEG (v072): a full-block supermarket (40 x 36 m plot, front = +Z), our own design.
   Exterior: a 38 x 23 m stucco store fronting the sidewalk: four bays of shop windows under green-striped awnings between stone pilasters,
   a central gabled entrance tower with the MEAT & 2 VEG lettering over glass double doors, ornate five-globe lamp posts, parking meters,
   a newspaper box and two drinks machines by the walls; behind, a white painted-brick back with a two-bay loading dock (one shutter up,
   one down), dock bumpers, a personnel door, a burnt-out box truck by a fire barrel, and the service yard.
   Interior: red / cream checkerboard floor, grey walls over a mahogany board wainscot with a teal cap, drop ceiling with fluorescent
   troffers, five checkout lanes (wood-panelled counters, conveyor belts, registers, scanners, bagging wells, red stanchion ropes),
   shopping carts (some tipped over), gondola aisles, chest freezers, produce stands, wall coolers, a deli counter with a lit meat case,
   coffee station, SAVINGS SPREE! banner, posters, wet-floor sign; back of house through swing doors: stock room with pallets of sacks,
   milk-crate stacks, boxes, the dock with levelers, and a restroom.
   Structure from core WL (doors / windows work); detail is our own geometry and painted artwork, outside the static merge.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[supermarket] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const X0=-19,X1=19,Z0=-8,Z1=15.4,H=5.0,CEIL=3.8,ZB=-1.5;            // ZB = sales floor / back-of-house partition
const GRN='#4a8a2a',GRN2='#7ab83a',DK='#1e3a14',RED='#c8261c',YEL='#ffd23a';

/* ===================== artwork ===================== */
function drawCarrot(c,x,y,s,rot){c.save();c.translate(x,y);c.rotate(rot||0);c.scale(s,s);c.fillStyle='#e8701a';c.beginPath();c.moveTo(-9,-30);c.quadraticCurveTo(0,-36,9,-30);c.lineTo(1,34);c.lineTo(-1,34);c.closePath();c.fill();
 c.strokeStyle='rgba(120,40,0,.5)';c.lineWidth=1.5;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-6+i,-18+i*12);c.lineTo(2+i,-16+i*12);c.stroke()}c.fillStyle='#3a9a2a';for(const a of[-.5,0,.5]){c.save();c.translate(0,-32);c.rotate(a);c.beginPath();c.ellipse(0,-12,4,13,0,0,PI*2);c.fill();c.restore()}c.restore()}
function drawPea(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#4aa82a';c.beginPath();c.ellipse(0,0,30,11,-.3,0,PI*2);c.fill();c.fillStyle='#7ad84a';for(let i=-2;i<=2;i++){c.beginPath();c.arc(i*10,-i*3,6,0,PI*2);c.fill()}c.restore()}
function drawSteak(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#b8282a';c.beginPath();c.moveTo(-34,-6);c.bezierCurveTo(-30,-26,10,-30,28,-16);c.bezierCurveTo(40,-4,30,22,6,22);c.bezierCurveTo(-18,22,-38,12,-34,-6);c.fill();
 c.strokeStyle='#f4e8d8';c.lineWidth=5;c.stroke();c.strokeStyle='rgba(255,230,220,.6)';c.lineWidth=2;c.beginPath();c.moveTo(-20,0);c.quadraticCurveTo(0,-8,18,4);c.stroke();c.fillStyle='#f4e8d8';c.beginPath();c.arc(14,-6,6,0,PI*2);c.fill();c.restore()}
// "meat & 2 veg" lettering: small "the" style kicker, big MEAT, "& 2 veg" with a carrot and peas
function drawLogo(c,W,H,o){o=o||{};c.clearRect(0,0,W,H);c.save();c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.font=`bold ${H*.46}px 'MFZ Head'`;c.lineWidth=H*.05;c.strokeStyle=o.edge||DK;c.strokeText('MEAT',W/2,H*.4);const g=c.createLinearGradient(0,H*.15,0,H*.65);g.addColorStop(0,GRN2);g.addColorStop(1,GRN);c.fillStyle=g;c.fillText('MEAT',W/2,H*.4);
 c.font=`${H*.2}px 'MFZ Body'`;c.fillStyle=o.small||'#3a6a1e';c.fillText('& 2 veg',W/2,H*.82);drawCarrot(c,W*.16,H*.62,H*.006*.9,.5);drawPea(c,W*.84,H*.7,H*.006);c.restore()}

const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 stucco:()=>K.tri('mv_stucco',(c,W,H,r)=>{c.fillStyle='#d6d0c6';c.fillRect(0,0,W,H);P.noise(c,W,H,r,30000,.18,'#8a847a',1.4);P.noise(c,W,H,r,12000,.2,'#f4f0e8',1.4);P.grime(c,W,H,r,.35)},{tile:.35,r:.95}),
 stone:()=>K.tri('mv_stone',(c,W,H,r)=>{c.fillStyle='#aaa69e';c.fillRect(0,0,W,H);P.noise(c,W,H,r,30000,.35,'#5a5650',1.6);P.noise(c,W,H,r,20000,.35,'#c8c4bc',1.6);P.grime(c,W,H,r,.5)},{tile:.4,r:.95}),
 wbrick:()=>K.tri('mv_wbrick',(c,W,H,r)=>{c.fillStyle='#9a9a98';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2;c.fillStyle=`hsl(40,3%,${84+r()*10}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4);if(r()<.4){c.fillStyle='rgba(40,40,40,.35)';c.fillRect(x+4+r()*bw*.6,j*bh+bh*.6,8+r()*30,2)}}P.grime(c,W,H,r,.6)},{tile:.38,r:.9}),
 floor:()=>K.tri('mv_floor',(c,W,H,r)=>{const n=2,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const g=(i+j)%2;c.fillStyle=g?'#c86a6a':'#ecdcc4';c.fillRect(i*s,j*s,s,s);
   for(let k=0;k<24;k++){c.strokeStyle=g?'rgba(140,40,40,.25)':'rgba(170,140,100,.2)';c.lineWidth=.6+r()*1.8;c.beginPath();let x=i*s+r()*s,y=j*s+r()*s;c.moveTo(x,y);for(let q=0;q<6;q++){x+=(r()-.4)*40;y+=(r()-.5)*36;c.lineTo(Math.min(i*s+s,Math.max(i*s,x)),Math.min(j*s+s,Math.max(j*s,y)))}c.stroke()}
   P.noise(c,W,H,r,1500,.1,g?'#7a2a2a':'#a89070',2);c.fillStyle='rgba(60,40,30,.35)';c.fillRect(i*s,j*s,s,2);c.fillRect(i*s,j*s,2,s)}P.grime(c,W,H,r,.35);P.scratches(c,W,H,r,40,'rgba(255,255,255,.3)')},{tile:.55,r:.3}),
 conc:()=>K.tri('mv_conc',(c,W,H,r)=>{c.fillStyle='#5a5856';c.fillRect(0,0,W,H);P.noise(c,W,H,r,20000,.35,'#2a2826',1.8);for(let i=0;i<8;i++){const g=c.createRadialGradient(r()*W,r()*H,2,r()*W,r()*H,40+r()*80);g.addColorStop(0,'rgba(20,16,12,.4)');g.addColorStop(1,'rgba(20,16,12,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}},{tile:.3,r:.8}),
 wall:()=>K.tri('mv_wall',(c,W,H,r)=>{c.fillStyle='#b4b6b8';c.fillRect(0,0,W,H);P.noise(c,W,H,r,6000,.12,'#6a6c6e',2);P.grime(c,W,H,r,.4)},{tile:.5,r:.85}),
 wains:()=>K.tri('mv_wains',(c,W,H,r)=>{const n=8,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#4a2018');g.addColorStop(.3,'#7a3a2a');g.addColorStop(.8,'#8a4430');g.addColorStop(1,'#3a1810');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.35)},{tile:.6,r:.55}),
 ceil:()=>K.tri('mv_ceil',(c,W,H,r)=>{c.fillStyle='#d8d8d2';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.16,'#7a7a74',1.3);c.fillStyle='#8a8a84';c.fillRect(0,0,W,5);c.fillRect(0,0,5,H);c.fillRect(0,H/2,W,3);c.fillRect(W/2,0,3,H)},{tile:.84,r:.9}),
 awning:()=>K.tri('mv_awn',(c,W,H,r)=>{const n=8,s=W/n;for(let i=0;i<n;i++){c.fillStyle=i%2?'#1e5a1a':'#2a6a22';c.fillRect(i*s,0,s,H);if(i%2===0){c.fillStyle='rgba(180,230,80,.85)';c.fillRect(i*s+s*.38,0,s*.24,H)}}P.grime(c,W,H,r,.5)},{tile:.5,r:.85}),
 counterW:()=>K.tri('mv_cwood',(c,W,H,r)=>{const n=10,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#5a2a1e');g.addColorStop(.4,'#8a4a34');g.addColorStop(1,'#4a2016');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.3)},{tile:.45,r:.6}),
 asphalt:()=>K.surf('asphalt',0x3a3c40),concrete:()=>K.surf('concrete',0xb0aea6),
 sack:()=>K.tri('mv_sack',(c,W,H,r)=>{c.fillStyle='#e8e6e0';c.fillRect(0,0,W,H);P.noise(c,W,H,r,4000,.15,'#8a8880',1.5)},{tile:.4,r:.85}),
 pallet:()=>K.surf('wood',0xa87a4a),
 burnt:()=>K.tri('mv_burnt',(c,W,H,r)=>{c.fillStyle='#a8aeac';c.fillRect(0,0,W,H);for(let i=0;i<6;i++){const g=c.createRadialGradient(r()*W,r()*H,4,r()*W,r()*H,30+r()*90);g.addColorStop(0,'rgba(10,10,10,.85)');g.addColorStop(1,'rgba(10,10,10,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}P.rust(c,W,H,r,10);P.grime(c,W,H,r,.8)},{tile:.14,r:.8,m:.2})
})[k]());

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
function build(){if(CACHE)return CACHE;const b=K.builder('meat2veg'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),rnd=b.rnd,conc=surf('concrete'),dark=K.mat(0x1a1a1c,.5);
 const Wn=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 const WINS=[-16.4,-14.8,-13.2,-9.4,-7.8,-6.2,-4.6,4.6,6.2,7.8,9.4,13.2,14.8,16.4];
 const FRONT=[...Wn(WINS),{k:'d',c:-.65},{k:'d',c:.65}];
 const BACK=[{k:'g',c:4.4},{k:'g',c:6.0},{k:'d',c:16,s:-1}];
 /* ---------- ground ---------- */
 b.box(40,.06,2.5,conc,[0,.03,16.75],null,0);for(let x=-19.5;x<20;x+=1.5)b.box(.02,.062,2.48,K.mat(0x8a8880,.8),[x,.031,16.75],null,0);b.box(40,.16,.2,conc,[0,.08,17.95],null,0);
 b.box(40,.025,10.0,surf('asphalt'),[0,.012,-12.95],null,0);for(const s of[-1,1])b.box(.6,.025,23.6,surf('asphalt'),[s*19.7,.012,3.7],null,0);
 b.box(9,.012,.12,K.mat(0xf2c418,.6),[7.8,.03,-12.2],null,0);for(const x of[3.4,8.4])b.box(.12,.012,4,K.mat(0xf2c418,.6),[x,.03,-10.2],null,0);
 for(const [x,z] of[[-6,-12],[2,-14],[12,-11]])b.label(1.5,1.5,K.paint('mv_stain',128,128,(c,W,H)=>{c.clearRect(0,0,W,H);const g=c.createRadialGradient(64,64,4,64,64,60);g.addColorStop(0,'rgba(8,6,4,.55)');g.addColorStop(1,'rgba(8,6,4,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},{alpha:true}),[x,.029,z],[-PI/2,0,0]);
 /* ---------- facade: stucco skin, stone pilasters, cornice, entrance tower ---------- */
 const stu=surf('stucco'),ston=surf('stone'),wb=surf('wbrick');
 const skin=(ax,f,a0,a1,n,ops,mat)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1,m,dep)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(.15+dep/2),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,m,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,m,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,mat,.03);if(y0<.6&&mat===stu)pc(u0,u1,y0,Math.min(.6,y1),ston,.07)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:p.k==='g'?.8:.65;span(a,p.c-hw,0,H);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,H)}else span(p.c-hw,p.c+hw,p.k==='g'?2.5:2.4,H);a=p.c+hw}span(a,a1,0,H)};
 skin(1,Z1,X0,X1,1,FRONT,stu);skin(1,Z0,X0,X1,-1,BACK,wb);skin(0,X0,Z0,Z1,-1,[],wb);skin(0,X1,Z0,Z1,1,[],wb);
 // parapet + metal cap all round, raised over the facade
 for(const [ax,f,a0,a1,n,m,hh] of[[1,Z1,X0,X1,1,stu,.8],[1,Z0,X0,X1,-1,wb,.4],[0,X0,Z0,Z1,-1,wb,.4],[0,X1,Z0,Z1,1,wb,.4]]){const L=a1-a0+.4,u=(a0+a1)/2;if(ax){b.box(L,hh,.36,m,[u,H+hh/2,f],null,0);b.box(L+.06,.1,.5,K.mat(0x7a7e82,.4,.6),[u,H+hh+.05,f],null,.01)}else{b.box(.36,hh,L,m,[f,H+hh/2,u],null,0);b.box(.5,.1,L+.06,K.mat(0x7a7e82,.4,.6),[f,H+hh+.05,u],null,.01)}}
 b.box(38.2,.12,23.2,K.surf('concrete',0x5a5a58),[0,H+.02,3.7],null,0);b.box(38,.02,23,K.mat(0x34363a,.9),[0,H+.09,3.7],null,0);for(const [x,z] of[[-10,4],[0,-3],[10,6],[-4,9]]){b.rbox(2.0,1.0,1.4,.03,K.mat(0xb0b4b8,.4,.7),[x,H+.6,z]);b.vents(6,1.8,.7,K.mat(0x6a6c6e,.5,.6),[x,H+.6,z+.71]);b.cyl(.55,.55,.1,K.mat(0x2a2a2a,.5,.4),[x,H+1.15,z],null,20)}
 for(const x of[-18.75,-11,11,18.75]){b.box(.9,H+.95,.6,ston,[x,(H+.95)/2,Z1+.3],null,.02);b.box(1.05,.18,.75,ston,[x,H+.95,Z1+.3],null,.02);b.box(1.05,.3,.75,ston,[x,.15,Z1+.3],null,.02);S(x-.45,x+.45,Z1,Z1+.6,0,H,true)}
 // entrance tower: stone piers, stucco face, gable with a stone frame, lettering
 b.push([0,0,Z1]);for(const s of[-1,1]){b.box(1.1,8.6,.9,ston,[s*2.45,4.3,.45],null,.02);b.box(1.25,.2,1.05,ston,[s*2.45,8.65,.45],null,.02);b.box(1.25,.35,1.05,ston,[s*2.45,.18,.45],null,.02)}
 b.box(3.8,5.6,.5,stu,[0,5.6,.25],null,0);b.box(3.8,.16,.62,ston,[0,2.9,.31],null,.01);
 const gab=[[-2.0,0],[2.0,0],[0,1.9]];b.add(K.extrudeGeo(gab,.5,.02),stu,{p:[0,8.4,.25]});b.add(K.extrudeGeo([[-2.25,-.05],[2.25,-.05],[0,2.15],[-.0,2.15]],.25,.02),ston,{p:[0,8.4,.05]});for(const s of[-1,1])b.box(3.0,.22,.3,ston,[s*1.0,9.4,.55],[0,0,-s*.76],.01);
 b.label(3.6,2.3,K.paint('mv_logo',768,490,(c,W,H)=>drawLogo(c,W,H),{alpha:true,r:.5}),[0,5.1,.51]);b.pop();S(-3.0,3.0,Z1,Z1+.95,2.5,9.5,true);for(const s of[-1,1])S(s*2.45-.55,s*2.45+.55,Z1,Z1+.9,0,9,true);
 b.box(3.4,.1,1.2,K.mat(0x3a3e42,.4,.5),[0,2.75,Z1+.6],null,.01);b.label(2.6,.25,K.paint('mv_hours',512,50,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'OPEN 7 DAYS  -  7AM TO 11PM',W/2,H/2,{size:30,col:'#f4f0e0'})},{alpha:true}),[0,2.62,Z1+1.21]);
 // awnings: green striped, sloped, with a scalloped valance, between the pilasters
 for(const [a0,a1] of[[-18.3,-11.45],[-10.55,-3.0],[3.0,10.55],[11.45,18.3]]){const L=a1-a0,u=(a0+a1)/2;b.box(L,.06,1.7,surf('awning'),[u,3.75,Z1+.82],[.5,0,0],0);
  b.label(L,.32,K.paint('mv_val',512,48,(c,W,H)=>{c.clearRect(0,0,W,H);const n=16,s=W/n;for(let i=0;i<n;i++){c.fillStyle=i%2?'#1e5a1a':'#2a6a22';c.beginPath();c.moveTo(i*s,0);c.lineTo(i*s+s,0);c.lineTo(i*s+s,H*.55);c.arc(i*s+s/2,H*.55,s/2,0,PI);c.fill();if(i%2===0){c.fillStyle='rgba(180,230,80,.85)';c.fillRect(i*s+s*.38,0,s*.24,H*.7)}}},{alpha:true,r:.85}),[u,3.2,Z1+1.6]);
  for(let i=0;i<=Math.floor(L/2);i++)b.cyl(.012,.012,1.3,K.mat(0x5a5a5a,.4,.7),[a0+.2+i*(L-.4)/Math.floor(L/2),3.75,Z1+.82],[.5+PI/2,0,0],5)}
 // window trims (dark teal) + warm-lit display shelves just inside
 for(const c of WINS){b.frame(1.56,1.92,.07,K.mat(0x2a4a48,.4,.5),[c,1.825,Z1+.2],.035);b.box(1.5,.08,.4,K.mat(0x8a8a86,.6),[c,.86,Z1-.36],null,0)}
 // lamp posts (five globes), meters, newspaper box
 const lampPost=(x,z)=>{const m=K.mat(0x2a3a38,.4,.6),glo=K.mat(0xf4f4f0,.2,0,{emissive:0xfff6e0,emissiveIntensity:.6});b.push([x,0,z]);b.cyl(.28,.32,.5,m,[0,.25,0],null,12);b.cyl(.18,.24,.5,m,[0,.7,0],null,12);b.cyl(.07,.1,3.2,m,[0,2.5,0],null,10);for(let k=0;k<4;k++)b.tor(.08,.02,m,[0,1.2+k*.6,0],[PI/2,0,0],null,10);
  b.sph(.17,glo,[0,4.45,0]);for(let k=0;k<4;k++){const a=k*PI/2+PI/4;b.tube([[0,3.9,0],[Math.cos(a)*.3,3.95,Math.sin(a)*.3],[Math.cos(a)*.42,4.1,Math.sin(a)*.42]],.025,m,10,5);b.sph(.15,glo,[Math.cos(a)*.42,4.24,Math.sin(a)*.42]);b.cyl(.05,.07,.06,m,[Math.cos(a)*.42,4.1,Math.sin(a)*.42],null,8)}b.pop();S(x-.32,x+.32,z-.32,z+.32,0,4.5,true)};
 for(const x of[-14.4,-6.6,6.6,14.4])lampPost(x,17.25);
 for(const x of[-3.4,10.2]){b.push([x,0,17.5]);b.cyl(.035,.035,1.1,K.mat(0x3a3a3a,.4,.6),[0,.55,0],null,8);b.rbox(.16,.26,.12,.04,K.mat(0x4a4c50,.4,.5),[0,1.22,0]);b.add(K.sphGeo(.09,12,6,0,PI/2),K.glass(0xcfe6ee,.45),{p:[0,1.35,0]});b.pop();S(x-.1,x+.1,17.4,17.6,0,1.4,true)}
 b.push([-3.6,0,15.95]);b.rbox(.5,.95,.45,.03,K.mat(0x1a4ea8,.45,.3),[0,.6,0]);b.box(.4,.3,.02,K.glass(0xcfe6ee,.4),[0,.85,.23],null,0);b.label(.38,.28,K.paint('mv_paper',160,120,(c,W,H)=>{c.fillStyle='#e8e4d8';c.fillRect(0,0,W,H);P.text(c,'THE GAZETTE',W/2,16,{size:16,col:'#111'});P.text(c,'NATIONAL',W/2,46,{size:20,col:'#111'});P.text(c,'GUARD CALLED',W/2,72,{size:20,col:'#111'});c.fillStyle='#999';c.fillRect(10,90,W-20,20)}),[0,.85,.215]);b.label(.4,.12,K.paint('mv_paperlbl',160,48,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);P.text(c,'50c',W/2,H/2,{size:30,col:'#1a4ea8'})}),[0,1.18,.228]);for(const s of[-.2,.2])b.box(.05,.15,.05,K.mat(0x3a3a3a,.4,.6),[s,.07,0],null,0);b.pop();S(-3.85,-3.35,15.72,16.18,0,1.1,true);
 /* ---------- back: loading dock, bumpers, the burnt box truck, a fire barrel ---------- */
 for(const x of[5.2,10.2]){b.box(3.6,.12,.18,K.mat(0x8a8a86,.6),[x,2.56,Z0-.25],null,0);for(const s of[-1,1]){b.rbox(.3,.45,.18,.03,K.rubber(),[x+s*1.85,.75,Z0-.25]);b.box(.12,2.5,.12,K.mat(0xf2c418,.6),[x+s*1.75,1.25,Z0-.22],null,.01)}b.box(3.0,.06,.6,K.tri('mv_diamond',(c,W,H,r)=>{c.fillStyle='#8a8e92';c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.35)';for(let y=0;y<H;y+=24)for(let xx=(y/24%2)*12;xx<W;xx+=24){c.save();c.translate(xx,y);c.rotate(.6);c.fillRect(-8,-2,16,4);c.restore()}},{tile:.4,r:.4,m:.7}),[x,.06,Z0+.45],null,.01)}
 const shut=K.surf('rollshutter',0x2a5a7a,{m:.4});b.box(3.2,2.5,.06,shut,[10.2,1.25,Z0-.2],null,0);b.rbox(3.6,.5,.5,.06,K.mat(0x6a7a86,.4,.6),[10.2,2.8,Z0-.35]);b.rbox(3.6,.5,.5,.06,K.mat(0x6a7a86,.4,.6),[5.2,2.8,Z0-.35]);
 for(let i=0;i<4;i++)b.box(3.2,.1,.04,shut,[5.2,2.52+i*.07,Z0-.2],null,0);S(8.6,11.8,Z0-.3,Z0-.1,0,2.5,true);
 b.label(.9,.24,K.paint('mv_dock',300,80,(c,W,H)=>{c.fillStyle=YEL;c.fillRect(0,0,W,H);P.text(c,'DOCK 1    DOCK 2',W/2,H/2,{size:34,col:'#1a1a1a'})}),[7.7,3.4,Z0-.2],[0,PI,0]);
 // box truck, burnt out, at dock 2
 b.push([10.4,0,-12.6],[0,PI,0]);const bt=surf('burnt'),tyre=K.rubber();b.rbox(2.3,2.4,4.6,.05,bt,[0,1.85,-1.0]);b.box(2.32,.12,4.6,K.mat(0x2a2a2a,.6),[0,.6,-1.0],null,0);
 b.add(K.extrudeGeo([[2.4,.55],[2.45,1.15],[2.25,1.45],[1.75,2.4],[1.25,2.45],[1.25,.55]],2.1,.05),K.surf('rust',0x2a2624,{m:.2}),{r:[0,PI/2,0]});b.add(K.extrudeGeo([[2.22,1.48],[1.76,2.32],[1.62,2.32],[2.08,1.48]],1.96,0),K.mat(0x0a0a0a,.9),{r:[0,PI/2,0]});
 for(const [wx,wz] of[[-1.0,1.8],[1.0,1.8],[-1.0,-2.4],[1.0,-2.4],[-.75,-2.4],[.75,-2.4]]){b.cyl(.4,.4,.28,tyre,[wx,.4,wz],[0,0,PI/2],18);b.cyl(.22,.22,.29,K.mat(0x3a3a3a,.6,.5),[wx,.4,wz],[0,0,PI/2],10)}
 b.label(4.0,2.0,K.paint('mv_scorch',512,256,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<20;i++){const g=c.createRadialGradient(W*.2+r()*W*.5,H*.3+r()*H*.6,4,W*.3,H*.5,80+r()*90);g.addColorStop(0,'rgba(5,5,5,.7)');g.addColorStop(1,'rgba(5,5,5,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}},{alpha:true}),[0,.032,0],[-PI/2,0,0]);b.pop();S(9.2,11.6,-15.2,-9.8,0,3.0,true);
 b.push([7.3,0,-10.4]);b.cyl(.29,.29,.88,K.surf('rust',0xa82a1a,{m:.4}),[0,.44,0],null,18,true);b.cyl(.28,.28,.02,K.mat(0x1a1210,.9),[0,.7,0],null,16);for(let i=0;i<6;i++)b.box(.05,.4,.05,K.mat(0x2a1a10,.9),[(rnd()-.5)*.3,.82,(rnd()-.5)*.3],[rnd()-.5,0,rnd()-.5],0);
 b.pop();S(7.0,7.6,-10.7,-10.1,0,1.0,true);
 b.label(.5,.62,K.paint('mv_nopark',160,200,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle=RED;c.lineWidth=5;c.strokeRect(5,5,W-10,H-10);P.text(c,'NO',W/2,44,{size:44,col:RED});P.text(c,'PARKING',W/2,96,{size:30,col:RED});P.text(c,'LOADING',W/2,140,{size:26,col:RED});P.text(c,'ZONE',W/2,172,{size:26,col:RED})},{r:.5}),[-2,1.8,Z0-.19],[0,PI,0]);
 /* ---------- interior: floors, linings, ceiling, lights ---------- */
 b.box(37.7,.02,16.6,surf('floor'),[0,.035,6.85],null,0);b.box(34.0,.02,6.2,surf('conc'),[1.8,.035,-4.75],null,0);b.box(3.4,.02,6.2,surf('floor'),[-17.2,.035,-4.75],null,0);
 b.box(37.7,.04,22.8,surf('ceil'),[0,CEIL+.02,3.7],null,0);
 const wl=surf('wall'),wai=surf('wains'),tealCap=K.mat(0x2a6a64,.4,.4),bw=K.mat(0xc8c8c4,.85);
 const lineWall=(ax,f,a0,a1,n,th,ops,style)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);
  const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(th/2+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{if(style==='back'){pc(u0,u1,y0,y1,wb,.012,.006);return}if(y0<1.1)pc(u0,u1,y0,Math.min(1.1,y1),wai,.025,.012);if(y0<=1.1&&y1>=1.16)pc(u0,u1,1.1,1.16,tealCap,.05,.025);if(y1>1.1)pc(u0,u1,Math.max(1.12,y0),y1,wl,.012,.006)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:p.k==='g'?.8:.65;span(a,p.c-hw,0,CEIL);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,CEIL)}else span(p.c-hw,p.c+hw,p.k==='g'?2.5:2.4,CEIL);a=p.c+hw}span(a,a1,0,CEIL)};
 lineWall(1,Z1,X0,X1,-1,.3,FRONT);lineWall(0,X0,ZB,Z1,1,.3);lineWall(0,X1,ZB,Z1,-1,.3);lineWall(1,ZB,X0,X1,1,.16,[{k:'d',c:3.35},{k:'d',c:4.65},{k:'d',c:-12}]);
 lineWall(1,ZB,-15.5,X1,-1,.16,[{k:'d',c:3.35},{k:'d',c:4.65},{k:'d',c:-12}],'back');lineWall(1,Z0,-15.5,X1,1,.3,BACK,'back');lineWall(0,X1,Z0,ZB,-1,.3,null,'back');lineWall(0,-15.5,Z0,ZB,1,.16,Dr([-4.6]),'back');
 lineWall(0,-15.5,Z0,ZB,-1,.16,Dr([-4.6]),'back');lineWall(1,Z0,X0,-15.5,1,.3,null,'back');lineWall(0,X0,Z0,ZB,1,.3,null,'back');lineWall(1,ZB,X0,-15.5,-1,.16,Dr([-12]).filter(()=>false),'back');
 const lit=K.mat(0xffffff,.4,0,{emissive:0xf4f8ff,emissiveIntensity:.95}),hous=K.mat(0xd8d8d4,.5,.2);
 for(let x=-16;x<18;x+=3.6)for(const z of[0.8,4.4,8,11.6,14.2]){b.box(1.25,.06,.62,hous,[x,CEIL-.03,z],null,.01);b.box(1.15,.012,.52,lit,[x,CEIL-.065,z],null,0)}
 for(let x=-12;x<18;x+=5)b.box(2.0,.012,.2,lit,[x,CEIL-.03,-4.8],null,0);
 /* ---------- checkout lanes ---------- */
 const cw=surf('counterW'),belt=K.mat(0x141414,.6),stM=K.mat(0xb8bcc0,.35,.6);
 const ropeM=K.mat(0xc8202a,.5),postM=K.mat(0xc8ccd0,.25,.9);
 const post=(x,z)=>{b.cyl(.025,.025,.95,postM,[x,.48,z],null,10);b.sph(.04,postM,[x,.98,z]);b.cyl(.13,.15,.04,postM,[x,.02,z],null,16)};
 const rope=(a,c)=>{b.tube([[a[0],.9,a[1]],[(a[0]+c[0])/2,.62,(a[1]+c[1])/2],[c[0],.9,c[1]]],.018,ropeM,16,6)};
 for(let i=0;i<5;i++){const x=-15.4+i*2.7,z0=7.2;b.push([x,0,z0]);
  b.box(.85,.92,3.6,cw,[0,.46,0],null,.01);b.box(.9,.06,3.65,stM,[0,.95,0],null,.01);b.box(.62,.02,2.0,belt,[0,.99,.6],null,0);for(const s of[-1,1])b.box(.04,.04,2.0,stM,[s*.33,1.0,.6],null,0);
  b.box(.62,.08,.5,K.mat(0x2a2c2e,.4,.5),[0,.96,-.55],null,.01);b.box(.4,.02,.3,K.glass(0x8aa8c8,.5),[0,1.005,-.55],null,0);b.box(.7,.12,.9,stM,[0,.9,-1.3],null,.01);b.box(.6,.02,.8,K.mat(0x8a8c8e,.4,.6),[0,.85,-1.3],null,0);
  b.push([.32,.98,-.2],[0,-PI/2,0]);b.rbox(.42,.12,.38,.02,K.mat(0xc8c8c4,.4,.4),[0,.06,0]);b.rbox(.36,.2,.22,.02,K.mat(0xd8d8d4,.4,.4),[0,.2,-.06],[-.3,0,0]);for(let k=0;k<16;k++)b.box(.04,.02,.035,K.mat(k%4===3?0xc41a1a:0x3a8a4a,.5),[-.1+(k%4)*.07,.29-Math.floor(k/4)*.025,-Math.floor(k/4)*.04],[-.3,0,0],0);b.cyl(.012,.012,.2,chrome,[.15,.3,-.15],null,6);b.rbox(.18,.06,.03,.005,blk,[.15,.42,-.15]);b.pop();
  b.cyl(.025,.025,1.1,chrome,[-.38,1.5,-.9],null,8);b.label(.3,.3,K.paint('mv_lane'+i,96,96,(c,W,H)=>{c.fillStyle=GRN;c.beginPath();c.arc(W/2,H/2,44,0,PI*2);c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.stroke();P.text(c,String(i+1),W/2,H/2+3,{size:56,col:'#fff'})},{glow:.4}),[-.38,2.15,-.9],[0,PI/2,0]);
  if(rnd()<.6)b.rbox(.4,.3,.25,.04,K.paint('mv_bag',96,96,(c,W,H,r)=>{c.fillStyle='#b88a5a';c.fillRect(0,0,W,H);for(let k=0;k<20;k++){c.fillStyle='rgba(90,60,30,.15)';c.fillRect(0,r()*H,W,1)}}),[0,1.12,.3+rnd()*.6],[0,rnd(),0]);
  b.pop();S(x-.45,x+.45,z0-1.8,z0+1.8,0,1.0);post(x+.9,z0+1.7);post(x+2.3,z0+1.7);rope([x+.9,z0+1.7],[x+2.3,z0+1.7]);if(i<4){post(x+.9,z0+.2);rope([x+.9,z0+.2],[x+.9,z0+1.7])}}
 b.label(4.5,1.2,K.paint('mv_banner',768,206,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle=RED;c.beginPath();c.moveTo(0,20);c.quadraticCurveTo(W/2,60,W,20);c.lineTo(W,H-20);c.quadraticCurveTo(W/2,H+20,0,H-20);c.fill();c.fillStyle='#1a3a8a';c.beginPath();c.moveTo(20,40);c.quadraticCurveTo(W/2,78,W-20,40);c.lineTo(W-20,H-40);c.quadraticCurveTo(W/2,H,20,H-40);c.fill();
  c.fillStyle='#fff';for(let i=0;i<14;i++){const x=40+i*52;c.beginPath();for(let k=0;k<10;k++){const a=k*PI/5-PI/2,rr=k%2?5:12;c.lineTo(x+Math.cos(a)*rr,32+Math.sin(a)*rr+Math.sin(i/13*PI)*14)}c.fill()}P.text(c,'SAVINGS SPREE!',W/2,H*.56,{size:80,col:'#fff',stroke:'#0a1a4a',lw:6})},{alpha:true,r:.7}),[-8,3.0,10.2]);b.cyl(.006,.006,.8,blk,[-10,3.4,10.2],null,4);b.cyl(.006,.006,.8,blk,[-6,3.4,10.2],null,4);
 /* ---------- shopping carts (our own wire carts) ---------- */
 const wire=K.mat(0xc8ccd0,.3,.8),hdl=K.mat(0xf2a020,.5);
 const cart=(x,z,ry,tip)=>{b.push([x,tip?.45:0,z],[tip?PI/2:0,ry,0]);
  b.push([0,.55,0]);const L=.9,W=.55,Hh=.45;for(let i=0;i<=8;i++){const t=-L/2+i*L/8;for(const s of[-1,1])b.box(.008,Hh,.008,wire,[s*W/2,Hh/2,t],null,0)}for(let i=0;i<=5;i++){const t=-W/2+i*W/5;b.box(.008,Hh,.008,wire,[t,Hh/2,L/2],null,0);b.box(.008,Hh*1.1,.008,wire,[t,Hh/2,-L/2-.05],[-.15,0,0],0)}
  for(let k=0;k<=3;k++){const y=k*Hh/3;for(const s of[-1,1])b.box(.008,.008,L,wire,[s*W/2,y,0],null,0);b.box(W,.008,.008,wire,[0,y,L/2],null,0);b.box(W,.008,.008,wire,[0,y,-L/2],null,0)}for(let i=0;i<=6;i++)b.box(.006,.006,L,wire,[-W/2+i*W/6,0,0],null,0);b.pop();
  b.box(.6,.035,.035,hdl,[0,1.05,-.58],null,0);for(const s of[-1,1])b.cyl(.012,.012,.55,wire,[s*.28,.78,-.52],[-.25,0,0],6);
  for(const s of[-1,1]){b.cyl(.012,.012,.7,wire,[s*.22,.22,0],[PI/2,0,0],6);b.cyl(.012,.012,.55,wire,[s*.22,.4,-.4],[.6,0,0],6)}for(const [wx,wz] of[[-.22,.32],[.22,.32],[-.22,-.32],[.22,-.32]]){b.cyl(.05,.05,.03,K.rubber(),[wx,.05,wz],[0,0,PI/2],12);b.box(.03,.06,.03,wire,[wx,.09,wz],null,0)}
  b.pop();S(x-.4,x+.4,z-.55,z+.55,0,1.0,true)};
 for(let i=0;i<5;i++)cart(-17.6,10.4+i*.42,PI,false);cart(-13.6,12.6,.7,false);cart(-10.6,12.0,2.2,true);cart(-17.2,13.6,-1.2,true);cart(-4.2,11.4,-.4,false);
 /* ---------- produce stands (our own), with fruit and veg ---------- */
 const crateW=K.surf('wood',0x9a6a3a),veg=[[0xe8701a,'carrot'],[0x4aa82a,'pea'],[0xc8202a,'apple'],[0xf2d020,'lemon'],[0x6a3a8a,'aubergine'],[0x3a8a2a,'lettuce'],[0xa86a2a,'potato'],[0xe84a1a,'tomato']];
 const stand=(x,z,ry)=>{b.push([x,0,z],[0,ry,0]);b.box(2.4,.7,1.2,crateW,[0,.35,0],null,.02);for(const s of[-1,1])b.box(2.4,.3,.6,crateW,[0,.85+(s>0?0:.2),s*.3],[s*-.25,0,0],.02);
  for(let k=0;k<6;k++){const cx=-.9+(k%3)*.9,cz=Math.floor(k/3)?-.3:.3,yy=Math.floor(k/3)?1.15:.95,[col,kind]=veg[(k+Math.round(x))%8];b.box(.8,.05,.5,K.mat(0x7a5a3a,.8),[cx,yy,cz],[cz>0?.25:-.25,0,0],0);
   for(let q=0;q<9;q++){const px=cx-.3+(q%3)*.3,pz=cz-.15+Math.floor(q/3)*.15;if(kind==='carrot')b.cyl(.02,.005,.18,K.mat(col,.6),[px,yy+.05,pz],[0,0,PI/2],6);else if(kind==='lettuce')b.add(K.sphGeo(.09,10,6),K.mat(col,.7),{p:[px,yy+.07,pz],s:[1,.8,1]});else if(kind==='aubergine')b.add(K.sphGeo(.05,10,6),K.mat(col,.2,.1),{p:[px,yy+.05,pz],s:[1,1,2]});else b.add(K.sphGeo(kind==='potato'?.05:.045,10,6),K.mat(col,kind==='apple'||kind==='tomato'?.25:.6),{p:[px,yy+.05,pz]})}}
  b.label(.5,.25,K.paint('mv_price'+Math.round(x),160,80,(c,W,H)=>{c.fillStyle=YEL;c.fillRect(0,0,W,H);P.text(c,['59c/lb','2 FOR $1','99c','FRESH!'][Math.abs(Math.round(x))%4],W/2,H/2,{size:30,col:RED})}),[0,.5,.605]);b.pop();S(x-1.25,x+1.25,z-.65,z+.65,0,1.2,true)};
 stand(5.2,13.2,0);stand(8.2,13.2,0);stand(14.6,13.2,0);stand(11.6,10.2,PI);
 /* ---------- deli counter with lit meat case ---------- */
 b.push([12.4,0,ZB+1.25]);b.box(8.6,.7,.95,cw,[0,.35,0],null,.01);b.box(8.6,.06,1.0,stM,[0,.72,0],null,.01);
 b.add(K.extrudeGeo([[-.5,0],[.5,0],[.5,.06],[-.1,.62],[-.5,.62]],8.5,0),K.glass(0xdfeff4,.25),{p:[0,.75,0],r:[0,PI/2,0]});b.box(8.5,.02,.9,K.mat(0xf4f4f0,.3,0,{emissive:0xffe8d8,emissiveIntensity:.25}),[0,.77,0],null,0);
 for(let i=0;i<22;i++){const x=-4.0+i*.38;b.rbox(.3,.04,.22,.01,K.mat(0xd8d8d0,.4),[x,.8,(i%2?-.15:.15)]);if(rnd()<.7)b.add(K.sphGeo(.1,10,6),K.mat([0xb8282a,0xc84a4a,0xe8c8b0,0x9a3a2a][i%4],.4),{p:[x,.83,(i%2?-.15:.15)],s:[1.3,.35,1]})}
 b.box(8.6,.9,.04,K.mat(0x7a7c7e,.4,.6),[0,1.6,-.55],null,0);b.label(2.6,.7,K.paint('mv_meat',512,138,(c,W,H)=>{c.fillStyle='#f4f0e4';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,16);c.fillRect(0,H-16,W,16);drawSteak(c,70,H/2,1.2);P.text(c,'BUTCHER & DELI',W*.6,H/2,{size:52,col:'#3a1a10'})},{r:.5}),[0,2.7,-.3]);
 b.rbox(.4,.25,.3,.02,K.mat(0xd8d8d4,.4,.3),[2.8,.87,.25]);b.rbox(.3,.04,.25,.01,K.mat(0xc8ccd0,.3,.8),[2.8,1.01,.25]);b.rbox(.15,.12,.03,.01,K.mat(0x1a1a1a,.4),[2.8,1.1,.4]);b.pop();S(8.05,16.75,ZB+.75,ZB+1.75,0,1.4);
 b.push([4,0,ZB+.25]);b.label(1.0,.26,K.paint('mv_staff',300,78,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'EMPLOYEES ONLY',W/2,H/2,{size:30,col:'#fff'})}),[0,2.7,.0]);b.pop();
 /* ---------- coffee station against the back wall ---------- */
 b.push([X0+.55,0,1.0],[0,PI/2,0]);b.box(3.0,.9,.75,K.mat(0xe8e4d8,.5),[0,.45,0],null,.01);b.box(3.0,.12,.78,K.mat(0x2a2218,.5),[0,.6,.0],null,0);b.box(3.05,.05,.8,K.surf('concrete',0x8a8478),[0,.93,0],null,.01);
 for(const s of[-.7,.2]){b.rbox(.42,.55,.4,.01,K.mat(0x1a1a1c,.4,.2),[s,1.23,-.1]);b.lathe([[0,0],[.06,0],[.075,.04],[.08,.09],[.06,.14],[0,.15]],K.glass(0x3a2210,.55),[s,.96,.05],16)}b.rbox(.3,.4,.3,.02,K.mat(0xc8261c,.4),[1.0,1.15,-.1]);for(let i=0;i<4;i++)b.cyl(.04,.035,.11,K.mat(0xf4f4f0,.4),[1.1+i*.0,1.0+i*.11,.2],null,10);
 b.label(1.4,.5,K.paint('mv_coffee',384,138,(c,W,H)=>{c.fillStyle='#3a2216';c.fillRect(0,0,W,H);P.text(c,'FRESH BREW',W/2,48,{size:42,col:'#f4e8c8'});P.text(c,'COFFEE  59c',W/2,100,{size:34,col:YEL})},{r:.5}),[0,2.0,-.3]);b.pop();S(X0+.15,X0+.95,-.55,2.55,0,1.0);
 // posters, wet floor sign
 const poster=(key,draw,x,y,z,ry,w,h)=>{b.label(w,h,K.paint(key,256,Math.round(256*h/w),draw,{r:.5}),[x,y,z],[0,ry,0])};
 poster('mv_p1',(c,W,H)=>{c.fillStyle='#f4f0e4';c.fillRect(0,0,W,H);P.text(c,'FARM FRESH',W/2,34,{size:34,col:GRN});drawCarrot(c,W*.35,H*.5,1.6,.3);drawPea(c,W*.66,H*.55,1.4);P.text(c,'EVERY DAY',W/2,H-30,{size:28,col:RED})},-9.0,2.4,ZB+.11,0,.7,1.0);
 poster('mv_p2',(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'MEAT',W/2,40,{size:44,col:'#fff'});drawSteak(c,W/2,H*.5,1.8);P.text(c,'PRICES SLASHED',W/2,H-30,{size:24,col:YEL})},-10.0,2.4,ZB+.11,0,.7,1.0);
 poster('mv_p3',(c,W,H)=>{c.fillStyle='#1a3a8a';c.fillRect(0,0,W,H);drawLogo(c,W,H*.5,{edge:'#fff'});P.text(c,'LOYALTY CARD',W/2,H*.7,{size:28,col:'#fff'});P.text(c,'ASK AT CHECKOUT',W/2,H*.86,{size:20,col:YEL})},X1-.17,2.4,6.0,-PI/2,.7,1.0);
 b.push([6.5,0,2.4],[0,.5,0]);const wf=K.paint('mv_wet',128,256,(c,W,H)=>{c.fillStyle='#f2c12e';c.fillRect(0,0,W,H);P.text(c,'!',W/2,90,{size:60,col:'#1a1a1a'});P.text(c,'CAUTION',W/2,170,{size:24,col:'#1a1a1a'});P.text(c,'WET FLOOR',W/2,206,{size:20,col:'#1a1a1a'})},{r:.4});for(const s of[-1,1])b.add(K.rboxGeo(.3,.62,.012,.004,1),wf,{p:[0,.3,s*.1],r:[-s*.18,s>0?0:PI,0]});b.pop();
 /* ---------- back of house: pallets of sacks, milk crates, restroom ---------- */
 const pallet=(x,z,ry,n)=>{b.push([x,0,z],[0,ry,0]);const pw=surf('pallet');for(let i=0;i<5;i++)b.box(1.2,.02,.14,pw,[0,.13,-.45+i*.225],null,0);for(const s of[-.5,0,.5])b.box(.1,.1,1.0,pw,[s,.07,0],null,0);
  for(let k=0;k<n;k++){const y=.17+Math.floor(k/3)*.16,cx=-.35+(k%3)*.35;const sm=K.paint('mv_sk'+(k%2),128,192,(c,W,H,r)=>{c.fillStyle='#ecebe6';c.fillRect(0,0,W,H);c.fillStyle=k%2?'#3aa83a':'#7a3a9a';c.beginPath();c.moveTo(0,H*.3);c.lineTo(W,H*.15);c.lineTo(W,H*.55);c.lineTo(0,H*.7);c.fill();P.text(c,k%2?'FLOUR':'FEED',W/2,H*.82,{size:24,col:'#333'})},{r:.85});b.add(K.rboxGeo(.34,.14,.62,.05,2),sm,{p:[cx,y,0],r:[0,(rnd()-.5)*.2,0]})}b.pop();S(x-.65,x+.65,z-.65,z+.65,0,.6,true)};
 pallet(-13.6,-6.8,0,9);pallet(-12.2,-5.2,.2,7);pallet(-10.4,-6.9,0,6);pallet(-1,-5.0,0,8);
 const crate=(x,y,z,col)=>{const m=K.mat(col,.6);b.push([x,y,z],[0,(rnd()-.5)*.3,0]);for(const [w,d,px,pz] of[[.4,.02,0,-.17],[.4,.02,0,.17],[.02,.36,-.2,0],[.02,.36,.2,0]])b.box(w,.28,d,m,[px,.15,pz],null,0);b.box(.4,.02,.36,m,[0,.01,0],null,0);for(let k=0;k<4;k++)b.box(.4,.012,.012,m,[0,.06+k*.06,-.17],null,0);b.pop()};
 for(let i=0;i<4;i++)crate(-7.2,i*.3,-7.4,[0x2a3a9a,0xc41a1a,0x2a3a9a,0xf2a020][i]);for(let i=0;i<3;i++)crate(-6.6,i*.3,-7.5,[0xc41a1a,0x2a3a9a,0x2a8a3a][i]);S(-7.5,-6.3,-7.8,-7.0,0,1.2,true);
 const por=K.mat(0xf4f4f0,.2);b.push([-17.8,0,-7.4]);b.lathe([[0,0],[.18,0],[.2,.1],[.22,.4],[0,.4]],por,[0,0,0],18);b.rbox(.4,.4,.2,.03,por,[0,.6,-.25]);b.cyl(.2,.2,.03,K.mat(0x1a1a1a,.4),[0,.42,0],null,18);b.pop();
 b.push([-16.4,0,-7.65]);b.rbox(.5,.18,.4,.03,por,[0,.85,.1]);b.tube([[0,.95,-.05],[0,1.1,-.05],[0,1.08,.1]],.008,chrome,10,6);b.plane(.5,.7,K.mat(0xd8e2e6,.03,1),[0,1.55,.02]);b.pop();
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bMeat2Veg(x,z,t){
 const B=mk(x,z,40,36,H,0xb8b2a8,0xd8c0b0,0x3a4a52);B.dx=0;const PT={th:.16,c:0xc8c8c4};
 WL(B,1,Z1,X0,X1,[...wins([-16.4,-14.8,-13.2,-9.4,-7.8,-6.2,-4.6,4.6,6.2,7.8,9.4,13.2,14.8,16.4]),{k:'d',c:-.65},{k:'d',c:.65}],H);
 WL(B,1,Z0,X0,X1,[{k:'g',c:4.4},{k:'g',c:6.0},{k:'d',c:16,s:-1}],H);WL(B,0,X0,Z0,Z1,[],H);WL(B,0,X1,Z0,Z1,[],H);
 WL(B,1,ZB,X0,X1,[{k:'d',c:3.35},{k:'d',c:4.65},{k:'d',c:-12}],H,PT);WL(B,0,-15.5,Z0,ZB,[{k:'d',c:-4.6}],H,PT);
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);try{if(window.MFZFIRE)MFZFIRE.addLocal(B,7.3,.9,-10.4,.7)}catch(e){}   /* v076: fire barrel */
 const ry=a=>B.cs>0?a:a+PI,SP=(lx,lz,name,table,a,y0)=>{try{if(window.spawnPropContainer)spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,ry(a),y0||0);else cont(B,table||'supermarket',lx,lz)}catch(e){}};
 // gondola aisles (lootable shelves), chest freezers, wall coolers, outdoor drinks machines, stock-room boxes, prep table
 for(let r=0;r<5;r++)for(let k=0;k<2;k++)SP(-15.0+r*3.0,.3+k*2.57,r%2?'shop_shelves_half':'shop_shelves_full','supermarket',PI/2);
 for(let r=0;r<2;r++)for(let k=0;k<3;k++)SP(3.8+k*2.6+r*.0,4.6+r*2.4,k===1&&r===1?'chest_freezer_empty':'chest_freezer_full','supermarket',r?PI:0);
 for(let i=0;i<7;i++)SP(18.4,1.6+i*.76,i===3?'freezer_upright':'drinks_cooler','supermarket',-PI/2);
 SP(-17.7,16.0,'vending_blitz','convenience',0);SP(17.7,16.0,'vending_polar','convenience',0);
 SP(-4.2,-7.3,'pallet_racking','supermarket',0);SP(.2,-7.3,'pallet_racking','supermarket',0);SP(-3,-5.6,'cardboard_box_large','supermarket',0);SP(-2,-5.4,'cardboard_box_medium','supermarket',0);SP(1.5,-5.5,'cardboard_box_medium','supermarket',0);SP(14,-7.4,'prep_table','butcher',0);SP(18.3,-3.6,'freezer_upright','butcher',-PI/2);SP(18.3,-4.5,'freezer_upright','butcher',-PI/2);
 rc(B,'supermarket',[-8,2,-7.6,-2.4],1);
 buildings.push({x:WX(B,0),z:WZ(B,3.7),w:38,d:23.4,t:t.id});
 for(const [px,pz] of[[-9,8],[2,6],[10,3],[-14,3],[6,-5],[-12,-4],[3,-12]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));
 LASTB=B;return B}

if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='food_library'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
const e=NEWCAT.find(d=>d.id==='food_library');
if(e){e.name='Meat & 2 Veg';e.build=bMeat2Veg;e.note='full-block supermarket: checkouts, aisles, freezers, produce, deli, stock room, loading dock'}
if(typeof NOYARD!=='undefined')NOYARD.add('food_library');window.bMeat2Veg=bMeat2Veg;window.MEAT2VEG={build};
console.log('[supermarket] Meat & 2 Veg ready');
})();
