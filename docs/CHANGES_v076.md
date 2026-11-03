# Mini Fort Zombie v076: bug cleanup

The version is 076 in the page title, both version labels and `VERSION` in core.js.

## 1. Crawlers: floating red ball and skirt
- Some extra parts hang directly off a zombie's root instead of its body: the red blood ball, skirts and dress hems, and accessories.
- When a zombie became a crawler, its body lay down and those parts stayed where they were, floating.
- New `crawlKids()` in core.js moves them onto the body. This happens when the leg is lost (before the knock-down ragdoll) and again at every crawl pose, so they go down with the body.
- Tested on 8 outfits, including the black dress: nothing is left on the root.

## 2. Cop / army zombies
- **Losing sight of the target:** the shot is cancelled as before. The zombie then charges the target's last known position to fight in melee. It aims again as soon as it can see the target.
- **No gun arm:**
  - A zombie that spawns without its gun arm gets no gun.
  - A zombie that loses its gun arm drops the gun mid-aim.
  - In both cases it can no longer aim or shoot.
  - Tested: an army soldier with his arm shot off has no gun and no target.

## 3. Roofs on ruined and looted buildings
- Roofs are no longer tilted.
- In a ruin, the roof is removed instead. Only the top roof pieces are removed, so upper floors remain.
- Overturned furniture is turned on the spot instead of being tipped into the air.

## 4. Doors
- **Collision:** a door always collides.
  - Closed: the doorway box.
  - Open: a box on the open leaf.
  - Opening moves the collision from one to the other. Closing pushes you out of the doorway.
- **Swing direction:** a door swings away from whoever opens it, unless a wall is in the way.
- **No ajar doors:**
  - Doors are either closed or fully open, with no crooked angles. In a test town: 175 doors, 0 at a partial angle.
  - Ruined buildings now have their doors either removed or fully open.
  - Press E on a closed door to swing it open.
- **Animation:** the swing eases in and out instead of snapping. The shake when a door is hit is smaller.
- **Zombies:** the navigation grid treats an open leaf as a wall, so zombies walk round it. If an open door is in the way of a target, they attack it like any other door.

## 5. Climbing
- Zombies climb onto cars, low walls and open ledges.
- They don't climb onto solid structures such as skatepark ramps and ledges. Building walls stay unclimbable.

## 6. Weather
- With weather set to Auto, every mission map rolls its own weather when it loads, instead of one per day.
- 40 rolls gave clear 12, overcast 10, storm 8, sandstorm 5, fog 4, snow 1.
- The menu town is unaffected; it still uses the fixed seed.

## 7. Foliage by weather
Flowers, bushes, grass and tree leaves change with the weather and ease in when it changes:
- **Snow:** 80% desaturated.
- **Sandstorm:** 50% desaturated.
- **Doom:** 85% desaturated and darkened to 55%.

## 8. Water tower
- The tank now reads PIZZA and EST. 1969.

## 9. Floating props and containers
- Every loot container in all 48 building types (3 conditions each) was tested by casting a ray down from its base.
- **Gun racks** (Gun Shop, Sporting Goods) stood 1.1 m off the floor. They are floor-standing and now stand on the floor.
- **House yards** (newlots): yard containers were placed at the house's floor height. They are now on the ground.
- After the fixes, no container floats.

## 10. Dev Mode > Building > Test worlds (new tab next to Inspector)

| Button | World |
|---|---|
| All props | All 75 prop models, lootable, each labelled |
| All models | 15 vehicles: every kind (taxi, police, jeep, wreck, van, box truck, ambulance, fire truck, army) and the civilian car in all 6 bodies. 36 street props and clutter (benches, dumpster, bins, lamps, AC unit, generator, bicycle, moped, forklift, fountain ...). Every tree kind, a dead tree, bushes and a street light. All labelled. |
| All survivors | Every named survivor and every base persona, with name tags (static models) |
| All zombies | Every outfit (51) plus walker, runner and brute, each labelled, alive with AI off |
| AI test areas | See below |

**AI test areas:**
- A wall to walk round.
- A room with only a window.
- A room with only a door.
- An upper floor with stairs, with one zombie upstairs and one below.

**Zombies in the test worlds:**
- They can be shot, hit, dismembered and killed. They stand still until you press **AI on / off**.
- **Give all weapons + ammo** is on the same tab.

**Pathing results (tested):**
- With AI on, the wall zombie walked round the wall.
- The window zombie broke the window and climbed out.
- The door zombie broke the door down.
- The upstairs zombie walks to the railing nearest you instead of taking the stairs. Upper-floor navigation is the next pathfinding job, and this area is where to work on it.

## 11. Diagnostic HUD in normal play: F8
- F8 toggles the diagnostic HUD and coordinates at any time, with Dev Mode off. The setting is remembered.
- It is mentioned only in the overlay's name: Dev Mode > Overlays > "Diagnostic HUD + coordinates (F8)".

## 12. Fire
New files:
- `js/layers/fire.js`
- `js/data/fire-tex.js` (your 23-frame strip, packed as WebP)
- the original strip, kept in `assets/fx/`

Every orange-cone placeholder is replaced (Cerberus Studios, the cinema and the supermarket).

**Flames:**
- The flames are the animated flipbook on quads that turn to face you, turning only round the vertical so they never tip.
- Each fire has two layers: an additive glowing core and a softer body.
- Every fire starts on its own frame and runs at its own speed.
- A wide fire, such as a dumpster, is several overlapping flames.

**Glow and light:**
- Each fire has a flickering halo and a warm pool of light on the ground.
- One real flickering point light follows the nearest fire within 28 m. With only one light, shaders never recompile.

**Cost:** one shared texture and a few quads per fire. Fires don't collide or block shots.

## Tested (headless browser)
- Full mission towns build with no placement errors and no script errors. The town validator now ignores a fire's glow pool spilling over a plot edge.
- All five test worlds load. With AI off, test zombies don't move. Killing one works.
- Fire rendered in a test scene. The flipbook now starts decoding as soon as the game loads.

## v076 update

### 13. Floating solar heaters and AC units (fixed)
- **Cause:** the rooftop units (AC, solar heater, water tank, dish, antenna) and the wall AC units were placed on each lot's nominal box (width x depth x height from `mk()`). The real building is often different: a lower or pitched roof, a roof removed in a ruin, a recess or porch. Units then hung in the air.
- **Roof units:** `js/layers/props.js` now casts rays at the building's own meshes. A roof unit is placed only where all four corners of its footprint land on the same flat roof, within 1.5 m of the roof height, and sits on that surface.
- **Wall AC units:** one is placed only where an outward-facing wall covers the whole unit, and it is mounted on that wall.
- Where no surface is found, the unit is left out.
- **Test town:** 64 roof units and 42 wall units were placed on real surfaces, and 137 had nothing to sit on and were left out.

### 14. Stamina exhaustion
- When sprinting drains stamina, the stamina bar turns grey and you can't sprint while it refills. At 50 it turns green again and sprinting works.
- **Tested:**
  - The bar locks at 5 and goes grey.
  - It refills while locked, unlocks at 50 and goes green.
  - Sprinting resumes after that.
