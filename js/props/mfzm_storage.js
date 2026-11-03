/* MINI FORT ZOMBIE - PROPS 1/4: storage + armoury (crates, boxes, trunks, shelving, racking, bookshelf, gun racks, display case). Original models. */
(function(){
'use strict';
const K=window.MFZK,P=K.P,PI=Math.PI,T=THREE;if(!K)return;

/* ===== shared painted textures ===== */
// military stencil block (crates): lines = [[text,size],...]
const stencil=(key,w,h,bg,ink,lines,o)=>K.paint(key,w,h,(c,W,H,r)=>{if(bg){c.fillStyle=bg;c.fillRect(0,0,W,H)}
 let y=H*(o&&o.top||.18);for(const [s,sz] of lines){P.stencil(c,s,W/2,y,sz,ink,r,{max:W*.9});y+=sz*1.25}if(o&&o.arrows){c.fillStyle=ink;for(const x of[W*.12,W*.88]){c.beginPath();c.moveTo(x,H*.1);c.lineTo(x-14,H*.26);c.lineTo(x+14,H*.26);c.fill();c.fillRect(x-5,H*.26,10,H*.18)}}
 if(bg)P.grime(c,W,H,r,.7)},{alpha:!bg,r:.8});
// cardboard face print
function boxPrint(key,kind){return K.paint('cb_'+key,512,512,(c,W,H,r)=>{c.fillStyle='#b48a56';c.fillRect(0,0,W,H);
 for(let i=0;i<70;i++){c.fillStyle='rgba(120,84,44,'+(.04+r()*.05)+')';c.fillRect(0,r()*H,W,1+r()*3)}   // corrugation streaks
 c.fillStyle='rgba(210,180,120,.5)';c.fillRect(W*.44,0,W*.12,H);                                         // tape down the middle
 c.strokeStyle='rgba(150,120,70,.6)';c.lineWidth=1;for(let i=0;i<10;i++){c.beginPath();c.moveTo(W*.44,r()*H);c.lineTo(W*.56,r()*H);c.stroke()}
 c.fillStyle='#3a2a1a';
 if(kind==='up'){for(const x of[W*.2,W*.32]){c.beginPath();c.moveTo(x,H*.12);c.lineTo(x-16,H*.22);c.lineTo(x+16,H*.22);c.fill();c.fillRect(x-5,H*.22,10,H*.12)}P.text(c,'THIS SIDE UP',W*.26,H*.4,{size:22,col:'#3a2a1a',max:W*.3})
  c.strokeStyle='#3a2a1a';c.lineWidth=4;c.beginPath();c.moveTo(W*.7,H*.15);c.lineTo(W*.78,H*.15);c.lineTo(W*.76,H*.3);c.lineTo(W*.72,H*.3);c.closePath();c.stroke();c.beginPath();c.moveTo(W*.74,H*.3);c.lineTo(W*.74,H*.38);c.moveTo(W*.7,H*.38);c.lineTo(W*.78,H*.38);c.stroke();P.text(c,'FRAGILE',W*.74,H*.45,{size:20,col:'#7a1a12'})}
 // shipping label
 c.save();c.translate(W*.72,H*.72);c.rotate((r()-.5)*.08);c.fillStyle='#f4f1e8';c.fillRect(-90,-60,180,120);c.fillStyle='#222';c.font="13px 'MFZ Mono',monospace";c.textAlign='left';
 ['SHIP TO:','HARGROVE SUPPLY CO.','DOCK 4  - BAY 12','PINE HOLLOW, OR'].forEach((s,i)=>c.fillText(s,-82,-40+i*15));P.barcode(c,-82,10,164,44,r);c.restore();
 if(kind==='brand'){P.text(c,'NORTHFIELD',W*.25,H*.7,{size:46,col:'#2c3e6b',font:"'MFZ Head',sans-serif",max:W*.4});P.text(c,'CANNED GOODS',W*.25,H*.79,{size:20,col:'#2c3e6b'});P.text(c,'24 x 400g',W*.25,H*.86,{size:18,col:'#3a2a1a'})}
 P.grime(c,W,H,r,.6);P.scratches(c,W,H,r,30,'rgba(80,50,20,.4)')},{r:.92})}
const books=K.paint('books',1024,256,(c,W,H,r)=>{let x=0;const cols=['#6b1d1d','#1d3b6b','#2f5a2a','#6b5a1d','#3a2a4a','#1a1a1a','#8a6a3a','#5a2a1a','#2a4a5a','#7a7466','#a8432a'];
 while(x<W){const w=10+r()*26,h=H*(.62+r()*.36),col=cols[Math.floor(r()*cols.length)];c.fillStyle=col;c.fillRect(x,H-h,w-1,h);
  c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x+1,H-h,2,h);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x+w-4,H-h,3,h);
  c.fillStyle='rgba(220,190,110,.75)';c.fillRect(x+2,H-h+8,w-5,2);c.fillRect(x+2,H-14,w-5,2);
  c.save();c.translate(x+w/2,H-h/2);c.rotate(-PI/2);c.fillStyle='rgba(235,220,170,.85)';c.font=Math.min(w*.6,14)+"px 'MFZ Type',serif";c.textAlign='center';c.textBaseline='middle';
  c.fillText(['ATLAS','HISTORY','POEMS','LEDGER','VOL. II','FIELD GUIDE','ROADS','RECIPES','LAW','BIRDS','TIDES','MAPS'][Math.floor(r()*12)],0,0);c.restore();x+=w}
 P.grime(c,W,H,r,.35)},{alpha:false,r:.8});
