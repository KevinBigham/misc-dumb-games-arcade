import {
  AutomationRuleId,
  ChapterId,
  EndingId,
  InitialRepairId,
  ResourceId,
  StationId,
} from './config';

export interface ResourceCost {
  watts?: number;
  alloy?: number;
  cipher?: number;
}

export interface ResourceDefinition {
  id: ResourceId;
  name: string;
  shortName: string;
  unit: string;
  description: string;
  unlockReason: string;
}

export interface ChapterDefinition {
  id: ChapterId;
  title: string;
  subtitle: string;
  openingLog: string;
  transformationNote: string;
}

export interface InitialRepairDefinition {
  id: InitialRepairId;
  name: string;
  cost: ResourceCost;
  summary: string;
  effectDescription: string;
}

export interface RemoteStationDefinition {
  id: StationId;
  name: string;
  sector: string;
  coordinates: { x: number; y: number };
  activationCost: ResourceCost;
  wattUpkeepPerCycle: number;
  passiveYieldPerCycle: ResourceCost;
  description: string;
  tradeoffNote: string;
}

export type AutomationConditionType =
  | 'watts_pct_below'
  | 'watts_pct_at_least'
  | 'station_powered';

export interface AutomationRuleDefinition {
  id: AutomationRuleId;
  name: string;
  unlockChapter: ChapterId;
  unlockCost: ResourceCost;
  conditionType: AutomationConditionType;
  thresholdPct?: number;
  requiredStationId?: StationId;
  inputs: ResourceCost;
  outputs: ResourceCost & { throttleNonCriticalStations?: boolean };
  conditionSummary: string;
  inputSummary: string;
  outputSummary: string;
  description: string;
}

export interface MessageEventChoice {
  id: string;
  label: string;
  description: string;
  costs: ResourceCost;
  rewards: ResourceCost;
  networkIntegrityDelta: number;
  convoyReadinessDelta: number;
  powerStationId?: StationId;
  outcomeLog: string;
}

export interface MessageEventDefinition {
  id: string;
  oneTimeFlag: string;
  chapter: ChapterId;
  sequenceNumber: number;
  title: string;
  sender: string;
  frequencyMHz: string;
  morsePreview: string;
  corruptedBody: string;
  decodedBody: string;
  prerequisites: {
    receiverWarmed?: boolean;
    minCompletedRepairs?: number;
    requiredEventIds?: string[];
    minChapter?: ChapterId;
  };
  decodeCost: ResourceCost;
  choices: [MessageEventChoice, MessageEventChoice];
}

export interface EndingDefinition {
  id: EndingId;
  title: string;
  subtitle: string;
  summary: string;
  epilogue: string;
  requirementDescription: string;
}

export const RESOURCES: Record<ResourceId, ResourceDefinition> = {
  watts: {
    id: 'watts',
    name: 'Power (Watts)',
    shortName: 'Watts',
    unit: 'W',
    description:
      'Electrical charge stored in the vacuum-tube capacitor bank. Powers receiver tubes, signal decoding, and remote lighthouse beacons.',
    unlockReason: 'Available from the start via the hand-cranked dynamo.',
  },
  alloy: {
    id: 'alloy',
    name: 'Salvage Alloy',
    shortName: 'Salvage Alloy',
    unit: 'AL',
    description:
      'Weather-stripped naval brass and hull plating hauled up from the cliffside wreckage.',
    unlockReason:
      'Unlocked in Chapter 1 once the receiver lamp warms up and reveals structural damage to the rectifier & winch.',
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher Keys (Bandwidth)',
    shortName: 'Cipher Keys',
    unit: 'KEY',
    description:
      'Phase-locked harmonic key blocks synthesized from clean carrier waves to decrypt archipelago transmissions.',
    unlockReason:
      'Unlocked in Chapter 2 when encrypted archipelago relay traffic arrives.',
  },
};

export const CHAPTERS: Record<ChapterId, ChapterDefinition> = {
  1: {
    id: 1,
    title: 'Chapter 1: Cold Receiver',
    subtitle: 'A single match, a frozen hand-dynamo, and a scratching SOS.',
    openingLog:
      'Ice coats the inside of the lantern glass. The mainland cable is dead. Only the hand-dynamo beside the radio desk still turns.',
    transformationNote:
      'Completing your first structural repair brings the Frequency Oscilloscope online and illuminates the relay console.',
  },
  2: {
    id: 2,
    title: 'Chapter 2: The Archipelago Grid',
    subtitle: 'Four dark stations across the storm-cut sea and four circuit rules.',
    openingLog:
      'The backplane relays clack into alignment. Across the black water, four coastal transponders answer your carrier wave.',
    transformationNote:
      'Unlocks the Archipelago Radar Map (4 Remote Stations), Safe Automation Rule Rack (4 Rules), and Cipher Keys.',
  },
  3: {
    id: 3,
    title: 'Chapter 3: The Solstice Transmission',
    subtitle: 'The eye of the gale arrives. Every watt commits the archipelago’s fate.',
    openingLog:
      'Barometric pressure plunges. You can either lock all four relays into a permanent autonomous mesh or burn the coastal grid to guide Convoy Meridian past the reef.',
    transformationNote:
      'Unlocks Final Convergence protocols for Ending A (The Archival Beacon) and Ending B (The Exodus Convoy).',
  },
};

