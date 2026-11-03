/* ==========================================================================================================
   MINI FORT ZOMBIE - STEALTH EYE (v063)
   While crouched, a white eye silhouette frames the crosshair: closed while no zombie is hunting you, open (with an open / close
   animation) while one is. "Hunting" = a zombie that sees you, is tracking your last known position, or is attacking (always in a siege).
   Lives inside #hud, so it hides with the HUD (menus, inventory, travel).
   ========================================================================================================== */
(function(){
'use strict';
const hud=document.getElementById('hud');if(!hud)return;
const el=document.createElement('div');el.id='stEye';
el.style.cssText='position:absolute;top:50%;left:50%;width:76px;height:46px;margin:-23px 0 0 -38px;pointer-events:none;opacity:0;transition:opacity .2s;filter:drop-shadow(0 0 2px rgba(0,0,0,.85))';
el.innerHTML=`<svg viewBox="-38 -23 76 46" width="76" height="46" style="overflow:visible">
 <g id="stOpen" style="transform-origin:0 0;transition:transform .22s ease-in-out,opacity .2s">
  <path d="M-34 0 Q0 -26 34 0 Q0 26 -34 0 Z" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/>
  <circle r="9.5" fill="none" stroke="#fff" stroke-width="2.4"/><circle r="4" fill="#fff"/>
 </g>
 <g id="stShut" style="transition:opacity .18s">
  <path d="M-34 0 Q0 15 34 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M-20 6.5 L-24 13 M-7 9.4 L-8.5 16.5 M7 9.4 L8.5 16.5 M20 6.5 L24 13" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
 </g></svg>`;
hud.appendChild(el);
const op=el.querySelector('#stOpen'),sh=el.querySelector('#stShut');let open=-1,k=0;
function hunted(){if(typeof G==='undefined')return false;if(G.mode==='SIEGE')return true;if(typeof zombies==='undefined')return false;
 for(const z of zombies){const u=z.userData;if(u.sleep||u.rise>0)continue;if(u.see||u.hunt>0||u.atk)return true}return false}
function tick(){try{const on=typeof playing==='function'&&playing()&&!!G.crouch;el.style.opacity=on?'1':'0';
  if(on){const h=hunted()?1:0;if(h!==open){open=h;op.style.transform='scaleY('+(h?1:.06)+')';sh.style.opacity=h?'0':'1';op.style.opacity=h?'1':'0'}}}catch(e){}requestAnimationFrame(tick)}
op.style.transform='scaleY(.06)';op.style.opacity='0';
requestAnimationFrame(tick);
window.RGSTEALTH={hunted};
})();
