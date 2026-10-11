import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);
const html = await readFile(new URL('index.html', dist), 'utf8');
const prefix = '/Lavenzo-Multiverse-Brawl/';
assert(!html.includes('/src/main.js'), 'Production HTML must not reference source modules.');
const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map(match => match[1]);
assert(assets.some(path => path.endsWith('.js')), 'Missing production JavaScript bundle.');
assert(assets.some(path => path.endsWith('.css')), 'Missing production stylesheet.');
for (const path of assets) {
  assert(path.startsWith(`${prefix}assets/`), `Incorrect Pages asset path: ${path}`);
  await access(new URL(path.slice(prefix.length), dist));
}
console.log(`Verified ${fileURLToPath(new URL('index.html', dist))}:`);
for (const path of assets) console.log(`  ${path}`);
