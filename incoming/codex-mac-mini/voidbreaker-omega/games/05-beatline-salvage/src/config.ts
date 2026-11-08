export type LaneId = 'left' | 'right';

export type JudgmentGrade = 'PERFECT' | 'GOOD' | 'EARLY' | 'LATE' | 'MISS';

export type RouteMode = 'standard' | 'overdrive';

export type SectionId =
  | 'intro-induction'
  | 'conveyor-surge'
  | 'high-voltage-shunt'
  | 'furnace-finale';

export type ChartDifficultyId = 'easy' | 'standard' | 'expert' | 'daily';

export type RankGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface SectionDefinition {
  id: SectionId;
  index: number;
  title: string;
  subtitle: string;
  startTimeMs: number;
  endTimeMs: number;
  shuntGateTimeMs: number;
  overdriveEndTimeMs: number;
}

export const TRACK_DURATION_MS = 90_000;
export const LEAD_IN_MS = 1_500;

export const JUDGMENT_WINDOWS_MS = {
  PERFECT: 32,
  GOOD: 75,
  EARLY_LATE: 120,
} as const;

export const CALIBRATION_LIMITS_MS = {
  MIN: -150,
  MAX: 150,
  STEP: 5,
} as const;

export const SCORE_VALUES = {
  PERFECT: 300,
  GOOD: 180,
  EARLY: 70,
  LATE: 70,
  MISS: 0,
  SHUNT_SWITCH_BONUS: 250,
  OVERDRIVE_MULTIPLIER: 1.5,
} as const;

export const STABILITY_CONFIG = {
  INITIAL: 100,
  MAX: 100,
  MIN: 0,
  GAIN_PERFECT: 2.5,
  GAIN_GOOD: 1.0,
  LOSS_EARLY_LATE: 2.0,
  LOSS_MISS_STANDARD: 8.5,
  LOSS_MISS_OVERDRIVE: 12.5,
} as const;

export const HISTOGRAM_BINS = [
  { minMs: -120, maxMs: -100, label: '-120..-100' },
  { minMs: -100, maxMs: -80, label: '-100..-80' },
  { minMs: -80, maxMs: -60, label: '-80..-60' },
  { minMs: -60, maxMs: -40, label: '-60..-40' },
  { minMs: -40, maxMs: -20, label: '-40..-20' },
  { minMs: -20, maxMs: 0, label: '-20..0' },
  { minMs: 0, maxMs: 20, label: '0..+20' },
  { minMs: 20, maxMs: 40, label: '+20..+40' },
  { minMs: 40, maxMs: 60, label: '+40..+60' },
  { minMs: 60, maxMs: 80, label: '+60..+80' },
  { minMs: 80, maxMs: 100, label: '+80..+100' },
  { minMs: 100, maxMs: 120, label: '+100..+120' },
] as const;

export const SONG_SECTIONS: readonly SectionDefinition[] = [
  {
    id: 'intro-induction',
    index: 0,
    title: '01 · Intro Induction',
    subtitle: 'Magnetic baseline alignment & first shunt gate test',
    startTimeMs: 0,
    endTimeMs: 22_500,
    shuntGateTimeMs: 9_000,
    overdriveEndTimeMs: 21_000,
  },
  {
    id: 'conveyor-surge',
    index: 1,
    title: '02 · Conveyor Surge',
    subtitle: 'Alternating cross-rail salvage bursts & off-beat induction',
    startTimeMs: 22_500,
    endTimeMs: 45_000,
    shuntGateTimeMs: 30_000,
    overdriveEndTimeMs: 43_500,
  },
  {
    id: 'high-voltage-shunt',
    index: 2,
    title: '03 · High-Voltage Shunt',
    subtitle: 'Syncopated dual-rail plasma cores & high-yield shunt window',
    startTimeMs: 45_000,
    endTimeMs: 67_500,
    shuntGateTimeMs: 51_000,
    overdriveEndTimeMs: 66_000,
  },
  {
    id: 'furnace-finale',
    index: 3,
    title: '04 · Furnace Finale',
    subtitle: 'Full-foundry overdrive sprint to final lock',
    startTimeMs: 67_500,
    endTimeMs: 90_000,
    shuntGateTimeMs: 73_500,
    overdriveEndTimeMs: 88_500,
  },
] as const;

export function getComboMultiplier(combo: number): number {
  if (combo >= 50) return 4;
  if (combo >= 25) return 3;
  if (combo >= 10) return 2;
  return 1;
}

export function getSectionForTimeMs(timeMs: number): SectionDefinition {
  for (const section of SONG_SECTIONS) {
    if (timeMs >= section.startTimeMs && timeMs < section.endTimeMs) {
      return section;
    }
  }
  return SONG_SECTIONS[SONG_SECTIONS.length - 1];
}
