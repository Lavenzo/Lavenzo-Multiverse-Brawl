import {test,expect} from '@playwright/test';
test('Tyson real AI approaches, damages every hero, recovers, enrages and remains fair',async({page})=>{
 await page.goto('/');
 const rows=await page.evaluate(async()=>{
 const {Boss}=await import('/src/entities/Boss.js'),{Player}=await import('/src/entities/Player.js'),{CombatSystem}=await import('/src/combat/CombatSystem.js'),{characters}=await import('/src/data/characters.js'),{resolveEnemy}=await import('/src/data/enemies.js');
 return characters.map(hero=>{
 const p=new Player({...hero,health:5000}),b=new Boss(resolveEnemy('tyson'),p.x+260,p.y+40),c=new CombatSystem(),dt=1/60,start=b.x,moves=new Set(),windups=[],hits=[],starts=[],seen=new Set();let t=0;
 const tick=()=>{const hp=p.health;p.tickStatus(dt);b.update(dt,p);const a=b.attack;if(a&&!seen.has(a)){seen.add(a);moves.add(a.name);windups.push(a.windup);}const active=a&&a.elapsed>=a.windup;c.update(dt,p,[b],{});t+=dt;if(a&&!active&&a.elapsed>=a.windup)starts.push(t);if(p.health<hp)hits.push(t);};
 for(let i=0;i<1800;i++)tick();
 const phase1Damage=5000-p.health,approached=b.x<start-60;
 b.invulnerability=0;b.receiveDamage(20,p,{facing:1,knockback:180});p.x=b.x+250;const afterHit=b.x,prior=seen.size;
 for(let i=0;i<900;i++)tick();
 const recovered=seen.size>prior&&Math.abs(b.x-afterHit)>30;
 b.invulnerability=0;b.receiveDamage(b.health-b.maxHealth*.49,p,{facing:1,knockback:0});const hp=p.health;
 for(let i=0;i<1200;i++)tick();
 return {hero:hero.id,approached,phase1Damage,recovered,enraged:b.enraged,phase2Damage:hp-p.health,moves:[...moves],minWindup:Math.min(...windups),minGap:Math.min(...hits.map(h=>starts.find(s=>s>h+.02)-h).filter(Number.isFinite))};
 });
 });
 console.log(JSON.stringify(rows));
 for(const r of rows){expect(r.approached).toBe(true);expect(r.phase1Damage).toBeGreaterThan(0);expect(r.recovered).toBe(true);expect(r.enraged).toBe(true);expect(r.phase2Damage).toBeGreaterThan(0);expect(r.minWindup).toBeGreaterThanOrEqual(.38);expect(r.minGap).toBeGreaterThan(.8);expect(r.moves).toEqual(expect.arrayContaining(['Jab-Cross Combo','Left Hook','Uppercut','Knockout Rush']));}
 await test.info().attach("tyson-ai-evidence",{body:JSON.stringify(rows,null,2),contentType:"application/json"});
});

