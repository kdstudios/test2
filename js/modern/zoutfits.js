/* ==========================================================================================================
   MINI FORT ZOMBIE - ZOMBIE OUTFITS (v060)
   Stereotyped looks for the Fort Zombie styles on the modular Modern bodies (zbody.js). Each outfit has:
     col(pal, style) -> per-vertex colour rule in MODEL space (feet at y 0, +z forward, x<0 = the zombie's L side); null = default region colour
     acc(ctx)        -> cosmetic pieces parented to the body part they sit on (hat on the head, pads on the torso, bands on the forearms),
                        so they come off with that part and travel with it when a medic grafts it onto another body (lego rule)
     camo            -> the soldier wears Modern's camo atlas + Modern's own helmet and plate carrier
   Rough body landmarks (m): shoulders 1.405, chest 1.25-1.35, belt 0.98-1.03, crotch 0.85, knee 0.50, shoe top 0.15; elbow 1.12, wrist 0.86.
   Head pieces are in head-pivot space (neck at 0, crown at y 0.305, face front at z 0.128).
   ========================================================================================================== */
(function(){
'use strict';
if(!window.RZ){console.warn('[outfits] zbody missing');return}
const T=THREE,C=h=>h instanceof T.Color?h:new T.Color(h),PK=a=>a[Math.floor(Math.random()*a.length)],PI=Math.PI,V2=(x,y)=>new T.Vector2(x,y);
const inB=(v,a,b)=>v>=a&&v<=b,fr=v=>v-Math.floor(v);
const H={cy:.19,cz:.018,brow:.228,top:.305,mouth:.098};                 // head landmarks (head-pivot space)
/* ---------------- accessory builder: primitives merged into one vertex-coloured mesh using the zombie's material ---------------- */
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_v=new T.Vector3(),_s=new T.Vector3();
function build(list){
 const gs=[];for(const it of list){const [geo,c,p,r,s]=it;const g=geo.index?geo.toNonIndexed():geo.clone();
  _m.compose(_v.set(...(p||[0,0,0])),_q.setFromEuler(_e.set(...(r||[0,0,0]))),_s.set(...(s||[1,1,1])));g.applyMatrix4(_m);gs.push([g,c])}
 let n=0;for(const [g] of gs)n+=g.attributes.position.count;
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
 for(const [g,c] of gs){const P=g.attributes.position,N=g.attributes.normal,fn=typeof c==='function'?c:null,cc=fn?null:C(c);
  for(let i=0;i<P.count;i++,o++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);pos[o*3]=x;pos[o*3+1]=y;pos[o*3+2]=z;nor[o*3]=N.getX(i);nor[o*3+1]=N.getY(i);nor[o*3+2]=N.getZ(i);
   const k=fn?C(fn(x,y,z)):cc;col[o*3]=k.r;col[o*3+1]=k.g;col[o*3+2]=k.b;
   uv[o*2]=.015+.21*fr(x*2.7+z*1.9);uv[o*2+1]=1-(.775+.1*fr(y*2.3+z*1.1))}}          // plain atlas tile: grime + the odd blood spot
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.computeBoundingSphere();return g}
function add(par,list,mat,part){const m=new T.Mesh(build(list),mat);m.castShadow=true;m.receiveShadow=true;if(part){m.userData.part=part;if(part==='head')m.userData.head=1}par.add(m);return m}
/* primitives */
const dome=(r,th=PI/2,ws=22,hs=10)=>new T.SphereGeometry(r,ws,hs,0,PI*2,0,th);
const ball=(r,s=12)=>new T.SphereGeometry(r,s,Math.max(6,s>>1));
const box=(w,h,d)=>new T.BoxGeometry(w,h,d);
const cyl=(r0,r1,h,s=20)=>new T.CylinderGeometry(r0,r1,h,s);
const tor=(R,t,arc=PI*2,ts=28)=>new T.TorusGeometry(R,t,6,ts,arc);
const lathe=(pts,s=24,ph0=0,ph=PI*2)=>new T.LatheGeometry(pts.map(p=>V2(p[0],p[1])),s,ph0,ph);
const brim=(r0,r1,t,droop,ph0,ph)=>lathe([[r0,0],[r1,-droop],[r1,-droop-t],[r0,-t],[r0,0]],24,ph0,ph);        // solid flat brim / visor
/* ---------------- decals (numbers, back lettering): small canvas planes on the torso ---------------- */
const DT={};
function decalTex(txt,fg,font){const k=txt+fg+font;if(DT[k])return DT[k];const cv=document.createElement('canvas');cv.width=256;cv.height=128;const c=cv.getContext('2d');
 c.fillStyle=fg;c.font=font||'bold 104px Impact,Arial Black,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.strokeStyle='rgba(0,0,0,.35)';c.strokeText(txt,128,68);c.fillText(txt,128,68);
 const t=new T.CanvasTexture(cv);t.anisotropy=4;return DT[k]=t}
function decal(par,txt,fg,w,h,pos,ry,font){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:decalTex(txt,fg,font),transparent:true,alphaTest:.35,roughness:.85,depthWrite:false}));
 m.position.set(pos[0],pos[1],pos[2]);m.rotation.y=ry||0;m.renderOrder=1;m.raycast=()=>{};par.add(m);return m}
