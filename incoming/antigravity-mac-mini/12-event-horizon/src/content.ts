export type ShipChassisId = 'VANGUARD' | 'PHOTON_WISP' | 'STAR_HAMMER';

export type HorizonGameMode = 'ODYSSEY' | 'TRICKSHOT_DOJO' | 'ENDLESS_SINGULARITY';

export type AstroRelicId =
  | 'KEPLER_SCYTHE'
  | 'HAWKING_PRISM'
  | 'NOETHER_DYNAMO'
  | 'SCHRODINGER_ECHO'
  | 'ROCHE_CRUSHER'
  | 'TACHYON_RAIL'
  | 'DYSON_HARMONIC'
  | 'SUPERNOVA_CORE'
  | 'CHRONO_HOURGLASS'
  | 'BINARY_ATTRACTOR'
  | 'LORENTZ_AEGIS'
  | 'OMEGA_MONOLITH';

export type GravityWellKind = 'BLACK_HOLE' | 'WHITE_HOLE' | 'NEUTRON_STAR';

export type BumperKind =
  | 'CONSTELLATION_PEG'
  | 'OVERCHARGE_ANVIL'
  | 'CHRONO_CRYSTAL'
  | 'REPULSOR_COIL';

export type EnemyKind =
  | 'VOID_DRONE'
  | 'PHASE_FRIGATE'
  | 'ENTROPY_COMET'
  | 'TESSERA_WARDEN'
  | 'KARDASHEV_BOSS';

export interface ShipChassisSpec {
  id: ShipChassisId;
  name: string;
  tagline: string;
  mass: number;
  maxHull: number;
  bumperElasticityBonus: number;
  tetherRangeMult: number;
  supernovaRadiusMult: number;
  predictionStepsBonus: number;
  color: string;
  accentColor: string;
}

export interface AstroRelicSpec {
  id: AstroRelicId;
  name: string;
  symbol: string;
  rarity: 'RARE' | 'EPIC' | 'MYTHIC';
  color: string;
  shortHook: string;
  description: string;
}

export interface GravityWellBlueprint {
  id: string;
  name: string;
  kind: GravityWellKind;
  x: number;
  y: number;
  mass: number;
  coreRadius: number;
  skimRadius: number;
  pairedWellId?: string;
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitRadius?: number;
  orbitAngularSpeed?: number;
  orbitPhase?: number;
}

export interface BumperBlueprint {
  id: string;
  kind: BumperKind;
  x: number;
  y: number;
  radius: number;
  restitution: number;
  harmonicNoteIndex: number;
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitRadius?: number;
  orbitAngularSpeed?: number;
  orbitPhase?: number;
}

export interface EnemySpawnBlueprint {
  kind: EnemyKind;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  hp?: number;
}

export interface SectorBlueprint {
  sectorNumber: number;
  id: string;
  title: string;
  subtitle: string;
  loreBrief: string;
  ambientHue: string;
  wells: readonly GravityWellBlueprint[];
  bumpers: readonly BumperBlueprint[];
  enemies: readonly EnemySpawnBlueprint[];
}

export interface TrickshotPuzzleBlueprint {
  puzzleNumber: number;
  id: string;
  title: string;
  subtitle: string;
  hint: string;
  parLaunches: number;
  shipStartX: number;
  shipStartY: number;
  recommendedAimDeg: number;
  recommendedPowerPct: number;
  wells: readonly GravityWellBlueprint[];
  bumpers: readonly BumperBlueprint[];
  targets: readonly EnemySpawnBlueprint[];
}

export const SHIP_CHASSIS_CATALOG: Record<ShipChassisId, ShipChassisSpec> = {
  VANGUARD: {
    id: 'VANGUARD',
    name: 'Vanguard Lance',
    tagline: 'Balanced Relativistic Interceptor · +25% Tether Range & Extended Trajectory Sight',
    mass: 1.0,
    maxHull: 5,
    bumperElasticityBonus: 1.0,
    tetherRangeMult: 1.25,
    supernovaRadiusMult: 1.0,
    predictionStepsBonus: 25,
    color: '#38bdf8',
    accentColor: '#bae6fd',
  },
  PHOTON_WISP: {
    id: 'PHOTON_WISP',
    name: 'Photon Wisp',
    tagline: 'Featherweight Tachyon Skimmer · +30% Bumper Ricochet Speed & Empowered Worldline Echo',
    mass: 0.78,
    maxHull: 4,
    bumperElasticityBonus: 1.3,
    tetherRangeMult: 1.1,
    supernovaRadiusMult: 0.95,
    predictionStepsBonus: 15,
    color: '#f472b6',
    accentColor: '#fbcfe8',
  },
  STAR_HAMMER: {
    id: 'STAR_HAMMER',
    name: 'Juggernaut Star-Hammer',
    tagline: 'Heavy Siege Dreadnought · 6 Hull, Crushes Shields on Ram & +40% Supernova Shockwave',
    mass: 1.32,
    maxHull: 6,
    bumperElasticityBonus: 0.95,
    tetherRangeMult: 1.0,
    supernovaRadiusMult: 1.4,
    predictionStepsBonus: 0,
    color: '#f59e0b',
    accentColor: '#fde68a',
  },
};

