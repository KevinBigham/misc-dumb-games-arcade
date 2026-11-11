import type {
  ArgonGameInstance,
  ArgonGameMetadata,
} from '../../shared-contract.ts';
import { BeatlineAudioEngine } from './audio.ts';
import {
  CALIBRATION_LIMITS_MS,
  ChartDifficultyId,
  LaneId,
  SectionId,
} from './config.ts';
import {
  ChartDefinition,
  createSectionPracticeChart,
  getChartById,
} from './content.ts';
import {
  BeatlineSaveData,
  loadSaveData,
  recordRunResult,
  saveSaveData,
} from './persistence.ts';
import { getTodayDailySeed } from './rng.ts';
import { BeatlineSimulation } from './simulation.ts';
import { BeatlineUI } from './ui.ts';

export * from './config.ts';
export * from './rng.ts';
export * from './content.ts';
export * from './simulation.ts';
export * from './persistence.ts';
export * from './audio.ts';

export const metadata: ArgonGameMetadata = {
  id: '05-beatline-salvage',
  number: 5,
  title: 'Beatline Salvage',
  subtitle: 'Split-Second Lanes',
  genre: 'Audio-Clock Two-Lane Rhythm & Salvage Machine',
  primaryReference: 'Rhythm Doctor / Muse Dash',
  supportingReference: 'Thumper / Hi-Fi RUSH',
  oneSentenceLoop:
    'Sort magnetic salvage cores across Left and Right induction lanes synced to a 90s industrial-synthwave audio clock, triggering Overdrive Shunt gates for 1.5x yield.',
  shortGoal:
    'Calibrate your audio offset and clear a 90-second salvage shift with high accuracy and an S/A rank.',
  longGoal:
    'Master all 4 track sections on Overdrive Shunt routes using the post-run Timing-Error Histogram and Section Practice Loop.',
  controlsSummary:
    'Left: [F]/[D]/[←] · Right: [J]/[K]/[→] · Overdrive Shunt: [Space] · Pause: [P]/[Esc] · Restart: [R]',
  accentColor: '#00f0ff',
};

