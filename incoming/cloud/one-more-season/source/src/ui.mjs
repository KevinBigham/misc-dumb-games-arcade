// One More Season — presentation. Reads state, dispatches commands, never computes outcomes itself.
import { CONFIG } from './config.mjs';
import { CLUB, ATTRS, ATTR_SHORT, ATTR_LABEL, ATTR_HELP, TACTICS, TACTIC_ORDER, OPPONENTS } from './content.mjs';
import { matchPreview, renderEvent, fatigueMult, effective, expectedPoints } from './sim.mjs';
import { newSeason, reduce, record, seasonRecap, checkDecision, currentOpponent, applyPrep } from './game.mjs';
import { loadSave, writeSave, exportText, importText, loadHistory, addHistory, loadPrefs, savePrefs } from './storage.mjs';

const app = document.getElementById('app');
let LS = null;
try { LS = window.localStorage; LS.getItem('oms-probe'); } catch (e) { LS = null; }

const ui = {
  state: null, screen: 'title', notice: '', saveOff: !LS,
  prefs: loadPrefs(LS), trainPick: null, play: null, devPick: null, modal: null,
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const f1 = x => (Math.round(x * 10) / 10).toFixed(1);
const oppShort = o => o.name.split(' ')[0];
const debugOn = () => !!ui.prefs.debug;
const player = id => ui.state.roster.find(p => p.id === id);
const KIT = typeof GK !== 'undefined' ? GK : null; // GameKit, when the page carries it

function newCode() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const buf = new Uint32Array(6);
  try { crypto.getRandomValues(buf); } catch (e) { for (let i = 0; i < 6; i++) buf[i] = Math.floor(Math.random() * 1e9); }
  for (let i = 0; i < 6; i++) s += a[buf[i] % a.length];
  return s;
}

function persist() {
  if (!LS) { ui.saveOff = true; return; }
  ui.saveOff = !writeSave(LS, ui.state);
}

function dispatch(cmd) {
  const res = reduce(ui.state, cmd);
  if (!res.ok) { ui.notice = res.error; render(); return false; }
  ui.state = res.state; // resolve first...
  persist(); // ...then persist the resolved state, then present it
  ui.notice = '';
  return true;
}

function startSeason(code) {
  ui.state = newSeason(code, code + '@' + Date.now());
  ui.screen = 'game'; ui.play = null; ui.trainPick = null; ui.devPick = null;
  persist();
  render(); window.scrollTo(0, 0);
}

// ---------- shared bits ----------
function crest(size = 64) {
  return `<svg class="crest" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
  <path d="M32 3 L57 11 V30 C57 46 46 56 32 61 C18 56 7 46 7 30 V11 Z" fill="var(--club)" stroke="var(--ink)" stroke-width="2.5"/>
  <path d="M19 40 V25 a13 13 0 0 1 26 0 V40" fill="none" stroke="var(--paper)" stroke-width="4"/>
  <path d="M12 46 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" stroke="var(--gold)" stroke-width="3"/>
  <circle cx="32" cy="19" r="3" fill="var(--gold)"/></svg>`;
}

function topBar() {
  const s = ui.state;
  const r = record(s);
  return `<header class="bar">
    <button class="ghost" data-act="home" aria-label="Menu">&#9776;</button>
    <div class="bar-mid"><b>Fixture ${s.fixture + 1}/${CONFIG.fixtures}</b><span>${r.w}W ${r.d}D ${r.l}L &middot; need ${CONFIG.winTarget} wins</span></div>
    <button class="chip ${debugOn() ? 'on' : ''}" data-act="debug" aria-pressed="${debugOn()}">Math</button>
  </header>${ui.saveOff ? '<div class="warn">Saving is unavailable in this browser. Progress lasts until you close the tab.</div>' : ''}
  ${ui.notice ? `<div class="warn" role="alert">${esc(ui.notice)}</div>` : ''}`;
}

function distBar(dist, label) {
  return `<div class="dist" role="img" aria-label="${esc(label)}: blank ${dist[0]}%, 3 points ${dist[1]}%, 7 points ${dist[2]}%">
    <span class="d0" style="width:${dist[0]}%">${dist[0] >= 12 ? dist[0] + '%' : ''}</span><span class="d3" style="width:${dist[1]}%">${dist[1] >= 12 ? dist[1] + '%' : ''}</span><span class="d7" style="width:${dist[2]}%">${dist[2] >= 12 ? dist[2] + '%' : ''}</span></div>`;
}
const distKey = '<div class="key"><span><i class="k0"></i>blank</span><span><i class="k3"></i>3 pts</span><span><i class="k7"></i>7 pts</span></div>';

