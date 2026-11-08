/** Only preferences and run records persist; combat state never enters this schema. */
export const PROFILE_KEY = 'echo-requiem.profile';
const defaults = () => ({ version: 1, settings: { muted: false, reducedMotion: false }, bestScore: 0, lastSeed: 1 });
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function sanitize(value) {
  const profile = defaults();
  if (!isRecord(value)) return profile;
  if (isRecord(value.settings)) {
    profile.settings.muted = value.settings.muted === true;
    profile.settings.reducedMotion = value.settings.reducedMotion === true;
  }
  if (Number.isSafeInteger(value.bestScore) && value.bestScore >= 0) profile.bestScore = value.bestScore;
  if (Number.isInteger(value.lastSeed) && value.lastSeed >= 0 && value.lastSeed <= 0xffffffff) profile.lastSeed = value.lastSeed;
  return profile;
}

export function createStorage(storage) {
  let writable = true;
  let backend = storage;
  if (backend === undefined) {
    try { backend = globalThis.localStorage; } catch { writable = false; }
  }
  if (!backend || typeof backend.getItem !== 'function' || typeof backend.setItem !== 'function') writable = false;

  function read() {
    if (!backend || !writable) return defaults();
    let raw;
    try { raw = backend.getItem(PROFILE_KEY); } catch { writable = false; return defaults(); }
    if (raw === null) return defaults();
    let value;
    try { value = JSON.parse(raw); } catch { return defaults(); }
    // Fail closed on every explicit, unrecognized version. Never migrate by guessing.
    if (isRecord(value) && Object.hasOwn(value, 'version') && value.version !== 1) {
      writable = false;
      return defaults();
    }
    return sanitize(value);
  }

  // Inspect before allowing the first write, even when the caller skips load().
  read();
  return {
    load: read,
    save(profile) {
      const current = read(); // Preserve newer schemas and records written by another tab.
      if (!writable || !isRecord(profile) || profile.version !== 1) return false;
      const next = sanitize(profile);
      next.bestScore = Math.max(current.bestScore, next.bestScore);
      try { backend.setItem(PROFILE_KEY, JSON.stringify(next)); return true; }
      catch { writable = false; return false; }
    },
    get writable() { return writable; },
  };
}
