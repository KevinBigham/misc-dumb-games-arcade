export type HazardTypeId =
  | 'scrap_reef'
  | 'cross_current_riptide'
  | 'acid_squall'
  | 'floating_minefield'
  | 'silt_fogbank'
  | 'rogue_wake';

export type ModuleId =
  | 'mod-twin-prop'
  | 'mod-icebreaker-prow'
  | 'mod-gyro-cradle'
  | 'mod-aux-tank'
  | 'mod-salvage-winch'
  | 'mod-bilge-rig';

export type ContractTypeId =
  | 'ctype-safe-ballast'
  | 'ctype-fragile-isotopes'
  | 'ctype-bulky-turbine'
  | 'ctype-precision-optics'
  | 'ctype-tide-express'
  | 'ctype-corrosive-sludge'
  | 'ctype-salvage-plate'
  | 'ctype-cryo-meds';

export interface BoatModuleDef {
  id: ModuleId;
  name: string;
  slotCost: number;
  creditCost: number;
  shortTag: string;
  description: string;
  counteredHazards: HazardTypeId[];
}

export interface HazardChoicePreview {
  id: 'press_on' | 'evade_burn' | 'patch_brace';
  label: string;
  summary: string;
}

export interface HazardDef {
  id: HazardTypeId;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  badgeColor: string;
  shortCode: string;
  description: string;
  consequenceSummary: string;
  counterModuleId: ModuleId | null;
  baseHullDamage: number;
  baseExtraFuel: number;
  threatensFragileCargo: boolean;
  isDebrisField: boolean;
  choices: HazardChoicePreview[];
}

export interface ArchipelagoNodeDef {
  id: string;
  code: string;
  name: string;
  zone: 'WEST_BAY' | 'NORTH_REACH' | 'CENTRAL_SPINE' | 'SOUTH_SHOALS' | 'EAST_TERMINUS';
  x: number;
  y: number;
  isPort: boolean;
  flavor: string;
}

export interface ArchipelagoEdgeDef {
  id: string;
  from: string;
  to: string;
  baseFuelCost: number;
  defaultHazard: HazardTypeId;
  channelType: 'OUTER_SAFE' | 'INNER_SHORTCUT' | 'CROSS_LINK';
}

export interface ContractTemplateDef {
  id: ContractTypeId;
  categoryName: string;
  cargoName: string;
  cargoSlots: number;
  basePayout: number;
  fragile: boolean;
  bulky: boolean;
  urgentMaxHops: number | null;
  description: string;
}

export const BOAT_MODULES: readonly BoatModuleDef[] = [
  {
    id: 'mod-twin-prop',
    name: 'Twin-Prop Outrigger',
    slotCost: 1,
    creditCost: 38,
    shortTag: 'OUTRIGGER',
    description: 'Negates Cross-Current Riptide extra fuel burn (+2 Fuel -> 0) and hull shear.',
    counteredHazards: ['cross_current_riptide', 'rogue_wake'],
  },
  {
    id: 'mod-icebreaker-prow',
    name: 'Reinforced Icebreaker Prow',
    slotCost: 2,
    creditCost: 52,
    shortTag: 'ARMOR PROW',
    description: 'Negates Scrap Reef hull damage (-10 -> 0) and cuts Floating Minefield damage by 67%.',
    counteredHazards: ['scrap_reef', 'floating_minefield'],
  },
  {
    id: 'mod-gyro-cradle',
    name: 'Gyro-Shock Cradle',
    slotCost: 1,
    creditCost: 40,
    shortTag: 'GYRO CRADLE',
    description: 'Protects Fragile cargo from Acid Squall & Rogue Wake shock penalties and reduces wave hull damage.',
    counteredHazards: ['acid_squall', 'rogue_wake'],
  },
  {
    id: 'mod-aux-tank',
    name: 'Auxiliary Reserve Tank',
    slotCost: 1,
    creditCost: 36,
    shortTag: 'AUX TANK',
    description: 'Adds +4 Max Internal Fuel capacity (10 -> 14) for long low-hazard outer detours.',
    counteredHazards: ['silt_fogbank'],
  },
  {
    id: 'mod-salvage-winch',
    name: 'Salvage Magnet Winch',
    slotCost: 1,
    creditCost: 42,
    shortTag: 'MAG WINCH',
    description: 'Dredges +12¢ to +18¢ bonus scrap credits whenever pressing through Scrap Reef, Minefield, or Silt Fogbank.',
    counteredHazards: ['scrap_reef', 'floating_minefield', 'silt_fogbank'],
  },
  {
    id: 'mod-bilge-rig',
    name: 'Bilge Pump & Patch Rig',
    slotCost: 1,
    creditCost: 34,
    shortTag: 'BILGE RIG',
    description: 'Boosts every Repair Kit from +10 Hull to +15 Hull and reduces Acid Squall corrosion by 3 Hull.',
    counteredHazards: ['acid_squall'],
  },
] as const;

