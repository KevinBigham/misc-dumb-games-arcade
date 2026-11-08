/* ════════════════ SECTION §I — AUDIO: synthesized, event-driven, all original ════════════════ */
// Two layers, per the handoff's feel model: a continuous crowd/ambience bed +
// short SFX fired on the EXACT sim frame of each event (never from animation).
const AudioSys = {
  ctx: null, master: null, crowdGain: null, started: false, musicTimer: null,
  init() {
    if (this.started || typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    // crowd bed: looping filtered noise
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let seed = 1234567;
    for (let i = 0; i < len; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; d[i] = ((seed / 0x3fffffff) - 1) * 0.8; }
    const src = this.ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const filt = this.ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 420; filt.Q.value = 0.6;
    this.crowdGain = this.ctx.createGain(); this.crowdGain.gain.value = 0.0;
    src.connect(filt); filt.connect(this.crowdGain); this.crowdGain.connect(this.master);
    src.start();
    this.started = true;
  },
  setCrowd(level) {
    if (!this.started) return;
    const g = this.crowdGain.gain;
    g.cancelScheduledValues(this.ctx.currentTime);
    g.setTargetAtTime(level, this.ctx.currentTime, 0.4);
  },
  swell(amount, decay) {
    if (!this.started) return;
    const g = this.crowdGain.gain, t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(Math.min(0.34, (g.value || 0.06) + amount), t);
    g.setTargetAtTime(0.07, t + 0.15, decay || 1.2);
  },
  tone(freq, dur, type, vol, when, slide) {
    if (!this.started) return;
    const t = this.ctx.currentTime + (when || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, slide), t + dur);
    g.gain.setValueAtTime(vol || 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol, freq, when, slideTo) {
    if (!this.started) return;
    const t = this.ctx.currentTime + (when || 0);
    const len = Math.max(1, this.ctx.sampleRate * dur | 0);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let seed = 777; for (let i = 0; i < len; i++) { seed = (seed * 48271) % 2147483647; d[i] = (seed / 1073741823) - 1; }
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const filt = this.ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.setValueAtTime(freq || 1800, t); filt.Q.value = 0.8;
    if (slideTo) filt.frequency.exponentialRampToValueAtTime(slideTo, t + dur);   // [v0.6 P3] swept whoosh support
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol || 0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filt); filt.connect(g); g.connect(this.master);
    src.start(t);
  },
  fanfare(notes, step, dur, type, vol) {
    notes.forEach((n, i) => this.tone(n, dur || 0.14, type || 'square', vol || 0.13, i * (step || 0.09)));
  },
  // vocal-ish umpire bark: sawtooth burst through a swept formant filter
  voice(syllables) {
    if (!this.started) return;
    let when = 0;
    for (const [f0, f1, dur] of syllables) {
      const t = this.ctx.currentTime + when;
      const o = this.ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(85, t + dur);
      const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.4;
      bp.frequency.setValueAtTime(f0, t);
      bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.34, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(bp); bp.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
      when += dur + 0.03;
    }
  },
  // crowd "ooooh" — filtered noise sweep down
  ooh() {
    if (!this.started) return;
    const t = this.ctx.currentTime;
    this.noise(0.55, 0.16, 700);
    this.swell(0.06, 0.8);
  },
  /* ── v0.3 FULL AUDIO PACKAGE — all melodies original compositions ── */
  // two-voice ballpark organ: square lead + triangle bass, vibrato-free chunky
  organ(melody, bass, step, vol) {
    if (!this.started) return;
    step = step || 0.14; vol = vol || 0.12;
    melody.forEach((n, i) => { if (n) this.tone(n, step * 0.92, 'square', vol, i * step); });
    (bass || []).forEach((n, i) => { if (n) this.tone(n, step * 1.7, 'triangle', vol * 0.9, i * step * 2); });
  },
  // between-innings number (16 beats) — original comp "Seventh-Inning Strut"
  betweenInnings() {
    this.organ(
      [392, 494, 587, 494, 659, 587, 494, 392, 440, 523, 659, 523, 587, 494, 440, 392],
      [196, 247, 262, 196, 220, 262, 247, 196],
      0.13, 0.11);
  },
  // [v0.6 P3] crowd stomp-clap chant under the organ — fixed pattern (no RNG),
  // two bars of "clap ... clap ... clap-clap-clap", era-tasteful and short
  clapChant() {
    if (!this.started) return;
    const beat = 0.13;
    const bars = [[0, 2, 4, 6, 7], [8, 10, 12, 14, 15]];
    for (const bar of bars) for (const b of bar) {
      const acc = (b % 8 === 0);                                   // bar-downbeat accent
      this.noise(0.035, acc ? 0.13 : 0.09, 1150, b * beat);        // clap
      if (acc) this.tone(72, 0.09, 'sine', 0.15, b * beat);        // stomp
    }
  },
  // CHARGE! — the classic six-note build, original voicing
  charge() {
    const N = [392, 523, 659, 784, 659, 784];
    N.forEach((n, i) => this.tone(n, i === 5 ? 0.34 : 0.09, 'square', 0.14, i * (i === 4 ? 0.16 : 0.085)));
    this.swell(0.08, 1.0);
  },
  // walk-up ditty by batter archetype [v0.3]
  walkup(pow, spd) {
    if (pow >= 11) this.organ([196, 233, 262, 311], [98], 0.11, 0.13);          // slugger: heavy minor climb
    else if (spd >= 11) this.organ([523, 659, 784, 1047], [262], 0.07, 0.11);   // burner: quick sprint up
    else this.organ([392, 494, 440, 523], [196], 0.10, 0.10);                   // contact: neutral bounce
  },
  // PA-announcer-ish stinger: formant syllables matched to name length
  paCall(syl) {
    const shapes = [[720, 520], [560, 380], [820, 600], [480, 340]];
    const arr = [];
    for (let i = 0; i < syl; i++) arr.push([shapes[i % 4][0], shapes[i % 4][1], i === syl - 1 ? 0.22 : 0.11]);
    this.voice(arr);
  },
  // consume this tick's sim events — exact-frame audio [handoff requirement]
  consume(events, st) {
    if (!this.started) return;
    for (const e of events) {
      switch (e.type) {
        case 'release': {   // [v0.6 P3] whoosh scaled by actual flight speed: T = frames mound→plate (20 fast … 26 slow)
          const v = Math.max(0, Math.min(1, (26 - (e.data ? e.data.T : 23)) / 6));
          this.noise(0.07 + v * 0.06, 0.10 + v * 0.12, 2600 + v * 1000, 0, 1400 - v * 500);
          break;
        }
        case 'crack': {     // [v0.6 P3] louder, clearly tiered: q4 crack · q2 thwack · q0 dribbler
          const q = e.data ? e.data.q : 2;
          if (e.data && e.data.bunt) { this.tone(120, 0.05, 'triangle', 0.18); this.noise(0.03, 0.12, 800); break; }
          if (q === 4) {
            this.noise(0.07, 0.44, 3000, 0, 1200);
            this.tone(240, 0.07, 'triangle', 0.3);
            this.tone(90, 0.09, 'sine', 0.26);                 // low thump under the crack
          } else if (q === 2) {
            this.noise(0.06, 0.32, 1900, 0, 1000);
            this.tone(170, 0.06, 'triangle', 0.24);
          } else {
            this.noise(0.04, 0.2, 1200);
            this.tone(120, 0.05, 'triangle', 0.16);
          }
          this.swell(q === 4 ? 0.18 : q === 2 ? 0.1 : 0.05);
          break;
        }
        case 'catchpop': case 'catch': this.noise(0.045, 0.2, 900); break;
        case 'pickup': this.noise(0.03, 0.1, 700); break;
        case 'throw': case 'pickoff': this.noise(0.06, 0.08, 2000); break;
        case 'bounce': if (e.data && e.data.n <= 2) this.tone(90, 0.05, 'triangle', 0.1); break;
        case 'dive': this.noise(0.1, 0.12, 500); break;
        case 'call:strike': this.voice([[900, 420, 0.13], [520, 260, 0.2]]); break;          // "stee-RIKE"
        case 'call:ball': this.voice([[420, 300, 0.16]]); break;                              // "ball"
        case 'call:strikeout': this.voice([[900, 420, 0.12], [560, 240, 0.3]]); this.swell(0.12); break;
        case 'call:walk': this.fanfare([262, 330, 392], 0.09, 0.12); break;
        case 'call:foul': this.ooh(); break;
        case 'call:out': this.voice([[760, 300, 0.22]]); this.swell(0.1); break;              // "OUT"
        case 'call:hbp': this.tone(180, 0.2, 'sawtooth', 0.1, 0, 120); break;
        case 'flyout': this.swell(0.1); break;
        case 'newBatter': {   // walk-up ditty by archetype + PA stinger [v0.3]
          if (e.data && st.scene === 'GAME') {
            this.walkup(e.data.pow || 8, e.data.spd || 8);
            this.paCall(e.data.syl || 2);
          } else this.fanfare([392, 523, 659], 0.07, 0.09, 'square', 0.05);
          break;
        }
        case 'hr': {          // [v0.3] layered eruption: fanfare + bells + double swell
          const big = e.data && e.data.ft >= 400;
          this.fanfare(big ? [392, 494, 587, 784, 988, 784, 988, 1175] : [392, 494, 587, 784, 587, 784], 0.09, 0.2, 'square', 0.16);
          [1319, 1568, 2093].forEach((n, i) => this.tone(n, 0.5, 'triangle', 0.07, 0.5 + i * 0.13));
          this.noise(1.2, 0.10, 900, 0.1);                       // roar bed
          this.swell(big ? 0.34 : 0.26, big ? 3.0 : 2.2);
          if (this.ctx) { const g = this.crowdGain.gain; g.setTargetAtTime(0.22, this.ctx.currentTime + 1.4, 0.6); g.setTargetAtTime(0.08, this.ctx.currentTime + 3.4, 1.2); }
          break;
        }
        case 'run': this.fanfare([659, 880], 0.06, 0.1, 'triangle', 0.14); this.swell(0.14); break;
        case 'error': this.fanfare([220, 208], 0.09, 0.14, 'sawtooth', 0.1); break;
        case 'steal': this.noise(0.12, 0.14, 600); this.swell(0.05, 0.6); break;             // jump! [v0.3]
        case 'stolen': this.fanfare([523, 659, 784], 0.06, 0.1, 'square', 0.12); this.swell(0.1); break;
        case 'switch': this.tone(740, 0.04, 'square', 0.07); break;
        case 'tagup': case 'go': case 'advance': break;
        case 'phantom': this.tone(660, 0.05, 'square', 0.07); break;
        case 'playball': this.fanfare([392, 523, 659, 784], 0.1, 0.16); this.setCrowd(0.09); break;
        case 'halfStart': this.setCrowd(0.09); break;                    // gameplay bed > title RMS
        case 'card': this.setCrowd(0.03); this.betweenInnings(); this.clapChant(); break;  // organ + chant [v0.6 P3]
        case 'final': this.fanfare([523, 659, 784, 1047], 0.12, 0.3); this.swell(0.2, 2.5); break;
        case 'menu': this.tone(880, 0.05, 'square', 0.08); break;
        case 'wall': this.noise(0.06, 0.18, 500); break;
        case 'windup': break;
      }
    }
    // CHARGE! riff: batting team just put a runner into scoring position [v0.3]
    const risp = st.scene === 'GAME' && !!(st.bases[2] || st.bases[3]);
    if (risp && !this.lastRISP && st.phase === 'PREPITCH') this.charge();
    this.lastRISP = risp;
    // title riff (original 8-note loop) while on title screen
    if (st.scene === 'TITLE' && st.frame % 96 === 1) {
      this.fanfare([330, 392, 440, 523, 440, 392, 494, 523], 0.11, 0.12, 'square', 0.07);
    }
  },
};
