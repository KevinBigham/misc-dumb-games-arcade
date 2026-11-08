// ===================== KILNSHOT APP =====================
// State, Storage, Audio, Renderer, Input, UI. Rules live in core.js and never touch the DOM.
(function () {
'use strict';
const $ = (id) => document.getElementById(id);
const C = CONFIG;
const DEBUG = /[?&#]debug/.test(location.search + location.hash);

// ---------------- Storage ----------------
const SKEY = 'kilnshot.v1';
const Storage = {
  data: null,
  fresh() { return { v: 1, best: {}, cur: null, sound: true, daily: { cache: null, best: {}, fired: 0 }, seenHelp: false, debug: false }; },
  load() {
    let raw = null;
    try { raw = localStorage.getItem(SKEY); } catch (e) { raw = null; }
    let d = this.fresh();
    if (raw) {
      try { d = this.validate(JSON.parse(raw)); }
      catch (e) {
        // never silently destroy the only save: keep the broken copy beside the fresh one
        try { localStorage.setItem(SKEY + '.corrupt', raw); } catch (e2) {}
        d = this.fresh(); d.recovered = true;
      }
    }
    this.data = d; return d;
  },
  validate(o) {
    if (!o || typeof o !== 'object' || o.v !== 1) throw new Error('bad save');
    const d = this.fresh();
    const ids = new Set(LEVELS.map(l => l.id));
    if (o.best && typeof o.best === 'object') for (const k of Object.keys(o.best)) {
      const b = o.best[k]; if (!ids.has(k) || !b) continue;
      const stars = b.stars | 0, shots = b.shots | 0;
      if (stars >= 1 && stars <= 3 && shots >= 1 && shots < 100) d.best[k] = { stars, shots };
    }
    if (o.cur && typeof o.cur === 'object' && typeof o.cur.id === 'string' && Array.isArray(o.cur.shots)) {
      const okShots = o.cur.shots.length <= 20 && o.cur.shots.every(s => Array.isArray(s) && s.length === 2 && s.every(n => Number.isFinite(n) && Math.abs(n) <= C.MAXV));
      if (okShots && (ids.has(o.cur.id) || o.cur.id === 'daily')) d.cur = { id: o.cur.id, shots: o.cur.shots.map(s => [Math.round(s[0]), Math.round(s[1])]) };
    }
    d.sound = o.sound !== false;
    d.seenHelp = !!o.seenHelp; d.debug = !!o.debug;
    if (o.daily && typeof o.daily === 'object') {
      const c = o.daily.cache;
      if (c && typeof c.date === 'string' && c.level && validateLevel(c.level).ok) d.daily.cache = c;
      if (o.daily.best && typeof o.daily.best === 'object') for (const k of Object.keys(o.daily.best)) {
        const b = o.daily.best[k]; if (/^\d{4}-\d{2}-\d{2}$/.test(k) && b && (b.shots | 0) >= 1) d.daily.best[k] = { shots: b.shots | 0, par: b.par | 0 };
      }
      d.daily.fired = Object.keys(d.daily.best).length;
    }
    return d;
  },
  save() { try { localStorage.setItem(SKEY, JSON.stringify(this.data)); } catch (e) { /* private mode: play on without saving */ } },
};

// ---------------- Audio (WebAudio, generated; starts on first gesture) ----------------
const Audio = {
  ctx: null, master: null, noiseBuf: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended' && Storage.data.sound && !document.hidden) this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try {
      this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = Storage.data.sound ? 0.55 : 0; this.master.connect(this.ctx.destination);
      const n = this.ctx.sampleRate * 0.5; this.noiseBuf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const ch = this.noiseBuf.getChannelData(0); const r = makeRng(7); for (let i = 0; i < n; i++) ch[i] = r() * 2 - 1;
      // iOS unlock: play a silent blip inside the gesture
      const o = this.ctx.createOscillator(), g = this.ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(this.master); o.start(); o.stop(this.ctx.currentTime + 0.01);
    } catch (e) { this.ctx = null; }
  },
  ok() { return this.ctx && this.ctx.state === 'running' && Storage.data.sound; },
  setOn(on) { if (this.master) this.master.gain.value = on ? 0.55 : 0; if (this.ctx) { if (on && !document.hidden) this.ctx.resume().catch(() => {}); else if (!on) this.ctx.suspend().catch(() => {}); } },
  tone(freq, dur, type, vol, slideTo, delay) {
    if (!this.ok()) return; const t = this.ctx.currentTime + (delay || 0);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, freq, q, vol, type, delay) {
    if (!this.ok()) return; const t = this.ctx.currentTime + (delay || 0);
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf; const f = this.ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.02);
  },
  // pentatonic ladder so a chain climbs in pitch
  SCALE: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31, 33, 36],
  play(e) {
    switch (e.type) {
      case 'launch': this.noise(0.18, 900, 0.8, 0.25, 'bandpass'); this.tone(140, 0.12, 'sine', 0.3, 70); break;
      case 'tick': this.tone(900 + Math.min(600, e.s), 0.05, 'triangle', Math.min(0.18, e.s / 2500)); break;
      case 'clink': this.tone(e.kind === 'keeper' ? 1320 : 1560, 0.09, 'sine', 0.12); this.tone(2340, 0.06, 'sine', 0.05); break;
      case 'break': {
        if (e.kind === 'keeper') { this.noise(0.3, 1800, 0.7, 0.4); this.tone(196, 0.5, 'sawtooth', 0.12, 98); this.tone(233, 0.5, 'sawtooth', 0.08, 110); break; }
        const st = this.SCALE[Math.min(this.SCALE.length - 1, (e.chain || 1) - 1)];
        this.noise(0.14, 2600, 1.2, 0.35); this.noise(0.06, 5200, 2, 0.15);
        this.tone(392 * Math.pow(2, st / 12), 0.28, 'triangle', 0.22); this.tone(784 * Math.pow(2, st / 12), 0.16, 'sine', 0.06, null, 0.01);
        break;
      }
      case 'spring': this.tone(180, 0.22, 'sine', 0.2, 620); break;
      case 'clay': this.noise(0.12, 260, 0.9, 0.35, 'lowpass'); break;
      case 'latch': this.tone(330, 0.06, 'square', 0.08); this.tone(495, 0.08, 'square', 0.07, null, 0.07); break;
      case 'cut': this.noise(0.05, 6500, 3, 0.25, 'highpass'); break;
      case 'settle': this.tone(220, 0.08, 'sine', 0.08); break;
    }
  },
  win(stars) { const n = [523, 659, 784, 1047]; n.forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.18, null, i * 0.09)); if (stars === 3) this.tone(1319, 0.4, 'sine', 0.12, null, 0.4); },
  lose() { [392, 330, 262].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.16, null, i * 0.12)); },
};
document.addEventListener('visibilitychange', () => {
  if (!Audio.ctx) return;
  if (document.hidden) Audio.ctx.suspend().catch(() => {});
  else if (Storage.data && Storage.data.sound) Audio.ctx.resume().catch(() => {});
});

