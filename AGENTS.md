# Contributor handover

Read README.md and DEVELOPMENT_STATUS.md before editing. Milestones 1, 1.5 and 2 are implemented. Stop for user review before Milestone 3. Keep all continuity information in local files.

- Preserve ES modules, Vite, Canvas, and a backend-free architecture. Extend working modules rather than rewrite them.
- InputManager is the only keyboard listener owner for game controls. Keep arrows for movement, A punch, S kick, D special, W strong, Space jump, Enter confirm, Escape pause, P developer tools. No WASD movement or function-key shortcuts.
- Keep simulation in entities/engine and drawing in Renderer/UI. Character attributes belong in data definitions. Future combat must distinguish lane position, jump height, bodies and hitboxes.
- Share CharacterRenderer between gameplay and selection. Keep world positions in logical 960×540 coordinates independent of Canvas pixel size. Respect ResizeObserver and the 16:9 viewport. Cache static scenery; preserve HUD nodes rather than rebuilding DOM every frame.
- Optional artwork paths/frames/dimensions belong in data/assets.js and load through AssetManager. Always preserve vector fallback. Keep strong/special simulation state names compatible with the existing test API; render aliases strongAttack/specialAttack are supported.
- Attack presses are edge-triggered and cooldown-controlled. Clear input on transitions and focus loss.
- Damage belongs in CombatSystem/Fighter, never rendering. Each swing records contacted target IDs, including invulnerable contacts. Preserve facing, lane, height, active-window and body-collision separation. Dead actors cannot attack; hits cancel attacks and apply timed invulnerability.
- Enemy identities/tiers and attacks live in data/enemies.js; wave composition lives in data/waves.js. Roman/Seth must remain regular. Venom is a mini-boss available for developer testing, not the Stage 1 boss. Difficulty is independent of identity and stage number.
- Clear All deliberately enters developer sandbox. Select/restart a wave resumes progression. Keep developer difficulty limited to validated 0.5–2 values and manual spawns. Never save developer scores or unlock unfinished stages.
- Developer actions must use validated Game methods, never mutate through UI or test-only shortcuts. Restrict developer shortcuts to Developer Mode. Reset cheats/API when returning to normal mode; never save developer progress.
- Unsupported stages must remain visibly unavailable. Never represent previews or placeholder configurations as finished stages.
- Use data-testid for menu controls and guarded gameTestAPI for browser automation. Keep optional assets/storage failures nonfatal.
- Run npm run build and npm test after functional changes. Add meaningful behavioral checks when expanding simulation. Update DEVELOPMENT_STATUS.md with results, known limits and next steps.
- Do not push without user approval. Do not add external character assets or audio without authorization.
