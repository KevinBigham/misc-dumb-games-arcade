// Seeded RNG (mulberry32). State is a single uint32 so it can be saved as a number.
export function seedToState(seed) {
  const s = String(seed);
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

// Returns [integer in 0..n-1, nextState]. Pure: never mutates anything.
export function rngInt(state, n) {
  const t = (state + 0x6D2B79F5) >>> 0;
  let r = Math.imul(t ^ (t >>> 15), t | 1);
  r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
  const v = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  return [Math.floor(v * n), t];
}
