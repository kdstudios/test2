/* MINI FORT ZOMBIE - PROPS 2/4: kitchen, appliances, vending, shop till (fridges, freezers, units, sink, prep table, dish station, coffee
   brewer, washing machine, drinks cooler, 5 vending machines with our own brands, cash register, dry goods). Original models + artwork. */
(function(){
'use strict';
const K=window.MFZK,P=K.P,PI=Math.PI,T=THREE;if(!K)return;
const enamel=(c)=>K.mat(c,.32,0),steel=()=>K.steelBrushed();

/* ===== fridges ===== */
function badge(key,txt,col){return K.paint('badge_'+key,256,64,(c,W,H,r)=>{c.fillStyle='rgba(0,0,0,0)';c.clearRect(0,0,W,H);P.text(c,txt,W/2,H/2,{size:40,col:col||'#c9ccd0',font:"'MFZ Head',sans-serif",ls:4,stroke:'rgba(0,0,0,.35)',lw:2})},{alpha:true,m:.9,r:.25})}
function magnets(key){return K.paint('mag_'+key,512,512,(c,W,H,r)=>{c.clearRect(0,0,W,H);
 // a child's drawing, a takeaway menu, a photo, a shopping list, held by magnets
 c.save();c.translate(130,150);c.rotate(-.12);c.fillStyle='#fdfcf6';c.fillRect(-80,-60,160,120);c.strokeStyle='#2a6ad8';c.lineWidth=5;c.beginPath();c.moveTo(-60,40);c.lineTo(-20,-20);c.lineTo(20,40);c.stroke();
 c.fillStyle='#f2c12e';c.beginPath();c.arc(45,-30,16,0,PI*2);c.fill();c.strokeStyle='#2a9a3a';c.beginPath();c.moveTo(-80,45);c.lineTo(80,45);c.stroke();c.fillStyle='#d83a2a';c.beginPath();c.arc(0,-62,9,0,PI*2);c.fill();c.restore();
 c.save();c.translate(360,170);c.rotate(.08);c.fillStyle='#fff6d8';c.fillRect(-70,-90,140,180);P.text(c,'GOLDEN WOK',0,-66,{size:20,col:'#b0221a'});c.fillStyle='#555';for(let i=0;i<9;i++)c.fillRect(-56,-46+i*14,80+r()*30,4);P.text(c,'555-0142',0,76,{size:16,col:'#222',font:"'MFZ Mono',monospace"});c.fillStyle='#2a6ad8';c.beginPath();c.arc(0,-92,9,0,PI*2);c.fill();c.restore();
 c.save();c.translate(170,380);c.rotate(.15);c.fillStyle='#f4f1e8';c.fillRect(-70,-55,140,110);const g=c.createLinearGradient(0,-45,0,40);g.addColorStop(0,'#7aa6c8');g.addColorStop(.6,'#c8b890');g.addColorStop(1,'#6a8a4a');c.fillStyle=g;c.fillRect(-62,-47,124,82);
 c.fillStyle='#4a3a2a';for(const x of[-25,0,25]){c.beginPath();c.arc(x,0,8,0,PI*2);c.fill();c.fillRect(x-7,6,14,28)}c.fillStyle='#d8a020';c.beginPath();c.arc(0,-70,9,0,PI*2);c.fill();c.restore();
 c.save();c.translate(380,400);c.rotate(-.06);c.fillStyle='#fffbe8';c.fillRect(-60,-70,120,140);c.fillStyle='#c8d8f0';for(let i=0;i<8;i++)c.fillRect(-60,-50+i*16,120,1);c.font="16px 'MFZ Type',serif";c.fillStyle='#223';c.textAlign='left';
 ['milk','eggs','batteries!!','bread','bleach','ammo?'].forEach((s,i)=>c.fillText(s,-48,-36+i*16));c.fillStyle='#3aa86a';c.beginPath();c.arc(0,-72,9,0,PI*2);c.fill();c.restore();
 P.grime(c,W,H,r,.3)},{alpha:true,r:.85})}
function fridge(b,o){const W=o.w||.8,H=o.h||1.75,D=.72,col=enamel(o.col),r=.04;
 // body + doors (freezer on top / bottom), door seals, handles, kick grille, hinges
 b.rbox(W,H-.08,D-.06,.03,col,[0,H/2+.04,-.03],null,3);
 const split=o.split||.68,y1=.1,y2=H*split,y3=H-.01;
 for(const [a,c2] of[[y1,y2-.01],[y2+.01,y3]]){b.rbox(W-.004,c2-a,.06,r,col,[0,(a+c2)/2,D/2-.03],null,3);b.box(W-.03,(c2-a)-.03,.012,K.rubber(),[0,(a+c2)/2,D/2-.062],null,.004)}
 const hm=o.retro?K.chrome():K.mat(0x2a2b2d,.4,.3);
 if(o.retro){b.push([W/2-.08,y2+.25,D/2+.002]);b.rbox(.05,.22,.06,.02,hm,[0,0,.03]);b.pop();b.push([W/2-.08,y2-.2,D/2+.002]);b.rbox(.05,.18,.06,.02,hm,[0,0,.03]);b.pop();
  b.label(.3,.075,badge('retro','FROSTLINE','#d8d8d8'),[0,H-.12,D/2+.002])}
 else{b.handle(.42,hm,[W/2-.06,y2+.3,D/2],true,.04);b.handle(.3,hm,[W/2-.06,y2-.25,D/2],true,.04);b.label(.24,.06,badge('mod','POLARIS','#8a8e94'),[0,y3-.08,D/2+.002])}
 b.box(W-.1,.07,.01,K.mat(0x1a1a1a,.7),[0,.055,D/2-.03]);b.vents(4,W-.14,.06,K.mat(0x2a2a2a,.6,.4),[0,.055,D/2-.024],false);
 for(const y of[y1+.04,y2-.04,y2+.05,y3-.04])b.hinge(.06,K.chrome(),[-W/2+.01,y,D/2-.01]);
 b.label(W*.7,W*.7,magnets(o.key),[-.02,y2-.32,D/2+.003]);
 b.label(.12,.12,K.paint('fr_mag',128,128,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#e8402a';c.beginPath();c.arc(64,64,50,0,PI*2);c.fill();P.text(c,'NYC',64,64,{size:34,col:'#fff'})},{alpha:true,r:.3}),[.22,y2+.36,D/2+.004]);
 // dents and a smear of dried blood on one door
 b.label(.3,.4,K.paint('fr_blood',256,320,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(90,10,8,.85)';for(let i=0;i<4;i++){c.beginPath();c.ellipse(60+i*28,60+r()*30,14,20,0,0,PI*2);c.fill();c.fillRect(56+i*28,60,6+r()*4,140+r()*120)}P.noise(c,W,H,r,300,.4,'#3a0604')},{alpha:true,r:.4}),[-W*.18,y2+.18,D/2+.003])}
K.def('fridge_retro',{label:'Fridge',table:'house',items:[1,3],auto:['house','diner','restaurant','butcher']},b=>fridge(b,{col:0xe9e4d4,retro:true,split:.72,key:'a',h:1.62}));
K.def('fridge_modern',{label:'Fridge',table:'house',items:[1,3],auto:['house','diner','restaurant','butcher','bakery']},b=>fridge(b,{col:0xdfe1e2,split:.62,key:'b',h:1.8,w:.84}));
K.def('fridge_blue',{label:'Fridge',table:'house',items:[1,3],auto:['house']},b=>fridge(b,{col:0x6f9fc0,retro:true,split:.7,key:'c',h:1.6}));

/* ===== commercial upright freezer (reach-in, stainless, glass door, product inside) ===== */
const frozen=K.paint('frozen',512,512,(c,W,H,r)=>{c.fillStyle='#d8e4ea';c.fillRect(0,0,W,H);for(let y=0;y<4;y++){let x=0;while(x<W){const w=40+r()*50,h=70+r()*40,col=['#e83a2a','#2a6ad8','#f2c12e','#3aa86a','#f4f1e8','#8a3ab0'][Math.floor(r()*6)];
 c.fillStyle=col;c.fillRect(x+2,y*128+128-h,w-4,h);c.fillStyle='rgba(255,255,255,.75)';c.fillRect(x+6,y*128+128-h+8,w-12,12);c.fillStyle='rgba(0,0,0,.2)';c.fillRect(x+w-8,y*128+128-h,4,h);x+=w}
 c.fillStyle='#9aa4aa';c.fillRect(0,y*128+124,W,4)}c.fillStyle='rgba(230,245,255,.35)';c.fillRect(0,0,W,H);P.noise(c,W,H,r,2000,.25,'#fff',2)},{r:.6});
K.def('freezer_upright',{label:'Upright freezer',table:'diner',items:[1,3],auto:['diner','restaurant','burger','takeout','butcher']},b=>{const W=.76,H=2.0,D=.8,st=steel();
 b.rbox(W,H-.12,D,.01,st,[0,H/2+.06,0]);for(const x of[-W/2+.04,W/2-.04])for(const z of[-D/2+.06,D/2-.06]){b.cyl(.02,.02,.08,K.chrome(),[x,.04,z],null,10);b.cyl(.035,.035,.012,K.rubber(),[x,.006,z],null,12)}
 b.rbox(W-.02,1.45,.05,.01,st,[0,1.0,D/2+.02]);b.label(W-.14,1.3,frozen,[0,1.0,D/2+.0455]);b.plane(W-.14,1.3,K.glass(0xe6f4ff,.35),[0,1.0,D/2+.047]);
 b.box(.03,.5,.04,K.chrome(),[W/2-.06,1.05,D/2+.06],null,.01);b.vents(6,W-.1,.22,K.mat(0x2a2c2e,.5,.6),[0,1.86,D/2+.004],true);
 b.label(.3,.08,K.paint('fz_disp',200,56,(c,W,H)=>{c.fillStyle='#0a0f0a';c.fillRect(0,0,W,H);P.text(c,'-18°C',W*.38,H/2,{size:40,col:'#3aff6a',font:"'MFZ Mono',monospace"});c.fillStyle='#ff3a2a';c.beginPath();c.arc(W*.85,H/2,7,0,PI*2);c.fill()},{glow:.8}),[-.12,1.86,D/2+.007]);
 b.label(.22,.06,badge('cold','COLDLINE','#3a3c40'),[.15,1.96-.17,D/2+.007])});
/* chest freezers */
function chestFreezer(b,full){const W=1.9,H=.86,D=.86,body=enamel(0xf2f2ee),st=steel(),gl=K.glass(0xdaf0ff,.3);
 for(const z of[-D/2+.025,D/2-.025])b.rbox(W,H-.08,.05,.02,body,[0,(H-.08)/2+.08,z],null,2);for(const x of[-W/2+.025,W/2-.025])b.rbox(.05,H-.08,D,.02,body,[x,(H-.08)/2+.08,0],null,2);b.box(W,.34,D,body,[0,.25,0]);b.box(W-.1,.08,D-.1,K.mat(0x2a2a2a,.6),[0,.04,0]);
 const lin=K.mat(0xdfe6ea,.35,.1);b.box(W-.1,.012,D-.1,lin,[0,.42,0]);for(const z of[-D/2+.05,D/2-.05])b.box(W-.1,H-.42,.012,lin,[0,(H+.42)/2,z]);for(const x of[-W/2+.05,W/2-.05])b.box(.012,H-.42,D-.1,lin,[x,(H+.42)/2,0]);
 for(const z of[-D/2+.03,D/2-.03])b.box(W+.02,.06,.04,st,[0,H,z]);for(const x of[-W/2+.03,W/2-.03])b.box(.04,.06,D+.02,st,[x,H,0]);   // rim round a hollow bin
 b.label(W*.5,.16,K.paint('chest_band',512,80,(c,W,H,r)=>{c.fillStyle='#1e5aa8';c.fillRect(0,0,W,H);P.text(c,'ARCTIC FRESH  ❄  FROZEN FOODS',W/2,H/2,{size:34,col:'#fff',max:W*.95})},{}),[0,H-.2,D/2+.001]);
 // sliding glass lids, one half open
 b.plane(W/2,D-.06,gl,[-W/4+.05,H+.045,0],[-PI/2,0,0]);b.plane(W/2,D-.06,gl,[W/4-.25,H+.055,0],[-PI/2,0,0]);
 for(const x of[-W/2+.03,0,W/2-.03])b.box(.025,.025,D,K.chrome(),[x,H+.05,0]);
 if(full){const rnd=b.rnd;for(let i=0;i<40;i++){const w=.12+rnd()*.14,d=.1+rnd()*.12,h=.04+rnd()*.06;b.add(K.rboxGeo(w,h,d,.01,1),K.paint('fpack'+(i%6),128,128,(c,W,H,r)=>{c.fillStyle=['#e83a2a','#2a6ad8','#f2c12e','#3aa86a','#f4f1e8','#8a3ab0'][i%6];c.fillRect(0,0,W,H);P.text(c,['PEAS','PIZZA','FRIES','FISH','ICE','BERRY'][i%6],W/2,H/2,{size:26,col:'#fff'});c.fillStyle='rgba(255,255,255,.4)';c.fillRect(0,0,W,20)},{r:.4}),
   {p:[-W/2+.15+rnd()*(W-.3),.48+rnd()*.3,-D/2+.15+rnd()*(D-.3)],r:[rnd()*.3,rnd()*3,rnd()*.3]})}}
 b.label(.24,.24,K.paint('chest_frost',256,256,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<500;i++){c.fillStyle='rgba(255,255,255,'+r()*.4+')';c.fillRect(r()*W,r()*H,2,2)}},{alpha:true}),[.6,H-.4,D/2+.002])}
K.def('chest_freezer_full',{label:'Chest freezer',table:'supermarket',items:[2,4]},b=>chestFreezer(b,true));
K.def('chest_freezer_empty',{label:'Chest freezer (empty)',table:'supermarket',items:[1,2]},b=>chestFreezer(b,false));

/* ===== kitchen units ===== */
function cabinetRun(b,W,o){const D=.6,H=.9,carc=o.paint?K.paintSteel(o.wood,{m:0,r:.42,tile:1}):K.veneer(o.wood||0x9a7448),top=o.top==='wood'?K.veneer(o.topCol,{tile:.9}):K.surf('concrete',o.topCol||0x8a8278),hw=o.hw||K.chrome();
 b.box(W-.02,.1,D-.08,K.mat(0x1e1e1e,.8),[0,.05,-.04]);                       // recessed plinth
 b.box(W,H-.13,D-.04,carc,[0,.1+(H-.13)/2,-.02],null,.004);
 b.rbox(W+.02,.04,D+.02,.008,top,[0,H-.02,0]);b.box(W+.02,.08,.015,top,[0,H+.02,-D/2+.0075]);   // worktop + upstand
 const n=Math.max(1,Math.round(W/.5)),dw=W/n;
 for(let i=0;i<n;i++){const x=-W/2+dw*(i+.5),drawer=o.drawers&&i%2===0;
  if(drawer){for(let k=0;k<3;k++){const h=(H-.16)/3;b.rbox(dw-.012,h-.01,.02,.004,carc,[x,.12+h*(k+.5),D/2-.03]);if(o.shaker)b.frame(dw-.06,h-.05,.025,carc,[x,.12+h*(k+.5),D/2-.018],.006);b.pull(.12,hw,[x,.12+h*(k+.5)+h*.25,D/2-.015])}}
  else{b.rbox(dw-.012,H-.17,.02,.004,carc,[x,.1+(H-.15)/2,D/2-.03]);if(o.shaker)b.frame(dw-.08,H-.24,.04,carc,[x,.1+(H-.15)/2,D/2-.018],.008);
   b.rbox(dw-.012,.12,.02,.004,carc,[x,H-.11,D/2-.03]);b.pull(.12,hw,[x,H-.11,D/2-.015]);b.handle(.1,hw,[x+(i%2?-1:1)*(dw/2-.05),.6,D/2-.02],true,.025)}}}
K.def('kitchen_unit_oak',{label:'Kitchen cabinet',table:'house',items:[1,2],auto:['house']},b=>{cabinetRun(b,1.2,{wood:0xa07a4a,shaker:true,drawers:true,topCol:0x5a5650});
 b.cyl(.09,.08,.18,K.mat(0xd8d2c6,.4),[.35,.98,-.12],null,18);b.cyl(.02,.02,.2,K.veneer(0x8a6a3a),[.33,1.1,-.12],[0,0,.3],8);b.cyl(.02,.02,.22,K.veneer(0x8a6a3a),[.38,1.1,-.1],[.2,0,-.2],8)});   // utensil pot
K.def('kitchen_unit_white',{label:'Kitchen cabinet',table:'house',items:[1,2],auto:['house']},b=>{cabinetRun(b,1.2,{paint:true,wood:0xeae6dc,shaker:true,top:'wood',topCol:0x9a6a3a,hw:K.mat(0x2a2a2a,.4,.6)});
 b.rbox(.3,.2,.2,.03,K.mat(0xc8302a,.3),[-.3,1.0,-.1]);b.cyl(.02,.02,.05,K.mat(0x1a1a1a,.4),[-.3,1.12,-.1],null,10)});   // a toaster-ish box
K.def('kitchen_unit_dark',{label:'Kitchen cabinet',table:'house',items:[1,2],auto:['house']},b=>{cabinetRun(b,1.2,{wood:0x3e2a1e,drawers:true,topCol:0xd8d4cc,hw:K.mat(0xb08a3a,.35,.9)})});
K.def('kitchen_counter',{label:'Kitchen counter',table:'house',items:[1,2],auto:['house','diner','coffee','bakery']},b=>{cabinetRun(b,1.6,{wood:0xb08a5a,drawers:true,topCol:0x7a746a});
 // microwave + chopping board + knife block
 b.rbox(.5,.3,.36,.015,K.mat(0xe8e8e6,.35),[.45,1.05,-.06]);b.label(.32,.2,K.glass(0x101418,.85),[.4,1.05,.121]);b.box(.1,.22,.01,K.mat(0x2a2a2a,.4),[.63,1.05,.122]);
 b.label(.08,.03,K.paint('mw',96,36,(c,W,H)=>{c.fillStyle='#000';c.fillRect(0,0,W,H);P.text(c,'12:00',W/2,H/2,{size:26,col:'#3aff6a',font:"'MFZ Mono',monospace"})},{glow:1}),[.63,1.14,.128]);
 b.box(.4,.02,.28,K.veneer(0xc8a070,{fig:false}),[-.3,.91,0],[0,.15,0]);b.rbox(.12,.22,.16,.01,K.veneer(0x5a3a22),[-.65,1.0,-.15],[-.25,0,0]);
 for(let i=0;i<4;i++)b.box(.016,.08,.02,K.mat(0x1a1a1a,.5),[-.69+i*.025,1.12+i*.004,-.2],[-.25,0,0])});
K.def('kitchen_counter_corner',{label:'Kitchen counter (corner)',table:'house',items:[1,2]},b=>{const carc=K.veneer(0xb08a5a),top=K.surf('concrete',0x7a746a);
 b.box(.88,.77,.88,carc,[0,.1+.385,0]);b.rbox(.9,.04,.9,.008,top,[0,.88,0]);b.box(.84,.1,.84,K.mat(0x1e1e1e,.8),[0,.05,0]);
 b.rbox(.4,.75,.02,.004,carc,[.2,.48,.44]);b.handle(.1,K.chrome(),[.05,.6,.45],true,.025)});
K.def('kitchen_sink',{label:'Kitchen sink',table:'house',items:[1,2],auto:['house']},b=>{cabinetRun(b,1.2,{wood:0xb08a5a,shaker:true,topCol:0x8a8278});
 const st=steel(),W=.8,D=.46,y=.9;b.box(W,.012,D,st,[0,y+.002,0]);
 for(const x of[-.18,.2]){const bw=x<0?.36:.3;b.box(bw,.18,.005,st,[x,y-.09,D/2-.04]);b.box(bw,.18,.005,st,[x,y-.09,-D/2+.04]);b.box(.005,.18,D-.08,st,[x-bw/2,y-.09,0]);b.box(.005,.18,D-.08,st,[x+bw/2,y-.09,0]);b.box(bw,.005,D-.08,st,[x,y-.18,0]);b.cyl(.025,.025,.006,K.chrome(),[x,y-.175,0],null,16)}
 // mixer tap
 const ch=K.chrome();b.cyl(.025,.03,.06,ch,[0,y+.03,-.18],null,16);b.tube([[0,y+.05,-.18],[0,y+.3,-.18],[0,y+.36,-.12],[0,y+.32,-.04]],.012,ch,20,10);b.box(.1,.012,.025,ch,[0,y+.08,-.16],[0,0,.3]);
 // dish rack with plates, a mug, washing-up bottle
 for(let i=0;i<4;i++)b.cyl(.11,.11,.008,K.mat(0xf2f0ea,.3),[.2,y-.05+.11,-.06+i*.035],[PI/2-.15,0,0],24);b.cyl(.04,.035,.09,K.mat(0x2a6ad8,.35),[-.15,y-.13,.05],null,14);
 b.cyl(.03,.03,.16,K.mat(0x3ad86a,.3),[.45,y+.08,-.15],null,12);b.label(.05,.08,K.paint('soap',64,96,(c,W,H)=>{c.fillStyle='#3ad86a';c.fillRect(0,0,W,H);P.text(c,'SUDZ',W/2,H*.4,{size:20,col:'#fff'})},{}),[.45,y+.07,-.119])});

/* ===== prep table + dish station (commercial kitchen, stainless) ===== */
K.def('prep_table',{label:'Prep table',table:'restaurant',items:[1,3],auto:['restaurant','diner','burger','takeout']},b=>{const W=1.8,D=.7,st=steel();
 b.rbox(W,.04,D,.006,st,[0,.9,0]);b.box(W,.1,.01,st,[0,.97,-D/2+.005]);for(const y of[.25])b.box(W-.1,.025,D-.1,st,[0,y,0]);
 for(const x of[-W/2+.04,W/2-.04])for(const z of[-D/2+.04,D/2-.04]){b.cyl(.02,.02,.88,st,[x,.44,z],null,12);b.cyl(.026,.03,.04,K.chrome(),[x,.02,z],null,12)}
 // overshelf with heat lamps, chopping boards, stock pot, ladle, ticket rail
 for(const x of[-W/2+.04,W/2-.04])b.cyl(.015,.015,.75,st,[x,1.3,-D/2+.08],null,10);b.box(W,.03,.3,st,[0,1.66,-D/2+.15]);
 b.rbox(W-.1,.012,.08,.004,st,[0,1.4,-D/2+.06]);b.label(W-.2,.08,K.paint('tickets',512,48,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let x=10;x<W;x+=60+r()*30){c.fillStyle='#fff';c.fillRect(x,0,44,H);c.fillStyle='#333';for(let i=0;i<4;i++)c.fillRect(x+4,6+i*9,30+r()*8,2)}},{alpha:true}),[0,1.37,-D/2+.1]);
 b.cyl(.15,.14,.28,st,[.55,1.06,-.1],null,20,true);b.tor(.15,.01,st,[.55,1.2,-.1],[PI/2,0,0]);b.cyl(.14,.14,.01,K.mat(0x6a3a1a,.3),[.55,1.16,-.1],null,20);
 b.box(.5,.03,.32,K.mat(0xf2f2ee,.6),[-.4,.935,.05]);b.box(.4,.03,.28,K.mat(0x3aa86a,.6),[-.38,.965,.02],[0,.2,0]);b.box(.22,.01,.04,K.mat(0x1a1a1a,.5),[-.35,.985,.0],[0,.6,0]);b.box(.12,.004,.035,K.chrome(),[-.21,.985,.06],[0,.6,0]);
 b.tube([[.15,1.0,.1],[.25,.95,.12],[.35,.95,.12]],.008,K.chrome(),12,8);b.sph(.04,K.chrome(),[.38,.95,.12],[1,.5,1])});
K.def('dish_station',{label:'Dish station',table:'restaurant',items:[1,2],auto:['restaurant','diner','burger']},b=>{const W=1.6,D=.75,st=steel();
 b.rbox(W,.04,D,.006,st,[0,.88,0]);b.box(W,.25,.012,st,[0,1.0,-D/2+.006]);
 for(const x of[-W/2+.04,W/2-.04])for(const z of[-D/2+.04,D/2-.04])b.cyl(.02,.02,.86,st,[x,.43,z],null,12);b.box(W-.1,.025,D-.1,st,[0,.2,0]);
 // hood-type dishwasher on the left
 b.rbox(.7,.7,.68,.01,st,[-.4,1.25,0]);b.rbox(.7,.12,.68,.01,st,[-.4,1.66,0]);b.handle(.5,st,[-.4,1.48,.34],false,.05);
 b.label(.24,.08,K.paint('dw_panel',256,80,(c,W,H)=>{c.fillStyle='#1a1c1e';c.fillRect(0,0,W,H);P.text(c,'WASH 82°',W*.35,H*.5,{size:30,col:'#ffb43a',font:"'MFZ Mono',monospace"});c.fillStyle='#3aff6a';c.beginPath();c.arc(W*.82,H*.5,8,0,PI*2);c.fill()},{glow:.6}),[-.4,1.66,.342]);
 // pre-rinse spray arm over the sink basin on the right
 const ch=K.chrome();b.box(.6,.2,.5,st,[.45,.8,0]);b.cyl(.012,.012,1.0,ch,[.55,1.4,-.3],null,10);b.tube([[.55,1.9,-.3],[.55,1.95,-.2],[.5,1.9,-.05]],.01,ch,12,8);
 b.tube([[.5,1.88,-.05],[.42,1.6,.0],[.45,1.3,.02],[.5,1.12,.03]],.008,K.mat(0x1a1a1a,.4,.4),24,8);b.cyl(.03,.02,.12,ch,[.5,1.08,.03],null,12);
 b.tor(.1,.02,K.mat(0x1a1a1a,.5,.4),[.5,1.6,-.25],[PI/2,0,0]);   // spring coil hint
 // racks of plates and cups
 for(let i=0;i<7;i++)b.cyl(.12,.12,.008,K.mat(0xf2f0ea,.3),[.4,.98+.12,-.18+i*.05],[PI/2,0,0],24);b.box(.5,.08,.5,K.mat(0x2a4a8a,.6),[-.4,.94,0])});

/* ===== coffee brewer on a stand ===== */
K.def('coffee_maker',{label:'Coffee brewer',table:'coffee',items:[1,2],auto:['coffee','office']},b=>{const st=steel(),blk=K.blackPlastic(),gl=K.glass(0x3a2210,.55);
 // little cabinet stand
 b.rbox(.6,.74,.5,.008,K.veneer(0x4a3424),[0,.37,0]);b.rbox(.62,.03,.52,.006,K.surf('concrete',0x2a2a2a),[0,.755,0]);b.rbox(.56,.6,.02,.004,K.veneer(0x4a3424),[0,.38,.25]);b.knob(K.chrome(),[.2,.5,.26],.012);
 // brewer
 const y0=.77;b.rbox(.38,.08,.36,.01,st,[0,y0+.04,0]);b.rbox(.38,.46,.12,.01,st,[0,y0+.31,-.12]);b.rbox(.38,.1,.36,.01,st,[0,y0+.59,0]);
 b.rbox(.16,.06,.16,.02,blk,[0,y0+.52,.05]);b.cyl(.06,.06,.012,K.mat(0x8a0a0a,.4),[.13,y0+.08,.12],null,16);b.cyl(.06,.06,.012,K.mat(0x8a0a0a,.4),[-.13,y0+.08,.12],null,16);   // basket + warmers
 for(const x of[0,.17]){const y=x?y0+.62:y0+.09;b.lathe([[0,0],[.07,0],[.085,.04],[.09,.1],[.07,.15],[.04,.17],[0,.17]],gl,[x?.13:0,y,x?.1:.05],20);b.cyl(.045,.05,.03,blk,[x?.13:0,y+.17,x?.1:.05],null,14);
  b.tube([[x?.13:0,y+.14,(x?.1:.05)+.06],[x?.13:0,y+.12,(x?.1:.05)+.12],[x?.13:0,y+.05,(x?.1:.05)+.1]],.012,blk,10,8)}
 b.label(.32,.1,K.paint('brew',256,80,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'BREWMASTER',W/2,H*.38,{size:28,col:'#d8a03a'});c.fillStyle='#3aff6a';c.beginPath();c.arc(W*.2,H*.78,6,0,PI*2);c.fill();c.fillStyle='#ff3a2a';c.beginPath();c.arc(W*.8,H*.78,6,0,PI*2);c.fill()},{glow:.4}),[0,y0+.59,.181]);
 // cups, stirrers, sugar
 for(let i=0;i<5;i++)b.cyl(.04,.03,.1,K.mat(0xf4f1e8,.6),[-.22,.82+i*.02,.12],null,14);b.cyl(.04,.03,.1,K.mat(0xf4f1e8,.6),[.24,.82,.15],null,14);b.cyl(.035,.035,.006,K.mat(0x2a1408,.2),[.24,.865,.15],null,14);
 b.rbox(.08,.1,.08,.01,K.mat(0xf2f2f2,.4),[.22,.82,-.12])});

/* ===== washing machine ===== */
K.def('washing_machine',{label:'Washing machine',table:'laundromat',items:[1,2],auto:['laundromat','house']},b=>{const W=.6,H=.85,D=.6,body=enamel(0xf2f2f0),ch=K.chrome();
 b.rbox(W,H,D,.02,body,[0,H/2,0],null,3);b.rbox(W-.004,.12,.04,.01,body,[0,H-.07,D/2-.01]);
 b.label(W-.04,.1,K.paint('wm_panel',512,88,(c,W,H,r)=>{c.fillStyle='#e8e8e6';c.fillRect(0,0,W,H);c.fillStyle='#d4d6d8';c.fillRect(0,0,160,H);P.text(c,'AQUAMAX 1400',80,H*.3,{size:20,col:'#2a4a8a'});
  c.fillStyle='#ccc';c.fillRect(20,H*.55,120,24);c.fillStyle='#1a1a1a';c.fillRect(200,H*.2,130,H*.6);P.text(c,'0:58',265,H*.5,{size:36,col:'#58c8ff',font:"'MFZ Mono',monospace"});
  ['COTTON','SYNTH','WOOL','QUICK','RINSE','SPIN'].forEach((s,i)=>{const a=-PI*.8+i*PI*.32,x=430+Math.cos(a)*48,y=H/2+Math.sin(a)*32;P.text(c,s,x,y,{size:11,col:'#333'})})},{glow:.15,r:.4}),[0,H-.07,D/2+.011]);
 b.cyl(.04,.04,.03,K.mat(0xd8d8d8,.3,.2),[.2,H-.07,D/2+.02],[PI/2,0,0],24);b.box(.006,.03,.01,K.mat(0x333,.5),[.2,H-.055,D/2+.037]);   // program dial
 // the door: chrome ring, tinted glass bowl, gasket
 const z=D/2;b.tor(.19,.025,ch,[0,.42,z+.02],null,null,36);b.tor(.16,.02,K.mat(0xc8cacc,.35,.3),[0,.42,z+.03],null,null,32);
 b.add(K.sphGeo(.16,24,12,0,PI/2),K.glass(0x8aa0b0,.45),{p:[0,.42,z+.01],r:[PI/2,0,0],s:[1,.35,1]});b.tor(.16,.03,K.rubber(),[0,.42,z],null,null,28);
 b.rbox(.05,.12,.03,.01,ch,[.2,.42,z+.04]);b.label(.12,.1,K.paint('wm_soap',128,104,(c,W,H)=>{c.fillStyle='#d8d8d6';c.fillRect(0,0,W,H);for(let i=0;i<3;i++){c.fillStyle='#bbb';c.fillRect(8+i*40,30,32,60)}},{}),[-.2,H-.07,D/2+.012]);
 b.vents(5,W-.12,.06,K.mat(0xc8c8c8,.5),[0,.06,D/2+.003],false);
 // laundry visible behind the glass
 for(let i=0;i<6;i++)b.sph(.06,K.surf('linge',[0x3a5a8a,0xe8e2d6,0xc83a3a,0x3a8a5a][i%4]),[(i%3-1)*.07,.36+Math.floor(i/3)*.07,z-.06],[1,.7,1.2])});

/* ===== drinks cooler (glass door merchandiser) ===== */
const bottles=K.paint('bottles',512,1024,(c,W,H,r)=>{c.fillStyle='#e8eef2';c.fillRect(0,0,W,H);const rows=5,rh=H/rows;
 for(let y=0;y<rows;y++){let x=8;while(x<W-30){const col=['#c8302a','#2a6ad8','#f2c12e','#3ab86a','#f4f4f0','#7a3ab0'][Math.floor(r()*6)],bw=30+r()*10,bh=rh*(.6+r()*.25),y0=y*rh+rh-6;
  c.fillStyle='rgba(30,30,30,.25)';c.fillRect(x+3,y0-bh+2,bw,bh);c.fillStyle=col;P.rrect(c,x,y0-bh*.72,bw,bh*.72,6);c.fill();c.fillRect(x+bw*.32,y0-bh,bw*.36,bh*.3);c.fillStyle='#ddd';c.fillRect(x+bw*.3,y0-bh-4,bw*.4,6);
  c.fillStyle='rgba(255,255,255,.85)';c.fillRect(x+3,y0-bh*.5,bw-6,bh*.18);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x+4,y0-bh*.7,4,bh*.6);x+=bw+6}
  c.fillStyle='#b8c0c6';c.fillRect(0,y*rh+rh-6,W,6);c.fillStyle='#f6f6f0';c.fillRect(0,y*rh+rh-14,W,8)}
 c.fillStyle='rgba(255,255,255,.12)';c.fillRect(0,0,W,H)},{glow:.35,r:.5});
