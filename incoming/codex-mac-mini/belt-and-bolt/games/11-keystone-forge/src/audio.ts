export class KeystoneAudioController {
  private ctx: AudioContext | null = null;
  private muted = false;

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

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playMove(): void {
    this.playTone(260, 0.035, 'triangle', 0.06);
  }

  public playRotate(): void {
    this.playTone(390, 0.045, 'sine', 0.08, 520);
  }

  public playHold(): void {
    this.playTone(330, 0.06, 'sine', 0.08, 440);
  }

  public playChisel(): void {
    this.playTone(780, 0.11, 'sawtooth', 0.09, 220);
  }

  public playStamp(linesCleared: number, wasFlush: boolean, wasPerfectFinesse: boolean): void {
    if (linesCleared > 0) {
      const baseFreq = 330 + linesCleared * 110;
      this.playTone(baseFreq, 0.16, 'triangle', 0.14, baseFreq * 1.5);
      return;
    }
    if (wasFlush) {
      const freq = wasPerfectFinesse ? 480 : 380;
      this.playTone(freq, 0.08, 'sine', 0.1, freq * 1.25);
    } else {
      // Dull clank on overhang creation
      this.playTone(145, 0.11, 'sawtooth', 0.09, 110);
    }
  }

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType,
    gainVal: number,
    endFreq?: number,
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (endFreq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + durationSec);
      }
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch {
      // Ignore audio errors in headless environments
    }
  }
}
