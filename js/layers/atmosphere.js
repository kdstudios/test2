/* ==========================================================================================================
   MINI FORT ZOMBIE - ATMOSPHERE LAYER
   Modern's sky / weather / lighting ideas rebuilt on MFZ's own scene:
     - procedural sky dome (gradient, sun, clouds, stars, Doom volcano plume + lightning)
     - weather presets: clear, overcast, fog, storm, snow, sandstorm, and DOOM (used for the Day-14 siege)
     - particles: rain, snow, ash, embers, blown dust (camera-wrapped, GPU animated)
     - lightning + synthesised thunder
     - post pass: colour grade, vignette, bloom (three EffectComposer, only while a run is active)
   Visual only. It never reads or writes gameplay state; G.mode / G.day / G.time are only read.
   Hooks: wraps window.lighting() (multiplies MFZ's own light values) and RGW.pre() (per-frame update).
   ========================================================================================================== */
(function(){
'use strict';
const W=window.RGW,FX=window.RGFX;if(!W||!FX){console.warn('[atmo] needs world + graphics layers');return}
const T=THREE,V3=T.Vector3,C=h=>new T.Color(h),TAU=Math.PI*2;
const ATM=window.RGATM={name:'clear',cur:null,flash:0,lit:0,inPost:false,stats:{}};
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const night=c=>new T.Color(c.r*.07+.012,c.g*.07+.018,c.b*.07+.035);

/* ------------------------------------------ presets ------------------------------------------
   z/m/h = sky zenith / mid / horizon [day, night(optional)]. Values are MFZ-style raw colours.            */
const P={
 clear:   {z:[0x3a78c4],m:[0x7098c8],h:[0xb8d0e4],fog:1,sun:0xffeedd,sunM:1,amb:0x667788,ambM:1,cloud:.18,sat:1.04,exp:1.02,tint:0xfff6ec,bloom:.9,vig:.8},
 overcast:{z:[0x77838f],m:[0x93a0aa],h:[0xb0b9c0],fog:1.35,sun:0xe6e8ea,sunM:.42,amb:0x8a96a2,ambM:1.25,cloud:.95,dark:.35,sat:.82,exp:1.0,tint:0xf0f4f8,bloom:.5,vig:1},
 fog:     {z:[0x95a1a8],m:[0xaab5ba],h:[0xc2cacd],fog:3.4,sun:0xeeeeea,sunM:.45,amb:0x929ca4,ambM:1.3,cloud:.7,dark:.15,sat:.78,exp:1.02,tint:0xf2f6f8,bloom:.6,vig:1.1},
 rain:    {z:[0x2f3a44],m:[0x4b5762],h:[0x76828b],fog:2.0,sun:0xb8c4d0,sunM:.22,amb:0x6c7a88,ambM:1.1,cloud:1,dark:.8,sat:.78,exp:.98,tint:0xe4eef8,bloom:.5,vig:1.2,rain:1,storm:1},
 snow:    {z:[0x9aaec4],m:[0xbccbdb],h:[0xdce6ee],fog:1.9,sun:0xeef4ff,sunM:.55,amb:0x9fb0c4,ambM:1.3,cloud:.85,dark:.1,sat:.75,exp:1.04,tint:0xe8f0ff,bloom:.8,vig:1,snow:1},
 dust:    {z:[0xad8650],m:[0xc4a06c],h:[0xdcbb86],fog:3.6,sun:0xffd49a,sunM:.62,amb:0xa88a60,ambM:1.2,cloud:.5,dark:.2,sat:1.0,exp:1.0,tint:0xfff0d8,bloom:.8,vig:1.1,dust:1},
 doom:  {z:[0x3a1c14,0x0c0506],m:[0x72341c,0x2c0f08],h:[0xc65a22,0x8e2c0e],fog:1.3,fogC:[0x4a2314,0x3a1509],sun:0xff8a4c,sunM:1.1,amb:0xc07a58,ambM:2.1,cloud:1,dark:.9,sat:1.12,exp:1.0,tint:0xffeedd,bloom:1.5,vig:1.35,ash:1,ember:1,storm:1,plume:1,glow:1}
};
const AUTO=[['clear',34],['overcast',20],['rain',16],['fog',12],['snow',6],['dust',12]];
const pre={};for(const k in P){const p=P[k];pre[k]={zD:C(p.z[0]),zN:p.z[1]!=null?C(p.z[1]):night(C(p.z[0])),mD:C(p.m[0]),mN:p.m[1]!=null?C(p.m[1]):night(C(p.m[0])),hD:C(p.h[0]),hN:p.h[1]!=null?C(p.h[1]):night(C(p.h[0])),
 fcD:p.fogC?C(p.fogC[0]):null,fcN:p.fogC?C(p.fogC[1]):null,fog:p.fog,sun:C(p.sun),sunM:p.sunM,amb:C(p.amb),ambM:p.ambM,cloud:p.cloud,dark:p.dark||0,sat:p.sat,exp:p.exp,tint:C(p.tint),bloom:p.bloom,vig:p.vig,
 rain:p.rain||0,snow:p.snow||0,dust:p.dust||0,ash:p.ash||0,ember:p.ember||0,storm:p.storm||0,plume:p.plume||0,glow:p.glow||0}}
ATM.presets=P;
const cur={zen:C(0x3a78c4),mid:C(0x7098c8),hor:C(0xb8d0e4),fogC:C(0xb8d0e4),sun:C(0xffeedd),amb:C(0x667788),tint:C(0xffffff),
 fog:1,sunM:1,ambM:1,cloud:.18,dark:0,sat:1,exp:1,bloom:.9,vig:.8,rain:0,snow:0,dust:0,ash:0,ember:0,plume:0,glow:0,storm:0};
ATM.cur=cur;let snapNext=true;

/* ------------------------------------------ sky dome ------------------------------------------ */
const skyMat=new T.ShaderMaterial({
 uniforms:{uZen:{value:cur.zen},uMid:{value:cur.mid},uHor:{value:cur.hor},uSunDir:{value:new V3(0,1,0)},uSunCol:{value:cur.sun},uDay:{value:1},uTime:{value:0},uCloud:{value:.2},uDark:{value:0},
  uStorm:{value:0},uPlume:{value:0},uGlow:{value:0},uAz:{value:.9},uSunVis:{value:1}},
 vertexShader:`varying vec3 vD;void main(){vD=normalize(position);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_Position.z=gl_Position.w;}`,
 fragmentShader:`precision highp float;varying vec3 vD;
 uniform vec3 uZen,uMid,uHor,uSunDir,uSunCol;uniform float uDay,uTime,uCloud,uDark,uStorm,uPlume,uGlow,uAz,uSunVis;
 float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}
 float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
 float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(7.1,3.7);a*=.5;}return s;}
 void main(){
  vec3 d=normalize(vD);float h=d.y,hz=clamp(h,0.,1.);
  vec3 col=mix(uHor,uMid,smoothstep(0.,.22,hz));col=mix(col,uZen,smoothstep(.12,.85,hz));
  if(h<0.)col=mix(uHor,uHor*.55,clamp(-h*4.,0.,1.));
  float az=atan(d.x,d.z);
  /* stars */
  float ns=1.-smoothstep(.0,.35,uDay);
  if(ns>0.&&h>0.){vec3 sc=d*75.;vec3 ci=floor(sc);float r=fract(sin(dot(ci,vec3(12.9898,78.233,37.719)))*43758.5453);float dd=length(fract(sc)-.5);float st=step(.994,r)*smoothstep(.3,.0,dd)*smoothstep(0.,.1,h);col+=vec3(.9,.95,1.)*st*ns*(1.-uCloud*.85)*(.55+.45*sin(uTime*2.+r*400.));}
  /* sun */
  float sd=max(dot(d,uSunDir),0.);float sv=uSunVis*smoothstep(-.05,.1,uSunDir.y);
  col+=uSunCol*(pow(sd,900.)*4.+pow(sd,24.)*.35+pow(sd,4.)*.12)*sv;
  /* clouds */
  vec2 q=d.xz/(h+.28);float n=fbm(q*.9+vec2(uTime*.012,uTime*.006));
  float c=smoothstep(1.02-uCloud*.75,1.05-uCloud*.25,n)*smoothstep(-.03,.18,h);
  vec3 cl=mix(vec3(1.),vec3(.28,.30,.34),uDark)*mix(vec3(.1,.11,.14),vec3(1.),smoothstep(0.,.5,uDay)*.9+.1);
  cl=mix(cl,uHor*1.2+uSunCol*.1,.25+.3*(1.-uDark));
  col=mix(col,cl,c*(.55+.4*uCloud));
  /* doom: ash plume column and lava glow along the horizon */
  if(uPlume>0.||uGlow>0.){
   float da=abs(atan(sin(az-uAz),cos(az-uAz)));
   float wd=.20+max(h,0.)*.55;
   float col2=smoothstep(wd,wd*.25,da)*smoothstep(-.06,.04,h)*smoothstep(1.25,.25,h);
   float bil=fbm(vec2(az*3.,h*5.)-vec2(0.,uTime*.05));
   float m=col2*smoothstep(.25,.7,bil+.35)*uPlume;
   vec3 ash=mix(vec3(.05,.03,.03),vec3(.34,.15,.08),smoothstep(.0,.35,1.-h)*(.4+.6*bil));
   col=mix(col,ash,m*.92);
   col+=vec3(1.,.38,.09)*pow(max(1.-h*3.2,0.),2.)*col2*uPlume*(.55+.45*bil)*1.1;
   float lava=pow(max(cos(az-uAz),0.),3.);
   col+=vec3(1.,.30,.06)*uGlow*exp(-max(h,0.)*7.)*(.28+.72*lava)*.75;
   col+=vec3(.8,.18,.04)*uGlow*c*.22*(1.-smoothstep(0.,.7,h));
  }
  col+=vec3(.62,.68,1.)*uStorm*(.25+c*.9+.0)*(.4+.6*smoothstep(.0,.6,h+.3));
  gl_FragColor=vec4(col,1.);
 }`,
 side:T.BackSide,depthWrite:false,depthTest:true,fog:false});
skyMat.depthFunc=T.LessEqualDepth;
const dome=new T.Mesh(new T.SphereGeometry(100,32,16),skyMat);dome.renderOrder=-1000;dome.frustumCulled=false;dome.visible=false;dome.name='rg-sky';dome.raycast=function(){};   // never hit by bullets / look rays

/* ------------------------------------------ particles ------------------------------------------ */
const BOX=new V3(46,28,46);
const PT_VS=`uniform float uT;uniform vec3 uCam,uBox,uVel;uniform float uSway,uSize,uPx,uStretch;attribute vec4 aR;attribute float aE;varying float vA;varying float vF;
 void main(){vec3 p=aR.xyz*uBox;p+=uVel*uT*(.75+aR.w*.5);p.x+=sin(uT*.7+aR.w*40.)*uSway;p.z+=cos(uT*.6+aR.w*31.)*uSway;
  vec3 w=mod(p-uCam+uBox*.5,uBox)-uBox*.5;vec3 wp=uCam+w;
  #ifdef LINES
   wp-=normalize(uVel)*aE*uStretch;
  #endif
  vec4 mv=viewMatrix*vec4(wp,1.);gl_Position=projectionMatrix*mv;
  gl_PointSize=min(uSize*(.55+aR.w*.9)*uPx/max(-mv.z,.4),28.);
  vA=smoothstep(uBox.x*.5,uBox.x*.32,length(w.xz))*smoothstep(.2,1.6,-mv.z);vF=aR.w;}`;
const PT_FS=`precision highp float;uniform vec3 uCol;uniform float uAlpha,uT,uFlick;varying float vA;varying float vF;
 void main(){
  #ifdef LINES
   float a=uAlpha*vA;
  #else
   float r=length(gl_PointCoord-.5)*2.;float a=smoothstep(1.,.15,r)*uAlpha*vA;
   a*=mix(1.,.55+.45*sin(uT*9.+vF*60.),uFlick);
  #endif
  if(a<.01)discard;gl_FragColor=vec4(uCol,a);}`;
function mkSystem(o){
 const N=o.max,pos=new Float32Array(N*(o.lines?2:1)*4),e=o.lines?new Float32Array(N*2):new Float32Array(N);
 for(let i=0;i<N;i++){const x=Math.random(),y=Math.random(),z=Math.random(),w=Math.random();
  if(o.lines){for(let k=0;k<2;k++){const j=(i*2+k)*4;pos[j]=x;pos[j+1]=y;pos[j+2]=z;pos[j+3]=w;e[i*2+k]=k}}else{pos[i*4]=x;pos[i*4+1]=y;pos[i*4+2]=z;pos[i*4+3]=w}}
 const g=new T.BufferGeometry();g.setAttribute('aR',new T.BufferAttribute(pos,4));g.setAttribute('aE',new T.BufferAttribute(e,1));
 g.setAttribute('position',new T.BufferAttribute(new Float32Array(pos.length/4*3),3));      // dummy (three needs 'position')
 const m=new T.ShaderMaterial({uniforms:{uT:{value:0},uCam:{value:new V3()},uBox:{value:BOX},uVel:{value:new V3(...o.vel)},uSway:{value:o.sway||0},uSize:{value:o.size},uPx:{value:600},uStretch:{value:o.stretch||0},
  uCol:{value:C(o.col)},uAlpha:{value:o.alpha},uFlick:{value:o.flick||0}},vertexShader:PT_VS,fragmentShader:PT_FS,transparent:true,depthWrite:false,blending:o.add?T.AdditiveBlending:T.NormalBlending,defines:o.lines?{LINES:1}:{}});
 const obj=o.lines?new T.LineSegments(g,m):new T.Points(g,m);obj.frustumCulled=false;obj.renderOrder=6;obj.visible=false;obj.userData.max=N;obj.userData.lines=!!o.lines;obj.name='rg-'+o.name;obj.raycast=function(){};
 return obj;
}
const SYS={
 rain:mkSystem({name:'rain',max:6000,lines:true,vel:[2.5,-30,1],stretch:1.1,size:1,col:0xaab8c8,alpha:.42}),
 snow:mkSystem({name:'snow',max:4500,vel:[1.2,-1.7,.6],sway:1.6,size:.065,col:0xffffff,alpha:.9}),
 ash:mkSystem({name:'ash',max:3600,vel:[2.2,-1.5,1.1],sway:1.1,size:.085,col:0x3a2c26,alpha:.78}),
 dust:mkSystem({name:'dust',max:900,vel:[11,-.15,3],sway:.8,size:.55,col:0xc9a468,alpha:.2}),
 ember:mkSystem({name:'ember',max:520,vel:[2.4,1.3,.9],sway:1.2,size:.07,col:0xff8a2c,alpha:1,add:true,flick:1})
};
const DENS=[0,.3,.65,1];
function updParticles(dt,t,camPos,shelter){
 const dens=DENS[FX.s.particles]||0,px=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));let drawn=0;
 for(const k in SYS){const o=SYS[k],m=o.material,u=m.uniforms,amt=cur[k]*dens*(1-shelter);
  if(amt<.02){o.visible=false;continue}
  o.visible=true;u.uT.value=t%900;u.uCam.value.copy(camPos);u.uPx.value=px;
  const n=Math.floor(o.userData.max*amt);o.geometry.setDrawRange(0,o.userData.lines?n*2:n);drawn+=n;
  if(k==='rain')u.uAlpha.value=.42;
  if(k==='ash')u.uCol.value.setHex(ATM.name==='doom'&&cur.glow>.5?0x4a342b:0x3a2c26);
 }
 ATM.stats.particles=drawn;
}

