import { HONK } from '../contracts.js';
import { createHonk, stepHonk, chooseHonkUpgrade, continueHonkOvertime, HONK_UPGRADES } from '../sim/honk.js';
import { HONK_MODES, HONK_INCIDENTS, HONK_AWARDS, HONK_TIES, honkReview } from '../sim/honk-content.js';
import { createHonkStorage, recordHonkResult } from './storage.js';
import { parseHonkOffice, honkDailyOffice } from './ui-utils.js';
import { createHonkRenderer } from './renderer.js';
import { createHonkAudio } from './audio.js';
import { createHonkInput } from './input.js';

const $ = id => document.getElementById(id);
const canvas = $('office'), renderer = createHonkRenderer(canvas), audio = createHonkAudio();
let browserStorage; try { browserStorage = window.localStorage; } catch { /* File/privacy modes may block storage. */ }
const careerStore = createHonkStorage(browserStorage);
let profile = careerStore.load(), mode = profile.settings.mode;
const query = new URLSearchParams(location.search), requested = parseHonkOffice(query.get('seed') || '');
let seed = requested?.seed ?? profile.lastSeed, daily = '';
if (requested) mode = requested.mode;
if (query.get('mode') === 'casual') mode = 'casual';
let state = createHonk(seed, { mode }), screen = 'title', paused = false, muted = profile.settings.muted;
let accumulator = 0, previous = performance.now(), lastPhase = '', uiTick = -1;
let runFrames = 0, maxFrameMs = 0, frameMsTotal = 0;
const controls = createHonkInput(), dialogPause = new Map();

