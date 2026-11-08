export type SfxId = "shoot" | "pulse" | "hit" | "crit" | "kill" | "hurt" | "decoy" | "wave" | "boss" | "ui" | "win" | "lose" | "upgrade" | "step";
const MUTE_KEY = "hush-pulse.muted";

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private nextBeat = 0;
  private beat = 0;
  private musicOn = false;
  private disposed = false;
  muted = false;
  private readonly unlock = () => { this.ensureCtx(); this.detachUnlock(); };

  constructor() {
    try { this.muted = localStorage.getItem(MUTE_KEY) === "1"; } catch { this.muted = false; }
    window.addEventListener("pointerdown", this.unlock);
    window.addEventListener("keydown", this.unlock);
  }
  private detachUnlock() { window.removeEventListener("pointerdown", this.unlock); window.removeEventListener("keydown", this.unlock); }
  private ensureCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -14; compressor.ratio.value = 5;
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.52;
      this.master.connect(compressor).connect(this.ctx.destination);
      this.music = this.ctx.createGain(); this.music.gain.value = 0.24; this.music.connect(this.master);
      const length = Math.floor(this.ctx.sampleRate * 0.5);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0); let seed = 918273;
      for (let i = 0; i < length; i++) { seed = (seed * 16807) % 2147483647; data[i] = (seed / 2147483647) * 2 - 1; }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }
  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem(MUTE_KEY, this.muted ? "1" : "0"); } catch { /* session-only */ }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.52, this.ctx.currentTime, 0.02);
    if (!this.muted && this.ctx) this.nextBeat = this.ctx.currentTime + 0.05;
    return this.muted;
  }
  private tone(type: OscillatorType, f0: number, f1: number, duration: number, gain: number, delay = 0, destination?: AudioNode) {
    if (this.disposed || this.muted) return;
    const ctx = this.ensureCtx(); if (!this.master) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator(), env = ctx.createGain(), filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.value = Math.max(800, f0 * 5);
    osc.type = type; osc.frequency.setValueAtTime(Math.max(20, f0), t); osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + duration);
    env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.012, duration * 0.2)); env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(filter).connect(env).connect(destination ?? this.master); osc.start(t); osc.stop(t + duration + 0.02);
    osc.onended = () => { osc.disconnect(); filter.disconnect(); env.disconnect(); };
  }
  private noise(duration: number, gain: number, cutoff = 1200) {
    if (this.disposed || this.muted) return;
    const ctx = this.ensureCtx(); if (!this.master || !this.noiseBuffer) return;
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), env = ctx.createGain();
    src.buffer = this.noiseBuffer; filter.type = "lowpass"; filter.frequency.value = cutoff;
    env.gain.setValueAtTime(gain, ctx.currentTime); env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    src.connect(filter).connect(env).connect(this.master); src.start(); src.stop(ctx.currentTime + duration);
    src.onended = () => { src.disconnect(); filter.disconnect(); env.disconnect(); };
  }
  sfx(id: SfxId) {
    switch (id) {
      case "shoot": this.tone("triangle", 510, 180, 0.09, 0.11); break;
      case "pulse": this.tone("sine", 95, 38, 0.48, 0.32); this.tone("sine", 640, 1240, 0.24, 0.08); break;
      case "hit": this.tone("square", 170, 80, 0.07, 0.11); break;
      case "crit": this.tone("sawtooth", 760, 125, 0.18, 0.19); this.tone("sine", 1320, 620, 0.16, 0.12); break;
      case "kill": this.noise(0.16, 0.15, 1800); this.tone("triangle", 180, 52, 0.22, 0.2); break;
      case "hurt": this.noise(0.3, 0.25, 500); this.tone("sawtooth", 110, 35, 0.35, 0.3); break;
      case "decoy": this.tone("sine", 880, 880, 0.12, 0.15); this.tone("sine", 1320, 1320, 0.18, 0.1, 0.12); break;
      case "wave": [220, 330, 440].forEach((f, i) => this.tone("triangle", f, f * 1.01, 0.4, 0.1, i * 0.07)); break;
      case "boss": this.tone("sawtooth", 75, 28, 1.2, 0.32); this.noise(0.7, 0.18, 350); break;
      case "ui": this.tone("sine", 420, 540, 0.06, 0.08); break;
      case "upgrade": [440, 554, 659, 880].forEach((f, i) => this.tone("sine", f, f, 0.35, 0.1, i * 0.06)); break;
      case "win": [261, 329, 392, 523, 659].forEach((f, i) => this.tone("triangle", f, f * 1.01, 0.75, 0.14, i * 0.11)); break;
      case "lose": [220, 174, 110].forEach((f, i) => this.tone("sawtooth", f, f * 0.5, 0.8, 0.13, i * 0.16)); break;
      case "step": this.tone("sine", 90, 55, 0.07, 0.035); break;
    }
  }
  startMusic() { if (this.disposed) return; const ctx = this.ensureCtx(); this.musicOn = true; this.nextBeat = ctx.currentTime + 0.05; this.beat = 0; }
  stopMusic() { this.musicOn = false; }
  update(intensity: number, boss = false) {
    if (!this.musicOn || this.disposed || this.muted || !this.ctx || !this.music) return;
    const interval = boss ? 0.19 : 0.24;
    if (this.nextBeat < this.ctx.currentTime - 1) this.nextBeat = this.ctx.currentTime;
    while (this.nextBeat < this.ctx.currentTime + 0.08) {
      const delay = Math.max(0, this.nextBeat - this.ctx.currentTime), step = this.beat % 16;
      if (step % 4 === 0) this.tone("sine", boss ? 62 : 55, 32, 0.2, 0.22, delay, this.music);
      if (step % 4 === 2 && intensity > 0.2) this.noise(0.05, 0.025 + intensity * 0.025, 5000);
      if (step % 2 === 1 && intensity > 0.52) this.tone("square", boss ? 110 : 82, 70, 0.055, 0.035, delay, this.music);
      if ((step === 0 || step === 6 || step === 10) && intensity > 0.72) {
        const notes = boss ? [110, 116, 82] : [220, 261, 196];
        this.tone("triangle", notes[(this.beat >> 2) % 3], notes[(this.beat >> 2) % 3] * 0.99, 0.35, 0.045, delay, this.music);
      }
      this.nextBeat += interval; this.beat++;
    }
  }
  dispose() { if (this.disposed) return; this.disposed = true; this.detachUnlock(); this.musicOn = false; const ctx = this.ctx; this.ctx = null; if (ctx && ctx.state !== "closed") void ctx.close(); }
}
