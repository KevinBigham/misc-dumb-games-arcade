export type AstralSocketNodeType =
  | 'PRISM_SPLITTER'
  | 'TESLA_PYLON'
  | 'GRAVITY_WELL'
  | 'FORGE_ANVIL'
  | 'WORMHOLE_RELAY'
  | 'HARMONIC_BELL';

export interface AstralSocketBlueprint {
  type: AstralSocketNodeType;
  name: string;
  shortLabel: string;
  symbol: string;
  costStardust: number;
  radius: number;
  elasticity: number;
  baseChipsBonus: number;
  comboMultBonus: number;
  color: string;
  glowColor: string;
  summary: string;
  synergyTip: string;
}

export const ASTRAL_SOCKET_BLUEPRINTS: Record<AstralSocketNodeType, AstralSocketBlueprint> = {
  PRISM_SPLITTER: {
    type: 'PRISM_SPLITTER',
    name: 'Bifrost Prism Gate',
    shortLabel: 'Prism Gate',
    symbol: '❖',
    costStardust: 45,
    radius: 24,
    elasticity: 1.08,
    baseChipsBonus: 18,
    comboMultBonus: 0.35,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.45)',
    summary: 'Splits a striking comet into 2 chromatic twin comets (+18 Chips, +0.35× Mult).',
    synergyTip: 'Place in upper-mid sockets so split comets cascade through Tesla Pylons below.',
  },
  TESLA_PYLON: {
    type: 'TESLA_PYLON',
    name: 'Tesla Resonance Pylon',
    shortLabel: 'Tesla Pylon',
    symbol: '⚡',
    costStardust: 40,
    radius: 22,
    elasticity: 1.15,
    baseChipsBonus: 26,
    comboMultBonus: 0.5,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    summary: 'Arcs chain-lightning to up to 3 Boss Nodes/Meteors on hit (+26 Chips, +0.50× Mult).',
    synergyTip: 'Pairs explosively with Bifrost Prisms—multiball hits trigger rapid-fire lightning storms.',
  },
  GRAVITY_WELL: {
    type: 'GRAVITY_WELL',
    name: 'Kerr Micro-Singularity',
    shortLabel: 'Gravity Well',
    symbol: '🌀',
    costStardust: 50,
    radius: 26,
    elasticity: 1.22,
    baseChipsBonus: 22,
    comboMultBonus: 0.65,
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.48)',
    summary: 'Curves nearby comets into a relativistic orbital slingshot (+32% speed, +0.65× Mult).',
    synergyTip: 'Bends trajectories around Boss shield rings to snipe exposed rear weak points.',
  },
  FORGE_ANVIL: {
    type: 'FORGE_ANVIL',
    name: 'Solar Forge Anvil',
    shortLabel: 'Forge Anvil',
    symbol: '🔥',
    costStardust: 35,
    radius: 25,
    elasticity: 1.32,
    baseChipsBonus: 38,
    comboMultBonus: 0.25,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    summary: 'High-impulse kinetic anvil that permanently temper-forges the comet (+14 permanent Comet Chips).',
    synergyTip: 'Hit early in a volley so every subsequent bounce multiplies a higher Base Chip value.',
  },
  WORMHOLE_RELAY: {
    type: 'WORMHOLE_RELAY',
    name: 'Ouroboros Wormhole Portal',
    shortLabel: 'Wormhole',
    symbol: '⏳',
    costStardust: 55,
    radius: 24,
    elasticity: 1.18,
    baseChipsBonus: 20,
    comboMultBonus: 0.85,
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    summary: 'Teleports comets straight back to the Zenith Crown above the Boss (+0.85× Combo Mult).',
    synergyTip: 'Wire into lower flank sockets to rescue draining comets and sustain 50+ bounce loops!',
  },
  HARMONIC_BELL: {
    type: 'HARMONIC_BELL',
    name: 'Celestial Bell Condenser',
    shortLabel: 'Harmonic Bell',
    symbol: '🔔',
    costStardust: 50,
    radius: 24,
    elasticity: 1.2,
    baseChipsBonus: 30,
    comboMultBonus: 0.55,
    color: '#fde047',
    glowColor: 'rgba(253, 224, 71, 0.45)',
    summary: 'Rings a Lydian chord; every 3rd hit unleashes a full-table Sonic Nova (240 AoE damage + clears hazards).',
    synergyTip: 'Essential against Sector III Drone Swarms and Sector IV Hawking Lances.',
  },
};

