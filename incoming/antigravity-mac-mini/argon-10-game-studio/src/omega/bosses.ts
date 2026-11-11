import { Vec2, angleBetween, dist, fromAngle, lerpAngle } from './math';
import { EnemySpawnProjectile } from './enemies';
import {
  getDomainHighlightColor,
  projectKrasBackbone,
  ProjectedResidue2D,
} from './kras-structure';

export type BossId = 'seraph' | 'leviathan' | 'architect' | 'xenofold_omega';

export interface BossSegment {
  pos: Vec2;
  radius: number;
  hp: number;
  maxHp: number;
  domainTag?: 'p_loop_g12c' | 'switch_ii_pocket' | 'switch_i';
}

export interface BossLaserBeam {
  origin: Vec2;
  angle: number;
  length: number;
  width: number;
  warmup: number;
  activeTimer: number;
  color: string;
}

export interface BossEntity {
  id: BossId;
  name: string;
  subtitle: string;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  hp: number;
  maxHp: number;
  phase: 1 | 2 | 3;
  angle: number;
  shieldAngle: number;
  attackTimer: number;
  patternIndex: number;
  hitFlash: number;
  color: string;
  segments: BossSegment[];
  activeBeams: BossLaserBeam[];
  // 3D rotation state for XENOFOLD-OMEGA (KRAS-G12C AF-P01116)
  yaw3D?: number;
  pitch3D?: number;
  roll3D?: number;
  projectedBackbone?: ProjectedResidue2D[];
}

export function createBoss(id: BossId, spawnPos: Vec2): BossEntity {
  if (id === 'seraph') {
    const maxHp = 2800;
    return {
      id,
      name: 'SERAPH-MKIV',
      subtitle: 'ORBITAL DEFENSE CORE // SECTOR 01 OVERLORD',
      pos: { ...spawnPos },
      vel: { x: 0, y: 0 },
      radius: 58,
      hp: maxHp,
      maxHp,
      phase: 1,
      angle: 0,
      shieldAngle: 0,
      attackTimer: 1.5,
      patternIndex: 0,
      hitFlash: 0,
      color: '#00f2fe',
      segments: [],
      activeBeams: [],
    };
  }

  if (id === 'leviathan') {
    const maxHp = 4400;
    const segments: BossSegment[] = [];
    for (let i = 0; i < 10; i++) {
      segments.push({
        pos: { x: spawnPos.x - (i + 1) * 38, y: spawnPos.y },
        radius: 34 - i * 1.4,
        hp: 350,
        maxHp: 350,
      });
    }
    return {
      id,
      name: 'LEVIATHAN-OMEGA',
      subtitle: 'ARTICULATED CYBER-WYRM // SECTOR 02 DREADNOUGHT',
      pos: { ...spawnPos },
      vel: { x: 0, y: 0 },
      radius: 48,
      hp: maxHp,
      maxHp,
      phase: 1,
      angle: 0,
      shieldAngle: 0,
      attackTimer: 1.4,
      patternIndex: 0,
      hitFlash: 0,
      color: '#ff6a00',
      segments,
      activeBeams: [],
    };
  }

  if (id === 'xenofold_omega') {
    const maxHp = 5800;
    const projected = projectKrasBackbone(spawnPos, 4.2, 0.4, 0.3, 0, 0);
    const g12cNode = projected[11]; // Residue 12 (G12C P-loop weak point)
    const switch2Node = projected[63]; // Residue 64 (Switch-II Allosteric Pocket)
    const switch1Node = projected[33]; // Residue 34 (Switch-I Effector Loop)

    return {
      id: 'xenofold_omega',
      name: 'XENOFOLD-OMEGA // KRAS-G12C',
      subtitle: 'ALPHAFOLD P01116 ALLOSTERIC SOVEREIGN // HIT G12C OR SWITCH-II POCKETS FOR 300% CRIT',
      pos: { ...spawnPos },
      vel: { x: 0, y: 0 },
      radius: 68,
      hp: maxHp,
      maxHp,
      phase: 1,
      angle: 0,
      shieldAngle: 0,
      attackTimer: 1.2,
      patternIndex: 0,
      hitFlash: 0,
      color: '#10b981',
      yaw3D: 0.4,
      pitch3D: 0.3,
      roll3D: 0,
      projectedBackbone: projected,
      segments: [
        {
          pos: { x: g12cNode.screenX, y: g12cNode.screenY },
          radius: 26,
          hp: 1500,
          maxHp: 1500,
          domainTag: 'p_loop_g12c',
        },
        {
          pos: { x: switch2Node.screenX, y: switch2Node.screenY },
          radius: 28,
          hp: 1500,
          maxHp: 1500,
          domainTag: 'switch_ii_pocket',
        },
        {
          pos: { x: switch1Node.screenX, y: switch1Node.screenY },
          radius: 24,
          hp: 1500,
          maxHp: 1500,
          domainTag: 'switch_i',
        },
      ],
      activeBeams: [],
    };
  }

  const maxHp = 6500;
  return {
    id: 'architect',
    name: 'ARCHITECT PRIME',
    subtitle: 'SINGULARITY SOVEREIGN // FINAL OVERDRIVE CORE',
    pos: { ...spawnPos },
    vel: { x: 0, y: 0 },
    radius: 64,
    hp: maxHp,
    maxHp,
    phase: 1,
    angle: 0,
    shieldAngle: 0,
    attackTimer: 1.2,
    patternIndex: 0,
    hitFlash: 0,
    color: '#b721ff',
    segments: [],
    activeBeams: [],
  };
}

