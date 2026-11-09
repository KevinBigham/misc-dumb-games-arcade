import * as THREE from "three";
import { GameLoop } from "./engine";
import { Input } from "./input";
import { AudioSystem } from "./audio";
import { ParticleField } from "./particles";
import { GameUI } from "./ui";
import { COLORS, GAME, WORLD } from "./config";
import { DEPARTMENTS, LAWS, UPGRADES } from "./content";
import { createAimReticle, createBoss, createCalculator, createDesk, createDuck, createForm, createPlayer, createStapler, createTelegraph, createTrayTarget } from "./visuals";
import type { BossState, Form, FormKind, GameMode, GameSnapshot, LawDef, LawId, PlayerState, Prop, RunStats, SaveData, UpgradeDef } from "./types";
import { clamp, damp, distSq, Random } from "./utils";
const FORM_KINDS: FormKind[] = ["standard", "urgent", "carbon", "classified", "golden"];
const TRAY_SPOTS = [[-10.6, -5.6], [10.4, 5.4], [-10.2, 5.5], [10.4, -5.5], [0, 6.3]] as const;
const FORM_VALUES: Record<FormKind, number> = { standard: 100, urgent: 160, carbon: 130, classified: 240, golden: 360 };
interface ActiveLaw { def: LawDef; remaining: number }
export class StampDutyGame {
  readonly renderer: THREE.WebGLRenderer; readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-20, 20, 12, -12, 0.1, 100);
  readonly input: Input; readonly audio: AudioSystem; readonly ui: GameUI; readonly loop: GameLoop;
  private rng: Random; private particles = new ParticleField(); private playerVisual = createPlayer(); private stackVisual: THREE.Group;
  private aimReticle = createAimReticle(); private telegraph = createTelegraph(); private desk: ReturnType<typeof createDesk>;
  private forms: Form[] = []; private props: Prop[] = []; private stack: Form[] = []; private activeLaws: ActiveLaw[] = [];
  private player: PlayerState = { x: 0, y: WORLD.playerBaseY, z: 3, vx: 0, vy: 0, vz: 0, aimX: 0, aimZ: -1, charge: 0, charging: false, airborne: false, lastPower: 0, invulnerable: 0 };
  private boss: BossState; private mode: GameMode = "title"; private department = 0; private quota = 0; private spawnTimer = 0;
  private memoTimer: number = GAME.firstMemo; private memoCount = 0; private combo = 0; private comboTimer = 0; private trayIndex = 0;
  private trayX: number = TRAY_SPOTS[0][0]; private trayZ: number = TRAY_SPOTS[0][1]; private upgradeLevels: Record<string, number> = {};
  private stats: RunStats = this.emptyStats(); private save: SaveData; private hitStop = 0; private trauma = 0; private shakeClock = 0; private visualTime = 0;
  private disposed = false; private bossBankProgress = 0; private insuranceUsed = false; private stampHintShown = false; private bankHintShown = false; private lowPowerToast = 0;
  private raycaster = new THREE.Raycaster(); private pointerNdc = new THREE.Vector2(); private aimPoint = new THREE.Vector3(); private groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private fps = 60; private lastRender = performance.now();
  constructor(private canvas: HTMLCanvasElement, uiRoot: HTMLElement) {
    const seedParam = new URLSearchParams(location.search).get("seed"); this.rng = new Random(seedParam ? Number(seedParam) || 1 : 0x57a9d); this.save = this.loadSave();
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75)); this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.08;
    this.scene.background = new THREE.Color(COLORS.background); this.scene.fog = new THREE.Fog(COLORS.background, 36, 68);
    this.camera.position.set(0, 23, 18); this.camera.lookAt(0, 0, 0);
    this.scene.add(new THREE.HemisphereLight(0xfff4df, 0x24314a, 2.15));
    const sun = new THREE.DirectionalLight(0xffffff, 3.1); sun.position.set(-8, 18, 11); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -18; sun.shadow.camera.right = 18; sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14; sun.shadow.camera.near = 1; sun.shadow.camera.far = 45; sun.shadow.bias = -0.0004; this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x8eb7ff, 0.65); fill.position.set(12, 8, -10); this.scene.add(fill);
    this.desk = createDesk(this.scene); this.desk.tray.add(createTrayTarget()); this.scene.add(this.playerVisual, this.aimReticle, this.telegraph, this.particles.mesh);
    this.stackVisual = this.playerVisual.userData.stack as THREE.Group;
    this.boss = { active: false, x: 0, z: -4, vx: 0, vz: 0, hp: 12, maxHp: 12, attackTimer: 2.4, telegraph: 0, targetX: 0, targetZ: 0, stunned: 0, phase: 0, visual: createBoss() };
    this.scene.add(this.boss.visual); this.createFormPool(); this.createProps(); this.input = new Input(canvas); this.audio = new AudioSystem(this.save.muted); this.ui = new GameUI(uiRoot); this.bindUI();
    this.resize(); window.addEventListener("resize", this.resize); document.addEventListener("visibilitychange", this.onVisibility);
    this.resetWorld(true); this.ui.setRecord(this.save.best, this.save.wins); this.ui.setMuted(this.save.muted); this.ui.setShake(this.save.shake);
    this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.render() }); this.loop.start();
  }
  getSnapshot = (): GameSnapshot => ({
    mode: this.mode, department: this.department, score: Math.round(this.stats.score), quota: this.quota,
    quotaTarget: this.department < 4 ? DEPARTMENTS[this.department].quota : 0, combo: this.combo, stack: this.stack.length, stackMax: this.stackCapacity,
    strikes: this.stats.strikes, charge: this.player.charge, bossHp: this.boss.hp, bossMaxHp: this.boss.maxHp,
    fps: Math.round(this.fps), calls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles,
    entities: this.activeFormCount + this.props.length + (this.boss.active ? 1 : 0) + 1,
  });
  getProbe = () => ({ x: this.player.x, y: this.player.y, z: this.player.z });
  forceLaw = (id: LawId) => { const def = LAWS.find((law) => law.id === id); if (def) this.enactLaw(def); };
  forceBoss = () => { if (this.mode === "title") this.startRun(); this.department = 4; this.startBoss(); };
  forceGameOver = () => { if (this.mode === "title") this.startRun(); this.stats.strikes = 3; this.endRun(false); };
  forceVictory = () => { if (this.mode === "title") this.startRun(); this.department = 4; this.stats.departments = 4; this.boss.hp = 0; this.endRun(true); };
  spawnBusy = () => {
    if (this.mode === "title") this.startRun(); this.department = 3;
    for (let i = 0; i < 26; i++) this.spawnForm(this.rng.pick(DEPARTMENTS[3].forms));
    this.enactLaw(LAWS.find((law) => law.id === "fan")!); this.enactLaw(LAWS.find((law) => law.id === "jelly")!);
    for (let i = 0; i < 8; i++) this.particles.burst(this.rng.range(-8, 8), this.rng.range(-5, 5), COLORS.coral, 25, 5);
  };
  forceUpgrade = () => { if (this.mode === "title") this.startRun(); if (this.mode === "playing" && this.department < 4) this.completeDepartment(); };
  testSlam = () => {
    if (this.mode === "title") this.startRun();
    const form = this.forms.find((item) => item.active && !item.stamped);
    if (form) { this.player.x = form.x; this.player.z = form.z; this.player.y = WORLD.playerBaseY; this.player.airborne = false; this.slam(0.9); }
    return this.getSnapshot();
  };
  testBank = () => {
    if (!this.stack.length) this.testSlam();
    this.player.airborne = false; this.player.x = this.trayX; this.player.z = this.trayZ; this.updateBanking();
    return this.getSnapshot();
  };
  testBossHit = () => {
    if (!this.boss.active) this.forceBoss();
    this.player.x = this.boss.x + 1; this.player.z = this.boss.z; this.player.airborne = false; this.slam(0.95);
    return this.getSnapshot();
  };
  dispose(): void {
    if (this.disposed) return; this.disposed = true; this.loop.stop(); this.input.dispose(); this.audio.dispose();
    window.removeEventListener("resize", this.resize); document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; for (const material of materials) { (material as THREE.MeshBasicMaterial).map?.dispose(); material.dispose(); } } });
    this.renderer.dispose();
  }
  private bindUI(): void {
    this.ui.onStart = () => this.startRun(); this.ui.onResume = () => this.togglePause(); this.ui.onRestart = () => this.startRun(); this.ui.onPause = () => this.togglePause();
    this.ui.onMute = () => { this.save.muted = !this.save.muted; this.audio.setMuted(this.save.muted); this.ui.setMuted(this.save.muted); this.persist(); };
    this.ui.onShake = () => { this.save.shake = !this.save.shake; this.ui.setShake(this.save.shake); this.persist(); };
    this.ui.onUpgrade = (id) => this.chooseUpgrade(id);
  }
  private startRun(): void { this.audio.unlock(); this.audio.sfx("ui"); this.resetWorld(false); this.mode = "playing"; this.ui.setMode(this.mode); this.ui.showToast("HOLD. AIM. BECOME STATIONERY.", "neutral"); }
  private resetWorld(title: boolean): void {
    for (const form of this.forms) { form.active = false; form.stamped = false; form.visual.removeFromParent(); form.visual.scale.setScalar(1); }
    this.stackVisual.clear(); this.stack.length = 0; this.activeLaws.length = 0; this.department = 0; this.quota = 0; this.combo = 0; this.comboTimer = 0; this.spawnTimer = 0; this.memoTimer = GAME.firstMemo; this.memoCount = 0; this.trayIndex = 0;
    this.trayX = TRAY_SPOTS[0][0]; this.trayZ = TRAY_SPOTS[0][1]; this.upgradeLevels = {}; this.stats = this.emptyStats();
    this.boss.active = false; this.boss.visual.visible = false; this.boss.hp = this.boss.maxHp; this.boss.telegraph = 0; this.telegraph.visible = false; this.bossBankProgress = 0; this.insuranceUsed = false; this.stampHintShown = false; this.bankHintShown = false;
    Object.assign(this.player, { x: 0, y: WORLD.playerBaseY, z: 3, vx: 0, vy: 0, vz: 0, aimX: 0, aimZ: -1, charge: 0, charging: false, airborne: false, lastPower: 0, invulnerable: 0 });
    for (const prop of this.props) { prop.x = prop.homeX; prop.z = prop.homeZ; prop.vx = 0; prop.vz = 0; prop.cooldown = 0; prop.telegraph = 0; prop.visual.position.set(prop.x, 0, prop.z); }
    this.desk.tray.position.set(this.trayX, 0, this.trayZ); this.desk.fan.visible = false; this.desk.hole.visible = false; this.desk.coffee.visible = false;
    const count = title ? 7 : 5; for (let i = 0; i < count; i++) this.spawnForm(title && i === 2 ? "golden" : "standard");
    this.mode = title ? "title" : "playing"; this.ui.setMode(this.mode); this.input?.reset();
  }
  private update(dt: number): void {
    this.visualTime += dt; this.ui.tick(dt); if (this.input.consume("KeyM")) this.ui.onMute();
    if (this.input.consume("Escape") || this.input.consume("KeyP")) { if (this.mode === "playing" || this.mode === "paused") this.togglePause(); }
    if (this.input.consume("KeyR") && (this.mode === "gameover" || this.mode === "victory" || this.mode === "paused")) this.startRun();
    if (this.mode === "title") { if (this.input.consume("Space")) this.startRun(); this.updateTitle(dt); this.particles.update(dt); this.input.endStep(); return; }
    if (this.mode === "paused" || this.mode === "upgrade") { this.input.endStep(); return; }
    if (this.mode === "gameover" || this.mode === "victory") { this.particles.update(dt); this.input.endStep(); return; }
    if (this.hitStop > 0) { this.hitStop -= dt; this.particles.update(dt * 0.25); this.input.endStep(); return; }
    this.stats.elapsed += dt; this.player.invulnerable = Math.max(0, this.player.invulnerable - dt); this.lowPowerToast = Math.max(0, this.lowPowerToast - dt);
    this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0;
    this.updateAim(); this.updatePlayer(dt); this.updateForms(dt); this.updateProps(dt); this.updateLaws(dt); this.updateDirector(dt); if (this.department === 4) this.updateBoss(dt); this.updateBanking(); this.particles.update(dt);
    this.audio.setIntensity(this.department / 4 + Math.min(0.35, this.combo * 0.04)); this.audio.update(dt, true); this.input.endStep();
  }
  private updateTitle(dt: number): void {
    for (const form of this.forms) { if (!form.active) continue; form.rot += dt * 0.12 * Math.sin(form.seed); form.visual.rotation.y = form.rot; form.visual.position.y = 0.06 + Math.sin(this.visualTime * 1.4 + form.seed) * 0.04; }
    this.desk.tray.rotation.y = Math.sin(this.visualTime * 0.45) * 0.05; this.playerVisual.rotation.y = Math.sin(this.visualTime * 0.6) * 0.3; this.updatePropVisuals(dt);
  }
  private updateAim(): void {
    this.pointerNdc.set(this.input.pointerX / innerWidth * 2 - 1, -(this.input.pointerY / innerHeight) * 2 + 1); this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    if (this.raycaster.ray.intersectPlane(this.groundPlane, this.aimPoint)) { const dx = this.aimPoint.x - this.player.x, dz = this.aimPoint.z - this.player.z, length = Math.hypot(dx, dz); if (length > 0.1) { this.player.aimX = dx / length; this.player.aimZ = dz / length; } }
  }
  private updatePlayer(dt: number): void {
    const p = this.player, chargeInput = this.input.pointerDown || this.input.isDown("Space"), released = this.input.consumeRelease();
    if (!p.airborne && chargeInput) {
      if (!p.charging) { p.charging = true; p.charge = 0; this.audio.sfx("charge"); }
      p.charge += dt / (GAME.chargeTime * (1 + 0.35 * (this.upgradeLevels.overcommit || 0)));
      if (p.charge >= GAME.overchargeAt) this.launch(true);
    } else if (p.charging && (released || !chargeInput)) this.launch(false); else if (released) p.charge = 0;
    const stackDrag = Math.max(0.45, 1 - this.stack.length * 0.047 * (1 - 0.2 * (this.upgradeLevels.ergonomic || 0)));
    let speed = GAME.moveSpeed * stackDrag * (1 + 0.15 * (this.upgradeLevels.ergonomic || 0)); if (this.hasLaw("coffee")) speed *= 1.3; if (p.charging) speed *= 0.52;
    const mx = this.input.moveX, mz = this.input.moveZ, moveLength = Math.hypot(mx, mz) || 1, control = p.airborne ? 2.1 : 15;
    p.vx += (mx / moveLength) * speed * control * dt; p.vz += (mz / moveLength) * speed * control * dt;
    if (!p.airborne) {
      let friction = this.hasLaw("friction") ? 1.1 : this.hasLaw("adhesive") ? 15 : GAME.groundFriction;
      if (this.desk.coffee.visible && distSq(p.x, p.z, -6.3, 2.8) < 4.2) friction = 0.9;
      const drag = Math.exp(-friction * dt); if (mx === 0) p.vx *= drag; if (mz === 0) p.vz *= drag;
      const groundSpeed = Math.hypot(p.vx, p.vz); if (groundSpeed > speed && !p.charging) { p.vx *= speed / groundSpeed; p.vz *= speed / groundSpeed; }
    } else { p.vy -= GAME.gravity * dt; p.y += p.vy * dt; }
    p.x += p.vx * dt; p.z += p.vz * dt; this.collideWalls(); if (this.hasLaw("fan")) p.vx += Math.sin(this.visualTime * 0.8) * 2.1 * dt; if (this.hasLaw("hole")) this.applyHoleForce(p, dt, 0.55);
    if (p.airborne && p.y <= WORLD.playerBaseY) { p.y = WORLD.playerBaseY; p.airborne = false; this.slam(p.lastPower); p.vx *= 0.32; p.vz *= 0.32; }
  }
  private launch(overcharge: boolean): void {
    const p = this.player; if (p.airborne || !p.charging) return;
    const power = clamp(p.charge, 0.12, 1.12), wobble = overcharge ? Math.sin(this.visualTime * 23) * 0.24 : 0, cos = Math.cos(wobble), sin = Math.sin(wobble);
    const ax = p.aimX * cos - p.aimZ * sin, az = p.aimX * sin + p.aimZ * cos, speed = GAME.minLaunch + power * GAME.launchRange;
    p.vx = ax * speed; p.vz = az * speed; p.vy = 5.2 + power * 2.3; p.airborne = true; p.lastPower = power; p.charging = false; p.charge = 0;
    this.audio.sfx(overcharge ? "overcharge" : "slam", 0.35); if (overcharge) this.ui.showToast("OVERCOMMITTED. HR IS WATCHING.", "bad");
  }
  private slam(power: number): void {
    const p = this.player;
    const radius = (GAME.baseSlamRadius + power * 1.25 + this.stack.length * 0.035) * (1 + 0.22 * (this.upgradeLevels.sole || 0)) * (this.hasLaw("adhesive") ? 1.18 : 1);
    this.audio.sfx("slam", 0.65 + power * 0.35); this.particles.burst(p.x, p.z, COLORS.coral, 18 + Math.floor(power * 18), 3.5 + power * 3); this.addTrauma(0.18 + power * 0.18); this.hitStop = 0.025 + power * 0.025;
    let stampedNow = 0;
    for (const form of this.forms) {
      if (!form.active || form.stamped) continue; const d2 = distSq(p.x, p.z, form.x, form.z); if (d2 > radius * radius) continue;
      if (form.kind === "classified" && power < 0.55 && !this.upgradeLevels.redink) {
        const d = Math.sqrt(d2) || 1; form.vx += (form.x - p.x) / d * 7; form.vz += (form.z - p.z) / d * 7;
        if (this.lowPowerToast <= 0) { this.ui.showToast("CLASSIFIED: NEEDS 55% COMMITMENT", "bad"); this.lowPowerToast = 2; } continue;
      }
      if (this.stack.length >= this.stackCapacity) { if (this.lowPowerToast <= 0) { this.ui.showToast("STACK FULL — FILE IT IN OUT", "neutral"); this.lowPowerToast = 2; } continue; }
      this.stampForm(form); stampedNow++;
    }
    if (stampedNow >= 3) { this.stats.score += stampedNow * 35; this.ui.showToast(`${stampedNow} FORMS. ONE POOR DECISION. +${stampedNow * 35}`, "good"); }
    if (stampedNow > 0 && !this.stampHintShown) { this.stampHintShown = true; this.ui.showToast("CARRY YOUR STACK TO THE MINT OUT TRAY", "good"); }
    for (const prop of this.props) {
      if (distSq(p.x, p.z, prop.x, prop.z) > (radius + 0.8) ** 2) continue;
      if (prop.kind === "calculator" && prop.cooldown <= 0) { prop.cooldown = 2; this.stats.calculators++; this.stats.score += 75; this.particles.burst(prop.x, prop.z, COLORS.mint, 16, 4); this.ui.showToast("CALCULATOR ASSAULT +75", "good"); }
      if (prop.kind === "duck" && prop.cooldown <= 0) { prop.cooldown = 2; this.stats.ducks++; this.audio.sfx("quack"); this.ui.showToast("DUCK DISTURBED. IT OUTRANKS YOU.", "neutral"); }
      const dx = prop.x - p.x, dz = prop.z - p.z, d = Math.hypot(dx, dz) || 1; prop.vx += dx / d * (this.hasLaw("jelly") ? 10 : 5); prop.vz += dz / d * (this.hasLaw("jelly") ? 10 : 5);
      if (this.upgradeLevels.ricochet) { p.airborne = true; p.vy = 6.4; p.lastPower = Math.max(0.45, power * 0.8); p.vx = -dx / d * 9; p.vz = -dz / d * 9; }
    }
    if (this.boss.active && distSq(p.x, p.z, this.boss.x, this.boss.z) < (radius + 1.5) ** 2) {
      if (power >= 0.35) this.damageBoss(power); else if (this.lowPowerToast <= 0) { this.ui.showToast("THE AUDITOR REQUESTS MORE COMMITMENT", "bad"); this.lowPowerToast = 2; }
    }
  }
  private stampForm(form: Form): void {
    form.stamped = true; this.stack.push(form); this.scene.remove(form.visual); this.stackVisual.add(form.visual);
    const index = this.stack.length - 1; form.visual.scale.setScalar(0.63); form.visual.position.set(Math.sin(index * 1.7) * 0.1, index * 0.095, Math.cos(index * 1.3) * 0.08); form.visual.rotation.set(0, index * 0.19, 0); form.deadlineBar.visible = false;
    this.combo = this.comboTimer > 0 ? Math.min(9, this.combo + 1) : 1; this.comboTimer = GAME.comboWindow; this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo); this.stats.stamped++; this.stats.biggestStack = Math.max(this.stats.biggestStack, this.stack.length); this.stats.score += 15 * this.combo;
    this.audio.sfx("stamp", this.combo); this.particles.burst(form.x, form.z, FORM_VALUES[form.kind] > 200 ? COLORS.yellow : COLORS.paper, 8, 2.3, 0.5);
    if (form.kind === "golden") { for (const other of this.forms) if (other.active && !other.stamped) other.deadline = Math.min(other.maxDeadline, other.deadline + 4); this.ui.showToast("GOLDEN FORM: EVERY DEADLINE +4s", "good"); }
    if (form.kind === "carbon" && !form.split) { form.split = true; const copy = this.spawnForm("standard", form.x + 0.6, form.z - 0.4); if (copy) { copy.deadline = Math.max(8, copy.deadline - 3); copy.maxDeadline = copy.deadline; } }
  }
  private updateForms(dt: number): void {
    const p = this.player, duck = this.props.find((prop) => prop.kind === "duck")!;
    for (const form of this.forms) {
      if (!form.active || form.stamped) continue; if (this.stats.elapsed > GAME.noLoseTime && !this.hasLaw("lunch")) form.deadline -= dt; if (form.deadline <= 0) { this.shredForm(form); continue; }
      const dx = form.x - p.x, dz = form.z - p.z, d2 = dx * dx + dz * dz;
      if (d2 < 30) { const d = Math.sqrt(d2) || 1, speed = form.kind === "urgent" ? 5.1 : form.kind === "golden" ? 5.7 : form.kind === "classified" ? 3.2 : 4.1, fear = (1 - d / Math.sqrt(30)) * speed; form.vx += dx / d * fear * dt * 8; form.vz += dz / d * fear * dt * 8; }
      form.vx += Math.sin(this.visualTime * 0.7 + form.seed) * 0.28 * dt; form.vz += Math.cos(this.visualTime * 0.6 + form.seed) * 0.28 * dt;
      if (this.hasLaw("duck")) { const dxD = duck.x - form.x, dzD = duck.z - form.z, d = Math.hypot(dxD, dzD) || 1; form.vx += dxD / d * 4.5 * dt; form.vz += dzD / d * 4.5 * dt; }
      if (this.hasLaw("hole")) this.applyHoleForce(form, dt, 1.1); if (this.hasLaw("fan")) form.vx += Math.sin(this.visualTime * 0.8) * 2.8 * dt;
      const drag = Math.exp(-(this.hasLaw("jelly") ? 1.1 : 2.5) * dt); form.vx *= drag; form.vz *= drag; form.x += form.vx * dt; form.z += form.vz * dt; form.rot += form.vr * dt;
      const bounce = this.hasLaw("jelly") ? -0.95 : -0.55;
      if (form.x < -WORLD.halfW + 0.8 || form.x > WORLD.halfW - 0.8) { form.x = clamp(form.x, -WORLD.halfW + 0.8, WORLD.halfW - 0.8); form.vx *= bounce; }
      if (form.z < -WORLD.halfH + 1 || form.z > WORLD.halfH - 1) { form.z = clamp(form.z, -WORLD.halfH + 1, WORLD.halfH - 1); form.vz *= bounce; }
      form.visual.position.set(form.x, 0.03 + Math.sin(this.visualTime * 3 + form.seed) * 0.025, form.z); form.visual.rotation.y = form.rot;
      const ratio = clamp(form.deadline / form.maxDeadline, 0, 1); form.deadlineBar.scale.x = ratio; form.deadlineBar.visible = ratio < 0.62;
    }
  }
  private shredForm(form: Form): void {
    form.active = false; form.visual.removeFromParent(); this.stats.shreds++; this.particles.burst(form.x, form.z, COLORS.red, 24, 5); this.audio.sfx("shred"); this.addTrauma(0.5);
    if (this.upgradeLevels.insurance && !this.insuranceUsed) { this.insuranceUsed = true; this.ui.showToast("INK INSURANCE COVERED THAT SHREDDING", "good"); return; }
    this.stats.strikes++; this.ui.showToast(`FORM SHREDDED — ${3 - this.stats.strikes} CHANCES LEFT`, "bad"); if (this.stats.strikes >= 3) this.endRun(false);
  }
  private updateDirector(dt: number): void {
    this.spawnTimer -= dt; const target = this.department === 4 ? 5 : Math.min(13, 5 + this.department * 2 + Math.floor(this.stats.elapsed / 80));
    if (this.spawnTimer <= 0 && this.activeFormCount < target) {
      const forms = this.department < 4 ? DEPARTMENTS[this.department].forms : DEPARTMENTS[3].forms; let kind = this.rng.pick(forms); if (this.hasLaw("birthday") && this.rng.next() < 0.5) kind = "golden";
      const form = this.spawnForm(kind); if (form && this.hasLaw("duplicate")) this.spawnForm(kind, form.x + 1, form.z + 0.5); this.spawnTimer = Math.max(0.65, 1.7 - this.department * 0.2);
    }
  }
  private spawnForm(kind: FormKind, x?: number, z?: number): Form | null {
    if (this.activeFormCount >= WORLD.maxForms) return null; const form = this.forms.find((item) => !item.active && item.kind === kind); if (!form) return null;
    if (x === undefined || z === undefined) for (let tries = 0; tries < 12; tries++) { x = this.rng.range(-WORLD.halfW + 1.5, WORLD.halfW - 1.5); z = this.rng.range(-WORLD.halfH + 1.5, WORLD.halfH - 1.5); if (distSq(x, z, this.player.x, this.player.z) > 15 && distSq(x, z, this.trayX, this.trayZ) > 7) break; }
    const base = kind === "urgent" ? 15 : kind === "golden" ? 17 : kind === "classified" ? 25 : 21, duration = Math.max(11, base - this.department * 1.1 + this.rng.range(-1.5, 2.5));
    Object.assign(form, { active: true, stamped: false, split: false, x: x!, z: z!, vx: 0, vz: 0, rot: this.rng.range(-Math.PI, Math.PI), vr: this.rng.range(-0.25, 0.25), deadline: duration, maxDeadline: duration, seed: this.rng.range(0, 100) });
    form.visual.scale.setScalar(1); form.visual.position.set(form.x, 0, form.z); form.visual.rotation.set(0, form.rot, 0); form.deadlineBar.visible = false; this.scene.add(form.visual); return form;
  }
  private updateBanking(): void {
    if (this.player.airborne || this.stack.length === 0) return; const range = 2.05 * (1 + 0.45 * (this.upgradeLevels.magnet || 0)); if (distSq(this.player.x, this.player.z, this.trayX, this.trayZ) > range * range) return;
    const count = this.stack.length; let base = 0; for (const form of this.stack) base += FORM_VALUES[form.kind];
    const value = Math.round(base * (1 + (count - 1) * 0.17) * (1 + Math.max(0, this.stats.bestCombo - 1) * 0.055) * (1 + 0.25 * (this.upgradeLevels.redink || 0) + 0.1 * (this.upgradeLevels.magnet || 0)));
    this.stats.score += value; this.stats.banked += count;
    if (this.department < 4) this.quota += count; else { this.bossBankProgress += count; if (this.bossBankProgress >= 3) { this.bossBankProgress -= 3; this.boss.stunned = 4; this.ui.showToast("PAPERWORK STUN! AUDITOR TAKES DOUBLE DAMAGE", "good"); } }
    if (this.upgradeLevels.extension) for (const form of this.forms) if (form.active && !form.stamped) form.deadline = Math.min(form.maxDeadline + 5, form.deadline + 4 * this.upgradeLevels.extension);
    for (const form of this.stack) { form.active = false; form.stamped = false; form.visual.removeFromParent(); form.visual.scale.setScalar(1); }
    this.stack.length = 0; this.stackVisual.clear(); this.audio.sfx("bank"); this.particles.burst(this.trayX, this.trayZ, COLORS.mint, 40, 6, 0.5); this.addTrauma(0.32); this.ui.showToast(`FILED ${count} • +${value.toLocaleString()} POINTS`, "good");
    this.trayIndex = (this.trayIndex + 1) % TRAY_SPOTS.length; if (!this.hasLaw("tray")) { this.trayX = TRAY_SPOTS[this.trayIndex][0]; this.trayZ = TRAY_SPOTS[this.trayIndex][1]; }
    if (!this.bankHintShown) { this.bankHintShown = true; this.ui.showToast("BIGGER STACKS = EXPONENTIALLY WORSE IDEAS", "neutral"); }
    if (this.department < 4 && this.quota >= DEPARTMENTS[this.department].quota) this.completeDepartment();
  }
  private completeDepartment(): void { this.stats.departments = Math.max(this.stats.departments, this.department + 1); this.mode = "upgrade"; this.ui.setMode(this.mode); this.ui.showUpgrade(this.getUpgradeOptions(), this.upgradeLevels); this.audio.sfx("win"); }
  private getUpgradeOptions(): UpgradeDef[] { const available = UPGRADES.filter((upgrade) => (this.upgradeLevels[upgrade.id] || 0) < upgrade.max), options: UpgradeDef[] = []; while (options.length < 3 && available.length) { const index = Math.floor(this.rng.next() * available.length); options.push(available[index]); available.splice(index, 1); } return options; }
  private chooseUpgrade(id: string): void {
    if (this.mode !== "upgrade" || !UPGRADES.some((upgrade) => upgrade.id === id)) return; this.upgradeLevels[id] = (this.upgradeLevels[id] || 0) + 1; this.audio.sfx("bank");
    if (this.department < 3) { this.department++; this.quota = 0; this.insuranceUsed = false; this.memoTimer = Math.min(this.memoTimer, 8); this.mode = "playing"; this.ui.setMode(this.mode); this.ui.showToast(DEPARTMENTS[this.department].subtitle.toUpperCase(), "neutral"); for (let i = 0; i < 3; i++) this.spawnForm(this.rng.pick(DEPARTMENTS[this.department].forms)); }
    else { this.department = 4; this.startBoss(); }
  }
  private startBoss(): void {
    this.mode = "playing"; this.department = 4; this.quota = 0; this.activeLaws.length = 0; this.desk.fan.visible = false; this.desk.hole.visible = false;
    this.boss.active = true; this.boss.visual.visible = true; this.boss.x = 0; this.boss.z = -4.5; this.boss.vx = 0; this.boss.vz = 0; this.boss.hp = this.boss.maxHp; this.boss.attackTimer = 2.8; this.boss.telegraph = 0; this.boss.stunned = 0; this.boss.phase = 0; this.bossBankProgress = 0;
    this.ui.setMode(this.mode); this.ui.showToast("FINAL REVIEW: SLAM THE AUDITOR. BANK 3 TO STUN.", "bad"); this.audio.sfx("memo");
  }
  private updateBoss(dt: number): void {
    const b = this.boss; if (!b.active) return; b.stunned = Math.max(0, b.stunned - dt); b.phase = 1 - b.hp / b.maxHp;
    if (b.stunned <= 0) {
      const dx = this.player.x - b.x, dz = this.player.z - b.z, d = Math.hypot(dx, dz) || 1, desired = d > 5 ? 1 : -0.4;
      b.vx = damp(b.vx, dx / d * desired * (1.2 + b.phase), 2, dt); b.vz = damp(b.vz, dz / d * desired * (1.2 + b.phase), 2, dt); b.x += b.vx * dt; b.z += b.vz * dt; b.x = clamp(b.x, -9.5, 9.5); b.z = clamp(b.z, -5.5, 5.5);
      b.attackTimer -= dt; if (b.attackTimer <= 0 && b.telegraph <= 0) { b.telegraph = 0.95; b.targetX = this.player.x; b.targetZ = this.player.z; this.telegraph.visible = true; this.telegraph.position.set(b.targetX, 0.055, b.targetZ); this.audio.sfx("memo"); }
    }
    if (b.telegraph > 0) {
      b.telegraph -= dt; this.telegraph.scale.setScalar(1.75 + Math.sin(this.visualTime * 28) * 0.12);
      if (b.telegraph <= 0) { this.telegraph.visible = false; this.particles.burst(b.targetX, b.targetZ, COLORS.red, 42, 7); this.addTrauma(0.65); this.audio.sfx("slam", 1); if (distSq(this.player.x, this.player.z, b.targetX, b.targetZ) < 3.8 && this.player.invulnerable <= 0) this.hurtPlayer(); b.attackTimer = Math.max(1.75, 3.25 - b.phase * 1.25); }
    }
    b.visual.position.set(b.x, b.stunned > 0 ? Math.sin(this.visualTime * 18) * 0.08 : 0, b.z); b.visual.rotation.y = Math.sin(this.visualTime * 0.8) * 0.12; b.visual.rotation.z = b.stunned > 0 ? Math.sin(this.visualTime * 14) * 0.08 : 0;
  }
  private damageBoss(power: number): void {
    if (!this.boss.active) return; const double = this.boss.stunned > 0 || (this.upgradeLevels.overcommit || 0) >= 2 && power > 0.9, damage = double ? 2 : 1;
    this.boss.hp = Math.max(0, this.boss.hp - damage); this.stats.score += 350 * damage; this.boss.stunned = Math.max(0, this.boss.stunned - 1); this.particles.burst(this.boss.x, this.boss.z, COLORS.mint, 35, 7, 1); this.audio.sfx("hit"); this.hitStop = 0.075; this.addTrauma(0.55); this.ui.showToast(double ? `EXECUTIVE STAMP! ${damage} DAMAGE` : "AUDITED THE AUDITOR", "good");
    if (this.boss.hp <= 0) { this.boss.active = false; this.telegraph.visible = false; this.endRun(true); }
  }
  private hurtPlayer(): void {
    this.player.invulnerable = 1.5; this.player.airborne = true; this.player.vy = 7; this.player.lastPower = 0.4;
    const dx = this.player.x - this.boss.targetX, dz = this.player.z - this.boss.targetZ, d = Math.hypot(dx, dz) || 1; this.player.vx = dx / d * 11; this.player.vz = dz / d * 11;
    this.stats.strikes++; this.audio.sfx("shred"); this.ui.showToast(`AUDITED PERSONALLY — ${3 - this.stats.strikes} CHANCES LEFT`, "bad"); if (this.stats.strikes >= 3) this.endRun(false);
  }
  private updateLaws(dt: number): void {
    if (this.department === 4) return; this.memoTimer -= dt;
    if (this.memoTimer <= 0) { this.memoCount++; const helpful = this.memoCount % 3 === 0, candidates = LAWS.filter((law) => !!law.helpful === helpful && !this.activeLaws.some((active) => active.def.id === law.id)); this.enactLaw(this.rng.pick(candidates)); this.memoTimer = GAME.memoEvery; }
    for (let i = this.activeLaws.length - 1; i >= 0; i--) { this.activeLaws[i].remaining -= dt; if (this.activeLaws[i].remaining <= 0) this.activeLaws.splice(i, 1); }
    this.desk.fan.visible = this.hasLaw("fan"); this.desk.hole.visible = this.hasLaw("hole"); this.desk.coffee.visible = this.hasLaw("coffee") || this.department >= 1;
    if (this.hasLaw("tray")) { this.trayX = Math.sin(this.visualTime * 0.55) * 10.5; this.trayZ = Math.cos(this.visualTime * 0.72) * 5.8; }
  }
  private enactLaw(def: LawDef): void {
    if (this.mode === "title") this.startRun(); const existing = this.activeLaws.find((law) => law.def.id === def.id);
    if (existing) existing.remaining = def.duration; else { this.activeLaws.push({ def, remaining: def.duration }); while (this.activeLaws.length > GAME.maxLaws) this.activeLaws.shift(); }
    this.ui.showMemo(def); this.audio.sfx("memo");
  }
  private hasLaw(id: LawId): boolean { return this.activeLaws.some((law) => law.def.id === id && law.remaining > 0); }
  private updateProps(dt: number): void {
    for (const prop of this.props) {
      prop.cooldown = Math.max(0, prop.cooldown - dt);
      if (prop.kind === "duck") { const targetX = Math.sin(this.visualTime * 0.34) * 8.5, targetZ = Math.cos(this.visualTime * 0.48) * 5.4; prop.vx += (targetX - prop.x) * dt * 0.7; prop.vz += (targetZ - prop.z) * dt * 0.7; }
      if (prop.kind === "stapler" && this.department >= 1) {
        if (prop.telegraph > 0) { prop.telegraph -= dt; if (prop.telegraph <= 0) { prop.cooldown = 4; this.audio.sfx("slam", 0.5); this.particles.burst(prop.x, prop.z, COLORS.red, 12, 3); if (distSq(this.player.x, this.player.z, prop.x, prop.z) < 3.1 && !this.player.airborne) { this.player.airborne = true; this.player.vy = 5.6; this.player.lastPower = 0.4; } for (const form of this.forms) if (form.active && !form.stamped && distSq(form.x, form.z, prop.x, prop.z) < 4) { form.vx += (form.x - prop.x) * 4; form.vz += (form.z - prop.z) * 4; } } }
        else if (prop.cooldown <= 0 && distSq(this.player.x, this.player.z, prop.x, prop.z) < 5.2) prop.telegraph = 0.65;
      }
      prop.vx *= Math.exp(-2.2 * dt); prop.vz *= Math.exp(-2.2 * dt); prop.x = clamp(prop.x + prop.vx * dt, -WORLD.halfW + 1, WORLD.halfW - 1); prop.z = clamp(prop.z + prop.vz * dt, -WORLD.halfH + 1, WORLD.halfH - 1);
    }
    this.updatePropVisuals(dt);
  }
  private updatePropVisuals(dt: number): void {
    for (const prop of this.props) {
      prop.visual.position.set(prop.x, 0, prop.z);
      if (prop.kind === "duck") { prop.visual.rotation.y = Math.atan2(prop.vx, prop.vz); prop.visual.position.y = Math.abs(Math.sin(this.visualTime * 5)) * 0.07; }
      if (prop.kind === "stapler") { const top = prop.visual.userData.top as THREE.Mesh; top.rotation.z = prop.telegraph > 0 ? -0.65 * Math.sin((0.65 - prop.telegraph) / 0.65 * Math.PI / 2) : damp(top.rotation.z, -0.1, 12, dt); }
    }
    (this.desk.fan.userData.blades as THREE.Group).rotation.y += dt * (this.desk.fan.visible ? 13 : 1); this.desk.hole.rotation.y += dt * 0.5;
  }
  private applyHoleForce(body: { x: number; z: number; vx: number; vz: number }, dt: number, strength: number): void {
    const dx = 7.4 - body.x, dz = -3.4 - body.z, d2 = dx * dx + dz * dz; if (d2 > 55 || d2 < 0.01) return; const d = Math.sqrt(d2), force = (1 - d / Math.sqrt(55)) * 12 * strength; body.vx += dx / d * force * dt; body.vz += dz / d * force * dt;
  }
  private collideWalls(): void {
    const p = this.player, bounce = this.hasLaw("walls") ? -1.1 : -0.62;
    if (p.x < -WORLD.halfW + 0.7 || p.x > WORLD.halfW - 0.7) { p.x = clamp(p.x, -WORLD.halfW + 0.7, WORLD.halfW - 0.7); p.vx *= bounce; this.addTrauma(0.1); }
    if (p.z < -WORLD.halfH + 0.7 || p.z > WORLD.halfH - 0.7) { p.z = clamp(p.z, -WORLD.halfH + 0.7, WORLD.halfH - 0.7); p.vz *= bounce; this.addTrauma(0.1); }
  }
  private render(): void {
    const now = performance.now(), frameDt = Math.min(0.1, (now - this.lastRender) / 1000); this.lastRender = now; if (frameDt > 0) this.fps = damp(this.fps, 1 / frameDt, 2, frameDt);
    const p = this.player; this.playerVisual.position.set(p.x, p.y + (this.mode === "title" ? Math.sin(this.visualTime * 2) * 0.08 : 0), p.z); if (this.mode !== "title") this.playerVisual.rotation.y = Math.atan2(p.aimX, p.aimZ);
    const chargeSquash = p.charging ? Math.min(0.22, p.charge * 0.18) : 0, airStretch = p.airborne ? Math.min(0.18, Math.abs(p.vy) * 0.018) : 0;
    this.playerVisual.scale.set(1 + chargeSquash - airStretch * 0.4, 1 - chargeSquash + airStretch, 1 + chargeSquash - airStretch * 0.4); this.playerVisual.rotation.z = p.airborne ? clamp(-p.vx * 0.014, -0.25, 0.25) : 0; this.playerVisual.visible = !(p.invulnerable > 0 && Math.floor(p.invulnerable * 14) % 2 === 0);
    this.aimReticle.visible = this.mode === "playing" && !p.airborne; this.aimReticle.position.set(clamp(this.aimPoint.x, -WORLD.halfW + 0.5, WORLD.halfW - 0.5), 0.06, clamp(this.aimPoint.z, -WORLD.halfH + 0.5, WORLD.halfH - 0.5)); this.aimReticle.scale.setScalar(1 + p.charge * 0.9); this.aimReticle.rotation.y += 0.008 + p.charge * 0.02;
    this.desk.tray.position.set(this.trayX, 0, this.trayZ); this.desk.tray.rotation.y = damp(this.desk.tray.rotation.y, 0, 5, frameDt);
    this.trauma = Math.max(0, this.trauma - frameDt * 1.8); this.shakeClock += frameDt * 31; const shake = this.save.shake ? this.trauma * this.trauma * 0.5 : 0;
    this.camera.position.set(Math.sin(this.shakeClock * 1.7) * shake, 23, 18 + Math.cos(this.shakeClock * 2.1) * shake); this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera); this.ui.update(this.getSnapshot(), this.activeLaws, this.upgradeLevels);
  }
  private togglePause(): void { if (this.mode === "playing") { this.mode = "paused"; this.input.reset(); } else if (this.mode === "paused") { this.mode = "playing"; this.audio.unlock(); } else return; this.audio.sfx("ui"); this.ui.setMode(this.mode); }
  private endRun(victory: boolean): void {
    if (this.mode === "gameover" || this.mode === "victory") return; this.mode = victory ? "victory" : "gameover"; this.boss.active = false; this.telegraph.visible = false;
    const finalScore = Math.round(this.stats.score + (victory ? 2500 : 0)); this.stats.score = finalScore; const newBest = finalScore > this.save.best;
    if (newBest) this.save.best = finalScore; this.save.runs++; if (victory) this.save.wins++; this.persist(); this.ui.setRecord(this.save.best, this.save.wins); this.ui.showResults(victory, this.stats, this.save.best, newBest); this.ui.setMode(this.mode); this.audio.sfx(victory ? "win" : "lose");
    if (victory) for (let i = 0; i < 8; i++) this.particles.burst(this.rng.range(-9, 9), this.rng.range(-5, 5), i % 2 ? COLORS.yellow : COLORS.mint, 35, 8, 1);
  }
  private addTrauma(amount: number): void { this.trauma = clamp(this.trauma + amount, 0, 1); }
  private get stackCapacity(): number { return 10 + 3 * (this.upgradeLevels.capacity || 0); }
  private get activeFormCount(): number { let count = 0; for (const form of this.forms) if (form.active && !form.stamped) count++; return count; }
  private createFormPool(): void {
    for (const kind of FORM_KINDS) for (let i = 0; i < (kind === "standard" ? 16 : 10); i++) {
      const { visual, deadlineBar } = createForm(kind);
      // Paper receives the desk shadow but does not multiply the shadow-pass draw budget.
      visual.traverse((object) => { if (object instanceof THREE.Mesh) object.castShadow = false; });
      this.forms.push({ active: false, kind, x: 0, z: 0, vx: 0, vz: 0, rot: 0, vr: 0, deadline: 1, maxDeadline: 1, stamped: false, split: false, seed: i, visual, deadlineBar });
    }
  }
  private createProps(): void {
    const definitions = [
      { kind: "stapler" as const, x: -7.8, z: -4.4, visual: createStapler() }, { kind: "stapler" as const, x: 7.7, z: 4.6, visual: createStapler() },
      { kind: "duck" as const, x: 5.4, z: -1.5, visual: createDuck() }, { kind: "calculator" as const, x: -4.8, z: -5.8, visual: createCalculator() },
    ];
    for (const item of definitions) { const prop: Prop = { kind: item.kind, x: item.x, z: item.z, homeX: item.x, homeZ: item.z, vx: 0, vz: 0, cooldown: 0, telegraph: 0, visual: item.visual }; prop.visual.position.set(item.x, 0, item.z); this.props.push(prop); this.scene.add(item.visual); }
  }
  private emptyStats(): RunStats { return { score: 0, banked: 0, stamped: 0, bestCombo: 0, strikes: 0, shreds: 0, ducks: 0, calculators: 0, biggestStack: 0, elapsed: 0, departments: 0 }; }
  private loadSave(): SaveData {
    const fallback: SaveData = { version: 1, best: 0, wins: 0, runs: 0, muted: false, shake: true };
    try { const raw = localStorage.getItem(GAME.saveKey); if (!raw) return fallback; const value = JSON.parse(raw) as Partial<SaveData>; if (value.version !== 1) return fallback; return { version: 1, best: Number.isFinite(value.best) ? Math.max(0, Number(value.best)) : 0, wins: Number.isFinite(value.wins) ? Math.max(0, Number(value.wins)) : 0, runs: Number.isFinite(value.runs) ? Math.max(0, Number(value.runs)) : 0, muted: value.muted === true, shake: value.shake !== false }; } catch { return fallback; }
  }
  private persist(): void { try { localStorage.setItem(GAME.saveKey, JSON.stringify(this.save)); } catch { /* Storage is optional. */ } }
  private resize = (): void => {
    const width = innerWidth, height = innerHeight, aspect = width / height, viewHeight = aspect < 1.2 ? 29 : aspect < 1.55 ? 25.5 : 23;
    this.camera.left = -viewHeight * aspect / 2; this.camera.right = viewHeight * aspect / 2; this.camera.top = viewHeight / 2; this.camera.bottom = -viewHeight / 2; this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height, false);
  };
  private onVisibility = (): void => { if (document.hidden && this.mode === "playing") this.togglePause(); };
}