export interface AstralSocketSlotTemplate {
  slotIndex: number;
  label: string;
  x: number;
  y: number;
  zone: 'UPPER_CROWN' | 'MID_CRUCIBLE' | 'LOWER_SLING';
  defaultType: AstralSocketNodeType | null;
}

export const ASTRAL_SOCKET_SLOTS: readonly AstralSocketSlotTemplate[] = [
  { slotIndex: 0, label: 'NW Crown', x: 205, y: 175, zone: 'UPPER_CROWN', defaultType: 'FORGE_ANVIL' },
  { slotIndex: 1, label: 'NE Crown', x: 715, y: 175, zone: 'UPPER_CROWN', defaultType: 'TESLA_PYLON' },
  { slotIndex: 2, label: 'West Crucible', x: 265, y: 278, zone: 'MID_CRUCIBLE', defaultType: 'PRISM_SPLITTER' },
  { slotIndex: 3, label: 'Center Singularity', x: 460, y: 295, zone: 'MID_CRUCIBLE', defaultType: 'GRAVITY_WELL' },
  { slotIndex: 4, label: 'East Crucible', x: 655, y: 278, zone: 'MID_CRUCIBLE', defaultType: 'TESLA_PYLON' },
  { slotIndex: 5, label: 'Far West Wing', x: 145, y: 315, zone: 'MID_CRUCIBLE', defaultType: null },
  { slotIndex: 6, label: 'Far East Wing', x: 775, y: 315, zone: 'MID_CRUCIBLE', defaultType: null },
  { slotIndex: 7, label: 'SW Sling Gate', x: 235, y: 412, zone: 'LOWER_SLING', defaultType: 'HARMONIC_BELL' },
  { slotIndex: 8, label: 'SE Sling Gate', x: 685, y: 412, zone: 'LOWER_SLING', defaultType: 'WORMHOLE_RELAY' },
  { slotIndex: 9, label: 'Aegis Keystone', x: 460, y: 428, zone: 'LOWER_SLING', defaultType: null },
];

export type AstralRelicId =
  | 'NEWTON_THIRD_LAW'
  | 'MAXWELL_COIL'
  | 'CHROMATIC_PRISM'
  | 'HAWKING_MIRROR'
  | 'KEPLER_PERIHELION'
  | 'OUROBOROS_TAIL'
  | 'LAPLACE_PENDULUM'
  | 'PHILOSOPHER_STONE'
  | 'EVENT_HORIZON_LENS'
  | 'PYTHAGOREAN_CHORD'
  | 'SUPERNOVA_IGNITER'
  | 'COMPOUND_LEDGER';

export interface AstralRelicBlueprint {
  id: AstralRelicId;
  name: string;
  symbol: string;
  rarity: 'COMMON' | 'RARE' | 'LEGENDARY';
  relicMultFactor: number;
  description: string;
  flavor: string;
}

