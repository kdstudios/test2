/* ==========================================================================================================
   MINI FORT ZOMBIE - CHAIN-LINK LAYER
   MFZ draws the wire fences around lots (Krasche & Burns, Water Tower, "chain" yard enclosures) as a 35-40 % transparent
   grey box, which reads as a ghost wall. This converts each one to a real chain-link panel (the same diamond mesh used for
   the map border) with a top rail. The original box stays in place, invisible, so the collider, bullets and zombie
   pathing behave exactly as before. Runs inside RGW.decor, just before the world is merged.
   ========================================================================================================== */
(function(){
'use strict';
const W=window.RGW;if(!W)return;
const T=THREE;let TEX=null;const MATS={};
function wireTex(){
 if(TEX)return TEX;const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d');
 q.strokeStyle='#d4d8dc';q.lineWidth=3;q.lineCap='round';
 for(let i=-128;i<256;i+=32){q.beginPath();q.moveTo(i,0);q.lineTo(i+128,128);q.stroke();q.beginPath();q.moveTo(i+128,0);q.lineTo(i,128);q.stroke()}
 q.strokeStyle='rgba(60,64,70,.55)';q.lineWidth=1;for(let i=-128;i<256;i+=32){q.beginPath();q.moveTo(i+2,2);q.lineTo(i+130,130);q.stroke()}
 TEX=new T.CanvasTexture(c);TEX.wrapS=TEX.wrapT=T.RepeatWrapping;TEX.anisotropy=8;return TEX;
}
function panelMat(rx,ry){
 const k=Math.round(rx*2)+'x'+Math.round(ry*2);if(MATS[k])return MATS[k];
 const t=wireTex().clone();t.needsUpdate=true;t.repeat.set(Math.max(1,Math.round(rx)),Math.max(1,Math.round(ry)));
 return MATS[k]=new T.MeshLambertMaterial({map:t,transparent:true,alphaTest:.35,side:T.DoubleSide});
}
const N={panels:0};
function convert(){
 N.panels=0;const hits=[];
 scene.traverse(o=>{
  if(!o.isMesh||!o.geometry||o.geometry.type!=='BoxGeometry'||o.userData.rgChain)return;
  const m=o.material;if(!m||!m.transparent||!m.color||m.color.getHex()!==0x8a8f94)return;
  const op=m.opacity;if(!(Math.abs(op-.35)<.01||Math.abs(op-.4)<.01))return;hits.push(o)});
 for(const o of hits){
  const p=o.geometry.parameters,w=p.width,h=p.height,d=p.depth,along=w>=d?w:d,par=o.parent||scene;
  o.userData.rgChain=1;o.visible=false;                      // collider box stays, ghost wall goes
  const pl=new T.Mesh(new T.PlaneGeometry(along,h),panelMat(along/1.0,h/1.0));
  pl.position.copy(o.position);pl.rotation.copy(o.rotation);if(d>w)pl.rotation.y+=Math.PI/2;
  pl.userData.rgChain=1;pl.raycast=function(){};par.add(pl);
  // top rail (merges with the building group)
  const r=mesh(new T.CylinderGeometry(.045,.045,along,6),0x8a8f94,o.position.x,o.position.y+h/2-.02,o.position.z,par);
  if(d>w)r.rotation.x=Math.PI/2;else r.rotation.z=Math.PI/2;r.rotation.y+=o.rotation.y;
  N.panels++;
 }
}
const od=W.decor;
W.decor=function(){od.apply(this,arguments);try{convert();if(N.panels)console.log('[chainlink] '+N.panels+' ghost fences converted')}catch(e){console.warn('[chainlink] failed',e)}};
window.RGCHAIN={convert,stats:N};
console.log('[chainlink] layer ready');
})();
