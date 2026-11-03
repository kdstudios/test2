/* ==========================================================================================================
   MINI FORT ZOMBIE - ARMED ZOMBIE AIM (v075): what you see while a cop / soldier zombie takes aim (state machine: skills.js FZ_AIM).
   - Pose: stands upright, squared to the target, gun arm raised and pointed at it, the other hand coming up to support it.
   - Laser sight: a red beam from the muzzle to the target that brightens as the shot comes; it flickers in the last half second.
   Break line of sight before it fires and the beam goes out (the shot is cancelled). Applied after the other pose layers.
   ========================================================================================================== */
(function(){
'use strict';
if(typeof animZ!=='function'){console.warn('[zaim] animZ missing');return}
const T=THREE,PI=Math.PI,clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t*t*(3-2*t);
const ZA=window.ZAIM={on:true,L:new Map()};
const GEO=new T.CylinderGeometry(.012,.012,1,6,1,true);GEO.translate(0,.5,0);
const UP=new T.Vector3(0,1,0),V1=new T.Vector3(),V2=new T.Vector3(),Q=new T.Quaternion();
function beam(z){let m=ZA.L.get(z);if(m)return m;m=new T.Mesh(GEO,new T.MeshBasicMaterial({color:0xff2020,transparent:true,opacity:.3,depthWrite:false}));
 m.raycast=function(){};m.frustumCulled=false;m.renderOrder=3;m.userData.zaim=1;scene.add(m);ZA.L.set(z,m);return m}
ZA.clear=function(z){const m=ZA.L.get(z);if(m){if(m.parent)m.parent.remove(m);m.material.dispose();ZA.L.delete(z)}};
const _an=animZ;
animZ=function(z,dt,horde){_an.apply(this,arguments);const u=z.userData,a=u&&u.aimG,P=u&&u.parts;
 if(!a){if(ZA.L.has(z))ZA.clear(z);return}
 if(!ZA.on||!P||!P.armL||!P.body||!z.visible)return;
 try{const k=ease(clamp(a.t/.45,0,1)),tp=window.fzTgtPosZ?fzTgtPosZ(a.T):null;
  // elevation from the shoulder to the target
  const sh=z.position.y+1.45*(z.scale.x||1),el=tp?Math.atan2(tp.y-sh,Math.max(.5,a.d||5)):0;
  P.body.rotation.set(0,0,0);if(P.head)P.head.rotation.set(-el*.6*k,0,0);
  P.armL.rotation.set(-(PI/2+el)*k-.1*(1-k),0,.08*k);if(P.elL)P.elL.rotation.set(0,0,0);
  if(P.armR){P.armR.rotation.set(-(PI/2+el-.15)*k,0,-.42*k);if(P.elR)P.elR.rotation.set(-.55*k,0,0)}
  if(P.legL&&P.legR){P.legL.rotation.x=.12;P.legR.rotation.x=-.12}
  // the laser
  if(tp&&a.t>.3){const m=beam(z),o=npcMuzzle(z);V1.copy(tp).sub(o);const len=V1.length();if(len>.1){
    m.position.copy(o);Q.setFromUnitVectors(UP,V1.normalize());m.quaternion.copy(Q);m.scale.set(1,len,1);
    const left=a.dur-a.t,base=.25+.55*clamp(a.t/a.dur,0,1),fl=left<.5?(Math.sin(performance.now()*.06)>0?1:.25):1;m.material.opacity=base*fl;
    m.visible=a.lost<=0}}
 }catch(e){if(!ZA.err){ZA.err=1;console.warn('[zaim]',e)}}};
/* target position for the beam (same as skills.js fzTgtPos, kept here so the pose layer does not depend on its scope) */
window.fzTgtPosZ=function(T0){const v=new T.Vector3();if(T0.m)return v.set(T0.m.position.x,T0.m.position.y+1.2,T0.m.position.z);camera.getWorldPosition(V2);return v.set(pl.position.x,V2.y-.35,pl.position.z)};
if(typeof killZ==='function'){const _kz=killZ;killZ=function(z){try{if(z&&z.userData&&z.userData.aimG){z.userData.aimG=null}ZA.clear(z)}catch(e){}return _kz.apply(this,arguments)}}
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){ZA.L.clear();return _cw.apply(this,arguments)}}
console.log('[zaim] armed zombie aim pose + laser sight');
})();
