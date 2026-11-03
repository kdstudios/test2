/* ==========================================================================================================
   MINI FORT ZOMBIE - PROP KIT (v072). Original prop modelling toolkit; every prop in js/props/ is built with it, procedurally, at load time.
   - geometry: true rounded boxes (radius + segments), cylinders, lathe profiles, tubes along paths, extruded outlines, plus detail helpers
     (inset panels, handles, hinges, screws, vents, slats, feet, labels)
   - materials: PBR surfaces from the world layer (wood / steel / painted metal / rust / cardboard..., locked to the object so they turn with it),
     plain PBR (chrome, rubber, plastic, enamel), glass, and canvas textures painted in code (labels, brands, control panels, packaging)
   - every model is merged into one mesh per material when it is built (a prop is a handful of draw calls, however detailed)
   ========================================================================================================== */
(function(){
'use strict';
const T=THREE,V3=T.Vector3,PI=Math.PI;
const K=window.MFZK={stats:{models:0,tris:0}};

/* ---------------- deterministic random per model (every copy of a prop looks the same) ---------------- */
K.rng=function(seed){let a=0;for(const c of String(seed))a=(a*31+c.charCodeAt(0))|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};

/* ---------------- geometry ---------------- */
// rounded box: w,h,d, edge radius r, s = segments on each rounded edge
const RB={};
K.rboxGeo=function(w,h,d,r,s){r=Math.max(0,Math.min(r||0,w/2-1e-4,h/2-1e-4,d/2-1e-4));s=s||2;
 const key=[w,h,d,r,s].map(v=>+v.toFixed(4)).join(',');if(RB[key])return RB[key];
 if(r<=1e-4)return RB[key]=new T.BoxGeometry(w,h,d);
 const n=s*2+1,g=new T.BoxGeometry(1,1,1,n,n,n).toNonIndexed(),P=g.attributes.position.array,N=g.attributes.normal.array,half=.5/n,bx=w/2-r,by=h/2-r,bz=d/2-r,p=new V3(),q=new V3();
 for(let i=0;i<P.length;i+=3){p.set(P[i],P[i+1],P[i+2]);q.copy(p);q.x-=Math.sign(q.x)*half;q.y-=Math.sign(q.y)*half;q.z-=Math.sign(q.z)*half;q.normalize();
  P[i]=bx*Math.sign(p.x)+q.x*r;P[i+1]=by*Math.sign(p.y)+q.y*r;P[i+2]=bz*Math.sign(p.z)+q.z*r;N[i]=q.x;N[i+1]=q.y;N[i+2]=q.z}
 // flat faces keep exactly flat normals
 for(let i=0;i<P.length;i+=3){const ax=Math.abs(P[i])>=bx-1e-6&&Math.abs(P[i])<=bx+1e-6,a=[Math.abs(P[i])-bx,Math.abs(P[i+1])-by,Math.abs(P[i+2])-bz];
  if(a[0]<=1e-6&&a[1]<=1e-6){N[i]=0;N[i+1]=0;N[i+2]=Math.sign(P[i+2])}else if(a[0]<=1e-6&&a[2]<=1e-6){N[i]=0;N[i+1]=Math.sign(P[i+1]);N[i+2]=0}else if(a[1]<=1e-6&&a[2]<=1e-6){N[i]=Math.sign(P[i]);N[i+1]=0;N[i+2]=0}}
 g.attributes.position.needsUpdate=true;return RB[key]=g};
const GC={};const gcache=(k,f)=>GC[k]||(GC[k]=f());
K.cylGeo=(rt,rb,h,seg,open)=>gcache('c'+[rt,rb,h,seg,open],()=>new T.CylinderGeometry(rt,rb,h,seg||16,1,!!open));
K.sphGeo=(r,ws,hs,a0,a1)=>gcache('s'+[r,ws,hs,a0,a1],()=>new T.SphereGeometry(r,ws||16,hs||10,0,PI*2,a0||0,a1===undefined?PI:a1));
K.torGeo=(R,r,rs,ts,arc)=>{arc=arc==null?PI*2:arc;return gcache('t'+[R,r,rs,ts,arc],()=>new T.TorusGeometry(R,r,rs||8,ts||24,arc))};
K.latheGeo=(pts,seg)=>new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||24);
K.tubeGeo=(pts,r,seg,rs,closed)=>new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new V3(...p)),!!closed,'catmullrom',.2),seg||32,r,rs||8,!!closed);
K.extrudeGeo=(outline,depth,bevel)=>{const s=new T.Shape();outline.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));
 const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:!!bevel,bevelThickness:bevel||0,bevelSize:bevel||0,bevelSegments:2,curveSegments:8});g.translate(0,0,-depth/2);return g};
