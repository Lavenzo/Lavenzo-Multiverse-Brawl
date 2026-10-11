export class Player {
  constructor(config) { this.config = config; this.x = 190; this.y = 430; this.z = 0; this.vz = 0; this.facing = 1; this.health = config.health; this.energy = 100; this.state = 'idle'; this.actionTime = 0; this.cooldown = 0; this.time = 0; }
  update(dt, input, cheats) {
    this.time += dt; this.cooldown = Math.max(0, this.cooldown - dt); this.actionTime = Math.max(0, this.actionTime - dt);
    let dx = Number(input.down('right')) - Number(input.down('left')); let dy = Number(input.down('down')) - Number(input.down('up'));
    const length = Math.hypot(dx, dy) || 1; dx /= length; dy /= length;
    this.x = Math.max(35, Math.min(2365, this.x + dx * this.config.speed * dt)); this.y = Math.max(350, Math.min(515, this.y + dy * this.config.speed * 0.65 * dt));
    if (dx) this.facing = Math.sign(dx);
    if (input.take('jump') && this.z === 0) this.vz = 470;
    this.z = Math.max(0, this.z + this.vz * dt); this.vz -= 1150 * dt; if (!this.z) this.vz = 0;
    for (const action of ['punch', 'kick', 'strong', 'special']) {
      if (input.take(action) && this.cooldown === 0 && (action !== 'special' || cheats.infiniteEnergy || this.energy >= 25)) {
        this.state = action; this.actionTime = action === 'strong' || action === 'special' ? 0.48 : 0.28; this.cooldown = this.actionTime + 0.08;
        if (action === 'special' && !cheats.infiniteEnergy) this.energy -= 25;
      }
    }
    this.energy = Math.min(100, this.energy + dt * 7);
    if (!this.actionTime) this.state = this.z ? 'jump' : dx || dy ? 'walk' : 'idle';
  }
}