export const HAZARDS: Record<HazardTypeId, HazardDef> = {
  scrap_reef: {
    id: 'scrap_reef',
    name: 'Scrap Reef',
    severity: 'HIGH',
    badgeColor: '#e05a47',
    shortCode: 'REEF',
    description: 'Jagged submerged rebar and collapsed gantry cranes just beneath the waterline.',
    consequenceSummary: '-10 Hull (0 Hull with Reinforced Icebreaker Prow) | Evade: +2 Fuel',
    counterModuleId: 'mod-icebreaker-prow',
    baseHullDamage: 10,
    baseExtraFuel: 0,
    threatensFragileCargo: true,
    isDebrisField: true,
    choices: [
      {
        id: 'press_on',
        label: 'Crunch Through Reef',
        summary: '-10 Hull (0 with Icebreaker Prow). +14¢ scrap if Magnet Winch installed.',
      },
      {
        id: 'evade_burn',
        label: 'Full-Throttle Channel Swing',
        summary: '+2 extra Fuel burn, 0 Hull damage, keeps Fragile cargo safe.',
      },
      {
        id: 'patch_brace',
        label: 'Spend Repair Kit on Fenders',
        summary: 'Consumes 1 Repair Kit to absorb impact (0 Hull damage, cargo safe).',
      },
    ],
  },
  cross_current_riptide: {
    id: 'cross_current_riptide',
    name: 'Cross-Current Riptide',
    severity: 'HIGH',
    badgeColor: '#d9822b',
    shortCode: 'RIPTIDE',
    description: 'Roaring tidal race pouring through breached industrial cofferdams.',
    consequenceSummary: '+2 Fuel & -4 Hull (0 penalty with Twin-Prop Outrigger)',
    counterModuleId: 'mod-twin-prop',
    baseHullDamage: 4,
    baseExtraFuel: 2,
    threatensFragileCargo: false,
    isDebrisField: false,
    choices: [
      {
        id: 'press_on',
        label: 'Hold Heading Against Current',
        summary: '+2 extra Fuel & -4 Hull (0 extra Fuel & 0 Hull with Twin-Prop Outrigger).',
      },
      {
        id: 'evade_burn',
        label: 'High-RPM Ferry Glide',
        summary: '+1 extra Fuel burn, 0 Hull damage.',
      },
      {
        id: 'patch_brace',
        label: 'Spend Repair Kit on Rudder Strut',
        summary: 'Consumes 1 Repair Kit, 0 extra Fuel, 0 Hull damage.',
      },
    ],
  },
  acid_squall: {
    id: 'acid_squall',
    name: 'Acid Squall',
    severity: 'MEDIUM',
    badgeColor: '#b8c93a',
    shortCode: 'SQUALL',
    description: 'Blistering sulfur rain and violent cross-chop rolling off the condenser stacks.',
    consequenceSummary: '-7 Hull & damages Fragile cargo (-16¢) unless Gyro-Shock Cradle installed',
    counterModuleId: 'mod-gyro-cradle',
    baseHullDamage: 7,
    baseExtraFuel: 0,
    threatensFragileCargo: true,
    isDebrisField: false,
    choices: [
      {
        id: 'press_on',
        label: 'Weather the Squall',
        summary: '-7 Hull (-3 with Gyro Cradle/Bilge Rig). Fragile cargo loses 16¢ without Gyro Cradle.',
      },
      {
        id: 'evade_burn',
        label: 'Outrun Squall Curtain',
        summary: '+2 extra Fuel burn, 0 Hull damage, Fragile cargo protected.',
      },
      {
        id: 'patch_brace',
        label: 'Seal Hatches with Repair Kit',
        summary: 'Consumes 1 Repair Kit, 0 Hull damage, Fragile cargo protected.',
      },
    ],
  },
  floating_minefield: {
    id: 'floating_minefield',
    name: 'Floating Minefield',
    severity: 'HIGH',
    badgeColor: '#cf3c5c',
    shortCode: 'MINES',
    description: 'Drifting tethered sea-mines and tangled buoyancy chains in deep water.',
    consequenceSummary: '-12 Hull (-4 Hull with Icebreaker Prow) | +18¢ with Magnet Winch',
    counterModuleId: 'mod-icebreaker-prow',
    baseHullDamage: 12,
    baseExtraFuel: 0,
    threatensFragileCargo: true,
    isDebrisField: true,
    choices: [
      {
        id: 'press_on',
        label: 'Thread the Mine Tethers',
        summary: '-12 Hull (-4 with Icebreaker Prow). +18¢ scrap if Magnet Winch installed.',
      },
      {
        id: 'evade_burn',
        label: 'Sonar Slalom Burn',
        summary: '+2 extra Fuel burn, -2 Hull, Fragile cargo safe.',
      },
      {
        id: 'patch_brace',
        label: 'Cut Cable & Patch Plating',
        summary: 'Consumes 1 Repair Kit, 0 Hull damage, Fragile cargo safe.',
      },
    ],
  },
  silt_fogbank: {
    id: 'silt_fogbank',
    name: 'Silt Fogbank',
    severity: 'LOW',
    badgeColor: '#5da7b8',
    shortCode: 'FOG',
    description: 'Dense yellow dredge-mist hiding shifting mudbanks along the outer perimeter.',
    consequenceSummary: '+1 Fuel drift & -3 Hull (0 Hull on Radar Burn)',
    counterModuleId: 'mod-aux-tank',
    baseHullDamage: 3,
    baseExtraFuel: 1,
    threatensFragileCargo: false,
    isDebrisField: true,
    choices: [
      {
        id: 'press_on',
        label: 'Dead-Reckoning Crawl',
        summary: '+1 extra Fuel & -3 Hull. +12¢ flotsam if Magnet Winch installed.',
      },
      {
        id: 'evade_burn',
        label: 'Radar Sweep & Trim',
        summary: '+1 extra Fuel burn, 0 Hull damage.',
      },
      {
        id: 'patch_brace',
        label: 'Pole Off Mudbar with Kit',
        summary: 'Consumes 1 Repair Kit, 0 extra Fuel, 0 Hull damage.',
      },
    ],
  },
  rogue_wake: {
    id: 'rogue_wake',
    name: 'Rogue Wake',
    severity: 'LOW',
    badgeColor: '#4c91d1',
    shortCode: 'WAKE',
    description: 'Steep rolling displacement swells rebounding off sunken drydock walls.',
    consequenceSummary: '-5 Hull & jolts Fragile cargo (-12¢) unless Gyro-Shock Cradle installed',
    counterModuleId: 'mod-gyro-cradle',
    baseHullDamage: 5,
    baseExtraFuel: 0,
    threatensFragileCargo: true,
    isDebrisField: false,
    choices: [
      {
        id: 'press_on',
        label: 'Punch Through the Crest',
        summary: '-5 Hull (-1 with Gyro Cradle or Twin-Prop). Protects Fragile cargo with Gyro Cradle.',
      },
      {
        id: 'evade_burn',
        label: 'Quarter the Swell',
        summary: '+1 extra Fuel burn, 0 Hull damage, Fragile cargo safe.',
      },
      {
        id: 'patch_brace',
        label: 'Shoring Struts (1 Repair Kit)',
        summary: 'Consumes 1 Repair Kit, 0 Hull damage, Fragile cargo safe.',
      },
    ],
  },
};

