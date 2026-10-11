import { defineConfig } from 'vite';
export default defineConfig(({ command, isPreview }) => ({
  // Keep the existing local dev URL; production and preview use the Pages project path.
  base: command === 'serve' && !isPreview ? '/' : '/Lavenzo-Multiverse-Brawl/',
}));
