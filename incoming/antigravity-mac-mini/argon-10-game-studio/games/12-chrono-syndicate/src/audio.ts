/**
 * Procedural Web Audio synthesizer for Chrono-Syndicate: The 15-Second Heist.
 */
export class ChronoAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          this.ctx = null;
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

  private playTone(
    freqStart: number,
    freqEnd: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainPeak: number = 0.08
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + durationSec);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationSec + 0.02);
    } catch {
      // Ignore audio errors in headless environments
    }
  }

  public playEmp(): void {
    this.playTone(620, 75, 0.28, 'sawtooth', 0.1);
  }

  public playDecoy(): void {
    this.playTone(340, 680, 0.16, 'triangle', 0.08);
  }

  public playBlink(): void {
    this.playTone(480, 960, 0.12, 'sine', 0.09);
  }

  public playGateOpen(): void {
    this.playTone(440, 660, 0.14, 'triangle', 0.07);
  }

  public playHackComplete(): void {
    this.playTone(523.25, 1046.5, 0.22, 'triangle', 0.1);
  }

  public playCoreGrabbed(): void {
    this.playTone(587.33, 1174.66, 0.3, 'sine', 0.12);
  }

  public playRewind(): void {
    this.playTone(880, 220, 0.26, 'sawtooth', 0.09);
  }

  public playAlert(): void {
    this.playTone(290, 210, 0.14, 'square', 0.06);
  }

  public playStageClear(): void {
    this.playTone(440, 880, 0.35, 'triangle', 0.12);
  }

  public destroy(): void {
    if (this.ctx) {
      try {
        void this.ctx.close();
      } catch {
        // Ignore
      }
      this.ctx = null;
    }
  }
}