// ---------------- State ----------------
const S = {
  mode: 'title',       // title | play | shot | over
  level: null, levelIdx: -1, isDaily: false,
  world: null, shots: [],
  aim: null,           // {sx,sy,cx,cy} in world coords
  kbAim: { ax: 0.62, ay: -0.78, p: 0.62 },
  fx: [], texts: [], trails: new Map(), shake: 0, hitStop: 0, flash: 0,
  speed: 1, hold: false, acc: 0, last: 0, hintT: 0, result: null,
  dailyBuilding: false,
};

// ---------------- Renderer ----------------
const cv = $('cv'), ctx = cv.getContext('2d');
let scale = 1, dpr = 1, bg = null;
function fit() {
  const st = $('stage'); const r = st.getBoundingClientRect();
  const sw = Math.max(200, r.width - 8), sh = Math.max(300, r.height - 8);
  scale = Math.min(sw / C.W, sh / C.H);
  dpr = Math.min(3, window.devicePixelRatio || 1);
  cv.style.width = Math.round(C.W * scale) + 'px'; cv.style.height = Math.round(C.H * scale) + 'px';
  cv.width = Math.round(C.W * scale * dpr); cv.height = Math.round(C.H * scale * dpr);
  bg = null;
}
window.addEventListener('resize', fit);

function makeBg() {
  const c = document.createElement('canvas'); c.width = C.W * 2; c.height = C.H * 2; const g = c.getContext('2d'); g.scale(2, 2);
  const grd = g.createLinearGradient(0, 0, 0, C.H); grd.addColorStop(0, '#dcebee'); grd.addColorStop(1, '#bcd5da');
  g.fillStyle = grd; g.fillRect(0, 0, C.W, C.H);
  const r = makeRng(42);
  // plaster trowel marks
  for (let i = 0; i < 140; i++) {
    g.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(80,120,130,.06)';
    const x = r() * C.W, y = r() * C.H, w = 20 + r() * 60, h = 3 + r() * 7;
    g.beginPath(); g.ellipse(x, y, w, h, (r() - 0.5) * 0.3, 0, Math.PI * 2); g.fill();
  }
  // a high window of light
  g.fillStyle = 'rgba(255,255,240,.18)'; g.beginPath(); g.moveTo(230, 0); g.lineTo(330, 0); g.lineTo(200, C.H); g.lineTo(60, C.H); g.closePath(); g.fill();
  // floor: packed earth
  g.fillStyle = '#9a7a55'; g.fillRect(0, 628, C.W, 12); g.fillStyle = '#7c5f40'; g.fillRect(0, 628, C.W, 2);
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(60,40,20,.25)'; g.fillRect(r() * C.W, 631 + r() * 8, 2, 1); }
  return c;
}

