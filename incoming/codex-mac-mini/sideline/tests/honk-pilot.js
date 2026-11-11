// Ordinary game actions only. This policy plays the complete three-shift loop.
export function honkPilot(s) {
  const p = s.player, dist = t => Math.hypot(t.x - p.x, t.y - p.y);
  const boss = s.enemies.find(e => e.kind === 'boss');
  let target = p.hp < p.maxHp - 1 ? [...s.snacks].sort((a, b) => dist(a) - dist(b))[0] : null;
  target ||= boss || [...s.props.filter(o => !o.broken), ...s.enemies].sort((a, b) => dist(a) - dist(b))[0];
  target ||= { x: 600, y: 350 };
  const d = dist(target), enemyTarget = s.enemies.includes(target), keepAway = enemyTarget && d < p.range * .75;
  let x = (target.x - p.x) / (d || 1), y = (target.y - p.y) / (d || 1);
  if (keepAway) { x *= -.7; y *= -.7; }
  if (s.tick % 180 > 140) { const old = x; x = -y; y = old; }
  return { x, y, honk: true, reply: s.charge >= 100 && (s.enemies.length >= 5 || Boolean(boss)), dash: p.hp < 3 && s.tick % 150 === 0 };
}

export const HONK_PILOT_UPGRADES = ['megaphone', 'espresso', 'reply', 'benefits', 'lunch', 'legal', 'bowling', 'unsubscribe', 'union'];
