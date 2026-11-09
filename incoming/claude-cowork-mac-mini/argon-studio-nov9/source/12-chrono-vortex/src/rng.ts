export interface SeededRngState {
  seed: number;
  state: number;
  calls: number;
}

export function createRng(seed: number): SeededRngState {
  const clean = (Math.abs(Math.floor(seed)) || 20261108) >>> 0;
  return {
    seed: clean,
    state: clean === 0 ? 0x6d2b79f5 : clean,
    calls: 0,
  };
}

export function nextRandom(rng: SeededRngState): number {
  rng.calls += 1;
  let t = (rng.state += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  rng.state = t >>> 0;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function nextFloat(rng: SeededRngState, min: number, max: number): number {
  return min + nextRandom(rng) * (max - min);
}

export function nextInt(rng: SeededRngState, min: number, maxInclusive: number): number {
  return Math.floor(nextFloat(rng, min, maxInclusive + 1));
}

export function pickRandom<T>(rng: SeededRngState, items: readonly T[]): T {
  const idx = nextInt(rng, 0, Math.max(0, items.length - 1));
  return items[idx];
}
