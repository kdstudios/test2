/* ==========================================================================================================
   MINI FORT ZOMBIE - MISSING LOTS FROM zMissionMapDB (v073): placeholder builders so every lot type the original
   MissionMap names has a building in the town generator. Built with the v036 kit (pb / subB / yard), like the other
   not-yet-overhauled lots; each one is meant to get the full-detail treatment later.

   HALF-PLOT (20 x 36 sub-plot, 16 x 22 building, front = +Z):
     small_house, medium_house, fortified_house (Res_* doubles / _Fort lots), fire_hall (Firehall_Boutique),
     vet_clinic, bakery (business_butcher_bakery), army_surplus, diner (Diner_Damaged), furniture_store (furniture_corner)
   FULL-PLOT (40 x 36):
     large_house (Res_Large_Corner), auto_body_shop, forest_a / forest_b (Forest01 / 02), aid_station
     (ParkingLot_Aid_Station), field_hospital (Playground_Corner_Field_Hospital), cab_depot (ParkingLot_Yellow_Cab),
     plant_nursery, skatepark, park (Park / park_corner), dead_park (Dead_Park)
   `max` follows MaxCount 1 in zMissionMapDB; houses carry `min` so every town has some (Survivors rumours want a house 70% of the time).
   ========================================================================================================== */
