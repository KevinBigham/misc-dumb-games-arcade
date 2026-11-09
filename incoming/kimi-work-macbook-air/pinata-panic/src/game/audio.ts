import { storage } from "./storage";

export type SfxId =
  | "throw" | "pickup" | "bank" | "dash" | "hit" | "open" | "wave"
  | "warning" | "win" | "lose" | "ui" | "slam" | "shield" | "rush";

/** Procedural party noise. No samples, no network, no dignified silence. */
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private nextBeat = 0;
  private beat = 0;
  private musicPlaying = false;
  private intensity = 0;
  private variation = 0;
  private disposed = false;
  muted = storage.get("pinata.muted", false);

  private readonly unlock = () => {
    this.ensureCtx();
    this.detachUnlock();
  };

  constructor() {
    window.addEventListener("pointerdown", this.unlock);
    window.addEventListener("keydown", this.unlock);
  }

  private detachUnlock(): void {
    window.removeEventListener("pointerdown", this.unlock);
    window.removeEventListener("keydown", this.unlock);
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.42;
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -16;
      this.compressor.knee.value = 16;
      this.compressor.ratio.value = 5;
      this.master.connect(this.compressor).connect(this.ctx.destination);
      const length = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      let seed = 918273;
      for (let i = 0; i < length; i++) {
        seed = (seed * 16807) % 2147483647;
        data[i] = (seed / 1073741823.5 - 1) * 0.7;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    storage.set("pinata.muted", this.muted);
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.42, this.ctx.currentTime, 0.02);
    }
    return this.muted;
  }

  private tone(type: OscillatorType, f0: number, f1: number, duration: number, gain: number, delay = 0): void {
    if (!this.ctx || !this.master || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, f0), t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + duration);
    env.gain.setValueAtTime(0.001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.012, duration * 0.2));
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private noise(duration: number, gain: number, frequency: number, delay = 0): void {
    if (!this.ctx || !this.master || !this.noiseBuffer || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.8;
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter).connect(env).connect(this.master);
    source.start(t);
    source.stop(t + duration + 0.01);
  }

  sfx(id: SfxId, step = 0): void {
    if (this.disposed || this.muted) return;
    this.ensureCtx();
    this.variation = (this.variation + 1) % 7;
    const v = 1 + (this.variation - 3) * 0.012;
    switch (id) {
      case "throw":
        this.tone("triangle", 520 * v, 160, 0.16, 0.13);
        this.noise(0.09, 0.05, 1600);
        break;
      case "pickup":
        this.tone("sine", (720 + step * 35) * v, 1180 + step * 40, 0.09, 0.09);
        break;
      case "bank":
        this.tone("square", (380 + step * 24) * v, (570 + step * 28) * v, 0.075, 0.055);
        break;
      case "dash":
        this.noise(0.17, 0.12, 780);
        this.tone("sawtooth", 190, 70, 0.17, 0.1);
        break;
      case "hit":
        this.tone("square", 170, 42, 0.28, 0.2);
        this.noise(0.14, 0.18, 430);
        break;
      case "open":
        this.tone("triangle", 240, 700, 0.2, 0.12);
        this.tone("sine", 660, 990, 0.16, 0.1, 0.07);
        break;
      case "wave":
        [0, 4, 7].forEach((n, i) => this.tone("square", 330 * 2 ** (n / 12), 330 * 2 ** (n / 12), 0.13, 0.07, i * 0.09));
        break;
      case "warning":
        this.tone("square", 180, 150, 0.16, 0.09);
        this.tone("square", 180, 150, 0.16, 0.09, 0.23);
        break;
      case "win":
        [0, 4, 7, 12, 16].forEach((n, i) => this.tone("triangle", 440 * 2 ** (n / 12), 440 * 2 ** (n / 12), 0.35, 0.09, i * 0.11));
        break;
      case "lose":
        this.tone("sawtooth", 280, 38, 0.8, 0.16);
        this.tone("square", 130, 45, 0.65, 0.07, 0.12);
        break;
      case "ui":
        this.tone("sine", 620, 820, 0.06, 0.08);
        break;
      case "slam":
        this.tone("sine", 100, 28, 0.38, 0.25);
        this.noise(0.25, 0.2, 220);
        break;
      case "shield":
        this.tone("sine", 820, 1450, 0.28, 0.13);
        this.tone("triangle", 410, 730, 0.25, 0.08);
        break;
      case "rush":
        this.tone("square", 310, 940, 0.22, 0.08);
        break;
    }
  }

  startMusic(): void {
    if (this.disposed) return;
    this.ensureCtx();
    this.musicPlaying = true;
    this.nextBeat = this.ctx!.currentTime + 0.05;
    this.beat = 0;
  }

  stopMusic(): void {
    this.musicPlaying = false;
  }

  setIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value));
  }

  update(): void {
    if (!this.musicPlaying || this.muted || !this.ctx || !this.master) return;
    const tempo = 112 + this.intensity * 34;
    const step = 60 / tempo / 2;
    while (this.nextBeat < this.ctx.currentTime + 0.12) {
      const delay = Math.max(0, this.nextBeat - this.ctx.currentTime);
      const bass = [55, 55, 65.41, 55, 73.42, 65.41, 49, 55];
      const index = this.beat % 16;
      if (index % 2 === 0) {
        this.tone("triangle", bass[(index / 2) % 8], bass[(index / 2) % 8], step * 1.6, 0.035, delay);
      }
      if (index === 0 || index === 8 || (this.intensity > 0.45 && index % 4 === 0)) {
        this.noise(0.045, 0.025 + this.intensity * 0.015, 3200, delay);
      }
      if (this.intensity > 0.25 && index % 2 === 1) {
        const melody = [440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88];
        const f = melody[((index - 1) / 2) % 8];
        this.tone("square", f, f * 0.995, step * 0.72, 0.012 + this.intensity * 0.01, delay);
      }
      this.nextBeat += step;
      this.beat++;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.detachUnlock();
    this.musicPlaying = false;
    this.master?.disconnect();
    this.compressor?.disconnect();
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx && ctx.state !== "closed") void ctx.close();
  }
}
