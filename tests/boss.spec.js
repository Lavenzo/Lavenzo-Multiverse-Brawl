import { test, expect } from '@playwright/test';

test('Kingpin illustration covers every encounter pose with the shared renderer', async ({page}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const {CharacterRenderer}=await import('/src/rendering/CharacterRenderer.js'); const {resolveEnemy}=await import('/src/data/enemies.js');
    const renderer=new CharacterRenderer(),config=resolveEnemy('kingpin'),moves=config.boss.moves;
    const at=(id,stage)=>{ const m=moves[id],rest=m.duration-m.windup-m.active; return {...m,elapsed:stage==='windup'?m.windup*.9:stage==='active'?m.windup+m.active*.6:m.windup+m.active+rest*.3,hitIds:new Set(),facing:1,originX:0}; };
    const poses=[
      ['idle',{state:'idle'}],['walk',{state:'walk',time:.55}],['intro',{state:'intro',actionDuration:1,actionTime:.3}],['punch windup',{state:'punch',attack:at('punch','windup')}],
      ['heavy punch',{state:'punch',attack:at('punch','active')}],['hammer hook',{state:'strong',attack:at('hook','active')}],['charge windup',{state:'charge',attack:at('charge','windup')}],['bull charge',{state:'charge',attack:at('charge','active')}],
      ['slam windup',{state:'slam',attack:at('slam','windup')}],['ground slam',{state:'slam',attack:at('slam','active')}],['rage shove',{state:'shove',attack:at('shove','active')}],['enraged roar',{state:'roar',enraged:true,attack:at('roar','active')}],
      ['hurt',{state:'hurt',actionDuration:.24,actionTime:.12,hitFlash:.1}],['enraged idle',{state:'idle',enraged:true}],['defeated / falling',{state:'defeated',actionDuration:1.4,actionTime:.7}],['defeated',{state:'defeated',actionDuration:1.4,actionTime:0,deathTime:1.5}],
    ];
    const cols=4,w=330,h=330,canvas=document.createElement('canvas'); canvas.id='kingpin-atlas'; canvas.width=cols*w; canvas.height=Math.ceil(poses.length/cols)*h;
    canvas.style.cssText=`width:${canvas.width}px;height:${canvas.height}px;display:block`; const c=canvas.getContext('2d');
    poses.forEach(([label,pose],i)=>{ const x=(i%cols)*w,y=Math.floor(i/cols)*h; c.fillStyle='#152036'; c.fillRect(x+1,y+1,w-2,h-2); c.fillStyle='#e9d7ad'; c.font='13px monospace'; c.fillText(`Kingpin / ${label}`,x+10,y+20);
      renderer.draw(c,{config,time:.4,facing:1,z:0,actionDuration:0,actionTime:0,...pose},x+w*.45,y+h-22,config.scale); });
    document.querySelector('#app').replaceChildren(canvas);
  });
  await page.locator('#kingpin-atlas').screenshot({path:'test-results/kingpin-atlas.png'});
});