(function(){
if(typeof NEWCAT==='undefined'||typeof pb!=='function'||typeof yard!=='function'){console.warn('[newlots] core missing');return}

/* ---------------- loot tables for the new lot types ---------------- */
Object.assign(LOOT_TABLES,{
 surplus:{military_rations:4,machete:2,crowbar:1,shovel:2,rope:3,duct_tape:2,bungie_cord:2,gauze:2,water_jug:2,bug_spray:1,gas_can:1,ammo_556:2,ammo_762:1,ammo_45:1,m1911a1:1},
 furniture:{nails:2,duct_tape:2,rope:2,bungie_cord:2,spring:3,cotton_balls:1,hairspray:1,cookies:1,crackers:1,water_jug:1},
 nursery:{shovel:3,pitchfork:2,sickle:2,machete:1,bug_spray:3,rope:2,water_jug:3,atomic_veggies:3,salad:2,gas_can:1,duct_tape:1},
 aid:{medkit:2,gauze:4,medical_tape:3,antibiotics:3,painkiller:3,cotton_balls:2,water_jug:4,military_rations:4,granola:2,crackers:2}});
for(const tn of['surplus','furniture','nursery','aid'])for(const id in LOOT_TABLES[tn])if(!ITEMS[id]){console.error('[newlots] loot table '+tn+' has unknown item '+id);delete LOOT_TABLES[tn][id]}
Object.assign(LOOT_PROP,{surplus:'ammo_crate',furniture:'crate',nursery:'crate',aid:'cabinet'});
try{const A=window.MFZPROP&&MFZPROP.auto;if(A){const pick=(...ts)=>[...new Set(ts.flatMap(t=>A[t]||[]))];
 A.surplus=pick('gunshop','warehouse');A.furniture=pick('house','office');A.nursery=pick('hardware','barn');A.aid=pick('clinic')}}catch(e){console.warn('[newlots] prop auto map',e)}

/* ---------------- shared bits ---------------- */
const HX0=-7.8,HX1=7.8,HZ0=-10.8,HZ1=10.8;
/* v074: real trees / shrubs / flower cards from the flora layer (same models as the town), real vehicles from vehicles.js */
const tree2=(B,x,z,s=1,dead=false)=>bldTree(B,x,z,s*.72,dead?{dead:1}:{});
const pine=(B,x,z,s=1)=>bldTree(B,x,z,s*.72,{kind:'cedar'});
const shrub=(B,x,z)=>{bush(WX(B,x),WZ(B,z));const t=treeList[treeList.length-1];if(t)t.keep=1;B.occ.push([x-.7,x+.7,z-.7,z+.7])};
const FLOW=['roseR','roseP','roseW','roseY','tulipR','tulipP','iris','lavender','dahlia','peony','hydB','hydP','azalea'],GRASS=['grass','grassT','clover','meadow'];
const floraOn=()=>!!(window.RGFLORA&&RGFLORA.on());
const flower=(B,x,y,z,size,kinds)=>{if(floraOn()){RGFLORA.leaf(RGFLORA.batch(B.g),PK(kinds||FLOW),x,y,z,size||.6);return}
 mesh(new THREE.SphereGeometry((size||.6)*.4,6,4),PK([0x2f5a28,0x3a7a2a,0xc04a6a,0xe0c040]),x,y+(size||.6)*.35,z,B.g)};
const flushFlora=()=>{try{if(floraOn())RGFLORA.flush()}catch(e){}};
const veh=(B,kind,x,z,ry=0,o)=>{if(!window.MFZV)return null;const g=MFZV.make(kind,WX(B,x),WZ(B,z),ry+(B.cs<0?PI:0),o);const h=g&&g.userData&&g.userData.half;
 const hx=h?h[0]:1.2,hz=h?h[1]:2.4;B.occ.push([x-hx,x+hx,z-hz,z+hz]);return g};
const tent=(B,x,z,len,r,col,ry=0)=>{const gg=new THREE.CylinderGeometry(r,r,len,3);gg.rotateX(-PI/2);const m=mesh(gg,col,x,r*.5,z,B.g);m.rotation.y=ry;addSolid(m);
 const sw=Math.abs(Math.sin(ry))>.5,hx=(sw?len:r*1.75)/2,hz=(sw?r*1.75:len)/2;B.occ.push([x-hx,x+hx,z-hz,z+hz]);return m};
const sandbags=(B,x0,x1,z0,z1,h=.9)=>{slab(B,x0,x1,z0,z1,0,h,0x8a7a52);const L=Math.max(x1-x0,z1-z0),ax=(x1-x0)>(z1-z0);for(let y=.22;y<h;y+=.3)deco(B,ax?L+.05:z1-z0+.06,.04,ax?z1-z0+.06:L+.05,(x0+x1)/2,y,(z0+z1)/2,0x6a5a3a);B.occ.push([x0,x1,z0,z1])};
const chain=(B,x0,x1,z0,z1,h=2)=>{const m=mesh(BX(Math.max(.05,x1-x0),h,Math.max(.05,z1-z0)),0x8a8f94,(x0+x1)/2,h/2+.1,(z0+z1)/2,B.g);m.material.transparent=true;m.material.opacity=.35;addSolid(m);
 const ax=(x1-x0)>(z1-z0),L=ax?x1-x0:z1-z0;for(let u=0;u<=L+.01;u+=2.5)deco(B,.08,h+.2,.08,ax?x0+u:x0,(h+.2)/2,ax?z0:z0+u,0x777c80);return m};
const perimChain=(B,W,F,gapF,gapR)=>{const gf=gapF||[-3,3];chain(B,-W,gf[0],F,F);chain(B,gf[1],W,F,F);if(gapR){chain(B,-W,gapR[0],-F,-F);chain(B,gapR[1],W,-F,-F)}else chain(B,-W,W,-F,-F);chain(B,-W,-W,-F,F);chain(B,W,W,-F,F)};
const car=(B,x,z)=>{try{PR.car(B,x,z)}catch(e){}};
const bench=(B,x,z,ry=0)=>{const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;B.g.add(g);mesh(BX(1.8,.08,.45),0x6a4a2a,0,.45,0,g);mesh(BX(1.8,.4,.06),0x6a4a2a,0,.7,-.2,g);for(const s of[-.8,.8])mesh(BX(.08,.45,.45),0x333333,s,.22,0,g);addSolid(g);B.occ.push([x-1,x+1,z-.5,z+.5])};
const picnic=(B,x,z)=>{slab(B,x-.9,x+.9,z-.4,z+.4,.7,.78,0x7a5a3a);for(const s of[-.75,.75])slab(B,x-.9,x+.9,z+s-.15,z+s+.15,.42,.48,0x7a5a3a);for(const s of[-.7,.7])deco(B,.08,.7,1.6,x+s,.35,z,0x5a4a3a);B.occ.push([x-1,x+1,z-1,z+1])};
const lampPost=(B,x,z)=>{cyl(B,.07,4,x,2,z,0x2a2a2a,true,6);const l=mesh(new THREE.SphereGeometry(.25,8,6),0xfff2c0,x,4.1,z,B.g);l.material.emissive.setHex(0x887744)};
const hydrant=(B,x,z)=>{cyl(B,.16,.7,x,.35,z,0xc81e1e,true,8);cyl(B,.2,.08,x,.72,z,0xc81e1e,false,8);deco(B,.5,.12,.12,x,.45,z,0xc81e1e)};
const flagpole=(B,x,z,c=0xb91c1c)=>{cyl(B,.06,7,x,3.5,z,0xcccccc,true,6);deco(B,1.3,.75,.04,x+.66,6.4,z,c)};
const crossPanel=(B,x,y,z,s=1,ry=0)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;B.g.add(g);mesh(BX(1.4*s,1.4*s,.04),0xf4f4f0,0,0,0,g);mesh(BX(1*s,.3*s,.06),0xc81e1e,0,0,0,g);mesh(BX(.3*s,1*s,.06),0xc81e1e,0,0,0,g)};
const swingSet=(B,x,z)=>{for(const s of[-1,1])slab(B,x+s*2.4-.1,x+s*2.4+.1,z-.1,z+.1,0,2.5,0x8a8f94);slab(B,x-2.5,x+2.5,z-.08,z+.08,2.45,2.6,0x8a8f94);for(const s of[-.9,.9]){deco(B,.03,2.2,.03,x+s,1.4,z,0x222222);deco(B,.5,.06,.2,x+s,.35,z,0xc0392b)}B.occ.push([x-2.6,x+2.6,z-1.2,z+1.2])};
const slide=(B,x,z)=>{slab(B,x-.8,x+.8,z-.5,z+.5,0,1.9,0x2a6ad0);const s=mesh(BX(.9,.1,3.2),0xe8b030,x,.95,z+2.2,B.g);s.rotation.x=.6;B.occ.push([x-1,x+1,z-.7,z+3.8])};
const tyres=(B,x,z,n=4)=>{for(let i=0;i<n;i++){const t=mesh(new THREE.TorusGeometry(.38,.14,6,12),0x1a1a1a,x,.14+i*.28,z,B.g);t.rotation.x=PI/2}const b=new THREE.Box3(new THREE.Vector3(WX(B,x)-.55,0,WZ(B,z)-.55),new THREE.Vector3(WX(B,x)+.55,n*.28,WZ(B,z)+.55));solids.push(b);B.occ.push([x-.6,x+.6,z-.6,z+.6])};
const drum=(B,x,z,c)=>cyl(B,.3,.9,x,.45,z,c||PK([0x2a5a8a,0x8a2a2a,0x3a5a2a]),true,10);
const sideSign=(B,txt,x,y,z,w,h,bg,fg,font)=>tsign(B.g,txt,x,y,z,w,h,bg,fg,font||'bold 56px Impact');
const SP=(B,lx,lz,name,table,ry=0)=>{try{if(window.spawnPropContainer){spawnPropContainer(WX(B,lx),WZ(B,lz),name,table,B.cs>0?ry:ry+PI,0);B.occ.push([lx-1,lx+1,lz-1,lz+1]);return}}catch(e){}cont(B,table,lx,lz)};
const zN=(B,n,r)=>{for(let i=0;i<n;i++)zAt(B,rnd(r[0],r[1]),rnd(r[2],r[3]))};
/* furniture types so loot never lands inside them (pb furnishes + places loot before its extras run) */
Object.assign(FT,{kennel:[1,1.5,[[1,.8,1.5,0,.42,0,0x9aa0a8],[1,.8,1.5,0,1.24,0,0x9aa0a8],[.04,1.6,1.4,.51,.84,0,0x555a60]]],
 fireengine:[2.6,8.2,[[2.6,.01,8.2,0,.036,0,0x4a4a48]]]});

/* ====================================== HALF-PLOT HOUSES ====================================== */
const HOUSE_WALLS=[0x8a7f73,0x7c8a73,0x73808a,0x8a7373,0xa09070,0x6f7f8f,0xd8d4c4,0xb8c4c8,0xc9c0a8,0x8a4a3a,0xa8b89a,0xc4b08a];
function houseYard(B,rearShed){B.y=0;   /* v076: the house builder leaves B.y at the upstairs floor (3.1 m); yard loot sat up there */
 PR.lawn(B,0,19.6,7.2,16.3,PK([0x3f6a2f,0x4a7034,0x55703a]));PR.pave(B,B.dx||0,1.3,7.3,16.35,0x9a9a94);
 const side=(B.dx||0)>0?-1:1;PR.pave(B,side*6.9,3,7.3,16.35,0x6a6a68);if(Math.random()<.65)car(B,side*6.9,12.3);
 deco(B,.1,1,.1,-(side)*8.6,.5,15.6,0x555555);deco(B,.45,.35,.25,-side*8.6,1.1,15.6,PK([0x2a5a9a,0x222222,0x8a2a2a]));
 for(let i=0;i<3;i++){const px=-side*(2.6+i*2.6);if(Math.abs(px-(B.dx||0))<1.6)continue;shrub(B,px,7.9)}for(let i=0;i<6;i++)flower(B,rnd(-8.5,8.5),0,rnd(7.6,8.3),rnd(.45,.65));
 if(Math.random()<.5)tree2(B,-side*6.5,12.6,.85);
 PR.lawn(B,0,19.6,-17.6,-7.2,PK([0x3f6a2f,0x4a7034]));PR.pave(B,0,4,-9.4,-7.1,0x8a8a84);
 if(rearShed){const sx=PK([-6.5,6.5]);slab(B,sx-1.4,sx+1.4,-16.8,-14.4,0,2.3,0x7a6a52);deco(B,3.1,.12,2.7,sx,2.38,-15.6,0x4a3a2a);B.occ.push([sx-1.6,sx+1.6,-17,-14.2]);cont(B,'hardware',sx,-13.4)}
 if(Math.random()<.6){deco(B,.08,1.9,.08,-4,.95,-12,0x777777);deco(B,.08,1.9,.08,4,.95,-12,0x777777);deco(B,8,.02,.02,0,1.85,-12,0xdddddd);for(let i=0;i<4;i++)deco(B,.6,.7,.02,-2.5+i*1.6,1.45,-12,PK([0xe8e8e0,0x6a8aca,0xc04a4a,0xd8c060]))}
 if(Math.random()<.5){cyl(B,.35,.9,2.5,.45,-9.8,0x222222,true,10);deco(B,.8,.06,.8,2.5,.92,-9.8,0x555555)}}
function hHouse(kind){return function(x,z,t){
 const two=kind==='small'?false:true,feats=kind==='small'?(Math.random()<.6?['porch']:[]):PK([['porch','chimney'],['chimney'],['balcony'],['porch'],['porch','balcony']]);
 bHouse(x,z,{id:t.id,hv:{two,walls:HOUSE_WALLS,roof:kind==='small'?PK(['gable','pyr']):PK(['gable','pyr','gable','flat']),feats}});const B=LASTB;
 houseYard(B,kind!=='small'||Math.random()<.4);
 if(kind==='fort'){/* boarded windows, sandbag line, wire, warnings - survivors dug in here */
  for(const c of fw(16,B.dx,3.2))for(const a of[.5,-.5]){const p=deco(B,1.9,.2,.05,c,1.85,7.2,0x7a5a3a);p.rotation.z=a}
  for(const c of fw(14,99,3.2))for(const sx of[-8.2,8.2])for(const a of[.5,-.5]){const p=deco(B,.05,.2,1.9,sx,1.85,c,0x7a5a3a);p.rotation.x=a}
  const gx=B.dx||0;sandbags(B,-9.4,gx-1.4,9.2,9.9);sandbags(B,gx+1.4,9.4,9.2,9.9);
  for(let u=-9.6;u<=9.6;u+=.8)deco(B,.05,.05,.6,u,1.15,9.55,0x9a9a9a);
  sideSign(B,'KEEP OUT',PK([-5,4]),2.2,7.25,2.4,.6,'#5a4a3a','#e8e8e8','bold 60px Impact');
  slab(B,-7,-5,-14,-12.6,0,1.1,0x3a5a3a);cyl(B,.35,1,6,.5,-10,0x4a6a8a,true,10);cyl(B,.35,1,6.8,.5,-10,0x4a6a8a,true,10);
  for(let i=0;i<3;i++)flatM(3.4,.8,0x5a4026,-1,.031,-14+i*1.2,B.g);
  cont(B,'warehouse',-3,-13);cont(B,'house',3,-15.5)}
 LASTB=B;return B}}

/* ====================================== HALF-PLOT COMMERCIAL / CIVIC ====================================== */
function hFireHall(x,z,t){return pb(x,z,t,{w:16,d:22,h:5.6,wall:0xa83a2a,floor:0x8a8a86,door:0x3a3a3a,pc:0xd8d0c4,dx:5.4,bd:4,
 f:[{k:'g',c:-5.4},{k:'g',c:-3.8},{k:'g',c:-2.2},{k:'g',c:-.6},{k:'w',c:2.5},{k:'d',c:5.4}],b:[{k:'w',c:-5},{k:'d',c:4,s:-1},{k:'w',c:6.5}],
 walls:[[1,-3,HX0,HX1,[{k:'d',c:-4.5},{k:'d',c:4}]],[0,1.2,-2.85,HZ1,[{k:'d',c:4.5}]],[0,0,HZ0,-3.15,[]]],
 rooms:[{r:[1.35,HX1,-2.85,HZ1],f:[['desk','e',.5],['chair','e',.5,-.7,0,PI/2],['locker','n',.3],['locker','n',.55],['shelf','w',.15]],loot:'fire',n:1},
  {r:[-4.4,-1.6,-1.6,7.4],f:[['fireengine','c',.5]]},{r:[HX0,-4.45,-2.85,HZ1],f:[['locker','w',.08],['locker','w',.22],['locker','w',.36]],loot:'fire',n:2},
  {r:[HX0,-.15,HZ0,-3.15],f:[['cot','n',.15],['cot','n',.5],['cot','n',.85],['box','s',.5]],loot:'fire',n:1},
  {r:[.15,HX1,HZ0,-3.15],f:RM.kitchen,loot:'fire',n:1}],
 x:B=>{veh(B,'firetruck',-3,2.9,0);deco(B,4.9,.6,.3,-3,2.82,10.9,0xcfcfcf);for(let i=0;i<4;i++)deco(B,4.8,.05,.05,-3,2.6+i*.12,10.75,0x9a9a9a);
  deco(B,.3,.3,3.5,HX1-.2,1.6,-1.2,0x9a2a1a);for(let i=0;i<3;i++){const h=mesh(new THREE.TorusGeometry(.35,.1,6,12),0xd8c8a0,HX1-.4,1+i*.55,-1.2,B.g);h.rotation.y=PI/2}
  tsign(B.g,'FIRE STATION No. 9',0,4.8,11.14,9,.9,'#7a1a12','#f4e6c0','bold 52px Georgia');FEAT.tower(B,{tx:5.6,th:4,tcol:0xa83a2a,trc:0x3a3a42});
  PR.pave(B,-3,7,11,16.35,0xb0b0aa);PR.pave(B,5,6,11,13.4,0xb4b4ae);hydrant(B,8.2,14.6);flagpole(B,8.4,12.2,0xb91c1c);for(let i=0;i<2;i++)flatM(1.6,.3,0xd8c020,-3,.035,12.2+i*2,B.g);
  rearDoorBits(B,4,-11.2);PR.pave(B,0,16,-16.2,-11.2,0x7a7c80);PR.stalls(B,-7,4,-16.2,-12,2.8);car(B,-5.6,-14);PR.dump(B,5.6,-15.4)},
 roof:'flat',sign:false,z:[0,2]})}

function hVet(x,z,t){return pb(x,z,t,{w:16,d:22,h:4,wall:0xb8d4c0,floor:0xd8dcd4,door:0x2a5a4a,pc:0xeef2ea,dx:0,bd:4,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],b:[{k:'w',c:-5.5},{k:'d',c:4,s:-1}],
 walls:[[1,1.5,HX0,HX1,[{k:'d',c:-4},{k:'d',c:4}]],[1,-4.5,HX0,HX1,[{k:'d',c:-4},{k:'d',c:4}]],[0,0,HZ0,1.35,[]]],
 rooms:[{r:[HX0,HX1,1.65,HZ1],f:RM.wait,loot:'vet',n:1},
  {r:[HX0,-.15,-4.35,1.35],f:[['cot','w',.5],['sink','n',.85],['desk','e',.5],['box','s',.1]],loot:'vet',n:1},
  {r:[.15,HX1,-4.35,1.35],f:[['cot','c',.5],['hood','c',.5],['fridge','n',.9],['shelf','e',.5]],loot:'vet',n:1},
  {r:[HX0,-.15,HZ0,-4.65],f:[['kennel','w',.05,0,0,0],['kennel','w',.5,0,0,0],['kennel','w',.95,0,0,0],['kennel','e',.2,0,0,PI],['kennel','e',.8,0,0,PI]],loot:'vet',n:1},{r:[.15,HX1,HZ0,-4.65],f:RM.pharm,loot:'vet',n:2}],
 x:B=>{tsign(B.g,'PAWS & CLAWS VETERINARY',0,3.55,11.14,8,.8,'#eef2ea','#1d6a4a','bold 46px Arial');
  for(const[px,r]of[[-6.4,.32],[-6.95,.13],[-6.6,.13],[-6.2,.13],[-5.85,.13]]){const c=mesh(new THREE.CircleGeometry(r,12),0x1d6a4a,px,r>.2?3.4:3.78,11.13,B.g)}
  FEAT.awning(B,{awn:[0x1d6a4a,0xeef2ea]});PR.pave(B,0,16,11,13.5,0xb4b4ae);bench(B,-5,12.6);cyl(B,.2,.08,5,.04,12.2,0x2a5aaa);
  rearDoorBits(B,4,-11.2);chain(B,-7.6,-1,-16.6,-16.6,1.4);chain(B,-7.6,-7.6,-16.6,-11.4,1.4);chain(B,-1,-1,-16.6,-11.4,1.4);flatM(6.6,5.2,0x7a7a5a,-4.3,.03,-14,B.g);
  slab(B,-7,-5.6,-16.3,-15.2,0,1,0x8a6a4a);PR.bin(B,5,-12.4)},roof:'flat',sign:false})}