const BODY=y=>y-.9;                                                                                   // model y -> body-pivot y
const backZ=-.127,frontZ=.134;
/* ---------------- shared head pieces ---------------- */
const HEAD={
 policeCap(P,mat,crown,band,badge){add(P.head,[
   [lathe([[.101,0],[.104,.045],[.128,.082],[.131,.092],[.001,.098]],26),crown,[0,H.brow-.012,H.cz-.008]],
   [cyl(.103,.103,.026,26),band,[0,H.brow+.0,H.cz-.008]],
   [brim(.098,.148,.008,.02,-.8,1.6),0x0b0b0d,[0,H.brow-.012,H.cz-.008],[0,0,0],[1,1,.92]],
   [box(.03,.034,.008),badge,[0,H.brow+.05,H.cz+.112],[-.35,0,0]],
   [tor(.104,.0035,1.8),badge,[0,H.brow+.0,H.cz-.006],[PI/2,0,PI/2-.9]]],mat,'head')},
 cap(P,mat,c,front,brimC){add(P.head,[
   [dome(.106,PI/2),(x,y,z)=>front&&z>.03?front:c,[0,H.brow-.022,H.cz-.006],[0,0,0],[1,.86,1.04]],
   [ball(.012,8),c,[0,H.brow-.022+.092,H.cz-.006]],
   [cyl(.1,.1,.007,24),brimC||c,[0,H.brow-.022,H.cz+.075],[.14,0,0],[.78,1,.74]]],mat,'head')},
 footballHelmet(P,mat,shell,stripe,mask){const cy=H.cy+.012,cz=H.cz-.006,L=[
   [dome(.152,PI*.64,26,14),shell,[0,cy,cz],[0,0,0],[1,.97,1.1]],
   [tor(.156,.011,PI,24),stripe,[0,cy,cz],[0,PI/2,0],[1,.97,1.1]]];
  for(const y of[-.035,-.075])L.push([tor(.142,.0065,1.7,18),mask,[0,cy+y,cz],[PI/2,0,PI/2-.85]]);
  L.push([box(.012,.11,.012),mask,[0,cy-.06,cz+.146]]);
  for(const s of[-1,1])L.push([cyl(.022,.022,.012,12),stripe,[s*.142,cy-.035,cz+.01],[0,0,PI/2]]);
  add(P.head,L,mat,'head')},
 fireHelmet(P,mat,shell,shield){const y0=H.brow-.026,cz=H.cz-.01;add(P.head,[
   [dome(.12,PI/2,24,10),shell,[0,y0,cz],[0,0,0],[1,.96,1.08]],
   [lathe([[.112,0],[.19,-.012],[.19,-.022],[.112,-.012],[.112,0]],28),shell,[0,y0+.004,cz-.035],[0,0,0],[1,1,1.25]],
   [box(.02,.034,.235),shell,[0,y0+.108,cz-.005],[.0,0,0]],
   [box(.078,.088,.012),shield,[0,y0+.058,cz+.124],[-.32,0,0]],
   [box(.03,.03,.014),0x8a1a10,[0,y0+.06,cz+.129],[-.32,0,0]]],mat,'head')},
 nurseCap(P,mat){add(P.head,[
   [box(.14,.05,.08),0xf6f6f2,[0,H.top-.004,H.cz+.035],[-.38,0,0]],
   [box(.044,.012,.006),0xc81818,[0,H.top+.012,H.cz+.078],[-.38,0,0]],[box(.012,.044,.006),0xc81818,[0,H.top+.012,H.cz+.078],[-.38,0,0]]],mat,'head')},
 surgeon(P,mat,capC,maskC){add(P.head,[
   [ball(.118,18),capC,[0,H.top-.06,H.cz-.012],[0,0,0],[1,.6,1.05]],
   [cyl(.104,.104,.03,22),capC,[0,H.brow-.006,H.cz-.008]],
   [lathe([[.104,-.036],[.11,-.036],[.11,.036],[.104,.036],[.104,-.036]],18,-1.2,2.4),maskC,[0,H.mouth,H.cz],[0,0,0],[1,1,1.14]],
   [tor(.104,.003),0xf2f2f2,[0,H.mouth+.03,H.cz-.004],[PI/2,0,0],[1,1.12,1]],[tor(.104,.003),0xf2f2f2,[0,H.mouth-.025,H.cz-.004],[PI/2,0,0],[1,1.12,1]]],mat,'head')},
 headband(P,mat,c){add(P.head,[[tor(.1,.013),c,[0,H.brow-.004,H.cz-.004],[PI/2,0,0],[1,1.1,1]]],mat,'head')},
 chef(P,mat){add(P.head,[[cyl(.105,.108,.1,22),0xf4f4f0,[0,H.top-.012,H.cz-.008]],[ball(.135,16),0xf8f8f4,[0,H.top+.07,H.cz-.008],[0,0,0],[1,.62,1]]],mat,'head')},
 paperHat(P,mat){add(P.head,[[box(.2,.05,.11),0xf2f2ee,[0,H.top-.005,H.cz-.005]]],mat,'head')}
};
function wristbands(P,mat,c){for(const s of['L','R'])add(P['el'+s],[[tor(.046,.012),c,[0,-.225,.026],[PI/2,0,0],[1,1.15,1]]],mat,'arm'+s)}
function skirt(P,g,mat,colFn,hem){const top=1.045,b=hem||.72;add(g,[[lathe([[.18,top],[.205,.98],[.25,.86],[.29,b+.02],[.297,b],[.285,b-.004],[.24,.86],[.19,.98],[.17,top],[.18,top]],30),colFn]],mat,null)}
function pads(P,mat,c,dark){const L=[];for(const s of[-1,1])L.push([dome(.16,PI*.42,20,8),c,[s*.152,BODY(1.425),.0],[0,0,s*.22],[1,.62,1.05]]);
 L.push([tor(.088,.026),dark,[0,BODY(1.455),.0],[PI/2,0,0],[1.05,1.2,1]]);add(P.body,L,mat,null)}
/* ---------------- colour helpers ---------------- */
const outer=q=>q.nx*q.x>0&&Math.abs(q.nx)>.55;               // outer side of a limb
const front=q=>q.nz>.35,back=q=>q.nz<-.35;
const isLeg=q=>q.k==='legL'||q.k==='legR',isArm=q=>q.k==='armL'||q.k==='armR',isFore=q=>q.k==='foreL'||q.k==='foreR';
const hand=q=>isFore(q)&&q.reg===2&&q.y<.9,R=RZB.reg;
const SK=q=>q.pal[R.skin];
const TEAM=[0x9a1b1b,0x1b3a8a,0x1c6b2a,0xd06010,0x5a2a8a,0x141418,0x0f5c6a];
const num=()=>String(1+Math.floor(Math.random()*99));
/* ---------------- outfits ---------------- */
const O={};
O.cop={col(pal){const lb=Math.random()<.3,shirt=C(lb?0x8fa8cf:0x22325a),pants=C(0x18203a),blk=C(0x111111),gold=C(0xc9a43a),silver=C(0xc8ccd2),dk=C(0x0d1222),tie=C(0x141a30);
  pal[R.shirt]=shirt;pal[R.sleeve]=Math.random()<.5?shirt:pal[R.skin];pal[R.pants]=pants;pal[R.shoes]=blk;
  return q=>{if(q.k==='body'){if(inB(q.y,.975,1.035))return front(q)&&Math.abs(q.x)<.024?gold:blk;
     if(front(q)&&inB(q.y,1.27,1.345)&&inB(q.x,.04,.1))return gold;if(front(q)&&inB(q.y,1.27,1.3)&&inB(q.x,-.1,-.045))return silver;
     if(front(q)&&Math.abs(q.x)<.018&&inB(q.y,1.06,1.42))return lb?tie:C(0x1a2648);
     if(front(q)&&inB(q.y,1.28,1.34)&&Math.abs(Math.abs(q.x)-.075)<.034&&lb)return C(0x7f98c2)}
    if(isArm(q)&&inB(q.y,1.3,1.37)&&outer(q))return gold;
    if(isLeg(q)&&q.reg===R.pants&&outer(q)&&Math.abs(q.nx)>.8)return dk;return null}},
 acc(c){HEAD.policeCap(c.P,c.mat,0x1b2440,0x0b0b0d,0xc9a43a)}};
O.army_soldier={camo:true,col(pal){const w=C(0xe6e6dc);pal[R.shirt]=w;pal[R.sleeve]=w;pal[R.pants]=w;pal[R.shoes]=C(0x3a2e22);return null},
 acc(c){for(const an of['helmet','vest']){const A=c.ACC[an];if(!A)continue;for(const k in A){const par=k==='body'?c.P.body:k==='head'?c.P.head:k.startsWith('leg')?c.P[k]:k.startsWith('arm')?c.P[k]:c.P['el'+k.slice(-1)];
   const m=new T.Mesh(A[k],c.mat);m.castShadow=true;m.receiveShadow=true;const slot=k==='body'?undefined:k.startsWith('fore')?'arm'+k.slice(-1):k;if(slot){m.userData.part=slot;if(slot==='head')m.userData.head=1}par.add(m)}}}};
