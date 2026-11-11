import * as sim from './sim/franchise.js';
import { createFranchiseStorage, parseFranchise, validateFranchise } from './franchise-storage.js';
import { shell, playerDialog, recapDialog, newDialog, icon, esc, money } from './franchise-view.js';

const root = document.querySelector('#app'), dialog = document.querySelector('#franchise-dialog'), toast = document.querySelector('#toast');
const storage = createFranchiseStorage();
let state = storage.load() || sim.createFranchise();
if (storage.writable) storage.save(state);
const views = ['overview', 'roster', 'gameplan', 'schedule', 'standings', 'transactions', 'scouting', 'owner', 'news', 'history', 'settings'];
const ui = { view: views.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'overview', search: '', position: 'all', standings: 'divisions', market: 'free', leagueSchedule: false, tradeTeam: 0, outgoing: '' };
let toastTimer, returnFocus;
function render() { root.innerHTML = shell(state, ui, storage); }
function notify(message, error = false) {
  const dialogStatus = dialog.querySelector('.dialog-status');
  if (dialog.open && dialogStatus) { dialogStatus.textContent = message; dialogStatus.className = `dialog-status notice ${error ? 'warning' : ''}`; dialogStatus.hidden = false; }
  clearTimeout(toastTimer); toast.className = `toast visible ${error ? 'error' : ''}`; toast.textContent = message;
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, error ? 8000 : 4500);
}
function navigate(view) {
  if (!views.includes(view)) return;
  ui.view = view; ui.search = ''; ui.position = 'all'; location.hash = view;
  render(); window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', () => { if (views.includes(location.hash.slice(1)) && ui.view !== location.hash.slice(1)) navigate(location.hash.slice(1)); });
function openDialog(content, wide = false) {
  if (!dialog.open) returnFocus = document.activeElement;
  dialog.className = wide ? 'wide-dialog' : '';
  dialog.innerHTML = `<button class="dialog-close icon-button" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button>${content}<div class="dialog-status notice" role="status" aria-live="polite" hidden></div>`;
  if (!dialog.open) dialog.showModal();
}
function closeDialog() { dialog.close(); if (returnFocus?.isConnected) returnFocus.focus(); }
dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(); } });
function commit(action, message) {
  const next = structuredClone(state), result = action(next);
  next.revision++; validateFranchise(next);
  const wasWritable = storage.writable;
  if (!storage.save(next) && wasWritable) {
    // A conflict must not replace the tab's previous state. Export remains available.
    render(); throw new Error(storage.error);
  }
  state = next; render(); if (message) notify(message);
  return result;
}
function exportSave() {
  const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `sideline-${sim.getTeam(state).abbr.toLowerCase()}-${state.year}-week-${state.week}.json`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Franchise exported. Keep the file as a backup.');
}
function confirmDraft() {
  openDialog(`<span class="eyebrow">CLOSE THE RE-SIGNING PERIOD</span><h2 id="dialog-title">Ready for draft day?</h2><p>${sim.roster(state).filter(p => p.years === 1).length} expiring contracts will enter free agency. Players will age and progress, retirees will leave, and the salary cap will grow by 4%.</p><p class="muted">Extend players from your roster before continuing. Your first-round pick will be ready when you enter.</p><div class="dialog-actions"><button class="btn secondary" data-action="close-dialog">Keep managing contracts</button><button class="btn primary" data-action="confirm-draft">Enter draft ${icon('arrow')}</button></div>`);
}
function advance() {
  if (state.phase === 'offseason') return confirmDraft();
  if (state.phase === 'draft') return navigate('scouting');
  if (state.phase === 'preseason') { commit(sim.startSeason, 'A new season is underway.'); navigate('overview'); return; }
  const game = commit(sim.advanceWeek);
  if (game) openDialog(recapDialog(state, state.schedule.find(g => g.id === game.id)), true);
  else notify(state.phase === 'offseason' ? 'The championship is decided. The offseason is open.' : 'Week advanced. Your franchise is saved.');
}

