/* =====================================================================================================
   MINI FORT ZOMBIE v071 - MAIN MENU WORLD
   Behind the title, main menu, occupation, fort select and menu Options: a dedicated town (fixed seed, so it is the same place
   every launch) under the Doom sky at night, with hand-placed set pieces and a scripted camera that fades between shots:
   a crane over the church, a push-in on the cemetery, a worm's-eye view of the dead walking past, the park corner, the main
   street and the gas station forecourt. Shots are found by building type, so they survive generator changes; any shot whose
   building is missing is skipped.
   - built a moment after the title appears (the illustrated backdrop covers the build, then cross-fades out)
   - the whole thing stops the moment a game, a saved game or a Dev test world starts (their world build clears this one)
   - Options > Graphics > Display > Menu background switches back to the illustrated backdrop (saved: mfz_menuworld)
   Visual only: no AI, no gameplay state. G.time is only forced while no campaign exists (G.day < 1).
   ===================================================================================================== */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const SEED=1408,SHOT=10.5,FADE=1.3;
const MW=window.MENUWORLD={on:false,building:false,built:false,shots:[],actors:[],cur:-1,t:0,enabled:true,err:null};
try{MW.enabled=localStorage.getItem('mfz_menuworld')!=='0'}catch(e){}
const lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function seeded(seed,fn){const o=Math.random;let a=seed>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};try{return fn()}finally{Math.random=o}}
const titleState=()=>typeof G!=='undefined'&&G.mode==='TITLE';
const free=(x,z,h)=>!blocked(x,z,.35,h||0,1.7);

/* ---------------- overlays ---------------- */
const fade=document.createElement('div');fade.id='mwFade';document.body.appendChild(fade);

/* ---------------- build ---------------- */
function build(){if(MW.building||MW.on||MW.built||!MW.enabled||!titleState()||typeof scene==='undefined'||!scene||!renderer)return;MW.building=true;MW.err=null;
 const dayWas=G.day,fortWas=G.fort;
 try{
  G.fort='police';G.mode='EXPEDITION';const ms0=G.mission;G.mission=null;
  const ce=console.error;console.error=function(){if(/TOWN VALIDATION/.test(String(arguments[0])))return;return ce.apply(console,arguments)};   // the generator's own lot warnings are for Dev Mode, not the title screen
  try{seeded(SEED,()=>buildWorld())}finally{console.error=ce;G.mode='TITLE';G.mission=ms0;G.fort=fortWas;G.day=dayWas}
  // the town's own population would just stand there frozen: clear it, the set pieces bring their own dead
  zombies.slice().forEach(z=>scene.remove(z));zombies.length=0;
  (npcList||[]).forEach(n=>{const m=n&&(n.isObject3D?n:(n.m||n.mesh||n.g));if(m&&m.parent)m.parent.remove(m)});
  MW.marker=new THREE.Object3D();MW.marker.name='menuworld';scene.add(MW.marker);
  seeded(SEED+7,()=>makeShots());
  MW.built=true;start();
 }catch(e){MW.err=e;console.warn('[menuworld] build failed, keeping the illustrated backdrop',e);try{clearWorld()}catch(_){}}
 MW.building=false}