export const INITIAL_REPAIRS: Record<InitialRepairId, InitialRepairDefinition> = {
  repair_rectifier: {
    id: 'repair_rectifier',
    name: 'Overhaul Rectifier Tube Bank',
    cost: { watts: 6, alloy: 5 },
    summary: 'Boosts Hand-Dynamo output (5W -> 9W) and expands Capacitor Bank (+40 Max Watts).',
    effectDescription:
      'Replaces cracked mercury-vapor rectifiers, stabilizing high-voltage storage and bringing the Frequency Oscilloscope online.',
  },
  repair_winch: {
    id: 'repair_winch',
    name: 'Unjam Cliffside Salvage Winch',
    cost: { watts: 6, alloy: 5 },
    summary: 'Boosts Salvage Winch haul (4 -> 7 Alloy) and expands Alloy Locker (+30 Max Alloy).',
    effectDescription:
      'Clears frozen cable drums on the sea cliff, accelerating hull salvage recovery and bringing the Frequency Oscilloscope online.',
  },
};

export const REMOTE_STATIONS: Record<StationId, RemoteStationDefinition> = {
  north_reef: {
    id: 'north_reef',
    name: 'North Reef Lighthouse',
    sector: 'Sector N-01 (Shoal Point)',
    coordinates: { x: 28, y: 24 },
    activationCost: { watts: 10, alloy: 6 },
    wattUpkeepPerCycle: 2,
    passiveYieldPerCycle: { alloy: 1 },
    description:
      'Automated basalt tower guarding the northern razor-shoals. Guides salvage drones along the tide line.',
    tradeoffNote:
      'Drains 2W/cycle, but generates +1 Alloy/cycle and enables the Hull Salvage Drone automation rule.',
  },
  sunken_dredge: {
    id: 'sunken_dredge',
    name: 'Sunken Dredge Platform',
    sector: 'Sector W-04 (Silt Trench)',
    coordinates: { x: 20, y: 68 },
    activationCost: { watts: 12, alloy: 8 },
    wattUpkeepPerCycle: 3,
    passiveYieldPerCycle: { alloy: 3 },
    description:
      'Half-submerged industrial sea-floor excavator still hooked into the relay power cable.',
    tradeoffNote:
      'Heavy 3W/cycle draw, but supplies +3 Salvage Alloy/cycle for major structural fabrication.',
  },
  weather_buoy: {
    id: 'weather_buoy',
    name: 'Weather Buoy K-9',
    sector: 'Sector E-07 (Deep Gale)',
    coordinates: { x: 76, y: 30 },
    activationCost: { watts: 12, alloy: 6, cipher: 1 },
    wattUpkeepPerCycle: 2,
    passiveYieldPerCycle: { cipher: 1 },
    description:
      'High-frequency barometric and ionospheric reference transponder anchored beyond the shelf.',
    tradeoffNote:
      'Drains 2W/cycle, but synthesizes +1 Cipher Key/cycle from clean atmospheric telemetry.',
  },
  convoy_meridian: {
    id: 'convoy_meridian',
    name: 'Offshore Convoy Meridian',
    sector: 'Sector S-12 (Razorback Channel)',
    coordinates: { x: 78, y: 74 },
    activationCost: { watts: 14, alloy: 8, cipher: 1 },
    wattUpkeepPerCycle: 3,
    passiveYieldPerCycle: { watts: 5 },
    description:
      'Six ice-coated civilian transport vessels holding position outside the lethal southern reef.',
    tradeoffNote:
      'Requires 3W/cycle carrier lock, but backfeeds +5W/cycle from shipboard diesel generators (net +2W/cycle).',
  },
};

