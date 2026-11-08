import * as THREE from "three";

export type GameMode = "title" | "playing" | "upgrade" | "paused" | "gameover" | "victory";
export type EnemyKind = "listener" | "mimic" | "mute" | "choir" | "conductor";

export interface Enemy {
  id: number; active: boolean; kind: EnemyKind; group: THREE.Group;
  body: THREE.MeshStandardMaterial; accent: THREE.MeshBasicMaterial;
  x: number; z: number; vx: number; vz: number; hp: number; maxHp: number; radius: number; speed: number;
  reveal: number; resonant: number; heard: number; targetX: number; targetZ: number;
  state: "spawn" | "idle" | "windup" | "lunge" | "recover"; stateTime: number;
  attackCd: number; specialCd: number; flash: number; seed: number; lastPulse: number; bossPhase: number; worth: number;
}

export interface Projectile {
  active: boolean; mesh: THREE.Mesh; x: number; z: number; vx: number; vz: number;
  life: number; friendly: boolean; damage: number; radius: number;
}

export interface Pulse {
  active: boolean; mesh: THREE.Mesh; material: THREE.MeshBasicMaterial; x: number; z: number;
  age: number; previousRadius: number; radius: number; maxRadius: number; speed: number;
  damage: number; hostile: boolean; hitPlayer: boolean; id: number;
}

export interface Decoy { active: boolean; group: THREE.Group; x: number; z: number; age: number; pulseTimer: number; }
export interface Hazard { active: boolean; mesh: THREE.Mesh; material: THREE.MeshBasicMaterial; x: number; z: number; age: number; delay: number; radius: number; damage: number; }
export interface Prop { x: number; z: number; radius: number; reveal: number; group: THREE.Group; materials: THREE.MeshStandardMaterial[]; }
export interface RunStats { score: number; kills: number; resonantKills: number; bestCombo: number; elapsed: number; pulses: number; damageTaken: number; }
export interface Upgrade { id: string; name: string; kicker: string; description: string; apply: () => void; }
export interface SaveData { version: 1; bestScore: number; wins: number; runs: number; }
