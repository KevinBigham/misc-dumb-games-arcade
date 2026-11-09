// Run: node test/run-tests.js [path-to-html]
'use strict';
const path = require('path');
const { load } = require('./harness');
const FILE = process.argv[2] || path.join(__dirname, '..', 'fathomsong.html');
let pass = 0, fail = 0; const notes = [];
function ok(cond, name, extra) { if (cond) { pass++; } else { fail++; console.log('FAIL', name, extra !== undefined ? JSON.stringify(extra) : ''); } }
function note(s) { notes.push(s); console.log('  · ' + s); }

async function botRun(env, seed, diff, o) {
  o = o || {};
  const FS = env.FS;
  if (o.offsetMs != null) FS.Storage.data.settings.offsetMs = o.offsetMs;
  FS.Audio.ensure(); FS.Audio.log = [];
  const spec = FS.Gen.specFor(seed);
  FS.Game.begin(spec, diff, !!o.blind, o.practice || null);
  FS.Game.bot = !o.human;
  const dts = [];
  const origApply = FS.Game.applyJudge.bind(FS.Game);
  FS.Game.applyJudge = (i, g, dt) => { if (dt != null) dts.push(dt); origApply(i, g, dt); };
  let human = null;
  if (o.human) human = humanTapper(env, o.human);
  const done = await env.until(() => FS.Game.status === 'ended', 400000, human);
  FS.Game.applyJudge = origApply;
  // a failed run shows results after a short fade, so wait for the overlay
  if (done && FS.Game.stats.failed) await env.until(() => !env.byId.ovResults.classList.contains('hidden'), 3000);
  return { done, dts, stats: FS.Game.stats, song: FS.Game.song, inputs: FS.Game.inputs.slice() };
}
// a seeded "human": taps each target with gaussian timing error, extra latency, and some skips
function humanTapper(env, h) {
  const FS = env.FS; let a = h.seed || 7;
  const rnd = () => { a = (a * 1103515245 + 12345) >>> 0; return a / 4294967296; };
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(6.283 * rnd());
  const plan = new Map();
  return () => {
    const G = FS.Game; if (G.status !== 'playing' || G.countingDown) return;
    const T = G.song.targets, now = env.clock.ms;
    for (let i = 0; i < T.length; i++) {
      if (G.judged[i]) continue;
      if (!plan.has(i)) {
        const skip = rnd() < (h.skip || 0);
        const err = gauss() * (h.sigma != null ? h.sigma : 0.03) + (h.bias || 0);
        plan.set(i, skip ? null : err);
      }
      const err = plan.get(i); if (err === null) continue;
      // tap when the *heard* clock reaches target + err (+ any player latency the offset should cancel)
      const heard = FS.Audio.heard(now), rel = heard - G.t0, tt = T[i].t * G.beatDur + err + (h.latency || 0);
      if (rel >= tt) { plan.set(i, null); FS.Input.tap(T[i].lane, now); }
      if (T[i].t * G.beatDur > rel + 0.3) break;
    }
  };
}

