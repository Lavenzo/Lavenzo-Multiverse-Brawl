import { characters } from '../data/characters.js';
import { stages } from '../data/stages.js';
import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { GameLoop } from './GameLoop.js';
import { Renderer } from './Renderer.js';
import { ProgressManager } from '../systems/ProgressManager.js';
import { Enemy } from '../entities/Enemy.js';
import { resolveEnemy } from '../data/enemies.js';
import { CombatSystem } from '../combat/CombatSystem.js';
import { StageManager } from '../systems/StageManager.js';
export class Game {
  constructor(ui) { this.ui = ui; this.input = new InputManager(); this.progress = new ProgressManager(); this.state = 'menu'; this.character = characters[0]; this.stage = stages[0]; this.developerMode = false; this.enemies=[]; this.enemyDifficulty=1; this.combat=new CombatSystem(); this.waves=new StageManager(this); this.resetCheats(); this.renderer = new Renderer(document.querySelector('canvas')); this.loop = new GameLoop(dt => this.update(dt), () => { this.renderer.draw(this); this.ui.hud(this); }); }
  resetCheats() { this.cheats = { invincible: false, infiniteLives: false, infiniteEnergy: false, oneHitKill: false, debug: false }; }
  selectMode(developer) { this.developerMode = developer; this.resetCheats(); this.state = 'select'; this.syncAPI(); this.ui.screen(this); }
  startStage(number = 1) { if (number !== 1) return false; this.stage = stages[0]; this.player = new Player(this.character); this.score=0; this.lives=3; this.enemyDifficulty=1; this.state = 'playing'; this.waves.startWave(1); this.input.clear(); this.ui.closeDeveloper(); this.ui.screen(this); return true; }
  resetGame() { this.state = 'menu'; this.player = null; this.enemies=[]; this.developerMode = false; this.enemyDifficulty=1; this.resetCheats(); this.input.clear(); this.syncAPI(); this.ui.closeDeveloper(); this.ui.screen(this); }
  toggleCheat(name, enabled = !this.cheats[name]) { if (!this.developerMode || !(name in this.cheats)) return false; this.cheats[name] = Boolean(enabled); this.ui.refreshDeveloper(this); return true; }
  developerAction(action) {
    if (!this.developerMode) return false;
    if (action === 'restart') return this.startStage(1);
    if (action === 'health' && this.player) { this.player.health = this.character.health; this.player.energy = 100; this.player.stun=0; this.player.deathTime=0; this.player.invulnerability=.8; this.player.attack=null; this.player.state='idle'; this.player.actionTime=0; return true; }
    if(action==='defeat') { for(const e of this.enemies) if(e.config.tier==='regular') { e.invulnerability=0; e.receiveDamage(e.health,this.player,{knockback:0,facing:this.player.facing}); e.scored=true; } return true; }
    if(action==='clear') { this.waves.clearEnemies(); return true; }
    if(action==='skipWave') return this.waves.skipWave();
    if(action==='restartWave') return this.selectWave(this.waves.wave);
    this.ui.notify('The Stage 1 boss and stage navigation remain deferred. Use wave controls to test combat.'); return false;
  }
  createEnemy(identity,difficulty=1,position={}) {
    const config=resolveEnemy(identity,difficulty);
    if(!config || !this.player || this.enemies.filter(e=>e.health>0).length>=18) return false;
    const x=position.x ?? Math.min(2260,this.player.x+190),y=position.y ?? this.player.y;
    if(!Number.isFinite(x)||!Number.isFinite(y)) return false;
    const enemy=new Enemy(config,x,y,this.enemies.length); this.enemies.push(enemy); return enemy;
  }
  spawnEnemy(identity,options={}) {
    if(!this.developerMode || !this.player || !options || typeof options!=='object') return false;
    const enemy=this.createEnemy(identity,options.difficulty ?? this.enemyDifficulty,options); return enemy ? enemy.id : false;
  }
  setEnemyDifficulty(value) { if(!this.developerMode || !Number.isFinite(value)||value<.5||value>2) return false; this.enemyDifficulty=value; return true; }
  selectWave(number) {
    if(!this.developerMode || !this.player || !Number.isInteger(number)||number<1||number>4) return false;
    this.developerAction('health'); this.state='playing'; this.input.clear(); this.waves.startWave(number); this.ui.screen(this); return true;
  }
  finishWaves() { this.state='waveClear'; this.input.clear(); this.ui.closeDeveloper(); this.saveBestScore(); this.ui.screen(this); }
  saveBestScore() { if(this.developerMode) return; this.progress.data.bestScore=Math.max(this.progress.data.bestScore,this.score); this.progress.save(false); }
  updateCombat(dt) {
    this.player.update(dt,this.input,this.cheats);
    for(const enemy of this.enemies) enemy.update(dt,this.player);
    this.combat.update(dt,this.player,this.enemies,this.cheats);
    for(const enemy of this.enemies) if(enemy.health<=0 && !enemy.scored) { this.score+=enemy.config.score; enemy.scored=true; }
    this.enemies=this.enemies.filter(e=>e.health>0 || e.deathTime<1.2);
    if(this.player.health<=0) {
      if(this.player.deathTime>.9) {
        if(this.lives>1 || this.cheats.infiniteLives) { const {x,y}=this.player; if(!this.cheats.infiniteLives) this.lives--; this.player=new Player(this.character); this.player.x=x; this.player.y=y; this.player.invulnerability=2; }
        else { this.state='gameOver'; this.input.clear(); this.ui.closeDeveloper(); this.saveBestScore(); this.ui.screen(this); }
      }
    } else this.waves.update(dt);
  }
  syncAPI() {
    if (!this.developerMode && import.meta.env.VITE_ENABLE_TEST_API !== 'true') { delete window.gameTestAPI; return; }
    window.gameTestAPI = Object.freeze({ getGameState: () => this.state, getCurrentStage: () => this.stage.number, getSelectedCharacter: () => this.character.id, getPlayerHealth: () => this.player?.health ?? 0, getEnemyCount: () => this.enemies.filter(e=>e.health>0).length, isBossActive: () => this.enemies.some(e=>e.health>0&&e.config.tier==='miniboss'), startStage: n => this.startStage(n), skipStage: () => this.developerAction('skip'), spawnBoss: () => this.developerAction('boss'), setInvincible: enabled => this.toggleCheat('invincible', enabled), resetGame: () => this.resetGame(), getPlayerSnapshot: () => this.player ? { x: this.player.x, y: this.player.y, z: this.player.z, facing: this.player.facing, state: this.player.state, energy: this.player.energy, health:this.player.health, lives:this.lives, score:this.score } : null,
      getEnemies:()=>this.enemies.map(e=>({id:e.id,name:e.config.name,tier:e.config.tier,health:e.health,maxHealth:e.maxHealth,x:e.x,y:e.y,state:e.state,aiState:e.aiState,difficulty:e.config.difficulty,attack:e.attack?.name||null})),
      getWave:()=>({number:this.waves.wave,sandbox:this.waves.sandbox,complete:this.waves.complete}),
      spawnEnemy:(name,options)=>this.spawnEnemy(name,options), setEnemyDifficulty:value=>this.setEnemyDifficulty(value), clearEnemies:()=>this.developerAction('clear'), skipWave:()=>this.developerAction('skipWave'), restartWave:()=>this.developerAction('restartWave'), selectWave:number=>this.selectWave(number), setCheat:(name,value)=>this.toggleCheat(name,value),
    });
  }
  update(dt) {
    if (this.input.take('confirm')) {
      if (this.state === 'menu') this.selectMode(false);
      else if (['select','gameOver','waveClear'].includes(this.state)) this.startStage();
      else if(this.state==='paused') { this.state='playing'; this.ui.screen(this); }
    }
    if (this.state === 'select') { const direction = Number(this.input.take('right')) - Number(this.input.take('left')); if (direction) { this.character = characters[(characters.indexOf(this.character) + direction + 4) % 4]; this.ui.screen(this); } }
    if (this.input.take('pause')) { if (this.state === 'playing' || this.state === 'paused') { this.ui.closeDeveloper(); this.state = this.state === 'playing' ? 'paused' : 'playing'; this.ui.screen(this); } else if (this.state === 'select') this.resetGame(); }
    if (this.developerMode && this.input.take('developer') && this.player) this.ui.toggleDeveloper(this);
    if (this.developerMode && this.player) for (const digit of this.input.shortcuts) { const cheats = { 1: 'invincible', 8: 'oneHitKill', 9: 'infiniteEnergy' }; if (cheats[digit]) this.toggleCheat(cheats[digit]); else this.developerAction({ 0: 'restart', 2: 'skip', 3: 'boss', 4: 'health', 5: 'defeat', 6: 'previous', 7: 'next' }[digit]); }
    if (this.state === 'playing' && !this.ui.developerOpen) this.updateCombat(dt);
    this.input.endFrame();
  }
}
