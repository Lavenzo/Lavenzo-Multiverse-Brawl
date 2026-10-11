export const playerAttacks = {
  punch: { duration: .28, windup: .08, active: .11, damage: 1, range: 1, lane: 28, knockback: 150 },
  kick: { duration: .28, windup: .1, active: .11, damage: 1.25, range: 1.2, lane: 32, knockback: 195 },
  strong: { duration: .48, windup: .16, active: .18, damage: 1.8, range: 1.3, lane: 32, knockback: 235 },
  special: { duration: .48, windup: .12, active: .22, damage: 2.25, range: 1.6, lane: 43, knockback: 280 },
};
export function playerAttack(config, action) {
  const base = playerAttacks[action];
  return { ...base, kind: action, damage: config.damage*base.damage, range: config.range*base.range,
    radial: action==='special' && config.id==='leonardo',
    ...(action==='special' && ['spiderman','cyclops'].includes(config.id) ? {range:240} : {}),
  };
}
export function beginAttack(actor, profile) {
  actor.attack = { ...profile, elapsed: 0, hitIds: new Set(), facing: actor.facing };
  actor.state = profile.kind; actor.actionDuration = profile.duration; actor.actionTime = profile.duration;
}