export function mountGame(
  container: HTMLElement,
  options?: { initialSeed?: number; debug?: boolean }
): ArgonGameInstance {
  let saveData: BeatlineSaveData = loadSaveData();
  let dailySeed = options?.initialSeed ?? getTodayDailySeed();
  let selectedDifficulty: ChartDifficultyId = 'standard';
  let selectedPracticeSection: SectionId | null = null;
  let debugEnabled = Boolean(options?.debug);
  let calibrationModalOpen = false;
  let calibrationTapsMs: number[] = [];

  const audio = new BeatlineAudioEngine(saveData.muted);

  const buildCurrentChart = (): ChartDefinition => {
    const base = getChartById(selectedDifficulty, dailySeed);
    if (selectedPracticeSection) {
      return createSectionPracticeChart(base, selectedPracticeSection);
    }
    return base;
  };

  let activeChart = buildCurrentChart();
  const sim = new BeatlineSimulation(activeChart, {
    calibrationOffsetMs: saveData.calibrationOffsetMs,
    noFailMode: saveData.noFailMode,
  });

  let resultsShownForRun = false;

  const startOrResumeShift = () => {
    audio.ensureContext();
    const nowAudioMs = audio.getNowAudioMs();
    if (sim.getStatus() === 'paused') {
      sim.resume(nowAudioMs);
      ui.hideResultsOverlay();
      return;
    }
    audio.resetScheduler();
    resultsShownForRun = false;
    ui.hideResultsOverlay();
    sim.start(nowAudioMs);
  };

  const restartShift = () => {
    audio.ensureContext();
    audio.resetScheduler();
    resultsShownForRun = false;
    ui.hideResultsOverlay();
    sim.restart(audio.getNowAudioMs());
  };

  const togglePause = () => {
    const st = sim.getStatus();
    const nowAudioMs = audio.getNowAudioMs();
    if (st === 'playing') {
      sim.pause(nowAudioMs);
    } else if (st === 'paused') {
      sim.resume(nowAudioMs);
    }
  };

  const handleLaneStrike = (lane: LaneId) => {
    audio.ensureContext();
    const nowAudioMs = audio.getNowAudioMs();
    const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
    ui.triggerLaneFlash(lane, nowPerf);

    if (calibrationModalOpen) {
      handleCalibrationTap();
      return;
    }

    if (sim.getStatus() !== 'playing') return;
    const res = sim.handleLaneInput(lane, nowAudioMs);
    const route = sim.getCurrentRouteForTimeMs();
    if (res) {
      audio.playHitSfx(res.grade, lane, route);
    }
  };

  const handleShuntTrigger = () => {
    audio.ensureContext();
    const nowAudioMs = audio.getNowAudioMs();
    const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
    ui.triggerShuntFlash(nowPerf);

    if (sim.getStatus() === 'idle') {
      startOrResumeShift();
      return;
    }
    if (sim.getStatus() !== 'playing') return;
    const switched = sim.handleShuntSwitchInput(nowAudioMs);
    if (switched) {
      audio.playShuntGateSfx();
    }
  };

  const applyCalibrationOffset = (offsetMs: number, tapMsg?: string) => {
    const clamped = Math.max(
      CALIBRATION_LIMITS_MS.MIN,
      Math.min(CALIBRATION_LIMITS_MS.MAX, Math.round(offsetMs / 5) * 5)
    );
    saveData.calibrationOffsetMs = clamped;
    saveSaveData(saveData);
    sim.setCalibrationOffsetMs(clamped);
    ui.setCalibrationModalOpen(calibrationModalOpen, clamped, tapMsg);
  };

  const handleCalibrationTap = () => {
    audio.ensureContext();
    audio.playCalibrationPulse(true);
    const nowMs = audio.getNowAudioMs();
    calibrationTapsMs.push(nowMs);
    if (calibrationTapsMs.length > 5) {
      calibrationTapsMs.shift();
    }
    // Compare tap against nearest 500ms beat grid
    const nearestBeat = Math.round(nowMs / 500) * 500;
    const delta = Math.max(-150, Math.min(150, Math.round(nowMs - nearestBeat)));
    applyCalibrationOffset(
      delta,
      `Measured tap offset: ${delta >= 0 ? '+' : ''}${delta}ms (Applied to Audio Clock)`
    );
  };

  const ui = new BeatlineUI(container, {
    onSelectDifficulty: (id) => {
      selectedDifficulty = id;
      activeChart = buildCurrentChart();
      sim.setChart(activeChart);
      resultsShownForRun = false;
      ui.hideResultsOverlay();
    },
    onSelectPracticeSection: (secId) => {
      selectedPracticeSection = secId;
      activeChart = buildCurrentChart();
      sim.setChart(activeChart);
      resultsShownForRun = false;
      ui.hideResultsOverlay();
    },
    onStartOrResume: () => startOrResumeShift(),
    onPauseToggle: () => togglePause(),
    onRestart: () => restartShift(),
    onLaneInput: (lane) => handleLaneStrike(lane),
    onShuntInput: () => handleShuntTrigger(),
    onCalibrationChange: (offsetMs) => applyCalibrationOffset(offsetMs),
    onToggleNoFail: (enabled) => {
      saveData.noFailMode = enabled;
      saveSaveData(saveData);
      sim.setNoFailMode(enabled);
    },
    onToggleMute: () => {
      saveData.muted = !saveData.muted;
      saveSaveData(saveData);
      audio.setMuted(saveData.muted);
    },
    onOpenCalibrationModal: (open) => {
      calibrationModalOpen = open;
      calibrationTapsMs = [];
      if (open && sim.getStatus() === 'playing') {
        sim.pause(audio.getNowAudioMs());
      }
      ui.setCalibrationModalOpen(open, saveData.calibrationOffsetMs);
    },
    onCalibrationTap: () => handleCalibrationTap(),
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();

    if (key === 'f' || key === 'd' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleLaneStrike('left');
    } else if (key === 'j' || key === 'k' || e.key === 'ArrowRight') {
      e.preventDefault();
      handleLaneStrike('right');
    } else if (e.code === 'Space') {
      e.preventDefault();
      handleShuntTrigger();
    } else if (key === 'p' || e.key === 'Escape') {
      e.preventDefault();
      if (calibrationModalOpen) {
        calibrationModalOpen = false;
        ui.setCalibrationModalOpen(false, saveData.calibrationOffsetMs);
      } else {
        togglePause();
      }
    } else if (key === 'r') {
      e.preventDefault();
      restartShift();
    } else if (key === 'm') {
      e.preventDefault();
      saveData.muted = !saveData.muted;
      saveSaveData(saveData);
      audio.setMuted(saveData.muted);
    } else if (e.key === '`' || e.key === 'F3') {
      debugEnabled = !debugEnabled;
    }
  };

  const onWindowBlur = () => {
    if (sim.getStatus() === 'playing') {
      sim.pause(audio.getNowAudioMs());
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden && sim.getStatus() === 'playing') {
      sim.pause(audio.getNowAudioMs());
    }
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', onVisibilityChange);

  let rafId = 0;
  let destroyed = false;

  const tick = () => {
    if (destroyed) return;
    const nowAudioMs = audio.getNowAudioMs();
    const nowPerfMs = typeof performance !== 'undefined' ? performance.now() : Date.now();

    if (sim.getStatus() === 'playing') {
      sim.stepToAudioTimeMs(nowAudioMs);
      const calTrackMs = sim.getCalibratedTrackTimeMs();
      const route = sim.getCurrentRouteForTimeMs(calTrackMs);
      audio.updateTrackMusic(calTrackMs, route);
    }

    const statusAfterStep = sim.getStatus();
    if (
      (statusAfterStep === 'completed' || statusAfterStep === 'failed') &&
      !resultsShownForRun
    ) {
      resultsShownForRun = true;
      const summary = sim.getResultsSummary();
      saveData = recordRunResult(saveData, summary);
      ui.showResultsOverlay(
        summary,
        saveData,
        (practiceSecId) => {
          selectedPracticeSection = practiceSecId;
          activeChart = buildCurrentChart();
          sim.setChart(activeChart);
          startOrResumeShift();
        },
        (suggestedOffsetMs) => {
          applyCalibrationOffset(suggestedOffsetMs);
          restartShift();
        }
      );
    }

    ui.renderFrame(sim, activeChart, saveData, debugEnabled, nowPerfMs);
    rafId = window.requestAnimationFrame(tick);
  };

  rafId = window.requestAnimationFrame(tick);

  return {
    destroy() {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      audio.destroy();
      container.innerHTML = '';
    },
    getStateSnapshot() {
      return {
        status: sim.getStatus(),
        chartId: activeChart.id,
        practiceSectionId: activeChart.practiceSectionId ?? null,
        rawTrackTimeMs: sim.getRawTrackTimeMs(),
        calibratedTrackTimeMs: sim.getCalibratedTrackTimeMs(),
        calibrationOffsetMs: sim.getCalibrationOffsetMs(),
        score: sim.getScore(),
        combo: sim.getCombo(),
        maxCombo: sim.getMaxCombo(),
        stability: sim.getStability(),
        route: sim.getCurrentRouteForTimeMs(),
      };
    },
    restartWithSeed(seed: number) {
      dailySeed = seed;
      selectedDifficulty = 'daily';
      selectedPracticeSection = null;
      activeChart = buildCurrentChart();
      sim.setChart(activeChart);
      restartShift();
    },
    toggleDebug(force?: boolean) {
      debugEnabled = typeof force === 'boolean' ? force : !debugEnabled;
    },
  };
}
