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

export class CharacterRenderer {
  draw(c, actor, x, y, scale = 1) {
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

  preview(canvas, config, state = 'idle') {
    const c = canvas.getContext('2d'); c.clearRect(0,0,canvas.width,canvas.height);
    const glow = c.createRadialGradient(120,130,8,120,130,125); glow.addColorStop(0,`${config.accent}55`); glow.addColorStop(1,`${config.accent}00`); c.fillStyle = glow; c.fillRect(0,0,240,240);
    c.fillStyle = '#070d2299'; c.beginPath(); c.ellipse(120,223,55,9,0,0,Math.PI*2); c.fill();
    this.draw(c,{config,state,time:0.4,facing:1,z:0,actionTime:0},115,213,1.1);
  }
}
