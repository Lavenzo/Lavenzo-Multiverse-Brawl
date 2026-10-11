import { test, expect } from '@playwright/test';

test('direction, lane, jump height, one contact per swing and all player damage profiles', async ({page})=>{
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const {Player}=await import('/src/entities/Player.js'); const {Enemy}=await import('/src/entities/Enemy.js');
    const {CombatSystem}=await import('/src/combat/CombatSystem.js'); const {beginAttack,playerAttack}=await import('/src/data/combat.js');
    const {characters}=await import('/src/data/characters.js'); const {resolveEnemy}=await import('/src/data/enemies.js');
    const trial=(action,x,y,z=0)=>{
      const p=new Player(characters[0]),e=new Enemy({...resolveEnemy('roman'),health:500,resistance:1},x,y); p.z=z;
      const combat=new CombatSystem(); beginAttack(p,{...playerAttack(p.config,action),active:.65,duration:.9});
      for(let i=0;i<50;i++) { p.tickStatus(.02); e.tickStatus(.02); combat.update(.02,p,[e],{}); }
      return 500-e.health;
    };
    const hits=Object.fromEntries(['punch','kick','strong','special'].map(a=>[a,trial(a,250,430)]));
    const p=new Player(characters[1]),behind=new Enemy({...resolveEnemy('roman'),health:500,resistance:1},120,430);
    beginAttack(p,playerAttack(p.config,'special')); new CombatSystem().update(.15,p,[behind],{});
    const knocked=new Enemy(resolveEnemy('roman'),250,430),source=new Player(characters[0]);
    knocked.receiveDamage(12,source,{facing:1,knockback:200}); knocked.tickStatus(.1);
    return {hits,behind:trial('punch',130,430),lane:trial('punch',250,495),airborne:trial('punch',250,430,90),radial:500-behind.health,knockback:knocked.x>250,hurt:knocked.state};
  });
  expect(result.hits).toEqual({punch:28,kick:35,strong:50,special:63});
  expect(result.behind).toBe(0); expect(result.lane).toBe(0); expect(result.airborne).toBe(0);
  expect(result.radial).toBeGreaterThan(0); expect(result.knockback).toBe(true); expect(result.hurt).toBe('hurt');
});

test('shared enemy AI approaches, cools down, respects invulnerability and stops after defeat',async({page})=>{
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const {Player}=await import('/src/entities/Player.js'); const {Enemy}=await import('/src/entities/Enemy.js');
    const {CombatSystem}=await import('/src/combat/CombatSystem.js'); const {characters}=await import('/src/data/characters.js'); const {resolveEnemy}=await import('/src/data/enemies.js');
    const p=new Player(characters[0]),e=new Enemy(resolveEnemy('roman'),420,430),combat=new CombatSystem();
    let approached=false,attacked=false;
    for(let i=0;i<450;i++) { p.tickStatus(.02); e.update(.02,p); approached ||= e.aiState==='approach'; attacked ||= e.aiState==='attack'; combat.update(.02,p,[e],{}); }
    const health=p.health; e.invulnerability=0; e.receiveDamage(999,p,{facing:1,knockback:100});
    for(let i=0;i<100;i++) { p.tickStatus(.02); e.update(.02,p); combat.update(.02,p,[e],{}); }
    const invincible=new Player(characters[0]),v=new Enemy(resolveEnemy('venom'),250,430),patterns=new Set();
    for(let i=0;i<1500;i++) { invincible.tickStatus(.02); v.update(.02,invincible); if(v.attack) patterns.add(v.attack.name); combat.update(.02,invincible,[v],{invincible:true}); }
    return {approached,attacked,damage:140-health,afterDeath:p.health===health,defeated:e.state,patterns:[...patterns],invincible:invincible.health===140,romanTier:resolveEnemy('Roman Reigns').tier,sethTier:resolveEnemy('Seth Rollins').tier,elite:resolveEnemy('shredder').tier,scaled:resolveEnemy('roman',1.5).health,invalid:resolveEnemy('Thanos')===null};
  });
  expect(result.approached).toBe(true); expect(result.attacked).toBe(true); expect(result.damage).toBeGreaterThan(0); expect(result.damage).toBeLessThanOrEqual(40);
  expect(result.afterDeath).toBe(true); expect(result.defeated).toBe('defeated'); expect(result.invincible).toBe(true);
  expect(result.patterns).toEqual(expect.arrayContaining(['Heavy Smash','Tendril Lash','Crushing Kick']));
  expect(result.romanTier).toBe('regular'); expect(result.sethTier).toBe('regular'); expect(result.elite).toBe('elite'); expect(result.scaled).toBe(84); expect(result.invalid).toBe(true);
});

