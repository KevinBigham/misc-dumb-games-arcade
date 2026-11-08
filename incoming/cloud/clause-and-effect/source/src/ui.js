/* ================= STORAGE (localStorage in try/catch, autosave every action) ================= */
const Storage = {
  data: null, notice: '', available: true,
  blank() { return { v: 1, unlocked: 1, stars: {}, best: {}, drafts: {}, endings: {}, hints: {}, settings: { sound: true, music: true, fast: false, inspect: false, theme: 'system' }, cur: 0 }; },
  load() {
    let raw = null;
    try { raw = localStorage.getItem(CONFIG.SAVE_KEY); } catch (e) { this.available = false; this.notice = 'This browser window is not saving progress.'; }
    if (!raw) { this.data = this.blank(); return; }
    try {
      const d = JSON.parse(raw);
      if (!d || d.v !== 1 || typeof d.unlocked !== 'number') throw new Error('bad save');
      const b = this.blank();
      this.data = Object.assign(b, d, { settings: Object.assign(b.settings, d.settings || {}) });
      this.data.unlocked = Math.max(1, Math.min(LEVELS.length, this.data.unlocked));
    } catch (e) {
      try { localStorage.setItem(CONFIG.SAVE_KEY + '.backup', raw); } catch (_) {}
      this.data = this.blank();
      this.notice = 'Your old save could not be read, so a backup copy was kept and a fresh ledger started.';
    }
  },
  save() { try { localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(this.data)); } catch (e) { this.available = false; } },
  reset() { try { localStorage.removeItem(CONFIG.SAVE_KEY); } catch (e) {} this.data = this.blank(); this.save(); },
};

// A saved draft must still fit the level's shape, otherwise use a fresh ledger for that level only.
function validDraft(lv, d) {
  try {
    if (!d || !Array.isArray(d.routine) || d.routine.length !== lv.routine.length) return false;
    if (!DIRS[d.face]) return false;
    for (const c of lv.clauses) if (!(d.clauses[c.key] in CLAUSES[c.key].opts)) return false;
    for (const l of d.routine) if (l.cmd && !COMMANDS[l.cmd]) return false;
    return typeof d.struck === 'object';
  } catch (e) { return false; }
}

/* ================= AUDIO (generated WebAudio, no files) ================= */
const Sound = {
  ctx: null, master: null, musicGain: null, musicTimer: null, nextNote: 0, beat: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.55; this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.16; this.musicGain.connect(this.master);
      this.syncMusic();
    } catch (e) { this.ctx = null; }
  },
  on() { return this.ctx && Storage.data.settings.sound; },
  tone(f, d, type = 'square', vol = 0.12, slide = 0, when = 0, dest) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + d + 0.02);
  },
  noise(d, vol = 0.2, hp = 400, when = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when, n = Math.floor(this.ctx.sampleRate * d);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const s = this.ctx.createBufferSource(); s.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = this.ctx.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t);
  },
  sfx(name) {
    if (!this.on()) return;
    switch (name) {
      case 'tap': this.tone(880, 0.04, 'triangle', 0.08); break;
      case 'pick': this.tone(660, 0.05, 'triangle', 0.1); this.tone(990, 0.07, 'triangle', 0.08, 0, 0.04); break;
      case 'step': this.tone(220, 0.05, 'triangle', 0.08, -60); break;
      case 'hop': this.tone(300, 0.14, 'sine', 0.1, 400); break;
      case 'turn': this.tone(520, 0.03, 'square', 0.04); break;
      case 'bump': this.tone(110, 0.09, 'square', 0.1, -50); this.noise(0.05, 0.06, 800); break;
      case 'key': [988, 1319, 1568].forEach((f, i) => this.tone(f, 0.12, 'triangle', 0.09, 0, i * 0.05)); break;
      case 'guard': this.tone(150, 0.03, 'sine', 0.03); break;
      case 'hatch': this.tone(400, 0.08, 'sine', 0.05, 120); break;
      case 'win': [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.1, 0, i * 0.07)); break;
      case 'caught': [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.18, 'square', 0.08, 0, i * 0.09)); break;
      case 'smudge': this.tone(240, 0.4, 'sine', 0.12, -180); this.noise(0.3, 0.05, 300); break;
      case 'void': this.noise(0.12, 0.35, 120); this.tone(70, 0.25, 'sine', 0.25, -30); break;
      case 'timeout': this.tone(300, 0.3, 'triangle', 0.08, -150); break;
      case 'stroke': this.noise(0.18, 0.12, 2500); break;
    }
  },
  // Gentle generated office music: a plucked pentatonic walk over a soft drone.
  syncMusic() {
    if (!this.ctx) return;
    const want = Storage.data.settings.music && !document.hidden;
    if (want && !this.musicTimer) { this.nextNote = this.ctx.currentTime + 0.1; this.musicTimer = setInterval(() => this.schedule(), 100); }
    if (!want && this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  },
  schedule() {
    const scale = [0, 2, 4, 7, 9, 12, 14, 16];
    const roots = [196, 174.6, 220, 164.8];
    while (this.nextNote < this.ctx.currentTime + 0.3) {
      const bar = Math.floor(this.beat / 8) % 4, root = roots[bar];
      const pos = this.beat % 8;
      if (pos === 0) this.tone(root / 2, 2.6, 'sine', 0.22, 0, this.nextNote - this.ctx.currentTime, this.musicGain);
      const r = Math.sin(this.beat * 12.9898) * 43758.5453; const rnd = r - Math.floor(r);
      if (pos % 2 === 0 || rnd > 0.6) {
        const deg = scale[Math.floor(rnd * scale.length)];
        this.tone(root * 2 ** (deg / 12), 0.35, 'triangle', 0.12, 0, this.nextNote - this.ctx.currentTime, this.musicGain);
      }
      this.beat++; this.nextNote += 0.34;
    }
  },
};

/* ================= STATE ================= */
const State = {
  screen: 'title', li: 0, ledger: null, sim: null, running: false, timer: null,
  path: [], lastResult: null, brokenSeal: null, hintShown: 0, picker: null, edited: false,
  level() { return LEVELS[this.li]; },
};

function snapshot(s) {
  return { pip: { ...s.pip }, guards: s.guards.map(g => ({ ...g })), hatches: s.hatches.map(h => ({ ...h })), keys: s.keys.map(k => ({ ...k })), tick: s.tick };
}

