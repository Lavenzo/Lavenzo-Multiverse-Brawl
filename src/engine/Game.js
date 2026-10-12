import { characters } from '../data/characters.js';
import { stages } from '../data/stages.js';
import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { GameLoop } from './GameLoop.js';
import { Renderer } from './Renderer.js';
import { ProgressManager } from '../systems/ProgressManager.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { resolveEnemy } from '../data/enemies.js';
import { CombatSystem } from '../combat/CombatSystem.js';
import { StageManager } from '../systems/StageManager.js';
export class Game {
  constructor(ui) { this.ui = ui; this.input = new InputManager(); this.progress = new ProgressManager(); this.state = 'menu'; this.character = characters[0]; this.stage = stages[0]; this.developerMode = false; this.enemies=[]; this.enemyDifficulty=1; this.combat=new CombatSystem(); this.waves=new StageManager(this); this.resetCheats(); this.renderer = new Renderer(document.querySelector('canvas')); this.loop = new GameLoop(dt => this.update(dt), () => { this.renderer.draw(this); this.ui.hud(this); }); }
  resetCheats() { this.cheats = { invincible: false, infiniteLives: false, infiniteEnergy: false, oneHitKill: false, debug: false }; }
  selectMode(developer) { this.developerMode = developer; this.resetCheats(); this.state = 'select'; this.syncAPI(); this.ui.screen(this); }
  startStage(number = 1) {
    if (number !== 1 && number !== 2) return false;
    this.stage = stages[number - 1];
    if (number === 1 || !this.player) { this.player = new Player(this.character); this.score=0; this.lives=3; }
    else if (number === 2 && this.player) {
      this.player.health = Math.min(this.character.health, this.player.health + Math.round(this.character.health * 0.4));
      this.player.energy = 100; this.player.stun=0; this.player.deathTime=0; this.player.invulnerability=.8; this.player.attack=null; this.player.state='idle'; this.player.actionTime=0;
    }
    this.enemyDifficulty=1; this.state = 'playing'; this.waves.startWave(1); this.input.clear(); this.ui.closeDeveloper(); this.ui.screen(this); return true;
  }
  resetGame() { this.state = 'menu'; this.player = null; this.enemies=[]; this.developerMode = false; this.enemyDifficulty=1; this.resetCheats(); this.input.clear(); this.syncAPI(); this.ui.closeDeveloper(); this.ui.screen(this); }
  toggleCheat(name, enabled = !this.cheats[name]) { if (!this.developerMode || !(name in this.cheats)) return false; this.cheats[name] = Boolean(enabled); this.ui.refreshDeveloper(this); return true; }
  developerAction(action) {
    if (!this.developerMode) return false;
    if (action === 'restart') return this.startStage(this.stage.number);
    if (action === 'health' && this.player) { this.player.health = this.character.health; this.player.energy = 100; this.player.stun=0; this.player.deathTime=0; this.player.invulnerability=.8; this.player.attack=null; this.player.state='idle'; this.player.actionTime=0; return true; }
    if(action==='defeat') { for(const e of this.enemies) if(e.config.tier==='regular') { e.invulnerability=0; e.receiveDamage(e.health,this.player,{knockback:0,facing:this.player.facing}); e.scored=true; } return true; }
    if(action==='clear') { this.waves.clearEnemies(); return true; }
    if(action==='skipWave') { const skipped=this.waves.skipWave(); if(!skipped) this.ui.notify('The boss encounter is not a wave. Use the boss tools.'); return skipped; }
    if(action==='restartWave') return this.selectWave(this.waves.wave);
    if(action==='boss') return this.startBossEncounter();
    if(action==='skip') { if (this.stage.number === 1) return this.startStage(2); }
    this.ui.notify('Stage navigation remains deferred: Stages 3–8 are not implemented yet.'); return false;
  }
  createEnemy(identity,difficulty=1,position={}) {
    const config=resolveEnemy(identity,difficulty);
    if(!config || !this.player || this.enemies.filter(e=>e.health>0).length>=18) return false;
    const x=position.x ?? Math.min(2260,this.player.x+190),y=position.y ?? this.player.y;
    if(!Number.isFinite(x)||!Number.isFinite(y)) return false;
    const Controller=config.tier==='boss'?Boss:Enemy;
    const enemy=new Controller(config,x,y,this.enemies.length); this.enemies.push(enemy); return enemy;
  }
  // The Stage 1 encounter boss, kept through its defeat sequence, else any living boss-tier spawn.
  activeBoss() {
    const boss=this.waves.boss;
    if(boss && this.enemies.includes(boss)) return boss;
    return this.enemies.find(e=>e.health>0 && e.config.tier==='boss') || null;
  }
  // Developer boss tools. intro:false skips warning/entrance; restore:false keeps current health.
  startBossEncounter(options={}) {
    if(!this.developerMode || !this.player || !options || typeof options!=='object') return false;
    if(options.restore!==false || this.player.health<=0) this.developerAction('health');
    this.state='playing'; this.input.clear();
    const started=this.waves.beginBoss({intro:options.intro!==false});
    this.ui.closeDeveloper(); this.ui.screen(this); return started;
  }
  restartBossFight() { return this.startBossEncounter({intro:false,restore:true}); }
  setBossHealth(value) {
    const boss=this.activeBoss();
    if(!this.developerMode || !boss || boss.health<=0 || !Number.isInteger(value) || value<1 || value>boss.maxHealth) return false;
    boss.setHealth(value); return true;
  }
  defeatBoss() {
    const boss=this.activeBoss();
    if(!this.developerMode || !boss || boss.health<=0) return false;
    boss.invulnerability=0; boss.receiveDamage(boss.health,this.player,{knockback:0,facing:this.player.facing}); boss.scored=true; return true;
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
  // Four waves complete: the Kingpin encounter follows (the old Waves Cleared screen is gone).
  finishWaves() { return this.waves.beginBoss(); }
  finishStage() { this.state='stageClear'; this.input.clear(); this.ui.closeDeveloper(); this.saveBestScore(true); this.ui.screen(this); }
  // Normal runs only. Clearing Stage 1 is recorded, but no unfinished stage is unlocked.
  saveBestScore(stageCleared=false) {
    if(this.developerMode) return;
    const data=this.progress.data; data.bestScore=Math.max(data.bestScore,this.score);
    if(stageCleared) data.clearedStages=[...new Set([...(data.clearedStages || []),this.stage.number])];
    this.progress.save(false);
  }
  updateCombat(dt) {
    this.player.update(dt,this.input,this.cheats);
    for(const enemy of this.enemies) enemy.update(dt,this.player);
    this.combat.update(dt,this.player,this.enemies,this.cheats);
    for(const enemy of this.enemies) if(enemy.health<=0 && !enemy.scored) { this.score+=enemy.config.score; enemy.scored=true; }
    this.enemies=this.enemies.filter(e=>e.health>0 || e.deathTime<(e.config.corpseTime ?? 1.2));
    if(this.player.health<=0) {
      if(this.player.deathTime>.9) {
        if(this.lives>1 || this.cheats.infiniteLives) { const {x,y}=this.player; if(!this.cheats.infiniteLives) this.lives--; this.player=new Player(this.character); this.player.x=x; this.player.y=y; this.player.invulnerability=2; }
        else { this.state='gameOver'; this.input.clear(); this.ui.closeDeveloper(); this.saveBestScore(); this.ui.screen(this); }
      }
    } else this.waves.update(dt);
  }
  syncAPI() {
    if (!this.developerMode && import.meta.env.VITE_ENABLE_TEST_API !== 'true') { delete window.gameTestAPI; return; }
    window.gameTestAPI = Object.freeze({ getGameState: () => this.state, getCurrentStage: () => this.stage.number, getSelectedCharacter: () => this.character.id, getPlayerHealth: () => this.player?.health ?? 0, getEnemyCount: () => this.enemies.filter(e=>e.health>0).length, isBossActive: () => this.enemies.some(e=>e.health>0&&['miniboss','boss'].includes(e.config.tier)), startStage: n => this.startStage(n), skipStage: () => this.developerAction('skip'), spawnBoss: (options={}) => this.startBossEncounter(options), setInvincible: enabled => this.toggleCheat('invincible', enabled), resetGame: () => this.resetGame(), getPlayerSnapshot: () => this.player ? { x: this.player.x, y: this.player.y, z: this.player.z, facing: this.player.facing, state: this.player.state, energy: this.player.energy, health:this.player.health, lives:this.lives, score:this.score } : null,
      getEnemies:()=>this.enemies.map(e=>({id:e.id,name:e.config.name,tier:e.config.tier,health:e.health,maxHealth:e.maxHealth,x:e.x,y:e.y,state:e.state,aiState:e.aiState,difficulty:e.config.difficulty,attack:e.attack?.name||null})),
      getWave:()=>({number:this.waves.wave,sandbox:this.waves.sandbox,complete:this.waves.complete,phase:this.waves.phase}),
      spawnEnemy:(name,options)=>this.spawnEnemy(name,options), setEnemyDifficulty:value=>this.setEnemyDifficulty(value), clearEnemies:()=>this.developerAction('clear'), skipWave:()=>this.developerAction('skipWave'), restartWave:()=>this.developerAction('restartWave'), selectWave:number=>this.selectWave(number), setCheat:(name,value)=>this.toggleCheat(name,value),
      getBoss:()=>{ const b=this.activeBoss(); return {encounter:this.waves.phase,active:Boolean(b&&b.health>0),boss:b?{id:b.id,name:b.config.name,tier:b.config.tier,health:b.health,maxHealth:b.maxHealth,enraged:b.enraged,state:b.state,aiState:b.aiState,attack:b.attack?.name||null,entering:Boolean(b.entrance),invulnerable:b.invulnerability>0,x:b.x,y:b.y,difficulty:b.config.difficulty}:null}; },
      restartBoss:()=>this.restartBossFight(), setBossHealth:value=>this.setBossHealth(value), defeatBoss:()=>this.defeatBoss(), returnToStage:()=>this.developerAction('restart'),
    });
  }
  update(dt) {
    if (this.input.take('confirm')) {
      if (this.state === 'menu') this.selectMode(false);
      else if (['select'].includes(this.state)) this.startStage();
      // To progress from stage 1 to stage 2, use the UI buttons. Hitting enter repeats the current stage.
      else if (['gameOver', 'stageClear'].includes(this.state)) this.startStage(this.stage.number);
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
