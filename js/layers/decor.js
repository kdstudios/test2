/* ==========================================================================================================
   MINI FORT ZOMBIE - DECOR LAYER (055)
   Density pass for the expedition town. Runs right before perfOptimize merges the world, and builds everything with
   MFZ's own mesh()/addSolid(), so every prop merges, casts shadows, collides (where it should) and takes its
   Modern surface texture through the same pipeline as the buildings.
   ========================================================================================================== */
(function(){
'use strict';
const W=window.RGW;if(!W){return}
const T=THREE,PI=Math.PI;
const R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),PKA=a=>a[Math.floor(Math.random()*a.length)];
const GC={};const bx=(w,h,d)=>{const k='b'+w+','+h+','+d;return GC[k]||(GC[k]=new T.BoxGeometry(w,h,d))};
const cyl=(r,h,n=10)=>{const k='c'+r+','+h+','+n;return GC[k]||(GC[k]=new T.CylinderGeometry(r,r,h,n))};
const ico=(r)=>{const k='i'+r;return GC[k]||(GC[k]=new T.IcosahedronGeometry(r,0))};
const cone=(r,h,n)=>{const k='n'+r+','+h+','+n;return GC[k]||(GC[k]=new T.ConeGeometry(r,h,n))};
const tor=(r,t)=>{const k='t'+r+','+t;return GC[k]||(GC[k]=new T.TorusGeometry(r,t,6,12))};
function P(geo,col,x,y,z,cls,parent,ry,rx,rz){const m=mesh(geo,col,x,y,z,parent||undefined);if(cls)m.userData.rgc=cls;if(ry)m.rotation.y=ry;if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;return m}
const solid=m=>{try{addSolid(m)}catch(e){}};
const inB=(x,z,p)=>{try{return inBuilding(x,z,p)}catch(e){return false}};
const RP=()=>!!(window.RGPROPS&&RGPROPS.on&&RGPROPS.on());
const N={};const cnt=k=>N[k]=(N[k]||0)+1;

function segsMinus(a0,a1,cutters){let segs=[[a0,a1]];for(const [c0,c1] of cutters){const n=[];for(const [s0,s1] of segs){if(c1<=s0||c0>=s1)n.push([s0,s1]);else{if(c0>s0)n.push([s0,c0]);if(c1<s1)n.push([c1,s1])}}segs=n}return segs}
const roadAt=(L,x,z,pad)=>L.roads.some(r=>x>r.x0-pad&&x<r.x1+pad&&z>r.z0-pad&&z<r.z1+pad)||L.alleys.some(r=>x>r.x0-pad&&x<r.x1+pad&&z>r.z0-pad&&z<r.z1+pad);
const plotAt=(L,x,z)=>L.plots.find(p=>x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1);

/* ---------- 1. curbs ---------- */
function curbs(L){
 const vs=L.roads.filter(r=>(r.x1-r.x0)<(r.z1-r.z0)),hs=L.roads.filter(r=>(r.x1-r.x0)>=(r.z1-r.z0));
 for(const r of hs)for(const e of [r.z0,r.z1]){const cut=vs.filter(v=>v.z0<=e+.5&&v.z1>=e-.5).map(v=>[v.x0,v.x1]);
  for(const [a,b] of segsMinus(r.x0,r.x1,cut))if(b-a>.6){P(bx(b-a,.16,.3),0xaeaea8,(a+b)/2,.08,e+(e===r.z0?-.15:.15),'concrete');cnt('curb')}}
 for(const r of vs)for(const e of [r.x0,r.x1]){const cut=hs.filter(h=>h.x0<=e+.5&&h.x1>=e-.5).map(h=>[h.z0,h.z1]);
  for(const [a,b] of segsMinus(r.z0,r.z1,cut))if(b-a>.6){P(bx(.3,.16,b-a),0xaeaea8,e+(e===r.x0?-.15:.15),.08,(a+b)/2,'concrete');cnt('curb')}}
}

/* ---------- 2. utility poles + sagging wires ---------- */
function wire(a,b,col){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dx,dy,dz);const m=P(bx(.03,.03,len),col,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,0);m.lookAt(b.x,b.y,b.z);m.updateMatrix();return m}
function poles(L){
 const lines=[];
 for(const r of L.roads){const horiz=(r.x1-r.x0)>=(r.z1-r.z0);
  if(horiz){const side=Math.random()<.5?-1:1,z=side<0?r.z0-1.3:r.z1+1.3;lines.push({h:1,c:z,a:r.x0+6,b:r.x1-6,road:r})}
  else{const side=Math.random()<.5?-1:1,x=side<0?r.x0-1.3:r.x1+1.3;lines.push({h:0,c:x,a:r.z0+6,b:r.z1-6,road:r})}}
 for(const ln of lines){const pts=[];
  for(let t=ln.a;t<=ln.b;t+=R(24,30)){const x=ln.h?t:ln.c,z=ln.h?ln.c:t;if(roadAt(L,x,z,-.2)||inB(x,z,1.2))continue;pts.push({x,z})}
  const H=8.6;
  for(const p of pts){if(RP()){solids.push(new T.Box3(new T.Vector3(p.x-.14,0,p.z-.14),new T.Vector3(p.x+.14,H,p.z+.14)));RGPROPS.poles(p,ln.h);cnt('pole');continue}
   const pm=P(cyl(.14,H,8),0x5a4630,p.x,H/2,p.z,'timber');solid(pm);const b=P(bx(ln.h?.12:2.2,.14,ln.h?2.2:.12),0x4a3a28,p.x,H-.5,p.z,'timber');
   for(const o of [-.9,0,.9]){P(cyl(.04,.14,6),0xd8d8cc,ln.h?p.x+o:p.x,H-.36,ln.h?p.z:p.z+o,0)}
   cnt('pole')}
  for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];
   for(const o of [-.9,0,.9]){const A={x:ln.h?a.x+o:a.x,y:8.1,z:ln.h?a.z:a.z+o},B={x:ln.h?b.x+o:b.x,y:8.1,z:ln.h?b.z:b.z+o};
    let prev=A;const n=8,sag=R(.8,1.3);for(let k=1;k<=n;k++){const t=k/n,q={x:A.x+(B.x-A.x)*t,y:8.1-sag*4*t*(1-t),z:A.z+(B.z-A.z)*t};wire(prev,q,0x1a1a1a);prev=q}cnt('wire')}}
 }
}

