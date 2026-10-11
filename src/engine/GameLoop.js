export class GameLoop {
  constructor(update, render) { this.update = update; this.render = render; this.last = 0; this.fps = 60; }
  start() {
    const frame = now => {
      const dt = Math.min((now - (this.last || now)) / 1000, 0.05); this.last = now;
      if (dt > 0) this.fps += (1 / dt - this.fps) * 0.05;
      this.delta = dt; this.update(dt); this.render(); requestAnimationFrame(frame);
    }; requestAnimationFrame(frame);
  }
}
