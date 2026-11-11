import * as THREE from "three";
import { GameLoop } from "./engine";
import { Input } from "./input";
import { AudioSystem } from "./audio";
import { ParticleField } from "./particles";
import { GameUI } from "./ui";
import { COLORS, GAME, QUALITY } from "./config";
import { createDecoyVisual, createEnemyVisual, createPlayer, createProp } from "./visuals";
import type { Decoy, Enemy, EnemyKind, GameMode, Hazard, Projectile, Prop, Pulse, RunStats, SaveData, Upgrade } from "./types";
import { clamp, damp, distSq, formatTime, Random } from "./utils";

const SAVE_KEY = "hush-pulse.save.v1";
const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);

interface PlayerState {
  x: number; z: number; hp: number; maxHp: number; noise: number;
  fireCd: number; pulseCd: number; decoyCd: number; invuln: number;
  hushed: boolean; dampened: boolean; shield: number;
}

interface Mods {
  damage: number; fireInterval: number; pulseRadius: number; pulseCooldown: number;
  resonanceDuration: number; decoyCooldown: number; hushSpeed: number;
  chainRadius: number; chainDamage: number; multishot: number; noiseDecay: number;
  echoEvery: number; pulseDamage: number; moveSpeed: number;
}

export class HushPulseGame {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(48, 1, 0.1, 130);
  readonly input: Input;
  readonly audio = new AudioSystem();
  readonly ui: GameUI;
  readonly loop: GameLoop;
  private readonly rng = new Random(0xc0ffee);
  private readonly particles = new ParticleField();
  private readonly playerVisual = createPlayer();
  private readonly enemies: Enemy[] = [];
  private readonly projectiles: Projectile[] = [];
  private readonly pulses: Pulse[] = [];
  private readonly hazards: Hazard[] = [];
  private readonly props: Prop[] = [];
  private readonly decoy: Decoy;
  private readonly raycaster = new THREE.Raycaster();
  private readonly ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly pointer = new THREE.Vector2();
  private readonly aimPoint = new THREE.Vector3(0, 0, -4);
  private readonly cameraTarget = new THREE.Vector3();
  private readonly save: SaveData;
  private mode: GameMode = "title";
  private player: PlayerState = this.freshPlayer();
  private mods: Mods = this.freshMods();
  private stats: RunStats = this.freshStats();
  private wave = 1;
  private pending: EnemyKind[] = [];
  private spawnTimer = 0;
  private waveClearTimer = -1;
  private bossDefeatTimer = -1;
  private combo = 0;
  private comboTime = 0;
  private shotCount = 0;
  private stepTimer = 0;
  private titleTimer = 0;
  private time = 0;
  private runTime = 0;
  private shake = 0;
  private pulseId = 1;
  private enemyId = 1;
  private upgradeOptions: Upgrade[] = [];
  private tutorialStep = 0;
  private bossTutorial = false;
  private reinforcementSpawned = false;
  private isNewBest = false;
  private lastFrame = performance.now();
  private fps = 60;
  private fpsTime = 0;
  private fpsFrames = 0;
  private qualityReduced = false;
  private disposed = false;

