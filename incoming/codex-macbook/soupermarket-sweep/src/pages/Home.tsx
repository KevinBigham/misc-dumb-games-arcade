import { useEffect, useRef } from "react";
import { startGame, stopGame } from "@/game/boot";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    startGame(canvas);
    return () => stopGame();
  }, []);

  return (
    <div id="game-root">
      <canvas id="game-canvas" ref={canvasRef} aria-label="Soupermarket Sweep 3D game arena" />
      <div className="vignette" /><div className="grain" /><div id="crosshair"><i /><b /></div>
      <main id="ui-overlay">
        <section id="title-screen" className="screen active">
          <div className="title-topline"><span>OPEN 25 HOURS</span><span>NO REFUNDS • NO ESCAPE • NO DAIRY</span></div>
          <div className="title-layout">
            <div className="title-copy">
              <p className="eyebrow">WELCOME, VALUED CUSTOMER</p>
              <h1><span>SOUPER</span><span>MARKET</span><strong>SWEEP</strong></h1>
              <p className="subtitle">AISLES OF THE DAMNED</p>
              <p className="pitch">You are a haunted shopping cart full of legally questionable soup. The groceries are armed. Management wants a word.</p>
              <div className="title-actions">
                <button className="btn primary huge" data-action="start"><span>CLOCK IN</span><kbd>SPACE</kbd></button>
                <button className="btn ghost" data-action="help">HOW TO SURVIVE <span>↗</span></button>
                <button id="nightmare-button" className="btn nightmare hidden" data-action="nightmare">NIGHTMARE SHIFT: OFF</button>
              </div>
              <div className="save-strip"><span>BEST SHIFT <b id="best-score">000000</b></span><span>DEEPEST AISLE <b id="best-wave">0/7</b></span><span>BANANA <b id="banana-status">???</b></span></div>
            </div>
            <aside className="special-card"><div className="special-tag">TODAY'S SPECIAL</div><div className="special-skull">☠</div><h2>YOUR<br />DEMISE</h2><div className="price"><small>WAS</small> $9.99 <strong>NOW: YOUR SOUL</strong></div><p>Limit one apocalypse per customer. Coupons accepted.</p><div className="barcode">▌▌ ▌ ▌▌▌ ▌ ▌▌ ▌▌▌ ▌ ▌▌</div></aside>
          </div>
          <div className="title-footer"><span>WASD MOVE</span><span>MOUSE AIM + FIRE</span><span>SPACE DASH</span><span>Q SCREAM</span><span>E HAGGLE</span></div>
        </section>

        <section id="hud" className="hidden" aria-live="polite">
          <div className="hud-top-left panel-cut"><span className="micro" id="wave-kicker">AISLE 1 / 7</span><strong id="wave-name">PRODUCE AFTER DARK</strong><span id="enemies-left">14 CUSTOMERS REMAIN</span></div>
          <div className="hud-top-right"><div className="score-box"><span className="micro">SHIFT TOTAL</span><strong id="score">000000</strong><span id="multiplier">×1 FRESHNESS</span></div><div className="coupon-box"><span>▰</span><strong id="coupons">0</strong><small>COUPONS</small></div><button className="icon-btn" data-action="mute" id="mute-button" aria-label="Toggle sound">♪</button><button className="icon-btn" data-action="pause" aria-label="Pause game">Ⅱ</button></div>
          <div id="boss-wrap" className="hidden"><div><span id="boss-title">BARON VON BREAKFAST</span><small id="boss-phase">CHILLED &amp; CRUEL</small></div><div className="boss-track"><i id="boss-fill" /></div></div>
          <div className="hud-bottom-left panel-cut"><div className="health-label"><span>CART INTEGRITY</span><b id="hp-text">100 / 100</b></div><div className="health-track"><i id="health-fill" /><em id="health-ghost" /></div><div className="dash-row"><span>DASH</span><div className="dash-track"><i id="dash-fill" /></div><kbd>SPACE</kbd></div></div>
          <div id="hud-bottom-right" className="hud-bottom-right panel-cut"><div className="scream-label"><span>EXISTENTIAL SCREAM</span><kbd>Q</kbd></div><div className="scream-track"><i id="scream-fill" /></div><small id="scream-status">BOTTLE IT UP. THEN WEAPONIZE IT.</small></div>
          <div id="combo" className="hidden"><strong id="combo-count">12×</strong><span>FRESH<br />COMBO</span></div>
          <div id="interact-prompt" className="hidden"><kbd>E</kbd><span id="interact-text">HAGGLE WITH THE MACHINE • 12 COUPONS</span></div><div id="build-strip" />
        </section>

        <div id="wave-banner" className="hidden"><span id="banner-kicker">AISLE 1</span><strong id="banner-title">PRODUCE AFTER DARK</strong><p id="banner-subtitle">The peas have unionized.</p></div>
        <div id="toast" className="hidden"><strong id="toast-title">SECRET DISCOVERED</strong><span id="toast-text">The banana acknowledges you.</span></div><div id="damage-flash" />
        <section id="upgrade-screen" className="screen modal-screen hidden"><div className="modal-heading"><span className="eyebrow">AISLE CLEARED • EMPLOYEE OF THE MINUTE</span><h2>CHOOSE YOUR<br /><em>POOR DECISION</em></h2><p>One free mutation per shift. No refunds. Obviously.</p></div><div id="upgrade-cards" className="upgrade-cards" /><div className="upgrade-footer"><span id="upgrade-reroll">THE SOUP PROVIDES</span><span>PRESS 1, 2, OR 3</span></div></section>
        <section id="pause-screen" className="screen modal-screen hidden"><div className="pause-card"><span className="eyebrow">UNPAID BREAK</span><h2>PAUSED.</h2><p>The nightmare is contractually obligated to wait.</p><button className="btn primary" data-action="resume">BACK TO THE AISLES <kbd>ESC</kbd></button><button className="btn ghost" data-action="quality" id="quality-button">GRAPHICS: HIGH</button><button className="btn ghost" data-action="mute" id="pause-mute-button">SOUND: ON</button><button className="btn danger" data-action="restart">RESTART SHIFT</button><button className="text-btn" data-action="title">ABANDON CART → TITLE</button></div></section>
        <section id="end-screen" className="screen modal-screen hidden"><div className="end-card"><span id="end-kicker" className="eyebrow">SHIFT TERMINATED</span><h2 id="end-title">YOU HAVE BEEN<br /><em>RECALLED.</em></h2><p id="end-quote">Your cart will be collected between 8 AM and the heat death of the universe.</p><div className="receipt"><div><span>SOUP SERVED</span><b id="end-score">0</b></div><div><span>GROCERIES DECEASED</span><b id="end-kills">0</b></div><div><span>AISLE REACHED</span><b id="end-wave">1 / 7</b></div><div><span>COUPONS HOARDED</span><b id="end-coupons">0</b></div><div className="receipt-total"><span>PERFORMANCE</span><b id="end-grade">F−</b></div></div><button className="btn primary huge" data-action="restart">ANOTHER SHIFT <kbd>R</kbd></button><button className="text-btn" data-action="title">CRAWL BACK TO TITLE</button></div></section>
        <section id="help-screen" className="screen modal-screen hidden"><div className="help-card"><button className="close-btn" data-action="close-help" aria-label="Close instructions">×</button><span className="eyebrow">MANDATORY SAFETY ORIENTATION</span><h2>SOUP IS<br /><em>A VERB.</em></h2><div className="help-grid"><div><kbd>WASD</kbd><strong>Commit vehicular soup</strong><p>Move. Mouse aims. Hold left click to fire. On touch screens, your cart aims and fires itself.</p></div><div><kbd>SPACE</kbd><strong>Dash through nonsense</strong><p>You are invulnerable while dashing. Ram enemies and erase hostile shots to charge your Scream.</p></div><div><kbd>Q</kbd><strong>Let it all out</strong><p>At 100% Scream, damage everything nearby, delete bullets, and generally violate workplace policy.</p></div><div><kbd>E</kbd><strong>Haggle with capitalism</strong><p>Spend 12 coupons at the pink vending machine for healing and a random mutation.</p></div></div><p className="secret-hint">Rumor: the checkout scanner rewards repeat offenders. Three dashes ought to do it.</p><button className="btn primary" data-action="close-help">I ACCEPT THE RISKS</button></div></section>
        <div id="mobile-controls" className="hidden"><button data-action="dash">DASH</button><button data-action="scream">AAAARGH</button><button data-action="interact">HAGGLE</button></div>
      </main>
    </div>
  );
}