O.baseball={col(pal){const tm=C(PK([0x1c2a5a,0xa01c1c,0x151518,0x1c4a2a])),jer=C(0xe9e7dd),pw=C(0xdad7cc);this.tm=tm;
  pal[R.shirt]=jer;pal[R.sleeve]=tm;pal[R.pants]=pw;pal[R.shoes]=C(0x141414);
  return q=>{const pin=fr((q.x+.5)*22)<.12;
   if(q.k==='body'){if(inB(q.y,.975,1.03))return tm;if(q.reg===R.shirt){if(front(q)&&Math.abs(q.x)<.011)return tm;return pin?tm:jer}if(q.reg===R.pants)return pw}
   if(isArm(q))return q.y>1.25?(pin?tm:jer):tm;
   if(isLeg(q)&&q.reg===R.pants){if(q.y<.47)return tm;if(outer(q)&&Math.abs(q.nx)>.82)return tm}return null}},
 acc(c){const tm=O.baseball.tm||C(0x1c2a5a);HEAD.cap(c.P,c.mat,tm,null,tm);add(c.P.head,[[box(.035,.04,.006),0xf2f2f2,[0,H.brow+.03,H.cz+.11],[-.5,0,0]]],c.mat,'head');
  decal(c.P.body,num(),'#'+tm.getHexString(),.17,.085,[0,BODY(1.27),backZ-.004],PI)}};
O.football={col(pal){const tm=C(PK(TEAM)),wh=C(0xf2f0ea),pn=C(PK([0xe8e4d8,0xc8a24a,0xd8d8d8]));this.tm=tm;
  pal[R.shirt]=tm;pal[R.sleeve]=pal[R.skin];pal[R.pants]=pn;pal[R.shoes]=C(0x111111);
  return q=>{if(isArm(q)){if(inB(q.y,1.255,1.282)||inB(q.y,1.298,1.325))return wh;return q.y>1.2?tm:SK(q)}
   if(q.k==='body'&&inB(q.y,.975,1.02))return C(0x111111);
   if(isLeg(q)&&q.reg===R.pants){if(q.y<.47)return inB(q.y,.36,.4)?wh:tm;if(outer(q)&&Math.abs(q.nx)>.82)return tm}return null}},
 acc(c){const tm=O.football.tm||C(0x9a1b1b),shell=Math.random()<.5?tm:C(0xeeeeea);HEAD.footballHelmet(c.P,c.mat,shell,shell===tm?C(0xf2f2f2):tm,0x9a9a9a);pads(c.P,c.mat,tm,tm.clone().multiplyScalar(.6));
  const n=num();decal(c.P.body,n,'#f4f4f4',.2,.1,[0,BODY(1.24),backZ-.03],PI);decal(c.P.body,n,'#f4f4f4',.14,.07,[0,BODY(1.25),frontZ+.03],0)}};
O.fire={col(pal){const coat=C(Math.random()<.65?0xb39b66:0x2b2b2b),lime=C(0xf0ff3a),sil=C(0xffffff),blk=C(0x141414),glove=C(0x7a5a32);
  pal[R.shirt]=coat;pal[R.sleeve]=coat;pal[R.pants]=coat;pal[R.shoes]=blk;
  const band=(y,a)=>inB(y,a,a+.065)?(inB(y,a+.022,a+.043)?sil:lime):null;
  return q=>{let b=null;
   if(q.k==='body'&&q.reg!==R.face){b=band(q.y,1.07)||band(q.y,1.3);if(b)return b;return coat}
   if(isArm(q))return band(q.y,1.24)||coat;if(hand(q))return glove;if(isFore(q))return band(q.y,.96)||coat;
   if(isLeg(q)){if(q.y<.3)return inB(q.y,.26,.3)?C(0xd8b000):blk;b=band(q.y,.71)||band(q.y,.38);return b||coat}return null}},
 acc(c){HEAD.fireHelmet(c.P,c.mat,PK([0x141414,0xd8b000,0xa81c14]),0xc8a030);decal(c.P.body,'FIRE','#d6e23a',.2,.1,[0,BODY(1.22),backZ-.005],PI)}};
O.jogger={col(pal){const ne=C(PK([0xff5a1a,0x22d3ee,0xe11d74,0xa3e635,0xfacc15])),sh=C(PK([0x141418,0x1c2a5a,0x4a4a50])),wh=C(0xf0f0f0),tank=Math.random()<.6;this.ne=ne;
  pal[R.shirt]=ne;pal[R.sleeve]=pal[R.skin];pal[R.pants]=sh;pal[R.shoes]=wh;
  return q=>{if(isArm(q))return tank||q.y<1.3?SK(q):ne;
   if(q.k==='body'&&q.reg===R.pants)return outer(q)?wh:sh;
   if(isLeg(q)){if(q.reg===R.shoes)return outer(q)?ne:wh;if(q.y>.66)return outer(q)&&Math.abs(q.nx)>.85?wh:sh;if(q.y<.17)return wh;return SK(q)}return null}},
 acc(c){const ne=O.jogger.ne||C(0xff5a1a);HEAD.headband(c.P,c.mat,ne);wristbands(c.P,c.mat,ne);
  add(c.P.body,[[box(.15,.11,.004),0xf4f4f4,[0,BODY(1.2),frontZ-.004],[-.05,0,0]]],c.mat,null);decal(c.P.body,num(),'#111111',.12,.06,[0,BODY(1.2),frontZ+.0],0)}};
O.doctor={col(pal){const sc=C(PK([0x2f8f8a,0x3a7fa0,0x4a8a5a,0x5a6aa8])),gl=C(0x5a8ae0),cl=C(PK([0xdcdcdc,0x9ac4e0]));this.sc=sc;
  pal[R.shirt]=sc;pal[R.sleeve]=pal[R.skin];pal[R.pants]=sc;pal[R.shoes]=cl;
  return q=>{if(hand(q))return gl;if(isArm(q))return q.y>1.27?sc:SK(q);
   if(q.k==='body'&&front(q)&&q.y>1.29&&Math.abs(q.x)<(q.y-1.29)*1.1)return SK(q);
   if(q.k==='body'&&front(q)&&inB(q.y,1.22,1.27)&&inB(q.x,-.1,-.06))return sc.clone().multiplyScalar(.7);return null}},
 acc(c){const sc=O.doctor.sc||C(0x2f8f8a);HEAD.surgeon(c.P,c.mat,sc.clone().multiplyScalar(.85),0x9ac4e0)}};
O.nurse={col(pal){const wh=C(0xf4f2ee),red=C(0xc81e1e),st=C(0xece8e2);
  pal[R.shirt]=wh;pal[R.sleeve]=pal[R.skin];pal[R.pants]=st;pal[R.shoes]=C(0xb01010);
  return q=>{if(isArm(q))return q.y>1.3?(inB(q.y,1.3,1.315)?red:wh):SK(q);
   if(q.k==='body'){if(q.reg===R.pants)return wh;if(q.y>1.43&&front(q))return red;
    if(front(q)&&inB(q.y,1.26,1.34)&&inB(q.x,.045,.105)&&(Math.abs(q.x-.075)<.009||Math.abs(q.y-1.3)<.009))return red}
   if(isLeg(q)&&q.reg===R.pants&&inB(q.y,.6,.625))return red;return null}},
 acc(c){HEAD.nurseCap(c.P,c.mat);skirt(c.P,c.g,c.mat,(x,y,z)=>y<.745?0xc81e1e:0xf4f2ee,.73)}};