/* ---------- 3. street furniture on the sidewalk strips ---------- */
function furniture(L){
 for(const b of buildings){if(b.t==='park'||/cemetery|water_tower/.test(b.t))continue;const p=plotAt(L,b.x,b.z);if(!p)continue;
  const north=p.front==='north',sz=north?p.z0+.8:p.z1-.8,face=north?0:PI,out=north?-1:1;   // out = toward the road
  const com=!/house/.test(b.t);
  // hydrant (corner of the plot)
  if(Math.random()<.55){const zz=sz+out*.45,hx=R(p.x0+3,p.x1-3);
   P(cyl(.1,.5,10),0xb3261e,hx,.28,zz,0);P(cyl(.085,.07,10),0x8e1c15,hx,.56,zz,0);P(cyl(.07,.16,8),0xb3261e,hx+.1,.36,zz,0,0,0,PI/2);P(cyl(.07,.16,8),0xb3261e,hx-.1,.36,zz,0,0,0,PI/2);P(cyl(.12,.08,10),0x7e1812,hx,.06,zz,0);cnt('hydrant')}
  if(com){
   // bench
   if(Math.random()<.7){const x=b.x+R(-b.w/3,b.w/3);P(bx(1.5,.06,.4),0x7a5a36,x,.46,sz,'wood',null,face);P(bx(1.5,.34,.05),0x7a5a36,x,.7,sz-out*.17,'wood',null,face);
    for(const o of[-.65,.65]){P(bx(.06,.46,.4),0x2e3236,x+o,.23,sz,'steel')}cnt('bench')}
   // trash can
   if(Math.random()<.8){const x=b.x+R(-b.w/2,b.w/2);P(cyl(.24,.8,12),0x2d3a34,x,.4,sz+out*.2,0);P(cyl(.26,.06,12),0x1e2622,x,.82,sz+out*.2,0);cnt('bin')}
   // mailbox / news box
   if(Math.random()<.5){const x=b.x+R(-b.w/2,b.w/2);P(bx(.42,.9,.42),0x1d4f9c,x,.45,sz+out*.3,0);P(bx(.44,.1,.44),0x153a73,x,.92,sz+out*.3,0);cnt('mailbox')}
  }
 }
}