/* v075: built step by step behind the title's loading bar (js/game/loader.js); the camera only starts after "Press any key" (MW.startNow) */
function rngOf(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
MW.buildStaged=async function(onP){if(MW.building||MW.on||MW.built||!MW.enabled||!titleState()||typeof scene==='undefined'||!scene||!renderer||typeof worldSteps!=='function')return false;
 MW.building=true;MW.err=null;const dayWas=G.day,fortWas=G.fort,ms0=G.mission,rng=rngOf(SEED),ce=console.error;
 const filt=function(){if(/TOWN VALIDATION/.test(String(arguments[0])))return;return ce.apply(console,arguments)};
 const wrap=fn=>{const o=Math.random,mo=G.mode;Math.random=rng;console.error=filt;G.fort='police';G.mode='EXPEDITION';G.mission=null;   // the same seeded town as the one-shot build: the RNG state carries over between steps
  try{return fn()}finally{Math.random=o;console.error=ce;G.mode=mo;G.mission=ms0;G.fort=fortWas;G.day=dayWas}};
 try{const steps=wrap(()=>worldSteps());await MFZLOAD.run(steps,{wrap,onProgress:onP});
  if(!titleState())throw new Error('left the title while loading');
  zombies.slice().forEach(z=>scene.remove(z));zombies.length=0;
  (npcList||[]).forEach(n=>{const m=n&&(n.isObject3D?n:(n.m||n.mesh||n.g));if(m&&m.parent)m.parent.remove(m)});
  MW.marker=new THREE.Object3D();MW.marker.name='menuworld';scene.add(MW.marker);
  seeded(SEED+7,()=>makeShots());MW.built=true}
 catch(e){MW.err=e;console.warn('[menuworld] staged build failed, keeping the illustrated backdrop',e);try{clearWorld()}catch(_){}}
 MW.building=false;return MW.built};
MW.startNow=function(){if(MW.built&&!MW.on&&titleState())start()};
function start(){MW.on=true;MW.cur=-1;MW.t=SHOT;document.body.classList.add('menuworld');
 MW.fovWas=camera.fov;camera.fov=58;camera.updateProjectionMatrix();camera.children.forEach(c=>{if(!c.isLight){c.userData.mwVis=c.visible;c.visible=false}});
 try{RGATM.force('doom');RGATM.snap()}catch(e){}
 if(!(G.day>=1))G.time=23.6;
 fade.style.opacity='1';next()}
function stop(){if(!MW.on&&!MW.built)return;MW.on=false;MW.built=false;document.body.classList.remove('menuworld');
 if(MW.fovWas){camera.fov=G.fov||MW.fovWas;camera.updateProjectionMatrix()}camera.children.forEach(c=>{if(!c.isLight&&c.userData.mwVis!==undefined){c.visible=c.userData.mwVis;delete c.userData.mwVis}});
 try{RGATM.force(null)}catch(e){}MW.actors=[];MW.shots=[];fade.style.opacity='0';camera.rotation.z=0}

/* ---------------- actors ---------------- */
function actor(x,z,o){o=o||{};const n0=zombies.length;let tries=0;while(!free(x,z)&&tries<20){x+=(Math.random()-.5)*1.5;z+=(Math.random()-.5)*1.5;tries++}
 zombie(x,z,o.kind||(Math.random()<.2?'brute':'walker'),false);if(zombies.length<=n0)return null;const g=zombies[zombies.length-1],u=g.userData;
 u.sleep=false;u.rise=0;u.ragT=0;u.flop=0;u.see=!!o.reach;u.hunt=0;g.rotation.set(0,o.face||0,0);try{if(g.userData.parts&&g.userData.parts.body){const P=g.userData.parts;P.body.rotation.set(0,0,0)}}catch(e){}
 if(o.crawl){try{dismember(g,'legL',x,z);dismember(g,'legR',x,z)}catch(e){}u.crawl=true}
 const a={g,u,home:[g.position.x,g.position.z],path:o.path||null,sp:o.sp||.75,mode:o.path?'walk':'idle',face:o.face||0,k:0,seg:0,ph:Math.random()*6.28};MW.actors.push(a);return a}
function resetActor(a){a.seg=0;a.k=0;const p=a.path?a.path[0]:a.home;a.g.position.set(p[0],0,p[1]);a.u.px=p[0];a.u.pz=p[1];if(!a.path)a.g.rotation.y=a.face}
function stepActor(a,dt){const g=a.g,p=g.position;
 if(a.path&&a.seg<a.path.length-1){const q=a.path[a.seg+1],dx=q[0]-p.x,dz=q[1]-p.z,d=Math.hypot(dx,dz),s=a.sp*dt*(a.u.crawl?.45:1);
  if(d<=s){p.x=q[0];p.z=q[1];a.seg++}else{const nx=p.x+dx/d*s,nz=p.z+dz/d*s;if(free(nx,nz)){p.x=nx;p.z=nz}else{const sx=p.x-dz/d*s,sz=p.z+dx/d*s;if(free(sx,sz)){p.x=sx;p.z=sz}}}
  g.rotation.y=Math.atan2(dx,dz)}
 else if(!a.path){a.ph+=dt;g.rotation.y=a.face+Math.sin(a.ph*.4)*.35}
 p.y=0;try{animZ(g,dt,false)}catch(e){}}

/* ---------------- shots ---------------- */
const bAll=id=>buildings.filter(b=>(b.id||b.t)===id||b.cat===id);
const roadAt=(x,z)=>{const L=window.__fortZombieTown&&__fortZombieTown.layout;return !!(L&&L.roads.some(r=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1))};
function roadSide(b){const s=[[0,1],[0,-1],[1,0],[-1,0]];for(const d of[4,7,10,13])for(const [sx,sz] of s){const x=b.x+sx*(b.w/2+d),z=b.z+sz*(b.d/2+d);if(roadAt(x,z))return[sx,sz]}return null}
function camFree(x,y,z){return !blocked(x,z,.3,Math.max(0,y-.5),.9)}
function nudge(pts,y){return pts.map(([x,z])=>{if(camFree(x,y,z))return[x,z];for(let r=.5;r<4;r+=.5)for(let a=0;a<8;a++){const nx=x+Math.cos(a*.785)*r,nz=z+Math.sin(a*.785)*r;if(camFree(nx,y,nz))return[nx,nz]}return[x,z]})}
function makeShots(){MW.actors=[];const S=[];
 // 1. crane down over a church with the dead milling in the street
 {const b=bAll('church').find(roadSide);if(b){const [sx,sz]=roadSide(b),ox=sz!==0,fx=b.x+sx*(b.w/2+6),fz=b.z+sz*(b.d/2+6),ax=ox?1:0,az=ox?0:1;
  const A=[];for(let i=0;i<7;i++){const o=(i-3)*3.2,x=fx+ax*o+sx*(Math.random()*3-1),z=fz+az*o+sz*(Math.random()*3-1);A.push(actor(x,z,{path:[[x,z],[x-ax*7+sx*.5,z-az*7+sz*.5]],sp:.35+Math.random()*.35,reach:i%3===0}))}
  const [c0,c1]=nudge([[fx+ax*22+sx*9,fz+az*22+sz*9],[fx-ax*8+sx*12,fz-az*8+sz*12]],8);
  S.push({n:'church',f:.45,A,cam:t=>({x:lerp(c0[0],c1[0],ease(t)),y:lerp(15,4.2,ease(t)),z:lerp(c0[1],c1[1],ease(t))}),look:t=>({x:b.x-sx*2,y:lerp(2,4.5,t),z:b.z-sz*2})})}}
 // 2. cemetery corner push-in
 {const b=bAll('cemetery').find(roadSide);if(b){const [sx,sz]=roadSide(b),ox=sz!==0,ex=b.x+sx*b.w/2,ez=b.z+sz*b.d/2,cx=ex-(ox?b.w/2-2:0)*1,cz=ez-(ox?0:b.d/2-2);
  const tx=ox?-1:0,tz=ox?0:-1;   // along the edge
  const k0=[cx+sx*6+tx*-1,cz+sz*6+tz*-1],k1=[cx+sx*3+tx*-5,cz+sz*3+tz*-5],[c0,c1]=nudge([k0,k1],3.5);
  const A=[actor(b.x+(ox?-8:-sx*6),b.z+(ox?-sz*6:6),{face:Math.atan2(sx,sz)}),actor(b.x+(ox?3:-sx*2),b.z+(ox?-sz*2:-3),{face:Math.atan2(sx,sz)+.6,reach:1}),actor(b.x+(ox?-2:sx*7),b.z+(ox?sz*7:2),{face:Math.atan2(sx,sz)-.4})];
  {const x=b.x+(ox?7:-sx*9),z=b.z+(ox?-sz*9:7);A.push(actor(x,z,{path:[[x,z],[ex-sx*2+(ox?-6:0),ez-sz*2+(ox?0:-6)]],sp:.45,reach:1}))}
  // pull the set piece toward the camera corner so the dead read clearly between the headstones
  A.forEach(a=>{if(!a)return;const p=a.g.position,nx=lerp(p.x,c1[0],.42),nz=lerp(p.z,c1[1],.42);if(free(nx,nz)){p.x=nx;p.z=nz;a.home=[nx,nz];if(a.path)a.path[0]=[nx,nz]}});
  S.push({n:'cemetery',f:.35,A,cam:t=>({x:lerp(c0[0],c1[0],ease(t)),y:lerp(4.4,3.3,ease(t)),z:lerp(c0[1],c1[1],ease(t))}),look:t=>({x:b.x+(ox?-3:0),y:.2,z:b.z+(ox?0:-3)})})}}
 // 3. worm's eye: lying in the road as the dead walk past and over you
 {const L=__fortZombieTown.layout,r=L.roads.filter(q=>q.x1-q.x0>q.z1-q.z0).sort((p,q)=>(q.x1-q.x0)-(p.x1-p.x0))[0];if(r){const zc=(r.z0+r.z1)/2;let x0=(r.x0+r.x1)/2+21;for(let i=0;i<30&&!camFree(x0,.4,zc);i++)x0+=2;
  const A=[];[[-1.3,.0],[1.0,2.6],[2.3,5.2],[-.6,7.6]].forEach(([dz,lag],i)=>{const sx=x0-8.5-lag,ex=x0+9;A.push(actor(sx,zc+dz,{path:[[sx,zc+dz],[ex,zc+dz*1.1]],sp:.95+i*.05,reach:i!==1,kind:i===2?'brute':'walker'}))});
  S.push({n:'worm',A,cam:t=>({x:x0+t*.4,y:.34,z:zc+.15}),look:t=>({x:x0-7+t*2.5,y:1.6+t*2.6,z:zc+.2})})}}
 // 4. park corner, a legless one dragging itself through the playground
 {const b=bAll('playground_memorial_park').find(roadSide);if(b){const [sx,sz]=roadSide(b),ox=sz!==0,ex=b.x+(ox?b.w/2-1:sx*b.w/2),ez=b.z+(ox?sz*b.d/2:b.d/2-1);
  const [c0,c1]=nudge([[ex+sx*3.5+(ox?1:0),ez+sz*3.5+(ox?0:1)],[ex+sx*2.5+(ox?-5:0),ez+sz*2.5+(ox?0:-5)]],1.2);
  const A=[actor(b.x+(ox?6:sx*4),b.z+(ox?sz*4:6),{path:[[b.x+(ox?6:sx*4),b.z+(ox?sz*4:6)],[ex+(ox?-3:-sx*2),ez+(ox?-sz*2:-3)]],sp:.5,crawl:1}),
   actor(b.x-(ox?4:0),b.z-(ox?0:4),{face:Math.atan2(sx,sz)}),actor(b.x+(ox?-9:-sx*6),b.z+(ox?-sz*6:-9),{face:Math.atan2(sx,sz)+.8,reach:1})];
  S.push({n:'park',f:.55,A,cam:t=>({x:lerp(c0[0],c1[0],t),y:2.1,z:lerp(c0[1],c1[1],t)}),look:t=>({x:lerp(b.x+(ox?8:0),b.x-(ox?4:0),ease(t)),y:.9,z:lerp(b.z+(ox?0:8),b.z-(ox?0:4),ease(t))})})}}
 // 5. main street dolly, a loose crowd coming the other way
 {const L=__fortZombieTown.layout,r=L.roads.filter(q=>q.x1-q.x0>q.z1-q.z0).sort((p,q)=>Math.abs((p.z0+p.z1)/2)-Math.abs((q.z0+q.z1)/2))[0];if(r){const zc=(r.z0+r.z1)/2,xs=(r.x0+r.x1)/2-58;
  const [c0,c1]=nudge([[xs,r.z0+1.6],[xs+26,r.z0+1.6]],2);const A=[];
  for(let i=0;i<8;i++){const x=xs+20+i*3.6+Math.random()*3,z=r.z0+1+Math.random()*(r.z1-r.z0-2);A.push(actor(x,z,{path:[[x,z],[x-24,z+(Math.random()-.5)*2]],sp:.55+Math.random()*.5,reach:Math.random()<.5,kind:Math.random()<.25?'runner':'walker'}))}
  S.push({n:'street',A,cam:t=>({x:lerp(c0[0],c1[0],t),y:1.9,z:lerp(c0[1],c1[1],t)}),look:t=>({x:lerp(c0[0],c1[0],t)+18,y:1.4,z:zc+.5})})}}
 // 6. gas station forecourt at night
 {const b=bAll('eco_pump').find(roadSide)||bAll('eco_pump')[0];if(b){const rs=roadSide(b)||[0,1],[sx,sz]=rs,ox=sz!==0,fx=b.x+sx*(b.w/2+5),fz=b.z+sz*(b.d/2+5);
  const [c0,c1]=nudge([[fx+(ox?14:sx*3),fz+(ox?sz*3:14)],[fx+(ox?6:sx*1),fz+(ox?sz*1:6)]],1.6);
  const A=[actor(b.x+(ox?2:sx*(b.w/2+1.2)),b.z+(ox?sz*(b.d/2+1.2):2),{face:Math.atan2(-sx,-sz)}),
   (()=>{const x=fx+(ox?-12:0),z=fz+(ox?0:-12);return actor(x,z,{path:[[x,z],[fx+(ox?8:sx*.5),fz+(ox?sz*.5:8)]],sp:.6,reach:1})})(),
   (()=>{const x=fx+(ox?-4:sx*3),z=fz+(ox?sz*3:-4);return actor(x,z,{path:[[x,z],[fx+(ox?10:sx*4),fz+(ox?sz*4:10)]],sp:.45})})(),actor(b.x-(ox?6:0)+sx*(b.w/2+2.5),b.z-(ox?0:6)+sz*(b.d/2+2.5),{face:Math.atan2(sx,sz),reach:1})];
  S.push({n:'gas',f:.3,A,cam:t=>({x:lerp(c0[0],c1[0],ease(t)),y:1.65,z:lerp(c0[1],c1[1],ease(t))}),look:t=>({x:b.x,y:1.6,z:b.z})})}}
 S.forEach(s=>s.A=s.A.filter(Boolean));
 // a few loners far in the background of every shot so the town never looks empty
 MW.shots=S;MW.order=[0,1,2,3,4,5].filter(i=>i<S.length);console.log('[menuworld] '+S.length+' shots: '+S.map(s=>s.n).join(', ')+', '+MW.actors.length+' set-piece zombies')}
function next(){if(!MW.shots.length)return;MW.cur=(MW.cur+1)%MW.shots.length;MW.t=0;const s=MW.shots[MW.cur];s.A.forEach(resetActor)}
function place(s,t){const k=Math.min(1,t/SHOT),c=s.cam(k),l=Object.assign({},s.look(k)),tm=performance.now()/1000;
 if(s.f&&s.A.length){let ax=0,az=0;s.A.forEach(a=>{ax+=a.g.position.x;az+=a.g.position.z});ax/=s.A.length;az/=s.A.length;l.x=lerp(l.x,ax,s.f);l.z=lerp(l.z,az,s.f);l.y=lerp(l.y,1.1,s.f*.6)}
 const hx=Math.sin(tm*.9)*.05+Math.sin(tm*2.3)*.015,hy=Math.sin(tm*1.3)*.035;
 pl.position.set(c.x+hx,c.y+hy,c.z);const dx=l.x-c.x,dy=l.y-c.y,dz=l.z-c.z,h=Math.hypot(dx,dz);
 yaw=Math.atan2(-dx,-dz);pitch=Math.atan2(dy,h);pl.rotation.y=yaw;camera.rotation.x=pitch;camera.rotation.z=Math.sin(tm*.5)*.012}

/* ---------------- frame loop ---------------- */
let last=performance.now();
function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 if(MW.on&&(!titleState()||!MW.marker||MW.marker.parent!==scene)){stop();return}
 if(!MW.on){if(window.MFZLOAD&&!MFZLOAD.passed)return;if(MW.built&&!MW.building&&titleState()){start();return}if(MW.enabled&&titleState()&&!MW.building&&!(window.DEV&&DEV.on)&&document.body.dataset.scr&&document.body.dataset.scr!=='dev'&&(MW.queued===undefined||now>MW.queued)){MW.queued=now+1e9;setTimeout(()=>{MW.queued=undefined;if(titleState()&&!MW.on)build()},450)}return}
 if(!(G.day>=1))G.time=23.6;
 try{lighting()}catch(e){}
 if(MW.freeze)return;
 const s=MW.shots[MW.cur];if(!s)return;MW.t+=dt;
 place(s,MW.t);
 for(const a of s.A)stepActor(a,dt);
 const fIn=Math.min(1,MW.t/FADE),fOut=Math.min(1,(SHOT-MW.t)/FADE);fade.style.opacity=String(1-Math.min(fIn,fOut));
 if(MW.t>=SHOT)next()}
