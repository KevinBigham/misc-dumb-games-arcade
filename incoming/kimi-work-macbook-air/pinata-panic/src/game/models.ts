import * as THREE from "three";

const materialCache = new Map<string, THREE.MeshStandardMaterial>();
const basicCache = new Map<string, THREE.MeshBasicMaterial>();

export function material(color: number, roughness = 0.76, emissive = 0): THREE.MeshStandardMaterial {
  const key = `${color}/${roughness}/${emissive}`;
  let mat = materialCache.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02, emissive, emissiveIntensity: emissive ? 0.45 : 0 });
    materialCache.set(key, mat);
  }
  return mat;
}

function basic(color: number, opacity = 1): THREE.MeshBasicMaterial {
  const key = `${color}/${opacity}`;
  let mat = basicCache.get(key);
  if (!mat) {
    mat = new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, side: THREE.DoubleSide });
    basicCache.set(key, mat);
  }
  return mat;
}

function part(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  mat: THREE.Material,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  parent.add(mesh);
  return mesh;
}

function blobShadow(radius: number): THREE.Mesh {
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), basic(0x39284f, 0.2));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  shadow.renderOrder = 1;
  return shadow;
}

export interface PlayerModel {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  legs: THREE.Mesh[];
  eyes: THREE.Mesh[];
}

export function createPlayer(): PlayerModel {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body, blobShadow(0.92));
  const colors = [0xff4f91, 0xffbf3f, 0x52d9c5, 0x7667ee, 0xff7657];

  part(body, new THREE.BoxGeometry(1.18, 1.05, 1.5), material(colors[0]), 0, 1.18, 0.05);
  for (let i = 0; i < 5; i++) {
    const fringe = part(body, new THREE.BoxGeometry(1.25, 0.16, 1.56), material(colors[i]), 0, 0.78 + i * 0.22, 0.05);
    fringe.rotation.y = (i % 2 ? 1 : -1) * 0.035;
  }

  const head = new THREE.Group();
  head.position.set(0, 1.48, -0.88);
  body.add(head);
  part(head, new THREE.BoxGeometry(0.88, 0.85, 0.78), material(colors[2]), 0, 0.1, -0.18);
  part(head, new THREE.BoxGeometry(0.72, 0.43, 0.58), material(colors[1]), 0, -0.12, -0.68);
  part(head, new THREE.BoxGeometry(0.94, 0.14, 0.83), material(colors[3]), 0, 0.36, -0.18);

  const earGeo = new THREE.ConeGeometry(0.2, 0.72, 4);
  const leftEar = part(head, earGeo, material(colors[0]), -0.3, 0.87, -0.12);
  const rightEar = part(head, earGeo, material(colors[0]), 0.3, 0.87, -0.12);
  leftEar.rotation.z = 0.16;
  rightEar.rotation.z = -0.16;

  const eyes: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    part(head, new THREE.SphereGeometry(0.19, 12, 8), material(0xfffcf5), side * 0.26, 0.23, -0.58);
    const pupil = part(head, new THREE.SphereGeometry(0.085, 10, 6), material(0x241a38), side * 0.26, 0.23, -0.735);
    eyes.push(pupil);
  }
  for (const side of [-1, 1]) {
    part(head, new THREE.SphereGeometry(0.035, 8, 6), material(0x6d3552), side * 0.17, -0.1, -0.985);
  }

  const legs: THREE.Mesh[] = [];
  const legGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.66, 6);
  for (const x of [-0.4, 0.4]) {
    for (const z of [-0.42, 0.47]) {
      const leg = part(body, legGeo, material(colors[4]), x, 0.4, z);
      legs.push(leg);
      part(leg, new THREE.BoxGeometry(0.3, 0.16, 0.42), material(0x3b2b56), 0, -0.35, -0.07);
    }
  }

  const tail = part(body, new THREE.CylinderGeometry(0.055, 0.09, 0.85, 6), material(colors[1]), 0, 1.2, 1.03);
  tail.rotation.x = -0.85;
  part(tail, new THREE.ConeGeometry(0.2, 0.45, 7), material(colors[3]), 0, -0.53, 0);
  return { group, body, head, legs, eyes };
}

export type GuestKind = "guest" | "conga" | "cake" | "boss";

export interface GuestModel {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  hat: THREE.Mesh;
  arms: THREE.Mesh[];
  legs: THREE.Mesh[];
  mouth: THREE.Mesh;
}