K.def('drinks_cooler',{label:'Drinks cooler',table:'convenience',items:[1,3],auto:['convenience','gas','liquor','supermarket']},b=>{const W=.72,H=2.0,D=.72,body=K.paintSteel(0x1a1c1e,{m:.4}),ch=K.chrome();
 b.rbox(W,H,D,.01,body,[0,H/2,0]);b.rbox(W-.004,1.6,.05,.01,K.mat(0x202224,.4,.6),[0,.98,D/2+.02]);b.label(W-.1,1.5,bottles,[0,.98,D/2+.0452]);b.plane(W-.1,1.5,K.glass(0xdaeef8,.22),[0,.98,D/2+.047]);
 b.box(.03,.9,.035,ch,[W/2-.07,.98,D/2+.06],null,.01);
 b.label(W-.04,.24,K.paint('cool_head',512,170,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#b0221a');g.addColorStop(1,'#e8402a');c.fillStyle=g;c.fillRect(0,0,W,H);P.text(c,'ICE COLD',W/2,H*.4,{size:72,col:'#fff',stroke:'#600',lw:4});P.text(c,'DRINKS',W/2,H*.8,{size:40,col:'#ffe9a8',ls:8})},{glow:.7,r:.3}),[0,1.89,D/2+.001]);
 b.vents(5,W-.1,.1,K.mat(0x2a2a2a,.6,.4),[0,.08,D/2+.004],false)});

/* ===== vending machines (our own brands) ===== */
function brandPanel(key,o){return K.paint('vend_'+key,512,1024,(c,W,H,r)=>{
 const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,o.c1);g.addColorStop(1,o.c2);c.fillStyle=g;c.fillRect(0,0,W,H);
 // big swoosh + condensation drops + the product
 c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(0,H*.55);c.bezierCurveTo(W*.4,H*.35,W*.6,H*.8,W,H*.5);c.lineTo(W,H*.62);c.bezierCurveTo(W*.6,H*.9,W*.4,H*.45,0,H*.67);c.fill();
 c.save();c.translate(W*.5,H*.55);c.rotate(-.12);const bw=150,bh=420;
 const bg=c.createLinearGradient(-bw/2,0,bw/2,0);bg.addColorStop(0,o.can1);bg.addColorStop(.45,o.can2);bg.addColorStop(1,o.can1);c.fillStyle=bg;P.rrect(c,-bw/2,-bh/2,bw,bh,30);c.fill();
 c.fillStyle='#d8d8d8';c.fillRect(-bw/2+10,-bh/2-12,bw-20,16);c.fillStyle='rgba(255,255,255,.85)';c.fillRect(-bw/2,-40,bw,80);P.text(c,o.name.split(' ')[0],0,0,{size:44,col:o.ink,font:"'MFZ Head',sans-serif",max:bw-14});
 for(let i=0;i<60;i++){c.fillStyle='rgba(255,255,255,'+(.25+r()*.5)+')';c.beginPath();c.ellipse(-bw/2+r()*bw,-bh/2+r()*bh,2+r()*3,3+r()*4,0,0,PI*2);c.fill()}c.restore();
 P.text(c,o.name,W/2,H*.12,{size:96,col:'#fff',stroke:'rgba(0,0,0,.4)',lw:6,max:W*.92,font:"'MFZ Head',sans-serif"});P.text(c,o.tag,W/2,H*.2,{size:30,col:o.tagCol||'#fff',ls:3,max:W*.9});
 P.text(c,'ICE COLD  •  '+o.price,W/2,H*.93,{size:34,col:'#fff',max:W*.9});P.scratches(c,W,H,r,80);P.grime(c,W,H,r,.5)},{glow:.55,r:.35})}
const BRANDS={
 blitz:{name:'BLITZ COLA',tag:'THE BIG FIZZ',c1:'#a0110c',c2:'#e83020',can1:'#8a0a08',can2:'#e8302a',ink:'#a0110c',price:'75¢'},
 polar:{name:'POLAR POP',tag:'ARCTIC BLAST',c1:'#0c3a8a',c2:'#3a9ae8',can1:'#0c3a8a',can2:'#5ab8ff',ink:'#0c3a8a',price:'75¢'},
 zest:{name:'ZEST-O',tag:'SUNSHINE IN A CAN',c1:'#e89a0c',c2:'#f8e04a',can1:'#c87a0a',can2:'#ffe25a',ink:'#c85a0a',price:'60¢',tagCol:'#6a2a0a'},
 rocket:{name:'GREEN ROCKET',tag:'LIFT OFF!',c1:'#0e5a2a',c2:'#4ad84a',can1:'#0e5a2a',can2:'#6af06a',ink:'#0e5a2a',price:'80¢'}};
const keypad=K.paint('vend_keys',256,512,(c,W,H,r)=>{c.fillStyle='#1c1e20';c.fillRect(0,0,W,H);
 c.fillStyle='#0a140a';c.fillRect(20,20,W-40,60);P.text(c,'INSERT COIN',W/2,50,{size:26,col:'#ff4a2a',font:"'MFZ Mono',monospace"});
 c.fillStyle='#2a2c2e';c.fillRect(30,100,W-60,120);c.fillStyle='#0a0a0a';c.fillRect(W/2-10,120,20,80);P.text(c,'COINS',W/2,232,{size:16,col:'#aaa'});
 c.fillStyle='#2a2c2e';c.fillRect(40,260,W-80,30);c.fillStyle='#000';c.fillRect(50,270,W-100,8);P.text(c,'$1 $5',W/2,304,{size:14,col:'#aaa'});
 for(let i=0;i<6;i++){const y=330+i*28;c.fillStyle='#d8d8d8';P.rrect(c,60,y,W-120,22,6);c.fill();P.text(c,'SELECT '+(i+1),W/2,y+11,{size:13,col:'#222'})}P.scratches(c,W,H,r,30)},{glow:.25,r:.4});
function sodaMachine(b,brand){const W=.98,H=1.85,D=.82,o=BRANDS[brand],body=K.paintSteel(0x2a2c2e,{m:.4,worn:true}),ch=K.chrome();
 b.rbox(W,H,D,.02,body,[0,H/2,0]);b.rbox(W*.72,H-.12,.03,.01,K.mat(0x111111,.3,.4),[-W*.13,H/2+.02,D/2+.01]);
 b.label(W*.68,H-.2,brandPanel(brand,o),[-W*.13,H/2+.02,D/2+.0256]);b.plane(W*.68,H-.2,K.glass(0xffffff,.1),[-W*.13,H/2+.02,D/2+.0262]);
 b.label(W*.23,H*.5,keypad,[W*.375,H*.6,D/2+.001]);b.rbox(.18,.12,.04,.01,K.mat(0x1a1a1a,.4,.6),[W*.375,.3,D/2+.01]);b.label(.14,.07,K.mat(0x050505,.9),[W*.375,.3,D/2+.031]);   // can flap
 b.cyl(.012,.012,.02,ch,[W*.375,.95,D/2+.01],[PI/2,0,0],12);b.box(.1,.04,.03,ch,[W*.375,.55,D/2+.015],null,.006);   // coin return
 b.box(W,.06,D,K.mat(0x111111,.8),[0,.03,0]);b.vents(4,W*.3,.06,K.mat(0x1a1a1a,.5,.5),[W*.375,.09,D/2+.003],false);
 for(const x of[-W/2,W/2])b.box(.012,H-.04,D-.04,K.paintSteel(parseInt(o.c1.slice(1),16),{m:.35,worn:true}),[x+(x>0?.001:-.001),H/2,0]);   // brand-coloured sides
 b.label(D*.7,H*.35,K.paint('vend_side_'+brand,256,512,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.save();c.translate(W/2,H/2);c.rotate(-PI/2);P.text(c,o.name,0,0,{size:90,col:'rgba(255,255,255,.85)',max:H*.95,font:"'MFZ Head',sans-serif"});c.restore();P.scratches(c,W,H,r,40)},{alpha:true,r:.4}),[W/2+.008,H*.62,0],[0,PI/2,0])}
