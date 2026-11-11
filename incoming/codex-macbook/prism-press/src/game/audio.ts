import { storage } from "./storage.js";

export type SfxId =
  | "ui" | "select" | "rotate" | "place" | "invalid" | "clear"
  | "combo" | "pulse" | "hold" | "sector" | "win" | "lose" | "warning";

/** Runtime-synthesized sound and a small generative score; no external audio assets. */
export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private timer = 0;
  private step = 0;
  private intensity = 0;
  private playing = false;
  private disposed = false;
  muted = storage.get<boolean>("prism.muted", false) === true;

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
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.18;
      this.musicBus.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    storage.set("prism.muted", this.muted);
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.42, this.ctx.currentTime, 0.025);
    }
    return this.muted;
  }

  startMusic(): void {
    this.playing = true;
    this.ensureCtx();
  }

  setPlaying(playing: boolean): void { this.playing = playing; }
  setIntensity(value: number): void { this.intensity = Math.max(0, Math.min(1, value)); }

  update(dt: number): void {
    if (!this.playing || this.muted || !this.ctx || !this.musicBus || this.ctx.state !== "running") return;
    this.timer -= dt;
    if (this.timer > 0) return;
    const interval = 0.34 - this.intensity * 0.1;
    this.timer += interval;
    const scale = [0, 3, 5, 7, 10, 12, 15, 17];
    const root = 110;
    const note = scale[(this.step * 3 + (this.step >> 2)) % scale.length];
    if (this.step % 2 === 0 || this.intensity > 0.55) {
      this.tone(root * Math.pow(2, note / 12), 0.12, 0.035 + this.intensity * 0.02, "triangle", this.musicBus);
    }
    if (this.step % 8 === 0) this.tone(root / 2, interval * 7.5, 0.055, "sine", this.musicBus);
    if (this.step % 4 === 2 && this.intensity > 0.25) this.noise(0.035, 0.016 + this.intensity * 0.012, 4200);
    this.step = (this.step + 1) % 64;
  }

  private tone(freq: number, dur: number, gain: number, type: OscillatorType, destination?: AudioNode, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env).connect(destination ?? this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private sweep(f0: number, f1: number, dur: number, gain: number, type: OscillatorType, delay = 0): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, gain: number, cutoff: number): void {
    if (!this.ctx || !this.master) return;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 0x1234abcd + this.step * 997;
    for (let i = 0; i < length; i += 1) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = (seed / 0xffffffff) * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();
    filter.type = "highpass";
    filter.frequency.value = cutoff;
    env.gain.setValueAtTime(gain, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    source.buffer = buffer;
    source.connect(filter).connect(env).connect(this.master);
    source.start();
  }

  sfx(id: SfxId, amount = 1): void {
    if (this.disposed || this.muted) return;
    this.ensureCtx();
    switch (id) {
      case "ui": this.sweep(420, 610, 0.055, 0.09, "sine"); break;
      case "select": this.sweep(280, 420, 0.07, 0.1, "triangle"); break;
      case "rotate": this.sweep(380, 690, 0.09, 0.11, "triangle"); break;
      case "place": this.sweep(150, 75, 0.11, 0.2, "sine"); this.tone(520, 0.08, 0.07, "triangle"); break;
      case "invalid": this.sweep(130, 92, 0.13, 0.12, "square"); break;
      case "hold": this.sweep(360, 240, 0.14, 0.11, "sine"); break;
      case "clear":
      case "combo": {
        const base = id === "combo" ? 520 : 420;
        this.noise(0.18, 0.055, 1700);
        this.tone(base, 0.22, 0.13, "sine");
        this.tone(base * 1.25, 0.25, 0.11, "triangle", undefined, 0.055);
        this.tone(base * (1.5 + Math.min(amount, 4) * 0.08), 0.3, 0.1, "sine", undefined, 0.11);
        break;
      }
      case "pulse": this.sweep(90, 880, 0.32, 0.18, "sawtooth"); this.noise(0.35, 0.1, 900); this.tone(1040, 0.45, 0.1, "sine", undefined, 0.1); break;
      case "sector": [0, 4, 7, 12].forEach((n, i) => this.tone(330 * Math.pow(2, n / 12), 0.35, 0.1, "triangle", undefined, i * 0.09)); break;
      case "win": [0, 4, 7, 12, 16, 19].forEach((n, i) => this.tone(262 * Math.pow(2, n / 12), 0.6, 0.12, "sine", undefined, i * 0.11)); break;
      case "lose": this.sweep(220, 42, 0.85, 0.18, "sawtooth"); this.tone(55, 0.9, 0.13, "sine"); break;
      case "warning": this.sweep(180, 150, 0.18, 0.1, "square"); break;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.detachUnlock();
    this.playing = false;
    this.master?.disconnect();
    this.musicBus?.disconnect();
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    if (ctx && ctx.state !== "closed") void ctx.close();
  }
}
