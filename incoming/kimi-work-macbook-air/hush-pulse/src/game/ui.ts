import type { GameMode, RunStats, Upgrade } from "./types";
import { clamp, formatTime } from "./utils";

export interface UICallbacks { start: () => void; resume: () => void; restart: () => void; title: () => void; upgrade: (index: number) => void; mute: () => void; pause: () => void; pulse: () => void; decoy: () => void; }
export interface UIFrame { mode: GameMode; hp: number; maxHp: number; noise: number; hushed: boolean; dampened: boolean; score: number; combo: number; comboTime: number; wave: number; enemies: number; pulseCooldown: number; pulseMax: number; decoyCooldown: number; decoyMax: number; bossHp: number; bossMaxHp: number; shield: number; }

export class GameUI {
  private title: HTMLElement; private hud: HTMLElement; private upgrade: HTMLElement; private pause: HTMLElement; private result: HTMLElement;
  private announceEl: HTMLElement; private tutorialEl: HTMLElement; private flashEl: HTMLElement;
  private announceTimer = 0; private tutorialText = ""; private lastMode: GameMode | null = null;
  constructor(private root: HTMLElement, private cb: UICallbacks) {
    root.innerHTML = `
      <div class="vignette"></div><div class="grain"></div><div id="damage-flash"></div>
      <section id="title-screen" class="screen">
        <div class="title-top"><span class="eyebrow">AN ECHOLOCATION ROGUELITE</span><span class="build">NO LIGHT. NO MERCY.</span></div>
        <div class="title-layout"><div class="hero"><div class="pretitle">WELCOME TO THE WORLD AFTER SOUND</div>
          <h1><span>HUSH</span><i>//</i><strong>PULSE</strong></h1>
          <p class="tagline">You can't see in the dark.<br><em>So make some noise.</em></p>
          <button class="primary" data-action="start"><span>ENTER THE QUIET</span><kbd>SPACE</kbd></button>
          <div class="best-line">BEST SIGNAL <b id="best-score">000000</b> <span>•</span> ESCAPES <b id="wins">0</b></div></div>
          <div class="manual"><div class="manual-head"><span>FIELD MANUAL</span><small>READ THE DARK</small></div>
            <div class="manual-row"><b>01</b><div><h3>SOUND IS SIGHT</h3><p><kbd>SPACE</kbd> sends a sonar pulse. It reveals the arena and makes enemies <cyan>RESONATE</cyan>.</p></div></div>
            <div class="manual-row"><b>02</b><div><h3>EVERYONE HEARS YOU</h3><p>Noise attracts predators. Hold <kbd>SHIFT</kbd> to Hush: slower, silent, and immune to red shockwaves.</p></div></div>
            <div class="manual-row"><b>03</b><div><h3>MAKE THEM SING</h3><p>Aim + <kbd>LMB</kbd> to fire. Resonant hits crit and detonate. <kbd>RMB</kbd> throws a decoy. Chain the explosions.</p></div></div>
            <div class="controls-strip"><span><kbd>WASD</kbd> MOVE</span><span><kbd>ESC</kbd> PAUSE</span><span><kbd>M</kbd> MUTE</span></div></div></div>
        <div class="title-footer"><span>HEADPHONES RECOMMENDED · ALL CUES ARE ALSO VISUAL</span><span>5 MOVEMENTS · 12 MUTATIONS · 1 VERY BAD CONDUCTOR</span></div>
      </section>
      <section id="hud" class="hidden">
        <div class="hud-top-left panel-cut"><span class="micro">MOVEMENT</span><div><b id="wave-num">01</b><span>/ 05</span></div><p id="objective">6 SIGNALS REMAIN</p></div>
        <div class="hud-score"><span>SIGNAL</span><b id="score">000000</b><div id="combo" class="combo hidden">×2 <small>CHAIN</small><i></i></div></div>
        <div class="hud-top-right"><button class="icon-btn" data-action="mute" id="mute-btn" aria-label="Toggle sound">SOUND ON</button><button class="icon-btn square" data-action="pause" aria-label="Pause">Ⅱ</button></div>
        <div id="boss-wrap" class="hidden"><div><span>THE CONDUCTOR</span><small id="boss-phase">MOVEMENT I</small></div><div class="boss-track"><i id="boss-fill"></i></div></div>
        <div class="hud-bottom-left"><div class="health-label"><span>INTEGRITY</span><b id="hp-text">100</b></div><div class="health-track"><i id="health-fill"></i><div class="health-ticks"></div></div><div id="shield-label" class="shield-label hidden">◇ STATIC SHELL ARMED</div></div>
        <div class="noise-wrap"><div class="noise-label"><span>YOUR NOISE</span><b id="noise-state">UNHEARD</b></div><div class="noise-track"><i id="noise-fill"></i><span class="noise-danger"></span></div><small id="hush-state">THEY ARE LISTENING</small></div>
        <div class="abilities"><div class="ability" id="pulse-ability"><div class="ability-icon pulse-icon">◉<i class="cooldown"></i></div><div><b>SPACE</b><span>PULSE</span></div></div><div class="ability" id="decoy-ability"><div class="ability-icon">♪<i class="cooldown"></i></div><div><b>RMB</b><span>DECOY</span></div></div></div>
        <div id="crosshair"><i></i><b></b></div><div class="mobile-actions"><button data-action="pulse">PULSE</button><button data-action="decoy">DECOY</button></div>
      </section>
      <div id="announcement" class="hidden"><small></small><b></b><p></p></div><div id="tutorial" class="hidden"></div>
      <section id="upgrade-screen" class="screen modal hidden"><div class="modal-inner wide"><span class="eyebrow">MOVEMENT CLEARED</span><h2>REMIX YOURSELF</h2><p>Choose one mutation. The dark will adapt.</p><div id="upgrade-cards"></div><small class="key-hint">PRESS 1 / 2 / 3 OR CLICK TO INSTALL</small></div></section>
      <section id="pause-screen" class="screen modal hidden"><div class="modal-inner"><span class="eyebrow">SIGNAL SUSPENDED</span><h2>HOLD THAT<br>THOUGHT.</h2><button class="primary" data-action="resume">RESUME <kbd>ESC</kbd></button><button class="secondary" data-action="restart">RESTART RUN</button><button class="text-btn" data-action="title">RETURN TO TITLE</button></div></section>
      <section id="result-screen" class="screen modal hidden"><div class="modal-inner result-inner"><span id="result-kicker" class="eyebrow">TRANSMISSION ENDED</span><h2 id="result-title">THE QUIET<br>WINS.</h2><p id="result-copy">You made a beautiful amount of noise.</p><div class="result-score"><span>FINAL SIGNAL</span><b id="result-score">000000</b><small id="new-best" class="hidden">NEW PERSONAL BEST</small></div><div class="stats"><div><b id="stat-kills">0</b><span>ERASED</span></div><div><b id="stat-resonant">0</b><span>RESONANT KILLS</span></div><div><b id="stat-chain">0</b><span>BEST CHAIN</span></div><div><b id="stat-time">00:00</b><span>RUN TIME</span></div></div><button class="primary" data-action="restart">MAKE MORE NOISE <kbd>SPACE</kbd></button><button class="text-btn" data-action="title">RETURN TO TITLE</button></div></section>`;
    this.title = root.querySelector("#title-screen")!; this.hud = root.querySelector("#hud")!; this.upgrade = root.querySelector("#upgrade-screen")!;
    this.pause = root.querySelector("#pause-screen")!; this.result = root.querySelector("#result-screen")!; this.announceEl = root.querySelector("#announcement")!;
    this.tutorialEl = root.querySelector("#tutorial")!; this.flashEl = root.querySelector("#damage-flash")!;
    root.addEventListener("click", this.onClick); window.addEventListener("pointermove", this.onPointerMove);
  }
  private onClick = (event: Event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]"); if (!target) return;
    const action = target.dataset.action;
    if (action === "start") this.cb.start(); else if (action === "resume") this.cb.resume(); else if (action === "restart") this.cb.restart();
    else if (action === "title") this.cb.title(); else if (action === "mute") this.cb.mute(); else if (action === "pause") this.cb.pause();
    else if (action === "pulse") this.cb.pulse(); else if (action === "decoy") this.cb.decoy(); else if (action === "upgrade") this.cb.upgrade(Number(target.dataset.index));
  };
  private onPointerMove = (event: PointerEvent) => { const c = this.root.querySelector<HTMLElement>("#crosshair"); if (c) { c.style.left = `${event.clientX}px`; c.style.top = `${event.clientY}px`; } };
  setBest(score: number, wins: number) { this.root.querySelector("#best-score")!.textContent = Math.floor(score).toString().padStart(6, "0"); this.root.querySelector("#wins")!.textContent = String(wins); }
  setMuted(muted: boolean) { this.root.querySelector("#mute-btn")!.textContent = muted ? "SOUND OFF" : "SOUND ON"; }
  setMode(mode: GameMode) {
    if (mode === this.lastMode) return; this.lastMode = mode;
    this.title.classList.toggle("hidden", mode !== "title"); this.hud.classList.toggle("hidden", !["playing", "paused", "upgrade"].includes(mode));
    this.upgrade.classList.toggle("hidden", mode !== "upgrade"); this.pause.classList.toggle("hidden", mode !== "paused");
    this.result.classList.toggle("hidden", !["gameover", "victory"].includes(mode)); if (mode !== "playing") this.tutorialEl.classList.add("hidden");
  }
  showUpgrades(options: Upgrade[]) { this.root.querySelector("#upgrade-cards")!.innerHTML = options.map((u, i) => `<button class="upgrade-card" data-action="upgrade" data-index="${i}"><span class="card-num">0${i + 1}</span><small>${u.kicker}</small><h3>${u.name}</h3><p>${u.description}</p><b>INSTALL <i>↗</i></b></button>`).join(""); }
  showResult(victory: boolean, stats: RunStats, best: boolean) {
    this.root.querySelector("#result-kicker")!.textContent = victory ? "THE FINAL NOTE RINGS OUT" : "TRANSMISSION ENDED";
    this.root.querySelector("#result-title")!.innerHTML = victory ? "SILENCE<br>IS BROKEN." : "THE QUIET<br>WINS.";
    this.root.querySelector("#result-copy")!.textContent = victory ? "You taught the dark how to scream. The city will remember this song." : "You made a beautiful amount of noise. Next time, make it count.";
    this.root.querySelector("#result-score")!.textContent = Math.floor(stats.score).toString().padStart(6, "0");
    this.root.querySelector("#stat-kills")!.textContent = String(stats.kills); this.root.querySelector("#stat-resonant")!.textContent = String(stats.resonantKills);
    this.root.querySelector("#stat-chain")!.textContent = `×${stats.bestCombo}`; this.root.querySelector("#stat-time")!.textContent = formatTime(stats.elapsed);
    this.root.querySelector("#new-best")!.classList.toggle("hidden", !best);
  }
  announce(kicker: string, title: string, copy = "", duration = 2.5) {
    this.announceEl.querySelector("small")!.textContent = kicker; this.announceEl.querySelector("b")!.textContent = title; this.announceEl.querySelector("p")!.textContent = copy;
    this.announceEl.classList.remove("hidden", "slam"); void this.announceEl.offsetWidth; this.announceEl.classList.add("slam"); this.announceTimer = duration;
  }
  tutorial(text: string) { if (text === this.tutorialText) return; this.tutorialText = text; this.tutorialEl.innerHTML = text; this.tutorialEl.classList.toggle("hidden", !text); }
  flashDamage() { this.flashEl.classList.remove("hit"); void this.flashEl.offsetWidth; this.flashEl.classList.add("hit"); }
  update(dt: number, f: UIFrame) {
    this.setMode(f.mode); if (this.announceTimer > 0) { this.announceTimer -= dt; if (this.announceTimer <= 0) this.announceEl.classList.add("hidden"); }
    const text = (id: string, value: string) => { const el = this.root.querySelector(`#${id}`); if (el && el.textContent !== value) el.textContent = value; };
    text("wave-num", String(f.wave).padStart(2, "0")); text("objective", f.wave === 5 ? "BREAK THE CONDUCTOR" : `${f.enemies} SIGNAL${f.enemies === 1 ? "" : "S"} REMAIN`);
    text("score", Math.floor(f.score).toString().padStart(6, "0")); text("hp-text", String(Math.ceil(f.hp)));
    (this.root.querySelector("#health-fill") as HTMLElement).style.width = `${clamp(f.hp / f.maxHp, 0, 1) * 100}%`;
    (this.root.querySelector("#noise-fill") as HTMLElement).style.width = `${f.noise}%`;
    text("noise-state", f.hushed ? "HUSHED" : f.noise > 75 ? "HUNTED" : f.noise > 35 ? "HEARD" : "UNHEARD");
    text("hush-state", f.dampened ? "A MUTE IS EATING YOUR ECHO" : f.hushed ? "SILENT · RED WAVES CANNOT HEAR YOU" : f.noise > 75 ? "THE WHOLE DARK KNOWS YOUR NAME" : "HOLD SHIFT TO MOVE SILENTLY");
    this.root.querySelector("#hud")!.classList.toggle("danger", f.noise > 75); this.root.querySelector("#hud")!.classList.toggle("low-health", f.hp / f.maxHp < 0.28);
    const combo = this.root.querySelector("#combo")!; combo.classList.toggle("hidden", f.combo < 2);
    if (f.combo >= 2) combo.innerHTML = `×${f.combo} <small>CHAIN</small><i style="width:${clamp(f.comboTime / 3, 0, 1) * 100}%"></i>`;
    this.cooldown("pulse-ability", f.pulseCooldown / f.pulseMax); this.cooldown("decoy-ability", f.decoyCooldown / f.decoyMax);
    this.root.querySelector("#boss-wrap")!.classList.toggle("hidden", f.wave !== 5 || f.bossMaxHp <= 0);
    (this.root.querySelector("#boss-fill") as HTMLElement).style.width = `${clamp(f.bossHp / Math.max(1, f.bossMaxHp), 0, 1) * 100}%`;
    text("boss-phase", f.bossHp / f.bossMaxHp < 0.33 ? "FINALE · FORTISSIMO" : f.bossHp / f.bossMaxHp < 0.67 ? "MOVEMENT II · RAGE" : "MOVEMENT I · OVERTURE");
    this.root.querySelector("#shield-label")!.classList.toggle("hidden", f.shield <= 0);
  }
  private cooldown(id: string, ratio: number) { const el = this.root.querySelector(`#${id}`)!; el.classList.toggle("cooling", ratio > 0.01); (el.querySelector(".cooldown") as HTMLElement).style.transform = `scaleY(${clamp(ratio, 0, 1)})`; }
  dispose() { this.root.removeEventListener("click", this.onClick); window.removeEventListener("pointermove", this.onPointerMove); this.root.innerHTML = ""; }
}