test('all four heroes clear four waves and defeat Tyson without cheats in deterministic combat simulation',async({page})=>{
  await page.goto('/');
  const results=await page.evaluate(async()=>{
    const {Game}=await import('/src/engine/Game.js');const {characters}=await import('/src/data/characters.js');const {CombatSystem}=await import('/src/combat/CombatSystem.js');const {StageManager}=await import('/src/systems/StageManager.js');
    return characters.map(character=>{
      let saved=0,dx=0,dy=0,action=''; const game=Object.create(Game.prototype);
      Object.assign(game,{character,developerMode:false,cheats:{},enemies:[],combat:new CombatSystem(),input:{clear(){},down(key){return key==='right'?dx>0:key==='left'?dx<0:key==='up'?dy<0:key==='down'?dy>0:false;},take(key){return key===action;}},ui:{closeDeveloper(){},screen(){}},progress:{data:{bestScore:0},save(){saved++;}}});
      game.waves=new StageManager(game);game.startStage(2);
      let elapsed=0; const phases=new Set(),states=new Set();
      while(game.state==='playing' && elapsed<100) {
        phases.add(game.waves.phase); states.add(game.state);
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
      return {hero:character.id,state:game.state,lives:game.lives,health:game.player.health,score:game.score,saved,seconds:Math.round(elapsed),phases:[...phases],states:[...states],boss:game.waves.boss?.config.id,bossHealth:game.waves.boss?.health,cleared:game.progress.data.clearedStages};
    });
  });
  await test.info().attach('balance-simulation',{body:JSON.stringify(results,null,2),contentType:'application/json'});
  // 1590 from the Stage 2 waves + 2500 for Tyson. Waves Cleared no longer exists; the boss phases must occur.
  for(const result of results) {
    expect(result.state,JSON.stringify(result)).toBe('stageClear');expect(result.score).toBe(4090);expect(result.saved).toBe(1);expect(result.lives).toBeGreaterThan(0);
    expect(result.phases).toEqual(['waves','warning','entrance','boss','defeated']); expect(result.states).toEqual(['playing']); expect(result.boss).toBe('tyson'); expect(result.bossHealth).toBe(0); expect(result.cleared).toEqual([2]);
  }
});


test('Stage 2 Canvas character poses and arena screenshots without console errors',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');
 await page.evaluate(async()=>{
 const {CharacterRenderer}=await import('/src/rendering/CharacterRenderer.js'),{Renderer}=await import('/src/engine/Renderer.js'),{Boss}=await import('/src/entities/Boss.js'),{resolveEnemy}=await import('/src/data/enemies.js'),{beginAttack}=await import('/src/data/combat.js');
 const r=new CharacterRenderer(),root=document.querySelector('#app');root.replaceChildren();
 for(const id of ['owens','sabretooth','tyson']){
 const config=resolveEnemy(id),canvas=document.createElement('canvas');canvas.id=id+'-poses';canvas.width=1200;canvas.height=id==='tyson'?900:600;canvas.style.cssText='display:block;width:1200px;height:'+canvas.height+'px';root.append(canvas);const c=canvas.getContext('2d');
 const states=id==='tyson'?['idle','walk','jab-cross','hook','uppercut','hurt','defeated','intro','rush','weave','roar','phase 2']:['idle','walk','punch','strong','special','hurt','defeated','intro'];
 states.forEach((state,i)=>{const x=i%4*300,y=Math.floor(i/4)*300;c.fillStyle='#202b40';c.fillRect(x,y,298,298);c.fillStyle='#f2d1a4';c.font='16px monospace';c.fillText(config.name.split(' ? ')[0]+' / '+state,x+12,y+23);
 let attack=null;
 if(id!=='tyson'&&i>=2&&i<=4){const actor={};beginAttack(actor,config.attacks[i===4?2:0]);attack=actor.attack;attack.elapsed=attack.windup+attack.active*.7;state=attack.kind;}
 if(id==='tyson'&&i>=2&&i<=4){const b=new Boss(config,0,0);b.perform(['jab','hook','uppercut'][i-2]);attack=b.attack;attack.elapsed=attack.windup+attack.active*.7;state=attack.kind;}
 if(id==='tyson'&&i>=8&&i<=10){const b=new Boss(config,0,0);b.perform(['charge','shove','roar'][i-8]);attack=b.attack;attack.elapsed=attack.windup+(i===9?-.12:attack.active*.5);state=attack.kind;}if(i===11)state='idle';
 r.draw(c,{config,state,enraged:i===11,time:.35,facing:1,z:0,attack,actionDuration:1,actionTime:state==='defeated'?.3:0},x+135,y+275,config.scale);
 });
 }
 const canvas=document.createElement('canvas');canvas.id='stage2-arena';canvas.width=960;canvas.height=540;canvas.style.cssText='display:block;width:960px;height:540px';root.append(canvas);
 const arena=Object.create(Renderer.prototype),c=canvas.getContext('2d');arena.drawFightClub(c,0);
 ['owens','sabretooth','tyson'].forEach((id,i)=>{const config=resolveEnemy(id);r.draw(c,{config,state:'idle',time:.4,facing:i===2?-1:1,z:0},230+i*250,455,config.scale);});
 });
 for(const id of ['owens','sabretooth','tyson'])await page.locator('#'+id+'-poses').screenshot({path:'test-results/'+id+'-redesign.png'});
 await page.locator('#stage2-arena').screenshot({path:'test-results/stage2-environment.png'});
 expect(errors).toEqual([]);
});

test('Tyson live encounter moves and damages a passive player; Stage 2 UI and completion',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await page.getByTestId('start-developer').click();await page.getByTestId('confirm-character').click();
 await page.evaluate(()=>{window.gameTestAPI.startStage(2);window.gameTestAPI.spawnBoss({intro:false,restore:true});});
 const start=await page.evaluate(()=>window.gameTestAPI.getBoss().boss.x);
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getBoss().boss.x)).toBeLessThan(start-80);
 await expect(page.getByTestId('boss-name')).toContainText('MIKE TYSON');
 await expect(page.locator('#hud-stage-name')).toHaveText('UNDERGROUND FIGHT CLUB');
 await expect(page.locator('.below')).toContainText('MIKE TYSON');
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getPlayerHealth()),{timeout:8000}).toBeLessThan(140);
 await page.screenshot({path:'test-results/stage2-live-boss.png',fullPage:true});
 await page.evaluate(()=>window.gameTestAPI.setBossHealth(600));
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getBoss().boss.enraged)).toBe(true);
 await page.evaluate(()=>window.gameTestAPI.defeatBoss());
 await expect(page.getByTestId('result-title')).toHaveText('STAGE 2 CLEARED',{timeout:6000});
 expect(errors).toEqual([]);
});
test('Sabretooth regeneration caps at maximum and never revives; Tyson breakout uses guarded weave',async({page})=>{
 await page.goto('/');
 const r=await page.evaluate(async()=>{
 const {Enemy}=await import('/src/entities/Enemy.js'),{Boss}=await import('/src/entities/Boss.js'),{Player}=await import('/src/entities/Player.js'),{characters}=await import('/src/data/characters.js'),{resolveEnemy}=await import('/src/data/enemies.js');
 const p=new Player(characters[0]),e=new Enemy(resolveEnemy('sabretooth'),500,430);
 e.health=e.maxHealth-.1;for(let i=0;i<120;i++)e.update(1/60,p);const capped=e.health;
 e.health=0;for(let i=0;i<120;i++)e.update(1/60,p);
 const b=new Boss(resolveEnemy('tyson'),300,430);
 for(let i=0;i<3;i++){b.invulnerability=0;b.receiveDamage(5,p,{facing:1,knockback:0});}
 b.update(.12,p);return {capped,max:e.maxHealth,dead:e.health,name:b.attack?.name,guard:b.attack?.guard};
 });
 expect(r.capped).toBe(r.max);expect(r.dead).toBe(0);expect(r.name).toBe('Weave and Counter');expect(r.guard).toBe(true);
});
