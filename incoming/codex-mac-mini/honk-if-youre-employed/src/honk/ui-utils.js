export function parseHonkOffice(value) {
  const match = /^(?:G-)?(\d{1,10})(?:-([CF]))?$/i.exec(String(value).trim());
  if (!match || Number(match[1]) > 0xffffffff) return null;
  return { seed: Number(match[1]), mode: match[2]?.toUpperCase() === 'F' ? 'casual' : 'career' };
}
export function honkDailyOffice(date = new Date()) {
  const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  let seed = 2166136261;
  for (const letter of `GOOSE-${day}`) seed = Math.imul(seed ^ letter.charCodeAt(0), 16777619) >>> 0;
  return { seed, day };
}