/* ================= RENDERER (canvas board; reads state, never changes rules) ================= */
const Render = {
  cv: null, g: null, cell: 40, w: 0, h: 0, dpr: 1, anim: null, parts: [], floats: [], shake: 0, colors: {}, t: 0,
  attach(cv) { this.cv = cv; this.g = cv.getContext('2d'); this.readColors(); this.resize(); },
  readColors() {
    const cs = getComputedStyle(document.documentElement);
    for (const k of ['paper', 'card', 'rule', 'ink', 'ink-soft', 'slot', 'stamp', 'brass', 'spill', 'lamp', 'ok', 'cell-a', 'cell-b', 'wall', 'wall-top', 'guard']) this.colors[k] = cs.getPropertyValue('--' + k).trim() || '#888';
  },
  resize() {
    if (!this.cv) return;
    const lv = State.level(); const m = parseMap(lv);
    const wrap = this.cv.parentElement; const availW = Math.max(200, wrap.clientWidth - 16);
    const desk = window.innerWidth >= 860;
    const availH = desk ? window.innerHeight * 0.62 : Math.max(200, window.innerHeight * 0.4);
    this.cell = Math.floor(Math.min(CONFIG.CELL_MAX, availW / m.w, availH / m.h));
    this.w = m.w; this.h = m.h; this.dpr = Math.min(3, window.devicePixelRatio || 1);
    this.cv.width = this.cell * m.w * this.dpr; this.cv.height = this.cell * m.h * this.dpr;
    this.cv.style.width = this.cell * m.w + 'px'; this.cv.style.height = this.cell * m.h + 'px';
  },
  burst(x, y, color, n = 16, speed = 2.2) {
    n = Math.round(n * GK.prefs.motionScale());
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, v = (0.4 + Math.random()) * speed; this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, life: 1, color, r: 2 + Math.random() * 3 }); }
  },
  float(text, x, y, color) { this.floats.push({ text, x, y, life: 1, color }); },
  frame(now) {
    this.t = GK.prefs.motion() === 'still' ? 0 : now / 1000;
    const g = this.g; if (!g || State.screen !== 'play') return;
    const lv = State.level(), led = State.ledger, rules = resolveRules(lv, led);
    const c = this.cell, C = this.colors;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    let sx = 0, sy = 0;
    if (this.shake > 0.1) { sx = (Math.random() - 0.5) * this.shake; sy = (Math.random() - 0.5) * this.shake; this.shake *= 0.86; }
    g.save(); g.translate(sx, sy);
    const base = State.sim || newSim(lv, led);
    // Tiles
    for (let y = 0; y < base.h; y++) for (let x = 0; x < base.w; x++) {
      const t = base.tiles[y][x], px = x * c, py = y * c;
      g.fillStyle = (x + y) % 2 ? C['cell-a'] : C['cell-b']; g.fillRect(px, py, c, c);
      g.strokeStyle = C.rule; g.globalAlpha = 0.6; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py + c - 0.5); g.lineTo(px + c, py + c - 0.5); g.stroke(); g.globalAlpha = 1;
      if (t === '#') this.wall(px, py, c, rules, x, y, base);
      else if (t === '~') this.ink(px, py, c, rules, x, y);
      else if (t === 'D') this.door(px, py, c, doorOpen(base, rules));
    }
    // Footprints of the last run
    g.fillStyle = C.slot; g.globalAlpha = 0.28;
    for (const p of State.path) { g.beginPath(); g.arc(p.x * c + c / 2, p.y * c + c / 2, Math.max(2, c * 0.07), 0, 7); g.fill(); }
    g.globalAlpha = 1;
    // Interpolation
    const a = this.anim; let k = 1;
    if (a) { k = Math.min(1, (performance.now() - a.t0) / a.dur); }
    const ease = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
    const from = a ? a.from : snapshot(base), to = a ? a.to : snapshot(base);
    // Hatches
    to.hatches.forEach((h, i) => {
      const f = from.hatches[i] || h; const hx = f.x + (h.x - f.x) * ease, hy = f.y + (h.y - f.y) * ease;
      this.hatch(hx * c, hy * c, c, rules.hatch === 'follows', i >= (from.hatches.length) && a ? ease : 1);
    });
    if (!State.sim && rules.spare === 'under') this.hatch(base.pip.x * c, base.pip.y * c, c, false, 0.35 + 0.15 * Math.sin(this.t * 4));
    // Keys
    for (const kk of from.keys) if (to.keys.some(q => q.x === kk.x && q.y === kk.y) || k < 1) this.key(kk.x * c, kk.y * c, c, lv.keyLook);
    // Guards
    to.guards.forEach((gd, i) => {
      const f = from.guards[i] || gd; const gx = f.x + (gd.x - f.x) * ease, gy = f.y + (gd.y - f.y) * ease;
      this.guard(gx * c, gy * c, c, gd.dir, rules.guards === 'alert');
    });
    // Pip
    const fp = from.pip, tp = to.pip;
    let px = fp.x + (tp.x - fp.x) * ease, py = fp.y + (tp.y - fp.y) * ease, lift = 0;
    if (a && a.ev && a.ev.bump) { const b = a.ev.bump, s = Math.sin(Math.PI * k) * 0.22; px += (b.x - fp.x) * s * (Math.abs(b.x - fp.x) > 1 ? 0.5 : 1); py += (b.y - fp.y) * s * (Math.abs(b.y - fp.y) > 1 ? 0.5 : 1); }
    if (a && a.ev && a.ev.move && a.ev.move.hop) lift = Math.sin(Math.PI * k) * 0.45;
    const ang0 = DIR_ORDER.indexOf(fp.dir), ang1 = DIR_ORDER.indexOf(tp.dir);
    let da = ang1 - ang0; if (da > 2) da -= 4; if (da < -2) da += 4;
    const ang = (ang0 + da * ease) * Math.PI / 2;
    const gone = State.sim && State.sim.status === 'win' && k >= 1;
    if (!gone) this.pip(px * c, (py - lift) * c, c, ang, tp.key || fp.key, lift, lv.keyLook, State.sim && State.sim.status === 'smudged' && k >= 1, rules.stride === '2');
    g.restore();
    // Particles and floating text
    for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.02; g.globalAlpha = Math.max(0, p.life); g.fillStyle = p.color; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); }
    this.parts = this.parts.filter(p => p.life > 0);
    g.textAlign = 'center'; g.font = `700 ${GK.ui.floor(c * 0.32)}px ${getComputedStyle(document.body).getPropertyValue('--f-code') || 'monospace'}`;
    for (const f of this.floats) { f.y -= 0.6; f.life -= 0.018; g.globalAlpha = Math.max(0, f.life); g.fillStyle = f.color; g.fillText(f.text, f.x, f.y); }
    this.floats = this.floats.filter(f => f.life > 0);
    g.globalAlpha = 1;
  },
  wall(px, py, c, rules, x, y, s) {
    const g = this.g, C = this.colors, border = x === 0 || y === 0 || x === s.w - 1 || y === s.h - 1;
    const soft = rules.walls === 'soft' && !border;
    g.globalAlpha = soft ? 0.35 : 1;
    g.fillStyle = C.wall; g.fillRect(px + 1, py + 1, c - 2, c - 2);
    g.fillStyle = C['wall-top']; g.fillRect(px + 1, py + 1, c - 2, c * 0.18);
    g.fillStyle = C.paper; g.globalAlpha *= 0.45;
    g.fillRect(px + c * 0.38, py + c * 0.42, c * 0.24, c * 0.07); g.fillRect(px + c * 0.38, py + c * 0.7, c * 0.24, c * 0.07);
    g.globalAlpha = 1;
    if (soft) { g.setLineDash([4, 4]); g.strokeStyle = C.wall; g.lineWidth = 1.5; g.strokeRect(px + 2, py + 2, c - 4, c - 4); g.setLineDash([]); }
    if (rules.winOn === 'wall') { g.strokeStyle = C.brass; g.lineWidth = 2; g.globalAlpha = 0.5 + 0.4 * Math.sin(this.t * 3 + x + y); g.strokeRect(px + 2, py + 2, c - 4, c - 4); g.globalAlpha = 1; }
  },
  ink(px, py, c, rules, x, y) {
    const g = this.g, C = this.colors, dry = rules.ink === 'dry';
    g.fillStyle = C.spill; g.globalAlpha = dry ? 0.35 : 0.85;
    this.blob(px + c / 2, py + c / 2, 9, i => c * (0.37 + 0.07 * Math.sin(i * 2.3 + x * 1.7 + y * 3.1 + (dry ? 0 : this.t * 1.5))), 1); g.fill();
    if (!dry) { g.globalAlpha = 0.5; g.fillStyle = C.paper; g.beginPath(); g.arc(px + c * 0.38, py + c * 0.38, c * 0.05, 0, 7); g.fill(); }
    if (dry) { g.strokeStyle = C.spill; g.globalAlpha = 0.6; g.lineWidth = 1; g.beginPath(); g.moveTo(px + c * 0.3, py + c * 0.35); g.lineTo(px + c * 0.5, py + c * 0.55); g.lineTo(px + c * 0.68, py + c * 0.45); g.stroke(); }
    g.globalAlpha = 1;
  },
  door(px, py, c, open) {
    const g = this.g, C = this.colors;
    if (open) { g.strokeStyle = C.brass; g.lineWidth = 2; g.strokeRect(px + c * 0.12, py + c * 0.08, c * 0.76, c * 0.84); return; }
    g.fillStyle = C.ink; g.fillRect(px + c * 0.1, py + c * 0.06, c * 0.8, c * 0.88);
    g.fillStyle = C.stamp;
    for (let i = 0; i < 4; i++) g.fillRect(px + c * 0.1, py + c * (0.12 + i * 0.21), c * 0.8, c * 0.08);
    g.fillStyle = C.brass; g.beginPath(); g.arc(px + c * 0.72, py + c * 0.52, c * 0.07, 0, 7); g.fill();
  },
  hatch(px, py, c, follows, alpha) {
    const g = this.g, C = this.colors, cx = px + c / 2, cy = py + c / 2;
    g.globalAlpha = alpha;
    g.fillStyle = C.brass; g.beginPath(); g.arc(cx, cy, c * 0.36, 0, 7); g.fill();
    g.fillStyle = C.ink; g.beginPath(); g.arc(cx, cy, c * 0.26, 0, 7); g.fill();
    g.strokeStyle = C.brass; g.lineWidth = Math.max(1.5, c * 0.05);
    const r = this.t * 0.6;
    g.beginPath(); for (let i = 0; i < 4; i++) { const a = r + i * Math.PI / 2; g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * c * 0.24, cy + Math.sin(a) * c * 0.24); } g.stroke();
    if (follows) { g.fillStyle = C.brass; for (let i = 0; i < 3; i++) { const a = this.t * 4 + i * 2.1; g.beginPath(); g.arc(cx + Math.cos(a) * c * 0.44, cy + Math.sin(a) * c * 0.44, c * 0.04, 0, 7); g.fill(); } }
    g.globalAlpha = 1;
  },
  key(px, py, c, look) {
    const g = this.g, C = this.colors, cx = px + c / 2, cy = py + c / 2 + Math.sin(this.t * 3) * c * 0.04;
    g.strokeStyle = C.brass; g.fillStyle = C.brass; g.lineWidth = Math.max(2, c * 0.08); g.lineCap = 'round';
    if (look === 'pen') {
      g.beginPath(); g.moveTo(cx - c * 0.22, cy + c * 0.24); g.lineTo(cx + c * 0.2, cy - c * 0.24); g.stroke();
      g.beginPath(); g.ellipse(cx + c * 0.12, cy - c * 0.14, c * 0.08, c * 0.22, Math.PI / 4, 0, 7); g.fill();
      return;
    }
    g.beginPath(); g.arc(cx - c * 0.14, cy, c * 0.12, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(cx - c * 0.02, cy); g.lineTo(cx + c * 0.26, cy); g.moveTo(cx + c * 0.18, cy); g.lineTo(cx + c * 0.18, cy + c * 0.1); g.moveTo(cx + c * 0.26, cy); g.lineTo(cx + c * 0.26, cy + c * 0.12); g.stroke();
  },
  guard(px, py, c, dir, alert) {
    const g = this.g, C = this.colors, cx = px + c / 2, cy = py + c / 2, d = DIRS[dir];
    if (alert) { g.fillStyle = C.lamp; g.globalAlpha = 0.16; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, c * 1.05, Math.atan2(d[1], d[0]) - 0.5, Math.atan2(d[1], d[0]) + 0.5); g.closePath(); g.fill(); g.globalAlpha = 1; }
    g.fillStyle = C.guard; this.round(cx - c * 0.32, cy - c * 0.32, c * 0.64, c * 0.64, c * 0.16); g.fill();
    g.fillStyle = C.paper; g.fillRect(cx - c * 0.2, cy + c * 0.08, c * 0.4, c * 0.08);
    g.fillStyle = alert ? C.lamp : C['ink-soft'];
    g.beginPath(); g.arc(cx + d[0] * c * 0.16, cy + d[1] * c * 0.16 - c * 0.04, c * (alert ? 0.11 : 0.07), 0, 7); g.fill();
    if (!alert) { g.fillStyle = C['ink-soft']; g.font = `700 ${c * 0.3}px monospace`; g.textAlign = 'center'; g.fillText('z', cx + c * 0.3, cy - c * 0.3 - Math.sin(this.t * 2) * c * 0.06); }
  },
  pip(px, py, c, ang, key, lift, look, smudged, hopper) {
    const g = this.g, C = this.colors, cx = px + c / 2, cy = py + c / 2;
    // shadow
    g.fillStyle = C.ink; g.globalAlpha = 0.15; g.beginPath(); g.ellipse(cx, cy + c * 0.3 + lift * c, c * 0.24 * (1 - lift * 0.5), c * 0.07, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    const wob = smudged ? 1.6 : 1;
    g.fillStyle = C.ink;
    this.blob(cx, cy + (smudged ? c * 0.12 : 0), 12, i => c * 0.3 * wob * (1 + 0.07 * Math.sin(i * 3 + this.t * 5)), smudged ? 0.5 : 1); g.fill();
    if (smudged) return;
    if (hopper) { g.strokeStyle = C.slot; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - c * 0.12, cy + c * 0.3); g.lineTo(cx - c * 0.06, cy + c * 0.38); g.lineTo(cx, cy + c * 0.3); g.lineTo(cx + c * 0.06, cy + c * 0.38); g.lineTo(cx + c * 0.12, cy + c * 0.3); g.stroke(); }
    const dx = Math.cos(ang - Math.PI / 2), dy = Math.sin(ang - Math.PI / 2);
    const ex = -dy, ey = dx; // perpendicular for the eye pair
    for (const s of [-1, 1]) {
      const ox = cx + dx * c * 0.12 + ex * s * c * 0.1, oy = cy + dy * c * 0.12 + ey * s * c * 0.1 - c * 0.03;
      g.fillStyle = C.paper; g.beginPath(); g.arc(ox, oy, c * 0.075, 0, 7); g.fill();
      g.fillStyle = C.ink; g.beginPath(); g.arc(ox + dx * c * 0.03, oy + dy * c * 0.03, c * 0.035, 0, 7); g.fill();
    }
    if (key) { g.save(); g.translate(0, -c * 0.4); this.key(px, py, c * 0.7, look); g.restore(); }
  },
  // Smooth closed blob through n radial points (quadratic curves through midpoints).
  blob(cx, cy, n, rad, sy) {
    const g = this.g, pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = rad(i); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * sy]); }
    g.beginPath();
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    let m = mid(pts[n - 1], pts[0]); g.moveTo(m[0], m[1]);
    for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], mm = mid(p, q); g.quadraticCurveTo(p[0], p[1], mm[0], mm[1]); }
    g.closePath();
  },
  round(x, y, w, h, r) { const g = this.g; g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); },
};