// shelf stock: 8 can labels (wrap round a cylinder) + 8 box designs
const CANS=[['#c8302a','#fff','TOMATO SOUP'],['#2a6a3a','#ffe9a8','GARDEN PEAS'],['#e8b02a','#2a1a0a','SWEET CORN'],['#1e4a8a','#fff','TUNA CHUNKS'],['#7a3a1a','#ffe9a8','BAKED BEANS'],['#f4f1e8','#c8302a','CHICKEN SOUP'],['#3a3a3a','#ffd23a','COFFEE'],['#d86a2a','#fff','PEACHES']];
const canM=i=>K.paint('can'+i,256,128,(c,W,H,r)=>{const [bg,fg,t]=CANS[i];c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.85)';c.fillRect(0,H*.3,W,H*.4);P.text(c,t,W*.25,H*.5,{size:22,col:bg==='#f4f1e8'?'#c8302a':bg,max:W*.45});P.text(c,t,W*.75,H*.5,{size:22,col:bg==='#f4f1e8'?'#c8302a':bg,max:W*.45});
 c.fillStyle=fg;c.fillRect(0,4,W,3);c.fillRect(0,H-7,W,3);P.text(c,'NET WT 15 OZ',W*.5,H*.85,{size:12,col:fg})},{r:.35,m:.2});
const BOXES=[['#e8402a','PASTA','#fff'],['#2a6ad8','RICE','#fff'],['#f2c12e','CRACKERS','#7a1a0a'],['#3aa86a','TEA','#fff'],['#5a2a14','COCOA','#f2c12e'],['#f4f1e8','FLOUR','#2a4a8a'],['#8a3ab0','GRAPE JAM','#fff'],['#1a1a1a','MATCHES','#e8402a']];
const boxM=i=>K.paint('pbox'+i,128,160,(c,W,H,r)=>{const [bg,t,fg]=BOXES[i];c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.arc(W*.5,H*.62,38,0,PI*2);c.fill();P.text(c,t,W/2,H*.25,{size:26,col:fg,max:W*.9,stroke:'rgba(0,0,0,.3)',lw:2});P.text(c,'FAMILY SIZE',W/2,H*.88,{size:12,col:fg})},{r:.5});
const pegM=K.paint('peg_holes',512,512,(c,W,H,r)=>{c.clearRect(0,0,W,H);c.fillStyle='rgba(20,20,22,.8)';for(let x=8;x<W;x+=16)for(let y=8;y<H;y+=16){c.beginPath();c.arc(x,y,2.6,0,PI*2);c.fill()}},{alpha:true,r:.5});
/* ===== crates ===== */
function woodCrate(b,w,h,d,wood,o){o=o||{};const slat=.012,frameW=.07;
 // panels
 b.rbox(w-.02,h-.02,d-.02,.004,wood,[0,h/2,0]);
 // edge frames on front/back and sides
 for(const z of[d/2,-d/2]){b.box(w,frameW,.022,wood,[0,frameW/2,z]);b.box(w,frameW,.022,wood,[0,h-frameW/2,z]);b.box(frameW,h-2*frameW,.022,wood,[-w/2+frameW/2,h/2,z]);b.box(frameW,h-2*frameW,.022,wood,[w/2-frameW/2,h/2,z]);
  if(o.cross)b.box(Math.hypot(w-2*frameW,h-2*frameW),frameW*.8,.018,wood,[0,h/2,z],[0,0,Math.atan2(h-2*frameW,w-2*frameW)])}
 for(const x of[w/2,-w/2]){b.box(.022,frameW,d,wood,[x,frameW/2,0]);b.box(.022,frameW,d,wood,[x,h-frameW/2,0]);b.box(.022,h,frameW,wood,[x,h/2,-d/2+frameW/2]);b.box(.022,h,frameW,wood,[x,h/2,d/2-frameW/2])}
 // lid boards
 const n=Math.max(3,Math.round(w/.16));for(let i=0;i<n;i++){const bw=w/n;b.box(bw-.006,slat*1.5,d,wood,[-w/2+bw*(i+.5),h+slat*.75,0],null,.002)}
 // nails
 const nails=[];for(const z of[d/2+.012,-d/2-.012])for(const x of[-w/2+frameW/2,w/2-frameW/2])for(const y of[frameW/2,h-frameW/2])nails.push([x,y,z]);b.screws(nails,K.mat(0x5a5a58,.4,.9),.004);
 return b}