function hBakery(x,z,t){return pb(x,z,t,{w:16,d:22,h:4,wall:0xe8d8b8,floor:0xd8c8a8,door:0x6a3a1a,dx:0,bd:-4,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],walls:[[1,-1,HX0,HX1,[{k:'d',c:-5},{k:'g',c:4.2}]]],
 rooms:[{r:[HX0,HX1,HZ0,-1.15],f:[['stove','n',.08],['stove','n',.2],['stove','n',.32],['hood','n',.2],['fridge','n',.95],['shelf','e',.6],['shelf','w',.6],['sink','e',.2]],loot:'bakery',n:2},
  {r:[HX0,HX1,-.85,HZ1],f:[['shelf','w',.25],['shelf','w',.65],['shelf','e',.25],['shelf','e',.65]],loot:'bakery',n:2}],
 put:[['ccase',-4.6,3.6],['ccase',-2.2,3.6],['counter',1.6,3.6],['register',1.4,3],['table',-4,8.4],['table',3.6,8.4],['table',-4,-6],['table',0,-6],['box',-6.8,-9.6],['box',-6.2,-9.6],['box',-6.8,-9]],
 x:B=>{for(const px of[-4,3.6]){put(B,'chair',px-.6,7.5);put(B,'chair',px+.6,7.5)}for(const px of[-4.6,-2.2])for(let i=0;i<5;i++)deco(B,.25,.12,.18,px-.8+i*.4,1.12,3.6,PK([0xc08a4a,0xa06a2a,0xe0b070]));
  for(let i=0;i<3;i++)deco(B,.5,.3,.5,-.5+i*.8,1.15,-6,0xf0e8d8);cyl(B,.45,1.1,5.2,.55,-9.4,0xc8c8c8,false,12);
  tsign(B.g,'RISE & SHINE BAKERY',0,4.9,11.14,7,1,'#6a3a1a','#f8e0a8','bold 52px Georgia');FEAT.awning(B,{awn:[0xd8782a,0xf4ead8]});
  PR.pave(B,0,16,11,13.5,0xb4b4ae);PR.chalk(B,-3.4,12.4,'FRESH BREAD');PR.bistro(B,4.6,13);PR.bin(B,-6.6,12.4);
  rearDoorBits(B,-4,-11.2);PR.pave(B,3,6,-16.6,-11.2,0x7a7c80);veh(B,'van',3,-14.4,0,{tint:[.96,.9,.76],label:'RISE & SHINE BAKERY',labelCol:'#8a4a1a'});PR.bin(B,-6.5,-12.4)},roof:'flat',sign:false})}

function hSurplus(x,z,t){return pb(x,z,t,{w:16,d:22,h:4.4,wall:0x5a6040,floor:0x6a6a5a,door:0x3a3a2a,pc:0x8a8a6a,dx:0,bd:-5,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],walls:[[1,-4,HX0,HX1,[{k:'d',c:-5},{k:'d',c:4}]]],
 rooms:[{r:[HX0,HX1,HZ0,-4.15],f:[['crate','n',.1],['crate','n',.3],['crate','n',.5],['crate','n',.7],['shelf','w',.5],['shelf','e',.5],['box','s',.3]],loot:'surplus',n:2},
  {r:[HX0,HX1,-3.85,HZ1],f:[['rack','w',.15],['rack','w',.45],['rack','w',.75],['gunrack','e',.2],['rack','e',.55],['shelf','e',.85]],loot:'surplus',n:2}],
 put:[['aisle',-2.6,3.6],['aisle',-2.6,.6],['ccase',2.6,6.6],['counter',3.6,8.8,PI/2],['register',2.9,8.8],['manne',-5.6,9.6],['manne',5.6,9.6],['crate',-6.6,-1.4]],
 x:B=>{tsign(B.g,'BOOTS & BULLETS ARMY SURPLUS',0,3.7,11.14,8.6,.8,'#3a4028','#f0c030','bold 44px Impact');deco(B,15.6,.08,.08,0,4.4,11.25,0x3a4028);
  const net=mesh(BX(12,.05,2),0x4a5a32,0,3.05,12,B.g);net.material.transparent=true;net.material.opacity=.65;for(const s of[-6,6])deco(B,.1,3,.1,s,1.5,12.9,0x4a4a3a);
  sandbags(B,-5,-1.6,11.6,12.4);sandbags(B,1.6,5,11.6,12.4);PR.pave(B,0,16,11,13.5,0xb4b4ae);veh(B,'jeep',-4.6,14.9,PI/2);drum(B,6.6,14.4,0x4a5a32);drum(B,7.3,13.8,0x4a5a32);
  rearDoorBits(B,-5,-11.2);slab(B,-1,5,-16.4,-13.8,0,2.6,0x5a6a4a);deco(B,6.02,.1,2.62,2,2.62,-15.1,0x4a5a3a);B.occ.push([-1.2,5.2,-16.6,-13.6]);sideSign(B,'U.S. SURPLUS',2,1.6,-13.78,3,.5,'#5a6a4a','#e8e8d0','bold 40px Impact')},roof:'flat',sign:false,z:[1,3]})}

