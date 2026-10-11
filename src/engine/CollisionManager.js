export const bounds = { left: 65, right: 2335, top: 365, bottom: 510 };
export class CollisionManager {
  static clamp(actor) {
    actor.x = Math.max(bounds.left,Math.min(bounds.right,actor.x));
    actor.y = Math.max(bounds.top,Math.min(bounds.bottom,actor.y));
  }
  static canHit(source, target, attack) {
    if(source.health<=0 || target.health<=0) return false;
    const dx=target.x-source.x, direction=attack.facing ?? source.facing;
    return (attack.radial || dx*direction >= -8) && Math.abs(dx)<=attack.range+(target.bodyRadius || 18)
      && Math.abs(target.y-source.y)<=attack.lane && Math.abs((target.z || 0)-(source.z || 0)) <= (attack.height ?? 55);
  }
  static separate(player,enemies) {
    const actors=[player,...enemies.filter(e=>e.health>0)];
    for(let i=0;i<actors.length;i++) for(let j=i+1;j<actors.length;j++) {
      const a=actors[i],b=actors[j]; if(a.health<=0 || Math.abs(a.y-b.y)>16 || Math.abs(a.z-b.z)>45) continue;
      const radius=a.bodyRadius+b.bodyRadius,dx=b.x-a.x;
      if(Math.abs(dx)<radius) {
        const push=(radius-Math.abs(dx))*.5,sign=dx===0?(j%2?1:-1):Math.sign(dx);
        if(a!==player) a.x-=sign*push;
        b.x+=sign*(a===player?push*2:push); this.clamp(a); this.clamp(b);
      }
    }
  }
}
