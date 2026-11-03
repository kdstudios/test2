# Mini Fort Zombie v072

## Zombie pathfinding (ported from Riposte Frontline's bots)
Riposte's bots plan a whole route with A*, shorten it by "string pulling" (walk straight to the furthest point that can be reached in a straight line), only cut a corner when the next point is in sight, and get out of jams with an escalating unstick routine. v071 zombies took one greedy 0.5 m step down the flow field per frame, so they zig-zagged, snagged on corners, walked straight into walls when hunting your last-known position, and could only jitter randomly when stuck. New layer: `js/layers/zpath.js`.
- **Routes, not steps.** A zombie that can see you reads a whole route (up to 24 m) out of the shared flow field. A zombie hunting your last-known position runs A* on the same grid. If its search budget runs out, it follows the best partial route instead of walking into a wall. The flow field stays as the shared cost map, so a siege still costs one Dijkstra and doors, windows and barricades keep their bash-through costs.
- **Straight lines and clean corners.** Routes are string-pulled with body clearance. A door, window or barricade on the route is a pinned point, and zombies still only bash what their route actually goes through.
- **Waypoints** are cut only when the next one is reachable in a straight line. Routes refresh about every 0.6 s, or sooner when you move away from the end of the route.
- **Pressed against a wall?** The route starts from the nearest free cell the zombie can walk straight to, instead of being lost.
- **Bump + unstick.** If the scenery keeps eating a zombie's steps for 0.28 s, it first tries to climb the obstacle (zclimb). If that fails it escalates: sidestep to the free side, walk back to the nearest free cell, back off and re-plan, and finally settle onto the nearest free cell.
- Zombies face where they are walking until they are close to you, and they keep coming (and climb) when you stand on top of something right above them.
- Tested on 30 random routes (15-35 m apart, line of sight blocked) in the same town, v071 vs v072 movement:
  - Hunting a last-known position: v071 reached 16/30, v072 reached 29/30.
  - Siege (shared field): 29/30 vs 28/30, same average time (about 17 s).
- `ZPATH.on=false` in the console restores v071 movement; `zpathDebug()` shows counters.

## Melee reach is 3D now
- Melee used flat map distance, so from the top of a maze wall you could hit a zombie 2.7 m below, even when the crosshair was not red (the crosshair had a height check, melee did not).
- One shared test now drives melee, the red crosshair and the corpse-gib check, so the indicator is always right. Reach is measured body to body: your swing band (knee height to just above your eyes) against the zombie's feet-to-head. A zombie more than 0.6 m below that band, or behind a wall, is out of reach.
- Player/zombie collision only applies when your bodies overlap in height, so a zombie below the wall you are standing on no longer blocks you.

## Zombie mix and speed
- Cop and army soldier zombies (the ones with guns) were 1 in 20 zombies; now about 1 in 110. Tunable via `FZ_RARE` (weights; generic = 6, other styles = 1).
- Every zombie moves 10% slower: walkers, joggers, crawlers, medics on their errands, idle wandering and the football charge (`ZSPD` in core.js).

## Football zombie: kneel, then charge
- When he decides to tackle, he drops into a kneel (one hand on the turf, forearm on the front knee, eyes up) for about 2.5 s, facing exactly the line he will run. His direction locks the moment he goes down. In the last 0.6 s he coils lower and shakes, then charges in a straight line along that direction.
- If you see him kneel, step off the line. The charge ends when it hits you, hits something (he staggers) or runs out of distance.
- Fix (same release): the kneel could face a different way from the charge. A zombie's facing set by lookAt can be stored as rotation (PI, PI-yaw, PI), and only rotation.y was being overwritten, which mirrored the facing. The whole rotation is now set, so the kneel always points where he will run.
- Friendly fire: zombies he runs through or past (within about 1.25 m) are bowled over into physics ragdolls, thrown forward and out to the side of his line. They get back up a couple of seconds later. Each zombie is hit once per charge.
- He only winds up when you are at roughly his height and in clear sight. Poses: `js/layers/ztackle.js`; state machine in `skills.js` (`FZ_TACKLE`, `bowl` = friendly-fire radius).
- The zombie legs are single rigid pieces (no knee joint), so the kneel is approximated: hips lowered, back leg trailing, front leg planted forward.

