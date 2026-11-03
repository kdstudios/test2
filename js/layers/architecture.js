/* ==========================================================================================================
   MINI FORT ZOMBIE - ARCHITECTURE LAYER
   Architectural + prop detail in the spirit of three Modern maps, applied to every MFZ building:
     GREEK        (Cycladic)    blue shutters + doors, striped awnings, terracotta jars with bougainvillea, vine pergolas,
                                 laundry lines, wall lanterns, rattan pendant lamps, linen curtains, striped rugs
     EUROPEAN DREAM  (pavillon)    painted volets, stone quoins + lintels, sills, porch canopy + steps, wrought-iron balconies,
                                 mailbox, hedges, patterned rugs, floral curtains, framed pictures
     MODERN        (botanic)     ivy on walls, window boxes, trellis arches, potted plants, glass lean-to conservatory,
                                 rain barrel / watering can, botanical prints
   Runs inside RGW.decor (just before MFZ's perf pass merges the world), builds with MFZ's own mesh() as direct children of
   each building group so everything merges + takes Modern surface textures. VISUAL ONLY: nothing here is a collider.
   Settings: Options > Graphics > Architecture (RGFX.s.arch 0/1/2) and Style (RGFX.s.archStyle).
   ========================================================================================================== */
(function(){
'use strict';
const W=window.RGW,FX=window.RGFX;if(!W||!FX){return}
const T=THREE,PI=Math.PI,R=(a,b)=>a+Math.random()*(b-a),RI=(a,b)=>Math.floor(R(a,b+1)),PK=a=>a[Math.floor(Math.random()*a.length)];
const ARCH=window.RGARCH={stats:{}};
const GC={};const q=v=>Math.round(v*50)/50;
const bx=(w,h,d)=>{w=q(w);h=q(h);d=q(d);const k=w+','+h+','+d;return GC[k]||(GC[k]=new T.BoxGeometry(w,h,d))};
const cyl=(r,h,n=10)=>{const k='c'+r+','+q(h)+','+n;return GC[k]||(GC[k]=new T.CylinderGeometry(r,r*.82,q(h),n))};
const ico=r=>{const k='i'+r;return GC[k]||(GC[k]=new T.IcosahedronGeometry(r,0))};
const cone=(r,h,n)=>{const k='n'+r+','+q(h)+','+n;return GC[k]||(GC[k]=new T.ConeGeometry(r,q(h),n))};
ARCH.marks=[];const mark=(k,r,lx,lz)=>ARCH.marks.push({k,x:r.g.position.x+r.cs*lx,z:r.g.position.z+r.cs*lz,cs:r.cs});
const N={};const cnt=(k,n=1)=>N[k]=(N[k]||0)+n;
function P(g,geo,col,x,y,z,cls,ry,rx,rz){const m=mesh(geo,col,x,y,z,g);if(cls)m.userData.rgc=cls;if(ry)m.rotation.y=ry;if(rx)m.rotation.x=rx;if(rz)m.rotation.z=rz;return m}

/* ---------------------------------- styles ---------------------------------- */
const STY={
 greek:{name:'greek',shut:[0x2f6db0,0x3f86c8,0x2a5f9e],trim:0xf1efe8,door:0x2f6db0,pot:0xb85c3a,bloom:[0xc2185b,0xe040a0,0xd81b60],leaf:[0x3f7a35,0x4b8a3c],curtain:[0xf2efe6,0xe9e4d6],lamp:0xc9a870,awn:[0x2f6db0,0xf4f2ea],rug:[0x2f6db0,0xf0ede2],pic:[0x2f6db0,0x7fb2dc,0xf0ede2]},
 european:{name:'european',shut:[0x7d9482,0xa8b4ae,0x6b7f94,0x8a4a3a,0xe9e5da],trim:0xd9cfb6,door:0x5a6e5e,pot:0xa65a3a,bloom:[0xe58aa8,0xd44c3c,0xf2eee0],leaf:[0x4a7a32,0x5b8a3a],curtain:[0xe6c6c0,0xc9d6c3,0xd9c9a8],lamp:0xd8c9a0,awn:[0x8a4a3a,0xe9e5da],rug:[0x8a2f2a,0xd8c9a8],pic:[0x6b8a5a,0xb99a6a,0x7a8fb0]},
 modern:{name:'modern',shut:[0x4f7a45,0xe9e5da,0x3f6a38],trim:0xe6e2d4,door:0x3f6a38,pot:0x9a5a38,bloom:[0xe9c93a,0xd44c3c,0x9a6ad0,0xf0a04a],leaf:[0x2f6a30,0x3f7a35,0x58903f],curtain:[0xd6e3cf,0xefe9d2],lamp:0xb8c8a0,awn:[0x3f6a38,0xe9e5da],rug:[0x5a7a48,0xcfc4a4],pic:[0x3f7a35,0xe9e5da,0xd9a24a]}
};
const hash=(a,b)=>{let h=(Math.floor(a)*73856093)^(Math.floor(b)*19349663);h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967296};
function styleFor(b){const s=FX.s.archStyle;if(s&&s!=='mixed'&&STY[s])return STY[s];const r=hash(Math.floor(b.x/70),Math.floor(b.z/70));return r<.34?STY.greek:r<.67?STY.european:STY.modern}

/* ---------------------------------- wall-frame helper ----------------------------------
   A wall element is placed by (along-wall offset a, height y, outward offset o) relative to a reference (window / door).
   ax=1: wall runs along local x, outward = sign(z).  ax=0: wall runs along local z, outward = sign(x).               */
function WF(g,ax,s,cx,cz){   // returns placer bound to one wall position
 return(along,h,thick,col,a,y,o,cls,rot)=>{
  const w=ax?along:thick,d=ax?thick:along,x=ax?cx+a:cx+s*o,z=ax?cz+s*o:cz+a;
  const m=P(g,bx(w,h,d),col,x,y,z,cls);if(rot){if(rot.rz)m.rotation.z=rot.rz;if(rot.rx)m.rotation.x=rot.rx;if(rot.ry)m.rotation.y=rot.ry}return m};
}
let CURST=null;const LEAFK=['azalea','hosta','clover','azalea'];
function flowerFor(col){const c=new T.Color(col),h={};c.getHSL(h);if(h.s<.25)return'roseW';const H=h.h;
 return H<.04||H>.96?'roseR':H<.11?'dahlia':H<.2?'roseY':H<.5?'clover':H<.7?'hydB':H<.8?'hydV':'roseP'}
function blob(g,r,col,x,y,z,sx=1,sy=1,sz=1,kind){const F=window.RGFLORA;
 if(F&&F.on()){const fl=CURST&&CURST.bloom.includes(col),k=kind||(fl?flowerFor(col):PK(LEAFK));let sz2=Math.max(.28,r*(fl?5:3.6));
  if(k==='ivy')sz2=r*5.2;let yy=y-r*.7;if(k==='wisteria'){sz2=R(1.0,1.5);yy=y-sz2+.2}F.leaf(F.batch(g),k,x,yy,z,sz2,[R(.88,1.05),R(.9,1.05),R(.85,1.0)]);return null}
 const m=P(g,ico(r),col,x,y,z,'lawn');m.scale.set(sx,sy,sz);return m}
const OUT=.15;   // wall half-thickness (WL th = .3)

/* ---------------------------------- per-building data ---------------------------------- */
function collect(){
 const G=new Map();
 const get=g=>{let r=G.get(g);if(!r){const u=g.userData||{};r={g,bw:u.bw,bd:u.bd,bh:u.bh,wins:[],doors:[],cs:Math.cos(g.rotation.y)>0?1:-1,b:null};G.set(g,r)}return r};
 for(const w of winList){if(!w.alive||!w.g||!w.g.userData||!w.g.userData.bw)continue;get(w.g).wins.push(w)}
 for(const d of doors){const g=d.p&&d.p.parent;if(!g||!g.userData||!g.userData.bw)continue;get(g).doors.push(d)}
 for(const b of buildings){for(const r of G.values()){const p=r.g.position;if(Math.abs(p.x-b.x)<.01&&Math.abs(p.z-b.z)<.01)r.b=b}}
 // groups without openings still need entries (ruins etc.)
 scene.children.forEach(c=>{if(c.isGroup&&c.userData&&c.userData.bw)get(c)});
 for(const r of G.values())if(!r.b){const p=r.g.position;r.b={x:p.x,z:p.z,w:r.bw,d:r.bd,t:'building'}}
 return[...G.values()].filter(r=>r.bw&&r.bd&&r.bw<60);
}
/* openings per exterior wall: side 'f'(+z) 'b'(-z) 'r'(+x) 'l'(-x) -> [{a0,a1,y0,y1}] along-wall coords */
function openings(r){
 const O={f:[],b:[],r:[],l:[]};
 for(const w of r.wins){const l=w.l,y0=l.y-.9;
  if(w.ax){if(Math.abs(l.z)>=r.bd/2-.05)O[l.z>0?'f':'b'].push({a0:l.x-.9,a1:l.x+.9,y0,y1:y0+3})}
  else if(Math.abs(l.x)>=r.bw/2-.05)O[l.x>0?'r':'l'].push({a0:l.z-.9,a1:l.z+.9,y0,y1:y0+3})}
 for(const d of r.doors){const p=d.p.position,ax=Math.abs(d.p.rotation.y)<.01;const c=ax?p.x+.65:p.z+.65,fx=ax?p.z:p.x,y0=p.y;
  if(ax){if(Math.abs(fx)>=r.bd/2-.05)O[fx>0?'f':'b'].push({a0:c-.95,a1:c+.95,y0,y1:y0+2.6,door:1,c})}
  else if(Math.abs(fx)>=r.bw/2-.05)O[fx>0?'r':'l'].push({a0:c-.95,a1:c+.95,y0,y1:y0+2.6,door:1,c})}
 return O;
}
const inO=(arr,a,y,pad=0)=>arr.some(o=>a>o.a0-pad&&a<o.a1+pad&&y>o.y0-.1-pad&&y<o.y1+pad);
const sideInfo={f:{ax:1,s:1},b:{ax:1,s:-1},r:{ax:0,s:1},l:{ax:0,s:-1}};
const wallLen=(r,k)=>sideInfo[k].ax?r.bw:r.bd,wallPos=(r,k)=>sideInfo[k].ax?r.bd/2:r.bw/2;
/* v071: interior trim and pictures are only placed where a real wall stands. The old test trusted the opening list, which misses
   openings that are not door objects (the fort's front entrance gap) and doors that are not quite on the wall line, so a framed
   picture could hang in mid-air in a doorway with no collision. Walls are found from the collision boxes (doors / glass / barricades excluded). */
const _wv=new T.Vector3(),_wb=new T.Box3();
function wallSolids(r){if(r.ws)return r.ws;r.g.updateWorldMatrix(true,false);const p=r.g.position,R=Math.max(r.bw,r.bd)/2+1.5,out=[];
 if(typeof solids!=='undefined')for(const b of solids){if(!b||b.door||b.win||b.bar||!isFinite(b.min.x))continue;if(b.max.x<p.x-R||b.min.x>p.x+R||b.max.z<p.z-R||b.min.z>p.z+R)continue;out.push(b)}
 return r.ws=out}
function wallAt(r,k,along,y){const si=sideInfo[k],w=si.s*wallPos(r,k),lx=si.ax?along:w,lz=si.ax?w:along;_wv.set(lx,y,lz);r.g.localToWorld(_wv);
 _wb.min.set(_wv.x-.06,_wv.y-.06,_wv.z-.06);_wb.max.set(_wv.x+.06,_wv.y+.06,_wv.z+.06);for(const b of wallSolids(r))if(b.intersectsBox(_wb))return true;return false}
function wallRuns(r,k,s0,s1,y){const out=[];let a=null;for(let t=s0;t<=s1+1e-6;t+=.25){const on=wallAt(r,k,Math.min(t,s1),y);if(on&&a===null)a=t;if(!on&&a!==null){out.push([a,t-.25]);a=null}}if(a!==null)out.push([a,s1]);return out.filter(q=>q[1]-q[0]>=.3)}
function place(r,k,along,y,out){   // local x,y,z for a point on side k
 const si=sideInfo[k],p=wallPos(r,k)*si.s+si.s*out;return si.ax?[along,y,p]:[p,y,along]}

/* ---------------------------------- exterior: windows ---------------------------------- */
function windows(r,st,lvl,broken){
 const g=r.g;
 for(const w of r.wins){
  const ax=w.ax?1:0,l=w.l;
  const ext=ax?Math.abs(l.z)>=r.bd/2-.05:Math.abs(l.x)>=r.bw/2-.05;if(!ext)continue;
  const s=ax?Math.sign(l.z):Math.sign(l.x),y0=l.y-.9,F=WF(g,ax,s,l.x,l.z),cy=y0+1.825;
  const shutter=Math.random()<(lvl>1?.78:.55);
  // sill + lintel
  F(1.95,.07,.32,st.trim,0,y0+.86,OUT+.1,'concrete');cnt('sill');
  if(st.name!=='greek'){F(1.9,.15,.22,st.name==='european'?0xcfc6b0:st.trim,0,y0+2.86,OUT+.07,'ashlar');cnt('lintel')}
  else{F(1.75,.1,.18,st.trim,0,y0+2.84,OUT+.06,'plaster')}   // whitewashed surround
  if(shutter){
   const col=PK(st.shut),hang=broken&&Math.random()<.35;
   for(const sd of[-1,1]){
    const tilt=hang&&sd===(Math.random()<.5?-1:1)?{rz:ax?sd*.32:0,rx:ax?0:sd*.32}:null;
    F(.72,1.95,.05,col,sd*(.75+.38),cy+(tilt?-.08:0),OUT+.04,'shutter',tilt);cnt('shutter');
    if(lvl>1&&!tilt)F(.58,.05,.06,0x00000a|col&0x7f7f7f,sd*(.75+.38),cy+.4,OUT+.07,'shutter'),F(.58,.05,.06,col&0x7f7f7f,sd*(.75+.38),cy-.4,OUT+.07,'shutter');
   }}
  // window box (plants)
  if(lvl>0&&Math.random()<(st.name==='modern'?.6:.34)){
   F(1.25,.2,.26,0x6a4a2a,0,y0+.74,OUT+.17,'wood');cnt('wbox');
   for(let i=-2;i<=2;i++){const p=place({bw:r.bw,bd:r.bd},ax?(s>0?'f':'b'):(s>0?'r':'l'),(ax?l.x:l.z)+i*.26,y0+.97,OUT+.17);
    blob(g,R(.1,.15),PK(st.leaf),p[0],p[1]+R(0,.04),p[2],1,.9,1);if(Math.random()<.7)blob(g,R(.05,.07),PK(st.bloom),p[0]+R(-.04,.04),p[1]+.14,p[2],1,1,1)}
  }
  // european iron balcony (upper floors)
  if(st.name==='european'&&y0>2&&Math.random()<.5){
   F(2.0,.04,.04,0x1c1c1e,0,y0+1.45,OUT+.42,'steel');F(2.0,.04,.04,0x1c1c1e,0,y0+.95,OUT+.42,'steel');
   for(let i=-4;i<=4;i++)F(.025,.5,.025,0x1c1c1e,i*.24,y0+1.2,OUT+.42,'steel');
   F(.04,.55,.04,0x1c1c1e,-1.0,y0+1.2,OUT+.2,'steel');F(.04,.55,.04,0x1c1c1e,1.0,y0+1.2,OUT+.2,'steel');cnt('balcony');
  }
 }
}

/* ---------------------------------- exterior: doors ---------------------------------- */
function doorsFx(r,st,lvl){
 const g=r.g,O=openings(r);
 for(const k of['f','b','r','l']){for(const o of O[k]){if(!o.door||o.y0>.2)continue;
  const si=sideInfo[k];
  const px=si.ax?o.c:si.s*wallPos(r,k),pz=si.ax?si.s*wallPos(r,k):o.c,FF=WF(g,si.ax,si.s,px,pz);   // FF origin sits ON the wall centre plane
  const sub=(along,h,thick,col,a,y,out,cls,rot)=>FF(along,h,thick,col,a,y,out,cls,rot);
  // surround
  sub(.14,2.55,.12,st.trim,-.86,1.28,OUT+.04,'plaster');sub(.14,2.55,.12,st.trim,.86,1.28,OUT+.04,'plaster');sub(1.86,.16,.14,st.trim,0,2.58,OUT+.05,'plaster');cnt('doorframe');
  if(st.name==='greek'){   // striped awning
   for(let i=-2;i<=2;i++)sub(.4,.05,1.0,st.awn[(i+2)%2],i*.4,2.82,OUT+.52,'canvas',{rx:0});
   sub(2.05,.1,.05,st.awn[0],0,2.74,OUT+1.03,'canvas');
   for(const sd of[-1,1])sub(.04,.5,.04,0x2a2a2a,sd*.9,2.58,OUT+.3,'steel',{rx:0});
   cnt('awning');
  }else if(st.name==='european'){   // porch canopy + steps
   for(const sd of[-1,1])sub(.1,2.55,.1,0xece8dc,sd*1.0,1.28,OUT+.9,'plaster');
   sub(2.5,.07,.1,0x3a3a40,-.0,2.56,OUT+.95,'slate');
   const a1=sub(2.5,.06,1.15,0x3a3a42,0,2.66,OUT+.5,'slate',{rx:0});a1.position.y+=.06;
   sub(2.1,.16,.6,0x9a968c,0,.08,OUT+.4,'concrete');sub(1.9,.16,.9,0xa8a49a,0,.04,OUT+.55,'concrete');cnt('porch');
   sub(.28,.18,.02,0xd8d2c0,.0,2.2,OUT+.2,'plaster');   // number plate
  }else{   // modern trellis arch
   for(const sd of[-1,1])sub(.08,2.7,.08,0x6a5030,sd*.98,1.35,OUT+.8,'timber');
   sub(2.1,.08,.08,0x6a5030,0,2.7,OUT+.8,'timber');
   for(let i=-2;i<=2;i++)sub(.05,.05,.8,0x6a5030,i*.4,2.74,OUT+.4,'timber');
   for(let j=0;j<8;j++){const sd=j%2?1:-1,p=place(r,k,o.c+sd*.98,R(.3,2.6),OUT+.8);blob(g,R(.12,.2),PK(st.leaf),p[0],p[1],p[2],1,1,1)}
   cnt('arch');
  }
  // pots either side
  for(const sd of[-1,1]){const a=sd*(1.2+(st.name==='european'?.3:0)),p=place(r,k,o.c+a,.3,OUT+.4);
   P(g,cyl(.26,.55,10),st.pot,p[0],.28,p[2],'vase');
   const n=st.name==='greek'?4:3;for(let i=0;i<n;i++)blob(g,R(.14,.22),PK(st.leaf),p[0]+R(-.14,.14),.75+R(0,.3),p[2]+R(-.14,.14),1,1,1);
   for(let i=0;i<(st.name==='modern'?5:3);i++)blob(g,R(.06,.1),PK(st.bloom),p[0]+R(-.22,.22),.8+R(0,.4),p[2]+R(-.22,.22),1,1,1);cnt('pot')}
  // wall lantern (warm, glows after dark through bloom)
  {const p=place(r,k,o.c+1.15,2.45,OUT+.12);const m=P(g,bx(.14,.22,.14),0xffd9a1,p[0],p[1],p[2],0);m.material.emissive.setHex(0xffb860);cnt('lantern');
   const p2=place(r,k,o.c+1.15,2.62,OUT+.12);P(g,bx(.18,.04,.18),0x1c1c1e,p2[0],p2[1],p2[2],'steel')}
 }}
}

/* ---------------------------------- exterior: wall bands, quoins, ivy ---------------------------------- */
/* v075: bands and ivy only go where a real wall stands. They used to follow the group's declared footprint, which for the full-block
   buildings is the whole 40 x 36 plot (their walls are inside it) and for open lots (car lot, parks, forests...) is a 38 x 34 yard
   with no walls at all, so cornice strips, plinths and ivy floated along plot edges in random places. */
function bands(r,st,lvl){
 const g=r.g,h=r.bh,w=r.bw,d=r.bd,yTop=Math.max(1.2,h-.4);
 for(const[k,len] of[['f',w],['b',w],['r',d],['l',d]]){const si=sideInfo[k],p=si.s*(wallPos(r,k)+OUT+.09),pp=si.s*(wallPos(r,k)+OUT+.06);
  for(const[a0,a1] of wallRuns(r,k,-len/2,len/2,yTop)){if(!wallAt(r,k,(a0+a1)/2,.4))continue;
   const ext0=a0<=-len/2+.3?.2:0,ext1=a1>=len/2-.3?.2:0,c=(a0-ext0+a1+ext1)/2,L=a1-a0+ext0+ext1;
   P(g,si.ax?bx(L,.22,.2):bx(.2,.22,L),st.trim,si.ax?c:p,h-.1,si.ax?p:c,'plaster');cnt('cornice');
   if(st.name!=='greek'){P(g,si.ax?bx(L-.1,.5,.14):bx(.14,.5,L-.1),0x77736a,si.ax?c:pp,.25,si.ax?pp:c,'concrete');cnt('plinth')}}}
 if(st.name==='european'&&lvl>0){   // stone quoins on the front corners (only where the corner is a real wall)
  for(const sx of[-1,1]){if(!wallAt(r,'f',sx*(w/2-.3),1)||!wallAt(r,'f',sx*(w/2-.3),yTop))continue;
   for(let i=0;i<Math.floor(h/.5);i++){const big=i%2===0;P(g,bx(big?.55:.38,.26,.36),0xd9cfb6,sx*(w/2+OUT-.05),.25+i*.5,r.bd/2+OUT-.05,'ashlar');cnt('quoin')}}
 }
}
function ivy(r,st,amount){
 const g=r.g,O=openings(r),yTop=Math.max(1.2,r.bh-.4);
 for(let n=0;n<amount;n++){const k=PK(['f','b','r','l']),len=wallLen(r,k),c=R(-len/2+1.4,len/2-1.4),top=R(1.4,Math.min(r.bh-.3,3.4)),cnt0=RI(12,20);
  if(!wallAt(r,k,c,.5)||!wallAt(r,k,c,yTop))continue;
  for(let i=0;i<cnt0;i++){const a=c+R(-1.3,1.3),y=R(.1,top)*(Math.abs(a-c)<.5?1:.7);if(inO(O[k],a,y,.1)||!wallAt(r,k,a,Math.max(.2,y)))continue;
   const p=place(r,k,a,y,OUT+.07);blob(g,R(.15,.3),PK(st.leaf),p[0],p[1],p[2],sideInfo[k].ax?1:.45,1,sideInfo[k].ax?.45:1,'ivy');cnt('ivy')}}
}

/* ---------------------------------- yard (houses): pergola, laundry, hedge, barrel, mailbox, conservatory ---------------------------------- */
const rectHit=(arr,x,z,pad)=>arr.some(a=>x>a.x0-pad&&x<a.x1+pad&&z>a.z0-pad&&z<a.z1+pad);
function freeSpot(L,r,lx,lz,pad){   // local -> world, test against roads, other buildings, plot edges (front sidewalk)
 const c=r.cs,wx=r.g.position.x+c*lx,wz=r.g.position.z+c*lz;
 if(rectHit(L.roads,wx,wz,2.2)||rectHit(L.alleys,wx,wz,1.8))return false;
 for(const b of buildings){if(b.x===r.b.x&&b.z===r.b.z)continue;if(Math.abs(wx-b.x)<b.w/2+pad&&Math.abs(wz-b.z)<b.d/2+pad)return false}
 const p=L.plots.find(p=>wx>=p.x0&&wx<=p.x1&&wz>=p.z0&&wz<=p.z1);if(!p)return false;
 if(wx<p.x0+.8||wx>p.x1-.8||wz<p.z0+.8||wz>p.z1-.8)return false;return true;
}
function yard(L,r,st,lvl){
 const g=r.g,w=r.bw,d=r.bd;
 // pergola with vine on a side wall
 if(Math.random()<.55){const sd=Math.random()<.5?-1:1,len=R(3.2,4.6),a0=R(-d/2+3,d/2-3-len),x0=sd*(w/2+.35),x1=sd*(w/2+2.8);
  if(freeSpot(L,r,sd*(w/2+1.6),a0+len/2,.8)&&freeSpot(L,r,sd*(w/2+2.8),a0,.8)&&freeSpot(L,r,sd*(w/2+2.8),a0+len,.8)){
   for(const x of[x0+.1*sd,x1])for(const z of[a0,a0+len])P(g,bx(.12,2.7,.12),0x6a5030,x,1.35,z,'timber');
   for(const z of[a0,a0+len])P(g,bx(2.6,.1,.12),0x6a5030,(x0+x1)/2,2.72,z,'timber');
   for(let i=0;i<9;i++)P(g,bx(.07,.07,len+.2),0x7a6040,x0+.1*sd+(x1-x0-.1*sd)*(i/8),2.8,a0+len/2,'timber');
   for(let i=0;i<RI(14,22);i++)blob(g,R(.14,.28),PK(st.leaf),R(Math.min(x0,x1),Math.max(x0,x1)),2.88+R(0,.1),a0+R(0,len),1,.55,1,'wisteria');
   if(st.name==='greek'||st.name==='modern'){P(g,bx(1.1,.07,.8),0x7a5a3a,(x0+x1)/2,.72,a0+len/2,'wood');P(g,bx(.1,.7,.1),0x6a4a2a,(x0+x1)/2,.35,a0+len/2,'wood');
    for(const sz of[-.75,.75]){P(g,bx(.4,.06,.4),0x7a5a3a,(x0+x1)/2,.45,a0+len/2+sz,'wood');P(g,bx(.4,.4,.05),0x7a5a3a,(x0+x1)/2,.68,a0+len/2+sz*1.1,'wood')}}
   cnt('pergola');mark('pergola',r,sd*(w/2+1.6),a0+len/2)}}
 // laundry line between the back wall and a post
 if(Math.random()<.5){const sd=Math.random()<.5?-1:1,z=-d/2-.4,xa=-w/2+1,xb=w/2-1,zz=z-3.2;
  if(freeSpot(L,r,0,zz,1.2)){P(g,cyl(.04,3.2,6),0x4a4036,xb,1.6,zz,'timber');P(g,cyl(.04,3.2,6),0x4a4036,xa,1.6,zz,'timber');
   P(g,bx(xb-xa,.015,.015),0xcfcab8,(xa+xb)/2,3.05,zz,0);
   for(let i=0;i<RI(4,7);i++){const x=R(xa+.5,xb-.5),cl=PK(st.curtain.concat([0x2f6db0,0xd44c3c,0xe9c93a,0xf4f2ea]));const m=P(g,bx(R(.4,.75),R(.4,.7),.02),cl,x,2.8,zz,'linge',0,0,R(-.06,.06));m.position.y-=0}
   cnt('laundry');mark('laundry',r,0,zz)}}
 // low hedge on one side boundary
 if(lvl>1&&Math.random()<.5){const sd=Math.random()<.5?-1:1,x=sd*(w/2+3.8);
  if(freeSpot(L,r,x,0,.6)&&freeSpot(L,r,x,d/2-1,.6)&&freeSpot(L,r,x,-d/2+1,.6)){const n=RI(7,11);for(let i=0;i<n;i++){const z=-d/2+1+(d-2)*i/(n-1);blob(g,R(.55,.72),PK(st.leaf),x,.6,z,1,.95,1);}cnt('hedge')}}
 // rain barrel + watering can (modern / european)
 if(st.name!=='greek'&&Math.random()<.6){const sd=Math.random()<.5?-1:1,x=sd*(w/2+.55),z=-d/2+1.4;if(freeSpot(L,r,x,z,.5)){P(g,cyl(.38,.9,12),0x4a6a8a,x,.45,z,'steel');P(g,bx(.22,.18,.22),0x3f7a35,x+sd*.1,.1,z+.7,'steel');cnt('barrel')}}
 // mailbox + number at the front boundary
 if(Math.random()<.7){const x=R(-w/2+1,w/2-1),z=d/2+2.1;if(freeSpot(L,r,x,z,.3)){P(g,bx(.07,1.05,.07),0x3a3a3a,x,.52,z,'steel');P(g,bx(.3,.22,.4),st.name==='european'?0xe4c02a:0x2f6db0,x,1.15,z,'rollshutter');cnt('mailbox')}}
 // modern: glass lean-to conservatory on the back
 if(st.name==='modern'&&lvl>1&&Math.random()<.55){const cw=R(4,5.5),cd=2.4,cx=R(-w/2+cw/2+.8,w/2-cw/2-.8),z0=-d/2-OUT;
  if(freeSpot(L,r,cx,z0-cd,.6)&&freeSpot(L,r,cx-cw/2,z0-cd,.6)&&freeSpot(L,r,cx+cw/2,z0-cd,.6)){
   const fr=0xe8e6dc,gl=0xa8d8e0;
   for(const sx of[-1,0,1])P(g,bx(.08,2.4,.08),fr,cx+sx*cw/2,1.2,z0-cd,'steel');for(const sx of[-1,1])P(g,bx(.08,2.4,.08),fr,cx+sx*cw/2,1.2,z0,'steel');
   P(g,bx(cw,.1,.08),fr,cx,2.4,z0-cd,'steel');P(g,bx(cw,.1,.08),fr,cx,.05,z0-cd,'steel');
   for(const sx of[-1,1])P(g,bx(.08,.08,cd),fr,cx+sx*cw/2,2.4,z0-cd/2,'steel');
   const slope=P(g,bx(cw,.05,cd+.2),fr,cx,2.7,z0-cd/2,'steel');slope.rotation.x=-.12;
   // glass (transparent, unmerged on purpose)
   const gm=mesh(bx(cw-.1,2.25,.02),gl,cx,1.2,z0-cd,g);gm.material=gm.material.clone();gm.material.transparent=true;gm.material.opacity=.25;gm.material.depthWrite=false;
   for(const sx of[-1,1]){const s2=mesh(bx(.02,2.25,cd),gl,cx+sx*cw/2,1.2,z0-cd/2,g);s2.material=gm.material}
   // plants + bench inside
   for(let i=0;i<RI(5,8);i++){const x=cx+R(-cw/2+.4,cw/2-.4),z=z0-R(.4,cd-.4);P(g,cyl(.2,.4,8),st.pot,x,.2,z,'vase');for(let j=0;j<3;j++)blob(g,R(.14,.22),PK(st.leaf),x+R(-.1,.1),.55+R(0,.35),z+R(-.1,.1),1,1,1)}
   cnt('conservatory');mark('conservatory',r,cx,z0-cd/2)}}
}

/* ---------------------------------- interiors ---------------------------------- */
function interior(r,st,lvl){
 const g=r.g,w=r.bw,d=r.bd,O=openings(r);
 const floors=[0];if(r.wins.some(x=>x.l.y-.9>2))floors.push(3.1);
 for(const y0 of floors){
  const top=y0>0?6:r.bh;if(top-y0>4.6)continue;
  // skirting + crown along the inside of the exterior walls (broken at openings)
  for(const k of['f','b','r','l']){const si=sideInfo[k],len=wallLen(r,k),inner=si.s*(wallPos(r,k)-OUT-.03);
   const segs=[[-len/2+.2,len/2-.2]];
   for(const o of O[k]){if(o.y0>y0+1.5||o.y0<y0-1.5)continue;for(let i=segs.length-1;i>=0;i--){const[s0,s1]=segs[i];if(o.a1<=s0||o.a0>=s1)continue;segs.splice(i,1);if(o.a0>s0)segs.push([s0,o.a0]);if(o.a1<s1)segs.push([o.a1,s1])}}
   for(const[q0,q1]of segs){if(q1-q0<.3)continue;
    for(const[s0,s1]of wallRuns(r,k,q0,q1,y0+.45)){const c=(s0+s1)/2,l2=s1-s0;if(si.ax)P(g,bx(l2,.13,.04),0xe9e5da,c,y0+.1,inner,'plaster');else P(g,bx(.04,.13,l2),0xe9e5da,inner,y0+.1,c,'plaster')}
    for(const[s0,s1]of wallRuns(r,k,q0,q1,top-.3)){const c=(s0+s1)/2,l2=s1-s0;if(si.ax)P(g,bx(l2,.1,.06),0xe9e5da,c,top-.08,inner,'plaster');else P(g,bx(.06,.1,l2),0xe9e5da,inner,top-.08,c,'plaster')}cnt('skirting')}
   // framed pictures on bare wall stretches
   if(lvl>1)for(const[s0,s1]of segs){if(s1-s0<2.4||Math.random()>.5)continue;const a=(s0+s1)/2+R(-.4,.4),y=y0+R(1.5,1.85),pw=R(.6,1.0),ph=R(.5,.75);
    if(![-1,-.5,0,.5,1].every(f=>wallAt(r,k,a+f*(pw/2+.15),y)&&wallAt(r,k,a+f*(pw/2+.15),y+ph/2)&&wallAt(r,k,a+f*(pw/2+.15),y-ph/2)))continue;
    const fr=PK([0x3a2a1a,0xb8984a,0xe9e5da]),cv=PK(st.pic),iw=si.ax,pos=iw?[a,y,inner]:[inner,y,a],off=-si.s*.03;
    P(g,iw?bx(pw+.1,ph+.1,.04):bx(.04,ph+.1,pw+.1),fr,pos[0],pos[1],pos[2],'wood');
    const px=iw?pos[0]:pos[0]+off,pz=iw?pos[2]+off:pos[2];P(g,iw?bx(pw,ph,.02):bx(.02,ph,pw),cv,px,pos[1],pz,'canvas');
    if(st.name==='modern'){P(g,iw?bx(pw*.5,ph*.4,.025):bx(.025,ph*.4,pw*.5),0x58903f,px,pos[1]+ph*.1,pz,0)}cnt('picture')}
  }
  // curtains at windows
  for(const wn of r.wins){const l=wn.l;if(Math.abs(l.y-.9-y0)>.3)continue;const ax=wn.ax?1:0;const ext=ax?Math.abs(l.z)>=d/2-.05:Math.abs(l.x)>=w/2-.05;if(!ext||Math.random()>.65)continue;
   const s=ax?Math.sign(l.z):Math.sign(l.x),cc=PK(st.curtain),inn=-s*(OUT+.1);
   for(const sd of[-1,1]){const a=sd*.88,x=ax?l.x+a:l.x+inn,z=ax?l.z+inn:l.z+a;P(g,ax?bx(.34,2.3,.05):bx(.05,2.3,.34),cc,x,y0+1.7,z,'linge')}
   const x=ax?l.x:l.x+inn,z=ax?l.z+inn:l.z;P(g,ax?bx(2.2,.06,.06):bx(.06,.06,2.2),0x3a2a1a,x,y0+2.88,z,'wood');cnt('curtain')}
  // rug
  if(lvl>1&&Math.random()<.8){const rx=R(-w/5,w/5),rz=R(-d/5,d/5),rw=R(2.2,3.0),rd=R(1.5,2.2),yy=y0+.05;const a=st.rug[0],b=st.rug[1];
   P(g,bx(rw,.012,rd),a,rx,yy,rz,'laine');P(g,bx(rw-.3,.014,rd-.3),b,rx,yy+.002,rz,'laine');P(g,bx(rw-.6,.016,rd-.6),a,rx,yy+.004,rz,'laine');cnt('rug')}
  // pendant lamp
  if(Math.random()<.85){const lx=R(-w/4,w/4),lz=R(-d/4,d/4);P(g,bx(.02,.7,.02),0x2a2a2a,lx,top-.35,lz,0);
   P(g,cone(.3,.28,10),st.lamp,lx,top-.84,lz,'wood',0,PI);
   const bm=P(g,bx(.1,.1,.1),0xffe9b8,lx,top-.9,lz,0);bm.material.emissive.setHex(0xffd890);cnt('pendant')}
 }
}

/* ---------------------------------- driver ---------------------------------- */
ARCH.styleOf=b=>styleFor(b).name;
ARCH.run=function(L,fortMode){
 for(const k in N)delete N[k];ARCH.marks.length=0;
 const lvl=FX.s.arch;if(!lvl)return;
 const t0=performance.now(),rs=collect();
 for(const r of rs){
  const t=String(r.b.t||''),ruin=(r.b.cond==null?9:r.b.cond)<=1,house=r.bw<=20&&!/church|school|clinic|bank|mausoleum|shed/.test(t);   // lots are named businesses: any small building gets a garden / terrace
  if(/gas|water|park|cemetery/.test(t))continue;
  if(!(r.bh>=1.2))continue;   /* v075: open lots (yard groups, height 0) have no walls to decorate */
  const st=styleFor(r.b);CURST=st;
  try{
   if(fortMode){if(lvl>1)interior(r,st,lvl);if(G.fort==='school')ivy(r,st,2);continue}
   windows(r,st,lvl,true);doorsFx(r,st,lvl);bands(r,st,lvl);
   if(st.name==='modern'||ruin)ivy(r,st,ruin?RI(3,5):RI(1,3));
   else if(lvl>1&&Math.random()<.3)ivy(r,st,1);
   if(lvl>1&&house&&L)yard(L,r,st,lvl);
   if(lvl>1&&r.bw<40)interior(r,st,lvl);
  }catch(e){if(!ARCH.err){ARCH.err=1;console.warn('[arch] building failed',t,e)}}
 }
 N.buildings=rs.length;N.ms=Math.round(performance.now()-t0);
 ARCH.stats=Object.assign({},N);console.log('[arch] '+JSON.stringify(N));
};
const od=W.decor;
W.decor=function(){
 od.apply(this,arguments);
 try{
  if(G.mode==='EXPEDITION'){if(window.__fortZombieTown&&__fortZombieTown.layout)ARCH.run(__fortZombieTown.layout,false)}
  else ARCH.run(null,true);
 }catch(e){console.warn('[arch] failed',e)}
};
console.log('[arch] architecture layer ready');
})();