K.planeGeo=(w,h)=>gcache('p'+[w,h],()=>new T.PlaneGeometry(w,h));

/* ---------------- materials ---------------- */
const MC={};
const hasRGW=()=>window.RGW&&RGW.mat&&RGW.on&&window.RGTEX&&RGTEX.names;
// PBR surface locked to the object (world layer), falls back to a plain material when the world textures are off
K.surf=function(name,col,o){o=o||{};const key='S'+name+'|'+col+'|'+(o.m||0)+'|'+(o.r||'');if(MC[key])return MC[key];let m;
 if(hasRGW()&&RGTEX.names.includes(name)){const cls=RGTEX.names.indexOf(name)+1;
  // nudge the colour by a hair so the shared world cache never hands the same object to two owners
  const c=new T.Color(col);c.r=Math.min(1,c.r+1/1024);m=RGW.mat(0,cls,c,false,null,null,true);if(o.m){m.metalness=o.m}m.envMapIntensity=o.env||.55}
 else m=new T.MeshStandardMaterial({color:col,roughness:o.r||.75,metalness:o.m||0});
 m.userData.mfz=1;return MC[key]=m};
K.mat=function(col,rough,metal,o){o=o||{};const key='M'+col+'|'+rough+'|'+metal+'|'+JSON.stringify(o);if(MC[key])return MC[key];
 const m=new T.MeshStandardMaterial(Object.assign({color:col,roughness:rough===undefined?.6:rough,metalness:metal||0},o));m.userData.mfz=1;if(window.RGW&&RGW.env)m.envMap=RGW.env;m.envMapIntensity=metal>.5?1:.5;return MC[key]=m};
K.chrome=()=>K.mat(0xd8dadc,.18,1);K.steelBrushed=()=>K.brushed(0xc4c8cc);K.rubber=()=>K.mat(0x1b1b1c,.92,0);K.blackPlastic=()=>K.mat(0x1e1f21,.55,0);
K.glass=(tint,op)=>{const key='G'+(tint||0)+'|'+(op||0);if(MC[key])return MC[key];const m=new T.MeshStandardMaterial({color:tint||0xcfe6ee,roughness:.04,metalness:.1,transparent:true,opacity:op||.22,depthWrite:false,side:T.DoubleSide});
 if(window.RGW&&RGW.env)m.envMap=RGW.env;m.envMapIntensity=1.4;m.userData.mfz=1;return MC[key]=m};

/* ---------------- our own tiling surfaces, mapped by object position (grain scale right on every part, no UVs needed) ---------------- */
const TRI_V='varying vec3 vTP;varying vec3 vTN;',TRI_S=(s)=>`
 vec3 tn=normalize(vTN),an=abs(tn),tw=pow(an,vec3(4.));tw/=(tw.x+tw.y+tw.z);
 vec4 tx=texture2D(map,vTP.zy*${s.toFixed(3)})*tw.x+texture2D(map,vTP.xz*${s.toFixed(3)}+vec2(.37,.11))*tw.y+texture2D(map,vTP.xy*${s.toFixed(3)}+vec2(.71,.53))*tw.z;
 diffuseColor*=tx;`;
K.tri=function(key,draw,o){o=o||{};const mk='T'+key+'|'+(o.col||0xffffff)+'|'+(o.r||.6)+'|'+(o.m||0);if(MC[mk])return MC[mk];
 const t=K.tex('tri_'+key,o.px||512,o.px||512,draw,{repeat:true});t.wrapS=t.wrapT=T.RepeatWrapping;
 const m=new T.MeshStandardMaterial({map:t,color:o.col||0xffffff,roughness:o.r===undefined?.6:o.r,metalness:o.m||0});const sc=1/(o.tile||.5);
 m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+TRI_V).replace('#include <begin_vertex>','#include <begin_vertex>\nvTP=position;vTN=normal;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+TRI_V).replace('#include <map_fragment>',TRI_S(sc))};
 m.customProgramCacheKey=()=>'mfztri'+sc.toFixed(3);if(window.RGW&&RGW.env)m.envMap=RGW.env;m.envMapIntensity=o.m>.5?1:.5;m.userData.mfz=1;return MC[mk]=m};
