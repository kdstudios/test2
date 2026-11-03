/* ==========================================================================================================
   MINI FORT ZOMBIE - ZOMBIE PATHFINDING (v072, ported from Riposte Frontline's bot navigation: 03-nav.js, 07-bots.js, 07e-humain.js)
   v071 zombies stepped greedily to the cheapest of the 8 neighbouring 0.5 m cells of the shared flow field every frame: zig-zag
   movement, corner snagging, no route at all when hunting a last-known position (straight line into the wall), no field value when
   standing inside a wall's padding (straight line again), and a random 0.4 m jitter as the only way out of a jam.
   Now, as Riposte's bots do it:
   1. PATHS, not steps. A zombie hunting you reads a whole route out of the flow field (downhill from its cell to you, up to 24 m), and
      a zombie hunting a last-known position runs A* on the same grid (Riposte findPath: binary heap, stamped arrays, capped search,
      the best partial route if the cap is hit). The flow field is kept as the shared cost map, so a 100-zombie siege still costs one
      Dijkstra, and doors / windows / barricades keep their bash-through costs.
   2. STRING PULLING (Riposte smoothPath). The route is shortened to the furthest point that can be walked to in a straight line with
      body clearance, so zombies walk straight lines and round corners cleanly. A door, window or barricade on the route is a pinned
      point (Riposte's jump/drop pins): the line never cuts past it.
   3. WAYPOINTS (Riposte pathDir). A corner is only cut when the next point can be reached in a straight line from here; otherwise the
      zombie walks right up to it. Routes are refreshed every ~0.6 s, or sooner when the target moves away from the end of the route.
   4. NEAREST FREE CELL (Riposte botNearNode). A zombie pressed against a wall starts its route from the nearest free cell it can walk
      straight to, instead of losing the route.
   5. BUMP + UNSTICK (Riposte botBump / botUnstick). b.bump tracks how much of the wanted step the scenery took back. Pinned for 0.28 s:
      first try climbing it (zclimb), otherwise escalate: sidestep to the free side, walk back to the nearest free cell, back off and
      re-plan, and as a last resort settle on the nearest free cell.
   6. Zombies face where they are walking until they are close to their target, and keep going for a target standing on top of something.
   Hooks: zMove (replaced; zclimb wraps this one), killZ / clearWorld (cleanup). Turn off with ZPATH.on=false (falls back to v071 movement).
   ========================================================================================================== */
