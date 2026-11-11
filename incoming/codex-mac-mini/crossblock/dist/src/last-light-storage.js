import { LIGHT_PROFILE_KEY, LIGHT_PROFILE_VERSION, LIGHT_CHECKPOINT_VERSION, LIGHT } from './contracts.js';
import { MEMORIES, COUNCILS, PROMISES } from './sim/last-light-data.js';

const clone = value => JSON.parse(JSON.stringify(value));
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value, min = 0, max = 1e9) => Number.isInteger(value) && value >= min && value <= max;
const number = (value, min = 0, max = 1e9) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const array = (value, max) => Array.isArray(value) && value.length <= max;
const string = (value, max = 500) => typeof value === 'string' && value.length <= max;
const allNumbers = (value, keys) => object(value) && keys.every(key => number(value[key]));
const names = new Set(MEMORIES.map(m => m.name));
const promiseValid = p => object(p) && PROMISES.some(item => item.id === p.id) && typeof p.broken === 'boolean' && (p.broken ? integer(p.tick) && integer(p.wave, 1, 5) && string(p.reason) : p.tick === null && p.wave === null && p.reason === null);

export function defaultLightProfile() {
  return { version: LIGHT_PROFILE_VERSION, revision: 0, settings: { muted: false, reducedMotion: null }, checkpoint: null, history: [] };
}
export function isSafeLightPoint(w) {
  return w && ((w.phase === 'playing' && w.waveTick === 0) || w.phase === 'council' || w.phase === 'ending');
}
export function makeLightCheckpoint(w) {
  if (!isSafeLightPoint(w)) return null;
  const world = clone(w); world.events = [];
  const checkpoint = { version: LIGHT_CHECKPOINT_VERSION, world };
  return validateLightCheckpoint(checkpoint) ? checkpoint : null;
}

export function validateLightCheckpoint(c) {
  if (!object(c) || c.version !== LIGHT_CHECKPOINT_VERSION || !object(c.world)) return false;
  const w = c.world, p = w.player, b = w.beacon, m = w.mods;
  if (!isSafeLightPoint(w) || !integer(w.seed, 0, 0xffffffff) || !integer(w.rngState, 0, 0xffffffff) || !['story', 'standard'].includes(w.mode)) return false;
  if (!integer(w.wave, 1, 5) || !integer(w.tick, 0, 2e6) || !integer(w.waveTick, 0, 2e6) || !integer(w.nextId, 1, 1e7)) return false;
  if (w.phase === 'council' && (w.wave === 5 || w.waveTick < LIGHT.waveTicks)) return false;
  if (w.phase === 'ending' && (w.wave !== 5 || !w.bossDefeated || w.waveTick < LIGHT.finalTicks)) return false;
  if (!allNumbers(p, ['x', 'y', 'hp', 'maxHp', 'speed', 'radius', 'invulnerable', 'dashTicks', 'dashCooldown', 'shotCooldown', 'pulseCooldown', 'salvage']) || !number(p.angle, -100, 100) || !number(p.dx, -1, 1) || !number(p.dy, -1, 1)) return false;
  if (!number(p.x, 0, LIGHT.width) || !number(p.y, 0, LIGHT.height) || p.hp <= 0 || p.hp > 100 || p.maxHp !== 100 || !number(p.speed, 100, 400) || !array(p.dashHits, 70) || !p.dashHits.every(n => integer(n, 1)) || !integer(p.salvage, 0, 80)) return false;
  if (!allNumbers(b, ['x', 'y', 'hp', 'maxHp', 'radius', 'shotCooldown']) || b.x !== 550 || b.y !== 370 || b.hp <= 0 || b.hp > 100 || b.maxHp !== 100 || ![64, 90].includes(b.radius)) return false;
  if (!allNumbers(m, ['fireRate', 'damage', 'bolts', 'pierce', 'escort', 'escortSpeed', 'recruit', 'healing', 'spawnRate'])) return false;
  if (!['turret', 'mercy', 'magnet', 'orbit', 'closed'].every(key => typeof m[key] === 'boolean') || !number(m.fireRate, 6, 30) || !number(m.damage, 1, 100) || !integer(m.bolts, 1, 2) || !integer(m.escort, 3, 6) || !integer(m.pierce, 1, 3)) return false;
  if (!['enemies', 'bolts', 'hazards', 'beams', 'sparks', 'events'].every(key => Array.isArray(w[key]) && w[key].length === 0)) return false;
  if (!array(w.deck, MEMORIES.length) || w.deck.length !== MEMORIES.length || new Set(w.deck).size !== MEMORIES.length || !w.deck.every(i => integer(i, 0, MEMORIES.length - 1))) return false;
  if (!array(w.memories, 36) || !array(w.people, 36) || !array(w.missing, 36)) return false;
  const identities = [...w.memories, ...w.people, ...w.missing];
  if (!integer(w.personIndex, 4, 36) || w.personIndex !== identities.length || new Set(identities.map(item => item.id)).size !== identities.length || new Set(identities.map(item => item.name)).size !== identities.length) return false;
  if (!identities.every(item => object(item) && integer(item.id, 1, w.nextId - 1) && MEMORIES.some(source => source.name === item.name && source.role === item.role))) return false;
  if (!w.memories.every(item => ['kept', 'burned'].includes(item.status) && MEMORIES.some(source => source.name === item.name && source.text === item.text) && integer(item.night, 1, 5) && integer(item.rescuedTick, 0, w.tick) && (item.status !== 'burned' || (integer(item.burnedNight, 1, 5) && string(item.reason))))) return false;
  if (!w.people.every(item => number(item.x, 0, LIGHT.width) && number(item.y, 0, LIGHT.height) && typeof item.following === 'boolean' && integer(item.capture, 0, 359) && MEMORIES.some(source => source.name === item.name && source.text === item.text))) return false;
  if (!w.missing.every(item => string(item.reason) && integer(item.night, 1, 5) && integer(item.tick, 0, w.tick))) return false;
  if (w.protectedId !== null && !w.memories.some(item => item.id === w.protectedId && item.status === 'kept')) return false;
  if (!allNumbers(w.stats, ['rescued', 'missed', 'kills', 'burned', 'pulses', 'damageTaken', 'highestCombo', 'dashKills', 'salvage', 'beamDodges'])) return false;
  if (w.stats.rescued !== w.memories.length || w.stats.missed !== w.missing.length || w.stats.burned !== w.memories.filter(item => item.status === 'burned').length) return false;
  if (!promiseValid(w.promise) || (w.promise.id === 'none' && w.promise.broken)) return false;
  if (w.promise.id === 'memory' && w.promise.broken !== (w.stats.burned > 0)) return false;
  if (w.promise.id === 'people' && w.promise.broken !== (w.stats.missed > 0)) return false;
  if (!array(w.choices, 4) || w.choices.length !== w.wave - 1 || !w.choices.every((c, i) => object(c) && c.wave === i + 1 && COUNCILS[i].choices.some(option => option.id === c.id && option.name === c.name))) return false;
  if (!array(w.nights, 5) || w.nights.length !== w.wave - (w.phase === 'playing' ? 1 : 0) || !w.nights.every((n, i) => object(n) && n.night === i + 1 && allNumbers(n, ['rescued', 'burned', 'kills']) && array(n.lost, 36) && n.lost.every(name => names.has(name)))) return false;
  if (!array(w.journal, 100) || !w.journal.every(entry => object(entry) && string(entry.kind, 30) && string(entry.text) && integer(entry.night, 1, 5) && integer(entry.tick, 0, w.tick))) return false;
  if (!array(w.seenKinds, 6) || !w.seenKinds.every(kind => ['seeker', 'siege', 'ranged', 'brute', 'warden'].includes(kind))) return false;
  if (!allNumbers(w.nightStart, ['rescued', 'burned', 'missed', 'kills']) || !allNumbers(w, ['combo', 'comboTicks', 'score', 'enemyCountdown', 'personCountdown'])) return false;
  return typeof w.bossSpawned === 'boolean' && typeof w.bossDefeated === 'boolean';
}
export function restoreLightCheckpoint(c) { return validateLightCheckpoint(c) ? clone(c.world) : null; }

