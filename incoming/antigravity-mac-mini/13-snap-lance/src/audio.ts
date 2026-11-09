/**
 * Procedural WebAudio Synthesizer for SNAP-LANCE
 * Pitches up harmonically with the player's combo streak and bounce chain.
 */

// Pentatonic + Lydian harmonic frequency ladder (Hz) for streak escalation
export const HARMONIC_SCALE_HZ: readonly number[] = [
  261.63, // C4 (Streak 0-1)
  293.66, // D4 (Streak 2)
  329.63, // E4 (Streak 3)
  392.00, // G4 (Streak 4)
  440.00, // A4 (Streak 5)
  523.25, // C5 (Streak 6)
  587.33, // D5 (Streak 7)
  659.25, // E5 (Streak 8)
  739.99, // F#5 (Streak 9 - Lydian bright lift)
  783.99, // G5 (Streak 10)
  880.00, // A5 (Streak 11)
  987.77, // B5 (Streak 12)
  1046.50, // C6 (Streak 13)
  1174.66, // D6 (Streak 14)
  1318.51, // E6 (Streak 15)
  1567.98, // G6 (Streak 16+)
];

export function computeHarmonicFrequency(comboStreak: number, bounceIndex = 0): number {
  const safeStreak = Math.max(0, Math.floor(comboStreak));
  const safeBounce = Math.max(0, Math.floor(bounceIndex));
  const totalStep = safeStreak + safeBounce;
  const idx = Math.min(HARMONIC_SCALE_HZ.length - 1, totalStep);
  const baseFreq = HARMONIC_SCALE_HZ[idx];
  // Beyond the table, continue pitching gently upward in harmonic semitones (capped cleanly)
  const overflowSteps = Math.max(0, totalStep - (HARMONIC_SCALE_HZ.length - 1));
  const overflowMultiplier = Math.pow(2, Math.min(overflowSteps, 12) / 12);
  return Number((baseFreq * overflowMultiplier).toFixed(2));
}

export class SnapLanceSynth {
  private ctx: AudioContext | null = null;
  private lastPlayedFreq = HARMONIC_SCALE_HZ[0];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          return null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getLastPlayedFrequency(): number {
    return this.lastPlayedFreq;
  }

  /**
   * Subtle rising tick as charge coils through tiers 1 -> 2 -> 3 (Apex Sweet-Spot).
   */
  public playChargeTierLock(tier: 1 | 2 | 3, comboStreak: number): number {
    const freq = computeHarmonicFrequency(comboStreak, tier * 2);
    this.lastPlayedFreq = freq;
    const ctx = this.ensureContext();
    if (!ctx) return freq;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = tier === 3 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq * 0.85, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.055);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(tier === 3 ? 0.16 : 0.09, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (tier === 3 ? 0.16 : 0.09));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (tier === 3 ? 0.17 : 0.1));

    if (tier === 3) {
      // Shimmering harmonic fifth for Apex Sweet-Spot lock
      const fifth = ctx.createOscillator();
      const fifthGain = ctx.createGain();
      fifth.type = 'sine';
      fifth.frequency.setValueAtTime(freq * 1.5, now);
      fifthGain.gain.setValueAtTime(0.001, now);
      fifthGain.gain.linearRampToValueAtTime(0.09, now + 0.015);
      fifthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      fifth.connect(fifthGain);
      fifthGain.connect(ctx.destination);
      fifth.start(now);
      fifth.stop(now + 0.2);
    }

    return freq;
  }

  /**
   * Snap release transient: punchy kinetic launch thump + harmonic snap.
   */
  public playLaunchSnap(chargeRatio: number, comboStreak: number): number {
    const freq = computeHarmonicFrequency(comboStreak, Math.round(chargeRatio * 3));
    this.lastPlayedFreq = freq;
    const ctx = this.ensureContext();
    if (!ctx) return freq;

    const now = ctx.currentTime;

    // 1. Sub-bass kinetic punch
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(150 + chargeRatio * 90, now);
    sub.frequency.exponentialRampToValueAtTime(42, now + 0.13);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.22, now + 0.008);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.15);

    // 2. High harmonic snap chirp
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'sawtooth';
    snap.frequency.setValueAtTime(freq * 1.25, now);
    snap.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.08);

    snapGain.gain.setValueAtTime(0.001, now);
    snapGain.gain.linearRampToValueAtTime(0.08, now + 0.005);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.09);

    return freq;
  }

  /**
   * Harmonic impact / skewer chime that pitches up with the player's combo streak.
   */
  public playComboKill(comboStreak: number, bounceCount = 0, isApex = false): number {
    const freq = computeHarmonicFrequency(comboStreak, bounceCount);
    this.lastPlayedFreq = freq;
    const ctx = this.ensureContext();
    if (!ctx) return freq;

    const now = ctx.currentTime;

    // Primary harmonic bell tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.015, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Harmonic fifth / octave overtone for crystalline clarity
    const overtone = ctx.createOscillator();
    const overGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * (isApex ? 2.0 : 1.5), now);

    overGain.gain.setValueAtTime(0.001, now);
    overGain.gain.linearRampToValueAtTime(0.11, now + 0.01);
    overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    overtone.connect(overGain);
    overGain.connect(ctx.destination);
    overtone.start(now);
    overtone.stop(now + 0.29);

    return freq;
  }

  /**
   * Elastic wall / bumper ricochet plink that pitches up with bounce index and combo.
   */
  public playBounce(comboStreak: number, bounceIndex: number): number {
    const freq = computeHarmonicFrequency(comboStreak, bounceIndex + 1);
    this.lastPlayedFreq = freq;
    const ctx = this.ensureContext();
    if (!ctx) return freq;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.75, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.065);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    return freq;
  }

  /**
   * Low dissonant thud when taking damage / losing a shield petal.
   */
  public playDamageHit(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.26);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  /**
   * Bright chord arpeggio on wave clear / upgrade pick.
   */
  public playUpgradeChime(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    const now = ctx.currentTime;
    notes.forEach((n, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.045;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }
}
