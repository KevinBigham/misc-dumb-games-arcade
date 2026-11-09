/* Prismwheel app: Storage, Audio, Renderer, Input, UI glue. Reads core state, never changes rules. */
(function () {
'use strict';
const P = window.Prism, { CONFIG, DATA } = P;
const GK = window.GK;
const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
let reduceMotion = GK.prefs.motion() !== 'full';
GK.prefs.on(() => { reduceMotion = GK.prefs.motion() !== 'full'; });
// text floor: kit size for small HUD text, with an optional cap on the scale for the crowded top row
const tfl = (px, cap) => px >= 24 ? px : Math.max(12, px) * Math.min(GK.prefs.text(), cap || 9);

// ---------------- Storage ----------------
const KEY = 'prismwheel.v1';
const Store = {
  data: { best: 0, daily: { date: '', best: 0 }, muted: false, save: null, seenFlare: false, plays: 0 },
  load() { try { const raw = localStorage.getItem(KEY); if (raw) Object.assign(this.data, JSON.parse(raw)); } catch (e) { /* private mode: play without saving */ } },
  write() { try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { /* ignore */ } },
};
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

// ---------------- Audio (all generated) ----------------
const Audio = {
  ctx: null, master: null, music: null, sfx: null, nextStep: 0, stepIdx: 0, timer: null, playing: false, key: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor ? this.ctx.createDynamicsCompressor() : this.ctx.createGain();
      comp.connect(this.ctx.destination);
      this.master = this.ctx.createGain(); this.master.connect(comp);
      this.music = this.ctx.createGain(); this.music.gain.value = 0.32; this.music.connect(this.master);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.8; this.sfx.connect(this.master);
      this.setMuted(Store.data.muted);
      const vols = () => { this.music.gain.value = 0.32 * GK.prefs.vol('music'); this.sfx.gain.value = 0.8 * GK.prefs.vol('sfx'); };
      vols(); GK.prefs.on(vols);
      const n = this.ctx.sampleRate; this.noiseBuf = this.ctx.createBuffer(1, n, n);
      const ch = this.noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },
  setMuted(m) { if (this.master) this.master.gain.value = m ? 0 : 0.9; },
  tone(f, dur, type, vol, slide, when, dest) {
    if (!this.ctx) return; const c = this.ctx, t = when || c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, freq, vol, when, dest, sweepTo) {
    if (!this.ctx || !this.noiseBuf) return; const c = this.ctx, t = when || c.currentTime;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noiseBuf; f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = 1.2;
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx); s.start(t); s.stop(t + dur + 0.02);
  },
  hz(semi) { return 220 * Math.pow(2, (semi + this.key) / 12); },
  penta: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24, 27],
  rot(dir) { this.tone(dir > 0 ? 1180 : 1040, 0.035, 'triangle', 0.05); this.noise(0.03, 3200, 0.04); },
  land(row, danger) { this.tone(170 - row * 6, 0.12, 'sine', 0.28, 70); this.noise(0.05, 900, 0.07); if (danger) this.tone(98, 0.18, 'square', 0.05, 80); },
  clear(combo, chain, size) {
    if (!this.ctx) return; const t = this.ctx.currentTime, i0 = Math.min(this.penta.length - 3, combo - 1 + (chain - 1) * 2);
    for (let k = 0; k < 3; k++) this.tone(this.hz(this.penta[i0 + k] + 12), 0.22, k ? 'triangle' : 'square', 0.09, 0, t + k * 0.045);
    this.noise(0.25, 5000, 0.06 + size * 0.01, t, null, 1800);
    if (size >= 5) this.tone(this.hz(24), 0.5, 'sine', 0.12, 0, t + 0.12);
  },
  flare() { if (!this.ctx) return; const t = this.ctx.currentTime; this.noise(0.7, 300, 0.35, t, null, 6000); this.tone(110, 0.6, 'sawtooth', 0.1, 880, t); this.tone(55, 0.5, 'sine', 0.35, 30, t); },
  ready() { if (!this.ctx) return; const t = this.ctx.currentTime; [0, 7, 12, 19].forEach((s, i) => this.tone(this.hz(s + 12), 0.25, 'triangle', 0.08, 0, t + i * 0.06)); },
  ringup() { if (!this.ctx) return; const t = this.ctx.currentTime; [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(this.hz(s + 12), 0.4, i % 2 ? 'triangle' : 'square', 0.08, 0, t + i * 0.07)); this.noise(1.2, 600, 0.2, t, null, 8000); },
  over() { if (!this.ctx) return; const t = this.ctx.currentTime; [12, 7, 3, 0, -5].forEach((s, i) => this.tone(this.hz(s), 0.35, 'sawtooth', 0.08, this.hz(s) * 0.94, t + i * 0.13)); this.noise(0.9, 400, 0.3, t, null, 60); },
  heartbeat(when) { this.tone(62, 0.12, 'sine', 0.4, 40, when); this.tone(60, 0.1, 'sine', 0.3, 40, when + 0.16); },
  // Music: 16-step loop, key rises each ring, layers join as difficulty climbs.
  startMusic() { if (!this.ctx || this.playing) return; this.playing = true; this.nextStep = this.ctx.currentTime + 0.06; this.timer = setInterval(() => this.schedule(), 25); },
  stopMusic() { this.playing = false; if (this.timer) clearInterval(this.timer); this.timer = null; },
  schedule() {
    if (!this.ctx || !this.playing) return;
    const st = Game.st; const diff = st ? st.diff : 1;
    const bpm = Math.min(136, 94 + diff * 1.25), spb = 60 / bpm / 4;
    const chords = [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]]; // i VI III VII
    while (this.nextStep < this.ctx.currentTime + 0.12) {
      const s = this.stepIdx % 16, bar = Math.floor(this.stepIdx / 16) % 4, ch = chords[bar], t = this.nextStep, m = this.music;
      if (s === 0 || s === 10) this.tone(this.hz(ch[0] - 24), spb * 5, 'triangle', 0.32, 0, t, m);
      if (s % 2 === 0) { const n = ch[(s / 2) % 3] + (s % 8 === 6 ? 12 : 0); this.tone(this.hz(n + 12), spb * 1.6, 'sine', diff > 3 ? 0.07 : 0.045, 0, t, m); }
      if (diff > 6 && (s === 4 || s === 12)) this.noise(0.08, 2400, 0.12, t, m);
      if (diff > 5 && s % 4 === 2) this.noise(0.03, 8000, 0.06, t, m);
      if (diff > 11 && (s === 0 || s === 8)) this.tone(90, 0.12, 'sine', 0.5, 40, t, m);
      if (diff > 18 && s % 2 === 1) this.tone(this.hz(ch[(s >> 1) % 3] + 24), spb * 0.9, 'square', 0.025, 0, t, m);
      if (s % 8 === 0 && st && !st.over && P.maxHeight(st) >= CONFIG.maxRows - 1) this.heartbeat(t);
      this.nextStep += spb; this.stepIdx++;
    }
  },
};

