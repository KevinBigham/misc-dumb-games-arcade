import { SeededRng } from './rng';

export type BlockColorId = 0 | 1 | 2 | 3 | 4;

export interface BlockArchetype {
  id: BlockColorId;
  name: string;
  shortLabel: string;
  symbol: '▲' | '●' | '■' | '◆' | '★';
  fillHex: string;
  strokeHex: string;
  glowHex: string;
  textHex: string;
  /** Pentatonic base frequency (Hz) for harmonic WebAudio match chords */
  baseFreqHz: number;
}

export const BLOCK_ARCHETYPES: readonly BlockArchetype[] = [
  {
    id: 0,
    name: 'Cyan Apex',
    shortLabel: 'CYN',
    symbol: '▲',
    fillHex: '#06b6d4',
    strokeHex: '#a5f3fc',
    glowHex: 'rgba(34, 211, 238, 0.55)',
    textHex: '#042f2e',
    baseFreqHz: 261.63, // C4
  },
  {
    id: 1,
    name: 'Amber Pulse',
    shortLabel: 'AMB',
    symbol: '●',
    fillHex: '#f59e0b',
    strokeHex: '#fde68a',
    glowHex: 'rgba(251, 191, 36, 0.55)',
    textHex: '#271300',
    baseFreqHz: 293.66, // D4
  },
  {
    id: 2,
    name: 'Magenta Core',
    shortLabel: 'MAG',
    symbol: '■',
    fillHex: '#ec4899',
    strokeHex: '#fbcfe8',
    glowHex: 'rgba(244, 114, 182, 0.55)',
    textHex: '#31071f',
    baseFreqHz: 329.63, // E4
  },
  {
    id: 3,
    name: 'Emerald Prism',
    shortLabel: 'EMR',
    symbol: '◆',
    fillHex: '#10b981',
    strokeHex: '#a7f3d0',
    glowHex: 'rgba(52, 211, 153, 0.55)',
    textHex: '#022c22',
    baseFreqHz: 392.00, // G4
  },
  {
    id: 4,
    name: 'Violet Nova',
    shortLabel: 'VIO',
    symbol: '★',
    fillHex: '#8b5cf6',
    strokeHex: '#ddd6fe',
    glowHex: 'rgba(167, 139, 250, 0.6)',
    textHex: '#1e1b4b',
    baseFreqHz: 440.00, // A4
  },
] as const;

export type WavePatternType =
  | 'SINGLE_STREAM'
  | 'DOUBLE_OPPOSING'
  | 'SPIRAL_CASCADE'
  | 'CROSSING_PAIR';

export interface WavePatternMetadata {
  type: WavePatternType;
  label: string;
  description: string;
  minLevel: number;
}

export const WAVE_PATTERNS: Record<WavePatternType, WavePatternMetadata> = {
  SINGLE_STREAM: {
    type: 'SINGLE_STREAM',
    label: 'Single Stream',
    description: '1–2 shards along a focused orbital lane.',
    minLevel: 1,
  },
  DOUBLE_OPPOSING: {
    type: 'DOUBLE_OPPOSING',
    label: 'Double Opposing',
    description: 'Simultaneous shards arriving on opposite sides of the polygon.',
    minLevel: 2,
  },
  SPIRAL_CASCADE: {
    type: 'SPIRAL_CASCADE',
    label: 'Spiral Cascade',
    description: '3 sequential shards sweeping clockwise or counter-clockwise around the core.',
    minLevel: 4,
  },
  CROSSING_PAIR: {
    type: 'CROSSING_PAIR',
    label: 'Crossing Pair',
    description: 'Two staggered pairs of matching/contrasting shards testing cross-face chains.',
    minLevel: 6,
  },
};

export interface ScheduledWaveShard {
  lane: number;
  color: BlockColorId;
  /** Delay in ms relative to wave start */
  delayMs: number;
}

export interface GeneratedWave {
  pattern: WavePatternType;
  shards: ScheduledWaveShard[];
  /** Total duration before next wave should be generated */
  durationMs: number;
}

/**
 * Generates a deterministic wave of orbital shards using the seeded PRNG.
 * Inspired by Hextris wavegen: selects an appropriate wave pattern for the current level,
 * polygon side count (`6 | 7 | 8`), and unlocked color count (`4 | 5`).
 */
