import { cityWaves } from '../data/waves.js';
export { cityWaves } from '../data/waves.js';
export class StageManager {
  constructor(game) { this.game=game; this.wave=1; this.transition=-1; this.sandbox=false; this.complete=false; }
  startWave(number) {
    if(!Number.isInteger(number) || number<1 || number>cityWaves.length) return false;
    this.wave=number; this.transition=-1; this.sandbox=false; this.complete=false; this.game.enemies=[];
    const wave=cityWaves[number-1],p=this.game.player;
    wave.enemies.forEach((id,i)=>this.game.createEnemy(id,wave.difficulty,{x:Math.max(90,Math.min(2280,p.x+330+i*115)),y:Math.max(375,Math.min(495,p.y+(i%2?40:-25)))}));
    return true;
  }
  update(dt) {
    if(this.sandbox || this.complete) return;
    if(this.game.enemies.some(e=>e.health>0)) { this.transition=-1; return; }
    if(this.transition<0) this.transition=.95;
    this.transition-=dt;
    if(this.transition<=0) {
      if(this.wave<cityWaves.length) this.startWave(this.wave+1);
      else { this.complete=true; this.game.finishWaves(); }
    }
  }
  skipWave() { return this.wave<cityWaves.length?this.startWave(this.wave+1):(this.complete=true,this.game.finishWaves(),true); }
  clearEnemies() { this.game.enemies=[]; this.transition=-1; this.sandbox=true; }
}
