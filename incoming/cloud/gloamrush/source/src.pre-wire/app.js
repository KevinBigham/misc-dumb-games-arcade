// ===== GLOAMRUSH APP: rendering, input, audio, overlays, save =====
(function () {
'use strict';
const G = window.GR;
const { clamp, lerp, TAU, fmtT } = G;
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const ovEl = $('ov'), panel = $('panel'), hudBtns = $('hudBtns'), toastEl = $('toast');

// ---------- SAVE ----------
const KEY = 'gloamrush.save.v1';
let storageOK = true, save;
// GameKit: three rolling backups of the raw save (no format change); a broken or missing save comes back from the newest good one.
const PROT = GK.save.protect(KEY, { validate: raw => { try { const o = JSON.parse(raw); return !!o && typeof o === 'object' && typeof o.v === 'number'; } catch (e) { return false; } } });
function loadSave() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { storageOK = false; }
  if (raw == null) return G.defSave();
  try { return G.mergeSave(JSON.parse(raw)); }
  catch (e) {
    // Corrupt save: keep a copy before anything overwrites it.
    try { if (!localStorage.getItem(KEY + '.bak')) localStorage.setItem(KEY + '.bak', raw); } catch (e2) {}
    return G.defSave();
  }
}
function persist() {
  if (!storageOK) return;
  save.lastSave = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {}
}
save = loadSave();
if (save.lastSave > Date.now()) save.lastSave = Date.now(); // clock rolled back: clamp
GK.save.onHide(() => persist());
const RM_SYS = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
if (RM_SYS && !save.firstRunDone && save.runs === 0) save.settings.rm = 1;
const S = () => save.settings;
const RM = () => !!S().rm;

function today() { return G.localDayKey(new Date()); }
function prettyDay(k) { const [y, m, d] = k.split('-').map(Number); return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] + ' ' + d; }
function rollDay() {
  const k = today();
  if (save.daily.key !== k) save.daily = { key: k, best: 0, firstDone: false };
  G.ensureMissions(save, k);
}
rollDay();

// ---------- HAPTICS ----------
let lastVib = 0;
function vib(p) {
  if (!S().haptics) return;
  const now = performance.now(); if (typeof p === 'number' && p < 15 && now - lastVib < 60) return; lastVib = now;
  try { navigator.vibrate && navigator.vibrate(p); } catch (e) {}
}

// ---------- AUDIO ----------
const AU = {
  ctx: null, master: null, music: null, sfx: null, lp: null, on: false, step: 0, nextT: 0, mode: 'title', wildLayer: false, duck: 1, timer: null,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    try {
      const c = this.ctx = GK.audio.ensure(); if (!c) return; // GameKit owns the context: unlock on every tap, ringer switch, interruptions
      this.master = c.createGain(); this.master.connect(c.destination);
      this.lp = c.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 18000; this.lp.Q.value = 0.7;
      this.music = c.createGain(); this.music.connect(this.lp); this.lp.connect(this.master);
      this.sfx = c.createGain(); this.sfx.connect(this.master);
      const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = nb;
      this.on = true; this.applyVol();
      this.nextT = c.currentTime + 0.1;
      this.timer = setInterval(() => this.sched(), 25);
    } catch (e) { this.on = false; }
  },
  applyVol() {
    if (!this.on) return;
    const m = save.muted ? 0 : 1, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(m, t, 0.03);
    this.music.gain.setTargetAtTime(S().music * 0.5 * this.duck, t, 0.08);
    this.sfx.gain.setTargetAtTime(S().sfx * 0.7, t, 0.03);
  },
  danger(f) { if (!this.on) return; const hz = f < 0.35 ? 500 + f * 100 * 55 : 18000; this.lp.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.12); },
  setDuck(v) { this.duck = v; this.applyVol(); },
  tone(f, d, type, v, slide, when, bus) {
    if (!this.on) return;
    const c = this.ctx, t = when || c.currentTime;
    if (!bus || bus === this.sfx) { const j = 1 + (Math.random() * 2 - 1) * 0.04; f *= j; if (slide) slide *= j; } // sound effects vary a little in pitch; music stays in tune
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || 0.2, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(bus || this.sfx); o.start(t); o.stop(t + d + 0.02);
  },
  noise(d, v, freq, type, when, bus) {
    if (!this.on) return;
    const c = this.ctx, t = when || c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter(); f.type = type || 'highpass'; f.frequency.value = freq || 3000;
    const g = c.createGain(); g.gain.setValueAtTime(v || 0.1, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(bus || this.sfx); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  },
  // --- music ---
  BPM: { title: 104, dusk: 120, gloam: 128, mid: 136, boss: 146, dawn: 100, long: 140 },
  chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], // Am F C G
  mtof: n => 440 * Math.pow(2, (n - 69) / 12),
  sched() {
    if (!this.on) return;
    const c = this.ctx;
    while (this.nextT < c.currentTime + 0.12) { this.playStep(this.step, this.nextT); const spb = 60 / (this.BPM[this.mode] || 120) / 4; this.nextT += spb; this.step = (this.step + 1) % 64; }
  },
  playStep(s, t) {
    const M = this.mode, bar = Math.floor(s / 16) % 4, i = s % 16, ch = this.chords[bar], f = this.mtof, mb = this.music;
    if (i === 0) for (const n of ch) this.tone(f(n), M === 'title' || M === 'dawn' ? 2.2 : 1.8, 'triangle', 0.045, 0, t, mb);
    if (M === 'title' || M === 'dawn') { if (i % 4 === 2) this.tone(f(ch[(i / 4 | 0) % 3] + 12), 0.9, 'sine', 0.03, 0, t, mb); return; }
    // bass
    if (i % 4 === 0 || (M === 'boss' && i % 2 === 0)) this.tone(f(ch[0] - 24), 0.22, M === 'boss' ? 'sawtooth' : 'triangle', M === 'boss' ? 0.07 : 0.11, 0, t, mb);
    // kick
    if (i % 4 === 0) this.tone(130, 0.16, 'sine', 0.22, 40, t, mb);
    // arp (gloaming+)
    if ((M === 'gloam' || M === 'mid' || M === 'boss' || M === 'long' || this.wildLayer) && i % 2 === 0) this.tone(f(ch[(i / 2) % 3] + 12 + (this.wildLayer && i % 4 === 2 ? 12 : 0)), 0.14, 'square', this.wildLayer ? 0.03 : 0.018, 0, t, mb);
    // hats
    if ((M === 'mid' || M === 'boss' || M === 'long') && i % 2 === 1) this.noise(0.04, 0.035, 7000, 'highpass', t, mb);
    if (this.wildLayer) this.noise(0.03, 0.03, 8000, 'highpass', t, mb);
    // snare
    if ((M === 'boss' || M === 'long') && (i === 4 || i === 12)) this.noise(0.14, 0.09, 1800, 'bandpass', t, mb);
  },
  setMode(m) { this.mode = m; },
  // --- stingers & sfx ---
  gem(n) { this.tone(740 * Math.pow(1.059, n % 10), 0.08, 'sine', 0.09); },
  graze(n) { this.tone(1046 * GK.audio.ladder(Math.min(n - 1, 12)), 0.05, 'square', 0.035); },
  hit() { this.tone(220 + Math.random() * 60, 0.04, 'square', 0.02, 120); },
  kill(big) { if (big) { this.tone(110, 0.25, 'sine', 0.25, 40); this.noise(0.15, 0.08, 600, 'lowpass'); } else this.tone(420 + Math.random() * 200, 0.06, 'triangle', 0.05, 900); },
  hurt() { this.tone(160, 0.25, 'sawtooth', 0.12, 60); this.noise(0.18, 0.12, 900, 'lowpass'); },
  level() { [0, 4, 7, 12].forEach((n, k) => this.tone(this.mtof(69 + n), 0.18, 'triangle', 0.09, 0, this.ctx && this.ctx.currentTime + k * 0.06)); },
  pick() { this.tone(988, 0.12, 'sine', 0.1); this.tone(1318, 0.18, 'sine', 0.07, 0, this.ctx && this.ctx.currentTime + 0.05); },
  evolve() { if (!this.on) return; const t = this.ctx.currentTime; [0, 4, 7, 11, 12, 16, 19, 24].forEach((n, k) => this.tone(this.mtof(57 + n), 0.5, k % 2 ? 'triangle' : 'square', 0.07, 0, t + k * 0.07)); this.noise(0.8, 0.12, 2000, 'highpass', t); },
  wild() { if (!this.on) return; const t = this.ctx.currentTime; this.noise(0.6, 0.16, 500, 'lowpass', t); [57, 64, 69, 76].forEach((n, k) => this.tone(this.mtof(n), 0.6, 'sawtooth', 0.05, 0, t + k * 0.03)); },
  chime(r) { if (!this.on) return; const t = this.ctx.currentTime, base = 72 + r * 3; const seq = r >= 2 ? [0, 4, 7, 12] : [0, 7]; seq.forEach((n, k) => this.tone(this.mtof(base + n), 0.45, 'sine', 0.1, 0, t + k * 0.09)); },
  whoosh() { if (!this.on) return; const c = this.ctx, t = c.currentTime; const s = c.createBufferSource(); s.buffer = this.noiseBuf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.6); const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); s.connect(f); f.connect(g); g.connect(this.sfx); s.start(t); s.stop(t + 0.75); },
  sparkle() { if (!this.on) return; const t = this.ctx.currentTime; for (let k = 0; k < 6; k++) this.tone(1500 + k * 300 + Math.random() * 200, 0.12, 'sine', 0.05, 0, t + k * 0.04); },
  roar() { this.tone(90, 1.2, 'sawtooth', 0.18, 35); this.noise(1.0, 0.14, 300, 'lowpass'); },
  drum() { this.tone(80, 0.4, 'sine', 0.3, 40); this.noise(0.25, 0.08, 400, 'lowpass'); },
  bank() { this.chime(1); this.tone(523, 0.6, 'triangle', 0.08); },
  death() { this.tone(440, 1.1, 'triangle', 0.12, 110); },
  bell() { this.tone(1568, 0.6, 'sine', 0.08); this.tone(2093, 0.5, 'sine', 0.05); },
};

