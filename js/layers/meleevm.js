/* ==========================================================================================================
   MINI FORT ZOMBIE - MELEE VIEWMODEL ON THE MODERN ARMS (v063)
   Melee weapons and fists are drawn in the gun viewmodel scene (gunplay.js: own camera, depth cleared) with the same Modern gloved hands
   and IK arms as the guns (hands.js poseArmToHand). Weapon space = gun space (y up, -z forward, x right). The handle sits in the right
   hand's pistol-grip frame (HAND_FRAMES.R), so the weapon rises up and forward from the fist with its edge (-X of the model) facing away.
   Two-handed weapons put the left hand lower on the same handle; one-handed weapons drop the left arm out of view.
   Swings follow the weapon's swing type: slash (diagonal cut), chop (overhead), jab (thrust), punch (fists, alternating hands).
   Falls back to the core viewmodel if anything is missing.
   ========================================================================================================== */
(function(){
'use strict';
const X=window.RGX,H=window.RGHAND;if(!X||!H||typeof animVM!=='function'){console.warn('[meleevm] gunplay / hands missing');return}
const T=THREE,V3=T.Vector3,VMX=X.vm,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,ss=t=>t*t*(3-2*t),c01=t=>clamp(t,0,1);
const TWO=new Set(['baseball_bat','fire_axe','shovel','pitchfork','katana','broadsword']);
const GRIP=new V3(0,-.05,.06),AX=new V3(0,.946,-.324);                 // grip point and handle axis (tip direction) in weapon space
const MV={cache:{},cur:null,errs:0,pt:0,side:1};
const C=window.MV_DBG={};
function frameQ(x,y){const X0=new V3(...x).normalize(),Y0=new V3(...y).normalize(),Z0=new V3().crossVectors(X0,Y0).normalize();Y0.crossVectors(Z0,X0).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(X0,Y0,Z0))}
const FL={q:frameQ([0,.946,-.324],[-1,0,0]),off:new V3(-.004,-.028,-.024),axis:new V3(1,0,0),range:.5};      // left hand round the same handle
function build(id){
 const root=new T.Group(),fist=id==='fist';let model=null,len=0;
 if(!fist){const t=modelFor(id);if(!t||!t.g)return null;model=t.g.clone(true);model.rotation.set(-.33,-Math.PI/2,0,'XYZ');model.position.copy(GRIP);root.add(model);len=t.len||.6}
 const R=H.makeArm(null,root,-1),L=H.makeArm(null,root,1);
 const two=TWO.has(id),gL=two?GRIP.clone().addScaledVector(AX,id==='katana'||id==='broadsword'?-.11:-.16):GRIP.clone();
 const rh=new T.Euler(-.33,0,0),cap=(c,h)=>({c:[c.x,c.y,c.z],h,r:.012,rx:-.33});
 const gd=fist?null:{R:[cap(GRIP,[.017,.055,.017])],L:[cap(gL,[.017,.055,.017])]};
 root.traverse(o=>{if(o.isMesh)o.frustumCulled=false});root.visible=false;VMX.scene.add(root);
 return MV.cache[id]={id,root,model,arms:{R,L},two,fist,gL,gd,len,d:id==='fist'?FIST:WDEF[id]};
}
function lights(){try{VMX.hemi.intensity=.14+ambL.intensity*.6;VMX.dir.intensity=dirL.intensity*.6;VMX.dir.color.copy(dirL.color);
 const q=camera.getWorldQuaternion(new T.Quaternion()).invert(),dd=dirL.position.clone().sub(dirL.target.position).normalize().applyQuaternion(q);VMX.dir.position.copy(dd).multiplyScalar(4);VMX.torch.intensity=torchL.intensity*1.3}catch(e){}}
/* ---------------- pose: idle, bob, draw, swings ---------------- */
function pose(m,dt){
 let px=.2,py=-.22,pz=-.44,rx=-.72,ry=.22,rz=-.18;
 if(m.two){px=.18;py=-.2;pz=-.46;rx=-.62;ry=.42,rz=-.42}
 if(m.fist){px=.0;py=-.06;pz=-.06;rx=0;ry=0;rz=0}
 const moving=locked&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD),spr=moving&&K.ShiftLeft;if(moving)MV.pt+=dt*(spr?11:8);
 const bx=Math.cos(MV.pt),by=(Math.cos(2*MV.pt)-1)*.5,a=moving?(spr?1.5:1):0;px+=bx*.012*a;py+=by*.014*a;rz+=bx*.02*a;
 const dr=G.draw>0?G.draw/.3:0;py-=dr*.4;rx+=dr*.9;
 let hp=null;                                                       // fists: per-hand punch offset
 if(G.swT>0){const p=c01(1-G.swT/(G.swD||.4)),wind=ss(c01(p/.28)),hit=ss(c01((p-.22)/.3)),back=ss(c01((p-.62)/.38)),k=hit*(1-back);
  switch(G.swK){
   case 'slash':px+=.05*wind-.26*k;py+=.05*wind-.08*k;pz+=.02*wind-.24*k;rz+=.45*wind-1.25*k;rx+=-.15*wind+.4*k;ry+=.15*wind-.4*k;break;
   case 'chop':py+=.08*wind-.1*k;pz+=.03*wind-.3*k;rx+=-.5*wind+.95*k;rz+=.1*wind-.15*k;break;
   case 'jab':pz+=.08*wind-.42*k;rx+=.2*wind+1.2*(wind*(1-back));py+=-.04*k;break;
   case 'bash':pz-=.3*k;rx-=.3*k;break;
   case 'punch':hp={s:MV.side,k:Math.sin(Math.PI*p)};break}}
 m.root.position.set(px,py,pz);m.root.rotation.set(rx,ry,rz,'YXZ');return hp}
