import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  ArrowRight, Check, ChevronRight, Crosshair, Gauge, HelpCircle, HomeIcon,
  InfinityIcon, Keyboard, MousePointer2, Package, Pause, Play,
  RotateCcw, RotateCw, Sparkles, Trophy, Volume2, VolumeX, X, Zap,
} from "@/icons";
import { gameActions, startGame, stopGame } from "@/game/boot";
import { PALETTE, ROTATIONS, shapeBounds, shapeDef } from "@/game/config";
import type { Piece, UISnapshot } from "@/game/model";
import { storage } from "@/game/storage";

const scoreFormat = new Intl.NumberFormat("en-US");

function MiniPiece({ piece, tiny = false }: { piece: Piece; tiny?: boolean }) {
  const cells = ROTATIONS[piece.shape][piece.rotation % ROTATIONS[piece.shape].length];
  const bounds = shapeBounds(cells);
  const occupied = new Set(cells.map(([row, col]) => `${row}:${col}`));
  const color = PALETTE[piece.color % PALETTE.length].hex;
  return (
    <div
      className={`mini-piece ${tiny ? "tiny" : ""}`}
      style={{
        "--piece-color": color,
        gridTemplateColumns: `repeat(${bounds.cols}, var(--mini-cell))`,
        gridTemplateRows: `repeat(${bounds.rows}, var(--mini-cell))`,
      } as CSSProperties}
      aria-hidden="true"
    >
      {Array.from({ length: bounds.rows * bounds.cols }, (_, index) => {
        const row = Math.floor(index / bounds.cols);
        const col = index % bounds.cols;
        return <span key={index} className={occupied.has(`${row}:${col}`) ? "filled" : "empty"} />;
      })}
    </div>
  );
}

function IconButton({ label, onClick, children, active = false }: {
  label: string; onClick: () => void; children: ReactNode; active?: boolean;
}) {
  return <button className={`icon-button ${active ? "active" : ""}`} onClick={onClick} aria-label={label} title={label}>{children}</button>;
}

function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <section className="modal help-modal">
        <IconButton label="Close instructions" onClick={onClose}><X size={19} /></IconButton>
        <p className="eyebrow">FIELD MANUAL</p>
        <h2 id="help-title">Make space. Make it sing.</h2>
        <div className="help-steps">
          <article><span>01</span><div><h3>Place a prism</h3><p>Drag any of the three shapes onto the 7×7 reactor. Press <kbd>R</kbd> or use Rotate to change its orientation.</p></div></article>
          <article><span>02</span><div><h3>Vent both axes</h3><p>Fill a complete row <em>or column</em> to clear it and cool the core. Cross-clears and back-to-back clears score big.</p></div></article>
          <article><span>03</span><div><h3>Beat the pressure</h3><p>Core load rises constantly. Bank one awkward piece per rack, and fire a charged 3×3 Pulse when space gets tight.</p></div></article>
        </div>
        <div className="control-grid">
          <div><MousePointer2 size={18} /><span>Drag / tap to place</span></div>
          <div><Keyboard size={18} /><span><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> select · arrows aim</span></div>
          <div><RotateCw size={18} /><span><kbd>R</kbd> rotate · <kbd>Enter</kbd> place</span></div>
          <div><Zap size={18} /><span><kbd>Q</kbd> pulse · <kbd>H</kbd> hold</span></div>
          <div><Pause size={18} /><span><kbd>P</kbd> / <kbd>Esc</kbd> pause</span></div>
          <div><Volume2 size={18} /><span><kbd>M</kbd> sound on / off</span></div>
        </div>
        <button className="primary-button" onClick={onClose}>GOT IT <ArrowRight size={18} /></button>
      </section>
    </div>
  );
}

