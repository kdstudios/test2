/* ==========================================================================================================
   MINI FORT ZOMBIE - VEHICLE VARIANTS (v074): service and trade vehicles made from the game's own Modern car and truck
   models (RGPK PF.car / PF.truck, the same ones props.js puts on every makeCar / makeArmyTruck), re-painted and dressed:
     civilian (random model + colour), taxi, police, jeep, wreck  - from the cars
     van, boxtruck, ambulance, firetruck, army                    - from the trucks (box truck, cargo truck, army truck)
   API: MFZV.make(kind, x, z, rot, opts) -> THREE.Group in world space, front = +Z at rot 0 (like makeCar), with a collider and a
   walkable top. opts: {tint:[r,g,b], label:'TEXT', labelCol:'#hex'}. Falls back to makeCar / makeArmyTruck when the Modern props
   are switched off (Options > Graphics > Props).
   ========================================================================================================== */
(function(){
'use strict';
const P=window.RGPROPS,K=window.RGPK,T=THREE,PI=Math.PI;const PF=K&&K.PF;
const on=()=>!!(P&&PF&&P.vehicleGroup)&&!(window.RGFX&&RGFX.s.props===0);
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- painted text / emblems (shared materials) ---------- */
const TX=new Map();
function textMat(txt,aspect,fg,bg,font){const k=[txt,aspect,fg,bg,font].join('|');let m=TX.get(k);if(m)return m;
 const cv=document.createElement('canvas');cv.width=512;cv.height=Math.max(24,Math.round(512/aspect));const q=cv.getContext('2d');
 if(bg){q.fillStyle=bg;q.fillRect(0,0,cv.width,cv.height)}let sz=Math.floor(cv.height*.78);const f=()=>q.font='bold '+sz+'px '+(font||'Arial, sans-serif');f();
 while(q.measureText(txt).width>cv.width*.94&&sz>8){sz-=2;f()}q.fillStyle=fg;q.textAlign='center';q.textBaseline='middle';q.fillText(txt,cv.width/2,cv.height/2+sz*.04);
 const t=new T.CanvasTexture(cv);t.anisotropy=4;m=new T.MeshBasicMaterial({map:t,transparent:!bg,alphaTest:bg?0:.35,side:T.FrontSide});TX.set(k,m);return m}
function crossMat(){const k='+cross';let m=TX.get(k);if(m)return m;const cv=document.createElement('canvas');cv.width=cv.height=128;const q=cv.getContext('2d');q.fillStyle='#c8141a';q.fillRect(44,12,40,104);q.fillRect(12,44,104,40);
 m=new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,alphaTest:.35});TX.set(k,m);return m}
function plane(g,mat,w,h,x,y,z,ry){const m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=ry||0;m.frustumCulled=false;m.userData.kind='rgprop';g.add(m);return m}
const sides=(g,mat,w,h,x,y,z)=>{plane(g,mat,w,h,x,y,z,PI/2);plane(g,mat,w,h,-x,y,z,-PI/2)};

/* ---------- model bases (all turned so the front is +Z) ---------- */
const MODELS=['sedan','hatch','suv','mpv','cross','offroad'];
const COLS=(P&&P.CAR_COLS)||[[.55,.1,.1],[.1,.2,.5],[.22,.22,.24]];
const car=(s,model,tint,o)=>{s.M.save().rotY(PI);s.M.put(PF.car(model,o||{}),{tint,nocol:true});s.M.restore()};
const truck=(s,model,tint,o,sc)=>{s.M.save().rotY(PI);if(sc)s.M.scl(sc[0],sc[1],sc[2]);s.M.put(PF.truck(model,o||{}),{tint,nocol:true});s.M.restore()};
const box=(s,mat,col,x0,x1,y0,y1,z0,z1,bev)=>{s.M.color(col);s.M.boxB(mat,x0,x1,y0,y1,z0,z1,bev?{bevel:bev}:undefined)};
const lightbar=(s,y,z,w,cols)=>{box(s,'dark',[.08,.08,.09],-w/2,w/2,y,y+.06,z-.15,z+.15);const n=cols.length,step=w/n;cols.forEach((c,i)=>box(s,'lamp',c,-w/2+i*step+.02,-w/2+(i+1)*step-.02,y+.06,y+.15,z-.13,z+.13))};
const RED=[1,.12,.1],BLUE=[.15,.35,1],WHITE=[1,1,.95];

