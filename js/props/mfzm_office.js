/* MINI FORT ZOMBIE - PROPS 3/4: office + furniture + tools + fire station + shop counters (desks, dresser, coffee tables, podium,
   medicine cabinet, pill box, firefighter locker, hose cabinet, coiled hose, toolbox, tool chest, workbench, jerry can, propane cylinder,
   hay bale, yard-sale table, shop counter, reception counter). Original models + artwork. */
(function(){
'use strict';
const K=window.MFZK,P=K.P,PI=Math.PI,T=THREE;if(!K)return;

/* ===== paper, screens, small desk things ===== */
const paperM=K.paint('paper',256,330,(c,W,H,r)=>{c.fillStyle='#f6f4ec';c.fillRect(0,0,W,H);c.fillStyle='#333';c.font="bold 18px 'MFZ Type',serif";c.fillText('MEMORANDUM',20,34);
 c.fillStyle='#555';for(let i=0;i<16;i++)c.fillRect(20,60+i*15,(W-40)*(.5+r()*.5),3);c.fillStyle='rgba(120,70,30,.25)';c.beginPath();c.arc(W*.7,H*.75,34,0,PI*2);c.lineWidth=6;c.strokeStyle='rgba(120,70,30,.3)';c.stroke()},{r:.9});
const folderM=K.paint('folder',256,200,(c,W,H,r)=>{c.fillStyle='#d8b878';c.fillRect(0,0,W,H);c.fillStyle='#c8a868';c.fillRect(0,0,W,24);P.text(c,'CASE FILE 0419',W/2,H*.5,{size:22,col:'#5a2a1a',font:"'MFZ Type',serif"});c.fillStyle='#b0221a';c.fillRect(W*.6,H*.68,80,26);P.text(c,'CONFIDENTIAL',W*.6+40,H*.68+13,{size:11,col:'#fff'});P.grime(c,W,H,r,.4)},{r:.85});
const screenM=K.paint('crt',256,200,(c,W,H,r)=>{c.fillStyle='#061208';c.fillRect(0,0,W,H);c.fillStyle='#3aff6a';c.font="14px 'MFZ Mono',monospace";
 ['C:\\> DIR','EMERGENCY.TXT   2,048','ROSTER.XLS      9,216','EVAC_ROUTE.DOC  4,610','','C:\\> TYPE EMERGENCY.TXT','STAY INDOORS. DO NOT','APPROACH THE INFECTED.','_'].forEach((s,i)=>c.fillText(s,12,22+i*19));
 for(let y=0;y<H;y+=3){c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,y,W,1)}},{glow:.9,r:.2});
function pcSet(b,x,z,ry,y){b.push([x,y===undefined?.755:y,z],[0,ry,0]);const beige=K.mat(0xd8d0bc,.5);
 b.rbox(.36,.32,.36,.02,beige,[0,.16,0]);b.label(.27,.21,screenM,[0,.17,.181]);b.frame(.31,.25,.02,beige,[0,.17,.182],.01);b.rbox(.2,.03,.16,.01,beige,[0,.015,-.02]);   // CRT
 b.rbox(.44,.025,.16,.006,beige,[0,.0125,.32]);for(let i=0;i<4;i++)for(let k=0;k<12;k++)b.box(.026,.008,.026,K.mat(0xc8c0ac,.6),[-.17+k*.031,.03,.27+i*.031]);   // keyboard
 b.tube([[0,.02,.24],[.05,.0,.12],[0,.0,0],[-.05,.02,-.15]],.004,K.mat(0x2a2a2a,.5),20,6);b.rbox(.06,.025,.1,.02,beige,[.32,.0125,.32]);b.pop()}
function lamp(b,x,z){b.push([0,.755,0]);const g=K.mat(0x2a5a3a,.3,.2),br=K.mat(0xb08a3a,.35,.9);b.cyl(.06,.07,.02,br,[x,.01,z],null,18);b.cyl(.008,.008,.3,br,[x,.16,z],null,8);
 b.add(new T.CylinderGeometry(.06,.1,.1,20,1,true),g,{p:[x,.33,z+.05],r:[.5,0,0]});b.sph(.025,K.mat(0xfff6d8,.2,0,{emissive:0xffe8b0,emissiveIntensity:.5}),[x,.31,z+.06]);b.pop()}
function mug(b,x,y,z,col){b.cyl(.04,.035,.1,K.mat(col||0xf4f1e8,.4),[x,y+.05,z],null,16);b.tor(.03,.008,K.mat(col||0xf4f1e8,.4),[x+.045,y+.05,z],[0,0,PI/2],PI*1.2)}
function paperStack(b,x,y,z,n,ry){for(let i=0;i<n;i++)b.add(K.planeGeo(.21,.297),paperM,{p:[x+(b.rnd()-.5)*.02,y+.002+i*.003,z],r:[-PI/2,0,ry+(b.rnd()-.5)*.3]})}

/* ===== desks ===== */
function desk(b,W,D,wood,o){o=o||{};const H=.76,top=.035;
 b.rbox(W,top,D,.008,wood,[0,H-top/2,0]);
 // pedestals with drawers (left: 3 drawers, right: file drawer + small) and modesty panel
 const pw=.42;for(const sd of(o.oneSide?[1]:[-1,1])){const x=sd*(W/2-pw/2);b.box(pw,H-top-.02,D-.02,wood,[x,(H-top)/2,0]);
  const n=sd<0?3:2;for(let i=0;i<n;i++){const h=(H-top-.06)/n;b.rbox(pw-.02,h-.012,.02,.004,wood,[x,.03+h*(i+.5),D/2]);b.pull(.11,o.hw||K.mat(0xb08a3a,.35,.9),[x,.03+h*(i+.5)+h*.22,D/2+.01])}}
 b.box(W-(o.oneSide?pw:2*pw),.45,.018,wood,[o.oneSide?-pw/2:0,H-top-.25,-D/2+.06]);
 // centre drawer
 b.rbox(W-2*pw-.04,.07,.02,.004,wood,[o.oneSide?-pw/2:0,H-top-.05,D/2-.01])}
K.def('desk_teacher',{label:'Desk',table:'office',items:[1,3],auto:['office','townhall','school','bank','library','motel','funeral','vet','clinic']},b=>{const wood=K.veneer(0x7a5232);desk(b,1.5,.75,wood);
 b.box(1.3,.003,.55,K.surf('linge',0x2a4a2a),[0,.762,0]);   // green blotter
 lamp(b,-.55,-.2);paperStack(b,.2,.76,.05,6,.1);mug(b,.5,.76,-.15,0xc8302a);b.box(.18,.04,.12,K.veneer(0x4a3020),[-.15,.78,-.22]);for(let i=0;i<3;i++)b.cyl(.004,.004,.14,K.mat([0xd8302a,0x2a4ad8,0x1a1a1a][i],.5),[-.2+i*.02,.83,-.22],[.3,0,(i-1)*.2],6);
 b.sph(.07,K.mat(0xc8402a,.4),[.6,.83,.15]);b.cyl(.004,.004,.03,K.surf('wood',0x5a3a1a),[.6,.9,.15],null,6)});   // an apple
K.def('desk_cluttered',{label:'Desk',table:'office',items:[1,3],auto:['office','townhall','school','bank','library']},b=>{const wood=K.veneer(0x5a3c26);desk(b,1.5,.75,wood);
 pcSet(b,-.25,-.12,.15);paperStack(b,.45,.76,.05,14,.4);b.add(K.planeGeo(.24,.32),folderM,{p:[.48,.806,.05],r:[-PI/2,0,.3]});mug(b,.2,.76,.25);
 // spilled pen pot, phone with coiled cord, sticky notes
 const ph=K.mat(0x2a2a2a,.45);b.rbox(.2,.06,.18,.02,ph,[.55,.79,-.22]);b.rbox(.2,.04,.06,.02,ph,[.55,.84,-.24],[0,0,.08]);b.tube([[.47,.8,-.2],[.4,.78,-.1],[.42,.77,0],[.35,.77,.05]],.004,ph,30,6);
 for(let i=0;i<3;i++)b.add(K.planeGeo(.07,.07),K.mat([0xfff69a,0xffb0d0,0xa8f0ff][i],.8),{p:[-.6+i*.08,.762,.25],r:[-PI/2,0,i*.3]})});
K.def('desk_office',{label:'Office desk',table:'office',items:[1,3],auto:['office','townhall','bank','community']},b=>{
 // modern laminate desk on steel legs + side return with cabinet, monitor, chair
 const lam=K.veneer(0xc8b494,{fig:false,tile:1.2}),st=K.paintSteel(0x4a4c50,{m:.5}),W=1.6,D=.8;
 b.rbox(W,.03,D,.004,lam,[0,.735,0]);for(const x of[-W/2+.05,W/2-.05]){b.box(.05,.7,.05,st,[x,.36,-D/2+.06]);b.box(.05,.7,.05,st,[x,.36,D/2-.1]);b.box(.05,.04,D-.1,st,[x,.03,-.02])}
 b.box(W-.1,.3,.015,st,[0,.5,-D/2+.07]);b.rbox(.42,.6,.55,.006,st,[W/2-.3,.3,-.05]);for(let i=0;i<3;i++){b.rbox(.4,.18,.02,.004,K.mat(0x5a5c60,.4,.6),[W/2-.3,.1+i*.19,.23]);b.pull(.12,K.chrome(),[W/2-.3,.16+i*.19,.245])}
 // flat monitor + keyboard + mouse + desk phone + binder
 const blk=K.blackPlastic();b.rbox(.56,.34,.03,.01,blk,[-.15,1.02,-.2]);b.label(.52,.3,K.paint('lcd',512,300,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#1a3a6a');g.addColorStop(1,'#0a1a2a');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='#e8402a';c.fillRect(30,40,W-60,50);P.text(c,'EMERGENCY BROADCAST',W/2,65,{size:28,col:'#fff'});c.fillStyle='#ddd';for(let i=0;i<7;i++)c.fillRect(30,120+i*22,(W-60)*(.4+r()*.6),8)},{glow:.7,r:.15}),[-.15,1.02,-.184]);
 b.cyl(.012,.012,.16,blk,[-.15,.82,-.22],null,8);b.rbox(.22,.012,.16,.004,blk,[-.15,.756,-.22]);b.rbox(.42,.02,.14,.006,blk,[-.15,.76,.12]);b.rbox(.06,.02,.1,.03,blk,[.18,.76,.14]);
 b.rbox(.28,.05,.35,.008,K.mat(0x2a4a8a,.5),[.5,.775,.1],[0,.2,0]);paperStack(b,.45,.75,-.15,8,-.2);mug(b,-.6,.75,.1,0x2a6ad8);
 // office chair, pushed back and turned
 b.push([-.1,0,.75],[0,.6,0]);const cs=K.surf('laine',0x2a2c34);b.rbox(.48,.08,.46,.03,cs,[0,.48,0]);b.rbox(.46,.55,.07,.03,cs,[0,.82,-.22],[-.12,0,0]);b.cyl(.025,.025,.36,K.chrome(),[0,.28,0],null,10);
 for(let i=0;i<5;i++){const a=i*PI*2/5;b.box(.3,.03,.04,blk,[Math.cos(a)*.15,.07,Math.sin(a)*.15],[0,-a,0]);b.sph(.025,blk,[Math.cos(a)*.3,.03,Math.sin(a)*.3])}b.pop();
 b.col(-W/2,0,-D/2,W/2,.76,D/2)});

K.def('desk_steel',{label:'Steel office desk',table:'office',items:[1,3],auto:['office','townhall','school','bank','fire','utility']},b=>{const st=K.paintSteel(0x8a9096,{m:.45,worn:true}),top=K.mat(0x5a6a5a,.55),W=1.5,D=.76,H=.76,ch=K.chrome();
 // 1960s tanker desk: grey steel pedestals, green linoleum top with an aluminium edge band, chrome pulls, a typewriter and an in-tray
 desk(b,W,D,st,{hw:ch});b.rbox(W+.02,.012,D+.02,.003,top,[0,H+.006,0]);b.box(W+.03,.03,.01,K.mat(0xb8bcc0,.35,.9),[0,H-.005,D/2+.012]);b.box(W+.03,.03,.01,K.mat(0xb8bcc0,.35,.9),[0,H-.005,-D/2-.012]);
 b.push([-.2,H+.012,-.02]);const tw=K.mat(0x2a2c2a,.4,.3);b.rbox(.42,.1,.34,.03,tw,[0,.05,0]);b.add(K.rboxGeo(.42,.08,.14,.02,2),tw,{p:[0,.12,-.1],r:[.3,0,0]});b.cyl(.025,.025,.48,K.blackPlastic(),[0,.17,-.12],[0,0,PI/2],12);
 for(let r=0;r<4;r++)for(let i=0;i<10;i++)b.cyl(.009,.009,.012,K.mat(0xe8e2d6,.4),[-.15+i*.033+r*.008,.105+r*.012,.06+r*-.03],null,8);b.box(.2,.26,.002,K.mat(0xfbf8ee,.8),[0,.3,-.13],[-.25,0,0]);b.pop();
 b.box(.3,.06,.24,K.mat(0x6a5a3a,.6),[.45,H+.04,-.15]);paperStack(b,.45,H+.04,-.15,8,0);mug(b,.62,H+.012,.15,0x3a3a3a);b.col(-W/2,0,-D/2,W/2,H+.02,D/2)});

/* ===== dresser ===== */
K.def('dresser',{label:'Dresser',table:'house',items:[1,3],auto:['house','motel','clothing']},b=>{const W=1.1,H=.86,D=.5,wood=K.veneer(0x6a4a2e),br=K.mat(0xb08a3a,.3,.95);
 b.rbox(W,H-.1,D-.02,.01,wood,[0,.1+(H-.1)/2,-.01]);b.rbox(W+.04,.035,D+.03,.012,wood,[0,H+.0175,0]);
 for(const x of[-W/2+.04,W/2-.04])for(const z of[-D/2+.04,D/2-.06])b.lathe([[0,0],[.03,0],[.035,.03],[.022,.06],[.03,.09],[0,.1]],wood,[x,0,z],12);   // turned feet
 const rows=[[.18,2],[.18,1],[.2,1],[.2,1]];let y=.12;
 for(const [h,n] of rows){for(let i=0;i<n;i++){const w=(W-.04)/n,x=-W/2+.02+w*(i+.5);b.rbox(w-.012,h-.012,.022,.006,wood,[x,y+h/2,D/2-.01]);b.frame(w-.06,h-.05,.02,wood,[x,y+h/2,D/2+.002],.006);
   for(const dx of(n===1?[-w*.28,w*.28]:[0])){b.cyl(.02,.02,.008,br,[x+dx,y+h/2,D/2+.012],[PI/2,0,0],14);b.tor(.022,.004,br,[x+dx,y+h/2-.018,D/2+.016],[PI*.15,0,0],PI,12)}}y+=h}
 // top: mirror tray, perfume bottles, jewellery box, a photo frame face down
 b.rbox(.28,.012,.18,.005,K.chrome(),[-.25,H+.04,-.02]);for(let i=0;i<3;i++)b.lathe([[0,0],[.025,0],[.028,.05],[.012,.07],[.008,.09],[0,.09]],K.glass([0xe8b0c0,0xb0d0e8,0xf0e0a0][i],.55),[-.33+i*.08,H+.046,-.02],14);
 b.rbox(.18,.08,.12,.01,K.surf('laine',0x6a1a2a),[.3,H+.075,-.05]);b.rbox(.16,.012,.12,.004,K.mat(0x3a2a1a,.4),[.05,H+.042,.1],[0,.3,0])});

/* ===== coffee tables ===== */
K.def('coffee_table',{label:'Coffee table',table:'house',items:[1,2],auto:['house','motel']},b=>{const wood=K.veneer(0x5a3a22),W=1.2,D=.6,H=.45;
 b.rbox(W,.04,D,.012,wood,[0,H-.02,0]);b.box(W-.12,.02,D-.12,wood,[0,.12,0]);for(const x of[-W/2+.05,W/2-.05])for(const z of[-D/2+.05,D/2-.05])b.lathe([[0,0],[.022,0],[.026,.08],[.018,.2],[.026,.38],[.03,.43],[0,.43]],wood,[x,0,z],12);
 b.box(W-.1,.07,.018,wood,[0,H-.07,D/2-.04]);b.box(W-.1,.07,.018,wood,[0,H-.07,-D/2+.04]);
 // magazines on the shelf, remote, a bowl, coasters
 const mags=['#c8302a','#2a6ad8','#f2c12e'];mags.forEach((col,i)=>b.add(K.planeGeo(.22,.3),K.paint('mag'+i,220,300,(c,W,H,r)=>{c.fillStyle=col;c.fillRect(0,0,W,H);P.text(c,['LIFE & HOME','SPORTS WEEK','AUTO TODAY'][i],W/2,30,{size:30,col:'#fff',max:W*.9});c.fillStyle='rgba(255,255,255,.4)';c.fillRect(20,60,W-40,H*.55);P.text(c,'SPECIAL ISSUE',W/2,H*.85,{size:20,col:'#fff'})},{r:.4}),{p:[-.3+i*.05,.132+i*.003,0],r:[-PI/2,0,.3-i*.25]}));
 b.rbox(.05,.02,.17,.01,K.blackPlastic(),[.3,H+.01,.1],[0,.5,0]);b.lathe([[0,0],[.05,0],[.11,.06],[.12,.07],[0,.03]],K.mat(0x2a6a8a,.25),[.0,H,-.08],24);for(let i=0;i<3;i++)b.sph(.03,K.mat([0xc8402a,0xf2c12e,0x3aa86a][i],.4),[(i-1)*.04,H+.05,-.08])});
K.def('coffee_table_round',{label:'Round coffee table',table:'house',items:[1,2],auto:['house','motel','community']},b=>{const wood=K.veneer(0x8a5a32),gl=K.glass(0xd8f0e8,.3);
 b.cyl(.48,.48,.012,gl,[0,.46,0],null,40);b.tor(.48,.012,K.mat(0xb08a3a,.35,.9),[0,.46,0],[PI/2,0,0],null,48);
 b.cyl(.3,.3,.03,wood,[0,.12,0],null,32);for(let i=0;i<3;i++){const a=i*PI*2/3;b.tube([[Math.cos(a)*.32,0,Math.sin(a)*.32],[Math.cos(a)*.36,.2,Math.sin(a)*.36],[Math.cos(a)*.42,.45,Math.sin(a)*.42]],.018,wood,16,10)}
 b.lathe([[0,0],[.04,0],[.06,.12],[.03,.22],[.035,.26],[0,.26]],K.glass(0x6a9a8a,.6),[.15,.47,.1],18);b.cyl(.004,.004,.2,K.mat(0x3a6a2a,.6),[.15,.8,.1],null,6);b.sph(.03,K.mat(0xd83a5a,.5),[.15,.9,.1]);
 b.rbox(.25,.04,.18,.01,K.mat(0x3a2a6a,.6),[-.2,.49,-.05],[0,.4,0])});

/* ===== church podium (lectern) ===== */
K.def('church_podium',{label:'Lectern',table:'church',items:[1,2],auto:['church','funeral','community','school']},b=>{const wood=K.veneer(0x4a2c18),gold=K.mat(0xc8a040,.3,.95);
 b.rbox(.7,.08,.5,.01,wood,[0,.04,0]);b.lathe([[0,0],[.2,0],[.2,.06],[.14,.12],[.12,.9],[.16,.96],[.22,1.0],[0,1.0]].map(p=>[p[0]*.9,p[1]]),wood,[0,.08,0],8);   // octagonal turned column
 b.add(K.rboxGeo(.64,.05,.46,.01,2),wood,{p:[0,1.15,0],r:[-.35,0,0]});b.box(.6,.03,.03,wood,[0,1.06,.21],[-.35,0,0]);
 b.label(.24,.24,K.paint('cross',256,256,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#c8a040';c.fillRect(W*.43,W*.1,W*.14,H*.8);c.fillRect(W*.2,H*.3,W*.6,H*.13);c.strokeStyle='#7a5a1a';c.lineWidth=3;c.strokeRect(W*.43,W*.1,W*.14,H*.8)},{alpha:true,m:.9,r:.3}),[0,.55,.165]);
 // open bible with ribbon, tea light candle
 b.push([0,1.18,.02],[-.35,0,0]);for(const sd of[-1,1]){b.add(new T.CylinderGeometry(.13,.13,.21,16,1,false,0,PI*.5),K.mat(0xf6f0dc,.8),{p:[sd*.0,.04,0],r:[PI/2,sd>0?0:PI*.5,0],s:[1.1,1,.3]})}
 b.add(K.planeGeo(.36,.26),K.paint('bible',360,260,(c,W,H,r)=>{c.fillStyle='#f6f0dc';c.fillRect(0,0,W,H);c.fillStyle='#3a2a1a';for(let p=0;p<2;p++)for(let i=0;i<18;i++)c.fillRect(20+p*W/2,20+i*12,W/2-40,3);c.fillStyle='#8a1a1a';P.text(c,'PSALM 23',W*.25,14,{size:12,col:'#8a1a1a',font:"'MFZ Type',serif"});c.fillStyle='rgba(0,0,0,.18)';c.fillRect(W/2-4,0,8,H)},{r:.85}),{p:[0,.075,0],r:[-PI/2,0,0]});
 b.box(.01,.002,.2,K.mat(0x8a1a1a,.6),[.04,.078,.08]);b.pop()});

/* ===== medicine cabinet (wall-hung, mirrored door slightly open) ===== */
K.def('medicine_cabinet',{label:'Medical cabinet',table:'clinic',items:[1,3],auto:['clinic','pharmacy','vet']},b=>{const body=K.paintSteel(0xf2f2ee,{m:.2,r:.35}),ch=K.chrome(),W=.8,H=1.85,D=.4,gl=K.glass(0xdfeef2,.2);
 // steel cabinet: glass-doored upper half with shelves of medicine, solid lower doors, red cross, feet
 b.box(W,H-.06,.02,body,[0,H/2+.03,-D/2+.01]);for(const x of[-W/2+.01,W/2-.01])b.box(.02,H-.06,D,body,[x,H/2+.03,0]);b.rbox(W+.02,.03,D+.02,.008,body,[0,H-.015,0]);b.box(W,.02,D,body,[0,.06,0]);
 for(const x of[-W/2+.05,W/2-.05])for(const z of[-D/2+.05,D/2-.05])b.cyl(.012,.016,.06,K.chrome(),[x,.03,z],null,8);
 b.box(W-.04,.02,D-.02,body,[0,.95,0]);for(const sd of[-1,1]){b.rbox(W/2-.02,.84,.02,.006,body,[sd*W/4,.52,D/2-.01]);b.handle(.14,ch,[sd*.06,.62,D/2],true,.025)}
 const meds=[[0xb07a2a,.6],[0xf4f4f0,.5],[0x2a6ad8,.4],[0xc8302a,.4],[0x3aa86a,.4],[0xe8e2d6,.5]];
 for(let s=0;s<3;s++){const y=1.0+s*.27;if(s)b.box(W-.04,.01,D-.06,K.glass(0xeef6f8,.5),[0,y-.02,-.01]);
  for(let i=0;i<8;i++){const [c]=meds[(s*3+i)%6],h=.07+((i*7+s)%3)*.025;if((i+s)%3===0)b.rbox(.07,h*.9,.05,.004,K.mat(c,.5),[-W/2+.07+i*.09,y+h*.45,-.04]);else{b.cyl(.022,.022,h,K.mat(c,.3),[-W/2+.07+i*.09,y+h/2,-.04],null,12);b.cyl(.023,.023,.015,K.mat(0xf4f4f0,.5),[-W/2+.07+i*.09,y+h+.007,-.04],null,12)}}}
 for(const sd of[-1,1]){const x=sd*W/4;b.frame(W/2-.02,.84,.04,body,[x,1.38,D/2-.01],.02);b.plane(W/2-.08,.78,gl,[x,1.38,D/2-.012]);b.knob(ch,[x-sd*(W/4-.05),1.3,D/2],.01)}
 b.label(.2,.2,K.paint('redx_big',256,256,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#d8201a';c.fillRect(W*.36,W*.08,W*.28,H*.84);c.fillRect(W*.08,H*.36,W*.84,H*.28)},{alpha:true}),[0,.75,D/2+.002]);
 b.label(.3,.06,K.paint('med_lbl',300,60,(c,W,H)=>{c.fillStyle='#1e5aa8';c.fillRect(0,0,W,H);P.text(c,'MEDICAL SUPPLIES',W/2,H/2,{size:24,col:'#fff',max:W*.92})},{}),[0,1.82,D/2+.012])});
K.def('pill_box',{label:'Box of pills',table:'pharmacy',items:[1,1],auto:['pharmacy']},b=>{const m=K.paint('pills',256,180,(c,W,H,r)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,W,H);c.fillStyle='#2a6ad8';c.fillRect(0,0,W,50);P.text(c,'PAINEX',W/2,26,{size:34,col:'#fff'});P.text(c,'EXTRA STRENGTH',W/2,72,{size:18,col:'#2a6ad8'});
  c.fillStyle='#e8402a';c.beginPath();c.ellipse(W*.3,H*.72,24,12,0,0,PI*2);c.fill();c.fillStyle='#f4f4f0';c.fillRect(W*.3,H*.72-12,24,24);P.text(c,'24 CAPLETS',W*.68,H*.72,{size:18,col:'#333'})},{r:.4});
 b.rbox(.14,.1,.04,.003,K.mat(0xf4f4f0,.4),[0,.05,0]);b.label(.138,.098,m,[0,.05,.0205]);b.label(.138,.098,m,[0,.05,-.0205],[0,PI,0]);
 b.rbox(.1,.06,.03,.003,K.mat(0xf4f4f0,.4),[.02,.13,0],[0,.4,0])});

/* ===== fire station ===== */
K.def('fire_locker',{label:'Firefighter locker',table:'fire',items:[1,3],auto:['fire','school','sporting','bowling']},b=>{
 // open-front gear locker: jacket, helmet, boots, name plate
 const st=K.surf('mecha',0x8a949c,{m:.5}),W=.6,H=1.95,D=.5,tan=K.surf('canvas',0x8a7a4a),refl=K.paint('refl',256,32,(c,W,H)=>{c.fillStyle='#d8e030';c.fillRect(0,0,W,H);c.fillStyle='#c8ccd0';c.fillRect(0,10,W,12)},{r:.3,m:.3});
 b.box(W,H,.02,st,[0,H/2,-D/2+.01]);for(const x of[-W/2+.01,W/2-.01])b.box(.02,H,D,st,[x,H/2,0]);b.box(W,.02,D,st,[0,H-.01,0]);b.box(W,.02,D,st,[0,.3,0]);b.box(W,.02,D,st,[0,1.6,0]);
 for(const x of[-W/2+.012,W/2-.012])b.vents(8,.004,.4,K.mat(0x2a2a2a,.6),[x,1.0,D/2-.1]);
 b.label(.3,.06,K.paint('locker_name',256,52,(c,W,H)=>{c.fillStyle='#1a1a1a';c.fillRect(0,0,W,H);P.text(c,'LT. RAMIREZ  - ENG 4',W/2,H/2,{size:22,col:'#fff',max:W*.92})},{}),[0,1.66,D/2+.002]);
 // turnout coat hung on a hook (rounded torso shape + sleeves + reflective bands)
 b.cyl(.01,.01,.08,K.chrome(),[0,1.52,-.15],[PI/2,0,0],8);b.push([0,1.08,-.06]);b.add(K.rboxGeo(.42,.7,.22,.09,3),tan,{p:[0,0,0]});for(const y of[-.25,.05])b.add(K.planeGeo(.43,.04),refl,{p:[0,y,.111]});
 for(const sd of[-1,1]){b.add(K.rboxGeo(.12,.62,.12,.05,2),tan,{p:[sd*.24,-.02,0],r:[0,0,sd*.08]});b.add(K.planeGeo(.12,.035),refl,{p:[sd*.25,-.22,.061],r:[0,0,sd*.08]})}b.add(K.rboxGeo(.3,.12,.18,.05,2),tan,{p:[0,.38,-.02]});b.pop();
 // helmet on the shelf, boots + trousers on the floor
 b.push([0,1.61,0]);b.add(K.sphGeo(.14,20,10,0,PI/2),K.mat(0x1a1a1a,.35),{p:[0,.02,0],s:[1,.9,1.1]});b.add(new T.CylinderGeometry(.22,.24,.02,24),K.mat(0x1a1a1a,.35),{p:[0,.015,.03],s:[1,1,1.25]});b.label(.08,.08,K.paint('shield',128,128,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#b8862a';c.beginPath();c.moveTo(64,6);c.lineTo(118,40);c.lineTo(100,120);c.lineTo(28,120);c.lineTo(10,40);c.fill();P.text(c,'4',64,70,{size:60,col:'#fff'})},{alpha:true,m:.6}),[0,.1,.13],[-.25,0,0]);b.pop();
 for(const sd of[-1,1]){b.push([sd*.09,0,.04]);b.rbox(.11,.36,.14,.04,K.rubber(),[0,.2,0]);b.rbox(.12,.08,.26,.04,K.rubber(),[0,.04,.05]);b.add(K.planeGeo(.11,.03),refl,{p:[0,.3,.071]});b.pop()}
 b.add(K.rboxGeo(.38,.18,.2,.08,2),tan,{p:[0,.42,.02]});b.col(-W/2,0,-D/2,W/2,H,D/2)});
K.def('fire_hose_cabinet',{label:'Fire hose cabinet (wall)',table:'fire',items:[1,1]},b=>{const red=K.paintSteel(0xb0221a,{m:.4,worn:true}),y0=.9;
 b.box(.7,.7,.02,red,[0,y0+.35,-.09]);for(const x of[-.34,.34])b.box(.02,.7,.2,red,[x,y0+.35,0]);for(const y of[0,.7])b.box(.7,.02,.2,red,[0,y0+y,0]);
 // hose reel inside behind the glass
 b.cyl(.27,.27,.02,red,[0,y0+.35,-.06],[PI/2,0,0],32);b.tor(.18,.05,K.surf('canvas',0xc8bc9a),[0,y0+.35,-.02],null,null,32);b.tor(.12,.045,K.surf('canvas',0xc8bc9a),[0,y0+.35,-.02],null,null,28);b.cyl(.06,.06,.14,K.mat(0xc8a040,.3,.9),[0,y0+.35,-.02],[PI/2,0,0],16);
 b.cyl(.03,.02,.16,K.mat(0xc8a040,.3,.9),[.22,y0+.12,.0],[0,0,-.6],12);   // brass nozzle
 b.frame(.66,.66,.04,K.mat(0x8a1a12,.4,.5),[0,y0+.35,.1],.02);b.plane(.58,.58,K.glass(0xffffff,.2),[0,y0+.35,.095]);
 b.label(.5,.12,K.paint('hose_lbl',512,120,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'FIRE HOSE',W/2,H*.4,{size:64,col:'#fff',font:"'MFZ Head',sans-serif",ls:6});P.text(c,'BREAK GLASS IN EMERGENCY',W/2,H*.85,{size:24,col:'#fff'})},{alpha:true}),[0,y0+.6,.097]);
 b.cyl(.012,.012,.12,K.chrome(),[.37,y0+.35,.08],null,8);b.col(-.35,y0,-.1,.35,y0+.7,.11)});
K.def('fire_hose_coil',{label:'Coiled fire hose',table:'fire',items:[1,1],auto:['fire']},b=>{const can=K.surf('canvas',0xd8ccaa),brass=K.mat(0xc8a040,.3,.9);
 for(let i=0;i<5;i++)b.tor(.12+i*.045,.024,can,[0,.025,0],[PI/2,0,0],null,48);b.tor(.14+5*.045,.024,can,[0,.075,0],[PI/2,0,0],PI*1.3,40);
 b.cyl(.04,.04,.07,brass,[.36,.03,.1],[0,0,PI/2],16);b.cyl(.045,.045,.02,brass,[.39,.03,.1],[0,0,PI/2],10);b.cyl(.025,.04,.16,brass,[-.15,.03,.36],[PI/2,0,0],16)});

/* ===== tools ===== */
K.def('toolbox',{label:'Toolbox',table:'hardware',items:[1,2],auto:['hardware','auto','utility']},b=>{const red=K.surf('mecha',0xc0261c,{m:.4}),ch=K.chrome(),W=.52,H=.24,D=.24;
 b.rbox(W,H*.62,D,.01,red,[0,H*.31,0]);b.add(new T.CylinderGeometry(D/2,D/2,W-.004,20,1,false,0,PI),red,{p:[0,H*.62,0],r:[0,0,PI/2],s:[.7,1,1]});
 b.box(W+.004,.012,D+.004,K.mat(0x8a1a12,.4,.4),[0,H*.62,0]);for(const x of[-.16,.16]){b.box(.04,.05,.01,ch,[x,H*.6,D/2+.006]);b.cyl(.006,.006,.03,ch,[x,H*.62,D/2+.012],[0,0,PI/2],8)}
 b.tube([[-.12,H*.62+.08,0],[-.1,H*.62+.14,0],[.1,H*.62+.14,0],[.12,H*.62+.08,0]],.012,K.blackPlastic(),20,10);
 b.label(.2,.05,K.paint('tb_logo',256,64,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'IRONCLAD',W/2,H/2,{size:44,col:'#e8e6de',font:"'MFZ Head',sans-serif",ls:3})},{alpha:true}),[0,H*.3,D/2+.002]);
 // a screwdriver + hammer lying beside it
 b.cyl(.012,.012,.12,K.mat(0xf2c12e,.4),[.35,.012,.05],[0,0,PI/2],10);b.cyl(.004,.004,.14,ch,[.48,.012,.05],[0,0,PI/2],8);b.box(.3,.02,.025,K.surf('wood',0x8a5a2a),[-.35,.012,.1],[0,.4,0]);b.box(.04,.03,.11,K.mat(0x3a3a3a,.4,.8),[-.48,.016,.16],[0,.4,0],.004)});
K.def('tool_chest',{label:'Tool chest',table:'hardware',items:[1,3],auto:['hardware','auto','utility','fire']},b=>{const red=K.surf('mecha',0xb8231a,{m:.45}),ch=K.chrome(),blk=K.blackPlastic(),W=.68,D=.46;
 // rolling cabinet + top chest, ball-bearing drawers with full-width pulls, casters, side handle, stickers
 b.rbox(W,.82,D,.01,red,[0,.12+.41,0]);for(let i=0;i<5;i++){const h=[.12,.12,.16,.18,.2][i],y=.14+[0,.13,.26,.43,.62][i];b.rbox(W-.03,h-.01,.02,.004,red,[0,y+h/2,D/2]);b.box(W-.08,.014,.02,ch,[0,y+h-.025,D/2+.016],null,.005)}
 for(const x of[-W/2+.06,W/2-.06])for(const z of[-D/2+.06,D/2-.06]){b.box(.06,.04,.06,ch,[x,.1,z]);b.cyl(.045,.045,.03,K.rubber(),[x,.05,z],[0,0,PI/2],16);b.cyl(.02,.02,.04,ch,[x,.05,z],[0,0,PI/2],8)}
 b.tube([[W/2,.85,-.15],[W/2+.06,.85,-.12],[W/2+.06,.85,.12],[W/2,.85,.15]],.012,ch,16,8);
 b.rbox(W,.36,D-.04,.01,red,[0,1.13,-.02]);b.rbox(W,.06,D-.04,.01,red,[0,1.34,-.02]);for(let i=0;i<3;i++){b.rbox(W-.03,.09,.02,.004,red,[0,1.0+i*.1,D/2-.03]);b.box(W-.08,.012,.02,ch,[0,1.03+i*.1,D/2-.014],null,.005)}
 b.label(.3,.08,K.paint('tc_brand',300,80,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'IRONCLAD PRO',W/2,H/2,{size:42,col:'#f0eee6',font:"'MFZ Head',sans-serif"})},{alpha:true}),[0,1.32,D/2-.009]);
 b.label(.16,.16,K.paint('tc_stk',200,200,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='#f2c12e';c.beginPath();c.arc(100,100,90,0,PI*2);c.fill();P.text(c,'GUS\'S',100,80,{size:40,col:'#1a1a1a'});P.text(c,'GARAGE',100,124,{size:30,col:'#1a1a1a'});P.grime(c,W,H,r,.5)},{alpha:true}),[W/2+.001,.6,0],[0,PI/2,0]);
 // wrenches and a rag on top
 for(let i=0;i<3;i++){b.box(.2-i*.03,.006,.02,ch,[-.15+i*.03,1.375,.05+i*.04],[0,.3,0]);b.tor(.016,.005,ch,[-.05+i*.02,1.375,.08+i*.04],[PI/2,0,0])}b.rbox(.18,.02,.14,.01,K.surf('linge',0x3a5a8a),[.18,1.38,0],[0,.5,0])});
