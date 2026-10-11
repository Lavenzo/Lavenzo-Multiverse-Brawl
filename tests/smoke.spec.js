import { test, expect } from '@playwright/test';
test('four heroes launch; normal mode keeps developer API private', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  for (const hero of ['axel','leonardo','spiderman','cyclops']) {
    await page.goto('/'); await page.getByTestId('start-normal').click(); await page.getByTestId(`character-${hero}`).click(); await page.getByTestId('confirm-character').click();
    await expect(page.locator('#screen')).toBeHidden(); expect(await page.evaluate(() => typeof window.gameTestAPI)).toBe('undefined');
    if (hero === 'axel') await page.screenshot({ path: 'test-results/foundation-preview.png', fullPage: true });
    await page.keyboard.press('p'); await expect(page.locator('#developer')).toBeHidden(); await page.keyboard.press('Escape'); await expect(page.getByTestId('resume')).toBeVisible(); await page.getByTestId('resume').click();
  } expect(errors).toEqual([]);
});
test('movement, jump, edge-triggered attacks and developer isolation', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('start-developer').click(); await page.getByTestId('confirm-character').click();
  // This input regression is isolated from enemy hits; combat has its own focused suite.
  await page.evaluate(() => window.gameTestAPI.clearEnemies());
  const snapshot = () => page.evaluate(() => window.gameTestAPI.getPlayerSnapshot());
  const first = await snapshot(); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight'); expect((await snapshot()).x).toBeGreaterThan(first.x);
  await page.keyboard.down('ArrowUp'); await page.keyboard.press('Space'); await page.waitForTimeout(100); expect((await snapshot()).z).toBeGreaterThan(0); expect((await snapshot()).y).toBeLessThan(first.y); await page.keyboard.up('ArrowUp'); await page.waitForTimeout(1000);
  for (const [key,state] of [['a','punch'],['s','kick'],['w','strong'],['d','special']]) { await page.keyboard.down(key); await expect.poll(async () => (await snapshot()).state).toBe(state); await page.waitForTimeout(750); expect((await snapshot()).state).toBe('idle'); await page.keyboard.up(key); }
  await page.keyboard.press('p'); await expect(page.getByTestId('developer-start')).toBeVisible(); await expect(page.getByTestId('dev-boss')).toBeEnabled(); await page.getByTestId('dev-debug').click(); await expect(page.locator('.debug')).toBeVisible(); await page.getByTestId('close-developer').click();
  expect(await page.evaluate(() => window.gameTestAPI.startStage(8))).toBe(false);
  await page.keyboard.press('Shift+1'); await page.keyboard.press('p'); await expect(page.getByTestId('dev-invincible')).toContainText('✓'); await page.getByTestId('close-developer').click();
  await page.keyboard.press('Escape'); await page.getByTestId('return-menu').click(); expect(await page.evaluate(() => typeof window.gameTestAPI)).toBe('undefined');
  await page.getByTestId('start-developer').click(); await page.getByTestId('confirm-character').click(); await page.keyboard.press('p'); await expect(page.getByTestId('dev-invincible')).toContainText('○');
});