function mathLine(e) {
  const T = TACTICS[e.tactic].name;
  return `<div class="math">${e.team === 'you' ? CLUB.short : 'Opp'} ${T}: base ${CONFIG.base[e.tactic].join('/')} &middot;
    ATK ${f1(e.off.attack)} vs DEF ${f1(e.def.defense)} &times;${CONFIG.kAttack} = ${e.attackTerm >= 0 ? '+' : ''}${e.attackTerm} &middot;
    CTL ${f1(e.off.control)} vs ${f1(e.def.control)} &times;${CONFIG.kControl} = ${e.controlTerm >= 0 ? '+' : ''}${e.controlTerm} &middot;
    tendency ${e.tendency >= 0 ? '+' : ''}${e.tendency} &rarr; raw ${e.raw} &rarr; shift ${e.shift} (cap &plusmn;${CONFIG.maxShift}) &rarr; ${e.dist.join('/')} &middot;
    your fatigue x${e.fatigueFactor} &middot; roll ${e.roll} &rarr; <b>${e.points}</b></div>`;
}

// ---------- title ----------
function renderTitle() {
  const loaded = ui.state;
  const hist = loadHistory(LS);
  const best = hist.reduce((m, h) => Math.max(m, h.w), -1);
  const kept = hist.filter(h => h.success).length;
  let resume = '';
  if (loaded && loaded.phase !== 'recap') {
    const r = record(loaded);
    resume = `<button class="big" data-act="resume">Continue season<small>Fixture ${loaded.fixture + 1} of 6 &middot; ${r.w}W ${r.d}D ${r.l}L</small></button>`;
  } else if (loaded) {
    resume = `<button class="big" data-act="resume">See last season's recap</button>`;
  }
  app.innerHTML = `<main class="title">
    ${crest(96)}
    <h1>One More Season</h1>
    <p class="sub">${esc(CLUB.name)} &middot; ${esc(CLUB.league)}</p>
    <p class="pitch">Six fixtures. Eight players. Tired legs. Win ${CONFIG.winTarget} and the board keeps you for one more season.</p>
    ${ui.notice ? `<div class="warn" role="alert">${esc(ui.notice)}</div>` : ''}
    <div class="stack">
      ${resume}
      <button class="${loaded ? 'secondary' : 'big'}" data-act="new">New season</button>
      <button class="secondary" data-act="rules">How to play</button>
      <button class="secondary" data-act="tools">Save tools &amp; season codes</button>
    </div>
    ${hist.length ? `<p class="hist">Seasons played: ${hist.length} &middot; kept the job: ${kept} &middot; best: ${best} wins</p>` : ''}
    <p class="fine">Original game. All clubs and players are fictional.</p>
  </main>${renderModal()}`;
  addPrefs();
}
function addPrefs() {
  const st = KIT && app.querySelector('.title .stack');
  if (st) st.insertBefore(KIT.ui.prefsButton({ className: 'secondary', panel: { text: true, tips: false, sound: false } }), st.querySelector('[data-act=tools]'));
}

