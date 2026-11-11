/** Every gameplay draw advances this serializable, unsigned 32-bit state. */
export function normalizeSeed(value = 1) {
  const numeric = typeof value === 'number' || (typeof value === 'string' && value.trim() !== '') ? Number(value) : NaN;
  return Number.isFinite(numeric) ? Math.trunc(numeric) >>> 0 : 1;
}

export function random(world) {
  world.rngState = (world.rngState + 0x6d2b79f5) >>> 0;
  let value = world.rngState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function choose(world, values) {
  return values[Math.floor(random(world) * values.length)];
}