// ---------- CANVAS / SPRITES ----------
let W = 0, H = 0, DPR = 1, ZOOM = 1;
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  W = window.innerWidth; H = window.innerHeight;
  cv.width = Math.floor(W * DPR); cv.height = Math.floor(H * DPR);
  ZOOM = clamp(Math.min(W, H) / 420, 0.85, 2.2);
  if (world) { world.vw = W / ZOOM; world.vh = H / ZOOM; }
}
const sprites = {};
function glowSprite(col, r, core) {
  const k = col + r + (core || ''); if (sprites[k]) return sprites[k];
  const s = Math.ceil(r * 2 * 2), c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'), gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, core || '#ffffff'); gr.addColorStop(0.18, col); gr.addColorStop(0.5, hexA(col, 0.35)); gr.addColorStop(1, hexA(col, 0));
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
  return (sprites[k] = c);
}
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
const ECOL = { mite: '#9b7bff', dart: '#6fd3ff', spitter: '#ff4f8b', hollow: '#c58bff', weaver: '#ff9a4f', wraith: '#ff5a6a' };
function enemySprite(type, r, white) {
  const k = 'e' + type + r + (white ? 'w' : ''); if (sprites[k]) return sprites[k];
  const pad = 8, s = Math.ceil((r + pad) * 2 * 2), c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'); g.scale(2, 2); g.translate(r + pad, r + pad);
  const rim = ECOL[type];
  g.shadowColor = rim; g.shadowBlur = 8;
  g.fillStyle = white ? '#ffffff' : '#140c26'; g.strokeStyle = white ? '#ffffff' : rim; g.lineWidth = 2;
  g.beginPath();
  const spikes = type === 'mite' ? 9 : type === 'dart' ? 3 : type === 'hollow' ? 12 : type === 'weaver' ? 6 : type === 'wraith' ? 14 : 7;
  for (let i = 0; i <= spikes * 2; i++) {
    const a = i / (spikes * 2) * TAU - Math.PI / 2, rr = r * (i % 2 ? (type === 'weaver' ? 0.95 : 0.78) : 1.06);
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr * (type === 'wraith' ? 1.15 : 1);
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.closePath(); g.fill(); g.stroke(); g.shadowBlur = 0;
  if (!white) {
    if (type === 'hollow') { g.strokeStyle = hexA(rim, 0.7); g.beginPath(); g.arc(0, 0, r * 0.45, 0, TAU); g.stroke(); }
    const ey = type === 'wraith' ? -r * 0.25 : -r * 0.12, ex = r * 0.3, er = Math.max(1.6, r * 0.14);
    g.fillStyle = type === 'spitter' || type === 'wraith' ? '#ffd0e0' : '#f6f0ff';
    g.beginPath(); g.arc(-ex, ey, er, 0, TAU); g.arc(ex, ey, er, 0, TAU); g.fill();
    if (type === 'spitter') { g.fillStyle = '#ff4f8b'; g.beginPath(); g.arc(0, r * 0.35, r * 0.2, 0, TAU); g.fill(); }
  }
  return (sprites[k] = c);
}
function drawSprite(sp, x, y, scale, alpha) {
  const w = sp.width / 2 * (scale || 1), h = sp.height / 2 * (scale || 1);
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  ctx.drawImage(sp, x - w / 2, y - h / 2, w, h);
  if (alpha !== undefined) ctx.globalAlpha = 1;
}
function drawMothShape(g, x, y, sz, c, flap, alpha) {
  const f = 0.45 + 0.55 * Math.abs(Math.sin(flap));
  g.save(); g.translate(x, y); g.globalAlpha = alpha === undefined ? 1 : alpha;
  for (const sgn of [-1, 1]) {
    g.save(); g.scale(sgn * f, 1);
    g.fillStyle = c[0]; g.beginPath(); g.moveTo(0, -1); g.quadraticCurveTo(sz * 1.1, -sz * 1.0, sz * 1.0, -sz * 0.1); g.quadraticCurveTo(sz * 0.6, sz * 0.15, 0, sz * 0.1); g.fill();
    g.fillStyle = c[1]; g.beginPath(); g.moveTo(0, sz * 0.05); g.quadraticCurveTo(sz * 0.8, sz * 0.2, sz * 0.55, sz * 0.75); g.quadraticCurveTo(sz * 0.2, sz * 0.6, 0, sz * 0.3); g.fill();
    g.restore();
  }
  g.fillStyle = '#2a1e1a'; g.beginPath(); g.ellipse(0, sz * 0.1, sz * 0.12, sz * 0.42, 0, 0, TAU); g.fill();
  g.restore();
}

// ---------- STATE ----------
let world = null, mode = 'title', runOpts = null; // mode: title | play | level | pause | dawn | results | menu
let hitstop = 0, flashA = 0, flashCol = '#fff', timeScale = 1, slowT = 0, rimT = 0, newBestShown = false, bestPill = 0;
let ghostHp = 1, bossGhost = 1;
const parts = []; const PCAP = 1400;
const texts = []; // floating texts {x,y,txt,col,t,max,size}
const rings = [];
let banner = null, banner2 = null;
const toasted = new Set();
let dayAdd = { moths: 0, evolve: 0, runs: 0 };
let ambient = []; for (let i = 0; i < 60; i++) ambient.push({ x: Math.random(), y: Math.random(), p: Math.random() * TAU, s: 0.3 + Math.random() * 0.7 });

function addPart(x, y, vx, vy, life, col, size, drag) {
  if (parts.length >= PCAP) parts.shift();
  parts.push({ x, y, vx, vy, life, max: life, col, size, drag: drag || 0.9 });
}
function burst(x, y, n, col, spd, size, life) {
  if (!JU.on.particles) return;
  if (RM()) n = Math.ceil(n / 3);
  for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = (0.3 + Math.random()) * spd; addPart(x, y, Math.cos(a) * s, Math.sin(a) * s, (life || 0.5) * (0.6 + Math.random() * 0.6), col, size || 3); }
}
function floatText(x, y, txt, col, size, life) { if (texts.length > 80) texts.shift(); texts.push({ x, y, txt, col: col || '#fff', t: 0, max: life || 0.8, size: size || 14 }); }
function ring(x, y, r, col, life, w) { rings.push({ x, y, r, col, t: 0, max: life || 0.5, w: w || 4 }); }
// GameKit trauma shake: smooth noise, eases out; strength follows the Screen shake setting
const JU = GK.juice.create({ maxShake: 22, maxRot: 0.012, decay: 1.4, freq: 18, reducedMotion: false });
function doShake(v) { const m = [0, 0.45, 1][S().shake] * (RM() ? 0 : 1); if (!m) return; JU.shakeScale = m; JU.addTrauma(Math.min(1, Math.sqrt(v / 26)) * 0.75); }
function doHitstop(v, cap) { if (!JU.on.hitstop) return; hitstop = Math.min(cap || 0.12, Math.max(hitstop, v)); }
function doFlash(a, col) { if (!S().flash || RM()) return; a = GK.flash.allow(a); if (!a) return; flashA = Math.max(flashA, a); flashCol = col || '#fff'; }
function slowmo(scale, t) { if (RM()) return; timeScale = scale; slowT = t; }
function setBanner(text, sub, col, life) { banner = { text, sub: sub || '', col: col || '#fff3c4', t: 0, max: life || 2.2 }; }
function setBanner2(text, col) { banner2 = { text, col: col || '#ff4f8b', t: 0, max: 1.6 }; }
function toast(html, gold) { const d = document.createElement('div'); d.className = 'tst' + (gold ? ' gold' : ''); d.innerHTML = html; toastEl.appendChild(d); setTimeout(() => { try { d.remove(); } catch (e) {} }, 3000); while (toastEl.children.length > 3) toastEl.firstChild.remove(); }