/* ---------- 4. roadblocks, barriers, cones ---------- */
function roadblocks(L){
 const vxs=L.roads.filter(r=>(r.x1-r.x0)<(r.z1-r.z0)),hzs=L.roads.filter(r=>(r.x1-r.x0)>=(r.z1-r.z0));
 for(let i=0;i<9;i++){const horiz=Math.random()<.5,r=PKA(horiz?hzs:vxs),n=RI(2,4);
  const x0=horiz?R(r.x0+14,r.x1-14):(r.x0+r.x1)/2+R(-1.5,1.5),z0=horiz?(r.z0+r.z1)/2+R(-1.5,1.5):R(r.z0+14,r.z1-14);
  if(vxs.some(v=>horiz&&x0>v.x0-6&&x0<v.x1+6)||hzs.some(h=>!horiz&&z0>h.z0-6&&z0<h.z1+6))continue;
  const ry=(horiz?PI/2:0)+R(-.12,.12);
  for(let k=0;k<n;k++){const off=(k-(n-1)/2)*3.1,x=x0+(horiz?0:off),z=z0+(horiz?off:0);
   const m=P(bx(3,.82,.62),0x9c9c96,x,.41,z,'concrete',null,ry);solid(m);P(bx(3,.2,.9),0x8c8c86,x,.1,z,'concrete',null,ry);cnt('barrier')}
  if(Math.random()<.6)for(let k=0;k<3;k++){const x=x0+R(-3,3),z=z0+R(-3,3);P(cone(.17,.6,10),0xe4570f,x,.3,z,0);P(cyl(.18,.05,10),0x222222,x,.03,z,0);P(cyl(.12,.07,10),0xf2f2f2,x,.34,z,0);cnt('cone')}
 }
}

/* ---------- 5. loose debris ---------- */
function debris(L,count){
 const spots=[];
 for(const p of L.plots){const north=p.front==='north',sz=north?p.z0+.8:p.z1-.8;for(let i=0;i<9;i++)spots.push([R(p.x0+1,p.x1-1),sz+R(-.7,.7),.7]);for(let i=0;i<7;i++)spots.push([R(p.x0+1,p.x1-1),R(p.z0+1,p.z1-1),.3])}
 for(const a of L.alleys)for(let i=0;i<22;i++)spots.push([R(a.x0+1,a.x1-1),R((a.z0+a.z1)/2-1.8,(a.z0+a.z1)/2+1.8),.8]);
 for(const r of L.roads)for(let i=0;i<14;i++)spots.push([R(r.x0+1,r.x1-1),R(r.z0+1,r.z1-1),.15]);
 let made=0;
 for(let tries=0;made<count&&tries<count*3;tries++){const [x,z,w]=PKA(spots);if(Math.random()>w+.15||inB(x,z,.6))continue;made++;
  const k=Math.random();
  if(k<.2){const m=P(ico(.3),PKA([0x1a1c1a,0x2b2f2a,0x3a3d38]),x,.14,z,0);m.scale.set(1,.7,.85);m.rotation.y=R(0,6)}                         // garbage bag
  else if(k<.34){const s=R(.35,.7);P(bx(s,s*.75,s*.8),0xa4814e,x,s*.375,z,'crate',null,R(0,3))}                                           // cardboard box
  else if(k<.44){P(tor(.28,.1),0x1b1b1b,x,.12,z,0,null,0,PI/2+R(-.25,.25))}                                                              // tire
  else if(k<.55){const c=PKA([0x2a4f7a,0x7a2a1e,0x4a4a46]);P(cyl(.29,.9,14),c,x,.45,z,'rust');P(cyl(.3,.05,14),0x303030,x,.9,z,0)}        // barrel
  else if(k<.63){for(let q=0;q<4;q++)P(bx(1.1,.06,.12),0x8a6a3c,x+(q-1.5)*.26*0,.03+q*0,z+(q-1.5)*.28,'boards',null,0);P(bx(1.1,.06,1.1),0x7a5a30,x,.09,z,'boards')}  // pallet
  else if(k<.74){for(let q=0;q<RI(3,6);q++)P(bx(.22,.1,.1),0x8a4a38,x+R(-.4,.4),.05+R(0,.1),z+R(-.4,.4),'brick',null,R(0,3))}          // bricks
  else if(k<.84){const m=P(ico(R(.18,.4)),0x7d7d78,x,.14,z,'concrete');m.scale.set(1,.6,R(.8,1.2));m.rotation.y=R(0,6)}                  // concrete chunk
  else if(k<.92){const m=P(bx(R(.6,1.6),.03,R(.6,1.2)),0x9a9a94,x,.12,z,'rollshutter',null,R(0,3),R(-.3,.3),R(-.3,.3))}                    // scrap sheet
  else{P(bx(R(.2,.4),.012,R(.2,.4)),PKA([0xd8d8d0,0xcfc7b0,0xb0b0aa]),x,.02,z,0,null,R(0,3))}                                            // paper
 }
 cnt('debris');N.debris=made;
}