function potPath(g, x, y, r, jar) {
  // a turned-pot silhouette that fits a circle of radius r
  g.beginPath();
  const nw = jar ? r * 0.62 : r * 0.42, top = y - r, neckY = y - r * 0.62;
  g.moveTo(x - nw, top + 1);
  g.quadraticCurveTo(x - nw * 0.9, neckY, x - r * 0.98, y - r * 0.05);
  g.quadraticCurveTo(x - r * 1.02, y + r * 0.78, x - r * 0.45, y + r * 0.98);
  g.lineTo(x + r * 0.45, y + r * 0.98);
  g.quadraticCurveTo(x + r * 1.02, y + r * 0.78, x + r * 0.98, y - r * 0.05);
  g.quadraticCurveTo(x + nw * 0.9, neckY, x + nw, top + 1);
  g.closePath();
}
function drawPot(g, p, t) {
  const { x, y, r } = p; const jar = p.n > 0;
  g.save();
  if (p.wob) { g.translate(x, y + r); g.rotate(Math.sin(t * 40) * p.wob * 0.08); g.translate(-x, -y - r); }
  // shadow
  g.fillStyle = 'rgba(30,42,51,.18)'; g.beginPath(); g.ellipse(x + 2, y + r + 1, r * 0.8, 3, 0, 0, Math.PI * 2); g.fill();
  potPath(g, x, y, r, jar);
  if (p.kind === 'keeper') {
    const gr = g.createLinearGradient(x - r, y - r, x + r, y + r); gr.addColorStop(0, '#3e66cc'); gr.addColorStop(1, '#16347f');
    g.fillStyle = gr; g.fill(); g.lineWidth = 2; g.strokeStyle = '#0c1d4a'; g.stroke();
    // white brush band + gloss
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2.2; g.beginPath();
    g.moveTo(x - r * 0.8, y + r * 0.15); g.bezierCurveTo(x - r * 0.3, y - r * 0.2, x + r * 0.2, y + r * 0.5, x + r * 0.82, y + r * 0.1); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(x - r * 0.45, y - r * 0.25, r * 0.16, r * 0.3, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e8b84a'; g.fillRect(x - r * (jar ? 0.62 : 0.42), y - r, r * (jar ? 1.24 : 0.84), 2.5);
  } else if (p.hard) {
    const gr = g.createLinearGradient(x, y - r, x, y + r); gr.addColorStop(0, '#8fbf95'); gr.addColorStop(1, '#4a7a55');
    g.fillStyle = gr; g.fill(); g.lineWidth = 3.5; g.strokeStyle = '#2b4a33'; g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5; potPath(g, x, y, r * 0.78, jar); g.stroke();
    // thick drips
    g.fillStyle = '#5f9168'; for (let i = -1; i <= 1; i++) { g.beginPath(); g.ellipse(x + i * r * 0.45, y + r * 0.55, 2.2, 4.5, 0, 0, Math.PI * 2); g.fill(); }
    drawCrack(g, x, y, r, '#203826');
  } else {
    g.fillStyle = '#ead7b9'; g.fill(); g.lineWidth = 2; g.strokeStyle = '#7a5a3a'; g.stroke();
    g.fillStyle = 'rgba(160,110,70,.18)'; g.beginPath(); g.ellipse(x + r * 0.35, y + r * 0.3, r * 0.45, r * 0.5, 0, 0, Math.PI * 2); g.fill();
    drawCrack(g, x, y, r, '#6b2f1d');
  }
  if (jar) {
    // glowing embers in the mouth
    const glow = 0.6 + 0.4 * Math.sin(t * 5 + p.id);
    g.fillStyle = `rgba(255,${150 + 60 * glow | 0},40,.95)`; g.beginPath(); g.ellipse(x, y - r + 2, r * 0.5, 3.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,190,60,.25)'; g.beginPath(); g.arc(x, y - r, r * 0.8, Math.PI, 0); g.fill();
    // ember count badge, readable at phone size
    const bx = x + r * 0.78, by = y - r * 0.55;
    g.fillStyle = '#1e2a33'; g.beginPath(); g.arc(bx, by, 7.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffc93d'; g.lineWidth = 1.5; g.stroke();
    g.fillStyle = '#ffe9a8'; g.font = '800 10px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(p.n), bx, by + 0.5); g.textBaseline = 'alphabetic';
  }
  g.restore();
}
function drawCrack(g, x, y, r, col) {
  g.strokeStyle = col; g.lineWidth = 1.6; g.beginPath();
  g.moveTo(x - r * 0.15, y - r * 0.85); g.lineTo(x + r * 0.1, y - r * 0.45); g.lineTo(x - r * 0.12, y - r * 0.1); g.lineTo(x + r * 0.2, y + r * 0.3);
  g.moveTo(x + r * 0.1, y - r * 0.45); g.lineTo(x + r * 0.42, y - r * 0.3); g.stroke();
}

function drawSeg(g, s, w, t) {
  const solid = !s.gate || w.gates[s.gate];
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1, L = Math.hypot(dx, dy); if (L < 1) return;
  g.save(); g.translate(s.x1, s.y1); g.rotate(Math.atan2(dy, dx));
  const H = C.SEG_HALF * 2 + 2;
  if (s.gate) {
    if (solid) {
      g.fillStyle = '#8a4b2a'; g.fillRect(-2, -H / 2 - 1, L + 4, H + 2); g.fillStyle = '#b06a3e';
      for (let i = 0; i < L; i += 10) g.fillRect(i + 1, -H / 2, 8, H);
      g.fillStyle = '#e8b84a'; g.font = '800 9px system-ui'; g.textAlign = 'center'; g.save(); g.translate(L / 2, 3); if (Math.abs(dy) > Math.abs(dx)) g.rotate(-Math.PI / 2); g.fillText(s.gate, 0, 0); g.restore();
    } else { g.setLineDash([4, 5]); g.strokeStyle = 'rgba(138,75,42,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(L, 0); g.stroke(); g.setLineDash([]); }
  } else if (s.mat === 'spring') {
    g.fillStyle = '#5d8a32'; g.fillRect(0, -H / 2, L, H); g.fillStyle = '#9cc65a';
    for (let i = 2; i < L; i += 6) g.fillRect(i, -H / 2 + 1, 3, H - 2);
    const bob = Math.sin(t * 9) * 0.8 * GK.prefs.motionScale(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, -H / 2 + bob, L, 1.5);
  } else if (s.mat === 'clay') {
    g.fillStyle = '#5a3a24'; g.fillRect(0, -H / 2, L, H); g.fillStyle = 'rgba(255,230,200,.35)';
    for (let i = 3; i < L; i += 11) { g.beginPath(); g.ellipse(i, -1, 2.5, 1.2, 0, 0, Math.PI * 2); g.fill(); }
  } else {
    // ochre wooden shelf
    g.fillStyle = '#8d5d22'; g.fillRect(-1, -H / 2, L + 2, H); g.fillStyle = '#c58b3c'; g.fillRect(-1, -H / 2, L + 2, H - 3);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-1, -H / 2, L + 2, 1.2);
  }
  g.restore();
}

function render(now) {
  const t = now / 1000;
  if (!bg) bg = makeBg();
  const g = ctx; g.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
  let sx = 0, sy = 0; if (S.shake > 0.3) { const r = S.shake; sx = (Math.random() - 0.5) * r; sy = (Math.random() - 0.5) * r; }
  g.save(); g.translate(sx, sy);
  g.drawImage(bg, 0, 0, C.W, C.H);
  const w = S.world;
  if (w) {
    // bellows air
    for (const f of w.fans) {
      g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(f.x, f.y, f.w, f.h);
      g.strokeStyle = 'rgba(70,120,190,.35)'; g.lineWidth = 1.2; const sp = Math.hypot(f.ax, f.ay) || 1, ux = f.ax / sp, uy = f.ay / sp;
      g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip();
      for (let i = 0; i < 18; i++) {
        const ph = ((t * 0.9 + i * 0.37) % 1); const px = f.x + ((i * 53) % f.w) + ux * ph * (f.w + f.h) * 0.6, py = f.y + ((i * 97) % f.h) + uy * ph * (f.w + f.h) * 0.6;
        const qx = f.x + ((px - f.x) % f.w + f.w) % f.w, qy = f.y + ((py - f.y) % f.h + f.h) % f.h;
        g.beginPath(); g.moveTo(qx, qy); g.lineTo(qx - ux * 12, qy - uy * 12); g.stroke();
      }
      g.restore();
    }
    for (const s of w.segs) if (!s.frame) drawSeg(g, s, w, t);
    if (w.level.floor === 'clay') drawSeg(g, { x1: 0, y1: 628, x2: C.W, y2: 628, mat: 'clay' }, w, t);
    // cords
    for (const p of w.pots) if (p.cord && !p.broken) {
      g.strokeStyle = '#7a5a3a'; g.lineWidth = 1.6; g.setLineDash([3, 2]); g.beginPath(); g.moveTo(p.cord.ax, p.cord.ay); g.lineTo(p.x, p.y - p.r); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#5a4030'; g.beginPath(); g.arc(p.cord.ax, p.cord.ay, 3, 0, Math.PI * 2); g.fill();
    }
    for (const p of w.pegs) { g.fillStyle = '#6f8790'; g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.35, 0, Math.PI * 2); g.fill(); }
    for (const l of w.latches) {
      const spin = l.flips * Math.PI / 2;
      g.save(); g.translate(l.x, l.y); g.fillStyle = '#d7a227'; g.beginPath(); g.arc(0, 0, l.r, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#6b4c0c'; g.lineWidth = 2; g.stroke();
      g.rotate(spin); g.strokeStyle = '#6b4c0c'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(-l.r * 0.55, 0); g.lineTo(l.r * 0.55, 0); g.moveTo(0, -l.r * 0.55); g.lineTo(0, l.r * 0.55); g.stroke();
      g.restore(); g.fillStyle = '#4a3508'; g.font = '800 9px system-ui'; g.textAlign = 'center'; g.fillText(l.t.join(''), l.x, l.y - l.r - 3);
    }
    for (const p of w.pots) if (!p.broken) drawPot(g, p, t);
    // kiln + sling
    drawKiln(g, w.sling.x, w.sling.y, t);
    // aim
    if (S.mode === 'play' && S.aim) drawAim(g, w);
    else if (S.mode === 'play' && !S.aim && embersLeft() > 0) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4); g.fillStyle = `rgba(255,200,80,${0.25 + pulse * 0.3})`; g.beginPath(); g.arc(w.sling.x, w.sling.y, C.BEAD_R + 6 + pulse * 3, 0, Math.PI * 2); g.fill();
      drawEmber(g, w.sling.x, w.sling.y, C.BEAD_R, t);
    }
    // trails + beads
    for (const b of w.beads) {
      if (!b.alive) continue;
      let tr = S.trails.get(b.id); if (!tr) { tr = []; S.trails.set(b.id, tr); }
      tr.push([b.x, b.y]); if (tr.length > 10) tr.shift();
      for (let i = 0; i < tr.length; i++) { const a = i / tr.length; g.fillStyle = `rgba(255,${120 + 80 * a | 0},40,${a * 0.45})`; g.beginPath(); g.arc(tr[i][0], tr[i][1], C.BEAD_R * (0.4 + 0.5 * a), 0, Math.PI * 2); g.fill(); }
      drawEmber(g, b.x, b.y, b.stuck ? C.BEAD_R * (1 - b.stuck / C.CLAY_COOL * 0.7) : C.BEAD_R, t);
    }
    if (DEBUG || Storage.data.debug) drawDebug(g, w);
  }
  // particles
  for (const f of S.fx) {
    g.save(); g.globalAlpha = Math.max(0, Math.min(1, f.life / f.max * 1.5));
    if (f.k === 'shard') { g.translate(f.x, f.y); g.rotate(f.a); g.fillStyle = f.c; g.beginPath(); g.moveTo(-f.s, -f.s * 0.6); g.lineTo(f.s, -f.s * 0.2); g.lineTo(-f.s * 0.2, f.s * 0.8); g.closePath(); g.fill(); }
    else if (f.k === 'spark') { g.fillStyle = f.c; g.fillRect(f.x - 1, f.y - 1, 2.4, 2.4); }
    else if (f.k === 'ring') { g.strokeStyle = f.c; g.lineWidth = 2; g.beginPath(); g.arc(f.x, f.y, f.s * (1 - f.life / f.max) + 4, 0, Math.PI * 2); g.stroke(); }
    g.restore();
  }
  for (const tx of S.texts) {
    g.save(); g.globalAlpha = Math.min(1, tx.life * 2); g.font = `900 ${GK.ui.floor(tx.size) / Math.min(1, scale)}px ${'system-ui'}`; g.textAlign = 'center';
    g.lineWidth = 4; g.strokeStyle = '#1e2a33'; g.strokeText(tx.s, tx.x, tx.y); g.fillStyle = tx.c; g.fillText(tx.s, tx.x, tx.y); g.restore();
  }
  g.restore();
  if (S.flash > 0) { g.fillStyle = `rgba(255,240,200,${S.flash * 0.5})`; g.fillRect(0, 0, C.W, C.H); }
}
function drawEmber(g, x, y, r, t) {
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 1.6);
  gr.addColorStop(0, '#fff6c8'); gr.addColorStop(0.35, '#ffc93d'); gr.addColorStop(0.7, '#ff6a1f'); gr.addColorStop(1, 'rgba(200,50,10,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.6, 0, Math.PI * 2); g.fill();
}
function drawKiln(g, x, y, t) {
  const by = y + 14;
  g.save();
  g.fillStyle = '#7d4a33'; g.beginPath(); g.moveTo(x - 26, by + 40); g.lineTo(x - 26, by + 12); g.quadraticCurveTo(x - 24, by - 6, x, by - 8); g.quadraticCurveTo(x + 24, by - 6, x + 26, by + 12); g.lineTo(x + 26, by + 40); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,20,10,.35)'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x - 26, by + 4 + i * 8); g.lineTo(x + 26, by + 4 + i * 8); g.stroke(); }
  const fl = 0.7 + 0.3 * Math.sin(t * 11) * Math.sin(t * 7.3);
  g.fillStyle = `rgba(255,${130 + 70 * fl | 0},40,1)`; g.beginPath(); g.arc(x, by + 24, 9, Math.PI, 0); g.lineTo(x + 9, by + 34); g.lineTo(x - 9, by + 34); g.closePath(); g.fill();
  // cradle prongs
  g.strokeStyle = '#3a2a20'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 8, by - 6); g.lineTo(x - 11, y - 4); g.moveTo(x + 8, by - 6); g.lineTo(x + 11, y - 4); g.stroke();
  g.restore();
}
function drawAim(g, w) {
  const a = S.aim; const v = pullToLaunch(a.cx - a.sx, a.cy - a.sy);
  const pullLen = Math.hypot(a.cx - a.sx, a.cy - a.sy); const ok = pullLen >= C.MIN_PULL;
  const sp = Math.hypot(v[0], v[1]), frac = sp / C.MAXV;
  // band from cradle to pulled-back ember
  const bx = w.sling.x - v[0] / C.MAXV * 26, by = w.sling.y - v[1] / C.MAXV * 26;
  g.strokeStyle = '#3a2a20'; g.lineWidth = 2; g.beginPath(); g.moveTo(w.sling.x - 11, w.sling.y - 4); g.lineTo(bx, by); g.lineTo(w.sling.x + 11, w.sling.y - 4); g.stroke();
  if (ok) {
    const ch = S.level && S.level.ch; const pts = preview(w, v[0], v[1], ch === 1 ? 0.75 : ch === 2 ? 0.55 : 0); // longer guide while learning
    for (let i = 0; i < pts.length; i++) { const f = 1 - i / pts.length; g.fillStyle = `rgba(30,42,51,${0.25 + 0.55 * f})`; g.beginPath(); g.arc(pts[i][0], pts[i][1], 2.4 + f * 1.4, 0, Math.PI * 2); g.fill(); }
    // power ring
    g.strokeStyle = frac > 0.97 ? '#b2321f' : '#1e2a33'; g.lineWidth = 3; g.beginPath(); g.arc(w.sling.x, w.sling.y, 18, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); g.stroke();
  }
  drawEmber(g, bx, by, C.BEAD_R, 0);
  // finger anchor
  g.strokeStyle = 'rgba(30,42,51,.25)'; g.lineWidth = 1.5; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(a.cx, a.cy); g.stroke(); g.setLineDash([]);
  g.fillStyle = ok ? 'rgba(30,42,51,.25)' : 'rgba(178,50,31,.25)'; g.beginPath(); g.arc(a.sx, a.sy, 6, 0, Math.PI * 2); g.fill();
}
function drawDebug(g, w) {
  g.save(); g.strokeStyle = 'rgba(200,0,120,.6)'; g.lineWidth = 0.8;
  for (const s of w.segs) { if (s.gate && !w.gates[s.gate]) continue; g.beginPath(); g.moveTo(s.x1, s.y1); g.lineTo(s.x2, s.y2); g.stroke(); }
  for (const p of w.pots) if (!p.broken) { g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.stroke(); }
  for (const b of w.beads) if (b.alive) { g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + b.vx * 0.05, b.y + b.vy * 0.05); g.stroke(); }
  g.fillStyle = 'rgba(200,0,120,.9)'; g.font = '10px ui-monospace,monospace'; g.textAlign = 'left';
  const last = S.shots[S.shots.length - 1];
  g.fillText(`steps ${w.steps} beads ${w.beads.filter(b => b.alive).length} chain ${w.chain} last ${last ? last.join(',') : '-'} board ${boardKey(w).slice(0, 40)}`, 4, 12);
  if (S.level && S.level.proof) g.fillText('kiln proof: ' + JSON.stringify(S.level.proof), 4, 24);
  g.restore();
}