export const ASTRO_RELIC_CATALOG: readonly AstroRelicSpec[] = [
  {
    id: 'KEPLER_SCYTHE',
    name: "Kepler's Area Scythe",
    symbol: '📐',
    rarity: 'MYTHIC',
    color: '#38bdf8',
    shortHook: '+65% Constellation Polygon Damage & +1.5x Score Mult per Triangle',
    description:
      'Sweeping 3+ Constellation Pegs into a closed geometric polygon deals +65% laser damage and adds +1.5x to your launch multiplier.',
  },
  {
    id: 'HAWKING_PRISM',
    name: 'Hawking Radiation Prism',
    symbol: '🌈',
    rarity: 'EPIC',
    color: '#f472b6',
    shortHook: 'Event Horizon Skims Fire 3 Homing Photon Lances',
    description:
      'Skimming inside any Singularity Photon Sphere emits 3 homing Photon Lances that strike the nearest enemies for 28 damage each.',
  },
  {
    id: 'NOETHER_DYNAMO',
    name: "Noether's Symmetry Dynamo",
    symbol: '⚡',
    rarity: 'RARE',
    color: '#fbbf24',
    shortHook: '+0.4x Lorentz Mult & +10 Hawking Energy per Bumper Bounce',
    description:
      'Conservation of angular momentum grants +0.4x relativistic combo multiplier and +10 Hawking Energy every time you ricochet off a bumper.',
  },
  {
    id: 'SCHRODINGER_ECHO',
    name: "Schrödinger's Wavefunction",
    symbol: '👻',
    rarity: 'MYTHIC',
    color: '#a855f7',
    shortHook: 'Chrono-Rewind Echo Deals 2.2x Damage & Triggers Bumpers',
    description:
      'Rewinding your worldline spawns a superposed Quantum Echo that deals 2.2x ram damage and refunds 15 Hawking Energy.',
  },
  {
    id: 'ROCHE_CRUSHER',
    name: 'Roche Limit Tidal Crusher',
    symbol: '🌀',
    rarity: 'EPIC',
    color: '#10b981',
    shortHook: 'Crushing Enemies in a Singularity Heals +1 Hull & +500 Score',
    description:
      'Enemies pulled or knocked into a Gravity Well core are tidally shredded, restoring +1 Ship Hull and awarding +500 bonus points.',
  },
  {
    id: 'TACHYON_RAIL',
    name: 'Tachyon Rail-Capacitor',
    symbol: '🚀',
    rarity: 'RARE',
    color: '#22d3ee',
    shortHook: '+30% Slingshot Launch Speed & Piercing Relativistic Ram',
    description:
      'Slingshot launches start +30% faster and your ship slices straight through non-boss enemies without losing momentum.',
  },
  {
    id: 'DYSON_HARMONIC',
    name: 'Dyson Harmonic Resonator',
    symbol: '🔗',
    rarity: 'EPIC',
    color: '#f97316',
    shortHook: 'Quantum Tether Beam Slices Enemies for +80% Plasma DPS',
    description:
      'While tethered ([Q]), the quantum cable between your ship and the anchor becomes a searing plasma wire that cuts through every enemy in its path.',
  },
  {
    id: 'SUPERNOVA_CORE',
    name: 'Chandrasekhar Limit Core',
    symbol: '💥',
    rarity: 'MYTHIC',
    color: '#ef4444',
    shortHook: '+50% Supernova Radius & Free Auto-Nova Every 4th Bounce',
    description:
      'Supernova Discharge ([E]) expands +50% wider, and every 4th consecutive bumper bounce in a single flight triggers a free Supernova pulse!',
  },
  {
    id: 'CHRONO_HOURGLASS',
    name: 'Minkowski Light-Cone Glass',
    symbol: '⏳',
    rarity: 'RARE',
    color: '#818cf8',
    shortHook: '0-Cost Bullet-Time Aiming & +1 Max Chrono-Rewind Charge',
    description:
      'Aiming in Bullet-Time drains zero Hawking Energy, extends trajectory sight by 35 steps, and immediately grants +1 Chrono-Charge.',
  },
  {
    id: 'BINARY_ATTRACTOR',
    name: 'Lagrange Point Magnetar',
    symbol: '🧲',
    rarity: 'RARE',
    color: '#34d399',
    shortHook: 'Global Stardust Magnet & +50% Shard Score Value',
    description:
      'Stardust motes and Chrono-Shards across the entire sector accelerate toward your ship automatically and grant +50% bonus score.',
  },
  {
    id: 'LORENTZ_AEGIS',
    name: 'Lorentz Relativistic Aegis',
    symbol: '🛡️',
    rarity: 'EPIC',
    color: '#60a5fa',
    shortHook: 'Invulnerable to Damage While Lorentz γ ≥ 2.0x',
    description:
      'Relativistic time dilation shields your hull: whenever your Lorentz factor γ is 2.0x or higher, incoming hazards and projectiles deal 0 damage.',
  },
  {
    id: 'OMEGA_MONOLITH',
    name: 'Kardashev Type-III Monolith',
    symbol: '👑',
    rarity: 'MYTHIC',
    color: '#fde047',
    shortHook: 'x1.35 Multiplicative Score Bonus per Equipped Astro-Relic',
    description:
      'Resonates with your entire Relic Constellation: multiplies all bumper, ram, and polygon scores by 1.35x for each Astro-Relic you hold.',
  },
];

