import * as THREE from "three";
import { GameLoop } from "./engine";
import { Input } from "./input";
import { AudioSystem } from "./audio";
import { storage } from "./storage";
import { CFG, PARTY_LINES, UPGRADES, WAVES, type UpgradeId, type UpgradeSpec } from "./content";
import {
  createArena, createCake, createCandy, createChargeTelegraph, createGuest, createLaneTelegraph,
  createPlayer, createTelegraphRing, disposeModelCaches,
  type ArenaModel, type CandyModel, type GuestKind, type GuestModel, type PlayerModel,
} from "./models";
import { ConfettiParticles } from "./particles";

type Mode = "title" | "playing" | "paused" | "upgrade" | "gameover" | "victory";

interface Guest {
  model: GuestModel;
  active: boolean;
  kind: GuestKind;
  state: "chase" | "rush" | "stunned" | "conga" | "windup" | "charge" | "recover";
  vel: THREE.Vector3;
  chargeDir: THREE.Vector3;
  attackTarget: THREE.Vector3;
  timer: number;
  cooldown: number;
  retarget: number;
  hitCooldown: number;
  phase: number;
  speed: number;
  radius: number;
  targetCandy: Candy | null;
  laneDirection: number;
}

interface Candy {
  model: CandyModel;
  active: boolean;
  value: number;
  bait: boolean;
  vel: THREE.Vector3;
  vertical: number;
  life: number;
  age: number;
  phase: number;
}

type UpgradeLevels = Record<UpgradeId, number>;

const ZERO_UPGRADES = (): UpgradeLevels => ({
  speed: 0, candy: 0, shield: 0, decoy: 0, dash: 0, sour: 0,
  bank: 0, knockback: 0, magnet: 0, combo: 0, regen: 0, gifts: 0,
});

function byId<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function angleLerp(current: number, target: number, amount: number): number {
  let delta = (target - current + Math.PI) % (Math.PI * 2) - Math.PI;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * amount;
}

export interface GameStats {
  fps: number;
  calls: number;
  triangles: number;
  guests: number;
  candies: number;
  particles: number;
  renderer: string;
}

export class PinataGame {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
  private readonly input: Input;
  private readonly audio = new AudioSystem();
  private readonly loop: GameLoop;
  private readonly arena: ArenaModel;
  private readonly playerModel: PlayerModel;
  private readonly particles = new ConfettiParticles();
  private readonly guests: Guest[] = [];
  private readonly candies: Candy[] = [];
  private readonly cake: Guest;
  private readonly boss: Guest;
  private readonly bossRing = createTelegraphRing(3.1, 0xff386e);
  private readonly laneTelegraph = createLaneTelegraph();
  private readonly chargeTelegraph = createChargeTelegraph();
  private readonly aimReticle = createTelegraphRing(0.48, 0xffffff);
  private readonly raycaster = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly pointerNdc = new THREE.Vector2();
  private readonly aimPoint = new THREE.Vector3();
  private readonly cameraLook = new THREE.Vector3();
  private readonly cameraDesired = new THREE.Vector3();
  private readonly temp = new THREE.Vector3();
  private readonly playerVelocity = new THREE.Vector3();
  private readonly dashDirection = new THREE.Vector3(0, 0, -1);
  private readonly uiRoot: HTMLElement;

  private mode: Mode = "title";
  private elapsed = 0;
  private runTime = 0;
  private waveIndex = 0;
  private waveTime = 0;
  private score = 0;
  private best = Math.max(0, Number(storage.get("pinata.best", 0)) || 0);
  private carried: number = CFG.startingCandy;
  private bankedWave = 0;
  private totalBanked = 0;
  private bankProgress = 0;
  private bankStreak = 0;
  private dashTimer = 0;
  private dashCooldown = 0;
  private invulnerable = 0;
  private shield = 0;
  private freezeTimer = 0;
  private trauma = 0;
  private bannerTimer = 0;
  private uiTimer = 0;
  private guestSpawnTimer = 0;
  private candySpawnTimer = 0;
  private regenTimer = 0;
  private idleTimer = 0;
  private musicalTimer = 8;
  private musicalWarned = false;
  private congaTimer = 6;
  private congaWarned = false;
  private nextCongaZ = 0;
  private currentUpgrades: UpgradeSpec[] = [];
  private upgrades = ZERO_UPGRADES();
  private stats = { thrown: 0, rushed: 0, dashes: 0, hits: 0, gifts: 0 };
  private seed = 1;
  private rngState = 1;
  private reducedMotion = storage.get("pinata.reducedMotion", false);
  private fps = 60;
  private fpsFrames = 0;
  private fpsStarted = performance.now();
  private gpuRenderer = "unknown";
  private disposed = false;

  private readonly onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly onVisibility = () => {
    if (document.hidden && this.mode === "playing") this.pause();
  };

  private readonly onUiClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const upgrade = target.closest<HTMLElement>("[data-upgrade]");
    if (upgrade && this.mode === "upgrade") {
      this.chooseUpgrade(upgrade.dataset.upgrade as UpgradeId);
      return;
    }
    const button = target.closest<HTMLElement>("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    this.audio.sfx("ui");
    if (action === "start" && this.mode === "title") this.startRun();
    else if (action === "resume" && this.mode === "paused") this.resume();
    else if (action === "restart" && this.mode !== "title") this.startRun();
    else if (action === "title") this.goToTitle();
    else if (action === "mute") this.updateSoundButton(this.audio.toggleMute());
    else if (action === "motion") {
      this.reducedMotion = !this.reducedMotion;
      storage.set("pinata.reducedMotion", this.reducedMotion);
      byId("motion-button").textContent = this.reducedMotion ? "≈ SHAKE OFF" : "≈ SHAKE ON";
    }
  };

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.13;
    this.scene.background = new THREE.Color(0xd895bd);
    this.scene.fog = new THREE.Fog(0xd895bd, 31, 58);

