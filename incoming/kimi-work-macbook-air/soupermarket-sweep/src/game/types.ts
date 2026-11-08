import * as THREE from "three";
export type GameMode = "title" | "playing" | "paused" | "upgrade" | "gameover" | "victory" | "help";
export type EnemyKind = "pea" | "lemon" | "milk" | "baguette" | "auditor" | "fridge" | "manager";
export type Quality = "high" | "low";
export interface SaveData { version: 1; highScore: number; bestWave: number; runs: number; wins: number; banana: boolean; nightmareUnlocked: boolean; quality: Quality }
export interface PlayerStats { maxHp: number; speed: number; damage: number; fireRate: number; projectileSpeed: number; multishot: number; pierce: number; magnet: number; armor: number; dashDamage: number; explosive: number; orbitals: number; drones: number; revive: number; couponBonus: number; burn: number }
export interface Player { group: THREE.Group; pos: THREE.Vector3; vel: THREE.Vector3; aim: THREE.Vector3; hp: number; invulnerable: number; fireTimer: number; dashTimer: number; dashCooldown: number; scream: number; coupons: number; score: number; kills: number; combo: number; comboTimer: number; dashHits: Set<number>; stats: PlayerStats }
export interface Enemy { id: number; kind: EnemyKind; group: THREE.Group; pos: THREE.Vector3; vel: THREE.Vector3; hp: number; maxHp: number; radius: number; speed: number; attack: number; special: number; phase: number; timer: number; hit: number; burn: number; burnTick: number; value: number; points: number; dead: boolean; summoned: boolean }
export interface Projectile { active: boolean; pos: THREE.Vector3; vel: THREE.Vector3; life: number; radius: number; damage: number; pierce: number; burn: number }
export interface Pickup { active: boolean; pos: THREE.Vector3; vel: THREE.Vector3; value: number; life: number; banana: boolean }
export interface Particle { active: boolean; pos: THREE.Vector3; vel: THREE.Vector3; life: number; maxLife: number; size: number; color: THREE.Color }
export interface Hazard { mesh: THREE.Mesh; pos: THREE.Vector3; radius: number; timer: number; duration: number; damage: number; friendly: boolean; fired: boolean }
export interface UpgradeDef { id: string; icon: string; name: string; description: string; flavor: string; max: number; apply: (player: Player) => void }
export interface WaveDef { name: string; subtitle: string; quota: number; interval: number; kinds: EnemyKind[]; boss?: EnemyKind }