O.paramedic={col(pal){const u=C(PK([0x1e2a44,0x23402e,0x2a2f3a])),hv=Math.random()<.5,vis=C(0xc6dd18),sil=C(0xd8dce0),pat=C(0xf2f2f2),blue=C(0x2a5ad8);
  pal[R.shirt]=u;pal[R.sleeve]=u;pal[R.pants]=u;pal[R.shoes]=C(0x111111);
  return q=>{if(q.k==='body'&&q.reg===R.shirt){if(hv){if(inB(q.y,1.1,1.145)||inB(q.y,1.24,1.285))return sil;return vis}
     if(front(q)&&inB(q.y,1.27,1.335)&&inB(q.x,.04,.1))return(Math.abs(q.x-.07)<.008||Math.abs(q.y-1.3)<.008)?blue:pat}
   if(isArm(q)){if(inB(q.y,1.3,1.37)&&outer(q))return pat;if(inB(q.y,1.235,1.265))return sil}
   if(isFore(q)&&q.reg===R.sleeve&&inB(q.y,.96,.99))return sil;
   if(isLeg(q)&&q.reg===R.pants&&inB(q.y,.3,.34))return sil;return null}},
 acc(c){decal(c.P.body,'EMS','#e8ecef',.2,.1,[0,BODY(1.25),backZ-.005],PI)}};
/* ---- extras for the other Fort Zombie styles ---- */
O.business={col(pal){const s=C(PK([0x23232c,0x2a3040,0x3a3a3a])),tie=C(PK([0x9a1b1b,0x1b3a8a,0x2a5a2a])),wh=C(0xe8e8e4);pal[R.shirt]=s;pal[R.sleeve]=s;pal[R.pants]=s;pal[R.shoes]=C(0x0e0e0e);
  return q=>{if(q.k==='body'&&front(q)&&q.y>1.12&&Math.abs(q.x)<(q.y-1.12)*.55)return Math.abs(q.x)<.016&&q.y<1.43?tie:wh;return null}}};
O.butcher={col(pal){const wh=C(0xe8e4dc),ap=C(0xdcd6c8);pal[R.shirt]=wh;pal[R.sleeve]=pal[R.skin];
  return q=>{if((q.k==='body'||isLeg(q))&&q.nz>.2&&inB(q.y,.55,1.38)&&q.reg!==R.shoes)return ap;return null}},acc(c){HEAD.paperHat(c.P,c.mat)}};
O.baker={col(pal){const wh=C(0xf0eee8);pal[R.shirt]=wh;pal[R.pants]=C(0x5a5a5a);return null},acc(c){HEAD.chef(c.P,c.mat)}};
O.postal={col(pal){const b=C(0x8aa2bc),nv=C(0x1f2b4a);pal[R.shirt]=b;pal[R.sleeve]=pal[R.skin];pal[R.pants]=nv;
  return q=>{if(isArm(q))return q.y>1.3?b:SK(q);if(isLeg(q)&&q.reg===R.pants&&q.y<.62)return q.y<.3?nv:SK(q);return null}},acc(c){HEAD.cap(c.P,c.mat,0x8aa2bc,null,0x1f2b4a)}};
O.trucker={acc(c){HEAD.cap(c.P,c.mat,PK([0x1b3a8a,0x9a1b1b,0x2a2a2a]),0xf0f0ec)}};
O.schoolgirl={col(pal){const wh=C(0xeeeeea);pal[R.shirt]=wh;pal[R.sleeve]=wh;pal[R.pants]=pal[R.skin];pal[R.shoes]=C(0x111111);
  return q=>{if(q.k==='body'&&front(q)&&Math.abs(q.x)<.016&&inB(q.y,1.15,1.42))return C(0x8a1b1b);if(isLeg(q)&&q.reg===R.pants&&q.y<.48)return wh;return null}},
 acc(c){const a=C(0x1c2a5a),b=C(0x2a5a3a);skirt(c.P,c.g,c.mat,(x,y,z)=>((Math.floor(Math.atan2(x,z)*6)+Math.floor(y*40))&1)?a:b,.76)}};
for(const k of['femalesundress','femalereddress','femaleblackdress'])O[k]={col(pal){pal[R.pants]=pal[R.skin];pal[R.sleeve]=pal[R.skin];this.d=pal[R.shirt];pal[R.shoes]=C(0x1a1a1a);
  return q=>{if(isArm(q)&&k==='femalesundress')return SK(q);return null}},acc(c){const d=O[k].d||C(0xd8b040);skirt(c.P,c.g,c.mat,d,.68)}};
O.femaletanktop={col(pal){return q=>isArm(q)?SK(q):null}};
O.hoodie={col(pal,st){if(!/_stripe/.test(st))return null;const w=C(0xf0f0f0);return q=>((q.k==='body'&&q.reg===R.shirt)||isArm(q)||(isFore(q)&&q.reg===R.sleeve))&&inB(q.y,1.18,1.22)?w:null}};
O.hockey={col(pal){const tm=C(PK(TEAM)),w=C(0xf0f0f0);pal[R.shirt]=tm;pal[R.sleeve]=tm;return q=>(isFore(q)&&q.reg===R.sleeve&&inB(q.y,.97,1.01))||(q.k==='body'&&inB(q.y,1.04,1.08))?w:null},
 acc(c){decal(c.P.body,num(),'#f4f4f4',.18,.09,[0,BODY(1.25),backZ-.004],PI)}};
/* ====================== v061: more variants ====================== */
const hsh=(x,y,z)=>fr(Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453);
const cell=(q,s)=>hsh(Math.floor(q.x*s),Math.floor(q.y*s),Math.floor(q.z*s));
const plaid=(q,a,b,line)=>{const u=q.k==='body'||isLeg(q)?q.x:q.z,i=Math.floor(u*11),j=Math.floor(q.y*11),t=(i+j)&1;
 if(line&&(fr(u*16)<.12||fr(q.y*16)<.12))return line;return t?a:b};
