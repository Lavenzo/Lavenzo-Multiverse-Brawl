import { Fighter } from './Fighter.js';
import { beginAttack, playerAttack } from '../data/combat.js';
export class Player extends Fighter {
  constructor(config) { super(config,'player'); this.vz=0; this.energy=100; this.landingTime=0; }
  update(dt, input, cheats) {
    const canAct=this.tickStatus(dt); this.landingTime=Math.max(0,this.landingTime-dt);
    if(!canAct) { this.updateJump(dt); return; }
    let dx = Number(input.down('right')) - Number(input.down('left')); let dy = Number(input.down('down')) - Number(input.down('up'));
    const length = Math.hypot(dx, dy) || 1; dx /= length; dy /= length;
    this.x = Math.max(65, Math.min(2335, this.x + dx * this.config.speed * dt)); this.y = Math.max(365, Math.min(510, this.y + dy * this.config.speed * 0.65 * dt));
    if (dx && !this.attack) this.facing = Math.sign(dx);
    if (input.take('jump') && this.z === 0) this.vz = 470;
    this.updateJump(dt);
    for (const action of ['punch', 'kick', 'strong', 'special']) {
      if (input.take(action) && this.cooldown === 0 && (action !== 'special' || cheats.infiniteEnergy || this.energy >= 25)) {
        beginAttack(this,playerAttack(this.config,action)); this.cooldown=this.actionTime+.08;
        if (action === 'special' && !cheats.infiniteEnergy) this.energy -= 25;
      }
    }
    this.energy = Math.min(100, this.energy + dt * 7);
    if (!this.actionTime) this.state = this.z ? 'jump' : dx || dy ? 'walk' : 'idle';
  }
  updateJump(dt) {
    const wasAirborne=this.z>0;
    this.z=Math.max(0,this.z+this.vz*dt); this.vz-=1150*dt;
    if(!this.z) { this.vz=0; if(wasAirborne) this.landingTime=.16; }
  }
}