// ---------------- FX from rule events ----------------
const SHARD = { second: ['#ead7b9', '#d9bd94', '#7a5a3a'], keeper: ['#2448a8', '#3e66cc', '#ffffff'], hard: ['#6f9c78', '#8fbf95', '#2b4a33'] };
function handleEvents(w) {
  for (const e of w.events) {
    Audio.play(e);
    if (e.type === 'break') {
      const p = w.pots[e.id]; const pal = e.kind === 'keeper' ? SHARD.keeper : p && p.hard ? SHARD.hard : SHARD.second;
      const ms = GK.prefs.motionScale(), nSh = Math.round(14 * ms), nSp = Math.round(8 * ms);
      for (let i = 0; i < nSh; i++) S.fx.push({ k: 'shard', x: e.x, y: e.y, vx: (Math.random() - 0.5) * 320, vy: -Math.random() * 260 - 40, a: Math.random() * 6, va: (Math.random() - 0.5) * 20, s: 2.5 + Math.random() * 3.5, c: pal[i % 3], life: 1.1, max: 1.1, g: 1 });
      for (let i = 0; i < nSp; i++) S.fx.push({ k: 'spark', x: e.x, y: e.y, vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220, c: '#ffc93d', life: 0.4, max: 0.4, g: 0 });
      S.fx.push({ k: 'ring', x: e.x, y: e.y, s: 30, c: e.kind === 'keeper' ? '#b2321f' : '#ffb340', life: 0.35, max: 0.35, g: 0 });
      S.shake = Math.min(9, S.shake + (2.5 + e.chain * 0.6) * ms); S.hitStop = Math.min(0.09, 0.03 + e.chain * 0.008);
      if (e.kind === 'keeper') { S.texts.push({ s: 'Keeper cracked!', x: Math.max(70, Math.min(290, e.x)), y: e.y - 24, size: 18, c: '#ffb3a6', life: 1.6, vy: -14 }); S.flash = GK.flash.allow(0.6); }
      else if (e.chain >= 2) S.texts = S.texts.filter(x => !x.chain), S.texts.push({ chain: 1, s: 'Chain ×' + e.chain, x: Math.max(50, Math.min(310, e.x)), y: e.y - 22, size: 14 + Math.min(10, e.chain * 1.5), c: '#ffd04a', life: 1.1, vy: -30 });
    } else if (e.type === 'clink') { const p = w.pots[e.id]; if (p) p.wob = 1; }
    else if (e.type === 'spring') { S.fx.push({ k: 'ring', x: e.x, y: e.y, s: 18, c: '#9cc65a', life: 0.3, max: 0.3, g: 0 }); }
    else if (e.type === 'clay') { for (let i = 0, n = Math.round(6 * GK.prefs.motionScale()); i < n; i++) S.fx.push({ k: 'spark', x: e.x, y: e.y, vx: (Math.random() - 0.5) * 90, vy: -Math.random() * 90, c: '#5a3a24', life: 0.5, max: 0.5, g: 1 }); }
    else if (e.type === 'cut') { S.fx.push({ k: 'ring', x: e.x, y: e.y, s: 12, c: '#7a5a3a', life: 0.25, max: 0.25, g: 0 }); }
    else if (e.type === 'latch') { S.fx.push({ k: 'ring', x: e.x, y: e.y, s: 24, c: '#d7a227', life: 0.35, max: 0.35, g: 0 }); S.shake = Math.min(6, S.shake + 1.5 * GK.prefs.motionScale()); }
    else if (e.type === 'tick' && e.s > 300) { S.shake = Math.min(4, S.shake + 0.6 * GK.prefs.motionScale()); }
  }
  w.events.length = 0;
}
function tickFx(dt) {
  for (const f of S.fx) { f.life -= dt; f.x += f.vx * dt || 0; f.y += f.vy * dt || 0; if (f.g) f.vy += 700 * dt; if (f.va) f.a += f.va * dt; }
  S.fx = S.fx.filter(f => f.life > 0);
  for (const t of S.texts) { t.life -= dt; t.y += t.vy * dt; }
  S.texts = S.texts.filter(t => t.life > 0);
  S.shake *= Math.pow(0.0015, dt); S.flash = Math.max(0, S.flash - dt * 1.5);
  if (S.world) for (const p of S.world.pots) if (p.wob) { p.wob -= dt * 2.5; if (p.wob < 0) p.wob = 0; }
}