const HEAD2={
 fedora(P,mat,c,band){const y=H.brow-.008,z=H.cz-.006;add(P.head,[
   [lathe([[.104,0],[.109,.045],[.1,.088],[.05,.098],[.03,.088],[.001,.094]],26),c,[0,y,z],[0,0,0],[1,1,1.08]],
   [cyl(.107,.107,.022,26),band,[0,y+.012,z],[0,0,0],[1,1,1.08]],
   [lathe([[.104,.004],[.17,.016],[.172,.008],[.104,-.006]],28),c,[0,y,z],[0,0,0],[1,1,1.1]]],mat,'head')},
 strawHat(P,mat){const y=H.brow-.005,z=H.cz-.006,st=(x,yy,zz)=>fr(Math.atan2(x,zz)*9+yy*30)<.5?0xd8c27a:0xc8ae62;add(P.head,[
   [lathe([[.106,0],[.11,.06],[.09,.1],[.001,.104]],24),st,[0,y,z]],[cyl(.109,.109,.022,24),0x8a2a1a,[0,y+.012,z]],
   [lathe([[.105,.004],[.27,-.02],[.27,-.03],[.105,-.006]],32),st,[0,y,z]]],mat,'head')},
 hardHat(P,mat,c){const y=H.brow-.03,z=H.cz-.008;add(P.head,[[dome(.122,PI/2,24,10),c,[0,y,z],[0,0,0],[1,.95,1.1]],
   [brim(.115,.15,.008,.012,-.9,1.8),c,[0,y+.005,z]],[lathe([[.118,0],[.135,-.004],[.135,-.012],[.118,-.008],[.118,0]],26),c,[0,y+.004,z],[0,0,0],[1,1,1.1]],
   [box(.026,.03,.25),c,[0,y+.11,z],[0,0,0]],[box(.05,.035,.008),0x1a5ad8,[0,y+.07,z+.128],[-.4,0,0]]],mat,'head')},
 moto(P,mat,c){const cy=H.cy+.01,cz=H.cz-.004;add(P.head,[[dome(.158,PI*.72,26,14),c,[0,cy,cz],[0,0,0],[1,1.02,1.12]],
   [lathe([[.159,-.035],[.165,-.035],[.165,.035],[.159,.035],[.159,-.035]],22,-1.05,2.1),0x0d1218,[0,cy-.005,cz],[0,0,0],[1,1,1.12]],
   [lathe([[.15,-.03],[.16,-.03],[.16,.03],[.15,.03],[.15,-.03]],20,-1.25,2.5),c,[0,cy-.085,cz],[0,0,0],[1,1,1.1]]],mat,'head')},
 hockeyHelmet(P,mat,c){const cy=H.cy+.03,cz=H.cz-.01,L=[[dome(.13,PI*.56,24,12),c,[0,cy,cz],[0,0,0],[1,.95,1.12]]];
  for(let i=-2;i<=2;i++)L.push([box(.004,.11,.004),0xc8c8c8,[i*.024,H.cy-.035,H.cz+.13-Math.abs(i)*.008]]);
  for(const y of[-.02,-.065])L.push([tor(.128,.0035,1.6,16),0xc8c8c8,[0,H.cy+y,H.cz],[PI/2,0,PI/2-.8],[1,1.05,1]]);add(P.head,L,mat,'head')},
 hazmat(P,mat,c){add(P.head,[[ball(.172,20),c,[0,H.cy+.025,H.cz-.012],[0,0,0],[1,1.12,1.06]],
   [lathe([[.172,-.055],[.178,-.055],[.178,.055],[.172,.055],[.172,-.055]],22,-1.0,2.0),0x22343e,[0,H.cy+.03,H.cz-.012],[0,0,0],[1,1,1.06]],
   [cyl(.034,.034,.05,16),0x161616,[0,H.mouth-.01,H.cz+.17],[PI/2,0,0]],[cyl(.038,.038,.012,16),0xd8b000,[0,H.mouth-.01,H.cz+.198],[PI/2,0,0]]],mat,'head')},
 gasMask(P,mat){add(P.head,[[lathe([[.104,-.065],[.112,-.065],[.112,.065],[.104,.065],[.104,-.065]],20,-1.3,2.6),0x1c1c1c,[0,H.cy-.035,H.cz],[0,0,0],[1,1,1.12]],
   [ball(.055,14),0x222222,[0,H.mouth-.005,H.cz+.11],[0,0,0],[1,.9,1.1]],[cyl(.03,.03,.06,14),0x4a5232,[0,H.mouth-.02,H.cz+.17],[PI/2-.4,0,0]],
   [cyl(.024,.024,.01,16),0x2a3a44,[-.035,H.cy-.005,H.cz+.118],[PI/2,0,0]],[cyl(.024,.024,.01,16),0x2a3a44,[.035,H.cy-.005,H.cz+.118],[PI/2,0,0]],
   [tor(.105,.007),0x1c1c1c,[0,H.cy+.02,H.cz-.01],[PI/2+.25,0,0],[1,1.12,1]]],mat,'head')},
 jasonMask(P,mat){add(P.head,[[lathe([[.106,-.1],[.113,-.1],[.113,.1],[.106,.1],[.106,-.1]],22,-1.15,2.3),(x,y,z)=>{
   const ly=y-(H.cy-.02);if(Math.abs(ly-.035)<.02&&Math.abs(Math.abs(x)-.036)<.018)return 0x111111;                       // eye holes
   if(Math.abs(Math.abs(x)*.7-(ly-.075))<.007&&ly>.06)return 0xb01818;if(Math.abs(Math.abs(x)*.6-(.0-ly)*.8+.02)<.006&&ly<.0&&ly>-.05&&Math.abs(x)>.02)return 0xb01818;
   if(fr(x*55)<.22&&fr(ly*55)<.22&&ly<.0)return 0x2a2a2a;return 0xe6e2d2},[0,H.cy-.02,H.cz],[0,0,0],[1,1,1.12]]],mat,'head')},
 bob(P,mat,c){const L=[[dome(.114,PI*.6,24,12),c,[0,H.cy+.015,H.cz-.012],[0,0,0],[1,1.02,1.1]],
   [ball(.05,12),c,[-.088,H.mouth+.035,H.cz-.01],[0,0,.4],[.55,1,1.4]],[ball(.05,12),c,[.088,H.mouth+.03,H.cz-.01],[0,0,-.4],[.55,1,1.4]],
   [box(.09,.025,.05),c,[-.03,H.top-.05,H.cz+.085],[-.5,0,.35]]];
  for(let i=0;i<6;i++){const a=PI+(i-2.5)*.35;L.push([cyl(.0,.03,.07,8),c,[Math.sin(a)*.085,H.top-.06+(i%2)*.02,H.cz+Math.cos(a)*.09],[-Math.cos(a)*1.1,0,Math.sin(a)*1.1]])}add(P.head,L,mat,'head')},
 glasses(P,mat){const y=H.cy-.005,z=H.cz+.115;add(P.head,[[tor(.021,.003,PI*2,16),0x2a2a2a,[-.035,y,z]],[tor(.021,.003,PI*2,16),0x2a2a2a,[.035,y,z]],[box(.028,.004,.004),0x2a2a2a,[0,y+.004,z]],
   [box(.004,.004,.1),0x2a2a2a,[-.075,y+.004,z-.05]],[box(.004,.004,.1),0x2a2a2a,[.075,y+.004,z-.05]]],mat,'head')},
 beanie(P,mat,c){add(P.head,[[dome(.112,PI*.55,22,10),c,[0,H.brow-.015,H.cz-.01],[0,0,0],[1,1,1.08]],[cyl(.114,.114,.035,22),c,[0,H.brow-.006,H.cz-.01],[0,0,0],[1,1,1.08]]],mat,'head')}
};
const FAT={shape(){return(k,x,y,z)=>{
  if(k==='body'){const b=Math.exp(-(((y-1.08)/.2)**2)),fx=.12+.45*b,fz=.1+.5*b+(z>0?.55*b:0);return[x*fx,0,z*fz]}
  if(k==='head')return[x*.06,0,0];
  if(isLegK(k)&&y>.15){const x0=x<0?-.088:.088,f=.08+.42*Math.min(1,Math.max(0,(y-.45)/.45));return[(x-x0)*f,0,(z-.01)*f]}
  if(k==='armL'||k==='armR'){const x0=x<0?-.165:.165;return[(x-x0)*.3,0,(z+.005)*.3]}
  if((k==='foreL'||k==='foreR')&&y>.88){const x0=x<0?-.18:.18;return[(x-x0)*.18,0,(z-.02)*.18]}return null}},
 pivFix(P){P.armL.position.x*=1.3;P.armR.position.x*=1.3;P.legL.position.x*=1.28;P.legR.position.x*=1.28}};