export interface BossUpdateResult {
  bullets: EnemySpawnProjectile[];
  phaseChanged: boolean;
  gravityPulse?: { pos: Vec2; radius: number; force: number };
}

export function updateBoss(
  boss: BossEntity,
  dt: number,
  playerPos: Vec2,
  arenaW: number,
  arenaH: number
): BossUpdateResult {
  const bullets: EnemySpawnProjectile[] = [];
  let phaseChanged = false;
  let gravityPulse: { pos: Vec2; radius: number; force: number } | undefined;

  if (boss.hitFlash > 0) boss.hitFlash = Math.max(0, boss.hitFlash - dt * 5);

  const hpRatio = boss.hp / boss.maxHp;
  const newPhase: 1 | 2 | 3 = hpRatio <= 0.35 ? 3 : hpRatio <= 0.7 ? 2 : 1;
  if (newPhase !== boss.phase) {
    boss.phase = newPhase;
    phaseChanged = true;
    boss.attackTimer = 0.6;
  }

  const toPlayer = angleBetween(boss.pos, playerPos);
  boss.shieldAngle += dt * (1.2 + boss.phase * 0.45);

  for (let i = boss.activeBeams.length - 1; i >= 0; i--) {
    const beam = boss.activeBeams[i];
    beam.origin.x = boss.pos.x;
    beam.origin.y = boss.pos.y;
    if (beam.warmup > 0) {
      beam.warmup -= dt;
    } else {
      beam.activeTimer -= dt;
      beam.angle += dt * 0.75 * (i % 2 === 0 ? 1 : -1);
      if (beam.activeTimer <= 0) {
        boss.activeBeams.splice(i, 1);
      }
    }
  }

  if (boss.id === 'seraph') {
    boss.angle = lerpAngle(boss.angle, toPlayer, dt * 2.5);
    const desiredDist = 340;
    const curDist = dist(boss.pos, playerPos);
    const moveDir = curDist > desiredDist ? 1 : -0.4;
    const v = fromAngle(toPlayer + 0.45, 115 * moveDir);
    boss.pos.x = Math.max(180, Math.min(arenaW - 180, boss.pos.x + v.x * dt));
    boss.pos.y = Math.max(180, Math.min(arenaH - 180, boss.pos.y + v.y * dt));

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0) {
      boss.patternIndex = (boss.patternIndex + 1) % 3;
      if (boss.patternIndex === 0) {
        const count = 12 + boss.phase * 4;
        for (let i = 0; i < count; i++) {
          const a = boss.shieldAngle + (i * Math.PI * 2) / count;
          bullets.push({
            pos: { ...boss.pos },
            vel: fromAngle(a, 370 + boss.phase * 45),
            radius: 7,
            damage: 19,
            color: '#00f2fe',
          });
        }
        boss.attackTimer = 1.4 - boss.phase * 0.2;
      } else if (boss.patternIndex === 1) {
        for (let i = -3; i <= 3; i++) {
          bullets.push({
            pos: { ...boss.pos },
            vel: fromAngle(toPlayer + i * 0.14, 520),
            radius: 8,
            damage: 22,
            color: '#ff0844',
          });
        }
        boss.attackTimer = 1.3;
      } else {
        boss.activeBeams.push(
          {
            origin: { ...boss.pos },
            angle: toPlayer - 0.55,
            length: 1100,
            width: 18,
            warmup: 0.75,
            activeTimer: 2.2,
            color: '#00f2fe',
          },
          {
            origin: { ...boss.pos },
            angle: toPlayer + 0.55,
            length: 1100,
            width: 18,
            warmup: 0.75,
            activeTimer: 2.2,
            color: '#ff0844',
          }
        );
        boss.attackTimer = 3.1;
      }
    }
  } else if (boss.id === 'leviathan') {
    const steerAngle = toPlayer + Math.sin(boss.shieldAngle * 1.7) * 0.55;
    boss.angle = lerpAngle(boss.angle, steerAngle, dt * 3.4);
    const speed = 240 + boss.phase * 35;
    const v = fromAngle(boss.angle, speed);
    boss.pos.x = Math.max(140, Math.min(arenaW - 140, boss.pos.x + v.x * dt));
    boss.pos.y = Math.max(140, Math.min(arenaH - 140, boss.pos.y + v.y * dt));

    let prevPos = boss.pos;
    for (const seg of boss.segments) {
      const segAngle = angleBetween(seg.pos, prevPos);
      const spacing = 36;
      seg.pos.x = prevPos.x - Math.cos(segAngle) * spacing;
      seg.pos.y = prevPos.y - Math.sin(segAngle) * spacing;
      prevPos = seg.pos;
    }

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0) {
      boss.attackTimer = Math.max(0.75, 1.5 - boss.phase * 0.22);
      boss.segments.forEach((seg, idx) => {
        if (idx % 2 === boss.patternIndex % 2) {
          const a = angleBetween(seg.pos, playerPos);
          bullets.push({
            pos: { ...seg.pos },
            vel: fromAngle(a, 420),
            radius: 7,
            damage: 18,
            color: '#ff6a00',
          });
        }
      });
      boss.patternIndex++;
    }
  } else if (boss.id === 'xenofold_omega') {
    // Update 3D AlphaFold KRAS-G12C rotation & project all 189 C-alpha residues!
    boss.yaw3D = (boss.yaw3D ?? 0) + dt * (0.95 + boss.phase * 0.25);
    boss.pitch3D = 0.35 + Math.sin(boss.shieldAngle * 0.8) * 0.42;
    boss.roll3D = Math.cos(boss.shieldAngle * 0.5) * 0.25;

    const desiredDist = 330;
    const curDist = dist(boss.pos, playerPos);
    const moveDir = curDist > desiredDist ? 1 : -0.35;
    const v = fromAngle(toPlayer + 0.52, 130 * moveDir);
    boss.pos.x = Math.max(220, Math.min(arenaW - 220, boss.pos.x + v.x * dt));
    boss.pos.y = Math.max(220, Math.min(arenaH - 220, boss.pos.y + v.y * dt));

    const projected = projectKrasBackbone(
      boss.pos,
      4.3,
      boss.yaw3D,
      boss.pitch3D,
      boss.roll3D,
      boss.shieldAngle
    );
    boss.projectedBackbone = projected;

    // Update 3D Weak-Point Segment Hitboxes (G12C P-loop [12], Switch-II [64], Switch-I [34])
    if (boss.segments[0] && projected[11]) {
      boss.segments[0].pos.x = projected[11].screenX;
      boss.segments[0].pos.y = projected[11].screenY;
    }
    if (boss.segments[1] && projected[63]) {
      boss.segments[1].pos.x = projected[63].screenX;
      boss.segments[1].pos.y = projected[63].screenY;
    }
    if (boss.segments[2] && projected[33]) {
      boss.segments[2].pos.x = projected[33].screenX;
      boss.segments[2].pos.y = projected[33].screenY;
    }

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0) {
      boss.patternIndex = (boss.patternIndex + 1) % 3;
      if (boss.patternIndex === 0) {
        // Double-Helix DNA Bullet Curtain from Switch-I & Switch-II pockets
        const strandCount = 10 + boss.phase * 4;
        const origin = boss.segments[2]?.pos ?? boss.pos;
        for (let i = 0; i < strandCount; i++) {
          const a = boss.shieldAngle + (i * Math.PI * 2) / strandCount;
          bullets.push(
            {
              pos: { ...origin },
              vel: fromAngle(a, 410),
              radius: 7,
              damage: 20,
              color: '#00f2fe',
            },
            {
              pos: { ...origin },
              vel: fromAngle(a + 0.14, 360),
              radius: 7,
              damage: 20,
              color: '#10b981',
            }
          );
        }
        boss.attackTimer = 1.35;
      } else if (boss.patternIndex === 1) {
        // Allosteric Implosion + Disordered HVR Tail Whip Barrage
        gravityPulse = { pos: { ...boss.pos }, radius: 520, force: 480 };
        const tailTip = projected[188] ?? { screenX: boss.pos.x, screenY: boss.pos.y };
        for (let i = -3; i <= 3; i++) {
          bullets.push({
            pos: { x: tailTip.screenX, y: tailTip.screenY },
            vel: fromAngle(toPlayer + i * 0.13, 560),
            radius: 8,
            damage: 22,
            color: '#facc15',
          });
        }
        boss.attackTimer = 1.25;
      } else {
        // Twin Conformational Switch Laser Sweep
        boss.activeBeams.push(
          {
            origin: { ...boss.pos },
            angle: toPlayer - 0.5,
            length: 1150,
            width: 18,
            warmup: 0.7,
            activeTimer: 2.1,
            color: '#10b981',
          },
          {
            origin: { ...boss.pos },
            angle: toPlayer + 0.5,
            length: 1150,
            width: 18,
            warmup: 0.7,
            activeTimer: 2.1,
            color: '#0053d6',
          }
        );
        boss.attackTimer = 2.8;
      }
    }
  } else {
    // ARCHITECT PRIME
    boss.angle += dt * 1.5;
    const orbitVec = fromAngle(toPlayer + Math.PI * 0.35, 165);
    boss.pos.x = Math.max(200, Math.min(arenaW - 200, boss.pos.x + orbitVec.x * dt));
    boss.pos.y = Math.max(200, Math.min(arenaH - 200, boss.pos.y + orbitVec.y * dt));

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0) {
      boss.patternIndex = (boss.patternIndex + 1) % 3;
      if (boss.patternIndex === 0) {
        gravityPulse = { pos: { ...boss.pos }, radius: 560, force: 520 };
        const count = 16 + boss.phase * 4;
        for (let i = 0; i < count; i++) {
          const a = (i * Math.PI * 2) / count + boss.shieldAngle;
          bullets.push({
            pos: { ...boss.pos },
            vel: fromAngle(a, 440),
            radius: 8,
            damage: 22,
            color: '#b721ff',
          });
        }
        boss.attackTimer = 1.45;
      } else if (boss.patternIndex === 1) {
        for (let i = 0; i < 4; i++) {
          boss.activeBeams.push({
            origin: { ...boss.pos },
            angle: toPlayer + (i * Math.PI) / 2,
            length: 1200,
            width: 20,
            warmup: 0.7,
            activeTimer: 2.0,
            color: '#b721ff',
          });
        }
        boss.attackTimer = 2.9;
      } else {
        for (let i = -4; i <= 4; i++) {
          bullets.push({
            pos: { ...boss.pos },
            vel: fromAngle(toPlayer + i * 0.11, 610),
            radius: 7,
            damage: 24,
            color: '#00f2fe',
          });
        }
        boss.attackTimer = 1.1;
      }
    }
  }

  return { bullets, phaseChanged, gravityPulse };
}

