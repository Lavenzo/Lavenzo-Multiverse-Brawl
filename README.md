# Lavenzo Multiverse Brawl

4 HEROES · 8 STAGES · ONE FINAL BATTLE

Developed by Lavenzo Kai Kai. Unofficial Fan Game · Personal Hobby Project.

This is a JavaScript ES module, HTML5 Canvas and Vite hobby game. **Milestones 1, 1.5, 2 and 3 are implemented: foundation, arcade visuals, enemy combat and the Stage 1 boss.** City Streets (Stage 1) is a complete stage. It has four playable mixed-universe enemy waves, then a boss warning, Kingpin's entrance, the boss fight and a STAGE 1 CLEARED screen. Stages 2–8 remain configuration placeholders.

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

The **Stage 1 Boss / Kingpin** section tests the boss without replaying the waves. It shows Kingpin's live health, phase and the encounter phase.

- **Jump to Boss Encounter** (Shift+3) restores the player and plays the full warning → entrance → fight sequence.
- **Spawn Kingpin Now** starts the fight immediately, with no intro, and keeps the player's current health.
- **Restart Boss Fight** gives a fresh Kingpin and a restored player, with no intro.
- **Defeat Boss** knocks Kingpin out through the normal damage path, so the KO and STAGE 1 CLEARED flow plays.
- **Set Kingpin HP** accepts whole numbers from 1 to his maximum. Going to 50% or below triggers his rage phase.
- **Return to Stage 1 · Wave 1** restarts normal Stage 1 progression.

Restore health and Invincibility remain in the cheat grid. Kingpin also appears in the enemy dropdown as a sandbox spawn that uses the difficulty field. Only the encounter Kingpin clears the stage, and developer clears never save.

Shift+1 invincibility; Shift+2 skip stage (deferred); Shift+3 Stage 1 boss encounter; Shift+4 restore; Shift+5 defeat regular enemies; Shift+6 previous stage (deferred); Shift+7 next stage (deferred); Shift+8 one-hit kill; Shift+9 infinite energy; Shift+0 restart stage. Deferred stage actions display a message; their buttons remain disabled. Wave navigation has its own clickable controls. Stages 2–8 cannot be started. No function keys are used.

The developer API is available as `window.gameTestAPI` only in Developer Mode or with `VITE_ENABLE_TEST_API=true`. Existing methods remain; `getEnemyCount()` counts living enemies, and `isBossActive()` reports an active mini-boss or boss.

- **Enemy and wave methods:** `getEnemies()`, `getWave()` (now with `phase`), `spawnEnemy(name, {difficulty, x, y})`, `setEnemyDifficulty(value)`, `clearEnemies()`, `selectWave(1..4)`, `skipWave()`, `restartWave()` and `setCheat(name, enabled)`.
- **Boss methods:** `getBoss()` returns the encounter phase plus Kingpin's health, enraged flag, state, AI state and current attack. `spawnBoss({intro, restore})` jumps to the encounter (defaults: intro and restore both on). The others are `restartBoss()`, `setBossHealth(n)`, `defeatBoss()` and `returnToStage()`.

Developer mutations still require Developer Mode even when explicit test configuration exposes read access in Normal Mode. Spawn positions are finite numbers and clamped to world bounds; active enemies are capped at 18.

Normal mode removes the API and resets cheats. Clearing Stage 1 or reaching Game Over in normal mode saves the best score to optional LocalStorage. Clearing Stage 1 also records `clearedStages: [1]`. Developer runs never write progress, and no later stage is unlocked. Returning to the menu resets the run.

## Mixed-universe combat

| Enemy | Tier | Base HP | Style |
| --- | --- | --- | --- |
| Street Fighter | Regular | 42 | Punches and kicks |
| Roman Reigns | Regular | 56 | Heavy strikes; occasional Superman Punch |
| Seth Rollins | Regular | 50 | Faster strikes; occasional Stomp |
| Shredder | Elite | 100 | Blades, armor and dash |
| Venom | Mini-boss | 260 | Heavy smash, tendrils and crushing kick |
| Kingpin | Stage 1 boss | 1250 | Heavy punches, Hammer Hook, Bull Charge, Ground Slam, rage phase |

Roman and Seth have ordinary overhead health bars and no boss introduction. Venom is available for developer testing and future stages, with a dedicated mini-boss bar; he does not appear in the four normal waves. No Ninja Foot Soldier is implemented.

The four waves are Roman + Street Fighter; Seth + Roman; Shredder + Roman + Seth; Shredder + Street Fighter + Roman. Their difficulty multipliers are 0.75, 0.85, 0.9 and 1.0. The next wave waits for every living enemy to fall and a short clear transition. Defeated bodies briefly fall/fade. Three lives, short post-damage invulnerability, protected respawns, score, Game Over and retry support a complete combat loop.

After Wave 4 the old Waves Cleared screen is gone. Stage 1 continues:

1. A flashing **WARNING – BOSS APPROACHING** banner appears for 2.4 s.
2. Kingpin walks in from off-screen and poses under a name card while his health bar fills. He is invulnerable during the entrance.
3. The fight begins, with a large **KINGPIN** bar at the top centre of the HUD.
4. When he falls, a **KINGPIN DEFEATED!** banner plays over his knockdown.
5. **STAGE 1 CLEARED** shows the final score with Retry Stage 1 and Main Menu buttons. Retry (or Enter) restarts Stage 1 from Wave 1.

Losing every life during the boss fight shows Game Over with boss-specific tips.

## Stage 1 boss: Kingpin

Kingpin is a heavy, bald crime lord in a white suit, drawn at 1.42× scale with his own articulated Canvas illustration. His poses are idle, walk, intro, punch, hook, charge, slam, shove, roar, backstep, hurt and defeated. He has 1250 health, 78% knockback resistance and a wide body.