function renderModal() {
  if (!ui.modal) return '';
  if (ui.modal === 'rules') return `<div class="modal" role="dialog" aria-label="How to play"><div class="sheet">
    <h2>How to play</h2>
    <ol>
      <li><b>Scout.</b> Each opponent has ratings, a usual plan and one tendency that rewards or punishes one of your plans.</li>
      <li><b>Pick 5 of 8.</b> ${esc(ATTR_HELP.attack)} ${esc(ATTR_HELP.defense)} ${esc(ATTR_HELP.control)} ${esc(ATTR_HELP.stamina)}</li>
      <li><b>Fatigue</b> (0-100) shrinks Attack, Defense and Control: a player at fatigue 60 plays at 70%. Starters gain 24 minus Stamina after a match. The bench recovers 18.</li>
      <li><b>2 prep points.</b> Rest a player (fatigue -24) or train one attribute +1 (fatigue +8). One action per player. Unused points are lost.</li>
      <li><b>Pick a plan.</b> Patient 25/55/20, Balanced 35/35/30, Aggressive 50/10/40 (chance of 0 / 3 / 7 points). Team strength and the tendency move up to 15 points between blank and 7.</li>
      <li><b>Kick off.</b> Each side gets 8 possessions worth 0, 3 or 7. A draw is not a win.</li>
      <li><b>Develop.</b> After fixtures 1-5, give one player a free +1.</li>
    </ol>
    <p>Turn on <b>Math</b> to see every number behind every possession.</p>
    <button class="big" data-act="close">Got it</button></div></div>`;
  if (ui.modal === 'confirmNew') return `<div class="modal" role="dialog" aria-label="Start a new season"><div class="sheet">
    <h2>Start a new season?</h2><p>Your season in progress will be replaced. The old save is kept as the previous save until your next action.</p>
    <button class="big" data-act="confirmnew">Yes, new season</button><button class="secondary" data-act="close">Keep my season</button></div></div>`;
  if (ui.modal === 'tools') {
    const txt = exportText(LS);
    return `<div class="modal" role="dialog" aria-label="Save tools"><div class="sheet">
    <h2>Save tools</h2>
    <p>Play a specific season code (same code + same choices = same results):</p>
    <div class="row"><input id="code" maxlength="12" placeholder="e.g. TIDE42" autocapitalize="characters"><button data-act="playcode">Play</button></div>
    <p>Your save as text. Copy it somewhere safe, or paste a save here and import it.</p>
    <textarea id="savetext" rows="5" spellcheck="false">${esc(txt)}</textarea>
    <div class="row"><button class="secondary" data-act="copy">Copy</button><button class="secondary" data-act="import">Import</button></div>
    <button class="big" data-act="close">Close</button></div></div>`;
  }
  return '';
}

// ---------- prep ----------
function coachNotes(s, opp, pv) {
  const notes = [];
  const d = s.draft;
  if (s.fixture === 0) {
    const t = player('reyke');
    notes.push(`<b>${esc(t.name)}</b> is your best attacker (ATK ${t.attack}) but tired: fatigue ${t.fatigue} means every stat plays at ${Math.round(fatigueMult(t) * 100)}%. Rest the striker (fatigue -24), or bench for fresh <b>${esc(player('danner').name)}</b>.`);
    notes.push(`Scouts say ${esc(opp.name)} leave space behind. Your <b>${TACTICS[opp.tendency.tactic].name}</b> plan gets ${opp.tendency.pp > 0 ? '+' : ''}${opp.tendency.pp} toward 7s in this fixture.`);
  }
  for (const id of d.starters) {
    const p = player(id);
    const after = d.prep[id] === 'rest' ? Math.max(0, p.fatigue - CONFIG.restAmount) : p.fatigue + (d.prep[id] && d.prep[id] !== 'rest' ? CONFIG.trainFatigue : 0);
    if (s.fixture > 0 && after >= CONFIG.tiredWarn) notes.push(`<b>${esc(p.name)}</b> would start at fatigue ${Math.round(after)} (${Math.round((1 - after / 200) * 100)}% strength) and gain ${CONFIG.starterFatigueBase - p.stamina} more.`);
  }
  const left = CONFIG.prepPoints - Object.keys(d.prep).length;
  if (left > 0 && s.fixture > 0) notes.push(`${left} prep point${left > 1 ? 's' : ''} unused. They do not carry over.`);
  if (s.fixture === CONFIG.fixtures - 1) notes.push('Last fixture: nothing to save legs for.');
  return notes.length ? `<section class="card notes"><h3>Coach's notes</h3>${notes.map(n => `<p>${n}</p>`).join('')}</section>` : '';
}

