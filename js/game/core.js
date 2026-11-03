/* ===== REV 039 early helpers (performance pass) ===== */
const PERF={aa:true,mat:'phong',built:false,farB:100,intR:16,n:0,zc:0,pr:1,prFor(q){return q===0?.6:q===1?1:q===3?(this.pr||1):Math.min(devicePixelRatio,2)}};
try{const o=JSON.parse(localStorage.getItem('gf_perf')||'null');if(o&&o.aa!==undefined)PERF.aa=!!o.aa}catch(e){}
class SolidList extends Array{
 static get [Symbol.species](){return Array}
 push(...a){const n=super.push(...a);if(this.G)for(const b of a)this.G.add(b);return n}
 splice(...args){const r=super.splice(...args);if(this.G){for(const b of r)this.G.del(b);for(const b of args.slice(2))this.G.add(b)}return r}
}
const TSC=new Map();
let _mmT=0;function mmCtx(){const n=performance.now();if(n-_mmT<100)return null;_mmT=n;return $('mm').getContext('2d')}
const VERSION='076';
const ZSPD=.9;   // v072: every zombie moves 10% slower than v071
const TAU=Math.PI*2,$=id=>document.getElementById(id),rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),Y=new THREE.Vector3(0,1,0);
const FORTS={police:{n:'Police Station',hp:1.25,sg:.75,z:1},prison:{n:'The Prison',hp:1,sg:0,z:1},school:{n:'The School',hp:1,sg:0,z:1.5}};
const ROLEFX={Guard:'Fires from the fort in the siege (uses ammo)',Builder:'Repairs barricades every day',Medic:'Overnight heals the injured (incl. you) based on First Aid; uses meds',Scavenger:'Brings in materials + food every day',Generalist:'Does a bit of everything at half strength'};
const RC={Guard:0x3b82f6,Builder:0xfb923c,Medic:0xe5e7eb,Scavenger:0xfacc15,Generalist:0x9ca3af};
const NAMES=['Ava','Ben','Cora','Dan','Eli','Faye','Gus','Hana','Ivo','Jo'];

/* =====================================================================================================
   REVISION 30 - ITEM REGISTRY. Every system (loot, inventories, resources, icons, tooltips) reads items ONLY from ITEMS.
   Spec dimensions are VERTICAL x HORIZONTAL and are kept in vh:[rows,cols]. size:[width,height] is what the grid code uses.
   value = INITIAL resource value. Each item instance carries its own remaining value (inst.rem).
   ===================================================================================================== */
const ITEMS={},ITEM_ORDER=[];
const CATS={melee:'Melee weapon',rifle:'Rifle',pistol:'Pistol',assault:'Assault rifle',smg:'Submachine gun',ammo:'Ammo',food:'Food',meds:'Medical',mat:'Materials'};
const RES_KEYS=['food','meds','mat','ammo'],RES_LABEL={food:'Food',meds:'Meds',mat:'Materials',ammo:'Ammo'},RES_COL={food:'#facc15',meds:'#ef4444',mat:'#60a5fa',ammo:'#22c55e'};
function defItems(cat,rk,rows){rows.forEach(r=>{const id=r[0],d=r[2].split('x').map(Number);if(ITEMS[id])throw new Error('duplicate item id '+id);
 ITEMS[id]={id,name:r[1],cat,vh:[d[0],d[1]],size:[d[1],d[0]],value:rk&&r[3]?{[rk]:r[3]}:null,use:r[4]||null};ITEM_ORDER.push(id)})}
defItems('melee',null,[['sickle','Sickle','3x2'],['machete','Machete','6x1'],['crowbar','Crowbar','6x2'],['baseball_bat','Baseball Bat','7x1'],['shovel','Shovel','9x2'],['fire_axe','Fire Axe','9x4'],['pitchfork','Pitchfork','9x2'],['broadsword','Broadsword','9x2'],['katana','Katana','9x1']]);
defItems('rifle',null,[['combat_shotgun','Combat Shotgun','3x7'],['model_70_safari','Model 70 Safari','2x11'],['lee_enfield','Lee-Enfield','2x11'],['pump_shotgun','Pump Shotgun','2x7'],['m1_garand','M1 Garand','3x11'],['shotgun','Shotgun','2x9']]);
defItems('pistol',null,[['beretta_9mm','9mm Beretta','2x2'],['desert_eagle','Desert Eagle','2x2'],['colt_detective_special','Colt Detective Special','2x2'],['colt_new_service_revolver','Colt New Service Revolver','2x2'],['colt_python','Colt Python','2x2'],['m1911a1','M1911A1','2x2'],['glock_21','Glock 21','2x2'],['glock_22','Glock 22','2x2']]);
defItems('assault',null,[['ak47','AK-47','3x8'],['m16','M16','3x8'],['ar90','AR-90','3x8'],['m4','M4','3x7']]);
defItems('smg',null,[['mac10','Mac-10','3x3'],['uzi','Uzi','3x3'],['tommygun','Tommygun','2x7']]);
defItems('ammo','ammo',[['ammo_303','.303','2x2',20],['ammo_357','.357','2x2',30],['ammo_38_fed','.38 fed','2x2',30],['ammo_38_win','.38 win','2x2',30],['ammo_40','.40','2x2',30],['ammo_44','.44','2x2',30],['ammo_45','.45','2x2',25],['ammo_458','.458','2x2',20],['ammo_12_gauge','12 Gauge','2x2',20],['ammo_556','5.56','2x2',25],['ammo_762','7.62','2x2',25],['ammo_9mm','9mm','2x2',30]]);
defItems('food','food',[['atomic_veggies','Atomic Veggies','3x3',5],['bacon','Bacon','4x5',10],['brans','Brans','3x3',3],['calzones','Calzones','3x3',8],['cheezholes','Cheezholes','2x2',2],['cherry_preserves','Cherry Preserves','5x4',15],['citrol','Citrol','2x2',1],['colacola','ColaCola','2x2',1],['fud','Fud','2x2',3],['granola','Granola','2x2',10],['herkeys_jerkey',"Herkey's Jerkey",'3x2',5],['kenball_soup','Kenball Soup','2x2',3],['lamburger','Lamburger','2x2',3],['military_rations','Military Rations','3x3',10],['milk','Milk','3x2',5],['natural_living','Natural Living','3x3',5],['peach_preserves','Peach Preserves','4x4',12],['pickled_herring','Pickled Herring','5x4',20],['pickles','Pickles','5x4',15],['pizan_pasta','Pizan Pasta','3x3',3],['popzi_soft_drink','Popzi Soft Drink','2x2',1],['ramen_noodles','Ramen Noodles','2x2',5],['salad','Salad','2x2',3],['salami','Salami','4x4',15],['sausages','Sausages','6x4',12],['smoked_ham','Smoked Ham','5x6',50],['soylent_greens','Soylent Greens','2x2',8],['sup_soft_drink','Sup soft drink','2x2',1],['tweex','Tweex','2x2',8],['water_jug','Water Jug','3x3',3],['z_energy_drink','Z-Energy Drink','2x2',3]]);
// meds can be used with hover+E: heals use.hp HP for use.cost Meds (less if the item has less left, scaled down)
defItems('meds','meds',[['cotton_balls','Cotton Balls','2x2',1,{hp:3,cost:1}],['antibiotics','Antibiotics','2x2',6,{hp:12,cost:3}],['gauze','Gauze','2x2',3,{hp:10,cost:3}],['medical_tape','Medical Tape','2x2',3,{hp:8,cost:3}],['medkit','MedKit','4x4',10,{hp:30,cost:5}],['painkiller','PainKiller','2x2',6,{hp:15,cost:3}]]);
defItems('mat','mat',[['bowling_ball','Bowling Ball','3x3',5],['bug_spray','Bug Spray','2x2',5],['bungie_cord','Bungie Cord','3x2',5],['butcher_knife','Butcher Knife','3x1',6],['car_battery','Car Battery','2x3',6],['duct_tape','Duct Tape','2x2',6],['fire_hose','Fire Hose','4x4',10],['gas_can','Gas Can','3x3',8],['gas_cylinder','Gas Cylinder','4x2',6],['nails','Nails','2x2',3],['rope','Rope','3x2',6],['spray_paint','Spray Paint','2x2',4],['spring','Spring','3x2',5]]);

/* ===== v042 NEW ITEMS. Spec sizes are HORIZONTAL x VERTICAL (width x height) and are converted to the registry's vertical x horizontal form. ===== */
function defItemsHV(cat,rk,rows){defItems(cat,rk,rows.map(r=>{const d=r[2].split('x');return [r[0],r[1],d[1]+'x'+d[0],r[3],r[4]]}))}
defItemsHV('food','food',[['cereo','Cereo','3x3',3],['crackers','Crackers','3x3',2],['224_ramen','224 Ramen','2x2',2],['apollo_meat','Apollo Meat','2x2',5],['potato_chips','Potato Chips','2x2',2],['eat_flakes','Eat Flakes','3x3',3],['stugots_coffee','Stugots Coffee','2x2',3],['sole_2_sole','Sole 2 Sole','2x2',3],['famished_guy','Famished Guy','3x3',6],['salted_bacon','Salted Bacon','5x4',10],['salted_fish','Salted Fish','3x5',10],['salted_kipper','Salted Kipper','1x2',2],['tampopo_ramen','Tampopo Ramen','2x2',5],['instant_ramen','Instant Ramen','2x2',2],['sugar','Sugar','2x2',3],['rice','Rice','2x2',6],['tuna','Tuna','2x2',4],['pickled_eggs','Pickled Eggs','4x5',16],['sardines','Sardines','2x2',3],['oysters','Oysters','2x2',2],['cookies','Cookies','3x3',3],['slaab_steak','Slaab Steak','2x2',3]]);
defItemsHV('mat','mat',[['hairspray','HairSpray','2x2',3]]);
/* =====================================================================================================
   REVISION 037 - WEAPON DATA. Every gun and melee weapon, keyed by ITEM ID (so the item registry stays the single source of truth).
   The old 4-slot system (Crowbar / Pistol / Shotgun / Machine Gun, shared G.ammo pool) is gone. A weapon is only usable while the
   item is physically inside the holder's inventory. Guns carry their own loaded rounds on the item instance (inst.clip) and are
   reloaded ONLY from ammo items of their own calibre in that same inventory.
   GUN fields: ammo (item id), cap (rounds in the clip), dmg (per bullet / pellet), pel (pellets per shot), cd (s between shots),
     rlN (rounds loaded per reload step) / rlT (seconds per step; rlN=cap is a magazine swap, rlN=1 loads round by round),
     spr (aim spread), acc (hit chance bonus), rng (effective range m), kick (recoil), snd (sound class), mode (label), auto (hold to fire),
     npcCd / burst (NPC fire interval and rounds per burst), grip / lhand (model hand positions in sprite coords), cellM (model metres per sprite cell)
   MELEE fields: dmg, cd, st (stamina per swing), reach (m), hit (sound class), swing (animation), swD (swing seconds),
     aggro (how close a zombie must be before an NPC walks up to it), npcCd, grip
   ===================================================================================================== */
const FIST={id:'fist',name:'Fist',type:'melee',dmg:8,cd:.4,st:5,reach:2.2,hit:'fist',swing:'punch',swD:.28,aggro:3.2,npcCd:.8};
const BASH={id:'bash',name:'Gun butt',type:'melee',dmg:9,cd:.65,st:10,reach:2.4,hit:'blunt',swing:'bash',swD:.34};
const WDEF={};
(function(){
 const ML=(id,o)=>{WDEF[id]=Object.assign({id,type:'melee',aggro:7,npcCd:1.1,grip:[.5,.8]},o)};
 ML('sickle',{dmg:24,cd:.5,st:9,reach:2.6,hit:'blade',swing:'slash',swD:.34,grip:[.19,.82]});
 ML('machete',{dmg:32,cd:.45,st:10,reach:2.8,hit:'blade',swing:'slash',swD:.32,grip:[.5,.8]});
 ML('crowbar',{dmg:36,cd:.6,st:14,reach:3.0,hit:'metal',swing:'chop',swD:.4,grip:[.46,.72]});
 ML('baseball_bat',{dmg:34,cd:.6,st:14,reach:3.1,hit:'blunt',swing:'chop',swD:.4,grip:[.5,.84]});
 ML('shovel',{dmg:34,cd:.8,st:16,reach:3.2,hit:'metal',swing:'chop',swD:.45,grip:[.5,.36]});
 ML('fire_axe',{dmg:56,cd:.95,st:20,reach:3.0,hit:'blade',swing:'chop',swD:.5,grip:[.5,.8]});
 ML('pitchfork',{dmg:38,cd:.8,st:15,reach:3.4,hit:'blade',swing:'jab',swD:.4,grip:[.5,.72]});
 ML('broadsword',{dmg:52,cd:.85,st:19,reach:3.1,hit:'blade',swing:'slash',swD:.42,grip:[.5,.8]});
 ML('katana',{dmg:48,cd:.5,st:12,reach:3.0,hit:'blade',swing:'slash',swD:.3,grip:[.5,.8]});
 const GN=(id,ammo,cap,o)=>{WDEF[id]=Object.assign({id,type:'gun',ammo,cap,rlN:cap,rlT:1.4,pel:1,spr:.006,auto:false,acc:0,rng:35,kick:.6,snd:'pistol',mode:'Semi-auto',cd:.25,npcCd:.7,burst:1,grip:[.4,.64],lhand:null,cellM:.105},o)};
 const PG={grip:[.23,.62],cellM:.13};
 // ---- pistols & revolvers (2x2 sprites) ----
 GN('beretta_9mm','ammo_9mm',15,Object.assign({dmg:24,cd:.22,rlT:1.3,snd:'pistol',npcCd:.7},PG));
 GN('desert_eagle','ammo_44',8,Object.assign({dmg:46,cd:.5,rlT:1.6,snd:'magnum',kick:1.1,npcCd:1.2,rng:40},PG));
 GN('colt_detective_special','ammo_38_fed',6,Object.assign({dmg:22,cd:.4,rlN:1,rlT:.5,snd:'revolver',kick:.6,rng:28,mode:'Revolver',npcCd:1.0},PG));
 GN('colt_new_service_revolver','ammo_38_win',6,Object.assign({dmg:27,cd:.5,rlN:1,rlT:.5,snd:'revolver',kick:.8,rng:34,mode:'Revolver',npcCd:1.1},PG));
 GN('colt_python','ammo_357',6,Object.assign({dmg:36,cd:.45,rlN:1,rlT:.5,snd:'magnum',kick:.95,rng:42,acc:.04,mode:'Revolver',npcCd:1.1},PG));
 GN('m1911a1','ammo_45',7,Object.assign({dmg:31,cd:.25,rlT:1.4,snd:'pistol',kick:.7,npcCd:.8},PG));
 GN('glock_21','ammo_45',13,Object.assign({dmg:30,cd:.2,rlT:1.4,snd:'pistol',kick:.65,npcCd:.7},PG));
 GN('glock_22','ammo_40',15,Object.assign({dmg:28,cd:.2,rlT:1.3,snd:'pistol',kick:.6,npcCd:.7},PG));
 // ---- submachine guns (automatic) ----
 GN('mac10','ammo_45',30,{dmg:21,cd:.065,auto:true,mode:'Full-auto',spr:.03,rlT:1.9,snd:'smg',rng:25,acc:-.08,kick:.35,burst:4,npcCd:1.3,grip:[.41,.64],cellM:.12});
 GN('uzi','ammo_9mm',32,{dmg:18,cd:.08,auto:true,mode:'Full-auto',spr:.026,rlT:1.8,snd:'smg',rng:28,acc:-.05,kick:.35,burst:4,npcCd:1.3,grip:[.45,.62],cellM:.12});
 GN('tommygun','ammo_45',30,{dmg:24,cd:.09,auto:true,mode:'Full-auto',spr:.028,rlT:2.2,snd:'smg',rng:30,acc:-.03,kick:.45,burst:4,npcCd:1.4,grip:[.4,.64],lhand:[.65,.62],cellM:.115});
 // ---- assault rifles (automatic) ----
 GN('ak47','ammo_762',30,{dmg:36,cd:.11,auto:true,mode:'Full-auto',spr:.02,rlT:2.4,snd:'rifle',rng:55,acc:.04,kick:.75,burst:3,npcCd:1.3,grip:[.395,.65],lhand:[.72,.57]});
 GN('m16','ammo_556',30,{dmg:30,cd:.075,auto:true,mode:'Full-auto',spr:.011,rlT:2.2,snd:'rifle',rng:70,acc:.06,kick:.5,burst:3,npcCd:1.2,grip:[.395,.65],lhand:[.72,.58]});
 GN('ar90','ammo_556',30,{dmg:31,cd:.09,auto:true,mode:'Full-auto',spr:.011,rlT:2.2,snd:'rifle',rng:70,acc:.1,kick:.5,burst:3,npcCd:1.2,grip:[.395,.65],lhand:[.72,.58]});
 GN('m4','ammo_556',30,{dmg:29,cd:.075,auto:true,mode:'Full-auto',spr:.014,rlT:2.0,snd:'rifle',rng:60,acc:.06,kick:.45,burst:3,npcCd:1.2,grip:[.395,.65],lhand:[.7,.58]});
 // ---- rifles & shotguns ----
 GN('m1_garand','ammo_762',8,{dmg:42,cd:.22,rlN:8,rlT:2.3,spr:.004,rng:80,acc:.08,kick:.9,snd:'rifle',npcCd:1.0,grip:[.395,.65],lhand:[.7,.56]});
 GN('lee_enfield','ammo_303',10,{dmg:44,cd:1.0,rlN:5,rlT:1.6,spr:.003,rng:85,acc:.1,kick:1.2,snd:'rifle',mode:'Bolt-action',npcCd:1.7,grip:[.395,.65],lhand:[.7,.56]});
 GN('model_70_safari','ammo_458',4,{dmg:95,cd:1.3,rlN:1,rlT:.9,spr:.003,rng:90,acc:.14,kick:2.0,snd:'heavy',mode:'Bolt-action',npcCd:2.0,grip:[.395,.65],lhand:[.66,.56]});
 GN('pump_shotgun','ammo_12_gauge',6,{dmg:11,pel:8,cd:.8,rlN:1,rlT:.55,spr:.05,rng:20,acc:.05,kick:1.4,snd:'shotgun',mode:'Pump-action',npcCd:1.5,grip:[.395,.65],lhand:[.72,.63]});
 GN('shotgun','ammo_12_gauge',2,{dmg:12,pel:8,cd:.35,rlN:1,rlT:.8,spr:.055,rng:18,acc:.05,kick:1.5,snd:'shotgun',mode:'Double-barrel',npcCd:1.3,grip:[.395,.65],lhand:[.7,.56]});
 GN('combat_shotgun','ammo_12_gauge',12,{dmg:11,pel:8,cd:.5,rlN:4,rlT:1.1,spr:.05,rng:22,acc:.05,kick:1.3,snd:'shotgun',mode:'Drum-fed pump',npcCd:1.3,grip:[.395,.65],lhand:[.72,.63]});
})();
for(const id in WDEF){const it=ITEMS[id],d=WDEF[id];if(!it)throw new Error('weapon def for unknown item '+id);if(d.type==='gun'&&!ITEMS[d.ammo])throw new Error('gun '+id+' uses unknown ammo '+d.ammo)}
for(const id of ITEM_ORDER){const c=ITEMS[id].cat;if((c==='melee'||c==='rifle'||c==='pistol'||c==='assault'||c==='smg')&&!WDEF[id])throw new Error('weapon item '+id+' has no weapon definition')}
const resOf=id=>{const it=ITEMS[id];return it&&it.value?Object.keys(it.value)[0]:null};

/* LOOT TABLES (weights per item id). Same table names / scavenging locations as before; every id is validated below. */
const LOOT_TABLES={
 clinic:{cotton_balls:5,antibiotics:4,gauze:5,medical_tape:4,medkit:3,painkiller:5,water_jug:1,milk:1,duct_tape:1},
 gunshop:{ammo_9mm:5,ammo_45:4,ammo_357:3,ammo_38_fed:3,ammo_38_win:2,ammo_40:3,ammo_44:2,ammo_12_gauge:5,ammo_556:3,ammo_762:3,ammo_303:2,ammo_458:1,beretta_9mm:2,glock_21:2,glock_22:2,m1911a1:2,desert_eagle:1,colt_python:1,colt_detective_special:1,colt_new_service_revolver:1,shotgun:2,pump_shotgun:1,combat_shotgun:1,model_70_safari:1,lee_enfield:1,m1_garand:1,ak47:1,m16:1,ar90:1,m4:1,mac10:1,uzi:1,tommygun:1,machete:1,katana:1,baseball_bat:1},
 gas:{colacola:3,citrol:3,popzi_soft_drink:3,sup_soft_drink:3,z_energy_drink:3,cheezholes:3,tweex:3,herkeys_jerkey:3,granola:2,fud:2,gas_can:3,gas_cylinder:2,car_battery:2,duct_tape:2,spray_paint:2,bug_spray:2,nails:2,rope:1,ammo_9mm:1},
 diner:{bacon:3,sausages:3,smoked_ham:1,salad:3,lamburger:3,pickles:2,pizan_pasta:3,calzones:3,ramen_noodles:3,milk:2,kenball_soup:3,colacola:2,popzi_soft_drink:1,pickled_herring:1,butcher_knife:1},
 hardware:{nails:5,rope:4,duct_tape:4,bungie_cord:4,spring:3,fire_hose:2,gas_can:2,gas_cylinder:2,spray_paint:3,bug_spray:2,car_battery:2,bowling_ball:1,butcher_knife:2,crowbar:3,shovel:2,fire_axe:2,pitchfork:1,sickle:2,machete:2,baseball_bat:1},
 house:{atomic_veggies:2,brans:2,calzones:1,fud:1,kenball_soup:3,pizan_pasta:2,ramen_noodles:3,granola:2,milk:2,water_jug:1,salad:1,cherry_preserves:1,peach_preserves:1,pickles:1,tweex:1,colacola:1,popzi_soft_drink:1,cheezholes:2,cotton_balls:2,gauze:2,painkiller:2,medical_tape:1,antibiotics:1,nails:2,rope:2,duct_tape:2,spray_paint:1,bug_spray:1,butcher_knife:1,spring:1,bungie_cord:1,baseball_bat:1,crowbar:1,sickle:1,beretta_9mm:1,shotgun:1,ammo_9mm:1,ammo_12_gauge:1,ammo_45:1},
 supermarket:{atomic_veggies:3,bacon:2,brans:3,calzones:2,cheezholes:3,cherry_preserves:2,citrol:3,colacola:3,fud:2,granola:3,herkeys_jerkey:3,kenball_soup:3,lamburger:2,military_rations:1,milk:3,natural_living:3,peach_preserves:2,pickled_herring:1,pickles:2,pizan_pasta:3,popzi_soft_drink:3,ramen_noodles:3,salad:2,salami:2,sausages:2,smoked_ham:1,soylent_greens:2,sup_soft_drink:3,tweex:3,water_jug:2,z_energy_drink:3,bug_spray:1,painkiller:1,cotton_balls:1},
 church:{cotton_balls:3,gauze:3,painkiller:2,medical_tape:1,granola:3,milk:2,water_jug:2,cherry_preserves:2,peach_preserves:2,pickles:1,rope:2,nails:1,baseball_bat:1,broadsword:1},
 cemetery:{shovel:4,sickle:3,rope:3,nails:2,spray_paint:2,bug_spray:2,pitchfork:2,crowbar:2,painkiller:1},
 park:{colacola:2,popzi_soft_drink:2,sup_soft_drink:2,citrol:2,tweex:2,granola:2,fud:1,herkeys_jerkey:1,baseball_bat:3,bowling_ball:1,bug_spray:2,rope:1,water_jug:1,sickle:1}
};
for(const t in LOOT_TABLES)for(const id in LOOT_TABLES[t])if(!ITEMS[id])throw new Error('loot table '+t+' has unknown item '+id);

/* =====================================================================================================
   ICON SYSTEM. Default icons are procedural (kept as the source of truth) and drawn in the item's own aspect ratio at
   32 px per grid cell (so 2x2 = 64x64, 9x1 = 32x288...). Painters work in normalised 0..1 coordinates, so any footprint is filled.
   Resolution order: custom PNG (if loaded OK) -> original procedural icon.  Artwork never touches item ids/sizes/values.
   ===================================================================================================== */
const BPX=32;
const ICON_SPEC={ // food / medical / materials / ammo: [template, main colour, accent colour, label]
 atomic_veggies:['can','#2e8b3a','#9be37a','ATOM'],bacon:['bacon'],brans:['box','#c98a2b','#f4d58a','BRANS'],calzones:['box','#b5651d','#f2c078','CALZ'],cheezholes:['bag','#f59e0b','#fde68a','CHZ'],
 cherry_preserves:['jar','#9b1c31','#e11d48','CHERRY'],citrol:['drink','#65a30d','#ecfccb','CITROL'],colacola:['drink','#7f1d1d','#ef4444','COLA'],fud:['bag','#64748b','#cbd5e1','FUD'],granola:['bag','#a16207','#fde68a','GRAN'],
 herkeys_jerkey:['bag','#7c2d12','#fb923c','JERKY'],kenball_soup:['can','#b91c1c','#fef2f2','SOUP'],lamburger:['wrap','#92400e','#fcd34d','LAMB'],military_rations:['box','#4d5d2a','#b7c77a','MRE'],milk:['carton','#f3f4f6','#60a5fa','MILK'],
 natural_living:['box','#3f8f4f','#d9f99d','NATURAL'],peach_preserves:['jar','#d97706','#fdba74','PEACH'],pickled_herring:['jar','#0e7490','#a5f3fc','HERRING'],pickles:['jar','#4d7c0f','#bef264','PICKLE'],pizan_pasta:['box','#b91c1c','#fde68a','PIZAN'],
 popzi_soft_drink:['drink','#1d4ed8','#93c5fd','POPZI'],ramen_noodles:['bag','#dc2626','#fde047','RAMEN'],salad:['tub','#22c55e','#bbf7d0','SALAD'],salami:['salami'],sausages:['sausage'],smoked_ham:['ham'],soylent_greens:['bag','#365314','#a3e635','SOY'],
 sup_soft_drink:['drink','#f97316','#fed7aa','SUP'],tweex:['bar','#92400e','#fbbf24','TWEEX'],water_jug:['jug','#3b82f6','#dbeafe','H2O'],z_energy_drink:['drink','#111827','#22d3ee','Z'],
 cotton_balls:['cotton'],antibiotics:['pills','#d97706','#fff','ABX'],gauze:['roll','#f3f4f6','#d1d5db','GAUZE'],medical_tape:['roll','#e8d8b0','#2563eb','TAPE'],medkit:['kit'],painkiller:['pills','#2563eb','#fff','PAIN'],
 bowling_ball:['ball'],bug_spray:['spray','#16a34a','#fef08a','BUG'],bungie_cord:['coil','#f97316','#111','BUNGIE'],butcher_knife:['knife'],car_battery:['battery'],duct_tape:['roll','#9ca3af','#4b5563','DUCT'],fire_hose:['coil','#dc2626','#fbbf24','HOSE'],
 gas_can:['jerry'],gas_cylinder:['tank'],nails:['nails'],rope:['coil','#c8a02c','#7a5a10','ROPE'],spray_paint:['spray','#7c3aed','#ddd6fe','PAINT'],spring:['spring'],
 ammo_303:['ammo','#7a5a2b','.303'],ammo_357:['ammo','#6b7280','.357'],ammo_38_fed:['ammo','#4b5563','.38F'],ammo_38_win:['ammo','#71717a','.38W'],ammo_40:['ammo','#1f2937','.40'],ammo_44:['ammo','#92400e','.44'],ammo_45:['ammo','#78350f','.45'],
 ammo_458:['ammo','#3f3f46','.458'],ammo_12_gauge:['shells','#b91c1c','12GA'],ammo_556:['ammo','#365314','5.56'],ammo_762:['ammo','#3f6212','7.62'],ammo_9mm:['ammo','#1e3a8a','9mm']
};
Object.assign(ICON_SPEC,{cereo:['box','#d97706','#fde68a','CEREO'],crackers:['box','#c2410c','#fde68a','CRACK'],'224_ramen':['bag','#b91c1c','#fde047','224'],apollo_meat:['meat'],potato_chips:['bag','#eab308','#fef9c3','CHIPS'],eat_flakes:['box','#0e7490','#a5f3fc','FLAKES'],
 stugots_coffee:['can','#3b2a1a','#d6b88a','JAVA'],sole_2_sole:['tin','#1e3a8a','#93c5fd','SOLE'],famished_guy:['box','#7f1d1d','#fca5a5','FAMISH'],salted_bacon:['sbacon'],salted_fish:['fish','#9aa7b5','#e5e7eb'],salted_kipper:['fish','#b8864a','#f0d9a8'],
 tampopo_ramen:['bag','#0d9488','#fde68a','TAMP'],instant_ramen:['bag','#ea580c','#fde68a','INST'],sugar:['bag','#f3f4f6','#93c5fd','SUGAR'],rice:['bag','#e5e7eb','#a16207','RICE'],tuna:['can','#1d4ed8','#bfdbfe','TUNA'],pickled_eggs:['eggs','#4d7c0f','#bef264','EGGS'],
 sardines:['tin','#b45309','#fde68a','SARD'],oysters:['can','#475569','#e2e8f0','OYST'],cookies:['box','#92400e','#fcd34d','COOKIE'],hairspray:['spray','#db2777','#fbcfe8','HAIR'],slaab_steak:['steak']});
const TPL={
 meat:(F,T,a,b,l,x,W,H)=>{x.fillStyle='#8a2a22';x.beginPath();x.ellipse(.5*W,.52*H,.4*W,.36*H,0,0,6.3);x.fill();x.fillStyle='#c0483a';x.beginPath();x.ellipse(.46*W,.46*H,.3*W,.25*H,0,0,6.3);x.fill();F('#f1e6d0',.78,.45,.18,.1);F('#f8fafc',.9,.4,.07,.2);F('#00000033',.18,.8,.6,.05);T('APOLLO','#fff',.46,.5,.11)},
 steak:(F,T,a,b,l,x,W,H)=>{x.fillStyle='#f3d7d0';x.beginPath();x.ellipse(.5*W,.5*H,.42*W,.38*H,0,0,6.3);x.fill();x.fillStyle='#b8322a';x.beginPath();x.ellipse(.5*W,.5*H,.35*W,.31*H,0,0,6.3);x.fill();x.fillStyle='#d9544a';x.beginPath();x.ellipse(.44*W,.44*H,.2*W,.17*H,0,0,6.3);x.fill();F('#f8fafc',.66,.38,.12,.1);T('SLAAB','#fff',.5,.62,.13)},
 sbacon:(F,T,a,b,l,x,W,H)=>{for(let i=0;i<7;i++){const y=.08+i*.125;F(i%2?'#b91c1c':'#f1a58f',.08,y,.84,.1);F(i%2?'#f1a58f':'#b91c1c',.08+(i%3)*.15,y+.03,.3,.04)}for(let i=0;i<22;i++)F('#ffffff',.1+((i*37)%80)/100,.08+((i*53)%85)/100,.03,.03);F('#00000044',.08,.95,.84,.03)},
 fish:(F,T,a,b,l,x,W,H)=>{const L=Math.max(W,H),S=Math.min(W,H);x.save();x.translate(W/2,H/2);if(H>W)x.rotate(Math.PI/2);
  x.fillStyle=a;x.beginPath();x.ellipse(-.06*L,0,.4*L,.3*S,0,0,6.3);x.fill();x.fillStyle=b;x.beginPath();x.ellipse(-.1*L,.08*S,.3*L,.14*S,0,0,6.3);x.fill();
  x.fillStyle=a;x.beginPath();x.moveTo(.3*L,0);x.lineTo(.48*L,-.3*S);x.lineTo(.48*L,.3*S);x.closePath();x.fill();x.fillStyle='#111';x.beginPath();x.arc(-.34*L,-.05*S,Math.max(1.5,.035*L),0,6.3);x.fill();
  x.fillStyle='#ffffffcc';for(let i=0;i<8;i++)x.fillRect((-.3+i*.07)*L,(-.16+((i*5)%4)*.08)*S,Math.max(1,.02*L),Math.max(1,.02*L));x.restore()},
 tin:(F,T,a,b,l,x,W,H)=>{F('#9aa0a6',.1,.28,.8,.52);F(a,.14,.33,.72,.42);F('#cfd3d7',.1,.28,.8,.06);F('#00000044',.1,.78,.8,.04);F('#cfd3d7',.76,.2,.14,.1);x.fillStyle=b;x.beginPath();x.ellipse(.3*W,.54*H,.14*W,.07*H,0,0,6.3);x.fill();T(l,'#fff',.62,.55,.15)},
 eggs:(F,T,a,b,l,x,W,H)=>{F('#cfe8f0',.14,.14,.72,.78);F(a,.18,.34,.64,.54);F('#d4a017',.12,.05,.76,.12);x.fillStyle='#f8f3d8';[[.32,.5],[.55,.46],[.7,.58],[.4,.68],[.62,.74],[.3,.82]].forEach(p=>{x.beginPath();x.ellipse(p[0]*W,p[1]*H,.09*W,.065*H,0,0,6.3);x.fill()});F('#f5f5f4',.2,.2,.6,.12);T(l,'#222',.5,.26,.07)},
 can:(F,T,a,b,l)=>{F('#9aa0a6',.2,.1,.6,.8);F(a,.2,.16,.6,.68);F(b,.2,.38,.6,.26);F('#cfd3d7',.2,.1,.6,.06);F('#cfd3d7',.2,.84,.6,.06);F('#ffffff55',.27,.18,.06,.62);T(l,'#111',.5,.51,.17)},
 drink:(F,T,a,b,l)=>{F('#bfc4c9',.25,.08,.5,.84);F(a,.25,.14,.5,.72);F(b,.25,.4,.5,.22);F('#e5e7eb',.3,.04,.4,.06);F('#ffffff55',.3,.16,.05,.66);T(l,'#fff',.5,.51,.15)},
 box:(F,T,a,b,l)=>{F(a,.12,.08,.76,.84);F(b,.12,.08,.76,.2);F('#00000066',.12,.86,.76,.06);F(b,.2,.36,.6,.34);T(l,'#222',.5,.53,.15)},
 bag:(F,T,a,b,l)=>{F(a,.14,.1,.72,.8);for(let i=0;i<6;i++){F(b,.14+i*.12,.06,.06,.05);F(b,.14+i*.12,.9,.06,.05)}F(b,.24,.34,.52,.3);F('#ffffff44',.18,.14,.05,.7);T(l,'#222',.5,.49,.15)},
 jar:(F,T,a,b,l)=>{F('#cfe8f0',.2,.16,.6,.76);F(a,.24,.34,.52,.54);F(b,.24,.34,.52,.06);F('#d4a017',.2,.06,.6,.12);F('#f5f5f4',.26,.5,.48,.24);T(l,'#222',.5,.62,.12)},
 jug:(F,T,a,b,l)=>{F(a,.2,.2,.6,.72);F(b,.34,.04,.32,.18);F('#e5e7eb',.38,.02,.24,.05);F(b,.78,.28,.1,.3);F('#ffffff',.26,.42,.48,.26);T(l,'#222',.5,.55,.17)},
 carton:(F,T,a,b,l)=>{F(a,.2,.28,.6,.64);F(b,.2,.28,.6,.14);F('#e5e7eb',.3,.1,.4,.2);F('#cbd5e1',.4,.04,.2,.08);T(l,'#1e3a8a',.5,.66,.16)},
 tub:(F,T,a,b,l)=>{F('#e5e7eb',.12,.3,.76,.6);F(a,.16,.2,.68,.2);F(b,.2,.14,.2,.1);F(b,.5,.12,.2,.12);F('#ffffff88',.14,.5,.72,.2);T(l,'#222',.5,.62,.15)},
 bar:(F,T,a,b,l)=>{F(a,.1,.28,.8,.44);F(b,.1,.28,.8,.1);F(b,.1,.62,.8,.1);F('#00000044',.1,.7,.8,.04);T(l,'#fff',.5,.5,.17)},
 wrap:(F,T,a,b,l)=>{F('#d4d4d8',.1,.22,.8,.56);F(a,.14,.28,.72,.44);F(b,.14,.28,.72,.08);F(b,.14,.64,.72,.08);T(l,'#fff',.5,.5,.18)},
 ham:(F,T,a,b,l,x,W,H)=>{x.fillStyle='#e6b9a6';x.beginPath();x.ellipse(.84*W,.5*H,.07*W,.07*H,0,0,6.3);x.fill();F('#f8fafc',.84,.46,.14,.08);x.fillStyle='#b4532a';x.beginPath();x.ellipse(.5*W,.5*H,.4*W,.36*H,0,0,6.3);x.fill();x.fillStyle='#d9783f';x.beginPath();x.ellipse(.46*W,.44*H,.3*W,.24*H,0,0,6.3);x.fill();F('#f2d3b8',.2,.7,.5,.07);F('#00000033',.2,.16,.55,.04);T('HAM','#fff',.46,.46,.14)},
 bacon:(F,T,a,b,l,x,W,H)=>{for(let i=0;i<7;i++){const y=.08+i*.125;F(i%2?'#b91c1c':'#f1a58f',.08,y,.84,.1);F(i%2?'#f1a58f':'#b91c1c',.08+(i%3)*.15,y+.03,.3,.04)}F('#00000044',.08,.95,.84,.03)},
 salami:(F,T,a,b,l,x,W,H)=>{x.save();x.translate(W/2,H/2);x.rotate(-.7);x.fillStyle='#7f1d1d';x.fillRect(-.5*W,-.14*H,W,.28*H);x.fillStyle='#b4533a';x.fillRect(-.5*W,-.14*H,W,.07*H);x.fillStyle='#e5e7eb';for(let i=-4;i<5;i++)x.fillRect(i*.1*W,-.14*H,.02*W,.28*H);x.fillStyle='#d6c9a0';x.fillRect(.46*W,-.14*H,.05*W,.28*H);x.restore();F('#d6c9a0',.1,.1,.03,.2)},
 sausage:(F,T,a,b,l,x,W,H)=>{for(let i=0;i<3;i++){x.fillStyle='#a8452f';x.beginPath();x.ellipse(.5*W,(.2+i*.3)*H,.3*W,.13*H,0,0,6.3);x.fill();x.fillStyle='#c9654a';x.fillRect(.3*W,(.14+i*.3)*H,.35*W,.03*H)}F('#e5e7eb',.47,.02,.06,.96)},
 cotton:(F,T,a,b,l,x,W,H)=>{F('#93c5fd',.16,.3,.68,.6);F('#dbeafe',.16,.3,.68,.08);x.fillStyle='#fff';[[.3,.2],[.5,.14],[.7,.2],[.42,.26],[.6,.28]].forEach(p=>{x.beginPath();x.arc(p[0]*W,p[1]*H,.12*W,0,6.3);x.fill()});T('COTTON','#1e3a8a',.5,.62,.13)},
 pills:(F,T,a,b,l)=>{F(a,.26,.24,.48,.68);F('#ffffff55',.3,.28,.05,.58);F('#f8fafc',.22,.1,.56,.16);F(b,.3,.44,.4,.3);T(l,'#222',.5,.59,.14)},
 roll:(F,T,a,b,l,x,W,H)=>{x.fillStyle=a;x.beginPath();x.ellipse(.5*W,.5*H,.4*W,.4*H,0,0,6.3);x.fill();x.fillStyle=b;x.beginPath();x.ellipse(.5*W,.5*H,.27*W,.27*H,0,0,6.3);x.fill();x.fillStyle='#0e0e0e';x.beginPath();x.ellipse(.5*W,.5*H,.15*W,.15*H,0,0,6.3);x.fill();T(l,'#fff',.5,.87,.11)},
 kit:(F,T)=>{F('#c0392b',.08,.16,.84,.72);F('#7f1d1d',.36,.06,.28,.1);F('#00000055',.08,.82,.84,.06);F('#fff',.42,.28,.16,.48);F('#fff',.28,.42,.44,.2);F('#9ca3af',.08,.5,.84,.03)},
 ball:(F,T,a,b,l,x,W,H)=>{x.fillStyle='#1f2a5a';x.beginPath();x.ellipse(.5*W,.5*H,.42*W,.42*H,0,0,6.3);x.fill();x.fillStyle='#3b4d9a';x.beginPath();x.ellipse(.4*W,.38*H,.14*W,.12*H,0,0,6.3);x.fill();x.fillStyle='#050510';[[.42,.46],[.56,.42],[.5,.6]].forEach(p=>{x.beginPath();x.arc(p[0]*W,p[1]*H,.05*W,0,6.3);x.fill()})},
 spray:(F,T,a,b,l)=>{F(a,.3,.3,.4,.62);F('#9aa0a6',.3,.2,.4,.12);F('#111',.4,.08,.2,.12);F('#fff',.5,.04,.14,.05);F(b,.3,.5,.4,.2);F('#ffffff44',.34,.32,.04,.58);T(l,'#111',.5,.6,.12)},
 coil:(F,T,a,b,l,x,W,H)=>{x.lineWidth=Math.max(3,.1*Math.min(W,H));x.strokeStyle=a;for(let i=0;i<3;i++){x.beginPath();x.ellipse(.5*W,.5*H,(.36-i*.09)*W,(.36-i*.09)*H,0,0,6.3);x.stroke()}x.strokeStyle=b;x.lineWidth=Math.max(2,.03*Math.min(W,H));x.beginPath();x.moveTo(.78*W,.7*H);x.lineTo(.94*W,.9*H);x.stroke();T(l,'#fff',.5,.5,.1)},
 knife:(F)=>{F('#d1d5db',.3,.04,.55,.58);F('#f9fafb',.3,.04,.12,.58);F('#6b7280',.3,.58,.55,.04);F('#3b2a1a',.4,.62,.3,.34);F('#9ca3af',.46,.7,.04,.04);F('#9ca3af',.46,.84,.04,.04)},
 battery:(F,T)=>{F('#1f2937',.06,.28,.88,.66);F('#facc15',.06,.28,.88,.1);F('#374151',.06,.7,.88,.24);F('#9ca3af',.16,.14,.14,.14);F('#9ca3af',.7,.14,.14,.14);T('+','#ef4444',.23,.5,.2);T('-','#60a5fa',.77,.5,.2);F('#e5e7eb',.3,.5,.4,.16)},
 jerry:(F,T)=>{F('#3a5a2a',.12,.14,.76,.8);F('#2a4a1a',.12,.14,.76,.1);F('#4a7a2a',.22,.34,.56,.5);F('#111',.18,.04,.2,.12);F('#111',.18,.04,.5,.05);F('#888',.6,.04,.12,.1);F('#1a2a0a',.12,.9,.76,.04);F('#facc15',.42,.5,.16,.16)},
 tank:(F,T)=>{F('#2563eb',.24,.18,.52,.78);F('#1e40af',.24,.18,.52,.08);F('#60a5fa',.3,.26,.07,.6);F('#9ca3af',.4,.08,.2,.1);F('#6b7280',.34,.02,.32,.07);F('#e5e7eb',.24,.5,.52,.14);T('GAS','#111',.5,.57,.12)},
 nails:(F,T,a,b,l,x,W,H)=>{F('#78350f',.1,.5,.8,.4);F('#92400e',.1,.5,.8,.08);for(let i=0;i<7;i++){F('#d4d4d8',.16+i*.1,.12+(i%2)*.06,.03,.46);F('#9ca3af',.14+i*.1,.1+(i%2)*.06,.07,.04)}T('NAILS','#fde68a',.5,.74,.15)},
 spring:(F,T,a,b,l,x,W,H)=>{x.strokeStyle='#cbd5e1';x.lineWidth=Math.max(2,.04*Math.min(W,H));x.beginPath();for(let i=0;i<=7;i++){const t=i/7;x.lineTo((.5+(i%2?.3:-.3))*W,(.08+t*.84)*H)}x.stroke();x.strokeStyle='#6b7280';x.lineWidth=1;x.stroke()},
 ammo:(F,T,a,l)=>{F(a,.1,.28,.8,.62);F('#00000055',.1,.84,.8,.06);F('#e5e7eb',.1,.28,.8,.1);for(let i=0;i<5;i++){F('#d4a017',.16+i*.15,.1,.1,.2);F('#f5d46a',.16+i*.15,.1,.04,.2)}T(l,'#fff',.5,.62,.2)},
 shells:(F,T,a,l)=>{F('#374151',.1,.5,.8,.4);for(let i=0;i<4;i++){F(a,.12+i*.2,.1,.14,.5);F('#d4a017',.12+i*.2,.52,.14,.1);F('#f5d46a',.12+i*.2,.1,.14,.06)}T(l,'#fff',.5,.74,.18)}
};
/* weapons: long guns, pistols, SMGs and melee tools are assembled from a few shared shapes with per-item parameters */
function gunLong(F,o){const w=o.wood||'#7a4a22',m=o.metal||'#3a4046',d='#15171a',p='#23272b',S=(o.stock==='poly'||o.stock==='fold')?p:w;
 if(o.stock==='fold'){F(m,.03,.4,.24,.05);F(m,.03,.4,.03,.26);F(p,.02,.38,.05,.3)}else if(o.stock!=='none'){F(S,.02,.4,.07,.34);F(S,.07,.42,.26,.2);F(S,.18,.5,.15,.1)}
 F(m,.3,.38,.3,.2);F(d,.3,.38,.3,.03);F(d,.52,.42,.05,.06);F(d,.44,.58,.05,.1);F(o.pg?p:w,.36,.58,.07,.2);
 if(o.hg==='wood')F(w,.6,.4,.24,.17);else if(o.hg==='poly')F(p,.6,.39,.26,.19);
 F(m,.6,.44,.38,.06);if(o.dbl)F(m,.6,.5,.38,.06);F(d,.95,.4,.04,.14);if(o.carry)F(m,.34,.3,.16,.08);
 if(o.scope){F(d,.32,.2,.32,.08);F(m,.37,.28,.03,.1);F(m,.56,.28,.03,.1);F('#5ab6d8',.64,.2,.02,.08)}
 if(o.pump)F(w,.62,.55,.2,.1);
 if(o.mag==='box')F(d,.46,.58,.08,.3);else if(o.mag==='curve'){F(d,.46,.58,.08,.18);F(d,.5,.74,.08,.14);F(d,.54,.84,.06,.06)}else if(o.mag==='drum'){F(d,.44,.58,.16,.3);F('#444',.47,.64,.1,.04)}else if(o.mag==='tube')F(m,.58,.53,.36,.05)}
function gunSmg(F,o){const m='#3a4046',d='#15171a',p='#23272b',w='#7a4a22';
 if(o.id==='tommygun'){F(w,.02,.4,.3,.22);F(w,.06,.44,.1,.2);F(m,.3,.36,.34,.2);F(d,.3,.36,.34,.03);F(w,.36,.56,.07,.2);F(d,.42,.54,.14,.32);F('#555',.45,.6,.08,.04);F(w,.62,.5,.06,.22);F(m,.64,.4,.34,.07);for(let i=0;i<4;i++)F(d,.68+i*.06,.38,.025,.12)}
 else if(o.id==='uzi'){F(m,.1,.24,.62,.3);F(d,.1,.24,.62,.05);F(d,.7,.3,.22,.08);F(p,.38,.54,.14,.36);F(m,.04,.3,.08,.04);F(m,.04,.3,.03,.24);F('#888',.2,.3,.2,.04);F(d,.5,.5,.04,.08)}
 else{F(m,.14,.28,.6,.28);F(d,.14,.28,.6,.05);F(d,.72,.34,.2,.07);F(p,.34,.56,.14,.34);F(m,.04,.34,.1,.03);F(m,.04,.34,.03,.22);F('#888',.22,.34,.28,.04)}}
function gunPistol(F,o){const m=o.col||'#3a4046',g=o.grip||'#222',d='#111',T=o.T;
 if(o.rev){F(m,.14,.3,.2,.16);F(g,.12,.44,.22,.4);F(m,.34,.3,.16,.24);F(d,.34,.38,.16,.02);F(m,.48,.34,o.long?.44:.28,.08);F(d,.48,.34,o.long?.44:.28,.02);if(o.long)F(m,.48,.42,.4,.04);F(m,.4,.5,.04,.1);F(d,.34,.5,.1,.04);F(m,.12,.26,.06,.06)}
 else{F(m,.12,.26,.72,o.big?.26:.2);F(d,.12,.26,.72,.03);F(m,.82,.3,.1,.12);F(g,.12,.46,.22,.42);F(m,.3,.5,.36,.05);F(d,.4,.55,.06,.1);if(o.big)F('#ffffff33',.2,.3,.5,.04);if(o.lab)T(o.lab,'#aaa',.55,.4,.12)}}
function meleePaint(id,F,x,W,H){const wd='#7a4a22',st='#cfd5da',dk='#6b7280',red='#a31212';
 if(id==='machete'){F(st,.25,.04,.5,.6);F('#fff',.25,.04,.1,.6);F(dk,.25,.6,.5,.04);F('#222',.3,.64,.4,.3)}
 else if(id==='baseball_bat'){F('#c89a5a',.3,.04,.4,.22);F('#c89a5a',.34,.26,.32,.3);F('#c89a5a',.4,.56,.2,.3);F('#8a5a2a',.4,.86,.2,.08);F('#8a5a2a',.34,.94,.32,.04);F('#fff5',.34,.06,.06,.7)}
 else if(id==='katana'){F('#e5e7eb',.38,.02,.24,.62);F('#fff',.38,.02,.07,.6);F('#d4a017',.2,.64,.6,.04);F('#111',.4,.68,.2,.26);F('#b91c1c',.4,.74,.2,.03);F('#b91c1c',.4,.82,.2,.03);F('#d4a017',.36,.94,.28,.04)}
 else if(id==='broadsword'){F(st,.32,.02,.36,.6);F('#fff',.32,.02,.08,.6);F('#9ca3af',.46,.06,.04,.5);F('#d4a017',.08,.62,.84,.06);F('#b8860b',.08,.68,.84,.02);F('#3b2a1a',.42,.7,.16,.2);F('#d4a017',.38,.9,.24,.07)}
 else if(id==='shovel'){F(wd,.46,.1,.08,.55);F(wd,.3,.06,.4,.05);F(wd,.3,.06,.06,.12);F(wd,.64,.06,.06,.12);F('#9ca3af',.25,.62,.5,.32);F('#cbd5e1',.25,.62,.5,.05);F(dk,.46,.62,.08,.1);F('#00000033',.25,.9,.5,.04)}
 else if(id==='pitchfork'){F(wd,.47,.3,.06,.68);F('#9ca3af',.25,.26,.5,.05);F('#9ca3af',.25,.02,.06,.26);F('#9ca3af',.47,.0,.06,.28);F('#9ca3af',.69,.02,.06,.26);F('#d1d5db',.25,.02,.02,.2)}
 else if(id==='fire_axe'){F(wd,.46,.04,.08,.92);F(red,.1,.06,.36,.2);F('#cbd5e1',.04,.04,.12,.26);F('#9ca3af',.54,.1,.1,.1);F('#9ca3af',.54,.06,.3,.04);F(red,.54,.06,.2,.04);F('#3b2a1a',.44,.8,.12,.16);F('#fff4',.1,.08,.3,.03)}
 else if(id==='crowbar'){F('#a31212',.4,.14,.12,.82);F('#c22',.4,.14,.04,.82);F('#a31212',.18,.08,.3,.1);F('#a31212',.14,.04,.1,.18);F('#7a0b0b',.14,.04,.1,.04);F('#a31212',.52,.9,.16,.06);F('#7a0b0b',.4,.94,.12,.04)}
 else if(id==='sickle'){x.strokeStyle='#d1d5db';x.lineWidth=Math.max(3,.1*W);x.beginPath();x.arc(.5*W,.55*H,.32*W,Math.PI*1.1,Math.PI*2.2);x.stroke();x.strokeStyle='#fff';x.lineWidth=1;x.stroke();F(wd,.1,.7,.16,.26);F('#3b2a1a',.08,.9,.2,.06)}
 else F('#888',.4,.1,.2,.8)}
const GUNS={combat_shotgun:['L',{stock:'poly',hg:'poly',mag:'drum',pump:1,pg:1}],model_70_safari:['L',{stock:'wood',hg:'none',mag:'none',scope:1}],lee_enfield:['L',{stock:'wood',hg:'wood',mag:'box'}],pump_shotgun:['L',{stock:'wood',mag:'tube',pump:1}],m1_garand:['L',{stock:'wood',hg:'wood',mag:'none',carry:0}],shotgun:['L',{stock:'wood',dbl:1,hg:'wood'}],
 ak47:['L',{stock:'wood',hg:'wood',mag:'curve',pg:0}],m16:['L',{stock:'poly',hg:'poly',mag:'box',carry:1,pg:1}],ar90:['L',{stock:'poly',hg:'poly',mag:'box',scope:1,pg:1}],m4:['L',{stock:'fold',hg:'poly',mag:'box',carry:1,pg:1}],
 mac10:['S',{id:'mac10'}],uzi:['S',{id:'uzi'}],tommygun:['S',{id:'tommygun'}],
 beretta_9mm:['P',{col:'#2c3036',grip:'#4a3a2a'}],desert_eagle:['P',{col:'#9aa1a8',grip:'#222',big:1}],colt_detective_special:['P',{rev:1,col:'#5b6168',grip:'#5a3a1a'}],colt_new_service_revolver:['P',{rev:1,long:1,col:'#33383d',grip:'#6a4a2a'}],colt_python:['P',{rev:1,long:1,col:'#b5bbc1',grip:'#2a2a2a'}],m1911a1:['P',{col:'#464c52',grip:'#3a2a1a'}],glock_21:['P',{col:'#1c1f22',grip:'#1c1f22',big:1,lab:'21'}],glock_22:['P',{col:'#2a2d31',grip:'#2a2d31',lab:'22'}]};
const DEFC={};
function defaultIcon(id){if(DEFC[id])return DEFC[id];const it=ITEMS[id];if(!it)return null;const W=it.size[0]*BPX,H=it.size[1]*BPX,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 x.fillStyle='#0e0e0e';x.fillRect(0,0,W,H);
 const F=(col,a,b,w,h)=>{x.fillStyle=col;const X=Math.round(a*W),Y=Math.round(b*H);x.fillRect(X,Y,Math.max(1,Math.round((a+w)*W)-X),Math.max(1,Math.round((b+h)*H)-Y))};
 const T=(t,col,cx,cy,sz)=>{x.fillStyle=col;x.font='bold '+Math.max(7,Math.round(sz*Math.min(W,H)*1.15))+'px monospace';x.textAlign='center';x.textBaseline='middle';x.fillText(t,cx*W,cy*H)};
 try{const g=GUNS[id],sp=ICON_SPEC[id];
  if(g){if(g[0]==='L')gunLong(F,g[1]);else if(g[0]==='S')gunSmg(F,Object.assign({T},g[1]));else gunPistol(F,Object.assign({T},g[1]))}
  else if(it.cat==='melee')meleePaint(id,F,x,W,H);
  else if(sp){const f=TPL[sp[0]];if(sp[0]==='ammo'||sp[0]==='shells')f(F,T,sp[1],sp[2]);else f(F,T,sp[1],sp[2],sp[3],x,W,H)}
  else F('#666',.3,.3,.4,.4)}catch(e){x.fillStyle='#666';x.fillRect(W*.3,H*.3,W*.4,H*.4)}
 x.strokeStyle='#222';x.lineWidth=2;x.strokeRect(1,1,W-2,H-2);DEFC[id]=c;return c}

/* custom PNG overrides (decoded ONCE and cached in ICU; nothing is re-decoded on redraw) */
const ICU={};let icoVer=0,icoPersistOK=true;
function customSrc(id){const u=ICU[id];return u&&u.img?u.img:null}
function hasCustom(id){return !!customSrc(id)}
function paintIcon(x,img,pw,ph,rot,custom){x.imageSmoothingEnabled=!!custom;if(custom)x.imageSmoothingQuality='high';
 const draw=(w,h)=>{ // images are authored upright (as exported); closely-matching aspect ratios fill the footprint, others are letterboxed, never distorted badly
  const ia=img.width/img.height,ta=w/h;let dw=w,dh=h;if(custom&&Math.abs(ia/ta-1)>.2){if(ia>ta)dh=w/ia;else dw=h*ia}x.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh)};
 if(!rot){draw(pw,ph)}else{x.save();x.translate(pw/2,ph/2);x.rotate(Math.PI/2);x.translate(-ph/2,-pw/2);draw(ph,pw);x.restore()}}
/* THE icon resolver: every inventory screen asks this. pw/ph = pixel size of the occupied footprint AFTER rotation. forceDefault ignores overrides (used by export). */
function iconCanvas(id,pw,ph,rot,forceDefault){pw=Math.max(1,Math.round(pw));ph=Math.max(1,Math.round(ph));const c=document.createElement('canvas');c.width=pw;c.height=ph;const x=c.getContext('2d');
 const cs=forceDefault?null:customSrc(id);try{paintIcon(x,cs||defaultIcon(id),pw,ph,rot,!!cs)}catch(e){if(cs){try{x.clearRect(0,0,pw,ph);paintIcon(x,defaultIcon(id),pw,ph,rot,false)}catch(e2){}}}return c}
function drawIcon(id,size){const it=ITEMS[id]||{size:[1,1]},k=size/Math.max(it.size[0],it.size[1]);return iconCanvas(id,it.size[0]*k,it.size[1]*k,false)} // legacy signature kept

/* ZIP (store only) so all default icons can be exported in one download */
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u){let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
function makeZip(files){const enc=new TextEncoder(),parts=[],cd=[];let off=0;
 files.forEach(f=>{const nm=enc.encode(f.name),crc=crc32(f.data),sz=f.data.length,lh=new DataView(new ArrayBuffer(30));
  lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(12,0x21,true);lh.setUint32(14,crc,true);lh.setUint32(18,sz,true);lh.setUint32(22,sz,true);lh.setUint16(26,nm.length,true);parts.push(new Uint8Array(lh.buffer),nm,f.data);
  const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(14,0x21,true);ch.setUint32(16,crc,true);ch.setUint32(20,sz,true);ch.setUint32(24,sz,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);cd.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+sz});
 const cds=cd.reduce((a,b)=>a+b.length,0),end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cds,true);end.setUint32(16,off,true);
 return new Blob([...parts,...cd,new Uint8Array(end.buffer)],{type:'application/zip'})}
function saveBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
async function exportDefaultIcons(){icoMsg('Exporting '+ITEM_ORDER.length+' original icons...');try{
  const files=[];for(const id of ITEM_ORDER){const c=defaultIcon(id),b=await new Promise(r=>c.toBlob(r,'image/png'));if(!b)throw new Error('could not encode '+id);files.push({name:id+'.png',data:new Uint8Array(await b.arrayBuffer())})}
  saveBlob(makeZip(files),'default_icons.zip');icoMsg('Exported '+files.length+' original default icons to default_icons.zip (one PNG per item ID, 32 px per grid cell). Custom overrides were NOT used.',1)}catch(e){icoMsg('Export failed: '+(e&&e.message||e),0,1)}}

/* IndexedDB persistence (best effort: the game works fine if this is unavailable) */
function idbOpen(){return new Promise((res,rej)=>{try{const r=indexedDB.open('gf_icons',1);r.onupgradeneeded=()=>r.result.createObjectStore('i');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function idbDo(mode,fn){const d=await idbOpen();return new Promise((res,rej)=>{const t=d.transaction('i',mode),s=t.objectStore('i'),r=fn(s);t.oncomplete=()=>{d.close();res(r&&r.result)};t.onerror=t.onabort=()=>{d.close();rej(t.error)}})}
const idbPut=(k,v)=>idbDo('readwrite',s=>s.put(v,k)),idbDel=k=>idbDo('readwrite',s=>s.delete(k)),idbClear=()=>idbDo('readwrite',s=>s.clear());
async function decodePng(buf){const blob=new Blob([buf],{type:'image/png'});
 if(window.createImageBitmap){try{return await createImageBitmap(blob)}catch(e){}}
 return await new Promise((res,rej)=>{const im=new Image(),u=URL.createObjectURL(blob);im.onload=()=>{URL.revokeObjectURL(u);res(im)};im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('decode failed'))};im.src=u})}
const PNGSIG=[137,80,78,71,13,10,26,10];
async function importIcons(files){const ok=[],bad=[];
 for(const f of files){const nm=f.name||'(unnamed)';try{
   if(!/\.png$/i.test(nm)){bad.push(nm+': not a .png file');continue}
   const base=nm.replace(/\.png$/i,''),id=ITEMS[base]?base:(ITEMS[base.toLowerCase()]?base.toLowerCase():null);
   if(!id){bad.push(nm+': no item has the ID "'+base+'" (use the internal ID, e.g. smoked_ham.png)');continue}
   if(f.size>6*1024*1024){bad.push(nm+': file is larger than 6 MB');continue}
   const buf=await f.arrayBuffer(),u=new Uint8Array(buf);
   if(u.length<8||PNGSIG.some((b,i)=>u[i]!==b)){bad.push(nm+': not a valid PNG (bad file signature)');continue}
   const img=await decodePng(buf);if(!img||!img.width||!img.height||img.width>4096||img.height>4096){bad.push(nm+': unreadable image or larger than 4096 px');continue}
   const old=ICU[id];ICU[id]={img,w:img.width,h:img.height};if(old&&old.img&&old.img.close)try{old.img.close()}catch(e){}
   ok.push(id);idbPut(id,buf).catch(()=>{icoPersistOK=false})}catch(e){bad.push(nm+': '+(e&&e.message?e.message:'could not be read'))}}
 icoVer++;iconsChanged();icoMsg((ok.length?'Imported '+ok.length+' icon(s): '+ok.join(', ')+'. ':'')+(bad.length?'<br><span class="r">Skipped '+bad.length+':<br>'+bad.map(s=>s.replace(/</g,'&lt;')).join('<br>')+'</span>':'')+(ok.length&&!icoPersistOK?'<br><span class="o">Could not save to browser storage - these icons last until you reload.</span>':''),ok.length>0,bad.length>0&&!ok.length)}
function removeCustomIcon(id){const u=ICU[id];if(u&&u.img&&u.img.close)try{u.img.close()}catch(e){}delete ICU[id];idbDel(id).catch(()=>{});icoVer++;iconsChanged();icoMsg('Restored the default icon for '+ITEMS[id].name+'.',1)}
function clearAllIcons(){const n=Object.keys(ICU).length;if(!n){icoMsg('There are no custom icons to clear.');return}if(!confirm('Remove all '+n+' custom icons and restore every default icon?'))return;for(const id in ICU){const u=ICU[id];if(u&&u.img&&u.img.close)try{u.img.close()}catch(e){}delete ICU[id]}idbClear().catch(()=>{});icoVer++;iconsChanged();icoMsg('Cleared '+n+' custom icon(s). All default icons restored.',1)}
async function loadSavedIcons(){try{const d=await idbOpen();const all=await new Promise((res,rej)=>{const out=[],q=d.transaction('i','readonly').objectStore('i').openCursor();q.onsuccess=()=>{const c=q.result;if(c){out.push([c.key,c.value]);c.continue()}else res(out)};q.onerror=()=>rej(q.error)});d.close();
  for(const [id,buf] of all){if(!ITEMS[id])continue;try{const img=await decodePng(buf);if(img&&img.width)ICU[id]={img,w:img.width,h:img.height}}catch(e){idbDel(id).catch(()=>{})}}
  if(Object.keys(ICU).length){icoVer++;iconsChanged()}}catch(e){icoPersistOK=false}}
function icoMsg(h,good,err){const e=document.getElementById('icoMsg');if(e){e.innerHTML=h;e.style.color=err?'#ef4444':good?'#22c55e':'#aaa'}}
function iconsChanged(){if(typeof invOpen!=='undefined'&&invOpen&&$('invScr'))renderInv();icoList()}
function icoList(){const L=document.getElementById('icoList');if(!L)return;const n=Object.keys(ICU).length;document.getElementById('icoCount').textContent=n+' of '+ITEM_ORDER.length+' items have a custom icon';
 L.innerHTML='';let last='';ITEM_ORDER.forEach(id=>{const it=ITEMS[id];if(it.cat!==last){last=it.cat;const h=document.createElement('div');h.className='y';h.style.cssText='margin:8px 0 2px;font:700 14px Impact,sans-serif;letter-spacing:1px';h.textContent=CATS[it.cat].toUpperCase();L.appendChild(h)}
  const r=document.createElement('div');r.className='icoRow';const th=iconCanvas(id,Math.max(12,it.size[0]*Math.min(34,92/Math.max(it.size[0],it.size[1]))),Math.max(12,it.size[1]*Math.min(34,92/Math.max(it.size[0],it.size[1]))),false);th.style.cssText='flex:0 0 auto;border:1px solid #333';
  const tw=document.createElement('div');tw.style.cssText='flex:0 0 100px;display:flex;justify-content:center';tw.appendChild(th);r.appendChild(tw);
  const t=document.createElement('div');t.style.cssText='flex:1;min-width:0';t.innerHTML='<b>'+it.name.replace(/</g,'&lt;')+'</b> <span class="m">'+it.vh[0]+'x'+it.vh[1]+'</span><br><span class="m" style="font-size:11px">'+id+'.png</span>';r.appendChild(t);
  const s=document.createElement('div');s.style.cssText='flex:0 0 auto;text-align:right';if(hasCustom(id)){s.innerHTML='<span class="g">CUSTOM</span> ';const b=document.createElement('button');b.textContent='Remove';b.onclick=()=>removeCustomIcon(id);s.appendChild(b)}else s.innerHTML='<span class="m">default</span>';r.appendChild(s);L.appendChild(r)})}

/* =====================================================================================================
   INVENTORY MODEL (one implementation for Player, Survivor, Container, Drop box and Fort HQ).
   inv = {w,h,minH,items:[inst],g:[rows of inst|null],grow?}. inst = {uid,id,x,y,rot,rem}. No stacking: one instance = one object.
   ===================================================================================================== */
let uidCounter=1;
function newInst(id){const it=ITEMS[id];if(!it)return null;const k=resOf(id);const o={uid:uidCounter++,id,x:0,y:0,rot:false,rem:k?it.value[k]:0};if(WDEF[id]&&WDEF[id].type==='gun')o.clip=WDEF[id].cap;return o}
function makeGrid(w,h){const g=[];for(let y=0;y<h;y++)g.push(new Array(w).fill(null));return g}
function newInv(w,h,o){return Object.assign({w,h,minH:h,items:[],g:makeGrid(w,h)},o||{})}
function fp(inst,rot){const s=ITEMS[inst.id].size;return(rot===undefined?inst.rot:rot)?[s[1],s[0]]:[s[0],s[1]]}
function invGrow(inv,n){while(inv.g.length<n)inv.g.push(new Array(inv.w).fill(null));if(inv.h<n)inv.h=n}
function invFits(inv,inst,x,y,rot){const [tw,th]=fp(inst,rot);if(x<0||y<0||x+tw>inv.w)return false;if(!inv.grow&&y+th>inv.h)return false;
 for(let dy=0;dy<th;dy++){const r=inv.g[y+dy];if(!r)continue;for(let dx=0;dx<tw;dx++){const c=r[x+dx];if(c&&c!==inst)return false}}return true}
function invPut(inv,inst,x,y,rot){inst.x=x;inst.y=y;inst.rot=!!rot;const [tw,th]=fp(inst);if(inv.grow)invGrow(inv,y+th);
 for(let dy=0;dy<th;dy++)for(let dx=0;dx<tw;dx++)inv.g[y+dy][x+dx]=inst;if(!inv.items.includes(inst))inv.items.push(inst)}
function invLift(inv,inst){const [tw,th]=fp(inst);for(let dy=0;dy<th;dy++){const r=inv.g[inst.y+dy];if(!r)continue;for(let dx=0;dx<tw;dx++)if(r[inst.x+dx]===inst)r[inst.x+dx]=null}}
function invTrim(inv){if(!inv.grow)return;let b=0;inv.items.forEach(q=>{b=Math.max(b,q.y+fp(q)[1])});const H=Math.max(inv.minH,b);inv.h=H;inv.g.length=H;while(inv.g.length<H)inv.g.push(new Array(inv.w).fill(null))}
function invRemove(inv,inst){invLift(inv,inst);const i=inv.items.indexOf(inst);if(i>=0)inv.items.splice(i,1);invTrim(inv);return inst}
// first free spot (unrotated first, then rotated, like the old findFit); the HQ inventory always has room because it grows downward
function invFind(inv,inst){for(const r of [false,true]){const [tw,th]=fp(inst,r);for(let y=0;y+th<=inv.h;y++)for(let x=0;x+tw<=inv.w;x++)if(invFits(inv,inst,x,y,r))return{x,y,rot:r}}
 if(inv.grow)return{x:0,y:inv.h,rot:false};return null}
function invAdd(inv,inst){const f=invFind(inv,inst);if(!f)return false;invPut(inv,inst,f.x,f.y,f.rot);return true}
// move an item between inventories safely: if the destination has no room the item stays exactly where it was
function invTransfer(src,dst,inst){const ox=inst.x,oy=inst.y,or=inst.rot;invRemove(src,inst);if(invAdd(dst,inst))return true;invPut(src,inst,ox,oy,or);return false}
function invMove(src,dst,inst,x,y,rot){if(src===dst){const ox=inst.x,oy=inst.y,or=inst.rot;invLift(src,inst);if(invFits(dst,inst,x,y,rot)){invPut(dst,inst,x,y,rot);invTrim(dst);return true}invPut(src,inst,ox,oy,or);return false}
 if(!invFits(dst,inst,x,y,rot))return false;invRemove(src,inst);invPut(dst,inst,x,y,rot);return true}
/* resources: ALWAYS derived from the remaining value of the items currently in an inventory */
function resTotals(inv){const t={food:0,meds:0,mat:0,ammo:0};inv.items.forEach(q=>{const k=resOf(q.id);if(k)t[k]+=Math.max(0,q.rem)});return t}
function resTotal(inv,k){return resTotals(inv)[k]}
function resConsume(inv,k,amt){let need=Math.max(0,amt),taken=0;const l=inv.items.filter(q=>resOf(q.id)===k&&q.rem>0).sort((a,b)=>a.rem-b.rem||a.uid-b.uid);
 for(const q of l){if(need<=0)break;const t=Math.min(q.rem,need);q.rem-=t;need-=t;taken+=t}
 inv.items.filter(q=>resOf(q.id)&&q.rem<=0).forEach(q=>invRemove(inv,q));return taken}
// new supplies (scavenger income etc.) are created as real items; partial values are allowed
function resGrant(inv,k,amt){const pool=ITEM_ORDER.filter(id=>resOf(id)===k);let left=Math.round(amt),guard=0;
 while(left>0&&guard++<300){const fit=pool.filter(id=>ITEMS[id].value[k]<=left),id=fit.length?fit[ri(0,fit.length-1)]:pool[ri(0,pool.length-1)],q=newInst(id);q.rem=Math.min(q.rem,left);left-=q.rem;if(!invAdd(inv,q))break}}
const HQINV=newInv(16,16,{grow:true}),PINV=newInv(16,16);


const G={day:0,mode:'TITLE',time:8,fort:'police',hp:100,maxHp:100,st:100,eq:null,kills:0,skill:3,
bars:[],spikes:[],surv:[],                                                                    // v067: Sgt. Miller and Dr. Aris are now in the survivor pool
sens:1,fov:75,siegeToSpawn:0,spawnT:0,guardT:0,siegeDue:false,noise:0,cdS:0,cdM:0,rescued:0,rl:0,vy:0,kick:0,swT:0,swD:.3,swK:'punch',draw:0,rlT:1,flashT:0,dry:0,ads:0,zoom:0,zoomK:1,
torchOn:false,eyeH:1.6,eyeUsed:1.6,crouch:false,
};
// Fort HQ resources are NOT stored anywhere: G.food/G.mat/G.meds read the items in the HQ inventory, and writes consume or create real items
for(const k of ['food','mat','meds'])Object.defineProperty(G,k,{enumerable:true,configurable:true,get(){return resTotal(HQINV,k)},set(v){const cur=resTotal(HQINV,k);v=Math.max(0,Math.round(v));if(v<cur)resConsume(HQINV,k,cur-v);else if(v>cur)resGrant(HQINV,k,v-cur)}});

const FORT=new THREE.Vector3(0,0,-70),TRUCK=new THREE.Vector3(0,0,15);
const BOUND_X=180,BOUND_Z_MIN=-180,BOUND_Z_MAX=130;
let scene,camera,renderer,clock,dirL,ambL,torchL,pl,ray,yaw=0,pitch=0,locked=false,zombies=[],solids=new SolidList(),walkables=[],smesh=[],K={},AC,lookT=0,fbT,streetLights=[];
const C0=new THREE.Vector2(0,0),TB=new THREE.Box3(),playing=()=>['CLEAR','EXPEDITION','FORT_BUILD','SIEGE','DEV'].includes(G.mode);

function beep(t,a,b,d,v){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime;o.type=t;o.frequency.setValueAtTime(a,n);o.frequency.exponentialRampToValueAtTime(b,n+d);g.gain.setValueAtTime(v,n);g.gain.exponentialRampToValueAtTime(.01,n+d);o.connect(g);g.connect(SFX||AC.destination);o.start();o.stop(n+d)}
function toast(m){const d=document.createElement('div');d.textContent=m;$('tw').appendChild(d);setTimeout(()=>d.remove(),3500)}
let scrNow='title',optFrom='menu';
function ui(id){['title','menu','opt','sel','hq','pz','end','dev'].forEach(i=>$(i).classList.toggle('hide',i!==id));if(id)scrNow=id;clkVis()}
const scrVis=n=>!$(n).classList.contains('hide');
// clock / siege text is hidden on the title, main menu, fort select, menu-Options and Developer Toolkit screens
function clkVis(){const b=$('clkBox');if(b)b.classList.toggle('hide',scrVis('hq')||scrVis('title')||scrVis('menu')||scrVis('sel')||(scrVis('opt')&&optFrom==='menu'))}
// the world only freezes inside the plain pause menu (and Options opened from it, and the Dev panel)
function frozen(){return scrVis('pz')||(scrVis('opt')&&(optFrom==='pz'||optFrom==='dev'))||scrVis('dev')}
// Fort HQ opened with Esc at the fort: the game keeps running behind it
function hqShown(){return !!G.hqPause&&(scrVis('hq')||(scrVis('opt')&&optFrom==='hq'))}
function inHQ(){return G.mode==='HQ_MENU'||(!!G.hqPause&&scrVis('hq'))}
function titleAny(){if(scrNow!=='title')return;if(window.MFZLOAD&&!MFZLOAD.ready)return;S.ui();ui('menu');if(window.MFZLOAD)MFZLOAD.passTitle()}   /* v075: not until the loading bar is done; then the menu town + music start */
function newGame(){S.ui();ui('sel')}
function openOptions(from){optFrom=from;$('optDev').classList.toggle('hide',from!=='menu');ui('opt');optTab(null)}
function optTab(t){$('optMain').classList.toggle('hide',!!t);$('optV').classList.toggle('hide',t!=='V');$('optS').classList.toggle('hide',t!=='S');$('optI').classList.toggle('hide',t!=='I');$('optK').classList.toggle('hide',t!=='K');if(t==='I')icoList();if(t==='K')kbRender()}
function optBack(){if($('optMain').classList.contains('hide'))optTab(null);else ui(optFrom)}
function setQuality(q){G.q=q;if(renderer){renderer.setPixelRatio(PERF.prFor(q));renderer.setSize(innerWidth,innerHeight)}document.querySelectorAll('.qb').forEach(b=>b.classList.toggle('on',+b.dataset.q===q));saveSet()}
function saveSet(){try{localStorage.setItem('gf_set',JSON.stringify({ms:MSV,mv:MV,av:AV,sens:G.sens,fov:G.fov,q:G.q}))}catch(e){}}
function lock(){initAudio();try{const r=renderer.domElement.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}   /* v075: a lock without a key press / click just fails quietly (the loading screen asks for the key) */

// ===== AUDIO (all procedural WebAudio) =====
const PI=Math.PI;let SFX,MUS,MASTER,NB,MV=.6,MSV=1,AV=1,musMode='',amb={},aT={g:0,b:2,v:6,x:20,m:1,sil:0,ss:30},hov=null;
function initAudio(){if(AC){if(AC.state==='suspended')AC.resume();return}
 AC=new(window.AudioContext||window.webkitAudioContext)();MASTER=AC.createGain();MASTER.gain.value=MSV;MASTER.connect(AC.destination);SFX=AC.createGain();SFX.gain.value=.8;SFX.connect(MASTER);MUS=AC.createGain();MUS.gain.value=MV;MUS.connect(MASTER);
 NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();s.buffer=NB;s.loop=true;f.type='bandpass';f.Q.value=.7;f.frequency.value=450;g.gain.value=0;l.frequency.value=.12;lg.gain.value=260;l.connect(lg);lg.connect(f.frequency);s.connect(f);f.connect(g);g.connect(SFX);s.start();l.start();amb.wind=g;
 const lf=AC.createBiquadFilter(),dg=AC.createGain(),l2=AC.createOscillator(),lg2=AC.createGain();lf.type='lowpass';lf.frequency.value=240;lf.Q.value=5;dg.gain.value=0;lf.connect(dg);dg.connect(MUS);l2.frequency.value=.06;lg2.gain.value=140;l2.connect(lg2);lg2.connect(lf.frequency);l2.start();
 for(const[t,fr,v]of[['sawtooth',55,.16],['sawtooth',55.6,.14],['sine',58.3,.2],['sine',82.4,.1],['sawtooth',110.8,.05]]){const o=AC.createOscillator(),og=AC.createGain();o.type=t;o.frequency.value=fr;og.gain.value=v;o.connect(og);og.connect(lf);o.start()}
 amb.dg=dg;amb.lf=lf}
function out(p,mx=40){if(!AC)return null;if(!p)return SFX;const dx=p.x-pl.position.x,dz=p.z-pl.position.z,d=Math.hypot(dx,dz);if(d>mx)return null;const g=AC.createGain();g.gain.value=Math.pow(1-d/mx,1.5);if(AC.createStereoPanner){const s=AC.createStereoPanner();s.pan.value=Math.max(-1,Math.min(1,(dx*Math.cos(yaw)-dz*Math.sin(yaw))/(d||1)));g.connect(s);s.connect(SFX)}else g.connect(SFX);return g}
function T(o,type,f0,f1,dur,vol,del=0,att=.005){if(!o)return;const t=AC.currentTime+del,s=AC.createOscillator(),g=AC.createGain();s.type=type;s.frequency.setValueAtTime(f0,t);s.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(g);g.connect(o);s.start(t);s.stop(t+dur+.05)}
function N(o,ft,f0,f1,q,dur,vol,del=0){if(!o)return;const t=AC.currentTime+del,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;s.loop=true;f.type=ft;f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(o);s.start(t,Math.random());s.stop(t+dur+.05)}
function V(o,f0,f1,dur,vol,fm,del=0,rough=1){if(!o)return;const t=AC.currentTime+del,s=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();s.type='sawtooth';s.frequency.setValueAtTime(f0,t);s.frequency.linearRampToValueAtTime(f1,t+dur);l.frequency.value=rnd(5,9);lg.gain.value=f0*.05*rough;l.connect(lg);lg.connect(s.frequency);f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(fm[0],t);f.frequency.linearRampToValueAtTime(fm[1],t+dur);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+dur*.25);g.gain.linearRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(o);s.start(t);l.start(t);s.stop(t+dur+.05);l.stop(t+dur+.05)}
const S={
 groan(p){if(!AC||AC.currentTime<aT.g)return;const o=out(p,35);if(!o)return;aT.g=AC.currentTime+.3;const f=rnd(70,120);V(o,f,f*rnd(.55,.9),rnd(1,1.9),.5,[rnd(300,500),rnd(450,750)],0,1);N(o,'bandpass',500,300,2,1.2,.05)},
 snarl(p){const o=out(p,30),f=rnd(110,160);V(o,f,f*.7,.45,.6,[700,1100],0,3);N(o,'bandpass',900,500,3,.4,.15)},
 lost(p){V(out(p,35),rnd(120,150),55,2.2,.5,[650,250],0,1.5)},
 die(p){const o=out(p,40);V(o,150,45,1.1,.6,[800,200],0,2);T(o,'sine',90,35,.3,.6,.4);N(o,'lowpass',500,100,1,.3,.3,.4)},
 shot(w,p){const o=out(p,100);
  if(w===2||w==='shotgun'||w==='heavy'){N(o,'lowpass',2800,250,.8,.55,1);T(o,'sine',90,25,.45,1);N(o,'highpass',1500,900,.7,.18,.6);N(o,'lowpass',1200,300,.5,.7,.25,.12);if(w==='heavy'){T(o,'sine',60,20,.6,.9);N(o,'bandpass',900,300,.6,.5,.7)}else{T(o,'triangle',900,500,.04,.25,.45);T(o,'triangle',700,400,.05,.25,.6)}}
  else if(w===3||w==='smg'||w==='rifle'){N(o,'bandpass',w==='smg'?2200:1800,800,1,.1,.7);T(o,'square',w==='smg'?230:180,50,.09,.35);N(o,'lowpass',1000,300,.5,.35,.15,.06);if(w==='rifle'){T(o,'sine',110,35,.22,.6);N(o,'highpass',2500,1200,.7,.1,.5)}}
  else if(w==='magnum'||w==='revolver'){const v=w==='magnum'?.9:.75;N(o,'highpass',2400,1200,.7,.16,v);T(o,'sine',120,30,.28,v);N(o,'lowpass',1200,200,.5,.6,.2,.08)}
  else{N(o,'highpass',2600,1400,.7,.13,.8);T(o,'sine',170,40,.16,.7);N(o,'lowpass',1400,300,.5,.45,.15,.08)}},
 rlStep(d,p){const o=out(p,40),k=(t,v)=>{N(o,'bandpass',2800,2200,4,.035,v,t);T(o,'square',700,350,.04,.1,t)};if(d.rlN===1){k(0,.35);T(o,'sine',140,70,.1,.3,.08)}else{k(.1,.4);T(o,'sine',140,70,.1,.5,.62);k(.95,.4)}},
 swing(w,p){N(out(p,30),'bandpass',w?500:350,w?1400:1900,1.2,.2,.3)},
 hit(w,p){const o=out(p,40);if(w==='blade'){N(o,'bandpass',1800,700,1.5,.16,.6);T(o,'sine',100,40,.12,.5)}else if(w==='fist'){T(o,'sine',110,45,.12,.65);N(o,'lowpass',900,200,1,.1,.45)}else{T(o,'sine',130,40,.14,.7);N(o,'lowpass',1400,200,1,.14,.55);if(w==='metal')T(o,'triangle',950,700,.12,.2)}},
 click(){const o=out();N(o,'bandpass',3500,3000,4,.03,.4);T(o,'square',900,500,.03,.12)},
 swap(w){this.click();if(w===2)T(out(),'sine',200,150,.06,.1)},
 ui(){T(out(),'sine',320,420,.07,.07)},
 reload(w){const o=out(),k=(d,v=.3)=>{N(o,'bandpass',2800,2200,4,.035,v,d);T(o,'square',700,350,.04,.1,d)},c=(d,v=.5)=>{T(o,'sine',140,70,.1,v,d);N(o,'lowpass',900,300,1,.08,.3,d)};
  if(w===1){k(.1);c(.65);N(o,'highpass',2200,900,.8,.09,.45,.95);k(.97,.4)}
  else if(w===2){for(let i=0;i<4;i++){k(.3+i*.4,.35);c(.3+i*.4,.2)}N(o,'highpass',1600,700,.8,.1,.5,1.9);N(o,'highpass',1600,900,.8,.1,.5,2.1)}
  else{c(.2,.6);k(.25);c(1.2,.7);k(1.25);N(o,'highpass',1800,800,.8,.07,.5,1.85);N(o,'highpass',1800,800,.8,.07,.5,1.93)}},
 door(op,p){const o=out(p,30);if(op){T(o,'sawtooth',150,rnd(260,340),.5,.07);T(o,'sawtooth',160,300,.45,.05,.05);N(o,'lowpass',500,250,1,.35,.12)}else{T(o,'sine',110,45,.16,.6);N(o,'lowpass',900,200,1,.14,.35);N(o,'bandpass',2500,2000,4,.03,.3,.14)}},
 glass(p){const o=out(p,50);N(o,'highpass',3000,6000,.5,.5,.8);for(let i=0;i<10;i++)T(o,'sine',rnd(3000,7500),rnd(2000,4000),.14,.1,rnd(0,.5))},
 hurt(){const o=out();V(o,150,90,.3,.6,[600,900],0,1);T(o,'sine',90,40,.15,.5)},
 voice(p,f=190){const o=out(p,30);V(o,f,f*1.3,.18,.45,[700,1500]);V(o,f*1.25,f*.9,.28,.45,[600,1200],.22)},
 scream(p){const o=out(p,50);V(o,420,760,.45,.6,[900,2000],0,2);V(o,760,300,.6,.6,[1500,700],.45,3)}
};
function bird(){const o=out({x:pl.position.x+rnd(-30,30),z:pl.position.z+rnd(-30,30)},50),f=rnd(2200,4200);if(o)o.gain.value*=AV;for(let i=0,n=ri(2,5);i<n;i++)T(o,'sine',f*rnd(.9,1.1),f*rnd(1.25,1.7),.08,.1,i*.14)}
function spook(){const o=out({x:pl.position.x+rnd(-60,60),z:pl.position.z+rnd(-60,60)},90),k=ri(0,3);if(o)o.gain.value*=AV;
 if(k===0)V(o,rnd(90,120),50,3,.7,[500,250],0,1.5);else if(k===1){V(o,650,420,.3,.5,[1100,900],0,3);V(o,620,400,.3,.5,[1100,900],.4,3)}else if(k===2){T(o,'sawtooth',120,260,1.1,.1);N(o,'lowpass',400,200,1,.9,.1)}else{T(o,'triangle',700,690,1.8,.25);N(o,'bandpass',1500,900,3,.3,.4)}}
function setMusic(m){musMode=m;const t=AC.currentTime;amb.dg.gain.setTargetAtTime(m==='siege'?.9:m==='menu'?.55:.4,t,2);amb.lf.frequency.setTargetAtTime(m==='siege'?650:m==='menu'?240:200,t,2)}
function audioTick(){if(!AC)return;const dt=.25,md=G.mode,on=playing(),night=G.time>=20||G.time<5.5,day=G.time>6&&G.time<19,mm=(md==='TITLE'||md==='END')?'menu':md==='SIEGE'?'siege':'game';if(mm!==musMode)setMusic(mm);
 aT.sil-=dt;aT.ss-=dt;if(aT.ss<=0){aT.ss=rnd(40,90);aT.sil=rnd(6,12)}
 amb.wind.gain.setTargetAtTime(on?(night?.2:.1)*(aT.sil>0?.1:1)*AV:0,AC.currentTime,1.5);
 aT.m-=dt;if(aT.m<=0){if(mm==='menu'){aT.m=rnd(.9,1.8);const n=PK([220,261.6,329.6,293.7,246.9,196,220,174.6])*(Math.random()<.25?2:1);T(MUS,'triangle',n,n*.997,2.6,.2);T(MUS,'sine',n*2.01,n*2,1.4,.05)}
  else if(mm==='siege'){aT.m=.75;T(MUS,'sine',75,35,.2,.9);T(MUS,'sine',65,30,.22,.6,.22);if(Math.random()<.2){const n=PK([110,116.5,155.6]);T(MUS,'sawtooth',n,n*.97,1.2,.12,0,.3)}}
  else{aT.m=rnd(6,15);const n=PK([110,116.5,130.8,98,87.3,164.8])*(Math.random()<.3?2:1);T(MUS,'sine',n,n*.99,6,.22,0,.6);T(MUS,'triangle',n*1.414,n*1.4,5,.05,.5,.8)}}
 if(!on)return;
 if(day&&aT.sil<=0&&md!=='SIEGE'&&(aT.b-=dt)<=0){aT.b=rnd(1.2,5);bird()}
 if((aT.x-=dt)<=0){aT.x=rnd(15,40);if(aT.sil<=0||Math.random()<.3)spook()}
 if(md==='FORT_BUILD'&&smesh.length&&(aT.v-=dt)<=0){aT.v=rnd(8,20);const m=PK(smesh);S.voice(m.position,m.userData.s.role==='Medic'?230:170)}}
function initUI(){$('icoFile').onchange=e=>{const f=[...e.target.files];e.target.value='';if(f.length)importIcons(f)};loadSavedIcons();document.addEventListener('pointerdown',initAudio);document.addEventListener('keydown',initAudio);
 document.addEventListener('keydown',titleAny);$('title').addEventListener('pointerdown',titleAny);
 const pct=(c,v)=>document.querySelectorAll(c).forEach(x=>x.textContent=Math.round(v*100)+'%');
 const bind=(sel,get,set)=>document.querySelectorAll(sel).forEach(e=>e.oninput=()=>{set(e.value/100);document.querySelectorAll(sel).forEach(x=>x.value=e.value);saveSet()});
 bind('.mastervol',()=>MSV,v=>{MSV=v;if(MASTER)MASTER.gain.setTargetAtTime(v,AC.currentTime,.05);pct('.vm',v)});
 bind('.mvol',()=>MV,v=>{MV=v;if(MUS)MUS.gain.setTargetAtTime(v,AC.currentTime,.05);pct('.vmu',v)});
 bind('.avol',()=>AV,v=>{AV=v;pct('.va',v)});
 try{const o=JSON.parse(localStorage.getItem('gf_set')||'null');if(o){MSV=o.ms??1;MV=o.mv??.6;AV=o.av??1;if(o.sens){G.sens=o.sens;document.querySelectorAll('.sens').forEach(x=>x.value=o.sens)}if(o.fov){camera.fov=G.fov=o.fov;camera.updateProjectionMatrix();document.querySelectorAll('.fov').forEach(x=>x.value=o.fov);document.querySelectorAll('.fovv').forEach(x=>x.textContent=o.fov+'\u00b0')}if(o.q!==undefined)setQuality(o.q)}}catch(e){}
 document.querySelectorAll('.mastervol').forEach(x=>x.value=MSV*100);document.querySelectorAll('.mvol').forEach(x=>x.value=MV*100);document.querySelectorAll('.avol').forEach(x=>x.value=AV*100);pct('.vm',MSV);pct('.vmu',MV);pct('.va',AV);
 document.querySelectorAll('.qb').forEach(b=>b.classList.toggle('on',+b.dataset.q===(G.q===undefined?2:G.q)));
 setInterval(()=>{const w=stuckLeft();document.querySelectorAll('.stuckBtn').forEach(b=>{b.textContent=w>0?"I'm Stuck ("+w+'s)':"I'm Stuck";b.style.opacity=w>0?.5:1})},500);
 document.addEventListener('mouseover',e=>{hov=(e.target.closest&&e.target.closest('.item,.lootItem'))||null;tipUpdate(e)});
 document.addEventListener('mousemove',e=>{if(e.clientX||e.clientY){lastMouse.x=e.clientX;lastMouse.y=e.clientY}if(tipEl.style.display==='block')tipMove(e)});
 document.addEventListener('mousedown',e=>{if(e.clientX||e.clientY){lastMouse.x=e.clientX;lastMouse.y=e.clientY}});
 setInterval(audioTick,250)}
const lastMouse={x:innerWidth/2,y:innerHeight/2},tipEl=document.createElement('div');tipEl.id='tt';document.body.appendChild(tipEl);
function tipUpdate(e){const it=e.target.closest&&e.target.closest('.item');if(it&&it.dataset.tip&&!invDragging){tipEl.innerHTML=it.dataset.tip;tipEl.style.display='block';tipMove(e)}else tipEl.style.display='none'}
function tipMove(e){const w=tipEl.offsetWidth,h=tipEl.offsetHeight;let x=e.clientX+16,y=e.clientY+18;if(x+w>innerWidth-4)x=e.clientX-w-12;if(y+h>innerHeight-4)y=e.clientY-h-12;tipEl.style.left=Math.max(2,x)+'px';tipEl.style.top=Math.max(2,y)+'px'}
// E over ammo in inventory/container loads it into the guns
function hovUse(){if(!hov||!invOpen||!hov.isConnected||hov.dataset.uid===undefined)return false;
 const kind=hov.dataset.kind,inv=kind==='cont'?(currentContainer&&currentContainer.inv):PINV;if(!inv)return false;
 const inst=inv.items.find(q=>q.uid==hov.dataset.uid);if(!inst)return false;const it=ITEMS[inst.id];
 if(it.cat==='ammo'){const w=G.eq,wd=w&&WDEF[w.id];
  if(!wd||wd.type!=='gun'){toast('Equip a gun first (TAB) - hover ammo + E loads the equipped gun');return true}
  if(wd.ammo!==inst.id){toast(ITEMS[w.id].name+' uses '+ITEMS[wd.ammo].name+' ammo');return true}
  const room=wd.cap-w.clip;if(room<=0){toast(ITEMS[w.id].name+' is already full');return true}
  const n=Math.min(room,inst.rem);inst.rem-=n;w.clip+=n;if(inst.rem<=0)invRemove(inv,inst);S.click();toast('Loaded +'+n+' ('+w.clip+'/'+wd.cap+')');hov=null;renderInv();return true}
 if(WDEF[inst.id]&&WDEF[inst.id].type==='gun'){const n=unloadGun(inv,inst);if(n>0){S.click();toast('Unloaded '+n+' rounds');hov=null;renderInv()}else toast(n<0?'No room in the inventory to unload':'Nothing to unload');return true}
 if(it.use&&it.cat==='meds'){const sv=kind==='cont'&&currentContainer.comp?currentContainer.sv:null,cur=sv?sv.hp:G.hp,max=sv?100:G.maxHp;
  if(cur>=max){toast(sv?sv.name+' is already at full health':'You are already at full health');return true}
  const cost=Math.min(inst.rem,it.use.cost),gain=Math.max(1,Math.round(it.use.hp*cost/it.use.cost*skHealMult(G)));trainSk(G,'first_aid');
  if(sv)sv.hp=Math.min(100,sv.hp+gain);else G.hp=Math.min(G.maxHp,G.hp+gain);const got=Math.min(gain,Math.round(max-cur));
  inst.rem-=cost;if(inst.rem<=0)invRemove(inv,inst);S.click();toast(sv?sv.name+' healed +'+got+' HP':'Used '+it.name+' (+'+got+' HP)');hov=null;renderInv();return true}
 return false}

/* ===== BLOOD, DECALS, LIMBS, FLOATING TEXT, DISMEMBERMENT ===== */
let bloodP=[],decals=[],limbs=[],floats=[];
const BG=new THREE.BoxGeometry(.05,.05,.05),BMAT=[0x8a0303,0x6e0000,0xa50505].map(c=>new THREE.MeshBasicMaterial({color:c})),DGEO=new THREE.PlaneGeometry(1,1);
const DMAT=(()=>{const a=[];for(let k=0;k<4;k++){const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d');
 for(let i=0,n=ri(5,9);i<n;i++){const r=rnd(3,12),x=32+rnd(-16,16),y=32+rnd(-16,16),g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(115,0,0,.95)');g.addColorStop(.7,'rgba(90,0,0,.85)');g.addColorStop(1,'rgba(70,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
 a.push(new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}))}return a})();
function addDecal(x,y,z,ry,rx,size){const m=new THREE.Mesh(DGEO,PK(DMAT));m.position.set(x,y,z);m.rotation.set(rx,ry,rnd(0,TAU));m.scale.set(size,size,1);m.raycast=()=>{};m.renderOrder=2;scene.add(m);decals.push(m);if(decals.length>300)scene.remove(decals.shift())}
function bloodPool(x,z,size){addDecal(x,groundAt(x,z,pl.position.y)+.05,z,0,-PI/2,size||rnd(1.1,1.8))}
function bloodSpray(x,y,z,dx,dz,n,spd){const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;spd=spd||1;
 for(let i=0;i<n;i++){if(bloodP.length>240)scene.remove(bloodP.shift().m);const m=new THREE.Mesh(BG,PK(BMAT));m.position.set(x,y,z);m.raycast=()=>{};m.scale.setScalar(rnd(.6,1.6));scene.add(m);
  bloodP.push({m,vx:dx*rnd(.5,3.5)*spd+rnd(-1.6,1.6),vy:rnd(.4,3.4)*spd+.3,vz:dz*rnd(.5,3.5)*spd+rnd(-1.6,1.6),t:0})}}
function updBlood(dt){for(let i=bloodP.length-1;i>=0;i--){const b=bloodP[i],m=b.m,p=m.position;b.t+=dt;b.vy-=14*dt;const nx=p.x+b.vx*dt,ny=p.y+b.vy*dt,nz=p.z+b.vz*dt;let done=false;
  if(ny<2.8){const gy=groundAt(nx,nz,ny+.3);if(ny<=gy+.03){if(Math.random()<.55)addDecal(nx,gy+.045+Math.random()*.012,nz,0,-PI/2,rnd(.25,.7));done=true}}
  if(!done){const q=blocked(nx,nz,.04,ny-.1,.2);if(q&&!q.win){let ry=null,fx=nx,fz=nz;
    if(p.x<q.min.x){ry=-PI/2;fx=q.min.x-.012}else if(p.x>q.max.x){ry=PI/2;fx=q.max.x+.012}else if(p.z<q.min.z){ry=PI;fz=q.min.z-.012}else if(p.z>q.max.z){ry=0;fz=q.max.z+.012}
    if(ry!==null&&ny<q.max.y&&Math.random()<.5)addDecal(fx,Math.max(.15,ny),fz,ry,0,rnd(.2,.55));done=true}}
  if(done||b.t>2.5){scene.remove(m);bloodP.splice(i,1);continue}p.set(nx,ny,nz)}}
function floatText(x,y,z,txt,col){const cv=document.createElement('canvas');cv.width=192;cv.height=64;const c=cv.getContext('2d');c.font='bold 44px Impact,sans-serif';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#000';c.strokeText(txt,96,46);c.fillStyle=col;c.fillText(txt,96,46);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));sp.scale.set(1.5,.5,1);sp.position.set(x,y,z);sp.renderOrder=10;sp.raycast=()=>{};scene.add(sp);floats.push({sp,t:0})}
function updFloats(dt){for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.t+=dt;f.sp.position.y+=dt*.9;f.sp.material.opacity=Math.max(0,1-f.t/1.1);if(f.t>1.1){scene.remove(f.sp);floats.splice(i,1)}}}
/* ===== zombie HP tags (while hunting) + floating damage numbers: shared textures, pooled sprites, no per-hit allocation ===== */
const numTexCache=new Map();
function numTex(txt,col){const key=txt+'|'+col;let t=numTexCache.get(key);if(!t){const cv=document.createElement('canvas');cv.width=128;cv.height=48;const c=cv.getContext('2d');c.font='bold 38px Impact,Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=7;c.strokeStyle='#000';c.strokeText(txt,64,26);c.fillStyle=col;c.fillText(txt,64,26);t=new THREE.CanvasTexture(cv);numTexCache.set(key,t);if(numTexCache.size>700)numTexCache.delete(numTexCache.keys().next().value)}return t}
let dnPool=[],dnAct=[];
function dmgNum(z,d,col){const v=Math.round(d);if(!(v>0)||!scene)return;let o=dnPool.pop();
 if(!o){o={sp:new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false})),t:0,vx:0};o.sp.renderOrder=11;o.sp.raycast=()=>{}}
 if(dnAct.length>=40){const old=dnAct.shift();scene.remove(old.sp);dnPool.push(old)}
 o.sp.material.map=numTex(String(v),col||(v>=40?'#ffd24a':'#ff5a4a'));o.sp.material.needsUpdate=true;o.sp.material.opacity=1;o.t=0;o.vx=rnd(-.5,.5);
 o.sp.position.set(z.position.x+rnd(-.25,.25),z.position.y+2.1*z.scale.x,z.position.z+rnd(-.25,.25));scene.add(o.sp);dnAct.push(o)}
function updDmgNums(dt){for(let i=dnAct.length-1;i>=0;i--){const o=dnAct[i];o.t+=dt;o.sp.position.y+=dt*1.1;o.sp.position.x+=o.vx*dt;o.sp.material.opacity=Math.max(0,1-Math.max(0,o.t-.45)/.45);
  const k=Math.max(1,Math.min(3,o.sp.position.distanceTo(pl.position)/10));o.sp.scale.set(.9*k,.34*k,1);
  if(o.t>.9){scene.remove(o.sp);dnAct.splice(i,1);dnPool.push(o)}}}
function zHpTag(z,horde){const u=z.userData;let s=u.hpTag;
 const on=false&&u.kind==='zombie'&&!u.sleep&&!(u.ragT>0)&&!(u.rise>0)&&(u.hunt>0||(horde&&Math.hypot(z.position.x-pl.position.x,z.position.z-pl.position.z)<30));
 if(!on){if(s&&s.visible)s.visible=false;return}
 if(!s){s=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthTest:false}));s.renderOrder=6;s.raycast=()=>{};s.position.y=2.25;z.add(s);u.hpTag=s;u.hpV=-1}
 const v=Math.max(0,Math.ceil(u.hp));if(v!==u.hpV){u.hpV=v;s.material.map=numTex(String(v),'#ffe066');s.material.needsUpdate=true}
 const k=Math.max(1,Math.min(2.4,Math.hypot(z.position.x-pl.position.x,z.position.z-pl.position.z)/12))/z.scale.x;s.scale.set(1.0*k,.375*k,1);s.visible=true}
// severed limbs fly off, land and STAY on the level
function spawnLimb(z,part,fx,fz){const P=z.userData.parts,src=P&&P[part];if(!src)return null;z.updateWorldMatrix(true,true);
 const c=src.clone(true);c.traverse(n=>{n.raycast=()=>{};if(n.userData)n.userData={}});const pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();src.matrixWorld.decompose(pos,q,sc);
 c.visible=true;c.position.copy(pos);c.quaternion.copy(q);c.scale.copy(sc);scene.add(c);
 let dx=pos.x-fx,dz=pos.z-fz;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
 limbs.push({m:c,vx:dx*rnd(1.2,3.2)+rnd(-1,1),vy:rnd(2.2,4.5),vz:dz*rnd(1.2,3.2)+rnd(-1,1),sx:rnd(-9,9),sz:rnd(-9,9),rest:false,head:part==='head',part:part});if(limbs.length>160)scene.remove(limbs.shift().m);return pos}
function updLimbs(dt){for(const L of limbs){if(L.rest)continue;const m=L.m,p=m.position;L.vy-=16*dt;const nx=p.x+L.vx*dt,nz=p.z+L.vz*dt;if(!blocked(nx,nz,.1,p.y-.1,.3)){p.x=nx;p.z=nz}else{L.vx=L.vz=0}p.y+=L.vy*dt;m.rotation.x+=L.sx*dt;m.rotation.z+=L.sz*dt;
  const gy=groundAt(p.x,p.z,p.y+.3)+(L.head?.14:.1);if(p.y<=gy&&L.vy<0){p.y=gy;L.rest=true;if(L.head)m.rotation.set(rnd(-.6,.6),rnd(0,TAU),rnd(-.6,.6));else m.rotation.set(Math.random()<.5?PI/2:-PI/2,rnd(0,TAU),rnd(-.3,.3));addDecal(p.x,gy-(L.head?.09:.05)+.05,p.z,0,-PI/2,rnd(.5,.9));bloodSpray(p.x,p.y+.1,p.z,0,0,5,.5)}}}
function stump(parent,x,y,z,w,h,d){return mesh(BX(w,h,d),0x7a0f0f,x,y,z,parent)}
function hideLimb(z,part){const u=z.userData,P=u.parts;u['no_'+part]=true;P[part].visible=false;const _n0=scene.children.length;
 (function(){const st=u.stumps||(u.stumps={});const s=_stumpFor(z,part);st[part]=s})();}
function _stumpFor(z,part){const u=z.userData,P=u.parts;let r;
 if(part==='head')r=stump(P.body,0,.68,.04,.15,.1,.15);else if(part==='armL'||part==='armR')r=stump(P.body,(part==='armL'?-1:1)*(u.big?.4:.33),.5,0,.17,.14,.17);else r=stump(z,(part==='legL'?-1:1)*.13,.86,0,.2,.12,.22);return r}
function legsGone(u){return !!(u.no_legL||u.no_legR)}
// shot / cut off. Head = instant death. A missing leg drops the zombie into a ragdoll, then it crawls at 60% speed.
function dismember(z,part,fx,fz){const u=z.userData,P=u.parts;if(!P||u['no_'+part]||!zombies.includes(z))return false;if(u.sleep)wakeZ(z);
 const pos=spawnLimb(z,part,fx,fz);hideLimb(z,part);const p=pos||z.position;bloodSpray(p.x,p.y,p.z,p.x-fx,p.z-fz,part==='head'?22:15,1.4);
 if(part==='head'){u.hp=0;flashObj(z,.4);killZ(z);return true}
 if((part==='legL'||part==='legR')&&!u.crawl){u.crawl=true;u.sp*=.6;u.vs=null;u.atk=null;u.crawlRag=1;try{crawlKids(z,P)}catch(e){}ragInit(z,fx,fz,false,1.3)}
 return true}
function dismemberQuiet(z,part){const u=z.userData;if(!u.parts||u['no_'+part])return;hideLimb(z,part);if((part==='legL'||part==='legR')&&!u.crawl){u.crawl=true;u.sp*=.6;try{crawlKids(z,u.parts)}catch(e){}}}
const PARTS=['head','armL','armR','legL','legR','torso','torso'];
// one damage call: random "Critical" chance on limbs/head from guns (part from the ray) and melee (random part)
function hitZ(z,dmg,part,melee,fr){let crit=false;const u=z.userData;
 if(part&&part!=='torso'&&!u['no_'+part]&&(Math.random()<(part==='head'?.1:.14)*(melee?1.2:1)||(part==='head'&&!melee&&FZ.T.on&&u.fzs))){crit=true;const f=fr||pl.position;dismember(z,part,f.x,f.z)}
 if(zombies.includes(z))dmgZ(z,dmg*(crit?1.25:1),fr);return crit}

// ragdoll for living zombies (failed jumps, lost legs); corpses use the same physics
function ragInit(z,fx,fz,big,dur,soft){const u=z.userData,P=u.parts;let dx=z.position.x-fx,dz=z.position.z-fz;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const k=ri(0,3),f=soft||1;z.rotation.setFromQuaternion(z.quaternion,'YXZ');
 u.rg={vx:dx*rnd(1.5,3)*(big?2.2:1)*f,vz:dz*rnd(1.5,3)*(big?2.2:1)*f,vy:(big?rnd(2.5,4.5):rnd(.5,2))*(soft?1.2:1),tx:k===1?PI/2:k===2?rnd(-.4,.4):-PI/2,tz:k===2?(Math.random()<.5?-1:1)*PI/2:rnd(-.4,.4),yw:rnd(-4,4)*(big?2:1),t:0,done:0};
 if(P){P.armL.rotation.x=rnd(-2.6,.6);P.armR.rotation.x=rnd(-2.6,.6);P.armL.rotation.z=rnd(-.8,.2);P.armR.rotation.z=rnd(-.2,.8);P.legL.rotation.x=rnd(-.8,.8)+(k===3?-1:0);P.legR.rotation.x=rnd(-.8,.8)+(k===3?-1:0);P.head.rotation.z=rnd(-.6,.6);P.head.rotation.x=rnd(-.5,.5);P.body.rotation.x=rnd(0,.4)}
 u.ragT=dur||0}
function ragStep(z,dt){const r=z.userData.rg;if(!r||r.done)return;r.t+=dt;const p=z.position,rot=z.rotation,fl=groundAt(p.x,p.z,p.y+1)+.2*Math.min(1,(Math.abs(rot.x)+Math.abs(rot.z))/1.3);
 if(p.y>fl+.01||r.vy>0){r.vy-=18*dt;p.y+=r.vy*dt;if(p.y<=fl){p.y=fl;r.vy=r.vy<-3?-r.vy*.3:0}}else p.y=fl;
 const nx=p.x+r.vx*dt,nz=p.z+r.vz*dt;if(!blocked(nx,nz,.3,p.y)){p.x=nx;p.z=nz}else{r.vx=r.vz=0}const fr=Math.max(0,1-(p.y<=fl+.02?4:.3)*dt);r.vx*=fr;r.vz*=fr;
 const k=Math.min(1,dt*5);rot.x+=(r.tx-rot.x)*k;rot.z+=(r.tz-rot.z)*k;rot.y+=r.yw*dt;r.yw*=Math.max(0,1-3*dt);
 if(r.t>1.5&&Math.abs(r.tx-rot.x)<.03&&p.y<=fl+.02)r.done=1}
function ragEnd(z){const u=z.userData,yv=z.rotation.y;z.rotation.set(0,yv,0);z.position.y=groundAt(z.position.x,z.position.z,z.position.y+1);u.rg=null;u.ragT=0;u.cl=rnd(.4,1);u.crawlRag=0;
 const P=u.parts;if(P){P.armL.rotation.z=P.armR.rotation.z=0;P.head.rotation.z=0}}
// sleeping zombies (lying or sitting) wake on gunfire, the player sprinting nearby, the player smashing a window, or being hurt
function sleepPose(z){const u=z.userData,P=u.parts,sc=z.scale.x;z.rotation.y=rnd(0,TAU);
 if(u.pose==='lie'){z.rotation.x=-1.45;z.position.y=.22*sc;P.armL.rotation.set(rnd(-.5,.2),0,-.5);P.armR.rotation.set(rnd(-.5,.2),0,.5);P.head.rotation.set(rnd(-.2,.2),0,rnd(-.4,.4))}
 else{z.position.y=-.78*sc;P.legL.rotation.x=P.legR.rotation.x=-1.45;P.body.rotation.x=.35;P.head.rotation.x=.75;P.armL.rotation.set(-.3,0,-.15);P.armR.rotation.set(-.2,0,.15)}}
function wakeZ(z){const u=z.userData;if(!u.sleep)return;u.sleep=false;u.rise=1.1;u.riseMax=1.1;u.see=true;u.hunt=5;u.lx=pl.position.x;u.lz=pl.position.z;S.groan(z.position)}
function riseStep(z,dt){const u=z.userData,P=u.parts,sc=z.scale.x;u.rise-=dt;const k=Math.max(0,u.rise)/u.riseMax;
 if(u.pose==='lie'){z.rotation.x=-1.45*k;z.position.y=.22*sc*k}else{z.position.y=-.78*sc*k;P.legL.rotation.x=P.legR.rotation.x=-1.45*k;P.body.rotation.x=.35*k+.3*(1-k);P.head.rotation.x=.75*k}
 if(u.rise<=0){z.rotation.x=0;z.position.y=0;P.armL.rotation.set(0,0,0);P.armR.rotation.set(0,0,0);P.head.rotation.set(0,0,0);P.legL.rotation.x=P.legR.rotation.x=0}}
function failJump(z,u,ux,uz){const p=z.position;floatText(p.x,p.y+2.1*z.scale.x,p.z,'Fail','#f87171');ragInit(z,p.x+ux*2,p.z+uz*2,false,1.7,.6);u.atk=null}
/* v076: things hung on the zombie's root at hip height (skirts, coats, the red leg stump) stayed up there when the body dropped into the crawl,
   so they floated. They ride on the pelvis while crawling (attached in the standing rest pose, so they sit where they did). */
function crawlKids(z,P){let any=false;for(const o of z.children)if(o!==P.body&&o!==P.legL&&o!==P.legR&&!o.isSprite&&!o.isLight&&!(o.userData&&o.userData.zaim)){any=true;break}if(!any)return;
 const bp=P.body.position.clone(),br=P.body.rotation.clone();P.body.position.set(0,.9,0);P.body.rotation.set(.3,0,0);z.updateMatrixWorld(true);
 for(const o of z.children.slice())if(o!==P.body&&o!==P.legL&&o!==P.legR&&!o.isSprite&&!o.isLight&&!(o.userData&&o.userData.zaim))P.body.attach(o);
 P.body.position.copy(bp);P.body.rotation.copy(br)}
function crawlPose(z,dt){const u=z.userData,P=u.parts,mv=u.cmv||0,sw=Math.sin((u.ph||0)*1.1)*.5;try{crawlKids(z,P)}catch(e){}
 P.body.position.y=.22;P.body.rotation.x=PI/2-.05;P.head.rotation.x=-1.35;P.head.rotation.z=0;P.legL.position.y=P.legR.position.y=.22;P.legL.rotation.x=P.legR.rotation.x=PI/2;
 P.armL.rotation.x=PI-.25+sw;P.armR.rotation.x=PI-.25-sw;P.armL.rotation.z=P.armR.rotation.z=0;P.elL.rotation.x=P.elR.rotation.x=-.2}

// ===== Windows (smashable), shards, ragdolls =====
const SG=new THREE.BoxGeometry(.12,.12,.02),SM=new THREE.MeshBasicMaterial({color:0xaad4ee,transparent:true,opacity:.7});
function breakWin(w,byPlayer){if(!w.alive)return;w.alive=false;w.g.remove(w.m);const i=solids.indexOf(w.box);if(i>=0)solids.splice(i,1);S.glass(w.p);
 for(let k=0;k<20;k++){const m=new THREE.Mesh(SG,SM);m.raycast=()=>{};m.position.set(w.p.x+(w.ax?rnd(-.7,.7):rnd(-.05,.05)),w.p.y+rnd(-.9,.9),w.p.z+(w.ax?rnd(-.05,.05):rnd(-.7,.7)));m.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));scene.add(m);shards.push({m,v:new THREE.Vector3(rnd(-1.5,1.5),rnd(0,2.5),rnd(-1.5,1.5)),t:0})}
 for(let k=-1;k<=1;k++){const t=new THREE.Mesh(BX(.07,rnd(.15,.35),.02),SM);t.position.set(w.l.x+(w.ax?k*.5:0),w.l.y+.15,w.l.z+(w.ax?0:k*.5));t.rotation.z=rnd(-.4,.4);t.raycast=()=>{};w.g.add(t)}
 zombies.forEach(z=>{if(z.position.distanceTo(w.p)<25){const u=z.userData;if(u.sleep){if(byPlayer)wakeZ(z);return}u.hunt=4;u.lx=w.p.x;u.lz=w.p.z}})}
function updShards(dt){for(let i=shards.length-1;i>=0;i--){const s=shards[i],m=s.m;s.t+=dt;s.v.y-=12*dt;m.position.addScaledVector(s.v,dt);m.rotation.x+=dt*6;m.rotation.z+=dt*4;if(m.position.y<.05){m.position.y=.05;s.v.set(0,0,0)}if(s.t>5){const k=Math.max(0,6-s.t);m.scale.setScalar(k);if(k<=0){scene.remove(m);shards.splice(i,1)}}}}
function killZ(z){zombies=zombies.filter(q=>q!==z);G.kills++;if(z.userData.hpTag)z.userData.hpTag.visible=false;const u=z.userData,P=u.parts,dist=z.position.distanceTo(pl.position);u.kind='corpse';u.thru=true;u.sleep=false;u.rise=0;u.ragT=0;S.die(z.position);
 const big=u.ld>=60||(G.eq&&WDEF[G.eq.id]&&WDEF[G.eq.id].pel>1&&dist<12);
 if(P&&u.crawl){P.body.position.y=.9;P.legL.position.y=P.legR.position.y=.9}
 ragInit(z,pl.position.x,pl.position.z,big,0);
 bloodSpray(z.position.x,z.position.y+1.1*z.scale.x,z.position.z,z.position.x-pl.position.x,z.position.z-pl.position.z,big?16:10,1.1);bloodPool(z.position.x,z.position.z,rnd(1,1.7));
 dead.push(z);if(dead.length>35)scene.remove(dead.shift())}
function updDead(dt){for(const z of dead){const fu=z.userData;if(fu.flash>0){fu.flash-=dt;if(fu.flash<=0)tintHit(z,0)}}for(const z of dead)ragStep(z,dt)}

function init(){scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.1,300);pl=new THREE.Group();pl.position.set(0,1.6,0);pl.add(camera);scene.add(pl);
renderer=new THREE.WebGLRenderer({antialias:PERF.aa});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));$('cv').appendChild(renderer.domElement);
clock=new THREE.Clock();VM.root=null;VM.set={};VM.cur=null;ray=new THREE.Raycaster();scene.fog=new THREE.FogExp2(0x7092be,.02);ambL=new THREE.AmbientLight(0x667788,.6);scene.add(ambL);dirL=new THREE.DirectionalLight(0xffeedd,1);scene.add(dirL);
torchL=new THREE.SpotLight(0xfff0cc,0,30,Math.PI/6,.4,1.2);torchL.position.set(0,0,0);torchL.target.position.set(0,0,-10);camera.add(torchL);camera.add(torchL.target);
$('cs').innerHTML=Array(24).fill(0).map((_,i)=>`<span style="display:inline-block;width:40px;text-align:center">${['N','NE','E','SE','S','SW','W','NW'][i%8]}</span>`).join('');
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
addEventListener('keydown',e=>{K[e.code]=true;if(e.code==='Tab')e.preventDefault();if(e.code==='Escape'&&!e.repeat&&escResume())return;
 if(invOpen){
   if(e.code==='KeyE'&&hovUse()){e.preventDefault();return}
   if(e.code==='KeyI'||e.code==='KeyE'){e.preventDefault();closeInv();return}
   if(e.code==='KeyR'&&invDragging){dragRot();return}
   if(e.code==='KeyR'&&currentContainer){e.preventDefault();takeAllQuick();return}
   return;
 }
 if(skOpen)return;if(e.code==='KeyI'&&playing()&&!inHQ()){toggleInv();return}
 if(e.code==='KeyF'&&playing()){toggleTorch();return}
 if(!locked||!playing())return;
 if(/^(Digit|Numpad)[1-5]$/.test(e.code)&&!e.repeat&&comps.length){ccApply(+e.code.slice(-1))}
 if(e.code==='KeyR')reload();if(e.code==='KeyQ'&&!e.repeat)melee();if(e.code==='KeyE'){const h=look(false),u=h&&h.o&&h.o.userData,fort=G.mode==='FORT_BUILD';if(u&&h.d<3.5&&(u.kind==='comp'||(u.kind==='surv'&&fort))){if(!e.repeat){const c=u.kind==='comp'?u.c:fortComp(h.o);holdC={c,pick:fort,to:setTimeout(()=>{if(holdC){holdC.done=1;wheelOpen(holdC.c)}},350)}}}else use()}if(e.code==='KeyC'&&!e.repeat)toggleCrouch();if(e.code==='KeyZ')fzBarKey();if(e.code==='KeyX')fzGhostOff(true);if(e.code==='Tab')cycleWeapon()});
addEventListener('keyup',e=>{K[e.code]=false;if(e.code==='KeyE'&&holdC){clearTimeout(holdC.to);if(wheel)wheelDone();else if(!holdC.done){if(holdC.pick)use();else toggleFollow(holdC.c)}holdC=null}});addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(wheel&&locked){wheel.x=Math.max(-100,Math.min(100,wheel.x+e.movementX));wheel.y=Math.max(-100,Math.min(100,wheel.y+e.movementY));wheelUI();return}if(!locked||invOpen)return;yaw-=e.movementX*.0022*G.sens*(G.zoomK||1);pitch=Math.max(-1.45,Math.min(1.45,pitch-e.movementY*.0022*G.sens*(G.zoomK||1)));pl.rotation.y=yaw;camera.rotation.x=pitch});
addEventListener('mousedown',e=>{if(e.button===0)K.m0=true;if(e.button===2)K.m2=true;if(!locked||!playing()||invOpen)return;if(e.button===0)shoot()});addEventListener('mouseup',e=>{if(e.button===0)K.m0=false;if(e.button===2)K.m2=false});
renderer.domElement.addEventListener('click',()=>{if(playing()&&!locked&&!invOpen)lock()});
function escResume(){if(!playing()||invOpen||performance.now()-(G.pauseAt||0)<350)return false;
 if(G.hqPause&&scrVis('hq')){resumeFort();return true}
 if(scrVis('pz')&&!locked){G.escTry=performance.now();lock();return true}
 return false}
document.addEventListener('pointerlockerror',()=>{if(G.escTry&&performance.now()-G.escTry<1500){G.escTry=0;if(playing()&&!locked&&!invOpen&&!scrVis('hq')&&!scrVis('dev')&&!scrVis('opt'))ui('pz')}});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;if(playing()&&!invOpen&&!skOpen){if(locked)ui(null);else showPause()}});
document.querySelectorAll('.sens').forEach(e=>e.oninput=()=>{G.sens=+e.value;saveSet();document.querySelectorAll('.sens').forEach(x=>x.value=e.value)});
document.querySelectorAll('.fov').forEach(e=>e.oninput=()=>{camera.fov=G.fov=+e.value;saveSet();camera.updateProjectionMatrix();document.querySelectorAll('.fovv').forEach(x=>x.textContent=e.value+'\u00b0');document.querySelectorAll('.fov').forEach(x=>x.value=e.value)});
ui('title');initUI();animate()}

function addSolid(m,box){if(m&&m.updateWorldMatrix)m.updateWorldMatrix(true,false);const b=box||new THREE.Box3().setFromObject(m);solids.push(b);return b}
function addWalkable(m,box){if(m&&m.updateWorldMatrix)m.updateWorldMatrix(true,false);const b=box||new THREE.Box3().setFromObject(m);walkables.push(b);return b}
function blocked(x,z,r=.4,fy=0,hh=1.8){TB.min.set(x-r,fy+.05,z-r);TB.max.set(x+r,fy+hh,z+r);for(const s of solids)if(s&&s.intersectsBox(TB))return s;return null}
function mesh(g,c,x,y,z,p){const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:.85}));m.position.set(x,y,z);(p||scene).add(m);return m}

const LOOT_PROP={clinic:'cabinet',gunshop:'ammo_crate',gas:'pump_shelf',diner:'counter',hardware:'toolchest',house:'fridge',supermarket:'cart',church:'pew',cemetery:'grave',park:'bench'};

function rollLoot(table,n){const ids=Object.keys(LOOT_TABLES[table]);const tot=ids.reduce((a,k)=>a+LOOT_TABLES[table][k],0);const out=[];for(let i=0;i<n;i++){let r=Math.random()*tot;for(const k of ids){if((r-=LOOT_TABLES[table][k])<=0){out.push(k);break}}}return out}

function spawnContainer(x,z,table,y0=0){
  const g=new THREE.Group();g.position.set(x,y0,z);scene.add(g);
  const kind=LOOT_PROP[table]||'crate';const pieces=[];
  const add=(geo,col,px,py,pz)=>{const m=mesh(geo,col,px,py,pz,g);pieces.push(m);return m};
  if(kind==='cabinet'){add(new THREE.BoxGeometry(1.2,2,.6),0xd0d6dc,0,1,0);add(new THREE.BoxGeometry(1.1,.4,.05),0x88aacc,0,1.2,.32);add(new THREE.BoxGeometry(1.1,.4,.05),0x88aacc,0,.6,.32)}
  else if(kind==='ammo_crate'){add(new THREE.BoxGeometry(1.4,.8,1),0x4d5a2a,0,.4,0);add(new THREE.BoxGeometry(1.5,.1,1.1),0x3a4a1a,0,.85,0);add(new THREE.BoxGeometry(.4,.5,.05),0xfacc15,0,.4,.51)}
  else if(kind==='pump_shelf'){add(new THREE.BoxGeometry(1.6,.4,.8),0x883322,0,.2,0);add(new THREE.BoxGeometry(1.2,1.6,.4),0xcccccc,0,.9,0);add(new THREE.BoxGeometry(.4,.3,.1),0x222,0,1.2,.25)}
  else if(kind==='counter'){add(new THREE.BoxGeometry(2.2,.9,1),0x8a5a2a,0,.45,0);add(new THREE.BoxGeometry(2.3,.1,1.1),0xa06030,0,.95,0)}
  else if(kind==='toolchest'){add(new THREE.BoxGeometry(1.6,1.2,.7),0x9a1b1b,0,.6,0);add(new THREE.BoxGeometry(1.6,.05,.7),0x666,0,.3,0);add(new THREE.BoxGeometry(1.6,.05,.7),0x666,0,.9,0);add(new THREE.BoxGeometry(1.4,.06,.05),0xccc,0,.6,.36)}
  else if(kind==='fridge'){add(new THREE.BoxGeometry(1,2.2,.8),0xe5e7eb,0,1.1,0);add(new THREE.BoxGeometry(1.05,.05,.85),0x999,0,1.5,0);add(new THREE.BoxGeometry(.1,.4,.05),0x666,.4,1.8,.42)}
  else if(kind==='cart'){add(new THREE.BoxGeometry(1.2,.15,.8),0x8a8a8a,0,.4,0);add(new THREE.BoxGeometry(1.2,.6,.15),0x8a8a8a,0,.7,-.35);add(new THREE.BoxGeometry(1.2,.6,.15),0x8a8a8a,0,.7,.35);add(new THREE.BoxGeometry(.15,.6,.8),0x8a8a8a,-.55,.7,0);add(new THREE.BoxGeometry(.15,.6,.8),0x8a8a8a,.55,.7,0);add(new THREE.BoxGeometry(1.2,.05,.05),0x666,0,.4,-.55)}
  else if(kind==='pew'){add(new THREE.BoxGeometry(2,.9,.6),0x7a4a2a,0,.45,0);add(new THREE.BoxGeometry(2,.4,.15),0x7a4a2a,0,.95,-.25)}
  else if(kind==='grave'){add(new THREE.BoxGeometry(1,.3,2),0x3a3a3a,0,.15,0);add(new THREE.BoxGeometry(.6,1.2,.15),0x8a8a8a,0,.7,-.8);add(new THREE.BoxGeometry(.5,.1,.15),0x666,0,1,-.85)}
  else if(kind==='bench'){add(new THREE.BoxGeometry(1.8,.15,.5),0x7a4a2a,0,.45,0);add(new THREE.BoxGeometry(.15,.4,.5),0x3a3a3a,-.7,.2,0);add(new THREE.BoxGeometry(.15,.4,.5),0x3a3a3a,.7,.2,0)}
  else{add(new THREE.BoxGeometry(1.4,1.1,1.4),0xd97706,0,.55,0);add(new THREE.BoxGeometry(1.45,.1,1.45),0xa16207,0,1.1,0)}
  const cont={x,z,inv:newInv(16,16),pieces,group:g,table,locked:(G.mode==='EXPEDITION'&&Math.random()<.04)};rollLoot(table,ri(1,3)+(cont.locked?ri(2,4):0)).forEach(id=>{const q=newInst(id);lootRoll(q);invAdd(cont.inv,q)});
  g.userData={kind:'loot',cont};pieces.forEach(p=>p.userData={kind:'loot',cont});
  const h=kind==='fridge'?2.2:kind==='cabinet'?2:1.1;
  solids.push(new THREE.Box3(new THREE.Vector3(x-.7,y0,z-.5),new THREE.Vector3(x+.7,y0+h,z+.5)));
  return cont;
}
function refreshContainerVisual(cont){if(cont.drop||cont.hq||cont.comp||cont.corpse||!cont.inv)return;if(!cont.inv.items.length){cont.pieces.forEach(p=>{p.material.color.setHex(0x444444);p.material.roughness=1})}}
function lootRuin(ct,p){ct.inv.items.slice().forEach(q=>{if(Math.random()<p)invRemove(ct.inv,q)})}

const BT=[
 {n:'Clinic',c:0x9db4c8,w:14,d:12,h:5,t:'clinic'},
 {n:'Gun Shop',c:0x4b4540,w:10,d:10,h:4.5,t:'gunshop'},
 {n:'Gas Station',c:0xb45309,w:16,d:14,h:4,t:'gas'},
 {n:'Diner',c:0xa16207,w:16,d:8,h:4.5,t:'diner'},
 {n:'Hardware Store',c:0x4d6b2a,w:16,d:14,h:5,t:'hardware'},
 {n:'Supermarket',c:0x6a7a8a,w:20,d:16,h:6,t:'supermarket'},
 {n:'Church',c:0xb0a890,w:12,d:16,h:7,t:'church'},
];
const HOUSE_TYPE={n:'House',t:'house',w:11,d:11,h:6,c:0x8a7f73};
const CUSTOM_TYPES=['clinic','gunshop','gas','diner','hardware','supermarket','church'];
let nNpc=0,buildings=[],npcList=[],dead=[],shards=[],treeList=[],winList=[],carry=null,BND=[-198,198,-154,148];
const doors=[];
let CUR={cs:1,px:0,pz:0,lv:0},LASTB=null; // CUR = orientation/placement of the building being generated; LASTB = its builder record
function fence(fx,fz,ax,L){fenceWorld(fx,fz,ax,L);mesh(BX(ax?L:.08,.08,ax?.08:L),0x8a6a3a,fx,.9,fz);for(let i=0;i<=L;i+=2)mesh(BX(.12,1.1,.12),0x5a3a1a,ax?fx-L/2+i:fx,.55,ax?fz:fz-L/2+i)}
function fenceWorld(fx,fz,ax,L){return addSolid(mesh(new THREE.BoxGeometry(ax?L:.12,1,ax?.12:L),0x6b4a2b,fx,.5,fz))}

// ============ BUILDINGS v2: data-driven shells, rooms, furniture, smashable windows ============
const FT={ // [w,d,[parts: w,h,d,x,y,z,col],flat,goods]
 bed:[2,2.2,[[2,.4,2.2,0,.2,0,0x5a3a2a],[1.8,.25,2,0,.5,0,0x8a9ab0],[.9,.15,.4,0,.68,-.8,0xeeeeee]]],
 cot:[1,2,[[.9,.5,1.9,0,.3,0,0xdddddd],[.8,.1,1.8,0,.6,0,0x88aacc]]],
 sofa:[2.2,1,[[2.2,.45,1,0,.22,0,0x6a3a3a],[2.2,.55,.25,0,.65,-.4,0x5a2a2a],[.25,.3,.9,-1,.5,0,0x5a2a2a],[.25,.3,.9,1,.5,0,0x5a2a2a]]],
 tv:[1.4,.6,[[1.4,.5,.5,0,.25,0,0x3a2a1a],[1.1,.7,.1,0,.85,0,0x111111]]],
 table:[1.6,1.1,[[1.6,.08,1.1,0,.75,0,0x7a5a3a],[.2,.7,.2,0,.35,0,0x5a3a2a]]],
 ctable:[1.1,.6,[[1.1,.06,.6,0,.4,0,0x5a3a2a],[.1,.4,.1,0,.2,0,0x3a2a1a]]],
 chair:[.5,.5,[[.45,.06,.45,0,.45,0,0x6a4a2a],[.45,.5,.06,0,.72,-.2,0x6a4a2a],[.08,.45,.08,0,.22,0,0x4a3a2a]]],
 wardrobe:[1.2,.6,[[1.2,2,.6,0,1,0,0x5a4030]]],
 shelf:[1.8,.45,[[1.8,2,.4,0,1,0,0x6a5a4a]],0,1],
 aisle:[2.4,.7,[[2.4,.25,.7,0,.12,0,0x888888],[2.4,1.8,.12,0,.9,0,0x999999],[2.4,.05,.7,0,.6,0,0xaaaaaa],[2.4,.05,.7,0,1.2,0,0xaaaaaa]],0,1],
 counter:[2.4,.8,[[2.4,.95,.8,0,.47,0,0x8a6a4a],[2.5,.08,.9,0,.97,0,0x3a3a3a]]],
 stove:[.8,.7,[[.8,.9,.7,0,.45,0,0xbbbbbb],[.7,.05,.6,0,.92,0,0x222222]]],
 fridge:[.9,.8,[[.9,2,.8,0,1,0,0xe5e7eb],[.05,.5,.05,.38,1.4,.42,0x777777]]],
 freezer:[2.2,.9,[[2.2,1.2,.9,0,.6,0,0xdfe6ea],[2,.05,.7,0,1.22,0,0x88ccee]]],
 bath:[1.7,.8,[[1.7,.55,.8,0,.28,0,0xe8eef0]]],
 toilet:[.5,.7,[[.45,.4,.6,0,.2,0,0xf0f0f0],[.45,.5,.2,0,.6,-.25,0xf0f0f0]]],
 sink:[.7,.5,[[.7,.9,.5,0,.45,0,0xdddddd]]],
 booth:[2,1.8,[[.5,.9,1.8,-.75,.45,0,0xa02020],[.5,.9,1.8,.75,.45,0,0xa02020],[.9,.08,1.2,0,.75,0,0xcccccc]]],
 stool:[.5,.5,[[.4,.7,.4,0,.35,0,0x882222]]],
 pew:[3,.8,[[3,.5,.8,0,.25,0,0x6a4a2a],[3,.6,.12,0,.75,-.34,0x6a4a2a]]],
 altar:[2.4,1,[[2.4,1,.8,0,.5,0,0xc8c0b0],[.12,.9,.12,0,1.45,0,0xdddddd],[.6,.1,.1,0,1.7,0,0xdddddd]]],
 rack:[1.8,.3,[[1.8,1.6,.12,0,1.2,0,0x3a3028],[1.5,.08,.5,0,1.5,.2,0x222222],[1.5,.08,.5,0,1.1,.2,0x222222]]],
 register:[1,.7,[[1,.9,.7,0,.45,0,0x555555],[.4,.3,.3,0,1.05,0,0x222222]]],
 bench:[2.4,.9,[[2.4,.9,.9,0,.45,0,0x7a5a3a],[2.4,.08,1,0,.92,0,0x5a4a3a]]],
 crate:[1,1,[[1,.8,1,0,.4,0,0x8a6a3a]]],
 box:[.6,.6,[[.6,.5,.6,0,.25,0,0xa08050]]],
 desk:[1.6,.8,[[1.6,.75,.8,0,.38,0,0x6a5a4a]]],
 lamp:[.4,.4,[[.1,1.5,.1,0,.75,0,0x333333],[.3,.25,.3,0,1.5,0,0xffe8a0]]],
 plant:[.5,.5,[[.4,.8,.4,0,.4,0,0x2a5a2a]]],
 lumber:[2.4,.8,[[2.4,.2,.8,0,.1,0,0xa16207],[2.4,.2,.7,0,.3,0,0x8a5a05],[2.4,.2,.6,0,.5,0,0xa16207]]],
 rug:[2.6,1.8,[[2.6,.02,1.8,0,.06,0,0x7a2a2a]],1],
 paper:[.4,.3,[[.4,.01,.3,0,.085,0,0xe8e4d0]],1],
 blood:[1.4,1.1,[[1.4,.01,1.1,0,.1,0,0x4a0505]],1]};
const RM={
 living:[['sofa','s',.5],['tv','n',.5],['rug','c',.5],['ctable','c',.5],['shelf','w',.2],['lamp','e',.95],['plant','e',.05],['plant','w',.95]],
 dining:[['table','c',.5],['chair','c',.5,-.4,.85,PI],['chair','c',.5,.4,.85,PI],['chair','c',.5,-.4,-.85,0],['chair','c',.5,.4,-.85,0],['shelf','n',.85],['plant','s',.1]],
 kitchen:[['counter','n',.2],['stove','n',.6],['fridge','n',.95],['sink','w',.5],['table','c',.5,0,.2],['chair','c',.5,-.4,1.05,PI],['chair','c',.5,.4,1.05,PI],['chair','c',.5,-.4,-.65,0]],
 bedroom:[['bed','n',.75],['box','n',.35],['wardrobe','w',.8],['desk','e',.6],['chair','e',.6,-.7,0,PI/2],['rug','c',.5]],
 bath:[['bath','n',.5],['toilet','w',.9],['sink','e',.9]],
 exam:[['cot','n',.5],['desk','e',.7],['sink','w',.85],['chair','e',.3,-.7,0,PI/2],['box','s',.1]],
 pharm:[['shelf','n',.2],['shelf','n',.8],['shelf','w',.5],['shelf','e',.5],['fridge','s',.5]],
 wait:[...[.04,.11,.18,.25,.32,.7,.78,.86,.94].map(u=>['chair','s',u]),['plant','n',.05],['counter','c',.35,0,-.8],['counter','c',.52,0,-.8],['plant','n',.95],['box','n',.5]]};
const fw=(len,dc=99,st=3)=>{const a=[];for(let c=-len/2+2;c<=len/2-1.9;c+=st)if(Math.abs(c-dc)>1.9)a.push({k:'w',c});return a};
function mk(x,z,w,d,h,c,fc,dc){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=CUR.cs<0?PI:0;scene.add(g);return LASTB={g,x,z,w,d,h,c,fc,dc,y:0,occ:[],cs:CUR.cs,dx:0}}
function mkDoor(B,ax,fx,c,s=1){const pv=new THREE.Group();pv.position.set(ax?c-.65:fx,B.y,ax?fx:c-.65);pv.rotation.y=ax?0:-PI/2;B.g.add(pv);
 const dr=mesh(BX(1.3,2.4,.12),B.dc||0x4a2c14,.65,1.2,0,pv);mesh(BX(.08,.08,.2),0xccaa44,.45,-.1,0,dr);dr.updateWorldMatrix(true,false);
 const dd={p:pv,b:pv.rotation.y,a:0,t:0,open:0,sg:s,locked:(G.mode==='EXPEDITION'&&Math.random()<.06),sol:new THREE.Box3().setFromObject(dr).expandByScalar(.08)};dd.sol.door=dd;dd.hp=dd.hp0=dd.locked?110:50;   /* v075: locked doors take over twice the punishment */solids.push(dd.sol);doors.push(dd);dr.userData={kind:'door',d:dd};
 B.occ.push(ax?[c-1,c+1,fx-1.4,fx+1.4]:[fx-1.4,fx+1.4,c-1,c+1])}
function mkWin(B,ax,fx,c){const y=B.y+1.825,x=ax?c:fx,z=ax?fx:c,m=mesh(BX(ax?1.5:.05,1.85,ax?.05:1.5),0x9cc8e8,x,y,z,B.g),mt=m.material;mt.transparent=true;mt.opacity=.3;mt.depthWrite=false;mt.side=THREE.DoubleSide;
 for(const dy of[.9,2.78])mesh(BX(ax?1.7:.12,.08,ax?.12:1.7),0x4a4038,x,B.y+dy,z,B.g);for(const s of[-.78,.78])mesh(BX(ax?.08:.12,1.9,ax?.12:.08),0x4a4038,x+(ax?s:0),y,z+(ax?0:s),B.g);
 const bx=addSolid(m),w={m,box:bx,g:B.g,ax,alive:true,l:{x,y:B.y+.9,z},p:new THREE.Vector3(B.x+B.cs*x,B.y+1.8,B.z+B.cs*z)};bx.win=w;m.userData={kind:'glass',w};winList.push(w)}
function WL(B,ax,fx,a0,a1,ops,h,o={}){const th=o.th||.3,col=o.c||B.c;ops.sort((p,q)=>p.c-q.c);let a=a0;
 const sg=(u0,u1,ya,yb)=>{if(u1-u0<.05||yb-ya<.05)return;addSolid(mesh(BX(ax?u1-u0:th,yb-ya,ax?th:u1-u0),col,ax?(u0+u1)/2:fx,B.y+(ya+yb)/2,ax?fx:(u0+u1)/2,B.g))};
 for(const p of ops){const hw=p.k==='w'?.75:p.k==='d'?.65:.8;sg(a,p.c-hw,0,h);
  if(p.k==='w'){sg(p.c-hw,p.c+hw,0,.9);sg(p.c-hw,p.c+hw,2.75,h);mkWin(B,ax,fx,p.c)}else if(p.k==='d'){sg(p.c-hw,p.c+hw,2.4,h);mkDoor(B,ax,fx,p.c,p.s)}else sg(p.c-hw,p.c+hw,2.5,h);a=p.c+hw}
 sg(a,a1,0,h)}
function shell(B,o){const{g,w,d,h,fc}=B;WL(B,1,d/2,-w/2,w/2,o.f||[],h);WL(B,1,-d/2,-w/2,w/2,o.b||[],h);WL(B,0,-w/2,-d/2,d/2,o.l||[],h);WL(B,0,w/2,-d/2,d/2,o.r||[],h);const f=mesh(new THREE.PlaneGeometry(w-.3,d-.3),fc,0,.03,0,g);f.rotation.x=-PI/2}
const NOCOL=new Set(['chair','stool','box','plant','lamp','ctable']); // tiny clutter: no collision (keeps rooms walkable & pathing clean)
function put(B,t,x,z,ry=0){const f=FT[t],sw=Math.abs(Math.sin(ry))>.5,hw=(sw?f[1]:f[0])/2,hd=(sw?f[0]:f[1])/2;
 if(x-hw<-B.w/2+.2||x+hw>B.w/2-.2||z-hd<-B.d/2+.2||z+hd>B.d/2-.2)return 0;
 if(!f[3]){for(const o of B.occ)if(x-hw<o[1]-.003&&x+hw>o[0]+.003&&z-hd<o[3]-.003&&z+hd>o[2]+.003)return 0;B.occ.push([x-hw,x+hw,z-hd,z+hd])}
 const fg=new THREE.Group();fg.position.set(x,B.y,z);fg.rotation.y=ry;B.g.add(fg);for(const p of f[2])mesh(BX(p[0],p[1],p[2]),p[6],p[3],p[4],p[5],fg);
 if(f[4])for(let i=0;i<7;i++)mesh(BX(.3,.3,.25),PK([0xdc2626,0x2563eb,0x16a34a,0xeab308,0xf97316,0xe5e7eb]),rnd(-f[0]/2+.2,f[0]/2-.2),rnd(.3,1.6),.2,fg);
 if(!f[3]&&!NOCOL.has(t))addSolid(fg);return 1}
function furn(B,L,r){const[x0,x1,z0,z1]=r;for(const[t,sd,u,ox=0,oz=0,ry]of L){const f=FT[t],hw=f[0]/2,hd=f[1]/2;let x,z,a=0;
 if(sd==='n'){z=z0+hd+.02;x=x0+hw+u*(x1-x0-2*hw)}else if(sd==='s'){z=z1-hd-.02;x=x0+hw+u*(x1-x0-2*hw);a=PI}
 else if(sd==='w'){x=x0+hd+.02;z=z0+hw+u*(z1-z0-2*hw);a=PI/2}else if(sd==='e'){x=x1-hd-.02;z=z0+hw+u*(z1-z0-2*hw);a=-PI/2}else{x=(x0+x1)/2+(u-.5)*(x1-x0-2*hw);z=(z0+z1)/2}
 put(B,t,x+ox,z+oz,ry===undefined?a:ry)}}
function cont(B,t,x,z){for(const o of B.occ)if(x-.75<o[1]&&x+.75>o[0]&&z-.6<o[3]&&z+.6>o[2])return 0;B.occ.push([x-.75,x+.75,z-.6,z+.6]);spawnContainer(B.x+B.cs*x,B.z+B.cs*z,t,B.y);return 1}
function rc(B,t,r,n){for(let i=0;i<n;i++)for(let k=0;k<25;k++)if(cont(B,t,rnd(r[0]+.8,r[1]-.8),rnd(r[2]+.7,r[3]-.7)))break}
function junk(B,n,r){for(let i=0;i<n;i++)put(B,PK(['crate','box','box','chair','paper','paper','blood']),rnd(r[0]+.6,r[1]-.6),rnd(r[2]+.6,r[3]-.6),rnd(0,6))}
function Zs(B,n){for(let i=0;i<n;i++)zombie(B.x+rnd(-B.w/2+1.5,B.w/2-1.5),B.z+rnd(-B.d/2+1.5,B.d/2-1.5))}
function roof(B,H,ty,col){const{g,w,d}=B;addSolid(mesh(BX(w+.4,.25,d+.4),0x4a4a48,0,H+.12,0,g));
 if(ty==='flat'){for(const[x,z,sw,sd]of[[0,d/2+.1,w+.4,.2],[0,-d/2-.1,w+.4,.2],[w/2+.1,0,.2,d+.4],[-w/2-.1,0,.2,d+.4]])mesh(BX(sw,.5,sd),0x6a6a68,x,H+.5,z,g);mesh(BX(1.5,.9,1.5),0x8a8f94,rnd(-w/4,w/4),H+.7,rnd(-d/4,d/4),g);
  for(let i=-1;i<=1;i++){const l=mesh(BX(1.2,.08,.25),0xfffbe0,i*w/4,H-.2,0,g);l.material.emissive.setHex(0x555544)}}
 else if(ty==='pyr'){const r=mesh(new THREE.ConeGeometry(Math.max(w,d)*.75,2.4,4),col,0,H+1.4,0,g);r.rotation.y=PI/4}
 else{const rise=Math.min(d*.3,3),a=Math.atan(rise/(d/2)),L=Math.hypot(d/2,rise)+.5;mesh(BX(w+.8,.15,L),col,0,H+rise/2+.2,d/4,g).rotation.x=a;mesh(BX(w+.8,.15,L),col,0,H+rise/2+.2,-d/4,g).rotation.x=-a;
  const gg=new THREE.CylinderGeometry(.577*d,.577*d,.3,3);gg.rotateX(-PI/2);gg.scale(1,rise/(.866*d),1);for(const s of[-1,1]){const e=mesh(gg,0x8a7f73,s*w/2,H+rise/3+.1,0,g);e.rotation.y=PI/2}}
 if(ty!=='flat')mesh(BX(.8,2,.8),0x5a3a2a,w/3-.5,H+1.6,-d/4,g)}
function sign(B,txt,wd=5){const key='S|'+txt;let mt=TSC.get(key);
 if(!mt){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.fillStyle='#111';x.fillRect(0,0,256,64);x.fillStyle='#facc15';x.font='bold 30px Impact,sans-serif';x.textAlign='center';x.fillText(txt,128,44);mt=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)});TSC.set(key,mt)}
 const m=new THREE.Mesh(new THREE.PlaneGeometry(wd,wd/4),mt);m.position.set(0,B.h+1.1,B.d/2+.12);B.g.add(m)}
function done(B,t,n){buildings.push({x:B.x,z:B.z,w:B.w,d:B.d,t});Zs(B,n)}
const IN=B=>[-B.w/2+.15,B.w/2-.15,-B.d/2+.15,B.d/2-.15];

function bHouse(x,z,t){const hv=(t&&t.hv)||{},w=16,d=14,two=hv.two!==undefined?hv.two:Math.random()<.65,H1=3,B=mk(x,z,w,d,H1,PK(hv.walls||[0x8a7f73,0x7c8a73,0x73808a,0x8a7373,0xa09070,0x6f7f8f]),PK(hv.floor||[0x8a6a4a,0x6a6a6a,0x9a8a6a]),PK(hv.door||[0x4a2c14,0x2c4a5a,0x5a2c2c])),g=B.g;
 const dx=rnd(-w/2+3.5,hv.garage?-.5:w/2-2.2),bx=rnd(-w/2+3.5,w/2-2.5),rf=hv.roof||PK(['pyr','gable','flat']),rcol=PK(hv.rcol||[0x5b2a1f,0x3a3a42,0x4a3a2a,0x2a4a3a]);B.dx=dx;
 B.occ.push([-w/2,-w/2+2,-d/2,-d/2+6.6]);
 shell(B,{f:[...fw(w,dx,3.2),{k:'d',c:dx}],b:[...fw(w,bx,3.2),{k:'d',c:bx,s:-1}],l:fw(d,99,3.2),r:fw(d,99,3.2)});
 const zp=-d/2+ri(4,5),P={th:.2,c:0xcbbfae};WL(B,1,zp,-w/2+2,w/2-.15,[{k:'d',c:rnd(-w/2+3.2,w/2-1.4),s:PK([1,-1])}],H1,P);
 let fr=[-w/2+2.1,w/2-.15,zp+.15,d/2-.15];const br=[-w/2+2.1,w/2-.15,-d/2+.15,zp-.15];
 if(w>=10&&Math.random()<.6){const xp=w/6;WL(B,0,xp,zp+.1,d/2-.15,[{k:'g',c:(zp+d/2)/2}],H1,P);furn(B,RM.dining,[xp+.1,w/2-.15,zp+.15,d/2-.15]);fr=[-w/2+2.1,xp-.1,zp+.15,d/2-.15]}
 furn(B,RM.living,fr);furn(B,Math.random()<.6?RM.kitchen:RM.bedroom,br);put(B,'plant',-w/2+1.2,d/2-.6);rc(B,'house',br,1);rc(B,'house',fr,1);junk(B,5,IN(B));
 mesh(BX(2.4,.25,1.2),0x777770,dx,.12,d/2+.7,g);
 if(two){const rs=H1/10;for(let i=0;i<10;i++){const sy=(i+1)*rs,sz=-d/2+1+i*.55,sx=-w/2+1.2;mesh(BX(1.4,rs,.55),0x8a6a4a,sx,sy-rs/2,sz,g);const sb=new THREE.Box3(new THREE.Vector3(x+B.cs*sx-.7,sy-rs,z+B.cs*sz-.275),new THREE.Vector3(x+B.cs*sx+.7,sy,z+B.cs*sz+.275));solids.push(sb);walkables.push(sb)}
  addSolid(mesh(BX(w-1.9,.2,d),0x6a5a4a,.95,H1,0,g));addSolid(mesh(BX(1.9,.2,d-6.225),0x6a5a4a,-w/2+.95,H1,(d/2+(-d/2+6.225))/2,g));
  B.y=3.1;B.occ=[[-w/2,-w/2+2,-d/2,-d/2+7.2]];const h2=2.9;
  WL(B,1,d/2,-w/2,w/2,fw(w,99,3.2),h2);WL(B,1,-d/2,-w/2,w/2,fw(w,99,3.2),h2);WL(B,0,-w/2,-d/2,d/2,fw(d,99,3.2),h2);WL(B,0,w/2,-d/2,d/2,fw(d,99,3.2),h2);
  const zq=-d/2+ri(4,5);WL(B,1,zq,-w/2+2,w/2-.15,[{k:'d',c:rnd(-w/2+3.2,w/2-1.4)}],h2,P);
  furn(B,RM.bedroom,[-w/2+2.1,w/2-.15,-d/2+.15,zq-.15]);furn(B,Math.random()<.5?RM.bedroom:RM.bath,[-w/2+2.1,w/2-.15,zq+.15,d/2-.15]);rc(B,'house',[-w/2+2.1,w/2-.15,-d/2+.15,zq-.15],1);junk(B,4,IN(B));
  roof(B,6,rf,rcol)}else roof(B,H1,rf,rcol);
 if(hv.feats)hv.feats.forEach(f=>FEAT[f](B,hv));done(B,(t&&t.id)||'house',Math.random()<.5?1:0)}

function bClinic(x,z,t){const B=mk(x,z,16,14,4.2,0x9db4c8,0xcfd8dc,0x6a7a8a),{w,d,h,g}=B,zh=-1,P={th:.2,c:0xe8eef0};
 shell(B,{f:[...fw(w,0),{k:'d',c:0}],b:fw(w),l:fw(d),r:fw(d)});
 WL(B,1,zh,-w/2+.15,w/2-.15,[{k:'d',c:-4.8},{k:'g',c:0},{k:'d',c:4.8,s:-1}],h,P);for(const sx of[-2.6,2.6])WL(B,0,sx,-d/2+.15,zh,[],h,P);
 const E=[-w/2+.15,-2.7,-d/2+.15,zh-.1],E2=[2.7,w/2-.15,E[2],E[3]],Ph=[-2.5,2.5,E[2],E[3]],Wr=[-w/2+.15,w/2-.15,zh+.1,d/2-.15];
 furn(B,RM.exam,E);furn(B,RM.exam,E2);furn(B,RM.pharm,Ph);furn(B,RM.wait,Wr);rc(B,'clinic',E,1);rc(B,'clinic',E2,1);rc(B,'clinic',Ph,2);rc(B,'clinic',Wr,1);
 roof(B,h,'flat');mesh(BX(2.4,.3,.8),0xcc2222,0,h+1,0,g);mesh(BX(.8,.3,2.4),0xcc2222,0,h+1,0,g);sign(B,'CLINIC');junk(B,6,Wr);junk(B,3,E);done(B,'clinic',ri(1,2))}

function bGun(x,z,t){const B=mk(x,z,16,14,4.5,0x4b4540,0x5a5650,0x2a2a2a),{w,d,h}=B;shell(B,{f:[...fw(w,0),{k:'d',c:0}],b:fw(w),l:fw(d),r:fw(d)});
 WL(B,1,-2.2,-w/2+.15,w/2-.15,[{k:'d',c:3}],h,{th:.2,c:0x6a6560});const Fr=[-w/2+.15,w/2-.15,-2.1,d/2-.15],Bk=[-w/2+.15,w/2-.15,-d/2+.15,-2.3];
 put(B,'counter',-3,-.5);put(B,'counter',-.6,-.5);put(B,'register',-1.6,-1.3);
 furn(B,[['rack','w',.25],['rack','w',.75],['rack','e',.25],['rack','e',.75],['plant','e',.5],['box','s',.9]],Fr);furn(B,[['crate','n',.1],['crate','n',.35],['shelf','w',.5],['shelf','e',.3],['box','n',.9]],Bk);
 rc(B,'gunshop',Bk,2);rc(B,'gunshop',Fr,1);roof(B,h,'flat');sign(B,'GUN SHOP');junk(B,7,Fr);done(B,t.id||'gunshop',ri(0,1))}

function bGas(x,z,t){const cs=CUR.cs,B=mk(x,z-4*cs,16,6,3.6,0xdddddd,0x8a8a8a,0x333333),{w,d,h}=B;B.dx=-3;shell(B,{f:[...fw(w,-3),{k:'d',c:-3}],b:fw(w),l:fw(d,99,3.5),r:fw(d,99,3.5)});
 put(B,'aisle',-2,-.3);put(B,'aisle',2.2,-.3);furn(B,[['freezer','n',.1],['freezer','n',.5],['freezer','n',.9],['counter','s',.9],['box','s',.5]],IN(B));rc(B,'gas',IN(B),2);roof(B,h,'flat');sign(B,'GAS',3);junk(B,4,IN(B));
 const G0=new THREE.Group();G0.position.set(x,0,z);G0.rotation.y=cs<0?PI:0;scene.add(G0);const pad=mesh(new THREE.PlaneGeometry(16,14),0x777777,0,.015,0,G0);pad.rotation.x=-PI/2;
 addSolid(mesh(BX(12,.4,5.4),0xcc2222,0,4.6,4.2,G0));for(const px of[-5.5,5.5])for(const pz of[2,6.4])addSolid(mesh(new THREE.CylinderGeometry(.15,.15,4.5,8),0xdddddd,px,2.25,pz,G0));
 for(const px of[-2.2,2.2]){addSolid(mesh(BX(.9,1.6,.6),0x666666,px,.8,4.2,G0));mesh(BX(.6,.6,.2),0x222222,px,1.3,4.55,G0)}
 spawnContainer(x+cs*rnd(-5,-3.5),z+cs*6,'gas');buildings.push({x,z,w:16,d:14,t:t.id||'gas'});Zs(B,ri(0,1));zombie(x+rnd(-5,5),z+cs*rnd(2,6));LASTB={g:G0,x,z,w:16,d:14,h:3.6,cs,fz:-1,dx:-3,y:0,occ:[]}}

function bDiner(x,z,t){const B=mk(x,z,16,14,4.2,0xc8d0d4,0xb8b090,0x883322),{w,d,h}=B;B.dx=6;shell(B,{f:[...fw(w,6,2.6),{k:'d',c:6}],b:fw(w,99,3.2),l:fw(d),r:fw(d)});
 WL(B,1,-1.3,-w/2+.15,-1.5,[{k:'d',c:-5.2}],h,{th:.2,c:0xdddddd});const K=[-w/2+.15,-1.7,-d/2+.15,-1.4],Fr=[-w/2+.15,w/2-.15,-1.2,d/2-.15];
 furn(B,[['stove','n',.2],['stove','n',.5],['counter','s',.2],['fridge','n',.95],['box','e',.5]],K);
 for(const bx of[-6.8,-4.6,-2.4])put(B,'booth',bx,d/2-1.1,PI);for(const bx of[1.2,3.6]){put(B,'counter',bx,-.6);put(B,'stool',bx-.5,.5);put(B,'stool',bx+.5,.5)}
 for(const tx of[-5,-2.2]){put(B,'table',tx,.2);put(B,'chair',tx-.4,1.05,PI);put(B,'chair',tx+.4,1.05,PI);put(B,'chair',tx-.4,-.65);put(B,'chair',tx+.4,-.65)}
 for(const tx of[-5,-2.2,1.8,4.6]){put(B,'table',tx,3.1);put(B,'chair',tx-.4,3.95,PI);put(B,'chair',tx+.4,3.95,PI);put(B,'chair',tx-.4,2.25);put(B,'chair',tx+.4,2.25)}
 rc(B,'diner',K,1);rc(B,'diner',Fr,1);roof(B,h,'flat');sign(B,'DINER',4);junk(B,5,Fr);done(B,'diner',ri(1,2))}

function bHard(x,z,t){const B=mk(x,z,16,14,5,0x4d6b2a,0x7a7a72,0x3a3a3a),{w,d,h}=B;shell(B,{f:[...fw(w,0),{k:'d',c:0}],b:fw(w,99,3.5),l:fw(d,99,3.5),r:fw(d,99,3.5)});
 WL(B,1,-2.5,-w/2+.15,w/2-.15,[{k:'d',c:-4},{k:'g',c:4.5}],h,{th:.2,c:0x6a7a5a});const Bk=[-w/2+.15,w/2-.15,-d/2+.15,-2.7],Fr=[-w/2+.15,w/2-.15,-2.3,d/2-.15];
 for(const rz of[2,-.4])for(const ax of[-5.5,-3.1,3.1,5.5])put(B,'aisle',ax,rz);put(B,'counter',5.5,5.3,PI);put(B,'register',3.6,5.2);
 furn(B,[['bench','e',.5],['bench','w',.7],['plant','w',.1]],Fr);furn(B,[['lumber','n',.2],['lumber','n',.55],['crate','n',.9],['shelf','w',.5],['shelf','e',.5]],Bk);
 rc(B,'hardware',Bk,2);rc(B,'hardware',Fr,1);roof(B,h,'flat');sign(B,'HARDWARE',6);junk(B,6,Fr);done(B,'hardware',ri(1,2))}

function bMart(x,z,t){const B=mk(x,z,16,14,6,0x6a7a8a,0xc8c8c0,0x3a3a3a),{w,d,h}=B;B.dx=-4;shell(B,{f:[...fw(w,-4,2.6),{k:'d',c:-4}],b:fw(w,99,3.4),l:fw(d,99,3.4),r:fw(d,99,3.4)});
 WL(B,1,-4.4,-w/2+.15,w/2-.15,[{k:'d',c:6.5},{k:'g',c:-3}],h,{th:.2,c:0x8a9aaa});const Bk=[-w/2+.15,w/2-.15,-d/2+.15,-4.6],Fr=[-w/2+.15,w/2-.15,-4.2,d/2-.15];
 for(const rz of[2.4,-.1,-2.6])for(const ax of[-5.4,-3,-.6,1.8,4.2])put(B,'aisle',ax,rz);for(const rx of[4.2,5.4,6.6])put(B,'register',rx,5.3);
 furn(B,[['freezer','e',.15],['freezer','e',.4],['freezer','e',.65]],Fr);furn(B,[['shelf','n',.1],['shelf','n',.35],['crate','n',.7],['crate','n',.9],['shelf','w',.5],['crate','e',.5]],Bk);
 rc(B,'supermarket',Fr,3);rc(B,'supermarket',Bk,1);roof(B,h,'flat');sign(B,'MEGA MART',8);junk(B,8,Fr);done(B,'supermarket',2)}

function bChurch(x,z,t){const B=mk(x,z,16,14,7,0xb0a890,0x6a5a4a,0x3a2a1a),{w,d,h,g}=B;shell(B,{f:[...fw(w,0,3),{k:'d',c:0}],b:[{k:'w',c:0}],l:fw(d,99,3.4),r:fw(d,99,3.4)});
 const P={th:.2,c:0x8a7a6a};WL(B,1,-3.7,-w/2+.15,-2.2,[{k:'d',c:-3.6}],h,P);WL(B,0,-2.2,-d/2+.15,-3.7,[],h,P);const V=[-w/2+.15,-2.3,-d/2+.15,-3.8];
 for(let r=0;r<6;r++)for(const px of[-5.6,-2.4,2.4,5.6])put(B,'pew',px,5.2-r*1.6);put(B,'altar',0,-6.1);put(B,'desk',5.2,-4.6,-PI/2);put(B,'plant',-1.6,-6.2);put(B,'plant',1.6,-6.2);
 furn(B,[['wardrobe','w',.5],['desk','e',.5],['shelf','n',.5],['box','s',.3]],V);rc(B,'church',V,1);rc(B,'church',[-w/2+.15,w/2-.15,-6.6,-3.8],1);
 roof(B,h,'gable',0x5a4a3a);mesh(BX(2.4,5,2.4),0x8a7a6a,0,h+2.8,d/2-1.4,g);mesh(new THREE.ConeGeometry(1.8,3.5,4),0x5a4a3a,0,h+7,d/2-1.4,g).rotation.y=PI/4;mesh(BX(.15,1.8,.15),0xcccccc,0,h+9.6,d/2-1.4,g);mesh(BX(1,.15,.15),0xcccccc,0,h+9.9,d/2-1.4,g);
 junk(B,5,[-w/2+.15,w/2-.15,-3.5,d/2-.15]);done(B,'church',ri(1,2))}
function placeNpcs(n){const cand=buildings.filter(b=>b.t!=='park'&&b.t!=='cemetery');let k=0,tr=0;
 const add=(px,pz)=>{const m=makePerson(0x0284c7,px,pz);m.rotation.y=rnd(0,TAU);m.userData={kind:'npc'};scene.add(m);npcList.push(m);k++};
 while(k<n&&tr<500&&cand.length){tr++;const b=PK(cand),px=b.x+rnd(-b.w/2+1.5,b.w/2-1.5),pz=b.z+rnd(-b.d/2+1.5,b.d/2-1.5);if(!blocked(px,pz,.6))add(px,pz)}
 while(k<n){const px=TRUCK.x+rnd(-14,14),pz=TRUCK.z-rnd(8,25);if(!blocked(px,pz,.6))add(px,pz)}}

const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),PK=a=>a[ri(0,a.length-1)];
// Detailed articulated humanoid (zombies + survivors). Returns pivots for animation.
function makeHuman(o,g){
 const Z=!!o.zombie,brute=o.kind==='brute',P={},
 sk=Z?PK([0x6b7d58,0x7a8567,0x8a8f72,0x5e6b55]):PK([0xe0b090,0xc68642,0x8d5524,0xf1c27d]),
 shirt=o.shirt!=null?o.shirt:(Z&&FZS&&FZS.shirt!=null)?FZS.shirt:PK(Z?[0x5a4a3a,0x3a4a5a,0x6a3a3a,0x4a5a3a,0x7a7a6a,0x2a2a35]:[0x3a5a8a,0x7a3a3a,0x4a6a4a,0x6a6a6a]),
 pants=(Z&&FZS&&FZS.pants!=null)?FZS.pants:PK([0x2a3040,0x3a3a2a,0x4a3a2a,0x202020,0x39455a]),hair=PK([0x1a1410,0x3a2a1a,0x6a5030,0x8a8a8a,0xb08a50]);
 const m=(geo,c,x,y,z,p)=>mesh(geo,c,x,y,z,p||g);
 const body=new THREE.Group();body.position.y=.9;g.add(body);P.body=body;
 m(BX(brute?.62:.5,.6,.28),brute?sk:shirt,0,.3,0,body);m(BX(.52,.07,.3),0x1a1a1a,0,.02,0,body);m(BX(.12,.1,.12),sk,0,.64,0,body);
 if(Z){for(let i=0,n=ri(1,3);i<n;i++)m(BX(rnd(.08,.18),rnd(.1,.2),.02),0x5a0a0a,rnd(-.18,.18),rnd(.1,.5),.15,body);
  if(Math.random()<.4)m(BX(.14,.12,.02),0xd8d0c0,rnd(-.1,.1),rnd(.25,.4),.145,body);
  m(BX(.5,.14,.28),shirt,rnd(-.03,.03),-.08,.01,body).rotation.z=rnd(-.1,.1);body.rotation.x=.3}
 else{if(o.role==='Medic'){m(BX(.12,.12,.02),0xffffff,.1,.38,.145,body);m(BX(.08,.02,.025),0xcc1111,.1,.38,.15,body);m(BX(.02,.08,.025),0xcc1111,.1,.38,.15,body)}
  if(o.role==='Builder')m(BX(.55,.08,.3),0x8a5a2a,0,-.02,0,body);
  m(...(o.role==='Scavenger'?[BX(.42,.55,.22),0x4a5a3a,0,.3,-.22]:[BX(.34,.42,.18),0x4a5a3a,0,.3,-.2]),body);
  }
 const head=new THREE.Group();head.position.set(0,.7,Z?.04:0);body.add(head);P.head=head;
 const hm=(geo,c,x,y,z)=>{const q=m(geo,c,x,y,z,head);q.userData.head=1;q.userData.part='head';return q};
 hm(BX(.24,.26,.24),sk,0,.13,0);hm(BX(.2,.07,.2),Z?0x7a3030:sk,0,-.03,.015).rotation.x=Z?.35:0;
 if(Math.random()<(Z?.55:.9))hm(BX(.26,.09,.26),hair,0,.27,-.01);
 for(const sx of [-.06,.06]){const e=hm(BX(.045,.035,.02),Z?0xe8e8c8:0x222222,sx,.15,.125);if(Z)e.material.emissive.setHex(0x888866)}
 if(Z&&Math.random()<.6)hm(BX(.07,.09,.02),0x6a0a0a,rnd(-.08,.08),rnd(.08,.2),.125);
 if(o.helmet)hm(BX(.28,.13,.28),0x3a4a2a,0,.29,0);if(o.hat)hm(BX(.28,.1,.28),0xf2c200,0,.3,0);if(o.cap)hm(BX(.27,.07,.3),0x2a3a5a,0,.29,.02);
 const arm=s=>{const sh=new THREE.Group();sh.position.set(s*(brute?.4:.33),.52,0);body.add(sh);m(BX(.17,.5,.17),Z&&brute?sk:shirt,0,-.25,0,sh).userData.part=s<0?'armL':'armR';
  const el=new THREE.Group();el.position.y=-.5;sh.add(el);m(BX(.14,.42,.14),sk,0,-.21,0,el).userData.part=s<0?'armL':'armR';m(BX(.15,.13,.1),sk,0,-.47,0,el).userData.part=s<0?'armL':'armR';return[sh,el]};
 [P.armL,P.elL]=arm(-1);[P.armR,P.elR]=arm(1);
 const leg=s=>{const h=new THREE.Group();h.position.set(s*.13,.9,0);g.add(h);m(BX(.2,.85,.22),pants,0,-.45,0,h).userData.part=s<0?'legL':'legR';m(BX(.22,.1,.32),0x1a1a1a,0,-.88,.04,h).userData.part=s<0?'legL':'legR';return h};
 P.legL=leg(-1);P.legR=leg(1);if(window.mergeHuman)mergeHuman(g,P);return P}
function animZ(z,dt,horde){const u=z.userData,P=u.parts;if(!P)return;const dx=z.position.x-pl.position.x,dz=z.position.z-pl.position.z;z.visible=dx*dx+dz*dz<6400;if(!z.visible||u.flop>0||u.sleep||u.rise>0||u.ragT>0)return;
 if(u.crawl){const m0=Math.hypot(z.position.x-(u.px===undefined?z.position.x:u.px),z.position.z-(u.pz===undefined?z.position.z:u.pz));u.px=z.position.x;u.pz=z.position.z;u.ph=(u.ph||0)+m0*6;crawlPose(z,dt);return}
 const mv=Math.hypot(z.position.x-(u.px===undefined?z.position.x:u.px),z.position.z-(u.pz===undefined?z.position.z:u.pz));u.px=z.position.x;u.pz=z.position.z;
 u.ph=(u.ph||0)+mv*(u.run?5:3.2);const ch=u.see||u.hunt>0||horde,sw=Math.min(1,mv/dt/2.5),s=Math.sin(u.ph),r=ch?-1.35:-.25,sy=Math.sin(u.ph*.5+1)*.12;
 P.legL.rotation.x=s*.7*sw;P.legR.rotation.x=-s*.7*sw;P.armL.rotation.x=r+(ch?sy:-s*.3*sw);P.armR.rotation.x=r+(ch?-sy:s*.3*sw);P.elL.rotation.x=P.elR.rotation.x=ch?-.3:-.15;
 P.body.rotation.x=.3+(ch?.12:0)+s*.04*sw;P.body.position.y=.9+Math.abs(s)*.03*sw;P.head.rotation.z=Math.sin(u.ph*.5)*.12*sw+(u.tilt||0);P.head.rotation.x=ch?-.15:.1;
 if(ch&&!u.atk){u.wpT=(u.wpT||0)-dt;if(u.wpT<=0){u.wpT=.25+Math.random()*.1;const fx=Math.sin(z.rotation.y),fz=Math.cos(z.rotation.y),px=z.position.x,pz=z.position.z;u.wallN=!!(blocked(px+fx*.95,pz+fz*.95,.2,0,1.8)||blocked(px+fx*.55,pz+fz*.55,.2,0,1.8))}
  if(u.wallN){P.armL.rotation.x=P.armR.rotation.x=-.25;P.elL.rotation.x=P.elR.rotation.x=-.1}}}
function makePerson(color,x,z,role){const g=new THREE.Group();g.position.set(x,0,z);const P=makeHuman({shirt:color,role,helmet:role==='Guard',hat:role==='Builder',cap:role==='Generalist'},g);
 g.userData.P=P;g.userData.role=role;return g}

const FLOOR={clinic:0xcfd8dc,gunshop:0x5a5650,gas:0x8a8a8a,diner:0xb8b090,hardware:0x7a7a72,supermarket:0xc8c8c0,church:0x6a5a4a};
function frameWin(g,cx,cz,ax,o){const x=cx+(ax?o:0),z=cz+(ax?0:o);for(const y of [1.28,2.94]){const m=mesh(BX(ax?1.9:.34,.1,ax?.34:1.9),0xd8d4c8,x,y,z,g)}}
function detail(g,w,d,h,t){const m=(geo,c,x,y,z)=>mesh(geo,c,x,y,z,g);
 const fl=m(new THREE.PlaneGeometry(w-.6,d-.6),FLOOR[t]||0x8a8478,0,.03,0);fl.rotation.x=-Math.PI/2;m(BX(w+.2,.35,d+.2),0x6a6a68,0,.17,0);
 for(const [sx,sz,lx,lz] of [[0,d/2,w+.4,.3],[0,-d/2,w+.4,.3],[-w/2,0,.3,d+.4],[w/2,0,.3,d+.4]])m(BX(lx,.5,lz),0x77736a,sx,h+.45,sz);
 m(BX(1.5,.9,1.5),0x8a8f94,rnd(-w/3,w/3),h+.7,rnd(-d/3,d/3));m(new THREE.CylinderGeometry(.12,.12,.8,6),0x555555,rnd(-w/3,w/3),h+.8,rnd(-d/3,d/3));
 m(BX(4,.1,1.5),PK([0xb91c1c,0x1d4ed8,0x15803d,0x7c2d12]),0,3.3,d/2+.75).rotation.x=.18;
 for(const sx of [-1.65,1.65])m(BX(.2,3,.35),0x3a2a1a,sx,1.5,d/2+.02);m(BX(3.5,.2,.35),0x3a2a1a,0,3,d/2+.02);
 for(let i=0;i<3;i++){const q=m(new THREE.PlaneGeometry(rnd(1,2.5),rnd(1.5,3)),0x000000,rnd(-w/2+1,w/2-1),rnd(1.5,3),d/2+.22);q.material.transparent=true;q.material.opacity=.15}
 for(let i=-1;i<=1;i++){const l=m(BX(1.2,.08,.25),0xfffbe0,i*w/4,h-.25,0);l.material.emissive.setHex(0x555544)}}
function detailHouse(g,w,d){const m=(geo,c,x,y,z)=>mesh(geo,c,x,y,z,g);
 m(BX(3.4,.3,1.6),0x6a4a2a,0,.15,d/2+.9);for(const sx of [-1.5,1.5])m(BX(.15,2.4,.15),0xe8e4d8,sx,1.25,d/2+1.6);m(BX(3.8,.12,1.9),0x4a2a1a,0,2.5,d/2+.95);m(BX(2,.2,.4),0x7a7a74,0,.1,d/2+1.9);
 m(BX(w+.2,.4,d+.2),0x6a6a68,0,.2,0);m(BX(.12,1,.12),0x5a3a1a,w/2-.5,.5,d/2+5.5);m(BX(.35,.25,.5),0x2a4a8a,w/2-.5,1.1,d/2+5.5);
 for(let i=-1;i<=1;i++)m(BX(1.6,.1,.3),0xd8d4c8,i*3,4.05,d/2+.15)}
function litter(x,z,t){const d=t.d||10,w=t.w||10,fz=z+CUR.cs*d/2;
 if(Math.random()<.6){const b=mesh(new THREE.PlaneGeometry(2,1.5),0x3a0505,x+rnd(-2,2),.03,fz+CUR.cs*1.2);b.rotation.x=-Math.PI/2}
 for(let i=0,n=ri(2,5);i<n;i++){const px=x+rnd(-w/2,w/2),pz=fz+CUR.cs*rnd(.5,1.3),k=Math.random();
  if(k<.4)mesh(new THREE.IcosahedronGeometry(.3,0),0x151515,px,.22,pz).scale.set(1,.8,1);
  else if(k<.7)mesh(BX(.5,.4,.4),0x8a6a3a,px,.2,pz).rotation.y=rnd(0,3);
  else{const c=mesh(new THREE.CylinderGeometry(.3,.28,.9,8),0x2a4a2a,px,.45,pz);if(Math.random()<.5){c.rotation.z=1.4;c.position.y=.28}}}}

/* ===== building condition variants: intact / damaged / ruined / collapsed ===== */
function quietBreak(w){if(!w.alive)return;w.alive=false;w.g.remove(w.m);const i=solids.indexOf(w.box);if(i>=0)solids.splice(i,1)}
function ruin(x,z,t,lv,n0,s0,w0,d0){
 const kids=scene.children.slice(n0),conts=kids.filter(k=>k.userData&&k.userData.kind==='loot'),grp=kids.filter(k=>k.isGroup&&!(k.userData&&k.userData.kind)),mine=solids.slice(s0),meshes=[],W=t.w||10,D=t.d||10;
 grp.forEach(g=>g.traverse(m=>{if(m.isMesh&&m.geometry&&(m.geometry.type==='BoxGeometry'||m.geometry.type==='ConeGeometry'))meshes.push(m)}));
 const boxOf=m=>{const b=new THREE.Box3().setFromObject(m),e=.07;return mine.find(q=>Math.abs(q.min.x-b.min.x)<e&&Math.abs(q.max.x-b.max.x)<e&&Math.abs(q.min.y-b.min.y)<e&&Math.abs(q.max.y-b.max.y)<e&&Math.abs(q.min.z-b.min.z)<e&&Math.abs(q.max.z-b.max.z)<e)};
 const dropBox=b=>{if(!b)return;const i=solids.indexOf(b);if(i>=0)solids.splice(i,1)},walls=[],roofs=[];
 meshes.forEach(m=>{const p=m.geometry.parameters;if(m.geometry.type==='ConeGeometry'){roofs.push(m);return}const th=Math.min(p.width,p.depth),lg=Math.max(p.width,p.depth);
  if(p.height>=2.2&&th<=.5&&lg>=1.2)walls.push(m);else if(m.position.y>=2.8&&p.height<=.5&&lg>=3)roofs.push(m);else if(m.rotation.x&&p.height<=.2&&lg>=3)roofs.push(m)});
 // windows smashed, doors hanging or ripped off
 winList.slice(w0).forEach(w=>{if(lv>1||Math.random()<.82)quietBreak(w)});
 doors.slice(d0).forEach(d=>{if(lv===1&&Math.random()<.5)return;   /* v076: no half-open (crooked) doors: closed, fully open or ripped off */
  if(lv>=2&&Math.random()<.8){const k=solids.indexOf(d.sol);if(k>=0)solids.splice(k,1);if(d.p.parent)d.p.parent.remove(d.p);doors.splice(doors.indexOf(d),1)}else{if(d.locked)d.locked=false;doorOpen(d,undefined,undefined,true)}});
 // loot: the more damaged, the more is gone (and some containers are spoiled outright)
 conts.forEach(c=>{const ct=c.userData.cont;if(!ct||!ct.inv)return;lootRuin(ct,[0,.6,.8,.9][lv]);if(lv>=2&&Math.random()<(lv===2?.35:.7))lootRuin(ct,1);refreshContainerVisual(ct)});
 // structural damage
 if(lv>=2){const nb=ri(2,4);for(let i=0;i<nb&&walls.length;i++){const m=walls.splice(ri(0,walls.length-1),1)[0];dropBox(boxOf(m));m.parent.remove(m)}}
 /* v076: only the top of the building goes. Upper floors of two-storey houses (a flat slab at 3 m) were classed as roof too, so the
    upstairs furniture and loot were left floating; a roof piece is now only one at the building's highest level. */
 {const wy=m=>{m.updateWorldMatrix(true,false);return new THREE.Vector3().setFromMatrixPosition(m.matrixWorld).y};let top=-1e9;for(const m of roofs)if(m.geometry.type!=='ConeGeometry')top=Math.max(top,wy(m));
  for(let i=roofs.length-1;i>=0;i--){const m=roofs[i];if(m.geometry.type!=='ConeGeometry'&&wy(m)<top-1.2)roofs.splice(i,1)}}
 roofs.forEach(m=>{if(lv===1)return;dropBox(boxOf(m));m.parent.remove(m)});   /* v076: a ruined roof is gone; tilted roof pieces could be walked through */
 if(lv===3)walls.forEach(m=>{const b=boxOf(m),p=m.geometry.parameters,k=rnd(.3,.55),base=m.position.y-p.height/2;m.scale.y=k;m.position.y=base+p.height*k/2;if(b)b.max.y=b.min.y+(b.max.y-b.min.y)*k});
 // soot / burn tint, overturned furniture, hanging signs
 const burnt=lv>=2&&Math.random()<.4,f=[1,.95,.6,.4][lv]*(burnt?.55:1);
 meshes.forEach(m=>{if(m.material&&m.material.color&&!m.material.transparent)m.material.color.multiplyScalar(f*(.9+Math.random()*.2))});
 if(lv>=1)grp.forEach(g=>{g.children.forEach(k=>{if(k.isGroup&&!(k.userData&&k.userData.kind)&&Math.random()<(lv>=2?.4:.18)){k.rotation.y+=rnd(-.7,.7)}});   /* v076: shoved askew on the floor, not tipped over and lifted (they hung in the air) */g.traverse(m=>{if(m.geometry&&m.geometry.type==='PlaneGeometry'&&m.material&&m.material.map&&Math.random()<.7)m.rotation.z=rnd(-.5,.5)*(lv>=2?1:.35)})});
 // rubble inside and around, extra zombies in the worst ones
 for(let i=0,n=2+lv*3;i<n;i++){const m=mesh(BX(rnd(.3,1.1),rnd(.2,.8),rnd(.3,1.1)),PK([0x6a6a68,0x5a4a3a,0x8a8a86,0x3a2a1a]),x+rnd(-W/2-(i%2?.9:0),W/2+(i%2?.9:0)),0,z+rnd(-D/2-(i%2?.9:0),D/2+(i%2?.9:0)));const h=m.geometry.parameters.height;m.position.y=h/2;m.rotation.y=rnd(0,3);if(h>.4)addSolid(m)}
 for(let i=0;i<(lv>=2?lv:0);i++)zombie(x+rnd(-W/3,W/3),z+rnd(-D/3,D/3));
 const b=buildings[buildings.length-1];if(b)b.lv=lv}
function inBuilding(x,z,pad=2){for(const b of buildings){if(x>b.x-b.w/2-pad&&x<b.x+b.w/2+pad&&z>b.z-b.d/2-pad&&z<b.z+b.d/2+pad)return true}return false}
function inRoad(x,z,vx,hz){for(const v of vx)if(Math.abs(x-v)<5)return true;for(const h of hz)if(Math.abs(z-h)<5)return true;return false}


let wireT=null;
function border(x0,x1,z0,z1){if(!wireT){const c=document.createElement('canvas');c.width=c.height=64;const q=c.getContext('2d');q.strokeStyle='#c4c8cc';q.lineWidth=2;for(let i=-64;i<128;i+=16){q.beginPath();q.moveTo(i,0);q.lineTo(i+64,64);q.stroke();q.beginPath();q.moveTo(i+64,0);q.lineTo(i,64);q.stroke()}wireT=new THREE.CanvasTexture(c);wireT.wrapS=wireT.wrapT=THREE.RepeatWrapping}
 const mx=(x0+x1)/2,mz=(z0+z1)/2;
 [[x0,z0,x1,z0],[x1,z0,x1,z1],[x1,z1,x0,z1],[x0,z1,x0,z0]].forEach(([ax,az,bx,bz])=>{const hz=Math.abs(bz-az)<1,L=Math.hypot(bx-ax,bz-az),cx=(ax+bx)/2,cz=(az+bz)/2;
  const t=wireT.clone();t.needsUpdate=true;t.repeat.set(L/1.2,3);const w=new THREE.Mesh(new THREE.PlaneGeometry(L,3.6),new THREE.MeshBasicMaterial({map:t,transparent:true,alphaTest:.3,side:THREE.DoubleSide}));w.position.set(cx,1.8,cz);if(!hz)w.rotation.y=Math.PI/2;w.raycast=()=>{};scene.add(w);
  const r=mesh(new THREE.CylinderGeometry(.06,.06,L,6),0x7a7f84,cx,3.65,cz);if(hz)r.rotation.z=Math.PI/2;else r.rotation.x=Math.PI/2;
  for(let i=0;i<=L;i+=4){const px=hz?ax+(bx>ax?i:-i):ax,pz=hz?az:az+(bz>az?i:-i);mesh(new THREE.CylinderGeometry(.09,.09,3.8,6),0x6a6f74,px,1.9,pz)}
  solids.push(hz?new THREE.Box3(new THREE.Vector3(Math.min(ax,bx),0,az-.3),new THREE.Vector3(Math.max(ax,bx),4,az+.3)):new THREE.Box3(new THREE.Vector3(ax-.3,0,Math.min(az,bz)),new THREE.Vector3(ax+.3,4,Math.max(az,bz))));
  const nx=hz?0:Math.sign(cx-mx),nz=hz?Math.sign(cz-mz):0;
  for(let s=0;s<L;s+=rnd(4,7)){const off=rnd(5,20),px=hz?Math.min(ax,bx)+s:cx+nx*off,pz=hz?cz+nz*off:Math.min(az,bz)+s,k=rnd(.8,1.5),tg=new THREE.Group();tg.position.set(px,0,pz);tg.scale.setScalar(k);tg.userData.inst=1;scene.add(tg);
   mesh(new THREE.CylinderGeometry(.3,.4,3,6),0x3a2a1a,0,1.5,0,tg);mesh(new THREE.ConeGeometry(2.2,4.5,7),0x15361a,0,4.5,0,tg).material.flatShading=true;mesh(new THREE.ConeGeometry(1.5,3.5,7),0x1d4a22,0,6.8,0,tg).material.flatShading=true}})}
function tree(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 mesh(new THREE.CylinderGeometry(.35,.5,3,6),0x4a3020,0,1.5,0,g);
 for(let i=0;i<3;i++){const cy=2.6+i*.7,cr=1.6-i*.35,cm=mesh(new THREE.IcosahedronGeometry(cr,0),[0x1a3d1a,0x234d23,0x2d5d2d][i],rnd(-.3,.3),cy,rnd(-.3,.3),g);cm.material.flatShading=true}
 const tb=new THREE.Box3(new THREE.Vector3(x-.5,0,z-.5),new THREE.Vector3(x+.5,3,z+.5));solids.push(tb);treeList.push({g,x,z,tb});g.userData={kind:'tree'}}
/* v074: a real (flora) tree inside a building lot, local coords. Kept by the town's tree cull. o.kind forces the species (oak, linden, maple, ginkgo,
   cherry, cedar), o.dead leaves only trunk + branches. */
function bldTree(B,lx,lz,s=1,o={}){tree(WX(B,lx),WZ(B,lz));const t=treeList[treeList.length-1];if(!t)return null;t.keep=1;t.g.scale.setScalar(s);
 const sp=t.g.userData&&t.g.userData.spec;if(sp){if(o.kind)sp.kind=o.kind;if(o.dead)sp.dead=1}else if(o.dead)t.g.children.filter(c=>c.geometry&&c.geometry.type==='IcosahedronGeometry').forEach(c=>t.g.remove(c));
 if(B.occ)B.occ.push([lx-.8,lx+.8,lz-.8,lz+.8]);return t}
function bush(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);g.userData.inst=1;treeList.push({g,x,z});const bb=new THREE.Box3(new THREE.Vector3(x-.55,0,z-.55),new THREE.Vector3(x+.55,.8,z+.55));bb.bush=true;solids.push(bb);
 const m=mesh(new THREE.IcosahedronGeometry(.7,0),0x2d4d1a,0,.55,0,g);m.material.flatShading=true;m.scale.set(1.3,.9,1.3);
 const m2=mesh(new THREE.IcosahedronGeometry(.5,0),0x3a5d22,.5,.45,.2,g);m2.material.flatShading=true}
function streetLight(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 mesh(new THREE.CylinderGeometry(.1,.15,6,6),0x2a2a2a,0,3,0,g);
 const head=mesh(new THREE.BoxGeometry(.8,.3,.8),0x1a1a1a,0,6.15,0,g);
 solids.push(new THREE.Box3(new THREE.Vector3(x-.15,0,z-.15),new THREE.Vector3(x+.15,6,z+.15)));
 g.userData={kind:'light'};
 if(Math.random()<.55){const L=new THREE.PointLight(0xffdd88,0,14,2);L.position.set(0,5.9,0);g.add(L);head.material.emissive.setHex(0x664400);streetLights.push(L)}}

function makeCar(x,z,rot){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.frustumCulled=false;
  const col=[0x7a1a1a,0x1a3a7a,0x3a3a3a,0x2a5a2a,0x6a5a3a,0x8a8a8a][ri(0,5)];
  const bodyMat=new THREE.MeshStandardMaterial({color:col,roughness:.5,metalness:.2});
  const glassMat=new THREE.MeshStandardMaterial({color:0x88bbdd,roughness:.3});
  const tireMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:1});
  const add=(geo,mat,px,py,pz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.frustumCulled=false;g.add(m);return m};
  add(new THREE.BoxGeometry(1.9,.6,4.2),bodyMat,0,.55,0);
  add(new THREE.BoxGeometry(1.7,.7,2.2),bodyMat,0,1.15,-.2);
  add(new THREE.BoxGeometry(1.55,.5,.1),glassMat,0,1.15,1);
  add(new THREE.BoxGeometry(1.55,.5,.1),glassMat,0,1.15,-1.4);
  for(const [wx,wz] of [[-.85,1.3],[.85,1.3],[-.85,-1.3],[.85,-1.3]]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.25,10),tireMat);
    wheel.rotation.z=Math.PI/2;wheel.position.set(wx,.4,wz);wheel.frustumCulled=false;g.add(wheel)}
  add(new THREE.BoxGeometry(1.7,.1,.1),bodyMat,0,.4,2.1);
  g.userData.veh=1;scene.add(g);
  const sw=Math.abs(Math.sin(rot))>.7,hx=sw?2.2:1.1,hz=sw?1.1:2.2;solids.push(new THREE.Box3(new THREE.Vector3(x-hx,0,z-hz),new THREE.Vector3(x+hx,1,z+hz)));
  walkables.push(new THREE.Box3(new THREE.Vector3(x-hx,0,z-hz),new THREE.Vector3(x+hx,1.5,z+hz)));
  return g;
}

function makeArmyTruck(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);g.frustumCulled=false;
  const oliveMat=new THREE.MeshStandardMaterial({color:0x445a2a,roughness:.8});
  const darkMat=new THREE.MeshStandardMaterial({color:0x334420,roughness:.9});
  const canvasMat=new THREE.MeshStandardMaterial({color:0x556638,roughness:1});
  const tireMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:1});
  const chromeMat=new THREE.MeshStandardMaterial({color:0x999999,roughness:.3,metalness:.6});
  const glassMat=new THREE.MeshStandardMaterial({color:0x88bbdd,roughness:.3});
  const add=(geo,mat,px,py,pz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.frustumCulled=false;g.add(m);return m};
  add(new THREE.BoxGeometry(2.8,.4,9),darkMat,0,.7,0);
  add(new THREE.BoxGeometry(2.8,1.4,2.6),oliveMat,0,1.7,3.2);
  add(new THREE.BoxGeometry(2.65,.5,1.2),glassMat,0,2.1,4.35);
  add(new THREE.BoxGeometry(2.4,.4,.06),glassMat,0,2.1,4.42);
  add(new THREE.BoxGeometry(2.6,.8,1.4),oliveMat,0,1.3,4.6);
  add(new THREE.BoxGeometry(2.9,.3,6),darkMat,0,1.1,-.4);
  add(new THREE.BoxGeometry(2.7,2.4,5.8),canvasMat,0,2.4,-.4);
  for(let i=-2;i<=2;i++)add(new THREE.BoxGeometry(2.75,.1,.1),darkMat,0,2.4+i*.4,-.4);
  add(new THREE.BoxGeometry(2.4,1.8,.1),oliveMat,0,2.1,-3.35);
  for(const [wx,wz] of [[-1.3,3.3],[1.3,3.3],[-1.3,-1.5],[1.3,-1.5],[-1.3,-3],[1.3,-3]]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.35,12),tireMat);
    wheel.rotation.z=Math.PI/2;wheel.position.set(wx,.55,wz);wheel.frustumCulled=false;g.add(wheel)}
  add(new THREE.BoxGeometry(2.9,.3,.2),darkMat,0,.7,5.4);
  add(new THREE.BoxGeometry(2.8,.15,.15),chromeMat,0,1.0,5.4);
  add(new THREE.CylinderGeometry(.1,.1,2.4,8),chromeMat,1.3,2.6,3.6);
  const spare=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.25,12),tireMat);
  spare.rotation.x=Math.PI/2;spare.position.set(0,1.8,-3.4);spare.frustumCulled=false;g.add(spare);
  const cv=document.createElement('canvas');cv.width=256;cv.height=32;const cx=cv.getContext('2d');
  cx.fillStyle='#445a2a';cx.fillRect(0,0,256,32);cx.fillStyle='#c8c8a0';cx.font='bold 22px Impact';cx.textAlign='center';cx.fillText('★ U.S. ARMY ★',128,24);
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.35),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)}));
  strip.position.set(0,1.6,4.5);strip.frustumCulled=false;g.add(strip);
  scene.add(g);
  solids.push(new THREE.Box3(new THREE.Vector3(x-1.6,0,z-4.6),new THREE.Vector3(x+1.6,2,z+5.5)));
  walkables.push(new THREE.Box3(new THREE.Vector3(x-1.6,0,z-4.6),new THREE.Vector3(x+1.6,3.6,z+5.5)));
  g.userData={kind:'truck'};return g;
}

function makePark(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  mesh(new THREE.PlaneGeometry(28,28),0x2d5a2a,0,.02,0,g).rotation.x=-Math.PI/2;
  mesh(new THREE.PlaneGeometry(4,26),0x8a7a5a,0,.03,0,g).rotation.x=-Math.PI/2;
  mesh(new THREE.CylinderGeometry(.1,.1,3.6,6),0x555555,-3,1.8,4,g);
  mesh(new THREE.CylinderGeometry(.1,.1,3.6,6),0x555555,3,1.8,4,g);
  const bar=mesh(new THREE.CylinderGeometry(.1,.1,6.2,6),0x555555,0,3.6,4,g);bar.rotation.z=Math.PI/2;
  solids.push(new THREE.Box3(new THREE.Vector3(x-3.2,0,z+3.7),new THREE.Vector3(x-2.8,3.6,z+4.3)));
  solids.push(new THREE.Box3(new THREE.Vector3(x+2.8,0,z+3.7),new THREE.Vector3(x+3.2,3.6,z+4.3)));
  mesh(new THREE.BoxGeometry(.5,.06,.3),0x8a5a2a,-1.5,.6,4,g);
  mesh(new THREE.BoxGeometry(.5,.06,.3),0x8a5a2a,1.5,.6,4,g);
  mesh(new THREE.BoxGeometry(.8,2.5,.8),0xcc3333,-4,1.25,-3,g);
  solids.push(new THREE.Box3(new THREE.Vector3(x-4.4,0,z-3.4),new THREE.Vector3(x-3.6,2.5,z-2.6)));
  const slide=mesh(new THREE.BoxGeometry(1,2.6,.3),0x88aacc,-4,1.2,-1,g);slide.rotation.x=-Math.PI/5;
  mesh(new THREE.BoxGeometry(4,.3,4),0xd4c088,0,.15,-4,g);
  for(const [sx,sz,sw,sd] of [[-2,.3,4,.4],[2,.3,4,.4],[0,-2.3,.4,4],[0,1.7,.4,4]])mesh(new THREE.BoxGeometry(sw,.6,sd),0x8a5a2a,sx,.3,-4+sz,g);
  for(const bx of [-8,8]){
    mesh(new THREE.BoxGeometry(2,.15,.5),0x7a4a2a,bx,.45,-8,g);
    mesh(new THREE.BoxGeometry(.2,.4,.5),0x333,bx-.8,.2,-8,g);
    mesh(new THREE.BoxGeometry(.2,.4,.5),0x333,bx+.8,.2,-8,g);
    solids.push(new THREE.Box3(new THREE.Vector3(x+bx-1,0,z-8-.25),new THREE.Vector3(x+bx+1,.6,z-8+.25)));
  }
  for(const [tx,tz] of [[-12,-12],[12,-12],[-12,12],[12,12]])tree(x+tx,z+tz);
  spawnContainer(x+8,z-8,'park');
  buildings.push({x,z,w:28,d:28,t:'park'});
}
function makeCemetery(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
  mesh(new THREE.PlaneGeometry(24,24),0x2a3a2a,0,.02,0,g).rotation.x=-Math.PI/2;
  for(let i=-12;i<12;i+=2){
    mesh(new THREE.CylinderGeometry(.05,.05,1.5,4),0x333333,i,.75,-12,g);
    mesh(new THREE.CylinderGeometry(.05,.05,1.5,4),0x333333,i,.75,12,g);
    mesh(new THREE.CylinderGeometry(.05,.05,1.5,4),0x333333,-12,.75,i,g);
    mesh(new THREE.CylinderGeometry(.05,.05,1.5,4),0x333333,12,.75,i,g);
  }
  for(let i=0;i<4;i++)for(let j=0;j<6;j++){const tx=-9+i*6,tz=-8+j*3;const stone=mesh(new THREE.BoxGeometry(1.2,1.4,.3),0x888888,tx,.7,tz,g);if(Math.random()<.15)stone.rotation.z=rnd(-.2,.2)
    solids.push(new THREE.Box3(new THREE.Vector3(x+tx-.6,0,z+tz-.15),new THREE.Vector3(x+tx+.6,1.4,z+tz+.15)))}
  for(let i=0;i<3;i++)spawnContainer(x+rnd(-9,9),z+rnd(-9,9),'cemetery');
  buildings.push({x,z,w:24,d:24,t:'cemetery'});
}

// ============ TOWN — bulletproof: each phase in its own try/catch ============
// ===================================================================================================================
//  v032 TOWN OVERHAUL — fixed 8x4 plot grid, data-driven building catalogue, intact/looted/ruined conditions
//  COORDINATE CONVENTION: world X = east(+), world Z = south(+), so NORTH IS -Z (top of the map / screen-up).
//  Every builder is AUTHORED facing SOUTH (its front door + sign are on local +Z). A plot whose frontage is
//  'north' rotates the whole building group by PI about Y; 'south' plots use yaw 0. Only 0/PI are produced by
//  this grid; any other front raises an explicit error (no random rotation, no silent fallback).
// ===================================================================================================================
const GRID=Object.freeze({COLS:8,ROWS:4,BW:16,BD:14,PW:40,PD:36,ROAD:8,ALLEY:4,CX:0,CZ:-4}); // BW/BD = the ONE standard building footprint; PW/PD = plot (40x36: the 16x14 building centred in a 12m side / 11m front-back yard); only PW/PD drive spacing
const STD=Object.freeze({w:GRID.BW,d:GRID.BD}),AUTHORED_FRONT='south',COND_NAMES=['intact','looted','ruined'];
function frontageForRow(row){if(!(row>=0&&row<GRID.ROWS))throw new Error('plot row '+row+' outside grid');return row%2===0?'north':'south'} // rows 0,2 face north; rows 1,3 face south; the alley is always behind
function yawFor(defFront,plotFront){if(defFront!==AUTHORED_FRONT)throw new Error('builders are authored facing '+AUTHORED_FRONT+'; unsupported designated front "'+defFront+'"');
 if(plotFront==='south')return 0;if(plotFront==='north')return Math.PI;throw new Error('this grid has no "'+plotFront+'" frontage')}
function gridLayout(G=GRID){
 const R=G.ROAD,A=G.ALLEY,W=3*R+8*G.PW,H=3*R+2*A+4*G.PD,X0=G.CX-W/2,Z0=G.CZ-H/2;
 const colX=c=>X0+R+(c<4?c*G.PW:4*G.PW+R+(c-4)*G.PW);
 const rowZ=r=>Z0+R+(r<2?r*G.PD+(r===1?A:0):2*G.PD+A+R+(r-2)*G.PD+(r===3?A:0));
 const plots=[];for(let r=0;r<G.ROWS;r++)for(let c=0;c<G.COLS;c++){const x0=colX(c),z0=rowZ(r);
  plots.push({id:r*G.COLS+c,col:c,row:r,block:(r<2?0:2)+(c<4?0:1),front:frontageForRow(r),x0,x1:x0+G.PW,z0,z1:z0+G.PD,cx:x0+G.PW/2,cz:z0+G.PD/2})}
 const HC0=Z0+R+2*G.PD+A,top=[Z0+R,HC0],bot=[HC0+R,Z0+H-R],roads=[];
 const rd=(kind,x0,x1,z0,z1)=>roads.push({type:'road',kind,x0,x1,z0,z1});
 rd('perimeter-north',X0,X0+W,Z0,Z0+R);rd('central-horizontal',X0,X0+W,HC0,HC0+R);rd('perimeter-south',X0,X0+W,Z0+H-R,Z0+H);
 for(const [k,vx0] of [['perimeter-west',X0],['central-vertical',X0+R+4*G.PW],['perimeter-east',X0+W-R]]){rd(k,vx0,vx0+R,top[0],top[1]);rd(k,vx0,vx0+R,bot[0],bot[1])}
 const alleys=[];for(const r of [0,2])for(const half of [0,4]){const x0=colX(half),z0=rowZ(r)+G.PD;alleys.push({type:'alley',kind:'alley',x0,x1:colX(half+3)+G.PW,z0,z1:z0+A,block:(r<2?0:2)+(half?1:0)})}
 return{X0,Z0,W,H,plots,roads,alleys,bounds:{x0:X0,x1:X0+W,z0:Z0,z1:Z0+H}}}
function townBND(L=gridLayout()){const B=L.bounds;return[B.x0-26,B.x1+26,B.z0-62,B.z1+64]} // fence rectangle: previous margins around the town (26 E/W, 62 N for park+cemetery, 64 S for the truck)
function validateLayout(L,G=GRID){const E=[],eps=1e-6,P=L.plots;
 if(P.length!==32)E.push('expected 32 plots, got '+P.length);
 const cells=new Set(P.map(p=>p.col+','+p.row));if(cells.size!==G.COLS*G.ROWS)E.push('plots are not a unique '+G.COLS+'x'+G.ROWS+' grid');
 P.forEach(p=>{if(Math.abs(p.x1-p.x0-G.PW)>eps||Math.abs(p.z1-p.z0-G.PD)>eps)E.push('plot '+p.id+' has non-standard size');if(p.front!==frontageForRow(p.row))E.push('plot '+p.id+' frontage mismatch')});
 for(let b=0;b<4;b++){if(P.filter(p=>p.block===b).length!==8)E.push('block '+b+' must hold 4x2 plots')}
 const all=[...P.map(p=>({n:'plot'+p.id,...p})),...L.roads.map((r,i)=>({n:'road'+i,...r})),...L.alleys.map((r,i)=>({n:'alley'+i,...r}))];
 let area=0;for(let i=0;i<all.length;i++){const a=all[i];area+=(a.x1-a.x0)*(a.z1-a.z0);const B=L.bounds;
  if(a.x0<B.x0-eps||a.x1>B.x1+eps||a.z0<B.z0-eps||a.z1>B.z1+eps)E.push(a.n+' outside map boundary');
  for(let j=i+1;j<all.length;j++){const b=all[j];if(Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>eps&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>eps)E.push(a.n+' overlaps '+b.n)}}
 if(Math.abs(area-L.W*L.H)>1e-3)E.push('plots+roads+alleys do not tile the map exactly (gap/overlap: '+area.toFixed(2)+' vs '+(L.W*L.H).toFixed(2)+')');
 if(!(G.ROAD>G.ALLEY))E.push('roads must be wider than alleys');
 const touchX=(r,x0,x1,z,which)=>Math.abs(r[which]-z)<eps&&r.x0<=x0+eps&&r.x1>=x1-eps;
 P.forEach(p=>{const fr=L.roads.some(r=>touchX(r,p.x0,p.x1,p.front==='north'?p.z0:p.z1,p.front==='north'?'z1':'z0'));if(!fr)E.push('plot '+p.id+' ('+p.front+') has no road along its front edge');
  const back=L.alleys.some(a=>touchX(a,p.x0,p.x1,p.front==='north'?p.z1:p.z0,p.front==='north'?'z0':'z1'));if(!back)E.push('plot '+p.id+' has no alley behind it')});
 L.alleys.forEach(a=>{if(!L.roads.some(r=>Math.abs(r.x1-a.x0)<eps&&r.z0<=a.z0&&r.z1>=a.z1))E.push('alley '+a.block+' has no road at its west entrance');if(!L.roads.some(r=>Math.abs(r.x0-a.x1)<eps&&r.z0<=a.z0&&r.z1>=a.z1))E.push('alley '+a.block+' has no road at its east entrance')});
 const perim=['perimeter-north','perimeter-south','perimeter-west','perimeter-east'];perim.forEach(k=>{if(!L.roads.some(r=>r.kind===k))E.push('missing '+k+' road')});
 return E}

// ------------------------------------------------------------ condition props & facade features (shared components)
const PF=B=>({g:B.g,fz:B.fz!==undefined?B.fz:B.d/2,dx:B.dx||0,h:B.h||4,w:B.w||16,d:B.d||14});
const flatM=(w,d,c,x,y,z,g,ry=0)=>{const m=mesh(new THREE.PlaneGeometry(w,d),c,x,y,z,g);m.rotation.set(-PI/2,0,ry);return m};
const CP={ // condition/exterior props. Each draws into the building's own (already rotated) group, so they follow the facade orientation automatically.
 planters(B){const{g,fz,dx}=PF(B);for(const s of[-1,1]){const x=dx+s*2.6;if(Math.abs(x)>7)continue;mesh(BX(1.2,.45,.4),0x6b4a2e,x,.22,fz+.5,g);mesh(BX(1.1,.25,.3),0x3a7a3a,x,.55,fz+.5,g)}},
 bin(B){const{g,fz}=PF(B);mesh(BX(.7,1,.7),0x2f5f3a,B.dx>0?-6:6,.5,fz+.7,g)},
 bench(B){const{g,fz,dx}=PF(B),x=dx>0?-5:5;mesh(BX(1.8,.1,.5),0x7a4a2a,x,.5,fz+.8,g);mesh(BX(.1,.5,.5),0x333333,x-.8,.25,fz+.8,g);mesh(BX(.1,.5,.5),0x333333,x+.8,.25,fz+.8,g)},
 flag(B){const{g,fz}=PF(B);mesh(BX(.1,6,.1),0xcccccc,-7,3,fz+.8,g);mesh(BX(1.2,.7,.04),0xb91c1c,-6.4,5.6,fz+.8,g)},
 trash(B){const{g,fz}=PF(B);for(let i=0,n=ri(3,5);i<n;i++){const m=mesh(new THREE.IcosahedronGeometry(.32,0),PK([0x1c2a1c,0x222222,0x3a3a2a]),rnd(-7,7),.24,fz+rnd(.4,1.3),g);m.scale.set(1,.8,1)}},
 glass(B){const{g,fz}=PF(B);for(let i=0;i<14;i++)mesh(BX(rnd(.1,.3),.02,rnd(.1,.25)),0xaed4ea,rnd(-7,7),.03,fz+rnd(.2,1.2),g).rotation.y=rnd(0,3)},
 graffiti(B){const{g,fz}=PF(B),cv=document.createElement('canvas');cv.width=256;cv.height=96;const q=cv.getContext('2d'),col=PK(['#c0262d','#e5e5e5','#3a8ad4']);q.fillStyle=col;q.font='bold 56px Impact,sans-serif';q.fillText(PK(['REPENT','HELP','NO FOOD','RIP','RUN']),12,66);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));m.position.set(rnd(-5,5),rnd(1.6,2.2),fz+.17);g.add(m)},
 crates(B){const{g,fz}=PF(B);for(let i=0;i<3;i++){const m=mesh(BX(.9,.7,.9),0x8a6a3a,rnd(-6,6),.35,fz+rnd(.5,1.1),g);m.rotation.y=rnd(0,3)}for(let i=0;i<4;i++)mesh(BX(.9,.06,.15),0x6a4a2a,rnd(-6,6),.04,fz+rnd(.4,1.1),g).rotation.y=rnd(0,3)},
 cart(B){const{g,fz}=PF(B),c=new THREE.Group();c.position.set(rnd(-6,6),.35,fz+1.1);c.rotation.set(0,rnd(0,3),1.3);g.add(c);mesh(BX(1.1,.12,.7),0x8a8a8a,0,0,0,c);mesh(BX(1.1,.5,.08),0x8a8a8a,0,.25,.3,c);mesh(BX(1.1,.5,.08),0x8a8a8a,0,.25,-.3,c)},
 papers(B){const{g,fz}=PF(B);for(let i=0;i<10;i++){const m=mesh(new THREE.PlaneGeometry(.3,.4),0xe8e4d0,rnd(-7,7),.05,rnd(-4,fz+1.4),g);m.rotation.set(-PI/2,0,rnd(0,3))}},
 flour(B){const{g,fz}=PF(B);for(let i=0;i<3;i++)flatM(rnd(1,1.8),rnd(.8,1.3),0xeeeeea,rnd(-5,5),.06,rnd(-2,fz-.2),g,rnd(0,3))},
 bottles(B){const{g,fz}=PF(B);for(let i=0;i<9;i++){const m=mesh(new THREE.CylinderGeometry(.06,.06,.3,6),PK([0x2a5a2a,0x6a3a1a,0x8aa0a8]),rnd(-7,7),.07,fz+rnd(.3,1.6),g);m.rotation.z=1.4;m.rotation.y=rnd(0,3)}},
 books(B){const{g,fz}=PF(B);for(let i=0;i<9;i++){const m=mesh(BX(.25,.04,.35),PK([0x7a2a2a,0x2a4a7a,0x3a6a3a,0xa08a3a]),rnd(-7,7),.04,rnd(-3,fz+1.5),g);m.rotation.y=rnd(0,3)}},
 boards(B){const{g,fz,dx}=PF(B);for(let i=0;i<3;i++){const m=mesh(BX(1.5,.16,.05),0x6a4a2a,dx,.7+i*.55,fz+.12,g);m.rotation.z=rnd(-.4,.4)}},
 scorch(B){const{g,fz}=PF(B);for(let i=0;i<2;i++){const m=mesh(new THREE.PlaneGeometry(rnd(2,3.4),rnd(1.8,2.8)),0x0a0a0a,rnd(-5,5),rnd(1.4,2.6),fz+.17,g);m.material.transparent=true;m.material.opacity=.72}},
 beam(B){const{g,h}=PF(B);for(let i=0;i<3;i++){const m=mesh(BX(.22,.22,rnd(3,5)),0x5a3a1a,rnd(-6,6),rnd(.5,1.6),rnd(-5,5),g);m.rotation.set(rnd(-.3,.3),rnd(0,3),0)}for(let i=0;i<3;i++){const p=mesh(BX(.15,rnd(1.5,2.8),.15),0x5a3a1a,rnd(-7,7),0,PK([-6.9,6.9,rnd(-6,6)]),g);p.position.y=p.geometry.parameters.height/2;p.rotation.z=rnd(-.15,.15)}},
 tarp(B){const{g,h}=PF(B);flatM(4,3,0x2a5a8a,rnd(-4,4),h+.45,rnd(-3,3),g,rnd(0,1))},
 rubble(B){const{g,fz}=PF(B),s=Math.random()<.5?-1:1;for(let i=0;i<7;i++){const m=mesh(BX(rnd(.4,1.2),rnd(.3,.9),rnd(.4,1.2)),PK([0x6a6a68,0x5a4a3a,0x8a8a86,0x3a2a1a]),s*rnd(3.5,7.2),0,fz+rnd(-.6,1),g);const hh=m.geometry.parameters.height;m.position.y=hh/2;m.rotation.y=rnd(0,3);if(hh>.6)addSolid(m)}},
 wreck(B){const{g,fz}=PF(B),x=rnd(-5,5),c=new THREE.Group();c.position.set(x,0,fz+1.05);g.add(c);mesh(BX(4,.8,1.8),0x1a1a1a,0,.6,0,c);mesh(BX(2,.6,1.6),0x141414,-.3,1.2,0,c);addSolid(c)},
 fallen_sign(B){const{g,fz}=PF(B);const m=mesh(BX(3.2,.12,.9),0x2a2a2a,rnd(-4,4),.2,fz+1.2,g);m.rotation.set(rnd(-.2,.2),rnd(-.4,.4),rnd(-.3,.3));mesh(BX(2.6,.05,.4),0xfacc15,0,.08,0,m)},
 mattress(B){const{g,fz}=PF(B);const m=mesh(BX(1.9,.25,1),0x8a8a9a,rnd(-6,6),.45,fz+.9,g);m.rotation.set(.9,rnd(-.4,.4),0)},
 barrels(B){const{g,fz}=PF(B);for(let i=0;i<3;i++){const m=mesh(new THREE.CylinderGeometry(.38,.38,.9,8),PK([0x7a3a1a,0x2a4a6a,0x555555]),rnd(-7,7),.45,fz+rnd(.6,1.5),g);if(Math.random()<.4){m.rotation.z=1.5;m.position.y=.38}}},
 blood(B){const{g,fz,dx}=PF(B);flatM(1.6,1.2,0x4a0505,dx+rnd(-.5,.5),.05,fz+.7,g,rnd(0,3));flatM(1.2,.9,0x4a0505,rnd(-5,5),.05,fz+rnd(.4,.9),g,rnd(0,3))},
 tires(B){const{g,fz}=PF(B);for(let i=0;i<3;i++){const m=mesh(new THREE.TorusGeometry(.38,.14,6,10),0x161616,rnd(-6,6),.16+i*.0,fz+rnd(.6,1.4),g);m.rotation.x=PI/2}},
 pallets(B){const{g,fz}=PF(B);for(let i=0;i<2;i++)for(let k=0;k<3;k++)mesh(BX(1.2,.1,.9),0x9a7a4a,-5+i*1.6,.06+k*.12,fz+1,g)}
};
const CP_DISTURB=['trash','glass','crates','cart','papers','flour','bottles','books','mattress','barrels','blood','tires','pallets','graffiti','fallen_sign']; // required in every 'looted' variant
const CP_STRUCT=['beam','rubble','tarp','scorch','wreck'];                                                                                          // required in every 'ruined' variant
function applyCondProps(B,t,lv){if(!B)return;if(PF(B).fz>16.3)return;t.variants[COND_NAMES[lv]].props.forEach(k=>CP[k](B))}

const FEAT={ // facade / silhouette components, local coords, front = +Z. All stay inside the plot.
 porch(B){const{g,d}=B,x=B.dx||0;mesh(BX(4.4,.06,2),0x7a6a5a,x,.03,d/2+1,g);mesh(BX(4.6,.15,2),0x4a3a2a,x,2.85,d/2+1,g);for(const s of[-1,1])mesh(BX(.18,2.8,.18),0xe8e4d8,x+s*2.1,1.4,d/2+1.85,g)},
 awning(B,o){const{g,d}=B,c=o.awn||[0xb91c1c,0xf1f1f1];for(let i=0;i<10;i++)mesh(BX(1.5,.1,1.7),c[i%2],-7.2+i*1.6,3.2,d/2+.8,g).rotation.x=.3},
 garage(B){const{g,w,d}=B,x=w/2-2.6;mesh(BX(4,2.7,.14),0xc8c8c0,x,1.35,d/2+.1,g);for(let i=0;i<4;i++)mesh(BX(3.8,.05,.05),0x999990,x,.5+i*.6,d/2+.2,g);flatM(4.4,2,0x6a6a68,x,.02,d/2+1,g)},
 balcony(B){const{g,d}=B;mesh(BX(5,.15,1.6),0x5a5a5a,-2,3.1,d/2+.8,g);mesh(BX(5,.8,.06),0x333333,-2,3.55,d/2+1.55,g)},
 chimney(B){const{g,w,h}=B;mesh(BX(1.1,3.2,1.1),0x7a3a2a,-w/4,h+2,-B.d/4,g);mesh(BX(1.3,.2,1.3),0x4a4a4a,-w/4,h+3.65,-B.d/4,g)},
 columns(B,o){const{g,d,h}=B,c=o.col||0xe8e4d8;for(let i=0;i<5;i++)mesh(new THREE.CylinderGeometry(.28,.28,3.6,10),c,-4+i*2,1.8,d/2+.9,g);mesh(BX(10.4,.3,2),c,0,3.75,d/2+.9,g);const pg=new THREE.CylinderGeometry(6,6,.4,3);pg.rotateX(-PI/2);pg.scale(1,1/6,1);mesh(pg,c,0,4.4,d/2+.9,g)},
 dome(B,o){const{g,h}=B;mesh(new THREE.CylinderGeometry(2.4,2.4,1.4,14),0xd8d4c8,0,h+.7,0,g);mesh(new THREE.SphereGeometry(2.4,14,8,0,PI*2,0,PI/2),o.dome||0x3a8a6a,0,h+1.4,0,g);mesh(BX(.12,1.2,.12),0xcccccc,0,h+4.4,0,g)},
 tower(B,o){const{g,d,h}=B,x=o.tx!==undefined?o.tx:-5,th=o.th||5;mesh(BX(3,th,3),o.tcol||B.c,x,h+th/2,d/2-1.8,g);mesh(new THREE.ConeGeometry(2.4,2,4),o.trc||0x3a3a42,x,h+th+1,d/2-1.8,g).rotation.y=PI/4;
  if(o.clock){const c=mesh(new THREE.CylinderGeometry(.9,.9,.1,16),0xf4f1e6,x,h+th-1.1,d/2-.25,g);c.rotation.x=PI/2}},
 tank(B){const{g}=B;for(const sx of[-1,1])for(const sz of[-1,1])mesh(BX(.25,6,.25),0x555555,-4.5+sx*1.4,B.h+3,-3.5+sz*1.4,g);mesh(new THREE.CylinderGeometry(2.2,2.2,3,14),0x8aa8b8,-4.5,B.h+7.5,-3.5,g);mesh(new THREE.ConeGeometry(2.3,1.2,14),0x6a8898,-4.5,B.h+9.6,-3.5,g)},
 silo(B){const{g,w,d}=B,x=-w/2+1.7,z=-d/2+1.7;mesh(new THREE.CylinderGeometry(1.7,1.7,9,12),0xb8b8b4,x,4.5,z,g);mesh(new THREE.SphereGeometry(1.7,12,6,0,PI*2,0,PI/2),0x8a8a88,x,9,z,g)},
 bays(B,o){const{g,d}=B,n=o.bays||2,c=o.bayc||0xa8321e;for(let i=0;i<n;i++){const x=(i-(n-1)/2)*(n>2?4.8:6.6);mesh(BX(4.2,3.4,.12),c,x,1.7,d/2+.1,g);for(let k=0;k<5;k++)mesh(BX(4,.05,.05),0x00000a,x,.5+k*.65,d/2+.19,g)}},
 marquee(B){const{g,d}=B;mesh(BX(7,1.1,.5),0xf8e4a0,0,3.4,d/2+.6,g);for(let i=0;i<9;i++){const m=mesh(BX(.2,.2,.1),0xfff7c0,-3.4+i*.85,3.4,d/2+.9,g);m.material.emissive.setHex(0x888844)}},
 walkway(B){const{g,w,d}=B;mesh(BX(w,.15,1.6),0x8a8a82,0,3.3,d/2+.8,g);mesh(BX(w,.7,.06),0x555555,0,3.7,d/2+1.55,g);for(let i=0;i<5;i++)mesh(BX(.15,3.3,.15),0x555555,-7.5+i*3.75,1.65,d/2+1.5,g);for(let i=0;i<5;i++)mesh(BX(.9,.5,.05),0xe8e0c0,-6+i*3,2.5,d/2+.09,g)},
 cross_sign(B,o){const{g,d,h}=B,c=o.cross||0x16a34a;mesh(BX(2,.5,.1),c,5.5,h-.8,d/2+.2,g);mesh(BX(.5,2,.1),c,5.5,h-.8,d/2+.2,g)},
 cupola(B){const{g,h}=B;mesh(BX(1.6,1.4,1.6),0xe8e4d8,0,h+.7,0,g);mesh(new THREE.ConeGeometry(1.3,1.3,4),0x4a4a52,0,h+2,0,g).rotation.y=PI/4},
 beacon(B){const m=mesh(BX(.6,.4,.6),0x2563eb,B.w/2-1.5,B.h+.6,0,B.g);m.material.emissive.setHex(0x1d3a9a)},
 neon(B,o){const{g,d}=B;mesh(BX(.2,5,.2),0x444444,-7.3,2.5,d/2+1,g);const m=mesh(BX(1.8,1.2,.2),o.neonc||0xff3a8a,-7.3,5.2,d/2+1,g);m.material.emissive.setHex(0x771133)},
 balls(B){const{g,d}=B;mesh(BX(2.4,.12,.12),0x444444,-6,3.6,d/2+.5,g);for(let i=0;i<3;i++)mesh(new THREE.SphereGeometry(.3,8,6),0xd4a017,-6.7+i*.7,2.9+(i===1?.35:0),d/2+.5,g)},
 mast(B){const{g}=B;mesh(new THREE.CylinderGeometry(.12,.12,12,6),0x555555,5.5,B.h+6,-3,g);mesh(BX(2.6,.1,.1),0x555555,5.5,B.h+10,-3,g);mesh(BX(1.8,.1,.1),0x555555,5.5,B.h+8.4,-3,g);for(const x of[-4,-1.8])mesh(BX(1.6,1.6,1.6),0x6a7a6a,x,B.h+.8,-4,g)},
 yardfence(B){const{g,w}=B;for(let i=0;i<6;i++)mesh(BX(.08,1.4,.08),0x555555,w/2+1.4,.7,-5+i*2,g);mesh(BX(.05,.06,10),0x555555,w/2+1.4,1.3,0,g);mesh(BX(.05,.06,10),0x555555,w/2+1.4,.5,0,g);mesh(BX(1.1,.8,1),0x8a5a3a,w/2+.9,.4,4.5,g)},
 xdoors(B){const{g,d,h}=B;for(const s of[-1,1]){mesh(BX(2.2,3.6,.12),0x8a2a22,s*1.15,1.8,d/2+.1,g);for(const r of[-1,1])mesh(BX(.12,4.2,.1),0xf4f4f0,s*1.15,1.8,d/2+.2,g).rotation.z=r*.5}mesh(BX(2.2,2,.12),0xf4f4f0,0,h-1.2,d/2+.1,g)},
 sawtooth(B){const{g,w,d,h}=B;for(let i=0;i<4;i++){const m=mesh(BX(w/4-.1,.12,d-1),0x8a8a86,-6+i*4,h+1.1,0,g);m.rotation.z=.5}},
 ribbon(B){const{g,w,d}=B;for(const y of[4.6,6.1]){const m=mesh(BX(w-1,.9,.05),0x6fa0c8,0,y,d/2+.17,g);m.material.transparent=true;m.material.opacity=.6}},
 loft(B){const{g,d,h}=B;mesh(BX(2.2,2.4,.12),0xf4f4f0,0,h-1.2,d/2+.12,g)}
};

// ------------------------------------------------------------ extra loot tables (existing item ids only; validated below)
Object.assign(LOOT_TABLES,{
 convenience:{colacola:3,citrol:3,popzi_soft_drink:3,sup_soft_drink:3,z_energy_drink:3,cheezholes:3,tweex:3,herkeys_jerkey:3,granola:2,fud:2,milk:2,ramen_noodles:2,painkiller:1,gauze:1},
 restaurant:{salad:3,lamburger:3,pizan_pasta:3,calzones:3,kenball_soup:3,bacon:2,sausages:2,pickles:2,milk:2,popzi_soft_drink:2,butcher_knife:1},
 bakery:{granola:3,brans:3,calzones:3,milk:2,tweex:2,cherry_preserves:2,peach_preserves:2,fud:1,butcher_knife:1},
 butcher:{bacon:4,sausages:4,salami:4,smoked_ham:2,herkeys_jerkey:3,butcher_knife:4,pickled_herring:1},
 liquor:{popzi_soft_drink:2,colacola:2,pickles:2,herkeys_jerkey:2,cheezholes:2,baseball_bat:1,bowling_ball:1,spray_paint:1,ammo_38_fed:1},
 sporting:{baseball_bat:4,bowling_ball:2,machete:2,rope:3,bungie_cord:3,water_jug:2,granola:2,military_rations:1,ammo_12_gauge:2,ammo_556:1,sickle:1,shotgun:1,model_70_safari:1,lee_enfield:1,bug_spray:2,duct_tape:2},
 pawn:{beretta_9mm:2,glock_22:1,m1911a1:1,colt_detective_special:1,katana:2,broadsword:1,machete:2,crowbar:2,car_battery:2,ammo_9mm:2,ammo_45:2,ammo_38_fed:1,butcher_knife:1},
 pharmacy:{cotton_balls:5,antibiotics:4,gauze:5,medical_tape:4,medkit:2,painkiller:6,bug_spray:1,water_jug:1},
 office:{duct_tape:3,painkiller:2,granola:2,water_jug:3,tweex:2,popzi_soft_drink:2,cotton_balls:1,spring:1,nails:1},
 laundromat:{spray_paint:1,bug_spray:2,popzi_soft_drink:2,colacola:2,cheezholes:2,tweex:2,rope:1,bungie_cord:2,duct_tape:1,spring:1},
 warehouse:{nails:3,rope:3,duct_tape:3,bungie_cord:3,gas_can:3,gas_cylinder:2,car_battery:2,spring:2,fire_hose:1,military_rations:2,water_jug:3,granola:2,kenball_soup:3,ramen_noodles:3},
 auto:{car_battery:5,gas_can:4,duct_tape:3,spring:3,bungie_cord:2,crowbar:3,nails:2,spray_paint:2,rope:1,fire_axe:1},
 motel:{cotton_balls:2,gauze:1,painkiller:2,ramen_noodles:2,popzi_soft_drink:2,tweex:2,cheezholes:2,water_jug:2,duct_tape:1,baseball_bat:1,crowbar:1},
 school:{granola:3,milk:3,tweex:2,painkiller:2,cotton_balls:2,gauze:2,baseball_bat:2,bowling_ball:1,spray_paint:1,rope:1,water_jug:2,fud:2},
 fire:{fire_axe:5,fire_hose:5,medkit:2,gauze:3,medical_tape:3,rope:3,gas_can:2,crowbar:3,water_jug:2,military_rations:1,duct_tape:2},
 police:{ammo_9mm:5,ammo_40:4,ammo_12_gauge:4,ammo_38_fed:3,glock_22:2,beretta_9mm:2,pump_shotgun:2,combat_shotgun:1,m4:1,mac10:1,gauze:2,medkit:1,painkiller:2,baseball_bat:2},
 townhall:{water_jug:2,granola:2,painkiller:1,duct_tape:2,rope:1,tweex:1,military_rations:1,cotton_balls:1},
 library:{duct_tape:1,painkiller:1,water_jug:2,granola:1,cotton_balls:1,bug_spray:1,spray_paint:1},
 cinema:{popzi_soft_drink:4,colacola:3,cheezholes:4,tweex:3,herkeys_jerkey:2,fud:3,granola:1,spray_paint:1},
 community:{water_jug:3,granola:3,kenball_soup:3,ramen_noodles:2,milk:2,medkit:1,gauze:2,painkiller:2,cotton_balls:2,baseball_bat:1,rope:1},
 funeral:{cotton_balls:3,gauze:2,painkiller:2,medical_tape:2,shovel:3,rope:3,nails:2,spray_paint:1,butcher_knife:1},
 vet:{cotton_balls:4,antibiotics:4,gauze:4,medical_tape:3,painkiller:3,medkit:1,water_jug:2,granola:1,rope:1,bug_spray:2},
 storage:{nails:3,rope:3,duct_tape:3,spring:2,gas_can:2,bungie_cord:3,car_battery:2,spray_paint:2,bug_spray:2,military_rations:1,water_jug:2,kenball_soup:2,ramen_noodles:2},
 barn:{pitchfork:3,shovel:3,sickle:3,rope:4,nails:2,milk:3,granola:2,salami:1,smoked_ham:1,cherry_preserves:2,peach_preserves:2,pickles:2,gas_can:2,machete:1,shotgun:2,ammo_12_gauge:2},
 utility:{car_battery:3,duct_tape:3,spring:2,nails:2,rope:2,fire_hose:1,gas_can:2,gas_cylinder:3,spray_paint:1,crowbar:2},
 water:{water_jug:6,rope:2,duct_tape:2,gas_can:1,nails:1,spring:1,bug_spray:1}});
for(const t in LOOT_TABLES)for(const id in LOOT_TABLES[t])if(!ITEMS[id])throw new Error('loot table '+t+' has unknown item '+id);
Object.assign(LOOT_PROP,{convenience:'pump_shelf',restaurant:'counter',bakery:'counter',butcher:'fridge',liquor:'cabinet',sporting:'toolchest',pawn:'cabinet',pharmacy:'cabinet',office:'cabinet',laundromat:'counter',auto:'toolchest',motel:'fridge',school:'cabinet',fire:'toolchest',police:'ammo_crate',townhall:'cabinet',library:'counter',cinema:'counter',community:'fridge',funeral:'cabinet',vet:'cabinet',utility:'toolchest'});

// ------------------------------------------------------------ generic data-driven builder for the new building types
function bGen(x,z,t){const o=t.gen,B=mk(x,z,STD.w,STD.d,o.h||4.5,o.wall,o.floor||0x8a8a82,o.door||0x3a3a3a),{w,d,h}=B,dx=o.dx!==undefined?o.dx:0,bd=o.bd!==undefined?o.bd:5,zq=o.split!==undefined?o.split:-1.5;B.dx=dx;
 shell(B,{f:[...fw(w,dx,o.ws||3.2),{k:'d',c:dx}],b:[...fw(w,bd,3.4),{k:'d',c:bd,s:-1}],l:fw(d,99,3.5),r:fw(d,99,3.5)});
 WL(B,1,zq,-w/2+.15,w/2-.15,[{k:'d',c:o.sd!==undefined?o.sd:-4.6},{k:'g',c:o.sg!==undefined?o.sg:3.4}],h,{th:.2,c:o.pc||0xcbbfae});
 const Fr=[-w/2+.15,w/2-.15,zq+.15,d/2-.15],Bk=[-w/2+.15,w/2-.15,-d/2+.15,zq-.15];
 (o.pr||[]).forEach(p=>put(B,p[0],p[1],p[2],p[3]||0));
 (o.tbl||[]).forEach(p=>{put(B,'table',p[0],p[1]);put(B,'chair',p[0]-.4,p[1]+.85,PI);put(B,'chair',p[0]+.4,p[1]+.85,PI);put(B,'chair',p[0]-.4,p[1]-.85);put(B,'chair',p[0]+.4,p[1]-.85)});
 if(o.fr)furn(B,o.fr,Fr);if(o.bk)furn(B,o.bk,Bk);
 rc(B,t.loot,Fr,o.nf||1);rc(B,t.loot,Bk,o.nb||1);
 roof(B,h,o.roof||'flat',o.rc||0x4a4a48);if(o.sign)sign(B,o.sign,o.sw||5);
 (o.feats||[]).forEach(f=>FEAT[f](B,o));junk(B,o.junk||5,Fr);const zz=o.z||[0,1];done(B,t.id,ri(zz[0],zz[1]))}
const BUILDERS={house:bHouse,clinic:bClinic,gun:bGun,gas:bGas,diner:bDiner,hard:bHard,mart:bMart,church:bChurch,gen:bGen};

// ------------------------------------------------------------ THE CATALOGUE (central, data-driven)
const CATALOGUE=[];
function def(id,name,category,builder,cfg,loot,i,l,r){CATALOGUE.push({id,name,category,builder,footprint:'standard',front:'south',w:STD.w,d:STD.d,loot,...cfg,variants:{intact:{props:i},looted:{props:l},ruined:{props:r}}})}
// ---- residential (all share the proven two-storey/single-storey house builder; hv = per-type design data)
def('small_detached_house','Small Detached House','residential','house',{hv:{two:false,walls:[0x8a7f73,0x7c8a73,0x73808a],roof:'gable'}},'house',['planters'],['trash','glass','boards'],['beam','rubble','tarp']);
def('two_storey_family_house','Two-Storey Family House','residential','house',{hv:{two:true,walls:[0xa09070,0x6f7f8f,0x8a8a7a],roof:'gable',feats:['chimney']}},'house',['bin','planters'],['glass','trash','mattress'],['scorch','beam','rubble']);
def('weatherboard_house','Weatherboard House','residential','house',{hv:{two:false,walls:[0xd8d4c4,0xb8c4c8,0xc9c0a8],roof:'gable',rcol:[0x4a5a6a,0x6a3a2a],feats:['porch']}},'house',['planters','bench'],['glass','crates','graffiti'],['tarp','rubble','beam']);
def('brick_suburban_house','Brick Suburban House','residential','house',{hv:{two:false,walls:[0x8a4a3a,0x7a3f32,0x94503c],roof:'gable',rcol:[0x3a3a42,0x4a3a2a],feats:['chimney']}},'house',['planters','flag'],['glass','trash','blood'],['scorch','rubble','beam']);
def('run_down_rental','Run-Down Rental Property','residential','house',{hv:{two:true,walls:[0x6a6a60,0x7a7468],roof:'flat',door:[0x2c4a5a,0x5a2c2c]}},'house',['bin'],['mattress','trash','graffiti'],['tarp','beam','rubble']);
def('rural_farmhouse','Rural Farmhouse','residential','house',{hv:{two:true,walls:[0xe8e0cc,0xd6d0b8],roof:'gable',rcol:[0x7a2a22,0x4a4a4a],feats:['porch']}},'house',['bench','planters'],['barrels','glass','crates'],['rubble','tarp','beam']);
def('small_bungalow','Small Bungalow','residential','house',{hv:{two:false,walls:[0xa8b89a,0xc4b08a],roof:'pyr',rcol:[0x6a3a2a,0x3a4a3a],feats:['porch']}},'house',['planters'],['trash','glass','bottles'],['scorch','rubble','tarp']);
def('older_traditional_house','Older Traditional House','residential','house',{hv:{two:true,walls:[0x6a5a4a,0x5a6a5a],roof:'pyr',rcol:[0x2a2a2a,0x3a2a2a],feats:['porch','chimney']}},'house',['bench','planters'],['papers','glass','graffiti'],['beam','tarp','rubble']);
def('modern_suburban_house','Modern Suburban House','residential','house',{hv:{two:true,walls:[0xe0e0dc,0x9aa0a6],roof:'flat',door:[0x222222],feats:['balcony']}},'house',['planters','bin'],['glass','trash','tires'],['scorch','rubble','beam']);
def('porch_house','House with Front Porch','residential','house',{hv:{two:false,walls:[0xc4b8a0,0x9aa89a],roof:'gable',feats:['porch']}},'house',['planters','bench'],['glass','crates','blood'],['beam','tarp','rubble']);
def('garage_house','House with Integrated Garage','residential','house',{hv:{two:false,garage:true,walls:[0xb0a898,0x8f9a8f],roof:'gable',feats:['garage']}},'house',['bin'],['tires','glass','trash'],['wreck','rubble','beam']);
def('abandoned_house','Abandoned House','residential','house',{hv:{two:false,walls:[0x5a5850,0x4a4a44],roof:'gable',rcol:[0x2a2a28],door:[0x2a2018]}},'house',['bin'],['mattress','graffiti','trash'],['beam','scorch','rubble']);
def('dilapidated_cottage','Dilapidated Cottage','residential','house',{hv:{two:false,walls:[0x6a6048,0x5a5a48],roof:'pyr',rcol:[0x3a2a1a],feats:['porch']}},'house',['bench'],['barrels','glass','papers'],['tarp','rubble','beam']);
// ---- commercial (legacy hand-built interiors re-fitted to the standard footprint)
def('grocery_store','Grocery Store','commercial','mart',{},'supermarket',['bin','flag'],['cart','trash','crates'],['rubble','beam','scorch']);
def('gas_station','Gas Station','commercial','gas',{},'gas',['bin','barrels'],['trash','tires','glass'],['wreck','scorch','rubble']);
def('diner','Diner','commercial','diner',{},'diner',['planters','bin'],['trash','glass','bottles'],['scorch','beam','tarp']);
def('hardware_store','Hardware Store','commercial','hard',{},'hardware',['pallets','bin'],['pallets','crates','glass'],['beam','rubble','tarp']);
def('gun_shop','Gun Shop','commercial','gun',{},'gunshop',['bin'],['glass','blood','crates'],['scorch','rubble','beam']);
def('medical_clinic','Medical Clinic','commercial','clinic',{},'clinic',['planters','bench'],['papers','glass','blood'],['rubble','tarp','beam']);
// ---- commercial (new, generic data-driven builder)
const SHELVES=[['shelf','w',.5],['shelf','e',.5]],OFFICE=[['desk','n',.2],['desk','n',.5],['desk','n',.8],['desk','s',.3],['desk','s',.7],['shelf','w',.5],['plant','e',.1]],CELLS=[['cot','n',.5],['toilet','w',.9]];
def('convenience_store','Convenience Store','commercial','gen',{gen:{h:4,wall:0xd8d0b8,loot:'convenience',sign:'QUIK MART',sw:6,feats:['awning'],awn:[0x1d4ed8,0xf1f1f1],pr:[['aisle',-3.2,2.4],['aisle',-3.2,-.2],['aisle',.4,2.4],['aisle',.4,-.2],['register',-5.8,5.6]],fr:[['freezer','e',.2],['freezer','e',.55]],bk:[['crate','n',.2],['shelf','w',.5],['crate','n',.7],['box','s',.5]]}},'convenience',['bin','bench'],['trash','glass','bottles'],['scorch','rubble','tarp']);
def('restaurant','Restaurant','commercial','gen',{gen:{h:4.5,wall:0x8a3a2a,loot:'restaurant',sign:'BISTRO',feats:['awning'],awn:[0x7f1d1d,0xf1f1f1],split:-2.5,tbl:[[-4,3.8],[0,3.8],[4,3.8],[-4,.6],[0,.6],[4,.6]],bk:[['stove','n',.2],['stove','n',.5],['fridge','n',.95],['counter','s',.4],['sink','e',.6]]}},'restaurant',['planters','bin'],['trash','glass','bottles'],['scorch','beam','rubble']);
def('bakery','Bakery','commercial','gen',{gen:{h:4,wall:0xe8d8b8,roof:'gable',rc:0x8a5a3a,loot:'bakery',sign:'BAKERY',feats:['awning','chimney'],awn:[0xe8a0b0,0xf8f0e0],fr:[['counter','w',.35],['shelf','e',.3],['shelf','e',.7],['plant','n',.1],['register','w',.8]],bk:[['stove','n',.3],['stove','n',.6],['counter','s',.5],['crate','e',.5]]}},'bakery',['planters','bench'],['flour','trash','glass'],['scorch','beam','tarp']);
def('butcher_shop','Butcher Shop','commercial','gen',{gen:{h:4,wall:0xd8d8d0,loot:'butcher',sign:'BUTCHER',feats:['awning'],awn:[0x991b1b,0xf1f1f1],fr:[['freezer','n',.15],['freezer','n',.55],['counter','w',.7],['register','e',.8]],bk:[['freezer','n',.2],['freezer','n',.6],['counter','s',.5]]}},'butcher',['bin'],['blood','trash','glass'],['scorch','rubble','beam']);
def('liquor_store','Liquor Store','commercial','gen',{gen:{h:4,wall:0x3a3a4a,loot:'liquor',sign:'LIQUOR',feats:['neon'],neonc:0x22d3ee,pr:[['aisle',-3.4,2.6],['aisle',0,2.6],['aisle',3.4,2.6],['register',5.6,5.4]],fr:SHELVES,bk:[['crate','n',.2],['crate','n',.5],['shelf','e',.5]]}},'liquor',['bin'],['bottles','glass','trash'],['scorch','rubble','tarp']);
def('sporting_goods','Sporting Goods Shop','commercial','gen',{gen:{h:4.5,wall:0x2f5a8a,loot:'sporting',sign:'SPORTS',sw:6,feats:['awning'],awn:[0xea580c,0x1f2937],fr:[['rack','w',.3],['rack','w',.7],['rack','e',.3],['rack','e',.7],['bench','n',.5]],pr:[['register',-1,5.5],['counter',1.4,5.4]],bk:[['crate','n',.2],['crate','n',.6],['shelf','w',.5],['box','s',.3]]}},'sporting',['bench','flag'],['crates','trash','glass'],['rubble','beam','scorch']);
def('pawn_shop','Pawn Shop','commercial','gen',{gen:{h:4,wall:0x6a5a4a,loot:'pawn',sign:'PAWN',feats:['balls','neon'],neonc:0xfacc15,fr:[['rack','w',.3],['rack','e',.3],['counter','n',.5],['shelf','e',.8]],pr:[['counter',-2,3],['register',-3,3.2]],bk:[['crate','n',.2],['shelf','w',.5],['shelf','e',.5],['box','s',.5]]}},'pawn',['bin'],['glass','blood','graffiti'],['scorch','beam','rubble']);
def('pharmacy','Pharmacy','commercial','gen',{gen:{h:4.2,wall:0xe8eef0,loot:'pharmacy',sign:'PHARMACY',sw:6,feats:['cross_sign','awning'],awn:[0x16a34a,0xf1f1f1],fr:[['shelf','w',.3],['shelf','w',.7],['shelf','e',.3],['shelf','e',.7],['plant','n',.1]],pr:[['counter',0,3.6],['register',-.6,3.8]],bk:RM.pharm}},'pharmacy',['planters','bench'],['papers','glass','trash'],['scorch','rubble','tarp']);
def('small_office','Small Office Building','commercial','gen',{gen:{h:7,wall:0x8a97a3,loot:'office',sign:'OFFICES',sw:6,feats:['ribbon'],fr:OFFICE,bk:[['desk','n',.2],['desk','n',.7],['shelf','w',.5],['plant','e',.5]],ws:3.4}},'office',['planters','flag'],['papers','glass','trash'],['beam','scorch','rubble']);
def('laundromat','Laundromat','commercial','gen',{gen:{h:4,wall:0x6aa0b0,loot:'laundromat',sign:'LAUNDRY',sw:5,feats:['awning'],awn:[0x2563eb,0xf1f1f1],fr:[['freezer','n',.15],['freezer','n',.5],['freezer','n',.85],['bench','s',.3],['bench','s',.7],['plant','w',.5]],bk:[['box','n',.3],['crate','e',.5],['shelf','w',.5]]}},'laundromat',['bin','bench'],['trash','glass','papers'],['rubble','scorch','tarp']);
def('warehouse','Warehouse','commercial','gen',{gen:{h:6.5,wall:0x7a7f84,loot:'warehouse',sign:'WAREHOUSE',sw:7,feats:['bays','sawtooth'],bays:2,bayc:0x5a6068,dx:6.6,split:-3,fr:[['crate','n',.1],['crate','n',.4],['lumber','w',.5],['shelf','e',.3],['shelf','e',.7],['crate','s',.5]],bk:[['crate','n',.1],['crate','n',.5],['crate','n',.9],['lumber','w',.5],['shelf','e',.5]],z:[1,2],nb:2}},'warehouse',['pallets'],['crates','pallets','trash'],['beam','rubble','tarp']);
def('auto_repair','Auto Repair Shop','commercial','gen',{gen:{h:4.5,wall:0xb8b0a0,loot:'auto',sign:'AUTO',feats:['bays'],bays:2,dx:6.6,fr:[['rack','w',.4],['rack','e',.4],['bench','n',.5],['crate','s',.2]],bk:[['shelf','w',.5],['shelf','e',.5],['crate','n',.5],['box','s',.5]],pr:[['crate',-4,2],['box',3,2.2]]}},'auto',['tires','barrels'],['tires','crates','trash'],['wreck','scorch','beam']);
def('small_motel','Small Motel','commercial','gen',{gen:{h:3.6,wall:0xd8c8a8,loot:'motel',sign:'MOTEL',sw:6,feats:['walkway','neon'],neonc:0xef4444,fr:[['bed','w',.3],['bed','e',.3],['wardrobe','n',.5],['tv','s',.5],['desk','e',.8]],bk:[['bed','n',.3],['bed','n',.75],['bath','w',.9],['toilet','e',.9]]}},'motel',['bin','bench'],['mattress','trash','glass'],['scorch','rubble','beam']);
// ---- civic / public / special
def('church','Church','civic','church',{},'church',['planters','flag'],['trash','glass','graffiti'],['rubble','beam','scorch']);
def('small_school','Small School','civic','gen',{gen:{h:4.5,wall:0xb5784f,loot:'school',sign:'SCHOOL',feats:['cupola'],fr:[['desk','n',.2],['desk','n',.5],['desk','n',.8],['desk','s',.3],['desk','s',.7],['shelf','w',.5]],bk:[['desk','n',.25],['desk','n',.55],['desk','n',.85],['shelf','e',.5],['plant','s',.1]]}},'school',['flag','bench'],['papers','books','graffiti'],['beam','rubble','scorch']);
def('fire_station','Fire Station','civic','gen',{gen:{h:5,wall:0xa83a2a,loot:'fire',sign:'FIRE DEPT',sw:6,feats:['bays','tower'],bays:2,dx:6.6,tx:-5.8,th:5,tcol:0x8a2a1e,trc:0x333333,fr:[['rack','w',.3],['rack','e',.3],['crate','n',.5],['bench','s',.2]],bk:[['cot','n',.2],['cot','n',.5],['cot','n',.8],['wardrobe','s',.5]]}},'fire',['flag'],['crates','glass','trash'],['rubble','scorch','beam']);
def('police_station','Police Station','civic','gen',{gen:{h:4.5,wall:0x5a6a8a,loot:'police',sign:'POLICE',feats:['beacon'],fr:[['counter','n',.5],['bench','s',.2],['bench','s',.8],['desk','e',.5],['plant','w',.1]],bk:[['cot','w',.2],['toilet','n',.1],['desk','n',.5],['desk','e',.7],['rack','e',.3]]}},'police',['flag','bin'],['papers','glass','blood'],['scorch','beam','rubble']);
def('town_hall','Town Hall','civic','gen',{gen:{h:5.5,wall:0xd8d0b8,loot:'townhall',feats:['columns','dome'],dome:0x3a8a6a,fr:[['counter','n',.5],['bench','s',.2],['bench','s',.8],['plant','w',.1],['plant','e',.1]],bk:OFFICE,ws:3.4}},'townhall',['flag','planters'],['papers','glass','trash'],['beam','rubble','scorch']);
def('library','Library','civic','gen',{gen:{h:5,wall:0x8a5a3a,roof:'gable',rc:0x3a4a5a,loot:'library',sign:'LIBRARY',pr:[['aisle',-4.5,2.4],['aisle',-1.5,2.4],['aisle',1.5,2.4],['aisle',-4.5,-.4],['aisle',-1.5,-.4],['aisle',1.5,-.4],['counter',5.2,3.6]],fr:[['desk','e',.8],['plant','w',.1]],bk:[['desk','n',.3],['shelf','w',.5],['shelf','e',.5],['shelf','n',.8]]}},'library',['bench','planters'],['books','papers','glass'],['tarp','beam','rubble']);
def('cinema','Cinema','civic','gen',{gen:{h:6.5,wall:0x3a2a4a,loot:'cinema',sign:'CINEMA',feats:['marquee'],pr:[['counter',-4,5.2],['register',-6,5.3]],fr:[['plant','e',.1]],tbl:[],bk:[['bench','n',.2],['bench','n',.5],['bench','n',.8],['bench','s',.3],['bench','s',.7],['crate','e',.5]],split:-.5}},'cinema',['bench'],['trash','glass','papers'],['scorch','beam','rubble']);
def('community_centre','Community Centre','civic','gen',{gen:{h:4.5,wall:0xc9b48a,roof:'gable',rc:0x5a4a3a,loot:'community',sign:'COMMUNITY',sw:7,feats:['porch'],tbl:[[-4,3.6],[0,3.6],[4,3.6]],bk:RM.kitchen}},'community',['bench','flag'],['trash','glass','crates'],['beam','tarp','rubble']);
def('funeral_home','Funeral Home','civic','gen',{gen:{h:4.5,wall:0xe0dcd0,roof:'gable',rc:0x3a3a42,loot:'funeral',sign:'FUNERAL HOME',sw:8,feats:['porch'],fr:[['bench','s',.2],['bench','s',.8],['plant','w',.1],['plant','e',.1]],bk:[['cot','n',.3],['cot','n',.7],['shelf','w',.5],['box','s',.5]],pr:[['altar',0,2.2]]}},'funeral',['planters','flag'],['trash','glass','blood'],['rubble','beam','scorch']);
def('veterinary_clinic','Veterinary Clinic','civic','gen',{gen:{h:4,wall:0xb8d4c0,roof:'gable',rc:0x4a6a5a,loot:'vet',sign:'VET',feats:['yardfence','cross_sign'],cross:0x2563eb,fr:RM.wait,bk:RM.exam}},'vet',['planters','bench'],['papers','glass','blood'],['tarp','rubble','beam']);
def('storage_building','Storage Building','civic','gen',{gen:{h:4,wall:0x8a8f94,loot:'storage',sign:'SELF STORAGE',sw:8,feats:['bays'],bays:3,bayc:0xea7a1a,dx:-6.8,fr:[['crate','n',.1],['crate','n',.4],['crate','n',.7],['box','s',.5],['shelf','w',.5]],bk:[['crate','n',.1],['crate','n',.4],['crate','n',.7],['shelf','e',.5],['box','s',.4]]}},'storage',['pallets'],['crates','trash','pallets'],['rubble','tarp','beam']);
def('barn','Barn','civic','gen',{gen:{h:6,wall:0x8a2a22,roof:'gable',rc:0x4a4a4a,loot:'barn',feats:['xdoors','silo','loft'],split:-3,fr:[['lumber','w',.5],['crate','e',.3],['crate','e',.7],['box','s',.5]],bk:[['lumber','n',.3],['crate','n',.7],['shelf','w',.5],['crate','e',.5]],pr:[['crate',-3,2.6]]}},'barn',['barrels','pallets'],['crates','barrels','trash'],['beam','tarp','rubble']);
def('utility_building','Utility Building','civic','gen',{gen:{h:4,wall:0x7a8088,loot:'utility',sign:'POWER CO',sw:5,feats:['mast'],fr:[['crate','n',.2],['shelf','w',.5],['shelf','e',.5],['rack','s',.5]],bk:[['crate','n',.2],['crate','n',.6],['shelf','e',.5],['box','s',.5]]}},'utility',['barrels'],['trash','crates','tires'],['scorch','beam','rubble']);
def('water_tower','Water Tower','civic','gen',{gen:{h:4,wall:0x9aa0a8,loot:'water',sign:'WATER',sw:4,feats:['tank'],fr:[['crate','n',.2],['crate','e',.5],['shelf','w',.5]],bk:[['crate','n',.3],['box','n',.7],['shelf','e',.5],['rack','w',.5]]}},'water',['barrels'],['barrels','trash','crates'],['rubble','beam','scorch']);

function validateCatalogue(cat=CATALOGUE){const E=[],ids=new Set(),CATS=['residential','commercial','civic'];
 if(!Array.isArray(cat)||cat.length<40)E.push('catalogue too small ('+(cat&&cat.length)+')');
 for(const d of cat){const n=d&&d.id||'(unnamed)';
  if(!d.id||!/^[a-z][a-z0-9_]*$/.test(d.id))E.push(n+': bad id');if(ids.has(d.id))E.push(n+': duplicate id');ids.add(d.id);
  if(!d.name)E.push(n+': missing name');if(!CATS.includes(d.category))E.push(n+': bad category');
  if(d.footprint!=='standard'||d.w!==STD.w||d.d!==STD.d)E.push(n+': must use the standard footprint');
  if(d.front!==AUTHORED_FRONT)E.push(n+': designated front must be "'+AUTHORED_FRONT+'" (the authoring direction)');
  if(!BUILDERS[d.builder])E.push(n+': unknown builder '+d.builder);
  if(d.builder==='gen'&&!d.gen)E.push(n+': missing gen config');if(d.builder==='house'&&!d.hv)E.push(n+': missing hv config');
  if(!LOOT_TABLES[d.loot])E.push(n+': unknown loot table '+d.loot);
  if(d.gen){const fe=d.gen.feats||[];fe.forEach(f=>{if(!FEAT[f])E.push(n+': unknown feature '+f)})}if(d.hv&&d.hv.feats)d.hv.feats.forEach(f=>{if(!FEAT[f])E.push(n+': unknown feature '+f)});
  const ks=d.variants?Object.keys(d.variants):[];if(ks.length!==3||COND_NAMES.some(c=>!d.variants||!d.variants[c]))E.push(n+': needs exactly the variants '+COND_NAMES.join('/'));
  for(const c of COND_NAMES){const v=d.variants&&d.variants[c];if(!v||!Array.isArray(v.props)){E.push(n+': variant '+c+' has no props list');continue}v.props.forEach(p=>{if(!CP[p])E.push(n+': '+c+' uses unknown prop '+p)})}
  if(d.variants&&d.variants.looted&&d.variants.ruined&&d.variants.intact){const L=d.variants.looted.props,R=d.variants.ruined.props;
   if(L.length<2||R.length<2)E.push(n+': looted/ruined need at least 2 condition props');if(!L.some(p=>CP_DISTURB.includes(p)))E.push(n+': looted variant has no scavenging/disturbance prop');
   if(!R.some(p=>CP_STRUCT.includes(p)))E.push(n+': ruined variant has no structural-damage prop');if(L.some(p=>CP_STRUCT.includes(p)))E.push(n+': looted variant must not carry structural-damage props');
   if(L.join()===R.join())E.push(n+': looted and ruined variants are identical')}}
 return E}
{const e=validateCatalogue();window.__catalogueErrors=e;if(e.length){const m='BUILDING CATALOGUE INVALID — refusing to start:\n'+e.join('\n');console.error(m);const b=document.createElement('pre');b.style.cssText='position:fixed;z-index:99999;inset:10px;background:#300;color:#fdd;padding:12px;overflow:auto;font:12px monospace';b.textContent=m;document.body.appendChild(b);throw new Error(m)}}

// ------------------------------------------------------------ rendering: roads, alleys, plots
function drawStreets(L){const R=GRID.ROAD,F=(w,d,c,x,z,y)=>{const m=mesh(new THREE.PlaneGeometry(w,d),c,x,y,z);m.rotation.x=-PI/2;return m};
 L.roads.forEach(r=>F(r.x1-r.x0,r.z1-r.z0,0x2a2d33,(r.x0+r.x1)/2,(r.z0+r.z1)/2,.01));
 L.alleys.forEach(r=>F(r.x1-r.x0,r.z1-r.z0,0x222429,(r.x0+r.x1)/2,(r.z0+r.z1)/2,.012));
 const dg=new THREE.PlaneGeometry(2.4,.16),dm=new THREE.MeshStandardMaterial({color:0xd9b82a,roughness:.9}),ck=new THREE.MeshStandardMaterial({color:0x14161a,roughness:1});
 /* v056: markings are batched into one mesh per material, kept out of perf's merge (kind 'mark') and drawn with a strong depth bias:
    the long perimeter roads are unmerged and carry their own polygonOffset, which beat the 1 cm lift of merged dashes beyond a few metres */
 const MK=new Map(),mkO=new THREE.Object3D(),mkAdd=(geo,mat,x,y,z,rx,rz)=>{let a=MK.get(mat);if(!a)MK.set(mat,a=[]);mkO.position.set(x,y,z);mkO.rotation.set(rx,0,rz);mkO.updateMatrix();const g=geo.index?geo.toNonIndexed():geo.clone();g.applyMatrix4(mkO.matrix);a.push(g)};
 const mkFlush=()=>{for(const [mat,gs] of MK){let n=0;for(const g of gs)n+=g.attributes.position.count;const P=new Float32Array(n*3),N=new Float32Array(n*3);let o=0;for(const g of gs){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);o+=g.attributes.position.count;g.dispose()}
   const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.BufferAttribute(P,3));bg.setAttribute('normal',new THREE.BufferAttribute(N,3));bg.computeBoundingSphere();
   mat.polygonOffset=true;mat.polygonOffsetFactor=-8;mat.polygonOffsetUnits=-16;const m=new THREE.Mesh(bg,mat);m.receiveShadow=true;m.userData={kind:'mark'};m.raycast=()=>{};scene.add(m)}};
 const dash=(x,z,ry)=>mkAdd(dg,dm,x,.022,z,-PI/2,ry),vs=L.roads.filter(r=>r.kind.includes('vertical')||r.kind.endsWith('west')||r.kind.endsWith('east'));
 const hz=[...new Set(L.roads.filter(r=>r.kind.includes('horizontal')||r.kind==='perimeter-north'||r.kind==='perimeter-south').map(r=>(r.z0+r.z1)/2))];
 for(const r of L.roads){const horiz=(r.x1-r.x0)>(r.z1-r.z0);if(horiz){const zc=(r.z0+r.z1)/2;for(let x=r.x0+3;x<r.x1-3;x+=5.4){if(vs.some(v=>x+1.2>v.x0-1&&x-1.2<v.x1+1))continue;dash(x+1.2,zc,0)}}
  else{const xc=(r.x0+r.x1)/2;for(let z=r.z0+3;z<r.z1-3;z+=5.4){if(z-r.z0<R*.7||r.z1-z<R*.7)continue;dash(xc,z+1.2,PI/2)}}}
 const areas=L.roads.map(r=>(r.x1-r.x0)*(r.z1-r.z0)),tot=areas.reduce((a,b)=>a+b,0);
 const pickRoad=()=>{let k=Math.random()*tot;for(let i=0;i<areas.length;i++){if((k-=areas[i])<=0)return L.roads[i]}return L.roads[0]};
 for(let i=0;i<46;i++){const r=pickRoad(),cg=new THREE.PlaneGeometry(rnd(1.5,4),.05),ca=rnd(0,3.1);mkAdd(cg,ck,rnd(r.x0+.5,r.x1-.5),.016,rnd(r.z0+.5,r.z1-.5),-PI/2,ca)}
 for(let i=0;i<12;i++){const r=pickRoad();mkAdd(new THREE.CircleGeometry(rnd(.45,1),10),ck,rnd(r.x0+1.5,r.x1-1.5),.017,rnd(r.z0+1.5,r.z1-1.5),-PI/2,0)}
 mkFlush();
 for(const a of L.alleys){const zc=(a.z0+a.z1)/2;for(let k=0;k<2;k++){const x=rnd(a.x0+6,a.x1-6),side=Math.random()<.5?-1:1,d=mesh(BX(2,1.3,1.1),0x2f4f3a,x,.65,zc+side*1.3);d.rotation.y=rnd(-.15,.15);addSolid(d);mesh(BX(2.1,.1,1.2),0x1f3a2a,x,1.35,zc+side*1.3)}
  for(let k=0;k<7;k++){const m=mesh(new THREE.IcosahedronGeometry(.3,0),PK([0x1c2a1c,0x222222,0x3a3a2a]),rnd(a.x0+1,a.x1-1),.2,zc+rnd(-1.4,1.4));m.scale.set(1,.7,1)}
  for(let k=0;k<4;k++){const m=mesh(BX(.5,.4,.4),0x8a6a3a,rnd(a.x0+2,a.x1-2),.2,zc+rnd(-1.5,1.5));m.rotation.y=rnd(0,3)}}}
function drawPlot(p,cat){const F=(w,d,c,x,z,y)=>{const m=mesh(new THREE.PlaneGeometry(w,d),c,x,y,z);m.rotation.x=-PI/2;return m};
 F(GRID.PW,GRID.PD,{residential:0x2d3b26,commercial:0x3b3c3e,civic:0x3a4036}[cat],p.cx,p.cz,.008);F(GRID.PW,1.6,0x585a5d,p.cx,p.front==='north'?p.z0+.8:p.z1-.8,.016)}

// ===== v036 block begins =====

// ===================================================================================================================
//  v036 — AUTHENTIC PROPERTY CATALOGUE (INTACT PHASE) + DUAL SUB-PLOT MAP GENERATOR
//  The legacy v032 catalogue (CATALOGUE / planTownLegacy / townLegacy) is QUARANTINED below: preserved, never selected.
//  Zones (per 40x36 plot, front = +Z in building-local space): frontage ~15-20%, structure ~60-70%, rear service ~15-20%.
//  HALF lot (sub-plot 20x36): building 16x22 centred -> 7m frontage / 7m rear.  BIG lot (40x36): building 30x23 -> 6.5m / 6.5m.
// ===================================================================================================================
const HALFD=Object.freeze({w:16,d:22,fz:7,rz:7}),BIGD=Object.freeze({w:30,d:23,fz:6.5,rz:6.5});
const WX=(B,l)=>B.x+B.cs*l,WZ=(B,l)=>B.z+B.cs*l;
const wins=a=>a.map(c=>({k:'w',c}));
const slab=(B,x0,x1,z0,z1,y0,y1,col,walk)=>{const m=mesh(BX(x1-x0,y1-y0,z1-z0),col,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,B.g);const b=addSolid(m);if(walk)walkables.push(b);return m};
const deco=(B,w,h,d,x,y,z,col,em)=>{const m=mesh(BX(w,h,d),col,x,y,z,B.g);if(em)m.material.emissive.setHex(em);return m};
const cyl=(B,r,h,x,y,z,col,solid,seg=10)=>{const m=mesh(new THREE.CylinderGeometry(r,r,h,seg),col,x,y,z,B.g);if(solid)addSolid(m);return m};
function tsign(par,txt,x,y,z,w,h,bg,fg,font,ry=0){const key=[txt,Math.max(32,Math.round(512*h/w)),bg,fg,font||'','v43'].join('|');let mt=TSC.get(key);
 if(!mt){const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.max(48,Math.round(1024*h/w));const q=cv.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,cv.width,cv.height);q.fillStyle=fg;
  const fm=font||'bold 72px Impact,sans-serif',mm=fm.match(/(\d+)px/);let sz=Math.min(mm?+mm[1]*2:144,Math.floor(cv.height*.72));const setF=()=>{q.font=fm.replace(/\d+px/,sz+'px')};setF();while(q.measureText(txt).width>cv.width*.94&&sz>16){sz-=2;setF()}
  q.textAlign='center';q.textBaseline='middle';q.fillText(txt,cv.width/2,cv.height/2+sz*.04);mt=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv)});TSC.set(key,mt)}
 if(w>=3&&h>=.8&&y>=4&&z>10.5&&z<13){w*=1.25;h*=1.25;z+=.3}
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mt);m.position.set(x,y,z);m.rotation.y=ry;par.add(m);return m}
function glassP(B,x,y,z,w,h,ry=0){const m=mesh(BX(w,h,.08),0x9cc8e8,x,y,z,B.g);m.rotation.y=ry;m.material.transparent=true;m.material.opacity=.3;m.material.depthWrite=false;addSolid(m);return m}
function stairs(B,x,zFrom,dz,n,rise,run,wid,col){for(let i=0;i<n;i++){const a=zFrom+dz*i*run,b=zFrom+dz*(i+1)*run;slab(B,x-wid/2,x+wid/2,Math.min(a,b),Math.max(a,b),0,(i+1)*rise,col||0x8a8a82,true)}}
function subB(B,lx,lz,w,d,h,wall,fl,dc,flip){const cs0=CUR.cs;CUR.cs=flip?-B.cs:B.cs;const S=mk(WX(B,lx),WZ(B,lz),w,d,h,wall,fl,dc);CUR.cs=cs0;return S}

Object.assign(FT,{
 stan:[1.6,.3,[[.1,1,.1,-.7,.5,0,0xc8a020],[.1,1,.1,.7,.5,0,0xc8a020],[1.4,.04,.04,0,.95,0,0xaa2020]],1],
 safe:[1,1,[[1,1.2,1,0,.6,0,0x3a3a40],[.5,.5,.05,0,.7,.52,0x8a8a90]]],
 vault:[2.4,.6,[[2.4,2.3,.6,0,1.15,0,0x4a4f55],[2.2,.08,.62,0,.5,0,0x8a8f95],[2.2,.08,.62,0,1.1,0,0x8a8f95],[2.2,.08,.62,0,1.7,0,0x8a8f95]]],
 machine:[1,.9,[[1,1.8,.9,0,.9,0,0xaa2222],[.7,.6,.05,0,1.2,.47,0x88ccee]]],
 washer:[.9,.8,[[.9,.95,.8,0,.47,0,0xe5e7eb],[.5,.5,.05,0,.55,.42,0x223344]]],
 dryer:[.9,.8,[[.9,.95,.8,0,.47,0,0xc9d2d8],[.5,.5,.05,0,.55,.42,0x442222]]],
 manne:[.6,.6,[[.3,1.4,.2,0,.8,0,0xe8d8c8],[.22,.22,.22,0,1.65,0,0xe8d8c8],[.45,.6,.28,0,1.2,0,0x8a3a6a],[.5,.05,.5,0,.03,0,0x222222]]],
 mirror:[1,.12,[[1,2,.08,0,1.1,0,0xaed4ea]]],
 locker:[.9,.9,[[.9,2.2,.9,0,1.1,0,0x5a6a7a],[.7,.9,.05,0,1.1,.46,0x7a8a9a]]],
 hood:[1.8,.9,[[1.8,.5,.9,0,2.5,0,0x9a9a9a]],1],
 prack:[3,1.1,[[.12,4,.12,-1.45,2,-.5,0x2a4a8a],[.12,4,.12,-1.45,2,.5,0x2a4a8a],[.12,4,.12,1.45,2,-.5,0x2a4a8a],[.12,4,.12,1.45,2,.5,0x2a4a8a],[3,.1,1.1,0,.9,0,0xe08a1a],[3,.1,1.1,0,2.1,0,0xe08a1a],[3,.1,1.1,0,3.3,0,0xe08a1a],[.9,.7,.8,-.8,1.3,0,0xa08050],[.9,.7,.8,.8,2.5,0,0xa08050]]],
 forklift:[1.6,2.6,[[1.4,.8,2,0,.7,0,0xe0a010],[1.2,1.1,1,0,1.4,.2,0x333333],[.12,2.6,.12,-.5,1.3,-.9,0x555555],[.12,2.6,.12,.5,1.3,-.9,0x555555],[.08,.06,1.2,-.4,.2,-1.7,0x777777],[.08,.06,1.2,.4,.2,-1.7,0x777777]]],
 lane:[1.6,10,[[1.5,.05,10,0,.08,0,0xd8b070],[.12,.06,10,-.8,.08,0,0x333333],[.12,.06,10,.8,.08,0,0x333333]],1],
 pinrow:[1.5,.8,[[1.5,1.2,.8,0,.6,0,0x2a2a30],[.14,.4,.14,-.45,1.4,0,0xf0f0f0],[.14,.4,.14,0,1.4,0,0xf0f0f0],[.14,.4,.14,.45,1.4,0,0xf0f0f0]]],
 arcade:[.9,.8,[[.9,1.8,.8,0,.9,0,0x3a2a6a],[.7,.5,.05,0,1.3,.4,0x55ffaa]]],
 bin2:[1,1,[[.8,.9,.8,0,.45,0,0x555a55]]],
 ladder:[.8,.2,[[.1,3,.1,-.35,1.5,0,0xd08a20],[.1,3,.1,.35,1.5,0,0xd08a20],[.7,.06,.06,0,.5,0,0xd08a20],[.7,.06,.06,0,1.2,0,0xd08a20],[.7,.06,.06,0,1.9,0,0xd08a20]]],
 monitor:[1.2,.7,[[1.2,.75,.7,0,.38,0,0x6a6a72],[.6,.4,.05,0,1.0,-.1,0x111122]]],
 servrack:[.9,.9,[[.9,2.1,.9,0,1.05,0,0x2a2a30],[.7,.1,.05,0,.6,.46,0x33ff66],[.7,.1,.05,0,1.1,.46,0x3366ff],[.7,.1,.05,0,1.6,.46,0x33ff66]]],
 ccase:[2.2,.9,[[2.2,1,.9,0,.5,0,0x8a8a8a],[2.1,.06,.8,0,1.03,0,0xb8d8e8],[2.1,.04,.7,0,.6,0,0xb8d8e8]]],
 gunrack:[1.8,.3,[[1.8,1.8,.1,0,1.2,0,0x2a2420],[1.5,.08,.3,0,1.9,.15,0x111111],[1.5,.08,.3,0,1.3,.15,0x111111]]],
 workbench:[2.2,.9,[[2.2,.9,.9,0,.45,0,0x5a4a3a],[.4,.15,.5,-.6,1,0,0x777777]]],
 slicer:[.8,.6,[[.6,.3,.5,0,1.1,0,0xcccccc]]],
 cutblock:[1,1,[[1,.9,1,0,.45,0,0x6a4a2a]]],
 key:[1,.2,[[1,1,.1,0,1.4,0,0x6a5a3a]],1],
 hbin:[1.2,.8,[[1.2,.5,.8,0,.25,0,0xb0b0aa],[1.1,.15,.7,0,.6,0,0x777777]]],
 fryer:[.8,.8,[[.8,.9,.8,0,.45,0,0xaaaaaa],[.6,.12,.6,0,.95,0,0xe0a020]]],
 grave:[1.2,.4,[[1.2,1.2,.3,0,.6,0,0x8a8a88]]]
});
Object.assign(LOOT_TABLES,{
 bank:{painkiller:2,granola:2,water_jug:2,duct_tape:2,medkit:1,ammo_9mm:2,ammo_45:1,beretta_9mm:1,m1911a1:1},
 bankvault:{ammo_9mm:3,ammo_45:3,ammo_38_fed:2,ammo_357:2,beretta_9mm:2,m1911a1:2,glock_22:1,colt_python:1,military_rations:2,medkit:2},
 coffee:{milk:3,granola:3,tweex:2,brans:2,cherry_preserves:1,popzi_soft_drink:1,calzones:2,fud:1},
 takeout:{ramen_noodles:3,pickles:2,salad:2,sausages:2,bacon:1,popzi_soft_drink:2,butcher_knife:1,kenball_soup:2},
 clothing:{rope:2,duct_tape:2,bungie_cord:2,spray_paint:1,cotton_balls:1,painkiller:1,granola:1},
 bowling:{popzi_soft_drink:3,colacola:3,cheezholes:3,tweex:2,fud:2,bowling_ball:3,herkeys_jerkey:2,baseball_bat:1,granola:1},
 burger:{lamburger:4,calzones:2,popzi_soft_drink:3,colacola:3,cheezholes:2,salad:2,fud:2,milk:1},
 cornmaze:{atomic_veggies:3,pickles:2,pitchfork:3,sickle:2,rope:2,granola:1,water_jug:2}});
for(const tn of ['bank','bankvault','coffee','takeout','clothing','bowling','burger','cornmaze'])for(const id in LOOT_TABLES[tn])if(!ITEMS[id])throw new Error('v036 loot table '+tn+' has unknown item '+id);

/* ===== v042: loot-table entries for the new items (existing weights untouched) ===== */
{const ADD={
 supermarket:{cereo:3,crackers:3,'224_ramen':2,apollo_meat:1,potato_chips:3,eat_flakes:3,stugots_coffee:2,sole_2_sole:2,famished_guy:2,salted_bacon:1,salted_fish:1,salted_kipper:1,tampopo_ramen:2,instant_ramen:3,sugar:3,rice:3,tuna:3,pickled_eggs:1,sardines:3,oysters:1,cookies:3,hairspray:1,slaab_steak:1},
 house:{cereo:2,crackers:2,'224_ramen':2,potato_chips:1,eat_flakes:2,stugots_coffee:1,instant_ramen:2,sugar:2,rice:2,tuna:2,sardines:2,cookies:2,hairspray:2},
 gas:{potato_chips:3,cookies:2,crackers:2,stugots_coffee:2,salted_kipper:1,hairspray:1},
 convenience:{potato_chips:3,cookies:2,crackers:2,stugots_coffee:3,instant_ramen:2,'224_ramen':2,hairspray:1,sardines:1},
 diner:{apollo_meat:1,salted_bacon:1,sole_2_sole:1,famished_guy:2,tampopo_ramen:2,slaab_steak:1,stugots_coffee:2,sugar:1,rice:1},
 restaurant:{apollo_meat:1,sole_2_sole:2,famished_guy:2,tampopo_ramen:2,oysters:2,slaab_steak:2,rice:2,sugar:1},
 takeout:{'224_ramen':2,tampopo_ramen:3,instant_ramen:2,rice:3,sole_2_sole:2,oysters:1,slaab_steak:1},
 burger:{famished_guy:3,potato_chips:2,cookies:1,slaab_steak:1,sugar:1},
 bakery:{cookies:4,crackers:2,cereo:2,sugar:3,eat_flakes:1,stugots_coffee:2},
 coffee:{stugots_coffee:5,cookies:3,sugar:3,crackers:1},
 butcher:{apollo_meat:3,salted_bacon:3,salted_fish:2,salted_kipper:2,slaab_steak:3},
 liquor:{potato_chips:2,pickled_eggs:2,salted_kipper:1,cookies:1,crackers:1},
 warehouse:{cereo:2,crackers:2,instant_ramen:3,rice:3,sugar:2,tuna:3,sardines:3,eat_flakes:2,salted_fish:1,hairspray:1},
 storage:{instant_ramen:2,rice:2,tuna:2,sardines:2,crackers:1,hairspray:1},
 sporting:{tuna:2,sardines:2,salted_fish:1,rice:1,crackers:1},
 church:{cereo:1,crackers:2,rice:1,sugar:1,eat_flakes:1},
 community:{cereo:2,eat_flakes:2,rice:2,tuna:2,sardines:2,crackers:2,instant_ramen:2},
 school:{cereo:3,eat_flakes:3,cookies:3,crackers:2,potato_chips:2,hairspray:1},
 barn:{salted_bacon:2,salted_fish:1,pickled_eggs:2,sugar:1,rice:1,apollo_meat:1},
 cinema:{potato_chips:3,cookies:2,stugots_coffee:1,sugar:1},
 motel:{instant_ramen:2,potato_chips:2,cookies:1,stugots_coffee:2,hairspray:2,'224_ramen':1},
 office:{stugots_coffee:3,cookies:2,sugar:2,crackers:1,hairspray:1},
 townhall:{stugots_coffee:2,cookies:1,crackers:1},
 clothing:{hairspray:3},
 laundromat:{hairspray:2,potato_chips:1,cookies:1},
 bowling:{potato_chips:2,cookies:1,hairspray:1},
 pharmacy:{hairspray:3,sugar:1},
 clinic:{hairspray:1},
 fire:{tuna:1,sardines:1,crackers:1,stugots_coffee:1},
 funeral:{hairspray:1},
 cornmaze:{pickled_eggs:1,sugar:1,cookies:1},
 park:{potato_chips:2,cookies:1,stugots_coffee:1},
 gunshop:{salted_kipper:0},
};
for(const t in ADD){if(!LOOT_TABLES[t])continue;for(const id in ADD[t]){if(!ITEMS[id])throw new Error('v042 loot add: unknown item '+id);if(ADD[t][id]>0)LOOT_TABLES[t][id]=ADD[t][id]}}}
Object.assign(LOOT_PROP,{bank:'cabinet',bankvault:'toolchest',coffee:'counter',takeout:'counter',clothing:'cabinet',bowling:'counter',burger:'counter',cornmaze:'crate'});

// ---- frontage / rear-service props (local coords; front = +Z)
const PR={
 pave:(B,x,w,z0,z1,c)=>flatM(w,z1-z0,c||0x8e9093,x,.027,(z0+z1)/2,B.g),
 lawn:(B,x,w,z0,z1,c)=>flatM(w,z1-z0,c||0x3f6a2f,x,.027,(z0+z1)/2,B.g),
 stalls:(B,x0,n,z0,z1,sw=2.8)=>{for(let i=0;i<=n;i++)flatM(.12,z1-z0,0xe8e8e0,x0+i*sw,.03,(z0+z1)/2,B.g)},
 car:(B,x,z)=>makeCar(WX(B,x),WZ(B,z),Math.random()<.5?0:PI),
 lamp:(B,x,y,z,side=-1)=>{deco(B,.12,.12,.5,x,y,z+side*.25,0x333333);deco(B,.3,.2,.3,x,y-.15,z+side*.5,0xfff2a0,0xaaaa55)},
 bin:(B,x,z,c)=>{const m=cyl(B,.4,.9,x,.45,z,c||0x2f5f3a,true,8);return m},
 bollard:(B,x,z,c)=>cyl(B,.14,1,x,.5,z,c||0xf5c518,true,8),
 dump:(B,x,z)=>{slab(B,x-1.1,x+1.1,z-.6,z+.6,0,1.3,0x2f4f3a);deco(B,2.3,.1,1.3,x,1.35,z,0x1f3a2a)},
 bistro:(B,x,z)=>{const t=cyl(B,.5,.06,x,.78,z,0x2a2a2a,true,12);cyl(B,.05,.75,x,.38,z,0x222222);for(const s of[-1,1])cyl(B,.22,.05,x+s*.85,.5,z,0x7a5a3a,false,8);return t},
 chalk:(B,x,z,txt)=>{const g=new THREE.Group();g.position.set(x,0,z);B.g.add(g);const a=mesh(BX(.8,1.1,.06),0x222c22,0,.6,0,g);tsign(g,txt,0,.65,.04,.7,.95,'#1d2a20','#e8e8d8','bold 52px Arial');return a},
 corral:(B,x,z)=>{for(const[w,d,px,pz]of[[3.6,.08,0,-1],[.08,2,-1.8,0],[.08,2,1.8,0],[3.6,.08,0,1]]){const m=mesh(BX(w,.9,d),0x8a8f94,x+px,.55,z+pz,B.g);addSolid(m)}for(let i=0;i<4;i++)deco(B,.9,.6,.6,x-1.2+i*.8,.55+i*.04,z,0xa0a8b0)},
 pump:(B,x,z)=>{slab(B,x-3.2,x+3.2,z-.55,z+.55,0,.2,0x8a8a88);slab(B,x-.35,x+.35,z-.3,z+.3,.2,1.7,0xdddddd);deco(B,.5,.5,.1,x,1.3,z+.32,0x222222);cyl(B,.1,.2,x,1.8,z,0xcc2222)},
 tile:(B,x,z,w,d)=>{flatM(w,d,0xdcdcd4,x,.03,z,B.g);for(let i=0;i<w;i++)for(let j=0;j<d;j++)if((i+j)%2)flatM(1,1,0x3a3a3a,x-w/2+.5+i,.032,z-d/2+.5+j,B.g)}
};
function rearDoorBits(B,x,wallZ,lampY=3.1){PR.lamp(B,x,lampY,wallZ);PR.pave(B,x,3.2,wallZ-3,wallZ,0x7a7c7e)}

// ---- generic property builder (shell + data-driven rooms)
function pb(x,z,t,o){const w=o.w,d=o.d,h=o.h||4.5,dx=o.dx||0,bd=o.bd!==undefined?o.bd:0;
 const B=mk(x,z,w,d,h,o.wall,o.floor||0x8a8a82,o.door||0x3a3a3a);B.dx=dx;const P={th:.2,c:o.pc||0xcbbfae};
 shell(B,{f:o.f||[...fw(w,dx,o.ws||3.4),{k:'d',c:dx}],b:o.b||[...fw(w,bd,3.6),{k:'d',c:bd,s:-1}],l:o.l||fw(d,99,3.6),r:o.r||fw(d,99,3.6)});
 (o.walls||[]).forEach(a=>WL(B,a[0],a[1],a[2],a[3],a[4]||[],h,P));
 (o.rooms||[]).forEach(r=>{if(r.f)furn(B,r.f,r.r);if(r.loot)rc(B,r.loot,r.r,r.n||1)});
 const ctr=(o.put||[]).filter(p=>p[0]==='counter');(o.put||[]).forEach(p=>{if(p[0]!=='register')return put(B,...p);let c=ctr[0];for(const q of ctr)if(Math.hypot(q[1]-p[1],q[2]-p[2])<Math.hypot(c[1]-p[1],c[2]-p[2]))c=q;if(c){deco(B,.5,.3,.4,c[1]+.5,1.17,c[2],0x2a2a2e);deco(B,.3,.2,.04,c[1]+.5,1.35,c[2]-.14,0x55ccaa)}});
 if(o.x)o.x(B);
 if(o.roof!==false)roof(B,h,o.roof||'flat',o.rc||0x4a4a48);
 if(o.sign)sign(B,o.sign,o.sw||5);
 done(B,t.id,o.z?ri(o.z[0],o.z[1]):(w>20?ri(1,4):ri(0,2)));LASTB=B;return B}
const X0=-7.8,X1=7.8,Z0=-10.8,Z1=10.8; // half-lot interior extents


// ================= POOL 1: HALF-LOTS (16x22 footprint, 7m frontage + 7m rear) =================
function hBank(x,z,t){return pb(x,z,t,{w:16,d:22,h:4.8,wall:0xbfae8c,floor:0xc9c3b4,dx:0,bd:0,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],b:[{k:'w',c:-5.5},{k:'w',c:5.5},{k:'d',c:0,s:-1}],
 walls:[[1,-3.2,X0,X1,[{k:'g',c:0}]],[0,-1,Z0,-3.3,[{k:'d',c:-6.5}]],[0,1,Z0,-3.3,[{k:'d',c:-6.5,s:-1}]]],
 rooms:[{r:[X0,-1.15,Z0,-3.4],f:[['desk','n',.5],['wardrobe','w',.2],['wardrobe','w',.8],['shelf','e',.5],['plant','e',.1]],loot:'bank',n:1},
  {r:[1.15,X1,Z0,-3.4],f:[['vault','n',.15],['vault','n',.85],['vault','e',.5],['safe','s',.2]],loot:'bankvault',n:2},
  {r:[X0,X1,-3.0,2.3],f:[['stool','c',.15,0,0],['stool','c',.38,0,0],['stool','c',.62],['stool','c',.85]],loot:'bank',n:1},
  {r:[X0,X1,4,Z1],f:[['machine','e',.1],['bench','w',.7],['plant','n',.05]],loot:'bank',n:1}],
 put:[['counter',-6.6,3.1],['counter',-4.15,3.1],['counter',4.15,3.1],['counter',6.6,3.1],['register',-5.4,2.4],['register',5.4,2.4],['stan',-3.5,7],['stan',-3.5,8.6],['stan',-3.5,5.4]],
 x:B=>{for(const px of[-6.6,-4.15,4.15,6.6]){glassP(B,px,1.6,3.1,2.4,1.3);deco(B,.5,.05,.4,px,1.02,3.1,0x9aa0a8)}
  const v=mesh(new THREE.TorusGeometry(1,.14,8,18),0x666a70,1,1.4,-6.5,B.g);v.rotation.y=PI/2;
  tsign(B.g,'PIETY MUTUAL BANK',0,5.4,11.12,9,1.3,'#0d2a52','#d8c27a');PR.pave(B,0,16,11,14,0xb4b4ae);PR.tile(B,0,12.6,4,3);
  for(const s of[-1,1]){slab(B,s*6.6-.6,s*6.6+.6,12.8,13.6,0,.5,0x6b4a2e);deco(B,1,.3,.6,s*6.6,.65,13.2,0x3a7a3a);PR.bollard(B,s*3.2,14.2,0x888888)}
  tsign(B.g,'BANK',-9.1,2.2,13.9,.1,.1,'#000','#000');rearDoorBits(B,0,-11.2);PR.bin(B,5,-12.2);PR.bin(B,6.4,-12.2)}})}

function hClinic(x,z,t){return pb(x,z,t,{w:16,d:22,h:4.2,wall:0xaec4d4,floor:0xcfd8dc,door:0x6a7a8a,pc:0xe8eef0,dx:0,bd:0,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],
 walls:[[1,1.2,X0,X1,[{k:'d',c:0}]],[0,-1.2,Z0,1.1,[{k:'d',c:-2.3},{k:'d',c:-8.3}]],[0,1.2,Z0,1.1,[{k:'d',c:-2.3,s:-1},{k:'d',c:-8.3,s:-1}]],[1,-5.7,X0,-1.3,[]],[1,-5.7,1.3,X1,[]]],
 rooms:[{r:[X0,-1.35,-5.55,1.05],f:RM.exam,loot:'clinic'},{r:[1.35,X1,-5.55,1.05],f:RM.exam,loot:'clinic'},
  {r:[X0,-1.35,Z0,-5.85],f:RM.pharm,loot:'clinic',n:2},{r:[1.35,X1,Z0,-5.85],f:[['toilet','n',.2],['sink','e',.8],['plant','s',.1]]},
  {r:[X0,X1,1.4,Z1],f:RM.wait,loot:'clinic'}],
 x:B=>{glassP(B,0,1.5,5.2,2.2,.9);tsign(B.g,'CHECK IN',0,2.3,5.2,1.6,.4,'#e8eef0','#1d4ed8','bold 40px Arial');
  tsign(B.g,'PIETY MEDICAL CLINIC',0,5.5,11.12,8,1,'#e8eef0','#0d6a8a');deco(B,2.4,.3,.1,6.4,4.9,11.1,0xcc2222);deco(B,.8,2,.1,6.4,4.9,11.1,0xcc2222);
  for(const px of[-6,-3.4,3.4,6])tsign(B.g,'OPEN',px,2.6,11.1,.7,.25,'#e8eef0','#1d6a3a','bold 22px Arial');
  PR.pave(B,0,16,11,13.2,0xb4b4ae);const r=mesh(BX(2,.14,4),0x9a9a94,-5,.15,13,B.g);r.rotation.x=.08;for(const s of[-1,1])deco(B,.06,.9,4,-5+s*1,.6,13,0x8a8f94);
  PR.stalls(B,-8,6,14,17.5,2.7);PR.car(B,2.6,15.4);rearDoorBits(B,0,-11.2);PR.bin(B,5,-12.2)}})}

function hCoffee(x,z,t){return pb(x,z,t,{w:16,d:22,h:4,wall:0x8a5a3a,floor:0x9a8060,door:0x4a2c14,dx:0,bd:-4,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],walls:[[1,-2.6,X0,X1,[{k:'d',c:-4},{k:'g',c:3}]]],
 rooms:[{r:[X0,X1,Z0,-2.8],f:RM.kitchen,loot:'coffee',n:2},{r:[X0,X1,-2.4,Z1],f:[['plant','w',.05],['plant','e',.05]],loot:'coffee',n:1}],
 put:[['counter',-5.6,1.4],['counter',-3.2,1.4],['counter',-.8,1.4],['register',1.5,1.2],['freezer',4.7,1.1],['stove',-5.6,.3],['table',-5,6.6],['table',0,6.6],['table',5,6.6],['table',-5,9.2],['table',5,9.2],['box',6.8,-5],['box',6.8,-6],['box',-6.8,-9.8]],
 x:B=>{for(const px of[-5,0,5]){put(B,'chair',px-.4,5.6);put(B,'chair',px+.4,5.6);put(B,'chair',px-.4,7.6,PI);put(B,'chair',px+.4,7.6,PI)}
  deco(B,1,.7,.7,-6,1.35,1.4,0x777777);deco(B,1.8,.5,.5,-4.2,1.2,1.1,0xcfe8f0);
  FEAT.awning(B,{awn:[0x5a2a1a,0xe8d8b8]});tsign(B.g,'CUPPA JOE',0,4.9,11.12,5,1,'#3a2414','#f0d8a8');PR.pave(B,0,16,11,13.5,0xb4b4ae);
  PR.chalk(B,-3.4,12.4,'TODAY: JOE');PR.bistro(B,5,13.2);PR.bistro(B,-6,13.4);PR.bin(B,2.6,12.2);rearDoorBits(B,-4,-11.2);PR.dump(B,5,-14)}})}

function hFoo(x,z,t){return pb(x,z,t,{w:16,d:22,h:4,wall:0x7a2a2a,floor:0x8a8a82,door:0x2a2a2a,dx:0,bd:0,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],walls:[[1,4.2,X0,X1,[{k:'g',c:-4},{k:'g',c:4}]],[1,-4.4,X0,X1,[{k:'d',c:0}]]],
 rooms:[{r:[X0,X1,Z0,-4.6],f:[['shelf','n',.15],['shelf','n',.55],['freezer','w',.5],['crate','e',.5],['box','s',.5]],loot:'takeout',n:2},{r:[X0,X1,-4.2,3.9],loot:'takeout',n:1},{r:[X0,X1,5.8,Z1],loot:'takeout',n:1}],
 put:[['counter',-2.4,5.3],['counter',0,5.3],['counter',2.4,5.3],['register',-1.2,4.7],['stove',-6.8,-3.4],['stove',-5.8,-3.4],['stove',-4.8,-3.4],['stove',-3.8,-3.4],['fryer',-2.6,-3.4],['fryer',-1.6,-3.4],['counter',2.6,-3.4],['counter',5.1,-3.4],['counter',-1,1.2],['counter',1.4,1.2],['hood',-5.3,-3.6],['hood',-2.1,-3.6],['sink',7.2,.5],['bench',-6,8],['bench',6,8]],
 x:B=>{tsign(B.g,'MR. FOO\'S TAKEOUT',0,4.9,11.14,6,1.2,'#1a0a0a','#ff3a3a','bold 80px Impact');deco(B,5.6,.1,.2,0,4.2,11.35,0xff3a3a,0xaa1010);
  tsign(B.g,'MENU 1 2 3 4 5',-5.4,3.1,11.12,2.4,.8,'#111','#ffe060','bold 40px Arial');for(let i=0;i<5;i++){const l=mesh(new THREE.SphereGeometry(.3,8,6),0xd81818,-6+i*3,3.6,11.8,B.g);l.material.emissive.setHex(0x661111)}
  PR.pave(B,0,16,11,13.5,0xb4b4ae);PR.bin(B,-6,12.4);PR.bin(B,6.4,12.4);rearDoorBits(B,0,-11.2);PR.bin(B,-3,-12.4);PR.dump(B,4,-14.5)}})}

function hRay(x,z,t){const rooms=[],walls=[[1,3.8,X0,X1,[{k:'d',c:0}]],[0,-1.4,Z0,3.7,[{k:'d',c:1.75},{k:'d',c:-2.15},{k:'d',c:-6.05}]],[0,1.4,Z0,3.7,[{k:'d',c:1.75,s:-1},{k:'d',c:-2.15,s:-1},{k:'d',c:-6.05,s:-1}]]];
 for(const zc of[-.2,-4.1,-8])walls.push([1,zc,X0,-1.5,[]],[1,zc,1.5,X1,[]]);
 for(const [a,b] of[[-.1,3.6],[-4,-.3],[-7.9,-4.2]]){rooms.push({r:[X0,-1.55,a,b],f:[['locker','w',.3],['crate','n',.5],['box','e',.5]],loot:'storage'},{r:[1.55,X1,a,b],f:[['crate','e',.5],['locker','e',.9],['box','s',.5]],loot:'storage'})}
 rooms.push({r:[X0,X1,4,Z1],f:[['desk','n',.85],['chair','n',.85,0,1.1,PI],['shelf','w',.5],['plant','e',.1],['box','e',.8]],loot:'storage'});
 return pb(x,z,t,{w:16,d:22,h:4,wall:0x8a9096,floor:0x8a8a82,door:0x4a5058,dx:0,bd:0,f:[{k:'w',c:-5},{k:'w',c:5},{k:'d',c:0}],walls,rooms,
 x:B=>{deco(B,5.6,1.1,.2,-4.8,2.5,11.15,0x7a8086);for(let i=0;i<6;i++)deco(B,5.5,.05,.05,-4.8,2+i*.18,11.28,0x555a60);
  tsign(B.g,'RAY\'S STORAGE & CONTAINMENT',0,5,11.12,9,1,'#1a2a4a','#f0c030','bold 44px Arial');
  const cm=mesh(BX(.3,.25,.5),0x222222,6.8,3.8,11.4,B.g);cyl(B,.1,.2,6.8,3.8,11.7,0x333333);cm.rotation.x=.2;
  PR.pave(B,0,16,11,13.6,0xb4b4ae);PR.bollard(B,-6,12.8);PR.bollard(B,6,12.8);rearDoorBits(B,0,-11.2);deco(B,2.4,.2,.3,0,3.2,-11.3,0x666a70)}})}

function hFancy(x,z,t){return pb(x,z,t,{w:16,d:22,h:4.2,wall:0xa85a8a,floor:0xc8b8a8,door:0x3a2a3a,dx:0,bd:-4,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],walls:[[1,-3,X0,X1,[{k:'d',c:-4},{k:'g',c:4}]]],
 rooms:[{r:[X0,X1,Z0,-3.2],f:[['rack','n',.2],['rack','n',.6],['rack','w',.5],['crate','e',.5],['box','s',.5]],loot:'clothing',n:2},{r:[X0,X1,-2.8,6],f:[['rack','w',.2],['rack','w',.5],['rack','e',.2],['rack','e',.5],['mirror','e',.8]],loot:'clothing',n:2}],
 put:[['manne',-5.6,9.8],['manne',-2.8,9.8],['manne',2.8,9.8],['manne',5.6,9.8],['table',-3.5,4.8],['table',0,4.8],['table',3.5,4.8],['counter',-5,7],['register',-5.2,6.3],['mirror',2,-2.6,PI]],
 x:B=>{const bx=[[3.5,0,-1.2],[3.5,-2.6,0],[3.5,2.6,0]];slab(B,5,7.6,-2.4,-.1,0,.1,0x6a4a5a);deco(B,.1,2.3,2.3,5,1.2,-1.25,0x7a4a6a);deco(B,2.6,2.3,.1,6.3,1.2,-2.5,0x7a4a6a);deco(B,2.6,2.3,.1,6.3,1.2,-.1,0x7a4a6a);deco(B,.06,2.1,2.2,5.05,1.15,-1.25,0xd8506a);
  tsign(B.g,'FANCYPANTZ WEARABLES',0,5,11.12,7,1,'#2a0a2a','#ff9ad8','bold 50px Impact');FEAT.awning(B,{awn:[0xa83a7a,0xf1e1ee]});PR.pave(B,0,16,11,13.5,0xb4b4ae);
  for(const px of[-6,6])PR.bin(B,px,12.4,0x444444);PR.chalk(B,0,12.6,'SALE');rearDoorBits(B,-4,-11.2);deco(B,2.2,.1,1.2,5,.2,-12.2,0xa08050)}})}

function hAndolini(x,z,t){return pb(x,z,t,{w:16,d:22,h:4,wall:0xc8b890,floor:0xb0a890,door:0x2a4a2a,dx:3,bd:-6,
 f:[...wins([-6,-3.2,-.4,6.2]),{k:'d',c:3}],walls:[[1,-4,X0,X1,[{k:'d',c:-6},{k:'g',c:4}]]],
 rooms:[{r:[X0,X1,Z0,-4.2],f:[['crate','n',.2],['crate','n',.6],['shelf','w',.5],['shelf','e',.5],['box','s',.5]],loot:'convenience',n:2},{r:[X0,X1,-3.8,Z1],loot:'convenience',n:2}],
 put:[['aisle',-5,6.2],['aisle',-2.6,6.2],['aisle',-.2,6.2],['aisle',-5,3.8],['aisle',-2.6,3.8],['aisle',-.2,3.8],['freezer',-3.3,-3.4],['freezer',-1,-3.4],['freezer',1.3,-3.4],['counter',5.2,8.6,PI/2],['register',4.4,9.6],['shelf',7.3,6.6,-PI/2],['counter',6.6,-.6,-PI/2],['slicer',6.8,.6],['freezer',3.6,-3.4]],
 x:B=>{tsign(B.g,'ANDOLINI\'S GROCERIA',0,5,11.12,8,1,'#8a1a1a','#f4e6c0','bold 44px Arial');deco(B,6,.1,1.3,-3,3.5,11.5,0x2a7a2a).rotation.x=.4;
  slab(B,-8.4+1,-8.4+3.2,11.4,12.5,0,1,0xdfe6ea);deco(B,2.2,.08,1.1,-6.2,1.05,11.95,0x88ccee);deco(B,.8,1.1,.4,6,.55,11.7,0x7a7a7a);deco(B,.7,.4,.05,6,1,11.55,0xe8e4d0);
  PR.pave(B,0,16,11,13.5,0xb4b4ae);PR.bin(B,-7,12.6);rearDoorBits(B,-6,-11.2);PR.dump(B,4,-14);for(let i=0;i<3;i++)deco(B,.9,.7,.9,-6.5+i*.1,.35+i*.7,-11.9+rnd(0,.2),0xa08050)}})}

function hWhiteTrash(x,z,t){return pb(x,z,t,{w:16,d:22,h:3.2,wall:0x8f8a6a,floor:0x8a6a4a,door:0x4a2c14,dx:-3,bd:1.8,roof:'gable',rc:0x4a3a2a,
 f:[...wins([-6.4,2,5,7]),{k:'d',c:-3}],b:[{k:'d',c:1.8,s:-1},{k:'w',c:-5},{k:'w',c:5.5}],
 walls:[[1,1,X0,X1,[{k:'d',c:-3.5},{k:'d',c:3.5}]],[0,.5,1.1,Z1,[{k:'g',c:6}]],[0,0,Z0,.9,[{k:'d',c:-3.5}]],[0,4,Z0,-6.9,[]],[1,-6.8,4,X1,[{k:'d',c:5.9}]]],
 rooms:[{r:[X0,.35,1.2,Z1],f:[['sofa','n',.95],['tv','s',.05],['rug','c',.5],['ctable','c',.5],['shelf','w',.5],['lamp','w',.95],['plant','s',.9]],loot:'house'},{r:[.65,X1,1.2,Z1],f:[['counter','e',.3],['stove','e',.5],['fridge','e',.75],['sink','e',.12],['table','c',.3,0,.5],['chair','c',.3,-.4,1.35,PI],['chair','c',.3,.4,1.35,PI]],loot:'house'},{r:[X0,-.15,Z0,.8],f:RM.bedroom,loot:'house'},{r:[4.15,X1,Z0,-6.95],f:RM.bath},{r:[.15,X1,-6.7,.8],f:[['box','e',.5],['plant','n',.9]]}],
 x:B=>{slab(B,-5.4,-.6,11,13.2,0,.25,0x7a5a3a);slab(B,-4.9,-1.1,12.8,13.8,0,.12,0x6a4a2a);for(const px of[-5.2,-.8])deco(B,.18,2.8,.18,px,1.4,13,0xe8e4d8);deco(B,5.2,.15,2.4,-3,2.9,12.2,0x4a3a2a);deco(B,1.1,2.3,.05,-3,1.2,11.2,0x8a9a8a);
  PR.lawn(B,0,16,13.8,17.5,0x6a7a3a);for(let i=0;i<6;i++)flatM(rnd(1.2,2.4),rnd(.8,1.5),0x7a6a40,rnd(-6.5,6.5),.032,rnd(14,16),B.g,rnd(0,3));
  for(const px of[-6.5,-5.8]){deco(B,.6,.1,.6,px,.45,12.4,0xe8e8f0);deco(B,.6,.5,.08,px,.8,12.1,0xe8e8f0)}deco(B,.12,1,.12,5.5,.5,16.5,0x777777);deco(B,.4,.3,.3,5.5,1.1,16.5,0x2a5a9a);
  slab(B,-2,2,-12.8,-11,0,.2,0x7a5a3a);for(const s of[-1,1]){const fx=s*9.4;for(let zz=-11.4;zz>-17.6;zz-=1.4)deco(B,.12,1.2,.12,fx,.6,zz,0x8a7a5a);deco(B,.06,.1,6.3,fx,1,-14.5,0x8a7a5a);}
  for(const [a,b]of[[-9.4,-1.2],[1.2,9.4]]){for(let xx=a;xx<=b;xx+=1.4)deco(B,.12,1.2,.12,xx,.6,-17.6,0x8a7a5a);deco(B,b-a,.1,.06,(a+b)/2,1,-17.6,0x8a7a5a)}
  deco(B,.7,.5,.7,-6,.25,-13.5,0x6a4a2a);deco(B,.9,.12,.9,3,.06,-14.5,0x8a8a8a)}})}

function hButcher(x,z,t){return pb(x,z,t,{w:16,d:22,h:4,wall:0xb0a8a0,floor:0xd0ccc4,door:0x7a1a1a,dx:0,bd:-4,
 f:[...wins([-6,-3.4,3.4,6]),{k:'d',c:0}],walls:[[1,-5.2,X0,X1,[{k:'d',c:-4},{k:'d',c:4.4}]],[0,1.2,Z0,-5.3,[]]],
 rooms:[{r:[X0,1.05,Z0,-5.4],f:[['crate','n',.3],['shelf','w',.5],['box','s',.5]],loot:'butcher'},{r:[1.35,X1,Z0,-5.4],f:[['freezer','e',.3],['freezer','e',.7]],loot:'butcher',n:2},{r:[X0,X1,-5,1.8],f:[['cutblock','c',.3,0,0],['cutblock','c',.6,0,0],['counter','w',.7]],loot:'butcher',n:1},{r:[X0,X1,2.7,Z1],f:[['plant','w',.05]],loot:'butcher'}],
 put:[['freezer',-5.6,2.2],['freezer',-3.3,2.2],['freezer',-1,2.2],['freezer',1.3,2.2],['freezer',3.6,2.2],['register',6,3.4],['box',6.4,-2.2]],
 x:B=>{deco(B,12,.08,.08,-1,3.3,-1.6,0x888888);for(let i=0;i<7;i++){deco(B,.04,.5,.04,-6+i*1.5,3,-1.6,0xaaaaaa);deco(B,.32,.7,.28,-6+i*1.5,2.5,-1.6,0xa02a2a)}
  deco(B,10,.08,.08,4.4,3.3,-8,0x888888);for(let i=0;i<4;i++)deco(B,.35,.8,.3,2.6+i*1.5,2.6,-8,0xb03030);deco(B,.6,.4,.5,5.6,1,.8,0x9a9a9a);
  FEAT.awning(B,{awn:[0x991b1b,0xf1f1f1]});tsign(B.g,'GEIN\'S BUTCHERIA',0,5,11.12,7,1,'#3a0a0a','#f4e6c0','bold 52px Impact');for(const px of[-6,-3.4,3.4,6])for(let i=0;i<2;i++)deco(B,.5,.3,.4,px-.4+i*.8,.98,10.4,0xc02a2a);
  PR.pave(B,0,16,11,13.5,0xb4b4ae);rearDoorBits(B,-4,-11.2);PR.dump(B,3,-14.5);PR.bin(B,-6,-12.2)}})}

function hLaundro(x,z,t){const put2=[];for(let i=0;i<7;i++){put2.push(['washer',-6+i,-2.1,0],['dryer',-6+i,-3.1,PI])}
 for(const px of[-4,0,4])put2.push(['table',px,6]);put2.push(['machine',7.1,9.6,-PI/2],['machine',7.1,8.4,-PI/2],['bench',-6.2,9.6]);
 return pb(x,z,t,{w:16,d:22,h:4,wall:0x5f8fa0,floor:0xc8ccd0,door:0x2a3a5a,dx:0,bd:-3,
 f:[...wins([-6.4,-3.6,-1.5,1.5,3.6,6.4]),{k:'d',c:0}],walls:[[1,-6.4,X0,X1,[{k:'d',c:-3},{k:'d',c:5,s:-1}]]],
 rooms:[{r:[X0,X1,Z0,-6.6],f:[['shelf','w',.5],['shelf','e',.5],['crate','n',.5],['box','s',.5],['sink','e',.9]],loot:'laundromat',n:2},{r:[X0,X1,-6,Z1],loot:'laundromat',n:1}],
 put:put2,x:B=>{for(let i=0;i<3;i++){const c=new THREE.Group();c.position.set(-6.5+i*1.1,0,-5.4);B.g.add(c);mesh(BX(.8,.1,.6),0x8a8a8a,0,.35,0,c);mesh(BX(.8,.5,.06),0x6a8aca,0,.65,-.3,c);mesh(BX(.06,.5,.6),0x6a8aca,.4,.65,0,c)}
  for(const px of[-6.4,-3.6,3.6,6.4])tsign(B.g,'DETERGENT',px,3.4,10.95,1.2,.5,'#2a6ad0','#fff','bold 28px Arial');tsign(B.g,'LAUNDROMAT',0,5,11.12,7,1,'#0d2a52','#9ad8ff');FEAT.awning(B,{awn:[0x2563eb,0xf1f1f1]});
  for(let i=-1;i<=1;i++){const l=mesh(BX(2.4,.06,.3),0xffffff,i*4.6,3.9,2,B.g);l.material.emissive.setHex(0xcccccc)}PR.pave(B,0,16,11,13.5,0xb4b4ae);PR.bin(B,-6,12.4);rearDoorBits(B,-3,-11.2);PR.bin(B,3,-12.4)}})}


// ================= POOL 2: BIG COMPOUNDS (30x23 footprint, 6.5m frontage + 6.5m rear) =================
const BX0=-14.8,BX1=14.8,BZ0=-11.3,BZ1=11.3;
const stallsAndCars=(B,n=1)=>{PR.pave(B,0,30,11.5,13,0xb4b4ae);PR.stalls(B,-14,10,13.2,17.6);const used=new Set();for(let i=0;i<n;i++){let s=ri(0,9);while(used.has(s))s=ri(0,9);used.add(s);PR.car(B,-12.6+s*2.8,15.4)}};

function bFoodLib(x,z,t){const put2=[];for(const px of[-12.5,-9.5,-6.5,6.5,9.5,12.5]){put2.push(['counter',px,7.6,PI/2],['register',px+.9,6.2])}
 for(const rz of[1.2,-1.4])for(const px of[-12.6,-10.2,-7.8,-3.6,-1.2,1.2,3.6,7.8,10.2,12.6])put2.push(['aisle',px,rz]);
 put2.push(['forklift',-3.8,-8.4,PI/2],['prack',-12.8,-10.3],['prack',-9.4,-10.3],['prack',-12.8,-6.9],['prack',-9.4,-6.9],['crate',10,-6.3],['crate',13,-6.3],['freezer',-14.2,3.5,PI/2],['freezer',-14.2,5.8,PI/2]);
 return pb(x,z,t,{w:30,d:23,h:6,wall:0x7c8c9c,floor:0xc8c8c0,dx:0,bd:-6.4,
 f:[...wins([-13,-9.8,-7,-4.4,4.4,7,9.8,13]),{k:'g',c:-1.8},{k:'g',c:1.8}],b:[{k:'g',c:-1.6},{k:'g',c:0},{k:'g',c:1.6},{k:'d',c:-6.4,s:-1}],
 walls:[[1,-5.2,BX0,BX1,[{k:'d',c:-4.2},{k:'d',c:4.2,s:-1}]],[1,-8.2,7.2,BX1,[{k:'d',c:11}]],[0,7.2,BZ0,-8.3,[]]],
 rooms:[{r:[7.4,BX1,BZ0,-8.5],f:[['freezer','n',.1],['freezer','n',.9],['box','e',.5]],loot:'supermarket',n:2},{r:[BX0,BX1,-5,11],loot:'supermarket',n:3},{r:[BX0,BX1,BZ0,-5.4],loot:'supermarket',n:2}],
 put:put2,x:B=>{tsign(B.g,'THE FOOD LIBRARY',0,6.9,11.62,12,1.6,'#0d4a2a','#f4f4d8','bold 90px Impact');deco(B,30.4,.5,.3,0,5.5,11.7,0x2a5a3a);
  slab(B,-3,3,11.5,12.6,0,.06,0x555a60);for(const s of[-1,1])deco(B,.2,3,.3,s*2.6,1.5,11.7,0x777777);
  for(let i=0;i<9;i++)PR.bollard(B,-6+i*1.5,13.1);PR.corral(B,-11,14.4);stallsAndCars(B,3);
  slab(B,-3,3,-14.4,-11.5,0,.3,0x7a7c7e,true);deco(B,5.2,1,.12,0,3.1,-11.45,0x9a9ea2);rearDoorBits(B,-9,-11.7,3.6);PR.dump(B,8,-14.5);PR.dump(B,11,-14.5)}})}

function bLucky(x,z,t){const put2=[];for(const px of[-11.5,-9.1,-6.7,-4.3])put2.push(['table',px,7.8]);
 for(const rz of[3.8,1.4])for(const px of[-12.6,-10.2,-7.8,-3.6,-1.2,1.2,3.6,7.8,10.2,12.6])put2.push(['aisle',px,rz]);
 for(const px of[6,8.4,10.8,13])put2.push(['register',px,8.6],['counter',px,7.8]);put2.push(['freezer',-4,-9.2],['freezer',-1.7,-9.2],['freezer',.6,-9.2],['freezer',2.9,-9.2],['freezer',5.2,-9.2],['freezer',7.5,-9.2],['counter',-3.5,-7.6],['counter',-1,-7.6],['counter',1.5,-7.6],['counter',4,-7.6],['cutblock',-10.5,-9]);
 return pb(x,z,t,{w:30,d:23,h:5.4,wall:0xc4a46a,floor:0xd0c8b8,door:0x7a1a1a,dx:0,bd:-12,
 f:[...wins([-12,-8,-4.5,5,8,11.5,14]),{k:'d',c:-1.6},{k:'d',c:1.6}],
 walls:[[1,-5.2,BX0,-8,[]],[1,-5.2,-6,BX1,[]],[0,-12,BZ0,-5.3,[{k:'d',c:-8}]],[0,-8,BZ0,-5.3,[]],[1,-5.2,-14.2,-12.1,[]]],
 rooms:[{r:[BX0,-12.2,BZ0,-5.4],f:[['desk','n',.5],['shelf','w',.5],['box','s',.5],['crate','e',.5]],loot:'office'},{r:[-7.8,BX1,BZ0,-5.4],loot:'butcher',n:2},{r:[BX0,BX1,-5,11],loot:'supermarket',n:3}],
 put:put2,x:B=>{deco(B,.3,6,.3,-12.4,4,12.4,0xd0c040);const sg=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.3,16),new THREE.MeshBasicMaterial({color:0xffcc22}));sg.rotation.x=PI/2;sg.position.set(-12.4,7,12.4);B.g.add(sg);tsign(B.g,'LUCKY DUCKY',0,6,11.62,9,1.3,'#7a1a1a','#ffe060','bold 80px Impact');tsign(B.g,'GROCERY & MEATS',0,4.6,11.62,6,.8,'#ffe060','#7a1a1a','bold 48px Arial');
  for(const px of[-8,-4.5,5,8])tsign(B.g,'SALE!',px,2.8,11.55,1.5,1,'#ffe060','#cc2222','bold 56px Impact');stallsAndCars(B,4);for(const px of[-6,0,6])PR.bollard(B,px,13.1);
  rearDoorBits(B,-8,-11.7,3.6);PR.dump(B,6,-14.5);PR.bin(B,-4,-13.4)}})}

function bBurger(x,z,t){const put2=[];for(const bz of[-1,2.6,6.2])for(const bx of[-12,-7,-2])put2.push(['table',bx,bz],['bench',bx,bz-1.1],['bench',bx,bz+1.1,PI]);
 put2.push(['counter',-8,-4.2],['counter',-4.5,-4.2],['counter',-1,-4.2],['register',-7,-3.5],['register',-3,-3.5],['stove',3,-9.6],['stove',5,-9.6],['fryer',7,-9.6],['fryer',8.2,-9.6],['hood',4,-9.8],['hood',7.6,-9.8],['counter',10.4,-9.6],['counter',12.6,-5.6,-PI/2],['freezer',13.6,-8,-PI/2],['freezer',13.6,-3,-PI/2],['machine',13.8,-1,-PI/2]);
 return pb(x,z,t,{w:30,d:23,h:4.6,wall:0xcc5a2a,floor:0xd8d0c0,door:0x3a2a1a,dx:-8,bd:10,
 f:[...wins([-13,-4.5,-1.5,2,5]),{k:'d',c:-8}],r:[{k:'w',c:7},{k:'w',c:-2},{k:'w',c:3}],b:[{k:'d',c:10,s:-1},{k:'w',c:-6}],
 walls:[[1,-6.4,BX0,BX1,[{k:'g',c:-10},{k:'g',c:-6},{k:'g',c:-2},{k:'d',c:1.5},{k:'d',c:11}]]],
 rooms:[{r:[BX0,BX1,-6,BZ1],loot:'burger',n:2},{r:[BX0,BX1,BZ0,-6.6],f:[['shelf','n',.5],['box','w',.5]],loot:'burger',n:2}],put:put2,
 x:B=>{const g=new THREE.Group();g.position.set(-12.4,0,13.4);B.g.add(g);mesh(BX(.3,6,.3),0x888888,0,3,0,g);const hd=mesh(new THREE.SphereGeometry(1,12,10),0xe07a1a,0,6.6,0,g);for(const s of[-1,1]){const e=mesh(new THREE.ConeGeometry(.35,.8,6),0xe07a1a,s*.8,7.4,0,g)}mesh(new THREE.SphereGeometry(.3,6,6),0x222222,0,6.5,.95,g);addSolid(g.children[0]);
  tsign(B.g,'WILLY THE FOX\'S BURGERORIUM',0,5.3,11.62,13,1,'#7a2a0a','#ffe060','bold 52px Impact');
  slab(B,15.6,19.2,-16.4,17.6,.02,.04,0x555a5e);flatM(.1,32,0xf0e040,17.4,.06,0,B.g);PR.car(B,17.4,5);deco(B,.9,1.6,.2,16.2,.8+.2,6.8,0x777777);tsign(B.g,'ORDER HERE',16.3,1.8,6.95,.8,1,'#222','#ffe060','bold 22px Arial',-PI/2);
  deco(B,.3,3.2,.3,15.9,1.6,-1.8,0x888888);deco(B,.2,.2,.9,15.4,3,-3.4,0x333333);
  stallsAndCars(B,2);rearDoorBits(B,10,-11.7,3.6);PR.dump(B,4,-14.6);PR.dump(B,7.5,-14.6)}})}

function bHardware(x,z,t){const put2=[];for(const rz of[4.4,1.8,-.8])for(const px of[-10.2,-7.8,-5.4,5.4,7.8,10.2])put2.push(['aisle',px,rz]);
 put2.push(['counter',-6,9],['register',-5,8.3],['key',-8.5,10.4],['workbench',-9.4,10.6],['ladder',12,-10.5],['ladder',13,-10.5],['ladder',-13,-10.5],['hbin',-13,-5.4],['hbin',-13,-3.4],['prack',-9,-10.2],['prack',-5.6,-10.2],['prack',5.6,-10.2],['prack',9,-10.2],['crate',2,-9],['crate',-2,-9]);
 return pb(x,z,t,{w:30,d:23,h:5,wall:0xb04a2a,floor:0xa8a8a0,door:0x4a3a2a,dx:0,bd:0,
 f:[...wins([-11,-7.5,7.5,11]),{k:'d',c:-1.6},{k:'d',c:1.6}],b:[{k:'g',c:-2.4},{k:'g',c:-.8},{k:'g',c:.8},{k:'g',c:2.4}],
 walls:[[1,-6.4,BX0,BX1,[{k:'d',c:-12},{k:'g',c:-2.4},{k:'g',c:-.8},{k:'g',c:.8},{k:'g',c:2.4},{k:'d',c:12}]]],
 rooms:[{r:[BX0,BX1,-6,BZ1],loot:'hardware',n:3},{r:[BX0,BX1,BZ0,-6.6],loot:'hardware',n:3}],put:put2,
 x:B=>{tsign(B.g,'HAMMERTIME',0,5.8,11.62,10,1.4,'#e0a020','#222','bold 90px Impact');for(const[a,b]of[[-13,-8],[8,13]])for(let i=0;i<4;i++){slab(B,a,b,12.2+i*.01,12.5+i*.01,0,.9,0x6a4a2a);for(let k=0;k<4;k++)deco(B,4.4,.15,.5,(a+b)/2,.5+k*.3,12.35,0xc09a60)}
  for(let i=0;i<4;i++)deco(B,1.1,.4,.8,-3+i*1.4,.2,12.6,0x6a5a4a);deco(B,.3,1,.2,-5,.5,12.6,0x888888);PR.pave(B,0,30,11.5,14,0xa8a8a4);stallsAndCars(B,2);
  slab(B,-4,4,-14.4,-11.5,0,.3,0x7a7c7e,true);deco(B,9.6,1,.12,0,3.1,-11.45,0x9a9ea2);rearDoorBits(B,-8,-11.7,3.6);PR.dump(B,9,-14.5)}})}

function bPharmacy(x,z,t){const put2=[];for(const rz of[5.2,2.8])for(const px of[-12.6,-10.2,-7.8,-3.6,-1.2,1.2,3.6,7.8,10.2,12.6])put2.push(['aisle',px,rz]);
 put2.push(['counter',-8,-3.4],['counter',-5.6,-3.4],['counter',-3.2,-3.4],['counter',3.2,-3.4],['counter',5.6,-3.4],['counter',8,-3.4],['register',-6,-4.2],['register',6,-4.2],['table',-9,-7.4],['table',-6,-7.4],['shelf',-12,-9.8],['shelf',-9,-9.8],['shelf',-6,-9.8],['shelf',10,-9.8],['shelf',12.5,-8.4,-PI/2],['safe',3,-10.2],['safe',4.2,-10.2],['vault',7.5,-10.8],['freezer',13.8,-4.8,-PI/2]);
 return pb(x,z,t,{w:30,d:23,h:5,wall:0xe0e4e8,floor:0xe8e8e8,door:0x2a6a4a,pc:0xe8eef0,dx:0,bd:12,
 f:[...wins([-11,-7.5,7.5,11]),{k:'d',c:-1.6},{k:'d',c:1.6}],b:[{k:'d',c:12,s:-1},{k:'w',c:-6}],
 walls:[[1,-5.6,BX0,-1.5,[]],[1,-5.6,1.5,BX1,[{k:'d',c:12}]],[0,-1.4,BZ0,-5.7,[]],[0,1.4,BZ0,-5.7,[{k:'d',c:-8.5}]]],
 rooms:[{r:[BX0,BX1,-3,BZ1],loot:'pharmacy',n:3},{r:[BX0,-1.6,BZ0,-5.8],loot:'pharmacy',n:2},{r:[1.6,BX1,BZ0,-5.8],loot:'pharmacy',n:2}],put:put2,
 x:B=>{for(const px of[-9,-5.2,5.2,9])glassP(B,px,1.6,-3.4,2.4,1.3);const cr=new THREE.Group();cr.position.set(11.6,6.3,11.8);B.g.add(cr);for(const[w,h]of[[1.8,.55],[.55,1.8]])mesh(BX(w,h,.2),0x16a34a,0,0,0,cr).material.emissive.setHex(0x0a5a2a);
  tsign(B.g,'MORGAN\'S DRUG & PHARMACY',-3,6,11.62,12,1.4,'#e8eef0','#0d6a3a','bold 54px Arial');PR.pave(B,0,30,11.5,14,0xb4b4ae);stallsAndCars(B,3);rearDoorBits(B,12,-11.7,3.6);PR.dump(B,5,-14.5);PR.bin(B,-5,-13.4)}})}


function bEcoPump(x,z,t){const cs=CUR.cs,OZ=-4;/* store is set back: local store z = plot z - OZ */
 const B=pb(x,z+cs*OZ,t,{w:26,d:12,h:4.2,wall:0xdadad0,floor:0xbcbcb4,door:0x2a6a3a,dx:0,bd:9,
 f:[...wins([-9,-6,-3.2,6,9]),{k:'d',c:0}],b:[{k:'d',c:9,s:-1},{k:'w',c:-9},{k:'w',c:-4}],
 walls:[[0,10,-5.9,.3,[]],[1,.3,10.1,12.9,[{k:'d',c:11.5}]]],
 rooms:[{r:[-12.85,9.9,-5.85,5.85],loot:'gas',n:2},{r:[10.2,12.9,-5.8,.1],f:[['toilet','n',.15],['sink','n',.9]]}],
 put:[['aisle',-8,-1.2],['aisle',-5.6,-1.2],['aisle',-3.2,-1.2],['aisle',-8,1.2],['aisle',-5.6,1.2],['aisle',-3.2,1.2],['freezer',-12.2,-5.2],['freezer',-9.9,-5.2],['freezer',-7.6,-5.2],['freezer',-5.3,-5.2],['counter',3,3.2],['register',3.9,2.6],['shelf',2.2,2.2],['counter',7.4,-4.8,-PI/2],['stove',8.4,-5.2],['machine',-12.4,3.6,PI/2]],
 x:B=>{const cz=14.9-OZ*0+4;const P=cz;slab(B,-11,11,cz-2.8,cz+2.8,4.4,4.9,0x2a8a4a);deco(B,22,.5,.2,0,4.0,cz+2.85,0xe8e8d8);tsign(B.g,'ECO PUMP',0,4.15,cz+2.97,6,.6,'#1a6a3a','#f0f0e0');
  for(const[px,pz]of[[-9,cz-2.4],[9,cz-2.4],[-9,cz+2.4],[9,cz+2.4]])slab(B,px-.2,px+.2,pz-.2,pz+.2,0,4.4,0xdddddd);
  PR.pave(B,0,34,6.2,22,0x6a6c70);PR.pump(B,-6.2,cz-.6);PR.pump(B,6.2,cz-.6);for(const px of[-9.5,-2.8,2.8,9.5])PR.bollard(B,px,cz-.6);
  makeCar(WX(B,-6.2),WZ(B,cz+1.8),PI/2);makeCar(WX(B,6.2),WZ(B,cz-3.4),PI/2);
  PR.bin(B,-13.5,8.2);PR.bin(B,-12.4,8.2);cyl(B,.3,1.1,13.2,.55,8.2,0x2a6ad0,true);deco(B,.8,.4,.05,13.2,1.3,8.5,0x88ccee);tsign(B.g,'AIR/WATER',13.2,2,8.55,.9,.4,'#2a6ad0','#fff','bold 28px Arial');
  const ex=-6.7,ez=-12.2;for(const[w,d,px,pz]of[[.15,3,ex-1.9,ez],[.15,3,ex+1.9,ez],[3.9,.15,ex,ez-1.5]])slab(B,px-w/2,px+w/2,pz-d/2,pz+d/2,0,1.8,0x7a6a4a);PR.dump(B,ex,ez);rearDoorBits(B,9,-6.2,3.3);PR.bin(B,12,-8.2)}});LASTB=B;return B}

function bTrigger(x,z,t){const put2=[['ccase',-8,5],['ccase',-5.5,5],['ccase',-3,5],['ccase',5.5,5],['ccase',8,5],['ccase',10.5,5],['register',-9,3.6],['gunrack',-14.5,1,PI/2],['gunrack',-14.5,-1,PI/2],['gunrack',-14.5,-3,PI/2],['shelf',13.9,1,-PI/2],['shelf',13.9,-1.4,-PI/2],['shelf',13.9,-3.8,-PI/2],['safe',-3.4,-9.4],['workbench',4.8,-10.4],['workbench',9.2,-10.4],['safe',2.2,-9.4],['key',0,-5.4]];
 return pb(x,z,t,{w:30,d:23,h:4.6,wall:0x5a5a60,floor:0x7a7a74,door:0x2a2a2e,dx:0,bd:-3,
 f:[{k:'w',c:-9},{k:'w',c:-5.5},{k:'w',c:5.5},{k:'w',c:9},{k:'d',c:0}],b:[{k:'d',c:-3,s:-1}],walls:[[1,-7.5,BX0,BX1,[{k:'d',c:-3,s:-1}]]],
 rooms:[{r:[BX0,BX1,-7.2,BZ1],loot:'gunshop',n:3},{r:[BX0,BX1,BZ0,-7.7],loot:'gunshop',n:3}],put:put2,
 x:B=>{for(const px of[-9,-5.5,5.5,9])for(let i=0;i<7;i++)deco(B,.06,1.6,.06,px-1+i*.33,1.9,11.55,0x222222);
  deco(B,.3,.4,.1,1.4,1.3,11.66,0x111111);deco(B,.2,.12,.04,1.4,1.4,11.72,0x33ff66,0x228844);
  tsign(B.g,'THE TRIGGER GUARD',0,4.2,11.62,10,1.1,'#111','#e0b020','bold 80px Impact');PR.pave(B,0,30,11.5,14,0x9a9ca0);for(let i=0;i<7;i++){if(i===3)continue;PR.bollard(B,-6+i*2,13,0x555555)}
  stallsAndCars(B,1);rearDoorBits(B,-3,-11.7,3.2);PR.dump(B,6,-14.5)}})}

function bBowling(x,z,t){const put2=[];for(let i=0;i<6;i++){put2.push(['lane',-9.6+i*2.1,-1.9],['pinrow',-9.6+i*2.1,-7.4])}
 put2.push(['counter',-10,9.3],['arcade',-14.1,7.2,PI/2],['arcade',-14.1,8.4,PI/2],['arcade',-14.1,9.6,PI/2],['counter',10.6,-5.9],['bench',0,8.2],['bench',3,8.2],['table',6,9],['table',9,9],['table',12,9]);
 return pb(x,z,t,{w:30,d:23,h:6,wall:0x4a5a8a,floor:0xb0a890,door:0x2a2a50,dx:0,bd:-12,
 f:[...wins([-11,-7.5,7.5,11]),{k:'d',c:-1.6},{k:'d',c:1.6}],b:[{k:'d',c:-12,s:-1},{k:'d',c:12,s:-1}],
 walls:[[1,6.2,BX0,BX1,[{k:'g',c:-9},{k:'g',c:-1.6},{k:'g',c:1.6},{k:'g',c:9}]],[0,11.2,BZ0,-4.8,[{k:'d',c:-8.6}]],[1,-4.9,11.2,BX1,[]],[1,-9.9,BX0,-11.4,[{k:'d',c:-13}]],[0,-11.5,BZ0,-9.9,[]]],
 rooms:[{r:[BX0,BX1,6.4,BZ1],f:[['plant','w',.05]],loot:'bowling',n:2},{r:[11.4,BX1,BZ0,-5],f:[['stove','e',.3],['sink','e',.8],['freezer','s',.5]],loot:'bowling',n:2},{r:[BX0,11,-5,6],loot:'bowling',n:2},{r:[BX0,-11.7,BZ0,-10.1],f:[['crate','n',.5],['box','w',.5],['shelf','s',.5]],loot:'bowling'}],
 put:put2,x:B=>{slab(B,-13.6,11,3.3,5,0,.35,0x6a4a4a,true);slab(B,-13.6,11,5,5.6,0,.17,0x6a4a4a,true);for(let i=0;i<6;i++){deco(B,1.4,.05,.5,-9.6+i*2.1,1.1,4,0xdddddd);deco(B,.3,.5,.3,-9.6+i*2.1,.62,3.6,0x333333)}
  deco(B,13,2.4,1.1,-4,1.2,-9.3,0x2a2a30);tsign(B.g,'GUTTER LANES',0,6.4,11.62,10,1.2,'#1a0a3a','#ff5ac8','bold 80px Impact');
  const nb=mesh(new THREE.TorusGeometry(1.1,.14,8,20),0xff2a8a,-9.6,5.2,11.75,B.g);nb.material=new THREE.MeshBasicMaterial({color:0xff2a8a});
  for(const px of[-11.5,11.5]){cyl(B,.55,1.3,px,.65,13.4,0xf5f5f0,true,10);cyl(B,.3,1,px,1.8,13.4,0xf5f5f0,false,10);mesh(new THREE.SphereGeometry(.38,8,6),0xf5f5f0,px,2.5,13.4,B.g);deco(B,1.1,.12,1.1,px,1.1,13.4,0xcc2222)}
  PR.pave(B,0,30,11.5,14,0xa8a8a4);stallsAndCars(B,3);rearDoorBits(B,-12,-11.7,3.6);rearDoorBits(B,12,-11.7,3.6);PR.dump(B,0,-14.6)}})}

function bPawn(x,z,t){const cs=CUR.cs;
 const sh=pb(x,z+cs*5.5,t,{w:30,d:14,h:4.4,wall:0x6a5a4a,floor:0x8a8068,door:0x2a2a2a,dx:-8,bd:-3,
 f:[{k:'w',c:-12},{k:'w',c:-4},{k:'w',c:4},{k:'w',c:11},{k:'d',c:-8}],b:[{k:'d',c:-3,s:-1},{k:'d',c:8,s:-1}],
 walls:[[1,-2.4,BX0,BX1,[{k:'d',c:-3},{k:'d',c:8,s:-1}]]],
 rooms:[{r:[BX0,BX1,-2.2,6.85],f:[['ccase','w',.2],['ccase','w',.6],['ccase','e',.3],['rack','n',.2],['aisle','c',.12,0,0],['aisle','c',.3,0,0]],loot:'pawn',n:3},{r:[BX0,BX1,-6.85,-2.6],f:[['safe','n',.2],['shelf','w',.5],['crate','s',.5],['shelf','e',.5],['crate','n',.8]],loot:'pawn',n:3}],
 put:[['counter',2,2.4],['counter',4.4,2.4],['counter',6.8,2.4],['register',3.4,1.7]],
 x:B=>{for(let i=0;i<9;i++)deco(B,.06,1.2,.06,1.4+i*.5,1.9,2.4,0x333333);deco(B,9,.06,.06,3.4,2.5,2.4,0x333333);
  for(const px of[-12,-4,4,11])for(let i=0;i<5;i++)deco(B,.05,1.4,.05,px-.6+i*.3,1.7,7.05,0x222222);
  const b3=mesh(new THREE.TorusGeometry(.7,.2,8,14),0xd8a020,10,5.3,7.2,B.g);b3.material.emissive.setHex(0x553a00);tsign(B.g,'GOLDEN FENCES PAWN SHOP',-3,5.3,7.12,10,1,'#222','#e8b820','bold 54px Impact');
  PR.pave(B,0,30,7,9.8,0xb4b4ae);PR.pave(B,16.8,3.4,-23,7,0x7a7c80);PR.lamp(B,0,3.1,-7.0)}});
 for(let i=0;i<3;i++){const g=subB(sh,-8.5+i*8.5,-14,8,6.5,3.6,0x7a7468,0x7a7a74,0x4a4a4a,true);g.dx=0;
  shell(g,{f:[{k:'g',c:-1.6},{k:'g',c:0},{k:'g',c:1.6}],b:[{k:'d',c:0}],l:[],r:[]});deco(g,5,1,.1,0,3.1,3.2,0x9a9ea2);slab(g,-4.1,4.1,-3.35,3.35,3.6,3.9,0x3a3a38);
  rc(g,'auto',[-3.6,3.6,-2.6,2.6],1);if(i==1)put(g,'crate',3,-1.5);done(g,'pawn_garage',0)}
 LASTB=sh;return sh}

function bCarLot(x,z,t){const B=mk(x,z,38,34,0,0x777777,0x606060,0x333333);B.dx=0;flatM(38,34,0x4c4e52,0,.02,0,B.g);
 const L=18.6,F=16.6;const post=(px,pz)=>deco(B,.1,2,.1,px,1,pz,0x8a8f94);
 for(let px=-L;px<=L+.01;px+=2)for(const pz of[-F,F]){if(Math.abs(px)<4.2&&pz==F)continue;if(Math.abs(px)<4.2&&pz==-F)continue;post(px,pz)}for(let pz=-F;pz<=F+.01;pz+=2)for(const px of[-L,L])post(px,pz);
 const wire=(w,d,px,pz)=>{const m=mesh(BX(w,1.8,d),0x8a8f94,px,1.2,pz,B.g);m.material.transparent=true;m.material.opacity=.35;addSolid(m)};
 wire(L-4.2,.05,(-L-4.2)/2,F);wire(L-4.2,.05,(L+4.2)/2,F);wire(L-4.2,.05,(-L-4.2)/2,-F);wire(L-4.2,.05,(L+4.2)/2,-F);wire(.05,2*F,-L,0);wire(.05,2*F,L,0);
 for(const pz of[-F,F]){deco(B,2*L,.03,.03,0,4.2,pz,0xe0e0e0);for(let i=0;i<19;i++)deco(B,.4,.35,.02,-L+1+i*2,4.0,pz,[0xdc2626,0xfbbf24,0x2563eb][i%3])}
 deco(B,.15,5,.15,-4.2,2.5,F,0x666666);deco(B,.15,5,.15,4.2,2.5,F,0x666666);tsign(B.g,'KRASCHE & BURNS USED AUTOS',0,4.6,F+.1,8,.9,'#b01a1a','#fff','bold 48px Impact');
 deco(B,3.2,1.8,.08,5.6,.9,-F,0x5a5e62);
 for(let i=0;i<8;i++)PR.car(B,-14+(i%4)*5,i<4?6:-2);for(let i=0;i<3;i++)PR.car(B,i*5,-12);
 slab(B,9,15,2,7,0,.6,0x777c80,true);slab(B,15,15.8,3,6,0,.4,0x777c80,true);slab(B,15.8,16.6,3,6,0,.2,0x777c80,true);const dc=makeCar(WX(B,12),WZ(B,4.5),0);if(dc&&dc.position)dc.position.y=.6;
 const off=subB(B,-12,-12.4,12,8,3.2,0xb8b0a0,0x8a8070,0x3a2a2a);off.dx=0;
 shell(off,{f:[...wins([-4.2,4.2]),{k:'d',c:0}],b:[{k:'d',c:3,s:-1}],l:wins([0]),r:wins([0])});
 WL(off,0,2,-3.9,-1.2,[{k:'d',c:-2.6}],3.2,{th:.2,c:0xcbbfae});WL(off,1,-1.2,2,5.85,[],3.2,{th:.2,c:0xcbbfae});
 furn(off,[['desk','n',.5],['chair','n',.5,.9,1.1,PI],['shelf','w',.5],['bench','s',.2]],[-5.8,1.9,-3.8,3.8]);furn(off,RM.bath,[2.15,5.8,-3.8,-1.4]);rc(off,'auto',[-5.7,1.8,-3.7,3.7],2);
 roof(off,3.2,'flat',0x4a4a48);tsign(off.g,'SALES',0,3.7,4.12,2,.5,'#222','#ffd24a','bold 40px Impact');done(off,'carlot_office',ri(0,1));
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});for(let i=ri(1,3);i>0;i--)zAt(B,rnd(-16,16),rnd(.6,3.4));LASTB=B;return B}

function bMotel(x,z,t){const B=mk(x,z,30,23,3.2,0xc89a6a,0x8a8a82,0x4a2a1a);B.dx=0;const P={th:.2,c:0xcbbfae},H=3.2,UH=2.9,zc=[-11.5,-5.75,0,5.75,11.5];
 flatM(30,23,0x3a3c40,0,.02,0,B.g);flatM(13,17.5,0x4c4e52,0,.025,2.8,B.g);
 const rng=(side)=>side<0?[-15,-7]:[7,15];
 for(const side of[-1,1]){const ox=side*15,ix=side*7,[a,b]=rng(side);
  for(const lv of[0,1]){B.y=lv?H+.1:0;const hh=lv?UH:H;const occK=B.occ;if(lv)B.occ=[];
   WL(B,0,ox,-11.5,11.5,wins([-8.6,-2.9,2.9,8.6]),hh,P);
   WL(B,0,ix,-11.5,11.5,[-9.3,-3.55,2.2,7.95].map(c=>({k:'d',c,s:side})).concat(wins([-6.9,-1.15,4.6,10.1])),hh,P);
   for(let i=1;i<4;i++)WL(B,1,zc[i],a,b,[],hh,P);
   if(!lv){WL(B,1,-11.5,a,b,[],hh,P);WL(B,1,11.5,a,b,side<0?[{k:'d',c:-11},{k:'w',c:-8.6}]:[{k:'w',c:11}],hh,P)}else{WL(B,1,-11.5,a,b,[],hh,P);WL(B,1,11.5,a,b,[{k:'w',c:side*11}],hh,P)}
   for(let i=0;i<4;i++){const r=[a+.2,b-.2,zc[i]+.2,zc[i+1]-.2];if(!lv&&side<0&&i==3){furn(B,[['counter','n',.25],['desk','n',.75],['key','w',.5],['machine','w',.12],['machine','w',.3],['bench','s',.3],['plant','s',.9]],r);rc(B,'motel',r,1)}
    else{furn(B,[['bed','n',.5],['tv',side<0?'w':'e',.92],['box',side<0?'w':'e',.1]],r);if(!lv)rc(B,'motel',r,1)}}
   if(lv)B.occ=occK}B.y=0;
  const wx0=side<0?-15:5.4,wx1=side<0?-5.4:15;slab(B,wx0,wx1,-11.5,11.5,H-.05,H+.1,0x7a7a74,true);slab(B,wx0,wx1,-11.5,11.5,H+UH+.15,H+UH+.4,0x5a4a3a);slab(B,side*5.4-.04,side*5.4+.04,-11.5,11.5,H+.1,H+1.1,0x8a8f94);
  stairs(B,side*4.7,10.8,-1,11,(H+.1)/11,.58,1.4,0x8a8a82)}
 // back wing (maintenance/laundry in the centre room opens to the service alley)
 for(const lv of[0,1]){B.y=lv?H+.1:0;const hh=lv?UH:H;const occK2=B.occ;if(lv)B.occ=[];WL(B,1,-11.5,-7,7,lv?wins([-4.7,4.7]):[...wins([-4.7,4.7]),{k:'d',c:0,s:-1}],hh,P);WL(B,1,-5,-7,7,[{k:'d',c:-4.67},{k:'d',c:0},{k:'d',c:4.67}],hh,P);WL(B,0,-2.33,-11.5,-5,[],hh,P);WL(B,0,2.33,-11.5,-5,[],hh,P);
  for(const[a,b]of[[-5.5,-2.5],[2.5,5.5]]){furn(B,[['bed','n',.5],['tv','e',.9]],[a,b,-11.3,-5.2]);if(!lv)rc(B,'motel',[a,b,-11.3,-5.2],1)}
  if(lv)furn(B,[['bed','n',.5],['tv','e',.5]],[-2.15,2.15,-11.3,-5.2]);else{furn(B,[['washer','n',.2],['dryer','n',.5],['shelf','e',.5],['crate','w',.5]],[-2.15,2.15,-11.3,-5.2]);rc(B,'hardware',[-2.15,2.15,-11.3,-5.2],1)}if(lv)B.occ=occK2}
 B.y=0;slab(B,-7,7,-11.5,-5,H-.05,H+.1,0x7a7a74,true);slab(B,-7,7,-11.5,-5,H+UH+.15,H+UH+.4,0x5a4a3a);
 const wy=-4.2;/* upper walkway across the back wing */slab(B,-7,7,-5,-3.4,H-.05,H+.1,0x7a7a74,true);slab(B,-5.4,5.4,-3.46,-3.34,H+.1,H+1.1,0x8a8f94);
 tsign(B.g,'RECEPTION',-11,2.6,11.58,2.2,.5,'#222','#ffd24a','bold 36px Impact');deco(B,.3,6,.3,0,3,15.5,0x888888);deco(B,6.8,2.4,.3,0,6.4,15.5,0xf0c020,0x886600);tsign(B.g,'SUNSHINE MOTEL',0,6.6,15.7,6.2,1.2,'#f0c020','#c0391a','bold 54px Impact');tsign(B.g,'VACANCY',0,5.6,15.7,3.6,.5,'#222','#ff3030','bold 40px Arial');
 PR.stalls(B,-2.8,2,-3,1);PR.car(B,-1.4,-1);PR.car(B,1.4,-.5);PR.pave(B,0,30,11.5,13.2,0x8e9093);PR.bollard(B,-2,11.6);PR.bollard(B,2,11.6);
 rearDoorBits(B,0,-11.7,2.9);PR.dump(B,6,-14.5);PR.bin(B,-5,-13.4);buildings.push({x:B.x,z:B.z,w:30,d:23,t:t.id});Zs(B,ri(2,4));LASTB=B;return B}

function bAztec(x,z,t){const put2=[['counter',-6,8.4],['counter',-3.4,8.4],['register',-4.6,7.7],['freezer',5.6,9.6],['freezer',8,9.6],['machine',12.6,9.2],['machine',13.8,9.2],['bench',-12,9.4],['plant',-14,10.4],['plant',14,10.4]];
 return pb(x,z,t,{w:30,d:23,h:7,wall:0x8a3a4a,floor:0x6a3a3a,door:0xd8a830,dx:0,bd:-13.4,
 f:[{k:'w',c:-11},{k:'w',c:-7.5},{k:'d',c:-1.6},{k:'d',c:1.6},{k:'w',c:7.5},{k:'w',c:11}],b:[{k:'d',c:-13.4,s:-1},{k:'d',c:13.4,s:-1},{k:'d',c:0,s:-1}],
 walls:[[1,6,BX0,BX1,[{k:'d',c:-12.5},{k:'d',c:12.5,s:-1}]]],
 rooms:[{r:[BX0,BX1,6.4,BZ1],loot:'cinema',n:2},{r:[BX0,BX1,BZ0,5.6],loot:'cinema',n:2}],put:put2,
 x:B=>{/* sloped seating: 4 stepped tiers (0.3m rise) climbing away from the screen; benches sit on each tier */
  for(let r=0;r<4;r++){const zc=3.9-r*2.1,h=.3*(r+1);slab(B,-13.8,13.8,zc-1.05,zc+1.05,0,h,0x5a2a2a,true);B.y=h;for(let c=0;c<9;c++){if(c==4)continue;put(B,'bench',-10.4+c*2.6,zc,0)}B.y=0}
  const sc=mesh(BX(18,6,.2),0xe8e8e0,0,3.8,5.75,B.g);sc.material.emissive.setHex(0x333333);deco(B,19,.4,.4,0,6.9,5.7,0x3a1a1a);
  deco(B,4.5,2,2,0,5.2,-10.2,0x4a4a50);deco(B,3.6,.6,.06,0,5.4,-9.15,0x9cc8e8);deco(B,.3,.3,.7,0,5.2,-9,0x888888);deco(B,.12,.12,14,0,5.3,-2,0xfff8c0,0x888866);
  const tb=mesh(BX(1.8,1.3,1.2),0x7a2a2a,-9,.65,13.5,B.g);addSolid(tb);glassP(B,-9,1.3,12.85,1.5,.7);tsign(B.g,'TICKETS',-9,2.2,12.9,1.8,.4,'#222','#ffd24a','bold 30px Impact');
  slab(B,-5,5,12.4,16.4,3.6,3.9,0xd8a830);for(const[sx,sz]of[[-4.8,12.6],[4.8,12.6],[-4.8,16.2],[4.8,16.2]])slab(B,sx-.15,sx+.15,sz-.15,sz+.15,0,3.6,0xc0c0b8);
  deco(B,14,2.2,.4,0,9,11.7,0x2a0a0a);tsign(B.g,'THE AZTEC',0,8.4,11.95,10,2,'#1a0a0a','#ffcc44','bold 110px Impact');for(let i=0;i<14;i++){const l=mesh(new THREE.SphereGeometry(.14,6,5),0xfff2a0,-6.5+i,7.1,12,B.g);l.material=new THREE.MeshBasicMaterial({color:0xfff2a0})}
  PR.pave(B,0,30,11.5,14,0xa8a8a4);PR.bollard(B,-11,13.2);PR.bollard(B,11,13.2);stallsAndCars(B,1);for(const px of[-13.4,0,13.4])rearDoorBits(B,px,-11.7,3.6);PR.dump(B,6,-14.5)}})}


function bChurchN(x,z,t){const put2=[['altar',0,-9.6],['desk',-3.4,-9.6],['desk',3.4,-10.2],['plant',-12,-10.4],['plant',12,-10.4]];
 for(let r=0;r<6;r++){for(const s of[-1,1])for(let k=0;k<2;k++)put2.push(['pew',s*(2.4+k*3.4)+(s>0?.2:-.2),5.4-r*2.2,PI])}
 return pb(x,z,t,{w:30,d:23,h:7.4,wall:0xd8d0c0,floor:0x7a6a5a,door:0x5a3a1a,dx:0,bd:10,roof:'gable',rc:0x4a3a3a,
 f:[{k:'w',c:-11},{k:'w',c:-7.5},{k:'d',c:-1},{k:'d',c:1},{k:'w',c:7.5},{k:'w',c:11}],b:[{k:'d',c:10,s:-1}],l:wins([-7,-2.5,2.5,7]),r:wins([-7,-2.5,2.5,7]),
 walls:[[1,-7.2,9,BX1,[{k:'d',c:10}]],[0,9,-11.35,-7.3,[]]],
 rooms:[{r:[9.2,BX1,BZ0,-7.4],f:[['desk','n',.5],['shelf','e',.5],['wardrobe','s',.4]],loot:'church',n:2},{r:[BX0,BX1,-7,BZ1],f:[['plant','n',.1]],loot:'church',n:2}],put:put2,
 x:B=>{slab(B,-4.2,4.2,-11.2,-8.2,0,.4,0x6a4a3a,true);const ch=mesh(BX(.2,2,.2),0xd8c060,0,2.6,-10.9,B.g);deco(B,1.2,.2,.2,0,3,-10.9,0xd8c060);
  // steeple / bell tower silhouette over the entrance
  slab(B,-3,3,8,11,7.4,15,0xd0c8b8);const sp=mesh(new THREE.ConeGeometry(3.6,6,4),0x4a3a3a,0,18,9.5,B.g);sp.rotation.y=PI/4;deco(B,.2,2.4,.2,0,22,9.5,0xd8c060);deco(B,1.2,.2,.2,0,22.5,9.5,0xd8c060);for(const s of[-1,1])deco(B,.1,2.4,.9,s*3.01,12,9.5,0x2a2a2a);
  slab(B,-2.5,2.5,11.5,12.2,0,.3,0xb8b0a0,true);slab(B,-2.5,2.5,12.2,12.9,0,.15,0xb8b0a0,true);for(const s of[-1,1])deco(B,.3,3.2,.3,s*2.4,1.6,11.9,0xc8c0b0);deco(B,5,.3,.1,0,3.4,11.62,0x4a3a2a);tsign(B.g,'ST. MARY\'S',0,5.2,11.58,5,.8,'#d8d0c0','#4a3a2a','bold 52px Georgia');
  PR.lawn(B,0,38,13.8,17.5,0x3f6a2f);PR.pave(B,0,5,13.4,17.5,0xb4b4ae);const nb=mesh(BX(1.6,1.2,.15),0x4a3a2a,8,1.1,15.6,B.g);addSolid(nb);cyl(B,.08,.9,7.4,.45,15.6,0x4a3a2a);cyl(B,.08,.9,8.6,.45,15.6,0x4a3a2a);tsign(B.g,'SERVICES SUN',8,1.2,15.5,1.4,1,'#d8c8a8','#222','bold 44px Arial');
  rearDoorBits(B,10,-11.7,3.2);PR.bin(B,5,-13.4);PR.bin(B,13,-13.4)}})}


// ---- full-tile yards (no single main shell): cemetery, water tower compound, park, corn maze
const zAt=(B,x,z)=>zombie(WX(B,x),WZ(B,z));
const yard=(x,z,t,kind)=>{const B=mk(x,z,38,34,0,0x777777,0x3a4a30,0x333333);B.dx=0;B.yardKind=kind;return B};
const wallRun=(B,x0,x1,z0,z1,h,col,th=.4)=>{const m=mesh(BX(Math.max(th,x1-x0),h,Math.max(th,z1-z0)),col,(x0+x1)/2,h/2,(z0+z1)/2,B.g);addSolid(m);return m};
function railFence(B,x0,x1,z0,z1,gaps){/* split-rail fence on one axis-aligned run, gaps=[[a,b]] along the run */const horiz=Math.abs(z1-z0)<.01,L=horiz?x1-x0:z1-z0;const ok=u=>!(gaps||[]).some(g=>u>g[0]&&u<g[1]);
 for(let u=0;u<=L+.01;u+=2.4){const c=(horiz?x0:z0)+u;if(!ok(c))continue;horiz?deco(B,.16,1.2,.16,c,.6,z0,0x6a4a2a):deco(B,.16,1.2,.16,x0,.6,c,0x6a4a2a)}
 const segs=[];let a=horiz?x0:z0;const e=horiz?x1:z1;const gs=(gaps||[]).slice().sort((p,q)=>p[0]-q[0]);for(const g of gs){if(g[0]>a)segs.push([a,g[0]]);a=Math.max(a,g[1])}if(a<e)segs.push([a,e]);
 for(const[s,f]of segs)for(const y of[.55,.95]){const m=mesh(BX(horiz?f-s:.1,.1,horiz?.1:f-s),0x7a5a3a,horiz?(s+f)/2:x0,y,horiz?z0:(s+f)/2,B.g);if(y>.9)addSolid(m)}}

function bCemetery(x,z,t){const B=yard(x,z,t,'cemetery');flatM(38,34,0x44563a,0,.02,0,B.g);flatM(2.6,31,0x8a8478,0,.03,0,B.g);flatM(32,2,0x8a8478,0,.03,2.5,B.g);
 const W=18.6,F=16.6;wallRun(B,-W,W,-F-.2,-F+.2,1.9,0x8a8a84);wallRun(B,-W-.2,-W+.2,-F,F,1.9,0x8a8a84);wallRun(B,W-.2,W+.2,-F,F,1.9,0x8a8a84);wallRun(B,-W,-2.2,F-.2,F+.2,1.9,0x8a8a84);wallRun(B,2.2,W,F-.2,F+.2,1.9,0x8a8a84);
 for(const s of[-1,1]){deco(B,.6,3,.6,s*2.3,1.5,F,0x6a6a66);for(let i=0;i<5;i++)deco(B,.06,2.2,.06,s*(.4+i*.34),1.1,F,0x222222)}deco(B,4.6,.15,.15,0,2.9,F,0x222222);tsign(B.g,'ST. JUDE\'S CEMETERY',0,3.5,F+.1,4.4,.5,'#2a2a2a','#d8d0c0','bold 30px Georgia');
 for(let r=0;r<5;r++)for(let k=0;k<10;k++){const gx=(k<5?-14.5+k*2.7:3.7+(k-5)*2.7),gz=13-r*3.4;if(Math.abs(gx)<1.6)continue;if(gz<-3&&Math.abs(gx)<6.5)continue;const big=Math.random()<.12;const hs=mesh(BX(big?.6:.8,big?2.2:1.1,.22),big?0x9a9a98:0x8a8a88,gx,big?1.1:.55,gz-.9,B.g);addSolid(hs);flatM(.9,2,0x3e4e34,gx,.045,gz,B.g);B.occ.push([gx-.7,gx+.7,gz-1.3,gz+.5])}
 const mz=subB(B,0,-10,10,7,4.6,0x9a9a94,0x6a6a66,0x2a2a2a);shell(mz,{f:[{k:'d',c:0}],b:[],l:[],r:[]});/* open rear wall replaced below */
 furn(mz,[['grave','n',.2],['grave','n',.8],['grave','w',.5],['grave','e',.5]],[-4.8,4.8,-3.3,3.3]);rc(mz,'cemetery',[-4.8,4.8,-3.3,3.3],2);roof(mz,4.6,'pyr',0x7a7a74);deco(mz,.4,.9,.4,0,6.6,0,0xc8c8c0);deco(mz,1.1,.3,.4,0,6.8,0,0xc8c8c0);done(mz,'cemetery_mausoleum',ri(0,1));
 const sd=subB(B,13.5,-13,4,3,2.6,0x6a5a4a,0x5a4a3a,0x2a2a2a);shell(sd,{f:[{k:'d',c:0}],b:[],l:[],r:[]});rc(sd,'hardware',[-1.7,1.7,-1.2,1.2],1);roof(sd,2.6,'gable',0x4a3a2a);done(sd,'cemetery_shed',0);
 rc(B,'cemetery',[-16,16,-14,14],2);buildings.push({x:B.x,z:B.z,w:36,d:32,t:'cemetery'});for(let i=ri(3,6);i>0;i--)Math.random()<.6?zAt(B,rnd(-1,1),rnd(-3,14)):zAt(B,rnd(-14,14),2.5+rnd(-.8,.8));LASTB=B;return B}

function bWaterTower(x,z,t){const B=yard(x,z,t,'tower');flatM(38,34,0x6a6c70,0,.02,0,B.g);flatM(38,10,0x5a5c60,0,.025,-4,B.g);
 const W=18.6,F=16.6,chain=(a,b,c,d)=>{const m=mesh(BX(Math.max(.05,b-a),1.8,Math.max(.05,d-c)),0x8a8f94,(a+b)/2,1.2,(c+d)/2,B.g);m.material.transparent=true;m.material.opacity=.35;addSolid(m)};
 chain(-W,-3.2,F,F);chain(3.2,W,F,F);chain(-W,-3,-F,-F);chain(3,W,-F,-F);chain(-W,-W,-F,F);chain(W,W,-F,F);deco(B,3.4,1.8,.08,5.2,.9,-F,0x5a5e62);
 for(let u=-W;u<=W+.01;u+=3)for(const zz of[-F,F])if(Math.abs(u)>3.2)deco(B,.1,2,.1,u,1,zz,0x777c80);tsign(B.g,'KERBEROS PRODUCTIONS - AUTHORISED ONLY',0,3.6,F+.1,7,.6,'#222','#e8e8e0','bold 26px Arial');
 const tz=-6;slab(B,-5,5,tz-5,tz+5,0,.3,0x7a7c80,true);
 for(const[lx,lz]of[[-3.5,-3.5],[3.5,-3.5],[-3.5,3.5],[3.5,3.5]])slab(B,lx-.3,lx+.3,tz+lz-.3,tz+lz+.3,.3,13,0x6a7a8a);
 for(let k=0;k<3;k++){const yy=3+k*3.6;deco(B,7.4,.18,.18,0,yy,tz-3.5,0x5a6a7a);deco(B,7.4,.18,.18,0,yy,tz+3.5,0x5a6a7a);deco(B,.18,.18,7.4,-3.5,yy,tz,0x5a6a7a);deco(B,.18,.18,7.4,3.5,yy,tz,0x5a6a7a)}
 const tk=mesh(new THREE.CylinderGeometry(4.2,4.2,5.2,20),0xbfc6cc,0,15.6,tz,B.g);addSolid(tk);const rf=mesh(new THREE.ConeGeometry(4.5,2.2,20),0x8a9298,0,19.3,tz,B.g);for(let k=0;k<3;k++)cyl(B,4.25,.14,0,13.6+k*2.1,tz,0x6a727a,false,20);
 deco(B,.1,13,.1,3.2,6.5,tz+4.2,0xc8a030);tsign(B.g,'KERBEROS',0,15.6,tz+4.25,4,1.1,'#bfc6cc','#c0392b','bold 80px Impact');
 const off=subB(B,0,8.5,20,9,3.6,0x8a9aa8,0x7a7a80,0x2a3a4a);off.dx=0;
 shell(off,{f:[...wins([-7.5,-4.5,4.5,7.5]),{k:'d',c:0}],b:[{k:'d',c:7,s:-1},{k:'w',c:-4}],l:wins([0]),r:wins([0])});
 WL(off,0,6,-4.4,1.6,[],3.6,{th:.2,c:0xcbbfae});WL(off,1,1.7,6,9.8,[{k:'d',c:8}],3.6,{th:.2,c:0xcbbfae});
 furn(off,[['servrack','n',.1],['servrack','n',.5],['servrack','n',.9],['monitor','e',.5]],[6.15,9.8,-4.3,1.5]);
 for(let i=0;i<5;i++)put(off,'monitor',-8+i*2.4,i%2?-.6:-2.8,i%2?PI:0);put(off,'monitor',-8,3,PI);put(off,'desk',-1.5,3.4);put(off,'desk',2.4,3.4);
 rc(off,'office',[-9.8,5.8,-4.3,4.3],3);roof(off,3.6,'flat',0x4a4a48);tsign(off.g,'KERBEROS PRODUCTIONS',0,4.5,4.62,7,.9,'#1a1a22','#e8e8e0','bold 40px Arial');
 PR.pave(off,0,20,4.5,6.8,0x9a9ca0);done(off,'kerberos_office',ri(1,2));deco(B,3,.1,1,-14,.12,12,0x555);PR.dump(B,-12,-14);PR.lamp(B,5.2,3.2,-F+.2,1);
 buildings.push({x:B.x,z:B.z,w:36,d:32,t:t.id});for(let i=ri(2,4);i>0;i--)zAt(B,(Math.random()<.5?-1:1)*rnd(11,17),rnd(-14,14));LASTB=B;return B}

function bPlayground(x,z,t){const B=yard(x,z,t,'park');flatM(38,34,0x3f7a2f,0,.02,0,B.g);const W=18.6,F=16.6,gap=[[-2.4,2.4]];
 railFence(B,-W,W,F,F,gap);railFence(B,-W,W,-F,-F,[[-2.4,2.4]]);railFence(B,-W,-W,-F,F,[]);railFence(B,W,W,-F,F,[]);
 flatM(3,34,0x9a927f,0,.03,0,B.g);flatM(34,3,0x9a927f,0,.03,0,B.g);flatM(7.4,7.4,0xa89f88,0,.035,0,B.g);
 const mon=slab(B,-1.6,1.6,-1.6,1.6,0,.5,0x8a8a88);slab(B,-.9,.9,-.9,.9,.5,1,0x9a9a98);slab(B,-.5,.5,-.5,.5,1,4.6,0xaaaaa6);deco(B,1.4,.8,.1,0,.8,1.65,0x4a4a48);tsign(B.g,'IN MEMORIAM',0,.75,1.72,1.2,.6,'#3a3a38','#d8d0c0','bold 40px Georgia');
 for(const[bx,bz,ry]of[[-5.5,3,0],[5.5,3,0],[-5.5,-3,PI],[5.5,-3,PI],[0,10,0],[-10,0,PI/2]]){slab(B,bx-1,bx+1,bz-.3,bz+.3,.35,.5,0x6a4a2a);deco(B,2,.4,.08,bx,.85,bz+(ry?.28:-.28),0x6a4a2a)}
 // playground zone (west half, rear): swings, slide, sandbox
 const sx=-11,sz=-9;for(const s of[-1,1]){slab(B,sx+s*2.6-.1,sx+s*2.6+.1,sz-.1,sz+.1,0,2.6,0x8a8f94)}slab(B,sx-2.7,sx+2.7,sz-.08,sz+.08,2.55,2.7,0x8a8f94);for(const s of[-.9,.9]){deco(B,.03,2.4,.03,sx+s,1.4,sz,0x222222);deco(B,.5,.06,.2,sx+s,.45,sz,0xc0392b)}
 const slx=-5,slz=-12;slab(B,slx-1,slx+1,slz-.5,slz+.5,0,2,0x2a6ad0);const sl=mesh(BX(1,.1,3.4),0xe8b030,slx,1,slz+2.4,B.g);sl.rotation.x=.62;
 for(const[w,d,px,pz]of[[3.4,.2,-11,-14.5],[3.4,.2,-11,-11.5],[.2,3,-12.8,-13],[.2,3,-9.2,-13]])slab(B,px-w/2,px+w/2,pz-d/2,pz+d/2,0,.3,0x7a5a3a);flatM(3.2,2.8,0xd8c890,-11,.05,-13,B.g);
 for(const[tx,tz]of[[-14,10],[14,10],[14,-10],[-3,-14]])bldTree(B,tx,tz,.9);
 for(const o of[[-13,-8,-9,-2.6,-16.5,-8.4],]);B.occ.push([-14.5,-7,-15.5,-6]);B.occ.push([-3,3,-3,3]);
 rc(B,'park',[-16,16,-15,15],3);buildings.push({x:B.x,z:B.z,w:36,d:32,t:'park'});for(let i=ri(2,4);i>0;i--)Math.random()<.5?zAt(B,rnd(-15,15),rnd(-1.2,1.2)):zAt(B,rnd(-1.2,1.2),rnd(-14,14));LASTB=B;return B}

function bCornMaze(x,z,t){const B=yard(x,z,t,'maze');flatM(38,34,0x6a6a34,0,.02,0,B.g);
 const C=9,R=6,cs=4.1,x0=-C*cs/2,z0=-15.3,wt=.9;/* maze cells (col,row); row R is the front side (+Z) */
 const vis=[],Vw=[],Hw=[];for(let i=0;i<=C;i++){Vw.push([]);for(let j=0;j<R;j++)Vw[i].push(1)}for(let j=0;j<=R;j++){Hw.push([]);for(let i=0;i<C;i++)Hw[j].push(1)}
 const seen=new Set(),stack=[[4,R-1]];seen.add(4+','+(R-1));
 while(stack.length){const[ci,cj]=stack[stack.length-1],nb=[[ci+1,cj],[ci-1,cj],[ci,cj+1],[ci,cj-1]].filter(([a,b])=>a>=0&&a<C&&b>=0&&b<R&&!seen.has(a+','+b));if(!nb.length){stack.pop();continue}
  const[a,b]=nb[ri(0,nb.length-1)];if(a!==ci)Vw[Math.max(a,ci)][cj]=0;else Hw[Math.max(b,cj)][ci]=0;seen.add(a+','+b);stack.push([a,b])}
 for(let i=3;i<=5;i++)for(let j=2;j<=3;j++){if(i<5)Vw[i+1][j]=0;if(j<3)Hw[j+1][i]=0}
 Hw[R][4]=0;Hw[0][1]=0;/* entry (front) and rear exit */
 const corn=(w,d,px,pz)=>{const m=mesh(BX(w,2.7,d),[0x7f9a3a,0x8aa03a,0x6f8a30][ri(0,2)],px,1.35,pz,B.g);addSolid(m);deco(B,w*.94,.5,d*.9,px,2.85,pz,0xc8b040)};
 for(let i=0;i<=C;i++)for(let j=0;j<R;j++)if(Vw[i][j])corn(wt,cs+wt,x0+i*cs,z0+j*cs+cs/2);
 for(let j=0;j<=R;j++)for(let i=0;i<C;i++)if(Hw[j][i])corn(cs,wt,x0+i*cs+cs/2,z0+j*cs);
 flatM(3*cs-.4,2*cs-.4,0x9a8a4a,0,.04,z0+2.5*cs+0,B.g);
 const FX=19.2,FZ=17.2;railFence(B,-FX,FX,FZ,FZ,[[-3,3]]);railFence(B,-FX,FX,-FZ,-FZ,[[-5.2,-3.2]]);railFence(B,-FX,-FX,-FZ,FZ,[]);railFence(B,FX,FX,-FZ,FZ,[]);
 const ez=12.4;for(const s of[-1,1])slab(B,s*2.6-.2,s*2.6+.2,ez-.2,ez+.2,0,3.4,0x6a4a2a);slab(B,-2.8,2.8,ez-.2,ez+.2,3.3,3.7,0x6a4a2a);tsign(B.g,'CORN MAZE',0,3.0,ez+.25,4.6,.8,'#e8d8a0','#6a3a10','bold 56px Impact');
 const tb=mesh(BX(2.4,2.2,1.8),0x7a5a3a,7,1.1,13.5,B.g);addSolid(tb);glassP(B,7,1.4,12.55,1.4,.7);tsign(B.g,'TICKETS $5',7,2.5,12.55,2,.5,'#e8d8a0','#6a3a10','bold 30px Impact');
 for(let i=0;i<3;i++)deco(B,.9,.9,.9,-8+i*1.1,.45,14,0xd08a20);
 rc(B,'cornmaze',[-5.8,5.8,z0+2.5*cs-3.8,z0+2.5*cs+3.8],2);B.occ.push([6.5,8.5,12.5,14.5]);buildings.push({x:B.x,z:B.z,w:36,d:34,t:'park'});for(let i=ri(3,6);i>0;i--)zAt(B,x0+ri(0,C-1)*cs+cs/2,z0+ri(0,R-1)*cs+cs/2);LASTB=B;return B}

// ================= THE NEW CATALOGUE =================
const NEWCAT=[];
const nvar=()=>({intact:{props:[]},looted:{props:[]},ruined:{props:[]}});
function defN(id,name,pool,cat,build,loot,note){NEWCAT.push({id,name,pool,scope:pool,category:cat,front:'south',builder:'prop',build,loot,note:note||'',w:pool==='half'?HALFD.w:BIGD.w,d:pool==='half'?HALFD.d:BIGD.d,variants:nvar(),legacy:false})}
BUILDERS.prop=(x,z,t)=>t.build(x,z,t);
// POOL 1 — dynamic half-lots
defN('piety_mutual_bank','Piety Mutual Bank','half','commercial',hBank,'bank');
defN('piety_medical_clinic','Piety Medical Clinic','half','commercial',hClinic,'clinic');
defN('cuppa_joe','Cuppa Joe','half','commercial',hCoffee,'coffee');
defN('mr_foos_takeout','Mr. Foo\'s Takeout','half','commercial',hFoo,'takeout');
defN('rays_storage_units','Ray\'s Storage & Containment Units','half','commercial',hRay,'storage');
defN('fancypantz_wearables','Fancypantz Wearables','half','commercial',hFancy,'clothing');
defN('andolinis_groceria','Andolini\'s Groceria','half','commercial',hAndolini,'convenience');
defN('white_trash_house','White Trash House','half','residential',hWhiteTrash,'house');
defN('geins_butcheria','Gein\'s Butcheria','half','commercial',hButcher,'butcher');
defN('laundromat','Laundromat','half','commercial',hLaundro,'laundromat');
// POOL 2 — full-tile compounds
defN('food_library','The Food Library','big','commercial',bFoodLib,'supermarket');
defN('lucky_ducky','Lucky Ducky: Grocery & Meats','big','commercial',bLucky,'supermarket');
defN('eco_pump','Eco Pump','big','commercial',bEcoPump,'gas');
defN('trigger_guard','The Trigger Guard','big','commercial',bTrigger,'gunshop');
defN('gutter_lanes','Gutter Lanes','big','commercial',bBowling,'bowling');
defN('willy_burgerorium','Willy the Fox\'s Burgerorium','big','commercial',bBurger,'burger');
defN('golden_fences_pawn','Golden Fences Pawn Shop','big','commercial',bPawn,'pawn');
defN('morgans_drug','Morgan\'s Drug & Pharmacy','big','commercial',bPharmacy,'pharmacy');
defN('krasche_burns_autos','Krasche & Burns Used Autos','big','commercial',bCarLot,'auto');
defN('hammertime','Hammertime','big','commercial',bHardware,'hardware');
defN('sunshine_motel','Sunshine Motel','big','commercial',bMotel,'motel');
defN('the_aztec','The Aztec','big','commercial',bAztec,'cinema');
defN('church','Church','big','civic',bChurchN,'church');
defN('cemetery','Cemetery','big','civic',bCemetery,'cemetery');
defN('water_tower_kerberos','Water Tower & Kerberos Productions','big','civic',bWaterTower,'office');
defN('playground_memorial_park','Playground & Memorial Park','big','civic',bPlayground,'park');
defN('corn_maze','Corn Maze','big','civic',bCornMaze,'cornmaze');
NEWCAT.forEach(d=>{d.variants={intact:{props:[]},looted:{props:['trash','glass','papers']},ruined:{props:['rubble','beam','tarp']}}});
const LABCAT=NEWCAT.concat(CATALOGUE); // dev toolkit browses the new catalogue first, then the quarantined legacy one
function validateNewCatalogue(){const E=[],ids=new Set();const H=NEWCAT.filter(d=>d.pool==='half'),Bg=NEWCAT.filter(d=>d.pool==='big');
 if(H.length<10)E.push('half-lot pool has '+H.length+' entries, expected at least 10');if(Bg.length<17)E.push('BIG pool has '+Bg.length+' entries, expected at least 17'); // v073: layers add more (newlots.js)
 for(const d of NEWCAT){if(d.max!==undefined&&!(d.max>=1&&d.max<=3))E.push(d.id+': max must be 1-3 (a repeat needs a different condition)');if((d.min||0)>(d.max||2))E.push(d.id+': min > max')}
 for(const d of NEWCAT){if(ids.has(d.id))E.push('duplicate id '+d.id);ids.add(d.id);if(!d.name||typeof d.build!=='function')E.push(d.id+': missing name/build');if(d.loot&&!LOOT_TABLES[d.loot])E.push(d.id+': missing loot table '+d.loot)}return E}
window.__newCatalogueErrors=validateNewCatalogue();if(window.__newCatalogueErrors.length)console.error('NEW CATALOGUE INVALID',window.__newCatalogueErrors);

// ================= MAP GENERATOR v2 =================
function slotOf(p,sub){if(!sub)return{id:p.id,sub:null,col:p.col,row:p.row,block:p.block,front:p.front,x0:p.x0,x1:p.x1,z0:p.z0,z1:p.z1,cx:p.cx,cz:p.cz};
 const a=sub==='A';const x0=a?p.x0:p.cx,x1=a?p.cx:p.x1;return{id:p.id+sub,sub,col:p.col,row:p.row,block:p.block,front:p.front,x0,x1,z0:p.z0,z1:p.z1,cx:(x0+x1)/2,cz:p.cz}}
function planTownV2(L){const bigs=NEWCAT.filter(d=>d.pool==='big'),halves=NEWCAT.filter(d=>d.pool==='half'),n=L.plots.length;
 /* v044: every building appears at most twice, and a repeated building always has two different conditions (0 intact, 1 looted, 2 ruined).
    v073: d.max (1-3, default 2; zMissionMapDB MaxCount 1 -> max 1) and d.min (houses: every town gets some, Survivors rumours want a house 70% of the time).
    19 half-lot types now, so 10-12 two-building plots (20-24 half slots) and the rest are full-plot compounds. */
 const nDual=ri(10,12),nBig=n-nDual,cnt={},used={},cap=d=>d.max||2;
 const take=(list,k)=>{const out=[];for(const d of shuf(list))for(let i=0;i<Math.min(d.min||0,cap(d))&&out.length<k;i++){cnt[d.id]=(cnt[d.id]||0)+1;out.push(d)}
  let bag=[];while(out.length<k){if(!bag.length)bag=shuf(list.filter(d=>(cnt[d.id]||0)<cap(d)));if(!bag.length)break;const d=bag.pop();if((cnt[d.id]||0)>=cap(d))continue;cnt[d.id]=(cnt[d.id]||0)+1;out.push(d)}return shuf(out)};
 const cond=d=>{const u=used[d.id]||(used[d.id]=[]),o=[0,1,2].filter(c=>!u.includes(c)),c=o[ri(0,o.length-1)];u.push(c);return c};
 const kinds=shuf([...Array(nDual).fill('dual'),...Array(nBig).fill('big')]);let hs=take(halves,2*nDual),bs=take(bigs,nBig);
 for(let t=0;t<200;t++){let bad=0;for(let i=0;i<hs.length;i+=2)if(hs[i+1]&&hs[i].id===hs[i+1].id)bad++;if(!bad)break;hs=shuf(hs)}
 return L.plots.map((p,i)=>{if(kinds[i]==='big'){const d=bs.pop();return{plot:p,kind:'big',defs:[d],lvs:[cond(d)]}}const A=hs.pop(),B=hs.pop();return{plot:p,kind:'dual',defs:[A,B],lvs:[cond(A),cond(B)]}})}
function drawSlotGround(p,it){const F=(w,d,c,x,z,y)=>{const m=mesh(new THREE.PlaneGeometry(w,d),c,x,y,z);m.rotation.x=-PI/2;return m},col={residential:0x2d3b26,commercial:0x3b3c3e,civic:0x3a4036};
 if(it.kind==='big')return drawPlot(p,it.defs[0].category);drawPlot(p,it.defs[0].category);F(GRID.PW/2,GRID.PD,col[it.defs[1].category],p.cx+GRID.PW/4,p.cz,.009);F(4,22,0x4a4a48,p.cx,p.cz,.012)}
function subPlotDivider(p){/* central dividing wall + utility space between Sub-Plot A and B (parent-tile geometry) */
 const g=new THREE.Group();g.position.set(p.cx,0,p.cz);scene.add(g);const m=(w,h,d,x,y,z,c)=>mesh(BX(w,h,d),c,x,y,z,g);addSolid(m(.3,2.6,HALFD.d,0,1.3,0,0x8a8a86));m(.5,.12,HALFD.d,0,2.66,0,0x6a6a66);
 for(const s of[-1,1]){m(.5,1.3,.45,s*.4,.9,-3.5,0x5a6a5a);m(.2,.3,.3,s*.4,1.7,-3.5,0xe8c020);for(const zz of[2.5,4.5])cyl2(g,.07,2.6,s*.3,1.3,zz,0x7a7a7a);m(.4,.5,.4,s*.35,.4,7,0x8a8a88);m(.35,.12,.5,s*.3,2.2,-8,0x555555)}return g}
function cyl2(g,r,h,x,y,z,c){const m=mesh(new THREE.CylinderGeometry(r,r,h,6),c,x,y,z,g);return m}
const NOYARD=new Set(['eco_pump','golden_fences_pawn','krasche_burns_autos','cemetery','water_tower_kerberos','playground_memorial_park','corn_maze','white_trash_house']);
/* v044: side/rear walls or fences with a rear gate. Local frame = the plot centre, front = +Z (same rotation as the building). */
function yardEnclosure(s,sub,t,lv,B){if(NOYARD.has(t.id))return null;const cs=s.front==='south'?1:-1,g=new THREE.Group();g.position.set(s.cx,0,s.cz);g.rotation.y=cs<0?PI:0;scene.add(g);
 const hw=(s.x1-s.x0)/2-.2,rz=-(GRID.PD/2-.2),fz=(t.pool==='half'?HALFD.d:BIGD.d)/2,r=Math.random(),style=t.category==='commercial'?(r<.35?'chain':'wall'):'wood',H=style==='wall'?2.3:style==='chain'?2.2:1.9,col=style==='wall'?0x8d8a84:style==='chain'?0x8a8f94:0x6b4a2b,pc=style==='wood'?0x4a3220:0x6a6f74;
 const seg=(x0,x1,z0,z1)=>{if(x1-x0<.05&&z1-z0<.05)return;const hz=(x1-x0)>(z1-z0),L=hz?x1-x0:z1-z0,n=Math.max(1,Math.ceil(L/5));
  for(let i=0;i<n;i++){if(lv===2&&Math.random()<.35)continue;const a0=i/n,a1=(i+1)/n,X0=hz?x0+(x1-x0)*a0:x0,X1=hz?x0+(x1-x0)*a1:x1,Z0=hz?z0:z0+(z1-z0)*a0,Z1=hz?z1:z0+(z1-z0)*a1;
   const m=mesh(BX(Math.max(.2,X1-X0),H,Math.max(.2,Z1-Z0)),col,(X0+X1)/2,H/2,(Z0+Z1)/2,g);if(style==='chain'){m.material.transparent=true;m.material.opacity=.4}addSolid(m);
   mesh(BX(Math.max(.3,X1-X0)+.02,.12,Math.max(.3,Z1-Z0)+.02),pc,(X0+X1)/2,H+.04,(Z0+Z1)/2,g);mesh(BX(.3,H+.15,.3),pc,hz?X0:(X0+X1)/2,(H+.15)/2,hz?(Z0+Z1)/2:Z0,g)}};
 const inner=sub?(sub==='A'?1:-1)*cs*hw:null;
 // gate: first free spot along the rear wall
 let gx=null;for(const c of [0,4,-4,7,-7,9,-9,11,-11]){if(Math.abs(c)>hw-1.6)continue;if(!blocked(s.cx+cs*c,s.cz+cs*(rz+1.5),.8,0,1.8)&&!blocked(s.cx+cs*c,s.cz+cs*(rz+3.2),.8,0,1.8)){gx=c;break}}
 if(gx===null)seg(-hw,hw,rz-.1,rz+.1);else{seg(-hw,gx-.8,rz-.1,rz+.1);seg(gx+.8,hw,rz-.1,rz+.1);for(const sx of[-.8,.8])mesh(BX(.3,H+.3,.3),pc,gx+sx,(H+.3)/2,rz,g);mesh(BX(1.9,.12,.3),pc,gx,H+.34,rz,g);mkDoor({g,y:0,dc:style==='wood'?0x5a3a22:0x3a3a3a,occ:[]},1,rz,gx,PK([1,-1]))}
 for(const sx of[-hw,hw]){const isInner=inner!==null&&Math.abs(sx-inner)<.01;seg(sx-.1,sx+.1,rz,isInner?-fz:fz)}
 return g}
/* v075: the town is built in steps (plan, one step per plot, final checks) so a loading screen can show progress between them.
   buildTownV2 runs them all at once, as before. */
function buildPlotV2(it,R,pop){const p=it.plot;try{drawSlotGround(p,it);
  if(it.kind==='big'){const t=it.defs[0],lv=it.lvs[0],s=slotOf(p,null),r=bld(s.cx,s.cz,t,lv,s);{const b0=buildings[buildings.length-1];if(b0){b0.cat=t.id;b0.cond=lv}}try{yardEnclosure(s,null,t,lv,r.B)}catch(e){console.error('yard',t.id,e)}R.placementErrors.push(...checkPlacement(s,t,r.n0,r.B));R.plan.push({plot:p.id,id:t.id,cond:COND_NAMES[lv],front:p.front,kind:'BIG'})}
  else{const ids=[],cn=[];['A','B'].forEach((sb,k)=>{const t=it.defs[k],lv=it.lvs[k],s=slotOf(p,sb),r=bld(s.cx,s.cz,t,lv,s);try{yardEnclosure(s,sb,t,lv,r.B)}catch(e){console.error('yard',t.id,e)}R.placementErrors.push(...checkPlacement(s,t,r.n0,r.B));ids.push(t.id);cn.push(COND_NAMES[lv]);const bn=buildings[buildings.length-1];if(bn){bn.sub=sb;bn.cat=t.id;bn.cond=lv}});
   const n0=scene.children.length,g=subPlotDivider(p);R.placementErrors.push(...checkPlacement(p,{id:'divider'},n0-1,null));R.plan.push({plot:p.id,id:ids.join('+'),cond:cn.join('/'),front:p.front,kind:'2 BUILD',subs:ids})}
  pop.add(p.id)}catch(err){R.placementErrors.push('plot '+p.id+' failed: '+err.message);console.error('plot build fail',p.id,err)}}
function finishTownV2(plan,R,pop){if(pop.size!==32||R.plan.length!==32)R.placementErrors.push('only '+R.plan.length+' of 32 plots were populated');
 R.stats={big:plan.filter(i=>i.kind==='big').length,dual:plan.filter(i=>i.kind==='dual').length};
 if(R.placementErrors.length)console.error('TOWN VALIDATION: '+R.placementErrors.length+' problem(s)',R.placementErrors);else{console.log('TOWN VALIDATION OK');console.log('  '+R.stats.big+' BIG + '+R.stats.dual+' 2-BUILD tiles = 32 plots, '+(R.stats.big+2*R.stats.dual)+' properties')}}
function buildTownV2Steps(C){const st=[['Planning the town',()=>{C.plan=planTownV2(C.L);C.pop=new Set()}]];
 for(let i=0;i<GRID.COLS*GRID.ROWS;i++)st.push([()=>{const it=C.plan&&C.plan[i];return it?'Building '+it.defs.map(d=>d.name).join(' & '):'Building'},()=>{const it=C.plan&&C.plan[i];if(it)buildPlotV2(it,C.R,C.pop)},1]);
 st.push(['Checking the town',()=>finishTownV2(C.plan,C.R,C.pop)]);return st}
function buildTownV2(L,R){const C={L,R};for(const s of buildTownV2Steps(C))s[1]()}

// ===== v036 block ends =====
// ------------------------------------------------------------ procedural planning
function shuf(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
// QUARANTINED (v036): legacy v032 planner, not used by town().
function planTownLegacy(L){const cats={residential:[],commercial:[],civic:[]};CATALOGUE.forEach(d=>cats[d.category].push(d));
 const nR=ri(11,14),nV=ri(5,7),need={residential:nR,civic:nV,commercial:32-nR-nV},must=['medical_clinic','gun_shop','gas_station','diner','hardware_store','grocery_store','church'].map(id=>CATALOGUE.find(d=>d.id===id));
 const picks=must.slice();must.forEach(d=>need[d.category]--);
 for(const c of Object.keys(need)){let bag=shuf(cats[c].filter(d=>!must.includes(d))),k=need[c];while(k-->0){if(!bag.length)bag=shuf(cats[c]);picks.push(bag.pop())}}
 if(picks.length!==L.plots.length)throw new Error('planner produced '+picks.length+' buildings for '+L.plots.length+' plots');
 const bad=a=>{let n=0;L.plots.forEach((p,i)=>{const q=L.plots[i+1];if(q&&q.row===p.row&&q.col!==0&&q.col!==4&&a[i].id===a[i+1].id)n++;if(p.row%2===0){const j=i+GRID.COLS;if(a[i].id===a[j].id)n++}});return n};
 let best=shuf(picks);for(let t=0;t<300&&bad(best)>0;t++)best=shuf(picks);
 const lv=best.map(()=>{const r=Math.random();return r<.38?0:r<.75?1:2});while(lv.filter(v=>v===0).length<6)lv[ri(0,31)]=0;
 return L.plots.map((p,i)=>({plot:p,def:best[i],lv:lv[i]}))}

function bld(x,z,t,lv,plot){CUR={cs:yawFor(t.front,plot.front)===0?1:-1,px:x,pz:z,lv};const n0=scene.children.length,s0=solids.length,w0=winList.length,d0=doors.length;LASTB=null;
 BUILDERS[t.builder](x,z,t);const bB=LASTB;
 try{if(lv)ruin(x,z,t,lv,n0,s0,w0,d0)}catch(e){console.error('ruin',t.id,e)}
 try{if(lv)litter(x,z,t)}catch(e){console.error('litter',t.id,e)}
 try{applyCondProps(bB,t,lv)}catch(e){console.error('condition props',t.id,e)}
 const b=buildings[buildings.length-1];if(b){b.id=t.id;b.cat=t.category;b.lv=lv;b.cond=COND_NAMES[lv];b.plot=plot.id;b.front=plot.front}
 return{n0,B:bB}}
function checkPlacement(p,t,n0,B){const E=[],tol=.06,v=new THREE.Vector3();
 for(const o of scene.children.slice(n0)){if(o.isLight||(o.userData&&(o.userData.kind==='zombie'||o.userData.kind==='fire')))continue;   /* v076: a fire's glow pool may spill over the plot edge */
  o.updateWorldMatrix(true,false);o.traverse(m=>{if(!m.isMesh||!m.geometry||!m.geometry.attributes||!m.geometry.attributes.position)return;m.updateWorldMatrix(true,false);const a=m.geometry.attributes.position;
   for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld);if(v.x<p.x0-tol||v.x>p.x1+tol||v.z<p.z0-tol||v.z>p.z1+tol){E.push('plot '+p.id+' '+t.id+': geometry ('+m.geometry.type+' h='+(m.position.y).toFixed(1)+') leaves its plot at ('+v.x.toFixed(1)+','+v.z.toFixed(1)+')');return}}})
  if(E.length)break}
 if(B&&B.g){const f=new THREE.Vector3(0,0,1);B.g.updateWorldMatrix(true,false);f.transformDirection(B.g.matrixWorld);const want=p.front==='north'?-1:1;if(Math.sign(Math.round(f.z))!==want)E.push('plot '+p.id+' '+t.id+': front faces '+(f.z>0?'south':'north')+' but plot frontage is '+p.front)}
 return E}

// QUARANTINED (v036): the v032 town generator is kept for reference only and is never called.
function townLegacy(){
 try{treeList=[];nNpc=0;buildings=[];streetLights=[];walkables=[]}catch(e){console.error('town init',e);return}
 const L=gridLayout(),le=validateLayout(L);window.__fortZombieTown={layout:L,layoutErrors:le,catalogueErrors:window.__catalogueErrors,placementErrors:[],plan:[]};
 if(le.length){console.error('Map layout invalid',le);throw new Error('Map layout invalid: '+le.join('; '))}
 const inGrid=(x,z,pad)=>x>L.bounds.x0-pad&&x<L.bounds.x1+pad&&z>L.bounds.z0-pad&&z<L.bounds.z1+pad,PARK=[-50,L.bounds.z0-32],CEM=[55,L.bounds.z0-32];
 try{drawStreets(L)}catch(e){console.error('streets',e)}
 try{TRUCK.set(rnd(-20,20),0,L.bounds.z1+8);makeArmyTruck(TRUCK.x,TRUCK.z)}catch(e){console.error('truck',e);TRUCK.set(0,0,L.bounds.z1+8)}
 try{let placed=0,tries=0;while(placed<80&&tries<900){tries++;const x=rnd(BND[0]+6,BND[1]-6),z=rnd(BND[2]+6,BND[3]-7);if(inGrid(x,z,3)||Math.hypot(x-TRUCK.x,z-TRUCK.z)<6||Math.hypot(x-PARK[0],z-PARK[1])<20||Math.hypot(x-CEM[0],z-CEM[1])<18)continue;tree(x,z);placed++}}catch(e){console.error('trees',e)}
 try{let placed=0,tries=0;while(placed<50&&tries<700){tries++;const x=rnd(BND[0]+6,BND[1]-6),z=rnd(BND[2]+6,BND[3]-7);if(inGrid(x,z,3)||Math.hypot(x-TRUCK.x,z-TRUCK.z)<4||Math.hypot(x-PARK[0],z-PARK[1])<18||Math.hypot(x-CEM[0],z-CEM[1])<16)continue;bush(x,z);placed++}}catch(e){console.error('bushes',e)}
 const vxs=[...new Set(L.roads.filter(r=>(r.x1-r.x0)<(r.z1-r.z0)).map(r=>(r.x0+r.x1)/2))],hzs=[...new Set(L.roads.filter(r=>(r.x1-r.x0)>(r.z1-r.z0)).map(r=>(r.z0+r.z1)/2))];
 try{for(let i=0;i<30;i++){const onV=Math.random()<.5,x=onV?PK(vxs)+rnd(-2,2):rnd(L.bounds.x0+10,L.bounds.x1-10),z=onV?rnd(L.bounds.z0+10,L.bounds.z1-10):PK(hzs)+rnd(-2,2);makeCar(x,z,onV?rnd(-.3,.3):PI/2+rnd(-.3,.3))}}catch(e){console.error('cars',e)}
 // BUILDINGS: one per plot, from the catalogue, with a condition and a deterministic frontage-driven orientation
 const plan=planTownLegacy(L),R=window.__fortZombieTown;
 for(const it of plan){const p=it.plot,t=it.def;try{drawPlot(p,t.category);const r=bld(p.cx,p.cz,t,it.lv,p),e=checkPlacement(p,t,r.n0,r.B);R.placementErrors.push(...e);R.plan.push({plot:p.id,id:t.id,cond:COND_NAMES[it.lv],front:p.front});
   if(p.col%4!==0&&Math.random()<.45)fence(p.x0+.3,p.cz+(p.front==='south'?3:-3),0,6)}catch(err){R.placementErrors.push('plot '+p.id+' '+t.id+' failed: '+err.message);console.error('bld fail '+t.id,err)}}
 if(R.plan.length!==32)R.placementErrors.push('only '+R.plan.length+' of 32 plots were populated');
 if(R.placementErrors.length)console.error('TOWN VALIDATION: '+R.placementErrors.length+' problem(s)',R.placementErrors);else console.log('TOWN VALIDATION OK — 32 plots, all fronts correct, all geometry inside plots');
 try{placeNpcs(ri(3,4))}catch(e){console.error('npc',e)}
 try{treeList.forEach(t=>{if(inBuilding(t.x,t.z,3)){scene.remove(t.g);if(t.tb){const i=solids.indexOf(t.tb);if(i>=0)solids.splice(i,1)}}})}catch(e){console.error('tree cull',e)}
 try{makePark(PARK[0],PARK[1])}catch(e){console.error('park',e)}try{makeCemetery(CEM[0],CEM[1])}catch(e){console.error('cemetery',e)}
 try{for(const v of vxs)for(const h of hzs){if(Math.random()<.6)continue;streetLight(v+3,h+3);streetLight(v-3,h-3)}}catch(e){console.error('lights',e)}
 try{for(let i=0;i<35;i++)zombie(PK(vxs)+rnd(-3,3),rnd(L.bounds.z0+4,L.bounds.z1-4));for(let i=0;i<15;i++)zombie(rnd(L.bounds.x0+4,L.bounds.x1-4),rnd(L.bounds.z0+4,L.bounds.z1-4))}catch(e){console.error('zombies',e)}
}


/* v075: the town in steps (streets, trees, cars, one step per plot, the population) so a loading screen can show progress; town() runs them all.
   WB.townPost: hooks run once the town is complete (rumour missions). */
function townSteps(){const C={};return[
 ['Laying out the streets',()=>{
 try{treeList=[];nNpc=0;buildings=[];streetLights=[];walkables=[]}catch(e){console.error('town init',e)}
 const L=C.L=gridLayout(),le=validateLayout(L);C.R=window.__fortZombieTown={layout:L,layoutErrors:le,catalogueErrors:window.__catalogueErrors,newCatalogueErrors:window.__newCatalogueErrors,placementErrors:[],plan:[]};
 if(le.length){console.error('Map layout invalid',le);throw new Error('Map layout invalid: '+le.join('; '))}
 C.inGrid=(x,z,pad)=>x>L.bounds.x0-pad&&x<L.bounds.x1+pad&&z>L.bounds.z0-pad&&z<L.bounds.z1+pad;C.PARK=[1e6,1e6];C.CEM=[1e6,1e6];
 try{drawStreets(L)}catch(e){console.error('streets',e)}
 try{TRUCK.set(rnd(-20,20),0,L.bounds.z1+8);makeArmyTruck(TRUCK.x,TRUCK.z)}catch(e){console.error('truck',e);TRUCK.set(0,0,L.bounds.z1+8)}
 }],
 ['Planting trees',()=>{const L=C.L;
 try{let placed=0,tries=0;while(placed<80&&tries<900){tries++;const x=rnd(BND[0]+6,BND[1]-6),z=rnd(BND[2]+6,BND[3]-7);if(C.inGrid(x,z,3)||Math.hypot(x-TRUCK.x,z-TRUCK.z)<6||Math.hypot(x-C.PARK[0],z-C.PARK[1])<20||Math.hypot(x-C.CEM[0],z-C.CEM[1])<18)continue;tree(x,z);placed++}}catch(e){console.error('trees',e)}
 try{let placed=0,tries=0;while(placed<50&&tries<700){tries++;const x=rnd(BND[0]+6,BND[1]-6),z=rnd(BND[2]+6,BND[3]-7);if(C.inGrid(x,z,3)||Math.hypot(x-TRUCK.x,z-TRUCK.z)<4||Math.hypot(x-C.PARK[0],z-C.PARK[1])<18||Math.hypot(x-C.CEM[0],z-C.CEM[1])<16)continue;bush(x,z);placed++}}catch(e){console.error('bushes',e)}
 }],
 ['Parking cars',()=>{const L=C.L;
 C.vxs=[...new Set(L.roads.filter(r=>(r.x1-r.x0)<(r.z1-r.z0)).map(r=>(r.x0+r.x1)/2))];C.hzs=[...new Set(L.roads.filter(r=>(r.x1-r.x0)>(r.z1-r.z0)).map(r=>(r.z0+r.z1)/2))];
 try{for(let i=0;i<30;i++){const onV=Math.random()<.5,x=onV?PK(C.vxs)+rnd(-2,2):rnd(L.bounds.x0+10,L.bounds.x1-10),z=onV?rnd(L.bounds.z0+10,L.bounds.z1-10):PK(C.hzs)+rnd(-2,2);makeCar(x,z,onV?rnd(-.3,.3):PI/2+rnd(-.3,.3))}}catch(e){console.error('cars',e)}
 }],
 ...buildTownV2Steps(C),
 ['Raising the dead',()=>{const L=C.L;
 try{placeNpcs(ri(3,4))}catch(e){console.error('npc',e)}
 try{treeList=treeList.filter(t=>{if(!t.keep&&inBuilding(t.x,t.z,3)){scene.remove(t.g);if(t.tb){const i=solids.indexOf(t.tb);if(i>=0)solids.splice(i,1)}return false}return true})}catch(e){console.error('tree cull',e)} /* v074: lot trees (bldTree) stay */
 try{for(const v of C.vxs)for(const h of C.hzs){if(Math.random()<.6)continue;streetLight(v+3,h+3);streetLight(v-3,h-3)}}catch(e){console.error('lights',e)}
 try{for(let i=0;i<35;i++)zombie(PK(C.vxs)+rnd(-3,3),rnd(L.bounds.z0+4,L.bounds.z1-4));for(let i=0;i<15;i++)zombie(rnd(L.bounds.x0+4,L.bounds.x1-4),rnd(L.bounds.z0+4,L.bounds.z1-4))}catch(e){console.error('zombies',e)}
  for(const f of WB.townPost)try{f()}catch(e){console.error('town hook',e)}
 },2]]}
function town(){for(const s of townSteps())s[1]()}

function zb(x,z){const feet=pl.position.y-(G.eyeUsed||1.6);return zombies.some(q=>{const d=Math.hypot(q.position.x-x,q.position.z-z);if(!(d<.9&&d<Math.hypot(q.position.x-pl.position.x,q.position.z-pl.position.z)))return false;
 const zt=q.position.y+(q.userData&&q.userData.crawl?.6:1.75)*(q.scale.x||1);return q.position.y<feet+1.6&&zt>feet+.25})}   // v072: a zombie only blocks you when your bodies overlap in height (not from on top of a wall)
/* v072: ONE melee reach test, shared by melee(), the red crosshair and the corpse-gib check, so the indicator is always the truth.
   Measured between bodies in 3D: the swing band (knee height to just over your eyes) against the zombie's body (feet to head). A zombie more
   than 0.6 m below that band (you are on top of a wall) or behind a wall is out of reach, however close it is on the map. Returns the distance or -1. */
function meleeReach(z,reach){const u=z.userData;if(!u||u.hp<=0)return -1;const fx=-Math.sin(yaw),fz=-Math.cos(yaw),feet=pl.position.y-(G.eyeUsed||1.6);
 const dx=z.position.x-pl.position.x,dz=z.position.z-pl.position.z,h=Math.hypot(dx,dz);if(h>1e-4&&h>.45&&(dx*fx+dz*fz)/h<=.5)return -1;
 const zb0=z.position.y,zt=zb0+(u.crawl?.6:1.8)*(z.scale.x||1),lo=feet+.35,hi=pl.position.y+.25,gap=zt<lo?lo-zt:zb0>hi?zb0-hi:0;
 if(gap>.6)return -1;const d=Math.hypot(h,gap);if(d>=reach)return -1;
 if(h>.6&&!los(pl.position,z.position,1))return -1;return d}
function meleeTarget(reach){let t=null,bd=1e9;for(const z of zombies){const d=meleeReach(z,reach);if(d>=0&&d<bd){bd=d;t=z}}return t}

const TXT=(t,c,bg)=>{const k=document.createElement('canvas');k.width=512;k.height=128;const q=k.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,512,128);q.fillStyle=c;q.font='bold 88px Impact,sans-serif';q.textAlign='center';q.fillText(t,256,100);return new THREE.CanvasTexture(k)};
let barT=null;
function fort(){const T=G.fort,PI=Math.PI,h=4.4,C={police:[0x7a4a3a,0x4a4d52,0x3a3a44],prison:[0x8a8a86,0x3a3a38,0x555555],school:[0xa8795a,0x6a6a5a,0x5a2a1a]}[T],B=mk(FORT.x,FORT.z,30,30,h,C[0],C[1],C[2]),g=B.g;
 const W4=[{k:'w',c:-9},{k:'w',c:-3},{k:'w',c:3},{k:'w',c:9}],R=(a,b,c,d)=>[a,b,c,d];
 WL(B,1,-15,-15,15,W4,h);WL(B,0,-15,-15,15,W4,h);WL(B,0,15,-15,15,W4,h);
 WL(B,1,15,-15,-3.6,[{k:'w',c:-12},{k:'w',c:-8.5},{k:'w',c:-5.2}],h);WL(B,1,15,3.6,15,[{k:'w',c:5.2},{k:'w',c:8.5},{k:'w',c:12}],h);
 addSolid(mesh(BX(7.2,1.4,.3),C[0],0,h-.7,15,g));const fl=mesh(new THREE.PlaneGeometry(29.7,29.7),C[1],0,.03,0,g);fl.rotation.x=-PI/2;
 winList.push({p:new THREE.Vector3(FORT.x,1,FORT.z+16.5),alive:false,pseudo:1});   // the front entrance: a waypoint for zombie pathing
 if(T==='police'){
  WL(B,1,5,-15,15,[{k:'d',c:-9},{k:'g',c:0},{k:'d',c:9,s:-1}],h);WL(B,0,-5,-15,5,[{k:'d',c:-11.8},{k:'d',c:-5.3},{k:'d',c:1.5}],h);WL(B,1,-8.5,-15,-5,[],h);WL(B,1,-2,-15,-5,[],h);
  WL(B,0,7,-15,-6,[{k:'d',c:-10.5}],h);WL(B,1,-6,7,15,[],h);
  furn(B,[['counter','n',.5],['bench','s',.2],['bench','s',.8],['plant','e',.1],['plant','w',.1]],R(-14.8,14.8,5.3,14.8));
  [[-14.8,-5.3,-14.8,-8.8],[-14.8,-5.3,-8.2,-2.3],[-14.8,-5.3,-1.7,4.7]].forEach(r=>furn(B,[['cot','w',.5],['toilet','n',.1]],r));
  furn(B,[['desk','n',.15],['desk','n',.5],['desk','s',.3],['desk','s',.7],['shelf','e',.5],['plant','e',.1]],R(-4.7,6.7,-14.8,4.7));furn(B,[['rack','e',.3],['rack','e',.7],['crate','n',.5],['crate','w',.8]],R(7.3,14.8,-14.8,-6.3));
  sign(B,'POLICE');for(const sx of [-1,1]){const x=FORT.x+sx*9,z=FORT.z+27;if(window.MFZV)MFZV.make('police',x,z,sx*.3);else{makeCar(x,z,sx*.3);mesh(BX(.9,.14,.3),0xff2020,x,1.45,z)}}}
 if(T==='prison'){
  WL(B,1,8,-15,15,[{k:'d',c:-8},{k:'g',c:0},{k:'d',c:8,s:-1}],h);WL(B,1,-2,-15,15,[-12.5,-7.5,-2.5,2.5,7.5,12.5].map(c=>({k:'d',c})),h);for(const x of [-10,-5,0,5,10])WL(B,0,x,-15,-2,[],h);
  [-15,-10,-5,0,5,10].forEach(x=>furn(B,[['cot','n',.5],['toilet','w',.9]],R(x+.2,x+4.8,-14.8,-2.3)));
  furn(B,[['desk','n',.2],['desk','n',.8],['counter','s',.5],['bench','s',.15],['shelf','w',.5]],R(-14.8,14.8,8.3,14.8));furn(B,[['bench','n',.2],['bench','n',.8],['bench','s',.3],['bench','s',.7]],R(-14.8,14.8,-1.7,7.7));
  sign(B,'PRISON');for(const sx of [-1,1]){const x=FORT.x+sx*18.5,z=FORT.z+17;addSolid(mesh(BX(3,9,3),0x77776f,x,4.5,z));mesh(BX(4.2,1.8,4.2),0x2a3a4a,x,9.9,z);mesh(BX(4.8,.3,4.8),0x333333,x,11,z);mesh(BX(.6,.4,.6),0xfff2a0,x-sx*1.6,9.9,z-1.6).material.emissive.setHex(0x888844)}}
 if(T==='school'){
  WL(B,1,-3,-15,15,[{k:'d',c:-10},{k:'d',c:0},{k:'d',c:10,s:-1}],h);WL(B,0,-5,-15,-3,[],h);WL(B,0,5,-15,-3,[],h);
  WL(B,1,5,-15,-5,[],h);WL(B,1,5,5,15,[],h);WL(B,0,-5,5,15,[{k:'d',c:10}],h);WL(B,0,5,5,15,[{k:'d',c:10,s:-1}],h);
  [[-14.8,-5.3],[-4.7,4.7],[5.3,14.8]].forEach(x=>furn(B,[['desk','n',.2],['desk','n',.5],['desk','n',.8],['desk','s',.3],['desk','s',.7],['shelf','w',.5]],R(x[0],x[1],-14.8,-3.3)));
  furn(B,[['desk','n',.3],['shelf','w',.5],['plant','e',.1]],R(-14.8,-5.3,5.3,14.8));furn(B,[['shelf','e',.3],['shelf','e',.7],['table','c',.5],['chair','c',.5]],R(5.3,14.8,5.3,14.8));furn(B,[['bench','n',.2],['bench','n',.8],['plant','s',.1],['plant','s',.9]],R(-14.8,14.8,-2.7,4.7));
  sign(B,'SCHOOL');mesh(BX(.1,9,.1),0xaaaaaa,FORT.x+19,4.5,FORT.z+12);mesh(BX(2,1.2,.05),0xb91c1c,FORT.x+20,8.2,FORT.z+12);
  const bx=FORT.x+24,bz=FORT.z+4,bus=mesh(BX(2.6,2.4,9),0xf2b705,bx,1.6,bz);addSolid(bus);mesh(BX(2.7,.3,9.1),0x111111,bx,1.5,bz);mesh(BX(2.65,.7,8.4),0x335577,bx,2.2,bz);for(const dz of [-3,3])for(const dx of [-1.3,1.3])mesh(new THREE.CylinderGeometry(.5,.5,.3,10),0x111111,bx+dx,.5,bz+dz).rotation.z=PI/2}
 roof(B,h,'flat')}
function mkBar(b){const ry=b.ry||0,m=mesh(new THREE.BoxGeometry(4,2,.8),0x78350f,b.x,1,b.z);m.rotation.y=ry;m.updateMatrixWorld(true);m.userData={kind:'bar',thru:true,bar:b};b.mesh=m;b.boxes=[];
 const c=Math.cos(ry),s=Math.sin(ry);for(let t=-1.8;t<=1.81;t+=.6){const x=b.x+c*t,z=b.z-s*t,bx=new THREE.Box3(new THREE.Vector3(x-.45,0,z-.45),new THREE.Vector3(x+.45,2,z+.45));bx.bar=b;solids.push(bx);b.boxes.push(bx)}b.box=b.boxes[0];tint(b)}
function tint(b){b.mesh.material.color.setHSL(.07,.6,.1+.28*b.hp/100)}
function breakBar(b){scene.remove(b.mesh);(b.boxes||[b.box]).forEach(x=>{const i=solids.indexOf(x);if(i>=0)solids.splice(i,1)});G.bars=G.bars.filter(x=>x!==b);toast('A barricade was destroyed!')}
function mkSpike(s){const m=mesh(new THREE.ConeGeometry(.5,1,4),0x94a3b8,s.x,.5,s.z);m.userData={kind:'spike',thru:true};s.mesh=m}
function survMeshes(){G.surv.forEach((s,i)=>{if(s.hp<=0)return;const m=makePerson(RC[s.role],s.px!==undefined?s.px:FORT.x-12+(i%8)*3.4,s.pz!==undefined?s.pz:FORT.z+9+Math.floor(i/8)*2.5,s.role);m.userData={kind:'surv',s,P:m.userData.P,role:s.role};hpBar(m);smesh.push(m);scene.add(m);npcVisual(m,s)})}
// Rev 034: world cleanup split out of buildWorld so the Dev Toolkit can reuse it (behaviour unchanged for the normal game)
function clearWorld(){const rm=[];for(let i=scene.children.length-1;i>=0;i--){const c=scene.children[i];if(c!==pl&&!c.isLight){scene.remove(c);rm.push(c)}}
 zombies=[];npcList=[];carry=null;dropBoxes=[];bloodP=[];decals=[];limbs=[];floats=[];dnAct.length=0;dnPool.length=0;comps.length=0;winList.length=0;dead.length=0;shards.length=0;solids.length=0;walkables.length=0;sight.length=0;doors.length=0;smesh=[];streetLights=[];if(typeof devOnClear==='function')devOnClear(rm)}
/* v075: the world build is a list of steps [label, fn, weight] so the loading screen (js/game/loader.js) can run them a frame apart and show
   progress. buildWorld() runs them all at once, as before. WB.pre / WB.post: hooks before clearing and after building (perf.js optimise pass).
   WB.prebuilt: the loader already built this world step by step, so the next buildWorld() (from go()) skips the build. */
const WB={pre:[],post:[],townPost:[],prebuilt:false};
function worldSteps(){const m=G.mode,st=[];
 st.push(['Clearing the ground',()=>{for(const f of WB.pre)f();clearWorld();
  const gr=mesh(new THREE.PlaneGeometry(500,500),m==='EXPEDITION'?0x1a1c20:({police:0x2a2c30,prison:0x4a4538,school:0x2d5a2a})[G.fort]||0x1a1c20,0,0,0);gr.rotation.x=-Math.PI/2;
  if(m!=='EXPEDITION'){fort();G.bars.forEach(mkBar);G.spikes=[]}}]);
 if(m==='EXPEDITION'){st.push(['Surveying the town',()=>{BND=townBND()}]);st.push(...townSteps());st.push(['Fencing the town',()=>border(...BND)])}
 else st.push(['Fencing the fort',()=>{BND=[FORT.x-62,FORT.x+62,FORT.z-55,FORT.z+62];border(...BND);if(m==='CLEAR')for(let i=0,t=0;i<8&&t<120;t++){const c0=zombies.length;zombie(FORT.x+rnd(-13,13),FORT.z+rnd(-13,13),'walker',true);if(zombies.length>c0)i++}}]);
 st.push(['Teaching the dead to walk',()=>{if(m==='FORT_BUILD'||m==='SIEGE')survMeshes();zFix();buildNav()},2]);
 st.push(['Lighting and optimising',()=>{for(const f of WB.post)f()},5]);
 return st}
function buildWorld(){if(WB.prebuilt){WB.prebuilt=false;return}for(const s of worldSteps())s[1]()}

const ZT={walker:{hp:50,sp:2.2,dmg:12,c:0x3f6212,s:1},runner:{hp:30,sp:4.6,dmg:8,c:0x7a8a14,s:.9},brute:{hp:140,sp:1.8,dmg:25,c:0x5a1d1d,s:1.35}};
function zombie(x,z,kind,isFort){if(blocked(x,z,.5))return;const r=Math.random(),sg=G.mode==='SIEGE';kind=kind||(r<.1+(sg?.12:0)?'brute':r<.4?'runner':'walker');const t=ZT[kind],g=new THREE.Group();g.position.set(x,0,z);
 const P=makeHuman({zombie:1,kind},g);g.scale.setScalar(t.s);
 const hp=t.hp*FORTS[G.fort].z;g.userData={kind:'zombie',hp,sp:t.sp*rnd(.9,1.1)*ZSPD,dmg:t.dmg,cd:0,lt:Math.random()*.2,hx:x,hz:z,w:0,fort:!!isFort,hunt:0,lx:x,lz:z,parts:P,run:kind==='runner',tilt:rnd(-.3,.3),big:kind==='brute'};scene.add(g);zombies.push(g);
 if(Math.random()<.03)dismemberQuiet(g,'armL');if(Math.random()<.03)dismemberQuiet(g,'armR');if(Math.random()<.012)dismemberQuiet(g,Math.random()<.5?'legL':'legR');
 if(!sg&&!g.userData.crawl&&Math.random()<.05){g.userData.sleep=true;g.userData.pose=Math.random()<.65?'lie':'sit';sleepPose(g)}}

const sight=[],P3=new THREE.Vector3();
function inBox2(q,p){return p.x>=q.min.x&&p.x<=q.max.x&&p.z>=q.min.z&&p.z<=q.max.z}
function segHit2(q,ax,az,bx,bz){let t0=0,t1=1;const dx=bx-ax,dz=bz-az;
 for(let k=0;k<2;k++){const p=k?az:ax,d=k?dz:dx,mn=k?q.min.z:q.min.x,mx=k?q.max.z:q.max.x;
  if(Math.abs(d)<1e-9){if(p<mn||p>mx)return false}else{let u0=(mn-p)/d,u1=(mx-p)/d;if(u0>u1){const t=u0;u0=u1;u1=t}t0=Math.max(t0,u0);t1=Math.min(t1,u1);if(t0>t1)return false}}return true}
// exact line-of-sight at head height: every wall / door box is tested as a real segment-vs-box intersection (the old point
// sampling could step right over a thin interior wall). strict = intact window glass blocks too (used for melee reach).
function los(a,b,strict){const x0=Math.min(a.x,b.x),x1=Math.max(a.x,b.x),z0=Math.min(a.z,b.z),z1=Math.max(a.z,b.z);
 for(const q of solids){if(!q||q.bar||(q.win&&!strict)||q.max.y<=1.5||q.min.y>=1.5||q.max.x<x0||q.min.x>x1||q.max.z<z0||q.min.z>z1)continue;if(inBox2(q,a)||inBox2(q,b))continue;if(segHit2(q,a.x,a.z,b.x,b.z))return false}
 if(sight.length){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz),n=Math.ceil(d/.3);P3.y=1.5;for(let i=1;i<n;i++){const t=i/n;if(t*d>.8&&(1-t)*d>.8){P3.x=a.x+dx*t;P3.z=a.z+dz*t;for(const q of sight)if(q.containsPoint(P3))return false}}}return true}
function idle(z,dt){const u=z.userData,p=z.position;if(Math.random()<dt*.06)S.groan(p);u.t=(u.t===undefined?rnd(0,5):u.t)-dt;
 if(u.t<=0){if(u.w){u.w=0;u.t=rnd(1,2.5)}else if(Math.random()<.45){u.w=1;u.t=rnd(2,5);u.a=Math.hypot(u.hx-p.x,u.hz-p.z)>5?Math.atan2(u.hx-p.x,u.hz-p.z):rnd(0,TAU);z.rotation.y=u.a}else{u.t=rnd(1,2.5);z.rotation.y+=rnd(-1.2,1.2)}}
 if(u.w){const s=.8*ZSPD*dt,nx=p.x+Math.sin(u.a)*s,nz=p.z+Math.cos(u.a)*s;if(blocked(nx,nz)){u.w=0;u.t=rnd(2,5)}else{p.x=nx;p.z=nz}}}

function groundAt(x,z,fy){let gy=0;
 for(const q of solids){if(!q)continue;if(q.max.y<=fy+.32&&q.max.y>gy&&x>q.min.x-.3&&x<q.max.x+.3&&z>q.min.z-.3&&z<q.max.z+.3)gy=q.max.y}
 for(const q of walkables){if(!q)continue;if(q.max.y<=fy+.32&&q.max.y>gy&&x>q.min.x-.3&&x<q.max.x+.3&&z>q.min.z-.3&&z<q.max.z+.3)gy=q.max.y}
 return gy;
}


/* ===== NAVIGATION: one shared flow field (Dijkstra from the defenders outward). Walls block; doors, barricades and
   windows are passable at a cost, so zombies route to the cheapest way in and then bash/smash whatever is in the way. ===== */
let NAV={ok:false,T:0};
const HD=[],HI=[];let hD=0,hI=0;
function hPush(d,i){let k=HD.length;HD.push(d);HI.push(i);while(k>0){const q=(k-1)>>1;if(HD[q]<=d)break;HD[k]=HD[q];HI[k]=HI[q];k=q}HD[k]=d;HI[k]=i}
function hPop(){hD=HD[0];hI=HI[0];const ld=HD.pop(),li=HI.pop(),n=HD.length;if(n){let k=0;for(;;){let c=2*k+1;if(c>=n)break;if(c+1<n&&HD[c+1]<HD[c])c++;if(HD[c]>=ld)break;HD[k]=HD[c];HI[k]=HI[c];k=c}HD[k]=ld;HI[k]=li}}
function navRect(x0,x1,z0,z1,fn){const N=NAV,i0=Math.max(0,Math.ceil((x0-N.x0)/N.cs-.5)),i1=Math.min(N.w-1,Math.floor((x1-N.x0)/N.cs-.5)),j0=Math.max(0,Math.ceil((z0-N.z0)/N.cs-.5)),j1=Math.min(N.h-1,Math.floor((z1-N.z0)/N.cs-.5));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)fn(j*N.w+i)}
function buildNav(){const cs=.5,x0=BND[0],z0=BND[2],w=Math.ceil((BND[1]-x0)/cs),h=Math.ceil((BND[3]-z0)/cs);
 NAV={cs,x0,z0,w,h,wall:new Uint8Array(w*h),extra:new Float32Array(w*h),dist:new Float64Array(w*h),softObj:new Array(w*h).fill(null),sl:[],T:0,ok:true};
 const W=NAV.wall,R=.32;
 for(const q of solids){if(!q||(q.door&&!q.leaf)||q.bar||q.win)continue;if(q.max.y<.25||q.min.y>1.8)continue;navRect(q.min.x-R,q.max.x+R,q.min.z-R,q.max.z+R,i=>W[i]=1)}
 // window openings are carved out of the wall (their cost is added in navSoft)
 for(const w of winList){if(w.pseudo||w.p.y>2.5)continue;const a=w.ax;navRect(w.p.x-(a?.45:.6),w.p.x+(a?.45:.6),w.p.z-(a?.6:.45),w.p.z+(a?.6:.45),i=>W[i]=0)}
 // v043: cells next to walls cost extra so zombies keep ~1 m off walls instead of hugging them
 const nr=NAV.near=new Float32Array(w*h),NW=NAV.w,NH=NAV.h;for(let j=0;j<NH;j++)for(let i=0;i<NW;i++){if(!W[j*NW+i])continue;for(let dj=-2;dj<=2;dj++){const jj=j+dj;if(jj<0||jj>=NH)continue;for(let di=-2;di<=2;di++){const ii=i+di;if(ii<0||ii>=NW)continue;const n=jj*NW+ii;if(W[n])continue;const c=(Math.abs(di)<2&&Math.abs(dj)<2)?1.2:.6;if(c>nr[n])nr[n]=c}}}}
function navSoft(){const N=NAV;for(const i of N.sl){N.extra[i]=0;N.softObj[i]=null}N.sl=[];
 const add=(x0,x1,z0,z1,cost,o)=>navRect(x0,x1,z0,z1,i=>{if(N.wall[i])return;N.extra[i]+=cost;N.softObj[i]=o;N.sl.push(i)});
 for(const d of doors){if(d.open||!d.sol)continue;const q=d.sol,a=(q.max.x-q.min.x)>(q.max.z-q.min.z);add(q.min.x-(a?0:.3),q.max.x+(a?0:.3),q.min.z-(a?.3:0),q.max.z+(a?.3:0),6,{t:'door',o:d})}
 for(const w of winList){if(w.pseudo||w.p.y>2.5)continue;const a=w.ax;add(w.p.x-(a?.45:.6),w.p.x+(a?.45:.6),w.p.z-(a?.6:.45),w.p.z+(a?.6:.45),w.alive?7:1.5,{t:'win',o:w})}
 for(const b of G.bars)for(const bx of(b.boxes||[b.box]))add(bx.min.x-.32,bx.max.x+.32,bx.min.z-.32,bx.max.z+.32,4+b.hp*.08,{t:'bar',o:b})}
const NDX=[1,-1,0,0,1,1,-1,-1],NDZ=[0,0,1,-1,1,-1,1,-1];
function navField(horde){const N=NAV;if(!N.ok)return;const act=zombies.filter(z=>horde||z.userData.see||z.userData.hunt>0);if(!act.length)return;
 navSoft();const w=N.w,h=N.h,D=N.dist,W=N.wall,X=N.extra,cs=N.cs;D.fill(1e9);HD.length=0;HI.length=0;
 const cell=(x,z)=>Math.max(0,Math.min(h-1,Math.floor((z-N.z0)/cs)))*w+Math.max(0,Math.min(w-1,Math.floor((x-N.x0)/cs)));
 const seed=(x,z)=>{const i=cell(x,z);if(D[i]>0){D[i]=0;hPush(0,i)}};
 seed(pl.position.x,pl.position.z);smesh.forEach(m=>{if(m.userData.s&&m.userData.s.hp>0)seed(m.position.x,m.position.z)});
 const need=new Set();act.forEach(z=>need.add(cell(z.position.x,z.position.z)));
 const maxD=horde?1e9:90;
 while(HD.length){hPop();const d=hD,i=hI;if(d>D[i])continue;if(d>maxD||(need.delete(i)&&!need.size))break;const ix=i%w,iz=(i/w)|0;
  for(let k=0;k<8;k++){const nx=ix+NDX[k],nz=iz+NDZ[k];if(nx<0||nz<0||nx>=w||nz>=h)continue;const n=nz*w+nx;if(W[n])continue;
   if(k>3&&(W[iz*w+nx]||W[nz*w+ix]))continue;const nd=d+(k>3?1.414*cs:cs)+X[n]+N.near[n];if(nd<D[n]){D[n]=nd;hPush(nd,n)}}}}
function navNext(x,z){const N=NAV,w=N.w,D=N.dist,W=N.wall,ix=Math.floor((x-N.x0)/N.cs),iz=Math.floor((z-N.z0)/N.cs);if(ix<0||iz<0||ix>=w||iz>=N.h)return null;
 const i0=iz*w+ix;let bd=D[i0],bi=-1;if(bd>=1e8)return null;
 for(let k=0;k<8;k++){const nx=ix+NDX[k],nz=iz+NDZ[k];if(nx<0||nz<0||nx>=w||nz>=N.h)continue;const n=nz*w+nx;if(W[n])continue;if(k>3&&(W[iz*w+nx]||W[nz*w+ix]))continue;if(D[n]<bd-1e-3){bd=D[n];bi=n}}
 if(bi<0)return null;return{x:N.x0+(bi%w+.5)*N.cs,z:N.z0+((bi/w)|0)*N.cs+N.cs*.5,o:N.softObj[bi]}}
/* ===== shared movement helpers ===== */
const angD=(a,b)=>{let d=a-b;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
function doorOf(b){return b&&b.door?b.door:null}
/* v076 doors: always solid. Closed = d.sol across the doorway; open = d.solO, a box where the leaf actually stands at 90 degrees (marked .leaf,
   so the nav grid treats it as a wall and zombies route round it, or bash through it when it is in their way). There are no half-open doors:
   ruined buildings get doors that are fully open, closed or gone. A door swings away from whoever opens it, or whichever way is not into a wall. */
function doorLeaf(d){return d.p&&d.p.children.find(c=>c.userData&&c.userData.kind==='door')}
function doorBoxAt(d,ang){const pv=d.p,dr=doorLeaf(d);if(!dr)return null;const r0=pv.rotation.y;pv.rotation.y=(d.b||0)+ang;pv.updateWorldMatrix(true,true);
 const b=new THREE.Box3().setFromObject(dr).expandByScalar(.05);pv.rotation.y=r0;pv.updateWorldMatrix(true,true);return b}
function doorSwing(d,fx,fz){const sg=d.sg||1,opts=[];
 for(const s of[sg,-sg]){const b=doorBoxAt(d,-s*Math.PI/2);if(!b)continue;const t=b.clone().expandByScalar(-.18);let hit=0;
  for(const q of solids){if(!q||q===d.sol||q===d.solO||q.door||q.win||q.bar||!isFinite(q.min.x)||q.max.y<.4)continue;if(t.intersectsBox(q)){hit=1;break}}
  const c=b.getCenter(new THREE.Vector3()),away=fx===undefined?0:Math.hypot(c.x-fx,c.z-fz);opts.push({s,b,hit,away})}
 opts.sort((a,b)=>(a.hit-b.hit)||(b.away-a.away));return opts[0]||null}
function doorOpen(d,fx,fz,instant){if(!d||d.open)return false;const o=doorSwing(d,fx,fz);if(!o)return false;
 const i=solids.indexOf(d.sol);if(i>=0)solids.splice(i,1);d.solO=o.b;d.solO.door=d;d.solO.leaf=1;solids.push(d.solO);d.open=1;d.t=-o.s*Math.PI/2;if(instant)d.a=d.t;else S.door(1,d.sol.getCenter(P3));return true}
function doorClose(d,instant){if(!d||!d.open)return false;if(d.solO){const i=solids.indexOf(d.solO);if(i>=0)solids.splice(i,1)}
 {const q=d.sol,c=q.getCenter(P3),tx=(q.max.x-q.min.x)<(q.max.z-q.min.z),P=pl.position;if(P.x>q.min.x-.45&&P.x<q.max.x+.45&&P.z>q.min.z-.45&&P.z<q.max.z+.45){const sg=(tx?P.x-c.x:P.z-c.z)>=0?1:-1;if(tx)P.x=sg>0?q.max.x+.6:q.min.x-.6;else P.z=sg>0?q.max.z+.6:q.min.z-.6}}
 solids.push(d.sol);d.open=0;d.t=0;if(instant)d.a=0;else S.door(0,d.sol.getCenter(P3));return true}
function openDoor(d){if(d.open||d.locked)return;doorOpen(d)}
function winNear(x,z,r){for(const w of winList)if(!w.pseudo&&w.p.y<2.5&&Math.hypot(x-w.p.x,z-w.p.z)<r)return w;return null}
// vault over a low obstacle: scan for a free landing spot on the far side, then animate the hop (can't get stuck inside the sill)
function startVault(o,u,dx,dz){const p=o.position,l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;let seen=false,lx=null,lz=null;
 for(let k=.25;k<=5;k+=.25){const x=p.x+dx*k,z=p.z+dz*k;if(blocked(x,z,.3,0,1.8))seen=true;else if(seen){lx=x;lz=z;break}}
 if(lx===null)return false;u.vs=[p.x,p.z];u.ve=[lx,lz];u.vt=0;u.vd=.5+Math.hypot(lx-p.x,lz-p.z)*.07;u.vh=1.35;return true}
function stepVault(o,u,dt){u.vt+=dt;const k=Math.min(1,u.vt/u.vd),p=o.position;p.x=u.vs[0]+(u.ve[0]-u.vs[0])*k;p.z=u.vs[1]+(u.ve[1]-u.vs[1])*k;p.y=Math.sin(k*Math.PI)*u.vh;if(k>=1){u.vs=null;u.vt=0;p.y=groundAt(p.x,p.z,.5)}}
/* ===== committed obstacle attacks: once a zombie starts on a door / window / barricade it keeps at it until it is destroyed ===== */
function atkValid(u,p){const a=u.atk;if(!a)return false;let ok=false,x,z;
 if(a.t==='door'){ok=doors.includes(a.o);const q=a.o.open&&a.o.solO?a.o.solO:a.o.sol;x=(q.min.x+q.max.x)/2;z=(q.min.z+q.max.z)/2}
 else if(a.t==='win'){ok=a.o.alive;x=a.o.p.x;z=a.o.p.z}
 else{ok=G.bars.includes(a.o);{const q=fzBarNear(a.o,p.x,p.z);x=q[0];z=q[1]}
  // a barricade is only worth bashing if the flow field still routes through it (doors and windows are always finished)
  if(ok&&NAV.ok){const n=navNext(p.x,p.z);if(n&&!(n.o&&n.o.o===a.o))ok=false}}
 if(ok&&Math.hypot(p.x-x,p.z-z)>3.2)ok=false;if(!ok){u.atk=null;return false}u.fx=x;u.fz=z;return true}
function atkDo(z,u,p,dt){const a=u.atk,o=a.o;
 if(a.t==='door'){if(u.cd<=0){u.cd=.5;S.snarl(p);u.wsw=.3}o.sh=.25;if((o.hp-=fzBar(u)*dt*1.2)<=0)doorBreak(o)}
 else if(a.t==='win'){u.wh=(u.wh||0)+dt;if(u.cd<=0){u.cd=.45;S.snarl(p);u.wsw=.3}if(u.wh>1.1){u.wh=0;breakWin(o)}}
 else{if(u.cd<=0){u.cd=1;S.snarl(p);u.wsw=.35;o.hp-=fzBar(u);if(o.hp<=0)breakBar(o);else tint(o)}}}
function zMove(z,u,p,dt,best,tp,useField){if(best<1.3)return;
 const night=G.time>=20||G.time<5,sp=u.sp*(night?1.2:1)*dt;let wx=tp.x,wz=tp.z,nx0=null;
 if(useField&&NAV.ok){nx0=navNext(p.x,p.z);if(nx0){wx=nx0.x;wz=nx0.z}}
 let dx=wx-p.x,dz=wz-p.z,d=Math.hypot(dx,dz);if(d<.04){dx=tp.x-p.x;dz=tp.z-p.z;d=Math.hypot(dx,dz)||1}
 const ux=dx/d,uz=dz/d,tx=p.x+ux*sp,tz=p.z+uz*sp,bl=blocked(tx,tz,.3,p.y,1.8);
 if(!bl){p.x=tx;p.z=tz;u.stk=0;return}
 // bash/smash only what the route goes through (or anything, if there is no route yet); otherwise just slide round it
 const wants=o=>!nx0||(nx0.o&&nx0.o.o===o);
 if(bl.door&&wants(bl.door)){u.atk={t:'door',o:bl.door};if(bl.door.hp===undefined)bl.door.hp=50;return}
 if(bl.bar&&wants(bl.bar)){u.atk={t:'bar',o:bl.bar};return}
 if(bl.win&&wants(bl.win)){u.atk={t:'win',o:bl.win};return}
 if(bl.max.y<=1.3&&!bl.bar&&!bl.door&&!bl.win){const w=winNear(tx,tz,1.7);if(w&&w.alive){if(wants(w)){u.atk={t:'win',o:w};return}}else{if(Math.random()<(G.mode==='SIEGE'?.12:.22)){failJump(z,u,ux,uz);return}if(startVault(z,u,ux,uz))return}}
 if(!blocked(tx,p.z,.3,p.y,1.8))p.x=tx;else if(!blocked(p.x,tz,.3,p.y,1.8))p.z=tz;
 else{u.stk=(u.stk||0)+dt;if(u.stk>.8){u.stk=0;const ax=p.x+rnd(-.4,.4),az=p.z+rnd(-.4,.4);if(!blocked(ax,az,.3,p.y,1.8)){p.x=ax;p.z=az}NAV.T=0}}}
/* v075: the player can shoot and melee doors down too. Bullets / blows chip the door's hp (the zombies' bash uses the same pool), it shakes on
   every hit, and at 0 it breaks off its hinges exactly like a zombie break-in. Locked doors have 110 hp instead of 50. */
function doorHit(d,dmg,src){if(!d||doors.indexOf(d)<0)return false;d.hp-=dmg;d.sh=.25;
 const pc=Math.max(0,Math.round(d.hp/(d.hp0||50)*100));
 if(d.hp<=0){doorBreak(d);fb('DOOR BROKEN','#facc15');return true}
 try{S.hit(src==='melee'?'blunt':'blunt')}catch(e){}fb((d.locked&&!d.open?'LOCKED DOOR ':'DOOR ')+pc+'%','#e9b43c');return true}
function doorBreak(d){const k=solids.indexOf(d.sol);if(k>=0)solids.splice(k,1);if(d.solO){const k2=solids.indexOf(d.solO);if(k2>=0)solids.splice(k2,1)}if(d.p.parent)d.p.parent.remove(d.p);const j=doors.indexOf(d);if(j>=0)doors.splice(j,1);S.door(1,d.sol.getCenter(P3))}
function updateZombies(dt1){const dt=dt1;const night=G.time>=20||G.time<5,horde=G.mode==='SIEGE',p0=pl.position,sr=(night?14:24)*(K.ShiftLeft?1.3:1)*(G.crouch?.7:1)*skSneakMul(G);
 NAV.T-=dt;if(NAV.ok&&NAV.T<=0){NAV.T=.45;navField(horde)}
 zombies.forEach(z=>{let dt=dt1;{const u0=z.userData,dx0=z.position.x-p0.x,dz0=z.position.z-p0.z;if(!horde&&dx0*dx0+dz0*dz0>3600&&!u0.atk&&!u0.vs&&!(u0.ragT>0)&&!(u0.rise>0)&&!u0.sleep){u0.lod=(u0.lod||0)+dt1;if(((PERF.n+(u0.zi||(u0.zi=++PERF.zc)))&3)!==0)return;dt=u0.lod;u0.lod=0}}
  const u=z.userData,p=z.position;u.cd-=dt;u.lt-=dt;u.fx=undefined;
  if(u.kd){if(typeof zKnockStep==='function')zKnockStep(z,dt);else u.kd=null;return}   // v072: knocked down (failed jump / bowled over), ragdoll then get up
  if(u.md&&u.md.busy&&window.fzMedicTick&&!u.sleep&&!(u.rise>0)&&!(u.ragT>0)&&!(u.flop>0)&&!u.vs){window.fzMedicTick(z,dt);return}
  if(u.sleep)return;if(u.rise>0){riseStep(z,dt);return}
  if(u.ragT>0){u.ragT-=dt;ragStep(z,dt);if(u.ragT<=0)ragEnd(z);return}
  if(u.flop>0){u.flop-=dt;z.rotation.x=-1.45;p.y=.25;if(u.flop<=0){p.y=0;z.lookAt(p0.x,0,p0.z);u.cl=rnd(1,2)}return}
  if(u.vs){stepVault(z,u,dt);return}
  if(u.tk){if(typeof fzTackleStep==='function'&&!u.crawl)fzTackleStep(z,dt);else u.tk=null;return}
  if(u.aimG){if(window.fzAimStep&&!u.crawl&&u.gun)fzAimStep(z,dt);else u.aimG=null;return}   /* v075: an armed zombie taking aim stands still (skills.js) */   // v072: football kneel / charge owns the zombie
  let tp=p0,tS=null,best=Math.hypot(p.x-p0.x,p.z-p0.z);const committed=u.atk&&atkValid(u,p);
  smesh.forEach(m=>{const d=Math.hypot(p.x-m.position.x,p.z-m.position.z);if(m.userData.s.hp>0&&d<best&&(horde||(d<20*skSneakMul(m.userData.s)&&losC(z,m)))){best=d;tp=m.position;tS=m.userData.s}});
  if(!horde&&!tS&&!committed){
   if(u.lt<=0){u.lt=.2+Math.random()*.1;const f=Math.sin(z.rotation.y)*(p0.x-p.x)+Math.cos(z.rotation.y)*(p0.z-p.z);u.see=best<sr*(u.see?1.15:1)&&(u.see||f>best*.26)&&los(p,p0)}
   if(u.see){u.hunt=4*skForget(G);u.lx=p0.x;u.lz=p0.z;u.was=1;u.lk=0;if(Math.random()<dt*.25)S.groan(p)}
   if(!u.see){
    if(u.hunt>0){u.hunt-=dt;tp={x:u.lx,z:u.lz,userData:{}};if(Math.hypot(p.x-u.lx,p.z-u.lz)<.9)u.hunt=0}
    else if(u.was){u.was=0;S.lost(p);u.lk=rnd(1.5,2.5);u.ld=z.rotation.y}
    if(u.hunt<=0){if(u.lk>0){u.lk-=dt;const s=u.sp*.7*dt,nx=p.x+Math.sin(u.ld)*s,nz=p.z+Math.cos(u.ld)*s;if(blocked(nx,nz))u.lk=0;else{p.x=nx;p.z=nz}if(u.lk<=0){u.hx=p.x;u.hz=p.z;u.t=rnd(1,2.5);u.w=0}return}return idle(z,dt)}}}
  if(horde&&Math.random()<dt*.08)S.groan(p);const tgt=tp;if(committed)atkDo(z,u,p,dt);else zMove(z,u,p,dt,best,tp,horde||tS||u.see);
  p.y=groundAt(p.x,p.z,p.y+1);
  zombies.forEach(o=>{if(o===z)return;const ox=p.x-o.position.x,oz=p.z-o.position.z,dd=Math.hypot(ox,oz);if(dd>0&&dd<.8){const px=p.x+ox/dd*3*dt,pz=p.z+oz/dd*3*dt;if(!blocked(px,pz,.3,0,1.8)){p.x=px;p.z=pz}}});z.lookAt(u.fx!==undefined?u.fx:tp.x,0,u.fx!==undefined?u.fz:tp.z);
  const tfy=tgt===p0?p0.y-(G.eyeUsed||1.6):(tgt.y||0);
  if(best<=(u.crawl?1.4:1.9)&&u.cd<=0&&Math.abs(p.y-tfy)<1.7&&(horde?los(p,tgt,1):(tS?los(p,tgt,1):los(p,p0,1)))){u.cd=1;S.snarl(p);if(tS&&Math.random()<zMiss(tS)){zMissFx(p,0)}else if(tS){tS.hp-=u.dmg*(horde?1.8:1.4)*skDmgMul(tS);{const sm=smesh.find(q=>q.userData.s===tS);if(sm){flashObj(sm,.3);bloodSpray(sm.position.x,sm.position.y+1.1,sm.position.z,sm.position.x-p.x,sm.position.z-p.z,ri(6,10),1)}}if(tS.hp<=0){toast(tS.name+' has fallen!');const m=smesh.find(q=>q.userData.s===tS);if(m){S.scream(m.position);smesh=smesh.filter(q=>q!==m);if(window.survDown)survDown(m,p);else scene.remove(m)}}}else{if(Math.random()<zMiss(G))zMissFx(p,1);else damage(u.dmg)}}});
 zombies.forEach(z=>fzZAct(z,dt,horde));zombies.forEach(z=>animZ(z,dt,horde));zombies.forEach(z=>{const u=z.userData;if(u.wsw>0){u.wsw-=dt;const P=u.parts;if(P)P.armL.rotation.x=P.armR.rotation.x=-2.4+Math.sin(u.wsw*30)*.7}});
 zombies.forEach(z=>{const u=z.userData;if(u.flash>0){u.flash-=dt;if(u.flash<=0)tintHit(z,0)}if(u.stag>0){u.stag-=dt;const P=u.parts;if(P&&!u.crawl){P.body.rotation.x=-.35;P.head.rotation.x=-.5}}});
 smesh.forEach(m=>{hpDraw(m);const u=m.userData;if(u.flash>0){u.flash-=dt;if(u.flash<=0)tintHit(m,0)}if(u.aimT>0){u.aimT-=dt;if(u.aimT<=0)armDefault(m)}});
 zombies.forEach(z=>zHpTag(z,horde));
 G.spikes.slice().forEach(s=>{s.t=(s.t||0)-dt;if(s.t>0)return;let hit=false;zombies.forEach(z=>{if(Math.hypot(z.position.x-s.x,z.position.z-s.z)<1.4){hit=true;z.userData.hp-=12;dmgNum(z,12,'#c9d4e0');s.hp-=3;if(z.userData.hp<=0)killZ(z)}});
  if(hit){s.t=.5;if(s.hp<=0){scene.remove(s.mesh);G.spikes=G.spikes.filter(q=>q!==s);toast('A spike trap wore out')}}})}
function damage(a){a*=skDmgMul(G);G.hp=Math.max(0,G.hp-a);S.hurt();$('dv').style.opacity=1;setTimeout(()=>$('dv').style.opacity=0,300);if(G.hp<=0)finish(false,'You were killed.')}

function own(o){while(o&&!o.userData.kind)o=o.parent;return o}
function look(thru,v){ray.setFromCamera(v||C0,camera);ray.far=40;for(const i of ray.intersectObjects(scene.children,true)){const o=own(i.object);if(thru&&o&&o.userData.kind==='glass'){breakWin(o.userData.w,true);continue}if(thru&&o&&o.userData.thru)continue;return{o,d:i.distance,m:i.object,p:i.point,n:i.face?i.face.normal.clone().transformDirection(i.object.matrixWorld):null}}return null}
function fb(t,c){const e=$('fb');e.textContent=t;e.style.color=c;e.style.opacity=1;clearTimeout(fbT);fbT=setTimeout(()=>e.style.opacity=0,500)}
let vms=[];
function bx(g,w,h,d,x,y,z,c){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.6}));m.position.set(x,y,z);g.add(m);return m}
/* =====================================================================================================
   REVISION 037 - WEAPON SYSTEM
   1. Models are generated from the SAME shape lists the inventory sprites are painted from (gunLong / gunSmg / gunPistol / meleePaint),
      so every weapon's 3D model follows its sprite design. They are used for the first-person view and in NPC hands.
   2. A weapon only works while its item is in the holder's inventory. Player: TAB cycles Fist + every weapon in the inventory.
   3. Guns track rounds in the clip on the item (inst.clip) and reload from ammo items of their own calibre in the same inventory.
   4. NPCs equip the first usable weapon they hold, show it in the right hand, shoot only with ammo from their own inventory, and
      walk up to and hit nearby zombies with melee weapons (or fists).
   ===================================================================================================== */
const CELLM_DEF=.105,MODEL_T={},MC={},VM={root:null,set:{},cur:null};
const matOf=c=>MC[c]||(MC[c]=new THREE.MeshStandardMaterial({color:new THREE.Color(c),roughness:.65,metalness:.15}));
function recordShapes(id){const it=ITEMS[id],W=it.size[0]*BPX,H=it.size[1]*BPX,rects=[],arcs=[];
 const F=(c,a,b,w,h)=>rects.push([c,a,b,w,h]),T=()=>{};
 const x={lineWidth:3,strokeStyle:'',fillStyle:'',beginPath(){},stroke(){},arc(cx,cy,r,a0,a1){arcs.push([cx,cy,r,a0,a1,this.lineWidth])}};
 const g=GUNS[id];
 if(g){if(g[0]==='L')gunLong(F,g[1]);else if(g[0]==='S')gunSmg(F,Object.assign({T},g[1]));else gunPistol(F,Object.assign({T},g[1]))}
 else if(it.cat==='melee')meleePaint(id,F,x,W,H);
 return{rects,arcs,W,H}}
const hexRGB=c=>{let s=c.replace('#','');if(s.length===3)s=s[0]+s[0]+s[1]+s[1]+s[2]+s[2];return[parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]};
function isBladeCol(c){const [r,g,b]=hexRGB(c);return (r+g+b)/3>150&&Math.max(r,g,b)-Math.min(r,g,b)<40}
// Build a model (grip at the origin; guns point down -Z with up = +Y; melee tips point up +Y). Cached per item id.
function modelFor(id){if(MODEL_T[id])return MODEL_T[id];
 const it=ITEMS[id],d=WDEF[id],gun=d.type==='gun',cm=d.cellM||CELLM_DEF,Wm=it.size[0]*cm,Hm=it.size[1]*cm,rec=recordShapes(id),g=new THREE.Group(),gx=d.grip[0],gy=d.grip[1];
 let i=0,mx=0,myc=0,tp=-9;
 rec.rects.forEach(r=>{const [col,a,b,w,h]=r;if(col.length===5||col.length===9)return; // translucent shading strips from the sprite are skipped
  const wm=w*Wm,hm=h*Hm,cu=(a+w/2-gx)*Wm,cv=(gy-(b+h/2))*Hm;let th;
  if(gun)th=Math.min(.05,Math.max(.013,Math.min(wm,hm)*.85));
  else th=isBladeCol(col)?(col.length===4&&col!=='#ccc'&&hexRGB(col)[0]>240?.016:.012):Math.min(.034,Math.max(.014,Math.min(wm,hm)*.7));
  th+=(i++%6)*.0005;
  const me=new THREE.Mesh(new THREE.BoxGeometry(gun?th:wm,hm,gun?wm:th),matOf(col));
  if(gun){me.position.set(0,cv,-cu);const f=(a+w-gx)*Wm;if(f>mx){mx=f;myc=cv}tp=Math.max(tp,cv+hm/2)}else me.position.set(cu,cv,0);
  g.add(me)});
 rec.arcs.forEach(A=>{const [cx,cy,r,a0,a1,lw]=A,pm=v=>v/BPX*cm,n=12,wd=pm(lw);let px=null;
  for(let k=0;k<=n;k++){const t=a0+(a1-a0)*k/n,u=pm(cx+Math.cos(t)*r)-gx*Wm,v=gy*Hm-pm(cy+Math.sin(t)*r);
   if(px){const dx=u-px[0],dy=v-px[1],len=Math.hypot(dx,dy)+.004,me=new THREE.Mesh(new THREE.BoxGeometry(len,wd,.012+(k%2)*.0006),matOf('#d1d5db'));me.position.set((u+px[0])/2,(v+px[1])/2,0);me.rotation.z=Math.atan2(dy,dx);g.add(me)}
   px=[u,v]}});
 const T={g,mz:[0,myc,-mx-.01],len:mx,Wm,Hm,top:tp};MODEL_T[id]=T;return T}
function cloneModel(id,ownMat){const c=modelFor(id).g.clone(true);if(ownMat)c.traverse(o=>{if(o.isMesh)o.material=o.material.clone()});return c}

/* ---------- first person viewmodel ---------- */
const SKIN=0xd9a47a,SLEEVE=0x4a5a3a;
function vmBase(d){return d.type==='gun'?[.25,-.26,-.46]:d===FIST?[.24,-.3,-.42]:[.30,-.32,-.50]}
function vmEnsure(key){if(!VM.root){VM.root=new THREE.Group();camera.add(VM.root)}if(VM.set[key])return VM.set[key];
 const gun=key!=='fist'&&WDEF[key].type==='gun',d=key==='fist'?FIST:WDEF[key],o=new THREE.Group(),v={o,d,fl:null};VM.root.add(o);o.visible=false;
 if(key==='fist'){bx(o,.1,.1,.13,0,0,0,SKIN);const fa=bx(o,.09,.09,.55,.01,-.1,.3,SLEEVE);fa.rotation.x=.3}
 else{const t=modelFor(key),m=cloneModel(key,false);o.add(m);v.m=m;
  bx(o,.075,.085,.11,0,-.01,.02,SKIN);const fa=bx(o,.085,.085,.5,.02,-.1,.27,SLEEVE);fa.rotation.x=.35;
  if(gun&&d.lhand){const lu=(d.lhand[0]-d.grip[0])*t.Wm,lv=(d.grip[1]-d.lhand[1])*t.Hm;bx(o,.075,.08,.1,-.01,lv,-lu,SKIN);const fl=bx(o,.08,.08,.55,-.08,lv-.1,-lu+.26,SLEEVE);fl.rotation.x=.4;fl.rotation.y=-.3}
  if(gun){v.mz=t.mz;const sy=t.top+.014,rz=-((gun&&d.grip[0]>.3?.3:.2)-d.grip[0])*t.Wm;bx(o,.006,.016,.012,-.012,t.top+.006,rz,0x0b0b0b);bx(o,.006,.016,.012,.012,t.top+.006,rz,0x0b0b0b);bx(o,.007,sy-t.mz[1],.008,0,(sy+t.mz[1])/2,t.mz[2]+.05,0x0b0b0b);v.sy=sy;const f=new THREE.Group();f.position.set(t.mz[0],t.mz[1],t.mz[2]-.02);const a=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.02),new THREE.MeshBasicMaterial({color:0xffd070})),b=new THREE.Mesh(new THREE.BoxGeometry(.16,.02,.02),new THREE.MeshBasicMaterial({color:0xffa030})),c=b.clone();c.rotation.z=Math.PI/2;f.add(a,b,c);f.visible=false;o.add(f);v.fl=f}
  if(!gun){o.scale.setScalar(.85)}}
 VM.set[key]=v;return v}
function pWeapons(){return PINV.items.filter(q=>WDEF[q.id])}
function pCheckEq(){if(G.eq&&!PINV.items.includes(G.eq)){G.eq=null;G.rl=0;G.draw=.25}}
function equip(inst){if(inst===G.eq)return;G.rl=0;G.fbLeft=0;G.eq=inst||null;G.draw=.3;G.cdS=Math.max(G.cdS,.2);S.swap(inst&&WDEF[inst.id].type==='gun'?1:0)}
function cycleWeapon(){pCheckEq();const l=[null].concat(pWeapons()),i=Math.max(0,l.indexOf(G.eq));equip(l[(i+1)%l.length])}
function animVM(dt){pCheckEq();G.kick=Math.max(0,G.kick-dt*8);G.swT=Math.max(0,G.swT-dt);G.draw=Math.max(0,G.draw-dt);G.flashT=Math.max(0,G.flashT-dt);G.dry=Math.max(0,(G.dry||0)-dt);
 const w=G.eq,key=w?w.id:'fist',d=w?WDEF[key]:FIST,v=vmEnsure(key);
 if(VM.cur!==v){if(VM.cur)VM.cur.o.visible=false;VM.cur=v;v.o.visible=true}
 const gun=d.type==='gun',bs=vmBase(d);let px=bs[0],py=bs[1],pz=bs[2],rx=0,ry=0,rz=0;
 const aimOn=!!(K.m2&&locked&&!invOpen&&!wheel&&G.draw<.15&&(!gun||G.rl<=0));
 G.ads+=((aimOn&&gun?1:0)-G.ads)*Math.min(1,dt*10);G.zoom+=((aimOn&&!gun?1:0)-G.zoom)*Math.min(1,dt*8);
 {const tf=G.fov*(1-.3*G.ads-.12*G.zoom);if(Math.abs(camera.fov-tf)>.02){camera.fov=tf;camera.updateProjectionMatrix()}G.zoomK=tf/G.fov}
 if(!gun&&d!==FIST){rx=-.55;rz=-.12;if(v.m)v.m.rotation.y=-1.35}else if(gun)ry=.03;
 const moving=locked&&(K.KeyW||K.KeyA||K.KeyS||K.KeyD),bob=moving?Math.sin(performance.now()*.009*(K.ShiftLeft?1.4:1))*.008:0;py+=bob;px+=bob*.5;
 const dr=G.draw>0?G.draw/.3:0;py-=dr*.35;rx+=dr*.8;
 if(gun){const rl=G.rl>0,p=rl?1-G.rl/(G.rlT||1):0,dip=rl?Math.sin(p*Math.PI):0;py-=dip*.2;rx+=-dip*.5;rz+=dip*.7;if(rl&&d.rlN===1)pz+=Math.sin(p*Math.PI*3)*.03;
  pz+=G.kick*.07*d.kick*(1-.5*G.ads);rx+=G.kick*.16*d.kick*(1-.5*G.ads);if(G.ads>.001&&v.sy!==undefined){const a=G.ads;px+=(0-px)*a;py+=((-.04-v.sy)-py)*a;pz+=(-.45-pz)*a;ry*=(1-a)}if(v.fl){v.fl.visible=G.flashT>0;if(v.fl.visible){v.fl.rotation.z=Math.random()*6;v.fl.scale.setScalar(.8+Math.random()*.6)}}}
 if(G.swT>0){const sp=1-G.swT/G.swD,sw=Math.sin(sp*Math.PI),e=1-Math.pow(1-sp,2.2);
  switch(G.swK){
   case 'slash':pz-=sw*.55;px-=sw*.1;ry+=sw*.12;break;
   case 'chop':pz-=sw*.6;py-=sw*.04;break;
   case 'jab':pz-=sw*.7;break;
   case 'punch':pz-=sw*.5;py+=sw*.03;px-=sw*.1;break;
   case 'bash':pz-=sw*.5;rx-=sw*.3;break}}
 v.o.position.set(px,py,pz);v.o.rotation.set(rx,ry,rz);updFx(dt)}

/* ---------- ammo (type-specific; works on any inventory: player, survivor, container) ---------- */
function ammoCount(inv,aid){let n=0;inv.items.forEach(q=>{if(q.id===aid)n+=Math.max(0,q.rem)});return n}
function ammoTake(inv,aid,n){let taken=0;const l=inv.items.filter(q=>q.id===aid&&q.rem>0).sort((a,b)=>a.rem-b.rem||a.uid-b.uid);
 for(const q of l){if(taken>=n)break;const t=Math.min(q.rem,n-taken);q.rem-=t;taken+=t}
 inv.items.filter(q=>q.id===aid&&q.rem<=0).forEach(q=>invRemove(inv,q));return taken}
// take the rounds out of a gun and put them back into the inventory as ammo (topping up part-used boxes first)
function unloadGun(inv,inst){const d=WDEF[inst.id];if(!d||d.type!=='gun'||!(inst.clip>0))return 0;
 const ai=d.ammo,mx=ITEMS[ai].value.ammo,n=inst.clip;let r=n;const fills=[],added=[];
 inv.items.forEach(q=>{if(r>0&&q.id===ai&&q.rem<mx){const t=Math.min(mx-q.rem,r);fills.push([q,t]);r-=t}});
 while(r>0){const t=Math.min(mx,r),q=newInst(ai);q.rem=t;if(!invAdd(inv,q)){added.forEach(a=>invRemove(inv,a));return -1}added.push(q);r-=t}
 fills.forEach(([q,t])=>q.rem+=t);inst.clip=0;if(G.eq===inst)G.rl=0;return n}

/* ---------- player: reload, shoot, melee ---------- */
function reload(){const w=G.eq,d=w&&WDEF[w.id];if(!d||d.type!=='gun'||G.rl>0||w.clip>=d.cap)return;
 if(ammoCount(PINV,d.ammo)<=0){toast('No '+ITEMS[d.ammo].name+' ammo in your inventory');S.click();return}
 G.rlT=G.rl=d.rlT;S.rlStep(d)}
function rlTick(dt){if(G.rl<=0)return;G.rl-=dt;if(G.rl>0)return;G.rl=0;const w=G.eq,d=w&&WDEF[w.id];if(!d||d.type!=='gun')return;
 const n=Math.min(d.rlN,d.cap-w.clip,ammoCount(PINV,d.ammo));if(n>0){ammoTake(PINV,d.ammo,n);w.clip+=n}
 if(w.clip<d.cap&&ammoCount(PINV,d.ammo)>0){G.rlT=G.rl=d.rlT;S.rlStep(d)}}
const LIVE=new Set(['zombie','comp','surv','npc','corpse']),FXT={t:[],h:[]},HOLE_MAX=60,HOLE_LIFE=40;let HOLE_MAT=null,HOLE_GEO=null,TR_GEO=null;
function fxInit(){HOLE_GEO=new THREE.PlaneGeometry(.09,.09);const cv=document.createElement('canvas');cv.width=cv.height=32;const c=cv.getContext('2d'),g=c.createRadialGradient(16,16,0,16,16,15);g.addColorStop(0,'rgba(5,5,5,1)');g.addColorStop(.35,'rgba(15,12,10,.95)');g.addColorStop(.6,'rgba(70,60,50,.7)');g.addColorStop(1,'rgba(70,60,50,0)');c.fillStyle=g;c.fillRect(0,0,32,32);
 HOLE_MAT=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6});TR_GEO=new THREE.BoxGeometry(1,1,1)}
function addHole(p,n){if(!HOLE_MAT)fxInit();const m=new THREE.Mesh(HOLE_GEO,HOLE_MAT);m.position.copy(p).addScaledVector(n,.012);scene.add(m);m.lookAt(p.clone().add(n));m.rotateZ(rnd(0,TAU));const s=rnd(.8,1.3);m.scale.set(s,s,1);m.raycast=()=>{};m.renderOrder=3;m.userData.t=0;m.userData.s=s;FXT.h.push(m);while(FXT.h.length>HOLE_MAX)scene.remove(FXT.h.shift())}
function addTracer(a,b,life,w,col){if(!TR_GEO)fxInit();const len=a.distanceTo(b);if(len<.05)return;w=w||.012;const m=new THREE.Mesh(TR_GEO,new THREE.MeshBasicMaterial({color:col||0xffe9a0,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.copy(a).lerp(b,.5);m.scale.set(w,w,len);scene.add(m);m.lookAt(b);m.raycast=()=>{};m.renderOrder=4;m.frustumCulled=false;m.userData.t=0;m.userData.life=life||.1;FXT.t.push(m);if(FXT.t.length>90)scene.remove(FXT.t.shift())}
function addSpark(p){addTracer(p.clone().add(new THREE.Vector3(0,0,-.03)),p.clone().add(new THREE.Vector3(0,0,.03)),.08,.07,0xffb050)}
function updFx(dt){for(let i=FXT.t.length-1;i>=0;i--){const m=FXT.t[i];m.userData.t+=dt;const k=1-m.userData.t/m.userData.life;if(k<=0||!m.parent){scene.remove(m);FXT.t.splice(i,1)}else m.material.opacity=.9*k}
 for(let i=FXT.h.length-1;i>=0;i--){const m=FXT.h[i];if(!m.parent){FXT.h.splice(i,1);continue}m.userData.t+=dt;const r=HOLE_LIFE-m.userData.t;if(r<=0){scene.remove(m);FXT.h.splice(i,1)}else if(r<3){const s=m.userData.s*r/3;m.scale.set(s,s,1)}}}
function rayWorld(o,dir,far,skip){ray.set(o,dir);ray.far=far;for(const i of ray.intersectObjects(scene.children,true)){if(i.object.isSprite||!i.object.visible||i.distance<.3)continue;const ow=own(i.object);if(ow&&(ow===skip||ow.userData.thru))continue;return{p:i.point,n:i.face?i.face.normal.clone().transformDirection(i.object.matrixWorld):null,o:ow}}return null}
function playerMuzzle(){const v=VM.cur,p=new THREE.Vector3();if(v&&v.mz){p.set(v.mz[0],v.mz[1],v.mz[2]);v.o.updateWorldMatrix(true,false);v.o.localToWorld(p)}else camera.getWorldPosition(p);return p}
function npcMuzzle(m){const u=m.userData,v=new THREE.Vector3();m.updateMatrixWorld(true);if(u.hold&&u.hid){const t=modelFor(u.hid);v.set(t.mz[0],t.mz[1],t.mz[2]);u.hold.localToWorld(v)}else v.set(m.position.x,m.position.y+1.3,m.position.z);return v}
function npcTrace(o,b,hit,m){const tp=new THREE.Vector3(b.position.x,b.position.y+tgtY(b)*(b.scale.x||1),b.position.z);
 if(hit){addTracer(o,tp);addSpark(tp);return}
 const dir=tp.clone().sub(o).normalize();dir.x+=rnd(-.07,.07);dir.y+=rnd(-.05,.05);dir.z+=rnd(-.07,.07);dir.normalize();
 const r=rayWorld(o,dir,45,m),e=r?r.p:o.clone().addScaledVector(dir,45);addTracer(o,e);
 if(r){addSpark(e);if(r.n&&!(r.o&&LIVE.has(r.o.userData.kind))){if(r.n.dot(dir)>0)r.n.negate();addHole(e,r.n)}}}
function shoot(){const w=G.eq,d=w&&WDEF[w.id];if(!d||d.type!=='gun')return melee();
 if(G.cdS>0||G.draw>.1)return;
 if(G.rl>0){if(d.rlN===1&&w.clip>0)G.rl=0;else return} // round-by-round guns can be fired mid-reload
 if(w.clip<=0){G.fbLeft=0;if(ammoCount(PINV,d.ammo)>0)reload();else{if(G.dry<=0){toast('Out of '+ITEMS[d.ammo].name+' ammo');G.dry=1.5}S.click()}G.cdS=.3;return}
 G.cdS=d.cd;w.clip--;if(d.fbN){if(G.fbLeft>0){G.fbLeft--}else{G.fbLeft=d.fbN-1}if(G.fbLeft<=0){G.fbLeft=0;G.cdS=d.fbPause}}G.kick=1;G.flashT=.06;S.shot(d.snd);
 zombies.forEach(z=>{if(z.position.distanceTo(pl.position)<fzBang(d)){if(z.userData.sleep)wakeZ(z);z.userData.hunt=4;z.userData.lx=pl.position.x;z.userData.lz=pl.position.z;z.userData.see=true}});
 const mv=K.KeyW||K.KeyA||K.KeyS||K.KeyD,aim=G.ads>.8;let res='MISS',col='#aaa';const mzp=playerMuzzle();
 for(let k=0;k<d.pel;k++){const sp=aim?(d.pel>1?d.spr*.5:0):d.spr*(mv?1.5:1)*(G.crouch?.7:1),h=look(true,new THREE.Vector2(rnd(-sp,sp),rnd(-sp,sp)));
  const rd=ray.ray.direction.clone(),far=ray.ray.origin.clone().addScaledVector(rd,40);let ep=h&&h.p?h.p:far,hole=null;
  if(h&&h.o&&h.o.userData.kind==='corpse'&&window.corpseHit){addWound(h);corpseHit(h.o,h.m.userData.part||'torso',d.dmg,pl.position);if(res==='MISS'){res='HIT';col='#f87171'}}
  else if(h&&h.o&&h.o.userData.kind==='zombie'){trainSk(G,'guns');const over=h.d>d.rng,ch=Math.min(.99,Math.max(.1,skGunBase(h.d)+d.acc+(aim?.3:0)-(mv?.1:0)-(over?Math.min(.4,(h.d-d.rng)/d.rng):0)+(d.pel>1&&h.d<10?.15:0)));
   if(Math.random()<ch){addWound(h);const dm=Math.max(1,d.dmg+fzBand(d,h.d))*(over?Math.max(.4,d.rng/h.d):1),c=hitZ(h.o,dm,h.m.userData.part||'torso',false);if(c){res='CRITICAL!';col='#facc15'}else if(res!=='CRITICAL!'){res='HIT';col='#f87171'}}else ep=far}
  else if(h&&h.o&&h.o.userData.kind==='door'&&h.o.userData.d){const dd=h.o.userData.d,dm=Math.max(1,d.dmg+fzBand(d,h.d))*(h.d>d.rng?Math.max(.4,d.rng/h.d):1);if(doorHit(dd,dm,'gun')&&res==='MISS'){res='DOOR';col='#e9b43c'}}
  else if(h&&h.p&&h.n&&holeOK(h))hole=h;
  if(k<4){addTracer(mzp,ep);if(ep!==far)addSpark(ep)}
  if(hole){const n=hole.n.clone();if(n.dot(rd)>0)n.negate();addHole(hole.p,n)}}
 if(res==='DOOR')return;if(res!=='MISS')hitMark(res==='CRITICAL!');fb(res,col)}
function melee(){const w=G.eq,d0=w?WDEF[w.id]:FIST,d=d0.type==='gun'?BASH:d0;if(G.cdM>0||G.st<d.st||G.draw>.1)return;
 G.cdM=d.cd;G.st-=d.st;G.swT=G.swD=d.swD;G.swK=d.swing;S.swing(w?1:0);
 const t=meleeTarget(d.reach);   // v072: 3D body-to-body reach + wall check (was flat map distance, so you could hit zombies far below you)
 const _sid=skWid(d);
 // v063: stealth kill - a melee hit on a zombie that is not hunting you (or asleep) kills it outright, silently (nothing else is alerted)
 if(t){const tu=t.userData;if(tu.sleep||(!tu.see&&!(tu.hunt>0)&&!tu.atk&&G.mode!=='SIEGE')){trainSk(G,_sid);S.hit(d.hit);tu.ld=0;tu.hp=-1;flashObj(t,.3);
   bloodSpray(t.position.x,t.position.y+1.2*t.scale.x,t.position.z,t.position.x-pl.position.x,t.position.z-pl.position.z,ri(8,12),1.2);killZ(t);fb('STEALTH KILL','#e5e7eb');return}}
 if(t&&Math.random()<skMeleeHit(G,_sid)){trainSk(G,_sid);S.hit(d.hit);const crit=hitZ(t,d.dmg*(.9+.2*skTot(G,_sid)/100),PK(PARTS),true);fb(crit?'CRITICAL!':'HIT',crit?'#facc15':'#f87171')}
 else{const gh=look(false);if(gh&&gh.o&&gh.o.userData.kind==='glass'&&gh.d<d.reach+.2){breakWin(gh.o.userData.w,true);S.hit(d.hit)}
  else if(gh&&gh.o&&gh.o.userData.kind==='door'&&gh.o.userData.d&&gh.d<d.reach+.3){trainSk(G,_sid);doorHit(gh.o.userData.d,d.dmg*(.9+.2*skTot(G,_sid)/100),'melee')}   /* v075: melee on doors */
  else fb('MISS','#aaa')}}
function hudWeapon(){const w=G.eq,d=w?WDEF[w.id]:null,l=pWeapons(),i=w?l.indexOf(w)+1:0;
 $('wn').textContent=(w?ITEMS[w.id].name:'Fist')+(d&&d.type==='gun'?' \u00b7 '+ITEMS[d.ammo].name:'')+'  ['+(i+1)+'/'+(l.length+1)+']';
 if(d&&d.type==='gun'){$('ac').textContent=w.clip+'/'+d.cap;$('ar').textContent=ammoCount(PINV,d.ammo)}else{$('ac').textContent='-';$('ar').textContent='-'}}
function lootRoll(q){const d=WDEF[q.id];if(d&&d.type==='gun')q.clip=ri(0,d.cap)}
function syncAllNpc(){smesh.forEach(m=>{const s=m.userData.s;if(s){npcSyncEquip(s);npcVisual(m,s)}})}

/* ---------- NPC equipment: first usable weapon in their own inventory, shown in the right hand ---------- */
function npcInv(sv){return svInv(sv).inv}
function npcUsable(sv,q){const d=WDEF[q.id];if(!d)return false;if(d.type==='melee')return true;return (q.clip||0)>0||ammoCount(npcInv(sv),d.ammo)>0}
function npcSyncEquip(sv){const inv=npcInv(sv);
 if(sv.eq&&(!inv.items.includes(sv.eq)||!npcUsable(sv,sv.eq)))sv.eq=null; // weapon gone, or a gun with no bullets and no ammo: back to fists
 if(!sv.eq){const q=inv.items.find(q=>npcUsable(sv,q));if(q)sv.eq=q} // fists are swapped out as soon as something usable is held
 return sv.eq||null}
function npcVisual(m,sv){const u=m.userData,P=u.P;if(!P)return;const q=sv.eq,id=q?q.id:null;if(u.hid===id&&u.hidInit)return;u.hid=id;u.hidInit=true;
 if(u.hold){P.elL.remove(u.hold);u.hold=null}
 const d=q?WDEF[id]:null;u.wk=!d?'fist':d.type==='gun'?'gun':'melee';
 if(d){const h=new THREE.Group();h.add(cloneModel(id,true));if(d.type==='gun')h.rotation.set(-Math.PI/2,0,Math.PI);else h.rotation.set(Math.PI/2+.45,Math.PI/2,0);h.position.set(0,-.5,.02);P.elL.add(h);u.hold=h}
 armDefault(m)}
function npcFace(m,c,x,z){const dx=x-m.position.x,dz=z-m.position.z;if(c){c.fx=dx;c.fz=dz;c.face=.6}m.rotation.y=Math.atan2(dx,dz)}
function npcStep(m,tx,tz,sp){const p=m.position,dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz)||1,nx=p.x+dx/l*sp,nz=p.z+dz/l*sp;let mv=0;
 if(!blocked(nx,nz,.35,p.y,1.7)){p.x=nx;p.z=nz;mv=sp}else if(!blocked(nx,p.z,.35,p.y,1.7)){p.x=nx;mv=sp}else if(!blocked(p.x,nz,.35,p.y,1.7)){p.z=nz;mv=sp}
 p.y=groundAt(p.x,p.z,p.y);return mv}
function npcSwingPose(m,st,d){const u=m.userData,P=u.P,p=Math.min(1,1-st.sw/st.swD),s=Math.sin(p*Math.PI),e=1-Math.pow(1-p,2),A=P.armL,E=P.elL,h=u.hold;
 switch(d.swing){
  case 'chop':A.rotation.x=-2.6+e*1.6;E.rotation.x=-.5+e*.35;if(h)h.rotation.x=2.0+e*.9;break;
  case 'slash':A.rotation.x=-1.35;A.rotation.z=-.9+p*1.9;E.rotation.x=-.4;if(h)h.rotation.x=Math.PI/2+.2;break;
  case 'jab':A.rotation.x=-1.4;E.rotation.x=-1.3+s*1.15;if(h)h.rotation.x=Math.PI-.15;break;
  default:A.rotation.x=-1.3;E.rotation.x=-1.9+s*1.7}}
// One NPC's whole fighting brain. o={R gun range, leash:{x,z,r}|null, home:{x,z}|null, walk, c:companion record|null}
function npcCombat(m,sv,st,dt,o){const p=m.position,u=m.userData,res={busy:false,moved:0};
 st.sync=(st.sync||0)-dt;if(st.sync<=0){st.sync=.5;npcSyncEquip(sv);npcVisual(m,sv)}
 const q=sv.eq,d=q?WDEF[q.id]:FIST,gun=d.type==='gun',inv=npcInv(sv);st.cd=(st.cd||0)-dt;st.rl=st.rl||0;
 if(st.sw>0){st.sw-=dt;res.busy=true;npcSwingPose(m,st,d);const pr=1-st.sw/st.swD;
  if(!st.hit&&pr>=.5){st.hit=true;const t=st.tgt;if(t&&zombies.includes(t)&&Math.hypot(t.position.x-p.x,t.position.z-p.z)<d.reach*.75+.6&&(trainSk(sv,skWid(d)),Math.random()<skMeleeHit(sv,skWid(d)))){S.hit(d.hit,p);hitZ(t,d.dmg*(.9+.2*skTot(sv,skWid(d))/100),PK(PARTS),true,p)}}
  if(st.sw<=0){st.sw=0;armDefault(m)}return res}
 if(gun){
  if(st.rl>0){st.rl-=dt;if(st.rl<=0){st.rl=0;const n=Math.min(d.rlN,d.cap-q.clip,ammoCount(inv,d.ammo));if(n>0){ammoTake(inv,d.ammo,n);q.clip+=n}
    if(q.clip<d.cap&&ammoCount(inv,d.ammo)>0){st.rl=d.rlT*1.2;S.rlStep(d,p)}}}
  let b=null,bd=o.R;zombies.forEach(z=>{if(z.userData.sleep)return;const dd=z.position.distanceTo(p);if(dd<bd&&los(p,z.position)){bd=dd;b=z}});
  if(!b){if(q.clip<d.cap&&st.rl<=0&&ammoCount(inv,d.ammo)>0){st.rl=d.rlT*1.2;S.rlStep(d,p)}return res}
  npcFace(m,o.c,b.position.x,b.position.z);
  if(q.clip<=0){if(ammoCount(inv,d.ammo)<=0){npcSyncEquip(sv);npcVisual(m,sv)}else if(st.rl<=0){st.rl=d.rlT*1.2;S.rlStep(d,p)}return res}
  if(st.rl>0){if(d.rlN===1)st.rl=0;else return res}
  if(st.cd>0){aimPose(m,b.position.x,tgtY(b),b.position.z);return res}
  const ns=Math.min(d.burst,q.clip);st.cd=d.npcCd+rnd(0,.25);q.clip-=ns;S.shot(d.snd,p);aimPose(m,b.position.x,tgtY(b),b.position.z);u.aimT=.8;
  const ch=Math.min(.95,Math.max(.1,(.95-bd/(d.rng*1.15))*skNpcAcc(sv)+d.acc*.6-(d.pel>1?bd/(d.rng*2.4):0)));
  trainSk(sv,'guns');const mzp=npcMuzzle(m);for(let i=0;i<ns;i++)for(let k=0;k<d.pel;k++){const hit=Math.random()<ch;if(k<3)npcTrace(mzp,b,hit,m);if(hit&&zombies.includes(b))dmgZ(b,Math.max(1,d.dmg+fzBand(d,bd))*(.9+.2*skTot(sv,'guns')/100)*(bd>d.rng?Math.max(.4,d.rng/bd):1),p)}
  return res}
 // ---- melee / fists: only zombies that are really close ----
 let t=null,td=d.aggro||7;
 zombies.forEach(z=>{const zu=z.userData;if(zu.sleep||Math.abs(z.position.y-p.y)>1.7)return;const dd=Math.hypot(z.position.x-p.x,z.position.z-p.z);if(dd>=td)return;
  if(o.leash&&Math.hypot(z.position.x-o.leash.x,z.position.z-o.leash.z)>o.leash.r+2)return;if(!los(p,z.position))return;t=z;td=dd});
 if(t){st.tgt=t;res.busy=true;npcFace(m,o.c,t.position.x,t.position.z);const eng=d.reach*.75;
  if(td>eng-.25){if(o.walk){const sp=3.6*dt,dx=t.position.x-p.x,dz=t.position.z-p.z,l=Math.hypot(dx,dz)||1,nx=p.x+dx/l*sp,nz=p.z+dz/l*sp;
    if(!o.leash||Math.hypot(nx-o.leash.x,nz-o.leash.z)<=o.leash.r)res.moved=npcStep(m,t.position.x,t.position.z,sp)}}
  else if(st.cd<=0){st.sw=st.swD=d.swD;st.hit=false;st.cd=d.npcCd+rnd(0,.3);S.swing(q?1:0,p)}
  return res}
 if(o.home&&Math.hypot(p.x-o.home.x,p.z-o.home.z)>1.8){res.busy=true;npcFace(m,o.c,o.home.x,o.home.z);res.moved=npcStep(m,o.home.x,o.home.z,3.2*dt)}
 return res}
function legAnim(m,u,mv,dt){const P=u.P;if(!P)return;u.ph=(u.ph||0)+mv*3;const sw=Math.min(1,mv/dt/3||0),sn=Math.sin(u.ph);P.legL.rotation.x=sn*.7*sw;P.legR.rotation.x=-sn*.7*sw}
// fort survivors (siege / base): same brain, anchored to their post
function survFight(dt){if(!zombies.length)return;smesh.forEach(m=>{const u=m.userData;if(u.kind!=='surv'||!u.s||u.s.hp<=0)return;const st=u.nf||(u.nf={});if(!st.home)st.home={x:m.position.x,z:m.position.z};
 const r=npcCombat(m,u.s,st,dt,{R:24,walk:true,leash:{x:st.home.x,z:st.home.z,r:6},home:st.home,c:null});legAnim(m,u,r.moved,dt)})}
function jump(dt){const p=pl.position;let fy=p.y-(G.eyeUsed||1.6),gy=groundAt(p.x,p.z,fy);
 if(fy<=gy+.02&&G.vy<=0){fy=gy;G.vy=0;if(K.Space&&!G.crouch&&locked&&!invOpen){G.vy=7.2;fy+=.01}}
 if(fy>gy+.02||G.vy>0){G.vy-=18*dt;fy+=G.vy*dt;if(fy<=gy&&G.vy<=0){fy=gy;G.vy=0}}G.eyeUsed=G.eyeH;p.y=G.eyeH+fy}
function dmgZ(z,d,fr){fr=fr||pl.position;const u=z.userData;u.see=true;u.hunt=4;u.lx=pl.position.x;u.lz=pl.position.z;u.lt=1;u.ld=d;u.hp-=d;dmgNum(z,d);
 bloodSpray(z.position.x,z.position.y+1.1*z.scale.x,z.position.z,z.position.x-fr.x,z.position.z-fr.z,ri(5,9),1);
 if(u.hp>0){if(u.sleep)wakeZ(z);flashObj(z,.25);const dx=z.position.x-fr.x,dz=z.position.z-fr.z,l=Math.hypot(dx,dz)||1,k=Math.min(.45,d/60+.15),nx=z.position.x+dx/l*k,nz=z.position.z+dz/l*k;if(!blocked(nx,nz)){z.position.x=nx;z.position.z=nz}u.stag=.22;u.cd=Math.max(u.cd||0,.4)}else{flashObj(z,.4);killZ(z)}}

/* ===== companions (survivors that follow you on scavenger runs) ===== */
const comps=[];let holdC=null;
function spawnComp(sv,x,z){const m=makePerson(RC[sv.role]||0x0284c7,x,z,sv.role||'Generalist'),P=m.userData.P;sv.range=G.uRange||sv.range||2;svInv(sv);
 const c={m,s:sv,follow:G.uFollow!==false,range:sv.range,cd:rnd(.4,1),P,ph:0};m.userData={kind:'comp',s:sv,c,P};hpBar(m);scene.add(m);smesh.push(m);comps.push(c);npcVisual(m,sv);return c}
// weapon arms pitch down/up to the target's height - crawling and lying zombies are low, so the gun must tip down at them
function tgtY(z){const u=z.userData;return(u.crawl||(u.sleep&&u.pose==='lie'))?.3:1.1}
function aimPose(m,tx,ty,tz){const P=m.userData.P;if(!P)return;const d=Math.max(.8,Math.hypot(tx-m.position.x,tz-m.position.z)),a=Math.atan2(1.3-ty,d),base=-(PI/2-a);
 P.armL.rotation.set(base+.25,0,0);P.elL.rotation.x=-.25;P.armR.rotation.x=base+.5;P.elR.rotation.x=-.5}
function armDefault(m){const P=m.userData.P;if(!P)return;const k=m.userData.wk||'fist';
 if(k==='gun'){P.armL.rotation.set(-1.25,0,0);P.elL.rotation.x=-.25;P.armR.rotation.x=-1;P.elR.rotation.x=-.5}
 else if(k==='melee'){P.armL.rotation.set(-.55,0,0);P.elL.rotation.x=-1.0;P.armR.rotation.x=-.15;P.elR.rotation.x=-.15;if(m.userData.hold)m.userData.hold.rotation.x=Math.PI/2+.45}
 else{P.armL.rotation.set(-.12,0,0);P.elL.rotation.x=-.12;P.armR.rotation.x=-.12;P.elR.rotation.x=-.12}}
function toggleFollow(c){c.follow=!c.follow;c.home=c.follow?null:{x:c.m.position.x,z:c.m.position.z};toast(c.s.name+(c.follow?' is following you':' stays here'));S.voice(c.m.position,c.follow?230:190)}
function updComps(dt){const p0=pl.position;for(let i=comps.length-1;i>=0;i--){const c=comps[i],m=c.m,p=m.position;if(c.s.hp<=0||!m.parent){comps.splice(i,1);continue}
 const dx=p0.x-p.x,dz=p0.z-p.z,d=Math.hypot(dx,dz);let mv=0;
 if(c.face>0){c.face-=dt;m.rotation.y=Math.atan2(c.fx,c.fz);if(c.face<=0)armDefault(m)}
 if(c.vs){stepVault(m,c,dt);continue}
 if(c.follow)c.home=null;else if(!c.home)c.home={x:p.x,z:p.z};
 const fight=npcCombat(m,c.s,c.st||(c.st={}),dt,{R:[0,4.5,12,20][c.range],walk:true,c,leash:c.follow?{x:p0.x,z:p0.z,r:14}:{x:c.home.x,z:c.home.z,r:9},home:c.follow?null:c.home});
 if(fight.busy){mv=fight.moved}
 else if(c.follow&&d>3){const sp=(d>10?7:4.4)*dt;let ux=dx/d,uz=dz/d;
  if(c.av>0){c.av-=dt;const t=ux;ux=-uz*c.avs*.8+ux*.4;uz=t*c.avs*.8+uz*.4;const l=Math.hypot(ux,uz)||1;ux/=l;uz/=l}
  const nx=p.x+ux*sp,nz=p.z+uz*sp,bk=blocked(nx,nz,.35,p.y,1.7);
  if(!bk){p.x=nx;p.z=nz;mv=sp;c.stk=0}
  else{const dr=doorOf(bk);
   if(dr)openDoor(dr);
   // windows are off limits: glass is never smashed, and sills next to a window are treated as plain wall
   else if(bk.max.y<=1.35&&!bk.bar&&!bk.win&&d>2&&!winNear(nx,nz,2.4)&&startVault(m,c,ux,uz)){}
   else{if(!blocked(nx,p.z,.35,p.y,1.7)){p.x=nx;mv=sp}else if(!blocked(p.x,nz,.35,p.y,1.7)){p.z=nz;mv=sp}else c.stk=(c.stk||0)+dt;
    if(c.stk>.6){c.stk=0;c.av=1.2;c.avs=Math.random()<.5?1:-1}}}
  if(!(c.face>0))m.rotation.y=Math.atan2(ux,uz)}
 // only followers rush back to the player; anyone told to stay stays put
 if(c.follow&&d>30){for(let k=0;k<8;k++){const tx=p0.x+rnd(-3,3),tz=p0.z+rnd(-3,3);if(!blocked(tx,tz,.4,p0.y-(G.eyeUsed||1.6),1.7)){p.x=tx;p.z=tz;break}}}
 p.y=groundAt(p.x,p.z,p.y);
 c.ph+=mv*3;const sw=Math.min(1,mv/dt/3||0),sn=Math.sin(c.ph);c.P.legL.rotation.x=sn*.7*sw;c.P.legR.rotation.x=-sn*.7*sw;
 }}

/* ===== damage feedback, survivor health bars, command wheel ===== */
let wheel=null;
function tintHit(o,on){o.traverse(c=>{const m=c.material;if(!m||!m.emissive)return;const u=m.userData;if(on){if(u.em0===undefined)u.em0=m.emissive.getHex();m.emissive.setHex(0xcc0000)}else if(u.em0!==undefined){m.emissive.setHex(u.em0);delete u.em0}})}   // v063: original glow kept on the MATERIAL (parts share one material, so the 2nd mesh used to save the red)
function flashObj(o,t){o.userData.flash=t;tintHit(o,1)}
function hpBar(m){const cv=document.createElement('canvas');cv.width=128;cv.height=24;const t=new THREE.CanvasTexture(cv),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));sp.scale.set(1.3,.24,1);sp.position.y=2.25;sp.raycast=()=>{};sp.renderOrder=5;m.add(sp);m.userData.hb={cv,t,v:-1}}
function hpDraw(m){const u=m.userData,h=u.hb;if(!h)return;const v=Math.round(u.s.hp);if(v===h.v)return;h.v=v;const x=h.cv.getContext('2d');x.clearRect(0,0,128,24);x.fillStyle='#220000';x.fillRect(0,0,128,24);x.fillStyle='#d11';x.fillRect(2,2,124*Math.max(0,Math.min(100,v))/100,20);x.strokeStyle='#000';x.lineWidth=2;x.strokeRect(1,1,126,22);x.fillStyle='#fff';x.font='bold 17px monospace';x.textAlign='center';x.fillText(v,64,19);h.t.needsUpdate=true}
function fortComp(o){const s=o.userData.s;return{s,m:o,surv:true,follow:false,range:s.range||2}}
// at the fort survivors are stand-in meshes; Follow turns one into a normal following survivor, Stop leaves them where they stand
function fortFollow(c){const m=c.m,s=c.s,x=m.position.x,z=m.position.z;scene.remove(m);smesh=smesh.filter(q=>q!==m);const nc=spawnComp(s,x,z);nc.follow=true;toast(s.name+' is following you');S.voice(nc.m.position,230)}
function wheelOpen(c){wheel={c,x:0,y:0,sel:-1};let o=$('wh');if(!o){o=document.createElement('div');o.id='wh';o.style.cssText='position:absolute;left:50%;top:50%;width:360px;height:360px;margin:-180px 0 0 -180px;z-index:55;pointer-events:none;font:700 15px "Courier New",monospace;color:#eee';document.body.appendChild(o)}o.style.display='block';wheelUI()}
function wheelUI(){const w=wheel,o=$('wh'),c=w.c,R=['','SHORT','MEDIUM','FAR'];w.sel=Math.hypot(w.x,w.y)<22?-1:Math.abs(w.x)>Math.abs(w.y)?(w.x>0?1:3):(w.y>0?2:0);
 const L=[['Inventory','50%','4%'],[c.follow?'Stop following':'Follow me','82%','46%'],['Range: '+R[c.range],'50%','88%'],['Nevermind','18%','46%']];
 o.innerHTML=`<div style="position:absolute;inset:60px;border-radius:50%;background:rgba(0,0,0,.65);border:2px solid #7f1d1d;text-align:center;line-height:240px;color:#facc15">${c.s.name}</div>`+L.map((l,i)=>`<div style="position:absolute;left:${l[1]};top:${l[2]};transform:translate(-50%,0);padding:8px 12px;border-radius:8px;border:2px solid ${w.sel===i?'#facc15':'#555'};background:${w.sel===i?'#7f1d1d':'rgba(0,0,0,.8)'};white-space:nowrap">${l[0]}</div>`).join('')+`<div style="position:absolute;left:${175+w.x*.8}px;top:${175+w.y*.8}px;width:10px;height:10px;border-radius:50%;background:#facc15"></div>`}
function wheelDone(){const w=wheel;wheel=null;$('wh').style.display='none';const c=w.c;if(w.sel===0)openContainer(svInv(c.s));else if(w.sel===1){if(c.surv)fortFollow(c);else toggleFollow(c)}else if(w.sel===2){c.range=c.range%3+1;c.s.range=c.range;toast('Shooting range: '+['','SHORT','MEDIUM','FAR'][c.range])}}
function bringHome(){comps.forEach(c=>{if(c.s.pending){if(c.follow&&G.surv.length<16){delete c.s.pending;G.surv.push(c.s);fzJoined(c.s);toast(c.s.name+' joined the fort')}else toast(c.s.name+' was left behind')}});G.surv=G.surv.filter(q=>q.hp>0)}
function travel(msg,cb){G.hqPause=false;G.mode='TRAVEL';document.exitPointerLock();$('hud').classList.add('hide');ui(null);let o=$('trv');if(!o){o=document.createElement('div');o.id='trv';o.style.cssText='position:absolute;inset:0;z-index:70;background:#000;color:#facc15;display:flex;align-items:center;justify-content:center;font:700 34px Impact,sans-serif;letter-spacing:3px;opacity:0;transition:opacity .8s;pointer-events:none';document.body.appendChild(o)}
 o.textContent=msg;o.style.display='flex';setTimeout(()=>o.style.opacity=1,20);engineSnd(4);setTimeout(()=>{cb();o.style.opacity=0;setTimeout(()=>o.style.display='none',900)},4200)}
function engineSnd(d){if(!AC||!SFX)return;const t=AC.currentTime,o=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),lf=AC.createOscillator(),lg=AC.createGain();o.type='sawtooth';o2.type='square';
 const fr=[[.8,38],[1.6,72],[1.9,52],[2.7,88],[3,62],[d-.4,72],[d,40]];o.frequency.setValueAtTime(38,t);o2.frequency.setValueAtTime(19,t);fr.forEach(([a,b])=>{o.frequency.linearRampToValueAtTime(b,t+a);o2.frequency.linearRampToValueAtTime(b/2,t+a)});
 f.type='lowpass';f.frequency.value=420;lf.frequency.value=14;lg.gain.value=.05;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.5);g.gain.setValueAtTime(.3,t+d-.6);g.gain.linearRampToValueAtTime(0,t+d);
 lf.connect(lg);lg.connect(g.gain);o.connect(f);o2.connect(f);f.connect(g);g.connect(SFX);[o,o2,lf].forEach(x=>{x.start(t);x.stop(t+d+.1)});N(SFX,'lowpass',500,200,1,d,.1);T(SFX,'triangle',140,50,.3,.5,0);T(SFX,'triangle',140,50,.3,.5,d-.1)}
function placeCarry(){const f=[-Math.sin(yaw),-Math.cos(yaw)],x=Math.max(FORT.x-14,Math.min(FORT.x+14,pl.position.x+f[0]*2.2)),z=Math.max(FORT.z-14,Math.min(FORT.z+14,pl.position.z+f[1]*2.2)),s=carry.userData.s;carry.position.set(x,0,z);carry.traverse(c=>{delete c.raycast});s.px=x;s.pz=z;toast(s.name+' placed');carry=null}
// v056: truck reach measured from the truck body (collider -1.6..1.6 x, -4.6..5.5 z), not its centre: the old 5 m radius
// could not be reached from the front bumper (where you spawn) or the tailgate, so the truck seemed dead.
function nearTruck(r){if(r==null)r=2.6;const x=pl.position.x-TRUCK.x,z=pl.position.z-TRUCK.z,dx=Math.max(0,Math.abs(x)-1.6),dz=Math.max(0,z-5.5,-4.6-z);return Math.hypot(dx,dz)<r&&pl.position.y<7}
function use(){if(carry){placeCarry();return}if(G.mode==='EXPEDITION'&&nearTruck()){bringHome();advanceTime(G.tripH||skScoutHours());return travel('Driving back to the fort...',()=>go('FORT_BUILD'))}
 const h=look(false);if(!h||!h.o||h.d>3.5)return;const o=h.o,u=o.userData;
 if(u.kind==='loot'){skOpenCont(u.cont)}
 else if(u.kind==='door'&&u.d.locked&&!u.d.open){skLockpick({door:u.d})}else if(u.kind==='door'){const d=u.d;if(d.open)doorClose(d);else doorOpen(d,pl.position.x,pl.position.z)}else if((u.kind==='surv'||u.kind==='comp')&&G.mode==='FORT_BUILD'){if(u.c)u.c.follow=false;carry=o;o.traverse(c=>{c.raycast=()=>{}});toast('Carrying '+u.s.name+' - press E to put them down')}else if(u.kind==='npc'){if(!skRecruitCheck(o))return;scene.remove(o);npcList=npcList.filter(q=>q!==o);S.voice(o.position,210);const sv=fzSurvivor()||{id:Date.now()+ri(0,999),name:NAMES[ri(0,9)]+' #'+(++G.rescued),role:'Generalist',hp:100,morale:60,hunger:0,skill:ri(1,4),pending:1};spawnComp(sv,o.position.x,o.position.z);toast(sv.name+' will follow you. Get them to the truck to bring them home.')}
 else if(u.kind==='bar'&&G.mode==='FORT_BUILD'){if(G.mat<5)return toast('Need 5 materials');G.mat-=5;u.bar.hp=Math.min(100,u.bar.hp+skRepair(G));trainSk(G,'workman');tint(u.bar)}}
function place(type){if(G.mode!=='FORT_BUILD')return;const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),p=pl.position,x=Math.round((p.x+f.x*3.5)/2)*2,z=Math.round((p.z+f.z*3.5)/2)*2,c=type==='bar'?15:20;
 if(Math.abs(x-FORT.x)>13||z>FORT.z+13||z<FORT.z-12)return toast('Build inside the fort yard');if(G.mat<c)return toast('Not enough materials');
 if(G.bars.concat(G.spikes).some(o=>Math.abs(o.x-x)<(type==='bar'?4:1.5)&&Math.abs(o.z-z)<1.5))return toast('Too close to another structure');
 trainSk(G,'workman');G.mat-=c;if(type==='bar'){const b={x,z,hp:100};G.bars.push(b);mkBar(b)}else{const s={x,z,hp:80,t:0};G.spikes.push(s);mkSpike(s)}}

let CELL=38;
let invOpen=false,invDragging=null,currentContainer=null,hqScroll=0;
const HQCONT={hq:true,inv:HQINV,pieces:[]};
// every survivor owns ONE inventory object that lives on the survivor record, so it survives Fort HQ / mission trips
function svInv(sv){if(!sv.invc)sv.invc={inv:newInv(16,16),pieces:[],comp:true,sv};return sv.invc}
function toggleInv(){invOpen?closeInv():openInv()}
function showInvScr(){if(!$('invScr')){const s=document.createElement('div');s.id='invScr';document.body.appendChild(s)}invOpen=true;document.exitPointerLock();$('hud').classList.add('hide');$('invScr').style.display='flex'}
function openInv(){currentContainer=null;showInvScr();renderInv()}
function closeInv(){pCheckEq();syncAllNpc();invOpen=false;invDragging=null;currentContainer=null;tipEl.style.display='none';
 if($('invScr'))$('invScr').style.display='none';
 if(inHQ())hqUI();else if(playing()){$('hud').classList.remove('hide');ui(null);G.escTry=performance.now();lock();setTimeout(()=>{if(playing()&&!locked&&!invOpen&&!inHQ()&&!['pz','hq','opt','dev','end','title','menu','sel'].some(scrVis))showPause()},700)}}
let contShift={x:0,y:0},dropBoxes=[];
function calcCell(two){const byW=Math.floor((innerWidth-(two?470:250))/(two?32:16)),byH=Math.floor((innerHeight-300)/16);return Math.max(16,Math.min(38,byW,byH))}
function resSide(inv,title){const t=resTotals(inv);return `<div class="resSide"><div class="rsT">${title}</div>${RES_KEYS.map(k=>`<div class="rsR"><span style="color:${RES_COL[k]}">${RES_LABEL[k]}</span><b>${t[k]}</b></div>`).join('')}</div>`}
function gridHtml(id,inv,scroll){const w=inv.w*CELL,g=`<div class="grid" id="${id}" style="--cs:${CELL}px;width:${w}px;height:${inv.h*CELL}px"></div>`;
 return scroll?`<div class="scWrap"><div class="scBtns"><button id="scUp" title="Scroll up">&#9650;</button><button id="scDn" title="Scroll down">&#9660;</button></div><div class="scrollView" id="contView" style="width:${w+2}px;height:${16*CELL+2}px">${g}</div></div>`:g}
function renderInv(){
  const s=$('invScr');if(!s)return;const ov=$('contView');if(ov)hqScroll=ov.scrollTop;
  const c=currentContainer;CELL=calcCell(!!c);let containerHtml='';
  if(c){refreshContainerVisual(c);
    const title=c.hq?'Fort HQ storage':c.drop?'Drop box':c.corpse?'Body':c.comp?'Survivor inventory':'Container',sub=c.corpse?` &middot; ${c.name}`:c.comp?` &middot; ${c.sv.name}`:'';
    const btns=c.hq?`<button id="hqDepAll" style="background:#3a5a2a">Deposit ALL</button><button id="closeInvBtn">Close (E)</button>`:`<button id="takeAll">Take All</button><button id="takeAllQ">Take All Quick (R)</button><button id="closeInvBtn">Close (E)</button>`;
    containerHtml=`<div class="invBox" id="contBox" style="flex:0 0 auto;display:flex;gap:10px;align-items:flex-start;transform:translate(${contShift.x}px,${contShift.y}px)"><div style="width:${c.inv.w*CELL+2+(c.hq?44:0)}px"><div class="invTitle">${title}${sub} <span class="m" style="font-size:12px">${c.inv.w}&times;${c.inv.h}${c.hq?' (grows)':''}</span></div>
    <div class="row" style="margin-bottom:8px;gap:6px">${btns}</div>${gridHtml('contGrid',c.inv,!!c.hq)}
    <div class="help">Drag items between the grids or onto DROP &middot; R rotates while dragging &middot; Shift+click or right-click sends an item across &middot; hover ammo/meds + E to use${c.hq?' &middot; mouse wheel or the arrows scroll the HQ storage':''}</div></div>${resSide(c.inv,c.hq?'FORT HQ':c.comp?'THEIRS':'HERE')}</div>`}
  s.innerHTML=`<div id="invRow" style="display:flex;gap:14px;align-items:flex-start;flex:0 0 auto;margin:auto"><div class="invBox" id="invBox" style="flex:0 0 auto;display:flex;gap:10px;align-items:flex-start">${resSide(PINV,'CARRIED')}<div style="width:${PINV.w*CELL+2}px"><div class="invTitle">Inventory <span class="m" style="font-size:12px">${PINV.items.length} items &middot; 16&times;16</span></div>
    ${gridHtml('invGrid',PINV,false)}
    ${inHQ()?'':'<div id="dropBtn" class="dropZone">DROP</div>'}
    <div class="help">Click+drag to move &middot; R rotates while dragging &middot; drag onto DROP to leave an item on the floor &middot; hover meds/ammo + E to use</div>
    <div style="margin-top:8px"><button id="closeInvBtn2">Close (E)</button></div></div></div>${containerHtml}</div>`;
  buildGrid('inv');if(c)buildGrid('cont');
  if(c){const tk=$('takeAll');if(tk){tk.onclick=()=>{takeAllItems();renderInv()};$('takeAllQ').onclick=takeAllQuick}
    $('closeInvBtn').onclick=closeInv;const dp=$('hqDepAll');if(dp)dp.onclick=()=>{depositToHQ(true);renderInv()};
    const v=$('contView');if(v){v.scrollTop=hqScroll;v.onwheel=e=>{e.preventDefault();e.stopPropagation();v.scrollTop+=Math.sign(e.deltaY)*CELL*3};$('scUp').onclick=()=>{v.scrollTop-=CELL*4};$('scDn').onclick=()=>{v.scrollTop+=CELL*4}}}
  $('closeInvBtn2').onclick=closeInv;
  document.onmousemove=e=>{if(!invDragging)return;invDragging.mx=e.clientX;invDragging.my=e.clientY;drawGhost()};
  document.onmouseup=e=>{if(invDragging)dropDrag(e)};
}
// the cursor reappears where it was when the mouse was captured, so slide the container panel so Take All sits under that spot
function anchorCont(){const b=$('takeAll'),p=$('contBox'),iv=$('invBox');if(!b||!p||!iv)return;p.style.transform='none';
 const br=b.getBoundingClientRect(),pr=p.getBoundingClientRect(),ir=iv.getBoundingClientRect();
 let dx=lastMouse.x-(br.left+br.width/2),dy=0;
 const minL=ir.right+8,maxL=Math.max(minL,innerWidth-pr.width-4);let nl=Math.max(minL,Math.min(maxL,pr.left+dx));dx=nl-pr.left;
 contShift={x:Math.round(dx),y:Math.round(dy)};p.style.transform=`translate(${contShift.x}px,${contShift.y}px)`}
function tipHtml(inst,eqd){const it=ITEMS[inst.id],k=resOf(inst.id);let h=`<b class="y">${it.name}</b><br><span class="m">${CATS[it.cat]} &middot; ${it.vh[0]}&times;${it.vh[1]}</span>`;
 if(k)h+=`<br><span class="g">${inst.rem} / ${it.value[k]} ${RES_LABEL[k]} left</span>`;
 {const wd=WDEF[inst.id];if(wd){if(wd.type==='gun')h+=`<br><span class="g">Loaded ${inst.clip||0} / ${wd.cap} &middot; uses ${ITEMS[wd.ammo].name}</span><br><span class="m">${wd.mode} &middot; dmg ${fzTxt(wd)}${wd.pel>1?' x'+wd.pel+' pellets':''}</span><br><span class="o">Hover + E: unload</span>`;else h+=`<br><span class="m">Melee &middot; dmg ${fzTxt(wd)} &middot; reach ${wd.reach} m</span>`;if(eqd)h+='<br><span class="y">EQUIPPED</span>'}}
 if(it.cat==='ammo')h+='<br><span class="o">Hover + E: load into the equipped gun</span>';else if(it.use)h+=`<br><span class="o">Hover + E: heal up to +${it.use.hp} HP (uses ${it.use.cost} meds)</span>`;return h}
function gridCtx(kind){if(kind==='cont'){const c=currentContainer;return{el:$('contGrid'),inv:c.inv,view:$('contView')}}return{el:$('invGrid'),inv:PINV,view:null}}
function buildGrid(kind){
  pCheckEq();if(kind==='cont'&&currentContainer&&currentContainer.comp&&currentContainer.sv)npcSyncEquip(currentContainer.sv);
  const cx=gridCtx(kind),grid=cx.el,inv=cx.inv;grid.innerHTML='';
  inv.items.forEach(inst=>{
    const [tw,th]=fp(inst),it=ITEMS[inst.id],k=resOf(inst.id);
    const el=document.createElement('div');el.className='item';el.dataset.uid=inst.uid;el.dataset.kind=kind;
    el.style.left=(inst.x*CELL)+'px';el.style.top=(inst.y*CELL)+'px';el.style.width=(tw*CELL)+'px';el.style.height=(th*CELL)+'px';
    el.appendChild(iconCanvas(inst.id,tw*CELL-2,th*CELL-2,inst.rot));
    if(k){const q=document.createElement('span');q.className='qty';q.textContent=inst.rem;el.appendChild(q)}
    const wd=WDEF[inst.id],eqd=wd&&((kind!=='cont'&&inst===G.eq)||(kind==='cont'&&currentContainer&&currentContainer.comp&&currentContainer.sv&&currentContainer.sv.eq===inst));
    if(wd&&wd.type==='gun'){const q=document.createElement('span');q.className='qty';q.textContent=(inst.clip||0)+'/'+wd.cap;el.appendChild(q)}
    if(eqd)el.style.boxShadow='inset 0 0 0 2px #facc15';
    el.dataset.tip=tipHtml(inst,eqd);
    el.addEventListener('mousedown',e=>{
      if(e.button!==0)return;e.preventDefault();
      if(e.shiftKey){quickMove(kind,inst);return}
      const rect=grid.getBoundingClientRect();
      const cellX=Math.floor((e.clientX-rect.left)/CELL),cellY=Math.floor((e.clientY-rect.top)/CELL);
      invDragging={kind,uid:inst.uid,grabCellX:cellX-inst.x,grabCellY:cellY-inst.y,previewRot:inst.rot,mx:e.clientX,my:e.clientY};
      if(currentContainer&&currentContainer.hq){const g=$('contGrid');if(g)g.style.height=((currentContainer.inv.h+9)*CELL)+'px'} // spare rows while dragging so items can go below the last row
      el.style.opacity='0.5';tipEl.style.display='none';
    });
    el.addEventListener('contextmenu',e=>{e.preventDefault();quickMove(kind,inst)});
    grid.appendChild(el);
  });
}
function quickMove(kind,inst){if(!currentContainer)return;const src=kind==='cont'?currentContainer.inv:PINV,dst=kind==='cont'?PINV:currentContainer.inv;
 if(invTransfer(src,dst,inst)){S.click();renderInv()}else toast((kind==='cont'?'Your inventory':'The destination')+' has no room for '+ITEMS[inst.id].name)}
function gridUnder(x,y){for(const k of ['inv','cont']){if(k==='cont'&&!currentContainer)continue;const cx=gridCtx(k);if(!cx.el)continue;const r=(cx.view||cx.el).getBoundingClientRect();if(x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom)return k}return null}
function overDrop(x,y){const d=$('dropBtn');if(!d)return false;const r=d.getBoundingClientRect();return x>=r.left&&x<r.right&&y>=r.top&&y<r.bottom}
function drawGhost(){
  document.querySelectorAll('.ghost').forEach(e=>e.remove());
  const dz=$('dropBtn');if(dz)dz.classList.toggle('hi',!!invDragging&&overDrop(invDragging.mx,invDragging.my));
  if(!invDragging)return;const k=gridUnder(invDragging.mx,invDragging.my);if(!k)return;
  const src=gridCtx(invDragging.kind),inst=src.inv.items.find(i=>i.uid===invDragging.uid);if(!inst)return;
  const dst=gridCtx(k),[tw,th]=fp(inst,invDragging.previewRot);
  const rect=dst.el.getBoundingClientRect();
  const placeX=Math.floor((invDragging.mx-rect.left)/CELL)-invDragging.grabCellX,placeY=Math.floor((invDragging.my-rect.top)/CELL)-invDragging.grabCellY;
  const valid=invFits(dst.inv,inst,placeX,placeY,invDragging.previewRot);
  const ghost=document.createElement('div');ghost.className='ghost';
  ghost.style.left=(placeX*CELL)+'px';ghost.style.top=(placeY*CELL)+'px';
  ghost.style.width=(tw*CELL)+'px';ghost.style.height=(th*CELL)+'px';
  ghost.style.borderColor=valid?'#facc15':'#ef4444';
  ghost.style.background=valid?'rgba(250,204,21,.15)':'rgba(239,68,68,.15)';
  ghost.appendChild(iconCanvas(inst.id,tw*CELL-4,th*CELL-4,invDragging.previewRot));
  dst.el.appendChild(ghost);
}
/* ===== DROP: leave an item on the floor in a green drop box (a full box never swallows items: a new box is made) ===== */
function makeDropBox(x,z){const g=new THREE.Group(),y0=groundAt(x,z,pl.position.y-(G.eyeUsed||1.6)+.35);g.position.set(x,y0,z);g.rotation.y=rnd(0,PI);scene.add(g);const pieces=[],add=(w,h,d,px,py,pz,c)=>{pieces.push(mesh(BX(w,h,d),c,px,py,pz,g))};
 add(.8,.5,.8,0,.25,0,0x2e7d32);add(.86,.08,.86,0,.54,0,0x1b5e20);add(.22,.3,.02,0,.3,.41,0xa5d6a7);
 const cont={x,z,inv:newInv(16,16),pieces,group:g,drop:true};g.userData={kind:'loot',cont};pieces.forEach(p=>p.userData={kind:'loot',cont});dropBoxes.push(cont);try{if(window.RGW&&RGW.texContainer){g.userData.rgcont=1;RGW.texContainer(cont)}}catch(e){}return cont}
function dropItem(inst,srcInv){
 const ox=inst.x,oy=inst.y,or=inst.rot;invRemove(srcInv,inst);
 const f=[-Math.sin(yaw),-Math.cos(yaw)],sp=freeSpot(pl.position.x+f[0]*1.2,pl.position.z+f[1]*1.2);let box=null;
 for(const b of dropBoxes)if(Math.hypot(b.x-sp[0],b.z-sp[1])<2.2&&invAdd(b.inv,inst)){box=b;break}
 if(!box){const p2=freeSpot(sp[0]+rnd(-.9,.9),sp[1]+rnd(-.9,.9));box=makeDropBox(p2[0],p2[1]);if(!invAdd(box.inv,inst)){invPut(srcInv,inst,ox,oy,or);toast('Could not drop that');return}}
 S.click();toast('Dropped '+ITEMS[inst.id].name)}
function dropDrag(e){const d=invDragging;invDragging=null;document.querySelectorAll('.ghost').forEach(x=>x.remove());const dz=$('dropBtn');if(dz)dz.classList.remove('hi');
  const src=gridCtx(d.kind),inst=src.inv.items.find(q=>q.uid===d.uid);if(!inst){renderInv();return}
  if(overDrop(e.clientX,e.clientY)){dropItem(inst,src.inv);renderInv();return}
  const k=gridUnder(e.clientX,e.clientY);
  if(k){const dst=gridCtx(k),r=dst.el.getBoundingClientRect(),tx=Math.floor((e.clientX-r.left)/CELL)-d.grabCellX,ty=Math.floor((e.clientY-r.top)/CELL)-d.grabCellY;
   if(invMove(src.inv,dst.inv,inst,tx,ty,d.previewRot)){if(k!==d.kind)S.click()}else if(k!==d.kind)toast('Cannot place '+ITEMS[inst.id].name+' there')}
  renderInv()}
function takeAllItems(){const c=currentContainer;let left=0;c.inv.items.slice().forEach(inst=>{if(!invTransfer(c.inv,PINV,inst))left++});refreshContainerVisual(c);if(left)toast('Inventory full - '+left+' item(s) left behind');else beep('sine',520,660,.1,.15);return left}
function takeAllQuick(){if(!currentContainer||currentContainer.hq)return;const left=takeAllItems();if(!left)closeInv();else renderInv()}
function addItem(id){const q=newInst(id);return q&&invAdd(PINV,q)?q:null}
function removeItemByUid(uid){const inst=PINV.items.find(i=>i.uid===uid);return inst?invRemove(PINV,inst):null}
function openContainer(cont){currentContainer=cont;contShift={x:0,y:0};showInvScr();renderInv();if(!cont.hq)anchorCont()}
// Deposit: the real item objects move into the Fort HQ inventory (nothing is copied, nothing can be lost; HQ grows as needed)
function depositToHQ(quiet){let n=0;const before=resTotals(HQINV);PINV.items.slice().forEach(inst=>{if(invTransfer(PINV,HQINV,inst))n++});
 if(n&&!quiet){const a=resTotals(HQINV),s=RES_KEYS.map(k=>[k,a[k]-before[k]]).filter(x=>x[1]>0).map(x=>`+${x[1]} ${x[0]}`).join(', ');toast('Deposited '+n+' item(s)'+(s?': '+s:''))}return n}
function svInvFromHQ(id){const s=G.surv.find(q=>q.id===id);if(s)openContainer(svInv(s))}
function openHQInv(){openContainer(HQCONT)}

function toggleTorch(){G.torchOn=!G.torchOn;torchL.intensity=G.torchOn?1.2:0;if(G.torchOn)beep('square',400,600,.05,.1);else beep('square',600,300,.05,.1)}

/* v071 starting kits: the Police Station armoury gives a crowbar, a 9mm pistol + 2 boxes, a combat shotgun + 2 boxes of 12 gauge.
   The Prison and the School give one random melee weapon and one random pistol with 2 boxes of that pistol's ammo. */
function startKit(k){const add=id=>{const q=ITEMS[id]?newInst(id):null;if(q)invAdd(PINV,q);return q};const pick=a=>a[Math.floor(Math.random()*a.length)];let pg;
 if(k==='police'){add('crowbar');pg=add('beretta_9mm');add('ammo_9mm');add('ammo_9mm');add('combat_shotgun');add('ammo_12_gauge');add('ammo_12_gauge')}
 else{const mel=ITEM_ORDER.filter(id=>ITEMS[id].cat==='melee'&&WDEF[id]),pis=ITEM_ORDER.filter(id=>ITEMS[id].cat==='pistol'&&WDEF[id]&&WDEF[id].ammo&&ITEMS[WDEF[id].ammo]);
  add(pick(mel));const pid=pick(pis);pg=add(pid);add(WDEF[pid].ammo);add(WDEF[pid].ammo)}
 G.eq=pg||PINV.items[0]||null}
function initCampaign(k){G.fort=k;HQINV.items.length=0;HQINV.h=16;HQINV.g=makeGrid(16,16);resGrant(HQINV,'food',80);resGrant(HQINV,'mat',35);resGrant(HQINV,'meds',10);const f=FORTS[k];G.maxHp=Math.round(100*f.hp);G.hp=G.maxHp;G.rl=0;G.draw=0;PINV.items.length=0;PINV.g=makeGrid(PINV.w,PINV.h);startKit(k);$('fn').textContent='HQ: '+f.n.toUpperCase();G.day=1;G.time=8}
function pick(k){initCampaign(k);go('CLEAR')}
function freeSpot(x,z){for(let r=0;r<=8;r+=.5)for(let a=0;a<8;a++){const tx=x+Math.cos(a*.785)*r,tz=z+Math.sin(a*.785)*r;if(!blocked(tx,tz,.55,0,1.8))return[tx,tz]}return[x,z]}
function go(m){if(G.siegeDue&&m!=='CLEAR')return startSiege();G.hqPause=false;G.mode=m;ui(null);$('hud').classList.remove('hide');$('tip').classList.toggle('hide',m!=='FORT_BUILD');buildWorld();if(m==='EXPEDITION')toast(window.mzArriveToast?mzArriveToast():'Survivors are hiding in buildings - watch for blue dots on the radar!');
 const sp=m==='EXPEDITION'?[TRUCK.x,TRUCK.z+6]:m==='CLEAR'?[FORT.x,FORT.z+22]:[FORT.x,FORT.z+5];{const fp=freeSpot(sp[0],sp[1]);sp[0]=fp[0];sp[1]=fp[1]}pl.position.set(sp[0],1.6,sp[1]);G.vy=0;G.crouch=false;G.eyeH=G.eyeUsed=1.6;yaw=pitch=0;pl.rotation.y=0;camera.rotation.x=0;ui('pz');lock();if(m==='EXPEDITION')G.surv.filter(q=>q.role==='Scavenger'&&q.hp>0).forEach(q=>spawnComp(q,sp[0]+rnd(-2.5,2.5),sp[1]+rnd(1,3)))}
function startSiege(){G.siegeDue=false;G.hqPause=false;G.day=14;G.time=21;G.mode='SIEGE';G.siegeToSpawn=(20+G.surv.length*2)*4;G.spawnT=3;ui(null);$('hud').classList.remove('hide');$('tip').classList.add('hide');buildWorld();{const fp=freeSpot(FORT.x,FORT.z+5);pl.position.set(fp[0],1.6,fp[1])}G.crouch=false;G.eyeH=G.eyeUsed=1.6;yaw=pitch=0;pl.rotation.y=0;ui('pz');lock();toast('THE HORDE IS HERE. Hold the fort!')}
function openHQ(pause){G.hqPause=!!pause;if(!pause)G.mode='HQ_MENU';G.pauseAt=performance.now();document.exitPointerLock();$('hud').classList.add('hide');ui('hq');$('resumeBtn').style.display=pause?'':'none';hqUI()}
// at the fort the pause menu IS the Fort HQ menu (with the normal pause panel beside it); on a mission it's the plain pause screen
function showPause(){G.pauseAt=performance.now();if(G.mode==='FORT_BUILD')openHQ(true);else ui('pz')}
function resumeFort(){G.mode='FORT_BUILD';G.hqPause=false;G.escTry=performance.now();ui(null);$('hud').classList.remove('hide');lock()}
function hqDeposit(){if(!PINV.items.length){toast('Your inventory is empty');return}depositToHQ(false);hqUI()}
/* ===== I'M STUCK: move to the nearest safe standing spot on the same floor (30 s cooldown) ===== */
function stuckLeft(){return Math.max(0,Math.ceil(((G.stuckUntil||0)-Date.now())/1000))}
function imStuck(){const w=stuckLeft();if(w>0){toast("I'm Stuck is recharging ("+w+"s)");return}
 const p=pl.position,eye=G.eyeUsed||1.6,feet=p.y-eye;let best=null;
 const ok=(x,z)=>{if(x<BND[0]+.8||x>BND[1]-.8||z<BND[2]+.8||z>BND[3]-.8)return false;const gy=groundAt(x,z,feet+.35);return Math.abs(gy-feet)<.6&&!blocked(x,z,.5,gy+.02,1.8)&&!zb(x,z)};
 search:for(let r=.5;r<=14;r+=.5){const n=Math.max(8,Math.round(r*10));for(let k=0;k<n;k++){const a=k/n*TAU,x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;if(ok(x,z)){best=[x,z];break search}}}
 if(!best){const sp=G.mode==='EXPEDITION'?[TRUCK.x,TRUCK.z+6]:[FORT.x,FORT.z+5],f=freeSpot(sp[0],sp[1]);best=f}
 const gy=groundAt(best[0],best[1],feet+.5);G.crouch=false;G.eyeH=G.eyeUsed=1.6;G.vy=0;pl.position.set(best[0],1.6+gy,best[1]);G.feetY=gy;G.stuckUntil=Date.now()+30000;toast('Moved you to a safe spot nearby');
 document.querySelectorAll('.stuckBtn').forEach(b=>b.blur())}
// crouch (C): lower view, smaller collision, zombies see you at half range, slower; entering/leaving costs stamina
const CROUCH_COST=8;
function canStand(){const p=pl.position,feet=p.y-(G.eyeUsed||1.6);return !blocked(p.x,p.z,.4,feet+.35,1.45)}
function toggleCrouch(){if(G.crouch){if(!canStand())return toast('No room to stand up');G.crouch=false;G.st=Math.max(0,G.st-CROUCH_COST)}
 else{if(G.st<CROUCH_COST)return toast('Too tired to crouch');G.crouch=true;G.st-=CROUCH_COST}}
function trip(){const h=skScoutHours();G.tripH=h;skScoutTrained();advanceTime(h);travel('Driving out to town ('+fmtH(h)+')...',()=>go('EXPEDITION'))}
function endDay(){let n=(32-G.time)%24;if(n<.01)n=24;advanceTime(n);G.siegeDue?startSiege():hqUI()}
function advanceTime(h){G.time+=h;while(G.time>=24){G.time-=24;newDay()}}
function newDay(){G.day++;const n=(G.surv.length+1)*4;if(G.food>=n){G.food-=n;G.surv.forEach(s=>{s.hunger=0;s.morale=Math.min(100,s.morale+4)})}else{G.food=0;toast('Starvation! Morale is collapsing.');G.surv.forEach(s=>{s.hunger++;s.morale-=15;s.hp-=10});G.hp=Math.max(1,G.hp-10)}
 G.surv.forEach(s=>{const k=s.role==='Generalist'?.5:1;if(s.role==='Scavenger'||s.role==='Generalist'){G.mat+=Math.round(s.skill*3*k);G.food+=Math.round(2*k)}
  if(s.role==='Builder'||s.role==='Generalist')G.bars.forEach(b=>{{b.hp=Math.min(100,b.hp+(10+skTot(s,'workman')*.5)*k);if(b.mesh)tint(b);trainSk(s,'workman')}});
  if(s.role==='Medic')skMedic(s)});
 G.surv=G.surv.filter(s=>{if(s.hp<=0)return false;if(s.morale<20){toast(s.name+' left the fort.');return false}return true});
 skDayEnd();if(G.day>=14)G.siegeDue=true;toast('Day '+G.day+' begins')}
function heal(){if(G.meds>0&&G.hp<G.maxHp){G.meds--;G.hp=Math.min(G.maxHp,G.hp+30);hqUI()}}
function setRole(id,v){const q=G.surv.find(x=>x.id===id);if(!q)return;q.role=v;toast(q.name+' is now a '+v);hqUI()}
function hqLive(){$('hqs').textContent=`DAY ${G.day} · ${Math.max(0,14-G.day)} DAYS TO THE SIEGE · YOUR HP ${Math.round(G.hp)}/${G.maxHp} · ROUNDS LOADED IN YOUR GUNS ${pWeapons().reduce((a,q)=>a+(q.clip||0),0)}`;$('hqc').textContent=clockStr();const ig=G.bars.length?Math.round(G.bars.reduce((a,b)=>a+b.hp,0)/G.bars.length):0;$('ri').textContent=G.bars.length+'B/'+G.spikes.length+'S '+ig+'%'}
function hqUI(){hqLive();$('hqPT').textContent=G.hqPause?'The game keeps running while the Fort HQ menu is open. Press Esc or Resume to continue.':'Time only passes when you act here.';
 {const t=resTotals(HQINV);$('rf').textContent=t.food;$('rm').textContent=t.mat;$('rd').textContent=t.meds;$('ra').textContent=t.ammo}const ig=G.bars.length?Math.round(G.bars.reduce((a,b)=>a+b.hp,0)/G.bars.length):0;$('ri').textContent=G.bars.length+'B/'+G.spikes.length+'S '+ig+'%';
 $('sc').textContent=`${G.surv.length}/16`;$('sl').innerHTML=G.surv.map(s=>`<div class="sv"><div><b>${s.name}</b>${fzTag(s)} <span class="y">${'★'.repeat(s.skill)}</span><br><span class="m">HP ${Math.round(s.hp)} · Morale ${Math.round(s.morale)} · Hunger ${s.hunger}</span><br><span class="g" style="font-size:11px">${ROLEFX[s.role]}</span></div><div style="display:flex;flex-direction:column;gap:4px"><button onclick="svInvFromHQ(${s.id})">Inventory</button><button onclick="openSkills(${s.id})">Skills</button><select onchange="setRole(${s.id},this.value)">${Object.keys(RC).map(r=>`<option ${r===s.role?'selected':''}>${r}</option>`).join('')}</select></div></div>`).join('');
 $('ds').textContent='Guards fire from the fort and use shared ammo. Builders repair barricades daily. Medics spend meds to heal everyone. Scavengers bring supplies.'}
function finish(win,why){G.hqPause=false;G.mode='END';document.exitPointerLock();$('hud').classList.add('hide');ui('end');const a=G.surv.filter(s=>s.hp>0).length;
 $('et').textContent=win?'FORT SURVIVED':'FORT FALLEN';$('es').textContent=why;$('est').textContent=`Day ${G.day}/14 · Kills ${G.kills} · Survivors alive ${a}`}

function clockStr(){const t=Math.floor(G.time*3600+1e-6),p=n=>String(n).padStart(2,'0');return `${p(Math.floor(t/3600)%24)}:${p(Math.floor(t/60)%60)}:${p(t%60)}`}
function lighting(){const d=THREE.MathUtils.clamp(Math.sin((G.time-6)/24*TAU)*2+.3,0,1),sky=new THREE.Color(0x05070a).lerp(new THREE.Color(0x7092be),d);scene.background=sky;scene.fog.color.copy(sky);
 dirL.intensity=.2+.9*d;ambL.intensity=.18+.5*d;dirL.position.set(Math.cos((G.time-6)/24*TAU)*80,Math.abs(Math.sin((G.time-6)/24*TAU))*80+10,20);
 const night=G.time>=20||G.time<5;
 streetLights.forEach(L=>{L.intensity=night?1.4:0})}
function hud(){if(carry){carry.position.set(pl.position.x-Math.sin(yaw)*1.6,pl.position.y-1.1,pl.position.z-Math.cos(yaw)*1.6);carry.rotation.y=yaw+Math.PI}const z=zombies.length,m=G.mode;$('hpv').textContent=Math.round(G.hp)+'/'+G.maxHp;$('hpb').style.width=G.hp/G.maxHp*100+'%';$('stb').style.width=G.st+'%';{const sb=$('stb'),c=G.stLock?'#7a7a74':'#22c55e';if(sb.style.background!==c&&sb.dataset.c!==c){sb.style.background=c;sb.dataset.c=c}}$('stv').textContent=Math.round(G.st)+'/100';hudWeapon();
 $('day').textContent=m==='CLEAR'?'Day 1: Clear the fort':m==='SIEGE'?'Day 14: The siege':`Day ${G.day}: ${m==='FORT_BUILD'?'Fort':'Expedition'}`;
 $('obj').textContent=m==='CLEAR'?`Kill the zombies inside the fort (${zombies.filter(q=>q.userData.fort).length} left)`:m==='SIEGE'?`Survive! ${z+G.siegeToSpawn} zombies left`:m==='FORT_BUILD'?'Fortify, then Esc for HQ':(window.mzObjective?mzObjective():'Scavenge, then return to the truck (E)');
 $('clk').textContent=clockStr();$('tts').textContent='Siege in '+Math.max(0,14-G.day)+' days';
 const h=((-yaw%TAU)+TAU)%TAU,deg=h*180/Math.PI;$('cs').style.left=(128-180-deg*40/45)+'px';
 const mk=(el,t)=>{let r=Math.atan2(t.x-pl.position.x,-(t.z-pl.position.z))-h;r=Math.atan2(Math.sin(r),Math.cos(r))*180/Math.PI;el.style.left=(124+Math.max(-116,Math.min(116,r*40/45)))+'px'};
 $('cm').style.display=m==='EXPEDITION'?'none':'block';$('cm2').style.display=m==='EXPEDITION'?'block':'none';mk($(m==='EXPEDITION'?'cm2':'cm'),m==='EXPEDITION'?TRUCK:FORT);
 let p='';if(m==='EXPEDITION'&&nearTruck())p='[E] Return to the fort (+'+fmtH(G.tripH||skScoutHours())+')';else if(lookT<=0){lookT=.1;const l=look(false);if(l&&l.o&&l.d<3.5){const u=l.o.userData;p=u.kind==='loot'?skLootPrompt(u.cont):u.kind==='door'?(u.d.open?'[E] Close door':(u.d.locked?'[LOCKED]\nLockpick? (E)':'[E] Open door')):u.kind==='comp'?(m==='FORT_BUILD'?'[E] Pick up '+u.s.name+'  -  hold E: orders':'[E] '+(u.c.follow?'Stop following':'Follow me')+'  -  hold E: orders'):u.kind==='npc'?skNpcPrompt(l.o):u.kind==='surv'&&m==='FORT_BUILD'?'[E] Pick up '+u.s.name+'  -  hold E: orders':u.kind==='bar'&&m==='FORT_BUILD'?`[E] Repair barricade (${Math.round(u.bar.hp)}%) - 5 mat`:''}}else p=$('pr').textContent;
 $('pr').textContent=p;$('pr').style.opacity=p?1:0;
 const c=mmCtx();if(!c)return;c.fillStyle='#0a0a0a';c.fillRect(0,0,128,128);{const fa=Math.atan2(-Math.cos(yaw),-Math.sin(yaw)),hf=Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect),gr=c.createRadialGradient(64,64,0,64,64,60);gr.addColorStop(0,'rgba(250,240,150,.6)');gr.addColorStop(1,'rgba(250,240,150,0)');c.fillStyle=gr;c.beginPath();c.moveTo(64,64);c.arc(64,64,60,fa-hf,fa+hf);c.closePath();c.fill()}const X=x=>64+(x-pl.position.x)*.7,Z=z=>64+(z-pl.position.z)*.7;if(m==='EXPEDITION'){c.fillStyle='#22c55e';c.fillRect(X(TRUCK.x)-3,Z(TRUCK.z)-3,6,6)}else{c.fillStyle='#555';c.fillRect(X(FORT.x-15),Z(FORT.z-15),21,21)}
 c.fillStyle='#ef4444';zombies.forEach(q=>{c.fillRect(X(q.position.x)-1,Z(q.position.z)-1,3,3)});c.fillStyle='#3b82f6';c.strokeStyle='#fff';c.lineWidth=1;smesh.concat(npcList).forEach(q=>{c.beginPath();c.arc(X(q.position.x),Z(q.position.z),3,0,TAU);c.fill();c.stroke()});
 fzDrawRumors(c,X,Z);c.fillStyle='#facc15';G.bars.forEach(b=>{const cc=Math.cos(b.ry||0),ss=Math.sin(b.ry||0);c.beginPath();c.moveTo(X(b.x-cc*2),Z(b.z+ss*2));c.lineTo(X(b.x+cc*2),Z(b.z-ss*2));c.lineWidth=2;c.strokeStyle='#facc15';c.stroke()});c.fillStyle='#fff';c.beginPath();c.arc(64,64,3,0,TAU);c.fill()}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.1);$('clk').textContent=clockStr();$('tts').textContent='Siege in '+Math.max(0,14-G.day)+' days';
 if(playing()){lighting();animVM(dt);updDead(dt);updShards(dt);updBlood(dt);updLimbs(dt);updFloats(dt);updDmgNums(dt);doors.forEach(d=>{{const e=d.t-d.a;if(Math.abs(e)>1e-4){const st=dt*Math.max(1.6,Math.abs(e)*6.5);d.a+=Math.sign(e)*Math.min(Math.abs(e),st)}}d.p.rotation.y=(d.b||0)+d.a+((d.sh=(d.sh||0)-dt)>0?Math.sin(d.sh*70)*.04:0)});   /* v076: eased swing */if(!frozen()&&(locked||invOpen||hqShown())){const ctl=locked&&!invOpen;G.cdS-=dt;G.cdM-=dt;G.noise-=dt;lookT-=dt;
  if(G.mode!=='SIEGE')advanceTime(dt/3600);if(G.siegeDue&&G.mode!=='SIEGE'){startSiege();return}
  const mv=ctl?new THREE.Vector3((K.KeyD?1:0)-(K.KeyA?1:0),0,(K.KeyS?1:0)-(K.KeyW?1:0)):new THREE.Vector3(),mo=mv.lengthSq()>0;let sp=K.ShiftLeft&&mo&&G.st>5&&!G.stLock;if(sp&&G.crouch){if(canStand())G.crouch=false;else sp=false}
  G.eyeH+=((G.crouch?1.0:1.6)-G.eyeH)*Math.min(1,dt*12);if(Math.abs((G.crouch?1.0:1.6)-G.eyeH)<.01)G.eyeH=G.crouch?1.0:1.6;
  G.st=THREE.MathUtils.clamp(G.st+(sp?-35*skStDrain(G):20)*dt,0,100);if(G.st<=.5||(sp&&G.st<=5))G.stLock=true;else if(G.stLock&&G.st>=50)G.stLock=false;   /* v076: run dry and you cannot sprint again until stamina is back to 50 */if(sp)for(const z of zombies)if(z.userData.sleep&&Math.hypot(z.position.x-pl.position.x,z.position.z-pl.position.z)<9)wakeZ(z);
  if(mo){mv.normalize().applyAxisAngle(Y,yaw);const s=(sp?8:G.crouch?3.1:4.2)*skSpeedMul(G)*dt,p=pl.position,cr=G.crouch?.28:.4,ch=G.crouch?.85:(G.vy?1:1.45),fyy=p.y-(G.eyeUsed||1.6)+.35;if(!blocked(p.x+mv.x*s,p.z,cr,fyy,ch)&&!zb(p.x+mv.x*s,p.z))p.x+=mv.x*s;if(!blocked(p.x,p.z+mv.z*s,cr,fyy,ch)&&!zb(p.x,p.z+mv.z*s))p.z+=mv.z*s;p.x=Math.max(BND[0]+.6,Math.min(BND[1]-.6,p.x));p.z=Math.max(BND[2]+.6,Math.min(BND[3]-.6,p.z))}
  updateZombies(dt);updComps(dt);survFight(dt);rlTick(dt);if(G.fbLeft>0&&G.cdS<=0&&G.eq&&WDEF[G.eq.id].fbN)shoot();else if(ctl&&K.m0&&G.eq&&WDEF[G.eq.id].auto)shoot();jump(dt);
  if(G.mode==='SIEGE'){if(G.siegeToSpawn>0){G.spawnT-=dt;if(G.spawnT<=0&&zombies.length<70){G.spawnT=.7;G.siegeToSpawn--;const sd=Math.random()<.25;zombie(FORT.x+(sd?(Math.random()<.5?-1:1)*rnd(30,40):rnd(-25,25)),FORT.z+(sd?rnd(-10,10):rnd(35,55)))}}
   if(G.siegeToSpawn<=0&&!zombies.length)finish(true,G.surv.some(s=>s.hp>0)?'The fort held. Dawn breaks.':'The fort held, but every survivor fell.')}
  if(G.mode==='CLEAR'&&!zombies.some(q=>q.userData.fort)){if(G.clearT===undefined||G.clearT===null){G.clearT=3.2;toast('Fort cleared!')}else if((G.clearT-=dt)<=0){G.clearT=null;G.day=2;G.time=8;openHQ()}}else if(G.mode!=="CLEAR")G.clearT=null;/* v071: let the last body hit the floor before the HQ opens */if(hqShown())hqLive()}
  hud()}
 if(!(window.MFZLOAD&&MFZLOAD.busy))renderer.render(scene,camera)}   /* v075: no 3D render while a loading screen covers it (the build runs faster) */
onload=init;
