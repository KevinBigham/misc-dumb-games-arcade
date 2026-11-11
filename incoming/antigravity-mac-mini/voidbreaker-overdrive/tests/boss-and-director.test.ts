import { describe, expect, it } from 'vitest';
import { createBoss, updateBoss } from '../src/game/bosses';
import { createEnemy, isBlockedByPhalanxShield } from '../src/game/enemies';
import { SoundEngine } from '../src/audio/sound-engine';
import { createDefaultProfile } from '../src/game/persistence';
import { GameWorld } from '../src/game/state';

describe('Boss Encounters & Phalanx Shield Mechanics', () => {
  it('transitions Boss phases at 70% and 35% health thresholds', () => {
    const seraph = createBoss('seraph', { x: 1000, y: 1000 });
    expect(seraph.phase).toBe(1);

    seraph.hp = seraph.maxHp * 0.65;
    const res2 = updateBoss(seraph, 0.016, { x: 1200, y: 1200 }, 2400, 2400);
    expect(seraph.phase).toBe(2);
    expect(res2.phaseChanged).toBe(true);

    seraph.hp = seraph.maxHp * 0.3;
    const res3 = updateBoss(seraph, 0.016, { x: 1200, y: 1200 }, 2400, 2400);
    expect(seraph.phase).toBe(3);
    expect(res3.phaseChanged).toBe(true);
  });

  it('blocks non-piercing frontal hits on Aegis Phalanx but allows flank or railgun pierce hits', () => {
    const phalanx = createEnemy(1, 'phalanx', { x: 500, y: 500 });
    phalanx.angle = 0; // Facing right (+X)

    // Frontal shot from right (+X) with 0 pierce -> blocked!
    expect(isBlockedByPhalanxShield(phalanx, { x: 520, y: 500 }, 0)).toBe(true);
    // Frontal shot with pierce > 0 (e.g. Chronos Railgun) -> pierces shield!
    expect(isBlockedByPhalanxShield(phalanx, { x: 520, y: 500 }, 2)).toBe(false);
    // Flank shot from behind (-X) -> hits unshielded rear!
    expect(isBlockedByPhalanxShield(phalanx, { x: 480, y: 500 }, 0)).toBe(false);
  });

  it('deflects enemy projectiles and triggers Witch-Time in GameWorld', () => {
    const profile = createDefaultProfile();
    const sound = new SoundEngine();
    const world = new GameWorld(
      profile,
      sound,
      {
        onLevelUpDraft: () => {},
        onGameOver: () => {},
        onToast: () => {},
      },
      'TEST-SEED'
    );

    // Spawn a hostile projectile right in front of Valkyrie
    world.playerAngle = 0;
    world.projectiles.push({
      id: 999,
      pos: { x: world.playerPos.x + 50, y: world.playerPos.y },
      vel: { x: -300, y: 0 },
      radius: 6,
      damage: 20,
      color: '#ff0844',
      fromPlayer: false,
      pierce: 0,
      bounces: 0,
      isCrit: false,
      ttl: 2,
      hitIds: new Set(),
    });

    // Dashing near the bullet triggers Perfect-Dash Witch-Time!
    world.triggerDash({ x: 0, y: 1 });
    expect(world.witchTimeTimer).toBeGreaterThan(2.0);

    // Alt-Fire with Valkyrie parries the bullet back!
    world.triggerAltFire({ x: world.playerPos.x + 200, y: world.playerPos.y });
    expect(world.projectiles[0].fromPlayer).toBe(true);
    expect(world.projectiles[0].isParried).toBe(true);
    expect(world.parriesCount).toBe(1);
  });
});
