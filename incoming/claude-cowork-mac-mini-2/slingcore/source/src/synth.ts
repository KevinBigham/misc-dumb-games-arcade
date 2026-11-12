// Procedural WebAudio Synthesizer for SLINGCORE
// Pitches up harmonically with the player's combo streak (Rule 6)

const HARMONIC_SEMITONES = [
  0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36,
];
const BASE_FREQ = 261.63; // C4

export function getStreakFrequency(streak: number): number {
  const idx = Math.max(0, Math.min(HARMONIC_SEMITONES.length - 1, streak - 1));
  const semitones = HARMONIC_SEMITONES[idx];
  const octaveBoost = streak > HARMONIC_SEMITONES.length ? Math.min(12, streak - HARMONIC_SEMITONES.length) : 0;
  return BASE_FREQ * Math.pow(2, (semitones + octaveBoost) / 12);
}

export class SlingSynth {
  private ctx: AudioContext | null = null;
  private chargeOsc: OscillatorNode | null = null;
  private chargeGain: GainNode | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
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

  public updateChargeTone(isCharging: boolean, chargeRatio: number, overchargeRatio: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!isCharging) {
      if (this.chargeGain && this.chargeOsc) {
        try {
          const now = ctx.currentTime;
          this.chargeGain.gain.cancelScheduledValues(now);
          this.chargeGain.gain.setTargetAtTime(0.0001, now, 0.025);
          const osc = this.chargeOsc;
          setTimeout(() => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {
              // ignore already stopped
            }
          }, 90);
        } catch {
          // ignore
        }
        this.chargeOsc = null;
        this.chargeGain = null;
      }
      return;
    }

    const now = ctx.currentTime;
    if (!this.chargeOsc || !this.chargeGain) {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        gain.gain.setValueAtTime(0.001, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        this.chargeOsc = osc;
        this.chargeGain = gain;
      } catch {
        return;
      }
    }

    // Pitch climbs smoothly with tension, and shimmers during Overcharge push-your-luck
    const jitter = overchargeRatio > 0 ? Math.sin(now * 55) * 18 * overchargeRatio : 0;
    const targetFreq = 115 + chargeRatio * 195 + overchargeRatio * 180 + jitter;
    const targetGain = Math.min(0.11, 0.025 + chargeRatio * 0.055 + overchargeRatio * 0.03);
    this.chargeOsc.frequency.setTargetAtTime(targetFreq, now, 0.02);
    this.chargeGain.gain.setTargetAtTime(targetGain, now, 0.03);
  }

  public playLaunch(powerRatio: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Punchy sub-bass kick + snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = 150 + powerRatio * 90;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.13);

    gain.gain.setValueAtTime(0.22 * Math.max(0.4, Math.min(1.2, powerRatio)), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // High kinetic snap transient
    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(520 + powerRatio * 340, now);
    snap.frequency.exponentialRampToValueAtTime(140, now + 0.055);
    snapGain.gain.setValueAtTime(0.12, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    snap.connect(snapGain);
    snapGain.connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.065);
  }

  public playStreakHit(streak: number, force = 1): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = getStreakFrequency(streak);
    const vol = Math.min(0.22, 0.11 + Math.min(1, force) * 0.08);

    // Lead harmonic synth pluck
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);
    osc1.frequency.exponentialRampToValueAtTime(freq * 1.008, now + 0.18);

    gain1.gain.setValueAtTime(vol, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Upper harmonic octave shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);
    gain2.gain.setValueAtTime(vol * 0.45, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.17);
  }

  public playBounce(streak: number, speedRatio = 1): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freq = getStreakFrequency(Math.max(1, streak)) * 0.75;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.25, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.08);

    const amp = Math.min(0.16, 0.05 + speedRatio * 0.09);
    gain.gain.setValueAtTime(amp, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playBankCombo(streak: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const root = getStreakFrequency(Math.max(2, streak));
    const ratios = [1, 1.25, 1.5];

    ratios.forEach((r, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const start = now + idx * 0.035;
      osc.frequency.setValueAtTime(root * r, start);
      gain.gain.setValueAtTime(0.09, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.23);
    });
  }

  public playDamageOrOverheat(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.linearRampToValueAtTime(48, now + 0.26);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  public playUpgradePick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  public destroy(): void {
    this.updateChargeTone(false, 0, 0);
    if (this.ctx) {
      try {
        void this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}