// ---------------- Game flow ----------------
function embersLeft() { return S.level ? embersFor(S.level) - S.shots.length : 0; }
function levelLabel(l) { return l.ch ? l.ch + '-' + (LEVELS.filter(x => x.ch === l.ch).indexOf(l) + 1) : 'Daily'; }
function unlockedIdx() { // cleared levels plus the next two
  let n = 0; for (let i = 0; i < LEVELS.length; i++) if (Storage.data.best[LEVELS[i].id]) n = i + 1;
  let open = 0, out = new Set(); for (let i = 0; i < LEVELS.length; i++) { if (Storage.data.best[LEVELS[i].id]) out.add(i); else if (open < 2 && i <= n + 1) { out.add(i); open++; } }
  return out;
}
function startLevel(lvl, shots, daily) {
  S.level = lvl; S.isDaily = !!daily; S.levelIdx = daily ? -1 : LEVELS.indexOf(lvl);
  S.shots = (shots || []).slice(); S.world = replay(lvl, S.shots); S.world.shots = S.shots.length;
  S.aim = null; S.fx = []; S.texts = []; S.trails.clear(); S.result = null; S.mode = 'play';
  Storage.data.cur = { id: daily ? 'daily' : lvl.id, shots: S.shots }; Storage.save();
  hideOverlay(); updateHud();
  showHint(S.shots.length === 0);
  checkOver(true);
}
function retry() { if (!S.level || S.mode === 'title' || S.dailyBuilding) return; startLevel(S.level, [], S.isDaily); toast(''); }
function fire(vx, vy) {
  if (S.mode !== 'play' || embersLeft() <= 0) return;
  const v = clampLaunch(vx, vy);
  S.shots.push(v); Storage.data.cur = { id: S.isDaily ? 'daily' : S.level.id, shots: S.shots }; Storage.save(); // commit before resolving
  launch(S.world, v[0], v[1]); S.mode = 'shot'; S.acc = 0; S.aim = null; S.trails.clear();
  hideHint(); updateHud();
}
function finishShot() {
  endShot(S.world); S.world.events.length = 0; S.mode = 'play'; updateHud(); checkOver(false);
}
function checkOver(silent) {
  const w = S.world;
  if (w.keeperBroken) return over('keeper', silent);
  if (secondsLeft(w) === 0) return over('won', silent);
  if (embersLeft() <= 0) return over('spent', silent);
}
function over(kind, silent) {
  S.mode = 'over'; const shots = S.shots.length; const lvl = S.level;
  let stars = 0, newBest = false;
  if (kind === 'won') {
    stars = starsFor(lvl, shots);
    if (S.isDaily) {
      const b = Storage.data.daily.best[lvl.date];
      if (!b || shots < b.shots) { Storage.data.daily.best[lvl.date] = { shots, par: lvl.par }; newBest = true; }
      Storage.data.daily.fired = Object.keys(Storage.data.daily.best).length;
    } else {
      const b = Storage.data.best[lvl.id];
      if (!b || stars > b.stars || shots < b.shots) { Storage.data.best[lvl.id] = { stars: Math.max(stars, b ? b.stars : 0), shots: Math.min(shots, b ? b.shots : 99) }; newBest = true; }
    }
    Storage.save();
  }
  Storage.data.cur = null; Storage.save(); // a finished attempt is never resumed
  S.result = { kind, stars, shots, newBest };
  const delay = silent ? 0 : (kind === 'won' ? 650 : 900);
  setTimeout(() => { if (S.mode === 'over' && S.result && S.result.kind === kind) { showResult(); if (!silent) kind === 'won' ? Audio.win(stars) : Audio.lose(); } }, delay);
}

