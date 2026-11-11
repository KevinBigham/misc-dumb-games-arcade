import { CROSSBLOCK_SIZE as SIZE } from './contracts.js';
import { createCrossblock, createDailyCrossblock, rotatePiece, placePiece, undoMove, pieceSize } from './sim/crossblock.js';
import { createCrossblockView } from './crossblock-view.js';
import { createCrossblockAudio } from './crossblock-audio.js';
import { createCrossblockStorage } from './crossblock-storage.js';
import { createCrossblockSessionStorage } from './crossblock-session.js';

const $ = selector => document.querySelector(selector);
let browserStorage;
try { browserStorage = globalThis.localStorage; } catch { /* Temporary play still works. */ }
const storage = createCrossblockStorage(browserStorage);
const sessionStorage = createCrossblockSessionStorage(browserStorage);
let profile = storage.load();
const session = sessionStorage.load();
const freshSeed = () => globalThis.crypto.getRandomValues(new Uint32Array(1))[0];
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
session.free ??= createCrossblock(freshSeed());
if (session.mode === 'daily' && session.daily?.puzzleKey !== today()) session.daily = createDailyCrossblock(today());
let world = session[session.mode];
const view = createCrossblockView(), audio = createCrossblockAudio();
const ui = { selected: -1, cursor: { x: 0, y: 0 }, showPreview: false, keyboard: false };
let drag = null, endTimer, roundBest = profile.bestScore;