/* ---------- 6. vegetation ---------- */
function mkBlade(){const g=new T.BufferGeometry(),v=[],n=[],ix=[];let o=0;
 for(let i=0;i<7;i++){const a=i/7*PI*2+R(0,1),lean=R(.05,.16),h=R(.2,.42),w=.03,dx=Math.cos(a),dz=Math.sin(a),bx0=dx*R(.02,.06),bz0=dz*R(.02,.06);
  v.push(bx0-dz*w,0,bz0+dx*w,bx0+dz*w,0,bz0-dx*w,bx0+dx*lean,h,bz0+dz*lean);n.push(0,1,0,0,1,0,0,1,0);ix.push(o,o+1,o+2,o,o+2,o+1);o+=3}
 g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setIndex(ix);return g}
const BLADES=[mkBlade(),mkBlade(),mkBlade()];
const GRN=[0x44602a,0x4f6c2c,0x5f7231,0x6e7a34,0x76703a,0x38501d,0x58662f];
function tufts(L,count){
 const lb=L.bounds;let made=0;
 for(let tries=0;made<count&&tries<count*3;tries++){
  let x,z;const k=Math.random();
  if(k<.5){const b=PKA(buildings);const ang=R(0,PI*2),ex=b.w/2+R(.2,1.4),ez=b.d/2+R(.2,1.4);x=b.x+Math.cos(ang)*ex*1.0;z=b.z+Math.sin(ang)*ez*1.0}   // ring around buildings
  else if(k<.8){const p=PKA(L.plots);x=R(p.x0+1,p.x1-1);z=R(p.z0+1,p.z1-1)}
  else{const m=60;const side=RI(0,3);x=side<2?R(lb.x0-m,lb.x1+m):(side===2?R(lb.x0-m,lb.x0):R(lb.x1,lb.x1+m));z=side<2?(side===0?R(lb.z0-m,lb.z0):R(lb.z1,lb.z1+m)):R(lb.z0,lb.z1)}
  if(roadAt(L,x,z,.5)||inB(x,z,.4))continue;
  const m=mesh(PKA(BLADES),PKA(GRN),x,0,z);m.rotation.y=R(0,6);const s=R(.6,1.25);m.scale.set(s,s*R(.8,1.3),s);made++}
 N.tufts=made;
}
function bushes(L){
 let made=0;
 for(const b of buildings){if(b.t==='park'||/cemetery|water_tower/.test(b.t))continue;
  const n=RI(2,6);for(let i=0;i<n;i++){const side=RI(0,3),x=b.x+(side<2?R(-b.w/2,b.w/2):(side===2?-1:1)*(b.w/2+.8)),z=b.z+(side>=2?R(-b.d/2,b.d/2):(side===0?-1:1)*(b.d/2+.8));
   if(roadAt(L,x,z,.4)||inB(x,z,-.2))continue;
   const s=R(.4,.8),m=P(ico(s),PKA([0x2e4a22,0x3a5a28,0x445f2a,0x55662c]),x,s*.7,z,'lawn');m.scale.set(R(1,1.5),R(.8,1.1),R(1,1.4));m.rotation.y=R(0,6);made++}}
 N.bushes=made;
}

