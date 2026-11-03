/* ==========================================================================================================
   MINI FORT ZOMBIE - DEATH RAGDOLLS (v067)
   Port of Riposte: Frontline's soldier ragdoll (src/06h-ragdoll.js, MIT, (c) 2026 BenDBSS) to MFZ's rigid-part bodies.
   15 points (pelvis, chest, head, shoulders, elbows, hands, hips, knees, feet) joined by rigid bars and solved by position-based
   dynamics in small steps:
   - realistic masses (torso and pelvis heavy, hands and feet nearly weightless): limbs flop around a trunk that barely moves
   - real Coulomb friction (sticks at rest, sliding is braked): a body never creeps on its own and a thrown one stops quickly
   - the hit is spread over the body (top moves faster than the feet, which catch the ground: the body topples instead of flying),
     the knees give way, the hit angle decides the fall (on the back, on the face, spun sideways); head shots snap the head back
   - near-zero bounce, a dull thud when the heavy points land; sleeps when it really stops moving
   - swept collisions against the world boxes (walls, furniture, floors, barricades): a point leaves a box through the face it came in by
   The points then drive MFZ's parts: torso from pelvis / chest / hips, head, upper arms, forearms and legs aimed at their points.
   Used for every zombie death (corpses stay revivable by medics, dismemberment still works) and every survivor death.
   ========================================================================================================== */