function renderPrep() {
  const s = ui.state, d = s.draft, opp = currentOpponent(s);
  const prepRoster = applyPrep(s.roster, d.prep);
  const startersNow = d.starters.map(id => prepRoster.find(p => p.id === id));
  const full = startersNow.length === CONFIG.startersCount;
  const pv = full ? matchPreview(startersNow, opp, d.tactic) : null;
  const left = CONFIG.prepPoints - Object.keys(d.prep).length;
  const t = opp.tendency;
  const yourR = pv ? pv.you : null;

  const scouting = `<section class="card scout" style="--o1:${opp.colors[0]};--o2:${opp.colors[1]}">
    <div class="scout-head"><span class="badge-o"></span><div><h2>${esc(opp.name)}</h2><p>Usually plays <b>${TACTICS[opp.tactic].name}</b></p></div></div>
    <table class="vs"><tr><th></th><th>ATK</th><th>DEF</th><th>CTL</th></tr>
      <tr><td>${esc(oppShort(opp))}</td><td>${f1(opp.attack)}</td><td>${f1(opp.defense)}</td><td>${f1(opp.control)}</td></tr>
      ${yourR ? `<tr class="you"><td>You</td><td>${f1(yourR.attack)}</td><td>${f1(yourR.defense)}</td><td>${f1(yourR.control)}</td></tr>` : ''}</table>
    <p class="tend"><b>Tendency:</b> ${esc(t.text)} <span class="pill ${(t.side === 'you') === (t.pp > 0) ? 'good' : 'bad'}">${TACTICS[t.tactic].name}: ${t.side === 'you' ? 'your' : 'their'} 7s ${t.pp > 0 ? '+' : ''}${t.pp}</span></p>
    <p class="fine">Team numbers are averages of the five starters after fatigue.</p>
  </section>`;

  const rows = s.roster.map(p0 => {
    const p = prepRoster.find(x => x.id === p0.id);
    const on = d.starters.includes(p.id);
    const act = d.prep[p.id];
    const mult = fatigueMult(p);
    const fCls = p.fatigue >= 60 ? 'hot' : p.fatigue >= 35 ? 'warm' : 'cool';
    const attrs = ATTRS.map(a => {
      const trained = act === 'train:' + a;
      const eff = a === 'stamina' ? null : effective(p, a);
      return `<span class="at ${trained ? 'up' : ''}" title="${esc(ATTR_LABEL[a])}"><small>${ATTR_SHORT[a]}</small>${p[a]}${eff !== null && mult < 0.995 ? `<em>${f1(eff)}</em>` : ''}</span>`;
    }).join('');
    const canPrep = act || left > 0;
    const picking = ui.trainPick === p.id;
    return `<li class="pl ${on ? 'on' : ''}">
      <div class="pl-top">
        <button class="start ${on ? 'on' : ''}" data-act="toggle" data-id="${p.id}" aria-pressed="${on}">${on ? 'Starting' : 'Bench'}</button>
        <div class="who"><b>${esc(p.name)}</b><small>${esc(p.role)}</small></div>
        <div class="fat ${fCls}" title="Fatigue"><div style="width:${p.fatigue}%"></div><span>${Math.round(p.fatigue)}${p0.fatigue !== p.fatigue ? ` <s>${Math.round(p0.fatigue)}</s>` : ''}</span></div>
      </div>
      <div class="attrs">${attrs}</div>
      <div class="prep">
        <button class="mini ${act === 'rest' ? 'sel' : ''}" data-act="rest" data-id="${p.id}" ${canPrep || act === 'rest' ? '' : 'disabled'}>Rest -${CONFIG.restAmount}</button>
        <button class="mini ${act && act !== 'rest' ? 'sel' : ''}" data-act="train" data-id="${p.id}" ${canPrep ? '' : 'disabled'}>${act && act !== 'rest' ? 'Train ' + ATTR_SHORT[act.split(':')[1]] + ' +1' : 'Train +1'}</button>
        ${act ? `<button class="mini ghost" data-act="clearprep" data-id="${p.id}">Undo</button>` : ''}
      </div>
      ${picking ? `<div class="pick">Train which? (+${CONFIG.trainFatigue} fatigue) ${ATTRS.map(a => `<button class="mini" data-act="trainattr" data-id="${p.id}" data-attr="${a}" ${p0[a] >= CONFIG.attrMax ? 'disabled' : ''}>${ATTR_SHORT[a]} ${p0[a]}&rarr;${Math.min(10, p0[a] + 1)}</button>`).join('')}</div>` : ''}
    </li>`;
  }).join('');

  const plans = TACTIC_ORDER.map(k => {
    const sel = d.tactic === k;
    let body = `<div class="fine">Base ${CONFIG.base[k].join(' / ')}</div>`;
    if (full) {
      const p2 = matchPreview(startersNow, opp, k);
      const tag = p2.yourOdds.tendency ? `<span class="pill ${p2.yourOdds.tendency > 0 ? 'good' : 'bad'}">scouted ${p2.yourOdds.tendency > 0 ? '+' : ''}${p2.yourOdds.tendency}</span>` : (p2.theirOdds.tendency ? `<span class="pill bad">opens you up +${p2.theirOdds.tendency}</span>` : '');
      body = `${distBar(p2.yourOdds.dist, TACTICS[k].name + ' your attack')}${tag}`;
      if (debugOn()) body += `<div class="math">shift ${p2.yourOdds.shift} (atk ${p2.yourOdds.attackTerm}, ctl ${p2.yourOdds.controlTerm}, tend ${p2.yourOdds.tendency}) &middot; your EV ${p2.evYou} vs their EV ${p2.evThem}</div>`;
    }
    return `<button class="plan ${sel ? 'sel' : ''}" data-act="tactic" data-t="${k}" aria-pressed="${sel}"><b>${TACTICS[k].name}</b><span>${esc(TACTICS[k].blurb)}</span>${body}</button>`;
  }).join('');

  const errs = checkDecision(s, d);
  const theirs = pv ? `<section class="card"><h3>Their attack vs your defense</h3>${distBar(pv.theirOdds.dist, 'their attack')}${distKey}
    ${debugOn() ? `<div class="math">${esc(oppShort(opp))} ${TACTICS[opp.tactic].name} &middot; ATK ${f1(pv.them.attack)} vs your DEF ${f1(pv.you.defense)} &rarr; ${pv.theirOdds.attackTerm} &middot; CTL ${pv.theirOdds.controlTerm} &middot; tend ${pv.theirOdds.tendency} &rarr; shift ${pv.theirOdds.shift}</div>` : ''}</section>` : '';

  app.innerHTML = `${topBar()}<main class="prepview">
    ${scouting}
    ${coachNotes(s, opp, pv)}
    <section class="card"><h3>Squad <span class="count">${d.starters.length}/${CONFIG.startersCount} starting &middot; ${left} prep point${left === 1 ? '' : 's'} left</span></h3>
      <ul class="squad">${rows}</ul></section>
    <section class="card"><h3>Your plan <span class="count">chance per possession</span></h3><div class="plans">${plans}</div>${full ? distKey : '<p class="fine">Pick 5 starters to see your odds.</p>'}</section>
    ${theirs}
    ${debugOn() ? `<p class="math">Season code ${esc(s.seed)} &middot; rng ${s.rng} &middot; ${s.fixture % 2 === 0 ? 'you' : 'they'} attack first</p>` : ''}
    <div class="spacer"></div>
  </main>
  <footer class="dock"><button class="big" data-act="kickoff" ${errs.length ? 'disabled' : ''}>${errs.length ? esc(errs[0]) : 'Kick off vs ' + esc(oppShort(opp))}</button></footer>`;
}

