import { CollisionManager } from '../engine/CollisionManager.js';
export class CombatSystem {
  update(dt,player,enemies,cheats={}) {
    this.resolve(dt,player,enemies,cheats);
    for(const enemy of enemies) this.resolve(dt,enemy,[player],cheats);
    CollisionManager.separate(player,enemies);
  }
  resolve(dt,source,targets,cheats) {
    const attack=source.attack; if(!attack || source.health<=0) return;
    const previous=attack.elapsed; attack.elapsed+=dt;
    if(attack.elapsed>=attack.windup && previous<=attack.windup+attack.active) for(const target of targets) {
      if(attack.hitIds.has(target.id) || !CollisionManager.canHit(source,target,attack)) continue;
      // Record contact even during invulnerability: the same swing cannot retry a target.
      attack.hitIds.add(target.id);
      if(target.team==='player' && cheats.invincible) continue;
      target.receiveDamage(source.team==='player' && cheats.oneHitKill?target.health:attack.damage,source,attack);
    }
    if(attack.elapsed>=attack.duration) { source.attack=null; source.actionTime=0; }
  }
}
