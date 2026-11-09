import type * as THREE from "three";

export type GameMode = "title" | "playing" | "paused" | "upgrade" | "gameover" | "victory";
export type FormKind = "standard" | "urgent" | "carbon" | "classified" | "golden";
export type LawId = "walls" | "friction" | "adhesive" | "fan" | "duck" | "jelly" | "duplicate" | "tray" | "hole" | "lunch" | "coffee" | "birthday";

export interface Form {
  active: boolean; kind: FormKind;
  x: number; z: number; vx: number; vz: number; rot: number; vr: number;
  deadline: number; maxDeadline: number; stamped: boolean; split: boolean; seed: number;
  visual: THREE.Group; deadlineBar: THREE.Mesh;
}
export interface Prop {
  kind: "stapler" | "duck" | "calculator";
  x: number; z: number; homeX: number; homeZ: number; vx: number; vz: number;
  cooldown: number; telegraph: number; visual: THREE.Group;
}
export interface PlayerState {
  x: number; y: number; z: number; vx: number; vy: number; vz: number;
  aimX: number; aimZ: number; charge: number; charging: boolean; airborne: boolean;
  lastPower: number; invulnerable: number;
}
export interface BossState {
  active: boolean; x: number; z: number; vx: number; vz: number; hp: number; maxHp: number;
  attackTimer: number; telegraph: number; targetX: number; targetZ: number; stunned: number; phase: number;
  visual: THREE.Group;
}
export interface RunStats {
  score: number; banked: number; stamped: number; bestCombo: number; strikes: number; shreds: number;
  ducks: number; calculators: number; biggestStack: number; elapsed: number; departments: number;
}
export interface UpgradeDef { id: string; icon: string; name: string; description: string; flavor: string; max: number }
export interface LawDef { id: LawId; title: string; detail: string; duration: number; helpful?: boolean }
export interface SaveData { version: 1; best: number; wins: number; runs: number; muted: boolean; shake: boolean }
export interface GameSnapshot {
  mode: GameMode; department: number; score: number; quota: number; quotaTarget: number;
  combo: number; stack: number; stackMax: number; strikes: number; charge: number;
  bossHp: number; bossMaxHp: number; fps: number; calls: number; triangles: number; entities: number;
}