**Phase 1** runs a close-range string of Heavy Punch → Heavy Punch → Hammer Hook. A finisher follows, alternating between the two below:

- **Ground Slam:** both fists overhead, then a radial slam. Jump to avoid it.
- **Backstep into Bull Charge:** a straight shoulder charge along his lane. Change lanes or jump to avoid it.

He also charges players who keep their distance or hit him from range.

**Rage phase (50% health and below):** he roars and pushes the player back without damage. He becomes faster, recovers sooner, shortens his string to punch → hook, and armors his jab. His Ground Slam sends out a widening shockwave, and a missed charge chains into a slam.

**Reactions to damage:** short flinches, and super armor on the Hammer Hook, Bull Charge and Ground Slam. Rapid hits trigger a guarded Rage Shove break-out, so he cannot be stun-locked.

**Fairness rules:** every move has a readable windup, shown by a red "!" badge. The charge and slam also draw ground warnings sized to their real hit areas. After Kingpin lands a hit he backs off for longer than the player's invulnerability, and any queued follow-up is cancelled. A dead Kingpin cannot attack.

Tips: jump the slam and its shockwave, step out of the charge lane, punish the long recoveries after a slam or charge, and don't mash into his armor.

`data/enemies.js` separates identity/tier from health, damage, movement speed, attack speed, range, resistance, aggression, special attack profiles and difficulty scaling. Add an identity and its attack profiles to reuse the same Enemy/CombatSystem; `data/waves.js` controls composition and difficulty. The future roster lists Magneto, Apocalypse, Juggernaut, Thanos, Ultron and Darkseid as unimplemented, not selectable. Original Canvas enemy illustrations share the articulated renderer; no external sprites or audio are used.

## Architecture and assets

`engine/Game.js` owns state and validated actions; `GameLoop.js` drives capped delta-time updates; `InputManager.js` separates held input from press edges. `entities/Player.js` owns movement/animation timing. `engine/Renderer.js` composites the scene and eases the scrolling camera; `rendering/CharacterRenderer.js` draws original articulated fighters; `rendering/CityRenderer.js` caches layered nighttime city artwork. `ui/UI.js` shares the character renderer for selection previews and updates persistent HUD nodes only when values change. Character and stage definitions live in `data/`.

`entities/Fighter.js` supplies shared damage, invulnerability, hurt/defeat and knockback state; Player preserves input and jumping, while Enemy owns shared approach/attack AI. `entities/Boss.js` extends Enemy for stage bosses. It chooses moves, moves the body during a charge, widens the shockwave hit range and handles armor/reactions, but damage still flows through Fighter and CombatSystem. `combat/CombatSystem.js` records each target once per attack and applies damage during an active window; `engine/CollisionManager.js` separates body overlap from directional/lane/height attack checks. `systems/StageManager.js` owns the Stage 1 lifecycle: waves → warning → entrance → boss → defeated → cleared. Rendering never drives damage. The boss HUD bar and banners are persistent DOM nodes, and ground telegraphs are drawn by the Renderer from the live attack profile.

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

Supported visual states are idle, walk, punch, kick, jump, strongAttack, specialAttack, hurt and defeated. Existing simulation/test state names `strong` and `special` remain supported aliases. Damage now triggers hurt/defeat playback. Landing uses a short squash pose. Optional enemy frames use the same format under `assetConfig.enemies`. Kingpin's entry also accepts `intro`, `charge`, `slam`, `shove`, `roar` and `backstep` animations; missing frames keep the vector art. Change the config before launching/rebuilding; no live asset editor is provided.

Set `backgrounds.city` to a path such as `assets/backgrounds/city.png` for an optional full-world background. It is drawn across a 2400×540 world, so supply artwork at that aspect ratio. PNG frame paths are relative to `public/`, preserving the Vite/GitHub Pages base. Empty definitions keep the built-in artwork.

### Visual checks

`npm test` retains the smoke and visual suites and adds combat/lifecycle tests: directional/lane/height misses, damage for all attack types, one contact per swing, cooldowns, invulnerability, defeat, wave gating, developer spawns/difficulty, lives/retry, progress isolation, and scripted cheat-free runs where all four heroes clear the waves and defeat Kingpin.

`tests/boss.spec.js` covers:

- damage in both directions and knockback resistance;
- slam and charge avoidance by jumping or changing lanes;
- one contact per attack, the post-hit backoff and the armor rules;
- the break-out shove and the rage phase;
- the full stage phase sequence and progress isolation;
- a fairness simulation: a bot that reacts to telegraphs beats Kingpin with every hero while taking no slam or charge damage;
- a live browser run of the boss HUD, banners, keyboard damage, developer tools, stage clear and retry.

The held-key animation smoke test clears enemies into sandbox to isolate input behavior from hurt interruption. This does not replace manual balance testing. Screenshots include hero, enemy and Kingpin pose atlases, selection, stage combat, Venom, the boss warning/entrance/fight/rage/stage-clear sequence and boss telegraphs under ignored `test-results/`. Logical gameplay coordinates remain 960×540; ResizeObserver adjusts the main Canvas backing resolution for display size and device pixel ratio (capped at 2), while CSS preserves 16:9.

## GitHub Pages

`npm run build` produces `dist/`. Deploy that directory using a GitHub Pages Actions workflow or another static host. Vite uses a relative base (`./`) so assets work under the planned `/Lavenzo-Multiverse-Brawl/` repository path. The repository is initialized locally; no remote, commit, push or deployment is performed automatically.

Read `DEVELOPMENT_STATUS.md` and `AGENTS.md` before continuing development.