test('Kingpin uses the shared combat engine: damage both ways, resistance, avoidable telegraphs, fair spacing', async ({page}) => {
  await page.goto('/');
  const r=await page.evaluate(async () => {
    const {Player}=await import('/src/entities/Player.js'); const {Enemy}=await import('/src/entities/Enemy.js'); const {Boss}=await import('/src/entities/Boss.js');
    const {CombatSystem}=await import('/src/combat/CombatSystem.js'); const {beginAttack,playerAttack}=await import('/src/data/combat.js');
    const {characters}=await import('/src/data/characters.js'); const {resolveEnemy}=await import('/src/data/enemies.js');
    const config=resolveEnemy('kingpin'),dt=1/60,tank={...characters[0],health:5000};
    // Each hero's ordinary punch damages Kingpin once per swing.
    const heroHits=Object.fromEntries(characters.map(hero=>{ const p=new Player(hero),k=new Boss(config,p.x+70,p.y),combat=new CombatSystem(); beginAttack(p,{...playerAttack(hero,'punch'),active:.4,duration:.6}); for(let i=0;i<40;i++) { k.tickStatus(dt); combat.resolve(dt,p,[k],{}); } return [hero.id,config.health-k.health]; }));
    const push=target=>{ target.receiveDamage(10,new Player(characters[0]),{facing:1,knockback:235}); const x=target.x; for(let i=0;i<60;i++) target.tickStatus(dt); return target.x-x; };
    // Passive tank: Kingpin approaches and attacks. Each attack may deal damage once, and after any
    // contact the next active window waits longer than the player's invulnerability.
    const p=new Player(tank),k=new Boss(config,p.x+260,p.y),combat=new CombatSystem(),perAttack=new Map(),moves=new Set(),windups=[],damageTimes=[],activeStarts=[];
    let t=0;
    for(let i=0;i<60*40;i++) {
      const before=p.health; p.tickStatus(dt); k.update(dt,p); const a=k.attack;
      if(a && !perAttack.has(a)) { perAttack.set(a,0); moves.add(a.name); windups.push(a.windup); }
      const wasActive=a && a.elapsed>=a.windup; combat.update(dt,p,[k],{}); t+=dt;
      if(a && !wasActive && a.elapsed>=a.windup) activeStarts.push(t);
      if(p.health<before) { damageTimes.push(t); if(a) perAttack.set(a,perAttack.get(a)+1); }
    }
    const gaps=damageTimes.map(d=>activeStarts.find(s=>s>d+.02)-d).filter(Number.isFinite);
    // Telegraph avoidance: jumping clears the slam; leaving the lane or jumping clears the charge.
    const trial=(move,place)=>{ const hero=new Player(tank),boss=new Boss(config,400,430),system=new CombatSystem(); place(hero); boss.facing=Math.sign(hero.x-boss.x)||1; boss.perform(move); for(let i=0;i<120;i++) { hero.tickStatus(dt); boss.update(dt,hero); system.update(dt,hero,[boss],{}); } return 5000-hero.health; };
    const avoid={ slamGrounded:trial('slam',h=>{h.x=470;h.y=430;}), slamJumping:trial('slam',h=>{h.x=470;h.y=430;h.z=60;}), slamOtherLane:trial('slam',h=>{h.x=470;h.y=490;}),
      chargeInLane:trial('charge',h=>{h.x=620;h.y=430;}), chargeLaneChange:trial('charge',h=>{h.x=620;h.y=460;}), chargeJumping:trial('charge',h=>{h.x=620;h.y=430;h.z=70;}) };
    // Armor: the jab can be interrupted in phase 1; the hook, charge and slam keep going.
    const armor=Object.fromEntries(['punch','hook','charge','slam'].map(id=>{ const boss=new Boss(config,400,430),hero=new Player(characters[0]); hero.x=330; boss.perform(id); boss.attack.elapsed=.1; boss.receiveDamage(5,hero,{facing:1,knockback:150}); return [id,Boolean(boss.attack)]; }));
    // Entrance invulnerability, then normal damage; a defeated boss never attacks again.
    const entering=new Boss(config,900,430); entering.beginEntrance(600); const blocked=!entering.receiveDamage(50,p,{facing:1});
    const dead=new Boss(config,300,430),victim=new Player(characters[0]); victim.x=240; dead.invulnerability=0; dead.receiveDamage(dead.health,victim,{facing:-1,knockback:0});
    for(let i=0;i<180;i++) { victim.tickStatus(dt); dead.update(dt,victim); combat.update(dt,victim,[dead],{}); }
    return {tier:config.tier,health:config.health,roman:resolveEnemy('roman').tier,seth:resolveEnemy('seth').tier,venom:resolveEnemy('venom').tier,heroHits,
      kingpinPush:push(new Boss(config,400,430)),romanPush:push(new Enemy(resolveEnemy('roman'),400,430)),damaged:5000-p.health,maxPerAttack:Math.max(...perAttack.values()),
      moves:[...moves],minWindup:Math.min(...windups),minGap:Math.min(...gaps),avoid,armor,blocked,deadAttack:dead.attack,deadState:dead.state,victimHealth:victim.health};
  });
  expect(r.tier).toBe('boss'); expect(r.health).toBe(1250); expect([r.roman,r.seth,r.venom]).toEqual(['regular','regular','miniboss']);
  expect(r.heroHits).toEqual({axel:28,leonardo:24,spiderman:20,cyclops:25});
  expect(r.kingpinPush).toBeGreaterThan(0); expect(r.kingpinPush).toBeLessThan(r.romanPush*.3);
  expect(r.damaged).toBeGreaterThan(0); expect(r.maxPerAttack).toBe(1); expect(r.minWindup).toBeGreaterThanOrEqual(.38);
  expect(r.moves).toEqual(expect.arrayContaining(['Heavy Punch','Hammer Hook','Ground Slam','Bull Charge']));
  expect(r.minGap,'next active window after a landed hit').toBeGreaterThan(1.1);
  expect(r.avoid.slamGrounded).toBeGreaterThan(0); expect(r.avoid.slamJumping).toBe(0); expect(r.avoid.slamOtherLane).toBe(0);
  expect(r.avoid.chargeInLane).toBeGreaterThan(0); expect(r.avoid.chargeLaneChange).toBe(0); expect(r.avoid.chargeJumping).toBe(0);
  expect(r.armor).toEqual({punch:false,hook:true,charge:true,slam:true});
  expect(r.blocked).toBe(true); expect(r.deadAttack).toBe(null); expect(r.deadState).toBe('defeated'); expect(r.victimHealth).toBe(140);
});

