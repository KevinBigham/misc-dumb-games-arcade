/** A deliberately simple rescue-first pilot for deterministic integration tests. */
export function lightPilot(w) {
  const p = w.player, b = w.beacon;
  const distance = target => Math.hypot(target.x - p.x, target.y - p.y);
  const followers = w.people.filter(person => person.following);
  const waiting = w.people.filter(person => !person.following).sort((a, c) => distance(a) - distance(c));
  const siege = w.enemies.filter(e => ['brute', 'siege'].includes(e.kind) && Math.hypot(e.x - b.x, e.y - b.y) < 140).sort((a, c) => a.hp - c.hp)[0];
  let target = followers.length || p.hp < 50 ? b : waiting[0];
  if (!target) target = { x: 550 + Math.cos(w.tick / 160) * 170, y: 370 + Math.sin(w.tick / 160) * 170 };
  let dx = target.x - p.x, dy = target.y - p.y;
  const length = Math.max(1, Math.hypot(dx, dy)); dx /= length; dy /= length;
  if (length < 10) { dx = 0; dy = 0; }
  for (const e of w.enemies) {
    const d = distance(e);
    if (d < e.radius + 65 && d > 0) { dx += (p.x - e.x) / d * 1.8; dy += (p.y - e.y) / d * 1.8; }
  }
  const hazard = w.hazards.some(h => distance(h) < 48);
  const boss = w.enemies.find(e => e.kind === 'boss');
  return { moveX: dx, moveY: dy, dashPressed: hazard || (length > 180 && w.tick % 120 === 0), pulsePressed: (p.hp < 35 || b.hp < 40) && w.enemies.length > 4, manualAim: Boolean(siege || boss), aimX: (siege || boss)?.x, aimY: (siege || boss)?.y };
}
