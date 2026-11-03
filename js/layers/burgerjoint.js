/* ==========================================================================================================
   MINI FORT ZOMBIE - BRUNO'S BURGERAMA (v072): a full-block burger joint (40 x 36 m plot, front = +Z), our own design.
   Exterior: L-plan brick diner, red standing-seam mansard roof with teal fascia, raised front sign, a 4.5 m fibreglass Bruno the Bear
   on the roof held by guy wires, a 9 m pole sign topped by a giant burger, drive-thru lane (menu board, speaker post, clearance bar,
   pick-up window), fenced parking lot behind with wheel stops and a wreck, dumpster corner, lawn with picnic tables, trees and shrubs,
   concrete path, sidewalk with parking meters.
   Interior: red/cream checkerboard floor, mahogany wainscot under damask wallpaper, drop ceiling with light panels and globe pendants,
   red tufted booths along the windows and in back-to-back rows, tables with wire chairs, condiment + tray station, tiled service
   counter with registers and a bagged order on a tray, backlit menu boards, and behind it a working kitchen: flat-top grill and fryers
   under a hood, burger chute under heat lamps, soda fountain, coffee brewers, prep island with bun racks, reach-in fridge, hand sink,
   ice machine, drive-thru station, walk-in freezer (a real room), restrooms (men / women) and an employees-only door.
   Structure (walls, doors, windows) comes from core WL so doors open / lock / get bashed and windows break; all detail is our own
   geometry and painted artwork (prop kit), kept out of the static merge so its materials survive.
   ========================================================================================================== */
(function(){
'use strict';
const K=window.MFZK;if(!K||typeof WL!=='function'||typeof NEWCAT==='undefined'){console.warn('[burgerjoint] core / prop kit missing');return}
const T=THREE,P=K.P,PI=Math.PI;
const XB0=-16,XB1=10,ZB0=-8,ZB1=7,H=3.8,CEIL=3.2;

/* ===================== artwork ===================== */
const RED='#c8261c',YEL='#ffd23a',TEAL='#1f8a8a',BRN='#7a4a24';
function drawBear(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);
 c.fillStyle='#8a5226';for(const e of[-1,1]){c.beginPath();c.arc(e*38,-34,18,0,PI*2);c.fill()}c.fillStyle='#d8a070';for(const e of[-1,1]){c.beginPath();c.arc(e*38,-34,9,0,PI*2);c.fill()}
 c.fillStyle='#9a5c2a';c.beginPath();c.arc(0,0,46,0,PI*2);c.fill();c.fillStyle='#e8c08a';c.beginPath();c.ellipse(0,16,24,18,0,0,PI*2);c.fill();
 c.fillStyle='#1a1008';c.beginPath();c.ellipse(0,8,9,6,0,0,PI*2);c.fill();c.beginPath();c.arc(-17,-10,6,0,PI*2);c.arc(17,-10,6,0,PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(-15,-12,2,0,PI*2);c.arc(19,-12,2,0,PI*2);c.fill();
 c.strokeStyle='#1a1008';c.lineWidth=3;c.beginPath();c.arc(0,20,10,.2,PI-.2);c.stroke();c.fillStyle='#e84a5a';c.beginPath();c.ellipse(0,29,6,4,0,0,PI);c.fill();
 c.fillStyle='#fff';c.fillRect(-34,-72,68,24);for(const k of[-22,0,22]){c.beginPath();c.arc(k,-76,16,0,PI*2);c.fill()}c.strokeStyle='#ccc';c.lineWidth=2;c.strokeRect(-34,-72,68,24);c.restore()}
function drawBurger(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);
 c.fillStyle='#d8902a';c.beginPath();c.ellipse(0,-14,60,32,0,PI,0);c.fill();c.fillStyle='#fff3c8';for(let i=0;i<12;i++){c.beginPath();c.ellipse(-40+i*7+(i%3)*4,-26-((i*7)%13),3,1.6,(i%4)*.5,0,PI*2);c.fill()}
 c.fillStyle='#4aa83a';c.beginPath();c.moveTo(-64,-12);for(let i=0;i<=16;i++)c.lineTo(-64+i*8,-12+(i%2?7:0));c.lineTo(64,-6);c.lineTo(-64,-6);c.fill();
 c.fillStyle='#f2c12e';c.beginPath();c.moveTo(-58,-8);c.lineTo(58,-8);c.lineTo(46,8);c.lineTo(-30,10);c.fill();
 c.fillStyle='#5a2a14';P.rrect(c,-60,-4,120,18,8);c.fill();c.fillStyle='#d83a2a';c.fillRect(-52,14,104,5);
 c.fillStyle='#c8802a';P.rrect(c,-58,18,116,16,8);c.fill();c.restore()}
function drawFries(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#f2c12e';for(let i=0;i<9;i++)c.fillRect(-26+i*6,-40-(i%3)*8,5,46);c.fillStyle=RED;c.beginPath();c.moveTo(-32,0);c.lineTo(32,0);c.lineTo(24,44);c.lineTo(-24,44);c.fill();c.fillStyle=YEL;c.font="bold 14px 'MFZ Head'";c.textAlign='center';c.fillText('B',0,28);c.restore()}
function drawCup(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#fff';c.beginPath();c.moveTo(-24,-36);c.lineTo(24,-36);c.lineTo(18,40);c.lineTo(-18,40);c.fill();c.fillStyle=RED;c.fillRect(-22,-10,44,22);c.fillStyle='#ddd';c.fillRect(-27,-42,54,8);c.fillStyle=RED;c.fillRect(6,-70,5,30);c.restore()}
const logoTex=(key,w,h,bg)=>K.paint(key,w,h,(c,W,H,r)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,W,H)}else c.clearRect(0,0,W,H);const s=Math.min(W,H)/200;
 c.fillStyle=YEL;c.beginPath();c.arc(W/2,H/2,92*s,0,PI*2);c.fill();c.fillStyle=RED;c.beginPath();c.arc(W/2,H/2,84*s,0,PI*2);c.fill();drawBear(c,W/2,H/2+4*s,.95*s);
 c.save();c.translate(W/2,H/2);c.fillStyle='#fff';c.font=(15*s)+"px 'MFZ Head'";c.textAlign='center';const t="BRUNO'S BURGERAMA  -  ";for(let i=0;i<t.length;i++){c.save();c.rotate(-PI*.9+i*(PI*1.8/t.length));c.fillText(t[i],0,-68*s);c.restore()}c.restore()},{alpha:!bg,r:.5});
const menuTex=(i)=>K.paint('bj_menu'+i,1024,512,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1410');g.addColorStop(1,'#2a1e14');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle=RED;c.fillRect(0,0,W,70);P.text(c,['BURGERS','COMBO MEALS','BREAKFAST  6-11AM','SIDES & SHAKES'][i],W/2,36,{size:46,col:YEL,font:"'MFZ Head'",ls:4});
 const items=[[['THE BIG BRUNO','3.49'],['GRIZZLY STACK','4.29'],['HONEY BBQ BURGER','3.79'],['CUB BURGER','1.99'],['BACON CABIN','4.49'],['VEGGIE PAWS','3.29']],
  [['#1 BIG BRUNO MEAL','5.49'],['#2 GRIZZLY MEAL','6.29'],['#3 CHICKEN CLAWS','5.19'],['#4 DOUBLE CUB','4.99'],['CUB MEAL + TOY','3.49'],['FAMILY BUCKET','14.99']],
  [['HOTCAKE STACK','2.49'],['SUNRISE MUFFIN','1.99'],['HASH BROWNS','0.99'],['BIG BEAR PLATTER','4.49'],['COFFEE','0.79'],['OJ','1.29']],
  [['FRIES  S/M/L','1.19'],['ONION RINGS','1.59'],['HONEY SHAKE','1.99'],['CHOCO SHAKE','1.99'],['APPLE PIE','0.99'],['SOFT DRINK','0.99']]][i];
 // photo panel
 const px=i%2?40:W-360;c.fillStyle='#3a2a1a';P.rrect(c,px,95,320,380,18);c.fill();const pg=c.createRadialGradient(px+160,280,20,px+160,280,200);pg.addColorStop(0,'#f8e0a0');pg.addColorStop(1,'#c88a3a');c.fillStyle=pg;P.rrect(c,px+10,105,300,360,14);c.fill();
 if(i===3){drawFries(c,px+100,300,2.2);drawCup(c,px+220,300,1.8)}else if(i===2){c.fillStyle='#e8b060';for(let k=0;k<4;k++){c.beginPath();c.ellipse(px+160,330-k*20,90,26,0,0,PI*2);c.fill();c.strokeStyle='#a86a2a';c.lineWidth=3;c.stroke()}c.fillStyle='#fff6d0';c.fillRect(px+140,240,40,20)}else{drawBurger(c,px+160,270,2.2);if(i===1){drawFries(c,px+70,410,1.2);drawCup(c,px+250,400,1.1)}}
 P.text(c,['NEW!','VALUE','HOT!','YUM!'][i],px+250,140,{size:34,col:'#fff',stroke:RED,lw:8});
 const tx=i%2?400:40;items.forEach(([n,p],k)=>{const y=120+k*60;P.text(c,n,tx,y,{size:34,col:'#f4eedc',align:'left',font:"'MFZ Head'",max:420});c.fillStyle='rgba(255,210,58,.35)';for(let d=tx+440;d<tx+520;d+=10)c.fillRect(d,y+6,4,3);P.text(c,'$'+p,tx+580,y,{size:34,col:YEL,align:'right',font:"'MFZ Mono'"})});
 c.fillStyle=TEAL;c.fillRect(0,H-26,W,26);P.text(c,"BRUNO'S BURGERAMA  -  BEARY GOOD SINCE 1971",W/2,H-13,{size:18,col:'#fff'});P.noise(c,W,H,r,600,.15,'#fff')},{glow:.75,r:.3});