/* ------------------------------------------ weather selection ------------------------------------------ */
let salt=Math.floor(Math.random()*1e6),lastMode='';
function hash(n){n=(n^61)^(n>>>16);n=(n+(n<<3))|0;n=n^(n>>>4);n=Math.imul(n,0x27d4eb2d);n=n^(n>>>15);return(n>>>0)/4294967296}
function pickAuto(day){const r=hash(day*7919+salt)*100;let a=0;for(const [k,w] of AUTO){a+=w;if(r<a)return k}return'clear'}
function wanted(){
 const s=FX.s,mode=G.mode;
 if(mode==='SIEGE'&&s.siegeWx==='doom')return'doom';
 if(mode==='SIEGE'&&s.siegeWx==='off')return'clear';
 if(mode==='CLEAR'){if(lastMode!=='CLEAR')salt=Math.floor(Math.random()*1e6);lastMode='CLEAR';return s.weather==='auto'?'clear':s.weather}
 lastMode=mode;
 if(s.weather!=='auto')return s.weather;
 if(mode==='EXPEDITION')return missionWx||(missionWx=pickRoll(trueRnd()));   /* v076: each mission map rolls its own weather */
 return pickAuto(G.day|0);
}
let missionWx=null;
function pickRoll(r){r*=100;let a=0;for(const [k,w] of AUTO){a+=w;if(r<a)return k}return'clear'}
/* a new roll every time a mission map is built (stepped loader or one-shot), applied at once rather than blended in */
const trueRnd=()=>{try{return crypto.getRandomValues(new Uint32Array(1))[0]/4294967296}catch(e){return Math.random()}};   /* not Math.random: the menu town is built under a seeded Math.random and must stay the same town */
if(typeof WB!=='undefined')WB.pre.push(()=>{if(typeof G!=='undefined'&&G.mode==='EXPEDITION'){missionWx=pickRoll(trueRnd());snapNext=true}});
ATM.missionWx=()=>missionWx;
ATM.force=function(n){ATM._force=n;snapNext=false};
ATM.snap=()=>{snapNext=true};
ATM.predict=()=>{try{return wanted()}catch(e){return'clear'}};