export const ASTRAL_RELICS: readonly AstralRelicBlueprint[] = [
  {
    id: 'NEWTON_THIRD_LAW',
    name: "Newton's Principia Anvil",
    symbol: '⚖️',
    rarity: 'COMMON',
    relicMultFactor: 1.2,
    description: '+15 Base Chips on every socket bumper bounce and +12% bounce elasticity.',
    flavor: 'For every action, an equal and multiplicative over-reaction.',
  },
  {
    id: 'MAXWELL_COIL',
    name: "Maxwell's Demon Induction",
    symbol: '⚡',
    rarity: 'RARE',
    relicMultFactor: 1.25,
    description: 'Tesla Pylons strike +2 additional targets, deal +45% arc damage, and restore +5 Aether Flux.',
    flavor: 'Sorting hot electrons from cold vacuum without spending entropy.',
  },
  {
    id: 'CHROMATIC_PRISM',
    name: 'Newtonian Spectral Crown',
    symbol: '🌈',
    rarity: 'LEGENDARY',
    relicMultFactor: 1.35,
    description: 'Bifrost Prism Gates grant +0.75× Combo Mult on split and twin comets inherit 100% of parent Chips.',
    flavor: 'White light broken into seven lethal vectors.',
  },
  {
    id: 'HAWKING_MIRROR',
    name: 'Hawking Reflection Foil',
    symbol: '🛡️',
    rarity: 'RARE',
    relicMultFactor: 1.25,
    description: 'Perfect Flipper Parries fire a 260-damage Antimatter Lance directly into the Boss Core.',
    flavor: 'What falls toward the horizon can be reflected at relativistic interest.',
  },
  {
    id: 'KEPLER_PERIHELION',
    name: "Kepler's Perihelion Spur",
    symbol: '☄️',
    rarity: 'COMMON',
    relicMultFactor: 1.2,
    description: 'Comets traveling above 380 px/s gain +22 Chips per hit and ×1.20 Relic Mult.',
    flavor: 'Equal areas swept in unequal violence.',
  },
  {
    id: 'OUROBOROS_TAIL',
    name: 'Ouroboros Eternal Loop',
    symbol: '🐍',
    rarity: 'LEGENDARY',
    relicMultFactor: 1.4,
    description: 'The first comet to drain each volley automatically respawns at the Zenith Crown in Supernova State!',
    flavor: 'The end of the table is merely the jaws of the launcher.',
  },
  {
    id: 'LAPLACE_PENDULUM',
    name: "Laplace's Escapement",
    symbol: '⏱️',
    rarity: 'COMMON',
    relicMultFactor: 1.2,
    description: 'Every Flipper or Aegis Paddle deflection adds +0.85× Combo Mult and +12 Aether Flux.',
    flavor: 'Give me the position and momentum of every flipper.',
  },
  {
    id: 'PHILOSOPHER_STONE',
    name: 'Alchemical Prima Materia',
    symbol: '🜚',
    rarity: 'RARE',
    relicMultFactor: 1.3,
    description: 'Every 8th bounce in a volley spawns a Golden Comet and mints +18 Stardust immediately.',
    flavor: 'Lead trajectories transmuted into solar gold.',
  },
  {
    id: 'EVENT_HORIZON_LENS',
    name: 'Schwarzschild Gravity Lens',
    symbol: '🕳️',
    rarity: 'RARE',
    relicMultFactor: 1.25,
    description: 'Gravity Wells pull in nearby enemy Void Meteors, vaporizing them into +30 Volley Chips.',
    flavor: 'Even hostile fire bends to curvature.',
  },
  {
    id: 'PYTHAGOREAN_CHORD',
    name: 'Pythagorean Sphere Resonator',
    symbol: '🎵',
    rarity: 'RARE',
    relicMultFactor: 1.28,
    description: 'Harmonic Bells trigger Sonic Nova every 2 hits instead of 3 and grant +0.5× Combo Mult.',
    flavor: 'There is geometry in the humming of the strings.',
  },
  {
    id: 'SUPERNOVA_IGNITER',
    name: 'Chandrasekhar Limit Core',
    symbol: '☀️',
    rarity: 'LEGENDARY',
    relicMultFactor: 1.38,
    description: 'All launched comets start in Supernova State (+35 starting Base Chips and +0.6× starting Mult).',
    flavor: '1.44 solar masses compressed into a 10-millimeter pinball.',
  },
  {
    id: 'COMPOUND_LEDGER',
    name: 'Medici Star-Bank Astrolabe',
    symbol: '💎',
    rarity: 'COMMON',
    relicMultFactor: 1.18,
    description: 'End-of-volley Stardust rewards and Flux interest are increased by +40%.',
    flavor: 'Compound interest is the eighth force of the cosmos.',
  },
];

export interface BossNodeTemplate {
  offsetAngleDeg: number;
  orbitRadius: number;
  nodeRadius: number;
  hpRatio: number;
  label: string;
}

export interface BossSectorBlueprint {
  sector: number;
  id: string;
  name: string;
  title: string;
  maxHp: number;
  coreX: number;
  coreY: number;
  coreRadius: number;
  orbitSpeedRadPerSec: number;
  hazardIntervalMs: number;
  hazardSpeed: number;
  stardustReward: number;
  color: string;
  secondaryColor: string;
  loreQuote: string;
  mechanicSummary: string;
  nodes: readonly BossNodeTemplate[];
}