const SURF={};
const surf=k=>SURF[k]||(SURF[k]=({
 checker:()=>K.tri('bj_check',(c,W,H,r)=>{const n=2,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){c.fillStyle=(i+j)%2?'#c85a5a':'#efe4d0';c.fillRect(i*s,j*s,s,s);
  for(let k=0;k<26;k++){c.strokeStyle=(i+j)%2?'rgba(120,20,20,.18)':'rgba(150,120,90,.16)';c.lineWidth=.6+r()*1.6;c.beginPath();let x=i*s+r()*s,y=j*s+r()*s;c.moveTo(x,y);for(let q=0;q<5;q++){x+=(r()-.3)*40;y+=(r()-.5)*30;c.lineTo(Math.min(i*s+s,Math.max(i*s,x)),Math.min(j*s+s,Math.max(j*s,y)))}c.stroke()}
  c.fillStyle='rgba(60,40,30,.35)';c.fillRect(i*s,j*s,s,2);c.fillRect(i*s,j*s,2,s)}P.noise(c,W,H,r,4000,.08,'#3a2a1a',1.4);P.scratches(c,W,H,r,40,'rgba(255,255,255,.3)')},{tile:1.6,r:.32}),
 quarry:()=>K.tri('bj_quarry',(c,W,H,r)=>{const n=8,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){c.fillStyle=`hsl(${12+r()*8},${38+r()*10}%,${30+r()*8}%)`;c.fillRect(i*s+2,j*s+2,s-4,s-4)}c.fillStyle='#4a3a32';c.globalCompositeOperation='destination-over';c.fillRect(0,0,W,H);P.grime(c,W,H,r,.6)},{tile:1.2,r:.6}),
 hex:()=>K.tri('bj_hex',(c,W,H,r)=>{c.fillStyle='#9a9a96';c.fillRect(0,0,W,H);const R=16;for(let y=0;y<H+R;y+=R*1.5)for(let x=0;x<W+R;x+=R*1.732){const ox=(Math.round(y/(R*1.5))%2)*R*.866;c.fillStyle=r()<.06?'#2a2a2a':'#f2f2ee';c.beginPath();for(let a=0;a<6;a++)c.lineTo(x+ox+Math.cos(a*PI/3+PI/6)*(R-1.5),y+Math.sin(a*PI/3+PI/6)*(R-1.5));c.fill()}P.grime(c,W,H,r,.4)},{tile:.6,r:.4}),
 plate:()=>K.tri('bj_plate',(c,W,H,r)=>{c.fillStyle='#9aa2a8';c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.35)';for(let y=0;y<H;y+=32)for(let x=(y/32%2)*16;x<W;x+=32){c.save();c.translate(x,y);c.rotate(.6);c.fillRect(-10,-2,20,4);c.restore()}P.scratches(c,W,H,r,60)},{tile:.5,r:.35,m:.8}),
 paper:()=>K.tri('bj_wallp',(c,W,H,r)=>{c.fillStyle='#e8dcb4';c.fillRect(0,0,W,H);const s=W/4;for(let i=0;i<4;i++)for(let j=0;j<4;j++){const x=i*s+s/2,y=j*s+s/2;c.strokeStyle='rgba(150,120,60,.55)';c.lineWidth=3;c.beginPath();c.moveTo(x,y-s*.42);c.lineTo(x+s*.3,y);c.lineTo(x,y+s*.42);c.lineTo(x-s*.3,y);c.closePath();c.stroke();
  c.fillStyle='rgba(170,130,60,.45)';c.beginPath();c.arc(x,y,8,0,PI*2);c.fill();for(const a of[0,PI/2,PI,PI*1.5]){c.beginPath();c.ellipse(x+Math.cos(a)*16,y+Math.sin(a)*16,6,3,a,0,PI*2);c.fill()}}P.grime(c,W,H,r,.25)},{tile:.9,r:.8}),
 subway:()=>K.tri('bj_subway',(c,W,H,r)=>{c.fillStyle='#b8bcbc';c.fillRect(0,0,W,H);const tw=W/4,th=H/8;for(let j=0;j<8;j++)for(let i=-1;i<5;i++){const x=i*tw+(j%2)*tw/2;const g=c.createLinearGradient(0,j*th,0,j*th+th);g.addColorStop(0,'#fbfbf8');g.addColorStop(1,'#e2e4e2');c.fillStyle=g;c.fillRect(x+2,j*th+2,tw-4,th-4)}P.grime(c,W,H,r,.35)},{tile:.6,r:.2}),
 ceiling:()=>K.tri('bj_ceil',(c,W,H,r)=>{c.fillStyle='#e8e6e0';c.fillRect(0,0,W,H);P.noise(c,W,H,r,9000,.18,'#8a8a84',1.3);c.fillStyle='#cfd2d4';c.fillRect(0,0,W,6);c.fillRect(0,0,6,H);c.fillRect(0,H/2,W,4);c.fillRect(W/2,0,4,H);},{tile:1.2,r:.9}),
 vinyl:()=>K.tri('bj_vinyl',(c,W,H,r)=>{const n=8,s=W/n;for(let i=0;i<n;i++){const g=c.createLinearGradient(i*s,0,i*s+s,0);g.addColorStop(0,'#6a0a0a');g.addColorStop(.25,'#c41a14');g.addColorStop(.55,'#e8392a');g.addColorStop(.85,'#a8120e');g.addColorStop(1,'#5a0808');c.fillStyle=g;c.fillRect(i*s,0,s,H)}
  P.scratches(c,W,H,r,30,'rgba(255,200,200,.35)')},{tile:.4,r:.35}),
 seam:()=>K.tri('bj_seam',(c,W,H,r)=>{c.fillStyle='#b4483a';c.fillRect(0,0,W,H);for(let x=0;x<W;x+=W/8){const g=c.createLinearGradient(x,0,x+W/8,0);g.addColorStop(0,'rgba(255,255,255,.25)');g.addColorStop(.12,'rgba(0,0,0,.25)');g.addColorStop(.2,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.08)');c.fillStyle=g;c.fillRect(x,0,W/8,H)}
  P.rust(c,W,H,r,10);P.grime(c,W,H,r,.5)},{tile:3,r:.5,m:.35}),
 teal:()=>K.paintSteel(0x1f8a8a,{m:.3,worn:true}),
 tableTop:()=>K.veneer(0xc8a070,{tile:.8}),
 mahog:()=>K.veneer(0x5a2a1a,{tile:.7}),
 grey:()=>K.paintSteel(0x8a9098,{m:.3}),
 counterTile:()=>K.tri('bj_ctile',(c,W,H,r)=>{c.fillStyle='#9a9a98';c.fillRect(0,0,W,H);const n=8,s=W/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){c.fillStyle=j===3?'#141414':j===4?'#d8b030':'#f2f2ee';c.fillRect(i*s+2,j*s+2,s-4,s-4)}P.grime(c,W,H,r,.3)},{tile:1.0,r:.25}),
 granite:()=>K.tri('bj_gran',(c,W,H,r)=>{c.fillStyle='#8a8c8e';c.fillRect(0,0,W,H);P.noise(c,W,H,r,14000,.6,'#2a2a2a',2);P.noise(c,W,H,r,8000,.5,'#e8e8e8',2);P.noise(c,W,H,r,2000,.4,'#5a4a4a',3)},{tile:.6,r:.3}),
 fence:()=>K.tri('bj_fence',(c,W,H,r)=>{const n=6,s=W/n;for(let i=0;i<n;i++){c.fillStyle=`hsl(180,${45+r()*10}%,${30+r()*6}%)`;c.fillRect(i*s+2,0,s-4,H);for(let k=0;k<20;k++){c.fillStyle='rgba(0,0,0,.15)';c.fillRect(i*s+4+r()*(s-8),r()*H,1,10+r()*40)}}c.fillStyle='#1a3a3a';for(let i=0;i<n;i++)c.fillRect(i*s,0,2,H);P.grime(c,W,H,r,.6)},{tile:1.2,r:.8}),
 asphalt:()=>K.surf('asphalt',0x3a3c40),
 grass:()=>K.surf('lawn',0x4a6a2a),
 concrete:()=>K.surf('concrete',0xb4b2aa),
 leaves:()=>K.tri('bj_leaf',(c,W,H,r)=>{c.fillStyle='#2e4a1e';c.fillRect(0,0,W,H);for(let i=0;i<900;i++){c.fillStyle=`hsl(${80+r()*30},${35+r()*25}%,${18+r()*22}%)`;c.beginPath();c.ellipse(r()*W,r()*H,4+r()*7,2+r()*4,r()*PI,0,PI*2);c.fill()}},{tile:.8,r:.8})
})[k]());
const fur=K.surf?()=>K.tri('bj_fur',(c,W,H,r)=>{c.fillStyle='#8a5226';c.fillRect(0,0,W,H);for(let i=0;i<2500;i++){c.strokeStyle=`rgba(${60+r()*60},${30+r()*30},${10},${.3+r()*.4})`;c.lineWidth=1;const x=r()*W,y=r()*H;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*4,y+6+r()*6);c.stroke()}P.grime(c,W,H,r,.4)},{tile:.6,r:.55,m:.05}):null;