function ropeHandle(b,x,h,d,rope){const z=0;b.push([x,h*.62,0]);b.tor(.05,.009,rope,[0,0,0],[0,PI/2,0],PI,16);b.box(.03,.04,.06,K.mat(0x3a3a38,.5,.8),[0,0,.06]);b.box(.03,.04,.06,K.mat(0x3a3a38,.5,.8),[0,0,-.06]);b.pop()}
K.def('ammo_crate',{label:'Ammo crate',table:'gunshop',items:[2,4],auto:['gunshop']},b=>{
 const w=.94,h=.42,d=.46,wood=K.surf('crate',0x5a6436),rope=K.mat(0x8a7a52,.95);woodCrate(b,w,h,d,wood);
 for(const x of[-w/2-.012,w/2+.012])ropeHandle(b,x,h,d,rope);
 b.label(.74,.3,stencil('st_ammo',512,208,null,'#e8d24a',[['CARTRIDGES 5.56 MM',34],['BALL M855  -  1680 RDS',26],['LOT  WCC-21-0417',22]],{top:.22}),[0,h*.52,d/2+.013]);
 b.label(.3,.26,stencil('st_ammo_side',256,224,null,'#e8d24a',[['GROSS WT',22],['72 LBS',30],['CU 0.8',22]],{top:.24}),[w/2+.013,h*.5,0],[0,PI/2,0]);
 // steel latches
 for(const x of[-.25,.25]){b.box(.05,.07,.012,K.mat(0x2e2f2c,.45,.85),[x,h-.02,d/2+.018]);b.cyl(.006,.006,.05,K.chrome(),[x,h-.055,d/2+.026],[0,0,PI/2],8)}});
K.def('weapon_crate',{label:'Weapon crate',table:'gunshop',items:[2,4],auto:['gunshop']},b=>{
 const w=1.4,h=.5,d=.62,wood=K.surf('crate',0x4d5a2e),steel=K.mat(0x2b2c2a,.5,.85);woodCrate(b,w,h,d,wood,{cross:false});
 // steel corner caps + strapping
 for(const x of[-w/2,w/2])for(const z of[-d/2,d/2])for(const y of[.03,h-.03])b.rbox(.07,.07,.07,.008,steel,[x,y,z]);
 for(const x of[-.45,.45]){b.box(.04,.004,d+.03,steel,[x,h+.03,0]);b.box(.04,h+.03,.004,steel,[x,h/2+.01,d/2+.014]);b.box(.04,h+.03,.004,steel,[x,h/2+.01,-d/2-.014])}
 b.label(1.0,.34,stencil('st_wpn',768,256,null,'#f0ece0',[['RIFLE, 5.56 MM M16A2',40],['QTY 6   NSN 1005-01-128-9936',26],['U.S. PROPERTY',30]],{top:.2}),[0,h*.5,d/2+.013]);
 b.label(.34,.2,stencil('st_wpn_s',256,160,null,'#f0ece0',[['WT 96 LB',26],['KEEP DRY',26]],{top:.3}),[w/2+.013,h*.5,0],[0,PI/2,0]);
 for(const x of[-w/2-.016,w/2+.016])ropeHandle(b,x,h,d,K.mat(0x2a2a28,.6,.6))});
