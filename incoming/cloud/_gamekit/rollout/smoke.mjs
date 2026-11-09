// Before/after check for a retrofitted game, in jsdom (not a real phone):
//   sh /home/user/gk-deps/run.sh smoke.mjs <pre.html> <post.html> key1,key2 [seedJSON]
// 1. plays the pre-kit page a little (taps on the canvas and the first start button) to get a real save
// 2. boots the kit page on that save: no new errors, same save values, a backup made, one audio context
//    that the kit adopted and that runs after a tap
// 3. breaks the save and boots again: the save comes back from the backup
import { JSDOM, VirtualConsole } from 'jsdom';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
const [preFile, postFile, keyArg, seedArg] = process.argv.slice(2);
const KEYS = String(keyArg || '').split(',').filter(Boolean);
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
async function boot(file, storage, label) {
  const html = fs.readFileSync(file, 'utf8');
  const log = { errors: [], contexts: [], plays: 0 };
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
      P.getContext = function (t) { if (t !== '2d') return null; nc(this); return this._ctx; };
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
  const fireAll = el => {
    for (const t of ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend', 'click']) {
      const E = /touch/.test(t) ? win.Event : win.MouseEvent; const e = new E(t, { bubbles: true, cancelable: true, clientX: 195, clientY: 600 });
      try { Object.defineProperty(e, 'pointerId', { value: 1 }); Object.defineProperty(e, 'pointerType', { value: 'touch' }); Object.defineProperty(e, 'isPrimary', { value: true }); if (/touch/.test(t)) { const tl = [{ clientX: 195, clientY: 600, identifier: 1, pageX: 195, pageY: 600 }]; Object.defineProperty(e, 'touches', { value: t === 'touchend' ? [] : tl }); Object.defineProperty(e, 'changedTouches', { value: tl }); Object.defineProperty(e, 'targetTouches', { value: tl }); } } catch (x) {}
      try { el.dispatchEvent(e); } catch (x) { log.errors.push('tap: ' + x.message); }
    }
  };
  const target = doc.querySelector('canvas') || doc.body;
  fireAll(target); await step(30);
  const btn = [...doc.querySelectorAll('button,[role=button],.btn')].find(b => /play|start|new|begin|dive|go|run|tonight|daily/i.test(b.textContent || ''));
  if (btn) { fireAll(btn); await step(60); }
  fireAll(target); await step(120);
  for (let i = 0; i < 8; i++) { fireAll(target); await step(20); }
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
const norm = e => e.replace(/\d+(\.\d+)?/g, '#').replace(/script\d+/g, 'script');
(async () => {
  let seedStore = seedArg ? JSON.parse(fs.readFileSync(seedArg, 'utf8')) : {};
  const A = await boot(preFile, seedStore, 'pre');
  const S0 = {}; for (const k of KEYS) if (A.storage[k] != null) S0[k] = A.storage[k];
  for (const k in seedStore) if (KEYS.includes(k) && S0[k] == null) S0[k] = seedStore[k];
  ok(true, 'pre-kit page played', 'tapped ' + (A.btn ? '"' + A.btn + '" and ' : '') + 'the canvas; ' + A.errors.length + ' page errors; save keys written: ' + (Object.keys(S0).join(', ') || 'none'));
  const B = await boot(postFile, S0, 'post');
  const preErr = new Set(A.errors.map(norm)); const newErr = B.errors.filter(e => !preErr.has(norm(e)) && !/^console\.error: \[gk/.test(e));
  ok(newErr.length === 0, 'kit adds no page errors', newErr.slice(0, 3).join(' | '));
  // a game may rewrite its own save at boot (a timestamp, a badge); then the kit page must match the pre-kit page booted on the same save
  const tnorm = v => v == null ? v : String(v).replace(/\d{12,}(\.\d+)?/g, '#');
  let A2 = null; const sameAsPre = async (k, v) => { if (!A2) A2 = await boot(preFile, S0, 'pre-on-save'); return tnorm(v) === tnorm(A2.storageAtStart[k]); };
  for (const k of Object.keys(S0)) {
    if (B.storageAtStart[k] === S0[k]) ok(true, 'old save "' + k + '" loads unchanged');
    else ok(await sameAsPre(k, B.storageAtStart[k]), 'old save "' + k + '" loads the same as without the kit', 'the game rewrites this save at boot');
    ok(B.storageAtStart[k + '.bak1'] === S0[k], 'a backup of "' + k + '" is made on load');
  }
  ok(B.contexts.length <= Math.max(1, A.contexts.length) && B.contexts.length === A.contexts.length, 'same number of audio contexts as before', A.contexts.length + ' before, ' + B.contexts.length + ' after');
  if (B.contexts.length) {
    ok(B.gk && B.gk.adopted === B.contexts[0], 'the kit adopted the game\'s audio context');
    ok(B.ctxBeforeHide[0] === 'running', 'sound is running after a tap', 'kit: ' + B.ctxBeforeHide[0] + ', pre-kit: ' + (A.ctxBeforeHide[0] || 'none') + (B.hidden ? ', page reads as hidden' : ''));
  }
  if (B.held !== undefined) ok(B.held === 'suspended' || B.held === A.held, 'a pause the game makes stays paused after a tap', 'kit: ' + B.held + ', pre-kit: ' + (A.held || 'not running'));
  ok(B.win.GK && /^2\./.test(B.win.GK.version) && B.gk.retro && B.gk.retro.game, 'kit 2 is on the page', B.win.GK && B.win.GK.version);
  ok(!(B.win.devicePixelRatio > 2), 'drawing sharpness is capped at 2', 'page sees ' + B.win.devicePixelRatio);
  if (B.contexts.length && B.win.GK.audio.route !== false) ok(!!(B.win.GK.audio.bus && B.win.GK.audio.bus()), 'game sound goes through the kit limiter');
  const any = Object.keys(S0)[0];
  if (any) {
    const broken = Object.assign({}, S0, { [any]: '{oops', [any + '.bak1']: S0[any] });
    const C = await boot(postFile, broken, 'broken');
    ok(C.storageAtStart[any] === S0[any] || await sameAsPre(any, C.storageAtStart[any]), 'a broken "' + any + '" save comes back from the backup', C.storageAtStart[any] === S0[any] ? '' : 'matches the pre-kit page booted on the good save');
    const newC = C.errors.filter(e => !preErr.has(norm(e)));
    ok(newC.length === 0, 'no errors after the restore', newC.slice(0, 2).join(' | '));
  } else ok(KEYS.length === 0, 'restore from backup', 'the bot wrote no save, so restore was not checked here');
  console.log(out.join('\n')); console.log('TOTAL', pass, 'pass', fail, 'fail');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH', e.stack); process.exit(1); });