// ---------- RUNS ----------
function startRun(daily) {
  AU.init(); BD.startRun();
  rollDay();
  const tut = !save.firstRunDone;
  const k = today();
  const seed = daily ? G.hashStr('gloamrush:' + k) : ((Date.now() ^ (Math.random() * 1e9)) >>> 0);
  runOpts = { daily: !!daily };
  world = G.makeWorld({ seed, daily: !!daily, tutorial: tut, hero: save.hero, meta: save.meta, knownEvos: save.evolutions, knownMoths: save.moths, vw: W / ZOOM, vh: H / ZOOM });
  parts.length = 0; texts.length = 0; rings.length = 0; banner = banner2 = null;
  hitstop = 0; JU.trauma = 0; flashA = 0; timeScale = 1; slowT = 0; newBestShown = false; bestPill = 0; ghostHp = 1; bossGhost = 1;
  toasted.clear(); dayAdd = { moths: 0, evolve: 0, runs: 1 };
  bumpDay('runs', 1);
  stick.id = null;
  mode = 'play'; hideOv(); hudBtns.hidden = false;
  AU.setDuck(1); AU.setMode('dusk'); AU.wildLayer = false;
  lastFrame = performance.now();
  handleEvents(); // banner + possible head-start level
}
function bumpDay(id, n) {
  if (!save.mis) return;
  for (const m of save.mis.list) if (m.id === id && !m.done) m.prog += n;
  checkMissions();
}
function checkMissions() {
  if (!save.mis) return;
  const st = world ? world.stats : { grazes: 0, bestChain: 0, wildfires: 0, surviveNoWind: 0, kills: 0, banks: 0 };
  const done = G.missionsLive(save, st, {});
  for (const m of done) {
    m.done = true; m.prog = m.n; save.glow += m.rw;
    const s = G.markStreak(save, today());
    toast(`<b>Mission done</b> · ${esc(G.missionText(m))} <span class="glowv">+${m.rw} glow</span>`, true);
    if (s.grew) setTimeout(() => toast(`${flameSvg(16)} Streak: ${s.n} day${s.n > 1 ? 's' : ''}${s.usedShield ? ' (ember shield used)' : ''}`), 600);
    AU.bell(); vib(12);
  }
  if (done.length) persist();
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ---------- BADGES (GameKit) ----------
const BADGES = [
  { id: 'dawn', name: 'First Light', desc: 'See the dawn' },
  { id: 'blown', name: 'Blown Out', desc: 'Let the flame go out in under 20 seconds', funny: true },
  { id: 'close', name: 'So Close', desc: 'Go out in the last 30 seconds before the Hush', funny: true },
  { id: 'needle', name: 'Thread the Needle', desc: 'Reach a x40 graze chain' },
  { id: 'bonfire', name: 'Bonfire Night', desc: '3 wildfires in one run' },
  { id: 'magnet', name: 'Moth Magnet', desc: 'Catch 8 moths in one run' },
  { id: 'owl', name: 'Night Owl', desc: 'Stay for the Long Night' },
  { id: 'dusk', name: 'Dusk Regular', desc: "Finish a Tonight's Dusk" },
].concat(GK.badges.milestones([10, 50], [3, 10], (k, n) => k === 'plays' ? n + ' flights' : n + ' dawns'));
let BD = GK.badges.create(BADGES, save.badges, { toast: false });
function wireBadges() { BD.onEarn(d => { setTimeout(() => toast(`Badge earned: <b>${esc(d.name)}</b>`, true), 700); AU.bell && AU.bell(); }); }
wireBadges();
function checkBadges(w, o) {
  if (o.win) BD.earn('dawn');
  if (!o.win && o.time < 20) BD.earn('blown');
  if (!o.win && !w.longNight && o.time >= G.BOSS_T - 30 && o.time < G.BOSS_T) BD.earn('close');
  if (w.stats.bestChain >= 40) BD.earn('needle');
  if (w.stats.wildfires >= 3) BD.earn('bonfire');
  if (w.stats.catches >= 8) BD.earn('magnet');
  if (w.longNight) BD.earn('owl');
  if (w.daily) BD.earn('dusk');
  BD.check({ plays: save.runs, wins: save.wins });
}

function finishRun() {
  const w = world, o = w.over;
  // commit stats
  save.runs++; save.kills += w.stats.kills; save.firstRunDone = true;
  const prevBestT = save.bestTime, prevBestS = save.bestScore;
  save.bestTime = Math.max(save.bestTime, o.time); save.bestScore = Math.max(save.bestScore, o.score);
  if (o.win) save.wins++;
  let dailyBonus = 0;
  if (w.daily) {
    rollDay();
    if (o.score > save.daily.best) save.daily.best = o.score;
    if (!save.daily.firstDone && o.time >= 60) { save.daily.firstDone = true; dailyBonus = 100; }
  }
  G.commitMissions(save, w.stats, {});
  save.glow += o.pay.glow + dailyBonus;
  checkBadges(w, o);
  persist();
  AU.setDuck(0.1); AU.danger(1);
  setTimeout(() => { if (mode === 'results') { AU.setMode('title'); AU.setDuck(1); } }, 1600);
  mode = 'results'; hudBtns.hidden = true;
  showResults({ prevBestT, prevBestS, dailyBonus });
}

// ---------- EVENTS → JUICE ----------
function handleEvents() {
  const w = world; if (!w) return;
  const evs = w.events; w.events = [];
  for (const e of evs) {
    switch (e.k) {
      case 'banner': setBanner(e.text, e.sub, e.tut ? '#ff9ac0' : null, e.big ? 2.6 : 2.4); if (e.tut) { ring(w.p.x, w.p.y, 40, '#ff4f8b', 1.4, 3); } break;
      case 'act': setBanner(e.text, 'FIRST VISIT', '#fff3c4', 2.4); AU.drum(); AU.setMode(e.act === 2 ? 'gloam' : 'mid'); doShake(6); break;
      case 'wave': setBanner2(e.text); AU.drum(); doShake(5); vib(15); break;
      case 'stone': setBanner2('A HEARTH STONE GLOWS', '#ffb547'); break;
      case 'stoneGone': floatText(w.p.x, w.p.y - 40, 'stone faded', '#a99cc8', 13); break;
      case 'bank': AU.bank(); vib([10, 30, 10]); setBanner2('GLOW BANKED · ' + e.v, '#ffb547'); ring(w.p.x, w.p.y, 80, '#ffb547', 0.8, 6); break;
      case 'bossWarn': setBanner(e.text, 'survive the Hush to see the dawn', '#ff4f8b', 3); doShake(14); AU.roar(); vib([30, 50, 30]); break;
      case 'boss': AU.setMode('boss'); doShake(18); break;
      case 'bossPhase': doHitstop(0.1); doShake(16); doFlash(0.5, '#ff4f8b'); AU.roar(); setBanner2(e.phase === 2 ? 'THE HUSH SPLITS' : 'THE HUSH RAGES'); break;
      case 'bossTele': break;
      case 'bossCharge': doShake(6); break;
      case 'bossDie': doHitstop(0.32, 0.32); doShake(26); doFlash(1, '#fff3c4'); burst(e.x, e.y, 260, '#fff3c4', 520, 4, 1.2); ring(e.x, e.y, 400, '#ffb547', 1.2, 10); AU.evolve(); vib([40, 60, 40, 60, 120]); break;
      case 'dawn': setTimeout(() => { if (world === w && w.awaitDawn) showDawn(); }, 1300); AU.setMode('dawn'); break;
      case 'longNight': setBanner('THE LONG NIGHT', 'glow +10% every minute', '#b48cff', 2.6); AU.setMode('long'); break;
      case 'levelup': AU.level(); vib(15); mode = 'level'; showLevelUp(); break;
      case 'evolve': {
        doHitstop(0.32, 0.32); doShake(22); doFlash(0.9, '#ffb547'); ring(e.x, e.y, 260, '#ffb547', 0.9, 10); burst(e.x, e.y, 300, '#ffd27a', 480, 4, 1);
        AU.evolve(); vib([30, 40, 30, 40, 80]);
        setBanner('EVOLUTION', e.name + (e.isNew ? ` · NEW ${save.evolutions.length + 1}/8` : ''), '#ffb547', 2.6);
        if (e.isNew && save.evolutions.indexOf(e.id) < 0) { save.evolutions.push(e.id); }
        bumpDay('evolve', 1); dayAdd.evolve++; persist(); break;
      }
      case 'maxed': if (e.partner) floatText(w.p.x, w.p.y - 50, e.ready ? 'EVOLUTION READY' : 'MAX · evolves with ' + e.partner, '#ffb547', 14, 1.6); break;
      case 'graze': {
        AU.graze(e.chain); vib(8); rimT = 0.12;
        const c = e.chain >= 5 ? '#ffd84a' : '#ffffff';
        floatText(w.p.x + 22, w.p.y - 18, e.chain > 1 ? 'GRAZE x' + Math.min(e.chain, 99) : 'GRAZE', c, e.chain >= 3 ? 15 : 13, 0.6);
        addPart(e.gx, e.gy, 0, 0, 0.25, '#ffffff', 5);
        break;
      }
      case 'chainEnd': break;
      case 'wildfire': AU.wild(); AU.wildLayer = true; vib([20, 30, 40]); doShake(14); doFlash(0.6, '#ffb547'); setBanner2('WILDFIRE!', '#ffb547'); ring(e.x, e.y, 180, '#ffb547', 0.6, 8); burst(e.x, e.y, 80, '#ffb547', 360, 4, 0.7); break;
      case 'wildEnd': AU.wildLayer = false; break;
      case 'nova': ring(e.x, e.y, e.r, e.freeze ? '#9fdcff' : '#ffb547', 0.45, e.freeze ? 7 : 5); if (e.r > 150) doShake(5); break;
      case 'bloom': ring(e.x, e.y, e.r, '#ff7a3a', 0.3, 4); burst(e.x, e.y, 10, '#ff9a4f', 200, 3, 0.4); break;
      case 'ram': burst(e.x, e.y, 6, '#ffd27a', 240, 3, 0.3); doHitstop(0.02); break;
      case 'kill': {
        const col = ECOL[e.type] || '#9b7bff';
        burst(e.x, e.y, e.brute ? 26 : 8, col, e.brute ? 260 : 170, 3, 0.45);
        if (e.brute) { doHitstop(0.06); doShake(8); vib(20); AU.kill(true); } else { doHitstop(0.014); if (Math.random() < 0.35) AU.kill(false); }
        break;
      }
      case 'dnum': if (S().nums) floatText(e.x + (Math.random() - .5) * 10, e.y, String(Math.round(e.v)), e.crit ? '#ffd84a' : '#f1ebff', e.crit ? 17 : 12, 0.55); break;
      case 'gem': AU.gem(e.n); if (e.n === 9) vib(12); break;
      case 'hurt': AU.hurt(); vib(35); doShake(10); doFlash(0.35, '#ff4f8b'); burst(e.x, e.y, 14, '#ff4f8b', 220, 3, 0.4); break;
      case 'revive': slowmo(0.25, 0.8); doFlash(1, '#ffffff'); ring(e.x, e.y, 340, '#ffffff', 0.9, 10); setBanner('SECOND WIND', 'rise again', '#ffffff', 2); AU.evolve(); vib([30, 40, 80]); break;
      case 'mothSpawn': if (e.r >= 2) { setBanner2('A ' + G.RAR[e.r].name.toUpperCase() + ' MOTH APPEARS', G.RAR[e.r].col); AU.sparkle(); } break;
      case 'cometSpawn': AU.whoosh(); setBanner2('COMET MOTH!', '#ffd84a'); break;
      case 'comet': {
        AU.sparkle(); vib([15, 40, 15]); doHitstop(0.09); burst(e.x, e.y, 60, '#ffd84a', 320, 4, 0.8);
        const t = e.out === 'starfall' ? ['STARFALL', 'double XP for 20s · +30% Flare'] : e.out === 'windfall' ? ['WINDFALL', 'a lump of glow'] : ['SWARM HANDS', 'fire x3 for 10s'];
        setBanner(t[0], t[1], '#ffd84a', 2.2); break;
      }
      case 'catch': onCatch(e); break;
      case 'over': onOver(e); break;
    }
  }
}
function onCatch(e) {
  const R = G.RAR[e.r], k = today();
  const known = save.moths[e.sp];
  if (!known) save.moths[e.sp] = { n: 1, bestMm: e.mm, first: k };
  else { known.n++; if (e.mm > known.bestMm) known.bestMm = e.mm; }
  dayAdd.moths++; bumpDay('moths', 1);
  persist();
  const count = Object.keys(save.moths).length;
  burst(e.x, e.y, 20 + e.r * 30, R.col, 260, 3, 0.8);
  if (e.r >= 2) { slowmo(0.28, 0.85); doFlash(0.7, R.col); doShake(6 + e.r * 2); vib([15, 60, 15]); }
  else vib(12);
  AU.chime(e.r);
  if (e.isNew) setBanner('NEW MOTH', `${e.name} · ${count}/30`, R.col, 2.4);
  else floatText(e.x, e.y - 20, `${e.name} ${e.mm}mm${e.isPB ? ' · PB' : ''}`, R.col, 14, 1.2);
  if (e.isNew && [5, 10, 15, 20, 25, 30].indexOf(count) >= 0) setTimeout(() => toast(`New lantern skin unlocked: <b>${esc(G.SKINS.find(s => s.need === count).name)}</b>`, true), 900);
}
function onOver(e) {
  const w = world;
  if (!e.win) { AU.death(); doShake(18); doFlash(0.5, '#ff4f8b'); burst(w.p.x, w.p.y, 80, '#ffb547', 300, 4, 1); vib([60, 40, 80]); }
  AU.setDuck(0.1);
  mode = 'ending';
  setTimeout(() => { if (world === w) finishRun(); }, e.win ? 200 : 1100);
}

// ---------- INPUT ----------
const stick = { id: null, ox: 0, oy: 0, x: 0, y: 0, ax: 0, ay: 0, type: '' };
const keys = {};
let aimMouse = null;
const STICK_R = 52;
cv.addEventListener('pointerdown', e => {
  AU.init();
  if (mode !== 'play') return;
  if (e.pointerType === 'mouse' && anyKey()) { aimMouse = { x: e.clientX, y: e.clientY }; return; }
  if (stick.id !== null) return;
  stick.id = e.pointerId; stick.type = e.pointerType; stick.ox = stick.x = e.clientX; stick.oy = stick.y = e.clientY; stick.ax = stick.ay = 0;
  try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  e.preventDefault && e.preventDefault();
});
window.addEventListener('pointermove', e => {
  if (aimMouse && e.pointerType === 'mouse') { aimMouse.x = e.clientX; aimMouse.y = e.clientY; }
  if (e.pointerId !== stick.id) return;
  stick.x = e.clientX; stick.y = e.clientY;
  let dx = stick.x - stick.ox, dy = stick.y - stick.oy; const d = Math.hypot(dx, dy);
  if (d > STICK_R) { stick.ox = stick.x - dx / d * STICK_R; stick.oy = stick.y - dy / d * STICK_R; dx = stick.x - stick.ox; dy = stick.y - stick.oy; }
  const m = Math.hypot(dx, dy) / STICK_R;
  stick.ax = m < 0.1 ? 0 : dx / STICK_R; stick.ay = m < 0.1 ? 0 : dy / STICK_R;
});
function endPointer(e) { if (e.pointerId === stick.id) { stick.id = null; stick.ax = stick.ay = 0; } if (e.pointerType === 'mouse') aimMouse = null; }
window.addEventListener('pointerup', endPointer);
window.addEventListener('pointercancel', endPointer);
function anyKey() { return keys.w || keys.a || keys.s || keys.d || keys.arrowup || keys.arrowdown || keys.arrowleft || keys.arrowright; }
window.addEventListener('keydown', e => {
  const k = (e.key || '').toLowerCase(); keys[k] = true;
  if ((k === 'escape' || k === 'p') && (mode === 'play' || mode === 'pause')) { mode === 'play' ? pauseGame() : resumeGame(); }
  if (mode === 'level' && ['1', '2', '3'].indexOf(k) >= 0) act('pick', String(+k - 1));
  if ((k === ' ' || k === 'enter') && mode === 'title' && document.activeElement === document.body) act('fly');
});
window.addEventListener('keyup', e => { keys[(e.key || '').toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
function readInput() {
  let ax = stick.ax, ay = stick.ay;
  const kx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), ky = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0);
  if (kx || ky) { const m = Math.hypot(kx, ky); ax = kx / m; ay = ky / m; }
  const inp = { ax, ay };
  if (aimMouse) inp.aim = { x: aimMouse.x - W / 2, y: aimMouse.y - H / 2 };
  return inp;
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (mode === 'play') pauseGame(); persist(); }
  else maybeOffline();
});
document.addEventListener('click', e => {
  const t = e.target && e.target.closest ? e.target.closest('[data-act]') : null;
  if (!t) return;
  AU.init();
  if (S().haptics && !navigator.vibrate) GK.juice.haptic('tap'); // iPhone: light tick on a real tap
  act(t.dataset.act, t.dataset.arg, t);
});
document.addEventListener('input', e => {
  const t = e.target; if (!t || !t.dataset || !t.dataset.set) return;
  S()[t.dataset.set] = +t.value; AU.applyVol(); persist();
});

