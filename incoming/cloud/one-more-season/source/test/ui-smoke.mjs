// UI smoke test: runs the built single-file HTML's script against a tiny fake DOM and clicks
// through a whole season, including a mid-season "page reload". It checks that every screen
// renders, that each click goes to a real button, and that reload resumes the same phase.
// It does NOT check layout or looks; that needs a real browser.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(root, '..', 'dist', 'one-more-season.html'), 'utf8');
const js = html.split('<script>')[1].split('</script>')[0];

class FakeStorage { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } }
const storage = new FakeStorage();
let pass = 0, fail = 0;
const check = (n, c, d = '') => { c ? pass++ : fail++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? '  -- ' + d : ''}`); };

function boot() {
  const app = { _h: '', listeners: [], set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h; }, insertAdjacentHTML(_, v) { this._h += v; }, addEventListener(t, f) { this.listeners.push(f); } };
  const inputs = { code: { value: '' }, savetext: { value: '', select() {} } };
  const g = {
    document: { getElementById: id => (id === 'app' ? app : inputs[id]), execCommand() {} },
    window: { localStorage: storage, scrollY: 0, scrollTo() {} },
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = (i * 2654435761) >>> 0; return a; } },
    navigator: { clipboard: { writeText() {} } },
    setTimeout: () => 0, clearTimeout: () => {},
  };
  new Function('document', 'window', 'crypto', 'navigator', 'setTimeout', 'clearTimeout', js)(g.document, g.window, g.crypto, g.navigator, g.setTimeout, g.clearTimeout);
  return { app, inputs };
}

function buttons(app) {
  const list = [];
  for (const m of app.innerHTML.matchAll(/<button([^>]*)>/g)) {
    const a = m[1], ds = {};
    for (const d of a.matchAll(/data-([a-z]+)="([^"]*)"/g)) ds[d[1]] = d[2];
    if (ds.act) list.push({ dataset: ds, disabled: /\sdisabled(\s|$|>)/.test(a + ' ') });
  }
  return list;
}

function click(app, act, match = {}) {
  const b = buttons(app).find(x => x.dataset.act === act && Object.entries(match).every(([k, v]) => x.dataset[k] === v));
  if (!b) throw new Error(`no button ${act} ${JSON.stringify(match)}`);
  if (b.disabled) throw new Error(`button ${act} is disabled`);
  const target = { closest: () => b };
  for (const f of app.listeners) f({ target });
}

const screen = app => (app.innerHTML.match(/<main class="(\w+)"/) || [])[1] || (app.innerHTML.includes('Training ground</h2>') ? 'develop' : app.innerHTML.includes('Three moments') ? 'review' : '?');
const has = (app, s) => app.innerHTML.includes(s);

let { app, inputs } = boot();
check('title screen renders with New season button', has(app, 'One More Season') && buttons(app).some(b => b.dataset.act === 'new'));
click(app, 'rules'); check('How to play opens', has(app, 'How to play</h2>')); click(app, 'close');
click(app, 'new');
check('new season lands on prep with scouting for fixture 1', screen(app) === 'prepview' && has(app, 'Harbor Lane Rovers') && has(app, "Coach's notes"));
check('kickoff enabled with default lineup', !buttons(app).find(b => b.dataset.act === 'kickoff').disabled);
click(app, 'debug'); check('Math toggle shows formula terms', has(app, 'class="math"'));
// make the first-fixture choices: bench Reyke, start Danner, rest Reyke, train Danner attack, Patient
click(app, 'toggle', { id: 'reyke' });
check('kickoff disabled at 4 starters', buttons(app).find(b => b.dataset.act === 'kickoff').disabled);
click(app, 'toggle', { id: 'danner' });
click(app, 'rest', { id: 'reyke' });
click(app, 'train', { id: 'danner' });
click(app, 'trainattr', { id: 'danner', attr: 'attack' });
check('third prep action is blocked (buttons disabled for others)', buttons(app).filter(b => b.dataset.act === 'rest' && b.disabled).length >= 6);
click(app, 'tactic', { t: 'patient' });
const saved = JSON.parse(storage.getItem('oneMoreSeason.save.v1'));
check('draft decisions are saved before kickoff', saved.draft.tactic === 'patient' && saved.draft.prep.reyke === 'rest' && saved.draft.starters.includes('danner'));

// reload during prep keeps the draft
({ app, inputs } = boot());
check('after reload, title offers Continue season', buttons(app).some(b => b.dataset.act === 'resume'));
click(app, 'resume');
check('resume restores the unsent draft', has(app, 'Train ATK +1') && screen(app) === 'prepview');

let seenScreens = new Set();
for (let f = 0; f < 6; f++) {
  click(app, 'kickoff');
  seenScreens.add(screen(app));
  if (f === 1) { // reload mid-match: stored result must replay, not re-roll
    const before = JSON.parse(storage.getItem('oneMoreSeason.save.v1')).results[1].events.map(e => e.roll).join(',');
    ({ app, inputs } = boot()); click(app, 'resume');
    const after = JSON.parse(storage.getItem('oneMoreSeason.save.v1')).results[1].events.map(e => e.roll).join(',');
    check('reload during match playback reuses the stored rolls', before === after && has(app, 'Kick off'));
  }
  click(app, 'skip');
  check(`fixture ${f + 1}: full time reached`, has(app, 'Full time'));
  click(app, 'finish');
  seenScreens.add('review');
  check(`fixture ${f + 1}: review shows three logged moments`, (app.innerHTML.match(/class="ev /g) || []).length === 3 && has(app, 'Logged: possession'));
  if (f === 2) { // reload on review: fatigue must not apply again
    const fat = storage.getItem('oneMoreSeason.save.v1');
    ({ app, inputs } = boot()); click(app, 'resume');
    check('reload on review does not re-apply fatigue', JSON.parse(storage.getItem('oneMoreSeason.save.v1')).roster.map(p => p.fatigue).join() === JSON.parse(fat).roster.map(p => p.fatigue).join() && has(app, 'Three moments'));
  }
  click(app, 'continue');
  if (f < 5) {
    check(`fixture ${f + 1}: develop screen, confirm disabled until a pick`, has(app, 'Training ground</h2>') && buttons(app).find(b => b.dataset.act === 'develop').disabled);
    click(app, 'devpick', { id: 'marrow', attr: f < 1 ? 'control' : 'attack' });
    click(app, 'develop');
    check(`fixture ${f + 2}: prep screen for next opponent`, screen(app) === 'prepview');
  }
}
check('season recap renders with record and fixture list', screen(app) === 'recap' && has(app, 'The season') && (app.innerHTML.match(/class="o [WDL]"/g) || []).length === 6);
const hist = JSON.parse(storage.getItem('oneMoreSeason.history.v1'));
check('season recorded once in history', hist.length === 1);
({ app, inputs } = boot()); click(app, 'resume');
check('reloading the recap does not double-count history', JSON.parse(storage.getItem('oneMoreSeason.history.v1')).length === 1);
click(app, 'replay');
check('replay season code starts fixture 1 again', screen(app) === 'prepview' && has(app, 'Fixture 1/6'));
click(app, 'home'); click(app, 'tools');
check('save tools show export text', has(app, 'oneMoreSeason') || has(app, '&quot;version&quot;:1'));
// damaged save on boot
storage.setItem('oneMoreSeason.save.v1', '{broken');
({ app, inputs } = boot());
check('damaged save on boot shows a recovery notice', has(app, 'role="alert"'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