/* ================= UI HELPERS ================= */
const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
let toastTimer = null;
function toast(msg) {
  let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}
const app = () => $('#app');
function totalStars() { return Object.values(Storage.data.stars).reduce((a, b) => a + b, 0); }

/* ================= SCREENS ================= */
function showTitle() {
  stopRun(); State.screen = 'title';
  const cont = Storage.data.unlocked > 1;
  app().innerHTML = `
  <div class="screen title-screen">
    <div class="form-no">Registry form 7-B · Request for exit</div>
    <h1 class="title-mark">Clause <span>&amp;</span><br>Effect</h1>
    <p class="lede">Pip is a small ink blot filed away in the Registry. Everything here obeys the ledger, and the ledger can be edited. The Auditor will notice, and the Auditor will seal every loophole you use.</p>
    <div class="btn-row">
      <button class="btn primary" id="go">${cont ? 'Continue' : 'Start'} ▶</button>
      <button class="btn" id="lv">Levels</button>
    </div>
    <p class="fineprint">15 levels. Tap a glowing word to rewrite it, then Run. Keys: Space runs, S steps one tick, R resets, H shows a hint.${Storage.notice ? ' ' + esc(Storage.notice) : ''}</p>
  </div>`;
  $('#go').onclick = () => { Sound.init(); openLevel(Math.min(Storage.data.unlocked - 1, Storage.data.cur || 0)); };
  $('#lv').onclick = () => { Sound.init(); showLevels(); };
  $('#go').focus();
}

