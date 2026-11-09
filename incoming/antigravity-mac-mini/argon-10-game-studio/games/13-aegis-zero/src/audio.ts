export interface MusicIntensityState {
  comboMultiplier: number;
  overclockPct: number;
  isBossActive: boolean;
  wave: number;
  isPaused: boolean;
}

export class AegisAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  // 4-Track Procedural Music Sequencer State
  private musicTimerId: ReturnType<typeof setInterval> | null = null;
  private stepIndex: number = 0;
  private nextStepTime: number = 0;
  private currentBpm: number = 122;
  private activeTracks: [boolean, boolean, boolean, boolean] = [true, false, false, false];
  private musicState: MusicIntensityState = {
    comboMultiplier: 1,
    overclockPct: 0,
    isBossActive: false,
    wave: 1,
    isPaused: false,
  };

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
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
    if (!this.noiseBuffer && this.ctx) {
      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
    }
    return this.ctx;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 0.5);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 1337;
    for (let i = 0; i < length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = (seed / 1073741823.5) - 1.0;
    }
    return buffer;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopMusicLoop();
    } else {
      this.startMusicLoop();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getMusicTelemetry(): { bpm: number; activeTracks: [boolean, boolean, boolean, boolean] } {
    return {
      bpm: Math.round(this.currentBpm),
      activeTracks: [...this.activeTracks] as [boolean, boolean, boolean, boolean],
    };
  }

  public updateMusicIntensity(state: MusicIntensityState): void {
    this.musicState = { ...state };
    const comboFactor = Math.min(1, (state.comboMultiplier - 1) / 9);
    const overclockFactor = Math.min(1, state.overclockPct / 100);
    const bossBoost = state.isBossActive ? 10 : 0;

    this.currentBpm = Math.min(
      150,
      120 + comboFactor * 14 + overclockFactor * 8 + bossBoost + (state.wave - 1) * 1.2
    );

    // Track 1: Bass Pulse (always active)
    // Track 2: Arpeggiator (active when combo >= 2 or overclock >= 25%)
    // Track 3: Percussion Engine (active when combo >= 3 or wave >= 2)
    // Track 4: Overdrive / Boss Lead (active when boss active or combo >= 5 or overclock >= 70%)
    this.activeTracks = [
      true,
      state.comboMultiplier >= 2 || state.overclockPct >= 25,
      state.comboMultiplier >= 3 || state.wave >= 2 || state.overclockPct >= 45,
      state.isBossActive || state.comboMultiplier >= 5 || state.overclockPct >= 70,
    ];
  }

  public startMusicLoop(): void {
    if (this.muted || this.musicTimerId !== null) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.nextStepTime = ctx.currentTime + 0.05;
    this.musicTimerId = setInterval(() => {
      this.scheduleMusicSteps();
    }, 45);
  }

  public stopMusicLoop(): void {
    if (this.musicTimerId !== null) {
      clearInterval(this.musicTimerId);
      this.musicTimerId = null;
    }
  }

  private scheduleMusicSteps(): void {
    if (this.muted || this.musicState.isPaused) return;
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;

    const lookahead = 0.12;
    while (this.nextStepTime < ctx.currentTime + lookahead) {
      this.triggerStepAtTime(ctx, this.stepIndex, this.nextStepTime);
      const secondsPerBeat = 60 / Math.max(100, this.currentBpm);
      const sixteenthNote = secondsPerBeat / 4;
      this.nextStepTime += sixteenthNote;
      this.stepIndex = (this.stepIndex + 1) % 16;
    }
  }

  private triggerStepAtTime(ctx: AudioContext, step: number, time: number): void {
    // D minor pentatonic / Dorian arcade scale frequencies
    const bassNotes = [73.42, 73.42, 87.31, 73.42, 65.41, 65.41, 82.41, 98.0];
    const arpNotes = [293.66, 349.23, 440.0, 523.25, 587.33, 440.0, 349.23, 329.63];
    const leadNotes = [587.33, 0, 698.46, 659.25, 587.33, 523.25, 440.0, 659.25];

    // TRACK 1: Sub-Bass Pulse (sawtooth + lowpass)
    if (this.activeTracks[0] && step % 2 === 0) {
      const freq = bassNotes[(step / 2) % bassNotes.length]!;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.activeTracks[3] ? 420 : 280, time);

      gain.gain.setValueAtTime(0.045, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.12);
    }

    // TRACK 2: Resonance Arpeggiator (triangle 16ths)
    if (this.activeTracks[1]) {
      const arpFreq = arpNotes[step % arpNotes.length]!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(arpFreq, time);

      gain.gain.setValueAtTime(0.025, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.095);
    }

    // TRACK 3: Kinetic Percussion Engine (Kick on 0, 4, 8, 12; Hi-Hat on odd steps)
    if (this.activeTracks[2]) {
      if (step % 4 === 0) {
        const kick = ctx.createOscillator();
        const kGain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(135, time);
        kick.frequency.exponentialRampToValueAtTime(36, time + 0.09);
        kGain.gain.setValueAtTime(0.065, time);
        kGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
        kick.connect(kGain);
        kGain.connect(ctx.destination);
        kick.start(time);
        kick.stop(time + 0.105);
      } else if (step % 2 === 1 && this.noiseBuffer) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.setValueAtTime(6500, time);
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(0.018, time);
        hGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        src.connect(hp);
        hp.connect(hGain);
        hGain.connect(ctx.destination);
        src.start(time);
        src.stop(time + 0.045);
      }
    }

    // TRACK 4: Overdrive / Boss Lead Synth
    if (this.activeTracks[3] && step % 2 === 0) {
      const leadFreq = leadNotes[(step / 2) % leadNotes.length]!;
      if (leadFreq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(leadFreq, time);
        osc.frequency.exponentialRampToValueAtTime(leadFreq * 1.008, time + 0.14);

        gain.gain.setValueAtTime(0.022, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.16);
      }
    }
  }

  public playGrazeSpark(overclockPct: number, combo: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const baseFreq = 520 + overclockPct * 6.5 + combo * 35;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.65, now + 0.045);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playRailShot(isCrit: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCrit ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 980 : 720, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.075);

    gain.gain.setValueAtTime(isCrit ? 0.07 : 0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.085);
  }

  public playHeavyStrike(isKill: boolean, isBoss: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub punch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isBoss ? 190 : 145, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + (isBoss ? 0.36 : 0.14));

    gain.gain.setValueAtTime(isBoss ? 0.16 : isKill ? 0.1 : 0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isBoss ? 0.38 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (isBoss ? 0.4 : 0.16));

    // Noise burst for Vlambeer crunch
    if (this.noiseBuffer && (isKill || isBoss)) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isBoss ? 900 : 1400, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(isBoss ? 0.12 : 0.06, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + (isBoss ? 0.28 : 0.11));

      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      src.start(now);
      src.stop(now + (isBoss ? 0.3 : 0.12));
    }
  }

  public playShatterDischarge(bulletsCleared: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    const topFreq = Math.min(1800, 680 + bulletsCleared * 45);
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(topFreq, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(75, now + 0.28);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  public playGemPickup(isSupercritical: boolean, combo: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const base = (isSupercritical ? 660 : 480) + Math.min(12, combo) * 40;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.setValueAtTime(base * 1.25, now + 0.045);

    gain.gain.setValueAtTime(isSupercritical ? 0.075 : 0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playPlayerHit(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.24);

    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.27);
  }

  public playAugmentPick(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public destroy(): void {
    this.stopMusicLoop();
    if (this.ctx) {
      void this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
