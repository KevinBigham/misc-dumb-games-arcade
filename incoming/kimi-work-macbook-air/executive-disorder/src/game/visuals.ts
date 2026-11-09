import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { COLORS, WORLD } from "./config";
import type { FormKind } from "./types";
const mat = (color: number, roughness = 0.78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const M = {
  ink: mat(COLORS.ink), paper: mat(COLORS.paper), coral: mat(COLORS.coral), coralDark: mat(COLORS.coralDark),
  mint: mat(COLORS.mint, 0.55), yellow: mat(COLORS.yellow), blue: mat(COLORS.blue), purple: mat(COLORS.purple),
  wood: mat(0x9a623f), metal: mat(0x9aa7b7, 0.3, 0.65), white: mat(0xffffff), black: mat(0x101522),
  red: mat(COLORS.red), coffee: mat(0x56392e), green: mat(0x3ba77d),
};
function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const result = new THREE.Mesh(geometry, material); result.position.set(x, y, z); result.castShadow = true; result.receiveShadow = true; return result;
}
function box(w: number, h: number, d: number, material: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh { return mesh(new THREE.BoxGeometry(w, h, d), material, x, y, z); }
function eye(x: number, y: number, z: number, scale = 1): THREE.Group {
  const group = new THREE.Group();
  const white = mesh(new THREE.SphereGeometry(0.13 * scale, 12, 8), M.white, x, y, z); white.scale.set(1, 1.1, 0.55);
  const pupil = mesh(new THREE.SphereGeometry(0.055 * scale, 10, 6), M.black, x, y, z + 0.075 * scale);
  group.add(white, pupil); group.userData.pupil = pupil; group.userData.baseX = x; return group;
}
export function createTextLabel(text: string, color = "#172033", background = "transparent", width = 512, height = 128): THREE.Mesh {
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, width, height); if (background !== "transparent") { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
  ctx.fillStyle = color; ctx.font = `900 ${Math.floor(height * 0.56)}px Arial`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, width / 2, height / 2);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  const label = mesh(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })); label.castShadow = false; return label;
}
export function createDesk(scene: THREE.Scene): { tray: THREE.Group; fan: THREE.Group; hole: THREE.Mesh; coffee: THREE.Mesh } {
  const desk = box(WORLD.halfW * 2 + 1.2, 0.65, WORLD.halfH * 2 + 1.2, mat(COLORS.desk), 0, -0.37, 0); desk.receiveShadow = true; desk.castShadow = false; scene.add(desk);
  scene.add(box(WORLD.halfW * 2 + 1.45, 0.28, WORLD.halfH * 2 + 1.45, mat(COLORS.deskEdge), 0, -0.72, 0));
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xbda98a, transparent: true, opacity: 0.2 });
  for (let i = -5; i <= 5; i++) { const line = box(0.018, 0.008, WORLD.halfH * 2 - 0.8, lineMat, i * 2.35, 0.002, 0); line.castShadow = false; scene.add(line); }
  for (let i = -3; i <= 3; i++) { const line = box(WORLD.halfW * 2 - 0.8, 0.008, 0.018, lineMat, 0, 0.003, i * 2.35); line.castShadow = false; scene.add(line); }
  const tray = new THREE.Group();
  tray.add(box(3.1, 0.18, 2.7, M.mint, 0, 0.1, 0), box(3.25, 0.42, 0.16, M.green, 0, 0.3, -1.32), box(3.25, 0.42, 0.16, M.green, 0, 0.3, 1.32), box(0.16, 0.42, 2.5, M.green, -1.55, 0.3, 0), box(0.16, 0.42, 2.5, M.green, 1.55, 0.3, 0));
  const out = createTextLabel("OUT", "#173a32"); out.rotation.x = -Math.PI / 2; out.position.y = 0.205; out.scale.set(0.72, 0.72, 0.72); tray.add(out); scene.add(tray);
  const fan = new THREE.Group(); fan.add(mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.4, 16), M.metal, 0, 0.22, 0));
  const blades = new THREE.Group();
  for (let i = 0; i < 4; i++) { const blade = box(2.7, 0.08, 0.52, M.blue, 1.25, 0, 0); blade.rotation.y = i * Math.PI / 2; blades.add(blade); }
  blades.position.y = 0.55; fan.add(blades); fan.userData.blades = blades; fan.position.set(0, 0, -7.3); fan.visible = false; scene.add(fan);
  const hole = mesh(new THREE.CylinderGeometry(1.35, 1.05, 0.12, 40), M.black, 7.4, 0.02, -3.4);
  const rim = mesh(new THREE.TorusGeometry(1.34, 0.09, 8, 40), M.purple, 0, 0.08, 0); rim.rotation.x = Math.PI / 2; hole.add(rim); hole.visible = false; scene.add(hole);
  const coffee = mesh(new THREE.CylinderGeometry(1.65, 1.8, 0.035, 36), M.coffee, -6.3, 0.018, 2.8); coffee.scale.set(1.25, 1, 0.72); coffee.visible = false; scene.add(coffee);
  return { tray, fan, hole, coffee };
}
export function createPlayer(): THREE.Group {
  const group = new THREE.Group();
  const rubber = mesh(new THREE.CylinderGeometry(0.82, 0.9, 0.36, 24), M.coralDark, 0, 0.18, 0);
  const rim = mesh(new THREE.TorusGeometry(0.78, 0.08, 8, 24), M.coral, 0, 0.37, 0); rim.rotation.x = Math.PI / 2;
  const stem = mesh(new THREE.CylinderGeometry(0.28, 0.4, 0.8, 18), M.wood, 0, 0.78, 0);
  const handle = mesh(new THREE.SphereGeometry(0.58, 20, 14), M.coral, 0, 1.22, 0); handle.scale.set(1, 0.75, 0.86);
  const stack = new THREE.Group(); stack.position.set(0, 0.52, -0.28);
  group.add(rubber, rim, stem, handle, eye(-0.21, 1.34, 0.42, 1.05), eye(0.21, 1.34, 0.42, 1.05), stack);
  group.userData.stack = stack; group.userData.handle = handle; return group;
}
const formColors: Record<FormKind, number> = { standard: COLORS.paper, urgent: COLORS.yellow, carbon: COLORS.blue, classified: 0xf7b5c0, golden: 0xffdc68 };
const mergedFormMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78 });
export function createForm(kind: FormKind): { visual: THREE.Group; deadlineBar: THREE.Mesh } {
  const parts: THREE.BufferGeometry[] = [];
  const add = (geometry: THREE.BufferGeometry, color: number, x: number, y: number, z: number, ry = 0) => {
    if (geometry.index) { const indexed = geometry; geometry = geometry.toNonIndexed(); indexed.dispose(); }
    if (ry) geometry.rotateY(ry);
    geometry.translate(x, y, z);
    const c = new THREE.Color(color), colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) { colors[i] = c.r; colors[i + 1] = c.g; colors[i + 2] = c.b; }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    parts.push(geometry);
  };
  const addBox = (w: number, h: number, d: number, color: number, x: number, y: number, z: number, ry = 0) => add(new THREE.BoxGeometry(w, h, d), color, x, y, z, ry);
  addBox(1.45, 0.09, 1.82, formColors[kind], 0, 0.1, 0);
  const lineColor = kind === "classified" ? COLORS.red : COLORS.ink;
  for (let i = 0; i < 3; i++) addBox(i === 2 ? 0.52 : 0.82, 0.025, 0.055, lineColor, -0.12, 0.16, -0.46 + i * 0.27);
  for (const side of [-1, 1]) {
    const white = new THREE.SphereGeometry(0.105, 10, 7); white.scale(1, 1.1, 0.55); add(white, 0xffffff, side * 0.25, 0.29, 0.53);
    const pupil = new THREE.SphereGeometry(0.045, 8, 6); add(pupil, 0x101522, side * 0.25, 0.3, 0.595);
  }
  addBox(1.18, 0.035, 0.09, COLORS.ink, 0, 0.18, -0.78);
  if (kind === "classified") addBox(1.52, 0.035, 0.25, COLORS.red, 0, 0.19, 0.04, -0.35);
  if (kind === "golden") add(new THREE.OctahedronGeometry(0.22, 0), 0xffffff, 0.47, 0.28, -0.25);
  const geometry = mergeGeometries(parts, false)!;
  for (const part of parts) part.dispose();
  const staticMesh = mesh(geometry, mergedFormMaterial);
  staticMesh.castShadow = false;
  const bar = box(1.12, 0.045, 0.065, kind === "urgent" ? M.red : M.green, 0, 0.205, -0.78);
  bar.geometry.translate(0.56, 0, 0); bar.position.x = -0.56; bar.castShadow = false;
  const group = new THREE.Group(); group.add(staticMesh, bar);
  return { visual: group, deadlineBar: bar };
}
export function createTrayTarget(): THREE.Group {
  const ring = mesh(new THREE.RingGeometry(1.55, 1.72, 40), new THREE.MeshBasicMaterial({ color: COLORS.mint, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.04; const group = new THREE.Group(); group.add(ring); return group;
}
export function createAimReticle(): THREE.Group {
  const group = new THREE.Group(); const ring = mesh(new THREE.RingGeometry(0.5, 0.59, 32), new THREE.MeshBasicMaterial({ color: COLORS.coral, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; group.add(ring);
  for (let i = 0; i < 4; i++) { const tick = box(0.28, 0.025, 0.055, M.coral); tick.rotation.y = i * Math.PI / 2; tick.position.set(Math.cos(i * Math.PI / 2) * 0.78, 0, Math.sin(i * Math.PI / 2) * 0.78); group.add(tick); }
  group.position.y = 0.06; return group;
}
export function createTelegraph(): THREE.Mesh {
  const ring = mesh(new THREE.RingGeometry(0.82, 1, 48), new THREE.MeshBasicMaterial({ color: COLORS.red, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.055; ring.visible = false; return ring;
}
export function createStapler(): THREE.Group {
  const group = new THREE.Group(); group.add(box(1.55, 0.18, 0.65, M.ink, 0, 0.1, 0));
  const top = box(1.48, 0.32, 0.58, M.red, 0.05, 0.42, -0.03); top.rotation.z = -0.1; group.add(top, box(0.4, 0.08, 0.48, M.metal, 0.65, 0.22, 0)); group.userData.top = top; return group;
}
export function createDuck(): THREE.Group {
  const group = new THREE.Group(); const body = mesh(new THREE.SphereGeometry(0.55, 18, 12), M.yellow, 0, 0.5, 0); body.scale.set(1.1, 0.8, 0.85);
  const head = mesh(new THREE.SphereGeometry(0.34, 16, 12), M.yellow, 0.35, 0.98, 0.12); const beak = mesh(new THREE.ConeGeometry(0.18, 0.42, 4), M.coral, 0.64, 0.94, 0.15); beak.rotation.z = -Math.PI / 2;
  group.add(body, head, beak, eye(0.42, 1.08, 0.39, 0.65)); return group;
}
export function createCalculator(): THREE.Group {
  const group = new THREE.Group(); group.add(box(1.5, 0.3, 1.85, M.ink, 0, 0.16, 0), box(1.12, 0.05, 0.36, M.mint, 0, 0.34, -0.54));
  for (let x = -1; x <= 1; x++) for (let z = 0; z < 3; z++) group.add(box(0.27, 0.09, 0.24, (x + z) % 3 === 0 ? M.coral : M.paper, x * 0.38, 0.36, -0.05 + z * 0.39));
  return group;
}
export function createBoss(): THREE.Group {
  const group = new THREE.Group(); group.add(box(3.4, 0.85, 3.8, M.ink, 0, 0.48, 0), box(2.7, 0.12, 0.68, M.mint, 0, 0.96, -1.25));
  for (let x = -2; x <= 2; x++) for (let z = 0; z < 3; z++) group.add(box(0.42, 0.14, 0.38, (x + z) % 4 === 0 ? M.red : M.paper, x * 0.52, 0.99, -0.4 + z * 0.58));
  const left = eye(-0.62, 1.12, -1.28, 1.55), right = eye(0.62, 1.12, -1.28, 1.55); left.rotation.x = -Math.PI / 2; right.rotation.x = -Math.PI / 2; group.add(left, right);
  const browL = box(0.75, 0.12, 0.12, M.red, -0.62, 1.27, -1.28), browR = box(0.75, 0.12, 0.12, M.red, 0.62, 1.27, -1.28); browL.rotation.z = -0.28; browR.rotation.z = 0.28; group.add(browL, browR);
  group.visible = false; return group;
}
