import {
  CALIBRATION_LIMITS_MS,
  HISTOGRAM_BINS,
  JUDGMENT_WINDOWS_MS,
  JudgmentGrade,
  LaneId,
  RankGrade,
  RouteMode,
  SCORE_VALUES,
  STABILITY_CONFIG,
  SectionId,
  getComboMultiplier,
} from './config.ts';
import { ChartDefinition, ChartNote, ShuntGate } from './content.ts';

export interface HitJudgmentResult {
  grade: JudgmentGrade;
  deltaMs: number;
  absDeltaMs: number;
  effectiveInputTimeMs: number;
}

export interface NoteRuntimeState {
  note: ChartNote;
  judged: boolean;
  grade?: JudgmentGrade;
  deltaMs?: number;
  judgedAtTrackMs?: number;
  scoreAwarded?: number;
  routeAtJudgment?: RouteMode;
}

export interface RecordedInputEvent {
  type: 'lane' | 'shunt';
  lane?: LaneId;
  inputAudioTimeMs: number;
}

export interface HistogramBinCount {
  minMs: number;
  maxMs: number;
  label: string;
  count: number;
}

export interface SectionBreakdown {
  sectionId: SectionId;
  title: string;
  routeChosen: RouteMode;
  totalNotes: number;
  perfectCount: number;
  goodCount: number;
  earlyCount: number;
  lateCount: number;
  missCount: number;
  accuracyPct: number;
  meanErrorMs: number;
  scoreEarned: number;
}

export interface ResultsSummary {
  chartId: string;
  chartTitle: string;
  completed: boolean;
  practiceSectionId?: SectionId;
  totalScore: number;
  rank: RankGrade;
  accuracyPct: number;
  maxCombo: number;
  finalCombo: number;
  finalStability: number;
  counts: Record<JudgmentGrade, number>;
  shuntSwitchesActivated: number;
  meanErrorMs: number;
  suggestedCalibrationOffsetMs: number;
  histogram: HistogramBinCount[];
  sectionBreakdowns: SectionBreakdown[];
  weakestSectionId: SectionId;
}

export interface SimulationSettings {
  calibrationOffsetMs: number;
  noFailMode?: boolean;
}

export interface LastFeedbackBanner {
  text: string;
  grade: JudgmentGrade | 'OVERDRIVE';
  deltaMs?: number;
  lane?: LaneId;
  trackTimeMs: number;
}

/**
 * Pure audio-clock hit judgment function.
 * All hit timing is evaluated strictly in the calibrated audio clock domain:
 * effectiveInputTimeMs = inputAudioTimeMs - calibrationOffsetMs
 * deltaMs = effectiveInputTimeMs - noteTimeMs (negative = EARLY, positive = LATE)
 */
export function judgeHit(
  noteTimeMs: number,
  inputAudioTimeMs: number,
  calibrationOffsetMs: number = 0
): HitJudgmentResult {
  const clampedOffset = Math.max(
    CALIBRATION_LIMITS_MS.MIN,
    Math.min(CALIBRATION_LIMITS_MS.MAX, calibrationOffsetMs)
  );
  const effectiveInputTimeMs = inputAudioTimeMs - clampedOffset;
  const deltaMs = effectiveInputTimeMs - noteTimeMs;
  const absDeltaMs = Math.abs(deltaMs);

  if (absDeltaMs <= JUDGMENT_WINDOWS_MS.PERFECT) {
    return { grade: 'PERFECT', deltaMs, absDeltaMs, effectiveInputTimeMs };
  }
  if (absDeltaMs <= JUDGMENT_WINDOWS_MS.GOOD) {
    return { grade: 'GOOD', deltaMs, absDeltaMs, effectiveInputTimeMs };
  }
  if (absDeltaMs <= JUDGMENT_WINDOWS_MS.EARLY_LATE) {
    return {
      grade: deltaMs < 0 ? 'EARLY' : 'LATE',
      deltaMs,
      absDeltaMs,
      effectiveInputTimeMs,
    };
  }
  return { grade: 'MISS', deltaMs, absDeltaMs, effectiveInputTimeMs };
}