document.addEventListener('click', e => {
  const button = e.target.closest('button'); if (!button) return;
  try {
    if (button.dataset.nav) { closeDialog(); navigate(button.dataset.nav); return; }
    if (button.dataset.player) { const p = sim.getPlayer(state, button.dataset.player); if (p) openDialog(playerDialog(state, p)); return; }
    if (button.dataset.game) { const g = state.schedule.find(x => x.id === button.dataset.game); if (g?.played) openDialog(recapDialog(state, g), true); return; }
    if (button.dataset.standings) { ui.standings = button.dataset.standings; render(); return; }
    if (button.dataset.market) { ui.market = button.dataset.market; ui.search = ''; ui.position = 'all'; render(); return; }
    const action = button.dataset.action, id = button.dataset.id;
    switch (action) {
      case 'advance': advance(); break;
      case 'go-schedule': navigate('schedule'); break;
      case 'go-roster': navigate('roster'); break;
      case 'train': commit(sim.trainTeam, 'Practice complete. Check the league wire for your report.'); break;
      case 'promote': commit(s => sim.promotePlayer(s, id), 'Depth chart updated.'); closeDialog(); break;
      case 'extend': commit(s => sim.extendPlayer(s, id), 'Contract extended for three additional years.'); closeDialog(); break;
      case 'sign': commit(s => sim.signPlayer(s, id), 'Contract signed. Welcome to the franchise.'); closeDialog(); break;
      case 'release-confirm': {
        const p = sim.getPlayer(state, id);
        openDialog(`<span class="eyebrow">ROSTER DECISION</span><h2 id="dialog-title">Release ${esc(p.name)}?</h2><p>This opens a roster spot and frees ${money(p.salary - p.bonus)} of cap space. ${money(p.bonus)} remains as dead cap this season. The player becomes available to the entire league.</p><div class="dialog-actions"><button class="btn secondary" data-action="close-dialog">Keep player</button><button class="btn danger" data-action="release" data-id="${id}">Release player</button></div>`); break;
      }
      case 'release': commit(s => sim.releasePlayer(s, id), 'Player released. Roster and salary cap updated.'); closeDialog(); break;
      case 'scout': commit(s => sim.scoutPlayer(s, id), 'Scouting report complete. Exact ratings are now visible.'); break;
      case 'draft-player': commit(s => sim.draftPlayer(s, id), 'The pick is in. The draft has advanced to your next turn.'); break;
      case 'pass-pick': openDialog(`<h2 id="dialog-title">Pass this draft pick?</h2><p>You will give up this selection. This is useful when your roster is full or you cannot afford the rookie contract.</p><div class="dialog-actions"><button class="btn secondary" data-action="close-dialog">Keep pick</button><button class="btn primary" data-action="confirm-pass">Pass selection</button></div>`); break;
      case 'confirm-pass': commit(sim.skipDraftPick, 'Pick passed.'); closeDialog(); break;
      case 'begin-draft': confirmDraft(); break;
      case 'confirm-draft': commit(sim.beginDraft, 'You are on the clock.'); closeDialog(); navigate('scouting'); break;
      case 'upgrade-facility': commit(sim.upgradeFacility, 'Facilities upgraded.'); break;
      case 'upgrade-coach': commit(sim.upgradeCoach, 'Coaching staff improved.'); break;
      case 'schedule-team': ui.leagueSchedule = false; render(); break;
      case 'schedule-league': ui.leagueSchedule = true; render(); break;
      case 'new-dialog': openDialog(newDialog(state)); break;
      case 'export': exportSave(); break;
      case 'import': document.querySelector('#import-file').click(); break;
      case 'close-dialog': closeDialog(); break;
    }
  } catch (error) { notify(error.message, true); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'position-filter') { ui.position = e.target.value; render(); }
  if (e.target.id === 'trade-team') { ui.tradeTeam = Number(e.target.value); render(); }
  if (e.target.id === 'trade-outgoing') { ui.outgoing = e.target.value; render(); }
});
document.addEventListener('input', e => {
  if (e.target.id !== 'player-search') return;
  const cursor = e.target.selectionStart; ui.search = e.target.value; render();
  const input = document.querySelector('#player-search'); input.focus(); input.setSelectionRange(cursor, cursor);
});
document.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  try {
    if (e.target.id === 'strategy-form') commit(s => sim.setStrategy(s, data.get('offense'), data.get('defense'), data.get('training')), 'Game plan saved.');
    if (e.target.id === 'ticket-form') commit(s => sim.setTicketPrice(s, Number(data.get('ticket'))), 'Ticket price updated.');
    if (e.target.id === 'trade-form') commit(s => sim.tradePlayers(s, data.get('outgoing'), data.get('incoming')), 'Trade accepted. Both rosters are updated.');
    if (e.target.id === 'new-franchise-form') {
      const next = sim.createFranchise(Number(data.get('seed')), Number(data.get('team')));
      replaceFranchise(next); closeDialog(); navigate('overview'); notify('Welcome to your new franchise.');
    }
    if (e.target.id === 'import-confirm-form') { replaceFranchise(pendingImport); pendingImport = null; closeDialog(); navigate('overview'); notify('Franchise imported.'); }
  } catch (error) { notify(error.message, true); }
});
function replaceFranchise(next) {
  validateFranchise(next);
  if (!storage.writable) throw new Error('This tab cannot replace the stored save. Export your progress and reload or use a different browser profile.');
  next.revision = state.revision + 1;
  if (!storage.save(next)) throw new Error(storage.error);
  state = next;
}
let pendingImport = null;
document.querySelector('#import-file').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    if (file.size > 8_000_000) throw new Error('Save file must be smaller than 8 MB.');
    pendingImport = parseFranchise(await file.text());
    const t = sim.getTeam(pendingImport);
    openDialog(`<h2 id="dialog-title">Import this franchise?</h2><p><strong>${t.city} ${t.name}</strong> · ${pendingImport.year} season · Week ${pendingImport.week} · ${sim.recordText(t)}</p><p class="muted">The file has passed validation. Importing replaces the active browser save. Export your current franchise first to keep both.</p><form id="import-confirm-form"><div class="dialog-actions"><button class="btn secondary" type="button" data-action="export">Export current franchise</button><button class="btn primary" type="submit">Import franchise</button></div></form>`);
  } catch (error) { notify(`Cannot import: ${error.message}`, true); }
  e.target.value = '';
});
window.addEventListener('storage', () => { notify('Another tab may have changed the franchise. Reload before making more decisions.', true); });
render();
