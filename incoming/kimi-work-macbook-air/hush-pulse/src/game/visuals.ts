import * as THREE from "three";
import { COLORS } from "./config";
import type { EnemyKind } from "./types";

export interface ActorVisual {
  group: THREE.Group;
  body: THREE.MeshStandardMaterial;
  accent: THREE.MeshBasicMaterial;
}

export function createPlayer() {
  const group = new THREE.Group();
  const coreMat = new THREE.MeshStandardMaterial({ color: COLORS.cyanHot, emissive: COLORS.cyan, emissiveIntensity: 2.3, roughness: 0.25, metalness: 0.5 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x10252b, emissive: 0x1b8f8a, emissiveIntensity: 0.8, metalness: 0.8, roughness: 0.3 });
  const glowMat = new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), coreMat);
  core.scale.set(0.75, 1.35, 0.75);
  group.add(core);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 6, 40), glowMat);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.025, 6, 32), glowMat.clone());
  ring2.rotation.set(0.35, 0, 0.8);
  group.add(ring2);
  for (let i = 0; i < 3; i++) {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.55, 3), darkMat);
    const a = i * Math.PI * 2 / 3;
    fin.position.set(Math.cos(a) * 0.57, -0.22, Math.sin(a) * 0.57);
    fin.rotation.z = Math.PI;
    group.add(fin);
  }
  const light = new THREE.PointLight(COLORS.cyan, 7, 8, 2);
  light.position.y = 1;
  group.add(light);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.72, 32), new THREE.MeshBasicMaterial({ color: 0x061417, transparent: true, opacity: 0.65, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.65;
  group.add(shadow);
  group.userData = { core, ring, ring2, shadow };
  return group;
}

export function createEnemyVisual(kind: EnemyKind): ActorVisual {
  const group = new THREE.Group();
  const palette = kind === "listener" ? COLORS.magenta : kind === "mimic" ? COLORS.violet : kind === "mute" ? 0x7050b8 : kind === "choir" ? COLORS.amber : COLORS.red;
  const body = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette).multiplyScalar(0.32),
    emissive: palette,
    emissiveIntensity: 0.35,
    roughness: 0.42,
    metalness: 0.48,
    transparent: true,
    opacity: 0.1,
  });
  const accent = new THREE.MeshBasicMaterial({ color: palette, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false, wireframe: kind === "mute" });
  if (kind === "listener") {
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(0.58, 0), body);
    torso.scale.set(0.8, 1.2, 0.8);
    group.add(torso);
    for (const side of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.09, 5, 14, Math.PI * 1.55), body);
      ear.position.set(side * 0.52, 0.18, 0);
      ear.rotation.set(Math.PI / 2, 0, side * 0.7);
      group.add(ear);
    }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.025, 4, 28), accent);
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -0.48;
    group.add(halo);
  } else if (kind === "mimic") {
    const torso = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.5, 5), body);
    torso.position.y = 0.1;
    group.add(torso);
    const eye = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), accent);
    eye.position.y = 0.4;
    group.add(eye);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 5, 24), accent);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
  } else if (kind === "mute") {
    const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(0.82, 1), body);
    torso.scale.y = 1.15;
    group.add(torso);
    const cage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), accent);
    group.add(cage);
    const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 5, 18), accent);
    mouth.position.set(0, 0, 0.77);
    group.add(mouth);
  } else if (kind === "choir") {
    const torso = new THREE.Mesh(new THREE.TetrahedronGeometry(0.53), body);
    torso.rotation.x = 0.4;
    group.add(torso);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 4, 12), accent);
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
  } else {
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 1.15, 2.3, 7), body);
    group.add(torso);
    for (const side of [-1, 1]) {
      const prong = new THREE.Mesh(new THREE.BoxGeometry(0.42, 2.8, 0.5), body);
      prong.position.set(side * 0.83, 1.5, 0);
      group.add(prong);
      const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), accent);
      tip.position.set(side * 0.83, 3, 0);
      group.add(tip);
    }
    for (let i = 0; i < 3; i++) {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(1.55 + i * 0.3, 0.045, 6, 40), accent);
      halo.rotation.set(Math.PI / 2 + i * 0.35, i * 0.4, 0);
      group.add(halo);
    }
    const crown = new THREE.Mesh(new THREE.OctahedronGeometry(0.58), accent);
    crown.position.y = 1.1;
    group.add(crown);
    group.scale.setScalar(1.08);
  }
  return { group, body, accent };
}

export function createProp(x: number, z: number, height: number, sides: number) {
  const group = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({ color: 0x101226, emissive: COLORS.violet, emissiveIntensity: 0.08, roughness: 0.68, metalness: 0.4, transparent: true, opacity: 0.08 });
  const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.85, height, sides), body);
  stone.position.y = height * 0.5;
  stone.rotation.y = x * 0.17 + z * 0.11;
  group.add(stone);
  const bandMat = body.clone();
  bandMat.emissive.setHex(COLORS.cyan);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.025, 4, sides * 3), bandMat);
  band.rotation.x = Math.PI / 2;
  band.position.y = height * 0.64;
  group.add(band);
  group.position.set(x, 0, z);
  return { group, materials: [body, bandMat] };
}

export function createDecoyVisual() {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: COLORS.amber, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const note = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), mat);
  note.scale.set(1.2, 0.7, 0.8);
  group.add(note);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), mat);
  stem.position.set(0.22, 0.45, 0);
  group.add(stem);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 5, 24), mat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.25;
  group.add(ring);
  return group;
}
