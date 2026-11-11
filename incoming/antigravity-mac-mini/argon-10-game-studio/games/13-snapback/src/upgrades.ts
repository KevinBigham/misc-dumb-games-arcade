export type UpgradeId =
  | 'echo_anchor'
  | 'gravity_coil'
  | 'wall_splitter'
  | 'blast_brake'
  | 'magnetic_ricochet'
  | 'laser_wake'
  | 'domino_bowling'
  | 'corner_nova'
  | 'orbit_blades';

export interface UpgradeSpec {
  readonly id: UpgradeId;
  readonly name: string;
  readonly glyph: string;
  /** Strictly 1 sentence max per card that visibly alters how shots/movement behave. */
  readonly description: string;
}

export const UPGRADE_CATALOG: readonly UpgradeSpec[] = [
  {
    id: 'echo_anchor',
    name: 'TETHER ECHO',
    glyph: '⚓',
    description:
      'Leave a cyan anchor at your launch point that snaps back to you on your first bounce, crushing enemies between you.',
  },
  {
    id: 'gravity_coil',
    name: 'GRAVITY VORTEX',
    glyph: '🌀',
    description:
      'Holding a charge pulls nearby enemies into a tight cluster along your aim line.',
  },
  {
    id: 'wall_splitter',
    name: 'PRISM SHARDS',
    glyph: '💠',
    description:
      'Every wall bounce fires two piercing kinetic bolts back into the arena.',
  },
  {
    id: 'blast_brake',
    name: 'SHOCKWAVE BRAKE',
    glyph: '💥',
    description:
      'Slamming the brakes to start a charge unleashes a repulsor ring that hurls nearby enemies into walls.',
  },
  {
    id: 'magnetic_ricochet',
    name: 'SEEKING BANK',
    glyph: '🧲',
    description:
      'Bouncing off any wall or bumper bends your trajectory directly toward the nearest enemy.',
  },
  {
    id: 'laser_wake',
    name: 'PLASMA WIRE',
    glyph: '⚡',
    description:
      'Your snap-launch leaves a searing electric tether line on the floor that slices enemies for 3 seconds.',
  },
  {
    id: 'domino_bowling',
    name: 'DOMINO LAUNCH',
    glyph: '🎳',
    description:
      'Enemies you strike launch across the arena as flaming bowling balls that shatter other enemies.',
  },
  {
    id: 'corner_nova',
    name: 'RICOCHET NOVA',
    glyph: '☀️',
    description:
      'Every second bounce in a single launch detonates a massive golden shockwave around your core.',
  },
  {
    id: 'orbit_blades',
    name: 'SWEET-SPOT SAWS',
    glyph: '⚙️',
    description:
      'Releasing inside the golden Sweet-Spot spawns two wide orbiting energy saws for your entire flight.',
  },
];

export function pickThreeUpgrades(
  owned: ReadonlySet<UpgradeId>,
  rngNext: () => number
): UpgradeSpec[] {
  const available = UPGRADE_CATALOG.filter((u) => !owned.has(u.id));
  const pool = available.length >= 3 ? [...available] : [...UPGRADE_CATALOG];
  const chosen: UpgradeSpec[] = [];

  while (chosen.length < 3 && pool.length > 0) {
    const idx = Math.floor(rngNext() * pool.length) % pool.length;
    chosen.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return chosen;
}