K.def('tool_bench',{label:'Workbench',table:'hardware',items:[2,4],auto:['hardware','auto','utility','barn']},b=>{const wood=K.surf('wood',0x8a6a42),top=K.surf('boards',0x7a5a3a),st=K.surf('mecha',0x3a4a5a,{m:.5}),ch=K.chrome(),W=1.9,D=.7;
 b.rbox(W,.06,D,.006,top,[0,.9,0]);for(const x of[-W/2+.06,W/2-.06])for(const z of[-D/2+.06,D/2-.06])b.box(.08,.87,.08,wood,[x,.435,z]);b.box(W-.1,.025,D-.1,wood,[0,.2,0]);
 // pegboard with outlines + tools, shelf, vise, clamped plank, coffee-can of nails, lamp
 b.box(W,1.0,.02,K.surf('cardboard',0xb8a07a),[0,1.45,-D/2+.01]);
 b.label(W-.02,.98,K.paint('peg',1024,512,(c,W,H,r)=>{c.fillStyle='rgba(0,0,0,0)';c.clearRect(0,0,W,H);c.fillStyle='rgba(40,30,20,.65)';for(let x=12;x<W;x+=24)for(let y=12;y<H;y+=24){c.beginPath();c.arc(x,y,3.2,0,PI*2);c.fill()}
  c.strokeStyle='rgba(20,20,20,.75)';c.lineWidth=5;[[120,140,200,40],[360,120,30,220],[460,120,30,200],[600,100,160,90],[820,140,40,240]].forEach(q=>{c.strokeRect(q[0],q[1],q[2],q[3])})},{alpha:true,r:.8}),[0,1.45,-D/2+.021]);
 const hang=[[-.6,1.75,.36,0],[-.24,1.62,.02,1],[-.04,1.62,.02,1],[.3,1.8,.2,2],[.68,1.62,.02,3]];
 hang.forEach(([x,y,w,k])=>{b.cyl(.005,.005,.06,ch,[x,y+.12,-D/2+.05],[PI/2,0,0],6);
  if(k===0){b.box(.3,.03,.004,ch,[x,y,-D/2+.04]);b.box(.06,.12,.004,ch,[x+.15,y-.04,-D/2+.04])}   // handsaw blade
  else if(k===1){b.cyl(.014,.014,.12,K.mat(0xd83a1a,.4),[x,y+.03,-D/2+.04],null,10);b.cyl(.004,.004,.12,ch,[x,y-.09,-D/2+.04],null,6)}   // screwdrivers
  else if(k===2){b.box(.26,.06,.025,K.surf('wood',0xa87a4a),[x,y-.12,-D/2+.045],[0,0,PI/2]);b.box(.12,.03,.04,K.mat(0x2a2a2a,.4,.8),[x,y,-D/2+.05])}   // hammer
  else{b.box(.03,.24,.02,ch,[x,y-.05,-D/2+.04]);b.tor(.03,.008,ch,[x,y+.08,-D/2+.04],[0,0,0])}});
 b.box(W,.025,.2,wood,[0,1.95,-D/2+.1]);for(let i=0;i<5;i++)b.cyl(.06,.06,.12,K.mat([0xb0221a,0x2a6ad8,0x3a3a3a,0xd8a01a,0x1a6a3a][i],.4,.3),[-.8+i*.35,2.03,-D/2+.1],null,16);   // paint tins
 b.push([W/2-.2,.93,D/2-.08]);b.box(.12,.09,.16,st,[0,.045,0]);b.box(.16,.1,.04,st,[0,.1,.1]);b.box(.16,.1,.04,st,[0,.1,-.02]);b.cyl(.012,.012,.3,ch,[0,.1,.25],[PI/2,0,0],10);b.cyl(.008,.008,.18,ch,[0,.1,.4],[0,0,PI/2],8);b.pop();   // bench vise
 b.box(.7,.03,.12,K.surf('wood',0xc8a070),[-.2,.945,.12],[0,.08,0]);b.push([-.45,.93,.15]);b.box(.02,.14,.08,K.mat(0xd8a01a,.4,.3),[0,.04,0]);b.cyl(.006,.006,.14,ch,[0,.04,.02],null,8);b.pop();
 b.cyl(.07,.07,.13,K.surf('rust',0x8a6a4a,{m:.5}),[.3,.995,-.15],null,18,true);for(let i=0;i<20;i++)b.cyl(.0018,.0018,.07,K.mat(0x7a7a78,.4,.9),[.3+(b.rnd()-.5)*.1,1.05,-.15+(b.rnd()-.5)*.1],[(b.rnd()-.5)*.6,0,(b.rnd()-.5)*.6],4);
 // clamp lamp
 b.push([-W/2+.1,1.95,-D/2+.15]);b.box(.04,.06,.06,K.blackPlastic(),[0,0,0]);b.tube([[0,.03,0],[.05,.25,.1],[.15,.3,.25]],.008,K.blackPlastic(),20,8);b.add(new T.CylinderGeometry(.05,.09,.1,18,1,true),K.mat(0xd8d8d8,.35,.8),{p:[.17,.26,.3],r:[1.1,0,0]});b.pop();
 b.col(-W/2,0,-D/2,W/2,.93,D/2)});
