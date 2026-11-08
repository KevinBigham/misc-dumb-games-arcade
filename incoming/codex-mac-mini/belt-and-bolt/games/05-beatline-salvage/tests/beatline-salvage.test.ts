import { describe, expect, it } from 'vitest';
import {
  BeatlineSimulation,
  JUDGMENT_WINDOWS_MS,
  SONG_SECTIONS,
  buildPerfectInputsForRoute,
  createSectionPracticeChart,
  createSeededDailyChart,
  evaluateRecordedInputs,
  getAllBaseCharts,
  getChartById,
  judgeHit,
  metadata,
} from '../src/index.ts';

describe('Game 05: Beatline Salvage — Precision Audio-Clock Rhythm & Salvage Machine', () => {
  it('exports valid ArgonGameMetadata for Game 05', () => {
    expect(metadata.id).toBe('05-beatline-salvage');
    expect(metadata.number).toBe(5);
    expect(metadata.title).toContain('Beatline Salvage');
  });

  describe('1. Audio-Clock Hit Judgment Boundaries & Calibration Offsets', () => {
    it('evaluates exact PERFECT, GOOD, EARLY, LATE, and MISS windows with 0ms offset', () => {
      const targetMs = 2000;

      // Exact center & boundaries of PERFECT (±32ms)
      expect(judgeHit(targetMs, 2000, 0).grade).toBe('PERFECT');
      expect(judgeHit(targetMs, 2000 - JUDGMENT_WINDOWS_MS.PERFECT, 0).grade).toBe('PERFECT');
      expect(judgeHit(targetMs, 2000 + JUDGMENT_WINDOWS_MS.PERFECT, 0).grade).toBe('PERFECT');

      // Boundaries of GOOD (±33ms .. ±75ms)
      expect(judgeHit(targetMs, 2000 - 33, 0).grade).toBe('GOOD');
      expect(judgeHit(targetMs, 2000 + 33, 0).grade).toBe('GOOD');
      expect(judgeHit(targetMs, 2000 - JUDGMENT_WINDOWS_MS.GOOD, 0).grade).toBe('GOOD');
      expect(judgeHit(targetMs, 2000 + JUDGMENT_WINDOWS_MS.GOOD, 0).grade).toBe('GOOD');

      // Boundaries of EARLY (-76ms .. -120ms) and LATE (+76ms .. +120ms)
      const earlyHit = judgeHit(targetMs, 2000 - 76, 0);
      expect(earlyHit.grade).toBe('EARLY');
      expect(earlyHit.deltaMs).toBe(-76);
      expect(judgeHit(targetMs, 2000 - JUDGMENT_WINDOWS_MS.EARLY_LATE, 0).grade).toBe('EARLY');

      const lateHit = judgeHit(targetMs, 2000 + 76, 0);
      expect(lateHit.grade).toBe('LATE');
      expect(lateHit.deltaMs).toBe(76);
      expect(judgeHit(targetMs, 2000 + JUDGMENT_WINDOWS_MS.EARLY_LATE, 0).grade).toBe('LATE');

      // Outside ±120ms is MISS
      expect(judgeHit(targetMs, 2000 - 121, 0).grade).toBe('MISS');
      expect(judgeHit(targetMs, 2000 + 121, 0).grade).toBe('MISS');
    });

    it('shifts judgment windows accurately for positive (+50ms) and negative (-40ms) calibration offsets', () => {
      const targetMs = 5000;

      // With +50ms offset (Bluetooth latency), hitting at raw 5050ms yields 0ms delta (PERFECT)
      const btHit = judgeHit(targetMs, 5050, 50);
      expect(btHit.grade).toBe('PERFECT');
      expect(btHit.deltaMs).toBe(0);

      // With -40ms offset, hitting at raw 4960ms yields 0ms delta (PERFECT)
      const earlyCalHit = judgeHit(targetMs, 4960, -40);
      expect(earlyCalHit.grade).toBe('PERFECT');
      expect(earlyCalHit.deltaMs).toBe(0);
    });
  });

  describe('2. Pause, Resume, Window Blur & Restart Clock Discipline', () => {
    it('does NOT manufacture misses or advance track clock during long pause/blur intervals', () => {
      const chart = getChartById('standard');
      const sim = new BeatlineSimulation(chart, { calibrationOffsetMs: 0 });

      // Start at hardware audio clock = 1000ms
      sim.start(1000);
      const firstNote = chart.notes[0]; // at 1500ms track time

      // Advance to 100ms before the first note (track time = 1400ms, audio time = 2400ms)
      sim.stepToAudioTimeMs(2400);
      expect(sim.getRawTrackTimeMs()).toBe(1400);

      // Pause at audio time = 2400ms and leave paused for 60 seconds (until audio time = 62400ms)
      sim.pause(2400);
      expect(sim.getStatus()).toBe('paused');

      // Stepping while paused must be a complete no-op
      sim.stepToAudioTimeMs(30000);
      sim.stepToAudioTimeMs(62400);
      expect(sim.getRawTrackTimeMs()).toBe(1400);
      expect(sim.getResultsSummary().counts.MISS).toBe(0);

      // Resume at audio time = 62400ms; first note is still 100ms ahead (at audio time 62500ms)
      sim.resume(62400);
      expect(sim.getStatus()).toBe('playing');
      expect(sim.getRawTrackTimeMs()).toBe(1400);

      // Hit the first note at exact target time (audio time = 62500ms -> track time = 1500ms)
      const hitResult = sim.handleLaneInput(firstNote.lane, 62500);
      expect(hitResult).not.toBeNull();
      expect(hitResult?.grade).toBe('PERFECT');
      expect(sim.getCombo()).toBe(1);
      expect(sim.getResultsSummary().counts.MISS).toBe(0);
    });

    it('cleanly resets clock offsets, combo, stability, and note states on restart()', () => {
      const chart = getChartById('easy');
      const sim = new BeatlineSimulation(chart, { calibrationOffsetMs: 0, noFailMode: true });

      sim.start(500);
      const n0 = chart.notes[0];
      sim.handleLaneInput(n0.lane, 500 + n0.timeMs);
      expect(sim.getScore()).toBeGreaterThan(0);
      expect(sim.getCombo()).toBe(1);

      // Force a miss on the next notes by jumping forward
      sim.stepToAudioTimeMs(500 + 8000);
      expect(sim.getCombo()).toBe(0);
      expect(sim.getStability()).toBeLessThan(100);

      // Now restart at audio clock = 20000ms
      sim.restart(20000);
      expect(sim.getStatus()).toBe('playing');
      expect(sim.getRawTrackTimeMs()).toBe(0);
      expect(sim.getScore()).toBe(0);
      expect(sim.getCombo()).toBe(0);
      expect(sim.getStability()).toBe(100);
      expect(sim.getRecordedInputs().length).toBe(0);

      // First note can be hit cleanly again relative to the new start anchor
      const retryHit = sim.handleLaneInput(n0.lane, 20000 + n0.timeMs);
      expect(retryHit?.grade).toBe('PERFECT');
      expect(sim.getCombo()).toBe(1);
    });
  });

  describe('3. Deterministic Replay Scorer & Histogram Verification', () => {
    it('produces 100% identical scores, ranks, combos, and histograms for identical recorded inputs', () => {
      const chart = getChartById('standard');
      const baseInputs = buildPerfectInputsForRoute(chart, 'overdrive', 0);

      // Perturb some inputs with deterministic early/late offsets so the histogram is populated across bins
      const perturbedInputs = baseInputs.map((ev, idx) => {
        if (ev.type === 'shunt') return ev;
        const offsets = [-85, -45, -15, 0, 12, 38, 65, 95];
        const delta = offsets[idx % offsets.length];
        return {
          ...ev,
          inputAudioTimeMs: ev.inputAudioTimeMs + delta,
        };
      });

      const runA = evaluateRecordedInputs(chart, perturbedInputs, {
        calibrationOffsetMs: 0,
        noFailMode: true,
      });
      const runB = evaluateRecordedInputs(chart, perturbedInputs, {
        calibrationOffsetMs: 0,
        noFailMode: true,
      });

      expect(runA.totalScore).toBe(runB.totalScore);
      expect(runA.rank).toBe(runB.rank);
      expect(runA.accuracyPct).toBe(runB.accuracyPct);
      expect(runA.maxCombo).toBe(runB.maxCombo);
      expect(runA.meanErrorMs).toBe(runB.meanErrorMs);
      expect(runA.histogram).toEqual(runB.histogram);
      expect(runA.sectionBreakdowns).toEqual(runB.sectionBreakdowns);
    });
  });

  describe('4. Standard Route vs Overdrive Shunt Route Balance & Completability', () => {
    it('ensures both Standard and Overdrive Shunt routes are completable and Overdrive yields higher max score across all charts', () => {
      const charts = getAllBaseCharts(20261106);

      for (const chart of charts) {
        const stdInputs = buildPerfectInputsForRoute(chart, 'standard', 0);
        const odInputs = buildPerfectInputsForRoute(chart, 'overdrive', 0);

        const stdSummary = evaluateRecordedInputs(chart, stdInputs);
        const odSummary = evaluateRecordedInputs(chart, odInputs);

        expect(stdSummary.completed).toBe(true);
        expect(stdSummary.rank).toBe('S');
        expect(stdSummary.counts.MISS).toBe(0);

        expect(odSummary.completed).toBe(true);
        expect(odSummary.rank).toBe('S');
        expect(odSummary.counts.MISS).toBe(0);
        expect(odSummary.shuntSwitchesActivated).toBe(SONG_SECTIONS.length);

        // Overdrive route must yield strictly higher total score than Standard route
        expect(odSummary.totalScore).toBeGreaterThan(stdSummary.totalScore);
      }
    });

    it('generates identical daily charts for the same seed and different charts for different seeds', () => {
      const dailyA1 = createSeededDailyChart(20261106);
      const dailyA2 = createSeededDailyChart(20261106);
      const dailyB = createSeededDailyChart(20261107);

      expect(dailyA1.notes).toEqual(dailyA2.notes);
      expect(dailyA1.notes.map((n) => n.lane)).not.toEqual(dailyB.notes.map((n) => n.lane));
    });
  });

  describe('5. Section Practice Loop & Weakest Section Detection', () => {
    it('isolates only the selected section notes and identifies the weakest section on the Results screen', () => {
      const fullChart = getChartById('expert');
      const targetSection = 'high-voltage-shunt';
      const practiceChart = createSectionPracticeChart(fullChart, targetSection);

      expect(practiceChart.practiceSectionId).toBe(targetSection);
      expect(practiceChart.notes.length).toBeGreaterThan(0);
      expect(practiceChart.notes.every((n) => n.sectionId === targetSection)).toBe(true);

      // Verify full-chart weakest section detection when section 3 ('high-voltage-shunt') is missed
      const selectiveInputs = buildPerfectInputsForRoute(fullChart, 'standard', 0).filter(
        (ev) => {
          // Drop inputs inside section 3 (45,000ms .. 67,500ms)
          return ev.inputAudioTimeMs < 45_000 || ev.inputAudioTimeMs >= 67_500;
        }
      );

      const summary = evaluateRecordedInputs(fullChart, selectiveInputs, { noFailMode: true });
      expect(summary.weakestSectionId).toBe('high-voltage-shunt');
    });
  });
});
