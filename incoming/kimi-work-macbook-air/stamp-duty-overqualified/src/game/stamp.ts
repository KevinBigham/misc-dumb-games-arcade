import { GameLoop } from "./engine";
import { LAWS, LAW_BY_ID, type LawId } from "./laws";
import { StampAudio } from "./stamp-audio";

const W = 1280;
const H = 720;
const DESK = { x: 46, y: 76, w: 1188, h: 600 };
const STEP = 1 / 60;
const TAU = Math.PI * 2;
const CFG = {
  launchMin: 390,
  launchMax: 940,
  chargeTime: 0.72,
  overchargeAt: 1.28,
  stampSpeed: 165,
  scootSpeed: 190,
  friction: 2.15,
  maxForms: 30,
  maxHazards: 36,
  maxParticles: 320,
  memoEvery: 23,
  grace: 16,
  quotas: [6, 8, 10, 12, 1],
  departments: ["ORIENTATION", "PAPERWORK", "MIDDLE MANAGEMENT", "RED TAPE", "THE FINAL AUDIT"],
} as const;

type Mode = "title" | "playing" | "paused" | "upgrade" | "dying" | "gameover" | "victory";
type FormKind = "memo" | "urgent" | "tax" | "boss";
type ParticleKind = "paper" | "spark" | "ring" | "feather";

interface Form {
  active: boolean; kind: FormKind; x: number; y: number; px: number; py: number;
  vx: number; vy: number; r: number; angle: number; av: number; deadline: number;
  maxDeadline: number; seed: number; hp: number; invuln: number; attack: number; telegraph: number;
}
interface Hazard { active: boolean; x: number; y: number; vx: number; vy: number; r: number; life: number; angle: number; }
interface Particle { active: boolean; kind: ParticleKind; x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; color: string; rot: number; av: number; }
interface Floater { active: boolean; x: number; y: number; life: number; text: string; color: string; size: number; }
interface Prop { x: number; y: number; r: number; kind: "stapler" | "mug" | "calculator" | "pen"; seed: number; cooldown: number; angle: number; }
interface Save { version: 1; best: number; bestDept: number; wins: number; runs: number; shake: boolean; }
interface Upgrade { id: string; icon: string; name: string; desc: string; }

const UPGRADES: Upgrade[] = [
  { id: "foam", icon: "▤", name: "MEMORY FOAM", desc: "Your paper stack slows you half as much." },
  { id: "ink", icon: "●", name: "INDUSTRIAL INK", desc: "20% wider stamping contact. Subtlety resigned." },
  { id: "spring", icon: "↯", name: "EXECUTIVE SPRING", desc: "15% stronger launches and faster scooting." },
  { id: "carbon", icon: "❑", name: "CARBON COPY", desc: "Every fourth stamp creates a bonus form." },
  { id: "break", icon: "♨", name: "PAID BREAK", desc: "Erase one strike now; gain a fourth strike slot." },
  { id: "magnet", icon: "⌁", name: "FILING MAGNET", desc: "The OUT tray has a much larger collection zone." },
  { id: "study", icon: "★", name: "QUICK STUDY", desc: "Combos last longer and score 25% more." },
  { id: "shield", icon: "◇", name: "HAZARD PAY", desc: "Ignore the first collision in every department." },
];

const TRAY_SPOTS = [
  { x: 1050, y: 118 }, { x: 1035, y: 512 }, { x: 116, y: 502 }, { x: 118, y: 120 },
];
const COLORS = { ink: "#202b3c", paper: "#fffdf4", cream: "#f4eddc", coral: "#ef6a67", teal: "#43b9ae", yellow: "#f6c85f", blue: "#6b8afd", purple: "#9a76d1", red: "#d94c58", green: "#6bbf86" };

