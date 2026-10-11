import { CharacterRenderer } from '../rendering/CharacterRenderer.js';
import { CityRenderer } from '../rendering/CityRenderer.js';
import { AssetManager } from './AssetManager.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.characters = new CharacterRenderer(); this.city = new CityRenderer();
    this.assets = new AssetManager(); this.assetsReady = this.assets.preload(); this.camera = 0; this.lastPlayer = null;
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(canvas); this.resize();
  }
  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1,2);
    const width = Math.round(this.canvas.clientWidth*ratio) || 960;
    const height = Math.round(width*9/16);
    if(this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width=width; this.canvas.height=height; }
  }
  draw(game) {
    const c=this.ctx,p=game.player;
    c.setTransform(this.canvas.width/960,0,0,this.canvas.height/540,0,0);
    const target=p ? Math.max(0,Math.min(1440,p.x-400)) : 0;
    if(p!==this.lastPlayer) { this.camera=target; this.lastPlayer=p; }
    if(game.state==='playing' && !game.ui.developerOpen) this.camera+=(target-this.camera)*(1-Math.exp(-10*(game.loop.delta || 0)));
    if(!p) this.camera=0;
    this.city.draw(c,this.camera,this.assets.images.get(this.assets.config.backgrounds.city));
    if(p) for(const actor of [p,...game.enemies].sort((a,b)=>a.y-b.y)) this.player(actor);
    const mini=game.enemies.find(e=>e.health>0&&e.config.tier==='miniboss');
    if(mini) { c.fillStyle='#121a2bcc'; c.fillRect(345,15,270,40); c.fillStyle='#c7d9e8'; c.font='bold 10px monospace'; c.fillText(`MINI-BOSS / ${mini.config.name.toUpperCase()}`,355,29); c.fillStyle='#344357'; c.fillRect(355,36,250,8); c.fillStyle='#d47592'; c.fillRect(355,36,250*mini.health/mini.maxHealth,8); }
    c.fillStyle='#060e1b0b'; for(let y=0;y<540;y+=4) c.fillRect(0,y,960,1);
    c.fillStyle='#c9c1d5'; c.font='10px monospace'; c.fillText('CITY STREETS / MIXED-UNIVERSE BRAWL / FOUR WAVES',20,529);
  }
  player(p) {
    const c=this.ctx,x=p.x-this.camera,y=p.y-p.z,scale=p.config.scale || 1;
    c.save(); if(p.health<=0) c.globalAlpha=Math.max(0,1-p.deathTime/1.25);
    c.fillStyle=`rgba(3,9,20,${Math.max(.18,.5-p.z/300)})`; c.beginPath(); c.ellipse(x,p.y+4,(37-p.z*.09)*scale,(10-p.z*.02)*scale,0,0,Math.PI*2); c.fill();
    const frame=this.assets.frame(p);
    if(frame) { c.save(); c.translate(x,y); c.scale(p.facing,1); c.drawImage(frame.image,-frame.width*frame.anchorX,-frame.height*frame.anchorY,frame.width,frame.height); c.restore(); }
    else this.characters.draw(c,p,x,y,scale);
    if(p.team==='enemy' && p.health>0) {
      const top=y-181*scale-16;
      c.textAlign='center'; c.font='bold 9px monospace'; c.fillStyle=p.config.tier==='elite'?'#e0b8ff':'#ead4b9'; c.fillText(p.config.name,x,top);
      c.fillStyle='#142035'; c.fillRect(x-33,top+6,66,5); c.fillStyle=p.config.tier==='regular'?'#dd8f6a':'#bd86d8'; c.fillRect(x-33,top+6,66*p.health/p.maxHealth,5);
      if(p.attack && p.attack.elapsed<p.attack.windup) { c.fillStyle='#ffcc7b'; c.font='bold 14px monospace'; c.fillText('!',x,top-12); }
      c.textAlign='left';
    }
    if(p.attack && p.actionTime) { c.fillStyle='#fff1c2'; c.font='bold 10px monospace'; c.textAlign='center'; const label=p.team==='enemy'?p.attack.name:p.state==='special'?p.config.special:p.state==='strong'?p.config.strong:p.state.toUpperCase(); c.fillText(label,x,y-193*scale-18); c.textAlign='left'; }
    c.restore();
  }
}