/* ------------------------------------------ lightning / thunder ------------------------------------------ */
let lTimer=6,lQueue=[];
function thunder(delay){
 try{if(typeof AC==='undefined'||!AC||typeof SFX==='undefined'||!SFX)return;const dur=3.4,sr=AC.sampleRate,n=sr*dur|0,b=AC.createBuffer(1,n,sr),d=b.getChannelData(0);let lp=0;
  for(let i=0;i<n;i++){const t=i/n;lp+=(Math.random()*2-1-lp)*.035;d[i]=lp*Math.pow(1-t,2.1)*(1+.55*Math.sin(i/sr*13+Math.sin(i/sr*3)*3))*7}
  const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=240;const g=AC.createGain();g.gain.value=.8;s.connect(f);f.connect(g);g.connect(SFX);s.start(AC.currentTime+delay)}catch(e){}
}
function updLightning(dt){
 const on=cur.storm>.5&&FX.s.lightning;
 if(on){lTimer-=dt;if(lTimer<=0){ATM.flash=1;lQueue.push(.11+Math.random()*.1);thunder(.4+Math.random()*2.2);lTimer=(ATM.name==='doom'?5:8)+Math.random()*(ATM.name==='doom'?9:14)}}
 for(let i=lQueue.length-1;i>=0;i--){lQueue[i]-=dt;if(lQueue[i]<=0){ATM.flash=Math.max(ATM.flash,.75);lQueue.splice(i,1)}}
 ATM.flash=Math.max(0,ATM.flash-dt*3.2);
}

