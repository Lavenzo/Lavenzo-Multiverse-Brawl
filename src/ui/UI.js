import { characters } from '../data/characters.js';
import { stages } from '../data/stages.js';
export class UI {
  constructor() {
    document.querySelector('#app').innerHTML = `<header><a href="#" id="home">L<span> / </span>MB</a><span>FOUNDATION BUILD <b>01</b></span></header><main><div class="intro"><span class="eyebrow">LAVENZO KAI KAI PRESENTS</span><h1>LAVENZO<br><span>MULTIVERSE BRAWL</span></h1><p>4 HEROES · 8 STAGES · ONE FINAL BATTLE</p></div><section class="cabinet"><div class="cabinet-top"><span>● ARCADE SYSTEM / ONLINE</span><span id="mode-label">SINGLE PLAYER</span></div><div class="viewport"><canvas width="960" height="540" aria-label="Game arena"></canvas><div id="hud"></div><div id="screen"></div><div id="developer" hidden></div><div id="toast" role="status"></div></div><div class="controls"><span><kbd>↑ ↓ ← →</kbd> MOVE</span><span><kbd>A</kbd> PUNCH</span><span><kbd>S</kbd> KICK</span><span><kbd>D</kbd> SPECIAL</span><span><kbd>W</kbd> STRONG</span><span><kbd>SPACE</kbd> JUMP</span><span><kbd>ESC</kbd> PAUSE</span></div></section><div class="below"><span>01 / CITY STREETS <b>MOVEMENT & ANIMATION PREVIEW</b></span><span>ORIGINAL PLACEHOLDER ART</span></div></main><footer><span>Developed by Lavenzo Kai Kai</span><span>Unofficial Fan Game · Personal Hobby Project</span></footer>`;
    this.developerOpen = false;
  }
  bind(game) { this.game = game; document.querySelector('#home').onclick = e => { e.preventDefault(); game.resetGame(); }; this.screen(game); }
  button(id, text, fn, disabled = false) { const button = document.createElement('button'); button.textContent = text; button.dataset.testid = id; button.disabled = disabled; button.onclick = fn; return button; }
  screen(g) {
    const root = document.querySelector('#screen'); root.replaceChildren(); root.hidden = g.state === 'playing'; document.querySelector('#mode-label').textContent = g.developerMode ? 'DEVELOPER MODE / P TOOLS' : 'SINGLE PLAYER';
    if (g.state === 'menu') {
      root.innerHTML = `<span class="eyebrow">THE MULTIVERSE IS CALLING</span><h2>CHOOSE YOUR FIGHT.</h2><p>A new arcade adventure starts here.</p><p class="note">Milestone 1 · Movement and animation playground.<br>Enemies, damage and boss battles arrive in later milestones.</p>`;
      root.append(this.button('start-normal', 'START GAME →', () => g.selectMode(false)), this.button('start-developer', 'DEVELOPER / TEST MODE', () => g.selectMode(true)));
    } else if (g.state === 'select') {
      root.innerHTML = `<span class="eyebrow">SELECT YOUR HERO</span><h2>FOUR WORLDS. ONE TEAM.</h2><div class="cards"></div><p class="note">Arrow left / right to select · Enter to start</p>`;
      const cards = root.querySelector('.cards');
      for (const character of characters) { const button = this.button(`character-${character.id}`, '', () => { g.character = character; this.screen(g); }); button.className = `hero-card ${g.character === character ? 'selected' : ''}`; button.style.setProperty('--hero', character.color); button.innerHTML = `<div class="portrait"><span style="background:${character.color};border-color:${character.accent}"></span></div><small>${character.origin}</small><strong>${character.name}</strong><p>${character.description}</p><small>HP ${character.health} · SPEED ${character.speed}</small>`; cards.append(button); }
      root.append(this.button('confirm-character', 'ENTER CITY STREETS →', () => g.startStage()), this.button('back-menu', 'BACK', () => g.resetGame()));
    } else if (g.state === 'paused') {
      root.innerHTML = '<span class="eyebrow">TAKE A BREATHER</span><h2>PAUSED</h2>';
      root.append(this.button('resume', 'RESUME →', () => { g.state = 'playing'; this.screen(g); }), this.button('return-menu', 'MAIN MENU', () => g.resetGame()));
    }
  }
  hud(g) {
    const root = document.querySelector('#hud'); root.hidden = !g.player;
    if (!g.player) return;
    root.innerHTML = `<div><strong>${g.character.name.toUpperCase()}</strong><div class="bar"><i style="width:${g.player.health / g.character.health * 100}%"></i></div><div class="bar energy"><i style="width:${g.player.energy}%"></i></div><small>HP ${g.player.health} / ${g.character.health} · LIVES 3 · SCORE 000000</small></div><div class="stage-hud">STAGE 01<br><strong>CITY STREETS</strong></div>`;
    if (g.developerMode && g.cheats.debug) { const debug = document.createElement('pre'); debug.className = 'debug'; debug.textContent = `Stage: 1 (preview) | Hero: ${g.character.id}\nHP: ${g.player.health} | x: ${g.player.x.toFixed(0)} y: ${g.player.y.toFixed(0)} z: ${g.player.z.toFixed(0)}\nEnemies: 0 | Boss: unimplemented\nState: ${g.state}${this.developerOpen ? ' (tools open)' : ''} | FPS: ${g.loop.fps.toFixed(0)}\nCheats: ${Object.entries(g.cheats).filter(([,v])=>v).map(([k])=>k).join(', ') || 'none'}`; root.append(debug); }
  }
  closeDeveloper() { this.developerOpen = false; document.querySelector('#developer').hidden = true; }
  toggleDeveloper(g) { if (!g.developerMode) return; this.developerOpen = !this.developerOpen; this.refreshDeveloper(g); }
  refreshDeveloper(g) {
    const root = document.querySelector('#developer'); root.hidden = !this.developerOpen; if (!this.developerOpen) return;
    root.innerHTML = '<div class="dev-heading"><h3>DEVELOPER TOOLS</h3><span>Simulation suspended · P to close</span></div><p class="note">Only City Streets foundation preview is available. Combat cheats are reserved for Milestone 2.</p>';
    const select = document.createElement('select'); select.dataset.testid = 'developer-stage';
    for (const stage of stages) { const option = document.createElement('option'); option.value = stage.number; option.textContent = `${stage.number}. ${stage.name} — ${stage.preview ? 'foundation preview' : 'not implemented'}`; option.disabled = !stage.preview; select.append(option); }
    root.append(select);
    const heroes = document.createElement('select'); heroes.dataset.testid = 'developer-character'; for (const hero of characters) { const option = document.createElement('option'); option.value = hero.id; option.textContent = hero.name; option.selected = g.character === hero; heroes.append(option); } root.append(heroes);
    root.append(this.button('developer-start', 'Start selected preview', () => { g.character = characters.find(c => c.id === heroes.value); g.startStage(Number(select.value)); }));
    const grid = document.createElement('div'); grid.className = 'dev-grid';
    for (const [action,label,key] of [['restart','Restart stage','0'],['skip','Skip stage','2'],['boss','Spawn boss','3'],['health','Restore health','4'],['defeat','Defeat regular enemies','5'],['previous','Previous stage','6'],['next','Next stage','7']]) grid.append(this.button(`dev-${action}`, `${label} · Shift+${key}`, () => g.developerAction(action), !['restart','health'].includes(action)));
    for (const [name,label,key] of [['invincible','Invincibility','1'],['infiniteLives','Infinite lives',''],['infiniteEnergy','Infinite special energy','9'],['oneHitKill','One-hit kill','8'],['debug','Debug overlay','']]) grid.append(this.button(`dev-${name}`, `${g.cheats[name] ? '✓' : '○'} ${label}${key ? ' · Shift+' + key : ''}`, () => g.toggleCheat(name)));
    root.append(grid, this.button('close-developer', 'CLOSE TOOLS', () => this.closeDeveloper()));
  }
  notify(message) { const root = document.querySelector('#toast'); root.textContent = message; clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => root.textContent = '', 4000); }
}
