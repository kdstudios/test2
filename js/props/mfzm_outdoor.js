/* MINI FORT ZOMBIE - PROPS 4/4: dumpsters + bodies (front-load dumpsters x3; five searchable bodies and a pile of bodies, made from the
   game's own zombie characters posed lifeless, eyes dark, on pooled blood). Original models + artwork. */
(function(){
'use strict';
const K=window.MFZK,P=K.P,PI=Math.PI,T=THREE;if(!K)return;

/* ===== dumpsters ===== */
const bagM=()=>K.mat(0x121314,.35,0);
function bag(b,p,s,r){b.add(K.sphGeo(.25,14,10),bagM(),{p,s,r});b.cyl(.03,.05,.08,bagM(),[p[0],p[1]+s[1]*.25,p[2]],[0,0,(r&&r[2])||0],8)}
function dumpster(b,col,key,o){o=o||{};const W=1.9,D=1.1,H=1.2,body=K.surf('mecha',col,{m:.45}),dark=K.mat(0x1c1d1e,.5,.6),lid=K.mat(0x1e2022,.55);
 // sloped-front bin as an extruded side profile
 b.extrude([[-D/2,.12],[D/2-.12,.12],[D/2,.4],[D/2,H],[-D/2,H],[-D/2,.12]],W,body,[0,0,0],[0,PI/2,0],.015);
 b.box(W+.03,.06,D+.03,dark,[0,H-.03,0]);                                                 // rolled top rim
 for(const x of[-W/2-.03,W/2+.03]){b.box(.05,.16,.5,dark,[x,.6,0]);b.box(.07,.04,.3,dark,[x,.7,0])}                      // fork pockets
 for(const x of[-W*.38,-W*.13,W*.13,W*.38])b.box(.05,H-.2,.035,body,[x,(H+.12)/2,-D/2-.015]);                          // back ribs
 b.box(W,.04,.04,dark,[0,.42,D/2+.01]);b.box(W,.04,.04,dark,[0,.95,D/2+.01]);
 for(const x of[-W/2+.15,W/2-.15])for(const z of[-D/2+.15,D/2-.25]){b.box(.08,.06,.08,dark,[x,.09,z]);b.cyl(.06,.06,.05,K.rubber(),[x,.06,z],[0,0,PI/2],16);b.cyl(.02,.02,.06,K.chrome(),[x,.06,z],[0,0,PI/2],8)}
 // two plastic lids: one shut, one thrown open
 b.rbox(W/2-.02,.05,D+.08,.02,lid,[-W/4,H+.03,0]);for(let i=0;i<3;i++)b.box(W/2-.1,.015,.04,lid,[-W/4,H+.06,-.3+i*.3]);
 if(o.open){b.push([W/4,H+.02,-D/2-.03],[-1.9,0,0]);b.rbox(W/2-.02,.05,D+.08,.02,lid,[0,0,D/2+.04]);b.pop()}else b.rbox(W/2-.02,.05,D+.08,.02,lid,[W/4,H+.03,0]);
 b.cyl(.015,.015,W+.04,dark,[0,H+.03,-D/2-.03],[0,0,PI/2],10);
 b.label(1.1,.5,K.paint('dump_'+key,768,350,(c,W2,H2,r)=>{c.clearRect(0,0,W2,H2);P.stencil(c,o.co||'CASCADE WASTE',W2/2,H2*.24,70,'#f4f1e8',r,{max:W2*.94});P.stencil(c,'555-0199',W2/2,H2*.52,60,'#f4f1e8',r);
  c.fillStyle='#f4f1e8';c.font="28px 'MFZ Head',sans-serif";c.textAlign='center';c.fillText('NO HOT ASHES  •  NO PAINT  •  NO TIRES',W2/2,H2*.78);P.rust(c,W2,H2,r,30)},{alpha:true,r:.7}),[0,.75,D/2+.012]);
 b.label(1.8,1.0,K.paint('dump_wear',768,420,(c,W2,H2,r)=>{c.clearRect(0,0,W2,H2);P.rust(c,W2,H2,r,90);P.scratches(c,W2,H2,r,150,'rgba(220,220,210,.35)');
  c.fillStyle='rgba(40,30,20,.35)';for(let i=0;i<20;i++){c.fillRect(r()*W2,H2*.6+r()*H2*.4,2+r()*6,20+r()*60)}
  c.save();c.translate(W2*.7,H2*.3);c.rotate(-.1);P.text(c,'RIP MARCO',0,0,{size:48,col:'rgba(230,70,180,.85)',font:"'MFZ Type',serif"});c.restore()},{alpha:true,r:.8}),[0,.62,D/2+.013]);
 b.col(-W/2-.06,0,-D/2-.05,W/2+.06,H+.08,D/2+.05)}
K.def('dumpster_green',{label:'Dumpster',table:'house',items:[1,3]},b=>dumpster(b,0x2f5a35,'g'));
K.def('dumpster_blue',{label:'Dumpster',table:'house',items:[1,3]},b=>dumpster(b,0x234a7a,'b',{co:'METRO DISPOSAL',open:true}));
K.def('dumpster_full',{label:'Overflowing dumpster',table:'house',items:[2,4]},b=>{dumpster(b,0x3a4a3a,'f',{open:true});const rnd=b.rnd;
 for(let i=0;i<9;i++)bag(b,[(rnd()-.5)*1.6,1.15+rnd()*.35,(rnd()-.5)*.8],[1+rnd()*.3,.8+rnd()*.3,1+rnd()*.3],[rnd(),rnd()*3,rnd()*.5]);
 bag(b,[-.6,.22,.85],[1.1,.9,1.0],[.2,1,0]);bag(b,[.3,.2,.9],[1,.8,1.2],[0,.4,.3]);
 b.box(1.4,.025,.12,K.surf('boards',0x7a5a3a),[.1,1.5,.1],[.3,.3,.4]);b.tor(.24,.09,K.rubber(),[-.4,1.55,-.2],[1.2,.2,0],null,24);   // plank + old tyre
 b.box(.4,.3,.3,K.surf('cardboard',0xb38a58),[.6,1.45,-.15],[.4,.5,.2]);for(let i=0;i<6;i++)b.box(.12,.01,.12,K.mat([0xf4f1e8,0xc8302a,0x2a6ad8][i%3],.7),[-.8+rnd()*1.6,.005,.7+rnd()*.5],[0,rnd()*3,0])});

/* ===== bodies ===== */
const bloodM=K.paint('bloodpool',512,512,(c,W,H,r)=>{c.clearRect(0,0,W,H);for(let i=0;i<9;i++){const x=W/2+(r()-.5)*W*.35,y=H/2+(r()-.5)*H*.35,rr=60+r()*110;const g=c.createRadialGradient(x,y,0,x,y,rr);
 g.addColorStop(0,'rgba(60,4,3,.92)');g.addColorStop(.7,'rgba(80,8,6,.8)');g.addColorStop(1,'rgba(80,8,6,0)');c.fillStyle=g;c.beginPath();c.ellipse(x,y,rr,rr*(.6+r()*.4),r()*PI,0,PI*2);c.fill()}
 for(let i=0;i<40;i++){c.fillStyle='rgba(70,6,4,'+(.5+r()*.4)+')';c.beginPath();c.arc(W/2+(r()-.5)*W*.9,H/2+(r()-.5)*H*.9,2+r()*7,0,PI*2);c.fill()}},{alpha:true,r:.15,m:.1});
function body(style,shirt){const g=new T.Group(),o={zombie:true,style};const f0=window.FZS;window.FZS={style,shirt};let P0=null;
 try{P0=makeHuman(o,g)}catch(e){console.warn('[mfzprops] body',e)}finally{window.FZS=f0}
 // dead: no glowing eyes, no halo
 const kill=[];g.traverse(n=>{if((n.isSprite&&n.userData.eye)||(n.isMesh&&n.material&&n.material.isMeshBasicMaterial&&n.material.color&&n.material.color.getHex()===0xffe03a))kill.push(n)});kill.forEach(n=>n.parent&&n.parent.remove(n));
 g.traverse(n=>{if(n.isMesh){n.castShadow=n.receiveShadow=true}});g.userData.P=P0;return g}
const pose={
 // on the back, arms flung out
 back(g){const P=g.userData.P;g.rotation.set(-PI/2+.04,0,0);g.position.y=.13;if(!P)return;P.body.rotation.set(0,0,0);P.armL.rotation.set(-.2,0,-1.25);P.armR.rotation.set(.3,0,1.0);P.elL.rotation.x=-.5;P.elR.rotation.x=-.2;P.legL.rotation.set(0,0,-.2);P.legR.rotation.set(.15,0,.12);P.head.rotation.set(.1,.9,0)},
 // face down, one arm under, one reaching
 face(g){const P=g.userData.P;g.rotation.set(PI/2-.04,0,0);g.position.y=.13;if(!P)return;P.body.rotation.set(0,0,0);P.armL.rotation.set(-2.9,0,-.2);P.armR.rotation.set(-.1,0,.25);P.elL.rotation.x=-.3;P.elR.rotation.x=-.9;P.legL.rotation.set(0,0,-.15);P.legR.rotation.set(-.4,0,.1);P.head.rotation.set(0,-1.2,0)},
 // slumped sitting against something, legs out, head on the chest
 sit(g,lean){const P=g.userData.P;g.rotation.set(0,0,0);if(!P)return;const hip=P.legL.position.y;g.position.y=-hip+.12;P.legL.rotation.set(-PI/2+.05,0,-.18);P.legR.rotation.set(-PI/2+.2,0,.12);
  P.body.rotation.set(-.32-(lean||0),0,.12);P.head.rotation.set(.85,.3,.35);P.armL.rotation.set(.05,0,-.35);P.armR.rotation.set(-.5,0,.2);P.elL.rotation.x=-.2;P.elR.rotation.x=-1.0},
 // curled on the side
 side(g){const P=g.userData.P;g.rotation.set(0,0,PI/2-.05);g.position.y=.17;if(!P)return;P.body.rotation.set(.5,0,0);P.legL.rotation.set(-1.1,0,0);P.legR.rotation.set(-.7,0,0);P.armL.rotation.set(-1.2,0,0);P.armR.rotation.set(-1.4,0,.1);P.elL.rotation.x=-1.3;P.elR.rotation.x=-1.1;P.head.rotation.set(.6,0,0)}};
function corpse(b,style,shirt,kind,o){o=o||{};const g=body(style,shirt);pose[kind](g,o.lean);if(o.ry)g.rotation.y+=o.ry;const wrap=new T.Group();wrap.add(g);if(o.p)wrap.position.set(...o.p);if(o.rot)wrap.rotation.y=o.rot;b.keep(wrap);
 if(!o.noBlood)b.add(K.planeGeo(1.4,1.4),bloodM,{p:[(o.p?o.p[0]:0)+(o.bx||0),.006,(o.p?o.p[2]:0)+(o.bz||0)],r:[-PI/2,0,b.rnd()*6]})}
// sitting bodies lean on a plank/wall stub we model too (so they make sense anywhere)
function backboard(b,w){const wood=K.surf('boards',0x6a5a48);b.box(w,1.0,.06,wood,[0,.5,-.32]);for(let i=0;i<4;i++)b.box(w,.012,.065,K.mat(0x3a2e24,.9),[0,.12+i*.25,-.32]);b.box(.08,1.05,.08,wood,[-w/2+.04,.52,-.36]);b.box(.08,1.05,.08,wood,[w/2-.04,.52,-.36])}
K.def('body_sitting',{label:'Body',table:'house',items:[1,3]},b=>{backboard(b,1.0);corpse(b,'business',null,'sit',{p:[0,0,-.12],bz:.25});b.col(-.5,0,-.4,.5,1.0,.6)});
K.def('body_sitting_plaid',{label:'Body',table:'house',items:[1,3]},b=>{backboard(b,1.0);corpse(b,'plaid_jacket',null,'sit',{p:[0,0,-.12],lean:.12,bz:.25});b.col(-.5,0,-.4,.5,1.0,.6)});
K.def('body_facedown',{label:'Body',table:'house',items:[1,3]},b=>{corpse(b,'white_shirt',null,'face',{bz:.3});b.col(-.5,0,-.2,.5,.3,1.9)});
K.def('body_woman',{label:'Body',table:'house',items:[1,3]},b=>{corpse(b,'femalesundress',null,'back',{bz:-.4});b.col(-.6,0,-1.8,.6,.3,.2)});
K.def('body_police',{label:'Police officer’s body',table:'gunshop',items:[1,3]},b=>{corpse(b,'cop',null,'side',{bz:.1});
 // his sidearm and hat lie beside him, a radio on the ground
 b.box(.18,.03,.035,K.mat(0x1d1e1f,.35,.85),[.55,.016,.4],[0,.7,0],.005);b.box(.04,.03,.09,K.mat(0x1d1e1f,.4,.6),[.5,.016,.45],[0,.7,0],.006);
 b.cyl(.15,.16,.015,K.mat(0x1a2440,.6),[-.6,.008,.6],null,24);b.cyl(.1,.11,.08,K.mat(0x1a2440,.6),[-.6,.05,.6],null,20);b.box(.06,.002,.03,K.mat(0xc8a040,.3,.9),[-.6,.07,.5],[-.6,0,0]);
 b.rbox(.06,.16,.035,.006,K.blackPlastic(),[.1,.02,.75],[PI/2,0,.4]);b.col(-.4,0,-.9,.4,.45,.9)});
K.def('body_pile',{label:'Pile of bodies',table:'house',items:[3,7]},b=>{const rnd=b.rnd;
 // a heap of rubble and bags under, bodies thrown on top in every direction
 for(let i=0;i<10;i++)bag(b,[(rnd()-.5)*1.8,.18,(rnd()-.5)*1.4],[1.2,.7,1.1],[rnd()*.4,rnd()*3,rnd()*.4]);
 for(let i=0;i<6;i++)b.box(.4+rnd()*.5,.2+rnd()*.2,.3+rnd()*.4,K.surf('concrete',0x7a746a),[(rnd()-.5)*2,.1,(rnd()-.5)*1.6],[rnd()*.3,rnd()*3,rnd()*.3],.04);
 const styles=['business','cop','femaletanktop','plaid_jacket','white_shirt','trucker','generic'],kinds=['back','face','side','back','face','side','back'];
 for(let i=0;i<7;i++)corpse(b,styles[i],null,kinds[i],{p:[(rnd()-.5)*1.3,.28+(i>3?.25:0),(rnd()-.5)*1.0],rot:rnd()*PI*2,noBlood:i>1});
 b.add(K.planeGeo(2.6,2.6),bloodM,{p:[0,.005,0],r:[-PI/2,0,0]});b.col(-1.2,0,-1.0,1.2,.75,1.0)});
})();