const _t={inv:new T.Matrix4()};
function arms(m,dt,hp){
 const B=H.VM_BODY,FR=H.HAND_FRAMES;H.VM.handDt=Math.min(dt,.05)||1/60;
 m.root.updateMatrix();_t.inv.copy(m.root.matrix).invert();const toW=v=>v.clone().applyMatrix4(_t.inv);
 const shapes=m.gd?H.gripShapes({key:'melee_'+m.id,gridDef:null,gripDef:m.gd,trigDef:null}):null;
 const FRr=FR.R,Rs=m.two?B.R:B.Rp,Rp=m.two?B.poleR:B.poleRp;
 if(m.fist){
  // fists: both hands up in a guard in camera space, the punching hand drives forward
  for(const [arm,sd] of [[m.arms.R,1],[m.arms.L,-1]]){const punch=hp&&hp.s===sd?hp.k:0;
   const tgt=new V3(sd*.12-punch*sd*.08,-.13+punch*.05,-.36-punch*.26),S=sd>0?B.Rp:B.Lp,P=sd>0?B.poleRp:B.poleLp,F=sd>0?FR.Rp:FR.Lp;
   const Hh=toW(tgt).sub(F.off.clone().applyQuaternion(F.q));H.setArmVisible(arm,true);
   H.poseArmToHand(arm,toW(S),Hh,F.q,toW(S.clone().add(P)),'grip',0,.34,.33,F.off,F.axis,F.range,F.axis2,F.range2,null,null)}
  return}
 const HR=GRIP.clone().sub(FRr.off.clone().applyQuaternion(FRr.q));
 H.poseArmToHand(m.arms.R,toW(Rs),HR,FRr.q,toW(Rs.clone().add(Rp)),'grip',0,.34,.33,FRr.off,FRr.axis,FRr.range,null,null,shapes&&shapes.R,null);
 if(m.two){H.setArmVisible(m.arms.L,true);const HL=m.gL.clone().sub(FL.off.clone().applyQuaternion(FL.q));
  H.poseArmToHand(m.arms.L,toW(B.Lp),HL,FL.q,toW(B.Lp.clone().add(B.poleLp)),'grip',0,.34,.33,FL.off,FL.axis,FL.range,null,null,shapes&&shapes.L,null)}
 else H.setArmVisible(m.arms.L,false);
}
/* ---------------- frame hook ---------------- */
function want(){if(!X.on||!VMX.ready)return null;if(window.RGFX&&RGFX.s.meleeArms===0)return null;const w=G.eq,d=w&&WDEF[w.id];
 if(!w)return'fist';if(d&&d.type==='melee'&&(!window.RGMELEE||RGMELEE.B[w.id]))return w.id;return null}
function hide(){if(MV.cur){MV.cur.root.visible=false;MV.cur=null}}
const _av=window.animVM;
window.animVM=function(dt){const r=_av.apply(this,arguments);
 try{const id=want();if(!id){hide();return r}
  const m=MV.cache[id]||build(id);if(!m){hide();return r}
  if(MV.cur!==m){hide();MV.cur=m;m.root.visible=true}
  if(G.swT>0&&G.swK==='punch'&&!MV.punching){MV.punching=true;MV.side=-MV.side}if(!(G.swT>0))MV.punching=false;
  if(VM.root)VM.root.visible=false;VMX.active=true;
  lights();const hp=pose(m,dt);arms(m,dt,hp);
  const vf=58;if(Math.abs(VMX.cam.fov-vf)>.01||VMX.cam.aspect!==camera.aspect){VMX.cam.fov=vf;VMX.cam.near=.012;VMX.cam.aspect=camera.aspect;VMX.cam.updateProjectionMatrix()}
 }catch(e){if(MV.errs++<3)console.warn('[meleevm] fallback to core viewmodel',e);hide();VMX.active=false;if(VM.root)VM.root.visible=true}
 return r};
window.RGMVM=MV;
console.log('[meleevm] melee + fists on the Modern arms');
})();