export const ODYSSEY_SECTORS: readonly SectorBlueprint[] = [
  {
    sectorNumber: 1,
    id: 'sector-1-kepler-nursery',
    title: 'Sector I · The Kepler Nursery',
    subtitle: 'Golden Proto-Singularity & Hexagonal Constellation Ring',
    loreBrief:
      'Slingshot around the central Proto-Star! Skim its golden Photon Sphere to build Lorentz γ, and bounce across 3+ Constellation Pegs to enclose a laser triangle!',
    ambientHue: '#0ea5e9',
    wells: [
      {
        id: 'well-kepler-alpha',
        name: 'Kepler Proto-Singularity',
        kind: 'BLACK_HOLE',
        x: 480,
        y: 300,
        mass: 3100000,
        coreRadius: 28,
        skimRadius: 96,
      },
    ],
    bumpers: [
      { id: 'bmp-1', kind: 'CONSTELLATION_PEG', x: 310, y: 170, radius: 20, restitution: 1.18, harmonicNoteIndex: 0 },
      { id: 'bmp-2', kind: 'CONSTELLATION_PEG', x: 650, y: 170, radius: 20, restitution: 1.18, harmonicNoteIndex: 1 },
      { id: 'bmp-3', kind: 'CONSTELLATION_PEG', x: 710, y: 300, radius: 20, restitution: 1.18, harmonicNoteIndex: 2 },
      { id: 'bmp-4', kind: 'CONSTELLATION_PEG', x: 650, y: 430, radius: 20, restitution: 1.18, harmonicNoteIndex: 3 },
      { id: 'bmp-5', kind: 'CONSTELLATION_PEG', x: 310, y: 430, radius: 20, restitution: 1.18, harmonicNoteIndex: 4 },
      { id: 'bmp-6', kind: 'OVERCHARGE_ANVIL', x: 250, y: 300, radius: 22, restitution: 1.26, harmonicNoteIndex: 5 },
    ],
    enemies: [
      { kind: 'VOID_DRONE', x: 480, y: 125 },
      { kind: 'VOID_DRONE', x: 615, y: 245 },
      { kind: 'VOID_DRONE', x: 615, y: 355 },
      { kind: 'VOID_DRONE', x: 480, y: 475 },
      { kind: 'PHASE_FRIGATE', x: 355, y: 245 },
    ],
  },
  {
    sectorNumber: 2,
    id: 'sector-2-roche-foundry',
    title: 'Sector II · The Roche Foundry',
    subtitle: 'Twin Binary Gravity Wells & Figure-8 Slingshot Corridor',
    loreBrief:
      'Two coupled Singularities create a Lagrange corridor down the center. Thread the figure-8 or use Supernova ([E]) to knock armored Frigates into the Roche Limit!',
    ambientHue: '#f59e0b',
    wells: [
      {
        id: 'well-roche-west',
        name: 'Castor Gravity Well',
        kind: 'BLACK_HOLE',
        x: 330,
        y: 300,
        mass: 2550000,
        coreRadius: 25,
        skimRadius: 88,
      },
      {
        id: 'well-roche-east',
        name: 'Pollux Gravity Well',
        kind: 'NEUTRON_STAR',
        x: 630,
        y: 300,
        mass: 2550000,
        coreRadius: 25,
        skimRadius: 88,
      },
    ],
    bumpers: [
      { id: 'bmp-r1', kind: 'CONSTELLATION_PEG', x: 480, y: 145, radius: 20, restitution: 1.2, harmonicNoteIndex: 0 },
      { id: 'bmp-r2', kind: 'CONSTELLATION_PEG', x: 480, y: 455, radius: 20, restitution: 1.2, harmonicNoteIndex: 2 },
      { id: 'bmp-r3', kind: 'CONSTELLATION_PEG', x: 185, y: 195, radius: 19, restitution: 1.18, harmonicNoteIndex: 3 },
      { id: 'bmp-r4', kind: 'CONSTELLATION_PEG', x: 775, y: 195, radius: 19, restitution: 1.18, harmonicNoteIndex: 4 },
      { id: 'bmp-r5', kind: 'CONSTELLATION_PEG', x: 185, y: 405, radius: 19, restitution: 1.18, harmonicNoteIndex: 5 },
      { id: 'bmp-r6', kind: 'CONSTELLATION_PEG', x: 775, y: 405, radius: 19, restitution: 1.18, harmonicNoteIndex: 6 },
      { id: 'bmp-r7', kind: 'CHRONO_CRYSTAL', x: 480, y: 300, radius: 21, restitution: 1.28, harmonicNoteIndex: 7 },
    ],
    enemies: [
      { kind: 'VOID_DRONE', x: 330, y: 155 },
      { kind: 'VOID_DRONE', x: 630, y: 155 },
      { kind: 'PHASE_FRIGATE', x: 330, y: 445 },
      { kind: 'PHASE_FRIGATE', x: 630, y: 445 },
      { kind: 'ENTROPY_COMET', x: 205, y: 300 },
      { kind: 'ENTROPY_COMET', x: 755, y: 300 },
    ],
  },
  {
    sectorNumber: 3,
    id: 'sector-3-dyson-choir',
    title: 'Sector III · The Dyson Choir',
    subtitle: 'Orbiting Resonance Bumpers & Tessera Shield Wardens',
    loreBrief:
      'Tessera Wardens project frontal shields that deflect low-speed impacts. Whip on your Quantum Tether ([Q]) to reach Lorentz γ ≥ 2.0x or enclose them inside a Constellation Polygon!',
    ambientHue: '#a855f7',
    wells: [
      {
        id: 'well-dyson-core',
        name: 'Dyson Pulsar Core',
        kind: 'NEUTRON_STAR',
        x: 480,
        y: 300,
        mass: 3400000,
        coreRadius: 26,
        skimRadius: 98,
      },
    ],
    bumpers: [
      {
        id: 'bmp-d1',
        kind: 'CONSTELLATION_PEG',
        x: 480,
        y: 120,
        radius: 19,
        restitution: 1.22,
        harmonicNoteIndex: 0,
        orbitCenterX: 480,
        orbitCenterY: 300,
        orbitRadius: 185,
        orbitAngularSpeed: 0.45,
        orbitPhase: 0,
      },
      {
        id: 'bmp-d2',
        kind: 'CONSTELLATION_PEG',
        x: 640,
        y: 390,
        radius: 19,
        restitution: 1.22,
        harmonicNoteIndex: 2,
        orbitCenterX: 480,
        orbitCenterY: 300,
        orbitRadius: 185,
        orbitAngularSpeed: 0.45,
        orbitPhase: (Math.PI * 2) / 3,
      },
      {
        id: 'bmp-d3',
        kind: 'CONSTELLATION_PEG',
        x: 320,
        y: 390,
        radius: 19,
        restitution: 1.22,
        harmonicNoteIndex: 4,
        orbitCenterX: 480,
        orbitCenterY: 300,
        orbitRadius: 185,
        orbitAngularSpeed: 0.45,
        orbitPhase: (Math.PI * 4) / 3,
      },
      { id: 'bmp-d4', kind: 'OVERCHARGE_ANVIL', x: 210, y: 170, radius: 22, restitution: 1.28, harmonicNoteIndex: 5 },
      { id: 'bmp-d5', kind: 'OVERCHARGE_ANVIL', x: 750, y: 170, radius: 22, restitution: 1.28, harmonicNoteIndex: 6 },
      { id: 'bmp-d6', kind: 'CONSTELLATION_PEG', x: 210, y: 430, radius: 20, restitution: 1.2, harmonicNoteIndex: 7 },
      { id: 'bmp-d7', kind: 'CONSTELLATION_PEG', x: 750, y: 430, radius: 20, restitution: 1.2, harmonicNoteIndex: 8 },
    ],
    enemies: [
      { kind: 'TESSERA_WARDEN', x: 350, y: 195 },
      { kind: 'TESSERA_WARDEN', x: 610, y: 195 },
      { kind: 'TESSERA_WARDEN', x: 480, y: 435 },
      { kind: 'PHASE_FRIGATE', x: 255, y: 300 },
      { kind: 'PHASE_FRIGATE', x: 705, y: 300 },
      { kind: 'VOID_DRONE', x: 480, y: 165 },
    ],
  },
  {
    sectorNumber: 4,
    id: 'sector-4-wormhole-binary',
    title: 'Sector IV · The Chrono-Shear Wormhole',
    subtitle: 'Einstein-Rosen Black Hole / White Hole Relativistic Cannon',
    loreBrief:
      'Dive directly into the western Black Hole core to erupt out of the eastern White Hole at 1.65x relativistic velocity with a free shockwave!',
    ambientHue: '#ec4899',
    wells: [
      {
        id: 'well-wormhole-in',
        name: 'Charybdis Singularity (Wormhole Entry)',
        kind: 'BLACK_HOLE',
        x: 290,
        y: 300,
        mass: 2900000,
        coreRadius: 30,
        skimRadius: 94,
        pairedWellId: 'well-wormhole-out',
      },
      {
        id: 'well-wormhole-out',
        name: 'Scylla White Hole (Relativistic Exit)',
        kind: 'WHITE_HOLE',
        x: 670,
        y: 300,
        mass: -1400000,
        coreRadius: 28,
        skimRadius: 92,
        pairedWellId: 'well-wormhole-in',
      },
    ],
    bumpers: [
      { id: 'bmp-w1', kind: 'CONSTELLATION_PEG', x: 480, y: 130, radius: 20, restitution: 1.22, harmonicNoteIndex: 0 },
      { id: 'bmp-w2', kind: 'CONSTELLATION_PEG', x: 480, y: 470, radius: 20, restitution: 1.22, harmonicNoteIndex: 1 },
      { id: 'bmp-w3', kind: 'CONSTELLATION_PEG', x: 790, y: 165, radius: 20, restitution: 1.22, harmonicNoteIndex: 2 },
      { id: 'bmp-w4', kind: 'CONSTELLATION_PEG', x: 790, y: 435, radius: 20, restitution: 1.22, harmonicNoteIndex: 3 },
      { id: 'bmp-w5', kind: 'CHRONO_CRYSTAL', x: 170, y: 165, radius: 21, restitution: 1.25, harmonicNoteIndex: 4 },
      { id: 'bmp-w6', kind: 'CHRONO_CRYSTAL', x: 170, y: 435, radius: 21, restitution: 1.25, harmonicNoteIndex: 5 },
      { id: 'bmp-w7', kind: 'REPULSOR_COIL', x: 480, y: 300, radius: 22, restitution: 1.32, harmonicNoteIndex: 6 },
    ],
    enemies: [
      { kind: 'TESSERA_WARDEN', x: 540, y: 210 },
      { kind: 'TESSERA_WARDEN', x: 540, y: 390 },
      { kind: 'ENTROPY_COMET', x: 770, y: 300 },
      { kind: 'PHASE_FRIGATE', x: 390, y: 180 },
      { kind: 'PHASE_FRIGATE', x: 390, y: 420 },
      { kind: 'VOID_DRONE', x: 670, y: 155 },
      { kind: 'VOID_DRONE', x: 670, y: 445 },
    ],
  },
  {
    sectorNumber: 5,
    id: 'sector-5-omega-architect',
    title: 'Sector V · BOSS: KARDASHEV-IX DYSON SOVEREIGN',
    subtitle: 'The Omega Singularity Ring & 4 Harmonic Anchor Pylons',
    loreBrief:
      'KARDASHEV-IX guards the Omega Singularity! Ricochet across the 8 Resonance Bumpers to enclose Constellation Polygons around the Boss or ram it at high Lorentz γ!',
    ambientHue: '#f43f5e',
    wells: [
      {
        id: 'well-omega-heart',
        name: 'Omega Singularity Heart',
        kind: 'BLACK_HOLE',
        x: 480,
        y: 300,
        mass: 3500000,
        coreRadius: 27,
        skimRadius: 102,
      },
    ],
    bumpers: [
      { id: 'bmp-b1', kind: 'CONSTELLATION_PEG', x: 280, y: 140, radius: 20, restitution: 1.24, harmonicNoteIndex: 0 },
      { id: 'bmp-b2', kind: 'CONSTELLATION_PEG', x: 680, y: 140, radius: 20, restitution: 1.24, harmonicNoteIndex: 1 },
      { id: 'bmp-b3', kind: 'CONSTELLATION_PEG', x: 770, y: 300, radius: 20, restitution: 1.24, harmonicNoteIndex: 2 },
      { id: 'bmp-b4', kind: 'CONSTELLATION_PEG', x: 680, y: 460, radius: 20, restitution: 1.24, harmonicNoteIndex: 3 },
      { id: 'bmp-b5', kind: 'CONSTELLATION_PEG', x: 280, y: 460, radius: 20, restitution: 1.24, harmonicNoteIndex: 4 },
      { id: 'bmp-b6', kind: 'CONSTELLATION_PEG', x: 190, y: 300, radius: 20, restitution: 1.24, harmonicNoteIndex: 5 },
      { id: 'bmp-b7', kind: 'OVERCHARGE_ANVIL', x: 480, y: 115, radius: 22, restitution: 1.3, harmonicNoteIndex: 6 },
      { id: 'bmp-b8', kind: 'CHRONO_CRYSTAL', x: 480, y: 485, radius: 22, restitution: 1.3, harmonicNoteIndex: 7 },
    ],
    enemies: [
      { kind: 'KARDASHEV_BOSS', x: 480, y: 185, hp: 420 },
      { kind: 'TESSERA_WARDEN', x: 335, y: 235 },
      { kind: 'TESSERA_WARDEN', x: 625, y: 235 },
      { kind: 'PHASE_FRIGATE', x: 355, y: 385 },
      { kind: 'PHASE_FRIGATE', x: 605, y: 385 },
    ],
  },
];

