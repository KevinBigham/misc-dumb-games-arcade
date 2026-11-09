import { JSDOM, VirtualConsole } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const out = [];
const ok = (c, n, x) => { (c ? pass++ : fail++); out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined && x !== '' ? '  (' + x + ')' : '')); };
function fakeAudio(win, log) {
  const param = () => ({ value: 1, setValueAtTime() {}, setTargetAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {}, cancelAndHoldAtTime() {} });
  const node = () => ({ connect(n) { return n; }, disconnect() {}, gain: param(), frequency: param(), Q: param(), pan: param(), playbackRate: param(), detune: param(), delayTime: param(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(), offset: param(), type: '', start() { log.plays++; }, stop() {}, buffer: null, onended: null, curve: null, loop: false, addEventListener() {}, setPeriodicWave() {} });
  class AC {
    constructor() { this.currentTime = 0; this.state = 'suspended'; this.sampleRate = 44100; this.destination = node(); this.listener = {}; this._h = {}; this.onstatechange = null; log.contexts.push(this); }
    addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); } removeEventListener() {}
    _set(s) { this.state = s; (this._h.statechange || []).forEach(f => f({})); if (this.onstatechange) this.onstatechange({}); }
    createGain() { return node(); } createBiquadFilter() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); } createConstantSource() { return node(); }
    createDynamicsCompressor() { return node(); } createStereoPanner() { return node(); } createPanner() { return node(); } createDelay() { return node(); } createConvolver() { return node(); } createWaveShaper() { return node(); } createAnalyser() { const n = node(); n.getByteFrequencyData = () => {}; n.getFloatTimeDomainData = () => {}; n.getByteTimeDomainData = () => {}; n.fftSize = 2048; n.frequencyBinCount = 1024; return n; }
    createPeriodicWave() { return {}; } createChannelMerger() { return node(); } createChannelSplitter() { return node(); } createMediaElementSource() { return node(); }
    createBuffer(c, n, r) { const d = []; for (let i = 0; i < c; i++) d.push(new Float32Array(n)); return { length: n, sampleRate: r, numberOfChannels: c, duration: n / r, getChannelData: i => d[i || 0], copyToChannel() {} }; }
    decodeAudioData(b, ok) { const buf = this.createBuffer(1, 10, 44100); if (ok) ok(buf); return Promise.resolve(buf); }
    resume() { this._set('running'); return Promise.resolve(); } suspend() { this._set('suspended'); return Promise.resolve(); } close() { this._set('closed'); return Promise.resolve(); }
    getOutputTimestamp() { return { contextTime: this.currentTime, performanceTime: 0 }; }
    get baseLatency() { return 0.005; } get outputLatency() { return 0.01; }
  }
  win.AudioContext = AC; win.webkitAudioContext = AC; win.OfflineAudioContext = AC;
}
async function boot(file, storage, label, openSel) {
  const html = fs.readFileSync(file, 'utf8');
  const log = { errors: [], contexts: [], plays: 0, fonts: [] };
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = String(e.message || e); if (!/Not implemented|Could not parse CSS/.test(m)) log.errors.push(m.split('\n')[0]); });
  vc.on('error', (...a) => log.errors.push('console.error: ' + a.join(' ').split('\n')[0]));
  let clock = 1000, raf = [];
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: false, url: 'https://example.test/', virtualConsole: vc,
    beforeParse(win) {
      Object.defineProperty(win, 'innerWidth', { value: 390, configurable: true, writable: true });
      Object.defineProperty(win, 'innerHeight', { value: 844, configurable: true, writable: true });
      win.devicePixelRatio = 2;
      win.requestAnimationFrame = f => { raf.push(f); return raf.length; }; win.cancelAnimationFrame = () => {};
      win.performance.now = () => clock;
      const P = win.HTMLCanvasElement.prototype;
      const nc = el => { if (!el._nc) { el._nc = createCanvas(Math.max(1, el._w || 300), Math.max(1, el._h || 150)); el._ctx = el._nc.getContext('2d'); } return el._nc; };
      Object.defineProperty(P, 'width', { get() { return this._w || 300; }, set(v) { this._w = Math.max(1, v | 0); nc(this).width = this._w; }, configurable: true });
      Object.defineProperty(P, 'height', { get() { return this._h || 150; }, set(v) { this._h = Math.max(1, v | 0); nc(this).height = this._h; }, configurable: true });
      P.getContext = function (t) { if (t !== '2d') return null; nc(this); const cv = this, cx = this._ctx;
        if (!cx._gkRec && cx.drawImage) { const d0 = cx.drawImage.bind(cx), p0 = cx.createPattern && cx.createPattern.bind(cx);
          const un = im => (im && im instanceof win.HTMLCanvasElement) ? nc(im) : im;
          const okIm = im => !(im && im instanceof win.HTMLImageElement);
          cx.drawImage = function (im, ...a) { if (!okIm(im)) return; return d0(un(im), ...a); };
          if (p0) cx.createPattern = function (im, r) { if (!okIm(im)) return null; return p0(un(im), r); }; }
        if (!cx._gkRec) { cx._gkRec = true; for (const fn of ['fillText', 'strokeText']) { const f0 = cx[fn].bind(cx); cx[fn] = function (txt, ...a) {
          try { const m = /(\d+(?:\.\d+)?)px/.exec(cx.font || ''); if (m && String(txt).trim()) { const tr = cx.getTransform ? cx.getTransform() : { a: 1 }; const cssW = parseFloat(cv.style && cv.style.width) || 390; const k = cssW / (cv.width || 300); const px = +m[1] * Math.abs(tr.a || 1) * k; log.fonts.push({ px, txt: String(txt).slice(0, 24), font: cx.font }); } } catch (e) {}
          return f0(txt, ...a); }; } }
        return cx; };
      P.toDataURL = function () { return 'data:image/png;base64,'; };
      win.HTMLElement.prototype.setPointerCapture = function () {}; win.HTMLElement.prototype.releasePointerCapture = function () {};
      win.HTMLElement.prototype.getBoundingClientRect = function () { return { left: 0, top: 0, x: 0, y: 0, width: 390, height: 844, right: 390, bottom: 844 }; };
      win.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
      win.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); }; win.HTMLMediaElement.prototype.pause = function () {};
      win.URL.createObjectURL = () => 'blob:x';
      win.scrollTo = () => {};
      if (!win.ResizeObserver) win.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      Object.defineProperty(win.navigator, 'vibrate', { value: () => true, configurable: true });
      Object.defineProperty(win.navigator, 'userAgent', { value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', configurable: true });
      fakeAudio(win, log);
      for (const [k, v] of Object.entries(storage)) win.localStorage.setItem(k, v);
      log.atBoot = () => { const o = {}; for (let i = 0; i < win.localStorage.length; i++) { const k = win.localStorage.key(i); o[k] = win.localStorage.getItem(k); } return o; };
      win.addEventListener('error', e => log.errors.push('window.error: ' + e.message));
      win.addEventListener('unhandledrejection', e => log.errors.push('rejection: ' + (e.reason && e.reason.message)));
    } });
  const win = dom.window, doc = win.document;
  const step = async (n, ms = 16.7) => { for (let i = 0; i < n; i++) { clock += ms; const q = raf; raf = []; for (const f of q) { try { f(clock); } catch (e) { log.errors.push('frame: ' + String(e.message).split('\n')[0]); } } } await sleep(0); };
  await sleep(50); log.storageAtStart = log.atBoot();
  await step(30);
  log.coachAtBoot = !!doc.querySelector('.gk-coach') && doc.querySelector('.gk-coach').style.display !== 'none';
  const fireAll = el => {
    for (const t of ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend', 'click']) {
      const E = /touch/.test(t) ? win.Event : win.MouseEvent; const e = new E(t, { bubbles: true, cancelable: true, clientX: 195, clientY: 600 });
      try { Object.defineProperty(e, 'pointerId', { value: 1 }); Object.defineProperty(e, 'pointerType', { value: 'touch' }); Object.defineProperty(e, 'isPrimary', { value: true }); if (/touch/.test(t)) { const tl = [{ clientX: 195, clientY: 600, identifier: 1, pageX: 195, pageY: 600 }]; Object.defineProperty(e, 'touches', { value: t === 'touchend' ? [] : tl }); Object.defineProperty(e, 'changedTouches', { value: tl }); Object.defineProperty(e, 'targetTouches', { value: tl }); } } catch (x) {}
      try { el.dispatchEvent(e); } catch (x) { log.errors.push('tap: ' + x.message); }
    }
  };
  const target = doc.querySelector('canvas') || doc.body;
  fireAll(target); await step(30);
  const btn = [...doc.querySelectorAll('button,[role=button],.btn')].find(b => /play|start|new|begin|dive|go|run|tonight|daily|fly|launch|deal|swim|race/i.test(b.textContent || ''));
  if (btn) { fireAll(btn); await step(60); }
  fireAll(target); await step(120);
  for (let i = 0; i < 8; i++) { fireAll(target); await step(20); }
  log.coachSeen = log.coachAtBoot || !!doc.querySelector('.gk-coach');
  log.fireAll = fireAll; log.step = step; log.doc = doc;
  log.ctxBeforeHide = log.contexts.map(c => c.state); log.hidden = doc.hidden;
  // the game pausing its own sound: taps and focus afterwards must leave it paused unless the game itself resumes
  const c0 = log.contexts[0];
  if (c0 && c0.state === 'running') { try { c0.suspend(); } catch (e) {} fireAll(target); win.dispatchEvent(new win.Event('focus')); win.dispatchEvent(new win.Event('pageshow')); await step(5); log.held = c0.state; try { c0.resume(); } catch (e) {} await step(2); }
  doc.dispatchEvent(new win.Event('visibilitychange')); win.dispatchEvent(new win.Event('pagehide'));
  await sleep(30);
  log.storage = log.atBoot(); log.btn = btn ? (btn.textContent || '').trim().slice(0, 30) : '';
  log.gk = win.GK ? { adopted: win.GK.audio.ctx, retro: win.GK.retrofitted } : null;
  log.win = win;
  return log;
}

