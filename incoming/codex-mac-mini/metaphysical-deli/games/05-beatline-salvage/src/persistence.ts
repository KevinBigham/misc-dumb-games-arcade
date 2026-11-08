import {
  CALIBRATION_LIMITS_MS,
  RankGrade,
  SONG_SECTIONS,
  SectionId,
} from './config.ts';
import { ResultsSummary } from './simulation.ts';

export const STORAGE_KEY = 'argon_game05_beatline_salvage_v1';

export interface ChartBestRecord {
  chartId: string;
  bestScore: number;
  bestRank: RankGrade;
  bestAccuracyPct: number;
  maxCombo: number;
  plays: number;
  overdriveClears: number;
}

export interface SectionMasteryRecord {
  sectionId: SectionId;
  bestAccuracyPct: number;
  overdriveMastered: boolean;
  practiceRuns: number;
}

export interface BeatlineSaveData {
  version: 1;
  calibrationOffsetMs: number;
  noFailMode: boolean;
  muted: boolean;
  chartRecords: Record<string, ChartBestRecord>;
  sectionMastery: Record<SectionId, SectionMasteryRecord>;
}

const RANK_PRIORITY: Record<RankGrade, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

export function createDefaultSaveData(): BeatlineSaveData {
  const sectionMastery = {} as Record<SectionId, SectionMasteryRecord>;
  for (const sec of SONG_SECTIONS) {
    sectionMastery[sec.id] = {
      sectionId: sec.id,
      bestAccuracyPct: 0,
      overdriveMastered: false,
      practiceRuns: 0,
    };
  }

  return {
    version: 1,
    calibrationOffsetMs: 0,
    noFailMode: false,
    muted: false,
    chartRecords: {},
    sectionMastery,
  };
}

export function loadSaveData(): BeatlineSaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSaveData();
    const parsed = JSON.parse(raw) as Partial<BeatlineSaveData>;
    return sanitizeSaveData(parsed);
  } catch {
    return createDefaultSaveData();
  }
}

export function sanitizeSaveData(input: Partial<BeatlineSaveData> | null | undefined): BeatlineSaveData {
  const defaults = createDefaultSaveData();
  if (!input || typeof input !== 'object') return defaults;

  const cal =
    typeof input.calibrationOffsetMs === 'number' && Number.isFinite(input.calibrationOffsetMs)
      ? Math.max(
          CALIBRATION_LIMITS_MS.MIN,
          Math.min(CALIBRATION_LIMITS_MS.MAX, Math.round(input.calibrationOffsetMs))
        )
      : 0;

  const chartRecords: Record<string, ChartBestRecord> = {};
  if (input.chartRecords && typeof input.chartRecords === 'object') {
    for (const [k, rec] of Object.entries(input.chartRecords)) {
      if (rec && typeof rec === 'object') {
        chartRecords[k] = {
          chartId: k,
          bestScore: Number(rec.bestScore) || 0,
          bestRank:
            rec.bestRank && rec.bestRank in RANK_PRIORITY ? rec.bestRank : 'D',
          bestAccuracyPct: Number(rec.bestAccuracyPct) || 0,
          maxCombo: Number(rec.maxCombo) || 0,
          plays: Number(rec.plays) || 0,
          overdriveClears: Number(rec.overdriveClears) || 0,
        };
      }
    }
  }

  const sectionMastery = { ...defaults.sectionMastery };
  if (input.sectionMastery && typeof input.sectionMastery === 'object') {
    for (const sec of SONG_SECTIONS) {
      const m = input.sectionMastery[sec.id];
      if (m && typeof m === 'object') {
        sectionMastery[sec.id] = {
          sectionId: sec.id,
          bestAccuracyPct: Number(m.bestAccuracyPct) || 0,
          overdriveMastered: Boolean(m.overdriveMastered),
          practiceRuns: Number(m.practiceRuns) || 0,
        };
      }
    }
  }

  return {
    version: 1,
    calibrationOffsetMs: cal,
    noFailMode: Boolean(input.noFailMode),
    muted: Boolean(input.muted),
    chartRecords,
    sectionMastery,
  };
}

export function saveSaveData(data: BeatlineSaveData): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export function recordRunResult(
  current: BeatlineSaveData,
  summary: ResultsSummary
): BeatlineSaveData {
  const next = sanitizeSaveData(current);

  if (summary.practiceSectionId) {
    const secId = summary.practiceSectionId;
    const prevSec = next.sectionMastery[secId];
    const secBreakdown = summary.sectionBreakdowns[0];
    next.sectionMastery[secId] = {
      sectionId: secId,
      bestAccuracyPct: Math.max(prevSec.bestAccuracyPct, summary.accuracyPct),
      overdriveMastered:
        prevSec.overdriveMastered ||
        (summary.completed &&
          secBreakdown?.routeChosen === 'overdrive' &&
          summary.accuracyPct >= 85),
      practiceRuns: prevSec.practiceRuns + 1,
    };
    saveSaveData(next);
    return next;
  }

  const existing = next.chartRecords[summary.chartId] ?? {
    chartId: summary.chartId,
    bestScore: 0,
    bestRank: 'D' as RankGrade,
    bestAccuracyPct: 0,
    maxCombo: 0,
    plays: 0,
    overdriveClears: 0,
  };

  const bestRank =
    RANK_PRIORITY[summary.rank] >= RANK_PRIORITY[existing.bestRank]
      ? summary.rank
      : existing.bestRank;

  next.chartRecords[summary.chartId] = {
    chartId: summary.chartId,
    bestScore: Math.max(existing.bestScore, summary.totalScore),
    bestRank,
    bestAccuracyPct: Math.max(existing.bestAccuracyPct, summary.accuracyPct),
    maxCombo: Math.max(existing.maxCombo, summary.maxCombo),
    plays: existing.plays + 1,
    overdriveClears:
      existing.overdriveClears +
      (summary.completed && summary.shuntSwitchesActivated > 0 ? 1 : 0),
  };

  for (const sb of summary.sectionBreakdowns) {
    const prevSec = next.sectionMastery[sb.sectionId];
    if (prevSec) {
      next.sectionMastery[sb.sectionId] = {
        sectionId: sb.sectionId,
        bestAccuracyPct: Math.max(prevSec.bestAccuracyPct, sb.accuracyPct),
        overdriveMastered:
          prevSec.overdriveMastered ||
          (summary.completed && sb.routeChosen === 'overdrive' && sb.accuracyPct >= 85),
        practiceRuns: prevSec.practiceRuns,
      };
    }
  }

  saveSaveData(next);
  return next;
}
