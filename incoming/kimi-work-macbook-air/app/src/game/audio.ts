export type SfxId =
  | "shoot" | "hit" | "pickup" | "ui" | "explosion" | "win" | "lose"
  | "dash" | "hurt" | "scream" | "upgrade" | "boss" | "buy" | "secret";

const MUTE_KEY = "soupermarket.muted";

function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; }
}

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private disposed = false;
  private playingMusic = false;
  private nextBeat = 0;
  private step = 0;
  muted = readMuted();

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

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.detachUnlock();
    this.playingMusic = false;
    this.master?.disconnect();
    this.musicBus?.disconnect();
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx && ctx.state !== "closed") void ctx.close();
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.42;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.21;
      this.musicBus.connect(this.master);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    try { localStorage.setItem(MUTE_KEY, this.muted ? "1" : "0"); } catch { /* storage is optional */ }
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.42;
    return this.muted;
  }

  private tone(type: OscillatorType, f0: number, f1: number, duration: number, gain: number, when = 0, bus?: GainNode): void {
    if (this.disposed || this.muted) return;
    const ctx = this.ensureCtx();
    if (!this.master) return;
    const t = when || ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, f0), t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + duration);
    env.gain.setValueAtTime(0.001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.012, duration * 0.15));
    env.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(env).connect(bus ?? this.master);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private noise(duration: number, gain: number): void {
    if (this.disposed || this.muted) return;
    const ctx = this.ensureCtx();
    if (!this.master) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.sin(i * 12.9898) * Math.cos(i * 0.173) * (1 - i / length);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    env.gain.setValueAtTime(gain, ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.buffer = buffer;
    source.connect(filter).connect(env).connect(this.master);
    source.start();
  }

  sfx(id: SfxId): void {
    if (this.disposed || this.muted) return;
    switch (id) {
      case "shoot": this.tone("square", 260, 115, 0.075, 0.085); break;
      case "hit": this.tone("triangle", 170, 70, 0.08, 0.13); break;
      case "pickup": this.tone("sine", 680, 1120, 0.09, 0.12); break;
      case "ui": this.tone("square", 380, 520, 0.045, 0.08); break;
      case "explosion": this.noise(0.28, 0.32); this.tone("sawtooth", 110, 28, 0.32, 0.2); break;
      case "win":
        [523, 659, 784, 1046].forEach((note, i) => this.tone("square", note, note, 0.2, 0.11, this.ensureCtx().currentTime + i * 0.12));
        break;
      case "lose": this.tone("sawtooth", 220, 42, 0.8, 0.18); break;
      case "dash": this.noise(0.11, 0.12); this.tone("sine", 180, 620, 0.13, 0.13); break;
      case "hurt": this.tone("square", 140, 55, 0.22, 0.18); break;
      case "scream": this.noise(0.48, 0.22); this.tone("sawtooth", 90, 740, 0.45, 0.2); break;
      case "upgrade": this.tone("sine", 420, 840, 0.22, 0.14); this.tone("square", 630, 1260, 0.28, 0.06); break;
      case "boss": this.tone("sawtooth", 72, 38, 0.75, 0.25); break;
      case "buy": this.tone("square", 330, 660, 0.12, 0.13); this.tone("sine", 660, 990, 0.2, 0.1); break;
      case "secret": [440, 554, 659, 880].forEach((n, i) => this.tone("triangle", n, n * 1.02, 0.18, 0.12, this.ensureCtx().currentTime + i * 0.08)); break;
    }
  }

  startMusic(): void {
    if (this.disposed) return;
    const ctx = this.ensureCtx();
    this.playingMusic = true;
    this.nextBeat = ctx.currentTime + 0.05;
  }

  updateMusic(intensity: number): void {
    if (!this.playingMusic || this.disposed || this.muted || !this.ctx || !this.musicBus) return;
    const bass = [55, 55, 65.41, 55, 82.41, 73.42, 65.41, 49];
    const melody = [220, 261.63, 329.63, 293.66, 246.94, 329.63, 392, 293.66];
    while (this.nextBeat < this.ctx.currentTime + 0.12) {
      const step = this.step % 16;
      const beat = this.nextBeat;
      if (step % 2 === 0) this.tone("triangle", bass[(step / 2) % 8], bass[(step / 2) % 8] * 0.98, 0.21, 0.12, beat, this.musicBus);
      if (intensity > 0.15 && step % 2 === 1) {
        const note = melody[(step >> 1) % 8] * (intensity > 0.8 ? 2 : 1);
        this.tone("square", note, note, 0.075, 0.025 + intensity * 0.025, beat, this.musicBus);
      }
      if (step % 4 === 0) this.tone("sine", 105, 38, 0.12, 0.17, beat, this.musicBus);
      if (intensity > 0.45 && step % 4 === 2) this.tone("square", 900, 200, 0.025, 0.025, beat, this.musicBus);
      this.nextBeat += 60 / (112 + intensity * 24) / 2;
      this.step++;
    }
  }
}