export function createGuest(color = 0x61c9f2): GuestModel {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body, blobShadow(0.58));
  part(body, new THREE.CylinderGeometry(0.4, 0.53, 0.95, 8), material(color), 0, 0.95, 0);

  const head = new THREE.Group();
  head.position.set(0, 1.65, 0);
  body.add(head);
  part(head, new THREE.SphereGeometry(0.43, 12, 9), material(0xf3ad83), 0, 0, 0);
  for (const side of [-1, 1]) {
    part(head, new THREE.SphereGeometry(0.095, 9, 7), material(0xfffcf5), side * 0.16, 0.08, -0.36);
    part(head, new THREE.SphereGeometry(0.042, 8, 6), material(0x251d38), side * 0.16, 0.08, -0.438);
  }
  const mouth = part(head, new THREE.BoxGeometry(0.2, 0.07, 0.035), material(0x71364c), 0, -0.15, -0.414);

  const hat = part(head, new THREE.ConeGeometry(0.34, 0.9, 10), material(0xffd54a).clone(), 0, 0.72, 0);
  hat.rotation.z = 0.14;
  part(hat, new THREE.SphereGeometry(0.1, 8, 6), material(0xff4f91), 0, 0.49, 0);

  const arms: THREE.Mesh[] = [];
  const armGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.8, 7);
  for (const side of [-1, 1]) {
    const arm = part(body, armGeo, material(0xf3ad83), side * 0.5, 1.04, -0.12);
    arm.rotation.z = side * -0.55;
    arm.rotation.x = -0.45;
    arms.push(arm);
  }
  const legs: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const leg = part(body, new THREE.CylinderGeometry(0.11, 0.13, 0.62, 7), material(0x44345f), side * 0.23, 0.32, 0);
    legs.push(leg);
    part(leg, new THREE.BoxGeometry(0.3, 0.15, 0.46), material(0x272139), 0, -0.34, -0.1);
  }
  return { group, body, head, hat, arms, legs, mouth };
}

export function createCake(): GuestModel {
  const group = new THREE.Group();
  const body = new THREE.Group();
  group.add(body, blobShadow(1.25));
  part(body, new THREE.CylinderGeometry(1.02, 1.1, 0.62, 18), material(0xff8eae), 0, 0.64, 0);
  part(body, new THREE.CylinderGeometry(0.86, 0.94, 0.55, 18), material(0xfff0d0), 0, 1.19, 0);
  part(body, new THREE.CylinderGeometry(0.63, 0.75, 0.48, 18), material(0xff8eae), 0, 1.68, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    part(body, new THREE.SphereGeometry(0.12, 8, 6), material(0xffffff), Math.sin(a) * 0.88, 1.44, Math.cos(a) * 0.88);
  }
  const head = new THREE.Group();
  head.position.set(0, 1.15, -0.78);
  body.add(head);
  for (const side of [-1, 1]) {
    part(head, new THREE.SphereGeometry(0.19, 10, 8), material(0xffffff), side * 0.3, 0.18, -0.15);
    part(head, new THREE.SphereGeometry(0.085, 8, 6), material(0x2a1d38), side * 0.3, 0.18, -0.31);
  }
  const mouth = part(head, new THREE.BoxGeometry(0.48, 0.13, 0.08), material(0x702d50), 0, -0.18, -0.2);
  const hat = part(body, new THREE.ConeGeometry(0.11, 0.7, 8), material(0x63d9ff, 0.5, 0x164455), 0, 2.3, 0);
  part(hat, new THREE.SphereGeometry(0.12, 8, 6), material(0xffc63e, 0.4, 0xff8a00), 0, 0.43, 0);
  const arms: THREE.Mesh[] = [];
  const legs: THREE.Mesh[] = [];
  for (const x of [-0.75, 0.75]) {
    for (const z of [-0.55, 0.55]) {
      const wheel = part(body, new THREE.CylinderGeometry(0.29, 0.29, 0.2, 12), material(0x3c3154), x, 0.3, z);
      wheel.rotation.z = Math.PI / 2;
      legs.push(wheel);
    }
  }
  return { group, body, head, hat, arms, legs, mouth };
}

export interface CandyModel {
  group: THREE.Group;
  core: THREE.Mesh;
}