## Knockdown ragdolls (failed jumps)
- A zombie that "Fail"s a jump now trips into a real physics ragdoll (the same Riposte-ported ragdoll as deaths): it pitches forward over or into the obstacle, collides with the world and settles.
- After 1.2-3 s the body is put back together and the zombie gets up off its back or its front, whichever way it landed, facing the way its body lies, then carries on hunting.
- Killed while down, the death ragdoll takes over from the pose it is lying in. Armed zombies cannot shoot while down.
- New layer: `js/layers/zknock.js` (`zKnock(zombie, dir, magnitude, lift)` knocks any living zombie down; `ZKNOCK.on=false` restores the old canned fall).

## 75 new prop models (our own), all lootable
Every prop is our own work, built in code at load time with a new prop kit. No outside model or texture files: the original Fort Zombie models and the converter were removed from the project.
- **The set:**
  - storage and armoury: ammo crate, weapon crates and a stack of them, three cardboard boxes, two trunks, four shop shelving units, warehouse pallet racking, bookshelf, gun rack, gun cabinet, display case
  - kitchen and shops: three fridges, upright freezer, two chest freezers, three kitchen units, counter, corner counter, sink, prep table, dish station, coffee brewer, washing machine, drinks cooler, five vending machines, cash register, three dry-goods items
  - office and furniture: four desks, dresser, two coffee tables, lectern, medical cabinet, box of pills
  - fire station: firefighter locker, hose cabinet, coiled hose
  - tools and outdoors: toolbox, tool chest, workbench, jerry can, propane cylinder, hay bale, yard-sale table, shop counter, reception counter, three dumpsters
  - bodies: five searchable bodies and a pile of bodies
- **Detail:**
  - rounded edges everywhere; real hardware such as hinges, pulls, knobs, latches, screws, casters and vents
  - open interiors behind glass (snack machine coils, gun cabinet, display case, chest freezers, medical cabinet, hose reel)
  - set dressing: fridge magnets and a takeaway menu, a CRT showing an emergency notice, a typewriter with paper in it, desk clutter, stocked shelves with labelled cans and boxes, tools on a pegboard, a dish rack, a coffee pot
- **Artwork painted in code:**
  - our own brands: BLITZ COLA, POLAR POP, ZEST-O, GREEN ROCKET, SNAX ATTAX, FROSTLINE, POLARIS, COLDLINE, AQUAMAX, IRONCLAD, BREWMASTER, NORTHFIELD, PAINEX, ARCTIC FRESH
  - military stencils with worn paint, shipping labels with barcodes, control panels and displays (some lit at night), book spines, product packaging
  - grime, scratches and rust
- **Surfaces:** world PBR surfaces locked to each object (painted metal, cardboard, canvas, rough wood), plus three surfaces of our own mapped by object position: fine wood veneer, brushed stainless, smooth painted steel.
- **Bodies:** the game's own zombie characters posed lifeless (sitting slumped, face down, on the back, curled), eyes dark, on pooled blood. The police officer's sidearm, hat and radio lie beside him.
- **Performance:** each model is merged into one mesh per material (a handful of draw calls per prop) and built once, on first use. All 75 together are about 330k triangles; the heaviest, the fully stocked shelves, is about 42k.
- **In the game:**
  - `spawnPropContainer(x, z, model, table, ry, y0)` places any of them as a lootable container. Each has a label, a loot table and an item count (`MFZK.defs`, defined in `js/props/`).
  - Buildings use them automatically, with fitting models per loot table (house: fridges, dressers, kitchen units, trunks; gun shop: gun racks, crates, display case; office and bank: desks; laundromat: washing machine; gas and convenience: register, cooler, vending machines; and more).
  - A model is only placed at a facing where it hits no wall or furniture, preferring open space in front and its back to a wall; otherwise the old box prop is used. In a test town 154 of 195 containers became models (46 different), and 93% had open space in front.
  - Models longer than 2.6 m (shop shelving, racking, chest freezers, counters, dumpsters, the pile of bodies) and the wall-mounted hose cabinet are never placed automatically. They are there for the building overhaul.
  - Dev Mode > State > Props lines up all 75, static or as lootable containers, with name tags.
- **Files:** `js/props/mfzkit.js` (kit), `mfzm_storage.js`, `mfzm_kitchen.js`, `mfzm_office.js`, `mfzm_outdoor.js` (models), `js/layers/mfzprops.js` (containers, placement, Dev line-up).

