import { HorizonSimEvent } from './simulation';

// Lydian Cosmic Scale in Hz (C4, D4, E4, F#4, G4, A4, B4, C5, D5, E5, F#5, G5, A5, B5, C6)
const LYDIAN_FREQUENCIES = [
  261.63, 293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99,
  880.0, 987.77, 1046.5,
];

export class HorizonAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtor) {
        try {
          this.ctx = new AudioCtor();
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

  public playTone(
    freqHz: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainPeak: number = 0.09,
    slideToHz?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freqHz, now);
      if (slideToHz) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideToHz), now + durationSec);
      }

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationSec + 0.02);
    } catch {
      // Ignore WebAudio context limitations in headless environments
    }
  }

  public playEvent(event: HorizonSimEvent): void {
    if (this.muted) return;

    switch (event.type) {
      case 'SLINGSHOT_LAUNCH':
        this.playTone(180, 0.18, 'triangle', 0.08, 520);
        break;

      case 'BUMPER_RICOCHET': {
        const idx = Math.max(0, Math.min(LYDIAN_FREQUENCIES.length - 1, event.noteIndex ?? 0));
        const baseFreq = LYDIAN_FREQUENCIES[idx];
        this.playTone(baseFreq, 0.24, 'sine', 0.1);
        this.playTone(baseFreq * 1.5, 0.16, 'triangle', 0.045);
        break;
      }

      case 'CONSTELLATION_ENCLOSED': {
        // 4-note Lydian cosmic chord
        const chord = [523.25, 659.25, 783.99, 987.77];
        chord.forEach((f, i) => {
          setTimeout(() => this.playTone(f, 0.42, 'triangle', 0.075), i * 45);
        });
        break;
      }

      case 'EVENT_HORIZON_SKIM':
        this.playTone(310, 0.15, 'sine', 0.065, 620);
        break;

      case 'WORMHOLE_TRANSIT':
        this.playTone(110, 0.35, 'sawtooth', 0.09, 880);
        break;

      case 'ROCHE_CRUSH':
        this.playTone(440, 0.28, 'sine', 0.09, 130);
        break;

      case 'SUPERNOVA_PULSE':
        this.playTone(150, 0.42, 'sawtooth', 0.11, 55);
        this.playTone(587.33, 0.28, 'triangle', 0.08, 293.66);
        break;

      case 'CHRONO_REWIND':
        this.playTone(880, 0.32, 'triangle', 0.09, 220);
        break;

      case 'ENEMY_DESTROYED':
        this.playTone(392.0, 0.18, 'square', 0.06, 783.99);
        break;

      case 'SHIP_DAMAGED':
        this.playTone(140, 0.26, 'sawtooth', 0.1, 65);
        break;

      case 'RELIC_DRAFTED':
      case 'SECTOR_CLEARED':
      case 'VICTORY': {
        const fanfare = [523.25, 659.25, 783.99, 1046.5];
        fanfare.forEach((f, i) => {
          setTimeout(() => this.playTone(f, 0.38, 'triangle', 0.085), i * 65);
        });
        break;
      }

      case 'GAME_OVER':
        this.playTone(220, 0.55, 'sawtooth', 0.09, 73.42);
        break;
    }
  }

  public destroy(): void {
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
