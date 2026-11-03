/* ==========================================================================================================
   MINI FORT ZOMBIE - DETAILED MELEE WEAPONS (v062)
   Replaces the icon-extruded melee models (core modelFor) with true-scale procedural models in the Modern gun style
   (lathed / extruded / tubed parts, PBR steel, painted metal, wood with grain, rubber, leather, brass; gun environment reflections).

   ORIENTATION CONTRACT (kept from MFZ 047-061, so every existing pose keeps working):
     - origin = the centre of the main hand on the handle (the grip point)
     - the weapon's long axis is +Y, the striking end / tip up (+Y)
     - the flat of a blade / axe head / shovel lies in the XY plane, thickness along Z
     - the cutting edge / striking face points to -X
   First person (core vmEnsure / animVM): the weapon group sits at [.30,-.32,-.50] in camera space, rotation x -.55, z -.12, scale .85,
   and the model inside is turned y -1.35 (so -X, the edge, faces forward / away from the player); swings move it along -Z.
   Zombies / survivors (skills.js fzHold, core survivor holds): the model hangs from the forearm at y = hand, rotated (PI/2+.45, PI/2, 0) XYZ
   (v069: the PI/2 spin about the handle turns the edge (-X) to face forward / down the swing instead of sideways).
   ========================================================================================================== */