## New building: Bruno's Burgerama (full block)
Replaces the old burger joint (same catalogue id `willy_burgerorium`, so lot maps and missions keep working). It is our own brand and mascot, laid out after the diner reference shots. Footprint: the full 40 x 36 m block; the building itself is 26 x 15 m.
- **Outside:**
  - Brick diner with a red standing-seam mansard roof, teal fascia and a flat roof deck with an HVAC unit.
  - Raised "BRUNO'S BURGERAMA" sign (lit at night) and a 6 m fibreglass Bruno the Bear chef on the roof (spatula raised, burger in hand, held by four guy wires).
  - 9 m pole sign topped by a giant burger.
  - Drive-thru lane: painted arrows and DRIVE THRU, menu board, speaker post, clearance bar, pick-up window with a sill shelf, PICK UP sign.
  - Rear parking lot: stalls, wheel stops, two cars and a dumpster, inside a teal board fence.
  - Front: lawn with picnic tables, trees, a shrub border, a concrete path, an entrance canopy with an OPEN 24 HOURS sign, and a sidewalk with parking meters.
- **Dining room:**
  - Red/cream checkerboard floor; mahogany panelled wainscot under damask wallpaper; drop ceiling with light panels.
  - 11 red channel-tufted booths: along the front windows, along the side windows and in an island row. Each has a wood table, a napkin dispenser, salt and pepper, ketchup, and sometimes a tray left behind.
  - Round tables with green wire chairs; condiment, straw and tray station with a THANK YOU bin.
  - Posters (GRIZZLY STACK, CUB MEAL, NOW HIRING), a clock and a wet-floor sign.
- **Counter:**
  - White tile with a black and yellow stripe and a granite top; three registers with lit order screens.
  - A bagged order on a tray with a drink, a tip jar, a PLEASE WAIT HERE sign and a staff half-door.
  - Four backlit menu boards (burgers, combos, breakfast, sides and shakes) with prices and food art.
- **Kitchen** (quarry-tile floor, subway-tile walls):
  - Flat-top grill with patties and two fryers under an extraction hood.
  - Heated burger chute with wrapped burgers; soda fountain (our drinks brands); two coffee brewers.
  - Prep island with buns, a rolling bun rack, a double reach-in fridge, a hand sink, an ice machine and a drive-thru station.
  - A walk-in freezer room with stocked shelves.
- **Rooms and doors:** men's and women's restrooms (toilets, sinks, mirrors, a urinal, a stall partition). EMPLOYEES ONLY kitchen door, back door and freezer door are real doors that open, lock and get bashed; all windows break.
- **Loot and zombies:** loot in the kitchen, the walk-in, the lobby and the dining room. 3-6 zombies inside, sometimes one in the lot.
- **Ruins:** in ruined towns it is at most looted and smashed (no structural collapse, which would leave the roof and interior floating).
- **Performance:** detail is built once and shared (about 150k triangles). File: `js/layers/burgerjoint.js`.

## New building: Nut & Bolt Gas Station (full block)
Replaces Eco Pump (same catalogue id `eco_pump`, so lot maps keep working), laid out after the reference shots with our own Nut & Bolt brand (hex-nut logo, green and blue livery). Footprint: the full 40 x 36 m block.
- **Store:**
  - Green panelled walls on a concrete-block plinth under a white fascia with blue pinstripes, with NUT & BOLT and Service Center signs.
  - Ribbon windows, glass door, back door, rooftop HVAC, vents and a satellite dish.
- **Shop interior:**
  - Beige tile floor, sage tile wainscot with blue bands, drop ceiling with fluorescent troffers.
  - Slatted-wood checkout counter with lottery stand, impulse jars, newspaper and hot-dog roller; cigarette back-bar with a TV showing an emergency broadcast.
  - Six drinks coolers, four gondolas, wall shelf, snack machine and register (all lootable prop models).
  - Soda fountain, ARCTIC SLUSH machine and coffee brewers under a FOUNTAIN DRINKS sign.
  - Wire dump-bin of footballs; posters (HAVE YOU SEEN THIS CRIMINAL?, HOT COFFEE, NUT & BOLT REWARDS); restroom.
- **Service bay:**
  - Roller shutter half up (walk-in opening), dark stained floor, tile wainscot, strip lights, BAY 1 and NO SMOKING signs.
  - A stripped sedan on jack stands with its hood up and wheels off.
  - Tyre stacks; workbench under a pegboard of tools; tool chest, wall shelving and jerry cans (all lootable).
  - Oil drums, compressor, creeper, trolley jack, drain pan and oil can.
- **Forecourt:**
  - 20 x 10 m canopy with banded fascia, logos on all four sides, ribbed soffit and recessed lights.
  - Three islands with yellow-capped columns, bollards, trash cans, squeegee buckets and towel dispensers.
  - Six double-sided pumps: lit price displays, grade buttons, card readers, nozzles in holsters, hoses, and ads.
  - A plumber's van and a sedan at the pumps.
  - Price pylon (Regular / Plus / Premium, lit).
