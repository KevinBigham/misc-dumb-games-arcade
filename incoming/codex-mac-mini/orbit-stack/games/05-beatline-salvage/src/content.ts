import {
  ChartDifficultyId,
  LaneId,
  SONG_SECTIONS,
  SectionDefinition,
  SectionId,
  TRACK_DURATION_MS,
  getSectionForTimeMs,
} from './config.ts';
import { SeededRng, getTodayDailySeed } from './rng.ts';

export type NoteRouteBranch = 'both' | 'standard' | 'overdrive';

export type SalvageCoreType = 'ferrous' | 'cobalt' | 'plasma';

export interface ChartNote {
  id: string;
  timeMs: number;
  lane: LaneId;
  sectionId: SectionId;
  routeBranch: NoteRouteBranch;
  coreType: SalvageCoreType;
}

export interface ShuntGate {
  id: string;
  sectionId: SectionId;
  timeMs: number;
  overdriveEndTimeMs: number;
  activationLeadMs: number;
  activationTailMs: number;
}

export interface ChartDefinition {
  id: ChartDifficultyId;
  title: string;
  badge: string;
  subtitle: string;
  bpm: number;
  durationMs: number;
  seed: number;
  description: string;
  sections: readonly SectionDefinition[];
  shuntGates: readonly ShuntGate[];
  notes: readonly ChartNote[];
  practiceSectionId?: SectionId;
  practiceStartTimeMs?: number;
  practiceEndTimeMs?: number;
}

interface PatternSpec {
  id: ChartDifficultyId;
  title: string;
  badge: string;
  subtitle: string;
  seed: number;
  description: string;
  standardBeatStepMs: number;
  includeEighthSyncopationInStandard: boolean;
  overdriveSubdivisionMs: number;
}

const AUTHORED_SPECS: Record<'easy' | 'standard' | 'expert', PatternSpec> = {
  easy: {
    id: 'easy',
    title: 'Cadet Sorter',
    badge: 'EASY · 120 BPM',
    subtitle: 'Steady quarter-beat magnetic induction with forgiving shunt patterns',
    seed: 10501,
    description:
      'Designed for first-shift calibration. Clean single-beat spacing on Standard rails; Overdrive introduces rhythmic eighth-note pairs.',
    standardBeatStepMs: 1000,
    includeEighthSyncopationInStandard: false,
    overdriveSubdivisionMs: 500,
  },
  standard: {
    id: 'standard',
    title: 'Shift Lead',
    badge: 'STANDARD · 120 BPM',
    subtitle: 'Balanced industrial groove with syncopated Overdrive cross-routing',
    seed: 20502,
    description:
      'Full-speed orbital salvage shift. Standard route runs 120 BPM quarter pulses; Overdrive Shunt injects off-beat 250ms plasma crossovers.',
    standardBeatStepMs: 500,
    includeEighthSyncopationInStandard: false,
    overdriveSubdivisionMs: 250,
  },
  expert: {
    id: 'expert',
    title: 'Overclocked Foundry',
    badge: 'EXPERT · 120 BPM',
    subtitle: 'High-density dual-rail salvage with rapid Overdrive plasma bursts',
    seed: 30503,
    description:
      'Maximum throughput. Syncopated Standard conveyor plus aggressive Overdrive eighth-and-sixteenth triplet bursts for top leaderboard scores.',
    standardBeatStepMs: 500,
    includeEighthSyncopationInStandard: true,
    overdriveSubdivisionMs: 250,
  },
};

function buildShuntGates(): ShuntGate[] {
  return SONG_SECTIONS.map((section, idx) => ({
    id: `gate-${idx + 1}-${section.id}`,
    sectionId: section.id,
    timeMs: section.shuntGateTimeMs,
    overdriveEndTimeMs: section.overdriveEndTimeMs,
    activationLeadMs: 1_200,
    activationTailMs: 400,
  }));
}

/**
 * Deterministically builds a complete 90-second chart across all 4 sections,
 * with distinct Standard and Overdrive note branches during each section's Shunt window.
 */
