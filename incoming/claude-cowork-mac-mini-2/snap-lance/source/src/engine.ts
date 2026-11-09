import { SnapLanceSynth } from './audio';

export type EnemyKind = 'drifter' | 'charger' | 'shielded' | 'pulsar';

export type UpgradeId =
  | 'split_prism'
  | 'phantom_echo'
  | 'gravity_tether'
  | 'shockwave_anchor'
  | 'lightning_chain'
  | 'pinball_decoy'
  | 'boomerang_orb'
  | 'corner_nova'
  | 'sawblade_orbit';

export interface UpgradeCardSpec {
  id: UpgradeId;
  title: string;
  description: string; // Strictly 1 short sentence
  tag: string;
}

export const UPGRADE_CATALOG: readonly UpgradeCardSpec[] = [
  {
    id: 'split_prism',
    title: 'SPLIT PRISM',
    description: 'Wall bounces fire two angled cyan laser shards into the arena.',
    tag: 'RICOCHET',
  },
  {
    id: 'phantom_echo',
    title: 'PHANTOM ECHO',
    description: 'Your dash leaves a delayed cyan ghost that repeats your path.',
    tag: 'ECHO',
  },
  {
    id: 'gravity_tether',
    title: 'GRAVITY TETHER',
    description: 'Charging pulls nearby enemies directly into your aim line.',
    tag: 'CONTROL',
  },
  {
    id: 'shockwave_anchor',
    title: 'SHOCKWAVE ANCHOR',
    description: 'Braking at dash end unleashes a cyan ring that slams enemies.',
    tag: 'IMPACT',
  },
  {
    id: 'lightning_chain',
    title: 'ARC CONDUIT',
    description: 'Skewering an enemy arcs cyan lightning to the nearest target.',
    tag: 'CHAIN',
  },
  {
    id: 'pinball_decoy',
    title: 'PINBALL BUMPER',
    description: 'Launching drops a cyan bumper core that ricochets shots and foes.',
    tag: 'ARENA',
  },
  {
    id: 'boomerang_orb',
    title: 'BOOMERANG ORB',
    description: 'Releasing a dash hurls a spinning cyan orb that curves back.',
    tag: 'PROJECTILE',
  },
  {
    id: 'corner_nova',
    title: 'WALL NOVA',
    description: 'Every wall bounce detonates a cyan blast at the impact point.',
    tag: 'BLAST',
  },
  {
    id: 'sawblade_orbit',
    title: 'ORBITAL BLADE',
    description: 'A spinning cyan blade orbits you and expands while dashing.',
    tag: 'ORBIT',
  },
];

export interface TrailPoint {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  isDash: boolean;
}

export interface Afterimage {
  x: number;
  y: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  alpha: number;
}

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  prevX: number;
  prevY: number;
  life: number;
  maxLife: number;
  color: 'cyan' | 'gold' | 'crimson' | 'white';
  thickness: number;
}

export interface ShockRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: 'cyan' | 'gold' | 'crimson';
  lineWidth: number;
}

export interface SlashFlash {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  alpha: number;
  color: 'cyan' | 'gold' | 'crimson';
}

export interface FloatingCallout {
  x: number;
  y: number;
  vy: number;
  text: string;
  alpha: number;
  scale: number;
  color: 'cyan' | 'gold' | 'crimson';
}

export interface FriendlyShard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bouncesLeft: number;
  life: number;
  isBoomerang: boolean;
  trail: { x: number; y: number }[];
}

export interface PhantomGhost {
  waypoints: { x: number; y: number; angle: number }[];
  delayTimer: number;
  segmentIndex: number;
  segmentProgress: number;
  x: number;
  y: number;
  angle: number;
  radius: number;
  hitIds: Set<number>;
}

export interface ArenaBumper {
  x: number;
  y: number;
  radius: number;
  squash: number;
  isTemporary: boolean;
  life: number;
}

export interface EnemyEntity {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  facingAngle: number;
  spawnTelegraph: number; // > 0 means still telegraphing spawn (honest warning before active)
  spawnMax: number;
  attackTelegraph: number; // for charger lock-on or pulsar charge-up
  lungeTimer: number;
  lungeDirX: number;
  lungeDirY: number;
  scaleX: number;
  scaleY: number;
  stretchAngle: number;
  knockbackTimer: number;
}

export interface RaycastSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  normalX: number;
  normalY: number;
}

export interface PlayerCore {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  state: 'glide' | 'charging' | 'dash';
  aimAngle: number;
  chargeTime: number;
  maxChargeTime: number;
  chargeTier: 0 | 1 | 2 | 3; // 3 = Apex Sweet-Spot
  dashTimeLeft: number;
  dashMaxTime: number;
  bouncesLeft: number;
  bouncesDoneThisDash: number;
  killsThisDash: number;
  isApexDash: boolean;
  isDaredevilDash: boolean;
  shields: number;
  maxShields: number;
  invulnTimer: number;
  // Squash & stretch physics
  scaleX: number;
  scaleY: number;
  scaleVx: number;
  scaleVy: number;
  stretchAngle: number;
  // Orbiting blade angle
  orbitAngle: number;
  // Waypoints recorded during current dash for Phantom Echo
  currentDashWaypoints: { x: number; y: number; angle: number }[];
}

export const WAVE_DURATION_SECONDS = 30;

export class SnapLanceEngine {
  public width = 960;
  public height = 600;
  public wallPadding = 28;

  public score = 0;
  public comboStreak = 1;
  public bestStreak = 1;
  public wave = 1;
  public waveTimeRemaining = WAVE_DURATION_SECONDS;
  public phase: 'playing' | 'upgrade_draft' | 'gameover' = 'playing';

  // Mandatory Juice Budget state
  public hitStopMs = 0;
  public shakeX = 0;
  public shakeY = 0;
  public shakeVx = 0;
  public shakeVy = 0;
  public wallFlexLeft = 0;
  public wallFlexRight = 0;
  public wallFlexTop = 0;
  public wallFlexBottom = 0;

  public player: PlayerCore;
  public enemies: EnemyEntity[] = [];
  public bumpers: ArenaBumper[] = [];
  public shards: FriendlyShard[] = [];
  public phantoms: PhantomGhost[] = [];
  public trail: TrailPoint[] = [];
  public afterimages: Afterimage[] = [];
  public sparks: Spark[] = [];
  public shockRings: ShockRing[] = [];
  public slashFlashes: SlashFlash[] = [];
  public callouts: FloatingCallout[] = [];

  public activeUpgrades: Set<UpgradeId> = new Set();
  public offeredUpgrades: UpgradeCardSpec[] = [];

  // Input state (works seamlessly with Mouse move + hold/release OR 2-3 keys)
  public pointerX = 680;
  public pointerY = 300;
  public pointerActive = false;
  public isHoldingCharge = false;
  public keyAimX = 0;
  public keyAimY = 0;

  private rngState = 20261108;
  private nextEnemyId = 1;
  private spawnCooldown = 0.2;
  private elapsedWaveTime = 0;
  public readonly synth: SnapLanceSynth;

