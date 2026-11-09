export type UpgradeId =
  | 'prism_split'
  | 'tesla_chain'
  | 'gravity_well'
  | 'orbital_blades'
  | 'pinball_flippers'
  | 'chrono_echo'
  | 'supernova_recall'
  | 'wormhole_walls'
  | 'midas_pulse';

export interface UpgradeSpec {
  id: UpgradeId;
  name: string;
  tagline: string;
  ruleChange: string;
  color: string;
  accentColor: string;
  symbol: string;
}

export const UPGRADE_CATALOG: readonly UpgradeSpec[] = [
  {
    id: 'prism_split',
    name: 'PRISM BIFURCATION',
    tagline: 'SPLITTING PROJECTILES',
    ruleChange: 'Every 3rd bounce splits your Striker into a twin Phantom Ball that builds the same pot.',
    color: '#38bdf8',
    accentColor: '#e0f2fe',
    symbol: '⑂',
  },
  {
    id: 'tesla_chain',
    name: 'TESLA ARC COIL',
    tagline: 'CHAIN-LIGHTNING BOUNCES',
    ruleChange: 'Every peg hit arcs jagged lightning to the 2 nearest pegs for instant chain bounces.',
    color: '#22d3ee',
    accentColor: '#cffafe',
    symbol: '⚡',
  },
  {
    id: 'gravity_well',
    name: 'SINGULARITY ANCHOR',
    tagline: 'MAGNETIC GRAVITY WELL',
    ruleChange: 'Your 2nd bounce spawns a Black Hole Vortex that curves shots & pulls pegs into orbit.',
    color: '#c084fc',
    accentColor: '#f3e8ff',
    symbol: '◎',
  },
  {
    id: 'orbital_blades',
    name: 'SAWBLADE ORBITALS',
    tagline: 'EXPANDING PLASMA RING',
    ruleChange: '2 spinning plasma blades orbit your ball—their radius grows wider as your Multiplier climbs.',
    color: '#f472b6',
    accentColor: '#fce7f3',
    symbol: '❂',
  },
  {
    id: 'pinball_flippers',
    name: 'PLASMA FLIPPERS',
    tagline: 'AUTO-PARRY PADDLES',
    ruleChange: 'Twin pinball flippers at the bottom slap balls upward with +3x Mult & vent 25% Heat.',
    color: '#facc15',
    accentColor: '#fef9c3',
    symbol: '◢◣',
  },
  {
    id: 'chrono_echo',
    name: 'CHRONO-GHOST ECHO',
    tagline: 'TIME-LOOP AFTERIMAGE',
    ruleChange: 'Every launch replays a translucent Ghost Ball along your previous shot vector.',
    color: '#fb923c',
    accentColor: '#ffedd5',
    symbol: '⧗',
  },
  {
    id: 'supernova_recall',
    name: 'CLOTHESLINE BANK',
    tagline: 'LETHAL RECALL TETHER',
    ruleChange: 'Banking (Right-Click / Space) turns your recall tether into a laser beam that slices every peg in its path.',
    color: '#34d399',
    accentColor: '#d1fae5',
    symbol: '⟠',
  },
  {
    id: 'wormhole_walls',
    name: 'WORMHOLE PORTALS',
    tagline: 'WRAP-AROUND ARENA',
    ruleChange: 'Side arena walls become spatial portals—warping your ball across the board at 1.25x speed + 2x Mult.',
    color: '#818cf8',
    accentColor: '#e0e7ff',
    symbol: '∞',
  },
  {
    id: 'midas_pulse',
    name: 'MIDAS TRANSMUTER',
    tagline: 'HAZARD-TO-GOLD ALCHEMY',
    ruleChange: 'Banking a combo at x6+ Multiplier transmutes the nearest Red Hazard Saw into a Gold Jackpot Bumper.',
    color: '#fbbf24',
    accentColor: '#fef3c7',
    symbol: '👑',
  },
];

export function getUpgradeSpec(id: UpgradeId): UpgradeSpec {
  const found = UPGRADE_CATALOG.find((u) => u.id === id);
  if (!found) {
    return UPGRADE_CATALOG[0];
  }
  return found;
}
