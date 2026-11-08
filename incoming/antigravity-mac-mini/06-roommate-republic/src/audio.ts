export class RoommateAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Tactile ballpoint pen & clipboard click for UI controls and prediction toggles.
   */
  playPenClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1150, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.035);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // ignore audio errors in test/restricted environments
    }
  }

  /**
   * Crisp cash register ledger chime for weekly settlement steps.
   */
  playCashChime(week: number = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const baseFreq = 587.33 + (week - 1) * 55; // D5 upward per week
      const freqs = [baseFreq, baseFreq * 1.25];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.055;
        osc.frequency.setValueAtTime(f, start);
        gain.gain.setValueAtTime(0.07, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.17);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Dual-tone brass warning bell when the Week 3 Surprise Expense hits.
   */
  playShockBell(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [440, 392];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.23);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Warm triad arpeggio when prediction grading and counterfactual comparison complete.
   */
  playRevealFanfare(score: number = 2): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const chord =
        score >= 2 ? [523.25, 659.25, 783.99, 1046.5] : [440, 523.25, 659.25];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.065;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.075, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.26);
      });
    } catch {
      // ignore
    }
  }

  destroy(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
