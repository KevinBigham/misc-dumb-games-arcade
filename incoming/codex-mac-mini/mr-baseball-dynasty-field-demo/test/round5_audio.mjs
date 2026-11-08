// Round-5 (v0.6 P3) audio event-map pins. Headless CI can't hear, so this loads
// 09_audio.js standalone with a stubbed AudioContext and asserts the right synth
// voices fire per event/tier: velocity-scaled pitch whoosh, tiered bat crack,
// and the between-innings clap chant under the organ. Self-contained (evals the
// source file directly — game.js has no window in node and AudioSys.init would
// no-op).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
let failures = 0;
function check(cond, name, extra) {
  console.log((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  — ' + extra : ''));
  if (!cond) failures++;
}

/* ── stub WebAudio: every node records its param calls for inspection ── */
function param() {
  return {
    value: 0,
    sets: [], ramps: [], targets: [],
    setValueAtTime(v, t) { this.value = v; this.sets.push([v, t]); },
    exponentialRampToValueAtTime(v, t) { this.ramps.push([v, t]); },
    setTargetAtTime(v, t, c) { this.targets.push([v, t, c]); },
    cancelScheduledValues() {},
  };
}
function makeCtx() {
  return {
    sampleRate: 44100, currentTime: 0, destination: {},
    oscs: [], srcs: [], filters: [], gains: [],
    createGain() { const n = { gain: param(), connect() {} }; this.gains.push(n); return n; },
    createOscillator() { const n = { type: '', frequency: param(), connect() {}, start() {}, stop() {} }; this.oscs.push(n); return n; },
    createBiquadFilter() { const n = { type: '', Q: param(), frequency: param(), connect() {} }; this.filters.push(n); return n; },
    createBuffer(ch, len) { return { getChannelData() { return new Float32Array(len); } }; },
    createBufferSource() { const n = { buffer: null, loop: false, connect() {}, start() {} }; this.srcs.push(n); return n; },
  };
}
const ctx = makeCtx();
globalThis.__wave5ctx = ctx;
const src = fs.readFileSync(path.join(here, '..', 'src', '09_audio.js'), 'utf8');
const AudioSys = (0, eval)(
  'const window = { AudioContext: function () { return globalThis.__wave5ctx; } };\n' + src + '\n;AudioSys');
AudioSys.init();
check(AudioSys.started === true, 'init boots on the stub context');

// run fn, return only the voices it created
function collect(fn) {
  const m = { oscs: ctx.oscs.length, srcs: ctx.srcs.length, filters: ctx.filters.length, gains: ctx.gains.length };
  fn();
  return {
    oscs: ctx.oscs.slice(m.oscs), srcs: ctx.srcs.slice(m.srcs),
    filters: ctx.filters.slice(m.filters), gains: ctx.gains.slice(m.gains),
  };
}
const stGame = { scene: 'GAME', bases: [null, null, null, null], phase: 'PITCH', frame: 50 };
// noise voice = 1 buffer source through 1 filter + 1 gain (created in that order per call)
function noises(v) { return v.srcs.map((s, i) => ({ src: s, filt: v.filters[i], gain: v.gains[i] })); }

/* ── 1. pitch whoosh scales with velocity (T: 20 fast … 26 slow) ── */
{
  const fast = collect(() => AudioSys.consume([{ type: 'release', data: { type: 'FASTBALL', T: 20 } }], stGame));
  const slow = collect(() => AudioSys.consume([{ type: 'release', data: { type: 'STRAIGHT', T: 26 } }], stGame));
  check(noises(fast).length === 1 && noises(slow).length === 1, 'release fires exactly one whoosh voice');
  const fv = noises(fast)[0].gain.gain.sets[0][0], sv = noises(slow)[0].gain.gain.sets[0][0];
  check(fv > sv, 'whoosh louder for the faster pitch', 'fast ' + fv.toFixed(3) + ' > slow ' + sv.toFixed(3));
  const fd = noises(fast)[0].gain.gain.ramps[0][1], sd = noises(slow)[0].gain.gain.ramps[0][1];
  check(fd > sd, 'whoosh sustains longer for the faster pitch', 'fast ' + fd.toFixed(3) + 's > slow ' + sd.toFixed(3) + 's');
  const ff = noises(fast)[0].filt.frequency.sets[0][0], sf = noises(slow)[0].filt.frequency.sets[0][0];
  check(ff > sf, 'whoosh starts brighter for the faster pitch', 'fast ' + ff + 'Hz > slow ' + sf + 'Hz');
  check(noises(fast)[0].filt.frequency.ramps.length === 1, 'whoosh sweeps downward (slide)');
}

/* ── 2. bat crack tiers: q4 crack > q2 thwack > q0 dribbler ── */
{
  const tiers = [4, 2, 0].map(q => collect(() => AudioSys.consume([{ type: 'crack', data: { q, tc: 'x' } }], stGame)));
  const vols = tiers.map(v => noises(v)[0].gain.gain.sets[0][0]);
  check(vols[0] > vols[1] && vols[1] > vols[2], 'crack noise volume strictly tiered', vols.map(v => v.toFixed(2)).join(' > '));
  check(vols[2] >= 0.15 && vols[0] <= 0.5, 'crack present but under master headroom', vols.map(v => v.toFixed(2)).join('/'));
  check(tiers[0].oscs.length === 2 && tiers[1].oscs.length === 1 && tiers[2].oscs.length === 1,
    'q4 adds a low thump under the crack', tiers.map(v => v.oscs.length).join('/'));
  const f = tiers.map(v => noises(v)[0].filt.frequency.sets[0][0]);
  check(f[0] > f[1] && f[1] > f[2], 'crack brightness tiered', f.join(' > '));
  const bunt = collect(() => AudioSys.consume([{ type: 'crack', data: { q: 0, tc: 'bunt', bunt: true } }], stGame));
  check(noises(bunt).length === 1 && bunt.oscs.length === 1, 'bunt keeps its own soft tick');
}

/* ── 3. between innings: organ number + clap chant ── */
{
  const card = collect(() => AudioSys.consume([{ type: 'card' }], { scene: 'CARD', bases: [null, null, null, null], phase: 'CARD', frame: 7 }));
  check(card.oscs.length === 26, 'organ 16 lead + 8 bass + 2 chant stomps', card.oscs.length + ' oscs');
  check(noises(card).length === 10, 'ten crowd claps in the chant pattern', noises(card).length + ' claps');
  const clapFreqs = noises(card).map(n => n.filt.frequency.sets[0][0]);
  check(clapFreqs.every(fq => fq === 1150), 'claps voiced at the crowd band');
}

/* ── 4. full event sweep: every mapped event type fires without throwing ── */
{
  const events = [
    { type: 'release', data: { type: 'FASTBALL', T: 21 } }, { type: 'crack', data: { q: 4, tc: 'x' } },
    { type: 'catchpop' }, { type: 'catch' }, { type: 'pickup' }, { type: 'throw' }, { type: 'pickoff' },
    { type: 'bounce', data: { n: 1 } }, { type: 'dive' }, { type: 'call:strike' }, { type: 'call:ball' },
    { type: 'call:strikeout' }, { type: 'call:walk' }, { type: 'call:foul' }, { type: 'call:out' },
    { type: 'call:hbp' }, { type: 'flyout' }, { type: 'newBatter', data: { pow: 12, spd: 5, syl: 2 } },
    { type: 'hr', data: { ft: 420 } }, { type: 'run' }, { type: 'error' }, { type: 'steal' },
    { type: 'stolen' }, { type: 'switch' }, { type: 'tagup' }, { type: 'go' }, { type: 'advance' },
    { type: 'phantom' }, { type: 'playball' }, { type: 'halfStart' }, { type: 'card' },
    { type: 'final' }, { type: 'menu' }, { type: 'wall' }, { type: 'windup', data: { type: 'FASTBALL' } },
  ];
  let threw = null;
  try { AudioSys.consume(events, stGame); } catch (e) { threw = e.message; }
  check(threw === null, 'all 35 mapped event types consume cleanly', threw || '');
}

/* ── 5. ambient drivers: RISP charge latch + title riff ── */
{
  const rispSt = { scene: 'GAME', bases: [null, null, {}, null], phase: 'PREPITCH', frame: 50 };
  const c1 = collect(() => AudioSys.consume([], rispSt));
  const c2 = collect(() => AudioSys.consume([], rispSt));
  check(c1.oscs.length === 6 && c2.oscs.length === 0, 'CHARGE! fires once on RISP, latched', c1.oscs.length + '/' + c2.oscs.length);
  const title = collect(() => AudioSys.consume([], { scene: 'TITLE', bases: [null, null, null, null], phase: 'TITLE', frame: 1 }));
  check(title.oscs.length === 8, 'title riff still loops on the title screen', title.oscs.length + ' notes');
}

console.log(failures ? '\nROUND 5 AUDIO: ' + failures + ' FAILURES' : '\nROUND 5 AUDIO: ALL PASS');
process.exit(failures ? 1 : 0);