K.def('jerry_can',{label:'Jerry can',table:'hardware',items:[1,1],auto:['gas','auto','barn']},b=>{const red=K.surf('mecha',0xb8231a,{m:.4}),W=.17,H=.46,D=.34;
 b.rbox(W,H,D,.03,red,[0,H/2,0],null,3);
 // embossed X on the sides, three-bar handle, spout cap, label
 for(const sd of[-1,1])for(const a of[-1,1])b.box(.008,.03,Math.hypot(H*.75,D*.75),red,[sd*(W/2+.002),H/2,0],[Math.atan2(H*.75,D*.75)*a,0,0],.006);
 for(const z of[-.1,0,.1])b.box(.03,.06,.025,red,[0,H+.03,z],null,.008);b.box(.035,.025,.26,red,[0,H+.07,0],null,.01);
 b.push([0,H,.12],[.6,0,0]);b.cyl(.03,.03,.06,red,[0,.03,0],null,14);b.box(.05,.02,.06,K.mat(0x2a2a2a,.4,.8),[0,.065,-.02],null,.006);b.pop();
 b.label(.2,.14,K.paint('jc_lbl',256,180,(c,W,H,r)=>{c.fillStyle='#f2c12e';c.fillRect(0,0,W,H);c.fillStyle='#1a1a1a';c.fillRect(0,0,W,36);P.text(c,'GASOLINE',W/2,18,{size:28,col:'#f2c12e'});c.fillStyle='#d8201a';c.beginPath();c.moveTo(W*.22,H*.45);c.lineTo(W*.36,H*.85);c.lineTo(W*.08,H*.85);c.fill();P.text(c,'FLAMMABLE',W*.66,H*.55,{size:22,col:'#1a1a1a'});P.text(c,'20 L / 5 GAL',W*.66,H*.8,{size:18,col:'#1a1a1a'});P.grime(c,W,H,r,.7);P.scratches(c,W,H,r,30)},{r:.6}),[W/2+.012,H/2,0],[0,PI/2,0])});
