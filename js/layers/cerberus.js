/* ==========================================================================================================
   MINI FORT ZOMBIE - WATER TOWER & CERBERUS STUDIOS (v072): a full-block civic / office lot (40 x 36 m plot, front = +Z), our own design.
   Exterior: a 22 m steel lattice water tower (four battered legs, ring girders, X-bracing on every face, a rust-streaked tank with the
   town name, conical roof with a finial, catwalk + railing, caged ladder, riser pipe) inside a weathered board fence on an asphalt
   compound, a tyre pyramid, a burning dumpster, a tree in a grate; a grey painted-brick game studio fronting the sidewalk with the
   CERBERUS STUDIOS sign between two three-headed-hound emblem panels, a big lit storefront window, poster, glass door, scorch marks,
   side windows and emblem boards, a smoke-stained back wall with graffiti and a door onto a striped parking lot; street lights,
   parking meters, a hydrant and a no-parking sign.
   Interior (a game-development studio): polished concrete, grey walls with a maroon base, dark drop ceiling with light panels;
   reception desk with a logo wall and waiting sofa; an open floor of desk pods (dual monitors showing code, 3D viewports, level
   editors and task boards, keyboards, mice, mugs, figurines, plants, mesh office chairs); concept-art posters and a whiteboard;
   a glass-walled meeting room (long table, chairs, wall screen); a lounge with sofas, coffee table, bean bags, foosball and an
   arcade cabinet; kitchenette (espresso machine, fridge, water cooler, snacks); a server rack; scorched walls, a desk on fire and
   CAVE CANEM daubed in red.
   Structure from core WL (doors / windows work); detail is our own geometry and painted artwork, outside the static merge.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[cerberus] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const X0=3,X1=18,Z0=-4,Z1=15.4,H=4.6,CEIL=3.5;          // studio shell
const TX=-9,TZ=-1;                                        // water tower centre
const RED='#c41a1a',GOLD='#e8b830';

/* ===================== artwork ===================== */
// the three-headed hound emblem (Cerberus) in a shield, our own drawing
function drawHound(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=col||'#e8e8e8';c.strokeStyle=col||'#e8e8e8';
 c.lineWidth=4;c.beginPath();c.moveTo(-60,-50);c.lineTo(60,-50);c.lineTo(60,10);c.quadraticCurveTo(60,60,0,80);c.quadraticCurveTo(-60,60,-60,10);c.closePath();c.stroke();
 const head=(hx,hy,a)=>{c.save();c.translate(hx,hy);c.rotate(a);c.beginPath();c.moveTo(-12,8);c.lineTo(-14,-10);c.lineTo(-10,-24);c.lineTo(-4,-12);c.lineTo(4,-12);c.lineTo(10,-24);c.lineTo(14,-10);c.lineTo(12,8);c.lineTo(22,18);c.lineTo(4,22);c.lineTo(0,28);c.lineTo(-4,22);c.lineTo(-22,18);c.closePath();c.fill();
  c.fillStyle='#000';c.beginPath();c.moveTo(-8,0);c.lineTo(-3,2);c.lineTo(-8,4);c.fill();c.beginPath();c.moveTo(8,0);c.lineTo(3,2);c.lineTo(8,4);c.fill();c.fillStyle=col||'#e8e8e8';c.restore()};
 head(-30,-8,-.35);head(30,-8,.35);head(0,-20,0);c.beginPath();c.moveTo(-30,20);c.quadraticCurveTo(0,10,30,20);c.lineTo(22,55);c.quadraticCurveTo(0,64,-22,55);c.closePath();c.fill();
 c.font="bold 16px 'MFZ Head'";c.textAlign='center';c.fillText('CERBERUS',0,96);
 for(const s2 of[-1,1]){c.beginPath();c.moveTo(s2*60,-50);c.quadraticCurveTo(s2*80,-80,s2*50,-90);c.quadraticCurveTo(s2*64,-70,s2*44,-56);c.fill()}c.restore()}
const signTex=()=>K.paint('cs_sign',1024,300,(c,W,H,r)=>{c.fillStyle='#0c0c0e';c.fillRect(0,0,W,H);c.strokeStyle='#3a3a3e';c.lineWidth=10;c.strokeRect(5,5,W-10,H-10);
 c.save();c.font="bold 150px 'MFZ Head'";c.textAlign='center';c.textBaseline='middle';const g=c.createLinearGradient(0,60,0,200);g.addColorStop(0,'#f4f4f4');g.addColorStop(1,'#9a9aa0');c.fillStyle=g;c.fillText('CERBERUS',W/2,H*.44);c.restore();
 c.save();c.font="bold 34px 'MFZ Head'";c.fillStyle='#d8d8dc';c.textAlign='center';const t='S  T  U  D  I  O  S';c.fillText(t,W/2,H*.82);c.restore();c.fillStyle=RED;c.fillRect(W*.2,H*.68,W*.6,4);P.grime(c,W,H,r,.3)},{glow:.35,r:.4});
const emblemTex=()=>K.paint('cs_emblem',300,360,(c,W,H,r)=>{c.fillStyle='#0c0c0e';c.fillRect(0,0,W,H);c.strokeStyle='#3a3a3e';c.lineWidth=8;c.strokeRect(4,4,W-8,H-8);drawHound(c,W/2,H*.46,1.5);P.grime(c,W,H,r,.3)},{glow:.3,r:.4});
const SCREENS=[
 (c,W,H,r)=>{c.fillStyle='#1e1e24';c.fillRect(0,0,W,H);c.fillStyle='#2a2a32';c.fillRect(0,0,40,H);const cols=['#c586c0','#9cdcfe','#dcdcaa','#4ec9b0','#ce9178','#6a9955'];for(let i=0;i<20;i++){const ind=(i%5)*14;let x=48+ind;for(let k=0;k<1+Math.floor(r()*4);k++){const w=20+r()*60;c.fillStyle=cols[Math.floor(r()*6)];c.fillRect(x,8+i*12,w,6);x+=w+8}c.fillStyle='#5a5a62';c.fillRect(10,8+i*12,18,6)}},
 (c,W,H,r)=>{c.fillStyle='#3a3a3e';c.fillRect(0,0,W,H);c.strokeStyle='#4a4a50';for(let i=0;i<W;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i,H);c.stroke()}for(let i=0;i<H;i+=16){c.beginPath();c.moveTo(0,i);c.lineTo(W,i);c.stroke()}c.strokeStyle='#e8a030';c.lineWidth=1.5;c.beginPath();const cx=W*.45,cy=H*.55;for(let a=0;a<12;a++){const x=cx+Math.cos(a)*60,y=cy+Math.sin(a*1.3)*40;c.lineTo(x,y)}c.closePath();c.stroke();c.fillStyle='rgba(200,200,210,.5)';c.beginPath();c.arc(cx,cy,40,0,PI*2);c.fill();c.fillStyle='#2a2a2e';c.fillRect(W-70,0,70,H);c.fillStyle='#5a5a62';for(let i=0;i<10;i++)c.fillRect(W-62,10+i*14,54,8)},
 (c,W,H,r)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#3a6ab8');g.addColorStop(.6,'#a8c8e8');g.addColorStop(.6,'#4a6a2a');g.addColorStop(1,'#2a3a18');c.fillStyle=g;c.fillRect(0,0,W,H);c.fillStyle='#5a5a5a';c.beginPath();c.moveTo(40,H*.6);c.lineTo(110,H*.25);c.lineTo(180,H*.6);c.fill();c.fillStyle='#e8d8a8';c.fillRect(W*.6,H*.4,40,40);c.fillStyle=RED;c.beginPath();c.moveTo(W*.6-6,H*.4);c.lineTo(W*.6+20,H*.3);c.lineTo(W*.6+46,H*.4);c.fill();c.fillStyle='rgba(0,0,0,.6)';c.fillRect(0,H-20,W,20);c.fillStyle='#7aff6a';c.fillRect(6,H-14,80,8)},
 (c,W,H,r)=>{c.fillStyle='#f4f4f4';c.fillRect(0,0,W,H);c.fillStyle='#2a4ec8';c.fillRect(0,0,W,20);['TO DO','DOING','DONE'].forEach((t,i)=>{P.text(c,t,40+i*90,32,{size:12,col:'#333'});for(let k=0;k<4-i;k++){c.fillStyle=['#ffe06a','#9ad8ff','#a8f0a0'][i];c.fillRect(8+i*90,44+k*36,76,30);c.fillStyle='#555';c.fillRect(12+i*90,50+k*36,50,3);c.fillRect(12+i*90,58+k*36,36,3)}})},
 (c,W,H,r)=>{c.fillStyle='#0a0a12';c.fillRect(0,0,W,H);for(let i=0;i<80;i++){c.fillStyle='#fff';c.fillRect(r()*W,r()*H,1.5,1.5)}c.fillStyle='#c8a03a';c.beginPath();c.arc(W*.7,H*.4,30,0,PI*2);c.fill();c.fillStyle='#9a9aa8';c.beginPath();c.moveTo(60,110);c.lineTo(110,90);c.lineTo(120,100);c.lineTo(70,120);c.fill();P.text(c,'VOID RAIDERS',W/2,24,{size:20,col:'#5affe8'})}];