/* ---------- 7. buildings: roof equipment, wall AC, downspouts, rubble ---------- */
const NO_ROOF=/house|church|park|cemetery|water_tower|eco_pump|shed/;
function buildingDetail(L){
 const groups=[];scene.traverse(o=>{if(o.isGroup&&o.userData&&o.userData.bw&&o.userData.bd&&o.userData.bh)groups.push(o)});
 if(RP())try{RGPROPS.buildings(L,groups)}catch(e){console.warn('[decor055] modern building props',e)}
 for(const g of groups){const u=g.userData,bw=u.bw,bd=u.bd,bh=u.bh;
  // downspouts on corners
  for(const sx of[-1,1]){if(Math.random()<.7){P(cyl(.05,bh-.3,8),0x4a4e52,sx*(bw/2+.06),(bh-.3)/2+.15,bd/2+.06,'steel',g);cnt('spout')}}
  // wall AC units
  if(!RP())for(let i=0;i<RI(0,3);i++){const sx=Math.random()<.5?-1:1,z=R(-bd/2+1.5,bd/2-1.5);P(bx(.45,.4,.6),0xc8c8c0,sx*(bw/2+.3),R(1.8,2.8),z,'rollshutter',g);P(bx(.08,.35,.55),0x777770,sx*(bw/2+.05),2.2,z,'steel',g);cnt('wallAC')}
  if(!RP()&&bw*bd>60&&bh>3.2){
   // roof equipment (flat roofs only; type is not known per group, so keep small & near the middle)
   const n=RI(1,4);for(let i=0;i<n;i++){const x=R(-bw/2+2,bw/2-2),z=R(-bd/2+2,bd/2-2),k=Math.random();
    if(k<.45){P(bx(R(1.1,1.8),R(.7,1),R(1,1.5)),0xa8aaa6,x,bh+.55,z,'rollshutter',g);P(cyl(.45,.1,12),0x303234,x,bh+1.05,z,'steel',g)}
    else if(k<.75){P(cyl(.18,R(.6,1.2),10),0x6a6e72,x,bh+.5,z,'steel',g);P(cyl(.26,.1,10),0x55595c,x,bh+1.1,z,'steel',g)}
    else{P(cyl(.025,R(2.5,5),6),0x2a2a2a,x,bh+2,z,0,g);P(bx(.9,.03,.03),0x2a2a2a,x,bh+3.4,z,0,g)}
    cnt('roofprop')}
  }
 }
 // rubble around ruined / damaged buildings
 for(const b of buildings){if((b.cond==null?9:b.cond)>1)continue;
  for(let i=0;i<RI(10,22);i++){const a=R(0,PI*2),ex=b.w/2+R(.2,2.6),ez=b.d/2+R(.2,2.6),x=b.x+Math.cos(a)*ex,z=b.z+Math.sin(a)*ez;if(roadAt(L,x,z,0))continue;
   const s=R(.2,.7),k=Math.random(),m=P(k<.5?bx(s,s*.6,s*R(.6,1.3)):ico(s*.7),k<.5?0x8a5a48:0x8a8a84,x,s*.3,z,k<.5?'brick':'concrete',null,R(0,6),R(-.3,.3),R(-.3,.3));cnt('rubble')}}
}


