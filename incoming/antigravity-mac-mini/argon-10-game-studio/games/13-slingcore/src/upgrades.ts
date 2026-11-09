export type UpgradeId =
  | 'prism_split'
  | 'tether_wire'
  | 'gravity_coil'
  | 'wall_nova'
  | 'plasma_wake'
  | 'pinball_seeker'
  | 'orbital_glaives'
  | 'boomerang_snap'
  | 'vortex_finale';

export interface UpgradeCard {
  id: UpgradeId;
  title: string;
  description: string; // Strictly 1 sentence max (Rule 7)
  glyph: string;
}

export const UPGRADE_CATALOG: readonly UpgradeCard[] = [
  {
    id: 'prism_split',
    title: 'PRISM SPLIT',
    description: 'Launching fires two phantom twin cores at 24° angles that ricochet independently.',
    glyph: '⟁',
  },
  {
    id: 'tether_wire',
    title: 'TETHER WIRE',
    description: 'Your launch anchor stays behind and slices every enemy that crosses the wire between you.',
    glyph: '⚡',
  },
  {
    id: 'gravity_coil',
    title: 'GRAVITY COIL',
    description: 'Holding charge pulls nearby enemies into a tight cluster right in your firing path.',
    glyph: '◎',
  },
  {
    id: 'wall_nova',
    title: 'WALL NOVA',
    description: 'Every wall bounce erupts in a wide cyan shockwave that shatters nearby enemies.',
    glyph: '◈',
  },
  {
    id: 'plasma_wake',
    title: 'PLASMA WAKE',
    description: 'Your launch leaves a blazing cyan trail for 2 seconds that vaporizes pursuers.',
    glyph: '≋',
  },
  {
    id: 'pinball_seeker',
    title: 'PINBALL SEEKER',
    description: 'Smashing an enemy automatically ricochets you toward the nearest threat at full speed.',
    glyph: '⌖',
  },
  {
    id: 'orbital_glaives',
    title: 'ORBITAL GLAIVES',
    description: 'Two heavy cyan blades permanently orbit your core and expand outward while charging.',
    glyph: '❖',
  },
  {
    id: 'boomerang_snap',
    title: 'BOOMERANG SNAP',
    description: 'Clicking mid-flight snaps your core straight back through your cursor at double speed.',
    glyph: '↺',
  },
  {
    id: 'vortex_finale',
    title: 'VORTEX FINALE',
    description: 'Braking after a 3+ bounce chain spawns a singularity that pulls in and crushes foes.',
    glyph: '✹',
  },
];

export function rollUpgradeChoices(
  owned: ReadonlySet<UpgradeId>,
  rng: () => number,
  count = 3,
): UpgradeCard[] {
  const pool = UPGRADE_CATALOG.filter((u) => !owned.has(u.id));
  const source = pool.length >= count ? [...pool] : [...UPGRADE_CATALOG];
  const choices: UpgradeCard[] = [];
  while (choices.length < count && source.length > 0) {
    const idx = Math.floor(rng() * source.length);
    choices.push(source.splice(idx, 1)[0]);
  }
  return choices;
}