/* ===================== the geometry (built once, in building-local coordinates) ===================== */
let CACHE=null;
const LOTTREES=[];
function build(){if(CACHE)return CACHE;const b=K.builder('burgerama'),cols=[],occ=[];
 const S=(x0,x1,z0,z1,y0,y1,noOcc)=>{cols.push([Math.min(x0,x1),y0,Math.min(z0,z1),Math.max(x0,x1),y1,Math.max(z0,z1)]);if(!noOcc)occ.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)])};
 const chrome=K.chrome(),blk=K.blackPlastic(),st=K.steelBrushed(),glass=K.glass(0xcfe6ee,.2);
 /* ---------- grounds ---------- */
 b.box(30.4,.02,8.5,surf('grass'),[-4.8,.012,11.55],null,0);b.box(3,.03,8.5,surf('concrete'),[-.25,.02,11.55],null,0);              // lawn + path
 b.box(40,.04,2.1,surf('concrete'),[0,.03,16.95],null,0);b.box(40,.16,.18,surf('concrete'),[0,.08,17.95],null,0);                       // sidewalk + curb
 b.box(9.6,.025,24.3,surf('asphalt'),[15.2,.015,3.65],null,0);b.box(40,.025,9.6,surf('asphalt'),[0,.015,-13.2],null,0);                  // drive lane + lot
 const paint=K.mat(0xf2f2e8,.7);for(let i=0;i<=10;i++)b.box(.1,.012,5,paint,[-19+i*2.8,.032,-15.4],null,0);
 for(let i=0;i<10;i++)b.box(1.6,.12,.22,K.surf('concrete',0x9a9890),[-17.6+i*2.8,.06,-17.4],null,.03);
 const ly=K.mat(0xf2d020,.7);for(let z=-6;z<15;z+=3)b.box(.12,.012,1.6,ly,[12.6,.032,z],null,0);
 b.label(1.2,2.2,K.paint('bj_arrow',128,256,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#f2f2e8';c.beginPath();c.moveTo(W/2,10);c.lineTo(W-14,90);c.lineTo(W*.66,90);c.lineTo(W*.66,H-10);c.lineTo(W*.34,H-10);c.lineTo(W*.34,90);c.lineTo(14,90);c.fill()},{alpha:true}),[15.5,.034,-2],[-PI/2,0,PI]);
 b.label(3,.7,K.paint('bj_dt_paint',512,120,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'DRIVE THRU',W/2,H/2,{size:96,col:'#f2f2e8',font:"'MFZ Head'"})},{alpha:true}),[15.5,.034,-6.5],[-PI/2,0,PI/2]);
 /* ---------- fence round the lot ---------- */
 const fen=surf('fence'),post=K.surf('wood',0x1e5a5a);
 const fenceRun=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(z1-z0,x1-x0);b.box(L,1.8,.06,fen,[(x0+x1)/2,.92,(z0+z1)/2],[0,-a,0],0);
  for(let s=0;s<=L;s+=2.4){const x=x0+(x1-x0)*s/L,z=z0+(z1-z0)*s/L;b.box(.1,1.95,.1,post,[x,.97,z],null,0)}b.box(L,.08,.1,post,[(x0+x1)/2,1.82,(z0+z1)/2],[0,-a,0],0);S(Math.min(x0,x1)-.05,Math.max(x0,x1)+.05,Math.min(z0,z1)-.05,Math.max(z0,z1)+.05,0,1.9,true)};
 fenceRun(-19.8,-17.8,19.8,-17.8);fenceRun(19.8,-17.8,19.8,5.5);fenceRun(-19.8,-17.8,-19.8,-8.6);
 /* ---------- building skin: interior floors, linings, ceiling ---------- */
 b.box(17.1,.02,14.7,surf('checker'),[-7.45,.035,-.5],null,0);b.box(8.5,.02,6.35,surf('checker'),[5.6,.035,3.67],null,0);
 b.box(8.5,.02,7.6,surf('quarry'),[5.6,.036,-4.0],null,0);b.box(5.35,.02,3.6,surf('hex'),[-13.25,.037,-6.05],null,0);b.box(3.4,.02,2.7,surf('plate'),[8.15,.038,-6.6],null,0);
 b.box(25.7,.04,14.7,surf('ceiling'),[-3,CEIL+.02,-.5],null,0);
 // wainscot + wallpaper on the dining / lobby walls (inside faces), subway tile in the kitchen
 const pap=surf('paper'),mah=surf('mahog'),sub=surf('subway');
 const ctile=K.mat(0x6a6a68,.5);
 // lining on one face of a wall: ax=1 wall along x at z=f, ax=0 along z at x=f; n = side (+1/-1); th = wall thickness; ops = openings (as WL)
 const lineWall=(ax,f,a0,a1,n,th,kitchen,ops)=>{ops=(ops||[]).slice().sort((p,q)=>p.c-q.c);const ry=ax?(n>0?0:PI):(n>0?PI/2:-PI/2);
  const pc=(u0,u1,y0,y1,mat,dep,off)=>{if(u1-u0<.04||y1-y0<.02)return;const o=f+n*(th/2+off),u=(u0+u1)/2,y=(y0+y1)/2;if(ax)b.box(u1-u0,y1-y0,dep,mat,[u,y,o],null,0);else b.box(dep,y1-y0,u1-u0,mat,[o,y,u],null,0)};
  const span=(u0,u1,y0,y1)=>{if(kitchen){pc(u0,u1,Math.max(y0,.12),y1,sub,.02,.01);if(y0<.12)pc(u0,u1,0,.12,ctile,.03,.015);return}
   if(y0<.9){pc(u0,u1,y0,Math.min(y1,.9),mah,.03,.015);pc(u0,u1,.88,.94,mah,.07,.035);
    if(y0===0&&y1>.9)for(let s0=u0+.15;s0+.7<=u1-.1;s0+=.95){const u=s0+.35,o=f+n*(th/2+.031);b.push(ax?[u,.46,o]:[o,.46,u],[0,ry,0]);b.frame(.7,.56,.04,mah,[0,0,0],.012);b.pop()}}
   if(y1>.9)pc(u0,u1,Math.max(y0,.9),y1,pap,.012,.006);if(y1>=CEIL)pc(u0,u1,CEIL-.1,CEIL,mah,.05,.025)};
  let a=a0;for(const p of ops){const hw=p.k==='w'?.75:.65;span(a,p.c-hw,0,CEIL);if(p.k==='w'){span(p.c-hw,p.c+hw,0,.9);span(p.c-hw,p.c+hw,2.75,CEIL)}else span(p.c-hw,p.c+hw,2.4,CEIL);a=p.c+hw}span(a,a1,0,CEIL)};
 const W=a=>a.map(c=>({k:'w',c})),Dr=a=>a.map(c=>({k:'d',c}));
 lineWall(1,ZB1,XB0,XB1,-1,.3,0,[...W([-14.6,-12.9,-11.2,-9.5,-7.8,-6.1,-4.4,-2.7,2.2,3.9,5.6,7.3,9.0]),...Dr([-.9,.4])]);
 lineWall(0,XB0,-4.2,ZB1,1,.3,0,W([5.6,3.9,2.2,.5,-1.2,-2.9]));
 lineWall(0,XB1,0,ZB1,-1,.3,0,W([5.6,3.9,2.2]));lineWall(0,XB1,ZB0,0,-1,.3,1,W([-3.6]));
 lineWall(0,1.2,ZB0,-.1,-1,.16,0,Dr([-2.6]));lineWall(0,1.2,ZB0,-.1,1,.16,1,Dr([-2.6]));
 lineWall(1,ZB0,-10.5,1.2,1,.3,0);lineWall(1,ZB0,1.2,6.4,1,.3,1,Dr([5.5]));lineWall(1,ZB0,-16,-10.5,1,.3,1);
 lineWall(1,-4.2,XB0,-10.5,1,.16,0,Dr([-14.6,-11.9]));lineWall(1,-4.2,XB0,-10.5,-1,.16,1,Dr([-14.6,-11.9]));lineWall(0,-10.5,ZB0,-4.2,1,.16,0);
 lineWall(0,-13.25,ZB0,-4.2,1,.16,1);lineWall(0,-13.25,ZB0,-4.2,-1,.16,1);lineWall(0,-10.5,ZB0,-4.2,-1,.16,1);lineWall(0,XB0,ZB0,-4.2,1,.3,1);
 lineWall(1,-5.2,6.4,XB1,1,.16,1,Dr([8.1]));lineWall(0,6.4,ZB0,-5.2,-1,.16,1);
 /* ---------- light: panels + globe pendants ---------- */
 const lit=K.mat(0xffffff,.4,0,{emissive:0xfff6e0,emissiveIntensity:.9});
 for(let x=-14;x<9;x+=3.4)for(let z=-6;z<6;z+=3.2){b.box(1.18,.02,.58,lit,[x,CEIL-.005,z],null,0);b.push([x,CEIL-.012,z],[-PI/2,0,0]);b.frame(1.22,.62,.02,K.mat(0xd8d8d8,.5),[0,0,0],.008);b.pop()}
 /* ---------- booths ---------- */
 const vin=surf('vinyl'),top=surf('tableTop'),grey=surf('grey'),teal=surf('teal');
 function booth(x,z,ry,dbl){b.push([x,0,z],[0,ry,0]);
  // unit: table running out from the "wall" (local -z), benches either side along local x
  for(const sd of(dbl==='half'?[1]:[-1,1])){const bx=sd*.78;b.rbox(.62,.45,1.5,.04,grey,[bx,.225,0]);b.box(.6,.04,1.45,teal,[bx,.43,0],null,.01);b.rbox(.56,.12,1.45,.05,vin,[bx,.5,0]);
   b.rbox(.16,.7,1.48,.05,vin,[bx+sd*.27,.95,0],[0,0,sd*.08]);b.rbox(.08,.95,1.52,.03,grey,[bx+sd*.36,.86,0]);b.box(.04,.06,1.52,teal,[bx+sd*.36,1.36,0],null,.01);
   }
  {const sw=Math.abs(Math.sin(ry))>.5,hx=sw?.72:1.18,hz=sw?1.18:.72;S(x-hx,x+hx,z-hz,z+hz,0,1.0,true)}
  b.rbox(.92,.04,1.25,.012,top,[0,.74,-.08]);b.box(.95,.025,1.28,teal,[0,.71,-.08],null,.006);b.cyl(.04,.04,.7,chrome,[0,.36,.0],null,10);b.cyl(.22,.22,.02,chrome,[0,.01,.0],null,16);
  // table clutter: napkin dispenser, salt & pepper, ketchup, a tray left behind
  b.rbox(.1,.12,.07,.01,chrome,[.2,.82,-.55]);b.cyl(.02,.022,.07,K.glass(0xffffff,.6),[.33,.795,-.58],null,10);b.cyl(.02,.022,.07,K.glass(0x3a3a3a,.7),[.38,.795,-.58],null,10);b.cyl(.025,.03,.16,K.mat(0xc8261c,.35),[.28,.84,-.5],null,10);
  if(b.rnd()<.45){b.rbox(.42,.02,.32,.01,K.mat(0x1e8a4a,.45),[-.1,.77,.1],[0,.2,0]);b.rbox(.12,.06,.1,.01,K.paint('bj_wrap',64,64,(c,W,H)=>{c.fillStyle='#f4eedc';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,26,W,12)}),[-.15,.81,.1])}
  b.pop()}
 for(let i=0;i<5;i++)booth(-14.3+i*2.55,6.05,PI);         // along the front windows
 for(let i=0;i<3;i++)booth(-15.05,4.0-i*2.55,PI/2);        // along the left windows
 for(let i=0;i<3;i++)booth(-8.6,3.7-i*2.55,PI/2);   // island row, back to back
 /* ---------- freestanding tables with wire chairs ---------- */
 const wire=K.mat(0x1e6a5a,.4,.6);
 function table4(x,z){b.cyl(.45,.45,.04,top,[x,.74,z],null,24);b.cyl(.04,.04,.72,K.mat(0x3a3a3a,.4,.6),[x,.37,z],null,10);b.cyl(.28,.3,.03,K.mat(0x3a3a3a,.4,.6),[x,.015,z],null,16);S(x-.5,x+.5,z-.5,z+.5,0,.78,true);
  for(let k=0;k<4;k++){const a=k*PI/2+.3+b.rnd()*.3,cx=x+Math.cos(a)*.72,cz=z+Math.sin(a)*.72;b.push([cx,0,cz],[0,-a+PI/2,0]);b.cyl(.2,.2,.035,K.mat(0xc8261c,.4),[0,.46,0],null,16);
   for(const q of[[-.15,-.15],[.15,-.15],[-.15,.15],[.15,.15]])b.cyl(.009,.009,.45,wire,[q[0],.225,q[1]],[q[1]*.4,0,-q[0]*.4],6);
   b.tor(.18,.008,wire,[0,.85,.18],[0,0,0],PI,14);for(let i=0;i<6;i++){const t=PI*(i+.5)/6;b.cyl(.006,.006,.4,wire,[Math.cos(t)*.18,.66,.18],null,4)}b.pop()}}
 table4(-4.6,2.4);table4(-4.6,-.6);table4(-2.2,1.0);table4(-2.2,-2.2);table4(-5.4,-3.3);
 /* ---------- condiment + tray station ---------- */
 b.push([.5,0,-.95]);b.rbox(.7,.95,1.6,.01,mah,[0,.475,0]);b.rbox(.74,.04,1.64,.01,surf('granite'),[0,.97,0]);
 for(let i=0;i<3;i++){b.cyl(.06,.06,.22,st,[-.12,1.1,-.5+i*.18],null,14);b.cyl(.012,.012,.1,blk,[-.12,1.26,-.5+i*.18],null,6);b.box(.06,.02,.03,blk,[-.18,1.3,-.5+i*.18])}   // pump dispensers
 b.rbox(.18,.25,.12,.01,chrome,[-.15,1.1,.2]);b.cyl(.05,.05,.2,K.glass(0xffffff,.5),[-.15,1.09,.45],null,12);for(let i=0;i<12;i++)b.cyl(.003,.003,.24,K.mat([0xc8261c,0x1e6a8a,0xf2c12e][i%3],.5),[-.15+(i%4-1.5)*.012,1.15,.45+(Math.floor(i/4)-1)*.012],null,4);
 for(let i=0;i<8;i++)b.rbox(.42,.02,.32,.01,K.mat(0x1e8a4a,.45),[.05,1.0+i*.022,.6]);b.label(.5,.5,K.paint('bj_thanks',256,256,(c,W,H)=>{c.fillStyle='#2a2018';c.fillRect(0,0,W,H);c.fillStyle='#111';c.fillRect(40,60,176,60);P.text(c,'THANK YOU',W/2,170,{size:44,col:YEL});P.text(c,'PUSH',W/2,90,{size:30,col:'#ddd'})},{}),[.355,.5,0],[0,PI/2,0]);b.pop();S(.1,.9,-1.8,-.1,0,1.1);
 /* ---------- service counter ---------- */
 const ct=surf('counterTile'),gran=surf('granite');
 b.box(7.2,1.0,.16,ct,[4.95,.5,.62],null,0);b.box(7.2,1.0,.7,K.surf('mecha',0x5a5a58),[4.95,.5,.2],null,0);b.rbox(7.3,.05,.95,.01,gran,[4.95,1.02,.32]);b.box(7.25,.08,.02,K.mat(0x222222,.5),[4.95,.04,.71]);
 b.box(.16,1.0,.95,ct,[1.4,.5,.32],null,0);S(1.3,8.6,-.15,.8,0,1.05);
 // registers, order tray with our bag + drink, straws, tip jar, "please wait" sign
 for(const x of[2.4,4.6,6.8]){b.push([x,1.045,.35]);b.rbox(.4,.08,.36,.01,K.mat(0x3a3d42,.4,.3),[0,.04,0]);b.add(K.rboxGeo(.38,.06,.2,.01,1),K.paint('bj_keys',256,128,(c,W,H)=>{c.fillStyle='#2a2c30';c.fillRect(0,0,W,H);for(let i=0;i<24;i++){c.fillStyle=i%6===5?'#c8302a':'#e8e6de';c.fillRect(8+(i%6)*41,8+Math.floor(i/6)*30,34,24)}},{r:.5}),{p:[0,.1,.05],r:[-.35,0,0]});
  b.cyl(.015,.015,.22,chrome,[0,.2,-.12],null,8);b.rbox(.3,.2,.04,.01,blk,[0,.38,-.12],[-.1,0,0]);b.label(.26,.16,K.paint('bj_pos',256,160,(c,W,H)=>{c.fillStyle='#0a1a2a';c.fillRect(0,0,W,H);c.fillStyle='#1e8a4a';for(let i=0;i<9;i++)c.fillRect(10+(i%3)*80,30+Math.floor(i/3)*42,72,36);P.text(c,'ORDER #212',W/2,16,{size:16,col:'#fff'})},{glow:.8}),[0,.38,-.098],[-.1,0,0]);b.pop()}
 b.rbox(.42,.02,.32,.01,K.mat(0x1e8a4a,.45),[3.5,1.06,.4],[0,-.15,0]);b.push([3.45,1.07,.4]);b.add(K.rboxGeo(.2,.28,.12,.006,1),K.paint('bj_bag',200,280,(c,W,H,r)=>{c.fillStyle='#b88a5a';c.fillRect(0,0,W,H);for(let i=0;i<40;i++){c.fillStyle='rgba(90,60,30,.15)';c.fillRect(0,r()*H,W,1)}drawBear(c,W/2,H*.55,.9);c.fillStyle=RED;c.font="bold 22px 'MFZ Head'";c.textAlign='center';c.fillText('BURGERAMA',W/2,H*.88);c.fillStyle='#a07a4a';c.fillRect(0,0,W,22)},{r:.85}),{p:[0,.14,0]});b.pop();
 b.cyl(.04,.032,.16,K.paint('bj_cup',128,64,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,20,W,24);P.text(c,'B',W*.25,32,{size:22,col:YEL});P.text(c,'B',W*.75,32,{size:22,col:YEL})}),[3.68,1.15,.48],null,14);b.cyl(.042,.042,.01,K.mat(0xdddddd,.5),[3.68,1.235,.48],null,14);b.cyl(.004,.004,.14,RED&&K.mat(0xc8261c,.5),[3.69,1.29,.48],[.1,0,.1],4);
 b.cyl(.07,.06,.18,K.glass(0xffffff,.35),[7.9,1.135,.45],null,14);b.label(.12,.05,K.paint('bj_tip',128,48,(c,W,H)=>{c.fillStyle='#fff';c.fillRect(0,0,W,H);P.text(c,'TIPS :)',W/2,H/2,{size:24,col:'#222',font:"'MFZ Type'"})}),[7.9,1.14,.512]);
 b.label(.5,.18,K.paint('bj_wait',300,108,(c,W,H)=>{c.fillStyle=YEL;c.fillRect(0,0,W,H);P.text(c,'PLEASE WAIT HERE',W/2,H*.38,{size:28,col:'#1a1a1a'});P.text(c,'TO BE SERVED',W/2,H*.75,{size:24,col:'#1a1a1a'})}),[8.25,1.2,.7],[-.05,0,0]);b.box(.04,.15,.04,chrome,[8.25,1.1,.66]);
 // half door at the staff end of the counter
 b.rbox(1.2,.95,.05,.01,mah,[9.2,.5,.32]);b.frame(1.1,.8,.04,mah,[9.2,.5,.36],.01);
 /* ---------- menu boards hung over the counter ---------- */
 for(let i=0;i<4;i++){const x=2.0+i*1.98;b.rbox(1.92,.98,.08,.01,blk,[x,2.6,.05]);b.label(1.84,.9,menuTex(i),[x,2.6,.092]);for(const s of[-.8,.8])b.cyl(.006,.006,CEIL-3.1,chrome,[x+s,3.15,.05],null,4)}
 b.label(.8,.8,logoTex('bj_logo_wall',256,256,null),[1.03,2.1,-5.6],[0,-PI/2,0]);
 /* ---------- posters, clock, signs on the dining walls ---------- */
 const poster=(key,draw,x,y,z,ry,w,h)=>{b.rbox(w+.08,h+.08,.03,.005,K.mat(0x1a1a1a,.4,.3),[x,y,z],[0,ry,0]);b.label(w,h,K.paint(key,256,Math.round(256*h/w),draw,{r:.4}),[x+Math.sin(ry)*.017,y,z+Math.cos(ry)*.017],[0,ry,0])};
 poster('bj_p1',(c,W,H,r)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'TRY THE',W/2,30,{size:28,col:'#fff'});P.text(c,'GRIZZLY STACK',W/2,64,{size:34,col:YEL,max:W*.92});drawBurger(c,W/2,H*.62,1.6);P.text(c,'3 PATTIES. NO MERCY.',W/2,H-24,{size:18,col:'#fff'})},-11.5,2.0,6.82,PI,.9,1.2);
 poster('bj_p2',(c,W,H,r)=>{c.fillStyle=TEAL;c.fillRect(0,0,W,H);P.text(c,'CUB MEAL',W/2,34,{size:40,col:YEL});drawBear(c,W/2,H*.5,1.1);P.text(c,'FREE TOY INSIDE!',W/2,H-26,{size:22,col:'#fff'})},-6.4,2.0,6.82,PI,.9,1.2);
 poster('bj_p3',(c,W,H,r)=>{c.fillStyle='#f4eedc';c.fillRect(0,0,W,H);P.text(c,'NOW HIRING',W/2,40,{size:40,col:RED});P.text(c,'JOIN THE DEN',W/2,84,{size:24,col:'#333'});drawBear(c,W/2,H*.6,.9);P.text(c,'ASK FOR A MANAGER',W/2,H-24,{size:18,col:'#333'})},-15.82,2.0,0,PI/2,.9,1.2);
 b.cyl(.22,.22,.05,K.mat(0xf4f4ee,.4),[-15.8,2.65,-2.5],[0,0,PI/2],24);b.tor(.22,.02,RED&&K.mat(0xc8261c,.4),[-15.78,2.65,-2.5],[0,PI/2,0]);b.box(.01,.16,.012,blk,[-15.76,2.7,-2.5],[.4,0,0]);b.box(.01,.11,.012,blk,[-15.76,2.66,-2.47],[-1.3,0,0]);
 b.label(.6,.16,K.paint('bj_emp',300,80,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'EMPLOYEES ONLY',W/2,H/2,{size:30,col:'#fff'})}),[1.03,2.6,-2.6],[0,-PI/2,0]);
 for(const [x,t,col] of[[-14.6,'MEN','#2a5a9a'],[-11.9,'WOMEN','#b02a6a']])b.label(.34,.34,K.paint('bj_wc'+t,128,128,(c,W,H)=>{c.fillStyle=col;P.rrect(c,4,4,W-8,H-8,14);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(W/2,32,13,0,PI*2);c.fill();if(t==='MEN')c.fillRect(W/2-14,48,28,40);else{c.beginPath();c.moveTo(W/2,46);c.lineTo(W/2+22,92);c.lineTo(W/2-22,92);c.fill()}P.text(c,t,W/2,110,{size:16,col:'#fff'})}),[x+.95,1.7,-4.03]);
 // wet floor sign (yellow A-frame)
 b.push([-.9,0,4.3],[0,.6,0]);const yel=K.paint('bj_wet',128,256,(c,W,H)=>{c.fillStyle='#f2c12e';c.fillRect(0,0,W,H);c.fillStyle='#1a1a1a';c.beginPath();c.moveTo(W/2,40);c.lineTo(W-20,140);c.lineTo(20,140);c.closePath();c.lineWidth=6;c.strokeStyle='#1a1a1a';c.stroke();P.text(c,'!',W/2,110,{size:50,col:'#1a1a1a'});P.text(c,'CAUTION',W/2,180,{size:24,col:'#1a1a1a'});P.text(c,'WET FLOOR',W/2,212,{size:20,col:'#1a1a1a'})},{r:.4});
 for(const s of[-1,1])b.add(K.rboxGeo(.3,.62,.012,.004,1),yel,{p:[0,.3,s*.1],r:[-s*.18,s>0?0:PI,0]});b.pop();
 /* ---------- kitchen ---------- */
 // back counter: soda fountain, coffee brewers, burger chute under heat lamps
 b.rbox(6.8,.9,.65,.01,st,[4.9,.45,-1.6]);S(1.45,8.35,-1.95,-1.25,0,1.0);
 b.push([2.5,.9,-1.62]);b.rbox(1.0,.6,.55,.02,K.mat(0xd8dadc,.35,.5),[0,.3,0]);b.label(.96,.24,K.paint('bj_soda',512,128,(c,W,H)=>{const n=6;['BLITZ','POLAR','ZEST-O','ROCKET','ROOT BR','ICED TEA'].forEach((s,i)=>{c.fillStyle=['#c8261c','#1e5aa8','#e89a0c','#1e8a3a','#5a2a14','#c8902a'][i];c.fillRect(i*W/n+3,0,W/n-6,H);P.text(c,s,(i+.5)*W/n,H/2,{size:22,col:'#fff',max:W/n-10})})},{glow:.5}),[0,.45,.278]);
 for(let i=0;i<6;i++){b.cyl(.015,.012,.05,chrome,[-.42+i*.168,.2,.2],null,8);b.box(.08,.04,.04,K.mat(0x222222,.5),[-.42+i*.168,.25,.24])}b.box(.96,.02,.3,K.mat(0x8a8c8e,.4,.6),[0,.01,.15]);b.pop();
 for(const x of[3.7,4.3]){b.rbox(.42,.55,.4,.01,st,[x,1.18,-1.65]);b.lathe([[0,0],[.06,0],[.075,.04],[.08,.09],[.06,.14],[0,.15]],K.glass(0x3a2210,.55),[x,.92,-1.5],16)}
 b.rbox(1.6,.12,.55,.01,st,[6.0,1.4,-1.62]);for(let i=0;i<4;i++)b.add(new T.CylinderGeometry(.06,.1,.08,14,1,true),K.mat(0xd8d8d8,.3,.8),{p:[5.4+i*.4,1.32,-1.62]});
 b.box(1.5,.04,.5,st,[6.0,1.0,-1.6]);for(let i=0;i<9;i++)b.rbox(.12,.06,.12,.01,K.paint('bj_wrap2',64,64,(c,W,H)=>{c.fillStyle='#f4eedc';c.fillRect(0,0,W,H);c.fillStyle=RED;c.fillRect(0,0,W,10);drawBear(c,W/2,38,.25)},{r:.7}),[5.4+(i%5)*.3,1.05,-1.7+Math.floor(i/5)*.16]);
 b.box(1.4,.003,.4,K.mat(0xffb060,.4,0,{emissive:0xff8a30,emissiveIntensity:.6}),[6.0,1.03,-1.6]);
 // cooking line under the hood: flat-top grill + two fryers, hood with filters
 b.push([2.4,0,-7.4]);b.rbox(1.4,.9,.8,.01,st,[0,.45,0]);b.box(1.36,.03,.72,K.mat(0x1e1e1e,.35,.8),[0,.915,0]);b.box(1.36,.08,.04,st,[0,.97,-.36]);for(let i=0;i<4;i++){b.knob(K.mat(0x1a1a1a,.4),[-.45+i*.3,.75,.4],.018)}
 for(let i=0;i<6;i++)b.cyl(.055,.055,.015,K.mat(0x4a2414,.6),[-.45+(i%3)*.3,.94,-.1+Math.floor(i/3)*.25],null,16);b.box(.25,.004,.08,chrome,[.55,.94,.2],[0,.4,0]);b.pop();
 for(const x of[3.6,4.3]){b.push([x,0,-7.45]);b.rbox(.6,.95,.75,.01,st,[0,.475,0]);b.box(.5,.04,.55,K.mat(0x3a2a10,.25,.2),[0,.9,0]);for(const s of[-.12,.12]){b.box(.2,.12,.3,K.mat(0xb8bcc0,.4,.8),[s,.98,.0]);b.cyl(.012,.012,.3,blk,[s,1.0,.3],[PI/2-.5,0,0],8)}b.knob(blk,[0,.6,.38],.02);b.pop()}
 b.rbox(3.0,.6,1.1,.02,st,[3.2,2.6,-7.3]);b.box(2.9,.3,.02,K.mat(0x8a8c8e,.5,.7),[3.2,2.2,-6.76],null,0);for(let i=0;i<5;i++)b.box(.52,.28,.02,K.mat(0x6a6c6e,.4,.8),[1.97+i*.6,2.42,-6.8],[-.6,0,0],0);b.cyl(.2,.2,CEIL-2.9,st,[3.2,3.05,-7.4],null,14);
 S(1.65,4.65,-7.85,-7.0,0,1.0);
 // prep island with bun racks, rolling bun cart
 b.push([3.8,0,-4.3]);b.rbox(2.6,.04,.75,.006,st,[0,.9,0]);b.box(2.5,.025,.65,st,[0,.25,0]);for(const x of[-1.25,1.25])for(const z of[-.33,.33])b.cyl(.02,.02,.88,st,[x,.44,z],null,10);
 b.box(.5,.03,.32,K.mat(0xf4f4ee,.6),[-.6,.935,0]);for(let i=0;i<6;i++)b.add(K.sphGeo(.05,12,6,0,PI/2),K.mat(0xd8902a,.55),{p:[-.8+(i%3)*.15,.92,-.25+Math.floor(i/3)*.12]});b.box(.4,.06,.3,K.mat(0x5a2a14,.6),[.5,.93,0]);b.cyl(.15,.14,.12,st,[.9,.96,.1],null,18,true);b.pop();S(2.45,5.15,-4.7,-3.9,0,.95);
 b.push([8.75,0,-2.8]);for(let s=0;s<6;s++){b.box(.5,.02,.7,K.mat(0xb8bcc0,.4,.8),[0,.25+s*.28,0]);for(let i=0;i<6;i++)b.add(K.sphGeo(.045,10,6,0,PI/2),K.mat(0xd8902a,.55),{p:[-.15+(i%2)*.3,.26+s*.28,-.25+Math.floor(i/2)*.25]})}for(const x of[-.25,.25])for(const z of[-.35,.35])b.cyl(.012,.012,1.8,st,[x,.95,z],null,6);b.pop();S(8.45,9.05,-3.2,-2.4,0,1.85);
 // reach-in fridge (double door) and hand sink on the partition wall, ice machine by the drive-thru
 b.push([1.75,0,-5.9],[0,PI/2,0]);b.rbox(1.3,2.0,.75,.01,st,[0,1.0,0]);for(const s of[-1,1]){b.rbox(.62,1.7,.04,.01,st,[s*.32,1.05,.39]);b.box(.03,.5,.04,chrome,[s*.06,1.1,.42])}b.label(.3,.07,K.paint('bj_fr',200,48,(c,W,H)=>{c.fillStyle='#111';c.fillRect(0,0,W,H);P.text(c,'34°F',W/2,H/2,{size:30,col:'#3aff6a',font:"'MFZ Mono'"})},{glow:.8}),[0,1.95,.385]);b.pop();S(1.35,2.15,-6.6,-5.2,0,2.0);
 b.push([1.45,0,-3.9],[0,PI/2,0]);b.rbox(.45,.25,.4,.01,st,[0,.85,0]);b.tube([[0,.95,-.12],[0,1.15,-.12],[0,1.12,0]],.01,chrome,10,6);b.rbox(.12,.18,.06,.01,K.mat(0xf4f4ee,.4),[.3,1.2,-.17]);b.pop();
 b.rbox(.7,1.6,.65,.01,st,[7.0,.8,-4.75]);b.label(.4,.1,K.paint('bj_ice',200,50,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'ICE-O-MATIC',W/2,H/2,{size:26,col:'#2a5a9a'})},{alpha:true}),[7.0,1.4,-4.42]);S(6.62,7.38,-5.1,-4.4,0,1.6);
 // drive-thru station
 b.rbox(.7,.95,1.4,.01,st,[9.5,.475,-3.9]);b.rbox(.3,.2,.04,.01,blk,[9.4,1.15,-3.4],[0,-PI/2,0]);b.tor(.06,.008,blk,[9.4,1.4,-4.4],[0,PI/2,0]);for(let i=0;i<6;i++)b.rbox(.18,.26,.1,.004,K.mat(0xb88a5a,.85),[9.55,1.1+i*.0,-4.15+i*.05]);S(9.15,9.85,-4.6,-3.2,0,1.0);
 b.box(.08,.04,1.8,chrome,[10.3,1.0,-3.6],null,.01);b.box(.45,.04,1.6,st,[10.45,.98,-3.6],null,.006);   // outside sill shelf
 /* ---------- walk-in freezer interior ---------- */
 for(const z of[-7.6,-6.6])for(let s=0;s<4;s++){b.box(3.2,.03,.4,K.mat(0xb8bcc0,.4,.8),[8.2,.3+s*.45,z]);const rnd=b.rnd;for(let i=0;i<5;i++)if(rnd()<.8)b.rbox(.4,.28,.32,.006,K.surf('cardboard',0xb08a58),[6.9+i*.6,.46+s*.45,z],[0,(rnd()-.5)*.2,0])}
 S(6.6,9.85,-7.85,-6.35,0,1.9);b.label(1.4,.4,K.paint('bj_frost',512,140,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<800;i++){c.fillStyle='rgba(235,248,255,'+r()*.5+')';c.fillRect(r()*W,r()*H*.6,2,2)}},{alpha:true}),[8.2,2.8,-7.82]);
 b.label(.5,.14,K.paint('bj_wi',256,72,(c,W,H)=>{c.fillStyle='#1e5aa8';c.fillRect(0,0,W,H);P.text(c,'WALK-IN  -10°F',W/2,H/2,{size:28,col:'#fff'})}),[8.1,2.65,-5.04]);
 /* ---------- restrooms ---------- */
 for(const [x,urinal] of[[-14.6,1],[-11.9,0]]){const por=K.mat(0xf4f4f0,.2);b.push([x,0,-7.5]);b.lathe([[0,0],[.18,0],[.2,.1],[.22,.4],[0,.4]],por,[0,0,0],18);b.rbox(.4,.4,.2,.03,por,[0,.6,-.25]);b.cyl(.2,.2,.03,K.mat(0x1a1a1a,.4),[0,.42,0],null,18);b.pop();
  b.push([x+.95,0,-7.75]);b.rbox(.5,.18,.4,.03,por,[0,.85,.1]);b.tube([[0,.95,-.05],[0,1.1,-.05],[0,1.08,.1]],.008,chrome,10,6);b.plane(.5,.7,K.mat(0xd8e2e6,.03,1),[0,1.55,.02]);b.rbox(.25,.3,.15,.03,K.mat(0xe8e8e4,.3,.3),[-.6,1.3,.05]);b.pop();
  if(urinal){b.rbox(.38,.6,.32,.08,por,[-15.7,.85,-6.0]);}S(x-.25,x+.25,-7.85,-7.2,0,.8,true)}
 b.box(.04,2.0,1.4,K.surf('mecha',0x8a8a84,{m:.3}),[-14.05,1.0,-7.2]);   // stall partition
 /* ---------- roof: mansard (red standing seam) + teal fascia + flat deck, sign, mascot, HVAC ---------- */
 const seam=surf('seam'),fx0=XB0-.6,fx1=XB1+.6,fz0=ZB0-.6,fz1=ZB1+.6,ix0=XB0+1.4,ix1=XB1-1.4,iz0=ZB0+1.4,iz1=ZB1-1.4,ye=3.5,yt=4.95;
 const quad=(a,bb,c,d)=>{const g=new T.BufferGeometry(),p=new Float32Array([...a,...bb,...c,...a,...c,...d]);g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('uv',new T.BufferAttribute(new Float32Array(12),2));g.computeVertexNormals();return g};
 b.add(quad([fx0,ye,fz1],[fx1,ye,fz1],[ix1,yt,iz1],[ix0,yt,iz1]),seam);b.add(quad([fx1,ye,fz0],[fx0,ye,fz0],[ix0,yt,iz0],[ix1,yt,iz0]),seam);
 b.add(quad([fx1,ye,fz1],[fx1,ye,fz0],[ix1,yt,iz0],[ix1,yt,iz1]),seam);b.add(quad([fx0,ye,fz0],[fx0,ye,fz1],[ix0,yt,iz1],[ix0,yt,iz0]),seam);
 for(const [x,z,w,d] of[[(fx0+fx1)/2,fz1,fx1-fx0+.1,.12],[(fx0+fx1)/2,fz0,fx1-fx0+.1,.12],[fx1,(fz0+fz1)/2,.12,fz1-fz0],[fx0,(fz0+fz1)/2,.12,fz1-fz0]])b.box(w,.32,d,teal,[x,ye-.12,z],null,.01);
 b.box(fx1-fx0,.02,fz1-fz0,K.mat(0xe8e2d4,.7),[(fx0+fx1)/2,ye-.27,(fz0+fz1)/2],null,0);                       // soffit
 b.box(ix1-ix0,.15,iz1-iz0,K.surf('concrete',0x6a6a66),[(ix0+ix1)/2,yt-.02,(iz0+iz1)/2],null,0);for(const [x,z,w,d] of[[(ix0+ix1)/2,iz1,ix1-ix0,.15],[(ix0+ix1)/2,iz0,ix1-ix0,.15],[ix1,(iz0+iz1)/2,.15,iz1-iz0],[ix0,(iz0+iz1)/2,.15,iz1-iz0]])b.box(w,.45,d,K.surf('concrete',0x8a8a84),[x,yt+.2,z],null,0);
 S(ix0,ix1,iz0,iz1,yt-.1,yt+.06,true);
 b.rbox(1.6,1.0,1.2,.03,K.mat(0xb8bcc0,.4,.7),[4,yt+.55,-3.5]);b.vents(6,1.4,.7,K.mat(0x6a6c6e,.5,.6),[4,yt+.55,-2.89]);b.cyl(.45,.45,.1,K.mat(0x2a2a2a,.5,.4),[4,yt+1.1,-3.5],null,20);b.cyl(.15,.15,.8,K.mat(0x8a8c8e,.4,.8),[3.2,yt+.4,-6.5],null,12);
 // raised front sign
 b.box(12.2,1.7,.25,K.mat(0x7a2a1a,.6),[-3,yt+.85,iz1+.1],null,.02);b.box(12.4,.12,.32,teal,[-3,yt+1.76,iz1+.1],null,.01);
 b.label(12,1.6,K.paint('bj_sign',1536,200,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(0,0,0,0)';P.text(c,"BRUNO'S",W*.16,H*.5,{size:110,col:YEL,font:"'MFZ Head'",stroke:'#5a1a0a',lw:10});
  P.text(c,'BURGERAMA',W*.62,H*.46,{size:150,col:'#e8402a',font:"'MFZ Head'",ls:10,stroke:YEL,lw:10});c.fillStyle=TEAL;c.fillRect(W*.32,H*.86,W*.62,12)},{alpha:true,glow:.45}),[-3,yt+.85,iz1+.23]);
 // pole sign with a giant burger on top
 b.push([18.0,0,15.1]);b.cyl(.22,.26,9.4,K.mat(0x6a6c6e,.4,.7),[0,4.7,0],null,16);b.cyl(.6,.7,.4,K.surf('concrete',0x9a9890),[0,.2,0],null,16);S(17.6,18.4,14.7,15.5,0,9,true);
 b.rbox(3.6,2.4,.5,.2,K.mat(0xc8261c,.4,.2),[0,7.0,0]);for(const sd of[1,-1]){b.box(3.6,.08,.06,K.mat(0xffd23a,.3,.3),[0,8.16,sd*.24],null,.01);b.box(3.6,.08,.06,K.mat(0xffd23a,.3,.3),[0,5.84,sd*.24],null,.01)}for(const sd of[1,-1])b.label(3.2,2.1,K.paint('bj_pole',768,504,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle=YEL;c.beginPath();c.arc(W*.2,H*.5,130,0,PI*2);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(W*.2,H*.5,120,0,PI*2);c.fill();drawBear(c,W*.2,H*.55,1.5);P.text(c,"BRUNO'S",W*.62,H*.28,{size:80,col:YEL,font:"'MFZ Head'"});P.text(c,'BURGERAMA',W*.62,H*.55,{size:96,col:'#fff',font:"'MFZ Head'",max:W*.68});P.text(c,'OPEN 24 HRS  -  DRIVE THRU',W*.62,H*.82,{size:30,col:YEL,max:W*.7})},{alpha:true,glow:.6}),[0,7.0,sd*.255],[0,sd>0?0:PI,0]);
 // the burger
 const by=9.2;b.add(K.sphGeo(1.1,28,14,0,PI/2),K.mat(0xd8902a,.45),{p:[0,by+.55,0],s:[1,.62,1]});for(let i=0;i<40;i++){const a=i*2.4,rr=.3+((i*37)%60)/100;b.add(K.sphGeo(.05,6,4),K.mat(0xfff0c0,.5),{p:[Math.cos(a)*rr*.9,by+.55+Math.sqrt(Math.max(0,1-rr*rr))*.66,Math.sin(a)*rr*.9],s:[1,.5,1.6]})}
 b.add(K.torGeo(1.08,.09,8,40),K.mat(0x4aa83a,.5),{p:[0,by+.48,0],r:[PI/2,0,0],s:[1,1,.7]});b.add(new T.BoxGeometry(1.9,.05,1.9),K.mat(0xf2c12e,.4),{p:[0,by+.44,0],r:[0,PI/4,0]});
 b.cyl(1.05,1.05,.32,K.mat(0x5a2a14,.75),[0,by+.25,0],null,32);b.cyl(1.0,1.0,.06,K.mat(0xd83a2a,.4),[0,by+.07,0],null,32);b.cyl(1.04,.98,.3,K.mat(0xc8802a,.5),[0,by-.12,0],null,32);b.pop();
 // drive-thru menu board, speaker post, clearance bar, order sign
 b.push([12.3,0,-9.6],[0,PI/2,0]);for(const s of[-.8,.8])b.cyl(.06,.06,2.4,K.mat(0x3a3a3a,.4,.6),[s,1.2,0],null,10);b.rbox(2.1,1.5,.18,.03,blk,[0,1.8,0]);b.label(1.96,1.36,menuTex(1),[0,1.8,.095]);b.box(2.2,.3,.22,K.mat(0xc8261c,.4),[0,2.68,0],null,.02);
 b.label(2.0,.26,K.paint('bj_dtm',512,64,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'ORDER HERE',W/2,H/2,{size:40,col:YEL})},{glow:.5}),[0,2.68,.112]);b.pop();S(12.0,12.6,-10.6,-8.6,0,2.8,true);
 b.push([12.4,0,-6.8]);b.cyl(.05,.05,1.1,K.mat(0x3a3a3a,.4,.6),[0,.55,0],null,10);b.rbox(.36,.5,.22,.04,K.mat(0x2a2c2e,.4,.5),[0,1.3,0]);b.vents(5,.24,.25,K.mat(0x111111,.6),[.111,1.35,0]);b.pop();
 for(const x of[11.2,19.3]){b.cyl(.1,.1,3.2,K.mat(0x3a3a3a,.4,.6),[x,1.6,-12.4],null,10);S(x-.12,x+.12,-12.52,-12.28,0,3.2,true)}b.label(8.1,.3,K.paint('bj_clear',1024,40,(c,W,H)=>{for(let i=0;i<W;i+=40){c.fillStyle=(i/40)%2?'#1a1a1a':YEL;c.fillRect(i,0,40,H)}P.text(c,"CLEARANCE  9'-0\"",W/2,H/2,{size:28,col:'#fff',stroke:'#000',lw:4})},{}),[15.25,2.95,-12.4]);b.box(8.1,.3,.12,K.mat(0xffd23a,.4),[15.25,2.95,-12.47],null,0);
 b.push([10.7,0,-1.0]);b.cyl(.04,.04,2.2,K.mat(0x3a3a3a,.4,.6),[0,1.1,0],null,8);b.label(.7,.4,K.paint('bj_pickup',256,140,(c,W,H)=>{c.fillStyle=RED;c.fillRect(0,0,W,H);P.text(c,'PICK UP',W/2,H*.35,{size:44,col:YEL});P.text(c,'WINDOW',W/2,H*.72,{size:34,col:'#fff'})},{glow:.4}),[0,2.2,0],[0,PI/2,0]);b.pop();
 /* ---------- entrance portal, canopy, window trim ---------- */
 b.box(3.6,.12,1.6,teal,[-.25,2.6,7.8],null,.01);for(const x of[-1.95,1.45])b.cyl(.06,.06,2.55,K.mat(0x6a6c6e,.4,.7),[x,1.28,8.5],null,10);
 b.label(2.4,.4,K.paint('bj_open',512,86,(c,W,H)=>{c.fillStyle='#111';c.fillRect(0,0,W,H);P.text(c,'OPEN 24 HOURS',W/2,H/2,{size:52,col:'#ff3a2a',font:"'MFZ Head'"})},{glow:.9}),[-.25,2.25,7.25]);
 const trimWin=(ax,f,c,inv)=>{const w=1.62,h=1.95;if(ax)b.frame(w,h,.07,teal,[c,1.825,f+inv*.18],.04);else b.push([f+inv*.18,1.825,c],[0,PI/2,0]),b.frame(w,h,.07,teal,[0,0,0],.04),b.pop()};
 for(const c of[-14.6,-12.9,-11.2,-9.5,-7.8,-6.1,-4.4,-2.7,2.2,3.9,5.6,7.3,9.0])trimWin(1,ZB1,c,1);for(const c of[5.6,3.9,2.2,.5,-1.2,-2.9])trimWin(0,XB0,c,-1);for(const c of[5.6,3.9,2.2,-3.6])trimWin(0,XB1,c,1);
 /* ---------- lawn furniture, shrubs, trees, sidewalk meters ---------- */
 const pt=K.surf('wood',0x5a3a22);for(const [x,z,ry] of[[-15.5,11.2,0],[-12,11.6,.06],[-8.5,11.2,-.04],[-5.2,11.5,.03]]){b.push([x,0,z],[0,ry,0]);b.box(1.8,.06,.72,pt,[0,.74,0],null,.01);for(const s of[-1,1]){b.box(1.8,.05,.28,pt,[0,.45,s*.6],null,.01);b.box(.07,.9,.07,pt,[.8,.42,s*.25],[s*.45,0,0],0);b.box(.07,.9,.07,pt,[-.8,.42,s*.25],[s*.45,0,0],0)}b.pop();S(x-.95,x+.95,z-.8,z+.8,0,.78,true)}
 const leaf=surf('leaves');for(let x=-15.2;x<9.5;x+=1.55){if(Math.abs(x+.25)<1.9)continue;b.add(K.sphGeo(.55,10,7),leaf,{p:[x,.35,7.75],s:[1.1,.75,.8]})}
 const tree=(x,z,s)=>{if(!LOTTREES.some(q=>q[0]===x&&q[1]===z))LOTTREES.push([x,z,s])}; /* v074: real flora trees, planted per instance (bldTree) */
 tree(-17.0,13.2,1.0);tree(-3.6,9.4,.9);
 for(const x of[-9,7]){b.push([x,0,16.15]);b.cyl(.035,.035,1.1,K.mat(0x3a3a3a,.4,.6),[0,.55,0],null,8);b.rbox(.16,.26,.12,.04,K.mat(0x4a4c50,.4,.5),[0,1.22,0]);b.add(K.sphGeo(.09,12,6,0,PI/2),K.glass(0xcfe6ee,.45),{p:[0,1.35,0]});b.label(.06,.04,K.mat(0x1a3a5a,.4,0,{emissive:0x2a6a9a,emissiveIntensity:.5}),[0,1.24,.061]);b.pop()}
 /* ---------- Bruno the Bear: 4.6 m fibreglass statue on the roof, on guy wires ---------- */
 const fb=fur?fur():K.mat(0x8a5226,.55),tan=K.mat(0xe8c08a,.45),white=K.mat(0xf4f4f0,.35),dark=K.mat(0x1a1008,.3),rd=K.mat(0xc8261c,.35);
 const MX=-3,MZ=0,my=yt+.05;const MS=1.3;b.push([MX,my,MZ],[0,.12,0],[MS,MS,MS]);
 b.rbox(1.8,.3,1.4,.04,K.surf('concrete',0x8a8a84),[0,.15,0]);                                         // plinth
 for(const s of[-1,1]){b.add(K.rboxGeo(.42,.3,.7,.14,2),dark,{p:[s*.35,.45,.12]});b.cyl(.22,.2,1.0,white,[s*.35,1.05,0],null,16);}   // shoes + trousers
 b.add(K.sphGeo(.85,24,16),white,{p:[0,2.15,0],s:[1,1.25,.85]});                                         // body (white chef jacket)
 b.add(K.sphGeo(.8,24,16,0,PI*.7),K.paint('bj_apron',512,512,(c,W,H,r)=>{c.fillStyle='#2a4a9a';c.fillRect(0,0,W,H);c.fillStyle='#f4f4f0';for(let x=0;x<W;x+=64)c.fillRect(x+40,0,10,H);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(0,H*.8,W,H*.2)},{r:.5}),{p:[0,1.92,.08],s:[1.02,1.15,.86],r:[PI*.62,0,0]});
 b.label(.5,.5,logoTex('bj_logo_chest',256,256,null),[0,2.35,.73],[-.15,0,0]);for(let i=0;i<3;i++)b.sph(.05,dark,[-.25,2.6-i*.22,.7]);
 b.add(K.torGeo(.12,.06,8,16),rd,{p:[-.13,2.98,.58],r:[0,PI/2,0],s:[1,1,.5]});b.add(K.torGeo(.12,.06,8,16),rd,{p:[.13,2.98,.58],r:[0,PI/2,0],s:[1,1,.5]});b.sph(.07,rd,[0,2.98,.62]);   // bow tie
 // head
 b.add(K.sphGeo(.72,28,18),fb,{p:[0,3.55,.05]});b.add(K.sphGeo(.36,20,12),tan,{p:[0,3.38,.58],s:[1.15,.85,.9]});b.add(K.sphGeo(.13,14,8),dark,{p:[0,3.5,.88],s:[1.3,.9,1]});
 b.tube([[-.14,3.22,.86],[0,3.16,.9],[.14,3.22,.86]],.018,dark,10,6);b.sph(.07,K.mat(0xe84a5a,.4),[0,3.13,.86],[1.2,.6,.8]);
 for(const s of[-1,1]){b.sph(.15,white,[s*.24,3.78,.6],[1,1.15,.6]);b.sph(.075,dark,[s*.24,3.76,.68]);b.sph(.025,white,[s*.21,3.8,.73]);b.add(K.rboxGeo(.22,.05,.06,.02,1),dark,{p:[s*.25,4.0,.6],r:[0,0,-s*.25]});
  b.sph(.26,fb,[s*.55,4.1,-.02],[1,1,.55]);b.sph(.15,tan,[s*.55,4.1,.08],[1,1,.4])}
 b.cyl(.48,.5,.4,white,[0,4.32,-.02],null,24);for(let i=0;i<7;i++){const a=i*PI*2/7;b.sph(.26,white,[Math.cos(a)*.3,4.68,Math.sin(a)*.3-.02])}b.sph(.3,white,[0,4.8,-.02]);
 // arms: right raised with the spatula, left forward with a burger
 b.tube([[.75,2.75,0],[1.15,3.2,.1],[1.25,3.85,.2]],.2,white,14,10);b.sph(.2,fb,[1.26,3.95,.22]);b.cyl(.04,.04,.7,K.mat(0x2a2a2a,.4),[1.3,4.25,.25],null,10);
 b.box(.45,.6,.03,K.mat(0xc8ccd0,.3,.9),[1.32,4.85,.28],null,.01);for(let i=0;i<4;i++)b.box(.05,.4,.035,K.mat(0x2a2a2a,.6),[1.18+i*.1,4.92,.29]);
 b.tube([[-.75,2.7,0],[-1.05,2.5,.4],[-.95,2.45,.85]],.2,white,14,10);b.sph(.2,fb,[-.95,2.45,.95]);
 b.push([-.92,2.62,1.05]);b.add(K.sphGeo(.32,18,10,0,PI/2),K.mat(0xd8902a,.45),{p:[0,.1,0],s:[1,.6,1]});b.add(K.torGeo(.31,.035,6,24),K.mat(0x4aa83a,.5),{p:[0,.07,0],r:[PI/2,0,0]});b.cyl(.31,.31,.1,K.mat(0x5a2a14,.75),[0,.0,0],null,24);b.cyl(.3,.29,.1,K.mat(0xc8802a,.5),[0,-.09,0],null,24);b.pop();
 b.pop();
 // guy wires from his shoulders to the roof corners
 const gw=K.mat(0x9a9c9e,.4,.9);for(const [cx,cz] of[[ix0+.4,iz1-.4],[ix1-.4,iz1-.4],[ix0+.4,iz0+.4],[ix1-.4,iz0+.4]]){const a=[MX+(cx<MX?-.6:.6)*MS,my+2.8*MS,MZ],e=[cx,yt+.05,cz];const L=Math.hypot(e[0]-a[0],e[1]-a[1],e[2]-a[2]),m=[(a[0]+e[0])/2,(a[1]+e[1])/2,(a[2]+e[2])/2];
  const g=new T.CylinderGeometry(.012,.012,L,5);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(e[0]-a[0],e[1]-a[1],e[2]-a[2]).normalize());const eu=new T.Euler().setFromQuaternion(q);b.add(g,gw,{p:m,r:[eu.x,eu.y,eu.z]});b.cyl(.06,.08,.1,gw,[cx,yt+.08,cz],null,8)}
 CACHE={M:b.done(),cols,occ};return CACHE}

