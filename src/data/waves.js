// Wave composition and difficulty are data, not separate stage-specific AI engines.
export const cityWaves = [
  { name:'Opening Fight',difficulty:.75,enemies:['roman','streetfighter'] },
  { name:'Wrestling Encounter',difficulty:.85,enemies:['seth','roman'] },
  { name:'Mixed-Universe Attack',difficulty:.9,enemies:['shredder','roman','seth'] },
  { name:'Final Enemy Rush',difficulty:1,enemies:['shredder','streetfighter','roman'] },
];
// Stage 1 boss encounter after the final wave. Times are seconds; distances are logical pixels.
export const cityBoss = { id:'kingpin', difficulty:1, warning:2.4, entranceDistance:600, mark:290, spawnDistance:260, outro:2.8 };
