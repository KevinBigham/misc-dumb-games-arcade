export type MechId = 'valkyrie' | 'hellforge' | 'chronos';

export interface MechSpec {
  id: MechId;
  codeName: string;
  title: string;
  role: string;
  accentColor: string;
  secondaryColor: string;
  maxHp: number;
  maxShield: number;
  moveSpeed: number;
  dashCooldown: number;
  dashDistance: number;
  primaryName: string;
  primaryDesc: string;
  fireRate: number; // shots per second
  baseDamage: number;
  projectileSpeed: number;
  heatPerShot: number;
  altName: string;
  altDesc: string;
  altCooldown: number;
  ultimateName: string;
  ultimateDesc: string;
}

export const MECH_SPECS: Record<MechId, MechSpec> = {
  valkyrie: {
    id: 'valkyrie',
    codeName: 'STRIKER-09',
    title: 'VALKYRIE',
    role: 'Agile Blade & Bullet-Parry Striker',
    accentColor: '#00f2fe',
    secondaryColor: '#ff0844',
    maxHp: 130,
    maxShield: 75,
    moveSpeed: 365,
    dashCooldown: 1.15,
    dashDistance: 215,
    primaryName: 'Twin Pulse Repeaters',
    primaryDesc: 'High-velocity dual plasma streams with tight spread and rapid heat venting.',
    fireRate: 11.5,
    baseDamage: 16,
    projectileSpeed: 980,
    heatPerShot: 2.3,
    altName: 'Plasma Katana Arc (Right-Click / E)',
    altDesc: 'Cleaves enemies in a 150° arc and DEFLECTS all enemy projectiles back at 300% damage.',
    altCooldown: 1.5,
    ultimateName: 'OMEGA BLADESTORM (Q)',
    ultimateDesc: 'Unleashes 24 homing plasma slashes and resets all dash cooldowns for 5 seconds.',
  },
  hellforge: {
    id: 'hellforge',
    codeName: 'TITAN-X',
    title: 'HELLFORGE',
    role: 'Siege Dreadnought & Gravity Mortar',
    accentColor: '#ff6a00',
    secondaryColor: '#ffcc00',
    maxHp: 210,
    maxShield: 110,
    moveSpeed: 295,
    dashCooldown: 1.55,
    dashDistance: 185,
    primaryName: 'Vulcan Rotary Cannon',
    primaryDesc: 'Spools up to blistering fire rates as heat rises, shredding armored hulls.',
    fireRate: 15.0,
    baseDamage: 14,
    projectileSpeed: 880,
    heatPerShot: 1.75,
    altName: 'Singularity Mortar (Right-Click / E)',
    altDesc: 'Launches a gravitational black hole that warps the grid and crushes enemies inward.',
    altCooldown: 3.2,
    ultimateName: 'ORBITAL ION CATACLYSM (Q)',
    ultimateDesc: 'Calls down 5 massive orbital plasma pillars that vaporize everything in their radius.',
  },
  chronos: {
    id: 'chronos',
    codeName: 'SPECTRE-7',
    title: 'CHRONOS',
    role: 'Railgun Sniper & Time-Warp Tactician',
    accentColor: '#b721ff',
    secondaryColor: '#21d4fd',
    maxHp: 115,
    maxShield: 110,
    moveSpeed: 345,
    dashCooldown: 1.25,
    dashDistance: 230,
    primaryName: 'Hyper-Velocity Railgun',
    primaryDesc: 'Instantaneous hitscan-speed piercing beam that punches through every target in line.',
    fireRate: 3.4,
    baseDamage: 62,
    projectileSpeed: 1850,
    heatPerShot: 7.5,
    altName: 'Chrono-Stasis Matrix (Right-Click / E)',
    altDesc: 'Deploys a temporal distortion dome that freezes enemy bullets and amplifies crit damage.',
    altCooldown: 3.8,
    ultimateName: 'SINGULARITY OVERCLOCK (Q)',
    ultimateDesc: 'Triggers 6 seconds of global Witch-Time + summons 4 autonomous orbital laser drones.',
  },
};

export interface ActiveVentResult {
  outcome: 'perfect' | 'good' | 'jammed' | 'normal';
  overchargeDuration: number;
  lockoutDuration: number;
}

/**
 * Gears-of-War style Active Heat Venting mechanic:
 * Pressing [R] when heat >= 45% triggers a timing check in the Sweet Spot [0.62, 0.84].
 */
export function evaluateActiveVent(heatRatio: number, sweetSpotCursor: number): ActiveVentResult {
  if (heatRatio < 0.35) {
    return { outcome: 'normal', overchargeDuration: 0, lockoutDuration: 0 };
  }
  if (sweetSpotCursor >= 0.65 && sweetSpotCursor <= 0.80) {
    return { outcome: 'perfect', overchargeDuration: 4.5, lockoutDuration: 0 };
  }
  if (sweetSpotCursor >= 0.55 && sweetSpotCursor <= 0.88) {
    return { outcome: 'good', overchargeDuration: 2.0, lockoutDuration: 0 };
  }
  return { outcome: 'jammed', overchargeDuration: 0, lockoutDuration: 1.25 };
}