- **Lot and sidewalk:**
  - Two propane tanks, an ICE merchandiser, a gourmet-coffee A-frame and an air / water machine.
  - Parking stalls with wheel stops; two wrecks (one burnt out) behind jersey barriers with broken glass.
  - Oil stains, cracks and a storm drain; dumpster corner behind the store.
  - On the sidewalk: bus shelter with bench and a lit ad, bus stop sign, mailbox, hydrant, no-parking sign and two double-arm street lights.
- Ruined towns: at most looted and smashed. 3-6 zombies. About 89k triangles. File: `js/layers/gasstation.js`.

## New building: Triggered Firearms & Supplies (full block)
Replaces The Trigger Guard (same catalogue id `trigger_guard`), laid out after the reference shots with our own TRIGGERED crosshair logo. Footprint: the full 40 x 36 m block.
- **Outside:**
  - Grey brick store with a stepped parapet and concrete coping; slatted metal awning over two runs of barred windows with orange blinds (lit); entrance; steel bollards.
  - Lit parapet sign, FREE CLEANING KIT banners and a store-hours / NO LOADED GUNS sign.
  - 9 m pole sign with the logo and a crosshair panel.
- **Side lot:** yellow stalls with wheel stops, a parked sedan, planter strips with shrubs.
- **Outdoor range behind the store:**
  - Hedge-faced walls, a chain-link fence with an open gate, a floodlight mast and a members-only sign.
  - Eight firing benches with lane dividers, ammo boxes and spent brass, under a beam carrying the EYE & EAR PROTECTION REQUIRED sign.
  - Silhouette targets with holes in them, a sandbag backstop and a range flag.
- **Sidewalk:** bus shelter, no-parking sign, street light, and two timber power poles with wires.
- **Shop interior:**
  - Green / white marble checkerboard floor; beige walls with a mustard band, wood chair rail and baseboard; drop ceiling with fluorescent strips.
  - Seven open-cubby wooden display counters (some glass-topped) with goods on the shelves; register counter with a till.
  - DISPLAY ONLY rifle wall (seven long guns of our own design on a slatwall); helmet and ammo-box shelving.
  - Silhouette target stands and posters (hunting season, safety first, tactical gear, CCW class, gun show).
  - Lootable display cases, wall gun racks, ammo and weapon crates.
- **Office** (behind a half wall): desk with monitor, folders and mug; swivel chair; cork board; bookshelf; papers scattered on the floor; milk crates; a dropped pistol.
- **Stock room** (STAFF ONLY): two gun cabinets, a weapon-crate stack, an ammo crate and boxes. Back doors from the office and the stock room lead to the range.
- Ruined towns: at most looted and smashed. 3-6 zombies. About 68k triangles. File: `js/layers/gunshop.js`.

## New building: Gutter Minds Bowling (full block)
Replaces Gutter Lanes (same catalogue id `gutter_lanes`), laid out after the reference shots with our own GUTTER MINDS sign (bowling ball, two pins, lettered discs, BOWLING ribbon). Footprint: the full 40 x 36 m block; the hall is 38 x 22 m.
- **Outside:**
  - Red-brown brick box with a dark plinth and a rounded teal coping; two ribbons of aluminium-framed windows under soldier courses.
  - Green barrel awning with a yellow valance on teal posts over glass double doors.
  - Rooftop sign on a steel frame with a 3D ball; rooftop HVAC units.
  - Parking meters and street lights on the sidewalk.
  - Service lot behind: stalls, patched and stained asphalt, a rusty pickup, a white van, a blue dumpster, two back doors, NO PARKING / FIRE LANE signs, DELIVERIES sign and a dirt verge.
- **Lanes:**
  - Eight maple lanes with arrows, dots, foul lines, gutters and cappings, running to pin decks with full racks of pins (some lanes with pins knocked down).
  - Masking wall numbered 1-8 with lit ad panels (our brands), pinsetter cabinets behind.
  - Four ball returns with hoods and racks of balls; overhead score monitors (one per lane) showing games in progress.
  - Green curved settees with tables and drinks; a glass-panelled rail.
- **Hall:**
  - White-painted brick walls with blue and red stripes, blue patterned carpet, exposed ceiling deck with long fluorescent fixtures.
  - Six green window booths; three house-ball racks; three arcade cabinets (ZOMBIE ZAP, PIN PANIC, STAR BOWL).
  - LANE CHECK-IN desk with register and lane sheet; SHOE RENTAL cubby wall stocked with pairs of shoes.
