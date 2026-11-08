import { createLife, playCard, rerollPlans, petCat, resolveLifeEvent, chooseLifeUpgrade } from './sim/quarterlife.js';
import { renderLife, momentDialog, resultsDialog, helpDialog, journalDialog, icon } from './quarterlife-view.js';
import { createLifeStorage } from './quarterlife-storage.js';
import { downloadLifeRecap } from './quarterlife-share.js';

const root = document.getElementById('life-app');
const dialog = document.getElementById('life-dialog');
const announcement = document.getElementById('announcement');
const toast = document.createElement('div'); toast.id = 'life-toast'; document.body.append(toast);
let storage;
try { storage = window.localStorage; } catch { /* Private browsers can still play in memory. */ }
const saves = createLifeStorage(storage);
const saved = saves.load();
const freshSeed = () => { const values = new Uint32Array(1); crypto.getRandomValues(values); return values[0]; };
let state = saved || createLife(freshSeed());
let started = Boolean(saved), muted = true, audio = null, modal = '', toastTimer = null, lockedUntil = 0, deltas = {};

function tone(type = 'choice') {
  if (muted) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    const notes = type === 'combo' ? [392, 494, 587, 784] : type === 'cat' ? [330, 392, 330] : [330, 440];
    notes.forEach((frequency, i) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), time = audio.currentTime + i * .085;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.035, time + .012); gain.gain.exponentialRampToValueAtTime(.001, time + .25);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(time); oscillator.stop(time + .27);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { muted = true; }
}

function notify(message) {
  clearTimeout(toastTimer); toast.textContent = message; toast.classList.add('visible'); announcement.textContent = message;
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function render() { root.innerHTML = renderLife(state, { started, muted, warning: saves.warning, deltas }); }
function save() { if (started) saves.save(state); }

function openModal(type) {
  modal = type;
  dialog.innerHTML = type === 'help' ? helpDialog() : type === 'journal' ? journalDialog(state) : type === 'results' ? resultsDialog(state) : type === 'restart' ? `<button class="modal-close" data-action="close" aria-label="Keep playing">×</button><span class="eyebrow">A FRESH START</span><h2 id="modal-title">Another version of this month?</h2><p class="modal-lead">Your current autosave will be replaced. Your new month will have different plans and surprises.</p><div class="restart-actions"><button class="primary-button" data-action="new">Start a new month ${icon('arrow')}</button><button class="text-button" data-action="close">Keep this one</button></div><form id="seed-form" class="seed-form"><label for="month-seed">Have a month code? Try the same starting seed as a friend.</label><div><input id="month-seed" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="e.g. 26" aria-describedby="seed-error"><button type="submit" class="quiet-button">Play this month ${icon("arrow")}</button></div><p id="seed-error" role="status"></p></form>` : momentDialog(state);
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}

function closeModal() { if (dialog.open) dialog.close(); modal = ''; }

function syncMoment() {
  if (state.phase === 'event' || state.phase === 'upgrade') openModal('moment');
  else if (state.phase === 'ended') openModal('results');
  else { closeModal(); document.getElementById('plans-title')?.focus({ preventScroll: true }); }
}

function newMonth(same = false, chosenSeed = null) {
  const seed = chosenSeed ?? (same ? state.seed : freshSeed());
  closeModal(); state = createLife(seed); started = true; deltas = {}; save(); render();
  document.getElementById('plans-title')?.focus({ preventScroll: true }); window.scrollTo({ top: 0 });
  notify('A fresh month. You don’t have to do it perfectly.');
}

function act(action, data = {}) {
  if (['play', 'event', 'upgrade', 'new', 'same'].includes(action)) {
    if (performance.now() < lockedUntil) return;
    lockedUntil = performance.now() + 180;
  }
  if (action === 'start') { started = true; save(); render(); tone(); notify('One evening at a time. Pick your first plan.'); return; }
  if (action === 'help') { openModal('help'); return; }
  if (action === 'journal') { openModal('journal'); return; }
  if (action === 'results' && state.phase === 'ended') { openModal('results'); return; }
  if (action === 'download' && state.phase === 'ended') { downloadLifeRecap(state).then(ok => { if (ok) notify('Your month, saved as a little keepsake.'); }).catch(error => notify(error.message)); return; }
  if (action === 'close') { if (modal !== 'moment') { closeModal(); document.getElementById('plans-title')?.focus({ preventScroll: true }); } return; }
  if (action === 'restart') { if (started) openModal('restart'); else newMonth(); return; }
  if (action === 'seed') {
    const input = document.getElementById('month-seed'), raw = input?.value.trim() || '';
    if (!/^\d{1,10}$/.test(raw) || Number(raw) > 0xffffffff) {
      document.getElementById('seed-error').textContent = 'Use a whole-number month code from 0 to 4,294,967,295.';
      input?.focus(); return;
    }
    newMonth(false, Number(raw)); return;
  }
  if (action === 'new' || action === 'same') { newMonth(action === 'same'); return; }
  if (action === 'sound') { muted = !muted; tone(); render(); notify(muted ? 'Sound off. A quiet little life.' : 'Sound on. Tiny wins, tiny sounds.'); return; }
  if (!started) return;
  const before = { ...state.stats };
  let result;
  if (action === 'play') result = playCard(state, data.id);
  else if (action === 'reroll') result = rerollPlans(state);
  else if (action === 'pet') result = petCat(state);
  else if (action === 'event') result = resolveLifeEvent(state, Number(data.index));
  else if (action === 'upgrade') result = chooseLifeUpgrade(state, data.id);
  else return;
  if (!result.ok) { notify(result.error); return; }
  deltas = Object.fromEntries(Object.keys(before).map(key => [key, state.stats[key] - before[key]]));
  save(); render();
  if (action === 'pet') { tone('cat'); notify('Miso: purrrrr. +3 peace. No evening used.'); return; }
  if (action === 'reroll') { tone(); notify('New possibilities. −5 peace. Choose one or just rest.'); return; }
  clearTimeout(toastTimer); toast.classList.remove('visible');
  tone(result.combo || action === 'upgrade' ? 'combo' : 'choice');
  announcement.textContent = state.last ? `${state.last.title}. ${state.last.text}. Day ${state.day}. Cash ${state.stats.cash} dollars. Energy ${state.stats.energy}. Peace ${state.stats.peace}. Connection ${state.stats.social}.` : '';
  syncMoment();
}

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  act(button.dataset.action, button.dataset);
});

document.addEventListener('submit', event => {
  if (event.target.id === 'seed-form') { event.preventDefault(); act('seed'); }
});

dialog.addEventListener('cancel', event => { if (modal === 'moment') { event.preventDefault(); notify('Choose a response to keep your month moving.'); } else modal = ''; });

document.addEventListener('keydown', event => {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key.toLowerCase() === 'm' && !dialog.open) { event.preventDefault(); act('sound'); return; }
  if (!/^[1-4]$/.test(event.key)) return;
  const index = Number(event.key) - 1;
  if (dialog.open) {
    if (modal !== 'moment') return;
    const button = dialog.querySelectorAll('.event-options>button')[index];
    if (button && !button.disabled) { event.preventDefault(); button.click(); }
  } else if (started && state.phase === 'playing') {
    const id = index === 3 ? 'sleep' : state.hand[index];
    if (id) { event.preventDefault(); act('play', { id }); }
  }
});

render();
if (started && state.phase !== 'playing') syncMoment();