export const TRICKSHOT_PUZZLES: readonly TrickshotPuzzleBlueprint[] = [
  {
    puzzleNumber: 1,
    id: 'dojo-1-kepler-triangle',
    title: 'Dojo I · The Sacred Triangle',
    subtitle: '1-Launch Par · Bounce off 3 Constellation Pegs to Enclose the Drone Squadron',
    hint: 'Aim toward the top-left Constellation Peg (or press [C] AI Coach) so the central Singularity bends your path around all 3 pegs!',
    parLaunches: 1,
    shipStartX: 160,
    shipStartY: 300,
    recommendedAimDeg: -32,
    recommendedPowerPct: 0.92,
    wells: [
      {
        id: 'dojo1-well',
        name: 'Dojo Singularity',
        kind: 'BLACK_HOLE',
        x: 480,
        y: 300,
        mass: 2800000,
        coreRadius: 24,
        skimRadius: 90,
      },
    ],
    bumpers: [
      { id: 'd1-b1', kind: 'CONSTELLATION_PEG', x: 350, y: 150, radius: 24, restitution: 1.22, harmonicNoteIndex: 0 },
      { id: 'd1-b2', kind: 'CONSTELLATION_PEG', x: 660, y: 180, radius: 24, restitution: 1.22, harmonicNoteIndex: 2 },
      { id: 'd1-b3', kind: 'CONSTELLATION_PEG', x: 580, y: 445, radius: 24, restitution: 1.22, harmonicNoteIndex: 4 },
    ],
    targets: [
      { kind: 'VOID_DRONE', x: 520, y: 245, hp: 40 },
      { kind: 'VOID_DRONE', x: 560, y: 310, hp: 40 },
    ],
  },
  {
    puzzleNumber: 2,
    id: 'dojo-2-wormhole-snipe',
    title: 'Dojo II · Einstein-Rosen Bankshot',
    subtitle: '1-Launch Par · Dive Into the Black Hole Wormhole to Erupt Through the Eastern Prism Ring',
    hint: 'Aim straight into the western Black Hole core — you will exit the eastern White Hole at 1.65x speed directly into the target cluster!',
    parLaunches: 1,
    shipStartX: 140,
    shipStartY: 300,
    recommendedAimDeg: 0,
    recommendedPowerPct: 0.85,
    wells: [
      {
        id: 'dojo2-bh',
        name: 'Wormhole Entry',
        kind: 'BLACK_HOLE',
        x: 310,
        y: 300,
        mass: 2600000,
        coreRadius: 34,
        skimRadius: 88,
        pairedWellId: 'dojo2-wh',
      },
      {
        id: 'dojo2-wh',
        name: 'White Hole Exit',
        kind: 'WHITE_HOLE',
        x: 620,
        y: 300,
        mass: -900000,
        coreRadius: 28,
        skimRadius: 84,
        pairedWellId: 'dojo2-bh',
      },
    ],
    bumpers: [
      { id: 'd2-b1', kind: 'CONSTELLATION_PEG', x: 760, y: 220, radius: 24, restitution: 1.24, harmonicNoteIndex: 1 },
      { id: 'd2-b2', kind: 'CONSTELLATION_PEG', x: 760, y: 380, radius: 24, restitution: 1.24, harmonicNoteIndex: 3 },
      { id: 'd2-b3', kind: 'OVERCHARGE_ANVIL', x: 840, y: 300, radius: 25, restitution: 1.28, harmonicNoteIndex: 5 },
    ],
    targets: [
      { kind: 'VOID_DRONE', x: 730, y: 300, hp: 40 },
      { kind: 'VOID_DRONE', x: 790, y: 300, hp: 40 },
    ],
  },
  {
    puzzleNumber: 3,
    id: 'dojo-3-lagrange-slingshot',
    title: 'Dojo III · The Figure-8 Lagrange Whip',
    subtitle: '1-Launch Par · Thread Between Twin Gravity Wells to Strike Both Outer Beacons',
    hint: 'Launch slightly upward through the central Lagrange saddle so the upper well bends you right and the lower well bends you back!',
    parLaunches: 1,
    shipStartX: 170,
    shipStartY: 420,
    recommendedAimDeg: -26,
    recommendedPowerPct: 0.95,
    wells: [
      {
        id: 'dojo3-w1',
        name: 'Upper Binary Star',
        kind: 'BLACK_HOLE',
        x: 480,
        y: 195,
        mass: 2500000,
        coreRadius: 24,
        skimRadius: 82,
      },
      {
        id: 'dojo3-w2',
        name: 'Lower Binary Star',
        kind: 'BLACK_HOLE',
        x: 480,
        y: 405,
        mass: 2500000,
        coreRadius: 24,
        skimRadius: 82,
      },
    ],
    bumpers: [
      { id: 'd3-b1', kind: 'CONSTELLATION_PEG', x: 350, y: 300, radius: 23, restitution: 1.25, harmonicNoteIndex: 0 },
      { id: 'd3-b2', kind: 'CONSTELLATION_PEG', x: 610, y: 300, radius: 23, restitution: 1.25, harmonicNoteIndex: 2 },
      { id: 'd3-b3', kind: 'CONSTELLATION_PEG', x: 770, y: 205, radius: 24, restitution: 1.25, harmonicNoteIndex: 4 },
    ],
    targets: [
      { kind: 'VOID_DRONE', x: 480, y: 300, hp: 40 },
      { kind: 'VOID_DRONE', x: 710, y: 250, hp: 40 },
    ],
  },
  {
    puzzleNumber: 4,
    id: 'dojo-4-prism-diamond',
    title: 'Dojo IV · The Grand Diamond Enclosure',
    subtitle: '1-Launch Par · Ricochet Around the 4-Peg Diamond Ring to Vaporize the Core Fleet',
    hint: 'Aim into the top diamond peg at steep angle — the angled bumper geometry naturally chains all 4 vertices around the Singularity!',
    parLaunches: 1,
    shipStartX: 220,
    shipStartY: 300,
    recommendedAimDeg: -42,
    recommendedPowerPct: 0.94,
    wells: [
      {
        id: 'dojo4-well',
        name: 'Diamond Singularity',
        kind: 'NEUTRON_STAR',
        x: 520,
        y: 300,
        mass: 2900000,
        coreRadius: 24,
        skimRadius: 90,
      },
    ],
    bumpers: [
      { id: 'd4-b1', kind: 'CONSTELLATION_PEG', x: 520, y: 120, radius: 24, restitution: 1.26, harmonicNoteIndex: 0 },
      { id: 'd4-b2', kind: 'CONSTELLATION_PEG', x: 730, y: 300, radius: 24, restitution: 1.26, harmonicNoteIndex: 2 },
      { id: 'd4-b3', kind: 'CONSTELLATION_PEG', x: 520, y: 480, radius: 24, restitution: 1.26, harmonicNoteIndex: 4 },
      { id: 'd4-b4', kind: 'CONSTELLATION_PEG', x: 340, y: 300, radius: 22, restitution: 1.26, harmonicNoteIndex: 6 },
    ],
    targets: [
      { kind: 'VOID_DRONE', x: 615, y: 220, hp: 40 },
      { kind: 'VOID_DRONE', x: 615, y: 380, hp: 40 },
      { kind: 'VOID_DRONE', x: 430, y: 220, hp: 40 },
    ],
  },
  {
    puzzleNumber: 5,
    id: 'dojo-5-syzygy-master',
    title: 'Dojo V · Grandmaster Syzygy',
    subtitle: '1-Launch Par · Combine Wormhole Acceleration + Constellation Triangle to Shatter the Warden',
    hint: 'Use the [C] AI Trickshot Coach or launch through the top bumper into the Wormhole so your 1.65x exit encloses the Warden!',
    parLaunches: 1,
    shipStartX: 150,
    shipStartY: 460,
    recommendedAimDeg: -38,
    recommendedPowerPct: 0.96,
    wells: [
      {
        id: 'dojo5-bh',
        name: 'Syzygy Black Hole',
        kind: 'BLACK_HOLE',
        x: 370,
        y: 260,
        mass: 2700000,
        coreRadius: 32,
        skimRadius: 88,
        pairedWellId: 'dojo5-wh',
      },
      {
        id: 'dojo5-wh',
        name: 'Syzygy White Hole',
        kind: 'WHITE_HOLE',
        x: 650,
        y: 260,
        mass: -1000000,
        coreRadius: 26,
        skimRadius: 84,
        pairedWellId: 'dojo5-bh',
      },
    ],
    bumpers: [
      { id: 'd5-b1', kind: 'CONSTELLATION_PEG', x: 260, y: 170, radius: 24, restitution: 1.25, harmonicNoteIndex: 0 },
      { id: 'd5-b2', kind: 'CONSTELLATION_PEG', x: 770, y: 170, radius: 24, restitution: 1.25, harmonicNoteIndex: 2 },
      { id: 'd5-b3', kind: 'CONSTELLATION_PEG', x: 750, y: 420, radius: 24, restitution: 1.25, harmonicNoteIndex: 4 },
      { id: 'd5-b4', kind: 'OVERCHARGE_ANVIL', x: 540, y: 430, radius: 24, restitution: 1.28, harmonicNoteIndex: 6 },
    ],
    targets: [
      { kind: 'TESSERA_WARDEN', x: 720, y: 290, hp: 70 },
      { kind: 'VOID_DRONE', x: 640, y: 380, hp: 40 },
    ],
  },
];

