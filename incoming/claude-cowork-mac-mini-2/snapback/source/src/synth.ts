// Procedural WebAudio Synthesizer with Harmonic Combo Pitching
// Zero external assets; safe no-op fallback in headless/test environments.

const HARMONIC_SEMITONES = [
  0,  // C
  2,  // D
  4,  // E
  7,  // G
  9,  // A
  11, // B
  12, // C (+1 oct)
  14, // D
  16, // E
  18, // F# (Lydian sparkle)
  19, // G
  21, // A
  23, // B
  24, // C (+2 oct)
  26, // D
  28, // E
  31, // G
  36, // C (+3 oct)
];

export function computeHarmonicComboFreq(streak: number, baseFreq = 261.63): number {
  const clamped = Math.max(0, Math.min(streak, 28));
  const degreeIndex = clamped % HARMONIC_SEMITONES.length;
  const extraOctaves = Math.floor(clamped / HARMONIC_SEMITONES.length);
  const semitones = HARMONIC_SEMITONES[degreeIndex] + extraOctaves * 12;
  return baseFreq * Math.pow(2, semitones / 12);
}

export class SnapbackSynth {
  private ctx: AudioContext | null = null;
  private muted = false;
  public lastPlayedComboFreq = 261.63;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  /** Rising tension tick as player holds charge */
  public playChargeTick(chargeRatio: number, isSweetSpot: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isSweetSpot ? 'triangle' : 'sine';
    const freq = 180 + chargeRatio * 520 + (isSweetSpot ? 240 : 0);
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.045);

    gain.gain.setValueAtTime(isSweetSpot ? 0.09 : 0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /** Whip-snap + sub-bass punch when releasing a slingshot launch */
  public playSnapLaunch(powerRatio: number, isSweetSpot: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. Sub-bass punch
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    const startFreq = 150 + powerRatio * 90;
    sub.frequency.setValueAtTime(startFreq, now);
    sub.frequency.exponentialRampToValueAtTime(38, now + 0.16);
    subGain.gain.setValueAtTime(0.24, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.18);

    // 2. Elastic snap transient
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = isSweetSpot ? 'sawtooth' : 'sine';
    snap.frequency.setValueAtTime(isSweetSpot ? 880 : 520, now);
    snap.frequency.exponentialRampToValueAtTime(190, now + 0.08);
    snapGain.gain.setValueAtTime(isSweetSpot ? 0.14 : 0.09, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.09);
  }

  /** Harmonic combo chime on enemy kill or high-speed ricochet */
  public playComboHit(streak: number, isKill: boolean): number {
    const freq = computeHarmonicComboFreq(streak, isKill ? 261.63 : 329.63);
    this.lastPlayedComboFreq = freq;

    const ctx = this.ensureContext();
    if (!ctx) return freq;
    const now = ctx.currentTime;

    // Main harmonic bell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isKill ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * (isKill ? 1.015 : 0.98), now + 0.19);

    gain.gain.setValueAtTime(isKill ? 0.18 : 0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);

    // Octave shimmer on kills
    if (isKill) {
      const over = ctx.createOscillator();
      const overGain = ctx.createGain();
      over.type = 'sine';
      over.frequency.setValueAtTime(freq * 1.5, now); // Perfect fifth harmonic
      overGain.gain.setValueAtTime(0.08, now);
      overGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      over.connect(overGain);
      overGain.connect(ctx.destination);
      over.start(now);
      over.stop(now + 0.15);
    }

    return freq;
  }

  /** Euphoric chord cascade when unbanked combo pot is banked into permanent Score */
  public playBankCashout(multiplier: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    if (multiplier >= 5) notes.push(1318.51, 1567.98); // E6, G6

    notes.forEach((n, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.042;
      osc.frequency.setValueAtTime(n, t);
      gain.gain.setValueAtTime(0.13, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.27);
    });
  }

  /** Heavy crunch when player takes damage and loses unbanked pot */
  public playDamageShatter(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.linearRampToValueAtTime(42, now + 0.28);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  /** Upgrade card pick fanfare */
  public playUpgradeSelect(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.035;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }
}