- **Snack bar and kitchen:**
  - Black rounded counter top on an orange base, with register, food warmers and a tray; SNACK ATTACK menu board.
  - Kitchen: fryers, flat-top, prep table under a hood, popcorn machine, coolers and an upright freezer.
- **Café and restrooms:** café tables with red gingham cloths and wooden chairs; men's and women's restrooms.
- Lootable: coolers, freezer, vending machines, staff locker, boxes and the dumpster, plus loot drops on the bowling table.
- Ruined towns: at most looted and smashed. 3-6 zombies. About 187k triangles. File: `js/layers/bowling.js` (uses the van from `gasstation.js`).

## New building: Meat & 2 Veg (full block)
Replaces The Food Library (same catalogue id `food_library`), laid out after the reference shots with our own MEAT & 2 VEG lettering (carrot and peas). Footprint: the full 40 x 36 m block; the store is 38 x 23 m.
- **Frontage:**
  - Stucco on a stone plinth; four bays of trimmed shop windows under green-striped awnings with scalloped valances, between stone pilasters.
  - Central gabled entrance tower (stone piers, stone-framed gable, lettering) over glass double doors with an hours canopy.
  - Five-globe lamp posts, parking meters, a newspaper box and two drinks machines on the sidewalk.
- **Back:**
  - White painted brick; two-bay loading dock (dock 1 shutter up, dock 2 down) with bumpers, yellow guards and diamond-plate levelers; personnel door; loading-zone signs.
  - A burnt-out box truck on a scorch mark by a burning fire barrel.
- **Sales floor:**
  - Red / cream checkerboard, grey walls over a mahogany board wainscot with a teal cap, drop ceiling with fluorescent troffers.
  - Five checkout lanes: wood-panelled counters, conveyor belts, scanners, registers, bagging wells, numbered lane lights and red stanchion ropes.
  - Our own wire shopping carts, a cart line and some tipped over.
  - Ten gondolas in five aisles, six chest freezers, seven wall coolers / freezers, four produce stands stocked with fruit and veg and price cards.
  - BUTCHER & DELI counter with a lit glass case of cuts and a scale; coffee station; SAVINGS SPREE! banner; posters; wet-floor sign.
- **Back of house** (through swing doors marked EMPLOYEES ONLY): stock room with pallet racking, pallets of flour and feed sacks, milk-crate stacks, boxes, butcher's prep table and freezers, the dock, and a restroom.
- Lootable: gondolas, chest freezers, coolers, racking, boxes, prep table, freezers, vending machines.
- Ruined towns: at most looted and smashed. 3-6 zombies. About 107k triangles. File: `js/layers/supermarket.js`.

## New building: Water Tower & Cerberus Studios (full block)
Replaces Water Tower & Kerberos Productions (same catalogue id `water_tower_kerberos`), laid out after the reference shots with our own Cerberus Studios brand (a three-headed-hound shield emblem). Footprint: the full 40 x 36 m block, asphalt throughout.
- **Water tower** (about 24 m to the finial):
  - Four battered steel legs on concrete footings with anchor bolts; ring girders and X-bracing on every face; central riser pipe with collars.
  - Tank with seams, rust streaks and PIETY / EST. 1889 lettering; conical roof with finial and vent hatch.
  - Grated catwalk with railing and brackets; caged ladder.
- **Tower compound:** weathered board fence with the gate hanging open and a DANGER NO CLIMBING sign; tyre pyramid, tool chest, dumpster, cracked and patched asphalt. Outside the fence: a burning dumpster on a soot mark and a tree in a grate.
- **Studio exterior:**
  - Grey painted brick with a concrete coping; CERBERUS STUDIOS sign between two emblem panels; storefront windows, poster, glass door.
  - Side windows with sign and emblem boards; scorch marks; rooftop HVAC and dish.
  - Smoke-stained back wall with a graffiti tag and a back door onto a striped parking lot with wheel stops.
  - Sidewalk: street lights, meters, hydrant, no-parking sign.
- **Studio interior** (a game-development studio):
  - Polished concrete floor, grey walls with a maroon base, dark drop ceiling with light panels.
  - Reception desk with the emblem, monitor and plant; illuminated logo wall; waiting sofa and glass coffee table with magazines.
  - 18 desks in pods, each with dual monitors (code editor, 3D viewport, level editor, task board, game build), keyboard, mouse, mug, figurines, tablets, notes, a PC tower and a mesh office chair.
  - Concept-art posters (VOID RAIDERS, BLADE OF THE NORTH, HOUND OF HADES, concept sheet) and a whiteboard of system diagrams and deadlines.
  - Glass-walled meeting room "THE PIT": long table, chairs, conference phone, wall screen showing a milestone review.
  - Lounge: red and grey sofas, coffee table, bean bags, foosball table, HELLHOUND arcade cabinet; kitchenette with espresso machine, microwave, snacks, sink, fridge and water cooler; blinking server rack.
  - Damage: soot on the walls, a desk on fire, scorch marks, papers everywhere, and CAVE CANEM daubed in red.