// ---------- match playback ----------
function renderMatch() {
  const s = ui.state, r = s.results[s.fixture], opp = OPPONENTS[r.fixture];
  if (!ui.play || ui.play.fixture !== r.fixture) ui.play = { fixture: r.fixture, shown: 0 };
  const shown = ui.play.shown;
  const evs = r.events.slice(0, shown);
  const last = evs[evs.length - 1];
  const sy = last ? last.scoreYou : 0, st = last ? last.scoreThem : 0;
  const ctx = { tactic: r.tactic, oppName: opp.name, oppShort: oppShort(opp) };
  const cells = team => r.events.filter(e => e.team === team).map(e => e.i < shown ? `<span class="cell p${e.points} ${e.i === shown - 1 ? 'new' : ''}">${e.points}</span>` : '<span class="cell"></span>').join('');
  const ballX = last ? (last.team === 'you' ? (last.points === 7 ? 94 : last.points === 3 ? 78 : 62) : (last.points === 7 ? 6 : last.points === 3 ? 22 : 38)) : 50;
  const done = shown >= r.events.length;
  app.innerHTML = `${topBar()}<main class="matchview">
    <section class="score card" style="--o1:${opp.colors[0]}">
      <div class="side">${crest(34)}<b>${esc(CLUB.short)}</b><span class="num">${sy}</span></div>
      <div class="clock">${done ? 'Full time' : shown ? 'Possession ' + shown + '/16' : 'Kick off'}</div>
      <div class="side them"><span class="badge-o"></span><b>${esc(oppShort(opp))}</b><span class="num">${st}</span></div>
    </section>
    <svg class="field" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="0" width="100" height="34" rx="2" fill="var(--grass)"/>
      <line x1="50" y1="0" x2="50" y2="34" stroke="var(--line)" stroke-width=".6"/>
      <circle cx="50" cy="17" r="6" fill="none" stroke="var(--line)" stroke-width=".6"/>
      <rect x="0" y="9" width="7" height="16" fill="none" stroke="var(--line)" stroke-width=".6"/>
      <rect x="93" y="9" width="7" height="16" fill="none" stroke="var(--line)" stroke-width=".6"/>
      <circle class="ball" cx="${ballX}" cy="17" r="2.4" fill="var(--paper)" stroke="var(--ink)" stroke-width=".5"/>
    </svg>
    <section class="card tl">
      <div class="tlrow"><span class="lab">${esc(CLUB.short)}</span>${cells('you')}</div>
      <div class="tlrow"><span class="lab">${esc(oppShort(opp))}</span>${cells('them')}</div>
      <p class="call" aria-live="polite">${last ? esc(renderEvent(last, ctx).text) : `${esc(CLUB.short)} line up ${TACTICS[r.tactic].name}. ${esc(opp.name)} go ${TACTICS[opp.tactic].name}.`}</p>
      ${debugOn() && last ? mathLine(last) : ''}
    </section>
    <div class="spacer"></div>
  </main>
  <footer class="dock">${done ? '<button class="big" data-act="finish">Full time: see what decided it</button>' : '<button class="secondary" data-act="skip">Skip to full time</button>'}</footer>`;
  if (!done && !ui.play.timer) {
    ui.play.timer = setTimeout(() => { if (ui.play) { ui.play.timer = null; ui.play.shown++; render(); } }, shown === 0 ? 500 : CONFIG.playbackMs);
  }
}

