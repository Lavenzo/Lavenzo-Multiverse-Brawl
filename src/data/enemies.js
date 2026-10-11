// Identity, tier and difficulty are independent. Add new identities without new AI classes.
const punch = { name: 'Punch', kind: 'punch', damage: 1, range: 68, lane: 25, duration: .62, windup: .3, active: .12, knockback: 100 };
const kick = { name: 'Kick', kind: 'kick', damage: 1.15, range: 86, lane: 28, duration: .7, windup: .36, active: .12, knockback: 140 };
export const enemyDefinitions = {
  streetfighter: { id: 'streetfighter', name: 'Street Fighter', tier: 'regular', health: 42, damage: 6, speed: 100, attackSpeed: 1, range: 68, cooldown: 1.4, resistance: .05, aggression: .65, difficulty: 1, specialAbility: null, color: '#ec9578', accent: '#e56461', scale: 1, score: 100, attacks: [punch,kick] },
  roman: { id: 'roman', name: 'Roman Reigns', tier: 'regular', health: 56, damage: 7, speed: 108, attackSpeed: 1, range: 70, cooldown: 1.5, resistance: .08, aggression: .7, difficulty: 1, specialAbility: 'Superman Punch', color: '#c8946d', accent: '#e55a58', scale: 1.03, score: 120, attacks: [punch,kick,{ name: 'Superman Punch', kind: 'strong', damage: 1.5, range: 92, lane: 28, duration: .85, windup: .48, active: .14, knockback: 165, dash: 220 }] },
  seth: { id: 'seth', name: 'Seth Rollins', tier: 'regular', health: 50, damage: 6, speed: 128, attackSpeed: 1.15, range: 72, cooldown: 1.35, resistance: .05, aggression: .8, difficulty: 1, specialAbility: 'Stomp', color: '#eac096', accent: '#e2bd57', scale: 1, score: 120, attacks: [punch,kick,{ name: 'Stomp', kind: 'special', damage: 1.5, range: 80, lane: 26, duration: .85, windup: .5, active: .12, knockback: 155 }] },
  shredder: { id: 'shredder', name: 'Shredder', tier: 'elite', health: 100, damage: 10, speed: 144, attackSpeed: 1.1, range: 92, cooldown: 1.25, resistance: .25, aggression: .95, difficulty: 1, specialAbility: 'Blade Dash', color: '#b7b9cb', accent: '#be85de', scale: 1.06, score: 250, attacks: [{...punch,name:'Blade Slash',range:92,kind:'strong',windup:.3},{...kick,name:'Armored Kick',range:95},{name:'Blade Dash',kind:'special',damage:1.5,range:105,lane:28,duration:.9,windup:.5,active:.15,knockback:200,dash:450}] },
  venom: { id: 'venom', name: 'Venom', tier: 'miniboss', health: 260, damage: 14, speed: 95, attackSpeed: 1, range: 110, cooldown: 1.6, resistance: .35, aggression: .85, difficulty: 1, specialAbility: 'Tendril Lash', color: '#c1dbe1', accent: '#97b8d7', scale: 1.3, score: 600, attacks: [{...punch,name:'Heavy Smash',kind:'strong',range:110,damage:1.3,windup:.45,knockback:230},{name:'Tendril Lash',kind:'special',damage:1.1,range:210,lane:32,duration:1,windup:.6,active:.15,knockback:220},{...kick,name:'Crushing Kick',range:120,damage:1.4,windup:.5,knockback:260}] },
};
export const futureEnemies = ['Magneto','Apocalypse','Juggernaut','Thanos','Ultron','Darkseid'].map(name => ({ name, implemented: false }));
export function resolveEnemy(identity, difficulty = 1, overrides = {}) {
  const base = Object.values(enemyDefinitions).find(e => e.id === identity || e.name.toLowerCase() === String(identity).toLowerCase());
  if(!base || !Number.isFinite(difficulty) || difficulty < .5 || difficulty > 2) return null;
  return { ...base, ...overrides, id: base.id, name: base.name, tier: base.tier, difficulty,
    health: Math.round((overrides.health ?? base.health)*difficulty),
    damage: (overrides.damage ?? base.damage)*(.65+.35*difficulty),
    speed: (overrides.speed ?? base.speed)*(.85+.15*difficulty),
    attackSpeed: (overrides.attackSpeed ?? base.attackSpeed)*(.9+.1*difficulty),
  };
}