  constructor(private canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, QUALITY.DPR_MAX));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.scene.background = new THREE.Color(COLORS.void);
    this.scene.fog = new THREE.FogExp2(COLORS.void, 0.023);
    this.camera.position.set(0, 23, 15);
    this.camera.lookAt(0, 0, 0);
    this.input = new Input(canvas);
    this.save = this.loadSave();
    this.ui = new GameUI(uiRoot, {
      start: () => this.startRun(), resume: () => this.resume(), restart: () => this.startRun(),
      title: () => this.toTitle(), upgrade: (i) => this.chooseUpgrade(i), mute: () => this.toggleMute(),
      pause: () => this.pause(), pulse: () => { if (this.mode === "playing") this.firePulse(); },
      decoy: () => { if (this.mode === "playing") this.throwDecoy(); },
    });
    this.ui.setBest(this.save.bestScore, this.save.wins);
    this.ui.setMuted(this.audio.muted);
    this.buildWorld();
    this.buildPools();
    this.decoy = { active: false, group: createDecoyVisual(), x: 0, z: 0, age: 0, pulseTimer: 0 };
    this.decoy.group.visible = false;
    this.scene.add(this.decoy.group);
    this.toTitle();
    this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.render() });
    this.loop.start();
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  private freshPlayer(): PlayerState {
    return { x: 0, z: 8, hp: GAME.PLAYER_HP, maxHp: GAME.PLAYER_HP, noise: 0, fireCd: 0, pulseCd: 0, decoyCd: 0, invuln: 0, hushed: false, dampened: false, shield: 0 };
  }

  private freshMods(): Mods {
    return { damage: 1, fireInterval: GAME.FIRE_INTERVAL, pulseRadius: GAME.PULSE_RADIUS, pulseCooldown: GAME.PULSE_COOLDOWN, resonanceDuration: 2.5, decoyCooldown: GAME.DECOY_COOLDOWN, hushSpeed: GAME.HUSH_SPEED, chainRadius: 4.4, chainDamage: 1.5, multishot: 1, noiseDecay: 12, echoEvery: 0, pulseDamage: 0, moveSpeed: GAME.PLAYER_SPEED };
  }

  private freshStats(): RunStats {
    return { score: 0, kills: 0, resonantKills: 0, bestCombo: 0, elapsed: 0, pulses: 0, damageTaken: 0 };
  }

  private buildWorld() {
    const ambient = new THREE.HemisphereLight(0x25445c, 0x030307, 0.55);
    this.scene.add(ambient);
    const rim = new THREE.DirectionalLight(0x7c66ff, 1.1);
    rim.position.set(-8, 14, 6);
    this.scene.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(GAME.ARENA_RADIUS + 2, 96), new THREE.MeshStandardMaterial({ color: 0x060811, roughness: 0.86, metalness: 0.35 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    this.scene.add(floor);
    const grid = new THREE.GridHelper(44, 44, 0x1b615f, 0x14232f);
    grid.position.y = 0.005;
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.19;
    this.scene.add(grid);
    for (let i = 0; i < 4; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(GAME.ARENA_RADIUS + i * 1.6, i === 0 ? 0.08 : 0.025, 5, 128), new THREE.MeshBasicMaterial({ color: i === 0 ? COLORS.cyan : COLORS.violet, transparent: true, opacity: i === 0 ? 0.32 : 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.015;
      this.scene.add(ring);
    }
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + this.rng.range(-0.11, 0.11);
      const r = i % 3 === 0 ? this.rng.range(8, 12) : this.rng.range(14, 18);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const visual = createProp(x, z, this.rng.range(1.8, 5.2), this.rng.int(4, 7));
      this.scene.add(visual.group);
      this.props.push({ x, z, radius: 0.85, reveal: 0, group: visual.group, materials: visual.materials });
    }
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      const a = this.rng.range(0, TAU), r = this.rng.range(8, 60);
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = this.rng.range(3, 25);
      positions[i * 3 + 2] = Math.sin(a) * r;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x5385a0, size: 0.07, transparent: true, opacity: 0.45, depthWrite: false }));
    this.scene.add(stars);
    this.scene.add(this.playerVisual, this.particles.points);
  }

  private buildPools() {
    const counts: Array<[EnemyKind, number]> = [["listener", 14], ["mimic", 7], ["mute", 5], ["choir", 12], ["conductor", 1]];
    for (const [kind, count] of counts) {
      for (let i = 0; i < count; i++) {
        const visual = createEnemyVisual(kind);
        visual.group.visible = false;
        this.scene.add(visual.group);
        const hp = kind === "listener" ? 3 : kind === "mimic" ? 5 : kind === "mute" ? 9 : kind === "choir" ? 1.5 : 150;
        this.enemies.push({
          id: this.enemyId++, active: false, kind, group: visual.group, body: visual.body, accent: visual.accent,
          x: 0, z: 0, vx: 0, vz: 0, hp, maxHp: hp, radius: kind === "conductor" ? 1.6 : kind === "mute" ? 1 : kind === "choir" ? 0.42 : 0.65,
          speed: kind === "listener" ? 2.75 : kind === "mimic" ? 2.25 : kind === "mute" ? 1.45 : kind === "choir" ? 4.7 : 1.4,
          reveal: 0, resonant: 0, heard: 0, targetX: 0, targetZ: 0, state: "idle", stateTime: 0, attackCd: 0, specialCd: 0,
          flash: 0, seed: this.rng.range(0, 100), lastPulse: 0, bossPhase: 1, worth: kind === "conductor" ? 5000 : kind === "mute" ? 400 : kind === "mimic" ? 250 : kind === "choir" ? 90 : 150,
        });
      }
    }
    const boltGeo = new THREE.OctahedronGeometry(0.17, 0);
    const friendlyMat = new THREE.MeshBasicMaterial({ color: COLORS.cyanHot, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    const hostileMat = new THREE.MeshBasicMaterial({ color: COLORS.magenta, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    for (let i = 0; i < GAME.MAX_PROJECTILES; i++) {
      const mesh = new THREE.Mesh(boltGeo, i % 2 === 0 ? friendlyMat : hostileMat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.projectiles.push({ active: false, mesh, x: 0, z: 0, vx: 0, vz: 0, life: 0, friendly: true, damage: 1, radius: 0.25 });
    }
    const pulseGeo = new THREE.RingGeometry(0.94, 1, 72);
    for (let i = 0; i < GAME.MAX_PULSES; i++) {
      const material = new THREE.MeshBasicMaterial({ color: COLORS.cyan, transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(pulseGeo, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      this.scene.add(mesh);
      this.pulses.push({ active: false, mesh, material, x: 0, z: 0, age: 0, previousRadius: 0, radius: 0, maxRadius: 1, speed: 1, damage: 0, hostile: false, hitPlayer: false, id: 0 });
    }
    const hazardGeo = new THREE.RingGeometry(0.78, 1, 48);
    for (let i = 0; i < 14; i++) {
      const material = new THREE.MeshBasicMaterial({ color: COLORS.red, transparent: true, opacity: 0.6, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(hazardGeo, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.06;
      mesh.visible = false;
      this.scene.add(mesh);
      this.hazards.push({ active: false, mesh, material, x: 0, z: 0, age: 0, delay: 1, radius: 2, damage: 15 });
    }
  }

  startRun() {
    this.audio.startMusic();
    this.audio.sfx("wave");
    this.clearEntities();
    this.player = this.freshPlayer();
    this.mods = this.freshMods();
    this.stats = this.freshStats();
    this.wave = 1;
    this.combo = 0;
    this.comboTime = 0;
    this.shotCount = 0;
    this.runTime = 0;
    this.tutorialStep = 0;
    this.bossTutorial = false;
    this.isNewBest = false;
    this.mode = "playing";
    this.save.runs++;
    this.writeSave();
    this.beginWave(1);
  }

  private beginWave(wave: number) {
    this.wave = wave;
    this.waveClearTimer = -1;
    this.bossDefeatTimer = -1;
    this.reinforcementSpawned = false;
    this.pending = [];
    if (wave === 1) this.pending.push("listener", "listener", "listener", "listener", "listener", "listener");
    if (wave === 2) this.pending.push("listener", "choir", "mimic", "listener", "choir", "listener", "choir", "mimic", "listener", "choir");
    if (wave === 3) this.pending.push("mute", "mimic", "choir", "listener", "mimic", "choir", "mute", "listener", "choir", "mimic", "listener");
    if (wave === 4) this.pending.push("mute", "listener", "mimic", "choir", "choir", "listener", "mute", "mimic", "listener", "choir", "mimic", "listener", "choir", "listener");
    if (wave === 5) this.pending.push("conductor");
    this.spawnTimer = wave === 5 ? 1.5 : 0.45;
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + (wave > 1 ? 18 : 0));
    this.player.shield = Math.max(this.player.shield, this.mods.echoEvery === -1 ? 1 : 0);
    if (wave === 1) this.ui.announce("MOVEMENT I", "THE LISTENERS", "MAKE NOISE. MAKE IT COUNT.");
    else if (wave === 5) { this.ui.announce("FINAL MOVEMENT", "THE CONDUCTOR", "IT HEARS YOUR HEARTBEAT.", 3.2); this.audio.sfx("boss"); }
    else this.ui.announce(`MOVEMENT ${["I", "II", "III", "IV"][wave - 1]}`, ["", "", "THE MIMICS", "THE MUTES", "THE FULL CHOIR"][wave], wave === 3 ? "THEY RETURN EVERY NOTE." : wave === 4 ? "RED WAVES? HOLD SHIFT AND DISAPPEAR." : "THE DARK IS GETTING LOUDER.");
  }

  private clearEntities() {
    for (const e of this.enemies) { e.active = false; e.group.visible = false; }
    for (const p of this.projectiles) { p.active = false; p.mesh.visible = false; }
    for (const p of this.pulses) { p.active = false; p.mesh.visible = false; }
    for (const h of this.hazards) { h.active = false; h.mesh.visible = false; }
    this.pending = [];
    if (this.decoy) { this.decoy.active = false; this.decoy.group.visible = false; }
  }

  toTitle() {
    this.mode = "title";
    this.audio.stopMusic();
    this.clearEntities();
    this.player = this.freshPlayer();
    this.player.x = 0; this.player.z = 0;
    this.titleTimer = 0.3;
    this.ui.setBest(this.save.bestScore, this.save.wins);
    this.ui.tutorial("");
    const a = this.spawnEnemy("listener", -5, -2);
    const b = this.spawnEnemy("mimic", 5, -3);
    const c = this.spawnEnemy("mute", 0, -7);
    if (a) a.reveal = 0.45;
    if (b) b.reveal = 0.35;
    if (c) c.reveal = 0.3;
  }

  pause() { if (this.mode === "playing") { this.mode = "paused"; this.audio.sfx("ui"); } }
  resume() { if (this.mode === "paused") { this.mode = "playing"; this.audio.sfx("ui"); } }
  toggleMute() { this.ui.setMuted(this.audio.toggleMute()); }

  private update(dt: number) {
    this.time += dt;
    this.handleInput();
    if (this.mode === "playing") this.updatePlaying(dt);
    else if (this.mode === "title") this.updateTitle(dt);
    else if (this.mode === "gameover" || this.mode === "victory") {
      this.updatePulses(dt);
      this.particles.update(dt);
    }
    this.audio.update(clamp(this.player.noise / 100 + this.activeEnemyCount() / 30, 0, 1), this.wave === 5);
    this.updateUI(dt);
    this.input.actions.clear();
  }

  private handleInput() {
    if (this.input.consumeAction("KeyM")) this.toggleMute();
    if (this.input.consumeAction("Escape")) {
      if (this.mode === "playing") this.pause();
      else if (this.mode === "paused") this.resume();
    }
    if (this.input.consumeAction("Space")) {
      if (this.mode === "title" || this.mode === "gameover" || this.mode === "victory") this.startRun();
      else if (this.mode === "playing") this.firePulse();
    }
    if (this.input.consumeAction("MouseRight") && this.mode === "playing") this.throwDecoy();
    if (this.mode === "upgrade") {
      if (this.input.consumeAction("Digit1")) this.chooseUpgrade(0);
      if (this.input.consumeAction("Digit2")) this.chooseUpgrade(1);
      if (this.input.consumeAction("Digit3")) this.chooseUpgrade(2);
    }
  }

  private updateTitle(dt: number) {
    this.titleTimer -= dt;
    if (this.titleTimer <= 0) {
      this.titleTimer = 2.7;
      this.spawnPulse(0, 0, 18, 8, COLORS.cyan, 0, false);
    }
    this.updatePulses(dt);
    this.particles.update(dt);
    for (const e of this.enemies) if (e.active) e.group.rotation.y += dt * 0.18;
  }

  private updatePlaying(dt: number) {
    this.runTime += dt;
    this.stats.elapsed = this.runTime;
    const p = this.player;
    p.fireCd = Math.max(0, p.fireCd - dt);
    p.pulseCd = Math.max(0, p.pulseCd - dt * (p.dampened ? 0.42 : 1));
    p.decoyCd = Math.max(0, p.decoyCd - dt);
    p.invuln = Math.max(0, p.invuln - dt);
    p.hushed = this.input.isHeld("ShiftLeft") || this.input.isHeld("ShiftRight") || this.input.hushForced;
    p.noise = Math.max(0, p.noise - dt * (p.hushed ? p.noiseDecay * 1.9 : p.noiseDecay));
    p.dampened = false;
    this.comboTime -= dt;
    if (this.comboTime <= 0) this.combo = 0;

    let mx = this.input.moveX, mz = this.input.moveZ;
    const moving = Math.abs(mx) + Math.abs(mz) > 0.05;
    if (moving) {
      const len = Math.hypot(mx, mz); mx /= len; mz /= len;
      const speed = p.hushed ? this.mods.hushSpeed : this.mods.moveSpeed;
      p.x += mx * speed * dt;
      p.z -= mz * speed * dt;
      this.constrain(p, GAME.PLAYER_RADIUS);
      if (!p.hushed) {
        this.stepTimer -= dt;
        if (this.stepTimer <= 0) {
          this.stepTimer = 0.38;
          this.spawnPulse(p.x, p.z, 2.8, 8, COLORS.cyan, 0, false);
          this.emitSound(p.x, p.z, 6.5);
          p.noise = clamp(p.noise + 4, 0, 100);
          this.audio.sfx("step");
        }
      }
    } else this.stepTimer = 0;

    if ((this.input.firing || this.input.isHeld("KeyJ")) && p.fireCd <= 0) this.fireBolt();
    if (this.isTouch() && p.fireCd <= 0 && this.activeEnemyCount() > 0) {
      const target = this.nearestEnemy(p.x, p.z);
      if (target) { this.aimPoint.set(target.x, 0, target.z); this.fireBolt(); }
    }
    this.updateDirector(dt);
    this.updateDecoy(dt);
    for (const e of this.enemies) if (e.active) this.updateEnemy(e, dt);
    this.separateEnemies();
    this.updateProjectiles(dt);
    this.updatePulses(dt);
    this.updateHazards(dt);
    this.particles.update(dt);

    if (p.noise > 88 && !this.reinforcementSpawned && this.wave < 5) {
      this.reinforcementSpawned = true;
      this.pending.push("choir", "choir");
      this.ui.announce("TOO LOUD", "THEY HEARD THAT", "+2 CHOIR REINFORCEMENTS", 1.7);
    }
    if (this.wave < 5 && this.waveClearTimer < 0 && this.pending.length === 0 && this.activeEnemyCount() === 0) this.waveClearTimer = 1.35;
    if (this.waveClearTimer >= 0) {
      this.waveClearTimer -= dt;
      if (this.waveClearTimer <= 0) {
        this.waveClearTimer = -1;
        if (this.wave >= 4) this.beginWave(5);
        else this.openUpgrades();
      }
    }
    if (this.bossDefeatTimer >= 0) {
      this.bossDefeatTimer -= dt;
      if (this.bossDefeatTimer <= 0) { this.bossDefeatTimer = -1; this.endRun(true); }
    }
    this.updateTutorial();
  }

  private isTouch() { return window.matchMedia("(pointer: coarse)").matches; }

  private updateDirector(dt: number) {
    if (this.pending.length === 0) return;
    this.spawnTimer -= dt;
    const cap = this.wave === 1 ? 5 : this.wave === 5 ? 10 : 11;
    if (this.spawnTimer <= 0 && this.activeEnemyCount() < cap) {
      const kind = this.pending.shift()!;
      if (kind === "conductor") this.spawnEnemy(kind, 0, -7);
      else {
        const a = this.rng.range(0, TAU), r = this.rng.range(15, 18.5);
        this.spawnEnemy(kind, Math.cos(a) * r, Math.sin(a) * r);
      }
      this.spawnTimer = this.wave === 5 ? 1 : this.rng.range(0.45, 0.8);
    }
  }

  private spawnEnemy(kind: EnemyKind, x: number, z: number) {
    const e = this.enemies.find((it) => !it.active && it.kind === kind);
    if (!e) return null;
    e.active = true; e.x = x; e.z = z; e.vx = 0; e.vz = 0;
    e.hp = e.maxHp; e.reveal = 1; e.resonant = 0; e.heard = 0;
    e.targetX = x; e.targetZ = z; e.state = "spawn"; e.stateTime = kind === "conductor" ? 1.8 : 0.7;
    e.attackCd = this.rng.range(0.8, 1.8); e.specialCd = kind === "conductor" ? 4.5 : this.rng.range(4, 7);
    e.flash = 0; e.lastPulse = 0; e.bossPhase = 1;
    e.group.visible = true; e.group.position.set(x, 0, z);
    this.spawnPulse(x, z, kind === "conductor" ? 8 : 3.2, 7, kind === "conductor" ? COLORS.red : COLORS.magenta, 0, false);
    return e;
  }

  private updateEnemy(e: Enemy, dt: number) {
    e.flash = Math.max(0, e.flash - dt);
    e.reveal = Math.max(0, e.reveal - dt * 0.19);
    e.resonant = Math.max(0, e.resonant - dt);
    e.attackCd -= dt; e.specialCd -= dt; e.heard -= dt;
    if (e.state === "spawn") { e.stateTime -= dt; if (e.stateTime <= 0) e.state = "idle"; return; }
    const p = this.player;
    const pd = Math.sqrt(distSq(e.x, e.z, p.x, p.z));
    if (e.kind === "mute" && pd < 4.5) p.dampened = true;
    if (e.kind === "conductor") { this.updateConductor(e, dt, pd); return; }

    let tx = e.targetX, tz = e.targetZ;
    let targetIsDecoy = false;
    if (this.decoy.active && distSq(e.x, e.z, this.decoy.x, this.decoy.z) < 24 * 24) {
      tx = this.decoy.x; tz = this.decoy.z; e.heard = 1; targetIsDecoy = true;
    } else if (pd < 2.6 || (e.kind === "choir" && pd < 5)) {
      tx = p.x; tz = p.z; e.heard = 1;
    }
    const td = Math.hypot(tx - e.x, tz - e.z);
    const dx = td > 0.001 ? (tx - e.x) / td : 0;
    const dz = td > 0.001 ? (tz - e.z) / td : 0;
    const rage = 1 + p.noise / 100 * 0.3;

    if (e.state === "windup") {
      e.stateTime -= dt;
      e.reveal = 1;
      if (e.stateTime <= 0) {
        if (e.kind === "mimic") {
          const aim = Math.atan2(p.z - e.z, p.x - e.x);
          this.spawnProjectile(e.x, e.z, Math.cos(aim) * 7, Math.sin(aim) * 7, false, 12, 4);
          e.state = "recover"; e.stateTime = 0.35;
        } else if (e.kind === "choir") {
          this.spawnHazard(e.x, e.z, 1.65, 0.01, 17);
          this.killEnemy(e, false, true);
          return;
        } else {
          const angle = Math.atan2(tz - e.z, tx - e.x);
          e.vx = Math.cos(angle) * 13.5; e.vz = Math.sin(angle) * 13.5;
          e.state = "lunge"; e.stateTime = 0.34;
          this.audio.sfx("hit");
        }
      }
      return;
    }
    if (e.state === "lunge") {
      e.stateTime -= dt;
      e.x += e.vx * dt; e.z += e.vz * dt;
      this.constrain(e, e.radius);
      if (distSq(e.x, e.z, p.x, p.z) < (e.radius + GAME.PLAYER_RADIUS) ** 2) {
        this.hurtPlayer(14, e.x, e.z); e.stateTime = 0;
      }
      if (targetIsDecoy && this.decoy.active && distSq(e.x, e.z, this.decoy.x, this.decoy.z) < 1.2) e.stateTime = 0;
      if (e.stateTime <= 0) { e.state = "recover"; e.stateTime = 0.55; e.attackCd = 2.2; }
      return;
    }
    if (e.state === "recover") { e.stateTime -= dt; if (e.stateTime <= 0) e.state = "idle"; return; }

    if (e.kind === "listener") {
      if (e.heard > 0 && td > 0.8) { e.x += dx * e.speed * rage * dt; e.z += dz * e.speed * rage * dt; }
      else { e.x += Math.sin(this.time * 0.5 + e.seed) * 0.25 * dt; e.z += Math.cos(this.time * 0.4 + e.seed) * 0.25 * dt; }
      if (e.attackCd <= 0 && ((pd < 5.8 && e.heard > 0) || (targetIsDecoy && td < 5))) {
        e.state = "windup"; e.stateTime = 0.62; e.targetX = tx; e.targetZ = tz;
      }
    } else if (e.kind === "mimic") {
      if (e.heard > 0) {
        const toward = pd > 8 ? 1 : pd < 5.5 ? -1 : 0;
        e.x += (dx * toward + -dz * 0.55) * e.speed * dt;
        e.z += (dz * toward + dx * 0.55) * e.speed * dt;
      }
      if (e.attackCd <= 0 && e.heard > 0 && pd < 15) { e.state = "windup"; e.stateTime = 0.75; e.attackCd = 2.6; }
    } else if (e.kind === "mute") {
      if (e.heard > 0 && td > 1) { e.x += dx * e.speed * dt; e.z += dz * e.speed * dt; }
      if (e.specialCd <= 0 && pd < 8) {
        this.spawnPulse(e.x, e.z, 6, 5.5, COLORS.red, 13, true);
        e.specialCd = 6.5;
      }
      if (pd < 1.5 && e.attackCd <= 0) { this.hurtPlayer(12, e.x, e.z); e.attackCd = 1.5; }
    } else if (e.kind === "choir") {
      if (e.heard > 0) { e.x += dx * e.speed * rage * dt; e.z += dz * e.speed * rage * dt; }
      if (pd < 1.15 || (targetIsDecoy && td < 0.85)) { e.state = "windup"; e.stateTime = 0.26; }
    }
    this.constrain(e, e.radius);
  }

  private updateConductor(e: Enemy, dt: number, pd: number) {
    const p = this.player;
    const ratio = e.hp / e.maxHp;
    const phase = ratio < 0.33 ? 3 : ratio < 0.67 ? 2 : 1;
    if (phase > e.bossPhase) {
      e.bossPhase = phase;
      this.spawnPulse(e.x, e.z, 19, 7, COLORS.red, 18, true);
      this.pending.push(phase === 2 ? "mimic" : "mute", "choir", "choir");
      this.ui.announce(phase === 2 ? "THE TEMPO RISES" : "FINALE", phase === 2 ? "FORTE" : "FORTISSIMO", "HUSH THROUGH THE RED WAVES.", 2.2);
      this.audio.sfx("boss");
      this.shake = 1;
    }
    const dx = (p.x - e.x) / Math.max(0.01, pd), dz = (p.z - e.z) / Math.max(0.01, pd);
    const direction = pd > 8 ? 1 : pd < 5 ? -0.6 : 0;
    e.x += (dx * direction - dz * 0.25) * e.speed * (1 + phase * 0.12) * dt;
    e.z += (dz * direction + dx * 0.25) * e.speed * (1 + phase * 0.12) * dt;
    this.constrain(e, e.radius);
    if (e.attackCd <= 0) {
      const base = Math.atan2(p.z - e.z, p.x - e.x);
      const count = 3 + phase * 2;
      for (let i = 0; i < count; i++) {
        const a = base + (i - (count - 1) / 2) * 0.14;
        this.spawnProjectile(e.x, e.z, Math.cos(a) * (6.5 + phase), Math.sin(a) * (6.5 + phase), false, 12 + phase * 2, 5);
      }
      e.attackCd = 3.4 - phase * 0.42;
      e.flash = 0.25;
      this.audio.sfx("shoot");
    }
    if (e.specialCd <= 0) {
      this.spawnPulse(e.x, e.z, 20, 7 + phase * 0.5, COLORS.red, 16 + phase * 2, true);
      e.specialCd = 7.2 - phase * 0.6;
      if (!this.bossTutorial) { this.bossTutorial = true; this.ui.announce("RED SHOCKWAVE", "DISAPPEAR", "HOLD SHIFT AS THE RING CROSSES YOU.", 3); }
    }
    e.stateTime -= dt;
    if (e.stateTime <= 0) {
      this.spawnHazard(p.x, p.z, 2.4 + phase * 0.25, 1.15 - phase * 0.1, 20);
      e.stateTime = 4.8 - phase * 0.5;
    }
    if (pd < 2 && e.attackCd < 0.5) this.hurtPlayer(16, e.x, e.z);
  }

  private fireBolt() {
    const p = this.player;
    p.fireCd = this.mods.fireInterval;
    this.shotCount++;
    let dx = this.aimPoint.x - p.x, dz = this.aimPoint.z - p.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) { dx = 0; dz = -1; } else { dx /= len; dz /= len; }
    const base = Math.atan2(dz, dx);
    const count = this.mods.multishot;
    for (let i = 0; i < count; i++) {
      const spread = count === 1 ? 0 : (i - (count - 1) / 2) * 0.14;
      const a = base + spread;
      this.spawnProjectile(p.x, p.z, Math.cos(a) * GAME.BOLT_SPEED, Math.sin(a) * GAME.BOLT_SPEED, true, this.mods.damage, 0.85);
    }
    if (this.mods.echoEvery > 0 && this.shotCount % this.mods.echoEvery === 0) {
      for (const offset of [-0.3, 0.3]) this.spawnProjectile(p.x, p.z, Math.cos(base + offset) * GAME.BOLT_SPEED, Math.sin(base + offset) * GAME.BOLT_SPEED, true, this.mods.damage * 0.8, 0.85);
    }
    p.noise = clamp(p.noise + 1.7, 0, 100);
    this.emitSound(p.x, p.z, 5);
    this.audio.sfx("shoot");
    this.particles.burst(p.x + dx * 0.6, 0.7, p.z + dz * 0.6, COLORS.cyan, 3, 1.2, 0.4);
  }

  private firePulse() {
    const p = this.player;
    if (p.pulseCd > 0) return;
    p.pulseCd = this.mods.pulseCooldown;
    this.stats.pulses++;
    this.spawnPulse(p.x, p.z, this.mods.pulseRadius, GAME.PULSE_SPEED, COLORS.cyan, this.mods.pulseDamage, false);
    this.emitSound(p.x, p.z, 23);
    p.noise = clamp(p.noise + 22, 0, 100);
    this.audio.sfx("pulse");
    this.particles.burst(p.x, 0.4, p.z, COLORS.cyan, 16, 4, 1.2);
    this.shake = Math.max(this.shake, 0.2);
    if (this.tutorialStep === 0) this.tutorialStep = 1;
  }

  private throwDecoy() {
    const p = this.player;
    if (p.decoyCd > 0) return;
    p.decoyCd = this.mods.decoyCooldown;
    let dx = this.aimPoint.x - p.x, dz = this.aimPoint.z - p.z;
    const d = Math.hypot(dx, dz);
    if (d > 12) { dx *= 12 / d; dz *= 12 / d; }
    this.decoy.active = true;
    this.decoy.x = p.x + dx; this.decoy.z = p.z + dz;
    this.decoy.age = 0; this.decoy.pulseTimer = 0;
    this.decoy.group.visible = true;
    this.audio.sfx("decoy");
    this.spawnPulse(this.decoy.x, this.decoy.z, 7, 12, COLORS.amber, 0, false);
    this.emitSound(this.decoy.x, this.decoy.z, 28);
    if (this.tutorialStep === 2) this.tutorialStep = 3;
  }

  private updateDecoy(dt: number) {
    const d = this.decoy;
    if (!d.active) return;
    d.age += dt; d.pulseTimer -= dt;
    if (d.pulseTimer <= 0) {
      d.pulseTimer = 0.8;
      this.spawnPulse(d.x, d.z, 7, 11, COLORS.amber, 0, false);
      this.emitSound(d.x, d.z, 28);
      this.audio.sfx("decoy");
    }
    if (d.age >= 3.25) {
      this.spawnPulse(d.x, d.z, 8, 15, COLORS.amber, 2.2, false);
      this.particles.burst(d.x, 0.6, d.z, COLORS.amber, 28, 6, 4);
      d.active = false; d.group.visible = false;
      this.audio.sfx("crit");
    }
  }

  private spawnProjectile(x: number, z: number, vx: number, vz: number, friendly: boolean, damage: number, life: number) {
    const p = this.projectiles.find((it) => !it.active && (it.mesh.material as THREE.MeshBasicMaterial).color.getHex() === (friendly ? COLORS.cyanHot : COLORS.magenta));
    if (!p) return;
    p.active = true; p.x = x; p.z = z; p.vx = vx; p.vz = vz; p.friendly = friendly; p.damage = damage; p.life = life;
    p.mesh.visible = true; p.mesh.position.set(x, friendly ? 0.72 : 0.65, z);
  }

  private updateProjectiles(dt: number) {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      p.life -= dt;
      p.x += p.vx * dt; p.z += p.vz * dt;
      p.mesh.position.set(p.x, p.friendly ? 0.72 + Math.sin(this.time * 25) * 0.08 : 0.62, p.z);
      p.mesh.rotation.x += dt * 8; p.mesh.rotation.y += dt * 11;
      if ((Math.floor(this.time * 60) & 1) === 0) this.particles.trail(p.x, 0.7, p.z, p.friendly ? COLORS.cyan : COLORS.magenta);
      let hit = p.life <= 0 || p.x * p.x + p.z * p.z > (GAME.ARENA_RADIUS + 1) ** 2;
      if (!hit && p.friendly) {
        for (const e of this.enemies) {
          if (!e.active || e.state === "spawn") continue;
          if (distSq(p.x, p.z, e.x, e.z) < (p.radius + e.radius) ** 2) {
            const resonant = e.resonant > 0;
            const damage = resonant ? p.damage * 3.5 : p.damage * (e.kind === "conductor" ? 0.35 : 1);
            this.damageEnemy(e, damage, resonant);
            e.x += p.vx * 0.012; e.z += p.vz * 0.012;
            hit = true;
            break;
          }
        }
      } else if (!hit && !p.friendly && distSq(p.x, p.z, this.player.x, this.player.z) < (p.radius + GAME.PLAYER_RADIUS) ** 2) {
        this.hurtPlayer(p.damage, p.x, p.z); hit = true;
      }
      if (!hit) {
        for (const prop of this.props) if (distSq(p.x, p.z, prop.x, prop.z) < (prop.radius + p.radius) ** 2) { prop.reveal = 1; hit = true; break; }
      }
      if (hit) {
        p.active = false; p.mesh.visible = false;
        this.spawnPulse(p.x, p.z, 2.5, 10, p.friendly ? COLORS.cyan : COLORS.magenta, 0, false);
        if (p.friendly) this.emitSound(p.x, p.z, 7);
      }
    }
  }

  private spawnPulse(x: number, z: number, maxRadius: number, speed: number, color: number, damage: number, hostile: boolean) {
    const p = this.pulses.find((it) => !it.active);
    if (!p) return;
    p.active = true; p.x = x; p.z = z; p.age = 0; p.previousRadius = 0; p.radius = 0.05;
    p.maxRadius = maxRadius; p.speed = speed; p.damage = damage; p.hostile = hostile; p.hitPlayer = false; p.id = this.pulseId++;
    p.material.color.setHex(color); p.material.opacity = 0.9;
    p.mesh.visible = true; p.mesh.position.set(x, hostile ? 0.09 : 0.07, z); p.mesh.scale.setScalar(0.05);
  }

  private updatePulses(dt: number) {
    for (const p of this.pulses) {
      if (!p.active) continue;
      p.age += dt; p.previousRadius = p.radius; p.radius += p.speed * dt;
      p.mesh.scale.setScalar(p.radius);
      p.material.opacity = Math.max(0, 0.86 * (1 - p.radius / p.maxRadius));
      if (p.hostile && !p.hitPlayer) {
        const d = Math.sqrt(distSq(p.x, p.z, this.player.x, this.player.z));
        if (d + GAME.PLAYER_RADIUS >= p.previousRadius && d - GAME.PLAYER_RADIUS <= p.radius) {
          p.hitPlayer = true;
          if (this.player.hushed) {
            this.stats.score += 50;
            this.particles.burst(this.player.x, 0.7, this.player.z, COLORS.cyan, 8, 2, 2);
          } else if (this.mode === "playing") this.hurtPlayer(p.damage, p.x, p.z);
        }
      }
      if (!p.hostile) {
        for (const e of this.enemies) {
          if (!e.active || e.lastPulse === p.id || e.state === "spawn") continue;
          const d = Math.sqrt(distSq(p.x, p.z, e.x, e.z));
          if (d + e.radius >= p.previousRadius && d - e.radius <= p.radius) {
            e.lastPulse = p.id; e.reveal = 1;
            if (p.maxRadius > 3) e.resonant = this.mods.resonanceDuration;
            if (p.damage > 0 && this.mode === "playing") this.damageEnemy(e, p.damage, e.resonant > 0);
          }
        }
        for (const prop of this.props) {
          const d = Math.sqrt(distSq(p.x, p.z, prop.x, prop.z));
          if (d >= p.previousRadius - 1 && d <= p.radius + 1) prop.reveal = 1;
        }
      }
      if (p.radius >= p.maxRadius) { p.active = false; p.mesh.visible = false; }
    }
    for (const prop of this.props) prop.reveal = Math.max(0, prop.reveal - dt * 0.16);
  }

  private spawnHazard(x: number, z: number, radius: number, delay: number, damage: number) {
    const h = this.hazards.find((it) => !it.active);
    if (!h) return;
    h.active = true; h.x = x; h.z = z; h.radius = radius; h.delay = delay; h.damage = damage; h.age = 0;
    h.mesh.visible = true; h.mesh.position.set(x, 0.08, z); h.mesh.scale.setScalar(radius);
  }

  private updateHazards(dt: number) {
    for (const h of this.hazards) {
      if (!h.active) continue;
      const before = h.age; h.age += dt;
      h.material.opacity = h.age < h.delay ? 0.25 + Math.sin(h.age * 20) * 0.18 : Math.max(0, 0.9 - (h.age - h.delay) * 4);
      h.mesh.scale.setScalar(h.radius * (h.age < h.delay ? 0.94 + Math.sin(h.age * 12) * 0.06 : 1.12));
      if (before < h.delay && h.age >= h.delay) {
        this.particles.burst(h.x, 0.15, h.z, COLORS.red, 24, 6, 5);
        this.spawnPulse(h.x, h.z, h.radius * 1.4, 13, COLORS.red, 0, false);
        if (distSq(h.x, h.z, this.player.x, this.player.z) < (h.radius + GAME.PLAYER_RADIUS * 0.3) ** 2) this.hurtPlayer(h.damage, h.x, h.z);
        this.shake = Math.max(this.shake, 0.55);
      }
      if (h.age > h.delay + 0.3) { h.active = false; h.mesh.visible = false; }
    }
  }

  private emitSound(x: number, z: number, radius: number) {
    for (const e of this.enemies) {
      if (!e.active || e.state === "spawn") continue;
      const hearing = e.kind === "listener" ? 1.25 : e.kind === "choir" ? 1.1 : e.kind === "mute" ? 0.75 : 1;
      if (distSq(x, z, e.x, e.z) < (radius * hearing) ** 2) {
        e.targetX = x; e.targetZ = z; e.heard = Math.max(e.heard, 3.2); e.reveal = Math.max(e.reveal, 0.4);
      }
    }
  }

  private damageEnemy(e: Enemy, damage: number, resonant: boolean) {
    if (!e.active) return;
    e.hp -= damage; e.flash = 0.14; e.reveal = 1;
    this.audio.sfx(resonant ? "crit" : "hit");
    this.particles.burst(e.x, e.kind === "conductor" ? 1.8 : 0.7, e.z, resonant ? COLORS.cyanHot : COLORS.magenta, resonant ? 12 : 5, resonant ? 5 : 2.5, 3);
    if (resonant) this.shake = Math.max(this.shake, 0.22);
    if (e.hp <= 0) this.killEnemy(e, resonant, false);
  }

  private killEnemy(e: Enemy, resonant: boolean, selfDestruct: boolean) {
    if (!e.active) return;
    e.active = false; e.group.visible = false;
    if (!selfDestruct || e.kind !== "choir") {
      this.stats.kills++;
      this.combo = Math.min(9, this.combo + 1); this.comboTime = 3;
      this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo);
      if (resonant) this.stats.resonantKills++;
      this.stats.score += e.worth * Math.max(1, this.combo) * (resonant ? 1.5 : 1);
    }
    this.audio.sfx("kill");
    this.particles.burst(e.x, e.kind === "conductor" ? 2 : 0.75, e.z, resonant ? COLORS.cyan : COLORS.magenta, e.kind === "conductor" ? 80 : 24, e.kind === "conductor" ? 10 : 6, 5);
    if (resonant && e.kind !== "conductor") this.spawnPulse(e.x, e.z, this.mods.chainRadius, 17, COLORS.cyanHot, this.mods.chainDamage, false);
    this.shake = Math.max(this.shake, e.kind === "conductor" ? 1.4 : 0.38);
    if (e.kind === "conductor") {
      for (const other of this.enemies) if (other.active && other.kind !== "conductor") { other.active = false; other.group.visible = false; }
      this.pending = [];
      for (const p of this.projectiles) if (!p.friendly) { p.active = false; p.mesh.visible = false; }
      this.bossDefeatTimer = 1.8;
      this.ui.announce("FINAL NOTE", "PERFECT CRESCENDO", "THE SILENCE IS BREAKING.", 2.5);
      this.audio.sfx("win");
    }
  }

  private hurtPlayer(damage: number, fromX: number, fromZ: number) {
    const p = this.player;
    if (p.invuln > 0 || this.mode !== "playing") return;
    if (p.shield > 0) {
      p.shield--; p.invuln = 0.7;
      this.spawnPulse(p.x, p.z, 5, 16, COLORS.cyanHot, 1, false);
      this.audio.sfx("crit");
      return;
    }
    p.hp -= damage; p.invuln = 0.9; p.noise = clamp(p.noise + 14, 0, 100);
    this.stats.damageTaken += damage;
    this.combo = 0; this.comboTime = 0;
    const dx = p.x - fromX, dz = p.z - fromZ, len = Math.max(0.1, Math.hypot(dx, dz));
    p.x += dx / len * 0.8; p.z += dz / len * 0.8;
    this.constrain(p, GAME.PLAYER_RADIUS);
    this.ui.flashDamage(); this.audio.sfx("hurt");
    this.particles.burst(p.x, 0.7, p.z, COLORS.red, 20, 5, 4);
    this.shake = 0.9;
    if (p.hp <= 0) { p.hp = 0; this.endRun(false); }
  }

  private openUpgrades() {
    this.mode = "upgrade";
    this.audio.sfx("upgrade");
    this.upgradeOptions = this.rollUpgrades();
    this.ui.showUpgrades(this.upgradeOptions);
    this.ui.tutorial("");
  }

  private rollUpgrades(): Upgrade[] {
    const all: Upgrade[] = [
      { id: "bass", name: "SUBWOOFER HEART", kicker: "PULSE MUTATION", description: "+30% pulse radius. Your pulse now deals 1 damage on contact.", apply: () => { this.mods.pulseRadius *= 1.3; this.mods.pulseDamage += 1; } },
      { id: "feedback", name: "FEEDBACK LOOP", kicker: "TEMPO MUTATION", description: "Pulse recharges 22% faster. Resonance lasts 0.6s longer.", apply: () => { this.mods.pulseCooldown *= 0.78; this.mods.resonanceDuration += 0.6; } },
      { id: "choir", name: "MURDER BALLAD", kicker: "CHAIN MUTATION", description: "Resonant detonations grow +35% and deal +1 damage. Make the whole room sing.", apply: () => { this.mods.chainRadius *= 1.35; this.mods.chainDamage += 1; } },
      { id: "soft", name: "VELVET KNIFE", kicker: "HUSH MUTATION", description: "+35% Hushed movement speed. Noise fades 30% faster.", apply: () => { this.mods.hushSpeed *= 1.35; this.mods.noiseDecay *= 1.3; } },
      { id: "triple", name: "THREE-BODY PROBLEM", kicker: "WEAPON MUTATION", description: "Fire a three-note spread. Each note retains full critical damage.", apply: () => { this.mods.multishot = Math.min(5, this.mods.multishot + 2); } },
      { id: "tempo", name: "ILLEGAL TEMPO", kicker: "WEAPON MUTATION", description: "+25% fire rate and +10% movement speed. No permit required.", apply: () => { this.mods.fireInterval *= 0.75; this.mods.moveSpeed *= 1.1; } },
      { id: "echo", name: "AFTERTONE", kicker: "WEAPON MUTATION", description: "Every fourth shot releases two bonus echoes at 80% damage.", apply: () => { this.mods.echoEvery = 4; } },
      { id: "glass", name: "GLASS CANNON", kicker: "CURSED MUTATION", description: "+70% note damage. Lose 20 maximum Integrity. Extremely loud. Extremely rude.", apply: () => { this.mods.damage *= 1.7; this.player.maxHp = Math.max(40, this.player.maxHp - 20); this.player.hp = Math.min(this.player.hp, this.player.maxHp); } },
      { id: "heart", name: "SECOND HEARTBEAT", kicker: "BODY MUTATION", description: "+30 maximum Integrity and fully repair 45 Integrity.", apply: () => { this.player.maxHp += 30; this.player.hp = Math.min(this.player.maxHp, this.player.hp + 45); } },
      { id: "shield", name: "STATIC SHELL", kicker: "DEFENSE MUTATION", description: "Block one hit each Movement. Blocking releases a damaging counter-pulse.", apply: () => { this.mods.echoEvery = this.mods.echoEvery === 0 ? -1 : this.mods.echoEvery; this.player.shield = 1; } },
      { id: "misdirect", name: "BAD DIRECTIONS", kicker: "DECOY MUTATION", description: "Decoy recharges 35% faster. Its final burst deals +2 damage.", apply: () => { this.mods.decoyCooldown *= 0.65; this.mods.chainDamage += 0.5; } },
      { id: "long", name: "LONG GOODBYE", kicker: "RESONANCE MUTATION", description: "Resonance lasts 65% longer. +20% critical-note damage.", apply: () => { this.mods.resonanceDuration *= 1.65; this.mods.damage *= 1.2; } },
    ];
    const picked: Upgrade[] = [];
    while (picked.length < 3) {
      const u = this.rng.pick(all);
      if (!picked.includes(u)) picked.push(u);
    }
    return picked;
  }

  private chooseUpgrade(index: number) {
    if (this.mode !== "upgrade" || !this.upgradeOptions[index]) return;
    const u = this.upgradeOptions[index];
    u.apply();
    this.audio.sfx("upgrade");
    this.ui.announce("MUTATION INSTALLED", u.name, "NO REFUNDS. NO REGRETS.", 1.8);
    this.mode = "playing";
    this.beginWave(this.wave + 1);
  }

  private endRun(victory: boolean) {
    if (this.mode !== "playing") return;
    this.mode = victory ? "victory" : "gameover";
    if (victory) { this.save.wins++; this.stats.score += Math.max(0, 10000 - this.runTime * 20); }
    const finalScore = Math.floor(this.stats.score);
    this.isNewBest = finalScore > this.save.bestScore;
    if (this.isNewBest) this.save.bestScore = finalScore;
    this.writeSave();
    this.ui.showResult(victory, this.stats, this.isNewBest);
    this.ui.tutorial("");
    this.audio.stopMusic();
    if (!victory) this.audio.sfx("lose");
  }

  private updateTutorial() {
    if (this.wave !== 1 || this.runTime > 32) { this.ui.tutorial(""); return; }
    if (this.tutorialStep === 0) this.ui.tutorial(`<kbd>SPACE</kbd><span>PULSE TO REVEAL THE DARK</span><small>Warning: everything hears it.</small>`);
    else if (this.tutorialStep === 1 && this.stats.resonantKills === 0) this.ui.tutorial(`<kbd>LMB</kbd><span>SHOOT THE <cyan>CYAN</cyan> TARGETS</span><small>Resonant hits crit. Resonant kills explode.</small>`);
    else if (this.runTime > 10 && this.tutorialStep < 3) {
      this.tutorialStep = 2;
      this.ui.tutorial(`<kbd>RMB</kbd><span>THROW A DECOY INTO A CROWD</span><small>Hold <kbd>SHIFT</kbd> to Hush while they take the bait.</small>`);
    } else this.ui.tutorial("");
  }

  private updateUI(dt: number) {
    const boss = this.enemies.find((e) => e.active && e.kind === "conductor");
    this.ui.update(dt, {
      mode: this.mode, hp: this.player.hp, maxHp: this.player.maxHp, noise: this.player.noise,
      hushed: this.player.hushed, dampened: this.player.dampened, score: this.stats.score,
      combo: this.combo, comboTime: this.comboTime, wave: this.wave, enemies: this.pending.length + this.activeEnemyCount(),
      pulseCooldown: this.player.pulseCd, pulseMax: this.mods.pulseCooldown, decoyCooldown: this.player.decoyCd,
      decoyMax: this.mods.decoyCooldown, bossHp: boss?.hp ?? 0, bossMaxHp: boss?.maxHp ?? 0, shield: this.player.shield,
    });
  }

  private render() {
    const now = performance.now();
    const frameDt = Math.min(0.1, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    this.fpsTime += frameDt; this.fpsFrames++;
    if (this.fpsTime > 2) {
      this.fps = this.fpsFrames / this.fpsTime;
      if (this.fps < QUALITY.DEGRADE_FPS && !this.qualityReduced) {
        this.qualityReduced = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      }
      this.fpsTime = 0; this.fpsFrames = 0;
    }
    this.pointer.set(this.input.pointerX / window.innerWidth * 2 - 1, -(this.input.pointerY / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.raycaster.ray.intersectPlane(this.ground, this.aimPoint);
    this.animateVisuals(frameDt);
    this.renderer.render(this.scene, this.camera);
    window.__GAME_READY__ = true;
  }

  private animateVisuals(dt: number) {
    const p = this.player;
    this.playerVisual.position.set(p.x, 0.75 + Math.sin(this.time * 3.5) * 0.08, p.z);
    const adx = this.aimPoint.x - p.x, adz = this.aimPoint.z - p.z;
    if (Math.abs(adx) + Math.abs(adz) > 0.1) this.playerVisual.rotation.y = Math.atan2(adx, adz);
    const data = this.playerVisual.userData;
    data.core.rotation.y += dt * 1.5;
    data.ring.rotation.z += dt * 0.8;
    data.ring2.rotation.y += dt * 1.2;
    const fireSquash = p.fireCd > this.mods.fireInterval * 0.7 ? 0.88 : 1;
    this.playerVisual.scale.setScalar(damp(this.playerVisual.scale.x, fireSquash, 18, dt));
    data.shadow.scale.setScalar(1 + Math.sin(this.time * 3.5) * 0.08);
    this.playerVisual.visible = !(p.invuln > 0 && Math.floor(p.invuln * 16) % 2 === 0);

    for (const e of this.enemies) {
      if (!e.active) continue;
      const baseY = e.kind === "conductor" ? 1.5 : e.kind === "mimic" ? 0.85 : e.kind === "mute" ? 1 : e.kind === "choir" ? 0.52 : 0.66;
      e.group.position.set(e.x, baseY + Math.sin(this.time * 3 + e.seed) * (e.kind === "conductor" ? 0.16 : 0.08), e.z);
      if (Math.abs(e.vx) + Math.abs(e.vz) > 0.1) e.group.rotation.y = Math.atan2(e.vx, e.vz);
      else if (e.kind !== "conductor") e.group.rotation.y += dt * (e.kind === "mimic" ? 0.45 : 0.15);
      if (e.kind === "conductor") {
        for (let i = 0; i < e.group.children.length; i++) if (i > 2) e.group.children[i].rotation.z += dt * (0.2 + i * 0.06);
      } else if (e.kind === "mute" || e.kind === "choir") e.group.rotation.y += dt * 0.7;
      const close = distSq(e.x, e.z, p.x, p.z) < 16 ? 0.2 : 0;
      const visibility = clamp(Math.max(e.reveal, close, e.resonant > 0 ? 0.85 : 0, e.kind === "conductor" ? 0.2 : 0), 0, 1);
      e.body.opacity = 0.035 + visibility * 0.78;
      e.accent.opacity = 0.04 + visibility * 0.92;
      e.body.emissiveIntensity = 0.18 + visibility * 1.5 + e.flash * 9;
      if (e.resonant > 0) e.accent.color.setHex(COLORS.cyan);
      else e.accent.color.setHex(e.kind === "listener" ? COLORS.magenta : e.kind === "mimic" ? COLORS.violet : e.kind === "mute" ? 0x7050b8 : e.kind === "choir" ? COLORS.amber : COLORS.red);
      const spawnScale = e.state === "spawn" ? clamp(1 - e.stateTime / (e.kind === "conductor" ? 1.8 : 0.7), 0.02, 1) : 1;
      const telegraph = e.state === "windup" ? 1 + Math.sin(this.time * 35) * 0.16 : 1;
      const base = e.kind === "conductor" ? 1.08 : 1;
      e.group.scale.setScalar(base * spawnScale * telegraph * (1 + e.flash * 0.6));
    }
    for (const prop of this.props) {
      const near = distSq(prop.x, prop.z, p.x, p.z) < 12 ? 0.18 : 0;
      const v = Math.max(prop.reveal, near);
      for (const mat of prop.materials) { mat.opacity = 0.035 + v * 0.72; mat.emissiveIntensity = 0.06 + v * 1.15; }
      prop.group.rotation.y += dt * 0.015;
    }
    if (this.decoy.active) {
      this.decoy.group.position.set(this.decoy.x, 0.7 + Math.sin(this.time * 9) * 0.18, this.decoy.z);
      this.decoy.group.rotation.y += dt * 3;
      this.decoy.group.scale.setScalar(1 + Math.sin(this.time * 12) * 0.12);
    }
    const titleOffset = this.mode === "title" ? 0 : 0;
    this.cameraTarget.x = damp(this.cameraTarget.x, p.x * 0.72, 4, dt);
    this.cameraTarget.z = damp(this.cameraTarget.z, p.z * 0.72 + titleOffset, 4, dt);
    this.shake = Math.max(0, this.shake - dt * 2.4);
    const s = this.shake * this.shake;
    const sx = Math.sin(this.time * 67) * s * 0.35, sz = Math.cos(this.time * 59) * s * 0.35;
    this.camera.position.set(this.cameraTarget.x + sx, 23 + s * 0.2, this.cameraTarget.z + 15 + sz);
    this.camera.lookAt(this.cameraTarget.x, 0.2, this.cameraTarget.z - 1.8);
    this.camera.updateMatrixWorld();
  }

  private constrain(entity: { x: number; z: number }, radius: number) {
    const d = Math.hypot(entity.x, entity.z);
    const max = GAME.ARENA_RADIUS - radius;
    if (d > max) { entity.x *= max / d; entity.z *= max / d; }
    for (const prop of this.props) {
      const dx = entity.x - prop.x, dz = entity.z - prop.z;
      const dist = Math.hypot(dx, dz), min = radius + prop.radius;
      if (dist < min && dist > 0.001) { entity.x = prop.x + dx / dist * min; entity.z = prop.z + dz / dist * min; }
    }
  }

  private separateEnemies() {
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i]; if (!a.active || a.state === "spawn") continue;
      for (let j = i + 1; j < this.enemies.length; j++) {
        const b = this.enemies[j]; if (!b.active || b.state === "spawn") continue;
        const dx = b.x - a.x, dz = b.z - a.z, min = (a.radius + b.radius) * 0.75;
        const ds = dx * dx + dz * dz;
        if (ds > 0.001 && ds < min * min) {
          const d = Math.sqrt(ds), push = (min - d) * 0.18;
          a.x -= dx / d * push; a.z -= dz / d * push;
          b.x += dx / d * push; b.z += dz / d * push;
        }
      }
    }
  }

  private activeEnemyCount() { let n = 0; for (const e of this.enemies) if (e.active) n++; return n; }
  private nearestEnemy(x: number, z: number) {
    let best: Enemy | null = null, bestD = Infinity;
    for (const e of this.enemies) if (e.active && e.state !== "spawn") { const d = distSq(x, z, e.x, e.z); if (d < bestD) { bestD = d; best = e; } }
    return best;
  }

  private loadSave(): SaveData {
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null");
      if (parsed?.version === 1 && Number.isFinite(parsed.bestScore) && Number.isFinite(parsed.wins) && Number.isFinite(parsed.runs)) return parsed;
    } catch { /* fall through */ }
    return { version: 1, bestScore: 0, wins: 0, runs: 0 };
  }

  private writeSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); } catch { /* session-only */ } }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
  };

  private onVisibility = () => { if (document.hidden && this.mode === "playing") this.pause(); };

  getProbe() { return { x: this.player.x, y: 0.75, z: this.player.z }; }
  getSnapshot() {
    return { mode: this.mode, wave: this.wave, enemies: this.activeEnemyCount(), pending: this.pending.length, hp: this.player.hp, score: this.stats.score, fps: this.fps, drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, stats: { ...this.stats }, time: formatTime(this.runTime) };
  }
  testClearWave() {
    this.pending = [];
    for (const e of this.enemies) if (e.active && e.kind !== "conductor") { e.hp = 0; this.killEnemy(e, true, false); }
    if (this.wave === 5) { const boss = this.enemies.find((e) => e.active && e.kind === "conductor"); if (boss) this.damageEnemy(boss, 9999, true); }
  }
  testDamage(amount: number) { this.player.invuln = 0; this.hurtPlayer(amount, this.player.x + 1, this.player.z); }
  testBoss() { this.clearEntities(); this.mode = "playing"; this.player.hp = this.player.maxHp; this.beginWave(5); }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.loop.stop();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.input.dispose(); this.audio.dispose(); this.ui.dispose(); this.particles.dispose();
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points || obj instanceof THREE.LineSegments) {
        geometries.add(obj.geometry);
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) materials.add(m);
      }
    });
    geometries.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose());
    this.renderer.dispose();
  }
}