function showLevels() {
  stopRun(); State.screen = 'levels';
  const d = Storage.data, found = Object.keys(d.endings).length;
  const tiles = LEVELS.map((lv, i) => {
    const locked = i >= d.unlocked, st = d.stars[lv.id] || 0;
    const kind = st && lv.sol && (lv.sol.clauses || lv.sol.struck) && !lv.sol.routine ? 'loophole' : '';
    return `<button class="lvl ${locked ? 'locked' : ''} ${i === d.cur ? 'cur' : ''}" data-i="${i}" ${locked ? 'aria-disabled="true"' : ''}>
      <span class="no">${String(i + 1).padStart(2, '0')}</span>
      ${kind && !locked ? `<span class="kind">${kind}</span>` : ''}
      <span class="nm">${locked ? 'Sealed file' : esc(lv.name)}</span>
      <span class="st" aria-label="${st} of 3 stars">${locked ? '🔒' : '★'.repeat(st) + '☆'.repeat(3 - st)}</span>
    </button>`;
  }).join('');
  const endingList = Object.entries(ENDINGS).filter(([k]) => k !== 'other').map(([k, e]) => `<div class="ending ${d.endings[k] ? 'got' : ''}">${d.endings[k] ? `<b>${esc(e.name)}</b>: ${esc(e.line)}` : '??? An unfound loophole'}</div>`).join('');
  app().innerHTML = `
  <div class="screen">
    <div class="topbar"><button class="icon-btn" id="home" aria-label="Title screen">⌂</button><h1>The Registry</h1><button class="icon-btn" id="set" aria-label="Settings">⚙</button></div>
    <div class="levels">${tiles}</div>
    <div class="summary"><span>Stars <b>${totalStars()}</b> / ${LEVELS.length * 3}</span><span>Loopholes found in the final audit <b>${found}</b> / 5</span></div>
    ${d.unlocked >= LEVELS.length || found ? `<div class="endings">${endingList}</div>` : ''}
    <p class="fineprint">A star for escaping, one for matching the par in ticks, and one for using no more routine lines than par.</p>
  </div>`;
  app().querySelectorAll('.lvl').forEach(b => b.onclick = () => {
    const i = +b.dataset.i; if (i >= d.unlocked) { toast('Finish the level before it to unseal this file.'); return; }
    openLevel(i);
  });
  $('#home').onclick = showTitle; $('#set').onclick = showSettings;
}

function showSettings() {
  const s = Storage.data.settings;
  openSheet(`<h3>Settings</h3>
    <div class="opts">
      <button class="opt" data-k="sound"><b>Sound effects: ${s.sound ? 'on' : 'off'}</b></button>
      <button class="opt" data-k="music"><b>Music: ${s.music ? 'on' : 'off'}</b></button>
      <button class="opt" data-k="fast"><b>Start runs at 3× speed: ${s.fast ? 'on' : 'off'}</b></button>
      <button class="opt" data-k="inspect"><b>Inspector: ${s.inspect ? 'shown' : 'hidden'}</b><span>Shows what the Auditor tracks during a run.</span></button>
      <button class="opt" data-k="theme"><b>Theme: ${s.theme}</b><span>System, light or dark.</span></button>
      <button class="opt clear" data-k="reset"><b>Erase all progress</b><span>Asks once more before erasing.</span></button>
    </div>`, sheet => {
    sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      if (k === 'reset') {
        sheet.querySelector('.opts').innerHTML = `<p class="ctx">Erase every star, draft and ending?</p><button class="opt clear" id="yes"><b>Yes, erase everything</b></button><button class="opt" id="no"><b>Keep my progress</b></button>`;
        $('#yes', sheet).onclick = () => { Storage.reset(); closeSheet(); toast('Progress erased.'); showTitle(); };
        $('#no', sheet).onclick = closeSheet; return;
      }
      if (k === 'theme') { s.theme = { system: 'light', light: 'dark', dark: 'system' }[s.theme]; applyTheme(); }
      else s[k] = !s[k];
      Storage.save(); Sound.syncMusic(); closeSheet(); showSettings();
      if (State.screen === 'play') renderPlay(); else if (State.screen === 'levels') showLevels();
    });
    const pyw = GK.ui.prefsButton({ className: 'opt', onOpen: closeSheet, panel: { text: true, tips: false } });
    if (pyw) { pyw.innerHTML = '<b>Play your way</b><span>Motion, flashes, text size and sound level.</span>'; sheet.querySelector('.opts').insertBefore(pyw, sheet.querySelector('.opt.clear')); }
  });
}
function applyTheme() {
  const t = Storage.data.settings.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  setTimeout(() => Render.readColors(), 30);
}