K.def('propane_cylinder',{label:'Propane cylinder',table:'hardware',items:[1,1],auto:['utility','hardware']},b=>{const body=K.surf('mecha',0xe8e6de,{m:.3}),ch=K.chrome(),brass=K.mat(0xc8a040,.3,.9);
 b.lathe([[0,0],[.14,0],[.15,.02],[.15,.9],[.13,1.0],[.06,1.05],[0,1.05]],body,[0,.06,0],32);b.cyl(.15,.15,.06,K.surf('rust',0x8a7a6a,{m:.5}),[0,.03,0],null,28,true);   // foot ring
 b.cyl(.025,.025,.08,brass,[0,1.14,0],null,12);b.cyl(.04,.04,.015,brass,[0,1.2,0],null,8);b.cyl(.012,.012,.07,brass,[.05,1.14,0],[0,0,PI/2],8);
 b.tor(.09,.015,body,[0,1.18,0],[PI/2,0,0],null,24);for(const a of[0,PI])b.box(.02,.12,.02,body,[Math.cos(a)*.09,1.12,Math.sin(a)*.09]);   // guard collar
 b.label(.22,.3,K.paint('prop_lbl',256,350,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='#d8201a';c.fillRect(0,0,W,80);P.text(c,'PROPANE',W/2,42,{size:52,col:'#fff'});c.fillStyle='#1a1a1a';c.font="18px 'MFZ Mono',monospace";c.textAlign='left';
  ['NET WT 20 LB','UN1075','TARE 17.6','DANGER: HIGHLY','FLAMMABLE GAS'].forEach((s,i)=>c.fillText(s,14,120+i*30));c.fillStyle='#f2c12e';c.beginPath();c.moveTo(W*.5,H*.86);c.lineTo(W*.7,H*.98);c.lineTo(W*.3,H*.98);c.fill();P.grime(c,W,H,r,.6)},{alpha:true,r:.5}),[0,.6,.151])});

