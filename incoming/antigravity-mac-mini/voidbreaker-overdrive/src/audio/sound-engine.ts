import { clamp } from '../engine/math';

export type WeaponSoundType = 'pulse' | 'vulcan' | 'railgun' | 'katana' | 'mortar' | 'chrono';

/**
 * 100% Procedural WebAudio Dark-Synthwave Sequencer & Combat SFX Studio.
 * Zero external MP3/WAV dependencies; dynamically layers bass, arps, and drums
 * based on combat combo intensity and boss phases.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  enabled = true;
  musicEnabled = true;
  masterVolume = 0.65;
  musicVolume = 0.42;
  sfxVolume = 0.8;

  private stepIndex = 0;
  private stepTimer = 0;
  private intensity = 0.25; // 0.0 (calm) -> 1.0 (boss/SS rank)
  private witchTimeActive = false;

  // D Minor dark synthwave scale frequencies (D2, F2, G2, A2, Bb2, C3, D3)
  private readonly bassPattern = [
    73.42, 73.42, 146.83, 73.42,
    87.31, 87.31, 98.0, 110.0,
    116.54, 116.54, 110.0, 98.0,
    87.31, 73.42, 65.41, 73.42,
  ];

  private readonly arpPattern = [
    293.66, 349.23, 440.0, 587.33,
    440.0, 349.23, 523.25, 440.0,
    466.16, 392.0, 349.23, 293.66,
    349.23, 440.0, 587.33, 659.25,
  ];

  unlock(): void {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 12;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.15;
      compressor.connect(this.ctx.destination);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.enabled ? this.masterVolume : 0;
      this.masterGain.connect(compressor);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      // Pre-compute 1.2s white/pink noise buffer for crisp explosions & snares
      const len = Math.floor(this.ctx.sampleRate * 1.2);
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  setVolumes(master: number, music: number, sfx: number): void {
    this.masterVolume = clamp(master, 0, 1);
    this.musicVolume = clamp(music, 0, 1);
    this.sfxVolume = clamp(sfx, 0, 1);
    if (this.masterGain) this.masterGain.gain.value = this.enabled ? this.masterVolume : 0;
    if (this.musicGain) this.musicGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  toggleMute(): boolean {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.masterVolume : 0;
    }
    return this.enabled;
  }

  updateMusic(rawDt: number, combatIntensity: number, isWitchTime: boolean): void {
    if (!this.ctx || !this.enabled || !this.musicEnabled || this.ctx.state !== 'running') return;

    this.intensity = clamp(combatIntensity, 0.15, 1);
    this.witchTimeActive = isWitchTime;

    // 134 BPM 16th-note step duration (~0.112s), slowed slightly during Witch-Time
    const stepDuration = isWitchTime ? 0.175 : 0.112;
    this.stepTimer += rawDt;

    if (this.stepTimer >= stepDuration) {
      this.stepTimer %= stepDuration;
      this.triggerSequencerStep(this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 16;
    }
  }

  private triggerSequencerStep(step: number): void {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    // 1. Punchy Four-on-the-Floor Cyber Kick (steps 0, 4, 8, 12 + syncopated 14 at high intensity)
    if (step % 4 === 0 || (step === 14 && this.intensity > 0.65)) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(135, now);
      osc.frequency.exponentialRampToValueAtTime(34, now + 0.11);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.17);
    }

    // 2. Industrial Gated Snare on steps 4 and 12
    if ((step === 4 || step === 12) && this.noiseBuffer && this.intensity > 0.25) {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = this.witchTimeActive ? 800 : 1650;
      filter.Q.value = 1.2;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.22 * this.intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      noise.start(now);
      noise.stop(now + 0.14);
    }

    // 3. Rolling Sawtooth/Sub Bassline on every 16th note
    const bassFreq = this.bassPattern[step] * (this.witchTimeActive ? 0.5 : 1);
    const bassOsc = this.ctx.createOscillator();
    const bassFilter = this.ctx.createBiquadFilter();
    const bassGain = this.ctx.createGain();

    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(bassFreq, now);

    bassFilter.type = 'lowpass';
    const cutoff = (this.witchTimeActive ? 260 : 420) + this.intensity * 950;
    bassFilter.frequency.setValueAtTime(cutoff, now);
    bassFilter.frequency.exponentialRampToValueAtTime(140, now + 0.095);
    bassFilter.Q.value = 4.5;

    bassGain.gain.setValueAtTime(0.24, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.105);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);
    bassOsc.start(now);
    bassOsc.stop(now + 0.11);

    // 4. High-Intensity Cyber Arpeggio Lead
    if (this.intensity > 0.45 && (step % 2 === 0 || this.intensity > 0.75)) {
      const arpFreq = this.arpPattern[step];
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(arpFreq, now);

      const vol = (this.intensity - 0.35) * 0.16;
      leadGain.gain.setValueAtTime(vol, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.095);
    }
  }

  playShot(type: WeaponSoundType): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === 'pulse') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(680 + Math.random() * 90, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.075);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.085);
    } else if (type === 'vulcan') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(290 + Math.random() * 60, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.055);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.065);
    } else if (type === 'railgun') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1450, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.24);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.26);
    } else if (type === 'katana') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'mortar') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.28);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.29);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.21);
    }
  }

  playParry(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const now = this.ctx.currentTime;

    // Metallic harmonic clang
    const freqs = [1180, 1770, 2640];
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.15, now + 0.22);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  }

  playWitchTime(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.48);
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  playExplosion(size = 1): void {
    if (!this.ctx || !this.sfxGain || !this.noiseBuffer || !this.enabled) return;
    const now = this.ctx.currentTime;
    const dur = clamp(0.18 + size * 0.18, 0.15, 0.7);

    // Filtered noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.exponentialRampToValueAtTime(90, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(clamp(0.22 * size, 0.1, 0.48), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + dur + 0.02);

    // Sub-bass impact
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + dur);
    subGain.gain.setValueAtTime(clamp(0.32 * size, 0.12, 0.55), now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + dur + 0.02);
  }

  playLevelUp(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const now = this.ctx.currentTime;
    const notes = [293.66, 369.99, 440.0, 587.33, 880.0];
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  playBossWarning(): void {
    if (!this.ctx || !this.sfxGain || !this.enabled) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const t = now + i * 0.35;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(195, t);
      osc.frequency.linearRampToValueAtTime(390, t + 0.18);
      osc.frequency.linearRampToValueAtTime(160, t + 0.32);
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.33);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.34);
    }
  }
}
