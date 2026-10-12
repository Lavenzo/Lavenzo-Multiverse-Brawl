// Original articulated Canvas illustrations. All coordinates are relative to the feet.
// The same renderer is shared by gameplay, selection cards and future pose previews.
const palettes = {
  axel: { skin: '#efb17c', shade: '#bd714f', top: '#f5f1dd', topShade: '#adb9c0', pants: '#355eab', pantsShade: '#203d79', trim: '#e74c48', boot: '#eeeece' },
  leonardo: { skin: '#71b65c', shade: '#36734e', top: '#c6a86a', topShade: '#8a7446', pants: '#66a951', pantsShade: '#357149', trim: '#4b9bea', boot: '#a28a60' },
  spiderman: { skin: '#d83e51', shade: '#8b253c', top: '#da3f52', topShade: '#9b2b43', pants: '#3265a4', pantsShade: '#213a71', trim: '#df4754', boot: '#d83e51' },
  cyclops: { skin: '#edaf7b', shade: '#b86c4c', top: '#3265a5', topShade: '#213867', pants: '#3265a5', pantsShade: '#213867', trim: '#f5cb54', boot: '#eac349' },
  streetfighter: { skin:'#d9a376',shade:'#95624e',top:'#ac4353',topShade:'#652f47',pants:'#687660',pantsShade:'#3b4c45',trim:'#e8ba85',boot:'#253448' },
  roman: { skin:'#bc8c69',shade:'#865b48',top:'#202b3b',topShade:'#101b2e',pants:'#233044',pantsShade:'#121d31',trim:'#cf5455',boot:'#172033' },
  seth: { skin:'#e0af80',shade:'#a47151',top:'#e0af80',topShade:'#a47151',pants:'#bfa059',pantsShade:'#67593b',trim:'#332d36',boot:'#302839' },
  shredder: { skin:'#b5b7c4',shade:'#6e7389',top:'#7e668f',topShade:'#4a395d',pants:'#615677',pantsShade:'#393047',trim:'#b6bece',boot:'#929aac' },
  venom: { skin:'#1c2c42',shade:'#111b2d',top:'#23364c',topShade:'#111c2f',pants:'#1d2d43',pantsShade:'#111b2d',trim:'#bbcbd9',boot:'#1a2b42' },
};

function shape(c, points, fill, stroke = '#111b30', width = 2) {
  c.beginPath(); c.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
  c.closePath(); c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); }
}
function oval(c, x, y, rx, ry, fill, stroke = '#182039') {
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1.8; c.stroke(); }
}
function line(c, points, color, width = 2) {
  c.beginPath(); c.moveTo(...points[0]); for (let i = 1; i < points.length; i++) c.lineTo(...points[i]);
  c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke();
}
function segment(c, from, to, width, color, shade) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const nx = Math.sin(angle) * width / 2, ny = -Math.cos(angle) * width / 2;
  shape(c, [[from[0]-nx,from[1]-ny],[from[0]+nx,from[1]+ny],[to[0]+nx*.7,to[1]+ny*.7],[to[0]-nx*.7,to[1]-ny*.7]],color);
  line(c, [[from[0]-nx*.45,from[1]-ny*.45],[to[0]-nx*.45,to[1]-ny*.45]],shade,Math.max(2,width*.22));
  oval(c, to[0], to[1], width*.33, width*.33,color);
}
function limb(c, a, b, d, width, color, shade) {
  segment(c,a,b,width,color,shade); segment(c,b,d,width*.86,color,shade);
}
function boot(c, foot, color, angle = 0) {
  c.save(); c.translate(...foot); c.rotate(angle);
  shape(c,[[-8,-10],[5,-10],[8,-4],[19,0],[18,6],[-9,6],[-11,1]],color);
  line(c,[[-8,4],[17,4]],'#172239',2); line(c,[[0,-6],[6,-5]],'#fff7',2); c.restore();
}
function sword(c, hand, angle) {
  c.save(); c.translate(...hand); c.rotate(angle);
  shape(c,[[-3,6],[-3,-15],[3,-15],[3,6]],'#69433b');
  line(c,[[-10,-16],[10,-16]],'#e6bd65',4);
  shape(c,[[-3,-18],[-2,-78],[0,-89],[4,-78],[4,-18]],'#d1e6ea');
  line(c,[[1,-20],[1,-77]],'#fff',1); c.restore();
}
function burst(c, at, size = 1, color = '#fff3b4') {
  const [x,y] = at, s = size;
  shape(c,[[x,y-14*s],[x+4*s,y-4*s],[x+15*s,y],[x+4*s,y+4*s],[x,y+14*s],[x-4*s,y+4*s],[x-15*s,y],[x-4*s,y-4*s]],color,null);
}

