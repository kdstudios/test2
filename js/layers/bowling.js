/* ==========================================================================================================
   MINI FORT ZOMBIE - GUTTER MINDS BOWLING (v072): a full-block bowling alley (40 x 36 m plot, front = +Z), our own design.
   Exterior: a 38 x 22 m red-brown brick box with a rounded teal coping, a green awning with a yellow valance over glass double doors,
   two ribbons of warm-lit windows, a rooftop sign (bowling ball, two pins, GUTTER MINDS on lettered discs, BOWLING ribbon) on a steel
   frame, parking meters and street lights on the sidewalk, a service lot behind (stalls, patched asphalt, rusty pickup, white van,
   blue dumpster, back doors, NO PARKING signs, dirt verge).
   Interior: eight maple lanes (arrows, dots, foul lines, gutters, cappings) running to pin decks with full racks of pins (a few
   knocked down), a masking wall numbered 1-8 with lit ad panels and pinsetters behind, four ball returns with hoods and racks of
   balls, overhead score monitors, green settees and tables, a rail; window booths; house-ball racks and arcade cabinets; front desk
   with register and a shoe-cubby wall; snack bar (black rounded top, orange base, register, warmers, tray) with a kitchen behind
   (fryers, grill, popcorn machine, coolers, menu board); café tables with red gingham cloths and wooden chairs; restrooms.
   Walls are white-painted brick with red and blue stripes, the floor is blue patterned carpet, the ceiling an exposed deck with
   long fluorescent fixtures. Structure from core WL (doors / windows work); detail is our own geometry and painted artwork.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[bowling] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const X0=-19,X1=19,Z0=-7,Z1=15.4,H=5.0,CEIL=4.0;
const RED='#d8202a',BLU='#1a4ea8',NAVY='#1a2a6a',YEL='#ffd23a';
const LANE0=-6.3,PAIRW=3.6,LANEW=1.07,GUT=.24,FOUL=0,PINX=-17.3,MASKX=-16.6;
// lane centres (8 lanes in 4 pairs)
const LANES=[];for(let p=0;p<4;p++){const z0=LANE0+p*(PAIRW+.2);LANES.push(z0+GUT+LANEW/2,z0+GUT*3+LANEW*1.5+.5)}
const PAIRS=[0,1,2,3].map(p=>LANE0+p*(PAIRW+.2)+PAIRW/2);

/* ===================== artwork ===================== */
function drawBall(c,x,y,r){const g=c.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);g.addColorStop(0,'#9ac8ff');g.addColorStop(.5,'#2a6ad0');g.addColorStop(1,'#0a2a6a');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,PI*2);c.fill();
 c.fillStyle='#0a1430';for(const [dx,dy,rr] of[[-.12,-.38,.1],[.12,-.38,.1],[0,-.12,.12]]){c.beginPath();c.arc(x+dx*r,y+dy*r,rr*r,0,PI*2);c.fill()}}
function drawPin(c,x,y,h,rot){c.save();c.translate(x,y);c.rotate(rot||0);const w=h*.36;c.fillStyle='#f4f4f0';c.strokeStyle='#9a9a9a';c.lineWidth=h*.02;c.beginPath();c.moveTo(-w*.35,h*.5);c.bezierCurveTo(-w*.65,h*.2,-w*.55,0,-w*.2,-h*.15);c.bezierCurveTo(-w*.1,-h*.25,-w*.38,-h*.45,0,-h*.5);c.bezierCurveTo(w*.38,-h*.45,w*.1,-h*.25,w*.2,-h*.15);c.bezierCurveTo(w*.55,0,w*.65,h*.2,w*.35,h*.5);c.closePath();c.fill();c.stroke();
 c.fillStyle=RED;c.fillRect(-w*.24,-h*.22,w*.48,h*.035);c.fillRect(-w*.22,-h*.15,w*.44,h*.035);c.restore()}
function discText(c,s,x,y,r,cols){for(let i=0;i<s.length;i++){if(s[i]===' ')continue;const cx=x+i*r*2.05;c.fillStyle='#fff';c.beginPath();c.arc(cx,y,r*1.08,0,PI*2);c.fill();c.fillStyle=cols[i%cols.length];c.beginPath();c.arc(cx,y,r,0,PI*2);c.fill();
 c.fillStyle='#fff';c.font=`bold ${r*1.35}px 'MFZ Head'`;c.textAlign='center';c.textBaseline='middle';c.fillText(s[i],cx,y+r*.06)}}
function drawLogo(c,W,H){c.clearRect(0,0,W,H);const r=H*.085,s='GUTTER MINDS',x0=W/2-(s.length-1)*r*2.05/2;
 drawPin(c,W*.62,H*.36,H*.62,.45);drawPin(c,W*.72,H*.42,H*.55,.8);drawBall(c,W*.46,H*.33,H*.26);
 discText(c,s,x0,H*.7,r,[RED,BLU]);c.fillStyle=NAVY;P.rrect(c,W*.3,H*.84,W*.4,H*.13,H*.05);c.fill();P.text(c,'B O W L I N G',W/2,H*.905,{size:H*.09,col:'#fff'})}
const adTex=(i)=>K.paint('gm_ad'+i,320,200,(c,W,H,r)=>{const bg=['#c8261c','#f2c418','#1a1a2a','#e8e4d8','#2a7a3a','#1a4ea8','#f4f0e8','#7a1a5a'][i];c.fillStyle=bg;c.fillRect(0,0,W,H);
 if(i===0){P.text(c,'BLITZ',W/2,80,{size:72,col:'#fff',font:"'MFZ Head'"});P.text(c,'COLA',W/2,140,{size:48,col:YEL})}
 else if(i===1){c.fillStyle='#c8802a';c.beginPath();c.arc(W/2,H/2+10,70,0,PI*2);c.fill();c.fillStyle='#d83a2a';for(let k=0;k<7;k++){c.beginPath();c.arc(W/2+Math.cos(k)*40,H/2+10+Math.sin(k*1.7)*40,10,0,PI*2);c.fill()}P.text(c,'PIZZA NITE',W/2,26,{size:34,col:'#c8261c'})}
 else if(i===2){c.fillStyle='#c8261c';c.beginPath();c.moveTo(40,140);c.lineTo(80,100);c.lineTo(220,96);c.lineTo(280,130);c.lineTo(280,150);c.lineTo(40,150);c.fill();c.fillStyle='#111';c.beginPath();c.arc(90,152,16,0,PI*2);c.arc(240,152,16,0,PI*2);c.fill();P.text(c,'MOTORVILLE',W/2,40,{size:34,col:'#fff'})}
 else if(i===3){c.fillStyle='#222';c.fillRect(80,50,160,100);c.fillStyle='#6ab0e8';c.fillRect(88,58,144,84);P.text(c,'BIG SCREEN SALE',W/2,176,{size:28,col:'#1a1a1a'})}
 else if(i===4){drawBall(c,90,100,50);P.text(c,'LEAGUE',210,80,{size:40,col:'#fff'});P.text(c,'NIGHTS',210,124,{size:40,col:YEL})}
 else if(i===5){P.text(c,'COSMIC',W/2,70,{size:56,col:'#ff5ad8'});P.text(c,'BOWL',W/2,130,{size:56,col:'#5affe8'});P.text(c,'FRI 9PM',W/2,178,{size:24,col:'#fff'})}
 else if(i===6){P.text(c,'POLAR',W/2,80,{size:60,col:'#1e5aa8'});P.text(c,'POP',W/2,140,{size:60,col:'#5ab0e8'})}
 else {drawPin(c,W/2,H/2,140,0);P.text(c,'STRIKE!',W/2,180,{size:30,col:YEL})}
 c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6);P.noise(c,W,H,r,400,.08,'#fff')},{glow:.6,r:.4});