export const AUTOMATION_RULES: Record<AutomationRuleId, AutomationRuleDefinition> = {
  auto_crank: {
    id: 'auto_crank',
    name: 'Auto-Crank Regulator',
    unlockChapter: 2,
    unlockCost: { watts: 8, alloy: 6 },
    conditionType: 'watts_pct_below',
    thresholdPct: 40,
    inputs: { alloy: 1 },
    outputs: { watts: 6 },
    conditionSummary: 'WHEN Power < 40%',
    inputSummary: 'CONSUME 1 Salvage Alloy',
    outputSummary: 'PRODUCE +6 Watts/cycle',
    description:
      'Converts 1 Salvage Alloy -> +6 Watts/cycle when Power < 40%. Prevents low-power stalls at the cost of steady alloy burn.',
  },
  signal_scrubber: {
    id: 'signal_scrubber',
    name: 'Signal Scrubber',
    unlockChapter: 2,
    unlockCost: { watts: 10, alloy: 6 },
    conditionType: 'watts_pct_at_least',
    thresholdPct: 50,
    inputs: { watts: 4 },
    outputs: { cipher: 1 },
    conditionSummary: 'WHEN Power >= 50%',
    inputSummary: 'CONSUME 4 Watts',
    outputSummary: 'PRODUCE +1 Cipher Key/cycle',
    description:
      'Automatically decodes Tier-1 telemetry into +1 Cipher Key (consumes 4W) when Power >= 50%.',
  },
  hull_salvage_drone: {
    id: 'hull_salvage_drone',
    name: 'Hull Salvage Drone',
    unlockChapter: 2,
    unlockCost: { watts: 10, alloy: 8 },
    conditionType: 'station_powered',
    requiredStationId: 'north_reef',
    inputs: { watts: 2 },
    outputs: { alloy: 2 },
    conditionSummary: 'WHEN North Reef Lighthouse is Powered',
    inputSummary: 'CONSUME 2 Watts',
    outputSummary: 'PRODUCE +2 Salvage Alloy/cycle',
    description:
      'Gathers +2 Salvage Alloy/cycle (consumes 2W) when North Reef Lighthouse is powered.',
  },
  emergency_load_shedder: {
    id: 'emergency_load_shedder',
    name: 'Emergency Load Shedder',
    unlockChapter: 2,
    unlockCost: { watts: 8, alloy: 5, cipher: 1 },
    conditionType: 'watts_pct_below',
    thresholdPct: 20,
    inputs: {},
    outputs: { watts: 5, throttleNonCriticalStations: true },
    conditionSummary: 'WHEN Power < 20%',
    inputSummary: 'THROTTLE non-critical station beacons',
    outputSummary: 'RECOVER +5 Watts & prevent receiver brownout',
    description:
      'Automatically throttles non-critical station beacons if Power drops below 20% to prevent receiver brownout.',
  },
};