// Kingpin: heavy white-suited boss with his own proportions, drawn with the same helpers and outline style.
const kingpinPalette = { suit:'#ffffff', suitShade:'#dcdce4', suitDeep:'#b0b0bc', shirt:'#911122', shirtShade:'#5e0915', tie:'#111111', skin:'#e3ae88', skinShade:'#b07a5a', rage:'#e8977c', rageShade:'#b5604c', shoe:'#181818', gold:'#e9c46c', gem:'#c3f0ff', pants:'#28282d', pantsShade:'#15151a', pantsDeep:'#0a0a0f' };
const mix = (a,b,t) => [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t];
const smooth = t => { t = Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
// ready = end of windup, strike = active window. Legs are feet-relative; arms are in upper-body space.
const kingpinKeys = {
  punch: { ready: { lean:-.07, bodyY:2, frontElbow:[10,-108], frontHand:[-2,-122], backElbow:[16,-104], backHand:[32,-106] },
    strike: { lean:.18, bodyY:8, frontElbow:[68,-118], frontHand:[108,-116], backElbow:[-40,-104], backHand:[-35,-86], frontKnee:[32,-34], frontFoot:[38,-3] } },
  strong: { ready: { lean:-.15, frontElbow:[-6,-132], frontHand:[-32,-142], backElbow:[20,-102], backHand:[32,-114] },
    strike: { lean:.28, bodyY:10, frontElbow:[65,-138], frontHand:[105,-128], backElbow:[-45,-106], backHand:[-40,-84], frontKnee:[35,-34], frontFoot:[42,-3] } },
  charge: { ready: { lean:.38, bodyY:12, frontElbow:[35,-110], frontHand:[48,-92], backElbow:[-35,-104], backHand:[-18,-90], backKnee:[-38,-28], backFoot:[-50,-3], frontKnee:[36,-30], frontFoot:[38,-3] },
    strike: { lean:.6, bodyY:8, frontElbow:[55,-116], frontHand:[45,-138], backElbow:[-40,-110], backHand:[-28,-128] } },
  slam: { ready: { lean:-.18, bodyY:-8, head:-.2, frontElbow:[32,-185], frontHand:[15,-220], backElbow:[-20,-182], backHand:[6,-222] },
    strike: { lean:.7, bodyY:20, head:.15, frontElbow:[65,-95], frontHand:[90,-55], backElbow:[55,-92], backHand:[80,-50], backKnee:[-38,-30], backFoot:[-36,-3], frontKnee:[38,-30], frontFoot:[36,-3] } },
  shove: { ready: { lean:-.1, frontElbow:[16,-104], frontHand:[30,-114], backElbow:[-12,-100], backHand:[22,-104] },
    strike: { lean:.3, bodyY:10, frontElbow:[65,-114], frontHand:[105,-105], backElbow:[50,-102], backHand:[90,-92], frontKnee:[32,-34], frontFoot:[42,-3] } },
  roar: { ready: { lean:.15, bodyY:6, frontElbow:[40,-106], frontHand:[35,-92], backElbow:[-18,-100], backHand:[25,-94] },
    strike: { lean:-.25, bodyY:-6, head:-.4, frontElbow:[58,-160], frontHand:[78,-195], backElbow:[-52,-158], backHand:[-70,-190] } },
};
function blendPose(from, to, t) {
  const out = { ...from };
  for (const [key,value] of Object.entries(to)) out[key] = Array.isArray(value) ? mix(from[key],value,t) : (from[key] ?? 0)+(value-(from[key] ?? 0))*t;
  return out;
}
// Attack timing drives the pose so windups read clearly. Previews without an attack show the strike.
function attackStage(actor) {
  const a = actor.attack;
  if (!a) return actor.actionTime > 0 ? { stage:'active', k:1 } : { stage:'recover', k:1 };
  if (a.elapsed < a.windup) return { stage:'windup', k:a.elapsed/a.windup };
  if (a.elapsed < a.windup+a.active) return { stage:'active', k:(a.elapsed-a.windup)/a.active };
  return { stage:'recover', k:Math.min(1,(a.elapsed-a.windup-a.active)/Math.max(.01,a.duration-a.windup-a.active)) };
}

export class CharacterRenderer {
  draw(c, actor, x, y, scale = 1) {
    if (actor.config.id === 'kingpin') { this.kingpin(c,actor,x,y,scale); return; }
    if (actor.config.id === 'tyson') return this.drawTyson(c, actor, x, y, scale);
    const p = palettes[actor.config.id] || palettes.axel;
    const id = actor.config.id, state = actor.state;
    const walk = state === 'walk', jumping = state === 'jump' || actor.z > 0;
    const strong = state === 'strong' || state === 'strongAttack';
    const special = state === 'special' || state === 'specialAttack';
    const attack = state === 'punch' || strong;
    const phase = actor.actionDuration ? 1 - actor.actionTime / actor.actionDuration : 0.5;
    const extension = Math.sin(Math.min(1, phase) * Math.PI);
    const stride = walk ? Math.sin(actor.time * 12) : 0;
    const bob = walk ? Math.abs(Math.sin(actor.time * 12)) * 3 : Math.sin(actor.time * 3) * 1.2;
    const lean = attack ? extension * 11 : state === 'kick' ? -5 : 0;
    const landing = Math.max(0, actor.landingTime || 0) / 0.16;
    c.save(); c.translate(x,y); c.scale((actor.facing || 1)*scale,scale);
    if (state === 'defeated') { const fall = actor.actionTime > 0 ? Math.min(1,phase*2) : 1; c.translate(75*fall,-30*fall); c.rotate(-1.55*fall); }
    if (state === 'hurt') { c.translate(-7*extension,4*extension); c.rotate(-0.2*extension); }
    c.translate(lean,bob + landing*7);
    const hipBack = [-10,-66], hipFront = [10,-66];
    let backKnee = [-19-stride*14,-36], backFoot = [-23-stride*24,-3];
    let frontKnee = [19+stride*14,-35], frontFoot = [21+stride*24,-3];
    if (jumping) { backKnee = [-27,-44]; backFoot = [-12,-22]; frontKnee = [31,-55]; frontFoot = [33,-30]; }
    if (strong) { backKnee = [-29,-35]; backFoot = [-40,-3]; frontKnee = [27,-40]; frontFoot = [39,-3]; }
    if (state === 'hurt') { frontKnee = [28,-37]; frontFoot = [33,-3]; }
    if (state === 'kick') { frontKnee = [25+extension*26,-66-extension*9]; frontFoot = [35+extension*69,-41-extension*39]; }
    if (special && id === 'seth') { frontKnee=[28,-58-extension*18]; frontFoot=[41,-4-extension*40]; }
    if (special && id === 'axel') { frontKnee = [23,-51]; frontFoot = [30,-10]; }
    if (id === 'leonardo') oval(c,-15,-99,27,35,'#426d42');
    if (id==='roman'||id==='seth') shape(c,[[-15,-168],[10,-168],[17,-150],[11,-101],[-30,-105],[-24,-150]],'#17202c');
    limb(c,hipBack,backKnee,backFoot,22,p.pantsShade,'#132842'); boot(c,backFoot,p.boot);
    const shoulderBack = [-19,-118];
    const elbowBack = strong ? [-33,-114] : [-34-stride*5,-91];
    const handBack = strong ? [-8,-123] : [-27,-72+stride*7];
    limb(c,shoulderBack,elbowBack,handBack,id==='venom'?24:17,p.skin,p.shade);
    if (id === 'leonardo') sword(c,handBack,-.65);
    // Broad shoulders, tapered waist, shaped chest and fabric shading.
    shape(c,[[-18,-124],[9,-127],[26,-117],[22,-92],[14,-69],[-13,-69],[-24,-97]],p.top);
    shape(c,[[-22,-109],[-9,-105],[-5,-73],[-14,-70]],p.topShade,null);
    line(c,[[-11,-119],[0,-114],[13,-117]],'#fff5',2);
    if (id === 'axel') {
      shape(c,[[-18,-125],[-9,-113],[2,-111],[12,-126],[5,-130],[-9,-131]],p.skin);
      line(c,[[-6,-99],[12,-101]],'#9dabb9',1.5);
      line(c,[[-9,-83],[10,-84]],'#bbc3c3',1.5);
    }
    if (id === 'leonardo') {
      oval(c,1,-100,19,27,p.top,'#786747');
      line(c,[[-15,-101],[17,-101]],'#887347',2); line(c,[[-13,-88],[13,-88]],'#887347',2); line(c,[[0,-125],[0,-76]],'#887347',2);
    }
    if (id === 'cyclops') {
      shape(c,[[-19,-121],[-10,-125],[19,-89],[14,-81]],p.trim);
      shape(c,[[-21,-97],[22,-97],[20,-89],[-19,-89]],p.trim);
      oval(c,2,-94,6,6,'#273954'); line(c,[[-2,-98],[6,-90]],'#ef4b4a',2); line(c,[[6,-98],[-2,-90]],'#ef4b4a',2);
    }
    if (id === 'spiderman') {
      shape(c,[[-19,-119],[-11,-102],[-9,-75],[-17,-72],[-24,-98]],p.pants);
      shape(c,[[18,-119],[14,-103],[11,-73],[19,-76],[23,-94]],p.pants);
      for (let j = 0; j < 3; j++) line(c,[[-10,-116+j*13],[0,-110+j*13],[13,-114+j*13]],'#481e34',1);
      line(c,[[0,-122],[0,-76]],'#481e34',1); oval(c,2,-102,3,6,'#171b30',null);
      for (const d of [-1,1]) for (let j = 0; j < 3; j++) line(c,[[2,-103+j*3],[2+d*8,-107+j*6],[2+d*10,-104+j*6]],'#171b30',1.4);
    }
    if(id==='roman') { line(c,[[-9,-122],[-8,-81]],'#717a81',2); line(c,[[5,-120],[8,-83]],'#717a81',2); shape(c,[[-1,-114],[5,-106],[0,-101],[-5,-107]],'#b6b8b5'); }
    if(id==='seth') { line(c,[[-7,-110],[5,-106],[15,-110]],'#9f7355',2); line(c,[[1,-103],[1,-89]],'#9f7355',1); }
    if(id==='streetfighter') { shape(c,[[-13,-124],[-5,-110],[-3,-79],[-14,-73]],'#d0ab86'); line(c,[[6,-111],[9,-82]],'#ffc98d',2); }
    if(id==='shredder') {
      shape(c,[[-26,-127],[-11,-133],[-6,-116],[-24,-112]],'#b6bdce');
      shape(c,[[13,-131],[29,-127],[31,-114],[14,-115]],'#c1c7d4');
      for(const x of [-24,-15,17,25]) shape(c,[[x,-126],[x-3,-145],[x+6,-129]],'#d5dfec');
      line(c,[[-6,-113],[9,-113]],'#c5bbd4',2);
    }
    if(id==='venom') {
      oval(c,-13,-110,16,15,'#34475b'); oval(c,15,-112,17,15,'#34475b');
      shape(c,[[-2,-118],[9,-118],[13,-105],[5,-91],[-4,-96],[-9,-108]],'#d9e4e8');
      for(const d of [-1,1]) for(let j=0;j<3;j++) line(c,[[3,-110+j*5],[d*20,-118+j*12],[d*24,-107+j*12]],'#d9e4e8',3);
    }
    shape(c,[[-15,-74],[16,-74],[15,-67],[-13,-67]],id === 'leonardo' ? '#6e4938' : p.trim);
    oval(c,2,-70,4,4,id === 'leonardo' ? '#e6cc80' : '#f6df95');
    limb(c,hipFront,frontKnee,frontFoot,23,p.pants,p.pantsShade);
    if (id === 'leonardo') { oval(c,...frontKnee,10,7,'#957450'); oval(c,...backKnee,9,6,'#957450'); }
    if (id === 'cyclops' || id === 'spiderman') segment(c,[(frontKnee[0]+frontFoot[0])/2,(frontKnee[1]+frontFoot[1])/2],frontFoot,19,p.boot,p.shade);
    boot(c,frontFoot,p.boot,state === 'kick' ? -.2 : 0);
    // Neck and face, three-quarter side view.
    shape(c,[[-7,-123],[-6,-140],[10,-139],[13,-121]],p.skin);
    oval(c,1,-147,id === 'leonardo' ? 19 : 15,id === 'leonardo' ? 17 : 20,p.skin);
    if (['axel','cyclops','streetfighter','roman','seth'].includes(id)) {
      shape(c,[[11,-153],[20,-144],[12,-140],[12,-133],[5,-129],[-4,-133],[-7,-146]],p.skin);
      shape(c,[[-13,-146],[-17,-159],[-9,-170],[2,-172],[13,-164],[15,-157],[1,-161],[-5,-153]],id === 'axel' ? '#f9d77b' : id==='cyclops'?'#583b3a':'#192333');
      line(c,[[9,-134],[14,-135]],'#763f3e',1.5);
    }
    if (id === 'axel') {
      shape(c,[[-14,-157],[14,-158],[16,-153],[-13,-152]],p.trim);
      shape(c,[[-13,-154],[-33,-149],[-24,-143],[-11,-151]],'#bf3444');
      line(c,[[8,-147],[13,-147]],'#17253a',2); line(c,[[-8,-163],[0,-167],[6,-164]],'#fff1b8',2);
    } else if (id === 'leonardo') {
      shape(c,[[-18,-153],[19,-155],[20,-146],[-17,-144]],p.trim);
      shape(c,[[-18,-151],[-42,-155],[-31,-145],[-17,-147]],'#3a75b9');
      shape(c,[[5,-152],[15,-152],[12,-148],[6,-148]],'#f4f4df');
      line(c,[[9,-136],[18,-137]],'#273c32',2);
    } else if (id === 'spiderman') {
      for (let j = 0; j < 3; j++) line(c,[[-10,-159+j*10],[2,-156+j*10],[13,-159+j*10]],'#762239',1);
      line(c,[[1,-166],[1,-128]],'#762239',1);
      shape(c,[[4,-154],[14,-158],[12,-146],[6,-143]],'#f2f3e8');
      shape(c,[[-8,-155],[-2,-152],[-3,-144],[-9,-149]],'#e9f1e8');
    } else if (id === 'cyclops') {
      shape(c,[[-13,-156],[17,-155],[18,-146],[-13,-147]],p.trim);
      line(c,[[-8,-151],[14,-151]],'#ef354b',4); line(c,[[0,-152],[14,-152]],'#ffd1bd',1);
    } else if(['roman','seth','streetfighter'].includes(id)) {
      line(c,[[8,-148],[14,-148]],'#18212f',2);
      if(id!=='streetfighter') shape(c,[[-7,-143],[0,-137],[13,-138],[10,-129],[1,-126],[-6,-132]],'#283039');
      if(id==='seth') line(c,[[-10,-161],[1,-168],[10,-161]],'#b0a176',3);
    } else if(id==='shredder') {
      shape(c,[[-16,-144],[-20,-161],[-10,-177],[6,-181],[20,-166],[19,-145],[10,-131],[-5,-133]],'#79859b');
      shape(c,[[-8,-143],[18,-148],[15,-132],[-4,-130]],'#c1c9d4');
      shape(c,[[-12,-162],[4,-174],[18,-162],[15,-153],[-9,-150]],'#263445');
      line(c,[[1,-154],[14,-156]],'#f17b8c',2);
      shape(c,[[-17,-159],[-30,-178],[-20,-153]],'#d3d9e4'); shape(c,[[17,-160],[28,-177],[22,-149]],'#d3d9e4');
    } else if(id==='venom') {
      oval(c,2,-146,19,22,'#25364a');
      shape(c,[[-15,-158],[-1,-149],[-6,-139],[-15,-145]],'#f1f5e8');
      shape(c,[[4,-149],[19,-159],[15,-142],[7,-136]],'#f1f5e8');
      shape(c,[[-11,-136],[0,-132],[16,-138],[15,-126],[2,-123],[-9,-127]],'#090f1b');
      for(let j=0;j<6;j++) shape(c,[[-8+j*4,-133],[-5+j*4,-131],[-6+j*4,-127]],'#eeeccf',null);
      line(c,[[12,-129],[25,-131],[30,-124],[21,-120]],'#db687e',4);
    }
    let elbow = [31,-95-stride*6], hand = [39,-118-stride*4];
    if (attack) { elbow = [34+extension*18,-112]; hand = [39+extension*(strong ? 57 : 49),-117]; }
    if (strong && id === 'spiderman') { elbow = [36,-128]; hand = [50+extension*43,-140]; }
    if (special && id === 'axel') { elbow = [25,-126]; hand = [22+extension*12,-144-extension*44]; }
    if (special && id === 'cyclops') { elbow = [31,-128]; hand = [13,-149]; }
    if (special && id === 'spiderman') { elbow = [49,-105]; hand = [77,-112]; }
    if(strong && id==='roman') { elbow=[33,-124]; hand=[38+extension*58,-131]; }
    if(special && id==='venom') { elbow=[43,-109]; hand=[76,-115]; }
    if (jumping && !actor.actionTime) { elbow = [34,-122]; hand = [25,-141]; }
    if (state === 'hurt') { elbow = [30,-86]; hand = [23,-76]; }
    limb(c,[20,-117],elbow,hand,id==='venom'?26:18,id === 'cyclops' ? p.top : p.skin,id === 'cyclops' ? p.topShade : p.shade);
    if (id === 'axel') { oval(c,...hand,9,8,p.trim); line(c,[[hand[0]-3,hand[1]-4],[hand[0]+5,hand[1]-4]],'#ff9581',2); }
    else oval(c,...hand,7,7,id === 'cyclops' ? p.trim : p.skin);
    if(id==='roman') {
      for(let j=0;j<4;j++) line(c,[[20+j*2,-116+j*4],[26+j*2,-111+j*4],[24+j*2,-105+j*4]],'#403b3b',1.5);
      oval(c,...hand,9,8,'#b43e4c');
    }
    if(id==='seth') { line(c,[[hand[0]-6,hand[1]+3],[hand[0]+6,hand[1]+3]],'#2b2a36',4); }
    if(id==='shredder') {
      segment(c,elbow,hand,19,'#a2acbd','#68788d');
      for(let j=0;j<3;j++) shape(c,[[hand[0]-3-j*5,hand[1]-7],[hand[0]+17-j*5,hand[1]-29],[hand[0]+3-j*5,hand[1]-6]],'#dbe4ed');
    }
    if(id==='venom') { oval(c,...hand,13,10,'#24374b'); for(let j=0;j<3;j++) line(c,[[hand[0]+4,hand[1]-4+j*5],[hand[0]+17,hand[1]-1+j*5]],'#e1e6db',2); }
    if (id === 'leonardo') { sword(c,hand,attack ? 1.3*extension : .35); line(c,[[elbow[0]-8,elbow[1]],[elbow[0]+7,elbow[1]]],'#927b55',5); }
    if (attack || state === 'kick') {
      c.globalAlpha = extension*.7;
      const tip = state === 'kick' ? frontFoot : hand;
      line(c,[[tip[0]-22,tip[1]-10],[tip[0]+8,tip[1]-8]],'#fff1b1',3);
      line(c,[[tip[0]-27,tip[1]+5],[tip[0]+3,tip[1]+7]],'#ffd77b',2);
      shape(c,[[tip[0]+12,tip[1]-13],[tip[0]+16,tip[1]-3],[tip[0]+26,tip[1]],[tip[0]+16,tip[1]+4],[tip[0]+11,tip[1]+13],[tip[0]+8,tip[1]+3],[tip[0],tip[1]],[tip[0]+9,tip[1]-4]],'#fff3b4',null); c.globalAlpha = 1;
    }
    if (strong) {
      c.save(); c.globalAlpha = extension*.65;
      if(id === 'leonardo') { sword(c,[hand[0]-15,hand[1]+20],1.8); c.beginPath(); c.arc(38,-103,66,-1.1,1.1); c.strokeStyle='#c7f4ff'; c.lineWidth=5; c.stroke(); }
      else if(id === 'spiderman') { line(c,[[hand[0],hand[1]],[hand[0]+80,hand[1]-20]],'#c4f6ff',3); line(c,[[hand[0],hand[1]],[hand[0]+80,hand[1]]],'#c4f6ff',2); }
      else if(id === 'cyclops') { for(let i=0;i<3;i++) { c.beginPath(); c.arc(...hand,13+i*6,0,Math.PI*2); c.strokeStyle=i?'#ee6687':'#fff6ad'; c.lineWidth=3-i*.5; c.stroke(); } }
      else { line(c,[[40,-97],[92,-97]],'#ffe7a0',6); line(c,[[48,-137],[103,-137]],'#fff5cf',4); oval(c,91,-97,8,6,'#ef7b62',null); }
      c.restore();
    }
    if (special) this.special(c,id,actor.time,extension);
    c.restore();
  }

  special(c,id,time,extension) {
    c.save(); c.globalAlpha = Math.max(.2,extension);
    if (id === 'axel') {
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(17,-133,39+i*8,65+i*5,-.35,Math.PI*.75,Math.PI*1.8); c.strokeStyle = ['#fff7b4','#ffbb56','#ed674a'][i]; c.lineWidth = 7-i*2; c.stroke(); }
    } else if (id === 'leonardo') {
      for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0,-92,87,28+i*10,-.25,time*14+i*2,time*14+i*2+3); c.strokeStyle = i ? '#bdeeff' : '#fff'; c.lineWidth = 5-i; c.stroke(); }
    } else if (id === 'spiderman') {
      for (let i = -2; i <= 2; i++) line(c,[[76,-112],[160,-115+i*18],[215,-115+i*24]],'#d7f5ff',2);
      for (let j = 0; j < 3; j++) { const x = 135+j*27; line(c,[[x,-150-j*5],[x-5,-115],[x,-80+j*5]],'#d7f5ff',1.5); }
    } else if(id==='cyclops') {
      shape(c,[[17,-155],[239,-166],[239,-134],[17,-148]],'#d93464',null);
      shape(c,[[17,-153],[239,-155],[239,-145],[17,-149]],'#ff9c8c',null);
      line(c,[[18,-151],[238,-150]],'#fff3d3',3);
    } else if(id==='seth') {
      line(c,[[25,-30],[41,-12],[59,-28]],'#efce77',5);
      for(let i=0;i<5;i++) line(c,[[40,1],[12+i*15,-11-Math.abs(i-2)*3]],'#ffe5a2',2);
    } else if(id==='shredder') {
      for(let i=0;i<3;i++) line(c,[[-30,-92+i*12],[27,-112+i*12],[115,-110+i*12]],'#d6dfff',3-i*.6);
    } else if(id==='venom') {
      for(let i=0;i<3;i++) {
        c.beginPath(); c.moveTo(60,-115); c.bezierCurveTo(95,-150+i*30,155,-75-i*20,238,-123+i*20);
        c.strokeStyle='#101c30'; c.lineWidth=10-i*2; c.stroke(); c.strokeStyle='#9caec5'; c.lineWidth=2; c.stroke();
      }
    } c.restore();
  }

  kingpinPose(actor, state, stage, k) {
    const time = actor.time || 0, breath = Math.sin(time*2.4);
    const base = { lean:-.05, bodyY:breath*1.2, head:0, backKnee:[-25,-34], backFoot:[-28,-3], frontKnee:[25,-33], frontFoot:[30,-3],
      backElbow:[-46,-98], backHand:[-40,-73], frontElbow:[48,-101], frontHand:[50,-81] };
    if (state === 'walk') {
      const s = Math.sin(time*7.5), lift = v => -3-Math.max(0,v)*7;
      return { ...base, lean:.02, bodyY:Math.abs(Math.cos(time*7.5))*2.4, backFoot:[-28-s*17,lift(s)], frontFoot:[30+s*17,lift(-s)], backKnee:[-25-s*9,-35], frontKnee:[25+s*9,-35],
        backElbow:[-46+s*6,-98], backHand:[-40+s*12,-73], frontElbow:[48-s*6,-101], frontHand:[50-s*12,-81] };
    }
    if (state === 'intro') {
      const progress = actor.actionDuration ? 1-actor.actionTime/actor.actionDuration : .8;
      return progress < .5 ? { ...base, lean:-.1, bodyY: -2, frontElbow:[40,-108], frontHand:[28,-126], backElbow:[-25,-100], backHand:[12,-112] }
        : { ...base, lean:-.1, bodyY: -4, frontElbow:[42,-100], frontHand:[36,-97+Math.sin(time*16)*2], backElbow:[-10,-96], backHand:[25,-99] };
    }
    if (state === 'hurt') return { ...base, lean:-.2, head:-.18, frontElbow:[36,-140], frontHand:[52,-156], backElbow:[-42,-110], backHand:[-52,-90] };
    if (state === 'backstep') return { ...base, lean:-.12, bodyY:3, frontElbow:[38,-118], frontHand:[32,-138], backElbow:[10,-108], backHand:[26,-120], backKnee:[-28,-32], backFoot:[-36,-3], frontKnee:[18,-36], frontFoot:[20,-7] };
    if (state === 'defeated') return { ...base, bodyY:0, head:-.25, frontElbow:[44,-104], frontHand:[56,-82], backElbow:[-44,-112], backHand:[-60,-122] };
    const keys = kingpinKeys[state]; if (!keys) return base;
    const ready = blendPose(base,keys.ready,1), strike = blendPose(ready,keys.strike,1);
    let pose = stage === 'windup' ? blendPose(base,keys.ready,smooth(k)) : stage === 'active' ? blendPose(ready,keys.strike,smooth(Math.min(1,k*3)))
      : blendPose(strike,base,smooth(state === 'slam' ? (k-.35)/.65 : k));
    if (state === 'charge' && stage === 'active') {
      const s = Math.sin(time*24);
      pose = { ...pose, backFoot:[-30-s*22,-3-Math.max(0,s)*10], frontFoot:[30+s*22,-3-Math.max(0,-s)*10], backKnee:[-26-s*12,-34], frontKnee:[30+s*12,-36] };
    }
    if (state === 'charge' && stage === 'windup') pose.backFoot = [pose.backFoot[0]+Math.sin(time*26)*4, pose.backFoot[1]-Math.max(0,Math.sin(time*26))*6];
    return pose;
  }

  kingpin(c, actor, x, y, scale = 1) {
    const k = kingpinPalette, time = actor.time || 0, enraged = Boolean(actor.enraged);
    const state = actor.state === 'strongAttack' ? 'strong' : actor.state, { stage, k: progress } = attackStage(actor);
    const P = this.kingpinPose(actor,state,stage,progress), skin = enraged ? k.rage : k.skin, shade = enraged ? k.rageShade : k.skinShade;
    const open = state === 'hurt' || (state === 'roar' && stage !== 'windup') || (['shove','slam'].includes(state) && stage === 'active');
    c.save(); c.translate(x,y); c.scale((actor.facing || 1)*scale,scale);
    if (enraged && state !== 'defeated') {
      const glow = c.createRadialGradient(4,-110,12,4,-110,125), pulse = .5+.5*Math.sin(time*9);
      glow.addColorStop(0,`rgba(255,70,62,${.24+.14*pulse})`); glow.addColorStop(1,'rgba(255,70,62,0)'); c.fillStyle = glow; c.fillRect(-130,-240,268,250);
    }
    this.kingpinGround(c,actor,state,stage,time);
    if (state === 'defeated') { const f = actor.actionDuration && actor.actionTime > 0 ? 1-actor.actionTime/actor.actionDuration : 1, fall = f*f; c.translate(88*fall,-20*fall); c.rotate(-1.42*fall); }
    if (state === 'hurt') c.translate(-6,1);
    if (state === 'roar' && stage !== 'windup') c.translate(Math.sin(time*70)*1.6,0);
    const hipY = -64+P.bodyY;
    limb(c,[-15,hipY],P.backKnee,P.backFoot,36,k.pantsShade,k.pantsDeep); this.kingpinShoe(c,P.backFoot);
    limb(c,[14,hipY],P.frontKnee,P.frontFoot,38,k.pants,k.pantsShade); this.kingpinShoe(c,P.frontFoot);
    line(c,[mix([14,hipY],P.frontKnee,.3),mix(P.frontKnee,P.frontFoot,.75)],k.pantsShade,1.5);
    c.save(); c.translate(0,hipY); c.rotate(P.lean); c.translate(0,64);
    this.kingpinArm(c,[-27,-124],P.backElbow,P.backHand,k.suitShade,k.suitDeep,shade,false);
    this.kingpinTorso(c);
    this.kingpinHead(c,P,skin,shade,enraged,open,time);
    this.kingpinArm(c,[26,-126],P.frontElbow,P.frontHand,k.suit,k.suitShade,skin,true);
    this.kingpinEffects(c,actor,state,stage,P,time);
    c.restore(); c.restore();
  }
  kingpinShoe(c, foot) {
    c.save(); c.translate(...foot);
    shape(c,[[-13,-11],[8,-12],[15,-6],[27,-2],[26,5],[-14,5],[-16,-2]],kingpinPalette.shoe);
    line(c,[[-12,3],[25,3]],'#000000',2);
    line(c,[[2,-9],[14,-6]],'#ffffff99',3); // Polished shine
    c.restore();
  }
  kingpinArm(c, shoulder, elbow, hand, cloth, clothShade, fist, front) {
    const k = kingpinPalette;
    limb(c,shoulder,elbow,hand,front ? 42 : 38,cloth,clothShade);
    const angle = Math.atan2(hand[1]-elbow[1],hand[0]-elbow[0]), ux = Math.cos(angle), uy = Math.sin(angle);
    const cuff = [hand[0]-ux*15,hand[1]-uy*15];
    segment(c,cuff,[hand[0]-ux*8,hand[1]-uy*8],28,k.shirt,k.shirtShade); oval(c,...cuff,3.0,3.0,k.gold,null);
    oval(c,...hand,17,15,fist); line(c,[[hand[0]-6,hand[1]-7],[hand[0]+8,hand[1]-6]],'#0000002e',3);
    if (front) line(c,[[hand[0]+2,hand[1]-8],[hand[0]+5,hand[1]+1]],k.gold,3.5);
  }
  kingpinTorso(c) {
    const k = kingpinPalette;
    shape(c,[[-14,-139],[-6,-147],[8,-144],[10,-136]],k.suitShade);
    // Massive, broad-shouldered suit jacket, V-shaped structure.
    c.beginPath(); c.moveTo(-25,-148); c.lineTo(35,-152); // Shoulders
    c.lineTo(60,-110); // Wide upper chest
    c.quadraticCurveTo(45,-75, 35,-60); // Taper to waist
    c.lineTo(-30,-58); // Bottom hem
    c.quadraticCurveTo(-55,-80, -60,-110); // Back taper
    c.lineTo(-25,-148); c.closePath();
    c.fillStyle = k.suit; c.fill(); c.strokeStyle = '#111b30'; c.lineWidth = 3; c.stroke();

    // Suit shading for V-shape depth
    c.beginPath(); c.moveTo(-60,-110); c.quadraticCurveTo(-45,-100, -35,-60);
    c.lineTo(-30,-58); c.quadraticCurveTo(-55,-80, -60,-110); c.fillStyle = k.suitShade; c.fill();

    // Jacket crease lines to emphasize structure
    c.beginPath(); c.moveTo(50,-110); c.quadraticCurveTo(45,-85, 30,-62); c.strokeStyle = k.suitShade; c.lineWidth = 5; c.lineCap = 'round'; c.stroke();

    // Large contrasting shirt and tie
    shape(c,[[10,-149],[28,-149],[38,-112],[32,-90],[20,-100]],k.shirt,null);
    shape(c,[[18,-146],[27,-146],[32,-108],[27,-96],[22,-108]],k.tie,null);
    line(c,[[18,-145],[27,-145]],k.shirtShade,3); oval(c,27,-122,3,3,k.gem,null);

    // Wide structured lapels
    shape(c,[[10,-150],[16,-135],[10,-130],[32,-90],[24,-92],[5,-130]],k.suitShade,null); // Left lapel
    line(c,[[28,-150],[42,-115],[32,-90]],k.suitDeep,3); // Right lapel

    oval(c,35,-80,3.5,3.5,k.suitShade,null); oval(c,38,-65,3.5,3.5,k.suitShade,null); // Buttons

    // Collar edge
    shape(c,[[-10,-119],[4,-121],[2,-111],[-9,-111]],k.shirt,null);
    line(c,[[-11,-111],[5,-112]],k.suitDeep,2);

    line(c,[[-28,-60],[35,-62]],k.suitDeep,2.5); // Bottom hem crease
    line(c,[[-24,-135],[-2,-129],[16,-132]],'#ffffffaa',3); // Shoulder highlight
  }
  kingpinHead(c, P, skin, shade, enraged, open, time) {
    c.save(); c.translate(6,-144); c.rotate(P.head || 0); c.translate(-6,144);

    // Massive neck
    shape(c,[[-18,-133],[-16,-156],[22,-158],[25,-136]],skin);

    // Comparatively smaller, imposing bald head
    oval(c,4,-166,16,18,skin);

    // Extremely strong, square jaw
    shape(c,[[-6,-156],[24,-160],[28,-148],[18,-142],[-2,-144],[-10,-152]],skin,null);
    line(c,[[24,-160],[28,-148],[18,-142],[-2,-144]],'#182039',2.5);

    // Bald highlight
    c.beginPath(); c.ellipse(0,-178,8,3.5,-.5,0,Math.PI*2); c.fillStyle = '#ffffff60'; c.fill();
    oval(c,-8,-162,3.5,5.5,shade); // Ear

    // Deep, pronounced eyebrows for a stern expression
    line(c,enraged ? [[5,-175],[24,-166]] : [[5,-170],[24,-168]],'#110808',5);
    oval(c,16,-164,2.5,2.0,'#000000',null); // Eye

    // Pronounced nose
    shape(c,[[20,-168],[28,-160],[22,-157]],skin,'#7b4a38',2);

    // Mouth
    if (open) { shape(c,[[10,-155],[22,-157],[21,-145],[11,-146]],'#3a1420'); line(c,[[11,-154],[21,-155]],'#f6eedb',2.5); }
    else if (enraged) { shape(c,[[10,-155],[22,-156],[21,-149],[11,-149]],'#f2ead8','#5a2a2a',1.5); line(c,[[14,-155],[14,-151]],'#8a6a5a',1.5); }
    else line(c,[[11,-153],[22,-154]],'#3a1a10',3);

    if (enraged) {
      line(c,[[-10,-180],[-4,-176],[-8,-171]],'#c22f35',2.5); line(c,[[6,-184],[9,-179],[6,-174]],'#c22f35',2.2);
      for (let i = 0; i < 3; i++) { const t = (time*.9+i/3)%1; c.globalAlpha = (1-t)*.6; oval(c,-6+i*9+Math.sin(t*6+i)*3,-188-t*30,5+t*8,4+t*6,'#fff',null); }
      c.globalAlpha = 1;
    }
    c.restore();
  }
  kingpinEffects(c, actor, state, stage, P, time) {
    const hand = P.frontHand;
    if ((state === 'punch' || state === 'strong') && stage === 'active') {
      c.save(); c.globalAlpha = .9;
      line(c,[[hand[0]-45,hand[1]-10],[hand[0]-8,hand[1]-9]],'#fff1b1',5); line(c,[[hand[0]-50,hand[1]+8],[hand[0]-14,hand[1]+9]],'#ffd77b',4);
      if (state === 'strong') { c.beginPath(); c.arc(34,-118,65,-1.8,-.2); c.strokeStyle = '#fff1c7'; c.lineWidth = 8; c.stroke(); }
      burst(c,[hand[0]+22,hand[1]],2.0); c.restore();
    }
    if (state === 'shove' && stage === 'active') {
      c.save(); c.globalAlpha = .9; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(75,-104,30+i*18,-1.2,1.2); c.strokeStyle = i%2 ? '#ffb38a' : '#fff4d4'; c.lineWidth = 6-i; c.stroke(); } c.restore();
    }
    if (state === 'roar' && stage !== 'windup') {
      c.save(); c.globalAlpha = .9;
      for (let i = 0; i < 12; i++) { const a = -Math.PI*.95+i*Math.PI*.95/11, r = 35+Math.sin(time*40+i)*5; line(c,[[8+Math.cos(a)*r,-160+Math.sin(a)*r],[8+Math.cos(a)*(r+28),-160+Math.sin(a)*(r+28)]],i%2 ? '#ff6a5c' : '#ffe0a8',5); }
      c.restore();
    }
    if (state === 'charge' && stage === 'windup') { c.save(); c.globalAlpha = .7; for (let i = 0; i < 3; i++) oval(c,35+i*8,-150-i*8+Math.sin(time*25)*2,4+i*3,3+i*1.5,'#ffffff',null); c.restore(); }
    if ((state === 'charge' && stage === 'recover') || (actor.enraged && state === 'idle')) for (let i = 0; i < 3; i++) { const t = (time*1.6+i*.4)%1; c.save(); c.globalAlpha = 1-t; shape(c,[[22+i*9,-172+t*20],[26+i*9,-164+t*20],[22+i*9,-160+t*20],[18+i*9,-164+t*20]],'#bfe6ff',null); c.restore(); }
    if (actor.hitFlash > 0) { c.save(); c.globalAlpha = Math.min(1,actor.hitFlash/.14); burst(c,[18,-108],2.2,'#ffffff'); burst(c,[18,-108],1.4,'#ffd27b'); c.restore(); }
  }
  // Ground-space effects stay level while the body leans or falls.
  kingpinGround(c, actor, state, stage, time) {
    c.save();
    if (state === 'charge' && stage === 'windup') { c.globalAlpha = .75; for (let i = 0; i < 4; i++) oval(c,-50-i*14+Math.sin(time*25+i)*4,-5-i*5,8+i*4,5+i*2,'#c8c1cf',null); }
    if (state === 'backstep') { c.globalAlpha = .6; for (let i = 0; i < 4; i++) oval(c,30+i*14,-4-i*4,9+i*3,4+i*1.5,'#c8c1cf',null); }
    if (state === 'charge' && stage === 'active') { c.globalAlpha = .8; for (let i = 0; i < 7; i++) line(c,[[-55-i*6,-30-i*35],[-105-i*12,-30-i*35]],'#f3efe4',4-i*.4); }
    if (state === 'slam' && (stage === 'active' || (stage === 'recover' && attackStage(actor).k < .65))) {
      c.globalAlpha = 1.0;
      for (let i = 0; i < 8; i++) { const a = Math.PI*(.05+i*.13); line(c,[[76,-2],[76+Math.cos(a)*34,-2+Math.sin(a)*7],[76+Math.cos(a)*64,-1+Math.sin(a)*12]],'#11182a',4); }
      for (let i = 0; i < 7; i++) { const t = attackStage(actor).k; shape(c,[[60+i*10,-12-i*9-t*20],[68+i*10,-14-i*9-t*20],[66+i*10,-8-i*9-t*20]],'#a5a1bd',null); }
    }
    if (state === 'defeated' && actor.actionTime <= .15) { c.globalAlpha = Math.max(0,.8-(actor.deathTime || 0)*.12); for (let i = 0; i < 8; i++) oval(c,-130+i*35,-6-(i%2)*6,20+(i%3)*8,9+(i%2)*4,'#bdb7c6',null); }
    c.restore();
  }


  drawTyson(c, actor, x, y, scale = 1) {
    const time = actor.time || 0, enraged = Boolean(actor.enraged), state = actor.state === 'strongAttack' ? 'strong' : actor.state;
    const { stage, k } = attackStage(actor);

    // Boxing stance poses
    let lean = 0, head = 0, bodyY = 0;
    let frontFoot = [20,0], frontKnee = [30,-25], backFoot = [-20,-5], backKnee = [-15,-25];
    let frontElbow = [20,-60], frontHand = [30,-75], backElbow = [-10,-60], backHand = [0,-80];

    if (state === 'idle' || state === 'walk') {
      const bob = Math.sin(time * (state === 'walk' ? 12 : 6));
      lean = bob * 0.05 + 0.1;
      bodyY = bob * 3;
      frontHand = [20 + bob * 2, -75 - bob * 2]; // Guard up
      backHand = [-5 - bob * 2, -85 - bob * 2];
      if (state === 'walk') {
        const stride = Math.sin(time * 12);
        frontFoot[0] += stride * 15; frontKnee[0] += stride * 8;
        backFoot[0] -= stride * 15; backKnee[0] -= stride * 8;
      }
    } else if (state === 'punch' || state === 'strong' || state === 'charge' || state === 'shove') { // jab, hook/uppercut, rush, weave
      if (stage === 'windup') {
        lean = -0.2; bodyY = 5; backHand = [-25, -90]; frontHand = [15, -70];
      } else if (stage === 'active') {
        lean = 0.3; bodyY = -2; frontHand = [50, -85]; backHand = [-10, -75];
      } else {
        lean = 0.1; frontHand = [35, -80];
      }
    } else if (state === 'hurt') {
      lean = -0.3; head = -0.4; bodyY = 0; frontHand = [10, -50]; backHand = [-15, -60];
    } else if (state === 'defeated') {
      lean = -1.5; head = -0.5; bodyY = 40; frontFoot = [30, -10]; backFoot = [10, -5];
    }

    c.save(); c.translate(x, y); c.scale((actor.facing || 1) * scale, scale);
    if (state === 'defeated') {
      const fall = actor.actionDuration && actor.actionTime > 0 ? 1 - actor.actionTime / actor.actionDuration : 1;
      c.translate(50 * fall * fall, -10 * fall); c.rotate(-1.5 * fall * fall);
    }

    const hipY = -45 + bodyY;
    const skin = '#6e4632', skinShade = '#4a2c1e', trunks = '#1a1a1a', trunksHighlight = '#333333', glove = enraged ? '#ff3333' : '#cc2222';

    // Back Leg
    limb(c, [-10, hipY], backKnee, backFoot, 24, skin, skinShade);
    this.tysonShoe(c, backFoot);

    // Front Leg
    limb(c, [10, hipY], frontKnee, frontFoot, 26, skin, skinShade);
    this.tysonShoe(c, frontFoot);

    // Trunks
    shape(c, [[-16, hipY-10], [18, hipY-10], [22, hipY+15], [8, hipY+20], [-5, hipY+12], [-18, hipY+15]], trunks, trunksHighlight);
    line(c, [[-16, hipY-10], [18, hipY-10]], '#ffffff', 6); // Waistband

    c.save(); c.translate(0, hipY); c.rotate(lean); c.translate(0, 45);

    // Back Arm
    limb(c, [-20, -95], backElbow, backHand, 26, skin, skinShade);
    this.tysonGlove(c, backHand, glove);

    // Muscular Torso (compact, thick neck)
    shape(c, [[-22, -100], [24, -100], [18, -60], [-15, -60]], skin, skinShade);
    line(c, [[-15, -95], [15, -95]], skinShade, 4); // Pecs
    line(c, [[0, -90], [0, -60]], skinShade, 3); // Abs line

    // Head (compact, face tattoo)
    c.save(); c.translate(2, -105); c.rotate(head);
    oval(c, 0, -10, 14, 16, skin);
    line(c, [[4, -14], [10, -8], [6, -4]], '#2a1a14', 2.5); // Signature face tattoo
    line(c, [[8, -12], [12, -12]], '#000000', 3); // Eye
    if (state === 'hurt' || state === 'defeated') {
      line(c, [[8, -2], [12, -4]], '#000000', 2); // Mouth gasp
    } else {
      line(c, [[8, -4], [12, -4]], '#000000', 2); // Mouth tight
    }
    c.restore();

    // Front Arm
    limb(c, [22, -95], frontElbow, frontHand, 28, skin, skinShade);
    this.tysonGlove(c, frontHand, glove);

    c.restore();

    // Effects
    if (enraged && state !== 'defeated') {
      c.save(); c.globalCompositeOperation = 'overlay';
      c.beginPath(); c.ellipse(0, -60, 40, 60, 0, 0, Math.PI * 2);
      c.fillStyle = '#ff000033'; c.fill();
      c.restore();
    }
    if (actor.hitFlash > 0) {
      c.save(); c.globalAlpha = Math.min(1, actor.hitFlash / .14);
      burst(c, [10, -70], 1.5, '#ffffff');
      c.restore();
    }

    c.restore();
  }

  tysonShoe(c, pos) {
    c.save(); c.translate(pos[0], pos[1]);
    shape(c, [[-10, -5], [5, -5], [12, 4], [-12, 4]], '#111', '#222');
    line(c, [[-8, 2], [10, 2]], '#fff', 1.5);
    c.restore();
  }

  tysonGlove(c, pos, color) {
    c.save(); c.translate(pos[0], pos[1]);
    oval(c, 0, 0, 18, 16, color);
    shape(c, [[-10, -5], [-10, 5], [-16, 6], [-16, -6]], '#fff'); // White wrist tape
    c.restore();
  }


  drawTyson(c, actor, x, y, scale = 1) {
    const time = actor.time || 0, enraged = Boolean(actor.enraged), state = actor.state === 'strongAttack' ? 'strong' : actor.state;
    const { stage, k } = attackStage(actor);

    // Boxing stance poses
    let lean = 0, head = 0, bodyY = 0;
    let frontFoot = [20,0], frontKnee = [30,-25], backFoot = [-20,-5], backKnee = [-15,-25];
    let frontElbow = [20,-60], frontHand = [30,-75], backElbow = [-10,-60], backHand = [0,-80];

    if (state === 'idle' || state === 'walk') {
      const bob = Math.sin(time * (state === 'walk' ? 12 : 6));
      lean = bob * 0.05 + 0.1;
      bodyY = bob * 3;
      frontHand = [20 + bob * 2, -75 - bob * 2]; // Guard up
      backHand = [-5 - bob * 2, -85 - bob * 2];
      if (state === 'walk') {
        const stride = Math.sin(time * 12);
        frontFoot[0] += stride * 15; frontKnee[0] += stride * 8;
        backFoot[0] -= stride * 15; backKnee[0] -= stride * 8;
      }
    } else if (state === 'punch' || state === 'strong' || state === 'charge' || state === 'shove') { // jab, hook/uppercut, rush, weave
      if (stage === 'windup') {
        lean = -0.2; bodyY = 5; backHand = [-25, -90]; frontHand = [15, -70];
      } else if (stage === 'active') {
        lean = 0.3; bodyY = -2; frontHand = [50, -85]; backHand = [-10, -75];
      } else {
        lean = 0.1; frontHand = [35, -80];
      }
    } else if (state === 'hurt') {
      lean = -0.3; head = -0.4; bodyY = 0; frontHand = [10, -50]; backHand = [-15, -60];
    } else if (state === 'defeated') {
      lean = -1.5; head = -0.5; bodyY = 40; frontFoot = [30, -10]; backFoot = [10, -5];
    }

    c.save(); c.translate(x, y); c.scale((actor.facing || 1) * scale, scale);
    if (state === 'defeated') {
      const fall = actor.actionDuration && actor.actionTime > 0 ? 1 - actor.actionTime / actor.actionDuration : 1;
      c.translate(50 * fall * fall, -10 * fall); c.rotate(-1.5 * fall * fall);
    }

    const hipY = -45 + bodyY;
    const skin = '#6e4632', skinShade = '#4a2c1e', trunks = '#1a1a1a', trunksHighlight = '#333333', glove = enraged ? '#ff3333' : '#cc2222';

    // Back Leg
    limb(c, [-10, hipY], backKnee, backFoot, 24, skin, skinShade);
    this.tysonShoe(c, backFoot);

    // Front Leg
    limb(c, [10, hipY], frontKnee, frontFoot, 26, skin, skinShade);
    this.tysonShoe(c, frontFoot);

    // Trunks
    shape(c, [[-16, hipY-10], [18, hipY-10], [22, hipY+15], [8, hipY+20], [-5, hipY+12], [-18, hipY+15]], trunks, trunksHighlight);
    line(c, [[-16, hipY-10], [18, hipY-10]], '#ffffff', 6); // Waistband

    c.save(); c.translate(0, hipY); c.rotate(lean); c.translate(0, 45);

    // Back Arm
    limb(c, [-20, -95], backElbow, backHand, 26, skin, skinShade);
    this.tysonGlove(c, backHand, glove);

    // Muscular Torso (compact, thick neck)
    shape(c, [[-22, -100], [24, -100], [18, -60], [-15, -60]], skin, skinShade);
    line(c, [[-15, -95], [15, -95]], skinShade, 4); // Pecs
    line(c, [[0, -90], [0, -60]], skinShade, 3); // Abs line

    // Head (compact, face tattoo)
    c.save(); c.translate(2, -105); c.rotate(head);
    oval(c, 0, -10, 14, 16, skin);
    line(c, [[4, -14], [10, -8], [6, -4]], '#2a1a14', 2.5); // Signature face tattoo
    line(c, [[8, -12], [12, -12]], '#000000', 3); // Eye
    if (state === 'hurt' || state === 'defeated') {
      line(c, [[8, -2], [12, -4]], '#000000', 2); // Mouth gasp
    } else {
      line(c, [[8, -4], [12, -4]], '#000000', 2); // Mouth tight
    }
    c.restore();

    // Front Arm
    limb(c, [22, -95], frontElbow, frontHand, 28, skin, skinShade);
    this.tysonGlove(c, frontHand, glove);

    c.restore();

    // Effects
    if (enraged && state !== 'defeated') {
      c.save(); c.globalCompositeOperation = 'overlay';
      c.beginPath(); c.ellipse(0, -60, 40, 60, 0, 0, Math.PI * 2);
      c.fillStyle = '#ff000033'; c.fill();
      c.restore();
    }
    if (actor.hitFlash > 0) {
      c.save(); c.globalAlpha = Math.min(1, actor.hitFlash / .14);
      burst(c, [10, -70], 1.5, '#ffffff');
      c.restore();
    }

    c.restore();
  }

  tysonShoe(c, pos) {
    c.save(); c.translate(pos[0], pos[1]);
    shape(c, [[-10, -5], [5, -5], [12, 4], [-12, 4]], '#111', '#222');
    line(c, [[-8, 2], [10, 2]], '#fff', 1.5);
    c.restore();
  }

  tysonGlove(c, pos, color) {
    c.save(); c.translate(pos[0], pos[1]);
    oval(c, 0, 0, 18, 16, color);
    shape(c, [[-10, -5], [-10, 5], [-16, 6], [-16, -6]], '#fff'); // White wrist tape
    c.restore();
  }
  preview(canvas, config, state = 'idle') {
    const c = canvas.getContext('2d'); c.clearRect(0,0,canvas.width,canvas.height);
    const glow = c.createRadialGradient(120,130,8,120,130,125); glow.addColorStop(0,`${config.accent}55`); glow.addColorStop(1,`${config.accent}00`); c.fillStyle = glow; c.fillRect(0,0,240,240);
    c.fillStyle = '#070d2299'; c.beginPath(); c.ellipse(120,223,55,9,0,0,Math.PI*2); c.fill();
    this.draw(c,{config,state,time:0.4,facing:1,z:0,actionTime:0},115,213,1.1);
  }
}