test('Kingpin reacts to damage: break-out shove, ranged provocation and a harder phase below 50%', async ({page}) => {
  await page.goto('/');
  const r=await page.evaluate(async () => {
    const {Player}=await import('/src/entities/Player.js'); const {Boss}=await import('/src/entities/Boss.js'); const {CombatSystem}=await import('/src/combat/CombatSystem.js');
    const {characters}=await import('/src/data/characters.js'); const {resolveEnemy}=await import('/src/data/enemies.js');
    const config=resolveEnemy('kingpin'),dt=1/60,hero=new Player(characters[0]); hero.x=240;
    const hit=(boss,amount=10,source=hero)=>{ boss.invulnerability=0; return boss.receiveDamage(amount,source,{facing:1,knockback:150}); };
    // Rapid hits trigger a guarded shove instead of an endless stun-lock.
    const mashed=new Boss(config,300,430); for(let i=0;i<4;i++) hit(mashed); mashed.stun=0; mashed.update(dt,hero);
    const shove={name:mashed.attack?.name,guarded:mashed.invulnerability>0,blocked:!mashed.receiveDamage(10,hero,{facing:1})};
    // Damage from long range provokes a charge.
    const sniper=new Player(characters[3]); sniper.x=60; const provoked=new Boss(config,300,430); hit(provoked,10,sniper);
    // Phase change: compare phase-1 and phase-2 move profiles and speed.
    const boss=new Boss(config,300,430),phase1={windup:boss.move('punch').windup,armor:Boolean(boss.move('punch').armor),gap:boss.modifier('cooldown'),speed:config.speed*boss.modifier('speed')};
    hit(boss,Math.ceil(config.health*.5)+1); const enraged=boss.enraged,reaction=boss.reaction;
    boss.stun=0; boss.update(dt,hero); const roar={name:boss.attack?.name,guarded:boss.invulnerability>0};
    const phase2={windup:boss.move('punch').windup,armor:Boolean(boss.move('punch').armor),gap:boss.modifier('cooldown'),speed:config.speed*boss.modifier('speed'),shockwave:boss.move('slam').shockwave?.to,followUp:boss.move('charge').followUp};
    // The enraged slam's shockwave widens the real hit range during its active window.
    const wave=new Boss(config,300,430); wave.setHealth(400); wave.reaction=null; wave.perform('slam'); const ranges=[]; const target=new Player({...characters[0],health:5000}); target.x=1200;
    for(let i=0;i<100;i++) { wave.update(dt,target); if(wave.attack) ranges.push(wave.attack.range); new CombatSystem().resolve(dt,wave,[target],{}); }
    return {shove,provoked:provoked.provoked,enraged,reaction,roar,phase1,phase2,maxRange:Math.max(...ranges),setHealth:wave.enraged};
  });
  expect(r.shove).toEqual({name:'Rage Shove',guarded:true,blocked:true}); expect(r.provoked).toBe(true);
  expect(r.enraged).toBe(true); expect(r.reaction).toBe('roar'); expect(r.roar).toEqual({name:'Kingpin Rage',guarded:true});
  expect(r.phase2.windup).toBeLessThan(r.phase1.windup); expect(r.phase2.windup).toBeGreaterThanOrEqual(.38);
  expect(r.phase1.armor).toBe(false); expect(r.phase2.armor).toBe(true); expect(r.phase2.gap).toBeLessThan(r.phase1.gap); expect(r.phase2.speed).toBeGreaterThan(r.phase1.speed);
  expect(r.phase2.shockwave).toBe(235); expect(r.phase2.followUp).toBe('slam'); expect(r.maxRange).toBeCloseTo(235,0); expect(r.setHealth).toBe(true);
});

