/* =====================================================================================================
   MINI FORT ZOMBIE v075 - LOADING SCREENS
   A progress bar made of zombie silhouettes that fill in blood red as the world is built step by step (core worldSteps(), one step a frame).
   - Title: the menu town builds behind the title while the bar fills. "Press any key" only appears once it is done. The menu town camera
     and the menu music only start after that key press.
   - Mission: after the drive to the pin, the "Loading map" screen shows the same bar while the mission town is built, then "Press any key".
     That key press locks the mouse, so the game starts straight away instead of on the pause screen.
   API: MFZLOAD.run(steps, {wrap, onProgress}) runs [label, fn, weight] steps a frame apart; MFZLOAD.bar() makes a bar; MFZLOAD.mission(after).
   ===================================================================================================== */
(function(){
'use strict';
const L=window.MFZLOAD={ready:false,passed:false};

/* ---------------- the zombie silhouettes (three poses in one 132 x 60 tile) ---------------- */
const FIG=`<circle cx="22" cy="8" r="5.5"/><path d="M16 15L26 14L29 35L17 36Z"/><path d="M22 16L40 19L40 23L21 21Z"/><path d="M19 20L37 25L36 28.5L18 25Z"/><path d="M17 34L22 34L15 58L10 58Z"/><path d="M21 34L26 33L31 58L26 58Z"/>
<g transform="translate(44 0)"><circle cx="27" cy="12" r="5.5"/><path d="M14 17L27 16L28 37L16 37Z"/><path d="M24 19L39 27L37 30.5L22 23Z"/><path d="M14 18L19 18L17 37L12.5 36Z"/><path d="M16 36L21 36L19 58L14 58Z"/><path d="M22 36L27 36L34 57L29 58Z"/></g>
<g transform="translate(88 0)"><circle cx="19" cy="9" r="5.5"/><path d="M14 15L25 16L26 36L16 36Z"/><path d="M22 17L37 11L38 14.5L23 21Z"/><path d="M18 19L34 21L34 24.5L18 23Z"/><path d="M16 35L21 35L20 58L15 58Z"/><path d="M21 35L26 35L35 56L30 58Z"/></g>`;
const svg=col=>'url("data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="132" height="60" viewBox="0 0 132 60"><g fill="${col}">${FIG}</g></svg>`)+'")';
const BACK=svg('rgba(230,223,207,.13)'),FILL=svg('#c1281d');   /* layout CSS lives in css/ui.css (present from the first paint) */

L.bar=function(){const el=document.createElement('div');el.className='zl';
 el.innerHTML='<div class="zlBar"><div class="zlBack"></div><div class="zlFill"></div></div><div class="zlTxt"><span class="zlLab"></span><span class="zlPct">0%</span></div>';
 const fill=el.querySelector('.zlFill'),lab=el.querySelector('.zlLab'),pct=el.querySelector('.zlPct');el.querySelector('.zlBack').style.backgroundImage=BACK;fill.style.backgroundImage=FILL;let shown=0,target=0,raf=0;
 const tick=()=>{raf=0;shown+=(target-shown)*.25;if(Math.abs(target-shown)<.002)shown=target;fill.style.width=(shown*100).toFixed(2)+'%';pct.textContent=Math.round(shown*100)+'%';if(shown!==target)raf=requestAnimationFrame(tick)};
 return{el,set(f,l){target=Math.max(target,Math.min(1,f));if(l!==undefined)lab.textContent=l;if(!raf)raf=requestAnimationFrame(tick)},
  reset(){shown=target=0;fill.style.width='0%';pct.textContent='0%';lab.textContent=''},snap(){shown=target;tick()}}};

/* ---------------- run build steps a frame apart ---------------- */
const nextFrame=()=>new Promise(r=>{let d=0;const f=()=>{if(!d){d=1;setTimeout(r,0)}};requestAnimationFrame(f);setTimeout(f,80)});   // rAF lets the bar paint; the timeout keeps loading going in a background tab
/* the last step compiles every shader the new world needs, so the first frame after "Press any key" does not stall */
const WARM=['Warming up shaders',()=>{try{if(typeof renderer!=='undefined'&&renderer&&scene)renderer.compile(scene,camera)}catch(e){console.warn('[loader] shader warm-up',e)}},4];
L.run=async function(steps,o){o=o||{};L.busy=true;try{return await runSteps(steps.concat([WARM]),o)}finally{L.busy=false}};
async function runSteps(steps,o){const wrap=o.wrap||(f=>f()),on=o.onProgress||(()=>{});const W=steps.reduce((a,s)=>a+(s[2]||1),0);let done=0;
 for(const s of steps){let lab='';try{lab=typeof s[0]==='function'?s[0]():s[0]}catch(e){}on(done/W,lab);await nextFrame();wrap(s[1]);done+=s[2]||1}
 on(1,'Ready');await nextFrame()}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------------- title screen ---------------- */
async function boot(){
 const t=document.getElementById('title');
 if(!t||typeof scrNow==='undefined'||scrNow!=='title'||typeof renderer==='undefined'||!renderer){setTimeout(boot,60);return}
 const b=L.bar(),slot=t.querySelector('.zlSlot')||t.querySelector('.press').parentNode;t.classList.add('zlLoading');slot.insertBefore(b.el,slot.firstChild);b.set(0,'Waking the dead');
 let ok=false;try{if(window.MENUWORLD&&MENUWORLD.buildStaged)ok=await MENUWORLD.buildStaged((f,l)=>b.set(f*.97,l))}catch(e){console.warn('[loader] menu town',e)}
 if(!ok){for(let i=1;i<=10;i++){b.set(i/10,'Waking the dead');await sleep(45)}}   // illustrated menu background (or a failed build): nothing to build
 b.set(1,'Ready');await sleep(350);
 L.ready=true;t.classList.remove('zlLoading');t.classList.add('zlReady');console.log('[loader] title ready');
}
/* called by core titleAny() once the title is dismissed: start the menu town camera and the menu music */
L.passTitle=function(){if(L.passed)return;L.passed=true;try{if(window.MENUWORLD&&MENUWORLD.startNow)MENUWORLD.startNow()}catch(e){console.warn(e)}try{if(window.MENUMUSIC&&MENUMUSIC.kick)MENUMUSIC.kick()}catch(e){}};
boot();

/* ---------------- mission loading screen ---------------- */
let ov=null;
function overlay(){if(ov)return ov;const el=document.createElement('div');el.id='zlMis';el.innerHTML='<h2>Loading map...</h2><div class="zlPress">Press any key</div>';
 const b=L.bar();el.insertBefore(b.el,el.querySelector('.zlPress'));document.body.appendChild(el);return ov={el,b}}
/* build the mission town step by step behind the black screen, then go() (which skips the build), then wait for a key / click to lock the mouse */
L.mission=async function(mode,after){mode=mode||'EXPEDITION';const o=overlay();o.b.reset();o.el.classList.remove('ready','out');o.el.classList.add('on');o.b.set(0,'Driving in');
 if(typeof G!=='undefined'&&G.siegeDue){try{go(mode)}finally{if(after)after()}o.el.classList.remove('on');return}   // the horde comes first: go() starts the siege instead
 const wrap=fn=>{const pm=G.mode;G.mode=mode;try{return fn()}finally{G.mode=pm}};
 try{const steps=wrap(()=>worldSteps());await L.run(steps,{wrap,onProgress:(f,l)=>o.b.set(f,l)});WB.prebuilt=true}
 catch(e){console.error('[loader] mission build failed, building it in one go',e);WB.prebuilt=false}
 try{go(mode)}catch(e){console.error('[loader] go',e)}finally{WB.prebuilt=false;if(after)try{after()}catch(e){}}
 o.b.snap();o.el.classList.add('ready');
 await new Promise(res=>{const done=e=>{if(e.type==='keydown'&&(e.code==='Escape'||e.repeat))return;removeEventListener('keydown',done,true);o.el.removeEventListener('pointerdown',done);
   try{lock()}catch(_){}res()};addEventListener('keydown',done,true);o.el.addEventListener('pointerdown',done)});
 o.el.classList.add('out');setTimeout(()=>o.el.classList.remove('on','out','ready'),520)};
console.log('[loader] loading screens ready');
})();
