import * as THREE from "three";
import { AudioSystem } from "./audio";
import { GameLoop } from "./engine";
import { Input } from "./input";
import { GameUI } from "./ui";
import { createWorld, type World } from "./world";
import { createCart, createEnemy } from "./models";
import { UPGRADES } from "./content";
import { storage } from "./storage";
import { ARENA, COLORS, DEFAULT_STATS, MAX_ENEMIES, MAX_ENEMY_SHOTS, MAX_PARTICLES, MAX_PICKUPS, MAX_PLAYER_SHOTS, WAVES, clamp, mulberry32 } from "./config";
import type { Enemy, EnemyKind, GameMode, Hazard, Particle, Pickup, Player, Projectile, Quality, SaveData, UpgradeDef } from "./types";

const SAVE_KEY = "soupermarket.save.v1";
const DEFAULT_SAVE: SaveData = { version: 1, highScore: 0, bestWave: 0, runs: 0, wins: 0, banana: false, nightmareUnlocked: false, quality: "high" };
function loadSave(): SaveData {
  const raw = storage.get<Partial<SaveData>>(SAVE_KEY, DEFAULT_SAVE);
  return { version: 1, highScore: Number.isFinite(raw.highScore) ? Math.max(0, Number(raw.highScore)) : 0, bestWave: Number.isFinite(raw.bestWave) ? clamp(Number(raw.bestWave), 0, WAVES.length) : 0, runs: Number.isFinite(raw.runs) ? Math.max(0, Number(raw.runs)) : 0, wins: Number.isFinite(raw.wins) ? Math.max(0, Number(raw.wins)) : 0, banana: raw.banana === true, nightmareUnlocked: raw.nightmareUnlocked === true, quality: raw.quality === "low" ? "low" : "high" };
}

export class SoupermarketGame {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(48, 1, 0.1, 160);
  private input: Input;
  private audio = new AudioSystem();
  private ui: GameUI;
  private world: World;
  private loop: GameLoop;
  private raycaster = new THREE.Raycaster();
  private floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private pointer = new THREE.Vector2(0, 0);
  private pointerDown = false;
  private coarse = matchMedia("(pointer: coarse)").matches;
  private mode: GameMode = "title";
  private previousMode: GameMode = "title";
  private save = loadSave();
  private nightmare = false;
  private rng = mulberry32(0xc0ffee);
  private player: Player;
  private enemies: Enemy[] = [];
  private playerShots: Projectile[] = [];
  private enemyShots: Projectile[] = [];
  private pickups: Pickup[] = [];
  private particles: Particle[] = [];
  private hazards: Hazard[] = [];
  private upgrades = new Map<string, number>();
  private offeredUpgrades: UpgradeDef[] = [];
  private enemyId = 1;
  private wave = 1;
  private spawned = 0;
  private spawnTimer = 0;
  private clearing = false;
  private clearTimer = 0;
  private elapsed = 0;
  private bannerTimer = 0;
  private toastTimer = 0;
  private shake = 0;
  private hitStop = 0;
  private ended = false;
  private scannerSide = -1;
  private secretDashes = 0;
  private bananaActive = false;
  private orbitalTimer = 0;
  private droneTimer = 0;
  private quality: Quality;
  private fps = 60;
  private fpsTime = 0;
  private fpsFrames = 0;
  private lowFpsTime = 0;
  private autoQuality = true;
  private shotMesh: THREE.InstancedMesh;
  private enemyShotMesh: THREE.InstancedMesh;
  private pickupMesh: THREE.InstancedMesh;
  private particleMesh: THREE.InstancedMesh;
  private orbitMeshes: THREE.Mesh[] = [];
  private droneMeshes: THREE.Group[] = [];
  private dummy = new THREE.Object3D();
  private scratch = new THREE.Vector3();
  private cameraTarget = new THREE.Vector3();
  private resizeObserver: ResizeObserver;
  private cleanup: Array<() => void> = [];