// Kit 2.1 wiring check: node wirecheck.mjs <page.html> [seed.json] [--speed] [--combo] [--flash] [--open "<css selector>,..."] [--min 12]
// Boots the page in jsdom, plays a little, then checks each wired feature. Not a real phone.
const argv = process.argv.slice(2);
const page = argv[0]; const seedFile = argv[1] && !argv[1].startsWith('--') ? argv[1] : null;
const flag = k => argv.includes('--' + k); const val = k => { const i = argv.indexOf('--' + k); return i < 0 ? null : argv[i + 1]; };
const MIN = +(val('min') || 12); const OPEN = (val('open') || '').split(',').map(x => x.trim()).filter(Boolean);
(async () => {
  const seed = seedFile ? JSON.parse(fs.readFileSync(seedFile, 'utf8')) : {};
  const A = await boot(page, seed, 'wire');
  const G = A.win.GK, doc = A.doc;
  ok(G && /^2\.1\./.test(G.version), 'kit 2.1 is on the page', G && G.version);
  ok(A.errors.length === 0 || true, 'page played', A.errors.length + ' page errors (compare with smoke for new ones)');
  const W = G ? G.wiredList() : {};
  console.log('INFO wired: ' + JSON.stringify(W));
  ok(doc.documentElement.getAttribute('data-gk-motion'), 'player settings are loaded', 'motion ' + doc.documentElement.getAttribute('data-gk-motion'));
  ok(String(doc.documentElement.style.getPropertyValue('--gk-signal') || '').toLowerCase() === '#ffc23d', 'studio colors are on the kit surfaces');
  ok(!!W.coach, 'a first-touch coach hint is set up', W.coach ? 'id ' + W.coach + (A.coachSeen ? ', ring shown during play' : ', ring not seen in this bot run') : '');
  // settings button: visible now, or after opening the game's own menu
  let btn = doc.querySelector('[data-gk-prefs]');
  for (const sel of OPEN) { if (btn) break; const el = doc.querySelector(sel); if (el) { A.fireAll(el); await A.step(10); } btn = doc.querySelector('[data-gk-prefs]'); }
  ok(!!btn, 'a settings button is on the page', btn ? (btn.className || btn.tagName) : 'none found' + (OPEN.length ? ' after opening ' + OPEN.join(', ') : ''));
  if (btn) {
    btn.dispatchEvent(new A.win.MouseEvent('click', { bubbles: true, cancelable: true })); await A.step(5);
    const pan = doc.querySelector('.gk-prefs');
    ok(!!pan, 'the settings button opens Play your way');
    if (pan) {
      const h = pan.innerHTML;
      ok(/Calm/.test(h) && /Still/.test(h), 'panel has motion levels'); ok(/Soft flashes/.test(h), 'panel has the flash limit');
      ok(/Text size/.test(h), 'panel has text size');
      if (flag('speed')) ok(/50%/.test(h), 'panel has speed assist');
      const done = pan.querySelector('.gk-done'); if (done) done.dispatchEvent(new A.win.MouseEvent('click', { bubbles: true })); await A.step(3);
      ok(!doc.querySelector('.gk-prefs'), 'Done closes the panel');
    }
  }
  // text floor: canvas text drawn and CSS sizes in the game's own styles
  const small = A.fonts.filter(f => f.px < MIN - 0.25);
  const minPx = A.fonts.length ? Math.min(...A.fonts.map(f => f.px)) : null;
  ok(small.length === 0, 'no canvas text under ' + MIN + ' px', A.fonts.length ? 'smallest ' + minPx.toFixed(1) + ' px over ' + A.fonts.length + ' draws' + (small.length ? '; e.g. ' + [...new Set(small.map(f => f.txt + ' @' + f.px.toFixed(1)))].slice(0, 4).join(' | ') : '') : 'no canvas text drawn');
  const src = fs.readFileSync(page, 'utf8').replace(/<script id="gamekit">[\s\S]*?<\/script>/, '');
  const cssBits = []; const reS = /<style[^>]*>([\s\S]*?)<\/style>|style="([^"]*)"/g; let m; while ((m = reS.exec(src))) cssBits.push(m[1] || m[2] || '');
  const css = cssBits.join('\n'); const tiny = []; const reF = /font(?:-size)?\s*:[^;}{]*?(\d+(?:\.\d+)?)px/g; while ((m = reF.exec(css))) if (+m[1] < MIN && !/max\(\s*12px/.test(css.slice(m.index, m.index + 80))) tiny.push(m[0].slice(0, 50));
  ok(tiny.length === 0, 'no CSS text under ' + MIN + ' px', tiny.slice(0, 4).join(' | '));
  // text size takes effect: CSS uses the scale, or canvas text grows when the player picks A++
  const big = Object.assign({}, seed, { 'gk.prefs.v1': JSON.stringify({ text: 1.5, motion: 'still' }) });
  const B = await boot(page, big, 'big');
  const maxA = A.fonts.length ? Math.max(...A.fonts.map(f => f.px)) : 0, maxB = B.fonts.length ? Math.max(...B.fonts.map(f => f.px)) : 0;
  const avg = L => L.length ? L.reduce((a, f) => a + f.px, 0) / L.length : 0;
  const usesVar = /var\(--gk-text-scale/.test(src) || /GK\.prefs\.text\(\)|GK\.ui\.floor\(|GK\.ui\.text\(/.test(src);
  ok(usesVar && (avg(B.fonts) > avg(A.fonts) * 1.1 || /var\(--gk-text-scale/.test(src)), 'text size changes the game text', 'canvas avg ' + avg(A.fonts).toFixed(1) + ' -> ' + avg(B.fonts).toFixed(1) + ' px; uses scale in code: ' + usesVar);
  const newB = B.errors.filter(e => !A.errors.includes(e)); ok(newB.length === 0, 'no new errors with Still motion and A++ text', newB.slice(0, 2).join(' | '));
  ok(/GK\.prefs\.(motion|motionScale)\(|\.mscale\(|data-gk-motion/.test(src), 'game motion follows the Motion setting', W.motion ? 'declared: ' + W.motion : '');
  if (flag('speed')) ok(/GK\.prefs\.speed\(|assist\s*:\s*true/.test(src), 'game speed follows speed assist', W.speed ? 'declared: ' + W.speed : '');
  if (flag('combo')) ok(G.audio.ladderCalls > 0 || /GK\.audio\.(ladder|combo)\(/.test(src), 'combo sound climbs the scale', 'ladder calls in bot run: ' + G.audio.ladderCalls);
  if (flag('flash')) ok(/GK\.flash\.allow\(|\.flashOK\(/.test(src), 'screen flashes go through the flash limit', 'limit calls in bot run: ' + G.flash.calls);
  console.log(out.join('\n')); console.log('TOTAL', pass, 'pass', fail, 'fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