requestAnimationFrame(loop);
/* debug / screenshots: jump to shot i at time t (seconds) */
MW.jump=function(i,t){if(!MW.on)return false;MW.cur=i-1;next();const s=MW.shots[MW.cur];place(s,0);for(let x=0;x<t;x+=1/30)s.A.forEach(a=>stepActor(a,1/30));MW.t=t;place(s,t);s.A.forEach(a=>stepActor(a,0.0001));fade.style.opacity='0';return s.n};

/* ---------------- option: Graphics > Display > Menu background ---------------- */
function optRow(){const pg=document.querySelector('#optG .gPage[data-g="disp"]');if(!pg||$('mwOpt'))return;const r=document.createElement('div');r.className='optRow';r.id='mwOpt';
 r.innerHTML='<span>Menu background</span><div class="seg"><button data-v="1">Live 3D town</button><button data-v="0">Illustrated</button></div><div class="note">Live 3D builds a small night-time town behind the menus. Illustrated is lighter on slow machines.</div>';
 const sync=()=>r.querySelectorAll('button').forEach(b=>b.classList.toggle('on',(b.dataset.v==='1')===MW.enabled));
 r.querySelectorAll('button').forEach(b=>b.onclick=()=>{MW.enabled=b.dataset.v==='1';try{localStorage.setItem('mfz_menuworld',MW.enabled?'1':'0')}catch(e){}sync();if(!MW.enabled&&MW.on){stop();try{clearWorld()}catch(e){}}});
 sync();pg.appendChild(r)}
const _ot=window.optTab;window.optTab=function(t){const r=_ot.apply(this,arguments);if(t==='G'||(!t&&document.querySelector('#optMain .mbtn.on[data-t="G"]')))setTimeout(optRow,0);return r};
console.log('[menuworld] main menu world ready');
})();
