import {
  Vec2,
  SeededRandom,
  angleBetween,
  circlesOverlap,
  clamp,
  dist,
  distSq,
  fromAngle,
  lerpAngle,
  pointToSegmentDistSq,
} from './math';
import { SpatialHashGrid } from './spatial-hash';
import { ReactiveGrid } from './reactive-grid';
import { Camera } from './camera';
import { SoundEngine } from './sound-engine';
import { MECH_SPECS, MechId, MechSpec, evaluateActiveVent } from './mechs';
import {
  AUGMENTS,
  AugmentSpec,
  ComputedAugmentStats,
  SynergyEvolution,
  computeAugmentStats,
} from './augments';
import {
  ENEMY_SPECS,
  EnemyEntity,
  EnemyType,
  createEnemy,
  isBlockedByPhalanxShield,
  renderEnemy,
  updateEnemyAI,
} from './enemies';
import { BossEntity, BossId, createBoss, renderBoss, updateBoss } from './bosses';
import { ACHIEVEMENTS, SaveProfile, saveProfile } from './persistence';

export type StyleRank = 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'VOIDBREAKER';
export type NucleotideBase = 'A' | 'T' | 'G' | 'C';

export interface Projectile {
  id: number;
  pos: Vec2;
  vel: Vec2;
  radius: number;
  damage: number;
  color: string;
  fromPlayer: boolean;
  pierce: number;
  bounces: number;
  isCrit: boolean;
  isParried?: boolean;
  homing?: boolean;
  helixPhase?: number;
  helixSign?: number;
  ttl: number;
  hitIds: Set<number>;
}

export interface SubAgentDrone {
  id: number;
  role: 'STRIKER' | 'AEGIS' | 'DOCK' | 'RECON';
  callsign: string;
  color: string;
  orbitAngle: number;
  orbitRadius: number;
  pos: Vec2;
  fireCooldown: number;
  parryCooldown: number;
}

export interface AfterimageGhost {
  pos: Vec2;
  angle: number;
  color: string;
  alpha: number;
}

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  color: string;
  size: number;
  alpha: number;
  decay: number;
  isRing?: boolean;
  maxRadius?: number;
}

export interface FloatingText {
  pos: Vec2;
  vel: Vec2;
  text: string;
  color: string;
  scale: number;
  alpha: number;
}

export interface PickupShard {
  id: number;
  pos: Vec2;
  vel: Vec2;
  xp: number;
  voidCore: number;
  heal: number;
  nucleotide?: NucleotideBase;
  radius: number;
}

export interface LightningArc {
  points: Vec2[];
  color: string;
  alpha: number;
}

export interface SingularityWell {
  pos: Vec2;
  radius: number;
  duration: number;
  damagePerSec: number;
  color: string;
  isChronoDome?: boolean;
  isIthacaSeal?: boolean;
}

export interface KatanaSlashVisual {
  pos: Vec2;
  angle: number;
  radius: number;
  alpha: number;
  color: string;
  fullCircle?: boolean;
}

export interface GameCallbacks {
  onLevelUpDraft: (choices: AugmentSpec[], unlockedSynergy?: SynergyEvolution) => void;
  onGameOver: (victory: boolean) => void;
  onToast: (title: string, subtitle: string, accentColor?: string) => void;
}

const BASES: readonly NucleotideBase[] = ['A', 'T', 'G', 'C'];

export class GameWorld {
  readonly arenaWidth = 2400;
  readonly arenaHeight = 2400;

  grid: ReactiveGrid;
  camera: Camera;
  sound: SoundEngine;
  rng: SeededRandom;
  spatialEnemies: SpatialHashGrid<EnemyEntity>;
  profile: SaveProfile;
  callbacks: GameCallbacks;

  private nextEntityId = 1;

  // Run state
  running = false;
  paused = false;
  gameOver = false;
  victory = false;
  endlessMode = false;
  autoAim = false;
  autoFire = false;

  mech: MechSpec;
  augmentRanks: Record<string, number> = {};
  stats: ComputedAugmentStats;
  seenSynergies = new Set<string>();

  // Player state
  playerPos: Vec2 = { x: 1200, y: 1200 };
  playerVel: Vec2 = { x: 0, y: 0 };
  playerAngle = 0;
  playerRadius = 18;
  hp = 130;
  maxHp = 130;
  shield = 75;
  maxShield = 75;
  shieldRegenDelay = 0;
  invulnTimer = 0;
  temporalRewindUsed = false;

  // Weapons, Heat & Cooldowns
  heat = 0;
  overheatedLockout = 0;
  overchargeTimer = 0;
  fireCooldown = 0;
  shotCounter = 0;
  dashCooldown = 0;
  dashActiveTimer = 0;
  dashDir: Vec2 = { x: 1, y: 0 };
  altCooldown = 0;
  ultimateCharge = 100;
  ultimateActiveTimer = 0;
  orbitalAngle = 0;

  // Witch-Time (Bullet-Time) & Sandevistan Afterimages
  witchTimeTimer = 0;
  witchTimesTriggered = 0;
  parriesCount = 0;
  afterimages: AfterimageGhost[] = [];
  afterimageSpawnTimer = 0;

  // AlphaGenome A-T-G-C Codon Splicer & Antigravity Sub-Agents
  codonBuffer: NucleotideBase[] = [];
  splicesCompleted = 0;
  lastCodonTriggered = 'READY';
  subAgents: SubAgentDrone[] = [];

  // Progression & Wave Director
  wave = 1;
  waveTimer = 0;
  waveDuration = 26;
  spawnTimer = 0;
  level = 1;
  xp = 0;
  xpToNext = 80;
  pendingLevelUps = 0;
  score = 0;
  kills = 0;
  coresCollectedThisRun = 0;
  combo = 0;
  maxCombo = 0;
  comboTimer = 0;
  stylePoints = 0;

  // Entities
  enemies: EnemyEntity[] = [];
  boss: BossEntity | null = null;
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  floatingTexts: FloatingText[] = [];
  shards: PickupShard[] = [];
  lightningArcs: LightningArc[] = [];
  singularities: SingularityWell[] = [];
  katanaSlashes: KatanaSlashVisual[] = [];

  constructor(
    profile: SaveProfile,
    sound: SoundEngine,
    callbacks: GameCallbacks,
    seed?: string | number
  ) {
    this.profile = profile;
    this.sound = sound;
    this.callbacks = callbacks;
    this.rng = new SeededRandom(seed ?? Date.now());
    this.grid = new ReactiveGrid(this.arenaWidth, this.arenaHeight, 60);
    this.camera = new Camera();
    this.spatialEnemies = new SpatialHashGrid<EnemyEntity>(110);
    this.mech = MECH_SPECS[profile.selectedMech] ?? MECH_SPECS.xenofold;
    this.stats = computeAugmentStats(this.augmentRanks, this.profile.armoryRanks);
    this.resetRun(profile.selectedMech);
  }

  resetRun(mechId: MechId, seed?: string | number): void {
    this.profile.selectedMech = mechId;
    this.mech = MECH_SPECS[mechId] ?? MECH_SPECS.xenofold;
    this.rng = new SeededRandom(seed ?? Date.now());
    this.augmentRanks = {};
    this.seenSynergies.clear();
    this.stats = computeAugmentStats(this.augmentRanks, this.profile.armoryRanks);

    this.playerPos = { x: this.arenaWidth * 0.5, y: this.arenaHeight * 0.5 };
    this.playerVel = { x: 0, y: 0 };
    this.camera.pos = { ...this.playerPos };

    this.maxHp = this.mech.maxHp + this.stats.bonusMaxHp;
    this.hp = this.maxHp;
    this.maxShield = this.mech.maxShield + this.stats.bonusMaxShield;
    this.shield = this.maxShield;
    this.shieldRegenDelay = 0;
    this.invulnTimer = 0;
    this.temporalRewindUsed = false;

    this.heat = 0;
    this.overheatedLockout = 0;
    this.overchargeTimer = 0;
    this.fireCooldown = 0;
    this.shotCounter = 0;
    this.dashCooldown = 0;
    this.dashActiveTimer = 0;
    this.altCooldown = 0;
    this.ultimateCharge = 100;
    this.ultimateActiveTimer = 0;
    this.witchTimeTimer = 0;
    this.witchTimesTriggered = 0;
    this.parriesCount = 0;
    this.afterimages = [];

    this.codonBuffer = [];
    this.splicesCompleted = 0;
    this.lastCodonTriggered = 'AWAITING BASES';
    this.subAgents = [];

    // AGY-00 ANTIGRAVITY starts with 2 autonomous Sub-Agent Wingmen out of the gate!
    if (this.mech.id === 'antigravity') {
      this.syncSubAgentRoster(2);
    }

    this.wave = 1;
    this.waveTimer = 0;
    this.spawnTimer = 0.2;
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 75;
    this.pendingLevelUps = 0;
    this.score = 0;
    this.kills = 0;
    this.coresCollectedThisRun = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.comboTimer = 0;
    this.stylePoints = 0;

    this.enemies = [];
    this.boss = null;
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.shards = [];
    this.lightningArcs = [];
    this.singularities = [];
    this.katanaSlashes = [];

    this.running = true;
    this.paused = false;
    this.gameOver = false;
    this.victory = false;

    this.spawnInitialWavePack();
  }

  private spawnInitialWavePack(): void {
    for (let i = 0; i < 6; i++) {
      this.spawnEnemyAroundPlayer('swarmer');
    }
  }

  private syncSubAgentRoster(desiredCount: number): void {
    const specs: Array<{ role: SubAgentDrone['role']; callsign: string; color: string }> = [
      { role: 'STRIKER', callsign: '[AGY:STRIKER]', color: '#00f2fe' },
      { role: 'AEGIS', callsign: '[AGY:AEGIS]', color: '#facc15' },
      { role: 'DOCK', callsign: '[AGY:DOCK]', color: '#10b981' },
      { role: 'RECON', callsign: '[AGY:RECON]', color: '#b721ff' },
    ];
    while (this.subAgents.length < Math.min(6, desiredCount)) {
      const idx = this.subAgents.length;
      const spec = specs[idx % specs.length];
      this.subAgents.push({
        id: this.nextEntityId++,
        role: spec.role,
        callsign: spec.callsign,
        color: spec.color,
        orbitAngle: (idx * Math.PI * 2) / Math.max(1, desiredCount),
        orbitRadius: 95 + (idx % 2) * 22,
        pos: { ...this.playerPos },
        fireCooldown: 0.25 * idx,
        parryCooldown: 0,
      });
    }
  }

