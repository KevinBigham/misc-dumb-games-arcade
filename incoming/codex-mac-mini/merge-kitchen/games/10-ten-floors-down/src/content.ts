import { HeroClassId, PotionColorId, PotionEffectId } from './config';

export interface PotionColorDef {
  id: PotionColorId;
  label: string;
  hex: string;
  liquidDesc: string;
}

export interface PotionEffectDef {
  id: PotionEffectId;
  name: string;
  shortName: string;
  isHarmfulToDrink: boolean;
  preferThrow: boolean;
  drinkSummary: string;
  throwSummary: string;
}

export interface WeaponDef {
  id: string;
  name: string;
  tier: number;
  attackBonus: number;
  attackTicks: number;
  description: string;
}

export interface ArmorDef {
  id: string;
  name: string;
  tier: number;
  defenseBonus: number;
  maxHpBonus: number;
  description: string;
}

export interface HeroClassDef {
  id: HeroClassId;
  name: string;
  title: string;
  accentColor: string;
  glyph: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  moveTicks: number;
  startingWeapon: WeaponDef;
  startingArmor: ArmorDef;
  preIdentifiedEffects: PotionEffectId[];
  startingPotions: PotionEffectId[];
  startsWithUpgradeScroll: boolean;
  alchemyBonusCharges: number;
  thrownPotionMultiplier: number;
  abilityName: string;
  abilityCooldownTicks: number;
  abilityCostTicks: number;
  abilityDescription: string;
  passiveDescription: string;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  glyph: string;
  color: string;
  minFloor: number;
  maxFloor: number;
  maxHp: number;
  attack: number;
  defense: number;
  moveTicks: number;
  attackTicks: number;
  rangedRange?: number;
  inflictsStatus?: 'poison' | 'burn' | 'chill';
  isBoss?: boolean;
  bossFloor?: number;
  description: string;
}

export const POTION_COLORS: readonly PotionColorDef[] = [
  {
    id: 'crimson',
    label: 'Crimson Vial',
    hex: '#ef4444',
    liquidDesc: 'Swirling ruby-red alchemical fluid',
  },
  {
    id: 'amber',
    label: 'Amber Vial',
    hex: '#f59e0b',
    liquidDesc: 'Viscous golden-ochre draught',
  },
  {
    id: 'viridian',
    label: 'Viridian Vial',
    hex: '#10b981',
    liquidDesc: 'Luminescent emerald distillate',
  },
  {
    id: 'azure',
    label: 'Azure Vial',
    hex: '#38bdf8',
    liquidDesc: 'Frost-rimmed sapphire tincture',
  },
  {
    id: 'violet',
    label: 'Violet Vial',
    hex: '#a855f7',
    liquidDesc: 'Fuming amethyst vapor-essence',
  },
  {
    id: 'obsidian',
    label: 'Obsidian Vial',
    hex: '#94a3b8',
    liquidDesc: 'Dense midnight-black suspension',
  },
] as const;

export const POTION_EFFECTS: Record<PotionEffectId, PotionEffectDef> = {
  mending: {
    id: 'mending',
    name: 'Potion of Mending',
    shortName: 'Mending',
    isHarmfulToDrink: false,
    preferThrow: false,
    drinkSummary: 'Restores 45% Max HP (min 28) & cures Poison, Burn, and Chill.',
    throwSummary: 'Splashes restorative mist on target tile, healing any unit hit.',
  },
  liquid_flame: {
    id: 'liquid_flame',
    name: 'Potion of Liquid Flame',
    shortName: 'Liquid Flame',
    isHarmfulToDrink: true,
    preferThrow: true,
    drinkSummary: 'HAZARD: Sets YOU on fire for 30 ticks (18 dmg), though grants +3 Fire ATK.',
    throwSummary: 'Shatters in a 3x3 firestorm (12 fire dmg + ignites tiles & enemies for 30 ticks).',
  },
  frost_mist: {
    id: 'frost_mist',
    name: 'Potion of Frost Mist',
    shortName: 'Frost Mist',
    isHarmfulToDrink: true,
    preferThrow: true,
    drinkSummary: 'Chills self (+3 tick action penalty for 20 ticks, douses fire, +5 Ice Armor).',
    throwSummary: 'Freezes enemies in a 3x3 blast (8 cold dmg + Stuns/Freezes for 20 ticks).',
  },
  might: {
    id: 'might',
    name: 'Potion of Might',
    shortName: 'Might',
    isHarmfulToDrink: false,
    preferThrow: false,
    drinkSummary: 'Permanently grants +2 Base Attack, +12 Max HP, and heals 12 HP.',
    throwSummary: 'Shatters harmlessly on stone (wastes the draught, but identifies the color).',
  },
  shadow_veil: {
    id: 'shadow_veil',
    name: 'Potion of Shadow Veil',
    shortName: 'Shadow Veil',
    isHarmfulToDrink: false,
    preferThrow: false,
    drinkSummary: 'Grants 50 ticks of Invisibility; next strike or throw deals 2.0x Ambush Crit!',
    throwSummary: 'Releases dark fog in 3x3 area, stunning monsters for 15 ticks.',
  },
  caustic_gas: {
    id: 'caustic_gas',
    name: 'Potion of Caustic Gas',
    shortName: 'Caustic Gas',
    isHarmfulToDrink: true,
    preferThrow: true,
    drinkSummary: 'HAZARD: Chokes YOU with corrosive poison (21 dmg over 30 ticks).',
    throwSummary: 'Blankets a 3x3 room area in toxic gas (9 dmg + Poison & -2 DEF for 40 ticks).',
  },
};

