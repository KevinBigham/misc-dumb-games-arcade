'use strict';
// ===== Thistlemarch UI: Storage, Audio, Renderer, Input, Screens =====
(function () {
  const C = Core;
  const $ = (s) => document.querySelector(s);
  const K_SAVE = 'thistlemarch.save.v1', K_PREV = 'thistlemarch.save.prev.v1', K_BEST = 'thistlemarch.best.v1',
    K_SET = 'thistlemarch.settings.v1', K_BAD = 'thistlemarch.corrupt.v1', K_DAILY = 'thistlemarch.daily.v1';

  // ===== Storage (try/catch everywhere) =====
  let storageOk = true;
  const Store = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); return true; } catch (e) { if (storageOk) { storageOk = false; toast('Saving is blocked in this browser. Progress lasts until you close the tab.'); } return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  };
  const settings = Object.assign({ sound: true, music: true, speed: 1 }, Store.get(K_SET) || {});
  function saveSettings() { Store.set(K_SET, settings); }
  const best = Object.assign({ stars: 0, campaigns: 0, daily: {} }, Store.get(K_BEST) || {});
  function saveBest() { Store.set(K_BEST, best); }

  // ===== App state =====
  const S = { screen: 'title', camp: null, battle: null, debrief: null, picks: [], daily: null, mode: 'campaign' };
  // UI-only state
  const U = { sel: null, pend: null, focus: null, cursor: null, endArm: 0, anim: [], cur: null, disp: null, prev: null, fx: [], floats: [], shake: 0, hintShown: {} };

  function persist() {
    if (S.mode === 'daily') { Store.set(K_DAILY, { v: 1, date: S.daily && S.daily.date, battle: S.battle, screen: S.screen }); return; }
    if (!S.camp) return;
    const snapObj = { v: 1, screen: S.screen, camp: S.camp, battle: S.battle, debrief: S.debrief };
    if (!C.validCampaign(snapObj.camp)) return; // never overwrite a good save with a bad one
    if (snapObj.battle && !C.validBattle(snapObj.battle)) snapObj.battle = null;
    const prev = Store.raw(K_SAVE); if (prev) Store.set(K_PREV, prev);
    Store.set(K_SAVE, snapObj);
  }
  function loadSave() {
    const raw = Store.raw(K_SAVE);
    if (!raw) return { ok: false };
    let o = null; try { o = JSON.parse(raw); } catch (e) { }
    if (!o || !C.validCampaign(o.camp)) {
      // try the previous good copy before giving up; keep the bad copy for recovery
      Store.set(K_BAD, raw);
      const pr = Store.raw(K_PREV); let p = null; try { p = JSON.parse(pr); } catch (e) { }
      if (p && C.validCampaign(p.camp)) { o = p; o.recovered = true; } else return { ok: false, corrupt: true };
    }
    if (o.battle && !C.validBattle(o.battle)) { o.battle = null; o.screen = 'brief'; o.repaired = true; }
    if (o.screen === 'battle' && !o.battle) o.screen = 'brief';
    return { ok: true, save: o };
  }

  // ===== Audio (generated, starts on first gesture, stops when hidden) =====
  const Snd = {
    ctx: null, master: null, mus: null, timer: null, step: 0, next: 0,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended' && !document.hidden) this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      try {
        this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
        this.mus = this.ctx.createGain(); this.mus.gain.value = 0.16; this.mus.connect(this.master);
      } catch (e) { this.ctx = null; return; }
      this.startMusic();
    },
    tone(f, d, type, vol, slide, delay, dest) {
      if (!this.ctx || !settings.sound) return;
      const t = this.ctx.currentTime + (delay || 0);
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + d + 0.02);
    },
    noise(d, vol, freq, delay) {
      if (!this.ctx || !settings.sound) return;
      const t = this.ctx.currentTime + (delay || 0);
      const len = Math.floor(this.ctx.sampleRate * d), buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), da = buf.getChannelData(0);
      for (let i = 0; i < len; i++) da[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = this.ctx.createBufferSource(); s.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 1200;
      const g = this.ctx.createGain(); g.gain.value = vol || 0.2;
      s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
    },
    play(n) {
      if (!this.ctx || !settings.sound) return;
      switch (n) {
        case 'tap': this.tone(660, 0.05, 'triangle', 0.08); break;
        case 'sel': this.tone(520, 0.06, 'triangle', 0.12); this.tone(780, 0.06, 'triangle', 0.08, 0, 0.05); break;
        case 'step': this.tone(300 + Math.random() * 40, 0.04, 'triangle', 0.07); break;
        case 'hit': this.noise(0.12, 0.35, 900); this.tone(160, 0.12, 'square', 0.12, 0.5); break;
        case 'ehit': this.noise(0.14, 0.32, 600); this.tone(110, 0.14, 'sawtooth', 0.1, 0.6); break;
        case 'bump': this.tone(90, 0.1, 'square', 0.16, 0.7); this.noise(0.08, 0.25, 400); break;
        case 'kill': this.tone(420, 0.08, 'square', 0.12, 1.6); this.tone(640, 0.12, 'triangle', 0.12, 1.3, 0.06); this.noise(0.18, 0.18, 2400); break;
        case 'fall': this.tone(300, 0.4, 'triangle', 0.16, 0.4); break;
        case 'heal': [660, 880, 1100].forEach((f, i) => this.tone(f, 0.12, 'sine', 0.1, 0, i * 0.06)); break;
        case 'miss': this.tone(240, 0.12, 'triangle', 0.08, 1.4); break;
        case 'spawn': this.noise(0.3, 0.2, 300); this.tone(70, 0.3, 'sine', 0.18, 1.5); break;
        case 'lob': this.tone(500, 0.2, 'sine', 0.08, 0.4); break;
        case 'turn': this.tone(392, 0.12, 'triangle', 0.12); this.tone(523, 0.18, 'triangle', 0.12, 0, 0.1); break;
        case 'eturn': this.tone(220, 0.16, 'sawtooth', 0.07); this.tone(196, 0.2, 'sawtooth', 0.07, 0, 0.12); break;
        case 'level': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, 'square', 0.08, 0, i * 0.08)); break;
        case 'win': [523, 659, 784, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.14, 0, i * 0.12)); break;
        case 'lose': [392, 349, 311, 262].forEach((f, i) => this.tone(f, 0.3, 'triangle', 0.13, 0, i * 0.18)); break;
        case 'breach': this.tone(140, 0.4, 'sawtooth', 0.14, 0.5); break;
        case 'err': this.tone(150, 0.1, 'square', 0.08); break;
      }
    },
    // gentle generated garden tune
    startMusic() {
      if (!this.ctx || this.timer) return;
      this.next = this.ctx.currentTime + 0.1; this.step = 0;
      const scale = [392, 440, 523.25, 587.33, 659.25, 783.99];
      const pat = [0, 2, 4, 2, 3, 1, 2, -1, 0, 2, 5, 4, 3, 2, 1, -1];
      this.timer = setInterval(() => {
        if (!this.ctx || document.hidden) return;
        if (!settings.music || !settings.sound) { this.next = this.ctx.currentTime + 0.1; return; }
        while (this.next < this.ctx.currentTime + 0.4) {
          const i = this.step % 16, n = pat[i], bar = Math.floor(this.step / 16) % 4;
          const tr = [1, 1.122, 0.891, 1][bar];
          if (n >= 0) this.toneAt(scale[n] * tr, 0.32, 'triangle', 0.5, this.next);
          if (i % 8 === 0) this.toneAt(scale[0] * tr / 2, 1.2, 'sine', 0.6, this.next);
          if (i % 4 === 2 && (this.step >> 4) % 2) this.toneAt(scale[(n + 2 + 6) % 6] * tr * 2, 0.12, 'sine', 0.18, this.next);
          this.next += 60 / 96 / 2; this.step++;
        }
      }, 120);
    },
    toneAt(f, d, type, vol, t) {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(this.mus); o.start(t); o.stop(t + d + 0.05);
    },
    hidden(h) {
      if (!this.ctx) return;
      try { if (h) this.ctx.suspend(); else if (settings.sound) this.ctx.resume(); } catch (e) { }
    },
  };
  document.addEventListener('visibilitychange', () => { Snd.hidden(document.hidden); });
  const unlockAudio = () => { Snd.init(); };
  window.addEventListener('pointerdown', unlockAudio, { capture: true });
  window.addEventListener('keydown', unlockAudio, { capture: true });

  // ===== Canvas renderer =====
  const cv = $('#board'), g = cv.getContext('2d');
  let TS = 56, DPR = 1;
  function resize() {
    const app = $('#app');
    const w = Math.min(window.innerWidth, 540) - 2 * Math.max(16, parseFloat(getComputedStyle(app).paddingLeft) || 16);
    const topH = 44 + ($('#obj').offsetHeight || 22) + 4;
    const h = window.innerHeight - topH - 150;
    const cols = S.battle ? S.battle.cols : 6, rows = S.battle ? S.battle.rows : 8;
    TS = Math.max(36, Math.floor(Math.min(w / cols, h / rows)));
    DPR = Math.min(3, window.devicePixelRatio || 1);
    cv.width = cols * TS * DPR; cv.height = rows * TS * DPR;
    cv.style.width = cols * TS + 'px'; cv.style.height = rows * TS + 'px';
    void app;
  }
  window.addEventListener('resize', () => { resize(); });

  const hsh = (x, y, k) => { let h = (x * 374761393 + y * 668265263 + (k || 0) * 2246822519) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return (h & 0xffff) / 0xffff; };
  const PAL = {
    meadow: '#a9cc6c', meadow2: '#9cc061', grass: '#7aa646', grassBlade: '#5d8a32', stone: '#c9c0aa', stoneDark: '#9c937e',
    mud: '#8c6a43', mud2: '#74552f', bramble: '#4c5a2c', thorn: '#2c3519', berry: '#c23b4a', bloomP: '#f08bb3', bloomC: '#ffd23f',
    hole: '#3a2a1a', gate: '#d9a441', thistle: '#9a5cc4', shade: 'rgba(72,48,132,0.34)', sun: 'rgba(255,226,120,0.10)',
  };

  function drawTile(ctx, b, x, y, s, ox, oy) {
    const c = C.code(b, x, y), px = ox + x * s, py = oy + y * s;
    const base = (x + y) % 2 ? PAL.meadow : PAL.meadow2;
    ctx.fillStyle = base; ctx.fillRect(px, py, s, s);
    // tufts
    ctx.strokeStyle = 'rgba(70,110,40,0.35)'; ctx.lineWidth = Math.max(1, s / 40);
    for (let i = 0; i < 3; i++) { const tx = px + hsh(x, y, i) * s * 0.8 + s * 0.1, ty = py + hsh(y, x, i + 7) * s * 0.8 + s * 0.15; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - s * 0.03, ty - s * 0.08); ctx.moveTo(tx, ty); ctx.lineTo(tx + s * 0.03, ty - s * 0.07); ctx.stroke(); }
    const cx = px + s / 2, cy = py + s / 2;
    if (c === 'g') {
      ctx.fillStyle = PAL.grass; ctx.fillRect(px, py, s, s);
      ctx.strokeStyle = PAL.grassBlade; ctx.lineWidth = Math.max(1.2, s / 28);
      for (let i = 0; i < 9; i++) { const bx = px + (i + 0.5) / 9 * s, by = py + s * (0.85 - hsh(x, y, i) * 0.1); ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + (hsh(x, i, y) - 0.5) * s * 0.2, by - s * 0.4, bx + (hsh(i, x, y) - 0.5) * s * 0.3, by - s * (0.55 + hsh(y, i, x) * 0.2)); ctx.stroke(); }
    } else if (c === 's') {
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(cx + s * 0.04, cy + s * 0.1, s * 0.4, s * 0.28, 0, 0, 7); ctx.fill();
      ctx.fillStyle = PAL.stone; ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.04, s * 0.4, s * 0.3, -0.2, 0, 7); ctx.fill();
      ctx.fillStyle = PAL.stoneDark; ctx.beginPath(); ctx.ellipse(cx + s * 0.08, cy + s * 0.12, s * 0.3, s * 0.15, -0.2, 0, Math.PI); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(cx - s * 0.14, cy - s * 0.08, s * 0.1, s * 0.05, -0.4, 0, 7); ctx.fill();
    } else if (c === 'm') {
      ctx.fillStyle = PAL.mud; ctx.fillRect(px, py, s, s);
      ctx.fillStyle = PAL.mud2;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(px + hsh(x, y, i + 3) * s, py + hsh(y, x, i + 9) * s, s * 0.14, s * 0.07, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.2, s * 0.05, 0, 0, 7); ctx.fill();
    } else if (c === '#') {
      ctx.fillStyle = PAL.bramble; ctx.fillRect(px, py, s, s);
      ctx.strokeStyle = PAL.thorn; ctx.lineWidth = Math.max(2, s / 14); ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); const a = hsh(x, y, i) * 6; ctx.arc(cx + Math.cos(a) * s * 0.15, cy + Math.sin(a) * s * 0.15, s * (0.25 + i * 0.06), a, a + 3.6); ctx.stroke(); }
      ctx.lineWidth = Math.max(1, s / 30); ctx.strokeStyle = '#1f2611';
      for (let i = 0; i < 8; i++) { const a = i * 0.8 + hsh(y, x, 1), r = s * 0.32; const tx = cx + Math.cos(a) * r, ty = cy + Math.sin(a) * r; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + Math.cos(a + 1.2) * s * 0.08, ty + Math.sin(a + 1.2) * s * 0.08); ctx.stroke(); }
      ctx.fillStyle = PAL.berry; for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.arc(px + hsh(x, y, i + 20) * s * 0.7 + s * 0.15, py + hsh(y, x, i + 21) * s * 0.7 + s * 0.15, s * 0.05, 0, 7); ctx.fill(); }
      ctx.lineCap = 'butt';
    } else if (c === 'b') {
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - 1.57; ctx.fillStyle = PAL.bloomP; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * s * 0.17, cy + Math.sin(a) * s * 0.17, s * 0.14, s * 0.09, a, 0, 7); ctx.fill(); }
      ctx.fillStyle = PAL.bloomC; ctx.beginPath(); ctx.arc(cx, cy, s * 0.1, 0, 7); ctx.fill();
    } else if (c === 'o') {
      ctx.fillStyle = '#6d5236'; ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.38, s * 0.3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = PAL.hole; ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.03, s * 0.27, s * 0.2, 0, 0, 7); ctx.fill();
    } else if (c === 'x') {
      ctx.fillStyle = 'rgba(255,220,120,0.35)'; ctx.fillRect(px, py, s, s);
      ctx.strokeStyle = PAL.gate; ctx.lineWidth = Math.max(2, s / 12);
      ctx.beginPath(); ctx.moveTo(px + s * 0.2, py + s * 0.9); ctx.lineTo(px + s * 0.2, py + s * 0.4); ctx.quadraticCurveTo(cx, py + s * 0.05, px + s * 0.8, py + s * 0.4); ctx.lineTo(px + s * 0.8, py + s * 0.9); ctx.stroke();
      ctx.fillStyle = PAL.thistle; ctx.beginPath(); ctx.arc(cx, py + s * 0.2, s * 0.1, 0, 7); ctx.fill();
    }
    ctx.strokeStyle = 'rgba(40,60,20,0.12)'; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
  }

  // ---- bug drawings (original, code-drawn) ----
  function drawBug(ctx, type, cx, cy, s, opts) {
    opts = opts || {};
    const up = opts.side === 'p' ? -1 : 1; // facing
    ctx.save(); ctx.translate(cx, cy);
    if (opts.scale) ctx.scale(opts.scale, opts.scale);
    const t = performance.now() / 1000;
    const bob = opts.still ? 0 : Math.sin(t * 3 + (opts.seed || 0)) * s * 0.015;
    ctx.translate(0, bob);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0, s * 0.18, s * 0.3, s * 0.12, 0, 0, 7); ctx.fill();
    const legs = (n, len, col, w) => {
      ctx.strokeStyle = col; ctx.lineWidth = w || Math.max(1.2, s / 30); ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const yy = (i - (n - 1) / 2) * s * 0.11; const wig = opts.still ? 0 : Math.sin(t * 8 + i) * s * 0.02;
        ctx.beginPath(); ctx.moveTo(-s * 0.1, yy); ctx.lineTo(-s * 0.1 - len, yy + up * s * 0.05 + wig); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * 0.1, yy); ctx.lineTo(s * 0.1 + len, yy + up * s * 0.05 - wig); ctx.stroke();
      }
    };
    switch (type) {
      case 'warden': {
        legs(3, s * 0.18, '#3a220f');
        ctx.fillStyle = '#5b3418'; ctx.beginPath(); ctx.ellipse(0, s * 0.05, s * 0.2, s * 0.25, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#2b170a'; ctx.lineWidth = Math.max(1, s / 40); ctx.beginPath(); ctx.moveTo(0, -s * 0.12); ctx.lineTo(0, s * 0.3); ctx.stroke();
        ctx.fillStyle = 'rgba(255,220,170,0.25)'; ctx.beginPath(); ctx.ellipse(-s * 0.08, 0, s * 0.05, s * 0.14, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#4a2a12'; ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.13, s * 0.08, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#b06a2a'; ctx.lineWidth = Math.max(2, s / 14); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-s * 0.08, -s * 0.24); ctx.quadraticCurveTo(-s * 0.26, -s * 0.38, -s * 0.06, -s * 0.46); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * 0.08, -s * 0.24); ctx.quadraticCurveTo(s * 0.26, -s * 0.38, s * 0.06, -s * 0.46); ctx.stroke();
        if (opts.captain) { ctx.fillStyle = '#ffcf3a'; ctx.beginPath(); ctx.moveTo(-s * 0.07, -s * 0.18); ctx.lineTo(-s * 0.04, -s * 0.26); ctx.lineTo(0, -s * 0.19); ctx.lineTo(s * 0.04, -s * 0.26); ctx.lineTo(s * 0.07, -s * 0.18); ctx.closePath(); ctx.fill(); }
        break;
      }
      case 'duelist': {
        legs(2, s * 0.16, '#2f6a1e');
        ctx.fillStyle = '#5aa83a'; ctx.beginPath(); ctx.ellipse(0, s * 0.1, s * 0.09, s * 0.26, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#7cc957'; ctx.beginPath(); ctx.moveTo(-s * 0.12, -s * 0.22); ctx.lineTo(s * 0.12, -s * 0.22); ctx.lineTo(0, -s * 0.36); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#1c3a10'; ctx.beginPath(); ctx.arc(-s * 0.07, -s * 0.24, s * 0.03, 0, 7); ctx.arc(s * 0.07, -s * 0.24, s * 0.03, 0, 7); ctx.fill();
        ctx.strokeStyle = '#3e8a26'; ctx.lineWidth = Math.max(2, s / 16);
        ctx.beginPath(); ctx.moveTo(-s * 0.06, -s * 0.1); ctx.lineTo(-s * 0.22, -s * 0.26); ctx.lineTo(-s * 0.12, -s * 0.42); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * 0.06, -s * 0.1); ctx.lineTo(s * 0.22, -s * 0.26); ctx.lineTo(s * 0.12, -s * 0.42); ctx.stroke();
        break;
      }
      case 'bomber': {
        legs(3, s * 0.13, '#3a1f10');
        ctx.fillStyle = '#e07a2e'; ctx.beginPath(); ctx.ellipse(0, s * 0.04, s * 0.2, s * 0.22, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#2a1a10'; ctx.fillRect(-s * 0.2, s * 0.0, s * 0.4, s * 0.06);
        ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.1, s * 0.07, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#ffd38a'; ctx.beginPath(); ctx.arc(0, s * 0.28, s * 0.05, 0, 7); ctx.fill();
        break;
      }
      case 'mender': {
        legs(3, s * 0.12, '#1d1d1d');
        ctx.fillStyle = '#d63a2e'; ctx.beginPath(); ctx.arc(0, s * 0.04, s * 0.22, 0, 7); ctx.fill();
        ctx.strokeStyle = '#3a0f0a'; ctx.lineWidth = Math.max(1, s / 40); ctx.beginPath(); ctx.moveTo(0, -s * 0.16); ctx.lineTo(0, s * 0.26); ctx.stroke();
        ctx.fillStyle = '#1d1d1d'; [[-0.1, -0.02], [0.1, -0.02], [-0.11, 0.13], [0.11, 0.13], [0, 0.08]].forEach(([a, bb]) => { ctx.beginPath(); ctx.arc(a * s, bb * s, s * 0.035, 0, 7); ctx.fill(); });
        ctx.fillStyle = '#1d1d1d'; ctx.beginPath(); ctx.ellipse(0, -s * 0.2, s * 0.11, s * 0.07, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-s * 0.05, -s * 0.21, s * 0.025, 0, 7); ctx.arc(s * 0.05, -s * 0.21, s * 0.025, 0, 7); ctx.fill();
        break;
      }
      case 'scout': {
        ctx.strokeStyle = '#4c8a22'; ctx.lineWidth = Math.max(2, s / 18); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-s * 0.06, s * 0.05); ctx.lineTo(-s * 0.28, -s * 0.08); ctx.lineTo(-s * 0.24, s * 0.32); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s * 0.06, s * 0.05); ctx.lineTo(s * 0.28, -s * 0.08); ctx.lineTo(s * 0.24, s * 0.32); ctx.stroke();
        legs(2, s * 0.1, '#3c7019');
        ctx.fillStyle = '#86c84a'; ctx.beginPath(); ctx.ellipse(0, s * 0.06, s * 0.1, s * 0.27, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#9ad85c'; ctx.beginPath(); ctx.ellipse(0, -s * 0.22, s * 0.08, s * 0.08, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#3c7019'; ctx.lineWidth = Math.max(1, s / 40); ctx.beginPath(); ctx.moveTo(-s * 0.03, -s * 0.28); ctx.lineTo(-s * 0.12, -s * 0.46); ctx.moveTo(s * 0.03, -s * 0.28); ctx.lineTo(s * 0.12, -s * 0.46); ctx.stroke();
        break;
      }
      case 'grub': {
        ctx.fillStyle = '#e8dcbc';
        for (let i = 0; i < 4; i++) { const a = 0.6 + i * 0.6; ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.12 - s * 0.04, Math.sin(a) * s * 0.16 * up - s * 0.05 * up, s * (0.13 - i * 0.015), 0, 7); ctx.fill(); }
        ctx.fillStyle = '#7fae3a'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(Math.cos(0.9 + i * 0.6) * s * 0.12 - s * 0.04, Math.sin(0.9 + i * 0.6) * s * 0.16 * up - s * 0.05 * up, s * 0.03, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.arc(s * 0.05, s * 0.18 * up, s * 0.09, 0, 7); ctx.fill();
        ctx.fillStyle = '#ff5a3a'; ctx.beginPath(); ctx.arc(s * 0.02, s * 0.2 * up, s * 0.02, 0, 7); ctx.arc(s * 0.09, s * 0.2 * up, s * 0.02, 0, 7); ctx.fill();
        break;
      }
      case 'gnat': {
        for (let i = 0; i < 3; i++) {
          const a = t * 6 + i * 2.1 + (opts.seed || 0), r = opts.still ? s * 0.12 : s * 0.13;
          const gx = Math.cos(a) * r, gy = Math.sin(a * 1.3) * r * 0.8;
          ctx.fillStyle = 'rgba(220,230,255,0.6)'; ctx.beginPath(); ctx.ellipse(gx - s * 0.05, gy - s * 0.03, s * 0.06, s * 0.035, -0.5, 0, 7); ctx.ellipse(gx + s * 0.05, gy - s * 0.03, s * 0.06, s * 0.035, 0.5, 0, 7); ctx.fill();
          ctx.fillStyle = '#2b2533'; ctx.beginPath(); ctx.arc(gx, gy, s * 0.05, 0, 7); ctx.fill();
          ctx.fillStyle = '#ff4a4a'; ctx.beginPath(); ctx.arc(gx, gy + s * 0.03 * up, s * 0.015, 0, 7); ctx.fill();
        }
        break;
      }
      case 'shell': {
        ctx.fillStyle = '#9d9a86'; ctx.beginPath(); ctx.ellipse(0, s * 0.12 * up, s * 0.13, s * 0.26, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#9d9a86'; ctx.lineWidth = Math.max(1, s / 30); ctx.beginPath(); ctx.moveTo(-s * 0.04, s * 0.34 * up); ctx.lineTo(-s * 0.08, s * 0.44 * up); ctx.moveTo(s * 0.04, s * 0.34 * up); ctx.lineTo(s * 0.08, s * 0.44 * up); ctx.stroke();
        ctx.fillStyle = '#6f4f8a'; ctx.beginPath(); ctx.arc(0, -s * 0.03 * up, s * 0.24, 0, 7); ctx.fill();
        ctx.strokeStyle = '#3e2a55'; ctx.lineWidth = Math.max(1.5, s / 22); ctx.beginPath();
        for (let a = 0; a < 12; a += 0.2) { const r = s * 0.22 * (1 - a / 13); const xx = Math.cos(a) * r, yy = -s * 0.03 * up + Math.sin(a) * r; if (a === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
        ctx.stroke();
        break;
      }
      case 'spitter': {
        legs(2, s * 0.14, '#3c2448');
        ctx.fillStyle = '#8b4fa3'; ctx.beginPath(); ctx.ellipse(0, -s * 0.04 * up, s * 0.24, s * 0.22, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-s * 0.08, -s * 0.1, s * 0.07, s * 0.04, -0.4, 0, 7); ctx.fill();
        ctx.fillStyle = '#6cc04a'; ctx.beginPath(); ctx.arc(0, s * 0.2 * up, s * 0.07, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.ellipse(s * 0.04, s * 0.29 * up, s * 0.025, s * 0.04, 0, 0, 7); ctx.fill();
        break;
      }
      case 'mother': {
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, s * 0.25, s * 0.55, s * 0.18, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#5b4636'; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.5, s * 0.42, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#6f8a3a'; for (let i = 0; i < 7; i++) { const a = i * 0.9; ctx.beginPath(); ctx.arc(Math.cos(a) * s * 0.3, Math.sin(a) * s * 0.25 - s * 0.05, s * 0.08, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#e6d34a'; for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; const ex = Math.cos(a) * s * 0.22, ey = Math.sin(a) * s * 0.1 + s * 0.12; ctx.beginPath(); ctx.arc(ex, ey, s * 0.05, 0, 7); ctx.fill(); ctx.fillStyle = '#1b1208'; ctx.beginPath(); ctx.arc(ex, ey + s * 0.01, s * 0.022, 0, 7); ctx.fill(); ctx.fillStyle = '#e6d34a'; }
        ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = Math.max(2, s / 14); ctx.beginPath(); ctx.arc(0, s * 0.22, s * 0.16, 0.3, 2.8); ctx.stroke();
        break;
      }
    }
    ctx.restore();
  }

  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function badge(ctx, x, y, txt, bg, fg, s) {
    const bf = GK.ui.floor(s * 0.24); ctx.font = '700 ' + Math.round(bf) + 'px Trebuchet MS, sans-serif';
    const w = Math.max(s * 0.3, ctx.measureText(txt).width + s * 0.14), h = Math.max(s * 0.3, bf * 1.25);
    ctx.fillStyle = bg; rr(ctx, x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, x, y + 1);
  }
  function arrow(ctx, x1, y1, x2, y2, col, w, dash, curve) {
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash || []);
    ctx.beginPath(); ctx.moveTo(x1, y1);
    let ex = x2, ey = y2, ang;
    if (curve) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - curve; ctx.quadraticCurveTo(mx, my, x2, y2); ang = Math.atan2(y2 - my, x2 - mx); }
    else { ctx.lineTo(x2, y2); ang = Math.atan2(y2 - y1, x2 - x1); }
    ctx.stroke(); ctx.setLineDash([]);
    const hl = w * 3.2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - Math.cos(ang - 0.45) * hl, ey - Math.sin(ang - 0.45) * hl); ctx.lineTo(ex - Math.cos(ang + 0.45) * hl, ey - Math.sin(ang + 0.45) * hl); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // main board draw. ov: overrides for animation
  function drawBoard(b, ov) {
    ov = ov || {};
    const s = TS, now = performance.now();
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    let sx = 0, sy = 0;
    if (U.shake > 0) { sx = (Math.random() - 0.5) * U.shake; sy = (Math.random() - 0.5) * U.shake; U.shake *= 0.85; if (U.shake < 0.3) U.shake = 0; }
    g.clearRect(0, 0, cv.width, cv.height);
    g.save(); g.translate(sx, sy);
    for (let y = 0; y < b.rows; y++) for (let x = 0; x < b.cols; x++) drawTile(g, b, x, y, s, 0, 0);
    // shade band (+ crossfade during shade animation)
    const drawShade = (row, alpha) => {
      if (!b.shade || !b.shade.h) return;
      const rows = C.shadeRowsAt(b, row);
      g.globalAlpha = alpha;
      for (const r of rows) { g.fillStyle = PAL.shade; g.fillRect(0, r * s, b.cols * s, s); }
      g.globalAlpha = 1;
    };
    if (b.shade && b.shade.h) {
      if (ov.shadeFrom != null) { drawShade(ov.shadeFrom, 1 - ov.shadeP); drawShade(b.shade.row, ov.shadeP); }
      else drawShade(b.shade.row, 1);
      // sunlit warmth
      const sh = C.shadeRowsAt(b, b.shade.row);
      for (let y = 0; y < b.rows; y++) if (!sh.has(y)) { g.fillStyle = PAL.sun; g.fillRect(0, y * s, b.cols * s, s); }
      // next shade preview: dotted violet edges
      if (b.phase === 'player' && !ov.busy) {
        const nx = C.nextShadeRows(b);
        g.save(); g.strokeStyle = 'rgba(110,70,190,0.75)'; g.lineWidth = 2; g.setLineDash([3, 5]);
        for (const r of nx) if (!sh.has(r)) { g.strokeRect(2, r * s + 2, b.cols * s - 4, s - 4); }
        g.restore();
      }
    } else {
      g.fillStyle = PAL.sun; g.fillRect(0, 0, b.cols * s, b.rows * s);
    }
    // back row marker for hold maps
    if (b.obj.kind === 'hold') {
      g.save(); g.strokeStyle = 'rgba(200,50,40,0.7)'; g.lineWidth = 3; g.setLineDash([8, 6]);
      g.beginPath(); g.moveTo(0, b.rows * s - 2); g.lineTo(b.cols * s, b.rows * s - 2); g.stroke(); g.restore();
    }
    // seedling
    if (b.seedling && b.seedling.hp > 0) {
      const px = b.seedling.x * s + s / 2, py = b.seedling.y * s + s / 2;
      g.fillStyle = '#6a4a2a'; g.beginPath(); g.ellipse(px, py + s * 0.22, s * 0.2, s * 0.08, 0, 0, 7); g.fill();
      g.strokeStyle = '#3d7a24'; g.lineWidth = s / 14; g.beginPath(); g.moveTo(px, py + s * 0.22); g.quadraticCurveTo(px - s * 0.05, py, px, py - s * 0.15); g.stroke();
      g.fillStyle = '#6fc24a'; g.beginPath(); g.ellipse(px - s * 0.13, py - s * 0.12, s * 0.13, s * 0.07, -0.5, 0, 7); g.ellipse(px + s * 0.13, py - s * 0.17, s * 0.13, s * 0.07, 0.5, 0, 7); g.fill();
      pips(b.seedling.x * s, b.seedling.y * s, b.seedling.hp, b.seedling.maxHp, '#3f9a2e');
    }
    // pending spawns
    for (const sp of b.pending || []) {
      const px = sp.x * s + s / 2, py = sp.y * s + s / 2, pul = 0.5 + 0.5 * Math.sin(now / 250);
      g.save(); g.globalAlpha = 0.35 + 0.2 * pul; drawBug(g, sp.type, px, py, s * 0.8, { side: 'e', still: true }); g.restore();
      g.save(); g.strokeStyle = 'rgba(180,40,40,' + (0.5 + 0.4 * pul) + ')'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.arc(px, py, s * 0.42, 0, 7); g.stroke(); g.restore();
    }
    // selection overlays
    if (ov.overlay) ov.overlay();
    // units
    const list = b.units.slice().sort((a, c) => a.y - c.y);
    for (const u of list) drawUnitAt(b, u, ov);
    if (ov.extra) for (const x of ov.extra) drawUnitAt(b, x.u, ov, x.alpha);
    // drifting motes: pollen in the sun, spores in the shade
    if (!RM) {
      const t = now / 1000, W = b.cols * s, H = b.rows * s, sh = b.shade && b.shade.h ? C.shadeRowsAt(b, b.shade.row) : null;
      for (let i = 0; i < 14; i++) {
        const k = (i * 0.6180339) % 1, mx = (k * W + t * (6 + 9 * k)) % W, my = ((i * 0.37) % 1) * H + Math.sin(t * 0.8 + i) * s * 0.2;
        const shaded = sh && sh.has(Math.max(0, Math.min(b.rows - 1, Math.floor(my / s))));
        g.fillStyle = shaded ? 'rgba(190,160,240,0.45)' : 'rgba(255,245,170,0.6)';
        g.beginPath(); g.arc(mx, my, 1 + 1.5 * k, 0, 7); g.fill();
      }
    }
    // intents
    if (!ov.noIntents) drawIntents(b);
    if (ov.top) ov.top();
    // effects
    drawFx();
    g.restore();
  }
  function pips(px, py, hp, max, col) {
    const s = TS, n = max, w = Math.min(s * 0.12, (s * 0.84) / n - 1.5), gap = 1.5, tot = n * w + (n - 1) * gap;
    let x0 = px + (s - tot) / 2; const y0 = py + s - s * 0.12;
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x0 - 2, y0 - 2, tot + 4, s * 0.08 + 4);
    for (let i = 0; i < n; i++) { g.fillStyle = i < hp ? col : 'rgba(255,255,255,0.25)'; g.fillRect(x0 + i * (w + gap), y0, w, s * 0.08); }
  }
  function drawUnitAt(b, u, ov, alpha) {
    const s = TS;
    let x = u.x, y = u.y, dx = 0, dy = 0, sc = 1;
    if (ov.pos && ov.pos[u.id]) { x = ov.pos[u.id][0]; y = ov.pos[u.id][1]; }
    if (ov.off && ov.off[u.id]) { dx = ov.off[u.id][0]; dy = ov.off[u.id][1]; }
    if (ov.scale && ov.scale[u.id] != null) sc = ov.scale[u.id];
    const px = x * s, py = y * s;
    g.save();
    if (alpha != null) g.globalAlpha = alpha;
    const done = u.side === 'p' && u.acted && b.phase === 'player';
    if (done) g.globalAlpha = (alpha != null ? alpha : 1) * 0.55;
    // team ring
    g.strokeStyle = u.side === 'p' ? (u.captain ? 'rgba(255,205,60,0.9)' : 'rgba(255,250,230,0.8)') : 'rgba(150,30,60,0.6)';
    g.lineWidth = 2; g.beginPath(); g.ellipse(px + s / 2 + dx, py + s * 0.62 + dy, s * 0.36, s * 0.16, 0, 0, 7); g.stroke();
    drawBug(g, u.type, px + s / 2 + dx, py + s / 2 + dy, s * (C.UNIT_TYPES[u.type].boss ? 1.15 : 1), { side: u.side, captain: u.captain, seed: u.id, scale: sc });
    g.globalAlpha = alpha != null ? alpha : 1;
    pips(px + dx, py + dy, Math.max(0, u.hp), u.maxHp, u.side === 'p' ? '#59c43a' : '#e0473a');
    if (u.side === 'p' && u.level > 1) {
      g.fillStyle = '#ffcf3a'; g.font = '700 ' + Math.round(GK.ui.floor(s * 0.2)) + 'px sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
      g.fillText('★'.repeat(Math.min(3, u.level - 1)), px + 3 + dx, py + 2 + dy);
    }
    if (u.armor) { g.fillStyle = '#d8d8d8'; g.font = '700 ' + Math.round(GK.ui.floor(s * 0.18)) + 'px sans-serif'; g.textAlign = 'right'; g.textBaseline = 'top'; g.fillText('⛨' + u.armor, px + s - 3 + dx, py + 2 + dy); }
    g.restore();
  }

  function center(x, y) { return [x * TS + TS / 2, y * TS + TS / 2]; }
  function drawIntents(b) {
    const s = TS;
    if (b.phase !== 'player') return;
    const preds = C.predictAll(b);
    const tally = {};
    for (const p of preds) {
      const e = C.getUnit(b, p.id); if (!e) continue;
      const r = p.r; const [ex, ey] = center(e.x, e.y);
      const focusOn = U.focus == null || U.focus === e.id;
      g.save(); g.globalAlpha = focusOn ? 1 : 0.25;
      if (r.fizzle) {
        if (r.tx != null) { const [tx, ty] = center(r.tx, r.ty); arrow(g, ex, ey - s * 0.1, tx, ty, 'rgba(90,90,90,0.8)', 2, [4, 4]); badge(g, tx, ty - s * 0.32, '✕ out of reach', 'rgba(70,70,70,0.9)', '#fff', s * 0.75); }
      } else {
        const [tx, ty] = center(r.tx, r.ty);
        const lob = e.intent.k === 'tile';
        let ex0 = ex, ey0 = ey;
        if (r.lunge) {
          // show the lunge step: ghost footprint on the tile it will jump to
          const [lx, ly] = center(r.lunge.x, r.lunge.y);
          g.save(); g.globalAlpha *= 0.55; g.fillStyle = 'rgba(210,40,40,0.35)';
          g.beginPath(); g.arc(lx, ly, s * 0.22, 0, Math.PI * 2); g.fill(); g.restore();
          arrow(g, ex, ey, lx, ly, 'rgba(210,40,40,0.7)', 2, [3, 3]);
          badge(g, lx, ly + s * 0.3, 'lunge', 'rgba(122,29,29,0.9)', '#fff', s * 0.6);
          ex0 = lx; ey0 = ly;
        }
        const col = lob ? 'rgba(235,140,30,0.95)' : 'rgba(210,40,40,0.95)';
        arrow(g, ex0, ey0 - s * 0.12, tx, ty + (lob ? 0 : s * 0.05), col, Math.max(2, s / 22), lob ? [6, 4] : null, lob ? s * 0.8 : 0);
        // target ring(s)
        for (const [hx, hy] of sweepList(b, e, r.tx, r.ty)) {
          g.strokeStyle = col; g.lineWidth = 2.5; g.setLineDash(lob ? [5, 4] : []);
          g.strokeRect(hx * s + 3, hy * s + 3, s - 6, s - 6); g.setLineDash([]);
          if (lob) { g.beginPath(); g.moveTo(hx * s + s * 0.3, hy * s + s / 2); g.lineTo(hx * s + s * 0.7, hy * s + s / 2); g.moveTo(hx * s + s / 2, hy * s + s * 0.3); g.lineTo(hx * s + s / 2, hy * s + s * 0.7); g.stroke(); }
        }
        for (const h of r.hits) {
          const k = h.x + ',' + h.y; tally[k] = (tally[k] || 0) + h.dmg;
        }
      }
      // order number on the foe
      badge(g, e.x * s + s * 0.18, e.y * s + s * 0.18, String(e.intent.order), r.fizzle ? '#777' : '#7a1d1d', '#fff', s * 0.8);
      g.restore();
    }
    // total predicted damage per tile
    for (const k in tally) {
      const [x, y] = k.split(',').map(Number);
      const v = C.unitAt(b, x, y);
      const lethal = v ? tally[k] >= v.hp : (b.seedling && tally[k] >= b.seedling.hp);
      badge(g, x * s + s * 0.78, y * s + s * 0.2, (lethal ? '☠ ' : '-') + tally[k], lethal ? '#000' : '#c62828', '#fff', s * 0.85);
    }
    // breach warnings
    if (b.obj.kind === 'hold') {
      for (const e of C.foes(b)) {
        const r = C.reachable(b, e, { full: true });
        for (const n of r.values()) if (n.y === b.rows - 1) { badge(g, e.x * s + s * 0.8, e.y * s + s * 0.8, '⚠', '#e8a317', '#000', s * 0.8); break; }
      }
    }
  }
  function sweepList(b, e, tx, ty) {
    const out = [[tx, ty]];
    if (C.UNIT_TYPES[e.type].sweep) { const dx = Math.sign(tx - e.x), dy = Math.sign(ty - e.y); out.push([tx + dy, ty + dx], [tx - dy, ty - dx]); }
    return out.filter(([x, y]) => C.inB(b, x, y));
  }

  // ---- floating text and particles ----
  function floatText(x, y, txt, col, big) { U.floats.push({ x: x * TS + TS / 2, y: y * TS + TS * 0.3, txt, col, t0: performance.now(), big }); }
  function burst(x, y, col, n) {
    n = Math.round((n || 12) * GK.prefs.motionScale()); for (let i = 0; i < n; i++) { const a = Math.random() * 7, sp = 30 + Math.random() * 90; U.fx.push({ x: x * TS + TS / 2, y: y * TS + TS / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, t0: performance.now(), life: 500 + Math.random() * 300, col }); }
  }
  function drawFx() {
    const now = performance.now();
    U.fx = U.fx.filter(p => now - p.t0 < p.life);
    for (const p of U.fx) {
      const t = (now - p.t0) / 1000; const a = 1 - (now - p.t0) / p.life;
      g.globalAlpha = a; g.fillStyle = p.col; g.fillRect(p.x + p.vx * t - 2, p.y + p.vy * t + 120 * t * t - 2, 4, 4);
    }
    g.globalAlpha = 1;
    U.floats = U.floats.filter(f => now - f.t0 < 900);
    for (const f of U.floats) {
      const p = (now - f.t0) / 900;
      g.globalAlpha = 1 - p * p; g.font = '800 ' + Math.round(GK.ui.floor(TS * (f.big ? 0.36 : 0.3))) + 'px Trebuchet MS, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.6)';
      const yy = f.y - p * TS * 0.6; g.strokeText(f.txt, f.x, yy); g.fillStyle = f.col; g.fillText(f.txt, f.x, yy);
    }
    g.globalAlpha = 1;
  }

  // ===== animation queue =====
  const DUR = { move: 110, emove: 110, push: 150, bump: 170, pstrike: 240, strike: 260, hurt: 140, death: 300, spawn: 320, heal: 240, mend: 260,
    fizzle: 300, shade: 380, level: 650, breach: 420, phase: 480, blocked: 300, intents: 0, won: 0, lost: 0 };
  function durOf(e) {
    let d = DUR[e.k] == null ? 150 : DUR[e.k];
    if (e.path) d = d * Math.max(1, e.path.length - 1);
    const sp = (settings.speed || 1) * (U.ff ? 3 : 1);
    if (window.TM_DEBUG && window.TM_DEBUG.fast) return 1;
    return d / sp;
  }
  function runEvents(events, pre) {
    U.disp = pre; U.anim = events.slice(); U.cur = null; U.ff = false; U.sel = U.sel; tick();
  }
  function startEvent(e) {
    U.cur = { e, t0: performance.now(), d: durOf(e), prev: U.disp };
    const kk = e.k;
    if (kk === 'hurt') {
      floatText(e.x, e.y, '-' + e.dmg, e.side === 'p' || e.side === 'seed' ? '#ff6b5a' : '#fff27a', e.dmg >= 3);
      U.shake = Math.min(10, 3 + e.dmg * 2) * GK.prefs.motionScale(); burst(e.x, e.y, e.side === 'e' ? '#d9f27a' : '#ff8a70', 6);
      Snd.play(e.side === 'e' ? 'hit' : 'ehit');
    } else if (kk === 'death') { burst(e.x, e.y, e.side === 'e' ? '#b9e05a' : '#ffd0a0', 20); U.shake = 8 * GK.prefs.motionScale(); Snd.play(e.side === 'e' ? 'kill' : 'fall'); if (e.side === 'p') floatText(e.x, e.y, 'fallen', '#ffd0a0'); }
    else if (kk === 'heal' || kk === 'mend') { floatText(e.x, e.y, '+' + e.amt, '#8dff7a'); Snd.play('heal'); burst(e.x, e.y, '#9dff8a', 8); }
    else if (kk === 'fizzle') { floatText(e.tx, e.ty, 'miss', '#dddddd'); Snd.play('miss'); }
    else if (kk === 'strike' && e.miss) { floatText(e.tx, e.ty, 'miss', '#dddddd'); Snd.play('miss'); }
    else if (kk === 'strike') { const u = C.getUnit(e.s, e.id) || C.getUnit(U.disp, e.id); if (u && C.UNIT_TYPES[u.type].lob) Snd.play('lob'); }
    else if (kk === 'spawn') { Snd.play('spawn'); burst(e.x, e.y, '#6b4a2a', 14); }
    else if (kk === 'blocked') { floatText(e.x, e.y, 'blocked!', '#ffe08a'); Snd.play('bump'); }
    else if (kk === 'bump') { Snd.play('bump'); U.shake = 6 * GK.prefs.motionScale(); }
    else if (kk === 'level') { floatText(e.x, e.y, 'LEVEL UP', '#ffd23f', true); Snd.play('level'); burst(e.x, e.y, '#ffd23f', 18); }
    else if (kk === 'breach') { floatText(e.x, e.y, 'gate cracked!', '#ff7a5a', true); Snd.play('breach'); U.shake = 10 * GK.prefs.motionScale(); }
    else if (kk === 'phase') { banner(e.who === 'e' ? 'The Rot moves' : 'Your turn · Round ' + e.s.round); Snd.play(e.who === 'e' ? 'eturn' : 'turn'); }
    else if (kk === 'move' || kk === 'emove') { Snd.play('step'); }
    else if (kk === 'shade') { }
    else if (kk === 'won') Snd.play('win');
    else if (kk === 'lost') Snd.play('lose');
  }
  function animOverrides() {
    const cur = U.cur; if (!cur) return { base: U.disp || S.battle };
    const e = cur.e, p = Math.min(1, (performance.now() - cur.t0) / Math.max(1, cur.d));
    const ov = { busy: true };
    let base = cur.prev;
    if (e.k === 'move' || e.k === 'emove') {
      const path = e.path || [[e.fx, e.fy], [e.x, e.y]];
      const seg = p * (path.length - 1), i = Math.min(path.length - 2, Math.floor(seg)), f = seg - i;
      const a = path[i], c = path[i + 1] || a;
      ov.pos = {}; ov.pos[e.id] = [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f];
      ov.noIntents = e.k === 'emove';
    } else if (e.k === 'push') {
      ov.pos = {}; ov.pos[e.id] = [e.fx + (e.x - e.fx) * p, e.fy + (e.y - e.fy) * p];
    } else if (e.k === 'bump') {
      const k = Math.sin(p * Math.PI) * 0.18; ov.pos = {}; ov.pos[e.id] = [e.x + (e.tx - e.x) * k, e.y + (e.ty - e.y) * k];
    } else if (e.k === 'pstrike' || e.k === 'strike') {
      const k = Math.sin(p * Math.PI) * 0.3; ov.off = {};
      const tx = e.tx, ty = e.ty, fx = e.x, fy = e.y;
      const d = Math.max(1, Math.hypot(tx - fx, ty - fy));
      ov.off[e.id] = [(tx - fx) / d * k * TS, (ty - fy) / d * k * TS];
      ov.top = () => { if (e.k === 'strike' && base) { const u = C.getUnit(base, e.id); if (u && C.UNIT_TYPES[u.type].lob) { const [ax, ay] = center(fx, fy), [bx, by] = center(tx, ty); const q = p; const x = ax + (bx - ax) * q, y = ay + (by - ay) * q - Math.sin(q * Math.PI) * TS; g.fillStyle = '#7cd14a'; g.beginPath(); g.arc(x, y, TS * 0.09, 0, 7); g.fill(); } } };
    } else if (e.k === 'death') {
      base = e.s; const du = C.getUnit(cur.prev, e.id);
      if (du) ov.extra = [{ u: du, alpha: 1 - p }];
    } else if (e.k === 'spawn') {
      base = e.s; ov.scale = {}; ov.scale[e.id] = 0.3 + 0.7 * p;
    } else if (e.k === 'shade') {
      base = e.s; ov.shadeFrom = cur.prev.shade ? cur.prev.shade.row : null; ov.shadeP = p;
    } else if (e.k === 'breach') {
      const du = C.getUnit(cur.prev, e.id); base = e.s; if (du) ov.extra = [{ u: du, alpha: 1 - p }];
    } else base = e.s;
    if (e.k !== 'intents' && e.k !== 'phase') ov.noIntents = true;
    ov.base = base;
    return ov;
  }
  let rafOn = false;
  function tick() { if (!rafOn) { rafOn = true; requestAnimationFrame(frame); } }
  function frame() {
    rafOn = false;
    if (S.screen !== 'battle' || !S.battle) return;
    const now = performance.now();
    if (U.cur && now - U.cur.t0 >= U.cur.d) { U.disp = U.cur.e.s; U.cur = null; }
    while (!U.cur && U.anim.length) {
      const e = U.anim.shift(); startEvent(e);
      if (U.cur.d <= 0) { U.disp = e.s; U.cur = null; }
    }
    const animating = !!U.cur || U.anim.length > 0;
    if (!animating && U.disp) { U.disp = null; afterAnim(); }
    const ov = animating ? animOverrides() : {};
    const base = ov.base || S.battle;
    if (!animating) ov.overlay = drawSelection;
    drawBoard(base, ov);
    if (!document.hidden) { rafOn = true; requestAnimationFrame(frame); }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  function busy() { return !!U.cur || U.anim.length > 0; }

  // ===== selection & input =====
  function selUnit() { return U.sel != null && S.battle ? C.getUnit(S.battle, U.sel) : null; }
  function drawSelection() {
    const b = S.battle, s = TS; if (!b || b.phase !== 'player') return;
    const now = performance.now();
    const u = selUnit();
    if (U.focus != null) {
      // threat area of a tapped foe
      const e = C.getUnit(b, U.focus);
      if (e) {
        const area = new Set();
        for (const n of C.reachable(b, e, { full: true }).values()) for (const [x, y] of C.tilesInReach(b, e, n.x, n.y)) area.add(x + ',' + y);
        g.fillStyle = 'rgba(220,50,50,0.16)';
        for (const k of area) { const [x, y] = k.split(',').map(Number); g.fillRect(x * s, y * s, s, s); }
      }
    }
    if (u) {
      g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(u.x * s + 2, u.y * s + 2, s - 4, s - 4);
      if (!u.moved && !u.acted) {
        for (const n of C.reachable(b, u).values()) {
          if (n.x === u.x && n.y === u.y) continue;
          g.fillStyle = 'rgba(70,150,255,0.33)'; g.fillRect(n.x * s + 1, n.y * s + 1, s - 2, s - 2);
          g.strokeStyle = 'rgba(40,110,230,0.6)'; g.lineWidth = 1; g.strokeRect(n.x * s + 3, n.y * s + 3, s - 6, s - 6);
        }
      }
      if (!u.acted) {
        const pul = 0.6 + 0.4 * Math.sin(now / 180);
        for (const t of C.actTargets(b, u)) {
          g.strokeStyle = t.kind === 'heal' ? 'rgba(60,220,90,' + pul + ')' : 'rgba(255,60,60,' + pul + ')';
          g.lineWidth = 3.5; g.strokeRect(t.x * s + 4, t.y * s + 4, s - 8, s - 8);
          // quick damage preview
          const v = C.unitAt(b, t.x, t.y);
          if (t.kind === 'attack' && v) { const d = C.calcDamage(b, u, u.x, u.y, v, v.x, v.y).dmg; badge(g, t.x * s + s * 0.5, t.y * s + s * 0.86, (d >= v.hp ? '☠' : '') + d, d >= v.hp ? '#1d5e12' : '#2f6fd0', '#fff', s * 0.75); }
        }
      }
    }
    if (U.pend) { g.strokeStyle = '#ffe14a'; g.lineWidth = 4; g.strokeRect(U.pend.x * s + 1, U.pend.y * s + 1, s - 2, s - 2); }
    if (U.cursor) { g.save(); g.strokeStyle = '#fff'; g.setLineDash([4, 3]); g.lineWidth = 2; g.strokeRect(U.cursor[0] * s + 6, U.cursor[1] * s + 6, s - 12, s - 12); g.restore(); }
  }

  function tileFromEvent(ev) {
    const r = cv.getBoundingClientRect();
    const x = Math.floor((ev.clientX - r.left) / TS), y = Math.floor((ev.clientY - r.top) / TS);
    return [x, y];
  }
  cv.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    if (S.screen !== 'battle') return;
    if (busy()) { U.ff = true; return; }
    const [x, y] = tileFromEvent(ev);
    if (!S.battle || !C.inB(S.battle, x, y)) return;
    U.cursor = null;
    tapTile(x, y);
  });

  function tapTile(x, y) {
    const b = S.battle; if (!b || b.phase !== 'player' || busy()) return;
    const u = selUnit();
    const occ = C.unitAt(b, x, y);
    if (u) {
      // confirm pending action
      if (U.pend && U.pend.x === x && U.pend.y === y) { doAct(u, x, y); return; }
      if (!u.acted) {
        const t = C.actTargets(b, u).find(t => t.x === x && t.y === y);
        if (t) { U.pend = { x, y }; U.focus = null; Snd.play('tap'); renderCard(); return; }
      }
      if (!u.moved && !u.acted && !occ) {
        const r = C.reachable(b, u);
        if (r.has(x + ',' + y)) { exec({ t: 'move', id: u.id, x, y }); return; }
      }
    }
    U.pend = null;
    if (occ && occ.side === 'p') { U.sel = occ.id; U.focus = null; Snd.play('sel'); }
    else if (occ && occ.side === 'e') { U.focus = U.focus === occ.id ? null : occ.id; U.sel = null; Snd.play('tap'); }
    else { U.sel = null; U.focus = null; U.info = [x, y]; }
    renderCard(); tick();
  }
  function doAct(u, x, y) { U.pend = null; exec({ t: 'act', id: u.id, x, y }); }

  function exec(cmd) {
    const b = S.battle; if (!b) return;
    const pre = C.clone(b);
    const r = C.applyCommand(b, cmd);
    if (!r.ok) { Snd.play('err'); toast(r.why); return; }
    U.endArm = 0;
    if (cmd.t === 'end') { U.sel = null; U.focus = null; U.pend = null; }
    persist();
    runEvents(r.events, pre);
    renderCard(); renderTop();
  }
  function afterAnim() {
    const b = S.battle; if (!b) return;
    if (b.phase === 'player') {
      const u = selUnit();
      if (u && u.acted) { const nx = nextReady(u.id); U.sel = nx ? nx.id : null; }
      else if (!u) { if (U.autoSel) { const nx = nextReady(); U.sel = nx ? nx.id : null; } }
      U.autoSel = false;
    }
    renderCard(); renderTop();
    if (b.phase === 'won' || b.phase === 'lost') setTimeout(() => endBattle(), window.TM_DEBUG && window.TM_DEBUG.fast ? 5 : 900);
  }
  function nextReady(after) {
    const ps = C.players(S.battle).filter(p => !p.acted).sort((a, c) => a.id - c.id);
    if (!ps.length) return null;
    if (after == null) return ps[0];
    return ps.find(p => p.id > after) || ps[0];
  }

  // ===== HUD =====
  const OBJ_TEXT = {
    rout: (b) => 'Rout: defeat every foe by round ' + b.obj.limit,
    hold: (b) => 'Hold ' + b.obj.rounds + ' rounds · keep foes off your back row',
    protect: (b) => 'Protect the seedling for ' + b.obj.rounds + ' rounds',
    reach: (b) => 'Get Oakhorn to the thistle gate by round ' + b.obj.limit,
    boss: (b) => 'Defeat the Rotmother by round ' + b.obj.limit,
  };
  function renderTop() {
    const b = S.battle; if (!b) return;
    const idx = b.mode === 'daily' ? 'Daily' : (b.idx + 1) + '/' + C.BATTLES.length;
    $('#ttl').textContent = idx + ' · ' + b.name;
    const lim = b.obj.limit || b.obj.rounds;
    $('#rnd').textContent = 'Round ' + Math.min(b.round, lim) + '/' + lim;
    let extra = '';
    if (b.obj.kind === 'hold') extra = ' <span class="pill">Gate ' + '♥'.repeat(Math.max(0, b.gate)) + '</span>';
    if (b.seedling) extra = ' <span class="pill">Seedling ' + b.seedling.hp + '/' + b.seedling.maxHp + '</span>';
    const shade = b.shade && b.shade.h ? ' <span class="pill" title="Sun +1 for you, shade +1 for the Rot">☀ +1 you · ▦ +1 Rot</span>' : ' <span class="pill">☀ full sun: +1 you</span>';
    $('#obj').innerHTML = '<b>' + OBJ_TEXT[b.obj.kind](b) + '</b>' + extra + shade;
    const endB = $('#endBtn');
    const ready = C.players(b).filter(p => !p.acted).length;
    endB.textContent = U.endArm ? 'Confirm end' : (ready ? 'End turn' : 'End turn ✓');
    endB.className = 'btn ' + (U.endArm ? 'warn' : (ready ? '' : 'primary'));
    endB.disabled = b.phase !== 'player';
    $('#undoBtn').disabled = !(b.undo && b.phase === 'player');
    $('#nextBtn').disabled = b.phase !== 'player' || !ready;
  }
  function hpBar(u) { return '<span class="hpbar"><i style="width:' + Math.round(100 * u.hp / u.maxHp) + '%"></i></span> ' + u.hp + '/' + u.maxHp; }
  function unitStats(u) {
    const t = C.UNIT_TYPES[u.type];
    const rng = u.rmax > 1 ? ' · range ' + u.rmin + '-' + u.rmax : '';
    return 'Hit ' + u.dmg + ' · Move ' + u.move + rng + (u.armor ? ' · Armor ' + u.armor : '') + (u.heal ? ' · Heal ' + u.heal : '') + ' · ' + C.TERRAIN[C.code(S.battle, u.x, u.y)].name + (C.inShade(S.battle, u.y) ? ' (shade)' : ' (sun)') + (t.desc ? '<br><span class="sub">' + t.desc + '</span>' : '');
  }
  function renderCard() {
    const b = S.battle; if (!b) return;
    const el = $('#card');
    if (b.phase === 'won' || b.phase === 'lost') { el.innerHTML = '<div class="nm">' + (b.phase === 'won' ? 'Victory!' : 'Defeat') + '</div>'; return; }
    const u = selUnit();
    if (u && U.pend) {
      const fc = C.forecast(b, u, U.pend.x, U.pend.y);
      const v = C.unitAt(b, U.pend.x, U.pend.y);
      let lines = [];
      if (v && v.side === 'p') { lines.push('Heal ' + v.name + ' +' + Math.min(u.heal, v.maxHp - v.hp)); }
      else if (v) {
        const d = C.calcDamage(b, u, u.x, u.y, v, v.x, v.y);
        lines.push('<b>' + d.dmg + ' damage</b> to ' + v.name + ' <span class="sub">(' + d.parts.join(', ') + ')</span>');
        const after = C.getUnit(fc.state, v.id);
        if (!after) lines.push('<b style="color:var(--good)">Defeats it.</b>');
        else {
          if (after.x !== v.x || after.y !== v.y) lines.push('Pushed to a new tile' + (v.intent && v.intent.k === 'unit' ? ' (may break its attack)' : ''));
          if (after.hp < v.hp - d.dmg) lines.push('Bump: +' + (v.hp - d.dmg - after.hp) + ' damage');
          lines.push('Left with ' + after.hp + ' HP');
        }
        const bumped = fc.events.filter(e => e.k === 'death' && e.id !== v.id && e.side === 'e').length;
        if (bumped) lines.push('Also defeats ' + bumped + ' bumped foe');
      }
      el.innerHTML = '<div class="nm">' + u.name + ' → forecast</div><div class="fc">' + lines.join('<br>') + '</div>' +
        '<div class="row" style="margin-top:6px"><button class="btn primary small" id="strikeBtn">' + (v && v.side === 'p' ? 'Heal' : 'Strike') + ' (S)</button><button class="btn small" id="cancelBtn">Cancel</button></div>';
      $('#strikeBtn').onclick = () => { const uu = selUnit(); if (uu && U.pend) doAct(uu, U.pend.x, U.pend.y); };
      $('#cancelBtn').onclick = () => { U.pend = null; renderCard(); };
      return;
    }
    if (u) {
      let h = '<div class="nm">' + u.name + (u.captain ? ' <span class="tag">Captain</span>' : '') + (u.level > 1 ? ' <span class="tag">Lv ' + u.level + '</span>' : '') + ' ' + hpBar(u) + '</div>';
      h += '<div>' + unitStats(u) + '</div>';
      h += '<div class="hint">' + hintFor(u) + '</div>';
      el.innerHTML = h; return;
    }
    if (U.focus != null) {
      const e = C.getUnit(b, U.focus);
      if (e) {
        const pr = (C.predictAll(b).find(p => p.id === e.id) || {}).r || C.resolveIntent(b, e, false);
        let it = 'No attack planned.';
        if (pr) {
          if (pr.fizzle) it = 'Its attack will miss: ' + pr.reason + '.';
          else if (pr.hits.length) it = (pr.lunge ? 'Lunges 1 tile, then hits ' : 'Will hit ') + pr.hits.map(h => (h.seed ? 'the seedling' : C.getUnit(b, h.id).name) + ' for ' + h.dmg).join(', ') + '.';
          else it = 'Will strike an empty tile.';
        }
        el.innerHTML = '<div class="nm">' + e.name + ' ' + hpBar(e) + '</div><div>' + unitStats(e) + '</div><div class="hint">' + it + ' Faint red: everywhere it can hit next round.</div>';
        return;
      }
    }
    if (U.info) {
      const [x, y] = U.info; const t = C.TERRAIN[C.code(b, x, y)];
      el.innerHTML = '<div class="nm">' + t.name + (C.inShade(b, y) ? ' · in shade' : ' · in sun') + '</div><div class="sub">' + t.tip + '</div>'
        + (b.pending.some(p => p.x === x && p.y === y) ? '<div class="hint">Something climbs out here at the end of this round. Stand on it to block.</div>' : '');
      U.info = null; return;
    }
    el.innerHTML = '<div class="hint">' + generalHint() + '</div>';
  }
  function generalHint() {
    const b = S.battle;
    if (b.mode !== 'daily' && b.idx === 0 && b.round === 1 && !C.players(b).some(p => p.moved)) return '<b>Tap Oakhorn</b> (gold crest) to begin. Red lines show who each grub will bite when you end the turn.';
    const ready = C.players(b).filter(p => !p.acted).length;
    if (!ready) return 'Everyone has acted. Check the red lines, then <b>End turn</b>.';
    return 'Tap one of your units. Tap a foe to see its reach. Numbered badges show the order foes attack. ' + (b.shade && b.shade.h ? 'Dotted violet rows: where the shade moves next.' : '');
  }
  function hintFor(u) {
    const b = S.battle;
    if (u.acted) return 'Done for this turn.';
    const tg = C.actTargets(b, u);
    if (!u.moved) return tg.length ? 'Blue: move. Red ring: tap a foe for a forecast, tap again to strike.' : 'Blue tiles: where it can move. Ring a foe, then strike.';
    if (tg.length) return 'Tap a ringed target for a forecast, tap again (or S) to act. Undo returns the step.';
    return 'No target in reach. Undo to try another tile, or select another unit.';
  }
  let bannerT = 0;
  function banner(txt) { const el = $('#banner'); el.innerHTML = '<span>' + txt + '</span>'; el.style.opacity = 1; clearTimeout(bannerT); bannerT = setTimeout(() => el.style.opacity = 0, 900 / (settings.speed || 1)); }
  let toastT = 0;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => el.style.opacity = 0, 2200); }

  $('#undoBtn').onclick = () => { if (!busy()) exec({ t: 'undo' }); };
  $('#nextBtn').onclick = () => { if (busy()) return; const nx = nextReady(U.sel); if (nx) { U.sel = nx.id; U.pend = null; U.focus = null; Snd.play('sel'); renderCard(); } };
  $('#endBtn').onclick = () => tryEnd();
  function tryEnd() {
    const b = S.battle; if (!b || b.phase !== 'player' || busy()) return;
    const ready = C.players(b).filter(p => !p.acted).length;
    if (ready && !U.endArm) { U.endArm = Date.now(); renderTop(); setTimeout(() => { if (U.endArm && Date.now() - U.endArm > 2400) { U.endArm = 0; renderTop(); } }, 2500); return; }
    U.autoSel = true;
    exec({ t: 'end' });
  }

  // keyboard
  window.addEventListener('keydown', (e) => {
    if (document.querySelector('.gk-prefs')) return;
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    if ($('#modal').classList.contains('on')) { if (e.key === 'Escape') closeModal(); return; }
    if (S.screen !== 'battle') {
      if (e.key === 'Enter') { const p = document.querySelector('#screen .btn.primary:not(:disabled)'); if (p) { p.click(); e.preventDefault(); } }
      return;
    }
    const b = S.battle; if (!b) return;
    if (busy()) { U.ff = true; return; }
    const k = e.key;
    const mv = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[k];
    if (mv) {
      e.preventDefault();
      if (!U.cursor) { const u = selUnit() || C.captainOf(b) || C.players(b)[0]; U.cursor = u ? [u.x, u.y] : [0, 0]; }
      U.cursor = [Math.max(0, Math.min(b.cols - 1, U.cursor[0] + mv[0])), Math.max(0, Math.min(b.rows - 1, U.cursor[1] + mv[1]))];
      tick(); return;
    }
    if (k === 'Enter' || k === ' ') { e.preventDefault(); if (U.cursor) tapTile(U.cursor[0], U.cursor[1]); return; }
    if (k === 's' || k === 'S') { const u = selUnit(); if (u && U.pend) doAct(u, U.pend.x, U.pend.y); return; }
    if (k === 'u' || k === 'U' || k === 'z' || k === 'Z') { exec({ t: 'undo' }); return; }
    if (k === 'e' || k === 'E') { tryEnd(); return; }
    if (k === 'n' || k === 'N' || k === 'Tab') { e.preventDefault(); $('#nextBtn').click(); const u = selUnit(); if (u) U.cursor = [u.x, u.y]; return; }
    if (k === 'Escape') { U.sel = null; U.pend = null; U.focus = null; renderCard(); }
  });

  // ===== Screens =====
  const scr = $('#screen');
  function show(name) {
    S.screen = name;
    const battleUI = name === 'battle';
    scr.classList.toggle('on', !battleUI);
    if (battleUI) { resize(); renderTop(); renderCard(); tick(); }
    persist();
  }
  function miniBug(type, side, size, extra) {
    const c = document.createElement('canvas'); const d = Math.min(3, window.devicePixelRatio || 1);
    c.width = size * d; c.height = size * d; c.style.width = size + 'px'; c.style.height = size + 'px';
    const x = c.getContext('2d'); x.scale(d, d); drawBug(x, type, size / 2, size / 2, size, Object.assign({ side, still: true }, extra || {}));
    return c;
  }
  function miniMap(def, size) {
    const b = C.createBattle(def, [{ type: 'warden', captain: true }], { seed: 1 });
    const c = document.createElement('canvas'); const d = Math.min(3, window.devicePixelRatio || 1);
    const s = Math.floor(size / b.cols);
    c.width = b.cols * s * d; c.height = b.rows * s * d; c.style.width = b.cols * s + 'px'; c.style.height = b.rows * s + 'px'; c.style.borderRadius = '8px';
    const x = c.getContext('2d'); x.scale(d, d);
    for (let yy = 0; yy < b.rows; yy++) for (let xx = 0; xx < b.cols; xx++) drawTile(x, b, xx, yy, s, 0, 0);
    if (b.shade && b.shade.h) for (const r of C.shadeRowsAt(b, b.shade.row)) { x.fillStyle = PAL.shade; x.fillRect(0, r * s, b.cols * s, s); }
    for (const u of b.units) if (u.side === 'e') drawBug(x, u.type, u.x * s + s / 2, u.y * s + s / 2, s, { side: 'e', still: true });
    for (const sp of def.spawns || []) { x.strokeStyle = 'rgba(180,40,40,.8)'; x.setLineDash([3, 3]); x.beginPath(); x.arc(sp[2] * s + s / 2, sp[3] * s + s / 2, s * 0.4, 0, 7); x.stroke(); }
    x.setLineDash([]);
    def.map.forEach((row, yy) => [...row].forEach((ch, xx) => { if (ch === 'p') { x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(xx * s + s * 0.3, yy * s + s * 0.3, s * 0.4, s * 0.4); } }));
    if (b.seedling) { x.fillStyle = '#4fbf3a'; x.beginPath(); x.arc(b.seedling.x * s + s / 2, b.seedling.y * s + s / 2, s * 0.25, 0, 7); x.fill(); }
    return c;
  }

  // ===== illustrated scenes (title / endings) =====
  let RM = GK.prefs.motion() !== 'full';
  GK.prefs.on(() => { const was = RM; RM = GK.prefs.motion() !== 'full'; if (was !== RM && S.screen === 'title') titleScreen(); });
  function sceneCanvas(kind) {
    const W = Math.min(480, Math.max(260, (scr.clientWidth || 375) - 40)), H = Math.round(W * 0.42), d = Math.min(2, window.devicePixelRatio || 1);
    const c = document.createElement('canvas'); c.width = W * d; c.height = H * d; c.style.width = W + 'px'; c.style.height = H + 'px';
    c.style.display = 'block'; c.style.margin = '0 auto'; c.style.maxWidth = '100%'; c.style.height = 'auto'; c.style.borderRadius = '12px'; c.setAttribute('aria-hidden', 'true');
    const x = c.getContext('2d');
    const rnd = (() => { let q = 99; return () => (q = (q * 16807) % 2147483647) / 2147483647; })();
    const tufts = Array.from({ length: 34 }, () => [rnd(), rnd(), rnd()]);
    const motes = Array.from({ length: 18 }, () => [rnd(), rnd(), rnd()]);
    const draw = () => {
      if (!c.isConnected && c._started) return;
      c._started = true;
      const t = RM ? 0 : performance.now() / 1000;
      x.setTransform(d, 0, 0, d, 0, 0);
      const dusk = kind === 'dusk';
      const sky = x.createLinearGradient(0, 0, 0, H);
      if (dusk) { sky.addColorStop(0, '#3b2c55'); sky.addColorStop(1, '#7a4f6a'); }
      else if (kind === 'home') { sky.addColorStop(0, '#ffd9a0'); sky.addColorStop(1, '#ffeec9'); }
      else { sky.addColorStop(0, '#bfe3f0'); sky.addColorStop(1, '#f4f0d2'); }
      x.fillStyle = sky; x.fillRect(0, 0, W, H);
      // sun
      x.fillStyle = dusk ? 'rgba(255,170,120,0.55)' : 'rgba(255,214,90,0.9)';
      x.beginPath(); x.arc(W * 0.82, H * (dusk ? 0.72 : 0.28), H * 0.16, 0, 7); x.fill();
      // far hedge
      x.fillStyle = dusk ? '#2e3b2a' : '#7fa85a';
      x.beginPath(); x.moveTo(0, H * 0.62);
      for (let i = 0; i <= 12; i++) x.quadraticCurveTo(W * (i - 0.5) / 12, H * (0.46 + 0.05 * Math.sin(i * 1.7)), W * i / 12, H * 0.6);
      x.lineTo(W, H); x.lineTo(0, H); x.fill();
      // meadow
      x.fillStyle = dusk ? '#3f5232' : '#9cc66a'; x.fillRect(0, H * 0.7, W, H * 0.3);
      // thistles
      for (let i = 0; i < 5; i++) {
        const tx = W * (0.08 + i * 0.22), base = H * 0.74, ht = H * (0.22 + 0.06 * (i % 2)), sw = Math.sin(t * 1.2 + i) * 2;
        x.strokeStyle = dusk ? '#29361f' : '#4f7a34'; x.lineWidth = 2; x.beginPath(); x.moveTo(tx, base); x.quadraticCurveTo(tx + sw, base - ht * 0.6, tx + sw * 1.5, base - ht); x.stroke();
        x.fillStyle = dusk ? '#5a3a6a' : '#a45bc8'; x.beginPath(); x.arc(tx + sw * 1.5, base - ht - 4, 5, 0, 7); x.fill();
        x.fillStyle = dusk ? '#29361f' : '#4f7a34'; x.beginPath(); x.ellipse(tx + sw * 1.5, base - ht + 2, 5, 3, 0, 0, 7); x.fill();
      }
      // grass tufts
      x.strokeStyle = dusk ? '#33452a' : '#6f9e45'; x.lineWidth = 1.2;
      for (const [a, b2, k] of tufts) { const gx = a * W, gy = H * (0.72 + b2 * 0.26), sw = Math.sin(t * 2 + k * 6) * 1.5; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx - 2 + sw, gy - 6); x.moveTo(gx, gy); x.lineTo(gx + 2 + sw, gy - 7); x.stroke(); }
      // the band
      const band = kind === 'dusk' ? [['grub', 'e'], ['spitter', 'e'], ['grub', 'e']] : [['mender', 'p'], ['bomber', 'p'], ['duelist', 'p'], ['warden', 'p']];
      const sz = H * 0.3;
      band.forEach(([ty, side], i) => {
        let bx = W * (0.2 + i * 0.17), by = H * 0.8;
        if (kind === 'march' && !RM) bx = ((bx + t * 14) % (W + sz)) - sz / 2;
        if (kind === 'home') by -= Math.abs(Math.sin(t * 4 + i)) * 4;
        x.save(); x.translate(bx, by); x.rotate(side === 'p' ? Math.PI / 2 : -Math.PI / 2);
        drawBug(x, ty, 0, 0, sz, { side, captain: ty === 'warden', seed: i, still: RM });
        x.restore();
      });
      // motes: pollen by day, spores at dusk
      for (const [a, b2, k] of motes) {
        const mx = (a * W + t * 8 * (0.5 + k)) % W, my = H * (0.15 + b2 * 0.6) + Math.sin(t + k * 9) * 4;
        x.fillStyle = dusk ? 'rgba(170,140,210,0.6)' : 'rgba(255,240,150,0.85)'; x.beginPath(); x.arc(mx, my, 1.2 + k, 0, 7); x.fill();
      }
      if (!RM && !document.hidden) requestAnimationFrame(draw);
    };
    draw();
    document.addEventListener('visibilitychange', () => { if (!document.hidden && c.isConnected && !RM) requestAnimationFrame(draw); });
    return c;
  }
  function titleScreen() {
    S.mode = 'campaign';
    const sv = loadSave();
    const today = dateKey();
    scr.innerHTML = '';
    const wrap = document.createElement('div'); wrap.className = 'stack'; wrap.style.alignItems = 'stretch';
    wrap.appendChild(sceneCanvas('march'));
    wrap.insertAdjacentHTML('beforeend', '<h1>THISTLEMARCH</h1><p class="center muted">Pocket tactics in a sunlit hedgerow. Lead Captain Oakhorn\'s tiny warband through 9 battles against the creeping Rot.</p>');
    if (sv.ok) {
      const c = sv.save.camp;
      const b1 = btn(c.done ? 'View campaign result' : 'Continue · battle ' + Math.min(c.battle + 1, 9) + '/9', 'primary', () => resumeSave(sv.save));
      wrap.appendChild(b1);
      if (sv.save.recovered) wrap.insertAdjacentHTML('beforeend', '<p class="note center">Your latest save could not be read, so the one before it was restored. A copy of the unreadable one was kept.</p>');
      if (sv.save.repaired) wrap.insertAdjacentHTML('beforeend', '<p class="note center">The battle in progress could not be read, so it restarts from its briefing. Campaign progress is safe.</p>');
    } else if (sv.corrupt) {
      wrap.insertAdjacentHTML('beforeend', '<p class="note center">Your save could not be read. A copy was kept; you can export it from the menu, or start a new campaign.</p>');
    }
    wrap.appendChild(btn(sv.ok ? 'New campaign' : 'Start campaign', sv.ok ? '' : 'primary', () => {
      if (sv.ok && !sv.save.camp.done) confirmBox('Start over? Your current campaign will be replaced.', 'Start over', () => newCampaign());
      else newCampaign();
    }));
    if (best.campaigns) {
      const ob = btn('Thorn Oath campaign' + (best.oathStars ? ' · best ' + best.oathStars + ' ★' : ''), '', () => {
        const go = () => newCampaign(true);
        if (sv.ok && !sv.save.camp.done) confirmBox('Swear the Thorn Oath? The Rot is tougher and you have only 2 resolve. Your current campaign will be replaced.', 'Swear it', go);
        else confirmBox('Swear the Thorn Oath? Every Rot foe has +2 HP (the Rotmother +6) and you have only 2 resolve.', 'Swear it', go);
      });
      wrap.appendChild(ob);
    }
    const db = (best.daily || {})[today];
    wrap.appendChild(btn('Daily skirmish' + (db != null ? ' · best ' + db : ''), '', () => startDaily()));
    wrap.appendChild(btn('How to play', '', () => helpBox()));
    wrap.insertAdjacentHTML('beforeend', '<p class="center muted">Best campaign: ' + (best.stars || 0) + ' / 27 ★' + (best.campaigns ? ' · campaigns won: ' + best.campaigns : ' · win once to unlock the Thorn Oath') + '</p>');
    const r = document.createElement('div'); r.className = 'row'; r.style.justifyContent = 'center';
    r.appendChild(btn('Sound: ' + (settings.sound ? 'on' : 'off'), 'small', () => { settings.sound = !settings.sound; saveSettings(); titleScreen(); }));
    r.appendChild(btn('Music: ' + (settings.music ? 'on' : 'off'), 'small', () => { settings.music = !settings.music; saveSettings(); titleScreen(); }));
    r.appendChild(GK.ui.prefsButton({ className: 'btn small', panel: { text: true, tips: false } }));
    wrap.appendChild(r);
    scr.appendChild(wrap);
    S.screen = 'title'; scr.classList.add('on');
  }
  function btn(label, cls, fn) { const b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.textContent = label; b.onclick = (e) => { Snd.init(); Snd.play('tap'); fn(e); }; return b; }
  function dateKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function newCampaign(oath) {
    S.mode = 'campaign';
    S.camp = C.newCampaign((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, !!oath);
    S.battle = null; S.debrief = null; S.picks = [];
    briefing();
  }
  function resumeSave(sv) {
    S.mode = 'campaign'; S.camp = sv.camp; S.battle = sv.battle; S.debrief = sv.debrief; S.picks = [];
    if (S.camp.done) { finalScreen(); return; }
    if (sv.screen === 'battle' && S.battle) { U.sel = null; U.pend = null; U.focus = null; U.anim = []; U.cur = null; U.disp = null; show('battle'); }
    else if (sv.screen === 'debrief' && S.debrief) debriefScreen();
    else briefing();
  }

  function briefing() {
    const c = S.camp; const def = C.BATTLES[c.battle];
    S.battle = null;
    if (!S.picks || !S.picks.length) S.picks = defaultPicks(c);
    scr.innerHTML = '';
    const w = document.createElement('div'); w.className = 'stack';
    w.insertAdjacentHTML('beforeend', '<div class="muted">Battle ' + (c.battle + 1) + ' of 9 · Resolve ' + '❦'.repeat(c.resolve) + (c.oath ? ' · <b style="color:var(--bad)">Thorn Oath</b>' : '') + '</div><h2>' + def.name + '</h2><p>' + def.intro + '</p>');
    const mm = document.createElement('div'); mm.className = 'row'; mm.style.alignItems = 'flex-start'; mm.style.flexWrap = 'nowrap';
    mm.appendChild(miniMap(def, 132));
    const ob = document.createElement('div'); ob.style.flex = '1';
    const tmp = C.createBattle(def, [{ type: 'warden', captain: true }], { seed: 1 });
    ob.innerHTML = '<h3>Objective</h3><p><b>' + OBJ_TEXT[def.obj.kind](tmp) + '</b></p><p class="note">' + def.tip + '</p>' +
      '<p class="note">★ win · ★ no one falls · ★ ' + (def.obj.par ? 'win by round ' + def.obj.par : def.obj.kind === 'hold' ? 'gate untouched' : 'seedling unhurt') + '</p>';
    mm.appendChild(ob); w.appendChild(mm);
    w.insertAdjacentHTML('beforeend', '<h3>Choose 3 to march with Oakhorn</h3>');
    const slots = document.createElement('div'); slots.className = 'slots';
    const capSlot = document.createElement('div'); capSlot.className = 'slot full'; capSlot.appendChild(miniBug('warden', 'p', 30, { captain: true })); capSlot.insertAdjacentHTML('beforeend', '<div>Oakhorn<br>Lv ' + c.captain.level + '</div>');
    slots.appendChild(capSlot);
    for (let i = 0; i < 3; i++) {
      const p = S.picks[i]; const sl = document.createElement('div'); sl.className = 'slot' + (p ? ' full' : '');
      if (p) { sl.appendChild(miniBug(p.type || vet(p.vetId).type, 'p', 30)); sl.insertAdjacentHTML('beforeend', '<div>' + pickName(p) + '</div>'); sl.onclick = () => { S.picks.splice(i, 1); briefing(); }; }
      else sl.textContent = 'empty';
      slots.appendChild(sl);
    }
    w.appendChild(slots);
    const cards = document.createElement('div'); cards.className = 'cards';
    for (const v of c.barracks) {
      const on = S.picks.some(p => p.vetId === v.vetId);
      const cd = document.createElement('button'); cd.className = 'ucard' + (on ? ' sel' : '');
      cd.appendChild(miniBug(v.type, 'p', 38));
      const mx = C.vetMaxHp(v), hp = mx - (v.wound || 0);
      const hpTxt = v.wound ? '<span style="color:var(--bad);font-weight:700">' + hp + '/' + mx + ' HP, wounded</span>' : mx + ' HP';
      cd.insertAdjacentHTML('beforeend', '<div><div class="t">' + v.name + ' ' + '★'.repeat(v.level - 1) + '</div><div class="d">' + C.UNIT_TYPES[v.type].name + ' · Lv ' + v.level + ' · ' + hpTxt + '</div></div>');
      cd.onclick = () => { if (on) S.picks = S.picks.filter(p => p.vetId !== v.vetId); else if (S.picks.length < 3) S.picks.push({ vetId: v.vetId }); else { toast('Three slots are full. Tap a slot to free it.'); return; } Snd.play('tap'); briefing(); };
      cards.appendChild(cd);
    }
    for (const t of c.unlocked) {
      const T0 = C.UNIT_TYPES[t];
      const isNew = c.newUnlock === t;
      const cd = document.createElement('button'); cd.className = 'ucard';
      cd.appendChild(miniBug(t, 'p', 38));
      cd.insertAdjacentHTML('beforeend', '<div><div class="t">+ Recruit ' + T0.name + (isNew ? '<span class="tag">NEW</span>' : '') + '</div><div class="d">' + T0.role + ' · ' + T0.hp + ' HP · ' + T0.desc + '</div></div>');
      cd.onclick = () => { if (S.picks.length >= 3) { toast('Three slots are full. Tap a slot to free it.'); return; } S.picks.push({ type: t, name: C.recruitName(c) }); Snd.play('tap'); briefing(); };
      cards.appendChild(cd);
    }
    w.appendChild(cards);
    w.insertAdjacentHTML('beforeend', '<p class="note">Veterans keep their experience between battles, and their wounds: they heal 2 at camp, or fully if they sit a battle out. Anyone who falls is gone for good, even in a lost battle. Recruits are always free.</p>');
    const go = btn('March!', 'primary', () => startBattle());
    go.disabled = !C.validPicks(c, S.picks);
    const row = document.createElement('div'); row.className = 'row';
    const back = btn('Title', '', () => titleScreen()); back.style.flex = '0 0 90px';
    row.appendChild(back); row.appendChild(go);
    w.appendChild(row);
    scr.appendChild(w);
    S.screen = 'brief'; scr.classList.add('on'); scr.scrollTop = 0; persist();
  }
  function vet(id) { return S.camp.barracks.find(v => v.vetId === id) || { type: 'duelist', name: '?' }; }
  function pickName(p) { return p.vetId != null ? vet(p.vetId).name : (p.name + '<br><span class="muted">new ' + C.UNIT_TYPES[p.type].role.toLowerCase() + '</span>'); }
  function defaultPicks(c) {
    const out = [];
    // healthiest veterans first; badly hurt ones rest
    const fit = c.barracks.filter(v => (v.wound || 0) * 2 < C.vetMaxHp(v));
    for (const v of fit) { if (out.length < 3) out.push({ vetId: v.vetId }); }
    const order = ['duelist', 'bomber', 'mender', 'scout'].filter(t => c.unlocked.includes(t));
    let i = 0;
    while (out.length < 3) { const t = order[i % order.length]; out.push({ type: t, name: C.recruitName(c) }); i++; }
    return out;
  }
  function startBattle() {
    const c = S.camp;
    if (!C.validPicks(c, S.picks)) return;
    c.newUnlock = null;
    const band = C.bandFor(c, S.picks);
    S.battle = C.createBattle(C.BATTLES[c.battle], band, { seed: C.battleSeed(c), idx: c.battle, oath: !!c.oath });
    S.picks = [];
    U.sel = null; U.pend = null; U.focus = null; U.anim = []; U.cur = null; U.disp = null;
    show('battle');
    banner(S.battle.name);
    setTimeout(() => toast(C.BATTLES[c.battle].tip), 700);
  }

  function endBattle() {
    const b = S.battle; if (!b || (b.phase !== 'won' && b.phase !== 'lost')) return;
    if (S.screen !== 'battle') return;
    if (b.mode === 'daily') { dailyResult(); return; }
    S.debrief = C.settleBattle(S.camp, b);
    if (S.debrief.unlock) S.camp.newUnlock = S.debrief.unlock;
    const sc = C.campaignScore(S.camp);
    const bk = S.camp.oath ? 'oathStars' : 'stars';
    if (S.camp.done === 'won' && !S.camp.counted) { best.campaigns = (best.campaigns || 0) + 1; if (S.camp.oath) best.oaths = (best.oaths || 0) + 1; S.camp.counted = true; }
    if (S.camp.done === 'won') best[bk] = Math.max(best[bk] || 0, sc);
    saveBest();
    S.battle = null;
    debriefScreen();
  }

  function debriefScreen() {
    const d = S.debrief, c = S.camp; if (!d) { briefing(); return; }
    scr.innerHTML = '';
    const w = document.createElement('div'); w.className = 'stack';
    const won = d.result === 'won';
    const reasons = { captain: 'Oakhorn fell.', band: 'The whole band fell.', seedling: 'The seedling was eaten.', breach: 'The Rot broke through the gate.', time: 'Out of rounds.' };
    w.insertAdjacentHTML('beforeend', '<div class="center">' + (won ? '<div class="stars">' + '★'.repeat(d.stars) + '<span style="opacity:.25">' + '★'.repeat(3 - d.stars) + '</span></div>' : '') + '<h2>' + (won ? 'Victory at ' + d.name : 'Defeat at ' + d.name) + '</h2>' +
      (won ? '<p class="muted">' + d.why.join(' · ') + ' · round ' + d.round + '</p>' : '<p>' + (reasons[d.reason] || '') + '</p>') + '</div>');
    if (won) {
      if (d.gained.length) w.insertAdjacentHTML('beforeend', '<h3>Experience</h3><ul class="tight">' + d.gained.map(g0 => '<li>' + g0.name + ': +' + g0.xp + ' xp' + (g0.level > 1 ? ' · Lv ' + g0.level : '') + '</li>').join('') + '</ul>');
      if (d.fallen.length) w.insertAdjacentHTML('beforeend', '<h3>Fallen</h3><p>' + d.fallen.map(f => f.name).join(', ') + ' will be remembered in the clover.</p>');
      const hurt = S.camp.barracks.filter(v => v.wound > 0);
      if (hurt.length) w.insertAdjacentHTML('beforeend', '<h3>Wounded</h3><p class="note">' + hurt.map(v => v.name + ' ' + (C.vetMaxHp(v) - v.wound) + '/' + C.vetMaxHp(v) + ' HP').join(', ') + '. Rest them a battle to heal fully.</p>');
      if (d.unlock) w.insertAdjacentHTML('beforeend', '<h3>New recruit</h3><p><b>' + C.UNIT_TYPES[d.unlock].name + '</b> joins the muster: ' + C.UNIT_TYPES[d.unlock].desc + '</p>');
      if (C.pendingPerks(c) > 0) {
        w.insertAdjacentHTML('beforeend', '<h3>Oakhorn reached level ' + c.captain.level + '! Choose a gift</h3>');
        const pr = document.createElement('div'); pr.className = 'stack';
        for (const p of C.perkOffer(c)) {
          const P = C.CAPTAIN_PERKS[p]; const bb = document.createElement('button'); bb.className = 'perk'; bb.innerHTML = '<b>' + P.name + '</b>' + P.desc;
          bb.onclick = () => { C.choosePerk(c, p); Snd.play('level'); persist(); debriefScreen(); };
          pr.appendChild(bb);
        }
        w.appendChild(pr);
      } else if (c.captain.perks.length) {
        w.insertAdjacentHTML('beforeend', '<p class="note">Oakhorn\'s gifts: ' + c.captain.perks.map(p => C.CAPTAIN_PERKS[p].name).join(', ') + '</p>');
      }
    } else {
      w.insertAdjacentHTML('beforeend', '<p class="center">Resolve left: ' + (c.resolve > 0 ? '❦'.repeat(c.resolve) : 'none') + '</p><p class="note center">'+ (d.fallen.filter(f => f.vetId != null).length ? d.fallen.filter(f => f.vetId != null).map(f => f.name).join(', ') + ' fell and will not return. ' : '') + 'Choose your band and try again.</p>');
    }
    const cont = btn(c.done ? 'See the end' : won ? 'Onward' : 'Retry battle', 'primary', () => { S.debrief = null; if (c.done) finalScreen(); else briefing(); });
    cont.disabled = won && C.pendingPerks(c) > 0;
    w.appendChild(cont);
    w.appendChild(btn('Title', '', () => titleScreen()));
    scr.appendChild(w);
    S.screen = 'debrief'; scr.classList.add('on'); scr.scrollTop = 0; persist();
  }

  function finalScreen() {
    const c = S.camp; scr.innerHTML = '';
    const w = document.createElement('div'); w.className = 'stack';
    const sc = C.campaignScore(c);
    if (c.done === 'won') {
      w.appendChild(sceneCanvas('home'));
      w.insertAdjacentHTML('beforeend', '<h1>The meadow breathes</h1>' + (c.oath ? '<p class="center"><b>Thorn Oath kept.</b></p>' : '') + '<p class="center">The Rotmother is ended. Captain Oakhorn and the band walk home through the clover.</p>' +
        '<div class="center stars">' + sc + ' / 27 ★</div><p class="center muted">Battles lost on the way: ' + c.losses + ' · comrades fallen: ' + c.fallenTotal + ' · best ever: ' + Math.max(best[c.oath ? 'oathStars' : 'stars'] || 0, sc) + ' ★</p>' + (!c.oath ? '<p class="note center">The Thorn Oath is open on the title screen: tougher Rot, 2 resolve.</p>' : '') +
        '<h3>Battle record</h3><ul class="tight">' + C.BATTLES.map((bt, i) => '<li>' + bt.name + ': ' + '★'.repeat(c.stars[i] || 0) + ' (round ' + (c.rounds[i] || '-') + ')</li>').join('') + '</ul>');
    } else {
      w.appendChild(sceneCanvas('dusk'));
      w.insertAdjacentHTML('beforeend', '<h1>The shade wins</h1><p class="center">Oakhorn\'s resolve is spent. The Rot settles over the hedgerow, for now.</p>' +
        '<p class="center muted">Reached battle ' + (c.battle + 1) + ' of 9 · ' + sc + ' ★ earned · ' + c.fallenTotal + ' fallen</p>' +
        '<p class="note center">Every defeat teaches: try fighting from the sun, shoving foes into bramble, and keeping a Mender behind Oakhorn.</p>');
    }
    w.appendChild(btn('New campaign', 'primary', () => { Store.del(K_SAVE); newCampaign(c.oath); }));
    w.appendChild(btn('Title', '', () => titleScreen()));
    scr.appendChild(w);
    S.screen = 'final'; scr.classList.add('on'); scr.scrollTop = 0; persist();
  }

  // ===== Daily skirmish =====
  function startDaily() {
    S.mode = 'daily';
    const key = dateKey();
    const ds = Store.get(K_DAILY);
    if (ds && ds.date === key && ds.battle && C.validBattle(ds.battle) && ds.battle.phase === 'player') {
      S.daily = { date: key }; S.battle = ds.battle; U.anim = []; U.cur = null; U.disp = null; U.sel = null; show('battle'); return;
    }
    const seed = C.hashStr('daily:' + key);
    const def = C.dailyDef(seed);
    S.daily = { date: key };
    S.battle = C.createBattle(def, C.dailyBand(seed), { seed, idx: -1, mode: 'daily' });
    U.anim = []; U.cur = null; U.disp = null; U.sel = null; U.pend = null; U.focus = null;
    show('battle'); banner('Daily · ' + key); setTimeout(() => toast('Same map and band for everyone today. Rout them fast.'), 600);
  }
  function dailyScore(b) { if (b.phase !== 'won') return 0; return 100 * (b.obj.limit - b.round + 1) + 60 * C.players(b).length + 5 * b.kills; }
  function dailyResult() {
    const b = S.battle; const key = S.daily.date; const sc = dailyScore(b);
    best.daily = best.daily || {}; const prev = best.daily[key] || 0; if (sc > prev) best.daily[key] = sc;
    // keep the table small
    const ks = Object.keys(best.daily).sort(); while (ks.length > 30) delete best.daily[ks.shift()];
    saveBest();
    Store.set(K_DAILY, { v: 1, date: key, battle: null, done: true });
    scr.innerHTML = '';
    const w = document.createElement('div'); w.className = 'stack';
    w.insertAdjacentHTML('beforeend', '<h2>Daily skirmish · ' + key + '</h2><p>' + (b.phase === 'won' ? 'Routed by round ' + b.round + ' with ' + C.players(b).length + ' still standing.' : 'Defeated. Tomorrow brings a new meadow, or try again today.') + '</p>' +
      '<div class="center stars">' + sc + ' pts</div><p class="center muted">Best today: ' + Math.max(prev, sc) + (sc > prev && sc > 0 ? ' · new best!' : '') + '</p><p class="note center">Score: 100 per round to spare, 60 per survivor, 5 per foe.</p>');
    w.appendChild(btn('Try again', 'primary', () => { Store.del(K_DAILY); startDaily(); }));
    w.appendChild(btn('Title', '', () => titleScreen()));
    S.battle = null; scr.appendChild(w); S.screen = 'daily'; scr.classList.add('on');
  }

  // ===== Modal: menu, help, export =====
  const modal = $('#modal');
  function openModal(html, build) { modal.innerHTML = '<div class="box">' + html + '</div>'; if (build) build(modal.querySelector('.box')); modal.classList.add('on'); }
  function closeModal() { modal.classList.remove('on'); modal.innerHTML = ''; }
  modal.addEventListener('pointerdown', (e) => { if (e.target === modal) closeModal(); });
  function confirmBox(msg, ok, fn) {
    openModal('<p>' + msg + '</p>', (box) => { const r = document.createElement('div'); r.className = 'row'; r.style.marginTop = '10px'; r.appendChild(btn('Cancel', '', closeModal)); r.appendChild(btn(ok, 'warn', () => { closeModal(); fn(); })); box.appendChild(r); });
  }
  function helpBox() {
    openModal('<h2>How to play</h2><ul class="tight">' +
      '<li><b>Tap a unit</b>, tap a blue tile to move, then tap a ringed foe for a forecast and tap again to strike. Each unit moves once and acts once.</li>' +
      '<li><b>Red lines</b> show exactly who each foe will hit when you end the turn, and for how much. Numbers on foes show the order.</li>' +
      '<li>A foe misses if its target <b>leaves its reach</b>. Grubs and gnats <b>lunge</b> 1 tile after a target, so step 2 away or block the lunge tile. Orange dashed arcs are spitter lobs at a tile: step off it.</li>' +
      '<li><b>Sun</b>: your attacks +1. <b>Shade</b> (violet rows): Rot attacks +1. Dotted violet rows show where the shade moves next.</li>' +
      '<li><b>Tall grass</b> softens hits by 1. <b>Pebbles</b> extend range. <b>Mud</b> stops you and weakens attacks. <b>Blooms</b> heal 2. <b>Bramble</b> blocks, and shoving a foe into it deals +1.</li>' +
      '<li>Stepping next to a foe stops your movement (its grip). The Hopper Scout ignores grip.</li>' +
      '<li>If Oakhorn falls, the battle is lost. Lose 3 battles and the campaign ends. Veterans keep their experience <b>and their wounds</b> (2 heal at camp; a battle off heals fully). The fallen are gone, even in defeat.</li>' +
      '<li>Keys: arrows + Enter to tap, S strike, U undo, N next unit, E end turn, Esc cancel. Tap during animations to speed up.</li></ul>',
      (box) => box.appendChild(btn('Got it', 'primary', closeModal)));
  }
  $('#menuBtn').onclick = () => {
    Snd.init();
    openModal('<h2>Menu</h2>', (box) => {
      const st = document.createElement('div'); st.className = 'stack';
      st.appendChild(btn('Resume', 'primary', closeModal));
      st.appendChild(btn('How to play', '', helpBox));
      st.appendChild(btn('Sound: ' + (settings.sound ? 'on' : 'off'), '', () => { settings.sound = !settings.sound; saveSettings(); closeModal(); }));
      st.appendChild(btn('Music: ' + (settings.music ? 'on' : 'off'), '', () => { settings.music = !settings.music; saveSettings(); closeModal(); }));
      st.appendChild(btn('Animation speed: ' + (settings.speed === 1 ? 'normal' : 'fast'), '', () => { settings.speed = settings.speed === 1 ? 2 : 1; saveSettings(); closeModal(); }));
      st.appendChild(GK.ui.prefsButton({ className: 'btn', panel: { text: true, tips: false } }));
      if (S.battle && S.battle.mode !== 'daily' && S.battle.phase === 'player') st.appendChild(btn('Restart this battle (costs 1 resolve)', '', () => confirmBox('Restart? This counts as a defeat and costs 1 resolve.', 'Restart', () => { S.battle.phase = 'lost'; S.battle.reason = 'retreat'; endBattle(); })));
      st.appendChild(btn('Backup: copy save code', '', exportBox));
      st.appendChild(btn('Quit to title (progress is saved)', '', () => { closeModal(); persist(); S.battle && S.mode === 'daily' && Store.set(K_DAILY, { v: 1, date: S.daily.date, battle: S.battle }); S.battle = null; titleScreen(); }));
      box.appendChild(st);
    });
  };
  function exportBox() {
    const raw = Store.raw(K_SAVE) || Store.raw(K_BAD) || '';
    let code = ''; try { code = btoa(unescape(encodeURIComponent(raw))); } catch (e) { }
    openModal('<h2>Save backup</h2><p class="note">Copy this code somewhere safe. Paste a code below and tap Load to restore it.</p><textarea id="exp" readonly>' + code + '</textarea><textarea id="imp" placeholder="Paste a save code here"></textarea>', (box) => {
      const r = document.createElement('div'); r.className = 'row';
      r.appendChild(btn('Copy', '', () => { const t = $('#exp'); t.select(); try { navigator.clipboard.writeText(t.value); toast('Copied'); } catch (e) { document.execCommand && document.execCommand('copy'); } }));
      r.appendChild(btn('Load', 'primary', () => {
        try {
          const txt = decodeURIComponent(escape(atob($('#imp').value.trim())));
          const o = JSON.parse(txt);
          if (!o || !C.validCampaign(o.camp)) throw 0;
          if (o.battle && !C.validBattle(o.battle)) { o.battle = null; o.screen = 'brief'; }
          Store.set(K_SAVE, o); closeModal(); toast('Save restored'); resumeSave(o);
        } catch (e) { toast('That code could not be read.'); }
      }));
      r.appendChild(btn('Close', '', closeModal));
      box.appendChild(r);
    });
  }

  // ===== boot =====
  // debug view: add #debug to the URL to log each command's events to the console (no change to play)
  if (location.hash === '#debug') window.TM_DEBUG = { S, C, U, exec, tapTile, tryEnd, busy, ts: () => TS, fast: false, Snd };
  resize();
  GK.studio();
  GK.coach.create('thistlemarch-first', [{ done: () => { const b = S.battle; return !!b && (b.mode === 'daily' || b.idx > 0 || b.round > 1 || C.players(b).some(p => p.moved || p.acted)); }, target: () => { const b = S.battle, u = b && C.captainOf(b); if (!u) return null; const r = cv.getBoundingClientRect(); return { x: r.left + (u.x + 0.5) * TS, y: r.top + (u.y + 0.5) * TS, r: Math.max(26, TS * 0.62) }; } }], { when: () => S.screen === 'battle' && !!S.battle && S.battle.phase === 'player' && !busy() && !modal.classList.contains('on') });
  GK.wired('motion', 'shake and particle bursts; Calm/Still keep the title and ending art still (was the phone reduced-motion read) and turn off banner and toast fades');
  GK.wired('text', 'page CSS scaled (top bar, objective line and action buttons capped at 125%), canvas badges, level stars, armor and floaters');
  titleScreen();
})();