function hDiner(x,z,t){const P2=[];for(const px of[-6,-3.6,3.6,6])P2.push(['booth',px,9.6]);for(const px of[-5.6,-3.2,-.8])P2.push(['counter',px,-1.6]);for(const px of[-6.2,-4.8,-3.4,-2,-.6,.8])P2.push(['stool',px,-.4]);
 P2.push(['register',2,-1.6],['arcade',7.1,4,-PI/2],['ccase',5.6,-1.8],['table',-2.4,4.2],['table',2.4,4.2]);
 return pb(x,z,t,{w:16,d:22,h:4,wall:0x5ab0b0,floor:0xe8e8e8,door:0x2a2a2a,pc:0xd8e8e8,dx:0,bd:-5,
 f:[...wins([-6.6,-4.6,-2.6,2.6,4.6,6.6]),{k:'d',c:0}],walls:[[1,-3.5,HX0,HX1,[{k:'d',c:4},{k:'d',c:-5}]],[0,-2,HZ0,-3.65,[{k:'d',c:-6}]]],
 rooms:[{r:[-1.85,HX1,HZ0,-3.65],f:[['stove','n',.1],['stove','n',.25],['fryer','n',.4],['fryer','n',.55],['hood','n',.2],['fridge','n',.95],['sink','e',.5],['counter','s',.4]],loot:'diner',n:2},
  {r:[HX0,-2.15,HZ0,-3.65],f:[['shelf','w',.5],['box','n',.5],['crate','e',.3]],loot:'diner',n:1},{r:[HX0,HX1,-3.35,HZ1],loot:'diner',n:1}],
 put:P2,x:B=>{for(const px of[-2.4,2.4])for(const s of[-.6,.6])put(B,'chair',px+s,5.2,PI);for(let i=-1;i<=1;i++)for(let k=0;k<5;k++)flatM(1,1,k%2?0x222222:0xe8e8e8,i*1+.5,.034,6.5+k,B.g);
  deco(B,16.2,.22,.12,0,1,11.1,0xd8d8d8);deco(B,16.2,.12,.12,0,2.95,11.1,0xd8d8d8);
  const s=tsign(B.g,'MOONLIGHT DINER',0,4.9,11.14,7,1,'#0d2a3a','#ffd84a','bold 64px Georgia');FEAT.neon(B,{neonc:0x4ae0ff});
  tsign(B.g,'OPEN 24 HRS',4.6,3.4,11.17,2.4,.5,'#111','#ff4a6a','bold 40px Arial');PR.pave(B,0,16,11,13.5,0xb4b4ae);bench(B,4.8,12.6);PR.bin(B,-6.6,12.4);
  rearDoorBits(B,-5,-11.2);PR.dump(B,3,-14.5);drum(B,-2,-12.4,0x6a6a2a);drum(B,-1.2,-12.5,0x6a6a2a)},roof:'flat',sign:false})}

function hFurniture(x,z,t){return pb(x,z,t,{w:16,d:22,h:5,wall:0xb08a5a,floor:0xc8b8a0,door:0x3a2a1a,dx:0,bd:5.6,
 f:[...wins([-6.4,-4.4,-2.4,2.4,4.4,6.4]),{k:'d',c:0}],b:[{k:'g',c:-3.4},{k:'g',c:-1.8},{k:'g',c:-.2},{k:'d',c:5.6,s:-1}],
 walls:[[1,-3,HX0,HX1,[{k:'g',c:-4},{k:'d',c:4}]]],
 rooms:[{r:[HX0,HX1,HZ0,-3.15],f:[['crate','w',.2],['crate','w',.6],['shelf','e',.3],['shelf','e',.75],['box','n',.75],['box','n',.85]],loot:'furniture',n:2},
  {r:[HX0,HX1,-2.85,HZ1],loot:'furniture',n:2}],
 put:[['sofa',-5.2,8.6],['ctable',-5.2,7.2],['rug',-5.2,7.4],['sofa',3.8,8.6],['lamp',6.6,9.6],['bed',-5.4,2.4],['wardrobe',-7.1,-.6,PI/2],['bed',-1.4,2.4],['table',4,3.6],['chair',3.4,2.7],['chair',4.6,2.7],['chair',3.4,4.5,PI],['chair',4.6,4.5,PI],['wardrobe',7.1,-.6,-PI/2],['desk',1.6,8.8],['lamp',-7.2,4.8],['tv',.4,-2.2,PI]],
 x:B=>{for(let i=0;i<3;i++){const r=cyl(B,.22,3,-6+i*.5,.22+(i%2)*.4,-8.6,PK([0x7a2a2a,0x2a4a7a,0x6a5a3a]),false,8);r.rotation.z=PI/2}
  tsign(B.g,'COMFY CASTLE FURNITURE',0,5.8,11.14,8.4,1,'#3a2a1a','#f0d8a0','bold 50px Georgia');for(let i=0;i<3;i++)deco(B,.35,.6,.1,-1.2+i*1.2,6.75,11.12,0xd8a020);
  FEAT.awning(B,{awn:[0x7a2a2a,0xf0e0c0]});PR.pave(B,0,16,11,13.5,0xb4b4ae);PR.chalk(B,4.2,12.4,'SALE');put(B,'sofa',-4.4,12.6);
  rearDoorBits(B,5.6,-11.2);PR.pave(B,-1.8,6,-17.6,-11.2,0x7a7c80);veh(B,'van',-1.8,-14.4,PI,{tint:[.92,.9,.86],label:'COMFY CASTLE FURNITURE',labelCol:'#5a2a1a'});PR.bin(B,6.6,-12.4)},roof:'flat',sign:false})}

/* ====================================== FULL-PLOT ====================================== */
function bLargeHouse(x,z,t){const W=12,D=7.5;return pb(x,z,t,{w:24,d:15,h:3.2,wall:PK([0xd8d4c4,0xc9c0a8,0xa8b8c4,0x8a4a3a,0xe0dcd0]),floor:0x8a6a4a,door:PK([0x4a2c14,0x2c4a5a,0x5a2c2c]),pc:0xe8e0d0,dx:-2,bd:-2,
 f:[...wins([-10,-7,1.5,4.3]),{k:'d',c:-2},{k:'g',c:7.6},{k:'g',c:9.2},{k:'g',c:10.8}],b:[...wins([-9,-5.6,1.8,9]),{k:'d',c:-2,s:-1}],l:wins([-4,0,4]),r:wins([-4.5]),
 walls:[[1,-1,-W+.15,6,[{k:'d',c:-8},{k:'d',c:-1.2},{k:'d',c:3.8}]],[0,6,-D+.15,D-.15,[{k:'d',c:-4.2}]],[0,-4.4,-D+.15,-1.15,[]],[0,1.6,-D+.15,-1.15,[]],[0,-3,-.85,D-.15,[{k:'g',c:3}]]],
 rooms:[{r:[-W+.2,-3.15,-.85,D-.2],f:RM.living,loot:'house',n:1},{r:[-2.85,5.85,-.85,D-.2],f:RM.kitchen,loot:'house',n:1},
  {r:[-W+.2,-4.55,-D+.2,-1.15],f:RM.bedroom,loot:'house',n:1},{r:[-4.25,1.45,-D+.2,-1.15],f:RM.bath},{r:[1.75,5.85,-D+.2,-1.15],f:[['bed','n',.5],['wardrobe','e',.8],['box','w',.5]],loot:'house',n:1},
  {r:[6.15,W-.2,-D+.2,-3.2],f:[['workbench','n',.5],['shelf','e',.3],['box','w',.3]],loot:'hardware',n:1}],
 x:B=>{car(B,9.2,1.6);
  PR.lawn(B,0,39.6,7.7,16.3,0x4a7034);PR.pave(B,9.2,4.8,7.6,16.35,0x6a6a68);PR.pave(B,-2,1.4,8.6,16.35,0x9a9a94);slab(B,-3.6,-.4,7.5,8.6,0,.18,0x8a8a84,true);
  for(const s of[-1,1])for(let i=0;i<3;i++)shrub(B,-2+s*(1.8+i*1.9),8.4);for(let i=0;i<10;i++)flower(B,rnd(-11,5),0,rnd(7.7,8.0),rnd(.4,.6));tree2(B,-15,12.5,1.1);tree2(B,16,3,1);tree2(B,-16,-4,1);
  deco(B,.1,1,.1,6.5,.5,15.8,0x555555);deco(B,.45,.35,.25,6.5,1.1,15.8,0x2a2a2a);for(let i=-17;i<=17;i+=1.1)if(Math.abs(i+2)>1.2&&(i<6.4||i>12))deco(B,.12,.9,.06,i,.45,16.2,0xf0f0ea);
  PR.lawn(B,0,39.6,-17.6,-7.7,0x4a7034);slab(B,-8,4,-11.2,-7.6,0,.15,0x9a9a92,true);
  const pz=-14;flatM(9,4,0x3a9ad8,-4,.05,pz,B.g);for(const[w,d,px,pz2]of[[9.8,.4,-4,pz-2.2],[9.8,.4,-4,pz+2.2],[.4,4.8,-8.7,pz],[.4,4.8,.7,pz]])slab(B,px-w/2,px+w/2,pz2-d/2,pz2+d/2,0,.12,0xd8d8d0,true);
  for(const px of[3,4.6]){deco(B,.7,.3,1.8,px,.3,-9.8,0xe8e8e0)}cyl(B,.35,.9,-10,.45,-9.6,0x222222,true,10);swingSet(B,12,-14);
  slab(B,14.6,17.6,-17.2,-14.6,0,2.4,0x7a6a52);deco(B,3.3,.12,2.9,16.1,2.48,-15.9,0x4a3a2a);cont(B,'hardware',13.4,-12.6);FEAT.chimney(B)},
 roof:'gable',rc:PK([0x5b2a1f,0x3a3a42,0x4a3a2a]),sign:false,z:[1,3]})}