test('stage flow: wave 4, warning, entrance, fight, defeat, Stage 1 cleared; developer runs never save', async ({page}) => {
  await page.goto('/');
  const r=await page.evaluate(async () => {
    const {Game}=await import('/src/engine/Game.js'); const {characters}=await import('/src/data/characters.js');
    const {CombatSystem}=await import('/src/combat/CombatSystem.js'); const {StageManager}=await import('/src/systems/StageManager.js');
    const run=developerMode=>{
      let saved=0; const g=Object.create(Game.prototype);
      Object.assign(g,{character:characters[2],developerMode,cheats:{},enemies:[],combat:new CombatSystem(),input:{clear(){},down(){return false;},take(){return false;}},ui:{closeDeveloper(){},screen(){},notify(){}},progress:{data:{bestScore:0,clearedStages:[]},save(){saved++;}}});
      g.waves=new StageManager(g); g.startStage(1); g.waves.startWave(4);
      for(const e of g.enemies) { e.invulnerability=0; e.receiveDamage(e.health,g.player,{facing:1,knockback:0}); }
      const timeline=[]; let t=0,entranceBlocked=null;
      const step=seconds=>{ for(let i=0;i<Math.round(seconds*60);i++) { g.updateCombat(1/60); t+=1/60; if(timeline.at(-1)?.phase!==g.waves.phase) timeline.push({phase:g.waves.phase,state:g.state,t:+t.toFixed(2),enemies:g.enemies.filter(e=>e.health>0).map(e=>e.config.id)}); if(g.waves.phase==='entrance' && entranceBlocked===null) entranceBlocked=!g.waves.boss.receiveDamage(99,g.player,{facing:1}); if(g.state!=='playing') return; } };
      while(g.waves.phase!=='boss' && t<12) step(.1);
      const boss=g.waves.boss; boss.invulnerability=0; boss.receiveDamage(boss.health,g.player,{facing:1,knockback:0}); step(4);
      return {timeline,state:g.state,saved,cleared:g.progress.data.clearedStages,score:g.score,entranceBlocked,bossTier:boss.config.tier,isBoss:boss.constructor.name};
    };
    return {normal:run(false),developer:run(true)};
  });
  for(const result of [r.normal,r.developer]) {
    expect(result.timeline.map(e=>e.phase)).toEqual(['waves','warning','entrance','boss','defeated','cleared']);
    expect(result.timeline[1].enemies).toEqual([]); expect(result.timeline[2].enemies).toEqual(['kingpin']); expect(result.timeline.every(e=>e.state==='playing' || e.phase==='cleared')).toBe(true);
    expect(result.state).toBe('stageClear'); expect(result.entranceBlocked).toBe(true); expect(result.bossTier).toBe('boss'); expect(result.isBoss).toBe('Boss');
    expect(result.score).toBe(2000+250+100+120);
  }
  expect(r.normal.saved).toBe(1); expect(r.normal.cleared).toEqual([1]);
  expect(r.developer.saved).toBe(0); expect(r.developer.cleared).toEqual([]);
});

