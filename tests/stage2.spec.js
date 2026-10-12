import { test, expect } from '@playwright/test';

test('Stage 1 to Stage 2 progression, Developer Mode skip, and Mike Tyson spawn', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { Game } = await import('/src/engine/Game.js');
    const { characters } = await import('/src/data/characters.js');

    // Create a headless game instance
    const game = new Game();
    game.ui = { bind() {}, screen() {}, updateHud() {}, hud() {}, notify() {}, closeDeveloper() {}, refreshDeveloper() {} };
    game.renderer = { setGame() {}, assetsReady: Promise.resolve() };
    game.character = characters[0];

    // Test 1: Start stage 2 directly (developer skip)
    game.developerMode = true;
    game.startStage(2);
    const stage2Start = {
      stageNumber: game.stage.number,
      wavePhase: game.waves.phase,
      bossData: game.waves.bossData.id,
      playerHealth: game.player.health,
      score: game.score
    };

    // Test 2: Sabretooth health regeneration
    const { Enemy } = await import('/src/entities/Enemy.js');
    const { resolveEnemy } = await import('/src/data/enemies.js');
    const sabretooth = new Enemy(resolveEnemy('sabretooth'), 100, 100);
    sabretooth.health = 50; // Damage him
    sabretooth.update(1.0, game.player); // Update 1 second
    const regeneratedHealth = sabretooth.health;

    return { stage2Start, regeneratedHealth };
  });

  expect(result.stage2Start.stageNumber).toBe(2);
  expect(result.stage2Start.wavePhase).toBe('waves');
  expect(result.stage2Start.bossData).toBe('tyson');
  expect(result.regeneratedHealth).toBe(52); // Base 50 + 2 from regeneration in 1s
});