export function renderBoss(ctx: CanvasRenderingContext2D, boss: BossEntity): void {
  // 1. Render active/telegraphing laser beams
  for (const beam of boss.activeBeams) {
    const endX = beam.origin.x + Math.cos(beam.angle) * beam.length;
    const endY = beam.origin.y + Math.sin(beam.angle) * beam.length;
    ctx.save();
    if (beam.warmup > 0) {
      ctx.strokeStyle = 'rgba(255, 8, 68, 0.55)';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(beam.origin.x, beam.origin.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else {
      ctx.strokeStyle = beam.color;
      ctx.lineWidth = beam.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(beam.origin.x, beam.origin.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = beam.width * 0.4;
      ctx.beginPath();
      ctx.moveTo(beam.origin.x, beam.origin.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Special 3D AlphaFold Polypeptide Ribbon Renderer for XENOFOLD-OMEGA (KRAS-G12C P01116)!
  if (boss.id === 'xenofold_omega' && boss.projectedBackbone) {
    const pts = boss.projectedBackbone;
    ctx.save();

    // Outer allosteric containment halo
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(boss.pos.x, boss.pos.y, boss.radius + 32, 0, Math.PI * 2);
    ctx.stroke();

    // Draw 3D C-alpha polypeptide backbone colored by AlphaFold pLDDT & Functional Domains
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const col =
        boss.hitFlash > 0.1 ? '#ffffff' : getDomainHighlightColor(a.domain, a.plddt);
      ctx.strokeStyle = col;
      ctx.lineWidth = a.domain === 'core' ? 4.2 : 6.5;
      ctx.beginPath();
      ctx.moveTo(a.screenX, a.screenY);
      ctx.lineTo(b.screenX, b.screenY);
      ctx.stroke();
    }

    // Draw C-alpha spheres at key residues
    for (let i = 0; i < pts.length; i += 2) {
      const p = pts[i];
      ctx.fillStyle = getDomainHighlightColor(p.domain, p.plddt);
      ctx.beginPath();
      ctx.arc(p.screenX, p.screenY, p.domain === 'core' ? 2.6 : 4.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render targetable 3D Structural Pocket Callout Nodes (G12C P-loop, Switch-II, Switch-I)
    const labels = [
      { idx: 0, text: 'G12C P-LOOP [300% CRIT]', color: '#00f2fe' },
      { idx: 1, text: 'SWITCH-II POCKET [PROTAC]', color: '#ff6a00' },
      { idx: 2, text: 'SWITCH-I LOOP', color: '#b721ff' },
    ];
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (const lb of labels) {
      const seg = boss.segments[lb.idx];
      if (!seg) continue;
      ctx.strokeStyle = lb.color;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.arc(seg.pos.x, seg.pos.y, seg.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = lb.color;
      ctx.fillText(lb.text, seg.pos.x, seg.pos.y - seg.radius - 6);
    }

    ctx.restore();
    return;
  }

  // 2. Render articulated segments (Leviathan)
  for (let i = boss.segments.length - 1; i >= 0; i--) {
    const seg = boss.segments[i];
    ctx.save();
    ctx.translate(seg.pos.x, seg.pos.y);
    ctx.fillStyle = 'rgba(20, 14, 28, 0.92)';
    ctx.strokeStyle = boss.hitFlash > 0.1 ? '#ffffff' : boss.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, seg.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = boss.color;
    ctx.beginPath();
    ctx.arc(0, 0, seg.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. Render Main Boss Core
  ctx.save();
  ctx.translate(boss.pos.x, boss.pos.y);

  ctx.strokeStyle = boss.hitFlash > 0.1 ? '#ffffff' : boss.color;
  ctx.lineWidth = 3.5;
  for (let i = 0; i < 3; i++) {
    const startA = boss.shieldAngle + (i * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius + 14, startA, startA + Math.PI * 0.42);
    ctx.stroke();
  }

  ctx.rotate(boss.angle);
  ctx.fillStyle = boss.hitFlash > 0.1 ? 'rgba(255,255,255,0.8)' : 'rgba(10, 14, 26, 0.95)';
  ctx.strokeStyle = boss.hitFlash > 0.1 ? '#ffffff' : boss.color;
  ctx.lineWidth = 3.5;

  const sides = boss.id === 'seraph' ? 6 : boss.id === 'leviathan' ? 5 : 8;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i * Math.PI * 2) / sides;
    const px = Math.cos(a) * boss.radius;
    const py = Math.sin(a) * boss.radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = boss.color;
  ctx.beginPath();
  ctx.arc(0, 0, boss.radius * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