export function computeRankGrade(accuracyPct: number, completed: boolean, misses: number): RankGrade {
  if (!completed) return 'D';
  if (accuracyPct >= 93 && misses <= 2) return 'S';
  if (accuracyPct >= 84) return 'A';
  if (accuracyPct >= 72) return 'B';
  if (accuracyPct >= 58) return 'C';
  return 'D';
}

export function computeTimingHistogram(deltasMs: readonly number[]): {
  histogram: HistogramBinCount[];
  meanErrorMs: number;
} {
  const bins: HistogramBinCount[] = HISTOGRAM_BINS.map((b) => ({
    minMs: b.minMs,
    maxMs: b.maxMs,
    label: b.label,
    count: 0,
  }));

  if (deltasMs.length === 0) {
    return { histogram: bins, meanErrorMs: 0 };
  }

  let sum = 0;
  for (const rawDelta of deltasMs) {
    sum += rawDelta;
    const clamped = Math.max(-120, Math.min(119.999, rawDelta));
    const binIdx = Math.min(
      bins.length - 1,
      Math.max(0, Math.floor((clamped + 120) / 20))
    );
    bins[binIdx].count += 1;
  }

  const meanErrorMs = Math.round((sum / deltasMs.length) * 10) / 10;
  return { histogram: bins, meanErrorMs };
}

export type SimulationStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

export class BeatlineSimulation {
  private chart: ChartDefinition;
  private settings: SimulationSettings;
  private status: SimulationStatus = 'idle';

  private anchorAudioTimeMs = 0;
  private elapsedBeforeAnchorMs = 0;
  private currentTrackTimeMs = 0;
  private pauseCount = 0;

  private noteStates: NoteRuntimeState[] = [];
  private sectionRoutes: Map<SectionId, RouteMode> = new Map();
  private activatedGates: Set<string> = new Set();

  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private stability: number = STABILITY_CONFIG.INITIAL;
  private recordedInputs: RecordedInputEvent[] = [];
  private hitDeltasMs: number[] = [];
  private lastFeedback: LastFeedbackBanner | null = null;

  constructor(chart: ChartDefinition, settings?: Partial<SimulationSettings>) {
    this.chart = chart;
    this.settings = {
      calibrationOffsetMs: Math.max(
        CALIBRATION_LIMITS_MS.MIN,
        Math.min(CALIBRATION_LIMITS_MS.MAX, settings?.calibrationOffsetMs ?? 0)
      ),
      noFailMode: settings?.noFailMode ?? false,
    };
    this.resetState();
  }

  private resetState(): void {
    const startMs = this.chart.practiceStartTimeMs ?? 0;
    this.status = 'idle';
    this.anchorAudioTimeMs = 0;
    this.elapsedBeforeAnchorMs = startMs;
    this.currentTrackTimeMs = startMs;
    this.pauseCount = 0;

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.stability = STABILITY_CONFIG.INITIAL;
    this.recordedInputs = [];
    this.hitDeltasMs = [];
    this.lastFeedback = null;

    this.sectionRoutes.clear();
    for (const sec of this.chart.sections) {
      this.sectionRoutes.set(sec.id, 'standard');
    }
    this.activatedGates.clear();

    this.noteStates = this.chart.notes.map((note) => ({
      note,
      judged: false,
    }));
  }

  public setChart(chart: ChartDefinition): void {
    this.chart = chart;
    this.resetState();
  }

  public getChart(): ChartDefinition {
    return this.chart;
  }

  public setCalibrationOffsetMs(offsetMs: number): void {
    this.settings.calibrationOffsetMs = Math.max(
      CALIBRATION_LIMITS_MS.MIN,
      Math.min(CALIBRATION_LIMITS_MS.MAX, Math.round(offsetMs))
    );
  }