/* ---------- Play screen ---------- */
function openLevel(i) {
  stopRun();
  State.li = i; State.screen = 'play'; State.sim = null; State.path = []; State.brokenSeal = null; State.lastResult = null;
  const lv = LEVELS[i], draft = Storage.data.drafts[lv.id];
  State.ledger = validDraft(lv, draft) ? JSON.parse(JSON.stringify(draft)) : freshLedger(lv);
  State.edited = !!draft;
  State.hintShown = Storage.data.hints[lv.id] || 0;
  Storage.data.cur = i; Storage.save();
  app().innerHTML = `
  <div class="screen">
    <div class="topbar"><button class="icon-btn" id="back" aria-label="All levels">☰</button><h2 id="lname"></h2><button class="icon-btn" id="set" aria-label="Settings">⚙</button></div>
    <div class="play">
      <div class="board-col">
        <div class="memo" id="memo"></div>
        <div class="board-wrap" id="bw"><canvas id="board" aria-label="Puzzle board. Tap a tile to see what it is."></canvas><div id="result" role="status" aria-live="polite" hidden></div></div>
        <div class="hud" id="hud"></div>
      </div>
      <div class="ledger-col">
        <div class="ledger" id="ledger"></div>
        <div class="tools"><button class="btn" id="hint">Hint</button><button class="btn" id="fresh">Clear my edits</button></div>
        <div id="hintbox"></div>
        <div id="inspect"></div>
      </div>
    </div>
  </div>
  <div class="controls" id="controls">
    <button class="btn primary" id="run">▶ Run</button>
    <button class="btn small" id="stepb" aria-label="Step one tick">⏭</button>
    <button class="btn small" id="resetb" aria-label="Reset the board">⟲</button>
    <button class="btn small" id="speed" aria-label="Toggle speed"></button>
  </div>`;
  State.fast = Storage.data.settings.fast;
  Render.attach($('#board'));
  $('#back').onclick = showLevels; $('#set').onclick = showSettings;
  $('#run').onclick = () => { Sound.init(); toggleRun(); };
  $('#stepb').onclick = () => { Sound.init(); stepOnce(); };
  $('#resetb').onclick = () => { resetBoard(); };
  $('#speed').onclick = () => { State.fast = !State.fast; renderControls(); };
  $('#hint').onclick = showHint;
  $('#board').addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect(), c = Render.cell;
    const x = Math.floor((e.clientX - r.left) / c), y = Math.floor((e.clientY - r.top) / c);
    const info = tileInfo(x, y); if (info) toast(info);
  });
  $('#fresh').onclick = () => {
    stopRun(); State.ledger = freshLedger(lv); delete Storage.data.drafts[lv.id]; Storage.save(); State.edited = false; resetBoard(); renderPlay(); toast('Ledger restored to the original.');
  };
  renderPlay();
}

function renderPlay() {
  if (State.screen !== 'play') return;
  const lv = State.level();
  $('#lname').textContent = `${State.li + 1}. ${lv.name}`;
  $('#memo').innerHTML = `<span class="from">${State.li === LEVELS.length - 1 ? 'Memo · from the Pen' : 'Memo · Registry'}</span>${esc(lv.memo)}`;
  renderLedger(); renderHud(); renderControls(); renderHint(); renderInspector();
}

function slotBtn(kind, i, text, extra = '') { return `<button class="slot ${extra}" data-k="${kind}" data-i="${i}">${esc(text)}</button>`; }

function renderLedger() {
  const lv = State.level(), led = State.ledger, rules = resolveRules(lv, led);
  const activeLine = State.sim && State.sim.events.length ? State.sim.events[State.sim.events.length - 1].line : null;
  const hot = !State.edited && State.li <= 1;
  let h = '';
  h += `<div class="sect"><span>Pip</span></div>`;
  h += `<div class="line"><span class="ln"></span><span class="word">Pip starts facing</span>${lv.face.lock ? `<span class="slot locked" data-k="lockedface">${led.face}</span>` : slotBtn('face', 0, led.face, hot && State.li === 0 ? 'hot' : '')}</div>`;
  h += `<div class="sect"><span>Routine</span><em>one line per tick, then it loops</em></div>`;
  led.routine.forEach((l, i) => {
    const src = lv.routine[i];
    const act = activeLine === i && State.sim && (State.running || State.sim.status !== 'run') ? 'active' : '';
    if (src.lock) {
      h += `<div class="line ${act}" data-line="${i}"><span class="ln">${i + 1}</span><span class="slot locked" data-k="lockedline">${esc(lineText(l))}</span><span class="lock-tag">🔒 fixed</span></div>`;
      return;
    }
    let inner = slotBtn('cmd', i, l.cmd ? COMMANDS[l.cmd].label : '+ write a line', l.cmd ? '' : 'empty');
    if (l.cmd === 'repeat') inner += slotBtn('n', i, String(l.n)) + `<span class="word">×</span>` + slotBtn('act', i, COMMANDS[l.act].label);
    if (l.cmd === 'if') inner += slotBtn('sense', i, SENSES[l.sense].label) + `<span class="word">→</span>` + slotBtn('then', i, COMMANDS[l.then].label) + `<span class="word">else</span>` + slotBtn('else', i, COMMANDS[l.else].label);
    h += `<div class="line ${act}" data-line="${i}"><span class="ln">${i + 1}</span>${inner}</div>`;
  });
  if (lv.clauses.length) {
    h += `<div class="sect"><span>World</span><em>the Registry's clauses</em></div>`;
    for (const c of lv.clauses) {
      const def = CLAUSES[c.key], v = led.clauses[c.key];
      const sealedBy = !lv.strikable && lv.seals.find(s => SEALS[s].lock && SEALS[s].lock[0] === c.key);
      let slot;
      if (c.lock) slot = `<span class="slot locked" data-k="lockedclause" data-key="${c.key}">${esc(def.opts[v])}</span><span class="lock-tag">🔒 fixed</span>`;
      else if (sealedBy) slot = `<span class="slot sealed" data-k="sealedclause" data-seal="${sealedBy}">${esc(def.opts[rules[c.key]])}</span><span class="seal-tag">SEALED</span>`;
      else slot = slotBtn('clause', c.key, def.opts[v], hot && State.li === 1 ? 'hot' : '');
      h += `<div class="line"><span class="ln"></span><span class="word">${esc(def.pre)}</span>${slot}</div>`;
    }
  }
  if (lv.seals.length) {
    h += `<div class="sect"><span>The Auditor's seals</span><em>${lv.strikable ? 'tap a seal to strike it' : 'checked on every escape'}</em></div>`;
    if (lv.strikable) { const used = strokes(lv, led); h += `<div class="pen-ink">Pen ink: ${'●'.repeat(Math.max(0, 2 - used))}${'○'.repeat(Math.min(2, used))} ${used > 2 ? `(over by ${used - 2})` : `(${2 - used} left)`}</div>`; }
    for (const id of lv.seals) {
      const s = SEALS[id], struck = !!led.struck[id], broken = State.brokenSeal === s.text;
      const when = s.lock ? (lv.strikable ? 'checks the clause' : 'locks a clause') : 'checked at the end';
      const tag = lv.strikable && id !== 'pen' ? 'button' : 'div';
      h += `<${tag} class="seal-line ${struck ? 'struck' : ''} ${broken ? 'broken' : ''}" ${tag === 'button' ? `data-k="strike" data-i="${id}" style="width:100%;text-align:left;border:0;background:none;cursor:pointer"` : ''}><span class="dot">§</span><span class="txt">${esc(s.text)}</span><span class="when">${struck ? 'struck out' : (id === 'pen' ? 'permanent ink' : when)}</span></${tag}>`;
    }
  }
  const el = $('#ledger'); el.innerHTML = h;
  el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => onSlot(b));
}