function TitleScreen({ snapshot, onHelp }: { snapshot: UISnapshot; onHelp: () => void }) {
  return (
    <div className="title-screen">
      <div className="title-utility">
        <IconButton label="How to play" onClick={onHelp}><HelpCircle size={20} /></IconButton>
        <MuteButton />
      </div>
      <main className="title-card">
        <div className="title-mark"><span /><span /><span /></div>
        <p className="eyebrow">A HIGH-PRESSURE SPATIAL PUZZLER</p>
        <h1><span>PRISM</span><strong>PRESS</strong></h1>
        <p className="title-tagline">Think in shapes.<br />Move with purpose.</p>
        <button className="primary-button start-button" onClick={() => gameActions.start()} data-testid="start-game">
          <Play size={19} fill="currentColor" /> IGNITE THE CORE <kbd>SPACE</kbd>
        </button>
        <button className="text-button" onClick={onHelp}>HOW TO PLAY <ChevronRight size={15} /></button>
        <div className="title-features"><span>ROTATE FREELY</span><i /> <span>CLEAR BOTH AXES</span><i /> <span>CHASE THE FLOW</span></div>
        {snapshot.best > 0 && <div className="title-best"><Trophy size={15} /> PERSONAL BEST <strong>{scoreFormat.format(snapshot.best)}</strong><span>SECTOR {snapshot.bestSector}</span></div>}
      </main>
      <p className="title-footnote">7×7 REACTOR · SIX SECTORS · ENDLESS OVERCLOCK</p>
    </div>
  );
}

