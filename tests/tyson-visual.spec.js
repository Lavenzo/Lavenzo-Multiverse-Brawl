import {test,expect} from '@playwright/test';
test('Prime Tyson beside Cyclops at gameplay scale and boxing articulation atlas',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
 const {CharacterRenderer}=await import('/src/rendering/CharacterRenderer.js'),{resolveEnemy}=await import('/src/data/enemies.js'),{characters}=await import('/src/data/characters.js'),{Boss}=await import('/src/entities/Boss.js');
 const root=document.querySelector('#app');root.replaceChildren();const r=new CharacterRenderer(),config=resolveEnemy('tyson'),hero=characters.find(c=>c.id==='cyclops');
 const make=(id,w,h)=>{const el=document.createElement('canvas');el.id=id;el.width=w;el.height=h;el.style.cssText='display:block;width:'+w+'px;height:'+h+'px';root.append(el);return el.getContext('2d');};
 const c=make('tyson-cyclops',960,540);c.fillStyle='#1a2439';c.fillRect(0,0,960,540);c.fillStyle='#ead4ae';c.font='18px monospace';c.fillText('PRIME IRON MIKE / ACTUAL GAMEPLAY SCALE',45,42);
 c.strokeStyle='#53617a';c.beginPath();c.moveTo(60,380);c.lineTo(900,380);c.stroke();
 for(const [cfg,x,label] of [[hero,315,'CYCLOPS'],[config,640,'IRON MIKE']]){
 c.fillStyle='#0c1424';c.beginPath();c.ellipse(x,383,37*(cfg.scale || 1),10,0,0,Math.PI*2);c.fill();
 r.draw(c,{config:cfg,state:'idle',time:.4,facing:1,z:0},x,378,cfg.scale || 1);
 c.fillStyle='#ead4ae';c.font='18px monospace';c.fillText(label,x-50,430);}
 const a=make('tyson-boxing-atlas',1200,1200);
 const poses=[['guard'],['walk'],['intro'],['left facing'],['jab windup','punch','windup'],['jab','punch','active',.25],['cross','punch','active',.8],['jab recovery','punch','recover'],['left hook','hook','active',.5,1],['right hook','hook','active',.5,2],['uppercut windup','uppercut','windup'],['uppercut','uppercut','active'],['weave','shove','windup'],['rush','charge','active'],['hurt'],['defeated']];
 poses.forEach(([label,id,stage,k=.5,side=1],i)=>{
 const x=i%4*300,y=Math.floor(i/4)*300;a.fillStyle='#1a2439';a.fillRect(x,y,298,298);a.fillStyle='#ead4ae';a.font='15px monospace';a.fillText(label,x+12,y+25);
 const b=new Boss(config,0,0);b.time=.4;b.closeAttacks=side;
 if(id){b.perform(id);b.attack.elapsed=stage==='windup'?b.attack.windup*.7:stage==='active'?b.attack.windup+b.attack.active*k:b.attack.windup+b.attack.active+.1;}
 else b.state=label==='guard'||label==='left facing'?'idle':label;
 b.facing=label==='left facing'?-1:1;b.actionDuration=1;b.actionTime=label==='defeated'?.25:0;
 const before=JSON.stringify({health:b.health,x:b.x,y:b.y,attack:b.attack,state:b.state,bodyRadius:b.bodyRadius});
 r.draw(a,b,x+135,y+270,1.05);
 if(JSON.stringify({health:b.health,x:b.x,y:b.y,attack:b.attack,state:b.state,bodyRadius:b.bodyRadius})!==before)throw new Error('Drawing mutated boss simulation');
 });
 });
 await page.locator('#tyson-cyclops').screenshot({path:'test-results/tyson-beside-cyclops.png'});
 await page.locator('#tyson-boxing-atlas').screenshot({path:'test-results/tyson-boxing-atlas.png'});
 expect(errors).toEqual([]);
});
test('Tyson original boss introduction and live artwork with Cyclops',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await page.getByTestId('start-developer').click();await page.getByTestId('character-cyclops').click();await page.getByTestId('confirm-character').click();
 await page.evaluate(()=>{const api=window.gameTestAPI;api.startStage(2);api.spawnBoss({intro:true,restore:true});});
 await expect(page.getByTestId('boss-banner')).toContainText('WARNING');
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getBoss().encounter),{timeout:10000}).toBe('entrance');
 await page.screenshot({path:'test-results/tyson-prime-introduction.png',fullPage:true});
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getBoss().encounter),{timeout:10000}).toBe('boss');
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getPlayerHealth()),{timeout:10000}).toBeLessThan(110);
 await page.screenshot({path:'test-results/tyson-prime-live.png',fullPage:true});
 expect(errors).toEqual([]);
});