test('four configured waves only advance after the final living enemy falls',async({page})=>{
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const {StageManager}=await import('/src/systems/StageManager.js'); const {Player}=await import('/src/entities/Player.js'); const {Enemy}=await import('/src/entities/Enemy.js');
    const {characters}=await import('/src/data/characters.js'); const {resolveEnemy}=await import('/src/data/enemies.js'); const {CombatSystem}=await import('/src/combat/CombatSystem.js'); const {beginAttack,playerAttack}=await import('/src/data/combat.js');
    let finished=0; const game={player:new Player(characters[3]),enemies:[],createEnemy(id,diff,position){const e=new Enemy(resolveEnemy(id,diff),position.x,position.y);this.enemies.push(e);},finishWaves(){finished++;}};
    const waves=new StageManager(game),combat=new CombatSystem(),rosters=[]; waves.startWave(1); let waits=true;
    for(let n=1;n<=4;n++) {
      rosters.push(game.enemies.map(e=>e.config.id));
      for(let index=0;index<game.enemies.length;index++) {
        const e=game.enemies[index],p=game.player; p.x=e.x-45; p.y=e.y; p.facing=1; beginAttack(p,playerAttack(p.config,'punch')); combat.resolve(.12,p,[e],{oneHitKill:true});
        if(index<game.enemies.length-1) { waves.update(3); waits &&= waves.wave===n; }
      }
      for(let t=0;t<21;t++) waves.update(.05);
    }
    return {rosters,waits,complete:waves.complete,finished};
  });
  expect(result.rosters).toEqual([['roman','streetfighter'],['seth','roman'],['shredder','roman','seth'],['shredder','streetfighter','roman']]);
  expect(result.waits).toBe(true); expect(result.complete).toBe(true); expect(result.finished).toBe(1);
});

