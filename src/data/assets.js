// Paths are relative to public/, e.g. 'assets/characters/axel/idle-01.png'.
// Use individual transparent PNGs; no sprite-sheet cropping is required.
export const assetConfig = {
  characters: {
    axel: { width: 125, height: 180, fps: 10, animations: {} },
    leonardo: { width: 135, height: 180, fps: 10, animations: {} },
    spiderman: { width: 125, height: 180, fps: 12, animations: {} },
    cyclops: { width: 125, height: 180, fps: 10, animations: {} },
  },
  enemies: {
    ...Object.fromEntries(['streetfighter','roman','seth','shredder','venom'].map(id=>[id,{width:id==='venom'?180:135,height:id==='venom'?230:185,fps:10,animations:{}}])),
    // Kingpin states: idle, walk, intro, punch, strongAttack, charge, slam, shove, roar, backstep, hurt, defeated.
    kingpin: { width: 250, height: 265, fps: 10, animations: {} },
  },
  backgrounds: { city: null },
};