test('reacting to telegraphs beats Kingpin with every hero without taking slam or charge damage', async ({page}) => {
  await page.goto('/');
  const results=await page.evaluate(async () => {
    const {Game}=await import('/src/engine/Game.js'); const {characters}=await import('/src/data/characters.js');
    const {CombatSystem}=await import('/src/combat/CombatSystem.js'); const {StageManager}=await import('/src/systems/StageManager.js');
    const fight=(character,dodge)=>{
      let dx=0,dy=0,action='',jump=false; const g=Object.create(Game.prototype);
      Object.assign(g,{character,developerMode:false,cheats:{},enemies:[],combat:new CombatSystem(),ui:{closeDeveloper(){},screen(){}},progress:{data:{bestScore:0},save(){}},
        input:{clear(){},down(k){return k==='right'?dx>0:k==='left'?dx<0:k==='up'?dy<0:k==='down'?dy>0:false;},take(k){return k===action || (k==='jump' && jump);}}});
      g.waves=new StageManager(g); g.startStage(1); g.waves.beginBoss({intro:false});
      const taken={},moves=new Set(); let elapsed=0,enraged=false;
      while(g.state==='playing' && elapsed<180) {
        const p=g.player,k=g.waves.boss,distance=k.x-p.x,lane=k.y-p.y,a=k.attack; dx=0; dy=0; action=''; jump=false;
        if(k.health>0) {
          dx=Math.abs(distance)>55?Math.sign(distance):0; dy=Math.abs(lane)>9?Math.sign(lane):0;
          if(!p.attack && p.facing!==Math.sign(distance)) dx=Math.sign(distance);
          if(Math.abs(lane)<28 && Math.abs(distance)<105 && p.cooldown<=0) action=p.energy>=25?'special':Math.abs(distance)<80?'strong':'';
          // A player reacting to the visible cue: jump the slam/shove/roar, leave the charge lane, step back from fists.
          if(dodge && a && a.elapsed<a.windup+(a.kind==='charge'?a.active:0)) {
            action='';
            if(['slam','shove','roar'].includes(a.kind)) jump=a.windup-a.elapsed<.2;
            else if(a.kind==='charge') { dx=0; dy=p.y>=k.y?(p.y<500?1:-1):(p.y>375?-1:1); }
            else dx=-Math.sign(distance);
          }
        }
        const before=p.health,name=a?.name; g.updateCombat(1/60); elapsed+=1/60;
        if(g.player===p && p.health<before && name) taken[name]=(taken[name]||0)+before-p.health;
        if(k.attack) moves.add(k.attack.name); enraged ||= k.enraged;
      }
      return {hero:character.id,state:g.state,lives:g.lives,taken,moves:[...moves].sort(),enraged,seconds:Math.round(elapsed)};
    };
    return characters.map(c=>({dodge:fight(c,true),tank:fight(c,false)}));
  });
  await test.info().attach('boss-fairness',{body:JSON.stringify(results,null,2),contentType:'application/json'});
  const total=t=>Object.values(t).reduce((a,b)=>a+b,0);
  for(const {dodge,tank} of results) {
    for(const run of [dodge,tank]) { expect(run.state,JSON.stringify(run)).toBe('stageClear'); expect(run.lives).toBeGreaterThan(0); expect(run.enraged).toBe(true); }
    expect(dodge.moves).toEqual(expect.arrayContaining(['Heavy Punch','Hammer Hook','Ground Slam','Bull Charge']));
    expect(dodge.taken['Ground Slam'] ?? 0).toBe(0); expect(dodge.taken['Bull Charge'] ?? 0).toBe(0);
    expect(total(dodge.taken)).toBeLessThan(total(tank.taken));
  }
});