  public getCalibrationOffsetMs(): number {
    return this.settings.calibrationOffsetMs;
  }

  public setNoFailMode(noFail: boolean): void {
    this.settings.noFailMode = noFail;
  }

  public getNoFailMode(): boolean {
    return Boolean(this.settings.noFailMode);
  }

  public start(startAudioTimeMs: number = 0): void {
    this.resetState();
    const startTrackMs = this.chart.practiceStartTimeMs ?? 0;
    this.anchorAudioTimeMs = startAudioTimeMs;
    this.elapsedBeforeAnchorMs = startTrackMs;
    this.currentTrackTimeMs = startTrackMs;
    this.status = 'playing';
  }

  public restart(startAudioTimeMs: number = 0): void {
    this.start(startAudioTimeMs);
  }

  /**
   * Pauses the simulation at an exact audio timestamp.
   * Freezes track progress so pausing or window blur NEVER manufactures misses.
   */
  public pause(pauseAudioTimeMs: number): void {
    if (this.status !== 'playing') return;
    this.updateTrackClockOnly(pauseAudioTimeMs);
    this.elapsedBeforeAnchorMs = this.currentTrackTimeMs;
    this.anchorAudioTimeMs = pauseAudioTimeMs;
    this.status = 'paused';
    this.pauseCount += 1;
  }

  /**
   * Resumes from pause by re-anchoring the audio clock at resumeAudioTimeMs.
   * Zero elapsed track time passes during the pause interval.
   */
  public resume(resumeAudioTimeMs: number): void {
    if (this.status !== 'paused') return;
    this.anchorAudioTimeMs = resumeAudioTimeMs;
    this.status = 'playing';
  }

  private updateTrackClockOnly(audioTimeMs: number): void {
    const delta = Math.max(0, audioTimeMs - this.anchorAudioTimeMs);
    this.currentTrackTimeMs = this.elapsedBeforeAnchorMs + delta;
  }

  /**
   * Returns current calibrated track time in milliseconds.
   */
  public getCalibratedTrackTimeMs(): number {
    return this.currentTrackTimeMs - this.settings.calibrationOffsetMs;
  }

  public getRawTrackTimeMs(): number {
    return this.currentTrackTimeMs;
  }

  public getStatus(): SimulationStatus {
    return this.status;
  }

  public getPauseCount(): number {
    return this.pauseCount;
  }

  public getScore(): number {
    return this.score;
  }

  public getCombo(): number {
    return this.combo;
  }

  public getMaxCombo(): number {
    return this.maxCombo;
  }

  public getStability(): number {
    return this.stability;
  }

  public getLastFeedback(): LastFeedbackBanner | null {
    return this.lastFeedback;
  }

  public getRecordedInputs(): readonly RecordedInputEvent[] {
    return this.recordedInputs;
  }

  /**
   * Checks whether a note is part of the currently active route branch for its section.
   */
  public isNoteActiveOnCurrentRoute(note: ChartNote): boolean {
    if (note.routeBranch === 'both') return true;
    const sectionRoute = this.sectionRoutes.get(note.sectionId) ?? 'standard';
    return note.routeBranch === sectionRoute;
  }

  public getCurrentRouteForTimeMs(trackTimeMs: number = this.getCalibratedTrackTimeMs()): RouteMode {
    for (const gate of this.chart.shuntGates) {
      if (
        this.activatedGates.has(gate.id) &&
        trackTimeMs >= gate.timeMs - gate.activationLeadMs &&
        trackTimeMs <= gate.overdriveEndTimeMs
      ) {
        return 'overdrive';
      }
    }
    return 'standard';
  }