export const BOSS_SECTORS: readonly BossSectorBlueprint[] = [
  {
    sector: 1,
    id: 'clockwork-astrolabe',
    name: 'The Clockwork Astrolabe',
    title: 'SECTOR I // BRASS CELESTIAL AUTOMATON',
    maxHp: 1600,
    coreX: 460,
    coreY: 132,
    coreRadius: 34,
    orbitSpeedRadPerSec: 0.75,
    hazardIntervalMs: 4200,
    hazardSpeed: 135,
    stardustReward: 95,
    color: '#38bdf8',
    secondaryColor: '#f59e0b',
    loreQuote: '"Before the stars burned hydrogen, they turned on brass teeth."',
    mechanicSummary: '3 rotating Astrolabe Shield Nodes orbit the core. Curve comets through the Mid Crucible or shatter the nodes for +150 bonus Chips!',
    nodes: [
      { offsetAngleDeg: 0, orbitRadius: 74, nodeRadius: 16, hpRatio: 0.22, label: 'Vernal Gear' },
      { offsetAngleDeg: 120, orbitRadius: 74, nodeRadius: 16, hpRatio: 0.22, label: 'Solstice Gear' },
      { offsetAngleDeg: 240, orbitRadius: 74, nodeRadius: 16, hpRatio: 0.22, label: 'Equinox Gear' },
    ],
  },
  {
    sector: 2,
    id: 'gemini-pulsar',
    name: 'The Gemini Binary Pulsar',
    title: 'SECTOR II // TWIN MAGNETAR RESONANCE',
    maxHp: 3600,
    coreX: 460,
    coreY: 134,
    coreRadius: 36,
    orbitSpeedRadPerSec: -1.05,
    hazardIntervalMs: 3600,
    hazardSpeed: 155,
    stardustReward: 125,
    color: '#ec4899',
    secondaryColor: '#38bdf8',
    loreQuote: '"Two hearts beating at 700 revolutions per second; strike one alone and the other remembers."',
    mechanicSummary: 'Protected by 4 rapid Binary Satellites. Split your comet through a Bifrost Prism Gate to overwhelm both flanks simultaneously!',
    nodes: [
      { offsetAngleDeg: 0, orbitRadius: 82, nodeRadius: 17, hpRatio: 0.2, label: 'Castor Lobe' },
      { offsetAngleDeg: 90, orbitRadius: 82, nodeRadius: 15, hpRatio: 0.18, label: 'Pollux Lobe' },
      { offsetAngleDeg: 180, orbitRadius: 82, nodeRadius: 17, hpRatio: 0.2, label: 'Castor Mirror' },
      { offsetAngleDeg: 270, orbitRadius: 82, nodeRadius: 15, hpRatio: 0.18, label: 'Pollux Mirror' },
    ],
  },
  {
    sector: 3,
    id: 'hydra-dyson-swarm',
    name: 'The Hydra Dyson Swarm',
    title: 'SECTOR III // SELF-REPLICATING SOLAR LATTICE',
    maxHp: 7200,
    coreX: 460,
    coreY: 136,
    coreRadius: 38,
    orbitSpeedRadPerSec: 1.2,
    hazardIntervalMs: 3000,
    hazardSpeed: 170,
    stardustReward: 160,
    color: '#10b981',
    secondaryColor: '#fde047',
    loreQuote: '"A billion hexagonal mirrors drinking the sun drop by drop."',
    mechanicSummary: '5 Dyson Collector Nodes fire Void Meteors toward your Aegis rail. Use Tesla Pylons and Harmonic Bells to clear the swarm!',
    nodes: [
      { offsetAngleDeg: 0, orbitRadius: 86, nodeRadius: 15, hpRatio: 0.18, label: 'Hex Array α' },
      { offsetAngleDeg: 72, orbitRadius: 86, nodeRadius: 15, hpRatio: 0.18, label: 'Hex Array β' },
      { offsetAngleDeg: 144, orbitRadius: 86, nodeRadius: 15, hpRatio: 0.18, label: 'Hex Array γ' },
      { offsetAngleDeg: 216, orbitRadius: 86, nodeRadius: 15, hpRatio: 0.18, label: 'Hex Array δ' },
      { offsetAngleDeg: 288, orbitRadius: 86, nodeRadius: 15, hpRatio: 0.18, label: 'Hex Array ε' },
    ],
  },
  {
    sector: 4,
    id: 'event-horizon-leviathan',
    name: 'The Event Horizon Leviathan',
    title: 'SECTOR IV // GRAVITATIONAL ABYSS SOVEREIGN',
    maxHp: 13500,
    coreX: 460,
    coreY: 138,
    coreRadius: 40,
    orbitSpeedRadPerSec: -1.35,
    hazardIntervalMs: 2600,
    hazardSpeed: 190,
    stardustReward: 210,
    color: '#a855f7',
    secondaryColor: '#f43f5e',
    loreQuote: '"Look into the accretion disk: every comet you ever lost is still falling."',
    mechanicSummary: 'Warps upper-table trajectories and launches Hawking Lances. Parry Lances with your Flippers and wire Ouroboros Wormholes for infinite zenith drops!',
    nodes: [
      { offsetAngleDeg: 30, orbitRadius: 90, nodeRadius: 16, hpRatio: 0.17, label: 'Accretion Fang I' },
      { offsetAngleDeg: 90, orbitRadius: 90, nodeRadius: 16, hpRatio: 0.17, label: 'Accretion Fang II' },
      { offsetAngleDeg: 150, orbitRadius: 90, nodeRadius: 16, hpRatio: 0.17, label: 'Accretion Fang III' },
      { offsetAngleDeg: 210, orbitRadius: 90, nodeRadius: 16, hpRatio: 0.17, label: 'Accretion Fang IV' },
      { offsetAngleDeg: 270, orbitRadius: 90, nodeRadius: 16, hpRatio: 0.17, label: 'Accretion Fang V' },
      { offsetAngleDeg: 330, orbitRadius: 90, nodeRadius: 16, hpRatio: 0.17, label: 'Accretion Fang VI' },
    ],
  },
  {
    sector: 5,
    id: 'oroboros-grand-architect',
    name: 'OROBOROS, THE SINGULARITY ENGINE',
    title: 'SECTOR V // OMEGA ARCHITECT OF ETERNAL RETURN',
    maxHp: 25000,
    coreX: 460,
    coreY: 140,
    coreRadius: 44,
    orbitSpeedRadPerSec: 1.55,
    hazardIntervalMs: 2200,
    hazardSpeed: 210,
    stardustReward: 350,
    color: '#f59e0b',
    secondaryColor: '#ec4899',
    loreQuote: '"The universe is a pinball table that builds its own bumpers out of dead stars."',
    mechanicSummary: '6 Celestial Seals guard the Omega Core. Combine Multiball Splits, Wormhole Loops, Magnet Pulses, and Flipper Parries for a 10,000+ damage Singularity Volley!',
    nodes: [
      { offsetAngleDeg: 0, orbitRadius: 94, nodeRadius: 17, hpRatio: 0.16, label: 'Seal of Chronos' },
      { offsetAngleDeg: 60, orbitRadius: 94, nodeRadius: 17, hpRatio: 0.16, label: 'Seal of Aether' },
      { offsetAngleDeg: 120, orbitRadius: 94, nodeRadius: 17, hpRatio: 0.16, label: 'Seal of Prism' },
      { offsetAngleDeg: 180, orbitRadius: 94, nodeRadius: 17, hpRatio: 0.16, label: 'Seal of Volt' },
      { offsetAngleDeg: 240, orbitRadius: 94, nodeRadius: 17, hpRatio: 0.16, label: 'Seal of Mass' },
      { offsetAngleDeg: 300, orbitRadius: 94, nodeRadius: 17, hpRatio: 0.16, label: 'Seal of Return' },
    ],
  },
];