  getStyleRank(): StyleRank {
    if (this.stylePoints >= 850) return 'VOIDBREAKER';
    if (this.stylePoints >= 650) return 'SS';
    if (this.stylePoints >= 480) return 'S';
    if (this.stylePoints >= 320) return 'A';
    if (this.stylePoints >= 180) return 'B';
    if (this.stylePoints >= 75) return 'C';
    return 'D';
  }

  getStyleDamageBonus(): number {
    const rank = this.getStyleRank();
    const map: Record<StyleRank, number> = {
      D: 1.0,
      C: 1.05,
      B: 1.12,
      A: 1.2,
      S: 1.3,
      SS: 1.42,
      VOIDBREAKER: 1.6,
    };
    return map[rank];
  }

  applyAugment(augmentId: string): SynergyEvolution | undefined {
    const prevHpMax = this.maxHp;
    const prevShieldMax = this.maxShield;

    if (augmentId !== '__refresh__') {
      this.augmentRanks[augmentId] = (this.augmentRanks[augmentId] || 0) + 1;
    }
    this.stats = computeAugmentStats(this.augmentRanks, this.profile.armoryRanks);

    this.maxHp = this.mech.maxHp + this.stats.bonusMaxHp;
    this.hp = Math.min(this.maxHp, this.hp + Math.max(0, this.maxHp - prevHpMax));
    this.maxShield = this.mech.maxShield + this.stats.bonusMaxShield;
    this.shield = Math.min(
      this.maxShield,
      this.shield + Math.max(0, this.maxShield - prevShieldMax)
    );

    const baseAgents = this.mech.id === 'antigravity' ? 2 : 0;
    const totalAgents = baseAgents + this.stats.subagentStacks * 2;
    if (totalAgents > 0) {
      this.syncSubAgentRoster(totalAgents);
    }

    for (const syn of this.stats.unlockedSynergies) {
      if (!this.seenSynergies.has(syn.id)) {
        this.seenSynergies.add(syn.id);
        this.unlockAchievement('synergy_architect');
        this.callbacks.onToast(
          `SYNERGY EVOLUTION: ${syn.name}`,
          syn.description,
          syn.bannerColor
        );
        return syn;
      }
    }
    return undefined;
  }

  rollAugmentChoices(count = 3): AugmentSpec[] {
    const available = AUGMENTS.filter(
      (a) => (this.augmentRanks[a.id] || 0) < a.maxStacks
    );
    if (available.length <= count) return [...available];
    return this.rng.shuffle(available).slice(0, count);
  }

