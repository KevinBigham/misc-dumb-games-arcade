import { Random } from "./utils";
export type SfxId = "ui" | "charge" | "slam" | "stamp" | "bank" | "shred" | "memo" | "hit" | "win" | "lose" | "quack" | "overcharge";
export class AudioSystem {
  private ctx: AudioContext | null = null; private master: GainNode | null = null; private noise: AudioBuffer | null = null;
  private voices = 0; private beatClock = 0; private beat = 0; private intensity = 0; private rng = new Random(0xa0d10);
  muted: boolean;
  constructor(muted: boolean) { this.muted = muted; }
  unlock(): void { if (this.muted) return; const ctx = this.ensure(); if (ctx.state === "suspended") void ctx.resume(); }
  setMuted(muted: boolean): void { this.muted = muted; if (this.master && this.ctx) this.master.gain.setTargetAtTime(muted ? 0 : 0.36, this.ctx.currentTime, 0.025); if (!muted) this.unlock(); }
  setIntensity(value: number): void { this.intensity = Math.max(0, Math.min(1, value)); }
  update(dt: number, playing: boolean): void {
    if (!playing || this.muted || !this.ctx) return;
    this.beatClock -= dt; if (this.beatClock > 0) return;
    this.beatClock += 0.36 - this.intensity * 0.1;
    const scale = [110, 130.81, 146.83, 164.81, 196, 164.81, 146.83, 130.81];
    const note = scale[this.beat % scale.length];
    this.tone("triangle", note, note * 0.995, 0.12, 0.025, 0);
    if (this.beat % 2 === 0) this.tone("sine", 55, 48, 0.16, 0.04 + this.intensity * 0.02, 0);
    if (this.intensity > 0.45 && this.beat % 2 === 1) this.noiseBurst(0.035, 0.018, 3200);
    this.beat++;
  }
  sfx(id: SfxId, amount = 1): void {
    if (this.muted) return;
    const ctx = this.ensure(); if (ctx.state === "suspended") void ctx.resume();
    const pitch = this.rng.range(0.96, 1.04);
    switch (id) {
      case "ui": this.tone("sine", 620, 820, 0.055, 0.08, 0); break;
      case "charge": this.tone("sine", 180, 420, 0.16, 0.04, 0); break;
      case "slam": this.tone("sine", 130 * pitch, 42, 0.16, 0.23 * amount, 0); this.noiseBurst(0.09, 0.12 * amount, 700); break;
      case "stamp": { const f = 520 * Math.pow(1.0595, Math.min(10, amount)); this.tone("triangle", f, f * 1.5, 0.11, 0.13, 0); break; }
      case "bank": [523, 659, 784, 1046].forEach((f, i) => this.tone("triangle", f, f, 0.16, 0.1, i * 0.065)); break;
      case "shred": this.noiseBurst(0.34, 0.2, 1300); this.tone("sawtooth", 180, 45, 0.34, 0.12, 0); break;
      case "memo": [392, 523, 659].forEach((f, i) => this.tone("square", f * 0.99, f, 0.07, 0.055, i * 0.085)); break;
      case "hit": this.tone("square", 160, 55, 0.18, 0.16, 0); break;
      case "win": [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone("triangle", f, f * 1.01, 0.32, 0.11, i * 0.09)); break;
      case "lose": this.tone("sawtooth", 260, 38, 0.7, 0.17, 0); break;
      case "quack": this.tone("square", 230, 180, 0.12, 0.075, 0); this.tone("square", 247, 186, 0.11, 0.045, 0.02); break;
      case "overcharge": this.noiseBurst(0.22, 0.16, 1100); this.tone("sawtooth", 380, 65, 0.28, 0.16, 0); break;
    }
  }
  dispose(): void { const ctx = this.ctx; this.ctx = null; this.master?.disconnect(); this.master = null; if (ctx && ctx.state !== "closed") void ctx.close(); }
  private ensure(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext(); const compressor = this.ctx.createDynamicsCompressor(); compressor.threshold.value = -18; compressor.ratio.value = 5;
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.36; this.master.connect(compressor).connect(this.ctx.destination);
      const length = Math.floor(this.ctx.sampleRate * 0.5); this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0); for (let i = 0; i < length; i++) data[i] = this.rng.range(-1, 1);
    }
    return this.ctx;
  }
  private tone(type: OscillatorType, from: number, to: number, duration: number, gainValue: number, delay: number): void {
    if (!this.ctx || !this.master || this.voices >= 20) return;
    const t = this.ctx.currentTime + delay; const osc = this.ctx.createOscillator(); const filter = this.ctx.createBiquadFilter(); const gain = this.ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(Math.max(20, from), t); osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + duration);
    filter.type = "lowpass"; filter.frequency.value = 2400;
    gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), t + 0.008); gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(filter).connect(gain).connect(this.master); this.voices++;
    osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); this.voices--; }; osc.start(t); osc.stop(t + duration + 0.02);
  }
  private noiseBurst(duration: number, gainValue: number, frequency: number): void {
    if (!this.ctx || !this.master || !this.noise || this.voices >= 20) return;
    const t = this.ctx.currentTime; const source = this.ctx.createBufferSource(); const filter = this.ctx.createBiquadFilter(); const gain = this.ctx.createGain();
    source.buffer = this.noise; filter.type = "bandpass"; filter.frequency.value = frequency; filter.Q.value = 0.8;
    gain.gain.setValueAtTime(gainValue, t); gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(gain).connect(this.master); this.voices++;
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); this.voices--; }; source.start(t); source.stop(t + duration);
  }
}
