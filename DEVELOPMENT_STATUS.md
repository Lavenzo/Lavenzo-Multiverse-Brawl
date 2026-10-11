# Development status

Current milestone: **Milestone 2 — Multiverse enemy roster, AI and combat**. Milestones 1, 1.5 and 2 are complete within their stated scope. Stop for user review before Milestone 3. City Streets has four playable waves but no final stage boss; the full campaign is not complete.

## Milestone 2 completed functionality

- Configurable Street Fighter, Roman Reigns and Seth Rollins regular enemies, Shredder elite, and Venom mini-boss. Roman/Seth are ordinary repeatable enemies with no boss introduction/bar or excessive resistance. Ninja Foot Soldier is absent.
- Identity/tier independent of health, damage, movement speed, attack speed, range, knockback resistance, special profiles, aggression and difficulty. Future powerful names are unimplemented roster metadata only.
- Shared approach/attack AI with readable windups, cooldowns and varied attack sequences: Roman Superman Punch, Seth Stomp, Shredder blade/dash, Venom smash/tendril/kick. Enemies react to hurt/knockback and cannot attack after death.
- Player A/S/W/D attacks inflict different damage during timed active windows. Direction, horizontal range, ground lane and vertical height are validated separately from body overlap. Each swing records contacts once, including invulnerable targets; no animation-frame damage spam.
- Health bars, short damage invulnerability, hurt interruption, knockback, fall/fade defeat animations, special energy costs and regeneration. Leonardo special has radial reach; Spider-Man/Cyclops have extended special reach.
- Four configured normal waves exactly match the requested roster. Difficulty multipliers 0.75/0.85/0.9/1.0; next wave waits for all living enemies to fall. HUD shows wave/enemy count. Venom remains a developer/future-stage option.
- Three lives, protected respawn at the defeat location, scoring, Game Over/retry, and a Waves Cleared screen explicitly deferring Stage 1's final boss. Normal runs save best score only; no unfinished stage unlocks.
- Original articulated enemy illustrations preserve Milestone 1.5 rendering: distinct wrestler attire/hair, bladed armor, larger muscular Venom silhouette. Actors are sorted by ground lane; Venom has a dedicated mini-boss bar.
- Developer name/tier spawn controls, 0.5–2 difficulty for subsequent manual spawns, clear-all sandbox, selected wave/skip/restart, restore, working invincibility/one-hit kill/infinite lives/infinite energy. Existing controls, API methods and ordinary shortcuts are retained.
- Test API adds validated enemy/wave operations and snapshots. Normal mode removes it and resets cheats; developer scores/progress cannot be saved. No new dependencies, external artwork or music.

## Milestone 2 files changed

- Added src/data/enemies.js, combat.js and waves.js; entities/Fighter.js and Enemy.js; engine/CollisionManager.js; combat/CombatSystem.js; systems/StageManager.js; tests/combat.spec.js and lifecycle.spec.js.
- Extended existing Game, Player, Renderer, CharacterRenderer, AssetManager, asset config, stage metadata, UI and CSS. Preserved input mappings and the existing loop/viewport/city/hero art.
- Updated README, AGENTS and this document. Existing smoke test assertions are preserved; added clear-all sandbox isolation to the held-key/input test because real enemy hurt interruption is now expected behavior.
- No Git commit/history rewrite/push/deployment. Saved Milestone 1 checkpoint remains intact; Milestone 1.5 working files were preserved and extended.

## Milestone 2 validation

- Final npm run build: passed (Vite 7.3.7, 25 modules transformed).
- Final npm test: **12 passed in 21.3 seconds** across original smoke/visual suites and focused combat/lifecycle suites.
- git diff --check: passed; saved checkpoint remains 4fdabcd. No known critical defects found in the tested scope.
- Deterministic checks cover player punch/kick/strong/special damage (Axel 28/35/50/63), direction/lane/height misses, radial special, one contact per swing, enemy approach/cooldown/patterns, invulnerability, knockback, enemy defeat and wave gating.
- Live Playwright controls verify named spawns, tier buttons, difficulty, keyboard damage/energy use, Venom activation, wave selection/restart/skip, retry, invalid operations and developer progress isolation.
- Scripted normal combat simulations (no cheats) clear all four waves with every hero and produce the configured 1420-point score. This is a balance baseline, not a substitute for manual play feedback. Life loss/Game Over/retry and infinite-lives isolation are also simulated.
- Existing four-hero menu/input/jump tests and four desktop/laptop layout sizes continue passing. Normal gameplay capture tests report no critical page/console errors; the optional-asset test intentionally requests a missing image.
- Reviewed enemy pose atlas, Venom gameplay capture, mixed-wave-3.png and developer-combat.png for silhouette, scale, health bars and usable controls. All screenshots remain under ignored test-results/ and are regenerated by npm test.

