// @ts-nocheck -- DOM-only template; keeps TS 5.9 from stalling on this large static HUD.
import type { GameMode, GameSnapshot, LawDef, RunStats, UpgradeDef } from "./types";
import { formatTime } from "./utils";
export class GameUI {
  onStart = () => {}; onResume = () => {}; onRestart = () => {}; onPause = () => {}; onMute = () => {}; onShake = () => {}; onUpgrade: (id: string) => void = () => {};
  private hud: HTMLElement; private title: HTMLElement; private pause: HTMLElement; private upgrade: HTMLElement; private results: HTMLElement;
  private charge: HTMLElement; private chargeLabel: HTMLElement; private laws: HTMLElement; private banner: HTMLElement; private toast: HTMLElement; private combo: HTMLElement; private boss: HTMLElement;
  private bannerTimer = 0; private toastTimer = 0; private lastText = new Map<HTMLElement, string>();
  constructor(private root: HTMLElement) {
    root.innerHTML = `
      <section class="hud" aria-label="Game status"><div class="hud-top">
        <div class="dept-card paper-card"><span class="eyebrow" id="dept-code">DEPT. 01</span><strong id="dept-name">GENERAL INBOX</strong><div class="quota-line"><span id="objective">FILE 5 FORMS</span><b id="quota-text">0 / 5</b></div><div class="meter slim"><i id="quota-fill"></i></div></div>
        <div class="score-block"><span>TRIANGULAR POINTS</span><strong id="score">000000</strong><small id="best-inline">BEST 000000</small></div>
        <div class="hud-actions"><button class="icon-button" id="mute" aria-label="Toggle sound">SOUND ON</button><button class="icon-button" id="pause-button" aria-label="Pause game">PAUSE</button></div>
      </div><div class="strikes" id="strikes" aria-label="Three strikes remaining"></div><div class="law-list" id="laws"></div><div class="combo" id="combo"></div>
      <div class="boss-hud" id="boss"><div><span>FINAL PERFORMANCE REVIEW</span><b>THE AUDITOR</b></div><div class="meter"><i id="boss-fill"></i></div></div>
      <div class="stack-card paper-card"><span class="eyebrow">CARRIED PAPERWORK</span><strong><b id="stack">0</b><small> / <span id="stack-max">10</span> FORMS</small></strong><div class="stack-pips" id="stack-pips"></div><span class="stack-note">HEAVIER • WIDER • WORTH MORE</span></div>
      <div class="charge-wrap"><div class="charge-copy"><span id="charge-label">HOLD TO COMMIT</span><b>RELEASE TO SLAM</b></div><div class="charge-bar"><i id="charge-fill"></i><em></em></div><div class="control-hint"><kbd>WASD</kbd> SCOOT <span>•</span> <kbd>HOLD CLICK / SPACE</kbd> CHARGE <span>•</span> <kbd>ESC</kbd> PAUSE</div></div></section>
      <div class="memo-banner" id="memo-banner"><span>MEMO FROM MANAGEMENT</span><strong></strong><p></p></div><div class="toast" id="toast"></div>
      <section class="screen title-screen" id="title-screen"><div class="title-panel"><div class="stamp-chip">FORM 00-B • CAREER OPPORTUNITY</div><h1><span>STAMP</span><span>DUTY</span></h1><h2>EXECUTIVE DISORDER</h2><p class="title-copy">You are a rubber stamp. Management has opinions about physics.</p><button class="primary-button" id="start-button"><span>BEGIN ORIENTATION</span><kbd>SPACE</kbd></button>
      <div class="title-how"><div><b>01</b><span><strong>CHARGE & SLAM</strong>Aim with the mouse. Hold, release, become stationery.</span></div><div><b>02</b><span><strong>CARRY THE CHAOS</strong>Stamped forms slow you down and multiply your payout.</span></div><div><b>03</b><span><strong>FILE IT IN OUT</strong>Bank your stack. Survive four departments. Meet the Auditor.</span></div></div>
      <div class="title-record"><span id="title-best">PERSONAL BEST 000000</span><span id="title-wins">0 SUCCESSFUL PERFORMANCE REVIEWS</span></div></div><div class="title-note">ZERO TRAINING • FULL BENEFITS*<small>*Benefits are triangular.</small></div></section>
      <section class="screen modal-screen hidden" id="pause-screen"><div class="modal-card"><span class="eyebrow">UNSCHEDULED WORK-LIFE BALANCE</span><h2>PAUSED</h2><p>The paperwork is experiencing a rare moment of stability.</p><button class="primary-button" id="resume-button">RETURN TO DESK <kbd>ESC</kbd></button><button class="secondary-button" id="restart-pause">RESTART SHIFT</button><button class="secondary-button" id="shake-button">CAMERA SHAKE: ON</button><small>Progress saves only your local best score and settings.</small></div></section>
      <section class="screen modal-screen hidden" id="upgrade-screen"><div class="upgrade-panel"><span class="eyebrow">DEPARTMENT CLEARED • CHOOSE ONE</span><h2>UNREQUESTED PROMOTION</h2><p>Management has generated three equally binding opportunities.</p><div class="upgrade-grid" id="upgrade-grid"></div></div></section>
      <section class="screen modal-screen hidden" id="results-screen"><div class="receipt"><div class="receipt-head"><span class="eyebrow" id="result-eyebrow">INCIDENT REPORT</span><h2 id="result-title">REASSIGNED</h2><p id="result-copy"></p></div><div class="receipt-lines" id="result-lines"></div><div class="receipt-total"><span>TRIANGULAR POINTS</span><strong id="result-score">0</strong><small id="result-rank"></small></div><button class="primary-button" id="restart-results">ONE MORE SHIFT <kbd>R</kbd></button><span class="receipt-foot">THANK YOU FOR CHOOSING GAINFUL EMBOSSMENT</span></div></section>`;
    this.hud = root.querySelector(".hud")!; this.title = root.querySelector("#title-screen")!; this.pause = root.querySelector("#pause-screen")!; this.upgrade = root.querySelector("#upgrade-screen")!; this.results = root.querySelector("#results-screen")!;
    this.charge = root.querySelector("#charge-fill")!; this.chargeLabel = root.querySelector("#charge-label")!; this.laws = root.querySelector("#laws")!; this.banner = root.querySelector("#memo-banner")!; this.toast = root.querySelector("#toast")!; this.combo = root.querySelector("#combo")!; this.boss = root.querySelector("#boss")!;
    root.querySelector("#start-button")!.addEventListener("click", () => this.onStart()); root.querySelector("#resume-button")!.addEventListener("click", () => this.onResume());
    root.querySelector("#restart-pause")!.addEventListener("click", () => this.onRestart()); root.querySelector("#restart-results")!.addEventListener("click", () => this.onRestart());
    root.querySelector("#pause-button")!.addEventListener("click", () => this.onPause()); root.querySelector("#mute")!.addEventListener("click", () => this.onMute()); root.querySelector("#shake-button")!.addEventListener("click", () => this.onShake());
    root.querySelector("#upgrade-grid")!.addEventListener("click", (event) => { const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-upgrade]"); if (button && !button.disabled) this.onUpgrade(button.dataset.upgrade!); });
    this.setMode("title");
  }
  setMode(mode: GameMode): void {
    this.title.classList.toggle("hidden", mode !== "title"); this.pause.classList.toggle("hidden", mode !== "paused"); this.upgrade.classList.toggle("hidden", mode !== "upgrade");
    this.results.classList.toggle("hidden", mode !== "gameover" && mode !== "victory"); this.hud.classList.toggle("hud-hidden", mode === "title" || mode === "gameover" || mode === "victory" || mode === "upgrade");
  }
  setRecord(best: number, wins: number): void { this.text("title-best", `PERSONAL BEST ${this.pad(best)}`); this.text("title-wins", `${wins} SUCCESSFUL PERFORMANCE REVIEW${wins === 1 ? "" : "S"}`); this.text("best-inline", `BEST ${this.pad(best)}`); }
  setMuted(muted: boolean): void { this.text("mute", muted ? "SOUND OFF" : "SOUND ON"); }
  setShake(enabled: boolean): void { this.text("shake-button", `CAMERA SHAKE: ${enabled ? "ON" : "OFF"}`); }
  update(snapshot: GameSnapshot, activeLaws: Array<{ def: LawDef; remaining: number }>, upgradeLevels: Record<string, number>): void {
    this.text("score", this.pad(snapshot.score)); this.text("dept-code", snapshot.department < 4 ? `DEPT. 0${snapshot.department + 1}` : "FINAL REVIEW");
    this.text("dept-name", ["GENERAL INBOX", "PAYROLL & PASTRY", "COMPLIANCE", "EXECUTIVE FLOOR", "THE AUDITOR"][snapshot.department]);
    this.text("quota-text", snapshot.department < 4 ? `${snapshot.quota} / ${snapshot.quotaTarget}` : `${snapshot.bossHp} HP`); this.text("objective", snapshot.department < 4 ? "FILE FORMS IN OUT" : "SLAM THE AUDITOR");
    this.text("stack", String(snapshot.stack)); this.text("stack-max", String(snapshot.stackMax));
    const quota = snapshot.department < 4 ? snapshot.quota / snapshot.quotaTarget : 1 - snapshot.bossHp / snapshot.bossMaxHp;
    (this.root.querySelector("#quota-fill") as HTMLElement).style.width = `${Math.max(0, Math.min(1, quota)) * 100}%`;
    this.charge.style.width = `${Math.min(1, snapshot.charge) * 100}%`; this.charge.classList.toggle("overcharged", snapshot.charge > 1);
    this.chargeLabel.textContent = snapshot.charge <= 0.02 ? "HOLD TO COMMIT" : snapshot.charge > 1 ? "OVERCOMMITTING!" : snapshot.charge > 0.7 ? "EXECUTIVE DECISION READY" : "COMMITTING...";
    const strikes = this.root.querySelector("#strikes")!;
    const strikeHTML = [0, 1, 2].map((i) => `<span class="${i < 3 - snapshot.strikes ? "alive" : "lost"}">${i < 3 - snapshot.strikes ? "◆" : "◇"}</span>`).join("") + "<small>REASSIGNMENTS REMAINING</small>";
    if (strikes.innerHTML !== strikeHTML) strikes.innerHTML = strikeHTML;
    const pips = this.root.querySelector("#stack-pips")!; const pipHTML = Array.from({ length: snapshot.stackMax }, (_, i) => `<i class="${i < snapshot.stack ? "filled" : ""}"></i>`).join(""); if (pips.innerHTML !== pipHTML) pips.innerHTML = pipHTML;
    const lawHTML = activeLaws.map((law) => `<div class="law-chip ${law.def.helpful ? "helpful" : ""}"><span>ACTIVE MEMO • ${Math.ceil(law.remaining)}s</span><b>${law.def.title}</b></div>`).join(""); if (this.laws.innerHTML !== lawHTML) this.laws.innerHTML = lawHTML;
    this.combo.classList.toggle("visible", snapshot.combo > 1); this.combo.innerHTML = snapshot.combo > 1 ? `<strong>×${snapshot.combo}</strong><span>STAMP RHYTHM</span>` : "";
    this.boss.classList.toggle("visible", snapshot.department === 4 && snapshot.bossHp > 0); (this.root.querySelector("#boss-fill") as HTMLElement).style.width = `${snapshot.bossHp / snapshot.bossMaxHp * 100}%`;
    this.hud.dataset.perks = Object.keys(upgradeLevels).length.toString();
  }
  tick(dt: number): void {
    if (this.bannerTimer > 0 && (this.bannerTimer -= dt) <= 0) this.banner.classList.remove("visible");
    if (this.toastTimer > 0 && (this.toastTimer -= dt) <= 0) this.toast.classList.remove("visible");
  }
  showMemo(def: LawDef): void { this.banner.querySelector("strong")!.textContent = def.title; this.banner.querySelector("p")!.textContent = def.detail; this.banner.classList.remove("visible"); void this.banner.offsetWidth; this.banner.classList.add("visible"); this.bannerTimer = 2.2; }
  showToast(message: string, tone: "good" | "bad" | "neutral" = "neutral"): void { this.toast.textContent = message; this.toast.dataset.tone = tone; this.toast.classList.remove("visible"); void this.toast.offsetWidth; this.toast.classList.add("visible"); this.toastTimer = 1.6; }
  showUpgrade(options: UpgradeDef[], levels: Record<string, number>): void {
    this.root.querySelector("#upgrade-grid")!.innerHTML = options.map((option, index) => `<button class="upgrade-card" data-upgrade="${option.id}"><span class="upgrade-number">0${index + 1} • LEVEL ${(levels[option.id] || 0) + 1}</span><i>${option.icon}</i><strong>${option.name}</strong><p>${option.description}</p><small>${option.flavor}</small><b>ACCEPT PROMOTION →</b></button>`).join("");
  }
  showResults(victory: boolean, stats: RunStats, best: number, newBest: boolean): void {
    this.text("result-eyebrow", victory ? "FORM 100-A • PROMOTION RECEIPT" : "FORM 404-U • INCIDENT REPORT"); this.text("result-title", victory ? "THE DESK IS YOURS" : "REASSIGNED");
    this.text("result-copy", victory ? "The Auditor has been filed under ‘handled.’ Management fears your stationery." : "Three forms entered the shredder. Your googly eyes have been moved to the basement.");
    const rows: Array<[string, string]> = [["Forms aggressively approved", String(stats.stamped)], ["Forms responsibly filed", String(stats.banked)], ["Best stamp rhythm", `×${stats.bestCombo}`], ["Largest paper toddler", `${stats.biggestStack} forms`], ["Ducks disturbed", String(stats.ducks)], ["Calculator assaults", String(stats.calculators)], ["Seconds spent deliberating", formatTime(stats.elapsed)], ["Departments survived", `${stats.departments} / 4`]];
    this.root.querySelector("#result-lines")!.innerHTML = rows.map(([name, value]) => `<div><span>${name}</span><i></i><b>${value}</b></div>`).join("");
    this.text("result-score", `${stats.score.toLocaleString()}${newBest ? " ★" : ""}`); this.text("result-rank", `${this.rank(stats.score, victory)}${newBest ? " • NEW PERSONAL BEST" : ` • BEST ${best.toLocaleString()}`}`);
  }
  private rank(score: number, victory: boolean): string { if (victory && score > 12000) return "RANK: THE DESK ITSELF"; if (victory) return "RANK: EXECUTIVE STAMP"; if (score > 8000) return "RANK: SENIOR INKFLUENCER"; if (score > 4000) return "RANK: MIDDLE MANAGEMENT"; if (score > 1500) return "RANK: PAID INTERN"; return "RANK: UNPAID INTERN"; }
  private text(id: string, value: string): void { const element = this.root.querySelector<HTMLElement>(`#${id}`)!; if (this.lastText.get(element) !== value) { element.textContent = value; this.lastText.set(element, value); } }
  private pad(score: number): string { return Math.round(score).toString().padStart(6, "0"); }
}