// ---------------- Main loop ----------------
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - (S.last || now)) / 1000); S.last = now;
  if (S.mode === 'shot' && S.world) {
    if (S.hitStop > 0) S.hitStop -= dt;
    else {
      S.acc += dt * (S.hold ? 3 : 1);
      let n = 0;
      while (S.acc >= C.DT && n < 240) { step(S.world); S.acc -= C.DT; n++; if (S.world.events.length) { handleEvents(S.world); if (S.hitStop > 0) { S.acc = 0; break; } } if (shotOver(S.world)) { finishShot(); break; } }
    }
  }
  tickFx(dt);
  if (S.hintT > 0) { S.hintT -= dt; if (S.hintT <= 0) hideHint(); }
  render(now);
}

// ---------------- Input ----------------
function toWorld(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
let pid = null;
const stage = $('stage');
stage.addEventListener('pointerdown', (e) => {
  Audio.init();
  if (!$('ov').hidden) return;
  if (S.mode === 'shot') { S.hold = true; return; }
  if (S.mode !== 'play' || embersLeft() <= 0) return;
  if (e.target !== cv && e.target !== stage) return;
  pid = e.pointerId; try { stage.setPointerCapture(e.pointerId); } catch (er) {}
  const p = toWorld(e); S.aim = { sx: p[0], sy: p[1], cx: p[0], cy: p[1] };
  e.preventDefault();
});
stage.addEventListener('pointermove', (e) => {
  if (!S.aim || e.pointerId !== pid) return; const p = toWorld(e); S.aim.cx = p[0]; S.aim.cy = p[1]; e.preventDefault();
});
function endAim(e, cancel) {
  S.hold = false;
  if (!S.aim || (e && e.pointerId !== pid)) return; pid = null;
  const a = S.aim; S.aim = null;
  if (cancel) return;
  const dx = a.cx - a.sx, dy = a.cy - a.sy;
  if (Math.hypot(dx, dy) < C.MIN_PULL) { toast('Pull farther back to throw'); return; }
  const v = pullToLaunch(dx, dy); fire(v[0], v[1]);
}
stage.addEventListener('pointerup', (e) => endAim(e, false));
stage.addEventListener('pointercancel', (e) => endAim(e, true));
window.addEventListener('blur', () => { S.aim = null; S.hold = false; });

window.addEventListener('keydown', (e) => {
  if (document.querySelector('.gk-prefs')) return;
  Audio.init();
  const k = e.key;
  if (!$('ov').hidden) {
    if (k === 'Escape' && S.level && S.mode !== 'title') { if (S.mode === 'over') return; hideOverlay(); }
    return;
  }
  if (k === 'r' || k === 'R') { retry(); return; }
  if (k === 'Escape' || k === 'm' || k === 'M') { showSelect(); return; }
  if (k === 'h' || k === '?') { showHint(true); return; }
  if (S.mode === 'shot' && (k === ' ' || k === 'Enter')) { S.hold = true; e.preventDefault(); return; }
  if (S.mode !== 'play') return;
  const A = S.kbAim; let ang = Math.atan2(A.ay, A.ax), used = true;
  if (k === 'ArrowLeft') ang -= e.shiftKey ? 0.004 : 0.03; else if (k === 'ArrowRight') ang += e.shiftKey ? 0.004 : 0.03;
  else if (k === 'ArrowUp') A.p = Math.min(1, A.p + (e.shiftKey ? 0.004 : 0.025)); else if (k === 'ArrowDown') A.p = Math.max(0.1, A.p - (e.shiftKey ? 0.004 : 0.025));
  else if (k === ' ' || k === 'Enter') { const v = [A.ax * A.p * C.MAXV, A.ay * A.p * C.MAXV]; S.aim = null; fire(v[0], v[1]); e.preventDefault(); return; }
  else used = false;
  if (used) {
    e.preventDefault(); A.ax = Math.cos(ang); A.ay = Math.sin(ang);
    const w = S.world, L = A.p * C.MAXV / C.POWER; // show it as a pull from the sling
    S.aim = { sx: w.sling.x, sy: w.sling.y, cx: w.sling.x - A.ax * L, cy: w.sling.y - A.ay * L, kb: true };
  }
});
window.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') S.hold = false; });

// ---------------- UI ----------------
function updateHud() {
  const l = S.level; if (!l) { $('hName').textContent = 'Kilnshot'; $('hEmbers').innerHTML = ''; $('hPar').textContent = ''; return; }
  $('hName').innerHTML = `<small>${levelLabel(l)}</small>${esc(l.name)}`;
  const tot = embersFor(l), used = S.shots.length; let h = '';
  for (let i = 0; i < tot; i++) h += `<i class="${i < used ? 'spent' : ''}"></i>`;
  $('hEmbers').innerHTML = h; $('hPar').textContent = 'PAR ' + l.par;
  $('bSound').setAttribute('aria-label', Storage.data.sound ? 'Sound on' : 'Sound off'); $('bSound').style.opacity = Storage.data.sound ? 1 : 0.45;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function showHint(force) { if (!S.level) return; const h = $('hint'); h.textContent = S.level.hint; h.classList.remove('off'); S.hintT = force ? 6 : 4; }
function hideHint() { $('hint').classList.add('off'); S.hintT = 0; }
let toastT = 0;
function toast(s) { const t = $('toast'); t.textContent = s; t.style.opacity = s ? 1 : 0; clearTimeout(toastT); if (s) toastT = setTimeout(() => { t.style.opacity = 0; }, 1600); }
function showOverlay(html) { $('card').innerHTML = html; $('ov').hidden = false; const b = $('card').querySelector('button.primary') || $('card').querySelector('button'); if (b) try { b.focus({ preventScroll: true }); } catch (e) {} }
function hideOverlay() { $('ov').hidden = true; }
function totalStars() { let s = 0; for (const k in Storage.data.best) s += Storage.data.best[k].stars; return s; }
function nextUnbeaten() { for (let i = 0; i < LEVELS.length; i++) if (!Storage.data.best[LEVELS[i].id]) return i; return LEVELS.length - 1; }
function on(id, f) { const el = $(id); if (el) el.onclick = (e) => { Audio.init(); f(e); }; }

const PYW = { panel: { text: true, tips: false } };
function showTitle() {
  S.mode = 'title';
  const cur = Storage.data.cur; const resumable = cur && cur.shots.length > 0 && cur.id !== 'daily' && LEVELS.find(l => l.id === cur.id);
  showOverlay(`
    <h1>KILN<br>SHOT</h1>
    <p><b>Smash the cracked pots. Spare the good ones.</b></p>
    <div class="how">
      <b style="background:radial-gradient(circle at 40% 35%,#fff6c8,#ffc93d 40%,#ff6a1f 75%)"></b><span>Drag back anywhere, aim, let go to throw an ember.</span>
      <b style="background:#ead7b9;border:2px solid #7a5a3a"></b><span>Cracked bisque pots: break them all.</span>
      <b style="background:#2448a8;border:2px solid #0c1d4a"></b><span>Blue keepers: one crack and the firing fails.</span>
      <b style="background:#c58b3c;border:2px solid #8d5d22"></b><span>Fewest throws earns 3 stars. Hold the screen to speed up a throw.</span>
    </div>
    <div class="col">
      <button class="primary" id="tPlay">${resumable ? 'Continue' : (totalStars() ? 'Play' : 'Start firing')}</button>
      <div class="row"><button id="tLevels">Levels</button><button id="tDaily">Daily kiln</button></div>
    </div>
    <p class="tiny">${totalStars()} of ${LEVELS.length * 3} stars${Storage.data.daily.fired ? ' · ' + Storage.data.daily.fired + ' daily firings' : ''}${Storage.data.recovered ? ' · your old save could not be read, so it was set aside and a fresh one started' : ''}</p>`);
  on('tPlay', () => { if (resumable) startLevel(LEVELS.find(l => l.id === cur.id), cur.shots); else startLevel(LEVELS[nextUnbeaten()]); });
  on('tLevels', showSelect); on('tDaily', startDaily);
  $('card').querySelector('.col').appendChild(GK.ui.prefsButton(PYW));
}
function showSelect() {
  if (S.mode === 'shot') return;
  const open = unlockedIdx(); let h = `<h2>Levels</h2><p class="sub">${totalStars()} of ${LEVELS.length * 3} stars. Clear a level to open the next ones. ◆ means you beat the kiln’s par.</p>`;
  for (const ch of CHAPTERS) {
    h += `<div class="chap"><h3>${ch.n}. ${esc(ch.name)}</h3><p>${esc(ch.idea)}</p><div class="tiles">`;
    LEVELS.forEach((l, i) => {
      if (l.ch !== ch.n) return; const b = Storage.data.best[l.id]; const lk = !open.has(i);
      h += `<button data-i="${i}" class="${lk ? 'locked' : ''}" ${lk ? 'aria-disabled="true"' : ''}>${levelLabel(l)}<span>${esc(l.name)}</span><em>${b ? '★'.repeat(b.stars) + '<span style="color:#c8d4d6">' + '★'.repeat(3 - b.stars) + '</span>' + (b.shots < l.par ? '<span style="color:#ff6a1f" aria-label="beat par"> ◆</span>' : '') : (lk ? 'locked' : '· · ·')}</em></button>`;
    });
    h += '</div></div>';
  }
  h += `<div class="row"><button id="sBack">Back</button><button id="sDaily">Daily kiln</button></div>
    <div class="row"><button id="sDebug" style="font-size:calc(max(12px,12px) * var(--gk-text-scale,1));min-height:36px">${Storage.data.debug ? 'Hide' : 'Show'} physics overlay</button></div>`;
  showOverlay(h);
  $('card').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => {
    Audio.init(); const i = +b.dataset.i; if (!open.has(i)) { b.textContent = 'Clear an earlier level first'; return; }
    const l = LEVELS[i]; const cur = Storage.data.cur; startLevel(l, cur && cur.id === l.id ? cur.shots : []);
  });
  on('sBack', () => { if (S.level && S.mode !== 'title' && S.mode !== 'over') hideOverlay(); else showTitle(); });
  on('sDaily', startDaily);
  on('sDebug', () => { Storage.data.debug = !Storage.data.debug; Storage.save(); showSelect(); });
  $('sDebug').parentNode.insertBefore(GK.ui.prefsButton(PYW), $('sDebug'));
}
function starsHtml(n) { return `<div class="stars" aria-label="${n} of 3 stars">${'★'.repeat(n)}<span class="dim">${'★'.repeat(3 - n)}</span></div>`; }
function showResult() {
  const r = S.result, l = S.level;
  if (r.kind === 'won') {
    const beat = r.shots < l.par;
    let h = `<h2>${beat ? 'Master firing!' : r.stars === 3 ? 'Clean firing!' : 'Fired!'}</h2>${starsHtml(r.stars)}
      <p>${r.shots} ${r.shots === 1 ? 'throw' : 'throws'} · par ${l.par}${beat ? ' · you beat the kiln’s par' : ''}</p>`;
    if (S.isDaily) {
      const share = `Kilnshot daily ${l.date}\n${r.shots} ${r.shots === 1 ? 'throw' : 'throws'} (par ${l.par}) ${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}`;
      h += `<div class="share" id="shareTxt">${esc(share)}</div><div class="row"><button id="rCopy">Copy result</button><button class="primary" id="rRetry">Fire again</button></div><div class="row"><button id="rLevels">Levels</button></div>`;
      showOverlay(h);
      on('rCopy', () => { const t = $('shareTxt').textContent; const done = () => { $('rCopy').textContent = 'Copied'; };
        try { navigator.clipboard.writeText(t).then(done, () => selectText($('shareTxt'))); } catch (e) { selectText($('shareTxt')); } });
    } else {
      const hasNext = S.levelIdx < LEVELS.length - 1;
      h += `<div class="row"><button id="rRetry">Retry</button>${hasNext ? '<button class="primary" id="rNext">Next level</button>' : '<button class="primary" id="rLevels2">All levels</button>'}</div><div class="row"><button id="rLevels">Levels</button></div>`;
      if (!hasNext) h += `<p class="sub">That was the last firing. Try the daily kiln for a new level every day.</p>`;
      showOverlay(h);
      on('rNext', () => startLevel(LEVELS[S.levelIdx + 1])); on('rLevels2', showSelect);
    }
  } else {
    const msg = r.kind === 'keeper' ? ['A keeper cracked', 'The blue pots are good work. Find a line that misses them.'] : ['Out of embers', `${secondsLeft(S.world)} cracked ${secondsLeft(S.world) === 1 ? 'pot is' : 'pots are'} still standing. Look for a throw that chains.`];
    showOverlay(`<h2>${msg[0]}</h2><p class="sub">${msg[1]}</p><div class="row"><button class="primary" id="rRetry">Retry (R)</button></div><div class="row"><button id="rLevels">Levels</button></div>`);
  }
  on('rRetry', retry); on('rLevels', showSelect);
}
function selectText(el) { try { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {} }

function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function startDaily() {
  const date = todayStr(); const c = Storage.data.daily.cache;
  if (c && c.date === date) { const cur = Storage.data.cur; startLevel(c.level, cur && cur.id === 'daily' ? cur.shots : [], true); return; }
  if (S.dailyBuilding) return; S.dailyBuilding = true;
  showOverlay(`<h2>Firing today’s kiln</h2><p class="sub">Building ${date}’s level and finding its par. Everyone gets the same one.</p><div class="bar-prog"><i id="dProg"></i></div>`);
  const gen = buildDaily(date); let lvl = null;
  const pump = () => {
    const t0 = performance.now();
    while (performance.now() - t0 < 24) { const n = gen.next(); if (n.done) { lvl = n.value; break; } const pr = $('dProg'); if (pr) pr.style.width = Math.round(n.value * 100) + '%'; }
    if (!lvl) { setTimeout(pump, 0); return; }
    S.dailyBuilding = false;
    Storage.data.daily.cache = { date, level: lvl }; if (Storage.data.cur && Storage.data.cur.id === 'daily') Storage.data.cur = null; Storage.save();
    startLevel(lvl, [], true);
  };
  setTimeout(pump, 30);
}

on('bMenu', showSelect); on('bRetry', retry); on('bHint', () => showHint(true));
on('bSound', () => { Storage.data.sound = !Storage.data.sound; Storage.save(); Audio.setOn(Storage.data.sound); updateHud(); toast(Storage.data.sound ? 'Sound on' : 'Sound off'); });

// ---------------- Boot ----------------
Storage.load(); fit(); updateHud();
GK.studio();
GK.coach.create('kilnshot-first', [{ target: () => { const w = S.world; if (!w) return null; const r = cv.getBoundingClientRect(); return { x: r.left + w.sling.x * scale, y: r.top + w.sling.y * scale, r: 34 }; },
  done: () => S.shots.length > 0 || totalStars() > 0 || Storage.data.daily.fired > 0 }],
  { when: () => S.mode === 'play' && $('ov').hidden && !S.aim });
GK.wired('motion', 'shake, shard/spark bursts and spring shimmer scale with the level; hint, toast and progress CSS follow it');
GK.wired('flash', 'keeper-cracked flash');
GK.wired('text', 'page CSS floor and scale; floating words; jar badges, door and latch letters left as board art');
GK.wired('combo', 'own ladder kept: chain breaks climb the game pentatonic scale');
// if the last session was mid-level, put the board back exactly (replaying the committed throws)
const cur = Storage.data.cur;
if (cur && cur.id !== 'daily' && LEVELS.find(l => l.id === cur.id) && cur.shots.length) { startLevel(LEVELS.find(l => l.id === cur.id), cur.shots); showTitle(); S.mode = S.result ? 'over' : 'title'; }
else showTitle();
requestAnimationFrame(frame);
window.__kiln = { S, Storage, fire, retry, startLevel, startDaily, showSelect, LEVELS };
})();
