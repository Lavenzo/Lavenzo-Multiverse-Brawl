export const stages = [
  ['City Streets', 'Mixed-universe regulars and elites', 'Street Enforcer (deferred)'], ['Underground Subway', 'Fast fighters', 'Armored Brute'],
  ['Industrial Factory', 'Industrial guards', 'Mechanical Destroyer'], ['Rooftop Pursuit', 'Agile assassins', 'Shadow Assassin'],
  ['Secret Laboratory', 'Mutant soldiers', 'Mutant Commander'], ['Enemy Fortress', 'Elite guards', 'Fortress Guardian'],
  ['Multiverse Portal', 'Mixed enemy factions', 'Dark Doppelganger'], ['Final Citadel', 'Elite mixed enemies', 'Multiverse Overlord'],
].map(([name, enemies, boss], i) => ({ number: i + 1, name, enemies, boss, implemented: false, preview: i === 0 }));