const isLegK=k=>k==='legL'||k==='legR';
O.hockey={col(pal){const tm=C(PK(TEAM)),w=C(0xf0f0f0),blk=C(0x141414);this.tm=tm;pal[R.shirt]=tm;pal[R.sleeve]=tm;pal[R.pants]=blk;pal[R.shoes]=blk;
  return q=>{if((isFore(q)&&q.reg===R.sleeve&&(inB(q.y,.96,1.0)||inB(q.y,1.02,1.04)))||(q.k==='body'&&q.reg===R.shirt&&inB(q.y,1.03,1.09)))return w;
   if(isLeg(q)&&q.reg===R.pants&&q.y<.56)return inB(q.y,.3,.36)?w:tm;if(hand(q))return C(0x3a2a1a);return null}},
 shape(){return(k,x,y,z)=>isLegK(k)&&y>.56?[(x-(x<0?-.088:.088))*.2,0,(z-.01)*.2]:null},
 acc(c){const tm=O.hockey.tm||C(0x1b3a8a);HEAD2.hockeyHelmet(c.P,c.mat,tm);pads(c.P,c.mat,tm,tm.clone().multiplyScalar(.6));
  for(const s of['L','R']){add(c.P['arm'+s],[[ball(.05,12),0x1a1a1a,[s==='L'?-.017:.017,-.29,.0],[0,0,0],[1,1,1.1]]],c.mat,'arm'+s);
   add(c.P['leg'+s],[[box(.01,.035,.26),0x1a1a1a,[0,-.915,.06]],[box(.004,.012,.29),0xd8dde2,[0,-.938,.06]]],c.mat,'leg'+s)}
  decal(c.P.body,num(),'#f4f4f4',.18,.09,[0,BODY(1.25),backZ-.03],PI)}};
O.schoolgirl={col(pal){const wh=C(0xf2f2ee),nv=C(0x1a2448),red=C(0xc81e1e);pal[R.shirt]=wh;pal[R.sleeve]=wh;pal[R.pants]=pal[R.skin];pal[R.shoes]=C(0x1a120c);
  return q=>{if(q.k==='body'&&q.reg===R.shirt){if(back(q)&&q.y>1.25)return inB(q.y,1.27,1.285)?wh:nv;if(q.y>1.39&&!front(q))return nv;
     if(front(q)&&q.y>1.31&&Math.abs(q.x)<(q.y-1.31)*1.25+.01)return Math.abs(q.x)<.03&&q.y<1.37?red:nv}
   if(isFore(q)&&q.reg===R.sleeve&&inB(q.y,.96,1.0))return nv;if(isLeg(q)&&q.reg===R.pants&&q.y<.47)return q.y>.44?nv:wh;return null}},
 acc(c){skirt(c.P,c.g,c.mat,(x,y,z)=>fr(Math.atan2(x,z)*5)<.1?0x101830:0x1a2448,.76);add(c.P.body,[[ball(.03,10),0xc81e1e,[0,BODY(1.34),frontZ-.004],[0,0,0],[1.5,.8,.6]]],c.mat,null);HEAD2.bob(c.P,c.mat,0x141010)}};
O.trucker={col(pal){const tee=C(PK([0xe8e8e4,0x5a5a5a,0x8a2a2a])),jean=C(0x34507a);pal[R.shirt]=tee;pal[R.sleeve]=pal[R.skin];pal[R.pants]=jean;pal[R.shoes]=C(0x4a3828);
  return q=>isArm(q)?(q.y>1.3?tee:SK(q)):(q.k==='body'&&inB(q.y,.975,1.03)?C(0x3a2a1a):null)},
 acc(c){HEAD.cap(c.P,c.mat,PK([0x1b3a8a,0x9a1b1b,0x2a6a2a,0x2a2a2a]),0xf0f0ec,null)}};
O.chef={col(pal){const wh=C(0xf4f4f0),blk=C(0x111111),red=C(0xc81e1e);pal[R.shirt]=wh;pal[R.sleeve]=wh;pal[R.pants]=wh;pal[R.shoes]=blk;
  return q=>{if(q.k==='body'&&front(q)&&q.reg===R.shirt){if(q.y>1.38&&Math.abs(q.x)<.06)return red;if(Math.abs(Math.abs(q.x)-.06)<.009&&fr(q.y*14)<.3&&q.y<1.36)return blk}
   if(q.reg===R.pants&&(isLeg(q)||q.k==='body'))return((Math.floor(q.x*60)+Math.floor(q.y*60))&1)?blk:wh;return null}},
 acc(c){HEAD.chef(c.P,c.mat)}};
O.butcher={col(pal){const wh=C(0xe6e2da),b1=C(0x7a0a08),b2=C(0x4a0604);pal[R.shirt]=wh;pal[R.sleeve]=pal[R.skin];pal[R.pants]=wh;pal[R.shoes]=C(0xd8d8d8);
  return q=>{if(q.reg===R.shirt||q.reg===R.pants||(isArm(q)&&q.y>1.25)){const h=cell(q,9),h2=cell(q,23);if(h<.35)return h2<.5?b2:b1;if(h2<.12)return b1;return wh}return isArm(q)?SK(q):null}},
 acc(c){HEAD.paperHat(c.P,c.mat)}};
O.fl_employee={col(pal){const red=C(0xc4161c),yel=C(0xf2c200),blk=C(0x161616);pal[R.shirt]=red;pal[R.sleeve]=pal[R.skin];pal[R.pants]=blk;pal[R.shoes]=blk;
  return q=>{if(isArm(q))return q.y>1.3?(inB(q.y,1.3,1.32)?yel:red):SK(q);
   if(q.k==='body'&&q.reg===R.shirt){if(q.y>1.42)return yel;if(front(q)&&inB(q.y,1.25,1.31)&&inB(q.x,-.1,-.045))return C(0xf4f4f4);if(front(q)&&inB(q.y,1.255,1.3)&&inB(q.x,.05,.09))return yel}
   if(q.k==='body'&&inB(q.y,.975,1.02))return blk;return null}},
 acc(c){HEAD.cap(c.P,c.mat,0xc4161c,0xf2c200,0xc4161c)}};