export const POTION_EFFECT_ORDER: readonly PotionEffectId[] = [
  'mending',
  'liquid_flame',
  'frost_mist',
  'might',
  'shadow_veil',
  'caustic_gas',
] as const;

export const WEAPON_CATALOG: readonly WeaponDef[] = [
  {
    id: 'iron_broadsword',
    name: 'Iron Broadsword',
    tier: 1,
    attackBonus: 3,
    attackTicks: 10,
    description: 'Balanced legion blade (10 ticks per strike).',
  },
  {
    id: 'twin_night_daggers',
    name: 'Twin Night Daggers',
    tier: 1,
    attackBonus: 3,
    attackTicks: 8,
    description: 'Swift dual stilettos (8 ticks per strike; outpaces standard monsters).',
  },
  {
    id: 'runed_catalyst_staff',
    name: 'Runed Catalyst Staff',
    tier: 1,
    attackBonus: 2,
    attackTicks: 9,
    description: 'Channeling stave tipped with alchemical brass (9 ticks per strike).',
  },
  {
    id: 'serrated_gladius',
    name: 'Serrated Gladius',
    tier: 2,
    attackBonus: 6,
    attackTicks: 9,
    description: 'Fast, razor-toothed shortblade found in mid-depth vaults (9 ticks).',
  },
  {
    id: 'warhammer_of_breach',
    name: 'Breach Warhammer',
    tier: 2,
    attackBonus: 8,
    attackTicks: 12,
    description: 'Heavy crushing maul (12 ticks — watch the turn clock against fast foes!).',
  },
  {
    id: 'whisper_kris',
    name: 'Whisper Assassin Kris',
    tier: 3,
    attackBonus: 8,
    attackTicks: 8,
    description: 'Masterwork 8-tick blade that slices before monsters can counter.',
  },
  {
    id: 'executioner_greataxe',
    name: 'Executioner Greataxe',
    tier: 3,
    attackBonus: 12,
    attackTicks: 12,
    description: 'Massive two-handed cleaver (12 ticks; devastating single hits).',
  },
  {
    id: 'sunforged_halberd',
    name: 'Sunforged Halberd',
    tier: 4,
    attackBonus: 14,
    attackTicks: 10,
    description: 'Relic polearm of the deep sanctuary (10 ticks, +14 ATK).',
  },
];

