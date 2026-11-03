#!/usr/bin/env node
/* Builds docs/SURVIVOR_PERSONAS.md from js/data/survivors.js (designs) + js/data/fzcfg.js (names, ages, families, relations).
   Usage (from the MiniFortZombie folder):  node tools/survivor/personas_md.js */
const fs=require('fs'),path=require('path');const root=path.join(__dirname,'..','..');
global.window={};eval(fs.readFileSync(path.join(root,'js/data/survivors.js'),'utf8'));const S=window.RSURV;
const cfgSrc=fs.readFileSync(path.join(root,'js/data/fzcfg.js'),'utf8'),m=cfgSrc.match(/textContent="(.*)";/s),CH=JSON.parse(JSON.parse('"'+m[1]+'"')).chars;
const ETH={W:'White',B:'Black',A:'Asian',M:'Mixed heritage'};
const HS={bald:'shaved / bald',fringe:'bald crown with a close-cropped fringe',buzz:'buzz cut',short:'short crop',side:'short, side-parted',slick:'slicked back',receding:'short, receding hairline',
 curly:'short curls',curlyshort:'short curly cut',kid:'messy kid cut',fade:'high-top fade',cornrows:'cornrows',afro:'afro',puffs:'two afro puffs',bob:'bob',pixie:'pixie cut',
 long:'long and straight',wavy:'long waves',shaggy:'shaggy, collar length',ponytail:'ponytail',bun:'bun',pigtails:'pigtails',braids:'long box braids',locs:'shoulder-length locs',updo:'pinned-up curls',headwrap:'covered by a head wrap'};
const FH={stub:'stubble',beard:'short full beard',full:'full beard',goat:'goatee',chin:'chin beard',mous:'moustache'};
const TOP={tee:'T-shirt',long:'long-sleeve top',shirt:'collared shirt',polo:'polo shirt',suit:'suit',blazer:'blazer',jacket:'jacket',sweater:'sweater',cardigan:'cardigan',hoodie:'hoodie',
 flannel:'plaid flannel shirt',tank:'tank top',scrubs:'scrubs',uniform:'uniform shirt',dress:'dress',blouse:'blouse',coverall:'coveralls',track:'tracksuit top',turtleneck:'turtleneck',
 jersey:'sports jersey',stripes:'striped top',labcoat:'white coat',longcoat:'long coat',sweatervest:'sweater vest over a shirt',safari:'safari vest over a shirt',workshirt:'work shirt',camo:'camo jacket',clerical:'clerical shirt'};
const BOT={jeans:'jeans',slacks:'slacks',cargo:'cargo trousers',shorts:'shorts',skirt:'skirt',longdress:'floor-length skirt',leggings:'leggings',overalls:'overalls',turnout:'turnout trousers',
 tracks:'track pants',camo:'camo trousers',scrubs:'scrub trousers',coverall:'coveralls'};
const BUILD={child:'child',teen:'teen',slim:'slim',petite:'petite',avg:'average',heavy:'heavy-set',strong:'muscular',senior:'senior, slight stoop',officer:'upright, squared shoulders'};
const hex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
const accTxt=a=>a.map(x=>{const [k,c,c2]=x.split(':');return k+(c&&!isNaN(+c)?' ('+hex(+c)+(c2?' / '+hex(+c2):'')+')':c&&isNaN(+c)?' '+c:'')}).join(', ')||'-';
const ag=a=>a==null?'?':a<13?'Child':a<18?'Teen':a<60?'Adult':'Senior';
let md=`# Mini Fort Zombie - Survivor Personas\n\nGenerated from \`js/data/survivors.js\` by \`tools/survivor/personas_md.js\`. The game builds every model below on the Modern body\n(\`js/modern/survivors.js\`). Turn it off in Options > Graphics > Survivor models > Classic.\n\n`;
md+=`## 1. Base persona models (age x gender x ethnicity)\n\nUsed for any survivor without a named design (for example generic rescues when the Fort Zombie data is off), with light per-survivor variation in tops and colours.\n\n`;
for(const [k,a] of Object.entries(S.ARCH)){
 md+=`### ${a.l} (\`${k}\`)\n- **Demographic profile:** ${a.l} - age group ${ag(a.age)} (model age ${a.age}), ${a.g==='F'?'female':'male'}, ${ETH[a.e]}\n`;
 md+=`- **Physical features:** ${a.feat} Model: ${BUILD[a.b]||a.b} build, hair ${HS[a.hs]||a.hs} (${a.hc})${a.fh?', '+FH[a.fh]:''}, ${a.ey} eyes; ${TOP[a.top]||a.top} ${hex(a.tc)}, ${BOT[a.bot]||a.bot}${a.acc.length?', '+accTxt(a.acc):''}.\n`;
 md+=`- **Character context:** ${a.ctx}\n\n`}