// ---------- ACTIONS ----------
function act(a, arg, el) {
  switch (a) {
    case 'fly': startRun(false); break;
    case 'daily': startRun(true); break;
    case 'again': startRun(runOpts && runOpts.daily); break;
    case 'pick': if (mode === 'level' && world && world.choices && performance.now() - levelShownAt > 280) { const i = +arg; if (G.chooseUpgrade(world, i)) { AU.pick(); vib(10); if (world.choices) showLevelUp(); else { mode = 'play'; hideOv(); handleEvents(); } } } break;
    case 'reroll': if (mode === 'level' && G.reroll(world)) { AU.pick(); showLevelUp(); } break;
    case 'pause': if (mode === 'play') pauseGame(); break;
    case 'resume': resumeGame(); break;
    case 'quit': if (world && !world.over) { G.endRun(world, false); handleEvents(); } break;
    case 'mute': save.muted = !save.muted; AU.applyVol(); persist(); updateMuteIcon(); break;
    case 'title': mode = 'title'; world = null; hudBtns.hidden = true; AU.setMode('title'); AU.setDuck(1); showTitle(); break;
    case 'menu': showMenu(arg); break;
    case 'back': if (menuReturn === 'pause') showPause(); else showTitle(); break;
    case 'buy': buyMeta(arg); break;
    case 'hero': heroAct(arg); break;
    case 'skin': if (skinUnlocked(arg)) { save.skin = arg; persist(); showMenu('heroes'); } break;
    case 'long': if (world && world.awaitDawn) { G.stayLongNight(world); mode = 'play'; hideOv(); hudBtns.hidden = false; handleEvents(); } break;
    case 'cash': if (world && world.awaitDawn) { G.cashOut(world); handleEvents(); } break;
    case 'share': doShare(el); break;
    case 'saveOut': persist(); SAVE_UI.exportSave(); break;
    case 'saveIn': SAVE_UI.importSave(); break;
    case 'gather': { const g = +arg || 0; save.glow += g; persist(); hideOv(); toast(`<span class="glowv">+${g} glow</span> gathered by your moths`, true); AU.sparkle(); if (mode === 'title') showTitle(); break; }
    case 'shake': S().shake = +arg; persist(); showMenu('settings'); break;
    case 'gspeed': GK.prefs.set('speed', +arg); showMenu('settings'); break;
    case 'tog': S()[arg] = S()[arg] ? 0 : 1; persist(); showMenu('settings'); break;
    case 'wipe': if (el && el.dataset.armed === '1') { save = G.defSave(); rollDay(); persist(); showTitle(); toast('Save erased'); } else if (el) { el.dataset.armed = '1'; el.textContent = 'Tap again to erase everything'; } break;
  }
}
function pauseGame() { if (mode !== 'play') return; mode = 'pause'; stick.id = null; stick.ax = stick.ay = 0; showPause(); }
function resumeGame() { if (mode !== 'pause' && !(mode === 'menu' && world && !world.over)) return; mode = 'play'; hideOv(); lastFrame = performance.now(); }
function updateMuteIcon() { $('muteIco').innerHTML = save.muted ? '<path d="M3 7h3l5-4v14l-5-4H3z"/><path d="M14 7l4 6M18 7l-4 6" stroke="currentColor" stroke-width="2"/>' : '<path d="M3 7h3l5-4v14l-5-4H3z"/><path d="M14 6c2 2 2 6 0 8" stroke="currentColor" stroke-width="2" fill="none"/>'; $('bMute').setAttribute('aria-label', save.muted ? 'Unmute' : 'Mute'); }

