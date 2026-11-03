/* ==========================================================================================================
   MINI FORT ZOMBIE - ZOMBIE CLIMBING (v071)
   A zombie that is hunting something and stops making progress because an obstacle is in the way climbs over it:
   hands up the face, belly over the top, then drops down the far side (or stays on top when its target is up there).
   Climbable: fences and border walls, containers, cars, crates, barriers, furniture... anything with collision EXCEPT the walls
   of buildings (tagged at build time), doors, windows and barricades - those are still bashed or routed around as before.
   Zombies standing on top of something can walk along it and drop off the edge with a short fall instead of teleporting down.
   Hooks: addSolid (tags building walls), zMove (stuck detection), stepVault (drives the climb while u.vs is set, which keeps the
   core AI paused exactly like a vault), animZ (climb poses, applied after the loose-locomotion layer), killZ (clean up).
   ========================================================================================================== */
(function(){
'use strict';
if(typeof zMove!=='function'||typeof stepVault!=='function'||typeof animZ!=='function'){console.warn('[zclimb] core hooks missing');return}
const ZC=window.ZCLIMB={on:true,maxH:4.4,stuckT:.9,stats:{climbs:0,tops:0,drops:0}};
const clamp=(v,a,b)=>v<a?a:v>b?b:v,ease=t=>t*t*(3-2*t);

/* ---- 1. building walls are not climbable: tag every collision box made from a mesh that belongs straight to a building group ---- */
const _as=addSolid;
/* v076: only real walls and roof/floor slabs count. Before, every box in a building group was tagged, and open lots (skatepark, parks, car lot...)
   are building groups too, so their ramps, ledges, platforms and benches could never be climbed while a car next to them could. */
function wallish(m){const g=m.geometry,p=g&&g.parameters;if(!p||g.type!=='BoxGeometry')return false;const s=m.scale,h=p.height*s.y,w=p.width*s.x,d=p.depth*s.z,thin=Math.min(w,d),big=Math.max(w,d);
 return (h>=2&&thin<=.6&&big>=.9)||(m.position.y>=2.3&&h<=.6&&big>=2.5)}
addSolid=function(m,box){const b=_as.apply(this,arguments);try{const u=m&&m.parent&&m.parent.userData;if(b&&m&&m.isMesh&&u&&(u.bwall||(u.bw&&u.bh>=1&&wallish(m))))b.bld=1}catch(e){}return b};
const climbable=b=>b&&!b.bld&&!b.door&&!b.win&&!b.bar&&isFinite(b.max.y);
function topAt(x,z,fy){   // highest collision top in a 0.3 m column above fy (what a climber has to get over at this spot)
 let top=-1,hit=null;for(let h=fy;h<fy+ZC.maxH+.5;h+=.25){const b=blocked(x,z,.28,h,.24);if(!b)continue;if(!climbable(b))return{bad:b};hit=b;if(b.max.y>top)top=b.max.y}
 return hit?{top,b:hit}:null}
const inBounds=(x,z)=>typeof BND==='undefined'||(x>BND[0]+1.2&&x<BND[1]-1.2&&z>BND[2]+1.2&&z<BND[3]-1.2);

/* ---- 2. plan a climb along (dx,dz) ---- */
function plan(z,u,dx,dz,tgtY){const p=z.position,l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const fy=p.y;
 let edge=null,far=null,top=0;
 for(let k=.3;k<=7;k+=.2){const x=p.x+dx*k,zz=p.z+dz*k;
  if(!edge){const t=topAt(x,zz,fy);if(!t){if(k>2.6)return null;continue}if(t.bad)return null;edge=k;top=t.top;continue}
  const t=topAt(x,zz,fy);if(t&&t.bad)return null;
  if(t){top=Math.max(top,t.top);continue}
  far=k;break}
 if(!edge)return null;const h=top-fy;if(h<.45||h>ZC.maxH)return null;
 const ex=p.x+dx*(edge-.35),ez=p.z+dz*(edge-.35);
 // stay on top when the target is up there (or there is no way down within reach)
 const wantTop=tgtY!==undefined&&tgtY>fy+.8&&Math.abs(tgtY-top)<.7;
 if(far===null||wantTop){const k=edge+.55,x=p.x+dx*k,zz=p.z+dz*k,g=groundAt(x,zz,top+.1);if(Math.abs(g-top)>.35||blocked(x,zz,.28,top+.05,1.6))return null;
  return{ex,ez,ox:x,oz:zz,lx:x,lz:zz,top,ly:top,onTop:1}}
 const lx=p.x+dx*(far+.35),lz=p.z+dz*(far+.35);if(!inBounds(lx,lz))return null;
 const ly=groundAt(lx,lz,fy+.5);if(blocked(lx,lz,.3,ly,1.8))return null;
 return{ex,ez,ox:p.x+dx*(far-.25),oz:p.z+dz*(far-.25),lx,lz,top,ly}}
function begin(z,u,c){const p=z.position;c.sx=p.x;c.sz=p.z;c.sy=p.y;c.t=0;c.ph=0;
 const h=c.top-c.sy;c.d1=.35+h*.55*(u.run?.7:1);c.d2=.25+Math.hypot(c.ox-c.ex,c.oz-c.ez)*.45;c.d3=c.onTop?0:Math.max(.25,Math.sqrt(2*Math.max(.1,c.top-c.ly)/9.8)+.1);
 u.clb=c;u.vs=[p.x,p.z];u.atk=null;u.stk=0;z.lookAt(c.lx,p.y,c.lz);ZC.stats.climbs++;if(c.onTop)ZC.stats.tops++;try{S.snarl(p)}catch(e){}}
function beginDrop(z,u,x,zz,gy){const p=z.position;u.clb={drop:1,sx:p.x,sz:p.z,sy:p.y,ex:p.x,ez:p.z,ox:p.x,oz:p.z,lx:x,lz:zz,top:p.y,ly:gy,t:0,ph:2,d1:0,d2:0,d3:Math.max(.22,Math.sqrt(2*(p.y-gy)/9.8)+.08)};u.vs=[p.x,p.z];ZC.stats.drops++}

/* ---- 3. drive the climb (core calls stepVault while u.vs is set and skips all other AI for that zombie) ---- */
const _sv=stepVault;
stepVault=function(o,u,dt){const c=u.clb;if(!c)return _sv.apply(this,arguments);const p=o.position;c.t+=dt;
 if(c.ph===0){const k=clamp(c.t/c.d1,0,1),e=ease(k);p.x=c.sx+(c.ex-c.sx)*Math.min(1,k*2.5);p.z=c.sz+(c.ez-c.sz)*Math.min(1,k*2.5);p.y=c.sy+(c.top+.05-c.sy)*e;if(k>=1){c.ph=1;c.t=0}}
 else if(c.ph===1){const k=clamp(c.t/c.d2,0,1);p.x=c.ex+(c.ox-c.ex)*k;p.z=c.ez+(c.oz-c.ez)*k;p.y=c.top+.05+Math.sin(k*Math.PI)*.08;if(k>=1){if(c.onTop){p.y=c.ly;end(o,u);return}c.ph=2;c.t=0;c.fx=p.x;c.fz=p.z}}
 else{const k=clamp(c.t/c.d3,0,1),sx=c.drop?c.sx:c.fx,sz=c.drop?c.sz:c.fz;p.x=sx+(c.lx-sx)*Math.min(1,k*1.6);p.z=sz+(c.lz-sz)*Math.min(1,k*1.6);p.y=c.top+(c.ly-c.top)*k*k;
  if(k>=1){p.y=c.ly;c.land=.28;end(o,u);return}}};
function end(o,u){const c=u.clb;u.vs=null;u.vt=0;u.clb=null;u.cbest=undefined;u.ct=0;if(c&&c.land)u.landT=c.land;u.px=o.position.x;u.pz=o.position.z}

/* ---- 4. stuck detection on top of the core movement ---- */
const _zm=zMove;
zMove=function(z,u,p,dt,best,tp,useField){
 if(!ZC.on||u.crawl)return _zm.apply(this,arguments);
 const x0=p.x,z0=p.z,y0=p.y;_zm.apply(this,arguments);
 // walking off something tall: fall instead of snapping to the ground
 if(y0>.6){const g=groundAt(p.x,p.z,y0+.3);if(g<y0-.6){const fx=p.x,fz=p.z;p.x=x0;p.z=z0;p.y=y0;beginDrop(z,u,fx+(fx-x0)*2,fz+(fz-z0)*2,groundAt(fx+(fx-x0)*2,fz+(fz-z0)*2,y0-.6));return}}
 const tgtY0=tp===pl.position?pl.position.y-(G.eyeUsed||1.6):(tp.y||0);
 if((best<1.6&&!(tgtY0>p.y+.8))||u.atk||u.tk)return;   // v072: a target standing on top of something right above still counts as 'not there yet'
 // progress toward the target: if it stalls while something climbable is in the way, go over it
 if(u.cbest===undefined||best<u.cbest-.35){u.cbest=best;u.ct=0;return}
 u.ct=(u.ct||0)+dt;if(u.ct<ZC.stuckT)return;u.ct=ZC.stuckT*.5;
 let wx=tp.x,wz=tp.z;const zr=u.zp&&u.zp.pts&&u.zp.pts[u.zp.i];if(zr){wx=zr.x;wz=zr.z}else if(useField&&typeof NAV!=='undefined'&&NAV.ok){const n=navNext(p.x,p.z);if(n){wx=n.x;wz=n.z}}   // v072: the zpath waypoint
 const tgtY=tp===pl.position?pl.position.y-(G.eyeUsed||1.6):(tp.y||0);
 let c=plan(z,u,wx-p.x,wz-p.z,tgtY);
 if(!c&&(wx!==tp.x||wz!==tp.z))c=plan(z,u,tp.x-p.x,tp.z-p.z,tgtY);
 if(c){begin(z,u,c);u.cbest=undefined}};

/* v072: zpath's unstick asks for a climb straight away when the scenery has the zombie pinned */
ZC.tryClimb=function(z,u,dx,dz,tgtY){if(!ZC.on||u.crawl||u.vs||u.tk)return false;const c=plan(z,u,dx,dz,tgtY);if(!c)return false;begin(z,u,c);u.cbest=undefined;return true};

/* ---- 5. poses ---- */
const _an=animZ;
animZ=function(z,dt,horde){_an.apply(this,arguments);const u=z.userData,P=u.parts;if(!P||!z.visible)return;
 if(u.landT>0&&!u.clb){u.landT-=dt;const k=Math.max(0,u.landT)/.28;if(P.body){P.body.position.y=.9-.22*k;P.body.rotation.x+=.5*k}P.legL.rotation.x=P.legR.rotation.x=-.6*k;return}
 const c=u.clb;if(!c)return;const t=performance.now()/1000*(u.run?10:7.5),s=Math.sin(t),k=c.ph===0?clamp(c.t/c.d1,0,1):c.ph===1?clamp(c.t/c.d2,0,1):clamp(c.t/c.d3,0,1);
 const set=(o,x,zr)=>{if(!o)return;o.rotation.x=x;if(zr!==undefined)o.rotation.z=zr};
 if(c.ph===0){   // hand over hand up the face, knees driving
  set(P.armL,-2.75+s*.45,.12);set(P.armR,-2.75-s*.45,-.12);set(P.elL,-.55-Math.max(0,s)*.6);set(P.elR,-.55-Math.max(0,-s)*.6);
  set(P.legL,-1.05+s*.55,.06);set(P.legR,-1.05-s*.55,-.06);if(P.body){P.body.rotation.x=.18;P.body.position.y=.9}set(P.head,-.55)}
 else if(c.ph===1){   // belly over the top, dragging the legs after
  if(P.body){P.body.rotation.x=1.05-k*.3;P.body.position.y=.72}set(P.armL,-1.5+s*.35,.25);set(P.armR,-1.5-s*.35,-.25);set(P.elL,-.4);set(P.elR,-.4);
  set(P.legL,.7+s*.25,.1);set(P.legR,.55-s*.25,-.1);set(P.head,-.75)}
 else{   // drop: arms thrown up, legs bracing
  if(P.body){P.body.rotation.x=.35;P.body.position.y=.9}set(P.armL,-2.2-s*.25,.45);set(P.armR,-2.2+s*.25,-.45);set(P.elL,-.3);set(P.elR,-.3);
  set(P.legL,-.55*k,.12);set(P.legR,-.35*k,-.12);set(P.head,-.2)}};

/* ---- 6. death / cleanup ---- */
const _kz=killZ;
killZ=function(z){try{const u=z&&z.userData;if(u&&u.clb){u.clb=null;u.vs=null}}catch(e){}return _kz.apply(this,arguments)};
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){ZC.stats={climbs:0,tops:0,drops:0};return _cw.apply(this,arguments)}}
console.log('[zclimb] zombie climbing ready');
})();