/* ===== hay bale ===== */
K.def('hay_bale',{label:'Hay bale',table:'barn',items:[1,1],auto:['barn','cornmaze']},b=>{const hay=K.surf('burlap',0xc8a850),W=.48,H=.38,D=.92;
 b.rbox(W,H,D,.06,hay,[0,H/2,0],null,3);
 // straggling straws + two twine bands
 for(const z of[-.24,.24]){b.tor(Math.hypot(W,H)/2*.9,.006,K.mat(0x8a6a3a,.9),[0,H/2,z],[0,0,0],null,32)}
 const rnd=b.rnd,straw=K.mat(0xd8b860,.9);for(let i=0;i<70;i++){const side=Math.floor(rnd()*4),l=.06+rnd()*.12,y=rnd()*H,z=(rnd()-.5)*D;let p,r;
  if(side<2){p=[(side?1:-1)*(W/2),y,z];r=[rnd()*3,rnd()*3,PI/2+(rnd()-.5)]}else{p=[(rnd()-.5)*W,side===2?H:.01,z];r=[PI/2+(rnd()-.5),rnd()*3,0]}b.cyl(.002,.002,l,straw,p,r,3)}});

/* ===== yard-sale table ===== */
K.def('yard_sale_table',{label:'Yard-sale table',table:'house',items:[2,4],auto:['house','park']},b=>{const W=1.8,D=.75,top=K.mat(0xe8e6de,.6),leg=K.mat(0x8a8c90,.4,.8);
 b.rbox(W,.04,D,.015,top,[0,.73,0]);for(const sd of[-1,1]){b.tube([[sd*(W/2-.15),.71,-D/2+.08],[sd*(W/2-.2),0,-D/2+.08]],.012,leg,4,8);b.tube([[sd*(W/2-.15),.71,D/2-.08],[sd*(W/2-.2),0,D/2-.08]],.012,leg,4,8);b.cyl(.01,.01,D-.16,leg,[sd*(W/2-.18),.3,0],[PI/2,0,0],8)}
 // junk for sale: lamp, records, a trophy, toaster, books, a bowling ball, price stickers + cardboard sign
 b.label(.5,.3,K.paint('yard_sign',512,300,(c,W,H,r)=>{c.fillStyle='#c8a46e';c.fillRect(0,0,W,H);P.text(c,'YARD SALE',W/2,H*.32,{size:86,col:'#b0221a',font:"'MFZ Head',sans-serif"});P.text(c,'EVERYTHING $1',W/2,H*.7,{size:50,col:'#1a1a1a',font:"'MFZ Type',serif"});P.grime(c,W,H,r,.6)},{r:.9}),[0,.6,D/2+.01],[-.1,0,0]);
 lampOnTable(b,-.7,.75,-.15);for(let i=0;i<6;i++)b.box(.31,.31,.004,K.paint('rec'+(i%3),128,128,(c,W,H)=>{c.fillStyle=['#2a4a8a','#b0221a','#e8b02a'][i%3];c.fillRect(0,0,W,H);c.fillStyle='#111';c.beginPath();c.arc(W*.8,H/2,40,0,PI*2);c.fill();P.text(c,['JAZZ','ROCK','DISCO'][i%3],W*.35,H/2,{size:26,col:'#fff'})},{r:.6}),[-.25,.9,-.1+i*.006],[-.15,0,0]);
 b.lathe([[0,0],[.06,0],[.06,.02],[.02,.04],[.015,.12],[.05,.16],[.06,.24],[0,.25]],K.mat(0xd8b040,.3,.95),[.2,.75,-.15],18);b.box(.12,.04,.12,K.mat(0x1a1a1a,.5),[.2,.77,-.15]);
 b.rbox(.26,.18,.15,.03,K.mat(0xd8d8d4,.3,.6),[.55,.84,-.1]);b.sph(.11,K.mat(0x2a3a8a,.2,.1),[.72,.86,.17]);for(let i=0;i<3;i++)b.box(.18,.04,.25,K.mat([0x6b1d1d,0x1d3b6b,0x2f5a2a][i],.7),[.25,.77+i*.042,.18],[0,.2*i,0]);
 b.rbox(.12,.07,.12,.01,K.mat(0xf2c12e,.4),[-.3,.785,.2]);for(let i=0;i<6;i++)b.cyl(.012,.012,.003,K.mat(0xff6a3a,.6),[-.8+i*.3,.752,.3],null,8);
 b.col(-W/2,0,-D/2,W/2,.76,D/2)});