// fine wood veneer: long grain lines, pores, the odd cathedral figure; base colour comes from the texture so tint stays natural
K.veneer=function(col,o){o=o||{};const c0=new T.Color(col);const key='ven'+c0.getHexString()+(o.fig?'f':'');
 return K.tri(key,(c,W,H,r)=>{c.fillStyle='#'+c0.getHexString();c.fillRect(0,0,W,H);
  for(let i=0;i<260;i++){const y=r()*H,a=.04+r()*.12,dark=r()<.6;c.strokeStyle=dark?'rgba(30,16,6,'+a+')':'rgba(255,235,200,'+a*.6+')';c.lineWidth=.5+r()*2.2;c.beginPath();c.moveTo(0,y);
   for(let x=0;x<=W;x+=32)c.lineTo(x,y+Math.sin(x*.01+i)*2+(r()-.5)*1.5);c.stroke()}
  if(o.fig!==false)for(let k=0;k<3;k++){const cx=r()*W,cy=r()*H;for(let j=0;j<10;j++){c.strokeStyle='rgba(40,20,8,'+(.05+r()*.06)+')';c.lineWidth=1+r();c.beginPath();c.ellipse(cx,cy,60+j*14,8+j*5,0,PI*.05,PI*.95);c.stroke()}}
  P.noise(c,W,H,r,6000,.18,'#1a0c04',1.2);P.noise(c,W,H,r,1500,.08,'#fff',1)},{tile:o.tile||.6,r:o.r||.5,m:0})};
K.brushed=function(col,o){o=o||{};const c0=new T.Color(col);return K.tri('br'+c0.getHexString(),(c,W,H,r)=>{c.fillStyle='#'+c0.getHexString();c.fillRect(0,0,W,H);
  for(let i=0;i<900;i++){const y=r()*H,a=.03+r()*.08;c.fillStyle=r()<.5?'rgba(255,255,255,'+a+')':'rgba(0,0,0,'+a+')';c.fillRect(r()*W*.5-W*.25,y,W*(.4+r()),.6+r()*.8)}
  P.scratches(c,W,H,r,40,'rgba(255,255,255,.25)');P.noise(c,W,H,r,800,.08,'#000',2)},{tile:o.tile||.4,r:o.r||.34,m:o.m===undefined?(window.RGW&&RGW.env?.85:.45):o.m})};
K.paintSteel=function(col,o){o=o||{};const c0=new T.Color(col);return K.tri('ps'+c0.getHexString()+(o.worn?'w':''),(c,W,H,r)=>{c.fillStyle='#'+c0.getHexString();c.fillRect(0,0,W,H);
  P.noise(c,W,H,r,3000,.05,'#000',1.5);P.noise(c,W,H,r,1500,.05,'#fff',1.5);P.scratches(c,W,H,r,o.worn?60:15,'rgba(255,255,255,.3)');if(o.worn){P.rust(c,W,H,r,12);P.grime(c,W,H,r,.5)}},{tile:o.tile||.8,r:o.r||.45,m:o.m||.25})};

/* ---------------- painted textures (canvas, cached by key) ---------------- */
const TC={};
K.tex=function(key,w,h,draw,o){o=o||{};if(TC[key])return TC[key];const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');
 draw(c,w,h,K.rng(key));const t=new T.CanvasTexture(cv);t.encoding=T.sRGBEncoding;t.anisotropy=8;if(o.repeat){t.wrapS=t.wrapT=T.RepeatWrapping}t.userData={cv};return TC[key]=t};