// ---------------- Renderer ----------------
const cv = $('cv'), ctx = cv.getContext('2d');
const R = {
  W: 0, H: 0, dpr: 1, cx: 0, cy: 0, u: 100,
  rotVis: 0, rotTarget: 0, vrow: new Map(), pop: new Map(),
  parts: [], texts: [], waves: [], stars: [], shake: 0, punch: 0, flash: 0, banner: null, overSide: -1, overT: 0,
  shownScore: 0, beat: 0, time: 0, lastClearColor: 0,
  resize() {
    const vw = window.innerWidth || 390, vh = window.innerHeight || 844;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.W = vw; this.H = vh;
    cv.width = Math.round(vw * this.dpr); cv.height = Math.round(vh * this.dpr);
    const top = 78, bot = 118, avail = Math.max(200, vh - top - bot);
    this.cx = vw / 2; this.cy = top + avail / 2;
    this.u = Math.max(80, Math.min((vw / 2 - 4) / 0.98, (avail / 2) / 0.9));
    if (!this.stars.length) for (let i = 0; i < 90; i++) this.stars.push({ a: Math.random() * TAU, r: 0.15 + Math.random() * 2.2, s: Math.random() * 1.6 + 0.3, p: Math.random() * TAU });
  },
  sideAngle(s, n, rot) { return -Math.PI / 2 + (s + rot) * TAU / n; },
  laneAngle(l, n) { return -Math.PI / 2 + l * TAU / n; },
  polar(d, a) { return [this.cx + Math.cos(a) * d * this.u, this.cy + Math.sin(a) * d * this.u]; },
  // world position of a cell's middle, for particles and texts
  cellPos(s, r, n) { const d = CONFIG.coreR + (r + 0.5) * CONFIG.rowH; return this.polar(d, this.sideAngle(s, n, this.rotVis)); },
  poly(n, d, rot) { ctx.beginPath(); for (let i = 0; i < n; i++) { const a = this.sideAngle(i, n, rot) - Math.PI / n, rr = d / Math.cos(Math.PI / n); const [x, y] = this.polar(rr, a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); },
  trap(n, angle, d0, d1, inset, cap) {
    const t = Math.tan(Math.PI / n), u = this.u, g = inset || 1.5, c = cap || 99;
    const w0 = Math.min(d0, c) * u * t, w1 = Math.min(d1, c + (d1 - d0) * 0.6) * u * t;
    ctx.save(); ctx.translate(this.cx, this.cy); ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-w0 + g, -d0 * u - 0.5); ctx.lineTo(w0 - g, -d0 * u - 0.5);
    ctx.lineTo(w1 - g, -d1 * u + 0.5); ctx.lineTo(-w1 + g, -d1 * u + 0.5); ctx.closePath();
    this._w0 = w0; this._w1 = w1;
    return t;
  },
  colorOf(b, s) {
    if (b.kind === 'stone') return '#5d6180';
    if (b.kind === 'prism') return 'hsl(' + ((this.time * 140 + s * 47) % 360) + ',95%,78%)';
    return DATA.colors[b.c].hex;
  },
  drawBlock(n, angle, d0, b, s, alpha, scale, cap) {
    const h = CONFIG.rowH * (scale || 1), d1 = d0 + h, u = this.u;
    this.trap(n, angle, d0, d1, 1.6, cap); const w0 = this._w0, w1 = this._w1;
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = this.colorOf(b, s); ctx.fill();
    // outer highlight + inner shade for depth
    ctx.globalAlpha *= 0.35; ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w1 + 3, -d1 * u + 0.5, (w1 - 3) * 2, Math.max(1.5, h * u * 0.18));
    ctx.fillStyle = '#000'; ctx.globalAlpha = (alpha == null ? 1 : alpha) * 0.22;
    ctx.fillRect(-w0 + 2, -d0 * u - h * u * 0.22, (w0 - 2) * 2, h * u * 0.22);
    // glyph so colors read without color vision
    ctx.globalAlpha = (alpha == null ? 1 : alpha) * (b.kind === 'shard' ? 0.55 : 0.8);
    const gy = -(d0 + h / 2) * u, gs = Math.min(h * u * 0.26, 7);
    ctx.fillStyle = b.kind === 'shard' ? 'rgba(20,10,40,.9)' : '#1c1d33'; ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1.6;
    const glyph = b.kind === 'stone' ? 'x' : b.kind === 'prism' ? 'star' : DATA.colors[b.c].glyph;
    ctx.beginPath();
    if (glyph === 'circle') { ctx.arc(0, gy, gs * 0.75, 0, TAU); ctx.fill(); }
    else if (glyph === 'triangle') { ctx.moveTo(0, gy - gs); ctx.lineTo(gs * 0.9, gy + gs * 0.65); ctx.lineTo(-gs * 0.9, gy + gs * 0.65); ctx.closePath(); ctx.fill(); }
    else if (glyph === 'square') { ctx.rect(-gs * 0.7, gy - gs * 0.7, gs * 1.4, gs * 1.4); ctx.fill(); }
    else if (glyph === 'diamond') { ctx.moveTo(0, gy - gs); ctx.lineTo(gs * 0.75, gy); ctx.lineTo(0, gy + gs); ctx.lineTo(-gs * 0.75, gy); ctx.closePath(); ctx.fill(); }
    else if (glyph === 'x') { ctx.moveTo(-gs * 0.7, gy - gs * 0.7); ctx.lineTo(gs * 0.7, gy + gs * 0.7); ctx.moveTo(gs * 0.7, gy - gs * 0.7); ctx.lineTo(-gs * 0.7, gy + gs * 0.7); ctx.stroke(); }
    else { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? gs * 0.45 : gs; i ? ctx.lineTo(Math.cos(a) * rr, gy + Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, gy + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.restore();
  },
  burst(x, y, color, count, power) {
    count = Math.round(count * GK.prefs.motionScale());
    for (let i = 0; i < count && this.parts.length < 500; i++) {
      const a = Math.random() * TAU, sp = (60 + Math.random() * 260) * (power || 1);
      this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.4 + Math.random() * 0.5, c: color, sz: 2 + Math.random() * 3.5, spin: Math.random() * TAU });
    }
  },
  text(x, y, s, color, size, life) { this.texts.push({ x, y, s, c: color || '#fff', size: size || 20, life: 0, max: life || 0.9 }); },
  addShake(v) { if (!reduceMotion) this.shake = Math.min(18, this.shake + v); },

  frame(dt) {
    const st = Game.st; this.time += dt;
    this.rotVis += (this.rotTarget - this.rotVis) * (1 - Math.exp(-30 * dt)); // ~85 ms to settle
    if (Math.abs(this.rotTarget - this.rotVis) < 0.001) this.rotVis = this.rotTarget;
    this.shake *= Math.pow(0.002, dt); this.punch *= Math.pow(0.004, dt); this.flash = Math.max(0, this.flash - dt * 2.2);
    const W = this.W, H = this.H, u = this.u;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // background
    const bg = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, Math.max(W, H) * 0.75);
    const hueShift = st ? [0, 18, 36, 300][st.ringIdx] : 0;
    const od = st && st.combo >= 5 ? 0.5 + 0.5 * Math.sin(this.time * 8) : 0; // overdrive pulse on long combos
    bg.addColorStop(0, 'hsl(' + (238 + hueShift + od * 40) + ',' + (55 + od * 20) + '%,' + (14 + od * 8) + '%)'); bg.addColorStop(1, '#05060f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    // stars drift with the wheel (parallax)
    for (const s of this.stars) {
      const tt = GK.prefs.motion() === 'still' ? 0 : this.time;
      const a = s.a + this.rotVis * 0.06 + tt * 0.01, d = s.r;
      const x = this.cx + Math.cos(a) * d * u, y = this.cy + Math.sin(a) * d * u;
      if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
      ctx.globalAlpha = 0.25 + 0.35 * Math.sin(tt * s.s + s.p) ** 2; ctx.fillStyle = '#cfd4ff'; ctx.fillRect(x, y, s.s, s.s);
    }
    ctx.globalAlpha = 1;
    if (!st) return;
    const n = st.sides;
    const sx = (Math.random() - 0.5) * this.shake, sy = (Math.random() - 0.5) * this.shake;
    ctx.save();
    ctx.translate(this.cx + sx, this.cy + sy); const sc = 1 + this.punch * 0.04 * GK.prefs.motionScale(); ctx.scale(sc, sc); ctx.translate(-this.cx, -this.cy);

    // lane spokes (world space) light up when a shard travels them
    const laneHot = new Array(n).fill(null);
    for (const f of st.falling) if (!laneHot[f.lane] || f.d < laneHot[f.lane].d) laneHot[f.lane] = f;
    const lim = CONFIG.coreR + CONFIG.maxRows * CONFIG.rowH;
    for (let l = 0; l < n; l++) {
      const a = this.laneAngle(l, n), [x0, y0] = this.polar(lim + 0.03, a), [x1, y1] = this.polar(2.2, a);
      const hot = laneHot[l];
      ctx.strokeStyle = hot ? this.colorOf(hot, l) : 'rgba(150,160,255,.08)';
      ctx.globalAlpha = hot ? 0.16 + 0.25 * Math.max(0, 1 - (hot.d - lim) / 0.5) : 1; ctx.lineWidth = hot ? 3 : 1;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // limit ring (rotates with the wheel), per face, red when that face is close to breaking
    for (let s = 0; s < n; s++) {
      const h = st.grid[s].length, danger = h >= CONFIG.maxRows - 2, crit = h >= CONFIG.maxRows - 1;
      const a = this.sideAngle(s, n, this.rotVis), rr = lim / Math.cos(Math.PI / n);
      const [x0, y0] = this.polar(rr, a - Math.PI / n), [x1, y1] = this.polar(rr, a + Math.PI / n);
      ctx.setLineDash([7, 6]); ctx.lineWidth = crit ? 3 : 2;
      ctx.strokeStyle = this.overSide === s ? '#ff3355' : crit ? 'rgba(255,70,90,' + (0.55 + 0.45 * Math.sin(this.time * 14)) + ')' : danger ? 'rgba(255,170,90,.75)' : 'rgba(170,180,255,.28)';
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.setLineDash([]);

    // stacks
    for (let s = 0; s < n; s++) {
      const col = st.grid[s], a = this.sideAngle(s, n, this.rotVis);
      for (let r = 0; r < col.length; r++) {
        const b = col[r];
        let vr = this.vrow.has(b.id) ? this.vrow.get(b.id) : r;
        vr += (r - vr) * Math.min(1, dt * 16); if (Math.abs(vr - r) < 0.01) vr = r; this.vrow.set(b.id, vr);
        let sc2 = 1; const p = this.pop.get(b.id); if (p != null) { const q = p + dt; if (q > 0.18) this.pop.delete(b.id); else { this.pop.set(b.id, q); sc2 = 1 + 0.35 * Math.sin(q / 0.18 * Math.PI); } }
        this.drawBlock(n, a, CONFIG.coreR + vr * CONFIG.rowH, b, s, this.overSide === s && Math.sin(this.time * 20) > 0 ? 0.5 : 1, sc2);
      }
    }

    // core
    this.beat = Math.max(0, this.beat - dt * 3);
    const coreGrad = ctx.createRadialGradient(this.cx, this.cy, 2, this.cx, this.cy, CONFIG.coreR * u * 1.2);
    coreGrad.addColorStop(0, '#ffffff'); coreGrad.addColorStop(0.35, 'hsl(' + (250 + hueShift) + ',80%,72%)'); coreGrad.addColorStop(1, 'hsl(' + (250 + hueShift) + ',60%,28%)');
    this.poly(n, CONFIG.coreR * (1 + this.beat * 0.04), this.rotVis); ctx.fillStyle = coreGrad; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke();
    // flare ready glow
    if (st.flare >= 1) { ctx.globalAlpha = 0.35 + 0.25 * Math.sin(this.time * 6); this.poly(n, CONFIG.coreR * 1.25, this.rotVis); ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 4; ctx.stroke(); ctx.globalAlpha = 1; }
    // combo timer arc
    if (st.comboT > 0 && st.combo >= 1) {
      const frac = st.comboT / P.comboWindow(st);
      ctx.beginPath(); ctx.arc(this.cx, this.cy, CONFIG.coreR * u * 0.7, -Math.PI / 2, -Math.PI / 2 + TAU * frac);
      ctx.strokeStyle = DATA.colors[this.lastClearColor].hex; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
    }
    ctx.fillStyle = '#1a1340'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (st.combo >= 2) { ctx.font = '900 ' + Math.round(CONFIG.coreR * u * 0.72) + 'px system-ui,sans-serif'; ctx.fillText('x' + (1 + 0.5 * (st.combo - 1)).toFixed(1).replace('.0', ''), this.cx, this.cy + 1); }
    else { ctx.font = '800 ' + Math.round(CONFIG.coreR * u * 0.5) + 'px system-ui,sans-serif'; ctx.fillText(['I', 'II', 'III', '★'][st.ringIdx], this.cx, this.cy + 1); }

    // landing ghosts: show which face each close shard will hit
    for (const f of st.falling) {
      if (f.d > lim + 0.4) continue;
      const s = P.sideForLane(st, f.lane), h = st.grid[s].length; if (h >= CONFIG.maxRows) continue;
      const d0 = CONFIG.coreR + h * CONFIG.rowH;
      this.trap(n, this.sideAngle(s, n, this.rotVis), d0, d0 + CONFIG.rowH, 2.5);
      ctx.globalAlpha = 0.25 + 0.5 * Math.max(0, 1 - (f.d - d0) / 0.5); ctx.strokeStyle = this.colorOf(f, s); ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 1; ctx.restore();
    }
    // falling shards with trails
    for (const f of st.falling) {
      const a = this.laneAngle(f.lane, n);
      this.drawBlock(n, a, f.d + CONFIG.rowH * 0.55, f, f.lane, 0.22, 1.4, lim);
      this.drawBlock(n, a, f.d, f, f.lane, 1, 1, lim);
    }
    // shockwaves
    for (let i = this.waves.length - 1; i >= 0; i--) {
      const w = this.waves[i]; w.life += dt; if (w.life > w.max) { this.waves.splice(i, 1); continue; }
      const q = w.life / w.max; ctx.globalAlpha = 1 - q; ctx.strokeStyle = w.c; ctx.lineWidth = 6 * (1 - q) + 1;
      ctx.beginPath(); ctx.arc(this.cx, this.cy, (w.r0 + (w.r1 - w.r0) * (1 - Math.pow(1 - q, 3))) * u, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // particles
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]; p.life += dt; if (p.life > p.max) { this.parts.splice(i, 1); continue; }
      p.vx *= Math.pow(0.08, dt); p.vy *= Math.pow(0.08, dt); p.x += p.vx * dt; p.y += p.vy * dt; p.spin += dt * 8;
      ctx.globalAlpha = 1 - p.life / p.max; ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin); ctx.fillRect(-p.sz / 2, -p.sz / 2, p.sz, p.sz * 1.6); ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // off-screen shard chevrons at the edge
    for (const f of st.falling) {
      const a = this.laneAngle(f.lane, n), [x, y] = this.polar(f.d, a);
      if (x > 6 && x < W - 6 && y > 70 && y < H - 6) continue;
      const ex = Math.max(10, Math.min(W - 10, x)), ey = Math.max(80, Math.min(H - 130, y));
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(a); ctx.fillStyle = this.colorOf(f, f.lane); ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -7); ctx.lineTo(-2, 0); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    ctx.globalAlpha = 1;

    // floating texts
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i]; t.life += dt; if (t.life > t.max) { this.texts.splice(i, 1); continue; }
      const q = t.life / t.max, s = 1 + ((q < 0.15 ? 0.6 + q / 0.15 * 0.55 : 1.15 - Math.min(0.15, (q - 0.15))) - 1) * GK.prefs.motionScale();
      ctx.globalAlpha = q > 0.7 ? (1 - q) / 0.3 : 1;
      ctx.font = '900 ' + Math.round(tfl(t.size) * s) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(8,8,24,.8)'; ctx.strokeText(t.s, t.x, t.y - q * 34); ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y - q * 34);
    }
    ctx.globalAlpha = 1;

    this.hud(st, dt);
    if (this.banner) {
      const b = this.banner; b.life += dt; if (b.life > b.max) this.banner = null; else {
        const q = b.life / b.max, a = q < 0.12 ? q / 0.12 : q > 0.75 ? (1 - q) / 0.25 : 1;
        ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 ' + Math.round(Math.min(40, W * 0.1)) + 'px system-ui,sans-serif'; ctx.fillStyle = '#fff'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(10,8,30,.85)';
        const y = this.cy - (lim + 0.2) * u * 0.62 - 10;
        ctx.strokeText(b.a, W / 2, y); ctx.fillText(b.a, W / 2, y);
        ctx.font = '700 ' + Math.round(tfl(Math.min(18, W * 0.046))) + 'px system-ui,sans-serif'; ctx.fillStyle = '#ffd27a'; ctx.strokeText(b.b, W / 2, y + 34); ctx.fillText(b.b, W / 2, y + 34);
        ctx.globalAlpha = 1;
      }
    }
    if (this.flash > 0) { ctx.globalAlpha = Math.min(0.6, this.flash); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  },
  hud(st, dt) {
    const W = this.W;
    this.shownScore += (st.score - this.shownScore) * Math.min(1, dt * 10); if (Math.abs(st.score - this.shownScore) < 1) this.shownScore = st.score;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    ctx.fillStyle = '#9aa0c8'; ctx.font = '700 ' + tfl(11, 1.25) + 'px system-ui,sans-serif'; ctx.fillText('SCORE', 16, 26);
    if (st.score > (this._lastScore || 0)) this.scorePop = 1; this._lastScore = st.score; this.scorePop = Math.max(0, (this.scorePop || 0) - dt * 4);
    ctx.fillStyle = this.scorePop > 0.2 ? '#fff6d8' : '#fff'; ctx.font = '900 ' + Math.round(28 * (1 + this.scorePop * 0.18)) + 'px system-ui,sans-serif'; ctx.fillText(Math.round(this.shownScore).toLocaleString(), 16, 54);
    // ring progress, centered under the score row
    const ring = P.ring(st), bw = Math.min(150, W * 0.36), bx = W / 2 - bw / 2 + (W < 420 ? 18 : 0), by = 66;
    ctx.textAlign = 'center'; ctx.fillStyle = '#c9ceff'; ctx.font = '800 ' + tfl(12, 1.25) + 'px system-ui,sans-serif';
    const label = ring.quota === Infinity ? ring.name + ' · ' + ring.title : ring.name + ' · ' + Math.min(st.ringCleared, ring.quota) + '/' + ring.quota;
    ctx.fillText(label, bx + bw / 2, by - 6);
    ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(bx, by, bw, 5);
    const fr = ring.quota === Infinity ? 1 : Math.min(1, st.ringCleared / ring.quota);
    const gr = ctx.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, '#ff5d73'); gr.addColorStop(0.5, '#ffc23d'); gr.addColorStop(1, '#3ee6a6');
    ctx.fillStyle = gr; ctx.fillRect(bx, by, bw * fr, 5);
    ctx.textAlign = 'left'; ctx.fillStyle = '#9aa0c8'; ctx.font = '700 ' + tfl(11, 1.25) + 'px system-ui,sans-serif';
    ctx.fillText((st.mode === 'daily' ? 'TODAY ' : 'BEST ') + Math.max(Game.bestFor(st.mode), st.score).toLocaleString(), 16, 74);
  },
};