test('developer enemy controls, live keyboard combat, wave controls and progress isolation',async({page})=>{
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/'); const progress=await page.evaluate(()=>localStorage.getItem('lavenzo-progress'));
  await page.getByTestId('start-developer').click(); await page.getByTestId('confirm-character').click();
  expect(await page.evaluate(()=>window.gameTestAPI.getEnemyCount())).toBe(2);
  await page.keyboard.press('p'); await page.getByTestId('dev-clear-enemies').click();
  await page.getByTestId('developer-enemy').selectOption('seth'); await page.getByTestId('enemy-difficulty').fill('1.4'); await page.getByTestId('enemy-difficulty').press('Tab'); await page.getByTestId('dev-spawn-enemy').click();
  expect(await page.evaluate(()=>window.gameTestAPI.getEnemies()[0].maxHealth)).toBe(70);
  await page.getByTestId('dev-clear-enemies').click(); await page.getByTestId('dev-spawn-miniboss').click();
  expect(await page.evaluate(()=>window.gameTestAPI.isBossActive())).toBe(true);
  await page.getByTestId('close-developer').click(); await page.screenshot({path:'test-results/venom-miniboss.png',fullPage:true});
  await page.keyboard.press('p'); await page.getByTestId('dev-clear-enemies').click(); await page.getByTestId('close-developer').click();
  await page.evaluate(()=>{const a=window.gameTestAPI,p=a.getPlayerSnapshot();a.setInvincible(true);a.spawnEnemy('Roman Reigns',{difficulty:1,x:p.x+60,y:p.y});});
  await page.keyboard.down('a'); await page.waitForTimeout(450); await page.keyboard.up('a');
  let enemies=await page.evaluate(()=>window.gameTestAPI.getEnemies()); expect(enemies[0].health).toBe(28);
  await page.waitForTimeout(400); expect((await page.evaluate(()=>window.gameTestAPI.getEnemies()))[0].health).toBe(28);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(200); await page.keyboard.up('ArrowRight'); await page.keyboard.press('d');
  await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getEnemyCount())).toBe(0);
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().energy)).toBeLessThan(100);
  await page.keyboard.press('p'); await page.getByTestId('developer-wave').selectOption('3'); await page.getByTestId('dev-select-wave').click();
  await expect(page.getByTestId('wave-hud')).toContainText('WAVE 3 / 4'); expect(await page.evaluate(()=>window.gameTestAPI.getEnemyCount())).toBe(3);
  await page.screenshot({path:'test-results/mixed-wave-3.png',fullPage:true});
  await page.keyboard.press('p'); await page.screenshot({path:'test-results/developer-combat.png',fullPage:true}); await page.getByTestId('close-developer').click();
  await page.keyboard.press('p'); await page.getByTestId('dev-restart-wave').click(); expect(await page.evaluate(()=>window.gameTestAPI.getWave().number)).toBe(3);
  await page.keyboard.press('p'); await page.getByTestId('dev-skip-wave').click(); expect(await page.evaluate(()=>window.gameTestAPI.getWave().number)).toBe(4);
  // Skipping the final wave leads into the Kingpin warning; only his defeat shows the completion screen.
  await page.keyboard.press('p'); await page.getByTestId('dev-skip-wave').click();
  await expect(page.getByTestId('boss-banner')).toContainText('BOSS APPROACHING'); expect((await page.evaluate(()=>window.gameTestAPI.getWave())).phase).toBe('warning');
  await page.evaluate(()=>{window.gameTestAPI.spawnBoss({intro:false});window.gameTestAPI.defeatBoss();}); await expect(page.getByTestId('retry')).toBeVisible();
  await page.getByTestId('retry').click(); expect(await page.evaluate(()=>window.gameTestAPI.getWave().number)).toBe(1); expect(await page.evaluate(()=>window.gameTestAPI.getPlayerHealth())).toBe(140);
  await page.evaluate(()=>{window.gameTestAPI.selectWave(4);window.gameTestAPI.spawnBoss({intro:false});window.gameTestAPI.defeatBoss();});
  // Enter is consumed on the next animation frame, so poll for the restarted run.
  await expect(page.getByTestId('result-title')).toHaveText('STAGE 1 CLEARED'); await page.keyboard.press('Enter');
  await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getGameState())).toBe('playing'); expect(await page.evaluate(()=>window.gameTestAPI.getWave().number)).toBe(1);
  expect(await page.evaluate(()=>window.gameTestAPI.spawnEnemy('Thanos'))).toBe(false); expect(await page.evaluate(()=>window.gameTestAPI.setEnemyDifficulty(99))).toBe(false);
  await page.keyboard.press('Escape');
  await page.getByTestId('return-menu').click(); expect(await page.evaluate(()=>typeof window.gameTestAPI)).toBe('undefined'); expect(await page.evaluate(()=>localStorage.getItem('lavenzo-progress'))).toBe(progress);
  expect(errors).toEqual([]);
});

test('enemy illustration and attack pose atlas uses the shared Canvas renderer',async({page})=>{
  await page.goto('/');
  await page.evaluate(async()=>{
    const {CharacterRenderer}=await import('/src/rendering/CharacterRenderer.js'); const {enemyDefinitions}=await import('/src/data/enemies.js');
    const renderer=new CharacterRenderer(),canvas=document.createElement('canvas'); canvas.id='enemy-atlas'; canvas.width=1500;canvas.height=1750;canvas.style.cssText='width:1500px;height:1750px'; const c=canvas.getContext('2d');
    const states=['idle','walk','punch','kick','strong','special','hurt','defeated'];
    canvas.height=2000;canvas.style.height='2000px';
    states.forEach((state,row)=>Object.values(enemyDefinitions).forEach((config,col)=>{c.fillStyle='#152036';c.fillRect(col*300,row*250,298,248);c.fillStyle='#e9d7ad';c.font='12px monospace';c.fillText(`${config.name} / ${config.tier}`,col*300+8,row*250+17);c.fillText(state,col*300+8,row*250+33);renderer.draw(c,{config,state,time:.4,facing:1,z:0,actionDuration:.8,actionTime:state==='idle'||state==='walk'?0:.4},col*300+105,row*250+235,config.scale);}));
    document.querySelector('#app').replaceChildren(canvas);
  });
  await page.locator('#enemy-atlas').screenshot({path:'test-results/enemy-atlas.png'});
});