function MuteButton() {
  const [muted, setMuted] = useState(() => storage.get<boolean>("prism.muted", false) === true);
  useEffect(() => {
    const update = (event: Event) => setMuted(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("prism:mute", update);
    return () => window.removeEventListener("prism:mute", update);
  }, []);
  return (
    <IconButton label={muted ? "Turn sound on" : "Mute sound"} active={!muted} onClick={() => setMuted(gameActions.toggleMute())}>
      {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
    </IconButton>
  );
}

function Tutorial({ step, charge }: { step: number; charge: number }) {
  if (step >= 4) return null;
  const content = [
    { n: "01", title: "PLACE YOUR FIRST PRISM", body: "Drag a shape onto the grid. R rotates it." },
    { n: "02", title: "MAKE A LINE. VENT THE CORE.", body: "Fill any row or column before load reaches 100%." },
    { n: "03", title: "KEEP THE FLOW ALIVE", body: "Clear on consecutive placements to build a ×5 multiplier." },
    { n: "04", title: charge >= 100 ? "PULSE IS READY" : "CHARGE YOUR ESCAPE PLAN", body: charge >= 100 ? "Press Q, then choose a 3×3 pocket to erase." : "Place shapes and clear lines to charge a 3×3 Pulse." },
  ][step];
  return <div className={`tutorial-card step-${step}`} data-testid="tutorial"><span>{content.n}</span><div><strong>{content.title}</strong><p>{content.body}</p></div></div>;
}

function GameHUD({ snapshot, onHelp }: { snapshot: UISnapshot; onHelp: () => void }) {
  const heat = Math.min(100, snapshot.heat);
  const progress = Math.min(100, snapshot.sectorLines / snapshot.sectorTarget * 100);
  return (
    <>
      <header className="topbar">
        <div className="mini-brand"><span className="brand-gem" /> PRISM <strong>PRESS</strong></div>
        <div className={`heat-panel ${heat >= 75 ? "hot" : ""} ${heat >= 90 ? "critical" : ""}`} data-testid="heat-panel">
          <div className="heat-label"><span><Gauge size={14} /> CORE LOAD</span><strong>{Math.ceil(heat)}<small>%</small></strong></div>
          <div className="heat-track"><span style={{ width: `${heat}%` }} /><i style={{ left: "75%" }} /></div>
          <p>{heat >= 90 ? "VENT NOW" : heat >= 75 ? "RUNNING HOT" : "STABLE"}</p>
        </div>
        <div className="top-actions">
          <IconButton label="How to play" onClick={onHelp}><HelpCircle size={18} /></IconButton>
          <MuteButton />
          <IconButton label="Pause game" onClick={() => gameActions.pause()}><Pause size={19} /></IconButton>
        </div>
      </header>

      <aside className="score-panel">
        <p className="eyebrow">CURRENT RUN</p>
        <div className="score-value" data-testid="score">{scoreFormat.format(snapshot.score)}</div>
        <div className="best-line"><Trophy size={13} /> BEST <strong>{scoreFormat.format(snapshot.best)}</strong></div>
        <div className="sector-block">
          <div><span>{snapshot.endless ? "OVERCLOCK" : `SECTOR ${snapshot.sector}`}</span><strong>{snapshot.sectorLines} / {snapshot.sectorTarget}</strong></div>
          <div className="sector-track"><span style={{ width: `${progress}%` }} /></div>
          <p>{snapshot.endless ? "ENDLESS REACTOR" : "LINES TO NEXT SECTOR"}</p>
        </div>
        <div className={`combo-display ${snapshot.combo > 0 ? "live" : ""}`}>
          <span>FLOW</span><strong>{snapshot.combo > 0 ? `×${snapshot.combo}` : "—"}</strong>
          <small>{snapshot.combo > 0 ? "CLEAR AGAIN" : "BUILD A STREAK"}</small>
        </div>
        <div className="run-mini-stats"><span><strong>{snapshot.lines}</strong> LINES</span><span><strong>{snapshot.placements}</strong> PLACED</span></div>
      </aside>

      <aside className="rack-panel">
        <div className="rack-heading"><div><p className="eyebrow">PRISM RACK</p><span>CHOOSE YOUR FIT</span></div><Package size={18} /></div>
        <div className="piece-rack">
          {snapshot.rack.map((piece, index) => (
            <button
              key={index}
              className={`piece-card ${snapshot.selected === index && piece && !snapshot.pulseMode ? "selected" : ""} ${!piece ? "used" : ""}`}
              disabled={!piece || snapshot.phase !== "playing"}
              onPointerDown={(event) => {
                if (!piece) return;
                event.preventDefault();
                gameActions.beginDrag(index, event.clientX, event.clientY);
              }}
              onClick={(event: MouseEvent) => { if (event.detail === 0) gameActions.select(index); }}
              data-testid={`piece-${index}`}
              aria-label={piece ? `Select ${shapeDef(piece.shape).name}, piece ${index + 1}` : `Piece ${index + 1} placed`}
            >
              <span className="piece-number">0{index + 1}</span>
              {piece ? <MiniPiece piece={piece} /> : <span className="placed-mark"><Check size={22} /> PLACED</span>}
              {piece && <span className="piece-name">{shapeDef(piece.shape).name}</span>}
            </button>
          ))}
        </div>
        <div className="rack-tools">
          <button className="tool-button" onClick={() => gameActions.rotate()} disabled={snapshot.selected < 0} data-testid="rotate-button"><RotateCw size={17} /><span>ROTATE<kbd>R</kbd></span></button>
          <button className={`hold-button ${snapshot.holdUsed ? "locked" : ""}`} onClick={() => gameActions.hold()} disabled={snapshot.holdUsed || snapshot.selected < 0} data-testid="hold-button">
            <span className="hold-preview">{snapshot.hold ? <MiniPiece piece={snapshot.hold} tiny /> : <Package size={19} />}</span>
            <span>HOLD<small>{snapshot.holdUsed ? "USED THIS RACK" : "ONE PER RACK"}</small></span><kbd>H</kbd>
          </button>
        </div>
        <button
          className={`pulse-button ${snapshot.canPulse ? "ready" : ""} ${snapshot.pulseMode ? "armed" : ""}`}
          disabled={!snapshot.canPulse}
          onClick={() => gameActions.pulse()}
          data-testid="pulse-button"
        >
          <div className="pulse-icon"><Zap size={20} fill="currentColor" /></div>
          <div><span>{snapshot.pulseMode ? "PULSE ARMED" : snapshot.canPulse ? "PULSE READY" : "CHARGING PULSE"}</span><small>{snapshot.pulseMode ? "TAP A 3×3 ZONE" : snapshot.canPulse ? "ERASE A 3×3 POCKET" : `${Math.floor(snapshot.charge)} / 100 CHARGE`}</small></div>
          <kbd>Q</kbd>
          <i><span style={{ width: `${snapshot.charge}%` }} /></i>
        </button>
        <p className="rack-tip"><Crosshair size={13} /> Complete rows <em>and</em> columns</p>
      </aside>

      <Tutorial step={snapshot.tutorial} charge={snapshot.charge} />
      {!snapshot.hasMove && snapshot.canPulse && <div className="rescue-callout"><Zap size={17} /> NO FIT — YOUR PULSE CAN MAKE SPACE</div>}
      <div key={snapshot.bannerId} className={`event-banner ${snapshot.banner ? "show" : ""}`} aria-live="polite">{snapshot.banner}</div>
      <div className="desktop-controls"><span>1—3 SELECT</span><span>ARROWS AIM</span><span>ENTER PLACE</span><span>R ROTATE</span></div>
    </>
  );
}

function RunStats({ snapshot }: { snapshot: UISnapshot }) {
  return <div className="result-stats"><div><strong>{scoreFormat.format(snapshot.score)}</strong><span>SCORE</span></div><div><strong>{snapshot.lines}</strong><span>LINES</span></div><div><strong>×{Math.max(1, snapshot.maxCombo)}</strong><span>BEST FLOW</span></div></div>;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snapshot, setSnapshot] = useState<UISnapshot | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    startGame(canvas, setSnapshot);
    return () => stopGame();
  }, []);

  const openHelp = () => {
    if (snapshot?.phase === "playing") gameActions.pause();
    setHelpOpen(true);
  };

  return (
    <div id="game-root" className={`phase-${snapshot?.phase ?? "title"}`}>
      <canvas id="game-canvas" ref={canvasRef} aria-label="PRISM PRESS 3D reactor grid" />
      <div className="scene-vignette" />
      {snapshot && snapshot.phase !== "title" && <GameHUD snapshot={snapshot} onHelp={openHelp} />}
      {snapshot?.phase === "title" && <TitleScreen snapshot={snapshot} onHelp={() => setHelpOpen(true)} />}

      {snapshot?.phase === "paused" && !helpOpen && (
        <div className="modal-backdrop" data-testid="pause-modal">
          <section className="modal compact-modal">
            <p className="eyebrow">REACTOR SUSPENDED</p><h2>Take a breath.</h2><p>The core load is frozen. Your fit will be waiting.</p>
            <button className="primary-button" onClick={() => gameActions.resume()} data-testid="resume-button"><Play size={18} fill="currentColor" /> RESUME <kbd>ESC</kbd></button>
            <button className="secondary-button" onClick={() => gameActions.restart()}><RotateCcw size={17} /> RESTART RUN</button>
            <button className="text-button" onClick={() => gameActions.toTitle()}><HomeIcon size={15} /> BACK TO TITLE</button>
          </section>
        </div>
      )}

      {snapshot?.phase === "sector" && (
        <div className="modal-backdrop sector-backdrop" data-testid="sector-modal">
          <section className="modal compact-modal">
            <div className="result-icon success"><Check size={28} /></div><p className="eyebrow">PRESSURE VENTED</p>
            <h2>Sector {snapshot.sector} clear.</h2><p>Clean work. The next reactor runs hotter and introduces more complex prisms.</p>
            <RunStats snapshot={snapshot} />
            <button className="primary-button" onClick={() => gameActions.continueSector()} data-testid="continue-sector">ENTER SECTOR {snapshot.sector + 1} <ArrowRight size={18} /></button>
          </section>
        </div>
      )}

      {snapshot?.phase === "gameover" && (
        <div className="modal-backdrop danger-backdrop" data-testid="gameover-modal">
          <section className="modal compact-modal">
            <div className="result-icon danger"><Zap size={27} /></div><p className="eyebrow">RUN TERMINATED</p>
            <h2>{snapshot.reason === "CORE OVERLOAD" ? "The core blew its top." : "Nowhere left to fit."}</h2>
            <p>{snapshot.reason === "CORE OVERLOAD" ? "Clear lines more often to vent load. A charged Pulse buys precious time." : "Keep broad pockets open and check all three shapes before committing."}</p>
            {snapshot.newBest && <div className="new-best"><Sparkles size={16} /> NEW PERSONAL BEST</div>}
            <RunStats snapshot={snapshot} />
            <button className="primary-button" onClick={() => gameActions.restart()} data-testid="restart-button"><RotateCcw size={18} /> RUN IT BACK <kbd>SPACE</kbd></button>
            <button className="text-button" onClick={() => gameActions.toTitle()}><HomeIcon size={15} /> BACK TO TITLE</button>
          </section>
        </div>
      )}

      {snapshot?.phase === "victory" && (
        <div className="modal-backdrop victory-backdrop" data-testid="victory-modal">
          <section className="modal compact-modal victory-modal">
            <div className="victory-rays" /><div className="result-icon trophy"><Trophy size={29} /></div>
            <p className="eyebrow">ALL SIX SECTORS STABLE</p><h2>You pressed back.<br />And won.</h2>
            <p>The Prism Core is yours. Overclock mode removes the ceiling — and keeps turning up the heat.</p>
            <RunStats snapshot={snapshot} />
            <button className="primary-button" onClick={() => gameActions.continueEndless()} data-testid="endless-button"><InfinityIcon size={19} /> ENTER ENDLESS OVERCLOCK</button>
            <button className="secondary-button" onClick={() => gameActions.restart()}><RotateCcw size={17} /> NEW RUN</button>
            <button className="text-button" onClick={() => gameActions.toTitle()}><HomeIcon size={15} /> BACK TO TITLE</button>
          </section>
        </div>
      )}

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
      {!snapshot && <div className="loading"><span className="brand-gem" /> WARMING THE REACTOR…</div>}
    </div>
  );
}
