import type { Enemy, GameMode, Player, Quality, SaveData, UpgradeDef } from "./types";
import { WAVES } from "./config";

export class GameUI {
  private els = new Map<string, HTMLElement>();
  private lastBuild = "";
  hurtFlash = 0;

  constructor(private onAction: (action: string, value?: string) => void) {
    document.querySelectorAll<HTMLElement>("[id]").forEach((el) => this.els.set(el.id, el));
    document.addEventListener("click", this.click);
  }

  dispose(): void {
    document.removeEventListener("click", this.click);
  }

  private click = (event: MouseEvent) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-action]");
    if (!button) return;
    this.onAction(button.dataset.action!, button.dataset.value);
  };

  private el(id: string): HTMLElement {
    return this.els.get(id)!;
  }

  private text(id: string, value: string | number): void {
    const el = this.el(id);
    const text = String(value);
    if (el.textContent !== text) el.textContent = text;
  }

  private visible(id: string, visible: boolean): void {
    this.el(id).classList.toggle("hidden", !visible);
  }

  setMode(mode: GameMode): void {
    this.visible("title-screen", mode === "title");
    this.visible("help-screen", mode === "help");
    this.visible("pause-screen", mode === "paused");
    this.visible("upgrade-screen", mode === "upgrade");
    this.visible("end-screen", mode === "gameover" || mode === "victory");
    this.visible("hud", mode === "playing" || mode === "paused" || mode === "upgrade");
    this.visible("mobile-controls", mode === "playing");
    this.el("crosshair").style.opacity = mode === "playing" ? "1" : "0";
    if (mode !== "playing") this.visible("interact-prompt", false);
  }

  syncTitle(save: SaveData, nightmare: boolean): void {
    this.text("best-score", Math.floor(save.highScore).toString().padStart(6, "0"));
    this.text("best-wave", `${save.bestWave}/${WAVES.length}`);
    this.text("banana-status", save.banana ? "UNPEELED" : "???");
    this.visible("nightmare-button", save.nightmareUnlocked);
    this.text("nightmare-button", `NIGHTMARE SHIFT: ${nightmare ? "ON" : "OFF"}`);
    this.el("nightmare-button").classList.toggle("active", nightmare);
  }

  setMuted(muted: boolean): void {
    this.text("mute-button", muted ? "×" : "♪");
    this.text("pause-mute-button", `SOUND: ${muted ? "OFF" : "ON"}`);
  }

  setQuality(quality: Quality): void {
    this.text("quality-button", `GRAPHICS: ${quality.toUpperCase()}`);
  }

  showBanner(wave: number): void {
    const def = WAVES[wave - 1];
    this.text("banner-kicker", def.boss ? "MANAGEMENT APPROACHES" : `AISLE ${wave} / ${WAVES.length}`);
    this.text("banner-title", def.name);
    this.text("banner-subtitle", def.subtitle);
    this.visible("wave-banner", true);
  }

  hideBanner(): void { this.visible("wave-banner", false); }

  toast(title: string, message: string): void {
    this.text("toast-title", title);
    this.text("toast-text", message);
    this.visible("toast", false);
    void this.el("toast").offsetWidth;
    this.visible("toast", true);
  }

  hideToast(): void { this.visible("toast", false); }

  showUpgrades(options: UpgradeDef[], levels: Map<string, number>): void {
    const container = this.el("upgrade-cards");
    container.replaceChildren();
    options.forEach((upgrade, index) => {
      const level = levels.get(upgrade.id) ?? 0;
      const button = document.createElement("button");
      button.className = "upgrade-card";
      button.dataset.action = "upgrade";
      button.dataset.value = upgrade.id;
      button.innerHTML = `
        <span class="upgrade-number">[ ${index + 1} ]</span>
        <span class="upgrade-icon">${upgrade.icon}</span>
        <span class="upgrade-rarity">${level ? "STACKS WITH BAD IDEAS" : "CURSED CLEARANCE"}</span>
        <h3>${upgrade.name}</h3>
        <p>${upgrade.description}</p>
        <small>${upgrade.flavor}</small>
        <span class="upgrade-level">LV ${level + 1} / ${upgrade.max}</span>`;
      container.appendChild(button);
    });
    this.updateBuild(levels);
  }

  updateBuild(levels: Map<string, number>): void {
    const key = [...levels.entries()].map(([id, level]) => `${id}:${level}`).join("|");
    if (key === this.lastBuild) return;
    this.lastBuild = key;
    const container = this.el("build-strip");
    container.replaceChildren();
    for (const [id, level] of levels) {
      const pip = document.createElement("span");
      pip.className = "build-pip";
      pip.dataset.upgrade = id;
      pip.textContent = String(level);
      container.appendChild(pip);
    }
  }

  update(player: Player, wave: number, remaining: number, boss: Enemy | undefined, elapsed: number): void {
    const hpRatio = Math.max(0, player.hp / player.stats.maxHp);
    this.el("health-fill").style.transform = `scaleX(${hpRatio})`;
    this.el("health-ghost").style.transform = `scaleX(${hpRatio})`;
    this.el("health-fill").style.background = hpRatio < 0.28 ? "var(--red)" : "var(--acid)";
    this.text("hp-text", `${Math.ceil(Math.max(0, player.hp))} / ${player.stats.maxHp}`);
    this.text("wave-kicker", `AISLE ${wave} / ${WAVES.length}`);
    this.text("wave-name", WAVES[wave - 1]?.name ?? "SHIFT COMPLETE");
    this.text("enemies-left", boss ? "MANAGEMENT MUST BE FIRED" : `${remaining} CUSTOMER${remaining === 1 ? "" : "S"} REMAIN`);
    this.text("score", Math.floor(player.score).toString().padStart(6, "0"));
    const multiplier = Math.min(4, 1 + Math.floor(player.combo / 5) * 0.25);
    this.text("multiplier", `×${multiplier.toFixed(multiplier % 1 ? 2 : 0)} FRESHNESS`);
    this.text("coupons", player.coupons);
    this.el("dash-fill").style.transform = `scaleX(${Math.min(1, 1 - player.dashCooldown / 1.25)})`;
    this.el("scream-fill").style.transform = `scaleX(${player.scream / 100})`;
    this.el("hud-bottom-right").classList.toggle("ready", player.scream >= 100);
    this.text("scream-status", player.scream >= 100 ? "PRESS Q. HR IS NOT READY." : "BOTTLE IT UP. THEN WEAPONIZE IT.");
    this.visible("combo", player.combo >= 3 && player.comboTimer > 0);
    this.text("combo-count", `${Math.floor(player.combo)}×`);
    this.visible("boss-wrap", !!boss && !boss.dead);
    if (boss) {
      this.el("boss-fill").style.transform = `scaleX(${Math.max(0, boss.hp / boss.maxHp)})`;
      this.text("boss-title", boss.kind === "fridge" ? "BARON VON BREAKFAST" : "THE REGIONAL MANAGER");
      this.text("boss-phase", boss.hp / boss.maxHp < 0.45 ? "EXTREMELY MICROMANAGING" : boss.kind === "fridge" ? "CHILLED & CRUEL" : "SYNERGY INCARNATE");
    }
    this.el("damage-flash").style.opacity = String(Math.max(0, this.hurtFlash));
    this.el("damage-flash").style.transform = `scale(${1 + this.hurtFlash * 0.04})`;
    if (elapsed < 0) this.hideToast();
  }

  interact(text: string | null): void {
    this.visible("interact-prompt", !!text);
    if (text) this.text("interact-text", text);
  }

  showEnd(victory: boolean, player: Player, wave: number, newBest: boolean): void {
    this.el("end-screen").querySelector(".end-card")!.classList.toggle("victory", victory);
    this.text("end-kicker", victory ? "SHIFT SURVIVED • PROMOTION DENIED" : "SHIFT TERMINATED");
    this.el("end-title").innerHTML = victory ? "YOU ARE<br /><em>UNEMPLOYABLE.</em>" : "YOU HAVE BEEN<br /><em>RECALLED.</em>";
    this.text("end-quote", victory
      ? "Management has been fired. The moon is a banana now. Nightmare Shift unlocked."
      : "Your cart will be collected between 8 AM and the heat death of the universe.");
    this.text("end-score", Math.floor(player.score).toLocaleString());
    this.text("end-kills", player.kills);
    this.text("end-wave", `${wave} / ${WAVES.length}`);
    this.text("end-coupons", player.coupons);
    const grade = victory ? (player.hp > player.stats.maxHp * 0.6 ? "S+" : "A") : wave >= 6 ? "B−" : wave >= 3 ? "C" : "F−";
    this.text("end-grade", newBest ? `${grade} ★` : grade);
  }
}