export const ARCHIPELAGO_NODES: readonly ArchipelagoNodeDef[] = [
  {
    id: 'node-01-anchorhead',
    code: 'N01',
    name: 'Anchorhead Drydock',
    zone: 'WEST_BAY',
    x: 88,
    y: 245,
    isPort: true,
    flavor: 'Main salvage guild slipway and diesel bunkering pier.',
  },
  {
    id: 'node-02-siltgate',
    code: 'N02',
    name: 'Siltgate Lock',
    zone: 'NORTH_REACH',
    x: 195,
    y: 105,
    isPort: true,
    flavor: 'Flooded canal lock guarding the calm northern dredge channel.',
  },
  {
    id: 'node-03-slag-reef',
    code: 'N03',
    name: 'Slag-Toothed Narrows',
    zone: 'CENTRAL_SPINE',
    x: 245,
    y: 248,
    isPort: true,
    flavor: 'Collapsed steelworks causeway offering a treacherous shortcut east.',
  },
  {
    id: 'node-04-brine-pumps',
    code: 'N04',
    name: 'Brine-Pump Station 4',
    zone: 'SOUTH_SHOALS',
    x: 205,
    y: 390,
    isPort: true,
    flavor: 'Half-sunken desalination rig along the southern shoal loop.',
  },
  {
    id: 'node-05-cinder-wharf',
    code: 'N05',
    name: 'Cinder-Barge Wharf',
    zone: 'NORTH_REACH',
    x: 370,
    y: 90,
    isPort: true,
    flavor: 'Floating coal-and-isotope transfer depot anchored to refinery pilings.',
  },
  {
    id: 'node-06-maelstrom-spillway',
    code: 'N06',
    name: 'Spillway Weir',
    zone: 'CENTRAL_SPINE',
    x: 400,
    y: 245,
    isPort: true,
    flavor: 'High-velocity turbine sluice where four tidal channels collide.',
  },
  {
    id: 'node-07-rust-atoll',
    code: 'N07',
    name: 'Rust-Chain Atoll',
    zone: 'SOUTH_SHOALS',
    x: 385,
    y: 395,
    isPort: true,
    flavor: 'Ring oflashed tanker hulls serving as a bustling scrap market.',
  },
  {
    id: 'node-08-sulfur-stacks',
    code: 'N08',
    name: 'Sulfur Condenser Stacks',
    zone: 'NORTH_REACH',
    x: 545,
    y: 100,
    isPort: true,
    flavor: 'Smoking chemical distillation towers paying top credit for optics and valves.',
  },
  {
    id: 'node-09-mine-channel',
    code: 'N09',
    name: 'Chain-Boom Trench',
    zone: 'CENTRAL_SPINE',
    x: 555,
    y: 250,
    isPort: true,
    flavor: 'Old naval cordon bristling with tethered mines and high-grade alloy scrap.',
  },
  {
    id: 'node-10-dredge-harbor',
    code: 'N10',
    name: 'Dredge-Bucket Harbor',
    zone: 'SOUTH_SHOALS',
    x: 560,
    y: 395,
    isPort: true,
    flavor: 'Sheltered basin beneath a mammoth bucket-wheel excavator.',
  },
  {
    id: 'node-11-beacon-spindle',
    code: 'N11',
    name: 'Beacon Spindle Relay',
    zone: 'EAST_TERMINUS',
    x: 700,
    y: 160,
    isPort: true,
    flavor: 'Radio telemetry spire guiding convoys around the eastern fogbanks.',
  },
  {
    id: 'node-12-iron-citadel',
    code: 'N12',
    name: 'Iron Foundry Citadel',
    zone: 'EAST_TERMINUS',
    x: 710,
    y: 335,
    isPort: true,
    flavor: 'Offshore blast-furnace fortress that smelts heavy salvage for the archipelago.',
  },
] as const;

