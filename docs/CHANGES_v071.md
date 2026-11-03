# Mini Fort Zombie v071

## Main menu world
- The title, main menu, occupation, fort select and menu Options now sit over a live 3D town: a dedicated fixed-seed town (same place every launch) under the Doom sky at night.
- A scripted camera fades between six set pieces: crane down over St. Mary's with the dead milling in the street, a push-in over the cemetery wall, a worm's-eye view from the road as the dead walk towards and over you, the park corner with a legless crawler, a dolly down the main street into an oncoming crowd, and the gas station forecourt. Shots are found by building type, so a missing building just skips its shot.
- Grunge vignette (dark blotches + scratches at the edges) on top of the falling ash and embers.
- The illustrated backdrop covers the town while it builds and is the fallback. Options > Graphics > Display > Menu background switches between "Live 3D town" and "Illustrated" (saved).
- The menu world stops the moment a game, a saved game or a Dev test world starts.

## New Game: occupation screen
- New Game > Choose your occupation (9 trades from the Fort Zombie data, each with its own symbol) > Choose your fort.
- Every attribute and skill can move at most 10 points from the occupation's value. Points you take away go into a pool (one for attributes, one for skills) that is the only source for raising others. Shift-click moves 5 at a time.
- Stored in the player's skill block (with the occupation name), which save files already keep, so it survives save / load. The Skills screen shows your occupation.

## Gameplay
- Fort clearing: after the last zombie dies the game waits about 3 seconds before the Fort HQ opens, so the body hits the floor.
- Starting kits: Police Station = crowbar, 9mm pistol + 2 boxes of 9mm, combat shotgun + 2 boxes of 12 gauge. Prison / School = a random melee weapon and a random pistol with 2 boxes of its ammo.
- Zombie climbing: a hunting zombie that stops making progress because something is in the way climbs over it (hands up the face, belly over the top, drop down the far side), or stays on top if its target is up there. Works on fences, border walls, containers, cars, crates, barriers and furniture, up to about 4.4 m. Building walls, doors, windows and barricades are excluded. Zombies on top of things can walk along them and fall off the edge properly. Zombie movement now respects the height they are standing at.

## Fixes
- Floating squares in doorways: the interior-decoration pass hung framed pictures across openings it did not recognise (the fort's front entrance gap and doors slightly off the wall line). Pictures and skirting/crown trim are now only placed where a real wall stands.
- Fort front concrete barriers: the Modern jersey barrier model runs along z but was placed unrotated with a collision box along x, so each barrier pointed at the fort with an invisible wall crosswise. They now form a line across the front with collision that follows the barrier at any angle. The same model was also mis-rotated in town roadblocks; fixed.
- Grass and flowers no longer grow through the fort floor.
- Town map: pins are half size with a needle and black dot marking the exact spot; the town name always fits the cartouche (text shrinks to fit); the mission text always fits its box.
- Fort select cards show the new kits.

## Main menu music
- assets/audio/FZTrioxin.mp3 loops on the title, main menu, occupation, fort select and menu Options (js/game/menumusic.js).
- Fades out and stops as soon as you are in the game: starting a fort, loading a save, or opening Dev Mode. Starts again from the top when you return to the main menu (for example after leaving Dev Mode).
- Its own volume: Options > Sound > Menu music volume (x Master), only shown when Options is opened from the main menu. The old Music volume is now Game music volume and does not affect the menu track. The game's procedural menu notes are muted while the track plays.
- Browsers block audio until the first key press or click, so it starts on "Press any key".

## More fixes
- Trees: the border / fort cedars looked inside out because the cedar painting (boughs running across the image) was mapped across each bough card, so the boughs wrapped round the trunk in rings. It now runs along each card, so boughs point out and droop from the trunk; crowns are also fuller (9 tiers x 8 boughs).
- AR-90 iron sights: the sight line ran straight through the carry handle's top bar and the front post sat 8 mm below the rear peep, so aiming put your eye inside the model. The rear aperture now sits on top of the carry handle (larger ring, taller ears) and the front post tip is on the same line.
