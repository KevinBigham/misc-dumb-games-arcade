import { SnapbackSynth } from './synth';
import { pickThreeUpgrades, type UpgradeId, type UpgradeSpec } from './upgrades';

export const SNAPBACK_CONFIG = {
  WIDTH: 960,
  HEIGHT: 600,
  WALL_MARGIN: 26,
  WAVE_DURATION_S: 30,
  PLAYER_MAX_HP: 5,
  PLAYER_VISUAL_RADIUS: 17,
  PLAYER_HURT_RADIUS: 13,
  PLAYER_STRIKE_RADIUS: 25,
  CRUISE_ACCEL: 2200,
  CRUISE_DRAG: 5.5,
  MAX_CRUISE_SPEED: 350,
  BRAKE_DRAG: 12.0,
  MAX_CHARGE_TIME_S: 1.15,
  SWEET_SPOT_MIN_S: 0.60,
  SWEET_SPOT_MAX_S: 0.86,
  MIN_SNAP_SPEED: 780,
  MAX_SNAP_SPEED: 1380,
  SWEET_SNAP_SPEED: 1540,
  SNAP_DRAG: 1.45,
  BANK_HOLD_TIME_S: 0.95,
  HITSTOP_KILL_S: 0.042, // 42ms (within 30-50ms rule)
  HITSTOP_BOUNCE_S: 0.034, // 34ms (within 30-50ms rule)
} as const;

export type EnemyKind = 'drifter' | 'lancer' | 'bulwark';

export interface TrailNode {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
  lineWidth: number;
}

export interface FloatingCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

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
  facingAngle: number;
  /** Spawn telegraph countdown (0.85s -> 0). Cannot hit player while > 0. */
  spawnTelegraphS: number;
  /** Attack telegraph countdown for Lancers */
  attackTelegraphS: number;
  attackDashTimerS: number;
  lockedAimX: number;
  lockedAimY: number;
  /** Domino bowling state when launched by player with domino_bowling upgrade */
  isBowlingProjectile: boolean;
  bowlingTimerS: number;
  /** Squash and stretch state */
  scaleX: number;
  scaleY: number;
  stretchAngle: number;
}

export interface BumperPylon {
  x: number;
  y: number;
  radius: number;
  scaleX: number;
  scaleY: number;
  pulse: number;
}

export interface PulseWellHazard {
  x: number;
  y: number;
  radius: number;
  cycleTimerS: number;
  cyclePeriodS: number;
}

export interface PlasmaWireSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
}

export interface PrismShardProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
}

export class SeededRng {
  private state: number;
  constructor(seed = 20261108) {
    this.state = seed >>> 0 || 1;
  }
  public next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

export class SnapbackSimulation {
  public rng: SeededRng;
  public synth: SnapbackSynth;

  // Core HUD state (strictly 2 primary numbers: score and wave)
  public score = 0;
  public wave = 1;
  public waveTimerS: number = SNAPBACK_CONFIG.WAVE_DURATION_S;
  public phase: 'playing' | 'upgrade_choice' | 'gameover' = 'playing';

  // Push-your-luck Unbanked Pot
  public unbankedChips = 0;
  public unbankedMult = 1;
  public bankProgress = 0; // 0..1
  public comboStreak = 0;
  public bestComboStreak = 0;

  // Player physical state
  public player = {
    x: SNAPBACK_CONFIG.WIDTH * 0.35,
    y: SNAPBACK_CONFIG.HEIGHT * 0.5,
    vx: 0,
    vy: 0,
    hp: SNAPBACK_CONFIG.PLAYER_MAX_HP as number,
    maxHp: SNAPBACK_CONFIG.PLAYER_MAX_HP as number,
    aimX: SNAPBACK_CONFIG.WIDTH * 0.65,
    aimY: SNAPBACK_CONFIG.HEIGHT * 0.5,
    dirX: 1,
    dirY: 0,
    isCharging: false,
    chargeTimeS: 0,
    chargeAnchorX: SNAPBACK_CONFIG.WIDTH * 0.35,
    chargeAnchorY: SNAPBACK_CONFIG.HEIGHT * 0.5,
    snapTimerS: 0,
    snapSweetSpotActive: false,
    bouncesThisSnap: 0,
    invulnTimerS: 0,
    scaleX: 1,
    scaleY: 1,
    stretchAngle: 0,
    hasLaunchedOnce: false,
    orbitBladeAngle: 0,
  };

  // Echo anchor upgrade state
  public activeEchoAnchor: {
    x: number;
    y: number;
    returning: boolean;
  } | null = null;

  // Juice state: Hit-stop (30-50ms), Directional Screen Shake, Trails
  public hitStopTimerS = 0;
  public shakeX = 0;
  public shakeY = 0;
  public shakeVx = 0;
  public shakeVy = 0;
  public lastDamageContact: { x: number; y: number; timerS: number } | null = null;

  // World entities
  public enemies: EnemyEntity[] = [];
  public bumpers: BumperPylon[] = [];
  public pulseWells: PulseWellHazard[] = [];
  public plasmaWires: PlasmaWireSegment[] = [];
  public shards: PrismShardProjectile[] = [];
  public playerTrail: TrailNode[] = [];
  public particles: Particle[] = [];
  public shockwaves: ShockwaveRing[] = [];
  public callouts: FloatingCallout[] = [];

  // Upgrades
  public ownedUpgrades = new Set<UpgradeId>();
  public offeredUpgrades: UpgradeSpec[] = [];

  private nextEnemyId = 1;
  private spawnCooldownS = 0.6;
  private chargeTickCooldownS = 0;

  // Keyboard directional input state
  public moveKeys = { up: false, down: false, left: false, right: false };
  public usingPointerAim = true;

  constructor(seed = 20261108, synth = new SnapbackSynth()) {
    this.rng = new SeededRng(seed);
    this.synth = synth;
    this.resetRun(seed);
  }