// ---------------- Game glue ----------------
const Game = {
  st: null, playing: false, paused: false, acc: 0, freeze: 0, last: 0, lastSave: 0, overShownAt: 0,
  bestFor(mode) { return mode === 'daily' ? (Store.data.daily.date === today() ? Store.data.daily.best : 0) : Store.data.best; },
  start(mode) {
    const seed = mode === 'daily' ? P.hashStr('prismwheel-' + today()) : (Math.random() * 4294967295) >>> 0;
    this.st = P.newState({ mode, seed });
    this.begin();
    Store.data.plays++; Store.data.save = null; Store.write();
    if (Store.data.plays <= 2 && !(Game.coach && !Game.coach.done)) setTimeout(() => toast('Tap the left or right side to turn the wheel'), 400);
  },
  resume() {
    try { this.st = P.load(Store.data.save); } catch (e) { Store.data.save = null; Store.write(); return this.start('classic'); }
    this.begin(); this.pause(true);
  },
  begin() {
    R.rotVis = R.rotTarget = this.st.rot; R.vrow.clear(); R.pop.clear(); R.parts = []; R.texts = []; R.waves = []; R.overSide = -1; R.banner = null; R.shownScore = this.st.score;
    this.playing = true; this.paused = false; this.acc = 0; this.freeze = 0;
    show('title', false); show('over', false); show('pause', false);
    updateFlareBtn();
    Audio.init(); Audio.key = [0, 2, 4, 5][this.st.ringIdx]; Audio.startMusic();
    R.banner = { a: P.ring(this.st).name, b: P.ring(this.st).title, life: 0, max: 1.6 };
  },
  save() { if (this.st && !this.st.over && this.playing) { Store.data.save = P.serialize(this.st); Store.write(); } },
  pause(on) {
    if (!this.playing || !this.st || this.st.over) return;
    this.paused = on; show('pause', on);
    if (on) { $('pinfo').textContent = P.ring(this.st).name + ' · ' + this.st.score.toLocaleString() + ' points'; Audio.stopMusic(); this.save(); }
    else { Audio.init(); Audio.startMusic(); this.last = performance.now(); }
  },
  act(a) {
    if (!this.playing || this.paused || !this.st || this.st.over) return;
    Audio.init();
    if (a === 'flare') { if (!P.flare(this.st)) { if (this.st.flareUnlocked) toast('Flare is still charging'); } }
    else { P.rotate(this.st, a); this.moved = true; }
    this.drain();
  },
  drain() {
    const st = this.st, n = st.sides;
    for (const e of st.events) {
      if (e.type === 'rot') { R.rotTarget += e.dir; Audio.rot(e.dir); }
      else if (e.type === 'land') {
        R.vrow.set(e.id, e.r); R.pop.set(e.id, 0); R.addShake(1.5 + e.r * 0.25); Audio.land(e.r, e.danger);
        if (performance.now() - this.lastSave > 1500) { this.lastSave = performance.now(); this.save(); }
      }
      else if (e.type === 'clear') {
        let mx = 0, my = 0;
        for (const c of e.cells) { const [x, y] = R.cellPos(c.s, c.r, n); mx += x; my += y; R.burst(x, y, c.kind === 'shard' ? DATA.colors[c.c].hex : c.kind === 'stone' ? '#8a8fb0' : '#ffffff', 9, 1); R.vrow.delete(c.id); }
        mx /= e.cells.length; my /= e.cells.length;
        const lead = e.cells.find(c => c.kind === 'shard'); if (lead) R.lastClearColor = lead.c;
        R.text(mx, my, '+' + e.pts, '#fff', 18 + Math.min(14, e.size * 2));
        if (e.chain >= 2) R.text(mx, my - 26, 'CHAIN ' + e.chain + '!', '#ffd27a', 22, 1.1);
        else if (e.combo === 5) R.text(R.cx, R.cy - R.u * 0.95, 'OVERDRIVE', '#9ff0ff', 26, 1.1);
        else if (e.combo >= 3) R.text(mx, my - 24, 'COMBO ' + e.combo, '#9ff0ff', 16, 0.9);
        if (e.clutch) R.text(R.cx, R.cy + R.u * 0.95, 'CLUTCH SAVE!', '#ff8aa0', 26, 1.2);
        if (e.size >= 5) R.text(R.cx, R.cy - R.u * 0.95, e.size >= 7 ? 'PRISMATIC!' : 'BIG SHATTER', '#ffc23d', 26, 1.1);
        R.addShake(3 + e.size * 0.8 + e.chain * 2); R.punch = Math.min(1.5, R.punch + 0.6 + e.chain * 0.3); R.beat = 1;
        R.waves.push({ r0: CONFIG.coreR, r1: CONFIG.coreR + CONFIG.maxRows * CONFIG.rowH, life: 0, max: 0.35, c: lead ? DATA.colors[lead.c].hex : '#fff' });
        Audio.clear(e.combo, e.chain, e.size);
        if (e.size >= 5 || e.chain >= 2) this.freeze = reduceMotion ? 0 : 0.07;
        vibe(e.chain >= 2 ? 30 : 12);
      }
      else if (e.type === 'flare') {
        for (const c of e.cells) { const [x, y] = R.cellPos(c.s, c.r, n); R.burst(x, y, '#ffe2a0', 14, 1.4); R.vrow.delete(c.id); }
        R.waves.push({ r0: CONFIG.coreR, r1: 1.6, life: 0, max: 0.6, c: '#ffd27a' }, { r0: CONFIG.coreR, r1: 1.1, life: 0, max: 0.45, c: '#ffffff' });
        R.addShake(12); R.flash = GK.flash.allow(0.35); R.punch = 1.5; R.text(R.cx, R.cy - R.u * 0.95, 'FLARE +' + e.pts, '#ffd27a', 26, 1);
        Audio.flare(); vibe(40); updateFlareBtn();
      }
      else if (e.type === 'flareReady') {
        updateFlareBtn(); Audio.ready();
        if (e.first && !Store.data.seenFlare) { Store.data.seenFlare = true; Store.write(); toast('FLARE ready! Tap the core or the Flare button (Space) to wipe every bottom row'); }
      }
      else if (e.type === 'ringup') {
        for (const c of e.shattered) { const d = CONFIG.coreR + (c.r + 0.5) * CONFIG.rowH; const [x, y] = R.polar(d, R.sideAngle(c.s, e.oldSides, R.rotVis)); R.burst(x, y, c.kind === 'shard' ? DATA.colors[c.c].hex : '#ffffff', 6, 1.6); }
        for (const f of e.fallingOut) { const [x, y] = R.polar(f.d, R.laneAngle(f.lane, e.oldSides)); R.burst(x, y, '#ffffff', 6, 1); }
        R.rotVis = R.rotTarget = 0; R.vrow.clear();
        R.flash = GK.flash.allow(0.8); R.addShake(14); R.punch = 2;
        R.waves.push({ r0: 0.1, r1: 2.2, life: 0, max: 0.9, c: '#ffffff' });
        const ring = DATA.rings[e.ring];
        R.banner = { a: ring.name, b: ring.title + '  ·  +' + e.bonus.toLocaleString(), life: 0, max: 2.4 };
        Audio.key = [0, 2, 4, 5][e.ring]; Audio.ringup(); vibe([30, 40, 60]);
        if (e.ring === 1) setTimeout(() => toast('Seven faces now. Prisms (stars) match any color.'), 1300);
        if (e.ring === 2) setTimeout(() => toast('Eight faces. Gray stones crack when a match touches them.'), 1300);
        this.save();
      }
      else if (e.type === 'over') this.over(e);
    }
    st.events.length = 0;
  },
  over(e) {
    const st = this.st;
    R.overSide = e.s; R.addShake(16); R.flash = GK.flash.allow(0.3); Audio.over(); Audio.stopMusic(); vibe([60, 50, 120]);
    for (let r = 0; r < st.grid[e.s].length; r++) { const [x, y] = R.cellPos(e.s, r, st.sides); R.burst(x, y, '#ff4466', 5, 0.8); }
    const sum = st.summary, mode = st.mode;
    let isNew = false;
    if (mode === 'daily') { if (Store.data.daily.date !== today()) Store.data.daily = { date: today(), best: 0 }; if (sum.score > Store.data.daily.best) { Store.data.daily.best = sum.score; isNew = sum.score > 0; } }
    else if (sum.score > Store.data.best) { Store.data.best = sum.score; isNew = sum.score > 0; }
    Store.data.save = null; Store.write();
    $('oscore').textContent = sum.score.toLocaleString();
    $('onew').hidden = !isNew;
    $('obest').textContent = (mode === 'daily' ? 'Today’s best ' : 'Best ') + this.bestFor(mode).toLocaleString();
    $('oring').textContent = DATA.rings[sum.ring].name.replace('Ring ', '');
    $('ocl').textContent = sum.cleared; $('ocombo').textContent = 'x' + sum.bestCombo; $('ochain').textContent = sum.bestChain;
    $('otip').textContent = P.tipFor(sum);
    $('owhy').textContent = mode === 'daily' ? 'DAILY SPIN · A FACE BROKE' : 'A FACE BROKE';
    setTimeout(() => { if (this.st === st) { show('over', true); this.overShownAt = performance.now(); } }, 1100);
  },
  toMenu() { this.save(); this.playing = false; this.paused = false; Audio.stopMusic(); show('pause', false); show('over', false); refreshTitle(); show('title', true); },
  loop(now) {
    const dt = Math.min(0.05, Math.max(0, (now - (this.last || now)) / 1000)); this.last = now;
    if (this.playing && !this.paused && this.st && !this.st.over) {
      if (this.freeze > 0) this.freeze -= dt;
      else { this.acc += dt * GK.prefs.speed(); let guard = 0; while (this.acc >= CONFIG.step && guard++ < 12) { P.step(this.st, CONFIG.step); this.acc -= CONFIG.step; if (this.st.events.length) this.drain(); if (this.freeze > 0 || this.st.over) { this.acc = 0; break; } } }
      updateFlareBtn();
    } else if (!this.playing && GK.prefs.motion() !== 'still') R.rotTarget += dt * 0.12;
    R.frame(dt);
    requestAnimationFrame(t => this.loop(t));
  },
};