md+=`## 2. Named survivors (${Object.keys(S.D).length})\n\nEach named Fort Zombie survivor has a unique design. Ethnicity is not in the original data, so it was assigned per family (with in-laws and their children\nfollowing their own lines). Relationships are taken from the game data as-is.\n\n`;
const fams={};for(const id in CH){const f=CH[id].fam||(CH[id].tarot?'Tarot survivors':'Unattached');(fams[f]=fams[f]||[]).push(id)}
const sig=new Map();
for(const [f,ids] of Object.entries(fams)){md+=`### ${f}\n\n| Survivor | Age / sex | Occupation | Heritage | Relations | Design |\n|---|---|---|---|---|---|\n`;
 for(const id of ids){const c=CH[id],d=S.D[id];if(!d){md+=`| ${c.n} | ${c.age} ${c.sex} | ${c.occ} | - | - | **no design** |\n`;continue}
  const rel=(c.rel||[]).filter((r,i,a)=>a.findIndex(q=>q[0]===r[0]&&q[1]===r[1])===i).map(([r,t])=>r.replace(/([a-z])([A-Z])/g,'$1 $2')+': '+(CH[t]?CH[t].n:t)).join('; ')||'-';
  const look=`${BUILD[d.b]||d.b}; ${d.sk} skin; hair ${HS[d.hs]||d.hs} (${d.hc})${d.fh?'; '+FH[d.fh]:''}; ${d.ey} eyes; ${TOP[d.top]||d.top}${d.tc!=null?' '+hex(d.tc):''} + ${BOT[d.bot]||d.bot}${d.pc!=null?' '+hex(d.pc):''}; ${accTxt(d.acc||[])}. *${d.note}*`;
  md+=`| **${c.n}** | ${c.age||'ageless'} ${c.sex[0]} | ${c.occ.replace(/([a-z])([A-Z])/g,'$1 $2')} | ${ETH[d.e]} | ${rel} | ${look} |\n`;
  const k=[d.e,d.sk,d.hs,d.hc,d.fh||'',d.top,d.tc,d.bot,d.pc,(d.acc||[]).join('+')].join('|');sig.set(k,(sig.get(k)||[]).concat(c.n))}
 md+='\n'}
md+=`### MFZ's own survivors (in the recruit pool since v067)\n\n| Survivor | Age / sex | Occupation | Heritage | Design |\n|---|---|---|---|---|\n`;
for(const id of Object.keys(S.D).filter(k=>(k==='npc_Miller'||k==='npc_Aris'))){const d=S.D[id];md+=`| **${d.n}** | ${d.age} ${d.g} | ${id==='npc_Miller'?'Soldier':'Doctor'} | ${ETH[d.e]} | ${BUILD[d.b]}; hair ${HS[d.hs]} (${d.hc})${d.fh?'; '+FH[d.fh]:''}; ${TOP[d.top]} + ${BOT[d.bot]}; ${accTxt(d.acc)}. *${d.note}* |\n`}
md+='\n';
const dup=[...sig.values()].filter(v=>v.length>1);
md+=`## 3. Checks\n\n- Named survivors in the game data: ${Object.keys(CH).length}; with a design: ${Object.keys(CH).filter(k=>S.D[k]).length}; plus ${Object.keys(S.D).filter(k=>(k==='npc_Miller'||k==='npc_Aris')).length} MFZ survivors (Sgt. Miller, Dr. Aris).\n- Duplicate designs: ${dup.length?dup.map(v=>v.join(' / ')).join('; '):'none - every survivor is unique'}.\n`;
md+=`- Data quirks kept as-is (from the original Fort Zombie files): April Blackwood lists Tiberious Ashton as her brother; Arthur Conan Dunsany lists Richard Machen as "Aunt";\n  Algernon Blackwood lists August twice; Morgana Holroyd (The Witch) has age 0 and is treated as ageless; Jebediah Lovecraft's id is spelled \`npc_Lovecraft_Jedediah\`.\n`;
fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.writeFileSync(path.join(root,'docs/SURVIVOR_PERSONAS.md'),md);
console.log('wrote docs/SURVIVOR_PERSONAS.md',md.length,'chars; duplicates:',dup.length);