(function(){
'use strict';
if(typeof killZ!=='function'||typeof updDead!=='function'){console.warn('[ragdoll] core missing');return}
const T=THREE,V3=T.Vector3,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const J_PEL=0,J_CHE=1,J_HEAD=2,J_SHL=3,J_ELL=4,J_HAL=5,J_SHR=6,J_ELR=7,J_HAR=8,J_HIL=9,J_KNL=10,J_FTL=11,J_HIR=12,J_KNR=13,J_FTR=14;
const RAG_RIGID=[[0,1],[1,2],[1,3],[1,6],[3,6],[3,4],[4,5],[6,7],[7,8],[0,9],[0,12],[9,12],[9,10],[10,11],[12,13],[13,14],[3,0],[6,0],[9,1],[12,1],[2,3],[2,6],[3,12],[6,9],
 [9,11],[12,14]];                                                                     // MFZ legs are one rigid piece: hip-foot bar too
const RAG_MIN=[[3,5,.24],[6,8,.24],[9,11,.5],[12,14,.5],[2,0,.62],[11,14,.16],[10,13,.16],[5,2,.18],[8,2,.18],[5,8,.1],[4,0,.2],[7,0,.2],[5,1,.2],[8,1,.2]];
const RAG_RAD=[.15,.17,.12,.08,.06,.05,.08,.06,.05,.09,.075,.07,.09,.075,.07];
const RAG_MASS=[10,14,5,3,2,1,3,2,1,6,3.5,1.8,6,3.5,1.8];
const RAG_HINGE=[[J_HIL,J_KNL,J_FTL,1],[J_HIR,J_KNR,J_FTR,1]];
const RAG_HEAVY=[J_PEL,J_CHE,J_HEAD,J_HIL,J_HIR];
const RAG={hMax:1/120,g:24,drag:.35,slow:5,vMax:11,iters:5,hingeMax:.004,mu:.85,muK:.55,stick:.12,bounce:.04,bounceWall:.1,knock:.8,sleepD:.006,sleepT:.4,maxT:12};
const RG=window.RGRAG={on:true,RAG,active:0};
const _a=new V3(),_b=new V3(),_f=new V3(),_r=new V3(),_m=new T.Matrix4(),_q=new T.Quaternion(),_q2=new T.Quaternion(),_v=new V3(),_w=new V3();
/* ---------------- points from the current pose ---------------- */
// part-local offsets of the points that are not pivots (model units; same for Modern and classic bodies, close enough)
function offs(P){const hy=P.handY!=null?P.handY:-.48;return{chest:[0,.4,.02],head:[0,.15,.02],hand:[0,hy,.0],knee:[0,-.47,.03],foot:[0,-.86,.05]}}
const wp=(o,l)=>o.localToWorld(_v.set(l[0],l[1],l[2])).clone();
const piv=o=>o.getWorldPosition(new V3());
function pointsOf(z,P){z.updateMatrixWorld(true);const O=offs(P),p=new Array(15);
 p[J_PEL]=piv(P.body);p[J_CHE]=wp(P.body,O.chest);p[J_HEAD]=wp(P.head,O.head);
 p[J_SHL]=piv(P.armL);p[J_ELL]=piv(P.elL);p[J_HAL]=wp(P.elL,O.hand);p[J_SHR]=piv(P.armR);p[J_ELR]=piv(P.elR);p[J_HAR]=wp(P.elR,O.hand);
 p[J_HIL]=piv(P.legL);p[J_KNL]=wp(P.legL,O.knee);p[J_FTL]=wp(P.legL,O.foot);p[J_HIR]=piv(P.legR);p[J_KNR]=wp(P.legR,O.knee);p[J_FTR]=wp(P.legR,O.foot);
 return p}
/* ---------------- world boxes around the body ---------------- */
const gk=(ix,iz)=>(ix+2048)*4096+(iz+2048);
function query(list,x0,z0,x1,z1,y0,y1,out,skip){const g=list&&list.G;
 const test=b=>{if(!b||skip.has(b)||b.max.y<y0||b.min.y>y1||b.max.x<x0||b.min.x>x1||b.max.z<z0||b.min.z>z1)return;if(out.indexOf(b)<0)out.push(b)};
 if(g&&g.m){const cs=g.cs,a0=Math.floor(x0/cs),a1=Math.floor(x1/cs),c0=Math.floor(z0/cs),c1=Math.floor(z1/cs);
  for(let ix=a0;ix<=a1;ix++)for(let iz=c0;iz<=c1;iz++){const a=g.m.get(gk(ix,iz));if(a)for(let i=0;i<a.length;i++)test(a[i])}for(const b of g.big)test(b)}
 else if(list)for(const b of list)test(b)}
function ragBounds(R,span){const P=R.p;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,z0=1e9,z1=-1e9;
 for(let i=0;i<15;i++){const p=P[i];if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;if(p.z<z0)z0=p.z;if(p.z>z1)z1=p.z}
 const m=.35+RAG.vMax*span;R.boxes.length=0;
 try{query(typeof solids!=='undefined'?solids:null,x0-m,z0-m,x1+m,z1+m,y0-m,y1+m,R.boxes,R.skip);query(typeof walkables!=='undefined'?walkables:null,x0-m,z0-m,x1+m,z1+m,y0-m,y1+m,R.boxes,R.skip)}catch(e){}}
function ragTouch(R,i,pen,x,y,z){R.hit[i]=1;if(pen>=R.dep[i]){R.dep[i]=pen;R.nx[i]=x;R.ny[i]=y;R.nz[i]=z}}
function ragCollide(R,i){const p=R.p[i],q=R.q[i],r=RAG_RAD[i]*R.s;
 if(p.y-r<0){ragTouch(R,i,r-p.y,0,1,0);p.y=r}
 for(const c of R.boxes){const x0=c.min.x-r,x1=c.max.x+r,y0=c.min.y-r,y1=c.max.y+r,z0=c.min.z-r,z1=c.max.z+r;
  if(p.x<x0||p.x>x1||p.y<y0||p.y>y1||p.z<z0||p.z>z1)continue;
  const mg=[x0-q.x,q.x-x1,y0-q.y,q.y-y1,z0-q.z,q.z-z1],pen=[p.x-x0,x1-p.x,p.y-y0,y1-p.y,p.z-z0,z1-p.z];
  if(c.min.y<.05){mg[2]=-1e9;pen[2]=1e9}
  let k=0,best=-1e9;for(let a=0;a<6;a++)if(mg[a]>best){best=mg[a];k=a}
  if(best<-.004){k=0;for(let a=1;a<6;a++)if(pen[a]<pen[k])k=a}
  switch(k){case 0:ragTouch(R,i,pen[0],-1,0,0);p.x=x0;break;case 1:ragTouch(R,i,pen[1],1,0,0);p.x=x1;break;
   case 2:ragTouch(R,i,pen[2],0,-1,0);p.y=y0;break;case 3:ragTouch(R,i,pen[3],0,1,0);p.y=y1;break;
   case 4:ragTouch(R,i,pen[4],0,0,-1);p.z=z0;break;default:ragTouch(R,i,pen[5],0,0,1);p.z=z1}}}
function ragLinks(R){const P=R.p,L=R.links,rest=R.rest;
 for(let k=0;k<L.length;k++){const a=L[k][0],b=L[k][1],pa=P[a],pb=P[b];const dx=pb.x-pa.x,dy=pb.y-pa.y,dz=pb.z-pa.z,len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6;
  const wa=1/RAG_MASS[a],wb=1/RAG_MASS[b],d=(len-rest[k])/(len*(wa+wb));pa.x+=dx*d*wa;pa.y+=dy*d*wa;pa.z+=dz*d*wa;pb.x-=dx*d*wb;pb.y-=dy*d*wb;pb.z-=dz*d*wb}
 for(const [a,b,mn0] of RAG_MIN){const mn=mn0*R.s,pa=P[a],pb=P[b],dx=pb.x-pa.x,dy=pb.y-pa.y,dz=pb.z-pa.z,len=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6;if(len>=mn)continue;
  const wa=1/RAG_MASS[a],wb=1/RAG_MASS[b],d=(len-mn)/(len*(wa+wb));pa.x+=dx*d*wa;pa.y+=dy*d*wa;pa.z+=dz*d*wa;pb.x-=dx*d*wb;pb.y-=dy*d*wb;pb.z-=dz*d*wb}
 _a.subVectors(P[J_CHE],P[J_PEL]);_b.subVectors(P[J_HIR],P[J_HIL]);_f.crossVectors(_a,_b);if(_f.lengthSq()<1e-8)return;_f.normalize();
 for(const [a,k,b,s] of RAG_HINGE){const pk=P[k],m=_r.addVectors(P[a],P[b]).multiplyScalar(.5),o=(pk.x-m.x)*_f.x+(pk.y-m.y)*_f.y+(pk.z-m.z)*_f.z;
  if(o*s<0){const c=clamp(o*.3,-RAG.hingeMax,RAG.hingeMax);pk.x-=_f.x*c;pk.y-=_f.y*c;pk.z-=_f.z*c}}}
function ragStep(R,h){const P=R.p,V=R.v,Q=R.q,n=15,g=RAG.g*h,drag=Math.max(0,1-RAG.drag*h);
 for(let i=0;i<n;i++){const p=P[i],v=V[i];Q[i].copy(p);const sl=v.length(),k=Math.max(0,drag-RAG.slow*h*(1-smoothstep(.4,2.5,sl)));
  v.x*=k;v.y=v.y*k-g;v.z*=k;const s=v.length();if(s>RAG.vMax)v.multiplyScalar(RAG.vMax/s);R.vin[i].copy(v);R.hit[i]=0;R.dep[i]=0;p.addScaledVector(v,h)}
 for(let it=0;it<RAG.iters;it++){ragLinks(R);for(let i=0;i<n;i++)ragCollide(R,i)}
 const inv=1/h;let grounded=false;
 for(let i=0;i<n;i++){const p=P[i],q=Q[i],v=V[i];
  if(R.hit[i]){grounded=true;const nx=R.nx[i],ny=R.ny[i],nz=R.nz[i],d=Math.min(R.dep[i],.03);
   const dx=p.x-q.x,dy=p.y-q.y,dz=p.z-q.z,dn=dx*nx+dy*ny+dz*nz,tx=dx-dn*nx,ty=dy-dn*ny,tz=dz-dn*nz,ts=Math.sqrt(tx*tx+ty*ty+tz*tz);
   if(ts>1e-9){const k=ts<=RAG.mu*d+RAG.stick*h?1:RAG.muK*d/ts;p.x-=tx*k;p.y-=ty*k;p.z-=tz*k}
   v.set((p.x-q.x)*inv,(p.y-q.y)*inv,(p.z-q.z)*inv);
   const vi=R.vin[i],vin=vi.x*nx+vi.y*ny+vi.z*nz,vn=v.x*nx+v.y*ny+v.z*nz;
   if(vin<-1.5){const want=-vin*(ny>.7?RAG.bounce:RAG.bounceWall);if(vn<want){v.x+=nx*(want-vn);v.y+=ny*(want-vn);v.z+=nz*(want-vn)}
    if(R.thud<=0&&ny>.7&&-vin>2.2&&RAG_HEAVY.includes(i))ragThud(R,p,-vin)}}
  else v.set((p.x-q.x)*inv,(p.y-q.y)*inv,(p.z-q.z)*inv)}
 R.thud-=h;return grounded}
function ragThud(R,p,speed){R.thud=.2;const k=clamp(speed/7,.35,1.2);
 try{if(typeof AC!=='undefined'&&AC&&typeof S!=='undefined'){const o=AC.createOscillator(),gn=AC.createGain(),t=AC.currentTime,d=pl.position.distanceTo(p),vol=.18*k*Math.max(0,1-d/30);if(vol<.01)return;
  o.type='sine';o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);gn.gain.setValueAtTime(vol,t);gn.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(gn);gn.connect(AC.destination);o.start(t);o.stop(t+.25)}}catch(e){}}
/* ---------------- the hit (Riposte's ragKnock) ---------------- */
function ragKnock(R,f,base,yaw){const P=R.p,V=R.v;
 const dir=_a.set(f.dir.x,0,f.dir.z);if(dir.lengthSq()<1e-6)dir.set(0,0,1);dir.normalize();const dx=dir.x,dz=dir.z,mag=f.mag;
 const idx=f.part==='head'?J_HEAD:f.part==='legs'?(Math.random()<.5?J_KNL:J_KNR):J_CHE;const add=(i,x,y,z)=>{V[i].x+=x;V[i].y+=y;V[i].z+=z};
 for(let i=0;i<15;i++){const hi=clamp((P[i].y-base)/(1.6*R.s),0,1);
  if(f.radial)add(i,dx*mag*.85,f.lift*.8*(.75+hi*.25),dz*mag*.85);
  else{const near=Math.exp(-P[i].distanceTo(P[idx])/.5),w=(.3+.7*hi)*(.8+.4*near);add(i,dx*mag*RAG.knock*w,f.lift*.1*hi,dz*mag*RAG.knock*w)}}
 if(!f.radial){const fx=Math.sin(yaw),fz=Math.cos(yaw),along=dx*fx+dz*fz,side=dx*fz-dz*fx;   // MFZ bodies face +z
  const up=[J_HEAD,J_CHE,J_SHL,J_SHR],low=[J_KNL,J_KNR,J_FTL,J_FTR];const m=Math.min(mag,6.5)*clamp(1-(mag-5)*.12,.35,1)*.5;
  if(along<-.35){for(const i of up)add(i,dx*m*.5,.3,dz*m*.5);for(const i of low)add(i,-dx*m*.1,0,-dz*m*.1)}
  else if(along>.35){for(const i of up)add(i,dx*m*.6,-.5,dz*m*.6);for(const i of low)add(i,-dx*m*.12,.15,-dz*m*.12)}
  else{const spin=Math.sign(side||1)*(1.2+m*.5);for(const i of [J_SHL,J_SHR,J_ELL,J_ELR,J_HAL,J_HAR,J_HIL,J_HIR])add(i,-(P[i].z-P[J_PEL].z)*spin,0,(P[i].x-P[J_PEL].x)*spin);for(const i of up)add(i,dx*m*.3,.15,dz*m*.3)}
  if(f.part==='head'){add(J_HEAD,dx*m*1.1,.9,dz*m*1.1);for(const i of [J_PEL,J_KNL,J_KNR])add(i,0,-1.2,0)}
  else if(f.part==='legs'){for(const i of low)add(i,dx*m,.7,dz*m);for(const i of up)add(i,-dx*m*.15,0,-dz*m*.15)}
  const buckle=lerp(1.7,.9,clamp((mag-3)/5,0,1));for(const i of [J_PEL,J_KNL,J_KNR,J_HIL,J_HIR])add(i,0,-buckle,0);
  const tw=rand(-1,1);for(const i of [J_SHL,J_SHR])add(i,-(P[i].z-P[J_CHE].z)*tw,0,(P[i].x-P[J_CHE].x)*tw)}}
/* ---------------- start / step / pose ---------------- */
function hips(P){if(!P._hip)P._hip={L:P.legL.position.clone().sub(P.body.position),R:P.legR.position.clone().sub(P.body.position)};return P._hip}
function start(z,P,f,pts,yaw0){
 hips(P);const prev=P.prevPts;const p=pts||pointsOf(z,P),s=z.scale.x||1,yaw=yaw0!=null?yaw0:z.rotation.y;
 const R={p,v:[],q:[],vin:[],hit:new Int8Array(15),dep:new Float64Array(15),nx:new Float64Array(15),ny:new Float64Array(15),nz:new Float64Array(15),links:RAG_RIGID,rest:[],boxes:[],skip:new Set(),snap:[],snapT:0,t:0,still:0,sleep:false,thud:0,s,P,z};
 for(let i=0;i<15;i++){R.v.push(prev&&prev[i]?_w.subVectors(p[i],prev[i]).multiplyScalar(.85/clamp((performance.now()-(P.prevT||0))/1000,.016,.25)).clampLength(0,6).clone():new V3());R.q.push(p[i].clone());R.vin.push(new V3())}
 for(const [a,b] of R.links)R.rest.push(p[a].distanceTo(p[b]));
 // boxes the body starts inside (doorways, odd volumes) are ignored instead of shoving the body out sideways
 ragBounds(R,.1);for(const b of R.boxes){const c=p[J_PEL];if(c.x>b.min.x&&c.x<b.max.x&&c.z>b.min.z&&c.z<b.max.z&&c.y>b.min.y&&c.y<b.max.y)R.skip.add(b)}
 ragBounds(R,.1);for(let it=0;it<12;it++){ragLinks(R);for(let i=0;i<15;i++)ragCollide(R,i)}
 for(let i=0;i<15;i++){R.q[i].copy(p[i]);R.snap.push(p[i].clone())}
 ragKnock(R,f||{dir:new V3(rand(-1,1),0,rand(-1,1)),mag:2,lift:.5,part:'body'},z.position.y,yaw);
 // things hung on the root (skirts, coats, leg stumps) ride on the pelvis from now on, or they would float where the body stood
 try{z.updateMatrixWorld(true);for(const o of z.children.slice()){if(o===P.body||o===P.legL||o===P.legR||o.isSprite||o.isLight)continue;P.body.attach(o)}}catch(e){}
 // the root keeps its place and scale; the parts are posed in world space from the points
 z.rotation.set(0,0,0);z.quaternion.identity();z.updateMatrixWorld(true);
 const O=offs(P),H=hips(P);R.rest0={head:new V3(...O.head).normalize(),hand:new V3(...O.hand).normalize(),foot:new V3(...O.foot).normalize(),hipL:H.L,hipR:H.R};
 z.userData.prag=R;RG.active++;pose(R);return R}
const _x=new V3(),_y=new V3(),_zz=new V3(),_pi=new T.Quaternion();
function aim(obj,parentQ,from,to,restDir){                       // local rotation that points restDir (in parent space) along from->to
 _a.subVectors(to,from);if(_a.lengthSq()<1e-10)return;_a.normalize();_pi.copy(parentQ).invert();_a.applyQuaternion(_pi);obj.quaternion.setFromUnitVectors(restDir,_a)}
function pose(R){const P=R.P,z=R.z,p=R.p,s=R.s;
 if(!P.body||!P.body.parent)return;
 // torso basis: y = pelvis->chest, x = hipL->hipR (MFZ: L at -x), z = x cross y
 _y.subVectors(p[J_CHE],p[J_PEL]).normalize();_x.subVectors(p[J_HIR],p[J_HIL]);_x.addScaledVector(_y,-_x.dot(_y));if(_x.lengthSq()<1e-8)_x.set(1,0,0);_x.normalize();_zz.crossVectors(_x,_y);
 _m.makeBasis(_x,_y,_zz);_q.setFromRotationMatrix(_m);
 P.body.quaternion.copy(_q);P.body.position.copy(p[J_PEL]).sub(z.position).divideScalar(s);P.body.updateMatrixWorld(true);
 const bq=_q.clone(),D=new V3(0,-1,0);
 if(P.head&&P.head.parent===P.body)aim(P.head,bq,p[J_CHE],p[J_HEAD],R.rest0.head);
 for(const [arm,el,sh,elb,ha] of [[P.armL,P.elL,J_SHL,J_ELL,J_HAL],[P.armR,P.elR,J_SHR,J_ELR,J_HAR]]){
  if(!arm||arm.parent!==P.body)continue;arm.getWorldPosition(_w);aim(arm,bq,_w,p[elb],D);arm.updateMatrixWorld(true);
  if(el&&el.parent===arm){const aq=arm.getWorldQuaternion(_q2);el.getWorldPosition(_w);aim(el,aq,_w,p[ha],R.rest0.hand)}}
 for(const [leg,hip,ft,hoff] of [[P.legL,J_HIL,J_FTL,R.rest0.hipL],[P.legR,J_HIR,J_FTR,R.rest0.hipR]]){
  if(!leg||leg.parent!==z)continue;
  _w.copy(hoff).applyQuaternion(bq);leg.position.copy(P.body.position).add(_w);                // hip rides on the pelvis
  leg.getWorldPosition(_v);aim(leg,_pi.identity(),_v.clone(),p[ft],R.rest0.foot)}}
function step(z,dt){const R=z.userData.prag;if(!R)return;R.t+=dt;
 if(!R.sleep&&dt>0){dt=Math.min(dt,.05);const ns=Math.max(1,Math.ceil(dt/RAG.hMax-1e-6)),h=dt/ns;ragBounds(R,dt);
  for(let k=0;k<ns;k++){const gr=ragStep(R,h);R.snapT+=h;
   if(R.snapT>=.1){let far=0;for(let i=0;i<15;i++){const d=R.p[i].distanceTo(R.snap[i]);if(d>far)far=d;R.snap[i].copy(R.p[i])}R.still=gr&&far<RAG.sleepD?R.still+R.snapT:0;R.snapT=0}
   if(R.still>RAG.sleepT||R.t>RAG.maxT){R.sleep=true;RG.active--;for(let i=0;i<15;i++)R.v[i].set(0,0,0);break}}
  pose(R)}}
/* previous-frame points give the body the speed it had when it died (running zombies keep going) */
function track(z){const u=z.userData,P=u.parts||u.P;if(!P||!P.body)return;if(!u._ptT||performance.now()-u._ptT>60){u._ptT=performance.now();try{P.prevPts=pointsOf(z,P);P.prevT=u._ptT}catch(e){}}}
/* ---------------- zombies ---------------- */
function forceFrom(fromPos,z,big,part){const d=new V3(z.position.x-fromPos.x,0,z.position.z-fromPos.z);return{dir:d,mag:big?rand(5.5,7.5):rand(2.6,4),lift:big?2:.6,part:part||(Math.random()<.2?'head':Math.random()<.15?'legs':'body')}}
const _kz=killZ;
killZ=function(z){
 const u=z.userData,P=u.parts;let pts=null;const yaw=z.rotation.y;
 if(RG.on&&P&&P.body){try{hips(P);z.updateMatrixWorld(true);pts=pointsOf(z,P)}catch(e){pts=null}}
 const r=_kz.apply(this,arguments);
 if(!pts||!RG.on||u.kind!=='corpse')return r;
 try{u.rg=null;                                                  // the legacy tumble is replaced by the ragdoll, starting from the pose you saw
  const big=u.ld>=60||(G.eq&&WDEF[G.eq.id]&&WDEF[G.eq.id].pel>1&&z.position.distanceTo(pl.position)<12);
  start(z,P,forceFrom(pl.position,z,big,u.lastPart),pts,yaw);
 }catch(e){if(!RG.err){RG.err=1;console.warn('[ragdoll] zombie',e)}}
 return r};
const _ud=updDead;
updDead=function(dt){_ud.apply(this,arguments);if(!RG.on)return;for(const z of dead){if(z.userData.prag)step(z,dt)}for(const c of RG.bodies)if(c.userData.prag)step(c,dt)};
// remember last frame's pose of nearby zombies so the ragdoll inherits their motion
if(typeof animZ==='function'){const _az=animZ;animZ=function(z){const r=_az.apply(this,arguments);if(RG.on&&z.visible&&z.position.distanceToSquared(pl.position)<625)track(z);return r}}
/* ---------------- survivors ---------------- */
RG.bodies=[];
RG.startBody=function(m,P,from,big){if(!P||!P.body)return null;hips(P);const yaw=m.rotation.y;const pts=pointsOf(m,P);const R=start(m,P,forceFrom(from||pl.position,m,big,'body'),pts,yaw);RG.bodies.push(m);return R};
RG.step=step;RG.pointsOf=pointsOf;RG.start=start;
/* a survivor who dies becomes a body you can search: their whole inventory stays on them */
window.survDown=function(m,from){
 const u=m.userData,sv=u.s,P=u.P;
 try{u.flash=0;if(typeof tintHit==='function')tintHit(m,0)}catch(e){}       // v069: no lingering red hit glow on the body
 try{for(let i=m.children.length-1;i>=0;i--)if(m.children[i].isSprite)m.remove(m.children[i]);if(u.hold)u.hold.visible=true}catch(e){}
 const inv=sv&&typeof svInv==='function'?svInv(sv).inv:(typeof newInv==='function'?newInv(16,16):null);
 const cont={inv,corpse:true,name:sv?sv.name:'Survivor',sv:null,group:m,pieces:[]};
 m.userData={kind:'loot',cont,scorpse:1,P,s:sv};
 if(RG.on&&P&&P.body){try{RG.startBody(m,P,from||pl.position,false)}catch(e){console.warn('[ragdoll] survivor',e)}}
 else{m.rotation.x=-1.45;m.position.y=.2}
 RG.corpses=(RG.corpses||[]).concat([m]);return cont};
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){RG.bodies.length=0;RG.active=0;return _cw.apply(this,arguments)}}
console.log('[ragdoll] Riposte-style death ragdolls for zombies and survivors');
})();