export const ARCHIPELAGO_EDGES: readonly ArchipelagoEdgeDef[] = [
  // Outer North Calm Corridor
  {
    id: 'edge-01-02',
    from: 'node-01-anchorhead',
    to: 'node-02-siltgate',
    baseFuelCost: 2,
    defaultHazard: 'silt_fogbank',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-02-05',
    from: 'node-02-siltgate',
    to: 'node-05-cinder-wharf',
    baseFuelCost: 2,
    defaultHazard: 'silt_fogbank',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-05-08',
    from: 'node-05-cinder-wharf',
    to: 'node-08-sulfur-stacks',
    baseFuelCost: 2,
    defaultHazard: 'rogue_wake',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-08-11',
    from: 'node-08-sulfur-stacks',
    to: 'node-11-beacon-spindle',
    baseFuelCost: 2,
    defaultHazard: 'silt_fogbank',
    channelType: 'OUTER_SAFE',
  },

  // Outer South Calm Corridor
  {
    id: 'edge-01-04',
    from: 'node-01-anchorhead',
    to: 'node-04-brine-pumps',
    baseFuelCost: 2,
    defaultHazard: 'rogue_wake',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-04-07',
    from: 'node-04-brine-pumps',
    to: 'node-07-rust-atoll',
    baseFuelCost: 2,
    defaultHazard: 'silt_fogbank',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-07-10',
    from: 'node-07-rust-atoll',
    to: 'node-10-dredge-harbor',
    baseFuelCost: 2,
    defaultHazard: 'silt_fogbank',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-10-12',
    from: 'node-10-dredge-harbor',
    to: 'node-12-iron-citadel',
    baseFuelCost: 2,
    defaultHazard: 'rogue_wake',
    channelType: 'OUTER_SAFE',
  },
  {
    id: 'edge-11-12',
    from: 'node-11-beacon-spindle',
    to: 'node-12-iron-citadel',
    baseFuelCost: 2,
    defaultHazard: 'silt_fogbank',
    channelType: 'OUTER_SAFE',
  },

  // Inner Direct High-Hazard Shortcuts
  {
    id: 'edge-01-03',
    from: 'node-01-anchorhead',
    to: 'node-03-slag-reef',
    baseFuelCost: 1,
    defaultHazard: 'scrap_reef',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-03-05',
    from: 'node-03-slag-reef',
    to: 'node-05-cinder-wharf',
    baseFuelCost: 1,
    defaultHazard: 'scrap_reef',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-03-06',
    from: 'node-03-slag-reef',
    to: 'node-06-maelstrom-spillway',
    baseFuelCost: 1,
    defaultHazard: 'cross_current_riptide',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-03-07',
    from: 'node-03-slag-reef',
    to: 'node-07-rust-atoll',
    baseFuelCost: 1,
    defaultHazard: 'scrap_reef',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-06-08',
    from: 'node-06-maelstrom-spillway',
    to: 'node-08-sulfur-stacks',
    baseFuelCost: 1,
    defaultHazard: 'acid_squall',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-06-09',
    from: 'node-06-maelstrom-spillway',
    to: 'node-09-mine-channel',
    baseFuelCost: 1,
    defaultHazard: 'floating_minefield',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-06-10',
    from: 'node-06-maelstrom-spillway',
    to: 'node-10-dredge-harbor',
    baseFuelCost: 1,
    defaultHazard: 'cross_current_riptide',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-09-11',
    from: 'node-09-mine-channel',
    to: 'node-11-beacon-spindle',
    baseFuelCost: 1,
    defaultHazard: 'scrap_reef',
    channelType: 'INNER_SHORTCUT',
  },
  {
    id: 'edge-09-12',
    from: 'node-09-mine-channel',
    to: 'node-12-iron-citadel',
    baseFuelCost: 1,
    defaultHazard: 'floating_minefield',
    channelType: 'INNER_SHORTCUT',
  },

  // Cross-Link Connectors
  {
    id: 'edge-02-03',
    from: 'node-02-siltgate',
    to: 'node-03-slag-reef',
    baseFuelCost: 2,
    defaultHazard: 'rogue_wake',
    channelType: 'CROSS_LINK',
  },
  {
    id: 'edge-04-03',
    from: 'node-04-brine-pumps',
    to: 'node-03-slag-reef',
    baseFuelCost: 2,
    defaultHazard: 'rogue_wake',
    channelType: 'CROSS_LINK',
  },
  {
    id: 'edge-05-06',
    from: 'node-05-cinder-wharf',
    to: 'node-06-maelstrom-spillway',
    baseFuelCost: 2,
    defaultHazard: 'cross_current_riptide',
    channelType: 'CROSS_LINK',
  },
  {
    id: 'edge-06-07',
    from: 'node-06-maelstrom-spillway',
    to: 'node-07-rust-atoll',
    baseFuelCost: 2,
    defaultHazard: 'rogue_wake',
    channelType: 'CROSS_LINK',
  },
  {
    id: 'edge-08-09',
    from: 'node-08-sulfur-stacks',
    to: 'node-09-mine-channel',
    baseFuelCost: 2,
    defaultHazard: 'acid_squall',
    channelType: 'CROSS_LINK',
  },
  {
    id: 'edge-09-10',
    from: 'node-09-mine-channel',
    to: 'node-10-dredge-harbor',
    baseFuelCost: 2,
    defaultHazard: 'scrap_reef',
    channelType: 'CROSS_LINK',
  },
] as const;

