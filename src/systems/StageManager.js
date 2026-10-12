import { stage1Waves, stage1Boss, stage2Waves, stage2Boss } from '../data/waves.js';
import { bounds } from '../engine/CollisionManager.js';
export { stage1Waves, stage2Waves } from '../data/waves.js';
// Stage 1 lifecycle: four waves, then warning -> entrance -> boss -> defeated -> cleared.
export class StageManager {
  constructor(game) { this.game=game; this.wave=1; this.transition=-1; this.sandbox=false; this.complete=false; this.phase='waves'; this.phaseTime=0; this.boss=null; }
  get wavesData() { return this.game.stage.number === 2 ? stage2Waves : stage1Waves; }
  get bossData() { return this.game.stage.number === 2 ? stage2Boss : stage1Boss; }
  setPhase(phase) { this.phase=phase; this.phaseTime=0; }
  startWave(number) {
    const waves = this.wavesData;
    if(!Number.isInteger(number) || number<1 || number>waves.length) return false;
    this.wave=number; this.transition=-1; this.sandbox=false; this.complete=false; this.boss=null; this.setPhase('waves'); this.game.enemies=[];
    const wave=waves[number-1],p=this.game.player;
    wave.enemies.forEach((id,i)=>this.game.createEnemy(id,wave.difficulty,{x:Math.max(90,Math.min(2280,p.x+330+i*115)),y:Math.max(375,Math.min(495,p.y+(i%2?40:-25)))}));
    return true;
  }
  update(dt) {
    if(this.sandbox) return;
    this.phaseTime+=dt;
    if(this.phase!=='waves') { this.updateBoss(); return; }
    if(this.complete) return;
    if(this.game.enemies.some(e=>e.health>0)) { this.transition=-1; return; }
    if(this.transition<0) this.transition=.95;
    this.transition-=dt;
    if(this.transition<=0) {
      if(this.wave<this.wavesData.length) this.startWave(this.wave+1);
      else { this.complete=true; this.game.finishWaves(); }
    }
  }
  skipWave() { if(this.phase!=='waves') return false; const waves = this.wavesData; return this.wave<waves.length?this.startWave(this.wave+1):(this.complete=true,this.game.finishWaves(),true); }
  clearEnemies() { this.game.enemies=[]; this.transition=-1; this.sandbox=true; this.boss=null; this.setPhase('waves'); }
  // The boss is an ordinary enemies entry, so CombatSystem, scoring and rendering reuse it.
  beginBoss({intro=true}={}) {
    this.game.enemies=[]; this.wave=this.wavesData.length; this.transition=-1; this.sandbox=false; this.complete=true; this.boss=null;
    if(intro) { this.setPhase('warning'); return true; }
    return this.spawnBoss(false);
  }
  spawnBoss(entrance) {
    const p=this.game.player, bossConf = this.bossData; if(!p) return false;
    const distance=entrance?bossConf.entranceDistance:bossConf.spawnDistance,side=p.x+distance<=bounds.right-40?1:-1;
    const boss=this.game.createEnemy(bossConf.id,bossConf.difficulty,{x:p.x+side*distance,y:p.y});
    if(!boss) return false;
    this.boss=boss;
    if(entrance) { boss.beginEntrance(p.x+side*bossConf.mark); this.setPhase('entrance'); }
    else { boss.facing=-side; this.setPhase('boss'); }
    return true;
  }
  updateBoss() {
    const bossConf = this.bossData;
    if(this.phase==='warning') { if(this.phaseTime>=bossConf.warning) this.spawnBoss(true); return; }
    const boss=this.boss; if(!boss) return;
    if(this.phase==='entrance' && boss.health>0 && !boss.entrance) this.setPhase('boss');
    else if((this.phase==='entrance' || this.phase==='boss') && boss.health<=0) this.setPhase('defeated');
    else if(this.phase==='defeated' && this.phaseTime>=bossConf.outro) { this.setPhase('cleared'); this.game.finishStage(); }
  }
}