  constructor(private canvas: HTMLCanvasElement) {
    this.quality = this.save.quality;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.quality === "high", preserveDrawingBuffer: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.quality === "high" ? 1.6 : 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = this.quality === "high";
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.background = new THREE.Color(COLORS.ink);
    this.scene.fog = new THREE.FogExp2(COLORS.ink, 0.014);
    this.world = createWorld(this.scene);
    this.input = new Input(canvas);
    this.ui = new GameUI((action, value) => this.action(action, value));
    this.player = this.createPlayer();
    this.scene.add(this.player.group);
    this.shotMesh = this.makeInstances(new THREE.SphereGeometry(0.18, 8, 6), new THREE.MeshBasicMaterial({ color: COLORS.acid }), MAX_PLAYER_SHOTS);
    this.enemyShotMesh = this.makeInstances(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: COLORS.pink }), MAX_ENEMY_SHOTS);
    this.pickupMesh = this.makeInstances(new THREE.OctahedronGeometry(0.26, 0), new THREE.MeshStandardMaterial({ color: COLORS.yellow, emissive: COLORS.yellow, emissiveIntensity: 0.5 }), MAX_PICKUPS);
    this.particleMesh = this.makeInstances(new THREE.TetrahedronGeometry(0.12, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), MAX_PARTICLES);
    this.createPools();
    this.createOrbitals();
    this.applyQuality(this.quality, false);
    this.bindEvents();
    this.ui.setMuted(this.audio.muted);
    this.ui.syncTitle(this.save, this.nightmare);
    this.setMode("title");
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(document.documentElement);
    this.camera.position.set(11, 11, 18);
    this.camera.lookAt(0, 1, 0);
    this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.render() });
    this.loop.start();
    this.installDebug();
  }

  private makeInstances(geometry: THREE.BufferGeometry, material: THREE.Material, count: number): THREE.InstancedMesh {
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    mesh.count = count;
    this.scene.add(mesh);
    return mesh;
  }
  private createPools(): void {
    for (let i = 0; i < MAX_PLAYER_SHOTS; i++) this.playerShots.push({ active: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, radius: 0.2, damage: 0, pierce: 0, burn: 0 });
    for (let i = 0; i < MAX_ENEMY_SHOTS; i++) this.enemyShots.push({ active: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, radius: 0.22, damage: 0, pierce: 0, burn: 0 });
    for (let i = 0; i < MAX_PICKUPS; i++) this.pickups.push({ active: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), value: 1, life: 0, banana: false });
    for (let i = 0; i < MAX_PARTICLES; i++) this.particles.push({ active: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), life: 0, maxLife: 0, size: 1, color: new THREE.Color() });
  }
  private createOrbitals(): void {
    const croutonGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42), croutonMat = new THREE.MeshStandardMaterial({ color: COLORS.yellow, emissive: COLORS.yellow, emissiveIntensity: 0.25 });
    const bananaGeo = new THREE.TorusGeometry(0.36, 0.12, 7, 16, Math.PI * 1.35), bananaMat = new THREE.MeshStandardMaterial({ color: 0xffed4a, emissive: 0xffc928, emissiveIntensity: 0.35 });
    for (let i = 0; i < 5; i++) { const mesh = new THREE.Mesh(i === 0 ? bananaGeo : croutonGeo, i === 0 ? bananaMat : croutonMat); mesh.visible = false; mesh.castShadow = true; this.scene.add(mesh); this.orbitMeshes.push(mesh); }
    for (let i = 0; i < 2; i++) { const drone = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.55), new THREE.MeshStandardMaterial({ color: COLORS.purple, emissive: COLORS.purple, emissiveIntensity: 0.25 })); const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshBasicMaterial({ color: COLORS.cyan })); eye.position.set(0, 0, -0.29); drone.add(body, eye); drone.visible = false; this.scene.add(drone); this.droneMeshes.push(drone); }
  }
  private createPlayer(): Player {
    const group = createCart();
    return { group, pos: new THREE.Vector3(0, 0, 4), vel: new THREE.Vector3(), aim: new THREE.Vector3(0, 0, -1), hp: DEFAULT_STATS.maxHp, invulnerable: 0, fireTimer: 0, dashTimer: 0, dashCooldown: 0, scream: 0, coupons: 0, score: 0, kills: 0, combo: 0, comboTimer: 0, dashHits: new Set<number>(), stats: { ...DEFAULT_STATS } };
  }
  private bindEvents(): void {
    const on = <K extends keyof WindowEventMap>(type: K, fn: (event: WindowEventMap[K]) => void, options?: AddEventListenerOptions) => { window.addEventListener(type, fn as EventListener, options); this.cleanup.push(() => window.removeEventListener(type, fn as EventListener, options)); };
    on("pointermove", (event) => { this.pointer.set(event.clientX / innerWidth * 2 - 1, -(event.clientY / innerHeight) * 2 + 1); const crosshair = document.getElementById("crosshair"); if (crosshair) { crosshair.style.left = `${event.clientX}px`; crosshair.style.top = `${event.clientY}px`; } });
    on("pointerdown", (event) => { if (event.button === 0 && event.target === this.canvas) this.pointerDown = true; });
    on("pointerup", (event) => { if (event.button === 0) this.pointerDown = false; });
    on("contextmenu", (event) => { if (event.target === this.canvas) event.preventDefault(); });
    on("blur", () => { this.pointerDown = false; if (this.mode === "playing") this.pause(); });
    on("keydown", (event) => { if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault(); });
  }
  private action(action: string, value?: string): void {
    this.audio.sfx("ui");
    if (action === "start") this.startRun(); else if (action === "help") { this.previousMode = this.mode; this.setMode("help"); } else if (action === "close-help") this.setMode(this.previousMode === "help" ? "title" : this.previousMode); else if (action === "pause") this.pause(); else if (action === "resume") this.resume(); else if (action === "restart") this.startRun(); else if (action === "title") this.toTitle(); else if (action === "mute") { this.ui.setMuted(this.audio.toggleMute()); if (!this.audio.muted) this.audio.startMusic(); } else if (action === "quality") this.applyQuality(this.quality === "high" ? "low" : "high"); else if (action === "nightmare") { this.nightmare = !this.nightmare; this.ui.syncTitle(this.save, this.nightmare); } else if (action === "upgrade" && value && this.mode === "upgrade") this.chooseUpgrade(value); else if (action === "dash") this.tryDash(); else if (action === "scream") this.tryScream(); else if (action === "interact") this.tryInteract();
  }
  private setMode(mode: GameMode): void { this.mode = mode; this.ui.setMode(mode); }
  private startRun(): void {
    this.clearWorldEntities();
    this.rng = mulberry32((Number(new URLSearchParams(location.search).get("seed")) || Date.now()) >>> 0);
    this.player.pos.set(0, 0, 7); this.player.vel.set(0, 0, 0); this.player.aim.set(0, 0, -1); this.player.group.position.copy(this.player.pos); this.player.group.rotation.set(0, 0, 0); this.player.group.scale.set(1, 1, 1);
    this.player.stats = { ...DEFAULT_STATS }; this.player.hp = this.player.stats.maxHp; this.player.invulnerable = 0; this.player.fireTimer = 0; this.player.dashTimer = 0; this.player.dashCooldown = 0; this.player.scream = 0; this.player.coupons = 0; this.player.score = 0; this.player.kills = 0; this.player.combo = 0; this.player.comboTimer = 0;
    this.upgrades.clear(); this.offeredUpgrades = []; this.ui.updateBuild(this.upgrades); this.bananaActive = this.save.banana; this.secretDashes = 0; this.scannerSide = this.player.pos.z > 16.8 ? 1 : -1; this.ended = false; this.elapsed = 0; this.shake = 0; this.pointerDown = false; this.audio.startMusic(); this.beginWave(1);
  }
  private beginWave(wave: number): void {
    this.wave = wave; this.spawned = 0; this.spawnTimer = 0.8; this.clearing = false; this.clearTimer = 0; this.bannerTimer = 2.6; this.save.bestWave = Math.max(this.save.bestWave, wave); storage.set(SAVE_KEY, this.save); this.setMode("playing"); this.ui.showBanner(wave); if (WAVES[wave - 1].boss) this.audio.sfx("boss");
  }
  private toTitle(): void { this.clearWorldEntities(); this.player.pos.set(0, 0, 2); this.player.group.position.copy(this.player.pos); this.player.group.scale.set(1, 1, 1); this.ui.hideBanner(); this.ui.hideToast(); this.ui.syncTitle(this.save, this.nightmare); this.setMode("title"); }
  private pause(): void { if (this.mode !== "playing") return; this.pointerDown = false; this.setMode("paused"); }
  private resume(): void { if (this.mode !== "paused") return; this.setMode("playing"); }
  private clearWorldEntities(): void {
    for (const enemy of this.enemies) this.scene.remove(enemy.group); this.enemies.length = 0;
    for (const hazard of this.hazards) { this.scene.remove(hazard.mesh); hazard.mesh.geometry.dispose(); (hazard.mesh.material as THREE.Material).dispose(); } this.hazards.length = 0;
    for (const shot of this.playerShots) shot.active = false; for (const shot of this.enemyShots) shot.active = false; for (const pickup of this.pickups) pickup.active = false; for (const particle of this.particles) particle.active = false;
  }

  private update(dt: number): void {
    this.handleKeys(); this.world.update(performance.now() / 1000); this.ui.hurtFlash = Math.max(0, this.ui.hurtFlash - dt * 2.3);
    if (this.bannerTimer > 0) { this.bannerTimer -= dt; if (this.bannerTimer <= 0) this.ui.hideBanner(); }
    if (this.toastTimer > 0) { this.toastTimer -= dt; if (this.toastTimer <= 0) this.ui.hideToast(); }
    this.audio.updateMusic(this.mode === "playing" ? Math.min(1, 0.3 + this.wave / 8 + (this.getBoss() ? 0.25 : 0)) : 0.08);
    if (this.mode === "title") { this.player.group.rotation.y += dt * 0.22; this.player.group.position.y = Math.sin(performance.now() / 700) * 0.08; return; }
    if (this.mode !== "playing") return; if (this.hitStop > 0) { this.hitStop -= dt; return; }
    this.elapsed += dt; this.updateAim(); this.updatePlayer(dt); this.updateSpawning(dt); this.updateEnemies(dt); this.updateProjectiles(dt); this.updatePickups(dt); this.updateHazards(dt); this.updateParticles(dt); this.updateCompanions(dt); this.checkWaveClear(dt);
    this.fpsTime += dt; this.fpsFrames++;
    if (this.fpsTime >= 1) { this.fps = this.fpsFrames / this.fpsTime; if (this.fps < 44 && this.enemies.length > 15) this.lowFpsTime += this.fpsTime; else this.lowFpsTime = Math.max(0, this.lowFpsTime - this.fpsTime); if (this.lowFpsTime > 3 && this.quality === "high" && this.autoQuality) this.applyQuality("low", false); this.fpsTime = 0; this.fpsFrames = 0; }
  }
  private handleKeys(): void {
    if (this.input.consumeAction("KeyM")) this.action("mute");
    if (this.mode === "title") { if (this.input.consumeAction("Space") || this.input.consumeAction("Enter")) this.startRun(); if (this.input.consumeAction("KeyH")) this.action("help"); return; }
    if (this.mode === "help") { if (this.input.consumeAction("Escape") || this.input.consumeAction("Space")) this.action("close-help"); return; }
    if (this.mode === "paused") { if (this.input.consumeAction("Escape") || this.input.consumeAction("KeyP")) this.resume(); if (this.input.consumeAction("KeyR")) this.startRun(); return; }
    if (this.mode === "gameover" || this.mode === "victory") { if (this.input.consumeAction("KeyR") || this.input.consumeAction("Enter") || this.input.consumeAction("Space")) this.startRun(); if (this.input.consumeAction("Escape")) this.toTitle(); return; }
    if (this.mode === "upgrade") { for (let i = 0; i < 3; i++) if (this.input.consumeAction(`Digit${i + 1}`) && this.offeredUpgrades[i]) this.chooseUpgrade(this.offeredUpgrades[i].id); return; }
    if (this.input.consumeAction("Escape") || this.input.consumeAction("KeyP")) { this.pause(); return; } if (this.input.consumeAction("Space")) this.tryDash(); if (this.input.consumeAction("KeyQ")) this.tryScream(); if (this.input.consumeAction("KeyE")) this.tryInteract();
  }
  private updateAim(): void {
    if (this.coarse) { const target = this.nearestEnemy(this.player.pos, 30); if (target) this.player.aim.copy(target.pos).sub(this.player.pos).setY(0).normalize(); return; }
    this.raycaster.setFromCamera(this.pointer, this.camera); const hit = this.raycaster.ray.intersectPlane(this.floorPlane, this.scratch); if (hit) { this.player.aim.copy(hit).sub(this.player.pos).setY(0); if (this.player.aim.lengthSq() > 0.01) this.player.aim.normalize(); }
  }
  private updatePlayer(dt: number): void {
    const p = this.player; p.invulnerable = Math.max(0, p.invulnerable - dt); p.dashCooldown = Math.max(0, p.dashCooldown - dt); p.fireTimer -= dt; p.comboTimer -= dt; if (p.comboTimer <= 0 && p.combo > 0) p.combo = Math.max(0, p.combo - dt * 7);
    let moveX = this.input.moveX, moveZ = -this.input.moveZ; const length = Math.hypot(moveX, moveZ); if (length > 1) { moveX /= length; moveZ /= length; } const previousZ = p.pos.z;
    if (p.dashTimer > 0) { p.dashTimer -= dt; p.pos.addScaledVector(p.vel, dt); if (this.rng() < 0.75) this.spawnParticle(p.pos.x, 0.45, p.pos.z, COLORS.cyan, 0.35, 1.3); for (const enemy of this.enemies) { if (enemy.phase === -1 || p.dashHits.has(enemy.id)) continue; const radius = enemy.radius + 0.9; if (p.pos.distanceToSquared(enemy.pos) < radius * radius) { p.dashHits.add(enemy.id); this.damageEnemy(enemy, p.stats.dashDamage, p.vel.x * 0.08, p.vel.z * 0.08); const repair = this.upgrades.get("dashrepair") ?? 0; if (repair) p.hp = Math.min(p.stats.maxHp, p.hp + repair * 3); p.scream = Math.min(100, p.scream + 7); } } }
    else { const responsiveness = 1 - Math.exp(-dt * 15); p.vel.x += (moveX * p.stats.speed - p.vel.x) * responsiveness; p.vel.z += (moveZ * p.stats.speed - p.vel.z) * responsiveness; p.pos.addScaledVector(p.vel, dt); }
    p.pos.x = clamp(p.pos.x, -ARENA + 0.8, ARENA - 0.8); p.pos.z = clamp(p.pos.z, -ARENA + 0.8, ARENA - 0.8);
    if (p.dashTimer > 0 && Math.abs(p.pos.x) < 2.15 && (previousZ - 16.8) * (p.pos.z - 16.8) < 0) this.registerScannerDash(); if (Math.abs(p.pos.z - 16.8) > 0.5) this.scannerSide = p.pos.z > 16.8 ? 1 : -1;
    p.group.position.copy(p.pos); p.group.position.y = Math.sin(this.elapsed * 10) * Math.min(0.04, length * 0.04); p.group.rotation.y = Math.atan2(-p.aim.x, -p.aim.z); const wheels = p.group.userData.wheels as THREE.Mesh[]; for (const wheel of wheels) wheel.rotation.x += p.vel.length() * dt * 2.4; const targetScale = p.dashTimer > 0 ? 1.14 : 1; p.group.scale.lerp(this.scratch.set(targetScale, p.dashTimer > 0 ? 0.88 : 1, targetScale), 0.18); p.group.visible = true; p.group.rotation.z = p.invulnerable > 0 && p.dashTimer <= 0 ? Math.sin(this.elapsed * 40) * 0.045 : 0;
    if ((this.pointerDown || this.coarse) && p.fireTimer <= 0 && p.dashTimer <= 0) { this.firePlayer(); p.fireTimer = 1 / p.stats.fireRate; }
    const vendingDistance = p.pos.distanceTo(this.world.vending.position); this.ui.interact(vendingDistance < 3 ? (p.coupons >= 12 ? "HAGGLE: RANDOM MUTATION + REPAIR • 12 COUPONS" : "THE MACHINE DEMANDS 12 COUPONS") : null);
  }
  private tryDash(): void {
    const p = this.player; if (this.mode !== "playing" || p.dashCooldown > 0 || p.dashTimer > 0) return; let x = this.input.moveX, z = -this.input.moveZ; if (Math.hypot(x, z) < 0.1) { x = p.aim.x; z = p.aim.z; } const inv = 1 / Math.max(0.001, Math.hypot(x, z)); p.vel.set(x * inv * 20, 0, z * inv * 20); p.dashTimer = 0.23; p.dashCooldown = 1.25; p.invulnerable = Math.max(p.invulnerable, 0.32); p.dashHits.clear(); this.shake = Math.max(this.shake, 0.13); this.audio.sfx("dash"); this.spawnBurst(p.pos, COLORS.cyan, 8, 2.6);
  }
  private tryScream(): void {
    const p = this.player; if (this.mode !== "playing" || p.scream < 100) return; p.scream = 0; p.hp = Math.min(p.stats.maxHp, p.hp + 5); p.invulnerable = Math.max(p.invulnerable, 0.65); this.audio.sfx("scream"); this.shake = 0.8; this.hitStop = 0.065;
    for (const enemy of this.enemies) { const d = enemy.pos.distanceTo(p.pos); if (d < 12) { this.scratch.copy(enemy.pos).sub(p.pos).setY(0).normalize(); this.damageEnemy(enemy, 75, this.scratch.x * 1.1, this.scratch.z * 1.1); } }
    for (const shot of this.enemyShots) if (shot.active && shot.pos.distanceToSquared(p.pos) < 180) { shot.active = false; this.spawnBurst(shot.pos, COLORS.pink, 2, 1.5); }
    for (let i = 0; i < 55; i++) { const angle = i / 55 * Math.PI * 2; const particle = this.obtainParticle(); if (!particle) break; particle.pos.copy(p.pos).setY(0.7); particle.vel.set(Math.cos(angle) * 12, 1 + this.rng() * 2, Math.sin(angle) * 12); particle.life = particle.maxLife = 0.55; particle.size = 1.4; particle.color.setHex(i % 2 ? COLORS.pink : COLORS.yellow); }
    this.toast("EXISTENTIAL SCREAM", "Nearby groceries have filed for emotional bankruptcy.");
  }
  private firePlayer(): void {
    const p = this.player, count = p.stats.multishot, spread = 0.13;
    for (let i = 0; i < count; i++) { const offset = (i - (count - 1) / 2) * spread, cos = Math.cos(offset), sin = Math.sin(offset), dx = p.aim.x * cos - p.aim.z * sin, dz = p.aim.x * sin + p.aim.z * cos; this.spawnProjectile(this.playerShots, p.pos.x + dx, 1.15, p.pos.z + dz, dx * p.stats.projectileSpeed, dz * p.stats.projectileSpeed, p.stats.damage, p.stats.pierce, p.stats.burn); }
    this.audio.sfx("shoot"); this.shake = Math.max(this.shake, 0.035); this.spawnParticle(p.pos.x + p.aim.x, 1.15, p.pos.z + p.aim.z, COLORS.acid, 0.18, 1.1);
  }
  private spawnProjectile(pool: Projectile[], x: number, y: number, z: number, vx: number, vz: number, damage: number, pierce = 0, burn = 0): void {
    const shot = pool.find((item) => !item.active); if (!shot) return; shot.active = true; shot.pos.set(x, y, z); shot.vel.set(vx, 0, vz); shot.life = 3.2; shot.damage = damage; shot.pierce = pierce; shot.burn = burn;
  }
  private updateSpawning(dt: number): void {
    if (this.clearing) return; const def = WAVES[this.wave - 1]; if (this.spawned >= def.quota) return; this.spawnTimer -= dt; if (this.spawnTimer > 0 || this.enemies.length >= MAX_ENEMIES) return;
    if (def.boss) { this.spawnEnemy(def.boss); this.spawned = 1; } else { const kind = def.kinds[Math.floor(this.rng() * def.kinds.length)]; this.spawnEnemy(kind); this.spawned++; this.spawnTimer = def.interval * (this.nightmare ? 0.82 : 1); }
  }
  private spawnEnemy(kind: EnemyKind, position?: THREE.Vector3, summoned = false): Enemy | null {
    if (this.enemies.length >= MAX_ENEMIES) return null; const group = createEnemy(kind); let pos = position;
    if (!pos) { const edge = Math.floor(this.rng() * 4), along = (this.rng() * 2 - 1) * (ARENA - 2); pos = new THREE.Vector3(edge === 0 ? -ARENA + 1 : edge === 1 ? ARENA - 1 : along, 0, edge === 2 ? -ARENA + 1 : edge === 3 ? ARENA - 1 : along); if (pos.distanceToSquared(this.player.pos) < 80) pos.multiplyScalar(-1); }
    const stats: Record<EnemyKind, [hp: number, radius: number, speed: number, value: number, points: number]> = { pea: [25, 0.48, 4.4, 1, 80], lemon: [48, 0.66, 2.6, 2, 130], milk: [65, 0.64, 2.2, 2, 170], baguette: [90, 0.72, 2.65, 3, 220], auditor: [145, 0.78, 1.85, 4, 320], fridge: [1050, 1.55, 1.35, 20, 3500], manager: [2100, 1.8, 1.45, 40, 7500] };
    const [baseHp, radius, speed, value, points] = stats[kind], hp = baseHp * (this.nightmare ? 1.45 : 1); group.position.copy(pos); group.scale.setScalar(0.05); this.scene.add(group);
    const enemy: Enemy = { id: this.enemyId++, kind, group, pos: pos.clone(), vel: new THREE.Vector3(), hp, maxHp: hp, radius, speed: speed * (this.nightmare ? 1.12 : 1), attack: 0.7 + this.rng(), special: 2 + this.rng() * 2, phase: -1, timer: kind === "manager" || kind === "fridge" ? 1.2 : 0.62, hit: 0, burn: 0, burnTick: 0, value, points, dead: false, summoned };
    group.userData.baseScale = 1; this.enemies.push(enemy); this.createHazard(pos, radius * 1.35, enemy.timer, 0, false, COLORS.purple); return enemy;
  }

  private updateEnemies(dt: number): void {
    const p = this.player;
    for (const enemy of this.enemies) {
      if (enemy.dead) continue; enemy.hit = Math.max(0, enemy.hit - dt * 5);
      if (enemy.burn > 0) { enemy.burn -= dt; enemy.burnTick -= dt; if (enemy.burnTick <= 0) { enemy.burnTick = 0.35; this.damageEnemy(enemy, 3 + p.stats.burn * 2.2, 0, 0, true); this.spawnParticle(enemy.pos.x, 1, enemy.pos.z, COLORS.pink, 0.4, 1.2); } }
      if (enemy.dead) continue;
      if (enemy.phase === -1) { enemy.timer -= dt; const scale = clamp(1 - enemy.timer / (enemy.kind === "fridge" || enemy.kind === "manager" ? 1.2 : 0.62), 0.05, 1); enemy.group.scale.setScalar(scale); enemy.group.rotation.y += dt * 5; if (enemy.timer <= 0) { enemy.phase = 0; enemy.group.scale.setScalar(1); } continue; }
      enemy.attack -= dt; enemy.special -= dt;
      const dx = p.pos.x - enemy.pos.x, dz = p.pos.z - enemy.pos.z, distance = Math.max(0.001, Math.hypot(dx, dz)), nx = dx / distance, nz = dz / distance;
      enemy.group.rotation.y = Math.atan2(-nx, -nz); let targetVx = nx * enemy.speed, targetVz = nz * enemy.speed;
      if (enemy.kind === "pea") { const wobble = Math.sin(this.elapsed * 5 + enemy.id) * 0.65; targetVx += -nz * wobble; targetVz += nx * wobble; enemy.group.position.y = Math.abs(Math.sin(this.elapsed * 7 + enemy.id)) * 0.22; }
      else if (enemy.kind === "lemon") {
        if (enemy.phase === 1) { enemy.timer -= dt; targetVx = targetVz = 0; enemy.group.scale.setScalar(1 + Math.sin(this.elapsed * 35) * 0.1); if (enemy.timer <= 0) { this.audio.sfx("explosion"); this.spawnBurst(enemy.pos, COLORS.yellow, 18, 6); this.killEnemy(enemy, false); continue; } }
        else if (distance < 3.3 && enemy.attack <= 0) { enemy.phase = 1; enemy.timer = 0.82; enemy.attack = 99; this.createHazard(enemy.pos, 3.1, 0.82, 24, false, COLORS.yellow); }
      } else if (enemy.kind === "milk") {
        const direction = distance < 6 ? -1 : distance > 9.5 ? 1 : 0, strafe = enemy.id % 2 ? 1 : -1; targetVx = nx * enemy.speed * direction + -nz * enemy.speed * 0.75 * strafe; targetVz = nz * enemy.speed * direction + nx * enemy.speed * 0.75 * strafe;
        if (enemy.attack <= 0 && distance < 15) { this.fireEnemy(enemy, nx, nz, 8.5, 11); enemy.attack = this.nightmare ? 1.15 : 1.65; }
      } else if (enemy.kind === "baguette") {
        if (enemy.phase === 1) { enemy.timer -= dt; targetVx = targetVz = 0; enemy.group.scale.set(0.85, 1.2, 0.85); if (enemy.timer <= 0) { enemy.phase = 2; enemy.timer = 0.72; enemy.vel.set(nx * 14, 0, nz * 14); this.audio.sfx("dash"); } }
        else if (enemy.phase === 2) { enemy.timer -= dt; targetVx = enemy.vel.x; targetVz = enemy.vel.z; if (enemy.timer <= 0) { enemy.phase = 0; enemy.attack = 2.2; enemy.group.scale.setScalar(1); } }
        else if (enemy.attack <= 0 && distance < 12) { enemy.phase = 1; enemy.timer = 0.68; this.createHazard(enemy.pos, 1.3, 0.68, 0, false, COLORS.red); }
      } else if (enemy.kind === "auditor") {
        if (distance < 7) { targetVx = -nx * enemy.speed; targetVz = -nz * enemy.speed; }
        if (enemy.attack <= 0 && distance < 14) { for (const offset of [-0.18, 0, 0.18]) { const cos = Math.cos(offset), sin = Math.sin(offset); this.fireEnemy(enemy, nx * cos - nz * sin, nx * sin + nz * cos, 7.2, 13); } enemy.attack = this.nightmare ? 1.65 : 2.3; }
      } else if (enemy.kind === "fridge") {
        const enraged = enemy.hp / enemy.maxHp < 0.48; targetVx *= enraged ? 1.5 : 0.75; targetVz *= enraged ? 1.5 : 0.75;
        if (enemy.attack <= 0) { this.radial(enemy, enraged ? 16 : 11, enraged ? 7.8 : 6.3, 13); enemy.attack = enraged ? 1.45 : 2.35; this.shake = Math.max(this.shake, 0.18); }
        if (enemy.special <= 0) { this.createHazard(p.pos, 3.5, 1.05, 22, false, COLORS.cyan); for (let i = 0; i < (enraged ? 3 : 2); i++) this.spawnEnemy("pea", this.randomNear(enemy.pos, 3), true); enemy.special = enraged ? 3.4 : 5.2; }
      } else if (enemy.kind === "manager") {
        const enraged = enemy.hp / enemy.maxHp < 0.5, strafe = Math.sin(this.elapsed * 0.8) * 1.8; targetVx = nx * enemy.speed * (distance > 8 ? 1 : -0.35) + -nz * strafe; targetVz = nz * enemy.speed * (distance > 8 ? 1 : -0.35) + nx * strafe; enemy.group.position.y = 0.35 + Math.sin(this.elapsed * 2.2) * 0.25;
        if (enemy.attack <= 0) { const count = enraged ? 7 : 5; for (let i = 0; i < count; i++) { const offset = (i - (count - 1) / 2) * 0.14, cos = Math.cos(offset), sin = Math.sin(offset); this.fireEnemy(enemy, nx * cos - nz * sin, nx * sin + nz * cos, enraged ? 10 : 8, 14); } enemy.attack = enraged ? 0.95 : 1.55; }
        if (enemy.special <= 0) { this.radial(enemy, enraged ? 22 : 16, enraged ? 7.5 : 5.8, 12); this.createHazard(p.pos, 4.1, 1.15, 25, false, COLORS.pink); if (this.enemies.length < 12) { this.spawnEnemy("auditor", this.randomNear(enemy.pos, 4), true); if (enraged) this.spawnEnemy("baguette", this.randomNear(enemy.pos, 4), true); } enemy.special = enraged ? 3.3 : 4.8; this.shake = 0.35; }
      }
      if (enemy.kind !== "baguette" || enemy.phase !== 2) { const responsiveness = 1 - Math.exp(-dt * 5); enemy.vel.x += (targetVx - enemy.vel.x) * responsiveness; enemy.vel.z += (targetVz - enemy.vel.z) * responsiveness; }
      enemy.pos.addScaledVector(enemy.vel, dt); enemy.pos.x = clamp(enemy.pos.x, -ARENA + enemy.radius, ARENA - enemy.radius); enemy.pos.z = clamp(enemy.pos.z, -ARENA + enemy.radius, ARENA - enemy.radius); enemy.group.position.x = enemy.pos.x; enemy.group.position.z = enemy.pos.z; if (enemy.kind !== "manager") enemy.group.position.y = Math.max(0, enemy.group.position.y - dt * 0.5);
      if (enemy.phase !== 1 || enemy.kind !== "lemon") { const base = 1 + enemy.hit * 0.13; if (!(enemy.kind === "baguette" && enemy.phase === 1)) enemy.group.scale.set(base, 1 - enemy.hit * 0.08, base); }
      const contactRadius = enemy.radius + 0.58;
      if (enemy.pos.distanceToSquared(p.pos) < contactRadius * contactRadius && p.dashTimer <= 0) { const damage = enemy.kind === "manager" || enemy.kind === "fridge" ? 22 : enemy.kind === "pea" ? 8 : enemy.kind === "baguette" && enemy.phase === 2 ? 20 : 12; this.hurtPlayer(damage); p.vel.x += nx * 8; p.vel.z += nz * 8; }
    }
    if (this.enemies.some((enemy) => enemy.dead)) { for (const enemy of this.enemies) if (enemy.dead) this.scene.remove(enemy.group); this.enemies = this.enemies.filter((enemy) => !enemy.dead); }
  }
  private fireEnemy(enemy: Enemy, nx: number, nz: number, speed: number, damage: number): void { this.spawnProjectile(this.enemyShots, enemy.pos.x + nx * enemy.radius, enemy.kind === "manager" ? 2 : 1.05, enemy.pos.z + nz * enemy.radius, nx * speed, nz * speed, damage); }
  private radial(enemy: Enemy, count: number, speed: number, damage: number): void { for (let i = 0; i < count; i++) { const angle = i / count * Math.PI * 2 + this.elapsed * 0.35; this.fireEnemy(enemy, Math.cos(angle), Math.sin(angle), speed, damage); } this.audio.sfx("shoot"); }
  private randomNear(origin: THREE.Vector3, radius: number): THREE.Vector3 { const angle = this.rng() * Math.PI * 2; return new THREE.Vector3(clamp(origin.x + Math.cos(angle) * radius, -ARENA + 2, ARENA - 2), 0, clamp(origin.z + Math.sin(angle) * radius, -ARENA + 2, ARENA - 2)); }
  private damageEnemy(enemy: Enemy, damage: number, knockX = 0, knockZ = 0, burnTick = false): void {
    if (enemy.dead || enemy.phase === -1) return; enemy.hp -= damage; enemy.hit = burnTick ? enemy.hit : 1; enemy.vel.x += knockX; enemy.vel.z += knockZ;
    if (!burnTick) { this.spawnBurst(enemy.pos, enemy.kind === "lemon" ? COLORS.yellow : COLORS.acid, 3, 2.2); this.audio.sfx("hit"); } if (enemy.hp <= 0) this.killEnemy(enemy, true);
  }
  private killEnemy(enemy: Enemy, reward: boolean): void {
    if (enemy.dead) return; enemy.dead = true; const p = this.player;
    if (reward) { p.kills++; p.combo = Math.floor(p.combo) + 1; p.comboTimer = 3.4; const multiplier = Math.min(4, 1 + Math.floor(p.combo / 5) * 0.25); p.score += Math.floor(enemy.points * multiplier * (this.nightmare ? 1.5 : 1)); p.scream = Math.min(100, p.scream + (enemy.kind === "manager" || enemy.kind === "fridge" ? 35 : 3.5)); const drops = Math.min(7, Math.max(1, enemy.value)); for (let i = 0; i < drops; i++) this.spawnPickup(enemy.pos, Math.max(1, Math.round(enemy.value / drops * p.stats.couponBonus)), false); if (p.stats.explosive > 0 && enemy.kind !== "fridge" && enemy.kind !== "manager") this.createHazard(enemy.pos, 2 + p.stats.explosive * 0.35, 0.12, p.stats.damage * (0.65 + p.stats.explosive * 0.3), true, COLORS.acid); }
    this.spawnBurst(enemy.pos, enemy.kind === "manager" ? COLORS.pink : COLORS.yellow, enemy.kind === "manager" || enemy.kind === "fridge" ? 45 : 12, enemy.radius * 3.5); this.audio.sfx("explosion"); this.shake = Math.max(this.shake, enemy.kind === "manager" || enemy.kind === "fridge" ? 0.75 : 0.12); if (enemy.kind === "manager" || enemy.kind === "fridge") this.hitStop = 0.12;
  }
  private hurtPlayer(amount: number): void {
    const p = this.player; if (p.invulnerable > 0 || p.dashTimer > 0 || this.mode !== "playing") return; p.hp -= amount * (1 - p.stats.armor) * (this.nightmare ? 1.25 : 1); p.invulnerable = 0.78; p.combo = 0; p.comboTimer = 0; this.ui.hurtFlash = 0.75; this.shake = 0.55; this.audio.sfx("hurt");
    if (p.hp <= 0) { if (p.stats.revive > 0) { p.stats.revive--; p.hp = p.stats.maxHp * 0.5; p.invulnerable = 2; p.scream = 100; this.toast("SECOND BREAKFAST", "Death has been postponed until after brunch."); this.audio.sfx("secret"); } else { p.hp = 0; this.endRun(false); } }
  }

  private updateProjectiles(dt: number): void {
    for (const shot of this.playerShots) { if (!shot.active) continue; shot.life -= dt; shot.pos.addScaledVector(shot.vel, dt); if (shot.life <= 0 || Math.abs(shot.pos.x) > ARENA + 3 || Math.abs(shot.pos.z) > ARENA + 3) { shot.active = false; continue; } for (const enemy of this.enemies) { if (enemy.dead || enemy.phase === -1) continue; const radius = shot.radius + enemy.radius, dx = shot.pos.x - enemy.pos.x, dz = shot.pos.z - enemy.pos.z; if (dx * dx + dz * dz < radius * radius) { if (shot.burn > 0) { enemy.burn = Math.max(enemy.burn, 1.5 + shot.burn * 0.5); enemy.burnTick = 0.1; } this.damageEnemy(enemy, shot.damage, shot.vel.x * 0.014, shot.vel.z * 0.014); shot.pierce--; if (shot.pierce < 0) { shot.active = false; break; } shot.damage *= 0.82; shot.pos.addScaledVector(shot.vel, dt * 1.5); } } }
    for (const shot of this.enemyShots) { if (!shot.active) continue; shot.life -= dt; shot.pos.addScaledVector(shot.vel, dt); if (shot.life <= 0 || Math.abs(shot.pos.x) > ARENA + 4 || Math.abs(shot.pos.z) > ARENA + 4) { shot.active = false; continue; } if (shot.pos.distanceToSquared(this.player.pos) < 0.85 * 0.85) { if (this.player.dashTimer > 0) { shot.active = false; this.player.scream = Math.min(100, this.player.scream + 5); this.player.score += 15; this.spawnBurst(shot.pos, COLORS.cyan, 3, 2); } else { shot.active = false; this.hurtPlayer(shot.damage); } } }
  }
  private spawnPickup(origin: THREE.Vector3, value: number, banana: boolean): void { const pickup = this.pickups.find((item) => !item.active); if (!pickup) return; pickup.active = true; pickup.pos.copy(origin); pickup.pos.x += (this.rng() - 0.5) * 0.8; pickup.pos.z += (this.rng() - 0.5) * 0.8; pickup.pos.y = 0; pickup.vel.set((this.rng() - 0.5) * 3, 0, (this.rng() - 0.5) * 3); pickup.value = value; pickup.life = banana ? 9999 : 18; pickup.banana = banana; }
  private updatePickups(dt: number): void {
    for (const pickup of this.pickups) { if (!pickup.active) continue; pickup.life -= dt; if (pickup.life <= 0) { pickup.active = false; continue; } const d2 = pickup.pos.distanceToSquared(this.player.pos), magnet = pickup.banana ? 30 : this.player.stats.magnet; if (d2 < magnet * magnet) { this.scratch.copy(this.player.pos).sub(pickup.pos).setY(0); const distance = Math.max(0.1, this.scratch.length()); this.scratch.multiplyScalar(1 / distance); pickup.vel.addScaledVector(this.scratch, dt * (pickup.banana ? 28 : 18)); } pickup.vel.multiplyScalar(Math.exp(-dt * 4)); pickup.pos.addScaledVector(pickup.vel, dt); if (d2 < 0.85 * 0.85) { pickup.active = false; if (pickup.banana) { this.bananaActive = true; this.save.banana = true; storage.set(SAVE_KEY, this.save); this.audio.sfx("secret"); this.toast("THE GOLDEN BANANA", "Permanent orbital potassium unlocked for every future shift."); this.spawnBurst(this.player.pos, COLORS.yellow, 35, 6); } else { this.player.coupons += pickup.value; this.player.score += pickup.value * 5; this.audio.sfx("pickup"); } } }
  }
  private createHazard(origin: THREE.Vector3, radius: number, duration: number, damage: number, friendly: boolean, color: number): void { const geometry = new THREE.RingGeometry(0.82, 1, 48), material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }), mesh = new THREE.Mesh(geometry, material); mesh.rotation.x = -Math.PI / 2; mesh.position.copy(origin).setY(0.055); mesh.scale.setScalar(radius); this.scene.add(mesh); this.hazards.push({ mesh, pos: origin.clone(), radius, timer: duration, duration, damage, friendly, fired: false }); }
  private updateHazards(dt: number): void {
    for (let i = this.hazards.length - 1; i >= 0; i--) { const hazard = this.hazards[i]; hazard.timer -= dt; const material = hazard.mesh.material as THREE.MeshBasicMaterial; if (!hazard.fired) { const progress = 1 - Math.max(0, hazard.timer) / hazard.duration; material.opacity = 0.25 + progress * 0.65; hazard.mesh.scale.setScalar(hazard.radius * (0.92 + Math.sin(progress * 25) * 0.06)); hazard.mesh.rotation.z += dt * (hazard.friendly ? 4 : -2); } if (hazard.timer <= 0 && !hazard.fired) { hazard.fired = true; hazard.timer = -0.18; material.opacity = 1; hazard.mesh.scale.setScalar(hazard.radius * 1.08); if (hazard.damage > 0) { if (hazard.friendly) { for (const enemy of this.enemies) if (!enemy.dead && enemy.pos.distanceToSquared(hazard.pos) < (hazard.radius + enemy.radius) ** 2) this.damageEnemy(enemy, hazard.damage); } else if (this.player.pos.distanceToSquared(hazard.pos) < (hazard.radius + 0.4) ** 2) this.hurtPlayer(hazard.damage); this.spawnBurst(hazard.pos, hazard.friendly ? COLORS.acid : COLORS.pink, 12, hazard.radius * 1.8); this.audio.sfx("explosion"); } } else if (hazard.fired && hazard.timer <= -0.15) { this.scene.remove(hazard.mesh); hazard.mesh.geometry.dispose(); material.dispose(); this.hazards.splice(i, 1); } }
  }
  private obtainParticle(): Particle | null { return this.particles.find((particle) => !particle.active) ?? null; }
  private spawnParticle(x: number, y: number, z: number, color: number, life = 0.5, speed = 3): void { const particle = this.obtainParticle(); if (!particle) return; particle.active = true; particle.pos.set(x, y, z); particle.vel.set((this.rng() - 0.5) * speed, this.rng() * speed, (this.rng() - 0.5) * speed); particle.life = particle.maxLife = life; particle.size = 0.5 + this.rng(); particle.color.setHex(color); }
  private spawnBurst(origin: THREE.Vector3, color: number, count: number, speed: number): void { const actual = this.quality === "low" ? Math.ceil(count * 0.45) : count; for (let i = 0; i < actual; i++) this.spawnParticle(origin.x, 0.7 + this.rng(), origin.z, color, 0.35 + this.rng() * 0.45, speed); }
  private updateParticles(dt: number): void { for (const particle of this.particles) { if (!particle.active) continue; particle.life -= dt; if (particle.life <= 0) { particle.active = false; continue; } particle.vel.y -= dt * 5; particle.vel.multiplyScalar(Math.exp(-dt * 1.5)); particle.pos.addScaledVector(particle.vel, dt); if (particle.pos.y < 0.05) { particle.pos.y = 0.05; particle.vel.y = Math.abs(particle.vel.y) * 0.35; } } }
  private updateCompanions(dt: number): void {
    const p = this.player, orbitalCount = Math.min(4, p.stats.orbitals + (this.bananaActive ? 1 : 0));
    for (let i = 0; i < this.orbitMeshes.length; i++) { const mesh = this.orbitMeshes[i]; mesh.visible = i < orbitalCount; if (!mesh.visible) continue; const angle = this.elapsed * 2.7 + i / Math.max(1, orbitalCount) * Math.PI * 2, radius = 2.05 + (i % 2) * 0.25; mesh.position.set(p.pos.x + Math.cos(angle) * radius, 0.85 + Math.sin(angle * 2) * 0.25, p.pos.z + Math.sin(angle) * radius); mesh.rotation.set(angle * 0.7, -angle, angle); }
    this.orbitalTimer -= dt; if (this.orbitalTimer <= 0 && orbitalCount > 0) { this.orbitalTimer = 0.19; for (const enemy of this.enemies) { if (enemy.dead || enemy.phase === -1) continue; for (let i = 0; i < orbitalCount; i++) { const radius = enemy.radius + 0.4; if (enemy.pos.distanceToSquared(this.orbitMeshes[i].position) < radius * radius) { this.damageEnemy(enemy, 8 + p.stats.damage * 0.22); break; } } } }
    for (let i = 0; i < this.droneMeshes.length; i++) { const drone = this.droneMeshes[i]; drone.visible = i < p.stats.drones; if (!drone.visible) continue; const angle = this.elapsed * 1.4 + i * Math.PI; drone.position.set(p.pos.x + Math.cos(angle) * 1.35, 1.8 + Math.sin(angle * 2) * 0.15, p.pos.z + Math.sin(angle) * 1.35); const target = this.nearestEnemy(drone.position, 13); if (target) drone.lookAt(target.pos.x, 1.2, target.pos.z); }
    this.droneTimer -= dt; if (this.droneTimer <= 0 && p.stats.drones > 0) { this.droneTimer = 0.68 / p.stats.drones; const drone = this.droneMeshes[Math.floor(this.rng() * p.stats.drones)], target = this.nearestEnemy(drone.position, 13); if (target) { this.scratch.copy(target.pos).sub(drone.position).setY(0).normalize(); this.spawnProjectile(this.playerShots, drone.position.x, drone.position.y, drone.position.z, this.scratch.x * 15, this.scratch.z * 15, 7 + p.stats.damage * 0.28, 0, p.stats.burn); } }
  }
  private nearestEnemy(origin: THREE.Vector3, range: number): Enemy | null { let nearest: Enemy | null = null, best = range * range; for (const enemy of this.enemies) { if (enemy.dead || enemy.phase === -1) continue; const distance = enemy.pos.distanceToSquared(origin); if (distance < best) { best = distance; nearest = enemy; } } return nearest; }
  private checkWaveClear(dt: number): void {
    const def = WAVES[this.wave - 1];
    if (!this.clearing && this.spawned >= def.quota && this.enemies.every((enemy) => enemy.dead)) { this.clearing = true; this.clearTimer = 1.6; this.player.score += this.wave * 500; this.player.coupons += 3; this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + 10); this.toast("AISLE CLEARED", `+${this.wave * 500} shift bonus • 10 integrity repaired`); }
    if (this.clearing) { this.clearTimer -= dt; if (this.clearTimer <= 0) { this.clearing = false; if (this.wave >= WAVES.length) this.endRun(true); else this.showUpgrade(); } }
  }
  private showUpgrade(): void { const available = UPGRADES.filter((upgrade) => (this.upgrades.get(upgrade.id) ?? 0) < upgrade.max); this.offeredUpgrades = []; while (this.offeredUpgrades.length < 3 && available.length) { const index = Math.floor(this.rng() * available.length); this.offeredUpgrades.push(available.splice(index, 1)[0]); } this.ui.showUpgrades(this.offeredUpgrades, this.upgrades); this.setMode("upgrade"); }
  private chooseUpgrade(id: string): void { const upgrade = UPGRADES.find((item) => item.id === id); if (!upgrade) return; this.upgrades.set(id, (this.upgrades.get(id) ?? 0) + 1); upgrade.apply(this.player); this.audio.sfx("upgrade"); this.toast(upgrade.name, upgrade.description); this.beginWave(this.wave + 1); }
  private tryInteract(): void {
    if (this.mode !== "playing" || this.player.pos.distanceTo(this.world.vending.position) > 3) return; if (this.player.coupons < 12) { this.toast("INSUFFICIENT CAPITALISM", "The machine requires 12 coupons. It does not accept emotions."); return; } const available = UPGRADES.filter((upgrade) => (this.upgrades.get(upgrade.id) ?? 0) < upgrade.max); if (!available.length) { this.toast("MAXIMUM CURSE", "The machine has nothing left to teach you."); return; }
    this.player.coupons -= 12; this.player.hp = Math.min(this.player.stats.maxHp, this.player.hp + 25); const upgrade = available[Math.floor(this.rng() * available.length)]; this.upgrades.set(upgrade.id, (this.upgrades.get(upgrade.id) ?? 0) + 1); upgrade.apply(this.player); this.ui.updateBuild(this.upgrades); this.audio.sfx("buy"); this.toast(`VENDED: ${upgrade.name}`, `${upgrade.description} +25 integrity repaired.`);
  }
  private registerScannerDash(): void { if (this.bananaActive) return; this.secretDashes++; if (this.secretDashes < 3) { this.toast(`SUSPICIOUS ACTIVITY ${this.secretDashes} / 3`, "The checkout scanner is beginning to respect you."); this.audio.sfx("pickup"); } else { this.secretDashes = 0; this.spawnPickup(new THREE.Vector3(0, 0, 14.5), 1, true); this.toast("AN ITEM APPROACHES", "Something potassium-rich has rolled out of checkout."); this.audio.sfx("secret"); } }
  private toast(title: string, text: string): void { this.ui.toast(title, text); this.toastTimer = 3.2; }
  private endRun(victory: boolean): void { if (this.ended) return; this.ended = true; this.pointerDown = false; const newBest = this.player.score > this.save.highScore; this.save.highScore = Math.max(this.save.highScore, Math.floor(this.player.score)); this.save.runs++; if (victory) { this.save.wins++; this.save.nightmareUnlocked = true; } storage.set(SAVE_KEY, this.save); this.ui.showEnd(victory, this.player, this.wave, newBest); this.ui.hideBanner(); this.setMode(victory ? "victory" : "gameover"); this.audio.sfx(victory ? "win" : "lose"); }
  get playerPosition(): THREE.Vector3 { return this.player.pos; }
  private getBoss(): Enemy | undefined { return this.enemies.find((enemy) => !enemy.dead && (enemy.kind === "fridge" || enemy.kind === "manager")); }
  private applyQuality(quality: Quality, persist = true): void { this.quality = quality; this.renderer.setPixelRatio(Math.min(devicePixelRatio, quality === "high" ? 1.6 : 1)); this.renderer.shadowMap.enabled = quality === "high"; this.ui.setQuality(quality); if (persist) { this.autoQuality = false; this.save.quality = quality; storage.set(SAVE_KEY, this.save); } this.resize(); }

  private render(): void {
    const p = this.player;
    if (this.mode === "title" || this.mode === "help") { const time = performance.now() / 1000; this.camera.position.set(10 + Math.sin(time * 0.13) * 2, 9.5, 16 + Math.cos(time * 0.13) * 2); this.camera.lookAt(0, 1.1, 1); }
    else { this.cameraTarget.copy(p.pos).addScaledVector(p.aim, 1.25); this.camera.position.x += (this.cameraTarget.x - this.camera.position.x) * 0.085; this.camera.position.y += (14.8 - this.camera.position.y) * 0.085; this.camera.position.z += (this.cameraTarget.z + 12.2 - this.camera.position.z) * 0.085; if (this.shake > 0) { this.shake = Math.max(0, this.shake - 0.025); const time = performance.now() * 0.06; this.camera.position.x += Math.sin(time * 1.7) * this.shake * 0.24; this.camera.position.y += Math.cos(time * 2.1) * this.shake * 0.18; } this.camera.lookAt(this.cameraTarget.x, 0.4, this.cameraTarget.z - 1.2); }
    this.updateInstances(this.shotMesh, this.playerShots, 1); this.updateInstances(this.enemyShotMesh, this.enemyShots, 1.15); this.renderPickups(); this.renderParticles();
    const def = WAVES[this.wave - 1], alive = this.enemies.reduce((sum, enemy) => sum + (!enemy.dead ? 1 : 0), 0); this.ui.update(p, this.wave, Math.max(0, def.quota - this.spawned + alive), this.getBoss(), this.elapsed); this.renderer.render(this.scene, this.camera); window.__GAME_READY__ = true;
  }
  private updateInstances(mesh: THREE.InstancedMesh, pool: Projectile[], scale: number): void { for (let i = 0; i < pool.length; i++) { const shot = pool[i]; this.dummy.position.copy(shot.pos); this.dummy.rotation.set(this.elapsed * 5, this.elapsed * 7, 0); this.dummy.scale.setScalar(shot.active ? scale : 0); this.dummy.updateMatrix(); mesh.setMatrixAt(i, this.dummy.matrix); } mesh.instanceMatrix.needsUpdate = true; }
  private renderPickups(): void { for (let i = 0; i < this.pickups.length; i++) { const pickup = this.pickups[i]; this.dummy.position.set(pickup.pos.x, 0.45 + Math.sin(this.elapsed * 5 + i) * 0.13, pickup.pos.z); this.dummy.rotation.set(0, this.elapsed * 2 + i, 0); this.dummy.scale.setScalar(pickup.active ? (pickup.banana ? 2.4 : 1) : 0); this.dummy.updateMatrix(); this.pickupMesh.setMatrixAt(i, this.dummy.matrix); } this.pickupMesh.instanceMatrix.needsUpdate = true; }
  private renderParticles(): void { for (let i = 0; i < this.particles.length; i++) { const particle = this.particles[i]; this.dummy.position.copy(particle.pos); this.dummy.rotation.set(this.elapsed * 3 + i, this.elapsed * 4, 0); const life = particle.maxLife > 0 ? particle.life / particle.maxLife : 0; this.dummy.scale.setScalar(particle.active ? particle.size * Math.min(1, life * 2) : 0); this.dummy.updateMatrix(); this.particleMesh.setMatrixAt(i, this.dummy.matrix); this.particleMesh.setColorAt(i, particle.color); } this.particleMesh.instanceMatrix.needsUpdate = true; if (this.particleMesh.instanceColor) this.particleMesh.instanceColor.needsUpdate = true; }
  private resize(): void { const width = this.canvas.clientWidth || innerWidth, height = this.canvas.clientHeight || innerHeight; this.camera.aspect = width / Math.max(1, height); this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false); }
  private installDebug(): void {
    if (!new URLSearchParams(location.search).has("debug")) return;
    const debug = {
      snapshot: () => ({ mode: this.mode, wave: this.wave, hp: this.player.hp, maxHp: this.player.stats.maxHp, score: this.player.score, coupons: this.player.coupons, enemies: this.enemies.length, enemyShots: this.enemyShots.filter((shot) => shot.active).length, playerShots: this.playerShots.filter((shot) => shot.active).length, particles: this.particles.filter((particle) => particle.active).length, drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, fps: this.fps, quality: this.quality, banana: this.bananaActive, upgrades: Object.fromEntries(this.upgrades), save: this.save, renderer: this.renderer.getContext().getParameter(this.renderer.getContext().RENDERER) }),
      start: () => this.startRun(), pause: () => this.pause(), resume: () => this.resume(), win: () => this.endRun(true), lose: () => { this.player.invulnerable = 0; this.hurtPlayer(99999); },
      clearWave: () => { this.spawned = WAVES[this.wave - 1].quota; for (const enemy of this.enemies) this.killEnemy(enemy, true); }, upgrade: () => this.showUpgrade(),
      busy: () => { this.startRun(); this.clearWorldEntities(); this.beginWave(6); const kinds: EnemyKind[] = ["pea", "lemon", "milk", "baguette", "auditor"]; for (let i = 0; i < 34; i++) this.spawnEnemy(kinds[i % kinds.length], this.randomNear(new THREE.Vector3(), 8 + this.rng() * 10)); this.bannerTimer = 0; this.ui.hideBanner(); },
      boss: (kind: "fridge" | "manager") => { this.startRun(); this.clearWorldEntities(); this.beginWave(kind === "fridge" ? 3 : 7); this.spawnEnemy(kind, new THREE.Vector3(0, 0, -6)); this.spawned = 1; this.bannerTimer = 0; this.ui.hideBanner(); },
      secret: () => { this.bananaActive = false; this.secretDashes = 2; this.registerScannerDash(); }, vending: () => { this.player.coupons = 50; this.player.pos.copy(this.world.vending.position).add(new THREE.Vector3(1.5, 0, 0)); }, scream: () => { this.player.scream = 100; }, hurt: (amount = 20) => { this.player.invulnerable = 0; this.hurtPlayer(amount); }, quality: (quality: Quality) => this.applyQuality(quality),
    };
    (window as unknown as { __souperDebug?: typeof debug }).__souperDebug = debug;
  }
  dispose(): void {
    this.loop.stop(); this.resizeObserver.disconnect(); for (const off of this.cleanup) off(); this.input.dispose(); this.audio.dispose(); this.ui.dispose();
    this.scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; for (const material of materials) { if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose(); material.dispose(); } } }); this.renderer.dispose(); delete (window as unknown as { __souperDebug?: unknown }).__souperDebug;
  }
}