// ---------- OVERLAYS ----------
let menuReturn = 'title';
function showOv(html, cls) { panel.innerHTML = html; panel.className = 'panel' + (cls && cls.indexOf('wide') >= 0 ? ' wide' : ''); ovEl.className = 'ov ' + (cls || ''); ovEl.hidden = false; ovEl.scrollTop = 0; }
function hideOv() { ovEl.hidden = true; panel.innerHTML = ''; }
const ICON = {
  hearth: '<svg viewBox="0 0 24 24"><path d="M12 2c3 4 6 6 6 11a6 6 0 1 1-12 0c0-3 2-5 3-7 0 3 1 4 3 5 0-4-1-6 0-9z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M12 6c-2-2-5-2-9-1v14c4-1 7-1 9 1 2-2 5-2 9-1V5c-4-1-7-1-9 1zm-1 12c-2-1-4-1-6-1V7c2 0 4 0 6 1z"/></svg>',
  evo: '<svg viewBox="0 0 24 24"><path d="M12 2l2.6 6.4L21 9l-5 4.5L17.5 21 12 17.3 6.5 21 8 13.5 3 9l6.4-.6z"/></svg>',
  hero: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="4"/><path d="M4 12c3-6 5-6 8-2 3-4 5-4 8 2-3 0-5 1-8 4-3-3-5-4-8-4z" opacity=".55"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L15 3h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1L11 21h4l.4-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4zM13 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>',
};
function flameSvg(s) { return `<svg class="flame" width="${s}" height="${s}" viewBox="0 0 24 24"><path fill="#ffb547" d="M12 2c3 4 6 6 6 11a6 6 0 1 1-12 0c0-3 2-5 3-7 0 3 1 4 3 5 0-4-1-6 0-9z"/></svg>`; }
function glowPill() { return `<span class="pill"><svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#ffb547"/></svg><span class="glowv">${save.glow.toLocaleString()}</span>&nbsp;glow</span>`; }
function missionsHtml() {
  if (!save.mis) return '';
  return save.mis.list.map(m => `<div class="mis${m.done ? ' done' : ''}"><span class="chk"></span><span class="txt">${esc(G.missionText(m))}</span><span class="pr">${m.done ? '+' + m.rw : (G.MPOOL_BY[m.id].id === 'survive' ? fmtT(m.prog) + '/' + fmtT(m.n) : Math.floor(m.prog) + '/' + m.n)}</span></div>`).join('');
}
function showTitle() {
  mode = 'title'; menuReturn = 'title'; rollDay();
  const first = !save.firstRunDone;
  if (first) {
    showOv(`<div style="height:14vh"></div><div class="wick"></div><div class="logo">GLOAMRUSH</div><div class="tag">Carry the last flame through the Gloam.</div><div style="height:10vh"></div><button class="btn primary" data-act="fly" id="bFly">Fly</button><div class="small" style="text-align:center">One thumb. Three minutes. Drag anywhere to fly.</div>`, 'clear');
    return;
  }
  const k = today(), sn = G.streakShown(save, k), mothN = Object.keys(save.moths).length;
  const nu = nextUnlock();
  showOv(`
    <div class="toprow">${glowPill()}<span class="pill">${flameSvg(14)} ${sn} day streak${save.streak.shields > 0 && sn ? ' · 1 shield' : ''}</span></div>
    <div class="wick sm"></div><div class="logo">GLOAMRUSH</div>
    <div class="tag">Best ${fmtT(save.bestTime)} · ${save.wins} dawn${save.wins === 1 ? '' : 's'} · ${mothN}/30 moths</div>
    <div class="glass list"><div class="toprow"><span class="eyebrow">Tonight's missions</span><span class="small">${prettyDay(k)}</span></div>${missionsHtml()}</div>
    ${nu ? `<div class="glass"><div class="toprow"><span class="eyebrow">Next unlock</span><span class="small">${esc(nu.label)}</span></div><div class="bar" style="margin-top:8px"><i id="nuBar"></i></div></div>` : ''}
    <button class="btn daily" data-act="daily" id="bDaily"><b>Tonight's Dusk · ${prettyDay(k)}</b><span>Same seed for everyone today${save.daily.best ? ' · today’s best ' + save.daily.best.toLocaleString() : save.daily.firstDone ? '' : ' · first finish +100 glow'} · new dusk in ${GK.daily.countdown(GK.daily.msToNext())}</span></button>
    <button class="btn primary" data-act="fly" id="bFly">Fly</button>
    <div class="nav">
      <button class="btn" data-act="menu" data-arg="hearth">${ICON.hearth}Hearth</button>
      <button class="btn" data-act="menu" data-arg="moths">${ICON.book}Mothbook</button>
      <button class="btn" data-act="menu" data-arg="evos">${ICON.evo}Evolutions</button>
      <button class="btn" data-act="menu" data-arg="heroes">${ICON.hero}Heroes</button>
    </div>
    <div class="row"><button class="btn" data-act="menu" data-arg="badges" id="bBadges" style="min-height:44px">Badges ${BD.count()}/${BADGES.length}</button><button class="btn" data-act="menu" data-arg="settings" style="min-height:44px">${ICON.gear.replace('<svg', '<svg width="18" height="18" fill="#a99cc8"')} Settings</button></div>`);
  if (nu) requestAnimationFrame(() => { const b = $('nuBar'); if (b) b.style.width = Math.round(nu.ratio * 100) + '%'; });
}
function cardHtml(c, i) {
  const info = G.cardInfo(world, c);
  return `<button class="card${info.evo ? ' evo' : ''}${info.graze ? ' graze' : ''}" data-act="pick" data-arg="${i}" id="card${i}"><div class="ct"><b>${esc(info.title)}</b><span class="tg">${esc(info.graze && !info.evo ? 'GRAZE · ' + info.tag : info.tag)}</span></div><div class="ds">${esc(info.desc)}</div>${info.sub ? `<div class="sb">${esc(info.sub)}</div>` : ''}</button>`;
}
let levelShownAt = 0;
function showLevelUp() {
  const w = world; if (!w || !w.choices) return;
  levelShownAt = performance.now();
  const strip = w.evos.map(id => `<span class="chip">${esc(G.EVO_BY[id].name)}</span>`).join('');
  const head = w.headStart && w.levelIdx <= w.meta.start ? 'HEAD START' : 'LEVEL ' + w.level;
  showOv(`<div class="eyebrow" style="text-align:center">${head} · choose one</div>
    <div class="cards">${w.choices.map(cardHtml).join('')}</div>
    <button class="btn" data-act="reroll" id="bReroll" ${w.rerolls > 0 ? '' : 'disabled'}>Reroll (${w.rerolls} left)</button>
    ${strip ? `<div class="chips" style="justify-content:center">${strip}</div>` : ''}`, 'wide');
}
function showPause() {
  menuReturn = 'pause';
  const w = world;
  showOv(`<div class="big" style="text-align:center">Paused</div>
    <div class="glass list"><span class="eyebrow">Tonight's missions</span>${missionsHtml()}</div>
    ${w && w.evos.length ? `<div class="chips">${w.evos.map(id => `<span class="chip">${esc(G.EVO_BY[id].name)}</span>`).join('')}</div>` : ''}
    <button class="btn primary" data-act="resume" id="bResume">Resume</button>
    <div class="row"><button class="btn" data-act="menu" data-arg="settings">Settings</button><button class="btn" data-act="quit" id="bQuit">End run</button></div>`, 'center');
}
function showDawn() {
  mode = 'dawn'; hudBtns.hidden = true;
  const w = world;
  showOv(`<div class="eyebrow" style="text-align:center">The Hush is broken</div><div class="big" style="text-align:center;color:var(--spark)">Dawn breaks</div>
    <div class="glass small" style="text-align:center">All your glow is banked x1.5. Stay for the Long Night to earn more as the dark keeps coming, or take it home now.</div>
    <button class="btn primary" data-act="cash" id="bCash">Cash out · ${w.winGlow} glow</button>
    <button class="btn daily" data-act="long" id="bLong"><b>Stay for the Long Night</b><span>endless · glow +10% each minute · the Dawnmoth flies here</span></button>`, 'center');
}
function nextUnlock() {
  const c = [];
  for (const m of G.META) { const l = save.meta[m.id]; if (l < m.max) c.push({ label: `${m.name} ${l + 1} · ${G.metaCost(m.id, l)} glow`, ratio: save.glow / G.metaCost(m.id, l) }); }
  for (const h of G.HEROES) if (!save.heroes[h.id]) c.push({ label: `${h.name} · ${h.cost} glow`, ratio: save.glow / h.cost });
  const mn = Object.keys(save.moths).length, nx = G.SKINS.find(s => s.need > mn);
  if (nx) { const prev = G.SKINS.filter(s => s.need <= mn).pop().need; c.push({ label: `${nx.name} skin · ${mn}/${nx.need} moths`, ratio: (mn - prev) / (nx.need - prev) * 0.999 }); }
  if (!c.length) return null;
  const ready = c.filter(x => x.ratio >= 1);
  if (ready.length) return { label: 'Ready at the Hearth: ' + ready[0].label.split(' · ')[0], ratio: 1 };
  c.sort((a, b) => b.ratio - a.ratio);
  return c[0];
}
function showResults(info) {
  const w = world, o = w.over, p = o.pay;
  const title = w.longNight ? 'The Long Night ends' : o.win ? 'Dawn broke' : 'The flame went out';
  const newBest = o.time > info.prevBestT && info.prevBestT > 0;
  const evos = w.evos.map(id => `<span class="chip">${esc(G.EVO_BY[id].name)}${w.newEvos.indexOf(id) >= 0 ? '<em>NEW</em>' : ''}</span>`).join('');
  const moths = w.caught.map(c => { const M = G.MOTH_BY[c.sp]; return `<span class="chip"><i style="background:${G.RAR[M.r].col}"></i>${esc(M.name)} ${c.mm}mm${c.isNew ? '<em>NEW</em>' : c.isPB ? '<em>PB</em>' : ''}</span>`; }).join('');
  const nu = nextUnlock();
  const glowLine = o.win ? `banked x1.5 + 150 for the dawn` : (w.banked ? `${w.banked} banked · kept half of the rest` : `kept half of ${p.runGlow} unbanked`) + (p.lost > 0 ? ` · ${p.lost} lost` : '');
  showOv(`
    <div class="eyebrow" style="text-align:center">${w.daily ? "Tonight's Dusk · " + prettyDay(today()) : w.hero !== 'wick' ? G.HERO_BY[w.hero].name : 'Dusk run'}</div>
    <div class="big" style="text-align:center">${title}</div>
    <div class="bigstats">
      <div><b>${fmtT(o.time)}</b><span>${newBest ? 'new best' : 'survived'}</span></div>
      <div><b>${o.score.toLocaleString()}</b><span>score</span></div>
      <div><b>x${w.stats.bestChain}</b><span>best graze</span></div>
      <div><b>${w.stats.kills}</b><span>shadows</span></div>
      <div><b>${w.stats.wildfires}</b><span>wildfires</span></div>
      <div><b>${w.level}</b><span>level</span></div>
    </div>
    <div class="glass"><div class="toprow"><span class="big glowv" style="font-size:30px">+${(p.glow + info.dailyBonus).toLocaleString()} glow</span><span class="small">${glowLine}${p.disc ? ' · discoveries +' + p.disc : ''}${info.dailyBonus ? ' · daily +100' : ''}</span></div>
      ${nu ? `<div class="toprow" style="margin-top:10px"><span class="eyebrow">Next unlock</span><span class="small">${esc(nu.label)}</span></div><div class="bar" style="margin-top:6px"><i id="nuBar"></i></div>` : ''}
    </div>
    ${evos ? `<div><div class="eyebrow">Evolutions</div><div class="chips" style="margin-top:6px">${evos}</div></div>` : ''}
    ${moths ? `<div><div class="eyebrow">Moths caught</div><div class="chips" style="margin-top:6px">${moths}</div></div>` : ''}
    <div class="glass list"><span class="eyebrow">Tonight's missions</span>${missionsHtml()}</div>
    <div class="row"><button class="btn" data-act="share" id="bShare">Share result</button><button class="btn" data-act="title" id="bTitle">Garden</button></div>
    <div id="shareOut"></div>
    <button class="btn primary" data-act="again" id="bAgain">Fly again</button>`);
  if (nu) setTimeout(() => { const b = $('nuBar'); if (b) b.style.width = Math.round(nu.ratio * 100) + '%'; }, 120);
}
function shareText() {
  const w = world; if (!w || !w.over) return '';
  const o = w.over, bits = ['GLOAMRUSH'];
  bits.push(w.daily ? "Tonight's Dusk " + prettyDay(today()) : 'Dusk run');
  bits.push('survived ' + fmtT(o.time));
  if (o.win) bits.push('Hush broken');
  if (w.evos.length) bits.push(w.evos.map(id => G.EVO_BY[id].name).join(' + '));
  bits.push(w.stats.catches + ' moth' + (w.stats.catches === 1 ? '' : 's'));
  bits.push('best graze x' + w.stats.bestChain);
  bits.push(o.score.toLocaleString() + ' pts');
  if (GK.prefs.assisted()) bits.push(Math.round(GK.prefs.speed() * 100) + '% speed');
  return bits.join(' · ');
}
function doShare(el) {
  const txt = shareText(), out = $('shareOut');
  const show = (msg) => { if (out) out.innerHTML = `<div class="share">${esc(txt)}</div><div class="small" style="margin-top:4px">${msg}</div>`; };
  // GameKit: the phone's share sheet first; if the page is not allowed to use it, copy as before
  try {
    if (navigator.share) { navigator.share({ title: 'Gloamrush', text: txt }).then(() => {}, err => { if (!err || err.name !== 'AbortError') copyIt(); }); return; }
  } catch (e) {}
  copyIt();
  function copyIt() { try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(() => { show('Copied. Paste it anywhere.'); toast('Result copied'); }, () => show('Select the text above to copy it.'));
    } else show('Select the text above to copy it.');
  } catch (e) { show('Select the text above to copy it.'); } }
}