// label material: a painted canvas on a face (transparent where the painting is)
K.paint=function(key,w,h,draw,o){o=o||{};const mk='P'+key+'|'+JSON.stringify(o);if(MC[mk])return MC[mk];const t=K.tex(key,w,h,draw,o);
 const m=new T.MeshStandardMaterial({map:t,roughness:o.r===undefined?.6:o.r,metalness:o.m||0,transparent:!!o.alpha,alphaTest:o.alpha?.04:0,depthWrite:!o.alpha,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 if(o.glow){m.emissive=new T.Color(0xffffff);m.emissiveMap=t;m.emissiveIntensity=o.glow}
 if(window.RGW&&RGW.env)m.envMap=RGW.env;m.envMapIntensity=.6;m.userData.mfz=1;return MC[mk]=m};
// painting helpers
const P=K.P={};
P.noise=function(c,w,h,rnd,n,a,col,sz){c.save();c.fillStyle=col||'#000';for(let i=0;i<n;i++){c.globalAlpha=a*rnd();const s=(sz||1.5)*(.5+rnd());c.fillRect(rnd()*w,rnd()*h,s,s)}c.restore()};
P.grime=function(c,w,h,rnd,k){k=k===undefined?1:k;c.save();
 for(let i=0;i<30*k;i++){const x=rnd()*w,y=rnd()*h,r=(10+rnd()*60)*(w/512);const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(40,30,20,'+(.12*k*rnd())+')');g.addColorStop(1,'rgba(40,30,20,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
 const eg=c.createLinearGradient(0,h*.7,0,h);eg.addColorStop(0,'rgba(30,22,14,0)');eg.addColorStop(1,'rgba(30,22,14,'+(.35*k)+')');c.fillStyle=eg;c.fillRect(0,0,w,h);   // dirt toward the floor
 P.noise(c,w,h,rnd,1500*k,.25,'#2a2018');P.noise(c,w,h,rnd,500*k,.18,'#fff');c.restore()};
P.scratches=function(c,w,h,rnd,n,col){c.save();c.strokeStyle=col||'rgba(255,255,255,.35)';for(let i=0;i<n;i++){c.lineWidth=.4+rnd()*1.1;c.globalAlpha=.25+rnd()*.5;const x=rnd()*w,y=rnd()*h,a=rnd()*PI,l=4+rnd()*40;
 c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+rnd()*4,y+Math.sin(a)*l*.5+rnd()*4,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke()}c.restore()};
P.rust=function(c,w,h,rnd,n){c.save();for(let i=0;i<n;i++){const x=rnd()*w,y=rnd()*h,r=2+rnd()*14;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(110,52,22,.75)');g.addColorStop(.6,'rgba(140,72,30,.35)');g.addColorStop(1,'rgba(140,72,30,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,PI*2);c.fill();
 if(rnd()<.4){const dl=10+rnd()*60,dg=c.createLinearGradient(x,y,x,y+dl);dg.addColorStop(0,'rgba(110,52,22,.5)');dg.addColorStop(1,'rgba(110,52,22,0)');c.fillStyle=dg;c.fillRect(x-1,y,2+rnd()*2,dl)}}c.restore()};
P.text=function(c,s,x,y,o){o=o||{};c.save();c.font=(o.weight||'')+' '+(o.size||24)+'px '+(o.font||"'MFZ Head',Oswald,Arial Narrow,sans-serif");c.fillStyle=o.col||'#111';c.textAlign=o.align||'center';c.textBaseline=o.base||'middle';
 if(o.max){const m=c.measureText(s).width;if(m>o.max){c.translate(x,y);c.scale(o.max/m,1);c.translate(-x,-y)}}
 if(o.stroke){c.lineWidth=o.lw||3;c.strokeStyle=o.stroke;c.strokeText(s,x,y)}if(o.ls){let cx=x-(c.measureText(s).width+o.ls*(s.length-1))/2;c.textAlign='left';for(const ch of s){c.fillText(ch,cx,y);cx+=c.measureText(ch).width+o.ls}}else c.fillText(s,x,y);c.restore()};
P.stencil=function(c,s,x,y,size,col,rnd,o){o=o||{};P.text(c,s,x,y,Object.assign({font:"'MFZ Stencil','Black Ops One',Impact,sans-serif",size,col},o));
 // worn paint: knock holes in the stencil
 c.save();c.globalCompositeOperation='destination-out';for(let i=0;i<size*1.2;i++){c.globalAlpha=.5+rnd()*.5;const r=.6+rnd()*size*.06;c.beginPath();c.arc(x+(rnd()-.5)*size*s.length*.62,y+(rnd()-.5)*size*.8,r,0,PI*2);c.fill()}c.restore()};
P.barcode=function(c,x,y,w,h,rnd){c.save();c.fillStyle='#fff';c.fillRect(x,y,w,h);c.fillStyle='#111';let px=x+w*.06;while(px<x+w*.94){const bw=(1+Math.floor(rnd()*3))*w/120;if(rnd()<.6)c.fillRect(px,y+h*.08,bw,h*.72);px+=bw+w/160}
 c.font=(h*.16)+"px 'MFZ Mono',monospace";c.textAlign='center';c.textBaseline='bottom';c.fillText(String(Math.floor(rnd()*9e11+1e11)),x+w/2,y+h);c.restore()};
P.rrect=function(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()};
P.vgrad=(c,y0,y1,stops)=>{const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(s[0],s[1]));return g};

/* ---------------- the builder ---------------- */
// b = K.builder(name): b.add(geo, mat, {p:[x,y,z], r:[rx,ry,rz], s:[sx,sy,sz]}) ... b.done() -> {group geometry list, col boxes}
const _m=new T.Matrix4(),_q=new T.Quaternion(),_e=new T.Euler(),_s=new V3(),_p=new V3();
K.builder=function(name){const items=[],cols=[],extra=[];let stack=[new T.Matrix4()];
 const b={name,rnd:K.rng(name),
  push(p,r,s){_e.set(...(r||[0,0,0]));_q.setFromEuler(_e);const m=new T.Matrix4().compose(new V3(...(p||[0,0,0])),_q.clone(),new V3(...(s||[1,1,1])));stack.push(stack[stack.length-1].clone().multiply(m));return b},
  pop(){if(stack.length>1)stack.pop();return b},
  add(geo,mat,o){o=o||{};_e.set(...(o.r||[0,0,0]));_q.setFromEuler(_e);_s.set(...(o.s||[1,1,1]));_p.set(...(o.p||[0,0,0]));_m.compose(_p,_q,_s);
   items.push({geo,mat,m:stack[stack.length-1].clone().multiply(_m)});return b},
  box(w,h,d,mat,p,r,rad,seg){if(rad===undefined)rad=Math.min(w,h,d)<.03?0:Math.min(.004,w/4,h/4,d/4);return b.add(K.rboxGeo(w,h,d,rad,seg||1),mat,{p,r})},
  rbox(w,h,d,rad,mat,p,r,seg){return b.add(K.rboxGeo(w,h,d,rad,seg||2),mat,{p,r})},
  cyl(rt,rb,h,mat,p,r,seg,open){return b.add(K.cylGeo(rt,rb,h,seg,open),mat,{p,r})},
  sph(r,mat,p,s,seg){return b.add(K.sphGeo(r,seg||14,seg?Math.ceil(seg*.6):9),mat,{p,s})},
  tor(R,r,mat,p,rot,arc,seg){return b.add(K.torGeo(R,r,8,seg||24,arc),mat,{p,r:rot})},
  tube(pts,r,mat,seg,rs){return b.add(K.tubeGeo(pts,r,seg||Math.max(8,pts.length*6),rs||8),mat)},
  lathe(pts,mat,p,seg,r){return b.add(K.latheGeo(pts,seg||24),mat,{p,r})},
  plane(w,h,mat,p,r){return b.add(K.planeGeo(w,h),mat,{p,r})},
  extrude(outline,depth,mat,p,r,bevel){return b.add(K.extrudeGeo(outline,depth,bevel),mat,{p,r})},
  // label on a face: centred at p, facing direction given by r (default +z)
  label(w,h,mat,p,r){return b.add(K.planeGeo(w,h),mat,{p,r})},
  col(x0,y0,z0,x1,y1,z1){cols.push([x0,y0,z0,x1,y1,z1]);return b},
  keep(obj){extra.push(obj);return b},        // non-merged objects (rigged bodies, sprites)
  /* ---- detail helpers ---- */
  screws(pts,mat,r){for(const p of pts)b.cyl(r||.004,r||.004,.003,mat||K.chrome(),p,[PI/2,0,0],8);return b},
  // bar handle on a +z face: length l, standing off by s
  handle(l,mat,p,vertical,s){s=s||.035;const R=.007,m=mat||K.chrome(),rot=vertical?[0,0,0]:[0,0,PI/2];
   b.push(p,rot);b.cyl(R,R,l,m,[0,0,s],null,12);b.cyl(R*.9,R*.9,s,m,[0,l/2-R,s/2],[PI/2,0,0],10);b.cyl(R*.9,R*.9,s,m,[0,-l/2+R,s/2],[PI/2,0,0],10);b.pop();return b},
  knob(mat,p,r){const m=mat||K.chrome(),R=r||.014;b.cyl(R*.45,R*.55,R*1.3,m,[p[0],p[1],p[2]+R*.65],[PI/2,0,0],10);b.sph(R,m,[p[0],p[1],p[2]+R*1.5],[1,1,.7]);return b},
  // cup pull for drawers
  pull(w,mat,p){const m=mat||K.chrome();b.push(p);b.box(w,.012,.012,m,[0,.004,.012],null,.004);b.box(.012,.02,.014,m,[-w/2+.006,0,.006],null,.003);b.box(.012,.02,.014,m,[w/2-.006,0,.006],null,.003);b.pop();return b},
  hinge(h,mat,p){const m=mat||K.chrome();b.cyl(.006,.006,h,m,p,null,10);return b},
  // inset panel frame on a +z face (raised moulding of thickness t)
  frame(w,h,t,mat,p,dep){dep=dep||.008;b.push(p);b.box(w,t,dep,mat,[0,h/2-t/2,0]);b.box(w,t,dep,mat,[0,-h/2+t/2,0]);b.box(t,h-2*t,dep,mat,[-w/2+t/2,0,0]);b.box(t,h-2*t,dep,mat,[w/2-t/2,0,0]);b.pop();return b},
  vents(n,w,h,mat,p,dir){const gap=h/n;for(let i=0;i<n;i++)b.box(w,gap*.42,.006,mat,[p[0],p[1]-h/2+gap*(i+.5),p[2]],[dir===false?0:-.5,0,0],.002);return b},
  done(){return finish(name,items,cols,extra)}};
 return b};

/* merge per material */
function finish(name,items,cols,extra){const by=new Map();
 for(const it of items){let a=by.get(it.mat);if(!a)by.set(it.mat,a=[]);a.push(it)}
 const meshes=[];let tris=0;const bb=new T.Box3();
 for(const [mat,list] of by){let nv=0;const parts=list.map(it=>{let g=it.geo.index?it.geo.toNonIndexed():it.geo;return{g,m:it.m}});
  for(const q of parts)nv+=q.g.attributes.position.count;
  const pos=new Float32Array(nv*3),nor=new Float32Array(nv*3),uv=new Float32Array(nv*2);let o=0;const nm=new T.Matrix3(),v=new V3();
  for(const q of parts){const P=q.g.attributes.position,N=q.g.attributes.normal,U=q.g.attributes.uv,n=P.count;nm.getNormalMatrix(q.m);const flip=q.m.determinant()<0;
   for(let i=0;i<n;i++){const j=flip?(i-i%3)+(2-i%3):i;v.fromBufferAttribute(P,j).applyMatrix4(q.m);pos.set([v.x,v.y,v.z],(o+i)*3);
    if(N){v.fromBufferAttribute(N,j).applyMatrix3(nm).normalize();nor.set([v.x,v.y,v.z],(o+i)*3)}if(U){uv[(o+i)*2]=U.getX(j);uv[(o+i)*2+1]=U.getY(j)}}
   o+=n}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));
  g.computeBoundingBox();g.computeBoundingSphere();bb.union(g.boundingBox);tris+=nv/3;meshes.push({g,mat})}
 for(const e of extra){e.updateMatrixWorld(true);bb.expandByObject(e)}
 K.stats.models++;K.stats.tris+=tris;
 return{name,meshes,extra,cols:cols.length?cols:[[bb.min.x,Math.max(0,bb.min.y),bb.min.z,bb.max.x,bb.max.y,bb.max.z]],bb,tris}}
/* ---------------- registry: K.def(name, meta, build) ; K.model(name) builds once ; K.instance(name) -> THREE.Group ---------------- */
K.defs={};K.built={};
K.def=function(name,meta,fn){K.defs[name]=Object.assign({label:name,table:'house',items:[1,3],auto:[]},meta,{fn})};
K.model=function(name){if(K.built[name])return K.built[name];const d=K.defs[name];if(!d)return null;const b=K.builder(name);
 try{d.fn(b,K,b.rnd)}catch(e){console.warn('[mfzprops] build failed',name,e)}return K.built[name]=b.done()};
K.instance=function(name){const M=K.model(name);if(!M)return null;const g=new T.Group();
 for(const q of M.meshes){const m=new T.Mesh(q.g,q.mat);m.castShadow=!q.mat.transparent;m.receiveShadow=true;g.add(m)}
 for(const e of M.extra){const c=e.userData&&e.userData.clone?e.userData.clone():e.clone(true);g.add(c)}
 g.userData.mfzModel=name;return g};
console.log('[mfzkit] prop kit ready');
})();