  constructor(synth = new SnapLanceSynth(), seed = 20261108) {
    this.synth = synth;
    this.rngState = seed >>> 0 || 20261108;
    this.player = this.createInitialPlayer();
    this.setupWave(1);
  }

  private random(): number {
    let x = this.rngState;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x >>> 0;
    return (this.rngState & 0x0fffffff) / 0x10000000;
  }

  private randomRange(min: number, max: number): number {
    return min + this.random() * (max - min);
  }

  private createInitialPlayer(): PlayerCore {
    return {
      x: this.width * 0.38,
      y: this.height * 0.5,
      vx: 0,
      vy: 0,
      radius: 18,
      state: 'glide',
      aimAngle: 0,
      chargeTime: 0,
      maxChargeTime: 1.05,
      chargeTier: 0,
      dashTimeLeft: 0,
      dashMaxTime: 0.42,
      bouncesLeft: 0,
      bouncesDoneThisDash: 0,
      killsThisDash: 0,
      isApexDash: false,
      isDaredevilDash: false,
      shields: 3,
      maxShields: 3,
      invulnTimer: 0,
      scaleX: 1,
      scaleY: 1,
      scaleVx: 0,
      scaleVy: 0,
      stretchAngle: 0,
      orbitAngle: 0,
      currentDashWaypoints: [],
    };
  }

  public resetRun(seed = 20261108): void {
    this.rngState = seed >>> 0 || 20261108;
    this.score = 0;
    this.comboStreak = 1;
    this.bestStreak = 1;
    this.wave = 1;
    this.phase = 'playing';
    this.hitStopMs = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeVx = 0;
    this.shakeVy = 0;
    this.activeUpgrades.clear();
    this.offeredUpgrades = [];
    this.enemies = [];
    this.bumpers = [];
    this.shards = [];
    this.phantoms = [];
    this.trail = [];
    this.afterimages = [];
    this.sparks = [];
    this.shockRings = [];
    this.slashFlashes = [];
    this.callouts = [];
    this.player = this.createInitialPlayer();
    this.pointerX = this.width * 0.68;
    this.pointerY = this.height * 0.5;
    this.setupWave(1);
  }

