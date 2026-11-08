import { QUARTERLIFE_KEY, QUARTERLIFE_VERSION } from './contracts.js';
import { validLife } from './sim/quarterlife.js';

export function createLifeStorage(storage) {
  let blocked = false, warning = '', loaded = false, knownRaw = null;
  const api = {
    load() {
      loaded = true;
      try {
        const raw = storage?.getItem(QUARTERLIFE_KEY) ?? null;
        knownRaw = raw;
        if (!raw) return null;
        const state = JSON.parse(raw);
        if (state.version !== QUARTERLIFE_VERSION) throw new Error('This save is from another version. It will be kept untouched; this session will not save.');
        if (!validLife(state)) throw new Error('Your saved month could not be read. It will be kept untouched; this session will not save.');
        return state;
      } catch (error) { blocked = true; warning = error.message; return null; }
    },
    save(state) {
      if (!loaded) api.load();
      if (blocked || !validLife(state)) return false;
      try {
        if (!storage) throw new Error('Storage unavailable');
        if ((storage.getItem(QUARTERLIFE_KEY) ?? null) !== knownRaw) {
          blocked = true;
          warning = 'Another tab changed this month. Its save is safe. Reload to continue that save; this tab will not overwrite it.';
          return false;
        }
        const next = JSON.stringify(state);
        storage.setItem(QUARTERLIFE_KEY, next); knownRaw = next; return true;
      } catch { warning = 'This browser could not save your month. You can still play this session.'; return false; }
    },
    get warning() { return warning; },
    get blocked() { return blocked; },
  };
  return api;
}