test('developer boss tools, boss HUD, keyboard combat, stage clear and retry in the browser', async ({page}) => {
  const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push(m.text()); });
  const boss=()=>page.evaluate(()=>window.gameTestAPI.getBoss());
  const setBossHealth=value=>page.evaluate(v=>window.gameTestAPI.setBossHealth(v),value);
  await page.goto('/'); const progress=await page.evaluate(()=>localStorage.getItem('lavenzo-progress'));
  // Normal mode: no developer shortcut reaches the boss.
  await page.getByTestId('start-normal').click(); await page.getByTestId('confirm-character').click(); await page.keyboard.press('Shift+3'); await page.waitForTimeout(250);
  await expect(page.getByTestId('wave-hud')).toContainText('WAVE 1 / 4'); await expect(page.getByTestId('boss-banner')).toBeHidden();
  await page.keyboard.press('Escape'); await page.getByTestId('return-menu').click();
  // Developer mode: jump straight from Wave 1 to the encounter.
  await page.getByTestId('start-developer').click(); await page.getByTestId('confirm-character').click();
  await page.keyboard.press('p'); await page.getByTestId('dev-boss').click();
  await expect(page.getByTestId('boss-banner')).toHaveText('WARNING – BOSS APPROACHING'); await expect(page.getByTestId('boss-hud')).toBeHidden();
  await page.screenshot({path:'test-results/boss-warning.png',fullPage:true});
  await expect(page.getByTestId('boss-hud')).toBeVisible({timeout:6000}); await expect(page.getByTestId('boss-name')).toHaveText('KINGPIN');
  await expect(page.getByTestId('boss-banner')).toContainText('KINGPIN'); await page.screenshot({path:'test-results/boss-entrance.png',fullPage:true});
  await expect.poll(async()=>(await boss()).encounter,{timeout:8000}).toBe('boss');
  // Keyboard punches damage Kingpin once he is in reach (Axel range 64 + Kingpin body radius 52).
  await expect.poll(async()=>{ const b=(await boss()).boss,p=await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot()); return Math.abs(b.x-p.x)<112 && Math.abs(b.y-p.y)<20; },{timeout:8000}).toBe(true);
  for(let i=0;i<8 && (await boss()).boss.health===1250;i++) { await page.keyboard.press('a'); await page.waitForTimeout(380); }
  expect((await boss()).boss.health).toBeLessThan(1250);
  // Kingpin damages the player (cheats off).
  await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getPlayerHealth()),{timeout:12000}).toBeLessThan(140);
  await page.screenshot({path:'test-results/boss-fight.png',fullPage:true});
  // Restore health, invincibility, and set Kingpin below 50% from the panel.
  await page.keyboard.press('p'); await page.getByTestId('dev-health').click(); await page.getByTestId('dev-invincible').click(); await expect(page.getByTestId('dev-invincible')).toContainText('✓');
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerHealth())).toBe(140);
  await page.getByTestId('dev-boss-health-value').fill('9999'); await page.getByTestId('dev-set-boss-health').click(); await expect(page.locator('#toast')).toContainText('whole number');
  await page.getByTestId('dev-boss-health-value').fill('500'); await page.getByTestId('dev-set-boss-health').click();
  await expect(page.getByTestId('dev-boss-status')).toContainText('KINGPIN 500 / 1250 HP · ENRAGED'); await page.getByTestId('close-developer').click();
  await expect(page.locator('#boss-label')).toContainText('ENRAGED'); expect((await boss()).boss.enraged).toBe(true);
  await page.waitForTimeout(700); await page.screenshot({path:'test-results/boss-enraged.png',fullPage:true});
  // Defeat instantly: KO banner, then STAGE 1 CLEARED with final score and both buttons.
  await page.keyboard.press('p'); await page.getByTestId('dev-defeat-boss').click(); await expect(page.locator('#developer')).toBeHidden();
  await expect(page.getByTestId('boss-banner')).toHaveText('KINGPIN DEFEATED!');
  await expect(page.getByTestId('result-title')).toHaveText('STAGE 1 CLEARED',{timeout:6000}); await expect(page.getByTestId('final-score')).toContainText('FINAL SCORE');
  await expect(page.getByTestId('retry')).toBeVisible(); await expect(page.getByTestId('return-menu')).toBeVisible(); await expect(page.locator('#screen .note')).toContainText('not saved');
  await page.screenshot({path:'test-results/stage-clear.png',fullPage:true});
  // Retry restarts Stage 1 from Wave 1.
  await page.getByTestId('retry').click();
  expect(await page.evaluate(()=>window.gameTestAPI.getWave())).toEqual({number:1,sandbox:false,complete:false,phase:'waves'});
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerHealth())).toBe(140); expect(await page.evaluate(()=>window.gameTestAPI.getEnemyCount())).toBe(2);
  await expect(page.getByTestId('boss-hud')).toBeHidden();
  // Spawn immediately, restart the fight, Shift+3 shortcut, then return to normal Stage 1 waves.
  await page.keyboard.press('p'); await page.getByTestId('dev-spawn-kingpin').click();
  expect(await boss()).toMatchObject({encounter:'boss',active:true,boss:{name:'Kingpin',health:1250,entering:false}}); await expect(page.getByTestId('boss-hud')).toBeVisible();
  expect(await setBossHealth(300)).toBe(true); expect(await setBossHealth(0)).toBe(false); expect(await setBossHealth(12.5)).toBe(false);
  await page.keyboard.press('p'); await page.getByTestId('dev-restart-boss').click();
  expect(await boss()).toMatchObject({encounter:'boss',active:true,boss:{health:1250,enraged:false}});
  await page.keyboard.press('Shift+3'); await expect.poll(async()=>(await boss()).encounter).toBe('warning');
  await page.keyboard.press('p'); await page.getByTestId('dev-return-stage').click();
  expect(await page.evaluate(()=>window.gameTestAPI.getWave())).toMatchObject({number:1,phase:'waves'}); await expect(page.getByTestId('wave-hud')).toContainText('WAVE 1 / 4');
  // Leaving developer mode removes the API and leaves saved progress untouched.
  await page.keyboard.press('Escape'); await page.getByTestId('return-menu').click();
  expect(await page.evaluate(()=>typeof window.gameTestAPI)).toBe('undefined'); expect(await page.evaluate(()=>localStorage.getItem('lavenzo-progress'))).toBe(progress);
  expect(errors).toEqual([]);
});

