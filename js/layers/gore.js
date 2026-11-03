/* ==========================================================================================================
   MINI FORT ZOMBIE - LIMBS, TORSO KILLS AND GORE (v069)
   - Every successful hit on an arm or a leg (shot or melee, player or survivor) takes that limb off. Heads still come off on a critical.
   - A zombie whose arm holding a weapon comes off drops back to normal zombie attacks (the weapon goes with the severed arm).
   - Death and resurrection: a zombie killed by a hit to the TORSO is destroyed for good - the body bursts into small red gore bits that
     stay on the ground. Its head and any limbs still attached fly off as loose parts and stay in the level, so medics can still put them
     on another body (lego rule). A zombie that dies any other way (head off, killed through a limb, spikes ...) leaves a corpse medics
     can revive. Shooting or hitting a corpse's torso finishes it the same way; hitting its limbs takes them off.
   ========================================================================================================== */
(function(){
'use strict';
if(typeof hitZ!=='function'||typeof killZ!=='function'){console.warn('[gore] core missing');return}
const T=THREE,LIMB=['armL','armR','legL','legR'],ALLP=['head','armL','armR','legL','legR'],rnd=(a,b)=>a+Math.random()*(b-a);
const GR=window.MFZGORE={bits:[],max:500};
/* ---------------- gore bits ---------------- */
const GEOS=[new T.IcosahedronGeometry(.045,0),new T.IcosahedronGeometry(.03,0),new T.TetrahedronGeometry(.04,0),new T.BoxGeometry(.05,.03,.04)];
const MATS=[0x6e0707,0x8a0a0a,0x4a0404,0x9c1a14,0xb8a898].map((c,i)=>new T.MeshStandardMaterial({color:c,roughness:i===4?.7:.35,metalness:0}));
function bit(x,y,z,vx,vy,vz,bone){const m=new T.Mesh(GEOS[Math.floor(Math.random()*GEOS.length)],MATS[bone?4:Math.floor(Math.random()*4)]);
 m.position.set(x,y,z);m.rotation.set(rnd(0,6),rnd(0,6),rnd(0,6));const s=rnd(.7,1.5);m.scale.set(s,s*rnd(.6,1),s);m.castShadow=false;m.raycast=()=>{};
 scene.add(m);GR.bits.push({m,vx,vy,vz,sx:rnd(-12,12),sz:rnd(-12,12),rest:false});if(GR.bits.length>GR.max){const o=GR.bits.shift();if(o.m.parent)o.m.parent.remove(o.m)}}
function updBits(dt){for(const b of GR.bits){if(b.rest)continue;const p=b.m.position;b.vy-=16*dt;const nx=p.x+b.vx*dt,nz=p.z+b.vz*dt;
  if(typeof blocked==='function'&&blocked(nx,nz,.04,p.y-.05,.1)){b.vx*=-.25;b.vz*=-.25}else{p.x=nx;p.z=nz}p.y+=b.vy*dt;b.m.rotation.x+=b.sx*dt;b.m.rotation.z+=b.sz*dt;
  const gy=(typeof groundAt==='function'?groundAt(p.x,p.z,p.y+.2):0)+.02;
  if(p.y<=gy&&b.vy<0){p.y=gy;if(b.vy<-3){b.vy*=-.18;b.vx*=.4;b.vz*=.4}else{b.rest=true;b.m.rotation.x=0;b.m.rotation.z=0;b.m.scale.y*=.55}}}}
/* ---------------- destroying a body ---------------- */
function centre(z){const P=z.userData.parts,v=new T.Vector3();try{if(P&&P.body){z.updateMatrixWorld(true);P.body.localToWorld(v.set(0,.2,0));return v}}catch(e){}return z.position.clone().setY(z.position.y+.9*(z.scale.x||1))}
GR.gib=function(z,from){const u=z.userData,P=u.parts;if(u.gibbed)return;u.gibbed=true;u.revive=false;
 try{u.flash=0;tintHit(z,0)}catch(e){}                                        // the loose parts must not keep the red hit glow
 const f=from||pl.position,c=centre(z);
 // head and limbs still on the body become loose parts (they stay; medics can graft them onto another body)
 for(const part of ALLP){if(P&&P[part]&&!u['no_'+part]){try{spawnLimb(z,part,f.x,f.z);u['no_'+part]=true}catch(e){}}}
 // the torso bursts
 let dx=c.x-f.x,dz=c.z-f.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
 for(let i=0;i<34;i++){const a=rnd(0,Math.PI*2),sp=rnd(.6,3.4);bit(c.x+rnd(-.12,.12),c.y+rnd(-.25,.25),c.z+rnd(-.12,.12),Math.cos(a)*sp+dx*rnd(.5,2.5),rnd(1,4.5),Math.sin(a)*sp+dz*rnd(.5,2.5),i%9===0)}
 try{bloodSpray(c.x,c.y,c.z,dx,dz,26,1.6);bloodPool(c.x,c.z,rnd(1.4,2.2));for(let i=0;i<3;i++)addDecal(c.x+rnd(-1,1),(typeof groundAt==='function'?groundAt(c.x,c.z,c.y):0)+.02,c.z+rnd(-1,1),0,-Math.PI/2,rnd(.4,.8))}catch(e){}
 try{S.die(c)}catch(e){}
 if(z.parent)z.parent.remove(z);const di=dead.indexOf(z);if(di>=0)dead.splice(di,1);
 if(window.RGRAG&&u.prag&&!u.prag.sleep){u.prag.sleep=true;RGRAG.active--}u.prag=null};
/* ---------------- corpses can still be hit ---------------- */
window.corpseHit=function(c,part,dmg,from){const u=c.userData;if(!c.parent||u.gibbed)return false;const f=from||pl.position;
 if(part&&part!=='torso'&&ALLP.includes(part)){if(!u['no_'+part]&&u.parts&&u.parts[part]){const p=spawnLimb(c,part,f.x,f.z);hideLimb(c,part);if(p)bloodSpray(p.x,p.y,p.z,p.x-f.x,p.z-f.z,10,1)}return true}
 u.chp=(u.chp!=null?u.chp:Math.max(8,(u.hp0||50)*.5))-(dmg||10);const c0=centre(c);try{bloodSpray(c0.x,c0.y,c0.z,c0.x-f.x,c0.z-f.z,6,.8)}catch(e){}
 if(u.chp<=0)GR.gib(c,f);return true};
/* ---------------- hits: limbs always come off, torso kills destroy the body ---------------- */
const _hz=hitZ;
hitZ=function(z,dmg,part,melee,fr){const u=z.userData,alive=zombies.includes(z),f=fr||pl.position;
 let off=false;if(alive&&LIMB.includes(part)&&!u['no_'+part]&&u.parts&&u.parts[part]){off=dismember(z,part,f.x,f.z)}
 const r=_hz.apply(this,arguments);
 if(alive&&!zombies.includes(z)&&u.kind==='corpse'&&(part==='torso'||!part))GR.gib(z,f);
 return r||off};
/* weapon arm lost: back to normal zombie attacks */
const _hl=hideLimb;
hideLimb=function(z,part){const r=_hl.apply(this,arguments);const u=z.userData;
 if(part==='armL'&&(u.wpn||u.gun||u.hold)){u.wpn=null;u.gun=null;u.hold=null;u.hid=null;if(u.bite0)u.bite=u.bite0;else if(typeof FZ!=='undefined'&&FZ.dice)u.bite=FZ.dice('1D4')}
 return r};
/* every corpse that is not destroyed can be revived (only the torso kill is permanent); revivable corpses can be shot */
const _kz=killZ;
killZ=function(z){const r=_kz.apply(this,arguments);const u=z.userData;
 if(u.kind==='corpse'&&!u.gibbed){if(typeof FZ!=='undefined'&&FZ.T&&FZ.T.on&&u.fzs)u.revive=true;u.thru=!u.revive}return r};
/* melee on a corpse in front of you (when no living zombie is in reach) */
if(typeof melee==='function'){const _ml=melee;melee=function(){
 let corpse=null;try{const w=G.eq,d0=w?WDEF[w.id]:FIST,d=d0.type==='gun'?BASH:d0;
  if(G.cdM<=0&&G.st>=d.st&&G.draw<=.1){const fx=-Math.sin(yaw),fz=-Math.cos(yaw),P0=pl.position;
   const live=typeof meleeTarget==='function'?!!meleeTarget(d.reach):zombies.some(z=>{const dx=z.position.x-P0.x,dz=z.position.z-P0.z,l=Math.hypot(dx,dz);return l<d.reach&&(dx*fx+dz*fz)/(l||1)>.5});   // v072: same reach test as melee()
   if(!live){let bd=1e9;for(const c of dead){if(!c.parent||c.userData.gibbed)continue;const q=c.userData.prag?c.userData.prag.p[0]:c.position,dx=q.x-P0.x,dz=q.z-P0.z,l=Math.hypot(dx,dz);if(l<d.reach+.3&&l<bd&&(dx*fx+dz*fz)/(l||1)>.35){bd=l;corpse=c}}
    if(corpse)corpse._md=d.dmg}}}catch(e){corpse=null}
 const r=_ml.apply(this,arguments);
 if(corpse){const parts=['torso','torso','torso','armL','armR','legL','legR'];window.corpseHit(corpse,parts[Math.floor(Math.random()*parts.length)],corpse._md);try{S.hit('blunt')}catch(e){}}
 return r}}
/* per frame */
if(typeof updDead==='function'){const _ud=updDead;updDead=function(dt){const r=_ud.apply(this,arguments);updBits(Math.min(dt,.05));return r}}
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){GR.bits.length=0;return _cw.apply(this,arguments)}}
console.log('[gore] limbs off on hit, torso kills destroy the body');
})();