    const hemi = new THREE.HemisphereLight(0xfff5e5, 0x7d4b8d, 2.1);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2d6, 3.0);
    sun.position.set(-8, 17, 11);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xa58cff, 1.1);
    fill.position.set(12, 8, -8);
    this.scene.add(fill);

    this.arena = createArena();
    this.scene.add(this.arena.group);
    this.playerModel = createPlayer();
    this.scene.add(this.playerModel.group);
    this.scene.add(this.particles.points);

    const guestColors = [0x5ac8f2, 0x8b6ce8, 0xff8a5c, 0x55cda6, 0xf065a2];
    for (let i = 0; i < CFG.maxGuests; i++) {
      const model = createGuest(guestColors[i % guestColors.length]);
      model.group.visible = false;
      this.scene.add(model.group);
      this.guests.push(this.makeGuest(model, "guest", i));
    }
    const cakeModel = createCake();
    cakeModel.group.visible = false;
    this.scene.add(cakeModel.group);
    this.cake = this.makeGuest(cakeModel, "cake", 101);
    this.cake.radius = 1.15;
    const bossModel = createGuest(0xff4f91);
    bossModel.group.scale.setScalar(1.72);
    bossModel.group.visible = false;
    (bossModel.hat.material as THREE.MeshStandardMaterial).color.setHex(0x6e50d8);
    this.scene.add(bossModel.group);
    this.boss = this.makeGuest(bossModel, "boss", 102);
    this.boss.radius = 1.05;

    for (let i = 0; i < CFG.maxCandies; i++) {
      const model = createCandy();
      model.group.visible = false;
      this.scene.add(model.group);
      this.candies.push({ model, active: false, value: 1, bait: false, vel: new THREE.Vector3(), vertical: 0, life: 0, age: 0, phase: i * 0.71 });
    }

    this.scene.add(this.bossRing, this.laneTelegraph, this.chargeTelegraph, this.aimReticle);
    this.input = new Input(canvas);
    this.uiRoot = byId("game-root");
    this.uiRoot.addEventListener("click", this.onUiClick);
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.onResize();
    this.readGpuRenderer();
    this.updateSoundButton(this.audio.muted);
    byId("motion-button").textContent = this.reducedMotion ? "≈ SHAKE OFF" : "≈ SHAKE ON";

    this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.render() });
    this.goToTitle();
    this.loop.start();
  }

  private makeGuest(model: GuestModel, kind: GuestKind, phase: number): Guest {
    return {
      model, active: false, kind, state: "chase", vel: new THREE.Vector3(),
      chargeDir: new THREE.Vector3(), attackTarget: new THREE.Vector3(), timer: 0,
      cooldown: 0, retarget: 0, hitCooldown: 0, phase, speed: 2.4, radius: 0.55,
      targetCandy: null, laneDirection: 1,
    };
  }

  private readGpuRenderer(): void {
    const gl = this.renderer.getContext();
    const extension = gl.getExtension("WEBGL_debug_renderer_info");
    this.gpuRenderer = extension ? String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  }

  private random(): number {
    this.rngState |= 0;
    this.rngState = (this.rngState + 0x6d2b79f5) | 0;
    let t = this.rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private range(min: number, max: number): number {
    return min + (max - min) * this.random();
  }

  private setScreen(id: string | null): void {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
    if (id) byId(id).classList.add("active");
  }

  private updateSoundButton(muted: boolean): void {
    byId("mute-button").textContent = muted ? "♫ SOUND OFF" : "♫ SOUND ON";
  }

  private goToTitle(): void {
    this.mode = "title";
    this.audio.stopMusic();
    this.clearEntities();
    this.setScreen("title-screen");
    byId("hud").classList.add("hidden");
    byId("title-best").textContent = this.formatScore(this.best);
    this.playerModel.group.visible = true;
    this.playerModel.group.position.set(3.8, 0, 2.6);
    this.playerModel.group.rotation.y = Math.PI - 0.3;
    this.playerModel.body.scale.set(1, 1, 1);
    this.bossRing.visible = false;
    this.laneTelegraph.visible = false;
    this.chargeTelegraph.visible = false;
    this.aimReticle.visible = false;
    this.camera.position.set(0, 11.5, 17.5);
    this.cameraLook.set(0, 0.5, 0);
    this.camera.lookAt(this.cameraLook);
  }

  private startRun(): void {
    const querySeed = Number(new URLSearchParams(window.location.search).get("seed"));
    this.seed = Number.isFinite(querySeed) && querySeed !== 0 ? querySeed : (Date.now() & 0x7fffffff);
    this.rngState = this.seed;
    this.score = 0;
    this.carried = CFG.startingCandy;
    this.totalBanked = 0;
    this.runTime = 0;
    this.upgrades = ZERO_UPGRADES();
    this.stats = { thrown: 0, rushed: 0, dashes: 0, hits: 0, gifts: 0 };
    this.bankStreak = 0;
    this.dashCooldown = 0;
    this.dashTimer = 0;
    this.regenTimer = 0;
    this.idleTimer = 0;
    this.playerVelocity.set(0, 0, 0);
    this.playerModel.group.position.set(0, 0, 4.5);
    this.playerModel.group.rotation.y = 0;
    this.playerModel.group.visible = true;
    byId("hud").classList.remove("hidden");
    this.setScreen(null);
    this.audio.startMusic();
    this.startWave(0);
    this.canvas.focus();
  }

  private clearEntities(): void {
    for (const guest of this.guests) this.deactivateGuest(guest);
    for (const candy of this.candies) this.deactivateCandy(candy);
    this.deactivateGuest(this.cake);
    this.deactivateGuest(this.boss);
  }

  private startWave(index: number): void {
    this.mode = "playing";
    this.waveIndex = index;
    this.clearEntities();
    this.setScreen(null);
    byId("hud").classList.remove("hidden");
    const wave = WAVES[index];
    this.waveTime = wave.seconds;
    this.bankedWave = 0;
    this.bankProgress = 0;
    this.bankStreak = this.upgrades.combo ? 8 : 0;
    this.invulnerable = 1.5;
    this.shield = this.upgrades.shield > 0 ? 1 : 0;
    this.guestSpawnTimer = 2;
    this.candySpawnTimer = 1;
    this.musicalTimer = 8;
    this.musicalWarned = false;
    this.congaTimer = 5;
    this.congaWarned = false;
    this.nextCongaZ = this.range(-5, 6);
    this.freezeTimer = 0;
    this.regenTimer = 0;
    this.bossRing.visible = false;
    this.laneTelegraph.visible = false;
    this.chargeTelegraph.visible = false;
    this.playerModel.group.position.set(0, 0, 4.5);
    this.playerVelocity.set(0, 0, 0);
    if (index > 0) this.carried += 8 + this.upgrades.candy * 4;

    for (const gift of this.arena.gifts) {
      gift.active = true;
      gift.respawn = 0;
      gift.group.visible = true;
      gift.group.scale.setScalar(1);
    }
    for (const chair of this.arena.chairs) chair.ring.visible = false;
    for (let i = 0; i < 26; i++) this.spawnCandy(this.range(-11, 11), this.range(-6.5, 8), 1, false);
    const successTax = Math.min(3, Math.floor(this.totalBanked / 45));
    for (let i = 0; i < wave.guests + successTax; i++) this.spawnGuest("guest");
    if (index === 3) this.activateSpecial(this.cake, 0, -2.5);
    if (index === 4) this.activateSpecial(this.boss, 0, -2.5);

    this.setBanner(wave.kicker + (successTax ? ` SUCCESS TAX: +${successTax} GUESTS.` : ""), 3.8);
    this.audio.sfx("wave");
    this.updateWaveUi();
    this.updateHud(true);
  }

  private activateSpecial(guest: Guest, x: number, z: number): void {
    guest.active = true;
    guest.state = "chase";
    guest.timer = 0;
    guest.cooldown = guest.kind === "cake" ? 3.5 : 4.5;
    guest.hitCooldown = 0;
    guest.vel.set(0, 0, 0);
    guest.model.group.position.set(x, 0, z);
    guest.model.group.visible = true;
  }

  private spawnGuest(kind: GuestKind, x?: number, z?: number): Guest | null {
    const guest = this.guests.find((item) => !item.active);
    if (!guest) return null;
    guest.active = true;
    guest.kind = kind;
    guest.state = kind === "conga" ? "conga" : "chase";
    guest.timer = 0;
    guest.cooldown = 0;
    guest.retarget = this.range(0, 0.2);
    guest.hitCooldown = 0;
    guest.targetCandy = null;
    guest.vel.set(0, 0, 0);
    guest.speed = 2.25 + this.waveIndex * 0.17 + this.range(-0.12, 0.18);
    const edge = Math.floor(this.range(0, 4));
    let px = x ?? 0;
    let pz = z ?? 0;
    if (x === undefined || z === undefined) {
      if (edge < 2) {
        px = edge === 0 ? -12.2 : 12.2;
        pz = this.range(-7, 8);
      } else {
        px = this.range(-11, 11);
        pz = edge === 2 ? -8.8 : 9;
      }
      if (Math.hypot(px - this.playerModel.group.position.x, pz - this.playerModel.group.position.z) < 6) pz = -pz;
    }
    guest.model.group.position.set(px, 0, pz);
    guest.model.group.rotation.y = 0;
    guest.model.group.scale.setScalar(kind === "conga" ? 0.9 : 1);
    guest.model.group.visible = true;
    guest.model.body.visible = true;
    (guest.model.hat.material as THREE.MeshStandardMaterial).color.setHex(kind === "conga" ? 0xff4f91 : 0xffd54a);
    return guest;
  }

  private spawnCandy(x: number, z: number, value: number, bait: boolean, vx = 0, vz = 0, vertical = 0): Candy | null {
    const candy = this.candies.find((item) => !item.active);
    if (!candy) return null;
    candy.active = true;
    candy.value = value;
    candy.bait = bait;
    candy.life = bait ? 12 + this.upgrades.decoy * 4 : 9999;
    candy.age = 0;
    candy.vertical = vertical;
    candy.vel.set(vx, 0, vz);
    candy.model.group.position.set(x, vertical > 0 ? 1.15 : 0.28, z);
    candy.model.group.scale.setScalar(bait ? 1.4 : 0.85);
    candy.model.group.visible = true;
    (candy.model.core.material as THREE.MeshStandardMaterial).color.setHex(bait ? 0x65f0ce : 0xffd348);
    return candy;
  }

  private deactivateGuest(guest: Guest): void {
    guest.active = false;
    guest.targetCandy = null;
    guest.model.group.visible = false;
  }

  private deactivateCandy(candy: Candy): void {
    candy.active = false;
    candy.model.group.visible = false;
  }

  private update(dt: number): void {
    if (this.disposed) return;
    this.elapsed += dt;
    this.audio.update();

    if (this.input.consumeAction("KeyM")) this.updateSoundButton(this.audio.toggleMute());
    if (this.input.consumeAction("Escape") || this.input.consumeAction("KeyP")) {
      if (this.mode === "playing") this.pause();
      else if (this.mode === "paused") this.resume();
    }
    if (this.mode === "title" && this.input.consumeAction("Space")) this.startRun();
    else if ((this.mode === "gameover" || this.mode === "victory") && (this.input.consumeAction("KeyR") || this.input.consumeAction("Space"))) this.startRun();
    else if (this.mode === "upgrade") {
      for (let i = 0; i < 3; i++) {
        if (this.input.consumeAction(`Digit${i + 1}`) && this.currentUpgrades[i]) this.chooseUpgrade(this.currentUpgrades[i].id);
      }
    }

    if (this.mode === "playing") {
      if (this.freezeTimer > 0) {
        this.freezeTimer -= dt;
        this.particles.update(dt * 0.25);
      } else {
        this.runTime += dt;
        this.waveTime -= dt;
        this.idleTimer += dt;
        this.updateAim();
        this.updatePlayer(dt);
        this.updateCandies(dt);
        this.updateGuests(dt);
        this.updatePartyEvents(dt);
        this.updateBanking(dt);
        this.updateSpawning(dt);
        this.particles.update(dt);
        if (this.waveTime <= 0 && this.mode === "playing") this.finish(false, "Cake o'clock arrived before your quota. The cake was smug about it.");
        if (this.idleTimer > 16 && this.mode === "playing") {
          this.setBanner(PARTY_LINES.idle[Math.floor(this.range(0, PARTY_LINES.idle.length))], 3);
          this.idleTimer = 0;
        }
      }
      this.audio.setIntensity(this.waveIndex / 5 + (this.waveTime < 15 ? 0.35 : 0));
      this.uiTimer -= dt;
      if (this.uiTimer <= 0) {
        this.updateHud();
        this.uiTimer = 0.05;
      }
    } else if (this.mode !== "paused") {
      this.particles.update(dt);
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) byId("event-banner").classList.add("hidden");
    }
    this.input.actions.clear();
  }

  private updateAim(): void {
    this.pointerNdc.set((this.input.pointerX / window.innerWidth) * 2 - 1, -(this.input.pointerY / window.innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, this.aimPoint)) {
      this.aimPoint.copy(this.playerModel.group.position).add(this.temp.set(0, 0, -4));
    }
    const player = this.playerModel.group.position;
    const dx = this.aimPoint.x - player.x;
    const dz = this.aimPoint.z - player.z;
    const distance = Math.hypot(dx, dz);
    if (distance > CFG.throwRange) {
      this.aimPoint.x = player.x + (dx / distance) * CFG.throwRange;
      this.aimPoint.z = player.z + (dz / distance) * CFG.throwRange;
    }
  }

  private updatePlayer(dt: number): void {
    const player = this.playerModel.group;
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.regenTimer += dt;
    if (this.upgrades.regen && this.carried < 5 && this.regenTimer >= 9 / this.upgrades.regen) {
      this.regenTimer = 0;
      this.carried++;
      this.audio.sfx("pickup");
      this.particles.burst(player.position.x, 1.3, player.position.z, 0x52e2c3, 5, 2);
    }

    let moveX = this.input.moveX;
    let moveZ = -this.input.moveZ;
    const magnitude = Math.hypot(moveX, moveZ);
    if (magnitude > 1) {
      moveX /= magnitude;
      moveZ /= magnitude;
    }
    if (magnitude > 0.05) this.idleTimer = 0;

    if (this.input.consumeAction("Space") && this.dashCooldown <= 0) this.startDash(moveX, moveZ);
    if (this.input.consumeAction("Mouse0") || this.input.consumeAction("Mouse2")) this.throwCandy();

    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      this.playerVelocity.copy(this.dashDirection).multiplyScalar(CFG.dashSpeed);
      this.invulnerable = Math.max(this.invulnerable, 0.12);
      if (Math.floor(this.elapsed * 60) % 3 === 0) this.particles.burst(player.position.x, 0.7, player.position.z, 0xffdb58, 1, 1.4);
    } else {
      const speed = CFG.playerSpeed * (1 + this.upgrades.speed * 0.14);
      const blend = Math.min(1, CFG.playerAcceleration * dt);
      this.playerVelocity.x += (moveX * speed - this.playerVelocity.x) * blend;
      this.playerVelocity.z += (moveZ * speed - this.playerVelocity.z) * blend;
    }
    player.position.x = clamp(player.position.x + this.playerVelocity.x * dt, -CFG.arenaX + 0.7, CFG.arenaX - 0.7);
    player.position.z = clamp(player.position.z + this.playerVelocity.z * dt, -CFG.arenaZ + 0.7, CFG.arenaZ - 0.7);

    const facingX = this.input.pointerActive ? this.aimPoint.x - player.position.x : this.playerVelocity.x;
    const facingZ = this.input.pointerActive ? this.aimPoint.z - player.position.z : this.playerVelocity.z;
    if (Math.hypot(facingX, facingZ) > 0.1) {
      const targetAngle = Math.atan2(-facingX, -facingZ);
      player.rotation.y = angleLerp(player.rotation.y, targetAngle, Math.min(1, dt * 13));
    }

    const speedRatio = Math.min(1, this.playerVelocity.length() / CFG.playerSpeed);
    const stride = this.elapsed * (8 + speedRatio * 7);
    this.playerModel.body.position.y = Math.abs(Math.sin(stride)) * 0.09 * speedRatio;
    this.playerModel.body.rotation.z = Math.sin(stride * 0.5) * 0.035 * speedRatio;
    this.playerModel.head.rotation.z = Math.sin(this.elapsed * 3.2) * 0.035;
    for (let i = 0; i < this.playerModel.legs.length; i++) {
      this.playerModel.legs[i].rotation.x = Math.sin(stride + (i % 2) * Math.PI) * 0.55 * speedRatio;
    }
    if (this.dashTimer > 0) this.playerModel.body.scale.set(1.15, 0.82, 1.18);
    else {
      const scaleBlend = Math.min(1, dt * 14);
      this.playerModel.body.scale.x += (1 - this.playerModel.body.scale.x) * scaleBlend;
      this.playerModel.body.scale.y += (1 - this.playerModel.body.scale.y) * scaleBlend;
      this.playerModel.body.scale.z += (1 - this.playerModel.body.scale.z) * scaleBlend;
    }
    this.playerModel.body.visible = this.invulnerable <= 0 || Math.floor(this.invulnerable * 12) % 2 === 0;

    for (const gift of this.arena.gifts) {
      if (gift.active && this.dashTimer > 0 && gift.position.distanceToSquared(player.position) < 1.75) this.openGift(gift);
      if (!gift.active) {
        gift.respawn -= dt;
        if (gift.respawn <= 0) {
          gift.active = true;
          gift.group.visible = true;
          gift.group.scale.setScalar(0.01);
        }
      } else if (gift.group.scale.x < 0.99) {
        gift.group.scale.setScalar(Math.min(1, gift.group.scale.x + dt * 4));
      }
      if (gift.active) gift.lid.rotation.y = Math.sin(this.elapsed * 2 + gift.position.x) * 0.05;
    }
  }

  private startDash(x: number, z: number): void {
    if (this.mode !== "playing" || this.dashCooldown > 0) return;
    if (Math.hypot(x, z) < 0.1) {
      const rotation = this.playerModel.group.rotation.y;
      x = -Math.sin(rotation);
      z = -Math.cos(rotation);
    }
    this.dashDirection.set(x, 0, z).normalize();
    this.dashTimer = CFG.dashDuration;
    this.dashCooldown = CFG.dashCooldown * (1 - this.upgrades.dash * 0.22);
    this.invulnerable = Math.max(this.invulnerable, CFG.dashDuration + 0.08);
    this.stats.dashes++;
    this.audio.sfx("dash");
    this.trauma = Math.max(this.trauma, 0.12);
    this.particles.burst(this.playerModel.group.position.x, 0.8, this.playerModel.group.position.z, 0xff4f91, 9, 3.5);
  }

  private throwCandy(): void {
    if (this.mode !== "playing") return;
    if (this.carried < CFG.throwCost) {
      this.setBanner("NOT ENOUGH INSIDES. FIND 3 CANDY TO THROW.", 1.8);
      this.audio.sfx("warning");
      return;
    }
    const player = this.playerModel.group.position;
    const flightTime = 0.58;
    const vx = (this.aimPoint.x - player.x) / flightTime;
    const vz = (this.aimPoint.z - player.z) / flightTime;
    const vertical = (0.28 - 1.15 + 0.5 * 15 * flightTime * flightTime) / flightTime;
    const candy = this.spawnCandy(player.x, player.z, CFG.throwCost, true, vx, vz, vertical);
    if (!candy) return;
    this.carried -= CFG.throwCost;
    this.stats.thrown += CFG.throwCost;
    this.idleTimer = 0;
    this.audio.sfx("throw");
    this.particles.burst(player.x, 1.2, player.z, 0x52e2c3, 6, 2.5);
  }

  private updateCandies(dt: number): void {
    const player = this.playerModel.group.position;
    const pickupRadius = 0.92 * (1 + this.upgrades.magnet * 0.7);
    const pickupRadiusSq = pickupRadius * pickupRadius;
    for (const candy of this.candies) {
      if (!candy.active) continue;
      candy.age += dt;
      const position = candy.model.group.position;
      if (candy.bait) {
        candy.life -= dt;
        if (candy.life <= 0) {
          this.deactivateCandy(candy);
          continue;
        }
      }
      if (candy.vertical !== 0 || position.y > 0.3) {
        candy.vertical -= 15 * dt;
        position.x += candy.vel.x * dt;
        position.z += candy.vel.z * dt;
        position.y += candy.vertical * dt;
        candy.model.group.rotation.x += dt * 8;
        if (position.y <= 0.28) {
          position.y = 0.28;
          candy.vertical = 0;
          candy.vel.multiplyScalar(0.12);
          this.particles.burst(position.x, 0.3, position.z, candy.bait ? 0x52e2c3 : 0xffdb58, candy.bait ? 8 : 2, 1.8);
        }
      } else {
        position.x += candy.vel.x * dt;
        position.z += candy.vel.z * dt;
        candy.vel.multiplyScalar(Math.max(0, 1 - dt * 5));
        position.y = 0.3 + Math.sin(this.elapsed * 4 + candy.phase) * 0.055;
        candy.model.group.rotation.y += dt * 2.5;
      }
      position.x = clamp(position.x, -12.5, 12.5);
      position.z = clamp(position.z, -9.5, 9.5);
      if (!candy.bait && position.distanceToSquared(player) < pickupRadiusSq) {
        this.carried += candy.value;
        this.audio.sfx("pickup", this.carried % 8);
        this.particles.burst(position.x, 0.6, position.z, 0xffdb58, 4, 2);
        this.deactivateCandy(candy);
      }
    }
  }

  private updateGuests(dt: number): void {
    const playerPosition = this.playerModel.group.position;
    for (const guest of this.guests) {
      if (!guest.active) continue;
      guest.hitCooldown = Math.max(0, guest.hitCooldown - dt);
      const position = guest.model.group.position;
      if (guest.kind === "conga") {
        position.x += guest.laneDirection * 6.8 * dt;
        guest.model.body.position.y = Math.abs(Math.sin(this.elapsed * 10 + guest.phase)) * 0.18;
        guest.model.body.rotation.z = Math.sin(this.elapsed * 10 + guest.phase) * 0.12;
        guest.model.group.rotation.y = guest.laneDirection > 0 ? -Math.PI / 2 : Math.PI / 2;
        if (Math.abs(position.x) > 15) {
          this.deactivateGuest(guest);
          continue;
        }
      } else if (guest.state === "stunned") {
        guest.timer -= dt;
        guest.vel.multiplyScalar(Math.max(0, 1 - dt * 5));
        position.addScaledVector(guest.vel, dt);
        guest.model.body.rotation.z = Math.sin(this.elapsed * 24) * 0.18;
        if (guest.timer <= 0) guest.state = "chase";
      } else {
        let targetX = playerPosition.x;
        let targetZ = playerPosition.z;
        let targetCandy: Candy | null = null;
        let closest = Infinity;
        const baitRange = 8.5 + this.upgrades.decoy * 4;
        for (const candy of this.candies) {
          if (!candy.active || !candy.bait || candy.vertical !== 0) continue;
          const distance = (candy.model.group.position.x - position.x) ** 2 + (candy.model.group.position.z - position.z) ** 2;
          if (distance < closest && distance < baitRange * baitRange) {
            closest = distance;
            targetCandy = candy;
          }
        }
        if (targetCandy) {
          targetX = targetCandy.model.group.position.x;
          targetZ = targetCandy.model.group.position.z;
          if (closest < 0.72) {
            this.eatBait(guest, targetCandy);
            continue;
          }
        }
        const dx = targetX - position.x;
        const dz = targetZ - position.z;
        const distance = Math.max(0.001, Math.hypot(dx, dz));
        const speed = guest.speed * (guest.state === "rush" ? 1.7 : 1);
        const blend = Math.min(1, dt * 7);
        guest.vel.x += ((dx / distance) * speed - guest.vel.x) * blend;
        guest.vel.z += ((dz / distance) * speed - guest.vel.z) * blend;
        position.addScaledVector(guest.vel, dt);
        position.x = clamp(position.x, -12.5, 12.5);
        position.z = clamp(position.z, -9.5, 9.5);
        guest.model.group.rotation.y = angleLerp(guest.model.group.rotation.y, Math.atan2(-dx, -dz), Math.min(1, dt * 10));
        if (guest.state === "rush") {
          guest.timer -= dt;
          if (guest.timer <= 0) {
            guest.state = "chase";
            (guest.model.hat.material as THREE.MeshStandardMaterial).color.setHex(0xffd54a);
          }
        }
        const stride = this.elapsed * (guest.state === "rush" ? 18 : 10) + guest.phase;
        guest.model.body.position.y = Math.abs(Math.sin(stride)) * 0.08;
        guest.model.body.rotation.z = Math.sin(stride * 0.5) * 0.035;
        for (let i = 0; i < guest.model.legs.length; i++) guest.model.legs[i].rotation.x = Math.sin(stride + i * Math.PI) * 0.55;
        for (let i = 0; i < guest.model.arms.length; i++) guest.model.arms[i].rotation.x = -0.6 + Math.sin(stride + i * Math.PI) * 0.4;
      }

      const radius = guest.radius + 0.6;
      if (guest.hitCooldown <= 0 && position.distanceToSquared(playerPosition) < radius * radius) {
        if (this.dashTimer > 0 && this.upgrades.knockback) {
          guest.state = "stunned";
          guest.timer = 1.5;
          guest.vel.copy(this.dashDirection).multiplyScalar(9);
          guest.hitCooldown = 1;
          this.particles.burst(position.x, 1, position.z, 0xffdb58, 10, 4);
        } else if (this.invulnerable <= 0) {
          this.applyHit(guest.kind === "conga" ? "A conga line violated your personal space." : "A guest got a handful of your structural candy.", guest);
          guest.hitCooldown = 1.2;
          if (guest.kind !== "conga") {
            guest.state = "stunned";
            guest.timer = 0.65;
          }
        }
      }
    }

    // Bounded local separation keeps the mob legible without a physics-engine pileup.
    for (let i = 0; i < this.guests.length; i++) {
      const a = this.guests[i];
      if (!a.active || a.kind === "conga" || a.state === "stunned") continue;
      for (let j = i + 1; j < this.guests.length; j++) {
        const b = this.guests[j];
        if (!b.active || b.kind === "conga" || b.state === "stunned") continue;
        const dx = b.model.group.position.x - a.model.group.position.x;
        const dz = b.model.group.position.z - a.model.group.position.z;
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq > 0.001 && distanceSq < 0.64) {
          const distance = Math.sqrt(distanceSq);
          const push = (0.8 - distance) * 0.18;
          const nx = dx / distance;
          const nz = dz / distance;
          a.model.group.position.x -= nx * push;
          a.model.group.position.z -= nz * push;
          b.model.group.position.x += nx * push;
          b.model.group.position.z += nz * push;
        }
      }
    }
    if (this.cake.active) this.updateCake(dt);
    if (this.boss.active) this.updateBoss(dt);
  }

  private eatBait(guest: Guest, candy: Candy): void {
    const position = candy.model.group.position;
    this.deactivateCandy(candy);
    this.particles.burst(position.x, 0.65, position.z, 0x52e2c3, 14, 4);
    if (this.upgrades.sour) {
      guest.state = "stunned";
      guest.timer = 2.1;
      guest.vel.set(0, 0, 0);
      this.audio.sfx("shield");
    } else {
      guest.state = "rush";
      guest.timer = 3.4;
      (guest.model.hat.material as THREE.MeshStandardMaterial).color.setHex(0xff386e);
      this.stats.rushed++;
      this.audio.sfx("rush");
      if (this.stats.rushed % 4 === 1) this.setBanner(PARTY_LINES.rush[(this.stats.rushed / 4 | 0) % PARTY_LINES.rush.length], 2.1);
    }
    guest.model.mouth.scale.set(1.6, 1.6, 1.6);
  }

  private updateCake(dt: number): void {
    const cake = this.cake;
    const position = cake.model.group.position;
    const player = this.playerModel.group.position;
    cake.cooldown -= dt;
    cake.hitCooldown = Math.max(0, cake.hitCooldown - dt);
    if (cake.state === "chase") {
      const dx = player.x - position.x;
      const dz = player.z - position.z;
      const distance = Math.max(0.01, Math.hypot(dx, dz));
      position.x += (dx / distance) * 2.0 * dt;
      position.z += (dz / distance) * 2.0 * dt;
      cake.model.group.rotation.y = angleLerp(cake.model.group.rotation.y, Math.atan2(-dx, -dz), Math.min(1, dt * 5));
      if (cake.cooldown <= 0 && distance < 11) {
        cake.state = "windup";
        cake.timer = 1.05;
        cake.chargeDir.set(dx / distance, 0, dz / distance);
        this.chargeTelegraph.visible = true;
        this.audio.sfx("warning");
      }
    } else if (cake.state === "windup") {
      cake.timer -= dt;
      cake.model.body.scale.set(1 + Math.sin(this.elapsed * 20) * 0.08, 0.85, 1.12);
      this.chargeTelegraph.position.set(position.x + cake.chargeDir.x * 6, 0.055, position.z + cake.chargeDir.z * 6);
      this.chargeTelegraph.rotation.z = -Math.atan2(cake.chargeDir.x, cake.chargeDir.z);
      if (cake.timer <= 0) {
        cake.state = "charge";
        cake.timer = 1.05;
        cake.model.body.scale.set(1, 1, 1);
        this.chargeTelegraph.visible = false;
        this.audio.sfx("dash");
      }
    } else if (cake.state === "charge") {
      cake.timer -= dt;
      position.addScaledVector(cake.chargeDir, 12.5 * dt);
      for (const guest of this.guests) {
        if (!guest.active || guest.kind === "conga") continue;
        if (guest.model.group.position.distanceToSquared(position) < 2.2) {
          guest.state = "stunned";
          guest.timer = 2;
          guest.vel.copy(cake.chargeDir).multiplyScalar(8);
        }
      }
      for (const gift of this.arena.gifts) if (gift.active && gift.position.distanceToSquared(position) < 2.4) this.openGift(gift);
      if (cake.timer <= 0 || Math.abs(position.x) > 11.8 || Math.abs(position.z) > 8.8) {
        cake.state = "recover";
        cake.timer = 1.2;
        cake.cooldown = 3.2;
        this.trauma = Math.max(this.trauma, 0.25);
        this.audio.sfx("slam");
      }
    } else if (cake.state === "recover") {
      cake.timer -= dt;
      cake.model.body.rotation.z = Math.sin(this.elapsed * 18) * 0.12;
      if (cake.timer <= 0) {
        cake.state = "chase";
        cake.model.body.rotation.z = 0;
      }
    }
    position.x = clamp(position.x, -12, 12);
    position.z = clamp(position.z, -9, 9);
    for (const wheel of cake.model.legs) wheel.rotation.x += dt * (cake.state === "charge" ? 18 : 4);
    if (cake.hitCooldown <= 0 && position.distanceToSquared(player) < 3.1 && this.invulnerable <= 0) {
      this.applyHit("The getaway cake used you as a speed bump.", cake);
      cake.hitCooldown = 1.5;
    }
  }

  private updateBoss(dt: number): void {
    const boss = this.boss;
    const position = boss.model.group.position;
    const player = this.playerModel.group.position;
    boss.cooldown -= dt;
    boss.hitCooldown = Math.max(0, boss.hitCooldown - dt);
    if (boss.state === "chase") {
      const dx = player.x - position.x;
      const dz = player.z - position.z;
      const distance = Math.max(0.01, Math.hypot(dx, dz));
      position.x += (dx / distance) * 1.85 * dt;
      position.z += (dz / distance) * 1.85 * dt;
      boss.model.group.rotation.y = angleLerp(boss.model.group.rotation.y, Math.atan2(-dx, -dz), Math.min(1, dt * 5));
      boss.model.body.position.y = Math.abs(Math.sin(this.elapsed * 7)) * 0.12;
      if (boss.cooldown <= 0) {
        boss.state = "windup";
        boss.timer = 1.35;
        boss.attackTarget.copy(player);
        this.bossRing.position.set(player.x, 0.065, player.z);
        this.bossRing.visible = true;
        this.audio.sfx("warning");
      }
    } else if (boss.state === "windup") {
      boss.timer -= dt;
      const pulse = 1 + Math.sin(this.elapsed * 24) * 0.08;
      boss.model.body.scale.set(pulse, 1 / pulse, pulse);
      this.bossRing.scale.setScalar(0.85 + (1.35 - boss.timer) * 0.18);
      if (boss.timer <= 0) {
        boss.state = "recover";
        boss.timer = 1.1;
        boss.cooldown = 4.4;
        this.bossRing.visible = false;
        boss.model.body.scale.set(1.25, 0.65, 1.25);
        this.audio.sfx("slam");
        this.trauma = Math.max(this.trauma, 0.7);
        this.freezeTimer = 0.075;
        this.particles.burst(boss.attackTarget.x, 0.4, boss.attackTarget.z, 0xff4f91, 35, 7);
        if (player.distanceToSquared(boss.attackTarget) < 9.6 && this.dashTimer <= 0) this.applyHit("The birthday wish was gravity. You were the wishbone.", boss);
        for (const guest of this.guests) {
          if (guest.active && guest.model.group.position.distanceToSquared(boss.attackTarget) < 10) {
            guest.state = "stunned";
            guest.timer = 2;
          }
        }
        for (const gift of this.arena.gifts) if (gift.active && gift.position.distanceToSquared(boss.attackTarget) < 10) this.openGift(gift);
      }
    } else if (boss.state === "recover") {
      boss.timer -= dt;
      if (boss.timer <= 0) {
        boss.state = "chase";
        boss.model.body.scale.set(1, 1, 1);
      }
    }
    if (boss.hitCooldown <= 0 && position.distanceToSquared(player) < 2.6 && this.invulnerable <= 0) {
      this.applyHit("The birthday child opened you instead of a present.", boss);
      boss.hitCooldown = 1.5;
    }
  }

  private updatePartyEvents(dt: number): void {
    if (this.waveIndex === 1) {
      this.musicalTimer -= dt;
      if (this.musicalTimer < 3) {
        for (const chair of this.arena.chairs) {
          chair.ring.visible = true;
          chair.ring.scale.setScalar(1 + Math.sin(this.elapsed * 10) * 0.08);
        }
        if (!this.musicalWarned) {
          this.musicalWarned = true;
          this.setBanner("MUSIC STOPPING! GET TO A GLOWING CHAIR OR DASH.", 2.6);
          this.audio.sfx("warning");
        }
      }
      if (this.musicalTimer <= 0) {
        let safe = this.dashTimer > 0;
        for (const chair of this.arena.chairs) {
          chair.ring.visible = false;
          if (chair.position.distanceToSquared(this.playerModel.group.position) < 2.5) safe = true;
        }
        if (!safe) this.applyHit("Musical chairs became a contact sport. You were the contact.");
        for (const guest of this.guests) {
          if (!guest.active || guest.kind === "conga") continue;
          let guestSafe = false;
          for (const chair of this.arena.chairs) if (chair.position.distanceToSquared(guest.model.group.position) < 2.5) guestSafe = true;
          if (!guestSafe) {
            guest.state = "stunned";
            guest.timer = 2.2;
          }
        }
        this.audio.sfx("slam");
        this.trauma = Math.max(this.trauma, 0.45);
        this.musicalTimer = 13;
        this.musicalWarned = false;
      }
    }

    if (this.waveIndex === 2 || this.waveIndex === 4) {
      this.congaTimer -= dt;
      if (this.congaTimer < 1.3) {
        this.laneTelegraph.visible = true;
        this.laneTelegraph.position.z = this.nextCongaZ;
        if (!this.congaWarned) {
          this.congaWarned = true;
          this.audio.sfx("warning");
        }
      }
      if (this.congaTimer <= 0) {
        for (let i = 0; i < 6; i++) {
          const guest = this.spawnGuest("conga", -14 - i * 0.85, this.nextCongaZ);
          if (guest) guest.laneDirection = 1;
        }
        this.laneTelegraph.visible = false;
        this.nextCongaZ = this.range(-6, 7);
        this.congaTimer = this.waveIndex === 4 ? 15 : 10;
        this.congaWarned = false;
      }
    }
  }

  private updateBanking(dt: number): void {
    const player = this.playerModel.group.position;
    const atBank = player.distanceToSquared(this.arena.stationPosition) < 3.3;
    if (atBank && this.carried > 0) {
      this.bankProgress += dt * CFG.bankRate * (1 + this.upgrades.bank * 0.35);
      while (this.bankProgress >= 1 && this.carried > 0 && this.mode === "playing") {
        this.bankProgress -= 1;
        this.carried--;
        this.bankedWave++;
        this.totalBanked++;
        this.bankStreak++;
        const multiplier = this.bankMultiplier();
        this.score += Math.round(10 * multiplier * (1 + this.upgrades.bank * 0.25) * (1 + this.waveIndex * 0.1));
        this.audio.sfx("bank", this.bankStreak % 10);
        if (this.totalBanked % 3 === 0) this.particles.burst(this.arena.stationPosition.x, 2, this.arena.stationPosition.z, 0x52e2c3, 4, 3);
        if (this.bankedWave >= WAVES[this.waveIndex].quota) this.completeWave();
      }
    } else {
      this.bankProgress = Math.max(0, this.bankProgress - dt * 4);
    }
  }

  private bankMultiplier(): number {
    return Math.min(5, Math.max(this.upgrades.combo ? 2 : 1, 1 + Math.floor(this.bankStreak / 10)));
  }

  private updateSpawning(dt: number): void {
    this.candySpawnTimer -= dt;
    if (this.candySpawnTimer <= 0) {
      this.candySpawnTimer = 1.25;
      const activeCandies = this.candies.reduce((count, candy) => count + (candy.active && !candy.bait ? 1 : 0), 0);
      if (activeCandies < 32) this.spawnCandy(this.range(-11.5, 11.5), this.range(-6.5, 8.5), 1, false, this.range(-1, 1), this.range(-1, 1), this.range(2, 4));
    }
    this.guestSpawnTimer -= dt;
    if (this.guestSpawnTimer <= 0) {
      this.guestSpawnTimer = Math.max(1.2, 3 - this.waveIndex * 0.3);
      const normalGuests = this.guests.reduce((count, guest) => count + (guest.active && guest.kind === "guest" ? 1 : 0), 0);
      const target = WAVES[this.waveIndex].guests + Math.min(3, Math.floor(this.totalBanked / 45));
      if (normalGuests < target) this.spawnGuest("guest");
    }
  }

  private openGift(gift: ArenaModel["gifts"][number]): void {
    if (!gift.active) return;
    gift.active = false;
    gift.group.visible = false;
    gift.respawn = 13;
    this.stats.gifts++;
    const count = 8 + this.upgrades.gifts * 4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      this.spawnCandy(gift.position.x, gift.position.z, 1, false, Math.cos(angle) * 3.5, Math.sin(angle) * 3.5, 4.5 + (i % 3));
    }
    this.audio.sfx("open");
    this.particles.burst(gift.position.x, 0.8, gift.position.z, 0xff4f91, 25, 5);
    this.trauma = Math.max(this.trauma, 0.18);
  }

  private applyHit(reason: string, attacker?: Guest): void {
    if (this.mode !== "playing" || this.invulnerable > 0) return;
    const player = this.playerModel.group.position;
    if (this.shield > 0) {
      this.shield = 0;
      this.invulnerable = 1.1;
      this.audio.sfx("shield");
      this.setBanner("HARD CANDY SHELL TOOK THE HIT. YOUR FEELINGS REMAIN FRAGILE.", 2.5);
      this.particles.burst(player.x, 1.2, player.z, 0x52e2c3, 22, 5);
      return;
    }
    if (this.carried <= 0) {
      this.finish(false, `${reason} You were completely out of candy. The party has claimed its piñata.`);
      return;
    }
    const lost = Math.min(5, this.carried);
    this.carried -= lost;
    for (let i = 0; i < lost; i++) {
      const angle = (i / lost) * Math.PI * 2 + this.elapsed;
      this.spawnCandy(player.x, player.z, 1, false, Math.cos(angle) * 4, Math.sin(angle) * 4, 4 + i * 0.35);
    }
    this.stats.hits++;
    this.bankStreak = this.upgrades.combo ? 8 : 0;
    this.invulnerable = CFG.hitInvulnerability;
    this.freezeTimer = 0.07;
    this.trauma = Math.max(this.trauma, 0.65);
    if (attacker) {
      const dx = player.x - attacker.model.group.position.x;
      const dz = player.z - attacker.model.group.position.z;
      const distance = Math.max(0.1, Math.hypot(dx, dz));
      this.playerVelocity.set((dx / distance) * 9, 0, (dz / distance) * 9);
    }
    this.audio.sfx("hit");
    this.particles.burst(player.x, 1.2, player.z, 0xffdb58, 22, 6);
    const flash = byId("impact-flash");
    flash.classList.remove("flash");
    void flash.offsetWidth;
    flash.classList.add("flash");
    this.setBanner(this.carried === 0 ? PARTY_LINES.empty[this.stats.hits % PARTY_LINES.empty.length] : `${reason} −${lost} CANDY`, 2.7);
  }

  private completeWave(): void {
    if (this.mode !== "playing") return;
    this.score += Math.round(this.waveTime * 5 * (this.waveIndex + 1));
    if (this.waveIndex >= WAVES.length - 1) {
      this.finish(true, "Five quotas. Zero adult supervision. You escaped with enough candy to become a financial institution.");
      return;
    }
    this.mode = "upgrade";
    this.audio.sfx("win");
    this.audio.setIntensity(0.1);
    this.clearEntities();
    this.bossRing.visible = false;
    this.laneTelegraph.visible = false;
    this.chargeTelegraph.visible = false;
    this.currentUpgrades = this.rollUpgrades();
    byId("upgrade-subtitle").textContent = `${WAVES[this.waveIndex].name} SURVIVED • NEXT: ${WAVES[this.waveIndex + 1].name}`;
    const cards = byId("upgrade-cards");
    cards.innerHTML = this.currentUpgrades.map((upgrade, index) => {
      const level = this.upgrades[upgrade.id];
      return `<button class="upgrade-card" data-upgrade="${upgrade.id}"><span class="upgrade-key">${index + 1}</span><div class="upgrade-icon">${upgrade.icon}</div><h3>${upgrade.name}</h3><p>${upgrade.description}</p><small>${upgrade.footnote}<br><span class="level">LEVEL ${level + 1} / ${upgrade.max}</span></small></button>`;
    }).join("");
    this.setScreen("upgrade-screen");
  }

  private rollUpgrades(): UpgradeSpec[] {
    const available = UPGRADES.filter((upgrade) => this.upgrades[upgrade.id] < upgrade.max);
    const result: UpgradeSpec[] = [];
    while (result.length < 3 && available.length > 0) {
      const index = Math.floor(this.range(0, available.length));
      result.push(available[index]);
      available.splice(index, 1);
    }
    return result;
  }

  private chooseUpgrade(id: UpgradeId): void {
    const upgrade = this.currentUpgrades.find((item) => item.id === id);
    if (!upgrade || this.upgrades[id] >= upgrade.max) return;
    this.upgrades[id]++;
    if (id === "candy") this.carried += 12;
    this.audio.sfx("ui");
    this.startWave(this.waveIndex + 1);
    this.canvas.focus();
  }

  private pause(): void {
    if (this.mode !== "playing") return;
    this.mode = "paused";
    this.setScreen("pause-screen");
    this.audio.setIntensity(0);
  }

  private resume(): void {
    if (this.mode !== "paused") return;
    this.mode = "playing";
    this.setScreen(null);
    this.canvas.focus();
  }

  private finish(victory: boolean, reason: string): void {
    if (this.mode === "gameover" || this.mode === "victory") return;
    this.mode = victory ? "victory" : "gameover";
    this.audio.stopMusic();
    this.audio.sfx(victory ? "win" : "lose");
    this.best = Math.max(this.best, this.score);
    storage.set("pinata.best", this.best);
    byId("hud").classList.add("hidden");
    this.aimReticle.visible = false;
    this.bossRing.visible = false;
    this.laneTelegraph.visible = false;
    this.chargeTelegraph.visible = false;
    byId("result-eyebrow").textContent = victory ? "PARTY ESCAPE RECEIPT / KEEP FOR YOUR RECORDS" : "INCIDENT REPORT / ABSOLUTELY NOT A CRY FOR HELP";
    byId("result-title").innerHTML = victory ? "PARTY<br><em>ESCAPED.</em>" : "PARTY<br><em>FOUL.</em>";
    byId("result-reason").textContent = reason;
    byId("result-score").textContent = this.formatScore(this.score);
    byId("result-best").textContent = `LOCAL BEST ${this.formatScore(this.best)}`;
    byId("stat-banked").textContent = String(this.totalBanked);
    byId("stat-thrown").textContent = String(this.stats.thrown);
    byId("stat-rushed").textContent = String(this.stats.rushed);
    byId("stat-dashes").textContent = String(this.stats.dashes);
    const rank = victory
      ? this.score > 5000 ? "RANK: THE PARTY INDUSTRIAL COMPLEX" : "RANK: CERTIFIED GOODY BAG FUGITIVE"
      : this.totalBanked > 60 ? "RANK: DECORATIVE FINANCIAL GENIUS" : this.stats.rushed > 8 ? "RANK: SUGAR LOGISTICS INTERN" : "RANK: DECORATIVE CAUTIONARY TALE";
    byId("result-rank").textContent = rank;
    this.setScreen("results-screen");
    this.particles.burst(this.playerModel.group.position.x, 1.5, this.playerModel.group.position.z, victory ? 0x52e2c3 : 0xff4f91, 70, 8);
  }

  private setBanner(text: string, duration: number): void {
    const banner = byId("event-banner");
    banner.querySelector("strong")!.textContent = text;
    banner.classList.remove("hidden");
    this.bannerTimer = duration;
  }

  private updateWaveUi(): void {
    const wave = WAVES[this.waveIndex];
    byId("wave-number").textContent = `PARTY ${this.waveIndex + 1}/${WAVES.length}`;
    byId("wave-name").textContent = wave.name;
    byId("wave-rule").textContent = wave.rule;
  }

  private updateHud(force = false): void {
    if (this.mode !== "playing" && !force) return;
    const seconds = Math.max(0, Math.ceil(this.waveTime));
    const timer = byId("timer");
    timer.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
    timer.parentElement!.classList.toggle("danger", seconds <= 12);
    byId("score").textContent = this.formatScore(this.score);
    byId("best-score").textContent = this.formatScore(Math.max(this.best, this.score));
    byId("quota-text").textContent = `${this.bankedWave} / ${WAVES[this.waveIndex].quota}`;
    byId<HTMLElement>("quota-fill").style.width = `${Math.min(100, (this.bankedWave / WAVES[this.waveIndex].quota) * 100)}%`;
    byId("candy-count").textContent = String(this.carried);
    byId("hud").querySelector(".candy-card")!.classList.toggle("exposed", this.carried === 0);
    byId("shield-pip").classList.toggle("hidden", this.shield <= 0);
    const maxCooldown = CFG.dashCooldown * (1 - this.upgrades.dash * 0.22);
    const dashReady = this.dashCooldown <= 0;
    byId<HTMLElement>("dash-fill").style.width = `${dashReady ? 100 : (1 - this.dashCooldown / maxCooldown) * 100}%`;
    byId("dash-text").textContent = dashReady ? "READY" : `${this.dashCooldown.toFixed(1)}s`;
    const combo = byId("combo");
    combo.classList.toggle("active", this.bankMultiplier() > 1);
    combo.querySelector("strong")!.textContent = `×${this.bankMultiplier()}`;
    const atBank = this.playerModel.group.position.distanceToSquared(this.arena.stationPosition) < 3.3;
    let tip = "CLICK TO THROW 3 CANDY • GUESTS EAT IT • THEN GET A SUGAR RUSH";
    if (atBank && this.carried > 0) tip = `BANKING ${this.carried} CANDY • DO NOT GET GRABBED`;
    else if (this.carried < 3) tip = this.carried === 0 ? "EXPOSED! ONE MORE GRAB ENDS THE RUN • RECOVER SPILLED CANDY" : "FIND 1 MORE CANDY TO MAKE BAIT • DASH THROUGH PRESENTS FOR A REFILL";
    else if (this.waveIndex === 1 && this.musicalTimer < 3) tip = "MUSIC STOPPING • GLOWING CHAIR = SAFE • DASH = ALSO SAFE";
    byId("context-tip").textContent = tip;
    byId("boss-status").classList.toggle("hidden", !(this.boss.active && this.boss.state === "windup"));
  }

  private formatScore(value: number): string {
    return Math.max(0, Math.floor(value)).toString().padStart(6, "0");
  }

  private render(): void {
    if (this.disposed) return;
    for (const balloon of this.arena.balloons) {
      balloon.rotation.z = Math.sin(this.elapsed * 1.4 + Number(balloon.userData.phase)) * 0.045;
    }
    this.arena.stationRing.scale.setScalar(1 + Math.sin(this.elapsed * 3) * 0.05);
    this.arena.stationRing.rotation.z += 0.003;

    if (this.mode === "title") {
      this.playerModel.body.position.y = Math.sin(this.elapsed * 2.3) * 0.08 + 0.06;
      this.playerModel.head.rotation.z = Math.sin(this.elapsed * 1.7) * 0.08;
      this.playerModel.group.rotation.y = Math.PI - 0.3 + Math.sin(this.elapsed * 0.55) * 0.16;
      this.cameraDesired.set(0, 11.5, 17.5);
      this.cameraLook.set(0, 0.6, 0);
    } else {
      const player = this.playerModel.group.position;
      this.cameraDesired.set(player.x, 17.5, player.z + 15.5);
      this.cameraLook.set(player.x, 0.4, player.z - 1.3);
      this.aimReticle.visible = this.mode === "playing" && this.input.pointerActive;
      if (this.aimReticle.visible) {
        this.aimReticle.position.set(this.aimPoint.x, 0.065, this.aimPoint.z);
        this.aimReticle.scale.setScalar(this.carried >= CFG.throwCost ? 1 : 0.65);
        this.aimReticle.rotation.z += 0.018;
      }
    }
    this.camera.position.lerp(this.cameraDesired, this.mode === "title" ? 0.04 : 0.085);
    if (this.trauma > 0 && !this.reducedMotion) {
      const amount = this.trauma * this.trauma * 0.5;
      this.camera.position.x += Math.sin(this.elapsed * 79) * amount;
      this.camera.position.y += Math.sin(this.elapsed * 97) * amount * 0.4;
      this.camera.position.z += Math.cos(this.elapsed * 83) * amount;
      this.trauma = Math.max(0, this.trauma - 0.035);
    } else {
      this.trauma = Math.max(0, this.trauma - 0.06);
    }
    this.camera.lookAt(this.cameraLook);
    this.renderer.render(this.scene, this.camera);
    window.__GAME_READY__ = true;

    this.fpsFrames++;
    const now = performance.now();
    if (now - this.fpsStarted >= 1000) {
      this.fps = (this.fpsFrames * 1000) / (now - this.fpsStarted);
      this.fpsFrames = 0;
      this.fpsStarted = now;
    }
  }

  getProbe(): { x: number; y: number; z: number } {
    const p = this.playerModel.group.position;
    return { x: p.x, y: p.y, z: p.z };
  }

  getStats(): GameStats {
    return {
      fps: this.fps,
      calls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      guests: this.guests.reduce((n, guest) => n + (guest.active ? 1 : 0), 0) + (this.cake.active ? 1 : 0) + (this.boss.active ? 1 : 0),
      candies: this.candies.reduce((n, candy) => n + (candy.active ? 1 : 0), 0),
      particles: this.particles.activeCount,
      renderer: this.gpuRenderer,
    };
  }

  getDebugState(): Record<string, unknown> {
    return {
      mode: this.mode, wave: this.waveIndex, waveTime: this.waveTime, score: this.score,
      carried: this.carried, bankedWave: this.bankedWave, totalBanked: this.totalBanked,
      dashCooldown: this.dashCooldown, shield: this.shield, upgrades: { ...this.upgrades },
      musicalTimer: this.musicalTimer, congaTimer: this.congaTimer,
      cakeState: this.cake.active ? this.cake.state : "inactive",
      bossState: this.boss.active ? this.boss.state : "inactive",
      activeKinds: this.guests.reduce((counts, guest) => {
        if (guest.active) counts[guest.kind] = (counts[guest.kind] || 0) + 1;
        return counts;
      }, {} as Record<string, number>),
      congaX: this.guests.filter((guest) => guest.active && guest.kind === "conga").map((guest) => guest.model.group.position.x),
      stats: { ...this.stats }, render: this.getStats(),
    };
  }

  debugStart(): void { this.startRun(); }
  debugCompleteWave(): void {
    if (this.mode === "playing") {
      this.bankedWave = WAVES[this.waveIndex].quota;
      this.completeWave();
    }
  }
  debugSetWave(index: number): void {
    if (this.mode === "title") this.startRun();
    this.startWave(clamp(Math.floor(index), 0, WAVES.length - 1));
  }
  debugGameOver(): void { if (this.mode === "playing") this.finish(false, "Debug party foul: the piñata has ceased to be structurally hilarious."); }
  debugVictory(): void { if (this.mode === "playing") this.finish(true, "Debug escape: all five party disasters survived."); }
  debugHit(): void { this.invulnerable = 0; this.applyHit("A scientifically scheduled party foul."); }
  debugDash(x = 1, z = 0): void { this.dashCooldown = 0; this.startDash(x, z); }
  debugTeleport(x: number, z: number): void { this.playerModel.group.position.set(x, 0, z); this.playerVelocity.set(0, 0, 0); }
  debugSetCandy(value: number): void { this.carried = Math.max(0, Math.floor(value)); }
  debugThrow(): void { this.aimPoint.copy(this.playerModel.group.position).add(this.temp.set(4, 0, -2)); this.throwCandy(); }
  debugBusy(): void {
    for (let i = 0; i < 20; i++) this.spawnGuest("guest");
    for (let i = 0; i < 30; i++) this.spawnCandy(this.range(-11, 11), this.range(-7, 8), 1, i % 4 === 0);
    this.particles.burst(0, 2, 0, 0xff4f91, 180, 8);
  }
  debugOpenGift(): void { const gift = this.arena.gifts.find((item) => item.active); if (gift) this.openGift(gift); }
  debugChoose(index: number): void { const upgrade = this.currentUpgrades[index]; if (upgrade) this.chooseUpgrade(upgrade.id); }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.loop.stop();
    this.input.dispose();
    this.audio.dispose();
    this.uiRoot.removeEventListener("click", this.onUiClick);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.particles.dispose();
    this.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Sprite) {
        if ("geometry" in object && object.geometry instanceof THREE.BufferGeometry) object.geometry.dispose();
        const material = object.material;
        const materials = Array.isArray(material) ? material : [material];
        for (const item of materials) {
          const withMap = item as THREE.Material & { map?: THREE.Texture | null };
          withMap.map?.dispose();
        }
      }
    });
    disposeModelCaches();
    this.renderer.dispose();
  }
}
