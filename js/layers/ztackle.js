/* ==========================================================================================================
   MINI FORT ZOMBIE - FOOTBALL ZOMBIE KNEEL + CHARGE POSES (v072)
   The football zombie's Tackle now has a wind-up you can read (state machine in skills.js: fzTackleBegin / fzTackleStep):
   - KNEEL (~2.5 s): he drops onto one knee like a quarterback taking a knee, one hand on the turf, the other on his front knee, head up
     and staring down the line he is about to run. His facing and charge direction are locked the moment he goes down, so if you see
     him kneel, step off that line. In the last 0.6 s he coils lower and shakes: that is your cue.
   - CHARGE: head down, shoulder forward, arms pumping, straight along the locked line until he hits you, hits something or runs out.
   The legs are single rigid pieces (no knee joint in the rig), so the kneel lowers the hips and swings the back leg behind, shin on the
   ground, and the front leg forward to the foot. Applied after every other pose layer (core, zanim, zclimb).
   ========================================================================================================== */
(function(){
'use strict';
if(typeof animZ!=='function'){console.warn('[ztackle] animZ missing');return}
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t*t*(3-2*t);
const ZT=window.ZTACKLE={on:true,drop:.44,coil:.6};
function legY(P){if(P._tkLeg===undefined)P._tkLeg=[P.legL.position.y,P.legR.position.y];return P._tkLeg}
function restore(u,P){if(!u._tkPose)return;u._tkPose=0;const L=legY(P);P.legL.position.y=L[0];P.legR.position.y=L[1]}
const _an=animZ;
animZ=function(z,dt,horde){_an.apply(this,arguments);const u=z.userData,P=u&&u.parts;if(!P||!P.legL||!P.legR||!P.body)return;
 const k=u.tk;if(!ZT.on||!k||!z.visible||u.crawl||u.sleep||u.ragT>0||u.flop>0||u.rise>0){restore(u,P);return}
 try{const t=performance.now()/1000,set=(o,x,y,zr)=>{if(!o)return;o.rotation.x=x;if(y!==undefined)o.rotation.y=y;if(zr!==undefined)o.rotation.z=zr};
  z.rotation.set(0,k.yaw,0);u.yV=u.yT=k.yaw;const L=legY(P);u._tkPose=1;
  if(k.ph==='kneel'){
   const a=ease(clamp(k.t/.35,0,1)),left=k.dur-k.t,coil=clamp(1-left/ZT.coil,0,1),shake=coil*Math.sin(t*38)*.035,breathe=Math.sin(t*5.5)*.015*(1-coil);
   const drop=(ZT.drop+.07*coil)*a;
   P.body.position.set(0,.9-drop+breathe,0);P.legL.position.y=L[0]-drop;P.legR.position.y=L[1]-drop;
   set(P.body,.3+(.8+.12*coil)*a+shake,0,shake*.6);
   set(P.legL,(1.12+.06*coil)*a,0,-.07);           // knee down, shin back along the ground
   set(P.legR,(-.86-.05*coil)*a,0,.09);           // front foot planted ahead
   set(P.head,-(.15+(.95+.1*coil)*a),0,0);        // eyes up, locked on the line
   set(P.armL,-.25-(1.05)*a,0,-.12*a);set(P.elL,-.05);    // hand on the turf
   set(P.armR,-.25-(.5)*a,0,.22*a);set(P.elR,-.25-.85*a);   // forearm on the front knee
  }else{   // charge: shoulder down, arms driving
   const s=Math.sin(t*16);P.body.position.y=.84+Math.abs(s)*.03;P.legL.position.y=L[0];P.legR.position.y=L[1];
   set(P.body,.95,0,-.12);set(P.head,-.85,0,0);
   set(P.armL,-1.25+s*.25,0,-.35);set(P.elL,-1.2);set(P.armR,.2-s*.9,0,.15);set(P.elR,-1.1-Math.max(0,s)*.4);
   P.legL.rotation.x=s*1.05;P.legR.rotation.x=-s*1.05}
 }catch(e){if(!ZT.err){ZT.err=1;console.warn('[ztackle]',e)}}};
if(typeof killZ==='function'){const _kz=killZ;killZ=function(z){try{const u=z&&z.userData;if(u&&u.tk){u.tk=null;if(u.parts&&u.parts.legL)restore(u,u.parts)}}catch(e){}return _kz.apply(this,arguments)}}
console.log('[ztackle] football kneel + charge poses');
})();