(async () => {
  console.log('Fathomsong tests on', FILE);
  // ---------- 1. generator ----------
  {
    const env = load({ file: FILE }); const { Gen, DATA } = env.FS;
    const a = JSON.stringify(Gen.song(Gen.specFor('kelp-cathedral'), 'flow'));
    const b = JSON.stringify(Gen.song(Gen.specFor('kelp-cathedral'), 'flow'));
    ok(a === b, 'same seed + difficulty is identical');
    const c = Gen.song(Gen.specFor('kelp-cathedral'), 'surge'), f = Gen.song(Gen.specFor('kelp-cathedral'), 'flow');
    ok(c.bpm === f.bpm && c.mode === f.mode && c.key === f.key, 'difficulties share harmony');
    ok(JSON.stringify(Gen.song(Gen.specFor('banana'), 'flow').targets) !== JSON.stringify(Gen.song(Gen.specFor('mango'), 'flow').targets), 'different seeds differ');
    ok(Gen.normSeed('  Kelp Cathedral!! ') === 'kelp-cathedral' && Gen.specFor('Kelp Cathedral').name === 'Kelp Cathedral', 'seed normalization maps to preset');
    let bad = 0, total = 0, minN = 1e9, maxN = 0, durs = [], meters = {}, why = '';
    const seeds = DATA.presets.map(p => p.seed); for (let i = 0; i < 200; i++) seeds.push('seed-' + i);
    for (const s of seeds) for (const d of ['chill', 'flow', 'surge']) {
      const song = Gen.song(Gen.specFor(s), d); total++;
      meters[song.meter] = (meters[song.meter] || 0) + 1;
      const T = song.targets; minN = Math.min(minN, T.length); maxN = Math.max(maxN, T.length);
      durs.push(song.totalBeats * 60 / song.bpm);
      for (let i = 0; i < T.length; i++) {
        const t = T[i], band = DATA.lanes[t.lane].band;
        if (i && T[i - 1].t > t.t) { bad++; why = 'unsorted'; }
        if (i && T[i - 1].t === t.t && T[i - 1].lane === t.lane) { bad++; why = 'dup lane'; }
        if (t.t >= song.totalBeats - song.meter * 2 || t.ct < song.meter * 2) { bad++; why = 'out of play area'; }
        if (t.midi < band[0] || t.midi >= band[1]) { bad++; why = 'pitch band'; }
        if (Math.abs(t.t - t.ct - t.span) > 1e-9) { bad++; why = 'span'; }
        const seg = song.barSegs[Math.floor(t.t / song.meter)], bib = t.t % song.meter;
        if (!seg.some(x => x.kind === 'resp' && bib >= x.from - 1e-9 && bib < x.to)) { bad++; why = 'target not in an answer segment'; }
        const cseg = song.barSegs[Math.floor(t.ct / song.meter)], cb = t.ct % song.meter;
        if (!cseg.some(x => x.kind === 'call' && cb >= x.from - 1e-9 && cb < x.to)) { bad++; why = 'call not in a listen segment'; }
      }
      // minimum gap between distinct note times
      const times = [...new Set(T.map(x => x.t))].sort((x, y) => x - y);
      for (let i = 1; i < times.length; i++) if (times[i] - times[i - 1] < DATA.difficulties[d].minGap - 1e-9) { bad++; why = 'min gap ' + d; }
      if (song.meter === 3 && song.sections.some(x => x.type === 'half')) { bad++; why = 'half in 3/4'; }
      if (!song.events.every(e => e.type !== 'call' || e.dur > 0)) { bad++; why = 'dur'; }
    }
    ok(bad === 0, 'generated charts valid across ' + total + ' songs', why);
    note('chart sizes ' + minN + '–' + maxN + ' notes; lengths ' + Math.round(Math.min(...durs)) + '–' + Math.round(Math.max(...durs)) + ' s; meters ' + JSON.stringify(meters));
    const tbl = DATA.presets.map(p => { const s = Gen.song(p, 'flow'); return p.name + ' ' + s.targets.length + 'n/' + Math.round(s.totalBeats * 60 / s.bpm) + 's'; });
    note('flow presets: ' + tbl.join(', '));
  }
  // ---------- 2. judgment boundaries + rules ----------
  {
    const env = load({ file: FILE }); const { Rules } = env.FS;
    const J = Rules.judge;
    ok(J(0) === 'perfect' && J(0.045) === 'perfect' && J(-0.045) === 'perfect', 'perfect boundary inclusive');
    ok(J(0.0451) === 'good' && J(-0.0451) === 'good' && J(0.1) === 'good', 'good band');
    ok(J(0.1001) === 'miss' && J(0.15) === 'miss' && J(-0.15) === 'miss', 'miss band');
    ok(J(0.1501) === null && J(-0.2) === null, 'outside window is ignored');
    let s = Rules.newStats('flow');
    for (let i = 0; i < 6; i++) s = Rules.apply(s, { grade: 'perfect', dt: 0, sec: 'A' });
    ok(s.level === 2 && s.score === 300 * 6, 'six hits add a layer; points use level before the climb', s);
    const s2 = Rules.apply(s, { grade: 'miss', dt: null, sec: 'A' });
    ok(s2.level === 1 && s2.combo === 0 && s2.miss === 1 && s.miss === 0, 'miss drops one layer, apply is pure');
    let c = Rules.newStats('chill'); for (let i = 0; i < 50; i++) c = Rules.apply(c, { grade: 'miss', dt: null, sec: 'A' });
    ok(!c.failed && c.hp > 0, 'chill cannot fail');
    let h = Rules.newStats('surge'); for (let i = 0; i < 20; i++) h = Rules.apply(h, { grade: 'miss', dt: null, sec: 'A' });
    ok(h.failed, 'surge fails when resonance empties');
    let m = Rules.newStats('flow'); for (let i = 0; i < 200; i++) m = Rules.apply(m, { grade: 'perfect', dt: 0, sec: 'A' });
    ok(m.level === 4, 'level caps at 4');
    ok(Rules.grade({ perfect: 10, good: 0, miss: 0 }) === 'S+' && Rules.grade({ perfect: 96, good: 4, miss: 0 }) === 'S' && Rules.grade({ perfect: 97, good: 2, miss: 1 }) === 'A', 'grade ladder (S needs no misses)');
  }
  // ---------- 3. full bot run on the audio clock ----------
  {
    const env = load({ file: FILE }); const FS = env.FS;
    env.byId.bPlay.click(); // title Play → first song
    ok(FS.Game.status === 'playing' && FS.Game.song.name === 'Kelp Cathedral', 'title Play starts Kelp Cathedral');
    FS.Game.stopRun();
    const r = await botRun(env, 'kelp-cathedral', 'flow');
    const T = r.song.targets;
    ok(r.done && r.stats.perfect === T.length && r.stats.miss === 0, 'bot run: every note perfect', { p: r.stats.perfect, n: T.length, m: r.stats.miss });
    const mx = Math.max(...r.dts.map(Math.abs)), mean = r.dts.reduce((a, b) => a + b, 0) / r.dts.length;
    note('bot timing error vs audio clock: mean ' + (mean * 1000).toFixed(1) + ' ms, worst ' + (mx * 1000).toFixed(1) + ' ms (frame-quantized bot)');
    const calls = FS.Audio.log.filter(x => x.id >= 0);
    ok(calls.length === T.length, 'every elder note was scheduled', [calls.length, T.length]);
    ok(calls.every(x => x.at === x.when), 'every elder note scheduled exactly on its beat (none late)');
    const t0 = FS.Game.t0, bd = FS.Game.beatDur;
    ok(calls.every(x => Math.abs(x.when - (t0 + x.t * bd)) < 1e-9), 'scheduled time = t0 + beat × beat length');
    const byId = new Map(calls.map(x => [x.id, x]));
    ok(T.every(t => Math.abs((t0 + t.t * bd) - (byId.get(t.id).when + t.span * bd)) < 1e-9), 'each answer is exactly one span after its call');
    ok(!env.byId.ovResults.classList.contains('hidden') && env.byId.rGrade.textContent === 'S+', 'results show S+', env.byId.rGrade.textContent);
    ok(FS.Storage.data.unlocked.surge && !!FS.Storage.data.best['kelp|flow|n|r1'], 'best saved, Surge unlocked');
    ok(r.stats.peakLevel === 4, 'all layers reached');
    const rep = FS.Rules.replay(r.song, r.inputs);
    ok(rep.score === r.stats.score && rep.perfect === r.stats.perfect && rep.miss === r.stats.miss && rep.maxCombo === r.stats.maxCombo, 'replay of recorded inputs reproduces the live score');
    ok(env.errors.length === 0, 'no console errors during a full run', env.errors.slice(0, 3));
    // layer gating: what was audible at level 1?
    const st = JSON.parse(env.store['fathomsong.v1']);
    ok(st.schema === 1 && st.best['kelp|flow|n|r1'].grade === 'S+', 'save written to storage');
  }
  // ---------- 4. human-like runs, replay determinism ----------
  {
    for (const [seed, diff, h] of [['trench-lights', 'flow', { sigma: 0.04, skip: 0.06, seed: 3 }], ['brine-waltz', 'surge', { sigma: 0.03, skip: 0.02, seed: 9 }], ['glasswater-run', 'chill', { sigma: 0.06, skip: 0.15, seed: 5 }]]) {
      const env = load({ file: FILE }); const FS = env.FS;
      FS.Storage.data.unlocked.surge = true;
      const r = await botRun(env, seed, diff, { human: h });
      const rep = FS.Rules.replay(r.song, r.inputs);
      ok(r.done, seed + ' human run finishes');
      ok(rep.score === r.stats.score && rep.perfect === r.stats.perfect && rep.good === r.stats.good && rep.miss === r.stats.miss && rep.level === r.stats.level, seed + ' replay matches live', { live: [r.stats.score, r.stats.perfect, r.stats.good, r.stats.miss], rep: [rep.score, rep.perfect, rep.good, rep.miss] });
      note(seed + ' ' + diff + ' sim player σ=' + h.sigma * 1000 + 'ms skip=' + h.skip * 100 + '%: ' + FS.Rules.grade(r.stats) + ' ' + (FS.Rules.accuracy(r.stats) * 100).toFixed(1) + '% P/G/M ' + r.stats.perfect + '/' + r.stats.good + '/' + r.stats.miss + (r.stats.failed ? ' FAILED' : ''));
      ok(env.errors.length === 0, seed + ' no errors', env.errors.slice(0, 2));
    }
  }
  // ---------- 5. losing run + chill no-fail ----------
  {
    const env = load({ file: FILE }); const FS = env.FS;
    const r = await botRun(env, 'saltstar-parade', 'surge', { human: { skip: 1 } });
    ok(r.done && r.stats.failed && env.byId.rGrade.textContent === 'F', 'idle player fails on Surge and sees F');
    ok(!FS.Storage.data.best['salt|surge|n|r1'], 'failed run is not saved as a best');
    ok(env.byId.rBest.textContent === 'THE SONG WENT QUIET', 'fail message');
    const r2 = await botRun(env, 'the-long-exhale', 'chill', { human: { skip: 1 } });
    ok(r2.done && !r2.stats.failed && r2.stats.miss === r2.song.targets.length, 'idle player on Chill reaches the end without failing');
    ok(!env.byId.bPractice.classList.contains('hidden'), 'practice button offered after misses');
  }
  // ---------- 6. pause / resume does not manufacture misses ----------
  {
    const env = load({ file: FILE }); const FS = env.FS;
    FS.Audio.ensure(); FS.Game.begin(FS.Gen.specFor('kelp-cathedral'), 'flow', false, null); FS.Game.bot = true;
    // run to the middle of an answer lap with a target imminent
    await env.until(() => { const G = FS.Game, b = G.beatAt(FS.Audio.heard()); const seg = G.song.barSegs[Math.floor(b / G.song.meter)]; return b > 20 && seg && seg[0].kind === 'resp'; }, 120000);
    const judgedBefore = FS.Game.stats.judged, ctxT = env.ctx.currentTime;
    FS.Game.pause();
    await env.advance(4000);
    ok(FS.Game.status === 'paused' && FS.Game.stats.judged === judgedBefore, 'nothing judged during a 4 s pause');
    ok(Math.abs(env.ctx.currentTime - ctxT) < 0.01, 'audio clock frozen while paused');
    FS.Game.resume();
    ok(FS.Game.countingDown && env.ctx.state === 'suspended', 'resume counts in while the clock is still frozen');
    await env.advance(1000);
    ok(FS.Game.stats.judged === judgedBefore, 'nothing judged during the count-in');
    await env.until(() => FS.Game.status === 'ended', 200000);
    ok(FS.Game.stats.miss === 0 && FS.Game.stats.perfect === FS.Game.song.targets.length, 'after resume, the run is still all perfect');
    // blur and visibility pause
    FS.Game.begin(FS.Gen.specFor('kelp-cathedral'), 'flow', false, null);
    await env.advance(1500); env.fire('blur');
    ok(FS.Game.status === 'paused' && env.ctx.state === 'suspended', 'window blur pauses and suspends audio');
    FS.Game.resume(); await env.advance(2500);
    env.g.document.hidden = true; (env.docL.visibilitychange || []).forEach(f => f());
    ok(FS.Game.status === 'paused', 'hidden tab pauses');
    env.key(' '); ok(FS.Game.countingDown, 'Space resumes with a count-in');
    FS.Game.stopRun();
  }
  // ---------- 7. calibration + offset ----------
  {
    const env = load({ file: FILE }); const FS = env.FS;
    FS.Calib.start();
    const beat = 60 / FS.CONFIG.calib.bpm; let next = 0;
    await env.until(() => !FS.Calib.active, 30000, () => {
      // tap 38 ms after each click is *heard*
      const h = FS.Audio.heard(env.clock.ms), due = FS.Calib.t0 + next * beat + 0.038;
      if (next < FS.CONFIG.calib.beats && h >= due) { FS.Input.tap(0, env.clock.ms); next++; }
    });
    const off = FS.Storage.data.settings.offsetMs;
    ok(Math.abs(off - 38) <= 4, 'calibration measures a 38 ms late tapper', off);
    note('calibration result for a 38 ms late tapper: ' + off + ' ms');
    // a run with 120 ms of extra tap latency, corrected by the offset
    FS.Storage.data.settings.offsetMs = 120;
    const r = await botRun(env, 'trench-lights', 'flow', { human: { sigma: 0.0, latency: 0.12, seed: 1 } });
    ok(r.stats.miss === 0 && r.stats.good === 0, 'offset cancels a steady 120 ms latency', [r.stats.perfect, r.stats.good, r.stats.miss]);
    FS.Storage.data.settings.offsetMs = 0;
    const r2 = await botRun(env, 'trench-lights', 'flow', { human: { sigma: 0.0, latency: 0.12, seed: 1 } });
    ok(r2.stats.perfect === 0 && r2.stats.good === 0, 'without the offset, the same latency scores no perfects or goods', [r2.stats.perfect, r2.stats.good, r2.stats.miss]);
    ok(!env.byId.bNudge.classList.contains('hidden') && /\+120|\+11\d|\+12\d/.test(env.byId.bNudge.textContent), 'results suggest the right offset', env.byId.bNudge.textContent);
  }
  // ---------- 8. practice mode ----------
  {
    const env = load({ file: FILE }); const FS = env.FS;
    const r = await botRun(env, 'kelp-cathedral', 'flow', { practice: 'Q' });
    const inSec = r.song.targets.filter(t => t.sec === 'Q').length;
    ok(r.done && r.stats.judged === inSec && r.stats.perfect === inSec, 'practice judges only its section', [r.stats.judged, inSec]);
    ok(Object.keys(FS.Storage.data.best).length === 0, 'practice is not saved');
    ok(/practice/.test(env.byId.rSong.textContent), 'results label practice');
  }
  // ---------- 9. storage recovery ----------
  {
    const store = { 'fathomsong.v1': '{not json' };
    const env = load({ file: FILE, storage: store });
    ok(env.FS.Storage.data.schema === 1 && Object.keys(store).some(k => k.startsWith('fathomsong.v1.recovered-')), 'corrupt save kept as backup, fresh save started');
    const env2 = load({ file: FILE, lsThrows: true });
    env2.byId.bPlay.click(); await env2.advance(3000);
    ok(env2.FS.Game.status === 'playing' && env2.errors.length === 0, 'blocked storage still plays');
    const env3 = load({ file: FILE, storage: { 'fathomsong.v1': JSON.stringify({ schema: 1, settings: { offsetMs: 9999, volume: 'x', diff: 'nope' }, best: {} }) } });
    const s3 = env3.FS.Storage.data.settings;
    ok(s3.offsetMs === 400 && s3.volume === 0.8 && s3.diff === 'flow', 'out-of-range settings are clamped on load', s3);
    const env4 = load({ file: FILE, noAudio: true });
    env4.byId.bPlay.click();
    ok(env4.FS.Game.status !== 'playing' && /Web Audio/.test(env4.byId.toast.textContent), 'no Web Audio: clear message, no crash');
  }
  // ---------- 10. challenge link + menus ----------
  {
    const env = load({ file: FILE, hash: '#song-chill-velvet-tide' });
    ok(!env.byId.ovSelect.classList.contains('hidden') && env.FS.UI.challenge && env.FS.UI.challenge.spec.seed === 'velvet-tide', 'challenge link opens song list with the friend’s song');
    ok(env.FS.Storage.data.settings.diff === 'chill', 'challenge difficulty applied');
    ok(env.byId.songList.children.length === 8, 'song list: challenge + daily + 6 presets', env.byId.songList.children.length);
    const envS = load({ file: FILE, hash: '#song-surge-x' });
    ok(envS.FS.Storage.data.settings.diff !== 'surge', 'locked Surge is not forced by a link');
    const env2 = load({ file: FILE });
    env2.byId.bSongs.click(); env2.byId.seedIn.value = 'Hello World'; env2.byId.bSeed.click();
    ok(env2.FS.Game.status === 'playing' && env2.FS.Game.song.seed === 'hello-world', 'any word makes a song');
    const d = env2.FS.Gen.dailySeed(new Date(2026, 10, 6, 23, 30));
    ok(d === 'daily-2026-11-06', 'daily seed uses the local date', d);
  }
  // ---------- 11. phone layout geometry ----------
  {
    const env = load({ file: FILE }); const R = env.FS.R;
    for (const [w, h] of [[390, 844], [375, 667], [320, 568], [768, 1024], [1280, 720]]) {
      const ph = Math.max(100, Math.min(150, h * 0.17));
      const L = R.layout(w, h, 74, h - ph);
      const gap = Math.min(L.ring[1] - L.ring[0], L.ring[2] - L.ring[1]);
      const fits = L.cx - L.rad - 4 >= 8 && L.cy - L.rad - 4 >= 74 && L.cy + L.rad + 4 <= h - ph;
      ok(fits, w + 'x' + h + ' disc fits between HUD and pads', L);
      ok(gap >= L.dot * 2.6 + 4, w + 'x' + h + ' neighbouring rings do not overlap at full halo size', { gap, dot: L.dot });
      ok(L.dot >= 9 && w / 3 - 12 >= 44, w + 'x' + h + ' targets and pads big enough to hit');
      note(w + 'x' + h + ': disc radius ' + Math.round(L.rad) + ' px, seed ' + Math.round(L.dot * 2) + ' px, pads ' + Math.round(ph) + ' px tall');
    }
  }
  // ---------- 12. clock fallbacks ----------
  for (const mode of ['no-timestamp', 'stale-timestamp']) {
    const env = load({ file: FILE }); const FS = env.FS;
    FS.Audio.ensure();
    if (mode === 'no-timestamp') env.ctx.getOutputTimestamp = undefined;
    else env.ctx.getOutputTimestamp = function () { return { contextTime: Math.max(0, this.currentTime - 0.52), performanceTime: env.clock.ms - 500 }; };
    await env.advance(300);
    const h = FS.Audio.heard(), expect = env.ctx.currentTime - 0.025;
    ok(Math.abs(h - expect) < 0.004, mode + ': heard falls back to currentTime minus reported latency', { h, expect });
    const r = await botRun(env, 'glasswater-run', 'flow');
    ok(r.done && r.stats.miss === 0 && r.stats.perfect === r.song.targets.length, mode + ': bot run still all perfect', [r.stats.perfect, r.stats.good, r.stats.miss]);
    ok(env.errors.length === 0, mode + ': no errors', env.errors.slice(0, 2));
  }
  // ---------- 13. readability: 3/4 labels, early/late feedback ----------
  {
    const env = load({ file: FILE }); const FS = env.FS;
    const waltz = FS.Gen.song(FS.Gen.specFor('brine-waltz'), 'surge');
    const qs = waltz.sections.filter(x => x.key === 'Q' || x.key === 'Q2').map(x => x.label);
    ok(waltz.meter === 3 && qs.length && qs.every(l => l === 'Rolling echoes' || l === 'Deeper echoes'), '3/4 quick sections get waltz labels', qs);
    FS.Audio.ensure(); FS.Game.begin(FS.Gen.specFor('kelp-cathedral'), 'flow', false, null); FS.Game.bot = false;
    for (const [want, lead] of [['TOO EARLY', 0.12], ['TOO LATE', -0.12]]) {
      let hit = null;
      await env.until(() => hit !== null, 120000, () => {
        const G = FS.Game; if (hit !== null || G.status !== 'playing' || G.countingDown) return;
        const rel = FS.Audio.heard() - G.offsetSec() - G.t0, T = G.song.targets;
        for (let i = 0; i < T.length; i++) {
          if (G.judged[i]) continue;
          const gap = T[i].t * G.beatDur - rel;
          if (Math.abs(gap - lead) < 0.004) {
            const near = T.some((u, j) => j !== i && !G.judged[j] && u.lane === T[i].lane && Math.abs(u.t * G.beatDur - rel) < 0.2);
            if (!near) { hit = G.tap(T[i].lane); }
            break;
          }
          if (gap > 0.3) break;
        }
      });
      ok(hit && hit.grade === 'miss' && FS.R.floats.some(f => f.text === want), 'a tap 120 ms off reads ' + want, hit && [hit.grade, hit.dt]);
    }
    FS.Game.stopRun();
    ok(env.errors.length === 0, 'readability checks: no errors', env.errors.slice(0, 2));
  }
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
