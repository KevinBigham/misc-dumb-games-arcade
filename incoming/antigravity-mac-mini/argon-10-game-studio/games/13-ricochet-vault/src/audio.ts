// Ascending Lydian / Pentatonic Harmonic Scale (C4 -> G6)
// Like Peggle / Mario coins, consecutive hits climb smoothly in pitch and shimmer.
export const HARMONIC_COMBO_FREQUENCIES: readonly number[] = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  369.99, // F#4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  739.99, // F#5
  783.99, // G5
  880.00, // A5
  987.77, // B5
  1046.50, // C6
  1174.66, // D6
  1318.51, // E6
  1479.98, // F#6
  1567.98, // G6
];

export class VaultAudioEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  public lastPlayedNoteHz = 0;
  public totalNotesPlayed = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
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

  public getComboFrequency(chainCount: number): number {
    const idx = Math.max(0, Math.min(HARMONIC_COMBO_FREQUENCIES.length - 1, chainCount - 1));
    const microOctaveBoost =
      chainCount > HARMONIC_COMBO_FREQUENCIES.length
        ? Math.min(1.5, 1 + (chainCount - HARMONIC_COMBO_FREQUENCIES.length) * 0.03)
        : 1;
    return HARMONIC_COMBO_FREQUENCIES[idx] * microOctaveBoost;
  }

  public playWindupTick(tension01: number): void {
    const freq = 220 + Math.max(0, Math.min(1, tension01)) * 520;
    this.lastPlayedNoteHz = freq;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, now + 0.035);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.042);
  }

  public playLaunch(power01: number): void {
    const p = Math.max(0.2, Math.min(1, power01));
    const baseFreq = 150 + p * 190;
    this.lastPlayedNoteHz = baseFreq;
    this.totalNotesPlayed += 1;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Elastic snap + upward whip
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq * 0.65, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.4, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.16);

    gain.gain.setValueAtTime(0.14 * p, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playComboHit(chainCount: number, isJackpot = false, heatRatio = 0): number {
    const freq = this.getComboFrequency(chainCount);
    this.lastPlayedNoteHz = freq;
    this.totalNotesPlayed += 1;

    const ctx = this.ensureContext();
    if (!ctx) return freq;

    const now = ctx.currentTime;

    // 1. Primary Crystalline Bell Voice
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = isJackpot ? 'triangle' : 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.frequency.exponentialRampToValueAtTime(freq * 1.008, now + 0.04);

    const peakGain = isJackpot ? 0.22 : 0.16;
    const duration = isJackpot ? 0.34 : 0.22;
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(peakGain, now + 0.005);
    gain1.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + duration + 0.01);

    // 2. Harmonic Shimmer (Perfect Fifth / Octave overtone on combos or Jackpots)
    if (chainCount >= 3 || isJackpot) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      const overtoneRatio = isJackpot ? 2.0 : 1.4983; // Octave or Perfect 5th
      osc2.frequency.setValueAtTime(freq * overtoneRatio, now);

      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.0008, now + duration * 0.85);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + duration);
    }

    // 3. Heavy Sub-Bass Impact Thump on Jackpot or High Greed Heat
    if (isJackpot || heatRatio > 0.65) {
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(115, now);
      sub.frequency.exponentialRampToValueAtTime(38, now + 0.14);

      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now);
      sub.stop(now + 0.16);
    }

    return freq;
  }

  public playWallBounce(speed01: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const f = 110 + Math.min(1, speed01) * 90;
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.075);

    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playBankCashIn(potAmount: number, mult: number): void {
    const chord = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5 Major 9th fanfare
    this.lastPlayedNoteHz = chord[chord.length - 1];
    this.totalNotesPlayed += chord.length;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notesToPlay = mult >= 6 ? 5 : mult >= 3 ? 4 : 3;

    for (let i = 0; i < notesToPlay; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const noteTime = now + i * 0.042;
      const freq = chord[i] * (potAmount >= 2000 ? 1.12246 : 1); // Step up to D major 9th on huge pots
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.16, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, noteTime + 0.36);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    }
  }

  public playBust(): void {
    this.lastPlayedNoteHz = 65.41; // Low C2
    this.totalNotesPlayed += 1;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [185, 130.81, 87.31, 55.0];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      const t = now + idx * 0.035;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.24);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.27);
    });
  }

  public playUpgradePick(): void {
    this.playBankCashIn(2500, 8);
  }
}
