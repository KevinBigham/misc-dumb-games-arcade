export interface WallRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SwitchPlateDef {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  targetGateId: string;
  stayOpenTicks: number;
}

export interface LaserGateDef {
  id: string;
  label: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export interface TerminalNodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  hackTicksRequired: number;
  unlocksVault: boolean;
}

export interface PatrolSentinelDef {
  id: string;
  name: string;
  waypoints: Array<{ x: number; y: number }>;
  speed: number;
  visionRange: number;
  visionAngleRad: number;
}

export interface HeistStageBlueprint {
  stageNumber: number;
  codeName: string;
  title: string;
  subtitle: string;
  architectBriefing: string;
  tacticalHint: string;
  parEchoCount: number;
  spawnPos: { x: number; y: number };
  extractionPos: { x: number; y: number };
  vaultPos: { x: number; y: number };
  walls: WallRect[];
  switches: SwitchPlateDef[];
  laserGates: LaserGateDef[];
  terminals: TerminalNodeDef[];
  sentinels: PatrolSentinelDef[];
}

export interface HeistRigModDef {
  id: 'PHASE_CAPACITOR' | 'RESONANCE_COIL' | 'GHOST_OVERDRIVE' | 'OPTIC_CLOAK';
  name: string;
  tagline: string;
  description: string;
  badgeColor: string;
}

export const HEIST_RIG_MODS: readonly HeistRigModDef[] = [
  {
    id: 'PHASE_CAPACITOR',
    name: 'Phase Capacitor Mk.IV',
    tagline: '+35 Max Energy & -20% Blink Cost',
    description:
      'Expands your rig capacitor to 135 Energy and reduces Phase-Blink cost so you can chain wall-bypasses.',
    badgeColor: '#38bdf8',
  },
  {
    id: 'RESONANCE_COIL',
    name: '4D Resonance Coil',
    tagline: '+50% Hack Speed & Echo Synergy Shield',
    description:
      'Terminals decrypt 50% faster, and standing within 70px of any past Ghost Echo drains Timeline Instability.',
    badgeColor: '#10b981',
  },
  {
    id: 'GHOST_OVERDRIVE',
    name: 'Chrono-Boots Overdrive',
    tagline: '+22% Movement Speed & Extended Plate Hold',
    description:
      'Boosts sprint velocity by 22% and causes pressure plates to stay open for 2.5s after an agent steps off.',
    badgeColor: '#f59e0b',
  },
  {
    id: 'OPTIC_CLOAK',
    name: 'Refractive Holo-Mesh',
    tagline: '-45% Sentinel Detection Rate & Longer EMP',
    description:
      'Bends Panopticon sightcones, reducing Paradox Instability buildup by 45% and extending EMP Stun duration by 2s.',
    badgeColor: '#a855f7',
  },
];

export interface SyndicateRankDef {
  id: 'OMNISCIENT_ARCHITECT' | 'FOURTH_DIMENSIONAL_PHANTOM' | 'TEMPORAL_TACTICIAN' | 'LOOP_OPERATIVE';
  title: string;
  subtitle: string;
  summary: string;
  accentColor: string;
}

export const SYNDICATE_RANKS: Record<SyndicateRankDef['id'], SyndicateRankDef> = {
  OMNISCIENT_ARCHITECT: {
    id: 'OMNISCIENT_ARCHITECT',
    title: 'OMNISCIENT 4D ARCHITECT',
    subtitle: 'Supreme Master of Simultaneous Causality',
    summary:
      'You choreographed past and present selves like a single four-dimensional organism—cracking every quantum vault under par with surgical precision.',
    accentColor: '#10b981',
  },
  FOURTH_DIMENSIONAL_PHANTOM: {
    id: 'FOURTH_DIMENSIONAL_PHANTOM',
    title: 'FOURTH-DIMENSIONAL PHANTOM',
    subtitle: 'Ghost in the Panopticon Clockwork',
    summary:
      'Your Echoes held every laser gate and stunned every sentinel right on cue. Security logs show four infiltrators, yet the biometric scanner only ever read one heartbeat.',
    accentColor: '#38bdf8',
  },
  TEMPORAL_TACTICIAN: {
    id: 'TEMPORAL_TACTICIAN',
    title: 'TEMPORAL HEIST TACTICIAN',
    subtitle: 'Veteran of the 15-Second Loop',
    summary:
      'Through clever Rewinds, Decoys, and EMP bursts, you bent the 15-second horizon to your will and escaped with the Chronos Core.',
    accentColor: '#f59e0b',
  },
  LOOP_OPERATIVE: {
    id: 'LOOP_OPERATIVE',
    title: 'CAUSALITY LOOP OPERATIVE',
    subtitle: 'Survivor of the Temporal Maelstrom',
    summary:
      'Alarms blared and timelines fractured, but your squad of Echoes brute-forced the vault locks before reality collapsed.',
    accentColor: '#f43f5e',
  },
};

