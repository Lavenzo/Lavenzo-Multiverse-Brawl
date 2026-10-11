import { characters } from '../data/characters.js';
import { stages } from '../data/stages.js';
import { Player } from '../entities/Player.js';
import { InputManager } from './InputManager.js';
import { GameLoop } from './GameLoop.js';
import { Renderer } from './Renderer.js';
import { ProgressManager } from '../systems/ProgressManager.js';
export class Game {
  constructor(ui) { this.ui = ui; this.input = new InputManager(); this.progress = new ProgressManager(); this.state = 'menu'; this.character = characters[0]; this.stage = stages[0]; this.developerMode = false; this.resetCheats(); this.renderer = new Renderer(document.querySelector('canvas')); this.loop = new GameLoop(dt => this.update(dt), () => { this.renderer.draw(this); this.ui.hud(this); }); }
  resetCheats() { this.cheats = { invincible: false, infiniteLives: false, infiniteEnergy: false, oneHitKill: false, debug: false }; }
  selectMode(developer) { this.developerMode = developer; this.resetCheats(); this.state = 'select'; this.syncAPI(); this.ui.screen(this); }
  startStage(number = 1) { if (number !== 1) return false; this.stage = stages[0]; this.player = new Player(this.character); this.state = 'playing'; this.input.clear(); this.ui.closeDeveloper(); this.ui.screen(this); return true; }
  resetGame() { this.state = 'menu'; this.player = null; this.developerMode = false; this.resetCheats(); this.input.clear(); this.syncAPI(); this.ui.closeDeveloper(); this.ui.screen(this); }
  toggleCheat(name, enabled = !this.cheats[name]) { if (!this.developerMode || !(name in this.cheats)) return false; this.cheats[name] = Boolean(enabled); this.ui.refreshDeveloper(this); return true; }
  developerAction(action) {
    if (!this.developerMode) return false;
    if (action === 'restart') return this.startStage(1);
    if (action === 'health' && this.player) { this.player.health = this.character.health; this.player.energy = 100; return true; }
    this.ui.notify('Unavailable in Milestone 1: enemy combat and stage progression are not implemented.'); return false;
  }
  syncAPI() {
    if (!this.developerMode && import.meta.env.VITE_ENABLE_TEST_API !== 'true') { delete window.gameTestAPI; return; }
    window.gameTestAPI = Object.freeze({ getGameState: () => this.state, getCurrentStage: () => this.stage.number, getSelectedCharacter: () => this.character.id, getPlayerHealth: () => this.player?.health ?? 0, getEnemyCount: () => 0, isBossActive: () => false, startStage: n => this.startStage(n), skipStage: () => this.developerAction('skip'), spawnBoss: () => this.developerAction('boss'), setInvincible: enabled => this.toggleCheat('invincible', enabled), resetGame: () => this.resetGame(), getPlayerSnapshot: () => this.player ? { x: this.player.x, y: this.player.y, z: this.player.z, state: this.player.state, energy: this.player.energy } : null });
  }
  update(dt) {
    if (this.input.take('confirm')) { if (this.state === 'menu') this.selectMode(false); else if (this.state === 'select') this.startStage(); }
    if (this.state === 'select') { const direction = Number(this.input.take('right')) - Number(this.input.take('left')); if (direction) { this.character = characters[(characters.indexOf(this.character) + direction + 4) % 4]; this.ui.screen(this); } }
    if (this.input.take('pause')) { if (this.state === 'playing' || this.state === 'paused') { this.ui.closeDeveloper(); this.state = this.state === 'playing' ? 'paused' : 'playing'; this.ui.screen(this); } else if (this.state === 'select') this.resetGame(); }
    if (this.developerMode && this.input.take('developer') && this.player) this.ui.toggleDeveloper(this);
    if (this.developerMode && this.player) for (const digit of this.input.shortcuts) { const cheats = { 1: 'invincible', 8: 'oneHitKill', 9: 'infiniteEnergy' }; if (cheats[digit]) this.toggleCheat(cheats[digit]); else this.developerAction({ 0: 'restart', 2: 'skip', 3: 'boss', 4: 'health', 5: 'defeat', 6: 'previous', 7: 'next' }[digit]); }
    if (this.state === 'playing' && !this.ui.developerOpen) this.player.update(dt, this.input, this.cheats);
    this.input.endFrame();
  }
}
