# Mini Fort Zombie v075

## Loading screens with a zombie progress bar
New file: `js/game/loader.js`. The bar is a row of twelve shambling zombie silhouettes (three poses, our own drawing) that fill in blood red from left to right. Under it are the current step ("Building Bruno's Burgerama", "Raising the dead", "Warming up shaders" ...) and a percentage.

**Title screen**
- While the bar fills, the main menu town builds in the background behind the illustrated backdrop. "Press any key" only appears when it is done. Keys and clicks are ignored until then.
- The menu town's camera shots and the main menu music only start after that key press. Neither plays during loading.
- The menu town is still the same fixed-seed town every launch. The stepped build was checked against the old one-shot build: same 50 buildings, same conditions, same 274 trees.
- With Options > Graphics > Menu background set to Illustrated, there is nothing to build, so the bar fills quickly and "Press any key" appears.

**Mission loading**
- After the drive to the pin, the black "Loading map" screen shows the same bar while the mission town is built, then "Press any key".
- That key press (or a click) locks the mouse and the game starts at once. It no longer arrives on the pause screen, which happened because the mouse could only be locked from a key press or click.
- If the siege is due when you arrive, the old one-shot path runs, as the horde comes first.

## How it works
- `buildWorld()` is now a list of steps (`worldSteps()` in core.js): clear, survey, streets, trees, cars, plan, one step per plot (32), checks, population, fence, navigation, optimise. `town()` and `buildTownV2()` are split the same way (`townSteps()`, `buildTownV2Steps()`).
- `buildWorld()` still runs every step at once, so the Dev toolkit, the fort, the siege and other callers are unchanged.
- The loader runs the steps one per frame, so the bar can paint between them. A shader warm-up step (`renderer.compile`) comes last, so the first frame after "Press any key" does not stall.
- 3D rendering is skipped while a loading screen covers the view, which makes loading faster.
- The perf pass and the rumour missions used to wrap `buildWorld` / `town`. They now register hooks (`WB.pre`, `WB.post`, `WB.townPost`) so both build paths run them.
- `WB.prebuilt`: after a stepped mission build, `go('EXPEDITION')` skips the rebuild and does the rest as before (spawn point, companions, mission site, toast).

## Tested (headless browser)
- Title: a key pressed during loading is ignored; the bar runs 0 -> 100% with plot names; after the key the menu opens, the menu town camera starts and the music plays.
- Mission: the bar runs 0 -> 100%, the mission site is placed, there are no placement errors and the mouse is locked after the key.

---

# v075 update (same version)

## Main menu music
- The track starts **1 second after** the title's "Press any key", at full volume. The fade-in from silence (which swallowed the first few seconds) is removed. Returning to the menu also starts at full volume.

## Loading screens no longer move
- Title: the bar and "Press any key" share one fixed slot (`.zlSlot`) that is in the page from the first paint. Their styles moved from script-injected CSS into `css/ui.css`. Measured: one layout from first paint to ready.
- Mission: the overlay is absolutely positioned. Its "Loading map..." heading uses exactly the same style and position as the drive's fade text (measured identical to the pixel), so the text does not jump when the overlay takes over. The bar sits below it and "Press any key" below that, all fixed.

## Stray trim and vines (architecture layer)
The decoration pass placed cornice bands, plinths, quoins and ivy along each building group's *declared* footprint. For the full-block buildings that footprint is the whole 40 x 36 plot (their walls are inside it). For open lots (car lot, parks, forests, aid station...) it is a 38 x 34 yard with no walls. So trim and ivy appeared along plot edges and in open ground.
- Bands, plinths and quoins are now only built along runs where a real wall stands (`wallRuns` / `wallAt`, the collision-based wall test already used for interior trim). Ivy clusters need a real wall under every leaf.
- Groups with no height (open lots) are skipped entirely.
- Same seeded town, measured before the world merge: ivy off any wall went from 230 to 0, and trim pieces off any wall from 134 to 16. The remaining 16 are door-frame posts beside real doors.

## Armed zombies aim before they fire
Cops and soldiers no longer shoot the moment they see you. With a target (you, or a survivor) in sight and range they:
1. stop where they are and turn to face the target,
2. raise the gun (upright stance, gun arm pointed at the target, other hand supporting) and paint the target with a **red laser sight** that brightens as the shot comes and flickers in the last half second,
3. fire after ~2.5 s (2.1-2.9 s), **only if the target is still in view**.

Getting out of view (behind a wall or round a corner) for a quarter of a second cancels the shot. Staggering, knocking down or hurting the zombie also cancels it. Range is down from 24 m to 14 m. Tunables: `FZ_AIM` (skills.js); pose and laser: `js/layers/zaim.js`.
Tested: open sight, aim at 0.6 s and fire at 3.6 s; wall dropped in at 1.25 s, aim cancelled at 1.45 s with no shot; from 18 m, no aim until it had walked inside 14 m.

## Shoot and melee doors
- Bullets and melee blows now damage doors, using the same hit points the zombies bash through. The door shakes on every hit, the hit read-out shows "DOOR 64%", and at 0 it comes off its hinges like a zombie break-in.
- **Locked doors are tougher:** 110 hp instead of 50, for zombies too.
- Tested: 5 pistol shots break an unlocked door; a locked door took 16 crowbar swings.

## Small fix
- `lock()` no longer throws an unhandled error when it is called without a key press or click (the mission start); the loading screen's key press does the lock.