  public getUpcomingOrActiveGate(trackTimeMs: number = this.getCalibratedTrackTimeMs()): {
    gate: ShuntGate;
    canActivateNow: boolean;
    isActivated: boolean;
  } | null {
    for (const gate of this.chart.shuntGates) {
      const isActivated = this.activatedGates.has(gate.id);
      const canActivateNow =
        !isActivated &&
        trackTimeMs >= gate.timeMs - gate.activationLeadMs &&
        trackTimeMs <= gate.timeMs + gate.activationTailMs;
      if (trackTimeMs <= gate.overdriveEndTimeMs) {
        return { gate, canActivateNow, isActivated };
      }
    }
    return null;
  }

  public getActiveNoteStates(): readonly NoteRuntimeState[] {
    return this.noteStates.filter((ns) => this.isNoteActiveOnCurrentRoute(ns.note));
  }

  /**
   * Advances simulation to the given audio clock timestamp (in milliseconds).
   * Automatically marks unhit active notes past the +120ms late window as MISS.
   */
  public stepToAudioTimeMs(audioTimeMs: number): void {
    if (this.status !== 'playing') return;

    this.updateTrackClockOnly(audioTimeMs);
    const calibratedMs = this.getCalibratedTrackTimeMs();

    for (const ns of this.noteStates) {
      if (ns.judged) continue;
      if (!this.isNoteActiveOnCurrentRoute(ns.note)) continue;

      if (calibratedMs > ns.note.timeMs + JUDGMENT_WINDOWS_MS.EARLY_LATE) {
        this.applyNoteJudgment(ns, 'MISS', JUDGMENT_WINDOWS_MS.EARLY_LATE + 1, calibratedMs);
        if (this.getStatus() === 'failed') return;
      }
    }

    const endMs = this.chart.practiceEndTimeMs ?? this.chart.durationMs;
    if (this.currentTrackTimeMs >= endMs) {
      // Final sweep for any remaining active notes in window
      for (const ns of this.noteStates) {
        if (!ns.judged && this.isNoteActiveOnCurrentRoute(ns.note)) {
          this.applyNoteJudgment(ns, 'MISS', JUDGMENT_WINDOWS_MS.EARLY_LATE + 1, calibratedMs);
          if (this.getStatus() === 'failed') return;
        }
      }
      this.status = 'completed';
    }
  }

  /**
   * Handles a player Overdrive Shunt switch input (`[Space]`) at `inputAudioTimeMs`.
   */
  public handleShuntSwitchInput(inputAudioTimeMs: number): boolean {
    if (this.status !== 'playing') return false;
    this.updateTrackClockOnly(inputAudioTimeMs);

    const eventTrackAudioMs = this.currentTrackTimeMs;
    this.recordedInputs.push({
      type: 'shunt',
      inputAudioTimeMs: eventTrackAudioMs,
    });

    const calibratedMs = this.getCalibratedTrackTimeMs();
    for (const gate of this.chart.shuntGates) {
      if (this.activatedGates.has(gate.id)) continue;
      if (
        calibratedMs >= gate.timeMs - gate.activationLeadMs &&
        calibratedMs <= gate.timeMs + gate.activationTailMs
      ) {
        this.activatedGates.add(gate.id);
        this.sectionRoutes.set(gate.sectionId, 'overdrive');
        this.score += SCORE_VALUES.SHUNT_SWITCH_BONUS;
        this.lastFeedback = {
          text: 'OVERDRIVE SHUNT ENGAGED (1.5x)',
          grade: 'OVERDRIVE',
          trackTimeMs: calibratedMs,
        };
        return true;
      }
    }
    return false;
  }

