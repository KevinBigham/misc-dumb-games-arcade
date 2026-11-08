import { CROSSBLOCK_PROFILE_VERSION as VERSION, CROSSBLOCK_PROFILE_KEY as KEY } from './contracts.js';

export function createCrossblockStorage(storage) {
  let protectedData = false;
  let available = true;
  let profile = { version: VERSION, bestScore: 0, muted: false };
  try {
    const raw = storage?.getItem(KEY);
    if (raw != null) {
      const data = JSON.parse(raw);
      if (data?.version !== VERSION || !Number.isSafeInteger(data.bestScore) || data.bestScore < 0 || typeof data.muted !== 'boolean') protectedData = true;
      else profile = { version: VERSION, bestScore: data.bestScore, muted: data.muted };
    }
  } catch { protectedData = true; available = false; }
  return {
    load: () => ({ ...profile }),
    get writable() { return !protectedData && available && !!storage; },
    save(next) {
      if (protectedData || !storage || !Number.isSafeInteger(next.bestScore) || next.bestScore < 0 || typeof next.muted !== 'boolean') return false;
      try {
        // Merge another tab's best; never replace a future or malformed profile.
        const raw = storage.getItem(KEY);
        const existing = raw == null ? profile : JSON.parse(raw);
        if (existing?.version !== VERSION || !Number.isSafeInteger(existing.bestScore) || existing.bestScore < 0 || typeof existing.muted !== 'boolean') {
          protectedData = true; return false;
        }
        profile = { version: VERSION, bestScore: Math.max(profile.bestScore, existing.bestScore, next.bestScore), muted: next.muted };
        storage.setItem(KEY, JSON.stringify(profile));
        available = true;
        return true;
      } catch { available = false; return false; }
    },
  };
}