  /**
   * Appends a nucleotide base ('A' | 'T' | 'G' | 'C') to the AlphaGenome Codon Splicer.
   * Completing a 3-base codon triggers a live Variant Impact Burst!
   */
  spliceNucleotide(base: NucleotideBase): void {
    this.codonBuffer.push(base);
    if (this.codonBuffer.length < 3) return;

    const codon = this.codonBuffer.join('');
    this.codonBuffer = [];
    this.splicesCompleted++;
    this.lastCodonTriggered = codon;
    this.sound.playCodonSplice();
    this.addStylePoints(85);

    const boost = 1 + this.stats.codonSplicerStacks * 0.45;

    if (codon === 'ATG' || codon.startsWith('A')) {
      // Start Codon Overclock: Instant Heat Vent + Overcharge!
      this.heat = 0;
      this.overchargeTimer = Math.max(this.overchargeTimer, 3.8);
      this.spawnFloatingText(
        this.playerPos,
        `CODON [${codon}] // START CODON OVERCHARGE!`,
        '#10b981',
        1.4
      );
      this.grid.applyImpulse(this.playerPos, 320, 480, 155);
    } else if (codon.startsWith('C')) {
      // Kinetic Repeat Expansion: Launch 8 Homing Helical Missiles!
      this.spawnFloatingText(
        this.playerPos,
        `CODON [${codon}] // REPEAT EXPANSION SALVO!`,
        '#00f2fe',
        1.4
      );
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI * 2) / 8;
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: { ...this.playerPos },
          vel: fromAngle(a, 680),
          radius: 7,
          damage: 52 * this.stats.damageMultiplier * boost,
          color: '#00f2fe',
          fromPlayer: true,
          pierce: 1,
          bounces: 1,
          isCrit: true,
          homing: true,
          ttl: 2.6,
          hitIds: new Set(),
        });
      }
    } else if (codon.startsWith('G')) {
      // CpG Enhancer Island Burst: Shield Restore + EMP Nova!
      this.shield = Math.min(this.maxShield, this.shield + 35 * boost);
      this.triggerEmpNova();
      this.spawnFloatingText(
        this.playerPos,
        `CODON [${codon}] // CpG ENHANCER NOVA!`,
        '#b721ff',
        1.4
      );
    } else {
      // Termination Splice: Ultimate Charge + Heal!
      this.ultimateCharge = Math.min(100, this.ultimateCharge + 24);
      this.hp = Math.min(this.maxHp, this.hp + 18);
      this.spawnFloatingText(
        this.playerPos,
        `CODON [${codon}] // SPLICE OVERCLOCK (+24% ULT)!`,
        '#facc15',
        1.4
      );
    }

    if (this.splicesCompleted >= 3) {
      this.unlockAchievement('codon_splicer_master');
    }
  }

  triggerActiveVent(): void {
    if (this.overheatedLockout > 0 || this.heat < 25) return;
    const ratio = this.heat / 100;
    const res = evaluateActiveVent(ratio, ratio);

    this.heat = 0;
    if (res.outcome === 'perfect') {
      this.overchargeTimer = res.overchargeDuration;
      this.spawnFloatingText(this.playerPos, 'PERFECT VENT // OVERCHARGE!', '#00f2fe', 1.35);
      this.grid.applyImpulse(this.playerPos, 240, 320, 190);
      this.sound.playParry();
    } else if (res.outcome === 'good') {
      this.overchargeTimer = res.overchargeDuration;
      this.spawnFloatingText(this.playerPos, 'ACTIVE VENT!', '#38bdf8', 1.1);
    } else if (res.outcome === 'jammed') {
      this.overheatedLockout = res.lockoutDuration;
      this.spawnFloatingText(this.playerPos, 'VENT MISFIRE!', '#ff0844', 1.15);
    }
  }

  triggerDash(moveInput: Vec2): void {
    if (this.dashCooldown > 0 || this.paused || this.gameOver) return;

    const dir =
      Math.hypot(moveInput.x, moveInput.y) > 0.1
        ? { x: moveInput.x, y: moveInput.y }
        : fromAngle(this.playerAngle, 1);
    const len = Math.hypot(dir.x, dir.y) || 1;
    this.dashDir = { x: dir.x / len, y: dir.y / len };

    this.dashCooldown = this.mech.dashCooldown * this.stats.dashCooldownMultiplier;
    this.dashActiveTimer = 0.18;
    this.invulnTimer = Math.max(this.invulnTimer, 0.28);

    this.grid.applyImpulse(this.playerPos, 220, 380, 195);
    this.spawnRing(this.playerPos, 95, this.mech.accentColor);

    // Check if dashing close to any enemy bullet -> trigger PERFECT-DASH WITCH-TIME!
    let grazedBullet = false;
    for (const p of this.projectiles) {
      if (!p.fromPlayer && dist(this.playerPos, p.pos) <= 95) {
        grazedBullet = true;
        break;
      }
    }

    if (grazedBullet) {
      this.witchTimeTimer = 2.6 + this.stats.witchTimeBonusSeconds;
      this.witchTimesTriggered++;
      this.ultimateCharge = Math.min(100, this.ultimateCharge + 18);
      this.addStylePoints(95);
      this.sound.playWitchTime();
      this.spawnFloatingText(
        this.playerPos,
        'TACHYON WITCH-TIME!',
        '#00f2fe',
        1.45
      );
      if (this.witchTimesTriggered >= 5) {
        this.unlockAchievement('witch_time_ace');
      }
    }

    if (this.stats.phaseEchoStacks > 0) {
      this.singularities.push({
        pos: { ...this.playerPos },
        radius: 130 + this.stats.phaseEchoStacks * 25,
        duration: 1.5,
        damagePerSec: 65 * this.stats.phaseEchoStacks,
        color: '#00f2fe',
      });
    }

    if (this.seenSynergies.has('phantom_assassin_protocol')) {
      this.executeKatanaSlash(true);
    }

    if (this.stats.hitStickStacks > 0) {
      this.executeHitStickSlam(0.65);
    }
  }

  triggerAltFire(aimWorldPos: Vec2): void {
    if (this.altCooldown > 0 || this.paused || this.gameOver) return;
    this.altCooldown = this.mech.altCooldown * this.stats.altCooldownMultiplier;

    if (this.mech.id === 'valkyrie') {
      this.executeKatanaSlash(false);
    } else if (this.mech.id === 'hellforge') {
      this.sound.playShot('mortar');
      const target = {
        x: clamp(aimWorldPos.x, 120, this.arenaWidth - 120),
        y: clamp(aimWorldPos.y, 120, this.arenaHeight - 120),
      };
      this.singularities.push({
        pos: target,
        radius: 210 * this.stats.altRadiusMultiplier,
        duration: 3.2,
        damagePerSec: 95 * this.stats.damageMultiplier,
        color: '#ff6a00',
      });
      this.grid.applyImplosion(target, 340, 620, 28);
      this.camera.addTrauma(0.32, 4);
    } else if (this.mech.id === 'xenofold') {
      // PROTAC Covalent Warhead Dock & Ubiquitin Degrader
      this.sound.playShot('helix');
      const radius = 240 * this.stats.altRadiusMultiplier;
      const center = {
        x: clamp(aimWorldPos.x, 100, this.arenaWidth - 100),
        y: clamp(aimWorldPos.y, 100, this.arenaHeight - 100),
      };
      this.spawnRing(center, radius, '#10b981');
      this.grid.applyImplosion(center, radius * 1.2, 520, 155);

      const targets = this.spatialEnemies.queryRadius(center, radius);
      for (const e of targets) {
        e.protacTimer = 6.0;
        this.damageEnemy(e, 75 * this.stats.damageMultiplier, true, center);
      }
      if (this.boss && dist(center, this.boss.pos) <= radius + this.boss.radius) {
        this.damageBoss(135 * this.stats.damageMultiplier, true, center);
        this.spawnFloatingText(
          this.boss.pos,
          'PROTAC CYS12 WARHEAD DOCKED!',
          '#10b981',
          1.35
        );
      }
      this.spliceNucleotide(this.rng.pick(BASES));
    } else if (this.mech.id === 'antigravity') {
      // Invoke & Overclock Autonomous Sub-Agent Wingmen + Deflect Bullets!
      this.sound.playShot('subagent');
      this.syncSubAgentRoster(Math.max(4, this.subAgents.length + 1));
      this.spawnFloatingText(
        this.playerPos,
        `SUB-AGENTS OVERCLOCKED [${this.subAgents.length} ACTIVE]!`,
        '#38bdf8',
        1.3
      );
      this.executeKatanaSlash(true);
    } else if (this.mech.id === 'gridiron') {
      // Madden-05 99-POW HIT-STICK SLAM!
      this.executeHitStickSlam(1.0);
    } else {
      // Chronos Stasis Matrix Dome
      this.sound.playShot('chrono');
      this.singularities.push({
        pos: { ...this.playerPos },
        radius: 250 * this.stats.altRadiusMultiplier,
        duration: 4.0,
        damagePerSec: 55 * this.stats.damageMultiplier,
        color: '#b721ff',
        isChronoDome: true,
      });
      this.grid.applyImpulse(this.playerPos, 320, 420, 275);
    }
  }

  private executeHitStickSlam(powerScale = 1): void {
    this.sound.playShot('hitstick');
    const slamRadius = 185 * this.stats.altRadiusMultiplier;
    this.spawnRing(this.playerPos, slamRadius, '#f59e0b');
    this.grid.applyImpulse(this.playerPos, slamRadius * 1.6, 650 * powerScale, 38);
    this.camera.addTrauma(0.48 * powerScale, 8);

    const hit = this.spatialEnemies.queryRadius(this.playerPos, slamRadius);
    for (const enemy of hit) {
      const a = angleBetween(this.playerPos, enemy.pos);
      const launchVel = fromAngle(a, 920 * powerScale);
      enemy.knockbackVel.x = launchVel.x;
      enemy.knockbackVel.y = launchVel.y;
      enemy.bowlingTimer = 0.85;
      this.damageEnemy(
        enemy,
        85 * powerScale * this.stats.damageMultiplier * this.getStyleDamageBonus(),
        true,
        this.playerPos
      );
    }

    if (hit.length > 0) {
      this.spawnFloatingText(
        this.playerPos,
        `99-POW HIT-STICK! x${hit.length}`,
        '#f59e0b',
        1.45
      );
      this.addStylePoints(hit.length * 35);
    }

    // Also parry nearby bullets!
    this.executeKatanaSlash(true);
  }

  private executeKatanaSlash(fullCircle: boolean): void {
    this.sound.playShot('katana');
    const slashRadius = 155 * this.stats.altRadiusMultiplier;
    const arcHalf = fullCircle ? Math.PI : Math.PI * 0.48;

    this.katanaSlashes.push({
      pos: { ...this.playerPos },
      angle: this.playerAngle,
      radius: slashRadius,
      alpha: 1,
      color: this.mech.accentColor,
      fullCircle,
    });

    this.grid.applyImpulse(this.playerPos, slashRadius * 1.4, 380, 190);

    const nearby = this.spatialEnemies.queryRadius(this.playerPos, slashRadius);
    for (const enemy of nearby) {
      const a = angleBetween(this.playerPos, enemy.pos);
      let diff = ((a - this.playerAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
      if (diff < -Math.PI) diff += Math.PI * 2;
      if (fullCircle || Math.abs(diff) <= arcHalf) {
        this.damageEnemy(
          enemy,
          68 * this.stats.damageMultiplier * this.getStyleDamageBonus(),
          true,
          this.playerPos
        );
      }
    }

    if (this.boss && dist(this.playerPos, this.boss.pos) <= slashRadius + this.boss.radius) {
      this.damageBoss(95 * this.stats.damageMultiplier, true);
    }

    let deflected = 0;
    for (const p of this.projectiles) {
      if (p.fromPlayer) continue;
      if (dist(this.playerPos, p.pos) <= slashRadius) {
        const a = angleBetween(this.playerPos, p.pos);
        let diff = ((a - this.playerAngle + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (fullCircle || Math.abs(diff) <= arcHalf) {
          p.fromPlayer = true;
          p.isParried = true;
          p.isCrit = true;
          p.damage *= 3.5 * this.stats.damageMultiplier;
          p.color = '#00f2fe';
          p.radius = 8;
          const returnVec = fromAngle(this.playerAngle + (Math.random() - 0.5) * 0.12, 1150);
          p.vel.x = returnVec.x;
          p.vel.y = returnVec.y;
          p.ttl = 2.0;
          deflected++;
        }
      }
    }

    if (deflected > 0) {
      this.parriesCount += deflected;
      this.sound.playParry();
      this.camera.triggerHitStop(0.045);
      this.camera.addTrauma(0.35, 6);
      this.ultimateCharge = Math.min(100, this.ultimateCharge + deflected * 7);
      this.addStylePoints(deflected * 45);
      this.spawnFloatingText(
        this.playerPos,
        `PARRY x${deflected}!`,
        '#00f2fe',
        1.35
      );
      if (this.parriesCount >= 15) {
        this.unlockAchievement('parry_master');
      }
    }
  }

  triggerUltimate(): void {
    if (this.ultimateCharge < 100 || this.paused || this.gameOver) return;
    this.ultimateCharge = 0;
    this.ultimateActiveTimer = 5.0;
    this.invulnTimer = Math.max(this.invulnTimer, 2.5);
    this.camera.addTrauma(0.65, 12);
    this.camera.targetZoom = 0.92;
    this.sound.playExplosion(1.6);
    this.addStylePoints(160);

    if (this.mech.id === 'valkyrie') {
      this.spawnFloatingText(this.playerPos, 'OMEGA BLADESTORM!', '#00f2fe', 1.6);
      this.dashCooldown = 0;
      for (let i = 0; i < 24; i++) {
        const a = (i * Math.PI * 2) / 24;
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: { ...this.playerPos },
          vel: fromAngle(a, 780),
          radius: 9,
          damage: 65 * this.stats.damageMultiplier,
          color: '#00f2fe',
          fromPlayer: true,
          pierce: 4,
          bounces: 2,
          isCrit: true,
          homing: true,
          ttl: 2.8,
          hitIds: new Set(),
        });
      }
    } else if (this.mech.id === 'hellforge') {
      this.spawnFloatingText(this.playerPos, 'ORBITAL ION CATACLYSM!', '#ff6a00', 1.6);
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        const strikePos = {
          x: clamp(this.playerPos.x + Math.cos(a) * 230, 150, this.arenaWidth - 150),
          y: clamp(this.playerPos.y + Math.sin(a) * 230, 150, this.arenaHeight - 150),
        };
        this.singularities.push({
          pos: strikePos,
          radius: 220,
          duration: 3.5,
          damagePerSec: 160 * this.stats.damageMultiplier,
          color: '#ff6a00',
        });
        this.grid.applyImpulse(strikePos, 400, 680, 32);
      }
    } else if (this.mech.id === 'xenofold') {
      // CRISPR-Cas9 GENOME OVERWRITE: Transmute all enemy bullets into homing A-T-G-C Crit Shards!
      this.spawnFloatingText(this.playerPos, 'CRISPR-Cas9 GENOME OVERWRITE!', '#10b981', 1.65);
      this.overchargeTimer = 6.0;
      this.grid.applyImpulse(this.playerPos, 650, 950, 155);
      for (const p of this.projectiles) {
        if (!p.fromPlayer) {
          p.fromPlayer = true;
          p.homing = true;
          p.isCrit = true;
          p.color = '#10b981';
          p.damage = 75 * this.stats.damageMultiplier;
          p.ttl = 3.0;
        }
      }
      this.spliceNucleotide('A');
      this.spliceNucleotide('T');
      this.spliceNucleotide('G');
    } else if (this.mech.id === 'antigravity') {
      // ITHACA EPIGRAPHIC RESTORATION (ΑΩ)
      this.spawnFloatingText(
        this.playerPos,
        'ΑΩ // ITHACA EPIGRAPHIC RESTORATION!',
        '#facc15',
        1.65
      );
      this.hp = Math.min(this.maxHp, this.hp + Math.round(this.maxHp * 0.5));
      this.shield = this.maxShield;
      this.witchTimeTimer = 4.5;
      this.syncSubAgentRoster(4);
      this.singularities.push({
        pos: { ...this.playerPos },
        radius: 340,
        duration: 4.5,
        damagePerSec: 120 * this.stats.damageMultiplier,
        color: '#facc15',
        isIthacaSeal: true,
      });
    } else if (this.mech.id === 'gridiron') {
      // 2-MINUTE DRILL: ALL-OUT ZERO BLITZ
      this.spawnFloatingText(
        this.playerPos,
        '2-MINUTE DRILL // ALL-OUT ZERO BLITZ!',
        '#f59e0b',
        1.65
      );
      this.overchargeTimer = 5.5;
      this.executeHitStickSlam(1.5);
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI * 2) / 16;
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: { ...this.playerPos },
          vel: fromAngle(a, 860),
          radius: 9,
          damage: 78 * this.stats.damageMultiplier,
          color: '#f59e0b',
          fromPlayer: true,
          pierce: 3,
          bounces: 3,
          isCrit: true,
          ttl: 2.6,
          hitIds: new Set(),
        });
      }
    } else {
      this.spawnFloatingText(this.playerPos, 'SINGULARITY OVERCLOCK!', '#b721ff', 1.6);
      this.witchTimeTimer = 6.0;
      this.sound.playWitchTime();
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        if (!this.projectiles[i].fromPlayer && dist(this.playerPos, this.projectiles[i].pos) < 550) {
          this.spawnParticles(this.projectiles[i].pos, '#b721ff', 4);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  update(
    rawDt: number,
    moveInput: Vec2,
    aimWorldPos: Vec2,
    firingPrimary: boolean,
    viewW: number,
    viewH: number
  ): void {
    if (!this.running || this.paused || this.gameOver) return;

    const dt = Math.min(0.05, rawDt);
    const hitStopScale = this.camera.update(
      dt,
      this.playerPos,
      aimWorldPos,
      this.arenaWidth,
      this.arenaHeight,
      viewW,
      viewH
    );

    const isWitchTime = this.witchTimeTimer > 0;
    const worldTimeScale = (isWitchTime ? 0.28 : 1.0) * hitStopScale;
    const playerTimeScale = (isWitchTime ? 1.15 : 1.0) * hitStopScale;

    if (this.witchTimeTimer > 0) {
      this.witchTimeTimer = Math.max(0, this.witchTimeTimer - dt);
    }
    if (this.ultimateActiveTimer > 0) {
      this.ultimateActiveTimer = Math.max(0, this.ultimateActiveTimer - dt);
    }

    const combatIntensity = clamp(
      0.22 + (this.stylePoints / 1000) * 0.55 + (this.boss ? 0.35 : 0),
      0.2,
      1
    );
    this.sound.updateMusic(dt, combatIntensity, isWitchTime);

    this.grid.update(dt * (isWitchTime ? 0.55 : 1));

    let targetAim = aimWorldPos;
    if (this.autoAim) {
      const nearest = this.findNearestTarget(this.playerPos, 780);
      if (nearest) targetAim = nearest;
    }
    this.playerAngle = lerpAngle(
      this.playerAngle,
      angleBetween(this.playerPos, targetAim),
      dt * 24
    );

    if (this.dashCooldown > 0) this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    if (this.altCooldown > 0) this.altCooldown = Math.max(0, this.altCooldown - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.overchargeTimer > 0) this.overchargeTimer = Math.max(0, this.overchargeTimer - dt);

    if (this.dashActiveTimer > 0) {
      this.dashActiveTimer -= dt;
      const dashSpeed = this.mech.dashDistance / 0.18;
      this.playerVel.x = this.dashDir.x * dashSpeed;
      this.playerVel.y = this.dashDir.y * dashSpeed;
      this.spawnParticles(this.playerPos, this.mech.accentColor, 2);
    } else {
      const moveLen = Math.hypot(moveInput.x, moveInput.y);
      const normX = moveLen > 1 ? moveInput.x / moveLen : moveInput.x;
      const normY = moveLen > 1 ? moveInput.y / moveLen : moveInput.y;
      const topSpeed = this.mech.moveSpeed * this.stats.moveSpeedMultiplier;
      this.playerVel.x = normX * topSpeed;
      this.playerVel.y = normY * topSpeed;
    }

    this.playerPos.x = clamp(
      this.playerPos.x + this.playerVel.x * dt * playerTimeScale,
      40,
      this.arenaWidth - 40
    );
    this.playerPos.y = clamp(
      this.playerPos.y + this.playerVel.y * dt * playerTimeScale,
      40,
      this.arenaHeight - 40
    );

    // Sandevistan Afterimage Ghost Trail during Dash or Witch-Time
    if (this.dashActiveTimer > 0 || isWitchTime) {
      this.afterimageSpawnTimer -= dt;
      if (this.afterimageSpawnTimer <= 0) {
        this.afterimageSpawnTimer = 0.035;
        this.afterimages.push({
          pos: { ...this.playerPos },
          angle: this.playerAngle,
          color: isWitchTime ? '#00f2fe' : this.mech.accentColor,
          alpha: 0.65,
        });
      }
    }
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= dt * 2.4;
      if (this.afterimages[i].alpha <= 0) this.afterimages.splice(i, 1);
    }

    if (this.stats.ionTrailStacks > 0 && Math.hypot(this.playerVel.x, this.playerVel.y) > 80) {
      if (Math.random() < 0.35) {
        this.singularities.push({
          pos: { ...this.playerPos },
          radius: 42,
          duration: 0.65,
          damagePerSec: 38 * this.stats.ionTrailStacks,
          color: '#00f2fe',
        });
      }
    }

    if (this.shieldRegenDelay > 0) {
      this.shieldRegenDelay -= dt;
    } else if (this.shield < this.maxShield) {
      const prev = this.shield;
      this.shield = Math.min(this.maxShield, this.shield + dt * 16);
      if (prev < this.maxShield && this.shield >= this.maxShield && this.stats.empNovaStacks > 0) {
        this.triggerEmpNova();
      }
    }

    const wantFire = firingPrimary || this.autoFire;
    if (this.overheatedLockout > 0) {
      this.overheatedLockout = Math.max(0, this.overheatedLockout - dt);
      this.heat = Math.max(0, this.heat - dt * 55);
    } else if (!wantFire) {
      this.heat = Math.max(0, this.heat - dt * 34);
    }

    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt * playerTimeScale;
    }

    if (wantFire && this.overheatedLockout <= 0 && this.fireCooldown <= 0) {
      this.firePrimaryWeapon();
    }

    this.spatialEnemies.clear();
    for (const enemy of this.enemies) {
      this.spatialEnemies.insert(enemy);
    }

    // Update Orbital Glaives
    this.orbitalAngle += dt * 4.8;
    const bladeCount = this.stats.orbitalBladesCount;
    if (bladeCount > 0) {
      const orbitR = this.seenSynergies.has('event_horizon_saw') ? 115 : 86;
      for (let i = 0; i < bladeCount; i++) {
        const a = this.orbitalAngle + (i * Math.PI * 2) / bladeCount;
        const bx = this.playerPos.x + Math.cos(a) * orbitR;
        const by = this.playerPos.y + Math.sin(a) * orbitR;
        const bPos = { x: bx, y: by };

        const hitEnemies = this.spatialEnemies.queryRadius(bPos, 22);
        for (const e of hitEnemies) {
          this.damageEnemy(e, 95 * dt * this.stats.damageMultiplier, false, bPos);
        }
      }
    }

    // Update Autonomous Antigravity Sub-Agent Wingmen
    this.updateSubAgents(dt * playerTimeScale);

    // Update Singularities & Chrono Domes
    for (let i = this.singularities.length - 1; i >= 0; i--) {
      const well = this.singularities[i];
      well.duration -= dt;
      if (well.duration <= 0) {
        this.singularities.splice(i, 1);
        continue;
      }

      const affected = this.spatialEnemies.queryRadius(well.pos, well.radius);
      for (const e of affected) {
        if (well.isChronoDome) {
          e.chillTimer = Math.max(e.chillTimer, 0.5);
        } else {
          const pullAngle = angleBetween(e.pos, well.pos);
          const pullVec = fromAngle(pullAngle, 195 * dt);
          e.pos.x += pullVec.x;
          e.pos.y += pullVec.y;
        }
        this.damageEnemy(e, well.damagePerSec * dt, false, well.pos);
      }

      if (this.boss && dist(well.pos, this.boss.pos) <= well.radius + this.boss.radius) {
        this.damageBoss(well.damagePerSec * dt * 0.8, false);
      }
    }

    this.updateProjectiles(dt, worldTimeScale, playerTimeScale);
    this.updateEnemies(dt * worldTimeScale);

    // Update Active Boss
    if (this.boss) {
      const bossRes = updateBoss(
        this.boss,
        dt * worldTimeScale,
        this.playerPos,
        this.arenaWidth,
        this.arenaHeight
      );
      for (const b of bossRes.bullets) {
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: b.pos,
          vel: b.vel,
          radius: b.radius,
          damage: b.damage,
          color: b.color,
          fromPlayer: false,
          pierce: 0,
          bounces: 0,
          isCrit: false,
          ttl: 4.5,
          hitIds: new Set(),
        });
      }
      if (bossRes.phaseChanged) {
        this.sound.playBossWarning();
        this.camera.addTrauma(0.65, 10);
        this.grid.applyImpulse(this.boss.pos, 520, 750, 340);
        this.spawnFloatingText(
          this.boss.pos,
          `PHASE ${this.boss.phase} OVERDRIVE!`,
          '#ff0844',
          1.55
        );
      }
      if (bossRes.gravityPulse) {
        this.grid.applyImplosion(
          bossRes.gravityPulse.pos,
          bossRes.gravityPulse.radius,
          bossRes.gravityPulse.force,
          285
        );
      }

      for (const beam of this.boss.activeBeams) {
        if (beam.warmup <= 0) {
          const endPos = {
            x: beam.origin.x + Math.cos(beam.angle) * beam.length,
            y: beam.origin.y + Math.sin(beam.angle) * beam.length,
          };
          const segCheck = pointToSegmentDistSq(this.playerPos, beam.origin, endPos);
          if (segCheck.distSq <= Math.pow(this.playerRadius + beam.width * 0.5, 2)) {
            this.damagePlayer(28 * dt * 4);
          }
        }
      }
    }

    // Update Pickup Shards & Nucleotide Bases
    const pickupRadius = 115 + this.stats.pickupRadiusBonus;
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      const d = dist(this.playerPos, s.pos);
      if (d <= pickupRadius) {
        const pullA = angleBetween(s.pos, this.playerPos);
        const pullSpeed = 540 + (pickupRadius - d) * 2.5;
        s.pos.x += Math.cos(pullA) * pullSpeed * dt;
        s.pos.y += Math.sin(pullA) * pullSpeed * dt;
      } else {
        s.pos.x += s.vel.x * dt;
        s.pos.y += s.vel.y * dt;
        s.vel.x *= Math.pow(0.05, dt);
        s.vel.y *= Math.pow(0.05, dt);
      }

      if (d <= this.playerRadius + s.radius + 8) {
        if (s.xp > 0) {
          this.gainXp(Math.round(s.xp * this.stats.xpMultiplier));
        }
        if (s.voidCore > 0) {
          this.coresCollectedThisRun += s.voidCore;
          this.profile.voidCores += s.voidCore;
          this.spawnFloatingText(this.playerPos, `+${s.voidCore} VOID CORE`, '#b721ff', 1.15);
        }
        if (s.heal > 0) {
          this.hp = Math.min(this.maxHp, this.hp + s.heal);
          this.spawnFloatingText(this.playerPos, `+${s.heal} HULL`, '#10b981', 1.1);
        }
        if (s.nucleotide) {
          this.spliceNucleotide(s.nucleotide);
        }
        this.shards.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;
      p.vel.x *= Math.pow(0.12, dt);
      p.vel.y *= Math.pow(0.12, dt);
      p.alpha -= p.decay * dt;
      if (p.isRing && p.maxRadius) {
        p.size += (p.maxRadius - p.size) * dt * 8;
      }
      if (p.alpha <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      this.lightningArcs[i].alpha -= dt * 4.5;
      if (this.lightningArcs[i].alpha <= 0) this.lightningArcs.splice(i, 1);
    }

    for (let i = this.katanaSlashes.length - 1; i >= 0; i--) {
      this.katanaSlashes[i].alpha -= dt * 5.2;
      if (this.katanaSlashes[i].alpha <= 0) this.katanaSlashes.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.pos.x += ft.vel.x * dt;
      ft.pos.y += ft.vel.y * dt;
      ft.alpha -= dt * 1.15;
      if (ft.alpha <= 0) this.floatingTexts.splice(i, 1);
    }

    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
      }
    }
    this.stylePoints = Math.max(0, this.stylePoints - dt * 22);

    this.updateWaveDirector(dt * worldTimeScale);
  }

  private updateSubAgents(dt: number): void {
    for (let i = 0; i < this.subAgents.length; i++) {
      const ag = this.subAgents[i];
      ag.orbitAngle += dt * (2.4 + (i % 2) * 0.6);
      ag.pos.x = this.playerPos.x + Math.cos(ag.orbitAngle) * ag.orbitRadius;
      ag.pos.y = this.playerPos.y + Math.sin(ag.orbitAngle) * ag.orbitRadius;

      ag.fireCooldown -= dt;
      if (ag.fireCooldown <= 0) {
        const target = this.findNearestTarget(ag.pos, 560);
        if (target) {
          ag.fireCooldown = this.ultimateActiveTimer > 0 ? 0.18 : 0.48;
          const a = angleBetween(ag.pos, target);
          this.projectiles.push({
            id: this.nextEntityId++,
            pos: { ...ag.pos },
            vel: fromAngle(a, 1080),
            radius: 5,
            damage: 19 * this.stats.damageMultiplier,
            color: ag.color,
            fromPlayer: true,
            pierce: 1,
            bounces: 0,
            isCrit: ag.role === 'DOCK',
            ttl: 1.4,
            hitIds: new Set(),
          });
        }
      }

      // AEGIS Sub-Agent autonomously intercepts incoming enemy projectiles!
      ag.parryCooldown = Math.max(0, ag.parryCooldown - dt);
      if (ag.parryCooldown <= 0) {
        for (const p of this.projectiles) {
          if (!p.fromPlayer && dist(ag.pos, p.pos) <= 46) {
            p.fromPlayer = true;
            p.isParried = true;
            p.color = ag.color;
            p.vel.x = -p.vel.x * 1.6;
            p.vel.y = -p.vel.y * 1.6;
            ag.parryCooldown = 0.85;
            this.parriesCount++;
            break;
          }
        }
      }
    }
  }

  private firePrimaryWeapon(): void {
    const overcharged = this.overchargeTimer > 0;
    let rate = this.mech.fireRate * this.stats.fireRateMultiplier;
    if (this.mech.id === 'hellforge') {
      rate *= 1 + (this.heat / 100) * 0.65;
    }
    if (overcharged) rate *= 1.35;

    this.fireCooldown = 1 / rate;
    this.shotCounter++;

    if (!overcharged) {
      this.heat += this.mech.heatPerShot * this.stats.heatGenMultiplier;
      if (this.heat >= 100) {
        this.heat = 100;
        this.overheatedLockout = 1.45;
        this.spawnFloatingText(this.playerPos, 'THERMAL OVERHEAT! [R] TO VENT', '#ff0844', 1.25);
      }
    }

    const soundMap: Record<MechId, 'pulse' | 'vulcan' | 'railgun' | 'helix' | 'subagent' | 'hitstick'> = {
      valkyrie: 'pulse',
      hellforge: 'vulcan',
      chronos: 'railgun',
      xenofold: 'helix',
      antigravity: 'subagent',
      gridiron: 'pulse',
    };
    this.sound.playShot(soundMap[this.mech.id]);

    const isHelix = this.mech.id === 'xenofold';
    const totalShots =
      1 +
      this.stats.extraProjectiles +
      (this.mech.id === 'valkyrie' || isHelix ? 1 : 0);
    const spreadStep = this.mech.id === 'chronos' ? 0.04 : 0.075;

    for (let i = 0; i < totalShots; i++) {
      const offset = (i - (totalShots - 1) * 0.5) * spreadStep;
      const jitter =
        this.mech.id === 'hellforge' ? (Math.random() - 0.5) * 0.09 : 0;
      const angle = this.playerAngle + offset + jitter;

      const isCrit = overcharged || Math.random() < this.stats.critChance;
      const dmg =
        this.mech.baseDamage *
        this.stats.damageMultiplier *
        this.getStyleDamageBonus() *
        (isCrit ? this.stats.critMultiplier : 1) *
        (overcharged ? 1.25 : 1);

      const pierce =
        (this.mech.id === 'chronos' ? 6 : isHelix ? 2 : 0) + this.stats.pierceBonus;
      const bounces =
        this.stats.ricochetBounces + (this.mech.id === 'gridiron' ? 1 : 0);

      // AlphaFold pLDDT confidence color spectrum for XENOFOLD helical strands
      const projColor = isHelix
        ? i % 2 === 0
          ? '#0053d6'
          : '#00f2fe'
        : isCrit
        ? '#facc15'
        : this.mech.accentColor;

      this.projectiles.push({
        id: this.nextEntityId++,
        pos: {
          x: this.playerPos.x + Math.cos(this.playerAngle) * 20,
          y: this.playerPos.y + Math.sin(this.playerAngle) * 20,
        },
        vel: fromAngle(angle, this.mech.projectileSpeed),
        radius: this.mech.id === 'chronos' || this.mech.id === 'gridiron' ? 7 : 5.5,
        damage: dmg,
        color: projColor,
        fromPlayer: true,
        pierce,
        bounces,
        isCrit,
        helixPhase: isHelix ? this.shotCounter * 0.6 : undefined,
        helixSign: isHelix ? (i % 2 === 0 ? 1 : -1) : undefined,
        ttl: 1.65,
        hitIds: new Set(),
      });
    }

    const missileInterval = this.seenSynergies.has('apocalypse_salvo') ? 4 : 8;
    if (this.stats.missileStacks > 0 && this.shotCounter % missileInterval === 0) {
      const salvoCount = 2 + this.stats.missileStacks;
      for (let m = 0; m < salvoCount; m++) {
        const mAngle = this.playerAngle + (m - (salvoCount - 1) * 0.5) * 0.35;
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: { ...this.playerPos },
          vel: fromAngle(mAngle, 640),
          radius: 7,
          damage: 42 * this.stats.damageMultiplier * this.stats.critMultiplier,
          color: '#ff9a00',
          fromPlayer: true,
          pierce: 0,
          bounces: 0,
          isCrit: true,
          homing: true,
          ttl: 2.5,
          hitIds: new Set(),
        });
      }
    }
  }

  private updateProjectiles(
    dt: number,
    worldTimeScale: number,
    playerTimeScale: number
  ): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const scale = p.fromPlayer ? playerTimeScale : worldTimeScale;

      if (p.homing && p.fromPlayer) {
        const target = this.findNearestTarget(p.pos, 600, p.hitIds);
        if (target) {
          const curA = Math.atan2(p.vel.y, p.vel.x);
          const desiredA = angleBetween(p.pos, target);
          const nextA = lerpAngle(curA, desiredA, dt * 11);
          const spd = Math.hypot(p.vel.x, p.vel.y);
          p.vel.x = Math.cos(nextA) * spd;
          p.vel.y = Math.sin(nextA) * spd;
        }
      }

      // Sinusoidal double-helix oscillation for HELIX-04 XENOFOLD strands
      let perpX = 0;
      let perpY = 0;
      if (p.helixPhase !== undefined && p.helixSign !== undefined) {
        p.helixPhase += dt * 26;
        const a = Math.atan2(p.vel.y, p.vel.x) + Math.PI * 0.5;
        const wave = Math.cos(p.helixPhase) * 260 * p.helixSign;
        perpX = Math.cos(a) * wave;
        perpY = Math.sin(a) * wave;
      }

      p.pos.x += (p.vel.x + perpX) * dt * scale;
      p.pos.y += (p.vel.y + perpY) * dt * scale;
      p.ttl -= dt * scale;

      if (
        p.ttl <= 0 ||
        p.pos.x < 0 ||
        p.pos.x > this.arenaWidth ||
        p.pos.y < 0 ||
        p.pos.y > this.arenaHeight
      ) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.fromPlayer) {
        const candidates = this.spatialEnemies.queryRadius(p.pos, p.radius + 36);
        let removeBullet = false;

        for (const enemy of candidates) {
          if (p.hitIds.has(enemy.id)) continue;
          if (!circlesOverlap(p.pos, p.radius, enemy.pos, enemy.radius)) continue;

          p.hitIds.add(enemy.id);

          if (isBlockedByPhalanxShield(enemy, p.pos, p.pierce)) {
            this.spawnParticles(p.pos, '#00f2fe', 5);
            this.spawnFloatingText(enemy.pos, 'AEGIS BLOCKED', '#38bdf8', 0.85);
            removeBullet = true;
            break;
          }

          if (p.isCrit && this.stats.protacStacks > 0) {
            enemy.protacTimer = Math.max(enemy.protacTimer, 4.5);
          }

          this.damageEnemy(enemy, p.damage, p.isCrit, p.pos);

          if (p.pierce > 0) {
            p.pierce--;
          } else if (p.bounces > 0) {
            p.bounces--;
            const bounceTarget = this.findNearestTarget(p.pos, 320, p.hitIds);
            if (bounceTarget) {
              const spd = Math.hypot(p.vel.x, p.vel.y);
              const bounceA = angleBetween(p.pos, bounceTarget);
              p.vel.x = Math.cos(bounceA) * spd;
              p.vel.y = Math.sin(bounceA) * spd;
            } else {
              removeBullet = true;
            }
            break;
          } else {
            removeBullet = true;
            break;
          }
        }

        // Check collision with Boss & Boss 3D Structural Segments (G12C P-loop, Switch-II, Leviathan)
        if (!removeBullet && this.boss) {
          let hitPocket = false;
          for (let sIdx = 0; sIdx < this.boss.segments.length; sIdx++) {
            const seg = this.boss.segments[sIdx];
            const segKey = -(1000 + sIdx);
            if (
              !p.hitIds.has(segKey) &&
              circlesOverlap(p.pos, p.radius, seg.pos, seg.radius)
            ) {
              p.hitIds.add(segKey);
              hitPocket = true;
              if (seg.domainTag === 'p_loop_g12c') {
                // 300% CRIT on KRAS-G12C P-Loop Covalent Target!
                this.damageBoss(p.damage * 3.0, true, seg.pos);
                this.unlockAchievement('kras_covalent_docker');
                this.spawnFloatingText(seg.pos, 'G12C POCKET 300% CRIT!', '#00f2fe', 1.25);
              } else if (seg.domainTag === 'switch_ii_pocket') {
                // 225% Allosteric Pocket Crit!
                this.damageBoss(p.damage * 2.25, true, seg.pos);
                this.unlockAchievement('kras_covalent_docker');
                this.spawnFloatingText(seg.pos, 'SWITCH-II POCKET 225%!', '#ff6a00', 1.2);
              } else {
                this.damageBoss(p.damage * 0.85, p.isCrit, seg.pos);
              }
              if (p.pierce > 0) p.pierce--;
              else removeBullet = true;
              break;
            }
          }

          if (
            !hitPocket &&
            !p.hitIds.has(-999) &&
            circlesOverlap(p.pos, p.radius, this.boss.pos, this.boss.radius)
          ) {
            p.hitIds.add(-999);
            this.damageBoss(p.damage, p.isCrit);
            if (p.pierce > 0) p.pierce--;
            else removeBullet = true;
          }
        }

        if (removeBullet) {
          this.projectiles.splice(i, 1);
        }
      } else {
        if (circlesOverlap(p.pos, p.radius, this.playerPos, this.playerRadius)) {
          this.projectiles.splice(i, 1);
          this.damagePlayer(p.damage);
        }
      }
    }
  }

  private updateEnemies(dt: number): void {
    const pylons = this.enemies.filter((e) => e.type === 'pylon');

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.shieldedByPylon = false;
      if (e.type !== 'pylon') {
        for (const py of pylons) {
          if (distSq(e.pos, py.pos) <= 280 * 280) {
            e.shieldedByPylon = true;
            break;
          }
        }
      }

      const newBullets = updateEnemyAI(e, dt, this.playerPos);
      e.pos.x = clamp(e.pos.x, 30, this.arenaWidth - 30);
      e.pos.y = clamp(e.pos.y, 30, this.arenaHeight - 30);

      for (const b of newBullets) {
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: b.pos,
          vel: b.vel,
          radius: b.radius,
          damage: b.damage,
          color: b.color,
          fromPlayer: false,
          pierce: 0,
          bounces: 0,
          isCrit: false,
          ttl: 4.0,
          hitIds: new Set(),
        });
      }

      const neighbors = this.spatialEnemies.queryRadius(e.pos, e.radius * 1.8);
      for (const n of neighbors) {
        if (n.id === e.id) continue;
        const dx = e.pos.x - n.pos.x;
        const dy = e.pos.y - n.pos.y;
        const d = Math.hypot(dx, dy) || 1;
        const overlap = e.radius + n.radius - d;
        if (overlap > 0) {
          // If enemy e was launched by a 99-POW Hit-Stick, bowl into neighbor n for massive concussive damage!
          if (e.bowlingTimer > 0 && n.bowlingTimer <= 0) {
            n.knockbackVel.x = e.knockbackVel.x * 0.75;
            n.knockbackVel.y = e.knockbackVel.y * 0.75;
            n.bowlingTimer = 0.45;
            this.unlockAchievement('hit_stick_bowling');
            this.damageEnemy(n, 95 * this.stats.damageMultiplier, true, n.pos, true);
            this.spawnFloatingText(n.pos, 'BOWLED OVER!', '#f59e0b', 1.2);
          }
          e.pos.x += (dx / d) * overlap * 0.35;
          e.pos.y += (dy / d) * overlap * 0.35;
        }
      }

      if (circlesOverlap(e.pos, e.radius, this.playerPos, this.playerRadius)) {
        const spec = ENEMY_SPECS[e.type];
        this.damagePlayer(spec.contactDamage);
        const pushA = angleBetween(this.playerPos, e.pos);
        e.pos.x += Math.cos(pushA) * 38;
        e.pos.y += Math.sin(pushA) * 38;
      }
    }
  }

  damageEnemy(
    enemy: EnemyEntity,
    amount: number,
    isCrit: boolean,
    hitPos: Vec2,
    isChain = false
  ): void {
    if (enemy.hp <= 0) return;

    if (enemy.shieldedByPylon) {
      this.spawnFloatingText(enemy.pos, 'PYLON SHIELDED', '#00f2fe', 0.8);
      return;
    }

    const protacMult = enemy.protacTimer > 0 ? 1.45 : 1.0;
    const finalDmg = Math.max(1, Math.round(amount * protacMult));
    enemy.hp -= finalDmg;
    enemy.hitFlash = 1.0;

    if (this.stats.cryoStacks > 0) {
      enemy.chillTimer = 2.0 + this.stats.cryoStacks * 0.8;
    }

    this.spawnParticles(hitPos, isCrit ? '#facc15' : enemy.color, isCrit ? 6 : 3);
    this.spawnFloatingText(
      { x: enemy.pos.x + (Math.random() - 0.5) * 18, y: enemy.pos.y - enemy.radius },
      isCrit ? `${finalDmg}!` : `${finalDmg}`,
      enemy.protacTimer > 0 ? '#10b981' : isCrit ? '#facc15' : '#e2e8f0',
      isCrit ? 1.18 : 0.92
    );

    if (isCrit && this.stats.singularityStacks > 0 && !isChain && Math.random() < 0.35) {
      this.grid.applyImplosion(enemy.pos, 180, 260, 285);
      const pulled = this.spatialEnemies.queryRadius(enemy.pos, 165);
      for (const other of pulled) {
        if (other.id !== enemy.id) {
          const a = angleBetween(other.pos, enemy.pos);
          other.pos.x += Math.cos(a) * 28;
          other.pos.y += Math.sin(a) * 28;
        }
      }
    }

    if (
      !isChain &&
      this.stats.chainTargets > 0 &&
      Math.random() < this.stats.chainLightningChance
    ) {
      this.triggerChainLightning(enemy, finalDmg * 0.65, this.stats.chainTargets);
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy, isCrit);
    }
  }

  private triggerChainLightning(
    source: EnemyEntity,
    chainDmg: number,
    maxJumps: number
  ): void {
    const visited = new Set<number>([source.id]);
    const points: Vec2[] = [{ ...source.pos }];
    let currentPos = source.pos;

    for (let j = 0; j < maxJumps; j++) {
      const candidates = this.spatialEnemies.queryRadius(currentPos, 260);
      let closest: EnemyEntity | null = null;
      let bestDist = Infinity;

      for (const c of candidates) {
        if (visited.has(c.id) || c.hp <= 0) continue;
        const d = distSq(currentPos, c.pos);
        if (d < bestDist) {
          bestDist = d;
          closest = c;
        }
      }

      if (!closest) break;
      visited.add(closest.id);
      points.push({ ...closest.pos });
      this.damageEnemy(closest, chainDmg, false, closest.pos, true);
      currentPos = closest.pos;
    }

    if (points.length > 1) {
      this.lightningArcs.push({
        points,
        color: '#00f2fe',
        alpha: 1.0,
      });
    }
  }

  private killEnemy(enemy: EnemyEntity, wasCrit: boolean): void {
    const idx = this.enemies.findIndex((e) => e.id === enemy.id);
    if (idx !== -1) this.enemies.splice(idx, 1);

    const spec = ENEMY_SPECS[enemy.type];
    this.kills++;
    this.profile.totalKills++;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboTimer = 4.2;

    this.addStylePoints(24 + (wasCrit ? 12 : 0));
    this.score += Math.round(spec.scoreValue * (1 + this.combo * 0.05));
    this.ultimateCharge = Math.min(
      100,
      this.ultimateCharge + 2.2 + (this.augmentRanks['kinetic_recycler'] || 0) * 0.8
    );

    this.sound.playExplosion(enemy.radius / 18);
    this.grid.applyImpulse(enemy.pos, enemy.radius * 8, 260, 330);
    this.spawnParticles(enemy.pos, enemy.color, 14);
    this.spawnRing(enemy.pos, enemy.radius * 3.2, enemy.color);

    // PROTAC Catalytic Spread on Death
    if (enemy.protacTimer > 0 || this.stats.protacStacks > 0) {
      const spreadR = 160;
      const nearby = this.spatialEnemies.queryRadius(enemy.pos, spreadR);
      for (const n of nearby) {
        if (n.id !== enemy.id) {
          n.protacTimer = 5.0;
          this.damageEnemy(n, 38 * Math.max(1, this.stats.protacStacks), false, n.pos, true);
        }
      }
    }

    // AlphaGenome Codon Accelerator auto-splice
    if (this.stats.codonSplicerStacks > 0 && this.kills % 4 === 0) {
      this.spliceNucleotide(this.rng.pick(BASES));
    }

    if (enemy.type === 'breacher') {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        this.projectiles.push({
          id: this.nextEntityId++,
          pos: { ...enemy.pos },
          vel: fromAngle(a, 360),
          radius: 6,
          damage: 16,
          color: '#ff9a00',
          fromPlayer: false,
          pierce: 0,
          bounces: 0,
          isCrit: false,
          ttl: 2.2,
          hitIds: new Set(),
        });
      }
    }

    if (enemy.chillTimer > 0 && this.stats.cryoStacks > 0) {
      const blastR = 135;
      this.spawnRing(enemy.pos, blastR, '#38bdf8');
      const nearby = this.spatialEnemies.queryRadius(enemy.pos, blastR);
      for (const n of nearby) {
        if (n.id !== enemy.id) {
          n.chillTimer = 2.5;
          this.damageEnemy(n, 35 * this.stats.cryoStacks, false, n.pos, true);
        }
      }
    }

    if (this.stats.vampiricStacks > 0) {
      if (this.kills % 12 === 0) {
        this.hp = Math.min(this.maxHp, this.hp + 8 * this.stats.vampiricStacks);
      }
      if (wasCrit) {
        this.shield = Math.min(this.maxShield, this.shield + 4 * this.stats.vampiricStacks);
      }
    }

    const dropCore =
      enemy.type === 'juggernaut' ? 5 : Math.random() < 0.14 ? 1 : 0;
    const dropHeal = Math.random() < 0.05 ? 18 : 0;
    const dropBase =
      this.kills % 3 === 0 ? this.rng.pick(BASES) : undefined;

    this.shards.push({
      id: this.nextEntityId++,
      pos: { ...enemy.pos },
      vel: fromAngle(Math.random() * Math.PI * 2, 90),
      xp: spec.xpValue,
      voidCore: dropCore,
      heal: dropHeal,
      nucleotide: dropBase,
      radius: dropCore > 0 ? 10 : dropBase ? 9 : 7,
    });

    if (this.kills >= 50) {
      this.unlockAchievement('first_blood');
    }
  }

  damageBoss(amount: number, isCrit: boolean, hitLocation?: Vec2): void {
    if (!this.boss || this.boss.hp <= 0) return;
    const dmg = Math.max(1, Math.round(amount));
    this.boss.hp -= dmg;
    this.boss.hitFlash = 1.0;

    const loc = hitLocation ?? this.boss.pos;
    this.spawnParticles(loc, isCrit ? '#facc15' : this.boss.color, 5);
    this.spawnFloatingText(
      { x: loc.x + (Math.random() - 0.5) * 32, y: loc.y - 28 },
      isCrit ? `${dmg}!` : `${dmg}`,
      isCrit ? '#facc15' : '#ffffff',
      isCrit ? 1.15 : 0.9
    );

    if (this.boss.hp <= 0) {
      const defeated = this.boss;
      this.boss = null;
      this.sound.playExplosion(2.5);
      this.camera.addTrauma(1.0, 16);
      this.camera.triggerHitStop(0.12);
      this.grid.applyImpulse(defeated.pos, 750, 1200, 190);
      this.spawnRing(defeated.pos, 420, defeated.color);
      this.spawnParticles(defeated.pos, defeated.color, 55);

      this.score += 5000 * this.wave;
      this.coresCollectedThisRun += 25;
      this.profile.voidCores += 25;
      this.addStylePoints(300);

      if (defeated.id === 'seraph') {
        this.unlockAchievement('boss_slayer_1');
        this.callbacks.onToast(
          'SECTOR 01 CLEARED // SERAPH DECOMMISSIONED',
          '+25 VOID CORES HARVESTED',
          '#00f2fe'
        );
      } else if (defeated.id === 'leviathan') {
        this.unlockAchievement('boss_slayer_2');
        this.callbacks.onToast(
          'SECTOR 02 CLEARED // LEVIATHAN VANQUISHED',
          '+25 VOID CORES HARVESTED',
          '#ff6a00'
        );
      } else if (defeated.id === 'xenofold_omega') {
        this.unlockAchievement('architect_vanquished');
        this.unlockAchievement('kras_covalent_docker');
        this.callbacks.onToast(
          'KRAS-G12C ALLOSTERIC SOVEREIGN DEGRADED',
          '+25 VOID CORES // P01116 COVALENT LOCK COMPLETE',
          '#10b981'
        );
      } else if (defeated.id === 'architect') {
        this.unlockAchievement('architect_vanquished');
        if (!this.endlessMode) {
          this.finishRun(true);
          return;
        }
      }

      this.wave++;
      this.waveTimer = 0;
      this.gainXp(this.xpToNext);
    }
  }

  damagePlayer(rawAmount: number): void {
    if (this.invulnTimer > 0 || this.dashActiveTimer > 0 || this.gameOver) return;

    const amount = Math.max(1, Math.round(rawAmount * (1 - this.stats.damageReduction)));
    this.invulnTimer = 0.45;
    this.shieldRegenDelay = 3.2;
    this.camera.addTrauma(0.42, 8);
    this.sound.playExplosion(0.75);
    this.stylePoints = Math.max(0, this.stylePoints - 110);

    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, amount);
      this.shield -= absorbed;
      const remainder = amount - absorbed;
      if (this.shield <= 0 && this.stats.empNovaStacks > 0) {
        this.triggerEmpNova();
      }
      if (remainder > 0) {
        this.hp -= remainder;
      }
    } else {
      this.hp -= amount;
    }

    this.spawnFloatingText(this.playerPos, `-${amount}`, '#ff0844', 1.25);

    if (this.hp <= 0) {
      if (this.stats.hasTemporalRewind && !this.temporalRewindUsed) {
        this.temporalRewindUsed = true;
        this.hp = Math.round(this.maxHp * 0.6);
        this.shield = this.maxShield;
        this.invulnTimer = 2.5;
        this.witchTimeTimer = 3.0;
        this.projectiles = this.projectiles.filter((p) => p.fromPlayer);
        this.sound.playWitchTime();
        this.callbacks.onToast(
          'QUANTUM CHRONO-ANCHOR ACTIVATED',
          'Spacetime rewound — Hull & Aegis restored!',
          '#00f2fe'
        );
        return;
      }
      this.hp = 0;
      this.finishRun(false);
    }
  }

  private triggerEmpNova(): void {
    const r = 320;
    this.spawnRing(this.playerPos, r, '#00f2fe');
    this.grid.applyImpulse(this.playerPos, r, 450, 195);
    const hit = this.spatialEnemies.queryRadius(this.playerPos, r);
    for (const e of hit) {
      e.chillTimer = 2.5;
      this.damageEnemy(e, 45 * Math.max(1, this.stats.empNovaStacks), false, e.pos, true);
    }
  }

  private gainXp(amount: number): void {
    this.xp += amount;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.round(this.xpToNext * 1.28 + 25);
      this.pendingLevelUps++;
    }

    if (this.pendingLevelUps > 0 && !this.paused && !this.gameOver) {
      this.pendingLevelUps--;
      this.sound.playLevelUp();
      const choices = this.rollAugmentChoices(3);
      if (choices.length > 0) {
        this.paused = true;
        this.callbacks.onLevelUpDraft(choices);
      }
    }
  }

  private addStylePoints(pts: number): void {
    this.stylePoints = clamp(this.stylePoints + pts, 0, 1000);
    if (this.getStyleRank() === 'VOIDBREAKER') {
      this.unlockAchievement('voidbreaker_rank');
    }
  }

  private unlockAchievement(id: string): void {
    if (this.profile.unlockedAchievements.includes(id)) return;
    const spec = ACHIEVEMENTS.find((a) => a.id === id);
    if (!spec) return;

    this.profile.unlockedAchievements.push(id);
    this.profile.voidCores += spec.rewardCores;
    this.coresCollectedThisRun += spec.rewardCores;
    saveProfile(this.profile);

    this.callbacks.onToast(
      `ACHIEVEMENT: ${spec.title}`,
      `${spec.description} (+${spec.rewardCores} Void Cores)`,
      '#facc15'
    );
  }

  private updateWaveDirector(dt: number): void {
    if (this.boss) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.enemies.length < 10) {
        this.spawnTimer = 3.8;
        this.spawnEnemyAroundPlayer('swarmer');
      }
      return;
    }

    this.waveTimer += dt;
    this.spawnTimer -= dt;

    if (this.spawnTimer <= 0 && this.enemies.length < 48) {
      const interval = Math.max(0.55, 1.85 - this.wave * 0.11);
      this.spawnTimer = interval;

      const batchCount = Math.min(6, 2 + Math.floor(this.wave * 0.6));
      for (let i = 0; i < batchCount; i++) {
        this.spawnEnemyAroundPlayer(this.pickEnemyTypeForWave(this.wave));
      }
    }

    if (this.waveTimer >= this.waveDuration) {
      this.waveTimer = 0;
      this.wave++;
      this.profile.bestWave = Math.max(this.profile.bestWave, this.wave);

      if (this.wave === 3) {
        this.spawnBossEncounter('seraph');
      } else if (this.wave === 6) {
        this.spawnBossEncounter('leviathan');
      } else if (this.wave === 8) {
        this.spawnBossEncounter('xenofold_omega');
      } else if (this.wave === 9 || (this.endlessMode && this.wave % 3 === 0)) {
        this.spawnBossEncounter('architect');
      } else {
        this.callbacks.onToast(
          `WAVE 0${this.wave} INCOMING`,
          'Hostile swarm signatures escalating!',
          '#00f2fe'
        );
      }
    }
  }

  private pickEnemyTypeForWave(wave: number): EnemyType {
    const pool: EnemyType[] = ['swarmer', 'swarmer'];
    if (wave >= 1) pool.push('breacher', 'sniper');
    if (wave >= 2) pool.push('phalanx', 'assassin');
    if (wave >= 4) pool.push('weaver', 'pylon');
    if (wave >= 5) pool.push('juggernaut');
    return this.rng.pick(pool);
  }

  spawnEnemyAroundPlayer(type: EnemyType): EnemyEntity {
    const angle = this.rng.range(0, Math.PI * 2);
    const distFromPlayer = this.rng.range(480, 740);
    const pos = {
      x: clamp(this.playerPos.x + Math.cos(angle) * distFromPlayer, 60, this.arenaWidth - 60),
      y: clamp(this.playerPos.y + Math.sin(angle) * distFromPlayer, 60, this.arenaHeight - 60),
    };
    const waveMult = 1 + (this.wave - 1) * 0.18;
    const enemy = createEnemy(this.nextEntityId++, type, pos, waveMult);
    this.enemies.push(enemy);
    return enemy;
  }

  spawnBossEncounter(bossId: BossId): void {
    const spawnPos = {
      x: clamp(this.playerPos.x, 350, this.arenaWidth - 350),
      y: clamp(this.playerPos.y - 380, 220, this.arenaHeight - 220),
    };
    this.boss = createBoss(bossId, spawnPos);
    this.sound.playBossWarning();
    this.camera.addTrauma(0.75, 12);
    this.grid.applyImpulse(spawnPos, 600, 900, 345);
    this.callbacks.onToast(
      `WARNING // ${this.boss.name}`,
      this.boss.subtitle,
      this.boss.color
    );
  }

  private finishRun(victory: boolean): void {
    this.gameOver = true;
    this.victory = victory;
    this.running = false;

    this.profile.totalRuns++;
    this.profile.bestScore = Math.max(this.profile.bestScore, this.score);
    this.profile.bestWave = Math.max(this.profile.bestWave, this.wave);
    this.profile.recentRuns.unshift({
      mechId: this.mech.id,
      score: this.score,
      waveReached: this.wave,
      kills: this.kills,
      maxCombo: this.maxCombo,
      victory,
      timestamp: Date.now(),
    });
    this.profile.recentRuns = this.profile.recentRuns.slice(0, 10);
    saveProfile(this.profile);

    this.callbacks.onGameOver(victory);
  }

  private findNearestTarget(
    origin: Vec2,
    maxRadius: number,
    ignoreIds?: Set<number>
  ): Vec2 | null {
    let bestPos: Vec2 | null = null;
    let bestDistSq = maxRadius * maxRadius;

    const candidates = this.spatialEnemies.queryRadius(origin, maxRadius);
    for (const e of candidates) {
      if (ignoreIds?.has(e.id)) continue;
      const d2 = distSq(origin, e.pos);
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestPos = e.pos;
      }
    }

    if (this.boss && !ignoreIds?.has(-999)) {
      const d2 = distSq(origin, this.boss.pos);
      if (d2 < bestDistSq) {
        bestPos = this.boss.pos;
      }
    }
    return bestPos;
  }

  spawnParticles(pos: Vec2, color: string, count: number): void {
    if (this.particles.length > 750) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 290;
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: { x: Math.cos(a) * spd, y: Math.sin(a) * spd },
        color,
        size: 2 + Math.random() * 3.5,
        alpha: 1,
        decay: 1.5 + Math.random() * 1.4,
      });
    }
  }

  spawnRing(pos: Vec2, maxRadius: number, color: string): void {
    this.particles.push({
      pos: { x: pos.x, y: pos.y },
      vel: { x: 0, y: 0 },
      color,
      size: 10,
      maxRadius,
      alpha: 0.9,
      decay: 2.4,
      isRing: true,
    });
  }

  spawnFloatingText(pos: Vec2, text: string, color: string, scale = 1): void {
    if (this.floatingTexts.length > 55) this.floatingTexts.shift();
    this.floatingTexts.push({
      pos: { x: pos.x, y: pos.y },
      vel: { x: (Math.random() - 0.5) * 24, y: -58 },
      text,
      color,
      scale,
      alpha: 1,
    });
  }

  render(ctx: CanvasRenderingContext2D, viewW: number, viewH: number): void {
    ctx.save();

    ctx.fillStyle = this.witchTimeTimer > 0 ? '#030b1c' : '#050711';
    ctx.fillRect(0, 0, viewW, viewH);

    const camLeft = this.camera.pos.x - (viewW * 0.5) / this.camera.zoom;
    const camTop = this.camera.pos.y - (viewH * 0.5) / this.camera.zoom;

    ctx.translate(
      viewW * 0.5 + this.camera.shakeOffset.x,
      viewH * 0.5 + this.camera.shakeOffset.y
    );
    ctx.rotate(this.camera.shakeAngle);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.pos.x, -this.camera.pos.y);

    this.grid.render(
      ctx,
      camLeft,
      camTop,
      viewW / this.camera.zoom,
      viewH / this.camera.zoom,
      clamp(this.witchTimeTimer / 2.5, 0, 1)
    );

    ctx.strokeStyle = 'rgba(255, 8, 68, 0.55)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, this.arenaWidth, this.arenaHeight);

    for (const well of this.singularities) {
      ctx.save();
      ctx.translate(well.pos.x, well.pos.y);
      const grad = ctx.createRadialGradient(0, 0, 6, 0, 0, well.radius);
      grad.addColorStop(
        0,
        well.isIthacaSeal
          ? 'rgba(250, 204, 21, 0.35)'
          : well.isChronoDome
          ? 'rgba(183, 33, 255, 0.35)'
          : 'rgba(255, 106, 0, 0.45)'
      );
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, well.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = well.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, well.radius, 0, Math.PI * 2);
      ctx.stroke();

      if (well.isIthacaSeal) {
        ctx.fillStyle = '#facc15';
        ctx.font = '700 18px "JetBrains Mono", serif';
        ctx.textAlign = 'center';
        ctx.fillText('Α Ω // ΙΘΑΚΗ RESTORED', 0, -well.radius * 0.4);
      }
      ctx.restore();
    }

    for (const s of this.shards) {
      ctx.save();
      ctx.translate(s.pos.x, s.pos.y);
      ctx.fillStyle =
        s.voidCore > 0
          ? '#b721ff'
          : s.heal > 0
          ? '#10b981'
          : s.nucleotide
          ? '#facc15'
          : '#00f2fe';
      ctx.beginPath();
      ctx.moveTo(0, -s.radius);
      ctx.lineTo(s.radius, 0);
      ctx.lineTo(0, s.radius);
      ctx.lineTo(-s.radius, 0);
      ctx.closePath();
      ctx.fill();

      if (s.nucleotide) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.nucleotide, 0, -s.radius - 3);
      }
      ctx.restore();
    }

    const pylons = this.enemies.filter((e) => e.type === 'pylon');
    if (pylons.length > 0) {
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const py of pylons) {
        for (const e of this.enemies) {
          if (e.type !== 'pylon' && distSq(py.pos, e.pos) <= 280 * 280) {
            ctx.moveTo(py.pos.x, py.pos.y);
            ctx.lineTo(e.pos.x, e.pos.y);
          }
        }
      }
      ctx.stroke();
    }

    for (const enemy of this.enemies) {
      renderEnemy(ctx, enemy, this.playerPos);
    }

    if (this.boss) {
      renderBoss(ctx, this.boss);
    }

    // Render Sandevistan Holographic Afterimage Ghosts
    for (const gh of this.afterimages) {
      ctx.save();
      ctx.translate(gh.pos.x, gh.pos.y);
      ctx.rotate(gh.angle);
      ctx.globalAlpha = gh.alpha * 0.55;
      ctx.strokeStyle = gh.color;
      ctx.lineWidth = 2;
      const r = this.playerRadius;
      ctx.beginPath();
      ctx.moveTo(r * 1.35, 0);
      ctx.lineTo(-r * 0.7, -r * 0.95);
      ctx.lineTo(-r * 0.95, 0);
      ctx.lineTo(-r * 0.7, r * 0.95);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    this.renderPlayerMech(ctx);
    this.renderSubAgents(ctx);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    for (const slash of this.katanaSlashes) {
      ctx.strokeStyle = slash.color;
      ctx.globalAlpha = slash.alpha;
      ctx.lineWidth = 12 * slash.alpha;
      ctx.beginPath();
      if (slash.fullCircle) {
        ctx.arc(slash.pos.x, slash.pos.y, slash.radius, 0, Math.PI * 2);
      } else {
        ctx.arc(
          slash.pos.x,
          slash.pos.y,
          slash.radius,
          slash.angle - Math.PI * 0.48,
          slash.angle + Math.PI * 0.48
        );
      }
      ctx.stroke();
    }

    for (const arc of this.lightningArcs) {
      ctx.strokeStyle = arc.color;
      ctx.globalAlpha = arc.alpha;
      ctx.lineWidth = 3;
      ctx.beginPath();
      arc.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    }

    for (const p of this.projectiles) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.radius * 1.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.pos.x, p.pos.y);
      ctx.lineTo(p.pos.x - p.vel.x * 0.022, p.pos.y - p.vel.y * 0.022);
      ctx.stroke();
    }

    for (const pt of this.particles) {
      ctx.globalAlpha = Math.max(0, pt.alpha);
      if (pt.isRing) {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pt.pos.x, pt.pos.y, pt.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.pos.x - pt.size * 0.5, pt.pos.y - pt.size * 0.5, pt.size, pt.size);
      }
    }

    ctx.restore();

    ctx.font = '700 14px "JetBrains Mono", "SF Mono", monospace';
    ctx.textAlign = 'center';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = clamp(ft.alpha, 0, 1);
      ctx.fillStyle = ft.color;
      ctx.save();
      ctx.translate(ft.pos.x, ft.pos.y);
      ctx.scale(ft.scale, ft.scale);
      ctx.fillText(ft.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  private renderSubAgents(ctx: CanvasRenderingContext2D): void {
    if (this.subAgents.length === 0) return;
    ctx.save();
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (const ag of this.subAgents) {
      // Telemetry tether to parent orchestrator
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.playerPos.x, this.playerPos.y);
      ctx.lineTo(ag.pos.x, ag.pos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#090d1a';
      ctx.strokeStyle = ag.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ag.pos.x, ag.pos.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = ag.color;
      ctx.fillText(ag.callsign, ag.pos.x, ag.pos.y - 13);
    }
    ctx.restore();
  }

  private renderPlayerMech(ctx: CanvasRenderingContext2D): void {
    const bladeCount = this.stats.orbitalBladesCount;
    if (bladeCount > 0) {
      const orbitR = this.seenSynergies.has('event_horizon_saw') ? 115 : 86;
      for (let i = 0; i < bladeCount; i++) {
        const a = this.orbitalAngle + (i * Math.PI * 2) / bladeCount;
        const bx = this.playerPos.x + Math.cos(a) * orbitR;
        const by = this.playerPos.y + Math.sin(a) * orbitR;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(this.orbitalAngle * 3);
        ctx.strokeStyle = '#00f2fe';
        ctx.fillStyle = 'rgba(0, 242, 254, 0.35)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(0, -10);
        ctx.lineTo(-16, 0);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(this.playerPos.x, this.playerPos.y);

    if (this.shield > 0) {
      ctx.strokeStyle = `rgba(0, 242, 254, ${0.22 + (this.shield / this.maxShield) * 0.35})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.playerRadius + 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.rotate(this.playerAngle);

    ctx.fillStyle = '#090d1a';
    ctx.strokeStyle =
      this.overchargeTimer > 0 ? '#facc15' : this.mech.accentColor;
    ctx.lineWidth = 2.8;

    const r = this.playerRadius;
    ctx.beginPath();
    ctx.moveTo(r * 1.35, 0);
    ctx.lineTo(-r * 0.7, -r * 0.95);
    ctx.lineTo(-r * 0.35, -r * 0.3);
    ctx.lineTo(-r * 0.95, 0);
    ctx.lineTo(-r * 0.35, r * 0.3);
    ctx.lineTo(-r * 0.7, r * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.mech.secondaryColor;
    ctx.beginPath();
    ctx.arc(r * 0.15, 0, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