function buildChartFromSpec(spec: PatternSpec): ChartDefinition {
  const rng = new SeededRng(spec.seed);
  const shuntGates = buildShuntGates();
  const notes: ChartNote[] = [];
  let noteCounter = 1;

  const pushNote = (
    timeMs: number,
    lane: LaneId,
    sectionId: SectionId,
    routeBranch: NoteRouteBranch,
    coreType: SalvageCoreType
  ) => {
    notes.push({
      id: `${spec.id}-n${noteCounter++}`,
      timeMs,
      lane,
      sectionId,
      routeBranch,
      coreType,
    });
  };

  for (const section of SONG_SECTIONS) {
    const secIndex = section.index;
    const firstNoteMs = section.startTimeMs === 0 ? 1_500 : section.startTimeMs + 500;
    const preGateEndMs = section.shuntGateTimeMs - 250;

    // 1. Pre-gate shared induction notes ('both')
    let laneToggle: LaneId = secIndex % 2 === 0 ? 'left' : 'right';
    for (let t = firstNoteMs; t <= preGateEndMs; t += spec.standardBeatStepMs) {
      if (secIndex >= 1 && t % 1500 === 0) {
        laneToggle = laneToggle === 'left' ? 'right' : 'left';
      } else {
        laneToggle = rng.next() > 0.35 ? (laneToggle === 'left' ? 'right' : 'left') : laneToggle;
      }
      pushNote(t, laneToggle, section.id, 'both', 'ferrous');

      if (spec.includeEighthSyncopationInStandard && secIndex >= 2 && t + 250 <= preGateEndMs && rng.next() > 0.55) {
        const offLane: LaneId = laneToggle === 'left' ? 'right' : 'left';
        pushNote(t + 250, offLane, section.id, 'both', 'cobalt');
      }
    }

    // 2. Standard Route Branch inside [shuntGateTimeMs + 500 .. overdriveEndTimeMs]
    const branchStartMs = section.shuntGateTimeMs + 500;
    const branchEndMs = section.overdriveEndTimeMs;
    let stdLane: LaneId = 'left';
    for (let t = branchStartMs; t <= branchEndMs; t += spec.standardBeatStepMs) {
      // Leave short breather every 4 seconds
      if ((t - branchStartMs) % 4000 === 3500) continue;
      stdLane = (t / spec.standardBeatStepMs + secIndex) % 2 === 0 ? 'left' : 'right';
      pushNote(t, stdLane, section.id, 'standard', 'cobalt');

      if (spec.includeEighthSyncopationInStandard && secIndex >= 1 && (t - branchStartMs) % 2000 === 1000) {
        const altLane: LaneId = stdLane === 'left' ? 'right' : 'left';
        if (t + 250 <= branchEndMs) {
          pushNote(t + 250, altLane, section.id, 'standard', 'cobalt');
        }
      }
    }

    // 3. Overdrive Shunt Branch inside [shuntGateTimeMs + 500 .. overdriveEndTimeMs]
    // Always higher density + syncopated patterns + plasma cores worth 1.5x
    const odStepMs = spec.id === 'easy' ? 500 : 500;
    let odLane: LaneId = 'right';
    for (let t = branchStartMs; t <= branchEndMs; t += odStepMs) {
      odLane = odLane === 'left' ? 'right' : 'left';
      pushNote(t, odLane, section.id, 'overdrive', 'plasma');

      // Add syncopated off-beat plasma core on Overdrive
      const shouldAddSyncopation =
        spec.id === 'easy'
          ? (t - branchStartMs) % 1500 === 500
          : spec.id === 'standard'
          ? (t - branchStartMs) % 1000 === 500
          : (t - branchStartMs) % 1000 !== 0 || secIndex >= 2;

      if (shouldAddSyncopation && t + spec.overdriveSubdivisionMs <= branchEndMs) {
        const crossLane: LaneId = odLane === 'left' ? 'right' : 'left';
        pushNote(t + spec.overdriveSubdivisionMs, crossLane, section.id, 'overdrive', 'plasma');
      }
    }

    // 4. Post-overdrive shared cooldown/lock notes ('both')
    const postStartMs = section.overdriveEndTimeMs + 500;
    const postEndMs = section.endTimeMs - 500;
    for (let t = postStartMs; t <= postEndMs; t += 500) {
      const l: LaneId = (t / 500) % 2 === 0 ? 'left' : 'right';
      pushNote(t, l, section.id, 'both', 'ferrous');
    }
  }

  notes.sort((a, b) => a.timeMs - b.timeMs || a.id.localeCompare(b.id));

  return {
    id: spec.id,
    title: spec.title,
    badge: spec.badge,
    subtitle: spec.subtitle,
    bpm: 120,
    durationMs: TRACK_DURATION_MS,
    seed: spec.seed,
    description: spec.description,
    sections: SONG_SECTIONS,
    shuntGates,
    notes,
  };
}

const AUTHORED_CHARTS: Record<'easy' | 'standard' | 'expert', ChartDefinition> = {
  easy: buildChartFromSpec(AUTHORED_SPECS.easy),
  standard: buildChartFromSpec(AUTHORED_SPECS.standard),
  expert: buildChartFromSpec(AUTHORED_SPECS.expert),
};

export function createSeededDailyChart(seed: number = getTodayDailySeed()): ChartDefinition {
  const dailySpec: PatternSpec = {
    id: 'daily',
    title: `Daily Foundry #${seed}`,
    badge: `DAILY SEED · ${seed}`,
    subtitle: 'Deterministic seeded 90s salvage track for head-to-head shift comparison',
    seed,
    description:
      'Every operator running this Daily Seed faces the exact same note timestamps and Shunt Gate overdrive patterns.',
    standardBeatStepMs: 500,
    includeEighthSyncopationInStandard: seed % 2 === 0,
    overdriveSubdivisionMs: 250,
  };
  return buildChartFromSpec(dailySpec);
}

export function getChartById(id: ChartDifficultyId, customSeed?: number): ChartDefinition {
  if (id === 'daily') {
    return createSeededDailyChart(customSeed ?? getTodayDailySeed());
  }
  return AUTHORED_CHARTS[id];
}

export function getAllBaseCharts(dailySeed?: number): ChartDefinition[] {
  return [
    AUTHORED_CHARTS.easy,
    AUTHORED_CHARTS.standard,
    AUTHORED_CHARTS.expert,
    createSeededDailyChart(dailySeed),
  ];
}

/**
 * Isolates a single section for the Section Practice Loop so players can drill
 * their weakest section and repeat it immediately.
 */
export function createSectionPracticeChart(
  baseChart: ChartDefinition,
  sectionId: SectionId
): ChartDefinition {
  const section =
    SONG_SECTIONS.find((s) => s.id === sectionId) ?? getSectionForTimeMs(0);
  const filteredNotes = baseChart.notes.filter((n) => n.sectionId === section.id);
  const filteredGates = baseChart.shuntGates.filter((g) => g.sectionId === section.id);

  return {
    ...baseChart,
    title: `${baseChart.title} · [${section.title}]`,
    subtitle: `Section Practice Loop (${(section.startTimeMs / 1000).toFixed(1)}s – ${(
      section.endTimeMs / 1000
    ).toFixed(1)}s)`,
    sections: [section],
    shuntGates: filteredGates,
    notes: filteredNotes,
    practiceSectionId: section.id,
    practiceStartTimeMs: section.startTimeMs,
    practiceEndTimeMs: section.endTimeMs,
  };
}