const screenMat=i=>K.paint('cs_scr'+i,256,170,SCREENS[i%SCREENS.length],{glow:.75,r:.3});
const posterMat=(i)=>K.paint('cs_post'+i,256,360,(c,W,H,r)=>{
 if(i===0){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0a1a');g.addColorStop(1,'#3a1a4a');c.fillStyle=g;c.fillRect(0,0,W,H);for(let k=0;k<120;k++){c.fillStyle='#fff';c.fillRect(r()*W,r()*H*.7,1.5,1.5)}c.fillStyle='#8a8aa0';c.beginPath();c.moveTo(40,250);c.lineTo(200,170);c.lineTo(216,190);c.lineTo(60,270);c.fill();P.text(c,'VOID',W/2,50,{size:56,col:'#5affe8'});P.text(c,'RAIDERS',W/2,100,{size:46,col:'#fff'});P.text(c,'COMING SOON',W/2,H-24,{size:18,col:'#aaa'})}
 else if(i===1){c.fillStyle='#d8e8f4';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.beginPath();c.moveTo(0,H);c.lineTo(80,180);c.lineTo(160,250);c.lineTo(256,150);c.lineTo(W,H);c.fill();c.fillStyle='#2a3a6a';c.fillRect(120,40,8,180);c.beginPath();c.moveTo(100,60);c.lineTo(148,60);c.lineTo(124,30);c.fill();P.text(c,'BLADE OF',W/2,270,{size:36,col:'#1a2a5a'});P.text(c,'THE NORTH',W/2,310,{size:36,col:'#1a2a5a'})}
 else if(i===2){c.fillStyle='#1a0a0a';c.fillRect(0,0,W,H);drawHound(c,W/2,H*.42,1.4,'#c41a1a');P.text(c,'HOUND OF',W/2,H-80,{size:34,col:'#e8e8e8'});P.text(c,'HADES',W/2,H-40,{size:48,col:RED})}
 else{c.fillStyle='#e8dcc0';c.fillRect(0,0,W,H);c.strokeStyle='#5a4a3a';c.lineWidth=2;for(let k=0;k<6;k++){c.beginPath();c.arc(60+k*28,120+Math.sin(k)*30,20+k*3,0,PI*2);c.stroke()}c.beginPath();c.moveTo(40,300);c.lineTo(128,180);c.lineTo(216,300);c.stroke();P.text(c,'CONCEPT 07B',W/2,30,{size:24,col:'#5a4a3a',font:"'MFZ Type'"})}
 P.grime(c,W,H,r,.25)},{r:.55});

const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 gbrick:()=>K.tri('cs_gbrick',(c,W,H,r)=>{c.fillStyle='#7a7e84';c.fillRect(0,0,W,H);const bw=W/4,bh=H/12;for(let j=0;j<12;j++)for(let i=-1;i<5;i++){const x=i*bw+(j%2)*bw/2;c.fillStyle=`hsl(215,${4+r()*4}%,${70+r()*10}%)`;c.fillRect(x+2,j*bh+2,bw-4,bh-4)}P.noise(c,W,H,r,6000,.2,'#3a3a3e',1.5);P.grime(c,W,H,r,.6)},{tile:.38,r:.9}),
 coping:()=>K.mat(0x5a5e64,.5,.4),
 conc:()=>K.tri('cs_conc',(c,W,H,r)=>{c.fillStyle='#7a7c7e';c.fillRect(0,0,W,H);P.noise(c,W,H,r,30000,.25,'#4a4c4e',1.5);P.noise(c,W,H,r,20000,.2,'#a8aaac',1.5);c.strokeStyle='rgba(40,40,40,.4)';c.lineWidth=2;c.strokeRect(0,0,W,H)},{tile:.25,r:.35}),
 wall:()=>K.tri('cs_wall',(c,W,H,r)=>{c.fillStyle='#c4c6c8';c.fillRect(0,0,W,H);P.noise(c,W,H,r,6000,.1,'#7a7c7e',2);P.grime(c,W,H,r,.3)},{tile:.5,r:.85}),
 ceil:()=>K.tri('cs_ceil',(c,W,H,r)=>{c.fillStyle='#9a9c9e';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.2,'#5a5c5e',1.3);c.fillStyle='#4a4c4e';c.fillRect(0,0,W,6);c.fillRect(0,0,6,H);c.fillRect(0,H/2,W,4);c.fillRect(W/2,0,4,H)},{tile:.84,r:.9}),
 asphalt:()=>K.surf('asphalt',0x3a3c40),concrete:()=>K.surf('concrete',0xb0aea6),
 fence:()=>K.tri('cs_fence',(c,W,H,r)=>{const n=8,s=W/n;for(let i=0;i<n;i++){c.fillStyle=`hsl(${10+r()*10},${12+r()*8}%,${34+r()*10}%)`;c.fillRect(i*s+1,0,s-2,H);for(let k=0;k<20;k++){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(i*s+3+r()*(s-6),r()*H,1,10+r()*40)}}c.fillStyle='#1a120e';for(let i=0;i<n;i++)c.fillRect(i*s,0,1,H);P.grime(c,W,H,r,.7)},{tile:1.0,r:.9}),
 steel:()=>K.paintSteel(0x7a828a,{m:.35,worn:true}),
 tank:()=>K.paint('cs_tank',1024,384,(c,W,H,r)=>{c.fillStyle='#5a646c';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=64){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x,0,3,H)}for(let y=0;y<H;y+=96){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,y,W,3)}
  for(let i=0;i<60;i++){const x=r()*W,g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(140,70,30,.6)');g.addColorStop(1,'rgba(140,70,30,0)');c.fillStyle=g;c.fillRect(x,r()*30,4+r()*10,60+r()*250)}
  for(const ox of[0,W/2]){c.save();c.font="bold 120px 'MFZ Head'";c.textAlign='center';c.textBaseline='middle';c.fillStyle=GOLD;c.fillText('PIZZA',ox+W/4,H*.38);c.font="bold 54px 'MFZ Head'";c.fillText('EST. 1969',ox+W/4,H*.7);   /* v076 */c.restore()}P.grime(c,W,H,r,.6)},{r:.6,m:.35})
})[k]());

