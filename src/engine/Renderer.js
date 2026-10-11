export class Renderer {
  constructor(canvas) { this.ctx = canvas.getContext('2d'); }
  draw(game) {
    const c = this.ctx, p = game.player; c.clearRect(0, 0, 960, 540);
    const sky = c.createLinearGradient(0, 0, 0, 540); sky.addColorStop(0, '#10172f'); sky.addColorStop(1, '#322b49'); c.fillStyle = sky; c.fillRect(0, 0, 960, 540);
    const camera = p ? Math.max(0, Math.min(1440, p.x - 400)) : 0;
    for (let i = 0; i < 16; i++) {
      const x = i * 165 - camera * 0.45, h = 140 + (i * 37 % 110); c.fillStyle = i % 2 ? '#1d2640' : '#151e34'; c.fillRect(x, 320 - h, 150, h);
      c.fillStyle = '#bfa570'; for (let y = 340 - h; y < 300; y += 30) for (let w = 15; w < 140; w += 28) if ((i + w + y) % 3) c.fillRect(x + w, y, 8, 12);
    }
    c.fillStyle = '#30344b'; c.fillRect(0, 315, 960, 35); c.fillStyle = '#222638'; c.fillRect(0, 350, 960, 190);
    c.strokeStyle = '#45475b'; for (let y = 370; y < 540; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(960, y); c.stroke(); }
    for (let i = 0; i < 10; i++) { const x = i * 280 - camera; c.fillStyle = '#8b6cd9'; c.fillRect(x + 10, 260, 130, 30); c.fillStyle = '#f2dafa'; c.font = 'bold 13px monospace'; c.fillText(i % 2 ? 'ARCADE' : 'LAVENZO', x + 22, 280); c.fillStyle = '#59617b'; c.fillRect(x + 180, 236, 5, 110); c.fillStyle = '#ffe4a4'; c.fillRect(x + 168, 232, 29, 7); }
    if (p) this.player(p, camera);
    c.fillStyle = '#a8aec8'; c.font = '12px monospace'; c.fillText('CITY STREETS • FOUNDATION PLAYGROUND • COMBAT DAMAGE COMING IN MILESTONE 2', 24, 528);
  }
  player(p, camera) {
    const c = this.ctx, x = p.x - camera, y = p.y - p.z; c.fillStyle = '#0007'; c.beginPath(); c.ellipse(x, p.y + 5, 25, 8, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(x, y); c.scale(p.facing, 1); const moving = p.state === 'walk' ? Math.sin(p.time * 15) * 10 : 0;
    c.lineWidth = 11; c.lineCap = 'round'; c.strokeStyle = p.config.accent;
    const line = (x1,y1,x2,y2) => { c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); };
    line(-9,-25,-12 + moving,0); line(9,-25,p.state === 'kick' ? 48 : 12 - moving,p.state === 'kick' ? -24 : 0);
    c.fillStyle = p.config.color; c.fillRect(-17,-60,34,36); c.strokeStyle = p.config.color;
    line(-15,-51,-23,-31 + moving / 2); line(15,-51,['punch','strong'].includes(p.state) ? 53 : 24,['punch','strong'].includes(p.state) ? -52 : -30 - moving / 2);
    c.fillStyle = p.config.color; c.beginPath(); c.arc(0,-76,15,0,Math.PI*2); c.fill(); c.fillStyle = p.config.accent; c.fillRect(-14,-81,29,7);
    if (p.config.id === 'leonardo') { c.strokeStyle = '#d8e8ff'; c.lineWidth = 3; line(24,-35,p.actionTime ? 70 : 32,-85); }
    if (p.state === 'special') { c.strokeStyle = p.config.accent; c.lineWidth = 4; c.beginPath(); c.arc(0,-44,62, -p.time * 8, -p.time * 8 + 4.5); c.stroke(); if (['cyclops','spiderman'].includes(p.config.id)) line(20,-77,180,-77); }
    if (p.state === 'strong') { c.strokeStyle = '#fff8'; c.lineWidth = 3; line(32,-62,70,-62); line(35,-43,77,-43); }
    c.restore();
    if (p.actionTime) { c.fillStyle = '#fff'; c.font = 'bold 14px monospace'; const label = p.state === 'special' ? p.config.special : p.state === 'strong' ? p.config.strong : p.state.toUpperCase(); c.fillText(label,x-45,y-110); }
  }
}