  /**
   * Handles a Left or Right lane strike at `inputAudioTimeMs`.
   */
  public handleLaneInput(lane: LaneId, inputAudioTimeMs: number): HitJudgmentResult | null {
    if (this.status !== 'playing') return null;

    // Advance clock to input timestamp first so expired notes are resolved cleanly
    this.stepToAudioTimeMs(inputAudioTimeMs);
    if (this.status !== 'playing') return null;

    const eventTrackAudioMs = this.currentTrackTimeMs;
    this.recordedInputs.push({
      type: 'lane',
      lane,
      inputAudioTimeMs: eventTrackAudioMs,
    });

    const calibratedMs = this.getCalibratedTrackTimeMs();

    // Find the earliest unjudged active note in this lane within the ±120ms window
    let bestCandidate: NoteRuntimeState | null = null;
    let bestAbsDelta = Infinity;

    for (const ns of this.noteStates) {
      if (ns.judged) continue;
      if (ns.note.lane !== lane) continue;
      if (!this.isNoteActiveOnCurrentRoute(ns.note)) continue;

      const delta = calibratedMs - ns.note.timeMs;
      const absDelta = Math.abs(delta);
      if (absDelta <= JUDGMENT_WINDOWS_MS.EARLY_LATE && absDelta < bestAbsDelta) {
        bestCandidate = ns;
        bestAbsDelta = absDelta;
      }
    }

    if (!bestCandidate) {
      return null;
    }

    const judgment = judgeHit(
      bestCandidate.note.timeMs,
      eventTrackAudioMs,
      this.settings.calibrationOffsetMs
    );

    this.applyNoteJudgment(bestCandidate, judgment.grade, judgment.deltaMs, calibratedMs);
    return judgment;
  }

  private applyNoteJudgment(
    ns: NoteRuntimeState,
    grade: JudgmentGrade,
    deltaMs: number,
    calibratedTrackMs: number
  ): void {
    ns.judged = true;
    ns.grade = grade;
    ns.deltaMs = Math.round(deltaMs);
    ns.judgedAtTrackMs = calibratedTrackMs;

    const sectionRoute = this.sectionRoutes.get(ns.note.sectionId) ?? 'standard';
    const isOverdriveNote = ns.note.routeBranch === 'overdrive' || sectionRoute === 'overdrive';
    ns.routeAtJudgment = isOverdriveNote ? 'overdrive' : 'standard';

    if (grade === 'MISS') {
      this.combo = 0;
      ns.scoreAwarded = 0;
      const loss = isOverdriveNote
        ? STABILITY_CONFIG.LOSS_MISS_OVERDRIVE
        : STABILITY_CONFIG.LOSS_MISS_STANDARD;
      this.stability = Math.max(STABILITY_CONFIG.MIN, this.stability - loss);
      this.lastFeedback = {
        text: 'MISS',
        grade: 'MISS',
        lane: ns.note.lane,
        trackTimeMs: calibratedTrackMs,
      };

      if (this.stability <= 0 && !this.settings.noFailMode) {
        this.status = 'failed';
      }
      return;
    }

    // Valid hit (PERFECT, GOOD, EARLY, LATE)
    this.hitDeltasMs.push(deltaMs);

    if (grade === 'PERFECT' || grade === 'GOOD') {
      this.combo += 1;
      if (this.combo > this.maxCombo) {
        this.maxCombo = this.combo;
      }
    } else {
      // EARLY / LATE preserves half combo or resets if < 2
      this.combo = Math.floor(this.combo / 2);
    }

    const basePoints = SCORE_VALUES[grade];
    const comboMult = getComboMultiplier(this.combo);
    const routeMult = isOverdriveNote ? SCORE_VALUES.OVERDRIVE_MULTIPLIER : 1.0;
    const points = Math.round(basePoints * comboMult * routeMult);

    ns.scoreAwarded = points;
    this.score += points;

    if (grade === 'PERFECT') {
      this.stability = Math.min(
        STABILITY_CONFIG.MAX,
        this.stability + STABILITY_CONFIG.GAIN_PERFECT
      );
    } else if (grade === 'GOOD') {
      this.stability = Math.min(
        STABILITY_CONFIG.MAX,
        this.stability + STABILITY_CONFIG.GAIN_GOOD
      );
    } else {
      this.stability = Math.max(
        STABILITY_CONFIG.MIN,
        this.stability - STABILITY_CONFIG.LOSS_EARLY_LATE
      );
    }

    const signedStr =
      Math.round(deltaMs) >= 0 ? `+${Math.round(deltaMs)}ms` : `${Math.round(deltaMs)}ms`;
    this.lastFeedback = {
      text: `${grade} ${signedStr}`,
      grade,
      deltaMs: Math.round(deltaMs),
      lane: ns.note.lane,
      trackTimeMs: calibratedTrackMs,
    };
  }