export const ARMOR_CATALOG: readonly ArmorDef[] = [
  {
    id: 'riveted_mail',
    name: 'Riveted Brigandine',
    tier: 1,
    defenseBonus: 2,
    maxHpBonus: 0,
    description: 'Sturdy iron-studded tunic.',
  },
  {
    id: 'shadow_cloak',
    name: 'Shadowweave Cloak',
    tier: 1,
    defenseBonus: 1,
    maxHpBonus: 4,
    description: 'Light, soundless mantle woven for subterranean stealth.',
  },
  {
    id: 'alchemist_coat',
    name: 'Lead-Lined Greatcoat',
    tier: 1,
    defenseBonus: 2,
    maxHpBonus: 4,
    description: 'Acid-resistant leather coat with reinforced vial loops.',
  },
  {
    id: 'warden_chainmail',
    name: 'Warden Chainmail',
    tier: 2,
    defenseBonus: 4,
    maxHpBonus: 10,
    description: 'Interlinked steel rings forged for dungeon sentries.',
  },
  {
    id: 'dwarven_plate',
    name: 'Dwarven Runed Plate',
    tier: 3,
    defenseBonus: 7,
    maxHpBonus: 18,
    description: 'Heavy rune-etched breastplate that shrugs off brutal blows.',
  },
  {
    id: 'abyssal_aegis',
    name: 'Abyssal Aegis Armor',
    tier: 4,
    defenseBonus: 10,
    maxHpBonus: 28,
    description: 'Mythic obsidian carapace recovered from the lower depths.',
  },
];

export const HERO_CLASSES: Record<HeroClassId, HeroClassDef> = {
  vanguard: {
    id: 'vanguard',
    name: 'Ironclad Vanguard',
    title: 'Frontline Bastion',
    accentColor: '#f59e0b',
    glyph: 'V',
    baseHp: 94,
    baseAttack: 10,
    baseDefense: 3,
    moveTicks: 10,
    startingWeapon: WEAPON_CATALOG[0],
    startingArmor: ARMOR_CATALOG[0],
    preIdentifiedEffects: ['mending'],
    startingPotions: ['mending', 'liquid_flame'],
    startsWithUpgradeScroll: true,
    alchemyBonusCharges: 0,
    thrownPotionMultiplier: 1.0,
    abilityName: 'Shield Bash',
    abilityCooldownTicks: 80,
    abilityCostTicks: 8,
    abilityDescription:
      'Slam an adjacent foe for 1.4x melee damage, Stun it for 20 ticks, and cancel any Boss Telegraph.',
    passiveDescription:
      'Starts with Potion of Mending pre-identified, high HP (94), and +1 bonus HP per Scroll of Upgrade.',
  },
  rogue: {
    id: 'rogue',
    name: 'Shadow Rogue',
    title: '8-Tick Ambush Tactician',
    accentColor: '#38bdf8',
    glyph: 'R',
    baseHp: 74,
    baseAttack: 9,
    baseDefense: 1,
    moveTicks: 8,
    startingWeapon: WEAPON_CATALOG[1],
    startingArmor: ARMOR_CATALOG[1],
    preIdentifiedEffects: ['shadow_veil'],
    startingPotions: ['shadow_veil', 'caustic_gas'],
    startsWithUpgradeScroll: true,
    alchemyBonusCharges: 0,
    thrownPotionMultiplier: 1.15,
    abilityName: 'Smoke Bomb',
    abilityCooldownTicks: 75,
    abilityCostTicks: 6,
    abilityDescription:
      'Vanish for 35 ticks of Shadow Veil Invisibility (next strike deals 2.0x Ambush Crit) & stun adjacent foes for 15 ticks.',
    passiveDescription:
      'Moves & strikes in 8 Ticks (vs standard 10). Starts with Potion of Shadow Veil pre-identified.',
  },
  alchemist: {
    id: 'alchemist',
    name: 'Arcane Alchemist',
    title: 'Master of Volatile Vials',
    accentColor: '#a855f7',
    glyph: 'A',
    baseHp: 80,
    baseAttack: 8,
    baseDefense: 2,
    moveTicks: 10,
    startingWeapon: WEAPON_CATALOG[2],
    startingArmor: ARMOR_CATALOG[2],
    preIdentifiedEffects: ['liquid_flame', 'frost_mist'],
    startingPotions: ['liquid_flame', 'frost_mist', 'mending'],
    startsWithUpgradeScroll: true,
    alchemyBonusCharges: 1,
    thrownPotionMultiplier: 1.35,
    abilityName: 'Arcane Catalyst Bolt',
    abilityCooldownTicks: 65,
    abilityCostTicks: 8,
    abilityDescription:
      'Fires an arcane bolt at the nearest visible monster (range 5) for 12 + 2*Floor damage & -2 DEF.',
    passiveDescription:
      'Starts with Liquid Flame & Frost Mist pre-identified, +35% Thrown Vial damage, and +1 Alchemy Desk charge per floor.',
  },
};

