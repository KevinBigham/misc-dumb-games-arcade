import { LIGHT } from './contracts.js';
import { createLight, stepLight, chooseLight, finishLight, protectMemory, keptMemories, nextMemory, availableChoices, epitaph, waveLength } from './sim/last-light.js';
import { NIGHT_NAMES, NIGHT_LINES, PROMISES } from './sim/last-light-data.js';
import { createLightRenderer } from './last-light-renderer.js';
import { createLightAudio } from './last-light-audio.js';
import { createLightStorage, makeLightCheckpoint, restoreLightCheckpoint } from './last-light-storage.js';
import { promiseSummary, lightRecord, describeLightRecord } from './sim/last-light-story.js';
import { promiseMarkup, councilMarkup, resultMarkup, historyMarkup, ledgerMarkup } from './last-light-view.js';

const $ = id => document.getElementById(id);
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const overlay = $('overlay'), canvas = $('arena');
const renderer = createLightRenderer(canvas), hero = createLightRenderer($('hero-canvas'), true), audio = createLightAudio();
let browserStorage = null;
try { browserStorage = window.localStorage; } catch { /* Temporary play still works. */ }
const storage = createLightStorage(browserStorage), profile = storage.load();
let world = null, preview = createLight(42), paused = false, muted = profile.settings.muted, screen = '', previousTime = 0, accumulator = 0, memorySignature = '', hudTick = -1, toastUntil = 0, bannerUntil = 0;
let reviewReturn = 'pause', ledgerReturn = 'pause', pendingStart = null, recordedId = null, previousRecord = null;
let reduced = profile.settings.reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const keys = new Set();
let queuedDash = false, queuedPulse = false, pointer = { down: false, x: 550, y: 200 }, touchOrigin = null;
const seedFromUrl = new URLSearchParams(location.search).get('seed');
function newSeed() { const values = new Uint32Array(1); if (window.crypto?.getRandomValues) { crypto.getRandomValues(values); return values[0]; } return Date.now() >>> 0; }
function clearInput() { keys.clear(); pointer.down = false; touchOrigin = null; queuedDash = false; queuedPulse = false; }
function showToast(text, seconds = 3.2) { $('toast').textContent = text; $('toast').classList.add('visible'); toastUntil = performance.now() + seconds * 1000; }
function displayModal(html, type) {
  screen = type; clearInput(); overlay.innerHTML = html;
  if (!overlay.open) overlay.showModal();
  overlay.querySelector('button:not(:disabled)')?.focus();
}
function closeModal() { if (overlay.open) overlay.close(); screen = ''; accumulator = 0; clearInput(); if (world) canvas.focus({ preventScroll: true }); }
function start(seed, mode, promise = 'none') {
  closeModal(); clearInput(); audio.reset(); audio.unlock();
  world = createLight(seed, mode, promise); recordedId = null; previousRecord = null; renderer.reset(); paused = false; accumulator = 0; memorySignature = ''; hudTick = -1;
  $('intro').hidden = true; $('game').hidden = false;
  saveCheckpoint(); showWave(); updateHud(true); canvas.focus({ preventScroll: true });
  showToast('Find a green signal. Get close, then lead them into the light.', 5);
}
function updateSaveUI() {
  $('resume-saved').hidden = !profile.checkpoint;
  if (profile.checkpoint) $('resume-saved').textContent = `RESUME NIGHT ${profile.checkpoint.world.wave} ${profile.checkpoint.world.phase === 'council' ? 'COUNCIL' : profile.checkpoint.world.phase === 'ending' ? 'FINAL DECISION' : 'CHECKPOINT'} ↗`;
  $('history-count').textContent = profile.history.length;
  $('save-note').textContent = storage.error || 'Checkpoints save between nights. Everything stays on this device.';
  $('save-note').classList.toggle('critical', Boolean(storage.error));
  if (world) {
    $('checkpoint-status').textContent = storage.error ? 'TEMPORARY / SAVE UNAVAILABLE' : profile.checkpoint ? `NIGHT ${profile.checkpoint.world.wave} CHECKPOINT` : 'ENDING RECORDED';
    $('checkpoint-status').title = storage.error || 'Reloading resumes from the latest night start or council.';
  }
}
function persistProfile() { const ok = storage.save(profile); updateSaveUI(); return ok; }
function saveCheckpoint() {
  if (!world) return false;
  const checkpoint = makeLightCheckpoint(world);
  if (!checkpoint) return false;
  profile.checkpoint = checkpoint; return persistProfile();
}
function requestStart(seed, mode) {
  pendingStart = { seed: Number(seed) >>> 0, mode };
  let markup = promiseMarkup(pendingStart.seed, mode);
  if (profile.checkpoint) markup = markup.replace('A promise changes no stats.', `Starting a new run replaces your saved night ${profile.checkpoint.world.wave} checkpoint. A promise changes no stats.`);
  displayModal(markup, 'promise');
}
function selectPromise(id) {
  if (!pendingStart || !PROMISES.some(promise => promise.id === id)) return;
  const { seed, mode } = pendingStart; pendingStart = null; start(seed, mode, id);
}
function returnHome() {
  closeModal(); world = null; paused = false; audio.suspend(); renderer.reset();
  $('game').hidden = true; $('intro').hidden = false; updateSaveUI(); $('begin').focus();
}
function resumeSaved() {
  const restored = restoreLightCheckpoint(profile.checkpoint);
  if (!restored) { showToast('This checkpoint could not be restored. The saved data was preserved.'); return; }
  closeModal(); world = restored; paused = false; recordedId = null; previousRecord = null;
  accumulator = 0; memorySignature = ''; hudTick = -1; renderer.reset(); audio.reset(); audio.unlock();
  $('intro').hidden = true; $('game').hidden = false; updateHud(true); updateSaveUI(); showWave();
  if (world.phase === 'council') presentCouncil();
  else if (world.phase === 'ending') presentEnding();
  else { canvas.focus({ preventScroll: true }); showToast('CHECKPOINT RESTORED / This night begins again.', 4); }
}
function recordEnding() {
  if (recordedId) return;
  previousRecord = profile.history.find(record => record.seed === world.seed && record.mode === world.mode) || null;
  recordedId = `${world.seed}-${Date.now()}-${profile.revision}`;
  const record = { ...lightRecord(world), id: recordedId, completedAt: new Date().toISOString() };
  profile.history = [record, ...profile.history].slice(0, 12); profile.checkpoint = null; persistProfile();
}
function downloadRecord() {
  const blob = new Blob([describeLightRecord(world)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = `The_Last_Light_World_${world.seed}.txt`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function showLedger() {
  ledgerReturn = screen || 'playing';
  if (world.phase === 'playing') { paused = true; audio.suspend(); }
  displayModal(ledgerMarkup(world), 'ledger');
}
function backFromLedger() {
  if (ledgerReturn === 'council') presentCouncil();
  else if (ledgerReturn === 'pause') { closeModal(); paused = false; pause(); }
  else resume();
}
function showWave() {
  const n = world.wave;
  $('night-number').textContent = `NIGHT ${String(n).padStart(2, '0')} / 05`;
  $('night-name').textContent = NIGHT_NAMES[n - 1];
  $('run-mode').textContent = world.mode.toUpperCase();
  $('wave-banner').innerHTML = `<span>NIGHT ${String(n).padStart(2, '0')} / 05</span><h2>${NIGHT_NAMES[n - 1]}</h2><p>${NIGHT_LINES[n - 1]}</p>`;
  $('wave-banner').hidden = false; bannerUntil = performance.now() + 3500;
}
function updateHud(force = false) {
  if (!world || (!force && world.tick - hudTick < 6)) return;
  hudTick = world.tick;
  const p = world.player, b = world.beacon;
  $('health-number').textContent = Math.ceil(p.hp); $('archive-number').textContent = Math.ceil(b.hp);
  $('health-bar').style.width = `${p.hp}%`; $('archive-bar').style.width = `${b.hp}%`;
  $('health-number').classList.toggle('critical', p.hp < 25); $('archive-number').classList.toggle('critical', b.hp < 25);
  const seconds = Math.max(0, Math.ceil((waveLength(world) - world.waveTick) / LIGHT.hz));
  $('timer').textContent = seconds > 0 ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'BOSS';
  $('timer').classList.toggle('critical', seconds < 10);
  $('rescued-number').textContent = String(world.stats.rescued).padStart(2, '0');
  $('combo-number').textContent = world.combo >= 8 ? `${Math.min(5, 1 + Math.floor(world.combo / 8))}×` : world.stats.kills;
  $('combo-label').textContent = world.combo >= 8 ? 'COMBO MULTIPLIER' : 'THREATS ENDED';
  $('dash-ready').textContent = p.dashCooldown ? `${(p.dashCooldown / 60).toFixed(1)}s` : 'READY';
  $('pulse-ready').textContent = p.pulseCooldown ? `${(p.pulseCooldown / 60).toFixed(1)}s` : '−1 MEMORY';
  $('dash').disabled = p.dashCooldown > 0; $('pulse').disabled = p.pulseCooldown > 0 || !nextMemory(world);
  const followers = world.people.filter(person => person.following).length;
  $('escort-status').textContent = followers ? `${followers} FOLLOWING YOU · Get them to the center before dawn.` : seconds <= 10 && world.people.length ? `${world.people.length} STILL OUTSIDE · Bring them home before dawn.` : `${world.people.length} SIGNALS OUTSIDE · Go out. Bring them home.`;
  const promise = promiseSummary(world);
  $('promise-status').textContent = promise.id === 'none' ? promise.status : `${promise.short.toUpperCase()} / ${promise.status}`;
  $('promise-status').classList.toggle('critical', world.promise.broken);
  $('salvage-count').textContent = p.salvage;
  updateMemories();
}
function updateMemories() {
  const signature = `${world.memories.length}/${world.stats.burned}/${world.protectedId}`;
  if (signature === memorySignature) return;
  memorySignature = signature;
  $('memory-number').textContent = keptMemories(world).length;
  $('burned-number').textContent = world.stats.burned;
  const focusId = document.activeElement?.dataset?.protect;
  $('memories').innerHTML = [...world.memories].reverse().map(memory => `<article class="memory-card ${memory.status === 'burned' ? 'burned' : ''}"><div class="person"><div>${escape(memory.name)}<small>${escape(memory.role)}</small></div>${memory.status === 'kept' ? `<button class="protect" data-protect="${memory.id}" aria-label="${world.protectedId === memory.id ? 'Unprotect' : 'Protect'} ${escape(memory.name)}’s memory" aria-pressed="${world.protectedId === memory.id}">${world.protectedId === memory.id ? '◆' : '◇'}</button>` : '<span class="burned-label">BURNED</span>'}</div><blockquote>${memory.status === 'burned' ? '[ A person is still here. This memory is not. ]' : `“${escape(memory.text)}”`}</blockquote></article>`).join('');
  if (focusId) $('memories').querySelector(`[data-protect="${focusId}"]`)?.focus({ preventScroll: true });
  const next = nextMemory(world);
  $('sacrifice-preview').innerHTML = next ? `NEXT PULSE WILL ERASE<br><strong>${escape(next.name)}’s memory.</strong> ${escape(next.text.split('.')[0])}.` : 'NO UNPROTECTED MEMORIES.<br>The pulse has no fuel.';
}
function presentCouncil() { displayModal(councilMarkup(world), 'council'); }
function presentEnding() {
  displayModal(`<div class="dialog-top"><span>DAWN / THE LAST DECISION</span><span>THE EDITOR IS GONE.</span></div><h2 id="dialog-title">Who owns what we remember?</h2><p class="dialog-deck">${world.stats.rescued} people made it. The archive holds ${keptMemories(world).length} memories. Its final function is a broadcast: send every remaining memory into the world, then erase the central copy. The people will still remember. The machine will not.</p><div class="choice-grid ending-choices"><button class="choice-card" data-ending="release"><span class="choice-tag">DISTRIBUTE THE MEMORY</span><h3>Give the stories back.</h3><p>Broadcast the archive. Anyone can carry these stories, change them, lose them, or make something new from them.</p><span class="effect">No central copy. No one holds the key.</span></button><button class="choice-card" data-ending="keep"><span class="choice-tag">PRESERVE THE MEMORY</span><h3>Keep a light burning.</h3><p>Keep the archive intact. The original stories remain protected. So does the power to decide who can reach them.</p><span class="effect">The record survives. You remain its keeper.</span></button></div><p class="dialog-note">There is no morality score. There is only what happened, and what you make of it.</p>`, 'ending');
}
function presentResult() { recordEnding(); displayModal(resultMarkup(world, previousRecord), 'result'); }
function pause() {
  if (!world || world.phase !== 'playing' || paused || overlay.open) return;
  paused = true; audio.suspend();
  displayModal(`<div class="dialog-top"><span>A MOMENT TO BREATHE</span><span>NIGHT ${world.wave} / 05</span></div><h2 id="dialog-title">The dark can wait.</h2><p class="dialog-deck pause-copy">Auto-fire handles the nearest threat. You choose where to go. Rescue green signals, then lead them into the archive. Space dashes through danger and damages enemies. Gold sparks repair the archive when you bring them home. E burns the next unprotected memory to clear the arena.</p><div class="dialog-actions"><button class="button primary" data-action="resume">BACK TO THE LIGHT ↗</button><button class="button" data-action="review">REVIEW MEMORIES ◇</button><button class="button" data-action="help">HOW TO PLAY</button><button class="button" data-action="ledger">THE LEDGER</button><button class="button" data-action="checkpoint-home">RETURN TO TITLE / KEEP CHECKPOINT</button><button class="button" data-action="restart-confirm">RESTART THIS WORLD</button></div><p class="dialog-note">ESC TO RESUME · THE SIMULATION IS PAUSED · RELOADING RESTARTS THIS NIGHT FROM ITS CHECKPOINT</p>`, 'pause');
}
function reviewMemories(from = screen) {
  if (from !== 'review') reviewReturn = from;
  const next = nextMemory(world);
  displayModal(`<div class="dialog-top"><span>THE HUMAN RECORD / TIME IS PAUSED</span><span>${keptMemories(world).length} MEMORIES KEPT</span></div><h2 id="dialog-title">Choose what is irreplaceable.</h2><p class="dialog-deck">Protect one memory. Every pulse and memory-powered upgrade skips it. ${next ? `The next sacrifice would be ${escape(next.name)}’s story.` : 'No unprotected stories remain.'}</p><div class="review-list">${world.memories.map(memory => `<article class="memory-card ${memory.status === 'burned' ? 'burned' : ''}"><div class="person"><div>${escape(memory.name)}<small>${escape(memory.role)}</small></div>${memory.status === 'kept' ? `<button class="protect" data-protect="${memory.id}" aria-label="${world.protectedId === memory.id ? 'Unprotect' : 'Protect'} ${escape(memory.name)}’s memory" aria-pressed="${world.protectedId === memory.id}">${world.protectedId === memory.id ? '◆' : '◇'}</button>` : '<span class="burned-label">ERASED</span>'}</div><blockquote>${memory.status === 'burned' ? '[ A person is still here. This memory is not. ]' : `“${escape(memory.text)}”`}</blockquote></article>`).join('')}</div><div class="dialog-actions"><button class="button primary" data-action="back-review">${reviewReturn === 'council' ? 'RETURN TO THE COUNCIL' : 'RETURN TO PAUSE'} ↗</button></div>`, 'review');
}
function backFromReview() {
  if (reviewReturn === 'council') presentCouncil();
  else { closeModal(); paused = false; pause(); }
}
function resume() { paused = false; closeModal(); audio.unlock(); }
function help() {
  if (world && !['playing'].includes(world.phase)) return;
  if (world) paused = true;
  audio.suspend();
  displayModal(`<div class="dialog-top"><span>FIELD NOTES / THE KEEPER</span><span>~6 MINUTES · FIVE NIGHTS</span></div><h2 id="dialog-title">Keep the light. Keep each other.</h2><div class="help-grid"><div><h3>01. Find them.</h3><p>Move with <b>WASD or the arrow keys</b>. Touch a green person to recruit them. Lead up to three people into the center light. Anyone still outside at dawn is left behind. On touch screens, drag on the arena to move.</p></div><div><h3>02. Fight the dark.</h3><p>Your weapon <b>fires automatically</b> at nearby enemies. Hold the mouse button to aim manually. <b>Space</b> dashes, makes you briefly invulnerable, and damages enemies you pass through. Collect gold sparks and return them to the archive for repairs. Red diamonds and hexagons attack the archive. Wardens scan strangers: interrupt them before their ring fills.</p></div><div><h3>03. Know the cost.</h3><p><b>E</b> burns one unprotected memory to destroy ordinary enemies and damage the boss. The person survives. Their story is erased from the record. Click <b>◇</b> to protect one memory. The next sacrifice is shown below the record.</p></div><div><h3>04. Reach the morning.</h3><p>Survive five nights and defeat the Editor. Stay in the central light to heal; dawn restores 25 health. Choose an upgrade between nights. <b>Escape / P</b> pauses. Story mode reduces damage and enemy pressure. The Editor locks red warning lines before firing. Step aside or dash across. No timer runs while you choose.</p></div></div><div class="dialog-actions"><button class="button primary" data-action="close-help">${world ? 'RETURN TO THE LIGHT' : 'I’M READY'} ↗</button></div><p class="dialog-note">KEYBOARD + MOUSE RECOMMENDED · M TO MUTE · RELOADING RESUMES YOUR LATEST NIGHT START OR COUNCIL</p>`, 'help');
}
function actionEvents(events) {
  renderer.consume(events); audio.consume(events);
  const burned = events.filter(e => e.type === 'burn');
  if (burned.length) { showToast(`${world.promise.broken && world.promise.tick === world.tick ? 'PROMISE BROKEN / ' : ''}ERASED: ${burned.map(e => e.name).join(' + ')} — “${burned[0].text}”`, 6); return; }
  const promise = events.find(e => e.type === 'promise-broken');
  if (promise) { showToast(`PROMISE BROKEN / ${promise.text}`, 6); return; }
  const lost = events.find(e => e.type === 'person-lost');
  if (lost) { showToast(`${lost.name.toUpperCase()} / Their signal has gone silent.`, 4); return; }
  const notice = events.find(e => e.type === 'boss-phase' || e.type === 'notice');
  if (notice) { showToast(notice.text, 4.5); return; }
  const follow = events.find(e => e.type === 'follow');
  if (follow) showToast(`${follow.name} is following. Bring them into the center light.`, 2.4);
}
function selectChoice(choiceId) {
  if (!chooseLight(world, choiceId)) return;
  actionEvents(world.events); saveCheckpoint(); closeModal(); showWave(); updateHud(true); audio.unlock();
}
$('begin').addEventListener('click', () => requestStart(seedFromUrl === null ? newSeed() : seedFromUrl, document.querySelector('input[name="mode"]:checked').value));
$('resume-saved').addEventListener('click', resumeSaved);
$('history').addEventListener('click', () => displayModal(historyMarkup(profile.history), 'history'));
$('daily').addEventListener('click', () => { const today = new Date(); const seed = Number(`${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`); requestStart(seed, document.querySelector('input[name="mode"]:checked').value); });
$('ledger').addEventListener('click', showLedger);
$('pause').addEventListener('click', pause);
$('help').addEventListener('click', help);
$('dash').addEventListener('click', () => { queuedDash = true; canvas.focus({ preventScroll: true }); });
$('pulse').addEventListener('click', () => { queuedPulse = true; canvas.focus({ preventScroll: true }); });
$('sound').addEventListener('click', toggleSound);
function toggleSound() { muted = !muted; audio.setMuted(muted); if (!muted && !paused && !overlay.open) audio.unlock(); $('sound').innerHTML = `SOUND ${muted ? 'OFF' : 'ON'} <span aria-hidden="true">${muted ? '×' : '◖))'}</span>`; $('sound').setAttribute('aria-pressed', String(muted)); profile.settings.muted = muted; persistProfile(); }
function setMotion() { renderer.setReducedMotion(reduced); hero.setReducedMotion(reduced); document.body.classList.toggle('reduced-motion', reduced); $('motion').textContent = `REDUCED MOTION: ${reduced ? 'ON' : 'OFF'}`; $('motion').setAttribute('aria-pressed', String(reduced)); }
$('motion').addEventListener('click', () => { reduced = !reduced; setMotion(); profile.settings.reducedMotion = reduced; persistProfile(); }); setMotion();
audio.setMuted(muted); $('sound').innerHTML = `SOUND ${muted ? 'OFF' : 'ON'} <span aria-hidden="true">${muted ? '×' : '◖))'}</span>`; $('sound').setAttribute('aria-pressed', String(muted)); updateSaveUI();
$('memories').addEventListener('click', event => { const button = event.target.closest('[data-protect]'); if (button && protectMemory(world, Number(button.dataset.protect))) { updateMemories(); saveCheckpoint(); showToast(world.protectedId ? 'This memory is protected. The machine must choose another.' : 'Protection removed. This memory can be consumed.'); } });
overlay.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.protect) {
    const memoryId = Number(button.dataset.protect);
    if (protectMemory(world, memoryId)) { updateMemories(); saveCheckpoint(); reviewMemories('review'); overlay.querySelector(`[data-protect="${memoryId}"]`)?.focus(); }
    return;
  }
  if (button.dataset.promise) { selectPromise(button.dataset.promise); return; }
  if (button.dataset.replay) { const record = profile.history.find(r => r.id === button.dataset.replay); if (record) requestStart(record.seed, record.mode); return; }
  if (button.dataset.choice) return selectChoice(button.dataset.choice);
  if (button.dataset.ending) { if (finishLight(world, button.dataset.ending)) presentResult(); return; }
  switch (button.dataset.action) {
    case 'cancel-start': pendingStart = null; if (world && ['won', 'lost'].includes(world.phase)) presentResult(); else if (world) { closeModal(); paused = false; pause(); } else closeModal(); break;
    case 'close-history': closeModal(); break;
    case 'download': downloadRecord(); break;
    case 'ledger': showLedger(); break;
    case 'back-ledger': backFromLedger(); break;
    case 'checkpoint-home': saveCheckpoint(); returnHome(); break;
    case 'review': reviewMemories(); break;
    case 'back-review': backFromReview(); break;
    case 'resume': resume(); break;
    case 'help': help(); break;
    case 'close-help': if (world) resume(); else closeModal(); break;
    case 'retry': requestStart(world.seed, world.mode); break;
    case 'new': requestStart(newSeed(), world.mode); break;
    case 'home': returnHome(); break;
    case 'restart-confirm': displayModal(`<div class="dialog-top"><span>START AGAIN</span></div><h2 id="dialog-title">Try another way?</h2><p class="dialog-deck">This ends the current run and restarts the same world from night one.</p><div class="dialog-actions"><button class="button primary" data-action="resume">KEEP THIS RUN</button><button class="button" data-action="retry">RESTART</button></div>`, 'restart'); break;
  }
});
overlay.addEventListener('cancel', event => { event.preventDefault(); if (screen === 'ledger') { backFromLedger(); return; } if (screen === 'promise') { pendingStart = null; if (world && ['won', 'lost'].includes(world.phase)) presentResult(); else if (world) { closeModal(); paused = false; pause(); } else closeModal(); return; } if (screen === 'history') { closeModal(); return; } if (screen === 'review') { backFromReview(); return; } if (['pause', 'help', 'restart'].includes(screen)) { if (world) resume(); else closeModal(); } });
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'm' && !event.repeat && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) { toggleSound(); return; }
  if (overlay.open) {
    if (screen === 'promise' && ['1', '2', '3'].includes(key) && !event.repeat) selectPromise(PROMISES[Number(key) - 1].id);
    if (screen === 'council' && ['1', '2', '3'].includes(key) && !event.repeat) { const choice = availableChoices(world)[Number(key) - 1]; if (choice?.available) selectChoice(choice.id); }
    return;
  }
  if (!world || world.phase !== 'playing' || ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (key === 'j') { event.preventDefault(); showLedger(); return; }
  if (key === 'escape' || key === 'p') { event.preventDefault(); pause(); return; }
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'e'].includes(key)) {
    if (key === ' ' && event.target.tagName === 'BUTTON') return;
    event.preventDefault(); keys.add(key);
    if (!event.repeat && key === ' ') queuedDash = true;
    if (!event.repeat && key === 'e') queuedPulse = true;
  }
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
canvas.addEventListener('pointerdown', event => {
  if (!world || paused || world.phase !== 'playing' || (event.pointerType !== 'touch' && event.button !== 0)) return;
  canvas.focus({ preventScroll: true }); canvas.setPointerCapture(event.pointerId);
  const p = renderer.toWorld(event.clientX, event.clientY); pointer = { down: event.pointerType !== 'touch', ...p };
  if (event.pointerType === 'touch') touchOrigin = { x: event.clientX, y: event.clientY, currentX: event.clientX, currentY: event.clientY };
});
canvas.addEventListener('contextmenu', event => event.preventDefault());
canvas.addEventListener('pointermove', event => { const p = renderer.toWorld(event.clientX, event.clientY); pointer.x = p.x; pointer.y = p.y; if (touchOrigin) { touchOrigin.currentX = event.clientX; touchOrigin.currentY = event.clientY; } });
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, () => { pointer.down = false; touchOrigin = null; });
window.addEventListener('blur', () => { clearInput(); pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); pause(); audio.suspend(); } });
window.addEventListener('pagehide', () => audio.suspend());
function frame(now) {
  const elapsed = Math.min(.1, (now - (previousTime || now)) / 1000); previousTime = now;
  if (!world) hero.draw(preview, elapsed);
  else {
    if (!paused && world.phase === 'playing' && !overlay.open) {
      accumulator += elapsed;
      while (accumulator >= 1 / LIGHT.hz && world.phase === 'playing') {
        let moveX = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0);
        let moveY = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0);
        if (touchOrigin) { const dx = touchOrigin.currentX - touchOrigin.x, dy = touchOrigin.currentY - touchOrigin.y; if (Math.hypot(dx, dy) > 8) { moveX = dx / 35; moveY = dy / 35; } }
        const events = stepLight(world, { moveX, moveY, manualAim: pointer.down, aimX: pointer.x, aimY: pointer.y, dashPressed: queuedDash, pulsePressed: queuedPulse });
        queuedDash = false; queuedPulse = false; actionEvents(events); accumulator -= 1 / LIGHT.hz;
        if (world.phase === 'council') { saveCheckpoint(); updateHud(true); presentCouncil(); }
        else if (world.phase === 'ending') { saveCheckpoint(); updateHud(true); presentEnding(); }
        else if (world.phase === 'lost') { updateHud(true); presentResult(); }
      }
      updateHud();
    }
    renderer.draw(world, paused || overlay.open ? 0 : elapsed);
  }
  if (now > toastUntil) $('toast').classList.remove('visible');
  if (now > bannerUntil) $('wave-banner').hidden = true;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
/** Read-only acceptance/debug snapshot. Callers never receive mutable simulation state. */
export function inspectLight() { return world ? structuredClone(world) : null; }

export function inspectLightStatus() { return { paused, screen, saveWritable: storage.writable, saveError: storage.error, historyCount: profile.history.length, checkpointPhase: profile.checkpoint?.world.phase || null }; }
