import type { WaveDef } from "./types";
export const INPUT_CONFIG = { MOUSE_SENS_X: 0.0026, MOUSE_SENS_Y: 0.0022, INVERT_X: false, INVERT_Y: false } as const;
export const ARENA = 21;
export const MAX_ENEMIES = 56;
export const MAX_PLAYER_SHOTS = 180;
export const MAX_ENEMY_SHOTS = 220;
export const MAX_PICKUPS = 90;
export const MAX_PARTICLES = 360;
export const COLORS = { ink: 0x100d24, floorA: "#282145", floorB: "#322957", acid: 0xb8ff45, yellow: 0xffe45c, pink: 0xff4f9a, cyan: 0x52e5ff, red: 0xff4c4c, purple: 0x8c52ff, cream: 0xfff4d6 } as const;
export const WAVES: WaveDef[] = [
  { name: "PRODUCE AFTER DARK", subtitle: "The peas have unionized. Poorly.", quota: 14, interval: 0.75, kinds: ["pea", "pea", "lemon"] },
  { name: "DAIRY HAS OPINIONS", subtitle: "Pasteurized. Paranoid. Projectile-equipped.", quota: 20, interval: 0.64, kinds: ["pea", "lemon", "milk", "milk"] },
  { name: "BARON VON BREAKFAST", subtitle: "His chillingness will see you now.", quota: 1, interval: 1, kinds: [], boss: "fridge" },
  { name: "BAKED & CONFUSED", subtitle: "Baguettes are just swords with crumbs.", quota: 25, interval: 0.5, kinds: ["baguette", "pea", "milk", "lemon"] },
  { name: "LOSS PREVENTION", subtitle: "Please retain all limbs inside the audit.", quota: 30, interval: 0.44, kinds: ["auditor", "baguette", "milk", "lemon"] },
  { name: "THE WITCHING HOUR", subtitle: "Everything is reduced. Especially life expectancy.", quota: 38, interval: 0.34, kinds: ["auditor", "baguette", "milk", "lemon", "pea"] },
  { name: "THE REGIONAL MANAGER", subtitle: "Your performance review will be terminal.", quota: 1, interval: 1, kinds: [], boss: "manager" },
];
export const DEFAULT_STATS = { maxHp: 100, speed: 7.2, damage: 17, fireRate: 5.3, projectileSpeed: 18, multishot: 1, pierce: 0, magnet: 3.3, armor: 0, dashDamage: 28, explosive: 0, orbitals: 0, drones: 0, revive: 0, couponBonus: 1, burn: 0 } as const;
export function mulberry32(seed: number): () => number { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)); }
