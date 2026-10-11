# Development status

Current milestone: **Milestone 1 — Foundation**. Milestones 2–6 have not been implemented. Stop for approval before Milestone 2.

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
