/* ==========================================================================================================
   MINI FORT ZOMBIE - KNOCKDOWN RAGDOLLS FOR LIVING ZOMBIES (v072)
   The death ragdoll (js/layers/ragdoll.js, Riposte port) now also handles zombies that go down WITHOUT dying:
   - a zombie that "Fail"s a jump over a low obstacle trips: real ragdoll physics, pitching forward over / into the obstacle
   - a football zombie's charge bowls over the other zombies it runs through or past (friendly fire, see skills.js fzTackleStep)
   The body falls under physics until it settles (1.2 - 3 s), then the rig is put back together and the zombie gets up off its back
   or its front, whichever way it landed, facing the way its body lies, and carries on hunting.
   API: zKnock(zombie, {x,z} push direction, magnitude, lift, part) -> true if the zombie went down.
   Hooks: updateZombies (core gate: u.kd), animZ (outermost: poses the ragdoll / the get-up), fzZAct (no shooting while down),
   killZ (killed while down: the death ragdoll takes over from the pose it is in), failJump (replaced).
   ========================================================================================================== */
(function(){
'use strict';
const RG=window.RGRAG;
if(!RG||!RG.start||!RG.step||typeof animZ!=='function'){console.warn('[zknock] ragdoll layer missing');return}
const T=THREE,clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t*t*(3-2*t);
const ZK=window.ZKNOCK={on:true,minT:1.2,maxT:3.0,upT:1.15,stats:{fails:0,tackled:0}};
const PARTS=['body','head','armL','armR','elL','elR','legL','legR'];
const _e=new T.Euler(0,0,0,'YXZ');
function yawOf(z){_e.setFromQuaternion(z.quaternion,'YXZ');return _e.y}

window.zKnock=function(z,dir,mag,lift,part){
 const u=z&&z.userData,P=u&&u.parts;if(!ZK.on||!RG.on||!P||!P.body||u.kd||u.sleep||u.rise>0||u.hp<=0||!zombies.includes(z))return false;
 try{
  if(u.tk){u.tk=null;if(P._tkLeg){P.legL.position.y=P._tkLeg[0];P.legR.position.y=P._tkLeg[1]}u._tkPose=0}   // a football zombie mid-kneel / mid-charge
  if(u.clb){u.clb=null}u.vs=null;u.atk=null;u.zs=null;u.rg=null;u.ragT=0;u.flop=0;
  const yaw=yawOf(z),rest={};for(const k of PARTS){const o=P[k];if(o)rest[k]={p:o.position.clone(),q:o.quaternion.clone(),par:o.parent}}
  const kids=new Set(z.children);
  const f={dir:new T.Vector3(dir.x,0,dir.z),mag,lift,part:part||'body'};
  const R=RG.start(z,P,f,null,yaw);
  u.kd={ph:'down',t:0,R,rest,kids,yaw,y0:z.position.y};
  return true}catch(e){if(!ZK.err){ZK.err=1;console.warn('[zknock]',e)}u.kd=null;return false}};

/* put the rig back exactly as it was before the fall, then lay the root down the way the ragdoll ended up */
function rebuild(z,u){const K=u.kd,P=u.parts,R=K.R,p=R.p,sc=z.scale.x||1;
 const pel=p[0],che=p[1],head=p[2],fl=p[11],fr=p[14];
 // which way up: the chest's forward (the face) is the torso basis z = (hipL->hipR) x (pelvis->chest)
 const up=new T.Vector3().subVectors(che,pel).normalize(),side=new T.Vector3().subVectors(p[12],p[9]).normalize(),face=new T.Vector3().crossVectors(side,up);
 const onBack=face.y>=0;
 let hx=head.x-(fl.x+fr.x)/2,hz=head.z-(fl.z+fr.z)/2;const hl=Math.hypot(hx,hz)||1;hx/=hl;hz/=hl;
 // lying on the back the head is toward local -z; on the front toward local +z (see core sleepPose)
 const yaw=onBack?Math.atan2(-hx,-hz):Math.atan2(hx,hz);
 if(u.prag===R){if(!R.sleep)RG.active--;u.prag=null}
 for(const k of PARTS){const o=P[k],r=K.rest[k];if(!o||!r)continue;if(o.parent!==r.par&&r.par&&o.parent===null)continue;o.position.copy(r.p);o.quaternion.copy(r.q)}
 z.rotation.order='YXZ';z.rotation.set(0,yaw,0);
 // feet back under the root: the root is at the feet, the body lies from there toward the head
 let fx=(fl.x+fr.x)/2,fz=(fl.z+fr.z)/2;if(blocked(fx,fz,.25,z.position.y,1.2)){fx=pel.x;fz=pel.z;if(blocked(fx,fz,.25,z.position.y,1.2)){fx=z.position.x;fz=z.position.z}}
 z.position.x=fx;z.position.z=fz;z.position.y=groundAt(fx,fz,K.y0+.5);
 z.updateMatrixWorld(true);
 // things ragdoll.js hung on the pelvis (coats, skirts, stumps) go back on the root
 try{for(const o of P.body.children.slice())if(K.kids.has(o))z.attach(o)}catch(e){}
 K.ph='up';K.t=0;K.sgn=onBack?-1:1;K.yaw=yaw;u.yV=u.yT=yaw;u.px=fx;u.pz=fz}

function finish(z,u){const P=u.parts;u.kd=null;z.rotation.set(0,z.rotation.y,0);z.position.y=groundAt(z.position.x,z.position.z,z.position.y+.5);
 if(P){for(const k of['head','armL','armR','elL','elR','legL','legR'])if(P[k])P[k].rotation.set(0,0,0);if(P.body){P.body.rotation.set(.3,0,0);P.body.position.set(0,.9,0)}}
 u.cl=Math.random()*.5+.3;u.zb=0;u.zbT=0;if(u.zp)u.zp.pts=null;u.hunt=Math.max(u.hunt||0,3);u.lx=pl.position.x;u.lz=pl.position.z;u.stag=.35}

window.zKnockStep=function(z,dt){const u=z.userData,K=u.kd;if(!K)return;K.t+=dt;
 if(K.ph==='down'){RG.step(z,dt);const R=K.R;if((R.sleep&&K.t>ZK.minT)||K.t>ZK.maxT)rebuild(z,u);return}
 const k=1-ease(clamp(K.t/ZK.upT,0,1)),sc=z.scale.x||1;z.rotation.x=K.sgn*1.45*k;z.position.y=groundAt(z.position.x,z.position.z,z.position.y+.5)+.22*sc*k;
 if(K.t>=ZK.upT)finish(z,u)};

/* poses: outermost animZ. While down the ragdoll owns every part (ragdoll.js pose()); while getting up, push off the ground */
const _an=animZ;
animZ=function(z,dt,horde){const u=z.userData;if(!u||!u.kd)return _an.apply(this,arguments);
 const dx=z.position.x-pl.position.x,dz=z.position.z-pl.position.z;z.visible=dx*dx+dz*dz<6400;
 const K=u.kd,P=u.parts;if(K.ph!=='up'||!P)return;
 const k=clamp(K.t/ZK.upT,0,1),s=Math.sin(k*Math.PI);
 const set=(o,x,zz)=>{if(o){o.rotation.x=x;o.rotation.y=0;o.rotation.z=zz||0}};
 if(K.sgn>0){   // face down: arms push the chest up, one knee comes under
  set(P.armL,-1.4+1.4*k,-.25);set(P.armR,-1.4+1.4*k,.25);set(P.elL,-.6*s);set(P.elR,-.6*s);set(P.legL,-1.1*s);set(P.legR,.2*s);set(P.head,-.6*(1-k))}
 else{          // on the back: sit up, elbows behind, then a foot under
  set(P.armL,.6*(1-k)+.4*s,-.35*(1-k));set(P.armR,.6*(1-k)+.4*s,.35*(1-k));set(P.elL,-.9*s);set(P.elR,-.9*s);set(P.legL,-1.2*s);set(P.legR,-.4*s);set(P.head,.5*(1-k))}
 if(P.body){P.body.rotation.set(.3+K.sgn*-.35*s,0,0);P.body.position.set(0,.9,0)}};

/* no shooting / abilities while down */
if(typeof fzZAct==='function'){const _fa=fzZAct;fzZAct=function(z){const u=z&&z.userData;if(u&&u.kd)return;return _fa.apply(this,arguments)}}
/* killed while down: the death ragdoll restarts from the pose the body is in */
if(typeof killZ==='function'){const _kz=killZ;killZ=function(z){const u=z&&z.userData;if(u&&u.kd){const K=u.kd;if(u.prag===K.R){if(!K.R.sleep)RG.active--;u.prag=null}
  if(K.ph==='up'){z.rotation.set(0,z.rotation.y,0)}u.kd=null}return _kz.apply(this,arguments)}}

/* a failed jump is a trip: the legs catch the obstacle and the body pitches forward over / into it under physics */
if(typeof failJump==='function'){const _fj=failJump;failJump=function(z,u,ux,uz){const p=z.position;
 if(!ZK.on||!RG.on){return _fj.apply(this,arguments)}
 try{floatText(p.x,p.y+2.1*z.scale.x,p.z,'Fail','#f87171')}catch(e){}
 u.atk=null;if(zKnock(z,{x:ux,z:uz},3.4+Math.random()*1.4,.9,'body')){ZK.stats.fails++;return}
 return _fj.apply(this,arguments)}}

if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){ZK.stats={fails:0,tackled:0};return _cw.apply(this,arguments)}}
console.log('[zknock] knockdown ragdolls (failed jumps, football friendly fire)');
})();