O.business={col(pal){const s=C(0x111114),tie=C(PK([0x9a1b1b,0x1b2a6a,0x6a1b4a])),wh=C(0xf0f0ec);pal[R.shirt]=s;pal[R.sleeve]=s;pal[R.pants]=s;pal[R.shoes]=C(0x0a0a0a);
  return q=>{if(q.k==='body'&&front(q)&&q.y>1.1&&Math.abs(q.x)<(q.y-1.1)*.55)return Math.abs(q.x)<.015&&q.y<1.44?tie:wh;
   if(isFore(q)&&q.reg===R.sleeve&&q.y<.9)return wh;return null}}};
O.old_man={col(pal){const card=C(PK([0x9a8a6a,0x6a6a6a,0x7a5a3a,0x5a6a7a])),tr=C(PK([0x5a4a38,0x4a4a4a,0x6a5a48])),wh=C(0xe8e6de);pal[R.skin]=pal[R.skin].clone().lerp(C(0xc8c4b4),.35);pal[R.face]=pal[R.skin];
  pal[R.shirt]=card;pal[R.sleeve]=card;pal[R.pants]=tr;pal[R.shoes]=C(0x3a2618);
  return q=>{if(q.k==='body'&&front(q)){if(q.y>1.2&&Math.abs(q.x)<(q.y-1.2)*.5)return wh;if(Math.abs(q.x)<.012&&fr(q.y*12)<.25&&q.y<1.2)return C(0x3a2a1a)}
   if(q.k==='body'&&inB(q.y,1.03,1.07))return C(0x2a1a10);return null}},
 acc(c){HEAD2.fedora(c.P,c.mat,PK([0x6a6a64,0x5a4a38,0x3a3a3a]),0x1a1a1a);HEAD2.glasses(c.P,c.mat)}};
O.freddy={col(pal){const r=C(0x9a1c1c),g=C(0x2a5a2a),br=C(0x4a3a2a);pal[R.shirt]=r;pal[R.sleeve]=r;pal[R.pants]=br;pal[R.shoes]=C(0x2a1a10);
  const burn=[C(0x8a3a2a),C(0x6a2418),C(0xa85a3a),C(0x5a1a10)];
  return q=>{if(q.reg===R.face){return burn[Math.floor(cell(q,40)*4)]}
   if(hand(q))return q.x>0?C(0x5a3a1c):SK(q);
   if((q.k==='body'&&q.reg===R.shirt)||isArm(q)||(isFore(q)&&q.reg===R.sleeve))return fr(q.y*11)<.5?r:g;return null}},
 acc(c){HEAD2.fedora(c.P,c.mat,0x4a3622,0x2a1c10);const L=[];for(let i=0;i<4;i++)L.push([box(.004,.15,.012),0xd0d4d8,[-.024+i*.016,-.47,.07],[.25,0,0]]);add(c.P.elR,L,c.mat,'armR')}};
O.jason={col(pal){const j=C(0x3a4632),p=C(0x2a2a2a);pal[R.shirt]=j;pal[R.sleeve]=j;pal[R.pants]=p;pal[R.shoes]=C(0x1a1410);
  return q=>q.k==='body'&&front(q)&&Math.abs(q.x)<.012?C(0x2a3424):null},acc(c){HEAD2.jasonMask(c.P,c.mat)}};
O.karen={col(pal){const bl=C(PK([0x3a7a8a,0x6a3a7a,0xd8c8b0,0x8a2a4a])),pt=C(PK([0xe8e2d4,0xc8b896,0x2a2a2a]));pal[R.shirt]=bl;pal[R.sleeve]=bl;pal[R.pants]=pt;pal[R.shoes]=C(0x8a6a4a);
  return q=>q.k==='body'&&front(q)&&q.y>1.32&&Math.abs(q.x)<(q.y-1.32)*.9?SK(q):null},acc(c){HEAD2.bob(c.P,c.mat,PK([0xb5401c,0xa83418,0xc8501e]))}};
O.stripper={col(pal){const a=C(PK([0x111111,0xe0287a,0x8a1a8a,0xd81e2a])),hl=C(PK([0xe0287a,0xf2f2f2,0x111111]));pal[R.shirt]=pal[R.skin];pal[R.sleeve]=pal[R.skin];pal[R.pants]=pal[R.skin];pal[R.shoes]=hl;
  return q=>{if(q.k==='body'){if(inB(q.y,1.22,1.31)&&q.reg!==R.face)return a;if((front(q)||back(q))&&inB(q.y,1.31,1.44)&&Math.abs(Math.abs(q.x)-.075)<.01)return a;if(q.y<1.02)return a}
   if(isLeg(q)&&q.reg!==R.shoes){if(q.y>.86)return a;if(fr(q.y*45+q.x*30)<.12||fr(q.y*45-q.x*30)<.12)return C(0x161616)}return null}},
 acc(c){for(const s of['L','R'])add(c.P['leg'+s],[[cyl(.006,.004,.09,6),c.pal[R.shoes],[0,-.885,-.05]]],c.mat,'leg'+s);HEAD2.bob(c.P,c.mat,PK([0xe8c870,0x141010,0xd8d0b0]))}};
O.farmer={col(pal){const dn=C(0x3a5a86),sh=C(PK([0xe8e4d8,0xb83a2a,0x6a8ab0]));pal[R.shirt]=sh;pal[R.sleeve]=Math.random()<.5?pal[R.skin]:sh;pal[R.pants]=dn;pal[R.shoes]=C(0x5a3a1e);
  return q=>{if(q.k==='body'){if(q.reg===R.pants)return dn;if(front(q)&&inB(q.y,1.0,1.3)&&Math.abs(q.x)<.11)return Math.abs(Math.abs(q.x)-.07)<.01&&inB(q.y,1.26,1.3)?C(0xc8a030):dn;
    if((front(q)||back(q))&&q.y>1.0&&Math.abs(Math.abs(q.x)-.075)<.016)return dn}return null}},acc(c){HEAD2.strawHat(c.P,c.mat)}};
O.grocery={col(pal){const gr=C(0x2a7a3a),sh=C(PK([0xe8e8e4,0xc8b896])),bl=C(0x1a1a1a);pal[R.shirt]=sh;pal[R.sleeve]=pal[R.skin];pal[R.pants]=bl;pal[R.shoes]=bl;
  return q=>{if((q.k==='body'||isLeg(q))&&q.nz>.15&&inB(q.y,.6,1.36)&&q.reg!==R.shoes){if(q.k==='body'&&inB(q.y,1.24,1.29)&&inB(q.x,-.1,-.05))return C(0xf4f4f4);return gr}
   if(q.k==='body'&&back(q)&&q.y>1.0&&Math.abs(q.x)<.02)return gr;if(isArm(q))return q.y>1.3?sh:SK(q);return null}}};
O.biker={col(pal){const lt=C(0x141414),sil=C(0xb8bcc0);pal[R.shirt]=lt;pal[R.sleeve]=lt;pal[R.pants]=lt;pal[R.shoes]=lt;
  return q=>{if(q.k==='body'&&front(q)&&Math.abs(q.x-(q.y-1.2)*.3)<.006&&inB(q.y,1.0,1.4))return sil;if(q.k==='body'&&inB(q.y,.975,1.02))return front(q)&&Math.abs(q.x)<.03?sil:lt;return null}},
 acc(c){if(Math.random()<.6)HEAD2.moto(c.P,c.mat,PK([0x111111,0x9a1b1b,0x2a2a2a]));else HEAD2.beanie(c.P,c.mat,0x1a1a1a);decal(c.P.body,'MC','#c8c8c8',.18,.09,[0,BODY(1.25),backZ-.005],PI)}};