K.def('vending_blitz',{label:'Blitz Cola machine',table:'convenience',items:[1,3],auto:['gas','convenience','school','motel','bowling','cinema','laundromat']},b=>sodaMachine(b,'blitz'));
K.def('vending_polar',{label:'Polar Pop machine',table:'convenience',items:[1,3],auto:['gas','convenience','school','motel','bowling','cinema']},b=>sodaMachine(b,'polar'));
K.def('vending_zest',{label:'Zest-O machine',table:'convenience',items:[1,3],auto:['gas','convenience','school','cinema']},b=>sodaMachine(b,'zest'));
K.def('vending_rocket',{label:'Green Rocket machine',table:'convenience',items:[1,3],auto:['gas','convenience','school','motel','bowling']},b=>sodaMachine(b,'rocket'));
// snack machine: glass front, spiral coils with individually painted packets
K.def('vending_snack',{label:'Snack machine',table:'convenience',items:[1,3],auto:['gas','convenience','school','office','motel','bowling','cinema','laundromat']},b=>{const W=.95,H=1.85,D=.85,body=K.paintSteel(0x26292c,{m:.4,worn:true}),ch=K.chrome(),rnd=b.rnd;
 const cx=-W*.13,cw=W*.72,ch0=H*.7;b.rbox(W,H,.04,.01,body,[0,H/2,-D/2+.02]);for(const x of[-W/2+.02,W/2-.02])b.rbox(.04,H,D,.01,body,[x,H/2,0]);b.rbox(W,.06,D,.01,body,[0,H-.03,0]);
 b.rbox(W,1.1-ch0/2,D,.01,body,[0,(1.1-ch0/2)/2,0]);b.rbox(W,H-(1.1+ch0/2),D,.01,body,[0,(H+1.1+ch0/2)/2,0]);b.rbox(W-cw-.04,ch0,D,.01,body,[W/2-(W-cw-.04)/2-.02,1.1,0]);
 b.box(cw,ch0,.01,K.mat(0xdfe2e4,.5,.2),[cx,1.1,-D/2+.045]);for(const x of[cx-cw/2+.02,cx+cw/2-.02])b.cyl(.012,.012,ch0-.04,K.mat(0xffffff,.3,0,{emissive:0xe8f4ff,emissiveIntensity:.9}),[x,1.1,D/2-.06],null,8);   // fluorescent tubes either side
 const snacks=[['CRUNCHOS','#e8402a','#ffe25a'],['MOON PIES','#3a2a8a','#ffd8a8'],['SALTY JOE','#2a6ad8','#fff'],['CHOCO BAR','#5a2a14','#f2c12e'],['NUTZ','#e8a02a','#3a1a0a'],['MINTZ','#2ab8a0','#fff'],['CHEEZ','#f2a01a','#c8102a'],['JERKY','#7a2a14','#f4f1e8']];
 const shelves=6,sw=W*.66,sh=H*.62/shelves;
 for(let s=0;s<shelves;s++){const y=.5+s*sh+sh*.1;b.box(sw,.008,D-.2,K.mat(0x3a3c3e,.4,.6),[-W*.13,y,0]);b.label(sw,.03,K.paint('vend_sh'+s,512,24,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);for(let i=0;i<5;i++)P.text(c,String.fromCharCode(65+s)+(i+1)+'  $1.'+(i*10+25),W*(i+.5)/5,H/2,{size:14,col:'#ffd23a',font:"'MFZ Mono',monospace"})},{glow:.5}),[-W*.13,y-.01,D/2-.09]);
  for(let i=0;i<5;i++){const x=-W*.13-sw/2+sw*(i+.5)/5,sk=snacks[(s*5+i*3)%snacks.length],key='snk'+((s*5+i*3)%snacks.length);
   b.add(K.torGeo(.035,.003,4,10),ch,{p:[x,y+.045,-.1],r:[0,0,0],s:[1,1,1]});for(let k=0;k<4;k++)b.add(K.torGeo(.035,.003,4,10),ch,{p:[x,y+.045,-.2+k*.08]});
   const pm=K.paint(key,128,160,(c,W,H,r)=>{c.fillStyle=sk[1];c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(0,H*.5);c.fill();
    P.text(c,sk[0],W/2,H*.45,{size:24,col:sk[2],max:W*.92,stroke:'rgba(0,0,0,.35)',lw:3});c.fillStyle=sk[2];c.beginPath();c.arc(W/2,H*.72,18,0,PI*2);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,0,W,6);c.fillRect(0,H-6,W,6)},{r:.45});
   if(rnd()<.85)for(let k=0;k<4;k++)b.add(K.rboxGeo(.11,sh*.82,.03,.008,1),pm,{p:[x,y+sh*.44,.2-k*.09],r:[-.12,0,(rnd()-.5)*.08]})}}
 b.plane(W*.7,H*.68,K.glass(0xd8eef8,.16),[-W*.13,1.1,D/2+.002]);b.frame(W*.72,H*.7,.03,K.mat(0x1a1a1a,.4,.5),[-W*.13,1.1,D/2+.006],.012);
 b.label(W*.7,.18,K.paint('snack_head',512,128,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#f2a01a');g.addColorStop(1,'#e8402a');c.fillStyle=g;c.fillRect(0,0,W,H);P.text(c,'SNAX ATTAX',W/2,H/2,{size:76,col:'#fff',stroke:'#5a1a0a',lw:5,font:"'MFZ Head',sans-serif"});P.scratches(c,W,H,r,30)},{glow:.6,r:.3}),[-W*.13,H-.12,D/2+.001]);
 b.label(W*.23,H*.5,keypad,[W*.375,H*.6,D/2+.001]);b.box(W*.66,.16,.05,K.mat(0x111111,.6),[-W*.13,.28,D/2-.02]);b.box(W*.6,.12,.02,K.mat(0x1a1a1a,.4,.6),[-W*.13,.28,D/2+.012]);
 b.box(W,.06,D,K.mat(0x111111,.8),[0,.03,0])});