K.def('weapon_crate_long',{label:'Long weapon case',table:'gunshop',items:[2,4],auto:['gunshop']},b=>{
 // steel-banded wooden long case with hinged lid opened a crack
 const w=1.36,h=.44,d=.58,wood=K.surf('wood',0x6a5232),steel=K.mat(0x34352f,.45,.85);woodCrate(b,w,h,d,wood,{cross:true});
 for(const x of[-.3,.3]){b.box(.09,.06,.02,steel,[x,h-.04,d/2+.016]);b.cyl(.012,.012,.02,K.chrome(),[x,h-.04,d/2+.03],[PI/2,0,0],10)}
 b.label(.9,.24,stencil('st_wpn2',768,200,null,'#e2dccb',[['ORDNANCE - HANDLE WITH CARE',34],['CONTENTS: SHOTGUN 12GA x4',28]],{top:.3}),[0,h*.42,d/2+.013])});
K.def('weapon_crate_stack',{label:'Stack of weapon crates',table:'gunshop',items:[3,6]},b=>{
 const add=(name,p,ry)=>{const M=K.model(name);for(const q of M.meshes)b.add(q.g,q.mat,{p,r:[0,ry,0]})};
 add('weapon_crate',[-.8,0,0],0);add('weapon_crate_long',[.75,0,.04],.06);add('ammo_crate',[-.75,.53,.02],-.08);add('ammo_crate',[.0,.53,.0],.15);
 b.col(-1.52,0,-.36,1.45,.5,.36).col(-1.25,.5,-.3,.5,.98,.3)});

/* ===== cardboard boxes ===== */
function cbox(b,w,h,d,key,kind,o){o=o||{};const card=K.surf('cardboard',0xb38a58),m=boxPrint(key,kind);
 b.rbox(w,h,d,.008,card,[0,h/2,0],null,2);
 b.label(w*.98,h*.96,m,[0,h/2,d/2+.001]);b.label(w*.98,h*.96,m,[0,h/2,-d/2-.001],[0,PI,0]);
 b.label(d*.98,h*.96,boxPrint(key+'s','brand'),[w/2+.001,h/2,0],[0,PI/2,0]);b.label(d*.98,h*.96,boxPrint(key+'s2','up'),[-w/2-.001,h/2,0],[0,-PI/2,0]);
 // top flaps: one lifted
 const tape=K.mat(0xc9a86a,.4,0);b.box(w*.98,.004,d*.5-.004,card,[0,h+.002,d*.25]);
 if(o.open){b.box(w*.98,.004,d*.5,card,[0,h+d*.18,-d*.25-.02],[-1.0,0,0])}else{b.box(w*.98,.004,d*.5-.004,card,[0,h+.002,-d*.25]);b.box(.06,.002,d+.01,tape,[0,h+.005,0])}
 b.box(.06,h*.25,.002,tape,[0,h-h*.125,d/2+.003]);b.box(.06,h*.25,.002,tape,[0,h-h*.125,-d/2-.003])}
K.def('cardboard_box_small',{label:'Cardboard box',table:'storage',items:[1,2],auto:['storage','warehouse','house']},b=>cbox(b,.48,.42,.36,'s','up'));
K.def('cardboard_box_medium',{label:'Cardboard box',table:'storage',items:[1,3],auto:['storage','warehouse','convenience']},b=>cbox(b,.62,.5,.5,'m','brand',{open:true}));
K.def('cardboard_box_large',{label:'Large cardboard box',table:'storage',items:[1,3],auto:['storage','warehouse','supermarket']},b=>{cbox(b,.8,.62,.6,'l','up');
 // a smaller box sitting on top, turned
 const M=K.model('cardboard_box_small');for(const q of M.meshes)b.add(q.g,q.mat,{p:[.08,.625,.02],r:[0,.35,0],s:[.8,.8,.8]})});

