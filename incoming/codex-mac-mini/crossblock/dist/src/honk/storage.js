import { HONK_PROFILE_KEY, HONK_PROFILE_VERSION } from '../contracts.js';
import { HONK_AWARDS, HONK_TIES, earnedHonkAwards } from '../sim/honk-content.js';

export function defaultHonkProfile() {
  return { version: HONK_PROFILE_VERSION, settings: { muted: false, reducedMotion: false, autoHonk: false, mode: 'career', tie: 'orange' },
    best: { career: 0, casual: 0 }, overtime: { career: 0, casual: 0 }, runs: 0, wins: 0, awards: [], lastSeed: 7321 };
}
export function validateHonkProfile(p) {
  const count = n => Number.isSafeInteger(n) && n >= 0 && n <= 1e12;
  const pair = n => n && count(n.career) && count(n.casual);
  const settings = p?.settings;
  return Boolean(p && p.version === HONK_PROFILE_VERSION && settings && ['muted', 'reducedMotion', 'autoHonk'].every(k => typeof settings[k] === 'boolean') &&
    ['career', 'casual'].includes(settings.mode) && HONK_TIES.some(t => t.id === settings.tie) && pair(p.best) && pair(p.overtime) && count(p.runs) && count(p.wins) && p.wins <= p.runs &&
    Number.isInteger(p.lastSeed) && p.lastSeed >= 0 && p.lastSeed <= 0xffffffff && Array.isArray(p.awards) && p.awards.length <= HONK_AWARDS.length && new Set(p.awards).size === p.awards.length &&
    p.awards.every(id => HONK_AWARDS.some(a => a.id === id)) && HONK_TIES.some(t => t.id === settings.tie && (!t.award || p.awards.includes(t.award))));
}
export function recordHonkResult(profile, world) {
  if (!['won', 'lost'].includes(world.phase)) return structuredClone(profile);
  const p = structuredClone(profile), mode = world.mode;
  p.best[mode] = Math.max(p.best[mode], world.score);
  p.overtime[mode] = Math.max(p.overtime[mode], Math.max(0, world.stats.bosses - 1));
  if (world.overtime === 0) { p.runs++; if (world.phase === 'won') p.wins++; }
  p.awards = [...new Set([...p.awards, ...earnedHonkAwards(world)])]; p.lastSeed = world.seed;
  return p;
}
export function createHonkStorage(storage) {
  let profile = defaultHonkProfile(), status = storage ? 'saved' : 'session', protectedData = false, writable = Boolean(storage);
  function read() {
    if (!storage || !writable || protectedData) return null;
    try {
      const raw = storage.getItem(HONK_PROFILE_KEY);
      if (raw === null) return null;
      const parsed = JSON.parse(raw);
      if (!validateHonkProfile(parsed)) { protectedData = true; status = 'protected'; return null; }
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) { protectedData = true; status = 'protected'; }
      else { status = 'session'; writable = false; }
      return null;
    }
  }
  function load() { profile = read() || profile; return structuredClone(profile); }
  function transact(update) {
    const latest = read();
    const next = update(structuredClone(latest || profile));
    if (!validateHonkProfile(next)) throw new Error('Invalid goose career update');
    profile = next;
    if (!storage || protectedData || !writable) return structuredClone(profile);
    try { storage.setItem(HONK_PROFILE_KEY, JSON.stringify(profile)); status = 'saved'; }
    catch { status = 'session'; writable = false; }
    return structuredClone(profile);
  }
  return { load, transact, get status() { return status; } };
}