(function(){
'use strict';
const T=THREE,V2=(x,y)=>new T.Vector2(x,y),V3=(x,y,z)=>new T.Vector3(x,y,z),PI=Math.PI;
/* ---------------- materials (shared; zombies clone them for hit flashes) ---------------- */
let ENV=null;
function env(){if(ENV)return ENV;try{if(window.RGX&&RGX.vm&&RGX.vm.env)ENV=RGX.vm.env}catch(e){}return ENV}   // the gun viewmodel's PMREM (made on the first frame)
function grainTex(base,dark,w=64,h=256,n=70){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.fillStyle=base;c.fillRect(0,0,w,h);
 for(let i=0;i<n;i++){const x=Math.random()*w,a=Math.random()*.25+.05;c.strokeStyle=dark;c.globalAlpha=a;c.lineWidth=Math.random()*1.6+.4;c.beginPath();c.moveTo(x,0);
  for(let y=0;y<=h;y+=16)c.lineTo(x+Math.sin(y*.05+i)*1.5,y);c.stroke()}c.globalAlpha=1;const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
const MATS={};
function M(k){if(MATS[k])return MATS[k];const S=(o)=>new T.MeshStandardMaterial(Object.assign({envMapIntensity:1},o));let m;
 switch(k){
  case 'steel':m=S({color:0xccd2d8,metalness:.38,roughness:.4,envMapIntensity:1.0});break;
  case 'edge':m=S({color:0xd8dde2,metalness:.75,roughness:.3,envMapIntensity:1.15});break;
  case 'dark':m=S({color:0x2c2f33,metalness:.75,roughness:.48});break;
  case 'iron':m=S({color:0x23201e,metalness:.7,roughness:.6});break;
  case 'brass':m=S({color:0xb58f3e,metalness:1,roughness:.3});break;
  case 'red':m=S({color:0xb0170f,metalness:.25,roughness:.42});break;
  case 'green':m=S({color:0x2f4a2c,metalness:.3,roughness:.5});break;
  case 'yellow':m=S({color:0xe0b41a,metalness:.05,roughness:.38});break;
  case 'rubber':m=S({color:0x151515,metalness:0,roughness:.92});break;
  case 'tape':m=S({color:0x1c1c1e,metalness:0,roughness:.75});break;
  case 'poly':m=S({color:0x1d1e20,metalness:.05,roughness:.62});break;
  case 'leather':m=S({color:0x5a3a22,metalness:0,roughness:.72});break;
  case 'ito':m=S({color:0x1a1c2c,metalness:0,roughness:.8});break;
  case 'same':m=S({color:0xe6e2d4,metalness:0,roughness:.6});break;
  case 'ash':m=S({color:0xffffff,map:grainTex('#d4ab6e','#7a5530'),metalness:0,roughness:.55});break;
  case 'hickory':m=S({color:0xffffff,map:grainTex('#a8763e','#4a2c12'),metalness:0,roughness:.6});break;
  case 'oak':m=S({color:0xffffff,map:grainTex('#8a5a32','#3a2410'),metalness:0,roughness:.62});break;
 }
 m.envMap=null;m.envMapIntensity=0;m.metalness=Math.min(m.metalness,.12);m.roughness=Math.max(m.roughness,k==='edge'?.55:.62);if(k==='edge')m.color.set(0xb8bcc0);if(k==='steel')m.color.set(0x9ea3a8);   // v065: matte, no reflections (the shine stood out)
 return MATS[k]=m}
/* ---------------- geometry helpers ---------------- */
function add(g,geo,mat,p,r,s){const m=new T.Mesh(geo,typeof mat==='string'?M(mat):mat);if(p)m.position.set(p[0],p[1],p[2]);if(r)m.rotation.set(r[0],r[1],r[2]);if(s)m.scale.set(s[0],s[1],s[2]);m.castShadow=true;g.add(m);return m}
const lathe=(pts,seg=20)=>new T.LatheGeometry(pts.map(p=>V2(p[0],p[1])),seg);
function ext(pts,depth,bev,curve){const sh=new T.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)sh.lineTo(pts[i][0],pts[i][1]);sh.closePath();
 const b=bev||0,g=new T.ExtrudeGeometry(sh,{depth:Math.max(.0002,depth-2*b),bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:curve||6,steps:1});g.translate(0,0,-(depth-2*b)/2);g.computeVertexNormals();return g}
function tube(pts,r,radial=8,seg=40,closed=false){return new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2]||0))),seg,r,radial,closed)}
const cyl=(r0,r1,h,s=16)=>new T.CylinderGeometry(r0,r1,h,s);
const box=(w,h,d)=>new T.BoxGeometry(w,h,d);
const ball=(r,s=14)=>new T.SphereGeometry(r,s,Math.max(6,s>>1));
const tor=(R,t,arc=PI*2,rs=8,ts=24)=>new T.TorusGeometry(R,t,rs,ts,arc);
/* polyline along a param function, used for blade outlines */
const samp=(f,a,b,n)=>{const o=[];for(let i=0;i<=n;i++)o.push(f(a+(b-a)*i/n));return o};
/* ---------------- models ---------------- */
const B={};
B.baseball_bat=g=>{
 const P=[[.0005,-.088],[.02,-.086],[.025,-.08],[.024,-.071],[.016,-.064],[.0128,-.055],[.0128,.12],[.0138,.24],[.0175,.36],[.024,.46],[.029,.55],[.032,.64],[.0335,.72],[.033,.752],[.026,.758],[.016,.756],[.0005,.75]];
 add(g,lathe(P,24),'ash');
 add(g,lathe([[.0141,-.058],[.0141,.17],[.0135,.175]],20),'tape');
 for(let i=0;i<8;i++)add(g,tor(.0142,.0012,PI*2,4,20),'rubber',[0,-.05+i*.028,0],[PI/2+.28,0,0]);
 add(g,cyl(.02,.02,.004,20),'tape',[0,-.083,0]);
 add(g,box(.0005,.05,.018),'iron',[-.0295,.53,0],[0,0,.07]);                                            // burned-in brand mark
};
B.crowbar=g=>{
 const pts=[[0,-.13],[0,.2],[0,.5],[-.006,.55],[-.03,.59],[-.065,.603],[-.098,.588],[-.115,.556],[-.118,.525]];
 add(g,tube(pts,.0105,6,64),'red');
 add(g,ext([[-.0035,0],[.0035,0],[.008,-.045],[-.008,-.045]],.017,.002),'steel',[-.118,.528,0],[0,0,.15]);   // claw neck
 for(const s of[-1,1])add(g,ext([[-.003,0],[.003,0],[.0015,-.03],[-.0015,-.03]],.006,.0008),'steel',[-.119+s*.0,.484,s*.0055],[0,0,.15]);
 add(g,ext([[-.008,.0],[.008,.0],[.011,-.05],[-.011,-.058]],.012,.002),'steel',[0,-.13,0],[0,0,-.22]);       // chisel end
 for(let i=0;i<3;i++)add(g,tor(.0108,.0009,PI*2,4,6),'dark',[0,.05+i*.02,0],[PI/2,0,0]);                      // knurl rings
};
B.machete=g=>{
 const spine=y=>.014+.003*Math.sin((y-.08)/.44*PI),edge=y=>-.028-.022*Math.pow((y-.08)/.4,1.4);
 const out=[[.013,.078]].concat(samp(y=>[spine(y),y],.09,.44,14)).concat([[.012,.49],[.0,.515],[-.018,.52],[-.036,.508],[-.048,.485]]).concat(samp(y=>[edge(y),y],.47,.09,16)).concat([[-.026,.078]]);
 add(g,ext(out,.0024,.0007,12),'steel');
 const eo=samp(y=>[edge(y),y],.1,.47,16),ei=samp(y=>[edge(y)+.009,y],.47,.1,16);add(g,ext(eo.concat([[-.036,.508],[-.026,.5]]).concat(ei),.003,0),'edge');
 const H=[[-.016,-.08],[.012,-.08],[.017,-.065],[.015,-.03],[.018,.0],[.015,.03],[.017,.06],[.019,.074],[-.03,.074],[-.026,.06],[-.022,.04],[-.026,.02],[-.022,0],[-.026,-.02],[-.022,-.04],[-.02,-.065]];
 add(g,ext(H,.024,.007),'poly');
 add(g,ext([[-.034,.072],[.022,.072],[.022,.082],[-.034,.082]],.026,.003),'poly');                             // guard lip
 for(const y of[-.045,0,.045])add(g,cyl(.0045,.0045,.026,10),'brass',[-.004,y,0],[PI/2,0,0]);
 add(g,tor(.007,.002),'dark',[-.002,-.07,0],[0,0,0]);
};
B.katana=g=>{
 const L=.7,y0=.165,sori=.024,cx=t=>sori*t*t;                                                              // spine curves back (+X)
 const wid=t=>.031-.006*t,tipT=.92;
 const sp=samp(t=>[cx(t)+.004,y0+L*t],0,tipT,24),ed=samp(t=>[cx(t)+.004-wid(t),y0+L*t],tipT,0,24);
 const kissaki=[[cx(.96)+.003,y0+L*.96],[cx(1)-.004,y0+L],[cx(.985)-.016,y0+L*.985],[cx(tipT)-.022,y0+L*tipT+.004]];
 add(g,ext(sp.concat(kissaki).concat(ed),.0058,.0016,10),'steel');
 const ham=samp(t=>[cx(t)+.004-wid(t)*.55+.003*Math.sin(t*40),y0+L*t],0,tipT,48);
 add(g,ext(ed.slice().reverse().concat([[cx(tipT)-.022,y0+L*tipT+.004],[cx(.985)-.016,y0+L*.985]]).concat(ham.slice().reverse()),.0064,0,8),'edge');   // hamon
 add(g,ext([[-.03,.135],[.008,.135],[.007,.168],[-.026,.168]],.011,.002),'brass');                              // habaki
 add(g,cyl(.04,.04,.007,28),'iron',[-.008,.128,0],[0,0,0],[1.08,1,.9]);                                          // tsuba
 add(g,tor(.04,.0025,PI*2,6,28),'brass',[-.008,.128,0],[PI/2,0,0],[1.08,.9,1]);
 for(const a of[0,PI/2,PI,PI*1.5])add(g,cyl(.005,.005,.008,10),'dark',[-.008+Math.cos(a)*.024,.128,Math.sin(a)*.02]);
 add(g,cyl(.019,.019,.014,20),'brass',[-.008,.114,0],[0,0,0],[1.1,1,.85]);                                      // fuchi
 add(g,cyl(.0165,.0175,.24,18),'same',[-.008,-.012,0],[0,0,0],[1.12,1,.82]);                                    // tsuka core (ray skin)
 for(let i=0;i<8;i++){const y=-.115+i*.029;for(const z of[-.0146,.0146])for(const s of[-1,1])add(g,box(.03,.0075,.003),'ito',[-.008,y,z],[0,0,s*.62])}
 add(g,cyl(.0185,.017,.02,18),'iron',[-.008,-.142,0],[0,0,0],[1.12,1,.85]);                                     // kashira
 for(const s of[-1,1])add(g,box(.012,.02,.003),'brass',[-.008,.0,s*.0155]);                                     // menuki
};
B.broadsword=g=>{
 const y0=.105,L=.79,w=t=>.026-.007*t;
 const R=samp(t=>[w(t),y0+L*t],0,.9,10),Lf=samp(t=>[-w(t),y0+L*t],.9,0,10);
 add(g,ext(R.concat([[0,y0+L]]).concat(Lf),.0058,.0014),'steel');
 add(g,ext([[-.0055,y0+.03],[.0055,y0+.03],[.004,y0+L*.62],[0,y0+L*.66],[-.004,y0+L*.62]],.0064,0),'dark');    // fuller
 for(const s of[-1,1]){const e=samp(t=>[s*w(t),y0+L*t],.02,.9,10),i=samp(t=>[s*(w(t)-.007),y0+L*t],.9,.02,10);add(g,ext(e.concat([[0,y0+L]]).concat(i),.0062,0),'edge')}
 add(g,box(.03,.03,.012),'steel',[0,.098,0]);                                                                   // ricasso block
 add(g,tube([[-.105,.11],[-.09,.098],[-.03,.09],[.03,.09],[.09,.098],[.105,.11]],.0085,10,30),'dark');            // crossguard
 for(const s of[-1,1])add(g,ball(.012,12),'dark',[s*.108,.113,0]);
 add(g,lathe([[.0155,-.085],[.017,-.06],[.0165,0],[.017,.06],[.0155,.083]],18),'leather');
 for(let i=0;i<10;i++)add(g,tor(.0168,.0011,PI*2,4,18),'brass',[0,-.07+i*.016,0],[PI/2,0,0]);
 add(g,cyl(.028,.028,.018,24),'dark',[0,-.103,0],[0,0,PI/2],[1,1,1]);                                           // wheel pommel
 add(g,cyl(.012,.012,.022,14),'brass',[0,-.103,0],[0,0,PI/2]);
};
B.fire_axe=g=>{
 add(g,lathe([[.001,-.265],[.021,-.262],[.023,-.24],[.018,-.2],[.0165,.1],[.016,.45],[.015,.62],[.001,.625]],20),'yellow',null,null,[1,1,.72]);
 add(g,lathe([[.0185,-.255],[.0185,.03],[.0175,.034]],18),'rubber',null,null,[1.04,1,.76]);
 for(let i=0;i<9;i++)add(g,tor(.0189,.0016,PI*2,4,16),'rubber',[0,-.23+i*.028,0],[PI/2,0,0],[1.04,.76,1]);
 const head=[[.02,.5],[.02,.635],[-.02,.64],[-.06,.655],[-.11,.69],[-.155,.71],[-.172,.66],[-.176,.6],[-.168,.54],[-.15,.5],[-.11,.515],[-.06,.53],[-.02,.51]];
 add(g,ext(head,.024,.004),'red',[0,0,0]);
 const bit=[[-.155,.71],[-.172,.66],[-.176,.6],[-.168,.54],[-.15,.5],[-.135,.507],[-.15,.545],[-.157,.6],[-.153,.655],[-.14,.698]];
 add(g,ext(bit,.026,0),'edge');
 add(g,ext([[.02,.545],[.02,.6],[.075,.585],[.135,.575],[.075,.565]],.02,.003),'red');                           // pick
 add(g,ext([[.11,.578],[.135,.575],[.11,.571]],.021,0),'edge');
 add(g,cyl(.019,.019,.004,16),'dark',[0,.641,0],[0,0,0],[1,1,.7]);                                               // eye wedge
};
B.shovel=g=>{
 add(g,lathe([[.001,-.36],[.017,-.36],[.0175,.5],[.016,.56]],18),'ash');
 add(g,lathe([[.0172,.5],[.019,.52],[.024,.64],[.03,.68],[.001,.69]],18),'dark');                                // socket
 for(let i=0;i<2;i++)add(g,cyl(.0035,.0035,.05,8),'steel',[0,.54+i*.04,0],[PI/2,0,0]);
 const out=[[-.115,.68],[.115,.68],[.118,.75],[.11,.84],[.085,.92],[.045,.975],[0,.995],[-.045,.975],[-.085,.92],[-.11,.84],[-.118,.75]];
 const geo=ext(out,.0026,.0006,10),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,p.getZ(i)-4.2*x*x+.12*(y-.68)*(y-.68))}geo.computeVertexNormals();
 add(g,geo,'green');
 const tip=[[-.06,.945],[0,.995],[.06,.945],[.045,.96],[0,.982],[-.045,.96]],tg=ext(tip,.003,0),tp=tg.attributes.position;for(let i=0;i<tp.count;i++){const x=tp.getX(i),y=tp.getY(i);tp.setZ(i,tp.getZ(i)-4.2*x*x+.12*(y-.68)*(y-.68))}tg.computeVertexNormals();
 add(g,tg,'steel');
 for(const s of[-1,1])add(g,box(.1,.006,.024),'green',[s*.062,.684,-.018],[.3,0,0]);                            // treads
 add(g,tube([[0,-.36],[-.04,-.39],[-.05,-.46],[0,-.475],[.05,-.46],[.04,-.39],[0,-.36]],.008,8,40),'dark');       // D-grip
 add(g,cyl(.012,.012,.08,14),'ash',[0,-.455,0],[0,0,PI/2]);
};
B.pitchfork=g=>{
 add(g,lathe([[.001,-.46],[.0175,-.455],[.0175,.6],[.016,.64]],18),'hickory');
 add(g,lathe([[.0168,.6],[.0185,.62],[.021,.7],[.012,.725],[.001,.73]],16),'dark');
 add(g,tube([[-.085,.77],[-.055,.738],[0,.728],[.055,.738],[.085,.77]],.0075,8,30),'dark');
 for(const x of[-.085,-.028,.028,.085]){const sx=x*.45;add(g,tube([[x,.765],[x+sx*.25,.85],[x+sx*.3,.95],[x+sx*.3,1.04]].map(p=>[p[0],p[1],-(p[1]-.76)*.12]),.0052,7,24),'steel');
  add(g,cyl(.0052,.0004,.04,7),'steel',[x+sx*.3,1.06,-.036],[-.12,0,0])}
 add(g,tube([[0,.728],[0,.73]],.0001),'dark');
};
B.sickle=g=>{
 add(g,lathe([[.001,-.075],[.016,-.073],[.017,-.06],[.0145,-.02],[.0155,.04],[.0175,.07],[.001,.08]],18),'oak');
 add(g,lathe([[.0165,.066],[.0172,.07],[.0172,.09],[.012,.096]],16),'dark');
 const c=[-.105,.14],a0=-.46,a1=a0+3.25,R=.16,w=a=>.03*Math.pow(1-(a-a0)/(a1-a0),.8);
 const out=samp(a=>[c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R],a0,a1,30),inn=samp(a=>[c[0]+Math.cos(a)*(R-w(a)),c[1]+Math.sin(a)*(R-w(a))],a1-.02,a0,30);
 add(g,ext(out.concat(inn),.0024,.0006,10),'steel');
 const e1=samp(a=>[c[0]+Math.cos(a)*(R-w(a)),c[1]+Math.sin(a)*(R-w(a))],a0+.1,a1-.04,28),e2=samp(a=>[c[0]+Math.cos(a)*(R-w(a)+.006),c[1]+Math.sin(a)*(R-w(a)+.006)],a1-.04,a0+.1,28);
 add(g,ext(e1.concat(e2),.0029,0),'edge');
 add(g,ext([[-.006,.084],[.012,.084],[.008,.12],[-.004,.12]],.008,.002),'steel');                                // tang neck
};
/* ---------------- hook into modelFor (cloneModel / viewmodel / zombie holds use it) ---------------- */
const CACHE={};
function detailed(id){if(CACHE[id])return CACHE[id];const f=B[id];if(!f)return null;const g=new T.Group();f(g);g.userData.rgMelee=id;
 const bb=new T.Box3().setFromObject(g),T0={g,mz:[0,bb.max.y,0],len:bb.max.y-bb.min.y,Wm:bb.max.x-bb.min.x,Hm:bb.max.y-bb.min.y,top:bb.max.y,detailed:true};return CACHE[id]=T0}
const _mf=window.modelFor;
window.modelFor=function(id){const d=typeof WDEF!=='undefined'&&WDEF[id];if(d&&d.type==='melee'&&B[id]&&(!window.RGFX||RGFX.s.melee!==0)){try{const t=detailed(id);if(t)return t}catch(e){console.warn('[melee] model failed',id,e)}}return _mf.apply(this,arguments)};
/* first person: the core pose keeps the edge forward (model y -1.35); turn the flat of the weapon ~25 deg more toward the eye so the blade reads
   instead of showing only its spine (view model only; zombies / survivors keep the core orientation) */
const _av=window.animVM;
window.animVM=function(dt){const r=_av.apply(this,arguments);try{const v=VM.cur;if(v&&v.m&&v.m.userData.rgMelee&&v.o.visible)v.m.rotation.y=-.92}catch(e){}return r};
/* metals pick up the gun environment once it exists (first gun drawn) */
/* v065: no environment reflections on melee weapons */
window.RGMELEE={B,M,detailed,CACHE};
console.log('[melee] detailed melee models ready ('+Object.keys(B).length+')');
})();