/* ===== trunks ===== */
function trunk(b,w,h,d,body,trim,o){const lidH=h*.3,bh=h-lidH;
 b.rbox(w,bh,d,.012,body,[0,bh/2,0]);
 // domed lid
 const lidG=new T.CylinderGeometry(d/2,d/2,w,24,1,false,0,PI);b.add(lidG,body,{p:[0,bh,0],r:[0,0,PI/2],s:[lidH/(d/2),1,1]});
 // wooden ribs + brass corners + leather straps
 for(const x of[-w*.3,w*.3]){b.box(.06,bh+.01,d+.012,trim,[x,bh/2,0],null,.005);b.add(new T.CylinderGeometry(d/2+.006,d/2+.006,.06,24,1,true,0,PI),trim,{p:[x,bh,0],r:[0,0,PI/2],s:[(lidH+.006)/(d/2),1,1]})}
 b.box(w+.012,.04,d+.012,trim,[0,.02,0]);b.box(w+.012,.035,d+.012,trim,[0,bh-.018,0]);
 const brass=K.mat(0xb08a3a,.35,.95);for(const x of[-w/2,w/2])for(const z of[-d/2,d/2])for(const y of[.03,bh-.03])b.rbox(.06,.06,.06,.006,brass,[x,y,z]);
 b.rbox(.1,.12,.02,.006,brass,[0,bh-.02,d/2+.012]);b.cyl(.012,.012,.03,brass,[0,bh-.05,d/2+.024],[PI/2,0,0],12);   // lock
 for(const x of[-w/2-.012,w/2+.012]){b.box(.02,.03,.16,brass,[x,bh*.6,0]);b.tor(.045,.008,brass,[x+(x>0?.01:-.01),bh*.6-.03,0],[0,PI/2,0],PI)}
 if(o&&o.stickers){b.label(.22,.15,K.paint('trunk_st1',256,180,(c,W,H,r)=>{c.fillStyle='#e8dcb8';P.rrect(c,4,4,W-8,H-8,20);c.fill();P.text(c,'GRAND HOTEL',W/2,H*.38,{size:30,col:'#7a1a12',font:"'MFZ Type',serif"});P.text(c,'LAKE ORION',W/2,H*.68,{size:22,col:'#2a3a5a',font:"'MFZ Type',serif"});P.grime(c,W,H,r,.8)},{alpha:true}),[-w*.16,bh*.55,d/2+.002],[0,0,.08]);
  b.label(.16,.16,K.paint('trunk_st2',200,200,(c,W,H,r)=>{c.fillStyle='#2a4a6a';c.beginPath();c.arc(W/2,H/2,W/2-4,0,PI*2);c.fill();c.strokeStyle='#e8dcb8';c.lineWidth=5;c.stroke();P.text(c,'S.S. ALBION',W/2,H/2,{size:24,col:'#e8dcb8',font:"'MFZ Type',serif"});P.grime(c,W,H,r,.7)},{alpha:true}),[w*.16,bh*.5,d/2+.002],[0,0,-.12])}}
K.def('trunk_steamer',{label:'Steamer trunk',table:'house',items:[1,3],auto:['house','storage','motel']},b=>trunk(b,1.0,.62,.56,K.surf('canvas',0x3e5a4a),K.surf('wood',0x6a4a2a),{stickers:true}));
K.def('trunk_leather',{label:'Old trunk',table:'house',items:[1,3],auto:['house','storage','motel']},b=>trunk(b,.92,.56,.52,K.surf('laine',0x5a3a26),K.surf('wood',0x3e2a1a)));

/* ===== shelving ===== */
// gondola shop shelving: length L, height H, depth D (double sided), fill 0..1
function gondola(b,L,H,D,fill,sides,key){const steel=K.paintSteel(0xdcdcd6,{tile:1}),dark=K.mat(0x2a2c2e,.5,.6),rnd=b.rnd;
 b.rbox(L,.12,D,.006,steel,[0,.06,0]);b.box(L,.02,D-.02,K.mat(0x1a1a1a,.8),[0,.005,0]);                                  // kick plate + shadow gap
 b.box(L,H-.12,.03,steel,[0,(H+.12)/2,0]);for(const sd of sides)b.label(L-.02,H-.16,pegM,[0,(H+.12)/2,sd*.0155],[0,sd>0?0:PI,0]);   // pegboard spine, holes painted
 for(const x of[-L/2,L/2])b.box(.04,H,D*.12,steel,[x,H/2,0]);
 const levels=[.14,.52,.9,1.28,1.66].filter(y=>y<H-.12);
 for(const sd of sides)for(const y of levels){const z=sd*(D/4+.015);b.rbox(L-.02,.025,D/2-.04,.004,steel,[0,y,z]);b.box(L-.02,.045,.008,K.mat(0xf2f2ee,.5),[0,y-.005,z+sd*(D/4-.02)]);
  b.label(L-.04,.04,K.paint('price_'+key,1024,48,(c,W,H,r)=>{c.fillStyle='#f6f6f0';c.fillRect(0,0,W,H);for(let x=10;x<W;x+=90+r()*40){c.fillStyle='#fff7a8';c.fillRect(x,4,60,H-8);P.text(c,'$'+(1+r()*9).toFixed(2),x+30,H/2,{size:22,col:'#c8302a',font:"'MFZ Mono',monospace"})}},{}),[0,y-.005,z+sd*(D/4-.02)+sd*.0045],[0,sd>0?0:PI,0]);
  // stock: facings of one product each, 2-3 deep, gaps where it was looted
  let x=-L/2+.04;const top=levels[levels.indexOf(y)+1]||H;
  while(x<L/2-.08){const can=rnd()<.5,i=Math.floor(rnd()*8),n=1+Math.floor(rnd()*3),take=rnd()<fill;
   if(can){const r0=.038,h=.11;for(let k=0;k<n&&take;k++)for(let dd=0;dd<3;dd++)if(rnd()<fill+.1){b.cyl(r0,r0,h,canM(i),[x+r0+k*(r0*2+.004),y+.0125+h/2,z+sd*(D/4-.06-dd*.085)],[0,sd>0?0:PI,0],14);if(rnd()<.35&&top-y>.3)b.cyl(r0,r0,h,canM(i),[x+r0+k*(r0*2+.004),y+.0125+h*1.5,z+sd*(D/4-.06-dd*.085)],[0,sd>0?0:PI,0],14)}x+=n*(r0*2+.004)+.02}
   else{const w=.12+rnd()*.06,h=.16+rnd()*.12;for(let k=0;k<n&&take;k++)for(let dd=0;dd<2;dd++)if(rnd()<fill+.1)b.add(K.rboxGeo(w,h,.07,.003,1),boxM(i),{p:[x+w/2+k*(w+.004),y+.0125+h/2,z+sd*(D/4-.06-dd*.1)],r:[0,(sd>0?0:PI)+(rnd()-.5)*.08,0]});x+=n*(w+.004)+.02}}}
 b.box(L,.03,D*.5,steel,[0,H-.015,0])}