function lineText(l) {
  if (!l.cmd) return '(blank)';
  if (l.cmd === 'repeat') return `repeat ${l.n} × ${COMMANDS[l.act].label}`;
  if (l.cmd === 'if') return `if ${SENSES[l.sense].label} → ${COMMANDS[l.then].label} else ${COMMANDS[l.else].label}`;
  return COMMANDS[l.cmd].label;
}

function onSlot(b) {
  Sound.init();
  const k = b.dataset.k, i = b.dataset.i, lv = State.level(), led = State.ledger;
  if (k === 'lockedline' || k === 'lockedface' || k === 'lockedclause') { Sound.sfx('bump'); toast('That line is fixed by the Registry.'); return; }
  if (k === 'sealedclause') { Sound.sfx('bump'); toast(`Sealed by the Auditor: ${SEALS[b.dataset.seal].text}`); return; }
  if (k === 'strike') {
    led.struck[i] = !led.struck[i]; if (!led.struck[i]) delete led.struck[i];
    Sound.sfx('stroke'); edited(); return;
  }
  Sound.sfx('tap');
  const L = led.routine[i];
  const pick = (title, ctx, options, cur, apply, extra) => openPicker({ title, ctx, options, cur, extra, onPick: v => { apply(v); Sound.sfx('pick'); edited(b); } });
  if (k === 'face') pick('Pip starts facing', 'Which way Pip looks before the first tick.', DIR_ORDER.map(d => ({ v: d, label: d })), led.face, v => led.face = v);
  else if (k === 'clause') { const def = CLAUSES[i]; pick(def.pre + ' …', 'A clause of the Registry. Seals may still check the result.', Object.entries(def.opts).map(([v, label]) => ({ v, label })), led.clauses[i], v => led.clauses[i] = v); }
  else if (k === 'cmd') {
    const opts = lv.palette.map(c => ({ v: c, label: COMMANDS[c].label, about: COMMANDS[c].about }));
    if (L.cmd) opts.push({ v: null, label: 'erase this line', about: 'Blank lines are skipped and take no time.', clear: true });
    pick(`Line ${+i + 1}`, 'Pick what Pip does on this line.', opts, L.cmd, v => {
      L.cmd = v;
      if (v === 'if' && !(lv.senses || []).includes(L.sense)) L.sense = (lv.senses || ['wall'])[0];
    });
  } else if (k === 'n') pick('Repeat how many ticks?', lineText(L), CONFIG.REPEAT_COUNTS.map(n => ({ v: n, label: n + ' ticks' })), L.n, v => L.n = v);
  else if (k === 'act' || k === 'then' || k === 'else') {
    const ctx = k === 'act' ? 'The action to repeat.' : k === 'then' ? `What Pip does when "${SENSES[L.sense].label}" is true.` : `What Pip does otherwise.`;
    pick(k === 'act' ? 'Repeat which action?' : k === 'then' ? 'Then' : 'Else', ctx, ACTIONS.map(a => ({ v: a, label: COMMANDS[a].label, about: COMMANDS[a].about })), L[k], v => L[k] = v);
  } else if (k === 'sense') pick('If Pip sees…', 'Pip looks one tile ahead (or at its own hands).', (lv.senses || []).map(s => ({ v: s, label: SENSES[s].label, about: SENSES[s].about })), L.sense, v => L.sense = v);
}

// Plain-language description of whatever is on a tile (tap the board to learn the pieces).
function tileInfo(x, y) {
  const lv = State.level(), s = State.sim || newSim(lv, State.ledger), r = resolveRules(lv, State.ledger);
  if (x < 0 || y < 0 || x >= s.w || y >= s.h) return '';
  if (s.pip.x === x && s.pip.y === y) return `Pip, facing ${s.pip.dir}${s.pip.key ? ', holding the key' : ''}. Pip follows the routine one line per tick.`;
  const g = s.guards.find(q => q.x === x && q.y === y);
  if (g) return r.guards === 'alert' ? `A guard walking ${g.dir}. It turns around at walls and catches Pip on the same tile.` : 'A sleeping guard. Pip can tiptoe past.';
  if (s.hatches.some(h => h.x === x && h.y === y)) return 'The hatch. Reach it to escape.';
  if (s.keys.some(k => k.x === x && k.y === y)) return lv.keyLook === 'pen' ? "The Auditor's Pen. It also works as the key." : 'The brass key. Pip picks it up by stepping on it.';
  const t = s.tiles[y][x];
  if (t === '#') return r.walls === 'soft' && x > 0 && y > 0 && x < s.w - 1 && y < s.h - 1 ? 'A soft wall. Pip can walk through it.' : 'A filing wall. Solid.';
  if (t === '~') return r.ink === 'dry' ? 'Dry ink. Harmless, unless a seal forbids touching it.' : 'Wet ink. Pip smudges if it steps here.';
  if (t === 'D') return doorOpen(s, r) ? 'An open door.' : 'A locked door. It opens while Pip holds the key.';
  return 'Floor.';
}

function edited() {
  const lv = State.level();
  State.edited = true; Storage.data.drafts[lv.id] = JSON.parse(JSON.stringify(State.ledger)); Storage.save();
  stopRun(); State.sim = null; State.brokenSeal = null; hideResult();
  renderPlay();
}

/* ---------- Picker sheet ---------- */
function openSheet(html, wire) {
  closeSheet();
  const bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.id = 'sheetbg';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  bg.addEventListener('click', e => { if (e.target === bg) closeSheet(); });
  document.body.appendChild(bg);
  wire && wire(bg.firstChild);
  const first = bg.querySelector('.opt.sel') || bg.querySelector('.opt'); first && first.focus();
}
function closeSheet() { const s = $('#sheetbg'); if (s) s.remove(); State.picker = null; }
function openPicker(p) {
  State.picker = p;
  const opts = p.options.map((o, n) => `<button class="opt ${o.v === p.cur ? 'sel' : ''} ${o.clear ? 'clear' : ''}" data-n="${n}"><b>${esc(o.label)}<kbd>${n + 1}</kbd></b>${o.about ? `<span>${esc(o.about)}</span>` : ''}</button>`).join('');
  openSheet(`<h3>${esc(p.title)}</h3><p class="ctx">${esc(p.ctx)}</p><div class="opts">${opts}</div>`, sheet => {
    sheet.querySelectorAll('.opt').forEach(b => b.onclick = () => { const o = p.options[+b.dataset.n]; closeSheet(); p.onPick(o.v); });
  });
}