  public resetRun(seed = 20261108): void {
    this.rng = new SeededRng(seed);
    this.score = 0;
    this.wave = 1;
    this.waveTimerS = SNAPBACK_CONFIG.WAVE_DURATION_S;
    this.phase = 'playing';

    this.unbankedChips = 0;
    this.unbankedMult = 1;
    this.bankProgress = 0;
    this.comboStreak = 0;
    this.bestComboStreak = 0;

    this.player.x = SNAPBACK_CONFIG.WIDTH * 0.32;
    this.player.y = SNAPBACK_CONFIG.HEIGHT * 0.5;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = SNAPBACK_CONFIG.PLAYER_MAX_HP;
    this.player.maxHp = SNAPBACK_CONFIG.PLAYER_MAX_HP;
    this.player.aimX = SNAPBACK_CONFIG.WIDTH * 0.68;
    this.player.aimY = SNAPBACK_CONFIG.HEIGHT * 0.5;
    this.player.dirX = 1;
    this.player.dirY = 0;
    this.player.isCharging = false;
    this.player.chargeTimeS = 0;
    this.player.snapTimerS = 0;
    this.player.snapSweetSpotActive = false;
    this.player.bouncesThisSnap = 0;
    this.player.invulnTimerS = 0;
    this.player.scaleX = 1;
    this.player.scaleY = 1;
    this.player.stretchAngle = 0;
    this.player.hasLaunchedOnce = false;

    this.activeEchoAnchor = null;
    this.hitStopTimerS = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeVx = 0;
    this.shakeVy = 0;
    this.lastDamageContact = null;

    this.enemies = [];
    this.bumpers = [];
    this.pulseWells = [];
    this.plasmaWires = [];
    this.shards = [];
    this.playerTrail = [];
    this.particles = [];
    this.shockwaves = [];
    this.callouts = [];
    this.ownedUpgrades.clear();
    this.offeredUpgrades = [];

    this.setupWaveArena(1);
    // Spawn first Wave 1 target directly in front of player so they learn by doing in 3 seconds
    this.spawnEnemy('drifter', SNAPBACK_CONFIG.WIDTH * 0.68, SNAPBACK_CONFIG.HEIGHT * 0.5, 0.35);
    this.spawnEnemy('drifter', SNAPBACK_CONFIG.WIDTH * 0.78, SNAPBACK_CONFIG.HEIGHT * 0.28, 0.65);
    this.spawnEnemy('drifter', SNAPBACK_CONFIG.WIDTH * 0.78, SNAPBACK_CONFIG.HEIGHT * 0.72, 0.65);
    this.spawnCooldownS = 1.6;
  }

  /** Progressive Reveal: each wave unlocks exactly 1 new arena mechanic or enemy type */
  public setupWaveArena(waveNum: number): void {
    this.bumpers = [];
    this.pulseWells = [];

    // Wave 2+ introduces Elastic Bumper Pylons
    if (waveNum >= 2) {
      this.bumpers.push(
        {
          x: SNAPBACK_CONFIG.WIDTH * 0.5,
          y: SNAPBACK_CONFIG.HEIGHT * 0.27,
          radius: 26,
          scaleX: 1,
          scaleY: 1,
          pulse: 0,
        },
        {
          x: SNAPBACK_CONFIG.WIDTH * 0.5,
          y: SNAPBACK_CONFIG.HEIGHT * 0.73,
          radius: 26,
          scaleX: 1,
          scaleY: 1,
          pulse: 0,
        }
      );
    }

    // Wave 5+ introduces Telegraphed Pulse Well Hazards
    if (waveNum >= 5) {
      this.pulseWells.push({
        x: SNAPBACK_CONFIG.WIDTH * 0.5,
        y: SNAPBACK_CONFIG.HEIGHT * 0.5,
        radius: 68,
        cycleTimerS: 0,
        cyclePeriodS: 4.5,
      });
    }
  }

  public setAimPosition(x: number, y: number): void {
    this.usingPointerAim = true;
    this.player.aimX = x;
    this.player.aimY = y;
    this.updateAimVector();
  }

  private updateAimVector(): void {
    const dx = this.player.aimX - this.player.x;
    const dy = this.player.aimY - this.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 2) {
      this.player.dirX = dx / dist;
      this.player.dirY = dy / dist;
    }
  }