K.def('shop_shelves_full',{label:'Shop shelves',table:'supermarket',items:[2,5]},b=>{gondola(b,2.4,1.78,1.0,.95,[1,-1],'a')});
K.def('shop_shelves_half',{label:'Shop shelves (picked over)',table:'supermarket',items:[1,3]},b=>{gondola(b,2.4,1.78,1.0,.45,[1,-1],'b')});
K.def('shop_shelves_low',{label:'Low shop shelves',table:'supermarket',items:[2,4]},b=>{gondola(b,2.4,1.02,1.0,.85,[1,-1],'c')});
K.def('shop_shelf_wall',{label:'Wall shelf',table:'supermarket',items:[1,4],auto:['convenience','pharmacy','liquor']},b=>{gondola(b,1.8,1.78,.55,.8,[1],'d')});

/* warehouse pallet racking with pallets and boxes */
K.def('pallet_racking',{label:'Pallet racking',table:'warehouse',items:[3,6]},b=>{const L=2.8,H=2.9,D=1.1,up=K.surf('mecha',0xd8641e,{m:.3}),beam=K.surf('mecha',0x1e4a8a,{m:.3}),wood=K.surf('wood',0x9a7a4e);
 for(const x of[-L/2,L/2])for(const z of[-D/2,D/2]){b.box(.08,H,.06,up,[x,H/2,z]);for(let y=.1;y<H;y+=.075)b.box(.02,.03,.004,K.mat(0x1a1a1a,.6),[x,y,z+(z>0?.031:-.031)])}  // uprights with punched slots
 for(const x of[-L/2,L/2])for(let y=.3;y<H;y+=.5)b.box(.03,.03,Math.hypot(D,.45),up,[x,y+.22,0],[Math.atan2(.45,D),0,0]);   // bracing
 for(const y of[.12,1.25,2.38]){for(const z of[-D/2+.03,D/2-.03])b.box(L,.11,.05,beam,[0,y,z]);
  // pallet
  for(const px of[-.66,.66]){b.push([px,y+.055,0]);for(let i=0;i<7;i++)b.box(1.2,.02,.1,wood,[0,.13,-D/2+.1+i*.15]);for(const zz of[-.45,0,.45])b.box(1.2,.09,.1,wood,[0,.075,zz]);b.pop();
   // boxes on it
   const rnd=b.rnd;if(rnd()<.85){const card=K.surf('cardboard',0xb38a58);for(let i=0;i<4;i++){const bw=.5,bh=.35+rnd()*.25;b.rbox(bw,bh,.45,.006,card,[px+(i%2?.27:-.27),y+.2+bh/2,(i<2?.24:-.24)],[0,(rnd()-.5)*.1,0]);
     b.label(bw*.95,bh*.9,boxPrint('rk'+i,i%2?'up':'brand'),[px+(i%2?.27:-.27),y+.2+bh/2,(i<2?.24:-.24)+.226])}}}}
 b.label(.4,.2,K.paint('rack_sign',256,128,(c,W,H,r)=>{c.fillStyle='#f2d03a';c.fillRect(0,0,W,H);c.fillStyle='#111';c.fillRect(0,0,W,16);c.fillRect(0,H-16,W,16);P.text(c,'MAX 1000 KG / LEVEL',W/2,H/2,{size:22,col:'#111',max:W*.9})},{}),[-L/2+.25,.85,D/2+.035]);
 b.col(-L/2-.05,0,-D/2-.04,L/2+.05,H,D/2+.04)});

