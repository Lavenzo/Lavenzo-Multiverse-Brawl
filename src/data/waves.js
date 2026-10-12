// Wave composition and difficulty are data, not separate stage-specific AI engines.
export const stage1Waves = [
  { name:'Opening Fight',difficulty:.75,enemies:['roman','streetfighter'] },
  { name:'Wrestling Encounter',difficulty:.85,enemies:['seth','roman'] },
  { name:'Mixed-Universe Attack',difficulty:.9,enemies:['shredder','roman','seth'] },
  { name:'Final Enemy Rush',difficulty:1,enemies:['shredder','streetfighter','roman'] },
];
// Stage 1 boss encounter after the final wave. Times are seconds; distances are logical pixels.
export const stage1Boss = { id:'kingpin', difficulty:1, warning:2.4, entranceDistance:600, mark:290, spawnDistance:260, outro:2.8 };

export const stage2Waves = [
  { name:'Arena Security',difficulty:.8,enemies:['guard1','guard2'] },
  { name:'Wrestling Mayhem',difficulty:.85,enemies:['owens','guard1','guard2'] },
  { name:'Mutant Assault',difficulty:.95,enemies:['sabretooth','guard2'] },
  { name:'Fight Club Chaos',difficulty:1,enemies:['sabretooth','owens','guard1'] },
];
export const stage2Boss = { id:'tyson', difficulty:1, warning:2.5, entranceDistance:600, mark:290, spawnDistance:260, outro:3.0 };
