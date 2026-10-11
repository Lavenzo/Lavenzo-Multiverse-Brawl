# Lavenzo Multiverse Brawl

4 HEROES · 8 STAGES · ONE FINAL BATTLE

Developed by Lavenzo Kai Kai. Unofficial Fan Game · Personal Hobby Project.

This is a JavaScript ES module, HTML5 Canvas and Vite hobby game. **Milestones 1, 1.5 and 2 are implemented: foundation, arcade visuals and functional enemy combat.** City Streets has four playable mixed-universe enemy waves. Stage 1 is not a finished campaign stage: its final boss is deferred. Stages 2–8 remain configuration placeholders.

## Launch

Use Node.js 22.12+ (or a compatible version supported by Vite 7).

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use a keyboard and a modern desktop browser.

```sh
npm run build
npm run preview
npx playwright install chromium
npm test
```

## Controls

Arrow keys move; A punches; S kicks; D performs a special; W performs a strong attack; Space jumps. Enter confirms menus; Escape pauses/resumes or returns from selection. Left/right choose heroes in selection. Attacks trigger once per press and have cooldowns. Specials cost 25 energy; energy regenerates. Attacks now deal damage using facing, lane alignment and jump height. Leonardo's spinning special hits both sides; Spider-Man and Cyclops have extended special reach. Jump above low melee attacks, line up with an enemy's ground lane, and press attack keys again after cooldown rather than holding them.

Bindings are centralized in `src/engine/InputManager.js`; use `setBindings()` to change them. Movement and attacks work together, including jumps. The game pauses when the browser loses focus.

## Developer mode

Choose Developer / Test Mode from the main menu. Press P to open/close tools; simulation pauses while the panel is open. Select a hero/stage, restart, restore health/energy, toggle invincibility, infinite lives, infinite energy, one-hit kill, or debug information. All these cheats now affect combat.

Spawn any implemented enemy by its name, or use quick buttons for regular Roman, elite Shredder and mini-boss Venom. Set the new-enemy difficulty multiplier between 0.5 and 2; this applies to subsequent manual spawns, not existing enemies or configured waves. Clear All enters an empty sandbox so another wave does not interrupt a test. Select/start a wave to restore progression, or skip/restart the current wave directly. The panel scrolls when needed on shorter laptop screens.

Shift+1 invincibility; Shift+2 skip stage (deferred); Shift+3 stage boss (deferred); Shift+4 restore; Shift+5 defeat regular enemies; Shift+6 previous stage (deferred); Shift+7 next stage (deferred); Shift+8 one-hit kill; Shift+9 infinite energy; Shift+0 restart stage. Deferred stage actions display a message; their buttons remain disabled. Wave navigation has its own clickable controls. Stages 2–8 cannot be started. No function keys are used.

The developer API is available as `window.gameTestAPI` only in Developer Mode or with `VITE_ENABLE_TEST_API=true`. Existing methods remain; `getEnemyCount()` counts living enemies and `isBossActive()` reports an active Venom mini-boss. The deferred Stage 1 boss operation still returns false. Added validated methods: `getEnemies()`, `getWave()`, `spawnEnemy(name, {difficulty, x, y})`, `setEnemyDifficulty(value)`, `clearEnemies()`, `selectWave(1..4)`, `skipWave()`, `restartWave()` and `setCheat(name, enabled)`. Developer mutations still require Developer Mode even when explicit test configuration exposes read access in Normal Mode. Spawn positions are finite numbers and clamped to world bounds; active enemies are capped at 18.

Normal mode removes the API and resets cheats. Normal wave completion/Game Over save best score to optional LocalStorage; developer runs cannot write that progress. No later stage is unlocked. Returning to the menu resets the run.

## Mixed-universe combat

| Enemy | Tier | Base HP | Style |
| --- | --- | --- | --- |
| Street Fighter | Regular | 42 | Punches and kicks |
| Roman Reigns | Regular | 56 | Heavy strikes; occasional Superman Punch |
| Seth Rollins | Regular | 50 | Faster strikes; occasional Stomp |
| Shredder | Elite | 100 | Blades, armor and dash |
| Venom | Mini-boss | 260 | Heavy smash, tendrils and crushing kick |

Roman and Seth have ordinary overhead health bars and no boss introduction. Venom is available for developer testing and future stages, with a dedicated mini-boss bar; he does not appear in the four normal waves. No Ninja Foot Soldier is implemented.