function bAutoBody(x,z,t){return pb(x,z,t,{w:30,d:18,h:5.4,wall:0xb8b0a0,floor:0x6a6a66,door:0x3a3a3a,pc:0xcbbfae,dx:11.6,bd:-12,
 f:[{k:'g',c:-11.6},{k:'g',c:-10},{k:'g',c:-8.4},{k:'g',c:-4.6},{k:'g',c:-3},{k:'g',c:-1.4},{k:'g',c:2.4},{k:'g',c:4},{k:'g',c:5.6},{k:'w',c:9},{k:'d',c:11.6},{k:'w',c:13.6}],
 b:[{k:'d',c:-12,s:-1},{k:'w',c:-6},{k:'w',c:0},{k:'w',c:6},{k:'w',c:11.5}],
 walls:[[0,8.2,-8.85,8.85,[{k:'d',c:3}]],[1,-3.6,8.35,14.85,[{k:'d',c:11.6}]]],
 rooms:[{r:[8.35,14.85,-3.45,8.85],f:[['desk','n',.5],['chair','n',.5,0,1.1,PI],['shelf','e',.4],['bench','s',.3]],loot:'auto',n:2},{r:[8.35,14.85,-8.85,-3.75],f:RM.bath},
  {r:[-14.85,8.05,-8.85,-4],f:[['workbench','n',.08],['workbench','n',.35],['shelf','n',.6],['shelf','n',.8],['ladder','w',.5],['crate','e',.5]],loot:'auto',n:3}],
 x:B=>{car(B,-10,1.6);car(B,4,0.8);for(const bx of[-10,-3,4]){for(const s of[-1,1])deco(B,.3,2.2,.3,bx+s*1.6,1.1,1.8,0xd8a020);deco(B,3.6,.2,.4,bx,.15,-1.4,0x8a8a8a)}
  deco(B,8.8,.4,.3,-3,5.1,9.1,0xcfcfcf);for(const bx of[-10,-3,4])deco(B,4.6,.6,.3,bx,2.85,9,0x9a9a9a);
  tsign(B.g,'BENT FENDER AUTO BODY',-3,4.2,9.14,10,.9,'#1a1a1a','#f0a020','bold 56px Impact');cyl(B,.15,6.5,17.5,3.25,13.8,0x555555,true,8);tsign(B.g,'COLLISION REPAIR',17.5,6.2,14,3.2,1.2,'#f0a020','#1a1a1a','bold 44px Impact');
  PR.pave(B,0,39.6,9,16.35,0x6a6c70);for(let i=0;i<3;i++)flatM(.12,6,0xe8e8e0,-12+i*7,.034,12.6,B.g);tyres(B,-14.6,11.4,5);tyres(B,-13.6,11.4,3);tyres(B,-17.6,14.4,4);drum(B,7.6,11);drum(B,8.3,11.2);car(B,12,13.6);
  PR.pave(B,0,39.6,-17.6,-9,0x5c5e60);for(let i=0;i<4;i++)veh(B,i%2?'wreck':'civilian',-15+i*5.6,-14,i%2?0.15:-.12);tyres(B,10,-12.4,4);tyres(B,11,-12.4,6);PR.dump(B,15,-14.6)},
 roof:'flat',sign:false,z:[1,3]})}

function forestBase(x,z,t){const B=yard(x,z,t,'forest');flatM(38,34,0x2e4226,0,.02,0,B.g);for(let i=0;i<26;i++)flatM(rnd(1.5,4),rnd(1.5,4),PK([0x3a3020,0x34462a,0x40382a]),rnd(-17,17),.025,rnd(-15,15),B.g,rnd(0,3));return B}
function plantTrees(B,n,keep){let k=0;for(let tr=0;tr<n*8&&k<n;tr++){const px=rnd(-18,18),pz=rnd(-16,16);if(keep.some(r=>px>r[0]&&px<r[1]&&pz>r[2]&&pz<r[3]))continue;if(B.occ.some(o=>px>o[0]-1.4&&px<o[1]+1.4&&pz>o[2]-1.4&&pz<o[3]+1.4))continue;
  const s=rnd(.85,1.2);Math.random()<.45?pine(B,px,pz,s):tree2(B,px,pz,s);k++}
 for(let i=0,k2=0;i<60&&k2<10;i++){const px=rnd(-17,17),pz=rnd(-15,15);if(keep.some(r=>px>r[0]&&px<r[1]&&pz>r[2]&&pz<r[3]))continue;if(B.occ.some(o=>px>o[0]-.9&&px<o[1]+.9&&pz>o[2]-.9&&pz<o[3]+.9))continue;shrub(B,px,pz);k2++}
 for(let i=0;i<70;i++){const px=rnd(-18,18),pz=rnd(-16,16);if(keep.some(r=>px>r[0]&&px<r[1]&&pz>r[2]&&pz<r[3]))continue;flower(B,px,0,pz,rnd(.6,1),Math.random()<.85?['grass','grassT','meadow','clover']:FLOW)}flushFlora()}
function bForestA(x,z,t){const B=forestBase(x,z,t);const path=[[-1.6,1.6,4,18]],cab=[3,15,-12.5,-1];
 for(let i=0;i<9;i++){const pz=16-i*2.2,px=Math.sin(i*.7)*1.6+(i>5?(i-5)*1.6:0);flatM(2.4,2.6,0x6a5a40,px,.03,pz,B.g);path.push([px-1.6,px+1.6,pz-1.4,pz+1.4])}
 railFence(B,-19.2,19.2,17.2,17.2,[[-2.2,2.2]]);sideSign(B,'HOLLOW PINES - NO HUNTING',-6,1.4,17.3,4.6,.6,'#5a3a1a','#e8d8a0','bold 40px Georgia');deco(B,.12,1.4,.12,-8,.7,17.3,0x5a3a1a);deco(B,.12,1.4,.12,-4,.7,17.3,0x5a3a1a);
 const c=subB(B,9,-6.5,8,6,3,0x6a4a2a,0x5a4a3a,0x3a2a1a);c.dx=-1.5;shell(c,{f:[{k:'d',c:-1.5},{k:'w',c:1.8}],b:[{k:'w',c:0}],l:[{k:'w',c:0}],r:[]});
 furn(c,[['cot','n',.15],['table','c',.6],['stove','n',.85],['shelf','e',.5],['crate','w',.8]],[-3.85,3.85,-2.85,2.85]);rc(c,'barn',[-3.85,3.85,-2.85,2.85],2);roof(c,3,'gable',0x3a2a1a);slab(c,-4,4,3,4.2,0,.2,0x5a4a3a,true);done(c,'forest_cabin',ri(0,1));
 for(let i=0;i<4;i++)cyl(B,.2,1.8,4.6,.2+i*.36,-11.8+(i%2)*.1,0x6a4a2a,false,7).rotation.x=PI/2;cyl(B,.4,.5,7,.25,-12.4,0x6a4a2a,true,10);
 const sx=-12,sz=-9;for(const a of[[-1,-1],[1,-1],[-1,1],[1,1]])deco(B,.15,4,.15,sx+a[0]*.8,2,sz+a[1]*.8,0x5a4030);slab(B,sx-1.1,sx+1.1,sz-1.1,sz+1.1,4,4.15,0x6a4a2a);deco(B,2.2,.8,.06,sx,4.5,sz+1.1,0x6a4a2a);B.occ.push([sx-1.3,sx+1.3,sz-1.3,sz+1.3]);
 cont(B,'barn',sx+2,sz+1.5);rc(B,'park',[-6,6,-4,6],1);
 plantTrees(B,24,path.concat([cab,[sx-2.5,sx+2.5,sz-2.5,sz+3]]));buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(2,4),[-14,14,-12,12]);LASTB=B;return B}
function bForestB(x,z,t){const B=forestBase(x,z,t);const camp=[-12,4,-9,5],keep=[[-1.6,1.6,5,18],camp];
 for(let i=0;i<6;i++)flatM(2.4,2.4,0x6a5a40,0,.03,16-i*2.2,B.g);railFence(B,-19.2,19.2,17.2,17.2,[[-2.2,2.2]]);
 for(let i=0;i<13;i++){const px=-17.6+i*2.8,pz=-12+Math.sin(i*.6)*2.2;flatM(3.2,2.4,0x3a6a8a,px,.035,pz,B.g);keep.push([px-1.8,px+1.8,pz-1.5,pz+1.5])}
 slab(B,4.2,6.2,-14.6,-9.4,0,.25,0x6a4a2a,true);for(const s of[-1,1])deco(B,.1,.8,5.2,5.2+s*.95,.6,-12,0x5a3a20);
 const fx=-4,fz=-2;for(let i=0;i<8;i++){const a=i*PI/4;mesh(new THREE.SphereGeometry(.22,5,4),0x6a6a66,fx+Math.cos(a)*.7,.15,fz+Math.sin(a)*.7,B.g)}flatM(1,1,0x1a1a1a,fx,.03,fz,B.g);for(let i=0;i<3;i++){const l=cyl(B,.08,1,fx,.15,fz,0x4a3020,false,6);l.rotation.set(PI/2,0,i)}
 for(const[lx,lz,ry]of[[fx-2.4,fz,PI/2],[fx+2.4,fz,PI/2],[fx,fz+2.4,0]]){const l=cyl(B,.25,2.2,lx,.25,lz,0x6a4a2a,true,8);l.rotation.set(0,ry,PI/2);B.occ.push([lx-1.2,lx+1.2,lz-1.2,lz+1.2])}
 tent(B,-9,-5,2.6,1.3,0x2a6a3a,PI/2);tent(B,-9,2,2.6,1.3,0xc87a2a,PI/2);tent(B,1.5,-6.5,2.8,1.4,0x2a4a8a,0);
 cyl(B,.04,2,-6.6,1,1.2,0x777777);cyl(B,.04,2,-3,1,1.2,0x777777);deco(B,3.6,.02,.02,-4.8,1.95,1.2,0xdddddd);slab(B,-1.6,.6,1.6,2.4,0,.6,0x9a2a2a);deco(B,2.4,.2,.9,-.5,.12,3.4,0x8a6a3a);
 const cv=mesh(BX(.8,.35,3.6),0xb8602a,7,.18,4,B.g);cv.rotation.y=.4;
 veh(B,'civilian',10,8,PI/2+.2,{model:'suv',tint:[.36,.42,.3]});
 rc(B,'park',[camp[0],camp[1],camp[2],camp[3]],2);cont(B,'barn',-11,-1.6);cont(B,'hardware',11,4.6);
 plantTrees(B,22,keep.concat([[7,13,5.5,10.5],[3.8,6.6,-15,-9]]));buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(2,5),[-12,12,-10,10]);LASTB=B;return B}