// ---------------- UI helpers ----------------
function show(id, on) { $(id).hidden = !on; }
let toastT = 0;
function toast(msg) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 3600); }
function vibe(p) { try { if (navigator.vibrate && !reduceMotion) navigator.vibrate(p); } catch (e) { /* ignore */ } }
let lastFlareKey = '';
function updateFlareBtn() {
  const st = Game.st, b = $('bf'); if (!st) return;
  const key = (st.flareUnlocked ? 1 : 0) + ':' + Math.round(st.flare * 40) + ':' + (st.flare >= 1);
  if (key === lastFlareKey) return; lastFlareKey = key;
  b.classList.toggle('locked', !st.flareUnlocked);
  b.classList.toggle('ready', st.flare >= 1);
  b.style.setProperty('--f', Math.round(st.flare * 100) + '%');
}
function refreshTitle() {
  $('tbest').textContent = 'Best ' + Store.data.best.toLocaleString();
  $('tdaily').textContent = 'Today ' + Game.bestFor('daily').toLocaleString();
  $('bresume').hidden = !Store.data.save;
}

// ---------------- Input ----------------
function press(el, fn) {
  el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); el.classList.add('on'); fn(); setTimeout(() => el.classList.remove('on'), 110); });
  el.addEventListener('click', e => e.preventDefault());
}
press($('bl'), () => Game.act(-1));
press($('br'), () => Game.act(1));
press($('bf'), () => Game.act('flare'));
cv.addEventListener('pointerdown', e => {
  e.preventDefault();
  if (!Game.playing || Game.paused) return;
  const dx = e.clientX - R.cx, dy = e.clientY - R.cy;
  if (Math.hypot(dx, dy) < CONFIG.coreR * R.u * 1.6 && Game.st && Game.st.flare >= 1) return Game.act('flare');
  Game.act(e.clientX < R.W / 2 ? -1 : 1);
});
let lastKey = 0;
window.addEventListener('keydown', e => {
  if (document.querySelector('.gk-prefs')) return;
  const k = e.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w', 'A', 'D', 'W'].includes(k)) e.preventDefault();
  if (k === 'Escape' || k === 'p' || k === 'P') { if (Game.playing && !Game.st.over) Game.pause(!Game.paused); return; }
  if (!$('title').hidden && (k === 'Enter' || k === ' ')) { Game.start('classic'); return; }
  if (!$('over').hidden && (k === 'Enter' || k === ' ' || k === 'r' || k === 'R')) { if (performance.now() - Game.overShownAt > 400) Game.start(Game.st.mode); return; }
  if (!$('pause').hidden && (k === 'Enter' || k === ' ')) { Game.pause(false); return; }
  const now = performance.now(); if (e.repeat && now - lastKey < 75) return; lastKey = now;
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') Game.act(-1);
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') Game.act(1);
  else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') Game.act('flare');
});
$('bplay').addEventListener('click', () => Game.start('classic'));
$('bdaily').addEventListener('click', () => Game.start('daily'));
$('bresume').addEventListener('click', () => Game.resume());
$('bretry').addEventListener('click', () => Game.start(Game.st ? Game.st.mode : 'classic'));
$('bmenu').addEventListener('click', () => Game.toMenu());
$('bunpause').addEventListener('click', () => Game.pause(false));
$('bquit').addEventListener('click', () => Game.toMenu());
$('bpause').addEventListener('click', () => { if (Game.playing && Game.st && !Game.st.over) Game.pause(!Game.paused); });
$('bmute').addEventListener('click', () => { Store.data.muted = !Store.data.muted; Store.write(); Audio.init(); Audio.setMuted(Store.data.muted); $('bmute').style.opacity = Store.data.muted ? 0.4 : 1; });
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (Game.playing && !Game.paused) Game.pause(true); Game.save(); } });
window.addEventListener('pagehide', () => Game.save());
window.addEventListener('blur', () => { if (Game.playing && !Game.paused && Game.st && !Game.st.over) Game.pause(true); });
window.addEventListener('resize', () => R.resize());

