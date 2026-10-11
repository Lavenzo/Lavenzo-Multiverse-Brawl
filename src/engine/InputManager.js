export const defaultBindings = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', punch: 'KeyA', kick: 'KeyS', special: 'KeyD', strong: 'KeyW', jump: 'Space', confirm: 'Enter', pause: 'Escape', developer: 'KeyP' };
export class InputManager {
  constructor(bindings = defaultBindings) {
    this.bindings = { ...bindings }; this.held = new Set(); this.pressed = new Set(); this.shortcuts = [];
    window.addEventListener('keydown', e => {
      if (e.target instanceof HTMLElement && e.target.matches('input,select,textarea')) return;
      if (Object.values(this.bindings).includes(e.code)) e.preventDefault();
      if (!e.repeat) { this.pressed.add(e.code); if (e.shiftKey && /^Digit\d$/.test(e.code)) this.shortcuts.push(Number(e.code.slice(-1))); }
      this.held.add(e.code);
    });
    window.addEventListener('keyup', e => this.held.delete(e.code));
    window.addEventListener('blur', () => this.clear());
  }
  down(action) { return this.held.has(this.bindings[action]); }
  take(action) { const code = this.bindings[action]; const result = this.pressed.has(code); this.pressed.delete(code); return result; }
  clear() { this.held.clear(); this.pressed.clear(); this.shortcuts.length = 0; }
  endFrame() { this.pressed.clear(); this.shortcuts.length = 0; }
  setBindings(bindings) { this.bindings = { ...this.bindings, ...bindings }; this.clear(); }
}