## Milestone 2 known limitations / next task

- Stop for user review. After approval, Milestone 3 should add Street Enforcer and the complete Stage 1 boss/victory flow; Roman must not become the boss. Stages 2–8 and future powerful character mechanics remain unimplemented.
- AI is a shared deterministic melee/pattern controller, not sophisticated tactical planning. Seth alternates faster strikes/kicks and occasional Stomp; there is no multi-contact-per-swing damage or grab system.
- Attacks use lane-aware horizontal reach plus height checks, rather than limb-shaped polygon hitboxes. Decorative city props have no obstacle collisions. No ranged-enemy projectile class yet; Venom tendrils and hero extended specials are immediate active-window attacks.
- One dedicated mini-boss HUD bar displays the first active Venom; multiple spawned mini-bosses still have individual overhead bars. Active enemies are capped at 18.
- Difficulty UI changes subsequent manual spawns only; wave difficulty remains configured in data/waves.js. Clear All intentionally stops automatic waves until one is explicitly selected/restarted.
- Stage navigation/Stage 1 boss buttons remain disabled and their shortcuts report deferred functionality. Wave controls work independently.
- Artwork remains original vector-style prototype illustration. No audio/touch controls. Cached scenery and existing responsive rendering are preserved; broad laptop performance benchmarking remains future work.

## Milestone 1.5 historical record

## Milestone 1.5 completed improvements

- Original reusable articulated Canvas illustrations replace the geometric player and selection placeholders. Axel has blond hair, white shirt, blue trousers, red headband/gloves; Leonardo has a shell, blue mask and dual swords; Spider-Man has a red/blue suit with mask/web details; Cyclops has a blue/yellow suit and red visor.
- Fighters stand approximately 175 logical pixels tall instead of approximately 90. Shared rendering maintains scale between heroes; selected previews are larger and brighter than unselected previews.
- Idle breathing, alternating walking limbs, timed punch extension, extended kick, tucked jumping legs, brief landing squash, distinct strong attacks and character-specific special effects. Hurt recoil and defeat fall rendering are prepared; they are not damage-triggered until combat exists.
- Arcade selection/menu presentation with full-body previews, mouse/arrow selection, selected highlight, fighting style, health/speed/attack values and special name. Compact page framing emphasizes the 16:9 playfield.
- Cached nighttime city layers: moon/star sky, parallax skyline, brick storefronts, neon signs, windows, doors, awnings, fire escapes, street lamps, bins/hydrants, parked car, curb, road markings, crosswalk, drainage grates and subtle puddles/scanlines.
- Smooth delta-time camera following, fixed logical world coordinates, safe movement boundaries, independent ground shadows and airborne rendering.
- ResizeObserver-managed Canvas backing resolution with device-pixel-ratio cap and preserved CSS aspect ratio.
- AssetManager and centralized data/assets.js support optional individual PNG animation frames, dimensions, anchors and a full-world city background; missing assets retain the Canvas fallback. Idle replacement frames also render in selection previews.
- HUD uses persistent elements and throttled changed-value updates instead of replacing its DOM every frame. Static scenery is cached rather than reconstructed every frame.
- Existing Developer Mode, API methods, control mappings and smoke tests are preserved. Player snapshot adds facing as an additive field.

## Milestone 1.5 files modified

- Updated src/engine/Renderer.js and GameLoop.js, src/entities/Player.js, src/data/characters.js, src/ui/UI.js and src/styles/main.css.
- Added src/rendering/CharacterRenderer.js, src/rendering/CityRenderer.js, src/engine/AssetManager.js, src/data/assets.js and tests/visual.spec.js.
- Updated src/engine/Game.js only for preview messaging and the additional snapshot facing field.
- Updated README.md, AGENTS.md and this status document. No dependencies added; original tests/smoke.spec.js remains unchanged. No commits, history rewrites, pushes or deployments performed. Milestone 1 checkpoint remains 4fdabcd.

## Milestone 1.5 validation