/* ===== cash register (on a little counter stand) ===== */
K.def('cash_register',{label:'Cash register',table:'convenience',items:[1,3],auto:['convenience','gas','liquor','pawn','pharmacy','clothing','bakery','coffee','takeout','burger']},b=>{const body=K.paintSteel(0x3a3d42,{m:.3}),blk=K.blackPlastic(),ch=K.chrome();
 b.rbox(.7,.72,.5,.01,K.veneer(0x5a4030),[0,.36,0]);b.rbox(.72,.03,.52,.006,K.surf('concrete',0x3a3a3a),[0,.735,0]);b.frame(.64,.6,.03,K.veneer(0x5a4030),[0,.38,.252]);
 const y=.75;b.rbox(.42,.1,.4,.012,body,[0,y+.05,0]);b.rbox(.4,.08,.02,.006,body,[0,y+.04,.2]);b.handle(.12,ch,[0,y+.03,.21],false,.02);    // cash drawer
 b.add(K.rboxGeo(.42,.08,.26,.012,2),body,{p:[0,y+.13,-.02],r:[-.32,0,0]});
 b.label(.38,.22,K.paint('reg_keys',512,300,(c,W,H,r)=>{c.fillStyle='#2a2c30';c.fillRect(0,0,W,H);const keys=['7','8','9','QTY','4','5','6','VOID','1','2','3','SUB','0','00','.','TOTAL'];
  keys.forEach((k,i)=>{const x=20+(i%4)*(W-40)/4,yy=20+Math.floor(i/4)*(H-40)/4,w=(W-40)/4-12,h=(H-40)/4-12;c.fillStyle=i%4===3?(k==='TOTAL'?'#2a9a3a':'#c8302a'):'#e8e6de';P.rrect(c,x,yy,w,h,8);c.fill();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+3,yy+h-6,w-6,4);P.text(c,k,x+w/2,yy+h/2,{size:k.length>2?22:34,col:i%4===3?'#fff':'#222',font:"'MFZ Mono',monospace"})});P.scratches(c,W,H,r,30)},{r:.5}),[0,y+.135,.03],[-.32,0,0]);
 // customer + cashier displays on a pole, receipt printer
 b.cyl(.015,.015,.22,ch,[.0,y+.28,-.15],null,10);b.rbox(.26,.08,.05,.008,blk,[0,y+.42,-.15]);
 for(const [z,ry] of[[-.124,0],[-.176,PI]])b.label(.22,.05,K.paint('reg_disp',256,56,(c,W,H)=>{c.fillStyle='#061006';c.fillRect(0,0,W,H);P.text(c,'TOTAL  12.47',W/2,H/2,{size:30,col:'#3aff6a',font:"'MFZ Mono',monospace"})},{glow:.9}),[0,y+.42,z],[0,ry,0]);
 b.rbox(.14,.1,.16,.01,K.mat(0xd8d8d4,.4),[.24,y+.1,-.08]);b.box(.07,.12,.002,K.mat(0xfffdf6,.8),[.24,y+.2,-.04],[-.4,0,0]);
 b.label(.2,.12,K.paint('reg_note',200,120,(c,W,H,r)=>{c.fillStyle='#fff69a';c.fillRect(0,0,W,H);c.font="20px 'MFZ Type',serif";c.fillStyle='#223';c.textAlign='left';c.fillText('NO CHECKS',14,40);c.fillText('cash only!',14,76)},{}),[-.2,.55,.256],[0,0,.05])});

