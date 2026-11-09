import { AstralSimEvent } from './simulation';

// Lydian Star-Scale frequencies (C4, D4, E4, F#4, G4, A4, B4, C5, D5, E5, F#5, G5, A5, B5, C6)
const LYDIAN_FREQUENCIES = [
  261.63, 293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25,
  739.99, 783.99, 880.0, 987.77, 1046.5,
];

export class AstralAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
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

  private playTone(
    freq: number,
    durationSec: number,
    type: OscillatorType = 'sine',
    gainPeak: number = 0.08,
    slideToFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(40, slideToFreq),
          now + durationSec
        );
      }
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + durationSec + 0.02);
    } catch {
      // Ignore WebAudio errors in headless environments
    }
  }

  public playEvents(events: readonly AstralSimEvent[]): void {
    if (this.muted || events.length === 0) return;
    for (const ev of events.slice(0, 5)) {
      switch (ev.type) {
        case 'COMET_LAUNCHED':
          this.playTone(220, 0.18, 'triangle', 0.09, 587.33);
          break;
        case 'SOCKET_HIT': {
          const idx = Math.min(
            LYDIAN_FREQUENCIES.length - 1,
            Math.max(0, (ev.comboCount ?? 1) - 1)
          );
          const f = LYDIAN_FREQUENCIES[idx];
          this.playTone(f, 0.14, 'triangle', 0.075);
          break;
        }
        case 'PRISM_SPLIT':
          this.playTone(523.25, 0.2, 'sine', 0.08, 1046.5);
          this.playTone(659.25, 0.22, 'triangle', 0.07, 1318.5);
          break;
        case 'LIGHTNING_ARC':
          this.playTone(740, 0.09, 'sawtooth', 0.045, 370);
          break;
        case 'PERFECT_PARRY':
          this.playTone(440, 0.22, 'triangle', 0.1, 880);
          this.playTone(659.25, 0.25, 'sine', 0.08, 1318.5);
          break;
        case 'FLIPPER_BOUNCE':
          this.playTone(196, 0.1, 'triangle', 0.07, 392);
          break;
        case 'SONIC_NOVA':
          this.playTone(261.63, 0.45, 'sine', 0.1);
          this.playTone(392.0, 0.45, 'triangle', 0.08);
          this.playTone(659.25, 0.45, 'sine', 0.08);
          break;
        case 'BOSS_HIT':
          this.playTone(146.83, 0.12, 'sawtooth', 0.06, 98.0);
          break;
        case 'SECTOR_VICTORY':
        case 'GAME_VICTORY':
          this.playTone(523.25, 0.45, 'triangle', 0.1);
          this.playTone(659.25, 0.45, 'triangle', 0.09);
          this.playTone(783.99, 0.55, 'sine', 0.1);
          break;
        default:
          break;
      }
    }
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