- Lootable: bookshelves, fridge, tool chest, dumpster, boxes, plus office loot drops.
- Ruined towns: at most looted and smashed. 3-6 zombies. About 143k triangles. File: `js/layers/cerberus.js`.

## New building: Aisle Be Back Church (full block)
Replaces the Church (same catalogue id `church`), laid out after the reference shots. Footprint: the full 40 x 36 m block.
- **Church:**
  - 14 x 22 m white clapboard nave on a stone plinth; dark timber buttresses with iron bands; twelve lancet windows with stone frames, stained-glass heads and leaded panes.
  - Steep dark-shingle roof with ridge cap; half-timbered gables; tri-lancet stained window (with a cross) over the altar end.
- **Tower and spire:**
  - Twin arched doors in a stone portal with AISLE BE BACK carved in the lintel; porch skirt roof; traceried gothic window; second skirt roof.
  - Open timber belfry with a bronze bell, flared spire base, 10 m shingled spire and a cross (about 30 m overall).
- **Grounds:**
  - Two giant praying-hands statues on plinths; gabled message board ("REPENT! THE END IS NIGH ... ALL SOULS WELCOME (LIVING PREFERRED)"); hedges and stone steps.
  - Side lawn with trees and picnic tables; worn path; parking lot with stalls, wheel stops and chain posts; a small graveyard of headstones and crosses behind a board fence.
  - Sidewalk: street lights, meters, a traffic signal, hydrant, no-parking sign.
- **Inside:**
  - Black / white marble floor; dark panelled wainscot under mauve plaster with string mouldings; open roof with king-post trusses, struts, purlins and boarding; two iron candle chandeliers.
  - Twenty carved pews in two banks with kneelers.
  - Raised red-carpeted chancel with brass edge: pipe organ (case, three pipe flats, keydesk), red curtains with tie-backs, four brass candelabra, altar with cloth, cross, candles and bible, pulpit, hymn boards.
  - Baptismal font; narthex in the tower with guest book, notice board, pamphlet rack.
- Lootable: lectern, trunk of hymnals, bookshelf, vestment dresser, plus church loot drops.
- Ruined towns: at most looted and smashed. 3-6 zombies. About 86k triangles. File: `js/layers/church.js`.

## Fixes to the new full-block buildings (same release)
- Ruined towns could tip an entire building's detail over. The ruin pass "overturns furniture" by rotating child groups of a building, and each new building's detail set was one such group. The detail container is now a plain object that the pass skips.
- Every new building now passes the town validator (all geometry inside its 40 x 36 m plot, in both orientations and all ruin levels). Fixed: street-light arms over the road (now over the sidewalk), the gun shop's pole sign, power pole and range wall, a burger-joint tree, a bowling-alley light, and lot stripes and asphalt at the rear edge.
- The town's automatic yard fences are no longer added around the new full-block lots, which bring their own fences and walls.

## New building: Climax Cinema (full block, two storeys)
Replaces The Aztec (same catalogue id `the_aztec`), laid out after the reference shots. Footprint: the full 40 x 36 m block; the building is 38 x 30 m and 11.5 m to the top of the cornice.
- **Outside:**
  - Brick over a band of white tile panels on a granite plinth; an ornate stepped concrete cornice with pilaster blocks; framed upper windows with sills and hoods.
  - Vertical CLIMAX blade sign ringed with bulbs.
  - V-shaped marquee: two bulb-framed letter boards on a lit canopy around a diamond-lit centre column, with a few letters missing or slipped:
    - NOW SHOWING / DAWN OF THE DEBT / BRAAAINS ON A PLANE / COMING SOON / THE WALKING DEADBEATS
    - MIDNIGHT SCREAMS / GONE WITH THE WINDPIPE / KIDS EAT FREE / (KIDS ALSO EATEN) / NO REFUNDS. EVER.
  - Eight lit poster cases of our own horror parodies (also ATTACK OF THE 50FT INTERN, CHAINSAW AT THE DMV, NIGHT OF THE LIVING DEADLINE, I KNOW WHAT YOU ATE LAST SUMMER).
  - Spilled popcorn on the sidewalk, street lights, hydrant, tow-zone sign.
  - Alley: burning barrel, blue dumpster, back door, THE END? graffiti.
