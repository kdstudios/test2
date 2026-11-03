/* ==========================================================================================================
   MINI FORT ZOMBIE - SURVIVOR DESIGNS (v066)
   One hand-made look per named Fort Zombie survivor (keys = FZ.cfg.chars ids) + 18 base persona models (age x gender x ethnicity)
   used for anyone without a named design. Built on the Modern bodies by js/modern/survivors.js. docs/SURVIVOR_PERSONAS.md is the readable
   version of this file (regenerate: node tools/survivor/personas_md.js).
   Fields:  e ethnicity (W White, B Black, A Asian, M mixed heritage; base tone in sk)   sk skin tone key (TONE)   b build
            hs hair style   hc hair colour (HAIR)   fh facial hair   ey eye colour   top / tc / tc2 top garment + colours   bot / pc bottoms + colour
            sh shoe colour   acc accessories   note one-line design note
   ========================================================================================================== */
window.RSURV=(function(){
const TONE={W1:0xf6dccb,W2:0xefcdb4,W3:0xe4b996,W4:0xe9c2a8,W5:0xd9a487,
 B1:0xa8724d,B2:0x8f5b3a,B3:0x774628,B4:0x603620,B5:0x4e2a18,
 A1:0xf2d4b0,A2:0xe8c49c,A3:0xdcb084,A4:0xcf9e6e,
 M1:0xc08a62,M2:0xd1a07a,M3:0xb47e58};
const HAIR={black:0x121010,dkbrown:0x2c1c12,brown:0x55361f,ltbrown:0x7a5634,auburn:0x7c3416,red:0xa5441c,ginger:0xb8602a,sandy:0xb08c58,
 blonde:0xcfae68,platinum:0xe6dcbc,grey:0x8e8b86,saltpep:0x5e5b57,silver:0xbfbdb7,white:0xe6e4de,pink:0xd27a9a,plum:0x4a2240};
const EYE={brown:0x3a2414,dkbrown:0x1e120a,hazel:0x6a5a2a,green:0x3e6a3a,blue:0x3a6aa8,grey:0x6a7680,amber:0x8a5a1a};
/* ---------------- 18 base persona models ---------------- */
const ARCH={
 BFC:{l:'Black Female Child',age:9,e:'B',g:'F',sk:'B2',hs:'puffs',hc:'black',ey:'dkbrown',b:'child',top:'tee',tc:0xe0569a,bot:'jeans',pc:0x4a6a9a,sh:0xf0f0f0,acc:['backpack'],
  feat:'Round face, full cheeks, warm brown skin, dark brown eyes, natural coily hair in two puffs; proportionally larger head, slight frame.',
  ctx:'School-age kid: bright colours, sneakers and a backpack. Rescued children stay close to adults and boost family morale.'},
 BMC:{l:'Black Male Child',age:10,e:'B',g:'M',sk:'B3',hs:'fade',hc:'black',ey:'dkbrown',b:'child',top:'jersey',tc:0x2a5ad8,bot:'shorts',pc:0x1a1a22,sh:0xffffff,acc:[],
  feat:'Round face, deep brown skin, short faded hair with a little volume on top, bright eyes; small, wiry frame.',
  ctx:'Sporty kid in a basketball jersey; quick on his feet, needs protecting in a siege.'},
 WFC:{l:'White Female Child',age:8,e:'W',g:'F',sk:'W2',hs:'pigtails',hc:'blonde',ey:'blue',b:'child',top:'dress',tc:0x8fc0e8,bot:'skirt',pc:0x8fc0e8,sh:0xc83030,acc:[],
  feat:'Fair skin with pink cheeks, light eyes, blonde pigtails, button nose; short and slight.',
  ctx:'Young girl in a sundress and red shoes; the classic child-in-peril survivor.'},
 WMC:{l:'White Male Child',age:10,e:'W',g:'M',sk:'W3',hs:'kid',hc:'sandy',ey:'green',b:'child',top:'tee',tc:0x3a8a4a,bot:'jeans',pc:0x3a5a8a,sh:0xc83030,acc:[],
  feat:'Light skin, freckled cheeks, messy sandy hair, gap-toothed grin; thin limbs.',
  ctx:'Scrappy kid in a T-shirt and jeans; curious, wanders off if not told to stay.'},
 AFC:{l:'Asian Female Child',age:7,e:'A',g:'F',sk:'A1',hs:'bob',hc:'black',ey:'dkbrown',b:'child',top:'long',tc:0xf0c8d8,bot:'skirt',pc:0x2a3a6a,sh:0x1a1a1a,acc:[],
  feat:'Light golden skin, dark almond eyes, straight black bob with bangs, small round face.',
  ctx:'Neat school uniform look (cardigan, pleated skirt); quiet, observant.'},
 AMC:{l:'Asian Male Child',age:9,e:'A',g:'M',sk:'A2',hs:'kid',hc:'black',ey:'dkbrown',b:'child',top:'tee',tc:0xe8c84a,bot:'shorts',pc:0x5a6a7a,sh:0x2a5ad8,acc:['cap:0x2a5ad8'],
  feat:'Warm light skin, dark eyes, straight black hair under a ball cap, round cheeks.',
  ctx:'Kid in a cap and shorts; fast and small enough to hide well.'},
 BFA:{l:'Black Female Adult',age:36,e:'B',g:'F',sk:'B2',hs:'braids',hc:'black',ey:'brown',b:'avg',top:'blazer',tc:0x2a2a30,tc2:0xe8e4dc,bot:'slacks',pc:0x2a2a30,sh:0x1a1a1a,acc:[],
  feat:'Medium-deep brown skin, defined cheekbones, full lips, dark eyes, long box braids; average height, upright.',
  ctx:'Professional in a blazer; organised, a natural fort coordinator.'},
 BMA:{l:'Black Male Adult',age:38,e:'B',g:'M',sk:'B4',hs:'buzz',hc:'black',fh:'goat',ey:'dkbrown',b:'strong',top:'tee',tc:0x5a5a5e,bot:'cargo',pc:0x3e4232,sh:0x3a2a1a,acc:[],
  feat:'Deep brown skin, strong jaw, close-cropped hair, short goatee; broad shoulders.',
  ctx:'Tradesman build in a work T-shirt and cargo pants; carries heavy loads, good in a fight.'},
 WFA:{l:'White Female Adult',age:34,e:'W',g:'F',sk:'W2',hs:'ponytail',hc:'brown',ey:'hazel',b:'avg',top:'flannel',tc:0x8a2a2a,bot:'jeans',pc:0x34465e,sh:0x5a3a24,acc:[],
  feat:'Fair skin, oval face, hazel eyes, brown hair in a ponytail; medium build.',
  ctx:'Practical everywoman in flannel and jeans; scavenger, handy with tools.'},
 WMA:{l:'White Male Adult',age:40,e:'W',g:'M',sk:'W3',hs:'short',hc:'ltbrown',fh:'stub',ey:'blue',b:'avg',top:'jacket',tc:0x3a4a3a,tc2:0x8a8a84,bot:'jeans',pc:0x2a3448,sh:0x3a2a1a,acc:[],
  feat:'Light skin, square jaw, stubble, short brown hair, blue eyes; average frame.',
  ctx:'Dad-next-door in a field jacket; dependable generalist.'},
 AFA:{l:'Asian Female Adult',age:32,e:'A',g:'F',sk:'A2',hs:'long',hc:'black',ey:'dkbrown',b:'slim',top:'blouse',tc:0xd8e4ec,bot:'skirt',pc:0x2a2a34,sh:0x1a1a1a,acc:['glasses'],
  feat:'Light warm skin, dark almond eyes, long straight black hair, slim build, glasses.',
  ctx:'Office professional in a blouse and skirt; sharp, good with electronics and planning.'},
 AMA:{l:'Asian Male Adult',age:35,e:'A',g:'M',sk:'A3',hs:'side',hc:'black',fh:'stub',ey:'dkbrown',b:'avg',top:'hoodie',tc:0x3a3e46,bot:'jeans',pc:0x24242a,sh:0xf0f0f0,acc:[],
  feat:'Golden skin, dark eyes, side-parted black hair, light stubble; lean average build.',
  ctx:'Casual hoodie-and-jeans survivor; fast and resourceful runner.'},
 BFS:{l:'Black Female Senior',age:70,e:'B',g:'F',sk:'B3',hs:'updo',hc:'white',ey:'brown',b:'senior',top:'cardigan',tc:0x6a4a8a,tc2:0xe8e0d0,bot:'skirt',pc:0x3a3040,sh:0x2a2018,acc:['glasses','necklace'],
  feat:'Deep brown skin with soft lines, white curls pinned up, reading glasses; slightly stooped.',
  ctx:'Matriarch in a cardigan; wise, steadies morale, knows remedies.'},
 BMS:{l:'Black Male Senior',age:72,e:'B',g:'M',sk:'B4',hs:'fringe',hc:'white',fh:'full',ey:'brown',b:'senior',top:'suit',tc:0x4a3a2a,tc2:0xece8de,bot:'slacks',pc:0x4a3a2a,sh:0x1a1410,acc:['fedora:0x4a3a2a'],
  feat:'Deep brown skin, bald crown with white fringe, short white beard, kind eyes; slight stoop.',
  ctx:'Elder statesman in a Sunday suit and fedora; slow, but a strong voice in the fort.'},
 WFS:{l:'White Female Senior',age:71,e:'W',g:'F',sk:'W1',hs:'updo',hc:'silver',ey:'blue',b:'senior',top:'cardigan',tc:0x8aa0b8,tc2:0xf0ece4,bot:'skirt',pc:0x5a5a6a,sh:0x3a3028,acc:['glasses'],
  feat:'Very fair skin, rosy cheeks, silver set curls, pale blue eyes behind glasses; small, stooped.',
  ctx:'Grandmother in a cardigan; a calm cook and medic.'},
 WMS:{l:'White Male Senior',age:74,e:'W',g:'M',sk:'W5',hs:'receding',hc:'white',fh:'mous',ey:'grey',b:'senior',top:'shirt',tc:0xc8b898,bot:'slacks',pc:0x5a5040,sh:0x2a2018,acc:['cap:0x4a5232'],
  feat:'Ruddy fair skin, receding white hair, white moustache, deep lines; lean, slightly bent.',
  ctx:'Retiree in a veteran cap; good shot, poor runner.'},
 AFS:{l:'Asian Female Senior',age:73,e:'A',g:'F',sk:'A2',hs:'bob',hc:'saltpep',ey:'dkbrown',b:'senior',top:'long',tc:0x4a6a5a,bot:'slacks',pc:0x3a3a3a,sh:0x1a1a1a,acc:['glasses'],
  feat:'Light warm skin with fine lines, salt-and-pepper bob, dark eyes, glasses; petite and stooped.',
  ctx:'Sharp-eyed grandmother; patient spotter and planner.'},
 AMS:{l:'Asian Male Senior',age:75,e:'A',g:'M',sk:'A3',hs:'fringe',hc:'white',fh:'goat',ey:'dkbrown',b:'senior',top:'cardigan',tc:0x8a8a84,tc2:0xe8e4dc,bot:'slacks',pc:0x4a3a2a,sh:0x1a1410,acc:['glasses'],
  feat:'Golden skin, thinning white hair, wispy white chin beard, glasses; thin, stooped.',
  ctx:'Quiet elder in a cardigan; experienced, steady hands for crafting.'}
};
/* ---------------- named survivors ---------------- */
const D={
/* The Blackwoods */
npc_Blackwood_Algernon:{e:'W',sk:'W5',b:'senior',hs:'fringe',hc:'white',fh:'full',ey:'blue',top:'jacket',tc:0x6b5a44,tc2:0xd8d0b8,bot:'slacks',pc:0x4a4038,sh:0x2a1c12,acc:['glasses','bowtie:0x6a1a1a'],note:'Tweed-jacketed old newsman: white fringe and trimmed white beard, bow tie, reading glasses.'},
npc_Blackwood_Delilah:{e:'B',sk:'B2',b:'avg',hs:'bun',hc:'black',ey:'brown',top:'cardigan',tc:0xc89a3a,tc2:0xece6da,bot:'slacks',pc:0x3a3a40,sh:0x2a1a12,acc:['lanyard:0x2a5ad8'],note:'Social worker in a mustard cardigan with an ID lanyard, hair in a neat bun.'},
npc_Blackwood_April:{e:'W',sk:'W2',b:'slim',hs:'ponytail',hc:'auburn',ey:'green',top:'hoodie',tc:0x3a3e46,bot:'jeans',pc:0x3a4a6a,sh:0xf0f0f0,acc:['glasses'],note:'Computer tech: auburn ponytail, charcoal hoodie, glasses, white sneakers.'},
npc_Blackwood_Aaron:{e:'W',sk:'W3',b:'avg',hs:'side',hc:'brown',ey:'hazel',top:'suit',tc:0x1e2a44,tc2:0xf2f2ee,bot:'slacks',pc:0x1e2a44,sh:0x0e0e0e,acc:['tie:0xa01e1e'],note:'Lawyer in a navy suit and red tie, side-parted brown hair, clean-shaven.'},
npc_Blackwood_August:{e:'W',sk:'W4',b:'strong',hs:'short',hc:'sandy',fh:'beard',ey:'blue',top:'flannel',tc:0x5a6a32,tc2:0x2a2a1a,bot:'jeans',pc:0x34465e,sh:0x8a6a3a,acc:['toolbelt'],note:'Carpenter: sandy hair and short beard, olive plaid flannel, tool belt, tan work boots.'},
npc_Blackwood_Timothy:{e:'M',sk:'M1',b:'child',hs:'curly',hc:'dkbrown',ey:'brown',top:'tee',tc:0xe0702a,bot:'jeans',pc:0x4a6a9a,sh:0x2a2a2a,acc:['backpack'],note:'Delilah and Aaron\'s son (Black / White heritage): short curls, orange tee, school backpack.'},
/* The Lovecrafts */
npc_Lovecraft_Jedediah:{e:'W',sk:'W5',b:'senior',hs:'buzz',hc:'white',fh:'mous',ey:'grey',top:'jacket',tc:0x4b5232,tc2:0x6a6a52,bot:'slacks',pc:0x8a7a5a,sh:0x1a1410,acc:['cap:0x3a4228','dogtags'],note:'Old soldier: white buzz cut and moustache, olive field jacket, veteran cap, dog tags.'},
npc_Lovecraft_Winston:{e:'W',sk:'W4',b:'heavy',hs:'slick',hc:'dkbrown',fh:'mous',ey:'brown',top:'suit',tc:0x8a8c90,tc2:0x9ab4d8,bot:'slacks',pc:0x8a8c90,sh:0x3a2418,acc:['tie:0xd8b030'],note:'Salesman: slicked hair, moustache, grey suit, blue shirt, loud yellow tie, a bit of a belly.'},
npc_Lovecraft_Sarah:{e:'W',sk:'W2',b:'petite',hs:'wavy',hc:'blonde',ey:'blue',top:'dress',tc:0x8fb4d8,bot:'skirt',pc:0x8fb4d8,sh:0xe8e4dc,acc:['apron'],note:'Housewife: blonde waves, pale-blue dress with a white apron.'},
npc_Lovecraft_Howard:{e:'W',sk:'W2',b:'child',hs:'kid',hc:'blonde',ey:'blue',top:'stripes',tc:0x3a8a4a,tc2:0xf0f0e8,bot:'jeans',pc:0x3a5a8a,sh:0xc83030,acc:[],note:'Youngest Lovecraft: blond mop, green striped tee, red sneakers.'},
npc_Lovecraft_Philip:{e:'W',sk:'W3',b:'child',hs:'short',hc:'brown',ey:'hazel',top:'sweater',tc:0x2a3a6a,bot:'slacks',pc:0xa89a78,sh:0x3a2418,acc:['glasses'],note:'Bookish older brother: navy sweater, khakis, glasses.'},
/* The Phillips */
npc_Phillips_Whitely:{e:'A',sk:'A3',b:'senior',hs:'receding',hc:'grey',ey:'dkbrown',top:'labcoat',tc:0xf2f2ee,tc2:0x9ab4d8,bot:'slacks',pc:0x5a5a60,sh:0x1a1410,acc:['glasses','tie:0x2a3a6a','stethoscope'],note:'Family doctor: receding grey hair, white coat over shirt and tie, stethoscope, glasses.'},
npc_Phillips_Lillian:{e:'A',sk:'A2',b:'avg',hs:'updo',hc:'saltpep',ey:'dkbrown',top:'scrubs',tc:0x8cc0d8,bot:'scrubs',pc:0x8cc0d8,sh:0xf0f0f0,acc:['badge:0xf0f0f0'],note:'Nurse: salt-and-pepper hair pinned up, light-blue scrubs, white clogs.'},
npc_Phillips_Annie:{e:'A',sk:'A1',b:'slim',hs:'long',hc:'silver',ey:'grey',top:'longcoat',tc:0x4a2a5a,tc2:0x2a2a2e,bot:'slacks',pc:0x1e1e22,sh:0x1a1a1a,acc:['glasses','scarf:0x2a8a8a'],note:'Paranormal researcher: long silver hair, purple long coat, teal scarf, round glasses.'},
npc_Phillips_Susannah:{e:'A',sk:'A1',b:'slim',hs:'bob',hc:'black',ey:'dkbrown',top:'blouse',tc:0xf2f0ec,bot:'skirt',pc:0x4a4a52,sh:0x1a1a1a,acc:['necklace'],note:'Secretary: sleek black bob, white blouse, grey pencil skirt, pearl necklace.'},
npc_Phillips_Anna_Louise:{e:'A',sk:'A1',b:'child',hs:'pigtails',hc:'black',ey:'dkbrown',top:'dress',tc:0xe08aa8,bot:'skirt',pc:0xe08aa8,sh:0xc83030,acc:[],note:'Twin #1: black pigtails, pink dress, red shoes.'},
npc_Phillips_Lily_Mae:{e:'A',sk:'A1',b:'child',hs:'ponytail',hc:'black',ey:'dkbrown',top:'dress',tc:0xe8c84a,bot:'skirt',pc:0xe8c84a,sh:0x2a5ad8,acc:[],note:'Twin #2: single ponytail, yellow dress, blue shoes (so the twins can be told apart).'},
/* The Chambers */
npc_Chambers_Agatha:{e:'B',sk:'B3',b:'senior',hs:'updo',hc:'white',ey:'brown',top:'uniform',tc:0xb89a6a,bot:'slacks',pc:0x5a4632,sh:0x2a1a10,acc:['stetson:0xa88a5a','star','glasses'],note:'92-year-old retired county sheriff: tan uniform shirt with a star, campaign hat, white curls, glasses.'},
npc_Chambers_John:{e:'B',sk:'B2',b:'avg',hs:'short',hc:'black',fh:'goat',ey:'dkbrown',top:'sweatervest',tc:0x6a1e2a,tc2:0x9ab4d8,bot:'slacks',pc:0xa89a78,sh:0x3a2418,acc:['glasses','tie:0x2a2a4a'],note:'Teacher: burgundy sweater vest over a blue shirt and tie, goatee, glasses.'},
npc_Chambers_Mark:{e:'B',sk:'B4',b:'strong',hs:'buzz',hc:'black',fh:'stub',ey:'dkbrown',top:'workshirt',tc:0x2a3a5a,bot:'cargo',pc:0x5a5a5a,sh:0x2a2018,acc:['toolbelt','hardhat:0xf0c020'],note:'Electrician: navy work shirt with name patch, cargo pants, tool belt, yellow hard hat.'},
npc_Chambers_Luke:{e:'B',sk:'B5',b:'heavy',hs:'bald',hc:'black',fh:'full',ey:'dkbrown',top:'flannel',tc:0x2a4a8a,tc2:0x14141a,bot:'jeans',pc:0x2a3448,sh:0x3a2418,acc:['cap:0xc81e1e:0xf0f0f0'],note:'Trucker: shaved head under a red-and-white mesh cap, full black beard, blue plaid flannel.'},
npc_Chambers_Matthew:{e:'B',sk:'B3',b:'strong',hs:'short',hc:'black',fh:'mous',ey:'brown',top:'tee',tc:0x1e2a44,bot:'turnout',pc:0xc8b070,sh:0x111111,acc:['suspenders:0xc81e1e','decal:FIRE'],note:'Firefighter: navy FIRE tee, tan turnout trousers with reflective bands, red suspenders, moustache.'},
npc_Chambers_Roberta:{e:'B',sk:'B2',b:'heavy',hs:'locs',hc:'plum',ey:'brown',top:'polo',tc:0xb8282a,bot:'slacks',pc:0xa89a78,sh:0x1a1a1a,acc:['badge:0xf0f0f0'],note:'Retail clerk (John\'s wife): plum-tinted shoulder locs, red store polo and name tag, khakis.'},
npc_Chambers_Evelyn:{e:'B',sk:'B2',b:'child',hs:'afro',hc:'black',ey:'dkbrown',top:'tee',tc:0x7a3ab8,bot:'jeans',pc:0x4a6a9a,sh:0xf0f0f0,acc:[],note:'Natural afro, purple tee, jeans.'},
npc_Chambers_Christine:{e:'B',sk:'B3',b:'child',hs:'braids',hc:'black',ey:'dkbrown',top:'tee',tc:0xf0d040,bot:'overalls',pc:0x4a6a9a,sh:0xe05a8a,acc:[],note:'Box braids, denim overalls over a yellow tee, pink shoes.'},
npc_Chambers_Adam:{e:'B',sk:'B4',b:'teen',hs:'fade',hc:'black',ey:'dkbrown',top:'hoodie',tc:0x2a6a3a,bot:'jeans',pc:0x2a3448,sh:0xf0f0f0,acc:[],note:'Teen: high-top fade, green hoodie, white sneakers.'},
/* The Poes */
npc_Poe_August:{e:'A',sk:'A3',b:'senior',hs:'fringe',hc:'white',fh:'goat',ey:'dkbrown',top:'cardigan',tc:0x7a7a74,tc2:0xe8e4dc,bot:'slacks',pc:0x5a4632,sh:0x1a1410,acc:['glasses'],note:'Family patriarch: white fringe, long wispy chin beard, grey cardigan, glasses.'},
npc_Poe_Jethro:{e:'A',sk:'A4',b:'strong',hs:'buzz',hc:'black',fh:'full',ey:'dkbrown',top:'jacket',tc:0x1c2436,tc2:0x3a3a40,bot:'jeans',pc:0x24242a,sh:0x1a1410,acc:['beanie:0x141418'],note:'Merchant marine: navy peacoat, black watch cap, full black beard, weathered skin.'},
npc_Poe_Edgar:{e:'A',sk:'A2',b:'avg',hs:'side',hc:'black',fh:'stub',ey:'dkbrown',top:'longcoat',tc:0xb09a6a,tc2:0xf2f2ee,bot:'slacks',pc:0x4a4a52,sh:0x1a1410,acc:['tie:0x2a2a30','beltbadge'],note:'Detective: tan trench coat, white shirt and dark tie, stubble, badge on the belt.'},
npc_Poe_Virginia:{e:'B',sk:'B1',b:'slim',hs:'ponytail',hc:'black',ey:'brown',top:'blazer',tc:0x34343a,tc2:0xf2f2ee,bot:'slacks',pc:0x18181c,sh:0x0e0e0e,acc:['beltbadge'],note:'Detective (née Howard, Edgar\'s wife): low ponytail, charcoal blazer, badge on the belt.'},
npc_Poe_Henry:{e:'M',sk:'M3',b:'child',hs:'curly',hc:'black',ey:'dkbrown',top:'jersey',tc:0xc8282a,bot:'shorts',pc:0xa89a78,sh:0xf0f0f0,acc:[],note:'Edgar and Virginia\'s son (Asian / Black heritage): short curls, red jersey, khaki shorts.'},
npc_Poe_Leonard:{e:'M',sk:'M2',b:'child',hs:'kid',hc:'black',ey:'dkbrown',top:'tee',tc:0x2a6ac8,bot:'jeans',pc:0x3a4a6a,sh:0xe8c84a,acc:['cap:0x2a6ac8'],note:'Little brother: blue ball cap and tee, yellow sneakers.'},
/* The Machens */
npc_Machen_Arthur:{e:'A',sk:'A2',b:'slim',hs:'slick',hc:'silver',fh:'goat',ey:'dkbrown',top:'suit',tc:0x5a1a2a,tc2:0xf0ece0,bot:'slacks',pc:0x1e1e22,sh:0x0e0e0e,acc:['scarf:0xece4cc'],note:'Old stage actor: swept-back silver hair, trimmed grey goatee, burgundy velvet jacket, cream scarf.'},
npc_Machen_Clarissa:{e:'A',sk:'A1',b:'senior',hs:'updo',hc:'silver',ey:'dkbrown',top:'dress',tc:0x1e6a4a,bot:'longdress',pc:0x1e6a4a,sh:0x1a1a1a,acc:['necklace'],note:'Retired actress: silver updo, long emerald gown, pearls - still dressed for opening night.'},
npc_Machen_Nathan:{e:'A',sk:'A3',b:'slim',hs:'bun',hc:'black',fh:'stub',ey:'dkbrown',top:'turtleneck',tc:0x18181a,bot:'slacks',pc:0x18181a,sh:0x0e0e0e,acc:['glasses'],note:'Theatre director: man-bun, black turtleneck and slacks, heavy-framed glasses.'},
npc_Machen_Julia:{e:'W',sk:'W2',b:'slim',hs:'pixie',hc:'auburn',ey:'green',top:'tee',tc:0xf0f0ea,bot:'overalls',pc:0x5a7aa8,sh:0x2a2a2a,acc:['paint'],note:'Painter (Theodosius Ashton\'s daughter, Nathan\'s wife): auburn pixie cut, paint-spattered overalls.'},
npc_Machen_Flora:{e:'W',sk:'W2',b:'avg',hs:'long',hc:'auburn',ey:'green',top:'cardigan',tc:0xd8c8a8,tc2:0xf2f0ec,bot:'skirt',pc:0x2a3448,sh:0x3a2418,acc:['glasses'],note:'Editor (Julia\'s twin): long auburn hair, beige cardigan, navy skirt, glasses.'},
npc_Machen_Richard:{e:'M',sk:'M2',b:'teen',hs:'side',hc:'dkbrown',ey:'hazel',top:'hoodie',tc:0x8a8a8a,bot:'jeans',pc:0x2a3448,sh:0x1a1a1a,acc:[],note:'Nathan and Julia\'s older son (Asian / White heritage): grey hoodie, jeans.'},
npc_Machen_Lawrence:{e:'M',sk:'M2',b:'child',hs:'kid',hc:'dkbrown',ey:'hazel',top:'stripes',tc:0xe8c84a,tc2:0x2a5ad8,bot:'shorts',pc:0x5a7aa8,sh:0xc83030,acc:[],note:'Younger son: yellow-and-blue striped tee, denim shorts.'},
/* The Howards */
npc_Howard_Isaac:{e:'B',sk:'B4',b:'senior',hs:'fringe',hc:'white',fh:'full',ey:'brown',top:'suit',tc:0x5a4632,tc2:0xf0ece0,bot:'slacks',pc:0x5a4632,sh:0x1a1410,acc:['glasses','fedora:0x3a2a1a','cross'],note:'86-year-old missionary: white fringe and beard, brown suit, fedora, wooden cross.'},
npc_Howard_Mordechai:{e:'B',sk:'B3',b:'avg',hs:'short',hc:'black',fh:'goat',ey:'dkbrown',top:'suit',tc:0x141418,tc2:0xf2f2ee,bot:'slacks',pc:0x141418,sh:0x0e0e0e,acc:['tie:0x5a2a8a'],note:'Minister: black suit, purple tie, neat goatee.'},
npc_Howard_Hester:{e:'B',sk:'B1',b:'avg',hs:'wavy',hc:'black',ey:'brown',top:'dress',tc:0x8fb8d8,bot:'longdress',pc:0x8fb8d8,sh:0x3a2418,acc:['cross'],note:'Missionary (Mordechai\'s wife): soft waves, long sky-blue dress, small cross.'},
npc_Howard_Lucius:{e:'B',sk:'B5',b:'strong',hs:'bald',hc:'black',fh:'goat',ey:'dkbrown',top:'tank',tc:0xf2f2f2,bot:'tracks',pc:0xb81e1e,sh:0xf0f0f0,acc:['wraps:0xf0f0f0'],note:'Boxer: shaved head, white tank, red track pants with stripes, taped hands.'},
npc_Howard_Bobby:{e:'B',sk:'B3',b:'teen',hs:'cornrows',hc:'black',ey:'dkbrown',top:'jersey',tc:0x2a4ab8,bot:'shorts',pc:0x2a4ab8,sh:0xf0f0f0,acc:[],note:'Teen: cornrows, blue basketball jersey and shorts.'},
npc_Howard_Janey:{e:'B',sk:'B2',b:'child',hs:'puffs',hc:'black',ey:'dkbrown',top:'dress',tc:0xe05a9a,bot:'skirt',pc:0xe05a9a,sh:0xf0f0f0,acc:[],note:'Two afro puffs, pink dress, white shoes.'},
/* The Dunsanys */
npc_Dunsany_Edgar:{e:'W',sk:'W3',b:'officer',hs:'fringe',hc:'grey',ey:'grey',brow:1.25,top:'uniform',tc:0x5a5a3e,bot:'slacks',pc:0x5a5a3e,sh:0x0a0a0a,acc:['sambrowne','ribbons'],note:'Military officer: completely bald crown with a close-cropped grey fringe, clean-shaven, strong brow, grey eyes; immaculate olive service dress with Sam Browne belt and ribbons; ramrod posture.'},
npc_Dunsany_Olivia:{e:'W',sk:'W3',b:'avg',hs:'bob',hc:'sandy',ey:'blue',top:'safari',tc:0x6a6a42,tc2:0xb8aa80,bot:'cargo',pc:0x8a7a5a,sh:0x5a3a24,acc:['camera'],note:'Wildlife photographer: sandy-grey bob, khaki safari vest, camera on a strap.'},
npc_Dunsany_Nala:{e:'W',sk:'W4',b:'strong',hs:'bun',hc:'brown',ey:'grey',top:'camo',bot:'camo',sh:0x2a2018,acc:['dogtags'],note:'Soldier: brown bun, full camo uniform, dog tags.'},
npc_Dunsany_Opal:{e:'W',sk:'W1',b:'slim',hs:'long',hc:'pink',ey:'blue',top:'tee',tc:0x3a8a4a,bot:'jeans',pc:0x5a7aa8,sh:0x2a2a2a,acc:['beanie:0x2a6a3a'],note:'Animal-rights activist: pink-dyed long hair, green beanie and tee.'},
npc_Dunsany_Gen:{e:'W',sk:'W1',b:'avg',hs:'ponytail',hc:'red',ey:'green',top:'tee',tc:0x4b5232,bot:'camo',sh:0x2a2018,acc:['dogtags'],note:'Soldier: red ponytail, olive tee, camo trousers, dog tags.'},
npc_Dunsany_Lucia:{e:'W',sk:'W2',b:'slim',hs:'pixie',hc:'blonde',ey:'blue',top:'camo',bot:'camo',sh:0x2a2018,acc:['cap:0x4b5232'],note:'Soldier: blonde crop, camo jacket, patrol cap.'},
npc_Dunsany_Raven:{e:'W',sk:'W1',b:'avg',hs:'long',hc:'black',ey:'blue',top:'sweater',tc:0x6a1e2a,bot:'jeans',pc:0x2a3448,sh:0x2a1a12,acc:[],note:'Eldest daughter (Rowan, Willow and Arthur\'s mother): long black hair, burgundy jumper.'},
npc_Dunsany_Rowan:{e:'W',sk:'W2',b:'child',hs:'curly',hc:'ginger',ey:'green',top:'hoodie',tc:0xd06a1a,bot:'jeans',pc:0x3a4a6a,sh:0x2a2a2a,acc:[],note:'Ginger curls, orange hoodie.'},
npc_Dunsany_Willow:{e:'W',sk:'W1',b:'child',hs:'long',hc:'blonde',ey:'blue',top:'dress',tc:0xb8a0d8,bot:'skirt',pc:0xb8a0d8,sh:0xf0f0f0,acc:['headband:0xf0f0f0'],note:'Long blonde hair with a headband, lavender dress.'},
npc_Dunsany_Arthur:{e:'W',sk:'W2',b:'child',hs:'kid',hc:'ginger',ey:'blue',top:'sweatervest',tc:0x2a5a3a,tc2:0xf0f0ea,bot:'shorts',pc:0x5a5a60,sh:0x3a2418,acc:['glasses'],note:'Little ginger bookworm: green sweater vest over a white shirt, glasses.'},
/* The Ashtons */
npc_Ashton_Theodosius:{e:'W',sk:'W5',b:'avg',hs:'receding',hc:'grey',fh:'full',ey:'blue',top:'shirt',tc:0xece6d8,bot:'overalls',pc:0x3a5a8a,sh:0x4a3220,acc:['strawhat'],note:'Farmer: grey beard, straw hat, denim overalls over a work shirt, sun-weathered skin.'},
npc_Ashton_Lula:{e:'B',sk:'B2',b:'avg',hs:'ponytail',hc:'dkbrown',ey:'brown',top:'flannel',tc:0xb8282a,tc2:0x2a1a1a,bot:'jeans',pc:0x34465e,sh:0x5a3a24,acc:['stetson:0x6a4a2a'],note:'Farmer (Tiberious\'s wife): long ponytail, red plaid shirt, cowboy hat, boots.'},
npc_Ashton_Tiberious:{e:'W',sk:'W3',b:'avg',hs:'short',hc:'dkbrown',fh:'goat',ey:'blue',top:'coverall',tc:0x2a4a8a,bot:'coverall',pc:0x2a4a8a,sh:0x2a2018,acc:['cap:0x1e2a44'],note:'Plumber: blue coveralls, navy cap, goatee.'},
npc_Ashton_Misery:{e:'M',sk:'M1',b:'child',hs:'long',hc:'black',ey:'brown',top:'dress',tc:0x141418,bot:'skirt',pc:0x141418,sh:0x141418,acc:['tights'],note:'Goth kid (Black / White heritage): long black hair, black dress, striped tights.'},
/* The Smiths */
npc_Smith_Fanny:{e:'B',sk:'B4',b:'senior',hs:'headwrap',hc:'grey',ey:'brown',top:'workshirt',tc:0x5a7aa0,bot:'slacks',pc:0xa89a78,sh:0x3a2418,acc:['wrap:0xd8642a'],note:'Field worker: bright orange head wrap, denim work shirt, khakis.'},
npc_Smith_Timeus:{e:'B',sk:'B5',b:'heavy',hs:'bald',hc:'grey',fh:'mous',ey:'dkbrown',top:'track',tc:0x6a1e2a,tc2:0xf0f0f0,bot:'tracks',pc:0x6a1e2a,sh:0xf0f0f0,acc:[],note:'Retired prizefighter: bald, grey moustache, maroon tracksuit, still built like a fridge.'},
npc_Smith_Clem:{e:'B',sk:'B3',b:'strong',hs:'short',hc:'black',fh:'stub',ey:'dkbrown',top:'coverall',tc:0x4a5a6a,bot:'coverall',pc:0x4a5a6a,sh:0x1a1a1a,acc:['grease'],note:'Mechanic: grease-smeared grey coveralls, stubble.'},
npc_Smith_Clara:{e:'A',sk:'A2',b:'avg',hs:'curlyshort',hc:'black',ey:'dkbrown',top:'shirt',tc:0x8aa0c0,bot:'shorts',pc:0x2a3448,sh:0x1a1a1a,acc:['satchel'],note:'Postal worker (Clem\'s wife): short curly hair, blue-grey uniform shirt, navy shorts, mail satchel.'},
npc_Smith_Peabody:{e:'B',sk:'B2',b:'slim',hs:'afro',hc:'black',fh:'mous',ey:'brown',top:'stripes',tc:0xc81e1e,tc2:0xf2f2f2,bot:'slacks',pc:0x2a2a30,sh:0x0e0e0e,acc:['boater','bowtie:0x141418','suspenders:0x141418'],note:'Carnival barker: afro under a straw boater, red-and-white striped shirt, bow tie, suspenders.'},
npc_Smith_Clark:{e:'M',sk:'M3',b:'child',hs:'curly',hc:'black',ey:'dkbrown',top:'tee',tc:0xe8c84a,bot:'jeans',pc:0x4a6a9a,sh:0xc83030,acc:[],note:'Clem and Clara\'s son (Black / Asian heritage): short curls, yellow tee.'},
npc_Smith_Portia:{e:'M',sk:'M1',b:'teen',hs:'braids',hc:'black',ey:'dkbrown',top:'hoodie',tc:0xb8a0d8,bot:'leggings',pc:0x18181c,sh:0xf0f0f0,acc:[],note:'Teen: long braids, lilac hoodie, black leggings.'},
/* unattached */
npc_Samuel:{e:'W',sk:'W4',b:'strong',hs:'short',hc:'ginger',fh:'full',ey:'blue',top:'tee',tc:0x6a6a6e,bot:'jeans',pc:0x34465e,sh:0x8a6a3a,acc:['hivis:0xf07a1e','hardhat:0xf2f2f2'],note:'Construction worker: ginger beard, white hard hat, orange hi-vis vest, tan boots.'},
/* Sgt. Miller and Dr. Aris: MFZ's own survivors (no longer at the fort on day 1 - they are in the recruit pool like everyone else) */
npc_Miller:{n:'Sgt. Miller',age:44,g:'M',e:'B',sk:'B3',b:'strong',hs:'buzz',hc:'black',fh:'mous',ey:'dkbrown',top:'uniform',tc:0x3e4630,bot:'cargo',pc:0x3e4630,sh:0x1a1410,acc:['cap:0x2e3424','dogtags'],note:'Ex-army sergeant, buzz cut and moustache, olive fatigues, patrol cap.'},
npc_Aris:{n:'Dr. Aris',age:41,g:'F',e:'A',sk:'A2',b:'slim',hs:'bob',hc:'black',ey:'dkbrown',top:'labcoat',tc:0xf2f2ee,tc2:0x8a3a4a,bot:'slacks',pc:0x2a2a30,sh:0x1a1a1a,acc:['glasses','stethoscope'],note:'Doctor: black bob, white coat over a wine blouse, stethoscope, glasses.'},
/* tarot survivors */
Tarot_The_Loser:{e:'A',sk:'A2',b:'slim',hs:'shaggy',hc:'black',fh:'stub',ey:'dkbrown',top:'jacket',tc:0x141416,tc2:0x8a1a1a,bot:'jeans',pc:0x141418,sh:0x0e0e0e,acc:[],note:'Musician: shaggy black hair, black leather jacket over a red band tee, black jeans.'},
Tarot_The_Scientist:{e:'A',sk:'A1',b:'slim',hs:'bun',hc:'black',ey:'dkbrown',top:'labcoat',tc:0xf2f2ee,tc2:0x2a8a8a,bot:'slacks',pc:0x3a3a40,sh:0x1a1a1a,acc:['glasses','badge:0xf0f0f0'],note:'Scientist: tight bun, lab coat over a teal blouse, ID badge, glasses.'},
Tarot_The_Seer:{e:'B',sk:'B2',b:'slim',hs:'headwrap',hc:'black',ey:'amber',top:'dress',tc:0x3a1a4a,bot:'longdress',pc:0x3a1a4a,sh:0x1a1a1a,acc:['wrap:0x8a2a9a','necklace'],note:'Spiritual adviser: purple head wrap, long dark-violet dress, beaded necklace.'},
Tarot_The_Teacher:{e:'A',sk:'A2',b:'avg',hs:'bob',hc:'dkbrown',ey:'dkbrown',top:'cardigan',tc:0x3a6a3a,tc2:0xf2f0ec,bot:'skirt',pc:0x5a4632,sh:0x3a2418,acc:['glasses'],note:'Teacher: brown bob, green cardigan over a cream blouse, brown skirt, glasses.'},
Tarot_The_BeautyQueen:{e:'W',sk:'W2',b:'slim',hs:'wavy',hc:'platinum',ey:'blue',top:'dress',tc:0xe878b0,bot:'skirt',pc:0xe878b0,sh:0xf0f0f0,acc:['sash','tiara'],note:'Beauty queen: platinum waves, pink gown, white sash, tiara.'},
Tarot_The_Veteran:{e:'W',sk:'W4',b:'strong',hs:'buzz',hc:'grey',ey:'blue',top:'tee',tc:0x4b5232,bot:'camo',sh:0x2a2018,acc:['dogtags'],note:'Marine veteran: grey flat-top, olive tee, camo trousers, dog tags, barrel chest.'},
Tarot_The_HolyMan:{e:'W',sk:'W3',b:'avg',hs:'side',hc:'grey',ey:'brown',top:'clerical',tc:0x141418,bot:'slacks',pc:0x141418,sh:0x0e0e0e,acc:['cross'],note:'Priest: side-parted grey hair, black clerical shirt with white collar, cross.'},
Tarot_The_Rat:{e:'B',sk:'B3',b:'slim',hs:'buzz',hc:'black',fh:'goat',ey:'dkbrown',top:'coverall',tc:0xe8661e,bot:'coverall',pc:0xe8661e,sh:0xf0f0f0,acc:[],note:'Escaped prisoner: buzz cut, goatee, orange jumpsuit.'},
Tarot_The_Survivalist:{e:'A',sk:'A4',b:'strong',hs:'buzz',hc:'saltpep',fh:'full',ey:'dkbrown',top:'flannel',tc:0x5a5a5e,tc2:0x2a2a2e,bot:'cargo',pc:0x4b5232,sh:0x2a2018,acc:['tactical:0x3e4630','cap:0x4b5232'],note:'Locksmith and prepper: salt-and-pepper beard, grey flannel under a tactical vest, olive cap.'},
Tarot_The_Healer:{e:'B',sk:'B1',b:'avg',hs:'ponytail',hc:'black',ey:'brown',top:'labcoat',tc:0xf2f2ee,tc2:0x2a8a8a,bot:'scrubs',pc:0x2a8a8a,sh:0xf0f0f0,acc:['stethoscope'],note:'Doctor: curly ponytail, white coat over teal scrubs, stethoscope.'},
Tarot_The_Witch:{e:'W',sk:'W1',b:'slim',hs:'long',hc:'black',ey:'green',top:'dress',tc:0x141418,bot:'longdress',pc:0x141418,sh:0x0e0e0e,acc:['witchhat','necklace'],note:'Witch (ageless): long black hair, long black dress, pointed hat.'}
};
return{TONE,HAIR,EYE,ARCH,D};
})();
