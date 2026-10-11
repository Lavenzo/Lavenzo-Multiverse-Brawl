import { CollisionManager } from '../engine/CollisionManager.js';
let nextId=1;
export class Fighter {
  constructor(config,team) {
    this.id=`${team}-${nextId++}`; this.config=config; this.team=team; this.health=config.health; this.maxHealth=config.health;
    this.x=190; this.y=430; this.z=0; this.facing=1; this.time=0; this.state='idle'; this.actionTime=0; this.actionDuration=0;
    this.attack=null; this.cooldown=0; this.invulnerability=0; this.stun=0; this.knockbackX=0; this.deathTime=0; this.bodyRadius=team==='player'?19:22;
  }
  tickStatus(dt) {
    this.time+=dt; this.cooldown=Math.max(0,this.cooldown-dt); this.invulnerability=Math.max(0,this.invulnerability-dt);
    this.actionTime=Math.max(0,this.actionTime-dt); this.stun=Math.max(0,this.stun-dt);
    this.x+=this.knockbackX*dt; this.knockbackX*=Math.exp(-9*dt); CollisionManager.clamp(this);
    if(this.health<=0) { this.deathTime+=dt; this.state='defeated'; return false; }
    if(this.stun>0) { this.state='hurt'; return false; }
    return true;
  }
  receiveDamage(damage,source,attack) {
    if(this.health<=0 || this.invulnerability>0) return false;
    this.health=Math.max(0,this.health-Math.round(damage)); this.attack=null;
    this.invulnerability=this.team==='player'?.8:.18; this.stun=this.health>0?.24:0;
    this.state=this.health>0?'hurt':'defeated'; this.actionDuration=this.health>0?.24:.65; this.actionTime=this.actionDuration;
    const direction=attack.radial?Math.sign(this.x-source.x)||source.facing:attack.facing??source.facing;
    this.knockbackX=direction*(attack.knockback ?? 150)*(1-(this.config.resistance || 0));
    return true;
  }
}