  public resize(width: number, height: number): void {
    this.width = Math.max(480, width);
    this.height = Math.max(360, height);
    const minX = this.wallPadding + this.player.radius;
    const maxX = this.width - this.wallPadding - this.player.radius;
    const minY = this.wallPadding + this.player.radius;
    const maxY = this.height - this.wallPadding - this.player.radius;
    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));
    this.player.y = Math.max(minY, Math.min(maxY, this.player.y));
  }

  /**
   * Rule 3: Progressive Reveal — Wave 1 starts with ONLY the core mechanic and 1 enemy type (drifter).
   * Each subsequent 30-second wave introduces ONE new hazard or enemy archetype.
   */
  public setupWave(waveNum: number): void {
    this.wave = waveNum;
    this.waveTimeRemaining = WAVE_DURATION_SECONDS;
    this.elapsedWaveTime = 0;
    this.phase = 'playing';
    this.enemies = [];
    this.shards = [];
    this.phantoms = [];

    // Regenerate 1 lost shield petal between waves
    if (this.player.shields < this.player.maxShields) {
      this.player.shields += 1;
    }

    // Configure permanent arena bumpers starting in Wave 3 (Progressive Reveal)
    this.bumpers = [];
    if (waveNum >= 3) {
      this.bumpers.push(
        {
          x: this.width * 0.34,
          y: this.height * 0.5,
          radius: 26,
          squash: 1,
          isTemporary: false,
          life: 999,
        },
        {
          x: this.width * 0.66,
          y: this.height * 0.5,
          radius: 26,
          squash: 1,
          isTemporary: false,
          life: 999,
        }
      );
    }

    if (waveNum === 1) {
      // Spawn 1 immediate target directly in front of the player so they learn by doing in < 3 seconds
      this.enemies.push({
        id: this.nextEnemyId++,
        kind: 'drifter',
        x: Math.min(this.width - 110, this.player.x + 220),
        y: this.player.y,
        vx: 0,
        vy: 0,
        radius: 20,
        facingAngle: Math.PI,
        spawnTelegraph: 0.35,
        spawnMax: 0.35,
        attackTelegraph: 0,
        lungeTimer: 0,
        lungeDirX: -1,
        lungeDirY: 0,
        scaleX: 1,
        scaleY: 1,
        stretchAngle: 0,
        knockbackTimer: 0,
      });
      this.spawnCooldown = 1.1;
    } else {
      this.spawnTargetForWave();
      this.spawnCooldown = 0.8;
    }
  }

  private getAllowedEnemyKindsForWave(waveNum: number): EnemyKind[] {
    if (waveNum <= 1) return ['drifter'];
    if (waveNum === 2) return ['drifter', 'charger'];
    if (waveNum === 3) return ['drifter', 'charger']; // Wave 3 introduces Arena Resonance Bumpers
    if (waveNum === 4) return ['drifter', 'charger', 'shielded'];
    return ['drifter', 'charger', 'shielded', 'pulsar'];
  }

  private getMaxActiveEnemiesForWave(waveNum: number): number {
    // Rule 5: Never spawn so much chaos that I can't tell why I got hit
    return Math.min(10, 4 + waveNum);
  }

  public spawnTargetForWave(forcedKind?: EnemyKind, x?: number, y?: number): EnemyEntity {
    const allowed = this.getAllowedEnemyKindsForWave(this.wave);
    const kind =
      forcedKind ??
      (this.wave >= 2 && this.random() < 0.42
        ? allowed[allowed.length - 1]
        : allowed[Math.floor(this.random() * allowed.length)]);

    const margin = this.wallPadding + 48;
    let spawnX = x ?? this.randomRange(margin, this.width - margin);
    let spawnY = y ?? this.randomRange(margin, this.height - margin);

    if (x === undefined || y === undefined) {
      // Keep honest spacing away from the player core on spawn
      for (let attempt = 0; attempt < 10; attempt++) {
        const candX = this.randomRange(margin, this.width - margin);
        const candY = this.randomRange(margin, this.height - margin);
        const dist = Math.hypot(candX - this.player.x, candY - this.player.y);
        if (dist > 175) {
          spawnX = candX;
          spawnY = candY;
          break;
        }
      }
    }

    const radius = kind === 'shielded' ? 23 : kind === 'pulsar' ? 22 : kind === 'charger' ? 19 : 19;
    const enemy: EnemyEntity = {
      id: this.nextEnemyId++,
      kind,
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      radius,
      facingAngle: Math.atan2(this.player.y - spawnY, this.player.x - spawnX),
      spawnTelegraph: 0.9, // 0.9s honest shrinking ring telegraph before active
      spawnMax: 0.9,
      attackTelegraph: 0,
      lungeTimer: 0,
      lungeDirX: 0,
      lungeDirY: 0,
      scaleX: 0.4,
      scaleY: 0.4,
      stretchAngle: 0,
      knockbackTimer: 0,
    };
    this.enemies.push(enemy);
    return enemy;
  }

  /**
   * Begin holding charge (Mouse Down or Space Down)
   */
  public beginCharge(): void {
    if (this.phase !== 'playing') return;
    this.isHoldingCharge = true;
    if (this.player.state !== 'charging') {
      this.player.state = 'charging';
      this.player.chargeTime = 0;
      this.player.chargeTier = 1;
      this.synth.playChargeTierLock(1, this.comboStreak);
      // Braking squash kick
      this.applyPlayerSquash(0.76, 1.28, this.player.aimAngle);
    }
  }

  /**
   * Release charge to SNAP-LAUNCH the player core along aimAngle!
   */
  public releaseCharge(): void {
    if (!this.isHoldingCharge && this.player.state !== 'charging') return;
    this.isHoldingCharge = false;
    if (this.phase !== 'playing' || this.player.state !== 'charging') return;

    const p = this.player;
    const ratio = Math.min(1, p.chargeTime / p.maxChargeTime);
    const tier = p.chargeTier;

    // Push-Your-Luck: Did the player hold their nerve while an active enemy closed within 125px?
    let closeCall = false;
    for (const e of this.enemies) {
      if (e.spawnTelegraph <= 0) {
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist <= 130 + e.radius) {
          closeCall = true;
          break;
        }
      }
    }

    const launchSpeed = tier === 3 ? 1780 : tier === 2 ? 1360 : 980;
    const bounces = tier === 3 ? 5 : tier === 2 ? 3 : 1;

    p.state = 'dash';
    p.dashMaxTime = tier === 3 ? 0.56 : tier === 2 ? 0.44 : 0.32;
    p.dashTimeLeft = p.dashMaxTime;
    p.bouncesLeft = bounces;
    p.bouncesDoneThisDash = 0;
    p.killsThisDash = 0;
    p.isApexDash = tier === 3;
    p.isDaredevilDash = closeCall;

    const cos = Math.cos(p.aimAngle);
    const sin = Math.sin(p.aimAngle);
    p.vx = cos * launchSpeed;
    p.vy = sin * launchSpeed;

    // Extreme snap stretch along launch vector
    this.applyPlayerSquash(1.75, 0.54, p.aimAngle);

    // Directional recoil screen shake proportional to launch force
    const shakeForce = tier === 3 ? 11 : tier === 2 ? 7 : 4.5;
    this.triggerDirectionalShake(-cos, -sin, shakeForce);

    // Launch shock ring & sparks
    this.shockRings.push({
      x: p.x,
      y: p.y,
      radius: p.radius * 0.7,
      maxRadius: tier === 3 ? 92 : 60,
      alpha: 0.9,
      color: tier === 3 ? 'gold' : 'cyan',
      lineWidth: tier === 3 ? 4 : 2.5,
    });

    this.spawnBurstSparks(
      p.x - cos * 12,
      p.y - sin * 12,
      -cos,
      -sin,
      tier === 3 ? 16 : 9,
      tier === 3 ? 'gold' : 'cyan'
    );

    if (closeCall) {
      this.comboStreak += 2;
      this.bestStreak = Math.max(this.bestStreak, this.comboStreak);
      this.callouts.push({
        x: p.x,
        y: p.y - 28,
        vy: -45,
        text: 'DAREDEVIL +2X!',
        alpha: 1,
        scale: 1.25,
        color: 'gold',
      });
    }

    // Record start waypoint for Phantom Echo upgrade
    p.currentDashWaypoints = [{ x: p.x, y: p.y, angle: p.aimAngle }];

    // Upgrade: Pinball Decoy drops a temporary cyan bumper at launch point
    if (this.activeUpgrades.has('pinball_decoy')) {
      // Cap temporary bumpers to 2 so arena stays clean
      const tempCount = this.bumpers.filter((b) => b.isTemporary).length;
      if (tempCount >= 2) {
        const idx = this.bumpers.findIndex((b) => b.isTemporary);
        if (idx >= 0) this.bumpers.splice(idx, 1);
      }
      this.bumpers.push({
        x: p.x,
        y: p.y,
        radius: 22,
        squash: 1.35,
        isTemporary: true,
        life: 8.0,
      });
    }

    // Upgrade: Boomerang Orb fires a heavy curving cyan orb forward
    if (this.activeUpgrades.has('boomerang_orb')) {
      this.shards.push({
        x: p.x + cos * 22,
        y: p.y + sin * 22,
        vx: cos * 920,
        vy: sin * 920,
        radius: 13,
        bouncesLeft: 2,
        life: 1.6,
        isBoomerang: true,
        trail: [],
      });
    }

    p.chargeTime = 0;
    p.chargeTier = 0;
    this.synth.playLaunchSnap(ratio, this.comboStreak);
  }

  public applyPlayerSquash(scaleX: number, scaleY: number, angle: number): void {
    this.player.scaleX = scaleX;
    this.player.scaleY = scaleY;
    this.player.stretchAngle = angle;
  }

  /**
   * Rule 6: Directional screen shake proportional to force along impact vector (nx, ny)
   */
  public triggerDirectionalShake(nx: number, ny: number, force: number): void {
    this.shakeVx += nx * force * 65;
    this.shakeVy += ny * force * 65;
    this.shakeX += nx * force * 1.6;
    this.shakeY += ny * force * 1.6;
  }

  /**
   * Rule 6: 30-50ms hit-stop frames on heavy impacts
   */
  public triggerHitStop(durationMs = 42): void {
    const clamped = Math.max(30, Math.min(50, durationMs));
    this.hitStopMs = Math.max(this.hitStopMs, clamped);
  }

  /**
   * Computes the multi-bounce laser sightline while charging or aiming
   */
  public computeRaycastBouncePath(maxBounces = 1): RaycastSegment[] {
    const segments: RaycastSegment[] = [];
    const minX = this.wallPadding + this.player.radius;
    const maxX = this.width - this.wallPadding - this.player.radius;
    const minY = this.wallPadding + this.player.radius;
    const maxY = this.height - this.wallPadding - this.player.radius;

    let currX = this.player.x;
    let currY = this.player.y;
    let dirX = Math.cos(this.player.aimAngle);
    let dirY = Math.sin(this.player.aimAngle);

    const totalSegments = Math.max(1, maxBounces + 1);
    for (let i = 0; i < totalSegments; i++) {
      let tMin = 2000;
      let hitNx = 0;
      let hitNy = 0;

      if (dirX > 0.0001) {
        const tx = (maxX - currX) / dirX;
        if (tx < tMin) {
          tMin = tx;
          hitNx = -1;
          hitNy = 0;
        }
      } else if (dirX < -0.0001) {
        const tx = (minX - currX) / dirX;
        if (tx < tMin) {
          tMin = tx;
          hitNx = 1;
          hitNy = 0;
        }
      }

      if (dirY > 0.0001) {
        const ty = (maxY - currY) / dirY;
        if (ty < tMin) {
          tMin = ty;
          hitNx = 0;
          hitNy = -1;
        }
      } else if (dirY < -0.0001) {
        const ty = (minY - currY) / dirY;
        if (ty < tMin) {
          tMin = ty;
          hitNx = 0;
          hitNy = 1;
        }
      }

      const nextX = currX + dirX * tMin;
      const nextY = currY + dirY * tMin;
      segments.push({
        x1: currX,
        y1: currY,
        x2: nextX,
        y2: nextY,
        normalX: hitNx,
        normalY: hitNy,
      });

      currX = nextX;
      currY = nextY;
      if (hitNx !== 0) dirX = -dirX;
      if (hitNy !== 0) dirY = -dirY;
    }

    return segments;
  }

  /**
   * Main 60fps simulation step (`dt` in seconds)
   */
  public step(dt: number): void {
    const safeDt = Math.min(0.05, Math.max(0.001, dt));

    // Update camera spring shake & visual decays even during hit-stop
    this.updateCameraSpring(safeDt);
    this.updateVisualEffects(safeDt);

    if (this.phase !== 'playing') return;

    // Rule 6: Hit-Stop freezes entity simulation for 30-50ms on heavy impacts
    if (this.hitStopMs > 0) {
      this.hitStopMs = Math.max(0, this.hitStopMs - safeDt * 1000);
      return;
    }

    this.elapsedWaveTime += safeDt;
    this.waveTimeRemaining = Math.max(0, this.waveTimeRemaining - safeDt);

    if (this.waveTimeRemaining <= 0) {
      this.completeWaveAndOfferUpgrades();
      return;
    }

    this.updatePlayer(safeDt);
    this.updateShardsAndPhantoms(safeDt);
    this.updateBumpers(safeDt);
    this.updateEnemies(safeDt);
    this.handleEnemySpawning(safeDt);
  }

  private updateCameraSpring(dt: number): void {
    // Hooke's law damped spring for directional screen shake
    const stiffness = 290;
    const damping = 18;
    const ax = -stiffness * this.shakeX - damping * this.shakeVx;
    const ay = -stiffness * this.shakeY - damping * this.shakeVy;
    this.shakeVx += ax * dt;
    this.shakeVy += ay * dt;
    this.shakeX += this.shakeVx * dt;
    this.shakeY += this.shakeVy * dt;
    if (Math.abs(this.shakeX) < 0.05 && Math.abs(this.shakeVx) < 0.5) {
      this.shakeX = 0;
      this.shakeVx = 0;
    }
    if (Math.abs(this.shakeY) < 0.05 && Math.abs(this.shakeVy) < 0.5) {
      this.shakeY = 0;
      this.shakeVy = 0;
    }

    // Decay wall flex
    const flexDecay = Math.exp(-14 * dt);
    this.wallFlexLeft *= flexDecay;
    this.wallFlexRight *= flexDecay;
    this.wallFlexTop *= flexDecay;
    this.wallFlexBottom *= flexDecay;
  }

  private updateVisualEffects(dt: number): void {
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.prevX = s.x;
      s.prevY = s.y;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= Math.pow(0.08, dt);
      s.vy *= Math.pow(0.08, dt);

      // Bounce sparks off walls
      const minX = this.wallPadding;
      const maxX = this.width - this.wallPadding;
      const minY = this.wallPadding;
      const maxY = this.height - this.wallPadding;
      if (s.x < minX || s.x > maxX) s.vx = -s.vx * 0.7;
      if (s.y < minY || s.y > maxY) s.vy = -s.vy * 0.7;

      s.life -= dt;
      if (s.life <= 0) this.sparks.splice(i, 1);
    }

    for (let i = this.shockRings.length - 1; i >= 0; i--) {
      const r = this.shockRings[i];
      r.radius += (r.maxRadius - r.radius) * Math.min(1, dt * 14);
      r.alpha -= dt * 3.2;
      if (r.alpha <= 0) this.shockRings.splice(i, 1);
    }

    for (let i = this.slashFlashes.length - 1; i >= 0; i--) {
      const f = this.slashFlashes[i];
      f.alpha -= dt * 7.5;
      if (f.alpha <= 0) this.slashFlashes.splice(i, 1);
    }

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      const a = this.afterimages[i];
      a.alpha -= dt * 4.5;
      if (a.alpha <= 0) this.afterimages.splice(i, 1);
    }

    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i];
      c.y += c.vy * dt;
      c.vy *= Math.pow(0.15, dt);
      c.alpha -= dt * 1.35;
      if (c.alpha <= 0) this.callouts.splice(i, 1);
    }
  }

  private updatePlayer(dt: number): void {
    const p = this.player;
    if (p.invulnTimer > 0) {
      p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    }

    p.orbitAngle += dt * (p.state === 'dash' ? 14 : 5.5);

    // Update aim angle toward pointer or keyboard vector
    if (this.keyAimX !== 0 || this.keyAimY !== 0) {
      p.aimAngle = Math.atan2(this.keyAimY, this.keyAimX);
    } else {
      const dx = this.pointerX - p.x;
      const dy = this.pointerY - p.y;
      if (Math.hypot(dx, dy) > 4) {
        p.aimAngle = Math.atan2(dy, dx);
      }
    }

    if (p.state === 'charging') {
      // Anchor braking with high physical weight
      p.vx *= Math.pow(0.0015, dt);
      p.vy *= Math.pow(0.0015, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const prevTier = p.chargeTier;
      p.chargeTime = Math.min(p.maxChargeTime * 1.4, p.chargeTime + dt);
      const ratio = Math.min(1, p.chargeTime / p.maxChargeTime);

      if (ratio >= 0.78) {
        p.chargeTier = 3;
      } else if (ratio >= 0.36) {
        p.chargeTier = 2;
      } else {
        p.chargeTier = 1;
      }

      if (p.chargeTier > prevTier && (p.chargeTier === 2 || p.chargeTier === 3)) {
        this.synth.playChargeTierLock(p.chargeTier, this.comboStreak);
        this.shockRings.push({
          x: p.x,
          y: p.y,
          radius: p.radius * 2.2,
          maxRadius: p.radius * 0.9,
          alpha: 0.75,
          color: p.chargeTier === 3 ? 'gold' : 'cyan',
          lineWidth: 2.5,
        });
      }

      // Anticipation squash along aim vector
      const targetScaleX = 1 - ratio * 0.42; // compresses down to 0.58
      const targetScaleY = 1 + ratio * 0.38; // widens to 1.38
      p.scaleX += (targetScaleX - p.scaleX) * Math.min(1, dt * 18);
      p.scaleY += (targetScaleY - p.scaleY) * Math.min(1, dt * 18);
      p.stretchAngle = p.aimAngle;

      // Upgrade: Gravity Tether pulls nearby enemies toward the aim sightline!
      if (this.activeUpgrades.has('gravity_tether')) {
        const aimCos = Math.cos(p.aimAngle);
        const aimSin = Math.sin(p.aimAngle);
        for (const e of this.enemies) {
          if (e.spawnTelegraph > 0) continue;
          const relX = e.x - p.x;
          const relY = e.y - p.y;
          const proj = relX * aimCos + relY * aimSin;
          if (proj > 20 && proj < 420) {
            const closestX = p.x + aimCos * proj;
            const closestY = p.y + aimSin * proj;
            const perpDx = closestX - e.x;
            const perpDy = closestY - e.y;
            const perpDist = Math.hypot(perpDx, perpDy);
            if (perpDist > 4 && perpDist < 175) {
              e.x += (perpDx / perpDist) * 185 * dt;
              e.y += (perpDy / perpDist) * 185 * dt;
            }
          }
        }
      }
    } else if (p.state === 'dash') {
      p.dashTimeLeft -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 20) {
        p.stretchAngle = Math.atan2(p.vy, p.vx);
      }

      // Spring-recover squash/stretch toward elongated dash profile
      const targetScaleX = 1.52;
      const targetScaleY = 0.64;
      p.scaleX += (targetScaleX - p.scaleX) * Math.min(1, dt * 16);
      p.scaleY += (targetScaleY - p.scaleY) * Math.min(1, dt * 16);

      // Spawn afterimage ghost silhouettes during dash
      this.afterimages.push({
        x: p.x,
        y: p.y,
        angle: p.stretchAngle,
        scaleX: p.scaleX,
        scaleY: p.scaleY,
        alpha: p.isApexDash ? 0.55 : 0.38,
      });

      this.handlePlayerWallCollisions();

      if (p.dashTimeLeft <= 0) {
        // End of dash -> transition smoothly back to glide
        p.state = 'glide';
        p.vx *= 0.28;
        p.vy *= 0.28;
        p.currentDashWaypoints.push({ x: p.x, y: p.y, angle: p.stretchAngle });

        // Push-Your-Luck Streak check: if you dashed and hit 0 enemies, streak resets to 1x!
        if (p.killsThisDash === 0 && this.comboStreak > 1) {
          this.comboStreak = 1;
        }

        // Upgrade: Shockwave Anchor unleashes a cyan ring at dash end
        if (this.activeUpgrades.has('shockwave_anchor')) {
          this.detonateFriendlyNova(p.x, p.y, 135, 'cyan');
        }

        // Upgrade: Phantom Echo spawns a delayed cyan ghost tracing the dash path
        if (this.activeUpgrades.has('phantom_echo') && p.currentDashWaypoints.length >= 2) {
          const startWp = p.currentDashWaypoints[0];
          this.phantoms.push({
            waypoints: [...p.currentDashWaypoints],
            delayTimer: 0.22,
            segmentIndex: 0,
            segmentProgress: 0,
            x: startWp.x,
            y: startWp.y,
            angle: startWp.angle,
            radius: p.radius * 0.95,
            hitIds: new Set(),
          });
        }
      }
    } else {
      // 'glide' state: tactile weighty spring-drift toward pointer or keyboard input
      let desiredVx = 0;
      let desiredVy = 0;
      const maxGlideSpeed = 320;

      if (this.keyAimX !== 0 || this.keyAimY !== 0) {
        const mag = Math.hypot(this.keyAimX, this.keyAimY) || 1;
        desiredVx = (this.keyAimX / mag) * maxGlideSpeed;
        desiredVy = (this.keyAimY / mag) * maxGlideSpeed;
      } else if (this.pointerActive) {
        const dx = this.pointerX - p.x;
        const dy = this.pointerY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 28) {
          const factor = Math.min(1, (dist - 28) / 110);
          desiredVx = (dx / dist) * maxGlideSpeed * factor;
          desiredVy = (dy / dist) * maxGlideSpeed * factor;
        }
      }

      const accel = 11.5;
      p.vx += (desiredVx - p.vx) * Math.min(1, accel * dt);
      p.vy += (desiredVy - p.vy) * Math.min(1, accel * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 15) {
        p.stretchAngle = Math.atan2(p.vy, p.vx);
      } else {
        p.stretchAngle = p.aimAngle;
      }

      const stretchAmt = Math.min(0.22, (speed / maxGlideSpeed) * 0.18);
      const targetScaleX = 1 + stretchAmt;
      const targetScaleY = 1 - stretchAmt * 0.7;
      p.scaleX += (targetScaleX - p.scaleX) * Math.min(1, dt * 14);
      p.scaleY += (targetScaleY - p.scaleY) * Math.min(1, dt * 14);

      this.handlePlayerWallCollisions();
    }

    // Upgrade: Orbiting Sawblade checks hits on nearby enemies
    if (this.activeUpgrades.has('sawblade_orbit')) {
      const orbitDist = p.state === 'dash' ? 66 : 46;
      const bladeX = p.x + Math.cos(p.orbitAngle) * orbitDist;
      const bladeY = p.y + Math.sin(p.orbitAngle) * orbitDist;
      const bladeRadius = 12;
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (e.spawnTelegraph > 0) continue;
        if (Math.hypot(e.x - bladeX, e.y - bladeY) <= e.radius + bladeRadius) {
          this.killEnemy(i, bladeX, bladeY, Math.cos(p.orbitAngle), Math.sin(p.orbitAngle), false);
        }
      }
    }

    // Record ribbon trail point
    this.trail.push({
      x: p.x,
      y: p.y,
      radius: p.radius * (p.state === 'dash' ? 0.95 : 0.65),
      alpha: 1,
      isDash: p.state === 'dash',
    });
    if (this.trail.length > 20) {
      this.trail.shift();
    }
    for (const pt of this.trail) {
      pt.alpha *= Math.pow(0.05, dt);
    }
  }

  private handlePlayerWallCollisions(): void {
    const p = this.player;
    const minX = this.wallPadding + p.radius;
    const maxX = this.width - this.wallPadding - p.radius;
    const minY = this.wallPadding + p.radius;
    const maxY = this.height - this.wallPadding - p.radius;

    let bouncedX = false;
    let bouncedY = false;
    let hitNx = 0;
    let hitNy = 0;

    if (p.x < minX) {
      p.x = minX;
      bouncedX = true;
      hitNx = 1;
      this.wallFlexLeft = 1;
    } else if (p.x > maxX) {
      p.x = maxX;
      bouncedX = true;
      hitNx = -1;
      this.wallFlexRight = 1;
    }

    if (p.y < minY) {
      p.y = minY;
      bouncedY = true;
      hitNy = 1;
      this.wallFlexTop = 1;
    } else if (p.y > maxY) {
      p.y = maxY;
      bouncedY = true;
      hitNy = -1;
      this.wallFlexBottom = 1;
    }

    if (!bouncedX && !bouncedY) return;

    if (p.state === 'dash') {
      if (p.bouncesLeft > 0) {
        p.bouncesLeft -= 1;
        p.bouncesDoneThisDash += 1;
        // Extend dash time slightly on each ricochet so multi-wall trickshots carry across the arena
        p.dashTimeLeft = Math.min(p.dashMaxTime, p.dashTimeLeft + 0.14);

        if (bouncedX) p.vx = -p.vx;
        if (bouncedY) p.vy = -p.vy;

        p.aimAngle = Math.atan2(p.vy, p.vx);
        p.currentDashWaypoints.push({ x: p.x, y: p.y, angle: p.aimAngle });

        // Rule 6: Squash-and-stretch pancake along wall normal on bounce!
        const normalAngle = Math.atan2(hitNy, hitNx);
        this.applyPlayerSquash(0.48, 1.55, normalAngle);
        this.triggerDirectionalShake(-hitNx, -hitNy, 7.5);
        this.synth.playBounce(this.comboStreak, p.bouncesDoneThisDash);

        this.shockRings.push({
          x: p.x,
          y: p.y,
          radius: 8,
          maxRadius: 58,
          alpha: 0.85,
          color: p.isApexDash ? 'gold' : 'cyan',
          lineWidth: 3,
        });
        this.spawnBurstSparks(p.x, p.y, hitNx, hitNy, 11, p.isApexDash ? 'gold' : 'cyan');

        // Upgrade: Split Prism fires 2 angled cyan laser shards on every wall bounce
        if (this.activeUpgrades.has('split_prism')) {
          const baseAngle = Math.atan2(p.vy, p.vx);
          for (const offset of [-0.35, 0.35]) {
            const a = baseAngle + offset;
            this.shards.push({
              x: p.x,
              y: p.y,
              vx: Math.cos(a) * 1050,
              vy: Math.sin(a) * 1050,
              radius: 8,
              bouncesLeft: 1,
              life: 0.9,
              isBoomerang: false,
              trail: [],
            });
          }
        }

        // Upgrade: Wall Nova detonates a cyan blast at every wall bounce point
        if (this.activeUpgrades.has('corner_nova')) {
          this.detonateFriendlyNova(p.x, p.y, 125, 'cyan');
        }
      } else {
        // Out of bounces -> end dash with a soft wall thud
        if (bouncedX) p.vx = -p.vx * 0.25;
        if (bouncedY) p.vy = -p.vy * 0.25;
        p.dashTimeLeft = 0;
      }
    } else {
      if (bouncedX) p.vx = -p.vx * 0.5;
      if (bouncedY) p.vy = -p.vy * 0.5;
    }
  }

  private updateBumpers(dt: number): void {
    const p = this.player;
    for (let i = this.bumpers.length - 1; i >= 0; i--) {
      const b = this.bumpers[i];
      b.squash += (1 - b.squash) * Math.min(1, dt * 14);
      if (b.isTemporary) {
        b.life -= dt;
        if (b.life <= 0) {
          this.bumpers.splice(i, 1);
          continue;
        }
      }

      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = p.radius + b.radius;

      if (dist < minDist && dist > 0.001) {
        const nx = dx / dist;
        const ny = dy / dist;
        p.x = b.x + nx * minDist;
        p.y = b.y + ny * minDist;
        b.squash = 1.42;

        if (p.state === 'dash') {
          const speed = Math.min(2050, Math.hypot(p.vx, p.vy) * 1.18);
          p.vx = nx * speed;
          p.vy = ny * speed;
          p.aimAngle = Math.atan2(p.vy, p.vx);
          p.bouncesLeft += 1;
          p.bouncesDoneThisDash += 1;
          p.dashTimeLeft = Math.min(p.dashMaxTime, p.dashTimeLeft + 0.18);
          p.currentDashWaypoints.push({ x: p.x, y: p.y, angle: p.aimAngle });

          this.applyPlayerSquash(0.46, 1.56, Math.atan2(ny, nx));
          this.triggerDirectionalShake(nx, ny, 8.5);
          this.synth.playBounce(this.comboStreak, p.bouncesDoneThisDash + 1);
          this.detonateFriendlyNova(b.x, b.y, 110, 'cyan');
        } else {
          p.vx = nx * 360;
          p.vy = ny * 360;
        }
      }
    }
  }

  private updateShardsAndPhantoms(dt: number): void {
    // Update friendly ricochet shards & boomerang orbs
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.shards.splice(i, 1);
        continue;
      }

      if (s.isBoomerang && s.life < 1.15) {
        const toPx = this.player.x - s.x;
        const toPy = this.player.y - s.y;
        const d = Math.hypot(toPx, toPy) || 1;
        s.vx += (toPx / d) * 2400 * dt;
        s.vy += (toPy / d) * 2400 * dt;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.trail.push({ x: s.x, y: s.y });
      if (s.trail.length > 8) s.trail.shift();

      const minX = this.wallPadding + s.radius;
      const maxX = this.width - this.wallPadding - s.radius;
      const minY = this.wallPadding + s.radius;
      const maxY = this.height - this.wallPadding - s.radius;

      if (s.x < minX || s.x > maxX) {
        if (s.bouncesLeft > 0) {
          s.bouncesLeft -= 1;
          s.vx = -s.vx;
          s.x = Math.max(minX, Math.min(maxX, s.x));
        } else {
          this.shards.splice(i, 1);
          continue;
        }
      }
      if (s.y < minY || s.y > maxY) {
        if (s.bouncesLeft > 0) {
          s.bouncesLeft -= 1;
          s.vy = -s.vy;
          s.y = Math.max(minY, Math.min(maxY, s.y));
        } else {
          this.shards.splice(i, 1);
          continue;
        }
      }

      // Check shard collision against enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.spawnTelegraph > 0) continue;
        if (Math.hypot(e.x - s.x, e.y - s.y) <= e.radius + s.radius) {
          const speed = Math.hypot(s.vx, s.vy) || 1;
          this.killEnemy(j, s.x, s.y, s.vx / speed, s.vy / speed, false);
          if (!s.isBoomerang) {
            this.shards.splice(i, 1);
            break;
          }
        }
      }
    }

    // Update Phantom Echoes
    for (let i = this.phantoms.length - 1; i >= 0; i--) {
      const ph = this.phantoms[i];
      if (ph.delayTimer > 0) {
        ph.delayTimer -= dt;
        continue;
      }

      const wps = ph.waypoints;
      if (ph.segmentIndex >= wps.length - 1) {
        this.phantoms.splice(i, 1);
        continue;
      }

      const a = wps[ph.segmentIndex];
      const b = wps[ph.segmentIndex + 1];
      const segLen = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
      const ghostSpeed = 1450;
      ph.segmentProgress += (ghostSpeed * dt) / segLen;

      if (ph.segmentProgress >= 1) {
        ph.segmentIndex += 1;
        ph.segmentProgress = 0;
        ph.x = b.x;
        ph.y = b.y;
      } else {
        ph.x = a.x + (b.x - a.x) * ph.segmentProgress;
        ph.y = a.y + (b.y - a.y) * ph.segmentProgress;
        ph.angle = Math.atan2(b.y - a.y, b.x - a.x);
      }

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (e.spawnTelegraph > 0 || ph.hitIds.has(e.id)) continue;
        if (Math.hypot(e.x - ph.x, e.y - ph.y) <= e.radius + ph.radius) {
          ph.hitIds.add(e.id);
          this.killEnemy(j, ph.x, ph.y, Math.cos(ph.angle), Math.sin(ph.angle), false);
        }
      }
    }
  }

  private updateEnemies(dt: number): void {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Spring-recover enemy squash/stretch
      e.scaleX += (1 - e.scaleX) * Math.min(1, dt * 12);
      e.scaleY += (1 - e.scaleY) * Math.min(1, dt * 12);

      // Spawn telegraph countdown (Rule 5: Honest telegraphed spawns)
      if (e.spawnTelegraph > 0) {
        e.spawnTelegraph = Math.max(0, e.spawnTelegraph - dt);
        const progress = 1 - e.spawnTelegraph / e.spawnMax;
        e.scaleX = 0.35 + progress * 0.65;
        e.scaleY = 0.35 + progress * 0.65;
        continue;
      }

      const toPx = p.x - e.x;
      const toPy = p.y - e.y;
      const distToPlayer = Math.hypot(toPx, toPy) || 1;
      const dirX = toPx / distToPlayer;
      const dirY = toPy / distToPlayer;

      if (e.knockbackTimer > 0) {
        e.knockbackTimer = Math.max(0, e.knockbackTimer - dt);
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= Math.pow(0.08, dt);
        e.vy *= Math.pow(0.08, dt);
      } else if (e.kind === 'drifter') {
        const speed = 105 + Math.min(60, this.wave * 8);
        e.vx = dirX * speed;
        e.vy = dirY * speed;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.facingAngle = Math.atan2(dirY, dirX);
      } else if (e.kind === 'charger') {
        if (e.lungeTimer > 0) {
          e.lungeTimer -= dt;
          e.x += e.lungeDirX * 540 * dt;
          e.y += e.lungeDirY * 540 * dt;
          e.scaleX = 1.38;
          e.scaleY = 0.72;
          e.stretchAngle = e.facingAngle;
        } else if (e.attackTelegraph > 0) {
          e.attackTelegraph -= dt;
          // Slight coil squash before lunging
          e.scaleX = 0.72;
          e.scaleY = 1.28;
          e.stretchAngle = e.facingAngle;
          if (e.attackTelegraph <= 0) {
            e.lungeTimer = 0.36;
          }
        } else if (distToPlayer < 290) {
          // Lock onto current line and telegraph for 0.8s before lunging
          e.attackTelegraph = 0.8;
          e.lungeDirX = dirX;
          e.lungeDirY = dirY;
          e.facingAngle = Math.atan2(dirY, dirX);
        } else {
          const speed = 135;
          e.x += dirX * speed * dt;
          e.y += dirY * speed * dt;
          e.facingAngle = Math.atan2(dirY, dirX);
        }
      } else if (e.kind === 'shielded') {
        // Slowly rotates its frontal shield toward the player
        const targetAngle = Math.atan2(dirY, dirX);
        let diff = targetAngle - e.facingAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        e.facingAngle += Math.sign(diff) * Math.min(Math.abs(diff), 1.9 * dt);
        const speed = 82;
        e.x += dirX * speed * dt;
        e.y += dirY * speed * dt;
      } else if (e.kind === 'pulsar') {
        if (e.attackTelegraph > 0) {
          e.attackTelegraph += dt;
          if (e.attackTelegraph >= 1.45) {
            // Detonates crimson ring if player is inside blast radius (115px)
            e.attackTelegraph = 0;
            this.shockRings.push({
              x: e.x,
              y: e.y,
              radius: e.radius,
              maxRadius: 115,
              alpha: 0.95,
              color: 'crimson',
              lineWidth: 4,
            });
            if (distToPlayer <= 115 + p.radius && p.state !== 'dash') {
              this.damagePlayer(e.x, e.y);
            }
          }
        } else if (distToPlayer < 210) {
          e.attackTelegraph = 0.01;
        } else {
          e.x += dirX * 92 * dt;
          e.y += dirY * 92 * dt;
        }
      }

      // Keep enemy inside arena walls
      const minX = this.wallPadding + e.radius;
      const maxX = this.width - this.wallPadding - e.radius;
      const minY = this.wallPadding + e.radius;
      const maxY = this.height - this.wallPadding - e.radius;
      e.x = Math.max(minX, Math.min(maxX, e.x));
      e.y = Math.max(minY, Math.min(maxY, e.y));

      // Check collision with Player Core
      // Generous attack hitbox when player is dashing; honest hurtbox when gliding/charging
      const hitAllowance = p.state === 'dash' ? 8 : -3;
      if (distToPlayer <= p.radius + e.radius + hitAllowance) {
        if (p.state === 'dash') {
          // Check if enemy is a frontal-shielded guard blocking a non-Apex frontal dash
          if (e.kind === 'shielded' && !p.isApexDash) {
            const impactAngle = Math.atan2(p.y - e.y, p.x - e.x);
            let angleDiff = Math.abs(impactAngle - e.facingAngle);
            while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
            if (angleDiff < 1.05) {
              // Deflected safely off the front shield! Bounce player back so they can bank-shot behind!
              p.vx = -p.vx * 0.85;
              p.vy = -p.vy * 0.85;
              p.x = e.x + Math.cos(impactAngle) * (p.radius + e.radius + 6);
              p.y = e.y + Math.sin(impactAngle) * (p.radius + e.radius + 6);
              p.bouncesLeft += 1;
              p.dashTimeLeft = Math.min(p.dashMaxTime, p.dashTimeLeft + 0.15);
              e.knockbackTimer = 0.18;
              e.vx = -Math.cos(impactAngle) * 220;
              e.vy = -Math.sin(impactAngle) * 220;
              this.applyPlayerSquash(0.5, 1.48, impactAngle);
              this.triggerDirectionalShake(Math.cos(impactAngle), Math.sin(impactAngle), 6.5);
              this.synth.playBounce(this.comboStreak, p.bouncesDoneThisDash);
              this.callouts.push({
                x: e.x,
                y: e.y - 26,
                vy: -40,
                text: 'SHIELD! FLANK OR OVERCHARGE',
                alpha: 1,
                scale: 0.95,
                color: 'cyan',
              });
              continue;
            }
          }

          const speed = Math.hypot(p.vx, p.vy) || 1;
          this.killEnemy(i, e.x, e.y, p.vx / speed, p.vy / speed, true);
        } else if (p.invulnTimer <= 0) {
          this.damagePlayer(e.x, e.y);
        }
      }
    }
  }

  public killEnemy(
    enemyIndex: number,
    impactX: number,
    impactY: number,
    dirX: number,
    dirY: number,
    fromPlayerDash: boolean
  ): void {
    const e = this.enemies[enemyIndex];
    if (!e) return;
    this.enemies.splice(enemyIndex, 1);

    const p = this.player;
    if (fromPlayerDash) {
      p.killsThisDash += 1;
      // Extend dash duration slightly on kill so chains feel effortless
      p.dashTimeLeft = Math.min(p.dashMaxTime, p.dashTimeLeft + 0.09);
    }

    this.comboStreak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.comboStreak);

    // Push-Your-Luck Multiplier: Base 100 * Combo Streak * (1 + Bounces Done) * (Apex 2x)
    const bounceMult = 1 + p.bouncesDoneThisDash;
    const apexMult = p.isApexDash ? 2 : 1;
    const pointsEarned = 100 * this.comboStreak * bounceMult * apexMult;
    this.score += pointsEarned;

    // Rule 6: 30-50ms hit-stop frames on heavy impacts
    const hitStopDuration = p.isApexDash || p.bouncesDoneThisDash > 0 ? 46 : 36;
    this.triggerHitStop(hitStopDuration);

    // Rule 6: Directional screen shake proportional to force
    const force = p.isApexDash ? 11.5 : 8.0;
    this.triggerDirectionalShake(dirX, dirY, force);

    // Squash & stretch bounce pulse
    this.applyPlayerSquash(1.65, 0.58, Math.atan2(dirY, dirX));

    // Rule 6: Procedural WebAudio synth pitching up harmonically with combo streak
    this.synth.playComboKill(this.comboStreak, p.bouncesDoneThisDash, p.isApexDash);

    // Visual slash flash & shock ring
    this.slashFlashes.push({
      x1: impactX - dirX * 48,
      y1: impactY - dirY * 48,
      x2: impactX + dirX * 48,
      y2: impactY + dirY * 48,
      alpha: 1,
      color: p.isApexDash ? 'gold' : 'cyan',
    });

    this.shockRings.push({
      x: impactX,
      y: impactY,
      radius: 10,
      maxRadius: p.isApexDash ? 95 : 68,
      alpha: 0.95,
      color: p.isApexDash ? 'gold' : 'cyan',
      lineWidth: 3.5,
    });

    this.spawnBurstSparks(
      impactX,
      impactY,
      dirX,
      dirY,
      14,
      p.isApexDash ? 'gold' : 'cyan'
    );

    const label =
      p.bouncesDoneThisDash > 0
        ? `BANK SHOT x${this.comboStreak}!`
        : this.comboStreak >= 3
          ? `${this.comboStreak}x STREAK!`
          : `+${pointsEarned}`;

    this.callouts.push({
      x: impactX,
      y: impactY - 18,
      vy: -52,
      text: label,
      alpha: 1,
      scale: p.isApexDash ? 1.25 : 1.0,
      color: p.isApexDash ? 'gold' : 'cyan',
    });

    // If a charging Pulsar is skewered, it detonates into a friendly Cyan Nova!
    if (e.kind === 'pulsar' && e.attackTelegraph > 0) {
      this.detonateFriendlyNova(impactX, impactY, 130, 'cyan');
    }

    // Upgrade: Arc Conduit chains cyan lightning to the nearest active enemy
    if (this.activeUpgrades.has('lightning_chain') && fromPlayerDash) {
      let nearestIdx = -1;
      let nearestDist = 230;
      for (let j = 0; j < this.enemies.length; j++) {
        const other = this.enemies[j];
        if (other.spawnTelegraph > 0) continue;
        const d = Math.hypot(other.x - impactX, other.y - impactY);
        if (d < nearestDist) {
          nearestDist = d;
          nearestIdx = j;
        }
      }
      if (nearestIdx >= 0) {
        const target = this.enemies[nearestIdx];
        this.slashFlashes.push({
          x1: impactX,
          y1: impactY,
          x2: target.x,
          y2: target.y,
          alpha: 1,
          color: 'cyan',
        });
        const ldx = target.x - impactX;
        const ldy = target.y - impactY;
        const lmag = Math.hypot(ldx, ldy) || 1;
        this.killEnemy(nearestIdx, target.x, target.y, ldx / lmag, ldy / lmag, false);
      }
    }
  }

  private detonateFriendlyNova(
    x: number,
    y: number,
    radius: number,
    color: 'cyan' | 'gold'
  ): void {
    this.shockRings.push({
      x,
      y,
      radius: 12,
      maxRadius: radius,
      alpha: 0.9,
      color,
      lineWidth: 4,
    });
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (e.spawnTelegraph > 0) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const d = Math.hypot(dx, dy) || 1;
      if (d <= radius + e.radius) {
        this.killEnemy(i, e.x, e.y, dx / d, dy / d, false);
      }
    }
  }

  public damagePlayer(sourceX: number, sourceY: number): void {
    const p = this.player;
    if (p.invulnTimer > 0) return;

    p.shields -= 1;
    p.invulnTimer = 1.35;
    p.state = 'glide';
    this.isHoldingCharge = false;
    p.chargeTime = 0;
    p.chargeTier = 0;
    this.comboStreak = 1;

    const dx = p.x - sourceX;
    const dy = p.y - sourceY;
    const dist = Math.hypot(dx, dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    p.vx = nx * 460;
    p.vy = ny * 460;

    this.triggerHitStop(48);
    this.triggerDirectionalShake(nx, ny, 12);
    this.applyPlayerSquash(0.52, 1.48, Math.atan2(ny, nx));
    this.synth.playDamageHit();

    // Clear a defensive knockback zone around the player so they always understand what hit them
    this.shockRings.push({
      x: p.x,
      y: p.y,
      radius: p.radius,
      maxRadius: 170,
      alpha: 1,
      color: 'crimson',
      lineWidth: 4,
    });
    this.spawnBurstSparks(p.x, p.y, nx, ny, 16, 'crimson');

    for (const e of this.enemies) {
      const edx = e.x - p.x;
      const edy = e.y - p.y;
      const ed = Math.hypot(edx, edy) || 1;
      if (ed < 190) {
        e.knockbackTimer = 0.45;
        e.vx = (edx / ed) * 480;
        e.vy = (edy / ed) * 480;
      }
    }

    if (p.shields <= 0) {
      this.phase = 'gameover';
    }
  }

  private handleEnemySpawning(dt: number): void {
    this.spawnCooldown -= dt;
    const maxActive = this.getMaxActiveEnemiesForWave(this.wave);

    if (this.enemies.length === 0 && this.spawnCooldown > 0.25) {
      this.spawnCooldown = 0.2;
    }

    if (this.spawnCooldown <= 0 && this.enemies.length < maxActive) {
      this.spawnTargetForWave();
      const baseInterval = Math.max(0.75, 1.75 - this.wave * 0.14);
      this.spawnCooldown = baseInterval;
    }
  }

  private completeWaveAndOfferUpgrades(): void {
    this.phase = 'upgrade_draft';
    this.isHoldingCharge = false;
    this.player.state = 'glide';
    this.player.chargeTime = 0;
    this.player.chargeTier = 0;
    this.enemies = [];
    this.synth.playUpgradeChime();

    // Pick 3 distinct upgrades (prioritizing ones not yet taken)
    const unowned = UPGRADE_CATALOG.filter((u) => !this.activeUpgrades.has(u.id));
    const pool = unowned.length >= 3 ? [...unowned] : [...UPGRADE_CATALOG];

    // Deterministic Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    this.offeredUpgrades = pool.slice(0, 3);
  }

  /**
   * Rule 7: Pick 1 of 3 dead-simple, game-changing upgrades between waves
   */
  public selectUpgrade(indexOrId: number | UpgradeId): boolean {
    if (this.phase !== 'upgrade_draft') return false;
    const chosen =
      typeof indexOrId === 'number'
        ? this.offeredUpgrades[indexOrId]
        : this.offeredUpgrades.find((u) => u.id === indexOrId) ??
          UPGRADE_CATALOG.find((u) => u.id === indexOrId);

    if (!chosen) return false;
    this.activeUpgrades.add(chosen.id);
    this.synth.playUpgradeChime();
    this.setupWave(this.wave + 1);
    return true;
  }

  private spawnBurstSparks(
    x: number,
    y: number,
    dirX: number,
    dirY: number,
    count: number,
    color: Spark['color']
  ): void {
    const baseAngle = Math.atan2(dirY, dirX);
    for (let i = 0; i < count; i++) {
      const spread = (this.random() - 0.5) * 1.45;
      const angle = baseAngle + spread;
      const speed = this.randomRange(180, 620);
      const life = this.randomRange(0.18, 0.42);
      this.sparks.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        thickness: this.randomRange(1.8, 3.2),
      });
    }
  }
}
