// Browser-acceptance helper only. Reads inspect() snapshots and returns legal input.
// Does not mutate the world, advance time, grant health, or invoke game actions.
export function createKeyboardPilot() {
  const directions = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  let nextFork = 259;
  return function sample(world) {
    const player = world.player;
    const rx = player.x - 640, ry = player.y - 360;
    const radius = Math.hypot(rx, ry) || 1;
    const correction = (225 - radius) / 80;
    const desiredX = radius === 1 ? 1 : -ry / radius + rx / radius * correction;
    const desiredY = radius === 1 ? 0 : rx / radius + ry / radius * correction;
    const desiredLength = Math.hypot(desiredX, desiredY);
    // inspect() already filters to hostile bullets; full test worlds include owner.
    const threats = world.projectiles.filter(projectile => !projectile.owner || projectile.owner === 'enemy');
    let best = null;
    for (const [moveX, moveY] of directions) {
      const length = Math.hypot(moveX, moveY);
      const vx = moveX / length * 260, vy = moveY / length * 260;
      let cost = 4 * (1 - (moveX / length * desiredX + moveY / length * desiredY) / desiredLength);
      for (const seconds of [0.12, 0.24, 0.4]) {
        const x = player.x + vx * seconds, y = player.y + vy * seconds;
        cost += Math.max(0, Math.hypot(x - 640, y - 360) - 285) * 2;
        if (world.boss) cost += Math.max(0, 85 - Math.hypot(x - world.boss.x, y - world.boss.y));
        for (const projectile of threats) {
          const distance = Math.hypot(projectile.x + projectile.vx * seconds - x, projectile.y + projectile.vy * seconds - y);
          cost += Math.max(0, 30 - distance) * 8;
        }
      }
      if (!best || cost < best.cost) best = {moveX, moveY, cost};
    }
    const enemies = world.enemies.filter(enemy => enemy.spawnTicks === 0);
    enemies.sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));
    const target = world.boss || enemies[0] || {x: 640, y: 360};
    const forkPressed = world.tick >= nextFork;
    if (forkPressed) nextFork += 260;
    return {
      moveX: best.moveX, moveY: best.moveY,
      aimX: target.x, aimY: target.y, fire: true, forkPressed,
      dashPressed: player.dashCooldown === 0 && threats.some(projectile => Math.hypot(projectile.x - player.x, projectile.y - player.y) < 25),
    };
  };
}

export function choosePilotUpgrade(offers) {
  return ['damage', 'echo', 'fire-rate', 'vitality', 'pierce', 'fork-burst'].find(id => offers.some(offer => offer.id === id));
}