// ---------- review ----------
function renderReview() {
  const s = ui.state, r = s.results[s.fixture], opp = OPPONENTS[r.fixture];
  const ctx = { tactic: r.tactic, oppName: opp.name, oppShort: oppShort(opp) };
  const word = { W: 'Win', D: 'Draw', L: 'Loss' }[r.outcome];
  const dec = r.decisive.map(i => {
    const e = r.events[i];
    const rt = renderEvent(e, ctx);
    return `<li class="ev ${e.team}"><p>${esc(rt.text)}</p><small>Logged: possession ${e.n}, ${e.team === 'you' ? 'your' : 'their'} ${TACTICS[e.tactic].name} attack, odds ${e.dist.join('/')}, roll ${e.roll}${e.tendency ? `, tendency ${e.tendency > 0 ? '+' : ''}${e.tendency}` : ''}, your strength ${Math.round(e.fatigueFactor * 100)}%.</small>${debugOn() ? mathLine(e) : ''}</li>`;
  }).join('');
  const fat = r.fatigueChanges.filter(c => Math.abs(c.after - c.before) > 0).map(c => {
    const p = player(c.id);
    return `<li><b>${esc(p.name)}</b> ${Math.round(c.before)} &rarr; <span class="${c.after >= 60 ? 'hotT' : ''}">${Math.round(c.after)}</span></li>`;
  }).join('');
  const prep = Object.entries(r.prep).map(([id, a]) => `${esc(player(id).name)}: ${a === 'rest' ? 'rested' : 'trained ' + ATTR_LABEL[a.split(':')[1]]}`).join(' &middot; ') || 'none';
  app.innerHTML = `${topBar()}<main>
    <section class="card result ${r.outcome}"><h2>${word} ${r.scoreYou}-${r.scoreThem}</h2><p>vs ${esc(opp.name)} &middot; you played ${TACTICS[r.tactic].name}</p></section>
    <section class="card"><h3>Three moments that decided it</h3><ol class="evs">${dec}</ol></section>
    <section class="card"><h3>Fatigue after the match</h3><ul class="fatl">${fat}</ul><p class="fine">Prep used: ${prep}</p></section>
    ${debugOn() ? `<section class="card"><h3>All 16 possessions</h3>${r.events.map(mathLine).join('')}<p class="math">rng before ${r.rngBefore}, after ${r.rngAfter}</p></section>` : ''}
    <div class="spacer"></div></main>
  <footer class="dock"><button class="big" data-act="continue">${s.fixture < CONFIG.fixtures - 1 ? 'Training ground' : 'Season recap'}</button></footer>`;
}

