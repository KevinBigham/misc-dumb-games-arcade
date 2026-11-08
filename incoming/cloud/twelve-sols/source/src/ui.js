/* Twelve Sols — UI: Storage, Audio, Renderer, Input. Reads state, calls Rules.act, never changes rules. */
(function () {
  'use strict';
  const { CONFIG, DATA, Rules, Store, newMeta, RECIPE_BY_ID } = window.TwelveSols;
  const { ITEMS, BUILDS, RECIPES, SITES, EVENTS, NEED_NAMES } = DATA;
  const $ = sel => document.querySelector(sel);
  const DEBUG = /[?&]debug=1/.test(location.search);

  // ---------- Storage (localStorage in try/catch, validated) ----------
  const KEY = { run: 'twelvesols.v1.run', meta: 'twelvesols.v1.meta', prefs: 'twelvesols.v1.prefs', bad: 'twelvesols.v1.damaged' };
  const Storage = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    loadMeta() {
      const raw = Storage.get(KEY.meta); if (!raw) return newMeta();
      try { return Store.repairMeta(JSON.parse(raw)); } catch (e) { Storage.set(KEY.bad + '.meta', raw); return newMeta(); }
    },
    loadRun() {
      const raw = Storage.get(KEY.run); if (!raw) return { run: null };
      let parsed = null; try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      const ok = Store.validateRun(parsed);
      if (!ok) { Storage.set(KEY.bad, raw); Storage.del(KEY.run); return { run: null, damaged: true }; }
      return { run: ok };
    },
    save() {
      Storage.set(KEY.meta, JSON.stringify(G.meta));
      if (G.s) Storage.set(KEY.run, JSON.stringify(G.s)); else Storage.del(KEY.run);
    },
    loadPrefs() { try { return Object.assign({ sound: true }, JSON.parse(Storage.get(KEY.prefs) || '{}')); } catch (e) { return { sound: true }; } },
    savePrefs() { Storage.set(KEY.prefs, JSON.stringify(G.prefs)); },
  };

  // ---------- Audio (code-generated, starts after first gesture, stops when hidden) ----------
  const Audio = {
    ctx: null, master: null, musicTimer: 0, step: 0,
    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
        try { this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = 0.6; this.master.connect(this.ctx.destination); } catch (e) { this.ctx = null; return; }
      }
      if (this.ctx.state === 'suspended' && !document.hidden && G.prefs.sound) this.ctx.resume().catch(() => {});
      if (!this.musicTimer) this.music(true);
    },
    ok() { return this.ctx && G.prefs.sound && !document.hidden; },
    tone(f, d, type = 'sine', g = 0.15, delay = 0, slide = 0) {
      if (!this.ok()) return; const c = this.ctx, t = c.currentTime + delay;
      const o = c.createOscillator(), v = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g, t + 0.015); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(this.master); o.start(t); o.stop(t + d + 0.05);
    },
    noise(d, cutoff = 600, g = 0.25) {
      if (!this.ok()) return; const c = this.ctx, t = c.currentTime;
      const len = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = c.createBufferSource(), f = c.createBiquadFilter(), v = c.createGain();
      f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff, t); f.frequency.linearRampToValueAtTime(cutoff * 0.4, t + d);
      v.gain.value = g; src.buffer = buf; src.connect(f); f.connect(v); v.connect(this.master); src.start(t);
    },
    sfx(k) {
      switch (k) {
        case 'tap': this.tone(520, 0.06, 'triangle', 0.06); break;
        case 'loot': this.tone(330, 0.08, 'triangle', 0.1); this.tone(494, 0.1, 'triangle', 0.09, 0.07); break;
        case 'craft': this.tone(392, 0.09, 'square', 0.05); this.tone(587, 0.14, 'triangle', 0.09, 0.06); break;
        case 'discover': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.1, i * 0.08)); break;
        case 'dud': this.tone(180, 0.22, 'sawtooth', 0.06, 0, -80); break;
        case 'use': this.tone(440, 0.12, 'sine', 0.12, 0, 220); break;
        case 'note': this.tone(880, 0.3, 'sine', 0.07); this.tone(1320, 0.3, 'sine', 0.05, 0.12); break;
        case 'blocked': this.tone(140, 0.12, 'square', 0.05); break;
        case 'storm': this.noise(1.6, 900, 0.35); this.tone(70, 0.9, 'sawtooth', 0.08, 0.1, -30); break;
        case 'win': [392, 494, 587, 784, 988].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.11, i * 0.12)); break;
        case 'lose': [330, 262, 196].forEach((f, i) => this.tone(f, 0.5, 'sine', 0.1, i * 0.25)); break;
      }
    },
    music(on) { // quiet generative pad, pentatonic minor
      clearTimeout(this.musicTimer); this.musicTimer = 0;
      if (!on || !this.ok()) return;
      const scale = [146.8, 174.6, 196, 220, 261.6, 293.7, 349.2];
      const tick = () => {
        if (!this.ok()) { this.musicTimer = 0; return; }
        const night = G.s && G.s.hour >= CONFIG.DAY_HOURS;
        const f = scale[(this.step * 3 + (this.step >> 2)) % scale.length] * (night ? 0.5 : 1);
        this.tone(f, 2.6, 'sine', 0.035); if (this.step % 4 === 0) this.tone(f * 1.5, 2.4, 'sine', 0.02, 0.3);
        this.step++; this.musicTimer = setTimeout(tick, 2300);
      };
      this.musicTimer = setTimeout(tick, 400);
    },
    hidden() { clearTimeout(this.musicTimer); this.musicTimer = 0; if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); },
    shown() { if (this.ctx && G.prefs.sound) { this.ctx.resume().catch(() => {}); this.music(true); } },
  };

  // ---------- global UI state ----------
  const G = { s: null, meta: null, prefs: null, tab: 'go', sel: [], armed: 0, lastDiscover: null, toastT: 0 };

  // ---------- icons (code-drawn SVG) ----------
  function icon(id, size = 30) {
    const it = ITEMS[id]; const c = it.color; let p = '';
    switch (it.shape) {
      case 'hex': p = `<polygon points="15,3 26,9 26,21 15,27 4,21 4,9" fill="${c}" stroke="#fff6" stroke-width="1.5"/>`; break;
      case 'dots': p = `<circle cx="10" cy="12" r="5" fill="${c}"/><circle cx="20" cy="10" r="4" fill="${c}"/><circle cx="16" cy="20" r="6" fill="${c}"/>`; break;
      case 'square': p = `<rect x="5" y="6" width="20" height="18" rx="3" fill="${c}"/><path d="M8 11h14M8 16h10" stroke="#0004" stroke-width="2"/>`; break;
      case 'zig': p = `<path d="M4 15 l4-7 4 14 4-14 4 14 4-7" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`; break;
      case 'tri': p = `<polygon points="15,3 27,25 3,25" fill="${c}" opacity=".9"/><path d="M15 8 L20 22" stroke="#fff8" stroke-width="2"/>`; break;
      case 'blob': p = `<path d="M6 22 C2 12 12 4 16 9 C20 2 30 10 24 18 C28 24 14 28 6 22Z" fill="${c}"/>`; break;
      case 'bar': p = `<rect x="8" y="5" width="14" height="21" rx="3" fill="${c}"/><rect x="12" y="2" width="6" height="4" fill="${c}"/><path d="M16 10 l-3 6h5l-3 6" stroke="#2a1606" stroke-width="2" fill="none"/>`; break;
      case 'wave': p = `<path d="M3 10 q6-6 12 0 t12 0 v12 q-6-6-12 0 t-12 0z" fill="${c}"/>`; break;
      case 'drop': p = `<path d="M15 3 C20 12 24 16 24 20 a9 9 0 0 1-18 0 C6 16 10 12 15 3z" fill="${c}"/>`; break;
      case 'pack': p = `<rect x="5" y="8" width="20" height="16" rx="4" fill="${c}"/><path d="M10 8 v-3 h10 v3" stroke="${c}" stroke-width="2" fill="none"/>`; break;
      case 'bowl': p = `<path d="M4 13 h22 a11 11 0 0 1-22 0z" fill="${c}"/><path d="M11 9 q2-4 0-6 M17 9 q2-4 0-6" stroke="${c}" stroke-width="2" fill="none"/>`; break;
      case 'can': p = `<rect x="8" y="7" width="14" height="19" rx="6" fill="${c}"/><rect x="12" y="3" width="6" height="5" rx="1" fill="#cfd6dc"/>`; break;
      case 'brick': p = `<rect x="3" y="8" width="24" height="14" rx="2" fill="${c}"/><path d="M3 15h24M11 8v7M19 15v7" stroke="#0005" stroke-width="1.6"/>`; break;
      case 'mast': p = `<path d="M15 27 V6 M8 27 L15 12 L22 27" stroke="${c}" stroke-width="2.5" fill="none"/><circle cx="15" cy="5" r="3" fill="var(--rust)"/>`; break;
      case 'board': p = `<rect x="4" y="6" width="22" height="18" rx="2" fill="${c}"/><path d="M8 11h6v6h8M14 17v4" stroke="#0d2422" stroke-width="2" fill="none"/>`; break;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true">${p}</svg>`;
  }
  const buildIcon = (size = 26) => `<svg width="${size}" height="${size}" viewBox="0 0 30 30" aria-hidden="true"><path d="M3 24 A12 12 0 0 1 27 24 Z" fill="#4fd1c5"/><rect x="12" y="15" width="6" height="9" fill="#1a0e11"/></svg>`;
  const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  // ---------- actions ----------
  function doAct(a) {
    if (!G.s) return;
    const out = Rules.act(G.s, G.meta, a);
    G.s = out.s; G.meta = out.meta;
    Storage.save();
    handleFx(out.fx, a);
    render();
  }

  function handleFx(fx, a) {
    fx.forEach(f => {
      switch (f.k) {
        case 'blocked': toast(f.why); Audio.sfx('blocked'); break;
        case 'loot': Audio.sfx('loot'); Scene.burst('loot'); break;
        case 'craft': Audio.sfx('craft'); Scene.burst('craft'); break;
        case 'discover': Audio.sfx('discover'); G.lastDiscover = f.id; toast('Discovered: ' + recipeOutName(RECIPE_BY_ID[f.id]) + '! It stays in your journal forever.'); Scene.burst('discover'); break;
        case 'dud': Audio.sfx('dud'); toast('Nothing useful. The journal remembers, so you never waste that hour again.'); break;
        case 'use': Audio.sfx('use'); popNeeds(ITEMS[f.id].use); break;
        case 'note': setTimeout(() => { Audio.sfx('note'); toast('Field note found. Check the Journal.'); }, 350); break;
        case 'full': toast('Pack full (' + CONFIG.MAX_STACK + ' max): left ' + f.items.join(', ') + ' behind.'); break;
        case 'storm': Audio.sfx('storm'); Scene.shake(f.dmg); break;
        case 'win': setTimeout(() => Audio.sfx('win'), 600); if (G.s.result && G.s.result.unlocked) { G.prefs.level = null; Storage.savePrefs(); } break;
        case 'lose': setTimeout(() => Audio.sfx('lose'), 600); break;
      }
    });
    if (a.t === 'craft') G.sel = [];
  }

  function recipeOutName(r) {
    if (r.build) return BUILDS[r.build].name;
    return Object.keys(r.out).map(k => (r.out[k] > 1 ? r.out[k] + ' ' : '') + ITEMS[k].name).join(', ');
  }
  function useText(id) {
    const u = ITEMS[id].use; if (!u) return '';
    return Object.keys(u).map(k => '+' + u[k] + ' ' + NEED_NAMES[k]).join(', ') + (ITEMS[id].hours ? ' (' + ITEMS[id].hours + 'h)' : '');
  }

  function toast(t) {
    const el = $('#toast'); el.textContent = t; el.classList.add('on');
    clearTimeout(G.toastT); G.toastT = setTimeout(() => el.classList.remove('on'), 2600);
  }
  function popNeeds(use) {
    const box = $('.needs'); if (!box) return;
    Object.keys(use).forEach((k, i) => {
      const el = box.querySelector('[data-need="' + k + '"]'); if (!el) return;
      const sp = document.createElement('span'); sp.className = 'pop'; sp.textContent = '+' + use[k];
      sp.style.color = 'var(--' + k + ')'; sp.style.left = (el.offsetLeft + el.offsetWidth - 40) + 'px'; sp.style.top = (el.offsetTop - 4 - i * 2) + 'px';
      box.appendChild(sp); setTimeout(() => sp.remove(), 1000);
    });
  }

  // ---------- Scene (canvas) ----------
  const Scene = {
    cv: null, cx: null, w: 0, h: 0, parts: [], shakeT: 0, shakeAmp: 0, t: 0, raf: 0, flash: 0, flashColor: '#fff',
    init() { this.cv = $('#scene'); this.cx = this.cv.getContext('2d'); this.resize(); },
    resize() {
      const r = this.cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.w = Math.max(200, r.width || 360); this.h = Math.max(90, r.height || 128);
      this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
      if (this.cx) this.cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },
    shake(dmg) { const ms = GK.prefs.motionScale(); this.shakeT = 0.9; this.shakeAmp = Math.min(9, 2 + dmg / 4) * ms; for (let i = 0; i < Math.round(70 * ms); i++) this.dust(true); },
    burst(kind) {
      const col = kind === 'discover' ? '#f2c14e' : kind === 'loot' ? '#e0904a' : '#4fd1c5';
      for (let i = 0; i < Math.round((kind === 'discover' ? 40 : 16) * GK.prefs.motionScale()); i++) this.parts.push({ x: this.w * 0.5, y: this.h * 0.62, vx: (Math.random() - 0.5) * 160, vy: -Math.random() * 140, life: 0.9, c: col, g: 220, r: 2 });
      if (kind === 'discover') { const fa = GK.flash.allow(0.5); if (fa > 0) { this.flash = fa; this.flashColor = '#f2c14e'; } }
    },
    dust(strong) {
      const s = G.s; const pow = s ? Rules.stormTonight(s).power : 10;
      this.parts.push({ x: -10, y: Math.random() * this.h * 0.85, vx: 60 + pow * 4 + (strong ? 200 : 0) + Math.random() * 60, vy: (Math.random() - 0.4) * 20, life: 6, c: strong ? '#ffb08a' : '#d9785a', g: 0, r: strong ? 2.2 : 1.4, dust: true });
    },
    loop(ts) {
      const dt = Math.min(0.05, (ts - (this.t || ts)) / 1000); this.t = ts;
      this.update(dt); this.draw();
      this.raf = requestAnimationFrame(t => this.loop(t));
    },
    start() { if (!this.raf) this.raf = requestAnimationFrame(t => { this.t = t; this.loop(t); }); },
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; this.t = 0; },
    update(dt) {
      const s = G.s; const pow = s ? Rules.stormTonight(s).power : 8;
      if (GK.prefs.motion() !== 'still' && Math.random() < dt * (3 + pow * 0.6)) this.dust(false);
      this.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; p.life -= dt; });
      this.parts = this.parts.filter(p => p.life > 0 && p.x < this.w + 20 && p.y < this.h + 20).slice(-260);
      if (this.shakeT > 0) this.shakeT -= dt; if (this.flash > 0) this.flash -= dt;
    },
    draw() {
      const c = this.cx, w = this.w, h = this.h, s = G.s; if (!c) return;
      const hour = s ? s.hour : 3; const night = hour >= CONFIG.DAY_HOURS;
      const k = Math.min(1, hour / CONFIG.DAY_HOURS);
      c.save();
      if (this.shakeT > 0) c.translate((Math.random() - 0.5) * this.shakeAmp, (Math.random() - 0.5) * this.shakeAmp);
      // sky
      const g = c.createLinearGradient(0, 0, 0, h);
      if (night) { g.addColorStop(0, '#120a1c'); g.addColorStop(1, '#3a1626'); }
      else { g.addColorStop(0, mix('#e9a27b', '#5a2a4a', k)); g.addColorStop(1, mix('#f6cfa4', '#b0523e', k)); }
      c.fillStyle = g; c.fillRect(-10, -10, w + 20, h + 20);
      // sun / stars
      if (!night) { const sx = w * (0.1 + 0.8 * k), sy = h * (0.55 - Math.sin(k * Math.PI) * 0.4); c.fillStyle = '#fff3d6'; c.globalAlpha = 0.85; c.beginPath(); c.arc(sx, sy, 7, 0, 7); c.fill(); c.globalAlpha = 1; }
      else { c.fillStyle = '#fff'; for (let i = 0; i < 26; i++) { c.globalAlpha = 0.3 + ((i * 37) % 10) / 20; c.fillRect((i * 97) % w, (i * 53) % (h * 0.5), 1.5, 1.5); } c.globalAlpha = 1; }
      // dunes
      c.fillStyle = night ? '#4a1d20' : '#a8452f'; dune(c, w, h, 0.70, 0.08, 1.3);
      c.fillStyle = night ? '#341316' : '#7d3122'; dune(c, w, h, 0.82, 0.06, 2.1);
      // hab
      const hx = w * 0.5, hy = h * 0.84, R = Math.min(48, h * 0.38);
      const b = s ? s.builds : {};
      if (b.panel) for (let i = 0; i < b.panel; i++) { c.fillStyle = '#2d5d7a'; c.save(); c.translate(hx + R + 14 + i * 26, hy - 4); c.rotate(-0.3); c.fillRect(0, -10, 22, 10); c.strokeStyle = '#8fe3d6'; c.strokeRect(0, -10, 22, 10); c.restore(); }
      if (b.planter) for (let i = 0; i < b.planter; i++) { c.fillStyle = '#5e3a26'; c.fillRect(hx - R - 34 - i * 24, hy - 8, 20, 8); c.fillStyle = '#8db84a'; for (let j = 0; j < 4; j++) c.fillRect(hx - R - 32 - i * 24 + j * 5, hy - 13 - (j % 2) * 3, 3, 6); }
      if (b.beacon) { c.strokeStyle = '#cfd6dc'; c.lineWidth = 2; c.beginPath(); c.moveTo(hx + R * 0.5, hy - R * 0.7); c.lineTo(hx + R * 0.5, hy - R * 1.5); c.stroke(); if (GK.prefs.motion() === 'still' || Math.floor(performance.now() / 500) % 2) { c.fillStyle = '#ff5d3d'; c.beginPath(); c.arc(hx + R * 0.5, hy - R * 1.5, 4, 0, 7); c.fill(); } }
      c.fillStyle = '#3e8f89'; c.beginPath(); c.arc(hx, hy, R, Math.PI, 0); c.fill();
      c.fillStyle = '#4fd1c5'; c.beginPath(); c.arc(hx, hy, R - 5, Math.PI, 0); c.fill();
      // windows glow
      const lit = night ? (b.lamp ? '#ffe28a' : '#7a5a3a') : '#cdeff0';
      c.fillStyle = lit; c.fillRect(hx - R * 0.55, hy - R * 0.45, R * 0.3, R * 0.22); c.fillRect(hx + R * 0.25, hy - R * 0.45, R * 0.3, R * 0.22);
      c.fillStyle = '#1a0e11'; c.fillRect(hx - 7, hy - 16, 14, 16);
      // shutters
      const sh = b.shutter || 0;
      for (let i = 0; i < sh; i++) { const a0 = Math.PI + 0.25 + i * 0.95; c.strokeStyle = '#9aa3ad'; c.lineWidth = 6; c.beginPath(); c.arc(hx, hy, R + 3, a0, a0 + 0.7); c.stroke(); }
      // damage
      if (s && s.hull < 60) { c.strokeStyle = s.hull <= 0 ? '#ff4040' : '#1a0e11'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx - R * 0.2, hy - R * 0.9); c.lineTo(hx - R * 0.05, hy - R * 0.6); c.lineTo(hx - R * 0.25, hy - R * 0.4); if (s.hull < 30) { c.moveTo(hx + R * 0.5, hy - R * 0.7); c.lineTo(hx + R * 0.3, hy - R * 0.45); } c.stroke(); }
      // particles
      this.parts.forEach(p => { c.globalAlpha = Math.min(1, p.life * 1.5) * (p.dust ? 0.7 : 1); c.fillStyle = p.c; c.fillRect(p.x, p.y, p.r * 2, p.r * (p.dust ? 1 : 2)); });
      c.globalAlpha = 1;
      if (this.flash > 0) { c.globalAlpha = this.flash * 0.6; c.fillStyle = this.flashColor; c.fillRect(-10, -10, w + 20, h + 20); c.globalAlpha = 1; }
      c.restore();
    },
  };
  function dune(c, w, h, base, amp, f) { c.beginPath(); c.moveTo(-10, h + 10); for (let x = -10; x <= w + 10; x += 8) c.lineTo(x, h * base + Math.sin(x / w * Math.PI * f + f) * h * amp); c.lineTo(w + 10, h + 10); c.fill(); }
  function mix(a, b, t) { const p = x => [1, 3, 5].map(i => parseInt(x.substr(i, 2), 16)); const A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; }

  // ---------- Renderer ----------
  function render() {
    const s = G.s;
    if (!s) return;
    renderTop(); renderPanel(); renderFoot();
    if (s.result && !(s.night && !s.night.seen)) showEnd();
    else if (s.night && !s.night.seen) showNight();
  }

  function renderTop() {
    const s = G.s; const lim = Rules.hourLimit(s);
    let pips = '';
    for (let i = 0; i < CONFIG.DAY_HOURS + CONFIG.LAMP_HOURS; i++) {
      const lamp = i >= CONFIG.DAY_HOURS; const avail = i < lim;
      pips += `<span class="pip${lamp ? ' lamp' : ''}${i < s.hour ? ' used' : ''}${!avail ? ' off' : ''}"></span>`;
    }
    $('#top').innerHTML = `<div class="sol">Sol ${s.sol}<small>/${s.rescueSol}</small></div><div class="pips" title="Hours left today">${pips}</div>
      <button class="ibtn" data-act="sound" aria-label="Sound">${G.prefs.sound ? '♪' : '×'}</button><button class="ibtn" data-act="menu" aria-label="Menu">≡</button>`;
    const st = Rules.stormTonight(s); const ev = EVENTS[s.event];
    const left = lim - s.hour;
    $('#fore').innerHTML = `<span class="chip ${st.dmg >= s.hull ? 'warn' : ''}">Tonight's storm ${st.power}${st.blocked ? ' − ' + st.blocked + ' shutters' : ''} → hull −${st.dmg}</span>
      <span class="chip">${esc(ev.name)}</span>${s.level ? `<span class="chip warn">${esc(CONFIG.LEVELS[s.level].name)}</span>` : ''}<span class="chip">${left}h left${s.hour >= CONFIG.DAY_HOURS ? ' (lamp)' : ''}</span>`;
    const need = (k, v) => `<div class="need${v < 25 ? ' low' : ''}" data-need="${k}"><div class="row"><span>${NEED_NAMES[k]}</span><b>${Math.round(v)}</b></div><div class="bar"><i style="width:${v}%;background:var(--${k})"></i></div></div>`;
    $('#needs').innerHTML = need('air', s.needs.air) + need('warm', s.needs.warm) + need('food', s.needs.food) + need('hull', s.hull);
    const tabs = [['go', 'Go Out'], ['bench', 'Bench'], ['pack', 'Pack'], ['journal', 'Journal']];
    $('#tabs').innerHTML = tabs.map(([k, n], i) => `<button class="tab${G.tab === k ? ' on' : ''}" data-tab="${k}" aria-label="${n} (${i + 1})">${n}${k === 'journal' && G.newHint ? '<span class="dot"></span>' : ''}</button>`).join('');
  }

  function siteLootIcons(id) {
    const L = SITES[id].loot; return Object.keys(L).sort((a, b) => L[b] - L[a]).slice(0, 4).map(k => icon(k, 20)).join('');
  }

  function renderPanel() {
    const s = G.s; let h = '';
    if (G.tab === 'go') {
      h += `<div class="sect">Sites today · trips use suit air</div>`;
      s.sites.forEach((id, i) => {
        const site = SITES[id]; const c = Rules.check(s, G.meta, { t: 'scav', i });
        const hrs = site.h + (s.event === 'haze' ? 1 : 0);
        h += `<div class="card${s.visited[i] ? ' done' : ''}"><div class="grow"><h3>${site.name}</h3><div class="sub">${hrs}h · −${Rules.tripAir(s, id)} air · ${site.n} finds</div><div class="icons">${siteLootIcons(id)}</div>${c.ok ? '' : `<div class="why">${esc(c.why)}</div>`}</div>
          <button class="go" data-act="scav" data-i="${i}" ${c.ok ? '' : 'disabled'}>${s.visited[i] ? 'Done' : 'Go'}</button></div>`;
      });
      if (s.sol === 1 && s.hour === 0) h += `<p class="sub" style="color:var(--muted);font-size:calc(13px * var(--gk-text-scale,1))">Tip: go out for supplies, then turn them into food, air and heat at the Bench. End the sol when your hours run out. Survive ${s.rescueSol} nights.</p>`;
    } else if (G.tab === 'bench') {
      const known = RECIPES.filter(r => G.meta.known.indexOf(r.id) >= 0);
      const rows = known.map(r => ({ r, c: Rules.check(s, G.meta, { t: 'craft', a: r.a, b: r.b }) }));
      rows.sort((x, y) => (y.c.ok - x.c.ok));
      h += `<div class="sect">Make · ${known.length} known recipes</div>`;
      rows.forEach(({ r, c }) => {
        const out = r.build ? buildIcon(26) : icon(Object.keys(r.out)[0], 26);
        const extra = r.build ? ` <span style="color:var(--muted)">(${s.builds[r.build] || 0}/${BUILDS[r.build].max})</span>` : '';
        const why = c.ok ? '' : (count(r.a) && count(r.b)) ? c.why : 'Need ' + [r.a, r.b].filter(x => !count(x)).map(x => ITEMS[x].name).join(' + ');
        h += `<div class="card${G.lastDiscover === r.id ? ' discover' : ''}"><div class="grow"><div class="eq">${icon(r.a, 24)}+${icon(r.b, 24)}→${out}</div><div class="sub"><b style="color:var(--ink)">${recipeOutName(r)}</b>${extra} · ${r.build ? BUILDS[r.build].desc : (ITEMS[Object.keys(r.out)[0]].use ? useText(Object.keys(r.out)[0]) : 'ingredient')}</div>${why ? `<div class="why">${esc(why)}</div>` : ''}</div>
          <button class="go alt" data-act="make" data-r="${r.id}" ${c.ok ? '' : 'disabled'}>Make ${c.ok ? c.hours + 'h' : ''}</button></div>`;
      });
      h += `<div class="sect">Experiment · combine two things you've never tried</div>`;
      h += experimentBox();
      h += itemGrid('exp');
    } else if (G.tab === 'pack') {
      const ids = Object.keys(s.inv);
      h += `<div class="sect">Use</div>`;
      const usable = ids.filter(id => ITEMS[id].use);
      if (!usable.length) h += `<p class="sub" style="color:var(--muted)">Nothing usable yet. Food, air and heat are made at the Bench.</p>`;
      usable.forEach(id => {
        const c = Rules.check(s, G.meta, { t: 'use', id });
        h += `<div class="card"><div>${icon(id, 30)}</div><div class="grow"><h3>${ITEMS[id].name} ×${s.inv[id]}</h3><div class="sub">${useText(id)}</div>${c.ok ? '' : `<div class="why">${esc(c.why)}</div>`}</div><button class="go" data-act="use" data-id="${id}" ${c.ok ? '' : 'disabled'}>Use</button></div>`;
      });
      h += `<div class="sect">Supplies (${ids.reduce((a, k) => a + s.inv[k], 0)} items, ${CONFIG.MAX_STACK} max each)</div>` + itemGrid('view');
      const bl = Object.keys(s.builds).filter(k => s.builds[k]);
      h += `<div class="sect">Built</div>` + (bl.length ? `<ul class="list">${bl.map(k => `<li><b>${BUILDS[k].name}</b> ×${s.builds[k]} · ${BUILDS[k].desc}</li>`).join('')}</ul>` : `<p class="sub" style="color:var(--muted)">Nothing built yet.</p>`);
    } else {
      h += journalHtml();
    }
    $('#panel').innerHTML = h;
  }
  const count = id => G.s.inv[id] || 0;

  function itemGrid(mode) {
    const ids = Object.keys(G.s.inv);
    if (!ids.length) return `<p class="sub" style="color:var(--muted)">Your pack is empty.</p>`;
    const first = G.sel[0];
    return `<div class="grid">` + ids.map(id => {
      const sec = Rules.secretsFor(G.meta, id);
      let mark = '';
      if (mode === 'exp' && first && first !== id) {
        const ps = Rules.pairStatus(G.meta, first, id).st;
        mark = ps === 'known' ? '<span class="mark mk-known">✓</span>' : ps === 'dud' ? '<span class="mark mk-dud">✗</span>' : '<span class="mark mk-untried">?</span>';
      }
      const sel = mode === 'exp' && G.sel.indexOf(id) >= 0;
      return `<button class="item${sel ? ' sel' : ''}" ${mode === 'exp' ? `data-act="pick" data-id="${id}"` : 'tabindex="-1"'} aria-label="${ITEMS[id].name} ${G.s.inv[id]}"><span class="n">${G.s.inv[id]}</span>${sec ? `<span class="sec" title="${sec} undiscovered recipes use this">✦${sec}</span>` : ''}${icon(id, 30)}<span>${ITEMS[id].name}</span>${mark}</button>`;
    }).join('') + `</div><p style="color:var(--muted);font-size:calc(12px * var(--gk-text-scale,1));margin:6px 2px">✦ = recipes you haven't discovered that use this item. ✓ known · ✗ tried, nothing · ? untried</p>`;
  }

  function experimentBox() {
    const [a, b] = G.sel;
    if (!a) return `<div class="trybox"><span class="sub" style="color:var(--muted)">Tap an item below, then a second one.</span></div>`;
    if (!b) return `<div class="trybox"><div class="eq">${icon(a, 28)} + ?</div><span class="sub" style="color:var(--muted)">Now pick a partner. Gold ✦ items still hide recipes.</span></div>`;
    const ps = Rules.pairStatus(G.meta, a, b); const c = Rules.check(G.s, G.meta, { t: 'craft', a, b });
    let msg = ps.st === 'known' ? 'Known: makes ' + recipeOutName(ps.r) : ps.st === 'dud' ? 'Tried before: nothing.' : 'Untried. Costs ' + (c.hours || 1) + 'h to test.';
    if (!c.ok && ps.st !== 'dud') msg += ' ' + c.why;
    return `<div class="trybox"><div class="eq">${icon(a, 28)}+${icon(b, 28)}</div><div class="grow" style="flex:1;font-size:calc(13px * var(--gk-text-scale,1))">${esc(msg)}</div><button class="go" data-act="try" ${c.ok ? '' : 'disabled'}>${ps.st === 'known' ? 'Make' : 'Try'}</button></div>`;
  }

  function journalHtml() {
    const m = G.meta; G.newHint = false;
    let h = `<div class="sect">Field journal · ${m.known.length}/${RECIPES.length} recipes · kept forever</div><ul class="list">`;
    RECIPES.forEach(r => {
      if (m.known.indexOf(r.id) >= 0) h += `<li><span class="eq" style="display:inline-flex">${icon(r.a, 18)}${ITEMS[r.a].name} + ${icon(r.b, 18)}${ITEMS[r.b].name}</span> → <b>${recipeOutName(r)}</b></li>`;
      else if (m.hints.indexOf(r.id) >= 0) h += `<li class="hint">Unknown recipe. Note: "${esc(r.hint)}"</li>`;
      else h += `<li class="unk">??? (find field notes on trips)</li>`;
    });
    h += `</ul><div class="sect">Record</div><div class="stat"><span class="chip">Runs ${m.runs}</span><span class="chip">Rescued ${m.wins}</span><span class="chip">Best ${m.best}</span><span class="chip">Duds noted ${m.duds.length}</span>${m.daily[today()] ? `<span class="chip">Today's daily best ${m.daily[today()]}</span>` : ''}</div>`;
    h += `<div class="sect">Run</div><div class="stat"><span class="chip">${G.s.mode === 'daily' ? 'Daily sol ' + G.s.day : 'Seed ' + esc(G.s.seed)}</span><span class="chip">Score so far ${Rules.score(G.s, false)}</span></div>`;
    h += `<p style="margin-top:12px"><button class="ibtn" data-act="wipe">${G.armed === 'wipe' ? 'Tap again to erase the journal' : 'Erase journal…'}</button></p>`;
    if (DEBUG) h += `<div class="dbg">${esc(JSON.stringify({ rng: G.s.rng, storm: Array.from({ length: 12 }, (_, i) => Rules.stormPower(i + 1)), event: G.s.event, sites: G.s.sites, builds: G.s.builds }, null, 1))}</div>`;
    return h;
  }

  function renderFoot() {
    const s = G.s; const last = s.log.slice(-2);
    $('#log').innerHTML = last.map(l => `<div class="${l.k}">${esc(l.t)}</div>`).join('');
    const left = Rules.hourLimit(s) - s.hour;
    const b = $('#end');
    b.textContent = G.armed === 'end' ? 'Tap again (' + left + 'h left)' : 'End Sol ' + s.sol;
    b.classList.toggle('armed', G.armed === 'end');
  }

  // ---------- overlays ----------
  function overlay(html) { const o = $('#overlay'); o.innerHTML = `<div class="modal">${html}</div>`; o.classList.add('on'); const p = o.querySelector('[data-primary]'); if (p) setTimeout(() => { try { p.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, 30); }
  function closeOverlay() { $('#overlay').classList.remove('on'); $('#overlay').innerHTML = ''; }

  function showTitle(msg) {
    const m = G.meta; const resumable = G.s && !G.s.result;
    overlay(`<h1>TWELVE SOLS</h1><p>Your lander left you on a red-dust world with a small hab. It comes back at dawn after Sol ${CONFIG.SOLS}. Keep your <b style="color:var(--air)">air</b>, <b style="color:var(--warm)">warmth</b> and <b style="color:var(--food)">food</b> above zero until then, while the dust storms grow every night.</p>
      <ul><li>Go out for supplies. Combine them at the Bench.</li><li>Every recipe you discover stays in your journal, even when a run ends.</li><li>Build shutters before the storms grow, or build a beacon to be picked up early.</li></ul>
      ${msg ? `<p style="color:#ffb79c">${esc(msg)}</p>` : ''}
      ${resumable ? `<button class="go big" data-act="resume" data-primary>Continue · Sol ${G.s.sol}</button>` : ''}
      ${levelPicker()}
      <button class="go ${resumable ? 'alt' : ''} big" data-act="new" ${resumable ? '' : 'data-primary'}>New run · ${esc(CONFIG.LEVELS[pickedLevel()].name)}</button>
      <button class="go alt big" data-act="daily">Daily sol · ${today()}${m.daily[today()] ? ' (best ' + m.daily[today()] + ')' : ''}</button>
      <div id="pywSlot"></div>
      <p style="font-size:calc(12.5px * var(--gk-text-scale,1))">Journal ${m.known.length}/${RECIPES.length} · Runs ${m.runs} · Rescued ${m.wins} · Best ${m.best}</p>
      <p style="font-size:calc(max(12px, 11.5px) * var(--gk-text-scale,1))">Keys: 1–4 tabs · N end sol · M sound · Enter continues. Everything works by touch too.</p>`);
    const ps = $('#pywSlot'); if (ps) ps.replaceWith(GK.ui.prefsButton({ className: 'go alt big', panel: { text: true, tips: false } }));
  }

  function pickedLevel() { const u = G.meta.unlocked || 0; if (G.prefs.level == null || G.prefs.level > u) return u; return Math.max(0, G.prefs.level); }
  function levelPicker() {
    const u = G.meta.unlocked || 0; if (!u) return '';
    const L = pickedLevel(), lv = CONFIG.LEVELS[L];
    return `<div class="trybox" style="justify-content:space-between"><button class="ibtn" data-act="lvl" data-d="-1" ${L ? '' : 'disabled'} aria-label="Easier">‹</button>
      <div style="text-align:center"><b>${esc(lv.name)}</b><div style="font-size:calc(12px * var(--gk-text-scale,1));color:var(--muted)">storm +${lv.storm} · nights −${lv.warm} warmth · score ×${lv.mult}</div></div>
      <button class="ibtn" data-act="lvl" data-d="1" ${L < u ? '' : 'disabled'} aria-label="Harsher">›</button></div>`;
  }
  function showNight() {
    const n = G.s.night; const ev = EVENTS[n.event];
    const dawn = Object.keys(n.dawn || {}).map(k => '+' + n.dawn[k] + ' ' + ITEMS[k].name).join(', ');
    const next = n.nextEvent ? EVENTS[n.nextEvent] : null;
    overlay(`<h2>Night of Sol ${n.sol}</h2><div class="rep">
      <span>Storm${n.event === 'surge' ? ' (surge)' : n.event === 'calm' ? ' (still air)' : ''}</span><b>${n.power}</b>
      <span>Shutters blocked</span><b class="pos">${n.blocked}</b>
      <span>Hull</span><b class="${n.dmg ? 'neg' : ''}">${n.hullBefore} → ${n.hullAfter}${n.breach ? ' BREACH' : ''}</b>
      <span>Air</span><b class="neg">−${n.drain.air}</b><span>Warmth</span><b class="neg">−${n.drain.warm}${n.event === 'cold' ? ' (deep cold)' : ''}</b><span>Food</span><b class="neg">−${n.drain.food}</b>
      ${dawn ? `<span>At dawn</span><b class="pos">${dawn}</b>` : ''}</div>
      ${n.breach ? `<p style="color:#ffb79c">The hull is breached: you lose extra air every hour and extra air and warmth every night until you patch it.</p>` : ''}
      ${G.s.result ? '' : next ? `<p><b style="color:var(--ink)">Sol ${G.s.sol}: ${esc(next.name)}.</b> ${esc(next.text)}</p>` : ''}
      <button class="go big" data-act="ack" data-primary>${G.s.result ? 'Continue' : 'Dawn →'}</button>`);
    const m = document.querySelector('.modal'); if (m && n.dmg) m.classList.add('shake');
  }

  function lesson() {
    const s = G.s; const r = s.result; const m = G.meta;
    const tip = id => { const R = RECIPE_BY_ID[id]; return m.known.indexOf(id) >= 0 ? `${ITEMS[R.a].name} + ${ITEMS[R.b].name} makes ${recipeOutName(R)}.` : `A note you may find: "${R.hint}"`; };
    if (r.win) return s.beaconSol ? 'The beacon cut the run short. Try a full twelve sols for the bigger survival score, or light it even sooner.' : 'Next time, try the beacon: rescue comes 3 sols after you light it.';
    const out = [];
    if (r.cause === 'air') out.push(tip('oxy'), s.builds.liner ? '' : tip('liner'));
    if (r.cause === 'warm') out.push(tip('heat'), (s.builds.insul || 0) < 2 ? tip('insul') : tip('broth'));
    if (r.cause === 'food') out.push(tip('mash'), s.builds.planter ? '' : tip('planter'));
    if (s.stats.breachNights) out.push('The hull broke ' + s.stats.breachNights + ' night(s). ' + tip('shutter'));
    return out.filter(Boolean).slice(0, 2).join(' ');
  }

  function showEnd() {
    const s = G.s, r = s.result, m = G.meta;
    const causeTxt = { air: 'Your air ran out.', warm: 'The cold got in.', food: 'You ran out of food.' };
    const found = s.stats.found.map(id => recipeOutName(RECIPE_BY_ID[id]));
    overlay(`<h2 style="color:${r.win ? 'var(--good)' : '#ffb79c'}">${r.win ? 'Rescued at dawn!' : 'Run over on Sol ' + r.sol}</h2>
      <p>${r.win ? 'The lander touched down after Sol ' + s.rescueSol + (s.beaconSol ? ', called early by your beacon.' : '.') : causeTxt[r.cause] || ''}</p>
      <div class="rep"><span>Score</span><b>${r.score}${r.newBest ? ' · new best!' : ''}</b><span>Best</span><b>${m.best}</b>
      <span>Recipes found this run</span><b>${found.length}</b><span>Journal</span><b>${m.known.length}/${RECIPES.length}</b>
      <span>Trips · crafts · storm damage</span><b>${s.stats.trips} · ${s.stats.crafts} · ${s.stats.dmg}</b></div>
      ${r.unlocked ? `<p style="color:var(--gold)"><b>New season unlocked: ${esc(CONFIG.LEVELS[r.unlocked].name)}.</b> Harsher storms, bigger scores.</p>` : ''}
      ${found.length ? `<p>New: ${esc(found.join(', '))}. They're yours next run.</p>` : ''}
      <p style="color:var(--ink)">${esc(lesson())}</p>
      <button class="go big" data-act="new" data-primary>New run · ${esc(CONFIG.LEVELS[pickedLevel()].name)}</button>
      <button class="go alt big" data-act="daily">Daily sol · ${today()}</button>
      <button class="ibtn big" data-act="title">Title · change season</button>`);
  }

  // ---------- run lifecycle ----------
  function today() { const d = new Date(); return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0'); }
  function startRun(daily) {
    const seed = daily ? 'daily-' + today() : 'r' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
    G.s = Rules.newRun(seed, daily ? 'daily' : 'normal', G.meta, daily ? today() : '', pickedLevel());
    G.tab = 'go'; G.sel = []; G.armed = 0; G.lastDiscover = null;
    Storage.save(); closeOverlay(); render();
  }

  // ---------- Input ----------
  function onClick(e) {
    const t = e.target.closest('[data-act],[data-tab]'); if (!t || t.disabled) return;
    Audio.unlock();
    if (t.dataset.tab) { G.tab = t.dataset.tab; G.armed = 0; Audio.sfx('tap'); render(); $('#panel').scrollTop = 0; return; }
    const act = t.dataset.act;
    if (act !== 'end' && act !== 'wipe') G.armed = 0;
    switch (act) {
      case 'scav': doAct({ t: 'scav', i: +t.dataset.i }); break;
      case 'make': { const r = RECIPE_BY_ID[t.dataset.r]; doAct({ t: 'craft', a: r.a, b: r.b }); break; }
      case 'pick': {
        const id = t.dataset.id; Audio.sfx('tap');
        if (G.sel.indexOf(id) >= 0) G.sel = G.sel.filter(x => x !== id);
        else if (G.sel.length >= 2) G.sel = [id];
        else G.sel.push(id);
        render(); break;
      }
      case 'try': if (G.sel.length === 2) doAct({ t: 'craft', a: G.sel[0], b: G.sel[1] }); break;
      case 'use': doAct({ t: 'use', id: t.dataset.id }); break;
      case 'end': endSol(); break;
      case 'ack': doAct({ t: 'ack' }); if (!G.s.result) closeOverlay(); render(); break;
      case 'sound': G.prefs.sound = !G.prefs.sound; Storage.savePrefs(); if (G.prefs.sound) Audio.shown(); else Audio.hidden(); render(); break;
      case 'menu': showTitle(); break;
      case 'resume': closeOverlay(); render(); break;
      case 'lvl': G.prefs.level = Math.max(0, Math.min(G.meta.unlocked || 0, pickedLevel() + (+t.dataset.d))); Storage.savePrefs(); showTitle(); break;
      case 'new': startRun(false); break;
      case 'daily': startRun(true); break;
      case 'title': showTitle(); break;
      case 'wipe':
        if (G.armed === 'wipe') { G.meta = newMeta(); G.armed = 0; Storage.save(); toast('Journal erased.'); }
        else { G.armed = 'wipe'; }
        render(); break;
    }
  }
  function endSol() {
    const s = G.s; const left = Rules.hourLimit(s) - s.hour;
    if (left > 0 && G.armed !== 'end') { G.armed = 'end'; renderFoot(); clearTimeout(G.armT); G.armT = setTimeout(() => { if (G.armed === 'end') { G.armed = 0; renderFoot(); } }, 2500); return; }
    G.armed = 0; G.sel = []; doAct({ t: 'end' });
  }
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    Audio.unlock();
    if (document.querySelector('.gk-prefs')) return;
    const ov = $('#overlay').classList.contains('on');
    if (ov) {
      if (e.key === 'Enter' || e.key === ' ') { const p = $('#overlay [data-primary]'); if (p && document.activeElement !== p) { e.preventDefault(); p.click(); } }
      return;
    }
    const k = e.key.toLowerCase();
    if ('1234'.includes(k) && k.length === 1) { G.tab = ['go', 'bench', 'pack', 'journal'][+k - 1]; render(); }
    else if (k === 'n') endSol();
    else if (k === 'm') { G.prefs.sound = !G.prefs.sound; Storage.savePrefs(); if (G.prefs.sound) Audio.shown(); else Audio.hidden(); render(); }
    else if (k === 'escape') { G.sel = []; render(); }
  }

  // ---------- boot ----------
  function boot() {
    G.prefs = Storage.loadPrefs(); G.meta = Storage.loadMeta();
    const lr = Storage.loadRun(); G.s = lr.run;
    Scene.init();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', () => Audio.unlock(), { once: true, capture: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { Audio.hidden(); Scene.stop(); } else { Audio.shown(); Scene.start(); } });
    window.addEventListener('pagehide', () => { Audio.hidden(); Storage.save(); });
    window.addEventListener('resize', () => Scene.resize());
    if (G.s) render();
    showTitle(lr.damaged ? 'Your saved run was damaged, so it was set aside. Your journal is safe.' : '');
    Scene.start();
    GK.studio();
    GK.coach.create('twelve-sols-first', [{ done: () => !!G.s && (G.s.sol > 1 || G.s.hour > 0), target: () => document.querySelector('#panel [data-act=scav]:not([disabled])') }], { when: () => !!G.s && !G.s.result && G.tab === 'go' && !$('#overlay').classList.contains('on') });
    GK.wired('motion', 'storm shake, dust bursts and sparks; Calm/Still turn off the page animations (was the phone reduced-motion rule); Still also stops the drifting dust and beacon blink');
    GK.wired('flash', 'discovery flash (old peak .5)');
    GK.wired('text', 'page CSS and inline sizes scaled; top bar, forecast chips, needs, tabs, item badges and footer capped at 125%');
    window.__TS = { G, render, doAct, startRun, Audio, Scene, Storage }; // test hook
  }
  boot();
})();