function aidTent(B,lx,lz,w,d,lab,tb,furnL,n){const g=subB(B,lx,lz,w,d,2.6,0xd8d0b8,0x7a7a6a,0x6a6a5a);g.dx=0;shell(g,{f:[{k:'d',c:0}],b:[],l:[],r:[]});
 if(furnL)furn(g,furnL,[-w/2+.2,w/2-.2,-d/2+.2,d/2-.2]);rc(g,tb,[-w/2+.2,w/2-.2,-d/2+.2,d/2-.2],n||2);
 const gg=new THREE.CylinderGeometry(.577*w,.577*w,d+.4,3);gg.rotateX(-PI/2);gg.scale(1,1.4/(.866*w),1);mesh(gg,0xe8e4d4,0,2.6+.35,0,g.g);
 crossPanel(g,w/2-1.1,1.6,d/2+.04,.8);if(lab)tsign(g.g,lab,0,3,d/2+.26,w*.55,.45,'#e8e4d4','#2a2a2a','bold 40px Arial');done(g,'aid_tent',0);return g}
function bAidStation(x,z,t){const B=yard(x,z,t,'aid');flatM(38,34,0x4c4e52,0,.02,0,B.g);PR.stalls(B,-16,12,-3,3,2.8);
 const W=18.8,F=16.8;for(let u=-W+1;u<=W-1;u+=2.2){if(Math.abs(u)<3)continue;slab(B,u-1,u+1,F-.35,F+.35,0,.85,0xd8d8d0)}chain(B,-W,-W,-F,F);chain(B,W,W,-F,F);chain(B,-W,W,-F,-F);
 sandbags(B,-4.6,-3,13.4,15.2,1.2);sandbags(B,3,4.6,13.4,15.2,1.2);deco(B,.15,4,.15,-3.8,2,15.6,0x555555);deco(B,.15,4,.15,3.8,2,15.6,0x555555);
 tsign(B.g,'EMERGENCY AID STATION',0,3.7,15.7,7.4,.8,'#f4f4f0','#c81e1e','bold 52px Arial');sideSign(B,'FOOD - WATER - MEDICAL',-10,1.6,17.2,5,.6,'#1d3a8a','#ffffff','bold 40px Arial');
 aidTent(B,-11,6,9,6,'MEDICAL','aid',[['cot','n',.1],['cot','n',.4],['cot','n',.7],['cot','s',.2],['cot','s',.6],['box','e',.5]],2);
 aidTent(B,11,6,8,6,'SUPPLIES','aid',[['crate','n',.15],['crate','n',.5],['crate','n',.85],['shelf','w',.5],['box','e',.5]],3);
 aidTent(B,-10,-9.5,7,5,'COMMAND','office',[['desk','n',.5],['chair','n',.5,0,1,PI],['servrack','e',.5]],1);
 for(let i=0;i<3;i++)for(let k=0;k<2;k++){slab(B,2+i*1.4,3.2+i*1.4,-12.6,-11.4,k*.8,.8+k*.8,0x5a6a4a)}B.occ.push([1.8,6.6,-12.8,-11.2]);
 cyl(B,1.4,2.6,13,1.3,-10,0x4a5a42,true,14);deco(B,.6,.2,.6,13,2.7,-10,0x333333);slab(B,7.4,9.6,-14.8,-13.2,0,1.3,0x4a5a42);deco(B,.1,.6,.1,8,1.6,-14,0x222222);
 veh(B,'army',13.5,-1.4,0);for(const px of[-15,15]){cyl(B,.1,6,px,3,-15.6,0x555555,true,6);deco(B,1.4,.5,.4,px,6,-15.6,0xffffcc)}flagpole(B,0,-14.6,0x1d3a8a);
 for(let i=0;i<4;i++)deco(B,.7,.35,2,-3+i*1.1,.18,-6,0x1a1a1a);rc(B,'aid',[-6,6,-8,4],1);
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(3,6),[-15,15,-13,13]);LASTB=B;return B}

function bFieldHospital(x,z,t){const B=yard(x,z,t,'park');flatM(38,34,0x4f6e36,0,.02,0,B.g);flatM(3,34,0x8a8270,0,.03,0,B.g);
 perimChain(B,18.8,16.8,[-2.6,2.6]);sideSign(B,'FIELD HOSPITAL - TRIAGE AT GATE',0,2.8,16.9,6.4,.6,'#f4f4f0','#c81e1e','bold 40px Arial');deco(B,.12,2.4,.12,-3.2,1.2,16.9,0x555555);deco(B,.12,2.4,.12,3.2,1.2,16.9,0x555555);
 const cots=[];for(const u of[.05,.22,.39,.56,.73,.9])cots.push(['cot','n',u],['cot','s',u]);
 aidTent(B,-8.5,-2,15,7,'WARD A','clinic',cots,3);aidTent(B,9.5,7,8,6,'TRIAGE','aid',[['cot','c',.5],['desk','n',.2],['shelf','e',.5],['box','w',.5]],2);
 aidTent(B,9.5,-4,8,5,'PHARMACY','aid',[['shelf','n',.2],['shelf','n',.8],['fridge','e',.5],['crate','w',.5]],3);
 const hx=10,hz=-13;flatM(7,7,0x9a9a96,hx,.035,hz,B.g);flatM(.8,4,0xf4f4f0,hx-1.3,.04,hz,B.g);flatM(.8,4,0xf4f4f0,hx+1.3,.04,hz,B.g);flatM(1.8,.8,0xf4f4f0,hx,.04,hz,B.g);
 for(let i=0;i<5;i++)deco(B,.7,.35,2,-14+i*1.1,.18,9,0x1a2a1a);for(let i=0;i<3;i++)slab(B,-6.5+i*1.3,-5.5+i*1.3,9,10.2,0,.8,0x6a7a5a);
 swingSet(B,-12,-13);slide(B,-4,-15);const tape=deco(B,12,.05,.05,-8,.9,-10.8,0xf0c020);
 veh(B,'ambulance',3.6,12,0);cyl(B,1,1.6,15.6,.8,13.6,0x5a6a4a,true,12);
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(3,6),[-15,15,-13,13]);LASTB=B;return B}

const cab=(B,x,z,ry)=>veh(B,'taxi',x,z,ry);
function bCabDepot(x,z,t){const B=yard(x,z,t,'cab');flatM(38,34,0x4c4e52,0,.02,0,B.g);PR.stalls(B,-16,11,-1,6,2.8);PR.stalls(B,-16,11,8,14,2.8);
 const W=18.8,F=16.8;chain(B,-W,-4,F,F);chain(B,4,W,F,F);chain(B,-W,-W,-F,F);chain(B,W,W,-F,F);chain(B,-W,W,-F,-F);deco(B,.2,3,.2,-4,1.5,F,0x555555);deco(B,.2,3,.2,4,1.5,F,0x555555);deco(B,7.6,.3,.2,0,3,F,0xf2c318);
 tsign(B.g,'QUICKSILVER CAB CO.',0,3.6,F+.1,7.2,.8,'#111111','#f2c318','bold 56px Impact');
 for(let i=0;i<5;i++)if(Math.random()<.85)cab(B,-14.6+i*2.8*1.5,2.4,Math.random()<.5?0:PI);for(let i=0;i<5;i++)if(Math.random()<.75)cab(B,-14.6+i*2.8*1.5,11,Math.random()<.5?0:PI);cab(B,13,5,PI/2+.3);
 const o=subB(B,-10,-10.5,12,7,3.4,0xd8d0b8,0x8a8a82,0x2a2a2a);o.dx=-2;shell(o,{f:[...wins([-4.4,1.4,4]),{k:'d',c:-2}],b:[{k:'d',c:4,s:-1}],l:wins([0]),r:wins([0])});
 WL(o,0,2,-3.35,3.35,[{k:'d',c:0}],3.4,{th:.2,c:0xcbbfae});furn(o,[['desk','n',.3],['desk','n',.75],['chair','n',.3,0,1,PI],['servrack','w',.5],['bench','s',.3]],[-5.85,1.85,-3.35,3.35]);
 furn(o,[['locker','n',.2],['locker','n',.5],['locker','n',.8],['bench','s',.5]],[2.15,5.85,-3.35,3.35]);rc(o,'office',[-5.85,1.85,-3.35,3.35],1);rc(o,'auto',[2.15,5.85,-3.35,3.35],1);
 roof(o,3.4,'flat',0x4a4a48);tsign(o.g,'DISPATCH',-2,3.1,3.62,2.6,.5,'#f2c318','#111','bold 40px Impact');done(o,'cab_dispatch',ri(0,2));
 const gr=subB(B,8,-10.5,12,8,4.4,0x8a9096,0x5a5a56,0x3a3a3a);gr.dx=0;shell(gr,{f:[{k:'g',c:-3.2},{k:'g',c:-1.6},{k:'g',c:0},{k:'g',c:1.6},{k:'d',c:4.4}],b:[{k:'w',c:-3},{k:'w',c:3}],l:[],r:[]});
 cab(gr,-1,.4,0);furn(gr,[['workbench','n',.2],['shelf','n',.6],['shelf','e',.5],['crate','w',.8]],[-5.85,5.85,-3.85,3.85]);rc(gr,'auto',[-5.85,5.85,-3.85,3.85],2);roof(gr,4.4,'flat',0x4a4a48);done(gr,'cab_garage',ri(0,1));
 PR.pump(B,14,-2);tyres(B,16.6,-14.6,5);tyres(B,15.6,-14.6,3);PR.dump(B,-16,-15);
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(2,4),[-15,15,-2,14]);LASTB=B;return B}

