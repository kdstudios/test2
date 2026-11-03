/* Mini Fort Zombie: export the Modern soldier body (+ helmet / plate-carrier accessories) posed arms-down, in MFZ model space (+z forward).
   Needs the Modern source next to MFZ and Playwright:  node tools/zombie/export.js [skin] [lo|hi]  -> raw_<skin>_<lod>.json
   then: python3 tools/zombie/build_rz.py raw_<skin>_<lod>.json <MiniFortZombie folder> */
const {chromium}=require('playwright');const fs=require('fs');
const RIP=process.env.RIPOSTE||'/home/claude/src/Riposte-Frontline-Source-main/dist/riposte-frontline.html';
(async()=>{const skin=process.argv[2]||'assault',lod=process.argv[3]||'lo';const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await b.newPage({viewport:{width:400,height:300}});
await p.route(/peerjs|_vercel|https?:/,r=>r.abort());p.on('pageerror',e=>console.log('PAGEERR '+e.message.slice(0,200)));
await p.goto('file://'+RIP);await p.waitForTimeout(4000);
const out=await p.evaluate(([skin,lod])=>{
 SKINS[skin].parts.face=true;const R=soldierRest(),hi=lod==='hi';GEAR_HI=hi;
 const J=R.J.map(v=>v.clone());
 for(const sx of[-1,1]){const s=SIDE_B(sx);
  J[s.jEl].copy(J[s.jSh]).addScaledVector(new V3(sx*.06,-1,-.06).normalize(),SD.ua);
  J[s.jHa].copy(J[s.jEl]).addScaledVector(new V3(sx*.02,-1,-.16).normalize(),SD.fa);
  J[s.jKn].copy(J[s.jHi]).addScaledVector(new V3(0,-1,-.03).normalize(),SD.thigh);
  J[s.jFt].copy(J[s.jKn]).addScaledVector(new V3(0,-1,.03).normalize(),SD.shin)}
 const Bo=[];for(let i=0;i<SOLDIER_NB;i++)Bo.push(new THREE.Object3D());
 soldierFrames(J,Bo,{rest:R.q,lastN:R.lastN.map(v=>v.clone()),fwd:new V3(0,0,-1),fp:[0,0],headQ:null});
 const K=Bo.map((o,i)=>new THREE.Matrix4().compose(o.position,o.quaternion,new V3(1,1,1)).multiply(R.mats[i].clone().invert()));
 function bake(g){const P=g.attributes.position,N=g.attributes.normal,UV=g.attributes.uv,C=g.attributes.color,SI=g.attributes.skinIndex.array,SW=g.attributes.skinWeight.array,n=P.count;
  const pos=[],nor=[],uv=[],col=[],bone=[],v=new V3(),acc=new V3(),nn=new V3(),na=new V3(),M3=new THREE.Matrix3();
  for(let i=0;i<n;i++){acc.set(0,0,0);na.set(0,0,0);let best=-1,bwt=-1;
   for(let k=0;k<4;k++){const bi=SI[i*4+k],w=SW[i*4+k];if(w<=0)continue;if(w>bwt){bwt=w;best=bi}
    v.fromBufferAttribute(P,i).applyMatrix4(K[bi]);acc.addScaledVector(v,w);nn.fromBufferAttribute(N,i).applyMatrix3(M3.getNormalMatrix(K[bi]));na.addScaledVector(nn,w)}
   na.normalize();pos.push(-acc.x,acc.y,-acc.z);nor.push(-na.x,na.y,-na.z);uv.push(UV.getX(i),UV.getY(i));col.push(C.getX(i),C.getY(i),C.getZ(i));bone.push(best)}
  return {pos,nor,uv,col,bone,idx:Array.from(g.index.array),n}}
 const body=(()=>{const B=new SkinBuilder();soldierBase(B,skin,hi);soldierBoots(B,skin,hi);return bake(B.build())})();
 const acc={};
 try{const B=new SkinBuilder();soldierHelmet(B,skin,hi);acc.helmet=bake(B.build())}catch(e){acc.helmetErr=String(e)}
 try{const B=new SkinBuilder();soldierVest(B,skin,hi);acc.vest=bake(B.build())}catch(e){acc.vestErr=String(e)}
 const fl=o=>[-o.x,o.y,-o.z];
 const joints={};for(const sx of[-1,1]){const s=SIDE_B(sx),side=sx<0?'R':'L';joints['sh'+side]=fl(J[s.jSh]);joints['el'+side]=fl(J[s.jEl]);joints['ha'+side]=fl(J[s.jHa]);joints['hi'+side]=fl(J[s.jHi]);joints['kn'+side]=fl(J[s.jKn]);joints['ft'+side]=fl(J[s.jFt])}
 joints.neck=fl(Bo[SB.NEC].position);joints.head=fl(Bo[SB.HEA].position);joints.chest=fl(J[J_CHE]);joints.pel=fl(J[J_PEL]);
 return Object.assign(body,{acc,joints,SB});
},[skin,lod]);
fs.writeFileSync(`raw_${skin}_${lod}.json`,JSON.stringify(out));
console.log('body verts',out.n,'acc',Object.keys(out.acc).map(k=>k+':'+(out.acc[k].n||out.acc[k])).join(' '));
const at=await p.evaluate((skin)=>{const T=gearTextures(skin,false);return T.map.image.toDataURL('image/png')},skin);
fs.writeFileSync('atlas_map_'+skin+'.png',Buffer.from(at.split(',')[1],'base64'));await b.close()})();
