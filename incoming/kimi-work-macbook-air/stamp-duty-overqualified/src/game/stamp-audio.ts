type Sfx = "ui" | "charge" | "launch" | "stamp" | "bank" | "strike" | "law" | "duck" | "hit" | "win" | "lose" | "upgrade";

export class StampAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private voices = 0;
  private nextBeat = 0;
  private beat = 0;
  muted = false;

  constructor() {
    try { this.muted = localStorage.getItem("stamp-duty.muted") === "1"; } catch { /* storage is optional */ }
  }

  unlock(): void {
    if (this.muted) return;
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      this.ctx = new AudioCtor();
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -18;
      compressor.knee.value = 18;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.18;
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.42;
      this.master.connect(compressor).connect(this.ctx.destination);
      this.noiseBuffer = this.makeNoise();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  toggle(): boolean {
    this.muted = !this.muted;
    try { localStorage.setItem("stamp-duty.muted", this.muted ? "1" : "0"); } catch { /* optional */ }
    if (!this.muted) this.unlock();
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.42, this.ctx.currentTime, 0.02);
    return this.muted;
  }

  private makeNoise(): AudioBuffer | null {
    if (!this.ctx) return null;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.5), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let seed = 918273;
    for (let i = 0; i < data.length; i++) {
      seed = (seed * 16807) % 2147483647;
      data[i] = (seed / 1073741823.5 - 1) * (1 - i / data.length * 0.2);
    }
    return buffer;
  }

  private tone(type: OscillatorType, f0: number, f1: number, duration: number, gain: number, delay = 0): void {
    if (!this.ctx || !this.master || this.muted || this.voices >= 14) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 3200;
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, f0), t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + duration);
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.012, duration * 0.15));
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(filter).connect(env).connect(this.master);
    this.voices++;
    osc.onended = () => { this.voices--; osc.disconnect(); filter.disconnect(); env.disconnect(); };
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private noise(duration: number, gain: number, frequency: number, type: BiquadFilterType = "bandpass", delay = 0): void {
    if (!this.ctx || !this.master || !this.noiseBuffer || this.muted || this.voices >= 14) return;
    const t = this.ctx.currentTime + delay;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = type;
    filter.frequency.setValueAtTime(frequency, t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, frequency * 0.45), t + duration);
    filter.Q.value = 1.2;
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter).connect(env).connect(this.master);
    this.voices++;
    source.onended = () => { this.voices--; source.disconnect(); filter.disconnect(); env.disconnect(); };
    source.start(t);
    source.stop(t + duration + 0.02);
  }

  sfx(id: Sfx, variation = 0): void {
    if (this.muted) return;
    this.unlock();
    if (!this.ctx) return;
    switch (id) {
      case "ui": this.tone("sine", 920, 1180, 0.045, 0.09); break;
      case "charge": this.noise(0.18, 0.055, 650, "highpass"); break;
      case "launch":
        this.noise(0.18, 0.18, 1500, "highpass");
        this.tone("sawtooth", 260, 58, 0.24, 0.18);
        break;
      case "stamp": {
        const pitch = Math.pow(2, Math.min(12, variation) / 12);
        this.tone("sine", 150 * pitch, 48 * pitch, 0.105, 0.25);
        this.noise(0.06, 0.11, 1050 * pitch);
        this.tone("triangle", 660 * pitch, 880 * pitch, 0.09, 0.08, 0.025);
        break;
      }
      case "bank":
        [523, 659, 784, 1046].forEach((f, i) => this.tone("triangle", f, f * 1.02, 0.16, 0.12, i * 0.065));
        break;
      case "strike":
        this.tone("square", 180, 42, 0.42, 0.19);
        this.noise(0.25, 0.14, 520, "lowpass");
        break;
      case "law":
        [523, 659, 784].forEach((f, i) => this.tone("sine", f * 0.99, f, 0.12, 0.11, i * 0.09));
        break;
      case "duck":
        this.tone("square", 235, 185, 0.12, 0.10);
        this.tone("square", 255, 195, 0.14, 0.09, 0.13);
        break;
      case "hit": this.tone("sine", 100, 42, 0.12, 0.18); this.noise(0.07, 0.1, 800); break;
      case "upgrade": [440, 554, 659].forEach((f, i) => this.tone("triangle", f, f * 1.01, 0.2, 0.1, i * 0.08)); break;
      case "win": [523, 659, 784, 1046, 1318].forEach((f, i) => this.tone("triangle", f, f, 0.35, 0.13, i * 0.11)); break;
      case "lose": this.tone("sawtooth", 290, 32, 0.75, 0.18); break;
    }
  }

  updateMusic(playing: boolean, intensity: number): void {
    if (!playing || this.muted || !this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    if (this.nextBeat < now) this.nextBeat = now + 0.04;
    while (this.nextBeat < now + 0.12) {
      const notes = [110, 110, 146.83, 110, 164.81, 146.83, 98, 110];
      const note = notes[this.beat % notes.length];
      const delay = Math.max(0, this.nextBeat - now);
      if (this.beat % 2 === 0) this.tone("triangle", note, note * 0.99, 0.16, 0.026 + intensity * 0.012, delay);
      if (this.beat % 4 === 2) this.noise(0.035, 0.025, 1800, "highpass", delay);
      if (intensity > 0.55 && this.beat % 2 === 1) this.tone("sine", note * 4, note * 4, 0.07, 0.018, delay);
      this.beat++;
      this.nextBeat += 60 / (104 + intensity * 24) / 2;
    }
  }

  dispose(): void {
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    if (ctx && ctx.state !== "closed") void ctx.close();
  }
}