function announce(text) { $('announcement').textContent = text; }
function clearInput() { controls.clear(); }
function setKey(code, pressed) { controls.setKey(code, pressed); }
function input() { return controls.sample(profile.settings.autoHonk); }
function syncPreferences() {
  muted = profile.settings.muted; audio.setMuted(muted);
  renderer.setPreferences({ reducedMotion: profile.settings.reducedMotion, tie: HONK_TIES.find(t => t.id === profile.settings.tie).color });
  document.body.classList.toggle('reduce-motion', profile.settings.reducedMotion);
  $('sound-button').textContent = muted ? 'SOUND: OFF' : 'SOUND: ON'; $('sound-button').setAttribute('aria-pressed', String(muted));
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  $('auto-honk').checked = profile.settings.autoHonk; $('reduced-motion').checked = profile.settings.reducedMotion;
  $('title-best').textContent = `BEST: ${profile.best[mode].toLocaleString()} · ${HONK_MODES[mode].description}`;
  const message = careerStore.status === 'protected' ? 'Existing career is protected. This session will not overwrite it.' : careerStore.status === 'session' ? 'Session only: browser storage is unavailable.' : 'Career records save here. Active workdays do not.';
  $('save-status').textContent = message; $('storage-notice').textContent = message;
}
function setPreference(key, value) {
  profile = careerStore.transact(p => { p.settings[key] = value; return p; }); syncPreferences();
}
function start({ same = false, today = false } = {}) {
  if (today) { const office = honkDailyOffice(); seed = office.seed; daily = office.day; mode = 'career'; }
  else if (!same) { daily = ''; if (screen !== 'title') seed = (seed + 7919) >>> 0; }
  if (same) mode = state.mode;
  state = createHonk(seed, { mode }); screen = 'playing'; paused = false; lastPhase = ''; uiTick = -1; accumulator = 0;
  runFrames = 0; maxFrameMs = 0; frameMsTotal = 0;
  clearInput(); renderer.reset(); audio.unlock(); document.body.classList.add('playing'); update(); canvas.focus({ preventScroll: true });
  announce('Workday started. Move with WASD. Hold Space to honk. Honk loose chairs to bowl.');
}
function clockOut() {
  screen = 'title'; paused = false; accumulator = 0; lastPhase = ''; daily = '';
  state = createHonk(seed, { mode }); clearInput(); renderer.reset(); document.body.classList.remove('playing'); update(); syncPreferences(); $('start-button').focus({ preventScroll: true });
}
function pause(value = !paused) {
  if (screen !== 'playing' || state.phase !== 'playing') return;
  paused = value; clearInput(); accumulator = 0;
  if (paused) audio.suspend(); else if (!muted) audio.unlock();
  $('pause-screen').hidden = !paused; $('pause-button').textContent = paused ? 'RESUME ▶' : 'PAUSE Ⅱ';
  if (!paused) canvas.focus({ preventScroll: true }); else $('resume-button').focus({ preventScroll: true });
}
function fillCareer() {
  $('career-totals').innerHTML = `<div><b>${profile.best.career.toLocaleString()}</b><span>CAREER BEST</span></div><div><b>${profile.best.casual.toLocaleString()}</b><span>CASUAL BEST</span></div><div><b>${profile.wins} / ${profile.runs}</b><span>CEOS / CAREERS</span></div>`;
  $('tie-select').replaceChildren(...HONK_TIES.map(tie => {
    const option = document.createElement('option'); option.value = tie.id; option.textContent = tie.name + (tie.award && !profile.awards.includes(tie.award) ? ' · LOCKED' : '');
    option.disabled = Boolean(tie.award && !profile.awards.includes(tie.award)); option.selected = tie.id === profile.settings.tie; return option;
  }));
  $('award-grid').innerHTML = HONK_AWARDS.map(a => `<article class="award ${profile.awards.includes(a.id) ? 'earned' : ''}"><span>${profile.awards.includes(a.id) ? '✓' : a.icon}</span><div><b>${a.name}</b><p>${a.description}</p></div></article>`).join('');
  $('seed-form').hidden = screen === 'playing' && ['playing', 'promotion'].includes(state.phase);
  syncPreferences();
}
function openDialog(id) {
  if (id === 'career-dialog') fillCareer();
  dialogPause.set(id, paused); pause(true); $(id).showModal();
}
function finishRun(phase) {
  const oldAwards = [...profile.awards];
  profile = careerStore.transact(p => recordHonkResult(p, state)); syncPreferences();
  const report = honkReview(state), newAwards = profile.awards.filter(id => !oldAwards.includes(id));
  document.body.classList.remove('playing');
  $('end-kicker').textContent = phase === 'won' ? state.overtime ? 'THE REWARD FOR GOOD WORK IS MORE WORK.' : 'THE AMERICAN DREAM, BUT WITH A BEAK.' : 'THANK YOU FOR YOUR SERVICE. PLEASE LEAVE.';
  $('end-title').innerHTML = phase === 'won' ? state.overtime ? `Overtime ${state.overtime}.<br><em>Still a goose.</em>` : 'Chief Executive<br><em>Goose.</em>' : 'Promoted to<br><em>customer.</em>';
  $('end-copy').textContent = phase === 'won' ? 'HR has been outsourced. The company is now a pond. Shareholders are thrilled.' : state.headline + (state.player.hp <= 0 ? ' Lunch heals. Dash through danger. Casual Friday has more breathing room.' : ' Stay near HR, keep honking, and save Reply All for the final interview.');
  $('review').innerHTML = `<div class="total"><b>${state.score.toLocaleString()}</b><span>PRODUCTIVITY*</span></div><div><b>${state.stats.meetings}</b><span>MEETINGS CANCELLED</span></div><div><b>${state.stats.chairHits}</b><span>CHAIR-BASED FEEDBACK</span></div><div><b>${report.minutesReturned}</b><span>MEETING MINUTES RETURNED</span></div><div><b>${state.stats.lunches}</b><span>LUNCHES ACQUIRED</span></div><div><b>+${state.winBonus}</b><span>EARLY CLOCK-OUT BONUS</span></div>`;
  $('review-quote').textContent = report.comment;
  $('new-awards').replaceChildren(...newAwards.map(id => { const a = HONK_AWARDS.find(award => award.id === id), tag = document.createElement('span'); tag.textContent = `✓ ${a.name}`; return tag; }));
  $('overtime-button').hidden = phase !== 'won';
  $('best').textContent = `${HONK_MODES[state.mode].name.toUpperCase()} BEST: ${profile.best[state.mode].toLocaleString()} · OFFICE: ${report.code}${daily ? ` · DAILY ${daily}` : ''}`;
  $('copy-button').textContent = 'COPY OFFICE CODE'; $('again-button').focus({ preventScroll: true });
  announce(`${phase === 'won' ? 'You won. Chief Executive Goose.' : 'Career ended.'} Score ${state.score}. ${newAwards.length} new awards.`);
}
function update() {
  const phase = screen === 'title' ? 'title' : state.phase, active = phase === 'playing';
  $('title-screen').hidden = screen !== 'title'; $('pause-button').hidden = !active;
  $('pause-screen').hidden = !paused || !active; $('promotion-screen').hidden = phase !== 'promotion'; $('end-screen').hidden = phase !== 'won' && phase !== 'lost';
  $('action-hud').hidden = !active; $('pause-button').textContent = paused ? 'RESUME ▶' : 'PAUSE Ⅱ';
  $('rank').textContent = state.overtime ? `OVERTIME ${state.overtime} / NO ADDITIONAL PAY` : `${String(state.shift).padStart(2, '0')} / ${['PROBATIONARY GOOSE', 'MIDDLE MISMANAGEMENT', 'HOSTILE TAKEOVER'][state.shift - 1]}`;
  document.querySelectorAll('.career-track i').forEach((el, i) => el.classList.toggle('active', i < state.shift));
  $('health').innerHTML = Array.from({ length: state.player.maxHp }, (_, i) => `<span${i >= state.player.hp ? ' class="empty"' : ''}>♥</span>`).join(' ');
  $('health').setAttribute('aria-label', `Health: ${state.player.hp} out of ${state.player.maxHp}`);
  $('score').textContent = String(state.score).padStart(6, '0'); $('charge').style.width = `${state.charge}%`;
  $('charge-label').textContent = state.charge >= 100 ? 'READY · RUIN EVERYONE’S DAY' : `${state.charge}% · BUILD THROUGH CHAOS`;
  document.querySelector('.reply-box').classList.toggle('ready', state.charge >= 100);
  $('dash-state').textContent = state.player.dashCooldown ? `DASH ${(state.player.dashCooldown / 60).toFixed(1)}s` : 'DASH READY';
  $('dash-fill').style.width = `${(1 - state.player.dashCooldown / state.player.dashRate) * 100}%`;
  $('reply-state').textContent = state.charge >= 100 ? 'REPLY ALL READY' : `REPLY ALL ${state.charge}%`; $('reply-fill').style.width = `${state.charge}%`;
  const touchReply = document.querySelector('[data-key="KeyE"]'); touchReply.classList.toggle('ready', state.charge >= 100); touchReply.setAttribute('aria-label', `Reply All: ${state.charge >= 100 ? 'ready' : state.charge + ' percent charged'}`);
  const remain = Math.max(0, Math.ceil((HONK.shiftTicks[state.shift - 1] - state.shiftTick) / 60));
  $('timer').textContent = `${String(Math.floor(remain / 60)).padStart(2, '0')}:${String(remain % 60).padStart(2, '0')}`;
  $('objective').textContent = phase === 'title' ? 'TODAY’S KPI: CAUSE A PROBLEM.' : state.shift === 3 ? state.bossSpawned ? 'FINAL KPI: DEFEAT HUMAN RESOURCES.' : `HR ARRIVES IN ${Math.max(0, (state.overtime ? 4 : 10) - Math.floor(state.shiftTick / 60))}s. PREPARE YOUR RESIGNATION.` : state.objectiveDone ? '✓ KPI MET. +500 POINTS. SUSPICIOUSLY PROMOTABLE.' : state.shift === 1 ? `OPTIONAL KPI: BREAK OFFICE STUFF ${state.shiftStats.objects}/3` : `OPTIONAL KPI: CANCEL MEETINGS ${state.shiftStats.meetings}/10`;
  $('combo').innerHTML = state.combo >= 4 && active ? `×${state.multiplier}<small>${state.combo} INCIDENTS. ONE GOOSE.</small>` : '';
  $('headline').textContent = state.headline;
  const boss = state.enemies.find(e => e.kind === 'boss' && e.hp > 0);
  $('boss-hud').hidden = !boss || !active;
  if (boss) { $('boss-health').style.width = `${boss.hp / boss.maxHp * 100}%`; $('boss-phase').textContent = ['01 / WE’RE LIKE A FAMILY.', '02 / PERFORMANCE IMPROVEMENT PLAN', '03 / EXIT INTERVIEW'][boss.bossPhase - 1]; }
  $('incident').hidden = !state.incident || !active;
  if (state.incident) {
    const incident = HONK_INCIDENTS[state.incident.id]; $('incident-title').textContent = incident.title; $('incident-detail').textContent = incident.description;
    $('incident-time').style.width = `${state.incident.remaining / incident.duration * 100}%`;
  }
  if (phase !== lastPhase) {
    clearInput();
    if (phase === 'promotion') {
      document.body.classList.remove('playing');
      $('promotion-copy').textContent = state.shift === 1 ? 'Your manager called you “disruptive.” Apparently that’s good.' : 'The board wants fresh leadership. You are technically poultry.';
      $('upgrades').replaceChildren(...state.offers.map((id, i) => {
        const upgrade = HONK_UPGRADES.find(u => u.id === id), button = document.createElement('button'); button.className = 'upgrade'; button.dataset.upgrade = id;
        button.innerHTML = `<span class="upgrade-num">0${i + 1} ↗</span><b>${upgrade.name}</b><span>${upgrade.detail}</span><em>“${upgrade.joke}”</em>`;
        button.addEventListener('click', () => {
          if (!chooseHonkUpgrade(state, id)) return;
          clearInput(); accumulator = 0; document.body.classList.add('playing'); audio.unlock(); renderer.consume(state.events); update(); canvas.focus({ preventScroll: true });
        }); return button;
      }));
      $('upgrades').firstElementChild?.focus({ preventScroll: true }); announce('Promoted. Choose one of three upgrades. Number keys 1, 2, and 3 also work.');
    }
    if (phase === 'won' || phase === 'lost') finishRun(phase);
    lastPhase = phase;
  }
}

