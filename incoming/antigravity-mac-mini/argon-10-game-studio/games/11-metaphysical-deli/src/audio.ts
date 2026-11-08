/**
 * Procedural Surreal WebAudio Synthesizer for The Metaphysical Deli
 * Generates bone-xylophone crunches, bebop saxophone/brass chords, bubbling cauldron arpeggios,
 * formant alien patron voices, and tape-wobble reality shift chords with zero external assets.
 */
export class DeliAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
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

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
  }

  public playGrabPluck(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(310, now);
    osc.frequency.exponentialRampToValueAtTime(590, now + 0.08);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playSliceCrunch(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Bone-xylophone double transient
    const freqs = [523.25, 783.99, 1174.66];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(f, now + idx * 0.02);
      osc.frequency.exponentialRampToValueAtTime(f * 0.55, now + idx * 0.02 + 0.08);
      gain.gain.setValueAtTime(0.09, now + idx * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.02);
      osc.stop(now + idx * 0.02 + 0.09);
    });
  }

  public playHybridSplice(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Surreal Lydian dominant jazz chord stab (C7#11: C4, E4, Bb4, D5, F#5)
    const chord = [261.63, 329.63, 466.16, 587.33, 739.99];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * 0.96, now + i * 0.018);
      osc.frequency.exponentialRampToValueAtTime(freq, now + i * 0.018 + 0.06);
      gain.gain.setValueAtTime(0.08, now + i * 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.018);
      osc.stop(now + 0.36);
    });
  }

  public playVortexBoil(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Bubbling cauldron arpeggio
    const notes = [196.0, 246.94, 293.66, 392.0, 493.88];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + idx * 0.03 + 0.07);
      gain.gain.setValueAtTime(0.1, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.09);
    });
  }

  public playPatronSatisfied(combo: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const pitchShift = 1 + Math.min(0.5, (combo - 1) * 0.07);
    const fanfare = [329.63, 415.3, 493.88, 659.25, 830.61];
    fanfare.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f * pitchShift, now + i * 0.045);
      gain.gain.setValueAtTime(0.11, now + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.045);
      osc.stop(now + i * 0.045 + 0.23);
    });
  }

  public playDecreeWarp(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(185, now + 0.16);
    osc.frequency.linearRampToValueAtTime(370, now + 0.34);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playAlarmBuzzer(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(155, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public destroy(): void {
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