export interface AstralVerdict {
  id: string;
  title: string;
  badge: string;
  description: string;
}

export const ASTRAL_VERDICTS: Record<string, AstralVerdict> = {
  SINGULARITY_SOVEREIGN: {
    id: 'SINGULARITY_SOVEREIGN',
    title: 'Grand Architect of the Singularity',
    badge: '👑 OMEGA ARCHITECT',
    description: 'You shattered all 5 Cosmic Boss Constellations and engineered a self-sustaining relativistic pinball engine.',
  },
  MULTIBALL_ALCHEMIST: {
    id: 'MULTIBALL_ALCHEMIST',
    title: 'Chromatic Multiball Alchemist',
    badge: '🌈 PRISM SAVANT',
    description: 'Your Bifrost Prism cascades and Tesla lightning chains turned single comets into exponential storms.',
  },
  PARRY_VIRTUOSO: {
    id: 'PARRY_VIRTUOSO',
    title: 'Relativistic Flipper Virtuoso',
    badge: '⚡ PARRY MASTER',
    description: 'With razor-sharp Perfect Parries and Magnet Pulses, you reflected the cosmos back upon itself.',
  },
  ENTROPY_PILGRIM: {
    id: 'ENTROPY_PILGRIM',
    title: 'Initiate of the Astral Table',
    badge: '☄️ STARFORGE INITIATE',
    description: 'Every drained comet teaches the geometry of the stars. Re-wire your upper sockets and launch again!',
  },
};
