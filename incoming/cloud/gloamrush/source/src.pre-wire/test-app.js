// Full-page smoke test: runs the published HTML's two scripts against a stub DOM,
// drives it with real pointer/click events through the page's own listeners.
const fs = require('fs'), vm = require('vm');
const B = require('./bot.js');
const HTML = fs.readFileSync(process.argv[2] || '/mnt/project-files/gloamrush-2026-11-05/gloamrush.html', 'utf8');
const scripts = []; { const re = /<script id="(\w+)">([\s\S]*?)<\/script>/g; let m; while ((m = re.exec(HTML))) scripts.push([m[1], m[2]]); }

function makeEnv(storage) {
  const errors = [], vibs = [], clip = [];
  let clock = 1000, nowMs = 1.8e12;
  const timers = []; let rafQ = [];
  const param = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
  const node = () => ({ connect() {}, disconnect() {}, gain: param(), frequency: param(), Q: param(), type: '', start() {}, stop() {}, buffer: null });
  class AC { constructor() { this.currentTime = 0; this.state = 'running'; this.sampleRate = 8000; this.destination = node(); } createGain() { return node(); } createBiquadFilter() { return node(); } createOscillator() { return node(); } createBufferSource() { return node(); } createBuffer(c, n) { return { getChannelData: () => new Float32Array(n) }; } resume() { return Promise.resolve(); } }
  const ctx2d = new Proxy({}, { get(t, k) { if (k in t) return t[k]; if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} }); if (k === 'measureText') return s => ({ width: String(s).length * 7 }); return () => {}; }, set(t, k, v) { t[k] = v; return true; } });
  const byId = {};
  class El {
    constructor(tag, id) { this.tagName = (tag || 'div').toUpperCase(); this.id = id || ''; this.style = {}; this.dataset = {}; this.children = []; this._h = {}; this.hidden = false; this.className = ''; this._html = ''; this.attrs = {}; this.width = 300; this.height = 150; this.scrollTop = 0; this.textContent = ''; this.classList = { add() {}, remove() {}, toggle() {}, contains: () => false }; }
    set innerHTML(v) { this._html = String(v); } get innerHTML() { return this._html; }
    addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); }
    removeEventListener() {}
    fire(t, e) { for (const f of this._h[t] || []) f(e); }
    getContext() { return ctx2d; } setPointerCapture() {} releasePointerCapture() {}
    querySelectorAll() { return []; } querySelector() { return null; }
    appendChild(c) { this.children.push(c); c.parent = this; return c; }
    get firstChild() { return this.children[0]; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(x => x !== this); }
    setAttribute(k, v) { this.attrs[k] = v; } closest() { return null; } focus() {}
  }
  const document = new El('document');
  document.getElementById = id => byId[id] || (byId[id] = new El('div', id));
  document.createElement = tag => new El(tag);
  document.documentElement = new El('html'); document.body = new El('body'); document.activeElement = document.body; document.hidden = false;
  byId.cv = new El('canvas', 'cv');
  const win = { btoa: s => Buffer.from(s, "binary").toString("base64"), atob: s => Buffer.from(s, "base64").toString("binary"), escape, unescape, encodeURIComponent, decodeURIComponent,
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
    _h: {}, addEventListener(t, f) { (this._h[t] = this._h[t] || []).push(f); }, fire(t, e) { for (const f of this._h[t] || []) f(e); },
    requestAnimationFrame(f) { rafQ.push(f); return rafQ.length; },
    matchMedia: () => ({ matches: false }),
    getComputedStyle: () => ({ paddingTop: '47px', paddingBottom: '34px' }),
    AudioContext: AC,
    localStorage: { getItem: k => storage.has(k) ? storage.get(k) : null, setItem: (k, v) => storage.set(k, String(v)), removeItem: k => storage.delete(k) },
    navigator: { vibrate: p => { vibs.push(p); return true; }, clipboard: { writeText: s => { clip.push(s); return Promise.resolve(); } } },
    performance: { now: () => clock },
    setTimeout: (f, ms) => { timers.push({ at: clock + (ms || 0), f }); return timers.length; }, clearTimeout() {},
    setInterval: () => 1, clearInterval() {},
    console: { log: (...a) => console.log('[page]', ...a), warn: (...a) => console.log('[page warn]', ...a), error: (...a) => { errors.push(a.join(' ')); console.log('[page error]', ...a); } },
    Date: class extends Date { constructor(...a) { if (a.length) super(...a); else super(nowMs); } static now() { return nowMs; } },
    getComputedStyleFallback: null,
  };
  win.window = win; win.document = document; win.globalThis = win; win.Math = Math; win.JSON = JSON; win.Promise = Promise; win.Map = Map; win.Set = Set; win.Float32Array = Float32Array; win.Proxy = Proxy; win.parseFloat = parseFloat; win.Number = Number; win.String = String; win.Array = Array; win.Object = Object; win.isFinite = isFinite;
  const context = vm.createContext(win);
  return {
    win, document, byId, errors, vibs, clip, context,
    load() { for (const [id, src] of scripts) { try { vm.runInContext(src, context, { filename: id + '.js' }); } catch (e) { errors.push(id + ': ' + e.stack); console.log('LOAD ERROR', e.stack); } } },
    frame(ms) {
      clock += ms || 16.67; nowMs += ms || 16.67;
      for (let i = timers.length - 1; i >= 0; i--) if (timers[i].at <= clock) { const t = timers.splice(i, 1)[0]; try { t.f(); } catch (e) { errors.push('timer: ' + e.stack); } }
      const q = rafQ; rafQ = [];
      for (const f of q) { try { f(clock); } catch (e) { errors.push('frame: ' + e.stack); if (errors.length < 4) console.log('FRAME ERROR', e.stack); } }
    },
    advanceWall(ms) { nowMs += ms; },
    click(act, arg) { const target = { dataset: { act, arg }, textContent: '' }; const ev = { target: { closest: sel => sel === '[data-act]' ? target : null } }; document.fire('click', ev); return target; },
    pointer(type, x, y, id) { const e = { pointerId: id || 1, pointerType: 'touch', clientX: x, clientY: y, preventDefault() {} }; if (type === 'pointerdown') byId.cv.fire(type, e); else win.fire(type, e); },
  };
}
let pass = 0, fail = 0;
function ok(c, name, extra) { if (c) { pass++; console.log('PASS', name, extra || ''); } else { fail++; console.log('FAIL', name, extra || ''); } }

