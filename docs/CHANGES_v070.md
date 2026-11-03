# Mini Fort Zombie v070 - menu rebuild + Dev Mode clean-up

## Menus (all screens rebuilt)
- New look: weathered-steel panels, stencil logo, blood-red / hazard-amber accents, film grain. Fonts are bundled (assets/fonts, embedded via css/fonts.css) so it works offline.
- Title / main menu / fort select get a procedural backdrop (blood moon, skyline, watchtower searchlight, the dead at the wire, falling ash) whenever no 3D world is behind them.
- Options: side navigation (Sound, Graphics, Controls, Icons, Developer Toolkit). Graphics split into Display / Atmosphere / Image / Models / World detail. Mouse sensitivity moved to Controls. Esc goes back.
- Icons: paged tile grid with category filters (mouse wheel pages) instead of a long scrolling list.
- Fort select: three fort cards with real stats and a key reference built from your current keybinds.
- Fort HQ: header with resources, clock and system buttons; survivor roster and town map are sized to fit the screen at any roster size (cards compact automatically up to 16 survivors).
- Pause, end screen, inventory, skills and save/load dialog restyled to match.
- Checked with no overflow at 1280x720, 1366x768, 1600x900 and 1920x1080.

## Developer Toolkit
- Rebuilt as a category rail + sub-pages; each tool group has its own page and nothing scrolls. Panels added by other modules (skills, FZ config, FZ zombies, medics, model line-ups, survivors, occupation) are placed into their own pages automatically.
- FIX (desync): entering Dev Mode before starting a campaign ran every test world on the game's raw on-load state (Day 0, no starting kit, 100 HP on every fort, no skills or town map, "Siege in 14 days"). Dev Mode now creates the same fresh Day-1 campaign New Game creates, inside the sandbox. Changing the fort setting re-creates it for that fort; "Start a fresh Day-1 campaign" is on Time & Weather.
- FIX: leaving Dev Mode now also removes state keys the sandbox added and re-links the equipped weapon, so nothing leaks into the real game.
- FIX: the clock/siege box no longer shows over the Dev Toolkit or Options when no world is running.
- FIX: Day, time, health, stamina, multiplier and fort fields show the live values instead of fixed defaults.
- FIX: dev random maps are built like a normal expedition (no stale pinned mission).
- NEW: Weather page (the game has had weather since v058; the old panel still said it had none). Uses the same saved setting as Options > Graphics.
- Removed the dead single-option "Config" dropdown. Log is its own page; text reports scroll with the wheel.