export const CONTRACT_TEMPLATES: readonly ContractTemplateDef[] = [
  {
    id: 'ctype-safe-ballast',
    categoryName: 'Safe Modest Freight',
    cargoName: 'Sealed Ballast Bearings',
    cargoSlots: 1,
    basePayout: 44,
    fragile: false,
    bulky: false,
    urgentMaxHops: null,
    description: 'Compact waterproof crate of cast-iron bearings. Fits in a single Hold Slot and shrugs off spray.',
  },
  {
    id: 'ctype-fragile-isotopes',
    categoryName: 'Fragile Isotope Consignment',
    cargoName: 'Volatile Isotope Cores',
    cargoSlots: 3,
    basePayout: 96,
    fragile: true,
    bulky: true,
    urgentMaxHops: null,
    description: 'Bulky 3-Slot lead-glass containment rack. Pays double, but shocks in Acid Squalls or Reefs without a Gyro-Shock Cradle.',
  },
  {
    id: 'ctype-bulky-turbine',
    categoryName: 'Bulky Heavy Salvage',
    cargoName: 'Submerged Turbine Rotor',
    cargoSlots: 3,
    basePayout: 88,
    fragile: false,
    bulky: true,
    urgentMaxHops: null,
    description: 'Massive 3-Slot bronze rotor assembly. Crowds out modules and spare fuel drums, forcing strict hold budgeting.',
  },
  {
    id: 'ctype-precision-optics',
    categoryName: 'Fragile Precision Optics',
    cargoName: 'Sonar Gyro-Lens Array',
    cargoSlots: 2,
    basePayout: 74,
    fragile: true,
    bulky: false,
    urgentMaxHops: null,
    description: 'Delicate 2-Slot quartz rangefinder mirrors. Vulnerable to Acid Squalls and Rogue Wakes unless cradled.',
  },
  {
    id: 'ctype-tide-express',
    categoryName: 'Urgent Tide-Window Express',
    cargoName: 'Lock-Gate Hydraulic Valves',
    cargoSlots: 1,
    basePayout: 64,
    fragile: false,
    bulky: false,
    urgentMaxHops: 4,
    description: 'Light 1-Slot priority parts with a +15¢ tide-window bonus if delivered within 4 hops.',
  },
  {
    id: 'ctype-corrosive-sludge',
    categoryName: 'Fragile Chemical Freight',
    cargoName: 'Pressurized Sulfur Slurry',
    cargoSlots: 2,
    basePayout: 70,
    fragile: true,
    bulky: false,
    urgentMaxHops: null,
    description: 'Glass-lined carboys occupying 2 Slots. High industrial payout if kept dry and level.',
  },
  {
    id: 'ctype-salvage-plate',
    categoryName: 'Standard Industrial Freight',
    cargoName: 'Riveted Boiler Plating',
    cargoSlots: 2,
    basePayout: 58,
    fragile: false,
    bulky: false,
    urgentMaxHops: null,
    description: 'Reliable 2-Slot stack of salvaged hull plates. Weatherproof and steady profit.',
  },
  {
    id: 'ctype-cryo-meds',
    categoryName: 'Urgent Medical Relay',
    cargoName: 'Cryo-Sealed Plasma Packs',
    cargoSlots: 1,
    basePayout: 54,
    fragile: true,
    bulky: false,
    urgentMaxHops: 5,
    description: 'Compact 1-Slot cold-chain canister for outlying rigs.',
  },
] as const;

export function getNodeById(nodeId: string): ArchipelagoNodeDef {
  const found = ARCHIPELAGO_NODES.find((n) => n.id === nodeId);
  if (!found) {
    throw new Error(`Unknown archipelago node: ${nodeId}`);
  }
  return found;
}

export function getModuleById(moduleId: ModuleId): BoatModuleDef {
  const found = BOAT_MODULES.find((m) => m.id === moduleId);
  if (!found) {
    throw new Error(`Unknown boat module: ${moduleId}`);
  }
  return found;
}
