# Mini Fort Zombie v073

## Every zMissionMapDB lot type now has a building
20 new lot types, so everything the original MissionMap names can appear in a town. They are **placeholders** built with the v036 kit (the same simple builders the remaining old lots use), ready to get the full-detail treatment one by one. Combined MissionMap lots are split into half-plots (Firehall_Boutique -> fire hall + Fancypantz; business_butcher_bakery -> bakery + Gein's; the Res_Double lots -> two houses).
New layer: `js/layers/newlots.js` (loaded after `sporting.js`).

**Half-plot (20 x 36 sub-plot, 16 x 22 building)**

| id | name | from zMissionMapDB | loot |
|---|---|---|---|
| `small_house` | Small House (single storey) | Res_Double_SnS / MnS, Res_3S_* | house |
| `medium_house` | Medium House (two storey) | Res_Double_MnM2-5, Res_2M_CornerN, res_001 | house |
| `fortified_house` | Fortified House (boarded windows, sandbag line, wire, KEEP OUT, rain barrels, garden) | the *_Fort lots | house + warehouse |
| `fire_hall` | Fire Station No. 9 (open apparatus bay with an engine, watch office, dorm, kitchen, hose tower) | Firehall_Boutique | fire |
| `vet_clinic` | Paws & Claws Veterinary (waiting room, exam, surgery, kennels, pharmacy, dog run) | VetClinic, VetClinicAlt | vet |
| `bakery` | Rise & Shine Bakery (shop with display cases, bakehouse with ovens) | business_butcher_bakery | bakery |
| `army_surplus` | Boots & Bullets Army Surplus (sandbags, camo net, jeep, stock room, shipping container) | Army_Surplus_Damaged | surplus (new) |
| `diner` | Moonlight Diner (booths, counter + stools, jukebox, kitchen, neon) | Diner_Damaged | diner |
| `furniture_store` | Comfy Castle Furniture (showroom, warehouse, loading bay with a box truck) | furniture_corner | furniture (new) |

Houses use the proven legacy two-storey house builder (`bHouse`), with front lawn, path, driveway and car, mailbox, shrubs, back yard, shed, washing line and grill added around it.

**Full-plot (40 x 36)**

| id | name | from zMissionMapDB | loot |
|---|---|---|---|
| `large_house` | Large House (ranch house, garage with car, pool, patio, swing set, shed) | Res_Large_Corner(_01) | house |
| `auto_body_shop` | Bent Fender Auto Body (3 open bays with lifts, office, wreck yard) | autobody_shop | auto |
| `forest_a` | Hollow Pines (woods, hunting cabin, deer stand, woodpile) | Forest01, mission_weapons_forest | barn |
| `forest_b` | Campsite Woods (woods, tents, fire pit, stream + footbridge, parked SUV) | Forest02, mission_survivors_Forest02 | park |
| `aid_station` (max 1) | Emergency Aid Station (parking lot: medical / supply / command tents, jersey barriers, water tank, generator, truck) | ParkingLot_Aid_Station_Corner | aid (new) |
| `field_hospital` (max 1) | Field Hospital (playground: ward / triage / pharmacy tents, helipad, ambulance, body bags, swings + slide) | Playground_Corner_Field_Hospital | clinic / aid |
| `cab_depot` (max 1) | Quicksilver Cab Co. (rows of taxis, dispatch office, garage, fuel pump) | ParkingLot_Yellow_Cab_Corner | auto |
| `plant_nursery` (max 1) | Green Thumb Garden Centre (glass greenhouse, shop, rows of pots, soil pallets) | plantnursery_corner | nursery (new) |
| `skatepark` (max 1) | Drop Zone Skatepark (half pipe, quarter pipe, fun box, rails, ledges, skate shop) | skatepark_Corner | park |
| `town_park` (max 1) | Town Park (pond, gazebo, fountain, benches, picnic tables, flower beds) | Park, park_corner, mission_survivors_park | park |
| `dead_park` (max 1) | Dead Park (dead grass and trees, murky pond, mass grave with bodies, burnt car, warning sign) | Dead_Park | park |

The id is `town_park`, not `park`: the game skips buildings whose type is `park` for missions and NPCs.

## Town generator
- Catalogue entries can carry `max` (1-3, default 2) and `min`. MaxCount 1 lots in zMissionMapDB get `max: 1`. That covers the new ones above plus Church, Cemetery, Water Tower, Corn Maze, Krasche & Burns and Playground.
- Houses are guaranteed: small and medium house at least 2 each and the large house at least 1 (each up to 3). Towns now hold about 9-10 homes, since Survivors rumours want a house 70% of the time.
- There are 19 half-plot types now, so a town has 10-12 two-building plots (was 8-10). That makes 42-44 properties per town.
- `validateNewCatalogue` now checks for at least 10 half-plot and 17 full-plot types (layers add more), and checks `min`/`max`. It runs again after `newlots.js` loads.
- Dev Mode building list: the new lots and Dead Weight Sporting now appear after the original new catalogue (they were missing because they were added after the list was built).

## Rumour missions target the right buildings
`fzCands` (skills.js) mapped zMissionMapDB lot names to the quarantined legacy catalogue ids (`gun_shop`, `pawn_shop` ...), and the house check looked in the legacy catalogue too. Nothing matched, so every rumour picked a random building. A new table, `FZLOT2NEW`, maps lot names to the generator's ids. A lot can name two buildings: Bank_DocOffice gives the bank and the clinic, and Firehall_Boutique gives the fire hall and Fancypantz. The house check now uses NEWCAT.

## Fix
- Piety Medical Clinic: the parked car poked 10 cm past the plot and tripped the town validator in about half of towns (moved 0.4 m back).

## Tested
- Each of the 20 new lots was built alone, facing both directions in all three conditions (120 builds), and passed the game's `checkPlacement` (geometry inside the plot, front facing the street).
- 14 full towns: all 32 plots populated, no placement errors, no max count exceeded, and all 48 building types appeared. Rumour candidate pools contain only the matching lot types.