- npm run build: passed, Vite 7.3.7, 17 modules transformed.
- npm test: original two smoke tests plus three presentation/asset tests pass (five total).
- Verified all four selections and gameplay rendering; arrow movement, left/right facing, movement boundaries, moving jumps, A/S/D/W states, cooldown/held-key suppression, pause/resume, developer controls, debug overlay and normal-mode API/cheat isolation.
- Layout checks passed at 1280×720, 1366×768, 1920×1080 and 1024×768: no horizontal overflow, selection cards/start button inside the overlay, start button on screen, 16:9 Canvas geometry maintained after resizing.
- Optional PNG tests verify successful loading, concurrent-load deduplication, configured display size and missing-image fallback. The test intentionally requests one missing asset; standard gameplay captures recorded no browser page/console errors.
- Reviewed generated screenshots for all four heroes, selection, specials, scrolling and jumps, plus the nine-state/four-hero pose atlas. Review prompted refinements to strong attacks, hurt/defeat poses and clearer stat labels.
- Screenshots live under ignored test-results/: selection-<resolution>.png, city-<hero>.png, special-<hero>.png, city-scrolling.png, city-jump.png and pose-atlas.png. npm test regenerates them.

## Remaining visual limitations

- Artwork is original vector-style prototype illustration, not production pixel-art sprites. Heroes share an articulated skeleton, though costumes, weapon details and attack effects differ.
- Selection previews are static idle poses; gameplay poses animate. Hurt/defeat art is prepared and visually checked, but actual damage and defeat lifecycle belong to Milestone 2.
- City props are decorative and do not obstruct movement. Stage backgrounds beyond City Streets remain unfinished.
- Desktop/laptop keyboard play is validated. Small mobile viewports may scroll the selection overlay; no touch controls are implemented.
- The renderer targets 60 FPS using requestAnimationFrame, cached scenery and limited HUD updates. Performance has not been benchmarked on a range of ordinary laptops.

## Next task after review

Wait for user review/approval of Milestone 1.5. Then implement Milestone 2 using the preserved engine: lane-aware directional hitboxes, reusable enemies, damage, hurt/defeat timing, knockback and invulnerability. Preserve the current artwork/optional-asset path and add combat behavioral tests before building Stage 1 waves/bosses.

## Milestone 1 historical record

## Completed

- Vite project in workspace root; local Git initialization and ignores.
- Main menu, keyboard/menu confirmation, four configured heroes and character selection.
- Canvas City Streets placeholder environment, parallax scrolling, distinct hero colors and geometric poses.
- Arrow movement with normalized diagonals, directional facing, moving jumps, A/S/D/W attack animations, cooldowns and once-per-press input.
- Special energy expenditure/regeneration; pause/resume and automatic focus-loss pause.
- Basic developer panel, hero/preview selection, restart, restore, cheat flags, infinite energy, debug overlay and Shift+digit routing.
- Guarded test API; unavailable stages/actions return false; normal mode removes API and resets cheats.
- Eight-stage configuration with explicit incomplete status; optional LocalStorage scaffold and future asset directories.

## Pending / limitations

- Milestone 2: collision/hitboxes, combos, damage, hurt/defeat poses, enemy AI and knockback. Current attacks are animations only.
- Milestone 3: actual Stage 1 waves, Street Enforcer, health loss, lives, scoring, victory, Game Over and retry.
- Milestone 4: functional combat-dependent developer commands. Their buttons are currently disabled and shortcuts report unavailable. Cheat flags for damage/lives have no effect until combat exists.
- Milestone 5: playable stages 2–8, progression and final victory.
- Milestone 6: optional AssetManager/AudioManager, external frame loading and audio transitions. No audio generated or downloaded.
- HUD score/lives are initial placeholders. No campaign progress earned or saved. Stage 1 is a preview, not complete.

## Files changed

Created root package/config/HTML/ignore/docs, src/main.js, engine Game/GameLoop/InputManager/Renderer, entities/Player, data characters/stages, systems/ProgressManager, ui/UI, styles/main.css, Playwright config/tests, and public asset folder markers. npm install creates package-lock.json.

## Validation

- `npm install`: completed; audit reported zero vulnerabilities.
- `npm run build`: passed (Vite 7.3.7, 13 modules transformed).
- Initial `npm test`: browser launch blocked by missing Chromium executable; installed Playwright Chromium with `npx playwright install chromium`.
- Final `npm test`: **2 passed**. Browser checks cover all four hero selections, normal-mode API/shortcut isolation, pause/resume, arrow movement, moving jumps, A/S/W/D animation states, held-key suppression, developer menu, disabled boss control, invalid stage rejection, debug overlay, Shift+1 and cheat reset.
- Inspected full-page Chromium screenshot (`test-results/foundation-preview.png`, ignored by Git): canvas/HUD/control strip/footer layout rendered correctly at desktop size.
- No known critical defects found in exercised Milestone 1 flows. Mobile layouts and real combat are not validated; keyboard desktop play is the target.

## Next recommended task

After explicit user approval, implement Milestone 2 using the existing Player and engine state ownership. Add a reusable Enemy and CombatSystem with directional, lane-aware hitboxes and meaningful automated damage/cooldown checks before building Stage 1 encounters.
