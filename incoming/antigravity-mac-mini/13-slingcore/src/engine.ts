import { SlingSynth } from './synth';
import {
  type UpgradeCard,
  type UpgradeId,
  UPGRADE_CATALOG,
  rollUpgradeChoices,
} from './upgrades';

export type EnemyKind = 'drifter' | 'dasher' | 'shielded' | 'pulse_orb';

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  angle: number;
  spawnTimer: number; // > 0 means telegraphing arrival (invulnerable & harmless for 0.65s)
  telegraphTimer: number; // for dasher lock-on or pulse_orb detonation
  dashCooldown: number;
  isDashing: boolean;
  dashTimer: number;
  scaleX: number;
  scaleY: number;
  hitFlash: number;
}

export interface ArenaBumper {
  x: number;
  y: number;
  radius: number;
  pulse: number;
}

export interface PhantomTwin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bouncesLeft: number;
  trail: Array<{ x: number; y: number }>;
}

export interface PlasmaWakeNode {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface GravityVortex {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: 'cyan' | 'crimson' | 'white';
  lineWidth: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: 'cyan' | 'crimson' | 'white' | 'gold';
}

export interface FloatingPop {
  x: number;
  y: number;
  vy: number;
  text: string;
  subtext?: string;
  life: number;
  maxLife: number;
  scale: number;
  color: 'cyan' | 'crimson' | 'white' | 'gold';
}

export interface WallRipple {
  side: 'left' | 'right' | 'top' | 'bottom';
  pos: number; // coordinate along the wall
  intensity: number;
  life: number;
}

export const WAVE_DURATION = 30.0; // 30-second waves (Rule 3 & Rule 7)
export const CHARGE_FULL_TIME = 0.70;
export const OVERCHARGE_MAX_TIME = 1.85;
export const OVERHEAT_LIMIT_TIME = 2.05;
export const LAUNCH_MIN_SPEED = 680;
export const LAUNCH_MAX_SPEED = 1480;
export const LETHAL_SPEED_THRESHOLD = 310;

export function createSeededRng(seed: number): () => number {
  let s = seed >>> 0 || 20261108;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SlingCoreEngine {
  public width = 960;
  public height = 600;
  public wallPadding = 28;

  public phase: 'playing' | 'upgrade_draft' | 'gameover' = 'playing';
  public wave = 1;
  public waveTimer = WAVE_DURATION;
  public score = 0;
  public scorePopScale = 1;

  // Push-your-luck unbanked chain state (Rule 4)
  public chainCount = 0;
  public unbankedPoints = 0;
  public maxChainReached = 0;
  public totalKills = 0;

  // Player Core Entity (Rule 1)
  public player = {
    x: 480,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 18,
    hp: 3,
    maxHp: 3,
    invulnTimer: 0,
    stunTimer: 0,
    aimAngle: 0,
    visualAngle: 0,
    isCharging: false,
    chargeTime: 0,
    chargeRatio: 0, // 0..1
    overchargeRatio: 0, // 0..1 (push-your-luck zone)
    isLaunching: false,
    bouncesInLaunch: 0,
    maxBouncesForLaunch: 4,
    usedBoomerangThisFlight: false,
    anchorX: 480,
    anchorY: 300,
    tetherActiveTimer: 0,
    // Squash-and-stretch spring physics (Rule 6)
    scaleX: 1,
    scaleY: 1,
    scaleVelX: 0,
    scaleVelY: 0,
    trail: [] as Array<{ x: number; y: number; scaleX: number; scaleY: number; angle: number }>,
    glaiveAngle: 0,
  };

  // Input state (Mouse OR 2-3 Keys — Rule 2)
  public pointer = {
    x: 640,
    y: 300,
    isDown: false,
    usingKeyboard: false,
    turnLeft: false,
    turnRight: false,
  };

  // Juice state (Rule 6)
  public hitStopTimer = 0; // 30-50ms freeze frame on heavy impacts
  public shakeX = 0;
  public shakeY = 0;
  public shakeVx = 0;
  public shakeVy = 0;
  public flashIntensity = 0;
  public hasLaunchedEver = false;

  // Entities & Upgrades
  public ownedUpgrades = new Set<UpgradeId>();
  public draftChoices: UpgradeCard[] = [];
  public enemies: EnemyEntity[] = [];
  public bumpers: ArenaBumper[] = [];
  public phantomTwins: PhantomTwin[] = [];
  public plasmaWake: PlasmaWakeNode[] = [];
  public vortices: GravityVortex[] = [];
  public shockwaves: ShockwaveRing[] = [];
  public particles: Particle[] = [];
  public floatingPops: FloatingPop[] = [];
  public wallRipples: WallRipple[] = [];

  private nextEnemyId = 1;
  private spawnCooldown = 0.45;
  private wakeEmitTimer = 0;
  private tetherZapCooldown = 0;
  private rng: () => number;
  public synth: SlingSynth;

  constructor(seed = 20261108, synth = new SlingSynth()) {
    this.rng = createSeededRng(seed);
    this.synth = synth;
    this.resetRun(seed);
  }

  public resetRun(seed?: number): void {
    if (seed !== undefined) {
      this.rng = createSeededRng(seed);
    }
    this.phase = 'playing';
    this.wave = 1;
    this.waveTimer = WAVE_DURATION;
    this.score = 0;
    this.scorePopScale = 1;
    this.chainCount = 0;
    this.unbankedPoints = 0;
    this.maxChainReached = 0;
    this.totalKills = 0;

    this.player.x = this.width * 0.5;
    this.player.y = this.height * 0.5;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = 3;
    this.player.invulnTimer = 0;
    this.player.stunTimer = 0;
    this.player.aimAngle = 0;
    this.player.visualAngle = 0;
    this.player.isCharging = false;
    this.player.chargeTime = 0;
    this.player.chargeRatio = 0;
    this.player.overchargeRatio = 0;
    this.player.isLaunching = false;
    this.player.bouncesInLaunch = 0;
    this.player.usedBoomerangThisFlight = false;
    this.player.tetherActiveTimer = 0;
    this.player.scaleX = 1;
    this.player.scaleY = 1;
    this.player.scaleVelX = 0;
    this.player.scaleVelY = 0;
    this.player.trail = [];

    this.hitStopTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeVx = 0;
    this.shakeVy = 0;
    this.flashIntensity = 0;

    this.ownedUpgrades.clear();
    this.draftChoices = [];
    this.enemies = [];
    this.bumpers = [];
    this.phantomTwins = [];
    this.plasmaWake = [];
    this.vortices = [];
    this.shockwaves = [];
    this.particles = [];
    this.floatingPops = [];
    this.wallRipples = [];

    this.setupWaveArena(1);
    // Spawn 2 initial Wave 1 Drifters immediately so player has targets within 1 second
    this.spawnWaveEnemy();
    this.spawnWaveEnemy();
    for (const e of this.enemies) {
      e.spawnTimer = 0.25;
    }
    this.spawnCooldown = 1.6;
  }

  public resize(width: number, height: number): void {
    const oldW = this.width;
    const oldH = this.height;
    this.width = Math.max(480, width);
    this.height = Math.max(360, height);
    if (oldW > 0 && oldH > 0) {
      this.player.x = Math.max(
        this.wallPadding + this.player.radius,
        Math.min(this.width - this.wallPadding - this.player.radius, (this.player.x / oldW) * this.width),
      );
      this.player.y = Math.max(
        this.wallPadding + this.player.radius,
        Math.min(this.height - this.wallPadding - this.player.radius, (this.player.y / oldH) * this.height),
      );
    }
    if (this.wave >= 3) {
      this.positionBumpers();
    }
  }

  private positionBumpers(): void {
    if (this.wave < 3) {
      this.bumpers = [];
      return;
    }
    const cx = this.width * 0.5;
    const cy = this.height * 0.5;
    const offsetX = Math.min(220, this.width * 0.23);
    if (this.bumpers.length === 0) {
      this.bumpers = [
        { x: cx - offsetX, y: cy, radius: 26, pulse: 0 },
        { x: cx + offsetX, y: cy, radius: 26, pulse: 0 },
      ];
    } else {
      this.bumpers[0].x = cx - offsetX;
      this.bumpers[0].y = cy;
      this.bumpers[1].x = cx + offsetX;
      this.bumpers[1].y = cy;
    }
  }

  private setupWaveArena(waveNum: number): void {
    this.wave = waveNum;
    this.waveTimer = WAVE_DURATION;
    this.positionBumpers();

    // Progressive Reveal Announcement Pop (in-canvas, 0 UI clutter)
    const waveSubtitles: Record<number, string> = {
      1: 'SMASH CRIMSON DRIFTERS',
      2: 'NEW THREAT: LOCK-ON DASHERS',
      3: 'NEW MECHANIC: RESONANCE BUMPERS',
      4: 'NEW THREAT: FRONT-SHIELDED SENTINELS',
      5: 'NEW HAZARD: VOLATILE PULSE CORES',
    };
    const sub = waveSubtitles[waveNum] ?? 'OVERDRIVE INTENSIFIES';
    if (waveNum > 1) {
      this.floatingPops.push({
        x: this.width * 0.5,
        y: this.height * 0.28,
        vy: -18,
        text: `WAVE ${waveNum}`,
        subtext: sub,
        life: 2.1,
        maxLife: 2.1,
        scale: 1.35,
        color: 'cyan',
      });
    }
  }

  // Primary Input Handlers (Mouse OR Keyboard — Rule 2)
  public setPointerPosition(x: number, y: number): void {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.usingKeyboard = false;
  }

  public beginPrimaryAction(): void {
    if (this.phase === 'gameover') {
      this.resetRun();
      return;
    }
    if (this.phase !== 'playing') return;
    if (this.player.stunTimer > 0) return;

    // Upgrade 8: Boomerang Snap mid-flight!
    if (
      this.player.isLaunching &&
      this.ownedUpgrades.has('boomerang_snap') &&
      !this.player.usedBoomerangThisFlight
    ) {
      this.triggerBoomerangSnap();
      return;
    }

    // If catching the Core mid-launch to re-coil, bank any existing 2+ chain cleanly!
    if (this.player.isLaunching && this.unbankedPoints > 0) {
      this.bankCurrentChain();
    }

    this.pointer.isDown = true;
    this.player.isCharging = true;
    this.player.isLaunching = false;
    this.player.chargeTime = 0;
    this.player.chargeRatio = 0;
    this.player.overchargeRatio = 0;

    // Immediate kinetic brake squash (Rule 1 anticipation)
    this.player.scaleX = 0.78;
    this.player.scaleY = 1.24;
    this.emitParticles(this.player.x, this.player.y, -this.player.vx * 0.15, -this.player.vy * 0.15, 6, 'cyan');
  }

  public releasePrimaryAction(): void {
    this.pointer.isDown = false;
    if (this.phase !== 'playing') return;
    if (!this.player.isCharging) return;

    this.executeSnapLaunch();
  }

  private triggerBoomerangSnap(): void {
    this.player.usedBoomerangThisFlight = true;
    const dx = this.pointer.x - this.player.x;
    const dy = this.pointer.y - this.player.y;
    const angle = Math.hypot(dx, dy) > 4 ? Math.atan2(dy, dx) : this.player.aimAngle;
    const speed = Math.max(1380, Math.hypot(this.player.vx, this.player.vy) * 1.35);

    this.player.aimAngle = angle;
    this.player.visualAngle = angle;
    this.player.vx = Math.cos(angle) * speed;
    this.player.vy = Math.sin(angle) * speed;
    this.player.bouncesInLaunch = Math.max(0, this.player.bouncesInLaunch - 1);
    this.player.scaleX = 1.75;
    this.player.scaleY = 0.55;
    this.chainCount += 1;

    this.addDirectionalShake(-Math.cos(angle) * 10, -Math.sin(angle) * 10);
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 10,
      maxRadius: 95,
      life: 0.25,
      maxLife: 0.25,
      color: 'cyan',
      lineWidth: 3,
    });
    this.synth.playLaunch(1.2);
  }