  /**
   * Builds the full post-shift diagnostic report including the Timing-Error Histogram,
   * 4-Section Breakdown, suggested calibration offset, and weakest section ID.
   */
  public getResultsSummary(): ResultsSummary {
    const activeNotes = this.getActiveNoteStates();
    const counts: Record<JudgmentGrade, number> = {
      PERFECT: 0,
      GOOD: 0,
      EARLY: 0,
      LATE: 0,
      MISS: 0,
    };

    let weightedAccuracySum = 0;
    let judgedCount = 0;
    for (const ns of activeNotes) {
      if (!ns.judged || !ns.grade) continue;
      judgedCount += 1;
      const g: JudgmentGrade = ns.grade;
      counts[g] += 1;
      if (g === 'PERFECT') weightedAccuracySum += 1.0;
      else if (g === 'GOOD') weightedAccuracySum += 0.78;
      else if (g === 'EARLY' || g === 'LATE') weightedAccuracySum += 0.35;
    }

    const totalDenom = this.status === 'completed' ? activeNotes.length || 1 : judgedCount || 1;
    const accuracyPct = Math.round((weightedAccuracySum / totalDenom) * 1000) / 10;
    const { histogram, meanErrorMs } = computeTimingHistogram(this.hitDeltasMs);

    const sectionBreakdowns: SectionBreakdown[] = this.chart.sections.map((sec) => {
      const secNotes = activeNotes.filter((ns) => ns.note.sectionId === sec.id);
      let perfectCount = 0;
      let goodCount = 0;
      let earlyCount = 0;
      let lateCount = 0;
      let missCount = 0;
      let secWeighted = 0;
      let secScore = 0;
      const secDeltas: number[] = [];

      for (const ns of secNotes) {
        const g: JudgmentGrade = ns.judged && ns.grade ? ns.grade : 'MISS';
        secScore += ns.scoreAwarded ?? 0;
        if (g === 'PERFECT') {
          perfectCount += 1;
          secWeighted += 1.0;
          if (ns.deltaMs !== undefined) secDeltas.push(ns.deltaMs);
        } else if (g === 'GOOD') {
          goodCount += 1;
          secWeighted += 0.78;
          if (ns.deltaMs !== undefined) secDeltas.push(ns.deltaMs);
        } else if (g === 'EARLY') {
          earlyCount += 1;
          secWeighted += 0.35;
          if (ns.deltaMs !== undefined) secDeltas.push(ns.deltaMs);
        } else if (g === 'LATE') {
          lateCount += 1;
          secWeighted += 0.35;
          if (ns.deltaMs !== undefined) secDeltas.push(ns.deltaMs);
        } else {
          missCount += 1;
        }
      }

      const secTotal = secNotes.length || 1;
      const secAcc = Math.round((secWeighted / secTotal) * 1000) / 10;
      const secMean =
        secDeltas.length > 0
          ? Math.round((secDeltas.reduce((a, b) => a + b, 0) / secDeltas.length) * 10) / 10
          : 0;

      return {
        sectionId: sec.id,
        title: sec.title,
        routeChosen: this.sectionRoutes.get(sec.id) ?? 'standard',
        totalNotes: secNotes.length,
        perfectCount,
        goodCount,
        earlyCount,
        lateCount,
        missCount,
        accuracyPct: secAcc,
        meanErrorMs: secMean,
        scoreEarned: secScore,
      };
    });

    // Identify weakest section (lowest accuracyPct, tie-broken by highest miss + early/late count)
    let weakestSection = sectionBreakdowns[0];
    for (const sb of sectionBreakdowns) {
      if (!weakestSection) {
        weakestSection = sb;
        continue;
      }
      const sbErrors = sb.missCount * 2 + sb.earlyCount + sb.lateCount;
      const weakErrors =
        weakestSection.missCount * 2 + weakestSection.earlyCount + weakestSection.lateCount;
      if (
        sb.accuracyPct < weakestSection.accuracyPct ||
        (sb.accuracyPct === weakestSection.accuracyPct && sbErrors > weakErrors)
      ) {
        weakestSection = sb;
      }
    }

    const completed = this.status === 'completed';
    const rank = computeRankGrade(accuracyPct, completed, counts.MISS);

    const suggestedCalibrationOffsetMs = Math.max(
      CALIBRATION_LIMITS_MS.MIN,
      Math.min(
        CALIBRATION_LIMITS_MS.MAX,
        Math.round((this.settings.calibrationOffsetMs + meanErrorMs) / 5) * 5
      )
    );

    return {
      chartId: this.chart.id,
      chartTitle: this.chart.title,
      completed,
      practiceSectionId: this.chart.practiceSectionId,
      totalScore: this.score,
      rank,
      accuracyPct,
      maxCombo: this.maxCombo,
      finalCombo: this.combo,
      finalStability: Math.round(this.stability * 10) / 10,
      counts,
      shuntSwitchesActivated: this.activatedGates.size,
      meanErrorMs,
      suggestedCalibrationOffsetMs,
      histogram,
      sectionBreakdowns,
      weakestSectionId: weakestSection ? weakestSection.sectionId : 'intro-induction',
    };
  }
}