/* ---------- Running ---------- */
function tickMs() { return CONFIG.TICK_MS / (State.fast ? CONFIG.FAST_MULT : 1); }
function ensureSim() {
  const lv = State.level();
  if (!State.sim || State.sim.status !== 'run') { State.sim = newSim(lv, State.ledger); State.path = [{ x: State.sim.pip.x, y: State.sim.pip.y }]; State.brokenSeal = null; hideResult(); }
}
function toggleRun() {
  if (State.running) { stopRun(); renderControls(); return; }
  ensureSim(); State.running = true; renderControls(); loop();
}
function stopRun() { State.running = false; clearTimeout(State.timer); State.timer = null; }
function loop() {
  if (!State.running) return;
  advance();
  if (State.sim && State.sim.status === 'run') State.timer = setTimeout(loop, tickMs());
  else { State.running = false; renderControls(); }
}
function stepOnce() { stopRun(); ensureSim(); advance(); renderControls(); }
function resetBoard() { stopRun(); State.sim = null; State.brokenSeal = null; hideResult(); renderLedger(); renderHud(); renderControls(); renderInspector(); }

function advance() {
  const lv = State.level(), s = State.sim; if (!s || s.status !== 'run') return;
  const from = snapshot(s);
  step(lv, State.ledger, s);
  const ev = s.events[s.events.length - 1];
  Render.anim = { from, to: snapshot(s), t0: performance.now(), dur: tickMs() * 0.92, ev };
  State.path.push({ x: s.pip.x, y: s.pip.y });
  const c = Render.cell, cx = s.pip.x * c + c / 2, cy = s.pip.y * c + c / 2;
  if (ev.move) Sound.sfx(ev.move.hop ? 'hop' : 'step');
  else if (ev.bump) Sound.sfx('bump');
  else if (ev.turn) Sound.sfx('turn');
  if (ev.key) { Sound.sfx('key'); setTimeout(() => { Render.burst(cx, cy, Render.colors.brass, 14); Render.float('key!', cx, cy - c * 0.3, Render.colors.brass); }, tickMs() * 0.8); }
  if (ev.hatchMove) Sound.sfx('hatch');
  if (ev.guardsMoved) Sound.sfx('guard');
  if (ev.spare) Render.float('printed!', cx, cy - c * 0.4, Render.colors.brass);
  renderLedger(); renderHud(); renderInspector();
  if (s.status !== 'run') setTimeout(() => endRun(s), Math.min(420, tickMs() + 60));
}

function endRun(s) {
  if (State.sim !== s) return;
  const lv = State.level(), c = Render.cell, cx = s.pip.x * c + c / 2, cy = s.pip.y * c + c / 2;
  const d = Storage.data;
  if (s.status === 'win') {
    Sound.sfx('win'); Render.burst(cx, cy, Render.colors.brass, 26, 3); Render.burst(cx, cy, Render.colors.slot, 18, 2.4);
    const stars = starsFor(lv, State.ledger, s), prev = d.stars[lv.id] || 0;
    d.stars[lv.id] = Math.max(prev, stars);
    const b = d.best[lv.id]; if (!b || s.tick < b.ticks) d.best[lv.id] = { ticks: s.tick, lines: usedLines(State.ledger) };
    if (State.li + 1 >= d.unlocked && State.li + 1 < LEVELS.length) d.unlocked = State.li + 2;
    let ending = null;
    if (lv.strikable) { ending = loopholeOf(lv, State.ledger); d.endings[ending] = true; }
    Storage.save();
    if (lv.strikable) { setTimeout(() => showFinale(ending, s), 700); return; }
    showResult(`
      <div class="big win">ESCAPED</div>
      <div class="stars" aria-label="${stars} of 3 stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <div class="meta">${s.tick} ticks (par ${lv.par.ticks}) · ${usedLines(State.ledger)} routine lines (par ${lv.par.lines})</div>
      <div class="remark" id="remark"></div>
      <div class="btn-row">${State.li + 1 < LEVELS.length ? '<button class="btn primary" id="next">Next level ▶</button>' : ''}<button class="btn" id="again">Replay</button></div>`);
    typewrite($('#remark'), 'The Auditor: ' + lv.remark);
    const nb = $('#next'); if (nb) { nb.onclick = () => openLevel(State.li + 1); nb.focus(); }
    $('#again').onclick = () => { resetBoard(); };
  } else if (s.status === 'void') {
    Sound.sfx('void'); Render.shake = 14 * GK.prefs.motionScale(); State.brokenSeal = s.voidSeal; renderLedger();
    showResult(`
      <div class="stamp-void">VOID</div>
      <div class="remark">Pip reached the exit, but the run broke a seal: <b>${esc(s.reason)}</b></div>
      <div class="btn-row"><button class="btn primary" id="edit">Back to the ledger</button></div>`);
    $('#edit').onclick = () => { resetBoard(); State.brokenSeal = s.voidSeal; renderLedger(); }; $('#edit').focus();
  } else {
    const label = { caught: 'CAUGHT', smudged: 'SMUDGED', timeout: 'STALLED' }[s.status];
    Sound.sfx(s.status === 'timeout' ? 'timeout' : s.status === 'smudged' ? 'smudge' : 'caught'); Render.shake = (s.status === 'timeout' ? 0 : 10) * GK.prefs.motionScale();
    if (s.status === 'smudged') Render.burst(cx, cy, Render.colors.spill, 20, 2);
    $('#bw').classList.remove('shake'); void $('#bw').offsetWidth; if (s.status !== 'timeout') $('#bw').classList.add('shake');
    showResult(`
      <div class="big bad">${label}</div>
      <div class="remark">${esc(s.reason)} (tick ${s.tick})</div>
      <div class="btn-row"><button class="btn primary" id="edit">Edit the ledger</button><button class="btn" id="hint2">Hint</button></div>`);
    $('#edit').onclick = resetBoard; $('#edit').focus();
    $('#hint2').onclick = () => { resetBoard(); showHint(); };
  }
}
function showResult(html) { const r = $('#result'); if (!r) return; r.className = 'result'; r.innerHTML = `<div class="card">${html}</div>`; r.hidden = false; }
function hideResult() { const r = $('#result'); if (r) { r.hidden = true; r.innerHTML = ''; } }
function typewrite(el, text) {
  if (!el) return;
  if (GK.prefs.motion() !== 'full') { el.textContent = text; return; }
  let n = 0; const t = setInterval(() => { if (!el.isConnected) return clearInterval(t); el.textContent = text.slice(0, ++n); if (n >= text.length) clearInterval(t); }, 22);
}

