// One More Season — persistence. Works with any Storage-like object (localStorage or a test fake).
import { validateState } from './game.mjs';

export const KEYS = {
  save: 'oneMoreSeason.save.v1',
  prev: 'oneMoreSeason.prev.v1', // last good save before the newest write (recovery path)
  backup: 'oneMoreSeason.backup', // any unreadable save is parked here, never deleted
  history: 'oneMoreSeason.history.v1',
  prefs: 'oneMoreSeason.prefs.v1',
};

function get(st, k) { try { return st ? st.getItem(k) : null; } catch (e) { return null; } }
function set(st, k, v) { try { st.setItem(k, v); return true; } catch (e) { return false; } }

export function loadSave(st) {
  const raw = get(st, KEYS.save);
  if (raw == null) return { state: null, problem: null };
  let parsed = null, problems;
  try { parsed = JSON.parse(raw); problems = validateState(parsed); } catch (e) { problems = ['unreadable JSON']; }
  if (!problems.length) return { state: parsed, problem: null };
  set(st, KEYS.backup, raw); // keep the player's data; the main slot is only overwritten by a later save
  const prevRaw = get(st, KEYS.prev);
  if (prevRaw) {
    try {
      const prev = JSON.parse(prevRaw);
      if (!validateState(prev).length) return { state: prev, problem: 'Your latest save was damaged, so the previous good save was restored. The damaged copy is kept as a backup.' };
    } catch (e) { /* fall through */ }
  }
  return { state: null, problem: 'Your save could not be read (' + problems.slice(0, 2).join(', ') + '). It was kept as a backup; export it from the menu if you need it.' };
}

// Persist the already-resolved state. Returns false if storage is unavailable.
export function writeSave(st, state) {
  const cur = get(st, KEYS.save);
  if (cur != null) {
    try { if (!validateState(JSON.parse(cur)).length) set(st, KEYS.prev, cur); } catch (e) { /* keep old prev */ }
  }
  return set(st, KEYS.save, JSON.stringify(state));
}

export function exportText(st) { return get(st, KEYS.save) || get(st, KEYS.backup) || ''; }

export function importText(text) {
  let s;
  try { s = JSON.parse(text); } catch (e) { return { ok: false, error: 'That is not save text.' }; }
  const p = validateState(s);
  return p.length ? { ok: false, error: 'Save failed checks: ' + p.slice(0, 3).join(', ') } : { ok: true, state: s };
}

export function loadHistory(st) {
  try { const h = JSON.parse(get(st, KEYS.history) || '[]'); return Array.isArray(h) ? h : []; } catch (e) { return []; }
}

export function addHistory(st, entry) {
  const h = loadHistory(st);
  if (h.some(x => x.id === entry.id)) return h;
  h.push(entry);
  set(st, KEYS.history, JSON.stringify(h.slice(-50)));
  return h;
}

export function loadPrefs(st) { try { return JSON.parse(get(st, KEYS.prefs) || '{}') || {}; } catch (e) { return {}; } }
export function savePrefs(st, p) { set(st, KEYS.prefs, JSON.stringify(p)); }