/**
 * Pure deterministic replay scorer: given a chart, a sequence of recorded input events,
 * and simulation settings, produces the exact ResultsSummary.
 */
export function evaluateRecordedInputs(
  chart: ChartDefinition,
  inputs: readonly RecordedInputEvent[],
  settings?: Partial<SimulationSettings>
): ResultsSummary {
  const sim = new BeatlineSimulation(chart, settings);
  const startMs = chart.practiceStartTimeMs ?? 0;
  sim.start(startMs);

  const sortedInputs = [...inputs].sort((a, b) => a.inputAudioTimeMs - b.inputAudioTimeMs);
  for (const ev of sortedInputs) {
    if (sim.getStatus() !== 'playing') break;
    if (ev.type === 'shunt') {
      sim.handleShuntSwitchInput(ev.inputAudioTimeMs);
    } else if (ev.type === 'lane' && ev.lane) {
      sim.handleLaneInput(ev.lane, ev.inputAudioTimeMs);
    }
  }

  const endMs = chart.practiceEndTimeMs ?? chart.durationMs;
  if (sim.getStatus() === 'playing') {
    sim.stepToAudioTimeMs(endMs + 500);
  }

  return sim.getResultsSummary();
}

/**
 * Generates an ideal input sequence for either the Standard Route or the Overdrive Shunt Route
 * to verify chart completability and compare theoretical maximum scores.
 */
export function buildPerfectInputsForRoute(
  chart: ChartDefinition,
  route: RouteMode,
  calibrationOffsetMs: number = 0
): RecordedInputEvent[] {
  const events: RecordedInputEvent[] = [];

  if (route === 'overdrive') {
    for (const gate of chart.shuntGates) {
      events.push({
        type: 'shunt',
        inputAudioTimeMs: gate.timeMs + calibrationOffsetMs,
      });
    }
  }

  for (const note of chart.notes) {
    if (note.routeBranch === 'both' || note.routeBranch === route) {
      events.push({
        type: 'lane',
        lane: note.lane,
        inputAudioTimeMs: note.timeMs + calibrationOffsetMs,
      });
    }
  }

  events.sort((a, b) => a.inputAudioTimeMs - b.inputAudioTimeMs);
  return events;
}