export const MONSTER_TEMPLATES: readonly MonsterTemplate[] = [
  {
    id: 'sewer_rat',
    name: 'Albino Sewer Rat',
    glyph: 'r',
    color: '#cbd5e1',
    minFloor: 1,
    maxFloor: 2,
    maxHp: 22,
    attack: 7,
    defense: 0,
    moveTicks: 8,
    attackTicks: 8,
    description: 'Fast 8-tick scavenger that can double-attack slow weapon swingers.',
  },
  {
    id: 'gnoll_scout',
    name: 'Gnoll Spear-Scout',
    glyph: 'g',
    color: '#f59e0b',
    minFloor: 1,
    maxFloor: 3,
    maxHp: 30,
    attack: 9,
    defense: 1,
    moveTicks: 10,
    attackTicks: 10,
    description: 'Aggressive hyena-kin patrolling the upper stonework.',
  },
  {
    id: 'plague_swarm',
    name: 'Carrion Fly Swarm',
    glyph: 's',
    color: '#84cc16',
    minFloor: 2,
    maxFloor: 4,
    maxHp: 34,
    attack: 8,
    defense: 0,
    moveTicks: 9,
    attackTicks: 9,
    inflictsStatus: 'poison',
    description: 'Venomous insect cloud that inflicts Poison on hit.',
  },
  {
    id: 'skeleton_guard',
    name: 'Ossuary Skeleton',
    glyph: 'k',
    color: '#e2e8f0',
    minFloor: 3,
    maxFloor: 6,
    maxHp: 44,
    attack: 12,
    defense: 3,
    moveTicks: 10,
    attackTicks: 10,
    description: 'Animated legionary with hardened bone armor.',
  },
  {
    id: 'prison_brute',
    name: 'Shackled Brute',
    glyph: 'B',
    color: '#f97316',
    minFloor: 4,
    maxFloor: 7,
    maxHp: 62,
    attack: 16,
    defense: 3,
    moveTicks: 11,
    attackTicks: 12,
    description: 'Lumbering 12-tick bruiser that hits like a battering ram.',
  },
  {
    id: 'cinder_shaman',
    name: 'Cinder Pyromancer',
    glyph: 'c',
    color: '#ef4444',
    minFloor: 6,
    maxFloor: 9,
    maxHp: 48,
    attack: 14,
    defense: 2,
    moveTicks: 10,
    attackTicks: 11,
    rangedRange: 3,
    inflictsStatus: 'burn',
    description: 'Hurls searing embers from up to 3 tiles away.',
  },
  {
    id: 'void_stalker',
    name: 'Void Stalker',
    glyph: 'v',
    color: '#c084fc',
    minFloor: 7,
    maxFloor: 10,
    maxHp: 56,
    attack: 17,
    defense: 3,
    moveTicks: 8,
    attackTicks: 8,
    description: 'Lethal 8-tick shadow predator of the lower halls.',
  },
  {
    id: 'golem_sentinel',
    name: 'Runic Automaton',
    glyph: 'G',
    color: '#38bdf8',
    minFloor: 8,
    maxFloor: 10,
    maxHp: 84,
    attack: 21,
    defense: 6,
    moveTicks: 13,
    attackTicks: 14,
    description: 'Slow 14-tick construct with massive armor plating.',
  },
  {
    id: 'iron_warden',
    name: 'The Iron Warden',
    glyph: 'W',
    color: '#fbbf24',
    minFloor: 5,
    maxFloor: 5,
    maxHp: 135,
    attack: 18,
    defense: 4,
    moveTicks: 10,
    attackTicks: 10,
    isBoss: true,
    bossFloor: 5,
    description:
      'Floor 5 Mini-Boss: Telegraphs a 3x3 Seismic Chain Slam every 3 turns. Step out of red warning tiles or stun him!',
  },
  {
    id: 'abyssal_core',
    name: 'The Abyssal Core',
    glyph: 'Ω',
    color: '#f43f5e',
    minFloor: 10,
    maxFloor: 10,
    maxHp: 210,
    attack: 22,
    defense: 5,
    moveTicks: 10,
    attackTicks: 10,
    isBoss: true,
    bossFloor: 10,
    description:
      'Floor 10 Final Boss: Ancient heart of the dungeon. Telegraphs multi-tile Abyssal Void Eruptions across the chamber.',
  },
];
