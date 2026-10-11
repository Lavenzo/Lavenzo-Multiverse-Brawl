import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './deployment-tests',
  outputDir: './tmp/pages-test-results',
  use: { baseURL: 'http://127.0.0.1:4173', headless: true },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/Lavenzo-Multiverse-Brawl/',
    reuseExistingServer: false,
  },
});
