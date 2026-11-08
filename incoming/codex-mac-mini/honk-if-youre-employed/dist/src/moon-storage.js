import { MOON_PROFILE_KEY, MOON_PROFILE_VERSION } from './contracts.js';
import { MOON_LOADOUTS, MOON_DIFFICULTIES, MOON_UPGRADES, MOON_LAWS, MOON_ACHIEVEMENTS, MOON_ENEMY_GUIDE } from './sim/moon-content.js';

const moonDiscoveryIds = new Set([
  ...MOON_UPGRADES.map(u => `upgrade:${u.id}`), ...MOON_LAWS.map(l => `law:${l.id}`),
  ...MOON_ENEMY_GUIDE.map(e => `enemy:${e.id}`), 'enemy:sun',
]);
const moonBadgeIds = new Set(MOON_ACHIEVEMENTS.map(a => a.id));
const validMoonCount = n => Number.isSafeInteger(n) && n >= 0 && n <= 1e12;
const validMoonDay = s => {
  if (s === '') return true;
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [year, month, day] = s.split('-').map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
};
const validMoonIds = (array, allowed) => Array.isArray(array) && array.length <= allowed.size && new Set(array).size === array.length && array.every(id => allowed.has(id));

export function defaultMoonProfile() {
  return { version: MOON_PROFILE_VERSION,
    settings: { muted: false, reduced: false, autoAim: false, loadout: 'classic', difficulty: 'night' },
    best: { daydream: 0, night: 0, fever: 0, overtime: 0 }, daily: { day: '', score: 0, won: false },
    suns: 0, winsWith: [], badges: [], discovered: [], recentResults: [],
  };
}
export function validMoonProfile(p) {
  if (!p || p.version !== MOON_PROFILE_VERSION || !p.settings || !p.best || !p.daily) return false;
  const s = p.settings;
  return ['muted', 'reduced', 'autoAim'].every(key => typeof s[key] === 'boolean')
    && MOON_LOADOUTS.some(l => l.id === s.loadout) && MOON_DIFFICULTIES.some(d => d.id === s.difficulty)
    && ['daydream', 'night', 'fever', 'overtime'].every(key => validMoonCount(p.best[key]))
    && validMoonDay(p.daily.day) && validMoonCount(p.daily.score) && typeof p.daily.won === 'boolean'
    && validMoonCount(p.suns) && validMoonIds(p.winsWith, new Set(MOON_LOADOUTS.map(l => l.id)))
    && validMoonIds(p.badges, moonBadgeIds) && validMoonIds(p.discovered, moonDiscoveryIds)
    && Array.isArray(p.recentResults) && p.recentResults.length <= 24
    && p.recentResults.every(id => typeof id === 'string' && /^[a-zA-Z0-9:-]{1,100}$/.test(id));
}
/** Chicago calendar date is supplied by the UI boundary, never read by the simulation. */
export function moonDailySeed(day) {
  if (!validMoonDay(day) || !day) throw new Error('A YYYY-MM-DD day is required.');
  let hash = 2166136261;
  for (const char of `MOON-NIGHTSHIFT-2:${day}`) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}
export function createMoonStorage(provided) {
  let storage, cached = defaultMoonProfile(), status = 'ready';
  try { storage = arguments.length ? provided : globalThis.localStorage; } catch { status = 'unavailable'; }
  if (!storage) status = 'unavailable';
  function read() {
    if (!storage) return { kind: 'unavailable' };
    try {
      const raw = storage.getItem(MOON_PROFILE_KEY);
      if (raw === null) return { kind: 'ready', value: defaultMoonProfile(), fresh: true };
      let parsed; try { parsed = JSON.parse(raw); } catch { return { kind: 'protected' }; }
      return validMoonProfile(parsed) ? { kind: 'ready', value: parsed, fresh: false } : { kind: 'protected' };
    } catch { return { kind: 'unavailable' }; }
  }
  function transact(update) {
    const entry = read();
    // Read immediately before every write: a stale tab cannot overwrite a newer schema.
    if (entry.kind === 'protected') status = 'protected';
    else if (entry.kind === 'unavailable') status = 'unavailable';
    const base = status === 'ready' && entry.kind === 'ready' ? entry.value : cached;
    const next = structuredClone(base); update(next);
    if (!validMoonProfile(next)) throw new Error('Invalid Moon profile update.');
    cached = next;
    if (status === 'ready') {
      try { storage.setItem(MOON_PROFILE_KEY, JSON.stringify(next)); } catch { status = 'unavailable'; }
    }
    return structuredClone(cached);
  }
  const entry = read(); status = entry.kind; if (entry.value) cached = entry.value;
  return {
    get status() { return status; },
    get fresh() { return entry.fresh === true; },
    load() { return structuredClone(cached); },
    settings(patch) {
      return transact(p => {
        for (const key of ['muted', 'reduced', 'autoAim']) if (typeof patch[key] === 'boolean') p.settings[key] = patch[key];
        if (MOON_LOADOUTS.some(l => l.id === patch.loadout)) p.settings.loadout = patch.loadout;
        if (MOON_DIFFICULTIES.some(d => d.id === patch.difficulty)) p.settings.difficulty = patch.difficulty;
      });
    },
    discover(badges, discovered) {
      return transact(p => {
        p.badges = [...new Set([...p.badges, ...badges.filter(id => moonBadgeIds.has(id))])];
        p.discovered = [...new Set([...p.discovered, ...discovered.filter(id => moonDiscoveryIds.has(id))])];
      });
    },
    record(result) {
      if (!result || typeof result.token !== 'string' || !/^[a-zA-Z0-9:-]{1,100}$/.test(result.token)
        || !validMoonCount(result.score) || !validMoonCount(result.cycle) || typeof result.won !== 'boolean'
        || !MOON_DIFFICULTIES.some(d => d.id === result.difficulty) || !MOON_LOADOUTS.some(l => l.id === result.loadout)
        || !['free', 'daily'].includes(result.mode) || (result.mode === 'daily' && (!validMoonDay(result.day) || !result.day))) return structuredClone(cached);
      return transact(p => {
        if (p.recentResults.includes(result.token)) return;
        p.recentResults = [...p.recentResults, result.token].slice(-24);
        if (result.mode === 'daily') {
          if (p.daily.day === result.day) { p.daily.score = Math.max(p.daily.score, result.score); p.daily.won ||= result.won; }
          else if (result.day > p.daily.day) p.daily = { day: result.day, score: result.score, won: result.won };
        } else {
          const category = result.cycle > 0 ? 'overtime' : result.difficulty;
          p.best[category] = Math.max(p.best[category], result.score);
        }
        if (result.won) {
          p.suns++;
          p.winsWith = [...new Set([...p.winsWith, result.loadout])];
          if (p.winsWith.length === MOON_LOADOUTS.length && !p.badges.includes('all-builds')) p.badges.push('all-builds');
        }
      });
    },
  };
}