- **Lobby:**
  - Purple film-reel carpet; red walls with gold base and a grid of square sconces; long light boxes; framed posters; SCREEN 1 door signs.
  - Box office with registers and a hanging TICKETS sign.
  - Concession stand: popcorn machine full of popcorn, soda fountain, nacho warmer, hot-dog roller, cups, a CONCESSIONS - NO OUTSIDE BRAINS menu board.
  - WIN THIS CAR! display behind velvet ropes; benches, plants, a BRAAAINS cardboard standee; restroom.
- **Auditorium** (full height):
  - Red walls with gold pilasters and wall speakers; stage with plank front, footlights and steps; 16 m screen; EXIT doors.
  - 12 rows of red seats in three banks (about 600 seats) on purple carpet with red aisles.
  - Two dusty projector beams from the booth ports to the screen.
- **Stairwell:** real walkable concrete switchback (two flights and a landing) with rails, from the lobby to the staff floor.
- **Upstairs:**
  - Projection booth: two film projectors (reels, lamphouses, lenses) aimed through port windows, a three-deck platter, rewind bench with reels, stacks of film cans, blinking sound rack.
  - Prop vault: stacked spare seats, a coffin, a mummy case, a giant red-eyed spider, a crate of spilled marquee letters, popcorn kernel sacks, boxes.
  - Manager's office: four CCTV monitors, open safe, filing cabinets, a plank barricade, tally marks with "DAY 32. STILL SHOWING. DON'T STOP." on the wall.
  - Staff room: lockers, sofa, kitchenette, notice board with a crossed-out EMPLOYEE OF THE MONTH (BITTEN).
  - Hall: vending machine, water cooler, extinguisher.
  - A blood trail from the booth towards the office.
- Lootable: cooler, freezer, vending machines, staff lockers, fridge, vault boxes, dumpster, plus cinema loot drops.
- Passes the town validator in both orientations and all ruin levels. Ruined towns: at most looted and smashed. 3-6 zombies. About 134k triangles. File: `js/layers/cinema.js`.

## New building: Morning Wood Hardware (full block)
Replaces Hammertime (same catalogue id `hammertime`), laid out after the reference shots with our own MORNING WOOD sign (sunrise over a log) and a giant 3D claw hammer. Footprint: the full 40 x 36 m block; the store is 38 x 19 m.
- **Outside:**
  - Red brick with a teal coping parapet; a full-length corrugated metal canopy with a ribbed fascia, end panels, soffit lights and teal steel columns over the shopfront walk.
  - Sixteen framed windows with 20% OFF posters; glass double doors.
  - On the walk: benches, bins, a mailbox, a cart corral with five carts, a parking meter, street lights.
  - Rooftop HVAC.
- **Loading yard:** two roller-shutter bays (one up) with bumpers and guides, a back door, a propane tank, a blue dumpster, a stripped wreck with its hood and a wheel lying beside it, stall lines and patched asphalt.
- **Store:**
  - Red / cream checkerboard; grey walls with a mustard band; drop ceiling with long fluorescent boxes and a central duct.
  - Four checkout lanes (wood panels, belts, scanners, registers, rope stanchions), with batteries dropped on the floor; tyre stacks.
  - Gondola aisles (lootable) with pegboard end caps of hammers, screwdrivers, wrenches and tape measures, and aisle signs.
  - Appliance wall: seven washers with price tags, seven ranges, stacks of boxed appliances (our ZAPMASTER, AQUAWHIRL, FROSTLINE, HEATWAVE brands), a TV on a stand.
  - LUMBER YARD cantilever rack of planks with plywood sheets.
  - Paint: can pyramid, tint machine, swatch wall.
  - Garden: rope coils, shovels and rakes, a wheelbarrow, sacks of top soil.
  - Camping & sports: two tents, red and blue kayaks, sleeping bags, coolers, beach and soccer balls, fishing rods.
  - SALE signs.
- **Back of house:** STAFF ONLY stock room with racking, tyres, boxes, a crate and pallet racking by the docks; office (desk with inventory screen, PC, filing cabinet, tool chest); break area with a table and tipped stools; men's and women's restrooms.
- Lootable: gondolas, low shelves, tool chest, workbench, toolbox, jerry cans, propane cylinders, pallet racking, dumpster, plus hardware loot drops.
- Passes the town validator in both orientations and all ruin levels. Ruined towns: at most looted and smashed. 3-6 zombies. About 98k triangles. File: `js/layers/hardware.js`.