function clamp(v: number, lo: number, hi: number): number { return v < lo ? lo : v > hi ? hi : v; }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function easeOut(t: number): number { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
function mulberry32(seed: number): () => number {
  return () => {
    let t = seed += 0x6d2b79f5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const q = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath(); ctx.roundRect(x, y, w, h, q);
}
function loadSave(): Save {
  const fallback: Save = { version: 1, best: 0, bestDept: 0, wins: 0, runs: 0, shake: true };
  try {
    const value = JSON.parse(localStorage.getItem("stamp-duty.save") || "null");
    if (!value || value.version !== 1) return fallback;
    return { ...fallback, best: Math.max(0, Number(value.best) || 0), bestDept: clamp(Number(value.bestDept) || 0, 0, 5), wins: Math.max(0, Number(value.wins) || 0), runs: Math.max(0, Number(value.runs) || 0), shake: value.shake !== false };
  } catch { return fallback; }
}

export class StampDuty {
  private ctx: CanvasRenderingContext2D;
  private loop: GameLoop;
  private audio = new StampAudio();
  private rng: () => number;
  private cosmetic = mulberry32(7331);
  private seed: number;
  private mode: Mode = "title";
  private previousMode: Mode = "playing";
  private time = 0;
  private realTime = 0;
  private department = 0;
  private banked = 0;
  private score = 0;
  private displayedScore = 0;
  private strikes = 0;
  private maxStrikes = 3;
  private combo = 0;
  private comboTimer = 0;
  private bestCombo = 0;
  private stampedTotal = 0;
  private bankedTotal = 0;
  private ducks = 0;
  private memoTimer = CFG.memoEvery;
  private memoCount = 0;
  private activeLaws: LawId[] = [];
  private lawOrder: LawId[] = [];
  private hitstop = 0;
  private deathTimer = 0;
  private trauma = 0;
  private flash = 0;
  private bannerTimer = 0;
  private bannerTitle = "";
  private bannerDetail = "";
  private trayIndex = 0;
  private trayPulse = 0;
  private spawnTimer = 0;
  private upgradeChoices: Upgrade[] = [];
  private owned = new Set<string>();
  private shieldUsed = false;
  private save = loadSave();
  private view = { scale: 1, ox: 0, oy: 0, dpr: 1 };
  private keys = new Set<string>();
  private pointer = { x: 760, y: 360, down: false, seen: false };
  private chargeSource: "pointer" | "key" | null = null;
  private player = { x: 360, y: 360, px: 360, py: 360, vx: 0, vy: 0, r: 29, charge: 0, charging: false, angle: 0, stack: 0, squash: 0, invuln: 0 };
  private duck = { x: 770, y: 430, vx: 35, vy: 0, angle: 0, cooldown: 0 };
  private forms: Form[] = [];
  private hazards: Hazard[] = [];
  private props: Prop[] = [];
  private particles: Particle[] = Array.from({ length: CFG.maxParticles }, () => ({ active: false, kind: "paper" as ParticleKind, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1, color: COLORS.paper, rot: 0, av: 0 }));
  private floaters: Floater[] = Array.from({ length: 32 }, () => ({ active: false, x: 0, y: 0, life: 0, text: "", color: COLORS.ink, size: 20 }));
  private particleCursor = 0;
  private floaterCursor = 0;
  private rafReady = false;
  private listeners: Array<() => void> = [];
  private frameSamples: number[] = [];
  private fps = 60;

  constructor(private canvas: HTMLCanvasElement, private overlay: HTMLElement) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas2D is unavailable");
    this.ctx = ctx;
    const querySeed = Number(new URLSearchParams(location.search).get("seed"));
    this.seed = Number.isFinite(querySeed) && querySeed !== 0 ? querySeed >>> 0 : 20261108;
    this.rng = mulberry32(this.seed);
    this.loop = new GameLoop({ update: (dt) => this.update(dt), render: () => this.render() });
    this.bindInput();
    this.bindUI();
    this.resize();
    this.resetAttract();
    this.showTitle();
    this.loop.start();
    this.installDebug();
  }

  private on<K extends keyof WindowEventMap>(target: Window, type: K, fn: (event: WindowEventMap[K]) => void, options?: AddEventListenerOptions): void {
    target.addEventListener(type, fn as EventListener, options);
    this.listeners.push(() => target.removeEventListener(type, fn as EventListener, options));
  }

  private bindInput(): void {
    this.on(window, "resize", () => this.resize());
    this.on(window, "blur", () => { this.keys.clear(); this.cancelCharge(); if (this.mode === "playing") this.pause(); });
    this.on(window, "keydown", (event) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) event.preventDefault();
      if (event.repeat && ["Escape", "KeyM", "KeyR", "Space"].includes(event.code)) return;
      this.audio.unlock();
      if (event.code === "KeyM") { this.audio.toggle(); this.refreshUtility(); return; }
      if (event.code === "Escape") { if (this.mode === "playing") this.pause(); else if (this.mode === "paused") this.resume(); return; }
      if (event.code === "KeyR") { this.startRun(); return; }
      if (event.code === "Space" && this.mode === "title") { this.startRun(); return; }
      if (event.code === "Space" && (this.mode === "gameover" || this.mode === "victory")) { this.startRun(); return; }
      if (event.code === "Space" && this.mode === "playing") { this.beginCharge("key"); return; }
      this.keys.add(event.code);
    });
    this.on(window, "keyup", (event) => {
      this.keys.delete(event.code);
      if (event.code === "Space" && this.chargeSource === "key") this.releaseCharge();
    });
    this.on(window, "pointermove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = (event.clientX - rect.left - this.view.ox) / this.view.scale;
      this.pointer.y = (event.clientY - rect.top - this.view.oy) / this.view.scale;
      this.pointer.seen = true;
    });
    this.on(window, "pointerdown", (event) => {
      if (event.target !== this.canvas || this.mode !== "playing" || event.button !== 0) return;
      this.audio.unlock(); this.pointer.down = true; this.beginCharge("pointer");
    });
    this.on(window, "pointerup", (event) => {
      this.pointer.down = false;
      if (event.button === 0 && this.chargeSource === "pointer") this.releaseCharge();
    });
    this.on(window, "pointercancel", () => { this.pointer.down = false; this.cancelCharge(); });
    this.on(document as unknown as Window, "visibilitychange" as never, (() => { if (document.hidden && this.mode === "playing") this.pause(); }) as never);
  }

  private bindUI(): void {
    const click = (event: Event) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      if (!target) return;
      this.audio.unlock(); this.audio.sfx("ui");
      const action = target.dataset.action;
      if (action === "start" || action === "restart") this.startRun();
      else if (action === "resume") this.resume();
      else if (action === "pause") this.pause();
      else if (action === "mute") { this.audio.toggle(); this.refreshUtility(); }
      else if (action === "shake") { this.save.shake = !this.save.shake; this.persist(); this.showPause(); }
      else if (action === "title") this.toTitle();
      else if (action === "upgrade" && target.dataset.id) this.chooseUpgrade(target.dataset.id);
      else if (action === "reset-save") { this.save = { version: 1, best: 0, bestDept: 0, wins: 0, runs: 0, shake: true }; this.persist(); this.showTitle(); }
    };
    this.overlay.addEventListener("click", click);
    this.listeners.push(() => this.overlay.removeEventListener("click", click));
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const scale = Math.min(rect.width / W, rect.height / H);
    this.view = { scale, ox: (rect.width - W * scale) / 2, oy: (rect.height - H * scale) / 2, dpr };
  }

  private panel(html: string): void {
    this.overlay.innerHTML = `<div class="utility"><button data-action="mute" aria-label="Toggle sound">${this.audio.muted ? "SOUND OFF" : "SOUND ON"}</button>${this.mode === "playing" ? '<button data-action="pause">PAUSE</button>' : ""}</div>${html}`;
  }

  private refreshUtility(): void {
    const button = this.overlay.querySelector<HTMLElement>('[data-action="mute"]');
    if (button) button.textContent = this.audio.muted ? "SOUND OFF" : "SOUND ON";
  }

  private showTitle(): void {
    this.panel(`<section class="panel title-panel">
      <div class="eyebrow">DEPARTMENT OF QUESTIONABLE PHYSICS · FORM 11-B</div>
      <div class="title-lockup"><span class="mini-stamp">APPROVED?</span><h1>STAMP<br><em>DUTY</em></h1><span class="edition">OVERQUALIFIED</span></div>
      <p class="tagline">You are a rubber stamp. Management has opinions about physics.</p>
      <button class="primary" data-action="start">CLOCK IN <span>SPACE</span></button>
      <div class="how"><div><b>01</b><span>AIM</span><small>Mouse</small></div><div><b>02</b><span>HOLD + RELEASE</span><small>Click or Space</small></div><div><b>03</b><span>BANK THE STACK</span><small>Visit the OUT tray</small></div></div>
      <div class="title-footer"><span>WASD to scoot · ESC to pause · M to mute</span><span>BEST ${this.save.best.toLocaleString()} · ${this.save.wins} SHIFTS SURVIVED</span></div>
    </section>`);
  }

  private showPause(): void {
    this.panel(`<section class="panel compact"><div class="eyebrow">UNSCHEDULED INACTIVITY</div><h2>PAUSED</h2><p>The paperwork is pretending not to move.</p><button class="primary" data-action="resume">BACK TO WORK <span>ESC</span></button><div class="button-row"><button data-action="shake">SHAKE ${this.save.shake ? "ON" : "OFF"}</button><button data-action="mute">SOUND ${this.audio.muted ? "OFF" : "ON"}</button></div><button class="text-button" data-action="restart">RESTART SHIFT</button><button class="text-button" data-action="title">RESIGN TO TITLE</button></section>`);
  }

  private showUpgrade(): void {
    const cards = this.upgradeChoices.map((u) => `<button class="upgrade-card" data-action="upgrade" data-id="${u.id}"><span class="upgrade-icon">${u.icon}</span><strong>${u.name}</strong><span>${u.desc}</span><small>APPROVE →</small></button>`).join("");
    this.panel(`<section class="panel upgrade-panel"><div class="eyebrow">DEPARTMENT ${this.department} COMPLETE · UNREQUESTED PROMOTION</div><h2>CHOOSE YOUR BENEFIT</h2><p>All benefits are binding. None are legally benefits.</p><div class="upgrade-grid">${cards}</div></section>`);
  }

  private showResults(victory: boolean): void {
    const rank = victory ? "THE DESK ITSELF" : this.score > 12000 ? "SENIOR DISRUPTION" : this.score > 6000 ? "MIDDLE MANAGEMENT" : this.score > 2500 ? "PAID INTERN" : "UNPAID INTERN";
    this.panel(`<section class="panel receipt"><div class="eyebrow">INCIDENT REPORT · ${victory ? "SHIFT SURVIVED" : "EMPLOYMENT REASSIGNED"}</div><h2>${victory ? "AUDIT CLEARED!" : "STAMPED OUT"}</h2><div class="rank">${rank}</div><dl><div><dt>TRIANGULAR POINTS</dt><dd>${this.score.toLocaleString()}</dd></div><div><dt>FORMS PROCESSED</dt><dd>${this.bankedTotal}</dd></div><div><dt>BEST COMBO</dt><dd>×${this.bestCombo}</dd></div><div><dt>DUCKS DISTURBED</dt><dd>${this.ducks}</dd></div><div><dt>SECONDS DELIBERATING</dt><dd>${Math.floor(this.time)}</dd></div><div><dt>MEMOS SURVIVED</dt><dd>${this.memoCount}</dd></div></dl><div class="new-best">${this.score >= this.save.best && this.score > 0 ? "★ PERSONAL BEST ★" : `BEST ${this.save.best.toLocaleString()}`}</div><button class="primary" data-action="restart">ONE MORE SHIFT <span>R</span></button><button class="text-button" data-action="title">FILE UNDER TITLE</button></section>`);
  }

  private pause(): void { if (this.mode !== "playing") return; this.previousMode = this.mode; this.mode = "paused"; this.cancelCharge(); this.showPause(); }
  private resume(): void { if (this.mode !== "paused") return; this.mode = "playing"; this.panel(""); }
  private toTitle(): void { this.mode = "title"; this.resetAttract(); this.showTitle(); }

  private resetAttract(): void {
    this.forms.length = 0; this.hazards.length = 0; this.props.length = 0;
    this.player.x = 365; this.player.y = 375; this.player.vx = 0; this.player.vy = 0;
    this.player.stack = 0; this.player.charge = 0; this.player.charging = false;
    this.activeLaws.length = 0;
    this.createProps();
    for (let i = 0; i < 8; i++) this.spawnForm(i % 4 === 0 ? "urgent" : "memo", true);
  }

  private startRun(): void {
    this.rng = mulberry32(this.seed);
    this.mode = "playing"; this.time = 0; this.department = 0; this.banked = 0; this.score = 0; this.displayedScore = 0;
    this.strikes = 0; this.maxStrikes = 3; this.combo = 0; this.comboTimer = 0; this.bestCombo = 0;
    this.stampedTotal = 0; this.bankedTotal = 0; this.ducks = 0; this.memoCount = 0; this.memoTimer = CFG.memoEvery;
    this.activeLaws.length = 0; this.lawOrder = [...LAWS.filter((law) => !law.helpful).map((law) => law.id)];
    this.shuffle(this.lawOrder); this.owned.clear(); this.shieldUsed = false; this.deathTimer = 0;
    this.hitstop = 0; this.trauma = 0; this.flash = 0; this.bannerTimer = 0; this.trayPulse = 0;
    for (const particle of this.particles) particle.active = false;
    for (const floater of this.floaters) floater.active = false;
    this.save.runs++; this.persist();
    this.startDepartment();
    this.audio.sfx("ui");
  }

  private startDepartment(): void {
    this.mode = "playing"; this.banked = 0; this.bankComboReset(); this.hazards.length = 0; this.forms.length = 0;
    this.player.x = 330; this.player.y = 355; this.player.px = 330; this.player.py = 355; this.player.vx = 0; this.player.vy = 0;
    this.player.stack = 0; this.player.charge = 0; this.player.charging = false; this.player.invuln = 1;
    this.trayIndex = this.department % TRAY_SPOTS.length; this.spawnTimer = 0; this.shieldUsed = false;
    this.duck.x = 760; this.duck.y = 430; this.duck.vx = 35; this.duck.vy = 0; this.duck.cooldown = 0;
    this.createProps();
    if (this.department === 4) {
      this.spawnForm("boss");
      this.banner("THE FINAL AUDIT", "Five clean stamps. Dodge its paper policy.");
    } else {
      const count = 7 + this.department * 2;
      for (let i = 0; i < count; i++) this.spawnForm(i % 5 === 2 ? "urgent" : i % 6 === 4 ? "tax" : "memo", true);
      this.banner(CFG.departments[this.department], `Bank ${CFG.quotas[this.department]} forms. Keep your stack out of the shredder.`);
    }
    this.panel("");
  }

  private createProps(): void {
    this.props.length = 0;
    const layout: Array<Prop["kind"]> = ["stapler", "mug", "calculator", "pen", "stapler", "mug"];
    for (let i = 0; i < layout.length; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      this.props.push({
        x: 545 + col * 175 + (this.rng() - 0.5) * 40,
        y: 220 + row * 280 + (this.rng() - 0.5) * 55,
        r: layout[i] === "calculator" ? 34 : layout[i] === "pen" ? 26 : 29,
        kind: layout[i], seed: this.rng() * 100, cooldown: 0, angle: (this.rng() - 0.5) * 1.4,
      });
    }
  }

  private shuffle<T>(items: T[]): void {
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
  }

  private spawnForm(kind: FormKind = "memo", anywhere = false): Form | null {
    if (this.forms.length >= CFG.maxForms && kind !== "boss") return null;
    let x = W / 2, y = H / 2;
    for (let attempt = 0; attempt < 16; attempt++) {
      x = anywhere ? 150 + this.rng() * 980 : (this.rng() < 0.5 ? 110 + this.rng() * 160 : 1010 + this.rng() * 150);
      y = 145 + this.rng() * 450;
      const dx = x - this.player.x, dy = y - this.player.y;
      if (dx * dx + dy * dy > 210 * 210) break;
    }
    const urgent = kind === "urgent";
    const tax = kind === "tax";
    const boss = kind === "boss";
    if (boss) { x = 820; y = 350; }
    const deadline = boss ? 9999 : urgent ? 22 - this.department : tax ? 38 : 31 + this.rng() * 9;
    const form: Form = {
      active: true, kind, x, y, px: x, py: y, vx: 0, vy: 0,
      r: boss ? 62 : tax ? 32 : 24, angle: this.rng() * TAU, av: (this.rng() - 0.5) * 1.2,
      deadline, maxDeadline: deadline, seed: this.rng() * 1000, hp: boss ? 5 : 1, invuln: 0,
      attack: boss ? 3.2 : 0, telegraph: 0,
    };
    this.forms.push(form);
    return form;
  }

  private beginCharge(source: "pointer" | "key"): void {
    if (this.mode !== "playing" || this.player.charging) return;
    this.player.charging = true; this.player.charge = 0; this.chargeSource = source;
    this.audio.sfx("charge");
  }

  private cancelCharge(): void { this.player.charging = false; this.player.charge = 0; this.chargeSource = null; }

  private releaseCharge(): void {
    if (!this.player.charging || this.mode !== "playing") { this.cancelCharge(); return; }
    const p = this.player;
    const charge = clamp(p.charge, 0.12, 1);
    let angle = Math.atan2(this.pointer.y - p.y, this.pointer.x - p.x);
    if (!this.pointer.seen && Math.hypot(p.vx, p.vy) > 10) angle = Math.atan2(p.vy, p.vx);
    if (p.charge >= CFG.overchargeAt) angle += (this.rng() < 0.5 ? -1 : 1) * (1.3 + this.rng() * 1.2);
    const stackPenalty = 1 + p.stack * (this.owned.has("foam") ? 0.014 : 0.028);
    const spring = this.owned.has("spring") ? 1.15 : 1;
    const coffee = this.hasLaw("coffee") ? 1.1 : 1;
    const speed = lerp(CFG.launchMin, CFG.launchMax, easeOut(charge)) * spring * coffee / stackPenalty * (p.charge >= CFG.overchargeAt ? 1.12 : 1);
    p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed; p.angle = angle;
    p.squash = 1; p.charging = false; p.charge = 0; this.chargeSource = null;
    this.trauma = Math.min(1, this.trauma + 0.13); this.audio.sfx("launch");
    this.burst(p.x, p.y, "paper", 8, COLORS.cream, 160);
    if (charge > 0.95) this.floater(p.x, p.y - 48, p.charge >= CFG.overchargeAt ? "OVERCOMMITTED!" : "FULL SEND!", COLORS.coral, 18);
  }

  private update(dt: number): void {
    this.realTime += dt;
    this.displayedScore = lerp(this.displayedScore, this.score, 0.12);
    this.flash = Math.max(0, this.flash - dt * 2.8);
    this.trauma = Math.max(0, this.trauma - dt * 2.3);
    this.bannerTimer = Math.max(0, this.bannerTimer - dt);
    this.trayPulse = Math.max(0, this.trayPulse - dt * 2);
    if (this.mode === "title") { this.updateAttract(dt); this.updateParticles(dt); return; }
    if (this.mode === "paused" || this.mode === "upgrade" || this.mode === "gameover" || this.mode === "victory") { this.updateParticles(dt * 0.3); return; }
    if (this.mode === "dying") {
      this.deathTimer -= dt;
      this.updateWorld(dt * 0.25);
      this.updateParticles(dt * 0.4);
      if (this.deathTimer <= 0) this.finishRun(false);
      return;
    }
    if (this.hitstop > 0) { this.hitstop -= dt; this.updateParticles(dt * 0.15); return; }
    this.time += dt;
    this.updateWorld(dt);
    this.updateParticles(dt);
    this.audio.updateMusic(true, clamp(this.department / 4 * 0.55 + this.activeLaws.length * 0.12 + this.combo * 0.025, 0, 1));
  }

  private updateAttract(dt: number): void {
    for (const form of this.forms) {
      form.px = form.x; form.py = form.y; form.angle += form.av * dt * 0.25;
      form.x += Math.cos(this.realTime * 0.5 + form.seed) * dt * 8;
      form.y += Math.sin(this.realTime * 0.65 + form.seed) * dt * 6;
    }
    this.player.angle = Math.sin(this.realTime * 0.7) * 0.15;
  }

  private updateWorld(dt: number): void {
    const p = this.player;
    p.px = p.x; p.py = p.y; p.invuln = Math.max(0, p.invuln - dt); p.squash = Math.max(0, p.squash - dt * 5);
    this.duck.cooldown = Math.max(0, this.duck.cooldown - dt);
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.combo = 0; }
    if (p.charging) {
      p.charge += dt / (CFG.chargeTime * (this.hasLaw("coffee") ? 0.7 : 1));
      if (p.charge >= CFG.overchargeAt) this.releaseCharge();
    }
    const scoot = CFG.scootSpeed * (this.owned.has("spring") ? 1.15 : 1) * (p.charging ? 0.36 : 1);
    let sx = 0, sy = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) sx--;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) sx++;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) sy--;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) sy++;
    if (sx || sy) { const len = Math.hypot(sx, sy); p.vx += sx / len * scoot * dt * 9; p.vy += sy / len * scoot * dt * 9; }
    if (this.hasLaw("gravity")) p.vy += 170 * dt;
    if (this.hasLaw("fan")) { p.vx += Math.sin(this.time * 1.7) * 155 * dt; p.vy += Math.cos(this.time * 1.3) * 90 * dt; }
    if (this.hasLaw("magnet") && p.stack > 0) {
      const tray = TRAY_SPOTS[this.trayIndex]; const dx = tray.x + 65 - p.x, dy = tray.y + 45 - p.y; const d2 = dx * dx + dy * dy;
      if (d2 < 340 * 340 && d2 > 100) { const d = Math.sqrt(d2); p.vx += dx / d * 230 * dt; p.vy += dy / d * 230 * dt; }
    }
    if (this.hasLaw("hole")) this.applyAttraction(640, 355, 100, dt, true);
    if (this.hasLaw("duck")) this.applyAttraction(this.duck.x, this.duck.y, 145, dt, false);
    const friction = this.hasLaw("slip") ? 0.42 : this.hasLaw("sticky") ? 4.1 : CFG.friction;
    const drag = Math.exp(-friction * dt);
    p.vx *= drag; p.vy *= drag;
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.r = 29 * (this.hasLaw("tiny") ? 0.75 : this.hasLaw("giant") ? 1.34 : 1);
    p.angle = Math.atan2(this.pointer.y - p.y, this.pointer.x - p.x);
    this.collideWalls(p, p.r, this.hasLaw("bounce") ? 1.04 : 0.68);
    this.updateDuck(dt);
    this.updateProps(dt);
    this.updateForms(dt);
    this.updateHazards(dt);
    this.handlePropCollisions();
    this.handleFormCollisions();
    this.checkTray();
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.department < 4) {
      this.spawnTimer = Math.max(1.4, 3.4 - this.department * 0.42);
      const active = this.forms.reduce((n, f) => n + (f.active && f.kind !== "boss" ? 1 : 0), 0);
      if (active < 8 + this.department * 3) this.spawnForm(this.rng() < 0.24 + this.department * 0.04 ? "urgent" : this.rng() < 0.18 ? "tax" : "memo");
    }
    this.memoTimer -= dt;
    if (this.memoTimer <= 0) { this.enactLaw(); this.memoTimer = CFG.memoEvery; }
  }

  private applyAttraction(x: number, y: number, strength: number, dt: number, hole: boolean): void {
    const p = this.player; const dx = x - p.x, dy = y - p.y; const d2 = dx * dx + dy * dy;
    if (d2 > 50 * 50 && d2 < 390 * 390) { const d = Math.sqrt(d2); p.vx += dx / d * strength * dt; p.vy += dy / d * strength * dt; }
    for (const form of this.forms) {
      if (!form.active || form.kind === "boss") continue;
      const fx = x - form.x, fy = y - form.y, fd2 = fx * fx + fy * fy;
      if (fd2 > 35 * 35 && fd2 < 360 * 360) { const fd = Math.sqrt(fd2); form.vx += fx / fd * strength * 1.3 * dt; form.vy += fy / fd * strength * 1.3 * dt; }
      if (hole && fd2 < 34 * 34) { form.active = false; this.burst(form.x, form.y, "paper", 5, COLORS.paper, 90); this.floater(x, y - 30, "STREAMLINED", COLORS.purple, 14); }
    }
  }

  private collideWalls(body: { x: number; y: number; vx: number; vy: number }, r: number, bounce: number): void {
    const left = DESK.x + r, right = DESK.x + DESK.w - r, top = DESK.y + r, bottom = DESK.y + DESK.h - r;
    if (body.x < left) { body.x = left; body.vx = Math.abs(body.vx) * bounce; this.trauma += 0.025; }
    if (body.x > right) { body.x = right; body.vx = -Math.abs(body.vx) * bounce; this.trauma += 0.025; }
    if (body.y < top) { body.y = top; body.vy = Math.abs(body.vy) * bounce; this.trauma += 0.025; }
    if (body.y > bottom) { body.y = bottom; body.vy = -Math.abs(body.vy) * bounce; this.trauma += 0.025; }
  }

  private updateForms(dt: number): void {
    const p = this.player;
    for (const form of this.forms) {
      if (!form.active) continue;
      form.px = form.x; form.py = form.y; form.invuln = Math.max(0, form.invuln - dt);
      const dx = form.x - p.x, dy = form.y - p.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      if (form.kind === "boss") {
        form.attack -= dt;
        if (form.telegraph > 0) {
          form.telegraph -= dt;
          if (form.telegraph <= 0) this.bossVolley(form);
        } else if (form.attack <= 0) {
          form.telegraph = 0.9; form.attack = Math.max(2.6, 4.2 - this.activeLaws.length * 0.2);
          this.audio.sfx("law");
        }
        const targetAngle = Math.atan2(p.y - form.y, p.x - form.x);
        form.vx += Math.cos(targetAngle) * 28 * dt; form.vy += Math.sin(targetAngle) * 28 * dt;
      } else {
        const fear = form.kind === "urgent" ? 280 : form.kind === "tax" ? 175 : 225;
        if (dist < fear) {
          const flee = (form.kind === "urgent" ? 310 : form.kind === "tax" ? 155 : 225) * (1 - dist / fear);
          form.vx += dx / dist * flee * dt * 5; form.vy += dy / dist * flee * dt * 5;
          if (form.kind === "urgent") { form.vx += -dy / dist * Math.sin(this.time * 5 + form.seed) * 95 * dt; form.vy += dx / dist * Math.sin(this.time * 5 + form.seed) * 95 * dt; }
        }
        if (this.time > CFG.grace && !this.hasLaw("birthday")) form.deadline -= dt;
        if (form.deadline <= 0) { this.shred(form); continue; }
      }
      form.vx *= Math.exp(-2.7 * dt); form.vy *= Math.exp(-2.7 * dt);
      form.x += form.vx * dt; form.y += form.vy * dt; form.angle += form.av * dt;
      this.collideWalls(form, form.r, this.hasLaw("jelly") ? 0.96 : 0.72);
    }
    for (let i = this.forms.length - 1; i >= 0; i--) if (!this.forms[i].active) { this.forms[i] = this.forms[this.forms.length - 1]; this.forms.pop(); }
  }

  private updateDuck(dt: number): void {
    const d = this.duck;
    if (Math.abs(d.vx) < 42 && d.cooldown <= 0) d.vx += Math.sin(this.time * 0.8) * dt * 20;
    d.vx *= Math.exp(-1.4 * dt); d.vy *= Math.exp(-1.4 * dt);
    if (d.cooldown <= 0) d.vy += Math.sin(this.time * 0.6 + 2) * dt * 13;
    d.x += d.vx * dt; d.y += d.vy * dt; d.angle = clamp(d.vx / 160, -0.6, 0.6);
    this.collideWalls(d, 25, 0.8);
  }

  private updateProps(dt: number): void {
    for (const prop of this.props) {
      prop.cooldown = Math.max(0, prop.cooldown - dt);
      if (prop.kind === "calculator" && this.hasLaw("calculator")) {
        const dx = this.player.x - prop.x, dy = this.player.y - prop.y, d = Math.max(1, Math.hypot(dx, dy));
        prop.x += dx / d * 50 * dt; prop.y += dy / d * 50 * dt; prop.angle += dt * 1.8;
      }
      if (prop.kind === "stapler" && this.hasLaw("teeth")) prop.angle += Math.sin(this.time * 7 + prop.seed) * dt * 0.3;
    }
  }

  private updateHazards(dt: number): void {
    for (const hazard of this.hazards) {
      if (!hazard.active) continue;
      hazard.life -= dt; if (hazard.life <= 0) { hazard.active = false; continue; }
      hazard.x += hazard.vx * dt; hazard.y += hazard.vy * dt; hazard.angle += dt * 4;
      if (hazard.x < DESK.x || hazard.x > DESK.x + DESK.w || hazard.y < DESK.y || hazard.y > DESK.y + DESK.h) { hazard.active = false; continue; }
      const dx = this.player.x - hazard.x, dy = this.player.y - hazard.y;
      if (dx * dx + dy * dy < Math.pow(this.player.r + hazard.r, 2)) {
        hazard.active = false;
        if (this.player.invuln <= 0) this.collateral("PAPER POLICY!", hazard.x, hazard.y);
      }
    }
    for (let i = this.hazards.length - 1; i >= 0; i--) if (!this.hazards[i].active) { this.hazards[i] = this.hazards[this.hazards.length - 1]; this.hazards.pop(); }
  }

  private bossVolley(form: Form): void {
    const count = 10;
    for (let i = 0; i < count; i++) {
      if (this.hazards.length >= CFG.maxHazards) break;
      const angle = i / count * TAU + this.time * 0.3;
      this.hazards.push({ active: true, x: form.x + Math.cos(angle) * 65, y: form.y + Math.sin(angle) * 65, vx: Math.cos(angle) * 190, vy: Math.sin(angle) * 190, r: 13, life: 5, angle });
    }
    this.trauma += 0.2; this.audio.sfx("launch");
  }

  private handlePropCollisions(): void {
    const p = this.player;
    for (const prop of this.props) {
      const dx = p.x - prop.x, dy = p.y - prop.y, min = p.r + prop.r;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 < 0.001) continue;
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      p.x = prop.x + nx * min; p.y = prop.y + ny * min;
      const dot = p.vx * nx + p.vy * ny;
      if (dot < 0) { p.vx -= 1.75 * dot * nx; p.vy -= 1.75 * dot * ny; }
      if (Math.abs(dot) > 180 && prop.cooldown <= 0) {
        prop.cooldown = 0.4; this.audio.sfx("hit"); this.trauma += 0.11; this.burst(prop.x, prop.y, "spark", 6, COLORS.yellow, 120);
        if (prop.kind === "calculator") { const bonus = 25 * (1 + this.combo); this.addScore(bonus); this.floater(prop.x, prop.y - 40, `AUDIT +${bonus}`, COLORS.blue, 15); }
        if (prop.kind === "mug") this.floater(prop.x, prop.y - 38, "DECAF-ULOUS", COLORS.coral, 14);
        if (prop.kind === "stapler" && this.hasLaw("teeth")) this.collateral("STAPLED!", p.x, p.y);
      }
    }
    const dx = p.x - this.duck.x, dy = p.y - this.duck.y, min = p.r + 25, d2 = dx * dx + dy * dy;
    if (d2 < min * min && d2 > 0.01) {
      const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
      if (Math.hypot(p.vx, p.vy) > 180 && this.duck.cooldown <= 0) {
        this.duck.cooldown = 2; this.duck.vx = -nx * 400; this.duck.vy = -ny * 400;
        p.vx = nx * 170; p.vy = ny * 170; this.ducks++; this.addScore(250);
        this.audio.sfx("duck"); this.trauma += 0.24; this.hitstop = 0.055;
        this.floater(this.duck.x, this.duck.y - 42, "DUCK DISTURBED +250", COLORS.yellow, 18);
        this.burst(this.duck.x, this.duck.y, "feather", 12, COLORS.paper, 180);
      } else { p.x = this.duck.x + nx * min; p.y = this.duck.y + ny * min; }
    }
  }

  private handleFormCollisions(): void {
    const p = this.player;
    const speed = Math.hypot(p.vx, p.vy);
    for (const form of this.forms) {
      if (!form.active || form.invuln > 0) continue;
      const dx = form.x - p.x, dy = form.y - p.y;
      const ink = this.owned.has("ink") ? 1.2 : 1;
      const min = (p.r + form.r) * ink, d2 = dx * dx + dy * dy;
      if (d2 >= min * min) continue;
      const d = Math.max(1, Math.sqrt(d2)), nx = dx / d, ny = dy / d;
      if (speed > CFG.stampSpeed || form.kind === "boss" && speed > 125) {
        if (form.kind === "boss") this.stampBoss(form, nx, ny);
        else this.stampForm(form, nx, ny);
      } else {
        form.vx += nx * 90; form.vy += ny * 90;
        p.vx -= nx * 35; p.vy -= ny * 35;
      }
    }
  }

  private stampForm(form: Form, nx: number, ny: number): void {
    form.active = false; this.player.stack++; this.stampedTotal++;
    this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.comboTimer = this.owned.has("study") ? 3.2 : 2.2;
    const base = form.kind === "urgent" ? 90 : form.kind === "tax" ? 130 : 55;
    this.addScore(base * Math.max(1, this.combo));
    this.player.vx -= nx * 45; this.player.vy -= ny * 45; this.player.squash = 1;
    this.hitstop = this.combo % 5 === 0 ? 0.065 : 0.038; this.trauma += 0.12;
    this.audio.sfx("stamp", this.combo - 1); this.burst(form.x, form.y, "paper", 9, form.kind === "urgent" ? COLORS.coral : COLORS.paper, 190);
    this.ring(form.x, form.y, COLORS.teal, 38);
    this.floater(form.x, form.y - 34, this.combo > 1 ? `STAMPED ×${this.combo}` : "STAMPED!", COLORS.teal, 18);
    if (this.owned.has("carbon") && this.stampedTotal % 4 === 0) { this.player.stack++; this.floater(this.player.x, this.player.y - 52, "CARBON COPY +1", COLORS.purple, 15); }
  }

  private stampBoss(form: Form, nx: number, ny: number): void {
    form.hp--; form.invuln = 0.7; form.vx += nx * 360; form.vy += ny * 360;
    this.player.vx -= nx * 190; this.player.vy -= ny * 190; this.player.squash = 1;
    this.combo++; this.bestCombo = Math.max(this.bestCombo, this.combo); this.comboTimer = 2.4;
    this.addScore(500 * form.hp + 500); this.hitstop = 0.085; this.trauma += 0.5; this.flash = 0.28;
    this.audio.sfx("stamp", 8 - form.hp); this.burst(form.x, form.y, "paper", 22, COLORS.coral, 300); this.ring(form.x, form.y, COLORS.coral, 90);
    this.floater(form.x, form.y - 75, form.hp > 0 ? `AUDIT DENTED · ${form.hp} LEFT` : "AUDIT APPROVED!", COLORS.coral, 24);
    if (form.hp <= 0) { form.active = false; this.banked = 1; this.bankedTotal++; window.setTimeout(() => { if (this.mode === "playing") this.finishRun(true); }, 450); }
  }

  private shred(form: Form): void {
    form.active = false; this.strikes++; this.combo = 0; this.player.stack = Math.floor(this.player.stack / 2);
    this.trauma += 0.55; this.flash = 0.65; this.hitstop = 0.075; this.audio.sfx("strike");
    this.burst(form.x, form.y, "paper", 24, COLORS.coral, 260);
    this.floater(form.x, form.y - 30, "SHREDDED! STRIKE " + this.strikes, COLORS.red, 24);
    if (this.strikes >= this.maxStrikes && this.mode === "playing") { this.mode = "dying"; this.deathTimer = 0.9; this.cancelCharge(); this.audio.sfx("lose"); }
  }

  private collateral(label: string, x: number, y: number): void {
    if (this.player.invuln > 0) return;
    if (this.owned.has("shield") && !this.shieldUsed) {
      this.shieldUsed = true; this.player.invuln = 1; this.floater(x, y - 25, "HAZARD PAY · IGNORED", COLORS.blue, 16); this.ring(x, y, COLORS.blue, 55); return;
    }
    const lost = Math.min(2, this.player.stack); this.player.stack -= lost; this.combo = 0; this.player.invuln = 1;
    this.trauma += 0.25; this.hitstop = 0.045; this.audio.sfx("hit"); this.burst(x, y, "paper", 8 + lost * 3, COLORS.paper, 180);
    this.floater(x, y - 30, lost ? `${label} −${lost} FORMS` : label, COLORS.coral, 18);
  }

  private checkTray(): void {
    const tray = TRAY_SPOTS[this.trayIndex];
    const radius = this.owned.has("magnet") ? 105 : 78;
    const dx = this.player.x - (tray.x + 65), dy = this.player.y - (tray.y + 45);
    if (dx * dx + dy * dy > radius * radius || this.player.stack <= 0) return;
    const count = this.player.stack; this.player.stack = 0; this.banked += count; this.bankedTotal += count;
    const points = Math.round((70 * count + 12 * count * (count - 1)) * (this.owned.has("study") ? 1.25 : 1));
    this.addScore(points); this.trayIndex = (this.trayIndex + 1) % TRAY_SPOTS.length; this.trayPulse = 1;
    this.trauma += 0.25; this.hitstop = 0.07; this.audio.sfx("bank");
    this.burst(tray.x + 65, tray.y + 45, "paper", 18 + count * 2, COLORS.yellow, 250);
    this.floater(tray.x + 65, tray.y - 14, `FILED ${count} · +${points}`, COLORS.yellow, 24);
    for (let i = 0; i < Math.min(4, count); i++) this.spawnForm(this.rng() < 0.25 ? "urgent" : "memo");
    if (this.department < 4 && this.banked >= CFG.quotas[this.department]) this.completeDepartment();
  }

  private bankComboReset(): void { this.combo = 0; this.comboTimer = 0; }

  private completeDepartment(): void {
    this.department++;
    this.save.bestDept = Math.max(this.save.bestDept, this.department); this.persist();
    if (this.department >= 5) { this.finishRun(true); return; }
    this.mode = "upgrade"; this.cancelCharge();
    const pool = UPGRADES.filter((u) => !this.owned.has(u.id) || u.id === "break");
    this.shuffle(pool); this.upgradeChoices = pool.slice(0, 3);
    this.audio.sfx("upgrade"); this.showUpgrade();
  }

  private chooseUpgrade(id: string): void {
    if (this.mode !== "upgrade") return;
    const upgrade = UPGRADES.find((u) => u.id === id); if (!upgrade) return;
    this.owned.add(id);
    if (id === "break") { this.maxStrikes = Math.max(4, this.maxStrikes); this.strikes = Math.max(0, this.strikes - 1); }
    this.audio.sfx("bank"); this.startDepartment();
  }

  private enactLaw(force?: LawId): void {
    this.memoCount++;
    const helpful = this.memoCount % 3 === 0;
    let id = force;
    if (!id) {
      if (helpful) {
        const helpfulIds = LAWS.filter((l) => l.helpful).map((l) => l.id);
        id = helpfulIds[Math.floor(this.rng() * helpfulIds.length)];
      } else {
        if (!this.lawOrder.length) { this.lawOrder = LAWS.filter((l) => !l.helpful).map((l) => l.id); this.shuffle(this.lawOrder); }
        id = this.lawOrder.pop();
      }
    }
    if (!id) return;
    if (this.activeLaws.includes(id)) this.activeLaws.splice(this.activeLaws.indexOf(id), 1);
    this.activeLaws.push(id);
    while (this.activeLaws.length > 3) this.activeLaws.shift();
    const law = LAW_BY_ID[id]; this.banner(law.title, law.detail); this.audio.sfx("law"); this.flash = 0.15;
    if (id === "lunch") { this.strikes = Math.max(0, this.strikes - 1); this.hazards.length = 0; this.floater(this.player.x, this.player.y - 60, "INCIDENT ERASED", COLORS.green, 20); }
    if (id === "birthday") for (const form of this.forms) form.deadline += 8;
  }

  private hasLaw(id: LawId): boolean { return this.activeLaws.includes(id); }
  private banner(title: string, detail: string): void { this.bannerTitle = title; this.bannerDetail = detail; this.bannerTimer = 3; }
  private addScore(amount: number): void { this.score += Math.round(amount); }

  private finishRun(victory: boolean): void {
    this.mode = victory ? "victory" : "gameover"; this.cancelCharge();
    this.save.best = Math.max(this.save.best, this.score); this.save.bestDept = Math.max(this.save.bestDept, this.department + (victory ? 1 : 0));
    if (victory) { this.save.wins++; this.audio.sfx("win"); for (let i = 0; i < 80; i++) this.burst(160 + this.cosmetic() * 960, 100 + this.cosmetic() * 380, "paper", 1, [COLORS.coral, COLORS.teal, COLORS.yellow, COLORS.blue][i % 4], 160); }
    this.persist(); this.showResults(victory);
  }

  private persist(): void { try { localStorage.setItem("stamp-duty.save", JSON.stringify(this.save)); } catch { /* storage is optional */ } }

  private burst(x: number, y: number, kind: ParticleKind, count: number, color: string, speed: number): void {
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.particleCursor++ % this.particles.length];
      const angle = this.cosmetic() * TAU, velocity = speed * (0.3 + this.cosmetic() * 0.7);
      p.active = true; p.kind = kind; p.x = x; p.y = y; p.vx = Math.cos(angle) * velocity; p.vy = Math.sin(angle) * velocity - (kind === "feather" ? 45 : 0);
      p.max = p.life = 0.35 + this.cosmetic() * 0.55; p.size = 3 + this.cosmetic() * 6; p.color = color; p.rot = this.cosmetic() * TAU; p.av = (this.cosmetic() - 0.5) * 12;
    }
  }

  private ring(x: number, y: number, color: string, size: number): void {
    const p = this.particles[this.particleCursor++ % this.particles.length];
    p.active = true; p.kind = "ring"; p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.max = p.life = 0.35; p.size = size; p.color = color; p.rot = 0; p.av = 0;
  }

  private floater(x: number, y: number, text: string, color: string, size: number): void {
    const f = this.floaters[this.floaterCursor++ % this.floaters.length];
    f.active = true; f.x = x; f.y = y; f.life = 1; f.text = text; f.color = color; f.size = size;
  }

  private updateParticles(dt: number): void {
    for (const p of this.particles) {
      if (!p.active) continue; p.life -= dt; if (p.life <= 0) { p.active = false; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-2.2 * dt); p.vy = p.vy * Math.exp(-1.8 * dt) + (p.kind === "feather" ? 35 : 170) * dt; p.rot += p.av * dt;
    }
    for (const f of this.floaters) { if (!f.active) continue; f.life -= dt * 0.85; f.y -= dt * 32; if (f.life <= 0) f.active = false; }
  }

  private render(): void {
    const ctx = this.ctx, v = this.view;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#172234"; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const shake = this.save.shake ? this.trauma * this.trauma * 8 : 0;
    const sx = Math.sin(this.realTime * 71) * shake, sy = Math.cos(this.realTime * 59) * shake;
    ctx.setTransform(v.dpr * v.scale, 0, 0, v.dpr * v.scale, v.dpr * (v.ox + sx * v.scale), v.dpr * (v.oy + sy * v.scale));
    this.drawDesk();
    if (this.hasLaw("hole")) this.drawHole();
    this.drawTray();
    for (const prop of this.props) this.drawProp(prop);
    for (const form of this.forms) if (form.active) this.drawForm(form);
    for (const hazard of this.hazards) if (hazard.active) this.drawHazard(hazard);
    this.drawDuck();
    this.drawAim();
    this.drawPlayer();
    this.drawParticles();
    this.drawHUD();
    this.drawFloaters();
    if (this.bannerTimer > 0 && this.mode === "playing") this.drawBanner();
    if (this.mode === "playing" && this.time < 14 && this.department === 0) this.drawTutorial();
    if (this.flash > 0) { ctx.globalAlpha = this.flash * 0.32; ctx.fillStyle = this.strikes >= this.maxStrikes ? COLORS.red : COLORS.paper; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    if (!this.rafReady) { this.rafReady = true; window.__GAME_READY__ = true; }
  }

  private drawDesk(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#25344a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#1c2a3e";
    for (let x = 0; x < W; x += 42) ctx.fillRect(x, 0, 1, H);
    ctx.shadowColor = "rgba(7,15,25,.32)"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 8;
    rr(ctx, DESK.x, DESK.y, DESK.w, DESK.h, 24); ctx.fillStyle = COLORS.cream; ctx.fill();
    ctx.shadowOffsetY = 0; ctx.lineWidth = 4; ctx.strokeStyle = COLORS.ink; ctx.stroke();
    ctx.save(); rr(ctx, DESK.x + 4, DESK.y + 4, DESK.w - 8, DESK.h - 8, 20); ctx.clip();
    ctx.strokeStyle = "rgba(80,94,101,.075)"; ctx.lineWidth = 1;
    for (let y = DESK.y + 36; y < DESK.y + DESK.h; y += 36) { ctx.beginPath(); ctx.moveTo(DESK.x, y); ctx.lineTo(DESK.x + DESK.w, y); ctx.stroke(); }
    ctx.fillStyle = "rgba(118,91,58,.05)";
    for (let i = 0; i < 34; i++) { const x = DESK.x + ((i * 193) % 1120), y = DESK.y + ((i * 83) % 560); ctx.fillRect(x, y, 2, 2); }
    ctx.strokeStyle = "rgba(125,91,54,.11)"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(1130, 590, 42, 0.2, 5.4); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(32,43,60,.38)"; ctx.font = "700 11px ui-monospace, monospace"; ctx.letterSpacing = "2px";
    ctx.fillText(`DESK 04 · ${CFG.departments[this.department] || "ORIENTATION"}`, 68, 660);
    ctx.textAlign = "right"; ctx.fillText(`SEED ${this.seed}`, 1210, 660); ctx.textAlign = "left"; ctx.letterSpacing = "0px";
  }

  private drawTray(): void {
    const ctx = this.ctx, spot = TRAY_SPOTS[this.trayIndex];
    const pulse = easeOut(this.trayPulse);
    ctx.save(); ctx.translate(spot.x + 65, spot.y + 45); ctx.scale(1 + pulse * 0.12, 1 + pulse * 0.12); ctx.translate(-65, -45);
    ctx.fillStyle = "rgba(32,43,60,.18)"; rr(ctx, 4, 10, 130, 90, 13); ctx.fill();
    ctx.fillStyle = COLORS.blue; rr(ctx, 0, 0, 130, 90, 13); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = COLORS.ink; ctx.stroke();
    ctx.fillStyle = "#91a7ff"; rr(ctx, 10, 10, 110, 55, 8); ctx.fill(); ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = COLORS.paper; rr(ctx, 20, 17, 90, 44, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COLORS.ink; ctx.font = "900 24px 'Trebuchet MS', sans-serif"; ctx.textAlign = "center"; ctx.fillText("OUT", 65, 49);
    ctx.font = "700 9px ui-monospace, monospace"; ctx.fillText(this.owned.has("magnet") ? "VERY RECEPTIVE" : "BANK STACK HERE", 65, 81);
    if (this.hasLaw("magnet")) { ctx.strokeStyle = COLORS.yellow; ctx.lineWidth = 3; ctx.setLineDash([5, 8]); ctx.beginPath(); ctx.arc(65, 45, 92 + Math.sin(this.realTime * 4) * 5, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore(); ctx.textAlign = "left";
  }

  private drawHole(): void {
    const ctx = this.ctx;
    ctx.save(); ctx.translate(640, 355);
    for (let i = 3; i >= 0; i--) { ctx.globalAlpha = 0.09 + (3 - i) * 0.05; ctx.strokeStyle = COLORS.purple; ctx.lineWidth = 3; ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.arc(0, 0, 42 + i * 28 + Math.sin(this.realTime * 2 + i) * 4, this.realTime * (i % 2 ? -0.7 : 0.7), TAU); ctx.stroke(); }
    ctx.setLineDash([]); ctx.globalAlpha = 1; ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fill();
    ctx.fillStyle = COLORS.paper; ctx.font = "900 10px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText("EFFICIENCY", 0, 4); ctx.restore(); ctx.textAlign = "left";
  }

  private drawProp(prop: Prop): void {
    const ctx = this.ctx, wobble = this.hasLaw("jelly") ? Math.sin(this.realTime * 6 + prop.seed) * 0.08 : 0;
    ctx.save(); ctx.translate(prop.x, prop.y); ctx.rotate(prop.angle); ctx.scale(1 + wobble, 1 - wobble);
    ctx.fillStyle = "rgba(32,43,60,.17)"; ctx.beginPath(); ctx.ellipse(3, 10, prop.r * 1.05, prop.r * 0.55, 0, 0, TAU); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = COLORS.ink;
    if (prop.kind === "stapler") {
      ctx.fillStyle = this.hasLaw("teeth") ? COLORS.coral : COLORS.purple; rr(ctx, -30, -16, 60, 29, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d8d9df"; rr(ctx, -25, 5, 50, 11, 4); ctx.fill(); ctx.stroke();
      if (this.hasLaw("teeth")) { ctx.fillStyle = COLORS.paper; for (let i = -18; i <= 18; i += 12) { ctx.beginPath(); ctx.moveTo(i, 12); ctx.lineTo(i + 5, 21); ctx.lineTo(i + 9, 11); ctx.fill(); } }
      else { ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.arc(17, -3, 3, 0, TAU); ctx.fill(); }
    } else if (prop.kind === "mug") {
      ctx.fillStyle = COLORS.teal; ctx.beginPath(); ctx.arc(0, 0, 25, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(23, 2, 11, -1.4, 1.4); ctx.stroke();
      ctx.fillStyle = "#71513d"; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-4, -4, 9, 3.5, 5.2); ctx.stroke();
    } else if (prop.kind === "calculator") {
      ctx.fillStyle = COLORS.blue; rr(ctx, -29, -35, 58, 70, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d9f3dc"; rr(ctx, -20, -26, 40, 17, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COLORS.ink; ctx.font = "700 11px ui-monospace, monospace"; ctx.textAlign = "right"; ctx.fillText(this.hasLaw("calculator") ? "UH OH" : String(Math.floor(this.displayedScore) % 10000), 16, -14);
      for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { ctx.fillStyle = (x + y) % 3 === 0 ? COLORS.yellow : COLORS.paper; rr(ctx, -20 + x * 15, -2 + y * 12, 10, 8, 2); ctx.fill(); }
    } else {
      ctx.fillStyle = COLORS.yellow; rr(ctx, -35, -6, 70, 12, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COLORS.coral; ctx.beginPath(); ctx.moveTo(35, -6); ctx.lineTo(48, 0); ctx.lineTo(35, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore(); ctx.textAlign = "left";
  }

  private drawForm(form: Form): void {
    const ctx = this.ctx;
    const urgency = form.kind === "boss" ? 0 : clamp(1 - form.deadline / Math.min(10, form.maxDeadline), 0, 1);
    const jitter = urgency > 0 ? Math.sin(this.realTime * 30 + form.seed) * urgency * 2 : 0;
    const jelly = this.hasLaw("jelly") ? Math.sin(this.realTime * 5 + form.seed) * 0.09 : 0;
    ctx.save(); ctx.translate(form.x + jitter, form.y); ctx.rotate(form.angle + Math.sin(this.realTime * 2 + form.seed) * 0.025); ctx.scale(1 + jelly, 1 - jelly);
    if (form.kind === "boss") { this.drawBoss(form); ctx.restore(); return; }
    const w = form.kind === "tax" ? 62 : 48, h = form.kind === "tax" ? 68 : 57;
    ctx.fillStyle = "rgba(32,43,60,.16)"; rr(ctx, -w / 2 + 3, -h / 2 + 7, w, h, 5); ctx.fill();
    ctx.fillStyle = form.kind === "urgent" ? "#ffe0d6" : form.kind === "tax" ? "#e6e0f5" : COLORS.paper;
    rr(ctx, -w / 2, -h / 2, w, h, 5); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = urgency > 0.5 ? COLORS.red : COLORS.ink; ctx.stroke();
    ctx.fillStyle = form.kind === "urgent" ? COLORS.coral : form.kind === "tax" ? COLORS.purple : COLORS.blue;
    ctx.fillRect(-w / 2, -h / 2, w, 9);
    ctx.strokeStyle = "rgba(32,43,60,.28)"; ctx.lineWidth = 2;
    for (let y = -10; y < 15; y += 9) { ctx.beginPath(); ctx.moveTo(-w / 2 + 8, y); ctx.lineTo(w / 2 - 8 - ((y + 10) % 3) * 3, y); ctx.stroke(); }
    this.drawEyes(-10, -20, 10, -20, form.vx * 0.01, form.vy * 0.01, 4);
    if (form.kind === "tax") { ctx.fillStyle = COLORS.purple; ctx.font = "900 10px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText("TAX-ish", 0, 26); }
    if (form.kind === "urgent") { ctx.fillStyle = COLORS.red; ctx.font = "900 10px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText("NOW!", 0, 25); }
    ctx.restore();
    if (form.deadline < 12 && this.time > CFG.grace - 3) {
      ctx.fillStyle = "rgba(32,43,60,.16)"; rr(ctx, form.x - 24, form.y + form.r + 8, 48, 5, 3); ctx.fill();
      ctx.fillStyle = form.deadline < 5 ? COLORS.red : COLORS.yellow; rr(ctx, form.x - 24, form.y + form.r + 8, 48 * clamp(form.deadline / Math.min(12, form.maxDeadline), 0, 1), 5, 3); ctx.fill();
    }
    ctx.textAlign = "left";
  }

  private drawBoss(form: Form): void {
    const ctx = this.ctx;
    if (form.telegraph > 0) { ctx.globalAlpha = 0.35 + Math.sin(this.realTime * 20) * 0.15; ctx.strokeStyle = COLORS.red; ctx.lineWidth = 6; ctx.setLineDash([12, 9]); ctx.beginPath(); ctx.arc(0, 0, 90 + (1 - form.telegraph) * 20, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    ctx.fillStyle = "rgba(32,43,60,.2)"; rr(ctx, -60, -64, 125, 140, 9); ctx.fill();
    ctx.fillStyle = form.invuln > 0 ? "#ffffff" : "#ffd9d2"; rr(ctx, -65, -72, 125, 140, 9); ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = COLORS.red; ctx.stroke();
    ctx.fillStyle = COLORS.red; rr(ctx, -65, -72, 125, 28, 8); ctx.fill();
    ctx.fillStyle = COLORS.paper; ctx.font = "900 17px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText("FINAL AUDIT", -2, -52);
    this.drawEyes(-26, -25, 20, -25, this.player.x - form.x, this.player.y - form.y, 8);
    ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-3, 5, 18, 0.15, Math.PI - 0.15); ctx.stroke();
    ctx.fillStyle = COLORS.ink; ctx.font = "900 13px ui-monospace, monospace"; ctx.fillText("RESISTANCE", -3, 39);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i < form.hp ? COLORS.red : "#e9b4b1"; rr(ctx, -48 + i * 21, 50, 15, 8, 2); ctx.fill(); }
    ctx.textAlign = "left";
  }

  private drawHazard(hazard: Hazard): void {
    const ctx = this.ctx; ctx.save(); ctx.translate(hazard.x, hazard.y); ctx.rotate(hazard.angle);
    ctx.fillStyle = COLORS.coral; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(-12, -10); ctx.lineTo(-5, 0); ctx.lineTo(-12, 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  private drawDuck(): void {
    const ctx = this.ctx, d = this.duck;
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.angle);
    ctx.fillStyle = "rgba(32,43,60,.17)"; ctx.beginPath(); ctx.ellipse(1, 16, 28, 12, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = COLORS.yellow; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 0, 27, 22, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(17, -15, 15, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ed8a4b"; ctx.beginPath(); ctx.moveTo(28, -16); ctx.lineTo(46, -10); ctx.lineTo(28, -5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.arc(20, -19, 3.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = "#c99c3d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-4, 1, 12, 0.2, 2.8); ctx.stroke();
    ctx.restore();
    if (this.hasLaw("duck")) { ctx.strokeStyle = "rgba(154,118,209,.35)"; ctx.lineWidth = 3; ctx.setLineDash([5, 8]); ctx.beginPath(); ctx.arc(d.x, d.y, 55 + Math.sin(this.realTime * 3) * 6, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  }

  private drawAim(): void {
    const p = this.player; if (!p.charging || this.mode !== "playing") return;
    const ctx = this.ctx, angle = Math.atan2(this.pointer.y - p.y, this.pointer.x - p.x);
    const length = 90 + easeOut(p.charge) * 150;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle);
    ctx.strokeStyle = p.charge > 1 ? COLORS.coral : COLORS.teal; ctx.lineWidth = 4; ctx.setLineDash([4, 12]); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(42, 0); ctx.lineTo(length, 0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = p.charge > 1 ? COLORS.coral : COLORS.teal;
    ctx.beginPath(); ctx.moveTo(length + 12, 0); ctx.lineTo(length - 4, -10); ctx.lineTo(length - 4, 10); ctx.closePath(); ctx.fill();
    for (let i = 1; i <= 3; i++) { ctx.globalAlpha = 0.22 / i; ctx.beginPath(); ctx.arc(45 + i * 38, 0, p.r * (1 - i * 0.12), 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  private drawPlayer(): void {
    const ctx = this.ctx, p = this.player;
    const speed = Math.hypot(p.vx, p.vy);
    for (let i = Math.min(p.stack, 12); i >= 1; i--) {
      const lag = i * 9, wobble = Math.sin(this.realTime * 5 - i * 0.6) * 4;
      const x = p.x - Math.cos(p.angle) * lag + Math.cos(p.angle + Math.PI / 2) * wobble;
      const y = p.y - Math.sin(p.angle) * lag + Math.sin(p.angle + Math.PI / 2) * wobble;
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.angle + i * 0.07); ctx.globalAlpha = 0.7 + (12 - i) * 0.02;
      ctx.fillStyle = COLORS.paper; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 1.5; rr(ctx, -17, -20, 34, 40, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COLORS.teal; ctx.font = "900 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("✓", 0, 5); ctx.restore();
    }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    const chargeSquash = p.charging ? clamp(p.charge, 0, 1) * 0.18 : 0;
    const impact = Math.sin(p.squash * Math.PI) * 0.22;
    ctx.scale(1 + impact + speed / 1800 - chargeSquash, 1 - impact - speed / 2400 + chargeSquash);
    const r = p.r / 29;
    ctx.scale(r, r);
    ctx.fillStyle = "rgba(32,43,60,.2)"; ctx.beginPath(); ctx.ellipse(0, 15, 34, 20, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 3;
    ctx.fillStyle = "#b8bec8"; rr(ctx, -24, -30, 48, 24, 7); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i < 5; i++) { const x = -18 + i * 9; ctx.moveTo(x, -9); ctx.lineTo(x + 5, 1); }
    ctx.stroke();
    ctx.fillStyle = p.invuln > 0 && Math.sin(this.realTime * 22) > 0 ? "#ffffff" : COLORS.coral; rr(ctx, -33, -3, 66, 37, 10); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = COLORS.ink; ctx.stroke();
    ctx.fillStyle = "#ff9185"; rr(ctx, -25, 2, 50, 10, 4); ctx.fill();
    this.drawEyes(-13, 9, 13, 9, Math.cos(p.angle) * 4, Math.sin(p.angle) * 4, 7);
    ctx.fillStyle = COLORS.ink; rr(ctx, -25, 27, 50, 9, 3); ctx.fill();
    ctx.restore();
    if (p.stack > 0) { ctx.fillStyle = COLORS.ink; rr(ctx, p.x - 20, p.y - p.r - 34, 40, 20, 10); ctx.fill(); ctx.fillStyle = COLORS.paper; ctx.font = "900 12px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText(`×${p.stack}`, p.x, p.y - p.r - 20); ctx.textAlign = "left"; }
    if (p.charging) {
      const width = 70; ctx.fillStyle = COLORS.ink; rr(ctx, p.x - width / 2, p.y + p.r + 18, width, 10, 5); ctx.fill();
      ctx.fillStyle = p.charge > 1 ? COLORS.coral : p.charge > 0.82 ? COLORS.yellow : COLORS.teal; rr(ctx, p.x - width / 2 + 2, p.y + p.r + 20, (width - 4) * clamp(p.charge, 0, 1), 6, 3); ctx.fill();
    }
  }

  private drawEyes(x1: number, y1: number, x2: number, y2: number, tx: number, ty: number, r: number): void {
    const ctx = this.ctx;
    const len = Math.max(1, Math.hypot(tx, ty)), dx = tx / len * r * 0.28, dy = ty / len * r * 0.28;
    for (const [x, y] of [[x1, y1], [x2, y2]]) {
      ctx.fillStyle = COLORS.paper; ctx.strokeStyle = COLORS.ink; ctx.lineWidth = Math.max(1.5, r * 0.22); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = COLORS.ink; ctx.beginPath(); ctx.arc(x + dx, y + dy, r * 0.4, 0, TAU); ctx.fill();
      ctx.fillStyle = COLORS.paper; ctx.beginPath(); ctx.arc(x + dx - r * 0.1, y + dy - r * 0.12, r * 0.1, 0, TAU); ctx.fill();
    }
  }

  private drawParticles(): void {
    const ctx = this.ctx;
    for (const p of this.particles) {
      if (!p.active) continue;
      const t = clamp(p.life / p.max, 0, 1); ctx.globalAlpha = Math.min(1, t * 2);
      if (p.kind === "ring") { ctx.strokeStyle = p.color; ctx.lineWidth = 4 * t; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1.4 - t), 0, TAU); ctx.stroke(); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
      if (p.kind === "spark") { ctx.fillRect(-p.size * 0.5, -1.5, p.size, 3); }
      else if (p.kind === "feather") { ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.35, 0, 0, TAU); ctx.fill(); }
      else { ctx.fillRect(-p.size * 0.6, -p.size * 0.4, p.size * 1.2, p.size * 0.8); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  private drawFloaters(): void {
    const ctx = this.ctx; ctx.textAlign = "center";
    for (const f of this.floaters) {
      if (!f.active) continue; ctx.globalAlpha = clamp(f.life * 2, 0, 1); ctx.font = `900 ${f.size}px 'Trebuchet MS', sans-serif`;
      const y = Math.max(102, f.y);
      ctx.lineWidth = 5; ctx.strokeStyle = COLORS.paper; ctx.strokeText(f.text, f.x, y); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, y);
    }
    ctx.globalAlpha = 1; ctx.textAlign = "left";
  }

  private drawHUD(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#172234"; ctx.fillRect(0, 0, W, 64);
    ctx.fillStyle = COLORS.coral; rr(ctx, 24, 15, 48, 34, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#0e1725"; ctx.stroke();
    ctx.fillStyle = COLORS.paper; ctx.font = "900 16px 'Trebuchet MS', sans-serif"; ctx.textAlign = "center"; ctx.fillText("SD", 48, 38);
    ctx.textAlign = "left"; ctx.fillStyle = "#8e9db2"; ctx.font = "700 10px ui-monospace, monospace"; ctx.fillText("TRIANGULAR POINTS", 88, 24);
    ctx.fillStyle = COLORS.paper; ctx.font = "900 25px ui-monospace, monospace"; ctx.fillText(Math.floor(this.displayedScore).toString().padStart(6, "0"), 88, 48);
    ctx.fillStyle = "#8e9db2"; ctx.font = "700 10px ui-monospace, monospace"; ctx.fillText(`DEPT ${Math.min(5, this.department + 1)}/5`, 305, 24);
    ctx.fillStyle = COLORS.paper; ctx.font = "900 15px 'Trebuchet MS', sans-serif"; ctx.fillText(CFG.departments[this.department] || CFG.departments[0], 305, 45);
    const quota = CFG.quotas[this.department];
    ctx.fillStyle = "#8e9db2"; ctx.font = "700 10px ui-monospace, monospace"; ctx.fillText(this.department === 4 ? "AUDIT RESISTANCE" : "OUT TRAY QUOTA", 585, 24);
    ctx.fillStyle = COLORS.yellow; ctx.font = "900 22px ui-monospace, monospace";
    if (this.department === 4) { const boss = this.forms.find((f) => f.kind === "boss"); ctx.fillText(boss ? `${boss.hp} STAMPS LEFT` : "APPROVED", 585, 47); }
    else ctx.fillText(`${Math.min(this.banked, quota)} / ${quota}`, 585, 47);
    ctx.fillStyle = "#8e9db2"; ctx.font = "700 10px ui-monospace, monospace"; ctx.fillText("INCIDENTS", 785, 24);
    for (let i = 0; i < this.maxStrikes; i++) { ctx.fillStyle = i < this.strikes ? COLORS.coral : "#405068"; rr(ctx, 785 + i * 28, 33, 20, 14, 4); ctx.fill(); }
    if (this.combo > 1) { ctx.fillStyle = COLORS.teal; ctx.font = "900 21px 'Trebuchet MS', sans-serif"; ctx.fillText(`×${this.combo} COMBO`, 920, 42); }
    ctx.fillStyle = "#8e9db2"; ctx.font = "700 10px ui-monospace, monospace"; ctx.textAlign = "right"; ctx.fillText(`BEST ${this.save.best.toLocaleString()}`, 1095, 24); ctx.fillText(`NEXT MEMO ${Math.max(0, Math.ceil(this.memoTimer))}s`, 1095, 44); ctx.textAlign = "left";
    if (this.activeLaws.length) {
      let x = 62;
      ctx.font = "700 10px ui-monospace, monospace";
      for (const id of this.activeLaws) {
        const law = LAW_BY_ID[id], width = Math.min(280, ctx.measureText(law.title).width + 34);
        ctx.fillStyle = law.helpful ? "#d8f0d7" : "#e5ddf4"; rr(ctx, x, 628, width, 29, 6); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = COLORS.ink; ctx.stroke();
        ctx.fillStyle = COLORS.ink; ctx.fillText(`${law.helpful ? "★" : "§"} ${law.title}`, x + 11, 647); x += width + 9;
      }
    }
  }

  private drawBanner(): void {
    const ctx = this.ctx;
    const enter = easeOut(clamp((3 - this.bannerTimer) / 0.25, 0, 1));
    const leave = easeOut(clamp(this.bannerTimer / 0.3, 0, 1));
    const alpha = Math.min(enter, leave), y = 86 - (1 - enter) * 30;
    ctx.globalAlpha = alpha;
    ctx.font = "900 17px 'Trebuchet MS', sans-serif";
    const width = clamp(Math.max(ctx.measureText(this.bannerTitle).width + 80, 420), 420, 650);
    ctx.fillStyle = COLORS.ink; rr(ctx, W / 2 - width / 2 + 5, y + 6, width, 64, 9); ctx.fill();
    ctx.fillStyle = COLORS.paper; rr(ctx, W / 2 - width / 2, y, width, 64, 9); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = COLORS.ink; ctx.stroke();
    ctx.fillStyle = COLORS.coral; ctx.fillRect(W / 2 - width / 2, y, 10, 64);
    ctx.textAlign = "center"; ctx.fillStyle = COLORS.ink; ctx.fillText(this.bannerTitle, W / 2, y + 27);
    ctx.fillStyle = "#5c6572"; ctx.font = "600 13px 'Trebuchet MS', sans-serif"; ctx.fillText(this.bannerDetail, W / 2, y + 48);
    ctx.globalAlpha = 1; ctx.textAlign = "left";
  }

  private drawTutorial(): void {
    const ctx = this.ctx, t = this.time;
    const text = t < 4 ? "HOLD CLICK OR SPACE" : t < 8 ? "RELEASE TO LAUNCH · HIT PAPER FAST" : "CARRY YOUR STACK TO THE BLUE OUT TRAY";
    ctx.globalAlpha = clamp(Math.min(t, 14 - t), 0, 1);
    ctx.fillStyle = COLORS.ink; rr(ctx, W / 2 - 230, 552, 460, 48, 24); ctx.fill();
    ctx.fillStyle = COLORS.paper; ctx.font = "900 15px ui-monospace, monospace"; ctx.textAlign = "center"; ctx.fillText(text, W / 2, 582);
    if (t < 4) { const pulse = (Math.sin(this.realTime * 5) + 1) / 2; ctx.strokeStyle = COLORS.teal; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(this.player.x, this.player.y, 52 + pulse * 12, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.textAlign = "left";
  }

  private installDebug(): void {
    window.__gameProbe = () => ({ x: this.player.x, y: 0, z: this.player.y });
    window.__STAMP_DEBUG__ = {
      state: () => ({ mode: this.mode, score: this.score, department: this.department, banked: this.banked, strikes: this.strikes, stack: this.player.stack, laws: [...this.activeLaws], forms: this.forms.length, hazards: this.hazards.length, particles: this.particles.filter((p) => p.active).length, fps: this.fps, player: { x: this.player.x, y: this.player.y }, target: (() => { const form = this.forms.reduce<Form | null>((nearest, candidate) => candidate.active && (!nearest || Math.hypot(candidate.x - this.player.x, candidate.y - this.player.y) < Math.hypot(nearest.x - this.player.x, nearest.y - this.player.y)) ? candidate : nearest, null); return form ? { x: form.x, y: form.y } : null; })() }),
      start: () => this.startRun(),
      law: (id: LawId) => this.enactLaw(id),
      busy: () => { if (this.mode !== "playing") this.startRun(); for (let i = 0; i < 18; i++) this.spawnForm(i % 3 === 0 ? "urgent" : i % 4 === 0 ? "tax" : "memo", true); this.enactLaw("fan"); this.enactLaw("jelly"); this.enactLaw("teeth"); for (let i = 0; i < 80; i++) this.burst(200 + this.cosmetic() * 800, 150 + this.cosmetic() * 400, "paper", 1, COLORS.coral, 180); },
      upgrade: () => { if (this.mode !== "playing") this.startRun(); this.banked = CFG.quotas[this.department]; this.completeDepartment(); },
      boss: () => { if (this.mode !== "playing") this.startRun(); this.department = 4; this.startDepartment(); },
      gameOver: () => { if (this.mode !== "playing") this.startRun(); this.strikes = this.maxStrikes - 1; const form = this.spawnForm("urgent", true); if (form) this.shred(form); },
      win: () => { if (this.mode !== "playing") this.startRun(); this.score += 12500; this.finishRun(true); },
      strike: () => { const form = this.spawnForm("urgent", true); if (form) this.shred(form); },
      bank: (count = 4) => { this.player.stack = count; const tray = TRAY_SPOTS[this.trayIndex]; this.player.x = tray.x + 65; this.player.y = tray.y + 45; this.checkTray(); },
      resetSave: () => { this.save = { version: 1, best: 0, bestDept: 0, wins: 0, runs: 0, shake: true }; this.persist(); },
    };
  }

  dispose(): void {
    this.loop.stop(); this.audio.dispose();
    for (const remove of this.listeners) remove();
    this.listeners.length = 0; this.overlay.innerHTML = "";
    window.__GAME_READY__ = false;
  }
}

declare global {
  interface Window {
    __GAME_READY__: boolean;
    __gameProbe: () => { x: number; y: number; z: number };
    __STAMP_DEBUG__: {
      state: () => Record<string, unknown>; start: () => void; law: (id: LawId) => void; busy: () => void;
      upgrade: () => void; boss: () => void; gameOver: () => void; win: () => void; strike: () => void;
      bank: (count?: number) => void; resetSave: () => void;
    };
  }
}