/* ===================== the builder ===================== */
function bBurgerama(x,z,t){
 const B=mk(x,z,40,36,H,0x9a4a34,0xd8d0c0,0x5a6066);B.dx=0;const PT={th:.16,c:0xd8cbb0};
 // shell: brick walls with the ribbon windows, double entrance doors, pick-up window, back door
 WL(B,1,ZB1,XB0,XB1,[...wins([-14.6,-12.9,-11.2,-9.5,-7.8,-6.1,-4.4,-2.7]),{k:'d',c:-.9},{k:'d',c:.4},...wins([2.2,3.9,5.6,7.3,9.0])],H);
 WL(B,1,ZB0,XB0,XB1,[{k:'d',c:5.5,s:-1}],H);
 WL(B,0,XB0,ZB0,ZB1,wins([5.6,3.9,2.2,.5,-1.2,-2.9]),H);
 WL(B,0,XB1,ZB0,ZB1,wins([5.6,3.9,2.2,-3.6]),H);
 // partitions: kitchen (employees-only door), walk-in freezer (a room), restrooms
 WL(B,0,1.2,ZB0,-.1,[{k:'d',c:-2.6}],H,PT);
 WL(B,1,-5.2,6.4,XB1,[{k:'d',c:8.1}],H,PT);WL(B,0,6.4,ZB0,-5.2,[],H,PT);
 WL(B,1,-4.2,XB0,-10.5,[{k:'d',c:-14.6},{k:'d',c:-11.9}],H,PT);WL(B,0,-13.25,ZB0,-4.2,[],H,PT);WL(B,0,-10.5,ZB0,-4.2,[],H,PT);
 // our detail (kept out of the static merge so its materials survive)
 const C=build(),D=new T.Object3D();D.userData.kind='bdecor';for(const q of C.M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;D.add(m)}B.g.add(D);
 B.g.updateMatrixWorld(true);
 for(const c of C.cols){const a=new T.Vector3(c[0],c[1],c[2]).applyMatrix4(B.g.matrixWorld),e=new T.Vector3(c[3],c[4],c[5]).applyMatrix4(B.g.matrixWorld);solids.push(new T.Box3(a.clone().min(e),a.clone().max(e)))}
 for(const o of C.occ)B.occ.push(o);for(const[tx,tz,ts]of LOTTREES)try{bldTree(B,tx,tz,ts*.85)}catch(e){}
 // loot: kitchen, walk-in, a vending machine in the lobby; a dumpster round the back; a wreck in the lot
 rc(B,'burger',[1.6,6.2,-7.0,-2.2],2);rc(B,'burger',[6.6,9.8,-6.2,-5.4],1);rc(B,'convenience',[8.6,9.8,4.5,6.6],1);rc(B,'burger',[-15.6,-1.4,-3.8,6.6],1);
 try{if(window.spawnPropContainer)spawnPropContainer(WX(B,16.2),WZ(B,-16.4),'dumpster_full','house',B.cs>0?0:PI,0);else PR.dump(B,16,-16.2)}catch(e){}
 PR.car(B,-6.8,-14.8);PR.car(B,3.1,-15.2);
 buildings.push({x:WX(B,-3),z:WZ(B,-.5),w:26,d:15,t:t.id});
 // the dead: in the dining room, behind the counter, the kitchen, one in the lot
 for(const [px,pz] of[[-8,1],[-12,-1],[-5,4],[4,-3],[7.5,2.5],[-2,-6]].slice(0,ri(3,6)))zombie(WX(B,px),WZ(B,pz));if(Math.random()<.6)zombie(WX(B,8),WZ(B,-13));
 LASTB=B;return B}

/* no structural collapse for this one (its roof and interior would float): looted / smashed at most */
if(typeof ruin==='function'){const _r=ruin;ruin=function(x,z,t,lv){if(t&&t.id==='willy_burgerorium'&&lv>1){arguments[3]=1}return _r.apply(this,arguments)}}
/* replace the catalogue entry (same id, so lot mapping / missions keep working) */
const e=NEWCAT.find(d=>d.id==='willy_burgerorium');
if(e){e.name="Bruno's Burgerama";e.build=bBurgerama;e.note='full-block burger joint with drive-thru, roof mascot, kitchen, walk-in, restrooms'}
else NEWCAT.push({id:'willy_burgerorium',name:"Bruno's Burgerama",pool:'big',scope:'big',category:'commercial',front:'south',builder:'prop',build:bBurgerama,loot:'burger',note:'',w:30,d:23,variants:{intact:{props:[]},looted:{props:['trash','glass','papers']},ruined:{props:['rubble','beam','tarp']}},legacy:false});
if(typeof NOYARD!=='undefined')NOYARD.add('willy_burgerorium');window.bBurgerama=bBurgerama;window.BURGERAMA={build};
console.log("[burgerjoint] Bruno's Burgerama ready");
})();