/* bookshelf */
K.def('bookshelf',{label:'Bookshelf',table:'library',items:[1,3],auto:['library','school','office','house','townhall']},b=>{const W=1.0,H=2.0,D=.34,wood=K.veneer(0x6a4a2c),bk=books;
 b.rbox(.025,H,D,.004,wood,[-W/2+.0125,H/2,0]);b.rbox(.025,H,D,.004,wood,[W/2-.0125,H/2,0]);b.box(W,.012,D,wood,[0,H/2,-D/2+.006]);
 b.rbox(W+.04,.04,D+.03,.01,wood,[0,H-.02,.0]);b.rbox(W,.09,D,.006,wood,[0,.045,.0]);
 const ys=[.09,.5,.9,1.3,1.66];for(const y of ys){b.box(W-.05,.022,D-.012,wood,[0,y,.005]);
  // books as one row of blocks per shelf, varied heights via the texture; slight lean on one end
  const h=ys.indexOf(y)<4?.34:.28;b.label(W-.06,h,bk,[0,y+.011+h/2,D/2-.06]);b.box(W-.06,h,.22,K.mat(0x2a2018,.9),[0,y+.011+h/2,D/2-.172],null,.001)}
 b.box(W-.05,.04,.012,wood,[0,H-.06,D/2-.01]);  // crown rail
 // a few loose objects: a fallen book and a framed photo
 b.box(.16,.03,.22,K.mat(0x6b1d1d,.7),[.25,1.68+.026,.02],[0,.4,0]);b.box(.12,.15,.015,K.mat(0x2a2a2a,.4,.5),[-.3,1.66+.085,.06],[-.15,.2,0])});

/* gun racks */
function rifle(b,len,stockCol){const metal=K.mat(0x1d1e1f,.4,.8),wood=K.veneer(stockCol||0x6a4024,{fig:false,tile:.3});
 b.box(.04,.05,len*.38,wood,[0,0,-len*.3],[.05,0,0],.01);b.box(.032,.04,len*.22,wood,[0,.012,len*.02],null,.008);   // stock + fore-end
 b.box(.03,.05,len*.18,metal,[0,.02,-len*.08],null,.006);b.cyl(.009,.009,len*.48,metal,[0,.025,len*.3],[PI/2,0,0],10);b.box(.016,.03,.02,metal,[0,.05,len*.5],null,.003);  // receiver, barrel, sight
 b.box(.02,.06,.03,metal,[0,-.03,-len*.06],[.3,0,0],.004)}
K.def('gun_rack',{label:'Gun rack',table:'gunshop',items:[1,3],auto:['gunshop']},b=>{const W=1.2,H=1.2,D=.3,wood=K.veneer(0x2e2420);
 b.rbox(W,.06,D,.01,wood,[0,.03,0]);b.rbox(W,.05,.12,.01,wood,[0,1.05,-D/2+.06]);b.box(W,1.12,.02,wood,[0,.6,-D/2+.01]);
 for(let i=0;i<6;i++){const x=-W/2+.1+i*.2;b.box(.04,.1,D*.8,wood,[x-.05,.11,0],null,.006);b.box(.04,.1,D*.8,wood,[x+.05,.11,0],null,.006)}
 // notched top bar
 b.rbox(W,.06,.14,.01,wood,[0,.92,-D/2+.08]);for(let i=0;i<6;i++)b.box(.05,.07,.15,K.mat(0x14100e,.9),[-W/2+.1+i*.2,.93,-D/2+.09]);
 for(let i=0;i<4;i++){b.push([-W/2+.1+i*.2,.62,-.02],[-PI/2+.06,0,0]);rifle(b,1.05,i%2?0x7a4a2a:0x4a2a1a);b.pop()}
 b.label(.5,.1,K.paint('rack_plate',256,52,(c,W,H,r)=>{c.fillStyle='#b08a3a';c.fillRect(0,0,W,H);P.text(c,'NOT FOR SALE',W/2,H/2,{size:22,col:'#2a1a0a',font:"'MFZ Type',serif"})},{m:.8,r:.35}),[0,1.05,-D/2+.121])});
