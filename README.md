# Lavenzo Multiverse Brawl

4 HEROES · 8 STAGES · ONE FINAL BATTLE

Developed by Lavenzo Kai Kai. Unofficial Fan Game · Personal Hobby Project.

This is a JavaScript ES module, HTML5 Canvas and Vite hobby game. **Version 0.1 implements Milestone 1 only.** City Streets is a movement and animation playground, not a completed stage. There are no enemies, damage, boss battles, victory, lives consumption or campaign progression yet. Stages 2–8 are configuration placeholders.

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

Arrow keys move; A punches; S kicks; D performs a special; W performs a strong attack; Space jumps. Enter confirms menus; Escape pauses/resumes or returns from selection. Left/right choose heroes in selection. Attacks trigger once per press and have cooldowns. Special animations cost 25 energy; energy regenerates. Attack effects are visual only in this milestone.

Bindings are centralized in `src/engine/InputManager.js`; use `setBindings()` to change them. Movement and attacks work together, including jumps. The game pauses when the browser loses focus.

## Developer mode

Choose Developer / Test Mode from the main menu. Press P during gameplay to open/close tools. Select a hero, restart the preview, restore health/energy, toggle debug information, and toggle future combat cheat flags. Infinite energy already affects special use; invincibility, infinite lives and one-hit kill are reserved for future combat.

Shift+1 invincibility; Shift+2 skip; Shift+3 boss; Shift+4 restore; Shift+5 defeat enemies; Shift+6 previous; Shift+7 next; Shift+8 one-hit kill; Shift+9 infinite energy; Shift+0 restart. Unsupported actions display a message; their panel buttons are disabled. Stages 2–8 cannot be started. No function keys are used.

The developer API is available as `window.gameTestAPI` only in Developer Mode or with `VITE_ENABLE_TEST_API=true`. It uses engine methods and returns false for unavailable stage/boss operations. `getPlayerSnapshot()` supplements the specified API for animation tests. Normal mode removes the API and resets cheats; developer mode cannot save campaign progress. LocalStorage is optional and currently holds only a reserved progress schema; no campaign progress is earned in this milestone.

## Architecture and assets

`engine/Game.js` owns state and validated actions; `GameLoop.js` drives capped delta-time updates; `InputManager.js` separates held input from press edges. `entities/Player.js` owns movement/animation state; `engine/Renderer.js` draws original geometric placeholders and a parallax city. `ui/UI.js` renders HTML menus and HUD. Character and stage definitions live in `data/`.

Asset folders under `public/assets/` are ready for future images and optional music/SFX. No music or external artwork is loaded. AssetManager, AudioManager, hitboxes and combat modules are intentionally deferred rather than supplied as empty modules.

## GitHub Pages

`npm run build` produces `dist/`. Deploy that directory using a GitHub Pages Actions workflow or another static host. Vite uses a relative base (`./`) so assets work under the planned `/Lavenzo-Multiverse-Brawl/` repository path. The repository is initialized locally; no remote, commit, push or deployment is performed automatically.

Read `DEVELOPMENT_STATUS.md` and `AGENTS.md` before continuing development.