function validRecord(r) {
  if (!object(r) || !string(r.id, 80) || !string(r.completedAt, 60) || !integer(r.seed, 0, 0xffffffff) || !['story', 'standard'].includes(r.mode) || typeof r.won !== 'boolean' || !integer(r.night, 1, 5) || !promiseValid(r.promise)) return false;
  if (!['keep', 'release', null].includes(r.decision) || (r.won && r.decision === null) || (!r.won && r.decision !== null)) return false;
  if (!allNumbers(r, ['rescued', 'burned', 'missed', 'kills', 'score', 'dashKills']) || r.burned > r.rescued || r.rescued + r.missed > 36) return false;
  if (!array(r.choices, 4) || !r.choices.every((choice, i) => COUNCILS[i].choices.some(c => c.id === choice))) return false;
  if (!['keptNames', 'burnedNames', 'missingNames'].every(key => array(r[key], 36) && r[key].every(name => names.has(name)))) return false;
  return r.keptNames.length === r.rescued - r.burned && r.burnedNames.length === r.burned && r.missingNames.length === r.missed;
}
export function validateLightProfile(profile) {
  return object(profile) && profile.version === LIGHT_PROFILE_VERSION && integer(profile.revision) && object(profile.settings) && typeof profile.settings.muted === 'boolean' && [true, false, null].includes(profile.settings.reducedMotion) && (profile.checkpoint === null || validateLightCheckpoint(profile.checkpoint)) && array(profile.history, 12) && profile.history.every(validRecord);
}

export function createLightStorage(storage) {
  let loaded = false, raw = null, blocked = false, error = '';
  function load() {
    loaded = true;
    if (!storage) { blocked = true; error = 'This browser cannot save. You can still play and download your ending.'; return defaultLightProfile(); }
    try {
      raw = storage.getItem(LIGHT_PROFILE_KEY);
      if (raw === null) return defaultLightProfile();
      if (raw.length > 750000) throw new Error('Saved record is too large');
      const profile = JSON.parse(raw);
      if (!validateLightProfile(profile)) { blocked = true; error = 'An unsupported or damaged Last Light save was preserved. This run is temporary.'; return defaultLightProfile(); }
      return profile;
    } catch { blocked = true; error = 'The existing save could not be read and was preserved. This run is temporary.'; return defaultLightProfile(); }
  }
  function save(profile) {
    if (!loaded) load();
    if (blocked || !storage) return false;
    if (!validateLightProfile(profile)) { error = 'The checkpoint could not be validated. Your earlier checkpoint is safe.'; return false; }
    try {
      if (storage.getItem(LIGHT_PROFILE_KEY) !== raw) { blocked = true; error = 'Another tab changed the save. This tab is now temporary; reload to use the newer checkpoint.'; return false; }
      const next = clone(profile); next.revision++;
      const serialized = JSON.stringify(next); storage.setItem(LIGHT_PROFILE_KEY, serialized);
      raw = serialized; profile.revision = next.revision; error = ''; return true;
    } catch { error = 'The browser could not save this checkpoint. Your earlier checkpoint is safe.'; return false; }
  }
  return { load, save, get writable() { return !blocked && Boolean(storage); }, get error() { return error; } };
}
