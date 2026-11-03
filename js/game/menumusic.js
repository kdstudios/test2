/* =====================================================================================================
   MINI FORT ZOMBIE v071 - MAIN MENU MUSIC (assets/audio/FZTrioxin.mp3)
   Loops on the title, main menu, occupation, fort select and menu Options. Fades out and stops as soon as you are in the game:
   starting a fort, loading a save, or opening Dev Mode. Comes back (from the top) when you return to the main menu.
   Volume: Options > Sound > Menu music volume (x Master), shown only in the main menu's Options; separate from Game music volume. While it plays, the game's own procedural menu notes are muted.
   Browsers only allow audio after the first key press / click, so it starts with "Press any key".
   ===================================================================================================== */
(function(){
'use strict';
const A=new Audio('assets/audio/FZTrioxin.mp3');A.loop=true;A.preload='auto';A.volume=0;
const MM=window.MENUMUSIC={audio:A,vol:0,playing:false,blocked:false};
let stoppedAt=0;
function want(){if(typeof G==='undefined')return false;if(window.MFZLOAD&&!MFZLOAD.passed)return false;if(performance.now()<(MM.notBefore||0))return false;   /* v075: silent until the title's "Press any key" */
 if(G.mode!=='TITLE')return false;if(window.DEV&&DEV.on)return false;if(typeof scrNow!=='undefined'&&scrNow==='dev')return false;return true}
/* menu music has its own volume (Options > Sound on the main menu only), separate from the in-game music volume */
let MMV=.6;try{const v=parseFloat(localStorage.getItem('mfz_menumusic'));if(isFinite(v))MMV=Math.max(0,Math.min(1,v))}catch(e){}
function target(){const m=typeof MSV!=='undefined'?MSV:1;return Math.max(0,Math.min(1,m*MMV))}
{const r=document.getElementById('mmvol'),l=document.getElementById('mmv');if(r){r.value=Math.round(MMV*100);if(l)l.textContent=Math.round(MMV*100)+'%';
 r.addEventListener('input',()=>{MMV=(+r.value)/100;if(l)l.textContent=r.value+'%';try{localStorage.setItem('mfz_menumusic',String(MMV))}catch(e){}})}}
function tryPlay(){if(MM.playing||!want())return;if(stoppedAt&&performance.now()-stoppedAt>4000)A.currentTime=0;
 MM.vol=target();A.volume=MM.vol;const p=A.play();MM.playing=true;   /* v075: starts at full volume, no fade-in */
 if(p&&p.catch)p.catch(()=>{MM.playing=false;MM.blocked=true})}
['pointerdown','keydown','click'].forEach(t=>addEventListener(t,()=>{MM.blocked=false;tryPlay()},true));
MM.kick=function(){MM.blocked=false;MM.notBefore=performance.now()+1000;A.currentTime=0;A.volume=0;setTimeout(tryPlay,1000)};   /* v075: the track starts 1 s after the title's key press */
let lastT=performance.now();
setInterval(()=>{{const row=document.getElementById('mmRow');if(row)row.classList.toggle('hide',typeof optFrom==='undefined'||optFrom!=='menu')}const now=performance.now(),dt=Math.min(2,(now-lastT)/1000);lastT=now;const w=want(),tv=w?target():0;
 if(w&&!MM.playing&&!MM.blocked)tryPlay();
 if(!MM.playing)MM.vol=0;
 MM.vol+=(tv-MM.vol)*(1-Math.exp(-dt/(w?.45:.3)));if(Math.abs(tv-MM.vol)<.004)MM.vol=tv;A.volume=Math.max(0,Math.min(1,MM.vol));
 if(!w&&MM.playing&&MM.vol<.01){A.pause();MM.playing=false;stoppedAt=performance.now()}
 // mute the procedural menu notes while the track is up, hand the music bus back afterwards
 try{if(typeof MUS!=='undefined'&&MUS&&typeof AC!=='undefined'&&AC){const g=MM.playing?0:(typeof MV!=='undefined'?MV:.6);if(Math.abs(MUS.gain.value-g)>.01)MUS.gain.setTargetAtTime(g,AC.currentTime,.3)}}catch(e){}
},50);
console.log('[music] main menu track ready');
})();
