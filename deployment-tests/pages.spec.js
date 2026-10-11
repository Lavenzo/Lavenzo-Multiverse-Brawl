import { test, expect } from '@playwright/test';

const base = '/Lavenzo-Multiverse-Brawl/';

test('production HTML loads compiled assets under the Pages repository path', async ({ request }) => {
  const response = await request.get(base);
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).not.toContain('/src/main.js');
  const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
  expect(assets.length).toBeGreaterThanOrEqual(2);
  for (const path of assets) {
    expect(path).toMatch(/^\/Lavenzo-Multiverse-Brawl\/assets\//);
    const asset = await request.get(path);
    expect(asset.ok(), path).toBe(true);
    expect(asset.headers()['content-type']).toMatch(path.endsWith('.css') ? /text\/css/ : /javascript/);
  }
});

test('built game starts all four heroes with no missing assets or browser errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  for (const hero of ['axel', 'leonardo', 'spiderman', 'cyclops']) {
    await page.goto(base);
    await page.getByTestId('start-normal').click();
    await page.getByTestId(`character-${hero}`).click();
    await page.getByTestId('confirm-character').click();
    await expect(page.locator('#screen')).toBeHidden();
    await expect(page.locator('#hud-name')).toContainText(hero === 'axel' ? 'AXEL STONE' : hero === 'spiderman' ? 'SPIDER-MAN' : hero.toUpperCase());
    expect(await page.evaluate(() => typeof window.gameTestAPI)).toBe('undefined');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('resume')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