export interface HorizonVerdictSpec {
  id: string;
  title: string;
  badge: string;
  summary: string;
}

export const HORIZON_VERDICTS: Record<string, HorizonVerdictSpec> = {
  SACRED_GEOMETER: {
    id: 'SACRED_GEOMETER',
    title: 'Architect of the Sacred Constellation',
    badge: '📐 MYTHIC GEOMETER',
    summary:
      'You turned the cosmos into a Euclidean laser loom, enclosing entire Void Armadas inside glowing Shoelace Polygons.',
  },
  HORIZON_DAREDEVIL: {
    id: 'HORIZON_DAREDEVIL',
    title: 'Photon-Sphere Daredevil',
    badge: '🌀 RELATIVISTIC ACE',
    summary:
      'You danced along the razor edge of the Event Horizon, riding Hawking radiation and Lorentz time dilation above 4.0x γ.',
  },
  WORLDLINE_WEAVER: {
    id: 'WORLDLINE_WEAVER',
    title: 'Chrono-Worldline Paradox Weaver',
    badge: '⏳ TEMPORAL TWIN',
    summary:
      'You folded your own spacetime worldline back upon itself, letting your Phantom Echo double-strike across causality.',
  },
  KARDASHEV_SOVEREIGN: {
    id: 'KARDASHEV_SOVEREIGN',
    title: 'Sovereign of Kardashev Type-III',
    badge: '👑 DYSON CONQUEROR',
    summary:
      'You shattered the Dyson Architect and mastered orbital momentum across every Singularity in the sector.',
  },
  ENTROPIC_DRIFT: {
    id: 'ENTROPIC_DRIFT',
    title: 'Claimed by the Singularity',
    badge: '🌑 TIDAL COLLAPSE',
    summary:
      'Gravitational shear overcame your hull—study the Counterfactual Trajectory Lab to see how another orbital archetype conquers this seed!',
  },
};