/* ===== dry goods ===== */
function cereal(b,name,c1,c2,mascot,w,h,d,rot){const m=K.paint('cer_'+name,256,360,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;c.fillRect(0,0,W,H);
  P.text(c,name,W/2,H*.15,{size:54,col:'#fff',stroke:'rgba(0,0,0,.45)',lw:5,max:W*.92});c.fillStyle='#f4f1e8';c.beginPath();c.ellipse(W/2,H*.62,W*.36,H*.2,0,0,PI*2);c.fill();
  c.fillStyle=mascot;for(let i=0;i<14;i++){c.beginPath();c.arc(W/2+(r()-.5)*W*.5,H*.6+(r()-.5)*H*.2,8+r()*6,0,PI*2);c.fill()}c.strokeStyle='#aaa';c.lineWidth=4;c.beginPath();c.ellipse(W/2,H*.62,W*.36,H*.2,0,0,PI*2);c.stroke();
  P.text(c,'NET WT 18 OZ',W/2,H*.93,{size:16,col:'#fff'});c.fillStyle='#f2c12e';c.beginPath();c.arc(W*.82,H*.33,22,0,PI*2);c.fill();P.text(c,'NEW!',W*.82,H*.33,{size:16,col:'#a0110c'});P.grime(c,W,H,r,.3)},{r:.55});
 b.add(K.rboxGeo(w,h,d,.003,1),K.surf('cardboard',parseInt(c2.slice(1),16)),{p:[0,h/2,0],r:[0,rot||0,0]});b.label(w*.98,h*.98,m,[Math.sin(rot||0)*(d/2+.001),h/2,Math.cos(rot||0)*(d/2+.001)],[0,rot||0,0])}