// ---------- development ----------
function renderDevelop() {
  const s = ui.state, nextOpp = OPPONENTS[s.fixture + 1];
  const pick = ui.devPick;
  const rows = s.roster.map(p => `<li class="dv"><div class="who"><b>${esc(p.name)}</b><small>${esc(p.role)} &middot; fatigue ${Math.round(p.fatigue)}</small></div>
    <div class="dvb">${ATTRS.map(a => `<button class="mini ${pick && pick.id === p.id && pick.attr === a ? 'sel' : ''}" data-act="devpick" data-id="${p.id}" data-attr="${a}" ${p[a] >= CONFIG.attrMax ? 'disabled' : ''}>${ATTR_SHORT[a]} ${p[a]}</button>`).join('')}</div></li>`).join('');
  app.innerHTML = `${topBar()}<main>
    <section class="card"><h2>Training ground</h2><p>Pick one player and one attribute for a free +1. No fatigue cost. Next up: <b>${esc(nextOpp.name)}</b> (${esc(nextOpp.tendency.text)})</p></section>
    <section class="card"><ul class="devl">${rows}</ul></section>
    <div class="spacer"></div></main>
  <footer class="dock"><button class="big" data-act="develop" ${pick ? '' : 'disabled'}>${pick ? `Confirm: ${esc(player(pick.id).name)} ${ATTR_SHORT[pick.attr]} +1` : 'Pick a player and attribute'}</button></footer>`;
}

// ---------- recap ----------
function renderRecap() {
  const s = ui.state;
  const R = seasonRecap(s);
  if (!s.historyRecorded) {
    addHistory(LS, { id: s.id, seed: s.seed, w: R.rec.w, d: R.rec.d, l: R.rec.l, success: R.success });
    dispatch({ type: 'MARK_HISTORY' });
  }
  const starts = Object.entries(R.starts).sort((a, b) => b[1] - a[1]).map(([id, n]) => `${esc(player(id).name.split(' ')[0])} ${n}`).join(' &middot; ');
  const benched = s.roster.filter(p => !R.starts[p.id]).map(p => esc(p.name)).join(', ');
  app.innerHTML = `<main class="recap">
    <section class="card result ${R.success ? 'W' : 'L'}">${crest(56)}<h2>${R.success ? 'The board keeps you.' : 'The board has seen enough.'}</h2>
      <p class="big-rec">${R.rec.w}W ${R.rec.d}D ${R.rec.l}L</p><p>Scored ${R.pf}, conceded ${R.pa} &middot; target ${CONFIG.winTarget} wins</p></section>
    <section class="card"><h3>The season</h3><ol class="lines">${R.lines.map(l => `<li><span class="o ${l.outcome}">${l.outcome}</span><div><b>${l.score} vs ${esc(l.opp)}</b> <small>${l.tactic}</small><p>${esc(l.key)}</p></div></li>`).join('')}</ol></section>
    <section class="card"><h3>From the log</h3>
      ${R.closest ? `<p>Closest result you did not win: fixture ${R.closest.fixture} vs ${esc(R.closest.opp)}, ${R.closest.outcome === 'D' ? 'a draw' : 'lost by ' + R.closest.margin}, playing ${R.closest.tactic} at ${R.closest.fatiguePct}% strength.</p>` : '<p>You won every fixture.</p>'}
      ${R.peak ? `<p>Most tired starter: ${esc(R.peak.name)} kicked off fixture ${R.peak.fixture} at fatigue ${Math.round(R.peak.fatigue)}.</p>` : ''}
      <p>Starts: ${starts}${benched ? `. Never started: ${benched}` : ''}.</p>
      <p class="q"><b>One decision you would change?</b> Replay this exact season code and try it. Same code + same choices gives the same results, so only your change differs.</p>
    </section>
    <div class="stack"><button class="big" data-act="new">One more season</button><button class="secondary" data-act="replay">Replay season code ${esc(s.seed)}</button><button class="secondary" data-act="home">Title screen</button></div>
  </main>`;
}

// ---------- router ----------
function render() {
  if (ui.screen === 'title' || !ui.state) return renderTitle();
  const ph = ui.state.phase;
  if (ph !== 'match' && ui.play && ui.play.timer) { clearTimeout(ui.play.timer); ui.play = null; }
  if (ph === 'prep') renderPrep();
  else if (ph === 'match') renderMatch();
  else if (ph === 'review') renderReview();
  else if (ph === 'develop') renderDevelop();
  else renderRecap();
  if (ui.modal) app.insertAdjacentHTML('beforeend', renderModal());
}

function setDraft(mut) {
  const d = JSON.parse(JSON.stringify(ui.state.draft));
  mut(d);
  dispatch({ type: 'SET_DRAFT', draft: d });
}

