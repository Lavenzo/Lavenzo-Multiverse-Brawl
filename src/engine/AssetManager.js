import { assetConfig } from '../data/assets.js';

export class AssetManager {
  constructor(config = assetConfig) { this.config = config; this.images = new Map(); this.pending = new Map(); }
  load(path) {
    if (!path) return Promise.resolve(null);
    if(this.pending.has(path)) return this.pending.get(path);
    if(this.images.has(path)) return Promise.resolve(this.images.get(path));
    this.images.set(path,null);
    const request = new Promise(resolve => {
      const image = new Image();
      image.onload = () => { this.images.set(path,image); resolve(image); };
      image.onerror = () => resolve(null);
      image.src = `${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`;
    });
    this.pending.set(path,request); request.then(()=>this.pending.delete(path)); return request;
  }
  preload() {
    const paths = new Set(Object.values(this.config.backgrounds).filter(Boolean));
    for (const hero of [...Object.values(this.config.characters),...Object.values(this.config.enemies || {})]) for (const animation of Object.values(hero.animations)) {
      for (const path of Array.isArray(animation) ? animation : animation.frames || []) paths.add(path);
    }
    return Promise.all([...paths].map(path => this.load(path)));
  }
  frame(actor) {
    const definition = this.config.characters[actor.config.id] || this.config.enemies?.[actor.config.id]; if (!definition) return null;
    const alias = { strong: 'strongAttack', special: 'specialAttack' };
    const animation = definition.animations[actor.state] || definition.animations[alias[actor.state]];
    if (!animation) return null;
    const frames = Array.isArray(animation) ? animation : animation.frames || [];
    if (!frames.length) return null;
    const time = actor.actionTime ? actor.actionDuration-actor.actionTime : actor.time;
    const index = Math.floor(Math.max(0,time)*(animation.fps || definition.fps || 10));
    const image = this.images.get(frames[animation.loop === false ? Math.min(index,frames.length-1) : index%frames.length]);
    return image ? { image, width: definition.width, height: definition.height, anchorX: definition.anchorX ?? .5, anchorY: definition.anchorY ?? 1 } : null;
  }
}