K.def('dry_goods_cereal',{label:'Box of cereal',table:'supermarket',items:[1,1],auto:['supermarket','convenience']},b=>{cereal(b,'OATY-OS','#e8b02a','#c8761a','#a0601a',.2,.29,.07)});
K.def('dry_goods_case',{label:'Case of dry goods',table:'supermarket',items:[1,2],auto:['supermarket','convenience']},b=>{const card=K.surf('cardboard',0xb38a58);
 b.rbox(.4,.2,.28,.006,card,[0,.1,0]);b.label(.38,.18,K.paint('case_print',256,120,(c,W,H,r)=>{c.fillStyle='#b48a56';c.fillRect(0,0,W,H);P.text(c,'RICE  -  LONG GRAIN',W/2,H*.35,{size:24,col:'#2a3a6a',max:W*.9});P.text(c,'12 x 2 LB',W/2,H*.65,{size:22,col:'#3a2a1a'});P.grime(c,W,H,r,.5)},{r:.9}),[0,.1,.141]);
 // open top showing bags of rice
 for(let i=0;i<3;i++)b.rbox(.11,.08,.22,.03,K.surf('linge',0xece6d6),[-.12+i*.12,.22,0],[0,0,(i-1)*.15])});
K.def('dry_goods_pack',{label:'Breakfast cereal x3',table:'supermarket',items:[1,1],auto:['supermarket']},b=>{
 b.push([-.12,0,0]);cereal(b,'CHOCO-BOMBS','#5a2a14','#2a1408','#c88a3a',.2,.29,.07,.1);b.pop();b.push([.12,0,.02]);cereal(b,'FROSTED STARS','#2a6ad8','#1a3a8a','#f2c12e',.2,.29,.07,-.08);b.pop();
 b.push([0,0,-.08],[0,0,0]);cereal(b,'OATY-OS','#e8b02a','#c8761a','#a0601a',.2,.29,.07,0);b.pop()});
})();