function pots(B,x0,x1,z0,z1,step=1.1){for(let px=x0;px<=x1+.01;px+=step)for(let pz=z0;pz<=z1+.01;pz+=step){cyl(B,.22,.35,px,.48,pz,0x8a4a2a,false,7);flower(B,px,.62,pz,rnd(.5,.8))}B.occ.push([x0-.4,x1+.4,z0-.4,z1+.4]);slab(B,x0-.4,x1+.4,z0-.4,z1+.4,0,.3,0x5a4a3a)}
function bNursery(x,z,t){const B=yard(x,z,t,'nursery');flatM(38,34,0x8a8270,0,.02,0,B.g);flatM(3,34,0x9a9a92,0,.025,0,B.g);
 railFence(B,-19.2,19.2,17.2,17.2,[[-2.4,2.4]]);chain(B,-18.8,-18.8,-16.8,16.8,1.6);chain(B,18.8,18.8,-16.8,16.8,1.6);chain(B,-18.8,18.8,-16.8,-16.8,1.6);
 tsign(B.g,'GREEN THUMB GARDEN CENTRE',-9.5,2.6,17.3,6.8,.8,'#2a5a2a','#f4f0d0','bold 44px Georgia');deco(B,.15,2.6,.15,-13,1.3,17.3,0x5a3a1a);deco(B,.15,2.6,.15,-6,1.3,17.3,0x5a3a1a);
 /* greenhouse: glass panels on a white frame (collides, breakable look), open door on the path side */
 const gx0=-17,gx1=-3,gz0=-14,gz1=-4,H=3;for(let px=gx0;px<=gx1+.01;px+=2)for(const pz of[gz0,gz1])deco(B,.12,H,.12,px,H/2,pz,0xe8e8e8);for(let pz=gz0;pz<=gz1+.01;pz+=2)for(const px of[gx0,gx1])deco(B,.12,H,.12,px,H/2,pz,0xe8e8e8);
 for(let px=gx0+1;px<gx1;px+=2){glassP(B,px,H/2,gz0,2,H);if(Math.abs(px-(gx0+gx1)/2)>1.2)glassP(B,px,H/2,gz1,2,H)}for(let pz=gz0+1;pz<gz1;pz+=2){glassP(B,gx0,H/2,pz,2,H,PI/2);glassP(B,gx1,H/2,pz,2,H,PI/2)}
 const rf=mesh(BX(14.2,.06,10.2),0xcfe8f0,(gx0+gx1)/2,H+.03,(gz0+gz1)/2,B.g);rf.material.transparent=true;rf.material.opacity=.35;
 for(const pz of[-12.6,-9,-6.4]){slab(B,-15.6,-11.6,pz-.45,pz+.45,0,.85,0x8a6a4a);slab(B,-8.6,-4.4,pz-.45,pz+.45,0,.85,0x8a6a4a);for(let i=0;i<6;i++){flower(B,-15.3+i*.75,.86,pz,.45);flower(B,-8.3+i*.75,.86,pz,.45)}}
 B.occ.push([gx0-.3,gx1+.3,gz0-.3,gz1+.3]);rc(B,'nursery',[gx0+1,gx1-1,gz0+1,gz1-1],2);
 const s=subB(B,10,-11,8,6,3.2,0x6a8a5a,0x8a7a62,0x3a2a1a);s.dx=-2;shell(s,{f:[...wins([1.6]),{k:'d',c:-2}],b:[],l:wins([0]),r:[]});furn(s,[['counter','n',.5],['shelf','e',.5],['shelf','w',.6],['box','s',.85]],[-3.85,3.85,-2.85,2.85]);
 put(s,'register',0,-1.7);rc(s,'nursery',[-3.85,3.85,-2.85,2.85],2);roof(s,3.2,'gable',0x3a5a2a);done(s,'nursery_shop',ri(0,1));
 pots(B,4,8.4,2,5.3);pots(B,10.4,14.8,2,5.3);pots(B,4,8.4,8,11.3);pots(B,10.4,14.8,8,11.3);pots(B,-15,-10.6,4,7.3);pots(B,-15,-10.6,10,13.3);
 for(let i=0;i<4;i++){const px=-7+i*1.4;slab(B,px-.6,px+.6,9,10.6,0,.12+i%2*.4,0x8a6a3a)}for(let i=0;i<6;i++)deco(B,.55,.25,.85,-7+(i%3)*1.4,.3+Math.floor(i/3)*.3,9.8,0x6a4a2a);
 for(const px of[16.2,12.8])tree2(B,px,14,.8);tree2(B,-16.2,14.6,.8);hay(B,16,-3);flushFlora();
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(2,4),[-15,15,-14,14]);LASTB=B;return B}
const hay=(B,x,z)=>{slab(B,x-.6,x+.6,z-1,z+1,0,.8,0xd8b860);slab(B,x-.6,x+.6,z-.9,z+.9,.8,1.6,0xd0b058);B.occ.push([x-.8,x+.8,z-1.2,z+1.2])};

function qpipe(B,x,z,dir,wid=6){/* quarter pipe: walkable steps + smooth face + deck. dir=+1 rises toward +Z, -1 toward -Z */
 const n=6,rise=.32,run=.5;stairs(B,x,z,dir,n,rise,run,wid,0x9a9a96);const L=n*run,top=n*rise;const f=mesh(BX(wid,.06,Math.hypot(L,top)),0xa8a8a4,x,top/2+.05,z+dir*L/2,B.g);f.rotation.x=-dir*Math.atan2(top,L);
 slab(B,x-wid/2,x+wid/2,Math.min(z+dir*L,z+dir*(L+1.4)),Math.max(z+dir*L,z+dir*(L+1.4)),0,top,0x8a8a86,true);deco(B,wid,.08,.08,x,top+.04,z+dir*L,0xcccccc);
 for(const s of[-1,1])deco(B,.06,1,.06,x+s*wid/2,top+.5,z+dir*(L+1.2),0x555555);deco(B,wid,.05,.05,x,top+1,z+dir*(L+1.2),0x555555)}
function bSkatepark(x,z,t){const B=yard(x,z,t,'skate');flatM(38,34,0xa0a09a,0,.02,0,B.g);for(let i=0;i<10;i++)flatM(rnd(1,3),rnd(.6,2),PK([0x8a8a86,0x7a7a76]),rnd(-16,16),.025,rnd(-14,14),B.g,rnd(0,3));
 perimChain(B,18.8,16.8,[-2.4,2.4]);tsign(B.g,'DROP ZONE SKATEPARK',0,3.2,16.9,6,.7,'#111','#ff5a1a','bold 56px Impact');deco(B,.12,3,.12,-3,1.5,16.9,0x555555);deco(B,.12,3,.12,3,1.5,16.9,0x555555);
 qpipe(B,-9,-10.4,-1,8);qpipe(B,-9,-.6,1,8);/* half pipe pair */qpipe(B,9,-11.4,-1,7);
 slab(B,6,12,-2,1,0,.6,0x9a9a96,true);for(const s of[-1,1]){const r=mesh(BX(6,.06,1.6),0xa8a8a4,9,.3,-.5+s*2.2,B.g);r.rotation.x=s*.38}B.occ.push([5.6,12.4,-3.8,2.8]);
 for(const[px,pz,L]of[[0,4,6],[12,8,5]]){deco(B,L,.06,.06,px,.55,pz,0xd8d8d8);for(const s of[-1,1])deco(B,.06,.55,.06,px+s*(L/2-.2),.28,pz,0x555555)}
 slab(B,-15,-12,6,10,0,.45,0x9a9a96,true);slab(B,-11.2,-8,7,9,0,.3,0x9a9a96,true);
 for(const[txt,px,py,pz,c,ry]of[['SK8 OR DIE',-9,.95,3.85,'#ff3a8a',0],['DEAD SKATERS',9,.95,-15.85,'#3ad8ff',PI],['GRIND',9,.3,1.05,'#c8ff3a',0]])tsign(B.g,txt,px,py,pz,3,py>.5?1.4:.5,'#8a8a86',c,'bold 70px Impact',ry);
 const k=subB(B,12.5,12.5,6,4,2.8,0x2a2a30,0x6a6a66,0x111111);k.dx=0;shell(k,{f:[{k:'d',c:-1.2},{k:'w',c:1.4}],b:[],l:[],r:[]});furn(k,[['counter','n',.5],['rack','w',.5],['shelf','e',.5]],[-2.85,2.85,-1.85,1.85]);rc(k,'park',[-2.85,2.85,-1.85,1.85],1);roof(k,2.8,'flat',0x3a3a3a);tsign(k.g,'SKATE SHOP',0,3.2,2.06,3,.5,'#ff5a1a','#111','bold 44px Impact');done(k,'skate_shop',0);
 bench(B,-15,14);bench(B,-11,14);PR.bin(B,-7.6,14.2);for(const px of[-17,17])lampPost(B,px,-15.6);rc(B,'park',[-6,6,2,12],1);
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,ri(2,4),[-15,15,-13,13]);LASTB=B;return B}