function updateSaveNote() {
  const status = sessionStorage.status;
  $('#save-note').textContent = status === 'conflict' ? 'Another tab saved a board. This tab is temporary.'
    : status === 'protected' ? 'Existing save protected. This game is temporary.'
      : status !== 'ready' ? 'Play freely. This visit can’t save your board.'
        : !storage.writable ? 'Board saved. Best score is temporary.' : 'Board + undo saved on this device.';
}
function render() {
  view.render(world, ui, profile, session.completedDaily);
  $('#daily-mark').textContent = session.completedDaily?.key === today() ? '✓' : '✳';
  updateSaveNote();
}
function persistProfile() {
  if (storage.save(profile)) profile = storage.load();
  updateSaveNote();
}
function persistSession() {
  session[world.mode] = world;
  session.mode = world.mode;
  sessionStorage.save(session);
  updateSaveNote();
}
function syncSound() {
  audio.setMuted(profile.muted);
  const button = $('#sound-button');
  button.setAttribute('aria-label', profile.muted ? 'Enable sound' : 'Mute sound');
  button.setAttribute('aria-pressed', String(profile.muted));
  button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/>${profile.muted ? '<path d="m16 9 5 6m0-6-5 6"/>' : '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'}</svg>`;
}
function clampCursor() {
  if (ui.selected < 0 || !world.hand[ui.selected]) return;
  const { width, height } = pieceSize(world.hand[ui.selected]);
  ui.cursor.x = Math.max(0, Math.min(SIZE - width, ui.cursor.x));
  ui.cursor.y = Math.max(0, Math.min(SIZE - height, ui.cursor.y));
}
function focusCursor() { view.cells[ui.cursor.y * SIZE + ui.cursor.x].focus({ preventScroll: true }); }
function select(slot, keyboard = false) {
  if (!world.hand[slot] || world.status !== 'playing') return;
  audio.unlock(); audio.select();
  ui.selected = slot; ui.keyboard = keyboard; ui.showPreview = keyboard;
  clampCursor(); render();
  view.announce(`${world.hand[slot].name} selected. Rotate with R. Arrow keys to position. Enter to place.`);
  if (keyboard) focusCursor();
}
function rotate() {
  if (ui.selected < 0 || world.status !== 'playing') return;
  audio.unlock();
  const events = rotatePiece(world, ui.selected);
  if (ui.keyboard) clampCursor();
  persistSession(); render(); audio.consume(events);
  const { width, height } = pieceSize(world.hand[ui.selected]);
  view.announce(`Rotated. ${width} columns by ${height} rows.`);
  if (ui.keyboard) focusCursor();
}
function place() {
  if (world.status !== 'playing') return;
  if (ui.selected < 0) {
    view.toast('PICK A SHAPE', 'Choose one of the three below.');
    view.announce('Pick a shape below the board first.'); return;
  }
  audio.unlock();
  const events = placePiece(world, ui.selected, ui.cursor.x, ui.cursor.y);
  if (!events.length) {
    view.bump(); audio.invalid(); view.announce('That shape does not fit here. Try another spot or rotate it.');
    $('#selection-label').textContent = 'Try another spot or a rotation.'; return;
  }
  if (world.mode === 'free' && world.score > profile.bestScore) { profile.bestScore = world.score; persistProfile(); }
  if (world.status === 'won') {
    const previous = session.completedDaily?.key === world.puzzleKey ? session.completedDaily.score : 0;
    session.completedDaily = { key: world.puzzleKey, score: Math.max(previous, world.score) };
  }
  persistSession();
  ui.selected = world.hand.findIndex(Boolean);
  if (ui.keyboard) clampCursor(); else ui.showPreview = false;
  render(); view.consume(events); audio.consume(events);
  const clear = events.find(event => event.type === 'cleared');
  view.announce(`${clear ? `${clear.cross ? 'Cross! ' : ''}${clear.rows.length + clear.columns.length} lines cleared. ` : 'Shape placed. '}${world.score} points. ${events.some(event => event.type === 'dealt') ? 'Three fresh shapes.' : 'Choose your next shape.'}`);
  if (ui.keyboard) focusCursor();
  if (world.status !== 'playing') endTimer = setTimeout(showEnd, 800);
}
function showEnd() {
  if (world.status === 'playing' || document.querySelector('dialog[open]')) return;
  const daily = world.mode === 'daily', won = world.status === 'won';
  $('#end-score').textContent = world.score.toLocaleString('en-US');
  $('#end-summary').textContent = `${world.lines} lines cleared · ${world.moves} shapes placed${daily ? ` · ${world.puzzleKey}` : ` · ${world.crosses} Cross${world.crosses === 1 ? '' : 'es'}`}`;
  $('#end-eyebrow').textContent = won ? 'TODAY’S PUZZLE. SOLVED.' : daily ? 'THERE’S A FIT WAITING FOR YOU' : world.score > roundBest ? 'A NEW PERSONAL BEST' : 'EVERY SPACE HAS ITS LIMIT';
  $('#end-title').textContent = won ? 'Perfect fit.' : daily ? 'One more angle.' : 'Beautifully boxed in.';
  $('#end-description').textContent = won ? 'Every block cleared with just three shapes. Come back tomorrow for another arrangement, or pick up your free-play board.' : daily ? 'A few blocks are still looking for a home. Undo your last placement, or give the same puzzle another go.' : 'No remaining shape fits, even with a spin. A fresh board is a whole new possibility.';
  $('#play-again').textContent = won ? 'Back to free play ↗' : daily ? 'Try this puzzle again ↻' : 'One more round ↗';
  $('#end-undo').disabled = !world.undo;
  $('#end-dialog').showModal();
  view.announce(won ? `Daily puzzle solved! ${world.score} points.` : `Round over. ${world.score} points. Undo or start again.`);
}
function undo() {
  clearTimeout(endTimer);
  const events = undoMove(world);
  if (!events.length) return;
  audio.unlock(); audio.consume(events); $('#end-dialog').close(); view.resetEffects();
  ui.selected = world.hand.findIndex(Boolean); ui.showPreview = false;
  persistSession(); render();
  view.announce('Last placement undone. Your score, shapes, and board are restored.');
}
function resetControls() {
  clearTimeout(endTimer); drag = null;
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  Object.assign(ui, { selected: -1, cursor: { x: 0, y: 0 }, showPreview: false, keyboard: false });
  view.resetEffects();
}
function restart() {
  resetControls();
  world = world.mode === 'daily' ? createDailyCrossblock(world.puzzleKey) : createCrossblock(freshSeed());
  roundBest = profile.bestScore;
  persistSession(); render();
  view.announce(world.mode === 'daily' ? 'Puzzle reset. Clear every block using three shapes.' : 'Fresh board. Pick a shape to begin.');
}
function switchMode(mode) {
  if (mode === world.mode && (mode !== 'daily' || world.puzzleKey === today())) return;
  session[world.mode] = world;
  resetControls();
  if (mode === 'daily' && session.daily?.puzzleKey !== today()) session.daily = createDailyCrossblock(today());
  world = session[mode];
  persistSession(); render();
  view.announce(mode === 'daily' ? 'Daily puzzle. Clear every block using these three shapes. Your free-play board is saved.' : 'Free play. Your board is ready.');
  if (world.status !== 'playing') endTimer = setTimeout(showEnd, 200);
}
function requestRestart() {
  if (world.moves === 0) { restart(); return; }
  const daily = world.mode === 'daily';
  $('#restart-title').textContent = daily ? 'Try a different angle?' : 'Make room for a new idea?';
  $('#restart-description').textContent = daily ? 'This resets the same three-piece puzzle. Your free-play board stays exactly as you left it.' : 'This replaces your saved free-play board. Your personal best stays with you.';
  $('#confirm-restart').textContent = daily ? 'Retry puzzle ↻' : 'Fresh start ↗';
  $('#restart-dialog').showModal();
}
function pointToCursor(clientX, clientY) {
  const rect = $('#board').getBoundingClientRect();
  if (clientX < rect.left || clientX >= rect.right || clientY < rect.top || clientY >= rect.bottom) return null;
  const gap = parseFloat(getComputedStyle($('#board')).columnGap), cell = (rect.width - gap * (SIZE - 1)) / SIZE;
  return { x: Math.min(SIZE - 1, Math.floor((clientX - rect.left) / (cell + gap))), y: Math.min(SIZE - 1, Math.floor((clientY - rect.top) / (cell + gap))) };
}
$('#tray').addEventListener('pointerdown', event => {
  const card = event.target.closest('[data-slot]');
  if (!card || card.disabled || event.button !== 0 || world.status !== 'playing') return;
  event.preventDefault(); select(Number(card.dataset.slot));
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
  $('#tray').setPointerCapture(event.pointerId);
});
$('#tray').addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6) drag.moved = true;
  if (!drag.moved) return;
  const cursor = pointToCursor(event.clientX, event.clientY);
  if (cursor && ui.showPreview && cursor.x === ui.cursor.x && cursor.y === ui.cursor.y) return;
  ui.showPreview = !!cursor;
  if (cursor) ui.cursor = cursor;
  view.preview(world, ui);
});
$('#tray').addEventListener('pointerup', event => {
  if (!drag || drag.id !== event.pointerId) return;
  const shouldPlace = drag.moved, cursor = pointToCursor(event.clientX, event.clientY); drag = null;
  if ($('#tray').hasPointerCapture(event.pointerId)) $('#tray').releasePointerCapture(event.pointerId);
  if (shouldPlace && cursor) { ui.cursor = cursor; place(); }
  else { ui.showPreview = false; view.preview(world, ui); }
});
function cancelDrag() { drag = null; ui.showPreview = false; view.preview(world, ui); }
$('#tray').addEventListener('pointercancel', cancelDrag);
$('#tray').addEventListener('lostpointercapture', () => { if (drag) cancelDrag(); });
$('#tray').addEventListener('click', event => {
  const card = event.target.closest('[data-slot]');
  if (card && event.detail === 0) select(Number(card.dataset.slot), true);
});
$('#board').addEventListener('pointermove', event => {
  if (drag || event.pointerType === 'touch') return;
  const cursor = pointToCursor(event.clientX, event.clientY);
  if (!cursor) return;
  if (ui.showPreview && !ui.keyboard && cursor.x === ui.cursor.x && cursor.y === ui.cursor.y) return;
  ui.cursor = cursor; ui.showPreview = true; ui.keyboard = false; view.preview(world, ui);
});
$('#board').addEventListener('pointerleave', () => { if (!ui.keyboard) { ui.showPreview = false; view.preview(world, ui); } });
$('#board').addEventListener('click', event => {
  const cell = event.target.closest('.cell');
  if (!cell) return;
  ui.cursor = { x: Number(cell.dataset.x), y: Number(cell.dataset.y) };
  ui.keyboard = event.detail === 0; ui.showPreview = ui.keyboard; place();
});
$('#rotate-button').addEventListener('click', rotate);
$('#undo-button').addEventListener('click', undo);
$('#end-undo').addEventListener('click', undo);
$('#play-again').addEventListener('click', () => world.status === 'won' ? switchMode('free') : restart());
$('#confirm-restart').addEventListener('click', restart);
$('#new-button').addEventListener('click', requestRestart);
$('#mode-free').addEventListener('click', () => switchMode('free'));
$('#mode-daily').addEventListener('click', () => switchMode('daily'));
$('#help-button').addEventListener('click', () => $('#help-dialog').showModal());
$('#sound-button').addEventListener('click', () => { profile.muted = !profile.muted; syncSound(); audio.unlock(); persistProfile(); });
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$('#help-dialog').addEventListener('close', showEnd);
$('#restart-dialog').addEventListener('close', showEnd);
document.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  const key = event.key.toLowerCase();
  if (['1', '2', '3'].includes(key)) { event.preventDefault(); select(Number(key) - 1, true); }
  else if (key === 'r') { event.preventDefault(); if (!event.repeat) rotate(); }
  else if (key === 'z') { event.preventDefault(); if (!event.repeat) undo(); }
  else if (key === 'm') { event.preventDefault(); if (!event.repeat) $('#sound-button').click(); }
  else if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown'].includes(key) && world.status === 'playing') {
    event.preventDefault();
    if (ui.selected < 0) select(world.hand.findIndex(Boolean), true);
    const change = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] }[key];
    ui.cursor.x += change[0]; ui.cursor.y += change[1]; clampCursor();
    ui.showPreview = true; ui.keyboard = true; view.preview(world, ui); focusCursor();
  } else if ((key === 'enter' || key === ' ') && (event.target.closest('#board') || event.target === document.body)) {
    event.preventDefault(); if (!event.repeat) place();
  }
});
window.addEventListener('blur', cancelDrag);
syncSound(); persistSession(); render();
if (world.status !== 'playing') endTimer = setTimeout(showEnd, 200);
else if (world.moves > 0) { view.toast('WELCOME BACK.', 'Your board. Right where you left it.'); view.announce('Saved game restored, including your last undo.'); }