// ---------------- Boot ----------------
Store.load(); R.resize(); refreshTitle();
$('bmute').style.opacity = Store.data.muted ? 0.4 : 1;
// demo wheel behind the title
Game.st = P.newState({ seed: 7 });
for (const [s, cs] of [[0, [0, 1]], [1, [2]], [2, [1, 3, 3]], [3, [0]], [4, [3, 2]], [5, [1]]]) for (const c of cs) Game.st.grid[s].push({ id: Game.st.nextId++, c, kind: 'shard' });
// keep an open run alive across a republish in the viewer
try { const hot = window.claude && window.claude.hot; if (hot) { if (hot.snapshot) hot.snapshot(() => ({ save: Game.st && Game.playing && !Game.st.over ? P.serialize(Game.st) : null })); const d = hot.data; if (d && d.save) { Store.data.save = d.save; refreshTitle(); } } } catch (e) { /* viewer hook absent */ }
requestAnimationFrame(t => { Game.last = t; Game.loop(t); });
GK.studio();
const pywOpts = { className: 'btn alt', panel: { text: true, speed: true, music: true } };
$('pywT').replaceWith(GK.ui.prefsButton(pywOpts)); $('pywP').replaceWith(GK.ui.prefsButton(pywOpts));
Game.coach = GK.coach.create('prismwheel-first', [{ target: () => $('br'), text: 'Tap left or right to turn', done: () => !!Game.moved || Store.data.plays > 2 }],
  { when: () => Game.playing && !Game.paused && !!Game.st && !Game.st.over });
GK.wired('motion', 'game reduce-motion switch follows the kit level (shake, hitstop, vibration); zoom punch, shards, text pop scaled; still stops star drift and title spin');
GK.wired('flash', 'flare, ring-up and game-over flashes'); GK.wired('speed', 'sim clock: fall speed, spawn gaps, combo window');
GK.wired('text', 'page CSS floor and scale; canvas HUD (capped 125%), pop texts, banner subtitle; core numeral left as wheel art');
window.__prism = { Game, R, Store, Audio };
})();