const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 brick:()=>K.tri('gm_brick',(c,W,H,r)=>{c.fillStyle='#6a5048';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2;c.fillStyle=`hsl(${8+r()*10},${32+r()*14}%,${30+r()*12}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4)}P.noise(c,W,H,r,8000,.2,'#1a0e0a',1.6);P.grime(c,W,H,r,.6)},{tile:.38,r:.9}),
 wbrick:()=>K.tri('gm_wbrick',(c,W,H,r)=>{c.fillStyle='#b8b8b4';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2;c.fillStyle=`hsl(40,${4+r()*3}%,${88+r()*6}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4)}P.grime(c,W,H,r,.25)},{tile:.38,r:.8}),
 carpet:()=>K.tri('gm_carpet',(c,W,H,r)=>{c.fillStyle='#2a3a6a';c.fillRect(0,0,W,H);P.noise(c,W,H,r,30000,.35,'#4a5a9a',1.3);P.noise(c,W,H,r,20000,.3,'#1a2448',1.3);
  for(let i=0;i<14;i++){c.strokeStyle=['rgba(220,60,80,.5)','rgba(240,210,60,.45)','rgba(90,200,230,.45)'][i%3];c.lineWidth=3;c.beginPath();const x=r()*W,y=r()*H;c.arc(x,y,6+r()*10,0,PI*2);c.stroke()}for(let i=0;i<10;i++){c.fillStyle='rgba(240,210,60,.35)';c.save();c.translate(r()*W,r()*H);c.rotate(r()*3);c.fillRect(-14,-2,28,4);c.fillRect(-2,-14,4,28);c.restore()}},{tile:.9,r:.95}),
 maple:()=>K.tri('gm_maple',(c,W,H,r)=>{const n=16,s=W/n;for(let i=0;i<n;i++){c.fillStyle=`hsl(${32+r()*6},${44+r()*12}%,${62+r()*10}%)`;c.fillRect(i*s,0,s,H);for(let k=0;k<8;k++){c.fillStyle='rgba(140,90,40,.12)';c.fillRect(i*s+r()*s,0,1,H)}c.fillStyle='rgba(90,60,30,.35)';c.fillRect(i*s,0,1,H)}c.fillStyle='rgba(255,255,255,.08)';c.fillRect(0,0,W,H)},{tile:.62,r:.18}),
 approach:()=>K.tri('gm_appr',(c,W,H,r)=>{const n=16,s=W/n;for(let i=0;i<n;i++){c.fillStyle=`hsl(${30+r()*6},${40+r()*12}%,${58+r()*10}%)`;c.fillRect(i*s,0,s,H);c.fillStyle='rgba(90,60,30,.35)';c.fillRect(i*s,0,1,H)}P.scratches(c,W,H,r,40,'rgba(80,50,20,.25)')},{tile:.62,r:.4}),
 gutter:()=>K.mat(0x2a2c30,.3,.6),
 capping:()=>K.mat(0x9a9894,.4,.3),
 ceil:()=>K.tri('gm_deck',(c,W,H,r)=>{c.fillStyle='#d4d6d8';c.fillRect(0,0,W,H);for(let y=0;y<H;y+=24){c.fillStyle='rgba(60,60,64,.35)';c.fillRect(0,y,W,8)}P.grime(c,W,H,r,.4)},{tile:.5,r:.85}),
 asphalt:()=>K.surf('asphalt',0x3a3c40),concrete:()=>K.surf('concrete',0xb0aea6),dirt:()=>K.surf('dirt',0x5a4632),
 coping:()=>K.mat(0x2a6a64,.4,.5),
 vinylG:()=>K.tri('gm_vinyl',(c,W,H,r)=>{c.fillStyle='#1e6a3a';c.fillRect(0,0,W,H);for(let i=0;i<8;i++){const g=c.createLinearGradient(0,i*H/8,0,(i+1)*H/8);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=g;c.fillRect(0,i*H/8,W,H/8)}P.scratches(c,W,H,r,40,'rgba(200,255,220,.25)')},{tile:.5,r:.35}),
 table:()=>K.veneer(0xc8a070,{tile:.8}),
 gingham:()=>K.tri('gm_ging',(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);const n=16,s=W/n;for(let i=0;i<n;i++){c.fillStyle='rgba(216,40,50,.45)';c.fillRect(i*s,0,s/2,H);c.fillRect(0,i*s,W,s/2)}},{tile:.6,r:.8}),
 slat:()=>K.tri('gm_slat',(c,W,H,r)=>{const n=10,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#8a7050');g.addColorStop(.4,'#c8a878');g.addColorStop(1,'#7a6040');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.3)},{tile:.5,r:.6})
})[k]());