function renderHud() {
  const lv = State.level(), s = State.sim;
  const max = lv.maxTicks || CONFIG.MAX_TICKS;
  const best = Storage.data.best[lv.id], st = Storage.data.stars[lv.id] || 0;
  const msg = !s ? (State.edited ? 'Ready. Press Run.' : 'Tap a glowing slot to rewrite it, then press Run.') : s.status === 'run' ? (s.pip.key ? 'Pip has the key.' : 'Running…') : '';
  $('#hud').innerHTML = `<span>Tick <b>${s ? s.tick : 0}</b>/${max}</span><span>Par <b>${lv.par.ticks}</b> ticks · <b>${lv.par.lines}</b> lines</span><span>Best <b>${best ? best.ticks : '–'}</b></span><span aria-label="${st} stars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</span><span class="msg">${msg}</span>`;
}
function renderControls() {
  const r = $('#run'); if (!r) return;
  const done = State.sim && State.sim.status !== 'run';
  r.textContent = State.running ? '❚❚ Pause' : (State.sim && State.sim.tick > 0 && !done ? '▶ Resume' : '▶ Run');
  r.classList.toggle('hot', !State.running && State.edited && !State.sim && State.li <= 1);
  $('#speed').textContent = State.fast ? '3×' : '1×';
}
function showHint() {
  const lv = State.level();
  if (!lv.hints.length) { toast('No hints here. Everything you need, you have already used.'); return; }
  State.hintShown = Math.min(lv.hints.length, State.hintShown + 1);
  Storage.data.hints[lv.id] = State.hintShown; Storage.save(); renderHint();
}
function renderHint() {
  const lv = State.level(), n = State.hintShown;
  $('#hintbox').innerHTML = n ? lv.hints.slice(0, n).map((h, i) => `<div class="hintbox"><b>Hint ${i + 1}.</b> ${esc(h)}</div>`).join('') : '';
  const hb = $('#hint'); if (hb) { hb.textContent = n >= lv.hints.length ? 'All hints shown' : `Hint (${n}/${lv.hints.length})`; hb.disabled = !lv.hints.length || n >= lv.hints.length; }
}
function renderInspector() {
  const box = $('#inspect'); if (!box) return;
  if (!Storage.data.settings.inspect) { box.innerHTML = ''; return; }
  const lv = State.level(), s = State.sim || newSim(lv, State.ledger), r = resolveRules(lv, State.ledger), t = s.trace;
  box.innerHTML = `<div class="inspector">
    <span><span class="k">tick</span> ${s.tick}</span><span><span class="k">Pip</span> (${s.pip.x},${s.pip.y}) ${s.pip.dir}</span>
    <span><span class="k">holding key</span> ${s.pip.key}</span><span><span class="k">hatches</span> ${s.hatches.length} (max ${t.maxHatches})</span>
    <span><span class="k">hatch moved</span> ${t.hatchMoved}</span><span><span class="k">crossed wall</span> ${t.crossedWall}</span>
    <span><span class="k">touched ink</span> ${t.touchedInk}</span><span><span class="k">stride</span> ${r.stride}</span>
    <span><span class="k">walls</span> ${r.walls}</span><span><span class="k">guards</span> ${r.guards} / every ${r.pace}</span>
  </div>`;
}

/* ---------- Finale ---------- */
function showFinale(endingKey, s) {
  stopRun(); State.screen = 'finale';
  const e = ENDINGS[endingKey], d = Storage.data, found = Object.keys(d.endings).filter(k => k !== 'other').length;
  app().innerHTML = `
  <div class="screen title-screen">
    <div class="form-no">Registry form 0 · Exit granted</div>
    <div class="stamp-void ok">APPROVED</div>
    <div class="finale-card">
      <h2>${esc(e.name)}</h2>
      <p class="lede">${esc(e.line)} Pip drops through the hatch and out of the Registry for good.</p>
      <p class="lede">The Auditor stares at the ledger for a long time, then writes one more line: <i>"Request: transfer to a department with fewer ink blots."</i></p>
      <div class="summary"><span>Loopholes found <b>${found}</b> / 5</span><span>Stars <b>${totalStars()}</b> / ${LEVELS.length * 3}</span></div>
      <p class="fineprint">The final audit has five different loopholes that fit in two strokes of ink. Each one counts once.</p>
      <div class="btn-row"><button class="btn primary" id="again">Find another loophole</button><button class="btn" id="lv">All levels</button></div>
    </div>
  </div>`;
  if (GK.prefs.motion() !== 'still') { const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:30;width:100%;height:100%'; document.body.appendChild(c);
  confetti(c); }
  $('#again').onclick = () => { const lv = LEVELS[LEVELS.length - 1]; delete d.drafts[lv.id]; Storage.save(); openLevel(LEVELS.length - 1); };
  $('#lv').onclick = showLevels; $('#again').focus();
}
function confetti(cv) {
  const g = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight;
  const cols = [Render.colors.stamp, Render.colors.brass, Render.colors.slot, Render.colors.ink];
  const ps = Array.from({ length: Math.round(90 * GK.prefs.motionScale()) }, () => ({ x: Math.random() * W, y: -Math.random() * H * 0.5, vy: 1.5 + Math.random() * 2.5, vx: (Math.random() - 0.5) * 1.5, r: Math.random() * 6, a: Math.random() * 6, c: cols[Math.floor(Math.random() * 4)] }));
  let n = 0; (function f() { g.clearRect(0, 0, W, H); for (const p of ps) { p.y += p.vy; p.x += p.vx; p.a += 0.1; g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-4, -2, 8, 4 + p.r); g.restore(); } if (++n < 260) requestAnimationFrame(f); else cv.remove(); })();
}

/* ================= INPUT (keyboard + touch map to the same actions) ================= */
document.addEventListener('keydown', e => {
  if (document.querySelector('.gk-prefs')) return;
  if (State.picker || $('#sheetbg')) {
    if (e.key === 'Escape') { closeSheet(); e.preventDefault(); }
    const n = parseInt(e.key, 10);
    if (State.picker && n >= 1 && n <= State.picker.options.length) { const p = State.picker, o = p.options[n - 1]; closeSheet(); p.onPick(o.v); e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const list = [...document.querySelectorAll('#sheetbg .opt')], i = list.indexOf(document.activeElement);
      const j = (i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length; list[j] && list[j].focus(); e.preventDefault();
    }
    return;
  }
  if (State.screen !== 'play') return;
  const onButton = document.activeElement && document.activeElement.tagName === 'BUTTON';
  if ((e.key === ' ' || e.key === 'Enter') && !onButton) { e.preventDefault(); Sound.init(); toggleRun(); }
  else if (e.key === ' ' && onButton && document.activeElement.id === 'run') { /* default click */ }
  else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) { Sound.init(); stepOnce(); }
  else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) resetBoard();
  else if (e.key.toLowerCase() === 'h') showHint();
  else if (e.key === 'Escape') showLevels();
});
document.addEventListener('pointerdown', () => Sound.init(), { once: true });
document.addEventListener('visibilitychange', () => Sound.syncMusic());
window.addEventListener('resize', () => { if (State.screen === 'play') Render.resize(); });
matchMedia('(prefers-color-scheme: dark)').addEventListener && matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => Render.readColors());

function rafLoop(now) { try { Render.frame(now); } catch (e) { console.error(e); } requestAnimationFrame(rafLoop); }

/* ================= BOOT ================= */
let Coach = null;
function boot() {
  Storage.load(); applyTheme();
  GK.studio();
  GK.wired('motion', 'board shake and particle bursts; Calm/Still turn off the page animations and the typewriter remark (was the phone reduced-motion rule); Calm thins the finale confetti, Still drops it and stops the board wobble and glints');
  GK.wired('text', 'page CSS scaled (bottom controls, level-card tags and line numbers capped at 125%), canvas floating words');
  Coach = GK.coach.create('clause-and-effect-first', [{ target: () => $('#ledger .slot[data-k=face]') || $('#ledger button.slot'), done: () => State.edited || !!State.sim || State.li > 0 || totalStars() > 0 }], { when: () => State.screen === 'play' && !$('#sheetbg') && !State.running && !!$('#result') && $('#result').hidden });
  showTitle();
  requestAnimationFrame(rafLoop);
}
boot();