## New building: Inn-and-Out Motel (full block)
Replaces the Sunshine Motel (same catalogue id `sunshine_motel`), laid out after the reference shots with our own INN-AND-OUT sun sign. Footprint: the full 40 x 36 m block.
- **Layout:** a U of single-storey lime-green clapboard wings round a grass courtyard with a concrete path: 3 rooms on the left, 4 at the back and 3 on the right (10 rooms, each a real door with a brass number plaque), plus a guest laundry and a linen store in the back corners and the office at the front of the right wing.
- **Walkways and roofs:** brick-paved covered walkways on red timber columns with plinths and caps, red fascia beams, soffit lights; hipped dark-shingle roofs with hip and ridge caps and red fascia trim; a rooftop HVAC unit.
- **Rooms:**
  - Green carpet, beige walls, ceiling light.
  - Wooden bed (headboard, footboard, pillows, coloured spread), nightstand with brass lamp, landscape picture, CRT TV with rabbit ears on a stand, lootable dresser, table and slat-back chair by the window, hanger rail; some rooms have a lootable trunk.
  - Tiled en-suite with a claw-foot tub, toilet, vanity with a stone top, and mirror.
- **Laundry:** washers and dryers, a folding table of towels and detergent, an ICE machine, a vending machine.
- **Linen store:** racks of folded linen, a housekeeping cart, a spare mattress, boxes.
- **Office:** key board with tagged keys, reception counter (lootable) with a bell, a brochure rack, a NO VACANCY neon in the window, an OFFICE sign.
- **Pool:**
  - Raised deck behind a brick wall and a chain-link fence (POOL - NO LIFEGUARD sign, steps up from the lot).
  - Drained kidney pool with tiled walls, stone coping, a ladder, a green puddle of leaves and a blue step.
  - Loungers, a striped umbrella table, gravel beds and hedges.
- **Lot and sign:**
  - Parking lot with stalls, wheel stops, oil stains and two cars; a curbed grass median with a tree; a GUESTS ONLY no-parking sign.
  - The INN-AND-OUT sign: a tall pole with a spiky sun disc, a red MOTEL banner with bulbs and a NO VACANCY plate.
- **Surroundings:** brick perimeter wall with hedges behind the wings; sidewalk with street lights, a traffic signal and a hydrant.
- Passes the town validator in both orientations and all ruin levels. Ruined towns: at most looted and smashed. 3-6 zombies. About 144k triangles. File: `js/layers/motel.js`.

## New building: Dead Weight Sporting Goods (full block, new BIG-lot type)
The old Sporting Goods Shop was a small legacy lot that the current town generator never placed. Dead Weight is added to the BIG pool as a new type (`dead_weight_sporting`), so towns can now get one. Laid out after the reference shots with our own red DEAD WEIGHT sign (with a dumbbell). Footprint: the full 40 x 36 m block; the store is 36 x 18 m.
- **Outside:**
  - Grey stucco with an orange trim band under a blue standing-seam roof band; a projecting entrance bay; a raised sign box on the roof.
  - Orange barrel awning over glass double doors; framed windows; a Little League poster.
  - A freestanding sign wall (both faces) and five-globe lamp posts.
  - Back: concrete tilt-up wall with the logo, a loading door (shutter half up) with the store van backed in, a pallet, back doors on concrete steps with wall lamps, an angled-stall concrete lot and a dumpster.
- **Inside:**
  - Blue carpet, grey plaster with a dark wood rail and base, fluorescent strips, concrete columns on wooden bases.
  - Cash wrap (L counter, register, chair).
  - Apparel: round racks and T-racks of hoodies on hangers, mannequins (two knocked over), a SONAR-MATIC 9000 "ONE PING ONLY!" poster.
  - Ball gondolas stocked with basketballs, soccer balls and footballs; wire ball bins; a shoe wall (RUN FOR YOUR LIFE).
  - The DEAD WEIGHT gym corner: two-tier dumbbell rack, bench press with a loaded barbell, plate tree, kettlebells, treadmill, and a LIFT LIKE YOU ARE BEING CHASED (YOU PROBABLY ARE) banner.
  - Outdoors: kayak rack, tents, two rod racks full of rods, tackle boxes, coolers, a FREE CLEANING KIT poster.
  - Hunting & firearms wall: display case, two gun racks, gun cabinet (gun shop loot).
- **Back of house:** STAFF ONLY stock room (shelving with boxes, crates, scattered boxes, EXIT signs, the loading door); office with desk, chair, bookshelf and restroom.
- Passes the town validator in both orientations and all ruin levels. Ruined towns: at most looted and smashed. 3-6 zombies. About 148k triangles. File: `js/layers/sporting.js`.