O.fat_female=Object.assign({col(pal){const d=C(PK([0x2a4aa8,0x3a5ac8,0x1e3a8a]));this.d=d;pal[R.shirt]=d;pal[R.sleeve]=pal[R.skin];pal[R.pants]=pal[R.skin];pal[R.shoes]=C(0x1a1a2a);
  return q=>isArm(q)?(q.y>1.32?d:SK(q)):null},acc(c){const d=O.fat_female.d||C(0x2a4aa8);add(c.g,[[lathe([[.24,1.05],[.27,.98],[.31,.86],[.35,.66],[.355,.64],[.345,.636],[.3,.86],[.25,.98],[.23,1.05],[.24,1.05]],30),d]],c.mat,null);HEAD2.bob(c.P,c.mat,PK([0x5a3a1e,0x2a1a10,0x8a7a6a]))}},FAT);
O.hawaiian=Object.assign({col(pal){const base=C(PK([0x1aa0a0,0xd83a2a,0x2a5ad8,0xf28a1a,0x3aa03a])),fl=[C(0xf4f4f0),C(0xf2d21a),C(0xf06aa0)],kh=C(0xc8b48a);
  pal[R.shirt]=base;pal[R.sleeve]=pal[R.skin];pal[R.pants]=kh;pal[R.shoes]=C(0x6a4a2a);
  return q=>{if((q.k==='body'&&q.reg===R.shirt)||(isArm(q)&&q.y>1.28)){const h=cell(q,20);return h<.22?fl[Math.floor(h*13.6)%3]:base}
   if(isArm(q))return SK(q);if(isLeg(q)&&q.reg===R.pants&&q.y<.6)return SK(q);if(isLeg(q)&&q.reg===R.shoes&&q.y>.04)return SK(q);return null}}},FAT);
O.hazmat={col(pal){const y=C(0xe8c81a),blk=C(0x161616);pal[R.shirt]=y;pal[R.sleeve]=y;pal[R.pants]=y;pal[R.shoes]=blk;pal[R.skin]=blk;
  return q=>{if(isFore(q)&&inB(q.y,.88,.93))return blk;if(isLeg(q)&&inB(q.y,.15,.2))return blk;if(q.k==='body'&&front(q)&&Math.abs(q.x)<.01&&inB(q.y,.95,1.4))return C(0x8a7a10);return null}},
 shape(){return(k,x,y,z)=>k==='body'?[x*.08,0,z*.12]:(isLegK(k)&&y>.2)?[(x-(x<0?-.088:.088))*.12,0,(z-.01)*.12]:null},acc(c){HEAD2.hazmat(c.P,c.mat,0xe8c81a)}};
O.prepper={camo:true,col(pal){const w=C(0xe6e6dc),ol=C(0x5a6040);pal[R.shirt]=ol;pal[R.sleeve]=ol;pal[R.pants]=w;pal[R.shoes]=C(0x2a2018);return null},
 acc(c){const A=c.ACC.vest;if(A)for(const k in A){const par=k==='body'?c.P.body:k.startsWith('leg')||k.startsWith('arm')?c.P[k]:c.P['el'+k.slice(-1)];const m=new T.Mesh(A[k],c.mat);m.castShadow=true;par.add(m)}
  HEAD2.gasMask(c.P,c.mat);HEAD2.beanie(c.P,c.mat,0x3a4030)}};
O.lumberjack={col(pal){const r=C(0xb01c1c),k=C(0x1a1a1a),jn=C(0x2e4a7a),sus=C(PK([0x9a1b1b,0x2a2a2a]));pal[R.shirt]=r;pal[R.sleeve]=r;pal[R.pants]=jn;pal[R.shoes]=C(0x5a3a1e);
  return q=>{if(q.k==='body'&&q.reg===R.shirt){if((front(q)||back(q))&&Math.abs(Math.abs(q.x)-.075)<.014)return sus;return plaid(q,r,k,null)}
   if(isArm(q)||(isFore(q)&&q.reg===R.sleeve))return plaid(q,r,k,null);if(q.k==='body'&&q.reg===R.pants)return jn;return null}},
 acc(c){if(Math.random()<.5)HEAD2.beanie(c.P,c.mat,PK([0xb01c1c,0x3a3a3a,0xd8a01a]))}};
O.utility={col(pal){const hv=C(PK([0xf27a10,0xd6e81a])),sil=C(0xe8ecee),nv=C(0x22304a);pal[R.shirt]=nv;pal[R.sleeve]=nv;pal[R.pants]=C(PK([0x22304a,0x8a7a5a]));pal[R.shoes]=C(0x5a3a1e);
  return q=>{if(q.k==='body'&&q.reg===R.shirt){if(inB(q.y,1.1,1.14)||(inB(q.y,1.14,1.42)&&Math.abs(Math.abs(q.x)-.07)<.016&&(front(q)||back(q))))return sil;return hv}
   if(isLeg(q)&&q.reg===R.pants&&inB(q.y,.3,.33))return sil;if(hand(q))return C(0x8a7a4a);return null}},acc(c){HEAD2.hardHat(c.P,c.mat,0xf2f2ee)}};
/* new spawnable styles (Fort Zombie stats of the 'generic' zombie unless noted), so they turn up in towns and sieges and in Dev Mode */
const NEW={old_man:{},freddy:{},jason:{w:'weap_machete'},karen:{},stripper:{},farmer:{w:'weap_pitchfork'},grocery:{},biker:{},fat_female:{res:1.4,s:[1.0,1.08]},
 hazmat:{res:1.2},prepper:{w:'weap_pumpshotgun',wo:60},lumberjack:{w:'weap_fireaxe'},hawaiian:{res:1.4,s:[1.0,1.1]},utility:{w:'weap_shovel',wo:50},chef:{}};
function addStyles(){const S=typeof FZ!=='undefined'&&FZ.cfg&&FZ.cfg.zst;if(!S||!S.generic)return false;
 for(const k in NEW){if(S[k])continue;const n=NEW[k],g=JSON.parse(JSON.stringify(S.generic));g.st=[k];if(n.res)g.res*=n.res;if(n.s){g.smin=n.s[0];g.smax=n.s[1]}if(n.w){g.w=[[n.w,1]];g.wo=n.wo||100}S[k]=g}
 try{if(window.fzZRender)fzZRender()}catch(e){}return true}
if(!addStyles()){let t=0;const iv=setInterval(()=>{if(addStyles()||++t>60)clearInterval(iv)},500)}

window.RZO=O;
window.RZKIT={build,add,dome,ball,box,cyl,tor,lathe,brim,H,HEAD,HEAD2,skirt,pads,decal,BODY,frontZ,backZ,FAT};   // v066: shared kit for survivors.js
console.log('[outfits] '+Object.keys(O).length+' zombie outfits ready');
})();
