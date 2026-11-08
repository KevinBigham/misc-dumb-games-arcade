/**
 * Deterministic seeded PRNG (Mulberry32) with serializable 32-bit state.
 */
export interface SeededRng {
  /** Advance state and return float in [0, 1) */
  nextFloat(): number;
  /** Advance state and return integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
  /** Return current internal 32-bit unsigned state for persistence */
  getState(): number;
  /** Create an independent clone at the current state */
  clone(): SeededRng;
}

export function normalizeSeed(seed: number): number {
  const n = Number.isFinite(seed) ? Math.floor(seed) : 202601;
  // Ensure non-zero unsigned 32-bit integer
  return (n >>> 0) || 1;
}

export function createRng(initialState: number): SeededRng {
  let state = normalizeSeed(initialState);

  function nextFloat(): number {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function nextInt(min: number, max: number): number {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    if (lo >= hi) return lo;
    return lo + Math.floor(nextFloat() * (hi - lo + 1));
  }

  function getState(): number {
    return state >>> 0;
  }

  function clone(): SeededRng {
    return createRng(state);
  }

  return {
    nextFloat,
    nextInt,
    getState,
    clone,
  };
}