(function(){
'use strict';
if(typeof zMove!=='function'||typeof NAV==='undefined'||typeof blocked!=='function'){console.warn('[zpath] core hooks missing');return}
const ZP=window.ZPATH={on:true,len:48,smooth:30,clr:.18,repath:.6,astarCap:9000,bumpTc:.18,bumpLost:.5,bumpHold:.28,face:3.5,stats:{field:0,astar:0,partial:0,unstick:0,climbs:0}};
const hyp=Math.hypot,now=()=>performance.now()/1000;
const DX=[1,-1,0,0,1,1,-1,-1],DZ=[0,0,1,-1,1,-1,1,-1];

/* ---------------- grid helpers on core's NAV (0.5 m cells, wall mask padded by 0.32 m, flow field dist[], soft obstacles) ---------------- */
const cellOf=(x,z)=>{const N=NAV,ix=Math.floor((x-N.x0)/N.cs),iz=Math.floor((z-N.z0)/N.cs);return ix<0||iz<0||ix>=N.w||iz>=N.h?-1:iz*N.w+ix};
const cx=i=>NAV.x0+(i%NAV.w+.5)*NAV.cs,cz=i=>NAV.z0+(((i/NAV.w)|0)+.5)*NAV.cs;
const wallAt=(x,z)=>{const i=cellOf(x,z);return i<0||NAV.wall[i]===1};
/* straight walk from a to b with body clearance: the centre line and two lines offset by ZP.clr either side cross no wall cell, and no soft
   obstacle (door / window / barricade) unless it is the end point (Riposte navWalkable, plus a clearance margin like its NAV_R > body radius) */
function walkable(ax,az,bx,bz,softEnd){const dx=bx-ax,dz=bz-az,L=hyp(dx,dz);if(L<1e-3)return true;const n=Math.ceil(L/.22),px=-dz/L*ZP.clr,pz=dx/L*ZP.clr,S=NAV.softObj,end=cellOf(bx,bz);
 for(let k=1;k<=n;k++){const t=k/n,x=ax+dx*t,z=az+dz*t,i=cellOf(x,z);if(i<0||NAV.wall[i])return false;if(S[i]&&!(softEnd&&i===end))return false;
  if(t<.97&&(wallAt(x+px,z+pz)||wallAt(x-px,z-pz)))return false}
 return true}
/* nearest free cell the body can walk straight to (Riposte botNearNode); needField: only cells the flow field reached */
function nearFree(x,z,needField){const N=NAV,ix=Math.floor((x-N.x0)/N.cs),iz=Math.floor((z-N.z0)/N.cs);let best=-1,bd=1e9;
 for(let r=0;r<=4&&best<0;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;const jx=ix+dx,jz=iz+dz;if(jx<0||jz<0||jx>=N.w||jz>=N.h)continue;
  const i=jz*N.w+jx;if(N.wall[i]||(needField&&!(N.dist[i]<1e8)))continue;const d=hyp(cx(i)-x,cz(i)-z);if(d>=bd)continue;if(d>.35&&lineBlocked(x,z,cx(i),cz(i)))continue;bd=d;best=i}
 return best}
function lineBlocked(ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=hyp(dx,dz),n=Math.max(1,Math.ceil(L/.3));for(let k=1;k<=n;k++){const t=k/n;if(blocked(ax+dx*t,az+dz*t,.26,0,1.7))return true}return false}

/* ---------------- 1a. route out of the shared flow field: downhill from the zombie's cell toward the defenders ---------------- */
function fieldRoute(x,z){const N=NAV,D=N.dist,W=N.wall,w=N.w;let i=cellOf(x,z);if(i<0)return null;
 if(W[i]||!(D[i]<1e8)){i=nearFree(x,z,true);if(i<0)return null}
 const ids=[i];let soft=null;
 for(let s=0;s<ZP.len;s++){if(D[i]<=1e-6)break;const ix=i%w,iz=(i/w)|0;let bd=D[i],bi=-1;
  for(let k=0;k<8;k++){const nx=ix+DX[k],nz=iz+DZ[k];if(nx<0||nz<0||nx>=w||nz>=N.h)continue;const n=nz*w+nx;if(W[n])continue;if(k>3&&(W[iz*w+nx]||W[nz*w+ix]))continue;if(D[n]<bd-1e-3){bd=D[n];bi=n}}
  if(bi<0)break;i=bi;ids.push(i);if(N.softObj[i]){soft=N.softObj[i];break}}   // a door / window / barricade on the way: the route ends there, the zombie deals with it
 return{ids,soft}}

/* ---------------- 1b. A* on the same grid to any point (Riposte findPath), for last-known positions and targets the field does not cover ---------------- */
const AS={n:0,g:null,f:null,fr:null,st:null,cl:null,gen:1,ha:null,hn:0};
function asAlloc(){const n=NAV.w*NAV.h;if(AS.n===n)return;AS.n=n;AS.g=new Float32Array(n);AS.f=new Float32Array(n);AS.fr=new Int32Array(n);AS.st=new Int32Array(n);AS.cl=new Int32Array(n);AS.ha=new Int32Array(Math.max(4096,n>>2));AS.gen=1}
function hpush(id){const a=AS.ha,f=AS.f;if(AS.hn>=a.length)return;let i=AS.hn++;a[i]=id;while(i>0){const p=(i-1)>>1;if(f[a[p]]<=f[a[i]])break;const t=a[p];a[p]=a[i];a[i]=t;i=p}}
function hpop(){const a=AS.ha,f=AS.f,top=a[0];a[0]=a[--AS.hn];let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<AS.hn&&f[a[l]]<f[a[m]])m=l;if(r<AS.hn&&f[a[r]]<f[a[m]])m=r;if(m===i)break;const t=a[m];a[m]=a[i];a[i]=t;i=m}return top}
function astar(x,z,tx,tz){const N=NAV;asAlloc();let s=cellOf(x,z);if(s<0)return null;if(N.wall[s]){s=nearFree(x,z,false);if(s<0)return null}
 let e=cellOf(tx,tz);if(e<0)return null;if(N.wall[e]){const e2=nearFree(tx,tz,false);if(e2>=0)e=e2}
 const w=N.w,W=N.wall,X=N.extra,NR=N.near,cs=N.cs,g=AS.g,f=AS.f,fr=AS.fr,st=AS.st,cl=AS.cl,gen=++AS.gen,ex=e%w,ez=(e/w)|0;
 const H=i=>{const ddx=Math.abs(i%w-ex),ddz=Math.abs(((i/w)|0)-ez);return (Math.max(ddx,ddz)+.414*Math.min(ddx,ddz))*cs*1.05};
 AS.hn=0;st[s]=gen;g[s]=0;f[s]=H(s);fr[s]=-1;hpush(s);let it=0,found=false,bestI=s,bestH=f[s];
 while(AS.hn>0&&it++<ZP.astarCap){const n=hpop();if(cl[n]===gen)continue;cl[n]=gen;if(n===e){found=true;break}
  const h=f[n]-g[n];if(h<bestH){bestH=h;bestI=n}const ix=n%w,iz=(n/w)|0;
  for(let k=0;k<8;k++){const nx=ix+DX[k],nz=iz+DZ[k];if(nx<0||nz<0||nx>=w||nz>=N.h)continue;const m=nz*w+nx;if(W[m]||cl[m]===gen)continue;if(k>3&&(W[iz*w+nx]||W[nz*w+ix]))continue;
   const ng=g[n]+(k>3?1.414*cs:cs)+X[m]+NR[m];if(st[m]!==gen||ng<g[m]){st[m]=gen;g[m]=ng;fr[m]=n;f[m]=ng+H(m);hpush(m)}}}
 const last=found?e:bestI;if(!found)ZP.stats.partial++;if(last===s&&!found)return null;
 const ids=[];for(let n=last;n>=0;n=fr[n])ids.push(n);ids.reverse();
 let soft=null;for(let k=1;k<ids.length;k++)if(N.softObj[ids[k]]){soft=N.softObj[ids[k]];ids.length=k+1;break}
 return{ids,soft,partial:!found}}