$('start-button').addEventListener('click', () => start()); $('daily-button').addEventListener('click', () => start({ today: true }));
$('again-button').addEventListener('click', () => start()); $('same-button').addEventListener('click', () => start({ same: true })); $('home-button').addEventListener('click', clockOut);
$('overtime-button').addEventListener('click', () => {
  if (!continueHonkOvertime(state)) return;
  clearInput(); paused = false; accumulator = 0; document.body.classList.add('playing'); renderer.reset(); audio.unlock(); update(); canvas.focus({ preventScroll: true });
});
$('pause-button').addEventListener('click', () => pause()); $('resume-button').addEventListener('click', () => pause(false));
$('quit-button').addEventListener('click', clockOut);
$('sound-button').addEventListener('click', () => { setPreference('muted', !muted); if (!muted && !paused) audio.unlock(); });
$('help-button').addEventListener('click', () => openDialog('help-dialog'));
$('career-button').addEventListener('click', () => openDialog('career-dialog')); $('pause-options').addEventListener('click', () => openDialog('career-dialog'));
for (const [id, buttons] of [['help-dialog', ['close-help', 'help-done']], ['career-dialog', ['close-career', 'career-done']]]) {
  for (const button of buttons) $(button).addEventListener('click', () => $(id).close());
  $(id).addEventListener('close', () => { if (!dialogPause.get(id)) pause(false); });
}
for (const button of document.querySelectorAll('[data-mode]')) button.addEventListener('click', () => { mode = button.dataset.mode; setPreference('mode', mode); state = createHonk(seed, { mode }); update(); });
$('auto-honk').addEventListener('change', event => { clearInput(); setPreference('autoHonk', event.target.checked); });
$('reduced-motion').addEventListener('change', event => setPreference('reducedMotion', event.target.checked));
$('tie-select').addEventListener('change', event => {
  const tie = HONK_TIES.find(t => t.id === event.target.value);
  if (tie && (!tie.award || profile.awards.includes(tie.award))) setPreference('tie', tie.id);
});
$('seed-form').addEventListener('submit', event => {
  event.preventDefault(); const office = parseHonkOffice($('office-code').value);
  if (!office) { $('seed-message').textContent = 'Use a code like G-7321-C (Career) or G-7321-F (Casual Friday).'; return; }
  if (screen === 'playing' && ['playing', 'promotion'].includes(state.phase)) return;
  seed = office.seed; mode = office.mode; setPreference('mode', mode); $('seed-message').textContent = 'Office loaded. Clock in when ready.'; $('career-dialog').close(); clockOut();
});
$('copy-button').addEventListener('click', async () => {
  const code = honkReview(state).code;
  try { await navigator.clipboard.writeText(code); $('copy-button').textContent = `COPIED ${code}`; }
  catch { $('copy-button').textContent = code; announce(`Office code ${code}. Copy it from the performance review.`); }
});
window.addEventListener('keydown', event => {
  if ($('help-dialog').open || $('career-dialog').open) return;
  const modal = document.querySelector('.modal-overlay:not([hidden])');
  if (modal && event.key === 'Tab') {
    const buttons = [...modal.querySelectorAll('button:not([hidden]):not(:disabled)')], first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first?.focus(); }
    return;
  }
  if (event.code === 'Escape' || event.code === 'KeyP') { if (!event.repeat) pause(); return; }
  if (state.phase === 'promotion' && !event.repeat && /^Digit[123]$/.test(event.code)) { $('upgrades').children[Number(event.code.slice(-1)) - 1]?.click(); return; }
  if (screen !== 'playing' || paused || state.phase !== 'playing') { if (event.repeat && event.code === 'Space') event.preventDefault(); return; }
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(event.code)) event.preventDefault();
  setKey(event.code, true);
});
window.addEventListener('keyup', event => setKey(event.code, false));
canvas.addEventListener('pointerdown', event => { if (event.button !== 0 || event.pointerType === 'touch' || screen !== 'playing' || paused || state.phase !== 'playing') return; controls.setPointerHonk(true); canvas.setPointerCapture(event.pointerId); audio.unlock(); });
window.addEventListener('pointerup', () => controls.setPointerHonk(false)); canvas.addEventListener('pointercancel', clearInput); canvas.addEventListener('lostpointercapture', () => controls.setPointerHonk(false));
for (const button of document.querySelectorAll('[data-key]')) {
  button.addEventListener('pointerdown', event => { if (screen !== 'playing' || paused || state.phase !== 'playing') return; event.preventDefault(); button.setPointerCapture(event.pointerId); setKey(button.dataset.key, true); audio.unlock(); });
  const release = event => { event.preventDefault(); setKey(button.dataset.key, false); }; button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
}
window.addEventListener('blur', () => { clearInput(); pause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); pause(true); } });
function frame(now) {
  const elapsed = Math.max(0, now - previous), dt = Math.min(elapsed / 1000, .1); previous = now;
  if (screen === 'playing' && !paused && state.phase === 'playing' && !$('help-dialog').open && !$('career-dialog').open) {
    runFrames++; maxFrameMs = Math.max(maxFrameMs, elapsed); frameMsTotal += elapsed; accumulator += dt;
    while (accumulator >= 1 / HONK.rate && state.phase === 'playing') {
      const events = stepHonk(state, input()); renderer.consume(events); audio.consume(events); accumulator -= 1 / HONK.rate;
      for (const event of events) if (event.type === 'incident') announce(HONK_INCIDENTS[event.id].title + '. ' + HONK_INCIDENTS[event.id].description);
    }
  } else accumulator = 0;
  if (state.tick - uiTick >= 6 || state.phase !== lastPhase && screen !== 'title') { update(); uiTick = state.tick; }
  renderer.render(state, dt, screen === 'title', now / 1000); requestAnimationFrame(frame);
}
// Snapshots are copies. Tests send real input; no world-write or force-win API exists.
window.__honk = Object.freeze({ inspect: () => structuredClone({ ...state, screen, paused, muted, daily, storageStatus: careerStore.status }),
  profile: () => structuredClone(profile), performance: () => ({ frames: runFrames, averageFrameMs: runFrames ? frameMsTotal / runFrames : 0, maxFrameMs }) });
syncPreferences(); update(); requestAnimationFrame(frame);
