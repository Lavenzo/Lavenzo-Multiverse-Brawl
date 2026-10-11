import { test, expect } from '@playwright/test';

test('all four heroes can clear four waves without cheats in deterministic combat simulation',async({page})=>{
  await page.goto('/');
  const results=await page.evaluate(async()=>{
    const {Game}=await import('/src/engine/Game.js');const {characters}=await import('/src/data/characters.js');const {CombatSystem}=await import('/src/combat/CombatSystem.js');const {StageManager}=await import('/src/systems/StageManager.js');
    return characters.map(character=>{
      let saved=0,dx=0,dy=0,action=''; const game=Object.create(Game.prototype);
      Object.assign(game,{character,developerMode:false,cheats:{},enemies:[],combat:new CombatSystem(),input:{clear(){},down(key){return key==='right'?dx>0:key==='left'?dx<0:key==='up'?dy<0:key==='down'?dy>0:false;},take(key){return key===action;}},ui:{closeDeveloper(){},screen(){}},progress:{data:{bestScore:0},save(){saved++;}}});
      game.waves=new StageManager(game);game.startStage(1);
      let elapsed=0;
      while(game.state==='playing' && elapsed<100) {
        const p=game.player,target=game.enemies.filter(e=>e.health>0).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
        dx=0;dy=0;action='';
        if(target) {
          const distance=target.x-p.x,lane=target.y-p.y;
          dx=Math.abs(distance)>55?Math.sign(distance):0; dy=Math.abs(lane)>9?Math.sign(lane):0;
          // Face the target before an attack; keep the same once-per-press/cooldown path.
          if(!p.attack && p.facing!==Math.sign(distance)) dx=Math.sign(distance);
          if(Math.abs(lane)<28 && Math.abs(distance)<105 && p.cooldown<=0) action=p.energy>=25?'special':Math.abs(distance)<80?'strong':'';
        }
        game.updateCombat(1/60);elapsed+=1/60;
      }
      return {hero:character.id,state:game.state,lives:game.lives,health:game.player.health,score:game.score,saved,seconds:Math.round(elapsed)};
    });
  });
  await test.info().attach('balance-simulation',{body:JSON.stringify(results,null,2),contentType:'application/json'});
  for(const result of results) { expect(result.state,JSON.stringify(result)).toBe('waveClear');expect(result.score).toBe(1420);expect(result.saved).toBe(1);expect(result.lives).toBeGreaterThan(0); }
});

test('player defeat consumes lives, game over/retry works, infinite lives stays isolated',async({page})=>{
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const {Game}=await import('/src/engine/Game.js');const {characters}=await import('/src/data/characters.js');const {Enemy}=await import('/src/entities/Enemy.js');const {resolveEnemy}=await import('/src/data/enemies.js');const {CombatSystem}=await import('/src/combat/CombatSystem.js');const {StageManager}=await import('/src/systems/StageManager.js');
    const run=infinite=>{
      let saved=0;const g=Object.create(Game.prototype);Object.assign(g,{character:{...characters[0],health:1},developerMode:infinite,cheats:{infiniteLives:infinite},enemies:[],combat:new CombatSystem(),input:{clear(){},down(){return false;},take(){return false;}},ui:{closeDeveloper(){},screen(){}},progress:{data:{bestScore:0},save(){saved++;}}});
      g.waves=new StageManager(g);g.startStage();g.waves.clearEnemies();g.enemies=[new Enemy(resolveEnemy('roman',1,{damage:1000}),250,430)];g.enemies[0].cooldown=0;
      for(let i=0;i<2500&&g.state==='playing';i++)g.updateCombat(.02);
      const state=g.state,lives=g.lives;g.character=characters[0];g.startStage();
      return {state,lives,saved,retry:g.state==='playing'&&g.player.health===140&&g.lives===3&&g.enemies.length===2};
    };
    return {normal:run(false),infinite:run(true)};
  });
  expect(result.normal).toEqual({state:'gameOver',lives:1,saved:1,retry:true});
  expect(result.infinite).toEqual({state:'playing',lives:3,saved:0,retry:true});
});
