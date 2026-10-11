import { test, expect } from '@playwright/test';

test('arcade selection and all four rendered heroes fit desktop/laptop viewports', async ({ page }) => {
  const errors=[]; page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{ if(message.type()==='error') errors.push(message.text()); });
  await page.goto('/'); await page.getByTestId('start-developer').click();
  for(const [width,height] of [[1280,720],[1366,768],[1920,1080],[1024,768]]) {
    await page.setViewportSize({width,height});
    const layout=await page.evaluate(()=>{
      const screen=document.querySelector('#screen').getBoundingClientRect();
      const cards=[...document.querySelectorAll('.hero-card')].map(el=>el.getBoundingClientRect());
      const button=document.querySelector('[data-testid=confirm-character]').getBoundingClientRect();
      const arena=document.querySelector('.viewport').getBoundingClientRect();
      return { overflow:document.documentElement.scrollWidth>innerWidth, ratio:arena.width/arena.height, fits:cards.every(r=>r.top>=screen.top&&r.bottom<=screen.bottom&&r.left>=screen.left&&r.right<=screen.right)&&button.bottom<=screen.bottom, buttonVisible:button.bottom<=innerHeight };
    });
    expect(layout.overflow).toBe(false); expect(layout.ratio).toBeCloseTo(16/9,2); expect(layout.fits).toBe(true); expect(layout.buttonVisible).toBe(true);
    await page.screenshot({path:`test-results/selection-${width}x${height}.png`,fullPage:true});
  }
  await page.setViewportSize({width:1280,height:720});
  await page.keyboard.press('ArrowRight'); await expect(page.getByTestId('character-leonardo')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByTestId('selected-character-details')).toContainText('Spinning Sword Attack');
  for(const hero of ['axel','leonardo','spiderman','cyclops']) {
    await page.getByTestId(`character-${hero}`).click(); await page.getByTestId('confirm-character').click();
    const nameNode=await page.locator('#hud-name').elementHandle();
    await page.screenshot({path:`test-results/city-${hero}.png`,fullPage:true});
    await page.keyboard.press('d'); await page.waitForTimeout(140);
    await page.screenshot({path:`test-results/special-${hero}.png`,fullPage:true});
    expect(await nameNode.evaluate(el=>el===document.querySelector('#hud-name'))).toBe(true);
    await page.waitForTimeout(550); await page.keyboard.press('Escape'); await page.getByTestId('return-menu').click(); await page.getByTestId('start-developer').click();
  }
  expect(errors).toEqual([]);
});

test('articulated pose atlas and optional PNG frame fallback', async ({ page }) => {
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
  await page.route('**/assets/replacement-test.png',route=>route.fulfill({contentType:'image/png',body:png}));
  await page.route('**/assets/missing-frame.png',route=>route.fulfill({status:404,body:'Missing optional image'}));
  await page.goto('/');
  const result=await page.evaluate(async()=>{
    const {CharacterRenderer}=await import('/src/rendering/CharacterRenderer.js');
    const {characters}=await import('/src/data/characters.js');
    const {AssetManager}=await import('/src/engine/AssetManager.js');
    const renderer=new CharacterRenderer();
    const canvas=document.createElement('canvas'); canvas.id='pose-atlas'; canvas.width=1200; canvas.height=1980;
    canvas.style.cssText='width:1200px;height:1980px;display:block'; const c=canvas.getContext('2d');
    c.fillStyle='#182338'; c.fillRect(0,0,1200,1980);
    const states=['idle','walk','punch','kick','jump','strongAttack','specialAttack','hurt','defeated'];
    for(let row=0;row<states.length;row++) for(let col=0;col<characters.length;col++) {
      const config=characters[col],state=states[row],x=col*300+100,y=row*220+203;
      c.fillStyle='#0c1629'; c.fillRect(col*300+2,row*220+2,296,216);
      renderer.draw(c,{config,state,time:.4,facing:1,z:state==='jump'?10:0,actionDuration:.48,actionTime:state==='idle'||state==='walk'?0:.24},x,y,.9);
      c.fillStyle='#eddbb5'; c.font='12px monospace'; c.fillText(`${config.name} / ${state}`,col*300+12,row*220+18);
    }
    document.querySelector('#app').replaceChildren(canvas);
    const manager=new AssetManager({characters:{axel:{width:120,height:180,animations:{idle:['assets/missing-frame.png']}}},backgrounds:{city:null}});
    const missing=await manager.load('assets/missing-frame.png');
    const fallback=manager.frame({config:characters[0],state:'idle',time:0});
    manager.config.characters.axel.animations.idle={frames:['assets/replacement-test.png'],fps:8,loop:true};
    const [loaded,duplicate]=await Promise.all([manager.load('assets/replacement-test.png'),manager.load('assets/replacement-test.png')]);
    const frame=manager.frame({config:characters[0],state:'idle',time:0});
    return {missing:missing===null,fallback:fallback===null,loaded:Boolean(loaded&&duplicate===loaded&&frame?.image===loaded),width:frame?.width,height:frame?.height};
  });
  expect(result).toEqual({missing:true,fallback:true,loaded:true,width:120,height:180});
  await page.locator('#pose-atlas').screenshot({path:'test-results/pose-atlas.png'});
});

test('movement boundaries, facing, scrolling and responsive canvas backing size', async ({ page }) => {
  await page.goto('/'); await page.getByTestId('start-developer').click(); await page.getByTestId('confirm-character').click();
  await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(1000); await page.keyboard.up('ArrowLeft');
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().x)).toBe(65);
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().facing)).toBe(-1);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(2800); await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().x)).toBeGreaterThan(600);
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().facing)).toBe(1);
  await page.screenshot({path:'test-results/city-scrolling.png',fullPage:true});
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp');
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().y)).toBe(365);
  await page.keyboard.press('Space'); await page.waitForTimeout(170);
  expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().z)).toBeGreaterThan(0);
  await page.screenshot({path:'test-results/city-jump.png',fullPage:true});
  await page.waitForTimeout(900); expect(await page.evaluate(()=>window.gameTestAPI.getPlayerSnapshot().z)).toBe(0);
  await page.setViewportSize({width:1024,height:768}); await page.waitForTimeout(100);
  const ratio=await page.locator('.viewport > canvas').evaluate(el=>el.width/el.height); expect(ratio).toBeCloseTo(16/9,2);
});
