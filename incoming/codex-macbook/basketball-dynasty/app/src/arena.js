import * as THREE from 'three';
import { rngFrom } from './data.js';

const COURT = { length: 30, width: 16.8, y: 0 };
const STEP = 1 / 60;
const DURATION = 24;

function canvasTexture(width, height, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  paint(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function courtTexture(team) {
  return canvasTexture(1536, 864, (ctx, w, h) => {
    const rand = rngFrom(`court-${team.id}`);
    ctx.fillStyle = '#b97c45'; ctx.fillRect(0,0,w,h);
    const plankH = h / 42;
    for (let row=0; row<42; row++) {
      for (let col=0; col<14; col++) {
        const pw = w/12, x = col*pw - (row%2)*pw/2;
        const light = 43 + Math.floor(rand()*12);
        ctx.fillStyle = `hsl(29 43% ${light}%)`;
        ctx.fillRect(x,row*plankH,pw-2,plankH-1);
      }
    }
    const gloss = ctx.createLinearGradient(0,0,w,h);
    gloss.addColorStop(0,'rgba(255,255,255,.15)'); gloss.addColorStop(.45,'rgba(255,255,255,0)'); gloss.addColorStop(1,'rgba(40,12,0,.14)');
    ctx.fillStyle = gloss; ctx.fillRect(0,0,w,h);
    const sx = w/COURT.length, sy = h/COURT.width;
    ctx.strokeStyle = 'rgba(250,250,240,.92)'; ctx.lineWidth = 5;
    ctx.strokeRect(20,20,w-40,h-40);
    ctx.beginPath(); ctx.moveTo(w/2,20); ctx.lineTo(w/2,h-20); ctx.stroke();
    ctx.beginPath(); ctx.arc(w/2,h/2,1.8*sy,0,Math.PI*2); ctx.stroke();
    for (const side of [-1,1]) {
      const bx = side < 0 ? 20 : w-20;
      const keyW = 5.8*sx, keyH = 4.9*sy;
      const x = side < 0 ? bx : bx-keyW;
      ctx.fillStyle = `${team.primary}bb`; ctx.fillRect(x,h/2-keyH/2,keyW,keyH);
      ctx.strokeRect(x,h/2-keyH/2,keyW,keyH);
      const rimX = w/2 + side*(COURT.length/2-1.6)*sx;
      ctx.beginPath(); ctx.arc(rimX,h/2,1.25*sy,0,Math.PI*2); ctx.stroke();
      ctx.beginPath();
      const threeX = w/2 + side*(COURT.length/2-6.75)*sx;
      ctx.arc(threeX,h/2,6.75*sy,side<0?-1.12:Math.PI-1.12,side<0?1.12:Math.PI+1.12); ctx.stroke();
    }
    ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(-Math.PI/2);
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#07111faa'; ctx.font='900 68px Arial'; ctx.fillText(team.name.toUpperCase(),0,-6);
    ctx.fillStyle=team.ink; ctx.font='700 20px Arial'; ctx.letterSpacing='8px'; ctx.fillText(`${team.city.toUpperCase()}  •  BASKETBALL`,0,48);
    ctx.restore();
    ctx.fillStyle=team.primary; ctx.fillRect(20,20,w-40,12); ctx.fillRect(20,h-32,w-40,12);
  });
}

function boardTexture(team) {
  return canvasTexture(1024, 320, (ctx,w,h) => {
    ctx.fillStyle='#040a14'; ctx.fillRect(0,0,w,h);
    const grad=ctx.createLinearGradient(0,0,w,0); grad.addColorStop(0,team.primary); grad.addColorStop(1,team.secondary);
    ctx.fillStyle=grad; ctx.fillRect(0,0,w,14); ctx.fillRect(0,h-10,w,10);
    ctx.fillStyle=team.ink; ctx.textAlign='center'; ctx.font='900 54px Arial'; ctx.fillText(team.city.toUpperCase(),w/2,85);
    ctx.font='900 94px Arial'; ctx.fillText(team.name.toUpperCase(),w/2,190);
    ctx.fillStyle=team.secondary; ctx.font='700 26px Arial'; ctx.fillText('THE FUTURE IS BUILT HERE',w/2,255);
  });
}

export class Arena {
  constructor(canvas, team) {
    this.canvas = canvas;
    this.team = team;
    this.simT = 0; this.acc = 0; this.paused = false;
    this.last = performance.now(); this.frames = 0; this.fps = 60; this.fpsStamp = this.last;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias:true, preserveDrawingBuffer:true, powerPreference:'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030812');
    this.scene.fog = new THREE.Fog('#030812', 40, 100);
    this.camera = new THREE.PerspectiveCamera(42, innerWidth/innerHeight, .1, 180);
    this.camera.position.set(23,19,27);
    this.camera.lookAt(0,1,0);
    this.world = new THREE.Group(); this.scene.add(this.world);
    this.players = [];
    this.makeLights(); this.makeArena(); this.makePlayers(); this.setTeam(team);
    this.resize = this.resize.bind(this);
    addEventListener('resize', this.resize); this.resize();
    this.renderer.setAnimationLoop(t => this.tick(t));
  }

  makeLights() {
    this.scene.add(new THREE.HemisphereLight(0xc9dcff,0x1a0e09,1.15));
    const key = new THREE.DirectionalLight(0xfff0d5,2.5);
    key.position.set(-12,28,10); key.castShadow=true;
    key.shadow.mapSize.set(1024,1024); key.shadow.camera.left=-25; key.shadow.camera.right=25; key.shadow.camera.top=25; key.shadow.camera.bottom=-25;
    key.shadow.bias=-.0004; this.scene.add(key);
    for (const x of [-18,18]) {
      const spot = new THREE.SpotLight(0x8fdcff,75,65,.42,.5,1.2);
      spot.position.set(x,23,-14); spot.target.position.set(0,0,0); this.scene.add(spot,spot.target);
    }
  }

  makeArena() {
    const dark = new THREE.MeshStandardMaterial({color:0x07101d,roughness:.82,metalness:.22});
    const floor = new THREE.Mesh(new THREE.BoxGeometry(COURT.length+2,.35,COURT.width+2),dark);
    floor.position.y=-.22; floor.receiveShadow=true; this.world.add(floor);
    this.courtMaterial = new THREE.MeshStandardMaterial({roughness:.28,metalness:.08});
    this.court = new THREE.Mesh(new THREE.PlaneGeometry(COURT.length,COURT.width),this.courtMaterial);
    this.court.rotation.x=-Math.PI/2; this.court.position.y=.01; this.court.receiveShadow=true; this.world.add(this.court);
    this.makeHoops(); this.makeBowl(); this.makeJumbotron(); this.makeCrowd();
    const ribbonMat = new THREE.MeshStandardMaterial({color:0x12314c,emissive:0x071a2b,emissiveIntensity:1.4});
    for (const z of [-18,18]) {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(56,1.05,.35),ribbonMat);
      ribbon.position.set(0,5.2,z); this.world.add(ribbon);
    }
    for (const x of [-28,28]) {
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(.35,1.05,36),ribbonMat);
      ribbon.position.set(x,5.2,0); this.world.add(ribbon);
    }
  }

  makeHoops() {
    const metal = new THREE.MeshStandardMaterial({color:0xd7e2eb,metalness:.8,roughness:.22});
    const rimMat = new THREE.MeshStandardMaterial({color:0xff5b22,metalness:.5,roughness:.3});
    const glass = new THREE.MeshPhysicalMaterial({color:0xd9f4ff,transparent:true,opacity:.28,roughness:.08,metalness:.1,side:THREE.DoubleSide});
    for (const side of [-1,1]) {
      const group = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.15,.24,4.3,12),metal); pole.position.set(side*16,2.05,0); group.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(2.8,.18,.18),metal); arm.position.set(side*14.8,3.75,0); group.add(arm);
      const board = new THREE.Mesh(new THREE.BoxGeometry(.12,1.8,3.05),glass); board.position.set(side*13.5,3.65,0); group.add(board);
      const border = new THREE.LineSegments(new THREE.EdgesGeometry(board.geometry),new THREE.LineBasicMaterial({color:0xffffff})); border.position.copy(board.position); group.add(border);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.45,.045,10,28),rimMat); rim.rotation.x=Math.PI/2; rim.position.set(side*12.9,3.05,0); group.add(rim);
      for(let i=0;i<10;i++) {
        const a=i/10*Math.PI*2;
        const cord=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.6,4),new THREE.MeshBasicMaterial({color:0xf5f5ef}));
        cord.position.set(side*12.9+Math.cos(a)*.4,2.76,Math.sin(a)*.4); cord.rotation.z=Math.cos(a)*.15; group.add(cord);
      }
      this.world.add(group);
    }
  }

  makeBowl() {
    const seatMat = new THREE.MeshStandardMaterial({color:0x0b1726,roughness:.88});
    for (let tier=0;tier<4;tier++) {
      const y=1.0+tier*1.45, dist=12.2+tier*2.1;
      for (const zSide of [-1,1]) {
        const stand=new THREE.Mesh(new THREE.BoxGeometry(50-tier*2,1.25,2.1),seatMat);
        stand.position.set(0,y,zSide*dist); this.world.add(stand);
      }
      for (const xSide of [-1,1]) {
        const stand=new THREE.Mesh(new THREE.BoxGeometry(2.1,1.25,23+tier*2),seatMat);
        stand.position.set(xSide*(dist+4),y,0); this.world.add(stand);
      }
    }
  }

  makeJumbotron() {
    this.boardMaterial = new THREE.MeshBasicMaterial({toneMapped:false});
    const bodyMat = new THREE.MeshStandardMaterial({color:0x02050a,metalness:.65,roughness:.25});
    const body = new THREE.Mesh(new THREE.BoxGeometry(8.6,3.4,5.4),bodyMat); body.position.set(0,12.8,0); this.world.add(body);
    for(const z of [-2.72,2.72]) {
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(8.1,2.85),this.boardMaterial);
      screen.position.set(0,12.8,z); screen.rotation.y=z<0?Math.PI:0; this.world.add(screen);
    }
    for(const x of [-4.32,4.32]) {
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(4.9,2.85),this.boardMaterial);
      screen.position.set(x,12.8,0); screen.rotation.y=x>0?Math.PI/2:-Math.PI/2; this.world.add(screen);
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(5.2,.08,8,64),new THREE.MeshBasicMaterial({color:0x56d9ff}));
    ring.rotation.x=Math.PI/2; ring.position.y=15; this.world.add(ring);
  }

  makeCrowd() {
    const rand=rngFrom('crowd-layout'),count=innerWidth<700?650:1200;
    const bodyGeo=new THREE.CapsuleGeometry(.13,.28,1,4),headGeo=new THREE.SphereGeometry(.115,5,3);
    const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.86}),skinMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9});
    this.crowd=new THREE.InstancedMesh(bodyGeo,mat,count);this.crowdHeads=new THREE.InstancedMesh(headGeo,skinMat,count);
    const dummy=new THREE.Object3D(),color=new THREE.Color();
    const palette=[0x28425f,0xdde6ed,0x7a2545,0xbe9b50,0x36759b,0x663b7a,0x23272e,0xc9d5df,0x97452f],skins=[0x5b3326,0x7a4a32,0x9a6242,0xbd8560,0xd9a37e,0xe4b996];
    this.crowdBase=[];
    for(let i=0;i<count;i++) {
      const tier=Math.floor(rand()*4),side=i%4,along=rand()*2-1,y=2+tier*1.45+rand()*.35,dist=11.7+tier*2.1+rand()*.95;
      let x,z;if(side<2){x=along*(23-tier);z=(side===0?-1:1)*dist;}else{x=(side===2?-1:1)*(dist+4);z=along*(10+tier);}
      const s=.85+rand()*.42;dummy.position.set(x,y,z);dummy.scale.setScalar(s);dummy.rotation.y=rand()*Math.PI*2;dummy.updateMatrix();
      this.crowd.setMatrixAt(i,dummy.matrix);this.crowd.setColorAt(i,color.setHex(palette[Math.floor(rand()*palette.length)]));
      dummy.position.y=y+.37*s;dummy.scale.setScalar(s);dummy.updateMatrix();this.crowdHeads.setMatrixAt(i,dummy.matrix);this.crowdHeads.setColorAt(i,color.setHex(skins[Math.floor(rand()*skins.length)]));
      this.crowdBase.push({x,y,z,s});
    }
    this.crowd.instanceMatrix.needsUpdate=true;this.crowdHeads.instanceMatrix.needsUpdate=true;this.world.add(this.crowd,this.crowdHeads);
  }

  uniformTexture(team,number=0) {
    return canvasTexture(256,256,(ctx,w,h)=>{
      ctx.fillStyle=team.primary;ctx.fillRect(0,0,w,h);
      const shade=ctx.createLinearGradient(0,0,w,0);shade.addColorStop(0,'#00000055');shade.addColorStop(.22,'#ffffff12');shade.addColorStop(.7,'#ffffff05');shade.addColorStop(1,'#00000066');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
      ctx.fillStyle=team.secondary;ctx.fillRect(0,0,15,h);ctx.fillRect(w-15,0,15,h);ctx.fillRect(0,0,w,12);
      ctx.strokeStyle=team.ink;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(62,0);ctx.quadraticCurveTo(w/2,62,w-62,0);ctx.stroke();
      ctx.textAlign='center';ctx.fillStyle=team.ink;ctx.font='900 25px Arial';ctx.fillText(team.short,w/2,70);
      ctx.font='900 116px Arial';ctx.fillText(String(number),w/2,190);
      ctx.font='700 13px Arial';ctx.fillText('BSCFD',w/2,224);
    });
  }

  makePlayers() {
    const shoeMat=new THREE.MeshStandardMaterial({color:0xf4f6fa,roughness:.42});
    const trimMat=new THREE.MeshStandardMaterial({color:0xe9f5ff,roughness:.5});
    for(let i=0;i<10;i++) {
      const home=i<5,lane=i%5,group=new THREE.Group(),rand=rngFrom(`athlete-${this.team.id}-${i}`);
      const skin=new THREE.MeshStandardMaterial({color:['#5b3326','#7a4a32','#9a6242','#bd8560','#d9a37e','#e4b996'][Math.floor(rand()*6)],roughness:.68});
      const hair=new THREE.MeshStandardMaterial({color:['#111318','#251b17','#3b271d'][Math.floor(rand()*3)],roughness:.9});
      const jersey=new THREE.MeshStandardMaterial({color:home?this.team.primary:'#e6e9ef',roughness:.52});
      const shorts=new THREE.MeshStandardMaterial({color:home?this.team.primary:'#e6e9ef',roughness:.58});
      const torso=new THREE.Mesh(new THREE.CylinderGeometry(.39,.34,.88,18),jersey);torso.position.y=1.58;torso.scale.z=.66;torso.castShadow=true;group.add(torso);
      const shoulders=new THREE.Mesh(new THREE.SphereGeometry(.39,16,10),jersey);shoulders.position.y=1.91;shoulders.scale.set(1.12,.52,.68);group.add(shoulders);
      const shortsMesh=new THREE.Mesh(new THREE.CylinderGeometry(.34,.38,.42,16),shorts);shortsMesh.position.y=1.02;shortsMesh.scale.z=.72;group.add(shortsMesh);
      const stripe=new THREE.Mesh(new THREE.TorusGeometry(.35,.022,6,24),trimMat);stripe.rotation.x=Math.PI/2;stripe.position.y=1.23;stripe.scale.z=.72;group.add(stripe);
      const neck=new THREE.Mesh(new THREE.CylinderGeometry(.115,.13,.22,10),skin);neck.position.y=2.08;group.add(neck);
      const head=new THREE.Mesh(new THREE.SphereGeometry(.235,18,12),skin);head.position.y=2.34;head.scale.y=1.12;head.castShadow=true;group.add(head);
      const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.241,18,10,0,Math.PI*2,0,Math.PI*.47),hair);hairCap.position.y=2.39;group.add(hairCap);
      const nose=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),skin);nose.position.set(0,2.35,.229);group.add(nose);
      const limbs=[],knees=[],elbows=[];
      for(const x of [-.19,.19]) {
        const leg=new THREE.Group();leg.position.set(x,1.1,0);
        const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.32,3,7),skin);thigh.position.y=-.22;leg.add(thigh);
        const knee=new THREE.Group();knee.position.y=-.45;
        const shin=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.3,3,7),skin);shin.position.y=-.21;knee.add(shin);
        const sock=new THREE.Mesh(new THREE.CylinderGeometry(.098,.1,.25,7),trimMat);sock.position.y=-.41;knee.add(sock);
        const shoe=new THREE.Mesh(new THREE.BoxGeometry(.25,.15,.43),shoeMat);shoe.position.set(0,-.58,.09);knee.add(shoe);leg.add(knee);group.add(leg);limbs.push(leg);knees.push(knee);
      }
      for(const x of [-.44,.44]) {
        const arm=new THREE.Group();arm.position.set(x,1.88,0);arm.rotation.z=x<0?-.09:.09;
        const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.3,3,7),skin);upper.position.y=-.25;arm.add(upper);
        const elbow=new THREE.Group();elbow.position.y=-.48;
        const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.28,3,7),skin);forearm.position.y=-.22;elbow.add(forearm);
        const hand=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),skin);hand.position.y=-.46;elbow.add(hand);arm.add(elbow);group.add(arm);limbs.push(arm);elbows.push(elbow);
      }
      const ball=new THREE.Group(),ballMat=new THREE.MeshStandardMaterial({color:0xc65f23,roughness:.72});
      ball.add(new THREE.Mesh(new THREE.SphereGeometry(.18,18,12),ballMat));
      const seamMat=new THREE.MeshBasicMaterial({color:0x32150b});
      const seamA=new THREE.Mesh(new THREE.TorusGeometry(.181,.008,5,28),seamMat),seamB=seamA.clone();seamB.rotation.y=Math.PI/2;ball.add(seamA,seamB);
      ball.position.set(.55,1.05,.1);group.add(ball);
      group.scale.set(1.02+lane*.025,1.01+lane*.035,1.02+lane*.025);group.userData={jersey,shorts,skin,hair,limbs,knees,elbows,ball,index:i,home};this.players.push(group);this.world.add(group);
    }
  }

  applyUniforms() {
    if(!this.game)return;
    for(const p of this.players){
      const side=p.userData.home?'home':'away',team=this.game.teams[side],lineup=this.game.onCourt?.[side]||this.game.rosters[side],player=lineup[p.userData.index%5];
      if(p.userData.jersey.map)p.userData.jersey.map.dispose();
      p.userData.jersey.map=this.uniformTexture(team,player?.number??p.userData.index);p.userData.jersey.color.set('#ffffff');p.userData.jersey.needsUpdate=true;
      p.userData.shorts.color.set(team.primary);
      if(player){p.userData.skin.color.set(player.skin);p.userData.hair.color.set(player.hair);}
    }
  }

  setTeam(team) {
    this.team=team;
    if(this.courtMaterial.map) this.courtMaterial.map.dispose();
    this.courtMaterial.map=courtTexture(team); this.courtMaterial.needsUpdate=true;
    if(this.boardMaterial.map) this.boardMaterial.map.dispose();
    this.boardMaterial.map=boardTexture(team); this.boardMaterial.needsUpdate=true;
    for(const p of this.players){p.userData.jersey.map=null;p.userData.jersey.color.set(p.userData.home?team.primary:'#e8edf2');p.userData.shorts.color.set(p.userData.home?team.primary:'#e8edf2');}
  }

  setOpponent(team) {
    for(const p of this.players)if(!p.userData.home){p.userData.jersey.color.set(team.primary);p.userData.shorts.color.set(team.primary);}
  }
  setGame(game) {
    this.game=game;this.mode='game';this.appliedLineupVersion=game.lineupVersion;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;this.applyUniforms();
  }
  setWarmup() {
    this.mode='warmup';this.game=null;this.renderer.shadowMap.autoUpdate=false;this.renderer.shadowMap.needsUpdate=true;
    for(const p of this.players){p.visible=true;p.userData.ball.visible=true;}
  }
  sampleGame(t) {
    const game=this.game;if(!game)return;
    if(this.appliedLineupVersion!==game.lineupVersion){this.appliedLineupVersion=game.lineupVersion;this.applyUniforms();}
    const state=game.state,offense=state.possession,dir=offense==='home'?1:-1;
    const formation=[[2.7,0],[5.9,-5.2],[5.9,5.2],[8.7,-2.8],[10.4,2.1]],carrier=Math.floor(state.totalTime/3.2)%5;
    const shooting=state.possessionLeft<1.6;
    for(const p of this.players){
      const i=p.userData.index,lane=i%5,side=i<5?'home':'away',attacking=side===offense;
      const [fx,fz]=formation[lane],a=t*3+i*1.31,cut=t*1.25+i*1.71;
      const x=attacking?dir*(fx+Math.sin(cut*.7)*.72):dir*(fx+1.1+Math.cos(cut*.6)*.38);
      const z=(attacking?fz:-fz*.92)+Math.sin(cut)*.62;
      const shooter=attacking&&lane===carrier,jump=shooter&&shooting?Math.sin(Math.min(1,(1.6-state.possessionLeft)/1.6)*Math.PI)*.3:0;
      p.position.set(x,jump+Math.max(0,Math.sin(a*2))*.025-(attacking?0:.09),z);p.rotation.y=dir*Math.PI/2;
      const {limbs,knees,elbows,ball}=p.userData;
      limbs[0].rotation.set(Math.sin(a)*.32,0,0);limbs[1].rotation.set(-Math.sin(a)*.32,0,0);
      knees[0].rotation.x=Math.max(0,-Math.sin(a))*.55;knees[1].rotation.x=Math.max(0,Math.sin(a))*.55;
      limbs[2].rotation.set(-Math.sin(a)*.24,0,-.09);limbs[3].rotation.set(Math.sin(a)*.24,0,.09);elbows[0].rotation.x=-.18;elbows[1].rotation.x=-.18;
      if(!attacking){limbs[2].rotation.z=-.72;limbs[3].rotation.z=.72;knees[0].rotation.x=.38;knees[1].rotation.x=.38;}
      ball.visible=shooter;
      if(shooter){
        if(shooting){
          limbs[2].rotation.x=-1.62;limbs[3].rotation.x=-1.62;elbows[0].rotation.x=-.48;elbows[1].rotation.x=-.48;
          if(state.possessionLeft>=1.05){ball.position.set(.16,2.25,.4);}
          else{
            const progress=Math.max(0,Math.min(1,1-state.possessionLeft/1.05)),start=new THREE.Vector3(p.position.x+dir*.45,2.35+p.position.y,p.position.z),target=new THREE.Vector3(dir*12.9,3.05,0);
            start.lerp(target,progress);start.y+=Math.sin(progress*Math.PI)*3.1;p.updateMatrixWorld(true);ball.position.copy(p.worldToLocal(start));
          }
        }else{
          ball.position.set(.48,.35+Math.abs(Math.sin(a*1.4))*1.0,.25);limbs[3].rotation.x=-.15+Math.sin(a*1.4)*.25;elbows[1].rotation.x=-.42;
        }
      }
    }
    const mobile=innerWidth<700;
    if(game.lastEvent?.kind==='score'&&this.visualEvent!==game.lastEvent.id){
      this.visualEvent=game.lastEvent.id;this.highlightUntil=t+1.15;
      const side=game.lastEvent.side,lane=(game.onCourt?.[side]||game.rosters[side]).findIndex(p=>p.id===game.lastEvent.playerId);
      this.highlightPlayer=this.players[(side==='home'?0:5)+Math.max(0,lane)];
    }
    this.camera.fov=mobile?51:40;this.camera.updateProjectionMatrix();
    if(!mobile&&t<this.highlightUntil&&this.highlightPlayer){
      const star=this.highlightPlayer;this.camera.position.set(star.position.x-dir*3.8,4.8,star.position.z+8.8);this.camera.lookAt(star.position.x,1.35,star.position.z);
    }else{
      this.camera.position.set(dir*(mobile?15:14.5),mobile?13:12.2,mobile?23:22.5);this.camera.lookAt(dir*4.7,1.05,0);
    }
  }

  sample(t) {
    if(this.mode==='game'){this.sampleGame(t);return;}
    const phase=t/DURATION*Math.PI*2;
    const mobile=innerWidth<700;
    const radius=mobile?36:34;
    this.camera.position.set(Math.cos(.63+Math.sin(phase)*.07)*radius, mobile?23:19.5, Math.sin(.63+Math.sin(phase)*.07)*radius);
    this.camera.lookAt(0,1.1,0);
    for(const p of this.players) {
      const i=p.userData.index, lane=i%5, side=i<5?-1:1;
      const a=t*1.35+i*1.71;
      p.position.set(side*(4.5+lane*1.45)+Math.sin(a*.45)*.5,0,(lane-2)*2.2+Math.cos(a*.35)*.35);
      p.rotation.y=side<0?-.7:.7;
      p.position.y=Math.max(0,Math.sin(a*2))*.045;
      p.userData.ball.position.y=.45+Math.abs(Math.sin(a*2.3))*1.2;
      p.userData.limbs[0].rotation.x=Math.sin(a)*.15;
      p.userData.limbs[1].rotation.x=-Math.sin(a)*.15;
    }
  }

  tick(now) {
    const dt=Math.min((now-this.last)/1000,.1); this.last=now;
    if(!this.paused) {
      this.acc+=dt;
      while(this.acc>=STEP){this.acc-=STEP;this.simT+=STEP;if(this.onStep)this.onStep(STEP);}
      this.sample(this.simT);
    }
    if(this.mode==='game'&&this.frames%8===0)this.renderer.shadowMap.needsUpdate=true;
    this.renderer.render(this.scene,this.camera);
    this.frames++;
    if(now-this.fpsStamp>=1000){this.fps=Math.round(this.frames*1000/(now-this.fpsStamp));this.frames=0;this.fpsStamp=now;}
  }

  resize() {
    const w=innerWidth,h=innerHeight;
    this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.renderer.setSize(w,h,false); this.sample(this.simT);
  }

  seek(t) { this.paused=true;this.acc=0;this.simT=Math.max(0,Number(t)||0);this.sample(this.simT);this.renderer.render(this.scene,this.camera); }
  play() { this.paused=false;this.last=performance.now(); }
  stats() {
    const gl=this.renderer.getContext(), ext=gl.getExtension('WEBGL_debug_renderer_info');
    return {calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,fps:this.fps,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'WebGL'};
  }
}