K.def('gun_cabinet',{label:'Gun cabinet',table:'gunshop',items:[2,4],auto:['gunshop','sporting','pawn']},b=>{const W=1.0,H=2.0,D=.45,wood=K.veneer(0x4a3424),gl=K.glass(0xbfd8de,.18);
 b.rbox(W,H,.03,.004,wood,[0,H/2,-D/2+.015]);for(const x of[-W/2+.02,W/2-.02])b.rbox(.04,H,D,.006,wood,[x,H/2,0]);
 b.rbox(W,.1,D,.008,wood,[0,.05,0]);b.rbox(W+.04,.06,D+.03,.01,wood,[0,H-.03,0]);b.rbox(W-.04,.3,D-.02,.006,wood,[0,.25,0]);   // base drawer block
 b.frame(W-.04,.28,.03,wood,[0,.25,D/2-.005]);b.pull(.16,K.mat(0xb08a3a,.35,.9),[0,.26,D/2+.005]);
 // glass doors with frames
 for(const sd of[-1,1]){const x=sd*(W/4-.01);b.frame(W/2-.04,H-.5,.05,wood,[x,1.2,D/2-.01],.03);b.plane(W/2-.12,H-.6,gl,[x,1.2,D/2-.012]);b.knob(K.mat(0xb08a3a,.35,.9),[x-sd*(W/4-.07),1.15,D/2+.005],.012)}
 // rifles standing inside, barrels up
 for(let i=0;i<5;i++){b.push([-W/2+.17+i*.165,1.0,0],[-PI/2,0,0]);rifle(b,1.1,i%2?0x6a3a20:0x8a5a30);b.pop()}
 b.box(W-.06,.06,.2,wood,[0,1.75,-.05]);for(let i=0;i<5;i++)b.box(.04,.07,.21,K.mat(0x14100e,.9),[-W/2+.17+i*.165,1.75,-.04])});
K.def('display_case',{label:'Display case',table:'gunshop',items:[1,3],auto:['gunshop','pawn','sporting','liquor']},b=>{const W=1.8,H=1.0,D=.62,wood=K.paintSteel(0xe8e2d6,{m:0,r:.5}),dark=K.veneer(0x4a3424),gl=K.glass(0xcfe6ee,.2),felt=K.surf('laine',0x2a3a2a);
 b.rbox(W,.62,D,.008,wood,[0,.31,0]);b.frame(W-.06,.5,.04,dark,[0,.33,D/2+.004]);b.rbox(W+.02,.03,D+.02,.006,dark,[0,.635,0]);
 b.box(W-.08,.012,D-.08,felt,[0,.66,0]);
 // glass top box with chrome edges
 const ch=K.chrome(),gh=.34,y0=.65;b.plane(W-.04,gh,gl,[0,y0+gh/2,D/2-.02]);b.plane(W-.04,gh,gl,[0,y0+gh/2,-D/2+.02],[0,PI,0]);b.plane(D-.04,gh,gl,[W/2-.02,y0+gh/2,0],[0,PI/2,0]);b.plane(D-.04,gh,gl,[-W/2+.02,y0+gh/2,0],[0,-PI/2,0]);b.plane(W-.04,D-.04,gl,[0,y0+gh,0],[-PI/2,0,0]);
 for(const x of[-W/2+.02,W/2-.02])for(const z of[-D/2+.02,D/2-.02])b.box(.012,gh,.012,ch,[x,y0+gh/2,z]);for(const z of[-D/2+.02,D/2-.02])b.box(W-.04,.012,.012,ch,[0,y0+gh,z]);for(const x of[-W/2+.02,W/2-.02])b.box(.012,.012,D-.04,ch,[x,y0+gh,0]);
 // pistols + knives on the felt, little price tags
 const m=K.mat(0x1d1e1f,.35,.85);for(let i=0;i<4;i++){const x=-.6+i*.4;b.push([x,.672,-.02],[0,.3*(i%2?1:-1),0]);b.box(.2,.03,.04,m,[0,0,0],null,.006);b.box(.05,.03,.11,K.mat(0x3a2a1e,.6),[-.07,0,.06],[0,.25,0],.006);b.pop();
  b.box(.04,.002,.03,K.mat(0xf4f1e8,.8),[x+.12,.668,.12])}
 b.box(.2,.012,.03,K.chrome(),[.75,.668,-.16],[0,-.4,0])});
})();
