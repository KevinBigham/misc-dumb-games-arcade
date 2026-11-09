import { useEffect, useRef } from 'react'
import { startGame, stopGame } from '@/game/boot'

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    startGame(canvas)
    return () => stopGame()
  }, [])

  return (
    <div id="game-root">
      <canvas id="game-canvas" ref={canvasRef} tabIndex={0} aria-label="Piñata Panic 3D game arena" />
      <div className="scene-vignette" />
      <div id="impact-flash" />

      <div id="hud" className="hidden" aria-live="polite">
        <div className="hud-top-left">
          <div className="mini-brand">PIÑATA <b>PANIC!</b></div>
          <div className="wave-pill"><span id="wave-number">PARTY 1/5</span><strong id="wave-name">ARRIVAL</strong></div>
        </div>

        <div className="timer-wrap">
          <span>CAKE O'CLOCK</span>
          <strong id="timer">0:58</strong>
        </div>

        <div className="score-wrap">
          <span>BANKED VALUE</span>
          <strong id="score">000000</strong>
          <small>BEST <b id="best-score">000000</b></small>
        </div>

        <div className="objective-card">
          <div className="objective-heading"><span>GOODY BAG QUOTA</span><b id="quota-text">0 / 18</b></div>
          <div className="meter"><i id="quota-fill" /></div>
          <p id="wave-rule">Bank candy. Do not become the entertainment.</p>
        </div>

        <div id="combo" className="combo"><span>BANK STREAK</span><strong>×1</strong></div>

        <div className="candy-card">
          <div className="candy-icon">◆</div>
          <div><span>INSIDE YOU / HEALTH + AMMO</span><strong id="candy-count">18</strong></div>
          <div id="shield-pip" className="shield-pip hidden">⬡ SHELL READY</div>
        </div>

        <div className="dash-card">
          <div className="dash-label"><span>SPACE • PANIC DASH</span><b id="dash-text">READY</b></div>
          <div className="meter"><i id="dash-fill" /></div>
          <small>Dash through presents. Dash through bad decisions.</small>
        </div>

        <div id="context-tip" className="context-tip">CLICK TO THROW 3 CANDY • GUESTS EAT IT • THEN GET A SUGAR RUSH</div>
        <div id="event-banner" className="event-banner hidden"><small>PARTY UPDATE</small><strong /></div>
        <div id="boss-status" className="boss-status hidden">⚠ THE BIRTHDAY CHILD IS MAKING A WISH ⚠</div>
      </div>

      <div className="global-controls">
        <button id="mute-button" data-action="mute" aria-label="Toggle sound">♫ SOUND ON</button>
        <button id="motion-button" data-action="motion" aria-label="Toggle camera shake">≈ SHAKE ON</button>
      </div>

      <div id="ui-overlay">
        <section id="title-screen" className="screen title-screen active">
          <div className="title-layout">
            <div className="title-copy">
              <div className="eyebrow">A COMPLETELY NORMAL BIRTHDAY PARTY</div>
              <h1><span>PIÑATA</span><em>PANIC!</em></h1>
              <p className="tagline">THE CANDY IS YOUR BLOOD.<br />ALSO YOUR AMMO. ALSO YOUR RETIREMENT PLAN.</p>
              <button className="primary-button" data-action="start"><span>SURVIVE YOUR OWN PARTY</span><kbd>SPACE</kbd></button>
              <div className="best-ribbon">LOCAL BEST <b id="title-best">000000</b> <span>•</span> NO GUESTS WERE UNSUGARED</div>
            </div>
            <div className="briefing-card">
              <div className="briefing-header"><span>YOUR PARTY ITINERARY</span><b>5 DISASTERS</b></div>
              <ol>
                <li><i>01</i><div><strong>THROW YOUR INSIDES</strong><p>Click to toss 3 candy. Guests chase the bait, eat it, then become alarmingly fast.</p></div></li>
                <li><i>02</i><div><strong>BANK BEFORE THEY MOB YOU</strong><p>Stand at the goody bag. Banked candy becomes score, but leaves you emptier and easier to finish.</p></div></li>
                <li><i>03</i><div><strong>WEAPONIZE PANIC</strong><p>Space to dash. Smash presents for refills. Fill all five quotas to escape the party industrial complex.</p></div></li>
              </ol>
              <div className="controls-grid"><span><kbd>WASD</kbd> SCAMPER</span><span><kbd>CLICK</kbd> BAIT</span><span><kbd>SPACE</kbd> DASH</span><span><kbd>ESC</kbd> PAUSE</span></div>
            </div>
          </div>
          <div className="title-footnote">DETERMINISTIC CHAOS • PROCEDURAL AUDIO • LOCAL SAVE • ZERO ADULT SUPERVISION</div>
        </section>

        <section id="pause-screen" className="screen modal-screen">
          <div className="modal-card pause-card">
            <div className="eyebrow">INTERMISSION / ILLEGAL CAKE BREAK</div>
            <h2>PARTY<br /><em>PAUSED.</em></h2>
            <p>The guests are frozen mid-poor-decision.</p>
            <button className="primary-button" data-action="resume">RESUME THE NONSENSE <kbd>ESC</kbd></button>
            <div className="button-row"><button data-action="restart">RESTART PARTY</button><button data-action="title">FLEE TO TITLE</button></div>
          </div>
        </section>

        <section id="upgrade-screen" className="screen modal-screen">
          <div className="upgrade-layout">
            <div className="eyebrow">MANDATORY FUN BREAK</div>
            <h2>CHOOSE YOUR<br /><em>POOR DECISION.</em></h2>
            <p id="upgrade-subtitle">The next party activity is somehow worse.</p>
            <div id="upgrade-cards" className="upgrade-cards" />
            <small className="keyboard-note">PRESS 1, 2, OR 3 • THERE ARE NO REFUNDS</small>
          </div>
        </section>

        <section id="results-screen" className="screen modal-screen">
          <div className="modal-card results-card">
            <div id="result-eyebrow" className="eyebrow">INCIDENT REPORT</div>
            <h2 id="result-title">PARTY<br /><em>FOUL.</em></h2>
            <p id="result-reason">You became a cautionary party favor.</p>
            <div className="result-score"><span>BANKED VALUE</span><strong id="result-score">000000</strong><small id="result-best">LOCAL BEST 000000</small></div>
            <div className="stats-grid">
              <div><b id="stat-banked">0</b><span>CANDY BANKED</span></div>
              <div><b id="stat-thrown">0</b><span>INSIDES THROWN</span></div>
              <div><b id="stat-rushed">0</b><span>SUGAR RUSHES</span></div>
              <div><b id="stat-dashes">0</b><span>PANIC DASHES</span></div>
            </div>
            <div id="result-rank" className="result-rank">RANK: DECORATIVE CAUTIONARY TALE</div>
            <button className="primary-button" data-action="restart">ONE MORE TERRIBLE PARTY <kbd>R</kbd></button>
            <button className="text-button" data-action="title">RETURN TO TITLE / PRETEND THIS NEVER HAPPENED</button>
          </div>
        </section>
      </div>
    </div>
  )
}
