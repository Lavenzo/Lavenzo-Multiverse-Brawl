import { Fighter } from './Fighter.js';
import { beginAttack } from '../data/combat.js';
import { CollisionManager } from '../engine/CollisionManager.js';
export class Enemy extends Fighter {
  constructor(config,x,y,index=0) {
    super(config,'enemy'); this.x=x; this.y=y; this.index=index; this.attackCount=0; this.aiState='idle';
    this.cooldown=.9+index*.2; this.bodyRadius=config.tier==='miniboss'?29:22; CollisionManager.clamp(this);
  }
  update(dt,player) {
    if(!this.tickStatus(dt)) { this.aiState=this.health>0?(Math.abs(this.knockbackX)>30?'knockback':'hurt'):'defeated'; return; }
    if(player.health<=0) { this.state='idle'; this.aiState='idle'; this.attack=null; return; }
    if(this.attack) {
      this.aiState='attack';
      if(this.attack.dash && this.attack.elapsed<this.attack.windup && this.attack.elapsed>this.attack.windup*.4) {
        const space=(player.x-this.x)*this.attack.facing-this.bodyRadius-player.bodyRadius-5;
        if(space>0) this.x+=this.attack.facing*Math.min(space,this.attack.dash*dt); CollisionManager.clamp(this);
      }
      return;
    }
    const profile=this.config.attacks[this.attackCount%this.config.attacks.length];
    const range=profile.range*(this.config.range/this.config.attacks[0].range);
    const dx=player.x-this.x,dy=player.y-this.y; if(Math.abs(dx)>1) this.facing=Math.sign(dx);
    if(Math.abs(dx)<=range && Math.abs(dy)<=profile.lane && player.z<55) {
      this.state='idle'; this.aiState='idle';
      if(this.cooldown<=0) {
        const attack={...profile,range,damage:profile.damage*this.config.damage,
          duration:profile.duration/this.config.attackSpeed,windup:profile.windup/this.config.attackSpeed,active:profile.active/this.config.attackSpeed};
        beginAttack(this,attack); this.attackCount++; this.cooldown=attack.duration+this.config.cooldown/(this.config.attackSpeed*this.config.aggression); this.aiState='attack';
      }
    } else {
      this.aiState='approach'; this.state='walk';
      const mx=Math.abs(dx)>range*.75?dx:0,my=Math.abs(dy)>8?dy:0,len=Math.hypot(mx,my)||1;
      this.x+=mx/len*this.config.speed*dt; this.y+=my/len*this.config.speed*.7*dt; CollisionManager.clamp(this);
    }
  }
}
