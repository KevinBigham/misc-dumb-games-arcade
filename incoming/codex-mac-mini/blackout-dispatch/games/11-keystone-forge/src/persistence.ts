import type { KeystoneForgeState } from './simulation';

const STORAGE_KEY = 'argon_game11_keystone_forge_v1';

export interface KeystoneForgeProfile {
  readonly schemaVersion: 1;
  highScore: number;
  bestFlushStreak: number;
  bestSprintMs: number | null;
  totalLinesForged: number;
  totalPerfectFinesse: number;
  highestDojoStage: number;
  recordedRunIds: string[];
}

export function createDefaultProfile(): KeystoneForgeProfile {
  return {
    schemaVersion: 1,
    highScore: 0,
    bestFlushStreak: 0,
    bestSprintMs: null,
    totalLinesForged: 0,
    totalPerfectFinesse: 0,
    highestDojoStage: 0,
    recordedRunIds: [],
  };
}

export function loadProfile(): KeystoneForgeProfile {
  try {
    if (typeof localStorage === 'undefined') return createDefaultProfile();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw) as Partial<KeystoneForgeProfile>;
    if (parsed.schemaVersion !== 1) return createDefaultProfile();
    return {
      schemaVersion: 1,
      highScore: Number(parsed.highScore) || 0,
      bestFlushStreak: Number(parsed.bestFlushStreak) || 0,
      bestSprintMs: typeof parsed.bestSprintMs === 'number' ? parsed.bestSprintMs : null,
      totalLinesForged: Number(parsed.totalLinesForged) || 0,
      totalPerfectFinesse: Number(parsed.totalPerfectFinesse) || 0,
      highestDojoStage: Number(parsed.highestDojoStage) || 0,
      recordedRunIds: Array.isArray(parsed.recordedRunIds)
        ? parsed.recordedRunIds.slice(-30)
        : [],
    };
  } catch {
    return createDefaultProfile();
  }
}

export function saveProfile(profile: KeystoneForgeProfile): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota or sandbox errors
  }
}

export function recordStampProgress(
  profile: KeystoneForgeProfile,
  state: KeystoneForgeState,
): KeystoneForgeProfile {
  const runStampId = `${state.seed}:${state.mode}:${state.stampsCount}`;
  const alreadyRecorded = profile.recordedRunIds.includes(runStampId);

  const next: KeystoneForgeProfile = {
    ...profile,
    highScore: Math.max(profile.highScore, state.score),
    bestFlushStreak: Math.max(profile.bestFlushStreak, state.maxFlushStreak),
    highestDojoStage:
      state.mode === 'puzzle'
        ? Math.max(profile.highestDojoStage, state.puzzleIndex)
        : profile.highestDojoStage,
    bestSprintMs:
      state.mode === 'sprint' && state.status === 'won'
        ? profile.bestSprintMs === null
          ? state.elapsedMs
          : Math.min(profile.bestSprintMs, state.elapsedMs)
        : profile.bestSprintMs,
    totalLinesForged: alreadyRecorded
      ? profile.totalLinesForged
      : profile.totalLinesForged + (state.lastStamp?.linesCleared ?? 0),
    totalPerfectFinesse: alreadyRecorded
      ? profile.totalPerfectFinesse
      : profile.totalPerfectFinesse + (state.lastStamp?.wasPerfectFinesse ? 1 : 0),
    recordedRunIds: alreadyRecorded
      ? profile.recordedRunIds
      : [...profile.recordedRunIds.slice(-29), runStampId],
  };

  saveProfile(next);
  return next;
}
