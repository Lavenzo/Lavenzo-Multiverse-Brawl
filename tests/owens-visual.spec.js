import {test,expect} from '@playwright/test';
test('Kevin Owens vector redesign beside Cyclops and independently articulated combat poses',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 const result=await page.evaluate(async()=>{
 const {CharacterRenderer}=await import('/src/rendering/CharacterRenderer.js'),{resolveEnemy}=await import('/src/data/enemies.js'),{characters}=await import('/src/data/characters.js'),{Enemy}=await import('/src/entities/Enemy.js'),{beginAttack}=await import('/src/data/combat.js');
 const root=document.querySelector('#app');root.replaceChildren();const r=new CharacterRenderer(),config=resolveEnemy('owens'),cyclops=characters.find(c=>c.id==='cyclops');
 const make=(id,w,h)=>{const canvas=document.createElement('canvas');canvas.id=id;canvas.width=w;canvas.height=h;canvas.style.cssText='display:block;width:'+w+'px;height:'+h+'px';root.append(canvas);return canvas.getContext('2d');};
 const c=make('owens-cyclops',960,540);c.fillStyle='#1a2439';c.fillRect(0,0,960,540);
 c.fillStyle='#d4c5aa';c.font='20px monospace';c.fillText('ORIGINAL CANVAS ART / SAME GROUND AND SCALE',40,46);
 c.strokeStyle='#58647b';c.beginPath();c.moveTo(50,438);c.lineTo(910,438);c.stroke();
 for(const [cfg,x,label] of [[cyclops,305,'CYCLOPS'],[config,635,'KEVIN OWENS']]){
 c.fillStyle='#0c1324';c.beginPath();c.ellipse(x,441,48,9,0,0,Math.PI*2);c.fill();
 r.draw(c,{config:cfg,state:'idle',time:.4,facing:1,z:0},x,435,1.5);c.fillStyle='#ead4ae';c.font='18px monospace';c.fillText(label,x-55,488);
 }
 const a=make('owens-articulation',1200,900),poses=['idle','walk','punch windup','punch active','punch recovery','charge windup','charge active','kick','hurt','defeated','left facing','rear guard'];
 poses.forEach((label,i)=>{const x=i%4*300,y=Math.floor(i/4)*300;a.fillStyle='#1a2439';a.fillRect(x,y,298,298);a.fillStyle='#ead4ae';a.font='15px monospace';a.fillText(label,x+12,y+25);

 const e=new Enemy(config,0,0);e.time=.4;
 if(i>=2&&i<=6){beginAttack(e,config.attacks[i>=5?2:0]);e.attack.elapsed=e.attack.windup+(i===2||i===5?-.06:i===4?e.attack.active+.05:e.attack.active*.6);}
 else e.state=['idle','walk'][i] || (i===7?'kick':i===8?'hurt':i===9?'defeated':'idle');
 e.facing=i===10?-1:1;e.actionDuration=1;e.actionTime=i===9?.25:0;
 const before=JSON.stringify({health:e.health,x:e.x,y:e.y,attack:e.attack,state:e.state,bodyRadius:e.bodyRadius});
 r.draw(a,e,x+140,y+265,1.1);
 if(JSON.stringify({health:e.health,x:e.x,y:e.y,attack:e.attack,state:e.state,bodyRadius:e.bodyRadius})!==before)throw new Error('Rendering mutated simulation');
 });
 return {bodyRadius:new Enemy(config,0,0).bodyRadius,health:config.health};
 });
 expect(result).toEqual({bodyRadius:22,health:75});expect(errors).toEqual([]);
 await page.locator('#owens-cyclops').screenshot({path:'test-results/owens-beside-cyclops.png'});
 await page.locator('#owens-articulation').screenshot({path:'test-results/owens-articulation.png'});
});

test('Kevin Owens renders in the live Stage 2 game with Cyclops',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await page.getByTestId('start-developer').click();
 await page.getByTestId('character-cyclops').click();await page.getByTestId('confirm-character').click();
 await page.evaluate(()=>{const api=window.gameTestAPI;api.startStage(2);api.clearEnemies();api.spawnEnemy('owens',{x:430,y:430});});
 await expect.poll(()=>page.evaluate(()=>window.gameTestAPI.getEnemies()[0]?.state)).toBe('walk');
 await page.screenshot({path:'test-results/owens-live-stage2.png',fullPage:true});
 expect(errors).toEqual([]);
});