export function createCandy(): CandyModel {
  const group = new THREE.Group();
  const core = part(group, new THREE.BoxGeometry(0.34, 0.28, 0.42), material(0xffd348, 0.55, 0x4a2600).clone(), 0, 0, 0);
  core.rotation.y = Math.PI / 4;
  const wrapperGeo = new THREE.ConeGeometry(0.22, 0.28, 4);
  const left = part(group, wrapperGeo, material(0xff5f91), -0.31, 0, 0);
  const right = part(group, wrapperGeo, material(0xff5f91), 0.31, 0, 0);
  left.rotation.z = Math.PI / 2;
  right.rotation.z = -Math.PI / 2;
  group.scale.setScalar(0.85);
  return { group, core };
}

export interface GiftModel {
  group: THREE.Group;
  lid: THREE.Mesh;
  position: THREE.Vector3;
  active: boolean;
  respawn: number;
}

export function createGift(x: number, z: number, color: number): GiftModel {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  part(group, new THREE.BoxGeometry(1, 0.75, 1), material(color), 0, 0.4, 0);
  const lid = part(group, new THREE.BoxGeometry(1.12, 0.18, 1.12), material(0xffe66b), 0, 0.83, 0);
  part(group, new THREE.BoxGeometry(0.16, 0.86, 1.04), material(0xffe66b), 0, 0.43, 0);
  part(group, new THREE.BoxGeometry(1.04, 0.86, 0.16), material(0xffe66b), 0, 0.43, 0);
  const bow = part(group, new THREE.TorusGeometry(0.23, 0.07, 6, 12), material(0xffe66b), 0, 1.05, 0);
  bow.rotation.x = Math.PI / 2;
  group.add(blobShadow(0.65));
  return { group, lid, position: group.position, active: true, respawn: 0 };
}

export interface ChairModel {
  group: THREE.Group;
  ring: THREE.Mesh;
  position: THREE.Vector3;
}

function createChair(x: number, z: number, color: number): ChairModel {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  part(group, new THREE.BoxGeometry(0.9, 0.16, 0.9), material(color), 0, 0.72, 0);
  part(group, new THREE.BoxGeometry(0.9, 0.95, 0.15), material(color), 0, 1.15, 0.38);
  for (const px of [-0.34, 0.34]) {
    for (const pz of [-0.34, 0.34]) part(group, new THREE.CylinderGeometry(0.06, 0.08, 0.7, 6), material(0x5a4168), px, 0.35, pz);
  }
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.34, 32), basic(0x83ffd9, 0.72));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.045;
  ring.visible = false;
  group.add(ring);
  return { group, ring, position: group.position };
}

function labelSprite(text: string, color: string, background: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = background;
  ctx.beginPath();
  ctx.roundRect(4, 4, 760, 120, 32);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = "900 46px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 384, 66);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(6, 1, 1);
  sprite.renderOrder = 5;
  return sprite;
}

export interface ArenaModel {
  group: THREE.Group;
  station: THREE.Group;
  stationRing: THREE.Mesh;
  stationPosition: THREE.Vector3;
  gifts: GiftModel[];
  chairs: ChairModel[];
  balloons: THREE.Group[];
}