export function generateOrbitalWave(
  rng: SeededRng,
  level: number,
  numSides: 6 | 7 | 8,
  activeColorCount: 4 | 5,
  waveIntervalMs: number,
  intraWaveStepMs: number
): GeneratedWave {
  const availablePatterns: WavePatternType[] = ['SINGLE_STREAM'];
  if (level >= WAVE_PATTERNS.DOUBLE_OPPOSING.minLevel) {
    availablePatterns.push('DOUBLE_OPPOSING');
  }
  if (level >= WAVE_PATTERNS.SPIRAL_CASCADE.minLevel) {
    availablePatterns.push('SPIRAL_CASCADE');
  }
  if (level >= WAVE_PATTERNS.CROSSING_PAIR.minLevel) {
    availablePatterns.push('CROSSING_PAIR');
  }

  // Weight toward SINGLE_STREAM early, and mix all 4 patterns at higher levels
  const pattern =
    level === 1
      ? 'SINGLE_STREAM'
      : rng.pick(availablePatterns);

  const pickColor = (): BlockColorId =>
    rng.nextInt(0, activeColorCount) as BlockColorId;

  const baseLane = rng.nextInt(0, numSides);
  const shards: ScheduledWaveShard[] = [];

  if (pattern === 'SINGLE_STREAM') {
    const primaryColor = pickColor();
    shards.push({ lane: baseLane, color: primaryColor, delayMs: 0 });
    // 35% chance at level 2+ to send a follow-up shard on an adjacent lane
    if (level >= 2 && rng.nextFloat() < 0.35) {
      const offset = rng.nextFloat() < 0.5 ? 1 : numSides - 1;
      shards.push({
        lane: (baseLane + offset) % numSides,
        color: rng.nextFloat() < 0.55 ? primaryColor : pickColor(),
        delayMs: intraWaveStepMs,
      });
    }
    return {
      pattern,
      shards,
      durationMs: waveIntervalMs + (shards.length > 1 ? intraWaveStepMs : 0),
    };
  }

  if (pattern === 'DOUBLE_OPPOSING') {
    const oppositeLane = (baseLane + Math.floor(numSides / 2)) % numSides;
    const c1 = pickColor();
    const c2 = rng.nextFloat() < 0.45 ? c1 : pickColor();
    shards.push({ lane: baseLane, color: c1, delayMs: 0 });
    shards.push({ lane: oppositeLane, color: c2, delayMs: Math.round(intraWaveStepMs * 0.45) });
    return {
      pattern,
      shards,
      durationMs: Math.round(waveIntervalMs * 1.18),
    };
  }

  if (pattern === 'SPIRAL_CASCADE') {
    const stepDir = rng.nextFloat() < 0.5 ? 1 : -1;
    const count = level >= 9 ? 4 : 3;
    const sharedColor = pickColor();
    for (let i = 0; i < count; i++) {
      const lane = (baseLane + i * stepDir + numSides * 4) % numSides;
      // Give the player a strong chance to build a cross-face chain or stack 3
      const color = i < 2 && rng.nextFloat() < 0.6 ? sharedColor : pickColor();
      shards.push({
        lane,
        color,
        delayMs: i * intraWaveStepMs,
      });
    }
    return {
      pattern,
      shards,
      durationMs: waveIntervalMs + (count - 1) * intraWaveStepMs,
    };
  }

  // CROSSING_PAIR
  const laneA = baseLane;
  const laneB = (baseLane + 2) % numSides;
  const colorA = pickColor();
  const colorB = pickColor();
  shards.push({ lane: laneA, color: colorA, delayMs: 0 });
  shards.push({ lane: laneB, color: colorB, delayMs: 0 });
  shards.push({
    lane: (laneA + 1) % numSides,
    color: colorA,
    delayMs: intraWaveStepMs,
  });
  return {
    pattern,
    shards,
    durationMs: waveIntervalMs + intraWaveStepMs,
  };
}

export interface CoreStageInfo {
  numSides: 6 | 7 | 8;
  title: string;
  subtitle: string;
  badgeColor: string;
}

export function getCoreStageInfo(numSides: 6 | 7 | 8): CoreStageInfo {
  switch (numSides) {
    case 6:
      return {
        numSides: 6,
        title: 'HEX CORE (6 SIDES)',
        subtitle: '4 Frequencies Active · Standard 60° Lattice',
        badgeColor: '#06b6d4',
      };
    case 7:
      return {
        numSides: 7,
        title: 'HEPTA CORE (7 SIDES)',
        subtitle: '5th Frequency (★ Violet) Unlocked · 51.4° Asymmetric Lattice',
        badgeColor: '#8b5cf6',
      };
    case 8:
      return {
        numSides: 8,
        title: 'OCTA CORE (8 SIDES)',
        subtitle: 'Full 8-Face Orbital Matrix · Spiral & Crossing Waves Active',
        badgeColor: '#f59e0b',
      };
  }
}