/* ===================== vehicles ===================== */
function pickup(b,S,x,z,ry){b.push([x,0,z],[0,ry,0]);const pm=K.surf('rust',0x1e6a64,{m:.25}),dark=K.mat(0x141416,.6),gl=K.mat(0x1e2a34,.08,.6),ty=K.rubber();
 b.add(K.extrudeGeo([[2.6,.45],[2.65,.85],[2.5,1.05],[1.5,1.15],[1.05,1.95],[-.25,1.98],[-.35,1.15],[-.4,.45]],1.9,.05),pm,{r:[0,PI/2,0]});b.add(K.extrudeGeo([[1.45,1.18],[1.02,1.88],[.92,1.88],[1.32,1.18]],1.78,0),gl,{r:[0,PI/2,0]});for(const s of[-1,1])b.box(.02,.5,.9,gl,[s*.96,1.55,.45],null,0);
 b.box(1.9,.1,2.3,pm,[0,.55,-1.65],null,.02);for(const s of[-1,1])b.box(.08,.6,2.3,pm,[s*.91,.85,-1.65],null,.02);b.box(1.9,.6,.08,pm,[0,.85,-2.78],null,.02);b.box(1.9,.06,.08,pm,[0,1.17,-.42],null,.01);
 b.box(1.96,.2,.16,K.mat(0xb8bcc0,.3,.8),[0,.5,2.66],null,.04);b.box(1.96,.18,.14,dark,[0,.45,-2.86],null,.03);for(const s of[-1,1]){b.box(.3,.16,.04,K.mat(0xf4f0e0,.2,.3),[s*.65,.92,2.66],null,.01);b.box(.12,.3,.04,K.mat(0xb01818,.3),[s*.85,.95,-2.84],null,.01)}
 for(const [wx,wz] of[[-.86,1.75],[.86,1.75],[-.86,-1.75],[.86,-1.75]]){b.cyl(.38,.38,.26,ty,[wx,.38,wz],[0,0,PI/2],18);b.cyl(.22,.22,.27,K.mat(0x8a8c8e,.4,.7),[wx,.38,wz],[0,0,PI/2],12);b.add(new T.CylinderGeometry(.45,.45,.14,16,1,true,0,PI),dark,{p:[wx*1.03,.38,wz],r:[0,0,PI/2]})}
 b.pop();const sw=Math.abs(Math.sin(ry))>.5;S(x-(sw?2.9:1.05),x+(sw?2.9:1.05),z-(sw?1.05:2.9),z+(sw?1.05:2.9),0,2.0,true)}

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
function build(){if(CACHE)return CACHE;const b=K.builder('guttermind'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),rnd=b.rnd,conc=surf('concrete'),dark=K.mat(0x1a1a1c,.5);
 const Wn=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 const WINL=[-17.6,-16.0,-14.4,-12.8,-10.0,-8.4,-6.8,-5.2,-2.4,-.8],WINR=[13.9,15.5,17.1];
 const FRONT=[...Wn(WINL),{k:'d',c:9.4},{k:'d',c:10.7},...Wn(WINR)];
 /* ---------- ground: sidewalk in front, service lot behind ---------- */
 b.box(40,.06,2.5,conc,[0,.03,16.75],null,0);for(let x=-19.5;x<20;x+=1.5)b.box(.02,.062,2.48,K.mat(0x8a8880,.8),[x,.031,16.75],null,0);b.box(40,.16,.2,conc,[0,.08,17.95],null,0);
 b.box(40,.025,10.6,surf('asphalt'),[0,.012,-12.6],null,0);b.box(40,.03,.5,surf('dirt'),[0,.015,-17.75],null,0);b.box(.5,.03,10.6,surf('dirt'),[-19.75,.015,-12.6],null,0);b.box(.5,.03,10.6,surf('dirt'),[19.75,.015,-12.6],null,0);
 b.box(40,.025,.6,surf('asphalt'),[0,.012,-7.1],null,0);for(const s of[-1,1])b.box(.6,.025,22.4,surf('asphalt'),[s*19.7,.012,4.2],null,0);
 const wl=K.mat(0xeeeee4,.7);for(let i=0;i<6;i++)b.box(.1,.012,5,wl,[4+i*2.8,.03,-10.2],null,0);b.box(.1,.012,1.6,K.mat(0xf2c418,.6),[2.6,.03,-8.4],[0,.7,0],0);
 for(const [x,z,s] of[[-8,-12,2.2],[-2,-15,1.8],[10,-14.5,1.6],[-14,-10,1.4]])b.label(s*1.6,s,K.paint('gm_patch',192,128,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(40,40,42,.85)';c.beginPath();for(let a=0;a<PI*2;a+=.4)c.lineTo(W/2+Math.cos(a)*(60+r()*30),H/2+Math.sin(a)*(36+r()*20));c.fill();c.strokeStyle='rgba(15,15,15,.7)';c.lineWidth=3;c.stroke()},{alpha:true}),[x,.028,z],[-PI/2,0,rnd()*3]);
 for(const [x,z] of[[6,-10.5],[12,-11],[-6,-9]])b.label(1.3,1.3,K.paint('gm_stain',128,128,(c,W,H)=>{c.clearRect(0,0,W,H);const g=c.createRadialGradient(64,64,4,64,64,60);g.addColorStop(0,'rgba(8,6,4,.55)');g.addColorStop(1,'rgba(8,6,4,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},{alpha:true}),[x,.029,z],[-PI/2,0,0]);
 /* ---------- exterior skin: brick, plinth, rounded teal coping ---------- */
 const brk=surf('brick');
 const skin=(ax,f,a0,a1,n,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1,mat,dep)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(.15+dep/2),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,brk,.03);if(y0<.5)pc(u0,u1,y0,Math.min(.5,y1),K.surf('brick',0x5a3a30),.06)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,0,H);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,H)}else span(p.c-hw,p.c+hw,2.4,H);a=p.c+hw}span(a,a1,0,H);
  const L=a1-a0+.7,u=(a0+a1)/2,o=f+n*.25;if(ax){b.box(L,.5,.42,brk,[u,H+.25,f+n*.0],null,0);b.add(K.cylGeo(.26,.26,L,14,false),surf('coping'),{p:[u,H+.55,f+n*.06],r:[0,0,PI/2],s:[1,1,.8]})}else{b.box(.42,.5,L,brk,[f,H+.25,u],null,0);b.add(K.cylGeo(.26,.26,L,14,false),surf('coping'),{p:[f+n*.06,H+.55,u],r:[PI/2,0,0],s:[.8,1,1]})}};
 skin(1,Z1,X0,X1,1,FRONT);skin(1,Z0,X0,X1,-1,Dr([4.5,18]));skin(0,X0,Z0,Z1,-1);skin(0,X1,Z0,Z1,1);
 // window trims (aluminium) and a soldier course over each ribbon
 for(const c of[...WINL,...WINR]){b.frame(1.56,1.92,.06,K.mat(0xb8bcc0,.35,.8),[c,1.825,Z1+.2],.03)}for(const [a0,a1] of[[-18.4,-12],[-10.8,-4.4],[-3.2,0],[13.1,17.9]])b.box(a1-a0,.18,.06,K.surf('brick',0x7a4a3a),[(a0+a1)/2,2.86,Z1+.21],null,0);
 b.box(38.6,.1,22.8,K.surf('concrete',0x4a4a48),[0,H+.04,4.2],null,0);b.box(38.2,.02,22.4,K.mat(0x3a3a3c,.9),[0,H+.1,4.2],null,0);
 for(const [x,z] of[[-10,0],[0,6],[10,-2]]){b.rbox(2.2,1.1,1.6,.03,K.mat(0xb0b4b8,.4,.7),[x,H+.65,z]);b.vents(7,2.0,.8,K.mat(0x6a6c6e,.5,.6),[x,H+.65,z+.81]);b.cyl(.6,.6,.1,K.mat(0x2a2a2a,.5,.4),[x,H+1.25,z],null,20)}
 // awning: green barrel canopy + yellow valance, on teal posts, over the doors
 const awG=K.tri('gm_awn',(c,W,H,r)=>{c.fillStyle='#1e5a3a';c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.fillStyle='rgba(0,0,0,.12)';c.fillRect(r()*W,0,2,H)}P.grime(c,W,H,r,.6)},{tile:.5,r:.8});
 b.push([10.05,0,Z1+1.15]);b.add(new T.CylinderGeometry(1.15,1.15,5.4,20,1,true,0,PI),awG,{p:[0,2.98,-1.15],r:[0,0,PI/2],s:[.75,1,1]});b.add(new T.CircleGeometry(1.15,20,0,PI),awG,{p:[-2.7,2.98,-1.15],r:[0,-PI/2,0],s:[1,.75,1]});b.add(new T.CircleGeometry(1.15,20,0,PI),awG,{p:[2.7,2.98,-1.15],r:[0,PI/2,0],s:[1,.75,1]});b.box(5.4,.38,.04,K.mat(0xf2c418,.5),[0,2.82,.02],null,.01);b.box(.04,.38,1.1,K.mat(0xf2c418,.5),[-2.7,2.82,-.55],null,0);b.box(.04,.38,1.1,K.mat(0xf2c418,.5),[2.7,2.82,-.55],null,0);
 for(const x of[-2.5,2.5]){b.box(.16,2.66,.16,K.mat(0x2a5a54,.4,.5),[x,1.33,-.1],null,.02);b.box(.26,.1,.26,K.mat(0x2a5a54,.4,.5),[x,.05,-.1],null,.01)}b.pop();S(7.4,7.7,Z1+.9,Z1+1.2,0,2.7,true);S(12.4,12.7,Z1+.9,Z1+1.2,0,2.7,true);
 b.label(2.6,.3,K.paint('gm_hours',512,60,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'OPEN 10AM - 2AM  -  SHOE RENTAL  -  LEAGUES',W/2,H/2,{size:30,col:NAVY})},{alpha:true}),[10.05,2.82,Z1+1.19]);
 // rooftop sign on a steel frame
 b.push([9.0,H+.1,Z1-.4]);const fr=K.mat(0x5a5c60,.5,.6);for(const x of[-2.6,0,2.6]){b.box(.12,2.0,.12,fr,[x,1.0,-.5],null,.01);b.box(.1,2.4,.1,fr,[x,1.0,-1.4],[.5,0,0],0)}b.box(6.0,.1,.1,fr,[0,1.95,-.5],null,0);
 b.label(7.8,4.0,K.paint('gm_logo',1024,525,(c,W,H)=>drawLogo(c,W,H),{alpha:true,glow:.35,r:.4}),[0,2.6,-.38]);b.label(7.8,4.0,K.paint('gm_logo_back',1024,525,(c,W,H)=>{c.translate(W,0);c.scale(-1,1);drawLogo(c,W,H)},{alpha:true,r:.5}),[0,2.6,-.42],[0,PI,0]);
 b.add(K.sphGeo(.92,28,18),K.paint('gm_ballsw',512,256,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1a4ea8');g.addColorStop(.5,'#5a9ae8');g.addColorStop(1,'#0a2a6a');c.fillStyle=g;c.fillRect(0,0,W,H);for(let i=0;i<30;i++){c.strokeStyle=`rgba(${180+r()*60},${210+r()*40},255,.25)`;c.lineWidth=4+r()*8;c.beginPath();c.moveTo(r()*W,r()*H);c.bezierCurveTo(r()*W,r()*H,r()*W,r()*H,r()*W,r()*H);c.stroke()}
  c.fillStyle='#0a1430';for(const [x,y,rr] of[[.48,.3,10],[.52,.3,10],[.5,.4,12]]){c.beginPath();c.arc(x*W,y*H,rr,0,PI*2);c.fill()}},{r:.15,m:.1}),{p:[-.31,3.28,-.1],r:[0,PI*.2,0]});
 b.pop();
 // sidewalk: parking meters, street lights (arms out over the road)
 for(const x of[-11,-3,6.4,15.2]){b.push([x,0,17.55]);b.cyl(.035,.035,1.1,K.mat(0x3a3a3a,.4,.6),[0,.55,0],null,8);for(const s of[-.1,.1]){b.rbox(.15,.24,.11,.04,K.mat(0x4a4c50,.4,.5),[s,1.22,0]);b.add(K.sphGeo(.08,12,6,0,PI/2),K.glass(0xcfe6ee,.45),{p:[s,1.34,0]});b.label(.06,.04,K.mat(0x1a3a5a,.4,0,{emissive:0x2a6a9a,emissiveIntensity:.5}),[s,1.24,-.056],[0,PI,0])}b.box(.32,.04,.06,K.mat(0x3a3a3a,.4,.6),[0,1.1,0],null,0);b.pop();S(x-.18,x+.18,17.45,17.65,0,1.4,true)}
 const lightPole=(x,z)=>{const m=K.mat(0xb8bcc0,.35,.7);b.push([x,0,z]);b.rbox(.45,.6,.45,.04,m,[0,.3,0]);b.cyl(.09,.14,8.8,m,[0,4.4,0],null,12);b.tube([[0,8.5,0],[0,8.9,-.5],[0,8.9,-2.2]],.05,m,12,6);b.cyl(.025,.025,1.8,m,[0,8.2,-.9],[1.15,0,0],6);
  for(let i=0;i<4;i++)b.cyl(.01,.01,.35,m,[0,8.62,-.3-i*.32],[.6*(i%2?1:-1),0,0],4);b.rbox(.4,.14,.75,.05,m,[0,8.85,-2.5]);b.box(.3,.02,.55,K.mat(0xffffff,.4,0,{emissive:0xfff2d0,emissiveIntensity:.8}),[0,8.77,-2.5],null,0);b.pop();S(x-.23,x+.23,z-.23,z+.23,0,8.8,true)};
 // street lights face the street: build with arm toward -z then flip
 for(const x of[-16,1,17.4])lightPole(x,17.55);
 // service lot: no-parking signs on the back wall, pickup, van, dumpster (lootable, placed at build)
 for(const x of[-12,-4])b.label(.5,.62,K.paint('gm_nopark',160,200,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle=RED;c.lineWidth=5;c.strokeRect(5,5,W-10,H-10);P.text(c,'NO',W/2,44,{size:44,col:RED});P.text(c,'PARKING',W/2,96,{size:30,col:RED});P.text(c,'FIRE LANE',W/2,146,{size:24,col:RED})},{r:.5}),[x,1.8,Z0-.19],[0,PI,0]);
 pickup(b,S,8.2,-10.0,PI);const NB=window.NUTBOLT;if(NB&&NB.van)NB.van(b,S,11.0,-10.4,PI);
 b.label(.9,.24,K.paint('gm_deliv',300,80,(c,W,H)=>{c.fillStyle=YEL;c.fillRect(0,0,W,H);P.text(c,'DELIVERIES',W/2,H/2,{size:40,col:'#1a1a1a'})}),[18,2.75,Z0-.19],[0,PI,0]);
 /* ---------- interior: floor, walls, ceiling, lights ---------- */
 b.box(37.7,.02,22.1,surf('carpet'),[0,.034,4.2],null,0);b.box(37.7,.06,22.1,surf('ceil'),[0,CEIL+.03,4.2],null,0);
 const wb=surf('wbrick'),sR=K.mat(0xd8202a,.5),sB=K.mat(0x1a2a8a,.5);
 const lineWall=(ax,f,a0,a1,n,th,ops,plain)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);
  const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(th/2+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,wb,.012,.006);if(plain)return;for(const [a,bb,m] of[[1.15,1.55,sB],[1.7,1.82,sR],[2.42,2.5,sR]])if(y0<=a&&y1>=bb)pc(u0,u1,a,bb,m,.02,.012)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,0,CEIL);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,CEIL)}else span(p.c-hw,p.c+hw,2.4,CEIL);a=p.c+hw}span(a,a1,0,CEIL)};
 lineWall(1,Z1,X0,X1,-1,.3,FRONT);lineWall(1,Z0,X0,X1,1,.3,Dr([4.5,18]));lineWall(0,X0,Z0,Z1,1,.3);lineWall(0,X1,Z0,Z1,-1,.3);
 lineWall(1,-3.6,7,13,1,.16,Dr([8.6,11.4]));lineWall(0,13,Z0,1.6,-1,.16);lineWall(0,13,Z0,1.6,1,.16,null,1);lineWall(0,10,Z0,-3.6,-1,.16,null,1);lineWall(0,10,Z0,-3.6,1,.16,null,1);lineWall(1,-3.6,7,13,-1,.16,Dr([8.6,11.4]),1);
 const hous=K.mat(0xd8d8d4,.5,.3),lit=K.mat(0xffffff,.4,0,{emissive:0xf4f8ff,emissiveIntensity:.95});
 for(let x=-15;x<18;x+=4.2)for(const z of[-4.6,-.4,3.8,8,12.2]){b.box(3.0,.14,.42,hous,[x,CEIL-.35,z],null,.02);b.box(2.9,.012,.3,lit,[x,CEIL-.425,z],null,0);for(const e of[-1.2,1.2])b.cyl(.006,.006,.3,blk,[x+e,CEIL-.13,z],null,4)}
 /* ---------- lanes ---------- */
 const map=surf('maple'),app=surf('approach'),gut=surf('gutter'),cap=surf('capping');
 const LL=FOUL-PINX+.6;                                                    // lane bed length (foul line to the pit)
 b.box(22.45,.04,15.4,K.mat(0x4a3a2a,.6),[-7.6,.04,LANE0+7.5],null,0);           // subfloor under the lane bank
 for(const lz of LANES){b.box(LL,.04,LANEW,map,[(PINX-.6+FOUL)/2,.07,lz],null,0);b.box(3.6,.04,LANEW+GUT*2,app,[FOUL+1.8,.07,lz],null,0);
  for(const s of[-1,1])b.add(new T.CylinderGeometry(GUT/2,GUT/2,LL,10,1,true,PI/2,PI),gut,{p:[(PINX-.6+FOUL)/2,.09,lz+s*(LANEW/2+GUT/2)],r:[0,0,PI/2]});
  b.box(.05,.004,LANEW+GUT*2,K.mat(0x1a1a1a,.5),[FOUL,.093,lz],null,0);                                                                          // foul line
  for(let i=-3;i<=3;i++){const ax=FOUL-4.4-Math.abs(i)*.35;b.add(K.extrudeGeo([[0,0],[.09,.025],[.09,-.025]],.003,0),K.mat(0x3a1a10,.5),{p:[ax,.093,lz+i*.13],r:[PI/2,0,PI]})}  // arrows
  for(let i=-2;i<=2;i++)b.cyl(.012,.012,.003,K.mat(0x3a1a10,.5),[FOUL-2.1,.093,lz+i*.2],null,8);for(let i=-2;i<=2;i++)b.cyl(.012,.012,.003,K.mat(0x3a1a10,.5),[FOUL+1.2,.093,lz+i*.2],null,8);
  // pin deck + pins (a few lanes with knocked-down pins)
  b.box(1.2,.05,LANEW,K.veneer(0xd8b888,{tile:.6}),[PINX,.075,lz],null,0);b.box(.6,.3,LANEW+GUT*2,K.mat(0x0a0a0a,.9),[PINX-.95,-.05,lz],null,0);
  const knock=rnd()<.4;let n=0;for(let row=0;row<4;row++)for(let k=0;k<=row;k++){const px=PINX+.42-row*.26,pz=lz+(k-row/2)*.3;n++;
   if(knock&&rnd()<.45){b.lathe([[0,0],[.026,0],[.06,.08],[.06,.13],[.032,.22],[.022,.26],[.034,.32],[.03,.37],[0,.38]],K.mat(0xf4f4f0,.25),[px+(rnd()-.5)*.3,.13,pz+(rnd()-.5)*.3],10,[0,rnd()*6,PI/2])}
   else{b.lathe([[0,0],[.026,0],[.06,.08],[.06,.13],[.032,.22],[.022,.26],[.034,.32],[.03,.37],[0,.38]],K.mat(0xf4f4f0,.25),[px,.1,pz],12);b.cyl(.024,.024,.012,K.mat(0xc8202a,.4),[px,.37,pz],null,10);b.cyl(.022,.022,.012,K.mat(0xc8202a,.4),[px,.395,pz],null,10)}}}
 for(let p=0;p<4;p++){const z0=LANE0+p*(PAIRW+.2);b.box(LL,.12,.5,cap,[(PINX-.6+FOUL)/2,.1,z0+GUT*2+LANEW+.25],null,0);if(p<3)b.box(LL+3.6,.12,.2,cap,[(PINX-.6+FOUL+3.6)/2,.1,z0+PAIRW+.1],null,0)}
 b.box(LL+3.6,.12,.2,cap,[(PINX-.6+FOUL+3.6)/2,.1,LANE0-.1],null,0);b.box(LL+3.6,.12,.2,cap,[(PINX-.6+FOUL+3.6)/2,.1,LANE0+4*(PAIRW+.2)-.1],null,0);
 // masking wall with numbers + ad panels; pinsetter cabinets behind
 const ZL0=LANE0-.2,ZL1=LANE0+4*(PAIRW+.2);
 b.box(.2,2.6,ZL1-ZL0,K.tri('gm_mask',(c,W,H,r)=>{const n=10,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#a8885a');g.addColorStop(.5,'#c8a878');g.addColorStop(1,'#9a7a4a');c.fillStyle=g;c.fillRect(i*s,0,s,H)}P.grime(c,W,H,r,.3)},{tile:.4,r:.6}),[MASKX,2.3,(ZL0+ZL1)/2],null,0);
 b.box(.24,.12,ZL1-ZL0,K.mat(0x3a2a1a,.5),[MASKX+.02,1.0,(ZL0+ZL1)/2],null,0);S(MASKX-.12,MASKX+.12,ZL0,ZL1,1.0,3.6,true);S(X0,MASKX-.1,ZL0,ZL1,0,3.6,true);
 LANES.forEach((lz,i)=>{b.label(.34,.34,K.paint('gm_num'+i,96,96,(c,W,H)=>{c.fillStyle='#2a4ec8';P.rrect(c,4,4,W-8,H-8,8);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();P.text(c,String(i+1),W/2,H/2+2,{size:62,col:'#fff'})},{glow:.4}),[MASKX+.105,1.5,lz],[0,PI/2,0]);
  b.rbox(.06,.9,1.3,.02,K.mat(0x4a3a2a,.5),[MASKX+.12,2.75,lz]);b.label(1.2,.8,adTex(i),[MASKX+.155,2.75,lz],[0,PI/2,0])});
 for(const lz of LANES){b.rbox(1.6,2.2,1.1,.03,K.mat(0x2a2c30,.5,.5),[MASKX-1.1,2.1,lz]);b.box(.04,.4,.9,K.mat(0x8a2a1a,.5,.4),[MASKX-.28,1.4,lz],null,0)}
 // ball returns: hood at the approach + oval rack with balls; score monitors overhead
 const ballCols=[0x1a4ea8,0xc8202a,0x2a8a3a,0xf2a020,0x6a2a9a,0x1a1a1a,0xd8d8d8,0xe85ab0];
 PAIRS.forEach((pz,p)=>{const rz=pz;b.push([FOUL+.6,.1,rz]);b.rbox(.9,.55,.5,.12,K.mat(0xc8b090,.4,.2),[0,.4,0]);b.add(new T.CylinderGeometry(.22,.22,.52,14,1,true,0,PI),K.mat(0x0a0a0a,.8),{p:[.45,.25,0],r:[0,0,PI/2]});b.box(.92,.06,.52,K.mat(0x3a3a3a,.4,.6),[0,.7,0],null,.01);
   b.add(K.extrudeGeo([[0,-.32],[2.0,-.32],[2.2,0],[2.0,.32],[0,.32]],.18,.02),K.mat(0xd8d0c0,.4,.2),{p:[1.05,.15,0],r:[PI/2,0,0]});b.box(1.9,.05,.32,K.mat(0x1a1a1a,.6),[1.95,.25,0],null,.01);for(const s of[-.19,.19])b.cyl(.025,.025,1.9,chrome,[1.95,.3,s],[0,0,PI/2],8);
   for(let k=0;k<4;k++)b.sph(.11,K.mat(ballCols[(p*3+k)%8],.12,.15),[1.25+k*.3,.38,0]);b.pop();S(FOUL+.1,FOUL+3.4,rz-.36,rz+.36,0,.8);
  // overhead score monitors (one per lane), hung from the deck
  b.push([FOUL+1.2,CEIL-1.15,rz]);for(const s of[-1,1]){b.rbox(.08,.6,1.0,.02,blk,[0,0,s*.9]);b.label(.94,.54,K.paint('gm_score'+((p*2+(s>0?1:0))%4),384,220,(c,W,H,r)=>{c.fillStyle='#0a1a3a';c.fillRect(0,0,W,H);c.fillStyle='#2a4ec8';c.fillRect(0,0,W,30);P.text(c,'LANE '+(p*2+(s>0?2:1)),W/2,16,{size:20,col:'#fff'});
    for(let row=0;row<3;row++){const y=46+row*58;P.text(c,['BOB','ZED','MAX','SUE','KAT','LOU'][(p+row*2+(s>0?1:0))%6],34,y+16,{size:18,col:YEL,align:'left'});for(let f=0;f<10;f++){c.strokeStyle='#5a7ac8';c.lineWidth=1.5;c.strokeRect(86+f*29,y,29,40);P.text(c,['X','9/','7','8/','X','6','X','9','8/','X'][(f+row+p)%10],100+f*29,y+12,{size:12,col:'#fff'});if(f<6)P.text(c,String((f+1)*(17+row*3+p)),100+f*29,y+30,{size:12,col:'#9af'})}}},{glow:.7}),[.045,0,s*.9],[0,PI/2,0])}
   b.cyl(.02,.02,1.1,blk,[0,.85,0],null,6);b.box(.06,.06,2.0,blk,[0,.3,0],null,0);b.pop()});
 // settees (green curved benches) + tables per pair, the rail
 const vin=surf('vinylG');
 PAIRS.forEach(pz=>{b.push([5.3,0,pz]);for(const s of[-1,1]){b.rbox(.6,.45,1.5,.05,K.mat(0x3a3c40,.5,.3),[0,.225,s*.95],[0,s*.35,0]);b.rbox(.56,.12,1.45,.05,vin,[0,.5,s*.95],[0,s*.35,0]);b.rbox(.14,.6,1.48,.05,vin,[.27,.85,s*.95],[0,s*.35,.1])}
  b.rbox(.62,.45,.9,.05,K.mat(0x3a3c40,.5,.3),[.25,.225,0]);b.rbox(.58,.12,.86,.05,vin,[.25,.5,0]);b.rbox(.14,.6,.9,.05,vin,[.52,.85,0],[0,0,.1]);
  b.rbox(.6,.04,.6,.01,surf('table'),[-.75,.72,0]);b.cyl(.03,.03,.7,chrome,[-.75,.36,0],null,8);b.cyl(.2,.2,.02,chrome,[-.75,.01,0],null,14);b.cyl(.04,.035,.12,K.paint('gm_cup',96,48,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,14,W,18)}),[-.7,.8,.12],null,12);
  b.rbox(.3,.22,.24,.03,K.mat(0x2a2c30,.4,.3),[-.75,.88,-.15],[-.4,0,0]);b.pop();S(4.8,6.0,pz-1.75,pz+1.75,0,1.2,true);S(4.25,4.85,pz-.32,pz+.32,0,.8,true)});
 const rail=K.mat(0xb8bcc0,.3,.8);b.cyl(.025,.025,15.2,rail,[6.6,1.0,(ZL0+ZL1)/2],[PI/2,0,0],8);for(let z=ZL0;z<=ZL1;z+=1.0){b.cyl(.02,.02,1.0,rail,[6.6,.5,z],null,6)}b.box(.01,.8,15.2,K.glass(0xcfe6ee,.18),[6.6,.55,(ZL0+ZL1)/2],null,0);
 S(6.55,6.65,ZL0,ZL1-2.4,0,1.05,true);
 /* ---------- window booths along the front, house-ball racks, arcade cabinets ---------- */
 const booth=(x,z)=>{b.push([x,0,z]);for(const s of[-1,1]){const bz=s*.8;b.rbox(1.45,.45,.6,.04,K.mat(0x3a3c40,.5,.3),[0,.225,bz]);b.rbox(1.4,.12,.56,.05,vin,[0,.5,bz]);b.rbox(1.42,.75,.16,.05,vin,[0,.95,bz+s*.27],[s*.08,0,0])}
  b.rbox(1.2,.04,.8,.01,surf('table'),[0,.73,0]);b.cyl(.04,.04,.7,chrome,[0,.36,0],null,8);b.cyl(.22,.22,.02,chrome,[0,.01,0],null,14);b.pop();S(x-.75,x+.75,z-1.2,z+1.2,0,1.3,true)};
 for(let i=0;i<6;i++)booth(-17.2+i*2.6,13.7);
 const ballRack=(x,z)=>{b.push([x,0,z]);for(const s of[-.9,.9])b.box(.06,1.3,.5,K.mat(0x3a3c40,.4,.6),[s,.65,0],null,0);for(let k=0;k<3;k++){const y=.35+k*.42;b.box(1.8,.04,.12,chrome,[0,y,-.12],null,0);b.box(1.8,.04,.12,chrome,[0,y,.12],null,0);for(let i=0;i<7;i++)if(rnd()<.85)b.sph(.11,K.mat(ballCols[(i*5+k*3)%8],.12,.15),[-.75+i*.25,y+.12,0])}b.pop();S(x-.95,x+.95,z-.3,z+.3,0,1.4,true)};
 ballRack(3.2,14.6);ballRack(5.4,14.6);ballRack(7.2,10.2);
 const arcade=(x,z,ry,i)=>{b.push([x,0,z],[0,ry,0]);const body=K.mat([0x1a1a2a,0x6a1a1a,0x1a3a6a][i],.4,.2);b.rbox(.7,1.8,.75,.02,body,[0,.9,0]);b.box(.6,.45,.02,K.mat(0x0a0a0a,.2),[0,1.35,.36],[-.15,0,0],0);
  b.label(.56,.4,K.paint('gm_arc'+i,224,160,(c,W,H,r)=>{c.fillStyle='#050510';c.fillRect(0,0,W,H);for(let k=0;k<40;k++){c.fillStyle=['#ff5ad8','#5affe8','#ffd23a'][k%3];c.fillRect(r()*W,r()*H,3,3)}c.fillStyle=['#5aff6a','#ff5a5a','#5ab0ff'][i];c.fillRect(W/2-14,H-40,28,14);P.text(c,['ZOMBIE ZAP','PIN PANIC','STAR BOWL'][i],W/2,20,{size:20,col:'#fff'});P.text(c,'INSERT COIN',W/2,H/2,{size:16,col:YEL})},{glow:.8}),[0,1.35,.375],[-.15,0,0]);
  b.box(.7,.2,.3,body,[0,1.0,.45],[.3,0,0],.02);b.cyl(.012,.012,.08,blk,[-.15,1.13,.5],null,6);b.sph(.022,K.mat(0xc8202a,.3),[-.15,1.18,.5]);for(let k=0;k<3;k++)b.cyl(.018,.018,.015,K.mat([0xc8202a,0x2a6ad8,0xf2c418][k],.3),[.03+k*.07,1.12,.48],[.3,0,0],10);
  b.label(.66,.22,K.paint('gm_marq'+i,256,84,(c,W,H)=>{c.fillStyle=['#ff5ad8','#ffd23a','#5affe8'][i];c.fillRect(0,0,W,H);P.text(c,['ZOMBIE ZAP','PIN PANIC','STAR BOWL'][i],W/2,H/2,{size:36,col:'#111'})},{glow:.6}),[0,1.68,.376]);b.box(.12,.1,.01,K.mat(0xf2c418,.3,.6),[0,.55,.376],null,0);b.pop();S(x-.4,x+.4,z-.4,z+.4,0,1.8,true)};
 arcade(-.2,14.75,PI,0);arcade(.7,14.75,PI,1);arcade(1.6,14.75,PI,2);
 /* ---------- front desk + shoe cubbies ---------- */
 const sl=surf('slat');b.box(.7,1.05,6.4,sl,[14.0,.525,9.0],null,.01);b.rbox(.9,.05,6.5,.01,K.veneer(0xc8a070,{tile:.8}),[13.95,1.07,9.0]);b.box(.04,.1,6.4,dark,[13.63,.05,9.0],null,0);S(13.6,14.4,5.8,12.2,0,1.1);
 b.push([13.95,1.095,8.0],[0,-PI/2,0]);b.rbox(.42,.12,.38,.02,K.mat(0x9a9c9e,.4,.5),[0,.06,0]);b.rbox(.36,.2,.2,.02,K.mat(0xa8aaac,.4,.5),[0,.2,-.06],[-.3,0,0]);b.cyl(.012,.012,.2,chrome,[0,.3,-.15],null,6);b.rbox(.18,.06,.03,.005,blk,[0,.42,-.15]);b.label(.16,.04,K.mat(0x3aff6a,.4,0,{emissive:0x3aff6a,emissiveIntensity:.6}),[0,.42,-.133]);b.pop();
 b.rbox(.3,.02,.22,.005,K.paint('gm_lanesheet',128,96,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle='#2a4ec8';c.fillRect(0,0,W,16);c.fillStyle='#999';for(let i=0;i<7;i++)c.fillRect(8,24+i*10,W-16,3)}),[13.9,1.105,10.5],[0,.3,0]);
 b.push([16.7,0,9.0]);b.box(.5,2.3,6.4,K.mat(0x7a5a3a,.6),[0,1.15,0],null,.01);for(let r=0;r<7;r++)for(let k=0;k<16;k++){const y=.2+r*.3,z=-3.0+k*.4;b.box(.02,.28,.39,K.mat(0x5a3a22,.6),[-.24,y+.14,z-.195],null,0);
   if(rnd()<.8){const sc=[0xc8202a,0x1a4ea8,0x2a8a3a,0xf2f2ee][(r+k)%4];b.rbox(.3,.09,.12,.03,K.mat(sc,.5),[-.12,y+.06,z-.07]);b.rbox(.3,.09,.12,.03,K.mat(sc,.5),[-.12,y+.06,z+.07])}}b.box(.02,2.15,6.4,K.mat(0x5a3a22,.6),[-.24,1.13,0],null,0);for(let r=0;r<=7;r++)b.box(.48,.02,6.4,K.mat(0x5a3a22,.6),[0,.2+r*.3,0],null,0);
 b.label(2.4,.4,K.paint('gm_shoes',512,86,(c,W,H)=>{c.fillStyle=NAVY;c.fillRect(0,0,W,H);P.text(c,'SHOE RENTAL  $2',W/2,H/2,{size:48,col:YEL})},{glow:.4}),[-.26,2.55,0],[0,-PI/2,0]);b.pop();S(16.4,17.0,5.8,12.2,0,2.4);
 b.label(3.0,.6,K.paint('gm_deskhdr',640,128,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,12);c.fillStyle=BLU;c.fillRect(0,H-12,W,12);P.text(c,'LANE CHECK-IN',W/2,H/2,{size:60,col:NAVY})},{r:.5}),[13.6,2.9,9.0],[0,-PI/2,0]);b.cyl(.01,.01,1.0,blk,[13.6,3.6,8.0],null,4);b.cyl(.01,.01,1.0,blk,[13.6,3.6,10.0],null,4);
 /* ---------- snack bar: black rounded top on an orange base; kitchen behind ---------- */
 b.push([15.3,0,2.2]);const stad=[];for(let i=0;i<=12;i++){const a=-PI/2+i*PI/12;stad.push([2.1+Math.cos(a)*.42,Math.sin(a)*.42])}for(let i=0;i<=12;i++){const a=PI/2+i*PI/12;stad.push([-2.1+Math.cos(a)*.42,Math.sin(a)*.42])}
 b.add(K.extrudeGeo(stad.map(p=>[p[0]*.94,p[1]*.8]),.9,0),K.mat(0xd8601a,.45),{p:[0,.45,0],r:[-PI/2,0,0],s:[1,1,1]});b.add(K.extrudeGeo(stad,.06,.01),K.mat(0x9a9c9e,.3,.6),{p:[0,.92,0],r:[-PI/2,0,0]});b.add(K.extrudeGeo(stad.map(p=>[p[0]*1.01,p[1]*1.04]),.04,.01),K.mat(0xb8bcc0,.3,.6),{p:[0,.97,0],r:[-PI/2,0,0]});b.add(K.extrudeGeo(stad,.03,.005),K.mat(0x121214,.2,.2),{p:[0,1.0,0],r:[-PI/2,0,0]});
 b.push([.2,1.02,0]);b.rbox(.42,.12,.38,.02,K.mat(0xc8c8c4,.4,.4),[0,.06,0]);b.rbox(.36,.2,.22,.02,K.mat(0xd8d8d4,.4,.4),[0,.2,-.06],[-.3,0,0]);for(let i=0;i<16;i++)b.box(.04,.02,.035,K.mat(i%4===3?0xc41a1a:0x3a8a4a,.5),[-.1+(i%4)*.07,.29-Math.floor(i/4)*.025,-Math.floor(i/4)*.04],[-.3,0,0],0);b.cyl(.012,.012,.2,chrome,[.15,.3,-.15],null,6);b.rbox(.18,.06,.03,.005,blk,[.15,.42,-.15]);b.pop();
 b.rbox(.5,.03,.36,.01,K.mat(0x1e8a4a,.45),[.95,1.035,.0]);for(const x of[-1.4,1.7]){b.rbox(.55,.35,.4,.02,K.mat(0x8a8c8e,.4,.7),[x,1.2,0]);b.box(.5,.25,.02,K.glass(0xffd0a0,.35),[x,1.2,.205],null,0);b.box(.48,.003,.36,K.mat(0xffb060,.4,0,{emissive:0xff8a30,emissiveIntensity:.5}),[x,1.36,0],null,0)}
 b.rbox(.4,.25,.25,.02,K.mat(0x6a6c6e,.4,.6),[-.7,1.14,.05]);b.pop();S(12.75,17.85,1.75,2.65,0,1.05);
 b.label(4.2,1.1,K.paint('gm_menu',896,236,(c,W,H,r)=>{c.fillStyle='#f4f0e4';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,40);P.text(c,'SNACK ATTACK',W/2,20,{size:30,col:'#fff'});
  const it=[['HOT DOG','1.50'],['CHILI DOG','2.25'],['NACHOS','2.75'],['PIZZA SLICE','2.00'],['FRIES','1.25'],['ONION RINGS','1.75'],['POPCORN','1.00'],['PRETZEL','1.50'],['SODA','0.99'],['SLUSH','1.25'],['COFFEE','0.75'],['CANDY','0.85']];
  it.forEach(([n,p],i)=>{const x=24+Math.floor(i/4)*290,y=66+(i%4)*42;P.text(c,n,x,y,{size:26,col:'#1a1a1a',align:'left'});P.text(c,'$'+p,x+260,y,{size:26,col:RED,align:'right',font:"'MFZ Mono'"})})},{glow:.25,r:.5}),[15.3,3.15,1.3]);b.cyl(.01,.01,.4,blk,[13.6,3.8,1.3],null,4);b.cyl(.01,.01,.4,blk,[17.0,3.8,1.3],null,4);
 // kitchen line along the back wall: fryers, flat-top, popcorn machine, prep; hood above
 const kst=K.steelBrushed();for(const [x,kind] of[[13.6,'fry'],[14.3,'fry'],[15.1,'grill'],[16.2,'prep']]){b.push([x,0,-6.4]);const w=kind==='prep'?1.4:kind==='grill'?1.0:.6;b.rbox(w,.9,.75,.01,kst,[0,.45,0]);
  if(kind==='fry'){b.box(.5,.04,.55,K.mat(0x3a2a10,.25,.2),[0,.9,0],null,0);b.box(.2,.12,.3,K.mat(0xb8bcc0,.4,.8),[0,.98,0],null,0);b.cyl(.012,.012,.3,blk,[0,1.0,.3],[PI/2-.5,0,0],8)}
  else if(kind==='grill'){b.box(.96,.03,.68,K.mat(0x1e1e1e,.35,.8),[0,.915,0],null,0);for(let i=0;i<4;i++)b.cyl(.05,.05,.015,K.mat(0x4a2414,.6),[-.3+i*.2,.94,0],null,14)}
  else{b.box(.5,.25,.35,K.mat(0xd8d8d0,.5),[-.3,1.03,0],null,.01);for(let i=0;i<5;i++)b.add(K.sphGeo(.04,10,6,0,PI/2),K.mat(0xd8902a,.55),{p:[.2+(i%3)*.12,.92,-.1+Math.floor(i/3)*.15]})}b.pop()}
 b.rbox(3.2,.6,1.0,.02,kst,[14.9,2.8,-6.4]);for(let i=0;i<5;i++)b.box(.55,.3,.02,K.mat(0x6a6c6e,.4,.8),[13.8+i*.55,2.6,-5.92],[-.6,0,0],0);S(13.25,16.95,-6.85,-6.0,0,1.0,true);
 b.push([18.4,1.0,-2.0],[0,-PI/2,0]);b.rbox(.7,.9,.55,.02,K.mat(0xc8202a,.4,.3),[0,.45,0]);b.add(new T.BoxGeometry(.62,.55,.48),K.glass(0xfff4d8,.3),{p:[0,.55,0]});for(let i=0;i<30;i++)b.add(K.sphGeo(.02,6,4),K.mat(0xfff4c8,.6),{p:[(rnd()-.5)*.5,.32+rnd()*.15,(rnd()-.5)*.38]});b.label(.6,.14,K.paint('gm_pop',256,60,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'POPCORN',W/2,H/2,{size:40,col:YEL})},{glow:.4}),[0,.95,.28]);b.pop();
 b.box(.8,1.0,1.6,kst,[18.5,.5,-2.0],null,.01);S(18.05,18.95,-2.85,-1.15,0,1.9);
 /* ---------- café: gingham tables + wooden chairs ---------- */
 const ging=surf('gingham'),chairW=K.veneer(0xb8661a,{tile:.4});
 const chair=(x,z,a)=>{b.push([x,0,z],[0,a,0]);b.box(.42,.04,.42,chairW,[0,.46,0],null,.005);for(const [px,pz] of[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]])b.box(.035,.46,.035,chairW,[px,.23,pz],null,0);for(const px of[-.18,.18])b.box(.035,.5,.035,chairW,[px,.73,-.19],null,0);
  for(let k=0;k<4;k++)b.box(.025,.42,.02,chairW,[-.12+k*.08,.72,-.19],null,0);b.box(.42,.06,.03,chairW,[0,.97,-.19],null,.005);b.pop()};
 for(const [x,z] of[[8.4,-2.0],[11.4,-2.0],[8.4,.6],[11.4,.6],[8.4,3.2],[11.4,3.2]]){b.box(1.3,.04,.85,ging,[x,.76,z],null,0);b.box(1.32,.2,.02,ging,[x,.66,z+.43],null,0);b.box(1.32,.2,.02,ging,[x,.66,z-.43],null,0);b.box(.02,.2,.85,ging,[x+.66,.66,z],null,0);b.box(.02,.2,.85,ging,[x-.66,.66,z],null,0);
  for(const s of[-.55,.55])b.box(.05,.74,.05,K.veneer(0x8a5a2a,{tile:.4}),[x+s,.37,z],null,0);for(const s of[-1,1]){chair(x-.35,z+s*.65,s>0?PI:0);chair(x+.35,z+s*.65,s>0?PI:0)}S(x-.7,x+.7,z-.45,z+.45,0,.8,true)}
 /* ---------- restrooms ---------- */
 const por=K.mat(0xf4f4f0,.2);for(const [x,t,col] of[[8.6,'MEN',BLU],[11.4,'WOMEN',RED]]){b.push([x,0,-6.4]);b.lathe([[0,0],[.18,0],[.2,.1],[.22,.4],[0,.4]],por,[0,0,0],18);b.rbox(.4,.4,.2,.03,por,[0,.6,-.25]);b.cyl(.2,.2,.03,K.mat(0x1a1a1a,.4),[0,.42,0],null,18);b.pop();
  b.push([x+(x<10?-1.0:1.0),0,-6.6]);b.rbox(.5,.18,.4,.03,por,[0,.85,.1]);b.plane(.5,.7,K.mat(0xd8e2e6,.03,1),[0,1.55,-.15]);b.pop();
  b.label(.34,.34,K.paint('gm_wc'+t,128,128,(c,W,H)=>{c.fillStyle=col;P.rrect(c,4,4,W-8,H-8,14);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(W/2,32,13,0,PI*2);c.fill();if(t==='MEN')c.fillRect(W/2-14,48,28,40);else{c.beginPath();c.moveTo(W/2,46);c.lineTo(W/2+22,92);c.lineTo(W/2-22,92);c.fill()}P.text(c,t,W/2,110,{size:16,col:'#fff'})}),[x+.95,1.7,-3.5])}
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bGutterMinds(x,z,t){
 const B=mk(x,z,40,36,H,0x6a4a3a,0x2a3a6a,0x3a4a52);B.dx=0;const PT={th:.16,c:0xd8d8d0};
 WL(B,1,Z1,X0,X1,[...wins([-17.6,-16.0,-14.4,-12.8,-10.0,-8.4,-6.8,-5.2,-2.4,-.8]),{k:'d',c:9.4},{k:'d',c:10.7},...wins([13.9,15.5,17.1])],H);
 WL(B,1,Z0,X0,X1,[{k:'d',c:4.5,s:-1},{k:'d',c:18,s:-1}],H);WL(B,0,X0,Z0,Z1,[],H);WL(B,0,X1,Z0,Z1,[],H);
 WL(B,1,-3.6,7,13,[{k:'d',c:8.6},{k:'d',c:11.4}],H,PT);WL(B,0,10,Z0,-3.6,[],H,PT);WL(B,0,13,Z0,1.6,[],H,PT);
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);
 const ry=a=>B.cs>0?a:a+PI,SP=(lx,lz,name,table,a,y0)=>{try{if(window.spawnPropContainer)spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,ry(a),y0||0);else cont(B,table||'bowling',lx,lz)}catch(e){}};
 // lootable: kitchen coolers + freezer + prep, vending by the door, a locker and boxes behind the shoe wall, the dumpster out back
 SP(18.55,-5.0,'drinks_cooler','bowling',-PI/2);SP(18.55,-4.1,'drinks_cooler','bowling',-PI/2);SP(18.5,.6,'freezer_upright','bowling',-PI/2);
 SP(7.6,14.95,'vending_blitz','bowling',PI);SP(12.9,14.95,'vending_snack','bowling',PI);SP(18.4,11.2,'fire_locker','bowling',-PI/2);SP(18.3,7.0,'cardboard_box_medium','bowling',-PI/2);SP(17.8,6.0,'cardboard_box_small','bowling',0);
 SP(16.2,-16.6,'dumpster_blue','house',0);
 rc(B,'bowling',[17,19,5,12.5],1);rc(B,'bowling',[-17,-2,10.5,12.5],1);
 buildings.push({x:WX(B,0),z:WZ(B,4.2),w:38,d:22.4,t:t.id});
 for(const [px,pz] of[[-8,2],[2,0],[9,6],[15,-3],[-12,11],[5,-4],[0,-12]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));
 LASTB=B;return B}

if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='gutter_lanes'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
const e=NEWCAT.find(d=>d.id==='gutter_lanes');
if(e){e.name='Gutter Minds Bowling';e.build=bGutterMinds;e.note='full-block bowling alley: 8 lanes, snack bar, cafe, front desk, arcade, service lot'}
if(typeof NOYARD!=='undefined')NOYARD.add('gutter_lanes');window.bGutterMinds=bGutterMinds;window.GUTTERMINDS={build};
console.log('[bowling] Gutter Minds ready');
})();