app.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]');
  if (!b || b.disabled) return;
  const act = b.dataset.act, id = b.dataset.id;
  const y = window.scrollY;
  let keepScroll = true;
  switch (act) {
    case 'new': if (!ui.state || ui.state.phase === 'recap') { startSeason(newCode()); return; } ui.modal = 'confirmNew'; break;
    case 'confirmnew': ui.modal = null; startSeason(newCode()); return;
    case 'replay': startSeason(ui.state.seed); return;
    case 'resume': ui.screen = 'game'; keepScroll = false; break;
    case 'home': ui.screen = 'title'; ui.modal = null; if (ui.play && ui.play.timer) clearTimeout(ui.play.timer); ui.play = null; keepScroll = false; break;
    case 'rules': ui.modal = 'rules'; break;
    case 'tools': ui.modal = 'tools'; break;
    case 'close': ui.modal = null; break;
    case 'debug': ui.prefs.debug = !ui.prefs.debug; savePrefs(LS, ui.prefs); break;
    case 'toggle': {
      const d0 = ui.state.draft;
      if (!d0.starters.includes(id) && d0.starters.length >= CONFIG.startersCount) { ui.notice = 'Five are already starting. Bench someone first.'; break; }
      setDraft(d => { if (d.starters.includes(id)) d.starters = d.starters.filter(x => x !== id); else d.starters.push(id); });
      break;
    }
    case 'rest': ui.trainPick = null; setDraft(d => { if (d.prep[id] === 'rest') delete d.prep[id]; else d.prep[id] = 'rest'; }); break;
    case 'train': ui.trainPick = ui.trainPick === id ? null : id; break;
    case 'trainattr': ui.trainPick = null; setDraft(d => { d.prep[id] = 'train:' + b.dataset.attr; }); break;
    case 'clearprep': ui.trainPick = null; setDraft(d => { delete d.prep[id]; }); break;
    case 'tactic': setDraft(d => { d.tactic = b.dataset.t; }); break;
    case 'kickoff': { const d = ui.state.draft; if (dispatch({ type: 'COMMIT', starters: d.starters, prep: d.prep, tactic: d.tactic })) { ui.play = null; keepScroll = false; } break; }
    case 'skip': if (ui.play) { if (ui.play.timer) clearTimeout(ui.play.timer); ui.play.timer = null; ui.play.shown = CONFIG.possessionsPerTeam * 2; } break;
    case 'finish': if (dispatch({ type: 'FINISH_MATCH' })) keepScroll = false; break;
    case 'continue': if (dispatch({ type: 'CONTINUE' })) keepScroll = false; ui.devPick = null; break;
    case 'devpick': ui.devPick = { id, attr: b.dataset.attr }; break;
    case 'develop': if (ui.devPick && dispatch({ type: 'DEVELOP', playerId: ui.devPick.id, attr: ui.devPick.attr })) { ui.devPick = null; keepScroll = false; } break;
    case 'playcode': { const c = (document.getElementById('code').value || '').trim().toUpperCase(); if (!c) return; ui.modal = null; startSeason(c); return; }
    case 'copy': { const t = document.getElementById('savetext'); t.select(); try { navigator.clipboard.writeText(t.value); ui.notice = 'Save text copied.'; } catch (e) { document.execCommand && document.execCommand('copy'); } break; }
    case 'import': {
      const res = importText(document.getElementById('savetext').value);
      if (!res.ok) { ui.notice = res.error; break; }
      ui.state = res.state; persist(); ui.modal = null; ui.screen = 'game'; ui.notice = 'Save imported.'; keepScroll = false; break;
    }
  }
  render();
  window.scrollTo(0, keepScroll ? y : 0);
});

// ---------- boot ----------
(function boot() {
  if (KIT) KIT.studio();
  const { state, problem } = loadSave(LS);
  ui.state = state;
  if (problem) ui.notice = problem;
  render();
  if (KIT) {
    KIT.coach.create('one-more-season-first', [{ target: () => { const k = document.querySelector('[data-act=kickoff]'), r = k && k.getBoundingClientRect(); return r && r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r: Math.max(30, r.height / 2 + 8) } : null; }, done: () => !!ui.state && (ui.state.fixture > 0 || ui.state.phase !== 'prep' || ui.state.results.length > 0 || loadHistory(LS).length > 0) }], { when: () => ui.screen !== 'title' && !!ui.state && ui.state.phase === 'prep' && !ui.modal });
    KIT.wired('motion', 'possession pop and ball slide stop under Calm/Still (the game\'s own reduced-motion CSS now follows the kit Motion setting)');
    KIT.wired('text', 'page CSS scaled (dock button, starter toggles, attribute tiles, top bar and timeline labels capped at 125%; numbers inside the fatigue bar, odds bar and timeline cells fixed at 12-13px)');
  }
})();
