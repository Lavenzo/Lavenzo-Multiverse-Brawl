import { Enemy } from './Enemy.js';
import { beginAttack } from '../data/combat.js';
import { CollisionManager, bounds } from '../engine/CollisionManager.js';
// Stage boss controller. Damage, invulnerability and active windows stay in Fighter/CombatSystem;
// this class only chooses moves, moves the body during a charge and reacts to being hit.
// Fairness rules: every move has a telegraphed windup, any contact forces a backoff longer than the
// player's invulnerability, and queued follow-ups are dropped once a hit connects.
export class Boss extends Enemy {
  constructor(config,x,y,index=0) {
    super(config,x,y,index);
    const rules=config.boss; this.bodyRadius=rules.bodyRadius; this.cooldown=rules.openingDelay;
    this.enraged=false; this.entrance=null; this.lastAttack=null; this.followUp=null; this.reaction=null;
    this.recentHits=[]; this.provoked=false; this.kiting=0; this.closeAttacks=0; this.lastFinisher=null; this.hitFlash=0; this.hop=0;
    this.timers={ charge:rules.timers.charge*.5, slam:rules.timers.slam*.5 };
  }
  get rules() { return this.config.boss; }
  role(id) { return this.rules.roles?.[id] ?? id; }
  modifier(key) { return this.enraged ? this.rules.enrage[key] : 1; }
  move(id) {
    id=this.role(id);
    const m={ ...this.rules.moves[id], ...(this.enraged ? this.rules.enrage.moves?.[id] : null) };
    const speed=this.config.attackSpeed*this.modifier('attackSpeed');
    return { ...m, damage:m.damage*this.config.damage*this.modifier('damage'), duration:m.duration/speed, windup:m.windup/speed, active:m.active/speed, ...(m.charge ? { charge:m.charge*speed } : {}) };
  }
  beginEntrance(targetX) {
    this.entrance={ targetX:Math.max(bounds.left,Math.min(bounds.right,targetX)), walk:true, time:0, pose:this.rules.introPose };
    this.invulnerability=60; this.facing=Math.sign(targetX-this.x) || -1; this.state='walk';
  }
  update(dt,player) {
    this.hitFlash=Math.max(0,this.hitFlash-dt);
    for(const key of Object.keys(this.timers)) this.timers[key]=Math.max(0,this.timers[key]-dt);
    const canAct=this.tickStatus(dt); this.settle();
    if(!canAct) { this.aiState=this.health>0?(Math.abs(this.knockbackX)>30?'knockback':'hurt'):'defeated'; return; }
    if(this.entrance) { this.updateEntrance(dt,player); return; }
    if(this.attack) { this.aiState='attack'; this.attackMotion(dt); return; }
    if(this.reaction) { const id=this.reaction; this.reaction=null; this.perform(id); return; }
    if(this.hop) { this.updateBackstep(dt); return; }
    if(player.health<=0) { this.followUp=null; this.state='idle'; this.aiState='idle'; return; }
    this.decide(dt,player);
  }
  updateEntrance(dt,player) {
    const e=this.entrance,rules=this.rules; e.time+=dt; this.aiState='entrance';
    if(e.walk) {
      const dx=e.targetX-this.x,dy=player.y-this.y;
      if(Math.abs(dx)>3 && Math.abs(player.x-this.x)>rules.introDistance && e.time<rules.introWalk) {
        this.x+=Math.sign(dx)*Math.min(Math.abs(dx),rules.entranceSpeed*dt); this.y+=Math.sign(dy)*Math.min(Math.abs(dy),rules.entranceSpeed*.35*dt);
        CollisionManager.clamp(this); this.facing=Math.sign(dx); this.state='walk'; return;
      }
      e.walk=false; this.facing=Math.sign(player.x-this.x) || this.facing; this.actionDuration=this.actionTime=e.pose;
    }
    this.state='intro'; e.pose-=dt;
    if(e.pose<=0) { this.entrance=null; this.invulnerability=0; this.state='idle'; this.actionTime=0; this.cooldown=Math.max(this.cooldown,rules.openingDelay); }
  }
  // Runs once after each attack ends (completed or interrupted).
  settle() {
    const last=this.lastAttack; if(!last || this.attack===last) return;
    this.lastAttack=null;
    if(last.hitIds.size) { this.cooldown=Math.max(this.cooldown,this.rules.backoff); this.followUp=null; this.recentHits.length=0; if(this.reaction==='shove') this.reaction=null; }
    else if(last.followUp && last.elapsed>=last.duration) this.followUp=last.followUp;
  }
  decide(dt,player) {
    const dx=player.x-this.x,dy=player.y-this.y,adx=Math.abs(dx),ady=Math.abs(dy);
    if(adx>1) this.facing=Math.sign(dx);
    this.kiting=adx>=this.rules.chargeRange[0]?this.kiting+dt:0;
    const id=this.choose(adx,ady,(player.bodyRadius || 18)-6);
    if(id) this.perform(id); else this.approach(dt,dx,dy,adx,ady);
  }
  // body: the target's body radius less a small margin, matching CombatSystem's range check.
  choose(adx,ady,body) {
    const rules=this.rules;
    if(this.followUp) {
      const id=this.followUp,m=this.move(id),reach=id==='charge'?rules.chargeRange[1]:(m.shockwave?.to ?? m.range)+body; this.followUp=null;
      if(adx<=reach && ady<=m.lane) return id;
    }
    if(this.cooldown>0) return null;
    if(this.timers.charge<=0 && ady<=rules.chargeLane && adx>=rules.chargeRange[0] && adx<=rules.chargeRange[1] && (this.kiting>=rules.kiteTime || this.provoked)) return 'charge';
    // Close range: a punch string ending in a hook, then a finisher. Finishers alternate between the
    // Ground Slam and a backstep into Bull Charge; the slam also answers a player dodging between lanes.
    const slam=this.move('slam'),punch=this.move('punch'),combo=this.enraged?rules.enrage.combo:rules.combo;
    const slamReady=this.timers.slam<=0 && adx<=slam.range+body && ady<=slam.lane;
    const chargeReady=this.timers.charge<=0 && ady<=rules.chargeLane && adx<rules.chargeRange[0];
    if(slamReady && ady>punch.lane-4) return 'slam';
    if(this.closeAttacks>=combo) for(const id of this.lastFinisher==='slam'?['backstep','slam']:['slam','backstep']) if(id==='slam'?slamReady:chargeReady) return id;
    if(adx<=punch.range+body && ady<=punch.lane-4) return rules.sequence?.[this.closeAttacks%rules.sequence.length] ?? (this.closeAttacks%combo===combo-1?'hook':'punch');
    return null;
  }
  perform(id) {
    if(id==='backstep') { this.hop=this.rules.backstep.time; this.state='backstep'; this.aiState='backstep'; return; }
    const m=this.move(id),rules=this.rules;
    beginAttack(this,m); this.attack.originX=this.x; this.lastAttack=this.attack; this.aiState='attack';
    this.cooldown=m.duration+this.config.cooldown*this.modifier('cooldown')/this.config.aggression;
    if(m.guard) this.invulnerability=Math.max(this.invulnerability,m.windup+m.active+.05);
    if(id==='charge') { this.timers.charge=rules.timers.charge*this.modifier('timers'); this.provoked=false; this.kiting=0; this.closeAttacks=0; this.lastFinisher='charge'; }
    if(id==='slam') { this.timers.slam=rules.timers.slam*this.modifier('timers'); this.closeAttacks=0; this.lastFinisher='slam'; }
    if(id==='punch' || id==='hook' || this.rules.sequence?.includes(id)) this.closeAttacks++;
  }
  // Movement inside an attack: the charge travels during its active window and stops on contact;
  // the enraged slam's shockwave widens the same hit range CombatSystem checks.
  attackMotion(dt) {
    const a=this.attack,next=a.elapsed+dt;
    if(a.charge && next>=a.windup && next<=a.windup+a.active && !a.hitIds.size && !a.stalled) {
      const from=this.x; this.x+=a.facing*a.charge*dt; CollisionManager.clamp(this); a.stalled=this.x===from;
    }
    if(a.shockwave && next>=a.windup) a.range=a.shockwave.from+(a.shockwave.to-a.shockwave.from)*Math.min(1,(next-a.windup)/a.active);
  }
  updateBackstep(dt) {
    this.hop=Math.max(0,this.hop-dt); this.x-=this.facing*this.rules.backstep.speed*dt; CollisionManager.clamp(this);
    this.state='backstep'; this.aiState='backstep'; if(!this.hop) this.followUp='charge';
  }
  approach(dt,dx,dy,adx,ady) {
    const speed=this.config.speed*this.modifier('speed'),mx=adx>this.rules.standoff?Math.sign(dx):0,my=ady>6?Math.sign(dy):0;
    if(!mx && !my) { this.state='idle'; this.aiState='idle'; return; }
    const step=speed*dt/Math.hypot(mx,my);
    this.x+=mx*Math.min(adx-this.rules.standoff,step); this.y+=my*Math.min(ady,step*.7);
    CollisionManager.clamp(this); this.state='walk'; this.aiState='approach';
  }
  receiveDamage(damage,source,attack) {
    const current=this.attack,armored=Boolean(current?.armor) || this.hop>0,state=this.state,time=this.actionTime,length=this.actionDuration;
    if(!super.receiveDamage(damage,source,attack)) return false;
    this.hitFlash=.14;
    if(this.health<=0) { this.entrance=null; this.reaction=null; this.followUp=null; this.actionDuration=this.actionTime=this.rules.defeatFall; return true; }
    // Super armor: the hit still damages and grants invulnerability, but the heavy move continues.
    if(armored) { this.attack=current; this.state=state; this.actionTime=time; this.actionDuration=length; this.stun=0; this.knockbackX*=.25; }
    else this.stun=Math.min(this.stun,this.rules.flinch);
    this.react(source);
    return true;
  }
  // Rapid hits trigger a guarded break-out shove; ranged harassment provokes a charge; 50% enrages.
  react(source) {
    const rules=this.rules,limit=this.enraged?rules.enrage.breakoutHits:rules.breakout.hits;
    this.recentHits=this.recentHits.filter(t=>this.time-t<rules.breakout.window); this.recentHits.push(this.time);
    if(this.recentHits.length>=limit && !this.reaction) { this.reaction='shove'; this.recentHits.length=0; }
    if(source && Math.abs(source.x-this.x)>rules.provokeRange) this.provoked=true;
    if(!this.enraged && this.health<=this.maxHealth*rules.enrage.threshold) this.enrage();
  }
  enrage() {
    this.enraged=true; this.reaction='roar'; this.followUp=null; this.attack=null; this.hop=0; this.stun=0; this.recentHits.length=0;
    this.invulnerability=Math.max(this.invulnerability,.3);
  }
  // Developer health override; crossing the threshold triggers the same phase change as damage.
  setHealth(value) { this.health=value; if(!this.enraged && value<=this.maxHealth*this.rules.enrage.threshold) this.enrage(); }
}
