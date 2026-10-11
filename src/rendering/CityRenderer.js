const WORLD_WIDTH = 2400;
function layer(width, height, draw) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d')); return canvas;
}
function rect(c,x,y,w,h,color) { c.fillStyle = color; c.fillRect(x,y,w,h); }
function text(c,label,x,y,size,color) { c.font = `bold ${size}px monospace`; c.fillStyle = color; c.fillText(label,x,y); }
function stroke(c,x1,y1,x2,y2,color,width=1) { c.strokeStyle=color; c.lineWidth=width; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); }

export class CityRenderer {
  constructor() {
    // Static decoration is painted once; gameplay composites cached layers.
    this.sky = layer(960,540,c => {
      const gradient = c.createLinearGradient(0,0,0,350); gradient.addColorStop(0,'#101127'); gradient.addColorStop(.6,'#252646'); gradient.addColorStop(1,'#66435c'); c.fillStyle=gradient; c.fillRect(0,0,960,540);
      for (let i=0;i<65;i++) rect(c,(i*137)%960,(i*41)%190,1.5,1.5,'#aab7d080');
      const moon = c.createRadialGradient(750,68,10,750,68,80); moon.addColorStop(0,'#dbd8bb50'); moon.addColorStop(1,'#dbd8bb00'); c.fillStyle=moon; c.fillRect(665,0,170,160);
      c.fillStyle='#dddcc3'; c.beginPath(); c.arc(750,68,22,0,Math.PI*2); c.fill();
      for(let i=0;i<8;i++) rect(c,i*157-40,110+i%3*22,145,9,'#37334c65');
    });
    this.skyline = layer(2800,320,c => {
      for(let i=0;i<29;i++) {
        const x=i*99,h=100+(i*53)%150; rect(c,x,310-h,92,h,i%2?'#1c243c':'#192039'); rect(c,x-3,309-h,98,5,'#353c50');
        if(i%3===0) { rect(c,x+22,294-h,45,17,'#252a42'); stroke(c,x+46,294-h,x+46,264-h,'#505573'); }
        for(let y=326-h;y<305;y+=17) for(let w=9;w<84;w+=15) rect(c,x+w,y,5,7,(i+w+y)%4?'#a19b7560':'#586478');
      }
    });
    this.street = layer(WORLD_WIDTH,540,c => this.drawStreet(c));
    this.ground = layer(WORLD_WIDTH,540,c => this.drawGround(c));
  }
  drawGround(c) {
    const road=c.createLinearGradient(0,345,0,540); road.addColorStop(0,'#252e43'); road.addColorStop(1,'#141d2f'); c.fillStyle=road; c.fillRect(0,345,WORLD_WIDTH,195);
    rect(c,0,329,WORLD_WIDTH,28,'#50536a'); rect(c,0,331,WORLD_WIDTH,3,'#828293'); rect(c,0,354,WORLD_WIDTH,8,'#111c2b'); rect(c,0,358,WORLD_WIDTH,2,'#696676');
    for(let x=0;x<WORLD_WIDTH;x+=90) { stroke(c,x,331,x+5,354,'#262e42',2); stroke(c,x,360,x-110,540,'#252e4280'); }
    for(let x=20;x<WORLD_WIDTH;x+=145) { rect(c,x,472,82,4,'#bba87070'); rect(c,x+7,477,82,2,'#080f1d'); }
    for(let y=375;y<540;y+=35) stroke(c,0,y,WORLD_WIDTH,y,'#35405c50');
    for(let i=0;i<950;i++) rect(c,(i*97)%WORLD_WIDTH,365+(i*37)%171,1+(i%3),1,i%2?'#65718520':'#080e2040');
    for(let x=130;x<WORLD_WIDTH;x+=370) {
      c.fillStyle='#65859a20'; c.beginPath(); c.ellipse(x,413,69,9,-.05,0,Math.PI*2); c.fill();
      stroke(c,x-52,412,x+35,412,'#9381a745',1); stroke(c,x-22,416,x+52,416,'#8b699735',1);
      rect(c,x+120,367,46,12,'#172236'); for(let j=0;j<7;j++) rect(c,x+123+j*6,369,3,7,'#6d7280');
    }
    for(let i=0;i<6;i++) { c.fillStyle='#c4bd9d45'; c.beginPath(); c.moveTo(752+i*16,382); c.lineTo(764+i*16,382); c.lineTo(710+i*26,448); c.lineTo(692+i*26,448); c.fill(); }
  }
  drawStreet(c) {
    const shops = [
      {name:'DRAGON ARCADE',color:'#67e5d8',wall:'#3c374b',sub:'OPEN ALL NIGHT'},
      {name:'KAI KAI NOODLES',color:'#ffa070',wall:'#51404d',sub:'HOT FOOD / COLD DRINKS'},
      {name:'METRO RECORDS',color:'#cd91f5',wall:'#363d52',sub:'VINYL / TAPES'},
      {name:'24H MARKET',color:'#8fcaaa',wall:'#433c46',sub:'CITY STREETS'},
      {name:'NEON GARAGE',color:'#f091b1',wall:'#3c4355',sub:'REPAIRS & PARTS'},
      {name:'BRAWL CLUB',color:'#d5adf9',wall:'#4e3d52',sub:'MEMBERS ONLY'},
    ];
    for(let i=0;i<6;i++) {
      const x=i*400,s=shops[i];
      rect(c,x,105,398,225,s.wall); rect(c,x+2,108,394,8,'#777084'); rect(c,x+7,116,383,5,'#181e30');
      for(let y=128;y<329;y+=13) { stroke(c,x,y,x+397,y,'#191d2f40'); for(let w=(y%26?0:17);w<396;w+=35) stroke(c,x+w,y,x+w,y+13,'#1c223240'); }
      for(let j=0;j<4;j++) {
        const wx=x+22+j*93; rect(c,wx-4,132,68,60,'#171d2d'); rect(c,wx,136,60,51,'#303344');
        rect(c,wx+4,139,25,44,(i+j)%3?'#d7aa7370':'#7a82a850'); rect(c,wx+32,139,24,44,(i+j)%2?'#d7aa7350':'#1c2537');
        stroke(c,wx+30,137,wx+30,187,'#10172a',3); stroke(c,wx,162,wx+60,162,'#10172a',3); rect(c,wx-5,190,70,5,'#7a7280');
        if(j===2) { rect(c,wx+8,168,48,25,'#76717b'); for(let v=0;v<5;v++) stroke(c,wx+12,172+v*3,wx+50,172+v*3,'#393c4c'); }
      }
      rect(c,x+15,203,366,45,'#151b30'); rect(c,x+18,206,360,39,'#22263b');
      c.shadowColor=s.color; c.shadowBlur=10; text(c,s.name,x+30,231,23,s.color); c.shadowBlur=0;
      rect(c,x+19,247,360,10,s.color+'80'); rect(c,x+22,260,238,65,'#19273b');
      for(let j=0;j<3;j++) { rect(c,x+27+j*78,265,71,56,'#28505c'); rect(c,x+32+j*78,268,6,44,'#78acac45'); stroke(c,x+28+j*78,288,x+95+j*78,288,'#86b4ab40'); }
      text(c,s.sub,x+30,306,10,'#cedac2');
      rect(c,x+272,258,76,71,'#141b2b'); rect(c,x+279,264,62,58,'#324454'); rect(c,x+283,267,25,49,'#7297a545'); rect(c,x+334,293,3,9,'#f1d19a');
      for(let j=0;j<12;j++) rect(c,x+20+j*30,249,30,8,j%2?'#594153':'#b27679');
      rect(c,x+363,259,20,69,'#4d5261'); for(let y=262;y<326;y+=5) stroke(c,x+364,y,x+381,y,'#262b3e');
      rect(c,x+390,117,5,211,'#191e30'); stroke(c,x+394,119,x+394,322,'#777384',1);
      if(i%2===0) { text(c,'NO',x+358,300,7,'#b79299'); text(c,'PARKING',x+350,308,6,'#b79299'); }
    }
    for(let x=58;x<WORLD_WIDTH;x+=800) {
      rect(c,x,189,157,5,'#0d1728'); for(let j=0;j<12;j++) stroke(c,x+j*13,173,x+j*13,189,'#151c2d',2);
      stroke(c,x,174,x+154,174,'#79818a'); stroke(c,x+154,194,x+71,254,'#152137',5);
      for(let j=0;j<8;j++) stroke(c,x+149-j*10,200+j*7,x+127-j*10,200+j*7,'#586371',2);
    }
    for(let x=355;x<WORLD_WIDTH;x+=440) {
      const glow=c.createRadialGradient(x,234,4,x,234,109); glow.addColorStop(0,'#f8ce8040'); glow.addColorStop(1,'#ffdd8b00'); c.fillStyle=glow; c.fillRect(x-109,125,218,218);
      rect(c,x-3,235,7,108,'#172235'); rect(c,x,239,2,96,'#b2a084'); rect(c,x-9,338,20,6,'#131d30');
      rect(c,x-20,224,42,8,'#202437'); rect(c,x-15,232,32,7,'#ffe4a9');
      stroke(c,x-18,224,x-9,212,'#242a3d',3); stroke(c,x-9,212,x+9,212,'#242a3d',3); stroke(c,x+9,212,x+20,224,'#242a3d',3);
    }
    for(let x=310;x<WORLD_WIDTH;x+=800) {
      rect(c,x,308,26,34,'#344951'); rect(c,x-2,306,30,5,'#66736a');
      for(let j=0;j<5;j++) stroke(c,x+4+j*4,312,x+4+j*4,338,'#1e2e3d');
      rect(c,x+46,317,13,25,'#ac5753'); rect(c,x+42,327,22,6,'#c56a5e'); rect(c,x+45,314,15,5,'#e09274');
    }
    c.fillStyle='#151d30'; c.beginPath(); c.ellipse(1340,337,110,10,0,0,Math.PI*2); c.fill();
    c.fillStyle='#4b667a'; c.beginPath(); c.moveTo(1230,329); c.lineTo(1239,310); c.lineTo(1276,304); c.lineTo(1300,275); c.lineTo(1370,275); c.lineTo(1403,307); c.lineTo(1442,316); c.lineTo(1446,333); c.closePath(); c.fill(); c.strokeStyle='#172338'; c.lineWidth=3; c.stroke();
    rect(c,1302,282,26,23,'#7f9ca055'); rect(c,1336,282,32,23,'#7f9ca055'); rect(c,1429,317,15,7,'#e9cca0');
    for(const x of [1270,1405]) { c.fillStyle='#0d1525'; c.beginPath(); c.arc(x,331,15,0,Math.PI*2); c.fill(); c.fillStyle='#8a8a90'; c.beginPath(); c.arc(x,331,7,0,Math.PI*2); c.fill(); }
    c.strokeStyle='#141a2e'; c.lineWidth=2; c.beginPath(); c.moveTo(0,90); for(let x=0;x<WORLD_WIDTH;x+=400) c.quadraticCurveTo(x+200,120,x+400,88); c.stroke();
  }
  draw(c,camera,background) {
    c.drawImage(this.sky,0,0); c.drawImage(this.skyline,-camera*.25,0);
    c.drawImage(this.ground,-camera,0); c.drawImage(this.street,-camera,0);
    if(background) c.drawImage(background,0,0,background.width,background.height,-camera,0,WORLD_WIDTH,540);
  }
}