/* ------------------------------------------ post-processing ------------------------------------------ */
const GradeShader={uniforms:{tDiffuse:{value:null},uExp:{value:1},uSat:{value:1},uTint:{value:new T.Color(1,1,1)},uVig:{value:.3},uFlash:{value:0},uOn:{value:1}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uExp,uSat,uVig,uFlash,uOn;uniform vec3 uTint;varying vec2 vUv;
  void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 col=c.rgb;
   if(uOn>.5){col*=uExp*uTint;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,uSat);
    vec2 q=(vUv-.5)*vec2(1.,.82);float v=smoothstep(.95,.22,length(q));col*=mix(1.,v,clamp(uVig,0.,1.));}
   col+=uFlash*vec3(.42,.48,.7)*.2;
   gl_FragColor=vec4(max(col,0.),c.a);}`};
let comp=null,bloomPass=null,gradePass=null,compFor=null,compSize='';
function buildComposer(){
 const gl=renderer.getContext(),aa=!!(gl.getContextAttributes()&&gl.getContextAttributes().antialias);
 const w=innerWidth,h=innerHeight,pr=renderer.getPixelRatio();
 const rt=new T.WebGLRenderTarget(w*pr,h*pr,{type:T.HalfFloatType,format:T.RGBAFormat,samples:(aa&&renderer.capabilities.isWebGL2)?4:0});
 comp=new T.EffectComposer(renderer,rt);comp.setPixelRatio(pr);comp.setSize(w,h);
 comp.addPass(new T.RenderPass(scene,camera));
 bloomPass=new T.UnrealBloomPass(new T.Vector2(w,h),.4,.65,.82);comp.addPass(bloomPass);
 gradePass=new T.ShaderPass(GradeShader);comp.addPass(gradePass);
 compFor=renderer;compSize=w+'x'+h+'@'+pr;
}
function postWanted(){return !!(FX.s.post||FX.s.bloom)}
function installRender(){
 if(renderer.__atm)return;renderer.__atm=1;const o=renderer.render;
 renderer.render=function(s,c){
  if(s===scene&&c===camera&&!ATM.inPost&&ATM.active&&postWanted()){
   try{
    if(compFor!==renderer)buildComposer();
    const w=innerWidth,h=innerHeight,pr=renderer.getPixelRatio(),sz=w+'x'+h+'@'+pr;
    if(sz!==compSize){comp.setPixelRatio(pr);comp.setSize(w,h);compSize=sz}
    ATM.inPost=true;comp.render();return;
   }catch(e){if(!ATM.postErr){ATM.postErr=1;console.warn('[atmo] post disabled',e);FX.s.post=0;FX.s.bloom=0}}
   finally{ATM.inPost=false}
  }
  return o.apply(this,arguments);
 };
}

/* ------------------------------------------ per frame ------------------------------------------ */
const tmpV=new V3(),sunV=new V3();let last=performance.now(),tAcc=0,shelter=0,shelterT=0,shelterTarget=0;
function dayAmt(){return clamp(Math.sin((G.time-6)/24*TAU)*2+.3,0,1)}
function targetFor(name,d){
 const p=pre[name]||pre.clear;
 return{zen:p.zD.clone().lerp(p.zN,1-d),mid:p.mD.clone().lerp(p.mN,1-d),hor:p.hD.clone().lerp(p.hN,1-d),
  fogC:p.fcD?p.fcD.clone().lerp(p.fcN,1-d):p.hD.clone().lerp(p.hN,1-d),sun:p.sun,amb:p.amb,tint:p.tint,
  fog:p.fog,sunM:p.sunM,ambM:p.ambM,cloud:p.cloud,dark:p.dark,sat:p.sat,exp:p.exp,bloom:p.bloom,vig:p.vig,
  rain:p.rain,snow:p.snow,dust:p.dust,ash:p.ash,ember:p.ember,plume:p.plume,glow:p.glow,storm:p.storm};
}
function step(dt){
 const d=dayAmt(),name=ATM._force||wanted();
 if(name!==ATM.name){ATM.name=name;if(name==='doom'||name==='rain')lTimer=3+Math.random()*3}
 const tg=targetFor(name,d),k=snapNext?1:clamp(dt*1.4,0,1);snapNext=false;
 for(const f of ['zen','mid','hor','fogC','sun','amb','tint'])cur[f].lerp(tg[f],k);
 for(const f of ['fog','sunM','ambM','cloud','dark','sat','exp','bloom','vig','rain','snow','dust','ash','ember','plume','glow','storm'])cur[f]=lerp(cur[f],tg[f],k);
 ATM.day=d;
}
ATM.update=function(){
 const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;tAcc+=dt;
 ATM.active=!!(ATM.lit&&now-ATM.lit<1500&&typeof G!=='undefined'&&G&&G.mode);
 if(dome.parent!==scene){scene.add(dome);for(const k in SYS)scene.add(SYS[k])}   // clearWorld() strips scene children on every world build
 installRender();
 if(!ATM.active){dome.visible=false;for(const k in SYS)SYS[k].visible=false;return}
 step(dt);
 camera.getWorldPosition(tmpV);
 /* shelter: no rain/ash indoors */
 shelterT-=dt;if(shelterT<=0){shelterT=.2;try{shelterTarget=(G.mode!=='SIEGE'||true)&&inBuilding(pl.position.x,pl.position.z,-.4)?1:0}catch(e){shelterTarget=0}}
 shelter+=(shelterTarget-shelter)*clamp(dt*3,0,1);
 /* sky */
 const s=FX.s,u=skyMat.uniforms;
 dome.visible=!!s.sky;dome.position.copy(tmpV);
 if(s.sky){
  sunV.copy(dirL.position).sub(dirL.target.position).normalize();
  u.uSunDir.value.copy(sunV);u.uDay.value=ATM.day;u.uTime.value=tAcc;u.uCloud.value=cur.cloud;u.uDark.value=cur.dark;
  u.uPlume.value=cur.plume;u.uGlow.value=cur.glow;u.uStorm.value=ATM.flash*(FX.s.lightning?1:0);
  u.uSunVis.value=clamp(1-cur.cloud*(.55+cur.dark*.45),0,1)*(1-cur.plume*.9);
 }
 updLightning(dt);updParticles(dt,tAcc,tmpV,shelter);
 /* grade + bloom */
 if(gradePass){const g=gradePass.uniforms;g.uOn.value=s.post?1:0;g.uExp.value=cur.exp*(s.exposure/100);g.uSat.value=cur.sat*(s.saturation/100);g.uTint.value.copy(cur.tint);
  g.uVig.value=clamp(cur.vig*(s.vignette/100)*.85,0,1);g.uFlash.value=ATM.flash*(s.lightning?1:0);
  bloomPass.enabled=s.bloom>0;bloomPass.strength=(s.bloom===2?.8:.4)*cur.bloom*(.7+.3*(1-ATM.day))+ATM.flash*.35;
  bloomPass.threshold=cur.glow>.5?.62:.82}
 ATM.stats.name=ATM.name;
};
/* MFZ calls lighting() every frame while a run is active; we scale its output afterwards */
(function(){const ol=window.lighting;if(typeof ol!=='function'){console.warn('[atmo] lighting() not found');return}
 window.lighting=function(){ol.apply(this,arguments);ATM.lit=performance.now();try{ATM.light()}catch(e){if(!ATM.err){ATM.err=1;console.warn('[atmo] light',e)}}};
})();
ATM.light=function(){
 const s=FX.s;if(!cur.sun)return;
 if(snapNext&&!ATM._force)step(.016);   // first lit frame: settle immediately
 if(s.sky){scene.background=scene.background&&scene.background.isColor?scene.background.copy(cur.hor):cur.hor.clone();scene.fog.color.copy(cur.fogC)}
 scene.fog.density=.02*cur.fog*(s.fog/100);
 dirL.color.copy(cur.sun);ambL.color.copy(cur.amb);
 const f=ATM.flash*(s.lightning?1:0);
 dirL.intensity=dirL.intensity*cur.sunM+f*.6;ambL.intensity=ambL.intensity*cur.ambM+f*.9;
 /* doom: slow lava-light flicker on the ambient fill */
 if(cur.glow>.05)ambL.intensity*=1+Math.sin(performance.now()*.0031)*.035*cur.glow+Math.sin(performance.now()*.011)*.02*cur.glow;
};
/* hook into the world layer's per-frame callback (runs after lighting, before the draw) */
const wp=W.pre;W.pre=function(){wp.apply(this,arguments);try{ATM.update()}catch(e){if(!ATM.err2){ATM.err2=1;console.warn('[atmo] update',e)}}};
FX.onChange(k=>{
 if(k==='nmStrength'||k==='*'){const U=W.U;if(U){const m=FX.s.nmStrength/100;U.uCls.value.forEach((v,i)=>{if(v.__z===undefined)v.__z=v.z;v.z=v.__z*m})}}
 if(k==='weather'||k==='siegeWx'||k==='*')snapNext=true;
});
try{const m=FX.s.nmStrength/100;if(W.U&&m!==1)W.U.uCls.value.forEach(v=>{v.__z=v.z;v.z*=m})}catch(e){}
console.log('[atmo] atmosphere layer ready (presets: '+Object.keys(P).join(', ')+')');
})();