/* ---------------- 2. string pulling (Riposte smoothPath): jump to the furthest point still walkable in a straight line; soft cells are pinned ---------------- */
function smooth(ids,soft){const P=ids.map(i=>({x:cx(i),z:cz(i),soft:!!NAV.softObj[i]}));if(P.length<=2)return P;const out=[P[0]];let i=0;
 while(i<P.length-1){let j=Math.min(P.length-1,i+ZP.smooth);for(let k=i+1;k<j;k++)if(P[k].soft){j=k;break}
  while(j>i+1&&!walkable(P[i].x,P[i].z,P[j].x,P[j].z,P[j].soft))j--;out.push(P[j]);i=j}
 return out}

/* ---------------- 3. route per zombie + waypoint following (Riposte setPath / pathDir) ---------------- */
function plan(u,p,tp,useField){const r=u.zp||(u.zp={});r.T=ZP.repath*(.8+Math.random()*.5);r.tx=tp.x;r.tz=tp.z;r.pts=null;r.soft=null;r.i=1;
 let R=null;if(useField&&NAV.dist){R=fieldRoute(p.x,p.z);if(R)ZP.stats.field++}
 if(!R){R=astar(p.x,p.z,tp.x,tp.z);if(R)ZP.stats.astar++}
 if(!R||!R.ids.length)return r;
 const pts=smooth(R.ids,R.soft);
 // the end of a field route is the target's own cell (it may be on top of a wall): finish on the real target point when it is in a straight line
 if(!R.soft&&!R.partial){const L=pts[pts.length-1];if(hyp(L.x-tp.x,L.z-tp.z)<1.2)pts[pts.length-1]={x:tp.x,z:tp.z,end:1}}
 r.pts=pts;r.soft=R.soft;r.i=pts.length>1?1:0;
 if(pts.length>1&&!walkable(p.x,p.z,pts[1].x,pts[1].z,pts[1].soft))r.i=0;   // no shortcut through a wall at the start: first the nearest free cell
 r.ex=pts[pts.length-1].x;r.ez=pts[pts.length-1].z;return r}
