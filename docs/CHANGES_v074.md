# Mini Fort Zombie v074

## Tree trunks were inside out (fixed)
The flora layer's tube builder (`GB.tube` in `js/layers/flora.js`, used for every Modern tree trunk and branch) wound its triangles clockwise when seen from outside. The outer faces were therefore back faces and culled, and you saw the bark on the inside of the far wall of the trunk. The triangles now wind counter-clockwise from outside, so the bark is on the outside. This applies to every tree in the game: town, border, parks and lots. The cedars use the same builder and are fixed too; their boughs mostly hid the problem.

## Lots use the real trees
- New `bldTree(B, x, z, scale, {kind, dead})` in core.js plants a normal town tree (the flora oak / linden / maple / ginkgo / cherry / cedar models) at a lot's local position. The town's tree cull, which removes trees standing inside buildings, now keeps these.
- Every placeholder lot now uses them in place of the cylinder-and-ball trees: houses, large house, nursery, forests (cedars and broadleaves plus real shrubs and grass cards), town park and the Dead Park.
- **Dead Park:** the dead trees are the same models with no leaves (bare trunk and branches). Flora's `spawn` supports `spec.dead`.
- **Overhauled buildings:** Bruno's Burgerama, Aisle Be Back Church and the Inn-and-Out Motel used ball-leaf kit trees, and Cerberus Studios had one in its planter. These now plant real trees at the same spots, once per building. Their shared detail meshes only record the positions.
- The old Playground & Memorial Park builder's trees are real trees too.
- Shrubs in yards and forests use the town's bush model. Flower beds, pots and greenhouse benches use the flora flower cards.
- Dev Mode building lab: flora now runs after a lot is loaded, so its trees show there too.

## Vehicles built from the game's own models
New layer `js/layers/vehicles.js` (`MFZV.make(kind, x, z, rot, opts)`). It reuses the Modern car and truck models that already replace every `makeCar` / `makeArmyTruck` (`PF.car`, `PF.truck`), repaints them and adds equipment:

| kind | base model | changes |
|---|---|---|
| civilian | random car model and colour | same as town cars (`opts.model` / `tint` to choose) |
| taxi | sedan | yellow, lit roof sign with TAXI, checker band |
| police | sedan | black with white doors, red/white/blue light bar, POLICE 911 |
| jeep | 4x4 | olive drab, white star |
| wreck | random car | burnt-out |
| van | box truck, shortened | colour and side lettering (`opts.label`) |
| boxtruck | box truck | colour and side lettering |
| ambulance | box truck, shortened | white, red band, red crosses, light bar, AMBULANCE |
| firetruck | cargo truck | red, equipment lockers, roof ladder, hose reel, light bar, FIRE DEPT |
| army | army truck | as the expedition truck, but it can face any direction |

Each one gets a collider and a walkable top like the town cars. If Modern props are switched off in Graphics, it falls back to `makeCar` / `makeArmyTruck`.

Used in the lots: fire truck in the Fire Station bay, a taxi fleet at Quicksilver Cab Co. (and one in its garage), ambulance at the Field Hospital, army truck at the Aid Station, jeep at the Army Surplus, lettered vans at the bakery and furniture store, SUV at the campsite, wrecks and old cars in the auto body yard and the Dead Park. The police station fort's two patrol cars, a car with a red box on the roof, are now proper police cars.
The older crude box vehicles in `newlots.js` were removed.

## Tested
- 120 single-lot builds (20 lots, both facings, 3 conditions) pass `checkPlacement`.
- 8 full towns: no placement errors. About 125 lot trees per town survive the cull, and flora instanced 513 trees and bushes in 90 draw calls.