export const HEIST_STAGE_BLUEPRINTS: readonly HeistStageBlueprint[] = [
  {
    stageNumber: 1,
    codeName: 'SECTOR I // BIFURCATED VAULT',
    title: 'The Twin-Key Atrium',
    subtitle: 'Learn 2-Echo Co-Op: Hold the North Plate in Loop 1, Loot the South Vault in Loop 2',
    architectBriefing:
      'Welcome to Chrono-Syndicate. No single operative can hold the North Pressure Plate AND cross the South Laser Gate in 15 seconds. Use Loop 1 to hold Plate A & hack Terminal Alpha, press [R] to Rewind & Spawn Echo #2, and walk straight through the gate your past self opens!',
    tacticalHint:
      'TIP: Or press [E] to drop a Holo-Decoy onto Plate A—Holo-Decoys weigh down pressure plates AND distract sentinels!',
    parEchoCount: 2,
    spawnPos: { x: 76, y: 220 },
    extractionPos: { x: 84, y: 365 },
    vaultPos: { x: 668, y: 220 },
    walls: [
      { x: 250, y: 0, w: 22, h: 145 },
      { x: 250, y: 295, w: 22, h: 145 },
      { x: 510, y: 0, w: 22, h: 165 },
      { x: 510, y: 275, w: 22, h: 165 },
    ],
    switches: [
      {
        id: 'SW_ALPHA',
        label: 'PLATE A (Vault Gate)',
        x: 165,
        y: 86,
        color: '#38bdf8',
        targetGateId: 'GATE_VAULT_1',
        stayOpenTicks: 40,
      },
    ],
    laserGates: [
      {
        id: 'GATE_VAULT_1',
        label: 'LASER GATE A',
        x1: 521,
        y1: 165,
        x2: 521,
        y2: 275,
        color: '#38bdf8',
      },
    ],
    terminals: [
      {
        id: 'TERM_1',
        label: 'CIPHER NODE α',
        x: 380,
        y: 95,
        hackTicksRequired: 24,
        unlocksVault: true,
      },
    ],
    sentinels: [
      {
        id: 'SENT_1',
        name: 'Aegis Drone 01',
        waypoints: [
          { x: 380, y: 155 },
          { x: 380, y: 345 },
        ],
        speed: 115,
        visionRange: 145,
        visionAngleRad: 0.95,
      },
    ],
  },
  {
    stageNumber: 2,
    codeName: 'SECTOR II // CROSSFIRE GALLERY',
    title: 'The Dual-Lock Faraday Cage',
    subtitle: '2 Cipher Terminals & Interlocking Laser Corridors',
    architectBriefing:
      'The Faraday Vault requires BOTH Cipher Nodes (North & South) decrypted within the same 15-second window. Send Echo #1 North to hack Node Alpha & hold Switch A; send Echo #2 South to hack Node Beta, grab the Chronos Core, and Blink to Extraction!',
    tacticalHint:
      'TIP: Press [Q] or [1] near any Sentinel to trigger an EMP Blast (stuns drones for 3.2s and disables nearby lasers)!',
    parEchoCount: 2,
    spawnPos: { x: 72, y: 220 },
    extractionPos: { x: 72, y: 78 },
    vaultPos: { x: 675, y: 220 },
    walls: [
      { x: 215, y: 110, w: 22, h: 220 },
      { x: 470, y: 0, w: 22, h: 155 },
      { x: 470, y: 285, w: 22, h: 155 },
    ],
    switches: [
      {
        id: 'SW_NORTH',
        label: 'PLATE A (Inner Gate)',
        x: 345,
        y: 74,
        color: '#38bdf8',
        targetGateId: 'GATE_VAULT_2',
        stayOpenTicks: 45,
      },
      {
        id: 'SW_SOUTH',
        label: 'PLATE B (Shortcut)',
        x: 345,
        y: 366,
        color: '#f59e0b',
        targetGateId: 'GATE_SHORTCUT_2',
        stayOpenTicks: 55,
      },
    ],
    laserGates: [
      {
        id: 'GATE_VAULT_2',
        label: 'VAULT LASER A',
        x1: 481,
        y1: 155,
        x2: 481,
        y2: 285,
        color: '#38bdf8',
      },
      {
        id: 'GATE_SHORTCUT_2',
        label: 'NORTH SHORTCUT B',
        x1: 226,
        y1: 0,
        x2: 226,
        y2: 110,
        color: '#f59e0b',
      },
    ],
    terminals: [
      {
        id: 'TERM_2A',
        label: 'CIPHER NODE α',
        x: 345,
        y: 140,
        hackTicksRequired: 24,
        unlocksVault: true,
      },
      {
        id: 'TERM_2B',
        label: 'CIPHER NODE β',
        x: 345,
        y: 300,
        hackTicksRequired: 24,
        unlocksVault: true,
      },
    ],
    sentinels: [
      {
        id: 'SENT_2A',
        name: 'Hunter-Seeker Alpha',
        waypoints: [
          { x: 290, y: 220 },
          { x: 435, y: 220 },
        ],
        speed: 135,
        visionRange: 150,
        visionAngleRad: 0.9,
      },
      {
        id: 'SENT_2B',
        name: 'Vault Warden Beta',
        waypoints: [
          { x: 585, y: 110 },
          { x: 585, y: 330 },
        ],
        speed: 130,
        visionRange: 145,
        visionAngleRad: 0.9,
      },
    ],
  },
  {
    stageNumber: 3,
    codeName: 'SECTOR III // TESSERACT ROTUNDA',
    title: 'The Panopticon Gyroscope',
    subtitle: '3 Rotating Sentinels & Synchronized Dual-Gate Vault',
    architectBriefing:
      'Three overlapping Sentinel patrols sweep the central rotunda. Use Echo #1 to draw aggro with a Holo-Decoy and hack the West & East Ciphers, while your subsequent timeline slips through the center corridor to extract the Core!',
    tacticalHint:
      'TIP: Use [Space] Phase-Blink to teleport 105px straight across laser beams or thin security bulkheads without triggering alarms!',
    parEchoCount: 3,
    spawnPos: { x: 68, y: 370 },
    extractionPos: { x: 68, y: 74 },
    vaultPos: { x: 678, y: 220 },
    walls: [
      { x: 185, y: 85, w: 20, h: 270 },
      { x: 375, y: 0, w: 20, h: 135 },
      { x: 375, y: 305, w: 20, h: 135 },
      { x: 545, y: 75, w: 20, h: 100 },
      { x: 545, y: 265, w: 20, h: 100 },
    ],
    switches: [
      {
        id: 'SW_3A',
        label: 'PLATE A (Center Gate)',
        x: 280,
        y: 74,
        color: '#38bdf8',
        targetGateId: 'GATE_3_CENTER',
        stayOpenTicks: 48,
      },
      {
        id: 'SW_3B',
        label: 'PLATE B (Vault Gate)',
        x: 465,
        y: 368,
        color: '#10b981',
        targetGateId: 'GATE_3_VAULT',
        stayOpenTicks: 48,
      },
    ],
    laserGates: [
      {
        id: 'GATE_3_CENTER',
        label: 'ROTUNDA LASER A',
        x1: 385,
        y1: 135,
        x2: 385,
        y2: 305,
        color: '#38bdf8',
      },
      {
        id: 'GATE_3_VAULT',
        label: 'INNER VAULT LASER B',
        x1: 555,
        y1: 175,
        x2: 555,
        y2: 265,
        color: '#10b981',
      },
    ],
    terminals: [
      {
        id: 'TERM_3A',
        label: 'CIPHER NODE α',
        x: 280,
        y: 365,
        hackTicksRequired: 24,
        unlocksVault: true,
      },
      {
        id: 'TERM_3B',
        label: 'CIPHER NODE β',
        x: 465,
        y: 78,
        hackTicksRequired: 24,
        unlocksVault: true,
      },
    ],
    sentinels: [
      {
        id: 'SENT_3A',
        name: 'West Corridor Drone',
        waypoints: [
          { x: 280, y: 135 },
          { x: 280, y: 310 },
        ],
        speed: 145,
        visionRange: 148,
        visionAngleRad: 0.92,
      },
      {
        id: 'SENT_3B',
        name: 'East Rotunda Drone',
        waypoints: [
          { x: 465, y: 140 },
          { x: 465, y: 305 },
        ],
        speed: 150,
        visionRange: 148,
        visionAngleRad: 0.92,
      },
      {
        id: 'SENT_3C',
        name: 'Sanctum Sentinel',
        waypoints: [
          { x: 618, y: 95 },
          { x: 618, y: 345 },
        ],
        speed: 140,
        visionRange: 140,
        visionAngleRad: 0.88,
      },
    ],
  },
  {
    stageNumber: 4,
    codeName: 'SECTOR IV // GRAND OMEGA SINGULARITY',
    title: 'The Chronos Crown Sanctorum',
    subtitle: 'Final 4D Heist: 3 Quantum Ciphers, 3 Interlocked Laser Gates & The Omega Warden',
    architectBriefing:
      'This is the ultimate 15-second heist. Three Cipher Terminals guard the Omega Singularity Core behind triple-layered security gates. Orchestrate your Ghost Echoes across all 4 timelines—disable the Warden, open the gates in sequence, seize the Crown Core, and extract before T=15.0s!',
    tacticalHint:
      'MASTER TIP: Standing near any of your Ghost Echoes triggers Temporal Resonance, boosting score and stabilizing the timeline!',
    parEchoCount: 3,
    spawnPos: { x: 66, y: 220 },
    extractionPos: { x: 66, y: 70 },
    vaultPos: { x: 685, y: 220 },
    walls: [
      { x: 175, y: 0, w: 20, h: 150 },
      { x: 175, y: 290, w: 20, h: 150 },
      { x: 355, y: 95, w: 20, h: 250 },
      { x: 535, y: 0, w: 20, h: 155 },
      { x: 535, y: 285, w: 20, h: 155 },
    ],
    switches: [
      {
        id: 'SW_4A',
        label: 'PLATE A (West Gate)',
        x: 115,
        y: 375,
        color: '#38bdf8',
        targetGateId: 'GATE_4A',
        stayOpenTicks: 50,
      },
      {
        id: 'SW_4B',
        label: 'PLATE B (Sanctum Gate)',
        x: 445,
        y: 68,
        color: '#f59e0b',
        targetGateId: 'GATE_4B',
        stayOpenTicks: 50,
      },
    ],
    laserGates: [
      {
        id: 'GATE_4A',
        label: 'WEST GATE A',
        x1: 185,
        y1: 150,
        x2: 185,
        y2: 290,
        color: '#38bdf8',
      },
      {
        id: 'GATE_4B',
        label: 'SANCTUM GATE B',
        x1: 545,
        y1: 155,
        x2: 545,
        y2: 285,
        color: '#f59e0b',
      },
    ],
    terminals: [
      {
        id: 'TERM_4A',
        label: 'OMEGA CIPHER α',
        x: 270,
        y: 74,
        hackTicksRequired: 22,
        unlocksVault: true,
      },
      {
        id: 'TERM_4B',
        label: 'OMEGA CIPHER β',
        x: 270,
        y: 366,
        hackTicksRequired: 22,
        unlocksVault: true,
      },
      {
        id: 'TERM_4C',
        label: 'OMEGA CIPHER γ',
        x: 445,
        y: 366,
        hackTicksRequired: 22,
        unlocksVault: true,
      },
    ],
    sentinels: [
      {
        id: 'SENT_4A',
        name: 'Outer Bastion Drone',
        waypoints: [
          { x: 270, y: 145 },
          { x: 270, y: 295 },
        ],
        speed: 155,
        visionRange: 150,
        visionAngleRad: 0.92,
      },
      {
        id: 'SENT_4B',
        name: 'Inner Bastion Drone',
        waypoints: [
          { x: 445, y: 120 },
          { x: 445, y: 310 },
        ],
        speed: 155,
        visionRange: 150,
        visionAngleRad: 0.92,
      },
      {
        id: 'SENT_4C',
        name: 'Omega Chronos Warden',
        waypoints: [
          { x: 615, y: 95 },
          { x: 615, y: 345 },
        ],
        speed: 165,
        visionRange: 155,
        visionAngleRad: 0.95,
      },
    ],
  },
];