function lampOnTable(b,x,y,z){b.lathe([[0,0],[.07,0],[.08,.04],[.04,.1],[.05,.2],[.02,.3],[0,.3]],K.mat(0x6a8a6a,.3),[x,y,z],18);b.add(new T.CylinderGeometry(.08,.14,.16,20,1,true),K.surf('linge',0xe8dcc0),{p:[x,y+.36,z]})}

/* ===== shop counters ===== */
K.def('shop_counter',{label:'Shop counter',table:'convenience',items:[1,3]},b=>{const W=2.2,D=.62,H=1.0,front=K.paintSteel(0x8a2a22,{m:0,r:.5,worn:true}),top=K.surf('concrete',0x2a2a2c),st=K.chrome();
 // L-shaped counter with display front, kick plate, lottery display, gum rack, register spot, stool
 b.rbox(W,H-.05,D,.008,front,[0,(H-.05)/2,0]);b.rbox(D,H-.05,1.4,.008,front,[W/2-D/2,(H-.05)/2,-.7-D/2+.01]);
 b.rbox(W+.04,.04,D+.04,.008,top,[0,H-.02,0]);b.rbox(D+.04,.04,1.4,.008,top,[W/2-D/2,H-.02,-.7-D/2+.01]);
 b.box(W,.1,.01,st,[0,.05,D/2+.002]);for(let i=0;i<5;i++)b.frame(.38,.6,.03,K.paintSteel(0x6a1a14,{m:0,r:.5}),[-W/2+.24+i*.43,.48,D/2+.002]);
 // gum / candy rack on the front
 b.push([-.4,.62,D/2+.08]);b.box(.6,.4,.12,K.mat(0x2a2a2a,.5,.5),[0,0,0]);for(let r=0;r<3;r++)for(let i=0;i<6;i++)b.box(.08,.1,.08,K.mat([0xd83a2a,0x2a8ad8,0xf2c12e,0x3ab86a,0xe86ab0,0xf4f1e8][(r+i)%6],.4),[-.25+i*.1,-.13+r*.13,.02]);b.pop();
 b.rbox(.4,.25,.25,.02,K.mat(0x1a1a1a,.4),[.6,H+.125,-.05]);b.label(.36,.15,K.paint('lotto',256,110,(c,W,H,r)=>{const g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,'#7a1ab0');g.addColorStop(1,'#d83a8a');c.fillStyle=g;c.fillRect(0,0,W,H);P.text(c,'LUCKY 7 LOTTO',W/2,H*.4,{size:34,col:'#ffd23a'});P.text(c,'TODAY: $2,000,000',W/2,H*.78,{size:20,col:'#fff'})},{glow:.4}),[.6,H+.15,.076]);
 b.lathe([[0,0],[.18,0],[.18,.02],[.03,.04],[.03,.62],[.2,.64],[.2,.7],[0,.7]],K.mat(0x8a8c90,.35,.8),[0,0,-1.0],20);b.cyl(.2,.2,.06,K.surf('laine',0x8a1a1a),[0,.73,-1.0],null,20);
 b.col(-W/2,0,-D/2,W/2,H,D/2).col(W/2-D,0,-1.4-D/2,W/2,H,-D/2)});