function parkLot(dead){return function(x,z,t){const B=yard(x,z,t,dead?'deadpark':'park'),G=dead?0x5a5a38:0x3f7a2f;flatM(38,34,G,0,.02,0,B.g);
 const W=18.6,F=16.6;railFence(B,-W,W,F,F,[[-2.4,2.4]]);railFence(B,-W,W,-F,-F,[[-2.4,2.4]]);railFence(B,-W,-W,-F,F,[[-2,2]]);railFence(B,W,W,-F,F,[[-2,2]]);
 flatM(3,34,dead?0x7a7060:0x9a927f,0,.03,0,B.g);flatM(38,3,dead?0x7a7060:0x9a927f,0,.03,0,B.g);
 const px=-9.5,pz=-8;const pond=mesh(new THREE.CircleGeometry(4.6,20),dead?0x3a4a2a:0x3a8ab0,px,.04,pz,B.g);pond.rotation.x=-PI/2;pond.scale.set(1.3,1,1);
 for(let i=0;i<18;i++){const a=i*PI*2/18;mesh(new THREE.SphereGeometry(.35,5,4),0x7a7a74,px+Math.cos(a)*6,.12,pz+Math.sin(a)*4.6,B.g)}B.occ.push([px-6.2,px+6.2,pz-4.8,pz+4.8]);
 const solidPond=new THREE.Box3(new THREE.Vector3(WX(B,px)-5,0,WZ(B,pz)-3.6),new THREE.Vector3(WX(B,px)+5,.4,WZ(B,pz)+3.6));if(B.cs<0){const a=solidPond.min.clone(),b=solidPond.max.clone();solidPond.min.set(Math.min(a.x,b.x),0,Math.min(a.z,b.z));solidPond.max.set(Math.max(a.x,b.x),.4,Math.max(a.z,b.z))}solids.push(solidPond);
 /* gazebo */const gx=9.5,gz=-8;slab(B,gx-3,gx+3,gz-3,gz+3,0,.3,dead?0x6a5a48:0xd8d0c0,true);for(const a of[0,1,2,3,4,5]){const ax=Math.cos(a*PI/3)*2.7,az=Math.sin(a*PI/3)*2.7;slab(B,gx+ax-.1,gx+ax+.1,gz+az-.1,gz+az+.1,.3,3,dead?0x6a5a48:0xf0ece0)}
 const r=mesh(new THREE.ConeGeometry(3.6,1.6,6),dead?0x4a3a2a:0x5a3a2a,gx,3.8,gz,B.g);if(dead)r.rotation.z=.18;
 /* fountain */cyl(B,1.8,.5,0,.25,0,0x9a9a96,true,16);const w=mesh(new THREE.CircleGeometry(1.6,16),dead?0x3a4a2a:0x5ab0d8,0,.52,0,B.g);w.rotation.x=-PI/2;cyl(B,.25,1.6,0,1,0,0x9a9a96,false,10);
 const trees=[[-15,12],[-9,13],[9,13],[15,12],[-15,3],[15,3],[-4,6],[5,-14],[-15,-15],[15,-15],[-3,-13],[13,7]];trees.forEach(([a,b])=>tree2(B,a,b,rnd(1,1.2),dead));
 for(const[bx,bz,ry]of[[-5,2.4,0],[5,2.4,0],[-5,-2.4,PI],[5,-2.4,PI],[2.4,10,PI/2],[-2.4,-10,-PI/2]]){if(dead&&Math.random()<.4){const g=new THREE.Group();g.position.set(bx,.25,bz);g.rotation.set(0,ry,1.4);B.g.add(g);mesh(BX(1.8,.08,.45),0x5a4a3a,0,0,0,g)}else bench(B,bx,bz,ry)}
 for(const[a,b]of(dead?[[-11,8],[-12,0]]:[[-11,8],[11,9],[-12,0]]))picnic(B,a,b);for(const[a,b]of[[-2.2,8],[2.2,-6],[-2.2,-6],[2.2,8]])lampPost(B,a,b);
 if(!dead){for(const[fx,fz]of[[-7,10],[7,-4]]){flatM(3,1.4,0x5a3a2a,fx,.03,fz,B.g);for(let i=0;i<9;i++)flower(B,fx-1.3+i*.33,.03,fz+rnd(-.4,.4),rnd(.45,.65))}flushFlora();
  PR.bin(B,3,1.7);PR.bin(B,-3,-1.7);rc(B,'park',[-14,14,-14,14],2)}
 else{/* the dead park: mass grave, bodies, burnt car, warnings */
  const mx=10,mz=8;flatM(7,4,0x2a2018,mx,.035,mz,B.g);for(let i=0;i<5;i++)mesh(new THREE.SphereGeometry(rnd(.7,1.1),6,4),0x4a3a28,mx-3.5+i*1.7,.1,mz-2.6,B.g);B.occ.push([mx-4,mx+4,mz-3.4,mz+2.4]);
  SP(B,mx,mz,'body_pile','park',0);SP(B,-6,10,'body_facedown','park',.6);SP(B,4.5,4.5,'body_sitting','park',PI);SP(B,-13,-2,'body_woman','park',2);
  for(let i=0;i<6;i++)deco(B,.7,.3,1.9,-1+i*.9,.15,-15.5+(i%2)*.3,0x1a1a1a);veh(B,'wreck',14,-1,PI/2+.3);
  sideSign(B,'THEY COME AT NIGHT',-9.5,1.4,-2.7,4,.8,'#d8d0b8','#7a1010','bold 56px Impact');deco(B,4.2,1,.04,-9.5,1.4,-2.75,0xd8d0b8);for(const s of[-2,2])deco(B,.08,2,.08,-9.5+s,1,-2.8,0x5a4a3a);
  rc(B,'park',[-14,14,-14,14],1)}
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});zN(B,dead?ri(4,7):ri(2,4),[-15,15,-14,14]);LASTB=B;return B}}

/* ====================================== REGISTER ====================================== */
const VAR=()=>({intact:{props:[]},looted:{props:['trash','glass','papers']},ruined:{props:['rubble','beam','tarp']}});
function add(id,name,pool,cat,build,loot,o={}){if(NEWCAT.find(d=>d.id===id))return;
 NEWCAT.push({id,name,pool,scope:pool,category:cat,front:'south',builder:'prop',build,loot,note:o.note||'',w:pool==='half'?HALFD.w:BIGD.w,d:pool==='half'?HALFD.d:BIGD.d,variants:VAR(),legacy:false,max:o.max,min:o.min,lots:o.lots||''});
 if(o.noyard)NOYARD.add(id)}
// half-plot
add('small_house','Small House','half','residential',hHouse('small'),'house',{min:2,max:3,lots:'Res_Double_SnS / MnS, Res_3S_*'});
add('medium_house','Medium House','half','residential',hHouse('medium'),'house',{min:2,max:3,lots:'Res_Double_MnM2-5, Res_2M_CornerN, res_001'});
add('fortified_house','Fortified House','half','residential',hHouse('fort'),'house',{lots:'*_Fort lots'});
add('fire_hall','Fire Station No. 9','half','civic',hFireHall,'fire',{max:1,lots:'Firehall_Boutique (fire hall half)'});
add('vet_clinic','Paws & Claws Veterinary','half','commercial',hVet,'vet',{lots:'VetClinic, VetClinicAlt_Ruined_Corner'});
add('bakery','Rise & Shine Bakery','half','commercial',hBakery,'bakery',{lots:'business_butcher_bakery (bakery half)'});
add('army_surplus','Boots & Bullets Army Surplus','half','commercial',hSurplus,'surplus',{lots:'Army_Surplus_Damaged'});
add('diner','Moonlight Diner','half','commercial',hDiner,'diner',{lots:'Diner_Damaged'});
add('furniture_store','Comfy Castle Furniture','half','commercial',hFurniture,'furniture',{lots:'furniture_corner'});
// full-plot
add('large_house','Large House','big','residential',bLargeHouse,'house',{min:1,max:3,lots:'Res_Large_Corner, Res_Large_Corner_01'});
add('auto_body_shop','Bent Fender Auto Body','big','commercial',bAutoBody,'auto',{lots:'autobody_shop'});
add('forest_a','Hollow Pines (Forest)','big','civic',bForestA,'barn',{noyard:1,lots:'Forest01, mission_weapons_forest'});
add('forest_b','Campsite Woods (Forest)','big','civic',bForestB,'park',{noyard:1,lots:'Forest02, mission_survivors_Forest02'});
add('aid_station','Emergency Aid Station','big','civic',bAidStation,'aid',{max:1,noyard:1,lots:'ParkingLot_Aid_Station_Corner'});
add('field_hospital','Field Hospital','big','civic',bFieldHospital,'clinic',{max:1,noyard:1,lots:'Playground_Corner_Field_Hospital'});
add('cab_depot','Quicksilver Cab Co.','big','commercial',bCabDepot,'auto',{max:1,noyard:1,lots:'ParkingLot_Yellow_Cab_Corner'});
add('plant_nursery','Green Thumb Garden Centre','big','commercial',bNursery,'nursery',{max:1,noyard:1,lots:'plantnursery_corner'});
add('skatepark','Drop Zone Skatepark','big','civic',bSkatepark,'park',{max:1,noyard:1,lots:'skatepark_Corner'});
add('town_park','Town Park','big','civic',parkLot(false),'park',{max:1,noyard:1,lots:'Park, park_corner, mission_survivors_park'});
add('dead_park','Dead Park','big','civic',parkLot(true),'park',{max:1,noyard:1,lots:'Dead_Park'});

/* the existing MaxCount-1 lots in zMissionMapDB */
for(const id of['church','cemetery','water_tower_kerberos','corn_maze','krasche_burns_autos','playground_memorial_park']){const d=NEWCAT.find(q=>q.id===id);if(d&&d.max===undefined)d.max=1}

/* dev toolkit: list everything that was added after core built LABCAT (new lots + Dead Weight) right after the new catalogue */
try{const nNew=LABCAT.findIndex(d=>d.legacy!==false&&!NEWCAT.includes(d));const missing=NEWCAT.filter(d=>!LABCAT.includes(d));if(missing.length)LABCAT.splice(nNew<0?LABCAT.length:nNew,0,...missing)}catch(e){console.warn('[newlots] LABCAT',e)}
try{window.__newCatalogueErrors=validateNewCatalogue();if(window.__newCatalogueErrors.length)console.error('NEW CATALOGUE INVALID',window.__newCatalogueErrors)}catch(e){}
window.NEWLOTS={ids:NEWCAT.filter(d=>d.lots).map(d=>d.id)};
console.log('[newlots] '+window.NEWLOTS.ids.length+' MissionMap lots added');
})();