/* ---------- fort yard (clear / siege mode) ---------- */
function fortYard(){
 if(typeof FORT==='undefined')return;const fx=FORT.x,fz=FORT.z;let made=0;
 const free=(x,z,r)=>!(Math.abs(x-fx)<r&&Math.abs(z-fz)<r);
 const ring=(rmin,rmax)=>{const a=R(0,PI*2),r=R(rmin,rmax);return[fx+Math.cos(a)*r,fz+Math.sin(a)*r]};
 for(let i=0;i<2600;i++){const [x,z]=ring(17.5,75);if(!free(x,z,17.5))continue;const m=mesh(PKA(BLADES),PKA(GRN),x,0,z);m.rotation.y=R(0,6);const s=R(.6,1.25);m.scale.set(s,s*R(.8,1.3),s);made++}
 for(let i=0;i<34;i++){const [x,z]=ring(17,50);if(!free(x,z,17))continue;const s=R(.4,.85),m=P(ico(s),PKA([0x2e4a22,0x3a5a28,0x445f2a,0x55662c]),x,s*.7,z,'lawn');m.scale.set(R(1,1.5),R(.8,1.1),R(1,1.4));m.rotation.y=R(0,6);made++}
 if(RP()){RGPROPS.fort(fx,fz)}else{
 for(let i=0;i<110;i++){const [x,z]=ring(16.5,42);if(!free(x,z,16.5))continue;const k=Math.random();
  if(k<.2){const m=P(ico(.3),PKA([0x1a1c1a,0x2b2f2a,0x3a3d38]),x,.14,z,0);m.scale.set(1,.7,.85)}
  else if(k<.34){const s=R(.35,.7);P(bx(s,s*.75,s*.8),0xa4814e,x,s*.375,z,'crate',null,R(0,3))}
  else if(k<.44){P(tor(.28,.1),0x1b1b1b,x,.12,z,0,null,0,PI/2+R(-.25,.25))}
  else if(k<.58){P(cyl(.29,.9,14),PKA([0x2a4f7a,0x7a2a1e,0x4a4a46]),x,.45,z,'rust');P(cyl(.3,.05,14),0x303030,x,.9,z,0)}
  else if(k<.7){P(bx(1.1,.06,1.1),0x7a5a30,x,.09,z,'boards');for(let q=0;q<3;q++)P(bx(1.1,.06,.12),0x8a6a3c,x,.03,z+(q-1)*.4,'boards')}
  else if(k<.84){const m=P(ico(R(.18,.4)),0x7d7d78,x,.14,z,'concrete');m.scale.set(1,.6,R(.8,1.2));m.rotation.y=R(0,6)}
  else{for(let q=0;q<RI(3,6);q++)P(bx(.22,.1,.1),0x8a4a38,x+R(-.4,.4),.05+R(0,.1),z+R(-.4,.4),'brick',null,R(0,3))}
  made++}
 // a few jersey barriers and sandbag heaps near the gate side
 for(let k=0;k<3;k++){const x=fx+(k-1)*3.2+R(-.3,.3),z=fz+R(21,24);const m=P(bx(3,.82,.62),0x9c9c96,x,.41,z,'concrete',null,R(-.15,.15));solid(m);P(bx(3,.2,.9),0x8c8c86,x,.1,z,'concrete',null,0);made++}
 for(let k=0;k<5;k++){const x=fx+R(-8,8),z=fz+R(19,23);for(let q=0;q<RI(4,7);q++)P(bx(.55,.2,.3),0x9a8a62,x+R(-.5,.5),.1+RI(0,1)*.19,z+R(-.3,.3),'rust'===0?0:'crate',null,R(-.4,.4))}
 }
 N.fortYard=made;
}

/* ---------- driver ---------- */
W.decor=function(){
 if(!W.on)return;
 if(G.mode!=='EXPEDITION'||!window.__fortZombieTown||!__fortZombieTown.layout||typeof buildings==='undefined'||buildings.length<10){
  if(G.mode==='CLEAR'||G.mode==='SIEGE'){for(const k in N)delete N[k];try{fortYard()}catch(e){console.warn('[decor055] fortYard failed',e)}W.stats.decor=JSON.stringify(N)}else W.stats.decor='skipped (mode '+G.mode+')';return}
 const L=__fortZombieTown.layout,t0=performance.now();
 for(const k in N)delete N[k];
 for(const [name,fn] of [['curbs',()=>curbs(L)],['poles',()=>{poles(L);if(RP())RGPROPS.flushPoles()}],['furniture',()=>RP()?RGPROPS.furniture(L):furniture(L)],['roadblocks',()=>RP()?RGPROPS.roadblocks(L):roadblocks(L)],['debris',()=>RP()?RGPROPS.debris(L,420):debris(L,700)],...((window.RGFLORA&&RGFLORA.on())?[]:[['tufts',()=>tufts(L,5200)],['bushes',()=>bushes(L)]]),['buildings',()=>buildingDetail(L)]]){
  try{fn()}catch(e){console.warn('[decor055] '+name+' failed',e)}}
 W.stats.decor=JSON.stringify(N)+' in '+Math.round(performance.now()-t0)+' ms';
};
console.log('[decor055] decor layer installed');
})();