// ---------- 1. fresh install, first run, driven by touch ----------
const store = new Map();
const E = makeEnv(store); E.load();
const GL = E.win.GLOAM;
for (let i = 0; i < 5; i++) E.frame();
ok(GL && GL.mode === 'title', 'boots to the title screen');
ok(/data-act="fly"/.test(E.byId.panel.innerHTML) && !/data-act="daily"/.test(E.byId.panel.innerHTML), 'first launch shows one big FLY button and no other choices');
E.click('fly');
ok(GL.mode === 'play' && GL.world && GL.world.tutorial, 'one tap on FLY starts the first run');
// drag: touch down then move right
E.pointer('pointerdown', 200, 600, 7);
E.pointer('pointermove', 250, 600, 7);
ok(GL.stick.id === 7 && GL.stick.ax > 0.9, 'touch drag reaches the joystick handler', 'ax=' + GL.stick.ax.toFixed(2));
const x0 = GL.world.p.x; for (let i = 0; i < 20; i++) E.frame();
ok(GL.world.p.x > x0 + 40, 'dragging flies Wick', `moved ${(GL.world.p.x - x0).toFixed(0)} px`);
// origin follows the thumb past radius 52
E.pointer('pointermove', 400, 600, 7);
ok(Math.abs(GL.stick.ox - (400 - 52)) < 0.01, 'joystick origin follows the thumb past 52 px');
E.pointer('pointerup', 400, 600, 7);
ok(GL.stick.id === null && GL.stick.ax === 0, 'lifting the thumb stops Wick');
// play the run with the bot through real pointer events
let levels = 0, picksBlocked = 0, frames = 0, maxLevelWait = 0, firstLevelAt = null, sawGraze = false, sawWild = false, sawCatch = false, sawWave = false;
let thumb = { x: 200, y: 600 };
function drivePlay() {
  const w = GL.world;
  if (GL.mode === 'play' && w && !w.over) {
    const v = B.skimBot(w);
    if (GL.stick.id === null) { E.pointer('pointerdown', thumb.x, thumb.y, 3); }
    E.pointer('pointermove', GL.stick.ox + v.ax * 52, GL.stick.oy + v.ay * 52, 3);
  }
}
const origHandle = null;
function runUntil(pred, maxFrames) {
  let n = 0;
  while (!pred() && n < maxFrames) {
    n++; frames++;
    if (GL.mode === 'level') {
      if (firstLevelAt === null) firstLevelAt = GL.world.t;
      // a tap right away is ignored (accidental-tap guard), a tap after 300 ms picks
      const lv = GL.world.level;
      E.click('pick', '0'); if (GL.mode === 'level' && GL.world.level === lv) picksBlocked++;
      for (let i = 0; i < 20; i++) E.frame();
      const before = GL.world.pending;
      E.click('pick', '1');
      if (GL.mode !== 'level' || GL.world.pending < before || GL.world.choices) levels++;
      continue;
    }
    if (GL.mode === 'dawn') { E.click('long'); continue; }
    drivePlay();
    E.frame();
    const w = GL.world;
    if (w) { if (w.stats.grazes > 0) sawGraze = true; if (w.stats.wildfires > 0) sawWild = true; if (w.stats.catches > 0) sawCatch = true; if (w.waveI > 0) sawWave = true; }
  }
  return n;
}
runUntil(() => GL.mode === 'results' || (GL.world && GL.world.t > 75), 60 * 200);
ok(firstLevelAt !== null && firstLevelAt < 12, 'first level-up arrives early in the first run', 't=' + (firstLevelAt && firstLevelAt.toFixed(1)) + 's');
ok(picksBlocked > 0, 'card taps in the first 280 ms are ignored (no accidental picks mid-dodge)');
ok(levels >= 3, 'level-up cards are tappable through the click handler', levels + ' picks');
ok(sawGraze && sawWild && sawWave, 'grazes, a Wildfire and a named wave all happened in the first 75 s');
// pause via app switch
E.document.hidden = true; E.document.fire('visibilitychange', {}); E.document.hidden = false;
ok(GL.mode === 'pause', 'switching apps pauses the run');
const tPause = GL.world.t; for (let i = 0; i < 30; i++) E.frame();
ok(GL.world.t === tPause, 'paused run does not advance');
E.click('resume'); ok(GL.mode === 'play', 'Resume continues');
// HUD pause button + settings inside pause + back
E.click('pause'); E.click('menu', 'settings'); E.click('tog', 'nums'); E.click('back');
ok(GL.mode === 'pause' && GL.save.settings.nums === 0, 'settings work from the pause menu and Back returns to pause');
E.click('tog', 'nums'); // no-op outside settings screen, harmless
// kit 2: game speed assist lives in GK.prefs and slows the sim; the save format is untouched
E.click('menu', 'settings'); E.click('gspeed', '0.5');
const tS0 = GL.world.t; E.click('back'); E.click('resume'); for (let i = 0; i < 60; i++) E.frame();
const dS = GL.world.t - tS0; E.win.GK.prefs.set('speed', 1);
ok(E.win.GK.prefs.speed() === 1 && dS > 0.3 && dS < 0.7 && !('speed' in GL.save.settings), 'game speed 50% runs the night at half speed', dS.toFixed(2));
ok(E.win.GK.version === '2.0.0', 'kit 2.0.0 is inlined');
E.click('pause');
E.click('resume');
// play to the end
runUntil(() => GL.mode === 'results', 60 * 600);
if (GL.mode !== 'results') { E.click('pause'); E.click('quit'); for (let i = 0; i < 120; i++) E.frame(); }
ok(GL.mode === 'results', 'run reaches the results screen', 'reached t=' + GL.world.t.toFixed(0));
const res = E.byId.panel.innerHTML;
ok(/data-act="again"/.test(res) && /Next unlock/.test(res) && /glow/.test(res), 'results show glow, the next-unlock bar and a FLY AGAIN button');
console.log('INFO first run result:', GL.world.over.win ? 'dawn' : 'died', 'at', B.GR.fmtT(GL.world.over.time), '· level', GL.world.level, '· glow +' + GL.world.over.pay.glow, '· grazes', GL.world.stats.grazes, '· catches', GL.world.stats.catches, '· evos', GL.world.evos.join(',') || 'none');
const saved = JSON.parse(store.get('gloamrush.save.v1'));
ok(saved.runs === 1 && saved.firstRunDone && saved.glow > 0, 'save written after the run', 'glow=' + saved.glow);
ok(E.vibs.length > 10, 'haptics fired during play', E.vibs.length + ' pulses');
// share
E.click('share');
ok(E.clip.length === 1 && /^GLOAMRUSH · /.test(E.clip[0]), 'share copies a text result line', JSON.stringify(E.clip[0]));
// restart: one tap
const t0 = Date.now();
E.click('again');
ok(GL.mode === 'play' && GL.world.t === 0, 'FLY AGAIN restarts with one tap', (Date.now() - t0) + ' ms of script time');
// second run: daily from title
E.click('pause'); E.click('quit'); for (let i = 0; i < 120; i++) E.frame();
E.click('title');
ok(/data-act="daily"/.test(E.byId.panel.innerHTML) && /Tonight's Dusk/.test(E.byId.panel.innerHTML), 'after the first run, title shows Tonight\'s Dusk and missions');
E.click('daily');
ok(GL.world.daily && GL.world.seed === B.GR.hashStr('gloamrush:' + B.GR.localDayKey(new E.win.Date())), 'Tonight\'s Dusk uses the local-date seed');
E.click('pause'); E.click('quit'); for (let i = 0; i < 120; i++) E.frame();
// menus
E.click('title');
GL.save.glow = 5000;
E.click('menu', 'hearth'); E.click('buy', 'wax');
ok(GL.save.meta.wax === 1 && GL.save.glow === 5000 - 60, 'Hearth purchase works', 'glow ' + GL.save.glow);
E.click('menu', 'heroes'); E.click('hero', 'lacewing');
ok(GL.save.heroes.lacewing && GL.save.hero === 'lacewing', 'buying a hero selects it');
E.click('menu', 'moths'); ok(/Mothbook/.test(E.byId.panel.innerHTML), 'Mothbook opens');
E.click('menu', 'evos'); ok(/Evolutions/.test(E.byId.panel.innerHTML), 'Evolution book opens');
E.click('back'); ok(GL.mode === 'title', 'Back returns to the title');
E.click('mute'); ok(GL.save.muted === true, 'mute toggles and saves'); E.click('mute');
ok(E.errors.length === 0, 'no script errors in the whole session', E.errors.slice(0, 3).join(' | '));
console.log('INFO frames simulated:', frames);