  private executeSnapLaunch(): void {
    const p = this.player;
    p.isCharging = false;
    p.isLaunching = true;
    p.bouncesInLaunch = 0;
    p.usedBoomerangThisFlight = false;
    this.hasLaunchedEver = true;

    // Effective power includes Push-Your-Luck Overcharge bonus
    const power = Math.max(0.22, p.chargeRatio + p.overchargeRatio * 0.65);
    const launchSpeed = LAUNCH_MIN_SPEED + Math.min(1.35, power) * (LAUNCH_MAX_SPEED - LAUNCH_MIN_SPEED);
    p.maxBouncesForLaunch = p.overchargeRatio > 0.35 ? 6 : 4;

    // Overcharge Push-Your-Luck bonus starts your chain higher!
    const overchargeChainBonus = p.overchargeRatio >= 0.75 ? 2 : p.overchargeRatio >= 0.25 ? 1 : 0;
    if (overchargeChainBonus > 0) {
      this.chainCount += overchargeChainBonus;
      this.floatingPops.push({
        x: p.x,
        y: p.y - 26,
        vy: -45,
        text: `OVERCHARGE +${overchargeChainBonus}x!`,
        life: 0.75,
        maxLife: 0.75,
        scale: 1.05,
        color: 'gold',
      });
    }

    p.anchorX = p.x;
    p.anchorY = p.y;
    if (this.ownedUpgrades.has('tether_wire')) {
      p.tetherActiveTimer = 1.65;
    }

    const cos = Math.cos(p.aimAngle);
    const sin = Math.sin(p.aimAngle);
    p.vx = cos * launchSpeed;
    p.vy = sin * launchSpeed;
    p.visualAngle = p.aimAngle;

    // Extreme launch stretch (Rule 1 & Rule 6)
    p.scaleX = 1.68;
    p.scaleY = 0.58;
    p.scaleVelX = 0;
    p.scaleVelY = 0;

    // Directional camera kickback proportional to launch force (Rule 6)
    const kickForce = 7 + power * 11;
    this.addDirectionalShake(-cos * kickForce, -sin * kickForce);

    // Launch shockwave cone & sparks
    this.shockwaves.push({
      x: p.x,
      y: p.y,
      radius: 12,
      maxRadius: 65 + power * 45,
      life: 0.22,
      maxLife: 0.22,
      color: 'cyan',
      lineWidth: 3,
    });
    this.emitParticles(p.x, p.y, -cos * 260, -sin * 260, 14, 'cyan');

    // Upgrade 1: Prism Split fires 2 phantom twin cores at +-24 degrees
    if (this.ownedUpgrades.has('prism_split')) {
      const spread = (24 * Math.PI) / 180;
      for (const sign of [-1, 1]) {
        const a = p.aimAngle + sign * spread;
        this.phantomTwins.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(a) * launchSpeed * 0.92,
          vy: Math.sin(a) * launchSpeed * 0.92,
          radius: 12,
          bouncesLeft: 3,
          trail: [],
        });
      }
    }

    this.synth.updateChargeTone(false, 0, 0);
    this.synth.playLaunch(power);
    p.chargeTime = 0;
    p.chargeRatio = 0;
    p.overchargeRatio = 0;
  }

  public selectUpgrade(index: number): boolean {
    if (this.phase !== 'upgrade_draft') return false;
    const card = this.draftChoices[index];
    if (!card) return false;

    this.ownedUpgrades.add(card.id);
    this.synth.playUpgradePick();

    // Heal 1 Integrity Ring between waves up to maxHp
    if (this.player.hp < this.player.maxHp) {
      this.player.hp += 1;
    }

    this.phase = 'playing';
    this.draftChoices = [];
    this.setupWaveArena(this.wave + 1);
    this.spawnWaveEnemy();
    this.spawnWaveEnemy();
    return true;
  }

  public addDirectionalShake(ix: number, iy: number): void {
    this.shakeVx += ix * 18;
    this.shakeVy += iy * 18;
    this.shakeX += ix * 0.65;
    this.shakeY += iy * 0.65;
  }

  public triggerHitStop(durationSeconds = 0.042): void {
    // 30-50ms hit-stop frames on heavy impacts (Rule 6)
    this.hitStopTimer = Math.max(this.hitStopTimer, Math.min(0.055, Math.max(0.030, durationSeconds)));
  }

  public update(rawDt: number): void {
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    // Always update camera spring shake and score pop even during hit-stop
    this.updateCameraSpring(dt);
    this.scorePopScale += (1 - this.scorePopScale) * Math.min(1, dt * 14);
    this.flashIntensity = Math.max(0, this.flashIntensity - dt * 4.5);

    if (this.phase !== 'playing') {
      this.synth.updateChargeTone(false, 0, 0);
      return;
    }

    // Rule 6: Hit-Stop Freeze Frame (30-50ms) on heavy impacts
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
      return;
    }

    const p = this.player;
    if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    if (p.stunTimer > 0) p.stunTimer = Math.max(0, p.stunTimer - dt);
    if (p.tetherActiveTimer > 0) p.tetherActiveTimer = Math.max(0, p.tetherActiveTimer - dt);

    // Update aim angle from mouse OR keyboard
    if (this.pointer.usingKeyboard) {
      const turnDir = (this.pointer.turnRight ? 1 : 0) - (this.pointer.turnLeft ? 1 : 0);
      p.aimAngle += turnDir * 3.8 * dt;
      this.pointer.x = p.x + Math.cos(p.aimAngle) * 160;
      this.pointer.y = p.y + Math.sin(p.aimAngle) * 160;
    } else {
      const dx = this.pointer.x - p.x;
      const dy = this.pointer.y - p.y;
      if (Math.hypot(dx, dy) > 4) {
        p.aimAngle = Math.atan2(dy, dx);
      }
    }

    // Update orbital glaives angle
    const glaiveSpeed = p.isCharging ? 9.5 : 5.2;
    p.glaiveAngle = (p.glaiveAngle + glaiveSpeed * dt) % (Math.PI * 2);

    // Charging & Push-Your-Luck Overcharge logic (Rule 4)
    if (p.isCharging) {
      p.chargeTime += dt;
      p.chargeRatio = Math.min(1, p.chargeTime / CHARGE_FULL_TIME);
      if (p.chargeTime > CHARGE_FULL_TIME) {
        p.overchargeRatio = Math.min(
          1,
          (p.chargeTime - CHARGE_FULL_TIME) / (OVERCHARGE_MAX_TIME - CHARGE_FULL_TIME),
        );
      } else {
        p.overchargeRatio = 0;
      }

      // Check Overheat Backfire if player got too greedy (> 2.05s hold)
      if (p.chargeTime >= OVERHEAT_LIMIT_TIME) {
        this.triggerOverheatBackfire();
      } else {
        // Coil squash along aim axis + micro vibration
        const targetSx = 0.64 - p.overchargeRatio * 0.12;
        const targetSy = 1.34 + p.overchargeRatio * 0.16;
        p.scaleX += (targetSx - p.scaleX) * Math.min(1, dt * 16);
        p.scaleY += (targetSy - p.scaleY) * Math.min(1, dt * 16);
        p.visualAngle = p.aimAngle;

        // Upgrade 3: Gravity Coil pulls enemies toward a focal point in front of your aim
        if (this.ownedUpgrades.has('gravity_coil')) {
          const focusX = p.x + Math.cos(p.aimAngle) * 135;
          const focusY = p.y + Math.sin(p.aimAngle) * 135;
          for (const e of this.enemies) {
            if (e.spawnTimer > 0) continue;
            const gx = focusX - e.x;
            const gy = focusY - e.y;
            const dist = Math.hypot(gx, gy);
            if (dist > 12 && dist < 290) {
              const pull = 360 * dt;
              e.vx += (gx / dist) * pull;
              e.vy += (gy / dist) * pull;
            }
          }
        }
      }
    }

    this.synth.updateChargeTone(p.isCharging, p.chargeRatio, p.overchargeRatio);

    // Update Player Movement & Physics (Rule 1)
    this.updatePlayerPhysics(dt);

    // World time subtly dilates while charging when enemies are nearby (tactile anticipation)
    const worldDt = p.isCharging ? dt * 0.55 : dt;

    // Update Wave Timer & Progressive Spawns (Rule 3)
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.completeWave();
      return;
    }

    this.spawnCooldown -= worldDt;
    const maxConcurrentEnemies = Math.min(10, 4 + this.wave);
    if (this.spawnCooldown <= 0 && this.enemies.length < maxConcurrentEnemies) {
      this.spawnWaveEnemy();
      const baseInterval = Math.max(0.85, 2.15 - this.wave * 0.16);
      this.spawnCooldown = baseInterval * (0.85 + this.rng() * 0.3);
    }

    // Update Upgrades (Phantom Twins, Plasma Wake, Tether Wire, Glaives, Vortices)
    this.updateActiveUpgrades(dt, worldDt);

    // Update Bumpers
    for (const b of this.bumpers) {
      b.pulse = Math.max(0, b.pulse - dt * 3.5);
    }

    // Update Enemies & Telegraphed Behaviors (Rule 5)
    this.updateEnemies(worldDt);

    // Update VFX (Shockwaves, Particles, Floating Pops, Wall Ripples)
    this.updateEffects(dt);
  }

  private triggerOverheatBackfire(): void {
    const p = this.player;
    p.isCharging = false;
    p.isLaunching = false;
    p.chargeTime = 0;
    p.chargeRatio = 0;
    p.overchargeRatio = 0;
    p.stunTimer = 0.42;
    p.vx = -Math.cos(p.aimAngle) * 280;
    p.vy = -Math.sin(p.aimAngle) * 280;
    p.scaleX = 1.45;
    p.scaleY = 0.65;

    // Lose unbanked chain on Overheat misfire (Rule 4 consequence)
    if (this.unbankedPoints > 0 || this.chainCount > 0) {
      this.unbankedPoints = 0;
      this.chainCount = 0;
    }

    this.floatingPops.push({
      x: p.x,
      y: p.y - 24,
      vy: -40,
      text: 'COIL OVERHEAT!',
      life: 0.85,
      maxLife: 0.85,
      scale: 1.0,
      color: 'crimson',
    });
    this.shockwaves.push({
      x: p.x,
      y: p.y,
      radius: 10,
      maxRadius: 70,
      life: 0.25,
      maxLife: 0.25,
      color: 'crimson',
      lineWidth: 3,
    });
    this.addDirectionalShake(Math.cos(p.aimAngle) * 9, Math.sin(p.aimAngle) * 9);
    this.synth.updateChargeTone(false, 0, 0);
    this.synth.playDamageOrOverheat();
  }

  private updatePlayerPhysics(dt: number): void {
    const p = this.player;
    const speed = Math.hypot(p.vx, p.vy);

    if (p.isCharging) {
      // Heavy magnetic anchor friction while coiling
      const brake = Math.pow(0.015, dt);
      p.vx *= brake;
      p.vy *= brake;
    } else if (p.isLaunching) {
      // High-speed kinetic flight with low air resistance for crisp multi-wall ricochets
      const drag = Math.pow(0.58, dt);
      p.vx *= drag;
      p.vy *= drag;
      p.visualAngle = Math.atan2(p.vy, p.vx);

      // Upgrade 5: Plasma Wake emits blazing trail nodes during launch
      if (this.ownedUpgrades.has('plasma_wake')) {
        this.wakeEmitTimer -= dt;
        if (this.wakeEmitTimer <= 0) {
          this.wakeEmitTimer = 0.032;
          this.plasmaWake.push({
            x: p.x,
            y: p.y,
            radius: 16,
            life: 2.0,
            maxLife: 2.0,
          });
        }
      }

      // Check if launch has decelerated below lethal threshold -> bank chain & transition to drift
      if (speed < LETHAL_SPEED_THRESHOLD) {
        p.isLaunching = false;
        // Upgrade 9: Vortex Finale when finishing a 3+ bounce chain
        if (this.ownedUpgrades.has('vortex_finale') && p.bouncesInLaunch >= 3) {
          this.vortices.push({
            x: p.x,
            y: p.y,
            radius: 115,
            life: 2.2,
            maxLife: 2.2,
          });
          this.shockwaves.push({
            x: p.x,
            y: p.y,
            radius: 12,
            maxRadius: 115,
            life: 0.35,
            maxLife: 0.35,
            color: 'cyan',
            lineWidth: 4,
          });
        }
        this.bankCurrentChain();
      }
    } else if (p.stunTimer <= 0) {
      // Tactile "Toy-First" magnetic drift toward pointer when idle (Rule 1)
      const dx = this.pointer.x - p.x;
      const dy = this.pointer.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 14) {
        const pullAccel = Math.min(620, dist * 4.2);
        p.vx += (dx / dist) * pullAccel * dt;
        p.vy += (dy / dist) * pullAccel * dt;
      }
      const driftDrag = Math.pow(0.06, dt);
      p.vx *= driftDrag;
      p.vy *= driftDrag;
      if (speed > 20) {
        p.visualAngle = Math.atan2(p.vy, p.vx);
      } else {
        p.visualAngle = p.aimAngle;
      }
    } else {
      // Stunned friction
      p.vx *= Math.pow(0.08, dt);
      p.vy *= Math.pow(0.08, dt);
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Spring-damper squash-and-stretch recovery when not charging (Rule 6)
    if (!p.isCharging) {
      const targetSx = p.isLaunching ? Math.min(1.58, 1 + speed / 2200) : 1 + Math.min(0.18, speed / 1600);
      const targetSy = 1 / Math.sqrt(targetSx);
      const stiffness = 260;
      const damping = 18;
      p.scaleVelX += ((targetSx - p.scaleX) * stiffness - p.scaleVelX * damping) * dt;
      p.scaleVelY += ((targetSy - p.scaleY) * stiffness - p.scaleVelY * damping) * dt;
      p.scaleX = Math.max(0.45, Math.min(1.85, p.scaleX + p.scaleVelX * dt));
      p.scaleY = Math.max(0.45, Math.min(1.85, p.scaleY + p.scaleVelY * dt));
    }

    // Arena Wall Collisions & Ricochet Bounces (Rule 1 & Rule 6)
    this.handleArenaWallCollisions();

    // Resonance Bumper Collisions (Wave 3+)
    this.handleBumperCollisions();

    // Record ribbon trail node
    p.trail.unshift({
      x: p.x,
      y: p.y,
      scaleX: p.scaleX,
      scaleY: p.scaleY,
      angle: p.visualAngle,
    });
    if (p.trail.length > 16) {
      p.trail.pop();
    }
  }

  private handleArenaWallCollisions(): void {
    const p = this.player;
    const minX = this.wallPadding + p.radius;
    const maxX = this.width - this.wallPadding - p.radius;
    const minY = this.wallPadding + p.radius;
    const maxY = this.height - this.wallPadding - p.radius;

    let bounced = false;
    let normalX = 0;
    let normalY = 0;
    let wallSide: WallRipple['side'] | null = null;
    let wallPos = 0;

    if (p.x < minX) {
      p.x = minX;
      p.vx = Math.abs(p.vx);
      normalX = 1;
      bounced = true;
      wallSide = 'left';
      wallPos = p.y;
    } else if (p.x > maxX) {
      p.x = maxX;
      p.vx = -Math.abs(p.vx);
      normalX = -1;
      bounced = true;
      wallSide = 'right';
      wallPos = p.y;
    }

    if (p.y < minY) {
      p.y = minY;
      p.vy = Math.abs(p.vy);
      normalY = 1;
      bounced = true;
      wallSide = 'top';
      wallPos = p.x;
    } else if (p.y > maxY) {
      p.y = maxY;
      p.vy = -Math.abs(p.vy);
      normalY = -1;
      bounced = true;
      wallSide = 'bottom';
      wallPos = p.x;
    }

    if (!bounced) return;

    const speed = Math.hypot(p.vx, p.vy);
    // Squash-and-stretch pancake against the wall normal (Rule 6)
    p.visualAngle = Math.atan2(p.vy, p.vx);
    p.scaleX = 0.52;
    p.scaleY = 1.54;
    p.scaleVelX = 6.5;
    p.scaleVelY = -6.5;

    const forceRatio = Math.min(1.4, speed / 1100);
    this.addDirectionalShake(-normalX * 9 * forceRatio, -normalY * 9 * forceRatio);

    if (wallSide) {
      this.wallRipples.push({
        side: wallSide,
        pos: wallPos,
        intensity: Math.min(1, 0.35 + forceRatio * 0.65),
        life: 0.38,
      });
    }

    this.emitParticles(p.x, p.y, normalX * 220, normalY * 220, 10, 'cyan');

    if (p.isLaunching) {
      p.bouncesInLaunch += 1;
      // Preserve high ricochet energy on wall bounce
      if (p.bouncesInLaunch <= p.maxBouncesForLaunch) {
        const boost = Math.max(speed * 0.94, 720);
        const a = Math.atan2(p.vy, p.vx);
        p.vx = Math.cos(a) * boost;
        p.vy = Math.sin(a) * boost;
      }

      // Increment chain multiplier on active ricochet when carrying unbanked points or chaining
      this.chainCount += 1;
      this.maxChainReached = Math.max(this.maxChainReached, this.chainCount);
      this.synth.playBounce(this.chainCount, forceRatio);

      // Upgrade 4: Wall Nova erupts a wide cyan shockwave on every wall bounce
      if (this.ownedUpgrades.has('wall_nova')) {
        this.triggerRadialNova(p.x, p.y, 155);
      }
    } else if (speed > 160) {
      this.synth.playBounce(1, forceRatio * 0.6);
    }
  }

  private handleBumperCollisions(): void {
    const p = this.player;
    for (const b of this.bumpers) {
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = p.radius + b.radius;
      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        p.x = b.x + nx * (minDist + 2);
        p.y = b.y + ny * (minDist + 2);

        const currentSpeed = Math.hypot(p.vx, p.vy);
        const newSpeed = Math.max(1180, Math.min(1680, currentSpeed * 1.35));
        p.vx = nx * newSpeed;
        p.vy = ny * newSpeed;
        p.visualAngle = Math.atan2(p.vy, p.vx);
        p.isLaunching = true;
        p.bouncesInLaunch += 1;

        // Squash-and-stretch + bumper pulse
        p.scaleX = 0.48;
        p.scaleY = 1.62;
        b.pulse = 1.0;

        this.chainCount += 2;
        this.unbankedPoints += 50;
        this.maxChainReached = Math.max(this.maxChainReached, this.chainCount);

        this.triggerHitStop(0.036);
        this.addDirectionalShake(nx * 11, ny * 11);
        this.shockwaves.push({
          x: b.x,
          y: b.y,
          radius: b.radius,
          maxRadius: b.radius + 85,
          life: 0.28,
          maxLife: 0.28,
          color: 'cyan',
          lineWidth: 3.5,
        });
        this.floatingPops.push({
          x: b.x,
          y: b.y - 24,
          vy: -45,
          text: `BUMPER +2x!`,
          life: 0.7,
          maxLife: 0.7,
          scale: 1.05,
          color: 'cyan',
        });
        this.synth.playStreakHit(this.chainCount, 1.1);
      }
    }
  }

  private triggerRadialNova(x: number, y: number, radius: number): void {
    this.shockwaves.push({
      x,
      y,
      radius: 14,
      maxRadius: radius,
      life: 0.28,
      maxLife: 0.28,
      color: 'cyan',
      lineWidth: 4,
    });
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.spawnTimer > 0) continue;
      const dist = Math.hypot(e.x - x, e.y - y);
      if (dist <= radius + e.radius) {
        this.damageOrKillEnemy(i, (e.x - x) / (dist || 1), (e.y - y) / (dist || 1), 2);
      }
    }
  }

  private updateActiveUpgrades(dt: number, worldDt: number): void {
    const p = this.player;

    // Upgrade 1: Phantom Twins
    const minX = this.wallPadding + 10;
    const maxX = this.width - this.wallPadding - 10;
    const minY = this.wallPadding + 10;
    const maxY = this.height - this.wallPadding - 10;

    for (let i = this.phantomTwins.length - 1; i >= 0; i--) {
      const twin = this.phantomTwins[i];
      twin.x += twin.vx * dt;
      twin.y += twin.vy * dt;
      twin.trail.unshift({ x: twin.x, y: twin.y });
      if (twin.trail.length > 9) twin.trail.pop();

      let hitWall = false;
      if (twin.x < minX || twin.x > maxX) {
        twin.vx = -twin.vx;
        twin.x = Math.max(minX, Math.min(maxX, twin.x));
        hitWall = true;
      }
      if (twin.y < minY || twin.y > maxY) {
        twin.vy = -twin.vy;
        twin.y = Math.max(minY, Math.min(maxY, twin.y));
        hitWall = true;
      }
      if (hitWall) {
        twin.bouncesLeft -= 1;
        this.emitParticles(twin.x, twin.y, 0, 0, 5, 'cyan');
      }

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.spawnTimer > 0) continue;
        if (Math.hypot(e.x - twin.x, e.y - twin.y) <= e.radius + twin.radius + 4) {
          const speed = Math.hypot(twin.vx, twin.vy) || 1;
          this.damageOrKillEnemy(j, twin.vx / speed, twin.vy / speed, 2);
        }
      }

      if (twin.bouncesLeft < 0) {
        this.phantomTwins.splice(i, 1);
      }
    }

    // Upgrade 2: Tether Wire slices enemies crossing segment (anchorX, anchorY) -> (p.x, p.y)
    if (p.tetherActiveTimer > 0 && this.ownedUpgrades.has('tether_wire')) {
      this.tetherZapCooldown -= dt;
      if (this.tetherZapCooldown <= 0) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (e.spawnTimer > 0) continue;
          const d = this.pointToSegmentDistance(e.x, e.y, p.anchorX, p.anchorY, p.x, p.y);
          if (d <= e.radius + 8) {
            this.tetherZapCooldown = 0.06;
            this.damageOrKillEnemy(j, 0, -1, 2);
          }
        }
      }
    }

    // Upgrade 5: Plasma Wake nodes
    for (let i = this.plasmaWake.length - 1; i >= 0; i--) {
      const node = this.plasmaWake[i];
      node.life -= dt;
      if (node.life <= 0) {
        this.plasmaWake.splice(i, 1);
        continue;
      }
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.spawnTimer > 0) continue;
        if (Math.hypot(e.x - node.x, e.y - node.y) <= e.radius + node.radius) {
          this.damageOrKillEnemy(j, 0, -1, 2);
          node.life = 0;
          break;
        }
      }
    }

    // Upgrade 7: Orbital Glaives
    if (this.ownedUpgrades.has('orbital_glaives')) {
      const orbitR = p.isCharging ? 66 + p.overchargeRatio * 24 : 44;
      for (let g = 0; g < 2; g++) {
        const a = p.glaiveAngle + g * Math.PI;
        const gx = p.x + Math.cos(a) * orbitR;
        const gy = p.y + Math.sin(a) * orbitR;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (e.spawnTimer > 0) continue;
          if (Math.hypot(e.x - gx, e.y - gy) <= e.radius + 13) {
            this.damageOrKillEnemy(j, -Math.sin(a), Math.cos(a), 2);
          }
        }
      }
    }

    // Upgrade 9: Vortex Finale
    for (let i = this.vortices.length - 1; i >= 0; i--) {
      const v = this.vortices[i];
      v.life -= worldDt;
      if (v.life <= 0) {
        this.vortices.splice(i, 1);
        continue;
      }
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.spawnTimer > 0) continue;
        const dx = v.x - e.x;
        const dy = v.y - e.y;
        const dist = Math.hypot(dx, dy);
        if (dist < v.radius && dist > 1) {
          e.vx += (dx / dist) * 520 * worldDt;
          e.vy += (dy / dist) * 520 * worldDt;
          if (dist < 26 && v.life < 0.35) {
            this.damageOrKillEnemy(j, dx / dist, dy / dist, 3);
          }
        }
      }
    }
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    const playerSpeed = Math.hypot(p.vx, p.vy);
    const playerIsLethal = p.isLaunching && playerSpeed >= LETHAL_SPEED_THRESHOLD;
    // Generous hitboxes in player's favor (Rule 5):
    // Larger strike radius when attacking, smaller hurtbox when vulnerable
    const strikeRadius = p.radius * (1.28 + (p.isLaunching ? 0.15 : 0));
    const hurtRadius = p.radius * 0.72;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt * 5);
      e.scaleX += (1 - e.scaleX) * Math.min(1, dt * 12);
      e.scaleY += (1 - e.scaleY) * Math.min(1, dt * 12);

      // Arrival telegraph countdown (Rule 5)
      if (e.spawnTimer > 0) {
        e.spawnTimer = Math.max(0, e.spawnTimer - dt);
        continue;
      }

      const toPlayerX = p.x - e.x;
      const toPlayerY = p.y - e.y;
      const distToPlayer = Math.hypot(toPlayerX, toPlayerY) || 1;
      const dirX = toPlayerX / distToPlayer;
      const dirY = toPlayerY / distToPlayer;

      if (e.kind === 'drifter') {
        const moveSpeed = 105 + Math.min(60, this.wave * 8);
        e.vx += (dirX * moveSpeed - e.vx) * Math.min(1, dt * 4);
        e.vy += (dirY * moveSpeed - e.vy) * Math.min(1, dt * 4);
        e.angle += 1.4 * dt;
      } else if (e.kind === 'dasher') {
        if (e.isDashing) {
          e.dashTimer -= dt;
          if (e.dashTimer <= 0) {
            e.isDashing = false;
            e.dashCooldown = 1.35;
            e.vx *= 0.25;
            e.vy *= 0.25;
          }
        } else if (e.telegraphTimer > 0) {
          // Stationary lock-on telegraph before lunging (Rule 5)
          e.vx *= Math.pow(0.02, dt);
          e.vy *= Math.pow(0.02, dt);
          e.telegraphTimer -= dt;
          if (e.telegraphTimer > 0.22) {
            // Track player during early telegraph, lock angle for last 0.22s so dodge is fair
            e.angle = Math.atan2(toPlayerY, toPlayerX);
          }
          if (e.telegraphTimer <= 0) {
            e.isDashing = true;
            e.dashTimer = 0.36;
            const dashSpeed = 590;
            e.vx = Math.cos(e.angle) * dashSpeed;
            e.vy = Math.sin(e.angle) * dashSpeed;
            e.scaleX = 1.45;
            e.scaleY = 0.68;
          }
        } else {
          e.dashCooldown -= dt;
          const stalkSpeed = 125;
          e.vx += (dirX * stalkSpeed - e.vx) * Math.min(1, dt * 4);
          e.vy += (dirY * stalkSpeed - e.vy) * Math.min(1, dt * 4);
          e.angle = Math.atan2(toPlayerY, toPlayerX);
          if (e.dashCooldown <= 0 && distToPlayer < 360) {
            e.telegraphTimer = 0.85; // 850ms clear telegraph
          }
        }
      } else if (e.kind === 'shielded') {
        // Slowly rotates front shield toward player so bank-shots behind it are rewarded
        const targetAngle = Math.atan2(toPlayerY, toPlayerX);
        const diff = Math.atan2(Math.sin(targetAngle - e.angle), Math.cos(targetAngle - e.angle));
        e.angle += Math.sign(diff) * Math.min(Math.abs(diff), 1.35 * dt);
        const marchSpeed = 78;
        e.vx += (dirX * marchSpeed - e.vx) * Math.min(1, dt * 3);
        e.vy += (dirY * marchSpeed - e.vy) * Math.min(1, dt * 3);
      } else if (e.kind === 'pulse_orb') {
        e.vx *= Math.pow(0.4, dt);
        e.vy *= Math.pow(0.4, dt);
        if (e.telegraphTimer > 0) {
          e.telegraphTimer -= dt;
          if (e.telegraphTimer <= 0) {
            // Detonate Pulse Orb! Clears enemies in radius
            const ox = e.x;
            const oy = e.y;
            this.enemies.splice(i, 1);
            this.triggerHitStop(0.045);
            this.addDirectionalShake(0, -12);
            this.triggerRadialNova(ox, oy, 175);
            continue;
          }
        }
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Keep enemies inside arena bounds
      const minX = this.wallPadding + e.radius;
      const maxX = this.width - this.wallPadding - e.radius;
      const minY = this.wallPadding + e.radius;
      const maxY = this.height - this.wallPadding - e.radius;
      if (e.x < minX || e.x > maxX) {
        e.vx = -e.vx;
        e.x = Math.max(minX, Math.min(maxX, e.x));
      }
      if (e.y < minY || e.y > maxY) {
        e.vy = -e.vy;
        e.y = Math.max(minY, Math.min(maxY, e.y));
      }

      // Check collision with Player Core
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (playerIsLethal && dist <= strikeRadius + e.radius) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // If enemy is a Pulse Orb, knock it like a billiard ball and arm its fuse!
        if (e.kind === 'pulse_orb') {
          e.vx = p.vx * 1.15;
          e.vy = p.vy * 1.15;
          e.telegraphTimer = 0.55;
          e.scaleX = 1.4;
          e.scaleY = 0.7;
          this.triggerHitStop(0.035);
          this.synth.playBounce(this.chainCount + 1, 1.1);
          continue;
        }

        // Check Shielded Sentinel front arc if hit from the front without Overcharge
        if (e.kind === 'shielded') {
          const hitFromAngle = Math.atan2(-dy, -dx); // direction from enemy to player
          const angleDiff = Math.abs(
            Math.atan2(Math.sin(hitFromAngle - e.angle), Math.cos(hitFromAngle - e.angle)),
          );
          if (angleDiff < 0.85 && e.hp > 1) {
            // Deflect off front shield with metallic sparks — bank shot behind it or hit twice!
            p.vx = -nx * Math.max(780, playerSpeed * 0.9);
            p.vy = -ny * Math.max(780, playerSpeed * 0.9);
            p.visualAngle = Math.atan2(p.vy, p.vx);
            p.scaleX = 0.52;
            p.scaleY = 1.52;
            e.hp -= 1;
            e.hitFlash = 1;
            e.vx = nx * 240;
            e.vy = ny * 240;
            this.triggerHitStop(0.035);
            this.addDirectionalShake(-nx * 10, -ny * 10);
            this.emitParticles(e.x, e.y, -nx * 200, -ny * 200, 10, 'gold');
            this.synth.playBounce(this.chainCount + 1, 1);
            continue;
          }
        }

        // Direct Smash Kill!
        this.damageOrKillEnemy(i, nx, ny, 99);

        // Squash-and-stretch impact + velocity extension so chains feel unstoppable
        p.scaleX = 0.54;
        p.scaleY = 1.52;
        p.scaleVelX = 8;
        p.scaleVelY = -8;

        // Upgrade 6: Pinball Seeker ricochets toward the nearest living threat!
        if (this.ownedUpgrades.has('pinball_seeker') && this.enemies.length > 0) {
          const nextTarget = this.findNearestEnemy(p.x, p.y);
          if (nextTarget) {
            const ta = Math.atan2(nextTarget.y - p.y, nextTarget.x - p.x);
            const boostSpeed = Math.max(1150, playerSpeed);
            p.vx = Math.cos(ta) * boostSpeed;
            p.vy = Math.sin(ta) * boostSpeed;
            p.visualAngle = ta;
          }
        } else {
          // Momentum sustain boost on smash
          const boostSpeed = Math.min(1620, playerSpeed + 185);
          const a = Math.atan2(p.vy, p.vx);
          p.vx = Math.cos(a) * boostSpeed;
          p.vy = Math.sin(a) * boostSpeed;
        }
      } else if (!playerIsLethal && e.kind !== 'pulse_orb' && dist <= hurtRadius + e.radius * 0.85) {
        // Player took a hit while drifting or holding charge too close!
        this.handlePlayerHit(e.x, e.y);
      }
    }
  }

  private findNearestEnemy(x: number, y: number): EnemyEntity | null {
    let best: EnemyEntity | null = null;
    let bestDist = Infinity;
    for (const e of this.enemies) {
      if (e.spawnTimer > 0) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    return best;
  }

  private damageOrKillEnemy(index: number, impactDirX: number, impactDirY: number, dmg: number): void {
    const e = this.enemies[index];
    if (!e) return;
    e.hp -= dmg;
    e.hitFlash = 1;

    if (e.hp > 0) {
      e.vx += impactDirX * 220;
      e.vy += impactDirY * 220;
      e.scaleX = 0.65;
      e.scaleY = 1.38;
      return;
    }

    // Enemy Shattered!
    this.enemies.splice(index, 1);
    this.totalKills += 1;
    this.chainCount += 1;
    this.maxChainReached = Math.max(this.maxChainReached, this.chainCount);

    const basePts = e.kind === 'shielded' ? 200 : e.kind === 'dasher' ? 150 : 100;
    this.unbankedPoints += basePts;

    // Rule 6: 35-50ms Hit-Stop frame + Directional Screen Shake + Harmonic Synth Pitch-Up
    const hitStopDuration = Math.min(0.050, 0.034 + this.chainCount * 0.002);
    this.triggerHitStop(hitStopDuration);
    this.addDirectionalShake(impactDirX * (9 + Math.min(8, this.chainCount)), impactDirY * (9 + Math.min(8, this.chainCount)));
    this.flashIntensity = Math.min(0.35, 0.12 + this.chainCount * 0.025);

    this.shockwaves.push({
      x: e.x,
      y: e.y,
      radius: e.radius * 0.6,
      maxRadius: e.radius * 3.4 + Math.min(40, this.chainCount * 5),
      life: 0.26,
      maxLife: 0.26,
      color: 'white',
      lineWidth: 3.5,
    });

    this.emitParticles(e.x, e.y, impactDirX * 320, impactDirY * 320, 16, 'crimson');
    this.emitParticles(e.x, e.y, impactDirX * 180, impactDirY * 180, 8, 'cyan');

    this.floatingPops.push({
      x: e.x,
      y: e.y - 12,
      vy: -52,
      text: `+${basePts} ×${this.chainCount}`,
      life: 0.72,
      maxLife: 0.72,
      scale: Math.min(1.55, 0.95 + this.chainCount * 0.08),
      color: this.chainCount >= 4 ? 'gold' : 'cyan',
    });

    this.synth.playStreakHit(this.chainCount, 1);

    // If kill happened from an orbital glaive/wake while not launching, bank immediately
    if (!this.player.isLaunching) {
      this.bankCurrentChain();
    }
  }

  private bankCurrentChain(): void {
    if (this.unbankedPoints <= 0) {
      this.chainCount = 0;
      return;
    }
    const mult = Math.max(1, this.chainCount);
    const total = this.unbankedPoints * mult;
    this.score += total;
    this.scorePopScale = Math.min(1.65, 1.18 + mult * 0.06);

    if (mult >= 2) {
      this.floatingPops.push({
        x: this.player.x,
        y: this.player.y - 30,
        vy: -48,
        text: `BANKED +${total.toLocaleString()}!`,
        life: 0.95,
        maxLife: 0.95,
        scale: 1.2,
        color: 'gold',
      });
      this.synth.playBankCombo(mult);
    }

    this.unbankedPoints = 0;
    this.chainCount = 0;
  }

  private handlePlayerHit(threatX: number, threatY: number): void {
    const p = this.player;
    if (p.invulnTimer > 0) return;

    p.hp -= 1;
    p.invulnTimer = 1.35;
    p.isCharging = false;
    p.isLaunching = false;
    p.chargeTime = 0;
    p.chargeRatio = 0;
    p.overchargeRatio = 0;

    // Shatter unbanked chain when hit (Rule 4 risk/reward consequence)
    if (this.unbankedPoints > 0) {
      this.floatingPops.push({
        x: p.x,
        y: p.y - 28,
        vy: -42,
        text: 'CHAIN LOST!',
        life: 0.9,
        maxLife: 0.9,
        scale: 1.1,
        color: 'crimson',
      });
    }
    this.unbankedPoints = 0;
    this.chainCount = 0;

    const nx = (p.x - threatX) / (Math.hypot(p.x - threatX, p.y - threatY) || 1);
    const ny = (p.y - threatY) / (Math.hypot(p.x - threatX, p.y - threatY) || 1);
    p.vx = nx * 460;
    p.vy = ny * 460;
    p.scaleX = 0.52;
    p.scaleY = 1.52;

    this.triggerHitStop(0.050);
    this.addDirectionalShake(nx * 16, ny * 16);
    this.flashIntensity = 0.45;
    this.shockwaves.push({
      x: p.x,
      y: p.y,
      radius: 14,
      maxRadius: 110,
      life: 0.32,
      maxLife: 0.32,
      color: 'crimson',
      lineWidth: 4,
    });
    this.emitParticles(p.x, p.y, nx * 240, ny * 240, 18, 'crimson');
    this.synth.updateChargeTone(false, 0, 0);
    this.synth.playDamageOrOverheat();

    // Push nearby enemies back so the player never gets double-tapped unfairly
    for (const e of this.enemies) {
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 180 && d > 0.1) {
        e.vx += (dx / d) * 340;
        e.vy += (dy / d) * 340;
      }
    }

    if (p.hp <= 0) {
      this.phase = 'gameover';
    }
  }

  private completeWave(): void {
    // Bank any remaining unbanked points
    this.bankCurrentChain();

    // Shatter remaining enemies into harmless celebration sparks
    for (const e of this.enemies) {
      this.emitParticles(e.x, e.y, 0, 0, 8, 'crimson');
    }
    this.enemies = [];
    this.phantomTwins = [];
    this.player.isCharging = false;
    this.player.isLaunching = false;
    this.player.vx *= 0.2;
    this.player.vy *= 0.2;
    this.synth.updateChargeTone(false, 0, 0);

    // Pause for 1-of-3 Upgrade Draft (Rule 7)
    this.phase = 'upgrade_draft';
    this.draftChoices = rollUpgradeChoices(this.ownedUpgrades, this.rng, 3);
  }

  public spawnWaveEnemy(forcedKind?: EnemyKind): EnemyEntity {
    // Progressive Reveal by Wave (Rule 3):
    // Wave 1: ONLY 'drifter'
    // Wave 2: 'drifter' + 'dasher'
    // Wave 3: 'drifter' + 'dasher' (+ Arena Bumpers)
    // Wave 4: 'drifter' + 'dasher' + 'shielded'
    // Wave 5+: 'drifter' + 'dasher' + 'shielded' + 'pulse_orb'
    let kind: EnemyKind = forcedKind ?? 'drifter';
    if (!forcedKind) {
      const r = this.rng();
      if (this.wave === 1) {
        kind = 'drifter';
      } else if (this.wave === 2 || this.wave === 3) {
        kind = r < 0.42 ? 'dasher' : 'drifter';
      } else if (this.wave === 4) {
        kind = r < 0.28 ? 'shielded' : r < 0.62 ? 'dasher' : 'drifter';
      } else {
        kind = r < 0.18 ? 'pulse_orb' : r < 0.42 ? 'shielded' : r < 0.72 ? 'dasher' : 'drifter';
      }
    }

    // Pick a spawn position well away from the player Core (at least 190px away)
    const margin = this.wallPadding + 42;
    let x = margin;
    let y = margin;
    for (let attempt = 0; attempt < 12; attempt++) {
      x = margin + this.rng() * (this.width - margin * 2);
      y = margin + this.rng() * (this.height - margin * 2);
      if (Math.hypot(x - this.player.x, y - this.player.y) > 200) {
        break;
      }
    }

    const radius = kind === 'shielded' ? 23 : kind === 'dasher' ? 17 : kind === 'pulse_orb' ? 19 : 18;
    const hp = kind === 'shielded' ? 2 : 1;

    const entity: EnemyEntity = {
      id: this.nextEnemyId++,
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      angle: Math.atan2(this.player.y - y, this.player.x - x),
      spawnTimer: 0.65,
      telegraphTimer: 0,
      dashCooldown: 0.9 + this.rng() * 0.6,
      isDashing: false,
      dashTimer: 0,
      scaleX: 1,
      scaleY: 1,
      hitFlash: 0,
    };

    this.enemies.push(entity);
    return entity;
  }

  private emitParticles(
    x: number,
    y: number,
    baseVx: number,
    baseVy: number,
    count: number,
    color: Particle['color'],
  ): void {
    for (let i = 0; i < count; i++) {
      const spreadAngle = (this.rng() - 0.5) * 1.9;
      const baseAngle = Math.atan2(baseVy, baseVx);
      const speed = (80 + this.rng() * 260) * (Math.hypot(baseVx, baseVy) > 1 ? 1 : 0.8);
      const a = Math.hypot(baseVx, baseVy) > 1 ? baseAngle + spreadAngle : this.rng() * Math.PI * 2;
      const life = 0.22 + this.rng() * 0.26;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        size: 2.5 + this.rng() * 3.5,
        life,
        maxLife: life,
        color,
      });
    }
  }

  private updateCameraSpring(dt: number): void {
    const stiffness = 320;
    const damping = 19;
    this.shakeVx += (-this.shakeX * stiffness - this.shakeVx * damping) * dt;
    this.shakeVy += (-this.shakeY * stiffness - this.shakeVy * damping) * dt;
    this.shakeX += this.shakeVx * dt;
    this.shakeY += this.shakeVy * dt;
  }

  private updateEffects(dt: number): void {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.pow(0.08, dt);
      pt.vy *= Math.pow(0.08, dt);
    }

    for (let i = this.floatingPops.length - 1; i >= 0; i--) {
      const pop = this.floatingPops[i];
      pop.life -= dt;
      if (pop.life <= 0) {
        this.floatingPops.splice(i, 1);
        continue;
      }
      pop.y += pop.vy * dt;
      pop.vy *= Math.pow(0.18, dt);
    }

    for (let i = this.wallRipples.length - 1; i >= 0; i--) {
      const r = this.wallRipples[i];
      r.life -= dt;
      if (r.life <= 0) {
        this.wallRipples.splice(i, 1);
      }
    }
  }

  private pointToSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // Computes predicted trajectory segments with wall bounce previews while aiming (Rule 1 & Rule 5)
  public computeAimPreviewSegments(): Array<{ x1: number; y1: number; x2: number; y2: number }> {
    const p = this.player;
    const segments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    const minX = this.wallPadding + p.radius;
    const maxX = this.width - this.wallPadding - p.radius;
    const minY = this.wallPadding + p.radius;
    const maxY = this.height - this.wallPadding - p.radius;

    let cx = p.x;
    let cy = p.y;
    let dx = Math.cos(p.aimAngle);
    let dy = Math.sin(p.aimAngle);
    let remainingDist = 260 + p.chargeRatio * 480 + p.overchargeRatio * 420;
    const maxBounces = p.overchargeRatio > 0.3 ? 3 : 2;

    for (let b = 0; b < maxBounces && remainingDist > 5; b++) {
      let tx = Infinity;
      let ty = Infinity;
      if (dx > 0.0001) tx = (maxX - cx) / dx;
      else if (dx < -0.0001) tx = (minX - cx) / dx;

      if (dy > 0.0001) ty = (maxY - cy) / dy;
      else if (dy < -0.0001) ty = (minY - cy) / dy;

      const hitDist = Math.min(tx, ty);
      const stepDist = Math.min(remainingDist, hitDist);
      const nx = cx + dx * stepDist;
      const ny = cy + dy * stepDist;

      segments.push({ x1: cx, y1: cy, x2: nx, y2: ny });
      remainingDist -= stepDist;
      cx = nx;
      cy = ny;

      if (hitDist === tx) dx = -dx;
      else dy = -dy;
    }

    return segments;
  }
}

export { UPGRADE_CATALOG };