// --- menus ---
function backBtn() { return `<button class="btn" data-act="back" id="bBack">Back</button>`; }
function skinUnlocked(id) { const s = G.SKINS.find(x => x.id === id); return s && Object.keys(save.moths).length >= s.need; }
function buyMeta(id) {
  const m = G.META_BY[id]; if (!m) return; const l = save.meta[id]; if (l >= m.max) return;
  const c = G.metaCost(id, l); if (save.glow < c) return;
  save.glow -= c; save.meta[id] = l + 1; persist(); AU.pick(); vib(12); showMenu('hearth');
}
function heroAct(id) {
  const h = G.HERO_BY[id]; if (!h) return;
  if (save.heroes[id]) { save.hero = id; persist(); showMenu('heroes'); return; }
  if (save.glow >= h.cost) { save.glow -= h.cost; save.heroes[id] = true; save.hero = id; persist(); AU.evolve(); toast(`${esc(h.name)} joins you`, true); showMenu('heroes'); }
}
function showMenu(which) {
  if (mode === 'pause') menuReturn = 'pause'; else { menuReturn = 'title'; mode = 'menu'; }
  if (which === 'hearth') {
    showOv(`<div class="toprow"><div class="big">The Hearth</div>${glowPill()}</div><div class="small">Permanent upgrades, paid in glow. Glow comes from every run, win or lose.</div>
      <div class="list">${G.META.map(m => { const l = save.meta[m.id], c = G.metaCost(m.id, l), mx = l >= m.max; return `<div class="shop"><div><b>${esc(m.name)}</b><div class="small">${esc(m.d)}</div><div class="pips">${Array.from({ length: m.max }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('')}</div></div><button class="btn" data-act="buy" data-arg="${m.id}" id="buy-${m.id}" ${mx || save.glow < c ? 'disabled' : ''}>${mx ? 'Max' : c + ' glow'}</button></div>`; }).join('')}</div>${backBtn()}`);
  } else if (which === 'moths') {
    const n = Object.keys(save.moths).length;
    const hint = m => m.wild ? 'only during Wildfire' : m.long ? 'only in the Long Night' : m.evos2 ? 'only with 2+ evolutions' : m.boss ? 'only while the Hush is awake' : m.hero ? 'only with the ' + G.HERO_BY[m.hero].name : m.a === 3 ? 'Midnight' : m.a === 2 ? 'Gloaming or later' : '';
    showOv(`<div class="toprow"><div class="big">Mothbook</div><span class="pill">${n}/30 · ${Math.round(n / 30 * 100)}%</span></div>
      <div class="small">Touch a moth to catch it. Rare ones only come out under the right conditions. Every species you've caught gathers glow while you're away (up to 8 hours).</div>
      <div class="grid">${G.MOTHS.map(m => { const k = save.moths[m.id], R = G.RAR[m.r]; return `<div class="cell" style="border-color:${k ? R.col : 'var(--line)'}"><canvas data-moth="${m.id}" data-known="${k ? 1 : 0}" width="108" height="80"></canvas>${k ? `<b>${esc(m.name)}</b><span class="h">${R.name} · x${k.n} · ${k.bestMm}mm</span>` : `<span class="q">???</span><span class="h" style="color:${R.col}">${R.name}${hint(m) ? ' · ' + hint(m) : ''}</span>`}</div>`; }).join('')}</div>
      <div class="small">Lantern skins unlock at 5, 10, 15, 20, 25 and 30 species.</div>${backBtn()}`);
    paintMothCells();
  } else if (which === 'evos') {
    const n = save.evolutions.length;
    showOv(`<div class="toprow"><div class="big">Evolutions</div><span class="pill">${n}/8</span></div><div class="small">Max both halves of a recipe in one run. The evolution card then shows up first at your next level-up, and rerolls won't remove it.</div>
      <div class="evorow">${G.EVOS.map(e => { const got = save.evolutions.indexOf(e.id) >= 0; return `<div class="evo-e${got ? ' got' : ''}"><b>${got ? esc(e.name) : '???'}</b><span class="small">${got ? 'found' : ''}</span><span class="small">${esc(G.UPG_BY[e.a].name)} + ${got ? esc(G.UPG_BY[e.b].name) : '???'}${got ? ' · ' + esc(e.d) : ''}</span></div>`; }).join('')}</div>${backBtn()}`);
  } else if (which === 'heroes') {
    const mn = Object.keys(save.moths).length;
    showOv(`<div class="toprow"><div class="big">Heroes</div>${glowPill()}</div>
      <div class="list">${G.HEROES.map(h => { const own = save.heroes[h.id], sel = save.hero === h.id; return `<div class="shop"><div><b>${esc(h.name)}</b><div class="small">${esc(h.d)} · ${h.hp} HP</div></div><button class="btn" data-act="hero" data-arg="${h.id}" id="hero-${h.id}" ${sel || (!own && save.glow < h.cost) ? 'disabled' : ''}>${sel ? 'Flying' : own ? 'Choose' : h.cost + ' glow'}</button></div>`; }).join('')}</div>
      <div class="eyebrow">Lantern skins</div>
      <div class="list">${G.SKINS.map(s => { const un = mn >= s.need, sel = save.skin === s.id; return `<div class="shop"><div style="display:flex;gap:10px;align-items:center"><span style="width:22px;height:22px;border-radius:99px;background:radial-gradient(${s.b},${s.a});box-shadow:0 0 12px ${s.a}"></span><div><b>${esc(s.name)}</b><div class="small">${un ? 'unlocked' : 'catch ' + s.need + ' species'}</div></div></div><button class="btn" data-act="skin" data-arg="${s.id}" id="skin-${s.id}" ${!un || sel ? 'disabled' : ''}>${sel ? 'Worn' : un ? 'Wear' : mn + '/' + s.need}</button></div>`; }).join('')}</div>${backBtn()}`);
  } else if (which === 'badges') {
    showOv(`<div class="toprow"><div class="big">Badges</div><span class="pill">${BD.count()} of ${BADGES.length}</span></div><div class="glass" id="badgeGrid"></div>${backBtn()}`);
    BD.render($('badgeGrid'));
  } else if (which === 'settings') {
    const s = S();
    const tog = (k, label) => `<div class="set"><span>${label}</span><button class="tog${s[k] ? ' on' : ''}" data-act="tog" data-arg="${k}" id="tog-${k}" aria-pressed="${s[k] ? 'true' : 'false'}" aria-label="${label}"></button></div>`;
    showOv(`<div class="big">Settings</div><div class="glass list">
      <div class="set"><label for="sMusic">Music</label><input type="range" id="sMusic" min="0" max="1" step="0.05" value="${s.music}" data-set="music"></div>
      <div class="set"><label for="sSfx">Sound effects</label><input type="range" id="sSfx" min="0" max="1" step="0.05" value="${s.sfx}" data-set="sfx"></div>
      <div class="set"><span>Screen shake</span><div class="seg">${['Off', 'Low', 'Full'].map((l, i) => `<button data-act="shake" data-arg="${i}" class="${s.shake === i ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      <div class="set"><span>Game speed</span><div class="seg">${[[1, '100%'], [0.75, '75%'], [0.5, '50%']].map(([v, l]) => `<button data-act="gspeed" data-arg="${v}" id="gspeed-${l.replace('%', '')}" class="${GK.prefs.speed() === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
      ${tog('nums', 'Damage numbers')}${tog('flash', 'Screen flashes')}${tog('haptics', 'Vibration')}${tog('rm', 'Reduced motion')}
    </div><div class="small">Vibration works on Android. iPhones ignore it, so every buzz also has a sound and a visual.</div>
    <div class="glass list"><div class="set"><span>Your progress</span><div class="row"><button class="btn" data-act="saveOut" id="bSaveOut" style="min-height:44px">Export</button><button class="btn" data-act="saveIn" id="bSaveIn" style="min-height:44px">Import</button></div></div><div class="small">Safari can clear saved games after 7 days away. An export code brings your progress back.</div></div>
    <button class="btn" data-act="wipe" id="bWipe" style="min-height:44px;font-size:13px;color:var(--mute)">Erase save</button>${backBtn()}`);
  }
}
function paintMothCells() {
  panel.querySelectorAll && panel.querySelectorAll('canvas[data-moth]').forEach(c => {
    const m = G.MOTH_BY[c.dataset.moth], g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    const col = c.dataset.known === '1' ? m.c : ['#3a2d55', '#2c2244'];
    drawMothShape(g, 54, 34, 30, col, 1.2, 1);
  });
}
function maybeOffline() {
  const now = Date.now();
  const g = G.offlineGain(save, now);
  if (g >= 1 && (mode === 'title' || mode === 'menu')) {
    save.lastSave = now; persist(); // claim the time window so it cannot be counted twice
    showOv(`<div class="eyebrow" style="text-align:center">While you were away</div><div class="big" style="text-align:center">Your moths gathered <span class="glowv">+${g}</span> glow</div><div class="small" style="text-align:center">${Object.keys(save.moths).length} species, up to 8 hours.</div><button class="btn primary" data-act="gather" data-arg="${g}" id="bGather">Gather it</button>`, 'center');
    return true;
  }
  return false;
}

// ---------- RENDER ----------
let camX = 0, camY = 0, tReal = 0;
function skin() { return G.SKINS.find(s => s.id === save.skin) || G.SKINS[0]; }
function skyCols(w) {
  if (!w) return ['#1c1236', '#3a2050', '#0f0b1f'];
  if (w.dawn && !w.longNight) return ['#3b2c5e', '#b8607a', '#ffb98a'];
  if (w.longNight) return ['#08061a', '#1a0f33', '#120a24'];
  const t = w.t;
  if (t < 60) return ['#1c1236', '#4a2453', '#7a3a5a'];
  if (t < 120) return ['#140e2e', '#2c1a4a', '#3c1f4f'];
  return ['#0a0820', '#150f33', '#1c1238'];
}
function render(dtR) {
  const w = world;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const sk = skyCols(w);
  const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sk[0]); gr.addColorStop(0.65, sk[1]); gr.addColorStop(1, sk[2]);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  // ambient fireflies (screen space)
  ctx.globalCompositeOperation = 'lighter';
  for (const a of ambient) {
    const x = ((a.x * W - camX * 0.08 * a.s) % W + W) % W, y = ((a.y * H - camY * 0.08 * a.s) % H + H) % H;
    const al = 0.25 + 0.25 * Math.sin(tReal * 1.3 + a.p);
    drawSprite(glowSprite('#ffd27a', 6), x, y, a.s, al * (w && w.t > 120 ? 0.6 : 1));
  }
  ctx.globalCompositeOperation = 'source-over';
  if (!w) return;
  // camera + shake
  camX = w.p.x; camY = w.p.y;
  const sx = JU.x, sy = JU.y;
  ctx.save();
  ctx.translate(W / 2 + sx, H / 2 + sy); if (JU.rot) ctx.rotate(JU.rot); ctx.scale(ZOOM, ZOOM); ctx.translate(-camX, -camY);
  const vw = W / ZOOM, vh = H / ZOOM, x0 = camX - vw / 2 - 40, x1 = camX + vw / 2 + 40, y0 = camY - vh / 2 - 40, y1 = camY + vh / 2 + 40;
  drawGround(x0, y0, x1, y1);
  // stone
  if (w.stone) {
    const s = w.stone, pul = 1 + Math.sin(tReal * 4) * 0.04;
    ctx.globalCompositeOperation = 'lighter'; drawSprite(glowSprite('#ffb547', s.r * 1.2), s.x, s.y, pul, 0.5); ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#ffb547'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.lineWidth = 7; ctx.strokeStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(s.x, s.y, s.r - 6, -Math.PI / 2, -Math.PI / 2 + TAU * (s.fill / 1.5)); ctx.stroke();
    ctx.fillStyle = '#fff3c4'; ctx.font = '700 12px ' + bodyFont(); ctx.textAlign = 'center'; ctx.fillText('BANK ' + Math.ceil(s.life) + 's', s.x, s.y + 4);
  }
  // puddles
  for (const u of w.puddles) { const a = clamp(u.life / u.max, 0, 1); ctx.fillStyle = G.hasEvo(w, 'ashgarden') ? `rgba(127,214,166,${0.18 * a})` : `rgba(255,122,58,${0.2 * a})`; ctx.beginPath(); ctx.arc(u.x, u.y, u.r, 0, TAU); ctx.fill(); }
  // gems
  ctx.globalCompositeOperation = 'lighter';
  for (const g of w.gems) { const c = g.v >= 20 ? '#fff3c4' : g.v >= 6 ? '#c58bff' : g.v >= 3 ? '#7fd6a6' : '#ffb547'; drawSprite(glowSprite(c, g.v >= 20 ? 12 : g.v >= 6 ? 9 : 7), g.x, g.y, 1); }
  ctx.globalCompositeOperation = 'source-over';
  // enemies
  for (const e of w.enemies) {
    if (e.dead || e.x < x0 - 40 || e.x > x1 + 40 || e.y < y0 - 40 || e.y > y1 + 40) continue;
    drawSprite(enemySprite(e.type, e.r, e.flash > 0), e.x, e.y, 1);
    if (e.frozen > 0) { ctx.strokeStyle = 'rgba(159,220,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 3, 0, TAU); ctx.stroke(); }
    if (e.elite) { const f = e.hp / e.maxHp; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 20, e.y - e.r - 10, 40, 4); ctx.fillStyle = '#ff5a6a'; ctx.fillRect(e.x - 20, e.y - e.r - 10, 40 * f, 4); }
  }
  // boss
  if (w.boss) drawBoss(w.boss);
  // moths
  for (const m of w.moths) { const M = G.MOTH_BY[m.sp], R = G.RAR[M.r]; ctx.globalCompositeOperation = 'lighter'; drawSprite(glowSprite(R.col, 22 + M.r * 6), m.x, m.y, 1, 0.55); ctx.globalCompositeOperation = 'source-over'; drawMothShape(ctx, m.x, m.y, 9 + M.r * 2, M.c, m.ph, clamp(m.life, 0, 1)); }
  if (w.comet) { const c = w.comet; ctx.globalCompositeOperation = 'lighter'; drawSprite(glowSprite('#ffd84a', 34), c.x, c.y, 1, 0.8); addPart(c.x, c.y, -c.vx * 0.2 + (Math.random() - .5) * 40, -c.vy * 0.2 + (Math.random() - .5) * 40, 0.5, '#ffd84a', 3); ctx.globalCompositeOperation = 'source-over'; drawMothShape(ctx, c.x, c.y, 12, ['#ffe27a', '#ffb547'], c.ph, 1); }
  // player bullets
  ctx.globalCompositeOperation = 'lighter';
  const sc = skin();
  const pbs = glowSprite(sc.a, 7, sc.b), pbc = glowSprite('#ffd84a', 9);
  for (const b of w.pbul) drawSprite(b.crit ? pbc : pbs, b.x, b.y, 1);
  // orbit lanterns
  const on = w.st.orbit;
  if (on) { const tw = G.hasEvo(w, 'thornwheel'), R = tw ? 96 : 70; for (let i = 0; i < on; i++) { const a = w.orbA + i / on * TAU; drawSprite(glowSprite(sc.a, tw ? 18 : 12, '#ffffff'), w.p.x + Math.cos(a) * R, w.p.y + Math.sin(a) * R, 1); } }
  // particles
  for (let i = parts.length - 1; i >= 0; i--) {
    const q = parts[i]; q.life -= dtR; if (q.life <= 0) { parts.splice(i, 1); continue; }
    q.x += q.vx * dtR; q.y += q.vy * dtR; const dr = Math.pow(q.drag, dtR * 60); q.vx *= dr; q.vy *= dr;
    drawSprite(glowSprite(q.col, q.size * 2), q.x, q.y, 1, clamp(q.life / q.max, 0, 1));
  }
  ctx.globalCompositeOperation = 'source-over';
  // enemy bullets (drawn above particles for readability)
  const eb = glowSprite('#ff4f8b', 10, '#ffe6ef');
  for (const b of w.ebul) drawSprite(eb, b.x, b.y, b.r / 6);
  // rings
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dtR; const f = r.t / r.max; if (f >= 1) { rings.splice(i, 1); continue; } ctx.strokeStyle = r.col; ctx.globalAlpha = 1 - f; ctx.lineWidth = r.w * (1 - f) + 1; ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (0.3 + 0.7 * easeOut(f)), 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  // player
  drawWick(w);
  // floating texts
  ctx.textAlign = 'center';
  for (let i = texts.length - 1; i >= 0; i--) { const t = texts[i]; t.t += dtR; if (t.t >= t.max) { texts.splice(i, 1); continue; } const f = t.t / t.max; ctx.globalAlpha = 1 - f * f; ctx.fillStyle = t.col; ctx.font = `800 ${t.size}px ${dispFont()}`; ctx.fillText(t.txt, t.x, t.y - f * 26); }
  ctx.globalAlpha = 1;
  ctx.restore();
  // wildfire tint
  if (w.wild > 0) { ctx.fillStyle = `rgba(255,140,40,${0.10 + 0.04 * Math.sin(tReal * 20)})`; ctx.fillRect(0, 0, W, H); }
  if (w.starfall > 0) { ctx.fillStyle = 'rgba(255,216,74,.04)'; ctx.fillRect(0, 0, W, H); }
  // low hp vignette
  const hpf = w.p.hp / w.p.maxHp;
  if (hpf < 0.35 && !w.over) { const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.7); v.addColorStop(0, 'rgba(255,79,139,0)'); v.addColorStop(1, `rgba(255,79,139,${0.25 + 0.1 * Math.sin(tReal * 6)})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); }
  drawIndicators(w);
  drawStick();
  drawHud(w, dtR);
  if (flashA > 0.01) { ctx.globalAlpha = flashA * 0.6; ctx.fillStyle = flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}
function easeOut(f) { return 1 - Math.pow(1 - f, 3); }
function dispFont() { return '"Avenir Next Condensed","Futura","Gill Sans","Trebuchet MS",sans-serif'; }
function bodyFont() { return '"Avenir Next","Segoe UI",system-ui,sans-serif'; }
function hash2(i, j) { let h = (i * 374761393 + j * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function drawGround(x0, y0, x1, y1) {
  const c = 90, i0 = Math.floor(x0 / c), i1 = Math.floor(x1 / c), j0 = Math.floor(y0 / c), j1 = Math.floor(y1 / c);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const r = hash2(i, j), x = i * c + hash2(j, i) * c, y = j * c + r * c;
    if (r < 0.45) { ctx.strokeStyle = 'rgba(160,130,220,.16)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = -1; k <= 1; k++) { ctx.moveTo(x + k * 4, y); ctx.quadraticCurveTo(x + k * 6, y - 8, x + k * 9, y - 14 - r * 10); } ctx.stroke(); }
    else if (r < 0.55) { ctx.fillStyle = 'rgba(255,190,220,.22)'; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, TAU); ctx.fill(); }
    else if (r < 0.6) { ctx.fillStyle = 'rgba(127,214,166,.18)'; ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill(); }
  }
}
function drawWick(w) {
  const p = w.p, sc = skin();
  const blink = p.inv > 0 && w.wild <= 0 && Math.floor(tReal * 20) % 2 === 0;
  const near = w.st.near * (G.hasEvo(w, 'phantom') && p.moving ? 2 : 1);
  // graze ring hint when bullets are around
  if (w.ebul.length) { ctx.strokeStyle = `rgba(255,255,255,${0.10 + (rimT > 0 ? 0.4 : 0)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.62 + 6 + near, 0, TAU); ctx.stroke(); }
  if (w.tutorial && w.t > 11 && w.t < 22) { const pu = (tReal * 1.5) % 1; ctx.strokeStyle = `rgba(255,79,139,${0.6 * (1 - pu)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 20 + pu * 40, 0, TAU); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter';
  const wildC = w.wild > 0 ? '#ff8a3a' : sc.a;
  drawSprite(glowSprite(wildC, w.wild > 0 ? 54 : 34, sc.b), p.x, p.y, 1 + Math.sin(tReal * 8) * 0.05, blink ? 0.3 : 1);
  ctx.globalCompositeOperation = 'source-over';
  if (blink) return;
  const flap = Math.sin(tReal * 26) * 0.5 + 0.5, f = p.face;
  ctx.save(); ctx.translate(p.x, p.y);
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (0.5 + flap * 0.6)); ctx.beginPath(); ctx.ellipse(s * 9, -6, 9, 4, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = rimT > 0 ? '#ffffff' : sc.b; ctx.beginPath(); ctx.arc(0, 0, 6.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2a1606'; ctx.beginPath(); ctx.arc(Math.cos(f) * 3, Math.sin(f) * 3 - 1, 1.6, 0, TAU); ctx.fill();
  if (rimT > 0) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.stroke(); }
  ctx.restore();
}
function drawBoss(b) {
  const pul = 1 + Math.sin(tReal * 3) * 0.04;
  if (b.tele > 0) { ctx.strokeStyle = `rgba(255,79,139,${0.4 + 0.4 * Math.sin(tReal * 30)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + (b.tx - b.x) * 2.2, b.y + (b.ty - b.y) * 2.2); ctx.stroke(); }
  ctx.save(); ctx.translate(b.x, b.y); ctx.scale(pul, pul);
  ctx.shadowColor = '#ff4f8b'; ctx.shadowBlur = 24;
  ctx.fillStyle = b.flash > 0 ? '#ffffff' : '#0b0718'; ctx.strokeStyle = '#ff4f8b'; ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, rr = b.r * (i % 2 ? 0.82 : 1.08) + Math.sin(tReal * 5 + i) * 3; i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd0e0';
  const eyes = b.phase === 1 ? 2 : b.phase === 2 ? 4 : 6;
  for (let i = 0; i < eyes; i++) { const a = -Math.PI / 2 + (i - (eyes - 1) / 2) * 0.42; ctx.beginPath(); ctx.arc(Math.cos(a) * b.r * 0.42, Math.sin(a) * b.r * 0.42 + 8, 4, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function drawIndicators(w) {
  const tg = [];
  if (w.boss) tg.push([w.boss.x, w.boss.y, '#ff4f8b', 14]);
  if (w.comet) tg.push([w.comet.x, w.comet.y, '#ffd84a', 12]);
  if (w.stone) tg.push([w.stone.x, w.stone.y, '#ffb547', 12]);
  for (const m of w.moths) { const M = G.MOTH_BY[m.sp]; if (M.r >= 1) tg.push([m.x, m.y, G.RAR[M.r].col, 10]); }
  const top = 76, mg = 22;
  for (const [x, y, col, s] of tg) {
    const sx = W / 2 + (x - camX) * ZOOM, sy = H / 2 + (y - camY) * ZOOM;
    if (sx > 0 && sx < W && sy > top && sy < H) continue;
    const a = Math.atan2(sy - H / 2, sx - W / 2);
    const cx = clamp(sx, mg, W - mg), cy = clamp(sy, top + mg, H - mg - 10);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a); ctx.fillStyle = col; ctx.globalAlpha = 0.6 + 0.4 * Math.sin(tReal * 8);
    ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * 0.7, -s * 0.7); ctx.lineTo(-s * 0.3, 0); ctx.lineTo(-s * 0.7, s * 0.7); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawStick() {
  if (stick.id === null || mode !== 'play') return;
  ctx.strokeStyle = 'rgba(255,243,196,.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(stick.ox, stick.oy, STICK_R, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(255,243,196,.30)'; ctx.beginPath(); ctx.arc(stick.ox + stick.ax * STICK_R, stick.oy + stick.ay * STICK_R, 18, 0, TAU); ctx.fill();
}
function drawHud(w, dtR) {
  const sat = safeTop(), L = 12 + safeLeft(), R = W - 12 - safeRight(), top = sat + 8;
  const p = w.p, hpf = clamp(p.hp / p.maxHp, 0, 1);
  ghostHp = ghostHp > hpf ? Math.max(hpf, ghostHp - dtR * 0.4) : hpf;
  // XP strip at the very top
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(0, sat, W, 4);
  ctx.fillStyle = '#7fd6a6'; ctx.fillRect(0, sat, W * clamp(w.xp / G.xpFor(w, w.level), 0, 1), 4);
  // HP
  const bw = Math.min(170, W * 0.38);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; rr(L, top + 6, bw, 12, 6); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.5; rr(L, top + 6, bw * ghostHp, 12, 6); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = hpf < 0.35 ? '#ff4f8b' : '#ff8fb3'; rr(L, top + 6, Math.max(6, bw * hpf), 12, 6); ctx.fill();
  // Flare
  ctx.fillStyle = 'rgba(0,0,0,.4)'; rr(L, top + 23, bw, 9, 5); ctx.fill();
  const fl = w.wild > 0 ? w.wild / 4 : w.flare;
  ctx.fillStyle = w.wild > 0 ? '#ff8a3a' : '#ffb547'; rr(L, top + 23, Math.max(5, bw * fl), 9, 5); ctx.fill();
  ctx.font = '800 10px ' + dispFont(); ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,243,196,.8)'; ctx.fillText(w.wild > 0 ? 'WILDFIRE' : 'FLARE', L + 2, top + 44);
  // time
  ctx.textAlign = 'center'; ctx.fillStyle = '#f1ebff';
  let tlabel;
  if (w.longNight) tlabel = 'LONG ' + fmtT(w.longT);
  else if (w.boss) tlabel = 'THE HUSH';
  else if (w.dawn) tlabel = 'DAWN';
  else tlabel = fmtT(Math.max(0, G.BOSS_T - w.t));
  ctx.font = '800 22px ' + dispFont(); ctx.fillText(tlabel, W / 2, top + 22);
  ctx.font = '700 10px ' + dispFont(); ctx.fillStyle = 'rgba(241,235,255,.6)';
  ctx.fillText(w.longNight ? 'x' + (1 + 0.1 * Math.floor(w.longT / 60)).toFixed(1) + ' GLOW' : w.act === 1 ? 'DUSK' : w.act === 2 ? 'GLOAMING' : 'MIDNIGHT', W / 2, top + 36);
  // score + glow (right, under buttons)
  ctx.textAlign = 'right';
  ctx.font = '800 16px ' + dispFont(); ctx.fillStyle = bestPill > 0 ? '#ffd84a' : '#f1ebff';
  ctx.fillText(Math.floor(w.score).toLocaleString(), R - 104, top + 18);
  const g = G.curGlow(w), bk = w.banked;
  ctx.font = '700 11px ' + bodyFont(); ctx.fillStyle = '#ffb547';
  ctx.fillText(bk ? `${bk} banked · ${g - bk} at risk` : `${g} glow at risk`, R - 104, top + 33);
  // chain pill
  if (w.chain > 1) {
    const cx = W / 2, cy = top + 58, txt = 'GRAZE x' + w.chain + (w.chain >= 5 ? ' MAX' : ''), left = clamp(1 - (w.t - w.lastGrazeT) / 2.6, 0, 1);
    ctx.font = '800 15px ' + dispFont(); const tw = ctx.measureText(txt).width + 22;
    ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(cx - tw / 2, cy - 13, tw, 24, 12); ctx.fill();
    ctx.fillStyle = w.chain >= 5 ? '#ffd84a' : '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(txt, cx, cy + 4);
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(cx - tw / 2 + 8, cy + 9, (tw - 16) * left, 2);
  }
  if (bestPill > 0) { ctx.textAlign = 'center'; ctx.font = '800 13px ' + dispFont(); ctx.fillStyle = '#ffd84a'; ctx.fillText('NEW BEST', W / 2, top + 84); }
  // boss bar
  if (w.boss) {
    const b = w.boss, f = clamp(b.hp / b.maxHp, 0, 1); bossGhost = bossGhost > f ? Math.max(f, bossGhost - dtR * 0.25) : f;
    const bw2 = Math.min(W - 40, 420), bx = (W - bw2) / 2, by = H - safeBottom() - 34;
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rr(bx, by, bw2, 12, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; rr(bx, by, bw2 * bossGhost, 12, 6); ctx.fill();
    ctx.fillStyle = '#ff4f8b'; rr(bx, by, Math.max(6, bw2 * f), 12, 6); ctx.fill();
    ctx.textAlign = 'center'; ctx.font = '800 12px ' + dispFont(); ctx.fillStyle = '#ffd0e0'; ctx.fillText('THE HUSH', W / 2, by - 6);
  }
  // banners
  if (banner) {
    banner.t += dtR; const f = banner.t / banner.max; if (f >= 1) banner = null; else {
      const a = f < 0.1 ? f / 0.1 : f > 0.75 ? (1 - f) / 0.25 : 1, s = f < 0.1 ? 0.8 + f * 2 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, H * 0.34); ctx.scale(s, s); ctx.textAlign = 'center';
      const fs = Math.min(46, W / Math.max(8, banner.text.length) * 1.5);
      ctx.font = `800 ${fs}px ${dispFont()}`; ctx.shadowColor = banner.col; ctx.shadowBlur = 18; ctx.fillStyle = banner.col; ctx.fillText(banner.text, 0, 0); ctx.shadowBlur = 0;
      if (banner.sub) { ctx.font = '700 15px ' + bodyFont(); ctx.fillStyle = '#f1ebff'; ctx.fillText(banner.sub, 0, 26); }
      ctx.restore();
      if (banner.text === 'DRAG ANYWHERE TO FLY' && stick.id === null) drawGhostThumb();
    }
  }
  if (banner2) {
    banner2.t += dtR; const f = banner2.t / banner2.max; if (f >= 1) banner2 = null; else {
      const a = f < 0.12 ? f / 0.12 : f > 0.7 ? (1 - f) / 0.3 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = `800 ${Math.min(26, W / 14)}px ${dispFont()}`; ctx.fillStyle = banner2.col; ctx.shadowColor = banner2.col; ctx.shadowBlur = 12;
      ctx.fillText(banner2.text, W / 2, H * 0.22 + (1 - a) * -10); ctx.restore();
    }
  }
}
function drawGhostThumb() {
  const t = (tReal % 2) / 2, x = W / 2 + Math.sin(t * TAU) * 50, y = H * 0.62 + Math.cos(t * TAU) * 16;
  ctx.fillStyle = 'rgba(255,243,196,.25)'; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,243,196,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(W / 2, H * 0.62, 52, 0, TAU); ctx.stroke();
}
function drawTitleWick() {
  const x = W / 2, y = H * 0.42, sc = skin();
  ctx.globalCompositeOperation = 'lighter'; drawSprite(glowSprite(sc.a, 70, sc.b), x, y, 1 + Math.sin(tReal * 2) * 0.06, 0.8); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255,255,255,.5)'; const flap = Math.sin(tReal * 20) * 0.5 + 0.5;
  for (const s of [-1, 1]) { ctx.save(); ctx.translate(x, y); ctx.rotate(s * (0.5 + flap * 0.6)); ctx.beginPath(); ctx.ellipse(s * 14, -8, 14, 6, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = sc.b; ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fill();
}
function rr(x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, w / 2)); else ctx.rect(x, y, w, h); }
let insets = { t: 0, b: 0, l: 0, r: 0 };
function readInsets() {
  try { const cs = getComputedStyle(document.documentElement); insets.t = parseFloat(cs.paddingTop) || 0; insets.b = parseFloat(cs.paddingBottom) || 0; } catch (e) {}
}
function safeTop() { return insets.t; } function safeBottom() { return insets.b; } function safeLeft() { return 0; } function safeRight() { return 0; }

// ---------- LOOP ----------
let lastFrame = 0, lastPersist = 0, lastMisCheck = 0;
function frame(now) {
  const dtR = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000)); lastFrame = now; tReal += dtR;
  JU.update(dtR); flashA *= Math.pow(0.004, dtR); rimT = Math.max(0, rimT - dtR); bestPill = Math.max(0, bestPill - dtR);
  if (slowT > 0) { slowT -= dtR; if (slowT <= 0) timeScale = 1; }
  const w = world;
  if (w && mode === 'play') {
    if (hitstop > 0) hitstop -= dtR;
    else {
      let simDt = dtR * timeScale * GK.prefs.speed();
      const inp = readInput();
      while (simDt > 1e-6 && mode === 'play') { const d = Math.min(simDt, 1 / 60); G.step(w, inp, d); simDt -= d; handleEvents(); if (w.over || w.choices || w.awaitDawn) break; }
      // mid-run record
      if (!newBestShown && save.bestTime >= 20 && w.t > save.bestTime && !w.over) { newBestShown = true; bestPill = 3; setBanner2('NEW BEST TIME', '#ffd84a'); AU.sparkle(); burst(w.p.x, w.p.y, 60, '#ffd84a', 300, 4, 1); }
      if (now - lastMisCheck > 500) { lastMisCheck = now; checkMissions(); }
      AU.danger(w.p.hp / w.p.maxHp);
    }
  } else if (w && mode === 'ending') { G.step(w, readInput(), 0); }
  if (w) w.vw = W / ZOOM, w.vh = H / ZOOM;
  render(mode === 'play' ? dtR * (hitstop > 0 ? 0.15 : timeScale) : dtR * 0.6);
  if (now - lastPersist > 20000 && mode !== 'play') { lastPersist = now; persist(); }
  raf(frame);
}
const raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : (f => setTimeout(() => f(performance.now()), 16));

// ---------- BOOT ----------
const SAVE_UI = GK.ui.saveTools(PROT, { onImported: () => { save = loadSave(); rollDay(); BD = GK.badges.create(BADGES, save.badges, { toast: false }); wireBadges(); AU.applyVol(); updateMuteIcon(); showMenu('settings'); } });
function boot() {
  GK.audio.init();
  GK.juice.panel(JU, [
    { label: 'flashes', get: () => !!S().flash, set: v => { S().flash = v ? 1 : 0; persist(); } },
    { label: 'damage numbers', get: () => !!S().nums, set: v => { S().nums = v ? 1 : 0; persist(); } },
    { label: 'vibration', get: () => !!S().haptics, set: v => { S().haptics = v ? 1 : 0; persist(); } },
  ], { keys: ['shake', 'hitstop', 'particles'] });
  resize(); readInsets();
  window.addEventListener('resize', () => { resize(); readInsets(); });
  updateMuteIcon();
  showTitle();
  maybeOffline();
  persist();
  lastFrame = performance.now();
  raf(frame);
}
window.GLOAM = { act, get world() { return world; }, get mode() { return mode; }, get save() { return save; }, stick, startRun, shareText, nextUnlock, get badges() { return BD; }, juice: JU, protect: PROT };
const hot = window.claude && window.claude.hot;
if (hot && hot.ready) hot.ready(() => boot()); else boot();
})();