function waypoint(z,u,p,tp,useField,dt){let r=u.zp;
 const moved=r&&r.pts&&hyp(tp.x-r.tx,tp.z-r.tz)>Math.max(1.5,.25*hyp(p.x-tp.x,p.z-tp.z));
 if(!r||!r.pts||(r.T-=dt)<=0||moved||r.i>=r.pts.length)r=plan(u,p,tp,useField);
 const P=r.pts;if(!P)return null;
 while(r.i<P.length){const q=P[r.i],d=hyp(q.x-p.x,q.z-p.z),last=r.i===P.length-1;
  if(d<(last?.45:.6)&&(last||d<.22||walkable(p.x,p.z,P[r.i+1].x,P[r.i+1].z,P[r.i+1].soft))){r.i++;continue}   // a corner is cut only if the next point is in a straight line
  return{x:q.x,z:q.z,o:r.soft,far:!last||!q.end}}
 return null}

/* ---------------- 5. bump + unstick (Riposte botBump / botUnstick) ---------------- */
function room(p,dx,dz,len){for(let s=.35;s<=len+.01;s+=.35){if(blocked(p.x+dx*s,p.z+dz*s,.3,p.y,1.7))return s-.35}return len}
function unstick(z,u,p,hx,hz,tgtY){const t=now(),n=t-(u.zuAt||-9)<3?(u.zuN||0)+1:0;u.zuN=n;u.zuAt=t;u.zb=0;u.zbT=0;ZP.stats.unstick++;if(u.zp){u.zp.pts=null;u.zp.T=0}
 // climbable thing in the way and the target is beyond / on top of it: climb instead (zclimb)
 if(n<=1&&window.ZCLIMB&&ZCLIMB.tryClimb&&ZCLIMB.tryClimb(z,u,hx,hz,tgtY)){ZP.stats.climbs++;u.zuN=0;return}
 if(n===0){const sd=Math.random()<.5?1:-1,rx=-hz,rz=hx;let s=0;if(room(p,rx*sd,rz*sd,1.2)>=1)s=sd;else if(room(p,-rx*sd,-rz*sd,1.2)>=1)s=-sd;
  u.zs=s?{t:.45,dx:rx*s,dz:rz*s}:{t:.5,dx:-hx,dz:-hz};return}
 if(n<=2||n===5){const i=nearFree(p.x,p.z,false);if(i>=0){u.zs={t:1,x:cx(i),z:cz(i)};return}}
 if(n<5){u.zs={t:.7,dx:-hx,dz:-hz};NAV.T=0;return}
 const i=nearFree(p.x,p.z,false);if(i>=0&&hyp(cx(i)-p.x,cz(i)-p.z)<1.3){p.x=cx(i);p.z=cz(i)}u.zuN=0}