test('boss telegraphs and HUD render in the real gameplay renderer', async ({page}) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const {Renderer}=await import('/src/engine/Renderer.js'); const {Player}=await import('/src/entities/Player.js'); const {Boss}=await import('/src/entities/Boss.js');
    const {characters}=await import('/src/data/characters.js'); const {resolveEnemy}=await import('/src/data/enemies.js');
    const sheet=document.createElement('div'); sheet.id='boss-scenes'; sheet.style.cssText='display:grid;grid-template-columns:repeat(2,960px);gap:4px;width:1924px;background:#000';
    const scene=(label,setup)=>{
      const canvas=document.createElement('canvas'); canvas.style.cssText='width:960px;height:540px;display:block'; sheet.append(canvas); document.body.append(sheet);
      const renderer=new Renderer(canvas); renderer.resize(); const player=new Player(characters[2]); player.x=520; player.y=440; const boss=new Boss(resolveEnemy('kingpin'),700,430); boss.facing=-1;
      const waves={phase:'boss',phaseTime:1}; setup(player,boss,waves);
      const game={player,enemies:[boss],state:'playing',ui:{developerOpen:false},loop:{delta:0},waves,activeBoss:()=>boss};
      renderer.draw(game); renderer.draw(game); const c=canvas.getContext('2d'); c.setTransform(canvas.width/960,0,0,canvas.height/540,0,0); c.fillStyle='#fff3c4'; c.font='bold 14px monospace'; c.fillText(label,20,90);
    };
    const at=(boss,id,elapsed)=>{ boss.perform(id); boss.attack.elapsed=elapsed; boss.state=boss.attack.kind; };
    scene('BULL CHARGE WINDUP / LANE WARNING',(p,b)=>at(b,'charge',.4));
    scene('GROUND SLAM WINDUP / RING WARNING',(p,b)=>at(b,'slam',.6));
    scene('ENRAGED SHOCKWAVE SLAM',(p,b)=>{ b.setHealth(500); b.reaction=null; at(b,'slam',0); b.attack.elapsed=b.attack.windup+b.attack.active*.6; b.attack.range=b.attack.shockwave.from+(b.attack.shockwave.to-b.attack.shockwave.from)*.6; p.z=70; });
    scene('WARNING PHASE VIGNETTE',(p,b,w)=>{ w.phase='warning'; b.health=0; b.deathTime=99; });
  });
  await page.locator('#boss-scenes').screenshot({path:'test-results/boss-telegraphs.png'});
});
