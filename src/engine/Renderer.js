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
    // The HUD boss uses the DOM bar at the top centre; a simultaneous mini-boss bar moves below it.
    this.hudBoss=game.activeBoss();
    if(p) { for(const enemy of game.enemies) this.telegraph(enemy); for(const actor of [p,...game.enemies].sort((a,b)=>a.y-b.y)) this.player(actor); }
    const mini=game.enemies.find(e=>e.health>0&&e.config.tier==='miniboss'),top=this.hudBoss && game.waves.phase!=='warning'?80:15;
    if(mini) { c.fillStyle='#121a2bcc'; c.fillRect(345,top,270,40); c.fillStyle='#c7d9e8'; c.font='bold 10px monospace'; c.fillText(`MINI-BOSS / ${mini.config.name.toUpperCase()}`,355,top+14); c.fillStyle='#344357'; c.fillRect(355,top+21,250,8); c.fillStyle='#d47592'; c.fillRect(355,top+21,250*mini.health/mini.maxHealth,8); }
    if(p && game.waves.phase==='warning') this.warning(game.waves.phaseTime);
    c.fillStyle='#060e1b0b'; for(let y=0;y<540;y+=4) c.fillRect(0,y,960,1);
    c.fillStyle='#c9c1d5'; c.font='10px monospace'; c.fillText('CITY STREETS / MIXED-UNIVERSE BRAWL / FOUR WAVES + KINGPIN',20,529);
  }
  warning(time) {
    const c=this.ctx,edge=c.createRadialGradient(480,270,230,480,270,560);
    edge.addColorStop(0,'rgba(216,40,64,0)'); edge.addColorStop(1,`rgba(216,40,64,${.2+.14*Math.sin(time*9)})`); c.fillStyle=edge; c.fillRect(0,0,960,540);
  }
  // Ground warnings for telegraphed boss moves, drawn under every actor. Sizes match the hit checks
  // against a hero (body radius 19): charge travel + reach for the lane, slam/shockwave reach for the ring.
  telegraph(actor) {
    const a=actor.attack; if(!a?.telegraph || actor.health<=0 || a.elapsed>a.windup+a.active+.2) return;
    const c=this.ctx,warn=a.elapsed<a.windup,pulse=.55+.45*Math.sin(a.elapsed*28); c.save();
    if(a.telegraph==='lane' && a.elapsed<=a.windup+a.active) {
      const length=a.charge*a.active+a.range+19,start=(a.originX ?? actor.x)-this.camera,left=a.facing>0?start:start-length;
      c.fillStyle=warn?`rgba(240,72,82,${.1+.1*pulse})`:'rgba(255,214,140,.14)'; c.fillRect(left,actor.y-a.lane,length,a.lane*2);
      c.setLineDash([10,8]); c.strokeStyle=`rgba(255,120,110,${warn?.6:.3})`; c.lineWidth=2; c.strokeRect(left,actor.y-a.lane,length,a.lane*2); c.setLineDash([]);
      c.strokeStyle=`rgba(255,215,160,${.3+.35*pulse})`; c.lineWidth=3;
      for(let i=1;i<5;i++) { const cx=start+a.facing*length*i/5; c.beginPath(); c.moveTo(cx-a.facing*8,actor.y-9); c.lineTo(cx,actor.y); c.lineTo(cx-a.facing*8,actor.y+9); c.stroke(); }
    }
    if(a.telegraph==='ring') {
      const x=actor.x-this.camera,reach=(warn?(a.shockwave?.to ?? a.range):a.range)+19,grow=warn?a.elapsed/a.windup:1;
      c.beginPath(); c.ellipse(x,actor.y,reach,a.lane,0,0,Math.PI*2);
      if(warn) {
        c.fillStyle=`rgba(240,72,82,${.06+.1*grow})`; c.fill(); c.setLineDash([9,7]); c.strokeStyle=`rgba(255,120,110,${.4+.3*pulse})`; c.lineWidth=2; c.stroke(); c.setLineDash([]);
        c.beginPath(); c.ellipse(x,actor.y,reach*grow,a.lane*grow,0,0,Math.PI*2); c.strokeStyle='rgba(255,190,150,.55)'; c.stroke();
      } else {
        c.lineWidth=6; c.strokeStyle='rgba(255,236,190,.85)'; c.stroke();
        c.beginPath(); c.ellipse(x,actor.y,reach*.86,a.lane*.86,0,0,Math.PI*2); c.lineWidth=2; c.strokeStyle='rgba(255,140,90,.9)'; c.stroke();
      }
    }
    c.restore();
  }
  player(p) {
    const c=this.ctx,x=p.x-this.camera,y=p.y-p.z,scale=p.config.scale || 1,boss=p===this.hudBoss;
    c.save();
    if(p.health<=0) c.globalAlpha=p.config.corpseTime?Math.max(0,Math.min(1,p.config.corpseTime-p.deathTime)):Math.max(0,1-p.deathTime/1.25);
    if(p.entrance) c.globalAlpha=Math.min(1,.15+p.entrance.time/.5);
    c.fillStyle=`rgba(3,9,20,${Math.max(.18,.5-p.z/300)})`; c.beginPath(); c.ellipse(x,p.y+4,(37-p.z*.09)*scale,(10-p.z*.02)*scale,0,0,Math.PI*2); c.fill();
    const frame=this.assets.frame(p);
    if(frame) { c.save(); c.translate(x,y); c.scale(p.facing,1); c.drawImage(frame.image,-frame.width*frame.anchorX,-frame.height*frame.anchorY,frame.width,frame.height); c.restore(); }
    else this.characters.draw(c,p,x,y,scale);
    if(p.team==='enemy' && p.health>0) {
      const top=y-181*scale-16,windup=p.attack && p.attack.elapsed<p.attack.windup;
      c.textAlign='center';
      // Bosses use the large HUD bar instead of an overhead bar, but keep a stronger windup cue.
      if(!boss) {
        c.font='bold 9px monospace'; c.fillStyle=p.config.tier==='elite'?'#e0b8ff':'#ead4b9'; c.fillText(p.config.name,x,top);
        c.fillStyle='#142035'; c.fillRect(x-33,top+6,66,5); c.fillStyle=p.config.tier==='regular'?'#dd8f6a':'#bd86d8'; c.fillRect(x-33,top+6,66*p.health/p.maxHealth,5);
        if(windup) { c.fillStyle='#ffcc7b'; c.font='bold 14px monospace'; c.fillText('!',x,top-12); }
      } else if(windup) {
        const size=11+Math.sin(p.attack.elapsed*24)*1.5,cy=top+2;
        c.fillStyle='#d8344a'; c.strokeStyle='#ffe2b0'; c.lineWidth=2; c.beginPath(); c.moveTo(x,cy-size); c.lineTo(x+size,cy); c.lineTo(x,cy+size); c.lineTo(x-size,cy); c.closePath(); c.fill(); c.stroke();
        c.fillStyle='#fff3d6'; c.font='bold 14px monospace'; c.fillText('!',x,cy+5);
      }
      c.textAlign='left';
    }
    if(p.attack && p.actionTime) { c.fillStyle='#fff1c2'; c.font='bold 10px monospace'; c.textAlign='center'; const label=p.team==='enemy'?p.attack.name:p.state==='special'?p.config.special:p.state==='strong'?p.config.strong:p.state.toUpperCase(); c.fillText(label,x,y-193*scale-18); c.textAlign='left'; }
    c.restore();
  }
}