The four waves are Roman + Street Fighter; Seth + Roman; Shredder + Roman + Seth; Shredder + Street Fighter + Roman. Their difficulty multipliers are 0.75, 0.85, 0.9 and 1.0. The next wave waits for every living enemy to fall and a short clear transition. Defeated bodies briefly fall/fade. Three lives, short post-damage invulnerability, protected respawns, score, Game Over and retry support a complete combat loop. Finishing four waves shows **Waves Cleared**, explicitly stating that the Stage 1 boss is pending.

`data/enemies.js` separates identity/tier from health, damage, movement speed, attack speed, range, resistance, aggression, special attack profiles and difficulty scaling. Add an identity and its attack profiles to reuse the same Enemy/CombatSystem; `data/waves.js` controls composition and difficulty. The future roster lists Magneto, Apocalypse, Juggernaut, Thanos, Ultron and Darkseid as unimplemented, not selectable. Original Canvas enemy illustrations share the articulated renderer; no external sprites or audio are used.

## Architecture and assets

`engine/Game.js` owns state and validated actions; `GameLoop.js` drives capped delta-time updates; `InputManager.js` separates held input from press edges. `entities/Player.js` owns movement/animation timing. `engine/Renderer.js` composites the scene and eases the scrolling camera; `rendering/CharacterRenderer.js` draws original articulated fighters; `rendering/CityRenderer.js` caches layered nighttime city artwork. `ui/UI.js` shares the character renderer for selection previews and updates persistent HUD nodes only when values change. Character and stage definitions live in `data/`.

`entities/Fighter.js` supplies shared damage, invulnerability, hurt/defeat and knockback state; Player preserves input and jumping, while Enemy owns shared approach/attack AI. `combat/CombatSystem.js` records each target once per attack and applies damage during an active window; `engine/CollisionManager.js` separates body overlap from directional/lane/height attack checks. `systems/StageManager.js` owns the four-wave lifecycle. Rendering never drives damage.

Asset folders under `public/assets/` are ready for future images and optional music/SFX. No music or external artwork is loaded. AudioManager remains deferred.

### Replacing optional artwork

`engine/AssetManager.js` preloads paths defined in `data/assets.js`. Missing or undecodable images fall back to Canvas illustrations without blocking startup. Character frame images should face right; rendering mirrors them when facing left. Configure display dimensions and normalized foot anchors per character. Idle frames also appear in menu/selection previews.

```js
axel: {
  width: 125, height: 180, anchorX: 0.5, anchorY: 1, fps: 10,
  animations: {
    idle: { frames: ['assets/characters/axel/idle-01.png'], loop: true },
    walk: ['assets/characters/axel/walk-01.png', 'assets/characters/axel/walk-02.png'],
    punch: { frames: ['assets/characters/axel/punch-01.png'], fps: 12, loop: false },
  },
}
```

Supported visual states are idle, walk, punch, kick, jump, strongAttack, specialAttack, hurt and defeated. Existing simulation/test state names `strong` and `special` remain supported aliases. Damage now triggers hurt/defeat playback. Landing uses a short squash pose. Optional enemy frames use the same format under `assetConfig.enemies`. Change the config before launching/rebuilding; no live asset editor is provided.

Set `backgrounds.city` to a path such as `assets/backgrounds/city.png` for an optional full-world background. It is drawn across a 2400×540 world, so supply artwork at that aspect ratio. PNG frame paths are relative to `public/`, preserving the Vite/GitHub Pages base. Empty definitions keep the built-in artwork.

### Visual checks

`npm test` retains the smoke and visual suites and adds combat/lifecycle tests: directional/lane/height misses, damage for all attack types, one contact per swing, cooldowns, invulnerability, defeat, wave gating, developer spawns/difficulty, lives/retry, progress isolation and scripted cheat-free clears for all four heroes. The held-key animation smoke test clears enemies into sandbox to isolate input behavior from hurt interruption. This does not replace manual balance testing. Screenshots include hero and enemy pose atlases, selection, stage combat and Venom under ignored `test-results/`. Logical gameplay coordinates remain 960×540; ResizeObserver adjusts the main Canvas backing resolution for display size and device pixel ratio (capped at 2), while CSS preserves 16:9.

## GitHub Pages

`npm run build` produces `dist/`. Deploy that directory using a GitHub Pages Actions workflow or another static host. Vite uses a relative base (`./`) so assets work under the planned `/Lavenzo-Multiverse-Brawl/` repository path. The repository is initialized locally; no remote, commit, push or deployment is performed automatically.

Read `DEVELOPMENT_STATUS.md` and `AGENTS.md` before continuing development.