/* QUARANTINED LEGACY BLOCK
      drone.position['set'](p.pos.x + Math.cos(angle) * 1.35, 1.8 + Math.sin(angle * 2) * 0.15, p.pos.z + Math.sin(angle) * 1.35);
      const target = this.nearestEnemy(drone.position, 13);
      if (target) drone.lookAt(target.pos.x, 1.2, target.pos.z);
    }
    this.droneTimer -= dt;
    if (this.droneTimer <= 0 && p.stats.drones > 0) {
      this.droneTimer = 0.68 / p.stats.drones;
      const drone = this.droneMeshes[Math.floor(this.rng() * p.stats.drones)];
      const target = this.nearestEnemy(drone.position, 13);
      if (target) {
        this.scratch.copy(target.pos).sub(drone.position).setY(0).normalize();
        this.spawnProjectile(this.playerShots, drone.position.x, drone.position.y, drone.position.z, this.scratch.x * 15, this.scratch.z * 15, 7 + p.stats.damage * 0.28, 0, p.stats.burn);
      }
    }
  }

  private nearestEnemy(origin: THREE.Vector3, range: number): Enemy | null {
    let nearest: Enemy | null = null;
    let best = range * range;
    for (const enemy of this.enemies) {
      if (enemy.dead || enemy.phase === -1) continue;
      const distance = enemy.pos.distanceToSquared(origin);
      if (distance < best) { best = distance; nearest = enemy; }
    }
    return nearest;
  }

  private checkWaveClear(dt: number): void {
    const def = WAVES[this.wave - 1];
    if (!this.clearing && this.spawned >= def.quota && this.enemies.every((enemy) => enemy.dead)) {
      this.clearing = true;
      this.clearTimer = 1.6;
      this.player.score += this.wave * 500;
      this.player.coupons += 3;
      this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + 10);
      this.toast("AISLE CLEARED", `+${this.wave * 500} shift bonus • 10 integrity repaired`);
    }
    if (this.clearing) {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) {
        this.clearing = false;
        if (this.wave >= WAVES.length) this.endRun(true);
        else this.showUpgrade();
      }
    }
  }

  private showUpgrade(): void {
    const available = UPGRADES.filter((upgrade) => (this.upgrades.get(upgrade.id) ?? 0) < upgrade.max);
    this.offeredUpgrades = [];
    while (this.offeredUpgrades.length < 3 && available.length) {
      const index = Math.floor(this.rng() * available.length);
      this.offeredUpgrades.push(available.splice(index, 1)[0]);
    }
    this.ui.showUpgrades(this.offeredUpgrades, this.upgrades);
    this.setMode("upgrade");
  }

  private chooseUpgrade(id: string): void {
    const upgrade = UPGRADES.find((item) => item.id === id);
    if (!upgrade) return;
    this.upgrades.set(id, (this.upgrades.get(id) ?? 0) + 1);
    upgrade.apply(this.player);
    this.audio.sfx("upgrade");
    this.toast(upgrade.name, upgrade.description);
    this.beginWave(this.wave + 1);
  }

  private tryInteract(): void {
    if (this.mode !== "playing") return;
    if (this.player.pos.distanceTo(this.world.vending.position) > 3) return;
    if (this.player.coupons < 12) {
      this.toast("INSUFFICIENT CAPITALISM", "The machine requires 12 coupons. It does not accept emotions.");
      return;
    }
    const available = UPGRADES.filter((upgrade) => (this.upgrades.get(upgrade.id) ?? 0) < upgrade.max);
    if (!available.length) { this.toast("MAXIMUM CURSE", "The machine has nothing left to teach you."); return; }
    this.player.coupons -= 12;
    this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + 25);
    const upgrade = available[Math.floor(this.rng() * available.length)];
    this.upgrades.set(upgrade.id, (this.upgrades.get(upgrade.id) ?? 0) + 1);
    upgrade.apply(this.player);
    this.ui.updateBuild(this.upgrades);
    this.audio.sfx("buy");
    this.toast(`VENDED: ${upgrade.name}`, `${upgrade.description} +25 integrity repaired.`);
  }

  private registerScannerDash(): void {
    if (this.bananaActive) return;
    this.secretDashes++;
    if (this.secretDashes < 3) {
      this.toast(`SUSPICIOUS ACTIVITY ${this.secretDashes} / 3`, "The checkout scanner is beginning to respect you.");
      this.audio.sfx("pickup");
    } else {
      this.secretDashes = 0;
      this.spawnPickup(new THREE.Vector3(0, 0, 14.5), 1, true);
      this.toast("AN ITEM APPROACHES", "Something potassium-rich has rolled out of checkout.");
      this.audio.sfx("secret");
    }
  }

  private toast(title: string, text: string): void {
    this.ui.toast(title, text);
    this.toastTimer = 3.2;
  }

  private endRun(victory: boolean): void {
    if (this.ended) return;
    this.ended = true;
    this.pointerDown = false;
    const newBest = this.player.score > this.save.highScore;
    this.save.highScore = Math.max(this.save.highScore, Math.floor(this.player.score));
    this.save.runs++;
    if (victory) { this.save.wins++; this.save.nightmareUnlocked = true; }
    storage.set(SAVE_KEY, this.save);
    this.ui.showEnd(victory, this.player, this.wave, newBest);
    this.ui.hideBanner();
    this.setMode(victory ? "victory" : "gameover");
    this.audio.sfx(victory ? "win" : "lose");
  }

  get playerPosition(): THREE.Vector3 {
    return this.player.pos;
  }

  private getBoss(): Enemy | undefined {
    return this.enemies.find((enemy) => !enemy.dead && (enemy.kind === "fridge" || enemy.kind === "manager"));
  }

  private applyQuality(quality: Quality, persist = true): void {
    this.quality = quality;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, quality === "high" ? 1.6 : 1));
    this.renderer.shadowMap.enabled = quality === "high";
    this.ui.setQuality(quality);
    if (persist) {
      this.autoQuality = false;
      this.save.quality = quality;
      storage.set(SAVE_KEY, this.save);
    }
    this.resize();
  }


  private render(): void {
    const p = this.player;
    if (this.mode === "title" || this.mode === "help") {
      const time = performance.now() / 1000;
      this.camera.position.set(10 + Math.sin(time * 0.13) * 2, 9.5, 16 + Math.cos(time * 0.13) * 2);
      this.camera.lookAt(0, 1.1, 1);
    } else {
      this.cameraTarget.copy(p.pos).addScaledVector(p.aim, 1.25);
      const desiredX = this.cameraTarget.x;
      const desiredZ = this.cameraTarget.z + 13.5;
      this.camera.position.x += (desiredX - this.camera.position.x) * 0.085;
      this.camera.position.y += (16.2 - this.camera.position.y) * 0.085;
      this.camera.position.z += (desiredZ - this.camera.position.z) * 0.085;
      if (this.shake > 0) {
        this.shake = Math.max(0, this.shake - 0.025);
        const time = performance.now() * 0.06;
        this.camera.position.x += Math.sin(time * 1.7) * this.shake * 0.24;
        this.camera.position.y += Math.cos(time * 2.1) * this.shake * 0.18;
      }
      this.camera.lookAt(this.cameraTarget.x, 0.4, this.cameraTarget.z - 1.2);
    }
    this.updateInstances(this.shotMesh, this.playerShots, 1);
    this.updateInstances(this.enemyShotMesh, this.enemyShotMesh.count ? this.enemyShots : this.enemyShots, 1.15);
    this.renderPickups();
    this.renderParticles();
    const def = WAVES[this.wave - 1];
    const alive = this.enemies.reduce((sum, enemy) => sum + (!enemy.dead ? 1 : 0), 0);
    this.ui.update(p, this.wave, Math.max(0, def.quota - this.spawned + alive), this.getBoss(), this.elapsed);
    this.renderer.render(this.scene, this.camera);
    window.__GAME_READY__ = true;
  }

  private updateInstances(mesh: THREE.InstancedMesh, pool: Projectile[], scale: number): void {
    for (let i = 0; i < pool.length; i++) {
      const shot = pool[i];
      this.dummy.position.copy(shot.pos);
      this.dummy.rotation.set(this.elapsed * 5, this.elapsed * 7, 0);
      this.dummy.scale.setScalar(shot.active ? scale : 0);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(i, this.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  private renderPickups(): void {
    for (let i = 0; i < this.pickups.length; i++) {
      const pickup = this.pickups[i];
      this.dummy.position.set(pickup.pos.x, 0.45 + Math.sin(this.elapsed * 5 + i) * 0.13, pickup.pos.z);
      this.dummy.rotation.set(0, this.elapsed * 2 + i, 0);
      this.dummy.scale.setScalar(pickup.active ? (pickup.banana ? 2.4 : 1) : 0);
      this.dummy.updateMatrix();
      this.pickupMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.pickupMesh.instanceMatrix.needsUpdate = true;
  }

  private renderParticles(): void {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      this.dummy.position.copy(particle.pos);
      this.dummy.rotation.set(this.elapsed * 3 + i, this.elapsed * 4, 0);
      const life = particle.maxLife > 0 ? particle.life / particle.maxLife : 0;
      this.dummy.scale.setScalar(particle.active ? particle.size * Math.min(1, life * 2) : 0);
      this.dummy.updateMatrix();
      this.particleMesh.setMatrixAt(i, this.dummy.matrix);
      this.particleMesh.setColorAt(i, particle.color);
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (this.particleMesh.instanceColor) this.particleMesh.instanceColor.needsUpdate = true;
  }

  private resize(): void {
    const width = this.canvas.clientWidth || innerWidth;
    const height = this.canvas.clientHeight || innerHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private installDebug(): void {
    if (!new URLSearchParams(location.search).has("debug")) return;
    const debug = {
      snapshot: () => ({
        mode: this.mode, wave: this.wave, hp: this.player.hp, maxHp: this.player.stats.maxHp,
        score: this.player.score, coupons: this.player.coupons, enemies: this.enemies.length,
        enemyShots: this.enemyShots.filter((shot) => shot.active).length,
        playerShots: this.playerShots.filter((shot) => shot.active).length,
        particles: this.particles.filter((particle) => particle.active).length,
        drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles,
        fps: this.fps, quality: this.quality, banana: this.bananaActive,
        upgrades: Object.fromEntries(this.upgrades), save: this.save,
        renderer: this.renderer.getContext().getParameter(this.renderer.getContext().RENDERER),
      }),
      start: () => this.startRun(),
      pause: () => this.pause(),
      resume: () => this.resume(),
      win: () => this.endRun(true),
      lose: () => { this.player.invulnerable = 0; this.hurtPlayer(99999); },
      clearWave: () => {
        this.spawned = WAVES[this.wave - 1].quota;
        for (const enemy of this.enemies) this.killEnemy(enemy, true);
      },
      upgrade: () => this.showUpgrade(),
      busy: () => {
        this.startRun();
        this.clearWorldEntities();
        this.beginWave(6);
        const kinds: EnemyKind[] = ["pea", "lemon", "milk", "baguette", "auditor"];
        for (let i = 0; i < 34; i++) this.spawnEnemy(kinds[i % kinds.length], this.randomNear(new THREE.Vector3(), 8 + this.rng() * 10));
        this.bannerTimer = 0;
        this.ui.hideBanner();
      },
      boss: (kind: "fridge" | "manager") => {
        this.startRun();
        this.clearWorldEntities();
        this.beginWave(kind === "fridge" ? 3 : 7);
        this.spawnEnemy(kind, new THREE.Vector3(0, 0, -6));
        this.spawned = 1;
        this.bannerTimer = 0;
        this.ui.hideBanner();
      },
      secret: () => { this.bananaActive = false; this.secretDashes = 2; this.registerScannerDash(); },
      vending: () => { this.player.coupons = 50; this.player.pos.copy(this.world.vending.position).add(new THREE.Vector3(1.5, 0, 0)); },
      scream: () => { this.player.scream = 100; },
      hurt: (amount = 20) => { this.player.invulnerable = 0; this.hurtPlayer(amount); },
      quality: (quality: Quality) => this.applyQuality(quality),
    };
    (window as unknown as { __souperDebug?: typeof debug }).__souperDebug = debug;
  }

  dispose(): void {
    this.loop.stop();
    this.resizeObserver.disconnect();
    for (const off of this.cleanup) off();
    this.input.dispose();
    this.audio.dispose();
    this.ui.dispose();
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
          material.dispose();
        }
      }
    });
    this.renderer.dispose();
    delete (window as unknown as { __souperDebug?: unknown }).__souperDebug;
  }
}
END QUARANTINE */