K.def('reception_counter',{label:'Reception counter',table:'office',items:[1,3]},b=>{const W=2.0,D=.7,H=1.1,gran=K.surf('concrete',0x6a6560),tile=K.veneer(0x3a2a20),st=K.chrome();
 b.rbox(W,H-.05,.06,.008,tile,[0,(H-.05)/2,D/2-.03]);b.rbox(W,.75,D-.06,.006,K.veneer(0x6a4a2e),[0,.375,-.03]);b.rbox(W+.06,.04,.3,.01,gran,[0,H,D/2-.1]);b.rbox(W,.03,D,.006,gran,[0,.76,0]);
 for(let i=0;i<5;i++)b.box(.012,H-.1,.012,st,[-W/2+.2+i*.4,(H-.05)/2,D/2+.002]);
 b.label(.8,.16,K.paint('recep',512,100,(c,W,H)=>{c.clearRect(0,0,W,H);P.text(c,'RECEPTION',W/2,H/2,{size:70,col:'#d8d8d8',font:"'MFZ Head',sans-serif",ls:10})},{alpha:true,m:.8,r:.3}),[0,.75,D/2+.002]);
 b.box(.24,.15,.002,K.mat(0xc8a040,.3,.9),[.6,H+.1,D/2-.12],[-.3,0,0]);b.box(.04,.05,.1,K.mat(0xc8a040,.3,.9),[.6,H+.025,D/2-.1]);   // bell + sign stand
 b.sph(.035,K.mat(0xc8c8c8,.2,1),[-.6,H+.03,D/2-.1],[1,.5,1]);b.cyl(.04,.04,.01,K.mat(0x1a1a1a,.4),[-.6,H+.025,D/2-.1],null,16);
 pcSet(b,.2,-.05,PI);paperStack(b,-.4,.775,-.1,10,.2);b.col(-W/2,0,-D/2,W/2,H,D/2)});
})();