  public startCharge(): void {
    if (this.phase === 'gameover') {
      this.resetRun(Math.floor(this.rng.next() * 999999) + 1);
      return;
    }
    if (this.phase !== 'playing') return;
    if (this.player.isCharging) return;

    const currentSpeed = Math.hypot(this.player.vx, this.player.vy);

    // Upgrade: Shockwave Brake unleashes repulsor ring when braking from speed
    if (this.ownedUpgrades.has('blast_brake') && currentSpeed > 160) {
      this.triggerShockwaveBrake();
    }

    this.player.isCharging = true;
    this.player.chargeTimeS = 0;
    this.player.chargeAnchorX = this.player.x;
    this.player.chargeAnchorY = this.player.y;
    this.player.snapTimerS = 0;
    this.player.snapSweetSpotActive = false;
    this.chargeTickCooldownS = 0.05;

    // Pause banking ring slightly so player can chain charges without losing unbanked pot
    this.bankProgress = Math.min(this.bankProgress, 0.25);

    // Brake sparks
    for (let i = 0; i < 6; i++) {
      const ang = this.rng.range(0, Math.PI * 2);
      const spd = this.rng.range(40, 140);
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: 2.5,
        life: 0.22,
        maxLife: 0.22,
        color: '#00f2fe',
      });
    }
  }

  private triggerShockwaveBrake(): void {
    const blastRadius = 155;
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 16,
      maxRadius: blastRadius,
      life: 0.26,
      maxLife: 0.26,
      color: '#00f2fe',
      lineWidth: 5,
    });
    this.applyDirectionalShake(this.player.dirX, this.player.dirY, 7);

    for (const enemy of this.enemies) {
      if (enemy.spawnTelegraphS > 0) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d <= blastRadius) {
        const push = (1 - d / blastRadius) * 620 + 240;
        enemy.vx += (dx / d) * push;
        enemy.vy += (dy / d) * push;
        enemy.isBowlingProjectile = true;
        enemy.bowlingTimerS = 0.45;
      }
    }
  }

  public getChargeRatio(): number {
    return Math.min(1, this.player.chargeTimeS / SNAPBACK_CONFIG.MAX_CHARGE_TIME_S);
  }

  public isChargeInSweetSpot(): boolean {
    return (
      this.player.isCharging &&
      this.player.chargeTimeS >= SNAPBACK_CONFIG.SWEET_SPOT_MIN_S &&
      this.player.chargeTimeS <= SNAPBACK_CONFIG.SWEET_SPOT_MAX_S
    );
  }

  public releaseCharge(): void {
    if (!this.player.isCharging || this.phase !== 'playing') return;

    this.updateAimVector();
    const ratio = this.getChargeRatio();
    const sweetSpot = this.isChargeInSweetSpot();

    this.player.isCharging = false;
    this.player.hasLaunchedOnce = true;
    this.player.bouncesThisSnap = 0;
    this.player.snapSweetSpotActive = sweetSpot;

    const launchSpeed = sweetSpot
      ? SNAPBACK_CONFIG.SWEET_SNAP_SPEED
      : SNAPBACK_CONFIG.MIN_SNAP_SPEED +
        ratio * (SNAPBACK_CONFIG.MAX_SNAP_SPEED - SNAPBACK_CONFIG.MIN_SNAP_SPEED);

    this.player.vx = this.player.dirX * launchSpeed;
    this.player.vy = this.player.dirY * launchSpeed;
    this.player.snapTimerS = 0.36 + ratio * 0.42 + (sweetSpot ? 0.16 : 0);

    // Squash-and-stretch snap elongation
    this.player.stretchAngle = Math.atan2(this.player.dirY, this.player.dirX);
    this.player.scaleX = sweetSpot ? 1.62 : 1.48;
    this.player.scaleY = sweetSpot ? 0.56 : 0.64;

    // Upgrade: Echo Anchor left at launch origin
    if (this.ownedUpgrades.has('echo_anchor')) {
      this.activeEchoAnchor = {
        x: this.player.x,
        y: this.player.y,
        returning: false,
      };
    }

    // Upgrade: Plasma Wire leaves electric laser line along launch path
    if (this.ownedUpgrades.has('laser_wake')) {
      this.plasmaWires.push({
        x1: this.player.x,
        y1: this.player.y,
        x2: this.player.x + this.player.dirX * 40,
        y2: this.player.y + this.player.dirY * 40,
        life: 2.5,
        maxLife: 2.5,
      });
    }

    if (sweetSpot) {
      this.unbankedMult += 1;
      this.addCallout(this.player.x, this.player.y - 24, 'SWEET SNAP! +1x', '#fbbf24', 1.15);
      this.shockwaves.push({
        x: this.player.x,
        y: this.player.y,
        radius: 12,
        maxRadius: 72,
        life: 0.22,
        maxLife: 0.22,
        color: '#fbbf24',
        lineWidth: 4,
      });
    }

    // Directional camera recoil proportional to launch force
    this.applyDirectionalShake(-this.player.dirX, -this.player.dirY, 6 + ratio * 11);
    this.synth.playSnapLaunch(ratio, sweetSpot);

    // Launch burst particles
    for (let i = 0; i < 12; i++) {
      const spread = this.rng.range(-0.45, 0.45);
      const ang = this.player.stretchAngle + Math.PI + spread;
      const spd = this.rng.range(120, 380);
      this.particles.push({
        x: this.player.x,
        y: this.player.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: this.rng.range(2.2, 4.4),
        life: 0.28,
        maxLife: 0.28,
        color: sweetSpot ? '#fbbf24' : '#00f2fe',
      });
    }
  }

  /** Mandatory Juice: 30-50ms hit-stop frames on heavy impacts */
  public triggerHitStop(durationS: number = SNAPBACK_CONFIG.HITSTOP_KILL_S): void {
    this.hitStopTimerS = Math.max(this.hitStopTimerS, durationS);
  }

  /** Mandatory Juice: Directional screen shake proportional to impact force */
  public applyDirectionalShake(nx: number, ny: number, force: number): void {
    const mag = Math.hypot(nx, ny) || 1;
    const ux = nx / mag;
    const uy = ny / mag;
    this.shakeVx += ux * force * 42;
    this.shakeVy += uy * force * 42;
    this.shakeX += ux * Math.min(18, force * 0.85);
    this.shakeY += uy * Math.min(18, force * 0.85);
  }

  public addCallout(
    x: number,
    y: number,
    text: string,
    color = '#00f2fe',
    scale = 1
  ): void {
    this.callouts.push({
      x,
      y,
      vy: -48,
      text,
      color,
      life: 0.75,
      maxLife: 0.75,
      scale,
    });
  }

  public spawnEnemy(
    kind?: EnemyKind,
    customX?: number,
    customY?: number,
    telegraphS = 0.85
  ): EnemyEntity {
    const chosenKind: EnemyKind =
      kind ?? this.pickWaveEnemyKind(this.wave);

    let x = customX;
    let y = customY;
    if (x === undefined || y === undefined) {
      const margin = SNAPBACK_CONFIG.WALL_MARGIN + 46;
      for (let attempt = 0; attempt < 12; attempt++) {
        const cx = this.rng.range(margin, SNAPBACK_CONFIG.WIDTH - margin);
        const cy = this.rng.range(margin, SNAPBACK_CONFIG.HEIGHT - margin);
        if (Math.hypot(cx - this.player.x, cy - this.player.y) > 190) {
          x = cx;
          y = cy;
          break;
        }
      }
      x = x ?? SNAPBACK_CONFIG.WIDTH - margin;
      y = y ?? margin;
    }

    const radius = chosenKind === 'bulwark' ? 22 : chosenKind === 'lancer' ? 17 : 16;
    const hp = chosenKind === 'bulwark' ? 2 : 1;

    const enemy: EnemyEntity = {
      id: this.nextEnemyId++,
      kind: chosenKind,
      x,
      y,
      vx: 0,
      vy: 0,
      radius,
      hp,
      maxHp: hp,
      facingAngle: Math.atan2(this.player.y - y, this.player.x - x),
      spawnTelegraphS: telegraphS,
      attackTelegraphS: 0,
      attackDashTimerS: 0,
      lockedAimX: 0,
      lockedAimY: 0,
      isBowlingProjectile: false,
      bowlingTimerS: 0,
      scaleX: 1,
      scaleY: 1,
      stretchAngle: 0,
    };
    this.enemies.push(enemy);
    return enemy;
  }

  private pickWaveEnemyKind(waveNum: number): EnemyKind {
    // Rule 3: Wave 1 & 2 have ONLY Drifter enemies (Wave 2 adds Bumper Pylons)
    if (waveNum <= 2) return 'drifter';
    const roll = this.rng.next();
    // Wave 3 introduces Lancers
    if (waveNum === 3) {
      return roll < 0.38 ? 'lancer' : 'drifter';
    }
    // Wave 4+ introduces Bulwark Shielded enemies
    if (roll < 0.25) return 'bulwark';
    if (roll < 0.55) return 'lancer';
    return 'drifter';
  }

  public chooseUpgrade(index: number): boolean {
    if (this.phase !== 'upgrade_choice') return false;
    const chosen = this.offeredUpgrades[index];
    if (!chosen) return false;

    this.ownedUpgrades.add(chosen.id);
    this.synth.playUpgradeSelect();

    // Advance to next wave
    this.wave += 1;
    this.waveTimerS = SNAPBACK_CONFIG.WAVE_DURATION_S;
    this.phase = 'playing';
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 1);
    this.player.isCharging = false;
    this.player.snapTimerS = 0;
    this.enemies = [];
    this.shards = [];
    this.plasmaWires = [];
    this.activeEchoAnchor = null;

    this.setupWaveArena(this.wave);
    this.spawnWaveOpeningTargets(this.wave);
    this.addCallout(
      this.player.x,
      this.player.y - 34,
      `${chosen.name} ONLINE!`,
      '#00f2fe',
      1.2
    );
    return true;
  }

  private spawnWaveOpeningTargets(waveNum: number): void {
    if (waveNum === 2) {
      this.addCallout(
        SNAPBACK_CONFIG.WIDTH * 0.5,
        SNAPBACK_CONFIG.HEIGHT * 0.5,
        'NEW: KINETIC BUMPERS (+SPEED & MULT)',
        '#fbbf24',
        1.15
      );
    } else if (waveNum === 3) {
      this.addCallout(
        SNAPBACK_CONFIG.WIDTH * 0.5,
        SNAPBACK_CONFIG.HEIGHT * 0.5,
        'NEW ENEMY: TELEGRAPH LANCERS',
        '#ff2a5f',
        1.15
      );
      this.spawnEnemy('lancer', SNAPBACK_CONFIG.WIDTH * 0.76, SNAPBACK_CONFIG.HEIGHT * 0.5, 0.7);
    } else if (waveNum === 4) {
      this.addCallout(
        SNAPBACK_CONFIG.WIDTH * 0.5,
        SNAPBACK_CONFIG.HEIGHT * 0.5,
        'NEW ENEMY: SHIELD BULWARKS (BANK BEHIND!)',
        '#ff2a5f',
        1.15
      );
      this.spawnEnemy('bulwark', SNAPBACK_CONFIG.WIDTH * 0.74, SNAPBACK_CONFIG.HEIGHT * 0.5, 0.7);
    } else if (waveNum === 5) {
      this.addCallout(
        SNAPBACK_CONFIG.WIDTH * 0.5,
        SNAPBACK_CONFIG.HEIGHT * 0.5,
        'NEW HAZARD: CENTRAL PULSE WELL',
        '#ff2a5f',
        1.15
      );
    }
    this.spawnEnemy('drifter');
    this.spawnEnemy('drifter');
  }

  public step(dt: number): void {
    const clampedDt = Math.min(dt, 0.05);

    // Update spring camera shake even during hit-stop so screen vibrates on impact
    this.updateCameraShake(clampedDt);

    if (this.lastDamageContact) {
      this.lastDamageContact.timerS -= clampedDt;
      if (this.lastDamageContact.timerS <= 0) {
        this.lastDamageContact = null;
      }
    }

    if (this.phase !== 'playing') {
      return;
    }

    // Hit-stop freezes world simulation for 30-50ms on heavy impacts
    if (this.hitStopTimerS > 0) {
      this.hitStopTimerS = Math.max(0, this.hitStopTimerS - clampedDt);
      return;
    }

    // 1. Update wave countdown
    this.waveTimerS -= clampedDt;
    if (this.waveTimerS <= 0) {
      this.completeCurrentWave();
      return;
    }

    // 2. Update Player Physics, Charge, and Ricochets
    this.updatePlayer(clampedDt);

    // 3. Update Unbanked Pot & Greedy Cash-Out Ring
    this.updateComboBanking(clampedDt);

    // 4. Update Arena Bumpers, Pulse Wells, Plasma Wires, Prism Shards, Echo Anchor
    this.updateArenaSystems(clampedDt);

    // 5. Update Enemies & Collisions
    this.updateEnemies(clampedDt);

    // 6. Spawn Pacing
    this.updateSpawning(clampedDt);

    // 7. Update Visual Trails, Particles, Shockwaves, Callouts
    this.updateVfx(clampedDt);
  }

  private completeCurrentWave(): void {
    // Auto-bank any unbanked pot on wave clear!
    if (this.unbankedChips > 0) {
      this.bankUnbankedPot(true);
    }
    this.player.isCharging = false;
    this.player.snapTimerS = 0;
    this.offeredUpgrades = pickThreeUpgrades(this.ownedUpgrades, () => this.rng.next());
    this.phase = 'upgrade_choice';
  }

  private updateCameraShake(dt: number): void {
    const stiffness = 260;
    const damping = 18;
    const ax = -stiffness * this.shakeX - damping * this.shakeVx;
    const ay = -stiffness * this.shakeY - damping * this.shakeVy;
    this.shakeVx += ax * dt;
    this.shakeVy += ay * dt;
    this.shakeX += this.shakeVx * dt;
    this.shakeY += this.shakeVy * dt;
    if (Math.hypot(this.shakeX, this.shakeY) < 0.08 && Math.hypot(this.shakeVx, this.shakeVy) < 0.5) {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeVx = 0;
      this.shakeVy = 0;
    }
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    if (p.invulnTimerS > 0) {
      p.invulnTimerS = Math.max(0, p.invulnTimerS - dt);
    }

    // Keyboard movement / aim vector support
    const kx = (this.moveKeys.right ? 1 : 0) - (this.moveKeys.left ? 1 : 0);
    const ky = (this.moveKeys.down ? 1 : 0) - (this.moveKeys.up ? 1 : 0);
    if (kx !== 0 || ky !== 0) {
      const km = Math.hypot(kx, ky);
      if (!this.usingPointerAim) {
        p.dirX = kx / km;
        p.dirY = ky / km;
        p.aimX = p.x + p.dirX * 180;
        p.aimY = p.y + p.dirY * 180;
      }
    } else if (this.usingPointerAim) {
      this.updateAimVector();
    }

    if (p.isCharging) {
      p.chargeTimeS = Math.min(SNAPBACK_CONFIG.MAX_CHARGE_TIME_S, p.chargeTimeS + dt);
      // Heavy magnetic braking with slight spring resistance
      const damp = Math.exp(-SNAPBACK_CONFIG.BRAKE_DRAG * dt);
      p.vx *= damp;
      p.vy *= damp;

      // Anticipation squash along aim direction
      const ratio = this.getChargeRatio();
      p.stretchAngle = Math.atan2(p.dirY, p.dirX);
      p.scaleX = 1.0 - 0.36 * ratio;
      p.scaleY = 1.0 + 0.34 * ratio;

      // Harmonic charge audio tick
      this.chargeTickCooldownS -= dt;
      if (this.chargeTickCooldownS <= 0) {
        this.synth.playChargeTick(ratio, this.isChargeInSweetSpot());
        this.chargeTickCooldownS = 0.09 - ratio * 0.04;
      }

      // Upgrade: Gravity Vortex pulls nearby enemies into aim line while charging
      if (this.ownedUpgrades.has('gravity_coil')) {
        const focusX = p.x + p.dirX * 145;
        const focusY = p.y + p.dirY * 145;
        for (const e of this.enemies) {
          if (e.spawnTelegraphS > 0) continue;
          const dx = focusX - e.x;
          const dy = focusY - e.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 8 && dist < 240) {
            e.vx += (dx / dist) * 420 * dt;
            e.vy += (dy / dist) * 420 * dt;
          }
        }
      }
    } else if (p.snapTimerS > 0) {
      // High-velocity Snap-Launch flight
      p.snapTimerS = Math.max(0, p.snapTimerS - dt);
      const damp = Math.exp(-SNAPBACK_CONFIG.SNAP_DRAG * dt);
      p.vx *= damp;
      p.vy *= damp;
      p.orbitBladeAngle += dt * 16;

      // Keep plasma wire segment anchored to player if owned
      if (this.ownedUpgrades.has('laser_wake') && this.plasmaWires.length > 0) {
        const lastWire = this.plasmaWires[this.plasmaWires.length - 1];
        lastWire.x2 = p.x;
        lastWire.y2 = p.y;
      }
    } else {
      // Tactile weighty cruise toward cursor or keyboard vector
      let targetVx = 0;
      let targetVy = 0;
      if (kx !== 0 || ky !== 0) {
        const km = Math.hypot(kx, ky);
        targetVx = (kx / km) * SNAPBACK_CONFIG.MAX_CRUISE_SPEED;
        targetVy = (ky / km) * SNAPBACK_CONFIG.MAX_CRUISE_SPEED;
      } else {
        const dx = p.aimX - p.x;
        const dy = p.aimY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 14) {
          const factor = Math.min(1, (dist - 14) / 110);
          targetVx = (dx / dist) * SNAPBACK_CONFIG.MAX_CRUISE_SPEED * factor;
          targetVy = (dy / dist) * SNAPBACK_CONFIG.MAX_CRUISE_SPEED * factor;
        }
      }

      const blend = 1 - Math.exp(-SNAPBACK_CONFIG.CRUISE_DRAG * dt);
      p.vx += (targetVx - p.vx) * blend;
      p.vy += (targetVy - p.vy) * blend;
    }

    // Integrate position
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Relax squash-and-stretch smoothly back toward velocity elongation or (1, 1)
    if (!p.isCharging) {
      const speed = Math.hypot(p.vx, p.vy);
      const targetStretch = 1 + Math.min(0.42, (speed / 1400) * 0.42);
      const targetSquash = 1 / Math.sqrt(targetStretch);
      if (speed > 25) {
        p.stretchAngle = Math.atan2(p.vy, p.vx);
      }
      const relax = 1 - Math.exp(-16 * dt);
      p.scaleX += (targetStretch - p.scaleX) * relax;
      p.scaleY += (targetSquash - p.scaleY) * relax;
    }

    // Arena Wall Bounces with Squash-and-Stretch & Directional Shake
    const minX = SNAPBACK_CONFIG.WALL_MARGIN + SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
    const maxX =
      SNAPBACK_CONFIG.WIDTH - SNAPBACK_CONFIG.WALL_MARGIN - SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
    const minY = SNAPBACK_CONFIG.WALL_MARGIN + SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
    const maxY =
      SNAPBACK_CONFIG.HEIGHT - SNAPBACK_CONFIG.WALL_MARGIN - SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;

    if (p.x < minX) {
      p.x = minX;
      this.handlePlayerBounce(1, 0);
    } else if (p.x > maxX) {
      p.x = maxX;
      this.handlePlayerBounce(-1, 0);
    }

    if (p.y < minY) {
      p.y = minY;
      this.handlePlayerBounce(0, 1);
    } else if (p.y > maxY) {
      p.y = maxY;
      this.handlePlayerBounce(0, -1);
    }

    // Record velocity trail
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > 80 || p.snapTimerS > 0) {
      this.playerTrail.push({
        x: p.x,
        y: p.y,
        radius: SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS * (p.snapTimerS > 0 ? 0.92 : 0.65),
        alpha: p.snapTimerS > 0 ? 0.55 : 0.25,
        color: p.snapSweetSpotActive ? '#fbbf24' : '#00f2fe',
      });
      if (this.playerTrail.length > 18) {
        this.playerTrail.shift();
      }
    }
  }

  private handlePlayerBounce(nx: number, ny: number, isBumper = false): void {
    const p = this.player;
    const dot = p.vx * nx + p.vy * ny;
    if (dot >= 0) return;

    const preSpeed = Math.hypot(p.vx, p.vy);
    const restitution = isBumper ? 1.18 : p.snapTimerS > 0 ? 0.94 : 0.72;
    p.vx = (p.vx - 2 * dot * nx) * restitution;
    p.vy = (p.vy - 2 * dot * ny) * restitution;

    // Clamp max bounce velocity
    const postSpeed = Math.hypot(p.vx, p.vy);
    if (postSpeed > 1680) {
      p.vx = (p.vx / postSpeed) * 1680;
      p.vy = (p.vy / postSpeed) * 1680;
    }

    // Squash-and-stretch flat against surface normal on impact!
    p.stretchAngle = Math.atan2(ny, nx);
    p.scaleX = 0.54;
    p.scaleY = 1.50;

    // Directional camera kick along impact direction (-nx, -ny)
    const shakeForce = Math.min(18, (preSpeed / 1200) * 14 + (isBumper ? 5 : 2));
    this.applyDirectionalShake(-nx, -ny, shakeForce);

    // Wall spark shower
    for (let i = 0; i < 9; i++) {
      const baseAng = Math.atan2(ny, nx) + this.rng.range(-0.9, 0.9);
      const spd = this.rng.range(90, 310);
      this.particles.push({
        x: p.x - nx * SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS,
        y: p.y - ny * SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS,
        vx: Math.cos(baseAng) * spd,
        vy: Math.sin(baseAng) * spd,
        radius: this.rng.range(2, 3.8),
        life: 0.24,
        maxLife: 0.24,
        color: isBumper ? '#fbbf24' : '#00f2fe',
      });
    }

    if (p.snapTimerS > 0 || isBumper) {
      p.bouncesThisSnap += 1;
      if (isBumper) {
        p.snapTimerS = Math.max(p.snapTimerS, 0.35) + 0.14;
      }

      // Add to unbanked combo on high-speed ricochet
      this.comboStreak += 1;
      this.bestComboStreak = Math.max(this.bestComboStreak, this.comboStreak);
      this.unbankedChips += isBumper ? 50 : 25;
      this.unbankedMult += 1;
      this.synth.playComboHit(this.comboStreak, false);

      if (preSpeed > 650 || isBumper) {
        this.triggerHitStop(SNAPBACK_CONFIG.HITSTOP_BOUNCE_S);
      }

      // Upgrade: Seeking Bank bends trajectory toward nearest enemy
      if (this.ownedUpgrades.has('magnetic_ricochet')) {
        this.bendVelocityTowardNearestEnemy(0.65);
      }

      // Upgrade: Prism Shards fires 2 piercing bolts on wall bounce
      if (this.ownedUpgrades.has('wall_splitter')) {
        const baseAngle = Math.atan2(ny, nx);
        for (const offset of [-0.32, 0.32]) {
          const a = baseAngle + offset;
          this.shards.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(a) * 920,
            vy: Math.sin(a) * 920,
            radius: 7,
            life: 0.85,
          });
        }
      }

      // Upgrade: Tether Echo snaps anchor to player on first bounce
      if (
        this.ownedUpgrades.has('echo_anchor') &&
        this.activeEchoAnchor &&
        !this.activeEchoAnchor.returning
      ) {
        this.activeEchoAnchor.returning = true;
      }

      // Upgrade: Ricochet Nova on every 2nd bounce in a launch
      if (this.ownedUpgrades.has('corner_nova') && p.bouncesThisSnap % 2 === 0) {
        this.detonateNova(p.x, p.y, 170);
      }

      // Start a new plasma wire segment after bounce
      if (this.ownedUpgrades.has('laser_wake')) {
        this.plasmaWires.push({
          x1: p.x,
          y1: p.y,
          x2: p.x,
          y2: p.y,
          life: 2.5,
          maxLife: 2.5,
        });
      }
    }
  }

  private bendVelocityTowardNearestEnemy(maxTurnRadians: number): void {
    const p = this.player;
    let nearest: EnemyEntity | null = null;
    let bestDist = Infinity;
    for (const e of this.enemies) {
      if (e.spawnTelegraphS > 0) continue;
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < bestDist) {
        bestDist = d;
        nearest = e;
      }
    }
    if (!nearest) return;

    const speed = Math.hypot(p.vx, p.vy);
    if (speed < 100) return;

    const curAngle = Math.atan2(p.vy, p.vx);
    const targetAngle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    let diff = targetAngle - curAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    const clampedTurn = Math.max(-maxTurnRadians, Math.min(maxTurnRadians, diff));
    const newAngle = curAngle + clampedTurn;
    p.vx = Math.cos(newAngle) * speed;
    p.vy = Math.sin(newAngle) * speed;
  }

  private detonateNova(x: number, y: number, radius: number): void {
    this.shockwaves.push({
      x,
      y,
      radius: 14,
      maxRadius: radius,
      life: 0.28,
      maxLife: 0.28,
      color: '#fbbf24',
      lineWidth: 6,
    });
    this.addCallout(x, y - 20, 'RICOCHET NOVA!', '#fbbf24', 1.15);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.spawnTelegraphS > 0) continue;
      if (Math.hypot(e.x - x, e.y - y) <= radius + e.radius) {
        this.killEnemy(i, 1, 0);
      }
    }
  }

  private updateComboBanking(dt: number): void {
    if (this.unbankedChips <= 0) {
      this.bankProgress = 0;
      return;
    }

    // While cruising calmly (not charging and not in high-speed snap), banking ring fills
    if (!this.player.isCharging && this.player.snapTimerS <= 0) {
      this.bankProgress += dt / SNAPBACK_CONFIG.BANK_HOLD_TIME_S;
      if (this.bankProgress >= 1) {
        this.bankUnbankedPot(false);
      }
    }
  }

  public bankUnbankedPot(fromWaveClear = false): number {
    if (this.unbankedChips <= 0) return 0;
    const total = this.unbankedChips * this.unbankedMult;
    this.score += total;
    const mult = this.unbankedMult;

    this.unbankedChips = 0;
    this.unbankedMult = 1;
    this.bankProgress = 0;
    this.comboStreak = 0;

    this.synth.playBankCashout(mult);
    this.addCallout(
      this.player.x,
      this.player.y - 30,
      fromWaveClear ? `WAVE BANK +${total}!` : `BANKED +${total} (x${mult})`,
      '#fbbf24',
      1.25
    );
    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 18,
      maxRadius: 95,
      life: 0.28,
      maxLife: 0.28,
      color: '#fbbf24',
      lineWidth: 4,
    });
    return total;
  }

  private updateArenaSystems(dt: number): void {
    const p = this.player;

    // 1. Bumper Pylons collision & squash recovery
    for (const b of this.bumpers) {
      b.pulse += dt * 4;
      b.scaleX += (1 - b.scaleX) * Math.min(1, dt * 14);
      b.scaleY += (1 - b.scaleY) * Math.min(1, dt * 14);

      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const dist = Math.hypot(dx, dy) || 1;
      const minDist = b.radius + SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
      if (dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        p.x = b.x + nx * minDist;
        p.y = b.y + ny * minDist;
        b.scaleX = 1.38;
        b.scaleY = 0.68;
        this.handlePlayerBounce(nx, ny, true);
      }
    }

    // 2. Echo Anchor return zip
    if (this.activeEchoAnchor && this.activeEchoAnchor.returning) {
      const dx = p.x - this.activeEchoAnchor.x;
      const dy = p.y - this.activeEchoAnchor.y;
      const dist = Math.hypot(dx, dy);
      const stepDist = 1850 * dt;
      if (dist <= stepDist + 22) {
        this.activeEchoAnchor = null;
      } else {
        const ux = dx / dist;
        const uy = dy / dist;
        this.activeEchoAnchor.x += ux * stepDist;
        this.activeEchoAnchor.y += uy * stepDist;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const e = this.enemies[i];
          if (e.spawnTelegraphS > 0) continue;
          if (
            Math.hypot(e.x - this.activeEchoAnchor.x, e.y - this.activeEchoAnchor.y) <=
            e.radius + 22
          ) {
            this.killEnemy(i, ux, uy);
          }
        }
      }
    }

    // 3. Prism Shards
    for (let sIdx = this.shards.length - 1; sIdx >= 0; sIdx--) {
      const s = this.shards[sIdx];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;

      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const e = this.enemies[eIdx];
        if (e.spawnTelegraphS > 0) continue;
        if (Math.hypot(e.x - s.x, e.y - s.y) <= e.radius + s.radius) {
          this.killEnemy(eIdx, s.vx, s.vy);
        }
      }

      if (
        s.life <= 0 ||
        s.x < 0 ||
        s.x > SNAPBACK_CONFIG.WIDTH ||
        s.y < 0 ||
        s.y > SNAPBACK_CONFIG.HEIGHT
      ) {
        this.shards.splice(sIdx, 1);
      }
    }

    // 4. Plasma Wires
    for (let wIdx = this.plasmaWires.length - 1; wIdx >= 0; wIdx--) {
      const w = this.plasmaWires[wIdx];
      w.life -= dt;
      if (w.life <= 0) {
        this.plasmaWires.splice(wIdx, 1);
        continue;
      }
      for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
        const e = this.enemies[eIdx];
        if (e.spawnTelegraphS > 0) continue;
        if (this.pointToSegmentDistance(e.x, e.y, w.x1, w.y1, w.x2, w.y2) <= e.radius + 6) {
          this.killEnemy(eIdx, w.x2 - w.x1, w.y2 - w.y1);
        }
      }
    }

    // 5. Pulse Wells (Wave 5+)
    for (const well of this.pulseWells) {
      well.cycleTimerS += dt;
      if (well.cycleTimerS >= well.cyclePeriodS) {
        well.cycleTimerS = 0;
        this.shockwaves.push({
          x: well.x,
          y: well.y,
          radius: 10,
          maxRadius: well.radius,
          life: 0.25,
          maxLife: 0.25,
          color: '#ff2a5f',
          lineWidth: 4,
        });
        // Pulse kills enemies inside AND hurts player if vulnerable inside
        for (let eIdx = this.enemies.length - 1; eIdx >= 0; eIdx--) {
          const e = this.enemies[eIdx];
          if (e.spawnTelegraphS <= 0 && Math.hypot(e.x - well.x, e.y - well.y) <= well.radius) {
            this.killEnemy(eIdx, e.x - well.x, e.y - well.y);
          }
        }
        if (
          p.snapTimerS <= 0 &&
          p.invulnTimerS <= 0 &&
          Math.hypot(p.x - well.x, p.y - well.y) <= well.radius
        ) {
          this.damagePlayer(well.x, well.y);
        }
      }
    }
  }

  private pointToSegmentDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    const playerAttacking = p.snapTimerS > 0;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Relax enemy squash/stretch
      e.scaleX += (1 - e.scaleX) * Math.min(1, dt * 12);
      e.scaleY += (1 - e.scaleY) * Math.min(1, dt * 12);

      if (e.spawnTelegraphS > 0) {
        e.spawnTelegraphS = Math.max(0, e.spawnTelegraphS - dt);
        continue;
      }

      if (e.isBowlingProjectile) {
        e.bowlingTimerS -= dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;

        // Domino collision with other enemies!
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          if (i === j) continue;
          const other = this.enemies[j];
          if (other.spawnTelegraphS > 0) continue;
          if (Math.hypot(other.x - e.x, other.y - e.y) <= other.radius + e.radius + 6) {
            const ovx = e.vx;
            const ovy = e.vy;
            this.killEnemy(j, ovx, ovy);
            if (j < i) i--;
          }
        }

        if (
          e.bowlingTimerS <= 0 ||
          e.x <= SNAPBACK_CONFIG.WALL_MARGIN + e.radius ||
          e.x >= SNAPBACK_CONFIG.WIDTH - SNAPBACK_CONFIG.WALL_MARGIN - e.radius ||
          e.y <= SNAPBACK_CONFIG.WALL_MARGIN + e.radius ||
          e.y >= SNAPBACK_CONFIG.HEIGHT - SNAPBACK_CONFIG.WALL_MARGIN - e.radius
        ) {
          this.killEnemy(i, e.vx, e.vy);
          continue;
        }
      } else {
        // Normal enemy behavior by kind
        const toPlayerX = p.x - e.x;
        const toPlayerY = p.y - e.y;
        const distToPlayer = Math.hypot(toPlayerX, toPlayerY) || 1;
        const ux = toPlayerX / distToPlayer;
        const uy = toPlayerY / distToPlayer;

        if (e.kind === 'drifter') {
          const speed = 108 + Math.min(55, this.wave * 7);
          e.vx += (ux * speed - e.vx) * Math.min(1, dt * 5);
          e.vy += (uy * speed - e.vy) * Math.min(1, dt * 5);
          e.facingAngle = Math.atan2(e.vy, e.vx);
        } else if (e.kind === 'lancer') {
          if (e.attackDashTimerS > 0) {
            e.attackDashTimerS -= dt;
          } else if (e.attackTelegraphS > 0) {
            // Stationary while locking crimson telegraph laser
            e.vx *= Math.exp(-10 * dt);
            e.vy *= Math.exp(-10 * dt);
            e.attackTelegraphS -= dt;
            if (e.attackTelegraphS <= 0) {
              // Dash along locked aim vector!
              e.vx = e.lockedAimX * 540;
              e.vy = e.lockedAimY * 540;
              e.attackDashTimerS = 0.36;
              e.scaleX = 1.45;
              e.scaleY = 0.65;
              e.stretchAngle = Math.atan2(e.vy, e.vx);
            }
          } else if (distToPlayer < 320) {
            e.attackTelegraphS = 0.95;
            e.lockedAimX = ux;
            e.lockedAimY = uy;
            e.facingAngle = Math.atan2(uy, ux);
          } else {
            e.vx += (ux * 145 - e.vx) * Math.min(1, dt * 5);
            e.vy += (uy * 145 - e.vy) * Math.min(1, dt * 5);
            e.facingAngle = Math.atan2(uy, ux);
          }
        } else if (e.kind === 'bulwark') {
          const speed = 82 + Math.min(35, this.wave * 5);
          e.vx += (ux * speed - e.vx) * Math.min(1, dt * 4);
          e.vy += (uy * speed - e.vy) * Math.min(1, dt * 4);
          // Smoothly rotate front shield toward player
          let angleDiff = Math.atan2(uy, ux) - e.facingAngle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          e.facingAngle += angleDiff * Math.min(1, dt * 2.6);
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;

        // Keep enemies inside arena walls
        const minX = SNAPBACK_CONFIG.WALL_MARGIN + e.radius;
        const maxX = SNAPBACK_CONFIG.WIDTH - SNAPBACK_CONFIG.WALL_MARGIN - e.radius;
        const minY = SNAPBACK_CONFIG.WALL_MARGIN + e.radius;
        const maxY = SNAPBACK_CONFIG.HEIGHT - SNAPBACK_CONFIG.WALL_MARGIN - e.radius;
        if (e.x < minX) {
          e.x = minX;
          e.vx = Math.abs(e.vx);
        } else if (e.x > maxX) {
          e.x = maxX;
          e.vx = -Math.abs(e.vx);
        }
        if (e.y < minY) {
          e.y = minY;
          e.vy = Math.abs(e.vy);
        } else if (e.y > maxY) {
          e.y = maxY;
          e.vy = -Math.abs(e.vy);
        }
      }

      // Check Orbiting Saws upgrade during Sweet-Spot Snap
      if (playerAttacking && p.snapSweetSpotActive && this.ownedUpgrades.has('orbit_blades')) {
        for (const bladeOffset of [0, Math.PI]) {
          const bx = p.x + Math.cos(p.orbitBladeAngle + bladeOffset) * 62;
          const by = p.y + Math.sin(p.orbitBladeAngle + bladeOffset) * 62;
          if (Math.hypot(e.x - bx, e.y - by) <= e.radius + 16) {
            this.killEnemy(i, p.vx, p.vy);
            break;
          }
        }
        if (!this.enemies[i]) continue;
      }

      // Check Player <-> Enemy Collision
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (playerAttacking) {
        if (dist <= e.radius + SNAPBACK_CONFIG.PLAYER_STRIKE_RADIUS) {
          // Check Bulwark front shield unless Sweet-Spot Overcharged
          if (e.kind === 'bulwark' && !p.snapSweetSpotActive && !e.isBowlingProjectile) {
            const hitFromAngle = Math.atan2(p.y - e.y, p.x - e.x);
            let shieldDiff = hitFromAngle - e.facingAngle;
            while (shieldDiff > Math.PI) shieldDiff -= Math.PI * 2;
            while (shieldDiff < -Math.PI) shieldDiff += Math.PI * 2;
            if (Math.abs(shieldDiff) < 1.05) {
              // Deflected off front shield! Bounce player back safely and crack shield
              const nx = -dx / dist;
              const ny = -dy / dist;
              this.handlePlayerBounce(nx, ny, true);
              e.hp -= 1;
              if (e.hp <= 0) {
                this.killEnemy(i, p.vx, p.vy);
              } else {
                this.addCallout(e.x, e.y - 22, 'SHIELD CRACKED!', '#fbbf24', 0.95);
              }
              continue;
            }
          }

          // Upgrade: Domino Launch turns struck enemy into a high-speed bowling ball
          if (this.ownedUpgrades.has('domino_bowling') && !e.isBowlingProjectile) {
            e.isBowlingProjectile = true;
            e.bowlingTimerS = 0.55;
            const pSpd = Math.hypot(p.vx, p.vy) || 900;
            e.vx = (dx / dist) * Math.max(950, pSpd * 1.15);
            e.vy = (dy / dist) * Math.max(950, pSpd * 1.15);
            this.triggerHitStop(SNAPBACK_CONFIG.HITSTOP_KILL_S);
            this.applyDirectionalShake(dx / dist, dy / dist, 10);
            this.synth.playComboHit(this.comboStreak + 1, true);
            continue;
          }

          this.killEnemy(i, p.vx, p.vy);
        }
      } else if (p.invulnTimerS <= 0 && dist <= e.radius + SNAPBACK_CONFIG.PLAYER_HURT_RADIUS) {
        // Player hit while vulnerable!
        this.damagePlayer(e.x, e.y);
      }
    }
  }

  public killEnemy(index: number, impactVx: number, impactVy: number): void {
    const e = this.enemies[index];
    if (!e) return;
    this.enemies.splice(index, 1);

    // 1. Mandatory 30-50ms Hit-Stop Frame
    this.triggerHitStop(SNAPBACK_CONFIG.HITSTOP_KILL_S);

    // 2. Mandatory Directional Screen Shake proportional to force
    const speed = Math.hypot(impactVx, impactVy) || 600;
    const ux = impactVx / speed;
    const uy = impactVy / speed;
    this.applyDirectionalShake(ux, uy, Math.min(18, (speed / 1000) * 14));

    // 3. Player squash-and-stretch impact pulse
    this.player.scaleX = 1.42;
    this.player.scaleY = 0.66;

    // 4. Extend Snap-Launch slightly on kill so multi-kills flow naturally
    if (this.player.snapTimerS > 0) {
      this.player.snapTimerS = Math.min(0.85, this.player.snapTimerS + 0.11);
    }

    // 5. Increment Combo & Unbanked Pot
    this.comboStreak += 1;
    this.bestComboStreak = Math.max(this.bestComboStreak, this.comboStreak);
    const basePts = e.kind === 'bulwark' ? 200 : e.kind === 'lancer' ? 150 : 100;
    this.unbankedChips += basePts;
    this.unbankedMult += this.player.snapSweetSpotActive ? 2 : 1;

    // 6. Harmonic Combo Pitching WebAudio Synth
    this.synth.playComboHit(this.comboStreak, true);

    this.addCallout(
      e.x,
      e.y - 14,
      `+${basePts} ×${this.unbankedMult}`,
      this.player.snapSweetSpotActive ? '#fbbf24' : '#00f2fe',
      1.08
    );

    // 7. Crisp Shatter Particles & Ring
    this.shockwaves.push({
      x: e.x,
      y: e.y,
      radius: e.radius * 0.7,
      maxRadius: e.radius * 3.1,
      life: 0.22,
      maxLife: 0.22,
      color: '#ff2a5f',
      lineWidth: 3.5,
    });

    for (let pIdx = 0; pIdx < 14; pIdx++) {
      const ang = Math.atan2(uy, ux) + this.rng.range(-1.2, 1.2);
      const spd = this.rng.range(110, 440);
      this.particles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        radius: this.rng.range(2.5, 5.2),
        life: 0.34,
        maxLife: 0.34,
        color: pIdx % 3 === 0 ? '#fbbf24' : '#ff2a5f',
      });
    }
  }

  public damagePlayer(sourceX: number, sourceY: number): void {
    const p = this.player;
    if (p.invulnTimerS > 0 || p.snapTimerS > 0) return;

    p.hp = Math.max(0, p.hp - 1);
    p.invulnTimerS = 1.05;
    p.isCharging = false;
    p.chargeTimeS = 0;

    const dx = p.x - sourceX;
    const dy = p.y - sourceY;
    const d = Math.hypot(dx, dy) || 1;
    p.vx = (dx / d) * 420;
    p.vy = (dy / d) * 420;

    // Highlight exact contact point so player always knows why they got hit
    this.lastDamageContact = {
      x: (p.x + sourceX) * 0.5,
      y: (p.y + sourceY) * 0.5,
      timerS: 0.55,
    };

    this.triggerHitStop(0.048);
    this.applyDirectionalShake(dx / d, dy / d, 16);
    this.synth.playDamageShatter();

    // Push-Your-Luck Consequence: Unbanked pot shatters on hit!
    if (this.unbankedChips > 0) {
      const lost = this.unbankedChips * this.unbankedMult;
      this.unbankedChips = 0;
      this.unbankedMult = 1;
      this.bankProgress = 0;
      this.comboStreak = 0;
      this.addCallout(p.x, p.y - 28, `POT SHATTERED! (-${lost})`, '#ff2a5f', 1.25);
    } else {
      this.addCallout(p.x, p.y - 28, 'HULL HIT!', '#ff2a5f', 1.15);
    }

    if (p.hp <= 0) {
      this.phase = 'gameover';
    }
  }

  private updateSpawning(dt: number): void {
    this.spawnCooldownS -= dt;
    const maxEnemiesOnScreen = Math.min(8, 3 + this.wave);
    if (this.spawnCooldownS <= 0 && this.enemies.length < maxEnemiesOnScreen) {
      this.spawnEnemy();
      this.spawnCooldownS = Math.max(0.85, 1.9 - this.wave * 0.14);
    }
  }

  private updateVfx(dt: number): void {
    for (let i = this.playerTrail.length - 1; i >= 0; i--) {
      this.playerTrail[i].alpha -= dt * 2.2;
      this.playerTrail[i].radius *= 0.96;
      if (this.playerTrail[i].alpha <= 0.02) {
        this.playerTrail.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.exp(-5 * dt);
      pt.vy *= Math.exp(-5 * dt);
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life -= dt;
      const progress = 1 - Math.max(0, sw.life / sw.maxLife);
      sw.radius = sw.maxRadius * progress;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i];
      c.y += c.vy * dt;
      c.life -= dt;
      if (c.life <= 0) {
        this.callouts.splice(i, 1);
      }
    }
  }

  /** Computes a live 2-bounce trajectory preview while charging so player can line up bank shots */
  public computeTrajectoryPreview(): Array<{ x: number; y: number }> {
    const p = this.player;
    const pts: Array<{ x: number; y: number }> = [{ x: p.x, y: p.y }];
    if (!p.isCharging) return pts;

    const minX = SNAPBACK_CONFIG.WALL_MARGIN + SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
    const maxX =
      SNAPBACK_CONFIG.WIDTH - SNAPBACK_CONFIG.WALL_MARGIN - SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
    const minY = SNAPBACK_CONFIG.WALL_MARGIN + SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;
    const maxY =
      SNAPBACK_CONFIG.HEIGHT - SNAPBACK_CONFIG.WALL_MARGIN - SNAPBACK_CONFIG.PLAYER_VISUAL_RADIUS;

    let cx = p.x;
    let cy = p.y;
    let dx = p.dirX;
    let dy = p.dirY;
    let remainingDist = 280 + this.getChargeRatio() * 520;

    for (let seg = 0; seg < 2 && remainingDist > 10; seg++) {
      let tx = Infinity;
      let ty = Infinity;
      if (dx > 0.0001) tx = (maxX - cx) / dx;
      else if (dx < -0.0001) tx = (minX - cx) / dx;

      if (dy > 0.0001) ty = (maxY - cy) / dy;
      else if (dy < -0.0001) ty = (minY - cy) / dy;

      const hitDist = Math.min(tx, ty);
      if (hitDist <= remainingDist) {
        cx += dx * hitDist;
        cy += dy * hitDist;
        pts.push({ x: cx, y: cy });
        remainingDist -= hitDist;
        if (tx < ty) dx = -dx;
        else dy = -dy;
      } else {
        cx += dx * remainingDist;
        cy += dy * remainingDist;
        pts.push({ x: cx, y: cy });
        break;
      }
    }
    return pts;
  }
}
