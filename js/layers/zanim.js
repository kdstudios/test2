/* ==========================================================================================================
   MINI FORT ZOMBIE - LOOSE ZOMBIE LOCOMOTION (v065)
   Layered on top of core animZ (and the medic poses in skills.js) for upright zombies only:
   - wider stance: legs splayed at the hip, longer heavier strides, weight shifting over the planted foot
   - arms abducted at the shoulder so they hang away from the torso (less when reaching for the player)
   - organic looseness: asymmetric shoulder drop, hip roll, shoulder/hip counter-twist, idle sway, per-zombie variation
   - smooth turning: the AI still writes its facing into z.rotation.y; this layer eases the visible yaw toward it
   - animated head: tracks the player while hunting, otherwise slowly looks around on its own
   Crawlers, sleepers, risers, ragdolls and flopping bodies are left to core.
   ========================================================================================================== */
(function(){
'use strict';
if(typeof animZ!=='function'){console.warn('[zanim] animZ missing');return}
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,wrap=a=>{a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI},R=(a,b)=>a+Math.random()*(b-a);
const ZA=window.ZANIM={on:true,abd:.26,spread:.085,turn:5.5,turnHunt:8.5,head:4};
function prof(u){return u.zan||(u.zan={abd:R(.85,1.25),abdL:R(-.06,.06),spread:R(.85,1.3),drop:R(-.07,.07),lean:R(-.05,.05),seed:R(0,TAU),gait:R(.9,1.15),hy:0,hyT:0,hT:R(1,3)})}
const _a=animZ;
animZ=function(z,dt,horde){
 _a.apply(this,arguments);
 const u=z.userData,P=u.parts;
 if(!ZA.on||!P||!z.visible||u.flop>0||u.sleep||u.rise>0||u.ragT>0||u.crawl||u.dead){u.yV=undefined;return}
 try{
  const A=prof(u),t=performance.now()/1000,ch=!!(u.see||u.hunt>0||horde),d=Math.min(dt||.016,.05);
  /* ---- smooth turning: the AI's latest yaw is the target, the visible yaw eases toward it ---- */
  if(u.yV===undefined){u.yV=u.yT=z.rotation.y}
  else if(z.rotation.y!==u.yV)u.yT=z.rotation.y;
  const dy=wrap(u.yT-u.yV),turnK=ch?ZA.turnHunt:ZA.turn,step=dy*(1-Math.exp(-turnK*d)),maxS=(ch?6:3.2)*d;
  const yv=u.yV+clamp(step,-maxS,maxS);u.yV=yv;z.rotation.y=yv;
  const turning=clamp(Math.abs(dy)/1.2,0,1);
  /* ---- gait values (core already advanced u.ph) ---- */
  const ph=u.ph||0,s=Math.sin(ph),c=Math.cos(ph);
  const spd=u.lpx===undefined?0:Math.hypot(z.position.x-u.lpx,z.position.z-u.lpz)/d;u.lpx=z.position.x;u.lpz=z.position.z;
  u._sw=(u._sw||0)+(clamp(spd/2.5,0,1)-(u._sw||0))*(1-Math.exp(-8*d));const sw=u._sw;
  const idle=Math.sin(t*.85+A.seed),idle2=Math.sin(t*.53+A.seed*1.7);
  /* ---- legs: splay at the hip, longer stride ---- */
  const spr=ZA.spread*A.spread*(1+.25*sw);
  if(P.legL&&P.legL.parent){P.legL.rotation.z=-spr-Math.max(0,s)*.04*sw;P.legL.rotation.x*=1.18*A.gait}
  if(P.legR&&P.legR.parent){P.legR.rotation.z=spr+Math.max(0,-s)*.04*sw;P.legR.rotation.x*=1.18*A.gait}
  /* ---- torso: weight shift, hip roll, counter-twist, shoulder drop, heavier bob ---- */
  if(P.body){const b=P.body;
   b.rotation.z=A.drop+s*.075*sw+idle*.035*(1-sw)+A.lean;              // roll toward the stepping side + a resting lean
   b.rotation.y=-s*.13*sw+idle2*.05*(1-sw)-clamp(dy,-.6,.6)*.35;      // shoulders counter the hips, lead into turns
   b.position.x=-s*.035*sw+idle*.012;                                   // weight over the planted foot
   b.position.y-=Math.abs(c)*.025*sw;                                   // sink at mid-stride: heavier steps
  }
  /* ---- arms: abducted, swing a little across, loose elbows; not when a medic pose owns them ---- */
  const posed=u.md&&u.md.pose;
  if(!posed){const ab=ZA.abd*A.abd*(ch?.55:1),lag=Math.sin(ph-.6);
   if(P.armL&&P.armL.parent)P.armL.rotation.z=-(ab+A.abdL)-Math.max(0,lag)*.06*sw-idle*.03;
   if(P.armR&&P.armR.parent)P.armR.rotation.z=(ab-A.abdL)+Math.max(0,-lag)*.06*sw+idle2*.03;
   if(!ch){if(P.elL)P.elL.rotation.x-=.08+Math.max(0,lag)*.12*sw;if(P.elR)P.elR.rotation.x-=.08+Math.max(0,-lag)*.12*sw}}
  /* ---- head: animated look. Hunting: track the player (clamped). Otherwise: wander the gaze every few seconds ---- */
  if(P.head&&P.head.parent){
   if(ch&&typeof pl!=='undefined'){const a=Math.atan2(pl.position.x-z.position.x,pl.position.z-z.position.z);A.hyT=clamp(wrap(a-yv-(P.body?P.body.rotation.y:0)),-1,1)}
   else{A.hT-=d;if(A.hT<=0){A.hT=R(1.6,4.5)*(sw>.5?1.5:1);A.hyT=Math.random()<.3?0:R(-.85,.85)*(sw>.5?.6:1)}
    if(turning>.15)A.hyT=clamp(dy,-.8,.8)}                             // look where it is about to turn
   const hk=ch?ZA.head*1.6:ZA.head*.55;A.hy+=(A.hyT-A.hy)*(1-Math.exp(-hk*d));
   P.head.rotation.y=A.hy;P.head.rotation.z+=idle2*.04;
  }
 }catch(e){if(!ZA.err){ZA.err=1;console.warn('[zanim]',e)}}
};
console.log('[zanim] loose zombie locomotion + smooth turning');
})();
