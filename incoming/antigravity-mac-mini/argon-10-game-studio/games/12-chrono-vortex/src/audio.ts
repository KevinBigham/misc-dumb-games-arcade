import { ChronoSimulationEvent } from './simulation';

// D Dorian / Cosmic Pentatonic frequencies for escalating Pinball Combo Chimes
const COMBO_SCALE_HZ = [
  293.66, // D4
  329.63, // E4
  349.23, // F4
  440.0,  // A4
  493.88, // B4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  698.46, // F5
  880.0,  // A5
  987.77, // B5
  1174.66 // D6
];

export class ChronoAudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private comboStep = 0;

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

  public playEvent(event: ChronoSimulationEvent, comboCount = 1): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const scaleIdx = Math.min(COMBO_SCALE_HZ.length - 1, Math.max(0, comboCount - 1));
    const comboFreq = COMBO_SCALE_HZ[scaleIdx] ?? 440;

    try {
      switch (event.type) {
        case 'BUMPER_RICOCHET': {
          this.playTone(ctx, comboFreq, 'triangle', 0.16, 0.14, now, comboFreq * 1.25);
          this.playTone(ctx, comboFreq * 1.5, 'sine', 0.22, 0.08, now + 0.03);
          break;
        }
        case 'DASH_SLAM':
        case 'DOMINO_COLLISION':
        case 'WALL_SLAM': {
          this.playTone(ctx, 135, 'sawtooth', 0.14, 0.16, now, 52);
          this.playTone(ctx, comboFreq * 0.75, 'triangle', 0.12, 0.1, now);
          break;
        }
        case 'PARRY_DEFLECT': {
          this.playTone(ctx, 660, 'sine', 0.18, 0.15, now, 1320);
          this.playTone(ctx, 990, 'triangle', 0.24, 0.11, now + 0.04, 1480);
          break;
        }
        case 'ECHO_SPAWNED': {
          this.playTone(ctx, 320, 'sine', 0.28, 0.14, now, 760);
          this.playTone(ctx, 480, 'triangle', 0.3, 0.1, now + 0.06, 960);
          break;
        }
        case 'ENEMY_SHATTERED': {
          this.playTone(ctx, comboFreq, 'sawtooth', 0.2, 0.14, now, comboFreq * 1.5);
          this.playTone(ctx, 95, 'triangle', 0.22, 0.18, now, 42);
          break;
        }
        case 'OVERDRIVE_TRIGGERED':
        case 'SECTOR_CLEARED':
        case 'RELIC_CLAIMED': {
          const chord = [293.66, 440, 587.33, 880];
          chord.forEach((f, idx) => {
            this.playTone(ctx, f, 'triangle', 0.36, 0.11, now + idx * 0.05, f * 1.05);
          });
          break;
        }
        case 'PLAYER_DAMAGED': {
          this.playTone(ctx, 160, 'sawtooth', 0.24, 0.18, now, 65);
          break;
        }
        case 'VICTORY': {
          const fanfare = [293.66, 369.99, 440, 587.33, 880];
          fanfare.forEach((f, idx) => {
            this.playTone(ctx, f, 'triangle', 0.45, 0.13, now + idx * 0.08);
          });
          break;
        }
        case 'GAME_OVER': {
          const fall = [293.66, 261.63, 220, 146.83];
          fall.forEach((f, idx) => {
            this.playTone(ctx, f, 'sawtooth', 0.35, 0.12, now + idx * 0.1);
          });
          break;
        }
      }
    } catch {
      // Ignore audio scheduling errors
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType,
    durationSec: number,
    gainPeak: number,
    startTime: number,
    endFreq?: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + durationSec);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.02);
  }

  public destroy(): void {
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