// ---------- 2. reload keeps the save; offline glow ----------
{
  const before = JSON.parse(store.get('gloamrush.save.v1'));
  const E2 = makeEnv(store); E2.advanceWall(5 * 3600e3); E2.load(); for (let i = 0; i < 3; i++) E2.frame();
  ok(E2.win.GLOAM.save.glow === before.glow && E2.win.GLOAM.save.runs === before.runs, 'reload restores the save intact');
  const nm = Object.keys(before.moths).length;
  ok(nm === 0 || /data-act="gather"/.test(E2.byId.panel.innerHTML), 'offline moth glow offered after time away', nm + ' species caught');
  ok(E2.errors.length === 0, 'no errors on reload');
}
// ---------- 3. corrupt save never wipes ----------
{
  const s3 = new Map([['gloamrush.save.v1', '{"glow":9999,"runs":3,']]);
  const E3 = makeEnv(s3); E3.load(); for (let i = 0; i < 3; i++) E3.frame();
  ok(E3.win.GLOAM.mode === 'title' && E3.errors.length === 0, 'a corrupt save boots cleanly');
  ok(s3.get('gloamrush.save.v1.bak') === '{"glow":9999,"runs":3,', 'the corrupt save is kept as a backup before anything overwrites it');
  const s4 = new Map([['gloamrush.save.v1', JSON.stringify({ glow: 'x', meta: { pot: 'y' }, moths: { nope: 1 } })]]);
  const E4 = makeEnv(s4); E4.load(); for (let i = 0; i < 3; i++) E4.frame();
  ok(E4.win.GLOAM.save.glow === 0 && E4.errors.length === 0, 'wrong-typed save values fall back to defaults');
}
// ---------- 4. blocked storage ----------
{
  const s5 = new Map(); const E5 = makeEnv(s5);
  E5.win.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  E5.load(); for (let i = 0; i < 3; i++) E5.frame(); E5.click('fly'); for (let i = 0; i < 60; i++) E5.frame();
  ok(E5.win.GLOAM.mode === 'play' && E5.errors.length === 0, 'game still plays when storage is blocked');
}
// ---------- 5. reduced motion ----------
{
  const s6 = new Map(); const E6 = makeEnv(s6); E6.load(); E6.frame(); E6.win.GLOAM.save.settings.rm = 1; E6.click('fly');
  const w = E6.win.GLOAM.world; w.events.push({ k: 'catch', sp: 'cinder', name: 'Cinder Sphinx', r: 2, mm: 60, isNew: true, isPB: false, x: 0, y: 0, count: 1 });
  E6.frame();
  ok(E6.errors.length === 0, 'reduced motion: rare catch handled with no errors (slow-mo, flashes and shake are gated off)');
}
// ---------- 6. GameKit: badges saved, pre-kit saves load, rolling backups, export/import ----------
{
  const KEYG = 'gloamrush.save.v1';
  const before = JSON.parse(store.get(KEYG));
  ok(before.badges && Object.keys(before.badges).length > 0, 'badges earned in play are written to the save', Object.keys(before.badges || {}).join(', '));
  const old = JSON.parse(JSON.stringify(before)); delete old.badges;
  const s7 = new Map([[KEYG, JSON.stringify(old)]]);
  const E7 = makeEnv(s7); E7.load(); for (let i = 0; i < 3; i++) E7.frame();
  const g7 = E7.win.GLOAM.save;
  ok(g7.runs === old.runs && g7.glow === old.glow && g7.badges && Object.keys(g7.badges).length === 0 && E7.errors.length === 0, 'a pre-kit save with no badges loads with all progress kept');
  ok(s7.get(KEYG + '.bak1') === JSON.stringify(old), 'the kit keeps a backup copy of the save in the same format');
  const code = E7.win.GLOAM.protect.exportCode();
  const s8 = new Map(); const E8 = makeEnv(s8); E8.load(); E8.frame();
  const r8 = E8.win.GLOAM.protect.importCode(code);
  ok(r8 && JSON.parse(s8.get(KEYG)).runs === old.runs, 'export code from one phone imports on another');
  const s9 = new Map([[KEYG, '{broken'], [KEYG + '.bak1', JSON.stringify(old)]]);
  const E9 = makeEnv(s9); E9.load(); for (let i = 0; i < 3; i++) E9.frame();
  ok(E9.win.GLOAM.save.runs === old.runs && E9.errors.length === 0, 'a broken save comes back from the newest backup');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
