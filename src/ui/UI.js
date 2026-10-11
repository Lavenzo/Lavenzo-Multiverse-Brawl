import { characters } from '../data/characters.js';
import { stages } from '../data/stages.js';
import { CharacterRenderer } from '../rendering/CharacterRenderer.js';
import { enemyDefinitions } from '../data/enemies.js';
import { cityWaves } from '../systems/StageManager.js';
export class UI {
  constructor() {
    document.querySelector('#app').innerHTML = `<header><a href="#" id="home">L<span> / </span>MB</a><span>FOUNDATION BUILD <b>01</b></span></header><main><div class="intro"><span class="eyebrow">LAVENZO KAI KAI PRESENTS</span><h1>LAVENZO<br><span>MULTIVERSE BRAWL</span></h1><p>4 HEROES · 8 STAGES · ONE FINAL BATTLE</p></div><section class="cabinet"><div class="cabinet-top"><span>● ARCADE SYSTEM / ONLINE</span><span id="mode-label">SINGLE PLAYER</span></div><div class="viewport"><canvas width="960" height="540" aria-label="Game arena"></canvas><div id="hud"></div><div id="boss-banner" data-testid="boss-banner" role="status" hidden></div><div id="screen"></div><div id="developer" hidden></div><div id="toast" role="status"></div></div><div class="controls"><span><kbd>↑ ↓ ← →</kbd> MOVE</span><span><kbd>A</kbd> PUNCH</span><span><kbd>S</kbd> KICK</span><span><kbd>D</kbd> SPECIAL</span><span><kbd>W</kbd> STRONG</span><span><kbd>SPACE</kbd> JUMP</span><span><kbd>ESC</kbd> PAUSE</span></div></section><div class="below"><span>01 / CITY STREETS <b>MOVEMENT & ANIMATION PREVIEW</b></span><span>ORIGINAL PLACEHOLDER ART</span></div></main><footer><span>Developed by Lavenzo Kai Kai</span><span>Unofficial Fan Game · Personal Hobby Project</span></footer>`;
    this.developerOpen = false; this.characterRenderer = new CharacterRenderer(); this.hudKey = ''; this.bossKey = ''; this.bannerKey = ''; this.lastHudUpdate = 0;
    document.querySelector('header b').textContent = '03'; document.querySelector('.below b').textContent='FOUR WAVES + KINGPIN BOSS';
    document.querySelector('.below span:last-child').textContent = 'ORIGINAL CANVAS ILLUSTRATIONS';
    document.querySelector('#hud').innerHTML = '<div><strong id="hud-name"></strong><div class="bar"><i id="hud-health"></i></div><div class="bar energy"><i id="hud-energy"></i></div><small id="hud-stats"></small></div><div class="boss-hud" id="boss-hud" data-testid="boss-hud" hidden><span class="boss-label" id="boss-label"></span><strong id="boss-name" data-testid="boss-name"></strong><div class="bar boss-bar"><i class="boss-trail" id="boss-trail"></i><i class="boss-fill" id="boss-health" data-testid="boss-health"></i></div><small id="boss-stats"></small></div><div class="stage-hud">STAGE 01<br><strong>CITY STREETS</strong><span id="hud-wave" data-testid="wave-hud"></span></div><pre class="debug" hidden></pre>';
    const $ = selector => document.querySelector(selector);
    this.hudElements = { root: $('#hud'), name: $('#hud-name'), health: $('#hud-health'), energy: $('#hud-energy'), stats: $('#hud-stats'), wave:$('#hud-wave'), debug: $('.debug'),
      boss: $('#boss-hud'), bossLabel: $('#boss-label'), bossName: $('#boss-name'), bossHealth: $('#boss-health'), bossTrail: $('#boss-trail'), bossStats: $('#boss-stats'), banner: $('#boss-banner') };
  }
  bind(game) {
    this.game = game; document.querySelector('#home').onclick = e => { e.preventDefault(); game.resetGame(); }; this.screen(game);
    game.renderer.assetsReady.then(() => { if(game.state==='menu' || game.state==='select') this.screen(game); });
  }
  preview(canvas,config) {
    const frame=this.game?.renderer.assets.frame({config,state:'idle',time:0});
    this.characterRenderer.preview(canvas,config);
    if(frame) { const c=canvas.getContext('2d'); c.clearRect(0,0,240,240); c.drawImage(frame.image,115-frame.width*frame.anchorX*1.1,213-frame.height*frame.anchorY*1.1,frame.width*1.1,frame.height*1.1); }
  }
  button(id, text, fn, disabled = false) { const button = document.createElement('button'); button.textContent = text; button.dataset.testid = id; button.disabled = disabled; button.onclick = fn; return button; }
  screen(g) {
    const root = document.querySelector('#screen'); root.replaceChildren(); root.hidden = g.state === 'playing'; root.dataset.state = g.state; document.querySelector('#mode-label').textContent = g.developerMode ? 'DEVELOPER MODE / P TOOLS' : 'SINGLE PLAYER';
    if (g.state === 'menu') {
      root.innerHTML = `<span class="eyebrow">THE MULTIVERSE IS CALLING</span><h2>CHOOSE YOUR FIGHT.</h2><div class="menu-lineup"></div><p class="note">Milestone 3 / Stage 1: four mixed-universe waves and the Kingpin boss.<br>Stages 2–8 are still in development.</p>`;
      for(const character of characters) { const canvas = document.createElement('canvas'); canvas.width = 240; canvas.height = 240; canvas.setAttribute('aria-label',character.name); root.querySelector('.menu-lineup').append(canvas); this.preview(canvas,character); }
      root.append(this.button('start-normal', 'START GAME →', () => g.selectMode(false)), this.button('start-developer', 'DEVELOPER / TEST MODE', () => g.selectMode(true)));
    } else if (g.state === 'select') {
      root.innerHTML = `<span class="eyebrow">PLAYER 1 / SELECT YOUR HERO</span><h2>FOUR WORLDS. ONE TEAM.</h2><div class="cards"></div><div class="hero-detail" data-testid="selected-character-details"></div><p class="note">← / → SELECT · ENTER TO START</p>`;
      const cards = root.querySelector('.cards');
      for (const character of characters) {
        const selected = g.character === character;
        const button = this.button(`character-${character.id}`, '', () => { g.character = character; this.screen(g); });
        button.className = `hero-card ${selected ? 'selected' : ''}`; button.style.setProperty('--hero', character.color);
        button.setAttribute('aria-pressed',String(selected)); button.setAttribute('aria-label',character.name);
        button.innerHTML = `<span class="hero-number">0${characters.indexOf(character)+1} ${selected ? '/ READY' : '/ SELECT'}</span><canvas class="portrait" width="240" height="240" aria-hidden="true"></canvas><small>${character.origin}</small><strong>${character.name}</strong><span class="fighter-style">${character.style}</span><span class="hero-attributes"><span>HEALTH <b>${character.health}</b></span><span>SPEED <b>${character.speed}</b></span><span>ATTACK <b>${character.damage}</b></span></span>`;
        cards.append(button); this.preview(button.querySelector('canvas'),character);
      }
      root.querySelector('.hero-detail').innerHTML = `<span>SELECTED <strong>${g.character.name.toUpperCase()}</strong></span><span>SPECIAL <strong>${g.character.special}</strong></span><span>STYLE <strong>${g.character.description}</strong></span>`;
      const actions = document.createElement('div'); actions.className='selection-actions';
      actions.append(this.button('confirm-character', 'ENTER CITY STREETS →', () => g.startStage()), this.button('back-menu', 'BACK', () => g.resetGame())); root.append(actions);
    } else if (g.state === 'paused') {
      root.innerHTML = '<span class="eyebrow">TAKE A BREATHER</span><h2>PAUSED</h2>';
      root.append(this.button('resume', 'RESUME →', () => { g.state = 'playing'; this.screen(g); }), this.button('return-menu', 'MAIN MENU', () => g.resetGame()));
    } else if(g.state==='stageClear' || g.state==='gameOver') {
      const clear=g.state==='stageClear',bossFight=g.waves.phase!=='waves';
      const note=clear?(g.developerMode?'Developer run: score and progress are not saved.':`Best score ${g.progress.data.bestScore}. Stage 2 is still in development.`)
        :bossFight?'Jump over the Ground Slam shockwave and step out of the Bull Charge lane.':'Try a special attack to push back a group. Move between lanes to dodge.';
      root.innerHTML=`<span class="eyebrow">CITY STREETS / ${clear?'KINGPIN DEFEATED':'OUT OF LIVES'}</span><h2 data-testid="result-title">${clear?'STAGE 1 CLEARED':'GAME OVER'}</h2><p data-testid="final-score">${clear?'FINAL SCORE':'SCORE'} ${g.score}</p><p class="note">${note}</p>`;
      root.append(this.button('retry',clear?'RETRY STAGE 1':'RETRY CITY STREETS',()=>g.startStage()),this.button('return-menu','MAIN MENU',()=>g.resetGame()));
    }
  }
  hud(g) {
    const h = this.hudElements; h.root.hidden = !g.player;
    if(!g.player) { h.banner.hidden = true; this.bannerKey = ''; return; }
    const now=performance.now(); if(now-this.lastHudUpdate<80) return; this.lastHudUpdate=now;
    const energy=Math.floor(g.player.energy),key=`${g.character.id}:${g.player.health}:${energy}:${g.lives}:${g.score}`;
    if(key!==this.hudKey) { this.hudKey=key; h.name.textContent=g.character.name.toUpperCase(); h.health.style.width=`${g.player.health/g.character.health*100}%`; h.energy.style.width=`${energy}%`; h.stats.textContent=`HP ${g.player.health} / ${g.character.health} · LIVES ${g.lives} · SCORE ${String(g.score).padStart(6,'0')}`; }
    const phase=g.waves.phase,boss=g.activeBoss();
    const bossText={warning:'WARNING · BOSS APPROACHING',entrance:'BOSS · KINGPIN',boss:`BOSS · KINGPIN${boss?.enraged?' · ENRAGED':''}`,defeated:'KINGPIN DEFEATED!',cleared:'STAGE 1 CLEARED'}[phase];
    const waveText=g.waves.sandbox?'SANDBOX':bossText ?? `WAVE ${g.waves.wave} / 4 · ${g.enemies.filter(e=>e.health>0).length} ENEMIES${g.waves.transition>0?' / CLEAR!':''}`;
    if(h.wave.textContent!==waveText) h.wave.textContent=waveText;
    this.bossHud(g,boss,phase); this.banner(boss,g.state==='playing'?phase:'');
    h.debug.hidden=!(g.developerMode && g.cheats.debug);
    if(!h.debug.hidden) h.debug.textContent=`Stage: 1 / Wave ${g.waves.wave} / ${phase} | Hero: ${g.character.id}\nHP: ${g.player.health} | x: ${g.player.x.toFixed(0)} y: ${g.player.y.toFixed(0)} z: ${g.player.z.toFixed(0)}\nEnemies: ${g.enemies.filter(e=>e.health>0).length} | Mini-boss: ${g.enemies.some(e=>e.health>0&&e.config.tier==='miniboss')?'Venom':'none'}\nBoss: ${boss?`${boss.config.name} ${boss.health}/${boss.maxHealth}${boss.enraged?' enraged':''} ${boss.aiState}${boss.attack?` / ${boss.attack.name}`:''}`:'none'}\nState: ${g.state}${this.developerOpen ? ' (tools open)' : ''} | FPS: ${g.loop.fps.toFixed(0)}\nCheats: ${Object.entries(g.cheats).filter(([,v])=>v).map(([k])=>k).join(', ') || 'none'}`;
  }
  // Boss bar fills during the entrance; the delayed trail shows recent damage through CSS.
  bossHud(g,boss,phase) {
    const h=this.hudElements,show=Boolean(boss) && phase!=='warning';
    if(h.boss.hidden===show) h.boss.hidden=!show;
    if(!show) { this.bossKey=''; return; }
    const fill=phase==='entrance'?Math.min(1,g.waves.phaseTime/1.2):1,ratio=Math.max(0,boss.health/boss.maxHealth)*fill;
    const key=`${boss.id}:${boss.health}:${boss.maxHealth}:${boss.enraged}:${ratio.toFixed(3)}`;
    if(key===this.bossKey) return; this.bossKey=key;
    h.bossName.textContent=boss.config.name.toUpperCase(); h.bossLabel.textContent=boss.enraged?'STAGE 1 BOSS · ENRAGED':'STAGE 1 BOSS';
    h.bossHealth.style.width=h.bossTrail.style.width=`${ratio*100}%`; h.bossStats.textContent=`HP ${boss.health} / ${boss.maxHealth}`;
    h.boss.classList.toggle('enraged',Boolean(boss.enraged));
  }
  banner(boss,phase) {
    const h=this.hudElements,kind=phase==='warning'?'warning':boss&&phase==='entrance'?'intro':boss&&phase==='defeated'?'ko':'',key=kind&&`${kind}:${boss?.id||''}`;
    if(key===this.bannerKey) return; this.bannerKey=key; h.banner.hidden=!kind; h.banner.className=kind;
    const text=(tag,value)=>{ const node=document.createElement(tag); node.textContent=value; return node; };
    if(kind==='warning') h.banner.replaceChildren(text('strong','WARNING'),' – ',text('span','BOSS APPROACHING'));
    else if(kind==='intro') h.banner.replaceChildren(text('strong',boss.config.name.toUpperCase()),text('span',boss.config.title || 'Stage boss'));
    else if(kind==='ko') h.banner.replaceChildren(text('strong',`${boss.config.name.toUpperCase()} DEFEATED!`));
    else h.banner.replaceChildren();
  }
  closeDeveloper() { this.developerOpen = false; document.querySelector('#developer').hidden = true; }
  toggleDeveloper(g) { if (!g.developerMode) return; this.developerOpen = !this.developerOpen; this.refreshDeveloper(g); if(this.developerOpen) document.querySelector('#developer').scrollTop=0; }
  refreshDeveloper(g) {
    const root = document.querySelector('#developer'); root.hidden = !this.developerOpen; if (!this.developerOpen) return;
    root.innerHTML = '<div class="dev-heading"><h3>DEVELOPER TOOLS</h3><span>Simulation suspended · P to close</span></div><p class="note">City Streets combat / Clear all enemies enters sandbox. Selecting a wave restores wave progression. Difficulty applies to newly spawned enemies. Boss tools jump straight to Kingpin; developer clears never save progress.</p>';
    const select = document.createElement('select'); select.dataset.testid = 'developer-stage';
    for (const stage of stages) { const option = document.createElement('option'); option.value = stage.number; option.textContent = `${stage.number}. ${stage.name} — ${stage.implemented ? `four waves + ${stage.boss} boss` : 'not implemented'}`; option.disabled = !stage.implemented; select.append(option); }
    root.append(select);
    const heroes = document.createElement('select'); heroes.dataset.testid = 'developer-character'; for (const hero of characters) { const option = document.createElement('option'); option.value = hero.id; option.textContent = hero.name; option.selected = g.character === hero; heroes.append(option); } root.append(heroes);
    root.append(this.button('developer-start', 'Start selected stage', () => { g.character = characters.find(c => c.id === heroes.value); g.startStage(Number(select.value)); }));
    const enemySelect=document.createElement('select'); enemySelect.dataset.testid='developer-enemy'; enemySelect.setAttribute('aria-label','Enemy identity');
    for(const enemy of Object.values(enemyDefinitions)) { const option=document.createElement('option'); option.value=enemy.id; option.textContent=`${enemy.name} / ${enemy.tier}`; enemySelect.append(option); }
    const difficulty=document.createElement('input'); difficulty.type='number'; difficulty.min='.5'; difficulty.max='2'; difficulty.step='.05'; difficulty.value=g.enemyDifficulty; difficulty.dataset.testid='enemy-difficulty'; difficulty.setAttribute('aria-label','New enemy difficulty multiplier');
    difficulty.onchange=()=>{ if(!g.setEnemyDifficulty(Number(difficulty.value))) { difficulty.value=g.enemyDifficulty; this.notify('Difficulty must be between 0.5 and 2.'); } };
    const spawnRow=document.createElement('div'); spawnRow.className='dev-spawn'; spawnRow.append(enemySelect,difficulty,this.button('dev-spawn-enemy','SPAWN SELECTED',()=>g.spawnEnemy(enemySelect.value)),this.button('dev-spawn-regular','REGULAR / ROMAN',()=>g.spawnEnemy('roman')),this.button('dev-spawn-elite','ELITE / SHREDDER',()=>g.spawnEnemy('shredder')),this.button('dev-spawn-miniboss','MINI-BOSS / VENOM',()=>g.spawnEnemy('venom'))); root.append(spawnRow);
    const waveSelect=document.createElement('select'); waveSelect.dataset.testid='developer-wave'; waveSelect.setAttribute('aria-label','Wave selection');
    cityWaves.forEach((wave,i)=>{ const option=document.createElement('option'); option.value=i+1; option.textContent=`Wave ${i+1} / ${wave.name}`; option.selected=g.waves.wave===i+1; waveSelect.append(option); });
    root.append(waveSelect,this.button('dev-select-wave','START WAVE',()=>{g.selectWave(Number(waveSelect.value));this.closeDeveloper();}),this.button('dev-skip-wave','SKIP WAVE',()=>{g.developerAction('skipWave');this.closeDeveloper();}),this.button('dev-restart-wave','RESTART WAVE',()=>{g.developerAction('restartWave');this.closeDeveloper();}),this.button('dev-clear-enemies','CLEAR ALL / SANDBOX',()=>g.developerAction('clear')));
    root.append(this.bossTools(g));
    const grid = document.createElement('div'); grid.className = 'dev-grid';
    for (const [action,label,key] of [['restart','Restart stage','0'],['skip','Skip stage (deferred)','2'],['health','Restore health','4'],['defeat','Defeat regular enemies','5'],['previous','Previous stage','6'],['next','Next stage','7']]) grid.append(this.button(`dev-${action}`, `${label} · Shift+${key}`, () => g.developerAction(action), !['restart','health','defeat'].includes(action)));
    for (const [name,label,key] of [['invincible','Invincibility','1'],['infiniteLives','Infinite lives',''],['infiniteEnergy','Infinite special energy','9'],['oneHitKill','One-hit kill','8'],['debug','Debug overlay','']]) grid.append(this.button(`dev-${name}`, `${g.cheats[name] ? '✓' : '○'} ${label}${key ? ' · Shift+' + key : ''}`, () => g.toggleCheat(name)));
    root.append(grid, this.button('close-developer', 'CLOSE TOOLS', () => this.closeDeveloper()));
  }
  // Every action goes through a validated Game method; nothing here mutates the boss directly.
  bossTools(g) {
    const boss=g.activeBoss(),alive=Boolean(boss && boss.health>0),row=document.createElement('div'); row.className='dev-boss'; row.dataset.testid='developer-boss-tools';
    const status=document.createElement('p'); status.className='dev-boss-status'; status.dataset.testid='dev-boss-status';
    status.textContent=alive?`KINGPIN ${boss.health} / ${boss.maxHealth} HP · ${boss.enraged?'ENRAGED (BELOW 50%)':'PHASE 1'} · ${g.waves.phase.toUpperCase()}`:`STAGE 1 BOSS / KINGPIN · ${g.waves.phase==='waves'?(g.waves.sandbox?'SANDBOX':`WAVE ${g.waves.wave}`):g.waves.phase.toUpperCase()}`;
    const max=alive?boss.maxHealth:enemyDefinitions.kingpin.health,health=document.createElement('input'); health.type='number'; health.min='1'; health.step='1'; health.max=String(max); health.value=String(Math.floor(max*.45));
    health.dataset.testid='dev-boss-health-value'; health.setAttribute('aria-label','Kingpin health');
    row.append(status,
      this.button('dev-boss','JUMP TO BOSS ENCOUNTER · Shift+3',()=>g.developerAction('boss')),
      this.button('dev-spawn-kingpin','SPAWN KINGPIN NOW',()=>g.startBossEncounter({intro:false,restore:false})),
      this.button('dev-restart-boss','RESTART BOSS FIGHT',()=>g.restartBossFight()),
      this.button('dev-defeat-boss','DEFEAT BOSS',()=>{ if(g.defeatBoss()) this.closeDeveloper(); },!alive),
      health,this.button('dev-set-boss-health','SET KINGPIN HP',()=>{ if(g.setBossHealth(Number(health.value))) this.refreshDeveloper(g); else this.notify(`Kingpin health must be a whole number from 1 to ${health.max}.`); },!alive),
      this.button('dev-return-stage','RETURN TO STAGE 1 · WAVE 1',()=>g.developerAction('restart')));
    return row;
  }
  notify(message) { const root = document.querySelector('#toast'); root.textContent = message; clearTimeout(this.toastTimer); this.toastTimer = setTimeout(() => root.textContent = '', 4000); }
}