export function createArena(): ArenaModel {
  const group = new THREE.Group();
  const floor = part(group, new THREE.PlaneGeometry(28, 22), material(0xf8d9b8), 0, 0, 0);
  floor.rotation.x = -Math.PI / 2;

  const rug = part(group, new THREE.CircleGeometry(6.3, 48), material(0xf2a8bd), 0, 0.012, 0, 1, 1, 0.72);
  rug.rotation.x = -Math.PI / 2;
  const rugInner = part(group, new THREE.RingGeometry(4.8, 5.05, 48), basic(0xffe9b5, 0.8), 0, 0.022, 0, 1, 1, 0.72);
  rugInner.rotation.x = -Math.PI / 2;

  for (let x = -12; x <= 12; x += 2) {
    for (const z of [-10.35, 10.35]) {
      const post = part(group, new THREE.CylinderGeometry(0.07, 0.09, 1.25, 7), material(0xffffff), x, 0.62, z);
      post.rotation.z = Math.sin(x) * 0.025;
    }
  }
  for (const z of [-10.35, 10.35]) part(group, new THREE.BoxGeometry(26, 0.1, 0.1), material(0xffffff), 0, 0.78, z);

  const balloons: THREE.Group[] = [];
  const balloonColors = [0xff4f91, 0x6e63ed, 0x4fd6c2, 0xffc642];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const balloon = new THREE.Group();
    balloon.position.set(Math.sin(a) * 12.7, 0, Math.cos(a) * 9.7);
    part(balloon, new THREE.SphereGeometry(0.38, 12, 9), material(balloonColors[i % 4]), 0, 2.2 + (i % 3) * 0.3, 0, 1, 1.25, 1);
    part(balloon, new THREE.CylinderGeometry(0.012, 0.012, 2, 4), material(0x8d7188), 0, 1, 0);
    balloon.userData.phase = i * 0.71;
    group.add(balloon);
    balloons.push(balloon);
  }

  for (let i = 0; i < 21; i++) {
    const x = -12 + i * 1.2;
    const flag = part(group, new THREE.ConeGeometry(0.3, 0.65, 3), material(balloonColors[i % 4]), x, 3.7 + Math.sin(i * 0.6) * 0.18, -9.8);
    flag.rotation.z = Math.PI;
  }

  const confetti = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.018, 0.25), material(0xffffff), 120);
  const dummy = new THREE.Object3D();
  const colors = [new THREE.Color(0xff4f91), new THREE.Color(0x6e63ed), new THREE.Color(0x4fd6c2), new THREE.Color(0xffc642)];
  for (let i = 0; i < 120; i++) {
    const x = Math.sin(i * 91.733) * 12.5;
    const z = Math.cos(i * 47.121) * 9.4;
    dummy.position.set(x, 0.032, z);
    dummy.rotation.set(0, i * 2.39, 0);
    dummy.updateMatrix();
    confetti.setMatrixAt(i, dummy.matrix);
    confetti.setColorAt(i, colors[i % colors.length]);
  }
  confetti.instanceMatrix.needsUpdate = true;
  group.add(confetti);

  const station = new THREE.Group();
  station.position.set(0, 0, -8.15);
  part(station, new THREE.BoxGeometry(2.25, 1.8, 1.65), material(0x48cdbc), 0, 0.9, 0);
  part(station, new THREE.BoxGeometry(2.38, 0.18, 1.78), material(0xffe16b), 0, 1.72, 0);
  const handle = part(station, new THREE.TorusGeometry(0.63, 0.08, 8, 20, Math.PI), material(0x6b3f73), 0, 1.86, 0);
  handle.rotation.x = Math.PI / 2;
  const label = labelSprite("GOODY BAG • STAND TO BANK", "#fff9ed", "#4a2b66");
  label.position.set(0, 3, 0);
  station.add(label);
  const stationRing = new THREE.Mesh(new THREE.RingGeometry(1.55, 1.82, 40), basic(0x4dffdc, 0.68));
  stationRing.rotation.x = -Math.PI / 2;
  stationRing.position.y = 0.045;
  station.add(stationRing);
  group.add(station);

  const gifts = [
    createGift(-8.5, -5.8, 0x7868e9), createGift(8.5, -5.8, 0xff6b94),
    createGift(-9.2, 4.8, 0x54cfbe), createGift(9.2, 4.8, 0x7868e9),
    createGift(-4.8, 7.4, 0xff6b94), createGift(4.8, 7.4, 0x54cfbe),
  ];
  for (const gift of gifts) group.add(gift.group);

  const chairs = [
    createChair(-6.5, -2.5, 0x6b5bd2), createChair(6.5, -2.5, 0xff6b94),
    createChair(-6.5, 4.5, 0xff6b94), createChair(6.5, 4.5, 0x6b5bd2),
  ];
  for (const chair of chairs) group.add(chair.group);

  return { group, station, stationRing, stationPosition: station.position, gifts, chairs, balloons };
}

export function createTelegraphRing(radius: number, color: number): THREE.Mesh {
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 0.82, radius, 48), basic(color, 0.66));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.06;
  ring.visible = false;
  return ring;
}

export function createLaneTelegraph(): THREE.Mesh {
  const lane = new THREE.Mesh(new THREE.PlaneGeometry(27, 1.65), basic(0xff4f91, 0.28));
  lane.rotation.x = -Math.PI / 2;
  lane.position.y = 0.052;
  lane.visible = false;
  return lane;
}

export function createChargeTelegraph(): THREE.Mesh {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 14), basic(0xff4a69, 0.38));
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.055;
  line.visible = false;
  return line;
}

export function disposeModelCaches(): void {
  for (const mat of materialCache.values()) mat.dispose();
  for (const mat of basicCache.values()) mat.dispose();
  materialCache.clear();
  basicCache.clear();
}