/* ===================== small furniture builders ===================== */
function officeChair(b,x,z,a,col){b.push([x,0,z],[0,a,0]);const fr=K.mat(0x1e1f22,.5,.2),mesh=K.mat(col||0x2a2c30,.7);
 b.rbox(.5,.08,.48,.03,mesh,[0,.48,0]);b.rbox(.46,.62,.05,.04,mesh,[0,.88,-.24],[.12,0,0]);b.box(.42,.06,.06,fr,[0,.62,-.24],null,.01);b.cyl(.03,.03,.36,K.mat(0x8a8c8e,.3,.8),[0,.27,0],null,8);
 for(let k=0;k<5;k++){const q=k*PI*2/5;b.box(.3,.03,.04,fr,[Math.cos(q)*.15,.07,Math.sin(q)*.15],[0,-q,0],0);b.sph(.03,fr,[Math.cos(q)*.3,.03,Math.sin(q)*.3])}for(const s of[-1,1]){b.box(.04,.2,.04,fr,[s*.26,.6,0],null,0);b.box(.06,.03,.28,fr,[s*.26,.7,0],null,.01)}b.pop()}
function plant(b,x,z,s){s=s||1;b.cyl(.16*s,.12*s,.34*s,K.mat(0xe8e4dc,.5),[x,.17*s,z],null,14);b.cyl(.15*s,.15*s,.02,K.surf('humus',0x3a2a1a),[x,.33*s,z],null,14);const lf=K.mat(0x2a7a2a,.7);for(let k=0;k<7;k++){const a=k*.9,t=.25+k*.03;b.add(K.sphGeo(.12*s,8,6),lf,{p:[x+Math.cos(a)*.12*s,(.45+k*.06)*s,z+Math.sin(a)*.12*s],s:[1,1.6,.5],r:[Math.sin(a)*.5,a,Math.cos(a)*.5]})}}
function sofa(b,x,z,a,len,col){b.push([x,0,z],[0,a,0]);const m=K.mat(col,.85);b.rbox(len,.4,.85,.06,m,[0,.25,0]);b.rbox(len,.55,.22,.08,m,[0,.65,-.32]);for(const s of[-1,1])b.rbox(.2,.55,.85,.08,m,[s*(len/2-.1),.45,0]);for(let i=0;i<Math.round(len/.8);i++)b.rbox(len/Math.round(len/.8)-.04,.14,.6,.06,m,[-len/2+.2+(i+.5)*(len-.4)/Math.round(len/.8),.5,.08]);for(const s of[-1,1])for(const t of[-1,1])b.cyl(.025,.02,.05,K.mat(0x3a2a1a,.5),[s*(len/2-.1),.025,t*.35],null,6);b.pop()}
function monitor(b,x,y,z,a,i){b.push([x,y,z],[0,a,0]);b.box(.24,.015,.18,K.mat(0x1a1a1c,.4,.3),[0,.008,0],null,.004);b.box(.04,.28,.03,K.mat(0x1a1a1c,.4,.3),[0,.15,-.05],null,0);b.rbox(.56,.34,.03,.006,K.mat(0x121214,.3,.2),[0,.4,-.03]);b.label(.53,.31,screenMat(i),[0,.4,-.013]);b.pop()}

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
function build(){if(CACHE)return CACHE;const b=K.builder('cerberus'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),rnd=b.rnd,conc=surf('concrete'),dark=K.mat(0x1a1a1c,.5);
 const Wn=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 const FRONT=[...Wn([5.2,6.7,8.2,9.7,11.2]),{k:'d',c:14.8}],LEFT=Wn([3.6,7.2,10.8]),RIGHT=Wn([3.6,7.2,10.8]),BACK=[{k:'d',c:15.8,s:-1}];
 /* ---------- ground: asphalt everywhere, sidewalk, lot stripes ---------- */
 b.box(40,.06,2.5,conc,[0,.03,16.75],null,0);for(let x=-19.5;x<20;x+=1.5)b.box(.02,.062,2.48,K.mat(0x8a8880,.8),[x,.031,16.75],null,0);b.box(40,.16,.2,conc,[0,.08,17.95],null,0);
 b.box(40,.025,33.9,surf('asphalt'),[0,.012,-1.05],null,0);for(let i=0;i<5;i++)b.box(4.5,.012,.1,K.mat(0xeeeee4,.7),[13.0,.03,-6.5-i*2.4],null,0);for(let i=0;i<4;i++)b.box(1.6,.12,.2,K.surf('concrete',0x9a9890),[16.6,.06,-7.7-i*2.4],[0,PI/2,0],.03);
 for(const [x,z,s] of[[6,-10,2],[11,-15,1.6],[-14,12,2.4],[0,6,1.8]])b.label(s*1.5,s,K.paint('cs_patch',192,128,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(40,40,42,.8)';c.beginPath();for(let a=0;a<PI*2;a+=.4)c.lineTo(W/2+Math.cos(a)*(60+r()*30),H/2+Math.sin(a)*(36+r()*20));c.fill()},{alpha:true}),[x,.028,z],[-PI/2,0,rnd()*3]);
 b.label(10,10,K.paint('cs_cracks',256,256,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.strokeStyle='rgba(15,15,15,.6)';for(let k=0;k<9;k++){c.lineWidth=1+r()*2;c.beginPath();let x=r()*W,y=r()*H;c.moveTo(x,y);for(let q=0;q<10;q++){x+=(r()-.5)*40;y+=(r()-.5)*40;c.lineTo(x,y)}c.stroke()}},{alpha:true}),[TX,.03,TZ],[-PI/2,0,0]);
 /* ---------- water tower ---------- */
 const stl=surf('steel'),stl2=K.mat(0x5a6068,.55,.4);const BASE=4.6,TOP=2.5,LEGH=16;
 const legP=(sx,sz,y)=>{const t=y/LEGH,r=BASE+(TOP-BASE)*t;return[TX+sx*r,y,TZ+sz*r]};
 const beam=(a,e,w,m)=>{const L=Math.hypot(e[0]-a[0],e[1]-a[1],e[2]-a[2]),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(e[0]-a[0],e[1]-a[1],e[2]-a[2]).normalize()),eu=new T.Euler().setFromQuaternion(q);b.add(new T.BoxGeometry(w,L,w),m||stl,{p:[(a[0]+e[0])/2,(a[1]+e[1])/2,(a[2]+e[2])/2],r:[eu.x,eu.y,eu.z]})};
 const C4=[[1,1],[-1,1],[-1,-1],[1,-1]];
 for(const [sx,sz] of C4){beam(legP(sx,sz,0),legP(sx,sz,LEGH),.32);const f=legP(sx,sz,0);b.box(.9,.5,.9,K.surf('concrete',0x8a8a86),[f[0],.25,f[2]],null,.03);b.box(.6,.06,.6,stl2,[f[0],.53,f[2]],null,0);for(const [dx,dz] of[[.22,.22],[-.22,.22],[.22,-.22],[-.22,-.22]])b.cyl(.03,.03,.1,stl2,[f[0]+dx,.58,f[2]+dz],null,6);S(f[0]-.45,f[0]+.45,f[2]-.45,f[2]+.45,0,6,true)}
 const LV=[0,4,8,12,LEGH];for(let i=0;i<LV.length;i++){const y=LV[i];for(let k=0;k<4;k++){const [ax,az]=C4[k],[ex,ez]=C4[(k+1)%4];if(y>0)beam(legP(ax,az,y),legP(ex,ez,y),.2,stl2);
   if(i<LV.length-1){const y2=LV[i+1];beam(legP(ax,az,y+.3),legP(ex,ez,y2-.3),.1,stl2);beam(legP(ex,ez,y+.3),legP(ax,az,y2-.3),.1,stl2);const m1=legP(ax,az,(y+y2)/2),m2=legP(ex,ez,(y+y2)/2);b.cyl(.12,.12,.05,stl2,[(m1[0]+m2[0])/2,(y+y2)/2,(m1[2]+m2[2])/2],[PI/2,0,(k%2)?PI/2:0],10)}}}
 b.cyl(.45,.45,LEGH,stl,[TX,LEGH/2,TZ],null,14);for(let y=2;y<LEGH;y+=3)b.cyl(.5,.5,.12,stl2,[TX,y,TZ],null,14);
 // tank, floor, roof, finial, catwalk + railing, ladder
 b.cyl(3.4,3.4,.3,stl2,[TX,LEGH+.15,TZ],null,32);b.add(K.cylGeo(3.2,3.2,4.4,40,true),surf('tank'),{p:[TX,LEGH+2.5,TZ]});b.cyl(3.25,3.25,.12,stl2,[TX,LEGH+4.7,TZ],null,36);
 b.add(new T.ConeGeometry(3.45,2.6,36,1,true),K.paintSteel(0x6a7078,{m:.35,worn:true}),{p:[TX,LEGH+6.05,TZ]});
 b.cyl(.12,.16,.5,stl2,[TX,LEGH+7.5,TZ],null,10);b.sph(.15,stl2,[TX,LEGH+7.85,TZ]);b.rbox(.6,.4,.5,.04,stl2,[TX+1.2,LEGH+5.6,TZ+.6],[0,.4,0]);
 b.add(K.cylGeo(4.2,4.2,.08,40,false),K.tri('cs_grate',(c,W,H)=>{c.fillStyle='#2a2e32';c.fillRect(0,0,W,H);c.fillStyle='#7a7e82';for(let x=0;x<W;x+=8)c.fillRect(x,0,3,H)},{tile:.5,r:.6,m:.6}),{p:[TX,LEGH+.05,TZ]});
 for(let k=0;k<32;k++){const a=k*PI*2/32;b.cyl(.025,.025,1.05,stl2,[TX+Math.cos(a)*4.15,LEGH+.55,TZ+Math.sin(a)*4.15],null,6)}b.add(K.torGeo(4.15,.035,6,48),stl2,{p:[TX,LEGH+1.08,TZ],r:[PI/2,0,0]});b.add(K.torGeo(4.15,.02,6,48),stl2,{p:[TX,LEGH+.6,TZ],r:[PI/2,0,0]});
 for(let k=0;k<8;k++){const a=k*PI/4+PI/8;beam([TX+Math.cos(a)*2.6,LEGH-.6,TZ+Math.sin(a)*2.6],[TX+Math.cos(a)*4.1,LEGH,TZ+Math.sin(a)*4.1],.08,stl2)}
 const lx=TX+BASE+.15,lz=TZ+BASE+.6;for(const s of[-.22,.22])beam([lx+s,0,lz],[lx-1.95+s,LEGH,lz-1.95],.05,stl2);for(let y=.4;y<LEGH;y+=.35){const t=y/LEGH;beam([lx-.24-1.95*t,y,lz-1.95*t],[lx+.24-1.95*t,y,lz-1.95*t],.03,stl2)}
 for(let y=2.6;y<LEGH;y+=.8){const t=y/LEGH,cx=lx-1.95*t,cz=lz-1.95*t;b.add(K.torGeo(.4,.015,4,16,PI*1.3),stl2,{p:[cx,y,cz+.05],r:[PI/2,0,-PI*.15+PI*.5]})}
 // fence round the compound (weathered boards on posts)
 const fen=surf('fence'),post=K.surf('wood',0x3a2a1e);const FX0=-19.4,FX1=1.4,FZ0=-12.6,FZ1=10.4;
 const fenceRun=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);b.box(L,1.7,.06,fen,[(x0+x1)/2,.95,(z0+z1)/2],[0,-a,0],0);for(let s=0;s<=L;s+=2.5){const x=x0+(x1-x0)*s/L,z=z0+(z1-z0)*s/L;b.box(.12,1.9,.12,post,[x,.95,z],null,0)}b.box(L,.1,.1,post,[(x0+x1)/2,.55,(z0+z1)/2],[0,-a,0],0);b.box(L,.1,.1,post,[(x0+x1)/2,1.55,(z0+z1)/2],[0,-a,0],0);S(Math.min(x0,x1)-.05,Math.max(x0,x1)+.05,Math.min(z0,z1)-.05,Math.max(z0,z1)+.05,0,1.8,true)};
 fenceRun(FX0,FZ1,-11.2,FZ1);fenceRun(-8.0,FZ1,FX1,FZ1);fenceRun(FX0,FZ0,FX1,FZ0);fenceRun(FX0,FZ0,FX0,FZ1);fenceRun(FX1,FZ0,FX1,FZ1);
 b.push([-11.2,0,FZ1],[0,-1.2,0]);b.box(3.0,1.7,.06,fen,[1.5,.95,0],null,0);b.box(3.0,.1,.1,post,[1.5,.55,0],null,0);b.box(3.0,.1,.1,post,[1.5,1.55,0],[0,0,-.5],0);b.pop();          // the gate hangs open
 b.label(.6,.8,K.paint('cs_wtsign',200,260,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,60);P.text(c,'DANGER',W/2,30,{size:40,col:'#fff'});P.text(c,'NO',W/2,96,{size:32,col:'#1a1a1a'});P.text(c,'CLIMBING',W/2,132,{size:28,col:'#1a1a1a'});P.text(c,'PIETY WATER',W/2,196,{size:20,col:'#1a1a1a'});P.text(c,'DEPT.',W/2,222,{size:20,col:'#1a1a1a'})},{r:.5}),[-4,1.1,FZ1+.04]);
 // tyre pyramid, burning dumpster, tree in a grate
 const ty=K.rubber(),hub=K.mat(0x5a5a5a,.5,.5);const tyre=(x,y,z)=>{b.cyl(.34,.34,.24,ty,[x,y+.12,z],null,16);b.cyl(.2,.2,.25,K.mat(0x0a0a0a,.9),[x,y+.12,z],null,12)};
 for(let r=0;r<3;r++)for(let k=0;k<3-r;k++)tyre(-3.2+k*.7+r*.35,r*.24,7.6);for(let k=0;k<3;k++)tyre(-3.2+k*.7,0,8.3);S(-3.6,-1.4,7.2,8.7,0,.8,true);
 b.push([-16.8,0,13.2],[0,.15,0]);b.rbox(2.0,1.2,1.2,.04,K.surf('rust',0x7a2a1a,{m:.4}),[0,.6,0]);b.box(2.1,.08,1.3,K.mat(0x1a1a1a,.6,.4),[0,1.24,-.3],[-.6,0,0],0);b.label(2.2,1.6,K.paint('cs_soot',256,192,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<14;i++){const g=c.createRadialGradient(W/2+(r()-.5)*W*.6,H*.6,4,W/2,H*.6,60+r()*60);g.addColorStop(0,'rgba(5,5,5,.6)');g.addColorStop(1,'rgba(5,5,5,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}},{alpha:true}),[0,.03,0],[-PI/2,0,0]);b.pop();S(-17.9,-15.7,12.5,13.9,0,1.3,true);
 b.box(1.4,.04,1.4,K.mat(0x2a2a2a,.4,.6),[-11.6,.04,13.6],null,0);for(let i=0;i<6;i++)b.box(1.3,.045,.04,K.mat(0x1a1a1a,.5,.6),[-11.6,.045,13.0+i*.24],null,0);
 /* ---------- studio exterior: grey painted brick, coping, signs, scorch ---------- */
 const gb=surf('gbrick');
 const skin=(ax,f,a0,a1,n,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*.165,u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,.03,gb,[u,y,o],null,0);else b.box(.03,y1-y0,u1-u0,gb,[o,y,u],null,0)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;pc(a,p.c-hw,0,H);if(p.k==='w'){pc(p.c-hw,p.c+hw,0,.9);pc(p.c-hw,p.c+hw,2.75,H)}else pc(p.c-hw,p.c+hw,2.4,H);a=p.c+hw}pc(a,a1,0,H);
  const L=a1-a0+.5,u=(a0+a1)/2;if(ax){b.box(L,.6,.36,gb,[u,H+.3,f],null,0);b.box(L+.1,.14,.52,surf('coping'),[u,H+.67,f],null,.01)}else{b.box(.36,.6,L,gb,[f,H+.3,u],null,0);b.box(.52,.14,L+.1,surf('coping'),[f,H+.67,u],null,.01)}};
 skin(1,Z1,X0,X1,1,FRONT);skin(1,Z0,X0,X1,-1,BACK);skin(0,X0,Z0,Z1,-1,LEFT);skin(0,X1,Z0,Z1,1,RIGHT);
 b.box(15.2,.12,19.6,K.surf('concrete',0x6a6a66),[10.5,H+.02,5.7],null,0);b.box(15,.02,19.4,K.mat(0x3a3a3c,.9),[10.5,H+.09,5.7],null,0);b.rbox(1.8,1.0,1.3,.03,K.mat(0xb0b4b8,.4,.7),[12,H+.6,2]);b.vents(6,1.6,.7,K.mat(0x6a6c6e,.5,.6),[12,H+.6,2.66]);b.cyl(.5,.5,.1,K.mat(0x2a2a2a,.5,.4),[12,H+1.15,2],null,20);
 b.push([7,H+.15,-1],[0,-.6,0]);b.cyl(.03,.03,.7,K.mat(0x8a8c8e,.4,.7),[0,.35,0],null,8);b.add(K.sphGeo(.5,18,8,0,PI*.3),K.mat(0xd8d8d4,.5),{p:[0,.8,.1],r:[-1.1,0,0]});b.pop();
 // front signage: main sign + two emblem panels, framed
 const frm=K.mat(0x4a4c50,.4,.5);b.rbox(5.4,1.5,.12,.02,frm,[10.6,3.55,Z1+.24]);b.label(5.2,1.36,signTex(),[10.6,3.55,Z1+.305]);for(const x of[5.8,15.6]){b.rbox(1.5,1.7,.12,.02,frm,[x,3.5,Z1+.24]);b.label(1.36,1.56,emblemTex(),[x,3.5,Z1+.305])}
 for(const z of[5.0,12.6]){b.rbox(.12,1.5,2.6,.02,frm,[X1+.24,3.5,z]);b.label(2.46,1.36,signTex(),[X1+.305,3.5,z],[0,PI/2,0])}b.rbox(.12,1.5,1.3,.02,frm,[X0-.24,3.5,9.0]);b.label(1.16,1.36,emblemTex(),[X0-.305,3.5,9.0],[0,-PI/2,0]);
 b.label(.9,1.3,posterMat(2),[13.15,1.6,Z1+.2]);
 for(const [x,z,ry,w,h] of[[6.0,Z1+.19,0,1.6,1.4],[12.4,Z1+.19,0,1.4,1.2],[X0-.19,1.5,-PI/2,1.6,1.4],[X1+.19,8.4,PI/2,1.4,1.6]])b.label(w,h,K.paint('cs_scorch',256,224,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<16;i++){const g=c.createRadialGradient(W/2+(r()-.5)*W*.5,H*.75-r()*H*.5,4,W/2,H*.6,50+r()*60);g.addColorStop(0,'rgba(10,8,6,.65)');g.addColorStop(1,'rgba(10,8,6,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}},{alpha:true}),[x,h/2,z],[0,ry,0]);
 // back wall: smoke stain and graffiti tag
 b.label(10,3.6,K.paint('cs_backstain',512,192,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<30;i++){const g=c.createRadialGradient(r()*W,r()*H*.8,6,W/2,H/2,40+r()*80);g.addColorStop(0,'rgba(15,12,10,.5)');g.addColorStop(1,'rgba(15,12,10,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}c.save();c.translate(60,H-30);c.rotate(-.15);c.font="italic bold 48px 'MFZ Head'";c.strokeStyle='#2ac83a';c.lineWidth=3;c.strokeText('rev!',0,0);c.restore()},{alpha:true}),[9.5,2.0,Z0-.19],[0,PI,0]);
 // sidewalk: street lights, meters, hydrant, no parking
 const lightPole=(x)=>{const m=K.mat(0xb8bcc0,.35,.7);b.push([x,0,17.55]);b.rbox(.45,.6,.45,.04,m,[0,.3,0]);b.cyl(.09,.14,8.6,m,[0,4.3,0],null,12);b.tube([[0,8.3,0],[0,8.8,-.6],[0,8.8,-2.4]],.05,m,12,6);b.rbox(.4,.14,.75,.05,m,[0,8.75,-2.6]);b.box(.3,.02,.55,K.mat(0xffffff,.4,0,{emissive:0xfff2d0,emissiveIntensity:.8}),[0,8.67,-2.6],null,0);b.cyl(.02,.02,1.2,m,[0,8.2,-.8],[1.1,0,0],6);b.pop();S(x-.23,x+.23,17.32,17.78,0,8.6,true)};
 lightPole(-2);lightPole(17);
 for(const x of[-5.5,9.2]){b.push([x,0,17.5]);b.cyl(.035,.035,1.1,K.mat(0x3a3a3a,.4,.6),[0,.55,0],null,8);b.rbox(.16,.26,.12,.04,K.mat(0x4a4c50,.4,.5),[0,1.22,0]);b.add(K.sphGeo(.09,12,6,0,PI/2),K.glass(0xcfe6ee,.45),{p:[0,1.35,0]});b.pop();S(x-.1,x+.1,17.4,17.6,0,1.4,true)}
 b.push([19.2,0,17.4]);const hy=K.mat(0xc8261c,.45,.3);b.cyl(.13,.15,.6,hy,[0,.32,0],null,16);b.add(K.sphGeo(.14,14,8,0,PI/2),hy,{p:[0,.62,0]});for(const s of[-1,1])b.cyl(.05,.05,.12,hy,[s*.17,.42,0],[0,0,PI/2],10);b.cyl(.07,.07,.1,hy,[0,.42,.17],[PI/2,0,0],10);b.cyl(.2,.2,.05,hy,[0,.04,0],null,16);b.pop();S(19.0,19.4,17.2,17.6,0,.8,true);
 b.push([18.4,0,17.7]);b.cyl(.03,.03,2.3,K.mat(0x8a8c8e,.4,.6),[0,1.15,0],null,8);b.label(.35,.5,K.paint('cs_nopark',140,200,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.strokeStyle=RED;c.lineWidth=5;c.strokeRect(5,5,W-10,H-10);P.text(c,'NO',W/2,50,{size:40,col:RED});P.text(c,'PARKING',W/2,100,{size:26,col:RED});P.text(c,'ANY TIME',W/2,150,{size:22,col:RED})}),[0,2.0,.035]);b.pop();
 /* ---------- interior: floor, walls, ceiling, lights ---------- */
 b.box(14.7,.02,19.1,surf('conc'),[10.5,.035,5.7],null,0);b.box(14.7,.04,19.1,surf('ceil'),[10.5,CEIL+.02,5.7],null,0);
 const wl=surf('wall'),base=K.mat(0x6a1a22,.5);
 const lineWall=(ax,f,a0,a1,n,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(.15+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{pc(u0,u1,y0,y1,wl,.012,.006);if(y0<=0)pc(u0,u1,0,.18,base,.03,.015)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,0,CEIL);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,CEIL)}else span(p.c-hw,p.c+hw,2.4,CEIL);a=p.c+hw}span(a,a1,0,CEIL)};
 lineWall(1,Z1,X0,X1,-1,FRONT);lineWall(1,Z0,X0,X1,1,BACK);lineWall(0,X0,Z0,Z1,1,LEFT);lineWall(0,X1,Z0,Z1,-1,RIGHT);
 const lit=K.mat(0xffffff,.4,0,{emissive:0xf4f8ff,emissiveIntensity:.95}),hous=K.mat(0xc8c8c4,.5,.2);
 for(let x=5;x<17;x+=3.0)for(let z=-2.4;z<15;z+=3.4){b.box(1.25,.06,.62,hous,[x,CEIL-.03,z],null,.01);b.box(1.15,.012,.52,lit,[x,CEIL-.065,z],null,0)}
 // scorch and soot on the walls, CAVE CANEM in red
 for(const [x,z,ry,w] of[[X0+.165,1.0,PI/2,4],[X0+.165,11,PI/2,3],[16.5,Z0+.165,0,3.4],[X1-.165,-1.5,-PI/2,3]])b.label(w,2.6,K.paint('cs_soot2',256,192,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<18;i++){const g=c.createRadialGradient(r()*W,H*.4+r()*H*.3,4,W/2,H/2,30+r()*70);g.addColorStop(0,'rgba(15,15,12,.55)');g.addColorStop(1,'rgba(15,15,12,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}for(let i=0;i<10;i++){c.fillStyle='rgba(15,15,12,.4)';c.fillRect(r()*W,H*.5,3+r()*4,H*.5*r())}},{alpha:true}),[x,1.9,z],[0,ry,0]);
 b.label(3.4,1.4,K.paint('cs_cave',512,210,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.save();c.translate(30,40);c.rotate(-.06);c.font="italic bold 92px 'MFZ Type'";c.fillStyle='rgba(170,10,10,.9)';c.fillText('CAVE',10,60);c.fillText('CANEM',90,150);c.restore();c.fillStyle='rgba(170,10,10,.8)';for(let i=0;i<14;i++){const x=40+r()*W*.8;c.fillRect(x,90+r()*60,2,20+r()*50)}},{alpha:true}),[X1-.18,2.4,.3],[0,-PI/2,0]);
 /* ---------- reception ---------- */
 b.push([15.0,0,12.3]);b.rbox(2.6,1.05,.7,.03,K.mat(0x1a1a1c,.35,.3),[0,.525,0]);b.rbox(2.7,.05,.8,.01,K.veneer(0x8a5a36,{tile:.6}),[0,1.075,0]);b.label(1.2,.6,emblemTex(),[0,.6,.355]);monitor(b,.5,1.1,-.15,PI,3);b.rbox(.3,.04,.12,.005,K.mat(0x1a1a1c,.4),[.5,1.12,.12]);plant(b,-1.1,-.0,.6);b.pop();S(13.65,16.35,11.9,12.7,0,1.1);officeChair(b,15.4,11.3,0);
 b.box(.04,1.8,3.2,K.mat(0x1a1a1c,.4,.2),[X1-.2,2.1,13.4],null,0);b.label(3.0,.9,K.paint('cs_logowall',768,230,(c,W,H)=>{c.clearRect(0,0,W,H);drawHound(c,110,H/2,.95,'#e8e8e8');c.font="bold 96px 'MFZ Head'";c.fillStyle='#e8e8e8';c.textBaseline='middle';c.fillText('CERBERUS',220,H*.42);c.font="bold 30px 'MFZ Head'";c.fillText('S T U D I O S',230,H*.8)},{alpha:true,glow:.5}),[X1-.225,2.3,13.4],[0,-PI/2,0]);
 sofa(b,4.0,12.0,PI/2,2.4,0x3a3a44);b.rbox(.9,.04,.6,.01,K.glass(0xcfe6ee,.4),[5.2,.42,12.0]);for(const [x,z] of[[4.8,11.75],[5.6,11.75],[4.8,12.25],[5.6,12.25]])b.cyl(.015,.015,.4,chrome,[x,.2,z],null,6);for(let i=0;i<3;i++)b.box(.22,.01,.3,K.paint('cs_mag'+i,96,128,(c,W,H)=>{c.fillStyle=['#c41a1a','#1a4ea8','#2a2a2a'][i];c.fillRect(0,0,W,H);P.text(c,['GAME','DEV','PLAY'][i],W/2,30,{size:26,col:'#fff'})}),[5.0+i*.15,.45+i*.01,12.0],[0,i*.4,0],0);S(3.55,5.7,10.8,13.2,0,.9,true);
 plant(b,3.7,10.0,1.3);plant(b,17.4,10.2,1.1);
 /* ---------- open floor: desk pods ---------- */
 const deskTop=K.mat(0xe8e4dc,.45),leg=K.mat(0x2a2c30,.4,.6);
 const desk=(x,z,a,i)=>{b.push([x,0,z],[0,a,0]);b.box(1.6,.04,.8,deskTop,[0,.74,0],null,.01);for(const s of[-1,1])b.box(.05,.72,.7,leg,[s*.76,.36,0],null,0);b.box(1.5,.35,.02,K.mat(0x3a3c40,.6),[0,.5,-.38],null,0);b.box(1.6,.4,.03,K.mat(0x2a6a8a,.7),[0,.96,-.4],null,0);
  monitor(b,-.32,.76,-.18,.12,i);monitor(b,.32,.76,-.18,-.12,i+1);b.rbox(.44,.02,.14,.005,K.mat(0x1a1a1c,.4),[0,.77,.12]);for(let k=0;k<30;k++)b.box(.025,.006,.025,K.mat(0x3a3a3e,.5),[-.19+(k%15)*.027,.783,.08+Math.floor(k/15)*.03],null,0);b.rbox(.06,.025,.1,.012,K.mat(0x1a1a1c,.4),[.34,.77,.14]);b.box(.24,.004,.2,K.mat(0x2a2a2e,.8),[.34,.761,.14],null,0);
  if(rnd()<.6)b.cyl(.04,.035,.1,K.mat([0xf4f4f0,0xc41a1a,0x1a4ea8][i%3],.4),[-.6,.81,.15],null,12);if(rnd()<.4){b.cyl(.03,.03,.12,K.mat([0x8a2aba,0x2a8a3a,0xe8a020][i%3],.5),[.65,.82,-.1],null,8);b.sph(.035,K.mat(0xe8c8a0,.5),[.65,.9,-.1])}
  if(rnd()<.35)b.rbox(.42,.03,.3,.01,K.mat(0x1a1a1c,.3,.4),[-.5,.775,.12],[0,.2,0]);if(rnd()<.3)for(let k=0;k<3;k++)b.box(.2,.004,.28,K.mat(0xf4f4f0,.6),[.1+k*.05,.765+k*.004,.25],[0,k*.3,0],0);b.cyl(.1,.1,.4,K.mat(0x1a1a1c,.4,.3),[.55,.2,-.15],null,10);b.pop()};
 let n=0;for(const z of[3.2,6.6,9.6])for(const x of[6.6,10.2,13.8]){desk(x,z,0,n++);desk(x,z-.8,PI,n++);officeChair(b,x+(rnd()-.5)*.3,z+.75,PI+(rnd()-.5)*.8,[0x2a2c30,0x3a1a1a,0x1a2a3a][n%3]);officeChair(b,x+(rnd()-.5)*.3,z-1.55,(rnd()-.5)*.8,[0x2a2c30,0x3a1a1a,0x1a2a3a][n%3]);S(x-.82,x+.82,z-1.22,z+.42,0,1.15)}
 // concept-art wall + whiteboard on the left wall
 [1.5,8.5,9.5,-2.5].forEach((z,i)=>b.label(.8,1.12,posterMat(i),[X0+.17,2.1,z],[0,PI/2,0]));
 b.rbox(.04,1.2,2.0,.01,K.mat(0xc8ccd0,.3,.7),[X0+.2,1.9,5.4]);b.label(1.9,1.1,K.paint('cs_wb',512,246,(c,W,H,r)=>{c.fillStyle='#f8f8f6';c.fillRect(0,0,W,H);c.strokeStyle='#1a4ea8';c.lineWidth=3;c.strokeRect(20,20,120,70);c.strokeRect(200,20,120,70);c.strokeRect(380,20,110,70);c.beginPath();c.moveTo(140,55);c.lineTo(200,55);c.moveTo(320,55);c.lineTo(380,55);c.stroke();
  c.fillStyle='#1a4ea8';c.font="18px 'MFZ Type'";c.fillText('PLAYER',40,60);c.fillText('AI DIRECTOR',212,60);c.fillText('HORDE',400,60);c.strokeStyle=RED;c.beginPath();c.arc(260,170,50,0,PI*2);c.stroke();c.fillStyle=RED;c.fillText('MILESTONE 3 - FRIDAY!!',30,160);c.fillText('fix pathfinding :(',30,200);c.strokeStyle='#2a8a3a';c.beginPath();c.moveTo(340,200);c.lineTo(360,220);c.lineTo(400,170);c.stroke()},{r:.3}),[X0+.225,1.9,5.4],[0,PI/2,0]);b.box(.06,.04,1.0,K.mat(0x8a8c8e,.4,.6),[X0+.25,1.28,5.4],null,0);
 /* ---------- glass meeting room (back left) ---------- */
 const gl=K.glass(0xcfe6ee,.18),mul=K.mat(0x3a3c40,.4,.6);
 const glassWall=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);b.box(L,CEIL-.05,.02,gl,[(x0+x1)/2,(CEIL-.05)/2,(z0+z1)/2],[0,-a,0],0);for(let s=0;s<=L+.01;s+=1.2){const x=x0+(x1-x0)*Math.min(1,s/L),z=z0+(z1-z0)*Math.min(1,s/L);b.box(.06,CEIL,.06,mul,[x,CEIL/2,z],null,0)}b.box(L,.06,.08,mul,[(x0+x1)/2,.03,(z0+z1)/2],[0,-a,0],0);b.box(L,.06,.08,mul,[(x0+x1)/2,2.4,(z0+z1)/2],[0,-a,0],0);
  b.box(L,.12,.025,K.mat(0xd8dadc,.6),[(x0+x1)/2,1.25,(z0+z1)/2],[0,-a,0],0);S(Math.min(x0,x1)-.04,Math.max(x0,x1)+.04,Math.min(z0,z1)-.04,Math.max(z0,z1)+.04,0,CEIL,true)};
 glassWall(X0+.15,1.2,6.6,1.2);glassWall(8.0,1.2,9.4,1.2);glassWall(9.4,Z0+.15,9.4,1.2);
 b.rbox(4.0,.06,1.3,.04,K.veneer(0x3a2418,{tile:.6}),[6.2,.75,-1.4]);for(const s of[-1.4,1.4])b.box(.08,.72,.9,leg,[6.2+s,.36,-1.4],null,0);for(let i=0;i<4;i++)for(const s of[-1,1])officeChair(b,4.8+i*.95,-1.4+s*.95,s>0?PI:0,0x1a1a1c);
 b.cyl(.05,.05,.04,K.mat(0x1a1a1c,.4),[6.2,.8,-1.4],null,12);b.rbox(.6,.03,.4,.01,K.mat(0x1a1a1c,.3,.4),[5.6,.795,-1.5],[0,.2,0]);S(4.15,8.25,-2.1,-.7,0,.8);
 b.rbox(2.2,1.25,.06,.02,K.mat(0x121214,.3,.2),[6.2,1.9,Z0+.2]);b.label(2.1,1.15,K.paint('cs_present',512,280,(c,W,H,r)=>{c.fillStyle='#0c0c0e';c.fillRect(0,0,W,H);drawHound(c,90,H/2,.8,'#c41a1a');P.text(c,'HOUND OF HADES',330,60,{size:36,col:'#fff'});P.text(c,'Q3 MILESTONE REVIEW',330,100,{size:22,col:'#aaa'});c.fillStyle='#2a4ec8';for(let i=0;i<5;i++)c.fillRect(200+i*55,240-(i+2)*20,40,(i+2)*20)},{glow:.7}),[6.2,1.9,Z0+.235]);
 b.label(1.1,.3,K.paint('cs_mtg',300,82,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'THE PIT',W/2,H/2,{size:48,col:'#3a3c40'})},{alpha:true}),[5.0,2.0,1.23]);
 /* ---------- lounge + kitchenette (back right) ---------- */
 sofa(b,13.2,-.2,PI,2.6,0xb8261c);sofa(b,11.2,-2.0,PI/2,2.0,0x3a3a44);b.rbox(1.1,.4,.6,.03,K.veneer(0x8a5a36,{tile:.6}),[13.2,.2,-1.4]);b.cyl(.04,.035,.1,K.mat(0xf4f4f0,.4),[13.0,.45,-1.3],null,10);b.rbox(.18,.03,.12,.01,K.mat(0x1a1a1c,.4),[13.4,.415,-1.5],[0,.6,0]);
 for(const [x,z,col] of[[15.2,-1.0,0x2a8a3a],[15.6,-2.3,0xe8a020]])b.add(K.sphGeo(.42,14,10),K.mat(col,.85),{p:[x,.3,z],s:[1,.7,1]});S(11.8,14.6,-1.9,.3,0,.8,true);S(10.7,11.7,-3.1,-.9,0,.8,true);
 b.rbox(1.0,.18,.6,.02,K.mat(0x9a6a3a,.5),[16.8,.86,1.0]);for(const [x,z] of[[16.35,.75],[17.25,.75],[16.35,1.25],[17.25,1.25]])b.box(.06,.78,.06,K.mat(0x5a3a22,.5),[x,.39,z],null,0);b.box(.94,.02,.54,K.mat(0x2a8a3a,.7),[16.8,.95,1.0],null,0);for(let i=0;i<4;i++){b.cyl(.012,.012,.9,chrome,[16.55+i*.17,.88,1.0],[PI/2,0,0],6);for(let k=0;k<3;k++)b.box(.03,.12,.04,K.mat(i%2?0xc41a1a:0x1a4ea8,.5),[16.55+i*.17,.88,.8+k*.2],null,0)}S(16.25,17.35,.65,1.35,0,1.0,true);
 b.push([17.4,0,-2.6],[0,-PI/2,0]);b.rbox(.7,1.8,.75,.02,K.mat(0x1a1a2a,.4,.2),[0,.9,0]);b.label(.56,.4,K.paint('cs_arc',224,160,(c,W,H,r)=>{c.fillStyle='#050510';c.fillRect(0,0,W,H);for(let k=0;k<40;k++){c.fillStyle=['#ff5ad8','#5affe8','#ffd23a'][k%3];c.fillRect(r()*W,r()*H,3,3)}P.text(c,'HELLHOUND',W/2,22,{size:20,col:RED});P.text(c,'INSERT COIN',W/2,H/2,{size:16,col:'#ffd23a'})},{glow:.8}),[0,1.35,.376],[-.15,0,0]);b.box(.7,.2,.3,K.mat(0x1a1a2a,.4,.2),[0,1.0,.45],[.3,0,0],.02);b.label(.66,.22,K.paint('cs_marq',256,84,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'HELLHOUND',W/2,H/2,{size:36,col:'#fff'})},{glow:.6}),[0,1.68,.376]);b.pop();S(17.0,17.8,-3.0,-2.2,0,1.8);
 // kitchenette along the back wall
 b.box(4.4,.9,.62,K.mat(0x2a2c30,.5),[12.6,.45,Z0+.47],null,.01);b.box(4.5,.05,.66,K.surf('concrete',0xd8d4cc),[12.6,.93,Z0+.47],null,.01);b.box(4.4,.7,.35,K.mat(0x2a2c30,.5),[12.6,2.1,Z0+.33],null,.01);
 b.rbox(.4,.45,.38,.02,K.mat(0xc8ccd0,.3,.8),[11.0,1.18,Z0+.42]);b.cyl(.03,.03,.08,blk,[10.9,1.05,Z0+.62],[PI/2,0,0],8);b.cyl(.03,.03,.08,blk,[11.1,1.05,Z0+.62],[PI/2,0,0],8);b.cyl(.035,.03,.08,K.mat(0xf4f4f0,.4),[11.0,.99,Z0+.6],null,10);
 b.box(.5,.25,.35,K.mat(0x9a9c9e,.4,.5),[11.8,1.08,Z0+.4],null,.01);for(let i=0;i<6;i++)b.rbox(.18,.25,.08,.01,K.mat([0xc41a1a,0x2a8a3a,0xe8a020,0x1a4ea8,0x8a2aba,0xc8c8c4][i],.5),[12.6+i*.2,1.08,Z0+.45]);b.box(.5,.05,.4,st,[14.3,.93,Z0+.47],null,0);b.tube([[14.3,.96,Z0+.3],[14.3,1.2,Z0+.3],[14.3,1.18,Z0+.45]],.012,chrome,10,6);
 S(10.4,14.8,Z0+.15,Z0+.8,0,1.0);
 b.push([17.3,0,Z0+.6]);b.cyl(.16,.16,1.0,K.mat(0xf4f4f0,.4),[0,.5,0],null,14);b.cyl(.15,.15,.45,K.glass(0x5ab0e8,.5),[0,1.2,0],null,14);b.cyl(.02,.02,.06,K.mat(0x1a4ea8,.4),[.1,.8,.12],[PI/2,0,0],8);b.cyl(.02,.02,.06,K.mat(0xc41a1a,.4),[-.1,.8,.12],[PI/2,0,0],8);b.pop();S(17.1,17.5,Z0+.4,Z0+.8,0,1.4,true);
 // server rack in the corner by the meeting room, blinking lights
 b.push([9.9,0,-3.4]);b.rbox(.7,2.1,.9,.02,K.mat(0x121214,.4,.4),[0,1.05,0]);b.box(.6,1.9,.02,K.tri('cs_mesh',(c,W,H)=>{c.fillStyle='#0a0a0a';c.fillRect(0,0,W,H);c.fillStyle='#3a3a3e';for(let y=0;y<H;y+=6)for(let x=(y/6%2)*3;x<W;x+=6)c.fillRect(x,y,3,3)},{tile:.3,r:.6,m:.5}),[0,1.05,.46],null,0);
 for(let i=0;i<14;i++){b.box(.52,.1,.02,K.mat(0x2a2a2e,.4,.4),[0,.3+i*.12,.44],null,0);for(let k=0;k<4;k++)b.box(.012,.012,.01,K.mat(0xffffff,.3,0,{emissive:[0x3aff6a,0x3a8aff,0xffa03a][(i+k)%3],emissiveIntensity:1.2}),[-.2+k*.03,.3+i*.12,.46],null,0)}b.pop();S(9.55,10.25,-3.85,-2.95,0,2.1);
 // a desk on fire in the corner, papers and debris
 b.push([16.6,0,4.6],[0,.3,0]);b.box(1.6,.04,.8,K.mat(0x2a1a10,.9),[0,.74,0],null,.01);for(const s of[-1,1])b.box(.05,.72,.7,K.mat(0x2a1a10,.9),[s*.76,.36,0],null,0);b.rbox(.56,.34,.03,.006,K.mat(0x0a0a0a,.9),[0,.95,-.2],[0,0,.4]);
 b.pop();S(15.7,17.5,4.1,5.1,0,1.0,true);
 for(let i=0;i<14;i++)b.box(.21,.003,.29,K.paint('cs_paper',96,128,(c,W,H)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle='#888';for(let k=0;k<10;k++)c.fillRect(10,12+k*10,W-20-(k%3)*10,3)}),[8+rnd()*8,.04,4+rnd()*6],[0,rnd()*3,0],0);
 for(const [x,z] of[[12.2,5.0],[8.4,8.0]])b.label(1.6,1.6,K.paint('cs_burnmark',128,128,(c,W,H)=>{c.clearRect(0,0,W,H);const g=c.createRadialGradient(64,64,4,64,64,60);g.addColorStop(0,'rgba(8,6,4,.7)');g.addColorStop(1,'rgba(8,6,4,0)');c.fillStyle=g;c.fillRect(0,0,W,H)},{alpha:true}),[x,.04,z],[-PI/2,0,0]);
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bCerberus(x,z,t){
 const B=mk(x,z,40,36,H,0x9aa0a8,0x7a7c7e,0x3a4a52);B.dx=0;
 WL(B,1,Z1,X0,X1,[...wins([5.2,6.7,8.2,9.7,11.2]),{k:'d',c:14.8}],H);WL(B,1,Z0,X0,X1,[{k:'d',c:15.8,s:-1}],H);WL(B,0,X0,Z0,Z1,wins([3.6,7.2,10.8]),H);WL(B,0,X1,Z0,Z1,wins([3.6,7.2,10.8]),H);
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);try{if(window.MFZFIRE){MFZFIRE.addLocal(B,-16.8,1.2,13.2,1.0,{w:1.5,ry:.15});MFZFIRE.addLocal(B,16.6,.76,4.6,.75,{w:1.0,ry:.3})}}catch(e){}   /* v076: sprite fire (was orange cones) */try{bldTree(B,-11.6,13.6,.5,{kind:'ginkgo'})}catch(e){}
 const ry=a=>B.cs>0?a:a+PI,SP=(lx,lz,name,table,a,y0)=>{try{if(window.spawnPropContainer)spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,ry(a),y0||0);else cont(B,table||'office',lx,lz)}catch(e){}};
 // lootable: a couple of desks by the windows, bookshelves of design docs, the fridge, a vending machine, toolbox in the compound, the dumpster's neighbour
 SP(X0+.45,14.5,'bookshelf','office',PI/2);SP(X1-.4,8.6,'bookshelf','office',-PI/2);SP(X1-.45,-.5,'fridge_modern','office',-PI/2);
 SP(-2.4,-11.4,'tool_chest','hardware',0);SP(-17.6,-11.2,'dumpster_green','house',0);SP(13.2,-14,'cardboard_box_large','office',0);
 rc(B,'office',[5,16,2,10],1);
 buildings.push({x:WX(B,10.5),z:WZ(B,5.7),w:15,d:19.4,t:t.id});
 for(const [px,pz] of[[8,5],[12,8],[14,-1],[6,-1.5],[-8,4],[-14,-8],[10,-12]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));
 LASTB=B;return B}

if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='water_tower_kerberos'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
const e=NEWCAT.find(d=>d.id==='water_tower_kerberos');
if(e){e.name='Water Tower & Cerberus Studios';e.build=bCerberus;e.note='full-block lot: steel water tower compound and a game-development studio'}
if(typeof NOYARD!=='undefined')NOYARD.add('water_tower_kerberos');window.bCerberus=bCerberus;window.CERBERUS={build};
console.log('[cerberus] Water Tower & Cerberus Studios ready');
})();