export const MESSAGE_EVENTS: MessageEventDefinition[] = [
  {
    id: 'sig_01_reef_sos',
    oneTimeFlag: 'evt_flag_01_reef_sos',
    chapter: 1,
    sequenceNumber: 1,
    title: 'Distress Fragment: North Reef Watch',
    sender: 'Keeper Vance (North Reef)',
    frequencyMHz: '118.4 MHz',
    morsePreview: '... --- ... / .-. . . ..-.',
    corruptedBody:
      '[STATIC] ...Ember Point, do you read? Sea wall breached... auxiliary battery at 4%... need carrier lock or we lose the northern shoal...',
    decodedBody:
      '"Ember Point Relay, this is Keeper Vance at North Reef! Waves took our lower generator room. Either feed us a stabilizing carrier pulse so our shoal beacon holds, or tell us to abandon the tower and float our spare copper coils down-current to your cove."',
    prerequisites: {
      receiverWarmed: true,
    },
    decodeCost: { watts: 4 },
    choices: [
      {
        id: 'stabilize_reef_carrier',
        label: 'Feed Stabilizing Carrier Pulse (-4W)',
        description:
          'Hold North Reef’s transponder lock and recover +4 Salvage Alloy washed into the lit cove (+1 Network Integrity).',
        costs: { watts: 4 },
        rewards: { alloy: 4 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        outcomeLog:
          'North Reef locks onto your carrier wave. Vance guides a crate of naval brass (+4 Alloy) into your cove.',
      },
      {
        id: 'strip_reef_coils',
        label: 'Order Tower Strip & Float Coils (-2W)',
        description:
          'Have Vance jettison heavy salvage coils down-current (+7 Salvage Alloy, +1 Convoy Readiness).',
        costs: { watts: 2 },
        rewards: { alloy: 7 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 1,
        outcomeLog:
          'Vance strips the secondary coils before evacuating to the cliff shelter. +7 Salvage Alloy hauled ashore.',
      },
    ],
  },
  {
    id: 'sig_02_dredge_beacon',
    oneTimeFlag: 'evt_flag_02_dredge_beacon',
    chapter: 1,
    sequenceNumber: 2,
    title: 'Sub-Surface Ping: Dredge Platform 04',
    sender: 'Auto-Telemetry DREDGE-04',
    frequencyMHz: '121.0 MHz',
    morsePreview: '-.. .-. . -.. --. . / ----- ....-',
    corruptedBody:
      '[HUM] ...automated hopper full... pressure valve 04 stuck... awaiting relay command pulse...',
    decodedBody:
      '"DREDGE-04 STATUS: Bilge hoppers loaded with 14 tons of hull plate. Subsea cable continuity at 62%. Send calibration pulse to preserve long-term extraction, or blow ballast tanks for an immediate surface dump."',
    prerequisites: {
      receiverWarmed: true,
      minCompletedRepairs: 1,
      requiredEventIds: ['sig_01_reef_sos'],
    },
    decodeCost: { watts: 5 },
    choices: [
      {
        id: 'calibrate_dredge_cable',
        label: 'Calibrate Subsea Relay Cable (-5W)',
        description:
          'Preserve Dredge-04 telemetry and winch +6 Salvage Alloy (+1 Network Integrity).',
        costs: { watts: 5 },
        rewards: { alloy: 6 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Subsea telemetry stabilized. Dredge-04 transfers +6 Salvage Alloy along the trench line.',
      },
      {
        id: 'blow_dredge_ballast',
        label: 'Trigger Emergency Ballast Blow (-3 Alloy)',
        description:
          'Sacrifice 3 Alloy in rigging to recover high-charge thermal cells (+12 Watts, +1 Convoy Readiness).',
        costs: { alloy: 3 },
        rewards: { watts: 12 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 1,
        outcomeLog:
          'Thermal battery canisters breach the surf. Capacitor bank surges by +12 Watts.',
      },
    ],
  },
  {
    id: 'sig_03_harbor_charter',
    oneTimeFlag: 'evt_flag_03_harbor_charter',
    chapter: 1,
    sequenceNumber: 3,
    title: 'Harbor Master’s Solstice Directive',
    sender: 'Port Authority Archive',
    frequencyMHz: '124.6 MHz',
    morsePreview: '--. .-. .. -.. / --- .-. / ..-. .-.. . . -',
    corruptedBody:
      '[CARRIER LOCK] ...all island relays must choose protocol before midnight tide... grid backplane ready...',
    decodedBody:
      '"SOLSTICE DIRECTIVE: Mainland Ice Blockade confirmed. Ember Point Relay is now the sole master node. Re-seat the Archipelago Backplane to wake the four remote stations."',
    prerequisites: {
      receiverWarmed: true,
      minCompletedRepairs: 1,
      requiredEventIds: ['sig_02_dredge_beacon'],
    },
    decodeCost: { watts: 6 },
    choices: [
      {
        id: 'energize_grid_backplane',
        label: 'Reinforce Archipelago Backplane (-4 Alloy)',
        description:
          'Install heavy busbars (+8 Watts, +2 Cipher Keys, +1 Network Integrity).',
        costs: { alloy: 4 },
        rewards: { watts: 8, cipher: 2 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Backplane busbars locked! Four coastal station transponders appear on the Archipelago Radar.',
      },
      {
        id: 'prime_coastal_searchlight',
        label: 'Prime Coastal Searchlight Bus (-6W)',
        description:
          'Wire the high-output sea-lane bus (+6 Salvage Alloy, +2 Cipher Keys, +1 Convoy Readiness).',
        costs: { watts: 6 },
        rewards: { alloy: 6, cipher: 2 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 1,
        outcomeLog:
          'Searchlight bus primed! The radar scope sweeps across four remote archipelago stations.',
      },
    ],
  },
  {
    id: 'sig_04_north_reef_keeper',
    oneTimeFlag: 'evt_flag_04_north_reef_keeper',
    chapter: 2,
    sequenceNumber: 4,
    title: 'North Reef: Rime Ice on the Fresnel Drum',
    sender: 'Keeper Vance',
    frequencyMHz: '128.2 MHz',
    morsePreview: '.. -.-. . / --- -. / .-.. . -. ...',
    corruptedBody:
      '[ENCRYPTED TIER-1] ...salt ice freezing rotation gears... need de-icing load or prism removal...',
    decodedBody:
      '"Ember Point, three inches of black rime ice are seizing North Reef’s rotary lens! Route de-icing power and replacement brackets to keep the northern node alive, or let me dismantle the copper prism frame for fleet repairs."',
    prerequisites: {
      minChapter: 2,
    },
    decodeCost: { watts: 6 },
    choices: [
      {
        id: 'deice_north_reef',
        label: 'Route De-Icing Load (-6W, -3 Alloy)',
        description:
          'Melts the lens ice, grants +2 Cipher Keys, and brings North Reef Lighthouse online (+1 Network Integrity).',
        costs: { watts: 6, alloy: 3 },
        rewards: { cipher: 2 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        powerStationId: 'north_reef',
        outcomeLog:
          'Heating coils glow cherry-red at North Reef. The northern lighthouse beam slices through the snow!',
      },
      {
        id: 'salvage_reef_prism',
        label: 'Dismantle Prism Frame (-4W)',
        description:
          'Strip the brass lens housing for immediate +8 Salvage Alloy and +1 Cipher Key (+1 Convoy Readiness).',
        costs: { watts: 4 },
        rewards: { alloy: 8, cipher: 1 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 1,
        outcomeLog:
          'North Reef’s secondary prism frame is Barged to Ember Point (+8 Salvage Alloy, +1 Cipher Key).',
      },
    ],
  },
  {
    id: 'sig_05_dredge_overload',
    oneTimeFlag: 'evt_flag_05_dredge_overload',
    chapter: 2,
    sequenceNumber: 5,
    title: 'Sunken Dredge: Trench Turbine Surge',
    sender: 'DREDGE-04 Control',
    frequencyMHz: '131.5 MHz',
    morsePreview: '- ..- .-. -... .. -. . / ... ..- .-. --. .',
    corruptedBody:
      '[CIPHER BLOCK] ...tidal current driving trench turbine past 140% RPM... governor clamp failing...',
    decodedBody:
      '"WARNING: Undertow in the Silt Trench is spinning Dredge-04’s hydro-turbine past redline. Spend Salvage Alloy to brace the governor for clean power + cipher sync, or let it run hot to rip a massive alloy cache from the seabed."',
    prerequisites: {
      minChapter: 2,
      requiredEventIds: ['sig_04_north_reef_keeper'],
    },
    decodeCost: { watts: 6, cipher: 1 },
    choices: [
      {
        id: 'brace_dredge_governor',
        label: 'Brace Hydro-Governor (-5 Alloy)',
        description:
          'Captures +12 Watts and +2 Cipher Keys while reinforcing the subsea grid (+1 Network Integrity).',
        costs: { alloy: 5 },
        rewards: { watts: 12, cipher: 2 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Hydro-governor clamped! Clean tidal current surges into Ember Point (+12 Watts, +2 Cipher Keys).',
      },
      {
        id: 'overdrive_dredge_claw',
        label: 'Overdrive Excavator Claw (-6W)',
        description:
          'Extracts +10 Salvage Alloy and +1 Cipher Key before the clutch slips (+1 Convoy Readiness).',
        costs: { watts: 6 },
        rewards: { alloy: 10, cipher: 1 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 1,
        outcomeLog:
          'Excavator claw hauls up a massive naval bulkhead (+10 Salvage Alloy, +1 Cipher Key).',
      },
    ],
  },
  {
    id: 'sig_06_buoy_k9_drift',
    oneTimeFlag: 'evt_flag_06_buoy_k9_drift',
    chapter: 2,
    sequenceNumber: 6,
    title: 'Weather Buoy K-9: Mooring Chain Parted',
    sender: 'Telemetry Buoy K-9',
    frequencyMHz: '134.8 MHz',
    morsePreview: '-.- ----. / -.. .-. .. ..-. -',
    corruptedBody:
      '[CIPHER BLOCK] ...sea anchor dragging toward eastern shelf... harmonic reference drifting...',
    decodedBody:
      '"BUOY K-9 ALERT: Primary sea-anchor parted in 40-foot swells. Dispatch a grapple-drone with Salvage Alloy to re-anchor K-9 at its triangulation coordinate, or tow it south to mark the reef passage for Convoy Meridian."',
    prerequisites: {
      minChapter: 2,
      requiredEventIds: ['sig_05_dredge_overload'],
    },
    decodeCost: { watts: 7, cipher: 1 },
    choices: [
      {
        id: 'reanchor_buoy_k9',
        label: 'Re-Anchor Triangulation Coordinate (-5 Alloy)',
        description:
          'Locks K-9 in Sector E-07, yielding +3 Cipher Keys and +6 Watts (+1 Network Integrity).',
        costs: { alloy: 5 },
        rewards: { watts: 6, cipher: 3 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Grapple-chain locked into the eastern basalt shelf. K-9 delivers +3 Cipher Keys.',
      },
      {
        id: 'drift_buoy_to_channel',
        label: 'Drift K-9 into Razorback Channel (-5W)',
        description:
          'Marks the convoy lane and yields +6 Salvage Alloy & +2 Cipher Keys (+1 Convoy Readiness).',
        costs: { watts: 5 },
        rewards: { alloy: 6, cipher: 2 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 1,
        outcomeLog:
          'Buoy K-9 Rides the rip current into Razorback Channel, illuminating the shoal markers.',
      },
    ],
  },
  {
    id: 'sig_07_meridian_hail',
    oneTimeFlag: 'evt_flag_07_meridian_hail',
    chapter: 2,
    sequenceNumber: 7,
    title: 'Convoy Meridian: Hull Breach on Transport Three',
    sender: 'Captain Solis (MV Meridian)',
    frequencyMHz: '137.4 MHz',
    morsePreview: '-- . .-. .. -.. .. .- -.',
    corruptedBody:
      '[URGENT CIPHER] ...six ships holding off Razorback Reef... ice pack crushing Transport Three...',
    decodedBody:
      '"Ember Point, this is Captain Solis aboard flagship Meridian! We have 410 civilians across six ice-crusted hulls. Transport Three’s bilge pumps are failing—either ration balanced relay support or dump your main capacitor bank to run our arc-welders!"',
    prerequisites: {
      minChapter: 2,
      requiredEventIds: ['sig_06_buoy_k9_drift'],
    },
    decodeCost: { watts: 8, cipher: 1 },
    choices: [
      {
        id: 'ration_balanced_aid',
        label: 'Ration Balanced Relay Aid (-4 Alloy)',
        description:
          'Preserves grid reserves while sending patch plates (+8 Watts, +2 Cipher Keys, +1 Network Integrity).',
        costs: { alloy: 4 },
        rewards: { watts: 8, cipher: 2 },
        networkIntegrityDelta: 1,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Meridian patches Transport Three and links its radio array into the archipelago repeater.',
      },
      {
        id: 'dump_capacitor_for_welders',
        label: 'Dump Capacitor for Arc-Welders (-8W, -5 Alloy)',
        description:
          'Full emergency weld package (+3 Cipher Keys, +12 Watts backfeed, +2 Convoy Readiness).',
        costs: { watts: 8, alloy: 5 },
        rewards: { watts: 12, cipher: 3 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 2,
        outcomeLog:
          'Arc-welders seal Transport Three’s hull! Captain Solis aligns Meridian’s engines for the channel run.',
      },
    ],
  },
  {
    id: 'sig_08_mainland_silence',
    oneTimeFlag: 'evt_flag_08_mainland_silence',
    chapter: 2,
    sequenceNumber: 8,
    title: 'Mainland Admiralty: Scuttle & Blackout Order',
    sender: 'Admiralty High Command',
    frequencyMHz: '139.9 MHz',
    morsePreview: '-... .-.. .- -.-. -.- --- ..- -',
    corruptedBody:
      '[HIGH CIPHER] ...weather front permanent... wipe regional cipher tables and shut down coastal beacons...',
    decodedBody:
      '"DIRECTIVE 99-OMEGA: All outer island stations are declared unrecoverable until spring thaw. Erase local encryption keys immediately. — Keeper, if we obey, the islands go deaf; if we override the directive, we seize full control of the Solstice spectrum."',
    prerequisites: {
      minChapter: 2,
      requiredEventIds: ['sig_07_meridian_hail'],
    },
    decodeCost: { watts: 8, cipher: 2 },
    choices: [
      {
        id: 'assert_island_sovereignty',
        label: 'Assert Archipelago Mesh Sovereignty (-6W)',
        description:
          'Fork the Admiralty cipher root (+4 Cipher Keys, +6 Salvage Alloy, +2 Network Integrity).',
        costs: { watts: 6 },
        rewards: { alloy: 6, cipher: 4 },
        networkIntegrityDelta: 2,
        convoyReadinessDelta: 0,
        outcomeLog:
          'You lock out the mainland kill-switch. The Archipelago Mesh now answers only to Ember Point!',
      },
      {
        id: 'crack_admiralty_depot',
        label: 'Crack Admiralty Naval Depot Locks (-1 Cipher)',
        description:
          'Seize emergency fleet stores (+10 Salvage Alloy, +10 Watts, +2 Convoy Readiness).',
        costs: { cipher: 1 },
        rewards: { watts: 10, alloy: 10 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 2,
        outcomeLog:
          'Depot bunkers Pop open along the breakwater! +10 Alloy and +10 Watts routed to evacuation reserves.',
      },
    ],
  },
  {
    id: 'sig_09_solstice_squall',
    oneTimeFlag: 'evt_flag_09_solstice_squall',
    chapter: 3,
    sequenceNumber: 9,
    title: 'Eye of the Solstice: 110-Knot Hurricane Wall',
    sender: 'Ember Point Barograph',
    frequencyMHz: '141.2 MHz',
    morsePreview: '... --- .-.. ... - .. -.-. .',
    corruptedBody:
      '[EXTREME INTERFERENCE] ...barometer 942 mbar... tower guy-wires screaming... sea wall overtopped...',
    decodedBody:
      '"SOLSTICE WALL IMPACT: 110-knot gusts are hammering all four sectors. Reinforce every coastal relay mast with Salvage Alloy so the four-station grid survives the night, or focus all power into the southern breakwater radar corridor."',
    prerequisites: {
      minChapter: 3,
    },
    decodeCost: { watts: 8, cipher: 1 },
    choices: [
      {
        id: 'guywire_all_towers',
        label: 'Guy-Wire All Four Relay Masts (-6 Alloy)',
        description:
          'Protects the entire network (+12 Watts, +2 Cipher Keys, +2 Network Integrity).',
        costs: { alloy: 6 },
        rewards: { watts: 12, cipher: 2 },
        networkIntegrityDelta: 2,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Steel guy-wires hold fast across all four sectors! Harmonic resonance generates +12W and +2 Cipher Keys.',
      },
      {
        id: 'focus_southern_radar',
        label: 'Overcharge Southern Radar Corridor (-8W)',
        description:
          'Maps every submerged rock in Razorback Channel (+8 Salvage Alloy, +2 Cipher Keys, +2 Convoy Readiness).',
        costs: { watts: 8 },
        rewards: { alloy: 8, cipher: 2 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 2,
        outcomeLog:
          'High-power radar cuts through the blinding spray, charting a clean evacuation lane.',
      },
    ],
  },
  {
    id: 'sig_10_reef_harmonic',
    oneTimeFlag: 'evt_flag_10_reef_harmonic',
    chapter: 3,
    sequenceNumber: 10,
    title: 'Ionospheric Mirror: 142.8 MHz Standing Wave',
    sender: 'Weather Buoy K-9 / Ionosonde',
    frequencyMHz: '142.8 MHz',
    morsePreview: '.--. .... .- ... . / .-.. --- -.-.',
    corruptedBody:
      '[AURORAL BOUNCE] ...rare solstice ionospheric ducting detected... 400-mile range window open...',
    decodedBody:
      '"IONOSPHERIC WINDOW: Auroral compression has created a standing wave duct over the archipelago. Phase-lock the duct to permanently synchronize the four-island autonomous grid, or bounce a high-power sonar-radio guide beam ahead of Convoy Meridian."',
    prerequisites: {
      minChapter: 3,
      requiredEventIds: ['sig_09_solstice_squall'],
    },
    decodeCost: { watts: 8, cipher: 2 },
    choices: [
      {
        id: 'lock_ionospheric_mesh',
        label: 'Phase-Lock Autonomous Mesh (-6W)',
        description:
          'Synthesizes +4 Cipher Keys and +6 Salvage Alloy (+2 Network Integrity).',
        costs: { watts: 6 },
        rewards: { alloy: 6, cipher: 4 },
        networkIntegrityDelta: 2,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Standing wave locked! All island repeaters hum in a single self-healing harmonic chord.',
      },
      {
        id: 'project_convoy_guide_beam',
        label: 'Project Convoy Guide Beam (-4 Alloy)',
        description:
          'Generates +12 Watts and +3 Cipher Keys for fleet navigation (+2 Convoy Readiness).',
        costs: { alloy: 4 },
        rewards: { watts: 12, cipher: 3 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 2,
        outcomeLog:
          'Auroral guide beam illuminates the open ocean beyond the reef (+12 Watts, +3 Cipher Keys).',
      },
    ],
  },
  {
    id: 'sig_11_mutiny_on_meridian',
    oneTimeFlag: 'evt_flag_11_mutiny_on_meridian',
    chapter: 3,
    sequenceNumber: 11,
    title: 'Convoy Meridian: The Pilots’ Ultimatum',
    sender: 'Captain Solis & Harbor Pilots',
    frequencyMHz: '144.0 MHz',
    morsePreview: '-.. . -.-. .. -.. . / -. --- .--',
    corruptedBody:
      '[CRITICAL TRAFFIC] ...tide crests in twenty minutes... either hold station as Node 4 or run the reef now...',
    decodedBody:
      '"Ember Point, the slack-water window is here! Half my captains want to anchor inside the leeward bay as the fourth permanent generator node for your Archipelago Mesh. The rest want you to burn your inland relays into a blinding searchlight corridor so we can break out to the southern mainland tonight. Give the order!"',
    prerequisites: {
      minChapter: 3,
      requiredEventIds: ['sig_10_reef_harmonic'],
    },
    decodeCost: { watts: 10, cipher: 2 },
    choices: [
      {
        id: 'anchor_meridian_as_node_4',
        label: 'Order Meridian to Anchor in Leeward Grid (-6W)',
        description:
          'Integrates Meridian into the 4-station mesh (+8 Salvage Alloy, +3 Cipher Keys, +2 Network Integrity).',
        costs: { watts: 6 },
        rewards: { alloy: 8, cipher: 3 },
        networkIntegrityDelta: 2,
        convoyReadinessDelta: 0,
        powerStationId: 'convoy_meridian',
        outcomeLog:
          'Meridian drops anchor in the sheltered cove and couples its diesel turbines to the Archipelago Grid!',
      },
      {
        id: 'clear_meridian_for_breakout',
        label: 'Order Full Fleet Breakout Run (-6 Alloy)',
        description:
          'Diverts all coastal reserves to the sea lane (+16 Watts, +3 Cipher Keys, +2 Convoy Readiness).',
        costs: { alloy: 6 },
        rewards: { watts: 16, cipher: 3 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 2,
        outcomeLog:
          'Six ship horns thunder across the surf as Convoy Meridian forms line-astern for the breakout run!',
      },
    ],
  },
  {
    id: 'sig_12_final_convergence',
    oneTimeFlag: 'evt_flag_12_final_convergence',
    chapter: 3,
    sequenceNumber: 12,
    title: 'Solstice Apex: The Ember Point Convergence',
    sender: 'Ember Point Master Console',
    frequencyMHz: '146.5 MHz',
    morsePreview: '... --- .-.. ... - .. -.-. . / .- .--. . -..-',
    corruptedBody:
      '[FINAL PROTOCOL READY] ...capacitor bank at peak resonance... select terminal transmission mode...',
    decodedBody:
      '"MASTER CONSOLE READY: All 12 Solstice transmissions processed. You now have the bandwidth and charge to execute either final convergence protocol: lock the four-station Archival Beacon for permanent island sovereignty, or fire the Exodus Convoy Overdrive to shepherd the fleet to open sea."',
    prerequisites: {
      minChapter: 3,
      requiredEventIds: ['sig_11_mutiny_on_meridian'],
    },
    decodeCost: { watts: 8, cipher: 1 },
    choices: [
      {
        id: 'charge_archival_protocol',
        label: 'Charge Archival Mesh Bus (+14W, +4 Cipher)',
        description:
          'Prepares the 4-station Archival Beacon for Ending A (+2 Network Integrity).',
        costs: {},
        rewards: { watts: 14, alloy: 6, cipher: 4 },
        networkIntegrityDelta: 2,
        convoyReadinessDelta: 0,
        outcomeLog:
          'Archival Mesh Bus charged to 100%. Ready to lock Ending A: The Archival Beacon.',
      },
      {
        id: 'charge_exodus_protocol',
        label: 'Charge Exodus Searchlight Bus (+14W, +10 Alloy)',
        description:
          'Prepares the Fresnel Overdrive for Ending B (+2 Convoy Readiness).',
        costs: {},
        rewards: { watts: 14, alloy: 10, cipher: 3 },
        networkIntegrityDelta: 0,
        convoyReadinessDelta: 2,
        outcomeLog:
          'Exodus Searchlight Bus charged to 100%. Ready to fire Ending B: The Exodus Convoy.',
      },
    ],
  },
];

export const ENDINGS: Record<EndingId, EndingDefinition> = {
  ending_a_archival_beacon: {
    id: 'ending_a_archival_beacon',
    title: 'Ending A: The Archival Beacon (Network Sovereignty)',
    subtitle: 'All four archipelago relays lock into a self-sustaining harmonic grid.',
    summary:
      'By synchronizing North Reef, Sunken Dredge, Weather Buoy K-9, and Leeward Meridian, Ember Point becomes the heart of an unbreakable island commonwealth.',
    epilogue:
      'Through the deepest freeze of the Solstice blockade, the four beacons pulse in unison across the dark water. Weather telemetry, dredge salvage, and harbor traffic flow without mainland oversight. When spring finally thaws the strait, the archipelago answers on its own frequency.',
    requirementDescription:
      'Requires Chapter 3, all 4 Remote Stations powered, Network Integrity >= 3, 25 Watts, and 4 Cipher Keys.',
  },
  ending_b_exodus_convoy: {
    id: 'ending_b_exodus_convoy',
    title: 'Ending B: The Exodus Convoy (Fleet Evacuation)',
    subtitle: 'The lighthouse arc burns white-hot, guiding all six ships safely past Razorback Reef.',
    summary:
      'You sacrifice the inland repeater coils and channel every last watt and alloy plate into a blinding sea-lane corridor for Convoy Meridian.',
    epilogue:
      'One by one, the inland relay tubes shatter as you push the Fresnel arc to 300% capacity. Through the boiling surf of Razorback Channel, Captain Solis steers all six vessels along your razor-thin beam of light. At dawn, the last radio message reaches your cooling receiver from open water: "All hands clear of the shoals. Thank you, Ember Point."',
    requirementDescription:
      'Requires Chapter 3, Convoy Readiness >= 3, 25 Watts, 12 Salvage Alloy, and 3 Cipher Keys.',
  },
};