/* ---------------- the new zMove (core signature; zclimb wraps it) ---------------- */
const _zm0=zMove;
zMove=function(z,u,p,dt,best,tp,useField){
 if(!ZP.on||!NAV.ok)return _zm0.apply(this,arguments);
 const tgtY=tp===pl.position?pl.position.y-(G.eyeUsed||1.6):(tp.y||0),up=tgtY>p.y+.8;
 if(best<1.3&&!up){u.zb=0;return}if(best<.35)return;
 const night=G.time>=20||G.time<5,sp=u.sp*(night?1.2:1)*dt;
 let wx=tp.x,wz=tp.z,route=null,far=false,hasRoute=false;
 const elev=p.y>.6&&wallAt(p.x,p.z);   // standing on top of something: no grid up here, head straight for it (zclimb handles the edge)
 if(!elev){const w=waypoint(z,u,p,tp,useField,dt);hasRoute=!!(u.zp&&u.zp.pts);if(w){wx=w.x;wz=w.z;route=w.o;far=w.far}}
 // recovery move from an unstick (sidestep / back off / walk to a free cell)
 const R=u.zs;if(R){R.t-=dt;if(R.t<=0)u.zs=null;else if(R.x!==undefined){if(hyp(R.x-p.x,R.z-p.z)<.2)u.zs=null;else{wx=R.x;wz=R.z}}else{wx=p.x+R.dx;wz=p.z+R.dz}}
 let dx=wx-p.x,dz=wz-p.z,d=hyp(dx,dz);if(d<.04){dx=tp.x-p.x;dz=tp.z-p.z;d=hyp(dx,dz)||1}
 const ux=dx/d,uz=dz/d,st=Math.min(sp,d+.05),tx=p.x+ux*st,tz=p.z+uz*st,x0=p.x,z0=p.z;
 if(far&&best>ZP.face&&!u.zs){u.fx=p.x+ux*3;u.fz=p.z+uz*3}   // face where it is walking until it is close to its target
 const bl=blocked(tx,tz,.3,p.y,1.8);
 if(!bl){p.x=tx;p.z=tz}
 else{
  // bash / smash only what the route goes through (anything, if there is no route); otherwise slide round it
  const wants=o=>!hasRoute||(route&&route.o===o);
  if(bl.door&&wants(bl.door)){u.atk={t:'door',o:bl.door};if(bl.door.hp===undefined)bl.door.hp=50;u.zb=0;return}
  if(bl.bar&&wants(bl.bar)){u.atk={t:'bar',o:bl.bar};u.zb=0;return}
  if(bl.win&&wants(bl.win)){u.atk={t:'win',o:bl.win};u.zb=0;return}
  if(bl.max.y<=1.3+p.y&&!bl.bar&&!bl.door&&!bl.win&&!u.zs){const w=winNear(tx,tz,1.7);if(w&&w.alive){if(wants(w)){u.atk={t:'win',o:w};return}}
   else{if(Math.random()<(G.mode==='SIEGE'?.12:.22)){failJump(z,u,ux,uz);return}if(startVault(z,u,ux,uz))return}}
  if(!blocked(tx,p.z,.3,p.y,1.8))p.x=tx;else if(!blocked(p.x,tz,.3,p.y,1.8))p.z=tz}
 // Riposte botBump: how much of the wanted step the scenery took back, smoothed; pinned for a moment -> unstick
 const c2=(tx-x0)**2+(tz-z0)**2;let lost=0;if(c2>1e-8)lost=Math.max(0,Math.min(1,1-((p.x-x0)*(tx-x0)+(p.z-z0)*(tz-z0))/c2));
 u.zb=(u.zb||0)+(lost-(u.zb||0))*(1-Math.exp(-dt/ZP.bumpTc));
 if(u.zb>ZP.bumpLost&&sp>.3*dt)u.zbT=(u.zbT||0)+dt;else u.zbT=Math.max(0,(u.zbT||0)-dt*2);
 if(u.zbT>ZP.bumpHold)unstick(z,u,p,ux,uz,tgtY)};

/* ---------------- cleanup ---------------- */
if(typeof killZ==='function'){const _kz=killZ;killZ=function(z){try{const u=z&&z.userData;if(u){u.zp=null;u.zs=null}}catch(e){}return _kz.apply(this,arguments)}}
if(typeof clearWorld==='function'){const _cw=clearWorld;clearWorld=function(){ZP.stats={field:0,astar:0,partial:0,unstick:0,climbs:0};AS.n=0;return _cw.apply(this,arguments)}}
window.zpathDebug=()=>Object.assign({},ZP.stats);
console.log('[zpath] Riposte-style zombie pathfinding ready');
})();