/* kind -> {key, dims [length, width, height], build(session), dress(group)} */
const KINDS={
 civilian:o=>{const m=o.model||pick(MODELS),ci=o.ci!==undefined?o.ci:Math.floor(Math.random()*COLS.length),dust=Math.random()<.5,t=o.tint||COLS[ci];
  return{key:'civ|'+m+'|'+t.join(',')+'|'+(dust?1:0),dims:[4.4,1.85,m==='suv'||m==='offroad'||m==='mpv'?1.8:1.45],build:s=>car(s,m,t,{dust})}},
 wreck:o=>{const m=o.model||pick(['sedan','hatch','suv','cross']);return{key:'wreck|'+m,dims:[4.4,1.85,1.2],build:s=>car(s,m,null,{wreck:true})}},
 jeep:o=>{const t=o.tint||[.33,.38,.22];return{key:'jeep|'+t.join(','),dims:[4.3,1.95,1.95],build:s=>car(s,'offroad',t,{dust:true}),
  dress:g=>{if(!o.noStar)sides(g,textMat('★',1,'#e8e8d0'),.55,.55,.99,.95,.3)}}},
 taxi:o=>({key:'taxi',dims:[4.4,1.85,1.65],build:s=>{car(s,'sedan',[.96,.72,.06],{});
   box(s,'lamp',[1,.95,.7],-.32,.32,1.4,1.6,-.42,-.1,.02);
   for(const sd of[-1,1])for(let i=0;i<14;i++)if(i%2===0)box(s,'paint',[.04,.04,.04],sd*.885,sd*.9,.6,.68,-1.5+i*.22,-1.29+i*.22)},
  dress:g=>{const m=textMat('TAXI',3.4,'#111');plane(g,m,.56,.16,0,1.5,-.09,0);plane(g,m,.56,.16,0,1.5,-.43,PI)}}),
 police:o=>({key:'police',dims:[4.4,1.85,1.65],build:s=>{car(s,'sedan',[.07,.07,.08],{});
   for(const sd of[-1,1])box(s,'paint',[.94,.94,.94],sd*.872,sd*.893,.36,.86,-1.16,.86);
   box(s,'paint',[.94,.94,.94],-.62,.62,.66,.78,1.62,2.0);lightbar(s,1.4,-.28,1.3,[RED,RED,WHITE,BLUE,BLUE])},
  dress:g=>{sides(g,textMat('POLICE',4.2,'#111'),1.1,.26,.9,.62,-.15);sides(g,textMat('911',2.2,'#111'),.4,.18,.9,.42,-.15)}}),
 van:o=>{const t=o.tint||[.94,.94,.92],sc=[.86,.8,.72];return{key:'van|'+t.join(','),dims:[5.5,2.1,2.85],build:s=>truck(s,'box',t,{},sc),
  dress:g=>{if(o.label)sides(g,textMat(o.label,6,o.labelCol||'#7a2a12'),2.9,.48,1.06,1.75,-.7)}}},
 boxtruck:o=>{const t=o.tint||[.95,.95,.93];return{key:'box|'+t.join(','),dims:[7.6,2.5,3.6],build:s=>truck(s,'box',t,{}),
  dress:g=>{if(o.label)sides(g,textMat(o.label,6.5,o.labelCol||'#7a2a12'),4.4,.68,1.235,2.25,-.8)}}},
 ambulance:o=>{const sc=[.9,.85,.8];return{key:'ambulance',dims:[6.1,2.25,3.15],build:s=>{truck(s,'box',[.97,.97,.96],{},sc);
   for(const sd of[-1,1])box(s,'paint',[.8,.06,.06],sd*1.1,sd*1.12,1.18,1.42,-2.9,1.64);box(s,'paint',[.8,.06,.06],-1.1,1.1,1.18,1.42,-2.93,-2.91);
   lightbar(s,3.02,1.5,1.6,[RED,WHITE,RED,WHITE,RED])},
  dress:g=>{sides(g,textMat('AMBULANCE',6,'#c8141a'),2.6,.42,1.115,2.2,-.7);sides(g,crossMat(),.75,.75,1.115,2.2,1.05);plane(g,crossMat(),.9,.9,0,2.1,-2.935,PI)}}},
 firetruck:o=>({key:'firetruck',dims:[7.7,2.55,3.05],build:s=>{truck(s,'cargo',[.72,.05,.04],{});
   box(s,'paint',[.72,.05,.04],-1.2,1.2,1.45,2.6,-3.55,1.45,.04);
   for(const sd of[-1,1]){for(const y of[1.78,2.18])box(s,'steel',[.8,.8,.82],sd*1.2,sd*1.225,y,y+.03,-3.5,1.4);for(const z of[-2.3,-.9,.5])box(s,'steel',[.7,.7,.72],sd*1.2,sd*1.225,1.5,2.55,z,z+.03)}
   box(s,'paint',[.95,.95,.9],-1.27,1.27,1.12,1.22,2.0,3.74);
   for(const x of[-.44,.44])box(s,'steel',[.85,.85,.85],x-.04,x+.04,2.66,2.74,-4.1,2.5);for(let z=-4;z<2.4;z+=.36)box(s,'steel',[.8,.8,.8],-.44,.44,2.68,2.72,z,z+.05);
   for(const z of[-3,1])box(s,'dark',[.15,.15,.15],-.5,.5,2.6,2.66,z-.06,z+.06);
   s.M.color([.55,.55,.55]);s.M.save().move(0,1.95,-3.62).rotX(PI/2);s.M.cyl('steel',.42,.18,16);s.M.restore();
   lightbar(s,2.86,2.95,1.5,[RED,WHITE,RED,WHITE,RED])},
  dress:g=>{sides(g,textMat('FIRE DEPT',5,'#f0c030'),2.8,.5,1.23,2.0,-1.0)}}),
 army:o=>({key:'army',dims:[8.6,2.8,3.4],build:s=>{s.M.save().move(0,0,.45).rotY(PI).scl(1.12);s.M.put(PF.truck('army',{}),{tint:[.33,.38,.22],nocol:true});s.M.restore()}})
};
const TPL=new Map();
function make(kind,x,z,rot,o){o=o||{};rot=rot||0;const spec=(KINDS[kind]||KINDS.civilian)(o);
 if(!on()){const g=/firetruck|army|boxtruck/.test(kind)&&typeof makeArmyTruck==='function'?makeArmyTruck(x,z):makeCar(x,z,rot);return g}
 const g=P.vehicleGroup('mfzv|'+spec.key,spec.build);if(spec.dress)spec.dress(g);
 g.position.set(x,0,z);g.rotation.y=rot;g.frustumCulled=false;g.userData={veh:1,kind:'vehicle',vkind:kind};scene.add(g);
 const[L,W,H]=spec.dims,c=Math.abs(Math.cos(rot)),s=Math.abs(Math.sin(rot)),hx=(W*c+L*s)/2,hz=(W*s+L*c)/2;
 solids.push(new T.Box3(new T.Vector3(x-hx,0,z-hz),new T.Vector3(x+hx,H*.62,z+hz)));
 walkables.push(new T.Box3(new T.Vector3(x-hx,0,z-hz),new T.Vector3(x+hx,H,z+hz)));
 g.userData.half=[hx,hz];return g}
window.MFZV={make,kinds:Object.keys(KINDS),on};
console.log('[vehicles] '+Object.keys(KINDS).length+' vehicle variants ready');
})();
